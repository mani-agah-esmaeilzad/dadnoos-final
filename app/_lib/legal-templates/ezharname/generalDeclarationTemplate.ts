import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const generalDeclarationTemplate: LegalTemplate = {
  title: 'اظهارنامه عمومی',
  description: 'برای سایر امور حقوقی که نیاز به اظهارنامه دارد',
  fields: [
    { name: 'description', label: 'توضیحات', placeholder: 'متن اظهارنامه', type: 'textarea', validation: z.string().min(10, 'توضیحات را وارد کنید') },
    { name: 'additionalNotes', label: 'یادداشت‌های تکمیلی', placeholder: 'سایر توضیحات', type: 'textarea', validation: z.string().optional() },
  ]
}
