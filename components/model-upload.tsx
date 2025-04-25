"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Info, Upload, LinkIcon, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ModelUploadProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

export function ModelUpload({ addNotification }: ModelUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [organizationName, setOrganizationName] = useState("")
  const [modelName, setModelName] = useState("")
  const [tags, setTags] = useState<string[]>(["transformer", "nlp", "bert"])
  const [tagInput, setTagInput] = useState("")
  const uploadBtnRef = useRef<HTMLButtonElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    addNotification("info", `${selectedFiles.length} file(s) selected`)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (uploadBtnRef.current) {
      const rect = uploadBtnRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addNotification("success", "Model information saved successfully")
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white font-heading">Model Upload</h2>

      <Card className="bg-blue-950/40 border-blue-900 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-heading">Deploy Hugging Face Model</CardTitle>
          <CardDescription>Deploy your models or use existing models from Hugging Face</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="mb-6">
            <TabsList className="grid grid-cols-2 bg-blue-900/30">
              <TabsTrigger value="upload" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white">
                <Upload className="mr-2 h-4 w-4" />
                Upload Model
              </TabsTrigger>
              <TabsTrigger value="url" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white">
                <LinkIcon className="mr-2 h-4 w-4" />
                Use Model URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="model-name" className="block text-sm font-medium text-blue-200 mb-1">
                      Model Name
                    </label>
                    <Input
                      id="model-name"
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
                      placeholder="Describe your model, its architecture, and use cases..."
                      className="bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70 min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="model-type" className="block text-sm font-medium text-blue-200 mb-1">
                        Model Type
                      </label>
                      <Select>
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
                      <Select>
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
                      {tags.map((tag, index) => (
                        <Badge key={index} className="bg-blue-700 hover:bg-blue-600 flex items-center gap-1">
                          {tag}
                          <X
                            size={14}
                            className="cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-300 mb-2">
                      <Info size={14} />
                      <p>To add custom tags, type your tag in the box below and press Enter.</p>
                    </div>
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Add a new tag"
                      className="bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-blue-200 mb-3">Upload Model Files</label>
                    <FileUploader onFilesSelected={handleFilesSelected} />

                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-blue-300">Selected files:</p>
                        {files.map((file, index) => (
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
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white relative overflow-hidden"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <span className="relative z-10">
                      Upload Model <ArrowRight className="ml-2 h-4 w-4 inline" />
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
              <form className="space-y-4" onSubmit={handleSubmit}>
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
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          placeholder="organization"
                          className="rounded-none bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70 border-r-0"
                        />
                        <div className="bg-blue-900/50 text-blue-300 px-2 py-2 border border-blue-800 border-r-0 border-l-0">
                          /
                        </div>
                        <Input
                          id="model-name"
                          value={modelName}
                          onChange={(e) => setModelName(e.target.value)}
                          placeholder="model-name"
                          className="rounded-none rounded-r-md bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70"
                        />
                      </div>
                    </div>
                    {organizationName && modelName && (
                      <p className="text-xs text-blue-300 mt-1">
                        Full URL: https://huggingface.co/{organizationName}/{modelName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="model-description" className="block text-sm font-medium text-blue-200 mb-1">
                      Description
                    </label>
                    <Textarea
                      id="model-description"
                      placeholder="Why are you using this model? What will you use it for?"
                      className="bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} className="bg-blue-700 hover:bg-blue-600 flex items-center gap-1">
                          {tag}
                          <X
                            size={14}
                            className="cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-300 mb-2">
                      <Info size={14} />
                      <p>To add custom tags, type your tag in the box below and press Enter.</p>
                    </div>
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Add a new tag"
                      className="bg-blue-950/70 border-blue-800 text-white placeholder:text-blue-400/70"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    ref={uploadBtnRef}
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white relative overflow-hidden"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <span className="relative z-10">
                      Use Model <ArrowRight className="ml-2 h-4 w-4 inline" />
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
