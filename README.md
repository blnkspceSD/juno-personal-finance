# Juno Personal Finance

A personal finance tool implementing YNAB's proven envelope budgeting method for working adults aged 20-40.

## Overview

Juno helps users gain complete control over their finances through intentional spending allocation and real-time expense tracking. Built with Next.js 15, TypeScript, and Supabase.

## Features

- **Envelope Budgeting**: Allocate every dollar before spending
- **Real-Time Tracking**: Live balance updates across devices
- **Mobile-First Design**: Optimized for on-the-go expense entry
- **Receipt Capture**: Photo storage for expense documentation
- **Budget Reallocation**: Easy fund transfers between categories
- **Spending Analytics**: Simple charts and trend analysis

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.x+
- **Database**: Supabase (Managed Postgres)
- **Styling**: TailwindCSS 4.0+
- **UI Components**: shadcn/ui (Radix-based)
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 22+ and npm 10+
- Supabase account and project
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/juno-personal-finance.git
cd juno-personal-finance
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Agent OS Development

This project uses Agent OS for structured, spec-driven development. All feature development follows the Agent OS workflow:

### Key Files
- `CLAUDE.md` - Complete project context for AI agents
- `.agent-os/product/` - Product documentation and decisions
- `.agent-os/specs/` - Feature specifications and requirements
- `.agent-os/docs/` - Development guides and project structure

### Development Workflow
1. Create feature specification in `.agent-os/specs/YYYY-MM-DD-feature-name/`
2. Define technical requirements and database schema
3. Break down into implementation tasks
4. Follow spec-driven development process
5. Test against specification requirements

See `.agent-os/docs/development-workflow.md` for detailed guidelines.

## Project Structure

```
juno/
├── .agent-os/           # Agent OS configuration and documentation
├── app/                 # Next.js App Router pages (to be created)
├── components/          # Reusable UI components (to be created)
├── lib/                 # Utilities and configurations (to be created)
├── types/               # TypeScript type definitions (to be created)
├── hooks/               # Custom React hooks (to be created)
├── services/            # API and service integrations (to be created)
├── CLAUDE.md           # Agent OS project context
└── package.json        # Dependencies and scripts
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm test` - Run tests
- `npm run test:coverage` - Test coverage report

## Contributing

This project follows spec-driven development:

1. Create a specification in `.agent-os/specs/`
2. Break down requirements into tasks
3. Implement following the technical guidelines
4. Ensure mobile-first, accessible design
5. Test thoroughly with both unit and integration tests

## License

MIT License - see LICENSE file for details.

## Support

For questions about the envelope budgeting methodology, see [You Need A Budget (YNAB)](https://www.youneedabudget.com/) for the original system that inspired this implementation.