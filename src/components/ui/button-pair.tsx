'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonPairProps {
  direction?: 'horizontal' | 'vertical' | 'auto'
  gap?: 'sm' | 'md' | 'lg' | number
  order?: 'primary-first' | 'secondary-first'
  'aria-label'?: string
  className?: string
  children: React.ReactNode
}

export function ButtonPair({
  direction = 'auto',
  gap = 'md',
  order = 'primary-first',
  'aria-label': ariaLabel,
  className,
  children,
}: ButtonPairProps) {
  const items = React.Children.toArray(children).slice(0, 2) as React.ReactElement[]

  const style: React.CSSProperties = {}
  
  // Map gap prop to CSS custom property
  const gapValue =
    typeof gap === 'number'
      ? `${gap}px`
      : gap === 'sm'
      ? 'var(--juno-space-2)'
      : gap === 'lg'
      ? 'var(--juno-space-4)'
      : 'var(--juno-space-3)' // md default

  ;(style as any)['--btnpair-gap'] = gapValue

  // Set direction if not auto
  if (direction !== 'auto') {
    ;(style as any)['--btnpair-direction'] = direction === 'vertical' ? 'column' : 'row'
  }

  // Reorder children if needed
  const orderedItems =
    order === 'secondary-first' && items.length === 2 ? [items[1], items[0]] : items

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'btn-pair',
        direction === 'vertical' && 'is-vertical',
        className
      )}
      style={style}
    >
      {orderedItems}
    </div>
  )
}