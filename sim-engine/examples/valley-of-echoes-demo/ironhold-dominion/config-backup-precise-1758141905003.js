/**
 * Ironhold Dominion Configuration
 * Valley of Echoes Demo - Ironhold Dominion Settlement
 *
 * A fortified mining and smithing stronghold in the Ironhold Mountains.
 * Known for its skilled smiths, defensive fortifications, and strategic importance.
 * Features multi-node architecture with military, industrial, and mining districts.
 */

const ironholdDominionConfig = {
  // Settlement metadata
  id: 'ironhold-dominion',
  name: 'Ironhold Dominion',
  type: 'dominion',
  description: 'A fortified mining and smithing stronghold in the Ironhold Mountains, known for its skilled smiths and defensive fortifications.',

  // Governance structure
  governance: {
    type: 'hierarchical_dominion',
    leaderTitle: 'Lord Protector',
    militaryCommanders: 3,
    decisionMaking: 'authoritarian_consultative',
    successionRules: 'hereditary_with_merit'
  },

  // Multi-node architecture
  nodes: [
    {
      id: 'ironhold-command-center',
      name: 'Command Center',
      type: 'military',
      description: 'Military command and defensive coordination center',
      environmentalProperties: {
        climate: 'mountain',
        season: 'spring',
        resources: ['military', 'strategic'],
        terrain: 'fortified'
      },
      culturalContext: {
        language: 'common',
        traditions: ['warrior_code', 'defense_drills', 'honor_guard'],
        socialStructure: 'hierarchical'
      },
      capacity: {
        maxCharacters: 30,
        currentCharacters: 0
      }
    },
    {
      id: 'ironhold-forge-district',
      name: 'Forge District',
      type: 'industrial',
      description: 'Smithing and metalworking center producing weapons and tools',
      environmentalProperties: {
        climate: 'mountain',
        season: 'spring',
        resources: ['metal', 'weapons', 'tools'],
        terrain: 'industrial'
      },
      culturalContext: {
        language: 'common',
        traditions: ['forge_blessings', 'master_apprentice', 'craft_excellence'],
        socialStructure: 'guild_based'
      },
      capacity: {
        maxCharacters: 45,
        currentCharacters: 0
      }
    },
    {
      id: 'ironhold-mining-complex',
      name: 'Mining Complex',
      type: 'industrial',
      description: 'Deep mines extracting ore and precious minerals',
      environmentalProperties: {
        climate: 'mountain',
        season: 'spring',
        resources: ['ore', 'minerals', 'gems'],
        terrain: 'underground'
      },
      culturalContext: {
        language: 'common',
        traditions: ['miner_prayers', 'safety_rites', 'discovery_celebrations'],
        socialStructure: 'communal'
      },
      capacity: {
        maxCharacters: 50,
        currentCharacters: 0
      }
    },
    {
      id: 'ironhold-barracks',
      name: 'Military Barracks',
      type: 'military',
      description: 'Housing and training facilities for military personnel',
      environmentalProperties: {
        climate: 'mountain',
        season: 'spring',
        resources: ['military', 'training'],
        terrain: 'fortified'
      },
      culturalContext: {
        language: 'common',
        traditions: ['morning_drills', 'combat_training', 'unit_bonding'],
        socialStructure: 'military'
      },
      capacity: {
        maxCharacters: 40,
        currentCharacters: 0
      }
    }
  ],

  // Initial population groups (LOD background tier)
  populationGroups: [
    {
      id: 'ironhold-miners',
      name: 'Ironhold Miners',
      size: 38,
      demographics: {
        ageGroup: 'adult',
        occupation: 'miner',
        economicClass: 'working'
      },
      statistics: {
        averageWealth: 140,
        morale: 0.8,
        productivity: 0.85,
        loyalty: 0.9
      },
      assignedNode: 'ironhold-mining-complex'
    },
    {
      id: 'ironhold-smiths',
      name: 'Ironhold Smiths',
      size: 22,
      demographics: {
        ageGroup: 'adult',
        occupation: 'smith',
        economicClass: 'middle'
      },
      statistics: {
        averageWealth: 200,
        morale: 0.75,
        productivity: 0.95,
        loyalty: 0.85
      },
      assignedNode: 'ironhold-forge-district'
    },
    {
      id: 'ironhold-soldiers',
      name: 'Ironhold Garrison',
      size: 32,
      demographics: {
        ageGroup: 'adult',
        occupation: 'soldier',
        economicClass: 'middle'
      },
      statistics: {
        averageWealth: 130,
        morale: 0.9,
        productivity: 0.8,
        loyalty: 0.95
      },
      assignedNode: 'ironhold-barracks'
    },
    {
      id: 'ironhold-engineers',
      name: 'Fortress Engineers',
      size: 8,
      demographics: {
        ageGroup: 'adult',
        occupation: 'engineer',
        economicClass: 'upper_middle'
      },
      statistics: {
        averageWealth: 220,
        morale: 0.85,
        productivity: 0.9,
        loyalty: 0.9
      },
      assignedNode: 'ironhold-command-center'
    }
  ],

  // Initial hero-tier characters
  heroCharacters: [
    {
      id: 'lord-protector-garret',
      name: 'Lord Garret Ironfist',
      role: 'Lord Protector',
      personality: {
        traits: ['disciplined', 'strategic', 'protective'],
        background: 'veteran_commander'
      },
      attributes: {
        strength: 18,
        dexterity: 14,
        constitution: 17,
        intelligence: 15,
        wisdom: 16,
        charisma: 13
      },
      consciousness: {
        frequency: 0.75,
        coherence: 0.85
      },
      assignedNode: 'ironhold-command-center',
      relationships: ['master-smith', 'mining-foreman', 'captain-garrison']
    },
    {
      id: 'master-smith',
      name: 'Helena Forgeheart',
      role: 'Master Smith',
      personality: {
        traits: ['precise', 'innovative', 'demanding'],
        background: 'legendary_smith'
      },
      attributes: {
        strength: 16,
        dexterity: 18,
        constitution: 15,
        intelligence: 14,
        wisdom: 12,
        charisma: 15
      },
      consciousness: {
        frequency: 0.7,
        coherence: 0.8
      },
      assignedNode: 'ironhold-forge-district',
      relationships: ['lord-protector-garret', 'mining-foreman']
    },
    {
      id: 'mining-foreman',
      name: 'Drake Deepvein',
      role: 'Mining Foreman',
      personality: {
        traits: ['tough', 'experienced', 'loyal'],
        background: 'lifelong_miner'
      },
      attributes: {
        strength: 17,
        dexterity: 13,
        constitution: 18,
        intelligence: 12,
        wisdom: 14,
        charisma: 11
      },
      consciousness: {
        frequency: 0.65,
        coherence: 0.9
      },
      assignedNode: 'ironhold-mining-complex',
      relationships: ['lord-protector-garret', 'master-smith']
    },
    {
      id: 'captain-garrison',
      name: 'Captain Thorne',
      role: 'Garrison Captain',
      personality: {
        traits: ['disciplined', 'tactical', 'protective'],
        background: 'career_soldier'
      },
      attributes: {
        strength: 16,
        dexterity: 16,
        constitution: 16,
        intelligence: 13,
        wisdom: 15,
        charisma: 14
      },
      consciousness: {
        frequency: 0.7,
        coherence: 0.8
      },
      assignedNode: 'ironhold-barracks',
      relationships: ['lord-protector-garret']
    }
  ],

  // Initial need satisfaction state
  needSatisfaction: {
    current: {
      overall: 0.78,
      needs: {
        food: 0.7,
        water: 0.85,
        shelter: 0.9,
        security: 0.95,
        goods: 0.8,
        services: 0.6
      }
    },
    activeConsequences: []
  },

  // Development tree progress
  development: {
    currentLevel: 2,
    experience: 380,
    availableUpgrades: [
      {
        id: 'fortify-defenses',
        name: 'Fortify Defenses',
        cost: 250,
        requirements: ['military_focus'],
        effects: {
          securityLevel: 1.4,
          militaryCapacity: 1.2
        }
      },
      {
        id: 'expand-mines',
        name: 'Expand Mining Operations',
        cost: 180,
        requirements: ['industrial_focus'],
        effects: {
          resourceProduction: 1.3,
          economicIncome: 1.2
        }
      }
    ]
  },

  // Cross-settlement relationships
  relationships: {
    'oakwood-federation': {
      type: 'trade_partner',
      strength: 0.7,
      tradeVolume: 25,
      diplomaticStatus: 'cordial',
      sharedInterests: ['regional_security', 'resource_exchange']
    }
  },

  // Economic state
  economy: {
    wealth: 1100,
    income: 160,
    expenses: 140,
    tradeBalance: -15,
    primaryExports: ['weapons', 'tools', 'ore', 'metal'],
    primaryImports: ['food', 'luxury_goods', 'textiles']
  }
};

module.exports = ironholdDominionConfig;