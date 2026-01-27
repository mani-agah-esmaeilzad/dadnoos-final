import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const generalContractTemplate: LegalTemplate = {
  title: 'قرارداد سایر - فرم هوشمند',
  description: 'قابل تطبیق برای قراردادهای متنوع مانند محرمانگی، مشاوره، پیمانکاری',
  fields: [
    { name: 'contractType', label: 'نوع قرارداد', placeholder: 'محرمانگی، مشاوره، پیمانکاری، خدمات', type: 'text', validation: z.string().min(3, 'نوع قرارداد را مشخص کنید') },
    { name: 'contractSubject', label: 'موضوع قرارداد', placeholder: 'هدف و موضوع اصلی قرارداد', type: 'textarea', validation: z.string().min(10, 'موضوع قرارداد را وارد کنید') },
    { name: 'contractPurpose', label: 'هدف قرارداد', placeholder: 'نتیجه مورد انتظار از قرارداد', type: 'textarea', validation: z.string().min(10, 'هدف قرارداد را وارد کنید') },
    { name: 'contractDuration', label: 'مدت قرارداد', placeholder: 'مدت اعتبار قرارداد', type: 'text', validation: z.string().min(3, 'مدت قرارداد را وارد کنید') },
    { name: 'party1Obligations', label: 'تعهدات طرف اول', placeholder: 'تعهدات و وظایف طرف اول', type: 'textarea', validation: z.string().min(10, 'تعهدات طرف اول را وارد کنید') },
    { name: 'party2Obligations', label: 'تعهدات طرف دوم', placeholder: 'تعهدات و وظایف طرف دوم', type: 'textarea', validation: z.string().min(10, 'تعهدات طرف دوم را وارد کنید') },
    { name: 'paymentTerms', label: 'شرایط پرداخت', placeholder: 'مبلغ، زمان، نحوه پرداخت', type: 'textarea', validation: z.string().min(5, 'شرایط پرداخت را مشخص کنید') },
    { name: 'confidentiality', label: 'تعهد محرمانگی', placeholder: 'در صورت وجود تعهد محرمانگی', type: 'textarea', validation: z.string().optional() },
    { name: 'terminationConditions', label: 'شرایط فسخ', placeholder: 'دلایل فسخ قرارداد', type: 'textarea', validation: z.string().min(10, 'شرایط فسخ را وارد کنید') },
    { name: 'disputeResolution', label: 'مرجع حل اختلاف', placeholder: 'دادگاه، داوری، میانجی‌گری', type: 'text', validation: z.string().min(3, 'مرجع حل اختلاف را مشخص کنید') },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}