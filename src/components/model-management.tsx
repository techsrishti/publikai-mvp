"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Play, X, ChevronDown, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
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

interface Deployment {
  id: string
  modelName: string
  modelType: string
  userModelName: string
  status: string
  createdAt: string
  gpuType?: string
  model: {
    modelType: string
    userModelName: string
    name: string
    id: string
    organizationName?: string
  }
}

// Utility to format model type
function formatModelType(type?: string) {
  if (!type) return 'Unknown';
  // Replace underscores and spaces with dashes, split camelCase, then capitalize
  return type
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase to dash
    .replace(/[_\s]+/g, '-') // underscores/spaces to dash
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
}

export function ModelManagement({ addNotification }: ModelManagementProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [deploymentToDelete, setDeploymentToDelete] = useState<Deployment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch deployments from backend
  const fetchDeployments = async () => {
    setIsRefreshing(true)
    setLoading(true)
    try {
      const res = await fetch("/api/deployment")
      const data = await res.json()
      setDeployments(data.deployments || [])
    } catch {
      addNotification("error", "Failed to fetch deployments.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDeployments()
  }, [])

  // Delete deployment
  const handleDeleteDeployment = async (id: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/deployment?id=${id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      })
      const data = await res.json()
      if (data.success) {
        addNotification("success", "Deployment deleted.")
        setDeployments(deployments.filter(dep => dep.id !== id))
        setDeploymentToDelete(null)
      } else {
        addNotification("error", data.message || data.error || "Failed to delete deployment.")
      }
    } catch (error) {
      console.error("Delete deployment error:", error)
      addNotification("error", "Failed to delete deployment.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter and search
  const filteredDeployments = deployments.filter(dep => {
    const matchesStatus = filter === "all" || dep.status.toLowerCase() === filter
    const searchTerm = search.toLowerCase()
    const modelName = dep.model?.userModelName || dep.model?.name || dep.modelName || ""
    const modelType = dep.model?.modelType || ""
    const matchesSearch = 
      modelName.toLowerCase().includes(searchTerm) ||
      modelType.toLowerCase().includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      <AlertDialog open={!!deploymentToDelete} onOpenChange={(open) => !open && setDeploymentToDelete(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Deployment</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {deploymentToDelete && (
                <>
                  Are you sure you want to delete the deployment for model "{deploymentToDelete.model?.userModelName || deploymentToDelete.model?.name || deploymentToDelete.modelName}"? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-gray-200 hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deploymentToDelete && handleDeleteDeployment(deploymentToDelete.id)}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Deployment"
              )}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={async () => {
                if (!deploymentToDelete) return;
                setIsDeleting(true);
                try {
                  // Delete deployment first
                  await fetch(`/api/deployment?id=${deploymentToDelete.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
                  // Delete model
                  await fetch(`/api/models?id=${deploymentToDelete.model?.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
                  addNotification("success", "Deployment and model deleted.");
                  setDeployments(deployments.filter(dep => dep.id !== deploymentToDelete.id));
                  setDeploymentToDelete(null);
                } catch (err) {
                  addNotification("error", "Failed to delete model and deployment.");
                } finally {
                  setIsDeleting(false);
                }
              }}
              className="bg-red-800 text-white hover:bg-red-900"
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
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchDeployments}
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

      {/* Deployments List */}
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
            {/* Deployment Items */}
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading deployments...
              </div>
            ) : filteredDeployments.length === 0 ? (
              <div className="text-gray-400 py-8 text-center">No deployments found.</div>
            ) : filteredDeployments.map((dep) => (
              <div
                key={dep.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_8rem_6rem] items-center gap-0 p-4 rounded-lg bg-gray-900/30 border border-gray-800/60 hover:border-gray-700/60 transition-colors"
              >
                <div className="truncate min-w-0 font-medium text-gray-200">{dep.model?.name?.toUpperCase() || dep.modelName?.toUpperCase() || 'UNKNOWN'}</div>
                <div className="truncate min-w-0">{formatModelType(dep.model?.modelType)}</div>
                <div className="truncate min-w-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                    {dep.gpuType || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      dep.status === "success"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {dep.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-400 ml-6"
                    onClick={() => setDeploymentToDelete(dep)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}