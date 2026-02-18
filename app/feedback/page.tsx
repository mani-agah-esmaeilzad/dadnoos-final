'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Bug, Lightbulb, Loader2 } from 'lucide-react'

import BackButton from '@/app/_ui/back-button'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { Textarea } from '@/app/_ui/components/textarea'
import { apiService } from '@/app/_lib/services/api'
import { useUserStore } from '@/app/_lib/hooks/store'

import * as texts from '@/app/_text/common.js'

export default function FeedbackPage() {
  const user = useUserStore((state) => state.user)
  const [type, setType] = useState<'idea' | 'report'>('idea')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    if (!apiService.token) {
      setError('برای ارسال، ابتدا وارد حساب کاربری شوید.')
      return
    }

    if (!title.trim() || !message.trim()) {
      setError('لطفاً عنوان و توضیح را کامل وارد کنید.')
      return
    }

    try {
      setLoading(true)
      await apiService.submitFeedback({
        title: title.trim(),
        message: message.trim(),
        type,
      })
      setSuccess(true)
      setTitle('')
      setMessage('')
      setType('idea')
    } catch (err) {
      setError('ثبت پیام ناموفق بود. لطفاً دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="feedback-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center px-4 pb-12 pt-4 md:pt-8 mt-safe md:min-h-screen"
      >
        <div className="absolute top-2 left-2 md:top-8 md:left-10">
          <BackButton />
        </div>

        <div className="absolute size-12 md:size-16 p-2 top-2.5 right-1 md:top-8 md:right-10">
          <Link href="/" className="w-8 aspect-square">
            <Image
              className="size-full"
              src="/logo.png"
              alt={`${texts.websiteName} logo`}
              width={180}
              height={38}
              priority
            />
          </Link>
        </div>

        <h1 className="text-2xl md:text-6xl font-black mb-2">ثبت ایده‌ها و نظرات</h1>
        <p className="text-sm text-neutral-500 text-center max-w-xl">
          نظر، پیشنهاد یا گزارش مشکل خود را برای تیم دادنوس ارسال کنید. پیام شما مستقیماً در پنل مدیریت ثبت می‌شود.
        </p>

        <div className="relative w-full max-w-2xl mt-6 md:mt-16">
          <form onSubmit={handleSubmit} className="bg-neutral-700/10 dark:bg-neutral-700/50 backdrop-blur-2xl rounded-3xl p-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-neutral-500">نوع پیام</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={type === 'idea' ? 'default' : 'ghost'}
                    className="justify-center gap-2"
                    onClick={() => setType('idea')}
                  >
                    <Lightbulb className="size-4" />
                    ایده / نظر
                  </Button>
                  <Button
                    type="button"
                    variant={type === 'report' ? 'default' : 'ghost'}
                    className="justify-center gap-2"
                    onClick={() => setType('report')}
                  >
                    <Bug className="size-4" />
                    گزارش مشکل
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-500">شناسه کاربر</label>
                <Input
                  disabled
                  value={user?.id ? user.id : 'نامشخص'}
                  className="mt-1 bg-neutral-100/70 dark:bg-neutral-900/60"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-500">عنوان</label>
              <Input
                name="title"
                placeholder="مثلاً پیشنهاد برای بهبود پاسخ‌ها"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-500">توضیحات</label>
              <Textarea
                name="message"
                placeholder="جزئیات ایده یا مشکلتان را اینجا بنویسید..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                maxLength={4000}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {success && (
              <p className="text-sm text-emerald-600">پیام شما با موفقیت ثبت شد. ممنون از بازخورد شما.</p>
            )}

            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-neutral-500">
                پاسخ به پیام‌ها ممکن است زمان‌بر باشد. لطفاً توضیحات کافی ارائه دهید.
              </p>
              <Button type="submit" className="px-6 rounded-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    در حال ارسال
                  </span>
                ) : (
                  'ارسال پیام'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
