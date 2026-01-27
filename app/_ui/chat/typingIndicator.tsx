import { motion } from 'framer-motion'

export function TypingIndicator() {
  // const dots = [0, 0.2, 0.4]
  const dots = [0]

  return (
    // <div className="flex justify-start px-4 pb-16 pt-6">
    <div className="flex justify-start pb-10 h-[55.25vh] pt-4 px-4">
      <div className="flex gap-1.5">
        {dots.map((delay, i) => (
          <motion.div
            key={i}
            className="size-3 aspect-square bg-black dark:bg-white rounded-full"
            // className="size-2.5 aspect-square bg-black dark:bg-white rounded-full"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 0.8,
              delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  )
}