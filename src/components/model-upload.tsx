"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Upload, LinkIcon, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadModelAction } from "@/app/creator-dashboard/model-actions"
import { FileUploader } from "@/components/file-uploader"

interface ModelUploadProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

export function ModelUpload({ addNotification }: ModelUploadProps) {
  const [uploadFields, setUploadFields] = useState({
    modelName: "",
    description: "",
    modelType: "",
    license: "",
    tags: ["transformer", "nlp", "bert"],
    tagInput: "",
    files: [] as File[],
  })
  const [urlFields, setUrlFields] = useState({
    organizationName: "",
    modelName: "", // Hugging Face model name
    userModelName: "", // User's own model name
    description: "",
    modelType: "", // Not required for URL
    license: "",
    tags: ["transformer", "nlp", "bert"],
    tagInput: "",
  })
  const uploadBtnRef = useRef<HTMLButtonElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [loadingUrl, setLoadingUrl] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleUploadChange = (field: string, value: string) => {
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

  const handleUploadFilesSelected = (files: File[]) => {
    setUploadFields((prev) => ({ ...prev, files }))
  }

  const handleUrlChange = (field: string, value: string) => {
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

  function validateUploadFields() {
    const { modelName, description, modelType, license } = uploadFields
    return modelName && description && modelType && license
  }
  function validateUrlFields() {
    const { organizationName, modelName, userModelName, description, license } = urlFields
    return organizationName && modelName && userModelName && description && license
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
      formData.set("name", urlFields.userModelName) // Ensure 'name' is set for backend compatibility
      formData.set("urlModelType", urlFields.modelType)
      formData.set("modelType", urlFields.modelType) // Ensure 'modelType' is set for backend compatibility
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
    <div className="space-y-4">
      <Card className="bg-blue-950/40 border-blue-900 backdrop-blur-sm rounded-xl shadow-lg w-[75%] max-w-5xl mx-auto">
        <CardContent className="p-6">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-900/30 rounded-lg overflow-hidden">
              <TabsTrigger value="upload" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white transition-colors duration-200">
                <Upload className="mr-2 h-4 w-4" />
                Upload Model
              </TabsTrigger>
              <TabsTrigger value="url" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white transition-colors duration-200">
                <LinkIcon className="mr-2 h-4 w-4" />
                Use Model URL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <form className="space-y-5" action={handleUploadAction}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col items-start">
                    <label htmlFor="model-name" className="text-blue-200 text-xs mb-1">Model Name</label>
                    <Input
                      id="model-name"
                      value={uploadFields.modelName}
                      onChange={(e) => handleUploadChange("modelName", e.target.value)}
                      placeholder="Model Name"
                      className="w-full max-w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label htmlFor="model-type" className="text-blue-200 text-xs mb-1">Model Type</label>
                    <Select value={uploadFields.modelType} onValueChange={(v) => handleUploadChange("modelType", v)}>
                      <SelectTrigger className="w-full max-w-full">
                        <SelectValue placeholder="Model Type" />
                      </SelectTrigger>
                      <SelectContent>
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
                </div>
                <div className="flex flex-col items-start">
                  <label htmlFor="model-description" className="text-blue-200 text-xs mb-1">Description</label>
                  <Textarea
                    id="model-description"
                    value={uploadFields.description}
                    onChange={(e) => handleUploadChange("description", e.target.value)}
                    placeholder="Model description..."
                    className="w-full max-w-full"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col items-start">
                    <label htmlFor="license" className="text-blue-200 text-xs mb-1">License</label>
                    <Select value={uploadFields.license} onValueChange={(v) => handleUploadChange("license", v)}>
                      <SelectTrigger className="w-full max-w-full">
                        <SelectValue placeholder="License" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <div className="flex flex-col items-start">
                    <label className="text-blue-200 text-xs mb-1">Tags</label>
                    <Input
                      value={uploadFields.tagInput}
                      onChange={(e) => handleUploadChange("tagInput", e.target.value)}
                      onKeyDown={handleUploadTagInputKeyDown}
                      placeholder="Add tags (press Enter)"
                      className="w-full max-w-full"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {uploadFields.tags.map((tag, index) => (
                        <Badge key={index} className="bg-blue-700 hover:bg-blue-600 flex items-center gap-1 text-xs">
                          {tag}
                          <X
                            size={12}
                            className="cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => removeUploadTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-1">
                  <div className="flex flex-col items-start mb-2">
                    <p className="text-blue-200 text-xs mb-1">Model Files (Optional)</p>
                    <p className="text-xs text-blue-300">Upload your model files or register without files and add them later.</p>
                  </div>
                  <FileUploader onFilesSelected={handleUploadFilesSelected} />
                  {uploadFields.files.length > 0 && (
                    <div className="mt-2">
                      {uploadFields.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-900/30 p-1.5 rounded-md text-xs">
                          <span className="text-white truncate max-w-[80%]">{file.name}</span>
                          <span className="text-blue-300">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <Button
                    ref={uploadBtnRef}
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white relative overflow-hidden rounded-lg shadow-md transition-transform duration-150 active:scale-95"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    disabled={loadingUpload}
                  >
                    <span className="relative z-10">
                      {loadingUpload ? "Uploading..." : "Upload Model"} <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </span>
                    <span
                      className="glow-effect absolute w-[100px] h-[100px] rounded-full pointer-events-none"
                      style={{
                        background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                        left: `${mousePosition.x}px`,
                        top: `${mousePosition.y}px`,
                      }}
                    />
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="url">
              <form className="space-y-5" action={async (formData) => {
                if (!formData.get("name")) {
                  formData.set("name", formData.get("userModelName") || "")
                }
                await handleUrlAction(formData)
              }}>
                <input type="hidden" name="name" value={urlFields.userModelName} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col items-start">
                    <label htmlFor="org-name" className="text-blue-200 text-xs mb-1">Organization Name</label>
                    <Input
                      id="org-name"
                      value={urlFields.organizationName}
                      onChange={(e) => handleUrlChange("organizationName", e.target.value)}
                      placeholder="Organization Name"
                      className="w-full max-w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label htmlFor="url-model-name" className="text-blue-200 text-xs mb-1">Hugging Face Model Name</label>
                    <Input
                      id="url-model-name"
                      value={urlFields.modelName}
                      onChange={(e) => handleUrlChange("modelName", e.target.value)}
                      placeholder="Model Name from Hugging Face"
                      className="w-full max-w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label htmlFor="user-model-name" className="text-blue-200 text-xs mb-1">Your Model Name</label>
                    <Input
                      id="user-model-name"
                      value={urlFields.userModelName}
                      onChange={(e) => handleUrlChange("userModelName", e.target.value)}
                      placeholder="Your Model Name"
                      className="w-full max-w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <label htmlFor="url-model-description" className="text-blue-200 text-xs mb-1">Description</label>
                  <Textarea
                    id="url-model-description"
                    value={urlFields.description}
                    onChange={(e) => handleUrlChange("description", e.target.value)}
                    placeholder="Model description..."
                    className="w-full max-w-full"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col items-start">
                    <label htmlFor="url-model-type" className="text-blue-200 text-xs mb-1">Model Type</label>
                    <Select value={urlFields.modelType} onValueChange={(v) => handleUrlChange("modelType", v)}>
                      <SelectTrigger className="w-full max-w-full">
                        <SelectValue placeholder="Model Type" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <div className="flex flex-col items-start">
                    <label htmlFor="url-license" className="text-blue-200 text-xs mb-1">License</label>
                    <Select value={urlFields.license} onValueChange={(v) => handleUrlChange("license", v)}>
                      <SelectTrigger className="w-full max-w-full">
                        <SelectValue placeholder="License" />
                      </SelectTrigger>
                      <SelectContent>
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
                <div className="flex flex-col items-start">
                  <label className="text-blue-200 text-xs mb-1">Tags</label>
                  <Input
                    value={urlFields.tagInput}
                    onChange={(e) => handleUrlChange("tagInput", e.target.value)}
                    onKeyDown={handleUrlTagInputKeyDown}
                    placeholder="Add tags (press Enter)"
                    className="w-full max-w-full"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {urlFields.tags.map((tag, index) => (
                      <Badge key={index} className="bg-blue-700 hover:bg-blue-600 flex items-center gap-1 text-xs">
                        {tag}
                        <X
                          size={12}
                          className="cursor-pointer opacity-70 hover:opacity-100"
                          onClick={() => removeUrlTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white relative overflow-hidden rounded-lg shadow-md transition-transform duration-150 active:scale-95"
                    disabled={loadingUrl}
                  >
                    <span className="relative z-10">
                      {loadingUrl ? "Registering..." : "Register Model URL"} <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </span>
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