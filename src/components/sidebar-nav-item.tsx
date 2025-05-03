"use client"

import { useEffect, useRef } from "react"
import  { LucideIcon } from "lucide-react"

interface SidebarNavItemProps {
  icon: LucideIcon
  label: string
  mousePosition: { x: number; y: number }
}

export function SidebarNavItem({ icon: Icon, label, mousePosition }: SidebarNavItemProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const iconRef = useRef<SVGSVGElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!buttonRef.current || !iconRef.current || !highlightRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const isHovering =
      mousePosition.x >= rect.left &&
      mousePosition.x <= rect.right &&
      mousePosition.y >= rect.top &&
      mousePosition.y <= rect.bottom

    if (isHovering) {
      // Calculate position within button (normalized from -1 to 1)
      const x = ((mousePosition.x - rect.left) / rect.width) * 2 - 1
      const y = ((mousePosition.y - rect.top) / rect.height) * 2 - 1

      // Apply subtle movement to icon
      iconRef.current.style.transform = `translate(${x * 3}px, ${y * 3}px)`

      // Position highlight based on cursor
      const highlightX = ((mousePosition.x - rect.left) / rect.width) * 100
      highlightRef.current.style.backgroundPosition = `${highlightX}% center`
    } else {
      iconRef.current.style.transform = "translate(0, 0)"
    }
  }, [mousePosition])

  return (
    <button
      ref={buttonRef}
      className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-300 transition-colors hover:text-white"
    >
      {/* Icon with subtle movement */}
      <Icon
        ref={iconRef}
        className="h-5 w-5 text-purple-400 transition-all duration-200 ease-out group-hover:text-purple-300"
      />

      {/* Label */}
      <span className="font-medium">{label}</span>

      {/* Modern highlight effect - gradient line that follows cursor */}
      <div
        ref={highlightRef}
        className="absolute bottom-0 left-0 h-[2px] w-full scale-x-0 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-[length:200%_100%] transition-transform duration-300 ease-out group-hover:scale-x-100"
      />

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:ring-1 group-hover:ring-purple-500/20" />
    </button>
  )
}
