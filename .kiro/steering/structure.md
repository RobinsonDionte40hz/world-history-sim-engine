# Project Structure

## Overview

The World History Simulation Engine follows **Clean Architecture** principles with clear separation between domain, application, infrastructure, and presentation layers. The system is **turn-based**, **mapless**, and supports **free-form building**.

## Directory Structure

```
world-history-sim-engine/
├── sim-engine/                 # Main application
│   ├── public/                 # Static assets
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/                    # Source code
│   │   ├── domain/             # Core business logic (innermost layer)
│   │   ├── application/        # Use cases and services
│   │   ├── infrastructure/     # External interfaces
│   │   ├── presentation/       # React UI layer
│   │   ├── shared/             # Shared utilities
│   │   ├── template/           # Template system
│   │   ├── test/               # Test utilities and fixtures
│   │   ├── App.js              # Root React component
│   │   ├── App.css             # Global styles
│   │   └── index.js            # Application entry point
│   ├── package.json            # Dependencies and scripts
│   └── README.md               # Project documentation
└── .kiro/                      # Project configuration
    ├── steering/               # System documentation
    └── specs/                  # Feature specifications
```

## Layer Architecture

### Domain Layer (`src/domain/`)
**The innermost layer - pure business logic with no external dependencies**

```
domain/
├── entities/                   # Core business objects
│   ├── Character.js            # Enhanced NPC with LOD tiers, assignments, economic profiles
│   ├── Node.js                 # Abstract location/context with environmental properties
│   ├── Interaction.js          # Character actions with prerequisites and effects
│   ├── Quest.js                # Goal-driven objectives
│   ├── Settlement.js           # Settlement entities with need satisfaction
│   ├── PopulationGroup.js      # Population group management for LOD
│   └── HistoricalEvent.js      # Historical event records
├── services/                   # Domain services
│   ├── MemoryService.js        # Enhanced memory with relationship tracking
│   ├── EvolutionService.js     # Character/world evolution
│   ├── HistoryGenerator.js     # Historical event creation and analysis
│   ├── InteractionResolver.js  # Action resolution
│   ├── WorldBuilder.js         # World construction and preparation service
│   ├── LODManager.js           # Level-of-detail processing
│   ├── AssignmentManager.js    # Character assignment management
│   ├── ValidationService.js    # Pipeline validation
│   └── TurnManager.js          # Turn-based processing coordination
├── value-objects/              # Immutable values
│   ├── Attributes.js           # D&D-style attributes with modifiers
│   ├── Personality.js          # Character traits with age modifiers
│   ├── ConsciousnessSystem.js  # Quantum-inspired consciousness with emotional states
│   ├── EconomicProfile.js      # Character economic data
│   ├── Alignment.js            # Character alignment system
│   ├── Influence.js            # Character influence tracking
│   ├── Prestige.js             # Character prestige system
│   └── LODTier.js              # Level-of-detail tier definitions
└── events/                     # Domain events
    └── SimulationEvents.js     # Simulation event definitions
```

### Application Layer (`src/application/`)
**Use cases and application services - orchestrates domain logic**

```
application/
├── use-cases/                  # Business operations
│   ├── character/              # Character-related use cases
│   │   └── CreateCharacter.js
│   ├── npc/                    # NPC behavior
│   │   └── GenerateBehavior.js
│   ├── simulation/             # Simulation operations
│   │   └── RunTick.js
│   ├── history/                # Historical analysis
│   │   └── AnalyzeHistory.js
│   └── world-builder/          # World construction
│       └── WorldBuilder.js
├── services/                   # Application services
│   ├── SimulationService.js    # Enhanced turn-based simulation engine with comprehensive turn processing
│   ├── TemplateService.js      # Template management with validation and customization
│   ├── ValidationService.js    # Pipeline validation and consistency checking
│   ├── CharacterService.js     # Character management and operations
│   ├── WorldPersistenceService.js # World state persistence and recovery
│   └── EditorStateManager.js   # Editor state management
└── ports/                      # Interface definitions
    └── repositories/           # Repository interfaces
```

### Infrastructure Layer (`src/infrastructure/`)
**External interfaces and implementations**

```
infrastructure/
├── Persistance/                # Data storage (note: typo preserved for compatibility)
│   ├── LocalStorageWorldRepository.js   # World state persistence with checkpoint support
│   └── LocalStorageCharacterRepository.js # Character-specific persistence
├── services/                   # Infrastructure services
│   ├── UnifiedPersistenceService.js     # Centralized persistence management
│   └── SaveFlowService.js      # Save flow coordination
└── external/                   # External service integrations
    ├── NarrativeGenerator.js   # External narrative generation
    └── QuantumSimulator.js     # Quantum consciousness simulation
```

### Presentation Layer (`src/presentation/`)
**React UI components and user interaction**

```
presentation/
├── components/                 # Reusable UI components
│   ├── ConditionalSimulationInterface.js # Adaptive main UI based on world state
│   ├── CharacterEditor.js     # Enhanced character building UI with LOD support
│   ├── InteractionEditor.js   # Interaction design UI with prerequisites
│   ├── NodeEditor.js          # Node creation UI with environmental properties
│   ├── TurnBasedInterface.js  # Turn-by-turn simulation controls
│   ├── TurnCounter.js         # Turn display with history
│   ├── LODSimulationControl.js # Level-of-detail simulation controls
│   ├── SettlementOverview.js  # Settlement management UI
│   ├── AssignmentPanel.js     # Character assignment management
│   └── WorldHistorySimInterface.js # Enhanced history interface
├── contexts/                   # React contexts
│   ├── SimulationContext.js   # Global state management with turn-based controls
│   ├── LODContext.js          # Level-of-detail context
│   ├── NavigationContext.js   # Navigation state management
│   └── WorldContext.js        # World-specific context
├── hooks/                      # Custom React hooks
│   ├── useSimulation.js        # Simulation control hook with turn processing
│   ├── useTemplates.js         # Template management hook with validation
│   ├── useWorldBuilder.js      # World building hook with pipeline validation
│   ├── useAssignmentManager.js # Character assignment management
│   └── useAutoSave.js          # Automatic save functionality
├── pages/                      # Application pages
│   ├── MainPage.js            # Primary application page
│   ├── HomePage.js            # Landing page
│   ├── FeaturesPage.js        # Feature showcase
│   └── WorldBuilderLandingPage.js # Builder introduction
└── UI/                        # UI utilities
    ├── Navigation.js          # App navigation
    └── Layout.js              # Page layouts
```

### Template System (`src/template/`)
**Template management for all component types**

```
template/
├── TemplateManager.js          # Core template operations
├── TemplateTypes.js            # Template type definitions
└── templates/                  # Pre-built templates
    ├── characters/             # Character archetypes
    ├── nodes/                  # Location templates
    ├── interactions/           # Action templates
    └── worlds/                 # Complete world templates
```

### Shared (`src/shared/`)
**Cross-cutting concerns and utilities**

```
shared/
├── constants/                  # Application constants
│   └── GameConstants.js       # Game-specific values
├── types/                      # TypeScript/JSDoc types
│   └── index.js               # Type definitions
└── utils/                      # Utility functions
    ├── validation.js          # Validation helpers
    └── random.js              # Random generation
```

### Test (`src/test/`)
**Testing utilities and integration tests**

```
test/
├── fixtures/                   # Test data
│   ├── characters.js
│   ├── nodes.js
│   └── worlds.js
├── integration/                # Integration tests
│   └── turn-counter-integration-working.test.js
└── utils/                      # Test helpers
    └── testHelpers.js
```

## Key Files

### Core Application Files
- `App.js` - Root React component, sets up routing
- `index.js` - Application entry point, renders React app
- `SimulationContext.js` - Global state management
- `SimulationService.js` - Turn-based simulation engine
- `WorldBuilder.js` - World construction service

### Configuration Files
- `package.json` - Dependencies and scripts
- `jest.config.js` - Test configuration
- `tailwind.config.js` - Styling configuration

## Data Flow

### Building Flow (Free-Form)
1. User creates components in any order via UI
2. Components saved to `WorldBuilder` service
3. Templates can be saved via `TemplateManager`
4. State persisted to `LocalStorage`
5. Validation shows missing requirements

### Simulation Flow (Turn-Based)
1. User initiates turn via UI
2. `SimulationService.processTurn()` executes
3. Characters perform interactions
4. Events resolved by domain services
5. History recorded by `HistoryGenerator`
6. State updated and persisted
7. UI reflects new world state

## Design Patterns

### Clean Architecture
- **Dependency Rule**: Dependencies point inward
- **Layer Isolation**: Each layer only knows about inner layers
- **Interface Segregation**: Narrow, focused interfaces
- **Dependency Injection**: Services injected, not instantiated

### Domain-Driven Design
- **Entities**: Core business objects with identity
- **Value Objects**: Immutable values
- **Domain Services**: Business logic operations
- **Aggregates**: Consistency boundaries

### React Patterns
- **Hooks**: Custom hooks for state logic
- **Context**: Global state management
- **Component Composition**: Building complex UIs from simple parts
- **Conditional Rendering**: Adaptive interfaces

## Testing Strategy

### Unit Tests
- Domain entities and value objects
- Domain services
- Application use cases
- Utility functions

### Integration Tests
- Turn processing flow
- World building operations
- Template management
- Persistence operations

### UI Tests
- Component rendering
- User interactions
- State updates
- Navigation flow

## Performance Considerations

### Optimization Points
- **Turn Processing**: Batch updates, efficient algorithms
- **History Storage**: Pruning old records, compression
- **Template Loading**: Lazy loading, caching
- **React Rendering**: Memoization, virtual DOM efficiency

### Scalability
- **Character Limits**: Manageable NPC populations
- **Node Complexity**: Balanced interaction density
- **History Depth**: Configurable retention periods
- **Template Library**: Indexed for fast retrieval

## Future Architecture Considerations

### Planned Enhancements
- **Web Workers**: Background turn processing
- **IndexedDB**: Larger storage capacity
- **API Layer**: REST/GraphQL endpoints
- **Plugin System**: Extensibility framework

### Potential Integrations
- **AI Services**: LLM narrative generation
- **Export Systems**: Various output formats
- **Collaboration**: Multi-user support
- **Analytics**: Advanced history analysis

## Conclusion

The architecture is designed for:
- **Maintainability**: Clean separation of concerns
- **Extensibility**: Easy to add new features
- **Testability**: Comprehensive test coverage
- **Performance**: Optimized for simulation scale
- **Flexibility**: Supports diverse use cases

The turn-based, mapless, free-building design provides maximum creative freedom while maintaining architectural integrity and simulation depth.