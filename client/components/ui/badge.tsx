import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border px-2 py-1 body-3 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-neutral-300 bg-neutral-100 text-neutral-800",
        primary: "border-primary-200 bg-primary-100 text-primary-800",
        secondary: "border-secondary-200 bg-secondary-100 text-secondary-800",
        accent: "border-accent-200 bg-accent-100 text-accent-800",
        success: "border-success-200 bg-success-100 text-success-800",
        warning: "border-warning-200 bg-warning-100 text-warning-800",
        error: "border-error-200 bg-error-100 text-error-800",
        outline: "border-neutral-300 bg-transparent text-neutral-800",
      },
      size: {
        sm: "px-1.5 py-0.5 body-4",
        default: "px-2 py-1 body-3",
        lg: "px-3 py-1.5 body-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean
  onRemove?: () => void
  icon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, removable, onRemove, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        {removable && (
          <button
            type="button"
            className="ml-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-black/20"
            onClick={onRemove}
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
