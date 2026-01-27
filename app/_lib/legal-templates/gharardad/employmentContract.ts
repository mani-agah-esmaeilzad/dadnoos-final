import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const employmentContractTemplate: LegalTemplate = {
  title: 'قرارداد کار',
  description: 'برای تنظیم قرارداد استخدام و شرایط کاری',
  fields: [
    { name: 'jobTitle', label: 'عنوان شغلی', placeholder: 'مثلا: برنامه‌نویس، مدیر فروش', type: 'text', validation: z.string().min(3, 'عنوان شغلی را وارد کنید') },
    { name: 'jobDescription', label: 'شرح وظایف', placeholder: 'توضیح وظایف و مسئولیت‌ها', type: 'textarea', validation: z.string().min(10, 'شرح وظایف را وارد کنید') },
    { name: 'contractType', label: 'نوع قرارداد', placeholder: 'موقت، دائم، پروژه‌ای', type: 'text', validation: z.string().min(3, 'نوع قرارداد را مشخص کنید') },
    { name: 'contractDuration', label: 'مدت قرارداد', placeholder: 'مثلا: ۱ سال یا تا پایان پروژه', type: 'text', validation: z.string().min(3, 'مدت قرارداد را وارد کنید') },
    { name: 'workHours', label: 'ساعات کار', placeholder: 'مثلا: ۸ ساعت در روز، ۶ روز در هفته', type: 'text', validation: z.string().min(5, 'ساعات کار را مشخص کنید') },
    { name: 'workLocation', label: 'محل کار', placeholder: 'آدرس محل انجام کار', type: 'textarea', validation: z.string().min(10, 'محل کار را وارد کنید') },
    { name: 'salaryAmount', label: 'میزان حقوق', placeholder: 'مبلغ ماهانه به تومان', type: 'text', validation: z.string().min(3, 'میزان حقوق را وارد کنید') },
    { name: 'insurance', label: 'بیمه', placeholder: 'نوع پوشش بیمه‌ای', type: 'text', validation: z.string().optional() },
    { name: 'benefits', label: 'مزایا', placeholder: 'پاداش، مزایای رفاهی، مرخصی', type: 'textarea', validation: z.string().optional() },
    { name: 'terminationConditions', label: 'شرایط فسخ', placeholder: 'دلایل فسخ قرارداد', type: 'textarea', validation: z.string().min(10, 'شرایط فسخ را وارد کنید') },
    { name: 'employerObligations', label: 'تعهدات کارفرما', placeholder: 'تعهدات کارفرما', type: 'textarea', validation: z.string().optional() },
    { name: 'employeeObligations', label: 'تعهدات کارمند', placeholder: 'تعهدات کارمند', type: 'textarea', validation: z.string().optional() },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
