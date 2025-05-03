"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Layers, Users } from "lucide-react"

export function ModelOverview() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-gradient-to-br from-blue-600/10 to-blue-800/10 border-blue-800/50 hover:border-blue-700/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">Total Models</p>
              <h3 className="text-2xl font-bold text-white mt-1">3</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-600/10 to-green-800/10 border-green-800/50 hover:border-green-700/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <BarChart className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-300">Active Deployments</p>
              <h3 className="text-2xl font-bold text-white mt-1">2</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-600/10 to-purple-800/10 border-purple-800/50 hover:border-purple-700/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <BarChart className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-300">Total Requests</p>
              <h3 className="text-2xl font-bold text-white mt-1">2,121</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-600/10 to-amber-800/10 border-amber-800/50 hover:border-amber-700/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-300">Active Users</p>
              <h3 className="text-2xl font-bold text-white mt-1">42</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Models List */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Your Models</h2>
        <div className="space-y-4">
          {[
            {
              name: "BERT-base-uncased",
              type: "NLP",
              requests: "1245 requests",
              status: "Deployed",
              performance: 85,
            },
            {
              name: "ResNet50",
              type: "Computer Vision",
              requests: "876 requests",
              status: "Deployed",
              performance: 92,
            },
            {
              name: "GPT-2-small",
              type: "Text Generation",
              requests: "0 requests",
              status: "Pending",
              performance: 0,
            },
          ].map((model, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all hover:shadow-lg"
            >
              <div className="space-y-1">
                <h3 className="font-medium text-white">{model.name}</h3>
                <p className="text-sm text-gray-400">{model.type}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-300">{model.requests}</p>
                  <p className="text-sm text-gray-500">{model.status}</p>
                </div>
                <div className="w-24">
                  <div className="h-2 rounded-full bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${model.performance}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}