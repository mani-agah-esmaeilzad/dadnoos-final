"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function ThemeColorHandler() {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")

    setIsDark(prefersDark.matches)

    const listener = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
    }
    prefersDark.addEventListener("change", listener)

    return () => {
      prefersDark.removeEventListener("change", listener)
    }
  }, [])

  useEffect(() => {
    let color = "#ffffff"
    let darkColor = "#000000"

    if (pathname === "/") {
      color = "#ffffff"
      darkColor = "#000000"
    } else if (pathname.startsWith("/c")) {
      color = "#ffffff"
      darkColor = "#000000"
    } else if (pathname.startsWith("/about")) {
      color = "#ffffff"
      darkColor = "#000000"
    } else if (pathname.startsWith("/auth")) {
      color = "#ffffff"
      darkColor = "#000000"
    } else if (pathname.startsWith("/pricing")) {
      color = "#ffffff"
      darkColor = "#000000"
    } else if (pathname.startsWith("/subscription")) {
      color = "#000000"
      darkColor = "#000000"
    } else {
      color = "#ffffff"
      darkColor = "#000000"
    }

    const themeColor = isDark ? darkColor : color
    let meta = document.querySelector<HTMLMetaElement>("meta[name=theme-color]")
    if (!meta) {
      meta = document.createElement("meta")
      meta.name = "theme-color"
      document.head.appendChild(meta)
    }
    meta.setAttribute("content", themeColor)
  }, [pathname, isDark])

  return null
}