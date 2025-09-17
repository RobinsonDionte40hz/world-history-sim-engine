// src/test/lod/lod-test-data.js

/**
 * Test data factories and fixtures for LOD system testing
 */

import { SettlementGovernance } from '../../../domain/value-objects/SettlementGovernance.js';
import { DevelopmentTree } from '../../../domain/value-objects/DevelopmentTree.js';

/**
 * Factory for creating test data
 */
export class LODTestDataFactory {
  /**
   * Create a complete hero character with all required properties
   */
  static createHeroCharacter(config = {}) {
    const defaults = {
      id: `char-hero-${Date.now()}`,
      name: 'Test Hero',
      lodTier: 'hero',
      consciousness: { frequency: 0.75, coherence: 0.8 },
      attributes: {
        strength: 14, dexterity: 13, constitution: 15,
        intelligence: 12, wisdom: 16, charisma: 14
      },
      personalityProfile: {
        openness: 0.7, conscientiousness: 0.8, extraversion: 0.6,
        agreeableness: 0.7, neuroticism: 0.3
      },
      assignments: {
        nodes: new Set([`node-${config.settlementId || 'test'}-center`]),
        interactions: new Set([`interact-${config.settlementId || 'test'}-main`]),
        settlements: new Set([config.settlementId || 'settlement-test'])
      },
      playerInteractionCount: config.playerInteractionCount || 0,
      completedQuests: config.completedQuests || [],
      inactivityTurns: config.inactivityTurns || 0,
      settlementLoyalty: new Map([[config.settlementId || 'settlement-test', 0.8]]),
      crossSettlementReputation: new Map(),
      settlementSpecificPrestige: new Map()
    };

    return { ...defaults, ...config };
  }

  /**
   * Create a group representative character
   */
  static createGroupCharacter(config = {}) {
    const defaults = {
      id: `char-group-${Date.now()}`,
      name: 'Group Representative',
      lodTier: 'group',
      populationGroupId: config.groupId || `group-test-${Date.now()}`,
      groupStatistics: {
        size: config.size || 10,
        averageAge: 32,
        genderRatio: 0.45,
        averageAttributes: {
          strength: 12, dexterity: 11, constitution: 13,
          intelligence: 10, wisdom: 12, charisma: 11
        },
        dominantPersonality: {
          openness: 0.5, conscientiousness: 0.6, extraversion: 0.4,
          agreeableness: 0.7, neuroticism: 0.4
        },
        groupCohesion: 0.7,
        averageWealth: 120,
        occupation: config.occupation || 'merchant',
        productivity: 0.8,
        skillLevel: 2,
        morale: 0.75,
        satisfaction: 0.7,
        currentNeeds: { food: 0.8, security: 0.9 }
      },
      assignments: {
        nodes: new Set([config.nodeId || `node-test-market`]),
        interactions: new Set(),
        settlements: new Set([config.settlementId || 'settlement-test'])
      },
      playerInteractionCount: config.playerInteractionCount || 0,
      inactivityTurns: config.inactivityTurns || 2
    };

    return { ...defaults, ...config };
  }

  /**
   * Create a background demographic character
   */
  static createBackgroundCharacter(config = {}) {
    const defaults = {
      id: `char-bg-${Date.now()}`,
      name: 'Background Demographic',
      lodTier: 'background',
      demographicData: {
        ageGroup: config.ageGroup || 'adult',
        occupation: config.occupation || 'farmer',
        socioeconomicClass: config.socioeconomicClass || 'commoner',
        count: config.count || 15,
        culturalBackground: config.culturalBackground || 'local'
      },
      assignments: {
        nodes: new Set(),
        interactions: new Set(),
        settlements: new Set([config.settlementId || 'settlement-test'])
      }
    };

    return { ...defaults, ...config };
  }

  /**
   * Create a population group
   */
  static createPopulationGroup(config = {}) {
    const defaults = {
      id: config.id || `group-${Date.now()}`,
      name: config.name || 'Test Population Group',
      type: config.type || 'citizens',
      settlementId: config.settlementId || 'settlement-test',
      nodeId: config.nodeId || 'node-test-district',
      size: config.size || 20,
      averageAge: 35,
      genderRatio: 0.48,
      averageAttributes: {
        strength: 11, dexterity: 10, constitution: 12,
        intelligence: 9, wisdom: 11, charisma: 10
      },
      dominantPersonality: {
        openness: 0.5, conscientiousness: 0.6, extraversion: 0.5,
        agreeableness: 0.6, neuroticism: 0.4
      },
      groupCohesion: 0.7,
      averageWealth: 100,
      occupation: config.occupation || 'mixed',
      productivity: 0.8,
      skillLevel: 1,
      activityPatterns: {
        workHours: { start: 8, end: 17 },
        socialHours: { start: 18, end: 22 }
      },
      socialTendencies: {
        communityInvolvement: 0.6,
        cooperationLevel: 0.7
      },
      politicalLeanings: { law: 0.1, good: 0.2 },
      morale: 0.7,
      satisfaction: 0.7,
      currentNeeds: { food: 0.8, shelter: 0.9, security: 0.8 },
      representatives: new Set(config.representatives || [])
    };

    return { ...defaults, ...config };
  }

  /**
   * Create a settlement with LOD integration
   */
  static createSettlement(config = {}) {
    const settlementId = config.id || `settlement-${Date.now()}`;
    const defaults = {
      id: settlementId,
      name: config.name || 'Test Settlement',
      type: config.type || 'village',
      foundedDate: config.foundedDate || new Date(),
      nodes: new Map(),
      nodeConnections: config.nodeConnections || [],
      capitalNode: config.capitalNode || null,
      totalPopulation: config.totalPopulation || 0,
      populationGroups: new Map(),
      heroNPCs: new Set(),
      demographicBreakdown: config.demographicBreakdown || {},
      governance: config.governance || SettlementGovernance.DEMOCRATIC,
      developmentTrees: new Map([
        ['economic', DevelopmentTree.ECONOMIC_DEVELOPMENT],
        ['military', DevelopmentTree.MILITARY_DEVELOPMENT]
      ]),
      availableUpgrades: new Set(['basic_farming', 'basic_training']),
      completedUpgrades: new Set(),
      resources: new Map([
        ['gold', 1000],
        ['food', 500],
        ['materials', 300]
      ]),
      relationships: new Map(),
      coreAlignment: config.coreAlignment || { law: 0.2, good: 0.3 },
      culturalValues: config.culturalValues || { tradition: 0.6, innovation: 0.4 },
      traditions: config.traditions || ['harvest_festival'],
      openness: config.openness || 0.5
    };

    return { ...defaults, ...config };
  }

  /**
   * Create a complete world context for testing
   */
  static createWorldContext(config = {}) {
    const settlement1 = this.createSettlement({
      id: 'settlement-oakwood',
      name: 'Oakwood Federation',
      totalPopulation: 150
    });

    const settlement2 = this.createSettlement({
      id: 'settlement-ironhold',
      name: 'Ironhold Dominion',
      totalPopulation: 120,
      governance: SettlementGovernance.AUTHORITARIAN
    });

    // Create characters for settlement 1
    const hero1 = this.createHeroCharacter({
      id: 'char-oakwood-mayor',
      name: 'Elena Fairwind',
      settlementId: 'settlement-oakwood',
      playerInteractionCount: 3
    });

    const group1 = this.createGroupCharacter({
      id: 'char-oakwood-merchant',
      name: 'Marcus Tradeborn',
      settlementId: 'settlement-oakwood',
      groupId: 'group-oakwood-merchants',
      occupation: 'merchant'
    });

    const bg1 = this.createBackgroundCharacter({
      id: 'char-oakwood-farmers',
      settlementId: 'settlement-oakwood',
      occupation: 'farmer',
      count: 45
    });

    // Create characters for settlement 2
    const hero2 = this.createHeroCharacter({
      id: 'char-ironhold-captain',
      name: 'Garrik Ironfist',
      settlementId: 'settlement-ironhold',
      playerInteractionCount: 1
    });

    const group2 = this.createGroupCharacter({
      id: 'char-ironhold-guard',
      name: 'Sergeant Thorne',
      settlementId: 'settlement-ironhold',
      groupId: 'group-ironhold-guards',
      occupation: 'guard'
    });

    const defaults = {
      turn: config.turn || 1,
      settlements: new Map([
        ['settlement-oakwood', settlement1],
        ['settlement-ironhold', settlement2]
      ]),
      characters: new Map([
        ['char-oakwood-mayor', hero1],
        ['char-oakwood-merchant', group1],
        ['char-oakwood-farmers', bg1],
        ['char-ironhold-captain', hero2],
        ['char-ironhold-guard', group2]
      ]),
      quests: new Map(),
      events: [],
      worldState: {
        season: 'spring',
        weather: 'clear',
        globalTension: 0.2
      }
    };

    return { ...defaults, ...config };
  }

  /**
   * Create a large character batch for performance testing
   */
  static createLargeCharacterBatch(settlementId = 'settlement-test', counts = { hero: 5, group: 20, background: 75 }) {
    const characters = [];

    // Hero characters
    for (let i = 0; i < counts.hero; i++) {
      characters.push(this.createHeroCharacter({
        id: `char-hero-${settlementId}-${i}`,
        name: `Hero ${i + 1}`,
        settlementId,
        playerInteractionCount: Math.floor(Math.random() * 10)
      }));
    }

    // Group characters
    for (let i = 0; i < counts.group; i++) {
      characters.push(this.createGroupCharacter({
        id: `char-group-${settlementId}-${i}`,
        name: `Group Rep ${i + 1}`,
        settlementId,
        groupId: `group-${settlementId}-${i}`,
        size: Math.floor(Math.random() * 20) + 5
      }));
    }

    // Background characters
    for (let i = 0; i < counts.background; i++) {
      characters.push(this.createBackgroundCharacter({
        id: `char-bg-${settlementId}-${i}`,
        settlementId,
        count: Math.floor(Math.random() * 50) + 10
      }));
    }

    return characters;
  }

  /**
   * Create performance test scenarios
   */
  static createPerformanceScenarios() {
    return {
      small: {
        name: 'Small Settlement (25 NPCs)',
        characters: this.createLargeCharacterBatch('small', { hero: 2, group: 8, background: 15 }),
        expectedMaxTime: 100 // ms
      },
      medium: {
        name: 'Medium Settlement (75 NPCs)',
        characters: this.createLargeCharacterBatch('medium', { hero: 5, group: 20, background: 50 }),
        expectedMaxTime: 500 // ms
      },
      large: {
        name: 'Large Settlement (150+ NPCs)',
        characters: this.createLargeCharacterBatch('large', { hero: 10, group: 40, background: 100 }),
        expectedMaxTime: 2000 // ms
      }
    };
  }
}

export default LODTestDataFactory;