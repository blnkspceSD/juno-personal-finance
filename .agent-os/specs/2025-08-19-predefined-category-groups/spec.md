# Spec Requirements Document

> Spec: Predefined Category Groups with Dashboard Integration
> Created: 2025-08-19
> Status: Planning

## Overview

Implement predefined category groups with starter categories for new users to improve onboarding experience and financial organization. Update the dashboard bar chart to display spending by category groups with stacked bars showing individual category breakdowns.

This feature addresses the current friction in the user onboarding process by providing meaningful default categories organized into logical spending groups, while enhancing the dashboard visualization to show spending patterns at both group and individual category levels.

## User Stories

### As a new user
- I want to see predefined category groups when I first use Juno so I don't have to create everything from scratch
- I want starter categories in each group so I can immediately start categorizing my transactions
- I want these categories to make sense for typical spending patterns

### As an existing user
- I want to see my spending organized by groups on the dashboard for better insights
- I want to see individual category breakdown within each group for detailed analysis
- I want the chart to maintain visual clarity while showing more information

### As a user managing my finances
- I want logical groupings (Core, Flexible, Lifestyle, Savings) that align with budgeting best practices
- I want the ability to customize these groups after the initial setup
- I want the dashboard to help me understand my spending patterns across different types of expenses

## Spec Scope

### Core Features
- **Predefined Category Groups**: Four default groups with clear purposes and starter categories
- **Database Seeding**: Automated creation of default groups and categories for new users
- **Dashboard Chart Updates**: Modified bar chart showing grouped spending with stacked individual categories
- **User Onboarding Integration**: Seamless creation of default structure during user setup

### Category Group Definitions
- **Core**: Essential, non-negotiable expenses
  - Groceries, Utilities, Rent/Mortgage, Gas, Medical, Insurance
- **Flexible**: Necessary but variable expenses
  - Dining Out, Personal Care, Household Items, Transportation, Phone/Internet
- **Lifestyle**: Discretionary, enjoyment-based spending
  - Entertainment, Hobbies, Shopping, Travel, Subscriptions
- **Savings**: Future-focused financial goals
  - Emergency Fund, Vacation Fund, Investments, Debt Repayment

### Technical Implementation
- Database schema updates for category groups
- Seeding scripts for default data
- Dashboard component modifications for grouped visualization
- Onboarding flow integration

## Out of Scope

- Custom group creation during onboarding (users can modify after setup)
- Advanced budgeting features per group
- Group-based spending limits or alerts
- Category migration tools for existing users
- Mobile-specific group management interfaces

## Expected Deliverable

### Database Layer
- Updated schema with category groups relationship
- Seeding scripts for default groups and categories
- Migration scripts for schema changes

### Frontend Components
- Modified dashboard bar chart with grouped, stacked visualization
- Enhanced category display with group information
- Updated onboarding flow to create default structure

### User Experience
- New users receive four predefined groups with 20+ starter categories
- Dashboard shows spending organized by groups with individual category breakdown
- Intuitive color coding and visual hierarchy for grouped data
- Smooth transition from individual to grouped view

### Performance Considerations
- Efficient querying for grouped spending data
- Optimized chart rendering for multiple data series
- Cached calculations for dashboard performance

## Spec Documentation

- Tasks: @.agent-os/specs/2025-08-19-predefined-category-groups/tasks.md
- Technical Specification: @.agent-os/specs/2025-08-19-predefined-category-groups/sub-specs/technical-spec.md
- Database Schema: @.agent-os/specs/2025-08-19-predefined-category-groups/sub-specs/database-schema.md
- Dashboard Component Spec: @.agent-os/specs/2025-08-19-predefined-category-groups/sub-specs/dashboard-component-spec.md
- Onboarding Flow Spec: @.agent-os/specs/2025-08-19-predefined-category-groups/sub-specs/onboarding-flow-spec.md