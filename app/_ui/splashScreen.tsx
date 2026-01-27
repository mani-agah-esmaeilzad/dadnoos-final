import Image from 'next/image'
import { useEffect } from 'react'
import { websiteName } from '@/app/_text/common'

type SplashScreenProps = {
  onFinish: (completed: boolean) => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {

  useEffect(() => {
    const minDuration = 1500
    const startTime = Date.now()

    const handleFinish = () => {
      const elapsed = Date.now() - startTime
      const remaining = minDuration - elapsed
      if (remaining > 0) {
        setTimeout(() => onFinish(true), remaining)
      } else {
        onFinish(true)
      }
    }

    if (document.readyState === 'complete') {
      handleFinish()
      return
    }

    window.addEventListener('load', handleFinish)
    return () => window.removeEventListener('load', handleFinish)
  }, [onFinish])

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-background flex items-center justify-center overflow-hidden">
      <div className="z-10 mt-10">
        <Image
          className="size-32 md:size-48 animate-fade-scale"
          src="/logo.png"
          alt={`${websiteName} logo`}
          width={180}
          height={38}
          priority
        />
      </div>
    </div>
  )
}