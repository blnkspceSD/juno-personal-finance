# Dashboard UI Redesign Specification

> Spec: Dashboard UI Redesign
> Created: 2025-08-23
> Status: Planning

## Overview

Redesign the Juno dashboard to match the modern, clean Figma design that emphasizes spending overview with category group visualization and streamlined recent transactions. The new design focuses on a two-column layout that provides immediate spending context while maintaining easy access to recent activity.

**CRITICAL: All data must be dynamically sourced from the actual Supabase database. The Figma design serves ONLY as a visual reference for layout, styling, and component placement. No hardcoded values, example data, or static content should be used. Every number, color, transaction, and category must come from real database records.**

## User Stories

### Primary User Story
**As a Juno user, I want a clean, modern dashboard that shows my actual spending progress at a glance, so I can quickly understand my real financial position and recent activity without cognitive overload.**

### Supporting User Stories

1. **Real-Time Spending Overview Focus**
   - As a user, I want to see my actual current month spending vs my budget prominently displayed, calculated from my real `transactions.amount` summed against my `budgets.total_income`
   - As a user, I want to see a stacked bar chart of my actual category groups, showing real spending amounts from my transaction history aggregated by `category_groups`
   - As a user, I want spending amounts that reflect my actual database records, with proper handling of edge cases like no transactions, partial months, or budget changes
   - As a user, I want real-time updates when I add transactions or modify budgets, with the display immediately reflecting my current database state

2. **Database-Driven Transactions Display**
   - As a user, I want to see my real recent transactions in a compact, scannable format, pulled directly from the `transactions` table with proper category joins
   - As a user, I want category color indicators on transactions that use the actual `categories.color` or `category_groups.color` stored in my database
   - As a user, I want transaction amounts, descriptions, and dates that reflect my actual data from `transactions.amount`, `transactions.description`, and `transactions.date`
   - As a user, I want currency formatting that respects my user preferences stored in the database, not hardcoded "RM" or "$" symbols
   - As a user, I want quick access to add transactions and view all transactions, so I can maintain my financial records efficiently

3. **Authentic Visual Design with Real Data**
   - As a user, I want a clean, modern interface that displays my real financial data accurately, handling scenarios where I have minimal or extensive data
   - As a user, I want consistent color coding that matches my actual category and group settings in the `categories.color` and `category_groups.color` fields
   - As a user, I want the interface to adapt properly to my actual data volume - whether I have 2 categories or 20, 5 transactions or 500
   - As a user, I want proper empty states when I haven't created budgets or transactions yet, with clear guidance on next steps

## Spec Scope

### In Scope

1. **Left Column - Database-Driven Spending Overview**
   - Large spending display showing actual current month spending calculated from real `transactions.amount` WHERE `date` IN current month
   - Budget comparison using real `budgets.total_income` from active budget
   - "SPENDING THIS MONTH" header with proper typography
   - Stacked horizontal bar chart showing real category group spending from aggregated transaction data joined with `category_groups`
   - Spending amounts calculated from actual SUM(`transactions.amount`) GROUP BY `category_groups.id`
   - Visual progress indication based on real budget utilization: (total_spent / budgets.total_income) * 100
   - Handle edge cases: no current budget, no transactions, negative transactions, budget changes mid-month

2. **Right Column - Real Recent Transactions**
   - "RECENT TRANSACTIONS" header
   - Transaction list displaying actual records from `transactions` table with JOIN to `categories` for color and name
   - Colored vertical line indicators using actual `categories.color` or fallback to `category_groups.color` from database
   - Real transaction descriptions from `transactions.description` (with proper truncation for long descriptions)
   - Properly formatted dates from `transactions.date` converted to "16 Aug" format
   - Actual currency amounts from `transactions.amount` formatted with user currency preferences (not hardcoded currency)
   - Bottom action buttons: "Add transaction" and "View all"
   - Proper scrolling for variable transaction list lengths (handle 0 transactions to 100+)
   - Empty state when user has no transactions with clear call-to-action

3. **Layout and Visual Design with Data Adaptation**
   - Two-column responsive layout that adapts to actual data volume
   - Card-based sections with rounded corners
   - Modern typography hierarchy scaling with actual content
   - Consistent spacing and padding that works with varying data lengths
   - Professional color palette using actual database color values with proper fallbacks
   - Mobile-responsive design handling real data constraints
   - Loading states during actual database fetches
   - Error states for actual database connection issues

4. **Database-First Data Integration**
   - Real-time spending calculations from actual `transactions` table aggregated by month and category
   - Category group aggregation using real `category_groups` table with proper LEFT JOINs for ungrouped categories
   - Recent transactions fetched from `transactions` table with proper category color JOINs
   - Currency formatting based on actual user preferences from `users.currency_preference` (not hardcoded symbols)
   - Handle real-world data edge cases: transactions without categories, categories without groups, deleted categories, archived budgets
   - Error states and loading states for actual Supabase connection scenarios
   - Proper NULL handling for optional database fields
   - Real-time Supabase subscriptions for live data updates

### Technical Implementation Areas

1. **Component Architecture with Real Data Flow**
   - Redesigned RealtimeDashboard layout consuming actual Supabase queries
   - New SpendingOverviewSection component with database query integration
   - Enhanced RecentTransactionsCard component with real transaction records and category joins
   - Responsive grid system that adapts to actual data volumes
   - Proper TypeScript interfaces matching actual database schema

2. **Database-Connected Chart Implementation**
   - Stacked horizontal bar chart component consuming real `category_groups` data
   - Category group data aggregation from actual database with SQL SUM operations
   - Color mapping from actual `category_groups.color` and `categories.color` database fields
   - Interactive hover states showing real spending amounts from database calculations
   - Handle cases where categories don't have groups assigned (create "Other" group)
   - Chart scaling that adapts to actual number of category groups (2-20+)
   - Empty state when user has no category groups or spending

3. **Typography and Styling with Real Content**
   - Juno Design System integration
   - Consistent font sizing and weights that work with varying text lengths
   - Professional color palette implementation using database color values with CSS fallbacks
   - Responsive breakpoints tested with actual data variations
   - Proper text truncation for real transaction descriptions
   - Currency formatting utilities that handle multiple currencies based on user preferences

## Out of Scope

1. **Functional Changes to Database Schema**
   - No changes to underlying `transactions`, `categories`, `category_groups`, or `budgets` table structure
   - No changes to Supabase RLS policies
   - No changes to existing database relationships or constraints

2. **Transaction Creation Workflow Changes**
   - No changes to transaction creation form or validation
   - No changes to category assignment logic
   - No changes to budget creation process

3. **Additional Dashboard Views**
   - Net worth tab implementation
   - Investments tab implementation
   - Advanced analytics features beyond current spending overview

4. **Mobile-Specific Native Features**
   - Native mobile app optimizations
   - Touch gesture enhancements beyond standard web interactions
   - Mobile-specific navigation patterns

## Expected Deliverable

### Primary Deliverables

1. **Data-Driven Redesigned Dashboard Page**
   - Updated RealtimeDashboard component with new two-column layout consuming real Supabase data
   - Modern spending overview section with stacked bar chart showing actual category group spending from database
   - Streamlined recent transactions display using real user transaction data with proper category color joins
   - Responsive design implementation that handles varying data volumes (empty states to data-rich scenarios)
   - Real-time data updates maintained through existing Supabase subscriptions

2. **Database-Connected UI Components**
   - SpendingOverviewSection component calculating real spending from `SUM(transactions.amount)` queries
   - StackedCategoryChart component visualizing actual category group data with real color mapping
   - EnhancedRecentTransactionsCard component displaying real transactions with category information
   - Proper TypeScript interfaces reflecting actual Supabase database types and relationships
   - Error handling components for real database failure scenarios

3. **Real-Data Styling System**
   - Juno Design System compliance with dynamic content handling
   - Modern typography implementation that scales with actual data
   - Color usage based on actual `categories.color` and `category_groups.color` database fields
   - Responsive grid layout handling variable content lengths from real data
   - Currency formatting system using actual user preferences, not hardcoded symbols
   - Loading states and skeletons for actual database query times

### Success Criteria

1. **Visual Fidelity with Real Data**
   - Dashboard matches Figma design specifications while displaying actual user financial data
   - Consistent spacing and typography regardless of data volume (2 transactions vs 200)
   - Proper color usage from actual database color fields with appropriate fallbacks
   - Clean, professional appearance maintaining design integrity with real financial information
   - Graceful handling of edge cases: no data, partial data, missing relationships

2. **Functional Requirements with Database Integration**
   - Real-time data updates maintained using actual Supabase change subscriptions
   - All existing dashboard functionality preserved with real data sources
   - Responsive design across devices handling varying actual data volumes
   - Fast loading and smooth interactions with optimized database queries
   - Proper error handling for real-world scenarios: connection failures, missing budgets, data inconsistencies

3. **Code Quality and Data Integrity**
   - TypeScript type safety maintained with actual Supabase database types
   - Component reusability with properly typed real data props
   - Performance optimization for actual database query patterns
   - Proper error handling for missing, NULL, or malformed database data
   - No hardcoded values, colors, currencies, or example data anywhere in the implementation
   - Comprehensive testing with real data scenarios and edge cases

## Spec Documentation

- Tasks: @.agent-os/specs/2025-08-23-dashboard-ui-redesign/tasks.md
- Technical Specification: @.agent-os/specs/2025-08-23-dashboard-ui-redesign/sub-specs/technical-spec.md
- Component Specification: @.agent-os/specs/2025-08-23-dashboard-ui-redesign/sub-specs/component-spec.md
- Design System Integration: @.agent-os/specs/2025-08-23-dashboard-ui-redesign/sub-specs/design-system-spec.md