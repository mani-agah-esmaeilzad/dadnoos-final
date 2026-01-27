'use client'

import { Button } from "./components/button"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="p-0 size-12 flex items-center justify-center rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm"
    >
      <ArrowLeft className="size-6" />
    </Button>
  )
}