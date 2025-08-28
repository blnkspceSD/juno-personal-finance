"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { motion, PanInfo, useDragControls } from "motion/react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay asChild data-slot="sheet-overlay" {...props}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn("fixed inset-0 z-50 bg-black/50", className)}
      />
    </SheetPrimitive.Overlay>
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  onClose,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  onClose?: () => void
}) {
  const dragControls = useDragControls()
  const [isDragging, setIsDragging] = React.useState(false)

  const getAnimationProps = () => {
    switch (side) {
      case "right":
        return {
          initial: { x: "100%" },
          animate: { x: 0 },
          exit: { x: "100%" }
        }
      case "left":
        return {
          initial: { x: "-100%" },
          animate: { x: 0 },
          exit: { x: "-100%" }
        }
      case "top":
        return {
          initial: { y: "-100%" },
          animate: { y: 0 },
          exit: { y: "-100%" }
        }
      case "bottom":
        return {
          initial: { y: "100%" },
          animate: { y: 0 },
          exit: { y: "100%" }
        }
      default:
        return {
          initial: { x: "100%" },
          animate: { x: 0 },
          exit: { x: "100%" }
        }
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    
    // Calculate swipe distance threshold (1/3 of the sheet width)
    const threshold = 100
    
    // Check if swipe is in the correct direction to close
    const shouldClose = (() => {
      switch (side) {
        case "right":
          return info.offset.x > threshold
        case "left":
          return info.offset.x < -threshold
        case "top":
          return info.offset.y < -threshold
        case "bottom":
          return info.offset.y > threshold
        default:
          return info.offset.x > threshold
      }
    })()

    if (shouldClose) {
      onClose?.()
    }
  }

  const getDragConstraints = () => {
    switch (side) {
      case "right":
        return { left: 0, right: 200 }
      case "left":
        return { left: -200, right: 0 }
      case "top":
        return { top: -200, bottom: 0 }
      case "bottom":
        return { top: 0, bottom: 200 }
      default:
        return { left: 0, right: 200 }
    }
  }

  const getDragDirection = () => {
    switch (side) {
      case "right":
      case "left":
        return "x"
      case "top":
      case "bottom":
        return "y"
      default:
        return "x"
    }
  }

  const getPositionClasses = () => {
    switch (side) {
      case "right":
        return "inset-y-0 right-0 h-full w-full sm:w-3/4 sm:max-w-[720px] border-l"
      case "left":
        return "inset-y-0 left-0 h-full w-full sm:w-3/4 sm:max-w-[720px] border-r"
      case "top":
        return "inset-x-0 top-0 h-auto border-b"
      case "bottom":
        return "inset-x-0 bottom-0 h-auto border-t"
      default:
        return "inset-y-0 right-0 h-full w-full sm:w-3/4 sm:max-w-[720px] border-l"
    }
  }

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content asChild data-slot="sheet-content" {...props}>
        <motion.div
          {...getAnimationProps()}
          drag={getDragDirection()}
          dragControls={dragControls}
          dragConstraints={getDragConstraints()}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          transition={{ 
            duration: isDragging ? 0 : 0.2, 
            ease: "easeOut" 
          }}
          className={cn(
            "fixed z-50 flex flex-col gap-4 bg-juno-surface-50 shadow-juno-shadow-lg-with-stroke border-juno-border",
            getPositionClasses(),
            className
          )}
        >
          {/* Drag handle for mobile - only show on touch devices */}
          <div 
            className="sm:hidden flex justify-center py-2 cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-8 h-1 bg-juno-border rounded-full" />
          </div>
          
          {children}
          <SheetPrimitive.Close className="ring-offset-juno-surface-50 focus:ring-juno-focus-ring data-[state=open]:bg-juno-surface-100 absolute top-4 right-4 rounded-juno-md opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </motion.div>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col space-y-2 px-juno-6 py-juno-4 border-b border-juno-border bg-juno-surface-100", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-juno-6 py-juno-4 border-t border-juno-border bg-juno-surface-100", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-lg font-semibold text-juno-text", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-juno-muted-fg", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
