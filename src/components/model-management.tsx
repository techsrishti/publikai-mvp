"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, X, RefreshCw } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { getModels, getDeployments, deleteModel } from "@/app/creator-dashboard/model-actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ModelManagementProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

interface Model {
  id: string
  name: string
  modelType: string
  deployment?: {
    id: string
    status: string
    gpuType?: string
  }
}

interface Deployment {
  id: string
  modelId: string
  status: string
  gpuType?: string
}

// Utility to format model type
function formatModelType(type?: string) {
  if (!type) return 'Unknown'
  // Replace underscores and spaces with dashes, split camelCase, then capitalize
  return type
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase to dash
    .replace(/[_\s]+/g, '-') // underscores/spaces to dash
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-')
}

export function ModelManagement({ addNotification }: ModelManagementProps) {
  const [models, setModels] = useState<Model[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch models and their deployments from backend
  const fetchModels = useCallback(async () => {
    setIsRefreshing(true)
    setLoading(true)
    try {
      const [modelsResult, deploymentsResult] = await Promise.all([
        getModels(),
        getDeployments()
      ])

      if (!modelsResult.success || !modelsResult.models) {
        throw new Error(modelsResult.error || 'Failed to fetch models')
      }

      // Combine models with their deployment info
      const modelsWithDeployments = modelsResult.models.map((model) => ({
        id: model.id,
        name: model.name,
        modelType: model.modelType,
        deployment: (deploymentsResult.deployments as Deployment[]).find((dep) => dep.modelId === model.id)
      }))
      
      setModels(modelsWithDeployments)
    } catch (error) {
      console.error("Error fetching models:", error)
      addNotification("error", "Failed to fetch models.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [addNotification])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  // Delete model and its deployments
  const handleDeleteModel = async (modelId: string) => {
    setIsDeleting(true)
    try {
      const result = await deleteModel(modelId)
      if (result.success) {
        addNotification("success", "Model is deleted.")
        setModels(models.filter(model => model.id !== modelId))
        setModelToDelete(null)
      } else {
        addNotification("error", result.error || "Failed to delete model.")
      }
    } catch (error) {
      console.error("Delete model error:", error)
      addNotification("error", "Failed to delete model.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter and search
  const filteredModels = models.filter(model => {
    const matchesStatus = filter === "all" || 
      (filter === "deployed" && model.deployment) ||
      (filter === "not-deployed" && !model.deployment)
    const searchTerm = search.toLowerCase()
    const modelName = model.name || ""
    const modelType = model.modelType || ""
    const matchesSearch = 
      modelName.toLowerCase().includes(searchTerm) ||
      modelType.toLowerCase().includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      <AlertDialog open={!!modelToDelete} onOpenChange={(open) => !open && setModelToDelete(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Model</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {modelToDelete && (
                <>
                  Are you sure you want to delete the model &quot;{modelToDelete.name}&quot;?
                  {modelToDelete.deployment && (
                    <>
                      <br />
                      <span className="text-red-400">This model is deployed and cannot be deleted.</span>
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-gray-200 hover:bg-gray-700">Cancel</AlertDialogCancel>
            {!modelToDelete?.deployment && (
              <AlertDialogAction
                onClick={() => modelToDelete && handleDeleteModel(modelToDelete.id)}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete Model"
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-700 text-gray-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="not-deployed">Not Deployed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchModels}
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
        <div className="flex-1 max-w-sm">
          <Input 
            placeholder="Search by model name or type..." 
            className="bg-gray-900/50 border-gray-700 text-gray-200"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Models List */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
        <div className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr_8rem_6rem] pb-4 text-sm font-medium text-gray-400 border-b border-gray-800">
              <div>Model Name</div>
              <div>Model Type</div>
              <div>GPU Type</div>
              <div>Status</div>
              <div className="text-center">Actions</div>
            </div>
            {/* Model Items */}
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading models...
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-gray-400 py-8 text-center">No models found.</div>
            ) : (
              filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_8rem_6rem] items-center gap-0 p-4 rounded-lg bg-gray-900/30 border border-gray-800/60 hover:border-gray-700/60 transition-colors"
                >
                  <div className="truncate min-w-0 font-medium text-gray-200">
                    {model.name.toUpperCase()}
                  </div>
                  <div className="truncate min-w-0">
                    {formatModelType(model.modelType)}
                  </div>
                  <div className="truncate min-w-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                      {model.deployment?.gpuType || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        model.deployment
                          ? "bg-green-500/10 text-green-400"
                          : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {model.deployment ? "Deployed" : "Not Deployed"}
                    </span>
                  </div>
                  <div className="text-center">
                    {!model.deployment ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-400 ml-6"
                        onClick={() => setModelToDelete(model)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 cursor-not-allowed ml-6"
                        disabled
                        title="Cannot delete a deployed model"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}