"use client"

import type React from "react"
import { useState, useRef, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Info, Upload, LinkIcon, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadModelAction } from "../app/creator-dashboard/model-actions"

interface ModelUploadProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

export function ModelUpload({ addNotification }: ModelUploadProps) {
  // Upload tab state
  const [uploadFields, setUploadFields] = useState({
    modelName: "",
    description: "",
    modelType: "",
    license: "",
    tags: ["transformer", "nlp", "bert"],
    tagInput: "",
    files: [] as File[],
  })
  // URL tab state
  const [urlFields, setUrlFields] = useState({
    organizationName: "",
    modelName: "",
    description: "",
    modelType: "",
    license: "",
    tags: ["transformer", "nlp", "bert"],
    tagInput: "",
  })
  const uploadBtnRef = useRef<HTMLButtonElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Mouse move handler for glow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  // Upload tab handlers
  const handleUploadChange = (field: string, value: any) => {
    setUploadFields((prev) => ({ ...prev, [field]: value }))
  }
  const handleUploadTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && uploadFields.tagInput.trim()) {
      e.preventDefault()
      if (!uploadFields.tags.includes(uploadFields.tagInput.trim())) {
        setUploadFields((prev) => ({ ...prev, tags: [...prev.tags, prev.tagInput.trim()], tagInput: "" }))
      } else {
        setUploadFields((prev) => ({ ...prev, tagInput: "" }))
      }
    }
  }
  const removeUploadTag = (tagToRemove: string) => {
    setUploadFields((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }))
  }
  const handleUploadFilesSelected = (selectedFiles: File[]) => {
    setUploadFields((prev) => ({ ...prev, files: selectedFiles }))
    addNotification("info", `${selectedFiles.length} file(s) selected`)
  }

  // URL tab handlers
  const handleUrlChange = (field: string, value: any) => {
    setUrlFields((prev) => ({ ...prev, [field]: value }))
  }
  const handleUrlTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && urlFields.tagInput.trim()) {
      e.preventDefault()
      if (!urlFields.tags.includes(urlFields.tagInput.trim())) {
        setUrlFields((prev) => ({ ...prev, tags: [...prev.tags, prev.tagInput.trim()], tagInput: "" }))
      } else {
        setUrlFields((prev) => ({ ...prev, tagInput: "" }))
      }
    }
  }
  const removeUrlTag = (tagToRemove: string) => {
    setUrlFields((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }))
  }

  // Client-side validation helpers
  function validateUploadFields() {
    const { modelName, description, modelType, license } = uploadFields
    return modelName && description && modelType && license
  }
  function validateUrlFields() {
    const { organizationName, modelName, description, modelType, license } = urlFields
    return organizationName && modelName && description && modelType && license
  }

  async function handleUploadAction(formData: FormData) {
    if (!validateUploadFields()) {
      addNotification("error", "Please fill all required fields.")
      return
    }
    setLoadingUpload(true)
    try {
      formData.set("name", uploadFields.modelName)
      formData.set("description", uploadFields.description)
      formData.set("modelType", uploadFields.modelType)
      formData.set("license", uploadFields.license)
      formData.set("tags", uploadFields.tags.join(","))
      if (uploadFields.files.length > 0) {
        formData.set("file", uploadFields.files[0])
      }
      formData.set("sourceType", "UPLOAD")
      const result = await uploadModelAction(formData)
      if (result.success) {
        addNotification("success", "Model uploaded successfully!")
      } else {
        addNotification("error", result.error || "Failed to upload model.")
      }
    } catch {
      addNotification("error", "Network error.")
    } finally {
      setLoadingUpload(false)
    }
  }

  async function handleUrlAction(formData: FormData) {
    if (!validateUrlFields()) {
      addNotification("error", "Please fill all required fields.")
      return
    }
    setLoadingUrl(true)
    try {
      const fullUrl = urlFields.organizationName && urlFields.modelName
        ? `https://huggingface.co/${urlFields.organizationName}/${urlFields.modelName}`
        : ""
      formData.set("url", fullUrl)
      formData.set("description", urlFields.description)
      formData.set("modelName", urlFields.modelName)
      formData.set("urlModelType", urlFields.modelType)
      formData.set("license", urlFields.license)
      formData.set("tags", urlFields.tags.join(","))
      formData.set("sourceType", "URL")
      const result = await uploadModelAction(formData)
      if (result.success) {
        addNotification("success", "Model URL registered successfully!")
      } else {
        addNotification("error", result.error || "Failed to register model URL.")
      }
    } catch {
      addNotification("error", "Network error.")
    } finally {
      setLoadingUrl(false)
    }
  }

  useEffect(() => {
    if (uploadBtnRef.current && isHovering) {
      const btnElement = uploadBtnRef.current
      const glowElement = btnElement.querySelector(".glow-effect") as HTMLElement
      if (glowElement) {
        glowElement.style.left = `${mousePosition.x}px`
        glowElement.style.top = `${mousePosition.y}px`
      }
    }
  }, [mousePosition, isHovering])

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white font-heading text-center">Model Upload</h2>
      <Card className="bg-blue-950/40 border-blue-900 backdrop-blur-sm rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-white font-heading">Deploy Hugging Face Model</CardTitle>
          <CardDescription>Deploy your models or use existing models from Hugging Face</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="mb-6">
            <TabsList className="grid grid-cols-2 bg-blue-900/30 rounded-lg overflow-hidden">
              <TabsTrigger value="upload" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white transition-colors duration-200">
                <Upload className="mr-2 h-4 w-4" />
                Upload Model
              </TabsTrigger>
              <TabsTrigger value="url" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white transition-colors duration-200">
                <LinkIcon className="mr-2 h-4 w-4" />
                Use Model URL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-6">
              <form className="space-y-4" action={handleUploadAction}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="model-name" className="block text-sm font-medium text-blue-200 mb-1">
                      Model Name
                    </label>
                    <Input
                      id="model-name"
                      value={uploadFields.modelName}
                      onChange={(e) => handleUploadChange("modelName", e.target.value)}
                      placeholder="e.g., bert-base-uncased-finetuned-emotion"
                      className="bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70"
                    />
                  </div>
                  <div>
                    <label htmlFor="model-description" className="block text-sm font-medium text-blue-200 mb-1">
                      Description
                    </label>
                    <Textarea
                      id="model-description"
                      value={uploadFields.description}
                      onChange={(e) => handleUploadChange("description", e.target.value)}
                      placeholder="Describe your model, its architecture, and use cases..."
                      className="bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70 min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="model-type" className="block text-sm font-medium text-blue-200 mb-1">
                        Model Type
                      </label>
                      <Select value={uploadFields.modelType} onValueChange={(v) => handleUploadChange("modelType", v)}>
                        <SelectTrigger className="bg-blue-950/70 border-blue-800 text-white">
                          <SelectValue placeholder="Select model type" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-950 border-blue-800 text-white">
                          <SelectItem value="text-classification">Text Classification</SelectItem>
                          <SelectItem value="token-classification">Token Classification</SelectItem>
                          <SelectItem value="question-answering">Question Answering</SelectItem>
                          <SelectItem value="translation">Translation</SelectItem>
                          <SelectItem value="summarization">Summarization</SelectItem>
                          <SelectItem value="text-generation">Text Generation</SelectItem>
                          <SelectItem value="image-classification">Image Classification</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="license" className="block text-sm font-medium text-blue-200 mb-1">
                        License
                      </label>
                      <Select value={uploadFields.license} onValueChange={(v) => handleUploadChange("license", v)}>
                        <SelectTrigger className="bg-blue-950/70 border-blue-800 text-white">
                          <SelectValue placeholder="Select license" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-950 border-blue-800 text-white">
                          <SelectItem value="mit">MIT</SelectItem>
                          <SelectItem value="apache-2.0">Apache 2.0</SelectItem>
                          <SelectItem value="gpl-3.0">GPL 3.0</SelectItem>
                          <SelectItem value="cc-by-4.0">CC BY 4.0</SelectItem>
                          <SelectItem value="cc-by-sa-4.0">CC BY-SA 4.0</SelectItem>
                          <SelectItem value="cc-by-nc-4.0">CC BY-NC 4.0</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {uploadFields.tags.map((tag, index) => (
                        <Badge key={index} className="bg-blue-700 hover:bg-blue-600 flex items-center gap-1">
                          {tag}
                          <X
                            size={14}
                            className="cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => removeUploadTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-300 mb-2">
                      <Info size={14} />
                      <p>To add custom tags, type your tag in the box below and press Enter.</p>
                    </div>
                    <Input
                      value={uploadFields.tagInput}
                      onChange={(e) => handleUploadChange("tagInput", e.target.value)}
                      onKeyDown={handleUploadTagInputKeyDown}
                      placeholder="Add a new tag"
                      className="bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70"
                    />
                  </div>
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-blue-200 mb-3">Upload Model Files</label>
                    <FileUploader onFilesSelected={handleUploadFilesSelected} />
                    {uploadFields.files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-blue-300">Selected files:</p>
                        {uploadFields.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-900/30 p-2 rounded-md">
                            <span className="text-sm text-white truncate max-w-[80%]">{file.name}</span>
                            <span className="text-xs text-blue-300">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    ref={uploadBtnRef}
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white relative overflow-hidden rounded-lg shadow-md transition-transform duration-150 active:scale-95"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    disabled={loadingUpload || isPending}
                  >
                    <span className="relative z-10">
                      {loadingUpload ? "Uploading..." : "Upload Model"} <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </span>
                    <span
                      className="glow-effect absolute w-[100px] h-[100px] rounded-full pointer-events-none"
                      style={{
                        background: "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)",
                        transform: "translate(-50%, -50%)",
                        left: mousePosition.x,
                        top: mousePosition.y,
                        opacity: isHovering ? 1 : 0,
                        transition: "opacity 0.2s ease",
                      }}
                    />
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="url" className="mt-6">
              <form className="space-y-4" action={handleUrlAction}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="huggingface-url" className="block text-sm font-medium text-blue-200 mb-1">
                      Hugging Face Model URL
                    </label>
                    <div className="flex items-center">
                      <div className="bg-blue-900/50 text-blue-300 px-3 py-2 rounded-l-md border border-blue-800 border-r-0">
                        https://huggingface.co/
                      </div>
                      <div className="flex-1 flex">
                        <Input
                          id="organization-name"
                          value={urlFields.organizationName}
                          onChange={(e) => handleUrlChange("organizationName", e.target.value)}
                          placeholder="organization"
                          className="rounded-none bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70 border-r-0"
                        />
                        <div className="bg-blue-900/50 text-blue-300 px-2 py-2 border border-blue-800 border-r-0 border-l-0">
                          /
                        </div>
                        <Input
                          id="model-name"
                          value={urlFields.modelName}
                          onChange={(e) => handleUrlChange("modelName", e.target.value)}
                          placeholder="model-name"
                          className="rounded-none rounded-r-md bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70"
                        />
                      </div>
                    </div>
                    {urlFields.organizationName && urlFields.modelName && (
                      <p className="text-xs text-blue-300 mt-1">
                        Full URL: https://huggingface.co/{urlFields.organizationName}/{urlFields.modelName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="url-model-type" className="block text-sm font-medium text-blue-200 mb-1">
                      Model Type
                    </label>
                    <Select value={urlFields.modelType} onValueChange={(v) => handleUrlChange("modelType", v)}>
                      <SelectTrigger className="bg-blue-950/70 border-blue-800 text-white">
                        <SelectValue placeholder="Select model type" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-950 border-blue-800 text-white">
                        <SelectItem value="text-classification">Text Classification</SelectItem>
                        <SelectItem value="token-classification">Token Classification</SelectItem>
                        <SelectItem value="question-answering">Question Answering</SelectItem>
                        <SelectItem value="translation">Translation</SelectItem>
                        <SelectItem value="summarization">Summarization</SelectItem>
                        <SelectItem value="text-generation">Text Generation</SelectItem>
                        <SelectItem value="image-classification">Image Classification</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="url-license" className="block text-sm font-medium text-blue-200 mb-1">
                      License
                    </label>
                    <Select value={urlFields.license} onValueChange={(v) => handleUrlChange("license", v)}>
                      <SelectTrigger className="bg-blue-950/70 border-blue-800 text-white">
                        <SelectValue placeholder="Select license" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-950 border-blue-800 text-white">
                        <SelectItem value="mit">MIT</SelectItem>
                        <SelectItem value="apache-2.0">Apache 2.0</SelectItem>
                        <SelectItem value="gpl-3.0">GPL 3.0</SelectItem>
                        <SelectItem value="cc-by-4.0">CC BY 4.0</SelectItem>
                        <SelectItem value="cc-by-sa-4.0">CC BY-SA 4.0</SelectItem>
                        <SelectItem value="cc-by-nc-4.0">CC BY-NC 4.0</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="model-description" className="block text-sm font-medium text-blue-200 mb-1">
                      Description
                    </label>
                    <Textarea
                      id="model-description"
                      value={urlFields.description}
                      onChange={(e) => handleUrlChange("description", e.target.value)}
                      placeholder="Why are you using this model? What will you use it for?"
                      className="bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70 min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {urlFields.tags.map((tag, index) => (
                        <Badge key={index} className="bg-blue-700 hover:bg-blue-600 flex items-center gap-1">
                          {tag}
                          <X
                            size={14}
                            className="cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => removeUrlTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-300 mb-2">
                      <Info size={14} />
                      <p>To add custom tags, type your tag in the box below and press Enter.</p>
                    </div>
                    <Input
                      value={urlFields.tagInput}
                      onChange={(e) => handleUrlChange("tagInput", e.target.value)}
                      onKeyDown={handleUrlTagInputKeyDown}
                      placeholder="Add a new tag"
                      className="bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    ref={uploadBtnRef}
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white relative overflow-hidden rounded-lg shadow-md transition-transform duration-150 active:scale-95"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    disabled={loadingUrl || isPending}
                  >
                    <span className="relative z-10">
                      {loadingUrl ? "Registering..." : "Use Model"} <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </span>
                    <span
                      className="glow-effect absolute w-[100px] h-[100px] rounded-full pointer-events-none"
                      style={{
                        background: "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)",
                        transform: "translate(-50%, -50%)",
                        left: mousePosition.x,
                        top: mousePosition.y,
                        opacity: isHovering ? 1 : 0,
                        transition: "opacity 0.2s ease",
                      }}
                    />
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}