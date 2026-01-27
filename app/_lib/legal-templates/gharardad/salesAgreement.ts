import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const salesAgreementTemplate: LegalTemplate = {
  title: 'قرارداد خرید و فروش',
  description: 'برای تنظیم قرارداد خرید و فروش کالا، ملک یا خدمات',
  fields: [
    { name: 'itemType', label: 'نوع مورد معامله', placeholder: 'کالا، ملک، خدمات، دارایی', type: 'text', validation: z.string().min(3, 'نوع مورد معامله را مشخص کنید') },
    { name: 'itemDescription', label: 'مشخصات مورد معامله', placeholder: 'شرح کامل کالا/خدمات/ملک', type: 'textarea', validation: z.string().min(15, 'مشخصات مورد معامله را وارد کنید') },
    { name: 'itemValue', label: 'ارزش مورد معامله', placeholder: 'مبلغ کل به تومان', type: 'text', validation: z.string().min(3, 'ارزش مورد معامله را وارد کنید') },
    { name: 'paymentMethod', label: 'نحوه پرداخت', placeholder: 'نقدی، چک، کارت به کارت، اقساطی', type: 'text', validation: z.string().min(3, 'نحوه پرداخت را مشخص کنید') },
    { name: 'paymentSchedule', label: 'زمان‌بندی پرداخت', placeholder: 'یکجا، چند مرحله‌ای', type: 'textarea', validation: z.string().min(5, 'زمان‌بندی پرداخت را مشخص کنید') },
    { name: 'deliveryConditions', label: 'شرایط تحویل', placeholder: 'زمان، مکان، شرایط تحویل', type: 'textarea', validation: z.string().min(10, 'شرایط تحویل را وارد کنید') },
    { name: 'sellerWarranties', label: 'ضمانت‌های فروشنده', placeholder: 'تضمین کیفیت، اصالت، کارکرد', type: 'textarea', validation: z.string().min(10, 'ضمانت‌های فروشنده را وارد کنید') },
    { name: 'sellerObligations', label: 'تعهدات فروشنده', placeholder: 'تعهدات فروشنده', type: 'textarea', validation: z.string().optional() },
    { name: 'buyerObligations', label: 'تعهدات خریدار', placeholder: 'تعهدات خریدار', type: 'textarea', validation: z.string().optional() },
    { name: 'terminationConditions', label: 'شرایط فسخ یا ابطال', placeholder: 'دلایل فسخ قرارداد', type: 'textarea', validation: z.string().min(10, 'شرایط فسخ را وارد کنید') },
    { name: 'disputeResolution', label: 'مرجع حل اختلاف', placeholder: 'دادگاه، داوری، میانجی‌گری', type: 'text', validation: z.string().min(3, 'مرجع حل اختلاف را مشخص کنید') },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
