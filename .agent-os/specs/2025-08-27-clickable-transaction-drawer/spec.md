# Clickable Transaction Items with Details Drawer Specification

**Feature**: Add clickable functionality to transaction items with comprehensive details drawer  
**Date**: 2025-08-27  
**Status**: Planning  
**Priority**: High  

## 1. Overview

This specification outlines the implementation of clickable transaction items in the Recent Transactions card that open a detailed transaction drawer using shadcn/ui Sheet component. The drawer will display comprehensive transaction information with edit, delete, and duplicate functionality while maintaining the Juno Design System standards.

### 1.1 Objectives

- Make transaction items in Recent Transactions card clickable
- Implement shadcn/ui Sheet component as transaction details drawer
- Display comprehensive transaction information with proper formatting
- Add delete and duplicate action buttons (implementation deferred)
- Ensure accessibility compliance with keyboard navigation
- Maintain consistent Juno Design System styling
- Create reusable transaction drawer component for future use

### 1.2 Success Metrics

- Transaction items respond to click/tap interactions
- Drawer opens smoothly from the right side with proper animations
- All transaction details display correctly with proper formatting
- Action buttons are visible and styled consistently
- Component is reusable across different contexts
- Full keyboard accessibility (Escape to close, focus management)
- No accessibility violations in automated testing
- Loading states display when fetching additional data

## 2. User Experience Design

### 2.1 Interaction Flow

1. **Transaction Item Hover**:
   - Background changes to `var(--juno-surface-300)` (existing)
   - Cursor changes to pointer
   - Subtle visual feedback indicating clickability

2. **Transaction Item Click**:
   - Drawer slides in from right side with smooth animation
   - Overlay appears with proper z-index management
   - Focus moves to drawer content

3. **Drawer Display**:
   - Transaction details load immediately if data is sufficient
   - Loading state shows if additional API call is needed
   - All information properly formatted and accessible

4. **Drawer Dismissal**:
   - Click X button in top-right corner
   - Click overlay background
   - Press Escape key
   - Drawer slides out smoothly, focus returns to original transaction item

### 2.2 Visual Design

**Transaction Item Changes**:
- Add `cursor-pointer` to existing hover styles
- Maintain current color indicator, description, date, and amount layout
- No visual changes to the item itself, only interaction behavior

**Drawer Specifications**:
- Slides from right side (default Sheet behavior)
- Default width: 400px on desktop, full width on mobile
- White background with Juno shadow system
- Proper spacing using Juno design tokens
- Close button styled with Juno icon system

## 3. Technical Implementation

### 3.1 Sheet Component Integration

**Installation Requirements**:
```bash
npm install @radix-ui/react-dialog
```

**shadcn/ui Sheet Component**:
- Use existing shadcn/ui Sheet structure from documentation
- Customize with Juno design tokens for consistent styling
- Implement proper TypeScript interfaces
- Add loading state management

**Component Structure**:
```tsx
<Sheet>
  <SheetTrigger asChild>
    <div className="transaction-item"> {/* existing transaction row */} </div>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Transaction Details</SheetTitle>
    </SheetHeader>
    {/* Transaction details content */}
    <SheetFooter>
      {/* Action buttons */}
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### 3.2 Data Management Strategy

**Current Data Assessment**:
Based on industry standards and the existing transaction interface:
- Basic transaction data from list is sufficient for initial display
- Description, amount, date, category are immediately available
- No additional API call needed for basic details view
- Loading states reserved for future enhancements (receipts, notes)

**Data Structure**:
```typescript
interface TransactionDetails {
  id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
  category_name: string;
  category_color?: string;
  // Future fields for additional details
  notes?: string;
  receipt_url?: string;
  payment_method?: string;
  merchant?: string;
}
```

### 3.3 Component Architecture

**TransactionDetailsDrawer Component**:
```tsx
interface TransactionDetailsDrawerProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (transactionId: string) => void;
  onDuplicate?: (transaction: Transaction) => void;
  isLoading?: boolean;
}
```

**State Management**:
- Local component state for drawer open/closed
- Use React's built-in state management (useState)
- No external state management needed initially
- Future enhancement: Consider Zustand for complex interactions

### 3.4 Reusability Design

**Context-Agnostic Component**:
- Accept transaction data via props
- Configurable action buttons (show/hide delete, duplicate)
- Customizable drawer title and content sections
- Support for different trigger components (not just transaction rows)

**Usage Examples**:
```tsx
// In Recent Transactions Card
<TransactionDetailsDrawer
  transaction={transaction}
  isOpen={openDrawerId === transaction.id}
  onClose={() => setOpenDrawerId(null)}
  onDelete={undefined} // Hide delete button in recent transactions
  onDuplicate={handleDuplicate}
/>

// In Full Transactions List (future)
<TransactionDetailsDrawer
  transaction={transaction}
  isOpen={openDrawerId === transaction.id}
  onClose={() => setOpenDrawerId(null)}
  onDelete={handleDelete}
  onDuplicate={handleDuplicate}
/>
```

## 4. Content Specifications

### 4.1 Transaction Details Layout

**Header Section**:
```
Transaction Details
[X Close Button]
```

**Main Content Area**:
```
[Category Color Bar] Pizza delivery from Domino's
                    $28.45
                    Aug 21, 2024

Category: [Category Name with Color Indicator]
Payment Method: [Future Implementation]
Merchant: [Future Implementation]
Notes: [Future Implementation]
Receipt: [Future Implementation]
```

**Content Hierarchy**:
1. **Primary Information** (always visible):
   - Transaction description (large, prominent)
   - Amount (formatted currency, right-aligned)
   - Transaction date (formatted consistently)

2. **Secondary Information** (expandable sections):
   - Category with visual indicator
   - Payment method (placeholder for future)
   - Merchant information (placeholder for future)
   - Transaction notes (placeholder for future)
   - Receipt attachments (placeholder for future)

### 4.2 Content Formatting

**Amount Display**:
- Format: `$XX,XXX.XX` (US currency format)
- Color: `var(--juno-text)` for positive amounts
- Size: Larger than description for visual hierarchy
- Position: Right-aligned

**Date Display**:
- Format: `MMM DD, YYYY` (e.g., "Aug 21, 2024")
- Color: `var(--juno-muted-fg)`
- Size: Smaller than description

**Category Display**:
- Category name with color indicator dot
- Color indicator matches transaction list colors
- Proper spacing and alignment

## 5. Action Buttons Specification

### 5.1 Button Layout

**Footer Section**:
```
[Delete Transaction] [Duplicate Transaction]
```

**Button Specifications**:
- Use Juno Button component with proper variants
- Delete: `variant="destructive"` (red styling)
- Duplicate: `variant="secondary"` (outline styling)
- Both buttons: `size="md"` for consistency
- Full-width buttons on mobile, side-by-side on desktop

### 5.2 Button Behavior (Future Implementation)

**Delete Transaction**:
- Show confirmation dialog before deletion
- Display loading state during API call
- Close drawer after successful deletion
- Show toast notification for success/error
- **Note**: Button visible but non-functional in initial implementation

**Duplicate Transaction**:
- Pre-populate transaction form with existing data
- Change date to current date
- Navigate to transaction creation flow
- **Note**: Button visible but non-functional in initial implementation

## 6. Accessibility Requirements

### 6.1 Keyboard Navigation

**Focus Management**:
- Focus moves to drawer when opened
- Tab navigation within drawer content
- Focus returns to original transaction item when closed
- Escape key closes drawer
- Enter/Space on transaction item opens drawer

**ARIA Attributes**:
- `role="button"` on transaction items
- `aria-label="View transaction details"` on clickable items
- Proper dialog roles for Sheet component
- `aria-expanded` states for drawer trigger
- Screen reader announcements for state changes

### 6.2 Screen Reader Support

**Announcements**:
- "Transaction details dialog opened" when drawer opens
- "Transaction details dialog closed" when drawer closes
- Proper labeling for all interactive elements
- Content structure readable by screen readers

### 6.3 Mobile Accessibility

**Touch Targets**:
- Transaction items have minimum 44px touch target height
- Proper spacing between interactive elements
- Drawer close button easily accessible
- Action buttons sized appropriately for touch

## 7. Styling and Design System Integration

### 7.1 Juno Design Token Usage

**Drawer Styling**:
```css
.transaction-drawer {
  background: var(--juno-surface-50);
  border-left: 1px solid var(--juno-border);
  box-shadow: var(--juno-shadow-lg-with-stroke);
}

.transaction-drawer__header {
  padding: var(--juno-space-6);
  border-bottom: 1px solid var(--juno-border);
  background: var(--juno-surface-100);
}

.transaction-drawer__content {
  padding: var(--juno-space-6);
  background: var(--juno-surface-50);
}

.transaction-drawer__footer {
  padding: var(--juno-space-6);
  border-top: 1px solid var(--juno-border);
  background: var(--juno-surface-100);
}
```

**Transaction Item Updates**:
```css
.transaction-item--clickable {
  cursor: pointer;
  transition: all 150ms ease-out;
}

.transaction-item--clickable:hover {
  background: var(--juno-surface-300);
  transform: translateX(2px);
}

.transaction-item--clickable:focus-visible {
  outline: 2px solid var(--juno-focus-ring);
  outline-offset: 2px;
}
```

### 7.2 Animation Specifications

**Drawer Animations**:
- Slide-in from right: 300ms ease-out
- Overlay fade-in: 200ms ease-out
- Slide-out to right: 250ms ease-in
- Overlay fade-out: 150ms ease-in
- Respect `prefers-reduced-motion`

**Transaction Item Animations**:
- Hover scale: subtle 2px translateX
- Focus ring appearance: immediate
- Smooth transitions for all state changes

## 8. Error Handling and Edge Cases

### 8.1 Data Loading States

**Insufficient Data**:
- Show loading spinner in content area
- Graceful fallback for missing information
- Error states for failed API calls
- Retry mechanisms for network failures

**Empty States**:
- Handle missing transaction descriptions
- Show placeholder for empty categories
- Proper formatting for zero amounts
- Date parsing error handling

### 8.2 Performance Considerations

**Component Optimization**:
- Lazy load drawer content until opened
- Memoize transaction data to prevent re-renders
- Debounce rapid open/close interactions
- Efficient event listener management

**Bundle Size Impact**:
- shadcn/ui Sheet adds ~8KB to bundle
- @radix-ui/react-dialog dependency
- No significant performance impact expected
- Monitor bundle size during implementation

## 9. Implementation Phases

### 9.1 Phase 1: Core Drawer Implementation
- Install and configure shadcn/ui Sheet component
- Create basic TransactionDetailsDrawer component
- Implement click handlers for transaction items
- Add basic styling with Juno design tokens

### 9.2 Phase 2: Content and Formatting
- Implement comprehensive transaction details layout
- Add proper content formatting and typography
- Integrate category color indicators
- Add loading states and error handling

### 9.3 Phase 3: Accessibility and Polish
- Complete keyboard navigation implementation
- Add proper ARIA attributes and screen reader support
- Implement smooth animations and transitions
- Add mobile responsiveness

### 9.4 Phase 4: Actions and Reusability
- Add action buttons (delete, duplicate) with placeholder functionality
- Make component reusable across different contexts
- Add comprehensive prop interfaces
- Create usage documentation

## 10. Success Criteria

- [ ] Transaction items are clickable with proper hover states
- [ ] Drawer opens smoothly from right side with proper animations
- [ ] All transaction details display correctly with Juno styling
- [ ] Action buttons are visible and properly styled
- [ ] Full keyboard accessibility implemented
- [ ] Component works on desktop and mobile devices
- [ ] No accessibility violations in automated testing
- [ ] Component is reusable for future transaction contexts
- [ ] Loading states display appropriately
- [ ] Error handling works correctly
- [ ] Performance impact is minimal
- [ ] Code follows existing project patterns and conventions

## 11. Future Enhancements

### 11.1 Planned Features
- Edit transaction functionality directly in drawer
- Receipt/attachment viewing and upload
- Transaction notes and memos
- Payment method tracking
- Merchant information enrichment
- Transaction categorization tools

### 11.2 Advanced Functionality
- Bulk actions from transaction list
- Transaction splitting capabilities
- Recurring transaction management
- Transaction search and filtering within drawer
- Export individual transaction details

## 12. Dependencies and Integration

### 12.1 External Dependencies
- @radix-ui/react-dialog (new installation required)
- Existing lucide-react for icons
- Current Juno design token system
- Existing Button and other UI components

### 12.2 Internal Dependencies
- Recent Transactions Card component updates
- Transaction data structure consistency
- Juno design system CSS tokens
- Existing TypeScript interfaces

### 12.3 API Considerations
- Current transaction data structure sufficient for initial implementation
- Future API enhancements for additional transaction details
- Error handling for API failures
- Loading state management for async operations

This specification provides a comprehensive foundation for implementing clickable transaction items with a detailed transaction drawer while maintaining consistency with the Juno Design System and ensuring excellent user experience and accessibility.