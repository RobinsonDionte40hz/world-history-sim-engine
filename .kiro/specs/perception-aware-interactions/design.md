# Design Document

## Overview

This design creates a hierarchical interaction system that separates core engine behaviors (SystemInteractions) from user-defined content (ContentInteractions). The system establishes clear boundaries between predictable, always-available engine functions and flexible narrative content, while maintaining full backward compatibility with existing Interaction entities. The design integrates deeply with the Environment system to provide realistic environmental effects on all interactions.

## Architecture

### Hierarchical Class Structure

The system introduces a new class hierarchy while preserving existing functionality:

```javascript
// Abstract base class for all interactions
class InteractionBase {
  constructor(config = {}) {
    this.id = config.id || generateId();
    this.name = config.name || 'Unnamed Interaction';
    this.description = config.description || '';
    this.type = config.type;
  }
  
  // Abstract methods to be implemented by subclasses
  canExecute(character, worldState) { throw new Error('Must implement'); }
  execute(character, worldState) { throw new Error('Must implement'); }
  getEnergyCost(character, environment) { throw new Error('Must implement'); }
}

// System interactions - immutable, always available core behaviors
class SystemInteraction extends InteractionBase {
  constructor(config = {}) {
    super(config);
    this.isSystemInteraction = true;
    this.priority = config.priority || 'normal'; // 'critical', 'high', 'normal', 'low'
    this.baseEnergyCost = config.baseEnergyCost || 0;
    Object.freeze(this); // Immutable after creation
  }
  
  // System interactions integrate with Environment
  getEnvironmentalModifier(environment) {
    // Override in subclasses for specific environmental effects
    return 1.0;
  }
}

// Content interactions - flexible, user-customizable
class ContentInteraction extends InteractionBase {
  constructor(config = {}) {
    super(config);
    this.isContentInteraction = true;
    this.category = config.category || 'general'; // 'social', 'combat', 'economic', etc.
    this.author = config.author || 'system';
    this.tags = config.tags || [];
    this.overrideFlags = config.overrideFlags || {};
    
    // Existing Interaction properties for backward compatibility
    this.requirements = config.requirements || [];
    this.branches = config.branches || [];
    this.effects = config.effects || [];
    this.participants = config.participants || [];
    this.cooldown = config.cooldown || 0;
    this.repeatable = config.repeatable || false;
    this.lastUsed = config.lastUsed || 0;
  }
}

// Existing Interaction class remains unchanged for backward compatibility
class Interaction extends ContentInteraction {
  constructor(config = {}) {
    super(config);
    // All existing Interaction functionality preserved
  }
}
```

### System Interaction Implementations

#### MovementInteraction
```javascript
class MovementInteraction extends SystemInteraction {
  constructor(config = {}) {
    super({
      ...config,
      type: 'movement',
      priority: 'high',
      baseEnergyCost: 10
    });
    this.targetNodeId = config.targetNodeId;
    this.path = config.path || [];
    this.difficulty = config.difficulty || 'normal';
  }
  
  canExecute(character, worldState) {
    const energyCost = this.getEnergyCost(character, worldState.getCurrentEnvironment());
    return character.energy >= energyCost && this.targetNodeId && this.isPathValid(worldState);
  }
  
  getEnvironmentalModifier(environment) {
    return environment.getMovementModifier();
  }
}
```

#### PerceptionInteraction
```javascript
class PerceptionInteraction extends SystemInteraction {
  constructor(config = {}) {
    super({
      ...config,
      type: 'perception',
      priority: 'normal',
      baseEnergyCost: 1
    });
    this.perceptionType = config.perceptionType || 'look'; // 'look', 'listen', 'sense'
    this.range = config.range || 1;
  }
  
  canExecute(character, worldState) {
    return true; // Always available, but effectiveness varies
  }
  
  getEnvironmentalModifier(environment) {
    return environment.getVisibilityModifier();
  }
}
```

#### RestInteraction
```javascript
class RestInteraction extends SystemInteraction {
  constructor(config = {}) {
    super({
      ...config,
      type: 'rest',
      priority: 'high',
      baseEnergyCost: 0
    });
    this.duration = config.duration || 1;
    this.energyRestored = config.energyRestored || 20;
    this.healthRestored = config.healthRestored || 5;
  }
  
  canExecute(character, worldState) {
    const environment = worldState.getCurrentEnvironment();
    return !environment.isDangerous() && character.energy < character.maxEnergy;
  }
  
  getEnvironmentalModifier(environment) {
    return environment.getComfortLevel();
  }
}
```

#### WaitInteraction
```javascript
class WaitInteraction extends SystemInteraction {
  constructor(config = {}) {
    super({
      ...config,
      type: 'wait',
      priority: 'low',
      baseEnergyCost: 0
    });
    this.duration = config.duration || 1;
  }
  
  canExecute(character, worldState) {
    return true; // Always available as fallback
  }
}
```

#### ExamineInteraction
```javascript
class ExamineInteraction extends SystemInteraction {
  constructor(config = {}) {
    super({
      ...config,
      type: 'examine',
      priority: 'normal',
      baseEnergyCost: 2
    });
    this.targetId = config.targetId;
    this.targetType = config.targetType; // 'character', 'item', 'feature'
  }
  
  canExecute(character, worldState) {
    return this.targetId && this.isTargetInRange(character, worldState);
  }
}
```

## Components and Interfaces

### InteractionManager Service

The InteractionManager coordinates between system and content interactions:

```javascript
class InteractionManager {
  constructor() {
    this.systemInteractions = new Map();
    this.contentInteractions = new Map();
    this.interactionFactory = new InteractionFactory();
  }
  
  // Get all available interactions for a character
  getAvailableInteractions(character, worldState) {
    const available = [];
    
    // System interactions first (always considered)
    const systemInteractions = this.getSystemInteractions(character, worldState);
    available.push(...systemInteractions.map(si => ({
      interaction: si,
      priority: si.priority,
      isSystem: true,
      energyCost: si.getEnergyCost(character, worldState.getCurrentEnvironment())
    })));
    
    // Content interactions from current node
    const contentInteractions = this.getContentInteractions(character, worldState);
    available.push(...contentInteractions.map(ci => ({
      interaction: ci,
      priority: 'normal',
      isSystem: false,
      energyCost: this.calculateContentInteractionCost(ci, character, worldState)
    })));
    
    return available.sort((a, b) => this.comparePriority(a.priority, b.priority));
  }
  
  // Create system interactions for a character
  createSystemInteractions(character, worldState) {
    const interactions = [];
    const currentNode = worldState.getCurrentNode(character);
    const environment = currentNode.environment;
    
    // Movement interactions to connected nodes
    currentNode.connections.forEach(nodeId => {
      interactions.push(this.interactionFactory.createMovementInteraction({
        targetNodeId: nodeId,
        path: [nodeId] // Simple direct path
      }));
    });
    
    // Always available interactions
    interactions.push(
      this.interactionFactory.createPerceptionInteraction({ perceptionType: 'look' }),
      this.interactionFactory.createWaitInteraction({ duration: 1 }),
      this.interactionFactory.createExamineInteraction({ targetId: currentNode.id, targetType: 'node' })
    );
    
    // Conditional interactions
    if (!environment.isDangerous()) {
      interactions.push(this.interactionFactory.createRestInteraction({ duration: 1 }));
    }
    
    return interactions.filter(interaction => interaction.canExecute(character, worldState));
  }
}
```

### InteractionFactory

Creates appropriate interaction types based on configuration:

```javascript
class InteractionFactory {
  createSystemInteraction(type, config) {
    switch (type) {
      case 'movement':
        return new MovementInteraction(config);
      case 'perception':
        return new PerceptionInteraction(config);
      case 'rest':
        return new RestInteraction(config);
      case 'wait':
        return new WaitInteraction(config);
      case 'examine':
        return new ExamineInteraction(config);
      default:
        throw new Error(`Unknown system interaction type: ${type}`);
    }
  }
  
  createContentInteraction(config) {
    // Backward compatibility - create using existing Interaction class
    return new Interaction(config);
  }
  
  // Convenience methods for system interactions
  createMovementInteraction(config) {
    return this.createSystemInteraction('movement', config);
  }
  
  createPerceptionInteraction(config) {
    return this.createSystemInteraction('perception', config);
  }
  
  createRestInteraction(config) {
    return this.createSystemInteraction('rest', config);
  }
  
  createWaitInteraction(config) {
    return this.createSystemInteraction('wait', config);
  }
  
  createExamineInteraction(config) {
    return this.createSystemInteraction('examine', config);
  }
}
```

### Integration with GenerateBehavior

The behavior generation system is updated to use the hierarchical interaction system:

```javascript
// Enhanced GenerateBehavior.js
class GenerateBehavior {
  constructor() {
    this.interactionManager = new InteractionManager();
  }
  
  gatherAvailableInteractions(character, worldState) {
    // Use InteractionManager to get both system and content interactions
    const allInteractions = this.interactionManager.getAvailableInteractions(character, worldState);
    
    // Filter based on character state and priorities
    return allInteractions.filter(interactionData => {
      const { interaction, energyCost } = interactionData;
      
      // Energy check
      if (character.energy < energyCost) {
        return false;
      }
      
      // System interactions have guaranteed availability if energy sufficient
      if (interactionData.isSystem) {
        return true;
      }
      
      // Content interactions use existing logic
      return interaction.meetsRequirements && interaction.meetsRequirements(character);
    });
  }
  
  selectInteraction(character, availableInteractions, worldState) {
    // Prioritize system interactions based on character needs
    const systemInteractions = availableInteractions.filter(i => i.isSystem);
    const contentInteractions = availableInteractions.filter(i => !i.isSystem);
    
    // Check for critical needs first
    const criticalSystemInteraction = this.checkCriticalNeeds(character, systemInteractions, worldState);
    if (criticalSystemInteraction) {
      return criticalSystemInteraction.interaction;
    }
    
    // Use weighted selection for remaining interactions
    const allOptions = [...systemInteractions, ...contentInteractions];
    return this.weightedSelect(allOptions, character, worldState);
  }
  
  checkCriticalNeeds(character, systemInteractions, worldState) {
    // Low energy - prioritize rest
    if (character.energy < character.maxEnergy * 0.2) {
      const restInteraction = systemInteractions.find(i => i.interaction.type === 'rest');
      if (restInteraction) {
        return restInteraction;
      }
    }
    
    // Dangerous environment - prioritize movement
    const environment = worldState.getCurrentEnvironment();
    if (environment.isDangerous()) {
      const movementInteraction = systemInteractions.find(i => i.interaction.type === 'movement');
      if (movementInteraction) {
        return movementInteraction;
      }
    }
    
    return null;
  }
}
```

#### `calculateRemoteActivationChance(sourceCharacter, targetDistance, environment)`
Calculates success probability for remote interactions based on perception and distance.

```javascript
calculateRemoteActivationChance(sourceCharacter, targetDistance, environment) {
  if (!this.allowsRemoteActivation) {
    return { canActivate: false, reason: 'Remote activation not supported' };
  }
  
  // Base perception from character
  const perception = sourceCharacter.attributes.wisdom?.modifier || 0;
  
  // Distance penalty (exponential falloff)
  const distancePenalty = Math.exp(-targetDistance / 100); // 100 units = half effectiveness
  
  // Environmental factors
  const visibility = environment.getVisibilityModifier();
  const interference = environment.getTotalHazardDanger() * 0.3;
  
  // Calculate final chance
  const baseChance = 0.8; // 80% base success for remote activation
  const finalChance = baseChance * (1 + perception * 0.1) * distancePenalty * visibility * (1 - interference);
  
  return {
    canActivate: true,
    successChance: Math.max(0.05, Math.min(0.95, finalChance)),
    factors: {
      perception,
      distance: distancePenalty,
      visibility,
      interference
    }
  };
}
```

### Enhanced Core Methods

#### Updated `meetsRequirements(character, environment)`
Extends the existing requirements check to include environmental validation.

```javascript
meetsRequirements(character, environment = null) {
  // Existing attribute requirements
  const meetsAttributeReqs = this.requirements.every(req => {
    const attrValue = character.attributes[req.attr]?.score || 0;
    return attrValue >= req.min;
  });
  
  if (!meetsAttributeReqs) {
    return false;
  }
  
  // New environmental requirements
  if (environment && !this.meetsEnvironmentalRequirements(environment)) {
    return false;
  }
  
  // Resource requirements
  const resourceCheck = this.checkResourceRequirements(character);
  if (!resourceCheck.canAfford) {
    return false;
  }
  
  return true;
}
```

#### Enhanced `applyEffects(character, environment, accuracyResult)`
Modifies effect application based on accuracy and environmental factors.

```javascript
applyEffects(character, environment = null, accuracyResult = null) {
  // Calculate effectiveness modifier
  let effectivenessModifier = 1.0;
  
  if (accuracyResult && !accuracyResult.success) {
    effectivenessModifier = 0.3; // Partial effects on failure
  } else if (accuracyResult) {
    effectivenessModifier = Math.min(1.5, accuracyResult.modifier); // Bonus for high accuracy
  }
  
  // Apply environmental modifiers to effects
  if (environment) {
    const comfortLevel = environment.getComfortLevel();
    effectivenessModifier *= (0.7 + comfortLevel * 0.3); // 70-100% based on comfort
  }
  
  // Apply effects with modifiers
  this.effects.forEach(effect => {
    const modifiedValue = effect.value * effectivenessModifier;
    this._applyIndividualEffect(character, { ...effect, value: modifiedValue });
  });
  
  // Consume resources if successful
  if (!accuracyResult || accuracyResult.success) {
    this._consumeResources(character);
  }
}
```

## Data Models

### System Interaction Configuration
```javascript
// Base system interaction configuration
{
  id: string,
  name: string,
  description: string,
  type: 'movement' | 'perception' | 'rest' | 'wait' | 'examine',
  priority: 'critical' | 'high' | 'normal' | 'low',
  baseEnergyCost: number,
  isSystemInteraction: true
}

// Movement-specific configuration
{
  ...baseConfig,
  type: 'movement',
  targetNodeId: string,
  path: string[],
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme'
}

// Perception-specific configuration
{
  ...baseConfig,
  type: 'perception',
  perceptionType: 'look' | 'listen' | 'sense' | 'search',
  range: number,
  targetType?: 'character' | 'item' | 'feature' | 'all'
}
```

### Content Interaction Enhancement
```javascript
// Enhanced content interaction structure
{
  ...existingInteractionProperties,
  isContentInteraction: true,
  category: 'social' | 'combat' | 'economic' | 'exploration' | 'crafting' | 'magic',
  author: string,
  tags: string[],
  overrideFlags: {
    canInterruptSystem: boolean,    // Can interrupt system interactions
    requiresSystemPrereq: string,   // Requires specific system interaction first
    blocksSystemInteractions: string[] // Blocks specific system interactions
  },
  environmentalIntegration: {
    affectedByVisibility: boolean,
    affectedByDanger: boolean,
    affectedByComfort: boolean,
    terrainModifiers: Map<string, number>
  }
}
```

### Interaction Execution Result
```javascript
// Result structure for interaction execution
{
  success: boolean,
  interaction: InteractionBase,
  energyConsumed: number,
  effects: [{
    type: string,
    target: string,
    value: any,
    applied: boolean
  }],
  environmentalFactors: {
    visibility: number,
    movement: number,
    comfort: number,
    danger: number
  },
  nextAvailableInteractions: InteractionBase[],
  logs: string[]
}
```

## Error Handling

### System Interaction Errors
- **Missing Target Node**: Movement interactions gracefully handle invalid targets
- **Environment Unavailable**: System interactions use safe defaults
- **Energy Calculation Errors**: Fall back to base energy costs
- **Immutability Violations**: Prevent runtime modification of system interactions

### Content Interaction Errors
- **Backward Compatibility**: Existing interactions continue working with missing properties
- **Invalid Categories**: Default to 'general' category
- **Missing Author Information**: Default to 'system' author
- **Malformed Override Flags**: Ignore invalid flags and log warnings

### Integration Errors
```javascript
// Safe interaction execution with error handling
class InteractionExecutor {
  executeInteraction(interaction, character, worldState) {
    try {
      // Validate preconditions
      if (!this.validateExecution(interaction, character, worldState)) {
        return this.createFailureResult('Preconditions not met');
      }
      
      // Execute with environmental context
      const environment = worldState.getCurrentEnvironment();
      const result = interaction.execute(character, worldState);
      
      // Apply environmental modifiers
      this.applyEnvironmentalEffects(result, environment);
      
      return result;
    } catch (error) {
      console.error(`Interaction execution failed:`, error);
      return this.createErrorResult(error);
    }
  }
  
  createFailureResult(reason) {
    return {
      success: false,
      reason,
      energyConsumed: 0,
      effects: [],
      logs: [`Interaction failed: ${reason}`]
    };
  }
}
```

## Testing Strategy

### Unit Tests
- **System Interaction Classes**: Test each system interaction type independently
- **Hierarchical Structure**: Verify inheritance and polymorphism work correctly
- **Environmental Integration**: Test environmental modifiers and availability checks
- **Backward Compatibility**: Ensure existing Interaction class remains functional
- **Immutability**: Verify system interactions cannot be modified after creation

### Integration Tests
- **InteractionManager**: Test coordination between system and content interactions
- **GenerateBehavior Integration**: Verify NPC behavior uses hierarchical system
- **Environment Integration**: Test with various environment configurations
- **Character State Management**: Test energy consumption and resource tracking
- **Turn-Based Simulation**: Test within complete simulation cycles

### Performance Tests
- **Large NPC Populations**: Test with hundreds of NPCs making decisions
- **Complex Node Networks**: Test movement interactions across large worlds
- **Memory Efficiency**: Verify no memory leaks from interaction creation
- **Decision Speed**: Benchmark interaction selection and execution times

### Test Data Examples
```javascript
// Test system interaction creation and execution
const movementTest = new MovementInteraction({
  targetNodeId: 'market_square',
  path: ['market_square'],
  difficulty: 'normal'
});

// Test content interaction with system integration
const negotiateTest = new Interaction({
  name: 'Negotiate Trade Deal',
  category: 'economic',
  requirements: [{ attr: 'charisma', min: 12 }],
  overrideFlags: {
    requiresSystemPrereq: 'examine' // Must examine target first
  }
});

// Test hierarchical behavior selection
const behaviorTest = {
  character: testCharacter,
  worldState: testWorldState,
  expectedSystemInteractions: ['movement', 'perception', 'wait'],
  expectedContentInteractions: ['negotiate', 'gossip'],
  expectedSelection: 'movement' // Low energy should prioritize movement to safety
};
```