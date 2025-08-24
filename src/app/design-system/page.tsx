/**
 * Design System Preview Page
 * 
 * Restructured with tabbed navigation for better organization
 * Remove this file before production deployment
 */

'use client'

import { useState } from 'react'
import { ExplainChip } from '@/components/ui/explain-chip'

type TabKey = 'overview' | 'colors' | 'components' | 'dataviz' | 'tokens'

interface Tab {
  key: TabKey
  label: string
  icon: string
}

const tabs: Tab[] = [
  { key: 'overview', label: 'Overview', icon: '🏠' },
  { key: 'colors', label: 'Color Strategy', icon: '🎨' },
  { key: 'components', label: 'Components', icon: '🧩' },
  { key: 'dataviz', label: 'Data Visualization', icon: '📊' },
  { key: 'tokens', label: 'Design Tokens', icon: '🎭' }
]

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  return (
    <div className="min-h-screen bg-juno-surface-50">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white border-b border-juno-border p-8">
          <h1 className="text-4xl font-bold text-juno-text mb-4">
            Juno Design System
          </h1>
          <p className="text-juno-muted-fg text-lg">
            Professional design system with industry-leading color strategy and accessibility
          </p>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white border-b border-juno-border px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-juno-accent text-juno-accent'
                    : 'border-transparent text-juno-muted-fg hover:text-juno-text hover:border-juno-border-alpha-medium'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'colors' && <ColorStrategyTab />}
          {activeTab === 'components' && <ComponentsTab />}
          {activeTab === 'dataviz' && <DataVisualizationTab />}
          {activeTab === 'tokens' && <DesignTokensTab />}
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab() {
  return (
    <div className="space-y-12">
      <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
        <h2 className="text-2xl font-semibold text-juno-text mb-6">Welcome to Juno Design System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-juno-text">Philosophy</h3>
            <p className="text-juno-muted-fg">
              Our design system is built on the principle that <strong>restraint creates professionalism</strong>. 
              Inspired by industry leaders like Cluely, Clerk, and Shopify, we prioritize clarity, accessibility, 
              and user-focused design.
            </p>
            <ul className="text-sm text-juno-muted-fg space-y-2">
              <li>• Professional color usage with 90-10 rule</li>
              <li>• Accessible design patterns for all users</li>
              <li>• Data visualization best practices</li>
              <li>• Consistent token-based design system</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-juno-text">Industry Research</h3>
            <p className="text-juno-muted-fg text-sm">
              Our approach is based on comprehensive analysis of successful companies:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-juno-surface-100 rounded-juno-lg">
                <div className="w-8 h-8 bg-juno-neutral-600 rounded-full flex items-center justify-center text-white text-xs font-bold">C</div>
                <div>
                  <div className="font-medium text-juno-text text-sm">Cluely.com</div>
                  <div className="text-xs text-juno-muted-fg">90% neutral colors, 10% accent - clean interfaces</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-juno-surface-100 rounded-juno-lg">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">C</div>
                <div>
                  <div className="font-medium text-juno-text text-sm">Clerk.com</div>
                  <div className="text-xs text-juno-muted-fg">Monochrome foundation with minimal brand accent</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-juno-surface-100 rounded-juno-lg">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>
                <div>
                  <div className="font-medium text-juno-text text-sm">Shopify Polaris</div>
                  <div className="text-xs text-juno-muted-fg">Data visualization with strategic color usage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-juno-xl shadow-juno-card-with-stroke">
          <h3 className="font-semibold text-juno-text mb-4 flex items-center gap-2">
            <span>🎯</span> Focused Design
          </h3>
          <p className="text-sm text-juno-muted-fg">
            Each component serves a specific purpose. We avoid unnecessary complexity and focus on user needs.
          </p>
        </div>
        <div className="bg-white p-6 rounded-juno-xl shadow-juno-card-with-stroke">
          <h3 className="font-semibold text-juno-text mb-4 flex items-center gap-2">
            <span>♿</span> Accessibility First
          </h3>
          <p className="text-sm text-juno-muted-fg">
            All components meet WCAG 2.1 AA standards with proper contrast ratios and keyboard navigation.
          </p>
        </div>
        <div className="bg-white p-6 rounded-juno-xl shadow-juno-card-with-stroke">
          <h3 className="font-semibold text-juno-text mb-4 flex items-center gap-2">
            <span>🔄</span> Consistent Tokens
          </h3>
          <p className="text-sm text-juno-muted-fg">
            Design tokens ensure consistency across all components and make system-wide changes effortless.
          </p>
        </div>
      </div>
    </div>
  )
}

// Color Strategy Tab Component
function ColorStrategyTab() {
  return (
    <div className="space-y-12">
      {/* Color Usage Philosophy */}
      <div className="bg-juno-info-bg border border-juno-info text-juno-info-fg p-8 rounded-juno-xl">
        <h2 className="text-2xl font-semibold mb-4">🎨 Professional Color Strategy</h2>
        <p className="mb-6">
          Our color strategy follows patterns from successful companies like Cluely.com and Clerk.com, 
          who demonstrate that <strong>restraint creates professionalism</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium">The 90-10 Rule (Cluely approach):</h4>
            <ul className="text-sm space-y-1 opacity-90">
              <li>• 90% neutral colors (whites, grays)</li>
              <li>• 10% accent colors (CTAs, highlights only)</li>
              <li>• Creates calm, readable interfaces</li>
              <li>• Reduces cognitive load</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">The Monochrome Foundation (Clerk approach):</h4>
            <ul className="text-sm space-y-1 opacity-90">
              <li>• Start with black/white/gray base</li>
              <li>• Add single brand accent sparingly</li>
              <li>• Maximize contrast ratios</li>
              <li>• Build trust through simplicity</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Color Distribution */}
      <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
        <h3 className="text-xl font-semibold text-juno-text mb-6">Recommended Color Distribution</h3>
        
        {/* Visual distribution */}
        <div className="flex h-16 rounded-juno-xl overflow-hidden border border-juno-border mb-6">
          <div className="bg-juno-surface-50 flex-1 flex items-center justify-center text-sm font-medium text-juno-text">
            Neutral Backgrounds 60%
          </div>
          <div className="bg-juno-surface-200 flex-[0.25] flex items-center justify-center text-xs font-medium text-juno-text">
            Supporting 25%
          </div>
          <div className="bg-juno-neutral-600 flex-[0.1] flex items-center justify-center text-xs font-medium text-white">
            Text 10%
          </div>
          <div className="bg-juno-accent flex-[0.05] flex items-center justify-center text-xs font-medium text-juno-text">
            Accent 5%
          </div>
        </div>

        {/* Usage guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border">
            <div className="w-4 h-4 bg-juno-surface-50 rounded mb-2 border border-juno-border"></div>
            <h4 className="font-medium text-juno-text text-sm mb-2">Neutral Backgrounds</h4>
            <p className="text-xs text-juno-muted-fg">Main content areas, cards, modals, page backgrounds</p>
          </div>
          <div className="bg-juno-surface-200 p-4 rounded-juno-xl border border-juno-border">
            <div className="w-4 h-4 bg-juno-surface-200 rounded mb-2"></div>
            <h4 className="font-medium text-juno-text text-sm mb-2">Supporting Colors</h4>
            <p className="text-xs text-juno-muted-fg">Secondary backgrounds, dividers, disabled states</p>
          </div>
          <div className="bg-juno-neutral-600 text-white p-4 rounded-juno-xl">
            <div className="w-4 h-4 bg-juno-neutral-600 rounded mb-2"></div>
            <h4 className="font-medium text-sm mb-2">Text Colors</h4>
            <p className="text-xs opacity-80">Primary text, headings, readable content</p>
          </div>
          <div className="bg-juno-accent text-juno-text p-4 rounded-juno-xl">
            <div className="w-4 h-4 bg-juno-accent rounded mb-2"></div>
            <h4 className="font-medium text-sm mb-2">Accent Colors</h4>
            <p className="text-xs opacity-80">CTAs, links, important highlights only</p>
          </div>
        </div>
      </div>

      {/* Do's and Don'ts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Do's */}
        <div className="bg-juno-success-bg border border-juno-success text-juno-success-fg p-6 rounded-juno-xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-green-600">✓</span> Professional Color Usage
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Use accent colors for CTAs and critical actions only</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Rely heavily on neutral grays and whites</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Maintain high contrast ratios (4.5:1 minimum)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Use semantic colors (success, warning) functionally</span>
            </li>
          </ul>
        </div>

        {/* Don'ts */}
        <div className="bg-juno-danger-bg border border-juno-danger text-juno-danger-fg p-6 rounded-juno-xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-red-600">✗</span> Avoid These Patterns
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Don&apos;t use accent colors for large background areas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Avoid rainbow interfaces with many colors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Don&apos;t rely on color alone for important information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Avoid low contrast color combinations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Components Tab Component
function ComponentsTab() {
  return (
    <div className="space-y-12">
      {/* Professional Interface Patterns */}
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-juno-text">Professional Interface Patterns</h2>
        
        {/* Dashboard Pattern */}
        <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
          <h3 className="text-lg font-semibold text-juno-text mb-6">Clean Dashboard Pattern (Cluely-inspired)</h3>
          <div className="bg-juno-surface-50 p-6 rounded-juno-xl border border-juno-border-alpha-subtle">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-juno-border-alpha-soft">
              <div>
                <h4 className="text-lg font-semibold text-juno-text">Financial Dashboard</h4>
                <p className="text-juno-muted-fg text-sm mt-1">Track your spending and savings</p>
              </div>
              <button className="btn--primary">
                <span className="btn__lead">Add Transaction</span>
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Stat Card 1 */}
              <div className="bg-white p-4 rounded-juno-xl border border-juno-border-alpha-soft">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-juno-surface-200 rounded-full flex items-center justify-center">
                    <span className="text-xs">💰</span>
                  </div>
                  <div>
                    <p className="text-xs text-juno-muted-fg">Total Balance</p>
                    <p className="text-lg font-semibold text-juno-text">RM 12,450</p>
                  </div>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white p-4 rounded-juno-xl border border-juno-border-alpha-soft">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-juno-surface-200 rounded-full flex items-center justify-center">
                    <span className="text-xs">📊</span>
                  </div>
                  <div>
                    <p className="text-xs text-juno-muted-fg">This Month</p>
                    <p className="text-lg font-semibold text-juno-text">RM 3,240</p>
                  </div>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white p-4 rounded-juno-xl border border-juno-border-alpha-soft">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-juno-surface-200 rounded-full flex items-center justify-center">
                    <span className="text-xs">🎯</span>
                  </div>
                  <div>
                    <p className="text-xs text-juno-muted-fg">Budget Left</p>
                    <p className="text-lg font-semibold text-juno-text">RM 760</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Button Examples */}
        <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
          <h3 className="text-lg font-semibold text-juno-text mb-6">Button Components</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-juno-text mb-4">Primary Buttons</h4>
              <div className="flex flex-wrap gap-4 items-center">
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
            </div>

            <div>
              <h4 className="font-medium text-juno-text mb-4">Secondary Buttons</h4>
              <div className="flex flex-wrap gap-4 items-center">
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
              </div>
            </div>
          </div>
        </div>

        {/* ExplainChip Component */}
        <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
          <h3 className="text-lg font-semibold text-juno-text mb-6">Educational Components</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-juno-text">Emergency Fund</span>
              <ExplainChip 
                title="Emergency Fund"
                explanation="A dedicated savings account with 3-6 months of living expenses. This fund helps you handle unexpected costs like medical bills, car repairs, or job loss without going into debt."
                size="sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-semibold text-juno-text">RM 2,450</span>
              <ExplainChip 
                title="Monthly Investment Recommendation"
                explanation="Based on your income of RM 8,000 and expenses of RM 5,550, we recommend investing 30% of your surplus (RM 8,000 - RM 5,550 = RM 2,450). This follows the 50/30/20 budgeting rule for financial health."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Data Visualization Tab Component
function DataVisualizationTab() {
  return (
    <div className="space-y-12">
      {/* Core Philosophy */}
      <div className="bg-juno-info-bg border border-juno-info text-juno-info-fg p-8 rounded-juno-xl">
        <h2 className="text-2xl font-semibold mb-4">📊 Shopify&apos;s Data Visualization Philosophy</h2>
        <p className="mb-4">
          <strong>&quot;Visualizations surface patterns in data, and provide immediate answers to a single, specific question.&quot;</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium">Key Principles:</h4>
            <ul className="text-sm space-y-1 opacity-90">
              <li>• Each visualization answers ONE specific question</li>
              <li>• Consistent styles maintain data integrity</li>
              <li>• Color has very specific meaning in data viz</li>
              <li>• Always test with real data at scale</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Five Core Traits:</h4>
            <ul className="text-sm space-y-1 opacity-90">
              <li>• <strong>Accuracy:</strong> Faithful to original dataset</li>
              <li>• <strong>Intuitiveness:</strong> Easy interpretation</li>
              <li>• <strong>Engagement:</strong> Appropriate attention level</li>
              <li>• <strong>Focus:</strong> Directed attention</li>
              <li>• <strong>Data Granularity:</strong> Right level of detail</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Color Strategy for Data Viz */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-juno-text">Strategic Color Usage in Data Visualizations</h3>
        
        {/* Single Data Series */}
        <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
          <h4 className="font-semibold text-juno-text mb-6">Single Data Series</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="font-medium text-juno-text">✅ Correct Approach</h5>
              <div className="bg-juno-surface-50 p-6 rounded-juno-xl border border-juno-border-alpha-soft">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-juno-muted-fg">Jan</span>
                    <div className="flex-1 mx-4 bg-juno-surface-100 h-4 rounded-full overflow-hidden">
                      <div className="h-full bg-juno-accent w-3/4 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-juno-text">75%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-juno-muted-fg">Feb</span>
                    <div className="flex-1 mx-4 bg-juno-surface-100 h-4 rounded-full overflow-hidden">
                      <div className="h-full bg-juno-accent w-1/2 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-juno-text">50%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-juno-muted-fg">Mar</span>
                    <div className="flex-1 mx-4 bg-juno-surface-100 h-4 rounded-full overflow-hidden">
                      <div className="h-full bg-juno-accent w-5/6 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-juno-text">85%</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-juno-muted-fg">
                <strong>Use:</strong> One consistent color (Juno accent cyan) for all data points in single series.
              </p>
            </div>

            <div className="space-y-4">
              <h5 className="font-medium text-juno-danger-fg">❌ Avoid This</h5>
              <div className="bg-juno-surface-50 p-6 rounded-juno-xl border border-juno-border-alpha-soft">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-juno-muted-fg">Jan</span>
                    <div className="flex-1 mx-4 bg-juno-surface-100 h-4 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-juno-text">75%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-juno-muted-fg">Feb</span>
                    <div className="flex-1 mx-4 bg-juno-surface-100 h-4 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-1/2 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-juno-text">50%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-juno-muted-fg">Mar</span>
                    <div className="flex-1 mx-4 bg-juno-surface-100 h-4 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-5/6 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-juno-text">85%</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-juno-muted-fg">
                <strong>Never:</strong> Use different colors for each data point in same series - creates confusion.
              </p>
            </div>
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
          <h4 className="font-semibold text-juno-text mb-6">Semantic Colors (Biased Data)</h4>
          <div className="space-y-6">
            <p className="text-juno-muted-fg">
              Use semantic colors when data has inherent positive or negative meaning.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-soft text-center">
                <div className="text-2xl font-bold text-juno-success-fg mb-2">+12.5%</div>
                <div className="text-sm text-juno-muted-fg mb-2">Revenue Growth</div>
                <div className="flex items-center justify-center gap-1 text-juno-success-fg">
                  <span className="text-xs">↗</span>
                  <span className="text-xs">Positive trend</span>
                </div>
              </div>

              <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-soft text-center">
                <div className="text-2xl font-bold text-juno-danger-fg mb-2">-4.2%</div>
                <div className="text-sm text-juno-muted-fg mb-2">Customer Churn</div>
                <div className="flex items-center justify-center gap-1 text-juno-danger-fg">
                  <span className="text-xs">↘</span>
                  <span className="text-xs">Negative trend</span>
                </div>
              </div>

              <div className="bg-juno-surface-50 p-4 rounded-juno-xl border border-juno-border-alpha-soft text-center">
                <div className="text-2xl font-bold text-juno-text mb-2">2.1%</div>
                <div className="text-sm text-juno-muted-fg mb-2">Market Share</div>
                <div className="flex items-center justify-center gap-1 text-juno-muted-fg">
                  <span className="text-xs">→</span>
                  <span className="text-xs">Neutral data</span>
                </div>
              </div>
            </div>

            <div className="bg-juno-info-bg border border-juno-info p-4 rounded-juno-lg">
              <p className="text-sm text-juno-info-fg">
                <strong>Rule:</strong> Only use green/red when the data has inherent positive/negative meaning. 
                For neutral comparisons, stick to brand colors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-juno-info-bg border border-juno-info text-juno-info-fg p-8 rounded-juno-xl">
        <h3 className="font-semibold mb-4">📈 Juno Data Visualization Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium">Color Hierarchy:</h4>
            <ul className="text-sm space-y-1 opacity-90">
              <li>• <strong>Primary:</strong> Juno accent cyan for main data</li>
              <li>• <strong>Secondary:</strong> Neutral gray for comparisons</li>
              <li>• <strong>Semantic:</strong> Green/red only when meaningful</li>
              <li>• <strong>Multi-series:</strong> Maximum 4 contrasting colors</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Key Principles:</h4>
            <ul className="text-sm space-y-1 opacity-90">
              <li>• One visualization = one question answered</li>
              <li>• Consistent color usage within data series</li>
              <li>• Always provide accessible alternatives</li>
              <li>• Test with real data at various scales</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Design Tokens Tab Component
function DesignTokensTab() {
  return (
    <div className="space-y-12">
      {/* Color Palette */}
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-juno-text">Color Palette</h2>
        
        {/* Brand Colors */}
        <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
          <h3 className="text-lg font-medium text-juno-text mb-6">Brand Colors (Token Mapped)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="h-16 bg-juno-accent rounded-juno-xl border border-juno-border"></div>
              <div className="text-sm">
                <div className="font-medium text-juno-text">Juno Accent</div>
                <div className="text-juno-muted-fg">Maps to: <code className="bg-juno-pill-bg px-1 rounded">juno-accent-900</code></div>
                <div className="text-juno-muted-fg">Color: #1D3F50</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-16 bg-juno-text rounded-juno-xl border border-juno-border"></div>
              <div className="text-sm">
                <div className="font-medium text-juno-text">Juno Text</div>
                <div className="text-juno-muted-fg">Maps to: <code className="bg-juno-pill-bg px-1 rounded">juno-neutral-750</code></div>
                <div className="text-juno-muted-fg">Color: #212730</div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Scales */}
        <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
          <h3 className="text-lg font-medium text-juno-text mb-6">Primary Accent Scale (Cyan)</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="space-y-2">
                <div 
                  className="h-12 rounded border border-juno-border"
                  style={{ backgroundColor: `var(--juno-accent-${shade})` }}
                ></div>
                <div className="text-xs text-juno-muted-fg text-center">{shade}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Semantic Color Scales */}
        <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
          <h3 className="text-lg font-medium text-juno-text mb-6">Semantic Color Scales</h3>
          
          {/* Success Scale */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-juno-text mb-4 flex items-center gap-2">
              Success Scale 
              <span className="text-sm font-normal text-juno-muted-fg">#44C12E</span>
            </h4>
            <div className="grid grid-cols-5 md:grid-cols-9 gap-2">
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="space-y-2">
                  <div 
                    className="h-12 rounded border border-juno-border"
                    style={{ backgroundColor: `var(--juno-success-${shade})` }}
                  ></div>
                  <div className="text-xs text-juno-muted-fg text-center">{shade}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Scale */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-juno-text mb-4 flex items-center gap-2">
              Warning Scale 
              <span className="text-sm font-normal text-juno-muted-fg">#FFB121</span>
            </h4>
            <div className="grid grid-cols-5 md:grid-cols-9 gap-2">
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="space-y-2">
                  <div 
                    className="h-12 rounded border border-juno-border"
                    style={{ backgroundColor: `var(--juno-warning-${shade})` }}
                  ></div>
                  <div className="text-xs text-juno-muted-fg text-center">{shade}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Scale */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-juno-text mb-4 flex items-center gap-2">
              Danger Scale 
              <span className="text-sm font-normal text-juno-muted-fg">#FF4769</span>
            </h4>
            <div className="grid grid-cols-5 md:grid-cols-9 gap-2">
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="space-y-2">
                  <div 
                    className="h-12 rounded border border-juno-border"
                    style={{ backgroundColor: `var(--juno-danger-${shade})` }}
                  ></div>
                  <div className="text-xs text-juno-muted-fg text-center">{shade}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Scale */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-juno-text mb-4 flex items-center gap-2">
              Info Scale 
              <span className="text-sm font-normal text-juno-muted-fg">#3083FF</span>
            </h4>
            <div className="grid grid-cols-5 md:grid-cols-9 gap-2">
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="space-y-2">
                  <div 
                    className="h-12 rounded border border-juno-border"
                    style={{ backgroundColor: `var(--juno-info-${shade})` }}
                  ></div>
                  <div className="text-xs text-juno-muted-fg text-center">{shade}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Shopify-Inspired Semantic Token System */}
          <div className="mt-8 p-6 bg-juno-surface-200 rounded-juno-lg">
            <h5 className="text-sm font-medium text-juno-text mb-4">🎯 Shopify-Inspired Semantic Tokens</h5>
            <p className="text-xs text-juno-muted-fg mb-6">
              Purpose-driven naming following Polaris patterns. Use these semantic tokens for consistent, scalable design.
            </p>
            
            {/* Surface Examples */}
            <div className="mb-6">
              <h6 className="text-xs font-medium text-juno-text mb-3">Surface System</h6>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--juno-color-bg-surface-success)', border: '1px solid var(--juno-color-border-success)' }}>
                  <div className="text-xs font-medium" style={{ color: 'var(--juno-color-text-success)' }}>Success Surface</div>
                  <div className="text-xs mt-1 font-mono" style={{ color: 'var(--juno-color-text-secondary)' }}>--juno-color-bg-surface-success</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--juno-color-bg-surface-warning)', border: '1px solid var(--juno-color-border-warning)' }}>
                  <div className="text-xs font-medium" style={{ color: 'var(--juno-color-text-warning)' }}>Warning Surface</div>
                  <div className="text-xs mt-1 font-mono" style={{ color: 'var(--juno-color-text-secondary)' }}>--juno-color-bg-surface-warning</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--juno-color-bg-surface-critical)', border: '1px solid var(--juno-color-border-critical)' }}>
                  <div className="text-xs font-medium" style={{ color: 'var(--juno-color-text-critical)' }}>Critical Surface</div>
                  <div className="text-xs mt-1 font-mono" style={{ color: 'var(--juno-color-text-secondary)' }}>--juno-color-bg-surface-critical</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--juno-color-bg-surface-info)', border: '1px solid var(--juno-color-border-info)' }}>
                  <div className="text-xs font-medium" style={{ color: 'var(--juno-color-text-info)' }}>Info Surface</div>
                  <div className="text-xs mt-1 font-mono" style={{ color: 'var(--juno-color-text-secondary)' }}>--juno-color-bg-surface-info</div>
                </div>
              </div>
            </div>
            
            {/* Button Examples */}
            <div className="mb-6">
              <h6 className="text-xs font-medium text-juno-text mb-3">Action/Button System</h6>
              <div className="flex flex-wrap gap-3">
                <button 
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ 
                    backgroundColor: 'var(--juno-color-bg-fill-brand)', 
                    color: 'var(--juno-color-text)',
                    border: '1px solid var(--juno-color-border-brand)'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'var(--juno-color-bg-fill-brand-hover)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'var(--juno-color-bg-fill-brand)'}
                >
                  Primary Action
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ 
                    backgroundColor: 'var(--juno-color-bg-fill-secondary)', 
                    color: 'var(--juno-color-text)',
                    border: '1px solid var(--juno-color-border)'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'var(--juno-color-bg-fill-secondary-hover)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'var(--juno-color-bg-fill-secondary)'}
                >
                  Secondary Action
                </button>
              </div>
            </div>
            
            {/* Text Hierarchy Examples */}
            <div>
              <h6 className="text-xs font-medium text-juno-text mb-3">Text Hierarchy</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Light Background Text */}
                <div className="space-y-2">
                  <h6 className="text-xs font-medium text-juno-muted-fg mb-2">Light Backgrounds</h6>
                  <div style={{ color: 'var(--juno-color-text)' }} className="text-sm">
                    Primary text using --juno-color-text
                  </div>
                  <div style={{ color: 'var(--juno-color-text-secondary)' }} className="text-sm">
                    Secondary text using --juno-color-text-secondary
                  </div>
                  <div style={{ color: 'var(--juno-color-text-brand)' }} className="text-sm">
                    Brand text using --juno-color-text-brand
                  </div>
                  <div style={{ color: 'var(--juno-color-text-link)' }} className="text-sm cursor-pointer hover:underline">
                    Link text using --juno-color-text-link
                  </div>
                </div>
                
                {/* Dark Background Text */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--juno-accent-900)' }}>
                  <h6 className="text-xs font-medium mb-2" style={{ color: 'var(--juno-color-text-inverse-secondary)' }}>Dark Backgrounds</h6>
                  <div className="space-y-2">
                    <div style={{ color: 'var(--juno-color-text-inverse)' }} className="text-sm">
                      Inverse text using --juno-color-text-inverse
                    </div>
                    <div style={{ color: 'var(--juno-color-text-inverse-secondary)' }} className="text-sm">
                      Secondary inverse using --juno-color-text-inverse-secondary
                    </div>
                    <div style={{ color: 'var(--juno-color-text-inverse-disabled)' }} className="text-sm">
                      Disabled inverse using --juno-color-text-inverse-disabled
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
        <h2 className="text-2xl font-semibold text-juno-text mb-8">Typography</h2>
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

      {/* Spacing Scale */}
      <div className="bg-white p-8 rounded-juno-xl shadow-juno-card-with-stroke">
        <h2 className="text-2xl font-semibold text-juno-text mb-8">Spacing Scale</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((space) => (
            <div key={space} className="flex items-center space-x-6">
              <div 
                className="bg-juno-accent border border-juno-border" 
                style={{ 
                  width: `var(--juno-space-${space})`, 
                  height: '1rem' 
                }}
              ></div>
              <span className="text-juno-text text-sm min-w-[100px]">
                Space {space}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Final Summary */}
      <div className="bg-juno-info-bg border border-juno-info text-juno-info-fg p-8 rounded-juno-xl">
        <h3 className="font-semibold mb-2">✅ Token-Mapped Design System Complete!</h3>
        <p className="mb-3">
          The Juno design tokens are now mapped to scale tokens, giving you maximum flexibility:
        </p>
        <ul className="text-sm space-y-1">
          <li>• <strong>juno-accent</strong> → <strong>juno-accent-900</strong> (#1D3F50)</li>
          <li>• <strong>juno-text</strong> → <strong>juno-neutral-750</strong> (#212730)</li>
          <li>• Full access to 47 coordinated colors across 3 accent families + neutrals</li>
          <li>• Easy to create variants, hover states, and gradients</li>
        </ul>
      </div>
    </div>
  )
}