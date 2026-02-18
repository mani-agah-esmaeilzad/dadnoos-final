'use client'

import { useState, ReactNode, useEffect } from "react"
import SplashScreen from "@/app/_ui/splashScreen"
import InstallPopup from "@/app/_ui/InstallPopup"
import { NotifProvider, NotificationContainer } from "@/app/_ui/notif"

type RootLayoutProps = {
  children: ReactNode
}

const isPWAInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as any).standalone === true

export default function RootLayout({ children }: RootLayoutProps) {
  const [showSplash, setShowSplash] = useState(true)
  const [checkedPWA, setCheckedPWA] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const installed = isPWAInstalled()
    setCheckedPWA(true)

    const meta = document.querySelector('meta[name="viewport"]')
    if (!meta) return

    meta.setAttribute(
      'content',
      `width=device-width, initial-scale=1, viewport-fit=${installed ? 'cover' : 'auto'
      }`
    )
  }, [])

  useEffect(() => {
    const installed = isPWAInstalled()
    const skipped = localStorage.getItem('installSkipped')

    if (!installed && !skipped) {
      setShowInstall(true)
    }

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleSkipInstall = () => {
    localStorage.setItem('installSkipped', 'true')
    setShowInstall(false)
  }

  if (!checkedPWA) return null

  return showSplash ? (
    <SplashScreen onFinish={() => setShowSplash(false)} />
  ) : (
    <NotifProvider>
      <NotificationContainer />
      <InstallPopup
        visible={showInstall}
        onSkip={handleSkipInstall}
      />

      {children}
    </NotifProvider>
  )
}
