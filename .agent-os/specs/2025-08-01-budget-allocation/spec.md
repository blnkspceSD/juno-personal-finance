# Feature Specification: Budget Allocation System

**ID**: JUNO-001  
**Created**: 2025-08-01  
**Status**: In Development  
**Priority**: High  

## Overview

Implement the core budget allocation interface that allows users to create monthly budgets and allocate their income across spending categories (envelopes) following the YNAB methodology.

## User Story

As a working adult using Juno for envelope budgeting, I want to allocate my monthly income across different spending categories so that I can control my spending and prevent overspending in any category.

## Acceptance Criteria

### Must Have
1. **Budget Creation**
   - User can create a new monthly budget for the current or future months
   - User can set their total monthly income
   - System validates that total allocations don't exceed income

2. **Category Management**
   - User can add, edit, and remove budget categories
   - User can set allocation amounts for each category
   - System shows remaining unallocated income in real-time
   - Categories are reorderable for user preference

3. **Envelope Balance Display**
   - Each category shows allocated amount and remaining balance
   - Visual indicators for overspent categories (red) and healthy categories (green)
   - Real-time updates when allocations change

4. **Budget Reallocation**
   - User can transfer funds between categories
   - System prevents negative balances in source categories
   - Changes are saved automatically

### Should Have
5. **Default Category Templates**
   - System provides common category suggestions (Housing, Food, Transportation, etc.)
   - User can customize suggested amounts based on income level

6. **Budget Summary**
   - Dashboard shows total income, allocated, and unallocated amounts
   - Progress indicators for overall budget health
   - Month-over-month comparison

### Could Have
7. **Category Icons**
   - Visual icons for different category types
   - User can select from predefined icon set

## Technical Requirements

### Database Schema
- Budgets table: id, user_id, name, month, year, total_income
- Categories table: id, user_id, budget_id, name, allocated, spent, sort_order

### API Endpoints
- GET /api/budgets - List user's budgets
- POST /api/budgets - Create new budget
- PUT /api/budgets/[id] - Update budget
- DELETE /api/budgets/[id] - Delete budget
- GET /api/budgets/[id]/categories - List budget categories
- POST /api/budgets/[id]/categories - Create category
- PUT /api/categories/[id] - Update category
- DELETE /api/categories/[id] - Delete category

### UI Components
- BudgetCreationForm
- CategoryList
- CategoryItem with inline editing
- AllocationInput with validation
- BudgetSummary dashboard

## Success Metrics

- User can create a complete monthly budget in under 5 minutes
- Real-time balance updates occur within 100ms
- Zero data loss during category reallocation
- 95% of users successfully allocate 100% of their income

## Dependencies

- Supabase authentication system
- Database schema from migration 001_initial_schema.sql
- User profile creation flow

## Out of Scope

- Transaction tracking (separate feature)
- Bank account integration
- Budget history/reporting
- Multi-user/family budget

## Design Notes

The interface should feel like a simple spreadsheet with immediate feedback. Focus on clarity and preventing user errors rather than advanced features. The envelope metaphor should be clear through visual design.