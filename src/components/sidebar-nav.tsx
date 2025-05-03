"use client"

import { Layers, BarChart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "overview" | "upload" | "deployment" | "management"

interface SidebarNavProps {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

export function SidebarNav({ activeTab, setActiveTab }: SidebarNavProps) {
  const navItems = [
    {
      title: "Overview",
      value: "overview" as Tab,
      icon: Layers,
    },
    {
      title: "Upload",
      value: "upload" as Tab,
      icon: BarChart,
    },
    {
      title: "Deployment",
      value: "deployment" as Tab,
      icon: BarChart,
    },
    {
      title: "Management",
      value: "management" as Tab,
      icon: Settings,
    },
  ]

  return (
    <div className="hidden md:block w-64 bg-gray-900/40 border-r border-gray-800/60 backdrop-blur-sm">
      <div className="h-full px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all",
                  activeTab === item.value
                    ? "bg-purple-600/20 text-purple-200 border border-purple-800/50"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  activeTab === item.value
                    ? "text-purple-400"
                    : "text-gray-500 group-hover:text-gray-400"
                )} />
                {item.title}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}