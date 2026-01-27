"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
// import { useRouter } from "next/navigation"

interface PullToRefreshLayoutProps {
  children: React.ReactNode
}

export default function PullToRefreshLayout({ children }: PullToRefreshLayoutProps) {
  const [pullStartY, setPullStartY] = useState<number | null>(null)
  const [pullDistance, setPullDistance] = useState<number>(0)

  // const router = useRouter()

  const maxPull = 100
  const maxVisualPull = 125

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const oneFifthViewport = window.innerHeight / 5
      const touch = e.touches[0]
      const centerX = window.innerWidth / 2
      const horizontalRange = 75

      const isTopArea = touch.clientY <= oneFifthViewport
      const isCenterArea = touch.clientY <= window.innerHeight / 2 && touch.clientX >= centerX - horizontalRange && touch.clientX <= centerX + horizontalRange

      if (isTopArea && isCenterArea) {
        setPullStartY(touch.clientY)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (pullStartY !== null) {
        const distance = e.touches[0].clientY - pullStartY
        if (distance > 0) {
          e.preventDefault()
          setPullDistance(Math.min(distance, maxVisualPull))
        }
      }
    }

    const handleTouchEnd = () => {
      if (pullDistance >= maxPull) {
        setPullDistance(maxVisualPull)
        setTimeout(() => {
          window.location.reload()
          // router.refresh()
          setPullDistance(0)
        }, 800)
      } else {
        setPullDistance(0)
      }
      setPullStartY(null)
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: false })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)

    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [pullStartY, pullDistance])

  return (
    <div className="relative overflow-hidden">
      {/* <div
        style={{
          position: "absolute",
          top: 0,
          left: `calc(50% - 75px)`,
          width: "150px",
          height: `${window.innerHeight / 5}px`,
          border: "2px solid blue",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      /> */}

      <motion.div
        className="sm:hidden flex items-center justify-center w-full fixed -top-2 right-1/2 translate-x-1/2 z-[1000] max-w-40 pointer-events-auto"
        style={{ height: 100 }}
        animate={{ y: pullDistance - 20 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <motion.div className="relative flex justify-center items-center w-fit h-8">
          {[0, 1, 2].map((i) => {
            const offset = (i - 1) * 18
            const isActive = pullDistance >= maxPull
            const opacity = Math.min(pullDistance / maxVisualPull, 1)

            return (
              <motion.div
                key={i}
                className="absolute size-3.5 bg-indigo-600 shadow-xl rounded-full"
                animate={{
                  x: isActive ? offset : 0,
                  y: isActive ? ["0%", "-75%", "0%"] : 0,
                  opacity,
                }}
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 25 },
                  y: isActive
                    ? { repeat: Infinity, duration: 0.6, delay: i * 0.1 }
                    : { duration: 0.4, ease: "easeOut" },
                  opacity: { duration: 0.4, ease: "easeOut" },
                }}
              />
            )
          })}
        </motion.div>
      </motion.div>

      <div>{children}</div>
    </div>
  )
}