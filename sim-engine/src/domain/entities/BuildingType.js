/**
 * BuildingType - Entity representing a type of building that can be constructed
 * 
 * Defines buildings that produce goods, provide services, or enable settlement functions.
 * Supports worker assignments, production recipes, upgrades, and maintenance costs.
 */

export class BuildingType {
  constructor(data = {}) {
    this.id = data.id || this._generateId();
    this.name = data.name || 'Unnamed Building';
    this.description = data.description || '';
    this.category = data.category || 'general'; // production, service, defense, civic, residential, special
    
    // Visual properties
    this.icon = data.icon || '🏢';
    this.color = data.color || 'gray';
    
    // Construction
    this.constructionCost = data.constructionCost || {
      resources: [], // [{ resourceType: 'wood', quantity: 10 }]
      gold: 0,
      constructionTime: 1 // turns
    };
    
    // Prerequisites
    this.prerequisites = data.prerequisites || {
      settlementLevel: 0,
      population: 0,
      buildings: [], // Required building types
      technologies: [], // Required tech/discoveries
      reputation: null
    };
    
    // Worker capacity
    this.workerCapacity = data.workerCapacity || {
      min: 1, // Minimum workers to operate
      max: 5, // Maximum workers that can be assigned
      optimal: 3, // Optimal worker count for efficiency
      efficiency: { // Efficiency curve
        underStaffed: 0.5, // < min workers
        optimal: 1.0, // at optimal workers
        overStaffed: 0.8 // > optimal workers
      }
    };
    
    // Production configuration
    this.production = data.production || {
      enabled: false,
      recipes: [], // Array of ProductionRecipe IDs this building can use
      simultaneousRecipes: 1, // How many recipes can run at once
      productionBonus: 0, // Base production bonus percentage
      qualityBonus: 0, // Quality improvement bonus
      speedMultiplier: 1.0 // Production speed modifier
    };
    
    // Service configuration (for non-production buildings)
    this.service = data.service || {
      enabled: false,
      type: null, // 'training', 'healing', 'entertainment', 'research', 'storage'
      capacity: 0, // How many can be served per turn
      effects: [] // Effects provided to users/settlement
    };
    
    // Storage capacity
    this.storage = data.storage || {
      enabled: false,
      capacity: 0, // Total storage units
      categories: [], // Resource categories that can be stored
      preservationBonus: 0 // Reduces spoilage rate
    };
    
    // Maintenance
    this.maintenance = data.maintenance || {
      resources: [], // [{ resourceType: 'wood', quantity: 1, perTurns: 10 }]
      gold: 0, // Gold per turn
      workers: 0 // Worker hours per turn for maintenance
    };
    
    // Upgrades
    this.upgrades = data.upgrades || {
      enabled: true,
      maxLevel: 5,
      levelBenefits: [] // [{ level: 2, benefits: { productionBonus: 0.1 } }]
    };
    
    // Building stats by level
    this.levelStats = data.levelStats || this._generateDefaultLevelStats();
    
    // Space and placement
    this.placement = data.placement || {
      size: 1, // Space units required
      terrainTypes: [], // Allowed terrain types (empty = any)
      exclusive: false, // Can only have one per settlement
      adjacencyRules: [] // Buildings that should/shouldn't be adjacent
    };
    
    // Effects on settlement
    this.settlementEffects = data.settlementEffects || {
      populationCapacity: 0,
      happinessModifier: 0,
      defenseBonus: 0,
      prestigeGain: 0,
      cultureGeneration: 0
    };
    
    // Environmental requirements
    this.environmentalRequirements = data.environmentalRequirements || {
      climate: [], // Allowed climates (empty = any)
      nearResource: null, // Must be near specific resource
      nearWater: false,
      nearForest: false
    };
    
    // Automation settings
    this.automation = data.automation || {
      autoAssignWorkers: true,
      autoSelectRecipes: false,
      priorityScore: 5 // 1-10, for AI decision making
    };
    
    // Classification
    this.tags = data.tags || [];
    this.rarity = data.rarity || 'common'; // common, uncommon, rare, unique
    
    // Metadata
    this.isTemplate = data.isTemplate || false;
    this.author = data.author || null;
    this.version = data.version || '1.0.0';
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }
  
  /**
   * Generate unique ID
   */
  _generateId() {
    return `building_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate default level stats
   */
  _generateDefaultLevelStats() {
    const stats = [];
    for (let level = 1; level <= 5; level++) {
      stats.push({
        level,
        productionBonus: (level - 1) * 0.15,
        qualityBonus: (level - 1) * 0.1,
        speedMultiplier: 1.0 + ((level - 1) * 0.1),
        workerCapacityMax: this.workerCapacity?.max + (level - 1),
        maintenanceCost: 1.0 + ((level - 1) * 0.2),
        upgradeFromPreviousCost: {
          resources: [],
          gold: level * 100,
          constructionTime: level
        }
      });
    }
    return stats;
  }
  
  /**
   * Get stats for specific level
   */
  getStatsForLevel(level) {
    return this.levelStats.find(s => s.level === level) || this.levelStats[0];
  }
  
  /**
   * Calculate construction cost for specific level
   */
  getConstructionCost(level = 1) {
    if (level === 1) {
      return this.constructionCost;
    }
    
    const stats = this.getStatsForLevel(level);
    return stats?.upgradeFromPreviousCost || this.constructionCost;
  }
  
  /**
   * Check if prerequisites are met
   */
  canConstruct(context = {}) {
    const reasons = [];
    
    // Check settlement level
    if (context.settlementLevel < this.prerequisites.settlementLevel) {
      reasons.push(`Requires settlement level ${this.prerequisites.settlementLevel}`);
    }
    
    // Check population
    if (context.population < this.prerequisites.population) {
      reasons.push(`Requires ${this.prerequisites.population} population`);
    }
    
    // Check required buildings
    const missingBuildings = this.prerequisites.buildings.filter(
      b => !context.existingBuildings?.includes(b)
    );
    if (missingBuildings.length > 0) {
      reasons.push(`Requires buildings: ${missingBuildings.join(', ')}`);
    }
    
    // Check exclusive placement
    if (this.placement.exclusive && context.existingBuildings?.includes(this.id)) {
      reasons.push('Only one allowed per settlement');
    }
    
    return {
      canConstruct: reasons.length === 0,
      reasons
    };
  }
  
  /**
   * Check if resources are available for construction
   */
  canAfford(availableResources = {}, availableGold = 0, level = 1) {
    const cost = this.getConstructionCost(level);
    const reasons = [];
    
    // Check resource costs
    cost.resources.forEach(req => {
      const available = availableResources[req.resourceType] || 0;
      if (available < req.quantity) {
        reasons.push(`Need ${req.quantity} ${req.resourceType}, have ${available}`);
      }
    });
    
    // Check gold cost
    if (availableGold < cost.gold) {
      reasons.push(`Need ${cost.gold} gold, have ${availableGold}`);
    }
    
    return {
      canAfford: reasons.length === 0,
      reasons
    };
  }
  
  /**
   * Calculate efficiency based on worker count
   */
  calculateEfficiency(workerCount) {
    if (workerCount < this.workerCapacity.min) {
      return this.workerCapacity.efficiency.underStaffed;
    } else if (workerCount === this.workerCapacity.optimal) {
      return this.workerCapacity.efficiency.optimal;
    } else if (workerCount > this.workerCapacity.optimal) {
      return this.workerCapacity.efficiency.overStaffed;
    } else {
      // Linear interpolation between min and optimal
      const range = this.workerCapacity.optimal - this.workerCapacity.min;
      const position = workerCount - this.workerCapacity.min;
      const ratio = position / range;
      return this.workerCapacity.efficiency.underStaffed + 
        (ratio * (this.workerCapacity.efficiency.optimal - this.workerCapacity.efficiency.underStaffed));
    }
  }
  
  /**
   * Get production recipes this building can use
   */
  getAvailableRecipes() {
    return this.production.recipes || [];
  }
  
  /**
   * Check if building can use a specific recipe
   */
  canUseRecipe(recipeId) {
    return this.production.enabled && this.production.recipes.includes(recipeId);
  }
  
  /**
   * Calculate total maintenance cost
   */
  calculateMaintenanceCost(level = 1) {
    const stats = this.getStatsForLevel(level);
    const multiplier = stats?.maintenanceCost || 1.0;
    
    return {
      resources: this.maintenance.resources.map(r => ({
        ...r,
        quantity: Math.ceil(r.quantity * multiplier)
      })),
      gold: Math.ceil(this.maintenance.gold * multiplier),
      workers: this.maintenance.workers
    };
  }
  
  /**
   * Get upgrade cost to next level
   */
  getUpgradeCost(currentLevel) {
    if (currentLevel >= this.upgrades.maxLevel) {
      return null;
    }
    
    const nextLevel = currentLevel + 1;
    return this.getConstructionCost(nextLevel);
  }
  
  /**
   * Validate building type data
   */
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Building name is required');
    }
    
    if (this.workerCapacity.min > this.workerCapacity.max) {
      errors.push('Minimum workers cannot exceed maximum workers');
    }
    
    if (this.workerCapacity.optimal > this.workerCapacity.max) {
      errors.push('Optimal workers cannot exceed maximum workers');
    }
    
    if (this.production.enabled && this.production.recipes.length === 0) {
      errors.push('Production enabled but no recipes specified');
    }
    
    if (this.service.enabled && !this.service.type) {
      errors.push('Service enabled but no service type specified');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Clone building type
   */
  clone() {
    return new BuildingType(this.toJSON());
  }
  
  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      icon: this.icon,
      color: this.color,
      constructionCost: { ...this.constructionCost },
      prerequisites: { ...this.prerequisites },
      workerCapacity: { ...this.workerCapacity },
      production: { ...this.production },
      service: { ...this.service },
      storage: { ...this.storage },
      maintenance: { ...this.maintenance },
      upgrades: { ...this.upgrades },
      levelStats: this.levelStats.map(s => ({ ...s })),
      placement: { ...this.placement },
      settlementEffects: { ...this.settlementEffects },
      environmentalRequirements: { ...this.environmentalRequirements },
      automation: { ...this.automation },
      tags: [...this.tags],
      rarity: this.rarity,
      isTemplate: this.isTemplate,
      author: this.author,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  /**
   * Create from JSON
   */
  static fromJSON(data) {
    return new BuildingType(data);
  }
}

export default BuildingType;
