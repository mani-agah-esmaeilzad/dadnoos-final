import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const obligationFulfillmentTemplate: LegalTemplate = {
  title: 'دادخواست الزام به ایفای تعهد',
  description: 'برای الزام طرف مقابل به اجرای تعهدات قراردادی',
  fields: [
    { name: 'contractName', label: 'نام قرارداد', placeholder: 'نام', type: 'text', validation: z.string().optional() },
    { name: 'contractDate', label: 'تاریخ قرارداد', placeholder: 'مثلا: ۱۴۰۲/۰۶/۱۵', type: 'text', validation: z.string().optional() },
    { name: 'contractClause', label: 'بند قرارداد', placeholder: 'مثلا: بند ۵ قرارداد', type: 'text', validation: z.string().optional() },
    { name: 'obligationDescription', label: 'شرح تعهد', placeholder: 'چه کاری باید انجام شود', type: 'textarea', validation: z.string().optional() },
    { name: 'warningLetters', label: 'مکاتبات اخطاریه', placeholder: 'تاریخ و تعداد اخطارها', type: 'textarea', validation: z.string().optional() },
    { name: 'communications', label: 'مکاتبات', placeholder: 'مکاتبات مرتبط', type: 'text', validation: z.string().optional() },
    { name: 'deadlineRequested', label: 'ضرب‌الاجل درخواستی', placeholder: 'مدت زمانی برای انجام تعهد', type: 'text', validation: z.string().optional() },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
