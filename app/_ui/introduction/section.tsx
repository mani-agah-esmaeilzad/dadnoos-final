import { useState } from "react"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { useRouter } from "next/navigation"
import Image, { ImageProps } from "next/image"
import Link from "next/link"

import Image1 from '@/public/int-sec-1.svg'
import Image2 from '@/public/int-sec-2.svg'
import Image3 from '@/public/int-sec-3.svg'
import logo from '@/public/logo.png'

import { Button } from "@/app/_ui/components/button"
import { cn } from "@/app/_lib/utils"

export default function Introduction({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [direction, setDirection] = useState<"next" | "prev" | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const router = useRouter()

  const handleGoToMainPage = () => {
    router.push("/")
  }

  const pages = [
    {
      title: "به اپلیکیشن دادنوس خوش آمدید",
      description:
        "هوش مصنوعی دادنوس به عنوان دستیار وکلا، مشاورین حقوقی و مدیران کسب و کار به شما کمک می کند در زمان خود صرفه جویی کنید و دقت انجام کار را افزایش دهید.",
      image: Image1,
    },
    {
      title: "پرسش، پیش‌نویس، تحلیل",
      description:
        "برای پرسش های حقوقی خود پاسخ های معتبر با ذکر منبع دریافت کنید، پیشنویس اسناد حقوقی تهیه کنید و اسناد حقوقی موجود را با کمک هوش مصنوعی دادنوس تحلیل کنید.",
      image: Image2,
    },
    {
      title: "مسئولیت استفاده",
      description:
        "دادنوس یک دستیار هوشمند حقوقی است و نمی تواند جایگزین رسمی وکیل و مشاور حقوقی باشد. مسئولیت نهایی استفاده از خروجی ها به عهده کاربر می باشد.",
      image: Image3,
    },
    {
      title: "ایجاد حساب کاربری",
      description:
        "برای استفاده کامل از امکانات دادنوس، حساب کاربری خود را به سادگی ایجاد کرده و با کد یکبار مصرف وارد شوید.",
      action: (
        <div className="grid items-center justify-center gap-4">
          <Link
            href="/auth"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-black/20 dark:border-white/75 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent active:bg-[#f2f2f2] dark:active:bg-[#f2f2f2]/25 active:border-transparent transition-colors font-medium"
          >
            ورود به دادنوس
          </Link>
          <Link
            href="/"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent active:bg-[#f2f2f2] dark:active:bg-[#f2f2f2]/25 active:border-transparent transition-colors font-medium"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      ),
      logo: logo,
    },
  ]

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1)
      setDirection("next")
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      setDirection("prev")
    }
  }

  const page = pages[currentPage]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{
            y: "100%",
            transition: {
              delay: 0.25,
              duration: 0.25,
            },
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 30
          }}
          className="fixed inset-0 z-[10000] bg-white dark:bg-neutral-800 flex flex-col"
        >
          <div
            className="flex-1 flex items-center justify-center overflow-x-hidden overflow-y-hidden"
            style={{
              touchAction: "pan-y",
              overscrollBehaviorX: "contain",
            }}
          >
            <motion.div
              key={currentPage}
              className="w-full flex justify-between"
              drag="x"
              dragElastic={0.5}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                const offsetX = info.offset.x
                const velocity = info.velocity.x

                const swipe = Math.abs(offsetX) > 80 || Math.abs(velocity) > 500

                if (!swipe) return

                if (offsetX < -75) {
                  handleNext()
                }

                if (offsetX > 75) {
                  handlePrev()
                }
              }}
              initial={{
                x: direction === "next" ? 100 : direction === "prev" ? -100 : 0,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                x: direction === "next" ? -100 : direction === "prev" ? 100 : 0,
              }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-col text-center px-6 cursor-grab active:cursor-grabbing max-w-md w-full mx-auto pt-safe-20">
                {page?.image && (
                  <div className="relative mb-8 w-full select-none pointer-events-none my-auto">
                    <SafeImage
                      width={1000}
                      height={500}
                      alt={page.title}
                      src={page.image}
                      className="object-contain w-full max-h-[45vh]"
                    />
                  </div>
                )}
                {page.logo && (
                  <div className="relative size-32 mx-auto select-none my-auto">
                    <SafeImage
                      width={1000}
                      height={500}
                      alt={page.title}
                      src={page.logo}
                      onClick={handleGoToMainPage}
                      className="object-contain size-full"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold mb-4">{page.title}</h2>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {page.description}
                  </p>
                </div>
                <div className="mt-16 pt-0.5">{page?.action && page.action}</div>
              </div>
            </motion.div>
          </div>

          <div className="flex w-full max-w-md mx-auto justify-between items-center p-4 mb-safe">
            <Button
              size="icon_lg"
              variant="ghost"
              onClick={handleNext}
              disabled={currentPage === pages.length - 1}
              className="disabled:opacity-0 rounded-full aspect-square"
            >
              <ArrowRight className="size-6" />
            </Button>

            <div className="flex gap-2 items-center justify-center" dir="ltr">
              {pages.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    index === currentPage
                      ? "bg-black dark:bg-white w-5"
                      : "bg-neutral-200 dark:bg-neutral-700 w-3",
                    "h-3 rounded-full transition-all duration-200 ease-out",
                  )}
                />
              ))}
            </div>

            <Button
              size="icon_lg"
              variant="ghost"
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="disabled:opacity-0 rounded-full aspect-square"
            >
              <ArrowLeft className="size-6" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// function SwipePage({
//   page,
//   direction,
//   setDirection,
//   onNext,
//   onPrev,
//   currentPage,
// }: any) {
//   const x = useMotionValue(0)
//   const opacity = useTransform(x, [150, 0, -150], [0.25, 1, 0.25])

//   return (
//     <motion.div
//       key={currentPage}
//       className="w-full flex justify-center"
//       drag="x"
//       dragElastic={0.2}
//       dragConstraints={{ left: 0, right: 0 }}
//       style={{ x, opacity }}
//       onDragEnd={(_, info) => {
//         const offsetX = info.offset.x
//         const velocityX = info.velocity.x

//         if (offsetX > 80 || velocityX > 400) {
//           setDirection("next")
//           onNext()
//         } else if (offsetX < -80 || velocityX < -400) {
//           setDirection("prev")
//           onPrev()
//         }
//       }}
//       initial={{
//         opacity: 0,
//         x: direction === "next" ? 100 : direction === "prev" ? -100 : 0,
//       }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{
//         opacity: 0,
//         x: direction === "next" ? -100 : direction === "prev" ? 100 : 0,
//       }}
//       transition={{ duration: 0.25 }}
//     >
//       <div className="flex flex-col h-full text-center px-6 cursor-grab active:cursor-grabbing max-w-md w-full">
//         {page?.image && (
//           <div className="relative mb-8 size-full select-none pointer-events-none">
//             <SafeImage
//               width={1000}
//               height={500}
//               alt={page.title}
//               src={page.image}
//               className="object-contain w-full max-h-[45vh]"
//             />
//           </div>
//         )}
//         <div className={cn(currentPage === 3 ? "my-auto" : "mt-auto")}>
//           {page.logo && (
//             <div className="relative size-32 mx-auto select-none pointer-events-none">
//               <SafeImage
//                 width={1000}
//                 height={500}
//                 alt={page.title}
//                 src={page.logo}
//                 className="object-contain size-full"
//               />
//             </div>
//           )}
//           <h2 className="text-xl font-bold mb-4">{page.title}</h2>
//           <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
//             {page.description}
//           </p>
//           <div className="mt-10">{page?.action && page.action}</div>
//         </div>
//       </div>
//     </motion.div>
//   )
// }

export function SafeImage(props: ImageProps) {
  return (
    <div
      className="relative w-full aspect-square select-none pointer-events-none"
    >
      <Image
        {...props}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
        className={cn(
          props.className,
          "select-none pointer-events-none"
        )}
      />
    </div>
  )
}
