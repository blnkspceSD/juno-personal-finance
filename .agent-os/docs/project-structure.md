# Project Structure

> Created: 2025-08-01
> Project: Juno Personal Finance
> Framework: Next.js 15 with App Router

## Directory Structure

```
juno/
├── .agent-os/                    # Agent OS configuration and documentation
│   ├── config/                   # Agent OS configuration files
│   │   └── agent-os.json        # Main Agent OS configuration
│   ├── docs/                     # Project documentation
│   │   └── project-structure.md # This file
│   ├── product/                  # Product documentation
│   │   ├── mission.md           # Product mission and vision
│   │   ├── mission-lite.md      # Elevator pitch summary
│   │   ├── tech-stack.md        # Technical architecture
│   │   ├── roadmap.md           # Product roadmap
│   │   └── decisions.md         # Product decisions log
│   └── specs/                    # Feature specifications
│       └── [YYYY-MM-DD-feature-name]/
│           ├── spec.md          # Feature specification
│           ├── spec-lite.md     # Feature summary
│           ├── tasks.md         # Implementation tasks
│           └── sub-specs/       # Technical specifications
│               ├── technical-spec.md
│               ├── database-schema.md
│               ├── api-spec.md
│               └── tests.md
├── app/                          # Next.js App Router (to be created)
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── (auth)/                  # Authentication routes
│   ├── (dashboard)/             # Dashboard routes
│   └── api/                     # API routes
├── components/                   # Reusable UI components (to be created)
│   ├── ui/                      # shadcn/ui components
│   ├── forms/                   # Form components
│   ├── charts/                  # Chart components
│   └── layout/                  # Layout components
├── lib/                          # Utilities and configurations (to be created)
│   ├── supabase.ts              # Supabase client configuration
│   ├── utils.ts                 # Utility functions
│   ├── validations.ts           # Form validation schemas
│   └── constants.ts             # Application constants
├── types/                        # TypeScript type definitions (to be created)
│   ├── database.ts              # Database types
│   ├── auth.ts                  # Authentication types
│   └── budget.ts                # Budget-related types
├── hooks/                        # Custom React hooks (to be created)
│   ├── useAuth.ts               # Authentication hook
│   ├── useBudget.ts             # Budget management hook
│   └── useTransactions.ts       # Transaction management hook
├── services/                     # External service integrations (to be created)
│   ├── auth.ts                  # Authentication services
│   ├── budget.ts                # Budget services
│   └── transactions.ts          # Transaction services
├── styles/                       # Styling files (to be created)
│   └── globals.css              # Tailwind and global styles
├── public/                       # Static assets (to be created)
│   ├── icons/                   # App icons
│   └── images/                  # Static images
├── CLAUDE.md                     # Agent OS project context
├── package.json                  # Node.js dependencies (to be created)
├── tsconfig.json                 # TypeScript configuration (to be created)
├── tailwind.config.js            # Tailwind configuration (to be created)
├── next.config.js                # Next.js configuration (to be created)
└── README.md                     # Project README (to be created)
```

## File Naming Conventions

### Components
- Use PascalCase for component files: `BudgetCard.tsx`
- Use kebab-case for component directories: `budget-card/`
- Include component type in name: `BudgetFormModal.tsx`

### Hooks
- Start with `use` prefix: `useBudget.ts`
- Use camelCase: `useTransactionHistory.ts`

### Services
- Use camelCase: `budgetService.ts`
- Group by domain: `auth/`, `budget/`, `transactions/`

### Types
- Use PascalCase for interfaces: `BudgetItem`, `Transaction`
- Use camelCase for type files: `budget.ts`, `auth.ts`

### API Routes
- Use kebab-case: `budget-categories/`
- Follow REST conventions: `GET /api/budgets`, `POST /api/transactions`

## Configuration Files

### Next.js Configuration
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration

### Package Management
- `package.json` - Dependencies and scripts
- `.env.local` - Environment variables (not committed)
- `.env.example` - Environment variables template

### Development Tools
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `jest.config.js` - Jest testing configuration

## Agent OS Integration

### Specification Workflow
1. Create new spec in `.agent-os/specs/YYYY-MM-DD-feature-name/`
2. Write comprehensive `spec.md` with requirements
3. Break down into tasks in `tasks.md`
4. Create technical specifications in `sub-specs/`
5. Implement following project structure guidelines

### Documentation Standards
- All project context in `CLAUDE.md`
- Product decisions in `.agent-os/product/decisions.md`
- Technical specifications in spec sub-directories
- Use absolute paths with `@` prefix in documentation

## Development Guidelines

### Code Organization
- Group related functionality in feature directories
- Separate concerns: UI, logic, data, and types
- Use barrel exports for clean imports
- Follow Next.js App Router conventions

### Component Structure
```typescript
// components/budget/BudgetCard.tsx
interface BudgetCardProps {
  // Props definition
}

export function BudgetCard({ }: BudgetCardProps) {
  // Component implementation
}
```

### Service Layer Pattern
```typescript
// services/budget.ts
export const budgetService = {
  async getBudgets(): Promise<Budget[]> {
    // Implementation
  },
  // Other methods
}
```

This structure supports the envelope budgeting system with clear separation of concerns and Agent OS workflow integration.