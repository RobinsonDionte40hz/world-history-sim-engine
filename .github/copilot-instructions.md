# World History Simulation Engine - AI Development Guide

## Project Architecture

This is a **mapless** historical simulation engine with a strict Clean Architecture implementation. The codebase is organized around domain-driven design with clear separation of concerns:

- **Domain Layer** (`src/domain/`): Core business logic, entities (Character, Node, Interaction), value objects, and domain services
- **Application Layer** (`src/application/`): Use cases, application services, and orchestration logic  
- **Infrastructure Layer** (`src/infrastructure/`): External interfaces, persistence (LocalStorage), and adapters
- **Presentation Layer** (`src/presentation/`): React components, contexts (SimulationContext, WorldContext), hooks, and UI

## Critical Architectural Patterns

### 1. World Building Pipeline Enforcement
The system enforces a **mandatory preparation pipeline** between world building and simulation:
- `WorldBuilder.js` prepares worlds through 5 phases: Foundation → Locations → Capabilities → Actors → Assignments
- `SimulationContext.js` only accepts "prepared worlds" via `acceptPreparedWorld()` method
- `PipelineValidationService.js` tracks context transitions and validates readiness
- Never bypass this pipeline - simulation requires prepared world data

### 2. Mapless Node System
Nodes are **abstract contexts**, not geographic locations:
- No coordinates or positioning - relationships define connections
- Environmental properties affect behavior (climate, resources, culture)
- Characters are assigned to nodes, not positioned on maps
- Navigation is conceptual through `NavigationService.js`

### 3. Consciousness-Driven Characters
Characters use a quantum-inspired consciousness model:
- `consciousness.frequency` and `consciousness.coherence` affect decision-making
- D&D attributes (STR, DEX, CON, INT, WIS, CHA) with modifiers
- `MemoryService.js` tracks interactions and relationships
- Personalities evolve through `PersonalityProfile.js`

### 4. Text Templating Engine
Dynamic content generation with `{{placeholder}}` syntax:
- Integrated directly into editors (InteractionEditor, EncounterEditor)
- Supports conditionals: `{{#if character.reputation > 10}}...{{/if}}`
- Random selections: `{{random:option1,option2,option3}}`
- Context-aware suggestions via `EditorContextService.js`

## Development Workflows

### Testing Strategy
```bash
# Primary test runner for turn-based functionality
node run-turn-based-tests.js

# Quick validation of core systems
node validate-fixes.js

# Full test suite
npm test

# Integration tests (important for complex workflows)
npm test -- --testPathPattern=integration
```

### Debug Utilities
- `debug-character-creation.js` - Character system debugging
- `debug-investment-effects.js` - Economic system validation  
- `debug-procreation.js` - Family/relationship debugging
- `validate-task15.js` - Specific feature validation

### Key Services to Understand

**Core Simulation:**
- `SimulationService.js` - Main simulation orchestration
- `TurnManager.js` - Turn-based progression logic
- `HistoryGenerator.js` - Event and narrative generation

**World Building:**
- `WorldBuilder.js` - 5-phase world preparation pipeline
- `WorldValidator.js` - Validation logic and rules
- `AssignmentManager.js` - Character/node/interaction assignments

**Template Systems:**
- `TemplateManager.js` - Structural templates (characters, nodes, interactions)
- `TextTemplateEngine.js` - Dynamic text with placeholder resolution
- `DialoguePatternLibrary.js` - Common dialogue patterns

## Project-Specific Conventions

### Entity Patterns
```javascript
// Characters have complex initialization with consciousness
const character = new Character({
  consciousness: { frequency: 0.7, coherence: 0.8 },
  attributes: { strength: 15, dexterity: 12 /* ... */ },
  assignments: { nodes: new Set(['node1']), interactions: new Set(['interact1']) }
});

// Nodes are abstract contexts, not locations
const node = new Node({
  type: 'settlement',
  environmentalProperties: { climate: 'temperate', season: 'spring' },
  culturalContext: { language: 'common', traditions: ['harvest_festival'] }
});
```

### Service Dependencies
Services follow dependency injection patterns:
- Domain services depend only on other domain services
- Application services can depend on domain services
- Presentation layer uses contexts and hooks
- Always validate pipeline readiness before simulation

### Text Templating Integration
```javascript
// In editors, text templating is built-in
const template = "{{character.name}} greets you warmly.";
const resolved = textTemplateEngine.resolve(template, { character, node, world });

// Conditional content
const template = "{{#if character.reputation > 10}}The guard recognizes you{{/if}}";
```

### Assignment System
Everything uses assignment patterns:
- Characters assigned to nodes via `assignments.nodes`
- Interactions assigned to characters via `assignments.interactions`
- Track assignments in both directions for validation

## Common Integration Points

### Context Usage
- `SimulationContext` for simulation state and turn management
- `WorldContext` for world building operations  
- `NavigationContext` for UI navigation between phases

### Validation Flows
- Always call `WorldValidator.validate()` before simulation
- Use `PipelineValidationService` to ensure proper context transitions
- Check `simulationReadiness` status before allowing simulation start

### Template Operations
- Structural templates via `TemplateManager` for reusable world components
- Text templates via `TextTemplateEngine` for dynamic content
- Both systems are context-aware and validate data

## External Dependencies

- **React 18.2** with modern hooks patterns
- **D3.js** for visualizations (timeline, network graphs)
- **LocalStorage** for persistence (no backend database)
- **Tailwind CSS** with dark mode support
- **Jest** for testing with integration test focus

## Recent Development: Valley of Echoes Demo (September 2025)

### Level of Detail (LOD) System
New 3-tier character processing system for scalable NPC management:
- **Hero NPCs**: Full consciousness simulation, individual event processing
- **Population Groups**: Statistical modeling with sampling capabilities
- **Background Demographics**: Pure aggregate tracking for performance

Key components:
- `LODManager.js` - Character tier processing and promotion/demotion
- `PopulationGroupService.js` - Group-level character management
- `PopulationGroup.js` entity - Aggregate character statistics

### Multi-Settlement Architecture
Extended Settlement.js entity to support:
- Multi-node settlement structure (administrative, economic, military districts)
- Settlement governance systems (democratic vs. hierarchical)
- Development trees with prerequisite-based upgrades
- Cross-settlement relationship management

Key components:
- `CrossSettlementService.js` - Inter-settlement diplomacy, trade, conflict
- `SettlementDevelopmentService.js` - Development tree management
- `SettlementGovernance.js` value object - Political system modeling

### Performance Optimizations
- React.memo patterns for large character lists
- Batch processing for turn management
- Memory management for tier transitions
- Virtual scrolling for UI performance

### Integration Points
- LOD system integrates with existing quest, prestige, and alignment systems
- Cross-settlement quests with multi-settlement consequences
- Template system extensions for population groups and settlement content
- Clean architecture maintained throughout new systems

## Key Files for Context

When working with specific features, reference these architectural anchors:
- `src/presentation/contexts/SimulationContext.js` - Simulation state management
- `src/domain/services/WorldBuilder.js` - World preparation pipeline
- `src/domain/entities/Character.js` - Complex character modeling
- `src/domain/services/TextTemplateEngine.js` - Dynamic content system
- `docs/TextTemplatingGuide.md` - Text templating patterns and usage
- `specs/001-valley-of-echoes-demo/` - Complete Valley of Echoes implementation plan