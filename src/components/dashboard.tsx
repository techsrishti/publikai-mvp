"use client"

import { useEffect, useState, useCallback } from "react"
import { CreditCard, Heart, Menu, Search, Settings, User, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/clerk-react";
import Image from "next/image"
import { AnimatedGradientText } from "./animated-gradient-text"
import { TrendingIcon } from "./icons/trending-icon"
import { ModelCard } from "./model-card"
import { ModelsButton } from "./models-button"
import { SidebarNavItem } from "./sidebar-nav-item"
import { TiltCard } from "./tilt-card"
import { useMobile } from "@/app/hooks/use-mobile"
import { getModels } from "@/app/dashboard/actions"
import { ModelDetailsDialog } from "./model-details-dialog"
import { Model } from "@/app/dashboard/actions"


export default function Dashboard() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [models, setModels] = useState<Model[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const isMobile = useMobile()
  const router = useRouter()

  const { user, isLoaded } = useUser();

  const onboardingComplete = (user?.publicMetadata as { onboardingComplete: boolean })?.onboardingComplete

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await getModels()
        if (response.success && response.models) {
          setModels(response.models)
        }
      } catch (error) {
        console.error("Error fetching models:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Using requestAnimationFrame to throttle updates
    requestAnimationFrame(() => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    })
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [handleMouseMove])

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-900 via-purple-950 to-blue-950">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-900/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <AnimatedGradientText
            text="Frito AI"
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

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-gray-400 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {!isLoaded ? (
            <Button variant="secondary" className="hidden sm:flex" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : onboardingComplete ? (
            <Button
              variant="secondary"
              className="hidden sm:flex"
              onClick={() => router.push('/creator-dashboard')}
            >
              Creator Dashboard
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="hidden sm:flex"
              onClick={() => router.push('/creator/questionnaire')}
            >
              Become a creator
            </Button>
          )}

          <UserButton afterSignOutUrl="/" />

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
                  text="Frito AI"
                  className="text-xl font-bold tracking-tight"
                  mousePosition={mousePosition}
                />
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4">
                <div className="mb-6 flex flex-col items-center">
                  <UserButton afterSignOutUrl="/" />
                  {!isLoaded ? (
                    <Button variant="secondary" className="mt-4 w-full" disabled>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  ) : !onboardingComplete && (
                    <Button
                      variant="secondary"
                      className="mt-4 w-full"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        router.push('/creator/questionnaire')
                      }}
                    >
                      Become a creator
                    </Button>
                  )}
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
            <UserButton afterSignOutUrl="/" />
            {!isLoaded ? (
              <Button variant="secondary" className="mt-4 w-full" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : !onboardingComplete && (
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => router.push('/creator/questionnaire')
              }>
                Become a creator
              </Button>
            )}
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
                {loading ? (
                  <div className="col-span-full flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : models && models.length > 0 ? (
                  models.map((model) => (
                    <TiltCard 
                      key={model.id} 
                      mousePosition={mousePosition} 
                      disabled={isMobile}
                      onClick={() => setSelectedModel(model)}
                    >
                      <div className="p-4 sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900/50">
                              <Image 
                                src={`/icons/${model.modelType.toLowerCase()}.svg`} 
                                alt={`${model.modelType} icon`} 
                                width={20} 
                                height={20} 
                                className="h-5 w-5" 
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-200 transition-colors duration-300 group-hover:text-yellow-300">
                                {`${model.creator.user.firstName.toLowerCase()}/${model.name}`}
                              </span>
                              <span className="text-xs text-gray-400">{model.modelType}</span>
                            </div>
                          </div>
                          <button className="group h-8 w-8 rounded-full text-gray-400 transition-colors hover:text-pink-400">
                            <Heart className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                          </button>
                        </div>
                        <p className="mb-4 text-sm text-gray-400">
                          {model.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{model.parameters}B parameters</span>
                          <span>₹{model.price}/month</span>
                        </div>
                      </div>
                    </TiltCard>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-400">
                    No models found
                  </div>
                )}
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
              name="gpt-4"
              company="OpenAI"
              icon="/icons/openai.svg"
              description="Latest multimodal model with advanced reasoning capabilities"
              likes={24500}
              runs={1200000}
              mousePosition={mousePosition}
              disabled={isMobile}
            />
            <ModelCard
              name="claude-3"
              company="Anthropic"
              icon="/icons/anthropic.svg"
              description="Advanced assistant with strong reasoning and safety features"
              likes={18700}
              runs={980000}
              mousePosition={mousePosition}
              disabled={isMobile}
            />
            <ModelCard
              name="gemini-pro"
              company="Google"
              icon="/icons/google.svg"
              description="Multimodal AI system for text, code and image generation"
              likes={15200}
              runs={850000}
              mousePosition={mousePosition}
              disabled={isMobile}
            />
            <ModelCard
              name="llama-2"
              company="Meta"
              icon="/icons/meta.svg"
              description="Open-source large language model with improved context handling"
              likes={12800}
              runs={720000}
              mousePosition={mousePosition}
              disabled={isMobile}
            />
          </div>
        </div>
      </div>

      {/* Model Details Dialog */}
      {selectedModel && (
        <ModelDetailsDialog
          model={selectedModel}
          open={!!selectedModel}
          onOpenChange={(open) => !open && setSelectedModel(null)}
        />
      )}
    </div>
  )
}
