/**
 * EconomicEventGenerator - Generates and manages economic events
 * 
 * Creates dynamic economic events (shortages, booms, disasters, discoveries)
 * that affect market prices, production, and create narrative history.
 */

export class EconomicEventGenerator {
  constructor(world, marketService = null, storageService = null, tradeService = null) {
    this.world = world;
    this.marketService = marketService;
    this.storageService = storageService;
    this.tradeService = tradeService;
    this.activeEvents = new Map(); // eventId -> Event
    this.eventHistory = [];
    this.eventTemplates = this._initializeEventTemplates();
  }

  /**
   * Process economic events for a turn
   */
  processEconomicEvents(turn) {
    const results = {
      turn,
      newEvents: [],
      updatedEvents: [],
      expiredEvents: [],
      marketImpacts: []
    };

    // Update active events
    for (const [eventId, event] of this.activeEvents.entries()) {
      if (turn >= event.expirationTurn) {
        // Event expired
        this._endEvent(event, turn);
        results.expiredEvents.push(eventId);
        this.activeEvents.delete(eventId);
      } else {
        // Update ongoing event
        const updateResult = this._updateEvent(event, turn);
        if (updateResult.marketImpacts?.length > 0) {
          results.marketImpacts.push(...updateResult.marketImpacts);
        }
        results.updatedEvents.push(eventId);
      }
    }

    // Generate new events (probability-based)
    const newEvents = this._generateNewEvents(turn);
    for (const event of newEvents) {
      this.activeEvents.set(event.id, event);
      results.newEvents.push(event);
      
      // Apply initial impacts
      const impacts = this._applyEventImpacts(event, turn);
      results.marketImpacts.push(...impacts);
    }

    return {
      success: true,
      results
    };
  }

  /**
   * Manually trigger an economic event
   */
  triggerEvent(eventType, settlementId, options = {}) {
    const template = this.eventTemplates.get(eventType);
    
    if (!template) {
      return { success: false, reason: 'Event type not found' };
    }

    const settlement = this._getSettlement(settlementId);
    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    const event = this._createEvent(template, settlement, options.turn || 0, options);
    this.activeEvents.set(event.id, event);

    // Apply initial impacts
    const impacts = this._applyEventImpacts(event, options.turn || 0);

    return {
      success: true,
      event,
      impacts
    };
  }

  /**
   * Get active events for a settlement
   */
  getActiveEvents(settlementId = null) {
    const events = [];

    for (const event of this.activeEvents.values()) {
      if (!settlementId || event.settlementId === settlementId) {
        events.push({
          id: event.id,
          type: event.type,
          name: event.name,
          description: event.description,
          settlementId: event.settlementId,
          settlementName: event.settlementName,
          startTurn: event.startTurn,
          expirationTurn: event.expirationTurn,
          turnsRemaining: event.expirationTurn - (this.world.turn || 0),
          severity: event.severity,
          affectedItems: event.affectedItems
        });
      }
    }

    return {
      success: true,
      events
    };
  }

  /**
   * Get event history
   */
  getEventHistory(settlementId = null, lastNTurns = 30) {
    let history = this.eventHistory;

    if (settlementId) {
      history = history.filter(e => e.settlementId === settlementId);
    }

    const currentTurn = this.world.turn || 0;
    history = history.filter(e => currentTurn - e.startTurn <= lastNTurns);

    return {
      success: true,
      history: history.slice(-50) // Last 50 events
    };
  }

  /**
   * Initialize event templates
   * @private
   */
  _initializeEventTemplates() {
    const templates = new Map();

    // Resource shortage
    templates.set('resource_shortage', {
      type: 'resource_shortage',
      name: 'Resource Shortage',
      probability: 0.15, // 15% per turn
      duration: { min: 3, max: 10 },
      severity: { min: 0.3, max: 0.8 },
      marketImpact: {
        priceMultiplier: { min: 1.5, max: 3.0 },
        demandMultiplier: { min: 1.2, max: 2.0 }
      },
      conditions: ['low_inventory'], // Requires low inventory to trigger
      effects: ['price_increase', 'production_slowdown']
    });

    // Economic boom
    templates.set('economic_boom', {
      type: 'economic_boom',
      name: 'Economic Boom',
      probability: 0.08,
      duration: { min: 5, max: 15 },
      severity: { min: 0.4, max: 0.9 },
      marketImpact: {
        demandMultiplier: { min: 1.3, max: 2.0 },
        productionBonus: { min: 1.1, max: 1.4 }
      },
      conditions: ['high_trade_volume', 'high_employment'],
      effects: ['increased_demand', 'higher_wages', 'more_construction']
    });

    // Natural disaster
    templates.set('natural_disaster', {
      type: 'natural_disaster',
      name: 'Natural Disaster',
      probability: 0.05,
      duration: { min: 2, max: 8 },
      severity: { min: 0.5, max: 1.0 },
      marketImpact: {
        supplyReduction: { min: 0.2, max: 0.6 },
        priceMultiplier: { min: 1.8, max: 4.0 }
      },
      conditions: [],
      effects: ['building_damage', 'resource_loss', 'production_halt', 'price_spike']
    });

    // Trade disruption
    templates.set('trade_disruption', {
      type: 'trade_disruption',
      name: 'Trade Disruption',
      probability: 0.10,
      duration: { min: 3, max: 12 },
      severity: { min: 0.3, max: 0.7 },
      marketImpact: {
        priceMultiplier: { min: 1.2, max: 2.0 },
        supplyReduction: { min: 0.1, max: 0.4 }
      },
      conditions: ['active_trade_routes'],
      effects: ['reduced_imports', 'price_volatility', 'caravan_delays']
    });

    // Resource discovery
    templates.set('resource_discovery', {
      type: 'resource_discovery',
      name: 'Resource Discovery',
      probability: 0.06,
      duration: { min: 10, max: 30 },
      severity: { min: 0.4, max: 0.9 },
      marketImpact: {
        priceMultiplier: { min: 0.4, max: 0.8 },
        supplyIncrease: { min: 1.3, max: 2.5 }
      },
      conditions: [],
      effects: ['price_decrease', 'production_increase', 'new_building_opportunities']
    });

    // Market crash
    templates.set('market_crash', {
      type: 'market_crash',
      name: 'Market Crash',
      probability: 0.04,
      duration: { min: 5, max: 15 },
      severity: { min: 0.6, max: 1.0 },
      marketImpact: {
        priceMultiplier: { min: 0.3, max: 0.7 },
        demandMultiplier: { min: 0.4, max: 0.8 }
      },
      conditions: ['overproduction', 'high_inventory'],
      effects: ['price_collapse', 'layoffs', 'building_closures']
    });

    // Labor shortage
    templates.set('labor_shortage', {
      type: 'labor_shortage',
      name: 'Labor Shortage',
      probability: 0.08,
      duration: { min: 4, max: 10 },
      severity: { min: 0.3, max: 0.7 },
      marketImpact: {
        productionPenalty: { min: 0.6, max: 0.9 },
        wageMultiplier: { min: 1.2, max: 1.8 }
      },
      conditions: ['low_unemployment'],
      effects: ['production_reduction', 'wage_increase', 'construction_delays']
    });

    // Technological breakthrough
    templates.set('tech_breakthrough', {
      type: 'tech_breakthrough',
      name: 'Technological Breakthrough',
      probability: 0.03,
      duration: { min: 20, max: 50 },
      severity: { min: 0.5, max: 1.0 },
      marketImpact: {
        productionBonus: { min: 1.2, max: 1.8 },
        priceMultiplier: { min: 0.7, max: 0.9 }
      },
      conditions: [],
      effects: ['efficiency_increase', 'new_recipes', 'quality_improvement']
    });

    return templates;
  }

  /**
   * Generate new events based on probabilities and conditions
   * @private
   */
  _generateNewEvents(turn) {
    const newEvents = [];
    const settlements = this.world.settlements || [];

    for (const settlement of settlements) {
      // Check each event template
      for (const [eventType, template] of this.eventTemplates.entries()) {
        // Check if conditions are met
        if (!this._checkEventConditions(template, settlement)) {
          continue;
        }

        // Check probability
        if (Math.random() < template.probability) {
          const event = this._createEvent(template, settlement, turn);
          newEvents.push(event);
        }
      }
    }

    return newEvents;
  }

  /**
   * Create event instance from template
   * @private
   */
  _createEvent(template, settlement, turn, options = {}) {
    const duration = options.duration || 
                    Math.floor(Math.random() * (template.duration.max - template.duration.min + 1)) + 
                    template.duration.min;
    
    const severity = options.severity || 
                    Math.random() * (template.severity.max - template.severity.min) + 
                    template.severity.min;

    // Select affected items
    const affectedItems = options.affectedItems || this._selectAffectedItems(template, settlement);

    const eventId = `event_${turn}_${settlement.id}_${Math.random().toString(36).substr(2, 9)}`;

    const event = {
      id: eventId,
      type: template.type,
      name: template.name,
      description: this._generateEventDescription(template, settlement, severity),
      settlementId: settlement.id,
      settlementName: settlement.name,
      startTurn: turn,
      expirationTurn: turn + duration,
      duration,
      severity,
      template,
      affectedItems,
      impacts: {
        priceMultipliers: {},
        demandMultipliers: {},
        supplyModifiers: {},
        productionModifiers: {},
        wageModifiers: {}
      },
      status: 'active'
    };

    // Calculate specific impacts
    this._calculateEventImpacts(event);

    // Add to history
    this.eventHistory.push({
      id: eventId,
      type: template.type,
      name: template.name,
      settlementId: settlement.id,
      settlementName: settlement.name,
      startTurn: turn,
      duration,
      severity
    });

    return event;
  }

  /**
   * Check if event conditions are met
   * @private
   */
  _checkEventConditions(template, settlement) {
    if (!template.conditions || template.conditions.length === 0) {
      return true;
    }

    for (const condition of template.conditions) {
      switch (condition) {
        case 'low_inventory': {
          const inventory = this.storageService?.getSettlementInventory(settlement.id);
          if (!inventory?.success) return false;
          const totalItems = Object.values(inventory.totalInventory).reduce((sum, q) => sum + q, 0);
          if (totalItems > 100) return false;
          break;
        }

        case 'high_inventory': {
          const inventory = this.storageService?.getSettlementInventory(settlement.id);
          if (!inventory?.success) return false;
          const totalItems = Object.values(inventory.totalInventory).reduce((sum, q) => sum + q, 0);
          if (totalItems < 500) return false;
          break;
        }

        case 'high_trade_volume': {
          const tradeStats = this.tradeService?.getTradeStatistics(settlement.id);
          if (!tradeStats?.success || tradeStats.stats.totalExports < 1000) return false;
          break;
        }

        case 'active_trade_routes': {
          const routes = this.tradeService?.getSettlementTradeRoutes(settlement.id);
          if (!routes?.success || routes.routes.total < 1) return false;
          break;
        }

        case 'low_unemployment': {
          // Check employment rate
          const totalWorkers = (settlement.buildings || []).reduce((sum, b) => 
            sum + (b.workers?.size || 0), 0);
          if (totalWorkers < settlement.population?.total * 0.8) return false;
          break;
        }

        case 'high_employment': {
          const totalWorkers = (settlement.buildings || []).reduce((sum, b) => 
            sum + (b.workers?.size || 0), 0);
          if (totalWorkers < settlement.population?.total * 0.7) return false;
          break;
        }

        case 'overproduction': {
          const inventory = this.storageService?.getSettlementInventory(settlement.id);
          if (!inventory?.success) return false;
          if (inventory.totalUsed < inventory.totalCapacity * 0.9) return false;
          break;
        }
      }
    }

    return true;
  }

  /**
   * Select affected items for event
   * @private
   */
  _selectAffectedItems(template, settlement) {
    const inventory = this.storageService?.getSettlementInventory(settlement.id);
    if (!inventory?.success) return [];

    const availableItems = Object.keys(inventory.totalInventory);
    if (availableItems.length === 0) return [];

    // Select 1-3 random items
    const count = Math.min(Math.floor(Math.random() * 3) + 1, availableItems.length);
    const selected = [];

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const itemId = availableItems[randomIndex];
      if (!selected.includes(itemId)) {
        selected.push(itemId);
      }
    }

    return selected;
  }

  /**
   * Calculate specific impacts for event
   * @private
   */
  _calculateEventImpacts(event) {
    const { template, severity, affectedItems } = event;

    for (const itemId of affectedItems) {
      // Price impacts
      if (template.marketImpact.priceMultiplier) {
        const multiplier = this._interpolate(
          template.marketImpact.priceMultiplier.min,
          template.marketImpact.priceMultiplier.max,
          severity
        );
        event.impacts.priceMultipliers[itemId] = multiplier;
      }

      // Demand impacts
      if (template.marketImpact.demandMultiplier) {
        const multiplier = this._interpolate(
          template.marketImpact.demandMultiplier.min,
          template.marketImpact.demandMultiplier.max,
          severity
        );
        event.impacts.demandMultipliers[itemId] = multiplier;
      }

      // Supply impacts
      if (template.marketImpact.supplyReduction) {
        const reduction = this._interpolate(
          template.marketImpact.supplyReduction.min,
          template.marketImpact.supplyReduction.max,
          severity
        );
        event.impacts.supplyModifiers[itemId] = 1 - reduction;
      }

      if (template.marketImpact.supplyIncrease) {
        const increase = this._interpolate(
          template.marketImpact.supplyIncrease.min,
          template.marketImpact.supplyIncrease.max,
          severity
        );
        event.impacts.supplyModifiers[itemId] = increase;
      }

      // Production impacts
      if (template.marketImpact.productionBonus) {
        const bonus = this._interpolate(
          template.marketImpact.productionBonus.min,
          template.marketImpact.productionBonus.max,
          severity
        );
        event.impacts.productionModifiers[itemId] = bonus;
      }

      if (template.marketImpact.productionPenalty) {
        const penalty = this._interpolate(
          template.marketImpact.productionPenalty.min,
          template.marketImpact.productionPenalty.max,
          severity
        );
        event.impacts.productionModifiers[itemId] = penalty;
      }
    }

    // Wage impacts (apply to all workers in settlement)
    if (template.marketImpact.wageMultiplier) {
      const multiplier = this._interpolate(
        template.marketImpact.wageMultiplier.min,
        template.marketImpact.wageMultiplier.max,
        severity
      );
      event.impacts.wageModifiers.all = multiplier;
    }
  }

  /**
   * Apply event impacts to market/settlement
   * @private
   */
  _applyEventImpacts(event, turn) {
    const impacts = [];
    const settlement = this._getSettlement(event.settlementId);

    if (!settlement) return impacts;

    // Apply price impacts
    for (const [itemId, multiplier] of Object.entries(event.impacts.priceMultipliers)) {
      if (this.marketService) {
        const currentPrice = this.marketService.getPrice(settlement.id, itemId);
        const newPrice = currentPrice * multiplier;
        
        // Update market price (via direct manipulation or service method)
        impacts.push({
          type: 'price_change',
          itemId,
          settlementId: settlement.id,
          oldPrice: currentPrice,
          newPrice,
          multiplier,
          reason: event.name
        });
      }
    }

    // Apply supply impacts (reduce inventory)
    for (const [itemId, modifier] of Object.entries(event.impacts.supplyModifiers)) {
      if (modifier < 1) {
        // Reduce inventory
        const inventory = this.storageService?.getSettlementInventory(settlement.id);
        if (inventory?.success) {
          const currentQuantity = inventory.totalInventory[itemId] || 0;
          const reduction = Math.floor(currentQuantity * (1 - modifier));
          
          impacts.push({
            type: 'supply_reduction',
            itemId,
            settlementId: settlement.id,
            reduction,
            reason: event.name
          });
        }
      }
    }

    return impacts;
  }

  /**
   * Update ongoing event
   * @private
   */
  _updateEvent(event, turn) {
    // Some events have dynamic effects
    const result = {
      eventId: event.id,
      marketImpacts: []
    };

    // Severity can change over time for some events
    if (event.type === 'natural_disaster') {
      // Severity decreases over time as recovery happens
      const progress = (turn - event.startTurn) / event.duration;
      event.severity *= (1 - progress * 0.1);
      this._calculateEventImpacts(event);
    }

    return result;
  }

  /**
   * End an event
   * @private
   */
  _endEvent(event, turn) {
    event.status = 'expired';
    event.endTurn = turn;

    // Some events have lasting effects
    // This could trigger follow-up events or permanent changes
  }

  /**
   * Generate event description
   * @private
   */
  _generateEventDescription(template, settlement, severity) {
    const severityText = severity > 0.7 ? 'severe' : severity > 0.4 ? 'moderate' : 'minor';
    
    const descriptions = {
      resource_shortage: `A ${severityText} shortage of key resources affects ${settlement.name}'s economy.`,
      economic_boom: `${settlement.name} experiences a ${severityText} economic boom with increased trade and prosperity.`,
      natural_disaster: `A ${severityText} natural disaster strikes ${settlement.name}, causing damage and disruption.`,
      trade_disruption: `${severityText} trade disruptions affect ${settlement.name}'s merchant routes.`,
      resource_discovery: `A ${severityText} resource discovery brings new wealth to ${settlement.name}.`,
      market_crash: `A ${severityText} market crash devastates ${settlement.name}'s economy.`,
      labor_shortage: `A ${severityText} labor shortage hampers production in ${settlement.name}.`,
      tech_breakthrough: `A ${severityText} technological breakthrough improves efficiency in ${settlement.name}.`
    };

    return descriptions[template.type] || `An economic event affects ${settlement.name}.`;
  }

  /**
   * Interpolate between min and max based on severity
   * @private
   */
  _interpolate(min, max, severity) {
    return min + (max - min) * severity;
  }

  /**
   * Helper: Get settlement
   * @private
   */
  _getSettlement(settlementId) {
    return this.world.settlements?.find(s => s.id === settlementId) || null;
  }
}

export default EconomicEventGenerator;
