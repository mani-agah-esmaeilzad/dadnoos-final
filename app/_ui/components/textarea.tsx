import * as React from "react"

import { cn } from "@/app/_lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] mt-1 w-full rounded-3xl border border-neutral-400/50 focus-visible:border-neutral-400 dark:focus-visible:border-neutral-300 px-3 py-2.5 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
