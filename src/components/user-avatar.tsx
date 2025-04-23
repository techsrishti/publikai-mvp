import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  size?: "sm" | "md" | "lg"
  className?: string
  fallback?: string
}

export function UserAvatar({ size = "md", className, fallback = "JD" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const dimensions = {
    sm: 36,
    md: 48,
    lg: 64,
  }

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        size === "lg" && "ring-2 ring-purple-500/30",
        size === "sm" && "hover:ring-2 hover:ring-purple-400",
        "transition-all",
        className,
      )}
    >
      <AvatarImage src={`/placeholder.svg?height=${dimensions[size]}&width=${dimensions[size]}`} alt="User avatar" />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}
