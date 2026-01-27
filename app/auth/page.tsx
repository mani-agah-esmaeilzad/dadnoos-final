'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import * as texts from '@/app/_text/common'

import { removeUser } from '@/app/_lib/user'
import { apiService } from '@/app/_lib/services/api'
import { normalizeIranPhone } from '@/app/_lib/utils'

import PhoneInput from '@/app/_ui/auth/mobile-input'
import CodeInput from '@/app/_ui/auth/code-input'
import Link from 'next/link'
import Image from 'next/image'

function Auth() {
  const searchParams = useSearchParams()
  const callbackPath = searchParams.get('callbackPath')

  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [mobile, setMobile] = useState<string>('')
  const [isPending, setIsPending] = useState<boolean>(false)
  const [requestError, setRequestError] = useState<string | null>(null)

  useEffect(() => {
    removeUser()
    apiService.setToken(null)
  }, [])

  const requestCode = async (phone: string): Promise<boolean> => {
    const normalizedPhone = normalizeIranPhone(phone)

    if (!normalizedPhone) {
      setRequestError('شماره تلفن وارد شده معتبر نیست.')
      return false
    }

    try {
      setRequestError(null)
      setIsPending(true)
      await apiService.requestOtp(normalizedPhone)
      setMobile(normalizedPhone)
      setActiveIndex(1)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ارسال کد تایید با مشکل مواجه شد.'
      setRequestError(message)
      return false
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center backdrop-blur-3xl pt-safe pb-safe">

      <Link href="/" className="flex justify-center items-center mb-4 z-10">
        <Image
          className="size-32 md:hover:scale-95 active:scale-95 transition-transform mb-0.5"
          src="/logo.png"
          alt={`${texts.websiteName} logo`}
          width={180}
          height={38}
          priority
        />
      </Link>

      {activeIndex === 0 && (
        <PhoneInput
          mobile={mobile}
          setMobile={setMobile}
          isPending={isPending}
          errorMessage={requestError}
          setErrorMessage={setRequestError}
          requestCode={requestCode}
        />
      )}

      {activeIndex === 1 && (
        <CodeInput
          mobile={mobile}
          requestCode={requestCode}
          setActiveIndex={setActiveIndex}
          callbackPath={callbackPath ?? undefined}
        />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <Auth />
    </Suspense>
  )
}
