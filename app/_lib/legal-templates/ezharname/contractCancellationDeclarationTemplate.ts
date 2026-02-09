import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const contractCancellationDeclarationTemplate: LegalTemplate = {
  title: 'اظهارنامه فسخ قرارداد',
  description: 'برای اعلام رسمی فسخ قرارداد به طرف مقابل',
  fields: [
    { name: 'reason', label: 'دلایل فسخ', placeholder: 'مثلا: عدم رعایت مفاد قرارداد', type: 'textarea', validation: z.string().min(10, 'دلایل فسخ را وارد کنید') },
    { name: 'effectiveDate', label: 'تاریخ اعمال فسخ', placeholder: 'مثلا: ۱۴۰۵/۰۲/۲۰', type: 'text', validation: z.string().min(3, 'تاریخ را وارد کنید') },
    { name: 'additionalNotes', label: 'یادداشت‌های تکمیلی', placeholder: 'سایر توضیحات', type: 'textarea', validation: z.string().optional() },
  ]
}
