"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Upload, Server, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface ModelDeploymentProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

interface Model {
  id: string
  name: string
  description: string
  modelType: string
  license: string
  sourceType: string
  url: string | null
  tags: string[]
  revision?: string | null
  parameters: number
  createdAt: string
  modelName?: string
  organizationName?: string
  userModelName?: string
  customScript?: string | null
}

interface Deployment {
  id: string
  modelId: string
  status: string
  deploymentUrl?: string | null
  apiKey?: string | null
  createdAt: string
  updatedAt: string
  model: Model
}

export function ModelDeployment({ addNotification }: ModelDeploymentProps) {
  const [models, setModels] = useState<Model[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadingModels, setLoadingModels] = useState(true)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/deployment")
      if (!response.ok) {
        throw new Error("Failed to fetch deployments")
      }
      const data = await response.json()
      setDeployments(data.deployments || [])
    } catch (error) {
      console.error("Error refreshing deployments:", error)
      addNotification("error", "Failed to refresh deployments")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Fetch models (request only summary fields for faster response)
    fetch("/api/models?summary=1")
      .then(res => res.json())
      .then(data => setModels(data.models || []))
      .finally(() => setLoadingModels(false))

    // Fetch deployments in parallel
    fetch("/api/deployment")
      .then(res => res.json())
      .then(data => setDeployments(data.deployments || []))
      .catch(error => {
        console.error("Error fetching deployments:", error)
        setDeployments([])
      })
  }, [])

  const handleDeploy = async () => {
    if (!selectedModel) {
      addNotification("error", "Please select a model to deploy.")
      return
    }
    const model = models.find((m: Model) => m.id === selectedModel)
    if (!model) {
      addNotification("error", "Model not found.")
      return
    }
    setIsDeploying(true)
    addNotification("info", "Starting deployment process...")
    try {
      // Prepare payload for backend deploy
      const deployPayload = {
        model_name: model.url ? model.url.split("/")[4] : "",
        model_revision: model.revision || "main",
        org_name: model.organizationName || (model.url ? model.url.split("/")[3] : ""),
        model_unique_name: model.userModelName || model.name,
        param_count: model.parameters,
        custom_script: model.customScript || null,
      }
      console.log("Deploy payload:", deployPayload)
      if (!deployPayload.model_name || !deployPayload.model_unique_name || !deployPayload.org_name || !deployPayload.param_count) {
        addNotification("error", "Model details are incomplete for deployment.")
        setIsDeploying(false)
        return
      }
      const res = await fetch("http://127.0.0.1:8000/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deployPayload),
      })
      const data = await res.json()
      if (data.status === "success") {
        // POST to /api/deployment
        const depRes = await fetch("/api/deployment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: model.id,
            status: data.status,
            deploymentUrl: data.deployment_url,
            modelUniqueName: deployPayload.model_unique_name,
          }),
        })
        const depData = await depRes.json()
        if (depData.success) {
          addNotification("success", "Model deployed successfully!")
          // Update deployments by fetching the latest data
          const updatedDeploymentsRes = await fetch("/api/deployment")
          const updatedDeploymentsData = await updatedDeploymentsRes.json()
          setDeployments(updatedDeploymentsData.deployments || [])
        } else {
          addNotification("error", depData.error || "Failed to save deployment.")
        }
      } else {
        addNotification("error", data.message || "Deployment failed.")
      }
    } catch (err) {
      addNotification("error", "Deployment failed.")
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 items-start">
        {/* Deployment Configuration */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 self-start">
          <h3 className="text-lg font-semibold text-white mb-4">Deployment Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Model</label>
              {loadingModels ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <select
                  className="w-full bg-black border-gray-700 text-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                >
                  <option value="" className="bg-black text-gray-200">Choose a model</option>
                  {models.map((model: Model) => (
                    <option 
                      key={model.id} 
                      value={model.id}
                      className="bg-black text-gray-200 hover:bg-gray-800"
                    >
                      {model.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </Card>

        {/* Deployment Status */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 max-h-[70vh] overflow-auto">
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
            {deployments.length === 0 && <div className="text-gray-400">No deployments yet.</div>}
            {deployments.map((dep: Deployment) => (
              <div key={dep.id} className="p-4 rounded-lg bg-gray-900/50 border border-gray-800/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-green-400" />
                    <span className="font-medium text-gray-200">{dep.model?.name || 'Unknown Model'}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                    {dep.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Deployment URL</p>
                    <p className="text-gray-200 break-all">{dep.deploymentUrl ? <a href={dep.deploymentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{dep.deploymentUrl}</a> : "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">API Key</p>
                    <p className="text-gray-200 break-all">{dep.apiKey || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="text-gray-200">{new Date(dep.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Deploy Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleDeploy}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8"
          disabled={isDeploying}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isDeploying ? "Deploying..." : "Deploy Model"}
        </Button>
      </div>
    </div>
  )
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:text/plain;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}