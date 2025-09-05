// src/domain/services/InteractionMigrationService.js

import ContentInteraction from '../entities/interactions/ContentInteraction.js';

/**
 * InteractionMigrationService handles migration of existing interaction data
 * to the new hierarchical interaction system while maintaining backward compatibility
 */
export class InteractionMigrationService {

  /**
   * Migrates a single interaction from old format to new ContentInteraction format
   * @param {Object} oldInteractionData - Original interaction data
   * @returns {ContentInteraction} New ContentInteraction instance
   */
  static migrateInteraction(oldInteractionData) {
    if (!oldInteractionData || typeof oldInteractionData !== 'object') {
      throw new Error('Invalid interaction data provided for migration');
    }

    try {
      // Create migration configuration
      const migrationConfig = this._createMigrationConfig(oldInteractionData);

      // Create new ContentInteraction instance
      const migratedInteraction = new ContentInteraction(migrationConfig);

      // Handle nodeId if present (from legacy Interaction class)
      if (oldInteractionData.nodeId) {
        migratedInteraction.nodeId = oldInteractionData.nodeId;
      }

      // Preserve any additional properties that might exist in old data
      this._preserveLegacyProperties(migratedInteraction, oldInteractionData);

      // Add migration metadata
      migratedInteraction._migrationInfo = {
        migratedAt: new Date().toISOString(),
        originalVersion: 'legacy',
        migrationVersion: '1.0.0',
        preservedProperties: this._getPreservedProperties(oldInteractionData)
      };

      return migratedInteraction;
    } catch (error) {
      throw new Error(`Failed to migrate interaction ${oldInteractionData.id || 'unknown'}: ${error.message}`);
    }
  }

  /**
   * Migrates an array of interactions
   * @param {Array} interactionsArray - Array of interaction data
   * @returns {Object} Migration result with successful migrations and errors
   */
  static migrateInteractions(interactionsArray) {
    if (!Array.isArray(interactionsArray)) {
      throw new Error('Interactions must be provided as an array');
    }

    const results = {
      successful: [],
      errors: [],
      totalProcessed: interactionsArray.length,
      successCount: 0,
      errorCount: 0
    };

    interactionsArray.forEach((interactionData, index) => {
      try {
        const migrated = this.migrateInteraction(interactionData);
        results.successful.push(migrated);
        results.successCount++;
      } catch (error) {
        results.errors.push({
          index,
          interactionId: interactionData?.id || `unknown-${index}`,
          error: error.message,
          originalData: interactionData
        });
        results.errorCount++;
      }
    });

    return results;
  }

  /**
   * Migrates all interactions in a node
   * @param {Object} nodeData - Node data containing interactions
   * @returns {Object} Migrated node data
   */
  static migrateNodeInteractions(nodeData) {
    if (!nodeData || typeof nodeData !== 'object') {
      throw new Error('Invalid node data provided for migration');
    }

    const migratedNode = { ...nodeData };

    // Handle legacy interactions array
    if (migratedNode.interactions && Array.isArray(migratedNode.interactions)) {
      const migrationResult = this.migrateInteractions(migratedNode.interactions);

      // Store migrated interactions as contentInteractions
      migratedNode.contentInteractions = migrationResult.successful.map(i => i.toJSON());

      // Keep legacy interactions for backward compatibility
      // Store original interactions unchanged
      migratedNode.interactions = [...nodeData.interactions];

      // Add migration metadata
      migratedNode._interactionMigrationInfo = {
        migratedAt: new Date().toISOString(),
        totalInteractions: migrationResult.totalProcessed,
        successfulMigrations: migrationResult.successCount,
        failedMigrations: migrationResult.errorCount,
        errors: migrationResult.errors
      };
    }

    return migratedNode;
  }

  /**
   * Migrates all interactions in a world
   * @param {Object} worldData - World data containing nodes with interactions
   * @returns {Object} Migrated world data
   */
  static migrateWorldInteractions(worldData) {
    if (!worldData || typeof worldData !== 'object') {
      throw new Error('Invalid world data provided for migration');
    }

    const migratedWorld = { ...worldData };

    // Ensure nodes array exists
    if (!migratedWorld.nodes) {
      migratedWorld.nodes = [];
    }

    if (migratedWorld.nodes && Array.isArray(migratedWorld.nodes)) {
      migratedWorld.nodes = migratedWorld.nodes.map(node =>
        this.migrateNodeInteractions(node)
      );
    }

    // Add world-level migration metadata
    migratedWorld._worldInteractionMigrationInfo = {
      migratedAt: new Date().toISOString(),
      totalNodes: migratedWorld.nodes ? migratedWorld.nodes.length : 0,
      migrationVersion: '1.0.0'
    };

    return migratedWorld;
  }

  /**
   * Creates migration configuration from old interaction data
   * @private
   */
  static _createMigrationConfig(oldData) {
    const config = {
      id: oldData.id,
      name: oldData.name || 'Unnamed Interaction',
      description: oldData.description || '',
      type: oldData.type || 'unknown',
      category: this._determineCategory(oldData),
      author: oldData.author || 'system',
      tags: oldData.tags || [],
      requirements: oldData.requirements || [],
      branches: oldData.branches || [],
      effects: oldData.effects || [],
      participants: oldData.participants || [],
      cooldown: oldData.cooldown || 0,
      repeatable: oldData.repeatable !== undefined ? oldData.repeatable : false,
      lastUsed: oldData.lastUsed || 0
    };

    // Handle nodeId if present (from legacy Interaction class)
    if (oldData.nodeId) {
      config.nodeId = oldData.nodeId;
    }

    return config;
  }

  /**
   * Determines interaction category based on type and content
   * @private
   */
  static _determineCategory(interactionData) {
    const type = interactionData.type || 'dialogue';

    const categoryMap = {
      'dialogue': 'social',
      'combat': 'combat',
      'trade': 'economic',
      'quest': 'social',
      'exploration': 'general',
      'rest': 'general',
      'craft': 'economic'
    };

    return categoryMap[type] || 'general';
  }

  /**
   * Preserves legacy properties that might not be handled by ContentInteraction
   * @private
   */
  static _preserveLegacyProperties(migratedInteraction, oldData) {
    // Preserve any custom properties that aren't part of the standard ContentInteraction
    const standardProps = new Set([
      'id', 'name', 'description', 'type', 'category', 'author', 'tags',
      'requirements', 'branches', 'effects', 'participants', 'cooldown',
      'repeatable', 'lastUsed', 'isContentInteraction', 'overrideFlags'
    ]);

    Object.keys(oldData).forEach(key => {
      if (!standardProps.has(key) && oldData[key] !== undefined) {
        // Store as custom data to preserve
        if (!migratedInteraction._legacyData) {
          migratedInteraction._legacyData = {};
        }
        migratedInteraction._legacyData[key] = oldData[key];
      }
    });
  }

  /**
   * Gets list of preserved properties for migration metadata
   * @private
   */
  static _getPreservedProperties(oldData) {
    const standardProps = new Set([
      'id', 'name', 'description', 'type', 'requirements', 'branches',
      'effects', 'participants', 'cooldown', 'repeatable', 'lastUsed'
    ]);

    return Object.keys(oldData).filter(key => !standardProps.has(key));
  }

  /**
   * Validates migrated interaction data
   * @param {ContentInteraction} migratedInteraction - Migrated interaction
   * @param {Object} originalData - Original interaction data
   * @returns {Object} Validation result
   */
  static validateMigration(migratedInteraction, originalData) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      summary: {}
    };

    try {
      // Check core properties preservation
      const coreProps = ['id', 'name', 'description', 'type'];
      coreProps.forEach(prop => {
        if (originalData[prop] !== migratedInteraction[prop]) {
          validation.warnings.push(`Core property '${prop}' changed during migration`);
        }
      });

      // Validate requirements preservation
      if (originalData.requirements && Array.isArray(originalData.requirements)) {
        if (!migratedInteraction.requirements ||
            migratedInteraction.requirements.length !== originalData.requirements.length) {
          validation.errors.push('Requirements not properly migrated');
          validation.isValid = false;
        }
      }

      // Validate effects preservation
      if (originalData.effects && Array.isArray(originalData.effects)) {
        if (!migratedInteraction.effects ||
            migratedInteraction.effects.length !== originalData.effects.length) {
          validation.errors.push('Effects not properly migrated');
          validation.isValid = false;
        }
      }

      // Validate branches preservation
      if (originalData.branches && Array.isArray(originalData.branches)) {
        if (!migratedInteraction.branches ||
            migratedInteraction.branches.length !== originalData.branches.length) {
          validation.errors.push('Branches not properly migrated');
          validation.isValid = false;
        }
      }

      // Check migration metadata
      if (!migratedInteraction._migrationInfo) {
        validation.warnings.push('Migration metadata is missing');
      }

      // Validate ContentInteraction properties
      if (!migratedInteraction.isContentInteraction) {
        validation.errors.push('Migrated interaction is not properly marked as ContentInteraction');
        validation.isValid = false;
      }

      validation.summary = {
        originalType: originalData.type,
        migratedCategory: migratedInteraction.category,
        hasLegacyData: !!migratedInteraction._legacyData
      };

    } catch (error) {
      validation.errors.push(`Validation failed: ${error.message}`);
      validation.isValid = false;
    }

    return validation;
  }

  /**
   * Creates rollback data for migration reversal
   * @param {Object} originalData - Original interaction data
   * @returns {Object} Rollback information
   */
  static createRollbackData(originalData) {
    return {
      rollbackData: JSON.parse(JSON.stringify(originalData)),
      rollbackTimestamp: new Date().toISOString(),
      rollbackVersion: '1.0.0'
    };
  }

  /**
   * Rollback migrated interaction to original format
   * @param {ContentInteraction} migratedInteraction - Migrated interaction
   * @param {Object} rollbackInfo - Rollback information
   * @returns {Object} Original format data
   */
  static rollbackMigration(migratedInteraction, rollbackInfo) {
    if (!rollbackInfo || !rollbackInfo.rollbackData) {
      throw new Error('Valid rollback information is required');
    }

    // Return the original data
    return JSON.parse(JSON.stringify(rollbackInfo.rollbackData));
  }

  /**
   * Checks if interaction data needs migration
   * @param {Object} interactionData - Interaction data to check
   * @returns {boolean} True if migration is needed
   */
  static needsMigration(interactionData) {
    if (!interactionData || typeof interactionData !== 'object') {
      return false;
    }

    // Check if it's already a ContentInteraction
    if (interactionData.isContentInteraction) {
      return false;
    }

    // Check if it has migration metadata
    if (interactionData._migrationInfo) {
      return false;
    }

    // Check for legacy properties that indicate old format
    const legacyIndicators = ['nodeId'];
    return legacyIndicators.some(prop => interactionData[prop] !== undefined);
  }

  /**
   * Performs a dry run migration to analyze what would be changed
   * @param {Object} interactionData - Interaction data to analyze
   * @returns {Object} Analysis of what would be migrated
   */
  static analyzeMigration(interactionData) {
    if (!interactionData || typeof interactionData !== 'object') {
      return { needsMigration: false, changes: [] };
    }

    const changes = [];

    if (!interactionData.isContentInteraction) {
      changes.push('Convert to ContentInteraction format');
    }

    if (!interactionData.category) {
      changes.push('Add category based on interaction type');
    }

    if (!interactionData.author) {
      changes.push('Add default author');
    }

    if (!interactionData.tags || !Array.isArray(interactionData.tags)) {
      changes.push('Initialize tags array');
    }

    if (interactionData.nodeId) {
      changes.push('Preserve nodeId as legacy property');
    }

    return {
      needsMigration: changes.length > 0,
      changes
    };
  }

  /**
   * Gets migration statistics for a dataset
   * @param {Array} interactionsArray - Array of interaction data
   * @returns {Object} Migration statistics
   */
  static getMigrationStatistics(interactionsArray) {
    if (!Array.isArray(interactionsArray)) {
      throw new Error('Interactions must be provided as an array');
    }

    const stats = {
      total: interactionsArray.length,
      needsMigration: 0,
      alreadyMigrated: 0,
      byType: {},
      byCategory: {}
    };

    interactionsArray.forEach(interaction => {
      if (this.needsMigration(interaction)) {
        stats.needsMigration++;
      } else if (interaction._migrationInfo) {
        stats.alreadyMigrated++;
      }

      // Count by type
      const type = interaction.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Count by category (for migrated items)
      if (interaction.category) {
        stats.byCategory[interaction.category] = (stats.byCategory[interaction.category] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Migrates interactions with progress tracking
   * @param {Array} interactionsArray - Array of interaction data
   * @param {Function} progressCallback - Optional progress callback
   * @returns {Array} Array of migrated interactions
   */
  static migrateWithProgress(interactionsArray, progressCallback = null) {
    if (!Array.isArray(interactionsArray)) {
      throw new Error('Interactions must be provided as an array');
    }

    const migratedInteractions = [];
    const total = interactionsArray.length;

    interactionsArray.forEach((interaction, index) => {
      try {
        const migrated = this.migrateInteraction(interaction);
        migratedInteractions.push(migrated);

        if (progressCallback && typeof progressCallback === 'function') {
          progressCallback({
            current: index + 1,
            total,
            percentage: Math.round(((index + 1) / total) * 100),
            currentInteraction: interaction.name || interaction.id || 'Unknown'
          });
        }
      } catch (error) {
        const interactionId = interaction?.id || index;
        throw new Error(`Failed to migrate interaction ${interactionId}: ${error.message}`);
      }
    });

    return migratedInteractions;
  }
}
