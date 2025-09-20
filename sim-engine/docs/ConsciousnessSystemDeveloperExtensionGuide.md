# Consciousness System Developer Extension Guide

This guide provides comprehensive instructions for extending and customizing the consciousness system. Whether you're adding new behavioral patterns, creating custom event types, or integrating the system with new game mechanics, this guide will help you maintain architectural integrity while adding powerful new capabilities.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Adding Custom Event Types](#adding-custom-event-types)
3. [Extending Behavioral Calculations](#extending-behavioral-calculations)
4. [Creating Custom Services](#creating-custom-services)
5. [Modifying Consciousness Parameters](#modifying-consciousness-parameters)
6. [Custom Memory Systems](#custom-memory-systems)
7. [Integration Patterns](#integration-patterns)
8. [Testing Extensions](#testing-extensions)
9. [Performance Considerations](#performance-considerations)
10. [Migration Strategies](#migration-strategies)

## Architecture Overview

### Core Extension Points

The consciousness system is designed with clear extension points:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  (UI, User Interactions, Event Generation)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Application Layer                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         BehavioralStateService (Extensible)         │   │
│  │         ConsciousnessUpdateService (Extensible)     │   │
│  │         Custom Services (Your Extensions)           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Domain Layer                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         EnhancedConsciousnessState (Extensible)     │   │
│  │         EventSignificanceService (Configurable)     │   │
│  │         SignificantMemoryService (Extensible)       │   │
│  │         Domain Services (Base Classes)               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               Infrastructure Layer                          │
│  (Persistence, External Services, Utilities)                │
└─────────────────────────────────────────────────────────────┘
```

### Extension Principles

1. **Dependency Inversion**: Extensions depend on abstractions, not concretions
2. **Open/Closed Principle**: System is open for extension, closed for modification
3. **Single Responsibility**: Each extension has one clear purpose
4. **Composition over Inheritance**: Favor composition for extensibility
5. **Configuration over Code**: Use configuration when possible

## Adding Custom Event Types

### Basic Event Type Extension

```javascript
import { EventSignificanceService } from '../domain/services/EventSignificanceService.js';

// Extend the base event significance service
class ExtendedEventSignificanceService extends EventSignificanceService {
  constructor() {
    super();

    // Add custom event types
    this.addCustomEventTypes();
  }

  addCustomEventTypes() {
    // Add romance-related events
    this.setEventTypeSignificance('romantic_encounter', 0.7);
    this.setEventTypeSignificance('heartbreak', 0.8);
    this.setEventTypeSignificance('marriage_proposal', 0.9);
    this.setEventTypeSignificance('divorce', 0.8);

    // Add career-related events
    this.setEventTypeSignificance('promotion', 0.6);
    this.setEventTypeSignificance('demotion', 0.5);
    this.setEventTypeSignificance('career_change', 0.7);
    this.setEventTypeSignificance('retirement', 0.6);

    // Add supernatural events
    this.setEventTypeSignificance('magical_awakening', 0.9);
    this.setEventTypeSignificance('curse', 0.7);
    this.setEventTypeSignificance('blessing', 0.8);
    this.setEventTypeSignificance('prophecy', 0.6);
  }

  // Override significance calculation for custom logic
  calculateEventSignificance(event, context = {}) {
    // Handle custom event types with special logic
    if (event.type === 'romantic_encounter') {
      return this.calculateRomanticSignificance(event, context);
    }

    if (event.type === 'magical_awakening') {
      return this.calculateMagicalSignificance(event, context);
    }

    // Fall back to parent implementation
    return super.calculateEventSignificance(event, context);
  }

  calculateRomanticSignificance(event, context) {
    let significance = 0.7; // Base significance

    // Adjust based on relationship history
    if (context.existingRelationshipStrength) {
      if (context.existingRelationshipStrength > 50) {
        significance += 0.1; // More significant if already in relationship
      }
    }

    // Adjust based on character personality
    if (context.characterPersonality?.romance_sensitivity) {
      significance *= (0.8 + context.characterPersonality.romance_sensitivity * 0.4);
    }

    return Math.min(1.0, significance);
  }

  calculateMagicalSignificance(event, context) {
    let significance = 0.9; // High base significance

    // Adjust based on magical aptitude
    if (context.magicalAptitude) {
      significance *= (0.5 + context.magicalAptitude); // 0.5x to 1.5x multiplier
    }

    // Adjust based on world magic level
    if (context.worldMagicLevel === 'high') {
      significance *= 1.2;
    } else if (context.worldMagicLevel === 'low') {
      significance *= 0.8;
    }

    return Math.min(1.0, significance);
  }
}

// Usage
const customSignificanceService = new ExtendedEventSignificanceService();

// Now you can use custom events
const romanticEvent = {
  type: 'romantic_encounter',
  outcome: 'success',
  emotionalImpact: 0.9,
  description: 'A chance meeting that sparks romance'
};

const significance = customSignificanceService.calculateEventSignificance(romanticEvent, {
  existingRelationshipStrength: 30,
  characterPersonality: { romance_sensitivity: 0.8 }
});
```

### Advanced Event Type with Custom Rules

```javascript
class AdvancedEventSignificanceService extends EventSignificanceService {
  constructor() {
    super();
    this.customRules = new Map();
    this.setupCustomRules();
  }

  setupCustomRules() {
    // Define complex rules for event significance
    this.customRules.set('political_intrigue', {
      baseSignificance: 0.7,
      rules: [
        {
          condition: (event, context) => context.involvesRoyalFamily,
          modifier: 1.5
        },
        {
          condition: (event, context) => context.hasInternationalImplications,
          modifier: 1.3
        },
        {
          condition: (event, context) => context.character.importance === 'minor',
          modifier: 0.7
        }
      ]
    });

    this.customRules.set('economic_crisis', {
      baseSignificance: 0.8,
      rules: [
        {
          condition: (event, context) => context.affectsEntireRegion,
          modifier: 1.4
        },
        {
          condition: (event, context) => context.economicScale === 'global',
          modifier: 1.6
        },
        {
          condition: (event, context) => context.hasImmediateEffects,
          modifier: 1.2
        }
      ]
    });
  }

  calculateEventSignificance(event, context = {}) {
    // Check if we have custom rules for this event type
    const customRule = this.customRules.get(event.type);
    if (customRule) {
      return this.applyCustomRules(event, context, customRule);
    }

    // Fall back to parent implementation
    return super.calculateEventSignificance(event, context);
  }

  applyCustomRules(event, context, rule) {
    let significance = rule.baseSignificance;

    // Apply outcome modifier
    significance *= this.getOutcomeModifier(event.outcome);

    // Apply custom rules
    for (const ruleDef of rule.rules) {
      if (ruleDef.condition(event, context)) {
        significance *= ruleDef.modifier;
      }
    }

    // Apply emotional impact
    significance *= this.getEmotionalImpactMultiplier(event.emotionalImpact);

    // Apply contextual modifiers
    significance = this.applyContextualModifiers(significance, event, context);

    return Math.max(0.0, Math.min(1.0, significance));
  }

  // Add method to register new custom rules at runtime
  registerCustomRule(eventType, ruleDefinition) {
    this.customRules.set(eventType, ruleDefinition);
  }

  // Add method to modify existing rules
  modifyRule(eventType, modifier) {
    const existingRule = this.customRules.get(eventType);
    if (existingRule) {
      modifier(existingRule);
    }
  }
}
```

## Extending Behavioral Calculations

### Custom Personality Traits

```javascript
import { BehavioralStateService } from '../domain/services/BehavioralStateService.js';

class ExtendedBehavioralStateService extends BehavioralStateService {
  constructor(memoryService, logger, errorHandler) {
    super(memoryService, logger, errorHandler);

    // Add custom personality traits
    this.addCustomPersonalityTraits();

    // Add custom interaction types
    this.addCustomInteractionTypes();
  }

  addCustomPersonalityTraits() {
    // Extend existing interaction mappings with custom traits
    const customTraits = {
      'magical_aptitude': {
        'social': 1.1,    // Magic users are more charismatic
        'combat': 1.2,    // Magic enhances combat ability
        'exploration': 1.3 // Magic aids discovery
      },
      'animal_kinship': {
        'social': 0.9,    // Less comfortable with other humans
        'exploration': 1.4, // Better in wilderness
        'rest': 1.2       // Comfortable in nature
      },
      'technological': {
        'economic': 1.3,  // Better at trade/tech
        'exploration': 0.8, // Less comfortable in wilderness
        'combat': 1.1     // Tech advantages in combat
      }
    };

    // Merge custom traits into existing mappings
    Object.keys(this.interactionTypeMappings).forEach(interactionType => {
      const mapping = this.interactionTypeMappings[interactionType];
      mapping.personalityTraits = {
        ...mapping.personalityTraits,
        ...Object.fromEntries(
          Object.entries(customTraits).map(([trait, modifiers]) => [
            trait,
            modifiers[interactionType] || 1.0
          ])
        )
      };
    });
  }

  addCustomInteractionTypes() {
    // Add magical interaction type
    this.interactionTypeMappings['magical'] = {
      baseModifier: 1.0,
      personalityTraits: {
        'magical_aptitude': 1.5,
        'intelligence': 1.3,
        'wisdom': 1.2,
        'technological': 0.7
      },
      consciousnessFactors: {
        focus: 1.2,
        ambition: 1.1
      }
    };

    // Add diplomatic interaction type
    this.interactionTypeMappings['diplomatic'] = {
      baseModifier: 1.0,
      personalityTraits: {
        'charisma': 1.4,
        'intelligence': 1.2,
        'empathy': 1.3,
        'aggression': 0.6
      },
      consciousnessFactors: {
        socialDrive: 1.3,
        coherence: 1.1
      }
    };
  }

  // Override personality modifier calculation to handle custom traits
  getPersonalityModifier(character, interactionType) {
    if (!character || !character.personality) {
      return 1.0;
    }

    const typeMapping = this.interactionTypeMappings[interactionType];
    if (!typeMapping) {
      return 1.0;
    }

    let modifier = 1.0;
    const personalityTraits = character.personality.getAllTraits ?
      character.personality.getAllTraits() :
      character.personality;

    // Apply standard traits
    Object.entries(typeMapping.personalityTraits).forEach(([trait, traitModifier]) => {
      const traitValue = personalityTraits[trait] || 0.5;
      const traitInfluence = (traitValue - 0.5) * 2;
      modifier *= (1 + traitInfluence * (traitModifier - 1));
    });

    // Apply custom trait logic
    modifier *= this.applyCustomTraitLogic(character, interactionType, personalityTraits);

    return modifier;
  }

  applyCustomTraitLogic(character, interactionType, traits) {
    let modifier = 1.0;

    // Special logic for trait combinations
    if (traits.magical_aptitude > 0.7 && traits.technological > 0.7) {
      if (interactionType === 'magical') {
        modifier *= 1.2; // Tech-magic hybrid advantage
      }
    }

    // Animal kinship bonus in appropriate environments
    if (traits.animal_kinship > 0.6 && interactionType === 'exploration') {
      modifier *= 1.1;
    }

    return modifier;
  }

  // Add method to dynamically add traits
  addPersonalityTrait(traitName, interactionModifiers) {
    Object.keys(this.interactionTypeMappings).forEach(interactionType => {
      if (this.interactionTypeMappings[interactionType].personalityTraits) {
        this.interactionTypeMappings[interactionType].personalityTraits[traitName] =
          interactionModifiers[interactionType] || 1.0;
      }
    });
  }
}
```

### Custom Consciousness Factors

```javascript
class AdvancedBehavioralStateService extends BehavioralStateService {
  constructor(memoryService, logger, errorHandler) {
    super(memoryService, logger, errorHandler);

    // Add custom consciousness factors
    this.customConsciousnessFactors = new Map();
    this.setupCustomFactors();
  }

  setupCustomFactors() {
    // Add magical consciousness factor
    this.customConsciousnessFactors.set('magical_resonance', {
      calculator: (consciousness) => {
        // Calculate based on frequency harmonics
        const frequency = consciousness.baseFrequency;
        const coherence = consciousness.baseCoherence;

        // Magical resonance peaks at certain frequencies
        const harmonicMatch = Math.abs(frequency - 13) < 2 ? 1.0 :
                             Math.abs(frequency - 7.5) < 1 ? 0.8 : 0.4;

        return harmonicMatch * coherence;
      },
      defaultValue: 0.5
    });

    // Add creativity factor
    this.customConsciousnessFactors.set('creativity', {
      calculator: (consciousness) => {
        // Creativity emerges from balanced but dynamic states
        const frequency = consciousness.baseFrequency;
        const coherence = consciousness.baseCoherence;

        const balance = 1 - Math.abs(frequency - 7.5) / 4.5; // 0-1 balance score
        const dynamism = coherence * (1 - Math.abs(coherence - 0.7) / 0.3);

        return (balance * 0.6 + dynamism * 0.4);
      },
      defaultValue: 0.5
    });
  }

  // Override consciousness modifier to include custom factors
  getConsciousnessModifier(character, interactionType) {
    const baseModifier = super.getConsciousnessModifier(character, interactionType);

    if (!character || !character.consciousness) {
      return baseModifier;
    }

    const typeMapping = this.interactionTypeMappings[interactionType];
    if (!typeMapping) {
      return baseModifier;
    }

    let modifier = baseModifier;

    // Apply custom consciousness factors
    Object.entries(typeMapping.consciousnessFactors).forEach(([factor, factorModifier]) => {
      const customFactor = this.customConsciousnessFactors.get(factor);
      if (customFactor) {
        const factorValue = customFactor.calculator(character.consciousness);
        const factorInfluence = (factorValue - 0.5) * 2;
        modifier *= (1 + factorInfluence * (factorModifier - 1));
      }
    });

    return modifier;
  }

  // Add method to register custom consciousness factors
  registerConsciousnessFactor(name, calculator, defaultValue = 0.5) {
    this.customConsciousnessFactors.set(name, {
      calculator,
      defaultValue
    });
  }

  // Add method to add factor to interaction types
  addFactorToInteractionType(interactionType, factorName, modifier) {
    if (this.interactionTypeMappings[interactionType]) {
      this.interactionTypeMappings[interactionType].consciousnessFactors[factorName] = modifier;
    }
  }
}
```

## Creating Custom Services

### Custom Consciousness Service

```javascript
import BaseDomainService from './BaseDomainService.js';
import { EnhancedConsciousnessState } from '../value-objects/EnhancedConsciousnessState.js';

class CustomConsciousnessService extends BaseDomainService {
  constructor(eventSignificanceService, logger, errorHandler) {
    super();
    this.eventSignificanceService = eventSignificanceService;
    this.logger = logger;
    this.errorHandler = errorHandler;

    // Custom consciousness parameters
    this.customParameters = new Map();
    this.parameterUpdaters = new Map();

    this.initializeCustomParameters();
  }

  initializeCustomParameters() {
    // Add custom consciousness parameters
    this.addCustomParameter('magical_affinity', {
      defaultValue: 0.5,
      min: 0.0,
      max: 1.0,
      updateRules: {
        'magical_awakening': (current, event) => Math.min(1.0, current + 0.2),
        'magical_exhaustion': (current, event) => Math.max(0.0, current - 0.3),
        'spellcasting_success': (current, event) => Math.min(1.0, current + 0.05),
        'spellcasting_failure': (current, event) => Math.max(0.0, current - 0.1)
      }
    });

    this.addCustomParameter('social_harmony', {
      defaultValue: 0.5,
      min: 0.0,
      max: 1.0,
      updateRules: {
        'social_success': (current, event) => Math.min(1.0, current + 0.1),
        'social_failure': (current, event) => Math.max(0.0, current - 0.15),
        'relationship_improvement': (current, event) => Math.min(1.0, current + 0.05),
        'conflict': (current, event) => Math.max(0.0, current - 0.2)
      }
    });
  }

  addCustomParameter(name, config) {
    this.customParameters.set(name, config);
    this.parameterUpdaters.set(name, config.updateRules);
  }

  // Extend consciousness state with custom parameters
  extendConsciousnessState(baseState) {
    const extendedState = { ...baseState };

    // Add custom parameters
    for (const [paramName, config] of this.customParameters) {
      extendedState[paramName] = config.defaultValue;
    }

    return extendedState;
  }

  // Update custom parameters based on events
  updateCustomParameters(consciousness, event) {
    const updates = {};

    for (const [paramName, updater] of this.parameterUpdaters) {
      const updateRule = updater[event.type];
      if (updateRule) {
        const currentValue = consciousness[paramName] || this.customParameters.get(paramName).defaultValue;
        const newValue = updateRule(currentValue, event);

        // Ensure bounds
        const config = this.customParameters.get(paramName);
        updates[paramName] = Math.max(config.min, Math.min(config.max, newValue));
      }
    }

    return updates;
  }

  // Integrate with standard consciousness updates
  async processEventWithCustomParameters(character, event, context = {}) {
    try {
      // Check if event is significant
      const significance = this.eventSignificanceService.calculateEventSignificance(event, context);

      if (significance < 0.3) {
        return { updated: false, significance };
      }

      // Update standard consciousness
      const standardResult = await this.updateStandardConsciousness(character, event, significance);

      // Update custom parameters
      const customUpdates = this.updateCustomParameters(character.consciousness, event);

      // Apply custom updates
      Object.assign(character.consciousness, customUpdates);

      // Regenerate behavioral state if needed
      if (standardResult.updated || Object.keys(customUpdates).length > 0) {
        character.consciousness.behavioralState =
          character.consciousness.generateBehavioralState();
      }

      return {
        updated: true,
        significance,
        standardUpdates: standardResult.parameterChanges,
        customUpdates
      };

    } catch (error) {
      this.errorHandler.handleOperationFailure(error, {
        operation: 'custom_consciousness_update',
        character,
        event
      });

      return { updated: false, error: error.message };
    }
  }

  async updateStandardConsciousness(character, event, significance) {
    // Delegate to standard update service
    const updateService = new ConsciousnessUpdateService(this.eventSignificanceService);
    return await updateService.processEvent(character, event);
  }

  // Get custom parameter influence on behavior
  getCustomParameterModifier(character, interactionType, parameterName) {
    if (!character.consciousness) return 1.0;

    const paramValue = character.consciousness[parameterName];
    if (paramValue === undefined) return 1.0;

    const config = this.customParameters.get(parameterName);
    if (!config) return 1.0;

    // Define how custom parameters affect different interaction types
    const influenceMap = {
      magical_affinity: {
        magical: (value) => 0.5 + value,     // 0.5x to 1.5x
        combat: (value) => 0.8 + value * 0.4, // 0.8x to 1.2x
        exploration: (value) => 0.9 + value * 0.2 // 0.9x to 1.1x
      },
      social_harmony: {
        social: (value) => 0.7 + value * 0.6, // 0.7x to 1.3x
        diplomatic: (value) => 0.6 + value * 0.8, // 0.6x to 1.4x
        relationship: (value) => 0.8 + value * 0.4 // 0.8x to 1.2x
      }
    };

    const influence = influenceMap[parameterName]?.[interactionType];
    return influence ? influence(paramValue) : 1.0;
  }
}
```

### Custom Memory Service

```javascript
import { SignificantMemoryService } from './SignificantMemoryService.js';

class CustomMemoryService extends SignificantMemoryService {
  constructor(logger, errorHandler) {
    super(logger, errorHandler);

    // Custom memory types
    this.customMemoryTypes = new Set([
      'magical_experience',
      'prophetic_vision',
      'ancestral_memory',
      'traumatic_flashback'
    ]);

    // Custom memory processing rules
    this.memoryProcessors = new Map();
    this.setupCustomProcessors();
  }

  setupCustomProcessors() {
    // Magical experience processor
    this.memoryProcessors.set('magical_experience', (memory, character) => {
      // Magical experiences have longer-lasting impact
      memory.significance *= 1.2;

      // Add magical resonance to memory
      memory.magicalResonance = this.calculateMagicalResonance(character, memory);

      return memory;
    });

    // Prophetic vision processor
    this.memoryProcessors.set('prophetic_vision', (memory, character) => {
      // Prophetic visions are highly significant
      memory.significance = Math.min(1.0, memory.significance * 1.5);

      // Add prophecy metadata
      memory.prophecyFulfilled = false;
      memory.prophecyTimeframe = this.extractTimeframe(memory);

      return memory;
    });

    // Ancestral memory processor
    this.memoryProcessors.set('ancestral_memory', (memory, character) => {
      // Ancestral memories have cultural significance
      memory.culturalSignificance = this.calculateCulturalSignificance(character, memory);

      // They persist longer
      memory.persistenceMultiplier = 2.0;

      return memory;
    });
  }

  // Override memory addition to handle custom types
  addMemoryIfSignificant(character, memory) {
    // Apply custom processing
    const processor = this.memoryProcessors.get(memory.type);
    if (processor) {
      memory = processor(memory, character);
    }

    // Call parent implementation
    return super.addMemoryIfSignificant(character, memory);
  }

  // Custom memory retrieval with enhanced filtering
  getRelevantMemories(character, interactionType, maxMemories = 5, context = {}) {
    const allMemories = super.getRelevantMemories(character, interactionType, maxMemories * 2, context);

    // Apply custom filtering and ranking
    return this.rankAndFilterMemories(allMemories, interactionType, context, maxMemories);
  }

  rankAndFilterMemories(memories, interactionType, context, maxMemories) {
    return memories
      .map(memory => ({
        ...memory,
        customScore: this.calculateCustomMemoryScore(memory, interactionType, context)
      }))
      .sort((a, b) => b.customScore - a.customScore)
      .slice(0, maxMemories);
  }

  calculateCustomMemoryScore(memory, interactionType, context) {
    let score = memory.significance;

    // Apply custom scoring rules
    if (memory.type === 'magical_experience' && interactionType === 'magical') {
      score *= 1.3;
    }

    if (memory.type === 'prophetic_vision' && context.involvesProphecy) {
      score *= 1.4;
    }

    if (memory.type === 'ancestral_memory' && context.culturalContext) {
      score *= 1.2;
    }

    // Apply recency with custom persistence
    const persistence = memory.persistenceMultiplier || 1.0;
    const age = Date.now() - memory.timestamp;
    const decayFactor = Math.exp(-age / (30 * 24 * 60 * 60 * 1000 * persistence)); // 30 days * persistence
    score *= decayFactor;

    return score;
  }

  calculateMagicalResonance(character, memory) {
    // Calculate how magically resonant this memory is
    let resonance = 0.5;

    if (character.consciousness?.magical_affinity) {
      resonance += character.consciousness.magical_affinity * 0.3;
    }

    if (memory.outcome === 'success') {
      resonance += 0.2;
    }

    return Math.min(1.0, resonance);
  }

  calculateCulturalSignificance(character, memory) {
    // Calculate cultural importance of ancestral memory
    // This would depend on character's cultural background
    return 0.8; // Placeholder
  }

  extractTimeframe(memory) {
    // Extract temporal information from prophetic visions
    const description = memory.description.toLowerCase();

    if (description.includes('tomorrow') || description.includes('soon')) {
      return 'short';
    }
    if (description.includes('month') || description.includes('season')) {
      return 'medium';
    }
    if (description.includes('year') || description.includes('future')) {
      return 'long';
    }

    return 'unknown';
  }

  // Add method to register custom memory processors
  registerMemoryProcessor(memoryType, processor) {
    this.memoryProcessors.set(memoryType, processor);
    this.customMemoryTypes.add(memoryType);
  }

  // Add method to get memories by custom criteria
  getMemoriesByCriteria(character, criteria) {
    if (!character.significantMemories) return [];

    return character.significantMemories.filter(memory => {
      return Object.entries(criteria).every(([key, value]) => {
        if (key === 'type') return memory.type === value;
        if (key === 'outcome') return memory.outcome === value;
        if (key === 'minSignificance') return memory.significance >= value;
        if (key === 'maxAge') return (Date.now() - memory.timestamp) <= value;
        return true;
      });
    });
  }
}
```

## Modifying Consciousness Parameters

### Dynamic Parameter Ranges

```javascript
class DynamicConsciousnessState extends EnhancedConsciousnessState {
  constructor(config = {}) {
    super(config);

    // Dynamic parameter ranges based on character type
    this.parameterRanges = {
      frequency: { min: 3.0, max: 15.0 },  // Default
      coherence: { min: 0.2, max: 1.0 }   // Default
    };

    this.setupDynamicRanges(config.characterType);
  }

  setupDynamicRanges(characterType) {
    switch (characterType) {
      case 'elf':
        // Elves have more stable, higher frequency consciousness
        this.parameterRanges.frequency = { min: 8.0, max: 15.0 };
        this.parameterRanges.coherence = { min: 0.6, max: 1.0 };
        break;

      case 'orc':
        // Orcs have lower, more variable consciousness
        this.parameterRanges.frequency = { min: 3.0, max: 10.0 };
        this.parameterRanges.coherence = { min: 0.2, max: 0.8 };
        break;

      case 'dwarf':
        // Dwarves have stable, moderate consciousness
        this.parameterRanges.frequency = { min: 5.0, max: 12.0 };
        this.parameterRanges.coherence = { min: 0.4, max: 0.9 };
        break;

      case 'dragon':
        // Dragons have very high, stable consciousness
        this.parameterRanges.frequency = { min: 12.0, max: 15.0 };
        this.parameterRanges.coherence = { min: 0.8, max: 1.0 };
        break;
    }
  }

  // Override validation methods to use dynamic ranges
  validateFrequency(frequency) {
    const range = this.parameterRanges.frequency;
    return Math.max(range.min, Math.min(range.max, frequency));
  }

  validateCoherence(coherence) {
    const range = this.parameterRanges.coherence;
    return Math.max(range.min, Math.min(range.max, coherence));
  }

  // Add method to adjust ranges based on character development
  adjustRangesForDevelopment(level) {
    // As characters develop, their consciousness ranges expand slightly
    const expansion = Math.min(0.5, level / 100); // Max 0.5 expansion

    this.parameterRanges.frequency.min = Math.max(3.0, this.parameterRanges.frequency.min - expansion);
    this.parameterRanges.frequency.max = Math.min(15.0, this.parameterRanges.frequency.max + expansion);
    this.parameterRanges.coherence.min = Math.max(0.2, this.parameterRanges.coherence.min - expansion * 0.1);
    this.parameterRanges.coherence.max = Math.min(1.0, this.parameterRanges.coherence.max + expansion * 0.1);
  }
}
```

### Custom Update Rules

```javascript
class CustomConsciousnessUpdateService extends ConsciousnessUpdateService {
  constructor(eventSignificanceService, logger, errorHandler) {
    super(eventSignificanceService, logger, errorHandler);

    // Custom update rules
    this.customUpdateRules = new Map();
    this.setupCustomRules();
  }

  setupCustomRules() {
    // Add custom event types with specific update rules
    this.customUpdateRules.set('magical_awakening', {
      frequency: +1.0,
      coherence: +0.1,
      description: 'Magical awakening dramatically increases consciousness frequency'
    });

    this.customUpdateRules.set('identity_crisis', {
      frequency: -0.5,
      coherence: -0.2,
      description: 'Identity crisis disrupts consciousness stability'
    });

    this.customUpdateRules.set('enlightenment', {
      frequency: +0.8,
      coherence: +0.15,
      description: 'Enlightenment brings higher consciousness and stability'
    });

    // Seasonal consciousness changes
    this.customUpdateRules.set('seasonal_change', {
      frequency: (current, event) => {
        const season = event.season;
        switch (season) {
          case 'spring': return current + 0.3;  // Renewal
          case 'summer': return current + 0.2;  // Energy
          case 'autumn': return current - 0.1;  // Reflection
          case 'winter': return current - 0.2;  // Dormancy
          default: return current;
        }
      },
      coherence: (current, event) => {
        const season = event.season;
        switch (season) {
          case 'spring': return Math.min(1.0, current + 0.05);
          case 'summer': return Math.min(1.0, current + 0.03);
          case 'autumn': return Math.max(0.2, current - 0.02);
          case 'winter': return Math.max(0.2, current - 0.05);
          default: return current;
        }
      },
      description: 'Seasonal changes affect consciousness naturally'
    });
  }

  // Override update rules application
  applyEventUpdates(event) {
    // Check for custom rules first
    const customRule = this.customUpdateRules.get(event.type);
    if (customRule) {
      return this.applyCustomRule(customRule, event);
    }

    // Fall back to parent implementation
    return super.applyEventUpdates(event);
  }

  applyCustomRule(rule, event) {
    const updates = {};

    // Handle frequency update
    if (typeof rule.frequency === 'function') {
      updates.frequency = rule.frequency(this.character.consciousness.baseFrequency, event);
    } else if (typeof rule.frequency === 'number') {
      updates.frequency = this.character.consciousness.baseFrequency + rule.frequency;
    }

    // Handle coherence update
    if (typeof rule.coherence === 'function') {
      updates.coherence = rule.coherence(this.character.consciousness.baseCoherence, event);
    } else if (typeof rule.coherence === 'number') {
      updates.coherence = this.character.consciousness.baseCoherence + rule.coherence;
    }

    // Apply bounds
    if (updates.frequency !== undefined) {
      updates.frequency = this.validateFrequency(updates.frequency);
    }
    if (updates.coherence !== undefined) {
      updates.coherence = this.validateCoherence(updates.coherence);
    }

    return updates;
  }

  // Add method to register custom update rules
  registerUpdateRule(eventType, rule) {
    this.customUpdateRules.set(eventType, rule);
  }

  // Add method to modify existing rules
  modifyUpdateRule(eventType, modifier) {
    const existingRule = this.customUpdateRules.get(eventType);
    if (existingRule) {
      modifier(existingRule);
    }
  }

  // Contextual update rules based on character state
  applyContextualUpdates(event, context) {
    let updates = this.applyEventUpdates(event);

    // Apply contextual modifiers
    if (context.health < 0.3) {
      // Injury reduces consciousness
      updates.frequency *= 0.8;
      updates.coherence *= 0.7;
    }

    if (context.magical_exhaustion) {
      // Magical exhaustion affects consciousness
      updates.frequency *= 0.9;
      updates.coherence *= 0.8;
    }

    if (context.enlightened_state) {
      // Enlightened characters have enhanced consciousness
      updates.frequency *= 1.1;
      updates.coherence = Math.min(1.0, updates.coherence * 1.2);
    }

    return updates;
  }
}
```

## Custom Memory Systems

### Emotional Memory System

```javascript
class EmotionalMemoryService extends SignificantMemoryService {
  constructor(logger, errorHandler) {
    super(logger, errorHandler);

    // Emotional memory categories
    this.emotionCategories = {
      joy: { baseRetention: 1.2, influence: 'positive' },
      sadness: { baseRetention: 1.1, influence: 'negative' },
      anger: { baseRetention: 1.3, influence: 'negative' },
      fear: { baseRetention: 1.4, influence: 'negative' },
      love: { baseRetention: 1.5, influence: 'positive' },
      pride: { baseRetention: 1.2, influence: 'positive' },
      shame: { baseRetention: 1.1, influence: 'negative' },
      surprise: { baseRetention: 0.9, influence: 'neutral' }
    };
  }

  // Override memory addition to include emotional processing
  addMemoryIfSignificant(character, memory) {
    // Analyze emotional content
    memory.emotionalAnalysis = this.analyzeEmotionalContent(memory);

    // Adjust significance based on emotion
    memory.significance *= this.getEmotionalSignificanceMultiplier(memory.emotionalAnalysis);

    return super.addMemoryIfSignificant(character, memory);
  }

  analyzeEmotionalContent(memory) {
    const description = memory.description.toLowerCase();
    const emotions = {};

    // Simple keyword-based emotion detection
    Object.keys(this.emotionCategories).forEach(emotion => {
      const keywords = this.getEmotionKeywords(emotion);
      const matches = keywords.filter(keyword => description.includes(keyword)).length;
      emotions[emotion] = matches / keywords.length; // 0-1 intensity
    });

    // Find primary emotion
    const primaryEmotion = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      emotions,
      primaryEmotion: primaryEmotion[0],
      intensity: primaryEmotion[1],
      valence: this.emotionCategories[primaryEmotion[0]].influence
    };
  }

  getEmotionKeywords(emotion) {
    const keywordMap = {
      joy: ['happy', 'joy', 'delight', 'pleasure', 'excited', 'wonderful'],
      sadness: ['sad', 'grief', 'sorrow', 'depressed', 'unhappy', 'miserable'],
      anger: ['angry', 'rage', 'furious', 'outraged', 'irritated', 'annoyed'],
      fear: ['afraid', 'scared', 'terrified', 'frightened', 'anxious', 'horror'],
      love: ['love', 'affection', 'caring', 'tender', 'devoted', 'passionate'],
      pride: ['proud', 'accomplished', 'achievement', 'success', 'triumph'],
      shame: ['ashamed', 'embarrassed', 'humiliated', 'disgraced', 'guilty'],
      surprise: ['surprised', 'shocked', 'astonished', 'amazed', 'unexpected']
    };

    return keywordMap[emotion] || [];
  }

  getEmotionalSignificanceMultiplier(analysis) {
    const category = this.emotionCategories[analysis.primaryEmotion];
    if (!category) return 1.0;

    // Emotional intensity increases significance
    const intensityMultiplier = 0.8 + (analysis.intensity * 0.4); // 0.8x to 1.2x

    // Emotional valence affects retention priority
    const valenceMultiplier = category.influence === 'positive' ? 1.1 :
                             category.influence === 'negative' ? 1.2 : 1.0;

    return intensityMultiplier * valenceMultiplier;
  }

  // Emotional memory retrieval
  getEmotionallyRelevantMemories(character, targetEmotion, maxMemories = 5) {
    if (!character.significantMemories) return [];

    return character.significantMemories
      .filter(memory => memory.emotionalAnalysis?.primaryEmotion === targetEmotion)
      .sort((a, b) => b.emotionalAnalysis.intensity - a.emotionalAnalysis.intensity)
      .slice(0, maxMemories);
  }

  // Get memories that influence current emotional state
  getEmotionallyInfluentialMemories(character, currentEmotion, maxMemories = 5) {
    if (!character.significantMemories) return [];

    return character.significantMemories
      .map(memory => ({
        ...memory,
        influence: this.calculateEmotionalInfluence(memory, currentEmotion)
      }))
      .filter(memory => memory.influence > 0.1)
      .sort((a, b) => b.influence - a.influence)
      .slice(0, maxMemories);
  }

  calculateEmotionalInfluence(memory, currentEmotion) {
    if (!memory.emotionalAnalysis) return 0;

    const memoryEmotion = memory.emotionalAnalysis.primaryEmotion;

    // Emotional contagion and contrast effects
    if (memoryEmotion === currentEmotion) {
      return memory.emotionalAnalysis.intensity * 0.8; // Reinforcement
    }

    // Opposite emotions create contrast
    const opposites = {
      joy: 'sadness',
      sadness: 'joy',
      anger: 'fear',
      fear: 'anger',
      love: 'anger'
    };

    if (opposites[memoryEmotion] === currentEmotion) {
      return memory.emotionalAnalysis.intensity * 0.6; // Contrast
    }

    return memory.emotionalAnalysis.intensity * 0.3; // Neutral influence
  }
}
```

### Skill-Based Memory System

```javascript
class SkillBasedMemoryService extends SignificantMemoryService {
  constructor(logger, errorHandler) {
    super(logger, errorHandler);

    // Skill categories for memory organization
    this.skillCategories = {
      combat: ['swordsmanship', 'archery', 'tactics', 'endurance'],
      magical: ['spellcasting', 'ritual', 'enchantment', 'divination'],
      social: ['diplomacy', 'intimidation', 'persuasion', 'deception'],
      exploration: ['navigation', 'survival', 'tracking', 'foraging'],
      crafting: ['smithing', 'alchemy', 'enchanting', 'construction']
    };

    // Skill proficiency levels
    this.proficiencyLevels = {
      novice: { retention: 0.7, significance: 0.8 },
      apprentice: { retention: 0.85, significance: 0.9 },
      journeyman: { retention: 1.0, significance: 1.0 },
      expert: { retention: 1.1, significance: 1.1 },
      master: { retention: 1.2, significance: 1.2 }
    };
  }

  // Override memory addition with skill context
  addMemoryIfSignificant(character, memory) {
    // Add skill context to memory
    memory.skillContext = this.analyzeSkillContext(memory, character);

    // Adjust significance based on skill relevance
    if (memory.skillContext.relevant) {
      memory.significance *= memory.skillContext.proficiencyMultiplier;
    }

    return super.addMemoryIfSignificant(character, memory);
  }

  analyzeSkillContext(memory, character) {
    const skills = character.skills || {};
    const relevantSkills = this.findRelevantSkills(memory);

    if (relevantSkills.length === 0) {
      return { relevant: false };
    }

    // Calculate average proficiency
    const totalProficiency = relevantSkills.reduce((sum, skill) => {
      const level = this.getProficiencyLevel(skills[skill.name] || 0);
      return sum + level.retention;
    }, 0);

    const avgProficiency = totalProficiency / relevantSkills.length;

    return {
      relevant: true,
      skills: relevantSkills,
      averageProficiency: avgProficiency,
      proficiencyMultiplier: avgProficiency
    };
  }

  findRelevantSkills(memory) {
    const description = memory.description.toLowerCase();
    const relevantSkills = [];

    Object.entries(this.skillCategories).forEach(([category, skills]) => {
      skills.forEach(skill => {
        if (description.includes(skill)) {
          relevantSkills.push({
            name: skill,
            category: category,
            matchStrength: this.calculateMatchStrength(description, skill)
          });
        }
      });
    });

    return relevantSkills.sort((a, b) => b.matchStrength - a.matchStrength);
  }

  calculateMatchStrength(text, skill) {
    // Simple relevance scoring
    const words = text.split(' ');
    const skillWords = skill.split('_');

    let matches = 0;
    skillWords.forEach(skillWord => {
      if (words.some(word => word.includes(skillWord) || skillWord.includes(word))) {
        matches++;
      }
    });

    return matches / skillWords.length;
  }

  getProficiencyLevel(proficiencyScore) {
    if (proficiencyScore >= 90) return this.proficiencyLevels.master;
    if (proficiencyScore >= 75) return this.proficiencyLevels.expert;
    if (proficiencyScore >= 50) return this.proficiencyLevels.journeyman;
    if (proficiencyScore >= 25) return this.proficiencyLevels.apprentice;
    return this.proficiencyLevels.novice;
  }

  // Skill-based memory retrieval
  getSkillRelevantMemories(character, skillName, maxMemories = 5) {
    if (!character.significantMemories) return [];

    return character.significantMemories
      .filter(memory => memory.skillContext?.skills?.some(skill => skill.name === skillName))
      .sort((a, b) => b.significance - a.significance)
      .slice(0, maxMemories);
  }

  // Get memories that improve skill performance
  getSkillImprovementMemories(character, skillName, outcome = 'success') {
    return this.getSkillRelevantMemories(character, skillName)
      .filter(memory => memory.outcome === outcome)
      .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
  }

  // Calculate skill proficiency from memories
  calculateSkillProficiencyFromMemories(character, skillName) {
    const skillMemories = this.getSkillRelevantMemories(character, skillName, 20);

    if (skillMemories.length === 0) return 0;

    const successRate = skillMemories.filter(m => m.outcome === 'success').length / skillMemories.length;
    const experience = Math.min(1.0, skillMemories.length / 50); // Cap at 50 memories

    // Proficiency = experience * success rate * average significance
    const avgSignificance = skillMemories.reduce((sum, m) => sum + m.significance, 0) / skillMemories.length;

    return experience * successRate * avgSignificance * 100; // 0-100 scale
  }
}
```

## Integration Patterns

### Service Composition

```javascript
class ConsciousnessSystemIntegrator {
  constructor() {
    this.services = new Map();
    this.initialized = false;
  }

  // Register services with dependencies
  registerService(name, factory, dependencies = []) {
    this.services.set(name, {
      factory,
      dependencies,
      instance: null
    });
  }

  // Initialize all services in dependency order
  async initialize() {
    if (this.initialized) return;

    const initializationOrder = this.resolveDependencies();

    for (const serviceName of initializationOrder) {
      const service = this.services.get(serviceName);
      const dependencies = service.dependencies.map(dep => this.services.get(dep).instance);
      service.instance = await service.factory(...dependencies);
    }

    this.initialized = true;
  }

  resolveDependencies() {
    // Topological sort for dependency resolution
    const visited = new Set();
    const order = [];

    const visit = (serviceName) => {
      if (visited.has(serviceName)) return;
      visited.add(serviceName);

      const service = this.services.get(serviceName);
      service.dependencies.forEach(dep => visit(dep));

      order.push(serviceName);
    };

    Array.from(this.services.keys()).forEach(service => visit(service));

    return order;
  }

  getService(name) {
    const service = this.services.get(name);
    return service ? service.instance : null;
  }
}

// Usage
const integrator = new ConsciousnessSystemIntegrator();

// Register services with dependencies
integrator.registerService('errorHandler', () => new ConsciousnessErrorHandlingService());
integrator.registerService('significanceService', () => new EventSignificanceService());
integrator.registerService('memoryService', (errorHandler) => new SignificantMemoryService(null, errorHandler), ['errorHandler']);
integrator.registerService('behavioralService', (memoryService, errorHandler) => new BehavioralStateService(memoryService, null, errorHandler), ['memoryService', 'errorHandler']);
integrator.registerService('updateService', (significanceService, errorHandler) => new ConsciousnessUpdateService(significanceService, null, errorHandler), ['significanceService', 'errorHandler']);

// Initialize all services
await integrator.initialize();

// Use integrated services
const behavioralService = integrator.getService('behavioralService');
const updateService = integrator.getService('updateService');
```

### Plugin Architecture

```javascript
class ConsciousnessPluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  // Register a plugin
  registerPlugin(name, plugin) {
    this.plugins.set(name, plugin);

    // Register plugin hooks
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hookName, hookFunction]) => {
        if (!this.hooks.has(hookName)) {
          this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push(hookFunction);
      });
    }
  }

  // Execute hooks
  async executeHooks(hookName, ...args) {
    const hooks = this.hooks.get(hookName) || [];
    const results = [];

    for (const hook of hooks) {
      try {
        const result = await hook(...args);
        results.push(result);
      } catch (error) {
        console.error(`Plugin hook ${hookName} failed:`, error);
      }
    }

    return results;
  }

  // Get plugin by name
  getPlugin(name) {
    return this.plugins.get(name);
  }

  // Get all plugins
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }
}

// Example plugin
const magicalConsciousnessPlugin = {
  name: 'magical-consciousness',
  version: '1.0.0',

  hooks: {
    // Hook into consciousness state creation
    onConsciousnessStateCreate: (state, character) => {
      if (character.magicalAbility > 0.5) {
        state.magicalResonance = character.magicalAbility;
      }
    },

    // Hook into event processing
    onEventProcess: (event, character) => {
      if (event.type.includes('magic')) {
        // Apply magical event processing
        return {
          modifiedEvent: {
            ...event,
            significance: event.significance * 1.2
          }
        };
      }
    },

    // Hook into behavioral calculation
    onBehavioralModifierCalculate: (character, interactionType, baseModifier) => {
      if (interactionType === 'magical' && character.magicalResonance) {
        return baseModifier * (0.8 + character.magicalResonance * 0.4);
      }
      return baseModifier;
    }
  },

  // Plugin-specific methods
  castSpell: (character, spell) => {
    // Plugin-specific functionality
    return {
      success: Math.random() < character.magicalResonance,
      manaCost: spell.level * 10
    };
  }
};

// Usage
const pluginManager = new ConsciousnessPluginManager();
pluginManager.registerPlugin('magical', magicalConsciousnessPlugin);

// Hook into consciousness system
class PluginEnabledConsciousnessService extends ConsciousnessUpdateService {
  constructor(pluginManager, ...args) {
    super(...args);
    this.pluginManager = pluginManager;
  }

  async processEvent(character, event, context = {}) {
    // Execute plugin hooks
    const hookResults = await this.pluginManager.executeHooks('onEventProcess', event, character);

    // Apply plugin modifications
    let modifiedEvent = event;
    hookResults.forEach(result => {
      if (result.modifiedEvent) {
        modifiedEvent = result.modifiedEvent;
      }
    });

    // Process with modified event
    return super.processEvent(character, modifiedEvent, context);
  }
}
```

## Testing Extensions

### Extension Testing Framework

```javascript
class ConsciousnessExtensionTester {
  constructor() {
    this.testResults = [];
    this.mockServices = {};
  }

  // Create mock services for testing
  setupMocks() {
    this.mockServices.logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    this.mockServices.errorHandler = {
      handleOperationFailure: jest.fn(),
      isValidCharacter: jest.fn().mockReturnValue(true)
    };

    this.mockServices.significanceService = {
      calculateEventSignificance: jest.fn().mockReturnValue(0.5)
    };
  }

  // Test custom event type extension
  async testCustomEventType(extension, eventType, testEvent) {
    const result = {
      testName: `Custom Event Type: ${eventType}`,
      passed: false,
      errors: []
    };

    try {
      // Test significance calculation
      const significance = extension.calculateEventSignificance(testEvent);

      if (typeof significance !== 'number' || significance < 0 || significance > 1) {
        result.errors.push('Invalid significance value returned');
      }

      // Test event processing
      const character = this.createTestCharacter();
      const processResult = await extension.processEvent(character, testEvent);

      if (!processResult || typeof processResult.updated !== 'boolean') {
        result.errors.push('Invalid process result');
      }

      result.passed = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.testResults.push(result);
    return result;
  }

  // Test behavioral modifier extension
  async testBehavioralModifier(extension, interactionType, character) {
    const result = {
      testName: `Behavioral Modifier: ${interactionType}`,
      passed: false,
      errors: []
    };

    try {
      const modifier = extension.getBehavioralModifier(character, interactionType);

      if (typeof modifier !== 'number' || modifier < 0.1 || modifier > 3.0) {
        result.errors.push(`Invalid modifier: ${modifier}`);
      }

      // Test with context
      const modifierWithContext = extension.getBehavioralModifier(character, interactionType, {
        timeOfDay: 'night',
        urgency: 'high'
      });

      if (modifierWithContext === modifier) {
        result.errors.push('Context not affecting modifier');
      }

      result.passed = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.testResults.push(result);
    return result;
  }

  // Test memory system extension
  async testMemorySystem(extension, character, testMemories) {
    const result = {
      testName: 'Memory System Extension',
      passed: false,
      errors: []
    };

    try {
      // Test memory addition
      for (const memory of testMemories) {
        const added = extension.addMemoryIfSignificant(character, memory);
        if (typeof added !== 'boolean') {
          result.errors.push('Invalid memory addition result');
        }
      }

      // Test memory retrieval
      const memories = extension.getRelevantMemories(character, 'social', 5);
      if (!Array.isArray(memories)) {
        result.errors.push('Invalid memory retrieval result');
      }

      result.passed = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.testResults.push(result);
    return result;
  }

  // Run comprehensive test suite
  async runTestSuite(extension, testConfig) {
    console.log('Running consciousness extension tests...');

    this.setupMocks();

    const results = [];

    // Test custom event types
    if (testConfig.customEventTypes) {
      for (const [eventType, testEvent] of Object.entries(testConfig.customEventTypes)) {
        const result = await this.testCustomEventType(extension, eventType, testEvent);
        results.push(result);
      }
    }

    // Test behavioral modifiers
    if (testConfig.interactionTypes) {
      const character = this.createTestCharacter();
      for (const interactionType of testConfig.interactionTypes) {
        const result = await this.testBehavioralModifier(extension, interactionType, character);
        results.push(result);
      }
    }

    // Test memory system
    if (testConfig.testMemories) {
      const character = this.createTestCharacter();
      const result = await this.testMemorySystem(extension, character, testConfig.testMemories);
      results.push(result);
    }

    // Generate test report
    const report = this.generateTestReport(results);
    console.log('Test Report:', report);

    return report;
  }

  createTestCharacter() {
    return {
      id: 'test_character',
      name: 'Test Character',
      consciousness: new EnhancedConsciousnessState(),
      personality: { bravery: 0.5, empathy: 0.5 },
      significantMemories: []
    };
  }

  generateTestReport(results) {
    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    return {
      summary: `${passed}/${total} tests passed`,
      successRate: (passed / total) * 100,
      results: results,
      recommendations: this.generateTestRecommendations(results)
    };
  }

  generateTestRecommendations(results) {
    const recommendations = [];

    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      recommendations.push('Fix failing tests before deployment');
    }

    const behavioralTests = results.filter(r => r.testName.includes('Behavioral'));
    const failedBehavioral = behavioralTests.filter(r => !r.passed);
    if (failedBehavioral.length > behavioralTests.length * 0.5) {
      recommendations.push('Review behavioral modifier calculations');
    }

    return recommendations;
  }
}
```

## Performance Considerations

### Extension Performance Monitoring

```javascript
class ExtensionPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      eventProcessing: 50,    // ms
      behavioralCalculation: 10, // ms
      memoryLookup: 5         // ms
    };
  }

  // Monitor extension method performance
  async monitorMethod(extension, methodName, ...args) {
    const startTime = performance.now();

    try {
      const result = await extension[methodName](...args);
      const duration = performance.now() - startTime;

      this.recordMetric(`${extension.constructor.name}.${methodName}`, duration);

      if (duration > this.thresholds[methodName]) {
        console.warn(`Performance warning: ${methodName} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(`${extension.constructor.name}.${methodName}_error`, duration);
      throw error;
    }
  }

  recordMetric(name, duration) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const measurements = this.metrics.get(name);
    measurements.push({
      duration,
      timestamp: Date.now()
    });

    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  getPerformanceReport() {
    const report = {};

    for (const [methodName, measurements] of this.metrics) {
      const durations = measurements.map(m => m.duration);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      report[methodName] = {
        averageDuration: avgDuration,
        maxDuration: maxDuration,
        minDuration: minDuration,
        sampleCount: measurements.length,
        isSlow: avgDuration > (this.thresholds[methodName.split('.')[1]] || 10)
      };
    }

    return report;
  }

  // Performance regression detection
  detectRegressions() {
    const report = this.getPerformanceReport();
    const regressions = [];

    for (const [methodName, metrics] of Object.entries(report)) {
      if (metrics.isSlow) {
        regressions.push({
          method: methodName,
          averageDuration: metrics.averageDuration,
          threshold: this.thresholds[methodName.split('.')[1]] || 10,
          severity: metrics.averageDuration > (this.thresholds[methodName.split('.')[1]] || 10) * 2 ? 'high' : 'medium'
        });
      }
    }

    return regressions;
  }
}
```

### Memory-Efficient Extensions

```javascript
class MemoryEfficientExtension {
  constructor() {
    this.objectPool = new Map();
    this.cache = new WeakMap();
  }

  // Object pooling for frequently created objects
  acquireObject(type) {
    const pool = this.objectPool.get(type) || [];
    if (pool.length > 0) {
      return pool.pop();
    }
    return this.createObject(type);
  }

  releaseObject(type, object) {
    const pool = this.objectPool.get(type) || [];
    if (pool.length < 100) { // Max pool size
      this.resetObject(object);
      pool.push(object);
      this.objectPool.set(type, pool);
    }
  }

  createObject(type) {
    switch (type) {
      case 'behavioralResult':
        return { modifier: 1.0, breakdown: {} };
      case 'memoryAnalysis':
        return { relevant: false, influence: 0 };
      case 'eventContext':
        return {};
      default:
        return {};
    }
  }

  resetObject(object) {
    // Clear object properties
    Object.keys(object).forEach(key => {
      if (typeof object[key] === 'object' && object[key] !== null) {
        object[key] = {};
      } else {
        object[key] = null;
      }
    });
  }

  // Cached calculations
  getCachedResult(key, calculator) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = calculator();
    this.cache.set(key, result);
    return result;
  }

  // Memory cleanup
  performMemoryCleanup() {
    // Clear old cache entries (simple implementation)
    // In production, use a proper cache with TTL
    if (this.cache.size > 1000) {
      // WeakMap doesn't have clear(), so we'd need to replace it
      this.cache = new WeakMap();
    }

    // Clean object pools
    for (const [type, pool] of this.objectPool) {
      if (pool.length > 50) {
        this.objectPool.set(type, pool.slice(0, 25)); // Keep only half
      }
    }
  }
}
```

## Migration Strategies

### Backward Compatibility

```javascript
class ExtensionMigrationManager {
  constructor() {
    this.migrations = new Map();
    this.version = '1.0.0';
  }

  // Register migration for version upgrade
  registerMigration(fromVersion, toVersion, migrationFunction) {
    const key = `${fromVersion}_to_${toVersion}`;
    this.migrations.set(key, migrationFunction);
  }

  // Apply migrations to reach target version
  async migrate(character, targetVersion = this.version) {
    const currentVersion = character.extensionVersion || '0.0.0';

    if (currentVersion === targetVersion) {
      return character; // Already up to date
    }

    let migratedCharacter = { ...character };
    let currentVer = currentVersion;

    // Find migration path
    const migrationPath = this.findMigrationPath(currentVer, targetVersion);

    for (const migrationKey of migrationPath) {
      const migration = this.migrations.get(migrationKey);
      if (migration) {
        console.log(`Applying migration: ${migrationKey}`);
        migratedCharacter = await migration(migratedCharacter);
        currentVer = migrationKey.split('_to_')[1];
      }
    }

    migratedCharacter.extensionVersion = targetVersion;
    return migratedCharacter;
  }

  findMigrationPath(fromVersion, toVersion) {
    // Simple path finding - in production, use proper graph traversal
    const path = [];
    const versions = Array.from(this.migrations.keys())
      .map(key => key.split('_to_'))
      .flat()
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort();

    let current = fromVersion;
    while (current !== toVersion) {
      const nextMigration = Array.from(this.migrations.keys())
        .find(key => key.startsWith(`${current}_to_`));

      if (!nextMigration) break;

      path.push(nextMigration);
      current = nextMigration.split('_to_')[1];
    }

    return path;
  }

  // Data transformation helpers
  static transformPersonality(oldPersonality) {
    // Transform old personality format to new
    const newPersonality = {};

    if (oldPersonality.brave !== undefined) {
      newPersonality.bravery = oldPersonality.brave;
    }

    if (oldPersonality.kind !== undefined) {
      newPersonality.empathy = oldPersonality.kind;
    }

    return newPersonality;
  }

  static transformConsciousness(oldConsciousness) {
    // Transform old consciousness format
    return {
      baseFrequency: oldConsciousness.frequency || 7.5,
      baseCoherence: oldConsciousness.coherence || 0.7,
      behavioralState: oldConsciousness.behavioralState || {}
    };
  }
}

// Example migrations
const migrationManager = new ExtensionMigrationManager();

// Migration from 0.0.0 to 1.0.0
migrationManager.registerMigration('0.0.0', '1.0.0', (character) => {
  return {
    ...character,
    personality: ExtensionMigrationManager.transformPersonality(character.personality),
    consciousness: ExtensionMigrationManager.transformConsciousness(character.consciousness),
    extensionVersion: '1.0.0'
  };
});

// Migration from 1.0.0 to 1.1.0
migrationManager.registerMigration('1.0.0', '1.1.0', (character) => {
  return {
    ...character,
    consciousness: {
      ...character.consciousness,
      customParameters: {
        magical_affinity: 0.5,
        social_harmony: 0.5
      }
    },
    extensionVersion: '1.1.0'
  };
});
```

This developer extension guide provides comprehensive patterns and examples for extending the consciousness system while maintaining architectural integrity and performance. The examples can be adapted to fit specific game mechanics and requirements.