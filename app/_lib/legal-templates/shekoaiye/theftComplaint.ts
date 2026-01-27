import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const theftComplaintTemplate: LegalTemplate = {
  title: 'شکواییه سرقت و خیانت در امانت',
  description: 'برای شکایت از سرقت یا خیانت در امانت',
  fields: [
    { name: 'crimeType', label: 'نوع جرم', placeholder: 'سرقت یا خیانت در امانت', type: 'text', validation: z.string().min(3, 'نوع جرم را مشخص کنید') },
    { name: 'incidentDate', label: 'تاریخ وقوع', placeholder: 'تاریخ سرقت/خیانت', type: 'text', validation: z.string().min(8, 'تاریخ را وارد کنید') },
    { name: 'incidentLocation', label: 'محل وقوع', placeholder: 'آدرس محل وقوع', type: 'textarea', validation: z.string().min(5, 'محل وقوع را مشخص کنید') },
    { name: 'incidentDescription', label: 'شرح واقعه', placeholder: 'توضیح کامل نحوه وقوع', type: 'textarea', validation: z.string().min(20, 'شرح واقعه باید حداقل ۲۰ کاراکتر باشد') },
    { name: 'theftMethod', label: 'روش ارتکاب', placeholder: 'ورود غیرمجاز، شکستن قفل، استفاده خلاف از امانت', type: 'text', validation: z.string().min(5, 'روش ارتکاب را شرح دهید') },
    { name: 'stolenItems', label: 'فهرست اموال', placeholder: 'لیست اموال مسروقه با ارزش یا شماره سریال', type: 'textarea', validation: z.string().min(10, 'فهرست اموال را وارد کنید') },
    { name: 'notificationTime', label: 'زمان اطلاع رسانی', placeholder: 'زمان اطلاع از وقوع جرم', type: 'text', validation: z.string().optional() },
    { name: 'initialActions', label: 'اقدامات اولیه', placeholder: 'اقدامات انجام شده پس از اطلاع', type: 'textarea', validation: z.string().optional() },
    { name: 'evidences', label: 'لیست مدارک', placeholder: 'فاکتور/پلاک/سند مالکیت', type: 'text', validation: z.string().min(3, 'حداقل یک مدرک را ذکر کنید') },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
