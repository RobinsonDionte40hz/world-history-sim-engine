# Project Structure

## Clean Architecture Organization

The project follows clean architecture principles with clear separation of concerns:

```
sim-engine/
├── src/
│   ├── application/         # Use cases and business logic
│   │   └── use-cases/      # Application-specific business rules
│   ├── domain/             # Core business entities and rules
│   │   ├── entities/       # Core domain objects
│   │   ├── events/         # Domain events
│   │   ├── services/       # Domain services
│   │   └── value-objects/  # Immutable value objects
│   ├── infrastructure/     # External services and persistence
│   │   ├── external/       # External API integrations
│   │   └── Persistance/    # Data storage implementations
│   ├── presentation/       # UI components and user interactions
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── features/       # Feature-specific components
│   │   ├── hooks/          # Custom React hooks
│   │   └── pages/          # Page-level components
│   ├── shared/            # Shared utilities and constants
│   │   ├── constants/      # Application constants
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── template/          # Template system for content generation
│   └── test/              # Integration and test utilities
├── public/                # Static assets
├── build/                 # Production build output
└── node_modules/          # Dependencies
```

## Architecture Principles

### Domain-Driven Design
- **Domain Layer** - Core business logic independent of external concerns
- **Application Layer** - Orchestrates domain objects to fulfill use cases
- **Infrastructure Layer** - Handles external dependencies and persistence
- **Presentation Layer** - User interface and interaction handling

### Key Conventions
- **Entities** - Core business objects with identity
- **Value Objects** - Immutable objects representing concepts
- **Services** - Domain logic that doesn't belong to entities
- **Use Cases** - Application-specific business rules
- **Events** - Domain events for decoupled communication

### Import Path Aliases
```typescript
@/*              // Root src directory
@/components/*   // Reusable UI components
@/systems/*      // System-level modules
@/hooks/*        // Custom React hooks
@/utils/*        // Utility functions
@/context/*      // React contexts
@/styles/*       // Styling files
@/assets/*       // Static assets
```

## File Naming Conventions
- **Components** - PascalCase (e.g., `CharacterCard.js`)
- **Hooks** - camelCase with 'use' prefix (e.g., `useSimulation.js`)
- **Services** - PascalCase (e.g., `CharacterService.js`)
- **Types** - PascalCase interfaces/types (e.g., `Character.ts`)
- **Constants** - UPPER_SNAKE_CASE (e.g., `SIMULATION_CONSTANTS.js`)

## Template System
The `/template` directory contains the flexible content generation system:
- **TemplateManager** - Orchestrates template operations
- **TemplateGenerator** - Creates content from templates
- **TemplateValidator** - Ensures template integrity
- **TemplateTypes** - Type definitions for templates