"use client"

import Image from "next/image"

import { toPersianNumber } from "@/app/_lib/utils"
import { websiteName } from "@/app/_text/common"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"


export default function NotFound() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="size-28 -mt-36 mb-5 transition-transform cursor-pointer">
        <Image
          className="size-full"
          src="/logo.png"
          alt={`${websiteName} logo`}
          width={180}
          height={38}
          priority
        />
      </div>
      <div className="flex items-center justify-center gap-x-4">
        <p className="text-5xl font-black mt-1.5">{toPersianNumber(404)}</p>
        <div className="h-12 w-px bg-black dark:bg-white" />
        <p className="text-sm hover:opacity-75 active:opacity-75 transition-opacity">صفحه‌ی مورد نظر یافت نشد.</p>
      </div>
      <button onClick={() => router.back()} className="max-w-40 -mb-20 mt-10 gap-x-1 hover:gap-x-2 active:gap-x-4 rounded-full cursor-pointer whitespace-nowrap border border-solid border-black/[.08] dark:border-white/[.145] transition-all flex items-center justify-center hover:bg-[#f2f2f2]/25 dark:hover:bg-[#1a1a1a] hover:border-transparent active:bg-[#f2f2f2] dark:active:bg-[#1a1a1a] active:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto">
        <span className="font-semibold">بازگشت</span>
        <ArrowLeft className="size-5" />
      </button>
    </div>
  )
}