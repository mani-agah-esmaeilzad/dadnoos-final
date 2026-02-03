'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Info, Loader2, ShieldCheck, TicketPercent, Wallet } from 'lucide-react'

import BackButton from '@/app/_ui/back-button'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { apiService, ApiError, BillingResponse, SubscriptionPlan } from '@/app/_lib/services/api'
import * as texts from '@/app/_text/common.js'

const PLAN_METADATA: Record<
  string,
  {
    code: string
    label: string
    features: string[]
  }
> = {
  monthly: {
    code: 'PLAN_MONTHLY',
    label: 'اشتراک یک‌ماهه',
    features: ['فعال به‌مدت ۳۰ روز', 'سقف ۳۰۰ هزار توکن', 'پشتیبانی سریع'],
  },
  semiannual: {
    code: 'PLAN_SEMI_ANNUAL',
    label: 'اشتراک شش‌ماهه',
    features: ['اعتبار ۱۸۰ روزه', 'سقف ۱.۸ میلیون توکن', 'صرفه‌جویی ۲۰٪'],
  },
  yearly: {
    code: 'PLAN_YEARLY',
    label: 'اشتراک یک‌ساله',
    features: ['اعتبار ۳۶۵ روزه', '۳.۶ میلیون توکن', 'صرفه‌جویی ۴۰٪'],
  },
}

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat('fa-IR').format(Math.max(0, Math.round(value)))} تومان`

const formatDate = (value?: string | null) => {
  if (!value) return '-'
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

export default function PaymentPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan: planKey } = React.use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [planRecord, setPlanRecord] = useState<SubscriptionPlan | null>(null)
  const [billing, setBilling] = useState<BillingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const planMeta = PLAN_METADATA[planKey]

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)

        await apiService.getCurrentUser()
        const [plansResp, billingResp] = await Promise.all([
          apiService.getPlans(true),
          apiService.getBilling(),
        ])
        if (cancelled) return
        setBilling(billingResp)

        const desiredCode = planMeta?.code ?? planKey?.toUpperCase()
        const resolvedPlan =
          plansResp.plans.find((plan) => plan.code === desiredCode) ??
          plansResp.plans.find((plan) => plan.id === planKey)

        if (!resolvedPlan) {
          setPlanRecord(null)
          setError('پلن درخواستی یافت نشد. دوباره از صفحه قیمت‌گذاری تلاش کنید.')
        } else {
          setPlanRecord(resolvedPlan)
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.push('/auth')
          return
        }
        setError(err instanceof Error ? err.message : 'خطایی در بارگذاری اطلاعات رخ داد.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [planKey, planMeta?.code, router])

  const planTitle = planRecord?.title ?? planMeta?.label ?? 'پلن انتخابی'
  const planPrice = planRecord?.price_cents ?? 0

  const upgradeCredit = billing?.subscription?.plan_price_cents ?? 0
  const isDowngrade = Boolean(billing?.subscription && planPrice <= upgradeCredit)
  const amountDue = Math.max(planPrice - upgradeCredit, 0)

  const activePlanName =
    billing?.subscription?.plan_title ||
    billing?.subscription?.plan_code ||
    (billing?.has_subscription ? 'پلن فعلی' : null)

  const checkoutDisabled = loading || processing || !planRecord || isDowngrade

  const handlePurchase = async () => {
    if (!planRecord) return
    setProcessing(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await apiService.subscribePlan(
        planRecord.id,
        discountCode.trim() || undefined,
      )
      setSuccessMessage('اشتراک با موفقیت فعال شد. در حال انتقال به صفحه اشتراک...')
      router.push('/subscription')
      return response
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('خطای غیرمنتظره در فرایند خرید. لطفاً دوباره تلاش کنید.')
      }
    } finally {
      setProcessing(false)
    }
  }

  const nextStepLabel =
    amountDue === 0 ? 'تأیید و فعال‌سازی' : `پرداخت ${formatCurrency(amountDue)}`

  const helperMessage = useMemo(() => {
    if (isDowngrade && activePlanName) {
      return `شما هم‌اکنون در ${activePlanName} با قیمتی بالاتر یا برابر هستید. فقط ارتقا به پلن گران‌تر مجاز است.`
    }
    if (billing?.subscription && !isDowngrade) {
      return `با ارتقا از ${activePlanName ?? 'پلن فعلی'} مبلغ ${formatCurrency(
        upgradeCredit,
      )} به‌عنوان اعتبار از مبلغ کل کسر می‌شود.`
    }
    return null
  }, [isDowngrade, billing?.subscription, activePlanName, upgradeCredit])

  return (
    <div className="flex flex-col items-center justify-start min-h-screen mt-safe px-4 pb-10">
      <div className="absolute top-2 left-2 md:top-6 md:left-10 mt-safe">
        <BackButton />
      </div>
      <div className="absolute size-12 md:size-16 p-2 top-2 right-2 md:top-6 md:right-10 mt-safe">
        <Link href="/" className="block size-full">
          <Image
            className="size-full object-contain"
            src="/logo.png"
            alt={texts.websiteName}
            width={180}
            height={38}
            priority
          />
        </Link>
      </div>

      <div className="w-full max-w-3xl mt-24 space-y-6">
        <div className="rounded-4xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-900/40 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-neutral-500">پلن انتخابی</p>
              <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-neutral-50">
                {planTitle}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 mb-1">قیمت پایه</p>
              <p className="text-xl font-bold">{formatCurrency(planPrice)}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200/70 dark:border-neutral-800/60 p-4 bg-neutral-50/70 dark:bg-neutral-900/40">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                ویژگی‌های کلیدی
              </div>
              <ul className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 space-y-1 list-disc pr-3">
                {(planMeta?.features ?? ['دسترسی کامل به دادنوس']).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-neutral-200/70 dark:border-neutral-800/60 p-4 bg-neutral-50/70 dark:bg-neutral-900/40 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center justify-between">
                <span>اعتبار فعلی</span>
                <strong>{formatCurrency(upgradeCredit)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>مبلغ قابل پرداخت</span>
                <strong>{formatCurrency(amountDue)}</strong>
              </div>
              {billing?.subscription?.expires_at && (
                <div className="flex items-center justify-between">
                  <span>انقضای پلن فعلی</span>
                  <strong>{formatDate(billing.subscription.expires_at)}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/40 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
            <TicketPercent className="size-5 text-[#9b956d]" />
            <h2 className="text-lg font-semibold">کد تخفیف</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              value={discountCode}
              onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
              placeholder="مثال: DADNOOS25"
              className="text-sm uppercase"
              disabled={processing}
            />
            <Button
              type="button"
              onClick={handlePurchase}
              disabled={checkoutDisabled}
              className="w-full md:w-auto whitespace-nowrap"
            >
              {processing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Wallet className="size-4 ml-2" />
                  {nextStepLabel}
                </>
              )}
            </Button>
          </div>
          {helperMessage && (
            <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-900/20 text-amber-800 dark:text-amber-100 text-xs p-3 flex items-center gap-2">
              <Info className="size-4" />
              <span>{helperMessage}</span>
            </div>
          )}
          {error && (
            <div className="rounded-2xl bg-red-50 text-red-700 text-sm p-3">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-2xl bg-emerald-50 text-emerald-700 text-sm p-3 flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        <div className="rounded-4xl border border-dashed border-neutral-300/70 dark:border-neutral-700/70 bg-white/60 dark:bg-neutral-900/30 p-4 text-xs text-neutral-600 dark:text-neutral-300">
          <p className="mb-1 font-semibold">یادآوری:</p>
          <p>
            با فشردن دکمه پرداخت، اشتراک جدید بلافاصله فعال شده و اعتبار باقی‌مانده پلن فعلی
            (در صورت وجود) به‌طور خودکار از مبلغ کل کسر می‌شود. در صورت بروز مشکل با پشتیبانی
            تماس بگیرید.
          </p>
        </div>
      </div>
    </div>
  )
}
