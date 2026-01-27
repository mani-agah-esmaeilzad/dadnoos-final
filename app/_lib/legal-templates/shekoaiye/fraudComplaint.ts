import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const fraudComplaintTemplate: LegalTemplate = {
  title: 'شکواییه کلاهبرداری',
  description: 'برای شکایت از جرایم مالی و کلاهبرداری',
  fields: [
    { name: 'fraudDate', label: 'تاریخ وقوع', placeholder: 'تاریخ کلاهبرداری', type: 'text', validation: z.string().min(8, 'تاریخ را وارد کنید') },
    { name: 'fraudMethod', label: 'روش کلاهبرداری', placeholder: 'چگونه کلاهبرداری انجام شد', type: 'textarea', validation: z.string().min(10, 'روش کلاهبرداری را شرح دهید') },
    { name: 'fraudAmount', label: 'مبلغ کلاهبرداری', placeholder: 'به ریال', type: 'text', validation: z.string().min(1, 'مبلغ را وارد کنید') },
    { name: 'fraudDescription', label: 'شرح کلاهبرداری', placeholder: 'توضیح کامل نحوه وقوع', type: 'textarea', validation: z.string().min(20, 'شرح کلاهبرداری باید حداقل ۲۰ کاراکتر باشد') },
    { name: 'postFraudActions', label: 'اقدامات پس از وقوع', placeholder: 'اخطار کتبی، مکاتبه، مراجعه به بانک', type: 'textarea', validation: z.string().optional() },
    { name: 'evidences', label: 'لیست مدارک', placeholder: 'رسید/فیش/حواله', type: 'text', validation: z.string().min(3, 'حداقل یک مدرک را ذکر کنید') },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
