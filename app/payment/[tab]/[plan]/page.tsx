'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Info, Loader2, ShieldCheck, TicketPercent, Wallet } from 'lucide-react'

import BackButton from '@/app/_ui/back-button'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { apiService, ApiError, BillingResponse, SubscriptionPlan } from '@/app/_lib/services/api'
import { PLANS, PlanKey, TabKey, Plan } from '@/app/pricing/plans'
import * as texts from '@/app/_text/common.js'

// Skeleton Loader
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-300 dark:bg-neutral-700 rounded-2xl ${className ?? 'h-4 w-full'}`} />
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

export default function PaymentPage({ params }: { params: Promise<{ tab: TabKey; plan: PlanKey }> }) {
  const { tab, plan } = React.use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [planRecord, setPlanRecord] = useState<SubscriptionPlan | null>(null)
  const [billing, setBilling] = useState<BillingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // دریافت پلن از تب مربوطه
  const planMeta: Plan | undefined = PLANS[tab]?.find(p => p.key === plan)

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

        const desiredCode = planMeta?.code ?? plan.toUpperCase()
        const resolvedPlan =
          plansResp.plans.find((p) => p.code === desiredCode) ??
          plansResp.plans.find((p) => p.id === plan)

        if (!resolvedPlan) {
          if (planMeta?.code) {
            const fallbackDuration =
              plan === 'semiannual' ? 180 : plan === 'yearly' ? 365 : 30
            setPlanRecord({
              id: planMeta.code,
              code: planMeta.code,
              title: planMeta.name,
              duration_days: fallbackDuration,
              token_quota: 0,
              message_quota: 0,
              is_organizational: false,
              price_cents: planMeta.price ?? 0,
            })
          } else {
            setPlanRecord(null)
            setError('پلن درخواستی یافت نشد. دوباره از صفحه قیمت‌گذاری تلاش کنید.')
          }
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
    return () => { cancelled = true }
  }, [tab, plan, planMeta?.code, router])

  const planTitle = planRecord?.title ?? planMeta?.name ?? 'پلن انتخابی'
  const planPrice = planRecord?.price_cents ?? planMeta?.price ?? 0
  const currentPlanPrice = billing?.subscription?.plan_price_cents ?? 0
  const messageQuota = billing?.subscription?.message_quota ?? 0
  const messagesUsed = billing?.subscription?.messages_used ?? 0
  const remainingMessages = messageQuota > 0 ? Math.max(messageQuota - messagesUsed, 0) : 0
  const fallbackMessageCredit =
    messageQuota > 0 ? Math.round(currentPlanPrice * (remainingMessages / messageQuota)) : currentPlanPrice
  const upgradeCredit = billing?.subscription?.upgrade_credit_cents ?? fallbackMessageCredit ?? 0
  const isDowngrade = Boolean(billing?.subscription && planPrice <= currentPlanPrice)
  const amountDue = Math.max(planPrice - upgradeCredit, 0)
  const activePlanName = billing?.subscription?.plan_title ?? billing?.subscription?.plan_code ?? (billing?.has_subscription ? 'پلن فعلی' : null)
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
      if (err instanceof ApiError) setError(err.message)
      else setError('خطای غیرمنتظره در فرایند خرید. لطفاً دوباره تلاش کنید.')
    } finally {
      setProcessing(false)
    }
  }

  const nextStepLabel = amountDue === 0 ? 'تأیید و فعال‌سازی' : `پرداخت ${formatCurrency(amountDue)}`

  const helperMessage = useMemo(() => {
    if (isDowngrade && activePlanName) return `شما هم‌اکنون در ${activePlanName} با قیمتی بالاتر یا برابر هستید. فقط ارتقا به پلن گران‌تر مجاز است.`
    if (billing?.subscription && !isDowngrade) return `اعتبار ارتقا بر اساس پیام‌های مصرف‌شده محاسبه شده و مبلغ ${formatCurrency(upgradeCredit)} از قیمت کسر می‌شود.`
    return null
  }, [isDowngrade, billing?.subscription, activePlanName, upgradeCredit])

  return (
    <div className="flex flex-col items-center justify-start mt-safe px-4 pb-10">
      {/* Header */}
      <div className="fixed top-0 md:p-4 w-full pt-safe p-2 flex flex-row-reverse items-center justify-between z-40 bg-background">
        <BackButton />
        {loading ? <Skeleton className="h-8 w-64" /> : <h1 className="text-2xl md:text-5xl font-black">{planTitle}</h1>}
        <div className="size-12 md:size-16 p-2">
          <Link href="/"><Image src="/logo.png" alt={`${texts.websiteName} logo`} width={180} height={38} priority /></Link>
        </div>
      </div>

      <div className="w-full max-w-3xl mt-24 space-y-6">
        {/* Plan Card */}
        <div className="rounded-4xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-900/40 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-4">
            {loading ? <Skeleton className="h-6 w-32" /> : <div className="text-right"><p className="text-xs text-neutral-500 mb-1">قیمت پایه</p><p className="text-xl font-bold">{formatCurrency(planPrice)}</p></div>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200/70 dark:border-neutral-800/60 p-4 bg-neutral-50/70 dark:bg-neutral-900/40">
              <div className="flex items-center gap-2 font-semibold mb-2"><ShieldCheck className="size-4 text-emerald-500" />ویژگی‌های کلیدی</div>
              {loading ? (
                <div className="space-y-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /><Skeleton className="h-3 w-4/6" /></div>
              ) : (
                <ul className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 space-y-1 list-disc pr-3">{(planMeta?.features ?? ['دسترسی کامل به دادنوس']).map((item, idx) => <li key={idx}>{item}</li>)}</ul>
              )}
            </div>
            <div className="rounded-3xl border border-neutral-200/70 dark:border-neutral-800/60 p-4 bg-neutral-50/70 dark:bg-neutral-900/40 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
              {loading ? <><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-1/2" /></> : <>
                <div className="flex items-center justify-between"><span>اعتبار ارتقا (بر اساس پیام)</span><strong>{formatCurrency(upgradeCredit)}</strong></div>
                <div className="flex items-center justify-between"><span>مبلغ قابل پرداخت</span><strong>{formatCurrency(amountDue)}</strong></div>
                {billing?.subscription?.expires_at && <div className="flex items-center justify-between"><span>انقضای پلن فعلی</span><strong>{formatDate(billing.subscription.expires_at)}</strong></div>}
              </>}
            </div>
          </div>
        </div>

        {/* Discount & Purchase */}
        <div className="rounded-4xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/40 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200"><TicketPercent className="size-5 text-[#9b956d]" /><h2 className="text-lg font-semibold">کد تخفیف</h2></div>
          <div className="flex flex-col md:flex-row gap-3">
            <Input value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} placeholder="مثال: DADNOOS25" className="text-sm uppercase" disabled={processing || loading} />
            <Button type="button" onClick={handlePurchase} disabled={checkoutDisabled} className="w-full md:w-auto whitespace-nowrap">
              {processing ? <Loader2 className="size-4 animate-spin" /> : <><Wallet className="size-4 ml-2" />{nextStepLabel}</>}
            </Button>
          </div>
          {helperMessage && <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-900/20 text-amber-800 dark:text-amber-100 text-xs p-3 flex items-center gap-2"><Info className="size-4" /><span>{helperMessage}</span></div>}
          {error && <div className="rounded-2xl bg-red-50 text-red-700 text-sm p-3">{error}</div>}
          {successMessage && <div className="rounded-2xl bg-emerald-50 text-emerald-700 text-sm p-3 flex items-center gap-2"><CheckCircle2 className="size-4" /><span>{successMessage}</span></div>}
        </div>
      </div>
    </div>
  )
}
