import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const appealPetitionTemplate: LegalTemplate = {
  title: 'لایحه اعتراضی به رأی دادگاه',
  description: 'برای اعتراض به دادنامه از طریق واخواهی یا تجدیدنظر',
  fields: [
    { name: 'appealType', label: 'نوع اعتراض', placeholder: 'واخواهی یا تجدیدنظر', type: 'text', validation: z.string().min(3, 'نوع اعتراض را مشخص کنید') },
    { name: 'formalDefects', label: 'ایرادات شکلی', placeholder: 'عدم رعایت صلاحیت، عدم دعوت طرفین، نقص تحقیقات', type: 'textarea', validation: z.string().optional() },
    { name: 'substantiveDefects', label: 'ایرادات ماهوی', placeholder: 'عدم انطباق با دلایل، مغایرت با قانون', type: 'textarea', validation: z.string().optional() },
    { name: 'requestedAction', label: 'درخواست نهایی', placeholder: 'نقض دادنامه یا صدور حکم مقتضی', type: 'text', validation: z.string().min(5, 'درخواست را مشخص کنید') },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
