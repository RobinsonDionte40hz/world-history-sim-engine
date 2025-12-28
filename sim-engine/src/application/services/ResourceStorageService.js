/**
 * ResourceStorageService - Manages resource storage and inventory across settlements
 * 
 * Handles resource transfers between buildings, tracks total available resources,
 * manages settlement-wide inventories, and coordinates resource distribution.
 */

export class ResourceStorageService {
  constructor(world) {
    this.world = world;
    this.transferEvents = [];
  }

  /**
   * Get total resources available in a settlement
   */
  getSettlementInventory(settlementId) {
    const settlement = this._getSettlement(settlementId);
    
    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    const inventory = {};
    const storageByBuilding = [];
    let totalCapacity = 0;
    let totalUsed = 0;

    // Aggregate resources from all buildings
    for (const building of (settlement.buildings || [])) {
      const buildingInventory = { ...building.storage.contents };
      const buildingCapacity = building.storage.capacity;
      const buildingUsed = Object.values(buildingInventory).reduce((sum, qty) => sum + qty, 0);

      storageByBuilding.push({
        buildingId: building.id,
        buildingName: building.name,
        inventory: buildingInventory,
        capacity: buildingCapacity,
        used: buildingUsed,
        available: buildingCapacity - buildingUsed
      });

      // Add to settlement total
      for (const [itemId, quantity] of Object.entries(buildingInventory)) {
        inventory[itemId] = (inventory[itemId] || 0) + quantity;
      }

      totalCapacity += buildingCapacity;
      totalUsed += buildingUsed;
    }

    return {
      success: true,
      settlementId,
      settlementName: settlement.name,
      totalInventory: inventory,
      storageByBuilding,
      storage: {
        totalCapacity,
        totalUsed,
        totalAvailable: totalCapacity - totalUsed,
        usagePercent: totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0
      }
    };
  }

  /**
   * Transfer resources between buildings
   */
  transferResources(fromBuildingId, toBuildingId, resourceId, quantity) {
    const fromBuilding = this._getBuildingById(fromBuildingId);
    const toBuilding = this._getBuildingById(toBuildingId);

    if (!fromBuilding) {
      return { success: false, reason: 'Source building not found' };
    }

    if (!toBuilding) {
      return { success: false, reason: 'Destination building not found' };
    }

    // Check if source has enough resources
    const available = fromBuilding.storage.contents[resourceId] || 0;
    if (available < quantity) {
      return { 
        success: false, 
        reason: `Insufficient resources (need ${quantity}, have ${available})` 
      };
    }

    // Check if destination has capacity
    const destUsed = Object.values(toBuilding.storage.contents).reduce((sum, qty) => sum + qty, 0);
    const destAvailable = toBuilding.storage.capacity - destUsed;
    
    if (destAvailable < quantity) {
      return { 
        success: false, 
        reason: `Insufficient storage capacity at destination (need ${quantity}, have ${destAvailable})` 
      };
    }

    // Perform transfer
    fromBuilding.storage.contents[resourceId] = available - quantity;
    toBuilding.storage.contents[resourceId] = (toBuilding.storage.contents[resourceId] || 0) + quantity;

    // Clean up zero quantities
    if (fromBuilding.storage.contents[resourceId] === 0) {
      delete fromBuilding.storage.contents[resourceId];
    }

    // Log transfer event
    this.transferEvents.push({
      type: 'resource_transfer',
      fromBuildingId,
      toBuildingId,
      resourceId,
      quantity,
      timestamp: Date.now()
    });

    return {
      success: true,
      transfer: {
        from: { buildingId: fromBuildingId, name: fromBuilding.name },
        to: { buildingId: toBuildingId, name: toBuilding.name },
        resourceId,
        quantity,
        remainingAtSource: fromBuilding.storage.contents[resourceId] || 0
      }
    };
  }

  /**
   * Distribute resources from a central building to others
   */
  distributeResources(sourceBuildingId, targetBuildingIds, resourceId, options = {}) {
    const sourceBuilding = this._getBuildingById(sourceBuildingId);
    
    if (!sourceBuilding) {
      return { success: false, reason: 'Source building not found' };
    }

    const available = sourceBuilding.storage.contents[resourceId] || 0;
    
    if (available === 0) {
      return { success: false, reason: 'No resources available to distribute' };
    }

    const mode = options.mode || 'equal'; // 'equal', 'priority', 'need'
    const results = [];
    const failures = [];

    // Calculate distribution amounts
    const distributions = this._calculateDistributions(
      sourceBuildingId,
      targetBuildingIds,
      resourceId,
      available,
      mode,
      options
    );

    // Execute transfers
    for (const dist of distributions) {
      const result = this.transferResources(
        sourceBuildingId,
        dist.buildingId,
        resourceId,
        dist.quantity
      );

      if (result.success) {
        results.push(result.transfer);
      } else {
        failures.push({
          buildingId: dist.buildingId,
          quantity: dist.quantity,
          reason: result.reason
        });
      }
    }

    return {
      success: true,
      distributed: results.length,
      totalQuantity: results.reduce((sum, r) => sum + r.quantity, 0),
      transfers: results,
      failures
    };
  }

  /**
   * Consolidate resources from multiple buildings to one
   */
  consolidateResources(targetBuildingId, sourceBuildingIds, resourceId, options = {}) {
    const targetBuilding = this._getBuildingById(targetBuildingId);
    
    if (!targetBuilding) {
      return { success: false, reason: 'Target building not found' };
    }

    const results = [];
    const failures = [];
    let totalConsolidated = 0;

    for (const sourceId of sourceBuildingIds) {
      const sourceBuilding = this._getBuildingById(sourceId);
      
      if (!sourceBuilding) {
        failures.push({ buildingId: sourceId, reason: 'Building not found' });
        continue;
      }

      const available = sourceBuilding.storage.contents[resourceId] || 0;
      
      if (available === 0) {
        continue; // Skip buildings with no resources
      }

      // Determine how much to transfer
      const quantity = options.leaveMinimum 
        ? Math.max(0, available - (options.minimumToLeave || 0))
        : available;

      if (quantity === 0) {
        continue;
      }

      const result = this.transferResources(sourceId, targetBuildingId, resourceId, quantity);

      if (result.success) {
        results.push(result.transfer);
        totalConsolidated += quantity;
      } else {
        failures.push({
          buildingId: sourceId,
          quantity,
          reason: result.reason
        });
      }
    }

    return {
      success: true,
      consolidated: results.length,
      totalQuantity: totalConsolidated,
      transfers: results,
      failures
    };
  }

  /**
   * Reserve resources for production or other purposes
   */
  reserveResources(buildingId, resourceId, quantity, purpose = 'production') {
    const building = this._getBuildingById(buildingId);
    
    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    // Initialize reservations if not exists
    if (!building.storage.reservations) {
      building.storage.reservations = {};
    }

    // Check if resources are available
    const available = building.storage.contents[resourceId] || 0;
    const reserved = building.storage.reservations[resourceId] || 0;
    const unreserved = available - reserved;

    if (unreserved < quantity) {
      return { 
        success: false, 
        reason: `Insufficient unreserved resources (need ${quantity}, have ${unreserved})` 
      };
    }

    // Reserve the resources
    building.storage.reservations[resourceId] = reserved + quantity;

    return {
      success: true,
      reservation: {
        buildingId,
        resourceId,
        quantity,
        purpose,
        totalReserved: building.storage.reservations[resourceId]
      }
    };
  }

  /**
   * Release reserved resources
   */
  releaseReservation(buildingId, resourceId, quantity) {
    const building = this._getBuildingById(buildingId);
    
    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    if (!building.storage.reservations) {
      return { success: false, reason: 'No reservations found' };
    }

    const reserved = building.storage.reservations[resourceId] || 0;
    
    if (reserved < quantity) {
      return { 
        success: false, 
        reason: `Cannot release more than reserved (releasing ${quantity}, reserved ${reserved})` 
      };
    }

    building.storage.reservations[resourceId] = reserved - quantity;

    // Clean up zero reservations
    if (building.storage.reservations[resourceId] === 0) {
      delete building.storage.reservations[resourceId];
    }

    return {
      success: true,
      released: quantity,
      remainingReserved: building.storage.reservations[resourceId] || 0
    };
  }

  /**
   * Find buildings with specific resources
   */
  findResourceLocations(settlementId, resourceId, options = {}) {
    const settlement = this._getSettlement(settlementId);
    
    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    const locations = [];

    for (const building of (settlement.buildings || [])) {
      const quantity = building.storage.contents[resourceId] || 0;
      
      if (quantity === 0) {
        continue;
      }

      const reserved = building.storage.reservations?.[resourceId] || 0;
      const available = quantity - reserved;

      // Apply filters
      if (options.minQuantity && quantity < options.minQuantity) {
        continue;
      }

      if (options.onlyAvailable && available === 0) {
        continue;
      }

      locations.push({
        buildingId: building.id,
        buildingName: building.name,
        buildingType: building.buildingTypeId,
        total: quantity,
        reserved,
        available
      });
    }

    // Sort by quantity
    locations.sort((a, b) => b.total - a.total);

    return {
      success: true,
      resourceId,
      settlementId,
      locations,
      totalQuantity: locations.reduce((sum, loc) => sum + loc.total, 0),
      totalAvailable: locations.reduce((sum, loc) => sum + loc.available, 0)
    };
  }

  /**
   * Get resource shortage report for a settlement
   */
  getResourceShortages(settlementId, requiredResources) {
    const settlement = this._getSettlement(settlementId);
    
    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    const inventory = this.getSettlementInventory(settlementId);
    const shortages = [];
    const surpluses = [];

    for (const [resourceId, required] of Object.entries(requiredResources)) {
      const available = inventory.totalInventory[resourceId] || 0;
      const difference = available - required;

      if (difference < 0) {
        shortages.push({
          resourceId,
          required,
          available,
          shortage: Math.abs(difference),
          severity: this._calculateShortageSeverity(difference, required)
        });
      } else if (difference > 0) {
        surpluses.push({
          resourceId,
          required,
          available,
          surplus: difference
        });
      }
    }

    return {
      success: true,
      settlementId,
      shortages: shortages.sort((a, b) => b.severity - a.severity),
      surpluses,
      hasShortages: shortages.length > 0
    };
  }

  /**
   * Optimize storage across buildings
   */
  optimizeStorage(settlementId, options = {}) {
    const settlement = this._getSettlement(settlementId);
    
    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    const transfers = [];
    const strategy = options.strategy || 'balance'; // 'balance', 'consolidate', 'distribute'

    // Get inventory data
    const inventory = this.getSettlementInventory(settlementId);
    
    if (strategy === 'balance') {
      // Balance resources across buildings
      for (const [resourceId, totalQty] of Object.entries(inventory.totalInventory)) {
        const buildingsWithResource = inventory.storageByBuilding
          .filter(b => (b.inventory[resourceId] || 0) > 0);
        
        if (buildingsWithResource.length <= 1) continue;

        const avgPerBuilding = totalQty / buildingsWithResource.length;

        // Transfer from over-stocked to under-stocked
        for (const building of buildingsWithResource) {
          const currentQty = building.inventory[resourceId] || 0;
          const difference = currentQty - avgPerBuilding;

          if (difference > 1) { // Has excess
            // Find under-stocked building
            const recipient = buildingsWithResource.find(b => 
              (b.inventory[resourceId] || 0) < avgPerBuilding &&
              b.buildingId !== building.buildingId
            );

            if (recipient) {
              const transferQty = Math.floor(Math.min(difference, avgPerBuilding - (recipient.inventory[resourceId] || 0)));
              
              if (transferQty > 0) {
                const result = this.transferResources(
                  building.buildingId,
                  recipient.buildingId,
                  resourceId,
                  transferQty
                );

                if (result.success) {
                  transfers.push(result.transfer);
                }
              }
            }
          }
        }
      }
    }

    return {
      success: true,
      strategy,
      transfersExecuted: transfers.length,
      transfers
    };
  }

  /**
   * Calculate distributions based on mode
   * @private
   */
  _calculateDistributions(sourceId, targetIds, resourceId, available, mode, options) {
    const distributions = [];
    const targets = targetIds.map(id => ({
      buildingId: id,
      building: this._getBuildingById(id)
    })).filter(t => t.building);

    if (mode === 'equal') {
      // Distribute equally
      const perBuilding = Math.floor(available / targets.length);
      
      for (const target of targets) {
        if (perBuilding > 0) {
          distributions.push({
            buildingId: target.buildingId,
            quantity: perBuilding
          });
        }
      }
    } else if (mode === 'need') {
      // Distribute based on capacity (buildings with more space get more)
      const totalCapacity = targets.reduce((sum, t) => {
        const used = Object.values(t.building.storage.contents).reduce((s, q) => s + q, 0);
        return sum + (t.building.storage.capacity - used);
      }, 0);

      for (const target of targets) {
        const used = Object.values(target.building.storage.contents).reduce((s, q) => s + q, 0);
        const capacity = target.building.storage.capacity - used;
        const ratio = capacity / totalCapacity;
        const quantity = Math.floor(available * ratio);

        if (quantity > 0) {
          distributions.push({
            buildingId: target.buildingId,
            quantity
          });
        }
      }
    } else if (mode === 'priority') {
      // Distribute based on priority array
      const priorities = options.priorities || [];
      let remaining = available;

      for (const target of targets) {
        if (remaining === 0) break;

        const priority = priorities.find(p => p.buildingId === target.buildingId);
        const quantity = Math.min(remaining, priority?.quantity || 0);

        if (quantity > 0) {
          distributions.push({
            buildingId: target.buildingId,
            quantity
          });
          remaining -= quantity;
        }
      }
    }

    return distributions;
  }

  /**
   * Calculate shortage severity (0-1)
   * @private
   */
  _calculateShortageSeverity(difference, required) {
    if (required === 0) return 0;
    const ratio = Math.abs(difference) / required;
    return Math.min(1, ratio);
  }

  /**
   * Helper: Get settlement
   */
  _getSettlement(settlementId) {
    return this.world.settlements?.find(s => s.id === settlementId) || null;
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
}

export default ResourceStorageService;
