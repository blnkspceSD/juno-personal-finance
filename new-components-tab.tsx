// Components Tab Component - Structured like Shopify Polaris
function ComponentsTab() {
  const [activeTab, setActiveTab] = React.useState('primary')

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

  const tabs = Object.keys(buttonExamples)
  const currentExample = buttonExamples[activeTab as keyof typeof buttonExamples]

  return (
    <div className="space-y-8">
      {/* Button Documentation Header */}
      <div>
        <h1 className="text-3xl font-semibold text-juno-text mb-4">Button</h1>
        <p className="text-juno-muted-fg leading-relaxed max-w-4xl">
          Buttons are used primarily for actions, such as "Add", "Close", "Cancel", or "Save". Plain buttons, which look similar to links, are used for less important or less commonly used actions, such as "view shipping settings".
        </p>
      </div>

      {/* Button Component Examples */}
      <div className="space-y-6">
        <h3 className="text-xl font-medium text-juno-text">Button component examples</h3>
        
        {/* Tab Navigation */}
        <div className="border-b border-juno-border">
          <nav className="flex flex-wrap gap-1" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                  activeTab === tab
                    ? "bg-white border-t border-l border-r border-juno-border text-juno-text border-b-white -mb-px"
                    : "text-juno-muted-fg hover:text-juno-text hover:bg-juno-surface-50"
                )}
              >
                {buttonExamples[tab as keyof typeof buttonExamples].title}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div 
          role="tabpanel"
          className="bg-white border border-juno-border rounded-lg rounded-tl-none p-8 space-y-6"
        >
          {/* Description */}
          <p className="text-juno-muted-fg leading-relaxed">
            {currentExample.description}
          </p>

          {/* Live Example */}
          <div className="bg-juno-surface-50 p-6 rounded-lg border border-juno-border-alpha-subtle">
            <div className="flex items-center justify-center min-h-[80px]">
              {currentExample.component}
            </div>
          </div>

          {/* Code Example */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-juno-surface-100 text-juno-text rounded border border-juno-border">
                React
              </button>
            </div>
            <div className="bg-juno-neutral-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <code>
                {getCodeExample(activeTab)}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Props Documentation */}
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

      {/* Best Practices */}
      <div className="space-y-6">
        <h2 className="text-2xl font-medium text-juno-text">Best practices</h2>
        <div className="bg-juno-surface-50 border border-juno-border rounded-lg p-6">
          <p className="font-medium text-juno-text mb-4">Buttons should:</p>
          <ul className="space-y-2 text-sm text-juno-muted-fg">
            <li>• Be clearly and accurately labeled.</li>
            <li>• Lead with a strong, actionable verb.</li>
            <li>• Use established button colors appropriately. For example, only use a red button for an action that's difficult or impossible to undo.</li>
            <li>• Prioritize the most important actions. Too many calls to action can cause confusion and make merchants unsure of what to do next.</li>
            <li>• Be positioned in consistent locations in the interface.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate code examples
function getCodeExample(tab: string): string {
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