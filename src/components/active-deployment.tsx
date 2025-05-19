"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, X, RefreshCw } from "lucide-react"
import { useEffect, useState, useCallback } from "react"

interface ActiveDeploymentProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

interface Deployment {
  id: string
  modelName: string
  modelType: string
  userModelName: string
  status: string
  createdAt: string
  model: {
    modelType: string
    userModelName: string
    name: string
  }
}

export function ActiveDeployment({ addNotification }: ActiveDeploymentProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Fetch deployments from backend
  const fetchDeployments = useCallback(async () => {
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
  }, [addNotification])

  useEffect(() => {
    fetchDeployments()
  }, [fetchDeployments])

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
            className="text-gray-400 hover:text-white h-8 w-8"
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
            <div className="flex items-center gap-4 pb-4 text-sm font-medium text-gray-400 border-b border-gray-800">
              <div className="flex-1">Model Details</div>
              <div className="w-24 text-center">Status</div>
              <div className="w-24 text-center">Actions</div>
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
                className="flex items-center gap-4 p-4 rounded-lg bg-gray-900/30 border border-gray-800/60 hover:border-gray-700/60 transition-colors"
              >
                <div className="flex-1">
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-200">
                      {dep.model?.userModelName?.toUpperCase() || 
                       dep.model?.name?.toUpperCase() || 
                       dep.modelName?.toUpperCase() || 
                       'UNKNOWN'}
                    </h4>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Type:</span> {dep.model?.modelType || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="w-24 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      dep.status === "success"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {dep.status}
                  </span>
                </div>
                <div className="w-24 flex justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-400"
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