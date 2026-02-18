"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { websiteName } from "@/app/_text/common"

export default function Navbar() {
  const router = useRouter()

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const LONG_PRESS_TIME = 5000
  const SHORT_PRESS_THRESHOLD = 1000

  const handlePressStart = () => {
    startTimeRef.current = Date.now()

    timerRef.current = setTimeout(() => {
      router.push("/admin")
    }, LONG_PRESS_TIME)
  }

  const handlePressEnd = () => {
    const duration = Date.now() - startTimeRef.current

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (duration <= SHORT_PRESS_THRESHOLD) {
      router.push("/")
    }
  }

  return (
    <div className="flex items-center justify-between h-14 w-full sticky top-1.5 px-3.5 sm:px-14 sm:pt-12 pt-safe-20 z-50">

      <div
        className="w-9 aspect-square ms-1 cursor-pointer"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        <Image
          className="size-9 scale-[135%] hover:scale-125 active:scale-110 transition-transform"
          src="/logo.png"
          alt={`${websiteName} logo`}
          width={180}
          height={38}
          priority
        />
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/c"
          className="rounded-full transition-colors flex items-center justify-center text-white dark:text-black bg-[#C8A276] gap-2 hover:bg-[#C8A276]/75 active:bg-[#C8A276]/75 font-medium text-xs sm:text-sm h-9 px-4 sm:w-auto"
        >
          شروع گفتگو
        </Link>
      </div>
    </div>
  )
}
