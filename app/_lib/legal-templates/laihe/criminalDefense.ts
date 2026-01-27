import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const criminalDefenseTemplate: LegalTemplate = {
  title: 'لایحه دفاعیه در پرونده کیفری',
  description: 'برای ارائه لایحه دفاعیه در پرونده‌های کیفری مانند اتهام ضرب و جرح',
  fields: [
    { name: 'chargeType', label: 'نوع اتهام', placeholder: 'ضرب و جرح، سرقت، کلاهبرداری', type: 'text', validation: z.string().min(3, 'نوع اتهام را وارد کنید') },
    { name: 'defenseSummary', label: 'شرح واقعه از دیدگاه دفاع', placeholder: 'توضیح کامل دیدگاه دفاعی', type: 'textarea', validation: z.string().min(20, 'شرح واقعه را وارد کنید') },
    { name: 'contradictions', label: 'بررسی تناقضات', placeholder: 'تناقضات اظهارات شاکی یا گزارش مأمورین', type: 'textarea', validation: z.string().min(10, 'تناقضات را شرح دهید') },
    { name: 'defenseEvidence', label: 'دلایل برائت یا تخفیف', placeholder: 'گواهی پزشکی، شهادت شهود، فقدان سوءنیت', type: 'textarea', validation: z.string().min(10, 'دلایل را وارد کنید') },
    { name: 'verdictRequest', label: 'نوع حکم درخواستی', placeholder: 'برائت یا تخفیف مجازات', type: 'text', validation: z.string().min(3, 'نوع حکم را مشخص کنید') },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
