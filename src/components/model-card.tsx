"use client"

import { useEffect, useRef, useState } from "react"
import { BarChart3, Heart, Star } from "lucide-react"
import Image from "next/image"

interface ModelCardProps {
  name: string
  company: string
  description: string
  likes: number
  runs: number
  mousePosition: { x: number; y: number }
  disabled?: boolean
  icon: string
}

export function ModelCard({
  name,
  company,
  description,
  likes,
  runs,
  mousePosition,
  disabled = false,
  icon,
}: ModelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const innerCardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (!cardRef.current || !innerCardRef.current || !glowRef.current || disabled) return

    const rect = cardRef.current.getBoundingClientRect()
    const mouseOver =
      mousePosition.x >= rect.left &&
      mousePosition.x <= rect.right &&
      mousePosition.y >= rect.top &&
      mousePosition.y <= rect.bottom

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

  // Format numbers with K/M suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  // Generate a unique gradient for each card based on name
  const getGradient = () => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue1 = (hash % 60) + 220 // Blues to purples
    const hue2 = ((hash % 40) + 260) % 360 // Purples to pinks
    return `from-[hsl(${hue1},70%,60%)] to-[hsl(${hue2},70%,50%)]`
  }

  return (
    <div
      ref={cardRef}
      className="group relative h-[120px] w-full cursor-pointer overflow-hidden rounded-xl transition-all duration-300"
      style={{
        clipPath: isHovering
          ? "polygon(0% 0%, 100% 0%, 97% 100%, 0% 97%)"
          : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        transformStyle: "preserve-3d",
        transform: "perspective(1000px)",
        transformOrigin: "center center",
      }}
    >
      {/* Background with gradient border */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getGradient()} p-[1.5px] opacity-20 transition-opacity duration-300 group-hover:opacity-100`}
      >
        <div className={`h-full w-full rounded-xl bg-gray-900/90 backdrop-blur-sm`}></div>
      </div>

      {/* Animated glow effect - positioned absolutely to follow cursor exactly */}
      <div
        ref={glowRef}
        className={`absolute h-20 w-20 rounded-full bg-gradient-to-r ${getGradient()} opacity-0 blur-md transition-opacity duration-200`}
        style={{
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
        }}
      ></div>

      {/* Card content with counter-balanced 3D effect to keep text stable */}
      <div
        ref={innerCardRef}
        className="relative z-10 flex h-full flex-col p-4 transition-transform duration-200 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${getGradient()} p-[1px]`}
            >
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-900">
                <Image 
                  src={icon} 
                  alt={`${company} logo`} 
                  width={16} 
                  height={16} 
                  className="h-4 w-4"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200 transition-colors duration-300 group-hover:text-yellow-300">
                {name}
              </span>
              <span className="text-xs text-gray-500">{company}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-gray-800/50 px-2 py-0.5 text-xs">
            <Star className="h-3 w-3 text-yellow-400" />
            <span className="text-gray-300">4.9</span>
          </div>
        </div>

        <p className="mb-auto text-xs text-gray-400 line-clamp-2">{description}</p>

        <div className="mt-1 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 rounded-full bg-gray-800/50 px-2 py-0.5">
            <Heart
              className={`h-3 w-3 ${isHovering ? "text-pink-500" : "text-gray-500"} transition-colors duration-300`}
            />
            <span className="text-gray-400">{formatNumber(likes)}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-gray-800/50 px-2 py-0.5">
            <BarChart3
              className={`h-3 w-3 ${isHovering ? "text-blue-500" : "text-gray-500"} transition-colors duration-300`}
            />
            <span className="text-gray-400">{formatNumber(runs)}</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-1 -top-1 h-8 w-8 rounded-bl-xl bg-gradient-to-br from-transparent to-gray-800/20"></div>
        <div className="absolute -bottom-1 -left-1 h-8 w-8 rounded-tr-xl bg-gradient-to-tl from-transparent to-gray-800/20"></div>
      </div>
    </div>
  )
}
