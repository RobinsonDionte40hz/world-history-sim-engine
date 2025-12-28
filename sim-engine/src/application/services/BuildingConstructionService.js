/**
 * BuildingConstructionService - Manages building construction and upgrades
 * 
 * Handles building purchases, construction progress, resource costs,
 * upgrade management, and settlement building placement.
 */

import { Building } from '../../domain/entities/Building.js';

export class BuildingConstructionService {
  constructor(world, storageService = null) {
    this.world = world;
    this.storageService = storageService;
    this.constructionEvents = [];
  }

  /**
   * Start construction of a new building
   */
  startConstruction(settlementId, buildingTypeId, options = {}) {
    const settlement = this._getSettlement(settlementId);
    const buildingType = this._getBuildingType(buildingTypeId);

    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    if (!buildingType) {
      return { success: false, reason: 'Building type not found' };
    }

    // Validate prerequisites
    const prereqCheck = this._checkPrerequisites(settlement, buildingType);
    if (!prereqCheck.valid) {
      return {
        success: false,
        reason: `Prerequisites not met: ${prereqCheck.missing.join(', ')}`
      };
    }

    // Check resource availability
    const costCheck = this._checkConstructionCosts(settlement, buildingType);
    if (!costCheck.canAfford) {
      return {
        success: false,
        reason: 'Insufficient resources',
        required: costCheck.required,
        available: costCheck.available,
        missing: costCheck.missing
      };
    }

    // Consume resources
    if (!options.skipResourceConsumption) {
      this._consumeConstructionResources(settlement, buildingType);
    }

    // Create building instance
    const building = new Building({
      id: options.buildingId || `building_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: options.name || buildingType.name,
      buildingTypeId: buildingType.id,
      settlementId: settlement.id,
      status: 'under_construction',
      level: 1,
      constructionProgress: 0
    });

    // Initialize construction
    const constructionResult = building.startConstruction(buildingType.constructionCost.time);

    // Add to settlement
    if (!settlement.buildings) {
      settlement.buildings = [];
    }
    settlement.buildings.push(building);

    // Record event
    this.constructionEvents.push({
      type: 'construction_started',
      settlementId: settlement.id,
      settlementName: settlement.name,
      buildingId: building.id,
      buildingName: building.name,
      buildingType: buildingType.name,
      estimatedCompletion: constructionResult.estimatedCompletion,
      timestamp: Date.now()
    });

    return {
      success: true,
      building: {
        id: building.id,
        name: building.name,
        type: buildingType.name,
        status: building.status,
        estimatedCompletion: constructionResult.estimatedCompletion
      },
      costsConsumed: costCheck.required
    };
  }

  /**
   * Update construction progress for a building
   */
  updateConstructionProgress(buildingId, turn) {
    const building = this._getBuildingById(buildingId);

    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    if (building.status !== 'under_construction') {
      return { success: false, reason: 'Building is not under construction' };
    }

    // Calculate progress (1 turn = some % of construction)
    const progressPerTurn = 10; // 10% per turn = 10 turns for completion
    const newProgress = Math.min(100, building.constructionProgress + progressPerTurn);

    building.constructionProgress = newProgress;

    // Check if complete
    if (newProgress >= 100) {
      building.status = 'active';
      building.constructionProgress = 100;

      this.constructionEvents.push({
        type: 'construction_completed',
        buildingId: building.id,
        buildingName: building.name,
        turn,
        timestamp: Date.now()
      });

      return {
        success: true,
        buildingId: building.id,
        completed: true,
        progress: 100
      };
    }

    return {
      success: true,
      buildingId: building.id,
      completed: false,
      progress: newProgress
    };
  }

  /**
   * Cancel construction and optionally refund resources
   */
  cancelConstruction(buildingId, options = {}) {
    const building = this._getBuildingById(buildingId);

    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    if (building.status !== 'under_construction') {
      return { success: false, reason: 'Building is not under construction' };
    }

    const settlement = this._getSettlement(building.settlementId);
    const buildingType = this._getBuildingType(building.buildingTypeId);

    let refunded = [];

    // Refund partial resources based on progress
    if (options.refundResources && buildingType) {
      const refundRatio = (100 - building.constructionProgress) / 100;
      refunded = this._refundConstructionResources(settlement, buildingType, refundRatio);
    }

    // Remove building from settlement
    if (settlement) {
      settlement.buildings = settlement.buildings.filter(b => b.id !== buildingId);
    }

    this.constructionEvents.push({
      type: 'construction_cancelled',
      buildingId: building.id,
      buildingName: building.name,
      progress: building.constructionProgress,
      refunded: refunded.length > 0,
      timestamp: Date.now()
    });

    return {
      success: true,
      buildingId,
      refunded
    };
  }

  /**
   * Upgrade a building to the next level
   */
  upgradeBuilding(buildingId, options = {}) {
    const building = this._getBuildingById(buildingId);

    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    if (building.status !== 'active') {
      return { success: false, reason: 'Building must be active to upgrade' };
    }

    const buildingType = this._getBuildingType(building.buildingTypeId);

    if (!buildingType) {
      return { success: false, reason: 'Building type not found' };
    }

    // Check if building can be upgraded
    const maxLevel = buildingType.upgrades?.maxLevel || 1;
    if (building.level >= maxLevel) {
      return { success: false, reason: `Building is already at maximum level (${maxLevel})` };
    }

    const nextLevel = building.level + 1;

    // Calculate upgrade cost
    const upgradeCost = buildingType.getUpgradeCost?.(nextLevel) || 
                       buildingType.constructionCost;

    // Check if settlement can afford upgrade
    const settlement = this._getSettlement(building.settlementId);
    const costCheck = this._checkUpgradeCosts(settlement, upgradeCost);

    if (!costCheck.canAfford) {
      return {
        success: false,
        reason: 'Insufficient resources for upgrade',
        required: costCheck.required,
        available: costCheck.available,
        missing: costCheck.missing
      };
    }

    // Consume resources
    if (!options.skipResourceConsumption) {
      this._consumeUpgradeResources(settlement, upgradeCost);
    }

    // Start upgrade
    const upgradeResult = building.startUpgrade(upgradeCost.time || 5);

    this.constructionEvents.push({
      type: 'upgrade_started',
      buildingId: building.id,
      buildingName: building.name,
      fromLevel: building.level,
      toLevel: nextLevel,
      estimatedCompletion: upgradeResult.estimatedCompletion,
      timestamp: Date.now()
    });

    return {
      success: true,
      buildingId: building.id,
      fromLevel: building.level,
      toLevel: nextLevel,
      status: building.status,
      estimatedCompletion: upgradeResult.estimatedCompletion
    };
  }

  /**
   * Complete an ongoing upgrade
   */
  completeUpgrade(buildingId, turn) {
    const building = this._getBuildingById(buildingId);

    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    if (building.status !== 'upgrading') {
      return { success: false, reason: 'Building is not upgrading' };
    }

    const oldLevel = building.level;
    building.level++;
    building.status = 'active';

    // Apply level benefits
    const buildingType = this._getBuildingType(building.buildingTypeId);
    if (buildingType?.upgrades?.levelBenefits) {
      const benefits = buildingType.upgrades.levelBenefits[building.level];
      if (benefits) {
        this._applyUpgradeBenefits(building, benefits);
      }
    }

    this.constructionEvents.push({
      type: 'upgrade_completed',
      buildingId: building.id,
      buildingName: building.name,
      newLevel: building.level,
      oldLevel,
      turn,
      timestamp: Date.now()
    });

    return {
      success: true,
      buildingId: building.id,
      newLevel: building.level,
      oldLevel
    };
  }

  /**
   * Demolish a building
   */
  demolishBuilding(buildingId, options = {}) {
    const building = this._getBuildingById(buildingId);

    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    const settlement = this._getSettlement(building.settlementId);
    const buildingType = this._getBuildingType(building.buildingTypeId);

    // Unassign all workers
    const workers = building.getWorkers();
    for (const workerId of workers) {
      building.unassignWorker(workerId);
    }

    let salvaged = [];

    // Salvage some resources
    if (options.salvageResources && buildingType) {
      const salvageRatio = 0.3; // 30% of construction cost
      salvaged = this._salvageResources(settlement, buildingType, salvageRatio);
    }

    // Remove from settlement
    if (settlement) {
      settlement.buildings = settlement.buildings.filter(b => b.id !== buildingId);
    }

    this.constructionEvents.push({
      type: 'building_demolished',
      buildingId: building.id,
      buildingName: building.name,
      settlementId: settlement?.id,
      salvaged: salvaged.length > 0,
      timestamp: Date.now()
    });

    return {
      success: true,
      buildingId,
      salvaged
    };
  }

  /**
   * Get construction status for all buildings in progress
   */
  getConstructionStatus(settlementId) {
    const settlement = this._getSettlement(settlementId);

    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    const inConstruction = [];
    const upgrading = [];

    for (const building of (settlement.buildings || [])) {
      if (building.status === 'under_construction') {
        inConstruction.push({
          id: building.id,
          name: building.name,
          type: building.buildingTypeId,
          progress: building.constructionProgress
        });
      } else if (building.status === 'upgrading') {
        upgrading.push({
          id: building.id,
          name: building.name,
          currentLevel: building.level,
          progress: building.constructionProgress
        });
      }
    }

    return {
      success: true,
      settlementId,
      settlementName: settlement.name,
      inConstruction,
      upgrading,
      totalInProgress: inConstruction.length + upgrading.length
    };
  }

  /**
   * Get available buildings that can be constructed
   */
  getAvailableBuildings(settlementId) {
    const settlement = this._getSettlement(settlementId);

    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    const buildingTypes = this.world.buildingTypes || [];
    const available = [];
    const unavailable = [];

    for (const buildingType of buildingTypes) {
      const prereqCheck = this._checkPrerequisites(settlement, buildingType);
      const costCheck = this._checkConstructionCosts(settlement, buildingType);

      const info = {
        id: buildingType.id,
        name: buildingType.name,
        category: buildingType.category,
        description: buildingType.description,
        cost: buildingType.constructionCost,
        canAfford: costCheck.canAfford,
        prerequisitesMet: prereqCheck.valid
      };

      if (prereqCheck.valid && costCheck.canAfford) {
        available.push(info);
      } else {
        info.missingPrerequisites = prereqCheck.missing;
        info.missingResources = costCheck.missing;
        unavailable.push(info);
      }
    }

    return {
      success: true,
      settlementId,
      available,
      unavailable
    };
  }

  /**
   * Check prerequisites for building
   * @private
   */
  _checkPrerequisites(settlement, buildingType) {
    const missing = [];

    if (!buildingType.prerequisites) {
      return { valid: true, missing: [] };
    }

    // Check required buildings
    if (buildingType.prerequisites.buildings) {
      for (const requiredBuildingTypeId of buildingType.prerequisites.buildings) {
        const hasBuilding = settlement.buildings?.some(b => 
          b.buildingTypeId === requiredBuildingTypeId && b.status === 'active'
        );

        if (!hasBuilding) {
          const requiredType = this._getBuildingType(requiredBuildingTypeId);
          missing.push(`Building: ${requiredType?.name || requiredBuildingTypeId}`);
        }
      }
    }

    // Check population requirement
    if (buildingType.prerequisites.population) {
      const population = settlement.population?.total || 0;
      if (population < buildingType.prerequisites.population) {
        missing.push(`Population: ${buildingType.prerequisites.population} (have ${population})`);
      }
    }

    // Check technology requirement
    if (buildingType.prerequisites.technology) {
      // TODO: Implement technology system check
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Check construction costs
   * @private
   */
  _checkConstructionCosts(settlement, buildingType) {
    const required = {};
    const available = {};
    const missing = [];

    // Get settlement inventory
    const inventory = this.storageService?.getSettlementInventory(settlement.id) || 
                     { totalInventory: {} };

    // Check resource costs
    for (const resource of (buildingType.constructionCost?.resources || [])) {
      required[resource.resourceId] = resource.quantity;
      available[resource.resourceId] = inventory.totalInventory[resource.resourceId] || 0;

      if (available[resource.resourceId] < resource.quantity) {
        missing.push({
          resourceId: resource.resourceId,
          required: resource.quantity,
          available: available[resource.resourceId],
          deficit: resource.quantity - available[resource.resourceId]
        });
      }
    }

    // Check gold cost
    if (buildingType.constructionCost?.gold) {
      const settlementGold = settlement.economy?.treasury || 0;
      required.gold = buildingType.constructionCost.gold;
      available.gold = settlementGold;

      if (settlementGold < buildingType.constructionCost.gold) {
        missing.push({
          resourceId: 'gold',
          required: buildingType.constructionCost.gold,
          available: settlementGold,
          deficit: buildingType.constructionCost.gold - settlementGold
        });
      }
    }

    return {
      canAfford: missing.length === 0,
      required,
      available,
      missing
    };
  }

  /**
   * Check upgrade costs
   * @private
   */
  _checkUpgradeCosts(settlement, upgradeCost) {
    // Similar to construction costs but for upgrades
    return this._checkConstructionCosts(settlement, { constructionCost: upgradeCost });
  }

  /**
   * Consume construction resources
   * @private
   */
  _consumeConstructionResources(settlement, buildingType) {
    // Consume from buildings in settlement
    for (const resource of (buildingType.constructionCost?.resources || [])) {
      let remaining = resource.quantity;

      for (const building of (settlement.buildings || [])) {
        if (remaining === 0) break;

        const available = building.storage?.contents[resource.resourceId] || 0;
        const toConsume = Math.min(remaining, available);

        if (toConsume > 0) {
          building.storage.contents[resource.resourceId] -= toConsume;
          remaining -= toConsume;
        }
      }
    }

    // Consume gold from treasury
    if (buildingType.constructionCost?.gold) {
      if (!settlement.economy) settlement.economy = {};
      settlement.economy.treasury = (settlement.economy.treasury || 0) - buildingType.constructionCost.gold;
    }
  }

  /**
   * Consume upgrade resources
   * @private
   */
  _consumeUpgradeResources(settlement, upgradeCost) {
    this._consumeConstructionResources(settlement, { constructionCost: upgradeCost });
  }

  /**
   * Refund construction resources
   * @private
   */
  _refundConstructionResources(settlement, buildingType, ratio) {
    const refunded = [];

    for (const resource of (buildingType.constructionCost?.resources || [])) {
      const refundAmount = Math.floor(resource.quantity * ratio);
      
      if (refundAmount > 0) {
        // Add to first building with space
        for (const building of (settlement.buildings || [])) {
          building.storage.contents[resource.resourceId] = 
            (building.storage.contents[resource.resourceId] || 0) + refundAmount;
          break;
        }

        refunded.push({
          resourceId: resource.resourceId,
          quantity: refundAmount
        });
      }
    }

    return refunded;
  }

  /**
   * Salvage resources from demolished building
   * @private
   */
  _salvageResources(settlement, buildingType, ratio) {
    return this._refundConstructionResources(settlement, buildingType, ratio);
  }

  /**
   * Apply upgrade benefits to building
   * @private
   */
  _applyUpgradeBenefits(building, benefits) {
    if (benefits.workerCapacity) {
      building.workers.capacity.max += benefits.workerCapacity;
      building.workers.capacity.optimal = Math.floor(building.workers.capacity.max * 0.8);
    }

    if (benefits.storageCapacity) {
      building.storage.capacity += benefits.storageCapacity;
    }

    if (benefits.productionBonus) {
      // Apply to building's production multipliers
      if (!building.production.bonuses) {
        building.production.bonuses = [];
      }
      building.production.bonuses.push(benefits.productionBonus);
    }
  }

  /**
   * Helper: Get settlement
   */
  _getSettlement(settlementId) {
    return this.world.settlements?.find(s => s.id === settlementId) || null;
  }

  /**
   * Helper: Get building type
   */
  _getBuildingType(buildingTypeId) {
    return this.world.buildingTypes?.find(bt => bt.id === buildingTypeId) || null;
  }

  /**
   * Helper: Get building by ID
   */
  _getBuildingById(buildingId) {
    for (const settlement of (this.world.settlements || [])) {
      const building = settlement.buildings?.find(b => b.id === buildingId);
      if (building) return building;
    }
    return null;
  }
}

export default BuildingConstructionService;
