"use client"

<<<<<<< HEAD
import { useEffect, useState } from "react"
import { CreditCard, Heart, Menu, Search, Settings, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AnimatedGradientText } from "./animated-gradient-text"
import { TrendingIcon } from "./icons/trending-icon"
import { ModelCard } from "./model-card"
import { ModelsButton } from "./models-button"
import { SidebarNavItem } from "./sidebar-nav-item"
import { TiltCard } from "./tilt-card"
import { UserAvatar } from "./user-avatar"
import { useMobile } from "@/app/hooks/use-mobile"

export default function Dashboard() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-900 via-purple-950 to-blue-950">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-900/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <AnimatedGradientText
            text="Publik AI"
            className="text-xl font-bold tracking-tight sm:text-2xl"
            mousePosition={mousePosition}
          />
          <div className="hidden md:block">
            <ModelsButton mousePosition={mousePosition} />
          </div>
        </div>

        <div className="relative hidden w-96 lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search models, organizations..."
            className="h-10 border-gray-700 bg-gray-800/50 pl-10 text-sm font-medium text-gray-200 focus-visible:ring-purple-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-gray-400 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <UserAvatar size="sm" className="cursor-pointer" />

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[80%] border-gray-800 bg-gradient-to-b from-indigo-950 to-purple-950 p-0 sm:max-w-xs"
            >
              <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
                <AnimatedGradientText
                  text="Publik AI"
                  className="text-xl font-bold tracking-tight"
                  mousePosition={mousePosition}
                />
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4">
                <div className="mb-6 flex flex-col items-center">
                  <UserAvatar size="lg" />
                  <h3 className="font-medium text-gray-200">John Doe</h3>
                  <p className="text-xs text-gray-400">@johndoe</p>
                </div>

                <Separator className="my-4 bg-gray-700/50" />

                <div className="mb-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-gray-700 bg-gray-800/50 text-gray-200"
                  >
                    <ModelsButton mousePosition={mousePosition} />
                  </Button>
                </div>

                <nav className="space-y-1">
                  <SidebarNavItem icon={User} label="Profile" mousePosition={mousePosition} />
                  <SidebarNavItem icon={CreditCard} label="Billing" mousePosition={mousePosition} />
                  <SidebarNavItem icon={Settings} label="Settings" mousePosition={mousePosition} />
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left Panel - Hidden on mobile */}
        <div className="hidden w-56 flex-col border-r border-gray-800 bg-gradient-to-b from-indigo-950 to-purple-950 p-4 md:flex">
          <div className="mb-6 flex flex-col items-center">
            <UserAvatar size="lg" />
            <h3 className="font-medium text-gray-200">John Doe</h3>
            <p className="text-xs text-gray-400">@johndoe</p>
          </div>

          <Separator className="my-4 bg-gray-700/50" />

          <nav className="space-y-1">
            <SidebarNavItem icon={User} label="Profile" mousePosition={mousePosition} />
            <SidebarNavItem icon={CreditCard} label="Billing" mousePosition={mousePosition} />
            <SidebarNavItem icon={Settings} label="Settings" mousePosition={mousePosition} />
          </nav>
        </div>

        {/* Center Panel */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-900 via-gray-900 to-blue-950 p-4 sm:p-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="mx-auto w-fit rounded-full bg-gray-800/50 p-1 shadow-md backdrop-blur-sm">
                <TabsTrigger
                  value="all"
                  className="rounded-full px-3 py-1.5 text-sm text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm sm:px-6 sm:py-2 sm:text-base"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="models"
                  className="rounded-full px-3 py-1.5 text-sm text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm sm:px-6 sm:py-2 sm:text-base"
                >
                  Models
                </TabsTrigger>
                <TabsTrigger
                  value="liked"
                  className="rounded-full px-3 py-1.5 text-sm text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm sm:px-6 sm:py-2 sm:text-base"
                >
                  Liked
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="rounded-full px-3 py-1.5 text-sm text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm sm:px-6 sm:py-2 sm:text-base"
                >
                  Saved
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <TiltCard key={i} mousePosition={mousePosition} disabled={isMobile}>
                    <div className="p-4 sm:p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900/50">
                            <img src={`/placeholder.svg?height=32&width=32`} alt="Company logo" className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-gray-200 transition-colors duration-300 group-hover:text-yellow-300">
                            openai/gpt-4o
                          </span>
                        </div>
                        <button className="group h-8 w-8 rounded-full text-gray-400 transition-colors hover:text-pink-400">
                          <Heart className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                        </button>
                      </div>
                      <p className="mb-4 text-sm text-gray-400">
                        Advanced language model with improved reasoning and context handling.
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>12.5M runs</span>
                        <span>Updated 2d ago</span>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="models">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Models content would go here */}
              </div>
            </TabsContent>

            <TabsContent value="liked">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Liked content would go here */}
              </div>
            </TabsContent>

            <TabsContent value="saved">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Saved content would go here */}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Shown as bottom section on mobile */}
        <div className="border-t border-gray-800 bg-gradient-to-b from-blue-950 to-purple-950 p-4 md:w-72 md:border-l md:border-t-0">
          <div className="mb-4 flex items-center gap-1.5">
            <TrendingIcon className="h-4 w-4 text-purple-400" />
            <h3 className="font-medium text-gray-200">Trending</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 md:gap-5">
            <ModelCard
              name="openai/gpt-4o"
              company="OpenAI"
              description="Latest multimodal model with advanced reasoning capabilities and vision"
              likes={24500}
              runs={1200000}
              mousePosition={mousePosition}
              disabled={isMobile}
            />
            <ModelCard
              name="meta/llama-3"
              company="Meta AI"
              description="Open-source large language model with improved context handling"
              likes={18700}
              runs={980000}
              mousePosition={mousePosition}
              disabled={isMobile}
            />
            <ModelCard
              name="google/gemini-pro"
              company="Google"
              description="Multimodal AI system for text, code and image generation"
              likes={15200}
              runs={850000}
              mousePosition={mousePosition}
              disabled={isMobile}
            />
            <ModelCard
              name="anthropic/claude-3"
              company="Anthropic"
              description="Advanced assistant with strong reasoning and safety features"
              likes={12800}
              runs={720000}
              mousePosition={mousePosition}
              disabled={isMobile}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
=======
import { useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ModelOverview } from "@/components/model-overview"
import { ModelUpload } from "@/components/model-upload"
import { ModelDeployment } from "@/components/model-deployment"
import { ModelManagement } from "@/components/model-management"
import { Notifications } from "@/components/notifications"
import { Header } from "@/components/header"

type Tab = "overview" | "upload" | "deployment" | "management"

export function Dashboard() {
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
>>>>>>> main
