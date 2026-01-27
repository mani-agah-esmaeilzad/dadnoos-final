import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const contractTerminationTemplate: LegalTemplate = {
  title: 'دادخواست فسخ قرارداد و مطالبه خسارت',
  description: 'برای فسخ قرارداد و دریافت خسارت ناشی از نقض قرارداد',
  fields: [
    { name: 'contractName', label: 'نام قرارداد', placeholder: 'نام', type: 'text', validation: z.string().optional() },
    { name: 'contractDate', label: 'تاریخ قرارداد', placeholder: 'مثلا: ۱۴۰۲/۰۶/۱۵', type: 'text', validation: z.string().optional() },
    { name: 'breachedClauses', label: 'بندهای نقض شده', placeholder: 'مثلا: بند ۵، ۷ و ۹', type: 'text', validation: z.string().optional() },
    { name: 'breachDescription', label: 'شرح تخلف/خلاف قرارداد', placeholder: 'توضیح نقض قرارداد', type: 'textarea', validation: z.string().optional() },
    { name: 'warningLetters', label: 'اخطار کتبی', placeholder: 'ضمیمه اخطارهای کتبی', type: 'text', validation: z.string().optional() },
    { name: 'damagesAmount', label: 'مبلغ خسارت درخواستی', placeholder: 'به ریال (اختیاری)', type: 'text', validation: z.string().optional() },
    { name: 'terminationNotice', label: 'اعلام فسخ', placeholder: 'بله یا خیر - آیا فسخ را اعلام کرده‌اید؟', type: 'text', validation: z.string().optional() },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
