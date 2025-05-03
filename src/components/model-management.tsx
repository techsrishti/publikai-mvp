"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Play, X, ChevronDown } from "lucide-react"

interface ModelManagementProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

export function ModelManagement({ addNotification }: ModelManagementProps) {
  const handlePauseResumeModel = (model: { name: string; isActive: boolean }) => {
    const action = model.isActive ? "paused" : "resumed";
    addNotification(
      "info", 
      `Model ${model.name} has been ${action}.`
    );
  };

  const handleDeleteModel = (modelName: string) => {
    addNotification(
      "success", 
      `Model ${modelName} has been deleted.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select>
            <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-700 text-gray-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="border-gray-700 text-gray-400 hover:text-gray-100">
            <Loader2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 max-w-sm">
          <Input 
            placeholder="Search models..." 
            className="bg-gray-900/50 border-gray-700 text-gray-200"
          />
        </div>
      </div>

      {/* Models List */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
        <div className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 text-sm font-medium text-gray-400 border-b border-gray-800">
              <div className="flex-1">Model Name</div>
              <div className="w-24 text-center">Status</div>
              <div className="w-32 text-center">Requests/min</div>
              <div className="w-32 text-center">Response Time</div>
              <div className="w-24 text-center">Actions</div>
            </div>

            {/* Model Items */}
            {[
              {
                name: "BERT-base-uncased",
                type: "NLP",
                status: "Active",
                requestsPerMin: 245,
                responseTime: "150ms",
                isActive: true
              },
              {
                name: "ResNet50",
                type: "Computer Vision",
                status: "Active",
                requestsPerMin: 178,
                responseTime: "200ms",
                isActive: true
              },
              {
                name: "GPT-2-small",
                type: "Text Generation",
                status: "Paused",
                requestsPerMin: 0,
                responseTime: "0ms",
                isActive: false
              }
            ].map((model, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg bg-gray-900/30 border border-gray-800/60 hover:border-gray-700/60 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-200">{model.name}</h4>
                  <p className="text-sm text-gray-400">{model.type}</p>
                </div>
                <div className="w-24 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      model.isActive
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {model.status}
                  </span>
                </div>
                <div className="w-32 text-center font-medium text-gray-300">
                  {model.requestsPerMin}
                </div>
                <div className="w-32 text-center font-medium text-gray-300">
                  {model.responseTime}
                </div>
                <div className="w-24 flex justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-100"
                    onClick={() => handlePauseResumeModel(model)}
                  >
                    {model.isActive ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-400"
                    onClick={() => handleDeleteModel(model.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="w-full bg-gray-900/40 p-1 rounded-lg">
              <TabsTrigger
                value="requests"
                className="flex-1 data-[state=active]:bg-gray-800"
              >
                Requests
              </TabsTrigger>
              <TabsTrigger
                value="latency"
                className="flex-1 data-[state=active]:bg-gray-800"
              >
                Latency
              </TabsTrigger>
              <TabsTrigger
                value="errors"
                className="flex-1 data-[state=active]:bg-gray-800"
              >
                Errors
              </TabsTrigger>
            </TabsList>
            <TabsContent value="requests" className="mt-4">
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                Requests chart will be displayed here
              </div>
            </TabsContent>
            <TabsContent value="latency" className="mt-4">
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                Latency chart will be displayed here
              </div>
            </TabsContent>
            <TabsContent value="errors" className="mt-4">
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                Errors chart will be displayed here
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}