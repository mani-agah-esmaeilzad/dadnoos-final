'use client'

import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion"

import Image from "next/image"
import Link from "next/link"

import { usePathname, useRouter } from "next/navigation"

import { useEffect, useState } from "react"

import { ArrowLeft, Loader2, ReceiptText } from "lucide-react"

import backgroundImage from "@/public/eso9903c.jpg"

import { cn } from "@/app/_lib/utils"
import { apiService, PaymentRecord } from '@/app/_lib/services/api'
import { useUserStore } from "@/app/_lib/hooks/store"

import { Button } from "@/app/_ui/components/button"
import SubscriptionGrid from "@/app/_ui/pricing/SubscriptionGrid"

const PAYMENT_STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  SUCCEEDED: { label: 'موفق', className: 'bg-emerald-100 text-emerald-700' },
  PENDING: { label: 'در انتظار', className: 'bg-amber-100 text-amber-700' },
  FAILED: { label: 'ناموفق', className: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'بازپرداخت شده', className: 'bg-neutral-200 text-neutral-700' },
}

const formatHistoryDate = (value: string) => {
  try {
    return new Date(value).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

const formatAmount = (value: number) =>
  `${new Intl.NumberFormat('fa-IR').format(Math.max(0, Math.round(value)))} تومان`

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
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)

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
      setPaymentsLoading(true)
      const userInfo = await apiService.getCurrentUser()
      updateUser({ id: userInfo.id, name: userInfo.username })

      const billingPromise = apiService.getBilling()
      const paymentsPromise = apiService.getPayments()

      const billing = await billingPromise
      let paymentResp: { payments: PaymentRecord[] } = { payments: [] }
      try {
        paymentResp = await paymentsPromise
        setPaymentsError(null)
      } catch (paymentError) {
        console.error("Failed to load payments:", paymentError)
        setPaymentsError("بازیابی تاریخچه پرداخت ناموفق بود.")
      }
      if (billing.has_subscription && billing.subscription) {
        setSubscription(billing.subscription)
      } else {
        setSubscription(null)
      }
      setPayments(paymentResp.payments ?? [])
      setPaymentsError(null)
    } catch (error) {
      console.error("Authentication or billing fetch failed:", error)
    } finally {
      setLoading(false)
      setPaymentsLoading(false)
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
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto flex flex-col items-center justify-between bg-black text-white ">
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
            className="relative bg-neutral-200/25 dark:bg-neutral-800/75 backdrop-blur-md w-full max-w-xl rounded-4xl p-6 flex flex-col items-center gap-6 shadow-lg min-h-[65vh] pb-24 mb-16"
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

                <div className="w-full rounded-3xl border border-neutral-200/70 dark:border-neutral-700/60 bg-white/80 dark:bg-neutral-900/40 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-100">
                      <ReceiptText className="size-5 text-[#9b956d]" />
                      <h2 className="text-lg font-semibold">تاریخچه پرداخت</h2>
                    </div>
                    {paymentsLoading && <Loader2 className="size-4 animate-spin text-neutral-500" />}
                  </div>

                  {paymentsError && (
                    <p className="text-sm text-red-600">{paymentsError}</p>
                  )}

                  {!paymentsLoading && !paymentsError && payments.length === 0 && (
                    <p className="text-sm text-neutral-500">تاکنون پرداختی برای این حساب ثبت نشده است.</p>
                  )}

                  {!paymentsLoading && payments.length > 0 && (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {payments.slice(0, 5).map((payment) => {
                        const statusInfo =
                          PAYMENT_STATUS_MAP[payment.status] ||
                          PAYMENT_STATUS_MAP.SUCCEEDED
                        return (
                        <div
                          key={payment.id}
                          className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/80 dark:bg-neutral-900/40 p-3 text-right space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                            <span>{payment.plan_title ?? 'پلن اختصاصی'}</span>
                            <span>{formatAmount(payment.net_amount)}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                            <span>{formatHistoryDate(payment.created_at)}</span>
                            {payment.discount_code && (
                              <span className="rounded-full bg-neutral-200/70 dark:bg-neutral-800/40 px-2 py-0.5">
                                کد تخفیف: {payment.discount_code}
                              </span>
                            )}
                            {payment.upgrade_from_subscription_id && (
                              <span className="rounded-full bg-emerald-100/70 text-emerald-700 px-2 py-0.5">
                                ارتقا از پلن قبلی
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span
                              className={cn(
                                'px-3 py-1 rounded-full font-semibold',
                                statusInfo.className
                              )}
                            >
                              {statusInfo.label}
                            </span>
                            <span className="text-neutral-500 dark:text-neutral-300">
                              مبلغ ناخالص: {formatAmount(payment.gross_amount)}
                              {payment.discount_amount > 0 && (
                                <> • تخفیف: {formatAmount(payment.discount_amount)}</>
                              )}
                            </span>
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-auto grid text-center w-full mb-12">
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
