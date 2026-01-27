import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type AcceptButtonProps = {
  message?: string
  onAccept: () => void
  disabled?: boolean
}

export default function AcceptButton({ message = "پذیرش", onAccept, disabled }: AcceptButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showCheck, setShowCheck] = useState(false)

  const handleClick = async () => {
    if (disabled) return
    setLoading(true)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    try {
      await delay(1200)
      setLoading(false)
      setShowCheck(true)

      await delay(1200)
      setShowCheck(false)

      if (onAccept) onAccept()
    } catch (err) {
      setLoading(false)
      setShowCheck(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-sm h-10 from-[#b0ab7f] via-[#9b956d] to-[#b0ab7f] bg-gradient-to-tl hover:from-[#9b956d]/85 active:from-[#9b956d] hover:via-[#7f7960]/85 active:via-[#7f7960] transition-colors text-white text-sm font-semibold rounded-full flex items-center justify-center shadow-2xl gap-2 select-none disabled:opacity-60 cursor-pointer"
      disabled={disabled}
    >
      <AnimatePresence mode="wait">
        {/* Loader */}
        {loading && (
          <motion.svg
            key="loader"
            width="24"
            height="24"
            viewBox="0 0 50 50"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            // exit={{ opacity: 1, scale: 1 }}
            transition={{
              rotate: { repeat: Infinity, duration: 1.1, ease: "linear" },
              opacity: { duration: 0.25 },
              scale: { duration: 0.2 }
            }}
          >
            <motion.circle
              cx="25"
              cy="25"
              r="20"
              stroke="white"
              strokeWidth="5"
              fill="transparent"
              strokeLinecap="round"
              animate={{
                strokeDasharray: ["1, 125", "80, 125", "1, 125"],
                strokeDashoffset: [0, -60, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
            />
          </motion.svg>
        )}

        {!loading && showCheck && (
          <motion.svg
            key="check"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <motion.path
              d="M4 12 L9 17 L20 6"
              fill="transparent"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </motion.svg>
        )}

        {!loading && !showCheck && (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {message}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
