/**
 * Oakwood Federation Configuration
 * Valley of Echoes Demo - Oakwood Federation Settlement
 *
 * A prosperous farming and trading village in the Oakwood Valley.
 * Known for its fertile lands, skilled artisans, and diplomatic relations.
 * Features multi-node architecture with administrative, economic, and residential districts.
 */

const oakwoodFederationConfig = {
  // Settlement metadata
  id: 'oakwood-federation',
  name: 'Oakwood Federation',
  type: 'federation',
  description: 'A prosperous farming and trading federation in the Oakwood Valley, known for its fertile lands and skilled artisans.',

  // Governance structure
  governance: {
    type: 'democratic_federation',
    leaderTitle: 'Federation Council Chair',
    councilMembers: 7,
    decisionMaking: 'consensus_based',
    successionRules: 'elected_term_limit'
  },

  // Multi-node architecture
  nodes: [
    {
      id: 'oakwood-administrative-center',
      name: 'Administrative Center',
      type: 'administrative',
      description: 'The heart of Oakwood governance and diplomacy',
      environmentalProperties: {
        terrain: 'forest',
        climate: 'temperate',
        lighting: 'natural',
        season: 'spring',
        timeOfDay: 'day'
      },
      culturalContext: {
        language: 'common',
        traditions: ['council_meetings', 'federation_day', 'harvest_festival'],
        socialStructure: 'egalitarian'
      },
      capacity: {
        maxCharacters: 25,
        currentCharacters: 0
      }
    },
    {
      id: 'oakwood-market-district',
      name: 'Market District',
      type: 'economic',
      description: 'Bustling trade center with artisans and merchants',
      environmentalProperties: {
        terrain: 'forest',
        climate: 'temperate',
        lighting: 'natural',
        season: 'spring',
        timeOfDay: 'day'
      },
      culturalContext: {
        language: 'common',
        traditions: ['market_day', 'craftsman_guild', 'merchant_council'],
        socialStructure: 'meritocratic'
      },
      capacity: {
        maxCharacters: 40,
        currentCharacters: 0
      }
    },
    {
      id: 'oakwood-farming-valley',
      name: 'Farming Valley',
      type: 'agricultural',
      description: 'Fertile farmlands producing abundant crops',
      environmentalProperties: {
        terrain: 'forest',
        climate: 'temperate',
        lighting: 'natural',
        season: 'spring',
        timeOfDay: 'day'
      },
      culturalContext: {
        language: 'common',
        traditions: ['planting_rites', 'harvest_celebration', 'farmer_guild'],
        socialStructure: 'communal'
      },
      capacity: {
        maxCharacters: 60,
        currentCharacters: 0
      },
      contentInteractions: [
        {
          id: 'farm_work',
          name: 'Work the Fields',
          description: 'Tend to crops and maintain the farmlands',
          type: 'labor',
          category: 'agricultural',
          requirements: {
            energy: 30,
            strength: 10
          },
          effects: {
            experience: 5,
            wealth: 8,
            satisfaction: 10
          },
          branches: [
            {
              id: 'farm_success',
              name: 'Work Successfully',
              conditions: [],
              effects: [
                { type: 'skill', skill: 'farming', value: 2 },
                { type: 'resource', resource: 'food', value: 5 },
                { type: 'wealth', value: 8 }
              ]
            }
          ],
          context: {
            duration: 4,
            location: 'fields'
          }
        }
      ]
    },
    {
      id: 'oakwood-residential-quarter',
      name: 'Residential Quarter',
      type: 'residential',
      description: 'Homes and community spaces for Oakwood residents',
      environmentalProperties: {
        terrain: 'forest',
        climate: 'temperate',
        lighting: 'natural',
        season: 'spring',
        timeOfDay: 'day'
      },
      culturalContext: {
        language: 'common',
        traditions: ['community_gatherings', 'family_rites', 'neighbor_help'],
        socialStructure: 'familial'
      },
      capacity: {
        maxCharacters: 35,
        currentCharacters: 0
      }
    }
  ],

  // Initial population groups (LOD background tier)
  populationGroups: [
    {
      id: 'oakwood-farmers',
      name: 'Oakwood Farmers',
      size: 45,
      demographics: {
        ageGroup: 'adult',
        occupation: 'farmer',
        economicClass: 'working'
      },
      statistics: {
        averageWealth: 120,
        morale: 0.85,
        productivity: 0.9,
        loyalty: 0.9
      },
      assignments: {
        nodes: new Set(['oakwood-farming-valley']),
        interactions: new Set([])
      }
    },
    {
      id: 'oakwood-artisans',
      name: 'Oakwood Artisans',
      size: 28,
      demographics: {
        ageGroup: 'adult',
        occupation: 'artisan',
        economicClass: 'middle'
      },
      statistics: {
        averageWealth: 180,
        morale: 0.8,
        productivity: 0.95,
        loyalty: 0.85
      },
      assignments: {
        nodes: new Set(['oakwood-market-district']),
        interactions: new Set([])
      }
    },
    {
      id: 'oakwood-merchants',
      name: 'Oakwood Merchants',
      size: 15,
      demographics: {
        ageGroup: 'adult',
        occupation: 'merchant',
        economicClass: 'upper_middle'
      },
      statistics: {
        averageWealth: 250,
        morale: 0.75,
        productivity: 0.85,
        loyalty: 0.8
      },
      assignments: {
        nodes: new Set(['oakwood-market-district']),
        interactions: new Set([])
      }
    },
    {
      id: 'oakwood-administrators',
      name: 'Federation Administrators',
      size: 12,
      demographics: {
        ageGroup: 'adult',
        occupation: 'administrator',
        economicClass: 'middle'
      },
      statistics: {
        averageWealth: 160,
        morale: 0.9,
        productivity: 0.8,
        loyalty: 0.95
      },
      assignments: {
        nodes: new Set(['oakwood-administrative-center']),
        interactions: new Set([])
      }
    }
  ],

  // Initial hero-tier characters
  heroCharacters: [
    {
      id: 'council-chair-elara',
      name: 'Elara Voss',
      role: 'Federation Council Chair',
      personality: {
        traits: ['diplomatic', 'wise', 'fair'],
        background: 'former_merchant_turned_politician'
      },
      attributes: {
        strength: { score: 12, modifier: +1 },
        dexterity: { score: 14, modifier: +2 },
        constitution: { score: 13, modifier: +1 },
        intelligence: { score: 16, modifier: +3 },
        wisdom: { score: 17, modifier: +3 },
        charisma: { score: 18, modifier: +4 }
      },
      consciousness: {
        frequency: 0.8,
        coherence: 0.85
      },
      assignments: {
        nodes: new Set(['oakwood-administrative-center']),
        interactions: new Set([])
      },
      relationships: ['merchant-guild-leader', 'head-farmer']
    },
    {
      id: 'merchant-guild-leader',
      name: 'Marcus Hale',
      role: 'Merchant Guild Leader',
      personality: {
        traits: ['ambitious', 'charismatic', 'business_savvy'],
        background: 'successful_trader'
      },
      attributes: {
        strength: { score: 14, modifier: +2 },
        dexterity: { score: 15, modifier: +2 },
        constitution: { score: 14, modifier: +2 },
        intelligence: { score: 15, modifier: +2 },
        wisdom: { score: 13, modifier: +1 },
        charisma: { score: 17, modifier: +3 }
      },
      consciousness: {
        frequency: 0.75,
        coherence: 0.8
      },
      assignments: {
        nodes: new Set(['oakwood-market-district']),
        interactions: new Set([])
      },
      relationships: ['council-chair-elara', 'master-artisan']
    },
    {
      id: 'head-farmer',
      name: 'Gwenith Stone',
      role: 'Head Farmer',
      personality: {
        traits: ['practical', 'hardworking', 'community_oriented'],
        background: 'lifelong_farmer'
      },
      attributes: {
        strength: { score: 16, modifier: +3 },
        dexterity: { score: 13, modifier: +1 },
        constitution: { score: 17, modifier: +3 },
        intelligence: { score: 12, modifier: +1 },
        wisdom: { score: 15, modifier: +2 },
        charisma: { score: 14, modifier: +2 }
      },
      consciousness: {
        frequency: 0.7,
        coherence: 0.9
      },
      assignments: {
        nodes: new Set(['oakwood-farming-valley']),
        interactions: new Set([])
      },
      relationships: ['council-chair-elara', 'master-artisan']
    },
    {
      id: 'master-artisan',
      name: 'Thaddeus Iron',
      role: 'Master Artisan',
      personality: {
        traits: ['creative', 'perfectionist', 'teacher'],
        background: 'master_craftsman'
      },
      attributes: {
        strength: { score: 15, modifier: +2 },
        dexterity: { score: 17, modifier: +3 },
        constitution: { score: 14, modifier: +2 },
        intelligence: { score: 14, modifier: +2 },
        wisdom: { score: 13, modifier: +1 },
        charisma: { score: 15, modifier: +2 }
      },
      consciousness: {
        frequency: 0.75,
        coherence: 0.8
      },
      assignments: {
        nodes: new Set(['oakwood-market-district']),
        interactions: new Set([])
      },
      relationships: ['merchant-guild-leader', 'head-farmer']
    }
  ],

  // Initial need satisfaction state
  needSatisfaction: {
    current: {
      overall: 0.82,
      needs: {
        food: 0.9,
        water: 0.95,
        shelter: 0.85,
        security: 0.8,
        goods: 0.75,
        services: 0.8
      }
    },
    activeConsequences: []
  },

  // Development tree progress
  development: {
    currentLevel: 2,
    experience: 450,
    availableUpgrades: [
      {
        id: 'expand-market',
        name: 'Expand Market District',
        cost: 200,
        requirements: ['economic_focus'],
        effects: {
          economicCapacity: 1.3,
          goodsProduction: 1.2
        }
      },
      {
        id: 'improve-farms',
        name: 'Improve Farming Techniques',
        cost: 150,
        requirements: ['agricultural_focus'],
        effects: {
          foodProduction: 1.4,
          populationMorale: 1.1
        }
      }
    ]
  },

  // Cross-settlement relationships
  relationships: {
    'ironhold-dominion': {
      type: 'trade_partner',
      strength: 0.7,
      tradeVolume: 25,
      diplomaticStatus: 'cordial',
      sharedInterests: ['economic_growth', 'regional_stability']
    }
  },

  // Economic state
  economy: {
    wealth: 1200,
    income: 180,
    expenses: 120,
    tradeBalance: 35,
    primaryExports: ['grain', 'crafts', 'tools'],
    primaryImports: ['metal', 'luxury_goods']
  }
};

module.exports = oakwoodFederationConfig;