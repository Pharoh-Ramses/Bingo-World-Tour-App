import * as React from "react"
import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-6 w-6",
        default: "h-8 w-8",
        lg: "h-10 w-10",
        xl: "h-12 w-12",
        "2xl": "h-16 w-16",
      },
      variant: {
        default: "bg-neutral-200",
        primary: "bg-primary-100",
        secondary: "bg-secondary-100",
        accent: "bg-accent-100",
        success: "bg-success-100",
        warning: "bg-warning-100",
        error: "bg-error-100",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

const avatarImageVariants = cva(
  "aspect-square h-full w-full object-cover"
)

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center rounded-full font-medium text-neutral-700",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
        xl: "text-lg",
        "2xl": "text-xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  status?: "online" | "offline" | "away" | "busy"
  showStatus?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    size, 
    variant, 
    src, 
    alt, 
    fallback, 
    status = "offline",
    showStatus = false,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(false)
    
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }

    const getStatusColor = () => {
      switch (status) {
        case "online":
          return "bg-success-500"
        case "away":
          return "bg-warning-500"
        case "busy":
          return "bg-error-500"
        default:
          return "bg-neutral-400"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, variant, className }))}
        {...props}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt || "Avatar"}
            fill
            className={avatarImageVariants()}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={cn(avatarFallbackVariants({ size }))}>
            {fallback ? getInitials(fallback) : "?"}
          </div>
        )}
        
        {showStatus && (
          <div
            className={cn(
              "absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white",
              getStatusColor()
            )}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

// Avatar Group Component
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
  children: React.ReactNode
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 3, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)
    const visibleChildren = childrenArray.slice(0, max)
    const remainingCount = childrenArray.length - max

    return (
      <div
        ref={ref}
        className={cn("flex -space-x-2", className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div key={index} className="relative">
            {child}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="relative">
            <Avatar
              size="default"
              variant="primary"
              fallback={`+${remainingCount}`}
              className="border-2 border-white"
            />
          </div>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = "AvatarGroup"

export { Avatar, AvatarGroup, avatarVariants }
