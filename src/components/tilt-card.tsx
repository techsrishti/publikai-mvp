"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface TiltCardProps {
  mousePosition: { x: number; y: number }
  className?: string
  children: React.ReactNode
  disabled?: boolean
  gradientIndex?: number
  onClick?: () => void
}

const GRADIENTS = [
  "from-purple-500 to-blue-500",
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-indigo-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
] as const

export function TiltCard({ 
  mousePosition, 
  className, 
  children, 
  disabled = false,
  gradientIndex = 0,
  onClick
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const innerCardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  
  // Use the provided gradientIndex to select gradient
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length]

  useEffect(() => {
    if (!cardRef.current || !innerCardRef.current || !glowRef.current || disabled) return

    const rect = cardRef.current.getBoundingClientRect()
    const mouseOver =
      mousePosition.x >= rect.left &&
      mousePosition.x <= rect.right &&
      mousePosition.y >= rect.top &&
      mousePosition.y <= rect.bottom

    console.log(isHovering)
    setIsHovering(mouseOver)

    if (mouseOver) {
      // Calculate position within card (normalized from -1 to 1)
      const x = ((mousePosition.x - rect.left) / rect.width) * 2 - 1
      const y = ((mousePosition.y - rect.top) / rect.height) * 2 - 1

      // Apply 3D tilt effect to the entire card
      cardRef.current.style.transform = `perspective(1000px) rotateX(${y * 5}deg) rotateY(${-x * 5}deg)`

      // Keep inner content level by counter-balancing the tilt
      innerCardRef.current.style.transform = `rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`

      // Position glow exactly at cursor position
      const cursorX = mousePosition.x - rect.left - 10
      const cursorY = mousePosition.y - rect.top - 10
      glowRef.current.style.left = `${cursorX}px`
      glowRef.current.style.top = `${cursorY}px`
      glowRef.current.style.opacity = "0.6"
    } else {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
      innerCardRef.current.style.transform = "rotateX(0deg) rotateY(0deg)"
      glowRef.current.style.opacity = "0"
    }
  }, [mousePosition, disabled, isHovering])

  useEffect(() => {
    if (glowRef.current && isHovering) {
      const { x, y } = mousePosition;
      glowRef.current.style.setProperty('--mouse-x', `${x}px`);
      glowRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  }, [mousePosition, isHovering]);

  return (
    <div
      ref={cardRef}
      className={cn("group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer", className)}
      style={{
        transformStyle: "preserve-3d",
        transform: "perspective(1000px)",
        transformOrigin: "center center",
      }}
      onClick={onClick}
    >
      {/* Gradient border container */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-[1px] opacity-100 transition-opacity duration-300 group-hover:opacity-0">
        <div className="h-full w-full rounded-xl bg-gray-800/80 backdrop-blur-sm"></div>
      </div>

      {/* Hover gradient border */}
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} p-[1.5px] opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      >
        <div className="h-full w-full rounded-xl bg-gray-800/80 backdrop-blur-sm"></div>
      </div>

      {/* Animated glow effect - positioned absolutely to follow cursor exactly */}
      <div
        ref={glowRef}
        className={`absolute h-20 w-20 rounded-full bg-gradient-to-r ${gradient} opacity-0 blur-md transition-opacity duration-200`}
        style={{
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
        }}
      ></div>

      {/* Card content with counter-balanced 3D effect to keep text stable */}
      <div
        ref={innerCardRef}
        className="relative z-10 h-full w-full transition-transform duration-200 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  )
}
