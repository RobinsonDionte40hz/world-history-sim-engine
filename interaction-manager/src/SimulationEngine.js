class SimulationEngine {
  constructor(world, config = {}) {
    this.world = world;
    this.config = {
      ...config,
      complexEvents: {
        enabled: true,
        eventFrequency: 0.1,
        maxConcurrentEvents: 10,
        consciousnessImpact: true
      }
    };
    
    this.eventQueue = [];
    this.history = [];
    this.currentTime = 0;
  }

  async processTimeStep(timeStep, eventFrequency, maxConcurrentEvents) {
    // Update world time
    this.currentTime += timeStep;
    
    // Process regular events
    await this.processRegularEvents(timeStep);
    
    // Process complex events if enabled
    if (this.config.complexEvents.enabled) {
      await this.processComplexEvents(timeStep);
    }
    
    // Record history
    this.recordHistory();
  }

  async processRegularEvents(timeStep) {
    // Process existing events
    const eventsToProcess = this.eventQueue.splice(
      0,
      this.config.complexEvents.maxConcurrentEvents
    );
    
    for (const event of eventsToProcess) {
      await this.processEvent(event);
    }
  }

  async processComplexEvents(timeStep) {
    // Get complex events from the Complex Event Manager
    const complexEvents = this.world.complexEventManager.checkEmergentEvents();
    
    // Add complex events to the queue
    this.eventQueue.push(...complexEvents);
    
    // Process complex events
    const eventsToProcess = this.eventQueue.splice(
      0,
      this.config.complexEvents.maxConcurrentEvents
    );
    
    for (const event of eventsToProcess) {
      await this.processComplexEvent(event);
    }
  }

  async processComplexEvent(event) {
    // Log event
    console.log(`Processing complex event: ${event.type}`, event);
    
    // Apply consciousness impact if enabled
    if (this.config.complexEvents.consciousnessImpact) {
      this.applyConsciousnessImpact(event);
    }
    
    // Process event based on type
    switch (event.type) {
      case 'war':
        await this.processWarEvent(event);
        break;
      case 'trade':
        await this.processTradeEvent(event);
        break;
      case 'political':
        await this.processPoliticalEvent(event);
        break;
      case 'diplomatic':
        await this.processDiplomaticEvent(event);
        break;
    }
    
    // Record event in history
    this.recordEvent(event);
  }

  applyConsciousnessImpact(event) {
    if (!event.consciousnessImpact) return;
    
    // Get collective consciousness level
    const collectiveConsciousness = this.world.getCollectiveConsciousness();
    
    // Apply consciousness modifiers
    if (collectiveConsciousness > 10) {
      // High consciousness reduces negative impacts
      if (event.impact < 0) {
        event.impact *= (1 - (collectiveConsciousness - 10) * 0.1);
      }
    } else if (collectiveConsciousness < 5) {
      // Low consciousness amplifies negative impacts
      if (event.impact < 0) {
        event.impact *= (1 + (5 - collectiveConsciousness) * 0.1);
      }
    }
  }

  async processWarEvent(event) {
    const { war, battle, outcome } = event.data;
    
    // Update war status
    this.world.complexEventManager.warSystem.updateWar(war, outcome);
    
    // Update affected settlements
    if (battle) {
      this.updateSettlementsAfterBattle(battle, outcome);
    }
    
    // Update diplomatic relations
    this.updateDiplomaticRelations(war, outcome);
    
    // Check for consciousness impact
    this.checkWarConsciousnessImpact(war, outcome);
  }

  async processTradeEvent(event) {
    const { market, transaction, priceChange } = event.data;
    
    // Update market status
    this.world.complexEventManager.tradeSystem.updateMarket(market, priceChange);
    
    // Update merchant status
    if (transaction) {
      this.updateMerchantStatus(transaction);
    }
    
    // Check for market crash
    this.checkMarketCrash(market);
  }

  async processPoliticalEvent(event) {
    const { faction, change, type } = event.data;
    
    // Update political status
    this.world.complexEventManager.politicalSystem.updateFaction(faction, change);
    
    // Handle specific political events
    switch (type) {
      case 'succession':
        this.handleSuccession(faction, change);
        break;
      case 'reform':
        this.handleReform(faction, change);
        break;
      case 'crisis':
        this.handleCrisis(faction, change);
        break;
    }
  }

  async processDiplomaticEvent(event) {
    const { faction1, faction2, change, type } = event.data;
    
    // Update diplomatic relations
    this.world.complexEventManager.diplomaticSystem.updateRelation(
      faction1,
      faction2,
      change
    );
    
    // Handle specific diplomatic events
    switch (type) {
      case 'treaty':
        this.handleTreaty(faction1, faction2, change);
        break;
      case 'alliance':
        this.handleAlliance(faction1, faction2, change);
        break;
      case 'conflict':
        this.handleConflict(faction1, faction2, change);
        break;
    }
  }

  // Helper methods for processing specific events

  updateSettlementsAfterBattle(battle, outcome) {
    const { location, attackers, defenders } = battle;
    
    // Update settlement control
    if (outcome.victor === 'attackers') {
      location.faction = attackers.faction;
    }
    
    // Update population
    location.population *= (1 - outcome.civilianCasualties);
    
    // Update infrastructure
    location.infrastructure *= (1 - outcome.infrastructureDamage);
  }

  updateDiplomaticRelations(war, outcome) {
    const { attackers, defenders } = war;
    
    // Update relations between war participants
    this.world.complexEventManager.diplomaticSystem.updateWarRelations(
      attackers,
      defenders,
      outcome
    );
    
    // Update relations with neutral factions
    this.world.factions.forEach(faction => {
      if (faction !== attackers && faction !== defenders) {
        this.updateNeutralFactionRelations(faction, war, outcome);
      }
    });
  }

  checkWarConsciousnessImpact(war, outcome) {
    const collectiveConsciousness = this.world.getCollectiveConsciousness();
    
    // High consciousness reduces war support
    if (collectiveConsciousness > 10) {
      war.support *= (1 - (collectiveConsciousness - 10) * 0.05);
    }
    
    // Record consciousness impact
    this.recordConsciousnessImpact('war', {
      war,
      outcome,
      consciousnessLevel: collectiveConsciousness
    });
  }

  updateMerchantStatus(transaction) {
    const { merchant, profit } = transaction;
    
    // Update merchant wealth
    merchant.wealth += profit;
    
    // Update merchant reputation
    merchant.reputation += profit > 0 ? 0.1 : -0.1;
    
    // Check for merchant transformation
    if (merchant.wealth > 1000 && merchant.reputation > 0.8) {
      this.checkMerchantTransformation(merchant);
    }
  }

  checkMarketCrash(market) {
    if (market.confidence < this.config.complexEvents.marketCrashThreshold) {
      // Trigger market crash
      this.world.complexEventManager.tradeSystem.triggerMarketCrash(market);
      
      // Record crash in history
      this.recordEvent({
        type: 'market_crash',
        data: { market },
        timestamp: this.currentTime
      });
    }
  }

  handleSuccession(faction, change) {
    const { newRuler, method } = change;
    
    // Update faction ruler
    faction.political.ruler = newRuler;
    
    // Handle different succession methods
    switch (method) {
      case 'hereditary':
        this.handleHereditarySuccession(faction, newRuler);
        break;
      case 'elective':
        this.handleElectiveSuccession(faction, newRuler);
        break;
      case 'consciousness':
        this.handleConsciousnessSuccession(faction, newRuler);
        break;
    }
  }

  handleReform(faction, change) {
    const { type, magnitude } = change;
    
    // Apply reform effects
    switch (type) {
      case 'economic':
        this.applyEconomicReform(faction, magnitude);
        break;
      case 'political':
        this.applyPoliticalReform(faction, magnitude);
        break;
      case 'social':
        this.applySocialReform(faction, magnitude);
        break;
    }
  }

  handleCrisis(faction, change) {
    const { type, severity } = change;
    
    // Handle different crisis types
    switch (type) {
      case 'economic':
        this.handleEconomicCrisis(faction, severity);
        break;
      case 'political':
        this.handlePoliticalCrisis(faction, severity);
        break;
      case 'social':
        this.handleSocialCrisis(faction, severity);
        break;
    }
  }

  handleTreaty(faction1, faction2, change) {
    const { type, terms } = change;
    
    // Create treaty
    const treaty = this.world.complexEventManager.diplomaticSystem.createTreaty(
      faction1,
      faction2,
      type,
      terms
    );
    
    // Apply treaty effects
    this.applyTreatyEffects(treaty);
  }

  handleAlliance(faction1, faction2, change) {
    const { strength, terms } = change;
    
    // Create alliance
    const alliance = this.world.complexEventManager.diplomaticSystem.createAlliance(
      faction1,
      faction2,
      strength,
      terms
    );
    
    // Apply alliance effects
    this.applyAllianceEffects(alliance);
  }

  handleConflict(faction1, faction2, change) {
    const { type, severity } = change;
    
    // Handle different conflict types
    switch (type) {
      case 'diplomatic':
        this.handleDiplomaticConflict(faction1, faction2, severity);
        break;
      case 'economic':
        this.handleEconomicConflict(faction1, faction2, severity);
        break;
      case 'military':
        this.handleMilitaryConflict(faction1, faction2, severity);
        break;
    }
  }

  // History recording methods

  recordHistory() {
    const historyEntry = {
      timestamp: this.currentTime,
      worldState: this.getWorldState(),
      activeEvents: this.getActiveEvents(),
      consciousnessLevel: this.world.getCollectiveConsciousness()
    };
    
    this.history.push(historyEntry);
  }

  recordEvent(event) {
    const eventEntry = {
      ...event,
      timestamp: this.currentTime,
      consciousnessImpact: this.calculateConsciousnessImpact(event)
    };
    
    this.history.push(eventEntry);
  }

  recordConsciousnessImpact(type, data) {
    const impactEntry = {
      type: 'consciousness_impact',
      subtype: type,
      data,
      timestamp: this.currentTime
    };
    
    this.history.push(impactEntry);
  }

  // Utility methods

  getWorldState() {
    return {
      settlements: this.world.settlements.map(s => ({
        id: s.id,
        population: s.population,
        faction: s.faction?.id,
        consciousness: s.averageConsciousness
      })),
      factions: this.world.factions.map(f => ({
        id: f.id,
        size: f.size,
        stability: f.political?.stability,
        consciousness: f.averageConsciousness
      })),
      activeWars: this.world.complexEventManager.warSystem.getActiveWars(),
      activeTreaties: this.world.complexEventManager.diplomaticSystem.getActiveTreaties()
    };
  }

  getActiveEvents() {
    return {
      wars: this.world.complexEventManager.warSystem.getActiveWars(),
      trade: this.world.complexEventManager.tradeSystem.getActiveMarkets(),
      political: this.world.complexEventManager.politicalSystem.getActiveCrises(),
      diplomatic: this.world.complexEventManager.diplomaticSystem.getActiveNegotiations()
    };
  }

  calculateConsciousnessImpact(event) {
    if (!this.config.complexEvents.consciousnessImpact) return 0;
    
    const baseImpact = event.impact || 0;
    const collectiveConsciousness = this.world.getCollectiveConsciousness();
    
    // Adjust impact based on consciousness level
    if (collectiveConsciousness > 10) {
      return baseImpact * (1 + (collectiveConsciousness - 10) * 0.1);
    } else if (collectiveConsciousness < 5) {
      return baseImpact * (1 - (5 - collectiveConsciousness) * 0.1);
    }
    
    return baseImpact;
  }
}

export default SimulationEngine; 