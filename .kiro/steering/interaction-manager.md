# Interaction Manager - Core Foundation

The Interaction Manager is the central engine that drives all character interactions, narrative progression, and world simulation. It serves as the foundation upon which the World History Simulator is built, managing the complex web of choices, consequences, and character relationships that create emergent narratives.

## Core Architecture

The Interaction Manager operates on a node-based system where:
- **Nodes** represent decision points, locations, or narrative states
- **Interactions** define what can happen at each node
- **Characters** navigate through nodes making choices based on their attributes and consciousness
- **Effects** modify the world state, character attributes, and relationships

## Key Components

### 1. Node System

```javascript
interface InteractionNode {
  id: string;
  name: string;
  description: string;
  type: 'location' | 'narrative' | 'decision' | 'event';
  interactions: InteractionDefinition[];
  requirements: InteractionRequirement[];
  modifiers: NodeModifier[];
  metadata: {
    category?: string;
    tags?: string[];
    hidden?: boolean;
    discoverable?: boolean;
  };
}
```

Nodes serve multiple purposes:
- **Locations**: Physical places in the world (settlements, dungeons, landmarks)
- **Narrative Points**: Story beats and plot developments
- **Decision Points**: Major choices that affect character/world development
- **Events**: Time-based or triggered occurrences

### 2. Interaction System

```javascript
interface InteractionDefinition {
  id: string;
  nodeId: string;
  name: string;
  description: string;
  type: 'dialogue' | 'action' | 'decision' | 'event';
  requirements: InteractionRequirement[];
  branches: InteractionBranch[];
  effects: InteractionEffect[];
  participants: ParticipantRequirement[];
  cooldown?: number;
  repeatable?: boolean;
}

interface InteractionBranch {
  id: string;
  condition: BranchCondition;
  text: string;
  effects: InteractionEffect[];
  nextNodeId?: string;
  questProgress?: QuestProgress;
}
```

Interactions provide:
- **Branching Narratives**: Multiple paths based on character choices and attributes
- **Conditional Logic**: Different outcomes based on character state, relationships, or world conditions
- **Effect Application**: Modify attributes, relationships, resources, or trigger events
- **Quest Integration**: Progress or complete quests through interactions

### 3. Character Management

```javascript
interface CharacterInteractionState {
  characterId: string;
  currentNodeId: string;
  visitedNodes: Set<string>;
  completedInteractions: Set<string>;
  activeEffects: ActiveEffect[];
  relationshipMap: Map<string, Relationship>;
  questStates: Map<string, QuestState>;
  decisionHistory: DecisionRecord[];
}
```

The Interaction Manager tracks:
- **Character Position**: Current node and movement history
- **Interaction History**: What choices have been made
- **Active Effects**: Ongoing modifiers from past interactions
- **Relationships**: How interactions affect inter-character dynamics
- **Quest Progress**: Integration with the quest system

### 4. Effect System

```javascript
interface InteractionEffect {
  type: 'attribute' | 'skill' | 'relationship' | 'resource' | 'quest' | 'world';
  target: 'self' | 'other' | 'node' | 'global';
  operation: 'add' | 'multiply' | 'set' | 'trigger';
  value: number | string | boolean;
  duration?: EffectDuration;
  conditions?: EffectCondition[];
}
```

Effects enable:
- **Character Development**: Modify D&D attributes, skills, and capabilities
- **Relationship Evolution**: Change how characters relate to each other
- **Resource Management**: Affect inventory, currency, and resources
- **World State Changes**: Modify settlements, trigger events, or change global conditions
- **Quest Progression**: Advance or complete quest objectives

## Integration Points

### With D&D Attribute System
- Attribute checks determine interaction success/failure
- Attribute modifiers affect available choices
- Interactions can permanently or temporarily modify attributes

### With Quest System
- Interactions trigger quest progression
- Quest states unlock new interactions
- Completed quests open new narrative branches

### With Consciousness System
- Personality traits influence available choices
- Consciousness states affect interaction outcomes
- Memories and beliefs shape character decisions

### With World History Simulator
- Interactions generate historical events
- NPC autonomous actions use the interaction framework
- Settlement development driven by collective interactions
- Wars, alliances, and political changes emerge from interaction patterns

## Simulation Integration

In the World History Simulator context, the Interaction Manager:

1. **Drives Autonomous NPC Behavior**
   - NPCs navigate nodes based on goals and personality
   - Automatic interaction selection based on consciousness state
   - Emergent behaviors from interaction chains

2. **Creates Historical Events**
   - Significant interactions become historical records
   - Interaction patterns create larger narratives (wars, alliances)
   - Character decisions shape world development

3. **Manages Complex Relationships**
   - Every interaction can affect multiple relationships
   - Relationship states influence future interactions
   - Family, political, and economic ties emerge from interactions

4. **Enables Procedural Narratives**
   - Template-based interactions create variety
   - Conditional branching ensures coherent stories
   - Player agency preserved through meaningful choices

## Usage in World Simulation

```javascript
// Autonomous NPC interaction selection
const selectInteraction = (npc: SimulationCharacter, node: InteractionNode) => {
  const availableInteractions = node.interactions.filter(interaction => 
    meetsRequirements(npc, interaction.requirements)
  );
  
  return weightedSelection(availableInteractions, weights => {
    // Weight based on personality, goals, and relationships
    return calculateInteractionWeight(npc, interaction, weights);
  });
};

// Historical event generation from interactions
const generateHistoricalEvent = (interaction: InteractionInstance) => {
  if (isSignificant(interaction)) {
    return {
      id: generateId(),
      timestamp: currentSimulationTime,
      type: mapInteractionToEventType(interaction),
      participants: interaction.participants,
      location: interaction.nodeId,
      description: generateEventDescription(interaction),
      effects: interaction.effects,
      culturalImpact: calculateCulturalImpact(interaction)
    };
  }
};
```

## Best Practices

1. **Node Design**
   - Keep nodes focused on single locations or decision points
   - Use metadata for categorization and discovery
   - Balance node density for optimal simulation performance

2. **Interaction Creation**
   - Provide meaningful choices with distinct outcomes
   - Use requirements to gate advanced content
   - Leverage effects for lasting consequences

3. **Integration Patterns**
   - Always consider ripple effects across systems
   - Use the effect system for clean state modifications
   - Maintain interaction history for narrative coherence

4. **Simulation Optimization**
   - Cache frequently accessed interaction data
   - Batch process autonomous NPC decisions
   - Use interaction templates for common patterns

The Interaction Manager is the beating heart of the World History Simulator, transforming discrete character choices into rich, emergent narratives that span generations and shape entire civilizations.