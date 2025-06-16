import { HistoricalRecordTemplate } from './TemplateTypes';

class SimulationEngine {
  constructor(world, templateManager) {
    this.world = world;
    this.templateManager = templateManager;
    this.currentTime = 0;
    this.eventQueue = [];
    this.activeEvents = new Map();
  }

  // Main simulation loop
  async simulate(config) {
    const {
      years,
      timeStep,
      eventFrequency,
      maxConcurrentEvents,
      enableLogging
    } = config;

    const endTime = this.currentTime + years;
    
    while (this.currentTime < endTime) {
      // Process time step
      await this.processTimeStep(timeStep, eventFrequency, maxConcurrentEvents);
      
      // Update world state
      this.updateWorldState();
      
      // Generate new events
      this.generateEvents(eventFrequency);
      
      // Log progress if enabled
      if (enableLogging) {
        this.logSimulationProgress();
      }
    }

    return this.world;
  }

  // Process a single time step
  async processTimeStep(timeStep, eventFrequency, maxConcurrentEvents) {
    // Update current time
    this.currentTime += timeStep;

    // Process active events
    await this.processActiveEvents();

    // Start new events if under limit
    while (this.activeEvents.size < maxConcurrentEvents) {
      const event = this.eventQueue.shift();
      if (!event) break;
      
      this.startEvent(event);
    }

    // Update event probabilities based on frequency
    this.updateEventProbabilities(eventFrequency);
  }

  // Process currently active events
  async processActiveEvents() {
    const completedEvents = [];

    for (const [eventId, event] of this.activeEvents) {
      // Update event progress
      event.progress += this.calculateEventProgress(event);
      
      // Check for event completion
      if (event.progress >= 1) {
        await this.completeEvent(event);
        completedEvents.push(eventId);
      }
    }

    // Remove completed events
    completedEvents.forEach(id => this.activeEvents.delete(id));
  }

  // Calculate event progress
  calculateEventProgress(event) {
    const baseProgress = 0.1; // Base progress per time step
    const modifiers = this.calculateEventModifiers(event);
    return baseProgress * modifiers;
  }

  // Calculate event modifiers
  calculateEventModifiers(event) {
    let modifier = 1.0;

    // Apply participant modifiers
    event.participants.forEach(participant => {
      const entity = this.getEntity(participant);
      if (entity) {
        modifier *= this.calculateParticipantModifier(entity, event);
      }
    });

    // Apply location modifiers
    if (event.location) {
      const location = this.world.nodes.get(event.location);
      if (location) {
        modifier *= this.calculateLocationModifier(location, event);
      }
    }

    return modifier;
  }

  // Calculate participant modifier
  calculateParticipantModifier(entity, event) {
    let modifier = 1.0;

    // Apply attribute modifiers
    if (entity.attributes) {
      const relevantAttributes = this.getRelevantAttributes(event);
      relevantAttributes.forEach(attr => {
        modifier *= this.calculateAttributeModifier(entity.attributes[attr]);
      });
    }

    // Apply skill modifiers
    if (entity.skills) {
      const relevantSkills = this.getRelevantSkills(event);
      relevantSkills.forEach(skill => {
        modifier *= this.calculateSkillModifier(entity.skills[skill]);
      });
    }

    return modifier;
  }

  // Calculate location modifier
  calculateLocationModifier(location, event) {
    let modifier = 1.0;

    // Apply feature modifiers
    location.features.forEach(feature => {
      if (this.isFeatureRelevant(feature, event)) {
        modifier *= feature.effects.progressModifier || 1.0;
      }
    });

    // Apply environmental condition modifiers
    location.environmentalConditions.forEach(condition => {
      if (this.isConditionRelevant(condition, event)) {
        modifier *= condition.effects.progressModifier || 1.0;
      }
    });

    return modifier;
  }

  // Complete event and apply effects
  async completeEvent(event) {
    // Apply event effects
    await this.applyEventEffects(event);

    // Record historical event
    this.recordHistoricalEvent(event);

    // Update participant states
    this.updateParticipantStates(event);

    // Generate follow-up events
    this.generateFollowUpEvents(event);
  }

  // Apply event effects
  async applyEventEffects(event) {
    // Apply direct effects
    event.effects.forEach(effect => {
      this.applyEffect(effect);
    });

    // Apply relationship effects
    event.relationshipEffects.forEach(effect => {
      this.applyRelationshipEffect(effect);
    });

    // Apply resource effects
    event.resourceEffects.forEach(effect => {
      this.applyResourceEffect(effect);
    });

    // Apply attribute changes
    event.attributeChanges.forEach(change => {
      this.applyAttributeChange(change);
    });

    // Apply quest completions
    event.questCompletions.forEach(completion => {
      this.applyQuestCompletion(completion);
    });
  }

  // Record historical event
  recordHistoricalEvent(event) {
    const historicalRecord = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: this.currentTime,
      eventType: event.type,
      participants: event.participants,
      location: event.location,
      description: this.generateEventDescription(event),
      effects: event.effects,
      attributeChanges: event.attributeChanges,
      questCompletions: event.questCompletions,
      metadata: {
        importance: this.calculateEventImportance(event),
        visibility: this.calculateEventVisibility(event),
        persistence: this.calculateEventPersistence(event)
      }
    };

    this.world.history.push(historicalRecord);
  }

  // Update participant states
  updateParticipantStates(event) {
    event.participants.forEach(participant => {
      const entity = this.getEntity(participant);
      if (entity) {
        this.updateEntityState(entity, event);
      }
    });
  }

  // Generate follow-up events
  generateFollowUpEvents(event) {
    const followUps = this.calculateFollowUpEvents(event);
    this.eventQueue.push(...followUps);
  }

  // Update world state
  updateWorldState() {
    // Update nodes
    this.world.nodes.forEach(node => {
      this.updateNodeState(node);
    });

    // Update characters
    this.world.characters.forEach(character => {
      this.updateCharacterState(character);
    });

    // Update groups
    this.world.groups.forEach(group => {
      this.updateGroupState(group);
    });
  }

  // Update node state
  updateNodeState(node) {
    // Update resources
    this.updateNodeResources(node);

    // Update environmental conditions
    this.updateEnvironmentalConditions(node);

    // Update settlement capacity
    this.updateSettlementCapacity(node);
  }

  // Update character state
  updateCharacterState(character) {
    // Update attributes
    this.updateCharacterAttributes(character);

    // Update skills
    this.updateCharacterSkills(character);

    // Update goals
    this.updateCharacterGoals(character);

    // Update consciousness
    if (character.consciousness) {
      this.updateConsciousness(character.consciousness);
    }
  }

  // Update group state
  updateGroupState(group) {
    // Update resources
    this.updateGroupResources(group);

    // Update hierarchy
    this.updateGroupHierarchy(group);

    // Update influence
    this.updateGroupInfluence(group);

    // Update prestige
    this.updateGroupPrestige(group);

    // Update alignment
    this.updateGroupAlignment(group);
  }

  // Generate new events
  generateEvents(frequency) {
    const eventCount = Math.floor(Math.random() * frequency);
    
    for (let i = 0; i < eventCount; i++) {
      const event = this.generateRandomEvent();
      if (event) {
        this.eventQueue.push(event);
      }
    }
  }

  // Generate random event
  generateRandomEvent() {
    const eventTemplates = this.templateManager.listTemplates('historicalRecords');
    const template = this.selectRandomTemplate(eventTemplates);
    
    if (!template) return null;

    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: template.eventType,
      participants: this.selectEventParticipants(template),
      location: this.selectEventLocation(template),
      effects: this.generateEventEffects(template),
      relationshipEffects: this.generateRelationshipEffects(template),
      resourceEffects: this.generateResourceEffects(template),
      attributeChanges: this.generateAttributeChanges(template),
      questCompletions: this.generateQuestCompletions(template),
      progress: 0
    };
  }

  // Select event participants
  selectEventParticipants(template) {
    const participants = [];
    const availableEntities = this.getAvailableEntities(template.participantTypes);
    
    template.participantTypes.forEach(type => {
      const entity = this.selectRandomEntity(availableEntities[type]);
      if (entity) {
        participants.push(entity.id);
      }
    });

    return participants;
  }

  // Select event location
  selectEventLocation(template) {
    const suitableLocations = Array.from(this.world.nodes.values())
      .filter(node => this.isLocationSuitable(node, template));
    
    const location = this.selectRandomEntity(suitableLocations);
    return location ? location.id : null;
  }

  // Generate event effects
  generateEventEffects(template) {
    return template.effects.map(effect => ({
      ...effect,
      magnitude: this.calculateEffectMagnitude(effect)
    }));
  }

  // Generate relationship effects
  generateRelationshipEffects(template) {
    return template.relationshipEffects.map(effect => ({
      ...effect,
      magnitude: this.calculateEffectMagnitude(effect)
    }));
  }

  // Generate resource effects
  generateResourceEffects(template) {
    return template.resourceEffects.map(effect => ({
      ...effect,
      amount: this.calculateResourceAmount(effect)
    }));
  }

  // Generate attribute changes
  generateAttributeChanges(template) {
    return template.attributeChanges.map(change => ({
      ...change,
      change: this.calculateAttributeChange(change)
    }));
  }

  // Generate quest completions
  generateQuestCompletions(template) {
    return template.questCompletions.map(completion => ({
      ...completion,
      success: Math.random() < (completion.probability || 0.5)
    }));
  }

  // Helper methods
  getEntity(id) {
    return (
      this.world.characters.get(id) ||
      this.world.nodes.get(id) ||
      this.world.groups.get(id)
    );
  }

  getAvailableEntities(types) {
    const entities = {};
    types.forEach(type => {
      switch (type) {
        case 'character':
          entities[type] = Array.from(this.world.characters.values());
          break;
        case 'node':
          entities[type] = Array.from(this.world.nodes.values());
          break;
        case 'group':
          entities[type] = Array.from(this.world.groups.values());
          break;
      }
    });
    return entities;
  }

  selectRandomEntity(entities) {
    if (!entities || entities.length === 0) return null;
    return entities[Math.floor(Math.random() * entities.length)];
  }

  isLocationSuitable(node, template) {
    return template.locationTypes.some(type => 
      node.features.some(f => f.name === type)
    );
  }

  calculateEffectMagnitude(effect) {
    return effect.magnitude * (0.8 + Math.random() * 0.4); // ±20% variation
  }

  calculateResourceAmount(effect) {
    return effect.amount * (0.8 + Math.random() * 0.4); // ±20% variation
  }

  calculateAttributeChange(change) {
    return change.change * (0.8 + Math.random() * 0.4); // ±20% variation
  }

  calculateEventImportance(event) {
    // Calculate based on participants, effects, and type
    return Math.random() * 100;
  }

  calculateEventVisibility(event) {
    // Calculate based on participants and location
    return Math.random() * 100;
  }

  calculateEventPersistence(event) {
    // Calculate based on effects and type
    return Math.random() * 100;
  }

  generateEventDescription(event) {
    // Generate natural language description of event
    return `Event of type ${event.type} occurred at ${event.location}`;
  }

  logSimulationProgress() {
    console.log(`Time: ${this.currentTime}`);
    console.log(`Active Events: ${this.activeEvents.size}`);
    console.log(`Queued Events: ${this.eventQueue.length}`);
    console.log(`Total Historical Records: ${this.world.history.length}`);
  }
}

export default SimulationEngine; 