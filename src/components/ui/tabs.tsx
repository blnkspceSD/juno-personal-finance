"use client"

import * as React from "react"
import { createContext, useContext } from "react"
import { cn } from "@/lib/utils"

// Types
interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  orientation: "horizontal" | "vertical"
  variant: "underline" | "pill"
  size: "sm" | "md" | "lg"
}

// Context
const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider")
  }
  return context
}

// Main Tabs container component
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
  orientation?: "horizontal" | "vertical"
  variant?: "underline" | "pill" 
  size?: "sm" | "md" | "lg"
}

function Tabs({ 
  value, 
  onValueChange, 
  orientation = "horizontal",
  variant = "underline",
  size = "md",
  className,
  children,
  ...props 
}: TabsProps) {
  const contextValue: TabsContextValue = {
    value,
    onValueChange,
    orientation,
    variant,
    size
  }

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={cn(
          "tabs",
          {
            "tabs--vertical": orientation === "vertical",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// TabsList - container for tab triggers
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

function TabsList({ className, children, ...props }: TabsListProps) {
  const { orientation, variant } = useTabsContext()
  const listRef = React.useRef<HTMLDivElement>(null)

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!listRef.current) return

    const tabs = Array.from(
      listRef.current.querySelectorAll('[role="tab"]:not([disabled])')
    ) as HTMLElement[]
    
    const currentIndex = tabs.indexOf(document.activeElement as HTMLElement)
    if (currentIndex === -1) return

    let targetIndex: number

    switch (event.key) {
      case 'ArrowRight':
        if (orientation === "horizontal") {
          event.preventDefault()
          targetIndex = (currentIndex + 1) % tabs.length
        }
        break
      case 'ArrowLeft':
        if (orientation === "horizontal") {
          event.preventDefault()
          targetIndex = (currentIndex - 1 + tabs.length) % tabs.length
        }
        break
      case 'ArrowDown':
        if (orientation === "vertical") {
          event.preventDefault()
          targetIndex = (currentIndex + 1) % tabs.length
        }
        break
      case 'ArrowUp':
        if (orientation === "vertical") {
          event.preventDefault()
          targetIndex = (currentIndex - 1 + tabs.length) % tabs.length
        }
        break
      case 'Home':
        event.preventDefault()
        targetIndex = 0
        break
      case 'End':
        event.preventDefault()
        targetIndex = tabs.length - 1
        break
      default:
        return
    }

    if (targetIndex !== undefined) {
      tabs[targetIndex]?.focus()
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={cn(
        "tabs__list",
        {
          "tabs__list--vertical": orientation === "vertical",
          "tabs__list--pill": variant === "pill",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// TabsTrigger - individual tab button
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  icon?: React.ReactNode
}

function TabsTrigger({ 
  value, 
  icon,
  className, 
  children, 
  onClick,
  onKeyDown,
  ...props 
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange, size } = useTabsContext()
  const isActive = selectedValue === value
  const triggerId = `tab-${value}`
  const panelId = `panel-${value}`

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onValueChange(value)
    onClick?.(event)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Handle Enter and Space to activate tab
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onValueChange(value)
    }
    onKeyDown?.(event as any)
  }

  return (
    <button
      id={triggerId}
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      data-state={isActive ? "active" : "inactive"}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "tabs__trigger",
        {
          "tabs__trigger--sm": size === "sm",
          "tabs__trigger--lg": size === "lg",
        },
        className
      )}
      {...props}
    >
      {icon && <span className="tab__icon" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  )
}

// TabsContent - tab panel content
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  forceMount?: boolean
}

function TabsContent({ 
  value, 
  forceMount = false,
  className, 
  children, 
  ...props 
}: TabsContentProps) {
  const { value: selectedValue } = useTabsContext()
  const isActive = selectedValue === value
  const triggerId = `tab-${value}`
  const panelId = `panel-${value}`

  if (!isActive && !forceMount) {
    return null
  }

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={triggerId}
      data-state={isActive ? "active" : "inactive"}
      tabIndex={0}
      className={cn(
        "tabs__content",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }