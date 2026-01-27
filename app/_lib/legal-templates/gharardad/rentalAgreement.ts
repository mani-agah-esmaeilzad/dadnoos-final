import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const rentalAgreementTemplate: LegalTemplate = {
  title: 'قرارداد اجاره',
  description: 'برای تنظیم قرارداد اجاره ملک، خودرو یا سایر دارایی‌ها',
  fields: [
    { name: 'propertyType', label: 'نوع مورد اجاره', placeholder: 'ملک مسکونی، تجاری، خودرو، تجهیزات', type: 'text', validation: z.string().min(3, 'نوع مورد اجاره را مشخص کنید') },
    { name: 'propertyDescription', label: 'مشخصات مورد اجاره', placeholder: 'آدرس، پلاک، متراژ، مشخصات فنی', type: 'textarea', validation: z.string().min(15, 'مشخصات مورد اجاره را وارد کنید') },
    { name: 'rentalPeriod', label: 'مدت اجاره', placeholder: 'مثلا: ۱ سال یا ماه به ماه', type: 'text', validation: z.string().min(3, 'مدت اجاره را وارد کنید') },
    { name: 'rentalAmount', label: 'مبلغ اجاره ماهیانه', placeholder: 'به تومان', type: 'text', validation: z.string().min(3, 'مبلغ اجاره را وارد کنید') },
    { name: 'paymentMethod', label: 'نحوه پرداخت', placeholder: 'نقدی، چک، کارت به کارت', type: 'text', validation: z.string().min(3, 'نحوه پرداخت را مشخص کنید') },
    { name: 'paymentSchedule', label: 'زمان پرداخت', placeholder: 'اول هر ماه، آخر هر ماه', type: 'text', validation: z.string().min(3, 'زمان پرداخت را مشخص کنید') },
    { name: 'usageConditions', label: 'شرایط استفاده', placeholder: 'نحوه استفاده مجاز از مورد اجاره', type: 'textarea', validation: z.string().optional() },
    { name: 'maintenanceResponsibility', label: 'مسئولیت نگهداری', placeholder: 'چه کسی مسئول تعمیرات است', type: 'textarea', validation: z.string().min(10, 'مسئولیت نگهداری را مشخص کنید') },
    { name: 'damageLiability', label: 'مسئولیت خسارات', placeholder: 'مسئولیت در صورت آسیب', type: 'textarea', validation: z.string().min(10, 'مسئولیت خسارات را مشخص کنید') },
    { name: 'terminationConditions', label: 'شرایط فسخ', placeholder: 'دلایل فسخ قرارداد', type: 'textarea', validation: z.string().min(10, 'شرایط فسخ را وارد کنید') },
    { name: 'depositAmount', label: 'مبلغ ودیعه', placeholder: 'به تومان (اختیاری)', type: 'text', validation: z.string().optional() },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
