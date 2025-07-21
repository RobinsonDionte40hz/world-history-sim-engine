/**
 * EncounterService - Application service for encounter management
 * 
 * Handles encounter lifecycle, integration with turn-based simulation,
 * and coordination with the interaction system.
 */

import Encounter from '../../domain/entities/Encounter.js';
import Interaction from '../../domain/entities/Interaction.js';

class EncounterService {
  constructor() {
    this.encounters = new Map();
    this.activeEncounters = new Map();
    this.encounterHistory = [];
  }

  /**
   * Create a new encounter
   */
  createEncounter(encounterData) {
    const encounter = new Encounter(encounterData);
    this.encounters.set(encounter.id, encounter);
    return encounter;
  }

  /**
   * Get encounter by ID
   */
  getEncounter(encounterId) {
    return this.encounters.get(encounterId);
  }

  /**
   * Get all encounters
   */
  getAllEncounters() {
    return Array.from(this.encounters.values());
  }

  /**
   * Get encounters by type
   */
  getEncountersByType(type) {
    return this.getAllEncounters().filter(encounter => encounter.type === type);
  }

  /**
   * Get encounters available for a specific node
   */
  getAvailableEncounters(nodeId, context = {}) {
    return this.getAllEncounters().filter(encounter => {
      // Check node restrictions
      if (encounter.nodeRestrictions.length > 0 && !encounter.nodeRestrictions.includes(nodeId)) {
        return false;
      }
      
      // Check if encounter can trigger
      return encounter.canTrigger({ ...context, nodeId });
    });
  }

  /**
   * Trigger an encounter
   */
  triggerEncounter(encounterId, context = {}) {
    const encounter = this.getEncounter(encounterId);
    if (!encounter) {
      throw new Error(`Encounter not found: ${encounterId}`);
    }

    if (!encounter.canTrigger(context)) {
      return null;
    }

    // Mark encounter as triggered
    encounter.markTriggered(context.currentTurn || 0);

    // Create encounter instance
    const encounterInstance = {
      id: `instance_${Date.now()}_${encounter.id}`,
      encounterId: encounter.id,
      encounter: encounter,
      context: context,
      startTurn: context.currentTurn || 0,
      status: 'active',
      participants: context.participants || [],
      currentTurn: 0,
      maxTurns: encounter.turnBased.duration,
      outcome: null,
      history: []
    };

    this.activeEncounters.set(encounterInstance.id, encounterInstance);

    // Generate interactions for this encounter
    const interactions = encounter.generateInteractions();
    encounterInstance.generatedInteractions = interactions;

    return encounterInstance;
  }

  /**
   * Process turn for active encounters
   */
  processTurn(currentTurn) {
    const results = [];

    for (const [instanceId, instance] of this.activeEncounters.entries()) {
      if (instance.status !== 'active') continue;

      // Advance encounter turn
      instance.currentTurn++;

      // Check if encounter should end
      if (instance.currentTurn >= instance.maxTurns) {
        const outcome = this.resolveEncounter(instanceId);
        results.push({
          type: 'encounter_completed',
          instanceId,
          encounterId: instance.encounterId,
          outcome
        });
      } else {
        // Process encounter turn
        const turnResult = this.processEncounterTurn(instanceId, currentTurn);
        if (turnResult) {
          results.push(turnResult);
        }
      }
    }

    return results;
  }

  /**
   * Process a single encounter turn
   */
  processEncounterTurn(instanceId, globalTurn) {
    const instance = this.activeEncounters.get(instanceId);
    if (!instance || instance.status !== 'active') {
      return null;
    }

    const encounter = instance.encounter;
    const turnResult = {
      type: 'encounter_turn',
      instanceId,
      encounterId: encounter.id,
      turn: instance.currentTurn,
      globalTurn,
      actions: []
    };

    // Process participant actions based on sequencing
    if (encounter.turnBased.sequencing === 'sequential') {
      // Process participants in order
      for (const participant of instance.participants) {
        const action = this.processParticipantAction(instance, participant, globalTurn);
        if (action) {
          turnResult.actions.push(action);
        }
      }
    } else {
      // Process participants simultaneously
      const actions = instance.participants.map(participant => 
        this.processParticipantAction(instance, participant, globalTurn)
      ).filter(action => action !== null);
      
      turnResult.actions.push(...actions);
    }

    // Record turn in history
    instance.history.push(turnResult);

    return turnResult;
  }

  /**
   * Process action for a single participant
   */
  processParticipantAction(instance, participant, globalTurn) {
    // This would integrate with character AI and decision making
    // For now, return a basic action structure
    return {
      participantId: participant.id,
      action: 'participate',
      result: 'success',
      effects: []
    };
  }

  /**
   * Resolve encounter and determine outcome
   */
  resolveEncounter(instanceId) {
    const instance = this.activeEncounters.get(instanceId);
    if (!instance) {
      throw new Error(`Encounter instance not found: ${instanceId}`);
    }

    const encounter = instance.encounter;
    const outcome = encounter.resolveOutcome(instance.context);

    // Update instance
    instance.status = 'completed';
    instance.outcome = outcome;
    instance.endTurn = instance.context.currentTurn || 0;

    // Move to history
    this.encounterHistory.push(instance);
    this.activeEncounters.delete(instanceId);

    return outcome;
  }

  /**
   * Force end an encounter
   */
  endEncounter(instanceId, reason = 'forced') {
    const instance = this.activeEncounters.get(instanceId);
    if (!instance) {
      return false;
    }

    instance.status = 'ended';
    instance.endReason = reason;
    instance.endTurn = instance.context.currentTurn || 0;

    // Move to history
    this.encounterHistory.push(instance);
    this.activeEncounters.delete(instanceId);

    return true;
  }

  /**
   * Get active encounters
   */
  getActiveEncounters() {
    return Array.from(this.activeEncounters.values());
  }

  /**
   * Get encounter history
   */
  getEncounterHistory(filters = {}) {
    let history = [...this.encounterHistory];

    if (filters.encounterId) {
      history = history.filter(instance => instance.encounterId === filters.encounterId);
    }

    if (filters.participantId) {
      history = history.filter(instance => 
        instance.participants.some(p => p.id === filters.participantId)
      );
    }

    if (filters.nodeId) {
      history = history.filter(instance => instance.context.nodeId === filters.nodeId);
    }

    return history;
  }

  /**
   * Generate interactions from encounter
   */
  generateEncounterInteractions(encounterId) {
    const encounter = this.getEncounter(encounterId);
    if (!encounter) {
      throw new Error(`Encounter not found: ${encounterId}`);
    }

    return encounter.generateInteractions();
  }

  /**
   * Update encounter
   */
  updateEncounter(encounterId, updates) {
    const encounter = this.getEncounter(encounterId);
    if (!encounter) {
      throw new Error(`Encounter not found: ${encounterId}`);
    }

    // Create new encounter with updates
    const updatedEncounter = new Encounter({
      ...encounter.toJSON(),
      ...updates,
      metadata: {
        ...encounter.metadata,
        lastModified: new Date().toISOString()
      }
    });

    this.encounters.set(encounterId, updatedEncounter);
    return updatedEncounter;
  }

  /**
   * Delete encounter
   */
  deleteEncounter(encounterId) {
    const encounter = this.getEncounter(encounterId);
    if (!encounter) {
      return false;
    }

    // End any active instances of this encounter
    for (const [instanceId, instance] of this.activeEncounters.entries()) {
      if (instance.encounterId === encounterId) {
        this.endEncounter(instanceId, 'encounter_deleted');
      }
    }

    this.encounters.delete(encounterId);
    return true;
  }

  /**
   * Load encounters from storage
   */
  loadEncounters(encounterData) {
    encounterData.forEach(data => {
      const encounter = Encounter.fromJSON(data);
      this.encounters.set(encounter.id, encounter);
    });
  }

  /**
   * Save encounters to storage format
   */
  saveEncounters() {
    return this.getAllEncounters().map(encounter => encounter.toJSON());
  }

  /**
   * Get encounter statistics
   */
  getEncounterStatistics() {
    const encounters = this.getAllEncounters();
    const history = this.encounterHistory;

    return {
      total: encounters.length,
      byType: encounters.reduce((acc, encounter) => {
        acc[encounter.type] = (acc[encounter.type] || 0) + 1;
        return acc;
      }, {}),
      byDifficulty: encounters.reduce((acc, encounter) => {
        acc[encounter.difficulty] = (acc[encounter.difficulty] || 0) + 1;
        return acc;
      }, {}),
      active: this.activeEncounters.size,
      completed: history.length,
      averageDuration: history.length > 0 
        ? history.reduce((sum, instance) => sum + (instance.endTurn - instance.startTurn), 0) / history.length
        : 0
    };
  }

  /**
   * Create encounter from template
   */
  createFromTemplate(template, overrides = {}) {
    const encounter = Encounter.fromTemplate(template, overrides);
    this.encounters.set(encounter.id, encounter);
    return encounter;
  }

  /**
   * Export encounter as template
   */
  exportAsTemplate(encounterId) {
    const encounter = this.getEncounter(encounterId);
    if (!encounter) {
      throw new Error(`Encounter not found: ${encounterId}`);
    }

    return encounter.toTemplate();
  }
}

export default EncounterService;