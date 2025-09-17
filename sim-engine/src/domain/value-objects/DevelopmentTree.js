// src/domain/value-objects/DevelopmentTree.js

import { BaseValueObject } from './BaseValueObject.js';

/**
 * Immutable value object representing a development tree for settlement upgrades
 * Defines upgrade prerequisites, costs, effects, and progression logic
 * Supports prerequisite-based unlock system with resource costs
 */
export class DevelopmentTree extends BaseValueObject {
  constructor(category, config = {}) {
    super();

    // Validate category
    this.validateRequired('category', category);
    this._validateCategory(category);

    this.category = category;
    this.name = config.name || `${category} Development`;
    this.description = config.description || '';

    // Tree Structure
    this.nodes = new Map(); // upgradeId -> upgrade definition
    this.dependencies = new Map(); // upgradeId -> [prerequisite IDs]
    this.levels = new Map(config.levels || []); // level -> [upgrade IDs]

    // Progress Tracking
    this.completedUpgrades = new Set(config.completedUpgrades || []);
    this.availableUpgrades = new Set();
    this.lockedUpgrades = new Set();

    // Initialize tree structure
    this._initializeTree(config.treeDefinition);

    // Update available upgrades based on current state
    this._updateAvailableUpgrades();

    // Freeze the object to ensure immutability
    this.freeze();
  }

  /**
   * Check if an upgrade can be purchased
   */
  canUpgrade(upgradeId, availableResources = new Map(), completedUpgrades = new Set()) {
    const upgrade = this.nodes.get(upgradeId);
    if (!upgrade) return false;

    // Check prerequisites
    const prerequisites = this.dependencies.get(upgradeId) || [];
    const allPrerequisites = new Set([...this.completedUpgrades, ...completedUpgrades]);
    const prerequisitesMet = prerequisites.every(prereq => allPrerequisites.has(prereq));

    if (!prerequisitesMet) return false;

    // Check resource costs
    const costsAffordable = Object.entries(upgrade.costs).every(([resource, cost]) => {
      return (availableResources.get(resource) || 0) >= cost;
    });

    return costsAffordable;
  }

  /**
   * Get the cost of an upgrade
   */
  getUpgradeCost(upgradeId) {
    const upgrade = this.nodes.get(upgradeId);
    return upgrade ? { ...upgrade.costs } : {};
  }

  /**
   * Get the effects of an upgrade
   */
  getUpgradeEffects(upgradeId) {
    const upgrade = this.nodes.get(upgradeId);
    return upgrade ? { ...upgrade.effects } : {};
  }

  /**
   * Get upgrade definition
   */
  getUpgrade(upgradeId) {
    const upgrade = this.nodes.get(upgradeId);
    return upgrade ? { ...upgrade } : null;
  }

  /**
   * Get all upgrades at a specific level
   */
  getUpgradesAtLevel(level) {
    return Array.from(this.levels.get(level) || []);
  }

  /**
   * Get all available upgrades (not completed, prerequisites met)
   */
  getAvailableUpgrades(completedUpgrades = new Set()) {
    const allCompleted = new Set([...this.completedUpgrades, ...completedUpgrades]);
    const available = new Set();

    this.nodes.forEach((upgrade, upgradeId) => {
      if (allCompleted.has(upgradeId)) return;

      const prerequisites = this.dependencies.get(upgradeId) || [];
      const prerequisitesMet = prerequisites.every(prereq => allCompleted.has(prereq));

      if (prerequisitesMet) {
        available.add(upgradeId);
      }
    });

    return available;
  }

  /**
   * Get all upgrades that would be unlocked by completing an upgrade
   */
  getUpgradesUnlockedBy(upgradeId) {
    const upgrade = this.nodes.get(upgradeId);
    return upgrade ? new Set(upgrade.unlocks || []) : new Set();
  }

  /**
   * Get the prerequisites for an upgrade
   */
  getPrerequisites(upgradeId) {
    return new Set(this.dependencies.get(upgradeId) || []);
  }

  /**
   * Get upgrades that have this upgrade as a prerequisite
   */
  getDependentUpgrades(upgradeId) {
    const dependents = new Set();
    this.dependencies.forEach((prerequisites, dependentId) => {
      if (prerequisites.includes(upgradeId)) {
        dependents.add(dependentId);
      }
    });
    return dependents;
  }

  /**
   * Calculate total development progress (0-1)
   */
  getProgressRatio() {
    if (this.nodes.size === 0) return 0;
    return this.completedUpgrades.size / this.nodes.size;
  }

  /**
   * Get development tree statistics
   */
  getStatistics() {
    return {
      totalUpgrades: this.nodes.size,
      completedUpgrades: this.completedUpgrades.size,
      availableUpgrades: this.availableUpgrades.size,
      lockedUpgrades: this.lockedUpgrades.size,
      progressRatio: this.getProgressRatio(),
      category: this.category
    };
  }

  /**
   * Create a new DevelopmentTree with an upgrade completed
   */
  withUpgradeCompleted(upgradeId) {
    if (!this.nodes.has(upgradeId)) {
      throw new Error(`Upgrade ${upgradeId} does not exist in tree`);
    }

    if (this.completedUpgrades.has(upgradeId)) {
      throw new Error(`Upgrade ${upgradeId} is already completed`);
    }

    const newCompleted = new Set([...this.completedUpgrades, upgradeId]);
    const newConfig = {
      ...this.toJSON(),
      completedUpgrades: Array.from(newCompleted)
    };

    return new DevelopmentTree(this.category, newConfig);
  }

  /**
   * Get all upgrade IDs in the tree
   */
  getAllUpgradeIds() {
    return new Set(this.nodes.keys());
  }

  /**
   * Check if upgrade exists in tree
   */
  hasUpgrade(upgradeId) {
    return this.nodes.has(upgradeId);
  }

  /**
   * Get the maximum level in the tree
   */
  getMaxLevel() {
    return Math.max(...Array.from(this.levels.keys()), 0);
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      category: this.category,
      name: this.name,
      description: this.description,
      treeDefinition: this._serializeTreeDefinition(),
      levels: Array.from(this.levels.entries()),
      completedUpgrades: Array.from(this.completedUpgrades)
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for DevelopmentTree');
    }

    return new DevelopmentTree(data.category, {
      name: data.name,
      description: data.description,
      treeDefinition: data.treeDefinition,
      levels: new Map(data.levels || []),
      completedUpgrades: data.completedUpgrades || []
    });
  }

  /**
   * Create predefined development trees
   */
  static ECONOMIC_DEVELOPMENT = new DevelopmentTree('economic', {
    name: 'Economic Development',
    description: 'Enhance settlement economic capabilities and resource management',
    treeDefinition: {
      'basic_farming': {
        name: 'Basic Farming',
        description: 'Improve agricultural productivity',
        level: 1,
        costs: { gold: 100, materials: 50 },
        prerequisites: [],
        effects: { foodProduction: 1.2, populationCapacity: 1.1 },
        unlocks: ['advanced_farming', 'marketplace']
      },
      'marketplace': {
        name: 'Marketplace',
        description: 'Establish a central market for trade',
        level: 1,
        costs: { gold: 150, materials: 75 },
        prerequisites: [],
        effects: { tradeIncome: 1.3, merchantPopulation: 1.5 },
        unlocks: ['merchant_guild', 'banking']
      },
      'advanced_farming': {
        name: 'Advanced Farming',
        description: 'Implement advanced agricultural techniques',
        level: 2,
        costs: { gold: 250, materials: 100 },
        prerequisites: ['basic_farming'],
        effects: { foodProduction: 1.5, populationCapacity: 1.3 },
        unlocks: ['irrigation_system']
      },
      'merchant_guild': {
        name: 'Merchant Guild',
        description: 'Organize merchants into a powerful guild',
        level: 2,
        costs: { gold: 300, materials: 50 },
        prerequisites: ['marketplace'],
        effects: { tradeIncome: 1.8, diplomaticRelations: 1.2 },
        unlocks: ['trade_routes']
      }
    }
  });

  static MILITARY_DEVELOPMENT = new DevelopmentTree('military', {
    name: 'Military Development',
    description: 'Strengthen settlement defensive and offensive capabilities',
    treeDefinition: {
      'basic_training': {
        name: 'Basic Military Training',
        description: 'Train citizens in basic combat skills',
        level: 1,
        costs: { gold: 200, materials: 100 },
        prerequisites: [],
        effects: { militaryStrength: 1.3, lawAndOrder: 1.1 },
        unlocks: ['guard_tower', 'weaponsmith']
      },
      'guard_tower': {
        name: 'Guard Tower',
        description: 'Build defensive towers around the settlement',
        level: 2,
        costs: { gold: 400, materials: 200 },
        prerequisites: ['basic_training'],
        effects: { defenseRating: 1.5, security: 1.4 },
        unlocks: ['fortifications']
      }
    }
  });

  /**
   * Get a predefined development tree
   */
  static get(category) {
    switch (category) {
      case 'economic': return DevelopmentTree.ECONOMIC_DEVELOPMENT;
      case 'military': return DevelopmentTree.MILITARY_DEVELOPMENT;
      default: throw new Error(`Unknown development category: ${category}`);
    }
  }

  /**
   * Private methods
   */
  _validateCategory(category) {
    const validCategories = ['economic', 'military', 'cultural', 'infrastructure', 'magical'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}. Must be one of: ${validCategories.join(', ')}`);
    }
  }

  _initializeTree(definition) {
    if (!definition) return;

    Object.entries(definition).forEach(([upgradeId, upgrade]) => {
      // Validate upgrade structure
      this._validateUpgrade(upgradeId, upgrade);

      // Store upgrade definition
      this.nodes.set(upgradeId, {
        id: upgradeId,
        name: upgrade.name,
        description: upgrade.description,
        level: upgrade.level || 1,
        costs: { ...upgrade.costs },
        prerequisites: [...(upgrade.prerequisites || [])],
        effects: { ...upgrade.effects },
        unlocks: [...(upgrade.unlocks || [])]
      });

      // Store dependencies
      this.dependencies.set(upgradeId, [...(upgrade.prerequisites || [])]);

      // Add to level mapping
      const level = upgrade.level || 1;
      if (!this.levels.has(level)) {
        this.levels.set(level, []);
      }
      this.levels.get(level).push(upgradeId);
    });
  }

  _updateAvailableUpgrades() {
    this.availableUpgrades.clear();
    this.lockedUpgrades.clear();

    this.nodes.forEach((upgrade, upgradeId) => {
      if (this.completedUpgrades.has(upgradeId)) {
        return; // Already completed
      }

      const prerequisites = this.dependencies.get(upgradeId) || [];
      const prerequisitesMet = prerequisites.every(prereq =>
        this.completedUpgrades.has(prereq)
      );

      if (prerequisitesMet) {
        this.availableUpgrades.add(upgradeId);
      } else {
        this.lockedUpgrades.add(upgradeId);
      }
    });
  }

  _validateUpgrade(upgradeId, upgrade) {
    if (!upgrade.name || typeof upgrade.name !== 'string') {
      throw new Error(`Upgrade ${upgradeId} must have a valid name`);
    }

    if (!upgrade.costs || typeof upgrade.costs !== 'object') {
      throw new Error(`Upgrade ${upgradeId} must have valid costs`);
    }

    if (upgrade.prerequisites && !Array.isArray(upgrade.prerequisites)) {
      throw new Error(`Upgrade ${upgradeId} prerequisites must be an array`);
    }

    if (upgrade.unlocks && !Array.isArray(upgrade.unlocks)) {
      throw new Error(`Upgrade ${upgradeId} unlocks must be an array`);
    }
  }

  _serializeTreeDefinition() {
    const definition = {};
    this.nodes.forEach((upgrade, upgradeId) => {
      definition[upgradeId] = {
        name: upgrade.name,
        description: upgrade.description,
        level: upgrade.level,
        costs: { ...upgrade.costs },
        prerequisites: [...upgrade.prerequisites],
        effects: { ...upgrade.effects },
        unlocks: [...upgrade.unlocks]
      };
    });
    return definition;
  }
}

export default DevelopmentTree;