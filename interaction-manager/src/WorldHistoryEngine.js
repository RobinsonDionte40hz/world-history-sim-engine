import { ComplexEventManager } from './ComplexEventManager';

class WorldHistoryEngine {
  constructor(config = {}) {
    this.config = {
      ...config,
      complexEvents: {
        enabled: true,
        war: {
          baseWarChance: 0.05,
          consciousnessWarModifier: true,
          heroEmergenceRate: 0.1,
          warExhaustionRate: 0.02
        },
        trade: {
          priceUpdateFrequency: 'daily',
          merchantSpawnRate: 0.1,
          consciousnessTradeBonus: true,
          marketCrashThreshold: 0.3
        },
        political: {
          successionType: 'dynamic',
          intrigueFrequency: 0.2,
          stabilityDecayRate: 0.01,
          consciousnessReformChance: 0.05
        },
        diplomatic: {
          treatyDuration: 100,
          defaultRelation: 0,
          consciousnessResonanceEffect: true
        }
      }
    };
    
    this.world = null;
    this.simulationEngine = null;
    this.complexEventManager = null;
  }

  async initialize(config) {
    // Initialize world and simulation engine
    await this.initializeWorld(config);
    await this.initializeSimulationEngine(config);
    
    // Initialize Complex Event Manager if enabled
    if (this.config.complexEvents.enabled) {
      this.complexEventManager = new ComplexEventManager(
        this.world,
        this.simulationEngine
      );
      await this.complexEventManager.initialize(this.config.complexEvents);
    }
    
    // Initialize complex systems
    await this.initializeComplexSystems();
  }

  async initializeComplexSystems() {
    if (!this.config.complexEvents.enabled) return;
    
    // Initialize markets for all settlements
    this.world.settlements.forEach(settlement => {
      this.complexEventManager.tradeSystem.initializeMarket(settlement);
    });
    
    // Initialize political structures for all factions
    this.world.factions.forEach(faction => {
      this.complexEventManager.politicalSystem.initializeFaction(faction);
    });
    
    // Set up initial diplomatic relations
    await this.initializeDiplomacy();
  }

  async initializeDiplomacy() {
    if (!this.config.complexEvents.enabled) return;
    
    // Initialize relations between all factions
    for (const faction1 of this.world.factions) {
      for (const faction2 of this.world.factions) {
        if (faction1.id !== faction2.id) {
          await this.complexEventManager.diplomaticSystem.initializeRelation(
            faction1,
            faction2
          );
        }
      }
    }
  }

  async processTimeStep(timeStep, eventFrequency, maxConcurrentEvents) {
    // Process regular simulation
    await this.simulationEngine.processTimeStep(timeStep);
    
    // Process complex events if enabled
    if (this.config.complexEvents.enabled) {
      await this.complexEventManager.update(timeStep);
      
      // Check for emergent complex events
      const complexEvents = this.complexEventManager.checkEmergentEvents();
      this.simulationEngine.eventQueue.push(...complexEvents);
      
      // Record complex event history
      this.recordComplexEventHistory();
    }
  }

  recordComplexEventHistory() {
    if (!this.config.complexEvents.enabled) return;
    
    const history = {
      timestamp: this.world.currentTime,
      wars: this.complexEventManager.warSystem.getActiveWars(),
      trade: this.complexEventManager.tradeSystem.getMarketStatus(),
      political: this.complexEventManager.politicalSystem.getPoliticalStatus(),
      diplomatic: this.complexEventManager.diplomaticSystem.getDiplomaticStatus()
    };
    
    this.simulationEngine.history.push(history);
  }

  // Extend existing methods to include complex events

  generateWorld(config) {
    const world = super.generateWorld(config);
    
    if (this.config.complexEvents.enabled) {
      // Generate initial trade routes
      this.generateInitialTradeRoutes(world);
      
      // Establish initial political structures
      this.generateInitialGovernments(world);
      
      // Create starting diplomatic relations
      this.generateInitialDiplomacy(world);
    }
    
    return world;
  }

  generateInitialTradeRoutes(world) {
    world.settlements.forEach(settlement => {
      const nearbySettlements = this.findNearbySettlements(settlement, 5);
      nearbySettlements.forEach(neighbor => {
        if (this.shouldCreateTradeRoute(settlement, neighbor)) {
          this.complexEventManager.tradeSystem.createTradeRoute(
            settlement.id,
            neighbor.id
          );
        }
      });
    });
  }

  generateInitialGovernments(world) {
    world.factions.forEach(faction => {
      const governmentType = this.determineInitialGovernment(faction);
      this.complexEventManager.politicalSystem.initializeGovernment(
        faction,
        governmentType
      );
    });
  }

  generateInitialDiplomacy(world) {
    world.factions.forEach(faction => {
      const initialStance = this.determineInitialDiplomaticStance(faction);
      this.complexEventManager.diplomaticSystem.setInitialStance(
        faction,
        initialStance
      );
    });
  }

  // Helper methods

  findNearbySettlements(settlement, radius) {
    return this.complexEventManager.spatialIndex.findNearby(
      settlement.position,
      radius
    );
  }

  shouldCreateTradeRoute(settlement1, settlement2) {
    // Check distance
    const distance = this.calculateDistance(
      settlement1.position,
      settlement2.position
    );
    if (distance > 5) return false;
    
    // Check resource complementarity
    const hasComplementaryResources = this.checkResourceComplementarity(
      settlement1,
      settlement2
    );
    
    // Check political relations
    const politicalCompatibility = this.checkPoliticalCompatibility(
      settlement1.faction,
      settlement2.faction
    );
    
    return hasComplementaryResources && politicalCompatibility > 0.5;
  }

  determineInitialGovernment(faction) {
    const factors = {
      size: faction.size,
      culture: faction.culture,
      consciousness: faction.averageConsciousness
    };
    
    if (factors.consciousness > 10) {
      return 'consciousness_based';
    } else if (factors.size > 1000) {
      return 'monarchy';
    } else {
      return 'oligarchy';
    }
  }

  determineInitialDiplomaticStance(faction) {
    const factors = {
      culture: faction.culture,
      consciousness: faction.averageConsciousness,
      size: faction.size
    };
    
    if (factors.consciousness > 10) {
      return 'cooperative';
    } else if (factors.size > 1000) {
      return 'assertive';
    } else {
      return 'neutral';
    }
  }

  calculateDistance(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
    );
  }

  checkResourceComplementarity(settlement1, settlement2) {
    const resources1 = new Set(settlement1.resources);
    const resources2 = new Set(settlement2.resources);
    
    // Check if settlements have different resources
    return [...resources1].some(resource => !resources2.has(resource));
  }

  checkPoliticalCompatibility(faction1, faction2) {
    if (!faction1 || !faction2) return 0;
    
    const culturalAffinity = this.calculateCulturalAffinity(
      faction1.culture,
      faction2.culture
    );
    
    const consciousnessAlignment = Math.abs(
      faction1.averageConsciousness - faction2.averageConsciousness
    ) < 2;
    
    return (culturalAffinity + (consciousnessAlignment ? 0.5 : 0)) / 1.5;
  }

  calculateCulturalAffinity(culture1, culture2) {
    // Simple cultural affinity calculation
    const sharedTraits = culture1.traits.filter(trait =>
      culture2.traits.includes(trait)
    ).length;
    
    return sharedTraits / Math.max(culture1.traits.length, culture2.traits.length);
  }
}

export default WorldHistoryEngine; 