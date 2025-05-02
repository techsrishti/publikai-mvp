"use client"

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Square properties
    const squares: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string
    }> = []

    // Create initial squares
    const colors = ['#1a1b4b', '#2d1b4b', '#1b2d4b'] // Dark blue/purple colors matching the gradient
    for (let i = 0; i < 20; i++) {
      squares.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 100 + 50, // Squares between 50-150px
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.15, // Very subtle opacity
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      squares.forEach(square => {
        // Update position
        square.x += square.speedX
        square.y += square.speedY

        // Bounce off edges
        if (square.x + square.size > canvas.width || square.x < 0) {
          square.speedX *= -1
        }
        if (square.y + square.size > canvas.height || square.y < 0) {
          square.speedY *= -1
        }

        // Draw square
        ctx.fillStyle = square.color
        ctx.globalAlpha = square.opacity
        ctx.fillRect(square.x, square.y, square.size, square.size)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateSize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 opacity-50"
      style={{ background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #312e81)' }}
    />
  )
}