import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm body-2 font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-neutral-100 hover:bg-primary-600 shadow-e2",
        secondary: "bg-secondary-500 text-neutral-100 hover:bg-secondary-600 shadow-e2",
        accent: "bg-accent-500 text-neutral-100 hover:bg-accent-600 shadow-e2",
        outline: "border border-neutral-300 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 shadow-e1",
        ghost: "text-primary-500 hover:bg-primary-100",
        link: "text-primary-500 underline-offset-4 hover:underline",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-e2 border border-red-600",
        success: "bg-success-500 text-neutral-100 hover:bg-success-600 shadow-e2",
        warning: "bg-warning-500 text-neutral-100 hover:bg-warning-600 shadow-e2",
      },
      size: {
        sm: "h-8 rounded-xs gap-1.5 px-3 body-3 has-[>svg]:px-2.5",
        default: "h-9 rounded-sm gap-2 px-4 body-2 has-[>svg]:px-3",
        lg: "h-10 rounded-sm gap-2 px-6 body-1 has-[>svg]:px-4",
        icon: "size-9 rounded-sm",
        "icon-sm": "size-8 rounded-xs",
        "icon-lg": "size-10 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  icon,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    icon?: React.ReactNode
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
