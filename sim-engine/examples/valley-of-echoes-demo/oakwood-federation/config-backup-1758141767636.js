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
        climate: 'temperate',
        season: 'spring',
        resources: ['administrative', 'diplomatic'],
        terrain: 'urban'
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
        climate: 'temperate',
        season: 'spring',
        resources: ['goods', 'food', 'crafts'],
        terrain: 'urban'
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
        climate: 'temperate',
        season: 'spring',
        resources: ['food', 'grain', 'livestock'],
        terrain: 'rural'
      },
      culturalContext: {
        language: 'common',
        traditions: ['planting_rites', 'harvest_celebration', 'farmer_guild'],
        socialStructure: 'communal'
      },
      capacity: {
        maxCharacters: 60,
        currentCharacters: 0
      }
    },
    {
      id: 'oakwood-residential-quarter',
      name: 'Residential Quarter',
      type: 'residential',
      description: 'Homes and community spaces for Oakwood residents',
      environmentalProperties: {
        climate: 'temperate',
        season: 'spring',
        resources: ['housing', 'community'],
        terrain: 'urban'
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
      assignedNode: 'oakwood-farming-valley'
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
      assignedNode: 'oakwood-market-district'
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
      assignedNode: 'oakwood-market-district'
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
      assignedNode: 'oakwood-administrative-center'
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
        strength: 12,
        dexterity: 14,
        constitution: 13,
        intelligence: 16,
        wisdom: 17,
        charisma: 18
      },
      consciousness: {
        frequency: 0.8,
        coherence: 0.85
      },
      assignedNode: 'oakwood-administrative-center',
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
        strength: 14,
        dexterity: 15,
        constitution: 14,
        intelligence: 15,
        wisdom: 13,
        charisma: 17
      },
      consciousness: {
        frequency: 0.75,
        coherence: 0.8
      },
      assignedNode: 'oakwood-market-district',
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
        strength: 16,
        dexterity: 13,
        constitution: 17,
        intelligence: 12,
        wisdom: 15,
        charisma: 14
      },
      consciousness: {
        frequency: 0.7,
        coherence: 0.9
      },
      assignedNode: 'oakwood-farming-valley',
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
        strength: 15,
        dexterity: 17,
        constitution: 14,
        intelligence: 14,
        wisdom: 13,
        charisma: 15
      },
      consciousness: {
        frequency: 0.75,
        coherence: 0.8
      },
      assignedNode: 'oakwood-market-district',
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