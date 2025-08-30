'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardActions, CardClose } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CardConfig {
  variant: string
  size: string
  radius: string
  padding: string
  gap: string
  shadow: string
  borderWidth: string
  borderColor: string
  background: string
  hoverable: boolean
  interactive: boolean
  showClose: boolean
  showCTAs: boolean
}

export default function CardPlaygroundPage() {
  const [config, setConfig] = useState<CardConfig>({
    variant: 'none',
    size: 'none',
    radius: 'default',
    padding: 'default',
    gap: 'default',
    shadow: 'none',
    borderWidth: '0px',
    borderColor: 'transparent',
    background: 'white',
    hoverable: false,
    interactive: false,
    showClose: false,
    showCTAs: true
  })

  const [copiedCode, setCopiedCode] = useState<string>('')

  // Generate the card props and styles
  const cardProps: Record<string, string | boolean> = {}
  const cardStyles: React.CSSProperties = {}
  const cardClasses = ['card']

  // Add variant
  if (config.variant !== 'none') {
    cardProps.variant = config.variant
  }

  // Add size
  if (config.size !== 'none') {
    cardProps.size = config.size
  }

  // Add custom styles
  if (config.radius !== 'default') {
    cardStyles['--card-radius'] = config.radius
  }
  if (config.padding !== 'default') {
    cardStyles['--card-pad-block'] = config.padding
    cardStyles['--card-pad-inline'] = config.padding
  }
  if (config.gap !== 'default') {
    cardStyles['--card-gap'] = config.gap
  }
  if (config.shadow !== 'none') {
    cardStyles['--card-shadow'] = config.shadow
  }
  if (config.borderWidth !== '0px') {
    cardStyles['--card-border-width'] = config.borderWidth
  }
  if (config.borderColor !== 'transparent') {
    cardStyles['--card-border-color'] = config.borderColor
  }
  if (config.background !== 'white') {
    cardStyles['--card-bg'] = config.background
  }

  // Add interactive attributes
  if (config.hoverable) {
    cardProps['data-hoverable'] = 'true'
    cardClasses.push('cursor-pointer')
  }
  if (config.interactive) {
    cardProps.interactive = true
    cardClasses.push('cursor-pointer')
  }

  // Generate code
  const generateCode = () => {
    let jsxCode = '<Card'
    
    if (Object.keys(cardProps).length > 0) {
      Object.entries(cardProps).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          jsxCode += `\n  ${key}={${value}}`
        } else {
          jsxCode += `\n  ${key}="${value}"`
        }
      })
    }

    if (Object.keys(cardStyles).length > 0) {
      jsxCode += '\n  style={{'
      Object.entries(cardStyles).forEach(([key, value], index) => {
        const comma = index < Object.keys(cardStyles).length - 1 ? ',' : ''
        jsxCode += `\n    "${key}": "${value}"${comma}`
      })
      jsxCode += '\n  }}'
    }

    if (cardClasses.length > 1) {
      jsxCode += `\n  className="${cardClasses.slice(1).join(' ')}"`
    }

    jsxCode += '\n>'
    
    if (config.showClose) {
      jsxCode += '\n  <CardClose onClick={() => console.log("Close clicked")} />'
    }
    
    jsxCode += '\n  <CardHeader>'
    jsxCode += '\n    <CardTitle>Card Title</CardTitle>'
    jsxCode += '\n  </CardHeader>'
    jsxCode += '\n  <CardContent>'
    jsxCode += '\n    {/* Your content here */}'
    jsxCode += '\n  </CardContent>'
    
    if (config.showCTAs) {
      jsxCode += '\n  <CardFooter>'
      jsxCode += '\n    <CardActions>'
      jsxCode += '\n      <Button variant="primary" size="md">Action</Button>'
      jsxCode += '\n      <Button variant="secondary" size="md">Cancel</Button>'
      jsxCode += '\n    </CardActions>'
      jsxCode += '\n  </CardFooter>'
    }
    jsxCode += '\n</Card>'

    return jsxCode
  }

  const copyCode = () => {
    const code = generateCode()
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  return (
    <div className="min-h-screen bg-juno-surface-50">
      <div className="max-w-7xl mx-auto p-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-juno-text mb-4">
            Card Playground
          </h1>
          <p className="text-juno-muted-fg text-lg">
            Customize card properties and copy the generated code
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-juno-border sticky top-8">
              <h2 className="text-xl font-semibold text-juno-text mb-6">Card Properties</h2>
              
              <div className="space-y-6">
                
                {/* Variant */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Variant</label>
                  <select 
                    value={config.variant}
                    onChange={(e) => setConfig({...config, variant: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    <option value="none">None</option>
                    <option value="default">Default</option>
                    <option value="elevated">Elevated</option>
                    <option value="filled">Filled</option>
                    <option value="outlined">Outlined</option>
                    <option value="clean">Clean</option>
                    <option value="stroke-filled">Stroke + Filled</option>
                    <option value="background">Background</option>
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Size</label>
                  <select 
                    value={config.size}
                    onChange={(e) => setConfig({...config, size: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>

                {/* Border Radius */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Border Radius</label>
                  <select 
                    value={config.radius}
                    onChange={(e) => setConfig({...config, radius: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="0">None (0px)</option>
                    <option value="var(--juno-radius-sm)">Small</option>
                    <option value="var(--juno-radius-md)">Medium</option>
                    <option value="var(--juno-radius-lg)">Large</option>
                    <option value="var(--juno-radius-xl)">Extra Large</option>
                    <option value="var(--juno-radius-2xl)">2XL</option>
                    <option value="24px">Custom (24px)</option>
                  </select>
                </div>

                {/* Padding */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Padding</label>
                  <select 
                    value={config.padding}
                    onChange={(e) => setConfig({...config, padding: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="var(--juno-space-2)">XS (8px)</option>
                    <option value="var(--juno-space-4)">Small (16px)</option>
                    <option value="var(--juno-space-6)">Medium (24px)</option>
                    <option value="var(--juno-space-8)">Large (32px)</option>
                    <option value="var(--juno-space-10)">XL (40px)</option>
                  </select>
                </div>

                {/* Gap */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Content Gap</label>
                  <select 
                    value={config.gap}
                    onChange={(e) => setConfig({...config, gap: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="var(--juno-space-1)">XS (4px)</option>
                    <option value="var(--juno-space-2)">Small (8px)</option>
                    <option value="var(--juno-space-3)">Medium (12px)</option>
                    <option value="var(--juno-space-4)">Large (16px)</option>
                    <option value="var(--juno-space-6)">XL (24px)</option>
                  </select>
                </div>

                {/* Shadow */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Shadow</label>
                  <select 
                    value={config.shadow}
                    onChange={(e) => setConfig({...config, shadow: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    <option value="none">None</option>
                    <option value="var(--juno-shadow-xs)">XS</option>
                    <option value="var(--juno-shadow-sm)">Small</option>
                    <option value="var(--juno-shadow-md)">Medium</option>
                    <option value="var(--juno-shadow-lg)">Large</option>
                    <option value="var(--juno-shadow-xl)">XL</option>
                  </select>
                </div>

                {/* Border Width */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Border Width</label>
                  <select 
                    value={config.borderWidth}
                    onChange={(e) => setConfig({...config, borderWidth: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    <option value="0px">None</option>
                    <option value="1px">1px</option>
                    <option value="2px">2px</option>
                    <option value="3px">3px</option>
                  </select>
                </div>

                {/* Border Color */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Border Color</label>
                  <select 
                    value={config.borderColor}
                    onChange={(e) => setConfig({...config, borderColor: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    <option value="transparent">Transparent</option>
                    <option value="var(--juno-color-border)">Default Border</option>
                    <option value="var(--juno-color-border-strong)">Strong Border</option>
                    <option value="var(--juno-accent)">Accent</option>
                    <option value="#e5e7eb">#e5e7eb</option>
                  </select>
                </div>

                {/* Background */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Background</label>
                  <select 
                    value={config.background}
                    onChange={(e) => setConfig({...config, background: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    <option value="white">White</option>
                    <option value="var(--juno-color-bg-surface-secondary)">Secondary Surface</option>
                    <option value="var(--juno-accent-50)">Accent Light</option>
                    <option value="#f9fafb">#f9fafb</option>
                  </select>
                </div>

                {/* Interactive Options */}
                <div className="border-t border-juno-border pt-4">
                  <h3 className="text-sm font-medium text-juno-text mb-3">Interactive Options</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={config.hoverable}
                        onChange={(e) => setConfig({...config, hoverable: e.target.checked})}
                        className="rounded border-juno-border"
                      />
                      <span className="text-sm text-juno-text">Hoverable (state layer)</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={config.interactive}
                        onChange={(e) => setConfig({...config, interactive: e.target.checked})}
                        className="rounded border-juno-border"
                      />
                      <span className="text-sm text-juno-text">Interactive variant</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={config.showClose}
                        onChange={(e) => setConfig({...config, showClose: e.target.checked})}
                        className="rounded border-juno-border"
                      />
                      <span className="text-sm text-juno-text">Show close button</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={config.showCTAs}
                        onChange={(e) => setConfig({...config, showCTAs: e.target.checked})}
                        className="rounded border-juno-border"
                      />
                      <span className="text-sm text-juno-text">Show CTA buttons</span>
                    </label>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Preview & Code */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Preview */}
            <div>
              <h2 className="text-xl font-semibold text-juno-text mb-6">Preview</h2>
              <div className="bg-white p-12 rounded-xl border border-juno-border flex items-center justify-center min-h-[400px]">
                
                <Card
                  {...cardProps}
                  style={cardStyles}
                  className={cardClasses.slice(1).join(' ')}
                >
                  {config.showClose && (
                    <CardClose onClick={() => alert('Close clicked!')} />
                  )}
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder rectangle */}
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-32 w-full flex items-center justify-center">
                      <div className="text-gray-500 text-sm font-medium">Content Area (Full Width)</div>
                    </div>
                    <p className="text-juno-muted-fg text-sm mt-2">
                      This is a sample card content area where you can place any content.
                    </p>
                  </CardContent>
                  {config.showCTAs && (
                    <CardFooter>
                      <CardActions>
                        <Button variant="primary" size="md">Action</Button>
                        <Button variant="secondary" size="md">Cancel</Button>
                      </CardActions>
                    </CardFooter>
                  )}
                </Card>

              </div>
            </div>

            {/* Generated Code */}
            <div>
              <h2 className="text-xl font-semibold text-juno-text mb-6">Generated Code</h2>
              <div className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
                <pre className="text-sm">
                  <code>{generateCode()}</code>
                </pre>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={copyCode}
                  variant="primary"
                  className="w-full"
                >
                  {copiedCode ? '✓ Copied!' : 'Copy Code'}
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}