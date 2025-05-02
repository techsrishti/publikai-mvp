"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Cloud, Server } from "lucide-react"

interface ModelDeploymentProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

export function ModelDeployment({ addNotification }: ModelDeploymentProps) {
  const handleDeploy = () => {
    addNotification("info", "Starting deployment process...")
    // Deployment logic here
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Deployment Configuration */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Deployment Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Model</label>
              <Select>
                <SelectTrigger className="w-full bg-gray-900/50 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Choose a model" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="bert">BERT-base-uncased</SelectItem>
                  <SelectItem value="resnet">ResNet50</SelectItem>
                  <SelectItem value="gpt2">GPT-2-small</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Deployment Environment</label>
              <Select>
                <SelectTrigger className="w-full bg-gray-900/50 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="dev">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="prod">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Instance Type</label>
              <Select>
                <SelectTrigger className="w-full bg-gray-900/50 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Select instance type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="small">Small (2 vCPU, 8GB RAM)</SelectItem>
                  <SelectItem value="medium">Medium (4 vCPU, 16GB RAM)</SelectItem>
                  <SelectItem value="large">Large (8 vCPU, 32GB RAM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Number of Replicas</label>
              <Input 
                type="number" 
                min="1" 
                defaultValue="1"
                className="bg-gray-900/50 border-gray-700 text-gray-200"
              />
            </div>
          </div>
        </Card>

        {/* Deployment Status */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Active Deployments</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800/60">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-gray-200">BERT-base-uncased</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Environment</p>
                  <p className="text-gray-200">Production</p>
                </div>
                <div>
                  <p className="text-gray-400">Replicas</p>
                  <p className="text-gray-200">3/3</p>
                </div>
                <div>
                  <p className="text-gray-400">Instance Type</p>
                  <p className="text-gray-200">Medium</p>
                </div>
                <div>
                  <p className="text-gray-400">Uptime</p>
                  <p className="text-gray-200">5d 12h</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800/60">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-gray-200">ResNet50</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Environment</p>
                  <p className="text-gray-200">Staging</p>
                </div>
                <div>
                  <p className="text-gray-400">Replicas</p>
                  <p className="text-gray-200">2/2</p>
                </div>
                <div>
                  <p className="text-gray-400">Instance Type</p>
                  <p className="text-gray-200">Small</p>
                </div>
                <div>
                  <p className="text-gray-400">Uptime</p>
                  <p className="text-gray-200">2d 8h</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Deploy Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleDeploy}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8"
        >
          <Cloud className="mr-2 h-4 w-4" />
          Deploy Model
        </Button>
      </div>
    </div>
  )
}