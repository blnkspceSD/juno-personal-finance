'use client'

import React from 'react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardSubtitle, 
  CardContent, 
  CardFooter,
  CardActions,
  CardMeta
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestCardsPage() {
  return (
    <div className="min-h-screen bg-juno-surface-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-juno-text mb-4">
            New Token-Based Card System
          </h1>
          <p className="text-juno-muted-fg text-lg mb-6">
            12 Public Token API • Variable-Only Variants • RTL Support • Accessibility Built-in
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="primary" onClick={() => window.open('/card-playground', '_blank')}>
              🎨 Try Card Playground
            </Button>
            <Button variant="secondary" onClick={() => window.open('/design-system', '_blank')}>
              📚 Full Design System
            </Button>
          </div>
        </div>

        {/* Token API Demo */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Token API Customization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Standard Card */}
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardSubtitle>Uses default token values</CardSubtitle>
              </CardHeader>
              <CardContent>
                <p>This card uses all default token values from the Juno Design System.</p>
              </CardContent>
            </Card>

            {/* Custom Radius Card */}
            <Card style={{ "--card-radius": "24px" } as React.CSSProperties}>
              <CardHeader>
                <CardTitle>Custom Radius</CardTitle>
                <CardSubtitle>--card-radius: 24px</CardSubtitle>
              </CardHeader>
              <CardContent>
                <p>This card demonstrates inline token override for border radius.</p>
              </CardContent>
            </Card>

            {/* Custom Spacing Card */}
            <Card style={{ 
              "--card-pad-block": "var(--juno-space-8)",
              "--card-pad-inline": "var(--juno-space-8)",
              "--card-gap": "var(--juno-space-4)"
            } as React.CSSProperties}>
              <CardHeader>
                <CardTitle>Custom Spacing</CardTitle>
                <CardSubtitle>Larger padding & gap</CardSubtitle>
              </CardHeader>
              <CardContent>
                <p>This card uses larger padding and gap tokens for spacious feel.</p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Visual Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Visual Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card variant="default">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2">Default</h3>
                <p className="text-sm text-juno-muted-fg">Standard card with subtle shadow</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2">Elevated</h3>
                <p className="text-sm text-juno-muted-fg">No border, soft shadow</p>
              </CardContent>
            </Card>

            <Card variant="filled">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2">Filled</h3>
                <p className="text-sm text-juno-muted-fg">Secondary surface, no shadow</p>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2">Outlined</h3>
                <p className="text-sm text-juno-muted-fg">Strong border, no shadow</p>
              </CardContent>
            </Card>

            <Card variant="stroke-filled">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2">Stroke + Filled</h3>
                <p className="text-sm text-juno-muted-fg">Border with background, no shadow</p>
              </CardContent>
            </Card>

            <Card variant="background">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2">Background Only</h3>
                <p className="text-sm text-juno-muted-fg">Background color, no border/shadow</p>
              </CardContent>
            </Card>

            <Card variant="clean">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2">Clean</h3>
                <p className="text-sm text-juno-muted-fg">White background, no border</p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Size Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Size Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card size="sm">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2">Small</h3>
                <p className="text-sm text-juno-muted-fg">Compact spacing</p>
              </CardContent>
            </Card>

            <Card size="md">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2">Medium</h3>
                <p className="text-sm text-juno-muted-fg">Standard spacing</p>
              </CardContent>
            </Card>

            <Card size="lg">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2">Large</h3>
                <p className="text-sm text-juno-muted-fg">Generous spacing</p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Status Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Status Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <Card variant="success">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2 text-juno-success-fg">Success</h3>
                <p className="text-sm">Semantic success styling</p>
              </CardContent>
            </Card>

            <Card variant="warning">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2 text-juno-warning-fg">Warning</h3>
                <p className="text-sm">Semantic warning styling</p>
              </CardContent>
            </Card>

            <Card variant="error">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2 text-juno-danger-fg">Error</h3>
                <p className="text-sm">Semantic error styling</p>
              </CardContent>
            </Card>

            <Card variant="info">
              <CardContent className="text-center">
                <h3 className="font-medium mb-2 text-juno-info-fg">Info</h3>
                <p className="text-sm">Semantic info styling</p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Interactive Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Interactive Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card 
              variant="clean"
              interactive={true} 
              data-hoverable="true" 
              tabIndex={0}
              className="cursor-pointer"
            >
              <CardHeader>
                <CardTitle>Hoverable Card</CardTitle>
                <CardSubtitle>With state layer overlay</CardSubtitle>
              </CardHeader>
              <CardContent>
                <p>This card has a subtle state layer overlay on hover and lift animation.</p>
              </CardContent>
              <CardFooter>
                <CardActions>
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                </CardActions>
              </CardFooter>
            </Card>

            <Card 
              interactive="clickable"
              className="cursor-pointer"
              onClick={() => alert('Card clicked!')}
            >
              <CardHeader>
                <CardTitle>Clickable Card</CardTitle>
                <CardSubtitle>Scale animation on click</CardSubtitle>
              </CardHeader>
              <CardContent>
                <p>This card scales down slightly when clicked for tactile feedback.</p>
              </CardContent>
              <CardFooter>
                <CardMeta>
                  <span>Click anywhere</span>
                  <span>Interactive</span>
                </CardMeta>
              </CardFooter>
            </Card>

          </div>
        </section>

        {/* Complex Card Example */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Complex Card Example</h2>
          <div className="max-w-2xl mx-auto">
            
            <Card 
              variant="elevated" 
              size="lg"
              style={{
                "--card-hover-shadow": "var(--juno-shadow-xl)",
                "--card-hover-translate-y": "-4px"
              } as React.CSSProperties}
              data-hoverable="true"
              className="cursor-pointer"
            >
              <CardHeader>
                <CardTitle>Project Dashboard</CardTitle>
                <CardSubtitle>Real-time metrics and analytics</CardSubtitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-juno-success-fg">92%</div>
                      <div className="text-sm text-juno-muted-fg">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-juno-text">1,247</div>
                      <div className="text-sm text-juno-muted-fg">Total Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-juno-accent">$12.4k</div>
                      <div className="text-sm text-juno-muted-fg">Revenue</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-juno-border pt-4">
                    <p className="text-juno-text">
                      This card demonstrates the full token-based system with custom hover effects,
                      semantic colors, and responsive layout patterns.
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <CardMeta>
                  <span>Updated 2 min ago</span>
                  <span>Live data</span>
                  <span>Auto-refresh</span>
                </CardMeta>
                <CardActions>
                  <Button variant="secondary" size="sm">Settings</Button>
                  <Button variant="primary" size="sm">View Details</Button>
                </CardActions>
              </CardFooter>
            </Card>

          </div>
        </section>

        {/* Token Reference */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-juno-text">Available Card Tokens</h2>
          <div className="bg-white p-6 rounded-xl border border-juno-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              
              <div>
                <h3 className="font-medium mb-3 text-juno-text">Surface & Content</h3>
                <ul className="space-y-1 text-juno-muted-fg font-mono text-xs">
                  <li>--card-bg</li>
                  <li>--card-fg</li>
                  <li>--card-state-layer</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-juno-text">Shape & Border</h3>
                <ul className="space-y-1 text-juno-muted-fg font-mono text-xs">
                  <li>--card-radius</li>
                  <li>--card-border-width</li>
                  <li>--card-border-color</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-juno-text">Spacing</h3>
                <ul className="space-y-1 text-juno-muted-fg font-mono text-xs">
                  <li>--card-pad-block</li>
                  <li>--card-pad-inline</li>
                  <li>--card-gap</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-juno-text">Elevation</h3>
                <ul className="space-y-1 text-juno-muted-fg font-mono text-xs">
                  <li>--card-shadow</li>
                  <li>--card-hover-shadow</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-juno-text">Interaction</h3>
                <ul className="space-y-1 text-juno-muted-fg font-mono text-xs">
                  <li>--card-hover-border-color</li>
                  <li>--card-hover-translate-y</li>
                  <li>--card-focus-ring</li>
                </ul>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  )
}