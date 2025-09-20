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
        terrain: 'forest',
        climate: 'temperate',
        lighting: 'natural',
        season: 'spring',
        timeOfDay: 'day'
      },
      culturalContext: {
        language: 'common',
        traditions: ['warrior_code', 'defense_drills', 'honor_guard'],
        socialStructure: 'hierarchical'
      },
      capacity: {
        maxCharacters: 30,
        currentCharacters: 0
      },
      contentInteractions: [
        {
          id: 'fortification_work',
          name: 'Fortification Engineering',
          description: 'Design and maintain defensive structures and siege engines',
          type: 'labor',
          category: 'engineering',
          requirements: {
            energy: 30,
            intelligence: 13,
            dexterity: 12
          },
          effects: {
            experience: 7,
            wealth: 15,
            satisfaction: 12
          },
          branches: [
            {
              id: 'engineering_success',
              name: 'Work Successfully',
              conditions: [],
              effects: [
                { type: 'skill', skill: 'engineering', value: 3 },
                { type: 'resource', resource: 'fortifications', value: 1 },
                { type: 'wealth', value: 15 }
              ]
            }
          ],
          context: {
            duration: 4,
            location: 'command_center'
          }
        }
      ]
    },
    {
      id: 'ironhold-forge-district',
      name: 'Forge District',
      type: 'industrial',
      description: 'Smithing and metalworking center producing weapons and tools',
      environmentalProperties: {
        terrain: 'forest',
        climate: 'temperate',
        lighting: 'natural',
        season: 'spring',
        timeOfDay: 'day'
      },
      culturalContext: {
        language: 'common',
        traditions: ['forge_blessings', 'master_apprentice', 'craft_excellence'],
        socialStructure: 'guild_based'
      },
      capacity: {
        maxCharacters: 45,
        currentCharacters: 0
      },
      contentInteractions: [
        {
          id: 'smithing_work',
          name: 'Smithing Work',
          description: 'Forge weapons and tools at the smithy',
          type: 'labor',
          category: 'craft',
          requirements: {
            energy: 35,
            strength: 12,
            dexterity: 12
          },
          effects: {
            experience: 8,
            wealth: 12,
            satisfaction: 8
          },
          branches: [
            {
              id: 'smith_success',
              name: 'Work Successfully',
              conditions: [],
              effects: [
                { type: 'skill', skill: 'smithing', value: 3 },
                { type: 'resource', resource: 'tools', value: 2 },
                { type: 'wealth', value: 12 }
              ]
            }
          ],
          context: {
            duration: 5,
            location: 'forge'
          }
        }
      ]
    },
    {
      id: 'ironhold-mining-complex',
      name: 'Mining Complex',
      type: 'industrial',
      description: 'Deep mines extracting ore and precious minerals',
      environmentalProperties: {
        terrain: 'forest',
        climate: 'temperate',
        lighting: 'natural',
        season: 'spring',
        timeOfDay: 'day'
      },
      culturalContext: {
        language: 'common',
        traditions: ['miner_prayers', 'safety_rites', 'discovery_celebrations'],
        socialStructure: 'communal'
      },
      capacity: {
        maxCharacters: 50,
        currentCharacters: 0
      },
      contentInteractions: [
        {
          id: 'mining_work',
          name: 'Mining Work',
          description: 'Extract ore and minerals from the deep mines',
          type: 'labor',
          category: 'mining',
          requirements: {
            energy: 40,
            strength: 14,
            constitution: 14
          },
          effects: {
            experience: 6,
            wealth: 10,
            satisfaction: 6
          },
          branches: [
            {
              id: 'mining_success',
              name: 'Work Successfully',
              conditions: [],
              effects: [
                { type: 'skill', skill: 'mining', value: 2 },
                { type: 'resource', resource: 'ore', value: 3 },
                { type: 'wealth', value: 10 }
              ]
            }
          ],
          context: {
            duration: 6,
            location: 'mine'
          }
        }
      ]
    },
    {
      id: 'ironhold-barracks',
      name: 'Military Barracks',
      type: 'military',
      description: 'Housing and training facilities for military personnel',
      environmentalProperties: {
        terrain: 'forest',
        climate: 'temperate',
        lighting: 'natural',
        season: 'spring',
        timeOfDay: 'day'
      },
      culturalContext: {
        language: 'common',
        traditions: ['morning_drills', 'combat_training', 'unit_bonding'],
        socialStructure: 'military'
      },
      capacity: {
        maxCharacters: 40,
        currentCharacters: 0
      },
      contentInteractions: [
        {
          id: 'military_training',
          name: 'Military Training',
          description: 'Practice combat skills and maintain military readiness',
          type: 'training',
          category: 'military',
          requirements: {
            energy: 35,
            strength: 12,
            constitution: 12
          },
          effects: {
            experience: 8,
            wealth: 5,
            satisfaction: 8
          },
          branches: [
            {
              id: 'training_success',
              name: 'Train Successfully',
              conditions: [],
              effects: [
                { type: 'skill', skill: 'combat', value: 3 },
                { type: 'attribute', attribute: 'strength', value: 1 },
                { type: 'wealth', value: 5 }
              ]
            }
          ],
          context: {
            duration: 3,
            location: 'training_grounds'
          }
        }
      ]
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
      assignments: {
        nodes: new Set(['ironhold-mining-complex']),
        interactions: new Set([])
      }
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
      assignments: {
        nodes: new Set(['ironhold-forge-district']),
        interactions: new Set([])
      }
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
      assignments: {
        nodes: new Set(['ironhold-barracks']),
        interactions: new Set([])
      }
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
      assignments: {
        nodes: new Set(['ironhold-command-center']),
        interactions: new Set([])
      }
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
        strength: { score: 18, modifier: +4 },
        dexterity: { score: 14, modifier: +2 },
        constitution: { score: 17, modifier: +3 },
        intelligence: { score: 15, modifier: +2 },
        wisdom: { score: 16, modifier: +3 },
        charisma: { score: 13, modifier: +1 }
      },
      consciousness: {
        frequency: 0.75,
        coherence: 0.85
      },
      assignments: {
        nodes: new Set(['ironhold-command-center']),
        interactions: new Set([])
      },
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
        strength: { score: 16, modifier: +3 },
        dexterity: { score: 18, modifier: +4 },
        constitution: { score: 15, modifier: +2 },
        intelligence: { score: 14, modifier: +2 },
        wisdom: { score: 12, modifier: +1 },
        charisma: { score: 15, modifier: +2 }
      },
      consciousness: {
        frequency: 0.7,
        coherence: 0.8
      },
      assignments: {
        nodes: new Set(['ironhold-forge-district']),
        interactions: new Set([])
      },
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
        strength: { score: 17, modifier: +3 },
        dexterity: { score: 13, modifier: +1 },
        constitution: { score: 18, modifier: +4 },
        intelligence: { score: 12, modifier: +1 },
        wisdom: { score: 14, modifier: +2 },
        charisma: { score: 11, modifier: +0 }
      },
      consciousness: {
        frequency: 0.65,
        coherence: 0.9
      },
      assignments: {
        nodes: new Set(['ironhold-mining-complex']),
        interactions: new Set([])
      },
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
        strength: { score: 16, modifier: +3 },
        dexterity: { score: 16, modifier: +3 },
        constitution: { score: 16, modifier: +3 },
        intelligence: { score: 13, modifier: +1 },
        wisdom: { score: 15, modifier: +2 },
        charisma: { score: 14, modifier: +2 }
      },
      consciousness: {
        frequency: 0.7,
        coherence: 0.8
      },
      assignments: {
        nodes: new Set(['ironhold-barracks']),
        interactions: new Set([])
      },
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