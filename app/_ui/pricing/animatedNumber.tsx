'use client'
import { toPersianNumber } from "@/app/_lib/utils"
import { useEffect, useState } from "react"

interface AnimatedNumberProps {
  value: number
  speed?: number
  step?: number
}

export default function AnimatedNumber({ value, speed = 15, step }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    setDisplay(0)
    const interval = setInterval(() => {
      setDisplay(prev => {
        const increment = step ?? Math.ceil(value / 50)
        if (prev + increment < value) return prev + increment
        clearInterval(interval)
        return value
      })
    }, speed)

    return () => clearInterval(interval)
  }, [value, speed, step])

  return <>{toPersianNumber(display)}</>
}
