"use client"

import { Home, Upload, Play, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  activeTab: string
  setActiveTab: (tab: any) => void
}

export function SidebarNav({ activeTab, setActiveTab }: SidebarNavProps) {
  const navItems = [
    {
      id: "overview",
      label: "Model Overview",
      icon: Home,
    },
    {
      id: "upload",
      label: "Model Upload",
      icon: Upload,
    },
    {
      id: "deployment",
      label: "Model Deployment",
      icon: Play,
    },
    {
      id: "management",
      label: "Model Management",
      icon: Settings,
    },
  ]

  return (
    <nav className="w-64 border-r border-slate-800 p-4">
      <div className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium",
              activeTab === item.id ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
} 