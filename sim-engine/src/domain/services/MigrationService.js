// src/domain/services/MigrationService.js

import { Alignment } from '../value-objects/Alignment.js';
import { Influence } from '../value-objects/Influence.js';
import { Prestige } from '../value-objects/Prestige.js';
import PersonalityProfile from '../value-objects/PersonalityProfile.js';
import { RacialTraits } from '../value-objects/RacialTraits.js';

/**
 * Migration service for converting legacy system data to new value objects
 * Provides backward compatibility for existing character data
 */
export class MigrationService {
  
  /**
   * Migrate AlignmentManager data to Alignment value object
   * @param {Object} alignmentManagerData - Serialized AlignmentManager data
   * @returns {Alignment} New Alignment value object
   */
  static migrateAlignmentManager(alignmentManagerData) {
    if (!alignmentManagerData) {
      throw new Error('AlignmentManager data is required for migration');
    }

    try {
      // Validate required fields
      const axes = alignmentManagerData.axes || [];
      const playerAlignment = alignmentManagerData.playerAlignment || {};
      const history = alignmentManagerData.history || {};

      // Convert history format if needed
      const convertedHistory = {};
      Object.entries(history).forEach(([axisId, changes]) => {
        convertedHistory[axisId] = changes.map(change => ({
          timestamp: change.timestamp instanceof Date ? change.timestamp : new Date(change.timestamp),
          change: change.change,
          newValue: change.newValue,
          reason: change.reason,
          historicalContext: change.historicalContext || null
        }));
      });

      return new Alignment(axes, playerAlignment, convertedHistory);
    } catch (error) {
      throw new Error(`Failed to migrate AlignmentManager data: ${error.message}`);
    }
  }

  /**
   * Migrate InfluenceManager data to Influence value object
   * @param {Object} influenceManagerData - Serialized InfluenceManager data
   * @returns {Influence} New Influence value object
   */
  static migrateInfluenceManager(influenceManagerData) {
    if (!influenceManagerData) {
      throw new Error('InfluenceManager data is required for migration');
    }

    try {
      // Validate required fields
      const domains = influenceManagerData.domains || [];
      const playerInfluence = influenceManagerData.playerInfluence || {};
      const history = influenceManagerData.history || {};

      // Convert history format if needed
      const convertedHistory = {};
      Object.entries(history).forEach(([domainId, changes]) => {
        convertedHistory[domainId] = changes.map(change => ({
          timestamp: change.timestamp instanceof Date ? change.timestamp : new Date(change.timestamp),
          change: change.change,
          newValue: change.newValue,
          reason: change.reason,
          settlementContext: change.settlementContext || null
        }));
      });

      return new Influence(domains, playerInfluence, convertedHistory);
    } catch (error) {
      throw new Error(`Failed to migrate InfluenceManager data: ${error.message}`);
    }
  }

  /**
   * Migrate PrestigeManager data to Prestige value object
   * @param {Object} prestigeManagerData - Serialized PrestigeManager data
   * @returns {Prestige} New Prestige value object
   */
  static migratePrestigeManager(prestigeManagerData) {
    if (!prestigeManagerData) {
      throw new Error('PrestigeManager data is required for migration');
    }

    try {
      // Validate required fields
      const tracks = prestigeManagerData.tracks || [];
      const playerPrestige = prestigeManagerData.playerPrestige || {};
      const history = prestigeManagerData.history || {};

      // Convert history format if needed
      const convertedHistory = {};
      Object.entries(history).forEach(([trackId, changes]) => {
        convertedHistory[trackId] = changes.map(change => ({
          timestamp: change.timestamp instanceof Date ? change.timestamp : new Date(change.timestamp),
          change: change.change,
          newValue: change.newValue,
          reason: change.reason,
          socialContext: change.socialContext || null
        }));
      });

      return new Prestige(tracks, playerPrestige, convertedHistory);
    } catch (error) {
      throw new Error(`Failed to migrate PrestigeManager data: ${error.message}`);
    }
  }

  /**
   * Migrate PersonalitySystem data to PersonalityProfile value object
   * @param {Object} personalitySystemData - Serialized PersonalitySystem data
   * @returns {PersonalityProfile} New PersonalityProfile value object
   */
  static migratePersonalitySystem(personalitySystemData) {
    if (!personalitySystemData) {
      throw new Error('PersonalitySystem data is required for migration');
    }

    try {
      // Convert the old format to new format
      const config = {
        traits: personalitySystemData.traits || [],
        attributes: personalitySystemData.attributes || [],
        emotionalTendencies: personalitySystemData.emotionalTendencies || [],
        cognitiveTraits: personalitySystemData.cognitiveTraits || []
      };

      return new PersonalityProfile(config);
    } catch (error) {
      throw new Error(`Failed to migrate PersonalitySystem data: ${error.message}`);
    }
  }

  /**
   * Migrate RaceSystem data to RacialTraits value object
   * @param {Object} raceSystemData - Character's race data from old RaceSystem
   * @returns {RacialTraits} New RacialTraits value object
   */
  static migrateRaceSystem(raceSystemData) {
    if (!raceSystemData) {
      throw new Error('RaceSystem data is required for migration');
    }

    try {
      // Extract race and subrace information
      const raceId = raceSystemData.raceId || raceSystemData.race || 'human';
      const subraceId = raceSystemData.subraceId || raceSystemData.subrace || null;

      return new RacialTraits(raceId, subraceId);
    } catch (error) {
      throw new Error(`Failed to migrate RaceSystem data: ${error.message}`);
    }
  }

  /**
   * Migrate complete character data from old format to new format
   * @param {Object} oldCharacterData - Complete character data in old format
   * @returns {Object} Character data in new format
   */
  static migrateCharacterData(oldCharacterData) {
    if (!oldCharacterData) {
      throw new Error('Character data is required for migration');
    }

    try {
      const migratedData = { ...oldCharacterData };

      // Migrate alignment data if present
      if (oldCharacterData.alignmentManager || oldCharacterData.alignment) {
        const alignmentData = oldCharacterData.alignmentManager || oldCharacterData.alignment;
        migratedData.alignment = this.migrateAlignmentManager(alignmentData).toJSON();
        delete migratedData.alignmentManager;
      }

      // Migrate influence data if present
      if (oldCharacterData.influenceManager || oldCharacterData.influence) {
        const influenceData = oldCharacterData.influenceManager || oldCharacterData.influence;
        migratedData.influence = this.migrateInfluenceManager(influenceData).toJSON();
        delete migratedData.influenceManager;
      }

      // Migrate prestige data if present
      if (oldCharacterData.prestigeManager || oldCharacterData.prestige) {
        const prestigeData = oldCharacterData.prestigeManager || oldCharacterData.prestige;
        migratedData.prestige = this.migratePrestigeManager(prestigeData).toJSON();
        delete migratedData.prestigeManager;
      }

      // Migrate personality data if present
      if (oldCharacterData.personalitySystem || oldCharacterData.personality) {
        const personalityData = oldCharacterData.personalitySystem || oldCharacterData.personality;
        migratedData.personalityProfile = this.migratePersonalitySystem(personalityData).toJSON();
        delete migratedData.personalitySystem;
        delete migratedData.personality;
      }

      // Migrate race data if present
      if (oldCharacterData.raceSystem || oldCharacterData.race) {
        const raceData = oldCharacterData.raceSystem || oldCharacterData.race;
        migratedData.racialTraits = this.migrateRaceSystem(raceData).toJSON();
        delete migratedData.raceSystem;
        delete migratedData.race;
      }

      // Add migration metadata
      migratedData._migrationInfo = {
        migratedAt: new Date().toISOString(),
        version: '1.0.0',
        migratedSystems: []
      };

      // Track which systems were migrated
      if (oldCharacterData.alignmentManager || oldCharacterData.alignment) {
        migratedData._migrationInfo.migratedSystems.push('alignment');
      }
      if (oldCharacterData.influenceManager || oldCharacterData.influence) {
        migratedData._migrationInfo.migratedSystems.push('influence');
      }
      if (oldCharacterData.prestigeManager || oldCharacterData.prestige) {
        migratedData._migrationInfo.migratedSystems.push('prestige');
      }
      if (oldCharacterData.personalitySystem || oldCharacterData.personality) {
        migratedData._migrationInfo.migratedSystems.push('personality');
      }
      if (oldCharacterData.raceSystem || oldCharacterData.race) {
        migratedData._migrationInfo.migratedSystems.push('race');
      }

      return migratedData;
    } catch (error) {
      throw new Error(`Failed to migrate character data: ${error.message}`);
    }
  }

  /**
   * Batch migrate multiple character records
   * @param {Array} characterDataArray - Array of character data objects
   * @returns {Array} Array of migrated character data objects
   */
  static batchMigrateCharacters(characterDataArray) {
    if (!Array.isArray(characterDataArray)) {
      throw new Error('Character data array is required for batch migration');
    }

    const results = [];
    const errors = [];

    characterDataArray.forEach((characterData, index) => {
      try {
        const migrated = this.migrateCharacterData(characterData);
        results.push(migrated);
      } catch (error) {
        errors.push({
          index,
          characterId: characterData?.id || `unknown-${index}`,
          error: error.message
        });
      }
    });

    return {
      successful: results,
      errors: errors,
      totalProcessed: characterDataArray.length,
      successCount: results.length,
      errorCount: errors.length
    };
  }

  /**
   * Validate migrated data integrity
   * @param {Object} originalData - Original character data
   * @param {Object} migratedData - Migrated character data
   * @returns {Object} Validation result
   */
  static validateMigration(originalData, migratedData) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      summary: {}
    };

    try {
      // Check if core character properties are preserved
      const coreProperties = ['id', 'name', 'age', 'background'];
      coreProperties.forEach(prop => {
        if (originalData[prop] !== migratedData[prop]) {
          validation.warnings.push(`Core property '${prop}' changed during migration`);
        }
      });

      // Validate alignment migration
      if (originalData.alignmentManager && migratedData.alignment) {
        const originalValues = originalData.alignmentManager.playerAlignment || {};
        const migratedValues = migratedData.alignment.values || {};
        
        Object.keys(originalValues).forEach(axisId => {
          if (originalValues[axisId] !== migratedValues[axisId]) {
            validation.errors.push(`Alignment value for '${axisId}' changed during migration`);
            validation.isValid = false;
          }
        });
        
        validation.summary.alignment = 'migrated';
      }

      // Validate influence migration
      if (originalData.influenceManager && migratedData.influence) {
        const originalValues = originalData.influenceManager.playerInfluence || {};
        const migratedValues = migratedData.influence.values || {};
        
        Object.keys(originalValues).forEach(domainId => {
          if (originalValues[domainId] !== migratedValues[domainId]) {
            validation.errors.push(`Influence value for '${domainId}' changed during migration`);
            validation.isValid = false;
          }
        });
        
        validation.summary.influence = 'migrated';
      }

      // Validate prestige migration
      if (originalData.prestigeManager && migratedData.prestige) {
        const originalValues = originalData.prestigeManager.playerPrestige || {};
        const migratedValues = migratedData.prestige.values || {};
        
        Object.keys(originalValues).forEach(trackId => {
          if (originalValues[trackId] !== migratedValues[trackId]) {
            validation.errors.push(`Prestige value for '${trackId}' changed during migration`);
            validation.isValid = false;
          }
        });
        
        validation.summary.prestige = 'migrated';
      }

      // Validate personality migration
      if (originalData.personalitySystem && migratedData.personalityProfile) {
        validation.summary.personality = 'migrated';
        // Personality structure is more complex, so we just verify it exists
        if (!migratedData.personalityProfile.traits) {
          validation.warnings.push('Personality traits may not have migrated correctly');
        }
      }

      // Validate race migration
      if (originalData.raceSystem && migratedData.racialTraits) {
        validation.summary.race = 'migrated';
        // Race data should maintain the same race ID
        if (originalData.raceSystem.raceId && 
            originalData.raceSystem.raceId !== migratedData.racialTraits.raceId) {
          validation.errors.push('Race ID changed during migration');
          validation.isValid = false;
        }
      }

      // Check for migration metadata
      if (!migratedData._migrationInfo) {
        validation.warnings.push('Migration metadata is missing');
      }

    } catch (error) {
      validation.errors.push(`Validation failed: ${error.message}`);
      validation.isValid = false;
    }

    return validation;
  }

  /**
   * Create rollback data for migration reversal
   * @param {Object} originalData - Original character data before migration
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
   * Rollback migrated data to original format
   * @param {Object} rollbackInfo - Rollback information created during migration
   * @returns {Object} Original format data
   */
  static rollbackMigration(rollbackInfo) {
    if (!rollbackInfo || !rollbackInfo.rollbackData) {
      throw new Error('Valid rollback information is required');
    }

    return JSON.parse(JSON.stringify(rollbackInfo.rollbackData));
  }

  /**
   * Check if data needs migration
   * @param {Object} characterData - Character data to check
   * @returns {Object} Migration assessment
   */
  static assessMigrationNeeds(characterData) {
    const assessment = {
      needsMigration: false,
      systems: [],
      recommendations: []
    };

    // Check for legacy system presence
    if (characterData.alignmentManager) {
      assessment.needsMigration = true;
      assessment.systems.push('alignmentManager');
      assessment.recommendations.push('Migrate AlignmentManager to Alignment value object');
    }

    if (characterData.influenceManager) {
      assessment.needsMigration = true;
      assessment.systems.push('influenceManager');
      assessment.recommendations.push('Migrate InfluenceManager to Influence value object');
    }

    if (characterData.prestigeManager) {
      assessment.needsMigration = true;
      assessment.systems.push('prestigeManager');
      assessment.recommendations.push('Migrate PrestigeManager to Prestige value object');
    }

    if (characterData.personalitySystem) {
      assessment.needsMigration = true;
      assessment.systems.push('personalitySystem');
      assessment.recommendations.push('Migrate PersonalitySystem to PersonalityProfile value object');
    }

    if (characterData.raceSystem) {
      assessment.needsMigration = true;
      assessment.systems.push('raceSystem');
      assessment.recommendations.push('Migrate RaceSystem to RacialTraits value object');
    }

    // Check for already migrated data
    if (characterData._migrationInfo) {
      assessment.alreadyMigrated = true;
      assessment.migrationDate = characterData._migrationInfo.migratedAt;
      assessment.migratedSystems = characterData._migrationInfo.migratedSystems;
    }

    return assessment;
  }

  /**
   * Get migration statistics for a dataset
   * @param {Array} characterDataArray - Array of character data
   * @returns {Object} Migration statistics
   */
  static getMigrationStatistics(characterDataArray) {
    if (!Array.isArray(characterDataArray)) {
      throw new Error('Character data array is required');
    }

    const stats = {
      total: characterDataArray.length,
      needsMigration: 0,
      alreadyMigrated: 0,
      systemBreakdown: {
        alignmentManager: 0,
        influenceManager: 0,
        prestigeManager: 0,
        personalitySystem: 0,
        raceSystem: 0
      }
    };

    characterDataArray.forEach(characterData => {
      const assessment = this.assessMigrationNeeds(characterData);
      
      if (assessment.needsMigration) {
        stats.needsMigration++;
      }
      
      if (assessment.alreadyMigrated) {
        stats.alreadyMigrated++;
      }

      // Count system occurrences
      assessment.systems.forEach(system => {
        if (stats.systemBreakdown[system] !== undefined) {
          stats.systemBreakdown[system]++;
        }
      });
    });

    return stats;
  }
}