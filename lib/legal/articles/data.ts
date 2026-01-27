export interface ArticleRecord {
  law: string
  article: string
  text: string
  sourceUrl: string
  sourceTitle: string
}

export const ARTICLE_DATA: ArticleRecord[] = [
  {
    law: 'قانون مدنی',
    article: 'ماده ۱۰',
    text: 'قراردادهای خصوصی نسبت به کسانی که آن را منعقد نموده‌اند در صورتی که مخالف صریح قانون نباشد نافذ است.',
    sourceUrl: 'https://rc.majlis.ir/fa/law/show/92610',
    sourceTitle: 'درگاه قوانین مجلس',
  },
  {
    law: 'قانون مدنی',
    article: 'ماده ۱۹۰',
    text: 'برای صحت هر معامله شرایط ذیل اساسی است: ۱- قصد طرفین و رضای آن‌ها ۲- اهلیت طرفین ۳- موضوع معین که مورد معامله باشد ۴- مشروعیت جهت معامله.',
    sourceUrl: 'https://rc.majlis.ir/fa/law/show/92610',
    sourceTitle: 'درگاه قوانین مجلس',
  },
  {
    law: 'قانون مدنی',
    article: 'ماده ۲۱۹',
    text: 'عقودی که بر طبق قانون واقع شده باشد بین متعاملین و قائم‌مقام آن‌ها لازم‌الاتباع است مگر این که به رضای طرفین اقاله یا به علت قانونی فسخ شود.',
    sourceUrl: 'https://rc.majlis.ir/fa/law/show/92610',
    sourceTitle: 'درگاه قوانین مجلس',
  },
  {
    law: 'قانون آیین دادرسی مدنی',
    article: 'ماده ۵۱',
    text: 'دادخواست باید به زبان فارسی نوشته شود و حاوی نکات زیر باشد: ۱- نام، نام خانوادگی، نام پدر، سن، اقامتگاه و حتی المقدور شغل خواهان ۲- نام، نام خانوادگی و اقامتگاه خوانده ۳- تعهد یا خواسته به طور معین و با تعیین بهای آن در دعاوی مالی ...',
    sourceUrl: 'https://rc.majlis.ir/fa/law/show/94078',
    sourceTitle: 'درگاه قوانین مجلس',
  },
  {
    law: 'قانون حمایت خانواده ۱۳۹۱',
    article: 'ماده ۲۹',
    text: 'دادگاه ضمن صدور حکم طلاق یا گواهی عدم امکان سازش باید تکلیف جهیزیه، مهریه، اجرت‌المثل ایام زوجیت و نفقه ایام عده را معین کند.',
    sourceUrl: 'https://rc.majlis.ir/fa/law/show/802273',
    sourceTitle: 'درگاه قوانین مجلس',
  },
]
