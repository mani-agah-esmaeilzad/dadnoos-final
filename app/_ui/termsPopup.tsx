import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AcceptButton from "@/app/_ui/components/acceptButton"
import Image from "next/image"

type TermsPopupProps = {
  onAccept: () => void
  visible: boolean
}

export default function TermsPopup({ onAccept, visible }: TermsPopupProps) {
  const [ripplePosition, setRipplePosition] = useState<{ x: number; y: number } | null>(null)
  const [dragEnabled, setDragEnabled] = useState(false)
  const [shake, setShake] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  const handleBackdropClick = (e: React.MouseEvent) => {
    setRipplePosition({ x: e.clientX, y: e.clientY })

    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      setShake(true)
      setTimeout(() => setShake(false), 120)
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden"
          onClick={handleBackdropClick}
        >
          {visible && (
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: .75 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}

          <AnimatePresence>
            {ripplePosition && (
              <motion.div
                key={`${ripplePosition.x}-${ripplePosition.y}`}
                initial={{ scale: 0, opacity: 0.4 }}
                animate={{ scale: 10, opacity: 0 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="absolute z-10 size-40 rounded-full bg-[#9b956d] pointer-events-none"
                style={{
                  left: ripplePosition.x - 77,
                  top: ripplePosition.y - 77,
                  transform: "translate(-50%, -50%)",
                }}
                onAnimationComplete={() => setRipplePosition(null)}
              />
            )}
          </AnimatePresence>

          <motion.div
            ref={cardRef}
            initial={{ y: "100%" }}
            animate={{ y: shake ? 140 : 125 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 30,
            }}
            onAnimationComplete={() => {
              setDragEnabled(true)
            }}
            drag={dragEnabled ? "y" : false}
            dragElastic={.05}
            dragConstraints={dragEnabled ? { top: 125, bottom: 125 } : undefined}
            className="relative text-center bg-white dark:bg-[#303030] rounded-t-4xl max-w-lg w-full pt-16 lg:pt-20 px-8 pb-40 shadow-2xl z-20"
          >
            <div className="absolute top-1.5 right-1/2 translate-1/2 h-1.5 w-[10%] rounded-full bg-neutral-400/25" />

            <Image
              width={80}
              height={80}
              src="/terms.png"
              alt="Terms Icon"
              className="mx-auto mb-8 select-none pointer-events-none"
            />

            <h2 className="text-2xl font-bold mb-6">شرایط استفاده دادنوس</h2>
            <p className="text-xs/relaxed font-light mb-8 max-w-lg mx-auto">
              دادنوس یک دستیار هوش مصنوعی است و مشاوره حقوقی ارائه نمی‌کند. محتوای تولیدشده صرفاً جنبه کمکی دارد و مسئولیت نهایی استفاده از آن بر عهده کاربر است. با ادامه استفاده، این شرایط را می‌پذیرید.
            </p>

            <div className="flex items-center justify-center">
              <AcceptButton
                message="شرایط را می‌پذیرم"
                onAccept={onAccept}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
