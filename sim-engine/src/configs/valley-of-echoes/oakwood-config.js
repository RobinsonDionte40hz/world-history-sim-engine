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
      },
      contentInteractions: [
        {
          id: 'council_meeting',
          name: 'Attend Council Meeting',
          description: 'Participate in federation governance discussions',
          type: 'social',
          category: 'governance',
          requirements: { citizenTier: 'LEADER' },
          effects: { reputation: 5, influence: 0.1 },
          branches: [
            {
              text: 'Discuss trade policies',
              effects: { knowledge: 'trade_policy' },
              outcomes: ['Learn about current trade agreements with neighboring settlements']
            },
            {
              text: 'Address community concerns',
              effects: { knowledge: 'community_issues' },
              outcomes: ['Hear about local problems and proposed solutions']
            }
          ]
        },
        {
          id: 'diplomatic_negotiations',
          name: 'Diplomatic Negotiations',
          description: 'Engage in diplomatic discussions with other settlements',
          type: 'social',
          category: 'diplomacy',
          requirements: { charisma: 14, citizenTier: 'LEADER' },
          effects: { diplomaticRelations: 0.1 },
          branches: [
            {
              text: 'Negotiate trade agreement',
              effects: { tradeAgreement: true },
              outcomes: ['Successfully establish new trade routes']
            },
            {
              text: 'Discuss mutual defense',
              effects: { allianceStrength: 0.2 },
              outcomes: ['Strengthen defensive alliances with neighboring settlements']
            }
          ]
        }
      ]
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
      },
      contentInteractions: [
        {
          id: 'guild_meeting',
          name: 'Attend Guild Meeting',
          description: 'Participate in merchant or artisan guild discussions',
          type: 'social',
          category: 'economic',
          requirements: { citizenTier: 'SPECIALIST' },
          effects: { guildStanding: 0.1, knowledge: 'market_trends' },
          branches: [
            {
              text: 'Discuss pricing strategies',
              effects: { knowledge: 'pricing_strategy' },
              outcomes: ['Learn about market pricing and negotiation tactics']
            },
            {
              text: 'Share business opportunities',
              effects: { businessContacts: 1 },
              outcomes: ['Gain new business contacts and opportunities']
            }
          ]
        },
        {
          id: 'craftsman_training',
          name: 'Apprentice Training',
          description: 'Learn or teach artisanal skills',
          type: 'educational',
          category: 'craft',
          requirements: { dexterity: 12 },
          effects: { skillImprovement: 0.1 },
          branches: [
            {
              text: 'Learn woodworking techniques',
              effects: { skill: 'woodworking', experience: 2 },
              outcomes: ['Improve woodworking skills through hands-on training']
            },
            {
              text: 'Study metalworking',
              effects: { skill: 'metalworking', experience: 2 },
              outcomes: ['Learn basic metalworking techniques and safety']
            }
          ]
        },
        {
          id: 'market_bargaining',
          name: 'Market Bargaining',
          description: 'Negotiate prices and trade goods',
          type: 'economic',
          category: 'trade',
          requirements: { charisma: 12 },
          effects: { wealth: 10 },
          branches: [
            {
              text: 'Buy goods at discount',
              effects: { wealth: -5, goods: 2 },
              outcomes: ['Successfully negotiate better prices for goods']
            },
            {
              text: 'Sell crafted items',
              effects: { wealth: 15, reputation: 2 },
              outcomes: ['Sell handmade goods and build merchant reputation']
            }
          ]
        }
      ]
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
          description: 'Participate in farming activities',
          type: 'labor',
          category: 'agricultural',
          requirements: { constitution: 12 },
          effects: { wealth: 8, experience: 1, food: 2 },
          branches: [
            {
              text: 'Plant spring crops',
              effects: { farmingSkill: 0.1, futureHarvest: 1.2 },
              outcomes: ['Help plant seasonal crops for better harvest yields']
            },
            {
              text: 'Tend to livestock',
              effects: { animalHusbandry: 0.1, food: 1 },
              outcomes: ['Care for farm animals and improve livestock health']
            }
          ]
        },
        {
          id: 'farmer_gathering',
          name: 'Community Gathering',
          description: 'Join farmers for communal discussions and celebrations',
          type: 'social',
          category: 'community',
          requirements: {},
          effects: { morale: 0.1, communityBonds: 0.05 },
          branches: [
            {
              text: 'Discuss farming techniques',
              effects: { knowledge: 'agricultural_methods' },
              outcomes: ['Learn new farming techniques from experienced farmers']
            },
            {
              text: 'Share harvest stories',
              effects: { inspiration: 0.1 },
              outcomes: ['Hear inspiring stories of successful harvests and challenges overcome']
            }
          ]
        },
        {
          id: 'harvest_celebration',
          name: 'Harvest Celebration',
          description: 'Participate in seasonal harvest festivals',
          type: 'cultural',
          category: 'tradition',
          requirements: { season: 'fall' },
          effects: { morale: 0.2, culturalUnderstanding: 0.1 },
          branches: [
            {
              text: 'Join the feast',
              effects: { food: 3, socialBonds: 0.1 },
              outcomes: ['Enjoy communal feast and strengthen community ties']
            },
            {
              text: 'Perform traditional dances',
              effects: { culturalSkill: 0.1, reputation: 3 },
              outcomes: ['Learn and perform traditional harvest dances']
            }
          ]
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
      },
      contentInteractions: [
        {
          id: 'family_meal',
          name: 'Family Meal',
          description: 'Share meals with family and neighbors',
          type: 'social',
          category: 'family',
          requirements: {},
          effects: { morale: 0.15, familyBonds: 0.1 },
          branches: [
            {
              text: 'Discuss family matters',
              effects: { emotionalSupport: 0.1 },
              outcomes: ['Strengthen family relationships through open conversation']
            },
            {
              text: 'Share local news',
              effects: { communityKnowledge: 0.1 },
              outcomes: ['Learn about recent events and community happenings']
            }
          ]
        },
        {
          id: 'neighbor_help',
          name: 'Help Neighbor',
          description: 'Assist neighbors with daily tasks and challenges',
          type: 'social',
          category: 'community',
          requirements: {},
          effects: { reputation: 2, communityStanding: 0.05 },
          branches: [
            {
              text: 'Help with repairs',
              effects: { constructionSkill: 0.1, neighborGratitude: 0.2 },
              outcomes: ['Assist with home repairs and earn neighbor appreciation']
            },
            {
              text: 'Share resources',
              effects: { generosity: 0.1, communityBonds: 0.1 },
              outcomes: ['Share food or tools with those in need']
            }
          ]
        },
        {
          id: 'community_storytelling',
          name: 'Storytelling Circle',
          description: 'Gather to share stories and oral traditions',
          type: 'cultural',
          category: 'tradition',
          requirements: { wisdom: 10 },
          effects: { culturalKnowledge: 0.1, inspiration: 0.1 },
          branches: [
            {
              text: 'Share personal stories',
              effects: { storytellingSkill: 0.1 },
              outcomes: ['Practice storytelling and share life experiences']
            },
            {
              text: 'Learn local legends',
              effects: { knowledge: 'local_legends' },
              outcomes: ['Learn traditional stories and cultural history']
            }
          ]
        }
      ]
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
        homeNodeId: 'oakwood-residential-quarter',
        workNodeId: 'oakwood-farming-valley',
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
        homeNodeId: 'oakwood-residential-quarter',
        workNodeId: 'oakwood-market-district',
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
        homeNodeId: 'oakwood-residential-quarter',
        workNodeId: 'oakwood-market-district',
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
        homeNodeId: 'oakwood-residential-quarter',
        workNodeId: 'oakwood-administrative-center',
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
        homeNodeId: 'oakwood-residential-quarter',
        workNodeId: 'oakwood-administrative-center',
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
        homeNodeId: 'oakwood-residential-quarter',
        workNodeId: 'oakwood-market-district',
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
        homeNodeId: 'oakwood-residential-quarter',
        workNodeId: 'oakwood-farming-valley',
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
        homeNodeId: 'oakwood-residential-quarter',
        workNodeId: 'oakwood-market-district',
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

export default oakwoodFederationConfig;