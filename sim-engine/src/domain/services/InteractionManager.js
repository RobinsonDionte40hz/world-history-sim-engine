import InteractionFactory from '../entities/interactions/InteractionFactory.js';

/**
 * InteractionManager - Service to coordinate interaction types and provide unified access
 *
 * This service manages both system and content interactions, providing:
 * - Dynamic generation of system interactions based on character state
 * - Unified access to all available interactions
 * - Priority-based sorting and filtering
 * - Separation between system and content interactions
 */
class InteractionManager {
  /**
   * Creates a new InteractionManager instance
   * @param {Object} config - Configuration options
   * @param {boolean} config.enableSystemInteractions - Whether to generate system interactions (default: true)
   * @param {boolean} config.enableContentInteractions - Whether to include content interactions (default: true)
   */
  constructor(config = {}) {
    this.enableSystemInteractions = config.enableSystemInteractions !== false;
    this.enableContentInteractions = config.enableContentInteractions !== false;
    this.systemInteractionGenerators = new Map();
    this._initializeSystemInteractionGenerators();
  }

  /**
   * Initialize the system interaction generators
   * @private
   */
  _initializeSystemInteractionGenerators() {
    // Register system interaction generators based on character state
    this.systemInteractionGenerators.set('rest', this._generateRestInteractions.bind(this));
    this.systemInteractionGenerators.set('wait', this._generateWaitInteractions.bind(this));
    this.systemInteractionGenerators.set('examine', this._generateExamineInteractions.bind(this));
    this.systemInteractionGenerators.set('movement', this._generateMovementInteractions.bind(this));
    this.systemInteractionGenerators.set('perception', this._generatePerceptionInteractions.bind(this));
  }

  /**
   * Gets all available interactions for a character in the current context
   * @param {Object} context - Execution context
   * @param {Character} context.character - The character to get interactions for
   * @param {World} context.world - The current world state
   * @param {Node} context.currentNode - The character's current node
   * @param {Object} options - Additional options
   * @returns {Object} Object containing systemInteractions and contentInteractions arrays
   */
  getAvailableInteractions({ character, world, currentNode }, options = {}) {
    const result = {
      systemInteractions: [],
      contentInteractions: [],
      allInteractions: []
    };

    // Generate system interactions
    if (this.enableSystemInteractions) {
      result.systemInteractions = this._generateSystemInteractions({ character, world, currentNode }, options);
    }

    // Get content interactions from current node
    if (this.enableContentInteractions && currentNode) {
      result.contentInteractions = this._getContentInteractions({ character, world, currentNode }, options);
    }

    // Combine all interactions
    result.allInteractions = [...result.systemInteractions, ...result.contentInteractions];

    // Apply priority-based sorting
    this._sortInteractionsByPriority(result);

    return result;
  }

  /**
   * Generates system interactions based on character state and environment
   * @param {Object} context - Execution context
   * @param {Object} options - Generation options
   * @returns {SystemInteraction[]} Array of generated system interactions
   * @private
   */
  _generateSystemInteractions({ character, world, currentNode }, options) {
    const systemInteractions = [];

    // Generate interactions for each registered type
    for (const [type, generator] of this.systemInteractionGenerators) {
      try {
        const interactions = generator({ character, world, currentNode }, options);
        if (Array.isArray(interactions)) {
          systemInteractions.push(...interactions);
        } else if (interactions) {
          systemInteractions.push(interactions);
        }
      } catch (error) {
        console.warn(`Failed to generate ${type} interactions:`, error.message);
      }
    }

    return systemInteractions;
  }

  /**
   * Generates rest interactions based on character energy levels
   * @param {Object} context - Execution context
   * @returns {SystemInteraction[]} Rest interactions
   * @private
   */
  _generateRestInteractions({ character, world, currentNode }) {
    const interactions = [];

    // Always available rest interaction
    const restInteraction = InteractionFactory.createRest({
      name: 'Rest',
      description: 'Take a moment to rest and recover energy',
      priority: character.energy < 20 ? 'critical' : character.energy < 40 ? 'high' : 'normal'
    });
    interactions.push(restInteraction);

    // Emergency rest if energy is very low
    if (character.energy < 20) {
      const emergencyRest = InteractionFactory.createRest({
        name: 'Emergency Rest',
        description: 'Quick emergency rest to prevent exhaustion',
        priority: 'critical',
        baseEnergyCost: 0 // Free emergency rest
      });
      interactions.push(emergencyRest);
    }

    return interactions;
  }

  /**
   * Generates wait interactions
   * @param {Object} context - Execution context
   * @returns {SystemInteraction[]} Wait interactions
   * @private
   */
  _generateWaitInteractions({ character, world, currentNode }) {
    const waitInteraction = InteractionFactory.createWait({
      name: 'Wait',
      description: 'Wait for a short time, allowing events to unfold',
      priority: 'low'
    });

    return [waitInteraction];
  }

  /**
   * Generates examine interactions for available targets
   * @param {Object} context - Execution context
   * @returns {SystemInteraction[]} Examine interactions
   * @private
   */
  _generateExamineInteractions({ character, world, currentNode }) {
    const interactions = [];

    // Examine current node features
    if (currentNode && currentNode.resources && currentNode.resources.length > 0) {
      currentNode.resources.slice(0, 3).forEach(resource => {
        const examineInteraction = InteractionFactory.createExamine('item', resource.id, {
          name: `Examine ${resource.name || 'Item'}`,
          description: `Examine ${resource.name || 'this item'} to learn more about it`,
          priority: 'normal'
        });
        interactions.push(examineInteraction);
      });
    }

    // Examine other characters in the node
    if (world && world.characters) {
      const otherCharacters = world.characters.filter(c => c.id !== character.id && c.currentNodeId === character.currentNodeId);
      otherCharacters.slice(0, 2).forEach(otherChar => {
        const examineInteraction = InteractionFactory.createExamine('character', otherChar.id, {
          name: `Examine ${otherChar.name}`,
          description: `Examine ${otherChar.name} to learn more about them`,
          priority: 'normal'
        });
        interactions.push(examineInteraction);
      });
    }

    return interactions;
  }

  /**
   * Generates movement interactions to connected nodes
   * @param {Object} context - Execution context
   * @returns {SystemInteraction[]} Movement interactions
   * @private
   */
  _generateMovementInteractions({ character, world, currentNode }) {
    const interactions = [];

    if (!currentNode || !currentNode.connections) return interactions;

    // Generate movement to connected nodes
    currentNode.connections.slice(0, 3).forEach(connection => {
      const targetNode = world.nodes?.find(n => n.id === connection.targetNodeId);
      if (targetNode) {
        const movementInteraction = InteractionFactory.createMovement(targetNode.id, 'walk', {
          name: `Move to ${targetNode.name}`,
          description: `Move to ${targetNode.name}`,
          priority: 'normal'
        });
        interactions.push(movementInteraction);
      }
    });

    return interactions;
  }

  /**
   * Generates perception interactions
   * @param {Object} context - Execution context
   * @returns {SystemInteraction[]} Perception interactions
   * @private
   */
  _generatePerceptionInteractions({ character, world, currentNode }) {
    const interactions = [];

    // General perception (look around)
    const lookInteraction = InteractionFactory.createPerception('look', null, {
      name: 'Look Around',
      description: 'Observe your surroundings carefully',
      priority: 'normal'
    });
    interactions.push(lookInteraction);

    // Listen for sounds
    const listenInteraction = InteractionFactory.createPerception('listen', null, {
      name: 'Listen Carefully',
      description: 'Listen for sounds in the environment',
      priority: 'normal'
    });
    interactions.push(listenInteraction);

    return interactions;
  }

  /**
   * Gets content interactions from the current node
   * @param {Object} context - Execution context
   * @param {Object} options - Filtering options
   * @returns {Interaction[]} Content interactions
   * @private
   */
  _getContentInteractions({ character, world, currentNode }, options) {
    if (!currentNode || !currentNode.contentInteractions) {
      console.log('Debug: No currentNode or no contentInteractions array');
      return [];
    }

    console.log(`Debug: Found ${currentNode.contentInteractions.length} content interactions in node`);

    // Filter content interactions that can be executed
    const filtered = currentNode.contentInteractions.filter(interaction => {
      try {
        console.log(`Debug: Checking interaction ${interaction.name} (${interaction.id})`);
        console.log(`Debug: Interaction has canExecute method: ${!!interaction.canExecute}`);

        if (!interaction.canExecute) {
          console.log('Debug: Interaction missing canExecute method');
          return false;
        }

        const canExecute = interaction.canExecute(character, world);
        console.log(`Debug: Interaction ${interaction.name} canExecute result: ${canExecute}`);

        return canExecute;
      } catch (error) {
        console.warn(`Error checking if content interaction can execute:`, error.message);
        return false;
      }
    });

    console.log(`Debug: Filtered to ${filtered.length} executable content interactions`);
    return filtered;
  }

  /**
   * Sorts interactions by priority
   * @param {Object} result - Result object with interaction arrays
   * @private
   */
  _sortInteractionsByPriority(result) {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };

    const sortFn = (a, b) => {
      const aPriority = priorityOrder[a.priority] ?? 2;
      const bPriority = priorityOrder[b.priority] ?? 2;
      return aPriority - bPriority;
    };

    result.systemInteractions.sort(sortFn);
    result.contentInteractions.sort(sortFn);
    result.allInteractions.sort(sortFn);
  }

  /**
   * Filters interactions based on criteria
   * @param {SystemInteraction[]} interactions - Interactions to filter
   * @param {Object} criteria - Filter criteria
   * @returns {SystemInteraction[]} Filtered interactions
   */
  filterInteractions(interactions, criteria = {}) {
    return interactions.filter(interaction => {
      // Filter by type
      if (criteria.type && interaction.constructor.name !== criteria.type) {
        return false;
      }

      // Filter by priority
      if (criteria.priority && interaction.priority !== criteria.priority) {
        return false;
      }

      // Filter by energy cost
      if (criteria.maxEnergyCost !== undefined && interaction.baseEnergyCost > criteria.maxEnergyCost) {
        return false;
      }

      // Filter by name pattern
      if (criteria.namePattern && !interaction.name.toLowerCase().includes(criteria.namePattern.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  /**
   * Gets interactions grouped by category
   * @param {Object} context - Execution context
   * @returns {Object} Interactions grouped by category
   */
  getInteractionsByCategory(context) {
    const available = this.getAvailableInteractions(context);

    return {
      system: {
        rest: available.systemInteractions.filter(i => i.name.toLowerCase().includes('rest')),
        movement: available.systemInteractions.filter(i => i.name.toLowerCase().includes('move')),
        perception: available.systemInteractions.filter(i => i.name.toLowerCase().includes('look') || i.name.toLowerCase().includes('listen')),
        examination: available.systemInteractions.filter(i => i.name.toLowerCase().includes('examine')),
        other: available.systemInteractions.filter(i =>
          !i.name.toLowerCase().includes('rest') &&
          !i.name.toLowerCase().includes('move') &&
          !i.name.toLowerCase().includes('look') &&
          !i.name.toLowerCase().includes('listen') &&
          !i.name.toLowerCase().includes('examine')
        )
      },
      content: available.contentInteractions
    };
  }

  /**
   * Validates that an interaction can be executed
   * @param {SystemInteraction} interaction - The interaction to validate
   * @param {Object} context - Execution context
   * @returns {boolean} True if interaction can be executed
   */
  canExecuteInteraction(interaction, context) {
    try {
      return interaction.canExecute(context.character, context.world || context.worldState);
    } catch (error) {
      console.warn(`Error validating interaction ${interaction.name}:`, error.message);
      return false;
    }
  }

  /**
   * Gets the recommended interaction for a character based on their current state
   * @param {Object} context - Execution context
   * @returns {SystemInteraction|null} Recommended interaction or null
   */
  getRecommendedInteraction(context) {
    const available = this.getAvailableInteractions(context);

    // Prioritize critical interactions
    const criticalInteractions = available.allInteractions.filter(i => i.priority === 'critical');
    if (criticalInteractions.length > 0) {
      return criticalInteractions[0];
    }

    // Then high priority
    const highInteractions = available.allInteractions.filter(i => i.priority === 'high');
    if (highInteractions.length > 0) {
      return highInteractions[0];
    }

    // Return first available interaction
    return available.allInteractions.length > 0 ? available.allInteractions[0] : null;
  }
}

export default InteractionManager;
