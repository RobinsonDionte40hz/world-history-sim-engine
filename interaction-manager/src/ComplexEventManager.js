// import TradeSystem from './TradeSystem';
import WarSystem from './WarSystem';
import PoliticalSystem from './PoliticalSystem';
import DiplomaticSystem from './DiplomaticSystem';

export class ComplexEventManager {
  constructor(world, simulationEngine) {
    this.world = world;
    this.simulationEngine = simulationEngine;
    
    // Initialize subsystems
    this.warSystem = new WarSystem(world);
    // const tradeSystem = new TradeSystem(world); // Commented out as TradeSystem is not defined
    this.politicalSystem = new PoliticalSystem(world);
    this.diplomaticSystem = new DiplomaticSystem(world);
    
    // Event tracking
    this.activeEvents = new Map();
    this.eventHistory = [];
    this.eventCooldowns = new Map();
    
    // Performance optimization
    // const spatialIndex = new SpatialIndex(world.bounds); // Commented out as SpatialIndex is not defined
    this.eventAggregator = new EventAggregator();
    
    // Debug tools
    this.eventInspector = new EventInspector();
    this.stateValidator = new StateValidator();
  }

  async initialize(config) {
    // Initialize markets for all settlements
    // this.tradeSystem.initializeMarket(settlement); // Commented out as TradeSystem is not defined
    this.world.settlements.forEach(settlement => {
      // this.tradeSystem.initializeMarket(settlement); // Commented out as TradeSystem is not defined
    });
    
    // Initialize political structures for all factions
    this.world.factions.forEach(faction => {
      this.politicalSystem.initializeFaction(faction);
    });
    
    // Set up initial diplomatic relations
    await this.initializeDiplomacy();
    
    // Initialize spatial index
    // this.initializeSpatialIndex(); // Commented out as SpatialIndex is not defined
  }

  async update(timeStep) {
    // Process each subsystem
    await Promise.all([
      this.warSystem.update(timeStep),
      // this.tradeSystem.update(timeStep), // Commented out as TradeSystem is not defined
      this.politicalSystem.update(timeStep),
      this.diplomaticSystem.update(timeStep)
    ]);
    
    // Check for emergent events
    const emergentEvents = this.checkEmergentEvents();
    this.processEvents(emergentEvents);
    
    // Validate world state
    const issues = this.stateValidator.validateWorldState(this.world);
    if (issues.length > 0) {
      console.warn('World state validation issues:', issues);
    }
  }

  checkEmergentEvents() {
    const events = [];
    
    // Check for war triggers
    if (this.canTriggerEvent('war')) {
      const warEvents = this.warSystem.checkWarTriggers();
      events.push(...warEvents);
    }
    
    // Check for market events
    if (this.canTriggerEvent('market')) {
      // const marketEvents = this.tradeSystem.checkMarketEvents(); // Commented out as TradeSystem is not defined
      events.push(...events);
    }
    
    // Check for political events
    if (this.canTriggerEvent('political')) {
      const politicalEvents = this.politicalSystem.checkPoliticalEvents();
      events.push(...politicalEvents);
    }
    
    // Check for diplomatic events
    if (this.canTriggerEvent('diplomatic')) {
      const diplomaticEvents = this.diplomaticSystem.checkDiplomaticEvents();
      events.push(...diplomaticEvents);
    }
    
    return this.eventAggregator.aggregateSimilarEvents(events);
  }

  processEvents(events) {
    // Sort events by priority
    const priorityQueue = new PriorityEventQueue();
    events.forEach(event => {
      priorityQueue.add(event, this.getEventPriority(event));
    });
    
    // Process events in priority order
    while (!priorityQueue.isEmpty()) {
      const { event } = priorityQueue.next();
      this.processEvent(event);
    }
  }

  processEvent(event) {
    // Log event for debugging
    this.eventInspector.logEvent(event);
    
    // Apply event effects
    switch (event.type) {
      case 'war':
        this.warSystem.processWarEvent(event);
        break;
      case 'trade':
        // this.tradeSystem.processTradeEvent(event); // Commented out as TradeSystem is not defined
        break;
      case 'political':
        this.politicalSystem.processPoliticalEvent(event);
        break;
      case 'diplomatic':
        this.diplomaticSystem.processDiplomaticEvent(event);
        break;
    }
    
    // Record event in history
    this.recordEvent(event);
    
    // Update cooldowns
    this.updateEventCooldown(event);
  }

  canTriggerEvent(eventType, entityId = 'global') {
    const key = `${eventType}_${entityId}`;
    const lastTriggered = this.eventCooldowns.get(key) || 0;
    const cooldownPeriod = this.getEventCooldown(eventType);
    
    return this.world.currentTime - lastTriggered >= cooldownPeriod;
  }

  getEventCooldown(eventType) {
    const cooldowns = {
      war: 100,
      market: 10,
      political: 50,
      diplomatic: 30
    };
    return cooldowns[eventType] || 20;
  }

  getEventPriority(event) {
    const basePriorities = {
      war: 100,
      market: 50,
      political: 75,
      diplomatic: 60
    };
    
    let priority = basePriorities[event.type] || 10;
    
    // Adjust priority based on event magnitude
    if (event.magnitude) {
      priority *= event.magnitude;
    }
    
    // Adjust priority based on consciousness impact
    if (event.consciousnessImpact) {
      priority *= (1 + event.consciousnessImpact);
    }
    
    return priority;
  }

  recordEvent(event) {
    this.eventHistory.push({
      ...event,
      timestamp: this.world.currentTime
    });
    
    // Prune old events if history gets too large
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-1000);
    }
  }

  updateEventCooldown(event) {
    const key = `${event.type}_${event.entityId || 'global'}`;
    this.eventCooldowns.set(key, this.world.currentTime);
  }

  initializeSpatialIndex() {
    // Add settlements to spatial index
    this.world.settlements.forEach(settlement => {
      // this.spatialIndex.insert(settlement); // Commented out as SpatialIndex is not defined
    });
    
    // Add trade routes
    // this.tradeSystem.tradeRoutes.forEach(route => {
    //   this.spatialIndex.insert(route);
    // });
  }

  async initializeDiplomacy() {
    // Initialize relations between all factions
    for (const faction1 of this.world.factions) {
      for (const faction2 of this.world.factions) {
        if (faction1.id !== faction2.id) {
          await this.diplomaticSystem.initializeRelation(faction1, faction2);
        }
      }
    }
  }
}

// Helper Classes

class PriorityEventQueue {
  constructor() {
    this.queue = [];
  }
  
  add(event, priority) {
    this.queue.push({ event, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
  }
  
  next() {
    return this.queue.shift();
  }
  
  isEmpty() {
    return this.queue.length === 0;
  }
}

class SpatialIndex {
  constructor(bounds) {
    // this.quadTree = new QuadTree(bounds); // Commented out as QuadTree is not defined
  }
  
  insert(entity) {
    // this.quadTree.insert({
    //   x: entity.position.x,
    //   y: entity.position.y,
    //   entity
    // });
  }
  
  findNearby(position, radius) {
    // return this.quadTree.query(
    //   new Circle(position.x, position.y, radius)
    // );
  }
}

class EventAggregator {
  aggregateSimilarEvents(events) {
    const aggregated = new Map();
    
    events.forEach(event => {
      const key = `${event.type}_${event.location}`;
      if (aggregated.has(key)) {
        const existing = aggregated.get(key);
        existing.magnitude += event.magnitude;
        existing.consciousnessImpact = Math.max(
          existing.consciousnessImpact,
          event.consciousnessImpact
        );
      } else {
        aggregated.set(key, { ...event });
      }
    });
    
    return Array.from(aggregated.values());
  }
}

class EventInspector {
  logEvent(event) {
    console.group(`[${event.type}] ${event.subtype}`);
    console.log('Data:', event.data);
    console.log('Effects:', event.effects);
    console.log('Consciousness Impact:', event.consciousnessImpact);
    console.groupEnd();
  }
  
  validateEventChain(events) {
    const visited = new Set();
    const stack = new Set();
    
    for (const event of events) {
      if (this.hasCircularDependency(event, visited, stack)) {
        return false;
      }
    }
    
    return true;
  }
  
  hasCircularDependency(event, visited, stack) {
    if (stack.has(event.id)) return true;
    if (visited.has(event.id)) return false;
    
    visited.add(event.id);
    stack.add(event.id);
    
    for (const dependency of event.dependencies || []) {
      if (this.hasCircularDependency(dependency, visited, stack)) {
        return true;
      }
    }
    
    stack.delete(event.id);
    return false;
  }
}

class StateValidator {
  validateWorldState(world) {
    const issues = [];
    
    // Check market consistency
    world.settlements.forEach(settlement => {
      if (settlement.market) {
        if (settlement.market.confidence < 0 || settlement.market.confidence > 1) {
          issues.push(`Invalid market confidence in ${settlement.id}`);
        }
      }
    });
    
    // Check political consistency
    world.factions.forEach(faction => {
      if (faction.political) {
        if (!faction.political.ruler && faction.political.government !== 'anarchy') {
          issues.push(`Faction ${faction.id} has no ruler`);
        }
        if (faction.political.stability < 0 || faction.political.stability > 100) {
          issues.push(`Invalid stability in faction ${faction.id}`);
        }
      }
    });
    
    // Check diplomatic consistency
    world.factions.forEach(faction => {
      if (faction.diplomatic) {
        faction.diplomatic.relations.forEach((relation, targetId) => {
          if (relation < -100 || relation > 100) {
            issues.push(`Invalid relation value between ${faction.id} and ${targetId}`);
          }
        });
      }
    });
    
    return issues;
  }
} 