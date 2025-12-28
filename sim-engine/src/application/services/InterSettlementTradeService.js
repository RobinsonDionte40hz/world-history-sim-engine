/**
 * InterSettlementTradeService - Manages trade routes and resource exchange between settlements
 * 
 * Handles trade route creation, caravan management, resource transfers,
 * trade agreements, and economic relationships between settlements.
 */

export class InterSettlementTradeService {
  constructor(world, storageService = null, marketService = null) {
    this.world = world;
    this.storageService = storageService;
    this.marketService = marketService;
    this.tradeRoutes = new Map(); // routeId -> TradeRoute
    this.caravans = new Map(); // caravanId -> Caravan
    this.tradeEvents = [];
  }

  /**
   * Create a trade route between two settlements
   */
  createTradeRoute(fromSettlementId, toSettlementId, options = {}) {
    const fromSettlement = this._getSettlement(fromSettlementId);
    const toSettlement = this._getSettlement(toSettlementId);

    if (!fromSettlement) {
      return { success: false, reason: 'Source settlement not found' };
    }

    if (!toSettlement) {
      return { success: false, reason: 'Destination settlement not found' };
    }

    if (fromSettlementId === toSettlementId) {
      return { success: false, reason: 'Cannot create trade route to same settlement' };
    }

    // Check if route already exists
    const existingRoute = this._findTradeRoute(fromSettlementId, toSettlementId);
    if (existingRoute) {
      return { success: false, reason: 'Trade route already exists' };
    }

    const routeId = options.routeId || `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tradeRoute = {
      id: routeId,
      fromSettlementId,
      toSettlementId,
      fromSettlementName: fromSettlement.name,
      toSettlementName: toSettlement.name,
      distance: options.distance || 100, // Arbitrary units
      travelTime: options.travelTime || 3, // Turns
      status: 'active',
      establishedTurn: options.turn || 0,
      tradedItems: {}, // itemId -> { quantityExported, quantityImported, totalValue }
      totalTrades: 0,
      totalValue: 0,
      agreement: options.agreement || null // Trade agreement terms
    };

    this.tradeRoutes.set(routeId, tradeRoute);

    this.tradeEvents.push({
      type: 'trade_route_established',
      routeId,
      fromSettlement: fromSettlement.name,
      toSettlement: toSettlement.name,
      timestamp: Date.now()
    });

    return {
      success: true,
      tradeRoute
    };
  }

  /**
   * Send a caravan with goods between settlements
   */
  sendCaravan(tradeRouteId, cargo, options = {}) {
    const tradeRoute = this.tradeRoutes.get(tradeRouteId);

    if (!tradeRoute) {
      return { success: false, reason: 'Trade route not found' };
    }

    const fromSettlement = this._getSettlement(tradeRoute.fromSettlementId);
    const toSettlement = this._getSettlement(tradeRoute.toSettlementId);

    // Validate cargo
    const cargoValidation = this._validateCargo(fromSettlement, cargo);
    if (!cargoValidation.valid) {
      return {
        success: false,
        reason: 'Invalid cargo',
        missing: cargoValidation.missing
      };
    }

    // Calculate trade value
    const tradeValue = this._calculateTradeValue(tradeRoute, cargo);

    // Create caravan
    const caravanId = options.caravanId || `caravan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const caravan = {
      id: caravanId,
      tradeRouteId,
      fromSettlementId: tradeRoute.fromSettlementId,
      toSettlementId: tradeRoute.toSettlementId,
      cargo,
      status: 'traveling',
      departedTurn: options.turn || 0,
      arrivalTurn: (options.turn || 0) + tradeRoute.travelTime,
      currentProgress: 0,
      tradeValue
    };

    this.caravans.set(caravanId, caravan);

    // Remove cargo from source settlement
    if (!options.skipResourceRemoval) {
      this._removeCargoFromSettlement(fromSettlement, cargo);
    }

    this.tradeEvents.push({
      type: 'caravan_departed',
      caravanId,
      routeId: tradeRouteId,
      fromSettlement: tradeRoute.fromSettlementName,
      toSettlement: tradeRoute.toSettlementName,
      cargo,
      value: tradeValue,
      timestamp: Date.now()
    });

    return {
      success: true,
      caravan: {
        id: caravanId,
        estimatedArrival: caravan.arrivalTurn,
        value: tradeValue
      }
    };
  }

  /**
   * Update caravan progress and handle arrivals
   */
  updateCaravans(turn) {
    const arrivals = [];

    for (const [caravanId, caravan] of this.caravans.entries()) {
      if (caravan.status !== 'traveling') continue;

      // Update progress
      caravan.currentProgress = ((turn - caravan.departedTurn) / 
                                 (caravan.arrivalTurn - caravan.departedTurn)) * 100;

      // Check if arrived
      if (turn >= caravan.arrivalTurn) {
        const arrivalResult = this._handleCaravanArrival(caravan, turn);
        arrivals.push(arrivalResult);
        
        // Remove caravan
        this.caravans.delete(caravanId);
      }
    }

    return {
      success: true,
      turn,
      caravansInTransit: this.caravans.size,
      arrivals
    };
  }

  /**
   * Get all trade routes for a settlement
   */
  getSettlementTradeRoutes(settlementId) {
    const routes = {
      outgoing: [],
      incoming: [],
      total: 0
    };

    for (const route of this.tradeRoutes.values()) {
      if (route.fromSettlementId === settlementId) {
        routes.outgoing.push(route);
      }
      if (route.toSettlementId === settlementId) {
        routes.incoming.push(route);
      }
    }

    routes.total = routes.outgoing.length + routes.incoming.length;

    return {
      success: true,
      settlementId,
      routes
    };
  }

  /**
   * Get trade statistics for a settlement
   */
  getTradeStatistics(settlementId, lastNTurns = 30) {
    const settlement = this._getSettlement(settlementId);

    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    const stats = {
      settlementId,
      settlementName: settlement.name,
      activeRoutes: 0,
      totalExports: 0,
      totalImports: 0,
      tradeBalance: 0,
      topExports: [],
      topImports: [],
      tradingPartners: new Set()
    };

    // Aggregate from trade routes
    for (const route of this.tradeRoutes.values()) {
      if (route.fromSettlementId === settlementId) {
        stats.activeRoutes++;
        stats.totalExports += route.totalValue;
        stats.tradingPartners.add(route.toSettlementId);

        // Aggregate exports
        for (const [itemId, data] of Object.entries(route.tradedItems)) {
          const existing = stats.topExports.find(e => e.itemId === itemId);
          if (existing) {
            existing.quantity += data.quantityExported;
            existing.value += data.totalValue;
          } else {
            stats.topExports.push({
              itemId,
              quantity: data.quantityExported,
              value: data.totalValue
            });
          }
        }
      }

      if (route.toSettlementId === settlementId) {
        stats.activeRoutes++;
        stats.totalImports += route.totalValue;
        stats.tradingPartners.add(route.fromSettlementId);

        // Aggregate imports
        for (const [itemId, data] of Object.entries(route.tradedItems)) {
          const existing = stats.topImports.find(e => e.itemId === itemId);
          if (existing) {
            existing.quantity += data.quantityImported;
            existing.value += data.totalValue;
          } else {
            stats.topImports.push({
              itemId,
              quantity: data.quantityImported,
              value: data.totalValue
            });
          }
        }
      }
    }

    stats.tradeBalance = stats.totalExports - stats.totalImports;
    stats.tradingPartners = stats.tradingPartners.size;

    // Sort by value
    stats.topExports.sort((a, b) => b.value - a.value);
    stats.topImports.sort((a, b) => b.value - a.value);

    return {
      success: true,
      stats
    };
  }

  /**
   * Establish trade agreement between settlements
   */
  createTradeAgreement(settlementIds, terms) {
    const agreementId = `agreement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const agreement = {
      id: agreementId,
      settlements: settlementIds,
      terms: {
        duration: terms.duration || null, // Turns, null = indefinite
        tariff: terms.tariff || 0, // Percentage
        exclusiveGoods: terms.exclusiveGoods || [], // Items only traded between these settlements
        quotas: terms.quotas || {}, // itemId -> max quantity per turn
        minimumPrice: terms.minimumPrice || {}, // itemId -> minimum price
        maximumPrice: terms.maximumPrice || {} // itemId -> maximum price
      },
      status: 'active',
      establishedTurn: terms.turn || 0,
      expirationTurn: terms.duration ? (terms.turn || 0) + terms.duration : null
    };

    // Apply agreement to all routes between these settlements
    for (const route of this.tradeRoutes.values()) {
      if (settlementIds.includes(route.fromSettlementId) && 
          settlementIds.includes(route.toSettlementId)) {
        route.agreement = agreement;
      }
    }

    this.tradeEvents.push({
      type: 'trade_agreement_established',
      agreementId,
      settlements: settlementIds,
      terms,
      timestamp: Date.now()
    });

    return {
      success: true,
      agreement
    };
  }

  /**
   * Close a trade route
   */
  closeTradeRoute(tradeRouteId, reason = 'closed') {
    const route = this.tradeRoutes.get(tradeRouteId);

    if (!route) {
      return { success: false, reason: 'Trade route not found' };
    }

    route.status = 'closed';

    // Cancel all caravans on this route
    const cancelledCaravans = [];
    for (const [caravanId, caravan] of this.caravans.entries()) {
      if (caravan.tradeRouteId === tradeRouteId && caravan.status === 'traveling') {
        caravan.status = 'cancelled';
        cancelledCaravans.push(caravanId);
        
        // Return cargo to origin
        this._returnCargoToSettlement(caravan);
      }
    }

    this.tradeEvents.push({
      type: 'trade_route_closed',
      routeId: tradeRouteId,
      reason,
      cancelledCaravans: cancelledCaravans.length,
      timestamp: Date.now()
    });

    // Remove from active routes
    this.tradeRoutes.delete(tradeRouteId);

    return {
      success: true,
      routeId: tradeRouteId,
      cancelledCaravans
    };
  }

  /**
   * Find optimal trade opportunities across all settlements
   */
  findOptimalTrades(minProfitMargin = 20) {
    const opportunities = [];

    // Compare prices across all settlement pairs
    const settlements = this.world.settlements || [];

    for (let i = 0; i < settlements.length; i++) {
      for (let j = i + 1; j < settlements.length; j++) {
        const settlement1 = settlements[i];
        const settlement2 = settlements[j];

        // Check inventory of settlement1
        const inventory1 = this.storageService?.getSettlementInventory(settlement1.id);
        if (!inventory1?.success) continue;

        // Find items to trade
        for (const [itemId, quantity] of Object.entries(inventory1.totalInventory)) {
          if (quantity < 10) continue; // Need minimum quantity to trade

          const price1 = this.marketService?.getPrice(settlement1.id, itemId) || 10;
          const price2 = this.marketService?.getPrice(settlement2.id, itemId) || 10;

          // Calculate profit potential
          const buyValue = price1 * quantity;
          const sellValue = price2 * quantity;
          const profit = sellValue - buyValue;
          const profitMargin = buyValue > 0 ? (profit / buyValue) * 100 : 0;

          if (profitMargin >= minProfitMargin) {
            opportunities.push({
              fromSettlement: settlement1.id,
              toSettlement: settlement2.id,
              itemId,
              quantity,
              buyPrice: price1,
              sellPrice: price2,
              profit,
              profitMargin
            });
          }
        }
      }
    }

    // Sort by profit
    opportunities.sort((a, b) => b.profit - a.profit);

    return {
      success: true,
      opportunities: opportunities.slice(0, 20) // Top 20
    };
  }

  /**
   * Handle caravan arrival
   * @private
   */
  _handleCaravanArrival(caravan, turn) {
    const route = this.tradeRoutes.get(caravan.tradeRouteId);
    const toSettlement = this._getSettlement(caravan.toSettlementId);

    // Add cargo to destination settlement
    this._addCargoToSettlement(toSettlement, caravan.cargo);

    // Update trade route statistics
    if (route) {
      route.totalTrades++;
      route.totalValue += caravan.tradeValue;

      // Update traded items
      for (const item of caravan.cargo) {
        if (!route.tradedItems[item.itemId]) {
          route.tradedItems[item.itemId] = {
            quantityExported: 0,
            quantityImported: 0,
            totalValue: 0
          };
        }

        const itemValue = this.marketService?.getPrice(caravan.toSettlementId, item.itemId) || 10;
        route.tradedItems[item.itemId].quantityExported += item.quantity;
        route.tradedItems[item.itemId].totalValue += itemValue * item.quantity;
      }
    }

    caravan.status = 'arrived';

    this.tradeEvents.push({
      type: 'caravan_arrived',
      caravanId: caravan.id,
      routeId: caravan.tradeRouteId,
      toSettlement: toSettlement?.name,
      cargo: caravan.cargo,
      value: caravan.tradeValue,
      turn,
      timestamp: Date.now()
    });

    return {
      caravanId: caravan.id,
      settlement: toSettlement?.name,
      cargo: caravan.cargo,
      value: caravan.tradeValue
    };
  }

  /**
   * Validate cargo against settlement inventory
   * @private
   */
  _validateCargo(settlement, cargo) {
    const inventory = this.storageService?.getSettlementInventory(settlement.id) || 
                     { totalInventory: {} };
    
    const missing = [];

    for (const item of cargo) {
      const available = inventory.totalInventory[item.itemId] || 0;
      if (available < item.quantity) {
        missing.push({
          itemId: item.itemId,
          required: item.quantity,
          available,
          deficit: item.quantity - available
        });
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Calculate trade value
   * @private
   */
  _calculateTradeValue(route, cargo) {
    let totalValue = 0;

    for (const item of cargo) {
      const price = this.marketService?.getPrice(route.toSettlementId, item.itemId) || 10;
      totalValue += price * item.quantity;
    }

    // Apply tariff if exists
    if (route.agreement?.terms?.tariff) {
      totalValue *= (1 - route.agreement.terms.tariff);
    }

    return totalValue;
  }

  /**
   * Remove cargo from settlement
   * @private
   */
  _removeCargoFromSettlement(settlement, cargo) {
    for (const item of cargo) {
      // Remove from buildings in settlement
      let remaining = item.quantity;

      for (const building of (settlement.buildings || [])) {
        if (remaining === 0) break;

        const available = building.storage?.contents[item.itemId] || 0;
        const toRemove = Math.min(remaining, available);

        if (toRemove > 0) {
          building.storage.contents[item.itemId] -= toRemove;
          remaining -= toRemove;

          if (building.storage.contents[item.itemId] === 0) {
            delete building.storage.contents[item.itemId];
          }
        }
      }
    }
  }

  /**
   * Add cargo to settlement
   * @private
   */
  _addCargoToSettlement(settlement, cargo) {
    for (const item of cargo) {
      // Add to first building with capacity
      for (const building of (settlement.buildings || [])) {
        const used = Object.values(building.storage.contents).reduce((sum, q) => sum + q, 0);
        const available = building.storage.capacity - used;

        if (available >= item.quantity) {
          building.storage.contents[item.itemId] = 
            (building.storage.contents[item.itemId] || 0) + item.quantity;
          break;
        }
      }
    }
  }

  /**
   * Return cargo to settlement (on cancellation)
   * @private
   */
  _returnCargoToSettlement(caravan) {
    const fromSettlement = this._getSettlement(caravan.fromSettlementId);
    if (fromSettlement) {
      this._addCargoToSettlement(fromSettlement, caravan.cargo);
    }
  }

  /**
   * Find existing trade route between settlements
   * @private
   */
  _findTradeRoute(fromId, toId) {
    for (const route of this.tradeRoutes.values()) {
      if ((route.fromSettlementId === fromId && route.toSettlementId === toId) ||
          (route.fromSettlementId === toId && route.toSettlementId === fromId)) {
        return route;
      }
    }
    return null;
  }

  /**
   * Helper: Get settlement
   */
  _getSettlement(settlementId) {
    return this.world.settlements?.find(s => s.id === settlementId) || null;
  }
}

export default InterSettlementTradeService;
