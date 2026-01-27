'use client'

import { useEffect } from 'react'

export default function AboutScrollManager() {
  useEffect(() => {
    if (window.location.hash === '#about-footer') {
      const footer = document.getElementById('about-footer')
      footer?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return null
}
