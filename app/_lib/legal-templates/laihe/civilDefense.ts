import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const civilDefenseTemplate: LegalTemplate = {
  title: 'لایحه دفاعیه در دعاوی حقوقی',
  description: 'برای ارائه لایحه دفاعیه در پرونده‌های حقوقی مانند مطالبه وجه یا قرارداد',
  fields: [
    { name: 'claimType', label: 'نوع دعوا', placeholder: 'مطالبه وجه، قرارداد، خسارت', type: 'text', validation: z.string().min(3, 'نوع دعوا را وارد کنید') },
    { name: 'contractValidity', label: 'اعتراض به صحت قرارداد', placeholder: 'توضیح عدم رعایت شرایط صحت معاملات', type: 'textarea', validation: z.string().optional() },
    { name: 'paymentEvidence', label: 'مدرک ایفای دین', placeholder: 'رسید بانکی، تهاتر، قبض', type: 'text', validation: z.string().optional() },
    { name: 'goodFaithViolation', label: 'نقض حسن نیت', placeholder: 'توضیح مغایرت با اصول حسن نیت', type: 'textarea', validation: z.string().optional() },
    { name: 'defenseRequest', label: 'درخواست دفاعیه', placeholder: 'رد دعوا یا محکومیت به هزینه‌ها', type: 'text', validation: z.string().min(5, 'درخواست را مشخص کنید') },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
