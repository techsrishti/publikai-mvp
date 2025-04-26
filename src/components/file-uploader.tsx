"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText } from "lucide-react"

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
}

export function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      onFilesSelected(filesArray)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      onFilesSelected(filesArray)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-400 bg-blue-900/30"
          : "border-blue-800 bg-blue-950/30 hover:bg-blue-900/20 hover:border-blue-700"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileInputChange} multiple className="hidden" />

      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="p-3 bg-blue-800/30 rounded-full">
          <Upload className="h-6 w-6 text-blue-300" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">Drag and drop your model files here</p>
          <p className="text-xs text-blue-400">Or click to browse your files</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-blue-300">
          <FileText className="h-3 w-3" />
          <span>Supports .bin, .pt, .onnx, .safetensors, and other model files</span>
        </div>
      </div>
    </div>
  )
}