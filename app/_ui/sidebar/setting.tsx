"use client"

import { useState } from "react"

import { ChevronLeft, LogOut, Settings, X } from "lucide-react"
import { Button } from "@/app/_ui/components/button"
import { useRouter } from "next/navigation"
import Popup from "@/app/_ui/components/popup"
import { cn, toEnglishNumber, toPersianNumber } from "@/app/_lib/utils"
import PricingButton from "../pricing/pricing-button"
import Image from "next/image"

interface SettingProps {
  user: any
  isMobile: boolean
  collapsed: boolean
  isScrolledEnd: boolean
  onClickLogout: any
  toggleContactModal: any
}

export default function Setting({
  user,
  isMobile,
  collapsed,
  isScrolledEnd,
  onClickLogout,
  toggleContactModal,
}: SettingProps) {
  const router = useRouter()
  const [isSettingPanelOpen, setIsSettingPanelOpen] = useState(false)

  const normalizeDigits = (value: string | number | undefined | null) =>
    toEnglishNumber(String(value ?? '')).replace(/\D/g, '')

  const isLikelyPhone = (value: string | number | undefined | null) => {
    const digits = normalizeDigits(value)
    return digits.length >= 10 && digits.length <= 13
  }

  const maskMobile = (value: string | number | undefined | null) => {
    const digits = normalizeDigits(value)
    if (!digits) return 'حساب کاربری'
    const start = digits.slice(0, 3)
    const end = digits.slice(-4)
    return `${toPersianNumber(start)}****${toPersianNumber(end)}`
  }

  const displayName =
    user?.name && !isLikelyPhone(user.name)
      ? user.name
      : user?.mobile
        ? maskMobile(user.mobile)
        : 'حساب کاربری'

  const closePopup = () => setIsSettingPanelOpen(false)

  const navigate = (path: string) => {
    closePopup()
    router.push(path)
  }

  const menuItems = [
    {
      label: !user?.id ? "خرید اشتراک" : "اشتراک شما",
      visible: true,
      onClick: () => navigate(!user?.id ? "/pricing" : "/subscription"),
    },
    {
      label: "تاریخچه تراکنش‌ها",
      visible: !!user?.id,
      onClick: () => navigate("/payment/history"),
    },
    {
      label: "فرق دادنوس با ChatGPT",
      visible: true,
      onClick: () => navigate("/dananoos-vs-chatgpt"),
    },
    {
      label: "تماس با ما",
      visible: true,
      onClick: () => {
        closePopup()
        toggleContactModal()
      },
    },
    {
      label: "ثبت ایده‌ها و نظرات",
      visible: true,
      onClick: () => navigate("/feedback"),
    },
  ]

  return (
    <>
      {/* User Button */}
      <Button
        variant="ghost"
        className={cn(
          "items-center justify-between px-0  pb-9 pt-7 rounded-none mb-safe border-t gap-0",
          !isMobile && collapsed ? "opacity-0" : "opacity-100 sm:delay-400 transition-opacity",
          !isScrolledEnd ? "border-neutral-400/15" : "border-transparent"
        )}
      >
        <div
          onClick={() => setIsSettingPanelOpen(true)}
          className="flex items-center justify-start gap-2 w-full p-4 -mb-1.5"
        >
          <Image
            width={100}
            height={100}
            src="/user.png"
            alt="user account"
            className="size-8 object-cover object-center rounded-full overflow-hidden dark:opacity-65"
          />
          <span className="text-sm font-medium">
            {displayName}
          </span>
        </div>

        <div className="z-10 pe-4">
          <PricingButton />
        </div>
      </Button>

      {/* Settings Popup */}
      <Popup visible={isSettingPanelOpen} onClose={closePopup}>
        <div className="mb-safe px-2">
          <div className="flex items-center justify-between mb-3 mt-1 md:mt-0">
            <div className="flex items-center gap-x-2 text-neutral-600 dark:text-neutral-400">
              <Settings className="size-7" />
              <h3 className="font-black text-xl">تنظیمات</h3>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => closePopup()}
              className="rounded-full"
            >
              <X className="size-5" />
            </Button>
          </div>

          <div className="space-y-1">
            {menuItems
              .filter(item => item.visible)
              .map((item, index) => (
                <Button
                  key={index}
                  onClick={item.onClick}
                  variant="ghost"
                  className="group w-full border-0 justify-between px-3 h-12 text-base"
                >
                  {item.label}
                  <ChevronLeft className="size-5 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all" />
                </Button>
              ))}

            {user?.id && (
              <Button
                variant="ghost"
                onClick={() => {
                  closePopup()
                  onClickLogout()
                }}
                className="group w-full border-0 justify-between px-3 h-12 text-red-500 text-base"
              >
                <span className="font-semibold">خروج</span>
                <LogOut className="size-5 transition-all group-hover:-rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </Popup>
    </>
  )
}
