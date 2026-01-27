import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const cyberCrimeComplaintTemplate: LegalTemplate = {
  title: 'شکواییه جرایم اینترنتی و تلفنی',
  description: 'برای شکایت از جرایم رایانه‌ای، هک، برداشت غیرمجاز',
  fields: [
    { name: 'crimeType', label: 'نوع جرم رایانه‌ای', placeholder: 'هک، برداشت غیرمجاز، نشر اکاذیب اینترنتی، دسترسی غیرمجاز', type: 'text', validation: z.string().min(5, 'نوع جرم را مشخص کنید') },
    { name: 'incidentDateTime', label: 'تاریخ و زمان وقوع', placeholder: 'تاریخ و ساعت دقیق وقوع', type: 'text', validation: z.string().min(8, 'تاریخ و زمان را وارد کنید') },
    { name: 'incidentMethod', label: 'روش وقوع', placeholder: 'اپلیکیشن، وب‌سایت، ایمیل، پیام‌رسان', type: 'text', validation: z.string().min(3, 'روش وقوع را مشخص کنید') },
    { name: 'technicalDescription', label: 'شرح فنی', placeholder: 'توضیح فنی نحوه وقوع و پیامدها', type: 'textarea', validation: z.string().min(20, 'شرح فنی باید حداقل ۲۰ کاراکتر باشد') },
    { name: 'technicalActions', label: 'اقدامات فنی انجام شده', placeholder: 'گزارش به سرویس‌دهنده، بلاک کردن، پاسخ پشتیبانی', type: 'textarea', validation: z.string().optional() },
    { name: 'evidences', label: 'لیست مدرک', placeholder: 'لاگ‌ها/اسکرین‌شات/پیام‌ها', type: 'text', validation: z.string().min(3, 'حداقل یک مدرک فنی را ذکر کنید') },
    { name: 'damages', label: 'خسارات وارده', placeholder: 'مالی، معنوی، فنی', type: 'textarea', validation: z.string().optional() },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
