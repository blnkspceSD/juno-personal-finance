"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "card",
  {
    variants: {
      variant: {
        default: "card--default",
        elevated: "card--elevated",
        flat: "card--flat",
        outlined: "card--outlined",
        success: "card--success",
        warning: "card--warning",
        error: "card--error",
        info: "card--info"
      },
      size: {
        sm: "card--sm",
        md: "card--md",
        lg: "card--lg"
      },
      interactive: {
        true: "card--interactive",
        clickable: "card--clickable"
      },
      layout: {
        default: "",
        horizontal: "card--horizontal",
        compact: "card--compact"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      layout: "default"
    }
  }
)

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  loading?: boolean
  selected?: boolean
  disabled?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, layout, loading, selected, disabled, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive, layout }),
          {
            "card--loading": loading,
            "card--selected": selected,
            "card--disabled": disabled
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card__header",
          {
            "card__header--sm": size === "sm",
            "card__header--lg": size === "lg"
          },
          className
        )}
        {...props}
      />
    )
  }
)
CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("card__title", className)}
        {...props}
      />
    )
  }
)
CardTitle.displayName = "CardTitle"

interface CardSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardSubtitle = React.forwardRef<HTMLParagraphElement, CardSubtitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("card__subtitle", className)}
        {...props}
      />
    )
  }
)
CardSubtitle.displayName = "CardSubtitle"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  noPadding?: boolean
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size = "md", noPadding = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card__content",
          {
            "card__content--sm": size === "sm",
            "card__content--lg": size === "lg",
            "card__content--no-padding": noPadding
          },
          className
        )}
        {...props}
      />
    )
  }
)
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  alignment?: "start" | "center" | "end" | "between"
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size = "md", alignment = "between", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card__footer",
          {
            "card__footer--sm": size === "sm",
            "card__footer--lg": size === "lg",
            "card__footer--center": alignment === "center",
            "card__footer--end": alignment === "end"
          },
          className
        )}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

interface CardMediaProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: "16-9" | "4-3" | "1-1"
}

const CardMedia = React.forwardRef<HTMLImageElement, CardMediaProps>(
  ({ className, aspectRatio, ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn(
          "card__media",
          {
            "card__media--aspect-16-9": aspectRatio === "16-9",
            "card__media--aspect-4-3": aspectRatio === "4-3",
            "card__media--aspect-1-1": aspectRatio === "1-1"
          },
          className
        )}
        {...props}
      />
    )
  }
)
CardMedia.displayName = "CardMedia"

interface CardMetaProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardMeta = React.forwardRef<HTMLDivElement, CardMetaProps>(
  ({ className, children, ...props }, ref) => {
    const childArray = React.Children.toArray(children)
    
    return (
      <div
        ref={ref}
        className={cn("card__meta", className)}
        {...props}
      >
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {index > 0 && <div className="card__meta-separator" />}
            <div className="card__meta-item">{child}</div>
          </React.Fragment>
        ))}
      </div>
    )
  }
)
CardMeta.displayName = "CardMeta"

interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card__actions",
          {
            "card__actions--vertical": orientation === "vertical"
          },
          className
        )}
        {...props}
      />
    )
  }
)
CardActions.displayName = "CardActions"

interface CardBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error"
}

const CardBadge = React.forwardRef<HTMLDivElement, CardBadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card__badge",
          {
            "card__badge--success": variant === "success",
            "card__badge--warning": variant === "warning",
            "card__badge--error": variant === "error"
          },
          className
        )}
        {...props}
      />
    )
  }
)
CardBadge.displayName = "CardBadge"

// Legacy exports for backward compatibility
const CardDescription = CardSubtitle
const CardAction = CardActions

export {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardContent,
  CardFooter,
  CardMedia,
  CardMeta,
  CardActions,
  CardBadge,
  // Legacy exports
  CardDescription,
  CardAction
}
