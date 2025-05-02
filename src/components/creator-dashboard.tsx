"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModelOverview } from "@/components/model-overview"
import { ModelUpload } from "@/components/model-upload"
import { ModelDeployment } from "@/components/model-deployment"
import { ModelManagement } from "@/components/model-management"
import { Notifications } from "@/components/notifications"
import { Header } from "@/components/header"
import { AnimatedBackground } from "@/components/animated-background"

type Tab = "overview" | "upload" | "deployment" | "management"

export function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      type: "success" | "error" | "info"
      message: string
    }>
  >([])

  const addNotification = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setNotifications((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }, 5000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AnimatedBackground />
      <Header />
      <main className="flex-1 overflow-y-auto relative">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
          <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
            <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className="w-full">
              <div className="border-b border-gray-800/60 px-6 py-4">
                <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-800/40 p-1">
                  <TabsTrigger
                    value="overview"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-800/60"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-800/60"
                  >
                    Upload
                  </TabsTrigger>
                  <TabsTrigger
                    value="deployment"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-800/60"
                  >
                    Deployment
                  </TabsTrigger>
                  <TabsTrigger
                    value="management"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-800/60"
                  >
                    Management
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="p-6">
                <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <ModelOverview />
                </TabsContent>
                <TabsContent value="upload" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <ModelUpload addNotification={addNotification} />
                </TabsContent>
                <TabsContent value="deployment" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <ModelDeployment addNotification={addNotification} />
                </TabsContent>
                <TabsContent value="management" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <ModelManagement addNotification={addNotification} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
          <div className="fixed bottom-4 right-4 z-50">
            <Notifications notifications={notifications} />
          </div>
        </div>
      </main>
    </div>
  )
}