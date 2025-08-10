import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Existing variants (unchanged)
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        
        // New Juno variants - Primary cyan accent
        "juno-primary":
          "bg-juno-accent text-juno-text rounded-xl shadow-md hover:brightness-105 active:brightness-95 focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0",
        "juno-secondary":
          "border border-juno-text text-juno-text bg-transparent rounded-xl hover:bg-juno-pill-bg focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0",
        "juno-ghost":
          "text-juno-text hover:bg-juno-pill-bg focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0",
        "juno-link":
          "text-juno-text underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0",
        
        // Juno Teal variants - Professional, cooler tone
        "juno-teal":
          "bg-juno-teal-400 text-white rounded-xl shadow-md hover:bg-juno-teal-500 active:bg-juno-teal-600 focus-visible:ring-2 focus-visible:ring-juno-teal-300 focus-visible:ring-offset-0",
        "juno-teal-outline":
          "border border-juno-teal-500 text-juno-teal-600 bg-transparent rounded-xl hover:bg-juno-teal-50 focus-visible:ring-2 focus-visible:ring-juno-teal-300 focus-visible:ring-offset-0",
        "juno-teal-ghost":
          "text-juno-teal-600 hover:bg-juno-teal-50 focus-visible:ring-2 focus-visible:ring-juno-teal-300 focus-visible:ring-offset-0",
        
        // Juno Blue variants - Trustworthy, warmer tone
        "juno-blue":
          "bg-juno-blue-500 text-white rounded-xl shadow-md hover:bg-juno-blue-600 active:bg-juno-blue-700 focus-visible:ring-2 focus-visible:ring-juno-blue-300 focus-visible:ring-offset-0",
        "juno-blue-outline":
          "border border-juno-blue-500 text-juno-blue-600 bg-transparent rounded-xl hover:bg-juno-blue-50 focus-visible:ring-2 focus-visible:ring-juno-blue-300 focus-visible:ring-offset-0",
        "juno-blue-ghost":
          "text-juno-blue-600 hover:bg-juno-blue-50 focus-visible:ring-2 focus-visible:ring-juno-blue-300 focus-visible:ring-offset-0",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        
        // Juno mobile-optimized sizes (44px minimum for touch targets)
        "juno-mobile": "h-11 px-6 py-3 has-[>svg]:px-4 md:h-9 md:px-4 md:py-2",
        "juno-mobile-sm": "h-10 px-4 py-2.5 has-[>svg]:px-3 md:h-8 md:px-3",
        "juno-mobile-lg": "h-12 px-8 py-4 has-[>svg]:px-6 md:h-10 md:px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
