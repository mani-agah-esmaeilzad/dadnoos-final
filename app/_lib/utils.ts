import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toPersianNumber(number: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  return number.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}

export function toEnglishNumber(str: string) {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',]
  return str
    .split('')
    .map(c => {
      if (englishNumbers.includes(c)) return englishNumbers.indexOf(c).toString()
      if (persianNumbers.includes(c)) return persianNumbers.indexOf(c).toString()
      if (arabicNumbers.includes(c)) return arabicNumbers.indexOf(c).toString()
      return c
    })
    .join('')
}

export function normalizeIranPhone(rawPhone: string): string {
  const digitsOnly = toEnglishNumber(rawPhone).replace(/\D/g, '')

  if (!digitsOnly) {
    return ''
  }

  if (digitsOnly.startsWith('0098')) {
    return normalizeIranPhone(digitsOnly.slice(4))
  }

  if (digitsOnly.startsWith('98')) {
    return normalizeIranPhone(digitsOnly.slice(2))
  }

  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    return digitsOnly
  }

  if (digitsOnly.startsWith('9') && digitsOnly.length === 10) {
    return `0${digitsOnly}`
  }

  return digitsOnly
}
