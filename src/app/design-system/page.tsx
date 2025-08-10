/**
 * Design System Preview Page
 * 
 * This page displays all Juno design tokens to verify integration
 * Remove this file before production deployment
 */

import { ExplainChip } from '@/components/ui/explain-chip'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen p-8 space-y-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl font-bold text-juno-text mb-6">
            Juno Design System Preview
          </h1>
          <p className="text-juno-muted-fg text-lg">
            Testing implementation of Juno design tokens with generous spacing
          </p>
        </header>

        {/* Color Palette */}
        <section className="space-y-10 mb-24">
          <h2 className="text-2xl font-semibold text-juno-text mb-8">Color Palette</h2>
          
          {/* Brand Colors */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Brand Colors (Token Mapped)</h3>
            <div className="bg-juno-surface-100 p-8 rounded-juno-xl shadow-juno-card-with-stroke">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="h-20 bg-juno-accent rounded-juno-xl border border-juno-border"></div>
                  <div className="text-sm">
                    <div className="font-medium text-juno-text">Juno Accent</div>
                    <div className="text-juno-muted-fg">Maps to: <code className="bg-juno-pill-bg px-1 rounded">juno-accent-300</code></div>
                    <div className="text-juno-muted-fg">Color: #85D6FF</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-20 bg-juno-text rounded-juno-xl border border-juno-border"></div>
                  <div className="text-sm">
                    <div className="font-medium text-juno-text">Juno Text</div>
                    <div className="text-juno-muted-fg">Maps to: <code className="bg-juno-pill-bg px-1 rounded">juno-neutral-750</code></div>
                    <div className="text-juno-muted-fg">Color: #212730</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-juno-surface-200 rounded-juno-xl">
              <h4 className="font-medium text-juno-text mb-4">✨ Token Mapping Benefits</h4>
              <ul className="text-sm text-juno-muted-fg space-y-2">
                <li>• <strong>Consistent:</strong> Brand colors are always part of the scale system</li>
                <li>• <strong>Flexible:</strong> Easy to adjust by changing the mapping</li>
                <li>• <strong>Scalable:</strong> Can use lighter/darker variants from same family</li>
                <li>• <strong>Predictable:</strong> <code className="bg-white px-1 rounded">juno-accent</code> = <code className="bg-white px-1 rounded">juno-accent-300</code></li>
              </ul>
            </div>
          </div>

          {/* Accent Scale - Primary Cyan */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Primary Accent Scale (Cyan)</h3>
            <div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              <div className="space-y-2">
                <div className="h-16 bg-juno-accent-50 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">50</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-accent-100 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">100</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-accent-200 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">200</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-accent-300 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">300</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-accent-400 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">400</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-accent-500 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">500</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-accent-600 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">600</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-accent-700 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">700</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-accent-800 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">800</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-accent-900 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">900</div>
              </div>
              </div>
            </div>
          </div>

          {/* Teal Accent Scale */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Teal Accent Scale (Professional)</h3>
            <div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              <div className="space-y-2">
                <div className="h-16 bg-juno-teal-50 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">50</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-teal-100 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">100</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-teal-200 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">200</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-teal-300 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">300</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-teal-400 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">400</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-teal-500 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">500</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-teal-600 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">600</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-teal-700 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">700</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-teal-800 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">800</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-teal-900 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">900</div>
              </div>
              </div>
            </div>
          </div>

          {/* Blue Accent Scale */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Blue Accent Scale (Trustworthy)</h3>
            <div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              <div className="space-y-2">
                <div className="h-16 bg-juno-blue-50 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">50</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-blue-100 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">100</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-blue-200 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">200</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-blue-300 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">300</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-blue-400 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">400</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-blue-500 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">500</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-blue-600 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">600</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-blue-700 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">700</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-blue-800 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">800</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-blue-900 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">900</div>
              </div>
              </div>
            </div>
          </div>

          {/* Dark Neutral Scale */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Dark Neutral Scale (Grays & Blacks)</h3>
            <div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
              <div className="grid grid-cols-5 md:grid-cols-11 gap-2">
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-100 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">100</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-200 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">200</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-300 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">300</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-400 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">400</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-500 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">500</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-600 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">600</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-750 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">750</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-800 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">800</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-850 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">850</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-900 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">900</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-neutral-950 rounded border border-juno-border"></div>
                <div className="text-xs text-juno-muted-fg text-center">950</div>
              </div>
              </div>
            </div>
          </div>

          {/* Light Surface Scale */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Light Surface Scale (Cool Whites)</h3>
            <div className="bg-juno-surface-200 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <div className="space-y-2">
                <div className="h-16 bg-juno-surface-50 rounded border border-juno-border shadow-inner"></div>
                <div className="text-xs text-juno-muted-fg text-center">50</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-surface-100 rounded border border-juno-border shadow-inner"></div>
                <div className="text-xs text-juno-muted-fg text-center">100</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-surface-200 rounded border border-juno-border shadow-inner"></div>
                <div className="text-xs text-juno-muted-fg text-center">200</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-surface-300 rounded border border-juno-border shadow-inner"></div>
                <div className="text-xs text-juno-muted-fg text-center">300</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-surface-400 rounded border border-juno-border shadow-inner"></div>
                <div className="text-xs text-juno-muted-fg text-center">400</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-surface-500 rounded border border-juno-border shadow-inner"></div>
                <div className="text-xs text-juno-muted-fg text-center">500</div>
              </div>
              </div>
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Semantic Colors</h3>
            <div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-juno-success rounded-juno-xl"></div>
                <div className="text-sm text-center">Success</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-warning rounded-juno-xl"></div>
                <div className="text-sm text-center">Warning</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-danger rounded-juno-xl"></div>
                <div className="text-sm text-center">Danger</div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-juno-info rounded-juno-xl"></div>
                <div className="text-sm text-center">Info</div>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-10 mb-24">
          <h2 className="text-2xl font-semibold text-juno-text mb-8">Typography</h2>
          <div className="bg-juno-surface-100 p-8 rounded-juno-xl shadow-juno-card-with-stroke">
            <div className="space-y-6">
            <div style={{ fontSize: 'var(--juno-fs-display)' }} className="text-juno-text font-bold leading-tight">
              Display Text
            </div>
            <div style={{ fontSize: 'var(--juno-fs-hero)' }} className="text-juno-text font-bold leading-tight">
              Hero Text
            </div>
            <div style={{ fontSize: 'var(--juno-fs-heading)' }} className="text-juno-text font-semibold leading-tight">
              Heading Text
            </div>
            <div style={{ fontSize: 'var(--juno-fs-subheading)' }} className="text-juno-text font-medium leading-tight">
              Subheading Text
            </div>
            <div style={{ fontSize: 'var(--juno-fs-body-lg)' }} className="text-juno-text leading-normal">
              Large body text - This is larger body text for important content
            </div>
            <div style={{ fontSize: 'var(--juno-fs-body)' }} className="text-juno-text leading-normal">
              Regular body text - This is the standard body text size for most content
            </div>
            <div style={{ fontSize: 'var(--juno-fs-caption)' }} className="text-juno-muted-fg leading-normal">
              Caption text - This is smaller text for captions and supplementary information
            </div>
            </div>
          </div>
        </section>

        {/* Border Styles */}
        <section className="space-y-10 mb-24">
          <h2 className="text-2xl font-semibold text-juno-text mb-8">Border Styles</h2>
          
          {/* Solid Borders */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Solid Borders</h3>
            <div className="bg-juno-surface-100 p-8 rounded-juno-xl shadow-juno-card-with-stroke">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-juno-xl border border-juno-border">
                  <h4 className="font-medium text-juno-text mb-2">Standard Border</h4>
                  <p className="text-sm text-juno-muted-fg">border-juno-border (16% opacity)</p>
                </div>
                <div className="bg-white p-6 rounded-juno-xl border-2 border-juno-accent">
                  <h4 className="font-medium text-juno-text mb-2">Accent Border</h4>
                  <p className="text-sm text-juno-muted-fg">border-juno-accent (solid color)</p>
                </div>
                <div className="bg-white p-6 rounded-juno-xl border border-juno-neutral-300">
                  <h4 className="font-medium text-juno-text mb-2">Neutral Border</h4>
                  <p className="text-sm text-juno-muted-fg">border-juno-neutral-300</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Borders - Light */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Transparent Borders (Light Backgrounds)</h3>
            <div className="bg-juno-surface-100 p-8 rounded-juno-xl shadow-juno-card-with-stroke">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-juno-xl border border-juno-border-alpha-subtle">
                  <h4 className="font-medium text-juno-text mb-2">Subtle (8%)</h4>
                  <p className="text-sm text-juno-muted-fg">Very subtle separation</p>
                </div>
                <div className="bg-white p-6 rounded-juno-xl border border-juno-border-alpha-soft">
                  <h4 className="font-medium text-juno-text mb-2">Soft (12%)</h4>
                  <p className="text-sm text-juno-muted-fg">Gentle definition</p>
                </div>
                <div className="bg-white p-6 rounded-juno-xl border border-juno-border-alpha-medium">
                  <h4 className="font-medium text-juno-text mb-2">Medium (16%)</h4>
                  <p className="text-sm text-juno-muted-fg">Standard transparency</p>
                </div>
                <div className="bg-white p-6 rounded-juno-xl border border-juno-border-alpha-strong">
                  <h4 className="font-medium text-juno-text mb-2">Strong (24%)</h4>
                  <p className="text-sm text-juno-muted-fg">Clear definition</p>
                </div>
                <div className="bg-white p-6 rounded-juno-xl border border-juno-border-alpha-bold">
                  <h4 className="font-medium text-juno-text mb-2">Bold (32%)</h4>
                  <p className="text-sm text-juno-muted-fg">Strong separation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Borders - Dark */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Transparent Borders (Dark Backgrounds)</h3>
            <div className="bg-juno-neutral-850 p-8 rounded-juno-xl shadow-juno-soft-with-dark-stroke">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-juno-neutral-800 p-6 rounded-juno-xl border border-juno-border-alpha-dark-subtle">
                  <h4 className="font-medium text-juno-surface-50 mb-2">Dark Subtle</h4>
                  <p className="text-sm text-juno-surface-200">8% white opacity</p>
                </div>
                <div className="bg-juno-neutral-800 p-6 rounded-juno-xl border border-juno-border-alpha-dark-soft">
                  <h4 className="font-medium text-juno-surface-50 mb-2">Dark Soft</h4>
                  <p className="text-sm text-juno-surface-200">12% white opacity</p>
                </div>
                <div className="bg-juno-neutral-800 p-6 rounded-juno-xl border border-juno-border-alpha-dark-medium">
                  <h4 className="font-medium text-juno-surface-50 mb-2">Dark Medium</h4>
                  <p className="text-sm text-juno-surface-200">16% white opacity</p>
                </div>
                <div className="bg-juno-neutral-800 p-6 rounded-juno-xl border border-juno-border-alpha-dark-strong">
                  <h4 className="font-medium text-juno-surface-50 mb-2">Dark Strong</h4>
                  <p className="text-sm text-juno-surface-200">24% white opacity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accent Transparent Borders */}
          <div>
            <h3 className="text-lg font-medium text-juno-text mb-6">Transparent Accent Borders</h3>
            <div className="bg-juno-surface-100 p-8 rounded-juno-xl shadow-juno-card-with-stroke">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-juno-xl border border-juno-border-alpha-accent-subtle">
                  <h4 className="font-medium text-juno-text mb-2">Accent Subtle</h4>
                  <p className="text-sm text-juno-muted-fg">20% accent opacity</p>
                </div>
                <div className="bg-white p-6 rounded-juno-xl border border-juno-border-alpha-accent-soft">
                  <h4 className="font-medium text-juno-text mb-2">Accent Soft</h4>
                  <p className="text-sm text-juno-muted-fg">30% accent opacity</p>
                </div>
                <div className="bg-white p-6 rounded-juno-xl border border-juno-border-alpha-accent-medium">
                  <h4 className="font-medium text-juno-text mb-2">Accent Medium</h4>
                  <p className="text-sm text-juno-muted-fg">40% accent opacity</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-juno-surface-200 p-6 rounded-juno-xl">
            <h4 className="font-medium text-juno-text mb-4">🎨 Transparent Border Benefits</h4>
            <ul className="text-sm text-juno-muted-fg space-y-2">
              <li>• <strong>Layered:</strong> Adapts to any background color naturally</li>
              <li>• <strong>Subtle:</strong> Creates depth without harsh lines</li>
              <li>• <strong>Flexible:</strong> Works in both light and dark themes</li>
              <li>• <strong>Professional:</strong> More sophisticated than solid borders</li>
            </ul>
          </div>
        </section>

        {/* Shadow Scale */}
        <section className="space-y-10 mb-24">
          <h2 className="text-2xl font-semibold text-juno-text mb-8">Soft Shadow Scale</h2>
          <div className="bg-juno-surface-100 p-8 rounded-juno-xl shadow-juno-card-with-stroke">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Shadow Examples */}
              <div className="bg-white p-6 rounded-juno-xl shadow-juno-xs">
                <h4 className="font-medium text-juno-text mb-2">Extra Small (xs)</h4>
                <p className="text-sm text-juno-muted-fg">Very subtle shadow for minimal depth</p>
              </div>
              <div className="bg-white p-6 rounded-juno-xl shadow-juno-sm">
                <h4 className="font-medium text-juno-text mb-2">Small (sm)</h4>
                <p className="text-sm text-juno-muted-fg">Card hover states and containers</p>
              </div>
              <div className="bg-white p-6 rounded-juno-xl shadow-juno-md">
                <h4 className="font-medium text-juno-text mb-2">Medium (md)</h4>
                <p className="text-sm text-juno-muted-fg">Standard cards and components</p>
              </div>
              <div className="bg-white p-6 rounded-juno-xl shadow-juno-lg">
                <h4 className="font-medium text-juno-text mb-2">Large (lg)</h4>
                <p className="text-sm text-juno-muted-fg">Floating elements and dropdowns</p>
              </div>
              <div className="bg-white p-6 rounded-juno-xl shadow-juno-xl">
                <h4 className="font-medium text-juno-text mb-2">Extra Large (xl)</h4>
                <p className="text-sm text-juno-muted-fg">Modals and major overlays</p>
              </div>
              <div className="bg-white p-6 rounded-juno-xl shadow-juno-elevated">
                <h4 className="font-medium text-juno-text mb-2">Elevated</h4>
                <p className="text-sm text-juno-muted-fg">Layered shadow for premium feel</p>
              </div>
            </div>
            <div className="mt-8 p-6 bg-juno-surface-200 rounded-juno-xl">
              <h4 className="font-medium text-juno-text mb-4">✨ Shadow + Stroke Combination</h4>
              <p className="text-sm text-juno-muted-fg mb-4">
                All main containers now use combined shadow + stroke effects that mimic transparent outside borders without affecting layout:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-juno-xl shadow-juno-stroke-subtle">
                  <h5 className="font-medium text-sm mb-2">Stroke Shadow - Subtle</h5>
                  <p className="text-xs text-juno-muted-fg">0 0 0 1px rgba(33,39,48,0.08)</p>
                </div>
                <div className="bg-white p-4 rounded-juno-xl shadow-juno-stroke-medium">
                  <h5 className="font-medium text-sm mb-2">Stroke Shadow - Medium</h5>
                  <p className="text-xs text-juno-muted-fg">0 0 0 1px rgba(33,39,48,0.16)</p>
                </div>
                <div className="bg-white p-4 rounded-juno-xl shadow-juno-card-with-stroke">
                  <h5 className="font-medium text-sm mb-2">Combined Effect</h5>
                  <p className="text-xs text-juno-muted-fg">Depth shadow + 1px stroke mimic</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                <div className="bg-juno-neutral-850 text-juno-surface-50 p-4 rounded-juno-xl shadow-juno-soft-with-dark-stroke">
                  <h5 className="font-medium text-sm mb-2">Dark Combined Effect</h5>
                  <p className="text-xs opacity-80">Soft shadow + 1px white stroke for dark backgrounds</p>
                </div>
              </div>
              <h4 className="font-medium text-juno-text mb-4">✨ Soft Shadow Benefits</h4>
              <ul className="text-sm text-juno-muted-fg space-y-2">
                <li>• <strong>Gentle:</strong> Low opacity creates calm, professional feel</li>
                <li>• <strong>Diffuse:</strong> Larger blur radius for softer edges</li>
                <li>• <strong>Consistent:</strong> All shadows use the same color base</li>
                <li>• <strong>Layered:</strong> "Elevated" uses multiple shadows for depth</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="space-y-10 mb-24">
          <h2 className="text-2xl font-semibold text-juno-text mb-8">Expanded Spacing Scale</h2>
          <div className="bg-juno-surface-100 p-8 rounded-juno-xl shadow-juno-card-with-stroke">
            <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40].map((space) => (
              <div key={space} className="flex items-center space-x-6">
                <div 
                  className="bg-juno-accent border border-juno-border" 
                  style={{ 
                    width: `var(--juno-space-${space})`, 
                    height: '1.25rem' 
                  }}
                ></div>
                <span className="text-juno-text text-sm min-w-[100px]">
                  Space {space} ({space === 1 ? '4px' : space === 2 ? '8px' : space === 3 ? '12px' : space === 4 ? '16px' : space === 5 ? '20px' : space === 6 ? '24px' : space === 8 ? '32px' : space === 10 ? '40px' : space === 12 ? '48px' : space === 16 ? '64px' : space === 20 ? '80px' : space === 24 ? '96px' : space === 32 ? '128px' : '160px'})
                </span>
              </div>
            ))}
            </div>
          </div>
        </section>

        {/* Button Variants Showcase */}
        <section className="space-y-10 mb-24">
          <h2 className="text-2xl font-semibold text-juno-text mb-8">Button Variants</h2>
          
          <div className="space-y-12">
            {/* Primary Cyan Buttons */}
            <div>
              <h3 className="text-lg font-medium text-juno-text mb-6">Primary Cyan (Main Brand)</h3>
              <div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
                <div className="flex flex-wrap gap-6">
                <button className="bg-juno-accent text-juno-text rounded-juno-xl shadow-md hover:brightness-105 active:brightness-95 focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0 h-9 px-4 py-2">
                  Juno Primary
                </button>
                <button className="border border-juno-text text-juno-text bg-transparent rounded-juno-xl hover:bg-juno-pill-bg focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0 h-9 px-4 py-2">
                  Juno Secondary
                </button>
                <button className="text-juno-text hover:bg-juno-pill-bg focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0 h-9 px-4 py-2">
                  Juno Ghost
                </button>
                <button className="text-juno-text underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0 h-9 px-4 py-2">
                  Juno Link
                </button>
                </div>
              </div>
            </div>

            {/* Teal Buttons */}
            <div>
              <h3 className="text-lg font-medium text-juno-text mb-6">Teal (Professional, Cooler)</h3>
              <div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
                <div className="flex flex-wrap gap-6">
                <button className="bg-juno-teal-400 text-white rounded-juno-xl shadow-md hover:bg-juno-teal-500 active:bg-juno-teal-600 focus-visible:ring-2 focus-visible:ring-juno-teal-300 focus-visible:ring-offset-0 h-9 px-4 py-2">
                  Teal Primary
                </button>
                <button className="border border-juno-teal-500 text-juno-teal-600 bg-transparent rounded-juno-xl hover:bg-juno-teal-50 focus-visible:ring-2 focus-visible:ring-juno-teal-300 focus-visible:ring-offset-0 h-9 px-4 py-2">
                  Teal Outline
                </button>
                <button className="text-juno-teal-600 hover:bg-juno-teal-50 focus-visible:ring-2 focus-visible:ring-juno-teal-300 focus-visible:ring-offset-0 h-9 px-4 py-2">
                  Teal Ghost
                </button>
                </div>
              </div>
            </div>

            {/* Blue Buttons */}
            <div>
              <h3 className="text-lg font-medium text-juno-text mb-6">Blue (Trustworthy, Warmer)</h3>
              <div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
                <div className="flex flex-wrap gap-6">
                <button className="bg-juno-blue-500 text-white rounded-juno-xl shadow-md hover:bg-juno-blue-600 active:bg-juno-blue-700 focus-visible:ring-2 focus-visible:ring-juno-blue-300 focus-visible:ring-offset-0 h-9 px-4 py-2">
                  Blue Primary
                </button>
                <button className="border border-juno-blue-500 text-juno-blue-600 bg-transparent rounded-juno-xl hover:bg-juno-blue-50 focus-visible:ring-2 focus-visible:ring-juno-blue-300 focus-visible:ring-offset-0 h-9 px-4 py-2">
                  Blue Outline
                </button>
                <button className="text-juno-blue-600 hover:bg-juno-blue-50 focus-visible:ring-2 focus-visible:ring-juno-blue-300 focus-visible:ring-offset-0 h-9 px-4 py-2">
                  Blue Ghost
                </button>
                </div>
              </div>
            </div>

            {/* Mobile Optimized Sizes */}
            <div>
              <h3 className="text-lg font-medium text-juno-text mb-6">Mobile Touch Targets (44px+)</h3>
              <div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
                <div className="flex flex-wrap gap-6">
                <button className="bg-juno-accent text-juno-text rounded-juno-xl shadow-md hover:brightness-105 active:brightness-95 focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0 h-11 px-6 py-3 md:h-9 md:px-4 md:py-2">
                  Mobile Default
                </button>
                <button className="bg-juno-teal-400 text-white rounded-juno-xl shadow-md hover:bg-juno-teal-500 active:bg-juno-teal-600 focus-visible:ring-2 focus-visible:ring-juno-teal-300 focus-visible:ring-offset-0 h-10 px-4 py-2.5 md:h-8 md:px-3">
                  Mobile Small
                </button>
                <button className="bg-juno-blue-500 text-white rounded-juno-xl shadow-md hover:bg-juno-blue-600 active:bg-juno-blue-700 focus-visible:ring-2 focus-visible:ring-juno-blue-300 focus-visible:ring-offset-0 h-12 px-8 py-4 md:h-10 md:px-6">
                  Mobile Large
                </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Components Preview */}
        <section className="space-y-10 mb-24">
          <h2 className="text-2xl font-semibold text-juno-text mb-8">Component Previews</h2>
          
          {/* Card with Juno styling */}
          <div className="bg-juno-surface-100 text-juno-text rounded-juno-xl p-8 shadow-juno-md-with-stroke">
            <h3 className="text-lg font-semibold mb-4">Juno Card Example</h3>
            <p className="text-juno-muted-fg mb-6">
              This card uses neutral surfaces with proper text colors for clean, readable content. Notice the generous spacing between elements for a calm, breathable feel.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-juno-pill-bg text-juno-pill-fg px-4 py-2 rounded-full text-sm">
                Pill Example
              </div>
              <div className="bg-juno-success-bg text-juno-success-fg px-4 py-2 rounded text-sm">
                Success Badge
              </div>
            </div>
          </div>

          {/* Focus Ring Example */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-juno-text">Focus Ring Test</h3>
            <button 
              className="bg-juno-surface-200 text-juno-text px-4 py-2 rounded-juno-xl border border-juno-border focus:outline-none focus:ring-2 focus:ring-juno-focus-ring"
            >
              Focus me to see the ring
            </button>
          </div>

          {/* Neutral Color Combinations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-juno-text">Neutral Color Combinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dark neutral cards */}
              <div className="bg-juno-neutral-850 text-juno-surface-50 p-4 rounded-juno-xl">
                <h4 className="font-semibold mb-2">Dark Theme Example</h4>
                <p className="text-sm opacity-80">Using juno-neutral-850 background with juno-surface-50 text</p>
              </div>
              
              <div className="bg-juno-surface-200 text-juno-neutral-800 p-4 rounded-juno-xl">
                <h4 className="font-semibold mb-2">Light Theme Example</h4>
                <p className="text-sm opacity-80">Using juno-surface-200 background with juno-neutral-800 text</p>
              </div>
              
              <div className="bg-juno-neutral-600 text-juno-surface-100 p-4 rounded-juno-xl">
                <h4 className="font-semibold mb-2">Medium Contrast</h4>
                <p className="text-sm opacity-90">Using juno-neutral-600 with juno-surface-100</p>
              </div>
              
              <div className="bg-juno-surface-400 text-juno-neutral-750 p-4 rounded-juno-xl">
                <h4 className="font-semibold mb-2">Subtle Contrast</h4>
                <p className="text-sm opacity-90">Using juno-surface-400 with juno-neutral-750</p>
              </div>
            </div>
          </div>

          {/* Malaysian Currency Example */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-juno-text">Currency Formatting</h3>
            <div className="space-y-2">
              <div className="text-2xl font-semibold text-juno-text juno-currency-rm">
                1,234.56
              </div>
              <div className="text-sm text-juno-muted-fg">
                Malaysian Ringgit with proper formatting
              </div>
            </div>
          </div>

          {/* ExplainChip Educational Component */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-juno-text">ExplainChip Educational Component</h3>
            
            {/* Size variants */}
            <div className="space-y-4">
              <h4 className="font-medium text-juno-text">Size Variants</h4>
              <div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
                <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-juno-text">Small:</span>
                  <ExplainChip 
                    size="sm"
                    title="Small ExplainChip"
                    explanation="This is a small explain chip, perfect for inline explanations within text or small UI elements."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-juno-text">Default:</span>
                  <ExplainChip 
                    title="Default ExplainChip"
                    explanation="This is the default size explain chip, suitable for most use cases in the interface."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-juno-text">Large:</span>
                  <ExplainChip 
                    size="lg"
                    title="Large ExplainChip"
                    explanation="This is a large explain chip, ideal for prominent educational elements or hero sections."
                  />
                </div>
                </div>
              </div>
            </div>

            {/* Positioning examples */}
            <div className="space-y-4">
              <h4 className="font-medium text-juno-text">Position Variants</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-juno-surface-100 rounded-juno-xl">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-juno-muted-fg">Top</span>
                  <ExplainChip 
                    position="top"
                    title="Top Position"
                    explanation="Tooltip appears above the chip. This is the default position and works well for most scenarios."
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-juno-muted-fg">Bottom</span>
                  <ExplainChip 
                    position="bottom"
                    title="Bottom Position"
                    explanation="Tooltip appears below the chip. Useful when the chip is near the top of the viewport."
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-juno-muted-fg">Left</span>
                  <ExplainChip 
                    position="left"
                    title="Left Position"
                    explanation="Tooltip appears to the left of the chip. Good for chips near the right edge of content."
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-juno-muted-fg">Right</span>
                  <ExplainChip 
                    position="right"
                    title="Right Position"
                    explanation="Tooltip appears to the right of the chip. Ideal for chips near the left edge of content."
                  />
                </div>
              </div>
            </div>

            {/* Contextual examples */}
            <div className="space-y-4">
              <h4 className="font-medium text-juno-text">Contextual Usage Examples</h4>
              
              {/* Financial term explanation */}
              <div className="bg-juno-surface-100 p-6 rounded-juno-xl space-y-4">
                <div className="flex items-center gap-2">
                  <h5 className="text-juno-text font-medium">Emergency Fund</h5>
                  <ExplainChip 
                    title="Emergency Fund"
                    explanation="A dedicated savings account with 3-6 months of living expenses. This fund helps you handle unexpected costs like medical bills, car repairs, or job loss without going into debt."
                    size="sm"
                  />
                </div>
                <p className="text-juno-muted-fg text-sm">
                  Build your emergency fund to RM 15,000 based on your monthly expenses.
                </p>
              </div>

              {/* Financial calculation explanation */}
              <div className="bg-juno-surface-100 p-6 rounded-juno-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-juno-text">RM 2,450</span>
                  <ExplainChip 
                    title="Monthly Investment Recommendation"
                    explanation="Based on your income of RM 8,000 and expenses of RM 5,550, we recommend investing 30% of your surplus (RM 8,000 - RM 5,550 = RM 2,450). This follows the 50/30/20 budgeting rule for financial health."
                  />
                </div>
                <p className="text-juno-muted-fg text-sm">
                  Recommended monthly investment amount
                </p>
              </div>

              {/* Teach mode example */}
              <div className="bg-juno-info-bg p-6 rounded-juno-xl border border-juno-info space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-juno-info-fg font-medium">Teach Mode Active</span>
                  <ExplainChip 
                    teachMode={true}
                    title="Compound Interest"
                    explanation="The interest earned on both the original principal and previously earned interest. Einstein reportedly called it the 'eighth wonder of the world' because it can significantly grow your investments over time."
                  />
                </div>
                <p className="text-juno-info-fg text-sm">
                  When teach mode is enabled, ExplainChips pulse and remain visible to encourage learning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Token Mapping Examples */}
        <section className="space-y-10 mb-24">
          <h2 className="text-2xl font-semibold text-juno-text mb-8">Token Mapping in Action</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Using main brand colors - ACCENT SPARINGLY */}
            <div className="bg-juno-accent text-juno-text p-6 rounded-juno-xl border-2 border-juno-accent-400">
              <h4 className="font-semibold mb-3">⚠️ Accent Usage</h4>
              <p className="text-sm opacity-80 mb-2">Use sparingly - CTAs, highlights only</p>
              <p className="text-xs">Keep under 5% of interface</p>
            </div>
            
            {/* Using neutral surfaces - RECOMMENDED */}
            <div className="bg-juno-surface-100 text-juno-text p-6 rounded-juno-xl border border-juno-border">
              <h4 className="font-semibold mb-3">✅ Neutral Surface</h4>
              <p className="text-sm opacity-80 mb-2">bg-juno-surface-100 + text-juno-text</p>
              <p className="text-xs">Use for cards, backgrounds, content areas</p>
            </div>
            
            {/* Using darker neutral */}
            <div className="bg-juno-surface-200 text-juno-text p-6 rounded-juno-xl border border-juno-border">
              <h4 className="font-semibold mb-3">Neutral Variant</h4>
              <p className="text-sm opacity-80 mb-2">bg-juno-surface-200 + text-juno-text</p>
              <p className="text-xs">Slightly darker surface</p>
            </div>
            
            {/* Surface with brand text */}
            <div className="bg-juno-surface-100 text-juno-text p-6 rounded-juno-xl border border-juno-border">
              <h4 className="font-semibold mb-3">Clean Surface</h4>
              <p className="text-sm opacity-80 mb-2">bg-juno-surface-100 + text-juno-text</p>
              <p className="text-xs">Perfect for cards</p>
            </div>
            
            {/* Gradient effect using surfaces */}
            <div className="bg-gradient-to-r from-juno-surface-100 to-juno-surface-300 text-juno-text p-6 rounded-juno-xl border border-juno-border">
              <h4 className="font-semibold mb-3">Surface Gradient</h4>
              <p className="text-sm opacity-80 mb-2">from-juno-surface-100 to-juno-surface-300</p>
              <p className="text-xs">Subtle gradients for depth</p>
            </div>
            
            {/* Hover state example */}
            <div className="bg-juno-surface-100 hover:bg-juno-surface-200 text-juno-text p-6 rounded-juno-xl transition-colors cursor-pointer border border-juno-border">
              <h4 className="font-semibold mb-3">Hover Me!</h4>
              <p className="text-sm opacity-80 mb-2">hover:bg-juno-surface-200</p>
              <p className="text-xs">Subtle hover effect</p>
            </div>
          </div>
        </section>

        {/* Border Styles Showcase */}
        <section className="space-y-10 mb-24">
          <div className="bg-juno-surface-100 p-8 rounded-juno-xl shadow-juno-card-with-stroke">
            <h2 className="text-2xl font-semibold text-juno-text mb-8">Border Styles</h2>
            <div className="space-y-8">
              
              {/* Solid Borders */}
              <div>
                <h3 className="text-lg font-semibold text-juno-text mb-4">Solid Borders</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border">
                    <h4 className="font-medium text-juno-text mb-2">Standard</h4>
                    <p className="text-sm text-juno-muted-fg">border-juno-border</p>
                  </div>
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-neutral-300">
                    <h4 className="font-medium text-juno-text mb-2">Light</h4>
                    <p className="text-sm text-juno-muted-fg">border-juno-neutral-300</p>
                  </div>
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-neutral-500">
                    <h4 className="font-medium text-juno-text mb-2">Medium</h4>
                    <p className="text-sm text-juno-muted-fg">border-juno-neutral-500</p>
                  </div>
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-neutral-750">
                    <h4 className="font-medium text-juno-text mb-2">Strong</h4>
                    <p className="text-sm text-juno-muted-fg">border-juno-neutral-750</p>
                  </div>
                </div>
              </div>

              {/* Transparent Borders - Light Backgrounds */}
              <div>
                <h3 className="text-lg font-semibold text-juno-text mb-4">Transparent Borders (Light Backgrounds)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-subtle">
                    <h4 className="font-medium text-juno-text mb-2">Subtle</h4>
                    <p className="text-sm text-juno-muted-fg">8% opacity</p>
                    <p className="text-xs text-juno-muted-fg">Very gentle separation</p>
                  </div>
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-soft">
                    <h4 className="font-medium text-juno-text mb-2">Soft</h4>
                    <p className="text-sm text-juno-muted-fg">12% opacity</p>
                    <p className="text-xs text-juno-muted-fg">Soft definition</p>
                  </div>
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-medium">
                    <h4 className="font-medium text-juno-text mb-2">Medium</h4>
                    <p className="text-sm text-juno-muted-fg">16% opacity</p>
                    <p className="text-xs text-juno-muted-fg">Standard separation</p>
                  </div>
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-strong">
                    <h4 className="font-medium text-juno-text mb-2">Strong</h4>
                    <p className="text-sm text-juno-muted-fg">24% opacity</p>
                    <p className="text-xs text-juno-muted-fg">Strong definition</p>
                  </div>
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-bold">
                    <h4 className="font-medium text-juno-text mb-2">Bold</h4>
                    <p className="text-sm text-juno-muted-fg">32% opacity</p>
                    <p className="text-xs text-juno-muted-fg">Bold separation</p>
                  </div>
                </div>
              </div>

              {/* Transparent Borders - Dark Backgrounds */}
              <div>
                <h3 className="text-lg font-semibold text-juno-text mb-4">Transparent Borders (Dark Backgrounds)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-juno-neutral-850 text-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-dark-subtle">
                    <h4 className="font-medium mb-2">Dark Subtle</h4>
                    <p className="text-sm opacity-80">8% white opacity</p>
                    <p className="text-xs opacity-60">Very gentle on dark</p>
                  </div>
                  <div className="bg-juno-neutral-850 text-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-dark-soft">
                    <h4 className="font-medium mb-2">Dark Soft</h4>
                    <p className="text-sm opacity-80">12% white opacity</p>
                    <p className="text-xs opacity-60">Soft on dark</p>
                  </div>
                  <div className="bg-juno-neutral-850 text-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-dark-medium">
                    <h4 className="font-medium mb-2">Dark Medium</h4>
                    <p className="text-sm opacity-80">16% white opacity</p>
                    <p className="text-xs opacity-60">Standard on dark</p>
                  </div>
                  <div className="bg-juno-neutral-850 text-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-dark-strong">
                    <h4 className="font-medium mb-2">Dark Strong</h4>
                    <p className="text-sm opacity-80">24% white opacity</p>
                    <p className="text-xs opacity-60">Strong on dark</p>
                  </div>
                </div>
              </div>

              {/* Accent Transparent Borders */}
              <div>
                <h3 className="text-lg font-semibold text-juno-text mb-4">Accent Transparent Borders</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-accent-subtle">
                    <h4 className="font-medium text-juno-text mb-2">Accent Subtle</h4>
                    <p className="text-sm text-juno-muted-fg">20% accent opacity</p>
                    <p className="text-xs text-juno-muted-fg">Subtle brand presence</p>
                  </div>
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-accent-soft">
                    <h4 className="font-medium text-juno-text mb-2">Accent Soft</h4>
                    <p className="text-sm text-juno-muted-fg">30% accent opacity</p>
                    <p className="text-xs text-juno-muted-fg">Soft brand presence</p>
                  </div>
                  <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-accent-medium">
                    <h4 className="font-medium text-juno-text mb-2">Accent Medium</h4>
                    <p className="text-sm text-juno-muted-fg">40% accent opacity</p>
                    <p className="text-xs text-juno-muted-fg">Medium brand presence</p>
                  </div>
                </div>
              </div>

              {/* Usage Examples */}
              <div>
                <h3 className="text-lg font-semibold text-juno-text mb-4">Usage Examples</h3>
                <div className="space-y-4">
                  
                  {/* Card with layered borders */}
                  <div className="bg-juno-surface-50 p-6 rounded-juno-xl border border-juno-border-alpha-medium">
                    <div className="bg-juno-surface-100 p-4 rounded-juno-xl border border-juno-border-alpha-soft">
                      <h4 className="font-semibold text-juno-text mb-2">Layered Border Card</h4>
                      <p className="text-sm text-juno-muted-fg mb-4">
                        Using transparent borders allows for subtle layering effects without harsh lines.
                      </p>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 bg-juno-accent text-juno-text rounded-juno-xl border border-juno-border-alpha-accent-medium">
                          Primary Action
                        </button>
                        <button className="px-4 py-2 bg-juno-surface-200 text-juno-text rounded-juno-xl border border-juno-border-alpha-soft">
                          Secondary Action
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form with transparent borders */}
                  <div className="bg-juno-surface-100 p-6 rounded-juno-xl border border-juno-border-alpha-soft">
                    <h4 className="font-semibold text-juno-text mb-4">Form with Transparent Borders</h4>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Name" 
                        className="w-full px-3 py-2 bg-juno-surface-50 border border-juno-border-alpha-medium rounded-juno-xl focus:border-juno-border-alpha-accent-medium focus:outline-none"
                      />
                      <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full px-3 py-2 bg-juno-surface-50 border border-juno-border-alpha-medium rounded-juno-xl focus:border-juno-border-alpha-accent-medium focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CSS Button Classes */}
        <section className="space-y-10 mb-24">
          <h2 className="text-2xl font-semibold text-juno-text mb-8">CSS Button Classes</h2>
          
          <div className="bg-juno-surface-100 p-8 rounded-juno-xl shadow-juno-card-with-stroke">
            <h3 className="text-lg font-medium text-juno-text mb-6">Button Variants Using Design Tokens</h3>
            <div className="space-y-8">
              
              {/* Primary Button */}
              <div>
                <h4 className="text-base font-medium text-juno-text mb-4">Primary Button (.btn--primary)</h4>
                <div className="flex flex-wrap gap-4 items-center mb-4">
                  <button className="btn--primary">
                    <span className="btn__lead">Save Changes</span>
                  </button>
                  <button className="btn--primary">
                    <span className="btn__lead">Create</span>
                    <span className="btn__sub">New</span>
                  </button>
                  <button className="btn--primary" disabled>
                    <span className="btn__lead">Disabled</span>
                  </button>
                </div>
                <div className="text-sm text-juno-muted-fg bg-juno-surface-200 p-4 rounded-juno-lg">
                  <p><strong>Design Tokens Used:</strong></p>
                  <ul className="mt-2 space-y-1">
                    <li>• Height: <code>--juno-btn-height-lg</code> (40px)</li>
                    <li>• Radius: <code>--juno-radius-lg</code> (16px)</li>
                    <li>• Colors: <code>--juno-accent</code> bg + <code>--juno-accent-700</code> border</li>
                    <li>• Shadows: <code>--juno-shadow-button-primary</code> variants</li>
                    <li>• Timing: <code>--juno-duration-*</code> + <code>--juno-ease-*</code></li>
                  </ul>
                </div>
              </div>

              {/* Secondary Button */}
              <div>
                <h4 className="text-base font-medium text-juno-text mb-4">Secondary Button (.btn--secondary)</h4>
                <div className="flex flex-wrap gap-4 items-center mb-4">
                  <button className="btn--secondary">
                    Cancel
                  </button>
                  <button className="btn--secondary">
                    <span>Settings</span>
                    <span className="icon">⚙️</span>
                  </button>
                  <button className="btn--secondary btn--icon-only">
                    <span className="icon">×</span>
                  </button>
                  <button className="btn--secondary" disabled>
                    Disabled
                  </button>
                </div>
                <div className="text-sm text-juno-muted-fg bg-juno-surface-200 p-4 rounded-juno-lg">
                  <p><strong>Design Tokens Used:</strong></p>
                  <ul className="mt-2 space-y-1">
                    <li>• Height: <code>--juno-btn-height</code> (36px)</li>
                    <li>• Radius: <code>--juno-radius-md</code> (12px)</li>
                    <li>• Colors: <code>--juno-surface-50</code> + <code>--juno-text</code></li>
                    <li>• Shadows: <code>--juno-shadow-button-secondary</code> variants</li>
                    <li>• Advanced layered shadows with inset effects</li>
                  </ul>
                </div>
              </div>

              {/* Usage Example */}
              <div>
                <h4 className="text-base font-medium text-juno-text mb-4">Usage Example</h4>
                <div className="bg-juno-surface-200 p-6 rounded-juno-lg">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div>
                      <h5 className="font-medium text-juno-text mb-2">Transaction Form</h5>
                      <p className="text-sm text-juno-muted-fg">Example button combination</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="btn--secondary">Cancel</button>
                      <button className="btn--primary">
                        <span className="btn__lead">Save</span>
                        <span className="btn__sub">Transaction</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Test Message */}
        <div className="mt-12 p-6 bg-juno-info-bg border border-juno-info text-juno-info-fg rounded-juno-xl">
          <h3 className="font-semibold mb-2">✅ Token-Mapped Design System Complete!</h3>
          <p className="mb-3">
            The Juno design tokens are now mapped to scale tokens, giving you maximum flexibility:
          </p>
          <ul className="text-sm space-y-1">
            <li>• <strong>juno-accent</strong> → <strong>juno-accent-300</strong> (#85D6FF)</li>
            <li>• <strong>juno-text</strong> → <strong>juno-neutral-750</strong> (#212730)</li>
            <li>• Full access to 47 coordinated colors across 3 accent families + neutrals</li>
            <li>• Easy to create variants, hover states, and gradients</li>
          </ul>
        </div>
      </div>
    </div>
  )
}