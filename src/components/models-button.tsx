"use client"

import { useEffect, useRef } from "react"
import { Layers } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ModelsButtonProps {
  mousePosition: { x: number; y: number }
}

export function ModelsButton({ mousePosition }: ModelsButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const iconRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!buttonRef.current || !iconRef.current) return

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

      // Apply subtle tilt effect to icon
      const tiltX = y * 10 // Invert for natural tilt feel
      const tiltY = -x * 10

      iconRef.current.style.transform = `perspective(300px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    } else {
      iconRef.current.style.transform = "perspective(300px) rotateX(0deg) rotateY(0deg)"
    }
  }, [mousePosition])

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      className="group flex items-center gap-2 rounded-lg px-4 py-2 text-gray-300 transition-all hover:bg-white/5 hover:text-white"
    >
      <Layers
        ref={iconRef}
        className="h-5 w-5 text-purple-400 transition-all duration-200 group-hover:text-purple-300"
      />
      <span className="font-medium">Models</span>
    </Button>
  )
}
