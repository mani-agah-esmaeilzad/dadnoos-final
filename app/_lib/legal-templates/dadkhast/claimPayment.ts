import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const claimPaymentTemplate: LegalTemplate = {
  title: 'دادخواست مطالبه وجه',
  description: 'برای مطالبه مبلغ معوق از بدهکار',
  fields: [
    { name: 'contractDate', label: 'تاریخ قرارداد/معامله', placeholder: 'مثلا: ۱۴۰۲/۰۶/۱۵', type: 'text', validation: z.string().optional() },
    { name: 'contractDescription', label: 'شرح قرارداد/معامله', placeholder: 'یک جمله خلاصه', type: 'textarea', validation: z.string().optional() },
    { name: 'evidences', label: 'لیست مدارک', placeholder: 'مثلا: قرارداد مورخ ...', type: 'text', validation: z.string().optional() },
    { name: 'defaultDate', label: 'تاریخ سررسید', placeholder: 'تاریخ که پرداخت باید انجام می‌شد', type: 'text', validation: z.string().optional() },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
