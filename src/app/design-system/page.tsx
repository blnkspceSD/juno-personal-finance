/**
 * Design System Preview Page
 * 
 * Restructured with tabbed navigation for better organization
 * Remove this file before production deployment
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardSubtitle, 
  CardContent, 
  CardFooter, 
  CardMeta, 
  CardActions, 
  CardBadge 
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
  const [activeComponent, setActiveComponent] = React.useState('button')
  const [activeButtonTab, setActiveButtonTab] = React.useState('primary')
  const [activeTabExample, setActiveTabExample] = React.useState('basic')
  const [activeCardExample, setActiveCardExample] = React.useState('basic')

  const buttonExamples = {
    primary: {
      title: "Primary",
      description: "Used most in the interface. Only use another style if a button requires more or less visual weight.",
      component: <Button variant="primary">Add product</Button>
    },
    secondary: {
      title: "Secondary", 
      description: "Used for secondary actions that are less important than primary actions.",
      component: <Button variant="secondary">View details</Button>
    },
    outline: {
      title: "Outline",
      description: "Used for secondary actions that need more visual weight than ghost buttons.",
      component: <Button variant="outline">Edit settings</Button>
    },
    ghost: {
      title: "Ghost",
      description: "Used for tertiary actions or less important interactions.",
      component: <Button variant="ghost">Cancel</Button>
    },
    destructive: {
      title: "Destructive",
      description: "Used for actions that are difficult or impossible to undo.",
      component: <Button variant="destructive">Delete product</Button>
    },
    success: {
      title: "Success",
      description: "Used for positive actions and confirmations.",
      component: <Button variant="success">Save changes</Button>
    },
    warning: {
      title: "Warning", 
      description: "Used for actions that require caution.",
      component: <Button variant="warning">Archive item</Button>
    },
    'with-icon': {
      title: "With icon",
      description: "Buttons can include an icon to help convey their purpose.",
      component: <Button variant="primary" icon="📦">Add product</Button>
    },
    'icon-only': {
      title: "Icon only",
      description: "Use when an icon alone is sufficient and space is limited.",
      component: <Button variant="icon" icon="⚙️" aria-label="Settings" />
    },
    sizes: {
      title: "Button sizes",
      description: "Use different sizes to create visual hierarchy and fit different interface contexts.",
      component: (
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">Small</Button>
          <Button variant="secondary" size="md">Medium</Button>
          <Button variant="secondary" size="lg">Large</Button>
        </div>
      )
    },
    states: {
      title: "Button states",
      description: "Buttons communicate their current state through visual and programmatic indicators.",
      component: (
        <div className="flex items-center gap-3">
          <Button variant="primary">Normal</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      )
    }
  }

  const tabExamples = {
    basic: {
      title: "Basic tabs",
      description: "Use tabs to organize content into sections. Only one tab can be active at a time.",
      component: (
        <Tabs value="tab1" onValueChange={() => {}}>
          <TabsList>
            <TabsTrigger value="tab1">Overview</TabsTrigger>
            <TabsTrigger value="tab2">Analytics</TabsTrigger>
            <TabsTrigger value="tab3">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="mt-4 p-4 bg-juno-surface-50 rounded-lg border border-juno-border">
            <p className="text-juno-text">Overview content goes here...</p>
          </TabsContent>
        </Tabs>
      )
    },
    withIcons: {
      title: "With icons",
      description: "Add icons to tab triggers to enhance visual hierarchy and quick recognition.",
      component: (
        <Tabs value="dashboard" onValueChange={() => {}}>
          <TabsList>
            <TabsTrigger value="dashboard" icon="📊">Dashboard</TabsTrigger>
            <TabsTrigger value="users" icon="👥">Users</TabsTrigger>
            <TabsTrigger value="settings" icon="⚙️">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-4 p-4 bg-juno-surface-50 rounded-lg border border-juno-border">
            <p className="text-juno-text">Dashboard with charts and metrics...</p>
          </TabsContent>
        </Tabs>
      )
    },
    pill: {
      title: "Pill variant",
      description: "Use pill tabs for a more modern, contained appearance.",
      component: (
        <Tabs value="active" onValueChange={() => {}} variant="pill">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4 p-4 bg-juno-surface-50 rounded-lg border border-juno-border">
            <p className="text-juno-text">Active items are displayed here...</p>
          </TabsContent>
        </Tabs>
      )
    },
    vertical: {
      title: "Vertical orientation",
      description: "Use vertical tabs when you have longer tab labels or need to save horizontal space.",
      component: (
        <Tabs value="profile" onValueChange={() => {}} orientation="vertical" className="flex gap-4">
          <TabsList className="flex-col w-48">
            <TabsTrigger value="profile" className="w-full justify-start">Profile Settings</TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start">Notifications</TabsTrigger>
            <TabsTrigger value="security" className="w-full justify-start">Security</TabsTrigger>
            <TabsTrigger value="billing" className="w-full justify-start">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="flex-1 p-4 bg-juno-surface-50 rounded-lg border border-juno-border">
            <p className="text-juno-text">Profile settings content...</p>
          </TabsContent>
        </Tabs>
      )
    },
    sizes: {
      title: "Tab sizes",
      description: "Different sizes to match your interface hierarchy.",
      component: (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-juno-text mb-2">Small tabs</h4>
            <Tabs value="small1" onValueChange={() => {}} size="sm">
              <TabsList>
                <TabsTrigger value="small1">Small</TabsTrigger>
                <TabsTrigger value="small2">Compact</TabsTrigger>
                <TabsTrigger value="small3">Minimal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div>
            <h4 className="text-sm font-medium text-juno-text mb-2">Medium tabs (default)</h4>
            <Tabs value="med1" onValueChange={() => {}} size="md">
              <TabsList>
                <TabsTrigger value="med1">Medium</TabsTrigger>
                <TabsTrigger value="med2">Standard</TabsTrigger>
                <TabsTrigger value="med3">Default</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div>
            <h4 className="text-sm font-medium text-juno-text mb-2">Large tabs</h4>
            <Tabs value="large1" onValueChange={() => {}} size="lg">
              <TabsList>
                <TabsTrigger value="large1">Large</TabsTrigger>
                <TabsTrigger value="large2">Prominent</TabsTrigger>
                <TabsTrigger value="large3">Bold</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      )
    },
    accessibility: {
      title: "Keyboard navigation",
      description: "Tabs support full keyboard navigation and screen readers. Try using Arrow keys, Home, and End.",
      component: (
        <div className="space-y-4">
          <div className="bg-juno-info-bg border border-juno-info p-4 rounded-lg">
            <p className="text-juno-info-fg text-sm mb-2"><strong>Keyboard shortcuts:</strong></p>
            <ul className="text-juno-info-fg text-xs space-y-1">
              <li>• <kbd className="px-1 bg-white text-juno-text rounded text-xs">←→</kbd> Navigate horizontally</li>
              <li>• <kbd className="px-1 bg-white text-juno-text rounded text-xs">↑↓</kbd> Navigate vertically</li>
              <li>• <kbd className="px-1 bg-white text-juno-text rounded text-xs">Home</kbd> First tab</li>
              <li>• <kbd className="px-1 bg-white text-juno-text rounded text-xs">End</kbd> Last tab</li>
              <li>• <kbd className="px-1 bg-white text-juno-text rounded text-xs">Enter</kbd> or <kbd className="px-1 bg-white text-juno-text rounded text-xs">Space</kbd> Activate tab</li>
            </ul>
          </div>
          <Tabs value="accessibility1" onValueChange={() => {}}>
            <TabsList>
              <TabsTrigger value="accessibility1">Try keyboard navigation</TabsTrigger>
              <TabsTrigger value="accessibility2">WCAG 2.1 AA compliant</TabsTrigger>
              <TabsTrigger value="accessibility3">Screen reader friendly</TabsTrigger>
            </TabsList>
            <TabsContent value="accessibility1" className="mt-4 p-4 bg-juno-surface-50 rounded-lg border border-juno-border">
              <p className="text-juno-text">Click here then use arrow keys to navigate tabs!</p>
            </TabsContent>
          </Tabs>
        </div>
      )
    }
  }

  const cardExamples = {
    basic: {
      title: "Basic card",
      description: "A simple card with header, content, and footer sections.",
      component: (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Project Alpha</CardTitle>
            <CardSubtitle>Data analysis dashboard</CardSubtitle>
          </CardHeader>
          <CardContent>
            <p className="text-juno-text">This project focuses on creating comprehensive analytics for user engagement patterns.</p>
          </CardContent>
          <CardFooter>
            <CardMeta>
              <span>Updated 2 hours ago</span>
              <span>By John Doe</span>
            </CardMeta>
            <CardActions>
              <Button variant="outline" size="sm">View</Button>
              <Button variant="primary" size="sm">Edit</Button>
            </CardActions>
          </CardFooter>
        </Card>
      )
    },
    variants: {
      title: "Card variants",
      description: "Different visual styles for cards including elevated, flat, outlined, and status variants.",
      component: (
        <div className="grid grid-cols-2 gap-4 max-w-4xl">
          <Card variant="default" className="text-center">
            <CardContent>
              <h4 className="font-medium text-juno-text mb-2">Default</h4>
              <p className="text-juno-muted-fg text-sm">Standard card with subtle shadow</p>
            </CardContent>
          </Card>
          <Card variant="elevated" className="text-center">
            <CardContent>
              <h4 className="font-medium text-juno-text mb-2">Elevated</h4>
              <p className="text-juno-muted-fg text-sm">Enhanced shadow for prominence</p>
            </CardContent>
          </Card>
          <Card variant="flat" className="text-center">
            <CardContent>
              <h4 className="font-medium text-juno-text mb-2">Flat</h4>
              <p className="text-juno-muted-fg text-sm">No shadow, border only</p>
            </CardContent>
          </Card>
          <Card variant="outlined" className="text-center">
            <CardContent>
              <h4 className="font-medium text-juno-text mb-2">Outlined</h4>
              <p className="text-juno-muted-fg text-sm">Prominent border emphasis</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    interactive: {
      title: "Interactive cards",
      description: "Cards that respond to user interactions with hover and click effects.",
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          <Card interactive={true} className="cursor-pointer">
            <CardContent>
              <h4 className="font-medium text-juno-text mb-2">Interactive Card</h4>
              <p className="text-juno-muted-fg text-sm">Hover me to see the interactive effect</p>
            </CardContent>
          </Card>
          <Card interactive="clickable" className="cursor-pointer">
            <CardContent>
              <h4 className="font-medium text-juno-text mb-2">Clickable Card</h4>
              <p className="text-juno-muted-fg text-sm">Click me for a different interaction style</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    status: {
      title: "Status cards",
      description: "Cards with semantic color indicators for success, warning, error, and info states.",
      component: (
        <div className="grid grid-cols-2 gap-4 max-w-4xl">
          <Card variant="success">
            <CardContent>
              <h4 className="font-medium text-juno-success-fg mb-2">Success</h4>
              <p className="text-juno-success-fg text-sm">Operation completed successfully</p>
            </CardContent>
          </Card>
          <Card variant="warning">
            <CardContent>
              <h4 className="font-medium text-juno-warning-fg mb-2">Warning</h4>
              <p className="text-juno-warning-fg text-sm">Please review before proceeding</p>
            </CardContent>
          </Card>
          <Card variant="error">
            <CardContent>
              <h4 className="font-medium text-juno-danger-fg mb-2">Error</h4>
              <p className="text-juno-danger-fg text-sm">An error occurred during processing</p>
            </CardContent>
          </Card>
          <Card variant="info">
            <CardContent>
              <h4 className="font-medium text-juno-info-fg mb-2">Info</h4>
              <p className="text-juno-info-fg text-sm">Additional information available</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    withMedia: {
      title: "Cards with media",
      description: "Cards that include images or other media content with proper aspect ratios.",
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <Card>
            <div className="bg-gradient-to-br from-juno-accent-100 to-juno-accent-200 h-48 flex items-center justify-center">
              <span className="text-juno-accent-600 font-medium">16:9 Aspect Ratio</span>
            </div>
            <CardHeader>
              <CardTitle>Mountain Landscape</CardTitle>
              <CardSubtitle>Photography Collection</CardSubtitle>
            </CardHeader>
            <CardContent>
              <p className="text-juno-text text-sm">Beautiful mountain scenery captured during golden hour.</p>
              <CardMeta>
                <span>📸 Photography</span>
                <span>🕒 2 days ago</span>
              </CardMeta>
            </CardContent>
          </Card>
          <Card>
            <div className="bg-gradient-to-br from-juno-success-100 to-juno-success-200 aspect-square flex items-center justify-center">
              <span className="text-juno-success-600 font-medium">1:1 Aspect Ratio</span>
            </div>
            <CardHeader>
              <CardTitle>Profile Avatar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-juno-text text-sm">Square format perfect for profile images.</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    layouts: {
      title: "Card layouts",
      description: "Different layout options including horizontal cards and compact variants.",
      component: (
        <div className="space-y-6 max-w-4xl">
          <Card layout="horizontal">
            <div className="bg-gradient-to-br from-juno-info-100 to-juno-info-200 w-48 flex items-center justify-center">
              <span className="text-juno-info-600 font-medium">Media</span>
            </div>
            <div className="flex-1">
              <CardHeader>
                <CardTitle>Horizontal Card</CardTitle>
                <CardSubtitle>Side-by-side layout</CardSubtitle>
              </CardHeader>
              <CardContent>
                <p className="text-juno-text">Horizontal cards are perfect for list views where you want to display media alongside content.</p>
              </CardContent>
            </div>
          </Card>
          <Card layout="compact" className="max-w-md">
            <CardHeader>
              <CardTitle>Compact Card</CardTitle>
              <CardSubtitle>Reduced padding</CardSubtitle>
            </CardHeader>
            <CardContent>
              <p className="text-juno-text">Compact cards use less space and are ideal for dense layouts.</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    states: {
      title: "Card states",
      description: "Cards can show loading, selected, and disabled states.",
      component: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <Card loading>
            <CardHeader>
              <CardTitle>Loading Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-juno-text">This card shows a loading shimmer effect.</p>
            </CardContent>
          </Card>
          <Card selected>
            <CardHeader>
              <CardTitle>Selected Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-juno-text">This card is in a selected state.</p>
            </CardContent>
          </Card>
          <Card disabled>
            <CardHeader>
              <CardTitle>Disabled Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-juno-text">This card is disabled and not interactive.</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    withBadge: {
      title: "Cards with badges",
      description: "Cards can include badge indicators for status or category information.",
      component: (
        <div className="grid grid-cols-2 gap-4 max-w-4xl">
          <Card className="relative">
            <CardBadge>New</CardBadge>
            <CardHeader>
              <CardTitle>Featured Article</CardTitle>
              <CardSubtitle>Just published</CardSubtitle>
            </CardHeader>
            <CardContent>
              <p className="text-juno-text text-sm">This article has been recently added to our collection.</p>
            </CardContent>
          </Card>
          <Card className="relative">
            <CardBadge variant="success">✓ Verified</CardBadge>
            <CardHeader>
              <CardTitle>Verified Account</CardTitle>
              <CardSubtitle>Premium member</CardSubtitle>
            </CardHeader>
            <CardContent>
              <p className="text-juno-text text-sm">This account has been verified by our team.</p>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  const buttonTabs = Object.keys(buttonExamples)
  const currentButtonExample = buttonExamples[activeButtonTab as keyof typeof buttonExamples]
  
  const tabTabs = Object.keys(tabExamples)
  const currentTabExample = tabExamples[activeTabExample as keyof typeof tabExamples]
  
  const cardTabs = Object.keys(cardExamples)
  const currentCardExample = cardExamples[activeCardExample as keyof typeof cardExamples]

  return (
    <div className="space-y-8">
      {/* Component Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveComponent('button')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeComponent === 'button' 
              ? 'bg-juno-accent text-white' 
              : 'bg-juno-surface-100 text-juno-text hover:bg-juno-surface-200'
          )}
        >
          Button
        </button>
        <button
          onClick={() => setActiveComponent('tabs')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeComponent === 'tabs' 
              ? 'bg-juno-accent text-white' 
              : 'bg-juno-surface-100 text-juno-text hover:bg-juno-surface-200'
          )}
        >
          Tabs
        </button>
        <button
          onClick={() => setActiveComponent('cards')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeComponent === 'cards' 
              ? 'bg-juno-accent text-white' 
              : 'bg-juno-surface-100 text-juno-text hover:bg-juno-surface-200'
          )}
        >
          Cards
        </button>
      </div>

      {/* Button Documentation */}
      {activeComponent === 'button' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-juno-text mb-4">Button</h1>
            <p className="text-juno-muted-fg leading-relaxed max-w-4xl">
              Buttons are used primarily for actions, such as &quot;Add&quot;, &quot;Close&quot;, &quot;Cancel&quot;, or &quot;Save&quot;. Plain buttons, which look similar to links, are used for less important or less commonly used actions, such as &quot;view shipping settings&quot;.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-medium text-juno-text">Button component examples</h3>
            
            <Tabs value={activeButtonTab} onValueChange={setActiveButtonTab}>
              <TabsList>
                {buttonTabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {buttonExamples[tab as keyof typeof buttonExamples].title}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeButtonTab} className="bg-white border border-juno-border rounded-lg p-8 space-y-6">
                <p className="text-juno-muted-fg leading-relaxed">
                  {currentButtonExample.description}
                </p>

                <div className="bg-juno-surface-50 p-6 rounded-lg border border-juno-border-alpha-subtle">
                  <div className="flex items-center justify-center min-h-[80px]">
                    {currentButtonExample.component}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-juno-surface-100 text-juno-text rounded border border-juno-border">
                      React
                    </button>
                  </div>
                  <div className="bg-juno-neutral-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code>
                      {getButtonCodeExample(activeButtonTab)}
                    </code>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-juno-text">Props</h2>
            <div className="bg-white border border-juno-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-juno-border bg-juno-surface-50">
                <code className="text-sm font-mono">interface ButtonProps</code>
              </div>
              <div className="divide-y divide-juno-border">
                {[
                  { name: 'variant?', type: '"primary" | "secondary" | "outline" | "ghost" | "destructive" | "success" | "warning" | "icon"', description: 'Changes the visual appearance of the Button.' },
                  { name: 'size?', type: '"sm" | "md" | "lg"', description: 'Changes the size of the button, giving it more or less padding.' },
                  { name: 'icon?', type: 'React.ReactNode', description: 'Icon to display in the button.' },
                  { name: 'iconPosition?', type: '"left" | "right"', description: 'Position of the icon relative to the text.' },
                  { name: 'loading?', type: 'boolean', description: 'Replaces button content with a spinner while a background action is being performed.' },
                  { name: 'disabled?', type: 'boolean', description: 'Disables the button, disallowing user interaction.' },
                  { name: 'children?', type: 'React.ReactNode', description: 'The content to display inside the button.' }
                ].map((prop) => (
                  <div key={prop.name} className="p-6">
                    <dt className="font-mono text-sm text-juno-text mb-2">{prop.name} <span className="text-juno-muted-fg">{prop.type}</span></dt>
                    <dd className="text-sm text-juno-muted-fg">{prop.description}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-juno-text">Best practices</h2>
            <div className="bg-juno-surface-50 border border-juno-border rounded-lg p-6">
              <p className="font-medium text-juno-text mb-4">Buttons should:</p>
              <ul className="space-y-2 text-sm text-juno-muted-fg">
                <li>• Be clearly and accurately labeled.</li>
                <li>• Lead with a strong, actionable verb.</li>
                <li>• Use established button colors appropriately. For example, only use a red button for an action that&apos;s difficult or impossible to undo.</li>
                <li>• Prioritize the most important actions. Too many calls to action can cause confusion and make merchants unsure of what to do next.</li>
                <li>• Be positioned in consistent locations in the interface.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Documentation */}
      {activeComponent === 'tabs' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-juno-text mb-4">Tabs</h1>
            <p className="text-juno-muted-fg leading-relaxed max-w-4xl">
              Tabs organize content into multiple sections and allow users to navigate between them. Only one tab panel is shown at a time. Tabs include full keyboard navigation and screen reader support.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-medium text-juno-text">Tab component examples</h3>
            
            <Tabs value={activeTabExample} onValueChange={setActiveTabExample}>
              <TabsList>
                {tabTabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tabExamples[tab as keyof typeof tabExamples].title}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTabExample} className="bg-white border border-juno-border rounded-lg p-8 space-y-6">
                <p className="text-juno-muted-fg leading-relaxed">
                  {currentTabExample.description}
                </p>

                <div className="bg-juno-surface-50 p-6 rounded-lg border border-juno-border-alpha-subtle">
                  <div className="min-h-[120px]">
                    {currentTabExample.component}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-juno-surface-100 text-juno-text rounded border border-juno-border">
                      React
                    </button>
                  </div>
                  <div className="bg-juno-neutral-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code>
                      {getTabCodeExample(activeTabExample)}
                    </code>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-juno-text">Props</h2>
            <div className="bg-white border border-juno-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-juno-border bg-juno-surface-50">
                <code className="text-sm font-mono">interface TabsProps</code>
              </div>
              <div className="divide-y divide-juno-border">
                {[
                  { name: 'value', type: 'string', description: 'The value of the currently active tab.' },
                  { name: 'onValueChange', type: '(value: string) => void', description: 'Callback function called when the active tab changes.' },
                  { name: 'orientation?', type: '"horizontal" | "vertical"', description: 'The orientation of the tab list.' },
                  { name: 'variant?', type: '"underline" | "pill"', description: 'The visual variant of the tabs.' },
                  { name: 'size?', type: '"sm" | "md" | "lg"', description: 'The size of the tabs.' }
                ].map((prop) => (
                  <div key={prop.name} className="p-6">
                    <dt className="font-mono text-sm text-juno-text mb-2">{prop.name} <span className="text-juno-muted-fg">{prop.type}</span></dt>
                    <dd className="text-sm text-juno-muted-fg">{prop.description}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-juno-text">Accessibility</h2>
            <div className="bg-juno-info-bg border border-juno-info rounded-lg p-6">
              <p className="font-medium text-juno-info-fg mb-4">Our tabs component provides full accessibility support:</p>
              <ul className="space-y-2 text-sm text-juno-info-fg">
                <li>• <strong>Keyboard Navigation:</strong> Arrow keys, Home, End, Enter, and Space</li>
                <li>• <strong>Screen Readers:</strong> Proper ARIA labels and roles</li>
                <li>• <strong>Focus Management:</strong> Automatic focus handling and visual indicators</li>
                <li>• <strong>WCAG 2.1 AA:</strong> Meets accessibility contrast and interaction standards</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-juno-text">Best practices</h2>
            <div className="bg-juno-surface-50 border border-juno-border rounded-lg p-6">
              <p className="font-medium text-juno-text mb-4">Tabs should:</p>
              <ul className="space-y-2 text-sm text-juno-muted-fg">
                <li>• Have clear, concise labels that describe the tab content</li>
                <li>• Present content that is related but distinct</li>
                <li>• Be used when you have 2-7 sections (avoid single tabs or too many tabs)</li>
                <li>• Default to the most important or most commonly used tab</li>
                <li>• Maintain consistent content structure across tabs</li>
                <li>• Include keyboard navigation instructions when relevant</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cards Documentation */}
      {activeComponent === 'cards' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-juno-text mb-4">Card</h1>
            <p className="text-juno-muted-fg leading-relaxed max-w-4xl">
              Cards are versatile containers for grouping related content and actions. They provide a clean, organized way to present information with support for interactive states, status variants, and flexible layouts.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-medium text-juno-text">Card component examples</h3>
            
            <Tabs value={activeCardExample} onValueChange={setActiveCardExample}>
              <TabsList>
                {cardTabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {cardExamples[tab as keyof typeof cardExamples].title}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeCardExample} className="bg-white border border-juno-border rounded-lg p-8 space-y-6">
                <p className="text-juno-muted-fg leading-relaxed">
                  {currentCardExample.description}
                </p>

                <div className="bg-juno-surface-50 p-6 rounded-lg border border-juno-border-alpha-subtle">
                  <div className="flex justify-center min-h-[120px] items-center">
                    {currentCardExample.component}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-juno-surface-100 text-juno-text rounded border border-juno-border">
                      React
                    </button>
                  </div>
                  <div className="bg-juno-neutral-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code>
                      {getCardCodeExample(activeCardExample)}
                    </code>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-juno-text">Props</h2>
            <div className="bg-white border border-juno-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-juno-border bg-juno-surface-50">
                <code className="text-sm font-mono">interface CardProps</code>
              </div>
              <div className="divide-y divide-juno-border">
                {[
                  { name: 'variant?', type: '"default" | "elevated" | "flat" | "outlined" | "success" | "warning" | "error" | "info"', description: 'Changes the visual style of the card.' },
                  { name: 'size?', type: '"sm" | "md" | "lg"', description: 'Controls the padding and overall size of the card.' },
                  { name: 'interactive?', type: '"true" | "clickable"', description: 'Makes the card interactive with hover and click effects.' },
                  { name: 'layout?', type: '"default" | "horizontal" | "compact"', description: 'Changes the layout structure of the card.' },
                  { name: 'loading?', type: 'boolean', description: 'Shows a shimmer loading animation overlay.' },
                  { name: 'selected?', type: 'boolean', description: 'Highlights the card in a selected state.' },
                  { name: 'disabled?', type: 'boolean', description: 'Disables the card and reduces opacity.' }
                ].map((prop) => (
                  <div key={prop.name} className="p-6">
                    <dt className="font-mono text-sm text-juno-text mb-2">{prop.name} <span className="text-juno-muted-fg">{prop.type}</span></dt>
                    <dd className="text-sm text-juno-muted-fg">{prop.description}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-juno-text">Card Components</h2>
            <div className="bg-juno-surface-50 border border-juno-border rounded-lg p-6">
              <p className="font-medium text-juno-text mb-4">Available card sub-components:</p>
              <ul className="space-y-2 text-sm text-juno-muted-fg">
                <li>• <strong>CardHeader:</strong> Contains title and subtitle with optional actions</li>
                <li>• <strong>CardTitle:</strong> Primary heading for the card content</li>
                <li>• <strong>CardSubtitle:</strong> Secondary text below the title</li>
                <li>• <strong>CardContent:</strong> Main content area with configurable padding</li>
                <li>• <strong>CardFooter:</strong> Actions and metadata at the bottom</li>
                <li>• <strong>CardMedia:</strong> Images and media with aspect ratio controls</li>
                <li>• <strong>CardMeta:</strong> Metadata display with automatic separators</li>
                <li>• <strong>CardActions:</strong> Button groups with layout options</li>
                <li>• <strong>CardBadge:</strong> Status indicators and labels</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-juno-text">Best practices</h2>
            <div className="bg-juno-surface-50 border border-juno-border rounded-lg p-6">
              <p className="font-medium text-juno-text mb-4">Cards should:</p>
              <ul className="space-y-2 text-sm text-juno-muted-fg">
                <li>• Present related information in a scannable format</li>
                <li>• Use consistent spacing and alignment within card groups</li>
                <li>• Include clear visual hierarchy with titles and content</li>
                <li>• Provide appropriate interactive feedback when clickable</li>
                <li>• Use status variants sparingly and meaningfully</li>
                <li>• Include proper alt text for media content</li>
                <li>• Be accessible with keyboard navigation when interactive</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions to generate code examples
function getButtonCodeExample(tab: string): string {
  const examples = {
    primary: `<Button variant="primary">Add product</Button>`,
    secondary: `<Button variant="secondary">View details</Button>`,
    outline: `<Button variant="outline">Edit settings</Button>`,
    ghost: `<Button variant="ghost">Cancel</Button>`,
    destructive: `<Button variant="destructive">Delete product</Button>`,
    success: `<Button variant="success">Save changes</Button>`,
    warning: `<Button variant="warning">Archive item</Button>`,
    'with-icon': `<Button variant="primary" icon="📦">Add product</Button>`,
    'icon-only': `<Button variant="icon" icon="⚙️" aria-label="Settings" />`,
    sizes: `<Button variant="secondary" size="sm">Small</Button>
<Button variant="secondary" size="md">Medium</Button>
<Button variant="secondary" size="lg">Large</Button>`,
    states: `<Button variant="primary">Normal</Button>
<Button variant="primary" loading>Loading</Button>
<Button variant="primary" disabled>Disabled</Button>`
  }
  return examples[tab as keyof typeof examples] || examples.primary
}

function getTabCodeExample(tab: string): string {
  const examples = {
    basic: `<Tabs value="tab1" onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Overview</TabsTrigger>
    <TabsTrigger value="tab2">Analytics</TabsTrigger>
    <TabsTrigger value="tab3">Reports</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    <p>Overview content goes here...</p>
  </TabsContent>
</Tabs>`,
    withIcons: `<Tabs value="dashboard" onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="dashboard" icon="📊">Dashboard</TabsTrigger>
    <TabsTrigger value="users" icon="👥">Users</TabsTrigger>
    <TabsTrigger value="settings" icon="⚙️">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="dashboard">
    <p>Dashboard with charts and metrics...</p>
  </TabsContent>
</Tabs>`,
    pill: `<Tabs value="active" onValueChange={setActiveTab} variant="pill">
  <TabsList>
    <TabsTrigger value="active">Active</TabsTrigger>
    <TabsTrigger value="pending">Pending</TabsTrigger>
    <TabsTrigger value="completed">Completed</TabsTrigger>
  </TabsList>
  <TabsContent value="active">
    <p>Active items are displayed here...</p>
  </TabsContent>
</Tabs>`,
    vertical: `<Tabs value="profile" onValueChange={setActiveTab} orientation="vertical">
  <TabsList className="flex-col">
    <TabsTrigger value="profile">Profile Settings</TabsTrigger>
    <TabsTrigger value="notifications">Notifications</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
  </TabsList>
  <TabsContent value="profile">
    <p>Profile settings content...</p>
  </TabsContent>
</Tabs>`,
    sizes: `{/* Small tabs */}
<Tabs value="small1" onValueChange={setActiveTab} size="sm">
  <TabsList>
    <TabsTrigger value="small1">Small</TabsTrigger>
    <TabsTrigger value="small2">Compact</TabsTrigger>
  </TabsList>
</Tabs>

{/* Medium tabs (default) */}
<Tabs value="med1" onValueChange={setActiveTab} size="md">
  <TabsList>
    <TabsTrigger value="med1">Medium</TabsTrigger>
    <TabsTrigger value="med2">Standard</TabsTrigger>
  </TabsList>
</Tabs>

{/* Large tabs */}
<Tabs value="large1" onValueChange={setActiveTab} size="lg">
  <TabsList>
    <TabsTrigger value="large1">Large</TabsTrigger>
    <TabsTrigger value="large2">Prominent</TabsTrigger>
  </TabsList>
</Tabs>`,
    accessibility: `<Tabs value="accessibility1" onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="accessibility1">Keyboard Navigation</TabsTrigger>
    <TabsTrigger value="accessibility2">WCAG 2.1 AA</TabsTrigger>
    <TabsTrigger value="accessibility3">Screen Reader</TabsTrigger>
  </TabsList>
  <TabsContent value="accessibility1">
    <p>Use arrow keys to navigate tabs!</p>
  </TabsContent>
</Tabs>

{/* 
Keyboard navigation:
- Arrow keys: Navigate between tabs
- Home/End: Jump to first/last tab  
- Enter/Space: Activate focused tab
- Tab: Move focus to tab content
*/}`
  }
  return examples[tab as keyof typeof examples] || examples.basic
}

function getCardCodeExample(tab: string): string {
  const examples = {
    basic: `<Card className="max-w-md">
  <CardHeader>
    <CardTitle>Project Alpha</CardTitle>
    <CardSubtitle>Data analysis dashboard</CardSubtitle>
  </CardHeader>
  <CardContent>
    <p>This project focuses on creating comprehensive analytics...</p>
  </CardContent>
  <CardFooter>
    <CardMeta>
      <span>Updated 2 hours ago</span>
      <span>By John Doe</span>
    </CardMeta>
    <CardActions>
      <Button variant="outline" size="sm">View</Button>
      <Button variant="primary" size="sm">Edit</Button>
    </CardActions>
  </CardFooter>
</Card>`,
    variants: `<Card variant="default">
  <CardContent>
    <h4>Default Card</h4>
    <p>Standard card with subtle shadow</p>
  </CardContent>
</Card>

<Card variant="elevated">
  <CardContent>
    <h4>Elevated Card</h4>
    <p>Enhanced shadow for prominence</p>
  </CardContent>
</Card>

<Card variant="flat">
  <CardContent>
    <h4>Flat Card</h4>
    <p>No shadow, border only</p>
  </CardContent>
</Card>`,
    interactive: `<Card interactive={true}>
  <CardContent>
    <h4>Interactive Card</h4>
    <p>Hover me to see the interactive effect</p>
  </CardContent>
</Card>

<Card interactive="clickable">
  <CardContent>
    <h4>Clickable Card</h4>
    <p>Click me for a different interaction style</p>
  </CardContent>
</Card>`,
    status: `<Card variant="success">
  <CardContent>
    <h4>Success Card</h4>
    <p>Operation completed successfully</p>
  </CardContent>
</Card>

<Card variant="warning">
  <CardContent>
    <h4>Warning Card</h4>
    <p>Please review before proceeding</p>
  </CardContent>
</Card>

<Card variant="error">
  <CardContent>
    <h4>Error Card</h4>
    <p>An error occurred during processing</p>
  </CardContent>
</Card>`,
    withMedia: `<Card>
  <CardMedia 
    src="/image.jpg" 
    alt="Mountain landscape" 
    aspectRatio="16-9" 
  />
  <CardHeader>
    <CardTitle>Mountain Landscape</CardTitle>
    <CardSubtitle>Photography Collection</CardSubtitle>
  </CardHeader>
  <CardContent>
    <p>Beautiful mountain scenery captured during golden hour.</p>
    <CardMeta>
      <span>📸 Photography</span>
      <span>🕒 2 days ago</span>
    </CardMeta>
  </CardContent>
</Card>`,
    layouts: `{/* Horizontal Layout */}
<Card layout="horizontal">
  <CardMedia src="/image.jpg" alt="Media" />
  <CardHeader>
    <CardTitle>Horizontal Card</CardTitle>
    <CardSubtitle>Side-by-side layout</CardSubtitle>
  </CardHeader>
  <CardContent>
    <p>Perfect for list views with media and content.</p>
  </CardContent>
</Card>

{/* Compact Layout */}
<Card layout="compact">
  <CardHeader>
    <CardTitle>Compact Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Reduced padding for dense layouts.</p>
  </CardContent>
</Card>`,
    states: `<Card loading>
  <CardContent>
    <h4>Loading Card</h4>
    <p>This card shows a loading shimmer effect.</p>
  </CardContent>
</Card>

<Card selected>
  <CardContent>
    <h4>Selected Card</h4>
    <p>This card is in a selected state.</p>
  </CardContent>
</Card>

<Card disabled>
  <CardContent>
    <h4>Disabled Card</h4>
    <p>This card is disabled and not interactive.</p>
  </CardContent>
</Card>`,
    withBadge: `<Card className="relative">
  <CardBadge>New</CardBadge>
  <CardHeader>
    <CardTitle>Featured Article</CardTitle>
    <CardSubtitle>Just published</CardSubtitle>
  </CardHeader>
  <CardContent>
    <p>This article has been recently added to our collection.</p>
  </CardContent>
</Card>

<Card className="relative">
  <CardBadge variant="success">✓ Verified</CardBadge>
  <CardHeader>
    <CardTitle>Verified Account</CardTitle>
    <CardSubtitle>Premium member</CardSubtitle>
  </CardHeader>
  <CardContent>
    <p>This account has been verified by our team.</p>
  </CardContent>
</Card>`
  }
  return examples[tab as keyof typeof examples] || examples.basic
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