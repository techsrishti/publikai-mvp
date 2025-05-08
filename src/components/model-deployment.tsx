"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { startDeployment, getActiveDeployments } from "@/app/creator-dashboard/model-actions"
import { Upload, Server, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getAllModels } from "@/app/creator-dashboard/model-actions"
import { DeploymentStatus } from "@prisma/client"

interface ModelDeploymentProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

interface Model {
  id: string
  name: string
  modelType: string
}

interface Deployment {
  id: string
  status: DeploymentStatus
  createdAt: Date
  instanceIP: string | null
  instancePort: number | null
  model: {
    name: string
  }
}

export function ModelDeployment({ addNotification }: ModelDeploymentProps) {
  const [models, setModels] = useState<Model[]>([])
  const [selectedModelName, setSelectedModelName] = useState<string>("")
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isLoadingDeployments, setIsLoadingDeployments] = useState(false)
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDeployments = async () => {
    setIsLoadingDeployments(true)
    try {
      const response = await getActiveDeployments()
      if (response.success && response.deployments) {
        setDeployments(response.deployments as unknown as Deployment[])
      } else {
        addNotification("error", "Failed to fetch deployments")
      }
    } catch (error) {
      addNotification("error", "Failed to fetch deployments")
    }
    setIsLoadingDeployments(false)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDeployments()
    setIsRefreshing(false)
  }

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true)
      try {
        const response = await getAllModels()
        if (response.success && response.models) {
          setModels(response.models)
        } else {
          addNotification("error", "Failed to fetch models")
        }
      } catch (error) {
        addNotification("error", "Failed to fetch models")
      }
      setIsLoadingModels(false)
    }
    fetchModels()
    fetchDeployments()
  }, [addNotification])

  async function handleDeploy() {
    if (!selectedModelName) {
      addNotification("error", "Please select a model to deploy")
      return
    }
    addNotification("info", "Starting deployment process...")

    const response = await startDeployment(selectedModelName)

    if (response.success) { 
      addNotification("success", response.message || "Deployment initiated. This may take a few minutes.")
      handleRefresh() // Refresh the deployments list after successful deployment
    }
    else { 
      addNotification("error", response.error || "Failed to deploy model. Please try again later.")
    }
  }

  const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
      case DeploymentStatus.DEPLOYING:
        return "text-yellow-400"
      case DeploymentStatus.RUNNING:
        return "text-green-400"
      case DeploymentStatus.FAILED:
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const formatUptime = (createdAt: Date) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    const days = Math.floor(diffInHours / 24)
    const hours = diffInHours % 24
    return `${days}d ${hours}h`
  }

  const getEndpointDisplay = (deployment: Deployment) => {
    if (deployment.status !== DeploymentStatus.RUNNING || !deployment.instanceIP || !deployment.instancePort) {
      return null;
    }
    return `${deployment.instanceIP}:${deployment.instancePort}`;
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
              <div className="relative">
                <Select value={selectedModelName} onValueChange={setSelectedModelName} disabled={isLoadingModels}>
                  <SelectTrigger className="w-full bg-gray-900/50 border-gray-700 text-gray-200">
                    <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Choose a model"} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    {models.length === 0 ? (
                      <div className="py-6 text-center">
                        <p className="text-gray-400 text-sm">No Models Found</p>
                        <p className="text-gray-500 text-xs mt-1">Upload to get started</p>
                      </div>
                    ) : (
                      models.map((model) => (
                        <SelectItem key={model.id} value={model.name}>
                          {model.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {isLoadingModels && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Instance Type</label>
              <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-md text-gray-200">
                Small (2 vCPU, 8GB RAM)
              </div>
            </div>
          </div>
        </Card>

        {/* Deployment Status */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Active Deployments</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-white"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Loader2 className="h-4 w-4 hover:animate-spin" />
              )}
            </Button>
          </div>
          <div className="space-y-4">
            {isLoadingDeployments ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : deployments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No active deployments
              </div>
            ) : (
              deployments.map((deployment) => (
                <div key={deployment.id} className="p-4 rounded-lg bg-gray-900/50 border border-gray-800/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Server className={`h-5 w-5 ${getStatusColor(deployment.status)}`} />
                      <span className="font-medium text-gray-200">{deployment.model.name}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-opacity-10 ${getStatusColor(deployment.status)}`}>
                      {deployment.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Instance Type</p>
                      <p className="text-gray-200">Small</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Uptime</p>
                      <p className="text-gray-200">{formatUptime(deployment.createdAt)}</p>
                    </div>
                    {getEndpointDisplay(deployment) && (
                      <div className="col-span-2">
                        <p className="text-gray-400 flex items-center gap-1.5">
                          <Server className="h-4 w-4" />
                          Endpoint
                        </p>
                        <p className="text-gray-200 font-mono text-sm mt-0.5">
                          {getEndpointDisplay(deployment)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Deploy Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleDeploy}
          disabled={isLoadingModels || !selectedModelName}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 disabled:opacity-50"
        >
          <Upload className="mr-2 h-4 w-4" />
          Deploy Model
        </Button>
      </div>
    </div>
  )
}