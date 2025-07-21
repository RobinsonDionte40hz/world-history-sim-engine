// src/domain/entities/Encounter.js

// Utility function to generate UUID with fallback for test environments
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for test environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

class Encounter {
  constructor(config = {}) {
    this.id = config.id || generateId();
    this.name = config.name || 'Unnamed Encounter';
    this.description = config.description || '';
    this.type = config.type || 'combat'; // 'combat', 'social', 'exploration', 'puzzle', 'environmental'
    
    // Turn-based simulation properties
    this.turnBased = {
      duration: config.turnBased?.duration || 1, // Number of turns this encounter lasts
      initiative: config.turnBased?.initiative || 'random', // 'random', 'attribute', 'fixed'
      timing: config.turnBased?.timing || 'immediate', // 'immediate', 'delayed', 'conditional'
      sequencing: config.turnBased?.sequencing || 'simultaneous' // 'simultaneous', 'sequential'
    };
    
    // Trigger conditions for when this encounter occurs
    this.triggers = config.triggers || [];
    
    // Participant requirements
    this.participants = config.participants || [];
    
    // Encounter outcomes and their probabilities
    this.outcomes = config.outcomes || [];
    
    // Difficulty and challenge rating
    this.difficulty = config.difficulty || 'medium'; // 'trivial', 'easy', 'medium', 'hard', 'deadly'
    this.challengeRating = config.challengeRating || 1;
    
    // Node restrictions - which nodes this encounter can occur in
    this.nodeRestrictions = config.nodeRestrictions || [];
    
    // Prerequisites that must be met
    this.prerequisites = config.prerequisites || [];
    
    // Rewards for successful completion
    this.rewards = config.rewards || [];
    
    // Cooldown before this encounter can happen again
    this.cooldown = config.cooldown || 0;
    
    // Integration with interaction system
    this.interactionIntegration = {
      baseInteractionId: config.interactionIntegration?.baseInteractionId || null,
      generatedInteractions: config.interactionIntegration?.generatedInteractions || [],
      effectMapping: config.interactionIntegration?.effectMapping || {}
    };
    
    // Template properties for reusability
    this.template = {
      isTemplate: config.template?.isTemplate || false,
      templateId: config.template?.templateId || null,
      category: config.template?.category || 'custom',
      tags: config.template?.tags || []
    };
    
    // Metadata
    this.metadata = {
      created: config.metadata?.created || new Date().toISOString(),
      lastModified: config.metadata?.lastModified || new Date().toISOString(),
      version: config.metadata?.version || '1.0.0',
      author: config.metadata?.author || 'system'
    };
    
    // State tracking
    this.lastTriggered = config.lastTriggered || 0;
    this.timesTriggered = config.timesTriggered || 0;
  }

  /**
   * Check if this encounter can be triggered based on current conditions
   */
  canTrigger(context = {}) {
    // Check cooldown
    if (this.cooldown > 0 && context.currentTurn !== undefined) {
      const turnsSinceLastTrigger = context.currentTurn - this.lastTriggered;
      if (turnsSinceLastTrigger < this.cooldown) {
        return false;
      }
    }
    
    // Check node restrictions
    if (this.nodeRestrictions.length > 0 && context.nodeId) {
      if (!this.nodeRestrictions.includes(context.nodeId)) {
        return false;
      }
    }
    
    // Check prerequisites
    if (this.prerequisites.length > 0 && context.character) {
      const meetsPrereqs = this.prerequisites.every(prereq => 
        this.evaluatePrerequisite(prereq, context)
      );
      if (!meetsPrereqs) {
        return false;
      }
    }
    
    // Check triggers - if no triggers defined, encounter can always trigger (subject to other conditions)
    if (this.triggers.length > 0) {
      const triggerMet = this.triggers.some(trigger => 
        this.evaluateTrigger(trigger, context)
      );
      if (!triggerMet) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Evaluate a single prerequisite
   */
  evaluatePrerequisite(prerequisite, context) {
    switch (prerequisite.type) {
      case 'attribute':
        return context.character?.attributes?.[prerequisite.attribute]?.score >= prerequisite.value;
      case 'skill':
        return context.character?.skills?.[prerequisite.skill] >= prerequisite.value;
      case 'level':
        return context.character?.level >= prerequisite.value;
      case 'quest':
        return context.character?.quests?.some(q => 
          q.id === prerequisite.questId && q.status === prerequisite.status
        );
      case 'item':
        return context.character?.inventory?.some(item => 
          item.id === prerequisite.itemId
        );
      default:
        return true;
    }
  }

  /**
   * Evaluate a single trigger condition
   */
  evaluateTrigger(trigger, context) {
    switch (trigger.type) {
      case 'time':
        return context.currentTurn >= trigger.turn;
      case 'location':
        return context.nodeId === trigger.nodeId;
      case 'interaction':
        return context.lastInteractionId === trigger.interactionId;
      case 'condition':
        return this.evaluateCondition(trigger.condition, context);
      case 'probability':
        return Math.random() < trigger.probability;
      default:
        return true; // Unknown trigger types default to true
    }
  }

  /**
   * Evaluate a complex condition
   */
  evaluateCondition(condition, context) {
    // Simple condition evaluation - can be expanded
    if (condition.type === 'character_state') {
      const character = context.character;
      if (!character) return false;
      
      switch (condition.property) {
        case 'health':
          return character.health <= condition.value;
        case 'energy':
          return character.energy <= condition.value;
        case 'mood':
          return character.mood <= condition.value;
        default:
          return false;
      }
    }
    
    return false;
  }

  /**
   * Generate interactions based on this encounter
   */
  generateInteractions() {
    const interactions = [];
    
    // Create base interaction for the encounter
    const baseInteraction = {
      id: `encounter_${this.id}_base`,
      nodeId: null, // Will be set when encounter is placed
      name: `Encounter: ${this.name}`,
      description: this.description,
      type: 'encounter',
      requirements: this.prerequisites.map(prereq => ({
        attr: prereq.attribute || prereq.skill || 'level',
        min: prereq.value || 1
      })),
      branches: this.outcomes.map((outcome, index) => ({
        id: `outcome_${index}`,
        text: outcome.description || `Outcome ${index + 1}`,
        condition: outcome.condition || null,
        effects: outcome.effects || [],
        probability: outcome.probability || 1.0,
        turnBased: {
          duration: outcome.turnDuration || 1,
          timing: outcome.timing || 'immediate'
        }
      })),
      effects: [],
      participants: this.participants,
      cooldown: this.cooldown,
      repeatable: this.cooldown > 0,
      turnBased: this.turnBased
    };
    
    interactions.push(baseInteraction);
    
    // Store generated interactions for reference
    this.interactionIntegration.generatedInteractions = interactions.map(i => i.id);
    
    return interactions;
  }

  /**
   * Resolve encounter outcome based on turn-based simulation
   */
  resolveOutcome(context = {}) {
    const availableOutcomes = this.outcomes.filter(outcome => 
      !outcome.condition || this.evaluateCondition(outcome.condition, context)
    );
    
    if (availableOutcomes.length === 0) {
      return null;
    }
    
    // Weighted selection based on probability
    const totalWeight = availableOutcomes.reduce((sum, outcome) => 
      sum + (outcome.probability || 1.0), 0
    );
    
    let random = Math.random() * totalWeight;
    for (const outcome of availableOutcomes) {
      random -= (outcome.probability || 1.0);
      if (random <= 0) {
        return {
          ...outcome,
          encounterId: this.id,
          resolvedAt: context.currentTurn || 0,
          turnDuration: outcome.turnDuration || this.turnBased.duration
        };
      }
    }
    
    return availableOutcomes[availableOutcomes.length - 1];
  }

  /**
   * Mark encounter as triggered
   */
  markTriggered(currentTurn = 0) {
    this.lastTriggered = currentTurn;
    this.timesTriggered += 1;
    this.metadata.lastModified = new Date().toISOString();
  }

  /**
   * Check if encounter is available (not on cooldown)
   */
  isAvailable(currentTurn = 0) {
    if (this.cooldown === 0) return true;
    return (currentTurn - this.lastTriggered) >= this.cooldown;
  }

  /**
   * Create a template from this encounter
   */
  toTemplate() {
    return {
      id: `template_${this.id}`,
      name: `${this.name} Template`,
      description: this.description,
      type: 'encounter',
      version: '1.0.0',
      tags: this.template.tags,
      metadata: {
        ...this.metadata,
        isTemplate: true,
        originalId: this.id
      },
      template: {
        type: this.type,
        difficulty: this.difficulty,
        challengeRating: this.challengeRating,
        turnBased: this.turnBased,
        triggers: this.triggers,
        participants: this.participants,
        outcomes: this.outcomes,
        prerequisites: this.prerequisites,
        rewards: this.rewards,
        cooldown: this.cooldown
      }
    };
  }

  /**
   * Create encounter from template
   */
  static fromTemplate(template, overrides = {}) {
    return new Encounter({
      name: overrides.name || template.name?.replace(' Template', ''),
      description: overrides.description || template.description,
      type: template.template?.type || template.type,
      difficulty: overrides.difficulty || template.template?.difficulty,
      challengeRating: overrides.challengeRating || template.template?.challengeRating,
      turnBased: { ...template.template?.turnBased, ...overrides.turnBased },
      triggers: overrides.triggers || template.template?.triggers || [],
      participants: overrides.participants || template.template?.participants || [],
      outcomes: overrides.outcomes || template.template?.outcomes || [],
      prerequisites: overrides.prerequisites || template.template?.prerequisites || [],
      rewards: overrides.rewards || template.template?.rewards || [],
      cooldown: overrides.cooldown || template.template?.cooldown || 0,
      template: {
        isTemplate: false,
        templateId: template.id,
        category: template.template?.category || 'custom',
        tags: template.tags || []
      },
      ...overrides
    });
  }

  /**
   * Serialize for storage
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      turnBased: this.turnBased,
      triggers: this.triggers,
      participants: this.participants,
      outcomes: this.outcomes,
      difficulty: this.difficulty,
      challengeRating: this.challengeRating,
      nodeRestrictions: this.nodeRestrictions,
      prerequisites: this.prerequisites,
      rewards: this.rewards,
      cooldown: this.cooldown,
      interactionIntegration: this.interactionIntegration,
      template: this.template,
      metadata: this.metadata,
      lastTriggered: this.lastTriggered,
      timesTriggered: this.timesTriggered
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for Encounter');
    }
    return new Encounter(data);
  }
}

export default Encounter;