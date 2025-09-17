/**
 * Population Group Service
 *
 * Manages population groups for LOD system, providing statistical modeling
 * and individual sampling capabilities for background-tier characters.
 */

import BaseDomainService from './BaseDomainService.js';
import PopulationGroup from '../entities/PopulationGroup.js';

class PopulationGroupService extends BaseDomainService {
  constructor() {
    super();
    this.populationGroups = new Map();
    this.performanceMetrics = {
      totalProcessingTime: 0,
      operationsCount: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Create a new population group
   */
  createPopulationGroup(config) {
    const startTime = performance.now();

    try {
      // Validate required parameters
      if (!config.settlementId) {
        return {
          success: false,
          error: 'settlementId is required'
        };
      }

      // Create the population group
      const group = new PopulationGroup({
        id: config.id || this._generateGroupId(),
        name: config.name || 'Unnamed Group',
        type: config.type || 'citizens',
        settlementId: config.settlementId,
        nodeId: config.nodeId,
        size: config.size || 10,
        averageAge: config.averageAge || 30,
        genderRatio: config.genderRatio || 0.5,
        averageAttributes: config.averageAttributes || {
          strength: 10, dexterity: 10, constitution: 10,
          intelligence: 10, wisdom: 10, charisma: 10
        },
        dominantPersonality: config.dominantPersonality || {},
        groupCohesion: config.groupCohesion || 0.5,
        averageWealth: config.averageWealth || 0,
        occupation: config.occupation || 'general',
        productivity: config.productivity || 1.0,
        skillLevel: config.skillLevel || 1,
        activityPatterns: config.activityPatterns || {},
        socialTendencies: config.socialTendencies || {},
        politicalLeanings: config.politicalLeanings || { law: 0, good: 0 },
        morale: config.morale || 0.5,
        satisfaction: config.satisfaction || 0.5,
        currentNeeds: config.currentNeeds || {},
        recentEvents: config.recentEvents || [],
        representatives: new Set(config.representativeIds || []),
        lastRepresentativeUpdate: config.lastRepresentativeUpdate || null,
        demographicTrends: config.demographicTrends || {},
        behaviorHistory: config.behaviorHistory || [],
        lastStatisticalUpdate: config.lastStatisticalUpdate || Date.now()
      });

      // Store the group
      this.populationGroups.set(group.id, group);

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        group: group,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update group statistics from member data
   */
  updateGroupStatistics(groupId, members) {
    const startTime = performance.now();

    try {
      const group = this.populationGroups.get(groupId);

      if (!group) {
        return {
          success: false,
          error: 'Population group not found'
        };
      }

      if (!members || members.length === 0) {
        return {
          success: false,
          error: 'Member data is required for statistics update'
        };
      }

      const updatedFields = [];

      // Calculate average age
      const averageAge = members.reduce((sum, m) => sum + (m.age || 30), 0) / members.length;
      if (averageAge !== group.averageAge) {
        group.averageAge = averageAge;
        updatedFields.push('averageAge');
      }

      // Calculate average wealth
      const averageWealth = members.reduce((sum, m) => sum + (m.wealth || 0), 0) / members.length;
      if (averageWealth !== group.averageWealth) {
        group.averageWealth = averageWealth;
        updatedFields.push('averageWealth');
      }

      // Calculate average morale
      const averageMorale = members.reduce((sum, m) => sum + (m.morale || 0.5), 0) / members.length;
      if (averageMorale !== group.morale) {
        group.morale = averageMorale;
        updatedFields.push('morale');
      }

      // Update size
      if (members.length !== group.size) {
        group.size = members.length;
        updatedFields.push('size');
      }

      group.lastStatisticalUpdate = Date.now();

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        updatedFields: updatedFields,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process group turn with statistical updates
   */
  processGroupTurn(groupId, world, turnContext = {}) {
    const startTime = performance.now();

    try {
      const group = this.populationGroups.get(groupId);

      if (!group) {
        return {
          success: false,
          error: 'Population group not found'
        };
      }

      if (!world) {
        return {
          success: false,
          error: 'World context is required'
        };
      }

      const aggregateEvents = [];
      const groupChanges = {};

      // Update morale based on world conditions
      this._updateGroupMorale(group, world, turnContext, groupChanges);

      // Process group needs
      this._processGroupNeeds(group, world, aggregateEvents);

      // Generate group events
      this._generateGroupEvents(group, world, turnContext, aggregateEvents);

      // Update demographics
      this._updateGroupDemographics(group, groupChanges);

      // Update behavior history
      group.behaviorHistory.push({
        turn: world.turn,
        morale: group.morale,
        satisfaction: group.satisfaction,
        events: aggregateEvents.length
      });

      // Keep only recent history
      if (group.behaviorHistory.length > 10) {
        group.behaviorHistory = group.behaviorHistory.slice(-10);
      }

      group.lastStatisticalUpdate = Date.now();

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        groupId: groupId,
        processed: true,
        aggregateEvents: aggregateEvents,
        statistics: this._getGroupStatistics(group),
        promotionCandidates: this._identifyPromotionCandidates(group),
        groupChanges: groupChanges,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sample individual characters from population group
   */
  sampleGroupMembers(groupId, sampleSize, criteria = {}) {
    const startTime = performance.now();

    try {
      const group = this.populationGroups.get(groupId);

      if (!group) {
        return {
          success: false,
          error: 'Population group not found'
        };
      }

      // Validate sample size
      if (!sampleSize || sampleSize < 1) {
        return {
          success: false,
          error: 'Sample size must be at least 1'
        };
      }

      if (sampleSize > 10) {
        return {
          success: false,
          error: 'Sample size cannot exceed 10'
        };
      }

      if (sampleSize > group.size) {
        return {
          success: false,
          error: 'Sample size cannot exceed group size'
        };
      }

      const samples = [];

      for (let i = 0; i < sampleSize; i++) {
        const individual = group.generateIndividual(criteria.template || {});
        samples.push(individual);
      }

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        samples: samples,
        groupId: groupId,
        sampleSize: sampleSize,
        generationMethod: 'statistical_variation',
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Materialize individual character from group
   */
  materializeIndividual(groupId, template = {}) {
    const startTime = performance.now();

    try {
      const group = this.populationGroups.get(groupId);

      if (!group) {
        return {
          success: false,
          error: 'Population group not found'
        };
      }

      const individual = group.generateIndividual(template);

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        character: individual,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Absorb individual back into group
   */
  absorbIndividualIntoGroup(characterId, groupId) {
    const startTime = performance.now();

    try {
      const group = this.populationGroups.get(groupId);

      if (!group) {
        return {
          success: false,
          error: 'Population group not found'
        };
      }

      // Remove from representatives if present
      group.representatives.delete(characterId);

      // Update group statistics (would need character data in real implementation)
      group.lastRepresentativeUpdate = Date.now();

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Aggregate group behavior patterns
   */
  aggregateGroupBehavior(groupId, context = {}) {
    const startTime = performance.now();

    try {
      const group = this.populationGroups.get(groupId);

      if (!group) {
        return {
          success: false,
          error: 'Population group not found'
        };
      }

      // Calculate activity level based on context
      const activityLevel = this._calculateActivityLevel(group, context);

      // Calculate social cohesion
      const socialCohesion = this._calculateSocialCohesion(group, context);

      // Generate behavior patterns
      const behaviorPatterns = {
        activityLevel: activityLevel,
        socialCohesion: socialCohesion,
        productivityModifier: this._calculateProductivityModifier(group, context),
        riskTolerance: this._calculateRiskTolerance(group, context)
      };

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        behaviorPatterns: behaviorPatterns,
        activityLevel: activityLevel,
        socialCohesion: socialCohesion,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate group events
   */
  generateGroupEvents(groupId, world, turnContext = {}) {
    const startTime = performance.now();

    try {
      const group = this.populationGroups.get(groupId);

      if (!group) {
        return {
          success: false,
          error: 'Population group not found'
        };
      }

      const events = this._generateGroupEvents(group, world, turnContext, []);

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        events: events,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update group demographics
   */
  updateGroupDemographics(groupId) {
    const startTime = performance.now();

    try {
      const group = this.populationGroups.get(groupId);

      if (!group) {
        return {
          success: false,
          error: 'Population group not found'
        };
      }

      const demographicChanges = {
        populationChange: 0,
        ageChange: 0,
        births: 0,
        deaths: 0,
        migration: 0
      };

      // Simulate demographic changes
      const baseChangeRate = 0.02; // 2% change per turn

      // Population growth/decline based on conditions
      const growthRate = (group.morale - 0.5) * baseChangeRate;
      demographicChanges.populationChange = Math.round(group.size * growthRate);

      // Age slightly
      demographicChanges.ageChange = 0.1;

      // Random events
      if (Math.random() < 0.1) { // 10% chance
        demographicChanges.births = Math.max(1, Math.floor(group.size * 0.01));
      }

      if (Math.random() < 0.05) { // 5% chance
        demographicChanges.deaths = Math.max(1, Math.floor(group.size * 0.005));
      }

      // Apply changes
      group.size += demographicChanges.populationChange;
      group.averageAge += demographicChanges.ageChange;

      // Ensure reasonable bounds
      group.size = Math.max(1, group.size);
      group.averageAge = Math.max(15, Math.min(80, group.averageAge));

      group.lastStatisticalUpdate = Date.now();

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        demographicChanges: demographicChanges,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get group for testing purposes
   */
  getGroup(groupId) {
    return this.populationGroups.get(groupId);
  }

  // Private helper methods

  _generateGroupId() {
    return `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _updatePerformanceMetrics(processingTime) {
    this.performanceMetrics.totalProcessingTime += processingTime;
    this.performanceMetrics.operationsCount += 1;
    this.performanceMetrics.averageProcessingTime =
      this.performanceMetrics.totalProcessingTime / this.performanceMetrics.operationsCount;
  }

  _updateGroupMorale(group, world, turnContext, changes) {
    let moraleChange = 0;

    // Economic conditions
    if (turnContext.economicConditions === 'booming') {
      moraleChange += 0.1;
    } else if (turnContext.economicConditions === 'recession') {
      moraleChange -= 0.1;
    }

    // Seasonal effects
    if (turnContext.season === 'summer') {
      moraleChange += 0.05;
    } else if (turnContext.season === 'winter') {
      moraleChange -= 0.05;
    }

    // Events
    if (turnContext.events) {
      if (turnContext.events.includes('festival')) {
        moraleChange += 0.15;
      }
      if (turnContext.events.includes('tax_collection')) {
        moraleChange -= 0.1;
      }
    }

    // Apply change with bounds
    const newMorale = Math.max(0, Math.min(1, group.morale + moraleChange));
    if (newMorale !== group.morale) {
      changes.morale = newMorale - group.morale;
      group.morale = newMorale;
    }
  }

  _processGroupNeeds(group, world, events) {
    // Process basic needs
    const needs = group.currentNeeds;

    if (needs.food && needs.food > 0.7) {
      events.push({
        id: `event-${Date.now()}-hunger`,
        type: 'group_complaint',
        significance: 2,
        description: `${group.name} expresses concerns about food shortages`,
        participants: [group.id],
        consequences: [{ type: 'morale_decrease', value: -0.1 }]
      });
    }

    if (needs.security && needs.security < 0.3) {
      events.push({
        id: `event-${Date.now()}-insecurity`,
        type: 'group_unrest',
        significance: 3,
        description: `${group.name} reports feelings of insecurity`,
        participants: [group.id],
        consequences: [{ type: 'morale_decrease', value: -0.15 }]
      });
    }
  }

  _generateGroupEvents(group, world, turnContext, events) {
    // Generate events based on group state
    if (group.morale < 0.3) { // Lowered threshold to ensure events are generated
      events.push({
        id: `event-${Date.now()}-low-morale`,
        type: 'group_dissatisfaction',
        significance: 2,
        description: `${group.name} shows signs of widespread dissatisfaction`,
        participants: [group.id],
        consequences: [{ type: 'productivity_decrease', value: -0.2 }]
      });
    }

    if (group.morale > 0.8 && Math.random() < 0.3) {
      events.push({
        id: `event-${Date.now()}-celebration`,
        type: 'group_celebration',
        significance: 1,
        description: `${group.name} celebrates positive developments`,
        participants: [group.id],
        consequences: [{ type: 'morale_boost', value: 0.05 }]
      });
    }
  }

  _updateGroupDemographics(group, changes) {
    // Simple demographic updates
    const ageIncrease = 0.05;
    group.averageAge += ageIncrease;
    changes.averageAge = ageIncrease;
  }

  _getGroupStatistics(group) {
    return {
      averageHappiness: group.morale,
      productivityLevel: group.productivity,
      cohesionIndex: group.groupCohesion,
      growthRate: (group.size - (group.size * 0.98)) / group.size, // Simplified
      resourceGeneration: {
        labor: group.size * group.productivity,
        skills: group.skillLevel * group.size * 0.1
      }
    };
  }

  _identifyPromotionCandidates(group) {
    // Identify characters that might be promoted to hero tier
    const candidates = [];

    if (group.morale > 0.8 && group.skillLevel > 2) {
      // High-performing groups might produce hero candidates
      candidates.push(`potential-hero-${group.id}`);
    }

    return candidates;
  }

  _calculateActivityLevel(group, context) {
    let activity = 0.5; // Base activity

    if (context.timeOfDay === 'day') {
      activity += 0.2;
    } else if (context.timeOfDay === 'night') {
      activity -= 0.3;
    }

    if (context.weather === 'good') {
      activity += 0.1;
    } else if (context.weather === 'bad') {
      activity -= 0.1;
    }

    return Math.max(0, Math.min(1, activity));
  }

  _calculateSocialCohesion(group, context) {
    return group.groupCohesion * (group.morale + 0.5); // Simplified calculation
  }

  _calculateProductivityModifier(group, context) {
    return group.productivity * group.morale;
  }

  _calculateRiskTolerance(group, context) {
    // Risk tolerance based on group characteristics
    return (group.politicalLeanings.good + 1) / 2; // Convert -1..1 to 0..1
  }
}

export default PopulationGroupService;