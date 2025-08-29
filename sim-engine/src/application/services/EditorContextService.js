/**
 * EditorContextService - Service for automatic context detection
 * 
 * Features:
 * - Automatic context detection from editor props
 * - Logic to extract character, node, and world context from editor props
 * - Dynamic suggestion generation based on available context
 * - Validation for placeholder availability in current context
 * - Enhanced context extraction with fallback mechanisms
 * - Real-time context updates and change detection
 */
class EditorContextService {
  /**
   * Detect context from editor props and current state
   * @param {string} editorType - Type of editor ('interaction', 'encounter', 'character', 'node')
   * @param {object} editorProps - Props passed to the editor
   * @param {object} currentState - Current application state
   * @returns {object} Detected context object
   */
  static detectContext(editorType, editorProps = {}, currentState = {}) {
    const context = {};

    // Extract character context
    const character = this.extractCharacterContext(editorProps, currentState);
    if (character) {
      context.character = character;
    }

    // Extract node context
    const node = this.extractNodeContext(editorProps, currentState);
    if (node) {
      context.node = node;
    }

    // Extract world context
    const world = this.extractWorldContext(editorProps, currentState);
    if (world) {
      context.world = world;
    }

    // Add editor-specific context
    switch (editorType) {
      case 'interaction':
        context.interaction = this.extractInteractionContext(editorProps, currentState);
        break;
      case 'encounter':
        context.encounter = this.extractEncounterContext(editorProps, currentState);
        break;
      case 'character':
        // Character editor might have additional character context
        break;
      case 'node':
        // Node editor might have additional node context
        break;
      default:
        // No additional context for unknown editor types
        break;
    }

    return context;
  }

  /**
   * Extract character context from props and state
   */
  static extractCharacterContext(props, state) {
    // Try multiple sources for character data
    let character = null;

    // Direct character prop
    if (props.character) {
      character = props.character;
    }
    // Character ID prop
    else if (props.characterId && state.characters) {
      character = state.characters[props.characterId];
    }
    // Current character in state
    else if (state.currentCharacter) {
      character = state.currentCharacter;
    }
    // Selected character
    else if (state.selectedCharacter) {
      character = state.selectedCharacter;
    }

    if (!character) return null;

    // Ensure character has required structure
    return {
      id: character.id,
      name: character.name || 'Unknown Character',
      attributes: character.attributes || {},
      personality: character.personality || {},
      consciousness: character.consciousness || {},
      reputation: character.reputation,
      archetype: character.archetype || character.class,
      relationships: character.relationships || [],
      ...character
    };
  }

  /**
   * Extract node context from props and state
   */
  static extractNodeContext(props, state) {
    let node = null;

    // Direct node prop
    if (props.node) {
      node = props.node;
    }
    // Node ID prop
    else if (props.nodeId && state.nodes) {
      node = state.nodes[props.nodeId];
    }
    // Current node in state
    else if (state.currentNode) {
      node = state.currentNode;
    }
    // Selected node
    else if (state.selectedNode) {
      node = state.selectedNode;
    }
    // Location context
    else if (props.location) {
      node = props.location;
    }

    if (!node) return null;

    // Ensure node has required structure
    return {
      id: node.id,
      name: node.name || 'Unknown Location',
      type: node.type || 'location',
      environmentalProperties: node.environmentalProperties || {},
      culturalContext: node.culturalContext || {},
      resourceAvailability: node.resourceAvailability || {},
      population: node.population,
      ...node
    };
  }

  /**
   * Extract world context from props and state
   */
  static extractWorldContext(props, state) {
    let world = null;

    // Direct world prop
    if (props.world) {
      world = props.world;
    }
    // World ID prop
    else if (props.worldId && state.worlds) {
      world = state.worlds[props.worldId];
    }
    // Current world in state
    else if (state.currentWorld) {
      world = state.currentWorld;
    }
    // Selected world
    else if (state.selectedWorld) {
      world = state.selectedWorld;
    }

    if (!world) return null;

    // Ensure world has required structure
    return {
      id: world.id,
      name: world.name || 'Unknown World',
      theme: world.theme || 'fantasy',
      properties: world.properties || {},
      globalState: world.globalState || {},
      ...world
    };
  }

  /**
   * Extract interaction-specific context
   */
  static extractInteractionContext(props, state) {
    const interaction = props.interaction || props.currentInteraction || state.currentInteraction;

    if (!interaction) return null;

    return {
      id: interaction.id,
      name: interaction.name,
      type: interaction.type,
      category: interaction.category,
      participants: interaction.participants || [],
      ...interaction
    };
  }

  /**
   * Extract encounter-specific context
   */
  static extractEncounterContext(props, state) {
    const encounter = props.encounter || props.currentEncounter || state.currentEncounter;

    if (!encounter) return null;

    return {
      id: encounter.id,
      name: encounter.name,
      type: encounter.type,
      difficulty: encounter.difficulty,
      participants: encounter.participants || [],
      location: encounter.location,
      ...encounter
    };
  }

  /**
   * Detect context specifically for encounter editor
   * @param {object} encounterData - Encounter editor data
   * @returns {object} Detected context for encounter editing
   */
  static detectEncounterContext(encounterData = {}) {
    const context = {};

    // Extract node context from encounter location or direct prop
    if (encounterData.node) {
      context.node = this.extractNodeContext({ node: encounterData.node }, {});
    } else if (encounterData.encounter && encounterData.encounter.location) {
      context.node = this.extractNodeContext({ node: encounterData.encounter.location }, {});
    }

    // Extract character context (could be current character or first participant)
    if (encounterData.character) {
      context.character = this.extractCharacterContext({ character: encounterData.character }, {});
    } else if (encounterData.participants && encounterData.participants.length > 0) {
      context.character = this.extractCharacterContext({ character: encounterData.participants[0] }, {});
    }

    // Extract world context
    if (encounterData.world) {
      context.world = this.extractWorldContext({ world: encounterData.world }, {});
    }

    // Add encounter-specific context
    if (encounterData.encounter) {
      context.encounter = {
        id: encounterData.encounter.id,
        name: encounterData.encounter.name,
        type: encounterData.encounter.type,
        difficulty: encounterData.encounter.difficulty,
        participants: encounterData.participants || encounterData.encounter.participants || [],
        questObjectives: encounterData.encounter.questObjectives || []
      };
    }

    // Add participants as additional context
    if (encounterData.participants && encounterData.participants.length > 0) {
      context.participants = encounterData.participants.map(participant => ({
        id: participant.id,
        name: participant.name || 'Unknown',
        type: participant.type || 'character',
        ...participant
      }));
    }

    // Add quest-specific context for templating
    context.questContext = {
      hasObjectives: !!(encounterData.encounter && encounterData.encounter.questObjectives && encounterData.encounter.questObjectives.length > 0),
      objectiveCount: (encounterData.encounter && encounterData.encounter.questObjectives) ? encounterData.encounter.questObjectives.length : 0
    };

    return context;
  }

  /**
   * Validate that a placeholder can be resolved with the given context
   * @param {string} placeholder - Placeholder to validate
   * @param {object} context - Available context
   * @returns {boolean} Whether the placeholder can be resolved
   */
  static validatePlaceholder(placeholder, context) {
    if (!placeholder || !context) return false;

    try {
      const value = this.getNestedValue(context, placeholder);
      return value !== undefined && value !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get nested value from context using dot notation
   * @param {object} context - Context object
   * @param {string} path - Dot-separated path
   * @returns {any} Value at path or undefined
   */
  static getNestedValue(context, path) {
    if (!context || !path) return undefined;

    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, context);
  }

  /**
   * Get context summary for display
   * @param {object} context - Context object
   * @returns {object} Summary of available context
   */
  static getContextSummary(context) {
    const summary = {
      hasCharacter: !!context.character,
      hasNode: !!context.node,
      hasWorld: !!context.world,
      characterName: context.character?.name,
      nodeName: context.node?.name,
      worldName: context.world?.name,
      availablePlaceholders: 0
    };

    // Count available placeholders
    let count = 0;

    if (context.character) {
      count += 1; // character.name
      if (context.character.attributes) count += Object.keys(context.character.attributes).length;
      if (context.character.personality) count += Object.keys(context.character.personality).length;
      if (context.character.consciousness) count += 2; // frequency, coherence
    }

    if (context.node) {
      count += 2; // node.name, node.type
      if (context.node.environmentalProperties) count += Object.keys(context.node.environmentalProperties).length;
      if (context.node.culturalContext) count += Object.keys(context.node.culturalContext).length;
    }

    if (context.world) {
      count += 2; // world.name, world.theme
      if (context.world.properties) count += Object.keys(context.world.properties).length;
    }

    summary.availablePlaceholders = count;

    return summary;
  }

  /**
   * Merge multiple contexts together
   * @param {...object} contexts - Context objects to merge
   * @returns {object} Merged context
   */
  static mergeContexts(...contexts) {
    const merged = {};

    contexts.forEach(context => {
      if (context && typeof context === 'object') {
        Object.keys(context).forEach(key => {
          if (context[key] !== undefined && context[key] !== null) {
            merged[key] = context[key];
          }
        });
      }
    });

    return merged;
  }

  /**
   * Generate dynamic suggestions based on available context
   * @param {object} context - Available context
   * @returns {Array} Array of suggestion objects
   */
  static generateContextualSuggestions(context) {
    const suggestions = [];

    if (!context || typeof context !== 'object') {
      return suggestions;
    }

    // Character-based suggestions
    if (context.character) {
      suggestions.push(...this.generateCharacterSuggestions(context.character));
    }

    // Node-based suggestions
    if (context.node) {
      suggestions.push(...this.generateNodeSuggestions(context.node));
    }

    // World-based suggestions
    if (context.world) {
      suggestions.push(...this.generateWorldSuggestions(context.world));
    }

    // Interaction-specific suggestions
    if (context.interactionCategory || context.availableAttributes) {
      suggestions.push(...this.generateInteractionSuggestions(context));
    }

    // Encounter-specific suggestions
    if (context.encounter || context.participants) {
      suggestions.push(...this.generateEncounterSuggestions(context));
    }

    // System suggestions (always available)
    suggestions.push(...this.generateSystemSuggestions());

    // Sort by availability and category
    return suggestions.sort((a, b) => {
      if (a.available !== b.available) {
        return b.available - a.available;
      }
      const categoryOrder = { character: 0, node: 1, world: 2, encounter: 3, quest: 4, interaction: 5, system: 6 };
      return (categoryOrder[a.category] || 7) - (categoryOrder[b.category] || 7);
    });
  }

  /**
   * Generate character-specific suggestions
   */
  static generateCharacterSuggestions(character) {
    const suggestions = [];

    // Basic character info
    suggestions.push({
      placeholder: 'character.name',
      category: 'character',
      description: 'Character name',
      example: character.name || 'Aria Blackwood',
      available: !!character.name
    });

    // D&D Attributes
    if (character.attributes) {
      const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      attributes.forEach(attr => {
        const value = character.attributes[attr];
        suggestions.push({
          placeholder: `character.attributes.${attr}`,
          category: 'character',
          description: `Character ${attr} attribute`,
          example: String(value || 14),
          available: value !== undefined
        });

        // Attribute modifiers
        if (value !== undefined) {
          const modifier = Math.floor((value - 10) / 2);
          suggestions.push({
            placeholder: `character.attributes.${attr}Modifier`,
            category: 'character',
            description: `Character ${attr} modifier`,
            example: modifier >= 0 ? `+${modifier}` : `${modifier}`,
            available: true
          });
        }
      });
    }

    // Personality traits
    if (character.personality) {
      const traits = ['aggression', 'curiosity', 'empathy'];
      traits.forEach(trait => {
        const value = character.personality[trait];
        suggestions.push({
          placeholder: `character.personality.${trait}`,
          category: 'character',
          description: `Character ${trait} level (0-1)`,
          example: String(value || 0.5),
          available: value !== undefined
        });
      });
    }

    // Consciousness
    if (character.consciousness) {
      suggestions.push(
        {
          placeholder: 'character.consciousness.frequency',
          category: 'character',
          description: 'Character consciousness frequency (Hz)',
          example: String(character.consciousness.frequency || 45),
          available: character.consciousness.frequency !== undefined
        },
        {
          placeholder: 'character.consciousness.coherence',
          category: 'character',
          description: 'Character consciousness coherence (0-1)',
          example: String(character.consciousness.coherence || 0.8),
          available: character.consciousness.coherence !== undefined
        }
      );
    }

    // Additional character properties
    if (character.reputation !== undefined) {
      suggestions.push({
        placeholder: 'character.reputation',
        category: 'character',
        description: 'Character reputation level',
        example: String(character.reputation),
        available: true
      });
    }

    if (character.archetype || character.class) {
      suggestions.push({
        placeholder: 'character.archetype',
        category: 'character',
        description: 'Character archetype or class',
        example: character.archetype || character.class || 'Noble',
        available: true
      });
    }

    return suggestions;
  }

  /**
   * Generate node-specific suggestions
   */
  static generateNodeSuggestions(node) {
    const suggestions = [];

    // Basic node info
    suggestions.push(
      {
        placeholder: 'node.name',
        category: 'node',
        description: 'Location name',
        example: node.name || 'Royal Court',
        available: !!node.name
      },
      {
        placeholder: 'node.type',
        category: 'node',
        description: 'Location type',
        example: node.type || 'palace',
        available: !!node.type
      }
    );

    // Environmental properties
    if (node.environmentalProperties) {
      Object.keys(node.environmentalProperties).forEach(prop => {
        suggestions.push({
          placeholder: `node.environmentalProperties.${prop}`,
          category: 'node',
          description: `Environmental property: ${prop}`,
          example: String(node.environmentalProperties[prop]),
          available: node.environmentalProperties[prop] !== undefined
        });
      });
    }

    // Cultural context
    if (node.culturalContext) {
      Object.keys(node.culturalContext).forEach(prop => {
        suggestions.push({
          placeholder: `node.culturalContext.${prop}`,
          category: 'node',
          description: `Cultural context: ${prop}`,
          example: String(node.culturalContext[prop]),
          available: node.culturalContext[prop] !== undefined
        });
      });
    }

    // Resource availability
    if (node.resourceAvailability) {
      Object.keys(node.resourceAvailability).forEach(resource => {
        suggestions.push({
          placeholder: `node.resourceAvailability.${resource}`,
          category: 'node',
          description: `Resource availability: ${resource}`,
          example: String(node.resourceAvailability[resource]),
          available: node.resourceAvailability[resource] !== undefined
        });
      });
    }

    // Population
    if (node.population !== undefined) {
      suggestions.push({
        placeholder: 'node.population',
        category: 'node',
        description: 'Location population size',
        example: String(node.population),
        available: true
      });
    }

    return suggestions;
  }

  /**
   * Generate world-specific suggestions
   */
  static generateWorldSuggestions(world) {
    const suggestions = [];

    suggestions.push(
      {
        placeholder: 'world.name',
        category: 'world',
        description: 'World name',
        example: world.name || 'Eldoria',
        available: !!world.name
      },
      {
        placeholder: 'world.theme',
        category: 'world',
        description: 'World theme',
        example: world.theme || 'medieval fantasy',
        available: !!world.theme
      }
    );

    // World properties
    if (world.properties) {
      Object.keys(world.properties).forEach(prop => {
        suggestions.push({
          placeholder: `world.properties.${prop}`,
          category: 'world',
          description: `World property: ${prop}`,
          example: String(world.properties[prop]),
          available: world.properties[prop] !== undefined
        });
      });
    }

    return suggestions;
  }

  /**
   * Generate interaction-specific suggestions
   */
  static generateInteractionSuggestions(context) {
    const suggestions = [];

    // D&D attribute check suggestions
    if (context.availableAttributes) {
      context.availableAttributes.forEach(attr => {
        suggestions.push({
          placeholder: `#if character.attributes.${attr} >= 15`,
          category: 'interaction',
          description: `Conditional based on high ${attr} (15+)`,
          example: `{{#if character.attributes.${attr} >= 15}}You feel confident{{/if}}`,
          available: true
        });

        suggestions.push({
          placeholder: `#if character.attributes.${attr} <= 10`,
          category: 'interaction',
          description: `Conditional based on low ${attr} (10-)`,
          example: `{{#if character.attributes.${attr} <= 10}}You struggle with this{{/if}}`,
          available: true
        });
      });
    }

    // Personality-based conditionals
    if (context.personalityTraits) {
      context.personalityTraits.forEach(trait => {
        suggestions.push({
          placeholder: `#if character.personality.${trait} > 0.7`,
          category: 'interaction',
          description: `Conditional based on high ${trait}`,
          example: `{{#if character.personality.${trait} > 0.7}}Your ${trait} shows{{/if}}`,
          available: true
        });
      });
    }

    // Consciousness-based suggestions
    if (context.consciousnessAspects) {
      suggestions.push({
        placeholder: '#if character.consciousness.coherence > 0.8',
        category: 'interaction',
        description: 'Conditional based on high consciousness coherence',
        example: '{{#if character.consciousness.coherence > 0.8}}Your mind is crystal clear{{/if}}',
        available: true
      });

      suggestions.push({
        placeholder: '#if character.consciousness.frequency > 50',
        category: 'interaction',
        description: 'Conditional based on high consciousness frequency',
        example: '{{#if character.consciousness.frequency > 50}}Your thoughts race{{/if}}',
        available: true
      });
    }

    // Relationship-based suggestions
    if (context.relationshipLevels) {
      suggestions.push({
        placeholder: 'random:friendly greeting,warm welcome,enthusiastic hello',
        category: 'interaction',
        description: 'Random friendly greeting variations',
        example: 'warm welcome',
        available: true
      });

      suggestions.push({
        placeholder: 'random:cold stare,dismissive nod,suspicious glance',
        category: 'interaction',
        description: 'Random unfriendly reaction variations',
        example: 'cold stare',
        available: true
      });
    }

    // Category-specific suggestions
    if (context.interactionCategory) {
      switch (context.interactionCategory) {
        case 'dialogue':
          suggestions.push(
            {
              placeholder: 'random:says,mentions,explains,tells you',
              category: 'interaction',
              description: 'Random dialogue verbs',
              example: 'explains',
              available: true
            },
            {
              placeholder: '#if character.attributes.charisma >= 14',
              category: 'interaction',
              description: 'Charismatic dialogue option',
              example: '{{#if character.attributes.charisma >= 14}}[Persuade]{{/if}}',
              available: true
            }
          );
          break;

        case 'trade':
          suggestions.push(
            {
              placeholder: 'random:gold pieces,silver coins,copper bits',
              category: 'interaction',
              description: 'Random currency types',
              example: 'gold pieces',
              available: true
            },
            {
              placeholder: '#if character.attributes.intelligence >= 12',
              category: 'interaction',
              description: 'Smart trading option',
              example: '{{#if character.attributes.intelligence >= 12}}[Appraise]{{/if}}',
              available: true
            }
          );
          break;

        case 'combat':
          suggestions.push(
            {
              placeholder: 'random:strikes,attacks,lunges,swings',
              category: 'interaction',
              description: 'Random combat verbs',
              example: 'strikes',
              available: true
            },
            {
              placeholder: '#if character.attributes.dexterity >= 14',
              category: 'interaction',
              description: 'Dexterous combat option',
              example: '{{#if character.attributes.dexterity >= 14}}[Quick Strike]{{/if}}',
              available: true
            }
          );
          break;

        case 'social':
          suggestions.push(
            {
              placeholder: 'random:smiles,frowns,nods,gestures',
              category: 'interaction',
              description: 'Random social expressions',
              example: 'smiles',
              available: true
            },
            {
              placeholder: '#if character.personality.empathy > 0.6',
              category: 'interaction',
              description: 'Empathetic response option',
              example: '{{#if character.personality.empathy > 0.6}}You sense their feelings{{/if}}',
              available: true
            }
          );
          break;
      }
    }

    return suggestions;
  }

  /**
   * Generate encounter-specific suggestions
   */
  static generateEncounterSuggestions(context) {
    const suggestions = [];

    // Encounter basic info
    if (context.encounter) {
      suggestions.push(
        {
          placeholder: 'encounter.name',
          category: 'encounter',
          description: 'Encounter name',
          example: context.encounter.name || 'Bandit Ambush',
          available: !!context.encounter.name
        },
        {
          placeholder: 'encounter.type',
          category: 'encounter',
          description: 'Encounter type',
          example: context.encounter.type || 'combat',
          available: !!context.encounter.type
        },
        {
          placeholder: 'encounter.difficulty',
          category: 'encounter',
          description: 'Encounter difficulty level',
          example: context.encounter.difficulty || 'medium',
          available: !!context.encounter.difficulty
        }
      );
    }

    // Participant suggestions
    if (context.participants && context.participants.length > 0) {
      suggestions.push({
        placeholder: 'participants.count',
        category: 'encounter',
        description: 'Number of encounter participants',
        example: String(context.participants.length),
        available: true
      });

      // First participant (often the main character)
      if (context.participants[0]) {
        const firstParticipant = context.participants[0];
        suggestions.push({
          placeholder: 'participants.first.name',
          category: 'encounter',
          description: 'Name of first participant',
          example: firstParticipant.name || 'Unknown',
          available: !!firstParticipant.name
        });
      }

      // Random participant selection
      suggestions.push({
        placeholder: `random:${context.participants.map(p => p.name || 'Unknown').join(',')}`,
        category: 'encounter',
        description: 'Random participant name',
        example: context.participants[0]?.name || 'Unknown',
        available: context.participants.some(p => p.name)
      });
    }

    // Quest-related suggestions
    if (context.questContext) {
      if (context.questContext.hasObjectives) {
        suggestions.push({
          placeholder: 'quest.objectiveCount',
          category: 'quest',
          description: 'Number of quest objectives',
          example: String(context.questContext.objectiveCount),
          available: true
        });
      }

      // Quest completion suggestions
      suggestions.push(
        {
          placeholder: 'random:completed,finished,accomplished,achieved',
          category: 'quest',
          description: 'Random quest completion verbs',
          example: 'completed',
          available: true
        },
        {
          placeholder: 'random:objective,goal,task,mission',
          category: 'quest',
          description: 'Random quest objective synonyms',
          example: 'objective',
          available: true
        },
        {
          placeholder: 'random:reward,prize,treasure,compensation',
          category: 'quest',
          description: 'Random quest reward synonyms',
          example: 'reward',
          available: true
        },
        {
          placeholder: 'random:experience,knowledge,wisdom,skill',
          category: 'quest',
          description: 'Random experience gain types',
          example: 'experience',
          available: true
        }
      );

      // Quest objective conditionals
      suggestions.push(
        {
          placeholder: '#if quest.objectiveCount > 1',
          category: 'quest',
          description: 'Conditional for multi-objective quests',
          example: '{{#if quest.objectiveCount > 1}}Multiple tasks await completion{{/if}}',
          available: context.questContext.hasObjectives
        },
        {
          placeholder: '#if quest.objectiveCount == 1',
          category: 'quest',
          description: 'Conditional for single objective quests',
          example: '{{#if quest.objectiveCount == 1}}A single task remains{{/if}}',
          available: context.questContext.hasObjectives
        }
      );
    }

    // Quest reward suggestions
    suggestions.push(
      {
        placeholder: 'random:gold,silver,copper',
        category: 'quest',
        description: 'Random currency types for rewards',
        example: 'gold',
        available: true
      },
      {
        placeholder: 'random:item,artifact,weapon,armor',
        category: 'quest',
        description: 'Random item reward types',
        example: 'item',
        available: true
      },
      {
        placeholder: 'random:reputation,influence,standing,favor',
        category: 'quest',
        description: 'Random social reward types',
        example: 'reputation',
        available: true
      }
    );

    // Encounter type-specific suggestions
    if (context.encounter && context.encounter.type) {
      switch (context.encounter.type) {
        case 'combat':
          suggestions.push(
            {
              placeholder: 'random:battle,fight,skirmish,conflict',
              category: 'encounter',
              description: 'Random combat synonyms',
              example: 'battle',
              available: true
            },
            {
              placeholder: 'random:victory,defeat,stalemate',
              category: 'encounter',
              description: 'Random combat outcomes',
              example: 'victory',
              available: true
            },
            {
              placeholder: '#if encounter.difficulty == "deadly"',
              category: 'encounter',
              description: 'Conditional for deadly encounters',
              example: '{{#if encounter.difficulty == "deadly"}}This looks dangerous{{/if}}',
              available: true
            }
          );
          break;

        case 'social':
          suggestions.push(
            {
              placeholder: 'random:negotiation,discussion,conversation,meeting',
              category: 'encounter',
              description: 'Random social encounter types',
              example: 'negotiation',
              available: true
            },
            {
              placeholder: 'random:agreement,disagreement,compromise',
              category: 'encounter',
              description: 'Random social outcomes',
              example: 'agreement',
              available: true
            }
          );
          break;

        case 'exploration':
          suggestions.push(
            {
              placeholder: 'random:discovery,finding,revelation,clue',
              category: 'encounter',
              description: 'Random exploration outcomes',
              example: 'discovery',
              available: true
            },
            {
              placeholder: 'random:hidden,secret,mysterious,ancient',
              category: 'encounter',
              description: 'Random exploration descriptors',
              example: 'hidden',
              available: true
            }
          );
          break;

        case 'puzzle':
          suggestions.push(
            {
              placeholder: 'random:riddle,puzzle,challenge,mystery',
              category: 'encounter',
              description: 'Random puzzle types',
              example: 'riddle',
              available: true
            },
            {
              placeholder: 'random:solved,unraveled,deciphered,cracked',
              category: 'encounter',
              description: 'Random puzzle solution verbs',
              example: 'solved',
              available: true
            }
          );
          break;

        case 'environmental':
          suggestions.push(
            {
              placeholder: 'random:storm,earthquake,flood,fire',
              category: 'encounter',
              description: 'Random environmental hazards',
              example: 'storm',
              available: true
            },
            {
              placeholder: 'random:survived,endured,overcame,weathered',
              category: 'encounter',
              description: 'Random survival verbs',
              example: 'survived',
              available: true
            }
          );
          break;
      }
    }

    // Location-based encounter suggestions (if node context is available)
    if (context.node) {
      // Environmental property conditionals
      if (context.node.environmentalProperties) {
        Object.keys(context.node.environmentalProperties).forEach(prop => {
          const value = context.node.environmentalProperties[prop];
          if (typeof value === 'boolean') {
            suggestions.push({
              placeholder: `#if node.environmentalProperties.${prop}`,
              category: 'encounter',
              description: `Conditional for ${prop} environment`,
              example: `{{#if node.environmentalProperties.${prop}}}The ${prop} environment affects the encounter{{/if}}`,
              available: true
            });
          } else {
            suggestions.push({
              placeholder: `node.environmentalProperties.${prop}`,
              category: 'encounter',
              description: `Environmental property: ${prop}`,
              example: String(value),
              available: true
            });
          }
        });
      }

      // Cultural context suggestions
      if (context.node.culturalContext) {
        Object.keys(context.node.culturalContext).forEach(prop => {
          suggestions.push({
            placeholder: `node.culturalContext.${prop}`,
            category: 'encounter',
            description: `Cultural context: ${prop}`,
            example: String(context.node.culturalContext[prop]),
            available: true
          });
        });
      }

      // Resource availability suggestions
      if (context.node.resourceAvailability) {
        Object.keys(context.node.resourceAvailability).forEach(resource => {
          suggestions.push({
            placeholder: `node.resourceAvailability.${resource}`,
            category: 'encounter',
            description: `Resource availability: ${resource}`,
            example: String(context.node.resourceAvailability[resource]),
            available: true
          });
        });
      }

      // Node type-specific suggestions
      suggestions.push(
        {
          placeholder: '#if node.type == "dungeon"',
          category: 'encounter',
          description: 'Conditional for dungeon encounters',
          example: '{{#if node.type == "dungeon"}}The darkness conceals dangers{{/if}}',
          available: !!context.node.type
        },
        {
          placeholder: '#if node.type == "wilderness"',
          category: 'encounter',
          description: 'Conditional for wilderness encounters',
          example: '{{#if node.type == "wilderness"}}Nature itself seems hostile{{/if}}',
          available: !!context.node.type
        },
        {
          placeholder: '#if node.type == "settlement"',
          category: 'encounter',
          description: 'Conditional for settlement encounters',
          example: '{{#if node.type == "settlement"}}The townspeople watch nervously{{/if}}',
          available: !!context.node.type
        }
      );

      // Population-based suggestions
      if (context.node.population !== undefined) {
        suggestions.push(
          {
            placeholder: '#if node.population > 1000',
            category: 'encounter',
            description: 'Conditional for large population areas',
            example: '{{#if node.population > 1000}}The large crowd complicates matters{{/if}}',
            available: true
          },
          {
            placeholder: '#if node.population < 100',
            category: 'encounter',
            description: 'Conditional for small population areas',
            example: '{{#if node.population < 100}}Few witnesses are present{{/if}}',
            available: true
          }
        );
      }
    }

    // Multi-character encounter suggestions
    if (context.participants && context.participants.length > 1) {
      suggestions.push(
        {
          placeholder: 'random:allies,companions,friends,party members',
          category: 'encounter',
          description: 'Random ally references',
          example: 'companions',
          available: true
        },
        {
          placeholder: 'random:enemies,foes,opponents,adversaries',
          category: 'encounter',
          description: 'Random enemy references',
          example: 'enemies',
          available: true
        },
        {
          placeholder: '#if participants.count > 3',
          category: 'encounter',
          description: 'Conditional for large group encounters',
          example: '{{#if participants.count > 3}}The large group creates chaos{{/if}}',
          available: true
        }
      );

      // Individual participant suggestions
      context.participants.forEach((participant, index) => {
        if (participant.name) {
          suggestions.push({
            placeholder: `participants.${index}.name`,
            category: 'encounter',
            description: `Name of participant ${index + 1}`,
            example: participant.name,
            available: true
          });
        }

        if (participant.type) {
          suggestions.push({
            placeholder: `participants.${index}.type`,
            category: 'encounter',
            description: `Type of participant ${index + 1}`,
            example: participant.type,
            available: true
          });
        }
      });
    }

    return suggestions;
  }

  /**
   * Generate system-level suggestions (always available)
   */
  static generateSystemSuggestions() {
    return [
      {
        placeholder: 'random:option1,option2,option3',
        category: 'system',
        description: 'Random selection from comma-separated options',
        example: 'option2',
        available: true
      },
      {
        placeholder: '#if condition',
        category: 'system',
        description: 'Conditional text block start',
        example: '{{#if character.attributes.charisma > 14}}',
        available: true
      },
      {
        placeholder: '/if',
        category: 'system',
        description: 'Conditional text block end',
        example: '{{/if}}',
        available: true
      }
    ];
  }

  /**
   * Detect context changes between two context objects
   * @param {object} oldContext - Previous context
   * @param {object} newContext - New context
   * @returns {object} Change detection result
   */
  static detectContextChanges(oldContext, newContext) {
    const changes = {
      hasChanges: false,
      addedContexts: [],
      removedContexts: [],
      modifiedContexts: []
    };

    const oldKeys = new Set(Object.keys(oldContext || {}));
    const newKeys = new Set(Object.keys(newContext || {}));

    // Detect added contexts
    newKeys.forEach(key => {
      if (!oldKeys.has(key)) {
        changes.addedContexts.push(key);
        changes.hasChanges = true;
      }
    });

    // Detect removed contexts
    oldKeys.forEach(key => {
      if (!newKeys.has(key)) {
        changes.removedContexts.push(key);
        changes.hasChanges = true;
      }
    });

    // Detect modified contexts
    newKeys.forEach(key => {
      if (oldKeys.has(key)) {
        const oldValue = oldContext[key];
        const newValue = newContext[key];
        
        // Simple comparison - could be enhanced for deep comparison
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.modifiedContexts.push(key);
          changes.hasChanges = true;
        }
      }
    });

    return changes;
  }

  /**
   * Validate context completeness for specific editor types
   * @param {string} editorType - Type of editor
   * @param {object} context - Context to validate
   * @returns {object} Validation result
   */
  static validateContextForEditor(editorType, context) {
    const validation = {
      isValid: true,
      warnings: [],
      suggestions: []
    };

    switch (editorType) {
      case 'interaction':
        if (!context.character) {
          validation.warnings.push('No character context available for interaction editor');
          validation.suggestions.push('Add character context for better placeholder suggestions');
        }
        if (!context.node) {
          validation.warnings.push('No location context available for interaction editor');
          validation.suggestions.push('Add node context for location-based placeholders');
        }
        break;

      case 'encounter':
        if (!context.node) {
          validation.warnings.push('No location context available for encounter editor');
          validation.suggestions.push('Add node context for location-based descriptions');
        }
        if (!context.world) {
          validation.warnings.push('No world context available for encounter editor');
          validation.suggestions.push('Add world context for global references');
        }
        break;

      case 'character':
        if (!context.world) {
          validation.suggestions.push('Add world context for world-specific character details');
        }
        break;

      case 'node':
        if (!context.world) {
          validation.suggestions.push('Add world context for world-specific location details');
        }
        break;
    }

    validation.isValid = validation.warnings.length === 0;
    return validation;
  }

  /**
   * Create a sample context for testing/preview purposes
   * @param {string} type - Type of sample context ('character', 'node', 'world', 'full')
   * @returns {object} Sample context
   */
  static createSampleContext(type = 'full') {
    const samples = {
      character: {
        id: 'sample_char',
        name: 'Aria Blackwood',
        attributes: {
          strength: 16,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 15,
          charisma: 18
        },
        personality: {
          aggression: 0.3,
          curiosity: 0.8,
          empathy: 0.7
        },
        consciousness: {
          frequency: 45,
          coherence: 0.8
        },
        reputation: 15,
        archetype: 'Noble'
      },
      node: {
        id: 'sample_node',
        name: 'Royal Court',
        type: 'palace',
        environmentalProperties: {
          formal: true,
          crowded: true,
          luxurious: true
        },
        culturalContext: {
          language: 'common',
          customs: 'courtly',
          law: 'royal decree'
        },
        resourceAvailability: {
          gold: 'abundant',
          information: 'flowing',
          influence: 'high'
        },
        population: 500
      },
      world: {
        id: 'sample_world',
        name: 'Eldoria',
        theme: 'medieval fantasy',
        properties: {
          magicLevel: 'high',
          technologyLevel: 'medieval',
          politicalSystem: 'monarchy'
        }
      }
    };

    switch (type) {
      case 'character':
        return { character: samples.character };
      case 'node':
        return { node: samples.node };
      case 'world':
        return { world: samples.world };
      case 'full':
      default:
        return samples;
    }
  }
}

export default EditorContextService;