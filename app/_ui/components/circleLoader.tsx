import { motion } from "framer-motion"

interface CircleLoaderProps {
  count?: number
  size?: number
}

export default function CircleLoader({ count = 10, size = 50 }: CircleLoaderProps) {
  const radius = size / 2
  const circleSize = Math.max(4, radius / 3.5)

  return (
    <div
      className="relative size-14 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: circleSize,
              height: circleSize,
              transform: `rotate(${angle}deg) translateY(-${radius - circleSize / 2}px)`,
            }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * (1.5 / count),
            }}
          />
        )
      })}
    </div>
  )
}
