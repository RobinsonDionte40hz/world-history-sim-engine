// src/domain/services/RaceManager.js

import RacialTraits from '../value-objects/RacialTraits.js';

/**
 * RaceManager - Service for managing custom races
 * 
 * Provides functionality to:
 * - Register custom races dynamically
 * - Save/load races as templates
 * - Validate race definitions
 * - Manage race availability per world
 */
class RaceManager {
  constructor(templateManager = null) {
    this.templateManager = templateManager;
    
    // Registry of custom races (in-memory, world-specific)
    this.customRaces = new Map();
    
    // Track which worlds have which custom races
    this.worldRaces = new Map(); // worldId -> Set of raceIds
  }

  /**
   * Register a new custom race
   * @param {Object} raceDefinition - Race configuration
   * @returns {string} Race ID
   */
  registerCustomRace(raceDefinition) {
    const errors = this.validateRaceDefinition(raceDefinition);
    if (errors.length > 0) {
      throw new Error(`Invalid race definition: ${errors.join(', ')}`);
    }

    const raceId = raceDefinition.id || this._generateRaceId(raceDefinition.name);
    
    const race = {
      id: raceId,
      name: raceDefinition.name,
      description: raceDefinition.description || '',
      attributeModifiers: raceDefinition.attributeModifiers || {},
      skillModifiers: raceDefinition.skillModifiers || {},
      features: raceDefinition.features || [],
      lifespan: raceDefinition.lifespan || {
        maturity: 18,
        middleAge: 40,
        old: 60,
        venerable: 80,
        maximum: 100
      },
      subraces: raceDefinition.subraces || [],
      appearance: raceDefinition.appearance || {},
      culture: raceDefinition.culture || {},
      isCustom: true,
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '1.0.0',
        author: raceDefinition.author || 'User'
      }
    };

    this.customRaces.set(raceId, race);
    return raceId;
  }

  /**
   * Get a race by ID (checks both built-in and custom)
   * @param {string} raceId - Race ID
   * @returns {Object|null} Race data
   */
  getRace(raceId) {
    // Check custom races first
    if (this.customRaces.has(raceId)) {
      return this.customRaces.get(raceId);
    }

    // Check built-in races
    try {
      const racialTraits = new RacialTraits(raceId);
      return racialTraits.race;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all available races (built-in + custom)
   * @param {string} worldId - Optional world ID to filter custom races
   * @returns {Array} Array of race definitions
   */
  getAllRaces(worldId = null) {
    const races = [];

    // Add built-in races
    const builtInRaces = RacialTraits.getAllRaces();
    races.push(...builtInRaces.map(race => ({ ...race, isCustom: false })));

    // Add custom races
    if (worldId) {
      // Filter to world-specific custom races
      const worldRaceIds = this.worldRaces.get(worldId) || new Set();
      worldRaceIds.forEach(raceId => {
        const race = this.customRaces.get(raceId);
        if (race) {
          races.push(race);
        }
      });
    } else {
      // Add all custom races
      this.customRaces.forEach(race => {
        races.push(race);
      });
    }

    return races;
  }

  /**
   * Delete a custom race
   * @param {string} raceId - Race ID to delete
   * @returns {boolean} Success status
   */
  deleteCustomRace(raceId) {
    if (!this.customRaces.has(raceId)) {
      return false;
    }

    this.customRaces.delete(raceId);

    // Remove from all worlds
    this.worldRaces.forEach(raceIds => {
      raceIds.delete(raceId);
    });

    return true;
  }

  /**
   * Update a custom race
   * @param {string} raceId - Race ID to update
   * @param {Object} updates - Updates to apply
   * @returns {Object} Updated race
   */
  updateCustomRace(raceId, updates) {
    const race = this.customRaces.get(raceId);
    if (!race) {
      throw new Error(`Custom race not found: ${raceId}`);
    }

    const updatedRace = {
      ...race,
      ...updates,
      id: raceId, // Preserve ID
      isCustom: true, // Preserve custom flag
      metadata: {
        ...race.metadata,
        lastModified: new Date().toISOString()
      }
    };

    // Validate updated race
    const errors = this.validateRaceDefinition(updatedRace);
    if (errors.length > 0) {
      throw new Error(`Invalid race definition: ${errors.join(', ')}`);
    }

    this.customRaces.set(raceId, updatedRace);
    return updatedRace;
  }

  /**
   * Associate a custom race with a world
   * @param {string} worldId - World ID
   * @param {string} raceId - Race ID
   */
  addRaceToWorld(worldId, raceId) {
    if (!this.customRaces.has(raceId)) {
      throw new Error(`Custom race not found: ${raceId}`);
    }

    if (!this.worldRaces.has(worldId)) {
      this.worldRaces.set(worldId, new Set());
    }

    this.worldRaces.get(worldId).add(raceId);
  }

  /**
   * Remove a race from a world
   * @param {string} worldId - World ID
   * @param {string} raceId - Race ID
   */
  removeRaceFromWorld(worldId, raceId) {
    const worldRaceIds = this.worldRaces.get(worldId);
    if (worldRaceIds) {
      worldRaceIds.delete(raceId);
    }
  }

  /**
   * Get races available for a specific world
   * @param {string} worldId - World ID
   * @returns {Array} Array of available races
   */
  getWorldRaces(worldId) {
    return this.getAllRaces(worldId);
  }

  /**
   * Validate a race definition
   * @param {Object} raceDefinition - Race configuration
   * @returns {Array} Array of error messages
   */
  validateRaceDefinition(raceDefinition) {
    const errors = [];

    if (!raceDefinition.name || typeof raceDefinition.name !== 'string') {
      errors.push('Race name is required and must be a string');
    }

    // Validate attribute modifiers
    if (raceDefinition.attributeModifiers) {
      const validAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      Object.keys(raceDefinition.attributeModifiers).forEach(attr => {
        if (!validAttributes.includes(attr)) {
          errors.push(`Invalid attribute: ${attr}`);
        }
        if (typeof raceDefinition.attributeModifiers[attr] !== 'number') {
          errors.push(`Attribute modifier for ${attr} must be a number`);
        }
      });
    }

    // Validate lifespan
    if (raceDefinition.lifespan) {
      const requiredFields = ['maturity', 'middleAge', 'old', 'venerable', 'maximum'];
      requiredFields.forEach(field => {
        if (typeof raceDefinition.lifespan[field] !== 'number') {
          errors.push(`Lifespan ${field} must be a number`);
        }
      });
    }

    // Validate subraces
    if (raceDefinition.subraces && Array.isArray(raceDefinition.subraces)) {
      raceDefinition.subraces.forEach((subrace, index) => {
        if (!subrace.name) {
          errors.push(`Subrace ${index} must have a name`);
        }
      });
    }

    return errors;
  }

  /**
   * Save a race as a template
   * @param {string} raceId - Race ID to save
   * @param {string} templateName - Template name
   * @param {string} templateDescription - Template description
   * @returns {Object} Created template
   */
  saveAsTemplate(raceId, templateName, templateDescription) {
    if (!this.templateManager) {
      throw new Error('TemplateManager is required for template operations');
    }

    const race = this.getRace(raceId);
    if (!race) {
      throw new Error(`Race not found: ${raceId}`);
    }

    const template = {
      id: `race_${templateName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      name: templateName,
      description: templateDescription,
      type: 'race',
      version: '1.0.0',
      tags: ['race', 'custom'],
      raceData: { ...race },
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: race.metadata?.author || 'User'
      }
    };

    this.templateManager.addTemplate('races', template);
    return template;
  }

  /**
   * Load a race from a template
   * @param {string} templateId - Template ID
   * @returns {string} Created race ID
   */
  loadFromTemplate(templateId) {
    if (!this.templateManager) {
      throw new Error('TemplateManager is required for template operations');
    }

    const template = this.templateManager.getTemplate('races', templateId);
    if (!template) {
      throw new Error(`Race template not found: ${templateId}`);
    }

    if (!template.raceData) {
      throw new Error('Template does not contain race data');
    }

    return this.registerCustomRace(template.raceData);
  }

  /**
   * Get all race templates
   * @returns {Array} Array of race templates
   */
  getRaceTemplates() {
    if (!this.templateManager) {
      return [];
    }

    return this.templateManager.getAllTemplates('races') || [];
  }

  /**
   * Create a race from a built-in race with modifications
   * @param {string} baseRaceId - Built-in race ID to copy
   * @param {string} newName - Name for the new race
   * @param {Object} modifications - Modifications to apply
   * @returns {string} New race ID
   */
  createVariant(baseRaceId, newName, modifications = {}) {
    const baseRace = this.getRace(baseRaceId);
    if (!baseRace) {
      throw new Error(`Base race not found: ${baseRaceId}`);
    }

    const variantRace = {
      name: newName,
      description: modifications.description || `${newName} (variant of ${baseRace.name})`,
      attributeModifiers: {
        ...(baseRace.attributeModifiers || {}),
        ...(modifications.attributeModifiers || {})
      },
      skillModifiers: {
        ...(baseRace.skillModifiers || {}),
        ...(modifications.skillModifiers || {})
      },
      features: [
        ...(baseRace.features || []),
        ...(modifications.features || [])
      ],
      lifespan: {
        ...(baseRace.lifespan || {}),
        ...(modifications.lifespan || {})
      },
      subraces: modifications.subraces || baseRace.subraces || [],
      appearance: {
        ...(baseRace.appearance || {}),
        ...(modifications.appearance || {})
      },
      culture: {
        ...(baseRace.culture || {}),
        ...(modifications.culture || {})
      },
      author: modifications.author || 'User',
      baseRaceId: baseRaceId
    };

    return this.registerCustomRace(variantRace);
  }

  /**
   * Export custom races to JSON
   * @param {string} worldId - Optional world ID to export world-specific races
   * @returns {Object} Exported races
   */
  exportRaces(worldId = null) {
    const racesToExport = worldId
      ? Array.from(this.worldRaces.get(worldId) || []).map(id => this.customRaces.get(id))
      : Array.from(this.customRaces.values());

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      worldId: worldId,
      races: racesToExport.filter(r => r !== undefined)
    };
  }

  /**
   * Import custom races from JSON
   * @param {Object} exportData - Exported race data
   * @param {string} worldId - Optional world ID to associate races with
   * @returns {Array} Array of imported race IDs
   */
  importRaces(exportData, worldId = null) {
    if (!exportData || !exportData.races) {
      throw new Error('Invalid export data');
    }

    const importedRaceIds = [];

    exportData.races.forEach(raceData => {
      try {
        const raceId = this.registerCustomRace(raceData);
        importedRaceIds.push(raceId);

        if (worldId) {
          this.addRaceToWorld(worldId, raceId);
        }
      } catch (error) {
        console.warn(`Failed to import race ${raceData.name}:`, error.message);
      }
    });

    return importedRaceIds;
  }

  /**
   * Generate a unique race ID
   * @param {string} name - Race name
   * @returns {string} Race ID
   * @private
   */
  _generateRaceId(name) {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    let id = base;
    let counter = 1;

    while (this.customRaces.has(id) || this.getRace(id)) {
      id = `${base}_${counter}`;
      counter++;
    }

    return id;
  }

  /**
   * Clear all custom races
   */
  clear() {
    this.customRaces.clear();
    this.worldRaces.clear();
  }

  /**
   * Get statistics about races
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      totalRaces: RacialTraits.getAllRaces().length + this.customRaces.size,
      builtInRaces: RacialTraits.getAllRaces().length,
      customRaces: this.customRaces.size,
      worldsWithCustomRaces: this.worldRaces.size,
      templates: this.templateManager ? (this.templateManager.getAllTemplates('races') || []).length : 0
    };
  }
}

export default RaceManager;
