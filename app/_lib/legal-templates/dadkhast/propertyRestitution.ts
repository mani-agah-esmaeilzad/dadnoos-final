import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const propertyRestitutionTemplate: LegalTemplate = {
  title: 'دادخواست خلع ید و استرداد ملک',
  description: 'برای بازپس‌گیری ملک از تصرف غیرقانونی',
  fields: [
    { name: 'possessionType', label: 'نوع تصرف', placeholder: 'بدون مجوز، پس از انقضاء عقد، ورود عدوانی', type: 'text', validation: z.string().min(3, 'نوع تصرف را مشخص کنید') },
    { name: 'localReport', label: 'گزارش محلی/شهادت شهود', placeholder: 'ضمیمه گزارش یا شهادت', type: 'text', validation: z.string().optional() },
    { name: 'possessionStartDate', label: 'تاریخ شروع تصرف', placeholder: 'تاریخ شروع تصرف غیرقانونی', type: 'text', validation: z.string().optional() },
    { name: 'courtOrderRequested', label: 'درخواست تأمین', placeholder: 'بله یا خیر - آیا درخواست قرار تأمین دارید؟', type: 'text', validation: z.string().optional() },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
