'use client'

import { useMemo, useState } from 'react'
import type { PromptType } from '@prisma/client'

import { Button } from '@/app/_ui/components/button'
import { Textarea } from '@/app/_ui/components/textarea'
import { Input } from '@/app/_ui/components/input'
import { cn } from '@/app/_lib/utils'

export interface PromptViewModel {
  slug: string
  name: string
  type: PromptType
  content: string
  model?: string | null
  description?: string | null
  metadata?: unknown
  source: 'default' | 'database'
  createdAt?: string | null
  updatedAt?: string | null
}

const TYPE_LABELS: Record<PromptType, string> = {
  SYSTEM: 'سیستم',
  CORE: 'هسته',
  ROUTER: 'مسیریاب',
  MODULE: 'ماژول',
}

const TYPE_ORDER: Record<PromptType, number> = {
  CORE: 0,
  SYSTEM: 1,
  ROUTER: 2,
  MODULE: 3,
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default function PromptManager({ initialPrompts }: { initialPrompts: PromptViewModel[] }) {
  const [prompts, setPrompts] = useState<PromptViewModel[]>(initialPrompts)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [contentValue, setContentValue] = useState('')
  const [modelValue, setModelValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const sortedPrompts = useMemo(() => {
    return [...prompts].sort((a, b) => {
      const typeDiff = TYPE_ORDER[a.type] - TYPE_ORDER[b.type]
      if (typeDiff !== 0) return typeDiff
      return a.name.localeCompare(b.name)
    })
  }, [prompts])

  const activePrompt = prompts.find((item) => item.slug === activeSlug) || null

  const openEditor = (slug: string) => {
    const prompt = prompts.find((item) => item.slug === slug)
    if (!prompt) return
    setActiveSlug(slug)
    setContentValue(prompt.content)
    setModelValue(prompt.model ?? '')
    setStatusMessage(null)
  }

  const closeEditor = () => {
    setActiveSlug(null)
    setContentValue('')
    setModelValue('')
    setStatusMessage(null)
  }

  const refreshPrompt = (updated: PromptViewModel) => {
    setPrompts((prev) => prev.map((item) => (item.slug === updated.slug ? updated : item)))
  }

  const handleSave = async () => {
    if (!activePrompt) return
    setIsSaving(true)
    setStatusMessage(null)
    try {
      const response = await fetch(`/api/admin/prompts/${activePrompt.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentValue,
          model: modelValue || null,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.detail || 'ذخیره‌سازی با خطا مواجه شد.')
      }
      const data = (await response.json()) as PromptViewModel
      refreshPrompt({
        ...data,
        source: 'database',
        updatedAt: data.updatedAt ?? new Date().toISOString(),
      })
      setStatusMessage('ذخیره شد.')
      setTimeout(closeEditor, 800)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'ذخیره‌سازی با خطا مواجه شد.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!activePrompt) return
    if (!window.confirm('آیا از بازنشانی این پرامپت به نسخه پیش‌فرض مطمئن هستید؟')) return
    setIsSaving(true)
    setStatusMessage(null)
    try {
      const response = await fetch(`/api/admin/prompts/${activePrompt.slug}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.detail || 'بازنشانی با خطا مواجه شد.')
      }
      const data = (await response.json()) as PromptViewModel
      const resetPrompt = {
        ...data,
        source: 'default' as const,
        updatedAt: data.updatedAt ?? null,
      }
      refreshPrompt(resetPrompt)
      setContentValue(resetPrompt.content)
      setModelValue(resetPrompt.model ?? '')
      setStatusMessage('به نسخه پیش‌فرض بازگشت.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'بازنشانی با خطا مواجه شد.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-3xl border border-neutral-200/70 bg-white/90 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40">
        <table className="min-w-full divide-y divide-neutral-200/70 text-sm">
          <thead className="bg-neutral-50/90 text-neutral-500 dark:bg-neutral-900/60">
            <tr>
              <th className="px-4 py-3 text-right font-medium">عنوان</th>
              <th className="px-4 py-3 text-right font-medium">نوع</th>
              <th className="px-4 py-3 text-right font-medium">مدل</th>
              <th className="px-4 py-3 text-right font-medium">آخرین وضعیت</th>
              <th className="px-4 py-3 text-right font-medium">اقدام</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white/80 dark:divide-neutral-800 dark:bg-transparent">
            {sortedPrompts.map((prompt) => (
              <tr key={prompt.slug}>
                <td className="px-4 py-4">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">{prompt.name}</div>
                  <div className="text-xs text-neutral-500">{prompt.slug}</div>
                </td>
                <td className="px-4 py-4 text-neutral-700 dark:text-neutral-200">{TYPE_LABELS[prompt.type]}</td>
                <td className="px-4 py-4 text-neutral-700 dark:text-neutral-200">{prompt.model || 'پیش‌فرض'}</td>
                <td className="px-4 py-4 text-xs text-neutral-500">
                  منبع: {prompt.source === 'database' ? 'سفارشی' : 'پیش‌فرض'}
                  <br />
                  <span className="text-neutral-400">بروزرسانی: {formatDate(prompt.updatedAt)}</span>
                </td>
                <td className="px-4 py-4 text-left">
                  <Button size="sm" variant="secondary" onClick={() => openEditor(prompt.slug)}>
                    ویرایش
                  </Button>
                </td>
              </tr>
            ))}
            {!sortedPrompts.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  پرامپتی یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {activePrompt && (
        <div className="rounded-3xl border border-neutral-200/70 bg-white/95 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-neutral-500">{activePrompt.slug}</p>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{activePrompt.name}</h3>
            </div>
            <Button variant="ghost" onClick={closeEditor}>
              بستن
            </Button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_200px]">
            <div className="md:col-span-2">
              <label className="text-sm text-neutral-500">متن پرامپت</label>
              <Textarea
                rows={18}
                className="mt-2 font-mono text-xs"
                value={contentValue}
                onChange={(event) => setContentValue(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-neutral-500">مدل LLM (اختیاری)</label>
              <Input
                className="mt-2"
                placeholder="gpt-4o-mini"
                value={modelValue}
                onChange={(event) => setModelValue(event.target.value)}
              />
              <p className="mt-1 text-xs text-neutral-500">در صورت خالی بودن، مقدار پیش‌فرض env استفاده می‌شود.</p>
            </div>
            <div className="flex items-end justify-end gap-2">
              <Button variant="ghost" onClick={handleReset} disabled={isSaving}>
                بازنشانی به نسخه پیش‌فرض
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
              </Button>
            </div>
          </div>

          {statusMessage && (
            <p
              className={cn(
                'mt-3 text-sm',
                statusMessage.includes('خطا') ? 'text-red-600' : 'text-green-600'
              )}
            >
              {statusMessage}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
