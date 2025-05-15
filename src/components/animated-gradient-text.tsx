"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedGradientTextProps {
  text: string
  className?: string
  mousePosition: { x: number; y: number }
}

export function AnimatedGradientText({ text, className, mousePosition }: AnimatedGradientTextProps) {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !textRef.current) return;

    const rect = textRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Calculate distance from mouse to center of text (normalized)
    const windowWidth = window?.innerWidth || 1;
    const windowHeight = window?.innerHeight || 1;
    const dx = (mousePosition.x - centerX) / windowWidth
    const dy = (mousePosition.y - centerY) / windowHeight

    // Update gradient position based on mouse movement
    const gradientX = 50 + dx * 20 // Move gradient by up to 20%
    const gradientY = 50 + dy * 20

    textRef.current.style.setProperty("--gradient-x", `${gradientX}%`)
    textRef.current.style.setProperty("--gradient-y", `${gradientY}%`)
  }, [mousePosition])

  return (
    <div
      ref={textRef}
      className={cn(
        "bg-gradient-to-br from-purple-400 via-blue-400 to-violet-300 bg-clip-text text-transparent transition-all duration-300",
        "hover:from-purple-300 hover:via-blue-300 hover:to-violet-200",
        "animate-gradient-flow italic font-cabinet-grotesk",
        className,
      )}
      style={{
        backgroundSize: "200% 200%",
        backgroundPosition: "var(--gradient-x, 50%) var(--gradient-y, 50%)",
      }}
    >
      {text}
    </div>
  )
}
