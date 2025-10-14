I'll search through your project knowledge to understand the current state of your codebase and then provide an updated version of the AI Development Guide.Based on my review of your codebase, I'll provide an updated version of the AI Development Guide that reflects the current state of your World History Simulation Engine:

# World History Simulation Engine - AI Development Guide (Updated)

## Project Overview

This is a **turn-based, mapless** historical simulation engine with strict Clean Architecture implementation. The system provides complete creative freedom through a flexible building system where users can construct worlds in any order they prefer.

## Core Design Principles

### Turn-Based Simulation
- **Manual Time Progression**: Users control when time advances
- **Turn Resolution**: Each turn processes all character actions and events
- **Historical Recording**: Every turn creates permanent historical records
- **No Real-Time Pressure**: Think strategically about each turn

### Mapless Architecture  
- **Abstract Nodes**: Locations are conceptual contexts, not spatial coordinates
- **Relationship-Based**: Connections through meaning, not distance
- **Flexible Topology**: Nodes connect via trade, politics, culture
- **Context Over Position**: Environmental and cultural properties matter more than geography

### Free Building Philosophy
- **Start Anywhere**: Begin with any component - characters, nodes, or interactions
- **No Prescribed Order**: Build components in any sequence
- **Template Everything**: Save any component as a reusable template
- **Validation Feedback**: Clear indicators of what's needed for simulation

## Architecture Layers

### Domain Layer (`src/domain/`)
Core business logic with zero external dependencies:
- **Entities**: Character, Node, Interaction, Quest, Race, Settlement
- **Value Objects**: Attributes, Personality, Prerequisites, Influence
- **Domain Services**: ConsciousnessService, EvolutionService, HistoryGenerator, WorldBuilder
- **Events**: Historical event recording and processing

### Application Layer (`src/application/`)
Use cases and application services:
- **Services**: SimulationService, TemplateService, MemoryService
- **Use Cases**: NPC behavior generation, turn processing, world validation
- **Orchestration**: Multi-service coordination logic

### Infrastructure Layer (`src/infrastructure/`)
External interfaces and persistence:
- **LocalStorageWorldRepository**: World state persistence
- **TemplateRepository**: Template storage and retrieval
- **Adapters**: External system integration points

### Presentation Layer (`src/presentation/`)
React UI and state management:
- **Contexts**: SimulationContext, WorldContext, NavigationContext
- **Components**: InteractionEditor, EncounterEditor, DialoguePatterns
- **Hooks**: useSimulation, useWorldBuilder, useTextTemplating
- **Pages**: Features page, documentation pages

## Critical Systems

### 1. Dual Template System

#### Structural Templates (Template Library)
- Character attribute configurations  
- Node environmental properties
- Interaction frameworks
- World structural components
- Managed via `TemplateManager.js`

#### Text Templating (Editor Integration)
- **Syntax**: `{{placeholder}}` for dynamic content
- **Conditionals**: `{{ character.reputation > 10}}...{{/if}}`
- **Random Selection**: `{{random:option1,option2,option3}}`
- **Real-Time Preview**: See resolved content as you type
- **Contextual Suggestions**: Smart placeholder recommendations
- **Dialogue Patterns**: Quick-insert templates via `DialoguePatternLibrary.js`
- Integrated directly into `InteractionEditor` and `EncounterEditor`

### 2. Consciousness & Character Systems

```javascript
// Quantum-inspired consciousness model
const character = new Character({
  consciousness: { 
    frequency: 40, // Gamma baseline (40Hz)
    coherence: 0.8  // Resonance calculation factor
  },
  attributes: { // D&D attributes with modifiers
    strength: 15,
    dexterity: 12,
    constitution: 14,
    intelligence: 13,
    wisdom: 11,
    charisma: 10
  },
  personality: {
    traits: [
      { id: 'empathy', intensity: 0.7 },
      { id: 'aggression', intensity: 0.3 }
    ]
  },
  assignments: {
    nodes: new Set(['node1']),
    interactions: new Set(['interact1'])
  }
});
```

### 3. Settlement & Civilization Systems

Recent additions include comprehensive settlement modeling:
- **Government**: Types, leadership, policies, laws
- **Economy**: Currency, trade, markets, taxes
- **Culture**: Traits, traditions, cultural evolution
- **Resources**: Production, consumption, storage
- **Buildings**: Development trees with prerequisites
- **Population**: Composition, growth, migration
- **Relationships**: Diplomatic, trade, conflict tracking

### 4. Level of Detail (LOD) System

Performance optimization for large-scale simulations:
- **Hero NPCs**: Full consciousness simulation, individual processing
- **Population Groups**: Statistical modeling with sampling
- **Background Demographics**: Pure aggregate tracking
- Managed by `LODManager.js` and `PopulationGroupService.js`

### 5. Need Satisfaction Cascades

Economic and social dynamics system:
- **Basic Needs**: Food, water, shelter tracking
- **Cascading Effects**: Shortages create multiplying problems
- **Investment Effects**: Infrastructure improvements affect satisfaction
- Integration with `BasicNeedsService.js`

## Development Workflows

### Primary Test Runners
```bash
# Turn-based functionality test suite (RECOMMENDED)
node run-turn-based-tests.js

# Quick validation of core systems
node validate-fixes.js

# Full Jest test suite
npm test

# Integration tests (critical for complex workflows)
npm test -- --testPathPattern=integration

# Specific feature validation
node validate-task15.js
```

### Debug Utilities
```bash
# Character system debugging
node debug-character-creation.js

# Economic system validation
node debug-investment-effects.js

# Family/relationship debugging  
node debug-procreation.js

# Turn processing analysis
node debug-turn-processing.js
```

### Test Organization
- **Unit Tests**: Domain entities, value objects, services
- **Integration Tests**: Turn processing, world building, persistence
- **UI Tests**: Component rendering, user interactions
- **Performance Tests**: Large-scale character processing, LOD transitions

## Key Services Reference

### Core Simulation
- `SimulationService.js` - Main simulation orchestration
- `TurnManager.js` - Turn-based progression and history
- `HistoryGenerator.js` - Event and narrative generation
- `BasicNeedsService.js` - Need satisfaction calculations

### World Building
- `WorldBuilder.js` - World construction service (no longer enforces phases)
- `WorldValidator.js` - Validation logic and requirements
- `AssignmentManager.js` - Character/node/interaction assignments
- `SettlementDevelopmentService.js` - Settlement progression

### Template & Content
- `TemplateManager.js` - Structural template management
- `TextTemplateEngine.js` - Dynamic text resolution
- `DialoguePatternLibrary.js` - Dialogue pattern collection
- `EditorContextService.js` - Context-aware suggestions

### Character & AI
- `ConsciousnessService.js` - Consciousness calculations
- `MemoryService.js` - Character memory and relationships
- `PersonalityProfile.js` - Personality evolution
- `GenerateBehavior.js` - NPC autonomous behavior

### Performance & Scale
- `LODManager.js` - Level of detail processing
- `PopulationGroupService.js` - Group character management
- `CrossSettlementService.js` - Inter-settlement dynamics

## Project Conventions

### Entity Initialization
```javascript
// Nodes are abstract contexts
const node = new Node({
  type: 'settlement',
  environmentalProperties: {
    climate: 'temperate',
    season: 'spring',
    prosperous: true,
    crowded: false
  },
  culturalContext: {
    language: 'common',
    traditions: ['harvest_festival']
  },
  resourceAvailability: {
    food: 'abundant',
    water: 'sufficient',
    materials: 'scarce'
  }
});
```

### Service Patterns
```javascript
// Dependency injection with clean boundaries
class SimulationService {
  constructor(
    worldBuilder,      // Domain service
    historyGenerator,  // Domain service  
    turnManager,       // Application service
    repository         // Infrastructure service
  ) {
    // Services only depend on inner or same layers
  }
}
```

### Testing Patterns
```javascript
// Integration test example
describe('Turn Processing Integration', () => {
  it('should process complete turn with all systems', async () => {
    // Arrange: Create world with all components
    // Act: Process turn
    // Assert: Verify all systems updated correctly
  });
});
```

## Recent Developments (September 2025)

### Valley of Echoes Demo Implementation
- **Multi-Settlement Support**: Extended Settlement entity with districts
- **LOD Performance**: 3-tier character processing system
- **Cross-Settlement Dynamics**: Diplomacy, trade, warfare
- **Development Trees**: Prerequisite-based progression
- **Population Groups**: Statistical character modeling

### Text Templating Enhancement
- **Editor Integration**: Built directly into interaction/encounter editors
- **Dialogue Patterns**: Pre-built conversation templates
- **Real-Time Preview**: Instant placeholder resolution
- **Contextual Awareness**: Smart suggestions based on available data
- **Documentation**: Comprehensive guides and troubleshooting

### Performance Optimizations
- **React.memo**: Component memoization for large lists
- **Batch Processing**: Turn management optimization
- **Virtual Scrolling**: UI performance for large datasets
- **Memory Management**: Efficient tier transitions in LOD
- **Cache Optimization**: Improved template and calculation caching

## Common Integration Patterns

### World Building Flow
```javascript
// Free-form world building (no prescribed order)
const world = worldBuilder.createWorld(name, description);
const node = worldBuilder.addNode(nodeData);
const character = worldBuilder.addCharacter(characterData);
const interaction = worldBuilder.addInteraction(interactionData);
// Validate when ready
const validation = worldValidator.validate(world);
```

### Turn Processing
```javascript
// Turn-based simulation cycle
await simulationService.startSimulation(world);
const turnResult = await simulationService.processTurn();
// turnResult includes events, changes, summaries
const history = historyGenerator.generateHistory(turnResult);
```

### Template Usage
```javascript
// Structural templates
const template = templateManager.saveAsTemplate(character, 'Warrior');
const newCharacter = templateManager.applyTemplate('Warrior');

// Text templating in editors
const text = "Welcome to {{node.name}}, {{character.name}}!";
const resolved = textTemplateEngine.resolve(text, context);
```

## External Dependencies

- **React 18.2**: Hooks, contexts, modern patterns
- **React Router v6**: Navigation and routing
- **Redux Toolkit 2.8.2**: State management (optional usage)
- **D3.js**: Timeline and network visualizations
- **Lucide React**: Icon library
- **Tailwind CSS**: Styling with dark mode
- **Jest**: Testing framework
- **LocalStorage**: Browser persistence

## Documentation Resources

### User Guides
- `docs/TextTemplatingGuide.md` - Complete text templating guide
- `docs/DialoguePatternsReference.md` - Dialogue pattern examples
- `docs/TextTemplatingTroubleshooting.md` - Common issues
- `docs/TextTemplatingMigrationGuide.md` - System transition guide
- `docs/TextTemplatingBestPractices.md` - Optimization strategies

### Technical Documentation
- `docs/LargeScaleEmotionalPerformance.md` - Performance optimization
- `docs/WorldSaveManager.md` - Persistence system
- `specs/001-valley-of-echoes-demo/` - Feature specifications
- `.kiro/steering/` - System architecture documentation

## Key Architectural Files

When understanding specific features, reference these files:
- `src/presentation/contexts/SimulationContext.js` - Global simulation state
- `src/domain/services/WorldBuilder.js` - World construction (no pipeline enforcement)
- `src/domain/entities/Character.js` - Complex character modeling
- `src/domain/entities/Settlement.js` - Settlement systems
- `src/domain/services/TextTemplateEngine.js` - Dynamic content
- `src/application/services/DialoguePatternLibrary.js` - Dialogue templates
- `src/domain/services/LODManager.js` - Performance scaling
- `src/domain/services/BasicNeedsService.js` - Economic dynamics

## Performance Considerations

### Scalability Targets
- **1,000+ NPCs**: Smooth performance with LOD system
- **100+ Settlements**: Multi-settlement management
- **10,000+ Interactions**: Per simulation session
- **Infinite History**: Pruning and archival strategies

### Optimization Strategies
- Level of Detail (LOD) for character processing
- Batch turn processing for efficiency
- Memory pooling for frequent allocations
- Lazy loading for template libraries
- Virtual scrolling for large UI lists

## Development Philosophy

1. **User Freedom First**: No prescribed workflows or forced patterns
2. **Clean Architecture**: Strict layer separation and dependency rules
3. **Test-Driven**: Comprehensive test coverage for reliability
4. **Performance-Conscious**: Scale to thousands of NPCs
5. **Documentation-Rich**: Clear guides for all features
6. **Template Everything**: Maximum reusability and sharing

## Current Focus Areas

- **Settlement Dynamics**: Expanding civilization modeling
- **Performance Scaling**: Optimizing for larger simulations
- **Text Templating**: Enhancing dynamic content creation
- **Historical Analysis**: Advanced data visualization tools
- **Cross-Settlement**: Inter-civilization relationships

Remember: This is a living system under active development. Features evolve based on user needs while maintaining architectural integrity and the core philosophy of creative freedom through turn-based, mapless simulation.