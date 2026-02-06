'use client'

import Popup from '@/app/_ui/components/popup'
import { Button } from '@/app/_ui/components/button'
import { useVoiceSettings } from '@/app/_lib/hooks/useVoiceSettings'
import { cn } from '@/app/_lib/utils'
import { AudioLines, Mic, Waves } from 'lucide-react'

interface VoiceSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

function ToggleRow({
  label,
  description,
  active,
  onToggle,
  icon: Icon,
}: {
  label: string
  description: string
  active: boolean
  onToggle: () => void
  icon: any
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-3 rounded-3xl border px-4 py-3 text-right transition-colors',
        active
          ? 'border-black/80 dark:border-white bg-black text-white dark:bg-white dark:text-black'
          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-2xl p-2',
        active ? 'bg-white/15 dark:bg-black/15' : 'bg-neutral-100 dark:bg-neutral-800'
      )}>
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-[11px] text-neutral-600 dark:text-neutral-400">{description}</span>
      </div>
      <div
        className={cn(
          'w-10 h-5 rounded-full border transition-all flex items-center px-0.5',
          active
            ? 'bg-white text-black dark:bg-black dark:text-white border-transparent'
            : 'bg-transparent border-neutral-300 dark:border-neutral-700'
        )}
      >
        <div
          className={cn(
            'size-4 rounded-full transition-transform duration-200',
            active ? 'translate-x-4 bg-black dark:bg-white' : 'translate-x-0 bg-neutral-400'
          )}
        />
      </div>
    </button>
  )
}

export function VoiceSettingsPanel({ isOpen, onClose }: VoiceSettingsPanelProps) {
  const {
    voiceEnabled,
    autoSendVoice,
    autoPlayResponses,
    voiceLiveEnabled,
    toggleVoiceEnabled,
    toggleAutoSendVoice,
    toggleAutoPlayResponses,
    toggleVoiceLiveEnabled,
  } = useVoiceSettings()

  return (
    <Popup visible={isOpen} onClose={onClose}>
      <div className="space-y-4" dir="rtl">
        <div>
          <h2 className="text-lg font-semibold">تنظیمات گفتگوی صوتی</h2>
          <p className="text-xs text-neutral-500 mt-1">
            تعیین کن چطور صدایت ضبط شود و پاسخ‌ها چگونه پخش شوند.
          </p>
        </div>

        <div className="space-y-3">
          <ToggleRow
            label="فعال‌سازی حالت صوتی"
            description="امکان ضبط پیام و دریافت پاسخ صوتی"
            active={voiceEnabled}
            onToggle={toggleVoiceEnabled}
            icon={Mic}
          />

          <ToggleRow
            label="ارسال خودکار بعد از تبدیل"
            description="پس از تبدیل گفتار به متن، پیام بدون تأیید ارسال شود"
            active={voiceEnabled && autoSendVoice}
            onToggle={toggleAutoSendVoice}
            icon={AudioLines}
          />

          <ToggleRow
            label="پخش خودکار پاسخ‌ها"
            description="پاسخ مدل به صورت صوتی پخش شود"
            active={voiceEnabled && autoPlayResponses}
            onToggle={toggleAutoPlayResponses}
            icon={Waves}
          />

          <ToggleRow
            label="Voice Live (بتا)"
            description="مکالمه‌ی زنده مثل تماس تلفنی"
            active={voiceEnabled && voiceLiveEnabled}
            onToggle={toggleVoiceLiveEnabled}
            icon={Waves}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            بستن
          </Button>
        </div>
      </div>
    </Popup>
  )
}
