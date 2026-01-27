'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'

interface SupportConversation {
  conversationId: string
  userId: string
  username: string
  chatId: string
  supportRequested: boolean
  reported: boolean
  createdAt: string
  lastMessageAt: string
  lastMessageSnippet: string
  title?: string | null
}

interface TranscriptMessage {
  id: string
  role: string
  text: string
  timestamp: string
}

interface TranscriptResponse {
  conversationId: string
  userId: string
  chatId: string
  messages: TranscriptMessage[]
  nextCursor: string | null
}

interface SupportInboxProps {
  conversations: SupportConversation[]
  userIdFilter?: string
}

export default function SupportInboxClient({ conversations, userIdFilter }: SupportInboxProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeReason, setActiveReason] = useState<string | null>(null)
  const [overrideUserId, setOverrideUserId] = useState<string | null>(null)

  const selectedConversation = conversations.find((item) => item.conversationId === selectedId) || null
  const normalizedFilter = userIdFilter?.trim() || undefined
  const requiresFlagOverride = Boolean(
    selectedConversation && !selectedConversation.supportRequested && !selectedConversation.reported
  )
  const canOverrideAccess = Boolean(normalizedFilter && selectedConversation?.userId === normalizedFilter)

  const filteredMessages = transcript
    ? transcript.messages.filter((message) => message.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  const loadTranscript = async (
    conversationId: string,
    reasonText: string,
    cursor?: string | null,
    userOverride?: string
  ) => {
    const params = new URLSearchParams({ reason: reasonText, pageSize: '30' })
    if (cursor) {
      params.set('cursor', cursor)
    }
    if (userOverride) {
      params.set('userId', userOverride)
    }
    const response = await fetch(`/api/admin/support/conversations/${conversationId}?${params.toString()}`)
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload.detail || 'خطا در دریافت گفتگو.')
    }
    return response.json() as Promise<TranscriptResponse>
  }

  const handleSelect = (conversationId: string) => {
    setSelectedId(conversationId)
    setReason('')
    setActiveReason(null)
    setTranscript(null)
    setError(null)
    setSearchTerm('')
    setOverrideUserId(null)
  }

  const handleViewTranscript = async () => {
    if (!selectedId || reason.trim().length < 3) {
      setError('لطفاً دلیل دسترسی را وارد کنید.')
      return
    }
    const userOverride = normalizedFilter && selectedConversation?.userId === normalizedFilter ? normalizedFilter : undefined
    try {
      setLoading(true)
      setError(null)
      const data = await loadTranscript(selectedId, reason.trim(), undefined, userOverride)
      setTranscript(data)
      setActiveReason(reason.trim())
      setOverrideUserId(userOverride ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت گفتگو.')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = async () => {
    if (!selectedId || !activeReason || !transcript?.nextCursor) return
    try {
      setLoading(true)
      const data = await loadTranscript(selectedId, activeReason, transcript.nextCursor, overrideUserId ?? undefined)
      setTranscript({
        ...data,
        messages: [...(transcript?.messages ?? []), ...data.messages],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت پیام‌های بیشتر.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[320px,1fr]">
      <div className="space-y-4 rounded-3xl border border-neutral-200/60 bg-white/70 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">گفتگوهای نیازمند بررسی</h3>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.conversationId}
              type="button"
              onClick={() => handleSelect(conversation.conversationId)}
              className={`w-full rounded-2xl border px-4 py-3 text-right text-sm transition ${
                selectedId === conversation.conversationId
                  ? 'border-[#C8A175] bg-[#C8A175]/10'
                  : 'border-transparent bg-neutral-50/80 hover:border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{conversation.username}</span>
                <span>{new Date(conversation.createdAt).toLocaleDateString('fa-IR')}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {conversation.title || 'گفتگو بدون عنوان'}
              </p>
              <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{conversation.lastMessageSnippet || 'بدون پیام'}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {conversation.supportRequested && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">درخواست پشتیبانی</span>
                )}
                {conversation.reported && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">گزارش شده</span>
                )}
              </div>
            </button>
          ))}
          {!conversations.length && <p className="text-sm text-neutral-500">گفتگویی برای نمایش وجود ندارد.</p>}
        </div>
      </div>

      <div className="space-y-6 rounded-3xl border border-neutral-200/60 bg-white/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40">
        {selectedConversation ? (
          <>
            <div className="space-y-1">
              <p className="text-sm text-neutral-500">گفتگو با کاربر</p>
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{selectedConversation.username}</h3>
            </div>

            {activeReason ? (
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700">
                دلیل ثبت شده: {activeReason}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm text-neutral-500">دلیل مشاهده گفتگو</label>
                <Input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="مثال: پیگیری تیکت پشتیبانی"
                />
                {requiresFlagOverride && !canOverrideAccess && (
                  <p className="text-xs text-amber-600">
                    این گفتگو علامت‌گذاری نشده است. برای مشاهده باید ابتدا با شناسه کاربر جستجو کنید و همان شناسه را در فیلتر بالا
                    وارد کرده باشید.
                  </p>
                )}
                <Button disabled={loading || (requiresFlagOverride && !canOverrideAccess)} onClick={handleViewTranscript}>
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'مشاهده گفتگو'}
                </Button>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            {transcript && (
              <div className="space-y-4">
                <Input
                  placeholder="جستجو در پیام‌ها"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        message.role === 'assistant'
                          ? 'border-neutral-200 bg-neutral-50'
                          : 'border-[#C8A175]/40 bg-[#C8A175]/10'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
                        <span>{message.role === 'assistant' ? 'دستیار' : 'کاربر'}</span>
                        <span>{new Date(message.timestamp).toLocaleString('fa-IR')}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-neutral-900 dark:text-neutral-100">{message.text || '—'}</p>
                    </div>
                  ))}
                  {!filteredMessages.length && (
                    <p className="text-sm text-neutral-500">پیامی مطابق با جستجو یافت نشد.</p>
                  )}
                </div>
                {transcript.nextCursor && (
                  <Button variant="outline" disabled={loading} onClick={handleLoadMore}>
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'نمایش پیام‌های بیشتر'}
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex-grow rounded-2xl border border-dashed border-neutral-300/60 p-6 text-center text-neutral-500">
            برای مشاهده جزئیات، یک گفتگو را از لیست انتخاب کنید.
          </div>
        )}
      </div>
    </div>
  )
}
