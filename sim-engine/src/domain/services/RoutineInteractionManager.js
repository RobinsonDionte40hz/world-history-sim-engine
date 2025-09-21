/**
 * RoutineInteractionManager
 *
 * Manages routine interactions that represent daily activities like work, socializing,
 * commerce, and commuting. These sit between system interactions and content interactions.
 */

const { ContentInteraction } = require('../entities/interactions/ContentInteraction.js');

class RoutineInteractionManager {
  constructor() {
    this.routineGenerators = new Map();
    this.timeOfDaySchedule = new Map();
    this._initializeGenerators();
    this._initializeTimeSchedule();
  }

  /**
   * Initialize routine interaction generators
   * @private
   */
  _initializeGenerators() {
    this.routineGenerators.set('work', this._generateWorkInteractions.bind(this));
    this.routineGenerators.set('social', this._generateSocialInteractions.bind(this));
    this.routineGenerators.set('commerce', this._generateCommerceInteractions.bind(this));
    this.routineGenerators.set('commute', this._generateCommuteInteractions.bind(this));
  }

  /**
   * Initialize time-based schedule mapping
   * @private
   */
  _initializeTimeSchedule() {
    this.timeOfDaySchedule.set('morning', ['commute', 'work']);
    this.timeOfDaySchedule.set('midday', ['work', 'commerce', 'social']);
    this.timeOfDaySchedule.set('night', ['commute', 'social', 'commerce', 'rest']);
  }

  /**
   * Get time of day from world time
   * @param {number} worldTime - Current world time in ticks
   * @returns {string} Time of day: 'morning', 'midday', 'night'
   */
  getTimeOfDay(worldTime) {
    // 3 ticks per day for demo schedule (each turn = 8 hours)
    const ticksPerDay = 3;
    const hourOfDay = (worldTime % ticksPerDay);

    if (hourOfDay === 0) return 'morning';   // Turn 0 = Morning
    if (hourOfDay === 1) return 'midday';    // Turn 1 = Midday
    return 'night';  // Turn 2 = Night
  }

  /**
   * Generate routine interactions for a character based on their context
   * @param {Object} character - Character object
   * @param {Object} worldState - Current world state
   * @param {string} timeOfDay - Current time of day
   * @returns {Array} Array of routine interaction objects
   */
  generateRoutineInteractions(character, worldState, timeOfDay) {
    const interactions = [];
    const availableRoutines = this.timeOfDaySchedule.get(timeOfDay) || [];

    // Generate interactions for each available routine type
    availableRoutines.forEach(routineType => {
      const generator = this.routineGenerators.get(routineType);
      if (generator) {
        const routineInteractions = generator(character, worldState, timeOfDay);
        interactions.push(...routineInteractions);
      }
    });

    return interactions;
  }

  /**
   * Generate work-related routine interactions
   * @private
   * @param {Object} character - Character object
   * @param {Object} worldState - Current world state
   * @param {string} timeOfDay - Current time of day
   * @returns {Array} Work interaction objects
   */
  _generateWorkInteractions(character, worldState, timeOfDay) {
    const interactions = [];

    // Only generate work interactions during work hours and if character has work assignment
    if (!this._isWorkTime(timeOfDay) || !character.assignments?.workNodeId) {
      return interactions;
    }

    const workNode = worldState.nodes?.get(character.assignments.workNodeId);

    if (!workNode) return interactions;

    // Check prerequisites based on LOD tier
    const energyRequired = character.lodTier === 'hero' ? 30 : character.lodTier === 'group' ? 25 : 20;
    if (character.energy < energyRequired) {
      return interactions; // Not enough energy for work
    }

    // Generate appropriate work interaction based on LOD tier
    if (character.lodTier === 'background') {
      // Simple work interaction for background NPCs
      interactions.push(new ContentInteraction({
        id: `work_${character.id}_${Date.now()}`,
        name: 'Work',
        type: 'work',
        category: 'routine',
        description: `Perform daily work duties at ${workNode.name}`,
        requirements: [{ attr: 'constitution', min: 8 }],
        branches: [{
          id: `work_success_${character.id}`,
          name: 'Work Successfully',
          effects: [
            { type: 'resource', target: 'wealth', value: 5 },
            { type: 'attribute', target: 'constitution', value: 1 }
          ]
        }],
        effects: [],
        cooldown: 12,
        repeatable: true,
        tags: ['work', 'labor', workNode.type || 'general']
      }));
    } else if (character.lodTier === 'group') {
      // Specialized work interaction for group NPCs
      const workType = this._getWorkTypeFromNode(workNode);
      interactions.push(new ContentInteraction({
        id: `specialized_work_${character.id}_${Date.now()}`,
        name: `${workType.charAt(0).toUpperCase() + workType.slice(1)} Work`,
        type: 'work',
        category: 'routine',
        description: `Perform specialized ${workType} work at ${workNode.name}`,
        requirements: [{ attr: 'constitution', min: 10 }],
        branches: [{
          id: `specialized_work_success_${character.id}`,
          name: 'Work Successfully',
          effects: [
            { type: 'resource', target: 'wealth', value: 8 },
            { type: 'attribute', target: 'constitution', value: 1 },
            { type: 'resource', target: 'experience', value: 3 }
          ]
        }],
        effects: [],
        cooldown: 12,
        repeatable: true,
        tags: ['work', 'specialized', workType]
      }));
    } else if (character.lodTier === 'hero') {
      // Complex work interaction for hero NPCs
      const workType = this._getWorkTypeFromNode(workNode);
      interactions.push(new ContentInteraction({
        id: `leadership_work_${character.id}_${Date.now()}`,
        name: `Lead ${workType.charAt(0).toUpperCase() + workType.slice(1)} Operations`,
        type: 'work',
        category: 'routine',
        description: `Lead and manage ${workType} operations at ${workNode.name}`,
        requirements: [{ attr: 'charisma', min: 12 }],
        branches: [
          {
            id: `leadership_work_excellent_${character.id}`,
            name: 'Excellent Leadership',
            condition: (char) => char.attributes?.charisma?.score >= 15,
            effects: [
              { type: 'resource', target: 'wealth', value: 15 },
              { type: 'attribute', target: 'charisma', value: 1 },
              { type: 'resource', target: 'reputation', value: 2 }
            ]
          },
          {
            id: `leadership_work_good_${character.id}`,
            name: 'Good Leadership',
            effects: [
              { type: 'resource', target: 'wealth', value: 10 },
              { type: 'attribute', target: 'charisma', value: 1 }
            ]
          }
        ],
        effects: [],
        cooldown: 12,
        repeatable: true,
        tags: ['work', 'leadership', workType]
      }));
    }

    return interactions;
  }

  /**
   * Generate social routine interactions
   * @private
   * @param {Object} character - Character object
   * @param {Object} worldState - Current world state
   * @param {string} timeOfDay - Current time of day
   * @returns {Array} Social interaction objects
   */
  _generateSocialInteractions(character, worldState, timeOfDay) {
    const interactions = [];

    // Social interactions are available in night and sometimes midday
    if (!['midday', 'night'].includes(timeOfDay)) {
      return interactions;
    }

    const currentNode = worldState.nodes?.get(character.currentNodeId);
    if (!currentNode) return interactions;

    // Check if there are other characters at the same location
    const charactersAtLocation = Array.from(worldState.characters?.values() || [])
      .filter(c => c.currentNodeId === character.currentNodeId && c.id !== character.id);

    if (charactersAtLocation.length === 0) return interactions;

    // Generate social interaction based on LOD tier
    if (character.lodTier === 'background') {
      interactions.push(new ContentInteraction({
        id: `socialize_${character.id}_${Date.now()}`,
        name: 'Socialize',
        type: 'social',
        category: 'routine',
        description: `Chat with others at ${currentNode.name}`,
        requirements: [{ attr: 'charisma', min: 8 }],
        branches: [{
          id: `socialize_success_${character.id}`,
          name: 'Have a Nice Chat',
          effects: [
            { type: 'resource', target: 'mood', value: 5 },
            { type: 'attribute', target: 'charisma', value: 1 }
          ]
        }],
        effects: [],
        cooldown: 6,
        repeatable: true,
        tags: ['social', 'casual']
      }));
    } else if (character.lodTier === 'group') {
      interactions.push(new ContentInteraction({
        id: `network_${character.id}_${Date.now()}`,
        name: 'Network',
        type: 'social',
        category: 'routine',
        description: `Network and build relationships at ${currentNode.name}`,
        requirements: [{ attr: 'charisma', min: 10 }],
        branches: [{
          id: `network_success_${character.id}`,
          name: 'Build Useful Connections',
          effects: [
            { type: 'resource', target: 'mood', value: 8 },
            { type: 'attribute', target: 'charisma', value: 1 },
            { type: 'resource', target: 'contacts', value: 1 }
          ]
        }],
        effects: [],
        cooldown: 8,
        repeatable: true,
        tags: ['social', 'networking']
      }));
    } else if (character.lodTier === 'hero') {
      interactions.push(new ContentInteraction({
        id: `negotiate_${character.id}_${Date.now()}`,
        name: 'Negotiate Alliances',
        type: 'social',
        category: 'routine',
        description: `Negotiate alliances and agreements at ${currentNode.name}`,
        requirements: [{ attr: 'charisma', min: 12 }],
        branches: [
          {
            id: `negotiate_success_${character.id}`,
            name: 'Successful Negotiation',
            condition: (char) => char.attributes?.charisma?.score >= 14,
            effects: [
              { type: 'attribute', target: 'charisma', value: 1 },
              { type: 'resource', target: 'influence', value: 5 },
              { type: 'resource', target: 'reputation', value: 2 }
            ]
          },
          {
            id: `negotiate_partial_${character.id}`,
            name: 'Partial Success',
            effects: [
              { type: 'resource', target: 'influence', value: 2 }
            ]
          }
        ],
        effects: [],
        cooldown: 24, // 24 ticks cooldown
        repeatable: false,
        tags: ['social', 'diplomacy', 'negotiation']
      }));
    }

    return interactions;
  }

  /**
   * Generate commerce routine interactions
   * @private
   * @param {Object} character - Character object
   * @param {Object} worldState - Current world state
   * @param {string} timeOfDay - Current time of day
   * @returns {Array} Commerce interaction objects
   */
  _generateCommerceInteractions(character, worldState, timeOfDay) {
    const interactions = [];

    // Commerce interactions are available during business hours
    if (!['midday', 'night'].includes(timeOfDay)) {
      return interactions;
    }

    const currentNode = worldState.nodes?.get(character.currentNodeId);
    if (!currentNode) return interactions;

    // Only generate commerce interactions at commercial nodes
    if (!this._isCommercialNode(currentNode)) return interactions;

    // Check prerequisites based on LOD tier
    const wealthRequired = character.lodTier === 'hero' ? 50 : character.lodTier === 'group' ? 20 : 10;
    const energyRequired = character.lodTier === 'hero' ? 15 : character.lodTier === 'group' ? 10 : 5;

    if (character.wealth < wealthRequired || character.energy < energyRequired) {
      return interactions; // Not enough wealth or energy for commerce
    }

    // Generate commerce interaction based on LOD tier
    if (character.lodTier === 'background') {
      interactions.push(new ContentInteraction({
        id: `buy_goods_${character.id}_${Date.now()}`,
        name: 'Buy Goods',
        type: 'commerce',
        category: 'routine',
        description: `Purchase daily necessities at ${currentNode.name}`,
        requirements: [{ attr: 'constitution', min: 8 }],
        branches: [{
          id: `buy_goods_success_${character.id}`,
          name: 'Purchase Successfully',
          effects: [
            { type: 'resource', target: 'wealth', value: -8 },
            { type: 'resource', target: 'supplies', value: 5 },
            { type: 'resource', target: 'satisfaction', value: 3 }
          ]
        }],
        effects: [],
        cooldown: 12,
        repeatable: true,
        tags: ['commerce', 'shopping']
      }));
    } else if (character.lodTier === 'group') {
      interactions.push(new ContentInteraction({
        id: `trade_goods_${character.id}_${Date.now()}`,
        name: 'Trade Goods',
        type: 'commerce',
        category: 'routine',
        description: `Trade goods and conduct business at ${currentNode.name}`,
        requirements: [{ attr: 'charisma', min: 10 }],
        branches: [{
          id: `trade_goods_success_${character.id}`,
          name: 'Successful Trade',
          effects: [
            { type: 'resource', target: 'wealth', value: -15 },
            { type: 'resource', target: 'supplies', value: 8 },
            { type: 'resource', target: 'satisfaction', value: 5 },
            { type: 'resource', target: 'contacts', value: 1 }
          ]
        }],
        effects: [],
        cooldown: 12,
        repeatable: true,
        tags: ['commerce', 'trading']
      }));
    } else if (character.lodTier === 'hero') {
      interactions.push(new ContentInteraction({
        id: `invest_business_${character.id}_${Date.now()}`,
        name: 'Invest in Business',
        type: 'commerce',
        category: 'routine',
        description: `Make strategic business investments at ${currentNode.name}`,
        requirements: [{ attr: 'intelligence', min: 13 }],
        branches: [
          {
            id: `invest_success_${character.id}`,
            name: 'Investment Pays Off',
            condition: (char) => char.attributes?.intelligence?.score >= 15,
            effects: [
              { type: 'resource', target: 'wealth', value: -40 },
              { type: 'resource', target: 'investment_returns', value: 60 },
              { type: 'resource', target: 'reputation', value: 2 }
            ]
          },
          {
            id: `invest_conservative_${character.id}`,
            name: 'Conservative Investment',
            effects: [
              { type: 'resource', target: 'wealth', value: -30 },
              { type: 'resource', target: 'investment_returns', value: 35 },
              { type: 'resource', target: 'contacts', value: 2 }
            ]
          }
        ],
        effects: [],
        cooldown: 24,
        repeatable: true,
        tags: ['commerce', 'investment']
      }));
    }

    return interactions;
  }

  /**
   * Generate commute routine interactions
   * @private
   * @param {Object} character - Character object
   * @param {Object} worldState - Current world state
   * @param {string} timeOfDay - Current time of day
   * @returns {Array} Commute interaction objects
   */
  _generateCommuteInteractions(character, worldState, timeOfDay) {
    const interactions = [];

    // Only generate commute interactions during commute times
    if (!this._isCommuteTime(timeOfDay)) {
      return interactions;
    }

    // Check if character has home and work assignments
    if (!character.assignments?.homeNodeId || !character.assignments?.workNodeId) {
      return interactions;
    }

    const currentNodeId = character.currentNodeId;
    const homeNodeId = character.assignments.homeNodeId;
    const workNodeId = character.assignments.workNodeId;

    // Determine destination based on time of day
    let destinationNodeId, commuteType;

    if (timeOfDay === 'morning' && currentNodeId === homeNodeId) {
      // Morning commute to work
      destinationNodeId = workNodeId;
      commuteType = 'to_work';
    } else if (timeOfDay === 'night' && currentNodeId === workNodeId) {
      // Night commute home
      destinationNodeId = homeNodeId;
      commuteType = 'to_home';
    } else {
      return interactions; // Not in a position to commute
    }

    const destinationNode = worldState.nodes?.get(destinationNodeId);
    if (!destinationNode) return interactions;

    // Generate commute interaction
    interactions.push(new ContentInteraction({
      id: `commute_${commuteType}_${character.id}_${Date.now()}`,
      name: `Commute ${commuteType === 'to_work' ? 'to Work' : 'Home'}`,
      type: 'commute',
      category: 'routine',
      description: `Travel ${commuteType === 'to_work' ? 'to work' : 'home'} at ${destinationNode.name}`,
      requirements: [{ attr: 'constitution', min: 8 }],
      branches: [{
        id: `commute_success_${character.id}`,
        name: 'Arrive Safely',
        effects: [
          { type: 'resource', target: 'current_location', value: destinationNodeId }
        ]
      }],
      effects: [],
      cooldown: 1,
      repeatable: true,
      tags: ['commute', commuteType]
    }));

    return interactions;
  }

  /**
   * Check if current time is work time
   * @private
   * @param {string} timeOfDay - Current time of day
   * @returns {boolean} True if work time
   */
  _isWorkTime(timeOfDay) {
    return ['morning', 'midday'].includes(timeOfDay);
  }

  /**
   * Check if current time is commute time
   * @private
   * @param {string} timeOfDay - Current time of day
   * @returns {boolean} True if commute time
   */
  _isCommuteTime(timeOfDay) {
    return ['morning', 'night'].includes(timeOfDay);
  }

  /**
   * Check if node is commercial
   * @private
   * @param {Object} node - Node object
   * @returns {boolean} True if commercial node
   */
  _isCommercialNode(node) {
    return node.type === 'market' || node.type === 'commercial' || node.type === 'economic' ||
           node.name.toLowerCase().includes('market') ||
           node.name.toLowerCase().includes('shop') ||
           node.name.toLowerCase().includes('merchant');
  }

  /**
   * Get work type from node
   * @private
   * @param {Object} node - Node object
   * @returns {string} Work type
   */
  _getWorkTypeFromNode(node) {
    const nodeName = node.name.toLowerCase();
    const nodeType = node.type?.toLowerCase() || '';

    if (nodeName.includes('farm') || nodeType.includes('farm')) return 'farming';
    if (nodeName.includes('smith') || nodeType.includes('smith')) return 'smithing';
    if (nodeName.includes('merchant') || nodeType.includes('merchant')) return 'trading';
    if (nodeName.includes('tavern') || nodeType.includes('tavern')) return 'hospitality';
    if (nodeName.includes('guard') || nodeType.includes('guard')) return 'security';
    if (nodeName.includes('admin') || nodeType.includes('admin')) return 'administration';

    return 'general';
  }
}

module.exports = RoutineInteractionManager;