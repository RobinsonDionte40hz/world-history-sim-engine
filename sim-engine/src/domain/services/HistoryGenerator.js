// src/domain/services/HistoryGenerator.js

import Character from '../entities/Character.js';
import InteractionBase from '../entities/interactions/InteractionBase.js';

class HistoryGenerator {
  constructor() {
    this.events = [];
  }
  // Log a historical event from an interaction outcome
  logEvent(config = {}) {
    const { timestamp = Date.now(), character, interaction, outcome, roll, dc, decisionContext } = config;
    if (!(character instanceof Character) || !(interaction instanceof InteractionBase)) {
      throw new Error('Invalid character or interaction');
    }

    // Determine significance based on coherence and outcome
    const significance = this.calculateSignificance(character, outcome);
    if (significance < 0.1) return;  // Skip trivial events

    const event = {
      id: this.generateId(),
      timestamp,
      characterId: character.id,
      characterName: character.name,
      interactionId: interaction.id,
      interactionName: interaction.name,
      type: interaction.type || 'event',
      outcome,
      roll,
      dc,
      location: interaction.nodeId || 'Unknown',
      significance,
      description: this.generateDescription(character, interaction, outcome),
      // Enhanced decision context for behavior analysis
      decisionContext: decisionContext || null
    };

    // Simulate persistence (reused from old localStorage approach)
    this.saveEvent(event);
    return event;
  }

  // Calculate event significance (inspired by quantum coherence impact)
  calculateSignificance(character, outcome) {
    const coherence = character.consciousness.coherence || 0;
    const baseImpact = outcome === 'positive' ? 0.5 : 0.2;  // Positive outcomes more significant
    // Resonance-inspired scaling: Higher coherence amplifies impact (from papers' 408 fs baseline)
    return baseImpact * (1 + coherence * 2);  // Scales 0.2-0.9 to 0.2-2.7, capped at 1 for now
  }

  // Generate a narrative description (simple for MVP)
  generateDescription(character, interaction, outcome) {
    const success = outcome === 'positive';
    let attrMod = 0;

    // Safely get charisma modifier
    try {
      if (character.attributes && typeof character.attributes.getTotalModifier === 'function') {
        attrMod = character.attributes.getTotalModifier('charisma');
      } else if (character.attributes && character.attributes.charisma) {
        // Fallback for plain object format
        attrMod = character.attributes.charisma.modifier || 0;
      }
    } catch (error) {
      console.warn('Could not get charisma modifier for description:', error);
      attrMod = 0;
    }

    const descriptors = ['bravely', 'cautiously', 'cleverly', 'boldly'];
    const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];

    if (interaction.type === 'dialogue') {
      return `${character.name} ${descriptor} engaged in a ${success ? 'successful' : 'failed'} conversation about ${interaction.name} with a charisma of ${attrMod}.`;
    } else if (interaction.type === 'action') {
      return `${character.name} ${descriptor} performed a ${success ? 'successful' : 'failed'} ${interaction.name} action with a roll of ${success ? 'victory' : 'struggle'}.`;
    }
    return `${character.name} experienced a ${success ? 'notable' : 'minor'} ${interaction.name} event.`;
  }

  // Simulate saving to localStorage (reused from old project)
  saveEvent(event) {
    // Store in memory for this session
    this.events.push(event);

    // Also save to localStorage for persistence (legacy compatibility)
    // Only attempt if localStorage is available (browser environment)
    if (typeof localStorage !== 'undefined') {
      try {
        const events = JSON.parse(localStorage.getItem('historicalEvents') || '[]');
        events.push(event);
        localStorage.setItem('historicalEvents', JSON.stringify(events));
      } catch (error) {
        console.warn('Failed to save event to localStorage:', error);
      }
    }
  }

  // Retrieve events (for analysis or UI)
  getEvents(filters = {}) {
    let events = [...this.events];

    if (filters.type) {
      events = events.filter(event => event.type === filters.type);
    }

    if (filters.settlementId) {
      events = events.filter(event => event.settlementId === filters.settlementId);
    }

    if (filters.severity) {
      events = events.filter(event => event.severity === filters.severity);
    }

    if (filters.minSignificance) {
      events = events.filter(event => event.significance >= filters.minSignificance);
    }

    if (filters.timeRange) {
      const { start, end } = filters.timeRange;
      events = events.filter(event =>
        event.timestamp >= start && event.timestamp <= end
      );
    }

    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Clear events (for testing)
  clearEvents() {
    this.events = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('historicalEvents');
    }
  }

  // Generate a unique ID for events
  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for test environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

  // ==================== NEED SATISFACTION EVENT GENERATION ====================

  /**
   * Generate historical events for need satisfaction changes
   * @param {Object} settlement - Settlement object
   * @param {Object} previousSatisfaction - Previous need satisfaction levels
   * @param {Object} currentSatisfaction - Current need satisfaction levels
   * @param {Array} consequences - Array of consequences generated
   * @returns {Array} Array of historical events
   */
  generateNeedSatisfactionEvents(settlement, previousSatisfaction, currentSatisfaction, consequences = []) {
    const events = [];
    const timestamp = Date.now();

    // Check for significant changes in individual needs
    const needEvents = this._generateIndividualNeedEvents(settlement, previousSatisfaction, currentSatisfaction, timestamp);
    events.push(...needEvents);

    // Check for overall satisfaction changes
    const overallEvent = this._generateOverallSatisfactionEvent(settlement, previousSatisfaction, currentSatisfaction, timestamp);
    if (overallEvent) {
      events.push(overallEvent);
    }

    // Generate consequence events
    const consequenceEvents = this._generateConsequenceEvents(settlement, consequences, timestamp);
    events.push(...consequenceEvents);

    // Check for regional effects
    const regionalEvent = this._generateRegionalNeedEvent(settlement, currentSatisfaction, timestamp);
    if (regionalEvent) {
      events.push(regionalEvent);
    }

    // Save all events
    events.forEach(event => this.saveEvent(event));

    return events;
  }

  /**
   * Generate events for individual need changes
   * @private
   */
  _generateIndividualNeedEvents(settlement, previousSatisfaction, currentSatisfaction, timestamp) {
    const events = [];
    const needs = ['food', 'water', 'shelter', 'goods', 'services'];
    const significantChangeThreshold = 0.2;

    needs.forEach(need => {
      const previous = previousSatisfaction.needs[need] || 0.5;
      const current = currentSatisfaction.needs[need] || 0.5;
      const change = current - previous;

      if (Math.abs(change) >= significantChangeThreshold) {
        const event = this._createNeedEvent(settlement, need, change, current, timestamp);
        if (event) {
          events.push(event);
        }
      }
    });

    return events;
  }

  /**
   * Create a specific need-related historical event
   * @private
   */
  _createNeedEvent(settlement, need, change, currentLevel, timestamp) {
    const isImprovement = change > 0;
    const severity = this._calculateNeedEventSeverity(currentLevel, Math.abs(change));

    if (severity === 'minor') return null; // Skip minor events

    return {
      id: this.generateId(),
      timestamp,
      type: 'need_satisfaction',
      subtype: need,
      settlementId: settlement.id,
      settlementName: settlement.name,
      severity,
      change,
      currentLevel,
      description: this._generateNeedEventDescription(settlement, need, isImprovement, severity, currentLevel),
      location: settlement.id,
      participants: [], // Could include affected characters
      significance: this._calculateNeedEventSignificance(severity, Math.abs(change)),
      metadata: {
        need: need,
        isImprovement,
        previousLevel: currentLevel - change,
        settlementType: settlement.type,
        population: settlement.population?.total || 0
      }
    };
  }

  /**
   * Generate overall satisfaction change event
   * @private
   */
  _generateOverallSatisfactionEvent(settlement, previousSatisfaction, currentSatisfaction, timestamp) {
    const previousOverall = previousSatisfaction.overall || 0.5;
    const currentOverall = currentSatisfaction.overall || 0.5;
    const change = currentOverall - previousOverall;

    if (Math.abs(change) < 0.15) return null; // Not significant enough

    const isImprovement = change > 0;
    const severity = this._calculateOverallEventSeverity(currentOverall, Math.abs(change));

    return {
      id: this.generateId(),
      timestamp,
      type: 'settlement_prosperity',
      subtype: isImprovement ? 'prosperity' : 'decline',
      settlementId: settlement.id,
      settlementName: settlement.name,
      severity,
      change,
      currentLevel: currentOverall,
      description: this._generateOverallEventDescription(settlement, isImprovement, severity, currentOverall),
      location: settlement.id,
      participants: [],
      significance: this._calculateOverallEventSignificance(severity, Math.abs(change)),
      metadata: {
        previousOverall: previousOverall,
        settlementType: settlement.type,
        population: settlement.population?.total || 0,
        isImprovement
      }
    };
  }

  /**
   * Generate consequence-related events
   * @private
   */
  _generateConsequenceEvents(settlement, consequences, timestamp) {
    return consequences.map(consequence => ({
      id: this.generateId(),
      timestamp,
      type: 'need_consequence',
      subtype: consequence.type,
      settlementId: settlement.id,
      settlementName: settlement.name,
      severity: consequence.severity || 'moderate',
      description: this._generateConsequenceEventDescription(settlement, consequence),
      location: settlement.id,
      participants: [],
      significance: this._calculateConsequenceSignificance(consequence),
      metadata: {
        consequenceType: consequence.type,
        consequenceId: consequence.id,
        settlementType: settlement.type,
        population: settlement.population?.total || 0
      }
    }));
  }

  /**
   * Generate regional need events
   * @private
   */
  _generateRegionalNeedEvent(settlement, currentSatisfaction, timestamp) {
    // This would typically check other settlements in the region
    // For now, we'll create events for extreme conditions
    if (currentSatisfaction.overall < 0.3) {
      return {
        id: this.generateId(),
        timestamp,
        type: 'regional_crisis',
        subtype: 'settlement_crisis',
        settlementId: settlement.id,
        settlementName: settlement.name,
        severity: 'major',
        description: `${settlement.name} enters a state of severe crisis, potentially affecting neighboring settlements.`,
        location: settlement.id,
        participants: [],
        significance: 0.8,
        metadata: {
          crisisType: 'need_satisfaction',
          overallSatisfaction: currentSatisfaction.overall,
          settlementType: settlement.type
        }
      };
    }

    if (currentSatisfaction.overall > 0.9) {
      return {
        id: this.generateId(),
        timestamp,
        type: 'regional_prosperity',
        subtype: 'settlement_boom',
        settlementId: settlement.id,
        settlementName: settlement.name,
        severity: 'moderate',
        description: `${settlement.name} experiences a period of unprecedented prosperity.`,
        location: settlement.id,
        participants: [],
        significance: 0.6,
        metadata: {
          prosperityType: 'need_satisfaction',
          overallSatisfaction: currentSatisfaction.overall,
          settlementType: settlement.type
        }
      };
    }

    return null;
  }

  // ==================== EVENT DESCRIPTION GENERATION ====================

  /**
   * Generate description for need events
   * @private
   */
  _generateNeedEventDescription(settlement, need, isImprovement, severity, currentLevel) {
    const settlementName = settlement.name;
    const level = Math.round(currentLevel * 100);

    const descriptions = {
      food: {
        improvement: [
          `${settlementName} experiences a ${severity} improvement in food production, reaching ${level}% satisfaction.`,
          `Agricultural success in ${settlementName} boosts food availability to ${level}% of needs.`,
          `${settlementName}'s harvests prove ${severity === 'major' ? 'exceptionally' : 'notably'} bountiful.`
        ],
        decline: [
          `${settlementName} faces a ${severity} food shortage, with only ${level}% of needs met.`,
          `Crop failures lead to ${severity} food scarcity in ${settlementName}.`,
          `${settlementName} struggles with food production, meeting only ${level}% of requirements.`
        ]
      },
      water: {
        improvement: [
          `${settlementName} achieves ${severity} improvements in water availability, reaching ${level}% satisfaction.`,
          `Water infrastructure developments boost ${settlementName}'s water supply to ${level}%.`,
          `${settlementName} overcomes water challenges with ${severity} success.`
        ],
        decline: [
          `${settlementName} suffers from ${severity} water shortages, with only ${level}% availability.`,
          `Drought conditions create ${severity} water scarcity in ${settlementName}.`,
          `${settlementName}'s water sources prove inadequate, meeting only ${level}% of needs.`
        ]
      },
      shelter: {
        improvement: [
          `${settlementName} sees ${severity} improvements in housing availability, reaching ${level}% satisfaction.`,
          `Construction efforts boost ${settlementName}'s shelter provision to ${level}%.`,
          `${settlementName} addresses housing needs with ${severity} success.`
        ],
        decline: [
          `${settlementName} faces ${severity} housing shortages, with only ${level}% of needs met.`,
          `Building material scarcity creates ${severity} shelter problems in ${settlementName}.`,
          `${settlementName} struggles to provide adequate housing, meeting only ${level}% of requirements.`
        ]
      },
      goods: {
        improvement: [
          `${settlementName} experiences ${severity} growth in goods production, reaching ${level}% satisfaction.`,
          `Craftsmanship and trade boost ${settlementName}'s goods availability to ${level}%.`,
          `${settlementName}'s economy shows ${severity} improvement in goods provision.`
        ],
        decline: [
          `${settlementName} suffers ${severity} economic downturn, with only ${level}% goods satisfaction.`,
          `Trade disruptions create ${severity} shortages of goods in ${settlementName}.`,
          `${settlementName}'s goods production meets only ${level}% of requirements.`
        ]
      },
      services: {
        improvement: [
          `${settlementName} achieves ${severity} improvements in public services, reaching ${level}% satisfaction.`,
          `Service infrastructure developments boost ${settlementName}'s service provision to ${level}%.`,
          `${settlementName} enhances public services with ${severity} success.`
        ],
        decline: [
          `${settlementName} faces ${severity} service deficiencies, with only ${level}% availability.`,
          `Resource constraints create ${severity} service shortfalls in ${settlementName}.`,
          `${settlementName}'s public services meet only ${level}% of requirements.`
        ]
      }
    };

    const templates = descriptions[need][isImprovement ? 'improvement' : 'decline'];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate description for overall satisfaction events
   * @private
   */
  _generateOverallEventDescription(settlement, isImprovement, severity, currentLevel) {
    const settlementName = settlement.name;
    const level = Math.round(currentLevel * 100);

    if (isImprovement) {
      const descriptions = [
        `${settlementName} enters a period of ${severity} prosperity, with overall need satisfaction at ${level}%.`,
        `Economic and social improvements bring ${settlementName} to ${level}% overall satisfaction.`,
        `${settlementName} achieves ${severity} success in meeting its inhabitants' needs.`
      ];
      return descriptions[Math.floor(Math.random() * descriptions.length)];
    } else {
      const descriptions = [
        `${settlementName} faces ${severity} challenges, with overall need satisfaction dropping to ${level}%.`,
        `Multiple factors combine to create ${severity} difficulties for ${settlementName}.`,
        `${settlementName} struggles to maintain basic needs, reaching only ${level}% satisfaction.`
      ];
      return descriptions[Math.floor(Math.random() * descriptions.length)];
    }
  }

  /**
   * Generate description for consequence events
   * @private
   */
  _generateConsequenceEventDescription(settlement, consequence) {
    const settlementName = settlement.name;
    const consequenceType = consequence.type;

    const descriptions = {
      famine: `${settlementName} begins experiencing famine conditions due to prolonged food shortages.`,
      water_crisis: `${settlementName} faces a water crisis that threatens public health and agriculture.`,
      housing_crisis: `${settlementName} struggles with a housing crisis affecting population growth and stability.`,
      economic_downturn: `${settlementName} enters an economic downturn due to goods and services shortages.`,
      disease_outbreak: `${settlementName} suffers from disease outbreaks related to poor living conditions.`,
      unrest: `${settlementName} experiences growing unrest due to unmet basic needs.`,
      migration: `${settlementName} sees increased migration as inhabitants seek better conditions elsewhere.`,
      prosperity: `${settlementName} enjoys a period of prosperity with all needs well-met.`,
      population_boom: `${settlementName} experiences population growth due to favorable living conditions.`,
      economic_boom: `${settlementName} thrives economically with abundant goods and services.`
    };

    return descriptions[consequenceType] || `${settlementName} faces ${consequenceType.replace('_', ' ')} consequences.`;
  }

  // ==================== EVENT SIGNIFICANCE CALCULATION ====================

  /**
   * Calculate significance for need events
   * @private
   */
  _calculateNeedEventSeverity(currentLevel, changeAmount) {
    if (currentLevel < 0.3 || changeAmount > 0.4) return 'major';
    if (currentLevel < 0.5 || changeAmount > 0.25) return 'moderate';
    if (currentLevel < 0.7 || changeAmount > 0.15) return 'minor';
    return 'trivial';
  }

  /**
   * Calculate significance for overall events
   * @private
   */
  _calculateOverallEventSeverity(currentLevel, changeAmount) {
    if (currentLevel < 0.2 || currentLevel > 0.9 || changeAmount > 0.3) return 'major';
    if (currentLevel < 0.4 || currentLevel > 0.8 || changeAmount > 0.2) return 'moderate';
    if (changeAmount > 0.1) return 'minor';
    return 'trivial';
  }

  /**
   * Calculate significance score for need events
   * @private
   */
  _calculateNeedEventSignificance(severity, changeAmount) {
    const baseSignificance = {
      major: 0.8,
      moderate: 0.5,
      minor: 0.2,
      trivial: 0.05
    };

    return Math.min(1.0, baseSignificance[severity] * (1 + changeAmount));
  }

  /**
   * Calculate significance score for overall events
   * @private
   */
  _calculateOverallEventSignificance(severity, changeAmount) {
    const baseSignificance = {
      major: 0.9,
      moderate: 0.6,
      minor: 0.3,
      trivial: 0.1
    };

    return Math.min(1.0, baseSignificance[severity] * (1 + changeAmount * 0.5));
  }

  /**
   * Calculate significance for consequence events
   * @private
   */
  _calculateConsequenceSignificance(consequence) {
    const severityMultipliers = {
      critical: 0.9,
      major: 0.7,
      moderate: 0.5,
      minor: 0.3,
      trivial: 0.1
    };

    const typeMultipliers = {
      famine: 0.9,
      water_crisis: 0.8,
      disease_outbreak: 0.8,
      unrest: 0.7,
      migration: 0.6,
      housing_crisis: 0.6,
      economic_downturn: 0.5,
      prosperity: 0.4,
      population_boom: 0.4,
      economic_boom: 0.3
    };

    const severity = consequence.severity || 'moderate';
    const type = consequence.type || 'generic';

    return Math.min(1.0, (severityMultipliers[severity] || 0.5) * (typeMultipliers[type] || 0.5));
  }

  // ==================== EVENT STORAGE AND RETRIEVAL ====================

  /**
   * Get need satisfaction events for a settlement
   * @param {string} settlementId - Settlement ID
   * @returns {Array} Need satisfaction events
   */
  getNeedSatisfactionEvents(settlementId) {
    return this.getEvents({
      type: 'need_satisfaction',
      settlementId
    });
  }

  /**
   * Get consequence events for a settlement
   * @param {string} settlementId - Settlement ID
   * @returns {Array} Consequence events
   */
  getConsequenceEvents(settlementId) {
    return this.getEvents({
      type: 'need_consequence',
      settlementId
    });
  }

  /**
   * Get prosperity/decline events for a settlement
   * @param {string} settlementId - Settlement ID
   * @returns {Array} Prosperity/decline events
   */
  getSettlementProsperityEvents(settlementId) {
    return this.getEvents({
      type: 'settlement_prosperity',
      settlementId
    });
  }

  // ==================== CROSS-SETTLEMENT EVENT GENERATION ====================

  /**
   * Generate historical events for cross-settlement interactions
   * @param {Object} sourceSettlement - Source settlement
   * @param {Object} targetSettlement - Target settlement
   * @param {string} interactionType - Type of interaction (trade, diplomacy, conflict, migration)
   * @param {Object} interactionData - Data about the interaction
   * @param {Array} consequences - Array of consequences generated
   * @returns {Array} Array of historical events
   */
  generateCrossSettlementEvents(sourceSettlement, targetSettlement, interactionType, interactionData = {}, consequences = []) {
    const events = [];
    const timestamp = Date.now();

    // Generate primary interaction event
    const primaryEvent = this._generatePrimaryCrossSettlementEvent(
      sourceSettlement, targetSettlement, interactionType, interactionData, timestamp
    );
    if (primaryEvent) {
      events.push(primaryEvent);
    }

    // Generate consequence events
    const consequenceEvents = this._generateCrossSettlementConsequenceEvents(
      sourceSettlement, targetSettlement, consequences, timestamp
    );
    events.push(...consequenceEvents);

    // Generate regional impact events
    const regionalEvents = this._generateRegionalImpactEvents(
      sourceSettlement, targetSettlement, interactionType, interactionData, timestamp
    );
    events.push(...regionalEvents);

    // Save all events
    events.forEach(event => this.saveEvent(event));

    return events;
  }

  /**
   * Generate primary cross-settlement interaction event
   * @private
   */
  _generatePrimaryCrossSettlementEvent(sourceSettlement, targetSettlement, interactionType, interactionData, timestamp) {
    const eventConfig = this._getCrossSettlementEventConfig(interactionType, interactionData);

    return {
      id: this.generateId(),
      timestamp,
      type: 'cross_settlement',
      subtype: interactionType,
      sourceSettlementId: sourceSettlement.id,
      sourceSettlementName: sourceSettlement.name,
      targetSettlementId: targetSettlement.id,
      targetSettlementName: targetSettlement.name,
      severity: eventConfig.severity,
      description: this._generateCrossSettlementEventDescription(
        sourceSettlement, targetSettlement, interactionType, interactionData, eventConfig
      ),
      location: `${sourceSettlement.id}-${targetSettlement.id}`,
      participants: [], // Could include involved characters
      significance: eventConfig.significance,
      metadata: {
        interactionType,
        interactionData,
        sourceSettlementType: sourceSettlement.type,
        targetSettlementType: targetSettlement.type,
        sourcePopulation: sourceSettlement.population?.total || 0,
        targetPopulation: targetSettlement.population?.total || 0
      }
    };
  }

  /**
   * Generate consequence events for cross-settlement interactions
   * @private
   */
  _generateCrossSettlementConsequenceEvents(sourceSettlement, targetSettlement, consequences, timestamp) {
    return consequences.map(consequence => ({
      id: this.generateId(),
      timestamp,
      type: 'cross_settlement_consequence',
      subtype: consequence.type,
      sourceSettlementId: sourceSettlement.id,
      targetSettlementId: targetSettlement.id,
      severity: consequence.severity || 'moderate',
      description: this._generateCrossSettlementConsequenceDescription(
        sourceSettlement, targetSettlement, consequence
      ),
      location: `${sourceSettlement.id}-${targetSettlement.id}`,
      participants: [],
      significance: this._calculateCrossSettlementConsequenceSignificance(consequence),
      metadata: {
        consequenceType: consequence.type,
        consequenceId: consequence.id,
        sourceSettlementType: sourceSettlement.type,
        targetSettlementType: targetSettlement.type
      }
    }));
  }

  /**
   * Generate regional impact events
   * @private
   */
  _generateRegionalImpactEvents(sourceSettlement, targetSettlement, interactionType, interactionData, timestamp) {
    const events = [];

    // Check for regional escalation potential
    if (interactionType === 'conflict' && interactionData.severity === 'major') {
      const escalationEvent = this._generateConflictEscalationEvent(
        sourceSettlement, targetSettlement, interactionData, timestamp
      );
      if (escalationEvent) {
        events.push(escalationEvent);
      }
    }

    // Check for alliance formation
    if (interactionType === 'diplomacy' && interactionData.outcome === 'alliance') {
      const allianceEvent = this._generateAllianceFormationEvent(
        sourceSettlement, targetSettlement, interactionData, timestamp
      );
      if (allianceEvent) {
        events.push(allianceEvent);
      }
    }

    // Check for trade network expansion
    if (interactionType === 'trade' && interactionData.volume > 100) {
      const networkEvent = this._generateTradeNetworkEvent(
        sourceSettlement, targetSettlement, interactionData, timestamp
      );
      if (networkEvent) {
        events.push(networkEvent);
      }
    }

    return events;
  }

  /**
   * Get event configuration for cross-settlement interactions
   * @private
   */
  _getCrossSettlementEventConfig(interactionType, interactionData) {
    const configs = {
      trade: {
        severity: interactionData.volume > 100 ? 'major' : interactionData.volume > 50 ? 'moderate' : 'minor',
        significance: Math.min(0.8, (interactionData.volume || 0) / 200)
      },
      diplomacy: {
        severity: interactionData.outcome === 'alliance' ? 'major' : interactionData.outcome === 'treaty' ? 'moderate' : 'minor',
        significance: interactionData.outcome === 'alliance' ? 0.9 : interactionData.outcome === 'treaty' ? 0.6 : 0.3
      },
      conflict: {
        severity: interactionData.severity || 'moderate',
        significance: interactionData.severity === 'major' ? 0.9 : interactionData.severity === 'moderate' ? 0.7 : 0.4
      },
      migration: {
        severity: interactionData.migrantCount > 50 ? 'major' : interactionData.migrantCount > 20 ? 'moderate' : 'minor',
        significance: Math.min(0.7, (interactionData.migrantCount || 0) / 100)
      }
    };

    return configs[interactionType] || { severity: 'minor', significance: 0.2 };
  }

  /**
   * Generate description for cross-settlement events
   * @private
   */
  _generateCrossSettlementEventDescription(sourceSettlement, targetSettlement, interactionType, interactionData, eventConfig) {
    const sourceName = sourceSettlement.name;
    const targetName = targetSettlement.name;

    const descriptions = {
      trade: this._generateTradeEventDescription(sourceName, targetName, interactionData, eventConfig.severity),
      diplomacy: this._generateDiplomacyEventDescription(sourceName, targetName, interactionData, eventConfig.severity),
      conflict: this._generateConflictEventDescription(sourceName, targetName, interactionData, eventConfig.severity),
      migration: this._generateMigrationEventDescription(sourceName, targetName, interactionData, eventConfig.severity)
    };

    return descriptions[interactionType] || `${sourceName} and ${targetName} engage in ${interactionType}.`;
  }

  /**
   * Generate trade event descriptions
   * @private
   */
  _generateTradeEventDescription(sourceName, targetName, interactionData, severity) {
    const volume = interactionData.volume || 0;
    const goods = interactionData.goods || ['goods'];

    const templates = {
      major: [
        `${sourceName} establishes a major trade relationship with ${targetName}, exchanging ${volume} units of ${goods.join(', ')}.`,
        `A significant trade agreement forms between ${sourceName} and ${targetName}, boosting economic activity in both settlements.`,
        `${sourceName} and ${targetName} begin extensive trade in ${goods.join(', ')}, creating new economic opportunities.`
      ],
      moderate: [
        `${sourceName} and ${targetName} establish trade relations, exchanging ${goods.join(', ')} between settlements.`,
        `Trade begins between ${sourceName} and ${targetName}, fostering economic cooperation.`,
        `${sourceName} opens trade routes to ${targetName}, exchanging valuable goods and resources.`
      ],
      minor: [
        `${sourceName} and ${targetName} engage in limited trade of ${goods.join(', ')}.`,
        `Small-scale trade begins between ${sourceName} and ${targetName}.`,
        `${sourceName} establishes basic trade connections with ${targetName}.`
      ]
    };

    const templateList = templates[severity] || templates.minor;
    return templateList[Math.floor(Math.random() * templateList.length)];
  }

  /**
   * Generate diplomacy event descriptions
   * @private
   */
  _generateDiplomacyEventDescription(sourceName, targetName, interactionData, severity) {
    const outcome = interactionData.outcome || 'negotiation';

    const templates = {
      alliance: [
        `${sourceName} and ${targetName} form a powerful alliance, uniting their settlements against common threats.`,
        `A historic alliance is forged between ${sourceName} and ${targetName}, strengthening both communities.`,
        `${sourceName} and ${targetName} enter into a mutual defense and cooperation agreement.`
      ],
      treaty: [
        `${sourceName} and ${targetName} sign a treaty establishing peaceful relations and cooperation.`,
        `Diplomatic negotiations between ${sourceName} and ${targetName} result in a formal treaty.`,
        `${sourceName} and ${targetName} reach diplomatic agreements to maintain peaceful coexistence.`
      ],
      negotiation: [
        `${sourceName} and ${targetName} engage in diplomatic negotiations to resolve differences.`,
        `Diplomatic talks begin between representatives of ${sourceName} and ${targetName}.`,
        `${sourceName} and ${targetName} explore possibilities for diplomatic relations.`
      ]
    };

    const templateList = templates[outcome] || templates.negotiation;
    return templateList[Math.floor(Math.random() * templateList.length)];
  }

  /**
   * Generate conflict event descriptions
   * @private
   */
  _generateConflictEventDescription(sourceName, targetName, interactionData, severity) {
    const conflictType = interactionData.type || 'dispute';

    const templates = {
      major: [
        `A major ${conflictType} erupts between ${sourceName} and ${targetName}, threatening the stability of both settlements.`,
        `War breaks out between ${sourceName} and ${targetName}, drawing in neighboring communities.`,
        `${sourceName} and ${targetName} engage in full-scale conflict that could reshape the region.`
      ],
      moderate: [
        `Tensions rise between ${sourceName} and ${targetName}, leading to armed conflict.`,
        `${sourceName} and ${targetName} become embroiled in a significant ${conflictType}.`,
        `Conflict emerges between ${sourceName} and ${targetName}, testing their relations.`
      ],
      minor: [
        `A border ${conflictType} arises between ${sourceName} and ${targetName}.`,
        `Minor conflicts occur between ${sourceName} and ${targetName}.`,
        `${sourceName} and ${targetName} experience escalating tensions.`
      ]
    };

    const templateList = templates[severity] || templates.minor;
    return templateList[Math.floor(Math.random() * templateList.length)];
  }

  /**
   * Generate migration event descriptions
   * @private
   */
  _generateMigrationEventDescription(sourceName, targetName, interactionData, severity) {
    const migrantCount = interactionData.migrantCount || 0;
    const direction = interactionData.direction || 'to'; // 'to' target or 'from' source

    const templates = {
      major: [
        `A large migration occurs as ${migrantCount} inhabitants move ${direction === 'to' ? `to ${targetName} from ${sourceName}` : `from ${sourceName} to ${targetName}`}.`,
        `Mass migration affects both ${sourceName} and ${targetName} as populations shift between settlements.`,
        `${sourceName} and ${targetName} experience significant demographic changes due to migration.`
      ],
      moderate: [
        `Migration patterns shift as inhabitants move between ${sourceName} and ${targetName}.`,
        `${sourceName} and ${targetName} see notable population movements between their settlements.`,
        `Demographic changes occur as people migrate between ${sourceName} and ${targetName}.`
      ],
      minor: [
        `Small groups migrate between ${sourceName} and ${targetName}.`,
        `Limited migration occurs between the two settlements.`,
        `Population movements are observed between ${sourceName} and ${targetName}.`
      ]
    };

    const templateList = templates[severity] || templates.minor;
    return templateList[Math.floor(Math.random() * templateList.length)];
  }

  /**
   * Generate cross-settlement consequence descriptions
   * @private
   */
  _generateCrossSettlementConsequenceDescription(sourceSettlement, targetSettlement, consequence) {
    const sourceName = sourceSettlement.name;
    const targetName = targetSettlement.name;
    const consequenceType = consequence.type;

    const descriptions = {
      trade_disruption: `Trade between ${sourceName} and ${targetName} is severely disrupted, affecting both economies.`,
      alliance_breakdown: `The alliance between ${sourceName} and ${targetName} breaks down, creating uncertainty in the region.`,
      war_declaration: `War is declared between ${sourceName} and ${targetName}, plunging both settlements into conflict.`,
      refugee_crisis: `A refugee crisis emerges as inhabitants flee ${sourceName} for ${targetName}.`,
      economic_dependence: `${sourceName} becomes economically dependent on ${targetName} through extensive trade relations.`,
      cultural_exchange: `Cultural exchange flourishes between ${sourceName} and ${targetName}, enriching both communities.`,
      territorial_dispute: `Territorial disputes arise between ${sourceName} and ${targetName}, straining relations.`,
      mutual_prosperity: `Both ${sourceName} and ${targetName} prosper from their cooperative relationship.`
    };

    return descriptions[consequenceType] || `${sourceName} and ${targetName} face ${consequenceType.replace('_', ' ')} consequences.`;
  }

  /**
   * Generate conflict escalation event
   * @private
   */
  _generateConflictEscalationEvent(sourceSettlement, targetSettlement, interactionData, timestamp) {
    return {
      id: this.generateId(),
      timestamp,
      type: 'regional_escalation',
      subtype: 'conflict_spread',
      sourceSettlementId: sourceSettlement.id,
      targetSettlementId: targetSettlement.id,
      severity: 'major',
      description: `The conflict between ${sourceSettlement.name} and ${targetSettlement.name} threatens to draw in neighboring settlements.`,
      location: `${sourceSettlement.id}-${targetSettlement.id}`,
      participants: [],
      significance: 0.8,
      metadata: {
        escalationType: 'conflict',
        potentialImpact: 'regional',
        sourceSettlementType: sourceSettlement.type,
        targetSettlementType: targetSettlement.type
      }
    };
  }

  /**
   * Generate alliance formation event
   * @private
   */
  _generateAllianceFormationEvent(sourceSettlement, targetSettlement, interactionData, timestamp) {
    return {
      id: this.generateId(),
      timestamp,
      type: 'regional_stability',
      subtype: 'alliance_formation',
      sourceSettlementId: sourceSettlement.id,
      targetSettlementId: targetSettlement.id,
      severity: 'major',
      description: `The alliance between ${sourceSettlement.name} and ${targetSettlement.name} brings stability to the region.`,
      location: `${sourceSettlement.id}-${targetSettlement.id}`,
      participants: [],
      significance: 0.7,
      metadata: {
        allianceType: 'defensive',
        regionalImpact: 'stabilizing',
        sourceSettlementType: sourceSettlement.type,
        targetSettlementType: targetSettlement.type
      }
    };
  }

  /**
   * Generate trade network event
   * @private
   */
  _generateTradeNetworkEvent(sourceSettlement, targetSettlement, interactionData, timestamp) {
    return {
      id: this.generateId(),
      timestamp,
      type: 'economic_network',
      subtype: 'trade_expansion',
      sourceSettlementId: sourceSettlement.id,
      targetSettlementId: targetSettlement.id,
      severity: 'moderate',
      description: `The trade relationship between ${sourceSettlement.name} and ${targetSettlement.name} creates new economic opportunities in the region.`,
      location: `${sourceSettlement.id}-${targetSettlement.id}`,
      participants: [],
      significance: 0.6,
      metadata: {
        networkType: 'trade',
        economicImpact: 'expansion',
        tradeVolume: interactionData.volume,
        sourceSettlementType: sourceSettlement.type,
        targetSettlementType: targetSettlement.type
      }
    };
  }

  /**
   * Calculate significance for cross-settlement consequences
   * @private
   */
  _calculateCrossSettlementConsequenceSignificance(consequence) {
    const severityMultipliers = {
      critical: 0.9,
      major: 0.7,
      moderate: 0.5,
      minor: 0.3,
      trivial: 0.1
    };

    const typeMultipliers = {
      war_declaration: 0.9,
      alliance_breakdown: 0.8,
      refugee_crisis: 0.8,
      trade_disruption: 0.7,
      territorial_dispute: 0.6,
      economic_dependence: 0.5,
      cultural_exchange: 0.4,
      mutual_prosperity: 0.4
    };

    const severity = consequence.severity || 'moderate';
    const type = consequence.type || 'generic';

    return Math.min(1.0, (severityMultipliers[severity] || 0.5) * (typeMultipliers[type] || 0.5));
  }

  // ==================== CROSS-SETTLEMENT EVENT RETRIEVAL ====================

  /**
   * Get cross-settlement events between two settlements
   * @param {string} sourceSettlementId - Source settlement ID
   * @param {string} targetSettlementId - Target settlement ID
   * @returns {Array} Cross-settlement events
   */
  getCrossSettlementEvents(sourceSettlementId, targetSettlementId) {
    return this.getEvents({
      type: 'cross_settlement'
    }).filter(event =>
      (event.sourceSettlementId === sourceSettlementId && event.targetSettlementId === targetSettlementId) ||
      (event.sourceSettlementId === targetSettlementId && event.targetSettlementId === sourceSettlementId)
    );
  }

  /**
   * Get cross-settlement events for a specific settlement
   * @param {string} settlementId - Settlement ID
   * @returns {Array} Cross-settlement events involving the settlement
   */
  getSettlementCrossSettlementEvents(settlementId) {
    return this.getEvents({
      type: 'cross_settlement'
    }).filter(event =>
      event.sourceSettlementId === settlementId || event.targetSettlementId === settlementId
    );
  }

  /**
   * Get cross-settlement consequence events
   * @param {string} settlementId - Settlement ID (optional)
   * @returns {Array} Cross-settlement consequence events
   */
  getCrossSettlementConsequenceEvents(settlementId = null) {
    const events = this.getEvents({
      type: 'cross_settlement_consequence'
    });

    if (settlementId) {
      return events.filter(event =>
        event.sourceSettlementId === settlementId || event.targetSettlementId === settlementId
      );
    }

    return events;
  }

  /**
   * Get regional impact events
   * @returns {Array} Regional impact events
   */
  getRegionalImpactEvents() {
    return this.getEvents({
      type: ['regional_escalation', 'regional_stability', 'economic_network']
    });
  }

  /**
   * Get settlement relationship summary
   * @param {string} settlementId - Settlement ID
   * @returns {Object} Relationship summary with other settlements
   */
  getSettlementRelationshipSummary(settlementId) {
    const crossSettlementEvents = this.getSettlementCrossSettlementEvents(settlementId);

    const relationships = {};

    crossSettlementEvents.forEach(event => {
      const otherSettlementId = event.sourceSettlementId === settlementId
        ? event.targetSettlementId
        : event.sourceSettlementId;

      const otherSettlementName = event.sourceSettlementId === settlementId
        ? event.targetSettlementName
        : event.sourceSettlementName;

      if (!relationships[otherSettlementId]) {
        relationships[otherSettlementId] = {
          settlementId: otherSettlementId,
          settlementName: otherSettlementName,
          interactionCount: 0,
          lastInteraction: null,
          relationshipTypes: new Set(),
          averageSignificance: 0
        };
      }

      const rel = relationships[otherSettlementId];
      rel.interactionCount++;
      rel.lastInteraction = Math.max(rel.lastInteraction || 0, event.timestamp);
      rel.relationshipTypes.add(event.subtype);
      rel.averageSignificance = (rel.averageSignificance * (rel.interactionCount - 1) + event.significance) / rel.interactionCount;
    });

    return Object.values(relationships);
  }

  /**
   * Get event statistics
   * @returns {Object} Event statistics
   */
  getEventStatistics() {
    const stats = {
      total: this.events.length,
      byType: {},
      bySeverity: {},
      bySettlement: {},
      averageSignificance: 0,
      timeRange: {
        earliest: null,
        latest: null
      }
    };

    if (this.events.length === 0) return stats;

    let totalSignificance = 0;

    this.events.forEach(event => {
      // Count by type
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;

      // Count by severity
      stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;

      // Count by settlement
      if (event.settlementId) {
        stats.bySettlement[event.settlementId] = (stats.bySettlement[event.settlementId] || 0) + 1;
      }

      // Track significance
      totalSignificance += event.significance || 0;

      // Track time range
      if (!stats.timeRange.earliest || event.timestamp < stats.timeRange.earliest) {
        stats.timeRange.earliest = event.timestamp;
      }
      if (!stats.timeRange.latest || event.timestamp > stats.timeRange.latest) {
        stats.timeRange.latest = event.timestamp;
      }
    });

    stats.averageSignificance = totalSignificance / this.events.length;

    return stats;
  }
}

export default HistoryGenerator;