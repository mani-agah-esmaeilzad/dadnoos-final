'use client'

import { MapPin, Phone, Smartphone, Mail, Twitter, Instagram, Linkedin } from 'lucide-react'
import { toPersianNumber } from '@/app/_lib/utils'
import Image from 'next/image'

interface CompanyInfoProps {
  showDescription?: boolean
}

export default function CompanyInfo({ showDescription = true }: CompanyInfoProps) {
  const classColor = showDescription ? "md:hover:text-white/50 active:text-white/50" : "md:hover:text-black/50 active:text-black/50 dark:md:hover:text-white/50 dark:active:text-white/50"
  return (
    <>
      <div className="sm:col-span-2 xl:col-span-3">
        <Image width={500} height={500} src="/logo.png" alt="Dadnoos" className="w-24 mb-2" />
        <div className="flex gap-6 mb-10">
          <a className={classColor} href="#"><Twitter /></a>
          <a className={classColor} href="#"><Linkedin /></a>
          <a className={classColor} href="https://instagram.com/dadnoos"><Instagram /></a>
          <a className={classColor} href="https://wa.me/98981298080">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-[22px]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.52 3.478A11.884 11.884 0 0012 0C5.373 0 0 5.373 0 12c0 2.125.555 4.103 1.52 5.878L0 24l6.357-1.558A11.885 11.885 0 0012 24c6.627 0 12-5.373 12-12 0-3.192-1.246-6.183-3.48-8.522zM12 22c-1.978 0-3.84-.574-5.37-1.557l-.383-.229-3.768.924.993-3.689-.255-.386A9.96 9.96 0 012 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10zm5.39-7.102c-.27-.135-1.598-.788-1.845-.878-.247-.092-.427-.134-.607.135-.18.27-.696.878-.854 1.06-.157.18-.314.203-.583.068-.27-.135-1.137-.42-2.164-1.334-.8-.712-1.34-1.593-1.497-1.864-.157-.27-.017-.416.118-.55.12-.12.27-.314.404-.47.135-.157.18-.27.27-.45.09-.18.045-.338-.022-.472-.067-.135-.607-1.46-.83-2-.22-.526-.444-.455-.607-.464l-.52-.01c-.18 0-.472.067-.72.338s-.944.922-.944 2.246c0 1.324.967 2.605 1.1 2.787.135.18 1.898 2.896 4.6 4.057.644.278 1.144.444 1.534.568.644.206 1.232.177 1.697.108.518-.074 1.598-.652 1.824-1.283.225-.63.225-1.169.157-1.283-.067-.114-.245-.18-.515-.315z" />
            </svg>
          </a>
        </div>
        {showDescription && (
          <p className="text-xs text-neutral-200 leading-5">
            دادنوس، نخستین دستیار هوش مصنوعی حقوقی در ایران است که بر پایه قوانین، مقررات، لوایح، برنامه‌ها، آرای وحدت رویه و نظریات مشورتی کشور آموزش دیده است. این دستیار هوشمند با افتخار برای جامعه محترم وکلا و مشاوران حقوقی و همچنین مدیران و صاحبان کسب‌وکار طراحی شده تا در کوتاه‌ترین زمان، پاسخ‌های حقوقی دقیق همراه با ذکر منبع ارائه کند، پیش‌نویس قراردادها و اسناد حقوقی را تدوین نماید و ریسک‌های حقوقی قراردادهای موجود را برای مدیران محترم کسب‌وکارها تحلیل کند.
            دادنوس با هدف صرفه‌جویی در زمان، افزایش دقت و تکیه بر منابع موثق، این افتخار را دارد که به‌عنوان یک دستیار حقوقی هوشمند، همراه مطمئن شما در مسیر پرچالش تصمیم‌گیری‌های حقوقی باشد.
          </p>
        )}
      </div>

      <div className="sm:order-2 sm:col-span-2 xl:col-span-3">
        {showDescription && (
          <h3 className="text-lg font-semibold mb-4">ارتباط با ما</h3>
        )}
        <ul className="space-y-5 text-sm">
          <li className="flex items-start gap-2 group">
            <MapPin className="size-4 shrink-0 mt-1 group-active:text-blue-500 group-hover:text-blue-500" />
            <a href="https://maps.app.goo.gl/k7XiTd4h65NUfvER8?g_st=ipc" target="_blank" rel="noopener noreferrer" className="leading-relaxed hover:text-blue-500 active:text-blue-500">
              تهران، چهارراه جهان کودک، بزرگراه حقانی، مرکز رشد واحدهای فناور دانشگاه علامه طباطبایی، شرکت فانوس ای آی
            </a>
          </li>
          <li className="flex items-center gap-2 group">
            <Phone className="size-4 group-active:text-blue-500 group-hover:text-blue-500" />
            <a href="tel:+982171058720" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 active:text-blue-500" dir='ltr'>
              {toPersianNumber(`021 7105 8720`)}
            </a>
          </li>
          <li className="flex items-center gap-2 group">
            <Smartphone className="size-4 group-active:text-blue-500 group-hover:text-blue-500" />
            <a href="tel:+98981298080" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 active:text-blue-500" dir='ltr'>
              {toPersianNumber(`0998 129 8080`)}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Mail className="size-4" />
            <span>info@dadnoos.com</span>
          </li>
        </ul>
      </div>
    </>
  )
}