import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const generalPetitionTemplate: LegalTemplate = {
  title: 'لایحه سایر - فرم هوشمند',
  description: 'قابل تطبیق برای انواع مختلف لایحه',
  fields: [
    { name: 'petitionSubject', label: 'موضوع لایحه', placeholder: 'عنوان اصلی لایحه', type: 'text', validation: z.string().min(5, 'موضوع را وارد کنید') },
    { name: 'petitionDescription', label: 'شرح موضوع و دلایل', placeholder: 'توضیح کامل موضوع و دلایل', type: 'textarea', validation: z.string().min(30, 'شرح موضوع را وارد کنید') },
    { name: 'request1', label: 'درخواست ۱', placeholder: 'اولین درخواست', type: 'text', validation: z.string().min(5, 'حداقل یک درخواست را وارد کنید') },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}