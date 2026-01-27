const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

function replaceLocaleDigits(value: string) {
  return value.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit)
    if (persianIndex >= 0) return String(persianIndex)
    const arabicIndex = ARABIC_DIGITS.indexOf(digit)
    if (arabicIndex >= 0) return String(arabicIndex)
    return digit
  })
}

export function normalizeSlug(value: string) {
  if (!value) return ''
  const normalized = replaceLocaleDigits(
    value
      .trim()
      .toLowerCase()
      .normalize('NFKD')
  )

  const slug = normalized
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug
}
