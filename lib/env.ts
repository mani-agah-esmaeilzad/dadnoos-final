import { z } from 'zod'

import { isBuildTime } from '@/lib/runtime/build'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_ISSUER: z.string().min(1).default('dadnoos.local'),
  JWT_AUDIENCE: z.string().min(1).default('dadnoos.app'),
  TOKEN_DEFAULT_TTL_HOURS: z.coerce.number().int().positive().default(24),
  APP_NAME: z.string().min(1).default('Dadnoos'),
  PUBLIC_BASE_URL: z.string().min(1).default('http://localhost:3052'),
  UPLOADS_DIR: z.string().min(1).default('./uploads'),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(20_000_000),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(180),
  OTP_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(60),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  OTP_BYPASS_IN_DEV: z.coerce.boolean().default(false),
  OTP_FIXED_CODE: z.string().min(4).default('11111'),
  OTP_ACCEPT_MASTER_CODE: z.coerce.boolean().default(false),
  OTP_STATIC_LOGIN_PHONE: z.string().optional(),
  OTP_STATIC_LOGIN_CODE: z.string().optional(),
  OTP_DEV_MODE: z.coerce.boolean().default(false),
  MELIPAYAMAK_OTP_BASE_URL: z.string().optional(),
  MELIPAYAMAK_OTP_TOKEN: z.string().optional(),
  ADMIN_API_KEY: z.string().optional(),
  TOKEN_ISSUER_API_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_SEC: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(60),
  BILLING_REQUIRE_SUBSCRIPTION: z.coerce.boolean().default(true),
  DEFAULT_PLAN_TOKEN_QUOTA: z.coerce.number().int().positive().default(100000),
  DEFAULT_PLAN_DURATION_DAYS: z.coerce.number().int().positive().default(30),
  DEFAULT_PLAN_PRICE_CENTS: z.coerce.number().int().positive().default(150000),
  DEFAULT_PLAN_CODE: z.string().default('PLAN_BASIC'),
  DEFAULT_PLAN_TITLE: z.string().default('پلن پایه'),
  LLM_PROVIDER: z.string().min(1).default('openai'),
  LLM_API_KEY: z.string().min(1, 'LLM_API_KEY is required'),
  LLM_MODEL: z.string().min(1, 'LLM_MODEL is required'),
  LLM_BASE_URL: z.string().optional(),
  TRANSCRIPTION_MODEL: z.string().optional(),
  TRANSCRIPTION_LANGUAGE: z.string().optional(),
  TTS_MODEL: z.string().optional(),
  TTS_DEFAULT_VOICE: z.string().optional(),
  AUDIO_STUB_MODE: z.coerce.boolean().default(false),
  SUMMARY_ENABLED: z.coerce.boolean().default(true),
  SUMMARY_TOKEN_THRESHOLD: z.coerce.number().int().positive().default(18000),
  SUMMARY_KEEP_LAST_MESSAGES: z.coerce.number().int().positive().default(5),
  SUMMARY_TARGET_TOKENS: z.coerce.number().int().positive().default(1200),
  SUMMARY_MAX_INPUT_MESSAGES: z.coerce.number().int().positive().default(100),
  SUMMARY_MODEL: z.string().optional(),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(8).optional(),
  ADMIN_SESSION_TTL_HOURS: z.coerce.number().int().positive().default(24),
})

export type AppEnv = z.infer<typeof envSchema>

const sanitize = (value: string | undefined | null) => {
  if (value === undefined || value === null) return undefined
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

const rawEnv = {
  DATABASE_URL: sanitize(process.env.DATABASE_URL),
  REDIS_URL: sanitize(process.env.REDIS_URL),
  JWT_SECRET: sanitize(process.env.JWT_SECRET),
  JWT_ISSUER: sanitize(process.env.JWT_ISSUER),
  JWT_AUDIENCE: sanitize(process.env.JWT_AUDIENCE),
  TOKEN_DEFAULT_TTL_HOURS: sanitize(process.env.TOKEN_DEFAULT_TTL_HOURS),
  APP_NAME: sanitize(process.env.APP_NAME),
  PUBLIC_BASE_URL: sanitize(process.env.PUBLIC_BASE_URL),
  UPLOADS_DIR: sanitize(process.env.UPLOADS_DIR),
  MAX_UPLOAD_BYTES: sanitize(process.env.MAX_UPLOAD_BYTES),
  OTP_TTL_SECONDS: sanitize(process.env.OTP_TTL_SECONDS),
  OTP_COOLDOWN_SECONDS: sanitize(process.env.OTP_COOLDOWN_SECONDS),
  OTP_MAX_ATTEMPTS: sanitize(process.env.OTP_MAX_ATTEMPTS),
  OTP_BYPASS_IN_DEV: sanitize(process.env.OTP_BYPASS_IN_DEV),
  OTP_FIXED_CODE: sanitize(process.env.OTP_FIXED_CODE),
  OTP_ACCEPT_MASTER_CODE: sanitize(process.env.OTP_ACCEPT_MASTER_CODE),
  OTP_STATIC_LOGIN_PHONE: sanitize(process.env.OTP_STATIC_LOGIN_PHONE),
  OTP_STATIC_LOGIN_CODE: sanitize(process.env.OTP_STATIC_LOGIN_CODE),
  OTP_DEV_MODE: sanitize(process.env.OTP_DEV_MODE),
  MELIPAYAMAK_OTP_BASE_URL: sanitize(process.env.MELIPAYAMAK_OTP_BASE_URL),
  MELIPAYAMAK_OTP_TOKEN: sanitize(process.env.MELIPAYAMAK_OTP_TOKEN),
  ADMIN_API_KEY: sanitize(process.env.ADMIN_API_KEY),
  TOKEN_ISSUER_API_KEY: sanitize(process.env.TOKEN_ISSUER_API_KEY),
  RATE_LIMIT_WINDOW_SEC: sanitize(process.env.RATE_LIMIT_WINDOW_SEC),
  RATE_LIMIT_MAX_REQUESTS: sanitize(process.env.RATE_LIMIT_MAX_REQUESTS),
  BILLING_REQUIRE_SUBSCRIPTION: sanitize(process.env.BILLING_REQUIRE_SUBSCRIPTION),
  DEFAULT_PLAN_TOKEN_QUOTA: sanitize(process.env.DEFAULT_PLAN_TOKEN_QUOTA),
  DEFAULT_PLAN_DURATION_DAYS: sanitize(process.env.DEFAULT_PLAN_DURATION_DAYS),
  DEFAULT_PLAN_PRICE_CENTS: sanitize(process.env.DEFAULT_PLAN_PRICE_CENTS),
  DEFAULT_PLAN_CODE: sanitize(process.env.DEFAULT_PLAN_CODE),
  DEFAULT_PLAN_TITLE: sanitize(process.env.DEFAULT_PLAN_TITLE),
  LLM_PROVIDER: sanitize(process.env.LLM_PROVIDER),
  LLM_API_KEY: sanitize(process.env.LLM_API_KEY),
  LLM_MODEL: sanitize(process.env.LLM_MODEL),
  LLM_BASE_URL: sanitize(process.env.LLM_BASE_URL),
  TRANSCRIPTION_MODEL: sanitize(process.env.TRANSCRIPTION_MODEL),
  TRANSCRIPTION_LANGUAGE: sanitize(process.env.TRANSCRIPTION_LANGUAGE),
  TTS_MODEL: sanitize(process.env.TTS_MODEL),
  TTS_DEFAULT_VOICE: sanitize(process.env.TTS_DEFAULT_VOICE),
  AUDIO_STUB_MODE: sanitize(process.env.AUDIO_STUB_MODE),
  SUMMARY_ENABLED: sanitize(process.env.SUMMARY_ENABLED),
  SUMMARY_TOKEN_THRESHOLD: sanitize(process.env.SUMMARY_TOKEN_THRESHOLD),
  SUMMARY_KEEP_LAST_MESSAGES: sanitize(process.env.SUMMARY_KEEP_LAST_MESSAGES),
  SUMMARY_TARGET_TOKENS: sanitize(process.env.SUMMARY_TARGET_TOKENS),
  SUMMARY_MAX_INPUT_MESSAGES: sanitize(process.env.SUMMARY_MAX_INPUT_MESSAGES),
  SUMMARY_MODEL: sanitize(process.env.SUMMARY_MODEL),
  ADMIN_BOOTSTRAP_EMAIL: sanitize(process.env.ADMIN_BOOTSTRAP_EMAIL),
  ADMIN_BOOTSTRAP_PASSWORD: sanitize(process.env.ADMIN_BOOTSTRAP_PASSWORD),
  ADMIN_SESSION_TTL_HOURS: sanitize(process.env.ADMIN_SESSION_TTL_HOURS),
}

const buildFallbacks: Record<string, string> = {
  DATABASE_URL: 'postgresql://build:build@localhost:5432/build',
  REDIS_URL: 'redis://127.0.0.1:6379',
  JWT_SECRET: 'build-secret-key-please-change',
  JWT_ISSUER: 'dadnoos.build',
  JWT_AUDIENCE: 'dadnoos.build.app',
  APP_NAME: 'Dadnoos',
  PUBLIC_BASE_URL: 'http://localhost:3052',
  UPLOADS_DIR: './public/uploads',
  MAX_UPLOAD_BYTES: '20000000',
  OTP_TTL_SECONDS: '180',
  OTP_COOLDOWN_SECONDS: '60',
  OTP_MAX_ATTEMPTS: '5',
  OTP_BYPASS_IN_DEV: 'true',
  OTP_FIXED_CODE: '11111',
  OTP_ACCEPT_MASTER_CODE: 'true',
  OTP_DEV_MODE: 'true',
  RATE_LIMIT_WINDOW_SEC: '60',
  RATE_LIMIT_MAX_REQUESTS: '60',
  BILLING_REQUIRE_SUBSCRIPTION: 'false',
  DEFAULT_PLAN_TOKEN_QUOTA: '100000',
  DEFAULT_PLAN_DURATION_DAYS: '30',
  DEFAULT_PLAN_PRICE_CENTS: '150000',
  DEFAULT_PLAN_CODE: 'PLAN_BASIC',
  DEFAULT_PLAN_TITLE: 'پلن پایه',
  LLM_PROVIDER: 'openai',
  LLM_API_KEY: 'build-key',
  LLM_MODEL: 'gpt-4o-mini',
  TRANSCRIPTION_MODEL: 'gpt-4o-transcribe',
  TRANSCRIPTION_LANGUAGE: 'fa',
  TTS_MODEL: 'gpt-4o-mini-tts',
  TTS_DEFAULT_VOICE: 'alloy',
  AUDIO_STUB_MODE: 'true',
  SUMMARY_ENABLED: 'true',
  SUMMARY_TOKEN_THRESHOLD: '18000',
  SUMMARY_KEEP_LAST_MESSAGES: '5',
  SUMMARY_TARGET_TOKENS: '1200',
  SUMMARY_MAX_INPUT_MESSAGES: '100',
  ADMIN_SESSION_TTL_HOURS: '24',
}

const shouldAllowFallback = isBuildTime || process.env.VERCEL === '1' || process.env.ALLOW_RUNTIME_ENV_FALLBACK === '1'

const mergeWithFallbacks = () => {
  const merged: Record<string, string | undefined> = { ...buildFallbacks }
  for (const [key, value] of Object.entries(rawEnv)) {
    if (value !== undefined) {
      merged[key] = value
    }
  }
  return merged
}

const fallbackFlag = globalThis as unknown as { __envFallbackLogged?: boolean }

export const env: AppEnv = (() => {
  const parseResult = envSchema.safeParse(rawEnv)
  if (parseResult.success) {
    return parseResult.data
  }
  if (!shouldAllowFallback) {
    throw parseResult.error
  }
  if (!fallbackFlag.__envFallbackLogged) {
    console.warn('Env validation failed; falling back to safe defaults. This indicates required env vars are missing.')
    fallbackFlag.__envFallbackLogged = true
  }
  return envSchema.parse(mergeWithFallbacks())
})()
