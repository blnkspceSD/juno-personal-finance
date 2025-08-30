'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Download, 
  Heart, 
  Settings, 
  Trash2, 
  Save, 
  AlertTriangle,
  Check,
  Link,
  ArrowRight,
  Search,
  Edit,
  Eye,
  Star,
  Upload
} from 'lucide-react'

interface ButtonConfig {
  variant: string
  size: string
  disabled: boolean
  loading: boolean
  icon: string
  iconPosition: 'left' | 'right'
  children: string
  asChild: boolean
}

const iconOptions = [
  { value: 'none', label: 'None' },
  { value: 'Plus', label: 'Plus', component: Plus },
  { value: 'Download', label: 'Download', component: Download },
  { value: 'Heart', label: 'Heart', component: Heart },
  { value: 'Settings', label: 'Settings', component: Settings },
  { value: 'Trash2', label: 'Trash', component: Trash2 },
  { value: 'Save', label: 'Save', component: Save },
  { value: 'AlertTriangle', label: 'Alert', component: AlertTriangle },
  { value: 'Check', label: 'Check', component: Check },
  { value: 'ArrowRight', label: 'Arrow Right', component: ArrowRight },
  { value: 'Search', label: 'Search', component: Search },
  { value: 'Edit', label: 'Edit', component: Edit },
  { value: 'Eye', label: 'Eye', component: Eye },
  { value: 'Star', label: 'Star', component: Star },
  { value: 'Upload', label: 'Upload', component: Upload }
]

export default function ButtonPlaygroundPage() {
  const [config, setConfig] = useState<ButtonConfig>({
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    icon: 'none',
    iconPosition: 'left',
    children: 'Button Text',
    asChild: false
  })

  const [copiedCode, setCopiedCode] = useState<string>('')

  // Get the selected icon component
  const getIconComponent = () => {
    const iconOption = iconOptions.find(opt => opt.value === config.icon)
    if (!iconOption || iconOption.value === 'none') return null
    const IconComponent = iconOption.component
    return <IconComponent size={16} />
  }

  // Generate the button props
  const generateButtonProps = () => {
    const props: Record<string, any> = {}
    
    // Always set variant (don't skip primary)
    props.variant = config.variant
    if (config.size !== 'md') props.size = config.size
    if (config.disabled) props.disabled = config.disabled
    if (config.loading) props.loading = config.loading
    if (config.asChild) props.asChild = config.asChild
    
    const iconComponent = getIconComponent()
    if (iconComponent) {
      props.icon = iconComponent
      if (config.iconPosition !== 'left') props.iconPosition = config.iconPosition
    }
    
    return props
  }

  // Generate JSX code
  const generateCode = () => {
    const props = generateButtonProps()
    const isIconOnly = config.icon !== 'none' && (!config.children || config.children.trim() === '')
    
    let jsxCode = '<Button'
    
    // Add props
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'icon') {
        const iconOption = iconOptions.find(opt => opt.value === config.icon)
        if (iconOption) {
          jsxCode += `\n  ${key}={<${iconOption.value} size={16} />}`
        }
      } else if (typeof value === 'boolean') {
        jsxCode += `\n  ${key}={${value}}`
      } else {
        jsxCode += `\n  ${key}="${value}"`
      }
    })

    // Add aria-label for icon-only buttons
    if (isIconOnly) {
      jsxCode += `\n  aria-label="${config.children || 'Button'}"`
    }

    jsxCode += '\n>'

    // Add children if not icon-only
    if (!isIconOnly && config.children) {
      jsxCode += `\n  ${config.children}\n`
    }

    jsxCode += '</Button>'

    // Add imports
    const imports = ['Button']
    if (config.icon !== 'none') {
      imports.push(config.icon)
    }

    const importCode = `import { ${imports.join(', ')} } from '@/components/ui/button'\n${config.icon !== 'none' ? `import { ${config.icon} } from 'lucide-react'\n\n` : '\n'}`

    return importCode + jsxCode
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
            Button Playground
          </h1>
          <p className="text-juno-muted-fg text-lg">
            Customize button properties and copy the generated code
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-juno-border sticky top-8">
              <h2 className="text-xl font-semibold text-juno-text mb-6">Button Properties</h2>
              
              <div className="space-y-6">
                
                {/* Variant */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Variant</label>
                  <select 
                    value={config.variant}
                    onChange={(e) => setConfig({...config, variant: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                    <option value="destructive">Destructive</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="link">Link</option>
                    <option value="icon">Icon Only</option>
                    <option value="icon-primary">Icon Primary</option>
                    <option value="icon-ghost">Icon Ghost</option>
                    <option value="icon-destructive">Icon Destructive</option>
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
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="icon">Icon (Square)</option>
                  </select>
                </div>

                {/* Button Text */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Button Text</label>
                  <input 
                    type="text"
                    value={config.children}
                    onChange={(e) => setConfig({...config, children: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                    placeholder="Enter button text"
                  />
                  <p className="text-xs text-juno-muted-fg mt-1">
                    Leave empty for icon-only button
                  </p>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-juno-text mb-2">Icon</label>
                  <select 
                    value={config.icon}
                    onChange={(e) => setConfig({...config, icon: e.target.value})}
                    className="w-full p-2 border border-juno-border rounded-lg text-sm"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Icon Position */}
                {config.icon !== 'none' && config.children && config.children.trim() !== '' && (
                  <div>
                    <label className="block text-sm font-medium text-juno-text mb-2">Icon Position</label>
                    <select 
                      value={config.iconPosition}
                      onChange={(e) => setConfig({...config, iconPosition: e.target.value as 'left' | 'right'})}
                      className="w-full p-2 border border-juno-border rounded-lg text-sm"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                )}

                {/* State Options */}
                <div className="border-t border-juno-border pt-4">
                  <h3 className="text-sm font-medium text-juno-text mb-3">Button States</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={config.disabled}
                        onChange={(e) => setConfig({...config, disabled: e.target.checked})}
                        className="rounded border-juno-border"
                      />
                      <span className="text-sm text-juno-text">Disabled</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={config.loading}
                        onChange={(e) => setConfig({...config, loading: e.target.checked})}
                        className="rounded border-juno-border"
                        disabled={config.disabled}
                      />
                      <span className="text-sm text-juno-text">Loading</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={config.asChild}
                        onChange={(e) => setConfig({...config, asChild: e.target.checked})}
                        className="rounded border-juno-border"
                      />
                      <span className="text-sm text-juno-text">As Child (Slot)</span>
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
              <div className="bg-white p-12 rounded-xl border border-juno-border flex items-center justify-center min-h-[300px]">
                
                <Button
                  {...generateButtonProps()}
                  onClick={() => alert('Button clicked!')}
                  aria-label={config.icon !== 'none' && (!config.children || config.children.trim() === '') ? (config.children || 'Button') : undefined}
                >
                  {config.children && config.children.trim() !== '' ? config.children : null}
                </Button>

              </div>
            </div>

            {/* Button State Examples */}
            <div>
              <h2 className="text-xl font-semibold text-juno-text mb-6">State Examples</h2>
              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="text-center">
                    <p className="text-xs text-juno-muted-fg mb-2">Normal</p>
                    <Button {...generateButtonProps()}>
                      {config.children && config.children.trim() !== '' ? config.children : null}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-juno-muted-fg mb-2">Hover</p>
                    <Button {...generateButtonProps()} className="hover:bg-opacity-90">
                      {config.children && config.children.trim() !== '' ? config.children : null}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-juno-muted-fg mb-2">Loading</p>
                    <Button {...generateButtonProps()} loading={true}>
                      {config.children && config.children.trim() !== '' ? config.children : null}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-juno-muted-fg mb-2">Disabled</p>
                    <Button {...generateButtonProps()} disabled={true}>
                      {config.children && config.children.trim() !== '' ? config.children : null}
                    </Button>
                  </div>

                </div>
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