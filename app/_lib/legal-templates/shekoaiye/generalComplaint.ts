import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const generalComplaintTemplate: LegalTemplate = {
  title: 'فرم هوشمند شکواییه سایر',
  description: 'قابل تطبیق برای انواع شکایات',
  fields: [
    { name: 'crimeCategory', label: 'دسته جرم', placeholder: 'مالی، علیه اشخاص، اداری، ضد امنیتی، نشر و شهرت', type: 'text', validation: z.string().min(3, 'دسته جرم را وارد کنید') },
    { name: 'complaintTitle', label: 'عنوان شکایت', placeholder: 'عنوان اصلی شکایت', type: 'text', validation: z.string().min(5, 'عنوان شکایت را وارد کنید') },
    { name: 'incidentSequence', label: 'ترتیب وقایع', placeholder: 'شرح وقایع به ترتیب زمانی', type: 'textarea', validation: z.string().min(30, 'ترتیب وقایع باید حداقل ۳۰ کاراکتر باشد') },
    { name: 'incidentEffects', label: 'آثار و نتایج', placeholder: 'خسارت مادی، معنوی، اخلال در کسب و کار', type: 'textarea', validation: z.string().optional() },
    { name: 'evidenceList', label: 'فهرست ادله و مستندات', placeholder: 'شماره‌گذاری شده', type: 'textarea', validation: z.string().min(10, 'حداقل یک ادله را ذکر کنید') },
    { name: 'requestedActions', label: 'اقدامات درخواستی', placeholder: 'تعقیب کیفری، تأمین، توقیف اموال', type: 'textarea', validation: z.string().min(10, 'اقدامات درخواستی را مشخص کنید') },
    { name: 'urgencyNeeded', label: 'نیاز به تأمین فوری', placeholder: 'بله یا خیر - دلایل فوریت', type: 'text', validation: z.string().optional() },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}