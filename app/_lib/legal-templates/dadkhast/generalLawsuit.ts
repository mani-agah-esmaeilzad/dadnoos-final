import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const generalLawsuitTemplate: LegalTemplate = {
  title: 'فرم هوشمند دادخواست سایر',
  description: 'قابل تطبیق برای هر نوع دادخواست',
  fields: [
    { name: 'lawsuitType', label: 'نوع دادخواست', placeholder: 'حقوقی، کیفری، خانوادگی، تجاری، اداری، سایر', type: 'text', validation: z.string().optional() },
    { name: 'lawsuitSubject', label: 'موضوع/عنوان کوتاه', placeholder: 'عنوان دادخواست', type: 'text', validation: z.string().optional() },
    { name: 'financialAmount', label: 'مبلغ/ضرر مالی', placeholder: 'در صورت وجود، به ریال', type: 'text', validation: z.string().optional() },
    { name: 'eventDescription', label: 'شرح واقعه', placeholder: 'رویدادها به ترتیب زمانی، حداقل ۳ سطر', type: 'textarea', validation: z.string().optional() },
    { name: 'keyDates', label: 'تاریخ‌های کلیدی', placeholder: 'تاریخ‌های مهم در پرونده', type: 'textarea', validation: z.string().optional() },
    { name: 'evidenceList', label: 'مستندات و مدارک', placeholder: 'فهرست مدارک ضمیمه', type: 'textarea', validation: z.string().optional() },
    { name: 'mainRequest', label: 'درخواست اصلی', placeholder: 'چه نتیجه‌ای از دادگاه می‌خواهید؟', type: 'textarea', validation: z.string().optional() },
    { name: 'secondaryRequest', label: 'درخواست فرعی', placeholder: 'درخواست‌های اضافی', type: 'textarea', validation: z.string().optional() },
    { name: 'securityRequested', label: 'درخواست تأمین خواسته', placeholder: 'بله یا خیر - آیا درخواست تأمین دارید؟', type: 'text', validation: z.string().optional() },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}