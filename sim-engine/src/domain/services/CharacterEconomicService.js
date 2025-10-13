// src/domain/services/CharacterEconomicService.js

import BaseDomainService from './BaseDomainService.js';
import EconomicProfile from '../value-objects/EconomicProfile.js';
import { PrerequisiteValidator } from './PrerequisiteValidator.js';

/**
 * CharacterEconomicService - Domain service for managing character economic activities
 * Handles investment creation, validation, income calculation, and economic decisions
 * Extends BaseDomainService for consistent validation and error handling
 */
export default class CharacterEconomicService extends BaseDomainService {
  
  /**
   * Investment type definitions with prerequisites and characteristics
   */
  static INVESTMENT_TYPES = {
    // Basic investments (low barrier to entry)
    savings: {
      id: 'savings',
      name: 'Savings Account',
      description: 'Safe storage of wealth with minimal returns',
      minInvestment: 1,
      maxInvestment: 10000,
      expectedReturn: 0.02, // 2% per turn
      riskLevel: 'low',
      prerequisites: {
        groups: [
          {
            id: 'basic_savings',
            conditions: [
              { type: 'wealth', operator: '>=', value: 1 }
            ]
          }
        ]
      },
      liquidityDays: 1, // Can withdraw anytime
      category: 'financial'
    },

    // Agricultural investments
    farmland: {
      id: 'farmland',
      name: 'Farmland Purchase',
      description: 'Ownership of agricultural land for crop production',
      minInvestment: 100,
      maxInvestment: 5000,
      expectedReturn: 0.15, // 15% per turn
      riskLevel: 'moderate',
      prerequisites: {
        groups: [
          {
            id: 'farmland_purchase',
            conditions: [
              { type: 'wealth', operator: '>=', value: 100 },
              { type: 'skill', skillId: 'agriculture', operator: '>=', value: 10 }
            ]
          }
        ]
      },
      liquidityDays: 30,
      category: 'agriculture',
      settlementEffects: {
        food: { multiplier: 1.1, type: 'production' }
      }
    },

    livestock: {
      id: 'livestock',
      name: 'Livestock Investment',
      description: 'Purchase and breeding of animals for production',
      minInvestment: 50,
      maxInvestment: 2000,
      expectedReturn: 0.20, // 20% per turn
      riskLevel: 'moderate',
      prerequisites: {
        groups: [
          {
            id: 'livestock_investment',
            conditions: [
              { type: 'wealth', operator: '>=', value: 50 },
              { type: 'skill', skillId: 'animal_handling', operator: '>=', value: 5 }
            ]
          }
        ]
      },
      liquidityDays: 15,
      category: 'agriculture',
      settlementEffects: {
        food: { multiplier: 1.05, type: 'production' },
        goods: { multiplier: 1.03, type: 'production' }
      }
    },

    // Crafting and trade investments
    workshop: {
      id: 'workshop',
      name: 'Craft Workshop',
      description: 'Establishment of a specialized crafting facility',
      minInvestment: 200,
      maxInvestment: 3000,
      expectedReturn: 0.25, // 25% per turn
      riskLevel: 'moderate',
      prerequisites: {
        groups: [
          {
            id: 'workshop_creation',
            conditions: [
              { type: 'wealth', operator: '>=', value: 200 },
              { type: 'skill', skillId: 'crafting', operator: '>=', value: 15 }
            ]
          }
        ]
      },
      liquidityDays: 45,
      category: 'crafting',
      settlementEffects: {
        goods: { multiplier: 1.2, type: 'production' },
        services: { multiplier: 1.1, type: 'availability' }
      }
    },

    trade_route: {
      id: 'trade_route',
      name: 'Trade Route Investment',
      description: 'Investment in establishing or improving trade connections',
      minInvestment: 300,
      maxInvestment: 5000,
      expectedReturn: 0.30, // 30% per turn
      riskLevel: 'high',
      prerequisites: {
        groups: [
          {
            id: 'trade_route_investment',
            conditions: [
              { type: 'wealth', operator: '>=', value: 300 },
              { type: 'skill', skillId: 'trading', operator: '>=', value: 20 },
              { type: 'influence', domain: 'economic', operator: '>=', value: 25 }
            ]
          }
        ]
      },
      liquidityDays: 60,
      category: 'trade',
      settlementEffects: {
        goods: { multiplier: 1.15, type: 'availability' },
        services: { multiplier: 1.1, type: 'availability' }
      }
    },

    // Infrastructure investments
    infrastructure: {
      id: 'infrastructure',
      name: 'Infrastructure Project',
      description: 'Investment in settlement infrastructure improvements',
      minInvestment: 500,
      maxInvestment: 10000,
      expectedReturn: 0.12, // 12% per turn (lower return but high impact)
      riskLevel: 'low',
      prerequisites: {
        groups: [
          {
            id: 'infrastructure_investment',
            conditions: [
              { type: 'wealth', operator: '>=', value: 500 },
              { type: 'influence', domain: 'political', operator: '>=', value: 30 },
              { type: 'prestige', track: 'social', operator: '>=', value: 25 }
            ]
          }
        ]
      },
      liquidityDays: 90,
      category: 'infrastructure',
      settlementEffects: {
        shelter: { multiplier: 1.2, type: 'efficiency' },
        water: { multiplier: 1.15, type: 'availability' },
        services: { multiplier: 1.25, type: 'availability' }
      }
    },

    // High-risk, high-reward investments
    mining: {
      id: 'mining',
      name: 'Mining Operation',
      description: 'Investment in mineral extraction operations',
      minInvestment: 400,
      maxInvestment: 8000,
      expectedReturn: 0.40, // 40% per turn
      riskLevel: 'very_high',
      prerequisites: {
        groups: [
          {
            id: 'mining_investment',
            conditions: [
              { type: 'wealth', operator: '>=', value: 400 },
              { type: 'skill', skillId: 'mining', operator: '>=', value: 15 },
              { type: 'risk_tolerance', operator: '>=', value: 'aggressive' }
            ]
          }
        ]
      },
      liquidityDays: 120,
      category: 'mining',
      settlementEffects: {
        goods: { multiplier: 1.3, type: 'production' }
      }
    },

    exploration: {
      id: 'exploration',
      name: 'Exploration Venture',
      description: 'Funding expeditions for discovery of new resources or territories',
      minInvestment: 150,
      maxInvestment: 2000,
      expectedReturn: 0.50, // 50% per turn (very high risk/reward)
      riskLevel: 'very_high',
      prerequisites: {
        groups: [
          {
            id: 'exploration_funding',
            conditions: [
              { type: 'wealth', operator: '>=', value: 150 },
              { type: 'skill', skillId: 'exploration', operator: '>=', value: 10 },
              { type: 'risk_tolerance', operator: '>=', value: 'aggressive' }
            ]
          }
        ]
      },
      liquidityDays: 180,
      category: 'exploration'
    }
  };

  /**
   * Get available investment types for a character
   * @param {Character} character - Character to check investments for
   * @returns {Array} Array of available investment types
   */
  static getAvailableInvestments(character) {
    if (!character || !character.economicProfile) {
      return {
        isValid: false,
        errors: [{ field: 'character', message: 'Character with economic profile required', severity: 'error' }],
        data: []
      };
    }

    const available = [];

    Object.values(this.INVESTMENT_TYPES).forEach(investmentType => {
      const validation = this.validateInvestmentPrerequisites(character, investmentType);
      if (validation.isValid) {
        available.push({
          ...investmentType,
          affordableAmount: this.calculateAffordableAmount(character, investmentType),
          recommendation: this.getInvestmentRecommendation(character, investmentType)
        });
      } else {
        // Store why this investment isn't available
        available.push({
          ...investmentType,
          available: false,
          reasons: validation.errors
        });
      }
    });

    return { isValid: true, errors: [], data: available };
  }

  /**
   * Validate investment prerequisites for a character
   * @param {Character} character - Character to validate for
   * @param {Object} investmentType - Investment type definition
   * @returns {Object} Validation result
   */
  static validateInvestmentPrerequisites(character, investmentType) {
    const errors = [];
    const warnings = [];

    // Use existing PrerequisiteValidator for standard checks
    const standardValidation = PrerequisiteValidator.validatePrerequisites(
      { prerequisites: investmentType.prerequisites }, 
      character
    );

    if (!standardValidation.isValid) {
      errors.push(...standardValidation.errors);
    }

    // Additional economic-specific validations
    if (character.economicProfile) {
      // Check wealth requirement
      if (character.economicProfile.wealth < investmentType.minInvestment) {
        errors.push({
          field: 'wealth',
          message: `Insufficient funds. Need ${investmentType.minInvestment}, have ${character.economicProfile.wealth}`,
          severity: 'error'
        });
      }

      // Check risk tolerance
      if (investmentType.riskLevel === 'very_high' && 
          character.economicProfile.metadata.riskTolerance === 'conservative') {
        warnings.push({
          field: 'riskTolerance',
          message: 'Investment risk level too high for conservative risk tolerance',
          severity: 'warning'
        });
      }

      // Check diversification limits
      const sameTypeInvestments = character.economicProfile.getInvestmentsByType(investmentType.id);
      const totalInvestmentValue = character.economicProfile.getTotalInvestmentValue();
      
      if (sameTypeInvestments.length > 0 && totalInvestmentValue > 0) {
        const concentrationPercent = sameTypeInvestments.reduce((sum, inv) => sum + inv.value, 0) / totalInvestmentValue * 100;
        
        if (concentrationPercent > 50) {
          warnings.push({
            field: 'diversification',
            message: `Over-concentrated in ${investmentType.name} (${concentrationPercent.toFixed(1)}%)`,
            severity: 'warning'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  /**
   * Calculate maximum affordable investment amount
   * @param {Character} character - Character making investment
   * @param {Object} investmentType - Investment type definition
   * @returns {number} Maximum affordable amount
   */
  static calculateAffordableAmount(character, investmentType) {
    if (!character.economicProfile) return 0;

    const availableWealth = character.economicProfile.wealth;
    const maxByWealth = Math.floor(availableWealth * 0.8); // Don't invest more than 80% of wealth
    const maxByType = investmentType.maxInvestment;

    return Math.min(maxByWealth, maxByType);
  }

  /**
   * Get investment recommendation for character
   * @param {Character} character - Character to recommend for
   * @param {Object} investmentType - Investment type to evaluate
   * @returns {Object} Recommendation object
   */
  static getInvestmentRecommendation(character, investmentType) {
    if (!character.economicProfile) {
      return { score: 0, reason: 'No economic profile' };
    }

    let score = 50; // Base score
    const reasons = [];

    // Adjust based on risk tolerance match
    const characterRisk = character.economicProfile.metadata.riskTolerance;
    const riskCompatibility = this._calculateRiskCompatibility(characterRisk, investmentType.riskLevel);
    score += riskCompatibility * 20;
    
    if (riskCompatibility > 0.5) {
      reasons.push('Good risk tolerance match');
    } else if (riskCompatibility < -0.5) {
      reasons.push('Risk tolerance mismatch');
    }

    // Adjust based on strategy match
    const strategyBonus = this._calculateStrategyBonus(character.economicProfile.metadata.investmentStrategy, investmentType);
    score += strategyBonus;
    
    if (strategyBonus > 0) {
      reasons.push('Aligns with investment strategy');
    }

    // Adjust based on diversification
    const portfolio = character.economicProfile.getPortfolioDiversification();
    const typeConcentration = portfolio.types.find(t => t.type === investmentType.id);
    
    if (typeConcentration && typeConcentration.percentage > 30) {
      score -= 15;
      reasons.push('Already concentrated in this type');
    } else if (!typeConcentration && portfolio.types.length > 0) {
      score += 10;
      reasons.push('Improves diversification');
    }

    // Adjust based on goals
    const goalAlignment = this._checkGoalAlignment(character.economicProfile.goals, investmentType);
    score += goalAlignment;
    
    if (goalAlignment > 0) {
      reasons.push('Supports economic goals');
    }

    return {
      score: this.clamp(score, 0, 100),
      reason: reasons.join(', ') || 'Standard investment option',
      recommendation: score >= 70 ? 'highly_recommended' : 
                    score >= 50 ? 'recommended' : 
                    score >= 30 ? 'consider' : 'not_recommended'
    };
  }

  /**
   * Create a new investment for a character
   * @param {Character} character - Character making the investment
   * @param {string} investmentTypeId - Type of investment
   * @param {number} amount - Investment amount
   * @param {Object} options - Additional investment options
   * @returns {Object} Result with new character instance and investment details
   */
  static createInvestment(character, investmentTypeId, amount, options = {}) {
    // Validate inputs
    const validation = this.validateRequired('character', character);
    if (validation) {
      return this.createInvalidResult([validation]);
    }

    const investmentType = this.INVESTMENT_TYPES[investmentTypeId];
    if (!investmentType) {
      return this.createInvalidResult([{
        field: 'investmentTypeId',
        message: `Unknown investment type: ${investmentTypeId}`,
        severity: 'error'
      }]);
    }

    const amountValidation = this.validateRange('amount', amount, investmentType.minInvestment, investmentType.maxInvestment);
    if (amountValidation) {
      return this.createInvalidResult([amountValidation]);
    }

    // Validate prerequisites
    const prerequisiteValidation = this.validateInvestmentPrerequisites(character, investmentType);
    if (!prerequisiteValidation.isValid) {
      return this.createInvalidResult(prerequisiteValidation.errors);
    }

    // Check if character has enough wealth
    if (!character.economicProfile || character.economicProfile.wealth < amount) {
      return this.createInvalidResult([{
        field: 'wealth',
        message: `Insufficient funds. Need ${amount}, have ${character.economicProfile?.wealth || 0}`,
        severity: 'error'
      }]);
    }

    try {
      // Create investment object
      const investment = {
        id: this.generateId(),
        type: investmentTypeId,
        name: investmentType.name,
        description: options.description || investmentType.description,
        value: amount,
        expectedReturn: investmentType.expectedReturn,
        riskLevel: investmentType.riskLevel,
        category: investmentType.category,
        createdAt: new Date(),
        maturityDate: options.maturityDate || new Date(Date.now() + (investmentType.liquidityDays * 24 * 60 * 60 * 1000)),
        settlementEffects: investmentType.settlementEffects || {},
        metadata: {
          ...options.metadata,
          liquidityDays: investmentType.liquidityDays
        }
      };

      // Update character's economic profile
      const newEconomicProfile = character.economicProfile
        .withInvestment(investment)
        .withWealth(character.economicProfile.wealth - amount);

      // Create new character with updated economic profile
      const newCharacter = new character.constructor({
        ...character.toJSON(),
        economicProfile: newEconomicProfile
      });

      return {
        isValid: true,
        errors: [],
        warnings: [],
        data: {
          character: newCharacter,
          investment,
          costPaid: amount,
          newWealth: newEconomicProfile.wealth,
          portfolioValue: newEconomicProfile.getTotalValue()
        }
      };

    } catch (error) {
      return this.createInvalidResult([{
        field: 'investment',
        message: `Failed to create investment: ${error.message}`,
        severity: 'error'
      }]);
    }
  }

  /**
   * Process investment returns for a character
   * @param {Character} character - Character to process returns for
   * @param {Object} marketConditions - Current market conditions affecting returns
   * @returns {Object} Result with updated character and return details
   */
  static processInvestmentReturns(character, marketConditions = {}) {
    if (!character.economicProfile || character.economicProfile.investments.length === 0) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        data: {
          character,
          totalReturns: 0,
          investmentResults: []
        }
      };
    }

    try {
      let totalReturns = 0;
      const investmentResults = [];

      // Process each investment
      character.economicProfile.investments.forEach(investment => {
        const investmentType = this.INVESTMENT_TYPES[investment.type];
        if (!investmentType) return;

        // Calculate base return
        let returnAmount = investment.value * investment.expectedReturn;

        // Apply market conditions
        const marketMultiplier = this._calculateMarketMultiplier(investment, marketConditions);
        returnAmount *= marketMultiplier;

        // Apply random variation based on risk level
        const volatility = this._getRiskVolatility(investment.riskLevel);
        const variationMultiplier = 1 + (Math.random() - 0.5) * volatility;
        returnAmount *= variationMultiplier;

        // Ensure non-negative returns (can lose money on high-risk investments)
        returnAmount = Math.max(-investment.value * 0.5, returnAmount); // Max 50% loss

        totalReturns += returnAmount;
        investmentResults.push({
          investmentId: investment.id,
          baseReturn: investment.value * investment.expectedReturn,
          marketAdjustedReturn: returnAmount,
          marketMultiplier,
          variationMultiplier,
          profitLoss: returnAmount > 0 ? 'profit' : 'loss'
        });
      });

      // Apply returns to character
      const newEconomicProfile = character.economicProfile.withInvestmentReturns(totalReturns);
      const newCharacter = new character.constructor({
        ...character.toJSON(),
        economicProfile: newEconomicProfile
      });

      return {
        isValid: true,
        errors: [],
        warnings: [],
        data: {
          character: newCharacter,
          totalReturns,
          investmentResults,
          newWealth: newEconomicProfile.wealth,
          newPassiveIncome: newEconomicProfile.passiveIncome
        }
      };

    } catch (error) {
      return this.createInvalidResult([{
        field: 'returns',
        message: `Failed to process investment returns: ${error.message}`,
        severity: 'error'
      }]);
    }
  }

  /**
   * Liquidate an investment
   * @param {Character} character - Character liquidating investment
   * @param {string} investmentId - ID of investment to liquidate
   * @param {boolean} emergencyLiquidation - Whether this is an emergency (affects returns)
   * @returns {Object} Result with updated character and liquidation details
   */
  static liquidateInvestment(character, investmentId, emergencyLiquidation = false) {
    if (!character.economicProfile) {
      return this.createInvalidResult([{
        field: 'character',
        message: 'Character must have economic profile',
        severity: 'error'
      }]);
    }

    const investment = character.economicProfile.investments.find(inv => inv.id === investmentId);
    if (!investment) {
      return this.createInvalidResult([{
        field: 'investmentId',
        message: 'Investment not found',
        severity: 'error'
      }]);
    }

    try {
      // Calculate liquidation value
      let liquidationValue = investment.value;

      // Apply early liquidation penalty if applicable (only if investment has matured but is being liquidated early)
      const daysToMaturity = Math.max(0, (investment.maturityDate - new Date()) / (24 * 60 * 60 * 1000));
      const liquidityDays = investment.metadata.liquidityDays || 0;
      
      // Only apply penalty if it's before maturity AND beyond the liquidity period
      if (daysToMaturity > liquidityDays && !emergencyLiquidation) {
        const penaltyRate = Math.min(0.2, (daysToMaturity - liquidityDays) / 365 * 0.1); // Max 20% penalty
        liquidationValue *= (1 - penaltyRate);
      }

      // Emergency liquidation penalty (additional)
      if (emergencyLiquidation) {
        liquidationValue *= 0.8; // 20% emergency penalty
      }

      // Update economic profile
      const newEconomicProfile = character.economicProfile
        .withoutInvestment(investmentId)
        .withWealth(character.economicProfile.wealth + liquidationValue);

      const newCharacter = new character.constructor({
        ...character.toJSON(),
        economicProfile: newEconomicProfile
      });

      return {
        isValid: true,
        errors: [],
        warnings: emergencyLiquidation ? ['Emergency liquidation incurred penalty'] : [],
        data: {
          character: newCharacter,
          liquidationValue,
          originalValue: investment.value,
          penalty: investment.value - liquidationValue,
          isEmergency: emergencyLiquidation
        }
      };

    } catch (error) {
      return this.createInvalidResult([{
        field: 'liquidation',
        message: `Failed to liquidate investment: ${error.message}`,
        severity: 'error'
      }]);
    }
  }

  /**
   * Get economic portfolio analysis for a character
   * @param {Character} character - Character to analyze
   * @returns {Object} Detailed portfolio analysis
   */
  static analyzePortfolio(character) {
    if (!character.economicProfile) {
      return {
        isValid: false,
        errors: [{ field: 'character', message: 'Character must have economic profile', severity: 'error' }],
        data: null
      };
    }

    const profile = character.economicProfile;
    const diversification = profile.getPortfolioDiversification();
    const risk = profile.getPortfolioRisk();
    const expectedReturn = profile.getExpectedReturn();

    const analysis = {
      totalValue: profile.getTotalValue(),
      liquidWealth: profile.wealth,
      investmentValue: profile.getTotalInvestmentValue(),
      passiveIncome: profile.passiveIncome,
      diversification,
      risk,
      expectedReturn,
      investmentCount: profile.investments.length,
      performance: {
        totalInvested: profile.history.totalInvested,
        totalReturns: profile.history.totalReturns,
        profitLossRatio: profile.history.profitLossRatio,
        investmentCount: profile.history.investmentCount
      },
      recommendations: this._generatePortfolioRecommendations(profile)
    };

    return {
      isValid: true,
      errors: [],
      warnings: [],
      data: analysis
    };
  }

  /**
   * Private helper methods
   */

  /**
   * Calculate risk compatibility score
   */
  static _calculateRiskCompatibility(characterRisk, investmentRisk) {
    const riskLevels = { conservative: 0, moderate: 1, aggressive: 2 };
    const investmentRiskLevels = { low: 0, moderate: 1, high: 1.5, very_high: 2 };

    const characterLevel = riskLevels[characterRisk] || 1;
    const investmentLevel = investmentRiskLevels[investmentRisk] || 1;

    // Return compatibility score between -1 and 1
    const difference = Math.abs(characterLevel - investmentLevel);
    return Math.max(-1, 1 - difference);
  }

  /**
   * Calculate strategy bonus for investment
   */
  static _calculateStrategyBonus(strategy, investmentType) {
    const strategyBonuses = {
      growth: { farmland: 10, workshop: 15, mining: 20, exploration: 25 },
      income: { savings: 20, farmland: 15, livestock: 10, infrastructure: 15 },
      balanced: { farmland: 10, workshop: 10, trade_route: 10, infrastructure: 10 },
      speculative: { mining: 20, exploration: 30, trade_route: 15 }
    };

    return strategyBonuses[strategy]?.[investmentType.id] || 0;
  }

  /**
   * Check goal alignment with investment
   */
  static _checkGoalAlignment(goals, investmentType) {
    let bonus = 0;

    if (goals.wealth_target && investmentType.expectedReturn > 0.2) {
      bonus += 10; // High return investments help wealth goals
    }

    if (goals.passive_income_target && ['savings', 'farmland', 'infrastructure'].includes(investmentType.id)) {
      bonus += 15; // These investments provide steady income
    }

    if (goals.investment_diversification && investmentType.category) {
      bonus += 5; // Any investment helps diversification
    }

    return bonus;
  }

  /**
   * Calculate market multiplier for investment returns
   */
  static _calculateMarketMultiplier(investment, marketConditions) {
    let multiplier = 1;

    // Apply category-specific market conditions
    const categoryCondition = marketConditions[investment.category];
    if (categoryCondition) {
      multiplier *= (1 + categoryCondition); // categoryCondition should be between -0.5 and 1.0
    }

    // Apply general economic conditions
    if (marketConditions.general) {
      multiplier *= (1 + marketConditions.general);
    }

    return Math.max(0.1, multiplier); // Minimum 10% of expected returns
  }

  /**
   * Get volatility multiplier based on risk level
   */
  static _getRiskVolatility(riskLevel) {
    const volatilities = {
      low: 0.1,      // ±10% variation
      moderate: 0.25, // ±25% variation
      high: 0.5,     // ±50% variation
      very_high: 1.0  // ±100% variation
    };

    return volatilities[riskLevel] || 0.25;
  }

  /**
   * Generate portfolio recommendations
   */
  static _generatePortfolioRecommendations(profile) {
    const recommendations = [];
    const diversification = profile.getPortfolioDiversification();
    const risk = profile.getPortfolioRisk();

    // Diversification recommendations
    if (diversification.diversificationScore < 0.3 && profile.investments.length > 1) {
      recommendations.push({
        type: 'diversification',
        priority: 'high',
        message: 'Portfolio is poorly diversified. Consider spreading investments across different categories.'
      });
    }

    // Risk recommendations
    if (risk.averageRisk !== profile.metadata.riskTolerance) {
      recommendations.push({
        type: 'risk_alignment',
        priority: 'medium',
        message: `Portfolio risk (${risk.averageRisk}) doesn't match your risk tolerance (${profile.metadata.riskTolerance}).`
      });
    }

    // Goal-based recommendations
    Object.keys(profile.goals).forEach(goalType => {
      const goal = profile.goals[goalType];
      if (goalType === 'wealth_target' && goal.target > profile.getTotalValue() * 2) {
        recommendations.push({
          type: 'goal_achievement',
          priority: 'medium',
          message: 'Consider higher-return investments to reach your wealth target faster.'
        });
      }
    });

    return recommendations;
  }

  /**
   * Create a default economic profile for a new character
   * @param {number} initialWealth - Starting wealth amount
   * @returns {EconomicProfile} New economic profile instance
   */
  static createDefaultEconomicProfile(initialWealth = 0) {
    if (initialWealth > 0) {
      return EconomicProfile.createStarter(initialWealth);
    }
    return EconomicProfile.createDefault();
  }

  /**
   * Calculate settlement-level investment effects
   * @param {Array} characterInvestments - All character investments in settlement
   * @param {Object} settlement - Settlement object
   * @returns {Object} Aggregated investment effects
   */
  static calculateSettlementInvestmentEffects(characterInvestments, settlement) {
    const effects = {
      food: { production: 1, efficiency: 1, availability: 1 },
      water: { production: 1, efficiency: 1, availability: 1 },
      shelter: { production: 1, efficiency: 1, availability: 1 },
      goods: { production: 1, efficiency: 1, availability: 1 },
      services: { production: 1, efficiency: 1, availability: 1 }
    };

    characterInvestments.forEach(investment => {
      const investmentType = this.INVESTMENT_TYPES[investment.type];
      if (investmentType?.settlementEffects) {
        Object.keys(investmentType.settlementEffects).forEach(needType => {
          const effect = investmentType.settlementEffects[needType];
          if (effects[needType] && effects[needType][effect.type]) {
            // Scale effect by investment size relative to settlement population
            const scaleFactor = Math.min(1, investment.value / (settlement.population?.total || 100));
            const scaledMultiplier = 1 + (effect.multiplier - 1) * scaleFactor;
            effects[needType][effect.type] *= scaledMultiplier;
          }
        });
      }
    });

    return effects;
  }

  /**
   * Check if economic service is available (graceful degradation check)
   * @returns {boolean} True if economic service is functional
   */
  static isEconomicServiceAvailable() {
    // Simple availability check - could be expanded to check dependencies
    return true;
  }

  /**
   * Safely get available investments with fallback for missing economic data
   * @param {Object} character - Character object
   * @returns {Array} Array of available investment types (fallback to basic if no data)
   */
  static safeGetAvailableInvestments(character) {
    try {
      if (!character) {
        console.warn('CharacterEconomicService: No character provided for available investments');
        return this._getBasicFallbackInvestments();
      }

      // Try to use existing method
      const result = this.getAvailableInvestments(character);
      if (result && result.data) {
        return result.data;
      }

      // Fallback to basic investments
      console.warn('CharacterEconomicService: Existing method failed, using fallback');
      return this._getBasicFallbackInvestments();
    } catch (error) {
      console.warn('CharacterEconomicService: Error getting available investments, using fallback:', error);
      return this._getBasicFallbackInvestments();
    }
  }

  /**
   * Safely analyze portfolio with fallback for missing data
   * @param {Object} character - Character object
   * @returns {Object} Portfolio analysis (fallback object if no data)
   */
  static safeAnalyzePortfolio(character) {
    try {
      if (!character) {
        console.warn('CharacterEconomicService: No character provided for portfolio analysis');
        return this._getEmptyPortfolioAnalysis();
      }

      // Try to use existing method
      const result = this.analyzePortfolio(character);
      if (result && result.data) {
        return result.data;
      }

      // Fallback analysis
      console.warn('CharacterEconomicService: Existing analysis failed, using fallback');
      return this._getEmptyPortfolioAnalysis();
    } catch (error) {
      console.warn('CharacterEconomicService: Error analyzing portfolio, using fallback:', error);
      return this._getEmptyPortfolioAnalysis();
    }
  }

  /**
   * Safely calculate affordable amount with fallback
   * @param {Object} character - Character object
   * @param {string} investmentType - Type of investment
   * @returns {number} Affordable amount (0 if no data)
   */
  static safeCalculateAffordableAmount(character, investmentType) {
    try {
      if (!character) {
        console.warn('CharacterEconomicService: No character provided for affordable amount calculation');
        return 0;
      }

      // Try to use existing method
      const result = this.calculateAffordableAmount(character, investmentType);
      if (typeof result === 'number' && result >= 0) {
        return result;
      }

      // Fallback calculation
      console.warn('CharacterEconomicService: Existing calculation failed, using fallback');
      return this._calculateFallbackAffordableAmount(character, investmentType);
    } catch (error) {
      console.warn('CharacterEconomicService: Error calculating affordable amount, using fallback:', error);
      return this._calculateFallbackAffordableAmount(character, investmentType);
    }
  }

  /**
   * Safely create investment with comprehensive error handling
   * @param {Object} character - Character object
   * @param {string} investmentType - Type of investment
   * @param {number} amount - Investment amount
   * @returns {Object} Investment result or error object
   */
  static safeCreateInvestment(character, investmentType, amount) {
    try {
      if (!character) {
        return {
          success: false,
          error: 'No character provided',
          message: 'Cannot create investment without character data'
        };
      }

      // Try to use existing method
      const result = this.createInvestment(character, investmentType, amount);
      if (result && result.isValid !== false) {
        return result;
      }

      // Fallback creation logic
      console.warn('CharacterEconomicService: Existing creation failed, using fallback');
      return this._createFallbackInvestment(character, investmentType, amount);
    } catch (error) {
      console.warn('CharacterEconomicService: Error creating investment, using fallback:', error);
      return this._createFallbackInvestment(character, investmentType, amount);
    }
  }

  /**
   * Safely liquidate investment with error handling
   * @param {Object} character - Character object
   * @param {string} investmentId - Investment ID
   * @returns {Object} Liquidation result or error object
   */
  static safeLiquidateInvestment(character, investmentId) {
    try {
      if (!character) {
        return {
          success: false,
          error: 'No character provided',
          message: 'Cannot liquidate investment without character data'
        };
      }

      // Try to use existing method
      const result = this.liquidateInvestment(character, investmentId);
      if (result && result.isValid !== false) {
        return result;
      }

      // Fallback liquidation logic
      console.warn('CharacterEconomicService: Existing liquidation failed, using fallback');
      return this._liquidateFallbackInvestment(character, investmentId);
    } catch (error) {
      console.warn('CharacterEconomicService: Error liquidating investment, using fallback:', error);
      return this._liquidateFallbackInvestment(character, investmentId);
    }
  }

  /**
   * Get basic fallback investments when economic data is missing
   * @returns {Array} Basic investment types
   * @private
   */
  static _getBasicFallbackInvestments() {
    return [
      this.INVESTMENT_TYPES.savings
    ].filter(Boolean);
  }

  /**
   * Get empty portfolio analysis for fallback
   * @returns {Object} Empty portfolio analysis
   * @private
   */
  static _getEmptyPortfolioAnalysis() {
    return {
      totalValue: 0,
      totalReturn: 0,
      investments: [],
      recommendations: ['Consider basic savings account for wealth preservation']
    };
  }

  /**
   * Calculate fallback affordable amount
   * @param {Object} character - Character object
   * @param {string} investmentType - Type of investment
   * @returns {number} Affordable amount
   * @private
   */
  static _calculateFallbackAffordableAmount(character, investmentType) {
    const investment = this.INVESTMENT_TYPES[investmentType];
    if (!investment) return 0;

    const wealth = character.wealth || 0;
    return Math.min(
      investment.maxInvestment,
      Math.max(investment.minInvestment, wealth * 0.1) // 10% of wealth
    );
  }

  /**
   * Create fallback investment
   * @param {Object} character - Character object
   * @param {string} investmentType - Type of investment
   * @param {number} amount - Investment amount
   * @returns {Object} Investment result
   * @private
   */
  static _createFallbackInvestment(character, investmentType, amount) {
    const investment = this.INVESTMENT_TYPES[investmentType];
    if (!investment) {
      return {
        success: false,
        error: 'Invalid investment type',
        message: `Unknown investment type: ${investmentType}`
      };
    }

    if (!character.wealth || character.wealth < amount) {
      return {
        success: false,
        error: 'Insufficient funds',
        message: 'Character does not have enough wealth for this investment'
      };
    }

    // Create basic investment record
    const newInvestment = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: investmentType,
      amount: amount,
      purchaseDate: new Date(),
      expectedReturn: investment.expectedReturn,
      riskLevel: investment.riskLevel
    };

    // Update character
    if (!character.investments) {
      character.investments = [];
    }
    character.investments.push(newInvestment);
    character.wealth -= amount;

    return {
      success: true,
      investment: newInvestment,
      newWealth: character.wealth,
      message: `Successfully created ${investment.name} investment`
    };
  }

  /**
   * Liquidate fallback investment
   * @param {Object} character - Character object
   * @param {string} investmentId - Investment ID
   * @returns {Object} Liquidation result
   * @private
   */
  static _liquidateFallbackInvestment(character, investmentId) {
    if (!character.investments) {
      return {
        success: false,
        error: 'No investments found',
        message: 'Character has no investments to liquidate'
      };
    }

    const investment = character.investments.find(inv => inv.id === investmentId);
    if (!investment) {
      return {
        success: false,
        error: 'Investment not found',
        message: `Investment with ID ${investmentId} not found`
      };
    }

    // Calculate liquidation value (95% of amount)
    const liquidationValue = investment.amount * 0.95;

    // Update character
    character.investments = character.investments.filter(inv => inv.id !== investmentId);
    character.wealth = (character.wealth || 0) + liquidationValue;

    return {
      success: true,
      liquidationValue: liquidationValue,
      newWealth: character.wealth,
      message: `Successfully liquidated ${investment.type} investment`
    };
  }
}
