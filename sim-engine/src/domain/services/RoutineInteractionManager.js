/**
 * RoutineInteractionManager
 *
 * Manages routine interactions that represent daily activities like work, socializing,
 * commerce, and commuting. These sit between system interactions and content interactions.
 */

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
    this.timeOfDaySchedule.set('afternoon', ['work', 'commerce']);
    this.timeOfDaySchedule.set('evening', ['commute', 'social', 'commerce']);
    this.timeOfDaySchedule.set('night', ['rest']);
  }

  /**
   * Get time of day from world time
   * @param {number} worldTime - Current world time in ticks
   * @returns {string} Time of day: 'morning', 'midday', 'afternoon', 'evening', 'night'
   */
  getTimeOfDay(worldTime) {
    // Assuming 24 ticks per day, 6 ticks per time period
    const ticksPerDay = 24;
    const hourOfDay = (worldTime % ticksPerDay);

    if (hourOfDay >= 6 && hourOfDay < 12) return 'morning';
    if (hourOfDay >= 12 && hourOfDay < 15) return 'midday';
    if (hourOfDay >= 15 && hourOfDay < 18) return 'afternoon';
    if (hourOfDay >= 18 && hourOfDay < 22) return 'evening';
    return 'night';
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
      interactions.push({
        id: `work_${character.id}_${Date.now()}`,
        name: 'Work',
        type: 'work',
        category: 'routine',
        description: `Perform daily work duties at ${workNode.name}`,
        requirements: { energy: 20 },
        branches: [{
          id: `work_success_${character.id}`,
          name: 'Work Successfully',
          conditions: [],
          effects: [
            { type: 'energy', value: -15 },
            { type: 'wealth', value: 5 },
            { type: 'experience', value: 2 }
          ]
        }],
        effects: [],
        context: {
          duration: 4,
          workType: workNode.type || 'general',
          location: character.assignments.workNodeId
        },
        assignedCharacterIds: [character.id],
        availableWhen: {
          timeOfDay: ['morning', 'midday', 'afternoon'],
          atLocation: character.assignments.workNodeId,
          energyRequired: 20
        }
      });
    } else if (character.lodTier === 'group') {
      // Specialized work interaction for group NPCs
      const workType = this._getWorkTypeFromNode(workNode);
      interactions.push({
        id: `specialized_work_${character.id}_${Date.now()}`,
        name: `${workType} Work`,
        type: 'work',
        category: 'routine',
        description: `Perform specialized ${workType} work at ${workNode.name}`,
        requirements: { energy: 25 },
        branches: [{
          id: `specialized_work_success_${character.id}`,
          name: 'Work Successfully',
          conditions: [],
          effects: [
            { type: 'energy', value: -20 },
            { type: 'wealth', value: 8 },
            { type: 'experience', value: 3 },
            { type: 'skill', skill: workType, value: 1 }
          ]
        }],
        effects: [],
        context: {
          duration: 6,
          workType: workType,
          location: character.assignments.workNodeId
        },
        assignedCharacterIds: [character.id],
        availableWhen: {
          timeOfDay: ['morning', 'midday', 'afternoon'],
          atLocation: character.assignments.workNodeId,
          energyRequired: 25
        }
      });
    } else if (character.lodTier === 'hero') {
      // Complex work interaction for hero NPCs
      const workType = this._getWorkTypeFromNode(workNode);
      interactions.push({
        id: `leadership_work_${character.id}_${Date.now()}`,
        name: `Lead ${workType} Operations`,
        type: 'work',
        category: 'routine',
        description: `Lead and manage ${workType} operations at ${workNode.name}`,
        requirements: { energy: 30 },
        branches: [
          {
            id: `leadership_work_excellent_${character.id}`,
            name: 'Excellent Leadership',
            conditions: [{ type: 'attribute', attribute: 'charisma', minimum: 15 }],
            effects: [
              { type: 'energy', value: -25 },
              { type: 'wealth', value: 15 },
              { type: 'experience', value: 5 },
              { type: 'reputation', value: 2 },
              { type: 'settlement_influence', value: 1 }
            ]
          },
          {
            id: `leadership_work_good_${character.id}`,
            name: 'Good Leadership',
            conditions: [],
            effects: [
              { type: 'energy', value: -20 },
              { type: 'wealth', value: 10 },
              { type: 'experience', value: 4 }
            ]
          }
        ],
        effects: [],
        context: {
          duration: 8,
          workType: workType,
          leadership: true,
          location: character.assignments.workNodeId
        },
        assignedCharacterIds: [character.id],
        availableWhen: {
          timeOfDay: ['morning', 'midday', 'afternoon'],
          atLocation: character.assignments.workNodeId,
          energyRequired: 30
        }
      });
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

    // Social interactions are available in evening and sometimes midday
    if (!['midday', 'evening'].includes(timeOfDay)) {
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
      interactions.push({
        id: `socialize_${character.id}_${Date.now()}`,
        name: 'Socialize',
        type: 'social',
        category: 'routine',
        description: `Chat with others at ${currentNode.name}`,
        requirements: { energy: 10 },
        branches: [{
          id: `socialize_success_${character.id}`,
          name: 'Have a Nice Chat',
          conditions: [],
          effects: [
            { type: 'energy', value: -5 },
            { type: 'mood', value: 5 },
            { type: 'social_bond', value: 1 }
          ]
        }],
        effects: [],
        context: {
          duration: 2,
          socialType: 'casual',
          participants: charactersAtLocation.length + 1
        },
        assignedCharacterIds: [character.id],
        availableWhen: {
          timeOfDay: ['midday', 'evening'],
          othersPresent: true,
          energyRequired: 10
        }
      });
    } else if (character.lodTier === 'group') {
      interactions.push({
        id: `network_${character.id}_${Date.now()}`,
        name: 'Network',
        type: 'social',
        category: 'routine',
        description: `Network and build relationships at ${currentNode.name}`,
        requirements: { energy: 15 },
        branches: [{
          id: `network_success_${character.id}`,
          name: 'Build Useful Connections',
          conditions: [],
          effects: [
            { type: 'energy', value: -10 },
            { type: 'mood', value: 8 },
            { type: 'social_bond', value: 2 },
            { type: 'contacts', value: 1 }
          ]
        }],
        effects: [],
        context: {
          duration: 3,
          socialType: 'networking',
          participants: charactersAtLocation.length + 1
        },
        assignedCharacterIds: [character.id],
        availableWhen: {
          timeOfDay: ['midday', 'evening'],
          othersPresent: true,
          energyRequired: 15
        }
      });
    } else if (character.lodTier === 'hero') {
      interactions.push({
        id: `negotiate_${character.id}_${Date.now()}`,
        name: 'Negotiate Alliances',
        type: 'social',
        category: 'routine',
        description: `Negotiate alliances and agreements at ${currentNode.name}`,
        requirements: { energy: 20 },
        branches: [
          {
            id: `negotiate_success_${character.id}`,
            name: 'Successful Negotiation',
            conditions: [{ type: 'attribute', attribute: 'charisma', minimum: 14 }],
            effects: [
              { type: 'energy', value: -15 },
              { type: 'mood', value: 10 },
              { type: 'social_bond', value: 3 },
              { type: 'alliance', value: 1 },
              { type: 'reputation', value: 1 }
            ]
          },
          {
            id: `negotiate_partial_${character.id}`,
            name: 'Partial Success',
            conditions: [],
            effects: [
              { type: 'energy', value: -12 },
              { type: 'mood', value: 5 },
              { type: 'social_bond', value: 2 }
            ]
          }
        ],
        effects: [],
        context: {
          duration: 4,
          socialType: 'negotiation',
          participants: charactersAtLocation.length + 1
        },
        assignedCharacterIds: [character.id],
        availableWhen: {
          timeOfDay: ['midday', 'evening'],
          othersPresent: true,
          energyRequired: 20
        }
      });
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
    if (!['midday', 'afternoon', 'evening'].includes(timeOfDay)) {
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
      interactions.push({
        id: `buy_goods_${character.id}_${Date.now()}`,
        name: 'Buy Goods',
        type: 'commerce',
        category: 'routine',
        description: `Purchase daily necessities at ${currentNode.name}`,
        requirements: { wealth: 10, energy: 5 },
        branches: [{
          id: `buy_goods_success_${character.id}`,
          name: 'Purchase Successfully',
          conditions: [],
          effects: [
            { type: 'wealth', value: -8 },
            { type: 'energy', value: -2 },
            { type: 'supplies', value: 5 },
            { type: 'satisfaction', value: 3 }
          ]
        }],
        effects: [],
        context: {
          duration: 1,
          commerceType: 'shopping',
          location: character.currentNodeId
        },
        assignedCharacterIds: [character.id],
        availableWhen: {
          timeOfDay: ['midday', 'afternoon', 'evening'],
          atCommercialNode: true,
          wealthRequired: 10,
          energyRequired: 5
        }
      });
    } else if (character.lodTier === 'group') {
      interactions.push({
        id: `trade_goods_${character.id}_${Date.now()}`,
        name: 'Trade Goods',
        type: 'commerce',
        category: 'routine',
        description: `Trade goods and conduct business at ${currentNode.name}`,
        requirements: { wealth: 20, energy: 10 },
        branches: [{
          id: `trade_goods_success_${character.id}`,
          name: 'Successful Trade',
          conditions: [],
          effects: [
            { type: 'wealth', value: -15 },
            { type: 'energy', value: -5 },
            { type: 'supplies', value: 8 },
            { type: 'satisfaction', value: 5 },
            { type: 'business_contacts', value: 1 }
          ]
        }],
        effects: [],
        context: {
          duration: 2,
          commerceType: 'trading',
          location: character.currentNodeId
        },
        assignedCharacterIds: [character.id],
        availableWhen: {
          timeOfDay: ['midday', 'afternoon', 'evening'],
          atCommercialNode: true,
          wealthRequired: 20,
          energyRequired: 10
        }
      });
    } else if (character.lodTier === 'hero') {
      interactions.push({
        id: `invest_business_${character.id}_${Date.now()}`,
        name: 'Invest in Business',
        type: 'commerce',
        category: 'routine',
        description: `Make strategic business investments at ${currentNode.name}`,
        requirements: { wealth: 50, energy: 15 },
        branches: [
          {
            id: `invest_success_${character.id}`,
            name: 'Investment Pays Off',
            conditions: [{ type: 'attribute', attribute: 'intelligence', minimum: 13 }],
            effects: [
              { type: 'wealth', value: -40 },
              { type: 'energy', value: -10 },
              { type: 'investment_returns', value: 60 },
              { type: 'business_empire', value: 1 },
              { type: 'reputation', value: 2 }
            ]
          },
          {
            id: `invest_conservative_${character.id}`,
            name: 'Conservative Investment',
            conditions: [],
            effects: [
              { type: 'wealth', value: -30 },
              { type: 'energy', value: -8 },
              { type: 'investment_returns', value: 35 },
              { type: 'business_contacts', value: 2 }
            ]
          }
        ],
        effects: [],
        context: {
          duration: 3,
          commerceType: 'investment',
          location: character.currentNodeId
        },
        assignedCharacterIds: [character.id],
        availableWhen: {
          timeOfDay: ['midday', 'afternoon', 'evening'],
          atCommercialNode: true,
          wealthRequired: 50,
          energyRequired: 15
        }
      });
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
    } else if (timeOfDay === 'evening' && currentNodeId === workNodeId) {
      // Evening commute home
      destinationNodeId = homeNodeId;
      commuteType = 'to_home';
    } else {
      return interactions; // Not in a position to commute
    }

    const destinationNode = worldState.nodes?.get(destinationNodeId);
    if (!destinationNode) return interactions;

    // Generate commute interaction
    interactions.push({
      id: `commute_${commuteType}_${character.id}_${Date.now()}`,
      name: `Commute ${commuteType === 'to_work' ? 'to Work' : 'Home'}`,
      type: 'commute',
      category: 'routine',
      description: `Travel ${commuteType === 'to_work' ? 'to work' : 'home'} at ${destinationNode.name}`,
      requirements: { energy: 10 },
      branches: [{
        id: `commute_success_${character.id}`,
        name: 'Arrive Safely',
        conditions: [],
        effects: [
          { type: 'energy', value: -8 },
          { type: 'current_location', value: destinationNodeId },
          { type: 'commute_completed', value: 1 }
        ]
      }],
      effects: [],
      context: {
        duration: 2,
        commuteType: commuteType,
        destination: destinationNodeId,
        origin: currentNodeId
      },
      assignedCharacterIds: [character.id],
      availableWhen: {
        timeOfDay: timeOfDay,
        atOrigin: currentNodeId,
        destinationExists: destinationNodeId,
        energyRequired: 10
      }
    });

    return interactions;
  }

  /**
   * Check if current time is work time
   * @private
   * @param {string} timeOfDay - Current time of day
   * @returns {boolean} True if work time
   */
  _isWorkTime(timeOfDay) {
    return ['morning', 'midday', 'afternoon'].includes(timeOfDay);
  }

  /**
   * Check if current time is commute time
   * @private
   * @param {string} timeOfDay - Current time of day
   * @returns {boolean} True if commute time
   */
  _isCommuteTime(timeOfDay) {
    return ['morning', 'evening'].includes(timeOfDay);
  }

  /**
   * Check if node is commercial
   * @private
   * @param {Object} node - Node object
   * @returns {boolean} True if commercial node
   */
  _isCommercialNode(node) {
    return node.type === 'market' || node.type === 'commercial' ||
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