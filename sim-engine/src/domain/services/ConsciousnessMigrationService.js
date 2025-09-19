/**
 * ConsciousnessMigrationService
 *
 * Handles migration of consciousness data between different format versions,
 * providing backward compatibility and data validation/repair capabilities.
 * Supports migration from simple frequency/coherence format to full consciousness state.
 */

import BaseDomainService from './BaseDomainService.js';

class ConsciousnessMigrationService extends BaseDomainService {
  constructor(logger = null) {
    super();
    this.logger = logger;

    // Version definitions for consciousness data formats
    this.VERSIONS = {
      V1_0: '1.0',  // Simple frequency/coherence only
      V1_1: '1.1',  // Added behavioral state
      V1_2: '1.2',  // Added significant events and memories
      V2_0: '2.0',  // Full consciousness state with all features
      CURRENT: '2.0'
    };

    // Default values for consciousness parameters
    this.DEFAULTS = {
      frequency: 7.5,      // Alpha baseline (7.5 Hz)
      coherence: 0.5,      // Moderate coherence
      baseFrequency: 7.5,
      baseCoherence: 0.5,
      updateTriggerThreshold: 0.3,
      lastUpdate: Date.now(),
      behavioralState: {
        energy: 'moderate',
        focus: 'balanced',
        mood: 'content',
        socialDrive: 0.6,
        riskTolerance: 0.5,
        ambition: 0.7
      },
      significantEvents: [],
      significantMemories: [],
      activeGoals: []
    };

    // Validation bounds
    this.BOUNDS = {
      frequency: { min: 3.0, max: 15.0 },
      coherence: { min: 0.2, max: 1.0 },
      updateTriggerThreshold: { min: 0.1, max: 1.0 }
    };
  }

  /**
   * Migrate consciousness data to the latest format
   * @param {Object} consciousnessData - Consciousness data to migrate
   * @param {Object} options - Migration options
   * @returns {Object} Migration result with migrated data and metadata
   */
  migrateConsciousnessData(consciousnessData, options = {}) {
    try {
      if (!consciousnessData || consciousnessData === null || typeof consciousnessData !== 'object') {
        if (options.repairCorrupted) {
          // Return default consciousness data for null/invalid input when repair is enabled
          return {
            success: true,
            migrated: true,
            data: { ...this.DEFAULTS },
            version: 'unknown',
            message: 'Created default consciousness data for invalid input'
          };
        }
        throw new Error('Invalid consciousness data provided');
      }

      // Detect current version/format
      const detectedVersion = this._detectVersion(consciousnessData);

      if (this.logger) {
        this.logger.info(`Detected consciousness data version: ${detectedVersion}`);
      }

      // If already current version, validate and return
      if (detectedVersion === this.VERSIONS.CURRENT) {
        const validation = this.validateConsciousnessData(consciousnessData);
        if (!validation.isValid) {
          if (options.repairCorrupted) {
            return this.repairCorruptedData(consciousnessData, validation.errors);
          }
          throw new Error(`Consciousness data validation failed: ${validation.errors.join(', ')}`);
        }
        return {
          success: true,
          migrated: false,
          data: consciousnessData,
          version: detectedVersion,
          message: 'Data already in current format'
        };
      }

      // Perform migration based on detected version
      let migratedData;
      switch (detectedVersion) {
        case this.VERSIONS.V1_0:
          migratedData = this._migrateFromV1_0(consciousnessData);
          break;
        case this.VERSIONS.V1_1:
          migratedData = this._migrateFromV1_1(consciousnessData);
          break;
        case this.VERSIONS.V1_2:
          migratedData = this._migrateFromV1_2(consciousnessData);
          break;
        default:
          // Unknown format, attempt generic migration
          migratedData = this._migrateFromUnknown(consciousnessData);
      }

      // Validate migrated data
      const validation = this.validateConsciousnessData(migratedData);
      if (!validation.isValid) {
        if (options.repairCorrupted) {
          migratedData = this.repairCorruptedData(migratedData, validation.errors).data;
        } else {
          throw new Error(`Migrated consciousness data validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Add migration metadata
      migratedData._migrationInfo = {
        migratedAt: new Date().toISOString(),
        fromVersion: detectedVersion,
        toVersion: this.VERSIONS.CURRENT,
        migrationType: 'consciousness_data'
      };

      if (this.logger) {
        this.logger.info(`Successfully migrated consciousness data from ${detectedVersion} to ${this.VERSIONS.CURRENT}`);
      }

      return {
        success: true,
        migrated: true,
        data: migratedData,
        fromVersion: detectedVersion,
        toVersion: this.VERSIONS.CURRENT,
        message: `Migrated from ${detectedVersion} to ${this.VERSIONS.CURRENT}`
      };

    } catch (error) {
      if (this.logger) {
        this.logger.error(`Consciousness data migration failed: ${error.message}`);
      }

      return {
        success: false,
        migrated: false,
        error: error.message,
        data: consciousnessData // Return original data on failure
      };
    }
  }

  /**
   * Detect the version/format of consciousness data
   * @param {Object} data - Consciousness data to analyze
   * @returns {string} Detected version
   * @private
   */
  _detectVersion(data) {
    // Check for version metadata first
    if (data._migrationInfo && data._migrationInfo.toVersion) {
      return data._migrationInfo.toVersion;
    }

    // V2.0: Full consciousness state with all features
    if (data.baseFrequency !== undefined &&
        data.baseCoherence !== undefined &&
        data.behavioralState &&
        data.significantEvents &&
        data.significantMemories) {
      return this.VERSIONS.V2_0;
    }

    // V1.2: Added significant events and memories
    if (data.significantEvents || data.significantMemories) {
      return this.VERSIONS.V1_2;
    }

    // V1.1: Added behavioral state
    if (data.behavioralState) {
      return this.VERSIONS.V1_1;
    }

    // V1.0: Simple frequency/coherence only
    if (data.frequency !== undefined || data.coherence !== undefined) {
      return this.VERSIONS.V1_0;
    }

    // Unknown format
    return 'unknown';
  }

  /**
   * Migrate from V1.0 (simple frequency/coherence) to V2.0
   * @param {Object} data - V1.0 consciousness data
   * @returns {Object} V2.0 consciousness data
   * @private
   */
  _migrateFromV1_0(data) {
    const migrated = { ...this.DEFAULTS };

    // Migrate frequency and coherence
    if (data.frequency !== undefined) {
      migrated.baseFrequency = this._clampValue(data.frequency, this.BOUNDS.frequency);
    }
    if (data.coherence !== undefined) {
      migrated.baseCoherence = this._clampValue(data.coherence, this.BOUNDS.coherence);
    }

    // Generate behavioral state from frequency/coherence
    migrated.behavioralState = this._generateBehavioralStateFromParameters(
      migrated.baseFrequency,
      migrated.baseCoherence
    );

    return migrated;
  }

  /**
   * Migrate from V1.1 (with behavioral state) to V2.0
   * @param {Object} data - V1.1 consciousness data
   * @returns {Object} V2.0 consciousness data
   * @private
   */
  _migrateFromV1_1(data) {
    const migrated = { ...this.DEFAULTS };

    // Copy existing data
    if (data.frequency !== undefined) migrated.baseFrequency = data.frequency;
    if (data.coherence !== undefined) migrated.baseCoherence = data.coherence;
    if (data.behavioralState) migrated.behavioralState = { ...data.behavioralState };
    if (data.lastUpdate) migrated.lastUpdate = data.lastUpdate;
    if (data.updateTriggerThreshold !== undefined) migrated.updateTriggerThreshold = data.updateTriggerThreshold;

    // Ensure behavioral state is valid
    if (!this._isValidBehavioralState(migrated.behavioralState)) {
      migrated.behavioralState = this._generateBehavioralStateFromParameters(
        migrated.baseFrequency,
        migrated.baseCoherence
      );
    }

    return migrated;
  }

  /**
   * Migrate from V1.2 (with events/memories) to V2.0
   * @param {Object} data - V1.2 consciousness data
   * @returns {Object} V2.0 consciousness data
   * @private
   */
  _migrateFromV1_2(data) {
    const migrated = { ...this.DEFAULTS };

    // Copy all V1.1 data
    Object.assign(migrated, this._migrateFromV1_1(data));

    // Copy events and memories
    if (data.significantEvents) migrated.significantEvents = [...data.significantEvents];
    if (data.significantMemories) migrated.significantMemories = [...data.significantMemories];
    if (data.activeGoals) migrated.activeGoals = [...data.activeGoals];

    return migrated;
  }

  /**
   * Attempt migration from unknown format
   * @param {Object} data - Unknown format consciousness data
   * @returns {Object} Best-effort migrated data
   * @private
   */
  _migrateFromUnknown(data) {
    const migrated = { ...this.DEFAULTS };

    // Try to extract any recognizable fields
    if (data.frequency !== undefined) migrated.baseFrequency = data.frequency;
    if (data.coherence !== undefined) migrated.baseCoherence = data.coherence;
    if (data.baseFrequency !== undefined) migrated.baseFrequency = data.baseFrequency;
    if (data.baseCoherence !== undefined) migrated.baseCoherence = data.baseCoherence;

    // Try to extract behavioral state
    if (data.behavioralState && typeof data.behavioralState === 'object') {
      migrated.behavioralState = { ...data.behavioralState };
    }

    // Try to extract arrays
    if (Array.isArray(data.significantEvents)) migrated.significantEvents = [...data.significantEvents];
    if (Array.isArray(data.significantMemories)) migrated.significantMemories = [...data.significantMemories];
    if (Array.isArray(data.activeGoals)) migrated.activeGoals = [...data.activeGoals];
    if (Array.isArray(data.goals)) migrated.activeGoals = [...data.goals];

    // Extract timestamps
    if (data.lastUpdate) migrated.lastUpdate = data.lastUpdate;
    if (data.updateTriggerThreshold !== undefined) migrated.updateTriggerThreshold = data.updateTriggerThreshold;

    // Validate and repair
    return this.repairCorruptedData(migrated, []).data;
  }

  /**
   * Generate behavioral state from consciousness parameters
   * @param {number} frequency - Consciousness frequency
   * @param {number} coherence - Consciousness coherence
   * @returns {Object} Generated behavioral state
   * @private
   */
  _generateBehavioralStateFromParameters(frequency, coherence) {
    return {
      energy: this._mapFrequencyToEnergy(frequency),
      focus: this._mapCoherenceToFocus(coherence),
      mood: this._calculateMoodFromState(frequency, coherence),
      socialDrive: Math.max(0, Math.min(1, (frequency - 4) / 8)),
      riskTolerance: Math.max(0, Math.min(1, (frequency - 6) / 6)),
      ambition: Math.max(0, Math.min(1, coherence * (frequency / 10)))
    };
  }

  /**
   * Map frequency to energy level
   * @param {number} frequency - Consciousness frequency
   * @returns {string} Energy level
   * @private
   */
  _mapFrequencyToEnergy(frequency) {
    if (frequency < 6) return 'low';
    if (frequency > 10) return 'high';
    return 'moderate';
  }

  /**
   * Map coherence to focus level
   * @param {number} coherence - Consciousness coherence
   * @returns {string} Focus level
   * @private
   */
  _mapCoherenceToFocus(coherence) {
    if (coherence < 0.5) return 'scattered';
    if (coherence > 0.8) return 'focused';
    return 'balanced';
  }

  /**
   * Calculate mood from frequency and coherence
   * @param {number} frequency - Consciousness frequency
   * @param {number} coherence - Consciousness coherence
   * @returns {string} Mood state
   * @private
   */
  _calculateMoodFromState(frequency, coherence) {
    const moodScore = (frequency / 15) + (coherence * 0.5);

    if (moodScore < 0.5) return 'depressed';
    if (moodScore < 0.75) return 'content';
    if (moodScore < 1.0) return 'optimistic';
    return 'excited';
  }

  /**
   * Check if behavioral state object is valid
   * @param {Object} behavioralState - Behavioral state to validate
   * @returns {boolean} True if valid
   * @private
   */
  _isValidBehavioralState(behavioralState) {
    if (!behavioralState || typeof behavioralState !== 'object') {
      return false;
    }

    const requiredFields = ['energy', 'focus', 'mood', 'socialDrive', 'riskTolerance', 'ambition'];
    return requiredFields.every(field => behavioralState.hasOwnProperty(field));
  }

  /**
   * Clamp a value to specified bounds
   * @param {number} value - Value to clamp
   * @param {Object} bounds - Bounds object with min/max
   * @returns {number} Clamped value
   * @private
   */
  _clampValue(value, bounds) {
    if (typeof value !== 'number' || isNaN(value)) {
      return bounds.min + (bounds.max - bounds.min) / 2; // Return midpoint as default
    }
    return Math.max(bounds.min, Math.min(bounds.max, value));
  }

  /**
   * Validate consciousness data structure and values
   * @param {Object} data - Consciousness data to validate
   * @returns {Object} Validation result
   */
  validateConsciousnessData(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
      errors.push('Consciousness data must be an object');
      return { isValid: false, errors };
    }

    // Validate frequency
    if (data.baseFrequency !== undefined) {
      if (typeof data.baseFrequency !== 'number' || isNaN(data.baseFrequency)) {
        errors.push('baseFrequency must be a valid number');
      } else if (data.baseFrequency < this.BOUNDS.frequency.min || data.baseFrequency > this.BOUNDS.frequency.max) {
        errors.push(`baseFrequency must be between ${this.BOUNDS.frequency.min} and ${this.BOUNDS.frequency.max}`);
      }
    }

    // Validate coherence
    if (data.baseCoherence !== undefined) {
      if (typeof data.baseCoherence !== 'number' || isNaN(data.baseCoherence)) {
        errors.push('baseCoherence must be a valid number');
      } else if (data.baseCoherence < this.BOUNDS.coherence.min || data.baseCoherence > this.BOUNDS.coherence.max) {
        errors.push(`baseCoherence must be between ${this.BOUNDS.coherence.min.toFixed(1)} and ${this.BOUNDS.coherence.max.toFixed(1)}`);
      }
    }

    // Validate behavioral state
    if (data.behavioralState) {
      if (typeof data.behavioralState !== 'object') {
        errors.push('behavioralState must be an object');
      } else if (!this._isValidBehavioralState(data.behavioralState)) {
        errors.push('behavioralState is missing required fields');
      }
    }

    // Validate arrays
    ['significantEvents', 'significantMemories', 'activeGoals'].forEach(field => {
      if (data[field] !== undefined && !Array.isArray(data[field])) {
        errors.push(`${field} must be an array`);
      }
    });

    // Validate update trigger threshold
    if (data.updateTriggerThreshold !== undefined) {
      if (typeof data.updateTriggerThreshold !== 'number' || isNaN(data.updateTriggerThreshold)) {
        errors.push('updateTriggerThreshold must be a valid number');
      } else if (data.updateTriggerThreshold < this.BOUNDS.updateTriggerThreshold.min ||
                 data.updateTriggerThreshold > this.BOUNDS.updateTriggerThreshold.max) {
        errors.push(`updateTriggerThreshold must be between ${this.BOUNDS.updateTriggerThreshold.min} and ${this.BOUNDS.updateTriggerThreshold.max}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Repair corrupted consciousness data
   * @param {Object} data - Corrupted consciousness data
   * @param {Array} validationErrors - List of validation errors
   * @returns {Object} Repair result with repaired data
   */
  repairCorruptedData(data, validationErrors = []) {
    const repaired = { ...data };

    // Repair frequency
    if (!repaired.baseFrequency || typeof repaired.baseFrequency !== 'number' || isNaN(repaired.baseFrequency)) {
      repaired.baseFrequency = this.DEFAULTS.baseFrequency;
    } else {
      repaired.baseFrequency = this._clampValue(repaired.baseFrequency, this.BOUNDS.frequency);
    }

    // Repair coherence
    if (!repaired.baseCoherence || typeof repaired.baseCoherence !== 'number' || isNaN(repaired.baseCoherence)) {
      repaired.baseCoherence = this.DEFAULTS.baseCoherence;
    } else {
      repaired.baseCoherence = this._clampValue(repaired.baseCoherence, this.BOUNDS.coherence);
    }

    // Repair behavioral state
    if (!repaired.behavioralState || !this._isValidBehavioralState(repaired.behavioralState)) {
      repaired.behavioralState = this._generateBehavioralStateFromParameters(
        repaired.baseFrequency,
        repaired.baseCoherence
      );
    }

    // Repair arrays
    ['significantEvents', 'significantMemories', 'activeGoals'].forEach(field => {
      if (!Array.isArray(repaired[field])) {
        repaired[field] = [];
      }
    });

    // Repair update trigger threshold
    if (typeof repaired.updateTriggerThreshold !== 'number' || isNaN(repaired.updateTriggerThreshold)) {
      repaired.updateTriggerThreshold = this.DEFAULTS.updateTriggerThreshold;
    } else {
      repaired.updateTriggerThreshold = this._clampValue(repaired.updateTriggerThreshold, this.BOUNDS.updateTriggerThreshold);
    }

    // Repair last update timestamp
    if (!repaired.lastUpdate || typeof repaired.lastUpdate !== 'number') {
      repaired.lastUpdate = this.DEFAULTS.lastUpdate;
    }

    return {
      success: true,
      data: repaired,
      repairsApplied: validationErrors.length,
      message: `Applied ${validationErrors.length} repairs to corrupted consciousness data`
    };
  }

  /**
   * Batch migrate multiple consciousness data objects
   * @param {Array} consciousnessDataArray - Array of consciousness data objects
   * @param {Object} options - Migration options
   * @returns {Object} Batch migration result
   */
  batchMigrateConsciousnessData(consciousnessDataArray, options = {}) {
    if (!Array.isArray(consciousnessDataArray)) {
      throw new Error('Consciousness data array is required for batch migration');
    }

    const results = {
      total: consciousnessDataArray.length,
      successful: 0,
      failed: 0,
      migrated: 0,
      skipped: 0,
      results: [],
      errors: []
    };

    consciousnessDataArray.forEach((data, index) => {
      try {
        const migrationResult = this.migrateConsciousnessData(data, options);

        if (migrationResult.success) {
          results.successful++;
          if (migrationResult.migrated) {
            results.migrated++;
          } else {
            results.skipped++;
          }
        } else {
          results.failed++;
          results.errors.push({
            index,
            error: migrationResult.error,
            originalData: data
          });
        }

        results.results.push(migrationResult);

      } catch (error) {
        results.failed++;
        results.errors.push({
          index,
          error: error.message,
          originalData: data
        });
        results.results.push({
          success: false,
          migrated: false,
          error: error.message,
          data: data
        });
      }
    });

    return results;
  }

  /**
   * Create rollback data for consciousness migration
   * @param {Object} originalData - Original consciousness data
   * @returns {Object} Rollback information
   */
  createRollbackData(originalData) {
    return {
      rollbackData: JSON.parse(JSON.stringify(originalData)),
      rollbackTimestamp: new Date().toISOString(),
      rollbackVersion: this._detectVersion(originalData)
    };
  }

  /**
   * Rollback consciousness data to previous version
   * @param {Object} rollbackInfo - Rollback information
   * @param {string} targetVersion - Target version to rollback to
   * @returns {Object} Rollback result
   */
  rollbackConsciousnessData(rollbackInfo, targetVersion = null) {
    if (!rollbackInfo || !rollbackInfo.rollbackData) {
      throw new Error('Valid rollback information is required');
    }

    const originalData = JSON.parse(JSON.stringify(rollbackInfo.rollbackData));

    // If no target version specified, rollback to original version
    if (!targetVersion) {
      return {
        success: true,
        data: originalData,
        message: `Rolled back to original version ${rollbackInfo.rollbackVersion}`
      };
    }

    // For now, only support rollback to original version
    // Future versions could support rolling back to specific versions
    return {
      success: true,
      data: originalData,
      message: `Rolled back to version ${rollbackInfo.rollbackVersion}`
    };
  }

  /**
   * Get migration statistics for consciousness data
   * @param {Array} consciousnessDataArray - Array of consciousness data
   * @returns {Object} Migration statistics
   */
  getMigrationStatistics(consciousnessDataArray) {
    if (!Array.isArray(consciousnessDataArray)) {
      throw new Error('Consciousness data array is required');
    }

    const stats = {
      total: consciousnessDataArray.length,
      versions: {},
      needsMigration: 0,
      corrupted: 0,
      valid: 0
    };

    consciousnessDataArray.forEach(data => {
      const version = this._detectVersion(data);
      stats.versions[version] = (stats.versions[version] || 0) + 1;

      if (version !== this.VERSIONS.CURRENT) {
        stats.needsMigration++;
      }

      const validation = this.validateConsciousnessData(data);
      if (!validation.isValid) {
        stats.corrupted++;
      } else {
        stats.valid++;
      }
    });

    return stats;
  }

  /**
   * Get supported versions and their features
   * @returns {Object} Version information
   */
  getSupportedVersions() {
    return {
      current: this.VERSIONS.CURRENT,
      supported: Object.values(this.VERSIONS),
      features: {
        [this.VERSIONS.V1_0]: ['frequency', 'coherence'],
        [this.VERSIONS.V1_1]: ['frequency', 'coherence', 'behavioralState'],
        [this.VERSIONS.V1_2]: ['frequency', 'coherence', 'behavioralState', 'significantEvents', 'significantMemories'],
        [this.VERSIONS.V2_0]: ['baseFrequency', 'baseCoherence', 'behavioralState', 'significantEvents', 'significantMemories', 'activeGoals', 'lastUpdate', 'updateTriggerThreshold']
      }
    };
  }
}

export default ConsciousnessMigrationService;