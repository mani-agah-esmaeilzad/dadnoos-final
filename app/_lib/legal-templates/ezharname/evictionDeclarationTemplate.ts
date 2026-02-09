import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const evictionDeclarationTemplate: LegalTemplate = {
  title: 'اظهارنامه تخلیه ملک',
  description: 'برای اعلام رسمی تخلیه ملک به مستاجر',
  fields: [
    { name: 'reason', label: 'دلیل تخلیه', placeholder: 'مثلا: پایان قرارداد، عدم پرداخت اجاره', type: 'textarea', validation: z.string().min(10, 'دلیل تخلیه را وارد کنید') },
    { name: 'deadline', label: 'مهلت تخلیه', placeholder: 'مثلا: تا تاریخ ۱۴۰۵/۰۳/۰۱', type: 'text', validation: z.string().min(3, 'مهلت تخلیه را وارد کنید') },
    { name: 'additionalNotes', label: 'یادداشت‌های تکمیلی', placeholder: 'سایر توضیحات', type: 'textarea', validation: z.string().optional() },
  ]
}
