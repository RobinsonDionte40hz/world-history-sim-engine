/**
 * MarketDynamicsService - Manages supply/demand economics and dynamic pricing
 * 
 * Calculates market prices based on supply/demand, tracks price history,
 * handles market updates, and provides economic analysis for settlements.
 */

export class MarketDynamicsService {
  constructor(world, storageService = null) {
    this.world = world;
    this.storageService = storageService;
    this.marketPrices = new Map(); // settlementId -> { itemId -> price }
    this.priceHistory = new Map(); // settlementId -> { itemId -> [prices] }
    this.demandFactors = new Map(); // settlementId -> { itemId -> demand }
    this.marketEvents = [];
  }

  /**
   * Initialize market prices for a settlement
   */
  initializeMarket(settlementId) {
    const settlement = this._getSettlement(settlementId);
    
    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    const prices = {};
    const items = this.world.items || [];

    // Initialize prices from base item values
    for (const item of items) {
      const basePrice = item.market?.basePrice || 10;
      prices[item.id] = basePrice;
    }

    this.marketPrices.set(settlementId, prices);
    this.priceHistory.set(settlementId, {});
    this.demandFactors.set(settlementId, {});

    return {
      success: true,
      settlementId,
      itemsInitialized: Object.keys(prices).length,
      prices
    };
  }

  /**
   * Update market prices based on supply and demand
   */
  updateMarketPrices(settlementId, turn) {
    const settlement = this._getSettlement(settlementId);
    
    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    // Initialize if needed
    if (!this.marketPrices.has(settlementId)) {
      this.initializeMarket(settlementId);
    }

    const currentPrices = this.marketPrices.get(settlementId);
    const priceChanges = {};

    // Get inventory data
    const inventory = this.storageService?.getSettlementInventory(settlementId) || 
                     { totalInventory: {} };

    // Update each item's price
    for (const [itemId, currentPrice] of Object.entries(currentPrices)) {
      const newPrice = this._calculateMarketPrice(
        itemId,
        settlementId,
        currentPrice,
        inventory.totalInventory[itemId] || 0
      );

      if (newPrice !== currentPrice) {
        priceChanges[itemId] = {
          oldPrice: currentPrice,
          newPrice,
          change: newPrice - currentPrice,
          changePercent: ((newPrice - currentPrice) / currentPrice) * 100
        };

        currentPrices[itemId] = newPrice;
      }

      // Record price in history
      this._recordPriceHistory(settlementId, itemId, newPrice, turn);
    }

    // Generate market events for significant changes
    this._generateMarketEvents(settlementId, priceChanges, turn);

    return {
      success: true,
      settlementId,
      turn,
      priceChanges,
      significantChanges: Object.keys(priceChanges).filter(id => 
        Math.abs(priceChanges[id].changePercent) >= 10
      ).length
    };
  }

  /**
   * Get current market price for an item in a settlement
   */
  getPrice(settlementId, itemId) {
    if (!this.marketPrices.has(settlementId)) {
      this.initializeMarket(settlementId);
    }

    const prices = this.marketPrices.get(settlementId);
    const price = prices[itemId];

    if (price === undefined) {
      // Get base price from item
      const item = this._getItem(itemId);
      return item?.market?.basePrice || 10;
    }

    return price;
  }

  /**
   * Set demand factor for an item (affects pricing)
   */
  setDemand(settlementId, itemId, demandLevel) {
    if (!this.demandFactors.has(settlementId)) {
      this.demandFactors.set(settlementId, {});
    }

    const demands = this.demandFactors.get(settlementId);
    demands[itemId] = demandLevel;

    return {
      success: true,
      settlementId,
      itemId,
      demandLevel
    };
  }

  /**
   * Get price history for an item
   */
  getPriceHistory(settlementId, itemId, lastNTurns = 30) {
    if (!this.priceHistory.has(settlementId)) {
      return { success: false, reason: 'No price history for settlement' };
    }

    const history = this.priceHistory.get(settlementId)[itemId] || [];
    const recentHistory = history.slice(-lastNTurns);

    if (recentHistory.length === 0) {
      return { success: false, reason: 'No price history for item' };
    }

    const prices = recentHistory.map(h => h.price);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const currentPrice = prices[prices.length - 1];

    return {
      success: true,
      settlementId,
      itemId,
      history: recentHistory,
      statistics: {
        current: currentPrice,
        average: avgPrice,
        maximum: maxPrice,
        minimum: minPrice,
        volatility: this._calculateVolatility(prices)
      }
    };
  }

  /**
   * Calculate trade value between two settlements
   */
  calculateTradeValue(fromSettlementId, toSettlementId, itemId, quantity) {
    const buyPrice = this.getPrice(fromSettlementId, itemId);
    const sellPrice = this.getPrice(toSettlementId, itemId);

    const buyValue = buyPrice * quantity;
    const sellValue = sellPrice * quantity;
    const profit = sellValue - buyValue;
    const profitMargin = buyValue > 0 ? (profit / buyValue) * 100 : 0;

    return {
      success: true,
      itemId,
      quantity,
      fromSettlement: fromSettlementId,
      toSettlement: toSettlementId,
      buyPrice,
      sellPrice,
      buyValue,
      sellValue,
      profit,
      profitMargin,
      profitable: profit > 0
    };
  }

  /**
   * Find profitable trade opportunities
   */
  findTradeOpportunities(fromSettlementId, minProfitMargin = 20) {
    const opportunities = [];
    const settlements = this.world.settlements || [];

    // Get inventory from source settlement
    const inventory = this.storageService?.getSettlementInventory(fromSettlementId);
    
    if (!inventory || !inventory.success) {
      return { success: false, reason: 'Could not get settlement inventory' };
    }

    // Check each destination settlement
    for (const targetSettlement of settlements) {
      if (targetSettlement.id === fromSettlementId) continue;

      // Check each item in inventory
      for (const [itemId, quantity] of Object.entries(inventory.totalInventory)) {
        if (quantity === 0) continue;

        const tradeValue = this.calculateTradeValue(
          fromSettlementId,
          targetSettlement.id,
          itemId,
          quantity
        );

        if (tradeValue.profitMargin >= minProfitMargin) {
          opportunities.push({
            ...tradeValue,
            availableQuantity: quantity
          });
        }
      }
    }

    // Sort by profit margin
    opportunities.sort((a, b) => b.profitMargin - a.profitMargin);

    return {
      success: true,
      fromSettlement: fromSettlementId,
      opportunities,
      count: opportunities.length
    };
  }

  /**
   * Get market analysis for a settlement
   */
  getMarketAnalysis(settlementId) {
    const settlement = this._getSettlement(settlementId);
    
    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    if (!this.marketPrices.has(settlementId)) {
      this.initializeMarket(settlementId);
    }

    const prices = this.marketPrices.get(settlementId);
    const inventory = this.storageService?.getSettlementInventory(settlementId) || 
                     { totalInventory: {} };

    const analysis = {
      settlementId,
      settlementName: settlement.name,
      totalItemTypes: Object.keys(prices).length,
      itemsInStock: Object.keys(inventory.totalInventory || {}).length,
      totalInventoryValue: 0,
      priceCategories: {
        veryLow: [],   // < 5 gold
        low: [],       // 5-20 gold
        medium: [],    // 20-50 gold
        high: [],      // 50-100 gold
        veryHigh: []   // > 100 gold
      },
      supplyStatus: {
        oversupplied: [],  // High stock, low price
        undersupplied: [], // Low stock, high price
        balanced: []       // Normal
      }
    };

    // Analyze each item
    for (const [itemId, price] of Object.entries(prices)) {
      const quantity = inventory.totalInventory[itemId] || 0;
      const itemValue = price * quantity;
      analysis.totalInventoryValue += itemValue;

      // Categorize by price
      if (price < 5) {
        analysis.priceCategories.veryLow.push({ itemId, price, quantity });
      } else if (price < 20) {
        analysis.priceCategories.low.push({ itemId, price, quantity });
      } else if (price < 50) {
        analysis.priceCategories.medium.push({ itemId, price, quantity });
      } else if (price < 100) {
        analysis.priceCategories.high.push({ itemId, price, quantity });
      } else {
        analysis.priceCategories.veryHigh.push({ itemId, price, quantity });
      }

      // Analyze supply status
      const item = this._getItem(itemId);
      const basePrice = item?.market?.basePrice || 10;
      const priceRatio = price / basePrice;

      if (quantity > 50 && priceRatio < 0.8) {
        analysis.supplyStatus.oversupplied.push({ itemId, quantity, price, priceRatio });
      } else if (quantity < 10 && priceRatio > 1.2) {
        analysis.supplyStatus.undersupplied.push({ itemId, quantity, price, priceRatio });
      } else {
        analysis.supplyStatus.balanced.push({ itemId, quantity, price, priceRatio });
      }
    }

    return {
      success: true,
      analysis
    };
  }

  /**
   * Simulate transaction and update prices
   */
  recordTransaction(settlementId, itemId, quantity, isBuy, turn) {
    if (!this.marketPrices.has(settlementId)) {
      this.initializeMarket(settlementId);
    }

    const currentPrice = this.getPrice(settlementId, itemId);

    // Transaction affects demand
    const demandChange = isBuy ? quantity * 0.01 : -quantity * 0.01; // 1% per unit
    const currentDemand = this._getDemand(settlementId, itemId);
    const newDemand = Math.max(0, Math.min(2.0, currentDemand + demandChange));

    this.setDemand(settlementId, itemId, newDemand);

    // Record event
    this.marketEvents.push({
      type: 'transaction',
      settlementId,
      itemId,
      quantity,
      isBuy,
      price: currentPrice,
      turn,
      timestamp: Date.now()
    });

    return {
      success: true,
      settlementId,
      itemId,
      quantity,
      price: currentPrice,
      totalValue: currentPrice * quantity,
      newDemand
    };
  }

  /**
   * Calculate market price based on supply/demand
   * @private
   */
  _calculateMarketPrice(itemId, settlementId, currentPrice, supply) {
    const item = this._getItem(itemId);
    const basePrice = item?.market?.basePrice || 10;
    
    // Supply factor (more supply = lower price)
    let supplyFactor = 1.0;
    if (supply > 100) {
      supplyFactor = 0.7; // 30% discount for high supply
    } else if (supply > 50) {
      supplyFactor = 0.85; // 15% discount
    } else if (supply > 20) {
      supplyFactor = 0.95; // 5% discount
    } else if (supply < 5) {
      supplyFactor = 1.5; // 50% premium for scarcity
    } else if (supply < 10) {
      supplyFactor = 1.3; // 30% premium
    } else if (supply < 20) {
      supplyFactor = 1.1; // 10% premium
    }

    // Demand factor
    const demandFactor = this._getDemand(settlementId, itemId);

    // Calculate new price
    let newPrice = basePrice * supplyFactor * demandFactor;

    // Apply volatility (items with high volatility change more)
    const volatility = item?.market?.volatility || 0.1;
    const maxChange = basePrice * volatility;
    const priceChange = newPrice - currentPrice;
    const dampedChange = Math.max(-maxChange, Math.min(maxChange, priceChange));

    // Gradual price adjustment (prevents wild swings)
    newPrice = currentPrice + dampedChange * 0.3; // 30% of desired change per turn

    // Price floor/ceiling
    const minPrice = basePrice * 0.1; // Never below 10% of base
    const maxPrice = basePrice * 5.0; // Never above 500% of base

    return Math.max(minPrice, Math.min(maxPrice, Math.ceil(newPrice)));
  }

  /**
   * Get demand factor for an item
   * @private
   */
  _getDemand(settlementId, itemId) {
    const demands = this.demandFactors.get(settlementId);
    return demands?.[itemId] || 1.0; // Default to neutral demand
  }

  /**
   * Record price in history
   * @private
   */
  _recordPriceHistory(settlementId, itemId, price, turn) {
    if (!this.priceHistory.has(settlementId)) {
      this.priceHistory.set(settlementId, {});
    }

    const history = this.priceHistory.get(settlementId);
    if (!history[itemId]) {
      history[itemId] = [];
    }

    history[itemId].push({
      turn,
      price,
      timestamp: Date.now()
    });

    // Keep only last 100 records per item
    if (history[itemId].length > 100) {
      history[itemId].shift();
    }
  }

  /**
   * Generate market events for significant changes
   * @private
   */
  _generateMarketEvents(settlementId, priceChanges, turn) {
    for (const [itemId, change] of Object.entries(priceChanges)) {
      // Event for large price swings
      if (Math.abs(change.changePercent) >= 25) {
        this.marketEvents.push({
          type: 'price_swing',
          settlementId,
          itemId,
          severity: Math.abs(change.changePercent) >= 50 ? 'major' : 'significant',
          oldPrice: change.oldPrice,
          newPrice: change.newPrice,
          changePercent: change.changePercent,
          turn,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Calculate price volatility
   * @private
   */
  _calculateVolatility(prices) {
    if (prices.length < 2) return 0;

    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      const change = Math.abs((prices[i] - prices[i-1]) / prices[i-1]);
      changes.push(change);
    }

    const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
    return avgChange;
  }

  /**
   * Helper: Get item
   */
  _getItem(itemId) {
    return this.world.items?.find(i => i.id === itemId) || null;
  }

  /**
   * Helper: Get settlement
   */
  _getSettlement(settlementId) {
    return this.world.settlements?.find(s => s.id === settlementId) || null;
  }
}

export default MarketDynamicsService;
