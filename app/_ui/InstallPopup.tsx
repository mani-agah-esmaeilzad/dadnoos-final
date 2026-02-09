"use client"

import { Share } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/app/_ui/components/button"

type InstallPopupProps = {
  visible: boolean
  onSkip: any
}

export default function InstallPopup({
  visible,
  onSkip,
}: InstallPopupProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other")
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setPlatform("ios")
    } else if (/android/i.test(ua)) {
      setPlatform("android")
    } else {
      setPlatform("other")
    }
  }, [])

  useEffect(() => {
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }
    }

    checkIfInstalled()
    window.addEventListener('beforeinstallprompt', () => setIsInstalled(false))
    window.addEventListener('focus', checkIfInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', () => { })
      window.removeEventListener('focus', checkIfInstalled)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && !isInstalled && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75" />

          {/* Card */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 120 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="
              relative z-50
              bg-white dark:bg-[#303030]
              rounded-t-4xl
              max-w-lg w-full
              p-6 pb-32
              text-start
              shadow-2xl
            "
          >
            <h3 className="text-2xl font-black my-4 text-center">
              نصب وب‌اپ دادنوس
            </h3>

            <p className="text-xs/relaxed text-neutral-600 dark:text-neutral-300 mb-6 text-center">
              با نصب دادنوس، دسترسی سریع‌تر، تجربه روان‌تر و عملکرد بهتر خواهید داشت.
            </p>

            <div className="space-y-3 text-base leading-relaxed my-16">
              {platform === "ios" && (
                <>
                  <div className="flex items-center gap-1">
                    <span>۱.</span> <span>دکمه</span> <Share className="size-4 mb-1" /> <span>را در مرورگر لمس کنید.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>۲. گزینه <b>Add to Home Screen</b> را انتخاب کنید.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>۳. روی دکمه <b>Add</b> در گوشهٔ بالا بزنید تا نصب کامل شود.</span>
                  </div>
                </>
              )}

              {platform === "android" && (
                <>
                  <div className="flex items-center gap-1">
                    <span>۱. روی دکمهٔ سه نقطه در مرورگر (Chrome) لمس کنید.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>۲. گزینه <b>Add to Home Screen</b> یا <b>Install app</b> را انتخاب کنید.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>۳. نام اپلیکیشن را تایید و روی <b>Add</b> یا <b>Install</b> بزنید تا نصب کامل شود.</span>
                  </div>
                </>
              )}

              {platform === "other" && (
                <div>
                  <span>برای نصب اپلیکیشن روی صفحهٔ اصلی، لطفاً مرورگر خود را بررسی کنید.</span>
                </div>
              )}
            </div>

            <div className="flex items-center pb-2 max-w-sm mx-auto">
              <Button
                variant="outline"
                onClick={onSkip}
                className="text-xs w-full"
              >
                فعلاً نه
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}