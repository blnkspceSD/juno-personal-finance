# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Juno is a Next.js 15.4.5 application built with TypeScript and Tailwind CSS v4. This is a fresh project created with `create-next-app@latest` using the App Router architecture.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Development Notes
- Uses Turbopack for faster development builds
- Development server automatically uses Turbopack via `--turbopack` flag

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS v4 with PostCSS
- **Runtime**: React 19.1.0
- **Fonts**: Geist Sans and Geist Mono (self-hosted via next/font)

### File Structure
- **src/app/**: App Router pages and layouts
- **src/app/layout.tsx**: Root layout with font configuration and metadata
- **src/app/globals.css**: Global styles with Tailwind imports and CSS custom properties
- **@/\***: TypeScript path alias pointing to `./src/*`

### Styling Configuration
- **Tailwind CSS v4**: Uses `@tailwindcss/postcss` plugin in `postcss.config.mjs`
- **CSS Variables**: Defined in globals.css for `--background` and `--foreground` with dark mode support
- **Theme Integration**: Uses `@theme inline` directive to integrate CSS custom properties with Tailwind
- **Font Variables**: Geist fonts exposed as CSS variables (`--font-geist-sans`, `--font-geist-mono`)

### TypeScript Configuration
- **Strict mode enabled** with ES2017 target
- **Path mapping**: `@/*` resolves to `./src/*`
- **Next.js plugin**: Integrated for enhanced TypeScript support
- **Module resolution**: Uses "bundler" for modern tooling compatibility

## Agent OS Workflow

This project uses Agent OS for structured development:

### Product Documentation (`.agent-os/product/`)
- **mission.md**: Comprehensive product vision and strategy
- **mission-lite.md**: Condensed mission for AI context efficiency  
- **tech-stack.md**: Technical architecture and decisions
- **roadmap.md**: Development phases and timeline
- **decisions.md**: Product decision log with rationale

### Feature Development (`.agent-os/specs/`)
- Use `YYYY-MM-DD-feature-name/` format for specifications
- Each spec includes: `spec.md`, `tasks.md`, and `sub-specs/` directory
- Follow spec-driven development for all major features

### Supabase Integration
- **Client**: `lib/supabase/client.ts` for browser-side operations
- **Server**: `lib/supabase/server.ts` for server-side operations  
- **Environment**: Configured with project credentials in `.env.local`
- **Authentication**: Uses Supabase Auth with SSR support

## Important Configuration Details

### Tailwind CSS v4 Setup
The project uses Tailwind CSS v4 which requires:
- `@tailwindcss/postcss` plugin (not the legacy `tailwindcss` plugin)
- `@import "tailwindcss"` in globals.css
- PostCSS configuration in `.mjs` format

### Font System
Fonts are configured in the root layout:
- Geist Sans as the primary font family
- Geist Mono for monospace text
- Font variables are available globally and integrated with Tailwind theme

### Dark Mode Support
Built-in dark mode support via CSS custom properties:
- Light theme: `--background: #ffffff`, `--foreground: #171717`
- Dark theme: `--background: #0a0a0a`, `--foreground: #ededed`
- Automatically responds to `prefers-color-scheme: dark`