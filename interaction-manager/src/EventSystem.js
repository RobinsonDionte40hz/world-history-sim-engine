// Core Event System
class EventSystem {
  constructor(world) {
    this.world = world;
    this.events = [];
    this.eventHandlers = new Map();
    this.activeEvents = new Map();
    this.eventHistory = [];
  }

  // Event registration and handling
  registerEventHandler(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }

  triggerEvent(event) {
    // Add event to history
    this.eventHistory.push({
      ...event,
      timestamp: this.world.currentTime
    });

    // Maintain history size
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }

    // Handle event
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));

    // If event is ongoing, add to active events
    if (event.duration) {
      this.activeEvents.set(event.id, {
        ...event,
        startTime: this.world.currentTime,
        endTime: this.world.currentTime + event.duration
      });
    }

    return event;
  }

  // Event processing
  processEvents() {
    // Process active events
    for (const [id, event] of this.activeEvents) {
      if (this.world.currentTime >= event.endTime) {
        // Event has ended
        this.triggerEvent({
          type: `${event.type}_ended`,
          originalEvent: event,
          timestamp: this.world.currentTime
        });
        this.activeEvents.delete(id);
      } else {
        // Process ongoing event
        this.processOngoingEvent(event);
      }
    }
  }

  processOngoingEvent(event) {
    // Event-specific processing
    switch (event.type) {
      case 'war':
        this.processWarEvent(event);
        break;
      case 'diplomatic_negotiation':
        this.processDiplomaticEvent(event);
        break;
      case 'trade_route':
        this.processTradeEvent(event);
        break;
      case 'political_intrigue':
        this.processPoliticalEvent(event);
        break;
    }
  }

  // Event generation
  generateEvents() {
    const events = [];

    // Check for war events
    events.push(...this.generateWarEvents());

    // Check for diplomatic events
    events.push(...this.generateDiplomaticEvents());

    // Check for trade events
    events.push(...this.generateTradeEvents());

    // Check for political events
    events.push(...this.generatePoliticalEvents());

    return events;
  }

  generateWarEvents() {
    const events = [];
    const factions = Array.from(this.world.factions.values());

    // Check for potential conflicts
    for (let i = 0; i < factions.length; i++) {
      for (let j = i + 1; j < factions.length; j++) {
        const faction1 = factions[i];
        const faction2 = factions[j];

        // Check if war is likely
        if (this.isWarLikely(faction1, faction2)) {
          events.push({
            type: 'war_tensions_rising',
            belligerents: {
              faction1: faction1.id,
              faction2: faction2.id
            },
            timestamp: this.world.currentTime
          });
        }
      }
    }

    return events;
  }

  generateDiplomaticEvents() {
    const events = [];
    const factions = Array.from(this.world.factions.values());

    // Check for diplomatic opportunities
    for (let i = 0; i < factions.length; i++) {
      for (let j = i + 1; j < factions.length; j++) {
        const faction1 = factions[i];
        const faction2 = factions[j];

        // Check if diplomatic action is possible
        if (this.isDiplomaticActionPossible(faction1, faction2)) {
          events.push({
            type: 'diplomatic_opportunity',
            factions: {
              faction1: faction1.id,
              faction2: faction2.id
            },
            timestamp: this.world.currentTime
          });
        }
      }
    }

    return events;
  }

  generateTradeEvents() {
    const events = [];
    const markets = Array.from(this.world.marketSystem.markets.values());

    // Check for market opportunities
    markets.forEach(market => {
      if (this.hasMarketOpportunity(market)) {
        events.push({
          type: 'market_opportunity',
          market: market.id,
          timestamp: this.world.currentTime
        });
      }
    });

    return events;
  }

  generatePoliticalEvents() {
    const events = [];
    const factions = Array.from(this.world.factions.values());

    // Check for political intrigue
    factions.forEach(faction => {
      if (this.hasPoliticalIntrigue(faction)) {
        events.push({
          type: 'political_intrigue',
          faction: faction.id,
          timestamp: this.world.currentTime
        });
      }
    });

    return events;
  }

  // Helper methods
  isWarLikely(faction1, faction2) {
    const relationship = this.world.diplomaticRelations.getRelationshipState(faction1, faction2);
    return relationship.opinion < -50 && relationship.trust < 20;
  }

  isDiplomaticActionPossible(faction1, faction2) {
    const relationship = this.world.diplomaticRelations.getRelationshipState(faction1, faction2);
    return Math.abs(relationship.opinion) < 50 && relationship.trust > 30;
  }

  hasMarketOpportunity(market) {
    return market.marketConfidence > 0.7 && 
           Object.values(market.commodities).some(c => c.supply < c.demand * 0.5);
  }

  hasPoliticalIntrigue(faction) {
    return faction.courtiers.size > 5 && 
           Array.from(faction.courtiers.values()).some(c => c.ambition > 0.7);
  }

  // Event processing methods
  processWarEvent(event) {
    // Update war state
    const war = this.activeEvents.get(event.id);
    if (!war) return;

    // Calculate war progress
    const progress = this.calculateWarProgress(war);
    war.progress = progress;

    // Generate battle events
    if (Math.random() < 0.2) { // 20% chance of battle each day
      this.triggerEvent({
        type: 'battle',
        war: war.id,
        location: this.determineBattleLocation(war),
        timestamp: this.world.currentTime
      });
    }

    // Check for war resolution
    if (progress >= 100 || progress <= -100) {
      this.triggerEvent({
        type: 'war_ended',
        war: war.id,
        victor: progress >= 100 ? war.attackers : war.defenders,
        timestamp: this.world.currentTime
      });
    }
  }

  processDiplomaticEvent(event) {
    // Update diplomatic state
    const negotiation = this.activeEvents.get(event.id);
    if (!negotiation) return;

    // Process negotiation rounds
    if (negotiation.currentRound < negotiation.maxRounds) {
      const round = this.processNegotiationRound(negotiation);
      negotiation.rounds.push(round);
      negotiation.currentRound++;

      // Check for agreement
      if (round.agreement) {
        this.triggerEvent({
          type: 'diplomatic_agreement',
          negotiation: negotiation.id,
          terms: round.terms,
          timestamp: this.world.currentTime
        });
      }
    }
  }

  processTradeEvent(event) {
    // Update trade route state
    const route = this.activeEvents.get(event.id);
    if (!route) return;

    // Process trade transactions
    const transactions = this.processTradeTransactions(route);
    route.transactions.push(...transactions);

    // Update route profitability
    route.profitability = this.calculateRouteProfitability(route);

    // Check for route events
    if (Math.random() < 0.1) { // 10% chance of event each day
      this.triggerEvent({
        type: 'trade_route_event',
        route: route.id,
        event: this.generateTradeRouteEvent(route),
        timestamp: this.world.currentTime
      });
    }
  }

  processPoliticalEvent(event) {
    // Update intrigue state
    const intrigue = this.activeEvents.get(event.id);
    if (!intrigue) return;

    // Process intrigue progress
    const progress = this.processIntrigueProgress(intrigue);
    intrigue.progress = progress;

    // Check for discovery
    if (Math.random() < 0.05) { // 5% chance of discovery each day
      this.triggerEvent({
        type: 'intrigue_discovered',
        intrigue: intrigue.id,
        discoverer: this.determineIntrigueDiscoverer(intrigue),
        timestamp: this.world.currentTime
      });
    }

    // Check for completion
    if (progress >= 100) {
      this.triggerEvent({
        type: 'intrigue_completed',
        intrigue: intrigue.id,
        success: this.determineIntrigueSuccess(intrigue),
        timestamp: this.world.currentTime
      });
    }
  }

  // Utility methods
  calculateWarProgress(war) {
    const attackerStrength = this.calculateFactionStrength(war.attackers);
    const defenderStrength = this.calculateFactionStrength(war.defenders);
    const ratio = attackerStrength / defenderStrength;
    return (ratio - 1) * 100;
  }

  calculateFactionStrength(faction) {
    return faction.military * 0.7 + 
           faction.economy * 0.2 + 
           faction.diplomacy * 0.1;
  }

  determineBattleLocation(war) {
    // Find contested territory
    const territories = this.world.getContestedTerritories(war);
    return territories[Math.floor(Math.random() * territories.length)];
  }

  processNegotiationRound(negotiation) {
    const proposerRoll = this.rollDiplomaticSkill(negotiation.proposer);
    const receiverRoll = this.rollDiplomaticSkill(negotiation.receiver);

    return {
      proposerRoll,
      receiverRoll,
      agreement: Math.abs(proposerRoll.total - receiverRoll.total) < 5,
      terms: this.generateCompromiseTerms(negotiation, proposerRoll, receiverRoll)
    };
  }

  rollDiplomaticSkill(diplomat) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const charismaBonus = Math.floor((diplomat.attributes.CHA - 10) / 2);
    const wisdomBonus = Math.floor((diplomat.attributes.WIS - 10) / 2);
    const consciousnessBonus = Math.floor((diplomat.consciousness.currentFrequency - 7) / 3);

    return {
      roll,
      total: roll + charismaBonus + wisdomBonus + consciousnessBonus + diplomat.diplomacySkill,
      criticalSuccess: roll === 20,
      criticalFailure: roll === 1
    };
  }

  processTradeTransactions(route) {
    const transactions = [];
    const market1 = this.world.marketSystem.markets.get(route.market1);
    const market2 = this.world.marketSystem.markets.get(route.market2);

    route.goods.forEach(good => {
      const price1 = market1.commodities[good].currentPrice;
      const price2 = market2.commodities[good].currentPrice;

      if (price2 > price1 * 1.2) { // 20% profit margin
        const quantity = Math.min(
          market1.commodities[good].supply,
          market2.commodities[good].demand - market2.commodities[good].supply
        );

        if (quantity > 0) {
          transactions.push({
            good,
            quantity,
            buyPrice: price1,
            sellPrice: price2,
            profit: (price2 - price1) * quantity
          });
        }
      }
    });

    return transactions;
  }

  calculateRouteProfitability(route) {
    return route.transactions.reduce((total, t) => total + t.profit, 0);
  }

  generateTradeRouteEvent(route) {
    const events = [
      {
        type: 'bandit_attack',
        probability: 0.3,
        effect: { lostGoods: 0.2 }
      },
      {
        type: 'market_opportunity',
        probability: 0.2,
        effect: { profitMultiplier: 1.5 }
      },
      {
        type: 'natural_disaster',
        probability: 0.1,
        effect: { routeClosed: true, duration: 7 }
      }
    ];

    const roll = Math.random();
    let cumulativeProbability = 0;

    for (const event of events) {
      cumulativeProbability += event.probability;
      if (roll < cumulativeProbability) {
        return event;
      }
    }

    return events[0]; // Default to first event
  }

  processIntrigueProgress(intrigue) {
    const baseProgress = 5;
    const skillBonus = intrigue.conspirators.reduce((total, c) => 
      total + c.skills.intrigue, 0) / intrigue.conspirators.length;
    const consciousnessBonus = intrigue.conspirators.reduce((total, c) =>
      total + (c.consciousness.currentFrequency - 7) / 3, 0) / intrigue.conspirators.length;

    return baseProgress + skillBonus + consciousnessBonus;
  }

  determineIntrigueDiscoverer(intrigue) {
    const potentialDiscoverers = Array.from(this.world.courtiers.values())
      .filter(c => !intrigue.conspirators.includes(c.id));

    return potentialDiscoverers.reduce((best, current) => {
      const currentRoll = this.rollIntrigueSkill(current);
      const bestRoll = best ? this.rollIntrigueSkill(best) : { total: 0 };
      return currentRoll.total > bestRoll.total ? current : best;
    }, null);
  }

  rollIntrigueSkill(courtier) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const intBonus = Math.floor((courtier.attributes.INT - 10) / 2);
    const wisBonus = Math.floor((courtier.attributes.WIS - 10) / 2);
    const consciousnessBonus = Math.floor((courtier.consciousness.currentFrequency - 7) / 3);

    return {
      roll,
      total: roll + intBonus + wisBonus + consciousnessBonus + courtier.skills.intrigue,
      criticalSuccess: roll === 20,
      criticalFailure: roll === 1
    };
  }

  determineIntrigueSuccess(intrigue) {
    const totalSkill = intrigue.conspirators.reduce((total, c) => 
      total + c.skills.intrigue, 0);
    const averageConsciousness = intrigue.conspirators.reduce((total, c) =>
      total + c.consciousness.currentFrequency, 0) / intrigue.conspirators.length;

    return totalSkill > 50 && averageConsciousness > 8;
  }
}

export default EventSystem; 