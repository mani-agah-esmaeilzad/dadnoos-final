'use client'

import { motion } from "framer-motion"
import AnimatedNumber from "./animatedNumber"
import { toPersianNumber } from "@/app/_lib/utils"

interface SubscriptionCircleProps {
  remaining_tokens: number
  token_quota: number
  daysRemaining: number
  daysTotal: number
}

export default function SubscriptionCircle({ remaining_tokens, token_quota, daysRemaining, daysTotal }: SubscriptionCircleProps) {
  const daysPercent = (daysRemaining / daysTotal) * 100
  const tokensPercent = (remaining_tokens / token_quota) * 100

  return (
    <div className="relative w-2/3 max-w-lg mt-8">
      <svg viewBox="0 0 200 120" className="size-full">
        {/* پس‌زمینه بیرونی - توکن */}
        <path d="M20 100 A80 80 0 1 1 180 100" stroke="#7e7553" strokeWidth="12" fill="transparent" strokeLinecap="round" />
        <motion.path
          d="M20 100 A80 80 0 1 1 180 100"
          stroke="#9b956d" strokeWidth="12" fill="transparent" strokeLinecap="round"
          strokeDasharray="251.2"
          strokeDashoffset={251.2 - (251.2 * tokensPercent) / 100}
          initial={{ strokeDashoffset: 251.2 }}
          animate={{ strokeDashoffset: 251.2 - (251.2 * tokensPercent) / 100 }}
          transition={{ duration: 0.75 }}
        />

        {/* پس‌زمینه داخلی - روزها */}
        <path d="M50 100 A50 50 0 1 1 150 100" stroke="#3730a3" strokeWidth="12" fill="transparent" strokeLinecap="round" />
        <motion.path
          d="M50 100 A50 50 0 1 1 150 100"
          stroke="#4f46e5" strokeWidth="12" fill="transparent" strokeLinecap="round"
          strokeDasharray="157"
          strokeDashoffset={157 - (157 * daysPercent) / 100}
          initial={{ strokeDashoffset: 157 }}
          animate={{ strokeDashoffset: 157 - (157 * daysPercent) / 100 }}
          transition={{ duration: 0.75 }}
        />

        <text x="100" y="100" textAnchor="middle" className="text-lg fill-[#4f46e5] text-right font-semibold">
          <AnimatedNumber value={daysRemaining} />{' '}{'ر'}{'و'}{'ز'}
        </text>
      </svg>

      <p className="text-xl lg:text-3xl fill-neutral-700 dark:fill-neutral-300 font-semibold text-center mt-3">
        <AnimatedNumber value={remaining_tokens} /> / {toPersianNumber(token_quota)} <span className="mx-2">توکن</span>
      </p>
    </div>
  )
}
