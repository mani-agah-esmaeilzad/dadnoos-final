import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const sentenceReductionTemplate: LegalTemplate = {
  title: 'لایحه تقاضای تخفیف یا تعلیق مجازات',
  description: 'برای درخواست تخفیف مجازات یا تعلیق اجرای حکم',
  fields: [
    { name: 'requestType', label: 'نوع درخواست', placeholder: 'تخفیف مجازات یا تعلیق اجرای مجازات', type: 'text', validation: z.string().min(5, 'نوع درخواست را مشخص کنید') },
    { name: 'noCriminalRecord', label: 'سابقه کیفری', placeholder: 'توضیح فقدان سابقه مؤثر', type: 'textarea', validation: z.string().optional() },
    { name: 'repentance', label: 'ابراز ندامت', placeholder: 'توضیح ندامت و اقدامات اصلاحی', type: 'textarea', validation: z.string().optional() },
    { name: 'compensation', label: 'جبران خسارت', placeholder: 'توضیح جبران خسارت شاکی', type: 'textarea', validation: z.string().optional() },
    { name: 'familyStatus', label: 'وضعیت خانوادگی', placeholder: 'شرایط خاص خانوادگی', type: 'textarea', validation: z.string().optional() },
    { name: 'socialStatus', label: 'وضعیت اجتماعی', placeholder: 'وضعیت تحصیلی یا شغلی', type: 'textarea', validation: z.string().optional() },
    { name: 'reductionRequest', label: 'درخواست تخفیف', placeholder: 'درصد یا میزان تخفیف درخواستی', type: 'text', validation: z.string().optional() },
    { name: 'suspensionRequest', label: 'درخواست تعلیق', placeholder: 'مدت تعلیق درخواستی', type: 'text', validation: z.string().optional() },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
