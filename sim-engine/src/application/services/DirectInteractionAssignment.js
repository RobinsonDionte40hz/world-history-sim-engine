/**
 * DirectInteractionAssignment - Utility for demo scenarios
 * 
 * Provides simplified, direct assignment of interactions to characters
 * without requiring node-based filtering. This is specifically for 
 * demo scenarios where we want precise control over which NPCs 
 * have which interactions available.
 */

class DirectInteractionAssignment {
  constructor() {
    this.characterInteractionMap = new Map();
    this.roleBasedPools = new Map();
  }

  /**
   * Create interaction pools based on character roles/types
   * This makes demo setup much more semantic and easier to manage
   */
  initializeRoleBasedPools() {
    // Administrative/Leadership interactions
    this.addToRolePool('administrator', [
      {
        id: 'hold_council_meeting',
        name: 'Hold Council Meeting',
        description: 'Convene a council meeting to discuss settlement matters',
        type: 'social',
        category: 'governance',
        requirements: { charisma: 14, energy: 20 },
        effects: { influence: 15, relationships: 5 },
        tierRequirement: 'hero'
      },
      {
        id: 'review_reports',
        name: 'Review Administrative Reports',
        description: 'Review reports from various departments and make decisions',
        type: 'administrative',
        category: 'governance',
        requirements: { intelligence: 12, energy: 15 },
        effects: { knowledge: 10, efficiency: 5 },
        tierRequirement: 'group'
      },
      {
        id: 'diplomatic_meeting',
        name: 'Diplomatic Meeting',
        description: 'Meet with representatives from other settlements',
        type: 'social',
        category: 'diplomacy',
        requirements: { charisma: 16, wisdom: 14 },
        effects: { relationships: 20, influence: 10 },
        tierRequirement: 'hero'
      }
    ]);

    // Merchant/Economic interactions
    this.addToRolePool('merchant', [
      {
        id: 'negotiate_trade_deal',
        name: 'Negotiate Trade Deal',
        description: 'Negotiate favorable trade agreements with other merchants',
        type: 'economic',
        category: 'commerce',
        requirements: { charisma: 13, intelligence: 12 },
        effects: { wealth: 25, relationships: 8 },
        tierRequirement: 'group'
      },
      {
        id: 'manage_inventory',
        name: 'Manage Inventory',
        description: 'Organize and track merchant inventory and supplies',
        type: 'administrative',
        category: 'commerce',
        requirements: { intelligence: 11, energy: 10 },
        effects: { efficiency: 10, wealth: 5 },
        tierRequirement: 'background'
      },
      {
        id: 'market_analysis',
        name: 'Market Analysis',
        description: 'Study market trends and identify profitable opportunities',
        type: 'analytical',
        category: 'commerce',
        requirements: { intelligence: 15, wisdom: 13 },
        effects: { knowledge: 15, wealth: 10 },
        tierRequirement: 'hero'
      }
    ]);

    // Agricultural/Farming interactions
    this.addToRolePool('farmer', [
      {
        id: 'tend_crops',
        name: 'Tend to Crops',
        description: 'Work in the fields tending to various crops',
        type: 'labor',
        category: 'agricultural',
        requirements: { strength: 12, constitution: 11 },
        effects: { resources: 15, satisfaction: 8 },
        tierRequirement: 'background'
      },
      {
        id: 'plan_harvest',
        name: 'Plan Harvest',
        description: 'Coordinate harvest activities and resource allocation',
        type: 'planning',
        category: 'agricultural',
        requirements: { wisdom: 14, intelligence: 12 },
        effects: { efficiency: 20, resources: 10 },
        tierRequirement: 'group'
      },
      {
        id: 'improve_techniques',
        name: 'Improve Farming Techniques',
        description: 'Research and implement better farming methods',
        type: 'innovation',
        category: 'agricultural',
        requirements: { intelligence: 16, wisdom: 15 },
        effects: { knowledge: 20, efficiency: 15 },
        tierRequirement: 'hero'
      }
    ]);

    // Artisan/Crafting interactions
    this.addToRolePool('artisan', [
      {
        id: 'craft_goods',
        name: 'Craft Goods',
        description: 'Create various crafted items and tools',
        type: 'labor',
        category: 'crafting',
        requirements: { dexterity: 14, constitution: 11 },
        effects: { wealth: 12, satisfaction: 10 },
        tierRequirement: 'background'
      },
      {
        id: 'train_apprentice',
        name: 'Train Apprentice',
        description: 'Teach crafting skills to apprentices',
        type: 'social',
        category: 'education',
        requirements: { wisdom: 13, charisma: 12 },
        effects: { relationships: 15, influence: 8 },
        tierRequirement: 'group'
      },
      {
        id: 'master_craft',
        name: 'Master Craft Creation',
        description: 'Create exceptional masterwork items',
        type: 'creative',
        category: 'crafting',
        requirements: { dexterity: 18, intelligence: 15 },
        effects: { wealth: 30, reputation: 20 },
        tierRequirement: 'hero'
      }
    ]);

    // Universal interactions (available to all)
    this.addToRolePool('universal', [
      {
        id: 'wait_interaction',
        name: 'Wait',
        description: 'Rest and recover energy',
        type: 'wait',
        category: 'basic',
        requirements: { energy: 0 },
        effects: { energy: 10 },
        tierRequirement: 'background'
      },
      {
        id: 'socialize',
        name: 'Socialize',
        description: 'Spend time with other settlement members',
        type: 'social',
        category: 'social',
        requirements: { energy: 5 },
        effects: { relationships: 5, morale: 5 },
        tierRequirement: 'background'
      },
      {
        id: 'observe_settlement',
        name: 'Observe Settlement',
        description: 'Watch and learn about settlement activities',
        type: 'observational',
        category: 'learning',
        requirements: { energy: 8 },
        effects: { knowledge: 8, awareness: 5 },
        tierRequirement: 'group'
      }
    ]);

    console.log('✅ Role-based interaction pools initialized');
  }

  /**
   * Add interactions to a role pool
   * @param {string} role - Role identifier (administrator, merchant, farmer, etc.)
   * @param {Array} interactions - Array of interaction objects
   */
  addToRolePool(role, interactions) {
    if (!this.roleBasedPools.has(role)) {
      this.roleBasedPools.set(role, []);
    }
    this.roleBasedPools.get(role).push(...interactions);
  }

  /**
   * Directly assign specific interactions to a character
   * Bypasses all node-based filtering - the demo author has full control
   * @param {string} characterId - Character ID
   * @param {Array<string>} interactionIds - Array of interaction IDs to assign
   */
  directAssign(characterId, interactionIds) {
    if (!this.characterInteractionMap.has(characterId)) {
      this.characterInteractionMap.set(characterId, new Set());
    }
    
    const characterInteractions = this.characterInteractionMap.get(characterId);
    interactionIds.forEach(id => characterInteractions.add(id));
    
    console.log(`✅ Directly assigned ${interactionIds.length} interactions to ${characterId}`);
    return true;
  }

  /**
   * Assign interactions based on character role/occupation
   * Much more semantic than node-based assignment for demos
   * @param {Object} character - Character object with role information
   * @param {number} maxInteractions - Maximum number of interactions to assign
   * @returns {Array} Array of assigned interaction objects
   */
  assignByRole(character, maxInteractions = 3) {
    const role = this.determineCharacterRole(character);
    const availableInteractions = this.getInteractionsForRole(role);
    
    // Filter by character's LOD tier
    const tierAppropriate = availableInteractions.filter(interaction => {
      return this.isInteractionAppropriateForTier(interaction, character.lodTier);
    });

    // Select interactions based on character attributes and preferences
    const selectedInteractions = this.selectBestInteractions(
      tierAppropriate, 
      character, 
      maxInteractions
    );

    // Assign to character
    const interactionIds = selectedInteractions.map(i => i.id);
    this.directAssign(character.id, interactionIds);

    console.log(`✅ Assigned ${selectedInteractions.length} role-based interactions to ${character.name} (${role})`);
    return selectedInteractions;
  }

  /**
   * Determine character role from their data
   * @param {Object} character - Character object
   * @returns {string} Role identifier
   */
  determineCharacterRole(character) {
    // Check explicit role field
    if (character.role) {
      const roleMap = {
        'Federation Council Chair': 'administrator',
        'Merchant Guild Leader': 'merchant', 
        'Head Farmer': 'farmer',
        'Master Artisan': 'artisan'
      };
      if (roleMap[character.role]) {
        return roleMap[character.role];
      }
    }

    // Check background occupation
    if (character.background) {
      if (character.background.includes('farmer') || character.background.includes('agricultural')) {
        return 'farmer';
      }
      if (character.background.includes('merchant') || character.background.includes('trader')) {
        return 'merchant';
      }
      if (character.background.includes('artisan') || character.background.includes('craft')) {
        return 'artisan';
      }
      if (character.background.includes('admin') || character.background.includes('leader')) {
        return 'administrator';
      }
    }

    // Check demographics if available
    if (character.demographics?.occupation) {
      return character.demographics.occupation;
    }

    // Default to universal role
    return 'universal';
  }

  /**
   * Get available interactions for a specific role
   * @param {string} role - Role identifier
   * @returns {Array} Array of interaction objects
   */
  getInteractionsForRole(role) {
    const roleInteractions = this.roleBasedPools.get(role) || [];
    const universalInteractions = this.roleBasedPools.get('universal') || [];
    
    return [...roleInteractions, ...universalInteractions];
  }

  /**
   * Check if interaction is appropriate for character's LOD tier
   * @param {Object} interaction - Interaction object
   * @param {string} lodTier - Character's LOD tier
   * @returns {boolean} Whether interaction is appropriate
   */
  isInteractionAppropriateForTier(interaction, lodTier) {
    if (!interaction.tierRequirement) return true;

    switch (lodTier) {
      case 'background':
        return interaction.tierRequirement === 'background';
      case 'group':
        return ['background', 'group'].includes(interaction.tierRequirement);
      case 'hero':
        return true; // Heroes can access all interactions
      default:
        return false;
    }
  }

  /**
   * Select the best interactions for a character based on their attributes
   * @param {Array} availableInteractions - Available interactions
   * @param {Object} character - Character object
   * @param {number} maxCount - Maximum number to select
   * @returns {Array} Selected interactions
   */
  selectBestInteractions(availableInteractions, character, maxCount) {
    // Score interactions based on character's ability to perform them
    const scoredInteractions = availableInteractions.map(interaction => {
      let score = 0;
      
      // Check if character meets requirements
      if (interaction.requirements && character.attributes) {
        for (const [req, value] of Object.entries(interaction.requirements)) {
          if (req !== 'energy' && character.attributes[req]?.score >= value) {
            score += 10; // Bonus for meeting requirements
          }
        }
      }

      // Prefer interactions that match character's strengths
      if (character.attributes) {
        const highestAttribute = this.getHighestAttribute(character.attributes);
        if (this.interactionUsesAttribute(interaction, highestAttribute)) {
          score += 5;
        }
      }

      return { interaction, score };
    });

    // Sort by score and select top interactions
    scoredInteractions.sort((a, b) => b.score - a.score);
    return scoredInteractions.slice(0, maxCount).map(item => item.interaction);
  }

  /**
   * Get character's highest attribute
   * @param {Object} attributes - Character attributes
   * @returns {string} Highest attribute name
   */
  getHighestAttribute(attributes) {
    let highest = '';
    let highestValue = 0;
    
    for (const [attr, data] of Object.entries(attributes)) {
      const score = data.score || data;
      if (score > highestValue) {
        highestValue = score;
        highest = attr;
      }
    }
    
    return highest;
  }

  /**
   * Check if interaction uses a specific attribute
   * @param {Object} interaction - Interaction object
   * @param {string} attributeName - Attribute name to check
   * @returns {boolean} Whether interaction uses the attribute
   */
  interactionUsesAttribute(interaction, attributeName) {
    return interaction.requirements && 
           interaction.requirements.hasOwnProperty(attributeName);
  }

  /**
   * Get all interactions assigned to a character
   * @param {string} characterId - Character ID
   * @returns {Array<string>} Array of interaction IDs
   */
  getCharacterInteractions(characterId) {
    const interactions = this.characterInteractionMap.get(characterId);
    return interactions ? Array.from(interactions) : [];
  }

  /**
   * Clear all assignments for a character
   * @param {string} characterId - Character ID
   */
  clearCharacterAssignments(characterId) {
    this.characterInteractionMap.delete(characterId);
  }

  /**
   * Get assignment statistics
   * @returns {Object} Statistics about current assignments
   */
  getStatistics() {
    const totalCharacters = this.characterInteractionMap.size;
    let totalInteractions = 0;
    
    for (const interactions of this.characterInteractionMap.values()) {
      totalInteractions += interactions.size;
    }

    return {
      totalCharacters,
      totalInteractions,
      averageInteractionsPerCharacter: totalCharacters > 0 ? totalInteractions / totalCharacters : 0,
      availableRoles: Array.from(this.roleBasedPools.keys())
    };
  }

  /**
   * Export all assignments (for integration with existing system)
   * @returns {Object} Assignment data in format compatible with Character.assignments.interactions
   */
  exportAssignments() {
    const assignments = {};
    
    for (const [characterId, interactions] of this.characterInteractionMap.entries()) {
      assignments[characterId] = Array.from(interactions);
    }
    
    return assignments;
  }
}

export default DirectInteractionAssignment;