// src/application/services/DemoService.js

/**
 * DemoService - Provides pre-built demo worlds for quick exploration
 * 
 * Creates sample worlds with characters, nodes, and interactions
 * to showcase the engine's capabilities without requiring setup
 */
class DemoService {
  /**
   * Get available demo worlds
   * @returns {Array} Array of demo world configurations
   */
  static getDemoWorlds() {
    return [
      {
        id: 'fantasy_village_demo',
        name: 'Medieval Fantasy Village',
        description: 'A small medieval village with merchants, guards, and mysterious visitors',
        category: 'fantasy',
        estimatedTime: '5-10 minutes',
        features: ['NPCs with personalities', 'Trading system', 'Quest interactions', 'Emergent stories']
      },
      {
        id: 'space_colony_demo',
        name: 'Mars Colony Outpost',
        description: 'A struggling space colony dealing with resource shortages and alien contact',
        category: 'sci-fi',
        estimatedTime: '10-15 minutes',
        features: ['Resource management', 'Scientific discoveries', 'Diplomatic encounters', 'Survival scenarios']
      },
      {
        id: 'pirate_port_demo',
        name: 'Caribbean Pirate Port',
        description: 'A lawless pirate haven filled with treasure hunters and sea adventures',
        category: 'historical',
        estimatedTime: '8-12 minutes',
        features: ['Swashbuckling adventures', 'Treasure hunting', 'Naval conflicts', 'Tavern encounters']
      }
    ];
  }

  /**
   * Generate a complete demo world configuration
   * @param {string} demoId - ID of the demo world to generate
   * @returns {Object} Complete world configuration ready for simulation
   */
  static generateDemoWorld(demoId) {
    switch (demoId) {
      case 'fantasy_village_demo':
        return this._generateFantasyVillage();
      case 'space_colony_demo':
        return this._generateSpaceColony();
      case 'pirate_port_demo':
        return this._generatePiratePort();
      default:
        throw new Error(`Unknown demo world: ${demoId}`);
    }
  }

  /**
   * Generate Medieval Fantasy Village demo
   * @private
   */
  static _generateFantasyVillage() {
    return {
      // World Foundation
      name: 'Greenwood Village',
      description: 'A peaceful village nestled between ancient forests and rolling hills, where merchants trade stories as readily as gold.',
      rules: {
        timeProgression: {
          name: 'Accelerated',
          description: 'Time moves quickly for demonstration',
          turnsPerDay: 8,
          realTimeMultiplier: 4
        },
        magicLevel: 'low',
        technologyLevel: 'medieval',
        socialComplexity: 'moderate'
      },
      initialConditions: {
        startingYear: 1247,
        season: 'spring',
        economicState: 'prosperous',
        politicalStability: 'stable'
      },

      // Nodes (Locations)
      nodes: [
        {
          id: 'village_center',
          name: 'Village Square',
          description: 'The heart of Greenwood Village, where cobblestone paths converge around an ancient oak tree',
          type: 'settlement',
          size: 150,
          environment: {
            terrain: 'plains',
            climate: 'temperate',
            lighting: 'bright',
            season: 'spring'
          },
          population: { total: 45, adults: 30, children: 15 },
          resources: {
            food: 0.8,
            water: 0.9,
            shelter: 0.7,
            goods: 0.6
          },
          connections: ['merchant_quarter', 'forest_edge']
        },
        {
          id: 'merchant_quarter',
          name: 'Merchant Quarter',
          description: 'A bustling area of shops and stalls where traders hawk their wares',
          type: 'settlement',
          size: 100,
          environment: {
            terrain: 'plains',
            climate: 'temperate',
            lighting: 'bright'
          },
          population: { total: 25, adults: 20, children: 5 },
          resources: {
            food: 0.6,
            water: 0.8,
            shelter: 0.8,
            goods: 0.9
          },
          connections: ['village_center']
        },
        {
          id: 'forest_edge',
          name: 'Forest Edge',
          description: 'Where civilization meets the wild - ancient trees tower over a well-worn path',
          type: 'wilderness',
          size: 200,
          environment: {
            terrain: 'forest',
            climate: 'temperate',
            lighting: 'dim'
          },
          population: { total: 5, adults: 4, children: 1 },
          resources: {
            food: 0.9,
            water: 0.8,
            shelter: 0.3,
            goods: 0.2
          },
          connections: ['village_center']
        }
      ],

      // Characters
      characters: [
        {
          id: 'elder_marcus',
          name: 'Elder Marcus',
          age: 67,
          race: 'human',
          class: 'sage',
          attributes: {
            strength: { score: 12, modifier: 1 },
            dexterity: { score: 10, modifier: 0 },
            constitution: { score: 14, modifier: 2 },
            intelligence: { score: 16, modifier: 3 },
            wisdom: { score: 18, modifier: 4 },
            charisma: { score: 15, modifier: 2 }
          },
          personality: {
            traits: ['wise', 'patient', 'protective'],
            motivations: ['village safety', 'knowledge preservation'],
            fears: ['change', 'violence']
          },
          assignments: {
            nodes: new Set(['village_center']),
            interactions: new Set(['wise_counsel', 'village_lore'])
          },
          background: 'The village elder who has guided Greenwood for over three decades'
        },
        {
          id: 'trader_lynn',
          name: 'Lynn the Trader',
          age: 34,
          race: 'human',
          class: 'merchant',
          attributes: {
            strength: { score: 11, modifier: 0 },
            dexterity: { score: 14, modifier: 2 },
            constitution: { score: 13, modifier: 1 },
            intelligence: { score: 15, modifier: 2 },
            wisdom: { score: 12, modifier: 1 },
            charisma: { score: 16, modifier: 3 }
          },
          personality: {
            traits: ['shrewd', 'friendly', 'ambitious'],
            motivations: ['profit', 'reputation', 'adventure'],
            fears: ['bankruptcy', 'isolation']
          },
          assignments: {
            nodes: new Set(['merchant_quarter']),
            interactions: new Set(['trade_goods', 'travel_stories'])
          },
          background: 'A traveling merchant who has made Greenwood her semi-permanent base'
        },
        {
          id: 'guard_captain_thor',
          name: 'Captain Thor',
          age: 42,
          race: 'dwarf',
          class: 'fighter',
          attributes: {
            strength: { score: 17, modifier: 3 },
            dexterity: { score: 12, modifier: 1 },
            constitution: { score: 16, modifier: 3 },
            intelligence: { score: 11, modifier: 0 },
            wisdom: { score: 14, modifier: 2 },
            charisma: { score: 13, modifier: 1 }
          },
          personality: {
            traits: ['loyal', 'stern', 'protective'],
            motivations: ['duty', 'honor', 'village defense'],
            fears: ['failure', 'cowardice']
          },
          assignments: {
            nodes: new Set(['village_center', 'forest_edge']),
            interactions: new Set(['security_briefing', 'patrol_report'])
          },
          background: 'The stalwart defender of Greenwood, respected by all who know him'
        },
        {
          id: 'forest_hermit',
          name: 'Old Willow',
          age: 156,
          race: 'elf',
          class: 'druid',
          attributes: {
            strength: { score: 10, modifier: 0 },
            dexterity: { score: 15, modifier: 2 },
            constitution: { score: 14, modifier: 2 },
            intelligence: { score: 13, modifier: 1 },
            wisdom: { score: 19, modifier: 4 },
            charisma: { score: 12, modifier: 1 }
          },
          personality: {
            traits: ['mysterious', 'wise', 'reclusive'],
            motivations: ['nature protection', 'ancient knowledge'],
            fears: ['deforestation', 'forgetting']
          },
          assignments: {
            nodes: new Set(['forest_edge']),
            interactions: new Set(['nature_wisdom', 'forest_secrets'])
          },
          background: 'An ancient elf who has watched over these forests for centuries'
        }
      ],

      // Interactions
      interactions: [
        {
          id: 'wise_counsel',
          name: 'Seek Counsel',
          description: 'Ask Elder Marcus for advice on village matters',
          category: 'social',
          assignedCharacterIds: ['elder_marcus'],
          branches: [
            {
              text: 'Tell me about the village history',
              effects: [{ type: 'knowledge', gain: 'village_lore' }],
              outcomes: ['Elder Marcus shares tales of Greenwood\'s founding and the great oak\'s significance']
            },
            {
              text: 'What dangers should we be aware of?',
              prerequisites: [{ type: 'relationship', character: 'elder_marcus', minimum: 0.3 }],
              effects: [{ type: 'knowledge', gain: 'local_threats' }],
              outcomes: ['The elder warns of bandits on the trade roads and strange lights in the deep forest']
            }
          ]
        },
        {
          id: 'trade_goods',
          name: 'Browse Wares',
          description: 'Examine Lynn\'s collection of goods from distant lands',
          category: 'trade',
          assignedCharacterIds: ['trader_lynn'],
          branches: [
            {
              text: 'What exotic goods do you have?',
              effects: [{ type: 'catalog', show: 'exotic_items' }],
              outcomes: ['Lynn shows you spices from the eastern kingdoms and strange artifacts from her travels']
            },
            {
              text: 'Tell me about your travels',
              effects: [{ type: 'knowledge', gain: 'world_lore' }],
              outcomes: ['Lynn regales you with tales of distant cities and the peoples she has met']
            }
          ]
        },
        {
          id: 'nature_wisdom',
          name: 'Forest Communion',
          description: 'Speak with Old Willow about the secrets of nature',
          category: 'mystical',
          assignedCharacterIds: ['forest_hermit'],
          branches: [
            {
              text: 'What do the trees whisper?',
              prerequisites: [{ type: 'attribute', attribute: 'wisdom', minimum: 12 }],
              effects: [{ type: 'revelation', gain: 'forest_prophecy' }],
              outcomes: ['Old Willow\'s eyes glimmer as she speaks of an ancient prophecy hidden in the rustling leaves']
            },
            {
              text: 'Teach me about forest herbs',
              effects: [{ type: 'skill', gain: 'herbalism' }],
              outcomes: ['The old elf shows you which mushrooms heal and which berries sustain']
            }
          ]
        },
        {
          id: 'patrol_report',
          name: 'Security Status',
          description: 'Get updates on village security from Captain Thor',
          category: 'official',
          assignedCharacterIds: ['guard_captain_thor'],
          branches: [
            {
              text: 'How secure are our borders?',
              effects: [{ type: 'status', check: 'village_safety' }],
              outcomes: ['Thor reports all is well, though he mentions increased wolf activity near the forest']
            },
            {
              text: 'Could you use assistance with patrols?',
              prerequisites: [{ type: 'attribute', attribute: 'strength', minimum: 13 }],
              effects: [{ type: 'assignment', gain: 'patrol_duty' }],
              outcomes: ['The captain nods approvingly and offers to train you in proper patrol techniques']
            }
          ]
        }
      ],

      // Simulation readiness
      isComplete: true,
      isValid: true,
      simulationReadiness: {
        worldFoundationDefined: true,
        locationsDefined: true,
        capabilitiesDefined: true,
        actorsDefined: true,
        actorsAssigned: true,
        readyForSimulation: true
      }
    };
  }

  /**
   * Generate Space Colony demo (simplified for now)
   * @private
   */
  static _generateSpaceColony() {
    return {
      name: 'New Mars Settlement',
      description: 'A struggling colony on the red planet facing resource challenges and mysterious signals',
      rules: {
        timeProgression: {
          name: 'Accelerated',
          description: 'Time moves quickly for demonstration',
          turnsPerDay: 6,
          realTimeMultiplier: 3
        }
      },
      initialConditions: {
        startingYear: 2157,
        season: 'martian_summer',
        economicState: 'struggling',
        politicalStability: 'tense'
      },
      nodes: [],
      characters: [],
      interactions: [],
      isComplete: true,
      isValid: true,
      simulationReadiness: {
        worldFoundationDefined: true,
        locationsDefined: true,
        capabilitiesDefined: true,
        actorsDefined: true,
        actorsAssigned: true,
        readyForSimulation: true
      }
    };
  }

  /**
   * Generate Pirate Port demo (simplified for now)
   * @private
   */
  static _generatePiratePort() {
    return {
      name: 'Port Royal Haven',
      description: 'A notorious pirate stronghold where treasure and treachery flow like rum',
      rules: {
        timeProgression: {
          name: 'Accelerated',
          description: 'Time moves quickly for demonstration',
          turnsPerDay: 10,
          realTimeMultiplier: 5
        }
      },
      initialConditions: {
        startingYear: 1715,
        season: 'caribbean_dry',
        economicState: 'booming',
        politicalStability: 'chaotic'
      },
      nodes: [],
      characters: [],
      interactions: [],
      isComplete: true,
      isValid: true,
      simulationReadiness: {
        worldFoundationDefined: true,
        locationsDefined: true,
        capabilitiesDefined: true,
        actorsDefined: true,
        actorsAssigned: true,
        readyForSimulation: true
      }
    };
  }
}

export default DemoService;