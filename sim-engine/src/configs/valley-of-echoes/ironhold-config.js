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
          id: 'military_briefing',
          name: 'Military Briefing',
          description: 'Attend strategic military briefings and planning sessions',
          type: 'military',
          category: 'strategy',
          requirements: { citizenTier: 'LEADER' },
          effects: { strategicKnowledge: 0.1, militaryStanding: 0.05 },
          branches: [
            {
              text: 'Discuss defense strategies',
              effects: { knowledge: 'defense_tactics' },
              outcomes: ['Learn about fortress defense strategies and tactics']
            },
            {
              text: 'Review troop readiness',
              effects: { knowledge: 'military_readiness' },
              outcomes: ['Assess the preparedness and training of military forces']
            }
          ]
        },
        {
          id: 'honor_guard_ceremony',
          name: 'Honor Guard Ceremony',
          description: 'Participate in ceremonial military traditions',
          type: 'cultural',
          category: 'tradition',
          requirements: { constitution: 14 },
          effects: { honor: 0.1, discipline: 0.05 },
          branches: [
            {
              text: 'Stand in formation',
              effects: { militaryDiscipline: 0.1 },
              outcomes: ['Practice military precision and ceremonial procedures']
            },
            {
              text: 'Learn warrior traditions',
              effects: { knowledge: 'warrior_code' },
              outcomes: ['Study the traditional code of honor and military ethics']
            }
          ]
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
          description: 'Work at the forge creating weapons and tools',
          type: 'labor',
          category: 'craft',
          requirements: { strength: 13, constitution: 13 },
          effects: { wealth: 12, smithingSkill: 0.1, experience: 2 },
          branches: [
            {
              text: 'Forge weapons',
              effects: { weaponCrafting: 0.15, reputation: 3 },
              outcomes: ['Create high-quality weapons for the garrison']
            },
            {
              text: 'Craft tools',
              effects: { toolCrafting: 0.15, utility: 0.1 },
              outcomes: ['Produce essential tools for mining and construction']
            }
          ]
        },
        {
          id: 'apprentice_training',
          name: 'Apprentice Training',
          description: 'Learn smithing skills from master craftsmen',
          type: 'educational',
          category: 'craft',
          requirements: { dexterity: 12 },
          effects: { smithingKnowledge: 0.2 },
          branches: [
            {
              text: 'Study metal properties',
              effects: { knowledge: 'metallurgy' },
              outcomes: ['Learn about different metals and their properties']
            },
            {
              text: 'Practice hammer techniques',
              effects: { forgingSkill: 0.15 },
              outcomes: ['Develop proper hammering and shaping techniques']
            }
          ]
        },
        {
          id: 'forge_blessing',
          name: 'Forge Blessing Ceremony',
          description: 'Participate in traditional forge blessing rituals',
          type: 'cultural',
          category: 'tradition',
          requirements: {},
          effects: { spiritualWellbeing: 0.1, craftInspiration: 0.05 },
          branches: [
            {
              text: 'Offer prayers to forge spirits',
              effects: { spiritualConnection: 0.1 },
              outcomes: ['Connect with traditional smithing spiritual beliefs']
            },
            {
              text: 'Share craft stories',
              effects: { inspiration: 0.1 },
              outcomes: ['Hear legendary stories of master smiths and their creations']
            }
          ]
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
          description: 'Work in the mines extracting ore and minerals',
          type: 'labor',
          category: 'mining',
          requirements: { strength: 14, constitution: 15 },
          effects: { wealth: 10, miningSkill: 0.1, experience: 1 },
          branches: [
            {
              text: 'Extract iron ore',
              effects: { oreYield: 1.2, physicalEndurance: 0.05 },
              outcomes: ['Mine iron ore for the forges and weapon production']
            },
            {
              text: 'Search for precious minerals',
              effects: { discoveryChance: 0.1, wealth: 5 },
              outcomes: ['Look for valuable minerals and gem deposits']
            }
          ]
        },
        {
          id: 'safety_briefing',
          name: 'Safety Briefing',
          description: 'Learn and practice mine safety procedures',
          type: 'educational',
          category: 'safety',
          requirements: {},
          effects: { safetyKnowledge: 0.15 },
          branches: [
            {
              text: 'Study cave-in prevention',
              effects: { knowledge: 'structural_integrity' },
              outcomes: ['Learn techniques to prevent mine collapses']
            },
            {
              text: 'Practice emergency procedures',
              effects: { emergencyPreparedness: 0.1 },
              outcomes: ['Drill emergency evacuation and rescue procedures']
            }
          ]
        },
        {
          id: 'miner_gathering',
          name: 'Miner Gathering',
          description: 'Join fellow miners for discussions and celebrations',
          type: 'social',
          category: 'community',
          requirements: {},
          effects: { camaraderie: 0.1, miningStories: 0.05 },
          branches: [
            {
              text: 'Share mining experiences',
              effects: { knowledge: 'mining_techniques' },
              outcomes: ['Exchange tips and stories about mining challenges']
            },
            {
              text: 'Celebrate discoveries',
              effects: { morale: 0.15 },
              outcomes: ['Celebrate recent mineral finds and mining successes']
            }
          ]
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
          id: 'combat_training',
          name: 'Combat Training',
          description: 'Participate in military combat training exercises',
          type: 'military',
          category: 'training',
          requirements: { strength: 12, dexterity: 12 },
          effects: { combatSkill: 0.15, physicalFitness: 0.1 },
          branches: [
            {
              text: 'Practice sword techniques',
              effects: { weaponProficiency: 0.2 },
              outcomes: ['Improve sword fighting skills and defensive techniques']
            },
            {
              text: 'Train in formation combat',
              effects: { unitCoordination: 0.15 },
              outcomes: ['Learn to fight effectively as part of a military unit']
            }
          ]
        },
        {
          id: 'morning_drill',
          name: 'Morning Drill',
          description: 'Participate in daily military discipline and fitness training',
          type: 'military',
          category: 'discipline',
          requirements: { constitution: 13 },
          effects: { discipline: 0.1, physicalFitness: 0.05 },
          branches: [
            {
              text: 'Marching drills',
              effects: { endurance: 0.1 },
              outcomes: ['Build stamina through disciplined marching exercises']
            },
            {
              text: 'Discipline exercises',
              effects: { mentalResilience: 0.1 },
              outcomes: ['Strengthen mental discipline and unit cohesion']
            }
          ]
        },
        {
          id: 'unit_bonding',
          name: 'Unit Bonding',
          description: 'Strengthen relationships within military units',
          type: 'social',
          category: 'camaraderie',
          requirements: {},
          effects: { unitMorale: 0.1, loyalty: 0.05 },
          branches: [
            {
              text: 'Share battle stories',
              effects: { inspiration: 0.1 },
              outcomes: ['Learn from experienced soldiers\' combat experiences']
            },
            {
              text: 'Practice team exercises',
              effects: { teamwork: 0.15 },
              outcomes: ['Build trust and coordination through group activities']
            }
          ]
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