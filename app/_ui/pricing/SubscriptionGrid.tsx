'use client'

import { motion } from "framer-motion"
import { toPersianNumber } from "@/app/_lib/utils"

interface SubscriptionGridProps {
  expires_at: any
  started_at: any
  remaining_tokens: number
  token_quota: number
  daysRemaining: number
  subscription: any
  daysTotal: number
}

export default function SubscriptionGrid({
  expires_at,
  started_at,
  remaining_tokens,
  token_quota,
  daysRemaining,
  subscription,
  daysTotal,
}: SubscriptionGridProps) {
  const daysPercent = daysRemaining / daysTotal
  const tokensPercent = remaining_tokens / token_quota

  const started = new Date(started_at)
  const expires = new Date(expires_at)
  const diffDays = Math.ceil((expires.getTime() - started.getTime()) / (1000 * 60 * 60 * 24))

  let planType = "مشخص نشده"
  if (!subscription) {
    planType = "سازمانی"
  } else if (diffDays <= 31) {
    planType = "یک ماهه"
  } else if (diffDays <= 183) {
    planType = "شش ماهه"
  } else if (diffDays <= 366) {
    planType = "یک ساله"
  }

  const RADIUS = 40
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  return (
    <div className="grid grid-cols-2 gap-4 w-full mt-4 text-xl md:text-2xl">
      {/* دایره روزها */}
      <div className="relative bg-black/35 dark:bg-black/55 w-full aspect-square rounded-4xl flex items-center justify-center">
        <div className="relative ml-10 mb-10">
          <svg className="size-24 md:size-36 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              stroke="#3730a3"
              strokeWidth="8"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={RADIUS}
              stroke="#4f46e5"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeLinecap="round"
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - daysPercent) }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <motion.div
            className="absolute inset-0 flex items-center justify-center font-semibold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {toPersianNumber((daysPercent * 100).toFixed(1))}٪
          </motion.div>
        </div>

        <motion.div
          className="absolute inset-0 flex items-end justify-end font-semibold p-5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-end gap-x-0.5 mb-0.5">
            <span className="text-xs">{toPersianNumber(daysRemaining)}</span>
            <span className="-mb-1">/</span>
            <span className="-mb-1">{toPersianNumber(daysTotal)}</span>
          </div>
          <span className="pr-1">روز</span>
        </motion.div>
      </div>

      {/* دایره توکن */}
      <div className="relative bg-black/35 dark:bg-black/55 w-full aspect-square rounded-4xl flex items-center justify-center">
        <div className="relative ml-10 mb-10">
          <svg className="size-24 md:size-36 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              stroke="#166534"
              strokeWidth="8"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={RADIUS}
              stroke="#16a34a"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeLinecap="round"
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - tokensPercent) }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <motion.div
            className="absolute inset-0 flex items-center justify-center font-semibold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {toPersianNumber((tokensPercent * 100).toFixed(1))}٪
          </motion.div>
        </div>

        <motion.div
          className="absolute inset-0 flex items-end justify-end gap-x-1.5 p-5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-xs flex gap-x-0.5 mb-1.5">
            <span>{toPersianNumber(remaining_tokens)}</span>
            <span className="font-bold">/</span>
            <span>{toPersianNumber(token_quota)}</span>
          </div>
          <span className="font-semibold">توکن</span>
        </motion.div>
      </div>

      {/* اطلاعات انقضا */}
      <div className="relative bg-black/35 dark:bg-black/55 w-full min-h-32 p-5 rounded-4xl col-span-2 flex flex-col items-center justify-center font-medium text-lg">
        <motion.div
          className="mx-auto text-center my-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-sm text-shadow-xl mb-14">
            نوع پلن شما: <span className="text-2xl md:text-3xl font-black">{planType}</span>
          </p>

          <p className="text-xs md:text-sm text-shadow-xl mb-2">
            اشتراک شما از{" "}
            <span className="font-medium">
              {new Date(started).toLocaleString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>{" "}
            تا{" "}
            <span className="font-medium">
              {new Date(expires).toLocaleString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>{" "}
            فعال است.
          </p>
        </motion.div>
      </div>
    </div>
  )
}