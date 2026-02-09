import { Button } from "@/app/_ui/components/button"
import { cn } from "@/app/_lib/utils"

interface VoiceStatusBarProps {
  voiceEnabled: boolean
  autoSendVoice: boolean
  autoPlayResponses: boolean
  voiceLiveEnabled: boolean
  voiceLiveStatus: "idle" | "connecting" | "live" | "error"
  voiceLiveError?: string
  isVoiceLiveRunning: boolean
  transcripts: string[]
  responses: { text: string }[]
  onStartLive: () => void
  onStopLive: () => void
  onRetryLive: () => void
}

export function VoiceStatusBar({
  voiceEnabled,
  autoSendVoice,
  autoPlayResponses,
  voiceLiveEnabled,
  voiceLiveStatus,
  voiceLiveError,
  isVoiceLiveRunning,
  transcripts,
  responses,
  onStartLive,
  onStopLive,
  onRetryLive,
}: VoiceStatusBarProps) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto aspect-square">
      {/* Voice Live panel */}
      {voiceEnabled && voiceLiveEnabled && (
        <div className="max-w-80 m-auto aspect-square rounded-full bg-neutral-200 dark:bg-neutral-700 p-3 flex flex-col items-center justify-center gap-2 text-xs">
          <div className="flex flex-col items-center justify-center gap-5 p-10">
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm font-semibold">Voice Live</span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {voiceLiveStatus === "live"
                  ? "در حال مکالمه زنده"
                  : voiceLiveStatus === "connecting"
                    ? "در حال اتصال..."
                    : "آماده شروع مکالمه"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {voiceLiveStatus === "idle" && (
                <Button size="sm" onClick={onStartLive} className="rounded-2xl">
                  شروع
                </Button>
              )}

              {voiceLiveStatus === "connecting" && (
                <Button size="sm" variant="outline" disabled className="rounded-2xl">
                  اتصال...
                </Button>
              )}

              {voiceLiveStatus === "live" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onStopLive}
                  className="rounded-2xl border-red-400 text-red-600"
                >
                  پایان
                </Button>
              )}

              {voiceLiveStatus === "error" && (
                <Button size="sm" variant="outline" onClick={onRetryLive} className="rounded-2xl">
                  تلاش مجدد
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg space-y-5">
        {transcripts.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              آخرین گفتار شما:
            </p>
            <p className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-2 text-[12px]">
              {transcripts[transcripts.length - 1]}
            </p>
          </div>
        )}

        {responses.length > 0 && (
          <div className="mt-1 space-y-1">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              آخرین پاسخ مدل:
            </p>
            <div className="rounded-2xl bg-black/80 text-white dark:bg-white/20 p-2 text-[12px]">
              {responses[responses.length - 1]?.text}
            </div>
          </div>
        )}

        {voiceLiveError && (
          <p className="text-[11px] text-red-500 text-center">{voiceLiveError}</p>
        )}

        {isVoiceLiveRunning && (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center">
            هر چند ثانیه یک‌بار صدا به سرور ارسال می‌شود. برای پایان مکالمه دکمه «پایان» را بزن.
          </p>
        )}
      </div>

      {/* Voice status */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-1 mt-auto text-xs md:text-xs">
        <div
          className={cn(
            "px-3 py-1.5 rounded-2xl border text-neutral-600 dark:text-neutral-200",
            voiceEnabled
              ? "border-emerald-400/70 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
              : "border-neutral-200 dark:border-neutral-700"
          )}
        >
          {voiceEnabled ? "حالت صوتی فعال است" : "حالت صوتی غیرفعال است"}
          {voiceEnabled && (
            <span className="ms-3 text-neutral-500 dark:text-neutral-400">
              {[
                autoSendVoice ? "ارسال خودکار" : null,
                autoPlayResponses ? "پخش پاسخ" : null,
                voiceLiveEnabled ? "صدای زنده" : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
