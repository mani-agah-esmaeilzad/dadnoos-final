export const MODULE_IDS = [
  'analysis_contract',
  'analysis_document',
  'declaration',
  'petition',
  'complaint',
  'brief',
  'contract_drafting',
  'verdict_prediction',
  'generic_chat',
] as const

export type ModuleId = (typeof MODULE_IDS)[number]

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
  analysis_contract: {
    id: 'analysis_contract',
    name: 'تحلیل قرارداد',
    intakeRequired: false,
    domain: 'contracts',
    fields: [
      FIELD('contract_text', 'متن کامل یا بندهای کلیدی قرارداد', 'می‌تواند خلاصه کلوزها یا متن کامل باشد.'),
      FIELD('user_role', 'سمت کاربر در قرارداد', 'مانند کارفرما، پیمانکار، فروشنده، خریدار.'),
      FIELD('objectives', 'اهداف اصلی و نگرانی‌های ریسک', undefined, false),
    ],
  },
  analysis_document: {
    id: 'analysis_document',
    name: 'تحلیل سند',
    intakeRequired: false,
    domain: 'procedure',
    fields: [
      FIELD('document_text', 'متن سند یا مدرک', 'خلاصه متن، نقل‌قول یا فایل استخراج شده.'),
      FIELD('document_type', 'نوع سند', 'اظهارنامه، دادخواست، رأی، مکاتبه و ...', false),
      FIELD('procedural_stage', 'مرحله رسیدگی', 'بدوی، تجدیدنظر، فرجام، شورا و ...', false),
      FIELD('user_goal', 'هدف کاربر از تحلیل', 'دفاع، اصلاح، آماده‌سازی جلسه و ...', false),
    ],
  },
  declaration: {
    id: 'declaration',
    name: 'اظهارنامه',
    intakeRequired: true,
    domain: 'procedure',
    fields: [
      FIELD('parties', 'مشخصات طرفین', 'اظهارکننده و مخاطب'),
      FIELD('subject', 'موضوع اظهارنامه', 'مثلا مطالبه وجه، تخلیه، فسخ'),
      FIELD('claim', 'خواسته یا درخواست اصلی'),
      FIELD('facts_timeline', 'شرح ماوقع و تاریخچه'),
      FIELD('evidence_list', 'دلایل و مستندات', undefined, false),
      FIELD('deadlines', 'مهلت یا اقدام فوری', undefined, false),
    ],
  },
  petition: {
    id: 'petition',
    name: 'دادخواست',
    intakeRequired: true,
    domain: 'procedure',
    fields: [
      FIELD('case_type', 'نوع دعوا', 'حقوقی، خانواده، کار و ...'),
      FIELD('authority', 'مرجع صالح', 'دادگاه، شورا، دیوان و ...'),
      FIELD('branch', 'شعبه یا شهر', undefined, false),
      FIELD('parties', 'مشخصات طرفین', 'خواهان/خوانده'),
      FIELD('claim', 'خواسته یا درخواست اصلی'),
      FIELD('claim_value', 'بهای خواسته', undefined, false),
      FIELD('facts_timeline', 'شرح ماوقع و تاریخچه'),
      FIELD('evidence_list', 'دلایل و مستندات'),
      FIELD('deadlines', 'ابلاغ یا مهلت مهم', undefined, false),
    ],
  },
  complaint: {
    id: 'complaint',
    name: 'شکواییه',
    intakeRequired: true,
    domain: 'procedure',
    fields: [
      FIELD('crime_title', 'عنوان اتهام', 'کلاهبرداری، سرقت، توهین و ...'),
      FIELD('authority', 'مرجع صالح', 'دادسرا یا دادگاه کیفری'),
      FIELD('parties', 'مشخصات طرفین', 'شاکی/مشتکی‌عنه'),
      FIELD('facts_timeline', 'شرح ماوقع و تاریخچه'),
      FIELD('evidence_list', 'دلایل و مستندات'),
      FIELD('damages', 'خسارت یا ضرر و زیان', undefined, false),
    ],
  },
  brief: {
    id: 'brief',
    name: 'لایحه',
    intakeRequired: true,
    domain: 'procedure',
    fields: [
      FIELD('case_summary', 'خلاصه پرونده و موضوع دعوا'),
      FIELD('procedural_stage', 'مرحله رسیدگی', 'بدوی، تجدیدنظر و ...'),
      FIELD('parties', 'مشخصات طرفین'),
      FIELD('position', 'موضع شما', 'خواهان/خوانده/شاکی/مشتکی‌عنه'),
      FIELD('arguments', 'دفاعیات یا استدلال‌های اصلی'),
      FIELD('evidence_list', 'دلایل و مستندات'),
      FIELD('requests', 'خواسته یا نتیجه مورد نظر', undefined, false),
    ],
  },
  contract_drafting: {
    id: 'contract_drafting',
    name: 'قرارداد',
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
  verdict_prediction: {
    id: 'verdict_prediction',
    name: 'پیش بینی رای',
    intakeRequired: false,
    domain: 'procedure',
    fields: [
      FIELD('case_summary', 'خلاصه پرونده', undefined, false),
      FIELD('forum', 'مرجع رسیدگی', 'دادگاه، شورا، داوری و ...', false),
      FIELD('procedural_stage', 'مرحله رسیدگی', 'بدوی، تجدیدنظر و ...', false),
      FIELD('evidence_strength', 'وضعیت ادله و مستندات', undefined, false),
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
