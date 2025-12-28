/**
 * Building - Entity representing an active building instance in a settlement
 * 
 * This is a building instance (e.g., "The Iron Forge of Riverdale")
 * while BuildingType is the template (e.g., "Blacksmith")
 * 
 * Manages workers, production state, maintenance, and upgrades.
 */

export class Building {
  constructor(data = {}) {
    this.id = data.id || this._generateId();
    this.buildingTypeId = data.buildingTypeId; // Reference to BuildingType
    this.name = data.name || null; // Custom name (optional)
    this.settlementId = data.settlementId;
    
    // Building state
    this.level = data.level || 1;
    this.status = data.status || 'active'; // active, under_construction, damaged, disabled, upgrading
    this.constructionProgress = data.constructionProgress || 0; // 0-1 for construction/upgrades
    this.constructionStartTurn = data.constructionStartTurn || null;
    
    // Worker management
    this.workers = data.workers || {
      assigned: [], // Character IDs currently working here
      capacity: { min: 1, max: 5, optimal: 3 },
      shifts: [], // [{ shiftId, workerIds[], timeOfDay }]
      efficiency: 1.0, // Current efficiency based on worker count
      skillLevels: {} // { skillName: averageLevel }
    };
    
    // Production state
    this.production = data.production || {
      enabled: false,
      activeRecipes: [], // [{ recipeId, progress: 0-1, startTurn, workerIds[] }]
      queue: [], // [{ recipeId, quantity, priority }]
      history: [], // Recent production completions
      totalProduced: {}, // { itemId: quantity }
      efficiency: 1.0,
      qualityAverage: 3.0
    };
    
    // Resource storage (if building has storage capacity)
    this.storage = data.storage || {
      enabled: false,
      contents: {}, // { resourceType: quantity }
      capacity: 0,
      reserved: {} // Reserved for active recipes
    };
    
    // Maintenance state
    this.maintenance = data.maintenance || {
      health: 100, // 0-100, degrades over time
      lastMaintained: null,
      maintenanceDue: false,
      repairCost: null,
      degradationRate: 1 // Points per turn
    };
    
    // Economic tracking
    this.economics = data.economics || {
      constructionCost: 0,
      totalMaintenancePaid: 0,
      totalProductionValue: 0,
      totalWorkerWages: 0,
      profitability: 0 // production value - costs
    };
    
    // Upgrades
    this.upgrades = data.upgrades || {
      upgradeHistory: [], // [{ level, completedTurn, cost }]
      canUpgrade: true,
      nextUpgradeCost: null
    };
    
    // Activity log
    this.activityLog = data.activityLog || [];
    /*
      [{
        turn: Number,
        type: 'construction' | 'production' | 'maintenance' | 'upgrade' | 'worker_change',
        description: String,
        data: Object
      }]
    */
    
    // Metadata
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
   * Assign a worker to this building
   */
  assignWorker(characterId, shift = null) {
    if (this.workers.assigned.includes(characterId)) {
      return { success: false, reason: 'Worker already assigned' };
    }
    
    if (this.workers.assigned.length >= this.workers.capacity.max) {
      return { success: false, reason: 'Building at maximum worker capacity' };
    }
    
    this.workers.assigned.push(characterId);
    this._recalculateEfficiency();
    
    this.logActivity('worker_change', `Worker ${characterId} assigned`, {
      workerId: characterId,
      shift,
      totalWorkers: this.workers.assigned.length
    });
    
    return { success: true };
  }
  
  /**
   * Remove a worker from this building
   */
  unassignWorker(characterId) {
    const index = this.workers.assigned.indexOf(characterId);
    if (index === -1) {
      return { success: false, reason: 'Worker not assigned to this building' };
    }
    
    this.workers.assigned.splice(index, 1);
    this._recalculateEfficiency();
    
    this.logActivity('worker_change', `Worker ${characterId} unassigned`, {
      workerId: characterId,
      totalWorkers: this.workers.assigned.length
    });
    
    return { success: true };
  }
  
  /**
   * Get all assigned workers
   */
  getWorkers() {
    return [...this.workers.assigned];
  }
  
  /**
   * Get worker count
   */
  getWorkerCount() {
    return this.workers.assigned.length;
  }
  
  /**
   * Check if building can operate (has minimum workers)
   */
  canOperate() {
    return this.workers.assigned.length >= this.workers.capacity.min &&
           this.status === 'active' &&
           this.maintenance.health > 0;
  }
  
  /**
   * Recalculate production efficiency based on worker count
   */
  _recalculateEfficiency() {
    const workerCount = this.workers.assigned.length;
    const { min, optimal, max } = this.workers.capacity;
    
    if (workerCount < min) {
      // Under-staffed: 50% efficiency or less
      this.workers.efficiency = workerCount / min * 0.5;
    } else if (workerCount <= optimal) {
      // Ramping up to optimal: 50% to 100%
      const range = optimal - min;
      const position = workerCount - min;
      this.workers.efficiency = 0.5 + (position / range * 0.5);
    } else if (workerCount <= max) {
      // Over optimal but within max: 100% to 80%
      const range = max - optimal;
      const position = workerCount - optimal;
      this.workers.efficiency = 1.0 - (position / range * 0.2);
    } else {
      // Over capacity (shouldn't happen, but handle it)
      this.workers.efficiency = 0.7;
    }
    
    this.production.efficiency = this.workers.efficiency;
  }
  
  /**
   * Start production of a recipe
   */
  startProduction(recipeId, buildingType) {
    if (!this.canOperate()) {
      return { 
        success: false, 
        reason: `Building cannot operate: ${this.getOperationalStatus()}` 
      };
    }
    
    if (!this.production.enabled) {
      return { success: false, reason: 'Production not enabled for this building' };
    }
    
    // Check if building can use this recipe
    if (buildingType && !buildingType.production.recipes.includes(recipeId)) {
      return { 
        success: false, 
        reason: 'This building type cannot use this recipe' 
      };
    }
    
    // Check if we can run another recipe simultaneously
    if (this.production.activeRecipes.length >= (buildingType?.production.simultaneousRecipes || 1)) {
      return { 
        success: false, 
        reason: 'Building already at maximum simultaneous production' 
      };
    }
    
    const activeRecipe = {
      recipeId,
      progress: 0,
      startTurn: null, // Set by TurnManager
      workerIds: [...this.workers.assigned],
      qualityFactors: {
        workerSkill: this._calculateAverageSkill(),
        buildingLevel: this.level,
        toolQuality: 1.0 // TODO: Calculate from tools
      }
    };
    
    this.production.activeRecipes.push(activeRecipe);
    
    this.logActivity('production', `Started production: ${recipeId}`, {
      recipeId,
      workers: activeRecipe.workerIds.length
    });
    
    return { success: true, activeRecipe };
  }
  
  /**
   * Cancel active production
   */
  cancelProduction(recipeId) {
    const index = this.production.activeRecipes.findIndex(r => r.recipeId === recipeId);
    if (index === -1) {
      return { success: false, reason: 'Recipe not in production' };
    }
    
    const recipe = this.production.activeRecipes[index];
    this.production.activeRecipes.splice(index, 1);
    
    this.logActivity('production', `Cancelled production: ${recipeId}`, {
      recipeId,
      progress: recipe.progress
    });
    
    return { success: true, progress: recipe.progress };
  }
  
  /**
   * Get production progress for a recipe
   */
  getProductionProgress(recipeId) {
    const recipe = this.production.activeRecipes.find(r => r.recipeId === recipeId);
    return recipe?.progress || 0;
  }
  
  /**
   * Update production progress (called by TurnManager)
   */
  updateProductionProgress(recipeId, progressDelta) {
    const recipe = this.production.activeRecipes.find(r => r.recipeId === recipeId);
    if (!recipe) return false;
    
    recipe.progress = Math.min(1.0, recipe.progress + progressDelta);
    return recipe.progress >= 1.0;
  }
  
  /**
   * Complete production and record history
   */
  completeProduction(recipeId, output) {
    const index = this.production.activeRecipes.findIndex(r => r.recipeId === recipeId);
    if (index === -1) return false;
    
    const recipe = this.production.activeRecipes.splice(index, 1)[0];
    
    // Record in history
    this.production.history.unshift({
      recipeId,
      completedTurn: null, // Set by TurnManager
      output,
      quality: output.quality || 3,
      workers: recipe.workerIds.length,
      efficiency: this.production.efficiency
    });
    
    // Keep only last 20 productions
    if (this.production.history.length > 20) {
      this.production.history = this.production.history.slice(0, 20);
    }
    
    // Update totals
    if (output.itemId) {
      this.production.totalProduced[output.itemId] = 
        (this.production.totalProduced[output.itemId] || 0) + (output.quantity || 1);
    }
    
    // Update quality average
    const recentQualities = this.production.history.slice(0, 10).map(h => h.quality);
    this.production.qualityAverage = 
      recentQualities.reduce((sum, q) => sum + q, 0) / recentQualities.length;
    
    this.logActivity('production', `Completed production: ${recipeId}`, {
      recipeId,
      output,
      quality: output.quality
    });
    
    return true;
  }
  
  /**
   * Calculate average worker skill
   */
  _calculateAverageSkill() {
    // This will be enhanced when Character entity has skills
    // For now, return a default value
    return 5; // Assume average skill level of 5
  }
  
  /**
   * Get operational status message
   */
  getOperationalStatus() {
    if (this.status !== 'active') {
      return `Building status: ${this.status}`;
    }
    if (this.maintenance.health <= 0) {
      return 'Building health at 0%';
    }
    if (this.workers.assigned.length < this.workers.capacity.min) {
      return `Need ${this.workers.capacity.min - this.workers.assigned.length} more workers`;
    }
    return 'Operational';
  }
  
  /**
   * Degrade building health (called per turn)
   */
  degradeHealth(amount = null) {
    const degradation = amount || this.maintenance.degradationRate;
    this.maintenance.health = Math.max(0, this.maintenance.health - degradation);
    
    if (this.maintenance.health <= 25 && !this.maintenance.maintenanceDue) {
      this.maintenance.maintenanceDue = true;
      this.logActivity('maintenance', 'Maintenance required', {
        health: this.maintenance.health
      });
    }
    
    return this.maintenance.health;
  }
  
  /**
   * Perform maintenance
   */
  performMaintenance() {
    this.maintenance.health = Math.min(100, this.maintenance.health + 50);
    this.maintenance.lastMaintained = Date.now();
    this.maintenance.maintenanceDue = false;
    
    this.logActivity('maintenance', 'Maintenance performed', {
      health: this.maintenance.health
    });
    
    return this.maintenance.health;
  }
  
  /**
   * Start construction (for new buildings)
   */
  startConstruction(buildingType, turn) {
    this.status = 'under_construction';
    this.constructionProgress = 0;
    this.constructionStartTurn = turn;
    
    this.logActivity('construction', 'Construction started', {
      buildingType: buildingType.name,
      estimatedTurns: buildingType.constructionCost.constructionTime
    });
  }
  
  /**
   * Update construction progress
   */
  updateConstructionProgress(delta) {
    this.constructionProgress = Math.min(1.0, this.constructionProgress + delta);
    
    if (this.constructionProgress >= 1.0) {
      this.completeConstruction();
    }
    
    return this.constructionProgress;
  }
  
  /**
   * Complete construction
   */
  completeConstruction() {
    this.status = 'active';
    this.constructionProgress = 1.0;
    this.maintenance.health = 100;
    
    this.logActivity('construction', 'Construction completed', {
      level: this.level
    });
  }
  
  /**
   * Start upgrade to next level
   */
  startUpgrade(turn) {
    this.status = 'upgrading';
    this.constructionProgress = 0;
    this.constructionStartTurn = turn;
    
    this.logActivity('upgrade', `Upgrading to level ${this.level + 1}`, {
      currentLevel: this.level
    });
  }
  
  /**
   * Complete upgrade
   */
  completeUpgrade() {
    this.level += 1;
    this.status = 'active';
    this.constructionProgress = 0;
    this.maintenance.health = 100;
    
    this.upgrades.upgradeHistory.push({
      level: this.level,
      completedTurn: null, // Set by TurnManager
      cost: this.upgrades.nextUpgradeCost
    });
    
    this.logActivity('upgrade', `Upgraded to level ${this.level}`, {
      level: this.level
    });
  }
  
  /**
   * Log activity
   */
  logActivity(type, description, data = {}) {
    this.activityLog.unshift({
      turn: null, // Set by TurnManager
      type,
      description,
      data,
      timestamp: Date.now()
    });
    
    // Keep only last 50 activities
    if (this.activityLog.length > 50) {
      this.activityLog = this.activityLog.slice(0, 50);
    }
    
    this.updatedAt = Date.now();
  }
  
  /**
   * Get recent activity
   */
  getRecentActivity(count = 10) {
    return this.activityLog.slice(0, count);
  }
  
  /**
   * Validate building state
   */
  validate() {
    const errors = [];
    
    if (!this.buildingTypeId) {
      errors.push('Building type ID is required');
    }
    
    if (!this.settlementId) {
      errors.push('Settlement ID is required');
    }
    
    if (this.level < 1) {
      errors.push('Building level must be at least 1');
    }
    
    if (this.maintenance.health < 0 || this.maintenance.health > 100) {
      errors.push('Health must be between 0 and 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Clone building
   */
  clone() {
    return new Building(this.toJSON());
  }
  
  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      buildingTypeId: this.buildingTypeId,
      name: this.name,
      settlementId: this.settlementId,
      level: this.level,
      status: this.status,
      constructionProgress: this.constructionProgress,
      constructionStartTurn: this.constructionStartTurn,
      workers: {
        assigned: [...this.workers.assigned],
        capacity: { ...this.workers.capacity },
        shifts: this.workers.shifts.map(s => ({ ...s })),
        efficiency: this.workers.efficiency,
        skillLevels: { ...this.workers.skillLevels }
      },
      production: {
        enabled: this.production.enabled,
        activeRecipes: this.production.activeRecipes.map(r => ({ ...r })),
        queue: this.production.queue.map(q => ({ ...q })),
        history: this.production.history.slice(0, 20).map(h => ({ ...h })),
        totalProduced: { ...this.production.totalProduced },
        efficiency: this.production.efficiency,
        qualityAverage: this.production.qualityAverage
      },
      storage: {
        enabled: this.storage.enabled,
        contents: { ...this.storage.contents },
        capacity: this.storage.capacity,
        reserved: { ...this.storage.reserved }
      },
      maintenance: { ...this.maintenance },
      economics: { ...this.economics },
      upgrades: {
        upgradeHistory: this.upgrades.upgradeHistory.map(u => ({ ...u })),
        canUpgrade: this.upgrades.canUpgrade,
        nextUpgradeCost: this.upgrades.nextUpgradeCost
      },
      activityLog: this.activityLog.slice(0, 50).map(a => ({ ...a })),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  /**
   * Create from JSON
   */
  static fromJSON(data) {
    return new Building(data);
  }
}

export default Building;
