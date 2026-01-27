'use client'

import { useState, ReactNode, useEffect } from "react"
import { usePathname } from "next/navigation"

import SplashScreen from "@/app/_ui/splashScreen"
import TermsPopup from "@/app/_ui/termsPopup"

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [showTerms, setShowTerms] = useState<boolean>(false)
  const [showSplash, setShowSplash] = useState<boolean>(true)
  const [checkedPWA, setCheckedPWA] = useState<boolean>(false)

  const pathname = usePathname()

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches
    setCheckedPWA(true)

    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return

    meta.setAttribute(
      'content',
      `width=device-width, initial-scale=1, viewport-fit=${isPWA ? 'cover' : 'auto'}`
    )
  }, [])

  useEffect(() => {
    setShowTerms(false)
    const accepted = localStorage.getItem('termsAccepted')
    if (!accepted) setShowTerms(true)
  }, [pathname])

  const handleAcceptTerms = () => {
    localStorage.setItem('termsAccepted', 'true')
    setShowTerms(false)
  }

  if (checkedPWA) {
    return showSplash ? (
      <SplashScreen onFinish={() => setShowSplash(false)} />
    ) : (
      <>
        <TermsPopup
          visible={showTerms}
          onAccept={handleAcceptTerms}
        />
        {children}
      </>
    )
  }
}
