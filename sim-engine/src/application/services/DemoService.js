// src/application/services/DemoService.js

import Character from '../../domain/entities/Character.js';

// For now, we'll skip DataStructureUtils validation during testing
// const DataStructureUtils = require('../../shared/utils/DataStructureUtils.js');

// For now, we'll skip ContentInteraction creation to avoid ES6 import issues
// TODO: Refactor to use InteractionFactory once module system is consistent
// const ContentInteraction = require('../../domain/entities/interactions/ContentInteraction.js');

// Import BasicNeedsService for citizen tier assignments
// const BasicNeedsService = require('../../domain/services/BasicNeedsService.js');

// Import the new DirectInteractionAssignment utility for better demo interaction management
// Note: This is used within the _generateValleyOfEchoes method for role-based assignment

// Valley of Echoes demo dependencies - moved to top level for HMR compatibility
import oakwoodConfig from '../../data/demos/valley-of-echoes/oakwood-federation-config.js';
import ironholdConfig from '../../data/demos/valley-of-echoes/ironhold-dominion-config.js';
import DirectInteractionAssignment from './DirectInteractionAssignment.js';

// Static reference to economic profiles to avoid module import issues
const ECONOMIC_PROFILES = {
  LEADER: {
    productionCapacity: 0.1, // 10% of settlement production
    consumptionMultiplier: 2.0, // Consumes 2x basic needs
    wealthAccumulation: 0.3, // Accumulates wealth 30% faster
    economicInfluence: 0.8, // High influence on settlement economy
    investmentCapacity: 5.0 // Can make large investments
  },
  SPECIALIST: {
    productionCapacity: 0.4, // 40% of settlement production
    consumptionMultiplier: 1.3, // Consumes 1.3x basic needs
    wealthAccumulation: 0.15, // Accumulates wealth 15% faster
    economicInfluence: 0.4, // Moderate influence on settlement economy
    investmentCapacity: 2.0 // Can make moderate investments
  },
  CITIZEN: {
    productionCapacity: 0.5, // 50% of settlement production
    consumptionMultiplier: 1.0, // Consumes basic needs
    wealthAccumulation: 0.05, // Accumulates wealth 5% faster
    economicInfluence: 0.1, // Low influence on settlement economy
    investmentCapacity: 0.5 // Limited investment capacity
  }
};

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
      },
      {
        id: 'valley_of_echoes_demo',
        name: 'Valley of Echoes',
        description: 'Two interconnected settlements showcasing advanced LOD system and cross-settlement diplomacy',
        category: 'fantasy',
        estimatedTime: '15-20 minutes',
        features: ['100+ NPCs with LOD system', 'Multi-settlement diplomacy', 'Quest chains', 'Emergent politics'],
        status: 'planned'
      }
    ];
  }

  /**
   * Generate a complete demo world configuration
   * @param {string} demoId - ID of the demo world to generate
   * @returns {Object} Complete world configuration ready for simulation pipeline
   */
  static generateDemoWorld(demoId) {
    let rawWorldData;
    
    switch (demoId) {
      case 'fantasy_village_demo':
        rawWorldData = this._generateFantasyVillage();
        break;
      case 'space_colony_demo':
        rawWorldData = this._generateSpaceColony();
        break;
      case 'pirate_port_demo':
        rawWorldData = this._generatePiratePort();
        break;
      case 'valley_of_echoes_demo':
        rawWorldData = this._generateValleyOfEchoes();
        break;
      default:
        throw new Error(`Unknown demo world: ${demoId}`);
    }
    
    // Format for SimulationContext pipeline
    return this._formatForSimulationPipeline(rawWorldData, demoId);
  }

  /**
   * Generate raw demo world data for import as regular world
   * @param {string} demoId - ID of the demo world to generate
   * @returns {Object} Raw world configuration for import
   */
  static generateDemoWorldForImport(demoId) {
    switch (demoId) {
      case 'fantasy_village_demo':
        return this._generateFantasyVillage();
      case 'space_colony_demo':
        return this._generateSpaceColony();
      case 'pirate_port_demo':
        return this._generatePiratePort();
      case 'valley_of_echoes_demo':
        return this._generateValleyOfEchoes();
      default:
        throw new Error(`Unknown demo world: ${demoId}`);
    }
  }

  /**
   * Format demo world data for SimulationContext pipeline
   * @private
   * @param {Object} rawWorldData - Raw demo world configuration
   * @param {string} demoId - Demo identifier for metadata
   * @returns {Object} Pipeline-ready world data
   */
  static _formatForSimulationPipeline(rawWorldData, demoId) {
    // Convert arrays to Maps for pipeline compatibility
    const nodesMap = new Map();
    if (rawWorldData.nodes && Array.isArray(rawWorldData.nodes)) {
      rawWorldData.nodes.forEach(node => {
        // Ensure node has required properties
        const processedNode = {
          ...node,
          id: node.id || `node_${Date.now()}_${Math.random()}`,
          name: node.name || 'Unnamed Location',
          type: node.type || 'settlement',
          description: node.description || 'A location in the world'
        };
        nodesMap.set(processedNode.id, processedNode);
      });
    }
    
    const charactersMap = new Map();
    if (rawWorldData.characters && Array.isArray(rawWorldData.characters)) {
      rawWorldData.characters.forEach(character => {
        // Characters are already Character instances from _generateValleyOfEchoes
        // Just ensure they have the required properties for pipeline
        if (!character.id) {
          character.id = `char_${Date.now()}_${Math.random()}`;
        }
        if (!character.name) {
          character.name = 'Unnamed Character';
        }
        charactersMap.set(character.id, character);
      });
    }
    
    const interactionsMap = new Map();
    // Enable interaction creation with simplified approach
    if (rawWorldData.interactions && Array.isArray(rawWorldData.interactions)) {
      rawWorldData.interactions.forEach(interaction => {
        // Store interactions directly as plain objects for now
        // This avoids the ContentInteraction class dependency
        const processedInteraction = {
          id: interaction.id || `int_${Date.now()}_${Math.random()}`,
          name: interaction.name || 'Unnamed Interaction',
          type: interaction.type || 'content',
          description: interaction.description || '',
          category: interaction.category || 'general',
          requirements: interaction.requirements || {},
          branches: interaction.branches || [],
          effects: interaction.effects || [],
          context: interaction.context || {},
          assignedCharacterIds: interaction.assignedCharacterIds || [],
          // Preserve associatedNodeId for content interactions
          associatedNodeId: interaction.associatedNodeId
        };

        interactionsMap.set(processedInteraction.id, processedInteraction);
      });
    }
    
    const settlementsMap = new Map();
    if (rawWorldData.settlements && Array.isArray(rawWorldData.settlements)) {
      rawWorldData.settlements.forEach(settlement => {
        settlementsMap.set(settlement.id, settlement);
      });
    }

    // Ensure world properties exist
    const worldProperties = {
      name: rawWorldData.name || 'Demo World',
      description: rawWorldData.description || 'A demonstration world',
      rules: rawWorldData.rules || { timeProgression: 'turn-based' },
      initialConditions: rawWorldData.initialConditions || { startingYear: 1000 }
    };

    // Create pipeline-compatible world data structure
    const worldData = {
      worldProperties,
      nodes: nodesMap,
      characters: charactersMap,
      interactions: interactionsMap,
      settlements: settlementsMap,
      
      // Required simulation metadata for pipeline validation
      simulationMetadata: {
        source: 'DemoService',
        preparedAt: new Date().toISOString(),
        worldId: `demo_${demoId}_${Date.now()}`,
        demoId: demoId,
        isDemoWorld: true,
        version: '2.0.0'
      }
    };

    // Validate data structure consistency before returning
    // TODO: Re-enable when DataStructureUtils is available
    // const validation = DataStructureUtils.validateStructureConsistency(worldData);
    // if (!validation.isValid) {
    //   throw new Error(`DemoService created inconsistent data structure: ${validation.error}`);
    // }

    return worldData;
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
          currentNodeId: 'village_center',
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
          currentNodeId: 'merchant_quarter',
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
          currentNodeId: 'village_center',
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
          currentNodeId: 'forest_edge',
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
          canExecute: (character, worldState) => {
            // Could require charisma or currency, but keep accessible for demo
            return true;
          },
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
          canExecute: (character, worldState) => {
            // Could require wisdom score or specific class, but keep open for demo
            return true;
          },
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
          canExecute: (character, worldState) => {
            // Could require strength or reputation, but keep accessible
            return true;
          },
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
   * Generate Space Colony demo
   * @private
   */
  static _generateSpaceColony() {
    return {
      // World Foundation
      name: 'New Mars Settlement',
      description: 'A struggling colony on the red planet facing resource challenges, mysterious signals, and the harsh realities of extraterrestrial survival.',
      rules: {
        timeProgression: {
          name: 'Accelerated',
          description: 'Time moves quickly for demonstration',
          turnsPerDay: 6,
          realTimeMultiplier: 3
        },
        magicLevel: 'none',
        technologyLevel: 'advanced',
        socialComplexity: 'high'
      },
      initialConditions: {
        startingYear: 2157,
        season: 'martian_summer',
        economicState: 'struggling',
        politicalStability: 'tense'
      },

      // Nodes (Locations)
      nodes: [
        {
          id: 'colony_habitat',
          name: 'Central Habitat Dome',
          description: 'The main living quarters and administrative center of the colony',
          type: 'settlement',
          size: 120,
          environment: {
            terrain: 'artificial',
            climate: 'controlled',
            lighting: 'artificial',
            season: 'martian_summer'
          },
          population: { total: 35, adults: 28, children: 7 },
          resources: {
            food: 0.7,
            water: 0.8,
            shelter: 0.9,
            goods: 0.6
          },
          connections: ['research_lab', 'mining_outpost', 'communication_array']
        },
        {
          id: 'research_lab',
          name: 'Research Laboratory',
          description: 'Advanced scientific facility studying Martian geology and potential life forms',
          type: 'settlement',
          size: 80,
          environment: {
            terrain: 'artificial',
            climate: 'controlled',
            lighting: 'artificial'
          },
          population: { total: 12, adults: 12, children: 0 },
          resources: {
            food: 0.5,
            water: 0.6,
            shelter: 0.8,
            goods: 0.9
          },
          connections: ['colony_habitat']
        },
        {
          id: 'mining_outpost',
          name: 'Mining Outpost Alpha',
          description: 'Remote mining facility extracting valuable minerals from Martian soil',
          type: 'settlement',
          size: 60,
          environment: {
            terrain: 'martian_surface',
            climate: 'harsh',
            lighting: 'natural'
          },
          population: { total: 8, adults: 8, children: 0 },
          resources: {
            food: 0.4,
            water: 0.5,
            shelter: 0.7,
            goods: 0.95
          },
          connections: ['colony_habitat']
        },
        {
          id: 'communication_array',
          name: 'Communication Array',
          description: 'Satellite communication facility maintaining contact with Earth',
          type: 'settlement',
          size: 40,
          environment: {
            terrain: 'martian_surface',
            climate: 'harsh',
            lighting: 'natural'
          },
          population: { total: 4, adults: 4, children: 0 },
          resources: {
            food: 0.3,
            water: 0.4,
            shelter: 0.6,
            goods: 0.8
          },
          connections: ['colony_habitat']
        }
      ],

      // Characters
      characters: [
        {
          id: 'colony_administrator',
          name: 'Administrator Reyes',
          age: 48,
          race: 'human',
          class: 'administrator',
          attributes: {
            strength: { score: 12, modifier: 1 },
            dexterity: { score: 13, modifier: 1 },
            constitution: { score: 14, modifier: 2 },
            intelligence: { score: 16, modifier: 3 },
            wisdom: { score: 15, modifier: 2 },
            charisma: { score: 17, modifier: 3 }
          },
          personality: {
            traits: ['authoritative', 'pragmatic', 'protective'],
            motivations: ['colony survival', 'scientific progress', 'leadership'],
            fears: ['failure', 'isolation', 'resource depletion']
          },
          assignments: {
            nodes: new Set(['colony_habitat']),
            interactions: new Set(['colony_briefing', 'resource_allocation'])
          },
          currentNodeId: 'colony_habitat',
          background: 'Former UN administrator who volunteered for the Mars mission to lead humanity\'s first extraterrestrial colony'
        },
        {
          id: 'chief_scientist',
          name: 'Dr. Chen Wei',
          age: 42,
          race: 'human',
          class: 'scientist',
          attributes: {
            strength: { score: 10, modifier: 0 },
            dexterity: { score: 12, modifier: 1 },
            constitution: { score: 13, modifier: 1 },
            intelligence: { score: 18, modifier: 4 },
            wisdom: { score: 16, modifier: 3 },
            charisma: { score: 14, modifier: 2 }
          },
          personality: {
            traits: ['curious', 'methodical', 'optimistic'],
            motivations: ['discovery', 'knowledge', 'human advancement'],
            fears: ['unknown threats', 'experimental failure']
          },
          assignments: {
            nodes: new Set(['research_lab']),
            interactions: new Set(['scientific_discovery', 'mysterious_signal'])
          },
          currentNodeId: 'research_lab',
          background: 'Leading xenobiologist who specializes in extraterrestrial life forms and planetary geology'
        },
        {
          id: 'mining_foreman',
          name: 'Sergeant Kowalski',
          age: 35,
          race: 'human',
          class: 'miner',
          attributes: {
            strength: { score: 16, modifier: 3 },
            dexterity: { score: 14, modifier: 2 },
            constitution: { score: 15, modifier: 2 },
            intelligence: { score: 12, modifier: 1 },
            wisdom: { score: 13, modifier: 1 },
            charisma: { score: 11, modifier: 0 }
          },
          personality: {
            traits: ['tough', 'reliable', 'blunt'],
            motivations: ['survival', 'team safety', 'resource security'],
            fears: ['equipment failure', 'radiation exposure']
          },
          assignments: {
            nodes: new Set(['mining_outpost']),
            interactions: new Set(['mining_report', 'equipment_maintenance'])
          },
          currentNodeId: 'mining_outpost',
          background: 'Former military engineer who leads the mining operations and maintains colony infrastructure'
        },
        {
          id: 'communication_specialist',
          name: 'Lt. Rodriguez',
          age: 31,
          race: 'human',
          class: 'communications',
          attributes: {
            strength: { score: 11, modifier: 0 },
            dexterity: { score: 15, modifier: 2 },
            constitution: { score: 12, modifier: 1 },
            intelligence: { score: 17, modifier: 3 },
            wisdom: { score: 14, modifier: 2 },
            charisma: { score: 13, modifier: 1 }
          },
          personality: {
            traits: ['focused', 'analytical', 'cautious'],
            motivations: ['communication reliability', 'data security', 'mission success'],
            fears: ['signal loss', 'alien interference']
          },
          assignments: {
            nodes: new Set(['communication_array']),
            interactions: new Set(['signal_analysis', 'earth_contact'])
          },
          currentNodeId: 'communication_array',
          background: 'Communications specialist monitoring all signals to and from Earth, including mysterious anomalies'
        }
      ],

      // Interactions
      interactions: [
        {
          id: 'colony_briefing',
          name: 'Daily Colony Briefing',
          description: 'Attend the daily briefing to discuss colony status and priorities',
          category: 'administrative',
          assignedCharacterIds: ['colony_administrator'],
          branches: [
            {
              text: 'Discuss resource shortages',
              effects: [{ type: 'resource', focus: 'allocation' }],
              outcomes: ['Administrator Reyes outlines the current resource challenges and potential solutions']
            },
            {
              text: 'Address colony morale',
              effects: [{ type: 'morale', assessment: true }],
              outcomes: ['The administrator shares concerns about psychological strain from isolation']
            }
          ]
        },
        {
          id: 'scientific_discovery',
          name: 'Research Findings',
          description: 'Discuss recent scientific discoveries with Dr. Chen',
          category: 'scientific',
          assignedCharacterIds: ['chief_scientist'],
          branches: [
            {
              text: 'What have you found in the soil samples?',
              effects: [{ type: 'knowledge', gain: 'geological_data' }],
              outcomes: ['Dr. Chen explains the unusual mineral compositions and potential for valuable resources']
            },
            {
              text: 'Any signs of microbial life?',
              prerequisites: [{ type: 'attribute', attribute: 'intelligence', minimum: 14 }],
              effects: [{ type: 'discovery', discoveryType: 'potential_life' }],
              outcomes: ['The scientist shares preliminary evidence of possible microbial activity in subsurface samples']
            }
          ]
        },
        {
          id: 'mysterious_signal',
          name: 'Analyze Mysterious Signal',
          description: 'Investigate the strange signals detected by the communication array',
          category: 'mysterious',
          assignedCharacterIds: ['communication_specialist'],
          branches: [
            {
              text: 'What do we know about the signal?',
              effects: [{ type: 'analysis', signal: 'characteristics' }],
              outcomes: ['Lt. Rodriguez describes the signal\'s unusual frequency and non-random patterns']
            },
            {
              text: 'Could it be artificial?',
              prerequisites: [{ type: 'attribute', attribute: 'intelligence', minimum: 15 }],
              effects: [{ type: 'hypothesis', artificial_intelligence: true }],
              outcomes: ['The specialist presents evidence suggesting the signal may be artificially generated']
            }
          ]
        },
        {
          id: 'mining_report',
          name: 'Mining Operations Update',
          description: 'Get the latest report on mining activities and resource extraction',
          category: 'industrial',
          assignedCharacterIds: ['mining_foreman'],
          branches: [
            {
              text: 'How are mining operations progressing?',
              effects: [{ type: 'production', minerals: 'current_yield' }],
              outcomes: ['Sergeant Kowalski reports on current mineral extraction rates and equipment status']
            },
            {
              text: 'Any safety concerns?',
              effects: [{ type: 'safety', assessment: 'mining_risks' }],
              outcomes: ['The foreman discusses radiation levels and equipment reliability concerns']
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
   * Generate Pirate Port demo
   * @private
   */
  static _generatePiratePort() {
    return {
      // World Foundation
      name: 'Port Royal Haven',
      description: 'A notorious pirate stronghold where treasure and treachery flow like rum, and every shadow hides opportunity or danger.',
      rules: {
        timeProgression: {
          name: 'Accelerated',
          description: 'Time moves quickly for demonstration',
          turnsPerDay: 10,
          realTimeMultiplier: 5
        },
        magicLevel: 'low',
        technologyLevel: 'colonial',
        socialComplexity: 'moderate'
      },
      initialConditions: {
        startingYear: 1715,
        season: 'caribbean_dry',
        economicState: 'booming',
        politicalStability: 'chaotic'
      },

      // Nodes (Locations)
      nodes: [
        {
          id: 'port_district',
          name: 'Main Harbor District',
          description: 'The bustling heart of Port Royal where ships dock and merchants hawk their wares',
          type: 'settlement',
          size: 200,
          environment: {
            terrain: 'coastal',
            climate: 'tropical',
            lighting: 'bright',
            season: 'caribbean_dry'
          },
          population: { total: 85, adults: 70, children: 15 },
          resources: {
            food: 0.8,
            water: 0.9,
            shelter: 0.7,
            goods: 0.95
          },
          connections: ['tavern_row', 'merchant_quarter', 'fortress']
        },
        {
          id: 'tavern_row',
          name: 'Tavern Row',
          description: 'A row of seedy taverns and drinking establishments where information flows as freely as the rum',
          type: 'settlement',
          size: 120,
          environment: {
            terrain: 'coastal',
            climate: 'tropical',
            lighting: 'dim'
          },
          population: { total: 45, adults: 40, children: 5 },
          resources: {
            food: 0.9,
            water: 0.8,
            shelter: 0.6,
            goods: 0.7
          },
          connections: ['port_district']
        },
        {
          id: 'merchant_quarter',
          name: 'Merchant Quarter',
          description: 'Wealthy merchants and traders conduct business in this more respectable district',
          type: 'settlement',
          size: 100,
          environment: {
            terrain: 'coastal',
            climate: 'tropical',
            lighting: 'bright'
          },
          population: { total: 35, adults: 30, children: 5 },
          resources: {
            food: 0.7,
            water: 0.8,
            shelter: 0.8,
            goods: 0.9
          },
          connections: ['port_district']
        },
        {
          id: 'fortress',
          name: 'Fort Charles',
          description: 'The imposing fortress overlooking the harbor, seat of colonial authority',
          type: 'settlement',
          size: 80,
          environment: {
            terrain: 'coastal',
            climate: 'tropical',
            lighting: 'bright'
          },
          population: { total: 25, adults: 20, children: 5 },
          resources: {
            food: 0.6,
            water: 0.7,
            shelter: 0.9,
            goods: 0.5
          },
          connections: ['port_district']
        }
      ],

      // Characters
      characters: [
        {
          id: 'captain_blackbeard',
          name: 'Captain Blackbeard',
          age: 38,
          race: 'human',
          class: 'pirate_captain',
          attributes: {
            strength: { score: 16, modifier: 3 },
            dexterity: { score: 15, modifier: 2 },
            constitution: { score: 14, modifier: 2 },
            intelligence: { score: 13, modifier: 1 },
            wisdom: { score: 12, modifier: 1 },
            charisma: { score: 17, modifier: 3 }
          },
          personality: {
            traits: ['fierce', 'charismatic', 'ruthless'],
            motivations: ['treasure', 'reputation', 'freedom'],
            fears: ['capture', 'betrayal', 'losing_face']
          },
          assignments: {
            nodes: new Set(['tavern_row']),
            interactions: new Set(['pirate_council', 'treasure_hunt'])
          },
          currentNodeId: 'tavern_row',
          background: 'Legendary pirate captain whose fearsome reputation strikes terror into the hearts of merchant captains'
        },
        {
          id: 'governor_roberts',
          name: 'Governor Sir Edward Roberts',
          age: 55,
          race: 'human',
          class: 'colonial_governor',
          attributes: {
            strength: { score: 12, modifier: 1 },
            dexterity: { score: 11, modifier: 0 },
            constitution: { score: 13, modifier: 1 },
            intelligence: { score: 15, modifier: 2 },
            wisdom: { score: 16, modifier: 3 },
            charisma: { score: 14, modifier: 2 }
          },
          personality: {
            traits: ['authoritative', 'diplomatic', 'corrupt'],
            motivations: ['power', 'wealth', 'colonial_control'],
            fears: ['pirate uprising', 'royal displeasure']
          },
          assignments: {
            nodes: new Set(['fortress']),
            interactions: new Set(['colonial_audience', 'smuggling_deal'])
          },
          currentNodeId: 'fortress',
          background: 'Corrupt colonial governor who secretly profits from pirate activities while publicly condemning them'
        },
        {
          id: 'merchant_prince',
          name: 'Don Miguel Santiago',
          age: 42,
          race: 'human',
          class: 'merchant',
          attributes: {
            strength: { score: 11, modifier: 0 },
            dexterity: { score: 13, modifier: 1 },
            constitution: { score: 12, modifier: 1 },
            intelligence: { score: 16, modifier: 3 },
            wisdom: { score: 14, modifier: 2 },
            charisma: { score: 15, modifier: 2 }
          },
          personality: {
            traits: ['shrewd', 'ambitious', 'discreet'],
            motivations: ['profit', 'influence', 'family_legacy'],
            fears: ['pirate raids', 'business ruin']
          },
          assignments: {
            nodes: new Set(['merchant_quarter']),
            interactions: new Set(['trade_negotiation', 'information_network'])
          },
          currentNodeId: 'merchant_quarter',
          background: 'Wealthy Spanish merchant who maintains profitable relationships with both pirates and colonial authorities'
        },
        {
          id: 'tavern_owner',
          name: 'Madame Dubois',
          age: 48,
          race: 'human',
          class: 'innkeeper',
          attributes: {
            strength: { score: 13, modifier: 1 },
            dexterity: { score: 14, modifier: 2 },
            constitution: { score: 15, modifier: 2 },
            intelligence: { score: 12, modifier: 1 },
            wisdom: { score: 17, modifier: 3 },
            charisma: { score: 16, modifier: 3 }
          },
          personality: {
            traits: ['observant', 'resourceful', 'neutral'],
            motivations: ['survival', 'information', 'community'],
            fears: ['violence', 'economic_ruin']
          },
          assignments: {
            nodes: new Set(['tavern_row']),
            interactions: new Set(['rumor_mill', 'safe_haven'])
          },
          currentNodeId: 'tavern_row',
          background: 'Sharp-witted tavern owner who knows everyone\'s secrets and maintains neutrality in the port\'s conflicts'
        }
      ],

      // Interactions
      interactions: [
        {
          id: 'pirate_council',
          name: 'Pirate Council Meeting',
          description: 'Attend a secret meeting of pirate captains to discuss strategy and divide spoils',
          category: 'criminal',
          assignedCharacterIds: ['captain_blackbeard'],
          branches: [
            {
              text: 'Discuss the next target',
              effects: [{ type: 'strategy', target: 'merchant_ship' }],
              outcomes: ['Blackbeard outlines plans for intercepting a wealthy Spanish galleon']
            },
            {
              text: 'Address internal disputes',
              effects: [{ type: 'diplomacy', pirate_alliance: 'strengthened' }],
              outcomes: ['The captains agree to settle their differences and maintain the pirate code']
            }
          ]
        },
        {
          id: 'colonial_audience',
          name: 'Audience with the Governor',
          description: 'Request an audience with the colonial governor to discuss official matters',
          category: 'political',
          assignedCharacterIds: ['governor_roberts'],
          branches: [
            {
              text: 'Discuss pirate activity',
              effects: [{ type: 'intelligence', pirate_movements: 'shared' }],
              outcomes: ['The governor expresses concern about pirate raids while secretly profiting from them']
            },
            {
              text: 'Request trading privileges',
              prerequisites: [{ type: 'attribute', attribute: 'charisma', minimum: 14 }],
              effects: [{ type: 'trade', privileges: 'granted' }],
              outcomes: ['The governor grants favorable trading terms in exchange for certain considerations']
            }
          ]
        },
        {
          id: 'trade_negotiation',
          name: 'Trade Negotiations',
          description: 'Negotiate business deals with the wealthy merchant prince',
          category: 'economic',
          assignedCharacterIds: ['merchant_prince'],
          branches: [
            {
              text: 'Discuss import opportunities',
              effects: [{ type: 'trade', goods: 'exotic_spices' }],
              outcomes: ['Don Miguel offers to arrange importation of rare spices from the East Indies']
            },
            {
              text: 'Inquire about smuggling routes',
              prerequisites: [{ type: 'relationship', character: 'merchant_prince', minimum: 0.4 }],
              effects: [{ type: 'smuggling', routes: 'revealed' }],
              outcomes: ['The merchant discreetly shares information about hidden coves used for smuggling']
            }
          ]
        },
        {
          id: 'rumor_mill',
          name: 'Tavern Rumors',
          description: 'Listen to the latest gossip and rumors circulating in the tavern',
          category: 'social',
          assignedCharacterIds: ['tavern_owner'],
          branches: [
            {
              text: 'What\'s the latest news?',
              effects: [{ type: 'information', rumors: 'collected' }],
              outcomes: ['Madame Dubois shares whispers of a legendary treasure map and impending naval patrols']
            },
            {
              text: 'Any word on ship movements?',
              effects: [{ type: 'intelligence', ship_movements: 'current' }],
              outcomes: ['The tavern owner reports on recent ship arrivals and suspicious departures']
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
   * Generate Valley of Echoes demo (work in progress)
   * @private
   */
  static _generateValleyOfEchoes() {
    // Valley of Echoes demo components are now imported at the top level for HMR compatibility

    // Build Oakwood Federation settlement
    const oakwoodSettlement = {
      id: oakwoodConfig.id,
      name: oakwoodConfig.name,
      description: oakwoodConfig.description,
      type: oakwoodConfig.type,
      governance: oakwoodConfig.governance,
      nodes: oakwoodConfig.nodes.map(node => node.id),
      assignedCharacters: [
        ...oakwoodConfig.heroCharacters.map(char => char.id),
        ...oakwoodConfig.populationGroups.flatMap(group =>
          Array.from({ length: group.size }, (_, i) => `${group.id}-bg-${i}`)
        )
      ],
      needSatisfaction: oakwoodConfig.needSatisfaction,
      development: oakwoodConfig.development,
      economy: oakwoodConfig.economy
    };

    // Build Ironhold Dominion settlement
    const ironholdSettlement = {
      id: ironholdConfig.id,
      name: ironholdConfig.name,
      description: ironholdConfig.description,
      type: ironholdConfig.type,
      governance: ironholdConfig.governance,
      nodes: ironholdConfig.nodes.map(node => node.id),
      assignedCharacters: [
        ...ironholdConfig.heroCharacters.map(char => char.id),
        ...ironholdConfig.populationGroups.flatMap(group =>
          Array.from({ length: group.size }, (_, i) => `${group.id}-bg-${i}`)
        )
      ],
      needSatisfaction: ironholdConfig.needSatisfaction,
      development: ironholdConfig.development,
      economy: ironholdConfig.economy
    };

    // Create hero characters for Oakwood
    const oakwoodHeroCharacters = oakwoodConfig.heroCharacters.map(char => {
      const assignedNodeId = Array.from(char.assignments.nodes)[0]; // Get first node from Set
      const characterConfig = {
        id: char.id,
        name: char.name,
        lodTier: 'hero',
        characterType: { typeId: 'hero', category: 'npc' },
        attributes: char.attributes, // Will be converted to Attributes instance by Character constructor
        consciousness: char.consciousness,
        personality: char.personality,
        assignments: {
          nodes: new Set([assignedNodeId]),
          interactions: new Set(),
          settlements: new Set([oakwoodConfig.id])
        },
        currentNodeId: assignedNodeId,
        background: char.role || 'Hero character'
      };

      // Apply citizen tier
      const characterWithTier = this._assignCitizenTier(characterConfig, 'hero');
      
      // Create proper Character instance
      return new Character(characterWithTier);
    });

    // Create hero characters for Ironhold
    const ironholdHeroCharacters = ironholdConfig.heroCharacters.map(char => {
      const assignedNodeId = Array.from(char.assignments.nodes)[0]; // Get first node from Set
      const characterConfig = {
        id: char.id,
        name: char.name,
        lodTier: 'hero',
        characterType: { typeId: 'hero', category: 'npc' },
        attributes: char.attributes, // Will be converted to Attributes instance by Character constructor
        consciousness: char.consciousness,
        personality: char.personality,
        assignments: {
          nodes: new Set([assignedNodeId]),
          interactions: new Set(),
          settlements: new Set([ironholdConfig.id])
        },
        currentNodeId: assignedNodeId,
        background: char.role || 'Hero character'
      };

      // Apply citizen tier
      const characterWithTier = this._assignCitizenTier(characterConfig, 'hero');
      
      // Create proper Character instance
      return new Character(characterWithTier);
    });

    // Create group-level characters for Oakwood population groups
    const oakwoodGroupCharacters = oakwoodConfig.populationGroups.map(group => {
      const assignedNodeId = Array.from(group.assignments.nodes)[0]; // Get first node from Set
      const characterConfig = {
        id: group.id,
        name: group.name,
        lodTier: 'group',
        populationGroupId: group.id,
        characterType: { typeId: 'group', category: 'npc' },
        demographics: group.demographics,
        groupStatistics: group.statistics,
        assignments: {
          nodes: new Set([assignedNodeId]),
          interactions: new Set(),
          settlements: new Set([oakwoodConfig.id])
        },
        currentNodeId: assignedNodeId,
        background: `Population group representing ${group.size} ${group.name.toLowerCase()}`,
        // Add default attributes for group characters
        baseAttributes: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        }
      };

      // Apply citizen tier
      const characterWithTier = this._assignCitizenTier(characterConfig, 'group');
      
      // Create proper Character instance
      return new Character(characterWithTier);
    });

    // Create group-level characters for Ironhold population groups
    const ironholdGroupCharacters = ironholdConfig.populationGroups.map(group => {
      const assignedNodeId = Array.from(group.assignments.nodes)[0]; // Get first node from Set
      const characterConfig = {
        id: group.id,
        name: group.name,
        lodTier: 'group',
        populationGroupId: group.id,
        characterType: { typeId: 'group', category: 'npc' },
        demographics: group.demographics,
        groupStatistics: group.statistics,
        assignments: {
          nodes: new Set([assignedNodeId]),
          interactions: new Set(),
          settlements: new Set([ironholdConfig.id])
        },
        currentNodeId: assignedNodeId,
        background: `Population group representing ${group.size} ${group.name.toLowerCase()}`,
        // Add default attributes for group characters
        baseAttributes: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        }
      };

      // Apply citizen tier
      const characterWithTier = this._assignCitizenTier(characterConfig, 'group');
      
      // Create proper Character instance
      return new Character(characterWithTier);
    });

    // Create individual background characters for Oakwood
    const oakwoodBackgroundCharacters = [];
    oakwoodConfig.populationGroups.forEach(group => {
      const assignedNodeId = Array.from(group.assignments.nodes)[0]; // Get first node from Set
      for (let i = 0; i < group.size; i++) {
        const characterConfig = {
          id: `${group.id}-bg-${i}`,
          name: `${group.name} ${i + 1}`,
          lodTier: 'background',
          populationGroupId: group.id,
          characterType: { typeId: 'background', category: 'npc' },
          demographicData: {
            occupation: group.demographics.occupation,
            ageGroup: group.demographics.ageGroup,
            economicClass: group.demographics.economicClass
          },
          assignments: {
            nodes: new Set([assignedNodeId]),
            interactions: new Set(),
            settlements: new Set([oakwoodConfig.id])
          },
          currentNodeId: assignedNodeId,
          background: `${group.demographics.occupation} in ${group.name}`,
          // Add default attributes for background characters
          baseAttributes: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
          }
        };

        // Apply citizen tier
        const characterWithTier = this._assignCitizenTier(characterConfig, 'background');
        
        // Create proper Character instance
        oakwoodBackgroundCharacters.push(new Character(characterWithTier));
      }
    });

    // Create individual background characters for Ironhold
    const ironholdBackgroundCharacters = [];
    ironholdConfig.populationGroups.forEach(group => {
      const assignedNodeId = Array.from(group.assignments.nodes)[0]; // Get first node from Set
      for (let i = 0; i < group.size; i++) {
        const characterConfig = {
          id: `${group.id}-bg-${i}`,
          name: `${group.name} ${i + 1}`,
          lodTier: 'background',
          populationGroupId: group.id,
          characterType: { typeId: 'background', category: 'npc' },
          demographicData: {
            occupation: group.demographics.occupation,
            ageGroup: group.demographics.ageGroup,
            economicClass: group.demographics.economicClass
          },
          assignments: {
            nodes: new Set([assignedNodeId]),
            interactions: new Set(),
            settlements: new Set([ironholdConfig.id])
          },
          currentNodeId: assignedNodeId,
          background: `${group.demographics.occupation} in ${group.name}`,
          // Add default attributes for background characters
          baseAttributes: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
          }
        };

        // Apply citizen tier
        const characterWithTier = this._assignCitizenTier(characterConfig, 'background');
        
        // Create proper Character instance
        ironholdBackgroundCharacters.push(new Character(characterWithTier));
      }
    });

    // Extract content interactions from config files FIRST
    const configInteractions = [];
    [...oakwoodConfig.nodes, ...ironholdConfig.nodes].forEach(node => {
      if (node.contentInteractions && Array.isArray(node.contentInteractions)) {
        node.contentInteractions.forEach(interaction => {
          // Format interaction for simulation pipeline
          const formattedInteraction = {
            id: interaction.id,
            name: interaction.name,
            description: interaction.description || '',
            type: interaction.type || 'content',
            category: interaction.category || 'general',
            requirements: interaction.requirements || {},
            effects: interaction.effects || {},
            branches: interaction.branches || [],
            context: interaction.context || {},
            assignedCharacterIds: [], // Will be populated by assignment logic
            // Add node association for filtering
            associatedNodeId: node.id,
            tierRequirement: this._determineInteractionTier(interaction)
          };
          configInteractions.push(formattedInteraction);
        });
      }
    });

    // Initialize the new direct assignment system for better demo control
    const directAssigner = new DirectInteractionAssignment();
    directAssigner.initializeRoleBasedPools();

    // Assign interactions using the new role-based system (much simpler and more semantic)
    const oakwoodHeroCharactersWithInteractions = oakwoodHeroCharacters.map(char => {
      directAssigner.assignByRole(char, 4); // Heroes get 4 interactions
      char.assignments.interactions = new Set(directAssigner.getCharacterInteractions(char.id));
      return char;
    });
    const ironholdHeroCharactersWithInteractions = ironholdHeroCharacters.map(char => {
      directAssigner.assignByRole(char, 4); // Heroes get 4 interactions
      char.assignments.interactions = new Set(directAssigner.getCharacterInteractions(char.id));
      return char;
    });
    const oakwoodGroupCharactersWithInteractions = oakwoodGroupCharacters.map(char => {
      directAssigner.assignByRole(char, 3); // Group NPCs get 3 interactions
      char.assignments.interactions = new Set(directAssigner.getCharacterInteractions(char.id));
      return char;
    });
    const ironholdGroupCharactersWithInteractions = ironholdGroupCharacters.map(char => {
      directAssigner.assignByRole(char, 3); // Group NPCs get 3 interactions
      char.assignments.interactions = new Set(directAssigner.getCharacterInteractions(char.id));
      return char;
    });
    const oakwoodBackgroundCharactersWithInteractions = oakwoodBackgroundCharacters.map(char => {
      directAssigner.assignByRole(char, 2); // Background NPCs get 2 interactions
      char.assignments.interactions = new Set(directAssigner.getCharacterInteractions(char.id));
      return char;
    });
    const ironholdBackgroundCharactersWithInteractions = ironholdBackgroundCharacters.map(char => {
      directAssigner.assignByRole(char, 2); // Background NPCs get 2 interactions
      char.assignments.interactions = new Set(directAssigner.getCharacterInteractions(char.id));
      return char;
    });

    // Combine all Characters
    const allCharacters = [
      ...oakwoodHeroCharactersWithInteractions,
      ...ironholdHeroCharactersWithInteractions,
      ...oakwoodGroupCharactersWithInteractions,
      ...ironholdGroupCharactersWithInteractions,
      ...oakwoodBackgroundCharactersWithInteractions,
      ...ironholdBackgroundCharactersWithInteractions
    ];

    // Combine all nodes
    const allNodes = [
      ...oakwoodConfig.nodes,
      ...ironholdConfig.nodes
    ];

    // Get all interactions from the direct assignment system (includes role-based pools + universal)
    const allRoleInteractions = [];
    for (const role of ['administrator', 'merchant', 'farmer', 'artisan', 'universal']) {
      allRoleInteractions.push(...directAssigner.getInteractionsForRole(role));
    }

    // Create interaction objects in the format expected by the world
    const interactions = allRoleInteractions.map(interaction => ({
      id: interaction.id,
      name: interaction.name,
      description: interaction.description,
      type: interaction.type,
      category: interaction.category,
      requirements: interaction.requirements,
      effects: interaction.effects,
      tierRequirement: interaction.tierRequirement,
      branches: [{
        id: `${interaction.id}_success`,
        name: `${interaction.name} Successfully`,
        conditions: [],
        effects: Object.entries(interaction.effects).map(([type, value]) => ({ type, value }))
      }],
      assignedCharacterIds: [] // Will be populated by assignment logic
    }));

    return {
      // World Foundation
      name: 'Valley of Echoes',
      description: 'Two interconnected settlements showcasing advanced LOD system and cross-settlement diplomacy with 200+ background NPCs',
      rules: {
        timeProgression: {
          name: 'Accelerated',
          description: 'Time moves quickly for demonstration',
          turnsPerDay: 8,
          realTimeMultiplier: 4
        },
        magicLevel: 'moderate',
        technologyLevel: 'medieval',
        socialComplexity: 'high'
      },
      initialConditions: {
        startingYear: 1452,
        season: 'spring',
        economicState: 'prosperous',
        politicalStability: 'tense'
      },

      // All nodes from both settlements
      nodes: allNodes,

      // All characters with proper LOD distribution
      characters: allCharacters,

      // Basic interactions
      interactions: interactions,

      // Settlements
      settlements: [oakwoodSettlement, ironholdSettlement],

      // Simulation readiness
      isComplete: true,
      isValid: true,
      simulationReadiness: {
        worldFoundationDefined: true,
        locationsDefined: true,
        capabilitiesDefined: true,
        actorsDefined: true,
        actorsAssigned: true,
        readyForSimulation: true,
        note: 'Valley of Echoes demo with full LOD system: 8 heroes, 8 groups, 200 background characters'
      }
    };
  }

  /**
   * Assign citizen tier to a character based on their properties
   * @private
   * @param {Object} character - Character object to assign tier to
   * @param {string} lodTier - LOD tier (hero, group, background)
   * @returns {Object} Character with citizen tier assigned
   */
  static _assignCitizenTier(character, lodTier) {
    let citizenTier = 'CITIZEN'; // Default tier

    if (lodTier === 'hero') {
      // Hero characters get tier based on their role
      const role = character.role || character.background || '';
      const roleLower = role.toLowerCase();

      if (roleLower.includes('council') || roleLower.includes('chair') ||
          roleLower.includes('leader') || roleLower.includes('governor') ||
          roleLower.includes('administrator') || roleLower.includes('lord')) {
        citizenTier = 'LEADER';
      } else if (roleLower.includes('merchant') || roleLower.includes('guild') ||
                 roleLower.includes('master') || roleLower.includes('specialist') ||
                 roleLower.includes('captain') || roleLower.includes('chief')) {
        citizenTier = 'SPECIALIST';
      } else {
        citizenTier = 'CITIZEN';
      }
    } else if (lodTier === 'group') {
      // Group characters get tier based on demographics
      const demographics = character.demographics || character.groupStatistics || {};
      const economicClass = demographics.economicClass || 'working';
      const occupation = demographics.occupation || '';

      if (economicClass === 'upper' || economicClass === 'upper_middle' ||
          occupation.includes('administrator') || occupation.includes('leader')) {
        citizenTier = 'LEADER';
      } else if (economicClass === 'middle' || economicClass === 'upper_middle' ||
                 ['merchant', 'artisan', 'specialist', 'guild'].some(term => occupation.includes(term))) {
        citizenTier = 'SPECIALIST';
      } else {
        citizenTier = 'CITIZEN';
      }
    } else if (lodTier === 'background') {
      // Background characters get tier based on demographic data
      const demographicData = character.demographicData || {};
      const economicClass = demographicData.economicClass || 'working';
      const occupation = demographicData.occupation || '';

      if (economicClass === 'upper' || economicClass === 'upper_middle' ||
          occupation.includes('administrator') || occupation.includes('leader')) {
        citizenTier = 'LEADER';
      } else if (economicClass === 'middle' || economicClass === 'upper_middle' ||
                 ['merchant', 'artisan', 'specialist', 'guild'].some(term => occupation.includes(term))) {
        citizenTier = 'SPECIALIST';
      } else {
        citizenTier = 'CITIZEN';
      }
    }

    // Apply the tier profile from BasicNeedsService
    const tierProfile = ECONOMIC_PROFILES[citizenTier];

    return {
      ...character,
      citizenTier: citizenTier,
      economicProfile: tierProfile,
      // Add economic properties based on tier
      wealth: character.wealth || this._calculateInitialWealth(citizenTier, lodTier),
      economicInfluence: tierProfile.economicInfluence,
      productionCapacity: tierProfile.productionCapacity,
      consumptionMultiplier: tierProfile.consumptionMultiplier
    };
  }

  /**
   * Calculate initial wealth based on citizen tier and LOD level
   * @private
   * @param {string} citizenTier - Citizen tier (LEADER, SPECIALIST, CITIZEN)
   * @param {string} lodTier - LOD tier (hero, group, background)
   * @returns {number} Initial wealth amount
   */
  static _calculateInitialWealth(citizenTier, lodTier) {
    const baseWealth = {
      LEADER: { hero: 500, group: 300, background: 200 },
      SPECIALIST: { hero: 300, group: 150, background: 100 },
      CITIZEN: { hero: 150, group: 75, background: 50 }
    };

    return baseWealth[citizenTier]?.[lodTier] || 50;
  }

  /**
   * Determine the appropriate LOD tier for an interaction
   * @private
   * @param {Object} interaction - Interaction object from config
   * @returns {string} LOD tier requirement ('background', 'group', 'hero', or 'all')
   */
  static _determineInteractionTier(interaction) {
    // Check interaction type and requirements to determine appropriate tier
    const type = interaction.type?.toLowerCase() || '';
    const category = interaction.category?.toLowerCase() || '';
    const requirements = interaction.requirements || {};

    // Labor/work interactions are typically for background and group tiers
    if (type === 'labor' || category === 'craft' || category === 'mining' || category === 'agricultural') {
      return 'background'; // Basic work available to all, but primarily background
    }

    // Military and training interactions for soldiers (group tier)
    if (type === 'military' || category === 'training' || category === 'discipline') {
      return 'group';
    }

    // Educational and complex social interactions for higher tiers
    if (type === 'educational' || (type === 'social' && Object.keys(requirements).length > 2)) {
      return 'group';
    }

    // Cultural and leadership interactions for hero tier
    if (type === 'cultural' || category === 'tradition' || category === 'leadership') {
      return 'hero';
    }

    // High complexity interactions (many requirements) for hero tier
    if (Object.keys(requirements).length >= 3) {
      return 'hero';
    }

    // Default to background tier for simple interactions
    return 'background';
  }
}

export default DemoService;