# Decisions: Juno Personal Finance

## DEC-001: Initial Product Planning
**Status**: Approved  
**Date**: 2025-08-01  
**Category**: Product Strategy

### Context
Planning a personal finance tool focused on YNAB's envelope budgeting method for working adults aged 20-40 earning $20-150k annually. Need to establish core product direction and technical foundation.

### Decision
Build Juno as a web-first personal finance application implementing true envelope budgeting with the following key characteristics:
- Focus specifically on envelope budgeting methodology rather than general expense tracking
- Target working adults who need structured budget guidance without complexity
- Prioritize real-time spending decision support over historical analysis
- Use established tech stack (Next.js, Supabase, TypeScript) for rapid development

### Alternatives Considered
1. **General budgeting app**: Rejected due to market saturation and lack of differentiation
2. **Investment-focused tool**: Rejected as outside target user needs and expertise
3. **Mobile-first native app**: Rejected due to development complexity and web capabilities meeting user needs
4. **Enterprise/family focus**: Rejected to maintain simplicity for individual users in MVP

### Rationale
- Envelope budgeting has proven effectiveness (YNAB's success) but limited simple implementations
- Target demographic has clear pain points with existing solutions being too complex or too basic
- Web-first approach allows rapid iteration and broader device compatibility
- Established tech stack reduces development risk and leverages existing expertise

### Consequences
- **Positive**: Clear product focus, proven methodology, simplified development
- **Negative**: Narrower market than general budgeting, requires user education on envelope method
- **Risks**: Competition from YNAB directly, user adoption of proactive vs reactive budgeting

## DEC-002: Database Architecture Choice
**Status**: Approved  
**Date**: 2025-08-01  
**Category**: Technical Architecture

### Context
Need to select database architecture that supports real-time updates, user authentication, and financial data security while maintaining development simplicity.

### Decision
Use Supabase as primary database solution providing:
- Managed Postgres for relational data integrity
- Built-in Row Level Security for data protection
- Real-time subscriptions for live budget updates
- Integrated authentication system
- Automatic backups and scaling

### Alternatives Considered
1. **Traditional Postgres + separate auth**: Rejected due to increased complexity
2. **NoSQL (MongoDB/Firebase)**: Rejected due to financial data requiring ACID compliance
3. **SQLite + cloud sync**: Rejected due to real-time collaboration requirements

### Rationale
- Financial data requires relational integrity and ACID compliance
- RLS provides robust security model for sensitive financial information
- Real-time features essential for immediate budget balance updates
- Reduces infrastructure complexity and maintenance overhead

### Consequences
- **Positive**: Integrated solution reduces complexity, excellent security model, real-time capabilities
- **Negative**: Vendor lock-in to Supabase ecosystem, potential cost scaling with users
- **Risks**: Supabase service availability, migration complexity if needed later