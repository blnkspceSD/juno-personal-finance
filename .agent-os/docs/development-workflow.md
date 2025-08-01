# Development Workflow

> Created: 2025-08-01
> Project: Juno Personal Finance
> Agent OS Version: 1.0.0

## Spec-Driven Development Process

This project follows Agent OS spec-driven development methodology for structured feature implementation.

### 1. Feature Planning Phase

#### Create New Spec
```bash
# Create spec directory with date and feature name
mkdir -p .agent-os/specs/2025-08-01-envelope-budgeting
```

#### Required Spec Files
- `spec.md` - Complete feature specification
- `spec-lite.md` - Elevator pitch summary
- `tasks.md` - Implementation task breakdown
- `sub-specs/` directory with:
  - `technical-spec.md` - Technical requirements
  - `database-schema.md` - Database changes
  - `api-spec.md` - API endpoints
  - `tests.md` - Test coverage requirements

### 2. Specification Template Usage

#### Main Spec Format (`spec.md`)
```markdown
# Spec Requirements Document

> Spec: Feature Name
> Created: YYYY-MM-DD
> Status: Planning

## Overview
[Feature description and goals]

## User Stories
[User-facing requirements]

## Spec Scope
[What this spec covers]

## Out of Scope
[What this spec doesn't cover]

## Expected Deliverable
[Final implementation requirements]

## Spec Documentation
- Tasks: @.agent-os/specs/folder/tasks.md
- Technical Specification: @.agent-os/specs/folder/sub-specs/technical-spec.md
```

### 3. Implementation Phase

#### Development Order
1. **Database Schema** - Create/modify Supabase tables and RLS policies
2. **API Layer** - Implement Next.js API routes
3. **Services** - Create service layer for business logic
4. **Types** - Define TypeScript interfaces
5. **Hooks** - Build custom React hooks
6. **Components** - Develop UI components
7. **Pages** - Create Next.js pages/routes
8. **Tests** - Implement test coverage

#### Code Standards
- Use TypeScript strict mode
- Follow Next.js 15 App Router patterns
- Implement Supabase RLS for all tables
- Mobile-first responsive design
- Accessibility-first components

### 4. Testing Requirements

#### Test Categories
- **Unit Tests** - Component and hook testing
- **Integration Tests** - API and service testing
- **E2E Tests** - User workflow testing
- **Database Tests** - RLS policy validation

#### Testing Tools
- Jest for unit testing
- React Testing Library for component testing
- Supabase local development for database testing

### 5. Deployment Workflow

#### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/spec-name` - Individual feature branches

#### CI/CD Pipeline
1. **GitHub Actions** triggers on push
2. **Type checking** with TypeScript
3. **Linting** with ESLint
4. **Testing** with Jest
5. **Build** verification
6. **Deploy** to Vercel (production/preview)

## Project-Specific Guidelines

### Envelope Budgeting Implementation

#### Core Data Flow
1. **Income Allocation** - Assign monthly income to categories
2. **Real-Time Tracking** - Monitor category balances
3. **Transaction Processing** - Deduct from appropriate envelopes
4. **Reallocation** - Transfer funds between categories

#### Security Considerations
- All financial data protected by RLS policies
- User can only access their own data
- Audit trail for all financial transactions
- Secure handling of receipt uploads

### Mobile-First Development

#### Responsive Breakpoints
- Mobile: 320px - 767px (primary target)
- Tablet: 768px - 1023px
- Desktop: 1024px+

#### Touch Interface Requirements
- Minimum 44px touch targets
- Swipe gestures for common actions
- Optimized for one-handed use
- Quick expense entry workflow

### Performance Standards

#### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

#### Optimization Strategies
- Next.js Image optimization
- Supabase edge functions for regional performance
- PWA caching for offline capability
- Lazy loading for non-critical features

## Quality Assurance

### Code Review Checklist
- [ ] TypeScript types properly defined
- [ ] RLS policies implemented and tested
- [ ] Mobile responsive design verified
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Error handling implemented
- [ ] Loading states designed
- [ ] Test coverage adequate

### Definition of Done
- [ ] Feature matches spec requirements
- [ ] All tests passing
- [ ] Code review approved
- [ ] Mobile functionality verified
- [ ] Accessibility audit completed
- [ ] Performance impact assessed
- [ ] Documentation updated

## Troubleshooting

### Common Issues

#### Supabase Connection
```typescript
// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Type Errors
```bash
# Generate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

#### Build Failures
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Test coverage
npm run test:coverage
```

This workflow ensures consistent, high-quality implementation of the envelope budgeting system while maintaining Agent OS development standards.