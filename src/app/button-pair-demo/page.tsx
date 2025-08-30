'use client'

import { Button } from '@/components/ui/button'
import { ButtonPair } from '@/components/ui/button-pair'
import { Save, X, Download, Plus, Trash2, AlertTriangle } from 'lucide-react'

export default function ButtonPairDemoPage() {
  return (
    <div className="min-h-screen bg-juno-surface-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-juno-text mb-4">
            Button Pair Component
          </h1>
          <p className="text-juno-muted-fg text-lg">
            Two-button layouts with configurable spacing and direction
          </p>
        </div>

        <div className="space-y-12">
          
          {/* Basic Examples */}
          <section>
            <h2 className="text-2xl font-semibold text-juno-text mb-6">Basic Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Horizontal (Default)</h3>
                <ButtonPair aria-label="Dialog actions">
                  <Button variant="primary">Save</Button>
                  <Button variant="ghost">Cancel</Button>
                </ButtonPair>
                
                <pre className="mt-4 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`<ButtonPair aria-label="Dialog actions">
  <Button variant="primary">Save</Button>
  <Button variant="ghost">Cancel</Button>
</ButtonPair>`}
                </pre>
              </div>

              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Vertical</h3>
                <ButtonPair direction="vertical" aria-label="Dialog actions">
                  <Button variant="primary">Save</Button>
                  <Button variant="ghost">Cancel</Button>
                </ButtonPair>
                
                <pre className="mt-4 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`<ButtonPair direction="vertical" aria-label="Dialog actions">
  <Button variant="primary">Save</Button>
  <Button variant="ghost">Cancel</Button>
</ButtonPair>`}
                </pre>
              </div>
            </div>
          </section>

          {/* Variant Combinations */}
          <section>
            <h2 className="text-2xl font-semibold text-juno-text mb-6">Variant Combinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Primary + Secondary</h3>
                <ButtonPair aria-label="Action pair">
                  <Button variant="primary">Download</Button>
                  <Button variant="secondary">Preview</Button>
                </ButtonPair>
              </div>

              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Outline + Ghost</h3>
                <ButtonPair aria-label="Action pair">
                  <Button variant="outline">Edit</Button>
                  <Button variant="ghost">Delete</Button>
                </ButtonPair>
              </div>

              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Destructive Actions</h3>
                <ButtonPair aria-label="Destructive actions">
                  <Button variant="destructive">Delete</Button>
                  <Button variant="ghost">Cancel</Button>
                </ButtonPair>
              </div>

              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Success Actions</h3>
                <ButtonPair aria-label="Success actions">
                  <Button variant="success">Approve</Button>
                  <Button variant="outline">Review Later</Button>
                </ButtonPair>
              </div>
            </div>
          </section>

          {/* With Icons */}
          <section>
            <h2 className="text-2xl font-semibold text-juno-text mb-6">With Icons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Horizontal with Icons</h3>
                <ButtonPair aria-label="File actions">
                  <Button variant="primary" icon={<Save size={16} />}>
                    Save File
                  </Button>
                  <Button variant="ghost" icon={<X size={16} />}>
                    Cancel
                  </Button>
                </ButtonPair>
              </div>

              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Vertical with Icons</h3>
                <ButtonPair direction="vertical" aria-label="File actions">
                  <Button variant="primary" icon={<Download size={16} />}>
                    Download
                  </Button>
                  <Button variant="secondary" icon={<Plus size={16} />}>
                    Create New
                  </Button>
                </ButtonPair>
              </div>
            </div>
          </section>

          {/* Gap Variations */}
          <section>
            <h2 className="text-2xl font-semibold text-juno-text mb-6">Gap Variations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Small Gap (8px)</h3>
                <ButtonPair gap="sm" aria-label="Tight spacing">
                  <Button variant="primary">Save</Button>
                  <Button variant="ghost">Cancel</Button>
                </ButtonPair>
              </div>

              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Medium Gap (12px)</h3>
                <ButtonPair gap="md" aria-label="Normal spacing">
                  <Button variant="primary">Save</Button>
                  <Button variant="ghost">Cancel</Button>
                </ButtonPair>
              </div>

              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Large Gap (16px)</h3>
                <ButtonPair gap="lg" aria-label="Wide spacing">
                  <Button variant="primary">Save</Button>
                  <Button variant="ghost">Cancel</Button>
                </ButtonPair>
              </div>
            </div>
          </section>

          {/* Order Variations */}
          <section>
            <h2 className="text-2xl font-semibold text-juno-text mb-6">Button Order</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Primary First (Default)</h3>
                <ButtonPair order="primary-first" aria-label="Default order">
                  <Button variant="primary">Confirm</Button>
                  <Button variant="ghost">Cancel</Button>
                </ButtonPair>
              </div>

              <div className="bg-white p-6 rounded-xl border border-juno-border">
                <h3 className="font-semibold text-juno-text mb-4">Secondary First</h3>
                <ButtonPair order="secondary-first" aria-label="Reversed order">
                  <Button variant="primary">Delete</Button>
                  <Button variant="ghost">Keep</Button>
                </ButtonPair>
              </div>
            </div>
          </section>

          {/* Responsive Demo */}
          <section>
            <h2 className="text-2xl font-semibold text-juno-text mb-6">Responsive Behavior</h2>
            <div className="bg-white p-6 rounded-xl border border-juno-border">
              <h3 className="font-semibold text-juno-text mb-4">Auto-Stack (Resize to see)</h3>
              <p className="text-sm text-juno-muted-fg mb-4">
                Below ~360px container width, buttons automatically stack vertically
              </p>
              <div style={{ maxWidth: '300px', border: '2px dashed #ccc', padding: '16px' }}>
                <ButtonPair direction="auto" aria-label="Responsive demo">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="ghost">Discard</Button>
                </ButtonPair>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}