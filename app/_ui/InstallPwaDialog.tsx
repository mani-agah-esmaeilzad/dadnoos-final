"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/_ui/components/dialog"
import { Share } from "lucide-react"
import Link from "next/link"

export default function PWAGuide() {
  const [open, setOpen] = useState(false)
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
    window.addEventListener('beforeinstallprompt', () => {
      setIsInstalled(false)
    })
    window.addEventListener('focus', checkIfInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', () => { })
      window.removeEventListener('focus', checkIfInstalled)
    }
  }, [])

  return isInstalled ? (
    <Link
      href="/pricing"
      className="rounded-full whitespace-nowrap border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] active:bg-[#383838] dark:active:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer"
    >
      خرید اشتراک
    </Link>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-full whitespace-nowrap border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] active:bg-[#383838] dark:active:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer"
        >
          نصب وب اپلیکیشن
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-sm rounded-3xl w-[calc(100%-50px)] px-6">
        <DialogHeader>
          <DialogTitle className="pb-2">
            {platform === "ios"
              ? "راهنمای نصب PWA روی آیفون"
              : platform === "android"
                ? "راهنمای نصب PWA روی اندروید"
                : "نصب وب اپلیکیشن"}
          </DialogTitle>
          <DialogDescription>
            {platform === "ios"
              ? "برای نصب اپلیکیشن روی صفحهٔ اصلی آیفون مراحل زیر را انجام دهید:"
              : platform === "android"
                ? "برای نصب اپلیکیشن روی صفحهٔ اصلی اندروید مراحل زیر را انجام دهید:"
                : "مراحل نصب ممکن است بسته به مرورگر شما متفاوت باشد."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm leading-relaxed mt-4 px-4">
          {platform === "ios" && (
            <>
              <div className="flex items-center gap-1">
                <span>۱.</span>
                <span>دکمه</span>
                <Share className="size-4 mb-1" />
                <span>را در مرورگر لمس کنید.</span>
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
      </DialogContent>
    </Dialog>
  )
}