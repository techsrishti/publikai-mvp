"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Server, Loader2, Check, RefreshCw, ArrowRight } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { formatRelativeTime, getFormattedDeploymentUrl } from "@/lib/utils"
import { deployModel } from "@/app/actions/model-deployment"
import { getDeployments } from "@/app/actions/deployments"
import { createModelScript } from "@/app/actions/model-scripts"
import { getModels, getModelById, updateModelWithScript } from "@/app/actions/models"
import { DeploymentStatus } from "@prisma/client"

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
  createdAt: Date
  updatedAt: Date
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
  status: DeploymentStatus
  deploymentUrl?: string | null
  apiKey?: string | null
  gpuType?: string | null
  deploymentName?: string | null
  modelName?: string | null
  modelRevision?: string | null
  createdAt: Date
  updatedAt: Date
  model: Model
}

// Helper function to convert Date to string
function convertDateToString(date: Date): string {
  return date.toISOString()
}

// Helper function to convert server response to our interface types
function convertServerResponse(response: any): Deployment[] {
  return response.map((item: any) => ({
    ...item,
    createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
    updatedAt: item.updatedAt instanceof Date ? item.updatedAt : new Date(item.updatedAt),
    model: {
      ...item.model,
      createdAt: item.model.createdAt instanceof Date ? item.model.createdAt : new Date(item.model.createdAt),
      updatedAt: item.model.updatedAt instanceof Date ? item.model.updatedAt : new Date(item.model.updatedAt)
    }
  }))
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoverStates, setHoverStates] = useState({ deploy: false })
  const deployBtnRef = useRef<HTMLButtonElement>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const { deployments: fetchedDeployments } = await getDeployments()
      setDeployments(convertServerResponse(fetchedDeployments || []))
    } catch (error) {
      console.error("Error refreshing deployments:", error)
      addNotification("error", "Failed to refresh deployments")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch models using server action
        const { models: fetchedModels, error: modelsError } = await getModels()
        if (modelsError) {
          throw new Error(modelsError)
        }
        setModels(fetchedModels || [])

        // Fetch deployments using server action
        const { deployments: fetchedDeployments } = await getDeployments()
        setDeployments(convertServerResponse(fetchedDeployments || []))
      } catch (error) {
        console.error("Error fetching data:", error)
        setDeployments([])
      } finally {
        setLoadingModels(false)
      }
    }

    fetchData()
  }, [])

  const handleScriptUpload = async () => {
    if (!scriptFile || !selectedModel) {
      addNotification("error", "Please select a script file to upload.")
      return
    }
    setIsUploadingScript(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          const base64Content = btoa(content)

          // Create new ModelScript entry using server action
          const scriptResult = await createModelScript(base64Content, "user-defined")

          if (!scriptResult.success) {
            throw new Error("Failed to create script entry")
          }

          // Update model with script reference using server action
          const { model, error: updateError } = await updateModelWithScript(selectedModel, scriptResult.script.id)
          if (updateError) {
            throw new Error(updateError)
          }

          // Refresh models list
          const { models: fetchedModels, error: modelsError } = await getModels()
          if (modelsError) {
            throw new Error(modelsError)
          }
          setModels(fetchedModels || [])

          // Clear the script file input
          setScriptFile(null)
          const fileInput = document.getElementById('script-upload-input') as HTMLInputElement
          if (fileInput) {
            fileInput.value = ''
          }
          addNotification("success", "Script uploaded successfully!")
        } catch (error) {
          console.error("Error uploading script:", error)
          addNotification("error", "Failed to upload script.")
        } finally {
          setIsUploadingScript(false)
        }
      }
      reader.readAsText(scriptFile)
    } catch (error) {
      setIsUploadingScript(false)
      addNotification("error", "Failed to upload script: " + error)
    }
  }

  const handleModelSelect = async (modelId: string) => {
    setSelectedModel(modelId)
    try {
      const { model, error } = await getModelById(modelId)
      if (error) {
        throw new Error(error)
      }
      if (model?.modelType === "other" && !model.scriptId) {
        setShowScriptUpload(true)
        addNotification("info", "Please upload a script for this model type.")
      } else {
        setShowScriptUpload(false)
      }
    } catch (error) {
      setShowScriptUpload(false)
      addNotification("error", "Failed to fetch model details. " + error)
    }
  }

  const handleDeploy = async () => {
    if (!selectedModel) {
      addNotification("error", "Please select a model to deploy.")
      return
    }

    setIsDeploying(true)
    addNotification("info", "Starting deployment process...")
    try {
      // Fetch fresh model data using server action
      const { model, error: modelError } = await getModelById(selectedModel)
      if (modelError) {
        throw new Error(modelError)
      }

      if (!model) {
        addNotification("error", "Model not found.")
        return
      }

      // Check if model type is "other" or has no script
      if ((model.modelType === "other" || !model.scriptId) && !model.script) {
        setShowScriptUpload(true)
        addNotification("error", "A custom script is required for this model type. Please upload a script first.")
        setIsDeploying(false)
        return
      }

      // Deploy the model using server action
      const result = await deployModel(selectedModel, "default")
      
      if (result.success) {
        addNotification("success", "Model deployment initiated!")
        // Update deployments by fetching the latest data
        const { deployments: fetchedDeployments } = await getDeployments()
        setDeployments(convertServerResponse(fetchedDeployments || []))
        
        // If we have an API key, show it to the user
        if (result.deployment?.apiKey) {
          addNotification("success", `Deployment successful! API Key: ${result.deployment.apiKey}`)
        }
      } else {
        addNotification("error", "Failed to deploy model.")
      }
    } catch (error) {
      console.error("Deployment error:", error)
      addNotification("error", error instanceof Error ? error.message : "Deployment failed.")
    } finally {
      setIsDeploying(false)
    }
  }

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

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  useEffect(() => {
    const updateGlowEffect = (isHovering: boolean, btnRef: React.RefObject<HTMLButtonElement | null>) => {
      if (!isHovering || !btnRef.current) return
      
      const glowElement = btnRef.current.querySelector(".glow-effect") as HTMLElement
      if (glowElement) {
        glowElement.style.left = `${mousePosition.x}px`
        glowElement.style.top = `${mousePosition.y}px`
      }
    }

    updateGlowEffect(hoverStates.deploy, deployBtnRef)
  }, [mousePosition, hoverStates])

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
                    ref={deployBtnRef}
                    onClick={handleDeploy}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white relative overflow-hidden rounded-lg shadow-md transition-transform duration-150 active:scale-95"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setHoverStates(prev => ({ ...prev, deploy: true }))}
                    onMouseLeave={() => setHoverStates(prev => ({ ...prev, deploy: false }))}
                    disabled={isDeploying}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isDeploying ? (
                        <>
                          <Loader2 className="mr-2 h-4 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          Deploy Model <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
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