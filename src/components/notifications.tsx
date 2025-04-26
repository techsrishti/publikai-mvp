"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationsProps {
  notifications: Array<{
    id: string
    type: "success" | "error" | "info"
    message: string
  }>
}

export function Notifications({ notifications }: NotificationsProps) {
  const [visible, setVisible] = useState<string[]>([])

  useEffect(() => {
    // Add new notifications to visible list
    const newIds = notifications.filter((n) => !visible.includes(n.id)).map((n) => n.id)

    if (newIds.length > 0) {
      setVisible((prev) => [...prev, ...newIds])
    }
  }, [notifications, visible])

  const removeNotification = (id: string) => {
    setVisible((prev) => prev.filter((notifId) => notifId !== id))
  }

  const getIcon = (type: "success" | "error" | "info") => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />
      case "info":
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getColor = (type: "success" | "error" | "info") => {
    switch (type) {
      case "success":
        return "border-green-800 bg-green-950/50"
      case "error":
        return "border-red-800 bg-red-950/50"
      case "info":
        return "border-blue-800 bg-blue-950/50"
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications
        .filter((notification) => visible.includes(notification.id))
        .map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex items-center justify-between rounded-md border p-4 shadow-md",
              getColor(notification.type),
            )}
          >
            <div className="flex items-center space-x-3">
              {getIcon(notification.type)}
              <p className="text-sm text-white">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
    </div>
  )
} 