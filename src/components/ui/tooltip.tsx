import * as React from "react"

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
}

export function Tooltip({ children, content, side = 'top', disabled = false }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  if (disabled) {
    return <>{children}</>
  }

  const sideClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-t-4 border-l-transparent border-r-transparent border-l-4 border-r-4',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-b-4 border-l-transparent border-r-transparent border-l-4 border-r-4',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-l-4 border-t-transparent border-b-transparent border-t-4 border-b-4',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-r-4 border-t-transparent border-b-transparent border-t-4 border-b-4'
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-10 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap ${sideClasses[side]}`}>
          {content}
          <div className={`absolute w-0 h-0 ${arrowClasses[side]}`} />
        </div>
      )}
    </div>
  )
}