"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Server, Loader2, Check, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { formatRelativeTime, getFormattedDeploymentUrl } from "@/lib/utils"

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
  scriptId?: string | null
  script?: ModelScript | null
}

interface ModelScript {
  id: string
  content: string
  modelType: string
}

interface Deployment {
  id: string
  modelId: string
  status: string
  deploymentUrl?: string | null
  apiKey?: string | null
  gpuType?: string | null
  deploymentName?: string | null
  modelName?: string | null
  modelRevision?: string | null
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
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [, setShowScriptUpload] = useState(false)
  const [scriptFile, setScriptFile] = useState<File | null>(null)
  const [isUploadingScript, setIsUploadingScript] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/deployment", { cache: 'no-store' })
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
    // Fetch models with full details including script
    fetch("/api/models", { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setModels(data.models || []))
      .finally(() => setLoadingModels(false))

    // Fetch deployments in parallel
    fetch("/api/deployment", { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setDeployments(data.deployments || []))
      .catch(error => {
        console.error("Error fetching deployments:", error)
        setDeployments([])
      })
  }, [])

  const handleScriptUpload = async () => {
    if (!scriptFile || !selectedModel) {
      addNotification("error", "Please select a script file to upload.");
      return;
    }
    setIsUploadingScript(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const base64Content = btoa(content);

          // Create new ModelScript entry
          const scriptRes = await fetch("/api/model-scripts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: base64Content,
              modelType: "user-defined",
            }),
          });

          if (!scriptRes.ok) {
            throw new Error("Failed to create script entry");
          }

          const scriptData = await scriptRes.json();

          // Update model with script reference and set modelType to 'user-defined'
          const modelRes = await fetch(`/api/models/${selectedModel}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scriptId: scriptData.script.id,
              modelType: "user-defined",
            }),
          });

          if (!modelRes.ok) {
            throw new Error("Failed to update model with script reference");
          }

          // Refresh models to get updated data
          const updatedModelsRes = await fetch("/api/models", { 
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          const updatedModelsData = await updatedModelsRes.json();
          setModels(updatedModelsData.models || []);

          setScriptFile(null);
          addNotification("success", "Script uploaded successfully!");
        } catch (error) {
          console.error("Error uploading script:", error);
          addNotification("error", "Failed to upload script.");
        } finally {
          setIsUploadingScript(false);
        }
      };
      reader.readAsText(scriptFile);
    } catch (error) {
      setIsUploadingScript(false);
      addNotification("error", "Failed to upload script."+error);
    }
  };

  const handleModelSelect = async (modelId: string) => {
    setSelectedModel(modelId);
    try {
      const res = await fetch(`/api/models/${modelId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) throw new Error("Failed to fetch model details");
      const { model } = await res.json();
      if (model?.modelType === "other" && !model.scriptId) {
        setShowScriptUpload(true);
        addNotification("info", "Please upload a script for this model type.");
      } else {
        setShowScriptUpload(false);
      }
    } catch (error) {
      setShowScriptUpload(false);
      addNotification("error", "Failed to fetch model details. " + error);
    }
  };

  const handleDeploy = async () => {
    if (!selectedModel) {
      addNotification("error", "Please select a model to deploy.");
      return;
    }

    setIsDeploying(true);
    addNotification("info", "Starting deployment process...");
    try {
      // Fetch fresh model data
      const freshModelRes = await fetch(`/api/models/${selectedModel}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!freshModelRes.ok) {
        throw new Error("Failed to fetch fresh model data");
      }
      const freshModelData = await freshModelRes.json();
      const model = freshModelData.model;

      if (!model) {
        addNotification("error", "Model not found.");
        return;
      }

      // Check if model type is "other" or has no script
      if ((model.modelType === "other" || !model.scriptId) && !model.script) {
        setShowScriptUpload(true);
        addNotification("error", "A custom script is required for this model type. Please upload a script first.");
        setIsDeploying(false);
        return;
      }

      // Create FormData with model details
      const formData = new FormData();
      formData.append("name", model.name);
      formData.append("description", model.description);
      formData.append("modelType", model.modelType);
      formData.append("license", model.license);
      formData.append("sourceType", model.sourceType);
      formData.append("url", model.url || "");
      formData.append("tags", model.tags.join(","));
      formData.append("revision", model.revision || "");
      formData.append("parameters", model.parameters.toString());
      formData.append("subscriptionPrice", model.subscriptionPrice.toString());

      // Call the unified endpoint
      const res = await fetch("/api/model-deployment", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        addNotification("success", "Model created and deployment initiated!");
        // Update deployments by fetching the latest data
        const updatedDeploymentsRes = await fetch("/api/deployment");
        const updatedDeploymentsData = await updatedDeploymentsRes.json();
        setDeployments(updatedDeploymentsData.deployments || []);
      } else {
        addNotification("error", data.error || "Failed to create and deploy model.");
      }
    } catch (error) {
      console.error("Deployment error:", error);
      addNotification("error", "Deployment failed.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <div className="">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 items-start">
        {/* Left column: Deployment Configuration and Upload Script */}
        <div className="w-full h-[calc(100vh-12rem)]">
          <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 w-full h-full flex flex-col">
            {/* Deployment Configuration Section */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Deployment Configuration</h3>
              <div className="space-y-4 mb-8">
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
                      onChange={e => handleModelSelect(e.target.value)}
                    >
                      <option value="" className="bg-black text-gray-200">Choose a model</option>
                      {models.map((model: Model) => (
                        <option 
                          key={model.id} 
                          value={model.id}
                          className="bg-black text-gray-200 hover:bg-gray-800"
                        >
                          {model.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="pt-2">
                  <Button
                    onClick={handleDeploy}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isDeploying}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isDeploying ? "Deploying..." : "Deploy Model"}
                  </Button>
                </div>
              </div>
            </div>
            {/* Upload Model Script Section */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-medium text-white mb-4">Upload Model Script</h3>
              <div className="space-y-4 flex-1 flex flex-col">
                <div
                  className="border-2 border-dashed border-blue-500 rounded-lg p-6 flex-1 flex flex-col items-center justify-center text-center bg-blue-950/40 cursor-pointer w-full"
                  onClick={() => document.getElementById('script-upload-input')?.click()}
                >
                  <Upload className="h-10 w-10 text-blue-400 mb-2" />
                  <span className="font-medium text-white">Drag and drop your Python script here</span>
                  <span className="text-blue-400 underline cursor-pointer mt-1">
                    Or click to browse your files
                  </span>
                  <span className="text-xs text-gray-400 mt-2">
                    Supports <b>.py</b> files only
                  </span>
                  <input
                    id="script-upload-input"
                    type="file"
                    accept=".py"
                    onChange={e => setScriptFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {/* Show current script if present */}
                  {(() => {
                    const model = models.find(m => m.id === selectedModel);
                    if (model?.script) {
                      return (
                        <div className="mt-2 text-blue-300 text-sm">
                          Current script: <span className="font-semibold">{model.script.id}.py</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {scriptFile && (
                    <div className="mt-2 text-green-400 text-sm">
                      Selected: {scriptFile.name}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleScriptUpload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!scriptFile || isUploadingScript}
                >
                  {isUploadingScript ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Script"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column: Deployment Status */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 h-[calc(100vh-12rem)] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Active Deployments</h3>
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
                <RefreshCw className="h-4 w-4" />
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
                    <span className="font-medium text-gray-200">{dep.model?.name?.toUpperCase() || 'UNKNOWN MODEL'}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                    {dep.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-400">Deployment URL</p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-200 break-all flex-1">{dep.modelId ? getFormattedDeploymentUrl(dep.modelId) : "-"}</p>
                      {dep.modelId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-gray-200"
                          onClick={() => handleCopy(getFormattedDeploymentUrl(dep.modelId), `url-${dep.id}`)}
                        >
                          {copiedStates[`url-${dep.id}`] ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span>Copy</span>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400">API Key</p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-200 break-all flex-1">{dep.apiKey || "-"}</p>
                      {dep.apiKey && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-gray-200"
                          onClick={() => handleCopy(dep.apiKey!, `key-${dep.id}`)}
                        >
                          {copiedStates[`key-${dep.id}`] ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span>Copy</span>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400">Updated</p>
                    <p className="text-gray-200">{formatRelativeTime(dep.updatedAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}