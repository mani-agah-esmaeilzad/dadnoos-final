'use client'

import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion"

import Image from "next/image"
import Link from "next/link"

import { usePathname, useRouter } from "next/navigation"

import { useEffect, useState } from "react"

import { ArrowLeft } from "lucide-react"

import backgroundImage from "@/public/eso9903c.jpg"

import { cn } from "@/app/_lib/utils"
import { apiService } from '@/app/_lib/services/api'
import { useUserStore } from "@/app/_lib/hooks/store"

import { Button } from "@/app/_ui/components/button"
import SubscriptionGrid from "@/app/_ui/pricing/SubscriptionGrid"

export default function SubscriptionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  const { updateUser, removeUser } = useUserStore()

  const [lastRefresh, setLastRefresh] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [lockPosition, setLockPosition] = useState(false)
  const [subscription, setSubscription] = useState<null | any>(null)

  const dragY = useMotionValue(0)
  const progress = useTransform(dragY, (v) => {
    if (v < 0) return 0
    if (v <= 50) return v / 50
    if (v <= 200) return 1
    if (lockPosition) return 0
    return 0
  })

  const circleLength = 2 * Math.PI * 16
  const strokeOffset = useTransform(progress, p => circleLength * (1 - p))

  const loadSubscription = async () => {
    try {
      setLoading(true)
      const userInfo = await apiService.getCurrentUser()
      updateUser({ id: userInfo.id, name: userInfo.username })

      const billing = await apiService.getBilling()
      if (billing.has_subscription && billing.subscription) {
        setSubscription(billing.subscription)
      } else {
        setSubscription(null)
      }
    } catch (error) {
      console.error("Authentication or billing fetch failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshContent = async () => {
    const now = Date.now()
    const diff = now - lastRefresh
    const minInterval = 60 * 1000

    if (diff < minInterval) {
      const remaining = Math.ceil((minInterval - diff) / 1000)
      setSecondsLeft(remaining)
      setShowMessage(true)
      return
    }

    setRefreshing(true)
    await loadSubscription()
      .finally(() =>
        setRefreshing(false)
      )
    setLastRefresh(Date.now())
  }

  useEffect(() => {
    if (!refreshing) {
      setLockPosition(true)

      const timer = setTimeout(() => {
        setLockPosition(false)
      }, 2000)

      return () => clearTimeout(timer)
    } else {
      setLockPosition(true)
    }
  }, [refreshing])

  useEffect(() => {
    loadSubscription()
  }, [pathname, removeUser, router, updateUser])

  useEffect(() => {
    if (!showMessage || secondsLeft <= 0) return

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setShowMessage(false)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showMessage, secondsLeft])

  const { remaining_tokens = 0, token_quota = 0, expires_at = '', started_at = '' } = subscription || {}

  const daysTotal = Math.ceil((new Date(expires_at).getTime() - new Date(started_at).getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.ceil((new Date(expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="relative h-screen overflow-hidden flex flex-col items-center justify-between bg-black text-white ">
      <Image
        className={cn(
          loading && "animate-pulse",
          "absolute object-contain object-top size-full p-10 -mt-5 md:-mt-12 ms-10 max-w-lg"
        )}
        src={backgroundImage}
        height={2500}
        width={2500}
        priority
        alt=""
      />

      <div className="absolute top-1 left-1 md:top-8 md:left-10 mt-safe z-40">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-0 size-12 flex items-center justify-center rounded-full bg-black/10 backdrop-blur-sm"
        >
          <ArrowLeft className="size-6" />
        </Button>
      </div>

      <div className="absolute size-12 md:size-16 p-2 top-1 right-1 md:top-8 md:right-10 mt-safe">
        <Image
          className="size-full"
          src="/logo-white.png"
          alt={`logo`}
          width={180}
          height={38}
          priority
        />
      </div>

      <h1 className="text-3xl md:text-6xl font-black mb-5 pt-3 md:pt-8 z-40 mt-safe">اشتراک شما</h1>

      <motion.div className="fixed top-32 h-10 mt-safe md:mt-16">
        <svg viewBox="0 0 36 36" className="h-8 w-full">
          <motion.circle
            cx="18"
            cy="18"
            r="16"
            stroke="#C8A276"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circleLength}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            style={{ rotate: -90, originX: '50%', originY: '50%' }}
          />
        </svg>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-[#C8A276] font-bold text-shadow-md text-sm text-center mt-5"
        >
          {showMessage && `لطفاً بعد از ${secondsLeft} ثانیه تلاش کنید.`}
        </motion.p>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-0 mb-36 z-10"
          >
            <p className="mt-6 text-2xl relative ellipsis after:content-['.'] after:animate-ellipsis after:ml-1 mr-7">
              درحال بارگزاری {' '}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="subscription"
            className="relative bg-neutral-200/25 dark:bg-neutral-800/75 backdrop-blur-md w-full max-w-xl rounded-4xl p-6 flex flex-col items-center gap-6 shadow-lg h-screen pb-36 -mb-72"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 30
            }}
            drag="y"
            dragElastic={.15}
            style={{ y: dragY }}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_) => {
              const offsetY = dragY.get()

              if (offsetY > 50 && !refreshing) {
                refreshContent()
              }
            }}
          >
            <div className="absolute top-1.5 right-1/2 translate-1/2 h-1.5 w-[10%] rounded-full bg-neutral-400 dark:bg-neutral-400/25 cursor-grab" />

            {subscription ? (
              <>
                <SubscriptionGrid
                  daysTotal={daysTotal}
                  expires_at={expires_at}
                  started_at={started_at}
                  token_quota={token_quota}
                  subscription={subscription}
                  daysRemaining={daysRemaining}
                  remaining_tokens={remaining_tokens}
                />

                <div className="mt-auto grid text-center w-full mb-44">
                  <Link
                    href="/pricing"
                    className="w-full bg-[#C8A276] text-white font-bold py-3 rounded-full shadow-xs hover:bg-[#C8A276]/75 active:bg-[#C8A276]/75 transition-colors"
                  >
                    تمدید اشتراک
                  </Link>
                </div>
              </>
            ) : (
              <div className="h-3/4 flex flex-col items-center justify-center">
                <p className="text-lg text-center text-shadow-sm">هیچ اشتراک فعالی پیدا نشد.</p>
                <Link href="/pricing" className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold mt-7 -mb-20">مشاهده پلن‌ها</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}