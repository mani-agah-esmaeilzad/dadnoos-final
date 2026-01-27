import React from "react"
import { Button } from "@/app/_ui/components/button"
import { Check, Copy, Pencil, Save, ThumbsDown, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/app/_lib/utils"

interface MessageActionsProps {
  typingDone: boolean
  isLast: boolean
  isUser: boolean
  copied: boolean
  onCopy: () => void
  onEdit?: () => void
  onSave?: () => void
  onThumbsUp?: () => void
  onThumbsDown?: () => void
  disabledSave?: boolean
  disabledCopy?: boolean
  disabledPencil?: boolean
  disabledThumbsUp?: boolean
  disabledThumbsDown?: boolean
}

export function MessageActions({
  typingDone,
  isLast,
  isUser,
  copied,
  onCopy,
  onEdit,
  onSave,
  onThumbsUp,
  onThumbsDown,
  disabledSave = true,
  disabledCopy = false,
  disabledPencil = true,
  disabledThumbsUp = true,
  disabledThumbsDown = true,
}: MessageActionsProps) {
  if (!typingDone) return null

  const baseButtons = isUser
    ? [
      // { icon: copied ? Check : Copy, onClick: onCopy, disabled: disabledCopy },
      // { icon: Pencil, onClick: onEdit, disabled: disabledPencil },
    ]
    : [
      { icon: copied ? Check : Copy, onClick: onCopy, disabled: disabledCopy },
      { icon: Save, onClick: onSave, disabled: disabledSave },
      { icon: ThumbsDown, onClick: onThumbsDown, disabled: disabledThumbsDown },
      { icon: ThumbsUp, onClick: onThumbsUp, disabled: disabledThumbsUp },
    ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.4 } }}
      className={cn(
        isUser && isLast && "",
        isUser ? "m-2 mb-0" : "-mt-1 px-2",
        "flex gap-2.5 md:gap-1 text-neutral-700/75 dark:text-neutral-100/75"
      )}
    >
      {baseButtons.map(
        (btn, i) =>
          btn.onClick && (
            <Button
              key={i}
              variant="ghost"
              className="h-7 md:h-9 aspect-square p-0 rounded-xl flex items-center justify-center disabled:opacity-15"
              onClick={btn.onClick}
              disabled={btn.disabled}
            >
              <btn.icon className="size-5" />
            </Button>
          )
      )}
    </motion.div>
  )
}