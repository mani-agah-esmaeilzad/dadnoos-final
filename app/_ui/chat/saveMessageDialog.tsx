import { useEffect, useMemo, useState } from 'react'
import Popup from '@/app/_ui/components/popup'
import { Input } from '@/app/_ui/components/input'
import { Textarea } from '@/app/_ui/components/textarea'
import { Button } from '@/app/_ui/components/button'
import { useSavedMessagesStore } from '@/app/_lib/hooks/useSavedMessages'

interface SaveMessageDialogProps {
  isOpen: boolean
  defaultTitle: string
  defaultCaseId?: string
  messageText: string
  onSubmit: (payload: { title: string; caseId?: string; caseName?: string }) => void
  onClose: () => void
}

export function SaveMessageDialog({
  isOpen,
  defaultTitle,
  defaultCaseId,
  messageText,
  onSubmit,
  onClose,
}: SaveMessageDialogProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(defaultCaseId)
  const [newCaseName, setNewCaseName] = useState('')

  const cases = useSavedMessagesStore((state) => state.cases)
  const addCase = useSavedMessagesStore((state) => state.addCase)
  const ensureCasesInitialized = useSavedMessagesStore((state) => state.ensureCasesInitialized)

  useEffect(() => {
    if (isOpen) {
      ensureCasesInitialized()
      setTitle(defaultTitle)
      setSelectedCaseId(defaultCaseId)
      setNewCaseName('')
    }
  }, [isOpen, defaultTitle, defaultCaseId, ensureCasesInitialized])

  const sortedCases = useMemo(
    () => [...cases].sort((a, b) => b.createdAt - a.createdAt),
    [cases],
  )

  const selectedCaseName = useMemo(
    () => sortedCases.find((item) => item.id === selectedCaseId)?.name,
    [sortedCases, selectedCaseId],
  )

  const handleCreateCase = () => {
    const trimmed = newCaseName.trim()
    if (!trimmed) return
    const created = addCase(trimmed)
    setSelectedCaseId(created.id)
    setNewCaseName('')
  }

  return (
    <Popup visible={isOpen} onClose={onClose}>
      <div className="space-y-4" dir="rtl">
        <div>
          <h2 className="text-lg font-semibold">ذخیره پیام در پرونده</h2>
          <p className="text-xs text-neutral-500 mt-1">
            برای مرتب‌سازی بهتر، پرونده دلخواه را انتخاب کنید یا یک پرونده تازه بسازید.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-neutral-500 mb-1.5">عنوان یادداشت</p>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-xs text-neutral-500">انتخاب پرونده</p>
              {sortedCases.length > 0 && (
                <span className="text-[10px] text-neutral-400">
                  {sortedCases.length} پرونده ثبت‌شده
                </span>
              )}
            </div>
            {sortedCases.length === 0 ? (
              <p className="text-[11px] text-neutral-500 bg-neutral-100 dark:bg-neutral-900/40 rounded-2xl px-3 py-2">
                هنوز پرونده‌ای ساخته نشده است. پایین‌تر یک نام وارد کنید و روی افزودن پرونده بزنید.
              </p>
            ) : (
              <select
                value={selectedCaseId ?? ''}
                onChange={(event) => setSelectedCaseId(event.target.value || undefined)}
                className="w-full rounded-2xl border border-neutral-300/70 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:bg-neutral-900/40 dark:border-neutral-700"
              >
                <option value="">بدون پرونده (ذخیره عمومی)</option>
                {sortedCases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="rounded-2xl bg-neutral-50/70 dark:bg-neutral-900/40 p-3 border border-dashed border-neutral-200 dark:border-neutral-800">
            <p className="text-[11px] text-neutral-500 mb-2">افزودن پرونده جدید</p>
            <div className="flex items-center gap-2">
              <Input
                value={newCaseName}
                onChange={(event) => setNewCaseName(event.target.value)}
                placeholder="مثل: پرونده مطالبه وجه شرکت الف"
                className="text-sm"
              />
              <Button
                type="button"
                disabled={!newCaseName.trim()}
                onClick={handleCreateCase}
                className="whitespace-nowrap"
              >
                افزودن
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1.5">چکیده پیام</p>
            <Textarea
              value={messageText}
              readOnly
              className="text-xs h-32 bg-neutral-100 dark:bg-neutral-900/50"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button
            onClick={() => {
              onSubmit({
                title: title.trim() || defaultTitle,
                caseId: selectedCaseId,
                caseName: selectedCaseName,
              })
            }}
            disabled={!title.trim() && !messageText.trim()}
          >
            ذخیره در فایل‌منیجر
          </Button>
        </div>
      </div>
    </Popup>
  )
}
