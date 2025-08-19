# Category Group Visualization Specification

**Date**: August 14, 2025  
**Type**: Feature Enhancement  
**Priority**: High  

## Overview

Transform category groups from navigable components to pure visualization tools that help users organize and view their spending categories in logical groups. Remove navigation complexity and focus on group creation and category organization.

## Goals

1. **Simplify UX**: Remove category group detail pages and navigation
2. **Enable Creation**: Allow users to create custom category groups
3. **Visual Organization**: Help users visualize categories in logical groupings
4. **Flexible Categorization**: Let users assign existing categories to groups

## Current State

- Category group cards exist with chevron navigation to detail pages
- Detail pages show individual categories within groups
- Database schema supports category groups
- Cards show summary progress bars for group spending

## Proposed Changes

### 1. Remove Navigation Elements

- Remove chevron navigation from category group cards
- Remove category group detail pages
- Remove navigation-related code and components
- Cards become pure visualization elements

### 2. Add Group Creation Interface

- Modal/dialog for creating new category groups
- Form fields:
  - Group name (required)
  - Categories to include (multi-select from existing categories)
  - Group color (optional, default provided)
  - Group icon (optional)
- Launched from "Add Group" button in CategoryGroupCardsView

### 3. Category Assignment System

- Multi-select interface showing all user's active categories
- Visual indication of already-assigned categories
- Allow categories to be in multiple groups (if desired)
- Real-time preview of selected categories

### 4. Updated Card Behavior

- Cards remain interactive for hover states
- No navigation on click/chevron
- Focus purely on data visualization
- Maintain existing progress bars and statistics

## Technical Implementation

### Components to Create

1. **CategoryGroupCreateDialog**
   - Modal dialog for group creation
   - Form validation
   - Category multi-select
   - Group customization options

2. **CategorySelector**
   - Reusable multi-select component for categories
   - Search/filter functionality
   - Visual category indicators (color, spending status)

### Components to Update

1. **CategoryGroupCard**
   - Remove navigation elements
   - Remove chevron and link functionality
   - Keep hover states and visual design
   - Remove click handlers for navigation

2. **CategoryGroupCardsView**
   - Update "Add Group" button to open creation dialog
   - Add group creation state management
   - Remove navigation-related props

### Database Operations

- Use existing `category_groups` table
- Update categories with `group_id` assignments
- Create/update group records through Supabase

### API Functions

1. **createCategoryGroup()**
   - Create new group with name, color, icon
   - Return created group data

2. **assignCategoriesToGroup()**
   - Update multiple categories with group_id
   - Handle batch updates efficiently

3. **updateCategoryGroup()**
   - Update existing group properties
   - Handle category reassignments

## User Flow

1. **View Groups**: User sees category group cards on dashboard
2. **Create Group**: User clicks "Add Group" → Modal opens
3. **Name Group**: User enters group name
4. **Select Categories**: User selects existing categories to include
5. **Customize**: User optionally sets color/icon
6. **Save**: Group is created and categories are assigned
7. **View Result**: New group card appears with selected categories

## Design Requirements

- Follow Juno Design System patterns
- Modal/dialog consistent with existing UI
- Multi-select component with clear visual hierarchy
- Progress bars and statistics remain unchanged
- Responsive design for mobile/desktop

## Success Metrics

- Users can successfully create category groups
- Category assignment workflow is intuitive
- No navigation confusion (simplified UX)
- Visual organization improves spending insight
- Creation workflow completes in under 30 seconds

## Future Enhancements (Out of Scope)

- Drag-and-drop category assignment
- Group templates/presets
- Bulk group operations
- Group sharing/export
- Advanced group analytics

## Implementation Priority

1. Remove navigation elements (immediate)
2. Create group creation dialog
3. Build category selection interface  
4. Integrate creation workflow with dashboard
5. Test and refine UX