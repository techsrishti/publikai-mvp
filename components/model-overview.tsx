import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain, Cpu, BarChart, Users } from "lucide-react"

export function ModelOverview() {
  // Mock data for demonstration
  const models = [
    {
      id: "1",
      name: "BERT-base-uncased",
      type: "NLP",
      status: "Deployed",
      requests: 1245,
      performance: 85,
    },
    {
      id: "2",
      name: "ResNet50",
      type: "Computer Vision",
      status: "Deployed",
      requests: 876,
      performance: 92,
    },
    {
      id: "3",
      name: "GPT-2-small",
      type: "Text Generation",
      status: "Pending",
      requests: 0,
      performance: 0,
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Model Overview</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-bg border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Brain className="h-6 w-6 text-blue-500" />
              <div className="text-2xl font-bold text-white">3</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-bg border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Cpu className="h-6 w-6 text-green-500" />
              <div className="text-2xl font-bold text-white">2</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-bg border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <BarChart className="h-6 w-6 text-purple-500" />
              <div className="text-2xl font-bold text-white">2,121</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-bg border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Users className="h-6 w-6 text-yellow-500" />
              <div className="text-2xl font-bold text-white">42</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-bg border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Your Models</CardTitle>
          <CardDescription>Overview of all your models and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {models.map((model) => (
              <div key={model.id} className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="font-medium text-white">{model.name}</div>
                  <div className="text-sm text-slate-400">{model.type}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-white">{model.requests} requests</div>
                    <div className="text-sm text-slate-400">{model.status}</div>
                  </div>
                  <div className="w-24">
                    <div className="text-xs text-slate-400 mb-1">Performance</div>
                    <Progress value={model.performance} className="h-2 bg-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
