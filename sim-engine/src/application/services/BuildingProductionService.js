/**
 * BuildingProductionService - Manages turn-based production in buildings
 * 
 * Processes production recipes, worker contributions, resource consumption,
 * and item generation across all buildings in the simulation.
 */

export class BuildingProductionService {
  constructor(world) {
    this.world = world;
    this.productionEvents = [];
  }

  /**
   * Process production for all buildings in a turn
   */
  processTurnProduction(turn, timeOfDay) {
    this.productionEvents = [];
    const settlements = this.world.settlements || [];

    for (const settlement of settlements) {
      for (const building of (settlement.buildings || [])) {
        this._processBuildingProduction(building, settlement, turn, timeOfDay);
      }
    }

    return {
      success: true,
      turn,
      timeOfDay,
      events: this.productionEvents,
      summary: this._generateProductionSummary()
    };
  }

  /**
   * Start production of a recipe in a building
   */
  startProduction(buildingId, recipeId, options = {}) {
    const building = this._getBuildingById(buildingId);
    
    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    // Check if building can operate
    if (!building.canOperate()) {
      return { 
        success: false, 
        reason: `Building cannot operate (status: ${building.status}, workers: ${building.getWorkerCount()})` 
      };
    }

    // Get the recipe
    const recipe = this._getRecipe(recipeId);
    if (!recipe) {
      return { success: false, reason: 'Recipe not found' };
    }

    // Validate recipe is available for this building type
    const buildingType = this._getBuildingType(building.buildingTypeId);
    if (!this._buildingSupportsRecipe(buildingType, recipe)) {
      return { 
        success: false, 
        reason: `Building type ${buildingType?.name || 'unknown'} doesn't support this recipe` 
      };
    }

    // Check resource availability
    const resourceCheck = this._checkResourceAvailability(building, recipe);
    if (!resourceCheck.available) {
      return { 
        success: false, 
        reason: `Missing resources: ${resourceCheck.missing.join(', ')}` 
      };
    }

    // Consume input resources
    if (!options.skipResourceConsumption) {
      this._consumeResources(building, recipe);
    }

    // Start production in building
    const productionResult = building.startProduction(recipeId, options);
    
    if (!productionResult.success) {
      return productionResult;
    }

    // Log production start
    this.productionEvents.push({
      type: 'production_started',
      buildingId: building.id,
      buildingName: building.name,
      recipeId,
      recipeName: recipe.name,
      timestamp: Date.now()
    });

    return {
      success: true,
      productionId: productionResult.productionId,
      estimatedCompletion: productionResult.estimatedCompletion
    };
  }

  /**
   * Cancel ongoing production in a building
   */
  cancelProduction(buildingId, productionId, options = {}) {
    const building = this._getBuildingById(buildingId);
    
    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    // Find the active production
    const production = building.production.activeRecipes.find(p => p.id === productionId);
    
    if (!production) {
      return { success: false, reason: 'Production not found' };
    }

    // Remove from active recipes
    building.production.activeRecipes = building.production.activeRecipes
      .filter(p => p.id !== productionId);

    // Refund resources if requested
    if (options.refundResources) {
      const recipe = this._getRecipe(production.recipeId);
      if (recipe) {
        this._refundResources(building, recipe, production.progress);
      }
    }

    this.productionEvents.push({
      type: 'production_cancelled',
      buildingId: building.id,
      productionId,
      progress: production.progress,
      timestamp: Date.now()
    });

    return { success: true, refunded: options.refundResources };
  }

  /**
   * Get production status for a building
   */
  getProductionStatus(buildingId) {
    const building = this._getBuildingById(buildingId);
    
    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    const buildingType = this._getBuildingType(building.buildingTypeId);
    const workers = building.getWorkers().map(wId => this._getCharacter(wId));

    return {
      success: true,
      building: {
        id: building.id,
        name: building.name,
        type: buildingType?.name,
        status: building.status,
        operational: building.canOperate()
      },
      workers: {
        count: building.getWorkerCount(),
        capacity: building.workers.capacity,
        efficiency: building.workers.efficiency,
        details: workers.map(w => ({
          id: w?.id,
          name: w?.name,
          contribution: w?.calculateWorkContribution?.() || 1.0,
          skills: w?.jobAssignment?.skills || {}
        }))
      },
      production: {
        active: building.production.activeRecipes.map(p => ({
          id: p.id,
          recipeId: p.recipeId,
          recipeName: this._getRecipe(p.recipeId)?.name,
          progress: p.progress,
          startedTurn: p.startedTurn,
          estimatedCompletion: p.estimatedCompletion
        })),
        queue: building.production.queue,
        history: building.production.history.slice(-10)
      },
      storage: {
        contents: building.storage.contents,
        capacity: building.storage.capacity,
        usage: this._calculateStorageUsage(building)
      }
    };
  }

  /**
   * Process production for a single building
   * @private
   */
  _processBuildingProduction(building, settlement, turn, timeOfDay) {
    // Skip if building is not operational
    if (!building.canOperate()) {
      return;
    }

    // Only process production during work shifts (morning/midday)
    if (timeOfDay !== 'morning' && timeOfDay !== 'midday') {
      return;
    }

    // Process each active recipe
    for (const activeProduction of building.production.activeRecipes) {
      this._processActiveProduction(building, activeProduction, settlement, turn, timeOfDay);
    }

    // Auto-start queued recipes if slots available
    this._processProductionQueue(building, settlement, turn);
  }

  /**
   * Process a single active production
   * @private
   */
  _processActiveProduction(building, activeProduction, settlement, turn, timeOfDay) {
    const recipe = this._getRecipe(activeProduction.recipeId);
    
    if (!recipe) {
      console.warn(`Recipe ${activeProduction.recipeId} not found for building ${building.id}`);
      return;
    }

    // Calculate production progress for this turn
    const progressDelta = this._calculateProductionProgress(building, recipe, timeOfDay);
    
    // Update progress
    const updateResult = building.updateProductionProgress(
      activeProduction.id,
      progressDelta,
      turn
    );

    if (!updateResult.success) {
      return;
    }

    // Check if production is complete
    if (updateResult.completed) {
      this._completeProduction(building, activeProduction, recipe, settlement, turn);
    } else {
      // Log progress event
      this.productionEvents.push({
        type: 'production_progress',
        buildingId: building.id,
        productionId: activeProduction.id,
        recipeId: recipe.id,
        progress: activeProduction.progress,
        progressDelta,
        turn,
        timeOfDay
      });
    }
  }

  /**
   * Complete a production and generate output items
   * @private
   */
  _completeProduction(building, production, recipe, settlement, turn) {
    // Calculate output quality based on workers and building
    const quality = this._calculateOutputQuality(building, recipe);
    
    // Calculate output quantities
    const outputs = this._calculateOutputQuantities(building, recipe, quality);
    
    // Generate byproducts
    const byproducts = this._generateByproducts(recipe, quality);

    // Add items to building storage
    const addedItems = [];
    for (const output of outputs) {
      const item = this._createItem(output.itemId, output.quantity, quality);
      this._addToStorage(building, item);
      addedItems.push(item);
    }

    for (const byproduct of byproducts) {
      const item = this._createItem(byproduct.itemId, byproduct.quantity, byproduct.quality);
      this._addToStorage(building, item);
      addedItems.push(item);
    }

    // Complete in building entity
    building.completeProduction(production.id, turn);

    // Update workers' skills
    this._updateWorkerSkills(building, recipe);

    // Log completion event
    this.productionEvents.push({
      type: 'production_completed',
      buildingId: building.id,
      buildingName: building.name,
      settlementId: settlement.id,
      settlementName: settlement.name,
      productionId: production.id,
      recipeId: recipe.id,
      recipeName: recipe.name,
      quality,
      outputs: addedItems,
      turn
    });
  }

  /**
   * Process the production queue
   * @private
   */
  _processProductionQueue(building, settlement, turn) {
    // Check if there are queue slots and queue items
    while (building.production.queue.length > 0 && 
           building.production.activeRecipes.length < building.production.maxActiveRecipes) {
      
      const queuedRecipe = building.production.queue.shift();
      
      // Try to start this queued production
      const result = this.startProduction(building.id, queuedRecipe.recipeId, {
        quantity: queuedRecipe.quantity,
        priority: queuedRecipe.priority
      });

      if (!result.success) {
        // Can't start, put it back in queue
        building.production.queue.unshift(queuedRecipe);
        break;
      }
    }
  }

  /**
   * Calculate production progress for a turn
   * @private
   */
  _calculateProductionProgress(building, recipe, timeOfDay) {
    // Base progress: 1 turn of work
    let progress = 1.0;

    // Building efficiency modifier
    progress *= building.workers.efficiency;

    // Building type production speed bonus
    const buildingType = this._getBuildingType(building.buildingTypeId);
    if (buildingType?.production?.speedMultiplier) {
      progress *= buildingType.production.speedMultiplier;
    }

    // Worker contribution (average of all workers)
    const workers = building.getWorkers().map(wId => this._getCharacter(wId)).filter(w => w);
    if (workers.length > 0) {
      const avgContribution = workers.reduce((sum, w) => {
        const contribution = w.calculateWorkContribution?.(recipe.skill) || 1.0;
        return sum + contribution;
      }, 0) / workers.length;
      
      progress *= avgContribution;
    }

    // Time of day modifier (midday = peak productivity)
    if (timeOfDay === 'midday') {
      progress *= 1.1; // 10% bonus during midday
    } else if (timeOfDay === 'morning') {
      progress *= 0.95; // 5% reduction in morning
    }

    // Recipe complexity affects progress
    const complexity = recipe.productionTime / 10; // Normalize
    progress /= Math.max(1, complexity);

    return Math.max(0.01, progress); // Minimum progress
  }

  /**
   * Calculate output quality (0.0 to 1.0, where 1.0 is perfect)
   * @private
   */
  _calculateOutputQuality(building, recipe) {
    let quality = 0.7; // Base quality

    // Worker skill contribution
    const workers = building.getWorkers().map(wId => this._getCharacter(wId)).filter(w => w);
    if (workers.length > 0 && recipe.skill) {
      const avgSkill = workers.reduce((sum, w) => {
        const skillLevel = w.getJobSkill?.(recipe.skill) || 0;
        return sum + skillLevel;
      }, 0) / workers.length;
      
      quality += avgSkill * 0.015; // +1.5% per skill level
    }

    // Building efficiency
    quality += (building.workers.efficiency - 1.0) * 0.2; // Efficiency bonus

    // Building maintenance affects quality
    const healthRatio = building.maintenance.health / 100;
    quality *= (0.7 + healthRatio * 0.3); // 70-100% quality based on health

    // Random variation
    quality += (Math.random() * 0.1 - 0.05); // ±5% random

    // Clamp to valid range
    return Math.max(0.1, Math.min(1.0, quality));
  }

  /**
   * Calculate output quantities based on recipe and quality
   * @private
   */
  _calculateOutputQuantities(building, recipe, quality) {
    const outputs = [];

    for (const output of recipe.outputs) {
      let quantity = output.quantity;

      // Quality affects yield
      if (quality >= 0.9) {
        quantity *= 1.1; // 10% bonus for high quality
      } else if (quality < 0.5) {
        quantity *= 0.9; // 10% reduction for low quality
      }

      // Building production bonuses
      const buildingType = this._getBuildingType(building.buildingTypeId);
      const bonus = buildingType?.production?.bonuses?.find(b => 
        b.itemType === output.itemId || b.category === output.category
      );
      
      if (bonus) {
        quantity *= (1 + bonus.multiplier);
      }

      // Random variation (±10%)
      quantity *= (0.9 + Math.random() * 0.2);

      outputs.push({
        itemId: output.itemId,
        quantity: Math.max(1, Math.floor(quantity))
      });
    }

    return outputs;
  }

  /**
   * Generate byproducts based on recipe and quality
   * @private
   */
  _generateByproducts(recipe, quality) {
    const byproducts = [];

    for (const byproduct of (recipe.byproducts || [])) {
      // Byproduct chance affected by quality
      const chance = byproduct.chance * (0.8 + quality * 0.4); // 80%-120% of base chance
      
      if (Math.random() < chance) {
        byproducts.push({
          itemId: byproduct.itemId,
          quantity: byproduct.quantity,
          quality: quality * 0.8 // Byproducts are typically lower quality
        });
      }
    }

    return byproducts;
  }

  /**
   * Update worker skills based on production completion
   * @private
   */
  _updateWorkerSkills(building, recipe) {
    if (!recipe.skill) return;

    const workers = building.getWorkers().map(wId => this._getCharacter(wId)).filter(w => w);
    
    for (const worker of workers) {
      // Grant skill XP
      const currentLevel = worker.getJobSkill?.(recipe.skill) || 0;
      const xpGain = 1 + (recipe.productionTime / 20); // More XP for complex recipes
      
      // Skill gain diminishes at higher levels
      const levelDiminish = Math.max(0.1, 1 - currentLevel * 0.03);
      const finalXp = xpGain * levelDiminish;

      worker.updateJobSkill?.(recipe.skill, finalXp);
    }
  }

  /**
   * Check if building has required resources for recipe
   * @private
   */
  _checkResourceAvailability(building, recipe) {
    const missing = [];

    for (const input of recipe.inputs) {
      const available = building.storage.contents[input.itemId] || 0;
      
      if (available < input.quantity) {
        missing.push(`${input.itemId} (need ${input.quantity}, have ${available})`);
      }
    }

    return {
      available: missing.length === 0,
      missing
    };
  }

  /**
   * Consume input resources from building storage
   * @private
   */
  _consumeResources(building, recipe) {
    for (const input of recipe.inputs) {
      const current = building.storage.contents[input.itemId] || 0;
      building.storage.contents[input.itemId] = Math.max(0, current - input.quantity);
    }
  }

  /**
   * Refund resources (partial refund based on progress)
   * @private
   */
  _refundResources(building, recipe, progress) {
    const refundRatio = 1 - (progress / 100); // Refund remaining portion

    for (const input of recipe.inputs) {
      const refundAmount = Math.floor(input.quantity * refundRatio);
      building.storage.contents[input.itemId] = 
        (building.storage.contents[input.itemId] || 0) + refundAmount;
    }
  }

  /**
   * Add item to building storage
   * @private
   */
  _addToStorage(building, item) {
    building.storage.contents[item.id] = 
      (building.storage.contents[item.id] || 0) + item.quantity;
  }

  /**
   * Create an item instance
   * @private
   */
  _createItem(itemId, quantity, quality) {
    return {
      id: itemId,
      quantity: Math.floor(quantity),
      quality: Math.round(quality * 100), // Store as 0-100
      createdAt: Date.now()
    };
  }

  /**
   * Check if building type supports a recipe
   * @private
   */
  _buildingSupportsRecipe(buildingType, recipe) {
    if (!buildingType || !recipe) return false;

    // Check if recipe is in building's recipe list
    const recipeIds = buildingType.production?.recipes || [];
    return recipeIds.includes(recipe.id);
  }

  /**
   * Calculate storage usage percentage
   * @private
   */
  _calculateStorageUsage(building) {
    const total = Object.values(building.storage.contents)
      .reduce((sum, qty) => sum + qty, 0);
    
    return building.storage.capacity > 0 
      ? (total / building.storage.capacity) * 100 
      : 0;
  }

  /**
   * Generate production summary for turn
   * @private
   */
  _generateProductionSummary() {
    const summary = {
      totalProductionStarts: 0,
      totalProductionCompletions: 0,
      totalProductionCancellations: 0,
      itemsProduced: {},
      buildingsActive: new Set()
    };

    for (const event of this.productionEvents) {
      if (event.type === 'production_started') {
        summary.totalProductionStarts++;
        summary.buildingsActive.add(event.buildingId);
      } else if (event.type === 'production_completed') {
        summary.totalProductionCompletions++;
        summary.buildingsActive.add(event.buildingId);
        
        // Count items produced
        for (const output of event.outputs) {
          summary.itemsProduced[output.id] = 
            (summary.itemsProduced[output.id] || 0) + output.quantity;
        }
      } else if (event.type === 'production_cancelled') {
        summary.totalProductionCancellations++;
      }
    }

    summary.buildingsActive = summary.buildingsActive.size;

    return summary;
  }

  /**
   * Helper: Get character from world
   */
  _getCharacter(characterId) {
    return this.world.characters?.find(c => c.id === characterId) || null;
  }

  /**
   * Helper: Get building from world
   */
  _getBuildingById(buildingId) {
    for (const settlement of (this.world.settlements || [])) {
      const building = settlement.buildings?.find(b => b.id === buildingId);
      if (building) return building;
    }
    return null;
  }

  /**
   * Helper: Get building type
   */
  _getBuildingType(buildingTypeId) {
    return this.world.buildingTypes?.find(bt => bt.id === buildingTypeId) || null;
  }

  /**
   * Helper: Get recipe
   */
  _getRecipe(recipeId) {
    return this.world.productionRecipes?.find(r => r.id === recipeId) || null;
  }
}

export default BuildingProductionService;
