/**
 * Settlement Development Service
 *
 * Manages settlement development trees, upgrade prerequisites, and execution
 * for the Valley of Echoes demo. Handles development progression through
 * structured upgrade trees with resource and population requirements.
 */

import BaseDomainService from './BaseDomainService.js';

class SettlementDevelopmentService extends BaseDomainService {
  constructor() {
    super();
    this.developmentTrees = new Map();
    this.upgradeDefinitions = new Map();
    this._initializeDefaultUpgradeDefinitions();
  }

  /**
   * Initialize default upgrade definitions for different settlement types
   * @private
   */
  _initializeDefaultUpgradeDefinitions() {
    this.upgradeDefinitions.set('village', {
      walls: {
        name: 'Defensive Walls',
        description: 'Build protective walls around the settlement',
        cost: { materials: 50, gold: 25 },
        requirements: { population: 50 },
        infrastructure: { walls: 1 },
        benefits: { defense: 0.3, security: 0.2 }
      },
      market: {
        name: 'Trading Market',
        description: 'Establish a marketplace for trade',
        cost: { gold: 100, materials: 25 },
        requirements: { population: 30 },
        infrastructure: { market: 1 },
        benefits: { economy: 0.4, trade: 0.3 }
      },
      temple: {
        name: 'Sacred Temple',
        description: 'Build a temple for spiritual guidance',
        cost: { gold: 200, materials: 100 },
        requirements: { population: 100 },
        prerequisites: ['market'],
        infrastructure: { temple: 1 },
        benefits: { morale: 0.3, culture: 0.4 }
      },
      barracks: {
        name: 'Military Barracks',
        description: 'Train and house military forces',
        cost: { materials: 75, gold: 50 },
        requirements: { population: 75 },
        infrastructure: { barracks: 1 },
        benefits: { military: 0.5, training: 0.3 }
      },
      tavern: {
        name: 'Town Tavern',
        description: 'Social hub for residents and travelers',
        cost: { materials: 30, gold: 40 },
        requirements: { population: 25 },
        infrastructure: { tavern: 1 },
        benefits: { morale: 0.2, social: 0.3 }
      }
    });

    this.upgradeDefinitions.set('town', {
      walls: {
        name: 'Fortified Walls',
        description: 'Upgrade to stronger defensive fortifications',
        cost: { materials: 150, gold: 100 },
        requirements: { population: 200 },
        infrastructure: { walls: 2 },
        benefits: { defense: 0.5, security: 0.4 }
      },
      marketplace: {
        name: 'Grand Marketplace',
        description: 'Expand market with specialized districts',
        cost: { gold: 300, materials: 100 },
        requirements: { population: 150 },
        prerequisites: ['market'],
        infrastructure: { market: 2 },
        benefits: { economy: 0.6, trade: 0.5 }
      },
      cathedral: {
        name: 'Grand Cathedral',
        description: 'Majestic place of worship and community',
        cost: { gold: 500, materials: 200 },
        requirements: { population: 300 },
        prerequisites: ['temple'],
        infrastructure: { temple: 2 },
        benefits: { morale: 0.5, culture: 0.6 }
      },
      castle: {
        name: 'Noble Castle',
        description: 'Seat of local governance and defense',
        cost: { materials: 300, gold: 400 },
        requirements: { population: 250 },
        prerequisites: ['barracks', 'walls'],
        infrastructure: { castle: 1 },
        benefits: { governance: 0.4, military: 0.6 }
      }
    });
  }

  /**
   * Initialize development tree for a settlement
   * @param {string} settlementId - Settlement identifier
   * @param {Object} config - Development tree configuration
   * @returns {Object} Initialization result
   */
  initializeDevelopmentTree(settlementId, config) {
    try {
      this._validateInitializationConfig(config);

      const developmentTree = {
        settlementId,
        settlementType: config.settlementType,
        currentLevel: config.startingLevel || 1,
        availableUpgrades: config.availableUpgrades || this._getDefaultUpgrades(config.settlementType),
        completedUpgrades: config.completedUpgrades || [],
        prerequisites: config.prerequisites || {},
        upgradeHistory: [],
        lastUpdated: new Date()
      };

      this.developmentTrees.set(settlementId, developmentTree);

      return {
        success: true,
        developmentTree,
        message: `Development tree initialized for ${config.settlementType}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get available upgrades for a settlement
   * @param {string} settlementId - Settlement identifier
   * @param {Object} world - World context
   * @returns {Object} Available upgrades result
   */
  getAvailableUpgrades(settlementId, world) {
    try {
      const settlement = world.getSettlement(settlementId);
      if (!settlement) {
        throw new Error(`Settlement ${settlementId} not found`);
      }

      const developmentTree = this.developmentTrees.get(settlementId);
      if (!developmentTree) {
        throw new Error(`Development tree not initialized for settlement ${settlementId}`);
      }

      const availableUpgrades = [];
      const blockedUpgrades = {};

      for (const upgradeId of developmentTree.availableUpgrades) {
        if (developmentTree.completedUpgrades.includes(upgradeId)) {
          continue; // Already completed
        }

        const canExecute = this._checkUpgradePrerequisites(settlement, upgradeId, developmentTree);
        const upgradeDef = this._getUpgradeDefinition(developmentTree.settlementType, upgradeId);

        if (canExecute) {
          availableUpgrades.push({
            id: upgradeId,
            name: upgradeDef.name,
            description: upgradeDef.description,
            cost: upgradeDef.cost,
            benefits: upgradeDef.benefits
          });
        } else {
          blockedUpgrades[upgradeId] = this._getMissingRequirements(settlement, upgradeId, developmentTree);
        }
      }

      return {
        success: true,
        availableUpgrades,
        blockedUpgrades,
        settlementLevel: developmentTree.currentLevel
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if upgrade prerequisites are met
   * @param {string} settlementId - Settlement identifier
   * @param {string} upgradeId - Upgrade identifier
   * @param {Object} world - World context
   * @returns {Object} Prerequisite check result
   */
  checkUpgradePrerequisites(settlementId, upgradeId, world) {
    try {
      const settlement = world.getSettlement(settlementId);
      if (!settlement) {
        throw new Error(`Settlement ${settlementId} not found`);
      }

      const developmentTree = this.developmentTrees.get(settlementId);
      if (!developmentTree) {
        throw new Error(`Development tree not initialized for settlement ${settlementId}`);
      }

      const canExecute = this._checkUpgradePrerequisites(settlement, upgradeId, developmentTree);
      const missingRequirements = canExecute ? [] : this._getMissingRequirements(settlement, upgradeId, developmentTree);

      return {
        success: true,
        canExecute,
        missingRequirements,
        upgradeId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute an upgrade for a settlement
   * @param {string} settlementId - Settlement identifier
   * @param {string} upgradeId - Upgrade identifier
   * @param {Object} world - World context
   * @returns {Object} Upgrade execution result
   */
  executeUpgrade(settlementId, upgradeId, world) {
    try {
      const settlement = world.getSettlement(settlementId);
      if (!settlement) {
        throw new Error(`Settlement ${settlementId} not found`);
      }

      const developmentTree = this.developmentTrees.get(settlementId);
      if (!developmentTree) {
        throw new Error(`Development tree not initialized for settlement ${settlementId}`);
      }

      // Check prerequisites
      const prerequisiteCheck = this.checkUpgradePrerequisites(settlementId, upgradeId, world);
      if (!prerequisiteCheck.canExecute) {
        throw new Error(`Prerequisites not met for upgrade ${upgradeId}: ${prerequisiteCheck.missingRequirements.join(', ')}`);
      }

      // Get upgrade definition
      const upgradeDef = this._getUpgradeDefinition(developmentTree.settlementType, upgradeId);

      // Consume resources
      const resourcesConsumed = {};
      for (const [resource, amount] of Object.entries(upgradeDef.cost)) {
        const currentAmount = settlement.resources.get(resource) || 0;
        if (currentAmount < amount) {
          throw new Error(`Insufficient ${resource} for upgrade ${upgradeId}`);
        }
        settlement.resources.set(resource, currentAmount - amount);
        resourcesConsumed[resource] = amount;
      }

      // Apply infrastructure changes
      const infrastructureChanges = {};
      for (const [infra, level] of Object.entries(upgradeDef.infrastructure)) {
        const currentLevel = settlement.infrastructure.get(infra) || 0;
        const newLevel = Math.max(currentLevel, level);
        settlement.infrastructure.set(infra, newLevel);
        infrastructureChanges[infra] = { from: currentLevel, to: newLevel };
      }

      // Record upgrade completion
      developmentTree.completedUpgrades.push(upgradeId);
      developmentTree.upgradeHistory.push({
        upgradeId,
        executedAt: new Date(),
        turn: world.turn,
        resourcesConsumed,
        infrastructureChanges
      });

      // Update settlement's development tree
      if (!settlement.developmentTree) {
        settlement.developmentTree = {};
      }
      settlement.developmentTree.completedUpgrades = developmentTree.completedUpgrades;
      settlement.developmentTree.upgradeHistory = developmentTree.upgradeHistory;
      settlement.developmentTree.currentLevel = developmentTree.currentLevel;

      // Update development level if needed
      const developmentLevelChanged = this._updateDevelopmentLevel(settlement, developmentTree);

      // Update node capacity if development level changed
      let capacityChanged = false;
      let newCapacity = settlement.nodeCapacity;
      if (developmentLevelChanged) {
        newCapacity = this.calculateNodeCapacity(settlement.developmentLevel);
        if (newCapacity !== settlement.nodeCapacity) {
          settlement.nodeCapacity = newCapacity;
          capacityChanged = true;
        }
      }

      // Update timestamp
      developmentTree.lastUpdated = new Date();

      return {
        success: true,
        upgradeExecuted: upgradeId,
        resourcesConsumed,
        infrastructureChanges,
        developmentLevelChanged,
        newLevel: settlement.developmentLevel,
        capacityChanged,
        newCapacity: settlement.nodeCapacity,
        availableSlots: settlement.getAvailableNodeSlots ? settlement.getAvailableNodeSlots() : 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate the cost of an upgrade
   * @param {string} settlementId - Settlement identifier
   * @param {string} upgradeId - Upgrade identifier
   * @returns {Object} Cost calculation result
   */
  calculateUpgradeCost(settlementId, upgradeId) {
    try {
      const developmentTree = this.developmentTrees.get(settlementId);
      if (!developmentTree) {
        throw new Error(`Development tree not initialized for settlement ${settlementId}`);
      }

      const upgradeDef = this._getUpgradeDefinition(developmentTree.settlementType, upgradeId);
      const baseCost = upgradeDef.cost;

      // Apply scaling for repeated upgrades (simplified)
      const completedCount = developmentTree.completedUpgrades.filter(id => id === upgradeId).length;
      const scalingFactor = 1 + (completedCount * 0.25); // 25% increase per repeat

      const scaledCost = {};
      let totalCost = 0;

      for (const [resource, baseAmount] of Object.entries(baseCost)) {
        const scaledAmount = Math.ceil(baseAmount * scalingFactor);
        scaledCost[resource] = scaledAmount;
        totalCost += scaledAmount;
      }

      return {
        success: true,
        cost: scaledCost,
        totalCost,
        scalingFactor,
        baseCost
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get development progress for a settlement
   * @param {string} settlementId - Settlement identifier
   * @returns {Object} Development progress result
   */
  getDevelopmentProgress(settlementId) {
    try {
      const developmentTree = this.developmentTrees.get(settlementId);
      if (!developmentTree) {
        throw new Error(`Development tree not initialized for settlement ${settlementId}`);
      }

      const totalUpgrades = developmentTree.availableUpgrades.length;
      const completedUpgrades = developmentTree.completedUpgrades.length;
      const overallProgress = totalUpgrades > 0 ? (completedUpgrades / totalUpgrades) * 100 : 0;

      // Identify next recommended upgrades
      const nextRecommended = developmentTree.availableUpgrades
        .filter(upgrade => !developmentTree.completedUpgrades.includes(upgrade))
        .slice(0, 3); // Top 3 available upgrades

      return {
        success: true,
        progress: {
          currentLevel: developmentTree.currentLevel,
          completedUpgrades: developmentTree.completedUpgrades,
          availableUpgrades: developmentTree.availableUpgrades,
          overallProgress: Math.round(overallProgress),
          nextRecommended,
          upgradeHistory: developmentTree.upgradeHistory,
          nodeCapacity: this.calculateNodeCapacity(developmentTree.currentLevel),
          nextLevelCapacity: this.calculateNodeCapacity(developmentTree.currentLevel + 1),
          upgradesToNextLevel: Math.max(0, (developmentTree.currentLevel * 2) - developmentTree.completedUpgrades.length)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate a development path sequence
   * @param {string} settlementId - Settlement identifier
   * @param {Array<string>} upgradePath - Sequence of upgrade IDs
   * @returns {Object} Path validation result
   */
  validateDevelopmentPath(settlementId, upgradePath) {
    try {
      const developmentTree = this.developmentTrees.get(settlementId);
      if (!developmentTree) {
        throw new Error(`Development tree not initialized for settlement ${settlementId}`);
      }

      const violations = [];
      const pathAnalysis = [];
      const completedUpgrades = new Set();

      for (let i = 0; i < upgradePath.length; i++) {
        const upgradeId = upgradePath[i];
        const upgradeDef = this._getUpgradeDefinition(developmentTree.settlementType, upgradeId);

        // Check if upgrade exists
        if (!upgradeDef) {
          violations.push(`Unknown upgrade: ${upgradeId}`);
          continue;
        }

        // Check prerequisites
        const prerequisites = upgradeDef.prerequisites || [];
        const missingPrereqs = prerequisites.filter(prereq => !completedUpgrades.has(prereq));

        pathAnalysis.push({
          upgradeId,
          position: i + 1,
          valid: missingPrereqs.length === 0,
          missingPrerequisites: missingPrereqs
        });

        if (missingPrereqs.length > 0) {
          violations.push(`${upgradeId} missing prerequisites: ${missingPrereqs.join(', ')}`);
        }

        completedUpgrades.add(upgradeId);
      }

      // Generate suggestions for optimization
      const suggestions = this._generatePathSuggestions(developmentTree, upgradePath);

      return {
        success: true,
        isValid: violations.length === 0,
        violations,
        pathAnalysis,
        suggestions
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check upgrade prerequisites (internal method)
   * @private
   */
  _checkUpgradePrerequisites(settlement, upgradeId, developmentTree) {
    const upgradeDef = this._getUpgradeDefinition(developmentTree.settlementType, upgradeId);

    // Check resource requirements
    for (const [resource, required] of Object.entries(upgradeDef.cost)) {
      const available = settlement.resources.get(resource) || 0;
      if (available < required) {
        return false;
      }
    }

    // Check population requirements
    if (upgradeDef.requirements?.population) {
      if (settlement.population < upgradeDef.requirements.population) {
        return false;
      }
    }

    // Check prerequisite upgrades
    const prerequisites = upgradeDef.prerequisites || [];
    for (const prereq of prerequisites) {
      if (!developmentTree.completedUpgrades.includes(prereq)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get missing requirements for an upgrade
   * @private
   */
  _getMissingRequirements(settlement, upgradeId, developmentTree) {
    const upgradeDef = this._getUpgradeDefinition(developmentTree.settlementType, upgradeId);
    const missing = [];

    // Check resources
    for (const [resource, required] of Object.entries(upgradeDef.cost)) {
      const available = settlement.resources.get(resource) || 0;
      if (available < required) {
        missing.push(`${resource} (${available}/${required})`);
      }
    }

    // Check population
    if (upgradeDef.requirements?.population) {
      if (settlement.population < upgradeDef.requirements.population) {
        missing.push(`population (${settlement.population}/${upgradeDef.requirements.population})`);
      }
    }

    // Check prerequisites
    const prerequisites = upgradeDef.prerequisites || [];
    for (const prereq of prerequisites) {
      if (!developmentTree.completedUpgrades.includes(prereq)) {
        missing.push(`upgrade: ${prereq}`);
      }
    }

    return missing;
  }

  /**
   * Get upgrade definition
   * @private
   */
  _getUpgradeDefinition(settlementType, upgradeId) {
    const typeDefinitions = this.upgradeDefinitions.get(settlementType);
    if (!typeDefinitions || !typeDefinitions[upgradeId]) {
      throw new Error(`Unknown upgrade ${upgradeId} for settlement type ${settlementType}`);
    }
    return typeDefinitions[upgradeId];
  }

  /**
   * Get default upgrades for settlement type
   * @private
   */
  _getDefaultUpgrades(settlementType) {
    const definitions = this.upgradeDefinitions.get(settlementType);
    return definitions ? Object.keys(definitions) : [];
  }

  /**
   * Update settlement development level based on completed upgrades
   * @private
   */
  _updateDevelopmentLevel(settlement, developmentTree) {
    const completedCount = developmentTree.completedUpgrades.length;

    // Simple level calculation: every 2 upgrades increases level
    const newLevel = Math.floor(completedCount / 2) + 1;
    const levelChanged = newLevel !== settlement.developmentLevel;

    if (levelChanged) {
      settlement.developmentLevel = newLevel;
      developmentTree.currentLevel = newLevel;
    }

    return levelChanged;
  }

  /**
   * Generate path optimization suggestions
   * @private
   */
  _generatePathSuggestions(developmentTree, upgradePath) {
    const suggestions = [];

    // Check for prerequisite violations and suggest reordering
    const completedUpgrades = new Set();
    const problematicUpgrades = [];

    for (const upgradeId of upgradePath) {
      const upgradeDef = this._getUpgradeDefinition(developmentTree.settlementType, upgradeId);
      const prerequisites = upgradeDef.prerequisites || [];
      const missingPrereqs = prerequisites.filter(prereq => !completedUpgrades.has(prereq));

      if (missingPrereqs.length > 0) {
        problematicUpgrades.push({
          upgrade: upgradeId,
          missing: missingPrereqs,
          suggestion: `Move ${upgradeId} after completing: ${missingPrereqs.join(', ')}`
        });
      }

      completedUpgrades.add(upgradeId);
    }

    if (problematicUpgrades.length > 0) {
      suggestions.push({
        type: 'reorder',
        description: 'Consider reordering upgrades to satisfy prerequisites',
        details: problematicUpgrades
      });
    }

    // Suggest high-impact upgrades first
    const availableUpgrades = developmentTree.availableUpgrades
      .filter(upgrade => !developmentTree.completedUpgrades.includes(upgrade))
      .filter(upgrade => !upgradePath.includes(upgrade));

    if (availableUpgrades.length > 0) {
      suggestions.push({
        type: 'addition',
        description: 'Consider adding these high-impact upgrades',
        upgrades: availableUpgrades.slice(0, 2)
      });
    }

    return suggestions;
  }

  /**
   * Calculate node capacity based on development level
   * @param {number} developmentLevel - Current development level
   * @returns {number} Maximum number of nodes
   */
  calculateNodeCapacity(developmentLevel) {
    // Capacity scaling based on development level
    if (developmentLevel <= 1) return 1;      // Core only
    if (developmentLevel <= 2) return 2;      // Core + 1 district
    if (developmentLevel <= 3) return 4;      // Core + 3 districts
    if (developmentLevel <= 4) return 7;      // Core + 6 districts
    if (developmentLevel <= 5) return 11;     // Core + 10 districts

    // Level 6+: 11 + (level-5) * 5 nodes
    return 11 + (developmentLevel - 5) * 5;
  }

  /**
   * Get development level requirements for node capacity
   * @param {number} desiredCapacity - Desired number of nodes
   * @returns {Object} Requirements for reaching desired capacity
   */
  getCapacityRequirements(desiredCapacity) {
    let requiredLevel = 1;
    let currentCapacity = 1;

    while (currentCapacity < desiredCapacity && requiredLevel < 20) {
      requiredLevel++;
      currentCapacity = this.calculateNodeCapacity(requiredLevel);
    }

    if (currentCapacity < desiredCapacity) {
      return {
        achievable: false,
        maxCapacity: currentCapacity,
        message: `Maximum capacity is ${currentCapacity} nodes at development level ${requiredLevel}`
      };
    }

    return {
      achievable: true,
      requiredLevel,
      currentCapacity: this.calculateNodeCapacity(requiredLevel - 1),
      newCapacity: currentCapacity,
      additionalCapacity: currentCapacity - this.calculateNodeCapacity(requiredLevel - 1)
    };
  }
}

export default SettlementDevelopmentService;