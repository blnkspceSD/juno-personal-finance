# Tech Stack: Juno Personal Finance

## Application Framework
**Next.js 15** - Full-stack React framework with App Router for optimal performance and SEO

## Database
**Supabase** - Managed Postgres with built-in authentication, real-time subscriptions, and row-level security

## JavaScript Framework
**React** - Modern component-based UI library (built into Next.js)

## Import Strategy
**Native ES Modules** - Modern JavaScript module system for better tree-shaking and performance

## CSS Framework
**TailwindCSS 4.0+** - Utility-first CSS framework for rapid, consistent styling

## UI Components
**shadcn/ui** - Unstyled, accessible Radix-based components for consistent design system

## Font Provider
**Google Fonts** - Self-hosted for performance optimization

## Icons
**Lucide React** - Consistent, customizable icon library

## Application Hosting
**Vercel** - Next.js optimized hosting with automatic deployments and edge functions

## Database Hosting
**Supabase Managed Postgres** - Fully managed database with automated backups and scaling

## Repository
**GitHub** - Version control with integrated CI/CD workflows

## Deployment Strategy
**GitHub Actions** - Automated deployment pipeline triggered by branch pushes

## Additional Technical Decisions

### Language & Runtime
- **TypeScript 5.x+** on Node.js 22 LTS for type safety and modern JavaScript features
- **npm** as package manager for dependency management

### Authentication & Security
- **Supabase Auth** for user authentication with support for email/password and social logins
- **Row Level Security (RLS)** policies for data access control
- **Environment variables** for sensitive configuration

### Real-time Features
- **Supabase Realtime** for live budget updates across devices
- **WebSocket connections** for instant transaction sync

### Mobile Optimization
- **Progressive Web App (PWA)** capabilities for native app-like experience
- **Responsive design** with mobile-first approach using Tailwind breakpoints

### Data Storage
- **Supabase Storage** for receipt photos and document uploads
- **CloudFront CDN** for optimized asset delivery with signed URLs for privacy