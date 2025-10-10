# Design Document

## Overview

The Settlement System Enhancements specification introduces five interconnected features that transform the World History Simulation Engine into a more sophisticated and authentic simulation platform. This design addresses critical gaps in node type differentiation, economic centralization, political tracking, memory querying, and personality-driven choice selection.

The design maintains clean architecture principles while introducing new domain services, enhanced entities, and sophisticated behavioral systems. The core innovation is the personality-weighted choice selection system that creates authentic NPC differentiation at the dialogue level, addressing the identified gap where NPCs make personality-driven interaction selections but uniform dialogue choices.

## Architecture

### High-Level Architecture Changes

The design introduces several new architectural components while maintaining existing clean architecture boundaries:

```
Domain Layer Additions:
├── entities/
│   ├── NodeTypeProfile.js          # Node type behavioral profiles
│   ├── PoliticalEvent.js           # Political event tracking
│   └── MemoryQuery.js              # Memory query specifications
├── services/
│   ├── NodeTypeService.js          # Node type differentiation logic
│   ├── ResourceFlowService.js      # Resource flow between nodes
│   ├── PoliticalTrackingService.js # Political data management
│   ├── MemoryQueryService.js       # Memory and history querying
│   └── BranchWeightingService.js   # Personality-weighted choice selection
└── value-objects/
    ├── NodeTypeCapabilities.js     # Node type capability definitions
    ├── ResourceFlow.js             # Resource flow specifications
    ├── PoliticalRelationship.js    # Inter-settlement relationships
    └── BranchWeight.js             # Branch weighting calculations

Application Layer Additions:
├── use-cases/
│   ├── ProcessResourceFlow.js      # Resource flow processing
│   ├── UpdatePoliticalStatus.js   # Political relationship updates
│   └── QueryHistoricalEvents.js   # Historical event querying
└── services/
    ├── EconomicCentralizationService.js # Settlement-centric economics
    └── PersonalityChoiceService.js      # Personality-driven choices

Infrastructure Layer Additions:
├── repositories/
│   ├── PoliticalEventRepository.js # Political event persistence
│   └── MemoryIndexRepository.js    # Memory indexing for queries
└── services/
    └── HistoricalQueryService.js   # Efficient historical data access
```

### Integration Points

The design integrates with existing systems through well-defined interfaces:

- **Node System**: Enhanced with type-specific capabilities and resource flows
- **Settlement System**: Centralized economic processing with resource dependencies
- **Character System**: Enhanced with political career tracking and memory-based decisions
- **Consciousness System**: Integrated with branch weighting for authentic choice selection
- **Memory System**: Extended with comprehensive querying capabilities
- **Turn Processing**: Enhanced with political event generation and resource flow processing

## Components and Interfaces

### 1. Node Type System Refactor

#### NodeTypeProfile Entity
```javascript
class NodeTypeProfile {
  constructor(config) {
    this.nodeType = config.nodeType; // 'settlement', 'resource', 'wilderness', etc.
    this.capabilities = new NodeTypeCapabilities(config.capabilities);
    this.economicSystems = config.economicSystems || [];
    this.politicalSystems = config.politicalSystems || [];
    this.socialSystems = config.socialSystems || [];
    this.specialMechanics = config.specialMechanics || [];
    this.resourceProduction = config.resourceProduction || {};
    this.resourceConsumption = config.resourceConsumption || {};
  }

  hasCapability(capability) {
    return this.capabilities.has(capability);
  }

  getSystemsOfType(systemType) {
    return this[`${systemType}Systems`] || [];
  }
}
```

#### NodeTypeService
```javascript
class NodeTypeService extends BaseDomainService {
  constructor() {
    super();
    this.typeProfiles = new Map();
    this._initializeDefaultProfiles();
  }

  getNodeProfile(nodeType) {
    return this.typeProfiles.get(nodeType) || this.typeProfiles.get('default');
  }

  validateNodeCapabilities(node, requestedCapability) {
    const profile = this.getNodeProfile(node.type);
    return profile.hasCapability(requestedCapability);
  }

  getApplicableSystems(node) {
    const profile = this.getNodeProfile(node.type);
    return {
      economic: profile.getSystemsOfType('economic'),
      political: profile.getSystemsOfType('political'),
      social: profile.getSystemsOfType('social')
    };
  }
}
```

### 2. Economic System Settlement-Only Operation

#### ResourceFlowService
```javascript
class ResourceFlowService extends BaseDomainService {
  constructor(nodeTypeService) {
    super();
    this.nodeTypeService = nodeTypeService;
    this.flowCalculations = new Map();
  }

  calculateResourceFlows(worldState) {
    const flows = [];
    const resourceNodes = this._getResourceNodes(worldState);
    const settlements = this._getSettlements(worldState);

    resourceNodes.forEach(resourceNode => {
      const nearbySettlements = this._findNearbySettlements(resourceNode, settlements);
      nearbySettlements.forEach(settlement => {
        const flow = this._calculateFlow(resourceNode, settlement, worldState);
        if (flow.amount > 0) {
          flows.push(flow);
        }
      });
    });

    return flows;
  }

  processResourceFlow(flow, worldState) {
    const sourceNode = worldState.nodes.get(flow.sourceNodeId);
    const targetSettlement = worldState.settlements.get(flow.targetSettlementId);

    // Validate flow capacity
    if (!this._validateFlowCapacity(sourceNode, flow)) {
      return { success: false, reason: 'Insufficient production capacity' };
    }

    // Apply resource transfer
    this._transferResources(sourceNode, targetSettlement, flow);

    // Update flow history
    this._recordFlowHistory(flow, worldState.currentTurn);

    return { success: true, flow };
  }
}
```

#### EconomicCentralizationService
```javascript
class EconomicCentralizationService extends BaseDomainService {
  constructor(resourceFlowService, basicNeedsService) {
    super();
    this.resourceFlowService = resourceFlowService;
    this.basicNeedsService = basicNeedsService;
  }

  processSettlementEconomics(settlement, worldState) {
    // Only process economics for settlement-type nodes
    if (!this._isEconomicNode(settlement)) {
      return { processed: false, reason: 'Non-economic node type' };
    }

    // Aggregate NPC contributions
    const npcContributions = this._aggregateNPCContributions(settlement, worldState);

    // Process resource flows
    const resourceFlows = this._processIncomingResources(settlement, worldState);

    // Calculate economic health
    const economicHealth = this._calculateEconomicHealth(settlement, npcContributions, resourceFlows);

    // Apply building effects
    const buildingEffects = this._applyBuildingEffects(settlement, economicHealth);

    // Update settlement economy
    return this._updateSettlementEconomy(settlement, {
      npcContributions,
      resourceFlows,
      economicHealth,
      buildingEffects
    });
  }
}
```

### 3. Political System Data Tracking

#### PoliticalEvent Entity
```javascript
class PoliticalEvent {
  constructor(config) {
    this.id = config.id || this._generateId();
    this.timestamp = config.timestamp || Date.now();
    this.type = config.type; // 'leadership_change', 'diplomatic_shift', 'policy_change', etc.
    this.settlementId = config.settlementId;
    this.participants = config.participants || [];
    this.description = config.description;
    this.significance = config.significance || 0.5;
    this.effects = config.effects || [];
    this.metadata = config.metadata || {};
  }

  getParticipantIds() {
    return this.participants.map(p => p.id || p);
  }

  hasParticipant(characterId) {
    return this.getParticipantIds().includes(characterId);
  }
}
```

#### PoliticalTrackingService
```javascript
class PoliticalTrackingService extends BaseDomainService {
  constructor(historyGenerator) {
    super();
    this.historyGenerator = historyGenerator;
    this.politicalEvents = new Map();
    this.diplomaticRelationships = new Map();
    this.leadershipHistory = new Map();
  }

  recordLeadershipChange(settlement, oldLeader, newLeader, reason, context = {}) {
    const event = new PoliticalEvent({
      type: 'leadership_change',
      settlementId: settlement.id,
      participants: [oldLeader, newLeader].filter(Boolean),
      description: `Leadership changed from ${oldLeader?.name || 'none'} to ${newLeader.name}`,
      significance: this._calculateLeadershipSignificance(reason, context),
      effects: this._generateLeadershipEffects(settlement, oldLeader, newLeader, reason),
      metadata: { reason, context }
    });

    this._recordEvent(event);
    this._updateLeadershipHistory(settlement.id, event);
    return event;
  }

  updateDiplomaticRelationship(settlement1Id, settlement2Id, newStatus, reason, context = {}) {
    const relationshipKey = this._getRelationshipKey(settlement1Id, settlement2Id);
    const oldStatus = this.diplomaticRelationships.get(relationshipKey)?.status || 'neutral';

    if (oldStatus !== newStatus) {
      const event = new PoliticalEvent({
        type: 'diplomatic_shift',
        settlementId: settlement1Id,
        participants: [settlement1Id, settlement2Id],
        description: `Diplomatic status changed from ${oldStatus} to ${newStatus}`,
        significance: this._calculateDiplomaticSignificance(oldStatus, newStatus, context),
        effects: this._generateDiplomaticEffects(settlement1Id, settlement2Id, oldStatus, newStatus),
        metadata: { reason, context, oldStatus, newStatus }
      });

      this._recordEvent(event);
      this._updateDiplomaticStatus(settlement1Id, settlement2Id, newStatus, event);
      return event;
    }

    return null;
  }

  getLeadershipHistory(settlementId, timeRange = null) {
    const history = this.leadershipHistory.get(settlementId) || [];
    if (timeRange) {
      return history.filter(event => 
        event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
      );
    }
    return [...history];
  }

  getDiplomaticHistory(settlement1Id, settlement2Id = null, timeRange = null) {
    let events = Array.from(this.politicalEvents.values())
      .filter(event => event.type === 'diplomatic_shift');

    if (settlement2Id) {
      const relationshipKey = this._getRelationshipKey(settlement1Id, settlement2Id);
      events = events.filter(event => 
        event.metadata.relationshipKey === relationshipKey
      );
    } else {
      events = events.filter(event => 
        event.participants.includes(settlement1Id)
      );
    }

    if (timeRange) {
      events = events.filter(event => 
        event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
      );
    }

    return events.sort((a, b) => b.timestamp - a.timestamp);
  }
}
```

### 4. Memory Querying System

#### MemoryQuery Value Object
```javascript
class MemoryQuery {
  constructor(config) {
    this.characterId = config.characterId;
    this.eventTypes = config.eventTypes || [];
    this.timeRange = config.timeRange || null;
    this.significanceThreshold = config.significanceThreshold || 0.0;
    this.locations = config.locations || [];
    this.participants = config.participants || [];
    this.outcomes = config.outcomes || [];
    this.maxResults = config.maxResults || 50;
    this.sortBy = config.sortBy || 'timestamp';
    this.sortOrder = config.sortOrder || 'desc';
  }

  matches(memory) {
    // Event type filter
    if (this.eventTypes.length > 0 && !this.eventTypes.includes(memory.interactionType)) {
      return false;
    }

    // Time range filter
    if (this.timeRange) {
      if (memory.timestamp < this.timeRange.start || memory.timestamp > this.timeRange.end) {
        return false;
      }
    }

    // Significance filter
    if (memory.significance < this.significanceThreshold) {
      return false;
    }

    // Location filter
    if (this.locations.length > 0 && !this.locations.includes(memory.location)) {
      return false;
    }

    // Participants filter
    if (this.participants.length > 0) {
      const memoryParticipants = memory.participants || [];
      if (!this.participants.some(p => memoryParticipants.includes(p))) {
        return false;
      }
    }

    // Outcome filter
    if (this.outcomes.length > 0 && !this.outcomes.includes(memory.outcome)) {
      return false;
    }

    return true;
  }
}
```

#### MemoryQueryService
```javascript
class MemoryQueryService extends BaseDomainService {
  constructor(significantMemoryService, historyGenerator) {
    super();
    this.significantMemoryService = significantMemoryService;
    this.historyGenerator = historyGenerator;
    this.memoryIndex = new Map(); // Character ID -> indexed memories
    this.settlementIndex = new Map(); // Settlement ID -> indexed events
    this.globalIndex = new Map(); // Event type -> indexed events
  }

  queryPersonalMemories(query) {
    const character = this._getCharacter(query.characterId);
    if (!character || !character.significantMemories) {
      return { memories: [], totalCount: 0, query };
    }

    let memories = character.significantMemories.filter(memory => query.matches(memory));

    // Sort results
    memories = this._sortMemories(memories, query.sortBy, query.sortOrder);

    // Apply pagination
    const totalCount = memories.length;
    if (query.maxResults > 0) {
      memories = memories.slice(0, query.maxResults);
    }

    return {
      memories,
      totalCount,
      query,
      hasMore: totalCount > memories.length
    };
  }

  querySettlementHistory(settlementId, query = {}) {
    const settlementQuery = new MemoryQuery({
      ...query,
      locations: [settlementId],
      maxResults: query.maxResults || 100
    });

    // Get events from history generator
    const historicalEvents = this.historyGenerator.getEventsByLocation(settlementId, query.timeRange);

    // Get political events
    const politicalEvents = this._getPoliticalEventsBySettlement(settlementId, query.timeRange);

    // Get economic events
    const economicEvents = this._getEconomicEventsBySettlement(settlementId, query.timeRange);

    // Combine and filter events
    let allEvents = [...historicalEvents, ...politicalEvents, ...economicEvents];
    allEvents = allEvents.filter(event => settlementQuery.matches(event));

    // Sort and paginate
    allEvents = this._sortEvents(allEvents, query.sortBy || 'timestamp', query.sortOrder || 'desc');
    const totalCount = allEvents.length;
    if (query.maxResults > 0) {
      allEvents = allEvents.slice(0, query.maxResults);
    }

    return {
      events: allEvents,
      totalCount,
      query: settlementQuery,
      hasMore: totalCount > allEvents.length,
      categories: this._categorizeEvents(allEvents)
    };
  }

  queryGlobalHistory(query = {}) {
    const globalQuery = new MemoryQuery({
      ...query,
      maxResults: query.maxResults || 200
    });

    // Get all historical events
    const allEvents = this.historyGenerator.getAllEvents(query.timeRange);

    // Filter events
    let filteredEvents = allEvents.filter(event => globalQuery.matches(event));

    // Sort and paginate
    filteredEvents = this._sortEvents(filteredEvents, query.sortBy || 'timestamp', query.sortOrder || 'desc');
    const totalCount = filteredEvents.length;
    if (query.maxResults > 0) {
      filteredEvents = filteredEvents.slice(0, query.maxResults);
    }

    return {
      events: filteredEvents,
      totalCount,
      query: globalQuery,
      hasMore: totalCount > filteredEvents.length,
      patterns: this._analyzeGlobalPatterns(filteredEvents),
      timeline: this._generateTimeline(filteredEvents)
    };
  }
}
```

### 5. Personality-Weighted Choice Selection System

#### BranchWeight Value Object
```javascript
class BranchWeight {
  constructor(config) {
    this.branchId = config.branchId;
    this.baseWeight = config.baseWeight || 1.0;
    this.personalityMultiplier = config.personalityMultiplier || 1.0;
    this.alignmentMultiplier = config.alignmentMultiplier || 1.0;
    this.attributeMultiplier = config.attributeMultiplier || 1.0;
    this.consciousnessMultiplier = config.consciousnessMultiplier || 1.0;
    this.memoryMultiplier = config.memoryMultiplier || 1.0;
    this.prestigeMultiplier = config.prestigeMultiplier || 1.0;
    this.emotionalMultiplier = config.emotionalMultiplier || 1.0;
    this.consistencyBonus = config.consistencyBonus || 1.0;
  }

  calculateFinalWeight() {
    let weight = this.baseWeight;
    weight *= this.personalityMultiplier;
    weight *= this.alignmentMultiplier;
    weight *= this.attributeMultiplier;
    weight *= this.consciousnessMultiplier;
    weight *= this.memoryMultiplier;
    weight *= this.prestigeMultiplier;
    weight *= this.emotionalMultiplier;
    weight *= this.consistencyBonus;

    // Bound weight between 0.1x and 3.0x
    return Math.max(0.1, Math.min(3.0, weight));
  }

  getWeightBreakdown() {
    return {
      base: this.baseWeight,
      personality: this.personalityMultiplier,
      alignment: this.alignmentMultiplier,
      attributes: this.attributeMultiplier,
      consciousness: this.consciousnessMultiplier,
      memory: this.memoryMultiplier,
      prestige: this.prestigeMultiplier,
      emotional: this.emotionalMultiplier,
      consistency: this.consistencyBonus,
      final: this.calculateFinalWeight()
    };
  }
}
```

#### BranchWeightingService
```javascript
class BranchWeightingService extends BaseDomainService {
  constructor(behavioralStateService, significantMemoryService) {
    super();
    this.behavioralStateService = behavioralStateService;
    this.significantMemoryService = significantMemoryService;
    this.MIN_WEIGHT = 0.1;
    this.MAX_WEIGHT = 3.0;
  }

  calculateBranchWeights(character, branches, context = {}) {
    const weights = [];

    branches.forEach(branch => {
      const weight = this._calculateSingleBranchWeight(character, branch, context);
      weights.push(weight);
    });

    return weights;
  }

  selectWeightedBranch(character, branches, context = {}) {
    if (!branches || branches.length === 0) {
      return null;
    }

    if (branches.length === 1) {
      return branches[0];
    }

    // Calculate weights for all branches
    const weights = this.calculateBranchWeights(character, branches, context);

    // Use weighted random selection
    return this._weightedRandomSelection(branches, weights);
  }

  _calculateSingleBranchWeight(character, branch, context) {
    const weight = new BranchWeight({
      branchId: branch.id,
      baseWeight: 1.0
    });

    // Calculate personality multiplier
    weight.personalityMultiplier = this._calculatePersonalityMultiplier(character, branch);

    // Calculate alignment multiplier
    weight.alignmentMultiplier = this._calculateAlignmentMultiplier(character, branch);

    // Calculate attribute multiplier
    weight.attributeMultiplier = this._calculateAttributeMultiplier(character, branch);

    // Calculate consciousness multiplier
    weight.consciousnessMultiplier = this._calculateConsciousnessMultiplier(character, branch);

    // Calculate memory multiplier
    weight.memoryMultiplier = this._calculateMemoryMultiplier(character, branch, context);

    // Calculate prestige multiplier
    weight.prestigeMultiplier = this._calculatePrestigeMultiplier(character, branch);

    // Calculate emotional multiplier
    weight.emotionalMultiplier = this._calculateEmotionalMultiplier(character, branch);

    // Calculate consistency bonus
    weight.consistencyBonus = this._calculateConsistencyBonus(character, branch, context);

    return weight;
  }

  _calculatePersonalityMultiplier(character, branch) {
    if (!branch.personalityAffinities || !character.personality) {
      return 1.0;
    }

    let multiplier = 1.0;
    const personalityTraits = character.personality.getAllTraits ? 
      character.personality.getAllTraits() : character.personality;

    Object.entries(branch.personalityAffinities).forEach(([trait, affinity]) => {
      const traitValue = personalityTraits[trait] || 0.5;
      // Convert trait value (0-1) to influence (-1 to 1)
      const traitInfluence = (traitValue - 0.5) * 2;
      // Apply affinity modifier
      multiplier *= (1 + traitInfluence * affinity);
    });

    return Math.max(0.1, Math.min(3.0, multiplier));
  }

  _calculateAlignmentMultiplier(character, branch) {
    if (!branch.alignmentLean || !character.alignment) {
      return 1.0;
    }

    let multiplier = 1.0;
    const alignmentValues = character.alignment.values || character.alignment;

    Object.entries(branch.alignmentLean).forEach(([axis, lean]) => {
      const axisValue = alignmentValues[axis] || 0;
      // Normalize axis value to -1 to 1 range
      const normalizedValue = (axisValue - 50) / 50;
      // Apply lean modifier
      multiplier *= (1 + normalizedValue * lean);
    });

    return Math.max(0.1, Math.min(3.0, multiplier));
  }

  _calculateAttributeMultiplier(character, branch) {
    if (!branch.attributePreference || !character.attributes) {
      return 1.0;
    }

    let multiplier = 1.0;

    Object.entries(branch.attributePreference).forEach(([attribute, preference]) => {
      const attributeValue = character.attributes[attribute]?.score || 10;
      const attributeModifier = Math.floor((attributeValue - 10) / 2);
      // Convert modifier to multiplier (modifier range: -5 to +10, multiplier range: 0.5 to 2.0)
      const attributeMultiplier = 1 + (attributeModifier * 0.1);
      multiplier *= Math.pow(attributeMultiplier, preference);
    });

    return Math.max(0.1, Math.min(3.0, multiplier));
  }

  _calculateConsciousnessMultiplier(character, branch) {
    if (!character.consciousness) {
      return 1.0;
    }

    // Use existing behavioral state service for consciousness calculations
    const consciousnessModifier = this.behavioralStateService.getConsciousnessModifier(
      character, 
      'social' // Default to social interaction type for dialogue
    );

    return Math.max(0.1, Math.min(3.0, consciousnessModifier));
  }

  _calculateMemoryMultiplier(character, branch, context) {
    if (!this.significantMemoryService || !character.significantMemories) {
      return 1.0;
    }

    // Get relevant memories for similar choices
    const relevantMemories = this.significantMemoryService.getRelevantMemories(
      character,
      'social', // Dialogue interactions
      5, // Max memories
      { branchType: branch.type, ...context }
    );

    if (!relevantMemories || relevantMemories.length === 0) {
      return 1.0;
    }

    // Calculate memory influence based on outcomes
    let totalInfluence = 0;
    let totalWeight = 0;

    relevantMemories.forEach(memory => {
      const significance = memory.significance || 0.5;
      const recencyWeight = this._calculateRecencyWeight(memory.timestamp);
      const weight = significance * recencyWeight;

      let influence = 0;
      switch (memory.outcome) {
        case 'critical_success': influence = 0.3; break;
        case 'success': influence = 0.15; break;
        case 'partial_success': influence = 0.05; break;
        case 'neutral': influence = 0.0; break;
        case 'partial_failure': influence = -0.05; break;
        case 'failure': influence = -0.15; break;
        case 'critical_failure': influence = -0.3; break;
        default: influence = 0.0; break;
      }

      totalInfluence += influence * weight;
      totalWeight += weight;
    });

    if (totalWeight === 0) {
      return 1.0;
    }

    const averageInfluence = totalInfluence / totalWeight;
    const memoryMultiplier = 1 + averageInfluence;

    return Math.max(0.1, Math.min(3.0, memoryMultiplier));
  }

  _weightedRandomSelection(branches, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight.calculateFinalWeight(), 0);
    
    if (totalWeight === 0) {
      // Fallback to random selection if all weights are zero
      return branches[Math.floor(Math.random() * branches.length)];
    }

    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < branches.length; i++) {
      random -= weights[i].calculateFinalWeight();
      if (random <= 0) {
        return branches[i];
      }
    }

    // Fallback to last branch
    return branches[branches.length - 1];
  }
}
```

#### Enhanced ContentInteraction.selectBranch()
```javascript
// Enhanced selectBranch method in ContentInteraction class
selectBranch(character, context = {}) {
  if (!this.branches.length) return null;

  // Filter valid branches based on conditions
  const validBranches = this.branches.filter(branch =>
    !branch.condition || branch.condition(character)
  );

  if (!validBranches.length) return null;

  // Single branch - return immediately
  if (validBranches.length === 1) {
    return validBranches[0];
  }

  // Use personality-weighted selection for multiple branches
  if (this.branchWeightingService) {
    return this.branchWeightingService.selectWeightedBranch(character, validBranches, context);
  }

  // Fallback to first valid branch (backward compatibility)
  return validBranches[0];
}
```

## Data Models

### Enhanced Node Entity
```javascript
// Addition to existing Node.js
class Node {
  constructor(config = {}) {
    // ... existing properties ...
    
    // Node type enhancements
    this.typeProfile = config.typeProfile || null;
    this.economicCapabilities = config.economicCapabilities || [];
    this.politicalCapabilities = config.politicalCapabilities || [];
    this.resourceProduction = config.resourceProduction || {};
    this.resourceConsumption = config.resourceConsumption || {};
    
    // Resource flow tracking
    this.incomingFlows = config.incomingFlows || [];
    this.outgoingFlows = config.outgoingFlows || [];
    this.flowHistory = config.flowHistory || [];
  }

  hasEconomicCapability(capability) {
    return this.economicCapabilities.includes(capability);
  }

  canProduceResource(resourceType) {
    return this.resourceProduction[resourceType] > 0;
  }

  getResourceProductionRate(resourceType) {
    return this.resourceProduction[resourceType] || 0;
  }
}
```

### Enhanced Settlement Entity
```javascript
// Addition to existing Settlement.js
const Settlement = {
  // ... existing properties ...
  
  // Political tracking enhancements
  politicalHistory: [{
    eventId: String,
    timestamp: Number,
    type: String, // 'leadership_change', 'policy_change', 'diplomatic_event'
    description: String,
    participants: [String],
    significance: Number,
    effects: Object
  }],
  
  diplomaticRelationships: [{
    targetSettlementId: String,
    status: String, // 'allied', 'neutral', 'hostile', 'at_war'
    statusHistory: [{
      timestamp: Number,
      oldStatus: String,
      newStatus: String,
      reason: String,
      eventId: String
    }],
    treaties: [{
      id: String,
      type: String,
      terms: Object,
      signedDate: Number,
      expiryDate: Number,
      status: String
    }]
  }],
  
  leadershipHistory: [{
    leaderId: String,
    startDate: Number,
    endDate: Number,
    reason: String, // 'election', 'inheritance', 'coup', 'death', 'abdication'
    achievements: [String],
    policies: [Object],
    approval: Number
  }],
  
  // Economic centralization enhancements
  resourceDependencies: [{
    resourceType: String,
    sourceNodeId: String,
    dependencyLevel: Number, // 0.0 to 1.0
    alternativeSources: [String],
    criticalityLevel: String // 'low', 'medium', 'high', 'critical'
  }],
  
  economicCentralization: {
    productionCenters: [String], // Node IDs of production facilities
    distributionNetworks: [Object],
    tradeRoutes: [Object],
    economicPolicies: [Object],
    centralizedSystems: [String] // Which systems are centralized
  }
};
```

### Enhanced Character Entity
```javascript
// Addition to existing Character.js
class Character {
  constructor(config = {}) {
    // ... existing properties ...
    
    // Political career tracking
    this.politicalCareer = config.politicalCareer || {
      positions: [], // Historical positions held
      achievements: [], // Political achievements
      scandals: [], // Political scandals or failures
      influence: 0, // Current political influence
      reputation: 0, // Political reputation
      allies: [], // Political allies
      enemies: [] // Political enemies
    };
    
    // Enhanced memory for choice consistency
    this.choiceHistory = config.choiceHistory || [];
    this.choicePatterns = config.choicePatterns || {};
    
    // Branch weighting service injection point
    this.branchWeightingService = config.branchWeightingService || null;
  }

  recordChoice(interactionId, branchId, context = {}) {
    const choice = {
      timestamp: Date.now(),
      interactionId,
      branchId,
      context,
      outcome: null // To be filled when outcome is known
    };
    
    this.choiceHistory.push(choice);
    
    // Update choice patterns
    if (!this.choicePatterns[interactionId]) {
      this.choicePatterns[interactionId] = {};
    }
    if (!this.choicePatterns[interactionId][branchId]) {
      this.choicePatterns[interactionId][branchId] = 0;
    }
    this.choicePatterns[interactionId][branchId]++;
    
    return choice;
  }

  getChoicePattern(interactionId, branchId) {
    return this.choicePatterns[interactionId]?.[branchId] || 0;
  }
}
```

## Error Handling

### Validation and Error Recovery

The design includes comprehensive error handling at multiple levels:

#### Node Type Validation
```javascript
class NodeTypeValidationService {
  validateNodeTypeChange(node, newType) {
    const errors = [];
    
    // Check if change is allowed
    if (!this._isValidTypeTransition(node.type, newType)) {
      errors.push(`Invalid type transition from ${node.type} to ${newType}`);
    }
    
    // Check existing assignments
    const incompatibleAssignments = this._checkAssignmentCompatibility(node, newType);
    if (incompatibleAssignments.length > 0) {
      errors.push(`Incompatible assignments: ${incompatibleAssignments.join(', ')}`);
    }
    
    // Check resource flows
    const flowConflicts = this._checkResourceFlowCompatibility(node, newType);
    if (flowConflicts.length > 0) {
      errors.push(`Resource flow conflicts: ${flowConflicts.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: this._generateWarnings(node, newType)
    };
  }
}
```

#### Memory Query Error Handling
```javascript
class MemoryQueryErrorHandler {
  handleQueryError(error, query, context) {
    const errorType = this._classifyError(error);
    
    switch (errorType) {
      case 'INDEX_CORRUPTION':
        return this._rebuildIndex(query, context);
      case 'MEMORY_OVERFLOW':
        return this._paginateQuery(query, context);
      case 'INVALID_PARAMETERS':
        return this._sanitizeQuery(query, context);
      default:
        return this._getDefaultResult(query, context);
    }
  }
}
```

#### Branch Selection Fallbacks
```javascript
class BranchSelectionErrorHandler {
  handleSelectionError(error, character, branches, context) {
    // Log error for debugging
    console.warn('Branch selection error:', error.message);
    
    // Attempt graceful degradation
    if (branches.length > 0) {
      // Use simple random selection as fallback
      return branches[Math.floor(Math.random() * branches.length)];
    }
    
    // Generate default branch if none available
    return this._generateDefaultBranch(character, context);
  }
}
```

## Testing Strategy

### Unit Testing Requirements

#### Node Type System Tests
```javascript
describe('NodeTypeService', () => {
  test('should differentiate settlement and resource node capabilities', () => {
    const settlementNode = new Node({ type: 'settlement' });
    const resourceNode = new Node({ type: 'resource' });
    
    expect(nodeTypeService.hasEconomicCapability(settlementNode, 'full_economy')).toBe(true);
    expect(nodeTypeService.hasEconomicCapability(resourceNode, 'full_economy')).toBe(false);
    expect(nodeTypeService.hasEconomicCapability(resourceNode, 'production_only')).toBe(true);
  });
});
```

#### Personality-Weighted Choice Tests
```javascript
describe('BranchWeightingService', () => {
  test('should weight aggressive branches higher for aggressive characters', () => {
    const aggressiveCharacter = createTestCharacter({ aggression: 0.9 });
    const cautiousCharacter = createTestCharacter({ aggression: 0.1 });
    
    const branches = [
      { id: 'aggressive', personalityAffinities: { aggression: 1.5 } },
      { id: 'cautious', personalityAffinities: { aggression: -0.8 } }
    ];
    
    const aggressiveWeights = branchWeightingService.calculateBranchWeights(aggressiveCharacter, branches);
    const cautiousWeights = branchWeightingService.calculateBranchWeights(cautiousCharacter, branches);
    
    expect(aggressiveWeights[0].calculateFinalWeight()).toBeGreaterThan(aggressiveWeights[1].calculateFinalWeight());
    expect(cautiousWeights[1].calculateFinalWeight()).toBeGreaterThan(cautiousWeights[0].calculateFinalWeight());
  });
});
```

### Integration Testing Scenarios

#### Economic Centralization Flow
```javascript
describe('Economic Centralization Integration', () => {
  test('should process resource flows from production nodes to settlements', async () => {
    const world = createTestWorld();
    const resourceNode = world.nodes.find(n => n.type === 'resource');
    const settlement = world.settlements.find(s => s.type === 'settlement');
    
    // Process turn
    const result = await simulationService.processTurn();
    
    // Verify resource flow
    expect(result.resourceFlows).toHaveLength(1);
    expect(result.resourceFlows[0].sourceNodeId).toBe(resourceNode.id);
    expect(result.resourceFlows[0].targetSettlementId).toBe(settlement.id);
    
    // Verify settlement received resources
    const updatedSettlement = result.worldState.settlements.get(settlement.id);
    expect(updatedSettlement.resources.food).toBeGreaterThan(settlement.resources.food);
  });
});
```

#### Political Event Generation
```javascript
describe('Political Event Integration', () => {
  test('should generate leadership change events during turn processing', async () => {
    const world = createTestWorld();
    const settlement = world.settlements.find(s => s.government.leader);
    
    // Simulate conditions for leadership change
    settlement.government.leader.health = 10; // Low health
    
    const result = await simulationService.processTurn();
    
    // Verify political event was generated
    const politicalEvents = result.events.filter(e => e.type === 'leadership_change');
    expect(politicalEvents).toHaveLength(1);
    expect(politicalEvents[0].settlementId).toBe(settlement.id);
  });
});
```

### Performance Testing

#### Memory Query Performance
```javascript
describe('Memory Query Performance', () => {
  test('should handle large memory datasets efficiently', async () => {
    const character = createCharacterWithMemories(1000); // 1000 memories
    
    const startTime = performance.now();
    const result = memoryQueryService.queryPersonalMemories({
      characterId: character.id,
      eventTypes: ['social'],
      maxResults: 50
    });
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Under 100ms
    expect(result.memories).toHaveLength(50);
  });
});
```

#### Branch Selection Performance
```javascript
describe('Branch Selection Performance', () => {
  test('should select branches quickly for multiple characters', async () => {
    const characters = createTestCharacters(100);
    const branches = createTestBranches(10);
    
    const startTime = performance.now();
    
    characters.forEach(character => {
      branchWeightingService.selectWeightedBranch(character, branches);
    });
    
    const endTime = performance.now();
    const averageTime = (endTime - startTime) / characters.length;
    
    expect(averageTime).toBeLessThan(5); // Under 5ms per character
  });
});
```