"use client"

import Image from "next/image"
import Link from "next/link"

import { websiteName } from '@/app/_text/common'

export default function Navbar() {
  return (
    <div className="flex items-center justify-between h-14 w-full sticky top-0 px-3 sm:px-14 sm:pt-12 bg-background pt-safe-20 z-40">
      <Link href="/" className="w-9 aspect-square">
        <Image
          className="size-9 scale-[135%] hover:scale-125 active:scale-110 transition-transform"
          src="/logo.png"
          alt={`${websiteName} logo`}
          width={180}
          height={38}
          priority
        />
      </Link>
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