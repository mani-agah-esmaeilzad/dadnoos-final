import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const defamationComplaintTemplate: LegalTemplate = {
  title: 'شکواییه توهین و افترا',
  description: 'برای شکایت از توهین، افترا یا نشر اکاذیب',
  fields: [
    { name: 'complaintType', label: 'نوع شکایت', placeholder: 'توهین، افترا، نشر اکاذیب', type: 'text', validation: z.string().min(3, 'نوع شکایت را مشخص کنید') },
    { name: 'incidentDate', label: 'تاریخ وقوع', placeholder: 'تاریخ توهین/افترا', type: 'text', validation: z.string().min(8, 'تاریخ را وارد کنید') },
    { name: 'incidentLocation', label: 'محل وقوع', placeholder: 'محل بیان یا انتشار', type: 'text', validation: z.string().min(3, 'محل وقوع را مشخص کنید') },
    { name: 'incidentDescription', label: 'شرح وقوع', placeholder: 'توضیح کامل نحوه وقوع', type: 'textarea', validation: z.string().min(20, 'شرح وقوع باید حداقل ۲۰ کاراکتر باشد') },
    { name: 'publicationMethod', label: 'مرجع انتشار', placeholder: 'کلامی، کتبی، رسانه، فضای مجازی', type: 'text', validation: z.string().min(3, 'مرجع انتشار را مشخص کنید') },
    { name: 'publicationText', label: 'متن/محتوای منتشر شده', placeholder: 'متن توهین‌آمیز یا افترا', type: 'textarea', validation: z.string().min(10, 'متن منتشر شده را وارد کنید') },
    { name: 'audienceInfo', label: 'مخاطبان و گستره نشر', placeholder: 'چه کسانی مطلع شدند', type: 'textarea', validation: z.string().optional() },
    { name: 'effects', label: 'آثار و پیامدها', placeholder: 'تأثیر بر حیثیت و آبروی شما', type: 'textarea', validation: z.string().optional() },
    { name: 'evidences', label: 'لیست مدارک', placeholder: 'اسکرین‌شات/پرینت صفحات/لینک‌ها', type: 'text', validation: z.string().min(3, 'حداقل یک مدرک را ذکر کنید') },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
