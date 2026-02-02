import { useState, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PopupProps {
  visible: boolean
  onClose: () => void
  children: ReactNode
}

export default function Popup({ visible, onClose, children }: PopupProps) {
  const [ripplePosition, setRipplePosition] = useState<{ x: number; y: number } | null>(null)
  const [shake, setShake] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleBackdropClick = (e: React.MouseEvent) => {
    setRipplePosition({ x: e.clientX, y: e.clientY })

    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      setShake(true)
      setTimeout(() => setShake(false), 120)
    }
  }

  const handleDragEnd = (event: any, info: { offset: { y: number } }) => {
    if (info.offset.y > 200) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 w-screen z-50 flex items-end md:items-center justify-center overflow-hidden -mb-10 md:-mb-0"
          onClick={handleBackdropClick}
        >
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />

          <AnimatePresence>
            {ripplePosition && (
              <motion.div
                key={`${ripplePosition.x}-${ripplePosition.y}`}
                initial={{ scale: 0, opacity: 0.4 }}
                animate={{ scale: 10, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute z-10 h-10 w-10 rounded-full bg-white/20 pointer-events-none"
                style={{
                  left: ripplePosition.x,
                  top: ripplePosition.y,
                  transform: 'translate(-50%, -50%)',
                }}
                onAnimationComplete={() => setRipplePosition(null)}
              />
            )}
          </AnimatePresence>

          <motion.div
            ref={cardRef}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            dragElastic={.05}
            initial={{ y: 500 }}
            animate={{ y: shake ? 25 : 0, opacity: 1 }}
            exit={{
              y: window.innerHeight,
              transition: { duration: 0.35, ease: 'easeInOut' }
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative z-20 w-full max-w-xl bg-white dark:bg-neutral-800 rounded-t-4xl md:rounded-4xl shadow-xl pt-6 px-3 pb-20 md:pb-6"
          >
            <div className="absolute top-1.5 right-1/2 translate-x-1/2 h-1.5 w-[10%] rounded-full bg-neutral-400/25" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
