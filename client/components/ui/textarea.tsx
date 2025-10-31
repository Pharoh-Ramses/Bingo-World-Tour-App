import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-sm border-l border-neutral-400 bg-neutral-100 px-3 py-2 body-2 text-neutral-1000 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-e1 resize-vertical",
  {
    variants: {
      variant: {
        default: "border-neutral-200 focus:border-primary-100",
        error: "border-error-500 focus:border-error-500 focus:ring-error-500/20",
        success: "border-success-500 focus:border-success-500 focus:ring-success-500/20",
        warning: "border-warning-500 focus:border-warning-500 focus:ring-warning-500/20",
      },
      size: {
        sm: "min-h-[60px] px-2 py-1 body-3",
        default: "min-h-[80px] px-3 py-2 body-2",
        lg: "min-h-[120px] px-4 py-3 body-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  showCharCount?: boolean
  maxLength?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    size,
    label,
    hint,
    error,
    required,
    showCharCount = false,
    maxLength,
    value,
    onChange,
    ...props
  }, ref) => {
    const [charCount, setCharCount] = React.useState(0)

    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length)
      } else if (value && typeof value === 'number') {
        setCharCount(value.toString().length)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    const textareaVariant = error ? "error" : variant

    return (
      <div className="w-full space-y-1">
        {label && (
          <div className="flex items-center gap-1">
            <label className="body-2 text-neutral-800 font-medium">
              {label}
            </label>
            {required && <span className="text-primary-500">*</span>}
          </div>
        )}

        <textarea
          className={cn(textareaVariants({ variant: textareaVariant, size, className }))}
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />

        <div className="flex items-center justify-between">
          {(hint || error) && (
            <div className="flex items-center gap-1">
              {error && (
                <svg className="h-4 w-4 text-error-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <p className={cn(
                "body-3",
                error ? "text-error-500" : "text-neutral-500"
              )}>
                {error || hint}
              </p>
            </div>
          )}

          {showCharCount && maxLength && (
            <p className="body-3 text-neutral-500 ml-auto">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }