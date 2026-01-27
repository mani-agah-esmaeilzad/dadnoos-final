import { describe, expect, it } from 'vitest'

import { MODULE_CONFIGS } from '@/lib/chat/modules'
import { buildIntakeResponse, getMissingRequiredFields } from '@/lib/chat/intake'

describe('module intake', () => {
  it('builds intake questions only for missing required fields', () => {
    const module = MODULE_CONFIGS.petitions_complaints
    const fields = {
      case_type: 'حقوقی',
      authority: 'دادگاه حقوقی تهران',
      parties: 'خواهان: الف، خوانده: ب',
    }
    const missing = getMissingRequiredFields(module, fields)
    const response = buildIntakeResponse(module, missing)

    expect(response).toContain('برای ادامه «تنظیم دادخواست/شکواییه»')
    expect(response).toContain('شرح ماوقع')
    expect(response).not.toContain('نوع پرونده')
  })
})
