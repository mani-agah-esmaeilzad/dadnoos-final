'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"

import BackButton from "@/app/_ui/back-button"
import { OrgSubscriptionDialog } from "@/app/_ui/pricing/showOrgForm"
import { PLANS } from '@/app/pricing/plans'

import { cn } from "@/app/_lib/utils"
import * as texts from '@/app/_text/common.js'

import sectionImage from '@/public/pricing.svg'

const TABS = [
  { key: 'basic', label: 'پایه' },
  { key: 'plus', label: 'پلاس' },
  { key: 'pro', label: 'پرو' },
] as const

type TabKey = typeof TABS[number]['key']

export default function Pricing() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('plus')
  const [showOrgForm, setShowOrgForm] = useState(false)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fa-IR').format(price)

  const handlePurchase = (tab: TabKey, planKey: string) => {
    router.push(`/payment/${tab}/${planKey}`)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: .25 }}
        className="flex flex-col items-center px-4 pb-24 pt-20 md:pt-8 h-screen overflow-y-auto md:overflow-hidden"
      >
        <div className="fixed top-0 md:p-4 w-full pt-safe p-2 flex flex-row-reverse items-center justify-between z-40 bg-background">
          <BackButton />

          <h1 className="text-3xl md:text-5xl font-black">خرید اشتراک</h1>

          <div className="size-12 md:size-16 p-2">
            <Link href="/">
              <Image
                src="/logo.png"
                alt={`${texts.websiteName} logo`}
                width={180}
                height={38}
                priority
              />
            </Link>
          </div>

          <div className="absolute inset-x-0 bg-gradient-to-b from-background -bottom-4 h-4 w-full" />
        </div>

        {/* Sticky Tabs */}
        <div className="sticky -top-safe-10 top-0 md:top-20 z-30 w-full max-w-md mb-safe-30 mb-4 md:mb-32 md:mt-4">
          <div className="flex gap-1 p-1 rounded-full bg-neutral-200/85 dark:bg-neutral-400/25 backdrop-blur-md">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 py-2.5 text-sm font-bold rounded-full transition",
                  activeTab === tab.key
                    ? "bg-[#9b956d] text-white"
                    : "text-neutral-500 dark:text-neutral-500 lg:hover:bg-neutral-400/20 active:bg-neutral-400/20 cursor-pointer"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <Image
          width={1000}
          height={500}
          className="absolute object-cover w-full aspect-[5/3] max-w-xl h-auto mb-8 mt-44"
          src={sectionImage}
          priority
          alt=""
        />

        {/* Plans */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: .3, ease: "easeOut" }}
            className="w-full max-w-7xl mb-20 md:mt-10"
          >
            {/* Desktop Grid */}
            <div className="hidden sm:grid grid-cols-4 gap-2 lg:gap-10 w-full transition-all">
              {PLANS[activeTab].map(plan => (
                <div
                  key={plan.key}
                  className="relative bg-neutral-700/10 dark:bg-neutral-700/50 rounded-2xl p-6 flex flex-col justify-between shadow-lg"
                >
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
                      onClick={() => handlePurchase(activeTab, plan.key)}
                      className="mt-auto bg-black text-white font-semibold py-2 rounded-xl hover:bg-black/25 transition-colors cursor-pointer"
                    >
                      {plan.buttonText}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Vertical Stack */}
            <div className="sm:hidden flex flex-col gap-6 w-full">
              {PLANS[activeTab].map(plan => (
                <div
                  key={plan.key}
                  className="relative bg-neutral-700/10 dark:bg-neutral-700/50 backdrop-blur-2xl rounded-4xl p-6 flex flex-col justify-between shadow-lg"
                >
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
                      className="mt-auto bg-[#9b956d] text-white font-semibold py-2 rounded-3xl hover:bg-[#9b956d]/75 active:bg-[#9b956d]/75 transition-colors cursor-pointer"
                    >
                      ارسال درخواست
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(activeTab, plan.key)}
                      className="mt-auto bg-black text-white font-semibold py-2 rounded-3xl hover:bg-black/25 active:bg-black/25 transition-colors cursor-pointer"
                    >
                      خرید
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <OrgSubscriptionDialog
        open={showOrgForm}
        onOpenChange={setShowOrgForm}
      />
    </>
  )
}