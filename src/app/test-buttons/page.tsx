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
  Link
} from 'lucide-react'

export default function TestButtonsPage() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const toggleLoading = (key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }))
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [key]: false }))
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-juno-surface-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-juno-text mb-4">
            Juno Button System
          </h1>
          <p className="text-juno-muted-fg text-lg mb-6">
            Comprehensive button variants with Juno Design System tokens
          </p>
        </div>

        {/* Primary Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Primary Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Primary</h3>
              <div className="space-y-3">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Secondary</h3>
              <div className="space-y-3">
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary" size="md">Medium</Button>
                <Button variant="secondary" size="lg">Large</Button>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Outline</h3>
              <div className="space-y-3">
                <Button variant="outline" size="sm">Small</Button>
                <Button variant="outline" size="md">Medium</Button>
                <Button variant="outline" size="lg">Large</Button>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Ghost</h3>
              <div className="space-y-3">
                <Button variant="ghost" size="sm">Small</Button>
                <Button variant="ghost" size="md">Medium</Button>
                <Button variant="ghost" size="lg">Large</Button>
              </div>
            </div>

          </div>
        </section>

        {/* Semantic Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Semantic Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Destructive</h3>
              <div className="space-y-3">
                <Button variant="destructive" size="sm" icon={<Trash2 size={14} />} iconPosition="left">Delete</Button>
                <Button variant="destructive" size="md" icon={<Trash2 size={16} />} iconPosition="left">Remove</Button>
                <Button variant="destructive" size="lg" icon={<Trash2 size={18} />} iconPosition="left">Destroy</Button>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Success</h3>
              <div className="space-y-3">
                <Button variant="success" size="sm" icon={<Save size={14} />} iconPosition="left">Save</Button>
                <Button variant="success" size="md" icon={<Check size={16} />} iconPosition="left">Confirm</Button>
                <Button variant="success" size="lg" icon={<Check size={18} />} iconPosition="left">Complete</Button>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Warning</h3>
              <div className="space-y-3">
                <Button variant="warning" size="sm" icon={<AlertTriangle size={14} />} iconPosition="left">Caution</Button>
                <Button variant="warning" size="md" icon={<AlertTriangle size={16} />} iconPosition="left">Warning</Button>
                <Button variant="warning" size="lg" icon={<AlertTriangle size={18} />} iconPosition="left">Alert</Button>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Link</h3>
              <div className="space-y-3">
                <Button variant="link" size="sm">Small Link</Button>
                <Button variant="link" size="md">Medium Link</Button>
                <Button variant="link" size="lg">Large Link</Button>
              </div>
            </div>

          </div>
        </section>

        {/* Icon Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Icon Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Icon Only</h3>
              <div className="flex items-center gap-3">
                <Button variant="icon" size="sm" icon={<Plus size={16} />} aria-label="Add item" />
                <Button variant="icon" size="md" icon={<Download size={16} />} aria-label="Download" />
                <Button variant="icon" size="lg" icon={<Heart size={16} />} aria-label="Like" />
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Icon Primary</h3>
              <div className="flex items-center gap-3">
                <Button variant="icon-primary" size="sm" icon={<Plus size={16} />} aria-label="Add item" />
                <Button variant="icon-primary" size="md" icon={<Download size={16} />} aria-label="Download" />
                <Button variant="icon-primary" size="lg" icon={<Heart size={16} />} aria-label="Like" />
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Icon Ghost</h3>
              <div className="flex items-center gap-3">
                <Button variant="icon-ghost" size="sm" icon={<Plus size={16} />} aria-label="Add item" />
                <Button variant="icon-ghost" size="md" icon={<Download size={16} />} aria-label="Download" />
                <Button variant="icon-ghost" size="lg" icon={<Heart size={16} />} aria-label="Like" />
              </div>
            </div>

          </div>
        </section>

        {/* Buttons with Icons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Buttons with Icons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Left Icons</h3>
              <div className="space-y-3">
                <Button variant="primary" icon={<Plus size={16} />} iconPosition="left">Add Item</Button>
                <Button variant="secondary" icon={<Download size={16} />} iconPosition="left">Download</Button>
                <Button variant="outline" icon={<Settings size={16} />} iconPosition="left">Settings</Button>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Right Icons</h3>
              <div className="space-y-3">
                <Button variant="primary" icon={<Download size={16} />} iconPosition="right">Export</Button>
                <Button variant="secondary" icon={<Plus size={16} />} iconPosition="right">Create</Button>
                <Button variant="ghost" icon={<Heart size={16} />} iconPosition="right">Favorite</Button>
              </div>
            </div>

          </div>
        </section>

        {/* Interactive States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Interactive States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Loading</h3>
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  loading={loadingStates.primary1}
                  onClick={() => toggleLoading('primary1')}
                >
                  {loadingStates.primary1 ? 'Loading...' : 'Click me'}
                </Button>
                <Button 
                  variant="secondary" 
                  loading={loadingStates.secondary1}
                  onClick={() => toggleLoading('secondary1')}
                >
                  {loadingStates.secondary1 ? 'Processing...' : 'Process'}
                </Button>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Disabled</h3>
              <div className="space-y-3">
                <Button variant="primary" disabled>Disabled Primary</Button>
                <Button variant="secondary" disabled>Disabled Secondary</Button>
                <Button variant="outline" disabled>Disabled Outline</Button>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Loading with Icons</h3>
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  icon={<Download size={16} />}
                  loading={loadingStates.iconLoading1}
                  onClick={() => toggleLoading('iconLoading1')}
                >
                  {loadingStates.iconLoading1 ? 'Downloading...' : 'Download'}
                </Button>
                <Button 
                  variant="icon-primary" 
                  icon={<Plus size={16} />}
                  loading={loadingStates.iconLoading2}
                  onClick={() => toggleLoading('iconLoading2')}
                  aria-label="Add item"
                />
              </div>
            </div>

            <div className="space-y-4 p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text">Hover States</h3>
              <div className="space-y-3">
                <Button variant="primary">Hover me</Button>
                <Button variant="ghost">Ghost hover</Button>
                <Button variant="outline">Outline hover</Button>
              </div>
              <p className="text-sm text-juno-muted-fg">Hover over buttons to see state changes</p>
            </div>

          </div>
        </section>

        {/* Button Groups */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Button Groups & Layouts</h2>
          <div className="space-y-6">
            
            <div className="p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text mb-4">Action Groups</h3>
              <div className="space-y-4">
                
                <div className="flex items-center gap-3">
                  <Button variant="primary">Save</Button>
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="ghost">Reset</Button>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" icon={<Plus size={16} />}>Create</Button>
                  <Button variant="outline" icon={<Settings size={16} />}>Settings</Button>
                  <Button variant="destructive" icon={<Plus size={16} />}>Delete</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" icon={<Heart size={16} />} iconPosition="left">Like</Button>
                    <Button variant="ghost" icon={<Download size={16} />} iconPosition="left">Share</Button>
                  </div>
                  <Button variant="primary">Continue</Button>
                </div>

              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-juno-border">
              <h3 className="font-medium text-juno-text mb-4">Icon Button Groups</h3>
              <div className="space-y-4">
                
                <div className="flex items-center gap-2">
                  <Button variant="icon-ghost" icon={<Plus size={16} />} aria-label="Add" />
                  <Button variant="icon-ghost" icon={<Download size={16} />} aria-label="Download" />
                  <Button variant="icon-ghost" icon={<Heart size={16} />} aria-label="Like" />
                  <Button variant="icon-ghost" icon={<Settings size={16} />} aria-label="Settings" />
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="icon-primary" icon={<Plus size={16} />} aria-label="Add" />
                  <Button variant="icon" icon={<Download size={16} />} aria-label="Download" />
                  <Button variant="icon" icon={<Heart size={16} />} aria-label="Like" />
                  <Button variant="icon-destructive" icon={<Settings size={16} />} aria-label="Settings" />
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Real-world Usage Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Form Actions */}
            <div className="p-6 bg-white rounded-xl border border-juno-border space-y-4">
              <h3 className="font-medium text-juno-text">Form Actions</h3>
              <div className="space-y-4">
                <div className="p-4 bg-juno-surface-50 rounded-lg">
                  <p className="text-sm text-juno-muted-fg mb-3">Edit Profile Form</p>
                  <div className="flex items-center justify-between">
                    <Button variant="ghost">Cancel</Button>
                    <div className="flex gap-2">
                      <Button variant="secondary">Save Draft</Button>
                      <Button variant="primary">Save Changes</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-juno-surface-50 rounded-lg">
                  <p className="text-sm text-juno-muted-fg mb-3">Delete Account</p>
                  <div className="flex items-center justify-between">
                    <Button variant="secondary">Keep Account</Button>
                    <Button variant="destructive">Delete Forever</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar Actions */}
            <div className="p-6 bg-white rounded-xl border border-juno-border space-y-4">
              <h3 className="font-medium text-juno-text">Toolbar Actions</h3>
              <div className="space-y-4">
                <div className="p-4 bg-juno-surface-50 rounded-lg">
                  <p className="text-sm text-juno-muted-fg mb-3">Document Editor</p>
                  <div className="flex items-center gap-2">
                    <Button variant="icon-ghost" icon={<Plus size={16} />} aria-label="Add" />
                    <Button variant="icon-ghost" icon={<Download size={16} />} aria-label="Download" />
                    <div className="w-px h-6 bg-juno-border mx-1" />
                    <Button variant="icon-ghost" icon={<Heart size={16} />} aria-label="Favorite" />
                    <Button variant="icon-ghost" icon={<Settings size={16} />} aria-label="Settings" />
                  </div>
                </div>
                
                <div className="p-4 bg-juno-surface-50 rounded-lg">
                  <p className="text-sm text-juno-muted-fg mb-3">Dashboard Actions</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" icon={<Plus size={16} />} iconPosition="left">New</Button>
                      <Button variant="outline" icon={<Download size={16} />} iconPosition="left">Export</Button>
                    </div>
                    <Button variant="primary" icon={<Settings size={16} />} iconPosition="left">Settings</Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}