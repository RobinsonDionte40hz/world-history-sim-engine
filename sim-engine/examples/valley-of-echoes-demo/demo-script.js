/**
 * Valley of Echoes Demo Orchestration Script
 *
 * Orchestrates the complete Valley of Echoes two-settlement demo,
 * including world building, simulation execution, and result analysis.
 */

const oakwoodFederationConfig = require('./oakwood-federation/config.js');
const ironholdDominionConfig = require('./ironhold-dominion/config.js');
const multiSettlementQuests = require('./quests/multi-settlement-quests.js');
const processTurnWithLOD = require('../../src/application/use-cases/simulation/ProcessTurnWithLOD.js');
const LODManager = require('../../src/domain/services/LODManager.js');
const HistoryGenerator = require('../../src/domain/services/HistoryGenerator.js');
const WorldBuilder = require('../../src/domain/services/WorldBuilder.js');

/**
 * Creates system interactions for the demo
 * @returns {Array} Array of system interaction objects
 */
function createSystemInteractions() {
  const systemInteractions = [];

  // Wait interaction
  systemInteractions.push({
    id: 'wait_interaction',
    name: 'Wait',
    type: 'wait',
    category: 'system',
    tags: ['system', 'wait', 'rest'],
    isSystemInteraction: true,
    weight: 0.5, // Low weight for passive actions
    requirements: { energy: 0 },
    branches: [{
      id: 'wait_success',
      name: 'Wait Successfully',
      conditions: [],
      effects: [{ type: 'energy', value: 10 }]
    }],
    effects: [],
    context: { duration: 1 }
  });

  // Rest interaction
  systemInteractions.push({
    id: 'rest_interaction',
    name: 'Rest',
    type: 'rest',
    category: 'system',
    tags: ['system', 'rest', 'recovery'],
    isSystemInteraction: true,
    weight: 3.0, // High weight when energy is low
    requirements: { energy: 20 },
    branches: [{
      id: 'rest_success',
      name: 'Rest Successfully',
      conditions: [],
      effects: [{ type: 'energy', value: 50 }]
    }],
    effects: [],
    context: { duration: 2 }
  });

  // Examine interaction
  systemInteractions.push({
    id: 'examine_interaction',
    name: 'Examine',
    type: 'examine',
    category: 'system',
    tags: ['system', 'examine', 'learn'],
    isSystemInteraction: true,
    weight: 1.5, // Medium weight for informational actions
    requirements: { energy: 5 },
    branches: [{
      id: 'examine_success',
      name: 'Examine Successfully',
      conditions: [],
      effects: [{ type: 'knowledge', value: 10 }]
    }],
    effects: [],
    context: { targetType: 'environment' }
  });

  // Movement interaction
  systemInteractions.push({
    id: 'movement_interaction',
    name: 'Move',
    type: 'movement',
    category: 'system',
    tags: ['system', 'movement', 'travel'],
    isSystemInteraction: true,
    weight: 2.0, // Medium-high weight for movement
    requirements: { energy: 15 },
    branches: [{
      id: 'movement_success',
      name: 'Move Successfully',
      conditions: [],
      effects: [{ type: 'position', value: 'changed' }]
    }],
    effects: [],
    context: { distance: 1 }
  });

  // Perception interaction
  systemInteractions.push({
    id: 'perception_interaction',
    name: 'Perceive',
    type: 'perception',
    category: 'system',
    tags: ['system', 'perception', 'awareness'],
    isSystemInteraction: true,
    weight: 1.8, // Medium weight for perception
    requirements: { energy: 10 },
    branches: [{
      id: 'perception_success',
      name: 'Perceive Successfully',
      conditions: [],
      effects: [{ type: 'awareness', value: 15 }]
    }],
    effects: [],
    context: { range: 10 }
  });

  return systemInteractions;
}

/**
 * Creates profession-specific work interactions for the demo
 * @returns {Array} Array of work interaction objects
 */
function createWorkInteractions() {
  const workInteractions = [];

  // ===== FARMING WORK INTERACTIONS =====

  // Basic Farming - Available to farmer background NPCs
  workInteractions.push({
    id: 'basic_farming',
    name: 'Tend Crops',
    description: 'Work in the fields tending to crops and livestock',
    category: 'work',
    type: 'work',
    profession: 'farmer',
    tierRequirement: 'background',
    tags: ['work', 'farming', 'agriculture', 'labor'],
    isSystemInteraction: false,
    weight: 2.0, // Medium weight for essential work
    requirements: { constitution: 10 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'background' &&
             character.demographicData?.occupation === 'farmer';
    },
    branches: [
      {
        text: 'Plant new crops',
        effects: [{ type: 'resource', resource: 'food', value: 5 }],
        outcomes: ['You spend the day planting seeds and tending young crops']
      },
      {
        text: 'Harvest mature crops',
        effects: [{ type: 'resource', resource: 'food', value: 10 }],
        outcomes: ['You harvest a good yield of crops from the fields']
      },
      {
        text: 'Tend to livestock',
        effects: [{ type: 'resource', resource: 'food', value: 3 }],
        outcomes: ['You care for the settlement\'s livestock and collect produce']
      }
    ]
  });

  // Advanced Farming - Available to farmer group NPCs
  workInteractions.push({
    id: 'advanced_farming',
    name: 'Farm Management',
    description: 'Oversee farming operations and plan agricultural activities',
    category: 'work',
    type: 'work',
    profession: 'farmer',
    tierRequirement: 'group',
    tags: ['work', 'farming', 'management', 'planning'],
    isSystemInteraction: false,
    weight: 2.5, // Higher weight for skilled work
    requirements: { intelligence: 12, wisdom: 12 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'group' &&
             character.demographics?.occupation === 'farmer';
    },
    branches: [
      {
        text: 'Plan crop rotation',
        effects: [{ type: 'resource', resource: 'food', value: 15 }],
        outcomes: ['You plan an efficient crop rotation that will improve long-term yields']
      },
      {
        text: 'Organize irrigation system',
        effects: [{ type: 'resource', resource: 'food', value: 12 }],
        outcomes: ['You organize workers to improve the irrigation system']
      },
      {
        text: 'Negotiate with suppliers',
        effects: [{ type: 'resource', resource: 'tools', value: 5 }],
        outcomes: ['You negotiate better terms for farming supplies and equipment']
      }
    ]
  });

  // ===== MINING WORK INTERACTIONS =====

  // Basic Mining - Available to miner background NPCs
  workInteractions.push({
    id: 'basic_mining',
    name: 'Extract Ore',
    description: 'Work in the mines extracting valuable ores and minerals',
    category: 'work',
    type: 'work',
    profession: 'miner',
    tierRequirement: 'background',
    tags: ['work', 'mining', 'extraction', 'labor'],
    isSystemInteraction: false,
    weight: 2.2, // Medium-high weight for dangerous work
    requirements: { strength: 12, constitution: 12 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'background' &&
             character.demographicData?.occupation === 'miner';
    },
    branches: [
      {
        text: 'Mine iron ore',
        effects: [{ type: 'resource', resource: 'iron_ore', value: 8 }],
        outcomes: ['You spend hours extracting iron ore from the mine shafts']
      },
      {
        text: 'Search for gem deposits',
        effects: [{ type: 'resource', resource: 'gems', value: 2 }],
        outcomes: ['You carefully search for precious gem deposits in the rock']
      },
      {
        text: 'Reinforce mine tunnels',
        effects: [{ type: 'resource', resource: 'safety', value: 5 }],
        outcomes: ['You reinforce unstable tunnels to improve mine safety']
      }
    ]
  });

  // Advanced Mining - Available to miner group NPCs
  workInteractions.push({
    id: 'advanced_mining',
    name: 'Mine Operations',
    description: 'Oversee mining operations and manage extraction teams',
    category: 'work',
    type: 'work',
    profession: 'miner',
    tierRequirement: 'group',
    tags: ['work', 'mining', 'management', 'engineering'],
    isSystemInteraction: false,
    weight: 2.8, // High weight for skilled mining work
    requirements: { intelligence: 13, wisdom: 13 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'group' &&
             character.demographics?.occupation === 'miner';
    },
    branches: [
      {
        text: 'Plan new mine shaft',
        effects: [{ type: 'resource', resource: 'ore', value: 20 }],
        outcomes: ['You plan and begin excavation of a new, rich ore deposit']
      },
      {
        text: 'Implement safety protocols',
        effects: [{ type: 'resource', resource: 'safety', value: 15 }],
        outcomes: ['You implement new safety protocols that reduce accidents']
      },
      {
        text: 'Negotiate mining rights',
        effects: [{ type: 'resource', resource: 'claims', value: 10 }],
        outcomes: ['You negotiate expanded mining rights with local authorities']
      }
    ]
  });

  // ===== SMITHING WORK INTERACTIONS =====

  // Basic Smithing - Available to smith/artisan background NPCs
  workInteractions.push({
    id: 'basic_smithing',
    name: 'Forge Tools',
    description: 'Work at the forge creating tools and basic metalwork',
    category: 'work',
    type: 'work',
    profession: 'smith',
    tierRequirement: 'background',
    tags: ['work', 'smithing', 'forging', 'craftsmanship'],
    isSystemInteraction: false,
    weight: 2.3, // Medium-high weight for skilled craft work
    requirements: { strength: 13, dexterity: 12 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'background' &&
             (character.demographicData?.occupation === 'smith' ||
              character.demographicData?.occupation === 'artisan');
    },
    branches: [
      {
        text: 'Forge farming tools',
        effects: [{ type: 'resource', resource: 'tools', value: 6 }],
        outcomes: ['You forge sturdy farming tools for the local farmers']
      },
      {
        text: 'Repair weapons',
        effects: [{ type: 'resource', resource: 'weapons', value: 4 }],
        outcomes: ['You repair and maintain the garrison\'s weapons']
      },
      {
        text: 'Create horseshoes',
        effects: [{ type: 'resource', resource: 'horseshoes', value: 8 }],
        outcomes: ['You craft horseshoes for the settlement\'s horses and livestock']
      }
    ]
  });

  // Advanced Smithing - Available to smith group NPCs
  workInteractions.push({
    id: 'advanced_smithing',
    name: 'Master Forging',
    description: 'Create advanced metalwork and oversee smithy operations',
    category: 'work',
    type: 'work',
    profession: 'smith',
    tierRequirement: 'group',
    tags: ['work', 'smithing', 'masterwork', 'craftsmanship'],
    isSystemInteraction: false,
    weight: 3.0, // High weight for master-level craft work
    requirements: { strength: 14, dexterity: 14, intelligence: 12 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'group' &&
             (character.demographics?.occupation === 'smith' ||
              character.demographics?.occupation === 'artisan');
    },
    branches: [
      {
        text: 'Forge masterwork weapons',
        effects: [{ type: 'resource', resource: 'weapons', value: 12 }],
        outcomes: ['You create exceptional weapons with superior craftsmanship']
      },
      {
        text: 'Design new forge techniques',
        effects: [{ type: 'resource', resource: 'innovation', value: 8 }],
        outcomes: ['You develop new forging techniques that improve efficiency']
      },
      {
        text: 'Train apprentice smiths',
        effects: [{ type: 'resource', resource: 'skilled_labor', value: 6 }],
        outcomes: ['You train new smiths, expanding the settlement\'s crafting capacity']
      }
    ]
  });

  // ===== GUARD/SOLDIER WORK INTERACTIONS =====

  // Basic Guard Duty - Available to garrison/soldier background NPCs
  workInteractions.push({
    id: 'basic_guard_duty',
    name: 'Stand Guard',
    description: 'Perform basic guard duties and maintain security',
    category: 'work',
    type: 'work',
    profession: 'guard',
    tierRequirement: 'background',
    tags: ['work', 'guarding', 'security', 'patrol'],
    isSystemInteraction: false,
    weight: 2.1, // Medium-high weight for security work
    requirements: { constitution: 13, wisdom: 11 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'background' &&
             (character.demographicData?.occupation === 'garrison' ||
              character.demographicData?.occupation === 'soldier');
    },
    branches: [
      {
        text: 'Patrol the walls',
        effects: [{ type: 'resource', resource: 'security', value: 6 }],
        outcomes: ['You patrol the settlement walls, maintaining vigilance']
      },
      {
        text: 'Guard the gates',
        effects: [{ type: 'resource', resource: 'security', value: 7 }],
        outcomes: ['You stand guard at the main gates, checking visitors']
      },
      {
        text: 'Inspect defenses',
        effects: [{ type: 'resource', resource: 'security', value: 5 }],
        outcomes: ['You inspect and maintain the settlement\'s defensive structures']
      }
    ]
  });

  // Advanced Military Duty - Available to garrison group NPCs
  workInteractions.push({
    id: 'advanced_military_duty',
    name: 'Military Command',
    description: 'Lead military operations and strategic defense planning',
    category: 'work',
    type: 'work',
    profession: 'guard',
    tierRequirement: 'group',
    tags: ['work', 'military', 'command', 'strategy'],
    isSystemInteraction: false,
    weight: 3.2, // High weight for military leadership
    requirements: { charisma: 14, wisdom: 14, intelligence: 13 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'group' &&
             (character.demographics?.occupation === 'garrison' ||
              character.demographics?.occupation === 'soldier');
    },
    branches: [
      {
        text: 'Plan defensive strategy',
        effects: [{ type: 'resource', resource: 'defense', value: 15 }],
        outcomes: ['You develop a comprehensive defensive strategy for the settlement']
      },
      {
        text: 'Train new recruits',
        effects: [{ type: 'resource', resource: 'troops', value: 10 }],
        outcomes: ['You train new soldiers, improving the garrison\'s effectiveness']
      },
      {
        text: 'Coordinate border patrols',
        effects: [{ type: 'resource', resource: 'security', value: 12 }],
        outcomes: ['You organize coordinated patrols along the settlement borders']
      }
    ]
  });

  // ===== ADMINISTRATIVE WORK INTERACTIONS =====

  // Basic Administration - Available to administrator background NPCs
  workInteractions.push({
    id: 'basic_administration',
    name: 'Handle Records',
    description: 'Manage records, documentation, and basic administrative tasks',
    category: 'work',
    type: 'work',
    profession: 'administrator',
    tierRequirement: 'background',
    tags: ['work', 'administration', 'records', 'organization'],
    isSystemInteraction: false,
    weight: 1.8, // Medium weight for administrative work
    requirements: { intelligence: 12, wisdom: 11 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'background' &&
             character.demographicData?.occupation === 'administrator';
    },
    branches: [
      {
        text: 'Update population records',
        effects: [{ type: 'resource', resource: 'records', value: 5 }],
        outcomes: ['You update and organize the settlement\'s population records']
      },
      {
        text: 'Process trade permits',
        effects: [{ type: 'resource', resource: 'permits', value: 6 }],
        outcomes: ['You process trade permits and merchant licenses']
      },
      {
        text: 'File tax records',
        effects: [{ type: 'resource', resource: 'taxes', value: 4 }],
        outcomes: ['You organize and file tax collection records']
      }
    ]
  });

  // Advanced Administration - Available to administrator group NPCs
  workInteractions.push({
    id: 'advanced_administration',
    name: 'Policy Development',
    description: 'Develop policies, manage governance, and oversee administration',
    category: 'work',
    type: 'work',
    profession: 'administrator',
    tierRequirement: 'group',
    tags: ['work', 'administration', 'policy', 'governance'],
    isSystemInteraction: false,
    weight: 2.7, // High weight for policy work
    requirements: { intelligence: 15, wisdom: 15, charisma: 13 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'group' &&
             character.demographics?.occupation === 'administrator';
    },
    branches: [
      {
        text: 'Develop economic policy',
        effects: [{ type: 'resource', resource: 'policy', value: 12 }],
        outcomes: ['You develop economic policies that improve settlement prosperity']
      },
      {
        text: 'Reform tax system',
        effects: [{ type: 'resource', resource: 'taxes', value: 15 }],
        outcomes: ['You reform the tax system for fairer and more efficient collection']
      },
      {
        text: 'Plan public works',
        effects: [{ type: 'resource', resource: 'infrastructure', value: 10 }],
        outcomes: ['You plan public works projects to improve settlement infrastructure']
      }
    ]
  });

  // ===== ENGINEERING WORK INTERACTIONS =====

  // Basic Engineering - Available to engineer background NPCs
  workInteractions.push({
    id: 'basic_engineering',
    name: 'Construction Work',
    description: 'Perform basic construction and maintenance engineering tasks',
    category: 'work',
    type: 'work',
    profession: 'engineer',
    tierRequirement: 'background',
    tags: ['work', 'engineering', 'construction', 'maintenance'],
    isSystemInteraction: false,
    weight: 2.4, // Medium-high weight for technical work
    requirements: { intelligence: 13, dexterity: 12 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'background' &&
             character.demographicData?.occupation === 'engineer';
    },
    branches: [
      {
        text: 'Repair buildings',
        effects: [{ type: 'resource', resource: 'buildings', value: 7 }],
        outcomes: ['You repair damaged buildings and structures']
      },
      {
        text: 'Maintain roads',
        effects: [{ type: 'resource', resource: 'roads', value: 6 }],
        outcomes: ['You maintain and improve the settlement\'s road network']
      },
      {
        text: 'Build fortifications',
        effects: [{ type: 'resource', resource: 'defenses', value: 8 }],
        outcomes: ['You work on strengthening the settlement\'s fortifications']
      }
    ]
  });

  // Advanced Engineering - Available to engineer group NPCs
  workInteractions.push({
    id: 'advanced_engineering',
    name: 'Engineering Design',
    description: 'Design complex structures and oversee major engineering projects',
    category: 'work',
    type: 'work',
    profession: 'engineer',
    tierRequirement: 'group',
    tags: ['work', 'engineering', 'design', 'architecture'],
    isSystemInteraction: false,
    weight: 3.1, // High weight for advanced engineering
    requirements: { intelligence: 16, wisdom: 14, dexterity: 13 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'group' &&
             character.demographics?.occupation === 'engineer';
    },
    branches: [
      {
        text: 'Design new buildings',
        effects: [{ type: 'resource', resource: 'buildings', value: 18 }],
        outcomes: ['You design innovative new buildings for the settlement']
      },
      {
        text: 'Plan infrastructure expansion',
        effects: [{ type: 'resource', resource: 'infrastructure', value: 16 }],
        outcomes: ['You plan major infrastructure projects for future growth']
      },
      {
        text: 'Develop siege defenses',
        effects: [{ type: 'resource', resource: 'defenses', value: 14 }],
        outcomes: ['You develop advanced defensive systems for the settlement']
      }
    ]
  });

  return workInteractions;
}

/**
 * Creates tier-scaled content interactions for the demo
 * @returns {Array} Array of content interaction objects
 */
function createContentInteractions() {
  const contentInteractions = [];

  // ===== BACKGROUND TIER INTERACTIONS (Basic, for low-tier NPCs) =====

  // Casual Chat - Available to all background NPCs
  contentInteractions.push({
    id: 'casual_chat',
    name: 'Casual Chat',
    description: 'Have a casual conversation about daily life',
    category: 'social',
    type: 'content',
    tierRequirement: 'background',
    tags: ['social', 'casual', 'conversation'],
    isSystemInteraction: false,
    weight: 1.2, // Base weight for background interactions
    requirements: { charisma: 8 },
    canExecute: (character, worldState) => {
      // Available to background tier NPCs
      return character.lodTier === 'background';
    },
    branches: [
      {
        text: 'Talk about the weather',
        effects: [{ type: 'relationship', value: 0.1 }],
        outcomes: ['You discuss the recent weather patterns and seasonal changes']
      },
      {
        text: 'Ask about local news',
        effects: [{ type: 'knowledge', gain: 'local_gossip' }],
        outcomes: ['They share some local gossip and recent happenings in the settlement']
      },
      {
        text: 'Compliment their work',
        prerequisites: [{ type: 'attribute', attribute: 'charisma', minimum: 10 }],
        effects: [{ type: 'relationship', value: 0.2 }],
        outcomes: ['They smile and thank you for noticing their craftsmanship']
      }
    ]
  });

  // Simple Greeting - Very basic interaction
  contentInteractions.push({
    id: 'simple_greeting',
    name: 'Simple Greeting',
    description: 'Exchange a friendly greeting',
    category: 'social',
    type: 'content',
    tierRequirement: 'background',
    tags: ['social', 'greeting', 'basic'],
    isSystemInteraction: false,
    weight: 1.0, // Lowest weight for most basic interaction
    requirements: {},
    canExecute: (character, worldState) => {
      return character.lodTier === 'background';
    },
    branches: [
      {
        text: 'Good day!',
        effects: [{ type: 'relationship', value: 0.05 }],
        outcomes: ['They return your greeting with a friendly nod']
      },
      {
        text: 'How are you today?',
        effects: [{ type: 'relationship', value: 0.1 }],
        outcomes: ['They respond politely and ask about your day in return']
      }
    ]
  });

  // ===== GROUP TIER INTERACTIONS (Medium complexity) =====

  // Trade Goods - Available to group NPCs with merchant/specialist roles
  contentInteractions.push({
    id: 'trade_goods',
    name: 'Trade Goods',
    description: 'Discuss buying or selling goods',
    category: 'economic',
    type: 'content',
    tierRequirement: 'group',
    tags: ['economic', 'trade', 'merchant'],
    isSystemInteraction: false,
    weight: 2.5, // Higher weight for economic interactions
    requirements: { wealth: 10 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'group' &&
             (character.demographics?.occupation?.includes('merchant') ||
              character.demographics?.occupation?.includes('artisan'));
    },
    branches: [
      {
        text: 'What goods do you have for sale?',
        effects: [{ type: 'trade', discovered: true }],
        outcomes: ['They show you their available goods and current prices']
      },
      {
        text: 'I\'m looking to buy supplies',
        prerequisites: [{ type: 'attribute', attribute: 'charisma', minimum: 12 }],
        effects: [{ type: 'trade', negotiation: 'started' }],
        outcomes: ['They offer you a good deal on essential supplies']
      },
      {
        text: 'Can you recommend a good price?',
        effects: [{ type: 'relationship', value: 0.15 }],
        outcomes: ['They give you advice on fair market prices in the settlement']
      }
    ]
  });

  // Court Petition - Available to group NPCs with administrative roles
  contentInteractions.push({
    id: 'court_petition',
    name: 'Court Petition',
    description: 'Present a formal petition to local authorities',
    category: 'political',
    type: 'content',
    tierRequirement: 'group',
    tags: ['political', 'court', 'petition'],
    isSystemInteraction: false,
    weight: 2.8, // High weight for political interactions
    requirements: { charisma: 12 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'group' &&
             (character.demographics?.occupation?.includes('administrator') ||
              character.demographics?.occupation?.includes('official'));
    },
    branches: [
      {
        text: 'Request a small favor',
        effects: [{ type: 'favor', requested: true }],
        outcomes: ['They consider your request and promise to look into it']
      },
      {
        text: 'Report a local issue',
        effects: [{ type: 'information', reported: true }],
        outcomes: ['They take note of your concern and assure you it will be addressed']
      },
      {
        text: 'Seek permission for an activity',
        prerequisites: [{ type: 'relationship', character: 'target', minimum: 0.3 }],
        effects: [{ type: 'permission', granted: true }],
        outcomes: ['They grant you permission with some conditions attached']
      }
    ]
  });

  // Guild Discussion - Available to specialist group NPCs
  contentInteractions.push({
    id: 'guild_discussion',
    name: 'Guild Discussion',
    description: 'Discuss guild matters and professional topics',
    category: 'professional',
    type: 'content',
    tierRequirement: 'group',
    tags: ['professional', 'guild', 'specialist'],
    isSystemInteraction: false,
    weight: 2.2, // Medium-high weight for professional interactions
    requirements: { intelligence: 10 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'group' &&
             character.demographics?.occupation?.includes('guild');
    },
    branches: [
      {
        text: 'Discuss guild standards',
        effects: [{ type: 'knowledge', gain: 'guild_standards' }],
        outcomes: ['They explain the professional standards and expectations of their guild']
      },
      {
        text: 'Ask about apprenticeship',
        effects: [{ type: 'opportunity', apprenticeship: true }],
        outcomes: ['They discuss the requirements and benefits of joining their guild']
      },
      {
        text: 'Share professional insights',
        prerequisites: [{ type: 'attribute', attribute: 'intelligence', minimum: 13 }],
        effects: [{ type: 'relationship', value: 0.2 }],
        outcomes: ['They appreciate your insights and engage in a deeper professional discussion']
      }
    ]
  });

  // ===== HERO TIER INTERACTIONS (Complex, high-stakes) =====

  // Diplomatic Negotiation - Available to hero NPCs with leadership roles
  contentInteractions.push({
    id: 'diplomatic_negotiation',
    name: 'Diplomatic Negotiation',
    description: 'Engage in high-level diplomatic discussions',
    category: 'political',
    type: 'content',
    tierRequirement: 'hero',
    tags: ['political', 'diplomacy', 'leadership'],
    isSystemInteraction: false,
    weight: 3.5, // High weight for diplomatic interactions
    requirements: { charisma: 15, intelligence: 13 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'hero' &&
             (character.role?.includes('council') ||
              character.role?.includes('leader') ||
              character.role?.includes('diplomat'));
    },
    branches: [
      {
        text: 'Discuss inter-settlement relations',
        effects: [{ type: 'diplomacy', relations: 'discussed' }],
        outcomes: ['You engage in a detailed discussion about improving relations between settlements']
      },
      {
        text: 'Propose an alliance',
        prerequisites: [{ type: 'relationship', character: 'target', minimum: 0.5 }],
        effects: [{ type: 'alliance', proposed: true }],
        outcomes: ['They seriously consider your proposal for a formal alliance between your peoples']
      },
      {
        text: 'Address a territorial dispute',
        effects: [{ type: 'conflict', mediated: true }],
        outcomes: ['You help mediate a long-standing territorial dispute with wisdom and diplomacy']
      }
    ]
  });

  // Royal Court Audience - Available to hero NPCs with noble/court roles
  contentInteractions.push({
    id: 'royal_court_audience',
    name: 'Royal Court Audience',
    description: 'Request a formal audience with royalty or high nobility',
    category: 'political',
    type: 'content',
    tierRequirement: 'hero',
    tags: ['political', 'court', 'nobility'],
    isSystemInteraction: false,
    weight: 4.0, // Very high weight for royal interactions
    requirements: { charisma: 16, wealth: 100 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'hero' &&
             (character.role?.includes('lord') ||
              character.role?.includes('protector') ||
              character.role?.includes('chair'));
    },
    branches: [
      {
        text: 'Present a formal petition',
        effects: [{ type: 'petition', presented: true }],
        outcomes: ['Your petition is formally presented and entered into the royal records']
      },
      {
        text: 'Discuss matters of state',
        prerequisites: [{ type: 'attribute', attribute: 'intelligence', minimum: 14 }],
        effects: [{ type: 'policy', discussed: true }],
        outcomes: ['You engage in a sophisticated discussion about governance and policy']
      },
      {
        text: 'Request royal favor',
        prerequisites: [{ type: 'relationship', character: 'target', minimum: 0.6 }],
        effects: [{ type: 'favor', royal: true }],
        outcomes: ['They grant you a significant royal favor that could change your fortunes']
      }
    ]
  });

  // Grand Trade Agreement - Available to hero NPCs with merchant/leader roles
  contentInteractions.push({
    id: 'grand_trade_agreement',
    name: 'Grand Trade Agreement',
    description: 'Negotiate large-scale trade agreements between settlements',
    category: 'economic',
    type: 'content',
    tierRequirement: 'hero',
    tags: ['economic', 'trade', 'alliance'],
    isSystemInteraction: false,
    weight: 3.8, // High weight for major trade agreements
    requirements: { charisma: 14, wealth: 200 },
    canExecute: (character, worldState) => {
      return character.lodTier === 'hero' &&
             (character.role?.includes('merchant') ||
              character.role?.includes('council') ||
              character.role?.includes('leader'));
    },
    branches: [
      {
        text: 'Propose trade agreement',
        effects: [{ type: 'trade', agreement: 'proposed' }],
        outcomes: ['You propose a comprehensive trade agreement that could benefit both settlements']
      },
      {
        text: 'Negotiate resource exchange',
        effects: [{ type: 'trade', resources: 'negotiated' }],
        outcomes: ['You successfully negotiate favorable terms for resource exchange between settlements']
      },
      {
        text: 'Establish merchant guild alliance',
        prerequisites: [{ type: 'relationship', character: 'target', minimum: 0.4 }],
        effects: [{ type: 'alliance', merchant: true }],
        outcomes: ['You establish a formal alliance between the merchant guilds of both settlements']
      }
    ]
  });

  // ===== CROSS-TIER INTERACTIONS (Available to multiple tiers) =====

  // Valley Trade Negotiations - Available to hero and some group NPCs
  contentInteractions.push({
    id: 'valley_trade',
    name: 'Valley Trade Negotiations',
    description: 'Negotiate trade agreements between Oakwood and Ironhold',
    category: 'economic',
    type: 'content',
    tierRequirement: 'hero',
    tags: ['economic', 'trade', 'inter-settlement'],
    isSystemInteraction: false,
    weight: 3.2, // High weight for inter-settlement trade
    requirements: { charisma: 13 },
    canExecute: (character, worldState) => {
      return (character.lodTier === 'hero' || character.lodTier === 'group') &&
             (character.role?.includes('council') ||
              character.role?.includes('merchant') ||
              character.role?.includes('leader'));
    },
    branches: [
      {
        text: 'Propose trade agreement',
        effects: [{ type: 'trade', established: true }],
        outcomes: ['Trade relations between the settlements improve significantly']
      },
      {
        text: 'Discuss border trade',
        effects: [{ type: 'trade', border: 'opened' }],
        outcomes: ['You negotiate the opening of official border trade routes']
      },
      {
        text: 'Address trade disputes',
        prerequisites: [{ type: 'attribute', attribute: 'wisdom', minimum: 14 }],
        effects: [{ type: 'conflict', resolved: true }],
        outcomes: ['You help resolve long-standing trade disputes between the settlements']
      }
    ]
  });

  return contentInteractions;
}
class ValleyOfEchoesDemo {
  constructor() {
    this.worldBuilder = new WorldBuilder();
    this.lodManager = new LODManager();
    this.historyGenerator = new HistoryGenerator();
    this.worldState = null;
    this.demoResults = {
      turns: 0,
      events: [],
      performance: [],
      quests: [],
      settlements: []
    };
  }

  /**
   * Initialize the demo world
   */
  async initializeDemo() {
    console.log('🌍 Initializing Valley of Echoes Demo...');

    try {
      // Build Oakwood Federation
      console.log('🏛️ Building Oakwood Federation...');
      const oakwoodWorld = await this.buildSettlement(oakwoodFederationConfig);

      // Build Ironhold Dominion
      console.log('🏰 Building Ironhold Dominion...');
      const ironholdWorld = await this.buildSettlement(ironholdDominionConfig);

      // Merge settlements into unified world
      console.log('🔗 Merging settlements into unified world...');
      this.worldState = await this.mergeSettlements(oakwoodWorld, ironholdWorld);

      // Initialize quests
      console.log('📜 Initializing multi-settlement quests...');
      this.initializeQuests();

      console.log('✅ Demo world initialized successfully!');
      console.log(`   Settlements: ${this.worldState.settlements.length}`);
      console.log(`   Characters: ${this.worldState.characters.length}`);
      console.log(`   Nodes: ${this.worldState.nodes.length}`);
      console.log(`   Quests: ${multiSettlementQuests.length}`);

    } catch (error) {
      console.error('❌ Failed to initialize demo:', error);
      throw error;
    }
  }

  /**
   * Build a single settlement
   */
  async buildSettlement(config) {
    // Calculate total population from population groups
    const totalPopulation = config.populationGroups?.reduce((sum, group) => 
      sum + (group.size || group.count || 0), 0
    ) || 100;

    const settlement = {
      id: config.id,
      name: config.name,
      description: config.description,
      type: config.type,
      governance: config.governance,
      // Ensure proper population structure
      population: {
        total: totalPopulation,
        groups: config.populationGroups || [],
        breakdown: {
          farmers: config.populationGroups?.find(g => g.demographics?.occupation === 'farmer')?.size || 0,
          artisans: config.populationGroups?.find(g => g.demographics?.occupation === 'artisan')?.size || 0,
          merchants: config.populationGroups?.find(g => g.demographics?.occupation === 'merchant')?.size || 0,
          soldiers: 0,
          administrators: config.populationGroups?.find(g => g.demographics?.occupation === 'administrator')?.size || 0
        },
        lastUpdated: 0
      },
      nodes: config.nodes,
      assignedCharacters: [
        ...config.heroCharacters.map(char => char.id),
        ...config.populationGroups.flatMap(group =>
          Array.from({ length: group.size }, (_, i) => `${group.id}-bg-${i}`)
        )
      ],
      needSatisfaction: config.needSatisfaction,
      development: config.development,
      economy: config.economy
    };

    // Create hero characters
    const heroCharacters = config.heroCharacters.map(char => ({
      ...char,
      lodTier: 'hero',
      assignments: {
        nodes: new Set([char.assignedNode || char.assignments?.nodes?.values().next().value]),
        interactions: new Set(),
        settlements: new Set([config.id])
      }
    }));

    // Create group-level characters for population groups
    const groupCharacters = config.populationGroups.map(group => ({
      id: group.id,
      name: group.name,
      lodTier: 'group',
      populationGroupId: group.id,
      groupStatistics: group.statistics,
      assignments: {
        nodes: new Set([group.assignedNode]),
        interactions: new Set(),
        settlements: new Set([config.id])
      }
    }));

    // Create individual background characters for each population group
    const backgroundCharacters = [];
    config.populationGroups.forEach(group => {
      for (let i = 0; i < group.size; i++) {
        backgroundCharacters.push({
          id: `${group.id}-bg-${i}`,
          name: `${group.name} ${i + 1}`,
          lodTier: 'background',
          populationGroupId: group.id,
          demographicData: {
            occupation: group.demographics.occupation,
            ageGroup: group.demographics.ageGroup,
            economicClass: group.demographics.economicClass
          },
          assignments: {
            nodes: new Set([group.assignedNode]),
            interactions: new Set(),
            settlements: new Set([config.id])
          }
        });
      }
    });

    const worldData = {
      settlement: settlement,
      characters: [
        ...heroCharacters,
        ...groupCharacters,
        ...backgroundCharacters
      ],
      nodes: config.nodes,
      interactions: [
        ...createSystemInteractions(), // System interactions for all
        ...createContentInteractions(), // Content interactions by tier
        ...createWorkInteractions()     // Work interactions by profession
      ]
    };

    return worldData;
  }

  /**
   * Assign interactions to characters based on their level and type
   * @param {Array} characters - Array of character objects
   * @param {Array} interactions - Array of available interactions
   * @returns {Array} Characters with assigned interactions
   */
  assignInteractionsToCharacters(characters, interactions) {
    console.log('🎯 Assigning tier-scaled interactions to characters...');

    if (!interactions || interactions.length === 0) {
      console.warn('⚠️ No interactions available to assign');
      return characters;
    }

    return characters.map(character => {
      // Skip if character already has interaction assignments
      if (character.assignments?.interactions?.size > 0) {
        console.log(`Character ${character.name} already has ${character.assignments.interactions.size} interaction assignments`);
        return character;
      }

      // Initialize assignments.interactions if it doesn't exist
      if (!character.assignments) {
        character.assignments = {
          nodes: new Set(),
          interactions: new Set(),
          quests: new Set(),
          settlements: new Set(),
          factions: new Set(),
          investments: new Set()
        };
      }

      // Ensure assignments.interactions is a Set
      if (!character.assignments.interactions) {
        character.assignments.interactions = new Set();
      } else if (Array.isArray(character.assignments.interactions)) {
        character.assignments.interactions = new Set(character.assignments.interactions);
      }

      // Filter interactions based on character's LOD tier and profession
      const tierAppropriateInteractions = interactions.filter(interaction => {
        if (!interaction.tierRequirement) {
          // System interactions - available to all
          return interaction.type !== 'content' && interaction.category !== 'work';
        }

        // Work interactions - check profession matching
        if (interaction.category === 'work') {
          const characterProfession = character.demographics?.occupation?.toLowerCase() || '';
          const interactionProfession = interaction.profession?.toLowerCase() || '';

          // Check if character's profession matches the interaction's required profession
          const professionMatch = characterProfession.includes(interactionProfession) ||
                                 interactionProfession.includes(characterProfession) ||
                                 interactionProfession === 'general';

          if (!professionMatch) {
            return false;
          }

          // Also check tier requirements for work interactions
          switch (character.lodTier) {
            case 'background':
              return interaction.tierRequirement === 'background';
            case 'group':
              return ['background', 'group'].includes(interaction.tierRequirement);
            case 'hero':
              return true; // Heroes can access all work interactions
            default:
              return false;
          }
        }

        // Content interactions - check tier requirements
        switch (character.lodTier) {
          case 'background':
            return interaction.tierRequirement === 'background';
          case 'group':
            return ['background', 'group'].includes(interaction.tierRequirement);
          case 'hero':
            return true; // Heroes can access all interactions
          default:
            return false;
        }
      });

      // Determine how many interactions to assign based on tier
      let maxAssignments;
      switch (character.lodTier) {
        case 'background':
          maxAssignments = 1; // Background NPCs get 1 basic interaction
          break;
        case 'group':
          maxAssignments = 2; // Group NPCs get 2 interactions
          break;
        case 'hero':
          maxAssignments = 3; // Hero NPCs get 3 interactions
          break;
        default:
          maxAssignments = 1;
      }

      const numToAssign = Math.min(maxAssignments, tierAppropriateInteractions.length);

      // Separate work and non-work interactions
      const workInteractions = tierAppropriateInteractions.filter(i => i.category === 'work');
      const otherInteractions = tierAppropriateInteractions.filter(i => i.category !== 'work');

      // Prioritize work interactions for characters with matching professions
      let selectedInteractions = [];

      // First, try to assign work interactions if available
      if (workInteractions.length > 0) {
        const shuffledWork = [...workInteractions].sort(() => 0.5 - Math.random());
        const workToAssign = Math.min(1, shuffledWork.length); // Assign at most 1 work interaction
        selectedInteractions.push(...shuffledWork.slice(0, workToAssign));
      }

      // Then fill remaining slots with other interactions
      const remainingSlots = numToAssign - selectedInteractions.length;
      if (remainingSlots > 0 && otherInteractions.length > 0) {
        const shuffledOther = [...otherInteractions].sort(() => 0.5 - Math.random());
        const otherToAssign = Math.min(remainingSlots, shuffledOther.length);
        selectedInteractions.push(...shuffledOther.slice(0, otherToAssign));
      }

      // Assign interactions to character
      selectedInteractions.forEach(interaction => {
        character.assignments.interactions.add(interaction.id);
      });

      console.log(`Assigned ${selectedInteractions.length} interactions to ${character.lodTier} character ${character.name}:`,
        selectedInteractions.map(i => i.name).join(', '));

      return character;
    });
  }

  /**
   * Merge two settlement worlds into one
   */
  async mergeSettlements(settlementA, settlementB) {
    const mergedInteractions = [...(settlementA.interactions || []), ...(settlementB.interactions || [])];
    const mergedCharacters = [...settlementA.characters, ...settlementB.characters];

    // Assign interactions to characters
    const charactersWithInteractions = this.assignInteractionsToCharacters(mergedCharacters, mergedInteractions);

    return {
      turn: 0,
      events: [],
      settlements: [settlementA.settlement, settlementB.settlement],
      characters: charactersWithInteractions,
      nodes: [...settlementA.nodes, ...settlementB.nodes],
      interactions: mergedInteractions,
      relationships: {
        ...oakwoodFederationConfig.relationships,
        ...ironholdDominionConfig.relationships
      }
    };
  }

  /**
   * Initialize multi-settlement quests
   */
  initializeQuests() {
    this.demoResults.quests = multiSettlementQuests.map(quest => ({
      ...quest,
      status: 'active',
      progress: 0,
      startedAt: this.worldState.turn
    }));
  }

  /**
   * Run the demo for specified number of turns
   */
  async runDemo(turns = 25) {
    console.log(`🎮 Running Valley of Echoes Demo for ${turns} turns...`);

    for (let turn = 1; turn <= turns; turn++) {
      console.log(`\n📊 Turn ${turn}/${turns}`);
      const turnStart = performance.now();

      try {
        // Process turn with LOD integration
        const result = await processTurnWithLOD(
          this.worldState,
          this.lodManager,
          this.historyGenerator
        );

        // Update world state
        this.worldState = result.worldState;

        // Record results
        const turnTime = performance.now() - turnStart;
        this.recordTurnResults(turn, result, turnTime);

        // Update quests
        this.updateQuests();

        // Progress reporting
        if (turn % 5 === 0 || turn === turns) {
          this.reportProgress(turn, turns);
        }

      } catch (error) {
        console.error(`❌ Error in turn ${turn}:`, error);
        break;
      }
    }

    console.log('\n🎉 Demo completed!');
    this.generateFinalReport();
  }

  /**
   * Record turn results
   */
  recordTurnResults(turn, result, turnTime) {
    this.demoResults.turns = turn;
    this.demoResults.events.push(...result.turnResults.characterEvents);
    this.demoResults.events.push(...result.turnResults.settlementEvents);
    this.demoResults.events.push(...result.turnResults.crossSettlementEvents);

    this.demoResults.performance.push({
      turn,
      totalTime: result.turnResults.processingTime,
      lodTime: result.turnResults.lodResults.preTurn?.processingTime +
               result.turnResults.lodResults.postTurn?.processingTime,
      characterEvents: result.turnResults.characterEvents.length,
      settlementEvents: result.turnResults.settlementEvents.length,
      crossSettlementEvents: result.turnResults.crossSettlementEvents.length
    });

    // Record settlement states
    this.worldState.settlements.forEach(settlement => {
      this.demoResults.settlements.push({
        turn,
        settlementId: settlement.id,
        needSatisfaction: settlement.needSatisfaction?.current?.overall || 0,
        wealth: settlement.economy?.wealth || 0,
        population: settlement.assignedCharacters?.length || 0
      });
    });
  }

  /**
   * Update quest progress
   */
  updateQuests() {
    // Simple quest progress simulation
    // In a full implementation, this would check actual game state
    this.demoResults.quests.forEach(quest => {
      if (quest.status === 'active' && Math.random() < 0.3) { // 30% chance per turn
        quest.progress += Math.floor(Math.random() * 25) + 5;
        if (quest.progress >= 100) {
          quest.status = 'completed';
          quest.completedAt = this.worldState.turn;
        }
      }
    });
  }

  /**
   * Report progress every 5 turns
   */
  reportProgress(currentTurn, totalTurns) {
    const progress = (currentTurn / totalTurns) * 100;
    const completedQuests = this.demoResults.quests.filter(q => q.status === 'completed').length;
    const totalEvents = this.demoResults.events.length;

    console.log(`📈 Progress: ${progress.toFixed(1)}% (${currentTurn}/${totalTurns} turns)`);
    console.log(`   Events: ${totalEvents}`);
    console.log(`   Completed Quests: ${completedQuests}/${this.demoResults.quests.length}`);

    // LOD status
    const characters = this.worldState.characters;
    const heroCount = characters.filter(c => c.lodTier === 'hero').length;
    const groupCount = characters.filter(c => c.lodTier === 'group').length;
    const backgroundCount = characters.filter(c => c.lodTier === 'background').length;

    console.log(`   LOD: ${heroCount}H / ${groupCount}G / ${backgroundCount}B`);

    // Performance
    const recentPerf = this.demoResults.performance.slice(-5);
    if (recentPerf.length > 0) {
      const avgTime = recentPerf.reduce((sum, p) => sum + p.totalTime, 0) / recentPerf.length;
      console.log(`   Avg Turn Time: ${avgTime.toFixed(2)}ms`);
    }
  }

  /**
   * Generate final demo report
   */
  generateFinalReport() {
    console.log('\n📊 Valley of Echoes Demo - Final Report');
    console.log('='.repeat(50));

    // Performance Summary
    const totalTime = this.demoResults.performance.reduce((sum, p) => sum + p.totalTime, 0);
    const avgTurnTime = totalTime / this.demoResults.turns;
    const maxTurnTime = Math.max(...this.demoResults.performance.map(p => p.totalTime));

    console.log('🎯 Performance:');
    console.log(`   Total Turns: ${this.demoResults.turns}`);
    console.log(`   Total Time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`   Average Turn: ${avgTurnTime.toFixed(2)}ms`);
    console.log(`   Max Turn: ${maxTurnTime.toFixed(2)}ms`);
    console.log(`   Target Met: ${avgTurnTime < 2000 ? '✅' : '❌'} (<2s per turn)`);

    // Event Summary
    const eventTypes = {};
    this.demoResults.events.forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });

    console.log('\n📝 Events Generated:');
    Object.entries(eventTypes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

    // Quest Summary
    const completedQuests = this.demoResults.quests.filter(q => q.status === 'completed');
    console.log('\n🏆 Quest Completion:');
    console.log(`   Completed: ${completedQuests.length}/${this.demoResults.quests.length}`);
    completedQuests.forEach(quest => {
      console.log(`   ✅ ${quest.title} (Turn ${quest.completedAt})`);
    });

    // Settlement Summary
    console.log('\n🏛️ Final Settlement States:');
    const finalStates = {};
    this.demoResults.settlements
      .filter(s => s.turn === this.demoResults.turns)
      .forEach(state => {
        finalStates[state.settlementId] = state;
      });

    Object.values(finalStates).forEach(state => {
      console.log(`   ${state.settlementId}:`);
      console.log(`     Satisfaction: ${(state.needSatisfaction * 100).toFixed(1)}%`);
      console.log(`     Population: ${state.population}`);
    });

    // LOD Final State
    const finalCharacters = this.worldState.characters;
    const finalLOD = {
      hero: finalCharacters.filter(c => c.lodTier === 'hero').length,
      group: finalCharacters.filter(c => c.lodTier === 'group').length,
      background: finalCharacters.filter(c => c.lodTier === 'background').length
    };

    console.log('\n🎯 Final LOD Distribution:');
    console.log(`   Hero NPCs: ${finalLOD.hero}`);
    console.log(`   Population Groups: ${finalLOD.group}`);
    console.log(`   Background: ${finalLOD.background}`);

    console.log('\n🎉 Valley of Echoes Demo Complete!');
  }

  /**
   * Get demo results
   */
  getResults() {
    return {
      ...this.demoResults,
      worldState: this.worldState
    };
  }
}

/**
 * Run the Valley of Echoes demo
 */
async function runValleyOfEchoesDemo(turns = 25) {
  const demo = new ValleyOfEchoesDemo();

  try {
    await demo.initializeDemo();
    await demo.runDemo(turns);
    return demo.getResults();
  } catch (error) {
    console.error('Demo failed:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  const turns = parseInt(process.argv[2]) || 25;
  runValleyOfEchoesDemo(turns).catch(console.error);
}

module.exports = { ValleyOfEchoesDemo, runValleyOfEchoesDemo };