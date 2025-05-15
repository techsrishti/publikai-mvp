"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState("url")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const modelName = formData.get('modelName') as string
      
      if (activeTab === 'url') {
        const modelUrl = formData.get('modelUrl') as string
        // Handle URL model submission
        const response = await fetch('/api/model', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: modelUrl,
            userModelName: modelName,
            modelType: 'url'
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to register model URL')
        }
      } else {
        const modelFile = formData.get('modelFile') as File
        // Handle file upload
        const fileData = new FormData()
        fileData.append('file', modelFile)
        fileData.append('modelName', modelName)

        const response = await fetch('/api/model/upload', {
          method: 'POST',
          body: fileData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload model')
        }
      }

      router.push('/creator-dashboard')
    } catch (error) {
      console.error('Error submitting form:', error)
      // Handle error (you might want to show a notification here)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">
          Register New Model
        </h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="url" className="data-[state=active]:bg-gray-800">
              Register Model URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-gray-800">
              Upload Model
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Register Model URL</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter the URL of your model to register it with the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelName" className="text-gray-200">Model Name</Label>
                    <Input
                      id="modelName"
                      name="modelName"
                      placeholder="Enter a unique name for your model"
                      className="bg-gray-800/50 border-gray-700 text-gray-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelUrl" className="text-gray-200">Model URL</Label>
                    <Input
                      id="modelUrl"
                      name="modelUrl"
                      placeholder="Enter the URL of your model"
                      className="bg-gray-800/50 border-gray-700 text-gray-200"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering Model...
                      </>
                    ) : (
                      'Register Model URL'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upload">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Upload Model</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload your model file to register it with the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelName" className="text-gray-200">Model Name</Label>
                    <Input
                      id="modelName"
                      name="modelName"
                      placeholder="Enter a unique name for your model"
                      className="bg-gray-800/50 border-gray-700 text-gray-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelFile" className="text-gray-200">Model File</Label>
                    <Input
                      id="modelFile"
                      name="modelFile"
                      type="file"
                      className="bg-gray-800/50 border-gray-700 text-gray-200"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading Model...
                      </>
                    ) : (
                      'Upload Model'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 