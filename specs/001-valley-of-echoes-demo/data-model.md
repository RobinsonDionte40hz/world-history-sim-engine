# Data Model: Valley of Echoes Two-Settlement Demo

## Overview
This document defines the data models, entity extensions, and value objects required for the Valley of Echoes demo implementation.

## Demo Pattern Consistency Requirements

### Character-Node Assignment Patterns (from existing demo)
- **Bidirectional Assignment Pattern**: Characters must have `assignments.nodes` Set AND nodes must have `assignedCharacters` array
- **Character Assignment Structure**:
  ```javascript
  this.assignments = {
    nodes: new Set(['node1', 'node2']),
    interactions: new Set(['interact1']),
    settlements: new Set(['settlement1']),
    // ... other assignment types
  }
  ```
- **Node Assignment Structure**:
  ```javascript
  this.assignedCharacters = ['char1', 'char2']  // Array of character IDs
  ```

### Data Formatting Conventions (from existing demo)
- **Property Naming**: Use camelCase consistently (`assignedCharacters` not `assigned_characters`)
- **ID Format**: Use descriptive prefixes (`node-`, `char-`, `interact-`) followed by descriptive names
- **Attributes Structure**: D&D standard attributes with exact property names:
  ```javascript
  attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }
  ```

### Content Structure Patterns (from existing demo)
- **Environmental Properties**: Must include `climate`, `season`, `resources`
- **Cultural Context**: Must include `language`, `traditions` arrays
- **Resource Availability**: Numeric values for key resources (`food`, `materials`, etc.)
- **Node Types**: Use standard types (`settlement`, `location`, `landmark`)

## Core Entity Extensions

### Character.js Extensions
```javascript
class Character {
  constructor(config = {}) {
    // Existing properties preserved
    
    // LOD System Integration
    this.lodTier = config.lodTier || 'hero'; // 'hero', 'group', 'background'
    this.populationGroupId = config.populationGroupId || null;
    this.lastProcessingTime = config.lastProcessingTime || null;
    
    // Settlement Integration
    this.settlementLoyalty = new Map(config.settlementLoyalty || []); // settlementId -> loyalty score
    this.crossSettlementReputation = new Map(config.crossSettlementReputation || []);
    this.settlementSpecificPrestige = new Map(config.settlementSpecificPrestige || []);
    
    // Population Group Statistics (for group-tier characters)
    this.groupStatistics = config.groupStatistics || null; // Only for group representatives
    this.lastGroupUpdate = config.lastGroupUpdate || null;
  }
  
  // LOD Management Methods
  promoteToHero() {
    this.lodTier = 'hero';
    this.populationGroupId = null;
    this.groupStatistics = null;
    // Initialize full character properties if needed
  }
  
  demoteToGroup(groupId, statistics) {
    this.lodTier = 'group';
    this.populationGroupId = groupId;
    this.groupStatistics = statistics;
  }
}
```

### Settlement.js Complete Rewrite as Class
```javascript
import { SettlementGovernance } from '../value-objects/SettlementGovernance.js';
import { DevelopmentTree } from '../value-objects/DevelopmentTree.js';

class Settlement {
  constructor(config = {}) {
    // Basic Properties
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Settlement';
    this.type = config.type || 'village';
    this.foundedDate = config.foundedDate || new Date();
    
    // Multi-Node Architecture
    this.nodes = new Map(); // nodeId -> Node instance
    this.nodeConnections = config.nodeConnections || []; // {from, to, type, strength}
    this.capitalNode = config.capitalNode || null; // Primary node ID
    
    // Population Management
    this.totalPopulation = config.totalPopulation || 0;
    this.populationGroups = new Map(); // groupId -> PopulationGroup
    this.heroNPCs = new Set(config.heroNPCIds || []);
    this.demographicBreakdown = config.demographicBreakdown || {};
    
    // Governance System
    this.governance = config.governance instanceof SettlementGovernance 
      ? config.governance 
      : new SettlementGovernance(config.governance || {});
    
    // Development Trees
    this.developmentTrees = new Map(); // category -> DevelopmentTree
    this.availableUpgrades = new Set(config.availableUpgrades || []);
    this.completedUpgrades = new Set(config.completedUpgrades || []);
    
    // Resource Management
    this.resources = new Map(config.resources || []); // resourceType -> amount
    this.resourceProduction = new Map(config.resourceProduction || []);
    this.resourceConsumption = new Map(config.resourceConsumption || []);
    this.resourceStorage = new Map(config.resourceStorage || []);
    
    // Inter-Settlement Relations
    this.relationships = new Map(); // settlementId -> CrossSettlementRelation
    this.activeAgreements = new Set(config.activeAgreements || []);
    this.diplomaticHistory = config.diplomaticHistory || [];
    
    // Alignment and Culture
    this.coreAlignment = config.coreAlignment || { law: 0, good: 0 };
    this.culturalValues = config.culturalValues || {};
    this.traditions = config.traditions || [];
    this.openness = config.openness || 0.5; // 0-1 scale
  }
  
  // Node Management
  addNode(node) {
    this.nodes.set(node.id, node);
    if (!this.capitalNode) {
      this.capitalNode = node.id;
    }
  }
  
  removeNode(nodeId) {
    if (this.capitalNode === nodeId && this.nodes.size > 1) {
      // Reassign capital to another node
      const remainingNodes = Array.from(this.nodes.keys()).filter(id => id !== nodeId);
      this.capitalNode = remainingNodes[0];
    }
    this.nodes.delete(nodeId);
  }
  
  // Population Group Management
  addPopulationGroup(group) {
    this.populationGroups.set(group.id, group);
    this.totalPopulation += group.size;
  }
  
  // Development Management
  canUpgrade(upgradeId) {
    const tree = this.getRelevantDevelopmentTree(upgradeId);
    return tree ? tree.canUpgrade(upgradeId, this.resources, this.completedUpgrades) : false;
  }
  
  completeUpgrade(upgradeId) {
    this.completedUpgrades.add(upgradeId);
    this.availableUpgrades.delete(upgradeId);
    // Apply upgrade effects
    this.applyUpgradeEffects(upgradeId);
  }
}
```

## New Entities

### PopulationGroup.js
```javascript
class PopulationGroup {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Group';
    this.type = config.type || 'citizens'; // 'merchants', 'artisans', 'guards', etc.
    this.settlementId = config.settlementId;
    this.nodeId = config.nodeId;
    
    // Population Statistics
    this.size = config.size || 10;
    this.averageAge = config.averageAge || 30;
    this.genderRatio = config.genderRatio || 0.5; // 0-1, male to female ratio
    
    // Aggregate Characteristics
    this.averageAttributes = config.averageAttributes || {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10
    };
    this.dominantPersonality = config.dominantPersonality || {};
    this.groupCohesion = config.groupCohesion || 0.5; // 0-1 scale
    
    // Economic Data
    this.averageWealth = config.averageWealth || 0;
    this.occupation = config.occupation || 'general';
    this.productivity = config.productivity || 1.0;
    this.skillLevel = config.skillLevel || 1; // 1-10 scale
    
    // Behavioral Patterns
    this.activityPatterns = config.activityPatterns || {};
    this.socialTendencies = config.socialTendencies || {};
    this.politicalLeanings = config.politicalLeanings || { law: 0, good: 0 };
    
    // Group State
    this.morale = config.morale || 0.5; // 0-1 scale
    this.satisfaction = config.satisfaction || 0.5;
    this.currentNeeds = config.currentNeeds || {};
    this.recentEvents = config.recentEvents || [];
    
    // Representative Characters
    this.representatives = new Set(config.representativeIds || []); // Hero NPCs from this group
    this.lastRepresentativeUpdate = config.lastRepresentativeUpdate || null;
    
    // Statistical Tracking
    this.demographicTrends = config.demographicTrends || {};
    this.behaviorHistory = config.behaviorHistory || [];
    this.lastStatisticalUpdate = config.lastStatisticalUpdate || Date.now();
  }
  
  // Statistical Methods
  generateIndividual(template = {}) {
    // Create a Character instance representing a group member
    return new Character({
      ...this.generateStatisticalVariation(),
      ...template,
      populationGroupId: this.id,
      lodTier: 'group'
    });
  }
  
  generateStatisticalVariation() {
    // Apply normal distribution around group averages
    return {
      age: this.generateNormalVariation(this.averageAge, 5),
      attributes: this.generateAttributeVariation(),
      wealth: this.generateNormalVariation(this.averageWealth, this.averageWealth * 0.3)
    };
  }
  
  updateGroupStatistics(members) {
    // Recalculate group statistics based on current members
    if (members.length === 0) return;
    
    this.size = members.length;
    this.averageAge = members.reduce((sum, m) => sum + m.age, 0) / members.length;
    // Update other aggregate statistics...
  }
  
  processGroupTurn(world, turnContext) {
    // Statistical group-level turn processing
    this.updateMorale(world, turnContext);
    this.processGroupNeeds(world);
    this.generateGroupEvents(world, turnContext);
    this.updateDemographics();
  }
}
```

### CrossSettlementRelation.js
```javascript
class CrossSettlementRelation {
  constructor(settlement1Id, settlement2Id, config = {}) {
    this.id = config.id || `${settlement1Id}-${settlement2Id}`;
    this.settlements = [settlement1Id, settlement2Id].sort(); // Consistent ordering
    
    // Diplomatic Standing
    this.diplomaticStanding = config.diplomaticStanding || 0; // -100 to +100
    this.recognitionStatus = config.recognitionStatus || 'neutral'; // 'allied', 'neutral', 'hostile'
    this.formalAgreements = new Set(config.formalAgreements || []);
    
    // Economic Relations
    this.tradeVolume = config.tradeVolume || 0;
    this.tradeBalance = config.tradeBalance || 0; // positive = settlement1 exports more
    this.tradeRoutes = config.tradeRoutes || [];
    this.economicDependency = config.economicDependency || 0; // 0-1 scale
    
    // Cultural Exchange
    this.culturalExchange = config.culturalExchange || 0; // 0-1 scale
    this.sharedTraditions = new Set(config.sharedTraditions || []);
    this.languageBarrier = config.languageBarrier || 0; // 0-1, higher = more barrier
    
    // Military Relations
    this.militaryTension = config.militaryTension || 0; // 0-1 scale
    this.militaryAlliance = config.militaryAlliance || false;
    this.sharedThreats = new Set(config.sharedThreats || []);
    this.disputedResources = config.disputedResources || [];
    
    // Historical Context
    this.relationshipHistory = config.relationshipHistory || [];
    this.foundingDate = config.foundingDate || Date.now();
    this.lastInteraction = config.lastInteraction || null;
    this.significantEvents = config.significantEvents || [];
    
    // Dynamic Factors
    this.currentTrends = config.currentTrends || {}; // diplomatic, economic, cultural trends
    this.influencingFactors = config.influencingFactors || []; // external factors affecting relationship
    this.stability = config.stability || 0.5; // 0-1, likelihood of dramatic changes
  }
  
  // Relationship Management
  updateDiplomaticStanding(change, reason) {
    const oldStanding = this.diplomaticStanding;
    this.diplomaticStanding = Math.max(-100, Math.min(100, this.diplomaticStanding + change));
    
    this.relationshipHistory.push({
      date: Date.now(),
      type: 'diplomatic',
      change: change,
      reason: reason,
      oldValue: oldStanding,
      newValue: this.diplomaticStanding
    });
    
    this.updateRecognitionStatus();
  }
  
  updateRecognitionStatus() {
    if (this.diplomaticStanding > 60) {
      this.recognitionStatus = 'allied';
    } else if (this.diplomaticStanding < -60) {
      this.recognitionStatus = 'hostile';
    } else {
      this.recognitionStatus = 'neutral';
    }
  }
  
  processInteraction(interaction) {
    // Update relationship based on specific interaction
    const effects = this.calculateInteractionEffects(interaction);
    this.applyEffects(effects);
    this.lastInteraction = {
      date: Date.now(),
      type: interaction.type,
      effects: effects
    };
  }
  
  getRelationshipSummary() {
    return {
      status: this.recognitionStatus,
      diplomatic: this.diplomaticStanding,
      economic: this.tradeVolume,
      cultural: this.culturalExchange,
      military: this.militaryTension,
      stability: this.stability
    };
  }
}
```

## Value Objects

### SettlementGovernance.js
```javascript
class SettlementGovernance {
  constructor(config = {}) {
    this.type = config.type || 'democratic'; // 'democratic', 'authoritarian', 'theocratic', etc.
    this.structure = config.structure || 'council'; // 'council', 'monarchy', 'oligarchy', etc.
    this.leadershipMethod = config.leadershipMethod || 'elected'; // 'elected', 'inherited', 'appointed'
    
    // Governance Characteristics
    this.decisionMakingProcess = config.decisionMakingProcess || 'majority_vote';
    this.citizenParticipation = config.citizenParticipation || 0.7; // 0-1 scale
    this.bureaucraticEfficiency = config.bureaucraticEfficiency || 0.5; // 0-1 scale
    this.corruption = config.corruption || 0.1; // 0-1 scale
    
    // Power Distribution
    this.powerConcentration = config.powerConcentration || 0.3; // 0-1, higher = more centralized
    this.checks_and_balances = config.checks_and_balances || true;
    this.termLimits = config.termLimits || true;
    
    // Policy Tendencies
    this.economicPolicy = config.economicPolicy || 'mixed'; // 'free_market', 'planned', 'mixed'
    this.socialPolicy = config.socialPolicy || 'progressive'; // 'conservative', 'progressive', 'moderate'
    this.foreignPolicy = config.foreignPolicy || 'diplomatic'; // 'aggressive', 'diplomatic', 'isolationist'
    
    // Governance Effects
    this.lawAndOrder = config.lawAndOrder || 0.6; // 0-1 scale
    this.socialCohesion = config.socialCohesion || 0.5;
    this.adaptability = config.adaptability || 0.6; // ability to change policies
  }
  
  // Decision Making
  makeDecision(issue, context) {
    const decision = this.processDecision(issue, context);
    const efficiency = this.calculateDecisionEfficiency(issue);
    const support = this.calculatePopularSupport(decision, context);
    
    return {
      decision: decision,
      efficiency: efficiency,
      support: support,
      implementationTime: this.calculateImplementationTime(decision)
    };
  }
  
  // Governance Effects
  getGovernanceModifiers() {
    return {
      economicEfficiency: this.bureaucraticEfficiency * (1 - this.corruption),
      socialStability: this.lawAndOrder * this.socialCohesion,
      innovationRate: this.adaptability * this.citizenParticipation,
      militaryEffectiveness: this.powerConcentration + this.lawAndOrder * 0.5
    };
  }
}
```

### DevelopmentTree.js
```javascript
class DevelopmentTree {
  constructor(category, config = {}) {
    this.category = category; // 'economic', 'military', 'cultural', etc.
    this.name = config.name || `${category} Development`;
    this.description = config.description || '';
    
    // Tree Structure
    this.nodes = new Map(); // upgradeId -> upgrade definition
    this.dependencies = new Map(); // upgradeId -> [prerequisite IDs]
    this.levels = config.levels || new Map(); // level -> [upgrade IDs]
    
    // Progress Tracking
    this.completedUpgrades = new Set(config.completedUpgrades || []);
    this.availableUpgrades = new Set(config.availableUpgrades || []);
    this.lockedUpgrades = new Set();
    
    this.initializeTree(config.treeDefinition);
  }
  
  initializeTree(definition) {
    if (!definition) return;
    
    Object.entries(definition).forEach(([upgradeId, upgrade]) => {
      this.nodes.set(upgradeId, {
        id: upgradeId,
        name: upgrade.name,
        description: upgrade.description,
        level: upgrade.level || 1,
        costs: upgrade.costs || {},
        prerequisites: upgrade.prerequisites || [],
        effects: upgrade.effects || {},
        unlocks: upgrade.unlocks || []
      });
      
      this.dependencies.set(upgradeId, upgrade.prerequisites || []);
    });
    
    this.updateAvailableUpgrades();
  }
  
  canUpgrade(upgradeId, availableResources, completedUpgrades) {
    const upgrade = this.nodes.get(upgradeId);
    if (!upgrade) return false;
    
    // Check prerequisites
    const prerequisites = this.dependencies.get(upgradeId) || [];
    const prerequisitesMet = prerequisites.every(prereq => 
      completedUpgrades.has(prereq) || this.completedUpgrades.has(prereq)
    );
    
    if (!prerequisitesMet) return false;
    
    // Check resource costs
    const costsAffordable = Object.entries(upgrade.costs).every(([resource, cost]) =>
      (availableResources.get(resource) || 0) >= cost
    );
    
    return costsAffordable;
  }
  
  updateAvailableUpgrades() {
    this.availableUpgrades.clear();
    this.lockedUpgrades.clear();
    
    this.nodes.forEach((upgrade, upgradeId) => {
      if (this.completedUpgrades.has(upgradeId)) {
        return; // Already completed
      }
      
      const prerequisites = this.dependencies.get(upgradeId) || [];
      const prerequisitesMet = prerequisites.every(prereq => 
        this.completedUpgrades.has(prereq)
      );
      
      if (prerequisitesMet) {
        this.availableUpgrades.add(upgradeId);
      } else {
        this.lockedUpgrades.add(upgradeId);
      }
    });
  }
  
  getUpgradeEffects(upgradeId) {
    const upgrade = this.nodes.get(upgradeId);
    return upgrade ? upgrade.effects : {};
  }
}
```

### LODTier.js
```javascript
class LODTier {
  constructor(tier, config = {}) {
    this.tier = tier; // 'hero', 'group', 'background'
    this.name = config.name || tier;
    this.description = config.description || '';
    
    // Processing Characteristics
    this.processingComplexity = config.processingComplexity || this.getDefaultComplexity(tier);
    this.memoryFootprint = config.memoryFootprint || this.getDefaultMemoryFootprint(tier);
    this.updateFrequency = config.updateFrequency || this.getDefaultUpdateFrequency(tier);
    
    // Promotion/Demotion Rules
    this.promotionCriteria = config.promotionCriteria || {};
    this.demotionCriteria = config.demotionCriteria || {};
    this.maxPopulation = config.maxPopulation || this.getDefaultMaxPopulation(tier);
    
    // Processing Rules
    this.fullSimulation = tier === 'hero';
    this.statisticalProcessing = tier === 'group';
    this.aggregateOnly = tier === 'background';
  }
  
  getDefaultComplexity(tier) {
    switch(tier) {
      case 'hero': return 'full';
      case 'group': return 'statistical';
      case 'background': return 'aggregate';
      default: return 'minimal';
    }
  }
  
  canPromoteCharacter(character, context) {
    if (this.tier === 'background') return false;
    if (this.tier === 'hero') return false; // Already at highest tier
    
    // Check promotion criteria
    return Object.entries(this.promotionCriteria).every(([criterion, threshold]) => {
      return this.evaluateCriterion(character, criterion, threshold, context);
    });
  }
  
  shouldDemoteCharacter(character, context) {
    if (this.tier === 'background') return false; // Already at lowest tier
    
    // Check demotion criteria
    return Object.entries(this.demotionCriteria).some(([criterion, threshold]) => {
      return this.evaluateCriterion(character, criterion, threshold, context);
    });
  }
}
```

## Service Interfaces

### LODManager Interface
```javascript
class LODManager {
  // Character Processing
  processCharacter(character, world, turn);
  processCharacterTier(characters, tier, world, turn);
  
  // Tier Management
  promoteCharacter(characterId, fromTier, toTier, reason);
  demoteCharacter(characterId, fromTier, toTier, reason);
  evaluatePromotions(world, context);
  evaluateDemotions(world, context);
  
  // Performance
  getProcessingMetrics();
  optimizeProcessingOrder(characters);
  batchProcessCharacters(characters, batchSize);
}
```

### CrossSettlementService Interface
```javascript
class CrossSettlementService {
  // Relationship Management
  initializeRelationship(settlement1Id, settlement2Id);
  updateRelationship(settlement1Id, settlement2Id, changes);
  getRelationship(settlement1Id, settlement2Id);
  
  // Interactions
  initiateDiplomacy(fromSettlement, toSettlement, proposalType);
  processTradeNegotiation(settlement1Id, settlement2Id, tradeProposal);
  resolveConflict(settlement1Id, settlement2Id, conflictType);
  
  // Events
  generateCrossSettlementEvents(world, turn);
  processCrossSettlementConsequences(events, world);
}
```

### PopulationGroupService Interface
```javascript
class PopulationGroupService {
  // Group Management
  createPopulationGroup(config);
  updateGroupStatistics(groupId, statistics);
  processGroupTurn(groupId, world, turn);
  
  // Individual Management
  materializeIndividual(groupId, template);
  absorbeIndividualIntoGroup(characterId, groupId);
  sampleGroupMembers(groupId, sampleSize);
  
  // Statistics
  aggregateGroupBehavior(groupId, context);
  generateGroupEvents(groupId, world, turn);
  updateGroupDemographics(groupId);
}
```

This data model provides the foundation for implementing the Valley of Echoes demo while maintaining clean architecture principles and extending existing systems rather than replacing them.