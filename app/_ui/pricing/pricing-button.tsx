import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function PricingButton() {
  return (
    <Link
      href="/pricing"
      className="flex text-xs font-medium items-center gap-x-1.5 px-3 py-2.5 text-center bg-indigo-600/5 dark:bg-indigo-700/20 text-indigo-600 md:hover:scale-100 md:hover:bg-indigo-700/50 active:scale-110 transition-all backdrop-blur-sm rounded-full"
    >
      خرید اشتراک
      <Sparkles className="size-3 mb-px" />
    </Link>
  )
}