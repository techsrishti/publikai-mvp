"use client"
import { useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ModelOverview } from "@/components/model-overview"
import { ModelUpload } from "@/components/model-upload"
import { ModelDeployment } from "@/components/model-deployment"
import { ModelManagement } from "@/components/model-management"
import { Notifications } from "@/components/notifications"
import { Header } from "@/components/header"

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

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }, 5000)
  }

  return (
    <div className="flex h-screen flex-col dashboard-bg">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && <ModelOverview />}
          {activeTab === "upload" && <ModelUpload addNotification={addNotification} />}
          {activeTab === "deployment" && <ModelDeployment addNotification={addNotification} />}
          {activeTab === "management" && <ModelManagement addNotification={addNotification} />}
        </main>
        <Notifications notifications={notifications} />
      </div>
    </div>
  )
}