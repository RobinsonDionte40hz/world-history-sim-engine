// src/domain/value-objects/EconomicProfile.js

import { BaseValueObject } from './BaseValueObject.js';
import { ValidationError, SerializationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * EconomicProfile value object for character economic investment data
 * Represents wealth, investments, and economic goals for a character
 * Follows immutable value object pattern
 */
export class EconomicProfile extends BaseValueObject {
  /**
   * Create a new EconomicProfile
   * @param {Object} config - Configuration object
   * @param {number} config.wealth - Total liquid wealth/currency
   * @param {number} config.passiveIncome - Income per turn from investments
   * @param {Array} config.investments - Array of investment objects
   * @param {Object} config.goals - Economic goals by type
   * @param {Object} config.history - Investment history tracking
   * @param {Object} config.metadata - Additional economic metadata
   */
  constructor(config = {}) {
    super();

    // Validate and set wealth
    this.wealth = config.wealth !== undefined ? config.wealth : 0;
    this.validateRange('wealth', this.wealth, 0, Number.MAX_SAFE_INTEGER);

    // Validate and set passive income
    this.passiveIncome = config.passiveIncome !== undefined ? config.passiveIncome : 0;
    this.validateRange('passiveIncome', this.passiveIncome, 0, Number.MAX_SAFE_INTEGER);

    // Validate and set investments
    this.investments = Array.isArray(config.investments) ? [...config.investments] : [];
    this.validateArray('investments', this.investments, 0);
    this.investments.forEach((investment, index) => {
      this._validateInvestment(investment, index);
    });

    // Validate and set goals
    this.goals = config.goals ? { ...config.goals } : {};
    this._validateGoals(this.goals);

    // Set investment history with defaults
    this.history = config.history ? { ...config.history } : {
      totalInvested: 0,
      totalReturns: 0,
      investmentCount: 0,
      lastInvestmentDate: null,
      profitLossRatio: 0
    };
    this._validateHistory(this.history);

    // Set metadata with defaults
    this.metadata = config.metadata ? { ...config.metadata } : {
      riskTolerance: 'moderate', // conservative, moderate, aggressive
      investmentStrategy: 'balanced', // growth, income, balanced, speculative
      creditRating: 'fair', // poor, fair, good, excellent
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    this._validateMetadata(this.metadata);

    // Validate the complete profile
    this.validate();

    // Freeze for immutability
    this.freeze();
  }

  /**
   * Validate the economic profile's overall state
   */
  validate() {
    super.validate();

    // Ensure total investment value matches investment array
    const calculatedInvestmentValue = this.investments.reduce((total, inv) => total + inv.value, 0);
    const totalWealth = this.wealth + calculatedInvestmentValue;
    
    if (totalWealth < 0) {
      throw new ValidationError('totalWealth', totalWealth, 'Total wealth (liquid + investments) cannot be negative');
    }

    // Validate passive income doesn't exceed reasonable bounds relative to investments
    const maxReasonableIncome = calculatedInvestmentValue * 0.5; // Max 50% return per turn
    if (this.passiveIncome > maxReasonableIncome && calculatedInvestmentValue > 0) {
      throw new ValidationError('passiveIncome', this.passiveIncome, 
        `Passive income (${this.passiveIncome}) exceeds reasonable bounds relative to investments (${calculatedInvestmentValue})`);
    }
  }

  /**
   * Validate individual investment object
   */
  _validateInvestment(investment, index) {
    if (!investment || typeof investment !== 'object') {
      throw new ValidationError(`investments[${index}]`, investment, 'Investment must be an object');
    }

    this.validateRequired(`investments[${index}].id`, investment.id);
    this.validateStringLength(`investments[${index}].id`, investment.id, 1, 100);

    this.validateRequired(`investments[${index}].type`, investment.type);
    this.validateStringLength(`investments[${index}].type`, investment.type, 1, 50);

    this.validateRequired(`investments[${index}].value`, investment.value);
    this.validateRange(`investments[${index}].value`, investment.value, 0, Number.MAX_SAFE_INTEGER);

    // Optional fields with validation if present
    if (investment.description !== undefined) {
      this.validateStringLength(`investments[${index}].description`, investment.description, 0, 500);
    }

    if (investment.expectedReturn !== undefined) {
      this.validateRange(`investments[${index}].expectedReturn`, investment.expectedReturn, 0, Number.MAX_SAFE_INTEGER);
    }

    if (investment.riskLevel !== undefined) {
      const validRiskLevels = ['low', 'moderate', 'high', 'very_high'];
      if (!validRiskLevels.includes(investment.riskLevel)) {
        throw new ValidationError(`investments[${index}].riskLevel`, investment.riskLevel, 
          `Risk level must be one of: ${validRiskLevels.join(', ')}`);
      }
    }

    if (investment.maturityDate !== undefined && !(investment.maturityDate instanceof Date)) {
      throw new ValidationError(`investments[${index}].maturityDate`, investment.maturityDate, 'Maturity date must be a Date object');
    }
  }

  /**
   * Validate economic goals
   */
  _validateGoals(goals) {
    const validGoalTypes = ['wealth_target', 'passive_income_target', 'investment_diversification', 'risk_reduction', 'business_ownership'];
    
    Object.keys(goals).forEach(goalType => {
      if (!validGoalTypes.includes(goalType)) {
        throw new ValidationError(`goals.${goalType}`, goalType, `Goal type must be one of: ${validGoalTypes.join(', ')}`);
      }

      const goal = goals[goalType];
      if (!goal || typeof goal !== 'object') {
        throw new ValidationError(`goals.${goalType}`, goal, 'Goal must be an object');
      }

      if (goal.target !== undefined) {
        this.validateRange(`goals.${goalType}.target`, goal.target, 0, Number.MAX_SAFE_INTEGER);
      }

      if (goal.deadline !== undefined && !(goal.deadline instanceof Date)) {
        throw new ValidationError(`goals.${goalType}.deadline`, goal.deadline, 'Goal deadline must be a Date object');
      }
    });
  }

  /**
   * Validate investment history
   */
  _validateHistory(history) {
    this.validateRange('history.totalInvested', history.totalInvested, 0, Number.MAX_SAFE_INTEGER);
    this.validateRange('history.totalReturns', history.totalReturns, 0, Number.MAX_SAFE_INTEGER);
    this.validateRange('history.investmentCount', history.investmentCount, 0, Number.MAX_SAFE_INTEGER);
    this.validateRange('history.profitLossRatio', history.profitLossRatio, -100, 100);

    if (history.lastInvestmentDate !== null && !(history.lastInvestmentDate instanceof Date)) {
      throw new ValidationError('history.lastInvestmentDate', history.lastInvestmentDate, 'Last investment date must be a Date object or null');
    }
  }

  /**
   * Validate metadata
   */
  _validateMetadata(metadata) {
    const validRiskTolerances = ['conservative', 'moderate', 'aggressive'];
    if (metadata.riskTolerance && !validRiskTolerances.includes(metadata.riskTolerance)) {
      throw new ValidationError('metadata.riskTolerance', metadata.riskTolerance, 
        `Risk tolerance must be one of: ${validRiskTolerances.join(', ')}`);
    }

    const validStrategies = ['growth', 'income', 'balanced', 'speculative'];
    if (metadata.investmentStrategy && !validStrategies.includes(metadata.investmentStrategy)) {
      throw new ValidationError('metadata.investmentStrategy', metadata.investmentStrategy, 
        `Investment strategy must be one of: ${validStrategies.join(', ')}`);
    }

    const validCreditRatings = ['poor', 'fair', 'good', 'excellent'];
    if (metadata.creditRating && !validCreditRatings.includes(metadata.creditRating)) {
      throw new ValidationError('metadata.creditRating', metadata.creditRating, 
        `Credit rating must be one of: ${validCreditRatings.join(', ')}`);
    }
  }

  /**
   * Get total investment value
   */
  getTotalInvestmentValue() {
    return this.investments.reduce((total, investment) => total + investment.value, 0);
  }

  /**
   * Get total economic value (wealth + investments)
   */
  getTotalValue() {
    return this.wealth + this.getTotalInvestmentValue();
  }

  /**
   * Get investments by type
   */
  getInvestmentsByType(type) {
    return this.investments.filter(investment => investment.type === type);
  }

  /**
   * Get investment portfolio diversification
   */
  getPortfolioDiversification() {
    const typeGroups = {};
    let totalValue = this.getTotalInvestmentValue();

    if (totalValue === 0) {
      return { types: [], diversificationScore: 0 };
    }

    this.investments.forEach(investment => {
      if (!typeGroups[investment.type]) {
        typeGroups[investment.type] = { value: 0, count: 0 };
      }
      typeGroups[investment.type].value += investment.value;
      typeGroups[investment.type].count += 1;
    });

    const types = Object.keys(typeGroups).map(type => ({
      type,
      value: typeGroups[type].value,
      percentage: (typeGroups[type].value / totalValue) * 100,
      count: typeGroups[type].count
    }));

    // Calculate diversification score (higher is better, max 1.0)
    const diversificationScore = types.length > 1 ? 
      1 - types.reduce((sum, type) => sum + Math.pow(type.percentage / 100, 2), 0) : 0;

    return { types, diversificationScore };
  }

  /**
   * Get portfolio risk assessment
   */
  getPortfolioRisk() {
    if (this.investments.length === 0) {
      return { averageRisk: 'none', riskScore: 0, riskDistribution: {} };
    }

    const riskValues = { low: 1, moderate: 2, high: 3, very_high: 4 };
    const riskDistribution = { low: 0, moderate: 0, high: 0, very_high: 0 };
    let totalValue = this.getTotalInvestmentValue();
    let weightedRiskSum = 0;

    this.investments.forEach(investment => {
      const riskLevel = investment.riskLevel || 'moderate';
      const weight = investment.value / totalValue;
      
      riskDistribution[riskLevel] += investment.value;
      weightedRiskSum += riskValues[riskLevel] * weight;
    });

    // Convert distribution to percentages
    Object.keys(riskDistribution).forEach(risk => {
      riskDistribution[risk] = (riskDistribution[risk] / totalValue) * 100;
    });

    // Determine average risk level
    let averageRisk = 'low';
    if (weightedRiskSum >= 3.5) averageRisk = 'very_high';
    else if (weightedRiskSum >= 2.5) averageRisk = 'high';
    else if (weightedRiskSum >= 1.5) averageRisk = 'moderate';

    return { 
      averageRisk, 
      riskScore: weightedRiskSum, 
      riskDistribution 
    };
  }

  /**
   * Calculate expected portfolio return
   */
  getExpectedReturn() {
    if (this.investments.length === 0) {
      return 0;
    }

    const totalValue = this.getTotalInvestmentValue();
    return this.investments.reduce((total, investment) => {
      const expectedReturn = investment.expectedReturn || 0;
      const weight = investment.value / totalValue;
      return total + (expectedReturn * weight);
    }, 0);
  }

  /**
   * Create a new EconomicProfile with updated wealth
   */
  withWealth(newWealth) {
    return this.withUpdates(EconomicProfile, { wealth: newWealth });
  }

  /**
   * Create a new EconomicProfile with updated passive income
   */
  withPassiveIncome(newPassiveIncome) {
    return this.withUpdates(EconomicProfile, { passiveIncome: newPassiveIncome });
  }

  /**
   * Create a new EconomicProfile with an added investment
   */
  withInvestment(investment) {
    const newInvestments = [...this.investments, investment];
    const newHistory = {
      ...this.history,
      totalInvested: this.history.totalInvested + investment.value,
      investmentCount: this.history.investmentCount + 1,
      lastInvestmentDate: new Date()
    };
    
    return this.withUpdates(EconomicProfile, { 
      investments: newInvestments,
      history: newHistory,
      metadata: {
        ...this.metadata,
        lastUpdated: new Date().toISOString()
      }
    });
  }

  /**
   * Create a new EconomicProfile with a removed investment
   */
  withoutInvestment(investmentId) {
    const investmentToRemove = this.investments.find(inv => inv.id === investmentId);
    if (!investmentToRemove) {
      return this; // Investment not found, return same instance
    }

    const newInvestments = this.investments.filter(inv => inv.id !== investmentId);
    const newHistory = {
      ...this.history,
      totalReturns: this.history.totalReturns + investmentToRemove.value, // Assume full value returned
      investmentCount: Math.max(0, this.history.investmentCount - 1)
    };

    return this.withUpdates(EconomicProfile, { 
      investments: newInvestments,
      history: newHistory,
      metadata: {
        ...this.metadata,
        lastUpdated: new Date().toISOString()
      }
    });
  }

  /**
   * Create a new EconomicProfile with updated investment
   */
  withUpdatedInvestment(investmentId, updates) {
    const newInvestments = this.investments.map(investment => 
      investment.id === investmentId ? { ...investment, ...updates } : investment
    );

    return this.withUpdates(EconomicProfile, { 
      investments: newInvestments,
      metadata: {
        ...this.metadata,
        lastUpdated: new Date().toISOString()
      }
    });
  }

  /**
   * Create a new EconomicProfile with updated goals
   */
  withGoals(newGoals) {
    return this.withUpdates(EconomicProfile, { 
      goals: { ...this.goals, ...newGoals },
      metadata: {
        ...this.metadata,
        lastUpdated: new Date().toISOString()
      }
    });
  }

  /**
   * Create a new EconomicProfile with investment returns applied
   */
  withInvestmentReturns(returns) {
    const newWealth = this.wealth + returns;
    const newPassiveIncome = this.passiveIncome + (returns * 0.1); // 10% of returns become passive income
    const newHistory = {
      ...this.history,
      totalReturns: this.history.totalReturns + returns,
      profitLossRatio: this.history.totalInvested > 0 ? 
        ((this.history.totalReturns + returns) / this.history.totalInvested) * 100 : 0
    };

    return this.withUpdates(EconomicProfile, {
      wealth: newWealth,
      passiveIncome: newPassiveIncome,
      history: newHistory,
      metadata: {
        ...this.metadata,
        lastUpdated: new Date().toISOString()
      }
    });
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      wealth: this.wealth,
      passiveIncome: this.passiveIncome,
      investments: this.investments.map(investment => ({
        ...investment,
        maturityDate: investment.maturityDate ? investment.maturityDate.toISOString() : undefined
      })),
      goals: Object.keys(this.goals).reduce((acc, goalType) => {
        acc[goalType] = {
          ...this.goals[goalType],
          deadline: this.goals[goalType].deadline ? this.goals[goalType].deadline.toISOString() : undefined
        };
        return acc;
      }, {}),
      history: {
        ...this.history,
        lastInvestmentDate: this.history.lastInvestmentDate ? this.history.lastInvestmentDate.toISOString() : null
      },
      metadata: { ...this.metadata }
    };
  }

  /**
   * Create EconomicProfile from JSON data
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new SerializationError('deserialize', new Error('Invalid JSON data'), data);
    }

    try {
      const config = {
        wealth: data.wealth,
        passiveIncome: data.passiveIncome,
        investments: data.investments ? data.investments.map(investment => ({
          ...investment,
          maturityDate: investment.maturityDate ? new Date(investment.maturityDate) : undefined
        })) : [],
        goals: data.goals ? Object.keys(data.goals).reduce((acc, goalType) => {
          acc[goalType] = {
            ...data.goals[goalType],
            deadline: data.goals[goalType].deadline ? new Date(data.goals[goalType].deadline) : undefined
          };
          return acc;
        }, {}) : {},
        history: data.history ? {
          ...data.history,
          lastInvestmentDate: data.history.lastInvestmentDate ? new Date(data.history.lastInvestmentDate) : null
        } : undefined,
        metadata: data.metadata
      };

      return new EconomicProfile(config);
    } catch (error) {
      throw new SerializationError('deserialize', error, data);
    }
  }

  /**
   * Create a default EconomicProfile for new characters
   */
  static createDefault() {
    return new EconomicProfile({
      wealth: 0,
      passiveIncome: 0,
      investments: [],
      goals: {},
      history: {
        totalInvested: 0,
        totalReturns: 0,
        investmentCount: 0,
        lastInvestmentDate: null,
        profitLossRatio: 0
      },
      metadata: {
        riskTolerance: 'moderate',
        investmentStrategy: 'balanced',
        creditRating: 'fair',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    });
  }

  /**
   * Create a starter EconomicProfile with some initial wealth
   */
  static createStarter(initialWealth = 100) {
    return new EconomicProfile({
      wealth: initialWealth,
      passiveIncome: 0,
      investments: [],
      goals: {
        wealth_target: {
          target: initialWealth * 10,
          deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      },
      history: {
        totalInvested: 0,
        totalReturns: 0,
        investmentCount: 0,
        lastInvestmentDate: null,
        profitLossRatio: 0
      },
      metadata: {
        riskTolerance: 'moderate',
        investmentStrategy: 'balanced',
        creditRating: 'fair',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    });
  }
}

export default EconomicProfile;
