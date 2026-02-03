'use client'

import Link from "next/link"
import { ArrowUp } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { websiteName, websiteDescription, websiteTaglines } from '@/app/_text/common'

import { useChatStore } from "@/app/_lib/hooks/useChatStore"
import { useUserStore } from "@/app/_lib/hooks/store"
import { useChat } from "@/app/_lib/hooks/useChat"

import Navbar from "@/app/_ui/navbar"
import PWAIphoneGuide from "@/app/_ui/InstallPwaDialog"
import PwaInstallBanner from "@/app/_ui/pwaInstallBanner"

const typingAnimationQueries: string[] = [
  'تنظیم قرارداد خرید و فروش ملک چگونه است؟',
  'مدارک لازم برای ثبت شرکت چیست؟',
  'شرایط لازم برای دریافت دیه از بیمه چیست؟',
  'نحوه اعتراض به رای دادگاه چگونه است؟',
  'چگونه می‌توانم از حقوق مالکیت فکری خود دفاع کنم؟',
  'تفاوت بین وصیت و ارث در قانون ایران چیست؟',
  'راهنمای جامع برای تنظیم اظهارنامه مالیاتی',
  'موارد قانونی مرتبط با دیه باید بررسی شوند؟',
  'نمونه لایحه مطالبه مهریه بنویس',
  'قرارداد اجاره آپارتمان تهیه کن',
  'قانون مدنی در مورد طلاق چه می‌گوید؟'
]

const TYPING_SPEED = 70
const DELETING_SPEED = 30
const PAUSE_DURATION = 1000

export default function Home() {
  const router = useRouter()
  const { inputValue, setInputValue, inputRef } = useChat()
  const { draftMessage, setDraftMessage } = useChatStore()
  const { user } = useUserStore();

  const handleStartChat = () => {
    if (inputValue.trim()) {
      setDraftMessage(inputValue);
      setInputValue('');

      if (user.id) {
        router.push('/c');
      } else {
        router.push('/auth');
      }
    }
  };

  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      const scrollHeight = inputRef.current.scrollHeight
      const maxHeight = 100
      const newHeight = Math.min(scrollHeight, maxHeight)
      inputRef.current.style.height = `${newHeight}px`
    }
  }, [inputRef])

  useEffect(() => { adjustTextareaHeight() }, [inputValue, adjustTextareaHeight])

  const [displayedValue, setDisplayedValue] = useState<string>('')
  const [currentQueryIndex, setCurrentQueryIndex] = useState<number>(0)
  const [charIndex, setCharIndex] = useState<number>(0)
  const [isTyping, setIsTyping] = useState<boolean>(true)

  useEffect(() => {
    if (inputValue) {
      setDisplayedValue('')
      setCharIndex(0)
      setIsTyping(true)
      return
    }

    const currentQuery = typingAnimationQueries[currentQueryIndex]

    if (isTyping) {
      if (charIndex < currentQuery.length) {
        const timeout = setTimeout(() => {
          setDisplayedValue(currentQuery.substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }, TYPING_SPEED)
        return () => clearTimeout(timeout)
      } else {
        const pauseTimeout = setTimeout(() => setIsTyping(false), PAUSE_DURATION)
        return () => clearTimeout(pauseTimeout)
      }
    } else {
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setDisplayedValue(currentQuery.substring(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        }, DELETING_SPEED)
        return () => clearTimeout(timeout)
      } else {
        setIsTyping(true)
        setCurrentQueryIndex((prevIndex) => (prevIndex + 1) % typingAnimationQueries.length)
      }
    }
  }, [charIndex, isTyping, currentQueryIndex, inputValue])

  return (
    <div className="min-h-screen grid grid-rows-[20px_1fr_20px] items-center justify-items-center gap-5" dir="auto">
      <Navbar />

      <div className="px-3 sm:p-20 w-full overflow-hidden">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-fit mx-auto">
          <h1 className="text-6xl md:text-8xl font-black">{websiteName}</h1>
          <ol className="font-mono list-inside list-disc text-sm md:text-md text-center sm:text-right">
            <li className="mb-2 tracking-[-.01em]">{websiteDescription}</li>
            <li className="tracking-[-.01em]">{websiteTaglines}</li>
          </ol>

          <div className="flex items-center gap-4">
            <PWAIphoneGuide />

            <Link
              href="/about"
              rel="noopener noreferrer"
              className="rounded-full cursor-pointer whitespace-nowrap border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2]/25 dark:hover:bg-[#1a1a1a] hover:border-transparent active:bg-[#f2f2f2] dark:active:bg-[#1a1a1a] active:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            >
              درباره {websiteName}
            </Link>
          </div>
        </main>

        <section className="flex items-start gap-2 mt-10 max-w-3xl mx-auto h-fit">
          <button
            onClick={handleStartChat}
            disabled={!inputValue.trim()}
            className="bg-[#C8A276]/75 p-2.5 md:p-3 aspect-square h-[calc(100%-10px)] flex items-center justify-center text-white rounded-full cursor-pointer hover:scale-105 transition-all disabled:scale-100 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ArrowUp className="size-6" />
          </button>

          <div className="relative flex items-center size-full dark:bg-[#202020] border-neutral-300 dark:border-0 rounded-3xl border sm:pl-5 shadow-2xs overflow-hidden">
            <textarea
              rows={1}
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleStartChat();
                }
              }}
              placeholder={displayedValue}
              className="w-full flex placeholder:py-1 scrollbar scrollbar-textarea bg-transparent px-5 font-medium placeholder:text-neutral-500/75 dark:placeholder:text-white/75 placeholder:text-xs focus:outline-none resize-none py-2 sm:py-2.5 text-right"
            />
          </div>
        </section>
      </div>

      <ol className="row-start-3 flex list-disc text-xs gap-x-12 gap-y-3 flex-wrap items-center justify-center fixed bottom-3 md:bottom-7 mb-safe">
        <li className="tracking-[-.01em]">هوش مصنوعی پیشرفته</li>
        <li className="tracking-[-.01em]">پاسخ‌های دقیق، معتبر و سریع</li>
        <li className="tracking-[-.01em]">آموزش‌دیده با قوانین ایران</li>
      </ol>
    </div>
  )
}