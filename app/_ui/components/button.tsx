import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/app/_lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-25 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#C8A175] text-white md:hover:bg-[#C8A175]/75 active:bg-[#C8A175]/75",
        destructive:
          "bg-red-600 text-white md:hover:bg-red-700 active:bg-red-700",
        outline:
          "border border-neutral-400/25 md:hover:bg-neutral-400/25 active:bg-neutral-400/25",
        secondary:
          "bg-neutral-400/15 md:hover:bg-neutral-300/75 active:bg-neutral-300/75",
        ghost:
          "bg-transparent md:hover:bg-neutral-300/25 active:bg-neutral-300/25",
        link:
          "text-blue-600 underline-offset-0 md:hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2.5",
        sm: "h-8 px-3",
        lg: "h-10 px-8",
        icon: "size-10 aspect-square p-2",
        icon_lg: "size-12 aspect-square p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }