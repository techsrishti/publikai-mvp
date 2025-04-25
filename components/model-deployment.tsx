"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Play, Server } from "lucide-react"

interface ModelDeploymentProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

export function ModelDeployment({ addNotification }: ModelDeploymentProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [selectedModel, setSelectedModel] = useState("")

  const handleDeploy = async () => {
    if (!selectedModel) {
      addNotification("error", "Please select a model to deploy")
      return
    }

    setIsDeploying(true)

    try {
      // In a real app, you would make an API call to deploy the model
      const response = await fetch("http://localhost:3000/deploy-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: selectedModel,
          // Add other parameters as needed
        }),
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (Math.random() > 0.2) {
        // 80% success rate for demo
        addNotification("success", `Model ${selectedModel} deployed successfully`)
      } else {
        throw new Error("Deployment failed")
      }
    } catch (error) {
      addNotification("error", `Deployment failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsDeploying(false)
    }
  }

  // Mock data for demonstration
  const availableModels = [
    { id: "bert-base", name: "BERT-base-uncased" },
    { id: "resnet50", name: "ResNet50" },
    { id: "gpt2-small", name: "GPT-2-small" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Model Deployment</h2>

      <Card className="card-bg border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Deploy a Model</CardTitle>
          <CardDescription>Configure and deploy your model to make it available for inference</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="model-select" className="block text-sm font-medium text-slate-300 mb-1">
              Select Model
            </label>
            <Select onValueChange={setSelectedModel} value={selectedModel}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select a model to deploy" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="instance-type" className="block text-sm font-medium text-slate-300 mb-1">
              Instance Type
            </label>
            <Select defaultValue="cpu-small">
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select instance type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                <SelectItem value="cpu-small">CPU - Small (1 vCPU, 2GB RAM)</SelectItem>
                <SelectItem value="cpu-medium">CPU - Medium (2 vCPU, 4GB RAM)</SelectItem>
                <SelectItem value="cpu-large">CPU - Large (4 vCPU, 8GB RAM)</SelectItem>
                <SelectItem value="gpu-small">GPU - Small (1 GPU, 8GB VRAM)</SelectItem>
                <SelectItem value="gpu-medium">GPU - Medium (1 GPU, 16GB VRAM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="scaling" className="block text-sm font-medium text-slate-300 mb-1">
              Scaling Configuration
            </label>
            <Select defaultValue="auto">
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select scaling configuration" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                <SelectItem value="fixed">Fixed (1 instance)</SelectItem>
                <SelectItem value="auto">Auto-scaling (1-3 instances)</SelectItem>
                <SelectItem value="custom">Custom configuration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Advanced Options</label>
            <div className="flex items-center space-x-2">
              <Checkbox id="cache" />
              <Label htmlFor="cache" className="text-slate-300">
                Enable response caching
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="monitoring" defaultChecked />
              <Label htmlFor="monitoring" className="text-slate-300">
                Enable performance monitoring
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="logging" defaultChecked />
              <Label htmlFor="logging" className="text-slate-300">
                Enable request logging
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-slate-800 pt-6">
          <Button
            onClick={handleDeploy}
            disabled={isDeploying || !selectedModel}
            className="bg-blue-600 hover:bg-blue-700 ml-auto"
          >
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Deploy Model
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="card-bg border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Deployment Status</CardTitle>
          <CardDescription>Current status of your model deployments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center">
                <Server className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <div className="font-medium text-white">BERT-base-uncased</div>
                  <div className="text-sm text-slate-400">CPU - Medium (2 vCPU, 4GB RAM)</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <div className="font-medium text-white">Active</div>
                  <div className="text-sm text-slate-400">2 instances</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Manage
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center">
                <Server className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <div className="font-medium text-white">ResNet50</div>
                  <div className="text-sm text-slate-400">GPU - Small (1 GPU, 8GB VRAM)</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <div className="font-medium text-white">Active</div>
                  <div className="text-sm text-slate-400">1 instance</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Manage
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
