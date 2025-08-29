import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "btn", // Base btn class from our CSS
  {
    variants: {
      variant: {
        // Main button variants using our CSS classes
        primary: "btn--primary",
        secondary: "btn--secondary", 
        outline: "btn--outline",
        ghost: "btn--ghost",
        destructive: "btn--destructive",
        success: "btn--success",
        warning: "btn--warning",
        link: "btn--link",
        
        // Icon button variants
        icon: "btn--icon",
        "icon-primary": "btn--icon btn--primary",
        "icon-ghost": "btn--icon btn--ghost",
        "icon-destructive": "btn--icon btn--destructive",
      },
      size: {
        sm: "btn--sm",
        md: "btn--md", 
        lg: "btn--lg",
        icon: "btn--icon", // Square icon button
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  icon,
  iconPosition = "left",
  ...props
}: ButtonProps) {
  const isIconOnly = !children && icon
  const hasIcon = !!icon

  const buttonClassName = cn(
    buttonVariants({ variant, size }),
    {
      "btn--loading": loading,
      "btn--disabled": disabled || loading,
      "btn--with-icon": hasIcon && children,
      "btn--icon-left": hasIcon && children && iconPosition === "left",
      "btn--icon-right": hasIcon && children && iconPosition === "right",
    },
    className
  )

  // When asChild is true, we still apply button styling to the child element
  if (asChild) {
    return (
      <Slot
        className={buttonClassName}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-label={isIconOnly ? props["aria-label"] : undefined}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  // Normal button rendering
  return (
    <button
      className={buttonClassName}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-label={isIconOnly ? props["aria-label"] : undefined}
      data-slot="button"
      {...props}
    >
      {isIconOnly ? (
        <span className={cn("btn__icon", loading ? "opacity-0" : "")}>
          {icon}
        </span>
      ) : (
        <>
          {hasIcon && iconPosition === "left" && (
            <span className="btn__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          {children && (
            <span className={loading ? "opacity-0" : ""}>{children}</span>
          )}
          {hasIcon && iconPosition === "right" && (
            <span className="btn__icon" aria-hidden="true">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  )
}

export { Button, buttonVariants }
