import { useEffect, useState, useRef, useCallback, ChangeEvent, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'

import { apiService } from '@/app/_lib/services/api'
import * as texts from '@/app/_text/common'
import { cn, toPersianNumber, toEnglishNumber } from "@/app/_lib/utils"
import { useUserStore } from '@/app/_lib/hooks/store'

type InputVerificationCodeProps = {
  mobile: string
  requestCode: (mobile: string) => Promise<boolean>
  setActiveIndex: (index: number) => void
  callbackPath?: string
}

export default function InputVerificationCode({
  mobile,
  requestCode,
  setActiveIndex,
  callbackPath,
}: InputVerificationCodeProps) {
  const COUNTER_INITIAL_VALUE = 90
  const OTP_LENGTH = 5

  const [successSubmit, setSuccessSubmit] = useState<boolean>(false)
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''))
  const [counter, setCounter] = useState<number>(COUNTER_INITIAL_VALUE)
  const [hasError, setHasError] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isResending, setIsResending] = useState<boolean>(false)

  const { updateUser } = useUserStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const startTimer = useCallback(() => {
    if (!intervalRef.current) {
      const intervalId = setInterval(() => {
        setCounter((prevCounter) => {
          if (prevCounter <= 1 && intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            return 0
          }
          return prevCounter - 1
        })
      }, 1000)
      intervalRef.current = intervalId
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    startTimer()
    return () => stopTimer()
  }, [startTimer, stopTimer])

  const resetTimer = () => {
    stopTimer()
    setOtp(new Array(OTP_LENGTH).fill(''))
    setCounter(COUNTER_INITIAL_VALUE)
    startTimer()
  }

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const englishValue = toEnglishNumber(e.target.value)
    const newOtp = [...otp]

    if (englishValue !== '' && isNaN(Number(englishValue))) return

    newOtp[index] = englishValue

    if (englishValue && index < otp.length - 1) {
      (document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement | null)?.focus()
    }

    setOtp(newOtp)

    if (newOtp.every((d) => d)) {
      if (!isSubmitting) onSubmit(newOtp.join(''))
    } else {
      setHasError(false)
      setSuccessSubmit(false)
      if (errorMessage) {
        setErrorMessage(null)
      }
    }
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      (document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement | null)?.focus()
    }
  }

  const onSubmit = async (code: string) => {
    if (!mobile) {
      setErrorMessage('شماره تلفن یافت نشد. لطفاً دوباره تلاش کنید.')
      setHasError(true)
      return
    }

    setIsSubmitting(true)
    try {
      setErrorMessage(null)
      await apiService.verifyOtp(mobile, code)
      const userInfo = await apiService.getCurrentUser()
      updateUser({ id: userInfo.id, name: userInfo.username, mobile })

      setSuccessSubmit(true)
      setHasError(false)

      setTimeout(() => {
        router.push(callbackPath ?? '/c')
      }, 500)

    } catch (err: any) {
      setSuccessSubmit(false)
      setHasError(true)
      const message = err instanceof Error ? err.message : 'کد وارد شده صحیح نمی‌باشد.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onClickResendCode = async () => {
    if (!mobile || isResending) return

    setIsResending(true)
    try {
      const sent = await requestCode(mobile)
      if (sent) {
        setErrorMessage(null)
        setHasError(false)
        resetTimer()
      } else {
        setErrorMessage('ارسال مجدد کد تایید با مشکل مواجه شد.')
        setHasError(true)
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <div className="w-full mx-auto sm:max-w-md z-10 h-20 space-y-4">
        <div className="text-center">
          {toPersianNumber(texts.verificationCodeIsSentText(mobile.slice(-10)))}
        </div>
        <button
          className="flex w-full justify-center px-3 py-2 text-sm text-[#9b956d] hover:opacity-75 active:opacity-75 cursor-pointer"
          type="button"
          onClick={() => {
            setErrorMessage(null)
            setActiveIndex(0)
          }}
        >
          {texts.changePhoneNumberText}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mt-4 h-32">
        <div className="px-6 sm:px-12">
          <form className="space-y-6 text-center" onSubmit={(e) => e.preventDefault()}>
            <div
              className={cn(hasError ? 'shake' : '', "my-4 flex justify-between gap-2")}
              dir="ltr"
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="tel"
                  value={toPersianNumber(digit)}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={cn(
                    otp.every((d) => d)
                      ? successSubmit
                        ? 'border-green-600'
                        : hasError
                          ? 'border-red-600'
                          : 'border-neutral-500 dark:border-neutral-300'
                      : 'border-neutral-500 dark:border-neutral-300',
                    "w-full aspect-square text-center text-md border rounded-lg bg-transparent transition-colors focus:outline-none"
                  )}
                  maxLength={1}
                  disabled={isSubmitting}
                  required
                />
              ))}
            </div>

            <div className="flex justify-center items-center">
              {counter > 0 ? (
                <span className="px-3 py-1.5 leading-6">
                  {toPersianNumber(counter)} {" ثانیه"}
                </span>
              ) : (
                <span className="flex text-sm items-center">
                  <p>{texts.askForResendVerificationCodeText}</p>
                  <button
                    className="px-3 py-1.5 font-semibold leading-6 text-[#9b956d] hover:bg-[#9b956d]/75 active:bg-[#9b956d]/75 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                    type="button"
                    onClick={onClickResendCode}
                    disabled={isResending || isSubmitting}
                  >
                    {isResending ? 'در حال ارسال...' : texts.resendVerificationCodeText}
                  </button>
                </span>
              )}
            </div>

            <div className="mt-2 min-h-[1.25rem]">
              {errorMessage && (
                <p className="text-xs text-red-600 text-center">
                  {errorMessage}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
