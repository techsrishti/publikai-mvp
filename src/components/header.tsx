import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"

export function Header() {
  return (
    <header className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold text-white font-heading">Creator Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
} 