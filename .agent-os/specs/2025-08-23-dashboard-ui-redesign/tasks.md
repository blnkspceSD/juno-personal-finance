# Dashboard UI Redesign Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-23-dashboard-ui-redesign/spec.md

> Created: 2025-08-23
> Status: Ready for Implementation

## Tasks

### Phase 1: Database Integration and Layout Structure (Priority: High)

- [ ] **DUI-001: Update RealtimeDashboard Layout with Real Data Flow**
  - Replace current layout with two-column design consuming actual Supabase data
  - Implement responsive grid system (2 columns on desktop, single column on mobile)
  - Remove tab navigation (focus on spending view only)
  - Integrate existing real-time data hooks with new layout
  - Update container spacing and margins to handle varying data volumes
  - Ensure proper responsive breakpoints work with actual data content
  - Add loading states for database queries and error handling for connection failures

- [ ] **DUI-002: Create Database-Connected SpendingOverviewSection Component**
  - Build left column spending overview section consuming real budget data
  - Implement "SPENDING THIS MONTH" header styling
  - Create large spending amount display using actual `SUM(transactions.amount)` vs real `budgets.total_income`
  - Calculate spending from actual database queries, not hardcoded values
  - Add proper typography scaling and spacing that adapts to varying amounts
  - Integrate with existing budget calculation logic using real database data
  - Handle edge cases: no current budget, zero spending, negative transactions
  - Add loading skeletons for spending calculations

### Phase 2: Database-Driven Chart Implementation (Priority: High)

- [ ] **DUI-003: Implement StackedCategoryChart Component with Real Data**
  - Create horizontal stacked bar chart consuming actual `category_groups` data from Supabase
  - Map actual `category_groups.color` and `categories.color` database fields to chart segments
  - Implement proper data aggregation using real `SUM(transactions.amount) GROUP BY category_groups.id`
  - Add hover states and tooltips showing real spending amounts from database
  - Ensure chart scales properly with actual number of category groups (handle 2-20+ groups)
  - Add loading and error states for actual database queries
  - Handle cases where categories don't have groups (create dynamic "Other" group)
  - Implement empty state when user has no spending or category groups

- [ ] **DUI-004: Update Chart Data Pipeline with Real Database Queries**
  - Modify groupedSpendingData structure to use real Supabase queries
  - Implement proper category group aggregation from actual `category_groups` table with JOINs
  - Add percentage calculations based on real total spending amounts
  - Optimize database queries for chart performance (proper indexes, query optimization)
  - Handle real-world data edge cases: NULL category_group_ids, deleted categories, archived categories
  - Add error handling for database query failures
  - Implement real-time updates when transactions or categories change

### Phase 3: Real Transaction Display (Priority: High)

- [ ] **DUI-005: Create EnhancedRecentTransactionsCard Component with Database Integration**
  - Build right column transactions card displaying real `transactions` table data
  - Implement "RECENT TRANSACTIONS" header
  - Create compact transaction list layout using actual transaction records
  - Add colored vertical line indicators using real `categories.color` or `category_groups.color` from database
  - Format transaction descriptions from real `transactions.description` (handle long descriptions with truncation)
  - Format dates from real `transactions.date` in "16 Aug" format
  - Format amounts from real `transactions.amount` using actual user currency preferences (not hardcoded RM/$)
  - Implement proper scrolling for varying transaction counts (0 to 100+)
  - Add empty state when user has no transactions with clear call-to-action

- [ ] **DUI-006: Update Transaction List Styling with Real Data**
  - Style transaction rows with proper spacing for actual content lengths
  - Add category color indicators using real database color values with fallbacks
  - Format dates using actual `transactions.date` in "16 Aug" format
  - Format currency amounts using actual user preferences and real `transactions.amount`
  - Add hover states for transaction rows
  - Implement proper text truncation for real transaction descriptions of varying lengths
  - Handle edge cases: transactions with NULL descriptions, deleted categories, missing colors
  - Add loading states for transaction fetching

### Phase 4: Action Buttons and Navigation (Priority: Medium)

- [ ] **DUI-007: Implement Bottom Action Buttons**
  - Add "Add transaction" button to transactions card
  - Add "View all" button to transactions card
  - Style buttons according to Juno Design System
  - Ensure proper button spacing and alignment
  - Connect buttons to existing navigation routes (/dashboard/transactions/new, /dashboard/transactions)
  - Add loading states for navigation actions

- [ ] **DUI-008: Remove Deprecated UI Elements and Hardcoded Data**
  - Remove tab navigation from dashboard
  - Clean up unused chart components with hardcoded examples
  - Remove duplicate transaction displays with static data
  - Remove all hardcoded spending amounts, currencies, and example transactions
  - Simplify component prop interfaces to use real database types
  - Remove any remaining placeholder or example data

### Phase 5: Typography and Real Data Styling (Priority: Medium)

- [ ] **DUI-009: Implement Juno Design System Typography with Dynamic Content**
  - Apply consistent font sizes and weights that work with varying data content
  - Implement proper heading hierarchy
  - Style currency amounts with appropriate formatting based on actual amounts and user preferences
  - Add consistent text colors and opacity using Juno tokens
  - Ensure typography scales properly on mobile with actual content
  - Handle long transaction descriptions and category names gracefully
  - Add proper contrast for category colors from database

- [ ] **DUI-010: Apply Modern Color Palette with Database Colors**
  - Use Juno Design System color tokens as base
  - Integrate actual `categories.color` and `category_groups.color` database values
  - Implement proper contrast ratios with database colors
  - Apply subtle background colors and borders
  - Style card components with modern shadows
  - Ensure dark mode compatibility with database colors
  - Add fallback colors for NULL or invalid database color values

### Phase 6: Responsive Design with Real Data (Priority: Medium)

- [ ] **DUI-011: Mobile Layout Implementation with Data Adaptation**
  - Convert two-column layout to single column on mobile
  - Adjust spending overview sizing for mobile with actual amounts
  - Optimize transaction card height for mobile with varying transaction counts
  - Ensure proper touch targets for mobile interactions
  - Test across different mobile device sizes with real user data
  - Handle long transaction descriptions on mobile screens
  - Optimize chart display for mobile with varying category group counts

- [ ] **DUI-012: Tablet Layout Optimization with Real Content**
  - Optimize layout for tablet breakpoints
  - Adjust chart sizing for medium screens with actual data
  - Ensure proper component proportions with varying data volumes
  - Test transaction list scrolling on tablets with real transaction counts
  - Handle category group overflow on medium screens

### Phase 7: Performance and Polish with Real Data (Priority: Low)

- [ ] **DUI-013: Performance Optimization for Database Operations**
  - Optimize chart rendering performance with actual data volumes
  - Implement proper memoization for expensive database calculations
  - Add skeleton loading states for actual database query times
  - Optimize bundle size for dashboard components
  - Implement efficient re-rendering for real-time data updates
  - Add database query caching where appropriate
  - Optimize Supabase queries with proper indexes

- [ ] **DUI-014: Accessibility Improvements with Real Data**
  - Add proper ARIA labels for chart elements with actual category names
  - Ensure keyboard navigation works properly
  - Add screen reader support for actual spending amounts
  - Test with accessibility tools using real user data
  - Ensure color contrast with actual database colors meets WCAG standards
  - Add proper focus indicators for real transaction lists

- [ ] **DUI-015: Real Data Error State Handling**
  - Add proper error states for failed Supabase connections
  - Implement graceful degradation for missing database data
  - Add loading states for all database operations
  - Handle edge cases: no transactions, no categories, no budgets, malformed data
  - Add retry mechanisms for failed database queries
  - Display meaningful error messages for data integrity issues
  - Handle scenarios with corrupted or inconsistent database data

### Phase 8: Testing and Documentation with Real Data (Priority: Low)

- [ ] **DUI-016: Component Testing with Real Data Scenarios**
  - Write unit tests for new components with real database data mocking
  - Test responsive behavior across breakpoints with varying data volumes
  - Test with different data scenarios: empty states, maximum data, partial data
  - Verify real-time Supabase updates still work correctly
  - Test error scenarios: database failures, malformed data, missing relationships
  - Test currency formatting with different user preferences
  - Test category color handling with NULL and invalid color values

- [ ] **DUI-017: Documentation Updates for Database Integration**
  - Update component documentation with real data requirements
  - Document new prop interfaces using actual database types
  - Add usage examples with real database query patterns
  - Update design system documentation for database color integration
  - Document error handling patterns for database operations
  - Add troubleshooting guide for common database data issues

## Definition of Done

### For Each Task:
- [ ] Implementation uses real Supabase database data exclusively (no hardcoded values)
- [ ] Component matches Figma design specifications while displaying actual user data
- [ ] Component is TypeScript typed with proper database interfaces
- [ ] Responsive design works across all breakpoints with varying data volumes
- [ ] Existing real-time functionality is preserved and enhanced
- [ ] Real-time updates work correctly when underlying database data changes
- [ ] Code follows Juno Design System patterns
- [ ] Performance impact is minimal or positive with real database queries
- [ ] Proper error handling for all database operation scenarios
- [ ] Edge cases handled: empty data, malformed data, missing relationships

### For Overall Spec:
- [ ] Dashboard visually matches provided Figma design with real user data
- [ ] Two-column layout implemented and responsive with actual data volumes
- [ ] Spending overview displays real calculations from database transactions and budgets
- [ ] Recent transactions display actual user transactions with real category colors
- [ ] All spending amounts calculated from real `transactions.amount` sums
- [ ] All colors sourced from actual `categories.color` and `category_groups.color` fields
- [ ] Currency formatting based on actual user preferences, not hardcoded symbols
- [ ] Chart displays real category group spending with proper data aggregation
- [ ] All user interactions work with real data and proper error handling
- [ ] No regression in existing dashboard functionality
- [ ] No hardcoded data, colors, currencies, or example content anywhere
- [ ] Real-time Supabase subscriptions work correctly with new layout
- [ ] Code is clean, maintainable, and well-documented with database integration patterns