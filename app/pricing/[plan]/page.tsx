"use client"

import Image from "next/image"
import { notFound } from "next/navigation"
import { useRouter } from "next/navigation"

import React from "react"

import BackButton from "@/app/_ui/back-button"

import * as texts from '@/app/_text/common.js'

import { motion } from "framer-motion"
import { cn, toPersianNumber } from "@/app/_lib/utils"

type PlanDetail = {
  name: string
  price: number | null
  description: string
}

const planDetails: Record<string, PlanDetail> = {
  monthly: {
    name: "یک‌ماهه",
    price: 385000,
    description: `
      اشتراک یک‌ماهه دادنوس از تاریخ خرید فعال شده و به مدت ۳۰ روز معتبر است.  

      سقف مصرف در این دوره ۳۰۰,۰۰۰ توکن می‌باشد. این میزان برای استفاده یک نفر و به‌طور میانگین پاسخ‌گویی به حدود ۴۰ سؤال در روز کاملاً کافی است.  

      در صورتی که کاربر پیش از پایان دوره، توکن‌های خود را مصرف کند، برای ادامه استفاده لازم است اشتراک جدیدی خریداری نماید.  

      با هر خرید جدید، دوره استفاده از تاریخ پرداخت مجدداً آغاز می‌شود.`
  },
  semiannual: {
    name: "شش‌ماهه",
    price: 1850000,
    description: `
      اشتراک شش‌ماهه دادنوس گزینه‌ای اقتصادی برای کاربران حرفه‌ای است.  

      این اشتراک از زمان خرید فعال شده و تا ۱۸۰ روز (شش ماه) اعتبار دارد.  

      مجموع سقف مصرف در این دوره ۱,۸۰۰,۰۰۰ توکن است که برای یک نفر و به‌طور میانگین ۴۰ سؤال در روز کفایت می‌کند.  

      در صورت مصرف کامل توکن‌ها پیش از پایان دوره، کاربر می‌تواند با خرید اشتراک جدید، دسترسی خود را ادامه دهد.  

      دوره اشتراک با هر پرداخت از تاریخ جدید محاسبه می‌شود.`
  },
  yearly: {
    name: "یک‌ساله",
    price: 2750000,
    description: `
      اشتراک یک‌ساله دادنوس مناسب کاربران سازمانی و حرفه‌ای است که به استفاده مداوم نیاز دارند.  

      مدت اعتبار این اشتراک ۳۶۵ روز (یک سال) از تاریخ خرید است و مجموع سقف مصرف در این دوره ۳,۶۰۰,۰۰۰ توکن تعیین شده است.  

      این میزان برای استفاده یک نفر و به‌طور میانگین ۴۰ سؤال در روز کاملاً کافی می‌باشد.  

      در صورت اتمام توکن پیش از پایان دوره، کاربر می‌تواند با خرید اشتراک جدید، دسترسی خود را بدون وقفه ادامه دهد.  

      با هر خرید جدید، دوره اشتراک از تاریخ پرداخت مجدداً آغاز می‌شود.`
  },
  org: {
    name: "سازمانی",
    price: null,
    description: `این پلن ویژه سازمان‌ها طراحی شده است و شامل امکانات سفارشی، پشتیبانی اختصاصی ۲۴/۷ و مدیریت چندکاربره می‌باشد.
      برای دریافت شرایط و قیمت دقیق، لطفاً با تیم پشتیبانی تماس بگیرید.`
  }
}

export default function PlanPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan: planKey } = React.use(params)
  const plan = planDetails[planKey]

  const router = useRouter()

  if (!plan) return notFound()

  const descriptionItems: string[] = plan.description
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0)

  const handleCheckout = () => {
    router.push(`/payment/${planKey}`)
  }

  return (
    <div className="flex flex-col items-center justify-center pt-4 md:pt-8 overflow-x-hidden mt-safe md:min-h-screen">
      <div className="absolute top-2 left-2 md:top-8 md:left-10 mt-safe">
        <BackButton />
      </div>

      <div className="absolute size-12 md:size-16 p-2 top-2.5 right-1 md:top-8 md:right-10 mt-safe">
        <Image
          className="size-full"
          src="/logo.png"
          alt={`${texts.websiteName} logo`}
          width={180}
          height={38}
          priority
        />
      </div>

      <h1 className="text-xl md:text-6xl font-black mb-5 mt-0.5">اشتراک {plan.name}</h1>

      <div className="overflow-y-auto h-[83.9vh] mt-auto no-scrollbar">
        <motion.div
          initial={{ x: "65%" }}
          animate={{ x: 40 }}
          exit={{ x: "65%" }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="relative flex items-end w-full z-10 -mt-10 md:mt-5"
        >
          <div className="h-20 w-2/3 ps-5 border-4 border-[#9b956d] border-b-white dark:border-b-black me-auto mt-safe  border-t-0 border-s-0 flex items-center justify-center z-10">
            {/* <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: .3, duration: .3 } }}
            exit={{ opacity: 0 }}
            className="text-xl md:text-3xl font-black text-white"
          >اشتراک {plan.name}
          </motion.h2> */}
          </div>
          <div className="absolute bottom-0 left-1/3 flex -me-10">
            <div className="relative size-10 me-1">
              <div className="absolute border-4 size-full border-t-0 border-l-0 border-white dark:border-black z-10" />
              <div className="absolute border-4 size-full border-t-0 border-l-0 border-[#9b956d] rounded-es-full z-20" />
            </div>
          </div>
        </motion.div>

        <div className="my-auto mx-auto max-w-xl px-4">
          <div className="relative -space-y-1 leading-relaxed p-16 pt-0 -mt-1">

            {descriptionItems.map((item: string, idx: number) => (
              <motion.div
                key={idx}
                transition={{
                  duration: .2,
                  delay: idx * .15
                }}
                className={cn(
                  idx % 2 === 0
                    ? "border-4 border-s-0 rounded-e-full -me-16 ms-1"
                    : "border-4 border-e-0 rounded-s-full -ms-16 me-1",
                  "relative flex items-center gap-2 text-sm p-7 md:p-10 border-[#9b956d] last:border-b-0"
                )}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: .5,
                    delay: (idx + 1) * .25
                  }}
                  className={cn(
                    // idx % 2 === 0 ? "absolute -left-1.5 -me-px" : "absolute -right-1.5 -ms-px",
                    idx % 2 === 0 ? "absolute -left-4.5" : "absolute -right-4.5",
                  )}
                >
                  {/* <div className="w-2.5 aspect-square rounded-full bg-[#9b956d]" /> */}
                  <div className="flex items-center justify-center w-9 pt-0.5 font-black aspect-square rounded-full border-4 border-[#9b956d] bg-white dark:bg-black">
                    {toPersianNumber(idx + 1)}
                  </div>
                </motion.span>
                <span className={cn(
                  idx % 2 === 0 ? "-ms-16 pe-4" : "-me-16 ps-4",
                )}
                >
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-2xl mx-auto px-4 mb-safe md:mb-10">
        {plan.price ? (
          <button
            className="w-full bg-[#9b956d] text-white font-bold py-3 rounded-full shadow-md hover:bg-[#9b956d]/75 active:bg-[#9b956d]/75 transition-colors cursor-pointer"
            onClick={handleCheckout}
          >
            پرداخت {new Intl.NumberFormat("fa-IR").format(plan.price)} تومان
          </button>
        ) : (
          <button
            className="w-full bg-[#9b956d] text-white font-bold py-3 rounded-full shadow-md hover:bg-[#9b956d]/75 active:bg-[#9b956d]/75 transition-colors cursor-pointer"
          >
            ارسال درخواست سازمانی
          </button>
        )}
      </div>
    </div>
  )
}
