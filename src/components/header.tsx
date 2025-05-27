import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import Logo from "@/components/logo"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-black/80 backdrop-blur-xl h-12 md:h-16">
      <div className="h-full w-full">
        <div className="flex items-center justify-between h-full px-3 md:px-4">
          <div className="flex items-center gap-2">
            <Logo showText={false} href="/dashboard" className="flex-shrink-0" />
            <h1 className="text-xs md:text-base font-medium text-white/90 truncate">Creator Dashboard</h1>
          </div>
          <div className="flex items-center gap-1 md:gap-3">
            <Button variant="ghost" size="icon" className="h-7 w-7 md:h-9 md:w-9 text-white/70 hover:text-white">
              <Bell className="h-3.5 w-3.5 md:h-5 md:w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 md:h-9 md:w-9 text-white/70 hover:text-white">
              <Settings className="h-3.5 w-3.5 md:h-5 md:w-5" />
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  )
} 