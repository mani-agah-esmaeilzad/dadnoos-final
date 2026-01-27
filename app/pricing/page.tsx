'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/app/_lib/utils"

import * as texts from '@/app/_text/common.js'

import Image from "next/image"
import sectionImage from '@/public/pricing.svg'

import { AnimatePresence, motion } from "framer-motion"

import { OrgSubscriptionDialog } from "@/app/_ui/pricing/showOrgForm"

import BackButton from "@/app/_ui/back-button"
import Link from "next/link"

const plans = [
  {
    key: "monthly",
    name: "یک ماهه",
    price: 385000,
    buttonText: "خرید",
    features: [
      "دسترسی به تمامی امکانات پایه",
      "پشتیبانی ایمیلی",
      "امنیت استاندارد",
      "گزارش تراکنش‌ها",
      "پشتیبانی از ارزهای رایج",
    ],
  },
  {
    key: "semiannual",
    name: "شش ماهه",
    price: 1850000,
    discount: 20,
    buttonText: "خرید",
    features: [
      "دسترسی به تمامی امکانات پیشرفته",
      "پشتیبانی اولویت‌دار",
      "امنیت پیشرفته",
      "گزارش کامل تراکنش‌ها با قابلیت خروجی",
      "پشتیبانی از همه ارزهای محبوب",
    ],
  },
  {
    key: "yearly",
    name: "یک ساله",
    price: 2750000,
    discount: 40,
    buttonText: "خرید",
    features: [
      "دسترسی به تمامی امکانات ویژه",
      "پشتیبانی VIP",
      "امنیت حداکثری",
      "گزارشات پیشرفته و تحلیلی",
      "بهترین صرفه‌جویی مالی",
    ],
  },
  {
    key: "org",
    name: "سازمانی",
    buttonText: "ارسال درخواست",
    features: [
      "امکانات سفارشی متناسب با نیاز سازمان",
      "پشتیبانی اختصاصی 24/7",
      "امنیت و دسترسی ویژه",
      "گزارشات تحلیلی کامل",
      "مدیریت چندکاربره و دسترسی‌ها",
    ],
  },
]

export default function Pricing() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState(plans[0])
  const [showOrgForm, setShowOrgForm] = useState(false)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fa-IR').format(price)

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="pricing-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .25, ease: "easeIn" }}
          className="flex flex-col items-center justify-between px-4 pb-8 pt-4 md:pt-8 mt-safe md:min-h-screen"
        >
          <div className="absolute top-2 left-2 md:top-8 md:left-10 mt-safe">
            <BackButton />
          </div>

          <div className="absolute size-12 md:size-16 p-2 top-2.5 right-1 md:top-8 md:right-10 mt-safe">
            <Link href="/" className="w-8 aspect-square">
              <Image
                className="size-full scale-100 hover:scale-105 active:scale-95 transition-transform"
                src="/logo.png"
                alt={`${texts.websiteName} logo`}
                width={180}
                height={38}
                priority
              />
            </Link>
          </div>

          <h1 className="text-3xl md:text-6xl font-black mb-5">خرید اشتراک</h1>

          <Image
            width={1000}
            height={500}
            className="md:absolute object-cover w-full aspect-[5/4] max-w-xl h-auto mb-8 mt-0 md:mt-20"
            src={sectionImage}
            priority
            alt=""
          />

          {/* Desktop: Grid of Cards */}
          <div className="hidden sm:grid grid-cols-4 gap-2 lg:gap-8 w-full max-w-6xl mb-20 transition-all">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className="relative bg-neutral-700/10 dark:bg-neutral-700/50 backdrop-blur-2xl rounded-2xl p-6 flex flex-col justify-between shadow-lg"
              >
                {/* Badge تخفیف */}
                {plan.discount && (
                  <span className="absolute -top-3 right-3 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow">
                    {plan.discount}٪ تخفیف
                  </span>
                )}

                <div className="mb-10 h-16">
                  <h2 className="text-xl font-black">{plan.name}</h2>
                  {plan.price && (
                    <p className="text-3xl font-bold mt-2">
                      {formatPrice(plan.price)}
                      <span className="text-base font-normal"> / تومان</span>
                    </p>
                  )}
                </div>

                <ul className="flex-1 mb-10 space-y-2 text-sm">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <span className="text-green-500">✔</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.key === "org" ? (
                  <button
                    onClick={() => setShowOrgForm(true)}
                    className="mt-auto bg-[#9b956d] text-white font-semibold py-2 rounded-xl hover:bg-[#9b956d]/75 active:bg-[#9b956d]/75 transition-colors cursor-pointer"
                  >
                    ارسال درخواست
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/pricing/${plan.key}`)}
                    className="mt-auto bg-black text-white font-semibold py-2 rounded-xl hover:bg-black/25 transition-colors cursor-pointer"
                  >
                    {plan.buttonText}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: Radio Buttons */}
          <div className="sm:hidden w-full max-w-md mb-20">
            <div className="space-y-3">
              {plans.map((plan) => (
                <label
                  key={plan.key}
                  className={cn(
                    "relative block border rounded-2xl p-4 cursor-pointer transition-colors",
                    selectedPlan.key === plan.key
                      ? "border-neutral-500 bg-neutral-400/25"
                      : "border-neutral-400/50"
                  )}
                >
                  {/* Badge تخفیف */}
                  {plan.discount && (
                    <span className="absolute -top-2 -left-3 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full shadow">
                      {plan.discount}٪ تخفیف
                    </span>
                  )}
                  <input
                    type="radio"
                    name="plan"
                    value={plan.key}
                    className="hidden"
                    checked={selectedPlan.key === plan.key}
                    onChange={() => setSelectedPlan(plan)}
                  />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{plan.name}</span>
                    {plan.price ? (
                      <span className="text-md">{formatPrice(plan.price)} تومان</span>
                    ) : (
                      <span className="text-md">{plan.buttonText}</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Fixed Mobile Pay Button */}
          <div className="sm:hidden fixed bottom-0 w-full max-w-2xl mx-auto px-4 mb-safe">
            {selectedPlan.key === "org" ? (
              <button
                className="w-full bg-[#9b956d] text-white font-bold py-3 rounded-full shadow-md hover:bg-[#9b956d]/75 active:bg-[#9b956d]/75 transition-colors"
                onClick={() => setShowOrgForm(true)}
              >
                ارسال درخواست سازمانی
              </button>
            ) : (
              <button
                onClick={() => router.push(`/pricing/${selectedPlan.key}`)}
                className="w-full bg-[#9b956d] text-white font-bold py-3 rounded-full shadow-md hover:bg-[#9b956d]/75 active:bg-[#9b956d]/75 transition-colors"
              >
                مشاهده اشتراک {selectedPlan.name}
              </button>
            )}
          </div>

        </motion.div>
      </AnimatePresence>

      {/* فرم سازمانی ساده */}
      <OrgSubscriptionDialog
        open={showOrgForm}
        onOpenChange={setShowOrgForm}
      />
    </>
  )
}