# World History Simulation Engine

## Overview

The World History Simulation Engine is a sophisticated turn-based, mapless simulation platform for creating dynamic historical worlds with emergent storytelling. It provides complete creative freedom through a flexible building system where users can construct worlds in any order they prefer.

## Core Design Principles

### Turn-Based Simulation
- **Manual Time Progression**: Users control when time advances via `processTurn()`
- **Turn Resolution**: Each turn processes all character actions and events
- **Historical Recording**: Every turn creates permanent historical records
- **No Real-Time Pressure**: Think strategically about each turn
- **Turn Summaries**: Comprehensive analysis of each turn's changes and events

### Mapless Architecture
- **Abstract Nodes**: Locations are conceptual contexts, not spatial coordinates
- **Relationship-Based**: Connections through meaning, not distance
- **Flexible Topology**: Nodes connect via trade, politics, culture, etc.
- **Context Over Position**: Environmental and cultural properties matter more than location

### Free Building System
- **Start Anywhere**: Begin with any component type
- **No Prescribed Order**: Build characters, nodes, or interactions in any sequence
- **Template Everything**: Save any component as a reusable template
- **Validation Feedback**: Clear indicators of what's needed for simulation
- **Pipeline Validation**: Comprehensive checks before simulation can begin

### Capability-Driven Characters
- **Defined by Actions**: Characters are what they can DO
- **Interaction Assignments**: Capabilities determined by assigned interactions
- **Dynamic Growth**: Gain new capabilities through play
- **Context-Sensitive**: Available actions depend on current node
- **LOD Support**: Characters can be processed at different levels of detail

## System Architecture

### Domain Layer
Core business entities and logic:
- **Character**: Enhanced with LOD tiers, assignments, and economic profiles
- **Node**: Abstract locations with environmental properties and character assignments
- **Interaction**: Actions with prerequisites and effects
- **WorldBuilder**: Service for constructing and preparing worlds for simulation
- **HistoryGenerator**: Creates historical records and event analysis
- **ConsciousnessSystem**: Quantum-inspired consciousness with emotional states
- **MemoryService**: Enhanced memory with relationship tracking and significance filtering

### Application Layer
Use cases and services:
- **SimulationService**: Turn-based simulation engine with comprehensive turn processing
- **TemplateService**: Template management with validation and customization
- **MemoryService**: Character memory systems with emotional context
- **EvolutionService**: Character and world development over time
- **LODManager**: Level-of-detail processing for large-scale simulations
- **ValidationService**: Pipeline validation and consistency checking

### Infrastructure Layer
External interfaces and persistence:
- **LocalStorageWorldRepository**: World state persistence with checkpoint support
- **LocalStorageRepository**: General data persistence
- **TemplateRepository**: Template storage with versioning
- **UnifiedPersistenceService**: Centralized persistence management

### Presentation Layer
React UI components and hooks:
- **SimulationContext**: Global state management with turn-based controls
- **useWorldBuilder**: World construction hook with validation feedback
- **useSimulation**: Simulation control hook with turn processing
- **ConditionalSimulationInterface**: Adaptive UI based on world state
- **LODSimulationControl**: Level-of-detail simulation controls
- **TurnBasedInterface**: Turn-by-turn simulation management

## Building Worlds

### Minimum Requirements
Before simulation can begin, ensure:
1. **World exists**: Name and description defined
2. **At least one node**: Abstract location created
3. **At least one character**: NPC with consciousness
4. **At least one interaction**: Action definition
5. **All nodes populated**: Every node has assigned characters
6. **All characters capable**: Every character has assigned interactions

### Component Types

#### Nodes (Abstract Locations)
```javascript
{
  id: "node_id",
  name: "Market Square",
  type: "marketplace",
  description: "Bustling center of commerce",
  environmentalProperties: {
    crowded: true,
    noisy: true,
    prosperous: true
  },
  resourceAvailability: {
    goods: "abundant",
    information: "flowing",
    gold: "circulating"
  },
  culturalContext: {
    language: "common",
    customs: "mercantile",
    law: "guild-enforced"
  },
  assignedCharacters: ["char1", "char2"]
}
```

#### Characters (Conscious NPCs)
```javascript
{
  id: "char_id",
  name: "Elena the Merchant",
  lodTier: "hero", // hero, important, background, group
  consciousness: {
    baseFrequency: 7.5,        // 3-15 Hz range
    currentFrequency: 8.2,     // Current state
    emotionalCoherence: 0.8,   // 0.2-1.0 range
    emotionalState: "content", // Current emotional state
    emotionalModifiers: new Map() // Temporary emotional effects
  },
  attributes: {
    strength: { score: 10, modifier: 0 },
    dexterity: { score: 14, modifier: 2 },
    constitution: { score: 12, modifier: 1 },
    intelligence: { score: 16, modifier: 3 },
    wisdom: { score: 13, modifier: 1 },
    charisma: { score: 15, modifier: 2 }
  },
  personality: {
    aggression: 0.2,
    curiosity: 0.8,
    empathy: 0.6
  },
  assignments: {
    nodes: new Set(["market_square"]),
    interactions: new Set(["trade", "negotiate", "gossip"]),
    settlements: new Set(["ironhold"]),
    factions: new Set(["merchants_guild"])
  },
  economicProfile: {
    wealth: 150,
    investments: [],
    riskTolerance: 0.6
  },
  relationships: new Map(), // Enhanced relationship tracking
  decisionHistory: [], // Memory system integration
  goals: [] // Active character goals
}
```

#### Interactions (Character Actions)
```javascript
{
  id: "interaction_id",
  name: "Negotiate Deal",
  type: "social",
  description: "Attempt to broker a trade agreement",
  requirements: {
    attributes: { charisma: 12 },
    skills: ["persuasion"],
    nodeType: ["marketplace", "tavern"]
  },
  effects: {
    success: {
      gold: "+10",
      reputation: "+2",
      relationship: "improve"
    },
    failure: {
      reputation: "-1",
      mood: "-5"
    }
  }
}
```

## Template System

### Template Types
- **World Templates**: Complete world configurations
- **Node Templates**: Reusable location patterns
- **Character Templates**: NPC archetypes
- **Interaction Templates**: Action patterns
- **Composite Templates**: Multi-component bundles

### Template Operations
```javascript
// Save current configuration as template
templateManager.saveAsTemplate({
  type: 'character',
  name: 'Merchant Archetype',
  description: 'Template for merchant NPCs',
  data: characterConfig
});

// Load from template
const character = templateManager.instantiateTemplate(
  'character',
  'merchant_archetype_id',
  { name: 'Custom Name' }  // Overrides
);

// List available templates
const templates = templateManager.getTemplatesByType('node');
```

## Turn-Based Simulation

### Turn Processing
Each turn executes the following phases:
1. **Validation**: Check world state integrity before processing
2. **Character Actions**: NPCs perform assigned interactions based on LOD tier
3. **Event Resolution**: Process outcomes and consequences
4. **State Updates**: Apply effects to characters, nodes, and settlements
5. **History Recording**: Log events to historical record with significance scoring
6. **Evolution**: Update consciousness, relationships, resources, and need satisfaction
7. **Turn Summary**: Generate comprehensive summary of changes and events

### Enhanced Turn Control
```javascript
// Process single turn with comprehensive feedback
const turnResult = simulationService.processTurn();
// Returns: { worldState, turnSummary, success }

// Get detailed turn history with filtering
const history = simulationService.getTurnHistory(10); // Last 10 turns

// Get latest turn summary
const summary = simulationService.getLatestTurnSummary();

// Analyze historical patterns with enhanced metrics
const analysis = simulationService.analyzeHistory({
  entityType: 'character',
  timeRange: { start: 0, end: 100 },
  metrics: ['relationships', 'achievements', 'consciousness', 'needSatisfaction']
});

// Check if simulation can start (pipeline validation)
const canStart = simulationService.canStart();
// Returns: { canStart: boolean, reason: string }
```

### Consciousness System Refactor
The consciousness system has been refactored for performance and behavioral depth:

#### Event-Driven Updates
- Consciousness parameters only update on significant events (threshold: 0.3)
- Cached behavioral states reduce computational overhead by 90%
- Significance-based memory storage prevents memory bloat

#### Enhanced Behavioral States
```javascript
// Cached behavioral state (generated from consciousness parameters)
behavioralState: {
  energy: 'moderate',      // low, moderate, high
  focus: 'balanced',       // scattered, balanced, focused  
  mood: 'content',         // depressed, content, optimistic, excited
  socialDrive: 0.6,        // 0-1 scale
  riskTolerance: 0.5,      // 0-1 scale
  ambition: 0.7            // 0-1 scale
}

// Single decision factor calculation (0.1x to 3.0x range)
const decisionFactor = BehavioralStateService.calculateDecisionFactor(
  character, interactionType, context
);
```

#### Checkpoint System
- Complete consciousness state persistence
- Graceful recovery from corrupted states
- Automatic maintenance and memory pruning
- Baseline drift for inactive characters

## Integration with Existing Systems

### D&D Attribute System
- Six core attributes with automatic modifiers
- Skill checks and saving throws
- Character progression through experience

### Quest System
- Goal-driven NPC behavior
- Multi-step objectives
- Dynamic quest generation

### Consciousness Framework
- Quantum-inspired frequency/coherence model
- Affects decision quality and speed
- Evolves based on experiences

### Memory Service
- Characters remember past interactions
- Influences future behavior
- Creates persistent relationships

### Influence/Prestige/Alignment
- Multi-layered progression systems
- Faction standings
- Moral positioning

## Best Practices

### World Building
1. **Start with Theme**: Define your world's core concept
2. **Create Key Nodes**: Establish main locations first
3. **Design Archetypes**: Build character templates for reuse
4. **Define Interactions**: Create meaningful action choices
5. **Test Small**: Start with few components, expand gradually

### Simulation Management
1. **Regular Saves**: Persist world state frequently
2. **Monitor History**: Review turn summaries for patterns
3. **Adjust Parameters**: Tune consciousness and personality values
4. **Use Templates**: Speed up creation with templates
5. **Analyze Results**: Use history analysis tools

### Performance Optimization
1. **Limit Active NPCs**: Keep populations manageable
2. **Prune History**: Archive old historical data
3. **Optimize Interactions**: Reduce complex calculations
4. **Batch Updates**: Process similar changes together
5. **Cache Templates**: Preload frequently used templates

## Error Handling

The system includes robust error handling:
- **Validation Feedback**: Clear messages about missing requirements
- **Graceful Degradation**: Partial functionality when possible
- **Recovery Mechanisms**: Restore from saved states
- **Error Logging**: Detailed error information for debugging

## Future Considerations

While not yet implemented, the architecture supports:
- **Multiplayer Collaboration**: Shared world building
- **AI Integration**: LLM-powered narrative generation
- **Advanced Analytics**: Deep historical analysis
- **Plugin System**: Community extensions
- **Export/Import**: Share worlds with others

## Conclusion

The World History Simulation Engine provides a powerful, flexible platform for creating dynamic historical worlds. Its turn-based, mapless design combined with free building and comprehensive template support enables unlimited creative possibilities while maintaining simulation depth and coherence.