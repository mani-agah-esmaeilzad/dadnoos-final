// validation
import { validateIranPhone } from '@/app/_lib/validations/phoneNumber'

import { cn, normalizeIranPhone, toEnglishNumber, toPersianNumber } from '@/app/_lib/utils'
import * as texts from '@/app/_text/common'
import { motion } from 'framer-motion'

type PhoneInputProps = {
  mobile: string
  setMobile: (value: string) => void
  isPending: boolean
  requestCode: (mobile: string) => Promise<boolean>
  errorMessage: string | null
  setErrorMessage: (message: string | null) => void
}

export default function PhoneInput({
  mobile,
  setMobile,
  isPending,
  requestCode,
  errorMessage,
  setErrorMessage,
}: PhoneInputProps) {

  function handleMobileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMobile(toEnglishNumber(e.target.value))
    if (errorMessage) {
      setErrorMessage(null)
    }
  }

  async function handleFormSubmit() {
    const normalizedMobile = normalizeIranPhone(mobile)
    if (!normalizedMobile) {
      setErrorMessage('لطفاً یک شماره تلفن معتبر وارد کنید.')
      return
    }

    setMobile(normalizedMobile)
    await requestCode(normalizedMobile)
  }

  return (
    <>
      <div className="w-full mx-auto sm:max-w-md z-10 h-20">
        <h2 className="text-center text-2xl tracking-tight font-bold">
          {texts.loginText}
        </h2>
        <p className='text-center text-xs/5 mt-2 px-12'>
          شماره تلفنی که میخواهید حساب کاربری دادنوس بر روی آن فعال شود را وارد کنید
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mt-4">
        <div className="px-6 py-10 rounded-md sm:px-12 h-32">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <input
                id="mobile"
                name="mobile"
                value={toPersianNumber(mobile)}
                onChange={handleMobileChange}
                type="tel"
                dir="ltr"
                autoComplete="mobile"
                className="
                    peer block w-full rounded-2xl px-4 py-2.5 bg-transparent
                    border border-neutral-500 dark:border-neutral-300
                    focus:outline-none focus:border-[#9b956d] dark:focus:border-[#9b956d]
                    sm:text-sm sm:leading-6
                "
              />

              <label
                htmlFor="mobile"
                className={cn(
                  `
                    absolute right-4 text-neutral-500 dark:text-neutral-300
                    transition-all duration-200 ease-out pointer-events-none
                      px-1.5
                    
                    peer-focus:-top-[8px]
                    peer-focus:text-xs
                    peer-focus:bg-white dark:peer-focus:bg-black
                    peer-focus:text-[#9b956d]
                `,
                  mobile.length !== 0
                    ? "-top-[8px] text-xs bg-white dark:bg-black transition-none"
                    : "top-3.5 text-sm"
                )}
              >
                {texts.enterYourPhoneNumberText}
              </label>
            </div>

            <div className='fixed bottom-4 right-1/2 translate-x-1/2 w-full mx-auto sm:max-w-sm px-8 pb-safe'>
              <div className="mb-3 min-h-[1.25rem]">
                {errorMessage && (
                  <p className="text-xs text-red-600 text-center">
                    {errorMessage}
                  </p>
                )}
              </div>

              <button
                className="flex items-center justify-center w-full h-12 mb-safe font-medium bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-2xl hover:bg-black/75 active:bg-black/75 disabled:bg-black/15 dark:hover:bg-white/75 dark:active:bg-white/75 dark:disabled:bg-white/15 transition-opacity cursor-pointer disabled:cursor-auto"
                type="submit"
                onClick={handleFormSubmit}
                disabled={isPending || !validateIranPhone(mobile)}
              >
                {isPending ? (
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
                ) : texts.sendVerificationCodeText
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
