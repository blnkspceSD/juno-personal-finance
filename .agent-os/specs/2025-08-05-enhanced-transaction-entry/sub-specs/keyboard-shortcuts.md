# Keyboard Shortcuts Specification

This is the keyboard shortcuts system implementation for the spec detailed in @.agent-os/specs/2025-08-05-enhanced-transaction-entry/spec.md

> Created: 2025-08-05
> Version: 1.0.0

## Overview

Comprehensive keyboard shortcut system that enables power users to perform transaction entry and editing without mouse interaction. The system provides consistent keyboard navigation across all transaction-related interfaces.

## Keyboard Shortcuts Map

### Global Transaction Shortcuts

| Shortcut | Action | Context | Description |
|----------|--------|---------|-------------|
| `Ctrl/Cmd + N` | New Transaction | Any page | Opens new transaction form |
| `Ctrl/Cmd + S` | Save Transaction | Transaction form | Saves current transaction |
| `Escape` | Cancel/Clear | Transaction form | Cancels editing or clears form |
| `Ctrl/Cmd + Z` | Undo | Transaction form | Undoes last form change |
| `Ctrl/Cmd + Y` | Redo | Transaction form | Redoes last undone change |

### Transaction Form Navigation

| Shortcut | Action | Context | Description |
|----------|--------|---------|-------------|
| `Tab` | Next Field | Form fields | Moves to next form field |
| `Shift + Tab` | Previous Field | Form fields | Moves to previous form field |
| `Enter` | Save/Confirm | Form fields | Saves transaction or confirms selection |
| `Escape` | Cancel | Form fields | Cancels current action |
| `Ctrl/Cmd + A` | Select All | Text inputs | Selects all text in current field |

### Category Selection Shortcuts

| Shortcut | Action | Context | Description |
|----------|--------|---------|-------------|
| `Space` | Open Dropdown | Category field | Opens category dropdown |
| `↑` | Previous Category | Category dropdown | Navigates to previous category |
| `↓` | Next Category | Category dropdown | Navigates to next category |
| `Enter` | Select Category | Category dropdown | Selects highlighted category |
| `Escape` | Close Dropdown | Category dropdown | Closes category dropdown |
| `Home` | First Category | Category dropdown | Jumps to first category |
| `End` | Last Category | Category dropdown | Jumps to last category |
| `PageUp` | Page Up | Category dropdown | Scrolls up one page |
| `PageDown` | Page Down | Category dropdown | Scrolls down one page |
| `A-Z` | Quick Search | Category dropdown | Filters categories by first letter |

### Table/Inline Editing Shortcuts

| Shortcut | Action | Context | Description |
|----------|--------|---------|-------------|
| `Double Click` | Edit Transaction | Table row | Enters inline editing mode |
| `Enter` | Edit/Save | Table cell | Enters edit mode or saves changes |
| `Escape` | Cancel Edit | Editing cell | Cancels inline editing |
| `Tab` | Next Cell | Editing row | Moves to next editable cell |
| `Shift + Tab` | Previous Cell | Editing row | Moves to previous editable cell |
| `Delete` | Delete Transaction | Selected row | Prompts for transaction deletion |
| `F2` | Edit Cell | Table cell | Enters edit mode for focused cell |

### Amount Input Shortcuts

| Shortcut | Action | Context | Description |
|----------|--------|---------|-------------|
| `+` | Addition | Amount field | Performs calculation (e.g., "10+5") |
| `-` | Subtraction | Amount field | Performs calculation (e.g., "20-5") |
| `*` | Multiplication | Amount field | Performs calculation (e.g., "5*3") |
| `/` | Division | Amount field | Performs calculation (e.g., "15/3") |
| `=` | Calculate | Amount field | Executes calculation and shows result |
| `Ctrl/Cmd + C` | Copy Amount | Amount field | Copies formatted amount |
| `Ctrl/Cmd + V` | Paste Amount | Amount field | Pastes and formats amount |

## Technical Implementation

### Keyboard Event Handling

```typescript
interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  handler: (event: KeyboardEvent) => void | Promise<void>;
}

interface ShortcutContext {
  name: string;
  priority: number;
  active: boolean;
  shortcuts: KeyboardShortcut[];
}
```

### Context Management

The keyboard shortcut system uses a context-based approach:

1. **Global Context** - Always active shortcuts (Ctrl+N, Ctrl+S)
2. **Form Context** - Active when transaction form is focused
3. **Table Context** - Active when table has focus
4. **Dropdown Context** - Active when category dropdown is open
5. **Editing Context** - Active during inline editing

### Priority System

Contexts have priority levels to handle overlapping shortcuts:
- **Editing Context**: Priority 100 (highest)
- **Dropdown Context**: Priority 90
- **Form Context**: Priority 80
- **Table Context**: Priority 70
- **Global Context**: Priority 10 (lowest)

### Browser Compatibility

Keyboard shortcuts must work consistently across:
- Chrome/Chromium browsers
- Firefox
- Safari
- Edge
- Mobile browsers with external keyboards

### Platform Differences

Handle platform-specific modifier keys:
- **Windows/Linux**: `Ctrl` key for shortcuts
- **macOS**: `Cmd` key for shortcuts
- **Detection**: Use `navigator.platform` or `navigator.userAgentData`

## Accessibility Considerations

### Screen Reader Support

- Announce keyboard shortcuts through ARIA live regions
- Provide audio feedback for shortcut activation
- Include shortcuts in accessibility help text

### Keyboard-Only Navigation

- Ensure all functionality is accessible via keyboard
- Provide visible focus indicators
- Support logical tab order throughout interface

### Customization

- Allow users to customize keyboard shortcuts
- Provide shortcuts reset to defaults option
- Store preferences in user settings

## Visual Feedback

### Shortcut Hints

- Display keyboard shortcuts in tooltips
- Show shortcut hints in context menus
- Provide keyboard shortcut help overlay (Ctrl+?)

### Visual Indicators

- Highlight focused elements clearly
- Show keyboard navigation state
- Animate shortcut activation feedback

## Testing Requirements

### Unit Tests

- Test individual shortcut handlers
- Verify context switching logic
- Test priority resolution

### Integration Tests

- Test shortcut combinations
- Verify form navigation flows
- Test table editing workflows

### Cross-Browser Tests

- Test shortcuts in all supported browsers
- Verify platform-specific behavior
- Test with various keyboard layouts

### Accessibility Tests

- Test with screen readers
- Verify keyboard-only navigation
- Test high contrast mode compatibility

## Performance Considerations

### Event Delegation

Use event delegation to minimize event listeners:
```typescript
document.addEventListener('keydown', handleGlobalKeydown);
```

### Debouncing

Debounce rapid key presses to prevent duplicate actions:
```typescript
const debouncedHandler = useMemo(
  () => debounce(handler, 50),
  [handler]
);
```

### Memory Management

Clean up event listeners on component unmount:
```typescript
useEffect(() => {
  return () => {
    shortcuts.forEach(shortcut => {
      removeShortcut(shortcut);
    });
  };
}, []);
```

## Success Metrics

- 95% of power users complete transactions without mouse
- Keyboard navigation response time < 50ms
- Zero keyboard shortcut conflicts reported
- 100% accessibility compliance for keyboard navigation
- Cross-browser keyboard compatibility maintained