import * as React from "react"

import { cn } from "@/app/_lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex items-center min-h-10 w-full mt-1 rounded-3xl border border-neutral-400/50 bg-white/95 text-neutral-900 placeholder:text-neutral-400 focus:border-[#C8A175] dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-100 dark:placeholder:text-neutral-500 px-4 py-2.5 text-base outline-0 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
