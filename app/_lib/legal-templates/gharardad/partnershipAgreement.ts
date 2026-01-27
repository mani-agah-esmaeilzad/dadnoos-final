import { LegalTemplate } from '@/app/_ui/chat/legalTemplateForm'
import * as z from 'zod'

export const partnershipAgreementTemplate: LegalTemplate = {
  title: 'قرارداد مشارکت',
  description: 'برای تنظیم قرارداد مشارکت تجاری یا پروژه‌ای',
  fields: [
    { name: 'partnershipSubject', label: 'موضوع مشارکت', placeholder: 'پروژه یا فعالیت تجاری', type: 'textarea', validation: z.string().min(10, 'موضوع مشارکت را وارد کنید') },
    { name: 'partnershipPurpose', label: 'هدف مشارکت', placeholder: 'نتیجه مورد انتظار از مشارکت', type: 'textarea', validation: z.string().min(10, 'هدف مشارکت را وارد کنید') },
    { name: 'partner1Contribution', label: 'میزان آورده شریک اول', placeholder: 'سرمایه، تخصص، امکانات', type: 'textarea', validation: z.string().min(5, 'میزان آورده شریک اول را وارد کنید') },
    { name: 'partner2Contribution', label: 'میزان آورده شریک دوم', placeholder: 'سرمایه، تخصص، امکانات', type: 'textarea', validation: z.string().min(5, 'میزان آورده شریک دوم را وارد کنید') },
    { name: 'additionalContributions', label: 'آورده شرکای دیگر', placeholder: 'آورده شرکای اضافی', type: 'textarea', validation: z.string().optional() },
    { name: 'profitShare', label: 'نحوه تقسیم سود', placeholder: 'درصد هر شریک از سود', type: 'text', validation: z.string().min(5, 'نحوه تقسیم سود را مشخص کنید') },
    { name: 'lossShare', label: 'نحوه تقسیم زیان', placeholder: 'درصد هر شریک از زیان', type: 'text', validation: z.string().min(5, 'نحوه تقسیم زیان را مشخص کنید') },
    { name: 'partner1Responsibilities', label: 'مسئولیت‌های شریک اول', placeholder: 'وظایف و اختیارات', type: 'textarea', validation: z.string().min(5, 'مسئولیت‌های شریک اول را وارد کنید') },
    { name: 'partner2Responsibilities', label: 'مسئولیت‌های شریک دوم', placeholder: 'وظایف و اختیارات', type: 'textarea', validation: z.string().min(5, 'مسئولیت‌های شریک دوم را وارد کنید') },
    { name: 'partnershipDuration', label: 'مدت مشارکت', placeholder: 'مدت زمان مشارکت', type: 'text', validation: z.string().min(3, 'مدت مشارکت را وارد کنید') },
    { name: 'exitConditions', label: 'شرایط خروج شریک', placeholder: 'نحوه خروج از مشارکت', type: 'textarea', validation: z.string().optional() },
    { name: 'newPartnerConditions', label: 'ورود شریک جدید', placeholder: 'شرایط پذیرش شریک جدید', type: 'textarea', validation: z.string().optional() },
    { name: 'terminationConditions', label: 'شرایط فسخ', placeholder: 'دلایل فسخ مشارکت', type: 'textarea', validation: z.string().min(10, 'شرایط فسخ را وارد کنید') },
    { name: 'additionalInfo', label: 'اطلاعات تکمیلی', placeholder: 'هرگونه اطلاعات دیگری', type: 'textarea', validation: z.string().optional() },
  ]
}
