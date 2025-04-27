"use client"

import { useEffect, useRef } from "react"

interface CursorFollowerProps {
  mousePosition: { x: number; y: number }
}

export function CursorFollower({ mousePosition }: CursorFollowerProps) {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cursorRef.current) return

    // Add a slight delay for a smoother effect
    const timer = setTimeout(() => {
      cursorRef.current!.style.transform = `translate(${mousePosition.x}px, ${mousePosition.y}px)`
    }, 50)

    return () => clearTimeout(timer)
  }, [mousePosition])

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-50 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-400/30 to-blue-400/30 blur-xl transition-transform duration-300"
    />
  )
}
