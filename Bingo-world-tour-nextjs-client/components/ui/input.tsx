import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff, Search, Lock, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-sm border-l border-neutral-400 bg-neutral-100 px-3 py-2 body-2 text-neutral-1000 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-e1",
  {
    variants: {
      variant: {
        default: "border-neutral-200 focus:border-primary-100",
        error: "border-error-500 focus:border-error-500 focus:ring-error-500/20",
        success: "border-success-500 focus:border-success-500 focus:ring-success-500/20",
        warning: "border-warning-500 focus:border-warning-500 focus:ring-warning-500/20",
      },
      inputSize: {
        sm: "h-8 px-2 py-1 body-3",
        default: "h-9 px-3 py-2 body-2",
        lg: "h-10 px-4 py-3 body-1",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  icon?: React.ReactNode
  showPasswordToggle?: boolean
  type?: "text" | "password" | "email" | "search" | "tel" | "number"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize, 
    label, 
    hint, 
    error, 
    required, 
    icon, 
    showPasswordToggle, 
    type = "text",
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [inputType, setInputType] = React.useState(type)

    React.useEffect(() => {
      if (type === "password" && showPasswordToggle) {
        setInputType(showPassword ? "text" : "password")
      } else {
        setInputType(type)
      }
    }, [type, showPassword, showPasswordToggle])

    const getIcon = () => {
      if (icon) return icon
      if (type === "search") return <Search className="h-4 w-4 text-neutral-500" />
      if (type === "password") return <Lock className="h-4 w-4 text-neutral-500" />
      return null
    }

    const inputVariant = error ? "error" : variant

    return (
      <div className="w-full space-y-1">
        {label && (
          <div className="flex items-center gap-1">
            <label className="body-2 text-neutral-800 font-medium">
              {label}
            </label>
            {required && <span className="text-primary-500">*</span>}
            {hint && <Info className="h-4 w-4 text-neutral-500" />}
          </div>
        )}
        
        <div className="relative">
          {getIcon() && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {getIcon()}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: inputVariant, inputSize, className }),
              getIcon() && "pl-10",
              showPasswordToggle && type === "password" && "pr-10"
            )}
            ref={ref}
            {...props}
          />
          
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        
        {(hint || error) && (
          <div className="flex items-center gap-1">
            {error ? (
              <Info className="h-4 w-4 text-error-500" />
            ) : (
              <Info className="h-4 w-4 text-neutral-500" />
            )}
            <p className={cn(
              "body-3",
              error ? "text-error-500" : "text-neutral-500"
            )}>
              {error || hint}
            </p>
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
