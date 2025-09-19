# Design Document

## Overview

The consciousness system refactor transforms the current computationally expensive, constantly-recalculating NPC consciousness system into an efficient, event-driven architecture. The new design maintains the sophisticated quantum-inspired consciousness model while achieving 90% reduction in computational overhead through cached behavioral states and significance-based updates.

The design follows clean architecture principles with clear separation between consciousness state management, behavioral calculation, event processing, and persistence layers. The system preserves behavioral depth and consistency while enabling large-scale simulations with hundreds of NPCs.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ NPC Inspector   │  │ Behavior Debug  │  │ Performance  │ │
│  │ Component       │  │ Tools           │  │ Monitor      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Turn Processor  │  │ Consciousness   │  │ Memory       │ │
│  │ Service         │  │ Update Service  │  │ Service      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Consciousness   │  │ Behavioral      │  │ Event        │ │
│  │ State           │  │ State Service   │  │ Significance │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Checkpoint      │  │ Memory          │  │ Performance  │ │
│  │ Repository      │  │ Repository      │  │ Metrics      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Core Design Principles

1. **Cached State Architecture**: Behavioral states are generated once and cached until significant events trigger updates
2. **Event-Driven Updates**: Consciousness parameters only change in response to meaningful events
3. **Significance Thresholds**: Events must meet minimum significance criteria to trigger processing
4. **Bounded Decision Factors**: All behavioral calculations produce bounded, predictable results
5. **Efficient Memory Management**: Only significant interactions are stored as memories
6. **Checkpoint Persistence**: Complete state preservation for session continuity

## Components and Interfaces

### 1. Enhanced Consciousness State

The core consciousness entity that manages both stable consciousness parameters and cached behavioral states.

```javascript
class ConsciousnessState {
  constructor(config) {
    // Stable consciousness parameters (quantum-inspired)
    this.baseFrequency = config.baseFrequency || 7.5;  // 3-15 Hz range
    this.baseCoherence = config.baseCoherence || 0.7;  // 0.2-1.0 range
    
    // Cached behavioral state (generated from consciousness parameters)
    this.behavioralState = {
      energy: 'moderate',      // low, moderate, high
      focus: 'balanced',       // scattered, balanced, focused  
      mood: 'content',         // depressed, content, optimistic, excited
      socialDrive: 0.6,        // 0-1 scale
      riskTolerance: 0.5,      // 0-1 scale
      ambition: 0.7            // 0-1 scale
    };
    
    // Update tracking
    this.lastUpdate = Date.now();
    this.significantEvents = [];
    this.updateTriggerThreshold = 0.3;
  }
  
  // Generate behavioral state from consciousness parameters
  generateBehavioralState() {
    const freq = this.baseFrequency;
    const coherence = this.baseCoherence;
    
    return {
      energy: this.mapFrequencyToEnergy(freq),
      focus: this.mapCoherenceToFocus(coherence),
      mood: this.calculateMoodFromState(freq, coherence),
      socialDrive: Math.max(0, Math.min(1, (freq - 4) / 8)),
      riskTolerance: Math.max(0, Math.min(1, (freq - 6) / 6)),
      ambition: Math.max(0, Math.min(1, coherence * (freq / 10)))
    };
  }
  
  // Check if event triggers consciousness update
  shouldUpdateFromEvent(event) {
    return event.significance >= this.updateTriggerThreshold;
  }
}
```

### 2. Behavioral State Service

Centralized service for calculating decision factors from cached behavioral states.

```javascript
class BehavioralStateService {
  // Calculate single weighted factor for decision making
  static calculateDecisionFactor(character, interactionType, context = {}) {
    const behavioral = character.consciousness.behavioralState;
    const personality = character.personality;
    const memories = character.getRelevantMemories(interactionType);
    
    // Base factor starts at 1.0 (neutral)
    let factor = 1.0;
    
    // Apply behavioral state modifiers (0.5x - 2.0x range)
    factor *= this.getBehavioralModifier(behavioral, interactionType);
    
    // Apply personality influence (0.7x - 1.5x range)
    factor *= this.getPersonalityModifier(personality, interactionType);
    
    // Apply memory influence (0.8x - 1.3x range)
    factor *= this.getMemoryModifier(memories, interactionType);
    
    // Apply contextual modifiers (environmental, social, etc.)
    factor *= this.getContextualModifier(context, interactionType);
    
    // Bound result between 0.1x and 3.0x
    return Math.max(0.1, Math.min(3.0, factor));
  }
  
  // Map behavioral states to interaction type modifiers
  static getBehavioralModifier(behavioral, interactionType) {
    const modifierMap = {
      social: {
        high_energy: 1.3,
        optimistic_mood: 1.2,
        high_socialDrive: 1.4
      },
      risky_actions: {
        high_riskTolerance: 1.5,
        focused_focus: 1.2,
        high_ambition: 1.3
      },
      advancement: {
        high_ambition: 1.4,
        focused_focus: 1.3,
        high_energy: 1.2
      },
      rest: {
        low_energy: 1.3,
        content_mood: 1.1
      }
    };
    
    return this.applyModifierMap(behavioral, modifierMap[interactionType] || {});
  }
}
```

### 3. Event-Driven Update System

Manages consciousness parameter updates based on significant events.

```javascript
class ConsciousnessUpdateService {
  // Process significant event and update consciousness if needed
  static processEvent(character, event) {
    const consciousness = character.consciousness;
    
    if (!consciousness.shouldUpdateFromEvent(event)) {
      return false; // No update needed
    }
    
    // Track significant event
    consciousness.significantEvents.push({
      ...event,
      timestamp: Date.now()
    });
    
    // Update consciousness parameters based on event type
    this.updateConsciousnessFromEvent(consciousness, event);
    
    // Regenerate behavioral state from updated parameters
    consciousness.behavioralState = consciousness.generateBehavioralState();
    consciousness.lastUpdate = Date.now();
    
    return true; // Update occurred
  }
  
  // Define event significance calculation
  static calculateEventSignificance(event) {
    let significance = 0.1; // Base significance
    
    // Event type significance
    const typeSignificance = {
      'goal_completion': 0.8,
      'goal_failure': 0.7,
      'social_interaction_major': 0.6,
      'traumatic_encounter': 1.0,
      'relationship_change_major': 0.5,
      'life_change_event': 0.9,
      'conflict_resolution': 0.6,
      'resource_gain_major': 0.4,
      'resource_loss_major': 0.5
    };
    
    significance += typeSignificance[event.type] || 0.2;
    
    // Outcome modifier
    if (event.outcome === 'critical_success' || event.outcome === 'critical_failure') {
      significance += 0.3;
    }
    
    // Emotional impact modifier
    significance += (event.emotionalImpact || 0) * 0.2;
    
    return Math.min(1.0, significance);
  }
  
  // Update consciousness parameters based on event type
  static updateConsciousnessFromEvent(consciousness, event) {
    const updates = {
      'goal_completion': {
        frequency: +0.3,
        coherence: +0.05
      },
      'goal_failure': {
        frequency: -0.5,
        coherence: -0.1
      },
      'social_interaction_major': {
        frequency: event.outcome === 'positive' ? +0.2 : -0.2,
        coherence: event.outcome === 'positive' ? +0.02 : -0.02
      },
      'traumatic_encounter': {
        frequency: -1.0,
        coherence: -0.2
      },
      'relationship_change_major': {
        frequency: event.outcome === 'positive' ? +0.1 : -0.1,
        coherence: event.outcome === 'positive' ? +0.01 : -0.01
      }
    };
    
    const update = updates[event.type];
    if (update) {
      consciousness.baseFrequency += update.frequency;
      consciousness.baseCoherence += update.coherence;
      
      // Keep within bounds
      consciousness.baseFrequency = Math.max(3, Math.min(15, consciousness.baseFrequency));
      consciousness.baseCoherence = Math.max(0.2, Math.min(1.0, consciousness.baseCoherence));
    }
  }
}
```

### 4. Checkpoint System

Handles state persistence and restoration for session continuity.

```javascript
class ConsciousnessCheckpointService {
  // Create checkpoint of all consciousness states
  static saveCheckpoint(worldState) {
    const checkpoint = {
      timestamp: Date.now(),
      version: '2.0',
      characterStates: new Map()
    };
    
    worldState.npcs.forEach(npc => {
      checkpoint.characterStates.set(npc.id, {
        baseFrequency: npc.consciousness.baseFrequency,
        baseCoherence: npc.consciousness.baseCoherence,
        behavioralState: { ...npc.consciousness.behavioralState },
        significantEvents: [...npc.consciousness.significantEvents.slice(-10)],
        lastUpdate: npc.consciousness.lastUpdate,
        activeGoals: [...npc.goals],
        significantMemories: [...(npc.significantMemories || []).slice(-20)]
      });
    });
    
    return checkpoint;
  }
  
  // Restore consciousness states from checkpoint
  static restoreCheckpoint(worldState, checkpoint) {
    checkpoint.characterStates.forEach((state, npcId) => {
      const npc = worldState.npcs.find(n => n.id === npcId);
      if (npc) {
        npc.consciousness.baseFrequency = state.baseFrequency;
        npc.consciousness.baseCoherence = state.baseCoherence;
        npc.consciousness.behavioralState = state.behavioralState;
        npc.consciousness.significantEvents = state.significantEvents;
        npc.consciousness.lastUpdate = state.lastUpdate;
        npc.goals = state.activeGoals;
        npc.significantMemories = state.significantMemories || [];
      }
    });
  }
  
  // Periodic maintenance and optimization
  static performMaintenance(worldState) {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    worldState.npcs.forEach(npc => {
      // Clean old events (keep last 20)
      npc.consciousness.significantEvents = 
        npc.consciousness.significantEvents.slice(-20);
      
      // Clean old memories (keep last 50)
      if (npc.significantMemories) {
        npc.significantMemories = npc.significantMemories.slice(-50);
      }
      
      // Gradual drift toward baseline after extended inactivity
      const timeSinceUpdate = now - npc.consciousness.lastUpdate;
      if (timeSinceUpdate > oneWeek) {
        const driftFactor = Math.min(0.1, timeSinceUpdate / (oneWeek * 4));
        
        // Drift toward baseline values (7.5 Hz, 0.7 coherence)
        const freqDrift = (7.5 - npc.consciousness.baseFrequency) * driftFactor;
        const cohDrift = (0.7 - npc.consciousness.baseCoherence) * driftFactor;
        
        npc.consciousness.baseFrequency += freqDrift;
        npc.consciousness.baseCoherence += cohDrift;
        
        // Regenerate behavioral state if significant drift occurred
        if (Math.abs(freqDrift) > 0.1 || Math.abs(cohDrift) > 0.01) {
          npc.consciousness.behavioralState = 
            npc.consciousness.generateBehavioralState();
        }
      }
    });
  }
}
```

### 5. Efficient Memory System

Manages significant memory storage with automatic significance filtering.

```javascript
class SignificantMemoryService {
  // Add memory only if interaction meets significance threshold
  static addMemoryIfSignificant(character, interaction, outcome) {
    const significance = this.calculateSignificance(interaction, outcome);
    
    if (significance < 0.3) {
      return false; // Not significant enough
    }
    
    const memory = {
      id: crypto.randomUUID(),
      interactionType: interaction.type,
      outcome: outcome,
      significance: significance,
      timestamp: Date.now(),
      participants: interaction.participants || [],
      location: character.currentNodeId,
      emotionalImpact: this.calculateEmotionalImpact(character, outcome),
      contextTags: this.extractContextTags(interaction, outcome)
    };
    
    // Initialize memory array if needed
    if (!character.significantMemories) {
      character.significantMemories = [];
    }
    
    // Add memory and maintain size limit
    character.significantMemories.push(memory);
    character.significantMemories = character.significantMemories.slice(-50);
    
    return true;
  }
  
  // Calculate interaction significance
  static calculateSignificance(interaction, outcome) {
    let significance = 0.1; // Base significance
    
    // Interaction type significance
    const typeSignificance = {
      'rest': 0.1,
      'work': 0.2,
      'social': 0.4,
      'conflict': 0.8,
      'romance': 0.9,
      'major_decision': 1.0,
      'trade': 0.3,
      'exploration': 0.4,
      'learning': 0.5
    };
    
    significance += typeSignificance[interaction.type] || 0.2;
    
    // Outcome significance
    const outcomeSignificance = {
      'critical_success': 0.5,
      'critical_failure': 0.5,
      'success': 0.2,
      'failure': 0.2,
      'neutral': 0.0
    };
    
    significance += outcomeSignificance[outcome] || 0.1;
    
    // Special modifiers
    if (interaction.isFirstTime) significance += 0.2;
    if (interaction.involvesImportantNPC) significance += 0.3;
    if (interaction.hasLongTermConsequences) significance += 0.4;
    
    return Math.min(1.0, significance);
  }
  
  // Get relevant memories for decision making
  static getRelevantMemories(character, interactionType, maxMemories = 5) {
    if (!character.significantMemories) return [];
    
    return character.significantMemories
      .filter(memory => 
        memory.interactionType === interactionType ||
        memory.contextTags.includes(interactionType)
      )
      .sort((a, b) => b.significance - a.significance)
      .slice(0, maxMemories);
  }
}
```

### 6. Optimized Turn Processor

Integrates all components for efficient turn-based processing.

```javascript
class EfficientTurnProcessor {
  // Process single NPC turn with cached states
  static processNPCTurn(npc, worldState) {
    // Step 1: Check if consciousness update is needed
    const needsUpdate = this.checkForSignificantChanges(npc, worldState);
    
    if (needsUpdate) {
      this.processRecentEvents(npc);
    }
    
    // Step 2: Generate behavior using cached behavioral state
    const behavior = this.generateBehaviorFromCachedState(npc, worldState);
    
    // Step 3: Execute behavior and evaluate significance
    const result = this.executeBehavior(npc, behavior, worldState);
    
    // Step 4: Process significant results
    if (result.isSignificant) {
      ConsciousnessUpdateService.processEvent(npc, result.event);
      SignificantMemoryService.addMemoryIfSignificant(
        npc, 
        behavior.interaction, 
        result.outcome
      );
    }
    
    return result;
  }
  
  // Check for changes that might trigger consciousness updates
  static checkForSignificantChanges(npc, worldState) {
    // Check relationship changes
    const relationshipChanges = this.detectRelationshipChanges(npc);
    
    // Check goal status changes
    const goalChanges = this.detectGoalChanges(npc);
    
    // Check environmental changes
    const environmentChanges = this.detectEnvironmentChanges(npc, worldState);
    
    return relationshipChanges || goalChanges || environmentChanges;
  }
  
  // Generate behavior using cached behavioral state
  static generateBehaviorFromCachedState(npc, worldState) {
    // Use cached behavioral state - no recalculation
    const decisionFactor = BehavioralStateService.calculateDecisionFactor(
      npc,
      'general',
      { worldState, currentNode: worldState.getNode(npc.currentNodeId) }
    );
    
    // Apply decision factor to goal hierarchy
    const prioritizedGoals = this.prioritizeGoals(npc, decisionFactor);
    
    // Select behavior based on top priority goal
    return this.selectBehaviorForGoal(npc, prioritizedGoals[0], worldState);
  }
}
```

## Data Models

### Consciousness State Data Model

```javascript
{
  // Stable consciousness parameters
  baseFrequency: 7.5,        // 3-15 Hz range
  baseCoherence: 0.7,        // 0.2-1.0 range
  
  // Cached behavioral state
  behavioralState: {
    energy: 'moderate',       // low, moderate, high
    focus: 'balanced',        // scattered, balanced, focused
    mood: 'content',          // depressed, content, optimistic, excited
    socialDrive: 0.6,         // 0-1 scale
    riskTolerance: 0.5,       // 0-1 scale
    ambition: 0.7             // 0-1 scale
  },
  
  // Update tracking
  lastUpdate: 1640995200000,
  significantEvents: [
    {
      type: 'goal_completion',
      significance: 0.8,
      timestamp: 1640995200000,
      outcome: 'success',
      emotionalImpact: 0.6
    }
  ],
  updateTriggerThreshold: 0.3
}
```

### Significant Memory Data Model

```javascript
{
  id: 'mem_12345',
  interactionType: 'social',
  outcome: 'success',
  significance: 0.6,
  timestamp: 1640995200000,
  participants: ['npc_456', 'npc_789'],
  location: 'node_market_square',
  emotionalImpact: 0.4,
  contextTags: ['trade', 'negotiation', 'friendship']
}
```

### Checkpoint Data Model

```javascript
{
  timestamp: 1640995200000,
  version: '2.0',
  characterStates: Map {
    'npc_123' => {
      baseFrequency: 8.2,
      baseCoherence: 0.75,
      behavioralState: { /* cached state */ },
      significantEvents: [ /* last 10 events */ ],
      lastUpdate: 1640995200000,
      activeGoals: [ /* current goals */ ],
      significantMemories: [ /* last 20 memories */ ]
    }
  }
}
```

## Error Handling

### Consciousness State Errors

1. **Invalid Parameter Bounds**: Automatically clamp consciousness parameters to valid ranges
2. **Missing Behavioral State**: Regenerate from consciousness parameters if cache is corrupted
3. **Event Processing Failures**: Log error and continue with cached state
4. **Memory Overflow**: Automatic pruning when limits exceeded

### Checkpoint Errors

1. **Corrupted Checkpoint Data**: Fallback to regenerating behavioral states
2. **Version Mismatch**: Migration utilities for backward compatibility
3. **Partial Restoration Failure**: Continue with available data, log missing NPCs
4. **Storage Quota Exceeded**: Automatic cleanup of old checkpoints

### Performance Degradation

1. **Update Frequency Too High**: Automatic threshold adjustment
2. **Memory Growth**: Aggressive pruning and garbage collection
3. **Decision Factor Calculation Timeout**: Fallback to simplified calculation
4. **Batch Processing Failures**: Process NPCs individually with error isolation

## Testing Strategy

### Unit Tests

1. **Consciousness State Generation**: Verify behavioral state mapping from parameters
2. **Event Significance Calculation**: Test significance scoring for various event types
3. **Decision Factor Calculation**: Validate bounded output and modifier application
4. **Memory Significance Filtering**: Ensure only significant events are stored
5. **Checkpoint Serialization**: Test save/restore functionality

### Integration Tests

1. **Full Turn Processing**: End-to-end NPC turn with cached states
2. **Event-Driven Updates**: Verify consciousness updates only on significant events
3. **Memory System Integration**: Test memory storage and retrieval in decision making
4. **Checkpoint Persistence**: Full world save/restore with consciousness states
5. **Performance Scaling**: Test with 100, 500, 1000 NPCs

### Performance Tests

1. **Turn Processing Speed**: Measure time per NPC turn with cached states
2. **Memory Usage Growth**: Monitor memory consumption over extended simulation
3. **Update Frequency**: Track consciousness update frequency under various conditions
4. **Checkpoint Operations**: Measure save/restore times for large worlds
5. **Decision Factor Calculation**: Benchmark calculation speed with various inputs

### Behavioral Consistency Tests

1. **Personality Expression**: Verify consistent behavior patterns over time
2. **Event Response**: Test appropriate consciousness changes for event types
3. **Memory Influence**: Validate memory impact on decision making
4. **Goal Hierarchy**: Ensure proper goal prioritization with decision factors
5. **Long-term Stability**: Test behavioral consistency over hundreds of turns

This design provides a comprehensive architecture for the consciousness system refactor that maintains behavioral sophistication while achieving significant performance improvements through caching, event-driven updates, and efficient memory management.