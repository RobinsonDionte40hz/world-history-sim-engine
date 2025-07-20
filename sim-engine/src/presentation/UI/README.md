# UI Components

This folder contains reusable UI components that can be used throughout the application. These components are designed to be generic and not tied to specific business logic.

## Components

### Navigation
- **Purpose**: Main navigation bar with logo hamburger button
- **Features**: 
  - Logo button that acts as hamburger menu
  - Smooth spin animation on click
  - Configurable navigation items
  - Integrated sidebar functionality
- **Usage**: `import { Navigation } from '../UI'`

### Sidebar
- **Purpose**: Slide-out navigation sidebar
- **Features**:
  - Smooth slide animations
  - Backdrop blur effect
  - Customizable menu items with hover effects
  - Overlay click to close
  - Optional tip section
- **Usage**: `import { Sidebar } from '../UI'`

### ValidationPanel
- **Purpose**: Step-by-step validation feedback display
- **Features**:
  - Collapsible sections
  - Error categorization
  - Progress tracking
  - Fix suggestions
  - Responsive design
- **Usage**: `import { ValidationPanel } from '../UI'`
- **Styles**: Includes ValidationPanel.css

### TestInput
- **Purpose**: Simple input component for testing typing functionality
- **Features**:
  - Real-time value display
  - Character count
  - Minimal styling
- **Usage**: `import { TestInput } from '../UI'`

### IsolatedJSONTextarea
- **Purpose**: JSON input textarea with validation
- **Features**:
  - JSON-specific formatting
  - Character limit display
  - Monospace font
  - Blur event handling
- **Usage**: `import { IsolatedJSONTextarea } from '../UI'`

## Organization Principles

1. **Reusability**: Components should be generic enough to use in multiple contexts
2. **Self-contained**: Each component should include its own styles and dependencies
3. **Configurable**: Components should accept props for customization
4. **Accessible**: Components should follow accessibility best practices
5. **Consistent**: All components should follow the same design patterns

## Import Pattern

All UI components can be imported from the index file:

```javascript
import { Navigation, Sidebar, ValidationPanel } from '../UI';
```

Or individually:

```javascript
import Navigation from '../UI/Navigation';
import Sidebar from '../UI/Sidebar';
```

## Adding New Components

When adding new UI components:

1. Create the component file in this directory
2. Add the export to `index.js`
3. Update this README with component documentation
4. Ensure the component follows the established patterns
5. Include any necessary CSS files