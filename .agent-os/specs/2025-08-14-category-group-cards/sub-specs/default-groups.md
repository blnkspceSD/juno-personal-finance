# Default Category Groups Definition

This is the default groups definition for the spec detailed in @.agent-os/specs/2025-08-14-category-group-cards/spec.md

> Created: 2025-08-14
> Version: 1.0.0

## Overview

This document defines the default category groups that will be automatically created for new users and available as templates during group setup. These groups are based on common personal finance categorization patterns and YNAB envelope budgeting methodology.

## Default Group Definitions

### 1. Bills & Fixed Expenses
**Internal Name**: `bills-fixed-expenses`  
**Display Name**: `Bills & Fixed Expenses`  
**Color**: `#dc2626` (Red)  
**Icon**: `📋`  
**Sort Order**: `0`  

**Description**: Rent, utilities, insurance, and other fixed monthly costs that are predictable and necessary.

**Category Types**: `['housing', 'utilities', 'insurance', 'loans', 'subscriptions', 'rent', 'mortgage', 'phone', 'internet']`

**Typical Categories**:
- Rent/Mortgage
- Electric & Gas
- Water & Sewer  
- Phone & Internet
- Car Insurance
- Health Insurance
- Student Loans
- Credit Card Payments
- Streaming Services
- Gym Membership

**Auto-Assignment Keywords**: 
```typescript
const billsKeywords = [
  'rent', 'mortgage', 'utilities', 'electric', 'gas', 'water', 'sewer',
  'phone', 'internet', 'insurance', 'loan', 'subscription', 'netflix',
  'spotify', 'gym', 'membership', 'cable', 'trash', 'recycling'
]
```

### 2. Core Expenses
**Internal Name**: `core-expenses`  
**Display Name**: `Core Expenses`  
**Color**: `#059669` (Green)  
**Icon**: `🛒`  
**Sort Order**: `1`

**Description**: Essential daily expenses like food, transportation, and healthcare that vary month-to-month.

**Category Types**: `['food', 'transportation', 'healthcare', 'groceries', 'gas', 'medical', 'prescriptions']`

**Typical Categories**:
- Groceries
- Dining Out
- Gas & Fuel
- Car Maintenance
- Public Transportation
- Medical Co-pays
- Prescriptions
- Personal Care
- Household Supplies
- Pet Care

**Auto-Assignment Keywords**:
```typescript
const coreKeywords = [
  'groceries', 'food', 'dining', 'restaurant', 'gas', 'fuel', 'transportation',
  'medical', 'healthcare', 'doctor', 'pharmacy', 'prescriptions', 'personal',
  'household', 'supplies', 'pet', 'care', 'maintenance', 'repair'
]
```

### 3. Flexible & Lifestyle
**Internal Name**: `flexible-lifestyle`  
**Display Name**: `Flexible & Lifestyle`  
**Color**: `#7c3aed` (Purple)  
**Icon**: `🎨`  
**Sort Order**: `2`

**Description**: Entertainment, lifestyle choices, flexible spending, and variable expenses that can be adjusted based on available budget.

**Category Types**: `['entertainment', 'dining', 'hobbies', 'shopping', 'lifestyle', 'recreation', 'social', 'miscellaneous', 'gifts', 'personal', 'variable', 'other', 'unexpected']`

**Typical Categories**:
- Movies & Entertainment
- Bars & Nightlife
- Hobbies & Crafts
- Books & Music
- Clothing & Fashion
- Electronics & Gadgets
- Sports & Recreation
- Social Events
- Date Nights
- Personal Development
- Miscellaneous
- Unexpected Expenses
- Gifts & Donations
- Professional Development
- Business Expenses
- Home Improvement
- Technology Upgrades
- Seasonal Expenses

**Auto-Assignment Keywords**:
```typescript
const flexibleLifestyleKeywords = [
  // Lifestyle & entertainment
  'entertainment', 'movies', 'bars', 'nightlife', 'hobbies', 'books', 'music',
  'clothing', 'fashion', 'electronics', 'gadgets', 'sports', 'recreation',
  'social', 'events', 'date', 'personal', 'development', 'courses', 'fun',
  // Flexible & miscellaneous
  'miscellaneous', 'misc', 'other', 'unexpected', 'gifts', 'donations',
  'professional', 'business', 'home', 'improvement', 'technology', 'upgrades',
  'seasonal', 'buffer', 'contingency', 'variable', 'flexible', 'adjustable'
]
```

### 4. Savings Goals
**Internal Name**: `savings-goals`  
**Display Name**: `Savings Goals`  
**Color**: `#2563eb` (Blue)  
**Icon**: `🎯`  
**Sort Order**: `3`

**Description**: Emergency fund, vacation fund, and other specific financial goals and future planning.

**Category Types**: `['emergency', 'vacation', 'goals', 'investments', 'retirement', 'savings', 'fund']`

**Typical Categories**:
- Emergency Fund
- Vacation Fund
- Car Replacement Fund
- Home Down Payment
- Holiday & Gifts
- Wedding Fund
- Retirement Savings
- Investment Contributions
- Education Fund
- Major Purchase Fund

**Auto-Assignment Keywords**:
```typescript
const goalsKeywords = [
  'emergency', 'vacation', 'travel', 'fund', 'savings', 'goals', 'retirement',
  'investment', 'education', 'wedding', 'holiday', 'gifts', 'christmas',
  'birthday', 'car', 'replacement', 'down', 'payment', 'future', 'planning'
]
```

## Implementation Details

### TypeScript Interfaces

```typescript
export interface DefaultGroupTemplate {
  id: string
  internalName: string
  displayName: string
  description: string
  color: string
  icon: string
  sortOrder: number
  categoryTypes: string[]
  autoAssignKeywords: string[]
  isActive: boolean
}

export const DEFAULT_GROUP_TEMPLATES: DefaultGroupTemplate[] = [
  {
    id: 'bills-fixed-expenses',
    internalName: 'bills-fixed-expenses',
    displayName: 'Bills & Fixed Expenses',
    description: 'Rent, utilities, insurance, and other fixed monthly costs',
    color: '#dc2626',
    icon: '📋',
    sortOrder: 0,
    categoryTypes: ['housing', 'utilities', 'insurance', 'loans', 'subscriptions'],
    autoAssignKeywords: [
      'rent', 'mortgage', 'utilities', 'electric', 'gas', 'water', 'phone', 
      'internet', 'insurance', 'loan', 'subscription', 'netflix', 'spotify', 'gym'
    ],
    isActive: true
  },
  // ... additional templates
]
```

### Auto-Assignment Algorithm

```typescript
export function autoAssignCategoryToGroup(
  categoryName: string,
  templates: DefaultGroupTemplate[]
): string | null {
  const normalizedName = categoryName.toLowerCase().trim()
  
  // Score each template based on keyword matches
  const scores = templates.map(template => {
    const matchingKeywords = template.autoAssignKeywords.filter(keyword =>
      normalizedName.includes(keyword.toLowerCase())
    )
    
    return {
      templateId: template.id,
      score: matchingKeywords.length,
      matchedKeywords: matchingKeywords
    }
  })
  
  // Find the best match
  const bestMatch = scores
    .filter(score => score.score > 0)
    .sort((a, b) => b.score - a.score)[0]
    
  return bestMatch ? bestMatch.templateId : null
}
```

### Group Creation Functions

```typescript
export async function createDefaultGroupsForUser(
  userId: string,
  selectedTemplates?: string[]
): Promise<CategoryGroup[]> {
  const templatesToCreate = selectedTemplates 
    ? DEFAULT_GROUP_TEMPLATES.filter(t => selectedTemplates.includes(t.id))
    : DEFAULT_GROUP_TEMPLATES.filter(t => t.isActive)
    
  const createdGroups = []
  
  for (const template of templatesToCreate) {
    const group = await createCategoryGroup(userId, {
      name: template.displayName,
      description: template.description,
      color: template.color,
      icon: template.icon,
      sort_order: template.sortOrder
    })
    
    createdGroups.push(group)
  }
  
  return createdGroups
}

export async function autoAssignExistingCategories(
  userId: string,
  createdGroups: CategoryGroup[]
): Promise<{ categoryId: string, groupId: string, reason: string }[]> {
  const existingCategories = await getCategoriesForUser(userId)
  const assignments = []
  
  for (const category of existingCategories.filter(c => !c.group_id)) {
    const templateId = autoAssignCategoryToGroup(category.name, DEFAULT_GROUP_TEMPLATES)
    
    if (templateId) {
      const matchingGroup = createdGroups.find(g => 
        g.name === DEFAULT_GROUP_TEMPLATES.find(t => t.id === templateId)?.displayName
      )
      
      if (matchingGroup) {
        await updateCategory(category.id, { group_id: matchingGroup.id })
        assignments.push({
          categoryId: category.id,
          groupId: matchingGroup.id,
          reason: `Auto-assigned based on category name "${category.name}"`
        })
      }
    }
  }
  
  return assignments
}
```

## Customization Options

### User Preferences for Default Groups

Users can customize which default groups they want to create:

```typescript
export interface GroupSetupPreferences {
  includeGroups: string[] // Template IDs to include
  customGroupNames: Record<string, string> // Override display names
  customColors: Record<string, string> // Override colors
  autoAssignCategories: boolean // Whether to auto-assign existing categories
}

export const DEFAULT_SETUP_PREFERENCES: GroupSetupPreferences = {
  includeGroups: ['bills-fixed-expenses', 'core-expenses', 'flexible-lifestyle', 'savings-goals'],
  customGroupNames: {},
  customColors: {},
  autoAssignCategories: true
}
```

### Regional/Cultural Variations

For future internationalization, templates can be customized by region:

```typescript
export interface RegionalGroupTemplates {
  region: string
  templates: DefaultGroupTemplate[]
  commonCategories: Record<string, string[]> // Group ID -> category names
}

export const US_GROUP_TEMPLATES: RegionalGroupTemplates = {
  region: 'US',
  templates: DEFAULT_GROUP_TEMPLATES,
  commonCategories: {
    'bills-fixed-expenses': ['Rent/Mortgage', 'Car Insurance', 'Health Insurance'],
    'core-expenses': ['Groceries', 'Gas', 'Healthcare'],
    // ...
  }
}
```

## Setup Wizard Integration

The default groups are presented to users through a setup wizard:

### Step 1: Group Selection
- Show all available default templates
- Allow users to select which ones to create
- Provide brief descriptions and examples

### Step 2: Customization (Optional)
- Allow renaming of selected groups
- Color and icon customization
- Preview of how groups will look

### Step 3: Category Assignment
- Show existing categories that would be auto-assigned
- Allow manual reassignment before creation
- Option to skip auto-assignment entirely

### Step 4: Confirmation
- Summary of groups to be created
- Final confirmation before creation
- Success message with next steps

This default group system provides a solid foundation for new users while maintaining flexibility for customization and growth.