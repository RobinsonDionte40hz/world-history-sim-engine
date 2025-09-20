# Consciousness System Integration Examples

This document provides practical examples of how to integrate the consciousness system with existing character and simulation code. The examples show both basic usage and advanced integration patterns.

## Table of Contents

1. [Basic Character Creation](#basic-character-creation)
2. [Event-Driven Updates](#event-driven-updates)
3. [Decision Making Integration](#decision-making-integration)
4. [Memory System Integration](#memory-system-integration)
5. [Turn Processing Integration](#turn-processing-integration)
6. [Persistence and Save/Load](#persistence-and-save-load)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)
9. [Testing Examples](#testing-examples)

## Basic Character Creation

### Creating Characters with Consciousness

```javascript
import { EnhancedConsciousnessState } from '../domain/value-objects/EnhancedConsciousnessState.js';
import { Character } from '../domain/entities/Character.js';

// Create a character with consciousness
function createConsciousCharacter(config) {
  const consciousness = new EnhancedConsciousnessState({
    baseFrequency: config.baseFrequency || 7.5,
    baseCoherence: config.baseCoherence || 0.7,
    updateTriggerThreshold: config.updateThreshold || 0.3
  });

  const character = new Character({
    id: config.id,
    name: config.name,
    personality: config.personality,
    consciousness: consciousness,
    // ... other character properties
  });

  return character;
}

// Example usage
const warrior = createConsciousCharacter({
  id: 'warrior_001',
  name: 'Thrain Ironfist',
  baseFrequency: 9.0,  // High energy/focus
  baseCoherence: 0.8,  // Stable and focused
  personality: {
    bravery: 0.9,
    aggression: 0.7,
    loyalty: 0.8
  }
});

console.log('Created warrior with consciousness:');
console.log('Behavioral state:', warrior.consciousness.getBehavioralState());
```

### Initializing Consciousness from Existing Characters

```javascript
import { EnhancedConsciousnessState } from '../domain/value-objects/EnhancedConsciousnessState.js';
import { ConsciousnessMigrationService } from '../domain/services/ConsciousnessMigrationService.js';

// Migrate existing characters to new consciousness system
function migrateCharacterConsciousness(character) {
  const migrationService = new ConsciousnessMigrationService();

  // Check if character already has new consciousness
  if (character.consciousness instanceof EnhancedConsciousnessState) {
    return character; // Already migrated
  }

  // Migrate from old consciousness format
  const newConsciousness = migrationService.migrateFromLegacyFormat(character.consciousness);

  // Update character
  character.consciousness = newConsciousness;

  return character;
}

// Batch migration for multiple characters
function migrateAllCharacters(characters) {
  return characters.map(migrateCharacterConsciousness);
}
```

## Event-Driven Updates

### Processing Game Events

```javascript
import { ConsciousnessUpdateService } from '../domain/services/ConsciousnessUpdateService.js';
import { EventSignificanceService } from '../domain/services/EventSignificanceService.js';

class GameEventProcessor {
  constructor() {
    this.updateService = new ConsciousnessUpdateService();
    this.significanceService = new EventSignificanceService();
  }

  async processGameEvent(character, event, context = {}) {
    // Calculate event significance
    const significance = this.significanceService.calculateEventSignificance(event, context);

    console.log(`${character.name} experienced: ${event.description}`);
    console.log(`Event significance: ${significance.toFixed(2)}`);

    // Only process significant events
    if (significance >= 0.3) {
      const result = await this.updateService.processEvent(character, {
        ...event,
        significance
      }, context);

      if (result.updated) {
        console.log('Consciousness updated:');
        console.log('- Parameter changes:', result.parameterChanges);
        console.log('- New behavioral state:', character.consciousness.getBehavioralState());
      }
    }

    return significance;
  }
}

// Usage example
const eventProcessor = new GameEventProcessor();

// Process various game events
await eventProcessor.processGameEvent(warrior, {
  type: 'goal_completion',
  outcome: 'success',
  emotionalImpact: 0.8,
  description: 'Successfully completed the dragon slaying quest'
});

await eventProcessor.processGameEvent(warrior, {
  type: 'social_success',
  outcome: 'success',
  emotionalImpact: 0.6,
  description: 'Made a valuable alliance with the elven kingdom'
});
```

### Turn-Based Event Processing

```javascript
import { EfficientTurnProcessor } from '../domain/services/EfficientTurnProcessor.js';

class TurnBasedConsciousnessManager {
  constructor() {
    this.turnProcessor = new EfficientTurnProcessor();
  }

  async processCharacterTurn(character, turnEvents, worldContext) {
    // Process all events for this character this turn
    const turnResult = await this.turnProcessor.processCharacterTurn(
      character,
      turnEvents,
      worldContext
    );

    // Log consciousness changes
    if (turnResult.consciousnessUpdated) {
      console.log(`${character.name} consciousness changes this turn:`);
      console.log('- Events processed:', turnResult.eventsProcessed);
      console.log('- Consciousness updates:', turnResult.consciousnessUpdates);
      console.log('- Current behavioral state:', character.consciousness.getBehavioralState());
    }

    return turnResult;
  }

  async processWorldTurn(characters, worldEvents, worldContext) {
    const results = [];

    for (const character of characters) {
      // Get events relevant to this character
      const characterEvents = worldEvents.filter(event =>
        this.isEventRelevantToCharacter(event, character)
      );

      const result = await this.processCharacterTurn(character, characterEvents, worldContext);
      results.push(result);
    }

    return results;
  }

  isEventRelevantToCharacter(event, character) {
    // Logic to determine if event affects this character
    return event.affectedCharacterIds?.includes(character.id) ||
           event.location === character.location ||
           event.type === 'world_event';
  }
}
```

## Decision Making Integration

### Integrating with Character Behavior

```javascript
import { BehavioralStateService } from '../domain/services/BehavioralStateService.js';

class CharacterBehaviorManager {
  constructor() {
    this.behavioralService = new BehavioralStateService();
  }

  calculateActionWeights(character, availableActions, context) {
    const weights = {};

    for (const action of availableActions) {
      const modifier = this.behavioralService.getBehavioralModifier(
        character,
        action.type,
        {
          ...context,
          action: action
        }
      );

      // Base weight modified by consciousness
      weights[action.id] = action.baseWeight * modifier;
    }

    return weights;
  }

  selectAction(character, availableActions, context) {
    const weights = this.calculateActionWeights(character, availableActions, context);

    // Select action based on weights (highest first)
    const sortedActions = availableActions.sort((a, b) =>
      weights[b.id] - weights[a.id]
    );

    const selectedAction = sortedActions[0];

    console.log(`${character.name} selected: ${selectedAction.name}`);
    console.log(`Decision weight: ${weights[selectedAction.id].toFixed(2)}`);
    console.log('Behavioral breakdown:', this.behavioralService.calculateDecisionFactor(
      character,
      selectedAction.type,
      context
    ).breakdown);

    return selectedAction;
  }
}

// Example actions
const availableActions = [
  {
    id: 'explore',
    name: 'Explore nearby ruins',
    type: 'exploration',
    baseWeight: 1.0
  },
  {
    id: 'socialize',
    name: 'Talk to villagers',
    type: 'social',
    baseWeight: 1.0
  },
  {
    id: 'rest',
    name: 'Rest at inn',
    type: 'rest',
    baseWeight: 0.8
  },
  {
    id: 'trade',
    name: 'Buy supplies',
    type: 'economic',
    baseWeight: 0.9
  }
];

const behaviorManager = new CharacterBehaviorManager();
const selectedAction = behaviorManager.selectAction(warrior, availableActions, {
  timeOfDay: 'afternoon',
  energy: 0.7,
  location: 'village'
});
```

### Memory-Influenced Decisions

```javascript
import { SignificantMemoryService } from '../domain/services/SignificantMemoryService.js';

class MemoryInfluencedBehaviorManager extends CharacterBehaviorManager {
  constructor() {
    super();
    this.memoryService = new SignificantMemoryService();
  }

  selectActionWithMemory(character, availableActions, context) {
    // Get memory analysis for decision logging
    const memoryAnalyses = {};

    for (const action of availableActions) {
      memoryAnalyses[action.id] = this.behavioralService.getMemoryAnalysis(
        character,
        action.type,
        context
      );
    }

    // Select action using standard method
    const selectedAction = this.selectAction(character, availableActions, context);

    // Log memory influence
    const memoryAnalysis = memoryAnalyses[selectedAction.id];
    if (memoryAnalysis.hasMemories) {
      console.log('Memory influence on decision:');
      console.log(memoryAnalysis.analysis);
      console.log(`Memory modifier: ${memoryAnalysis.memoryModifier.toFixed(2)}x`);
    }

    return selectedAction;
  }

  // Add significant memory from action results
  recordActionMemory(character, action, result, context) {
    const memory = {
      type: action.type,
      outcome: result.outcome,
      significance: result.significance || 0.5,
      description: `${action.name} - ${result.description}`,
      timestamp: Date.now(),
      context: context
    };

    const added = this.memoryService.addMemoryIfSignificant(character, memory);

    if (added) {
      console.log(`Recorded significant memory for ${character.name}: ${memory.description}`);
    }
  }
}
```

## Memory System Integration

### Managing Character Memories

```javascript
import { SignificantMemoryService } from '../domain/services/SignificantMemoryService.js';

class CharacterMemoryManager {
  constructor() {
    this.memoryService = new SignificantMemoryService();
  }

  // Add memory from experience
  recordExperience(character, experience) {
    const memory = {
      type: experience.type,
      outcome: experience.outcome,
      significance: this.calculateExperienceSignificance(experience),
      description: experience.description,
      timestamp: Date.now(),
      emotionalImpact: experience.emotionalImpact,
      context: experience.context
    };

    return this.memoryService.addMemoryIfSignificant(character, memory);
  }

  calculateExperienceSignificance(experience) {
    // Custom significance calculation based on experience type
    const baseSignificance = {
      'combat': 0.6,
      'social': 0.4,
      'exploration': 0.5,
      'economic': 0.3,
      'personal': 0.7
    }[experience.type] || 0.3;

    // Adjust based on outcome and emotional impact
    let significance = baseSignificance;

    if (experience.outcome === 'critical_success') significance += 0.2;
    else if (experience.outcome === 'critical_failure') significance += 0.1;

    if (experience.emotionalImpact > 0.7) significance += 0.1;

    return Math.min(1.0, significance);
  }

  // Get memories for storytelling
  getCharacterHistory(character, options = {}) {
    const memories = this.memoryService.getRelevantMemories(
      character,
      options.type || 'all',
      options.limit || 10,
      options.context || {}
    );

    return memories.map(memory => ({
      description: memory.description,
      significance: memory.significance,
      age: Date.now() - memory.timestamp,
      type: memory.type,
      outcome: memory.outcome
    }));
  }

  // Memory cleanup and maintenance
  performMemoryMaintenance(character) {
    const stats = this.memoryService.getMemoryStats(character);

    console.log(`${character.name} memory stats:`, stats);

    // Clean up if too many memories
    if (stats.totalMemories > 50) {
      this.memoryService.performMemoryCleanup(character, {
        maxMemories: 40,
        minSignificance: 0.4
      });
    }
  }
}
```

## Turn Processing Integration

### Integrating with Existing Turn System

```javascript
import { EfficientTurnProcessor } from '../domain/services/EfficientTurnProcessor.js';
import { ConsciousnessUpdateService } from '../domain/services/ConsciousnessUpdateService.js';

class EnhancedTurnManager {
  constructor() {
    this.turnProcessor = new EfficientTurnProcessor();
    this.consciousnessUpdater = new ConsciousnessUpdateService();
  }

  async processTurn(world, turnNumber) {
    console.log(`Processing turn ${turnNumber}`);

    // Collect all events that occurred this turn
    const turnEvents = this.collectTurnEvents(world);

    // Process consciousness updates for all characters
    const consciousnessResults = await this.processConsciousnessUpdates(world.characters, turnEvents);

    // Process character behaviors with updated consciousness
    const behaviorResults = await this.processCharacterBehaviors(world.characters, world);

    // Update world state based on actions
    const worldUpdates = this.applyBehaviorResults(world, behaviorResults);

    // Generate turn summary
    const summary = {
      turnNumber,
      eventsProcessed: turnEvents.length,
      consciousnessUpdates: consciousnessResults.filter(r => r.updated).length,
      actionsTaken: behaviorResults.length,
      worldChanges: worldUpdates
    };

    console.log(`Turn ${turnNumber} summary:`, summary);

    return summary;
  }

  collectTurnEvents(world) {
    // Collect events from various sources (quests, random events, etc.)
    const events = [];

    // Add quest events
    world.activeQuests.forEach(quest => {
      if (quest.checkCompletion(world)) {
        events.push({
          type: 'goal_completion',
          outcome: 'success',
          affectedCharacterIds: quest.participants,
          description: `Quest completed: ${quest.name}`
        });
      }
    });

    // Add random world events
    if (Math.random() < 0.1) { // 10% chance
      events.push({
        type: 'world_event',
        outcome: 'neutral',
        description: 'A merchant caravan arrived in town'
      });
    }

    return events;
  }

  async processConsciousnessUpdates(characters, events) {
    const results = [];

    for (const character of characters) {
      const characterEvents = events.filter(event =>
        !event.affectedCharacterIds || event.affectedCharacterIds.includes(character.id)
      );

      for (const event of characterEvents) {
        const result = await this.consciousnessUpdater.processEvent(character, event);
        results.push({
          characterId: character.id,
          event: event.description,
          updated: result.updated,
          changes: result.parameterChanges
        });
      }
    }

    return results;
  }

  async processCharacterBehaviors(characters, world) {
    const results = [];

    for (const character of characters) {
      // Use efficient turn processor for behavior generation
      const behaviorResult = await this.turnProcessor.generateBehavior(character, world);

      results.push({
        characterId: character.id,
        action: behaviorResult.action,
        reasoning: behaviorResult.reasoning
      });
    }

    return results;
  }

  applyBehaviorResults(world, behaviorResults) {
    const changes = [];

    behaviorResults.forEach(result => {
      // Apply action consequences to world state
      const change = this.applyAction(world, result.action, result.characterId);
      if (change) changes.push(change);
    });

    return changes;
  }

  applyAction(world, action, characterId) {
    // Apply action effects to world state
    switch (action.type) {
      case 'move':
        return { type: 'movement', characterId, location: action.location };
      case 'trade':
        return { type: 'economic', characterId, transaction: action.transaction };
      case 'social':
        return { type: 'relationship', characterId, interaction: action.interaction };
      default:
        return null;
    }
  }
}
```

## Persistence and Save/Load

### Saving and Loading Consciousness State

```javascript
import { ConsciousnessCheckpointService } from '../domain/services/ConsciousnessCheckpointService.js';

class CharacterPersistenceManager {
  constructor() {
    this.checkpointService = new ConsciousnessCheckpointService();
  }

  // Save character with consciousness state
  async saveCharacter(character, saveLabel = 'manual_save') {
    const checkpointId = await this.checkpointService.saveCheckpoint(
      character,
      saveLabel
    );

    const saveData = {
      id: character.id,
      name: character.name,
      personality: character.personality,
      consciousnessCheckpoint: checkpointId,
      // ... other character data
    };

    // Save to storage
    await this.saveToStorage(character.id, saveData);

    return checkpointId;
  }

  // Load character with consciousness restoration
  async loadCharacter(characterId) {
    const saveData = await this.loadFromStorage(characterId);

    const character = {
      id: saveData.id,
      name: saveData.name,
      personality: saveData.personality,
      // ... restore other character data
    };

    // Restore consciousness from checkpoint
    if (saveData.consciousnessCheckpoint) {
      const restored = await this.checkpointService.restoreCheckpoint(
        character,
        saveData.consciousnessCheckpoint
      );

      if (!restored) {
        console.warn(`Failed to restore consciousness for ${character.name}, using defaults`);
        // Create default consciousness
        character.consciousness = new EnhancedConsciousnessState();
      }
    } else {
      // Migrate from old save format
      character.consciousness = this.migrateOldConsciousness(saveData.oldConsciousnessData);
    }

    return character;
  }

  // Batch save for world state
  async saveWorld(world, label = 'world_save') {
    const characterCheckpoints = [];

    for (const character of world.characters) {
      const checkpointId = await this.saveCharacter(character, label);
      characterCheckpoints.push({
        characterId: character.id,
        checkpointId
      });
    }

    const worldSave = {
      label,
      timestamp: Date.now(),
      characterCheckpoints,
      // ... other world data
    };

    await this.saveWorldToStorage(worldSave);

    return worldSave;
  }

  // Batch load for world state
  async loadWorld(saveLabel) {
    const worldSave = await this.loadWorldFromStorage(saveLabel);

    const characters = [];
    for (const { characterId, checkpointId } of worldSave.characterCheckpoints) {
      const character = await this.loadCharacter(characterId);
      characters.push(character);
    }

    return {
      characters,
      // ... restore other world data
    };
  }

  // Storage abstraction (implement based on your storage system)
  async saveToStorage(key, data) {
    // Implementation depends on your storage system
    localStorage.setItem(`character_${key}`, JSON.stringify(data));
  }

  async loadFromStorage(key) {
    const data = localStorage.getItem(`character_${key}`);
    return data ? JSON.parse(data) : null;
  }

  async saveWorldToStorage(worldSave) {
    localStorage.setItem(`world_${worldSave.label}`, JSON.stringify(worldSave));
  }

  async loadWorldFromStorage(label) {
    const data = localStorage.getItem(`world_${label}`);
    return data ? JSON.parse(data) : null;
  }
}
```

## Performance Optimization

### Batch Processing for Large Simulations

```javascript
import { BatchProcessingService } from '../domain/services/BatchProcessingService.js';

class OptimizedSimulationManager {
  constructor() {
    this.batchService = new BatchProcessingService();
  }

  async processLargeSimulation(characters, events, options = {}) {
    const batchSize = options.batchSize || 50;
    const maxConcurrency = options.maxConcurrency || 10;

    console.log(`Processing ${characters.length} characters with batch size ${batchSize}`);

    // Split characters into batches
    const batches = this.createBatches(characters, batchSize);

    // Process batches with concurrency control
    const results = await this.batchService.processBatch(batches, {
      parallelProcessing: true,
      maxConcurrency,
      onBatchComplete: (batchIndex, result) => {
        console.log(`Completed batch ${batchIndex + 1}/${batches.length}`);
      }
    });

    // Aggregate results
    const summary = {
      totalCharacters: characters.length,
      totalBatches: batches.length,
      successfulUpdates: results.filter(r => r.success).length,
      failedUpdates: results.filter(r => !r.success).length,
      averageProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0) / results.length
    };

    console.log('Batch processing summary:', summary);

    return summary;
  }

  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  // Memory-efficient processing for very large simulations
  async processWithMemoryManagement(characters, events) {
    const memoryManager = new MemoryManagementService();

    // Process in smaller chunks to manage memory
    const chunkSize = 100;
    const results = [];

    for (let i = 0; i < characters.length; i += chunkSize) {
      const chunk = characters.slice(i, i + chunkSize);

      // Process chunk
      const chunkResults = await this.processLargeSimulation(chunk, events, {
        batchSize: 25,
        maxConcurrency: 5
      });

      results.push(chunkResults);

      // Memory cleanup between chunks
      await memoryManager.performWorldLevelCleanup({
        characters: chunk,
        aggressiveCleanup: true
      });
    }

    return results;
  }
}
```

### LOD-Based Processing

```javascript
import { LODManager } from '../domain/services/LODManager.js';

class LODConsciousnessManager {
  constructor() {
    this.lodManager = new LODManager();
  }

  async processCharactersByLOD(characters, worldContext) {
    // Group characters by LOD tier
    const lodGroups = this.groupByLOD(characters);

    const results = {
      hero: [],
      population: [],
      background: []
    };

    // Process hero NPCs with full consciousness simulation
    if (lodGroups.hero.length > 0) {
      results.hero = await this.processHeroCharacters(lodGroups.hero, worldContext);
    }

    // Process population groups with statistical simulation
    if (lodGroups.population.length > 0) {
      results.population = await this.processPopulationGroups(lodGroups.population, worldContext);
    }

    // Background characters get minimal processing
    if (lodGroups.background.length > 0) {
      results.background = await this.processBackgroundCharacters(lodGroups.background, worldContext);
    }

    return results;
  }

  groupByLOD(characters) {
    return characters.reduce((groups, character) => {
      const lodTier = this.lodManager.determineLODTier(character, worldContext);
      groups[lodTier].push(character);
      return groups;
    }, { hero: [], population: [], background: [] });
  }

  async processHeroCharacters(characters, context) {
    // Full consciousness processing for important characters
    return await Promise.all(characters.map(async (character) => {
      const result = await this.processFullConsciousness(character, context);
      return { characterId: character.id, lodTier: 'hero', ...result };
    }));
  }

  async processPopulationGroups(characters, context) {
    // Statistical processing for groups
    const groups = this.lodManager.groupCharactersByAttributes(characters);

    return groups.map(group => {
      const result = this.processGroupStatistics(group, context);
      return { groupId: group.id, lodTier: 'population', ...result };
    });
  }

  async processBackgroundCharacters(characters, context) {
    // Minimal processing for background characters
    return characters.map(character => ({
      characterId: character.id,
      lodTier: 'background',
      processed: true,
      consciousnessUpdated: false // Background characters don't get consciousness updates
    }));
  }
}
```

## Error Handling

### Robust Error Handling Patterns

```javascript
import { ConsciousnessErrorHandlingService } from '../domain/services/ConsciousnessErrorHandlingService.js';

class ResilientConsciousnessManager {
  constructor() {
    this.errorHandler = new ConsciousnessErrorHandlingService();
  }

  async safelyProcessCharacter(character, operation, context = {}) {
    try {
      // Validate character state before processing
      if (!this.errorHandler.isValidCharacter(character)) {
        console.warn(`Invalid character state for ${character.id}, attempting recovery`);

        const recoveryResult = await this.errorHandler.recoverCharacterState(character, context);

        if (!recoveryResult.success) {
          console.error(`Failed to recover character ${character.id}, skipping operation`);
          return { success: false, error: 'character_recovery_failed' };
        }
      }

      // Perform operation with error boundary
      const result = await operation(character);

      return { success: true, result };

    } catch (error) {
      // Handle operation failure
      const errorResult = this.errorHandler.handleOperationFailure(error, {
        operation: operation.name,
        character,
        context
      });

      console.error(`Operation failed for character ${character.id}:`, error.message);

      // Return fallback result
      return {
        success: false,
        error: error.message,
        fallbackUsed: true,
        fallbackResult: errorResult.fallbackValue
      };
    }
  }

  async processCharactersBatch(characters, operation) {
    const results = [];
    const errors = [];

    for (const character of characters) {
      const result = await this.safelyProcessCharacter(character, operation);

      if (result.success) {
        results.push(result.result);
      } else {
        errors.push({
          characterId: character.id,
          error: result.error
        });
      }
    }

    return {
      successful: results,
      failed: errors,
      successRate: results.length / characters.length
    };
  }

  // Circuit breaker pattern for external service calls
  async withCircuitBreaker(operation, options = {}) {
    const maxFailures = options.maxFailures || 5;
    const resetTimeout = options.resetTimeout || 60000; // 1 minute

    if (this.circuitBreakerFailures >= maxFailures) {
      if (Date.now() - this.lastFailureTime < resetTimeout) {
        throw new Error('Circuit breaker open');
      } else {
        // Reset circuit breaker
        this.circuitBreakerFailures = 0;
      }
    }

    try {
      const result = await operation();
      this.circuitBreakerFailures = 0; // Reset on success
      return result;
    } catch (error) {
      this.circuitBreakerFailures++;
      this.lastFailureTime = Date.now();
      throw error;
    }
  }
}
```

## Testing Examples

### Unit Testing Consciousness Behavior

```javascript
import { EnhancedConsciousnessState } from '../domain/value-objects/EnhancedConsciousnessState.js';
import { BehavioralStateService } from '../domain/services/BehavioralStateService.js';

describe('Consciousness System Integration', () => {
  let consciousness;
  let behavioralService;

  beforeEach(() => {
    consciousness = new EnhancedConsciousnessState({
      baseFrequency: 8.0,
      baseCoherence: 0.75
    });
    behavioralService = new BehavioralStateService();
  });

  test('consciousness state initializes correctly', () => {
    const state = consciousness.getBehavioralState();

    expect(state.energy).toBe('high');
    expect(state.focus).toBe('balanced');
    expect(state.mood).toBe('optimistic');
  });

  test('significant events update consciousness', () => {
    const initialState = consciousness.getBehavioralState();

    consciousness.updateFromEvent({
      type: 'goal_completion',
      outcome: 'success',
      significance: 0.8
    });

    const updatedState = consciousness.getBehavioralState();

    // Consciousness should have changed
    expect(updatedState).not.toEqual(initialState);
  });

  test('behavioral modifier calculation works', () => {
    const character = {
      consciousness,
      personality: { bravery: 0.8, aggression: 0.6 }
    };

    const modifier = behavioralService.getBehavioralModifier(character, 'combat');

    expect(modifier).toBeGreaterThan(0.1);
    expect(modifier).toBeLessThan(3.0);
  });

  test('memory influences decision making', () => {
    const character = {
      consciousness,
      personality: { bravery: 0.5 },
      significantMemories: [{
        type: 'combat',
        outcome: 'failure',
        significance: 0.7,
        timestamp: Date.now()
      }]
    };

    const analysis = behavioralService.getMemoryAnalysis(character, 'combat');

    expect(analysis.hasMemories).toBe(true);
    expect(analysis.memoryModifier).toBeLessThan(1.0); // Negative memory reduces willingness
  });
});
```

### Integration Testing

```javascript
import { ConsciousnessUpdateService } from '../domain/services/ConsciousnessUpdateService.js';
import { EventSignificanceService } from '../domain/services/EventSignificanceService.js';

describe('Consciousness System Integration', () => {
  let updateService;
  let significanceService;

  beforeEach(() => {
    updateService = new ConsciousnessUpdateService();
    significanceService = new EventSignificanceService();
  });

  test('end-to-end event processing', async () => {
    const character = createTestCharacter();

    const event = {
      type: 'social_success',
      outcome: 'success',
      emotionalImpact: 0.7,
      description: 'Made a valuable alliance'
    };

    // Calculate significance
    const significance = significanceService.calculateEventSignificance(event);
    expect(significance).toBeGreaterThan(0.3);

    // Process event
    const result = await updateService.processEvent(character, {
      ...event,
      significance
    });

    expect(result.updated).toBe(true);
    expect(result.parameterChanges.frequency).toBeDefined();
  });

  test('batch processing performance', async () => {
    const characters = createTestCharacters(100);

    const startTime = Date.now();

    const results = await updateService.processEventsBatch(characters, [
      {
        type: 'world_event',
        outcome: 'neutral',
        significance: 0.4
      }
    ]);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    expect(results.length).toBe(100);
    expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
  });
});

function createTestCharacter() {
  return {
    id: 'test_char',
    name: 'Test Character',
    consciousness: new EnhancedConsciousnessState(),
    personality: { empathy: 0.5, bravery: 0.5 }
  };
}

function createTestCharacters(count) {
  return Array.from({ length: count }, (_, i) => ({
    ...createTestCharacter(),
    id: `test_char_${i}`
  }));
}
```

These examples demonstrate how to integrate the consciousness system into various aspects of your simulation engine. The patterns shown can be adapted to fit your specific architecture and requirements.