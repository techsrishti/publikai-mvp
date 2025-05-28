import { Bell, Menu, Search, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
 import { UserButton } from "@clerk/nextjs"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-xl px-4 sm:px-6 relative z-50">
      <div className="flex items-center gap-4 sm:gap-8">
        <div className="flex items-center gap-2">
          <Image 
            src="/icons/frito_icon.png" 
            alt="Frito Logo" 
            width={120} 
            height={120} 
            className="object-contain w-10 h-15 md:w-12 md:h-15"
          />
          <span className="text-[1.35rem] md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 leading-[2.5rem] md:leading-[3rem] -mt-0.5 truncate flex items-center h-14 md:h-16">
            Frito
          </span>
        </div>
      </div>

  

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-white/40 lg:hidden"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-white/40">
          <Bell className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-white/40">
          <Settings className="h-5 w-5" />
        </Button>

        <UserButton afterSignOutUrl="/" />

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[80%] border-white/5 bg-black/80 backdrop-blur-xl p-0 sm:max-w-xs relative z-50"
          >
            <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
              <div className="flex items-center gap-2">
                <Image 
                  src="/icons/frito_icon.png" 
                  alt="Frito Logo" 
                  width={120} 
                  height={120} 
                  className="object-contain w-10 h-15 md:w-12 md:h-15"
                />
                <span className="text-[1.35rem] md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 leading-[2.5rem] md:leading-[3rem] -mt-0.5 truncate flex items-center h-14 md:h-16">
                  Frito
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4">
              <div className="mb-6 flex flex-col items-center">
                <UserButton afterSignOutUrl="/" />
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-white/10 bg-white/5 text-white/70"
                >
                  <Bell className="h-5 w-5" />
                  Notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-white/10 bg-white/5 text-white/70"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
} 