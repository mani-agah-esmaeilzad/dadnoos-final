export type ModuleId =
  | 'contract_review'
  | 'document_brief_analysis'
  | 'petitions_complaints'
  | 'contract_drafting'
  | 'generic_chat'

export interface ModuleFieldDefinition {
  key: string
  label: string
  description?: string
  required?: boolean
}

export interface ModuleConfig {
  id: ModuleId
  name: string
  intakeRequired: boolean
  domain: string
  fields: ModuleFieldDefinition[]
}

const FIELD = (key: string, label: string, description?: string, required = true) => ({
  key,
  label,
  description,
  required,
})

export const MODULE_CONFIGS: Record<ModuleId, ModuleConfig> = {
  contract_review: {
    id: 'contract_review',
    name: 'تحلیل قرارداد',
    intakeRequired: false,
    domain: 'contracts',
    fields: [
      FIELD('contract_text', 'متن کامل یا بندهای کلیدی قرارداد', 'می‌تواند خلاصه کلوزها یا متن کامل باشد.'),
      FIELD('user_role', 'سمت کاربر در قرارداد', 'مانند کارفرما، پیمانکار، فروشنده، خریدار.'),
      FIELD('objectives', 'اهداف اصلی و نگرانی‌های ریسک', undefined, false),
    ],
  },
  document_brief_analysis: {
    id: 'document_brief_analysis',
    name: 'تحلیل لوایح و آراء',
    intakeRequired: false,
    domain: 'procedure',
    fields: [
      FIELD('document_text', 'متن لایحه/رأی/دادخواست', 'خلاصه متن، نقل‌قول یا فایل استخراج شده.'),
      FIELD('procedural_stage', 'مرحله رسیدگی', 'بدوی، تجدیدنظر، فرجام، شورای حل اختلاف و ...'),
      FIELD('user_goal', 'هدف کاربر از تحلیل', 'دفاع، اصلاح، آماده‌سازی جلسه و ...'),
    ],
  },
  petitions_complaints: {
    id: 'petitions_complaints',
    name: 'تنظیم دادخواست/شکواییه',
    intakeRequired: true,
    domain: 'procedure',
    fields: [
      FIELD('case_type', 'نوع پرونده', 'حقوقی، کیفری، خانواده، کار و ...'),
      FIELD('authority', 'مرجع و صلاحیت', 'دادگاه، دادسرا، شورا، دیوان و ...'),
      FIELD('branch', 'شعبه یا شهر', undefined, false),
      FIELD('parties', 'مشخصات طرفین', 'خواهان/خوانده یا شاکی/مشتکی‌عنه'),
      FIELD('claim', 'خواسته یا درخواست اصلی'),
      FIELD('facts_timeline', 'شرح ماوقع و تاریخچه'),
      FIELD('evidence_list', 'دلایل و مستندات'),
      FIELD('deadlines', 'ابلاغ یا مهلت مهم', undefined, false),
    ],
  },
  contract_drafting: {
    id: 'contract_drafting',
    name: 'تنظیم قرارداد جدید',
    intakeRequired: true,
    domain: 'contracts',
    fields: [
      FIELD('contract_type', 'نوع قرارداد', 'خدمات، فروش، مشارکت و ...'),
      FIELD('parties', 'طرفین و نقش‌ها'),
      FIELD('subject_scope', 'موضوع و محدوده تعهد'),
      FIELD('term', 'مدت و زمان‌بندی'),
      FIELD('price_payment', 'ثمن و نحوه پرداخت'),
      FIELD('deliverables', 'تحویل و معیار پذیرش'),
      FIELD('ip_confidentiality', 'مالکیت فکری/محرمانگی', undefined, false),
      FIELD('dispute_resolution', 'حل اختلاف و مرجع صالح', 'پیش‌فرض ایران', false),
    ],
  },
  generic_chat: {
    id: 'generic_chat',
    name: 'مشاوره عمومی',
    intakeRequired: false,
    domain: 'general',
    fields: [],
  },
}

export function getModuleConfig(id: ModuleId): ModuleConfig {
  return MODULE_CONFIGS[id]
}
