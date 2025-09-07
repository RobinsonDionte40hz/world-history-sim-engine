# Design Document

## Overview

The Need Satisfaction Cascades feature introduces a sophisticated economic and social dynamics system that models how settlements manage basic needs (food, water, shelter, goods, services) and experience cascading consequences when these needs are unmet. This system integrates with the existing Settlement entity and simulation architecture to create realistic population dynamics that drive historical events and character behaviors.

## Architecture

### Domain Layer Integration

The Need Satisfaction Cascades system follows the existing Clean Architecture pattern and integrates with current domain entities:

#### New Domain Service: BasicNeedsService
- **Location**: `src/domain/services/BasicNeedsService.js`
- **Purpose**: Core business logic for calculating need satisfaction levels and cascading effects
- **Dependencies**: Settlement entity, existing domain services

#### Enhanced Settlement Entity
- **Location**: `src/domain/entities/Settlement.js` (existing)
- **Enhancement**: Add need satisfaction tracking to existing resources structure
- **Integration**: Leverage existing population, resources, and buildings properties

#### New Domain Service: NeedConsequenceService
- **Location**: `src/domain/services/NeedConsequenceService.js`
- **Purpose**: Generate consequences and historical events from need satisfaction changes
- **Dependencies**: HistoryGenerator, Settlement entity

### Application Layer Integration

#### Enhanced SimulationService
- **Location**: `src/application/services/SimulationService.js` (existing)
- **Enhancement**: Integrate need satisfaction calculations into turn processing
- **Integration**: Call BasicNeedsService during settlement updates

#### New Application Service: SettlementEconomyService
- **Location**: `src/application/services/SettlementEconomyService.js`
- **Purpose**: Orchestrate need satisfaction calculations across multiple settlements
- **Dependencies**: BasicNeedsService, NeedConsequenceService

#### New Domain Service: CharacterEconomicService
- **Location**: `src/domain/services/CharacterEconomicService.js`
- **Purpose**: Manage character investments, passive income, and economic activities
- **Dependencies**: Character entity, Settlement entity, BasicNeedsService, PrerequisiteValidator
- **Pattern**: Extends BaseDomainService following existing service patterns

#### New Value Object: EconomicProfile
- **Location**: `src/domain/value-objects/EconomicProfile.js`
- **Purpose**: Immutable value object for character economic state (wealth, investments, goals)
- **Pattern**: Follows existing immutable value object pattern with withChange() methods
- **Integration**: Integrated into Character entity following existing value object patterns

#### Enhanced Character Entity
- **Location**: `src/domain/entities/Character.js` (existing)
- **Enhancement**: Add EconomicProfile value object and investment assignment tracking
- **Integration**: Extends existing assignment system with investment assignment types

## Components and Interfaces

### BasicNeedsService Interface

```javascript
class BasicNeedsService extends BaseDomainService {
  /**
   * Calculate satisfaction levels for all basic needs
   * @param {Settlement} settlement - Settlement to analyze
   * @returns {Object} Need satisfaction analysis
   */
  calculateSatisfactionLevel(settlement) {
    const needs = {
      food: this.calculateFoodSatisfaction(settlement),
      water: this.calculateWaterSatisfaction(settlement),
      shelter: this.calculateShelterSatisfaction(settlement),
      goods: this.calculateGoodsSatisfaction(settlement),
      services: this.calculateServicesSatisfaction(settlement)
    };

    const overallSatisfaction = this.calculateCascadingEffects(needs);

    return {
      needs,
      overall: overallSatisfaction,
      consequences: this.generateConsequences(needs, settlement)
    };
  }

  /**
   * Apply cascading effects where unmet basic needs amplify other problems
   * @param {Object} needs - Individual need satisfaction levels
   * @returns {number} Overall satisfaction after cascading effects
   */
  calculateCascadingEffects(needs) {
    let multiplier = 1.0;

    // Critical needs create cascading problems
    if (needs.food < 0.8) multiplier *= 0.7;
    if (needs.water < 0.9) multiplier *= 0.6;
    if (needs.shelter < 0.6) multiplier *= 0.8;

    // Apply multiplier to secondary needs
    needs.goods *= multiplier;
    needs.services *= multiplier;

    return (needs.food + needs.water + needs.shelter + needs.goods + needs.services) / 5;
  }

  /**
   * Calculate food satisfaction based on settlement resources and infrastructure
   * @param {Settlement} settlement - Settlement to analyze
   * @returns {number} Food satisfaction level (0.0 - 1.0)
   */
  calculateFoodSatisfaction(settlement) {
    const population = settlement.population.total;
    const foodProduction = this._calculateFoodProduction(settlement);
    const foodStorage = this._calculateFoodStorage(settlement);
    const tradeAccess = this._calculateFoodTradeAccess(settlement);

    const totalFoodAvailability = foodProduction + foodStorage + tradeAccess;
    const foodDemand = population * this._getFoodConsumptionRate();

    return Math.min(1.0, totalFoodAvailability / foodDemand);
  }

  /**
   * Calculate water satisfaction based on water sources and infrastructure
   * @param {Settlement} settlement - Settlement to analyze
   * @returns {number} Water satisfaction level (0.0 - 1.0)
   */
  calculateWaterSatisfaction(settlement) {
    const population = settlement.population.total;
    const waterSources = this._calculateWaterSources(settlement);
    const waterInfrastructure = this._calculateWaterInfrastructure(settlement);
    const waterStorage = this._calculateWaterStorage(settlement);

    const totalWaterAvailability = waterSources + waterInfrastructure + waterStorage;
    const waterDemand = population * this._getWaterConsumptionRate();

    return Math.min(1.0, totalWaterAvailability / waterDemand);
  }

  /**
   * Calculate shelter satisfaction based on housing and population density
   * @param {Settlement} settlement - Settlement to analyze
   * @returns {number} Shelter satisfaction level (0.0 - 1.0)
   */
  calculateShelterSatisfaction(settlement) {
    const population = settlement.population.total;
    const housingCapacity = this._calculateHousingCapacity(settlement);
    const housingQuality = this._calculateHousingQuality(settlement);

    const basicShelterRatio = Math.min(1.0, housingCapacity / population);
    const qualityModifier = housingQuality;

    return basicShelterRatio * qualityModifier;
  }

  /**
   * Calculate goods satisfaction based on production and trade
   * @param {Settlement} settlement - Settlement to analyze
   * @returns {number} Goods satisfaction level (0.0 - 1.0)
   */
  calculateGoodsSatisfaction(settlement) {
    const population = settlement.population.total;
    const localProduction = this._calculateGoodsProduction(settlement);
    const tradeAccess = this._calculateGoodsTradeAccess(settlement);
    const marketEfficiency = this._calculateMarketEfficiency(settlement);

    const totalGoodsAvailability = (localProduction + tradeAccess) * marketEfficiency;
    const goodsDemand = population * this._getGoodsConsumptionRate();

    return Math.min(1.0, totalGoodsAvailability / goodsDemand);
  }

  /**
   * Calculate services satisfaction based on available services and infrastructure
   * @param {Settlement} settlement - Settlement to analyze
   * @returns {number} Services satisfaction level (0.0 - 1.0)
   */
  calculateServicesSatisfaction(settlement) {
    const population = settlement.population.total;
    const healthcareCapacity = this._calculateHealthcareCapacity(settlement);
    const educationCapacity = this._calculateEducationCapacity(settlement);
    const religiousCapacity = this._calculateReligiousCapacity(settlement);
    const administrativeCapacity = this._calculateAdministrativeCapacity(settlement);

    const totalServiceCapacity = healthcareCapacity + educationCapacity + 
                                religiousCapacity + administrativeCapacity;
    const serviceDemand = population * this._getServicesConsumptionRate();

    return Math.min(1.0, totalServiceCapacity / serviceDemand);
  }
}
```

### CharacterEconomicService Interface

```javascript
class CharacterEconomicService extends BaseDomainService {
  constructor(basicNeedsService, prerequisiteValidator) {
    super();
    this.basicNeedsService = basicNeedsService;
    this.prerequisiteValidator = prerequisiteValidator;
  }

  /**
   * Calculate available investment opportunities for a character
   * @param {Character} character - Character seeking investment opportunities
   * @param {Object} settlement - Settlement where character is located
   * @returns {Array} Array of available investment opportunities
   */
  getInvestmentOpportunities(character, settlement) {
    this._validateCharacter(character);
    this._validateSettlement(settlement);
    
    const opportunities = [];
    const economicProfile = character.economicProfile;
    const currentWealth = economicProfile.getWealth();
    
    // Get all available investment types from system
    const investmentTypes = this._getAvailableInvestmentTypes();
    
    for (const investmentType of investmentTypes) {
      // Check if character meets prerequisites
      if (this.prerequisiteValidator.validatePrerequisites(investmentType, character.getStateForValidation())) {
        // Check if character has sufficient wealth
        if (currentWealth >= investmentType.cost) {
          // Check if settlement can support this investment
          if (this._canSettlementSupportInvestment(investmentType, settlement)) {
            opportunities.push(this._createInvestmentOpportunity(investmentType, character, settlement));
          }
        }
      }
    }
    
    return opportunities;
  }

  /**
   * Execute an investment for a character
   * @param {Character} character - Character making the investment
   * @param {string} investmentTypeId - ID of the investment type
   * @param {Object} settlement - Settlement where investment occurs
   * @returns {Object} Investment result with effects applied
   */
  executeInvestment(character, investmentTypeId, settlement) {
    this._validateCharacter(character);
    this._validateSettlement(settlement);
    
    const investmentType = this._getInvestmentType(investmentTypeId);
    if (!investmentType) {
      throw new Error(`Investment type '${investmentTypeId}' not found`);
    }

    // Validate prerequisites
    const validationResult = this.prerequisiteValidator.validatePrerequisites(investmentType, character.getStateForValidation());
    if (!validationResult.isValid) {
      throw new Error(`Character does not meet prerequisites: ${validationResult.errors.join(', ')}`);
    }

    const economicProfile = character.economicProfile;
    if (economicProfile.getWealth() < investmentType.cost) {
      throw new Error('Insufficient wealth for investment');
    }

    // Create investment record
    const investment = this._createInvestmentRecord(investmentType, character, settlement);
    
    // Update character's economic profile using immutable pattern
    const updatedEconomicProfile = economicProfile.withInvestment(investment);
    character.economicProfile = updatedEconomicProfile;

    // Add investment as assignment
    character.assignments.investments.add(investment.id);

    // Apply immediate effects to settlement
    this._applyInvestmentEffects(investment, settlement);

    return {
      investment,
      newEconomicProfile: updatedEconomicProfile,
      effects: investment.effects
    };
  }

  /**
   * Calculate passive income for all character investments
   * @param {Character} character - Character to calculate passive income for
   * @param {Object} settlement - Settlement where character is located
   * @returns {number} Total passive income for this turn
   */
  calculatePassiveIncome(character, settlement) {
    this._validateCharacter(character);
    this._validateSettlement(settlement);
    
    const economicProfile = character.economicProfile;
    const investments = economicProfile.getActiveInvestments();
    
    if (investments.length === 0) {
      return 0;
    }

    let totalIncome = 0;
    const needSatisfaction = this.basicNeedsService.calculateSatisfactionLevel(settlement);

    investments.forEach(investment => {
      const income = this._calculateInvestmentIncome(investment, needSatisfaction);
      totalIncome += income;
    });

    return Math.round(totalIncome);
  }

  /**
   * Update character economy during turn processing
   * @param {Character} character - Character to update
   * @param {Object} settlement - Settlement where character is located
   * @returns {Object} Update result with new economic state
   */
  updateCharacterEconomy(character, settlement) {
    this._validateCharacter(character);
    this._validateSettlement(settlement);
    
    const passiveIncome = this.calculatePassiveIncome(character, settlement);
    const economicProfile = character.economicProfile;
    
    // Update economic profile with passive income using immutable pattern
    const updatedEconomicProfile = economicProfile.withPassiveIncome(passiveIncome);
    character.economicProfile = updatedEconomicProfile;

    // Update investment performance tracking
    const updatedInvestments = this._updateInvestmentPerformance(character, settlement);
    const finalEconomicProfile = updatedEconomicProfile.withUpdatedInvestments(updatedInvestments);
    character.economicProfile = finalEconomicProfile;

    return {
      passiveIncome,
      newEconomicProfile: finalEconomicProfile,
      investmentCount: finalEconomicProfile.getActiveInvestments().length
    };
  }

  /**
   * Validate character for economic operations
   * @private
   */
  _validateCharacter(character) {
    if (!character) {
      throw new Error('Character is required');
    }
    if (!character.economicProfile) {
      throw new Error('Character must have an economic profile');
    }
  }

  /**
   * Validate settlement for economic operations
   * @private
   */
  _validateSettlement(settlement) {
    if (!settlement) {
      throw new Error('Settlement is required');
    }
    if (!settlement.id || !settlement.name) {
      throw new Error('Settlement must have valid id and name');
    }
  }
}
```

### NeedConsequenceService Interface

```javascript
class NeedConsequenceService extends BaseDomainService {
  /**
   * Generate consequences based on need satisfaction levels
   * @param {Object} needs - Need satisfaction levels
   * @param {Settlement} settlement - Settlement experiencing the needs
   * @returns {Array} Array of consequence objects
   */
  generateConsequences(needs, settlement) {
    const consequences = [];

    // Food-related consequences
    if (needs.food < 0.5) {
      const severity = 1.0 - needs.food; // Lower satisfaction = higher severity
      consequences.push({
        id: `famine_${settlement.id}_${Date.now()}`,
        type: 'famine',
        severity: severity,
        description: `Food shortages plague ${settlement.name}`,
        effects: {
          population: {
            growth: -0.2 * severity,
            migration: 0.3 * severity,
            mortality: 0.1 * severity
          },
          character: {
            moodModifier: -30 * severity,
            energyModifier: -20 * severity,
            healthModifier: -15 * severity,
            behaviorChanges: ['prioritize_food', 'hunt_more', 'trade_desperately'],
            interactionModifiers: {
              'hunt_animals': 1 + severity,
              'trade_food': 1 + (2 * severity),
              'social_gathering': 1 - (0.5 * severity)
            }
          },
          settlement: {
            stabilityChange: -0.4 * severity,
            economicImpact: -0.3 * severity,
            socialCohesion: -0.5 * severity
          }
        },
        duration: Math.ceil(8 * severity),
        triggers: ['successful_harvest', 'food_trade_agreement', 'population_reduction']
      });
    }

    // Water-related consequences
    if (needs.water < 0.7) {
      const severity = (0.7 - needs.water) / 0.7;
      consequences.push({
        id: `water_crisis_${settlement.id}_${Date.now()}`,
        type: 'water_crisis',
        severity: severity,
        description: `Water scarcity threatens ${settlement.name}`,
        effects: {
          population: {
            growth: -0.15 * severity,
            migration: 0.25 * severity,
            mortality: 0.08 * severity
          },
          character: {
            moodModifier: -25 * severity,
            energyModifier: -15 * severity,
            healthModifier: -10 * severity,
            behaviorChanges: ['seek_water_sources', 'ration_water', 'dig_wells'],
            interactionModifiers: {
              'dig_well': 1 + (2 * severity),
              'trade_water': 1 + (3 * severity),
              'farm_crops': 1 - (0.4 * severity)
            }
          },
          settlement: {
            stabilityChange: -0.3 * severity,
            economicImpact: -0.25 * severity,
            socialCohesion: -0.2 * severity,
            buildingEfficiency: {
              'farm': 1 - (0.4 * severity),
              'brewery': 1 - (0.7 * severity)
            }
          }
        },
        duration: Math.ceil(6 * severity),
        triggers: ['build_aqueduct', 'find_water_source', 'water_trade_deal']
      });
    }

    // Shelter-related consequences
    if (needs.shelter < 0.4) {
      const severity = (0.4 - needs.shelter) / 0.4;
      consequences.push({
        id: `housing_crisis_${settlement.id}_${Date.now()}`,
        type: 'housing_crisis',
        severity: severity,
        description: `Overcrowding and poor housing conditions plague ${settlement.name}`,
        effects: {
          population: {
            growth: -0.1 * severity,
            migration: 0.2 * severity,
            mortality: 0.05 * severity
          },
          character: {
            moodModifier: -20 * severity,
            energyModifier: -15 * severity,
            healthModifier: -12 * severity,
            behaviorChanges: ['build_shelter', 'seek_better_housing', 'live_outdoors'],
            interactionModifiers: {
              'build_house': 1 + (1.5 * severity),
              'gather_materials': 1 + severity,
              'social_gathering': 1 - (0.3 * severity)
            }
          },
          settlement: {
            stabilityChange: -0.25 * severity,
            economicImpact: -0.15 * severity,
            socialCohesion: -0.3 * severity
          }
        },
        duration: Math.ceil(10 * severity),
        triggers: ['build_housing', 'population_reduction', 'expand_settlement']
      });
    }

    return consequences.filter(c => c !== null);
  }

  /**
   * Generate historical events from need satisfaction changes
   * @param {Object} previousNeeds - Previous turn's need levels
   * @param {Object} currentNeeds - Current turn's need levels
   * @param {Settlement} settlement - Settlement experiencing changes
   * @returns {Array} Array of historical events
   */
  generateHistoricalEvents(previousNeeds, currentNeeds, settlement) {
    const events = [];

    // Detect significant changes (>0.2 difference)
    for (const needType of ['food', 'water', 'shelter', 'goods', 'services']) {
      const change = currentNeeds[needType] - previousNeeds[needType];
      
      if (Math.abs(change) > 0.2) {
        events.push(this._createNeedChangeEvent(needType, change, settlement));
      }
    }

    // Overall crisis or prosperity events
    if (currentNeeds.overall < 0.4 && previousNeeds.overall >= 0.4) {
      events.push(this._createCrisisEvent(settlement, currentNeeds));
    } else if (currentNeeds.overall > 0.8 && previousNeeds.overall <= 0.8) {
      events.push(this._createProsperityEvent(settlement, currentNeeds));
    }

    return events;
  }
}
```

### Settlement Entity Enhancement

The existing Settlement entity will be enhanced to track need satisfaction:

```javascript
// Addition to existing Settlement.js
export const Settlement = {
  // ... existing properties ...
  
  needSatisfaction: {
    current: {
      food: Number,
      water: Number,
      shelter: Number,
      goods: Number,
      services: Number,
      overall: Number
    },
    history: [{
      timestamp: Number,
      food: Number,
      water: Number,
      shelter: Number,
      goods: Number,
      services: Number,
      overall: Number,
      consequences: [Object],
      events: [String] // IDs of generated historical events
    }],
    trends: {
      food: Number,    // Rate of change
      water: Number,
      shelter: Number,
      goods: Number,
      services: Number
    }
  },

  // ... rest of existing properties ...
};
```

### EconomicProfile Value Object

Following the existing immutable value object pattern:

```javascript
// src/domain/value-objects/EconomicProfile.js
export class EconomicProfile {
  constructor(config = {}) {
    // Validate inputs
    if (typeof config.wealth !== 'number' || config.wealth < 0) {
      throw new Error('Wealth must be a non-negative number');
    }
    
    // Create immutable copies
    this._wealth = config.wealth || 50;
    this._investments = Object.freeze([...(config.investments || [])]);
    this._economicGoals = Object.freeze([...(config.economicGoals || [])]);
    this._history = Object.freeze([...(config.history || [])]);
    
    // Make the entire object immutable
    Object.freeze(this);
  }
  
  /**
   * Get current wealth
   */
  getWealth() {
    return this._wealth;
  }
  
  /**
   * Get active investments
   */
  getActiveInvestments() {
    return this._investments.filter(inv => inv.status === 'active');
  }
  
  /**
   * Get economic goals
   */
  getEconomicGoals() {
    return this._economicGoals;
  }
  
  /**
   * Create new EconomicProfile with updated wealth
   */
  withWealthChange(amount, reason, context = null) {
    const newWealth = Math.max(0, this._wealth + amount);
    
    const change = Object.freeze({
      timestamp: new Date(),
      type: 'wealth_change',
      amount,
      newWealth,
      reason,
      context
    });
    
    return new EconomicProfile({
      wealth: newWealth,
      investments: this._investments,
      economicGoals: this._economicGoals,
      history: [...this._history, change]
    });
  }
  
  /**
   * Create new EconomicProfile with added investment
   */
  withInvestment(investment) {
    const newInvestments = [...this._investments, investment];
    
    const change = Object.freeze({
      timestamp: new Date(),
      type: 'investment_added',
      investmentId: investment.id,
      investmentType: investment.type,
      cost: investment.cost
    });
    
    return new EconomicProfile({
      wealth: this._wealth - investment.cost,
      investments: newInvestments,
      economicGoals: this._economicGoals,
      history: [...this._history, change]
    });
  }
  
  /**
   * Create new EconomicProfile with passive income
   */
  withPassiveIncome(amount) {
    if (amount <= 0) return this;
    
    return this.withWealthChange(amount, 'passive_income', {
      source: 'investments',
      amount
    });
  }
}
```

### Character Entity Enhancement

The existing Character entity will be enhanced to support economic activities:

```javascript
// Addition to existing Character.js
class Character {
  constructor(config = {}) {
    // ... existing properties ...
    
    // Initialize economic profile with default if not provided
    this.economicProfile = config.economicProfile instanceof EconomicProfile
      ? config.economicProfile
      : new EconomicProfile(config.economicProfileConfig || {});
    
    // Extend existing assignment system
    this.assignments = config.assignments || {
      nodes: new Set(config.assignedNodeIds || []),
      interactions: new Set(config.assignedInteractionIds || []),
      quests: new Set(config.assignedQuestIds || []),
      settlements: new Set(config.assignedSettlementIds || []),
      factions: new Set(config.assignedFactionIds || []),
      investments: new Set(config.assignedInvestmentIds || []) // NEW
    };
    
    // ... rest of existing properties ...
  }
  
  /**
   * Get state for validation including economic profile
   */
  getStateForValidation() {
    return {
      // ... existing state ...
      economicProfile: {
        wealth: this.economicProfile.getWealth(),
        investmentCount: this.economicProfile.getActiveInvestments().length,
        economicGoals: this.economicProfile.getEconomicGoals()
      }
    };
  }
}

// Investment data structure (immutable)
const Investment = Object.freeze({
  id: String,
  type: String,           // 'land_investment', 'business_investment', 'infrastructure_investment'
  name: String,
  cost: Number,
  startDate: Number,
  expectedReturn: Number, // Annual return percentage
  risk: Number,          // Risk factor (0.0 - 1.0)
  settlementId: String,
  status: String,        // 'active', 'completed', 'failed'
  effects: Object.freeze({
    settlement: Object.freeze({
      foodProduction: Number,
      waterProduction: Number,
      goodsProduction: Number,
      servicesProduction: Number,
      buildingEfficiency: Object
    }),
    character: Object.freeze({
      passiveIncome: Number,
      influence: Number
    })
  }),
  performance: Object.freeze([{
    timestamp: Number,
    totalReturn: Number,
    annualReturn: Number
  }])
});

// Economic goal data structure (immutable)
const EconomicGoal = Object.freeze({
  id: String,
  type: String,           // 'wealth_target', 'investment_diversification', 'business_empire'
  description: String,
  targetValue: Number,
  currentValue: Number,
  deadline: Number,
  status: String,         // 'active', 'completed', 'failed'
  progress: Number        // 0.0 - 1.0
});
```

## Data Models

### Need Satisfaction Data Structure

```javascript
const NeedSatisfactionResult = {
  needs: {
    food: Number,      // 0.0 - 1.0
    water: Number,     // 0.0 - 1.0
    shelter: Number,   // 0.0 - 1.0
    goods: Number,     // 0.0 - 1.0
    services: Number   // 0.0 - 1.0
  },
  overall: Number,     // 0.0 - 1.0 (after cascading effects)
  consequences: [ConsequenceObject],
  cascadingEffects: {
    multiplier: Number,
    affectedNeeds: [String]
  }
};
```

### Consequence Data Structure

```javascript
const ConsequenceObject = {
  id: String,
  type: String,        // 'famine', 'water_crisis', 'housing_crisis', etc.
  severity: Number,    // 0.0 - 1.0
  description: String,
  effects: {
    population: {
      growth: Number,    // Modifier to population growth (-0.1 = 10% slower growth)
      migration: Number, // Migration pressure (0.2 = 20% of population wants to leave)
      mortality: Number  // Mortality rate change (0.05 = 5% higher death rate)
    },
    character: {
      moodModifier: Number,      // -20 mood for water crisis
      energyModifier: Number,    // -10 energy from poor shelter
      healthModifier: Number,    // -15 health from famine
      behaviorChanges: [String], // ['prioritize_food', 'avoid_luxury_spending']
      interactionModifiers: {    // Modify interaction success rates
        'trade_food': 1.5,       // 50% better at food trading during famine
        'social_gathering': 0.7  // 30% worse at social interactions when hungry
      }
    },
    settlement: {
      stabilityChange: Number,   // -0.3 stability from housing crisis
      economicImpact: Number,    // -0.2 economic efficiency from goods shortage
      socialCohesion: Number,    // -0.4 social cohesion from services shortage
      buildingEfficiency: {     // Specific building type impacts
        'farm': 0.8,            // Farms 20% less efficient during water crisis
        'market': 0.6,          // Markets 40% less efficient during goods shortage
        'temple': 1.2           // Temples 20% more important during crisis
      }
    }
  },
  duration: Number,    // How many turns the consequence lasts
  triggers: [String]   // What can trigger resolution ['build_well', 'trade_agreement']
};
```

### Specific Consequence Examples

#### Water Crisis in Mountain Settlement
```javascript
const waterCrisisConsequence = {
  id: 'water_crisis_mountain_001',
  type: 'water_crisis',
  severity: 0.7,
  description: 'The mountain settlement struggles with water access as streams freeze and wells run dry',
  effects: {
    population: {
      growth: -0.15,     // 15% slower population growth
      migration: 0.25,   // 25% of population considers leaving
      mortality: 0.08    // 8% higher mortality rate
    },
    character: {
      moodModifier: -25,
      energyModifier: -15,
      healthModifier: -10,
      behaviorChanges: ['prioritize_water_sources', 'ration_water', 'seek_lower_altitude'],
      interactionModifiers: {
        'dig_well': 2.0,           // Much more likely to dig wells
        'trade_water': 3.0,        // Desperate for water trade
        'social_gathering': 0.5,   // Less socializing due to water rationing
        'explore_caves': 1.3       // More likely to explore for underground water
      }
    },
    settlement: {
      stabilityChange: -0.4,
      economicImpact: -0.3,
      socialCohesion: -0.2,
      buildingEfficiency: {
        'farm': 0.6,              // Farms severely impacted
        'brewery': 0.3,           // Breweries nearly shut down
        'bathhouse': 0.1,         // Bathhouses closed
        'temple': 1.4             // People pray more during crisis
      }
    }
  },
  duration: 8,  // Lasts 8 turns unless resolved
  triggers: ['build_aqueduct', 'dig_deep_well', 'relocate_settlement', 'trade_water_rights']
};
```

#### Famine in Agricultural Settlement
```javascript
const famineConsequence = {
  id: 'famine_agricultural_001',
  type: 'famine',
  severity: 0.8,
  description: 'Crop failures have led to widespread hunger and desperation',
  effects: {
    population: {
      growth: -0.3,      // 30% population decline
      migration: 0.4,    // 40% want to leave
      mortality: 0.15    // 15% higher death rate
    },
    character: {
      moodModifier: -35,
      energyModifier: -25,
      healthModifier: -20,
      behaviorChanges: ['hoard_food', 'steal_if_desperate', 'hunt_aggressively', 'eat_anything'],
      interactionModifiers: {
        'hunt_animals': 2.5,       // Much more hunting
        'forage_plants': 2.0,      // Desperate foraging
        'trade_food': 5.0,         // Will trade anything for food
        'steal_food': 3.0,         // More likely to steal
        'share_meal': 0.2,         // Much less food sharing
        'craft_luxury': 0.1        // No time for luxury crafts
      }
    },
    settlement: {
      stabilityChange: -0.6,
      economicImpact: -0.5,
      socialCohesion: -0.7,
      buildingEfficiency: {
        'granary': 1.5,           // Granaries become critical
        'market': 0.4,            // Markets disrupted by hoarding
        'tavern': 0.2,            // Taverns close due to no food
        'guard_post': 1.3         // More guards needed to prevent riots
      }
    }
  },
  duration: 12,
  triggers: ['successful_harvest', 'large_food_trade', 'discover_new_farmland', 'population_exodus']
};
```

## Error Handling

### Validation Strategy

1. **Input Validation**: Validate settlement data before calculations
2. **Boundary Checking**: Ensure satisfaction levels stay within 0.0-1.0 range
3. **Null Safety**: Handle missing settlement properties gracefully
4. **Calculation Errors**: Catch division by zero and invalid operations

### Error Recovery

```javascript
class BasicNeedsService extends BaseDomainService {
  calculateSatisfactionLevel(settlement) {
    try {
      this._validateSettlement(settlement);
      
      const needs = this._calculateAllNeeds(settlement);
      const overall = this._calculateCascadingEffects(needs);
      
      return {
        needs: this._clampNeedValues(needs),
        overall: this._clampValue(overall),
        consequences: this._generateConsequences(needs, settlement)
      };
    } catch (error) {
      this._logError('Need satisfaction calculation failed', error, settlement);
      return this._getDefaultSatisfactionResult();
    }
  }

  _validateSettlement(settlement) {
    if (!settlement) {
      throw new ValidationError('Settlement is required');
    }
    if (!settlement.population || typeof settlement.population.total !== 'number') {
      throw new ValidationError('Settlement must have valid population data');
    }
    if (!settlement.resources) {
      throw new ValidationError('Settlement must have resources data');
    }
  }

  _getDefaultSatisfactionResult() {
    return {
      needs: {
        food: 0.5,
        water: 0.5,
        shelter: 0.5,
        goods: 0.5,
        services: 0.5
      },
      overall: 0.5,
      consequences: []
    };
  }
}
```

## Testing Strategy

### Unit Tests

1. **BasicNeedsService Tests**
   - Individual need calculation methods
   - Cascading effects calculations
   - Edge cases (zero population, missing resources)
   - Boundary conditions (satisfaction levels at 0.0 and 1.0)

2. **NeedConsequenceService Tests**
   - Consequence generation for each need type
   - Historical event creation
   - Severity calculations

3. **Settlement Integration Tests**
   - Need satisfaction data persistence
   - Settlement state updates

### Integration Tests

1. **Simulation Integration**
   - Need satisfaction updates during turn processing
   - Character behavior changes based on settlement needs
   - Historical event generation and recording

2. **Template System Integration**
   - Settlement templates with predefined need satisfaction profiles
   - Template instantiation with need satisfaction data

### Performance Tests

1. **Calculation Performance**
   - Large settlement populations (10,000+ characters)
   - Multiple settlements processing simultaneously
   - Historical data accumulation over many turns

2. **Memory Usage**
   - Need satisfaction history storage
   - Consequence object creation and cleanup

## Consequence Application System

### How Consequences Actually Work

When a settlement has unmet needs, the system generates specific consequences that have measurable effects:

#### 1. Character Behavior Modification
- **Mood/Energy/Health Changes**: Applied directly to character stats each turn
- **Interaction Modifiers**: Change success rates and availability of specific interactions
- **Behavior Priorities**: Characters automatically prioritize need-related interactions

Example: During a water crisis in a mountain settlement:
- All characters get -25 mood, -15 energy, -10 health
- Characters are 2x more likely to choose "dig well" interactions
- Characters are 3x more likely to accept water trade deals
- Social interactions have 50% normal success rate (people are stressed)

#### 2. Settlement Infrastructure Impact
- **Building Efficiency**: Specific building types work better or worse
- **Economic Modifiers**: Trade, production, and resource generation affected
- **Population Changes**: Growth rates, migration, and mortality modified

Example: During a famine:
- Farms produce 20% less food (people are weak)
- Markets become 60% less efficient (hoarding, price gouging)
- Granaries become 50% more important (storage critical)
- Population growth drops by 30%

#### 3. Historical Event Generation
- Significant need changes create historical records
- Events describe what's happening and why
- Multiple settlements can have related events (regional famines)

#### 4. Resolution Triggers
- Consequences end when specific conditions are met
- Players can work toward these triggers through gameplay
- Some triggers are automatic (successful harvest), others require action (build aqueduct)

### Consequence Lifecycle

```javascript
// Turn 1: Water satisfaction drops to 0.3
const waterCrisis = {
  type: 'water_crisis',
  severity: 0.7,
  duration: 6,
  effects: { /* character and settlement modifiers */ }
};

// Turn 2-7: Effects applied each turn
characters.forEach(char => {
  char.mood -= 25 * 0.7;  // -17.5 mood
  char.energy -= 15 * 0.7; // -10.5 energy
  // Interaction modifiers applied when character acts
});

settlement.buildings.farm.efficiency *= 0.6; // 40% less efficient
settlement.population.growth *= 0.85; // 15% slower growth

// Turn 8: Player builds aqueduct (trigger met)
if (settlement.buildings.some(b => b.type === 'aqueduct')) {
  // Consequence resolved, effects removed
  waterCrisis.resolved = true;
}
```

## Character Investment Examples

### Farmer Investment Scenario

```javascript
// Character: Marcus the Farmer
const farmer = {
  id: 'marcus_001',
  name: 'Marcus',
  wealth: 150,
  skills: ['farming', 'land_management'],
  location: 'greenfield_village'
};

// Settlement: Greenfield Village (agricultural settlement)
const settlement = {
  id: 'greenfield_village',
  name: 'Greenfield Village',
  type: 'village',
  population: { total: 200 },
  resources: {
    production: { food: 50, water: 30, goods: 10, services: 5 }
  },
  buildings: [
    { type: 'farm', level: 1, efficiency: 1.0 },
    { type: 'well', level: 1, efficiency: 1.0 }
  ]
};

// Investment opportunity: Expand Farm Land
const investmentOpportunity = {
  id: 'farm_expansion',
  type: 'land_investment',
  name: 'Expand Farm Land',
  cost: 100,
  expectedReturn: 15,
  risk: 0.2,
  effects: {
    settlement: {
      foodProduction: 10,
      buildingEfficiency: { 'farm': 1.1 }
    },
    character: {
      passiveIncome: 15,
      influence: 5
    }
  }
};

// After investment execution:
// - Marcus's wealth: 150 - 100 = 50
// - Settlement food production: 50 + 10 = 60
// - Farm efficiency: 1.0 * 1.1 = 1.1
// - Marcus gains 15 passive income per turn
// - Settlement need satisfaction improves due to increased food production
```

### Alchemist Business Investment Scenario

```javascript
// Character: Elara the Alchemist
const alchemist = {
  id: 'elara_001',
  name: 'Elara',
  wealth: 300,
  skills: ['alchemy', 'trading', 'business'],
  location: 'merchant_town'
};

// Settlement: Merchant Town (trade hub)
const settlement = {
  id: 'merchant_town',
  name: 'Merchant Town',
  type: 'town',
  population: { total: 500 },
  resources: {
    production: { food: 80, water: 60, goods: 40, services: 25 }
  },
  buildings: [
    { type: 'market', level: 2, efficiency: 1.0 },
    { type: 'workshop', level: 1, efficiency: 1.0 }
  ]
};

// Investment opportunity: Open Alchemy Shop
const investmentOpportunity = {
  id: 'alchemy_shop',
  type: 'business_investment',
  name: 'Open Alchemy Shop',
  cost: 200,
  expectedReturn: 25,
  risk: 0.3,
  effects: {
    settlement: {
      goodsProduction: 8,
      servicesProduction: 3,
      buildingEfficiency: { 'market': 1.2 }
    },
    character: {
      passiveIncome: 25,
      influence: 8
    }
  }
};

// After investment execution:
// - Elara's wealth: 300 - 200 = 100
// - Settlement goods production: 40 + 8 = 48
// - Settlement services production: 25 + 3 = 28
// - Market efficiency: 1.0 * 1.2 = 1.2
// - Elara gains 25 passive income per turn
// - Settlement need satisfaction improves for goods and services
```

### Investment Performance Over Time

```javascript
// Turn 1: Investment made
const investment = {
  id: 'marcus_farm_expansion_001',
  type: 'land_investment',
  cost: 100,
  startDate: Date.now(),
  expectedReturn: 15,
  risk: 0.2
};

// Turn 2-5: Passive income calculation
const needSatisfaction = {
  needs: { food: 0.8, water: 0.9, shelter: 0.7, goods: 0.6, services: 0.5 }
};

// Income calculation: 15 * (100/100) * 0.8 * (1 + random risk factor)
// Turn 2: 15 * 0.8 * 1.1 = 13.2 → 13 gold
// Turn 3: 15 * 0.8 * 0.9 = 10.8 → 11 gold
// Turn 4: 15 * 0.8 * 1.2 = 14.4 → 14 gold
// Turn 5: 15 * 0.8 * 1.0 = 12.0 → 12 gold

// Investment performance tracking
investment.performance = [
  { timestamp: Date.now() + 86400000, totalReturn: 0.13, annualReturn: 0.13 },
  { timestamp: Date.now() + 172800000, totalReturn: 0.24, annualReturn: 0.12 },
  { timestamp: Date.now() + 259200000, totalReturn: 0.38, annualReturn: 0.127 },
  { timestamp: Date.now() + 345600000, totalReturn: 0.50, annualReturn: 0.125 }
];
```

## Integration Points

### With Existing Systems

#### Character Behavior Integration
- Characters in settlements with low food satisfaction prioritize food-related interactions
- Mood modifiers applied based on settlement need satisfaction
- Migration decisions influenced by comparative need satisfaction between settlements

#### Historical Event Integration
- Need satisfaction changes generate historical events via existing HistoryGenerator
- Events categorized and stored in existing historical record system
- Timeline integration with other historical events

#### Template System Integration
- Settlement templates include need satisfaction baselines
- Character templates can specify need-related behavioral priorities
- Interaction templates can reference settlement need satisfaction levels

#### Turn Processing Integration
- Need satisfaction calculated during settlement update phase
- Consequences applied before character action phase
- Historical events generated and recorded

### With Future Systems

#### Trade System Integration
- Trade routes affect goods and food satisfaction
- Trade disruptions create need satisfaction crises
- Economic relationships between settlements based on need complementarity

#### Faction System Integration
- Faction policies affect need satisfaction (taxation, resource allocation)
- Inter-faction conflicts can disrupt need satisfaction
- Faction reputation influenced by ability to maintain citizen needs

#### Climate System Integration
- Weather patterns affect food and water satisfaction
- Seasonal variations in need satisfaction
- Climate disasters create temporary need crises

## Performance Considerations

### Optimization Strategies

1. **Calculation Caching**
   - Cache need satisfaction calculations for settlements that haven't changed
   - Invalidate cache only when relevant settlement properties change
   - Use settlement modification timestamps for cache validation

2. **Batch Processing**
   - Process multiple settlements in parallel during turn updates
   - Group similar calculations to reduce redundant operations
   - Use worker threads for large-scale simulations

3. **Data Structure Optimization**
   - Use efficient data structures for need satisfaction history
   - Implement circular buffers for recent history tracking
   - Compress historical data for long-term storage

4. **Lazy Evaluation**
   - Calculate consequences only when need satisfaction changes significantly
   - Generate historical events only for meaningful changes
   - Defer complex calculations until actually needed

### Memory Management

1. **History Pruning**
   - Automatically prune old need satisfaction history
   - Configurable retention periods
   - Archive significant events while discarding routine data

2. **Object Pooling**
   - Reuse consequence objects to reduce garbage collection
   - Pool calculation result objects
   - Efficient cleanup of temporary calculation data

## Conclusion

The Need Satisfaction Cascades feature provides a realistic foundation for economic and social dynamics in the World History Simulation Engine. By integrating with the existing Clean Architecture and leveraging current domain entities, this system creates emergent challenges that drive character behavior and historical narrative generation while maintaining the turn-based, mapless design principles of the simulation engine.

The cascading effects model ensures that basic needs shortages create realistic multiplying problems, while the consequence system generates meaningful historical events and character behavioral changes. The integration with existing systems ensures that need satisfaction becomes a driving force for the emergent storytelling that defines the simulation experience.