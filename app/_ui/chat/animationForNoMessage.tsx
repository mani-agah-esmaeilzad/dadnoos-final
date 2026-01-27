'use client'

import React, { useMemo } from 'react'

interface MeteorShowerProps {
  count?: number           // تعداد شهاب‌ها
  color?: string           // رنگ شهاب (نوک)
  trailColor?: string      // رنگ دنباله (می‌تونی شفاف باشه)
  maxSize?: number         // حداکثر اندازه نوک (px)
  minSize?: number         // حداقل اندازه نوک (px)
  maxDuration?: number     // حداکثر مدت زمان (s)
  minDuration?: number     // حداقل مدت زمان (s)
  width?: string           // پهنای کانتینر (مثلاً '100%' یا '400px')
  height?: string          // ارتفاع کانتینر (مثلاً '100vh' یا '300px')
  className?: string
  zIndex?: number
}

export default function MeteorShower({
  count = 6,
  color = '#fff',
  trailColor = 'rgba(255,255,255,0.25)',
  maxSize = 4,
  minSize = 2,
  maxDuration = 2.2,
  minDuration = 0.9,
  width = '100%',
  height = '100%',
  className = '',
  zIndex = 50,
}: MeteorShowerProps) {
  // پیش‌ساخت آرایه‌ای از شهاب‌ها با مقادیر تصادفی تا رندر پایدار بین رندرها باشد
  const meteors = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100 // شروع از درصد X
      const top = Math.random() * 50   // شروع از بالا (کمتر از 50% تا از بالا شروع کند)
      const delay = Math.random() * 0  // تاخیر قبل از اجرای انیمیشن (s)
      const duration = minDuration + Math.random() * (maxDuration - minDuration)
      const size = Math.round(minSize + Math.random() * (maxSize - minSize))
      const rotate = -5 + Math.random() * 100 // زاویه سقوط منفی برای رفتن به سمت چپ یا راست
      const length = 80 + Math.random() * 140 // طول دنباله px
      arr.push({ left, top, delay, duration, size, rotate, length })
    }
    return arr
  }, [count, minSize, maxSize, minDuration, maxDuration])

  return (
    <div
      aria-hidden="true"
      className={`relative pointer-events-none ${className}`}
      style={{
        width,
        height,
        overflow: 'hidden',
        zIndex,
      }}
    >
      {meteors.map((m, idx) => {
        const { left, top, delay, duration, size, rotate, length } = m
        // دنباله با گرادیانت و نوک با دایره کوچک
        return (
          <div
            key={idx}
            className="meteor"
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: `${length}px`,
              height: `${Math.max(size, 2)}px`,
              transform: `rotate(${rotate}deg)`,
              transformOrigin: 'left center',
              pointerEvents: 'none',
              // انیمیشن fall: حرکت از این نقطه به خارج صفحه
              animation: `meteor-fall ${duration}s linear ${delay}s infinite`,
              willChange: 'transform, opacity',
            }}
          >
            {/* trail */}
            <div
              style={{
                width: '100%',
                height: Math.max(size, 2),
                background: `linear-gradient(45deg, ${trailColor} 0%, rgba(255,255,255,0) 60%)`,
                borderRadius: Math.max(size, 2),
                filter: 'blur(0.6px)',
                opacity: 0.95,
              }}
              className="-rotate-[55deg] md:-rotate-[20deg]"
            />
          </div>
        )
      })}
    </div>
  )
}