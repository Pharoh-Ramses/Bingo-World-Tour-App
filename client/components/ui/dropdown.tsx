import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown, Check } from "lucide-react"

import { cn } from "@/lib/utils"

const dropdownVariants = cva(
  "relative inline-block w-full",
  {
    variants: {
      size: {
        sm: "",
        default: "",
        lg: "",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const triggerVariants = cva(
  "flex w-full items-center justify-between rounded-sm border-l border-neutral-400 bg-neutral-100 px-3 py-2 body-2 text-neutral-1000 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-e1 cursor-pointer",
  {
    variants: {
      variant: {
        default: "border-neutral-200 focus:border-primary-100",
        error: "border-error-500 focus:border-error-500 focus:ring-error-500/20",
        success: "border-success-500 focus:border-success-500 focus:ring-success-500/20",
        warning: "border-warning-500 focus:border-warning-500 focus:ring-warning-500/20",
      },
      size: {
        sm: "h-8 px-2 py-1 body-3",
        default: "h-9 px-3 py-2 body-2",
        lg: "h-10 px-4 py-3 body-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const menuVariants = cva(
  "absolute z-50 w-full mt-1 bg-neutral-100 border border-neutral-300 rounded-sm shadow-e3 max-h-60 overflow-auto",
  {
    variants: {
      size: {
        sm: "",
        default: "",
        lg: "",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const optionVariants = cva(
  "flex items-center justify-between px-3 py-2 body-2 text-neutral-1000 hover:bg-primary-50 cursor-pointer transition-colors",
  {
    variants: {
      size: {
        sm: "px-2 py-1 body-3",
        default: "px-3 py-2 body-2",
        lg: "px-4 py-3 body-1",
      },
      selected: {
        true: "bg-primary-100 text-primary-700",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      selected: false,
    },
  }
)

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

export interface DropdownProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size'>,
    VariantProps<typeof dropdownVariants> {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  placeholder?: string
  value?: string
  options: DropdownOption[]
  onValueChange?: (value: string) => void
  disabled?: boolean
  variant?: VariantProps<typeof triggerVariants>['variant']
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({
    className,
    size,
    label,
    hint,
    error,
    required,
    placeholder = "Select an option...",
    value,
    options,
    onValueChange,
    disabled = false,
    variant,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const menuRef = React.useRef<HTMLDivElement>(null)

    const selectedOption = options.find(option => option.value === value)

    const handleTriggerClick = () => {
      if (!disabled) {
        setIsOpen(!isOpen)
        setHighlightedIndex(-1)
      }
    }

    const handleOptionClick = (option: DropdownOption) => {
      if (!option.disabled) {
        onValueChange?.(option.value)
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex(prev =>
            prev < options.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : options.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            const option = options[highlightedIndex]
            if (!option.disabled) {
              handleOptionClick(option)
            }
          }
          break
        case 'Escape':
          setIsOpen(false)
          setHighlightedIndex(-1)
          break
      }
    }

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
          setHighlightedIndex(-1)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    // Focus management
    React.useEffect(() => {
      if (isOpen && menuRef.current) {
        const firstOption = menuRef.current.querySelector('[role="option"]') as HTMLElement
        if (firstOption) {
          firstOption.focus()
        }
      }
    }, [isOpen])

    const triggerVariant = error ? "error" : variant

    return (
      <div className={cn(dropdownVariants({ size, className }))} ref={ref} {...props}>
        {label && (
          <div className="flex items-center gap-1 mb-1">
            <label className="body-2 text-neutral-800 font-medium">
              {label}
            </label>
            {required && <span className="text-primary-500">*</span>}
          </div>
        )}

        <button
          ref={triggerRef}
          type="button"
          className={cn(triggerVariants({ variant: triggerVariant, size }))}
          onClick={handleTriggerClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={label}
        >
          <span className={cn(
            "truncate",
            !selectedOption && "text-neutral-500"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform flex-shrink-0",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            className={cn(menuVariants({ size }))}
            role="listbox"
            aria-label={label}
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                className={cn(
                  optionVariants({
                    size,
                    selected: option.value === value || index === highlightedIndex
                  }),
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => handleOptionClick(option)}
                role="option"
                aria-selected={option.value === value}
                tabIndex={option.disabled ? -1 : 0}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        {(hint || error) && (
          <div className="flex items-center gap-1 mt-1">
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
      </div>
    )
  }
)
Dropdown.displayName = "Dropdown"

export { Dropdown, dropdownVariants, triggerVariants, menuVariants, optionVariants }