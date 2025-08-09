# World History Simulation Engine

## Overview

The World History Simulation Engine is a sophisticated turn-based, mapless simulation platform for creating dynamic historical worlds with emergent storytelling. It provides complete creative freedom through a flexible building system where users can construct worlds in any order they prefer.

## Core Design Principles

### Turn-Based Simulation
- **Manual Time Progression**: Users control when time advances
- **Turn Resolution**: Each turn processes all character actions and events
- **Historical Recording**: Every turn creates permanent historical records
- **No Real-Time Pressure**: Think strategically about each turn

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

### Capability-Driven Characters
- **Defined by Actions**: Characters are what they can DO
- **Interaction Assignments**: Capabilities determined by assigned interactions
- **Dynamic Growth**: Gain new capabilities through play
- **Context-Sensitive**: Available actions depend on current node

## System Architecture

### Domain Layer
Core business entities and logic:
- **Character**: Consciousness, attributes, personality, memory
- **Node**: Abstract locations with properties and connections
- **Interaction**: Actions characters can perform
- **WorldBuilder**: Service for constructing worlds
- **HistoryGenerator**: Creates historical records

### Application Layer
Use cases and services:
- **SimulationService**: Turn-based simulation engine
- **TemplateService**: Template management
- **MemoryService**: Character memory systems
- **EvolutionService**: Character and world development

### Infrastructure Layer
External interfaces and persistence:
- **LocalStorageWorldRepository**: World state persistence
- **LocalStorageRepository**: General data persistence
- **TemplateRepository**: Template storage

### Presentation Layer
React UI components and hooks:
- **SimulationContext**: Global state management
- **useWorldBuilder**: World construction hook
- **useSimulation**: Simulation control hook
- **ConditionalSimulationInterface**: Adaptive UI

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
  consciousness: {
    frequency: 45,      // Hz, affects decision speed
    coherence: 0.8      // 0-1, affects decision quality
  },
  attributes: {
    strength: 10,
    dexterity: 14,
    constitution: 12,
    intelligence: 16,
    wisdom: 13,
    charisma: 15
  },
  personality: {
    aggression: 0.2,
    curiosity: 0.8,
    empathy: 0.6
  },
  assignedInteractions: ["trade", "negotiate", "gossip"]
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
1. **Character Actions**: NPCs perform assigned interactions
2. **Event Resolution**: Process outcomes and consequences
3. **State Updates**: Apply effects to characters and nodes
4. **History Recording**: Log events to historical record
5. **Evolution**: Update consciousness, relationships, resources

### Turn Control
```javascript
// Process single turn
const turnResult = simulationService.processTurn();

// Get turn history
const history = simulationService.getTurnHistory(startTurn, endTurn);

// Analyze historical patterns
const analysis = simulationService.analyzeHistory({
  entityType: 'character',
  timeRange: { start: 0, end: 100 },
  metrics: ['relationships', 'achievements', 'consciousness']
});
```

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