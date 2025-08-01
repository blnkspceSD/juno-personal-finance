# Juno Personal Finance - Agent OS Project

> Created: 2025-08-01
> Version: 1.0.0
> Project Type: Next.js 15 Personal Finance Application

## Project Overview

Juno is a personal finance tool that implements YNAB's proven envelope budgeting method to help working adults (ages 20-40) gain complete control over their finances through intentional spending allocation and real-time expense tracking.

## Mission & Vision

**Mission**: Provide working adults with a simple, effective envelope budgeting system that eliminates financial stress through proactive money management.

**Target Users**: Working adults aged 20-40 with incomes between $35,000-$150,000 annually who want to build financial stability without complexity.

**Core Value Proposition**: True envelope budgeting implementation with real-time decision support and mobile-first design.

## Technical Architecture

### Framework & Runtime
- **Next.js 15** with App Router
- **TypeScript 5.x+** on Node.js 22 LTS
- **React** for UI components
- **Native ES Modules** for modern JavaScript

### Database & Backend
- **Supabase** - Managed Postgres with authentication
- **Row Level Security (RLS)** for data access control
- **Supabase Realtime** for live updates
- **Supabase Storage** for receipt photos

### Frontend & Styling
- **TailwindCSS 4.0+** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons
- **Google Fonts** (self-hosted)
- **Progressive Web App (PWA)** capabilities

### Deployment & Infrastructure
- **Vercel** for hosting
- **GitHub** for version control
- **GitHub Actions** for CI/CD
- **CloudFront CDN** for asset delivery

## Core Features

### Envelope Budgeting System
1. **Monthly Budget Allocation**: Assign income to spending categories
2. **Real-Time Balance Tracking**: Live view of remaining funds per category
3. **Budget Reallocation**: Transfer funds between categories
4. **Overspending Alerts**: Notifications when approaching limits

### Transaction Management
5. **Quick Expense Entry**: One-tap logging with receipt capture
6. **Transaction History**: Searchable expense history
7. **Recurring Transactions**: Automated bill and income handling
8. **Bank Import Integration**: Optional automated transaction import

### Dashboard & Analytics
9. **Monthly Overview**: Budget vs. actual spending visualization
10. **Spending Trends**: Pattern analysis charts

### User Experience
11. **Mobile-First Design**: Optimized for smartphone usage
12. **Offline Capability**: Core functionality without internet

## Agent OS Documentation Structure

### Product Documentation
- `@.agent-os/product/mission.md` - Complete product mission and vision
- `@.agent-os/product/mission-lite.md` - Elevator pitch summary
- `@.agent-os/product/tech-stack.md` - Technical architecture decisions
- `@.agent-os/product/roadmap.md` - Product development phases
- `@.agent-os/product/decisions.md` - Product decision log

### Specifications
- `@.agent-os/specs/` - Feature specifications and technical requirements
- Spec format: `YYYY-MM-DD-feature-name/` with `spec.md`, `tasks.md`, and `sub-specs/`

### Configuration
- `@.agent-os/config/` - Agent OS configuration files
- `@.agent-os/docs/` - Additional project documentation

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Next.js 15 App Router patterns
- Implement proper error boundaries
- Use Supabase RLS for security
- Mobile-first responsive design
- Accessibility-first component development

### File Organization
```
/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── styles/             # Global styles and Tailwind config
└── public/             # Static assets
```

### Database Schema Principles
- Use Supabase's built-in auth system
- Implement RLS policies for all tables
- Follow proper normalization for financial data
- Use appropriate data types for monetary values
- Include audit trails for financial transactions

### Security Considerations
- Never store sensitive financial data in plain text
- Implement proper authentication flows
- Use environment variables for API keys
- Follow OWASP guidelines for web security
- Implement rate limiting for API endpoints

## Key Technical Decisions

### Authentication Strategy
Using Supabase Auth with email/password and optional social logins for simplicity and security.

### Real-Time Updates
Supabase Realtime for instant budget updates across devices without complex WebSocket management.

### Mobile Strategy
Progressive Web App approach instead of native apps for faster development and deployment.

### Data Storage
Supabase Storage for receipt photos with signed URLs for privacy and CloudFront CDN for performance.

## Getting Started

This project uses Agent OS for structured development workflows. All feature development should follow the spec-driven development process:

1. Create spec in `@.agent-os/specs/YYYY-MM-DD-feature-name/`
2. Define technical requirements in sub-specs
3. Break down into tasks
4. Implement following technical guidelines
5. Test against spec requirements

## Project Status

**Current Phase**: Initial Setup and Agent OS Integration
**Next Phase**: Core envelope budgeting system implementation

For detailed roadmap and current priorities, see `@.agent-os/product/roadmap.md`.