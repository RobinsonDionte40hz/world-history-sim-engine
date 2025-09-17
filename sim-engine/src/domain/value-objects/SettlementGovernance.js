// src/domain/value-objects/SettlementGovernance.js

import { BaseValueObject } from './BaseValueObject.js';

/**
 * Immutable value object representing the governance system of a settlement
 * Defines political structure, decision-making processes, and governance effects
 * on settlement development and character behavior
 */
export class SettlementGovernance extends BaseValueObject {
  constructor(config = {}) {
    super();

    // Core Governance Type
    this.type = config.type || 'democratic';
    this.structure = config.structure || 'council';
    this.leadershipMethod = config.leadershipMethod || 'elected';

    // Governance Characteristics (0-1 scales)
    this.decisionMakingProcess = config.decisionMakingProcess || 'majority_vote';
    this.citizenParticipation = config.citizenParticipation || 0.7;
    this.bureaucraticEfficiency = config.bureaucraticEfficiency || 0.5;
    this.corruption = config.corruption || 0.1;

    // Power Distribution
    this.powerConcentration = config.powerConcentration || 0.3; // 0-1, higher = more centralized
    this.checksAndBalances = config.checksAndBalances !== undefined ? config.checksAndBalances : true;
    this.termLimits = config.termLimits !== undefined ? config.termLimits : true;

    // Policy Tendencies
    this.economicPolicy = config.economicPolicy || 'mixed';
    this.socialPolicy = config.socialPolicy || 'progressive';
    this.foreignPolicy = config.foreignPolicy || 'diplomatic';

    // Governance Effects (0-1 scales)
    this.lawAndOrder = config.lawAndOrder || 0.6;
    this.socialCohesion = config.socialCohesion || 0.5;
    this.adaptability = config.adaptability || 0.6;

    // Validate inputs
    this._validateInputs();

    // Freeze the object to ensure immutability
    this.freeze();
  }

  /**
   * Make a governance decision on an issue
   */
  makeDecision(issue, context = {}) {
    const decision = this._processDecision(issue, context);
    const efficiency = this._calculateDecisionEfficiency(issue);
    const support = this._calculatePopularSupport(decision, context);
    const implementationTime = this._calculateImplementationTime(decision);

    return {
      decision,
      efficiency,
      support,
      implementationTime,
      governanceType: this.type,
      decisionProcess: this.decisionMakingProcess
    };
  }

  /**
   * Get governance modifiers that affect settlement development
   */
  getGovernanceModifiers() {
    return {
      economicEfficiency: this.bureaucraticEfficiency * (1 - this.corruption),
      socialStability: this.lawAndOrder * this.socialCohesion,
      innovationRate: this.adaptability * this.citizenParticipation,
      militaryEffectiveness: this.powerConcentration + this.lawAndOrder * 0.5,
      corruptionPenalty: this.corruption,
      citizenSatisfaction: this.citizenParticipation * (1 - this.corruption)
    };
  }

  /**
   * Get governance stability rating (0-1)
   */
  getStabilityRating() {
    // Stability based on power distribution, corruption, and citizen participation
    const powerStability = 1 - Math.abs(this.powerConcentration - 0.5) * 2; // Optimal at 0.5
    const corruptionStability = 1 - this.corruption;
    const participationStability = this.citizenParticipation;

    return (powerStability + corruptionStability + participationStability) / 3;
  }

  /**
   * Check if governance supports a particular policy type
   */
  supportsPolicy(policyType, policyValue) {
    switch (policyType) {
      case 'economic':
        return this._isCompatiblePolicy(this.economicPolicy, policyValue);
      case 'social':
        return this._isCompatiblePolicy(this.socialPolicy, policyValue);
      case 'foreign':
        return this._isCompatiblePolicy(this.foreignPolicy, policyValue);
      default:
        return false;
    }
  }

  /**
   * Get governance type description
   */
  getTypeDescription() {
    const descriptions = {
      democratic: 'Citizen participation in decision-making with elected leadership',
      authoritarian: 'Centralized power with limited citizen input',
      theocratic: 'Religious leadership guiding governance decisions',
      oligarchic: 'Rule by a small group of powerful individuals',
      meritocratic: 'Leadership based on achievement and capability',
      anarchic: 'Decentralized decision-making with minimal formal structure'
    };
    return descriptions[this.type] || 'Custom governance system';
  }

  /**
   * Calculate governance effectiveness for different domains
   */
  getEffectivenessRatings() {
    return {
      administration: this.bureaucraticEfficiency * (1 - this.corruption),
      lawEnforcement: this.lawAndOrder,
      socialServices: this.socialCohesion * this.citizenParticipation,
      economicDevelopment: this._getEconomicEffectiveness(),
      diplomaticRelations: this._getDiplomaticEffectiveness(),
      militaryPreparedness: this.powerConcentration + this.lawAndOrder * 0.3
    };
  }

  /**
   * Check if governance can adapt to changing circumstances
   */
  canAdaptToChange(changeType) {
    switch (changeType) {
      case 'crisis':
        return this.adaptability > 0.6 && this.powerConcentration < 0.7;
      case 'growth':
        return this.adaptability > 0.4 && this.bureaucraticEfficiency > 0.5;
      case 'conflict':
        return this.lawAndOrder > 0.5 && this.powerConcentration > 0.3;
      default:
        return this.adaptability > 0.5;
    }
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      type: this.type,
      structure: this.structure,
      leadershipMethod: this.leadershipMethod,
      decisionMakingProcess: this.decisionMakingProcess,
      citizenParticipation: this.citizenParticipation,
      bureaucraticEfficiency: this.bureaucraticEfficiency,
      corruption: this.corruption,
      powerConcentration: this.powerConcentration,
      checksAndBalances: this.checksAndBalances,
      termLimits: this.termLimits,
      economicPolicy: this.economicPolicy,
      socialPolicy: this.socialPolicy,
      foreignPolicy: this.foreignPolicy,
      lawAndOrder: this.lawAndOrder,
      socialCohesion: this.socialCohesion,
      adaptability: this.adaptability
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for SettlementGovernance');
    }

    return new SettlementGovernance(data);
  }

  /**
   * Create predefined governance types
   */
  static DEMOCRATIC = new SettlementGovernance({
    type: 'democratic',
    structure: 'council',
    leadershipMethod: 'elected',
    decisionMakingProcess: 'majority_vote',
    citizenParticipation: 0.8,
    bureaucraticEfficiency: 0.6,
    corruption: 0.2,
    powerConcentration: 0.3,
    checksAndBalances: true,
    termLimits: true,
    economicPolicy: 'mixed',
    socialPolicy: 'progressive',
    foreignPolicy: 'diplomatic',
    lawAndOrder: 0.7,
    socialCohesion: 0.8,
    adaptability: 0.7
  });

  static AUTHORITARIAN = new SettlementGovernance({
    type: 'authoritarian',
    structure: 'monarchy',
    leadershipMethod: 'inherited',
    decisionMakingProcess: 'decree',
    citizenParticipation: 0.2,
    bureaucraticEfficiency: 0.8,
    corruption: 0.4,
    powerConcentration: 0.9,
    checksAndBalances: false,
    termLimits: false,
    economicPolicy: 'planned',
    socialPolicy: 'conservative',
    foreignPolicy: 'aggressive',
    lawAndOrder: 0.9,
    socialCohesion: 0.4,
    adaptability: 0.3
  });

  static THEOCRATIC = new SettlementGovernance({
    type: 'theocratic',
    structure: 'hierarchy',
    leadershipMethod: 'appointed',
    decisionMakingProcess: 'divine_guidance',
    citizenParticipation: 0.5,
    bureaucraticEfficiency: 0.7,
    corruption: 0.1,
    powerConcentration: 0.7,
    checksAndBalances: true,
    termLimits: false,
    economicPolicy: 'mixed',
    socialPolicy: 'conservative',
    foreignPolicy: 'diplomatic',
    lawAndOrder: 0.8,
    socialCohesion: 0.9,
    adaptability: 0.4
  });

  /**
   * Get a predefined governance type
   */
  static get(type) {
    switch (type) {
      case 'democratic': return SettlementGovernance.DEMOCRATIC;
      case 'authoritarian': return SettlementGovernance.AUTHORITARIAN;
      case 'theocratic': return SettlementGovernance.THEOCRATIC;
      default: throw new Error(`Unknown governance type: ${type}`);
    }
  }

  /**
   * Private validation method
   */
  _validateInputs() {
    // Validate ranges (0-1 scales)
    const rangeFields = [
      'citizenParticipation', 'bureaucraticEfficiency', 'corruption',
      'powerConcentration', 'lawAndOrder', 'socialCohesion', 'adaptability'
    ];

    for (const field of rangeFields) {
      this.validateRange(field, this[field], 0, 1);
    }

    // Validate enum fields
    this._validateEnum('type', this.type, ['democratic', 'authoritarian', 'theocratic', 'oligarchic', 'meritocratic', 'anarchic']);
    this._validateEnum('structure', this.structure, ['council', 'monarchy', 'oligarchy', 'hierarchy', 'assembly', 'tribal']);
    this._validateEnum('leadershipMethod', this.leadershipMethod, ['elected', 'inherited', 'appointed', 'merit', 'lottery']);
    this._validateEnum('economicPolicy', this.economicPolicy, ['free_market', 'planned', 'mixed']);
    this._validateEnum('socialPolicy', this.socialPolicy, ['conservative', 'progressive', 'moderate']);
    this._validateEnum('foreignPolicy', this.foreignPolicy, ['aggressive', 'diplomatic', 'isolationist']);
  }

  /**
   * Validate enum values
   */
  _validateEnum(field, value, allowedValues) {
    if (!allowedValues.includes(value)) {
      throw new Error(`Invalid ${field}: ${value}. Must be one of: ${allowedValues.join(', ')}`);
    }
  }

  /**
   * Process a decision based on governance type
   */
  _processDecision(issue, context) {
    // Simplified decision processing - in practice this would be more complex
    switch (this.decisionMakingProcess) {
      case 'majority_vote':
        return this._processMajorityVote(issue, context);
      case 'decree':
        return this._processDecree(issue, context);
      case 'consensus':
        return this._processConsensus(issue, context);
      default:
        return { approved: Math.random() > 0.5, confidence: 0.5 };
    }
  }

  /**
   * Calculate decision efficiency
   */
  _calculateDecisionEfficiency(issue) {
    // Efficiency based on bureaucratic efficiency and issue complexity
    const baseEfficiency = this.bureaucraticEfficiency;
    const complexityPenalty = issue.complexity || 0.5;
    return Math.max(0.1, baseEfficiency * (1 - complexityPenalty * 0.3));
  }

  /**
   * Calculate popular support for a decision
   */
  _calculatePopularSupport(decision, context) {
    // Support based on citizen participation and decision alignment with policies
    const baseSupport = this.citizenParticipation;
    const policyAlignment = this._calculatePolicyAlignment(decision, context);
    return Math.min(1, baseSupport * policyAlignment);
  }

  /**
   * Calculate implementation time for a decision
   */
  _calculateImplementationTime(decision) {
    // Time based on bureaucratic efficiency and decision complexity
    const baseTime = decision.complexity ? decision.complexity * 10 : 5;
    const efficiencyModifier = 2 - this.bureaucraticEfficiency; // Lower efficiency = more time
    return Math.ceil(baseTime * efficiencyModifier);
  }

  /**
   * Get economic effectiveness rating
   */
  _getEconomicEffectiveness() {
    const policyMultipliers = {
      free_market: 1.2,
      planned: 0.8,
      mixed: 1.0
    };
    return this.bureaucraticEfficiency * (policyMultipliers[this.economicPolicy] || 1.0) * (1 - this.corruption);
  }

  /**
   * Get diplomatic effectiveness rating
   */
  _getDiplomaticEffectiveness() {
    const policyMultipliers = {
      diplomatic: 1.3,
      aggressive: 0.7,
      isolationist: 0.5
    };
    return this.citizenParticipation * (policyMultipliers[this.foreignPolicy] || 1.0);
  }

  /**
   * Check if a policy value is compatible with governance tendencies
   */
  _isCompatiblePolicy(governancePolicy, proposedPolicy) {
    // Simple compatibility check - could be more sophisticated
    return governancePolicy === proposedPolicy || governancePolicy === 'mixed';
  }

  /**
   * Calculate policy alignment for a decision
   */
  _calculatePolicyAlignment(decision, context) {
    // Simplified alignment calculation
    let alignment = 0.5; // Neutral starting point

    if (decision.economicImpact) {
      alignment += decision.economicImpact === this.economicPolicy ? 0.2 : -0.1;
    }

    if (decision.socialImpact) {
      alignment += decision.socialImpact === this.socialPolicy ? 0.2 : -0.1;
    }

    return Math.max(0, Math.min(1, alignment));
  }

  /**
   * Process majority vote decision
   */
  _processMajorityVote(issue, context) {
    const approvalChance = 0.5 + (this.citizenParticipation - 0.5) * 0.4;
    return {
      approved: Math.random() < approvalChance,
      confidence: approvalChance,
      process: 'majority_vote'
    };
  }

  /**
   * Process decree decision
   */
  _processDecree(issue, context) {
    const approvalChance = 0.3 + this.powerConcentration * 0.7;
    return {
      approved: Math.random() < approvalChance,
      confidence: approvalChance,
      process: 'decree'
    };
  }

  /**
   * Process consensus decision
   */
  _processConsensus(issue, context) {
    const approvalChance = this.socialCohesion * this.citizenParticipation;
    return {
      approved: Math.random() < approvalChance,
      confidence: approvalChance,
      process: 'consensus'
    };
  }
}

export default SettlementGovernance;