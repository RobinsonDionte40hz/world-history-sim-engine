/**
 * ConsciousnessMigrationService Tests
 *
 * Comprehensive test suite for consciousness data migration functionality,
 * covering all supported versions, edge cases, and error scenarios.
 */

import ConsciousnessMigrationService from '../ConsciousnessMigrationService.js';

describe('ConsciousnessMigrationService', () => {
  let migrationService;

  beforeEach(() => {
    migrationService = new ConsciousnessMigrationService();
  });

  describe('Version Detection', () => {
    test('should detect V1.0 format (simple frequency/coherence)', () => {
      const v1Data = {
        frequency: 8.0,
        coherence: 0.6
      };

      const version = migrationService._detectVersion(v1Data);
      expect(version).toBe('1.0');
    });

    test('should detect V1.1 format (with behavioral state)', () => {
      const v1_1Data = {
        frequency: 8.0,
        coherence: 0.6,
        behavioralState: {
          energy: 'high',
          focus: 'focused',
          mood: 'optimistic',
          socialDrive: 0.8,
          riskTolerance: 0.7,
          ambition: 0.9
        }
      };

      const version = migrationService._detectVersion(v1_1Data);
      expect(version).toBe('1.1');
    });

    test('should detect V1.2 format (with events/memories)', () => {
      const v1_2Data = {
        frequency: 8.0,
        coherence: 0.6,
        behavioralState: {
          energy: 'high',
          focus: 'focused',
          mood: 'optimistic',
          socialDrive: 0.8,
          riskTolerance: 0.7,
          ambition: 0.9
        },
        significantEvents: [
          { type: 'goal_completion', significance: 0.8, timestamp: Date.now() }
        ],
        significantMemories: [
          { description: 'Achieved major goal', impact: 0.7, timestamp: Date.now() }
        ]
      };

      const version = migrationService._detectVersion(v1_2Data);
      expect(version).toBe('1.2');
    });

    test('should detect V2.0 format (full consciousness state)', () => {
      const v2Data = {
        baseFrequency: 8.0,
        baseCoherence: 0.6,
        behavioralState: {
          energy: 'high',
          focus: 'focused',
          mood: 'optimistic',
          socialDrive: 0.8,
          riskTolerance: 0.7,
          ambition: 0.9
        },
        significantEvents: [],
        significantMemories: [],
        activeGoals: [],
        lastUpdate: Date.now(),
        updateTriggerThreshold: 0.3
      };

      const version = migrationService._detectVersion(v2Data);
      expect(version).toBe('2.0');
    });

    test('should detect already migrated data with version metadata', () => {
      const migratedData = {
        baseFrequency: 8.0,
        baseCoherence: 0.6,
        _migrationInfo: {
          migratedAt: new Date().toISOString(),
          fromVersion: '1.0',
          toVersion: '2.0',
          migrationType: 'consciousness_data'
        }
      };

      const version = migrationService._detectVersion(migratedData);
      expect(version).toBe('2.0');
    });

    test('should return unknown for unrecognized format', () => {
      const unknownData = {
        customField: 'value',
        anotherField: 123
      };

      const version = migrationService._detectVersion(unknownData);
      expect(version).toBe('unknown');
    });
  });

  describe('Migration from V1.0', () => {
    test('should migrate simple frequency/coherence to full V2.0 format', () => {
      const v1Data = {
        frequency: 12.0,
        coherence: 0.8
      };

      const result = migrationService.migrateConsciousnessData(v1Data);

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(true);
      expect(result.fromVersion).toBe('1.0');
      expect(result.toVersion).toBe('2.0');

      const migrated = result.data;
      expect(migrated.baseFrequency).toBe(12.0);
      expect(migrated.baseCoherence).toBe(0.8);
      expect(migrated.behavioralState).toBeDefined();
      expect(migrated.significantEvents).toEqual([]);
      expect(migrated.significantMemories).toEqual([]);
      expect(migrated.activeGoals).toEqual([]);
      expect(migrated._migrationInfo).toBeDefined();
    });

    test('should generate appropriate behavioral state from V1.0 data', () => {
      const v1Data = {
        frequency: 4.0, // Low frequency
        coherence: 0.3  // Low coherence
      };

      const result = migrationService.migrateConsciousnessData(v1Data);
      const behavioralState = result.data.behavioralState;

      expect(behavioralState.energy).toBe('low');
      expect(behavioralState.focus).toBe('scattered');
      expect(behavioralState.mood).toBe('depressed');
    });

    test('should handle missing frequency/coherence in V1.0 data', () => {
      const incompleteV1Data = {}; // No frequency or coherence

      const result = migrationService.migrateConsciousnessData(incompleteV1Data);

      expect(result.success).toBe(true);
      expect(result.data.baseFrequency).toBe(7.5); // Default
      expect(result.data.baseCoherence).toBe(0.5); // Default
    });
  });

  describe('Migration from V1.1', () => {
    test('should preserve existing behavioral state during V1.1 migration', () => {
      const v1_1Data = {
        frequency: 10.0,
        coherence: 0.7,
        behavioralState: {
          energy: 'high',
          focus: 'focused',
          mood: 'excited',
          socialDrive: 0.9,
          riskTolerance: 0.8,
          ambition: 0.95
        }
      };

      const result = migrationService.migrateConsciousnessData(v1_1Data);
      const migrated = result.data;

      expect(migrated.baseFrequency).toBe(10.0);
      expect(migrated.baseCoherence).toBe(0.7);
      expect(migrated.behavioralState).toEqual(v1_1Data.behavioralState);
    });

    test('should regenerate behavioral state if invalid in V1.1 data', () => {
      const invalidV1_1Data = {
        frequency: 10.0,
        coherence: 0.7,
        behavioralState: {
          energy: 'high',
          focus: 'focused'
          // Missing required fields
        }
      };

      const result = migrationService.migrateConsciousnessData(invalidV1_1Data);
      const migrated = result.data;

      // Should have regenerated behavioral state
      expect(migrated.behavioralState.energy).toBeDefined();
      expect(migrated.behavioralState.focus).toBeDefined();
      expect(migrated.behavioralState.mood).toBeDefined();
      expect(migrated.behavioralState.socialDrive).toBeDefined();
      expect(migrated.behavioralState.riskTolerance).toBeDefined();
      expect(migrated.behavioralState.ambition).toBeDefined();
    });
  });

  describe('Migration from V1.2', () => {
    test('should preserve events and memories during V1.2 migration', () => {
      const events = [
        { type: 'goal_completion', significance: 0.8, timestamp: Date.now() },
        { type: 'social_success', significance: 0.6, timestamp: Date.now() - 1000 }
      ];

      const memories = [
        { description: 'Achieved major goal', impact: 0.7, timestamp: Date.now() },
        { description: 'Made new friend', impact: 0.5, timestamp: Date.now() - 2000 }
      ];

      const v1_2Data = {
        frequency: 9.0,
        coherence: 0.75,
        behavioralState: {
          energy: 'moderate',
          focus: 'balanced',
          mood: 'optimistic',
          socialDrive: 0.7,
          riskTolerance: 0.6,
          ambition: 0.8
        },
        significantEvents: events,
        significantMemories: memories
      };

      const result = migrationService.migrateConsciousnessData(v1_2Data);
      const migrated = result.data;

      expect(migrated.significantEvents).toEqual(events);
      expect(migrated.significantMemories).toEqual(memories);
      expect(migrated.activeGoals).toEqual([]); // Should initialize empty
    });
  });

  describe('Migration from Unknown Format', () => {
    test('should attempt best-effort migration for unknown format', () => {
      const unknownData = {
        customFrequency: 11.0,
        customCoherence: 0.85,
        randomField: 'value'
      };

      const result = migrationService.migrateConsciousnessData(unknownData);

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(true);
      expect(result.fromVersion).toBe('unknown');

      // Should use defaults since no recognizable fields
      expect(result.data.baseFrequency).toBe(7.5);
      expect(result.data.baseCoherence).toBe(0.5);
    });

    test('should extract recognizable fields from unknown format', () => {
      const unknownData = {
        customFrequency: 13.0, // Custom field name
        coherence: 0.9,        // V1.0 field name
        behavioralState: {     // V1.1+ field
          energy: 'high',
          focus: 'focused',
          mood: 'excited',
          socialDrive: 0.9,
          riskTolerance: 0.8,
          ambition: 0.95
        }
      };

      const result = migrationService.migrateConsciousnessData(unknownData);
      const migrated = result.data;

      expect(migrated.baseFrequency).toBe(7.5); // Should use default since customFrequency is not recognized
      expect(migrated.baseCoherence).toBe(0.9);  // Should use the V1.0 coherence field
      expect(migrated.behavioralState).toEqual(unknownData.behavioralState);
    });
  });

  describe('Data Validation', () => {
    test('should validate correct V2.0 consciousness data', () => {
      const validData = {
        baseFrequency: 8.0,
        baseCoherence: 0.7,
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
        activeGoals: [],
        lastUpdate: Date.now(),
        updateTriggerThreshold: 0.3
      };

      const validation = migrationService.validateConsciousnessData(validData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    test('should detect invalid frequency values', () => {
      const invalidData = {
        baseFrequency: 20.0, // Too high
        baseCoherence: 0.7,
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

      const validation = migrationService.validateConsciousnessData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('baseFrequency must be between 3 and 15');
    });

    test('should detect invalid coherence values', () => {
      const invalidData = {
        baseFrequency: 8.0,
        baseCoherence: 1.5, // Too high
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

      const validation = migrationService.validateConsciousnessData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('baseCoherence must be between 0.2 and 1.0');
    });

    test('should detect invalid behavioral state', () => {
      const invalidData = {
        baseFrequency: 8.0,
        baseCoherence: 0.7,
        behavioralState: {
          energy: 'moderate',
          focus: 'balanced'
          // Missing required fields
        },
        significantEvents: [],
        significantMemories: [],
        activeGoals: []
      };

      const validation = migrationService.validateConsciousnessData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('behavioralState is missing required fields');
    });

    test('should detect non-array fields', () => {
      const invalidData = {
        baseFrequency: 8.0,
        baseCoherence: 0.7,
        behavioralState: {
          energy: 'moderate',
          focus: 'balanced',
          mood: 'content',
          socialDrive: 0.6,
          riskTolerance: 0.5,
          ambition: 0.7
        },
        significantEvents: 'not an array',
        significantMemories: [],
        activeGoals: []
      };

      const validation = migrationService.validateConsciousnessData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('significantEvents must be an array');
    });
  });

  describe('Data Repair', () => {
    test('should repair invalid frequency values', () => {
      const corruptedData = {
        baseFrequency: 25.0, // Too high
        baseCoherence: 0.7,
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

      const repairResult = migrationService.repairCorruptedData(corruptedData, ['baseFrequency must be between 3 and 15']);
      const repaired = repairResult.data;

      expect(repairResult.success).toBe(true);
      expect(repaired.baseFrequency).toBe(15.0); // Should be clamped to max
      expect(repaired.baseCoherence).toBe(0.7); // Should remain unchanged
    });

    test('should repair invalid coherence values', () => {
      const corruptedData = {
        baseFrequency: 8.0,
        baseCoherence: -0.5, // Too low
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

      const repairResult = migrationService.repairCorruptedData(corruptedData, ['baseCoherence must be between 0.2 and 1.0']);
      const repaired = repairResult.data;

      expect(repaired.baseCoherence).toBe(0.2); // Should be clamped to min
    });

    test('should regenerate invalid behavioral state', () => {
      const corruptedData = {
        baseFrequency: 8.0,
        baseCoherence: 0.7,
        behavioralState: null, // Invalid
        significantEvents: [],
        significantMemories: [],
        activeGoals: []
      };

      const repairResult = migrationService.repairCorruptedData(corruptedData, ['behavioralState is missing required fields']);
      const repaired = repairResult.data;

      expect(repaired.behavioralState).toBeDefined();
      expect(repaired.behavioralState.energy).toBeDefined();
      expect(repaired.behavioralState.focus).toBeDefined();
      expect(repaired.behavioralState.mood).toBeDefined();
      expect(repaired.behavioralState.socialDrive).toBeDefined();
      expect(repaired.behavioralState.riskTolerance).toBeDefined();
      expect(repaired.behavioralState.ambition).toBeDefined();
    });

    test('should repair non-array fields', () => {
      const corruptedData = {
        baseFrequency: 8.0,
        baseCoherence: 0.7,
        behavioralState: {
          energy: 'moderate',
          focus: 'balanced',
          mood: 'content',
          socialDrive: 0.6,
          riskTolerance: 0.5,
          ambition: 0.7
        },
        significantEvents: 'not an array',
        significantMemories: null,
        activeGoals: undefined
      };

      const repairResult = migrationService.repairCorruptedData(corruptedData, [
        'significantEvents must be an array',
        'significantMemories must be an array',
        'activeGoals must be an array'
      ]);
      const repaired = repairResult.data;

      expect(Array.isArray(repaired.significantEvents)).toBe(true);
      expect(Array.isArray(repaired.significantMemories)).toBe(true);
      expect(Array.isArray(repaired.activeGoals)).toBe(true);
    });

    test('should handle completely corrupted data', () => {
      const completelyCorrupted = {
        baseFrequency: 'not a number',
        baseCoherence: null,
        behavioralState: 'invalid',
        significantEvents: 123,
        significantMemories: {},
        activeGoals: false
      };

      const repairResult = migrationService.repairCorruptedData(completelyCorrupted, []);
      const repaired = repairResult.data;

      expect(typeof repaired.baseFrequency).toBe('number');
      expect(typeof repaired.baseCoherence).toBe('number');
      expect(typeof repaired.behavioralState).toBe('object');
      expect(Array.isArray(repaired.significantEvents)).toBe(true);
      expect(Array.isArray(repaired.significantMemories)).toBe(true);
      expect(Array.isArray(repaired.activeGoals)).toBe(true);
    });
  });

  describe('Batch Migration', () => {
    test('should migrate multiple consciousness data objects', () => {
      const batchData = [
        { frequency: 8.0, coherence: 0.6 }, // V1.0
        { frequency: 9.0, coherence: 0.7, behavioralState: { energy: 'high', focus: 'focused', mood: 'optimistic', socialDrive: 0.8, riskTolerance: 0.7, ambition: 0.9 } }, // V1.1
        { baseFrequency: 10.0, baseCoherence: 0.8, behavioralState: { energy: 'high', focus: 'focused', mood: 'excited', socialDrive: 0.9, riskTolerance: 0.8, ambition: 0.95 }, significantEvents: [], significantMemories: [], activeGoals: [] } // V2.0
      ];

      const result = migrationService.batchMigrateConsciousnessData(batchData);

      expect(result.total).toBe(3);
      expect(result.successful).toBe(3);
      expect(result.migrated).toBe(2); // First two should be migrated
      expect(result.results).toHaveLength(3);

      // Check that all results are successful
      result.results.forEach(r => {
        expect(r.success).toBe(true);
      });
    });

    test('should handle errors in batch migration gracefully', () => {
      const batchData = [
        { frequency: 8.0, coherence: 0.6 }, // Valid V1.0
        null, // Invalid data
        { frequency: 'invalid', coherence: 0.7 } // Invalid frequency
      ];

      const result = migrationService.batchMigrateConsciousnessData(batchData, { repairCorrupted: true });

      expect(result.total).toBe(3);
      expect(result.successful).toBe(3); // All should succeed due to repair option
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0); // No errors when repair is enabled
    });

    test('should report errors when repair is disabled', () => {
      const batchData = [
        { frequency: 8.0, coherence: 0.6 }, // Valid
        null // Invalid
      ];

      const result = migrationService.batchMigrateConsciousnessData(batchData, { repairCorrupted: false });

      expect(result.total).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('Migration Statistics', () => {
    test('should generate accurate migration statistics', () => {
      const testData = [
        { frequency: 8.0, coherence: 0.6 }, // V1.0 - needs migration
        { frequency: 9.0, coherence: 0.7, behavioralState: { energy: 'high', focus: 'focused', mood: 'optimistic', socialDrive: 0.8, riskTolerance: 0.7, ambition: 0.9 } }, // V1.1 - needs migration
        { baseFrequency: 10.0, baseCoherence: 0.8, behavioralState: { energy: 'high', focus: 'focused', mood: 'excited', socialDrive: 0.9, riskTolerance: 0.8, ambition: 0.95 }, significantEvents: [], significantMemories: [], activeGoals: [] }, // V2.0 - no migration needed
        { baseFrequency: 25.0, baseCoherence: 0.8, behavioralState: { energy: 'high', focus: 'focused', mood: 'excited', socialDrive: 0.9, riskTolerance: 0.8, ambition: 0.95 }, significantEvents: [], significantMemories: [], activeGoals: [] } // V2.0 corrupted
      ];

      const stats = migrationService.getMigrationStatistics(testData);

      expect(stats.total).toBe(4);
      expect(stats.versions['1.0']).toBe(1);
      expect(stats.versions['1.1']).toBe(1);
      expect(stats.versions['2.0']).toBe(2);
      expect(stats.needsMigration).toBe(2);
      expect(stats.corrupted).toBe(1);
      expect(stats.valid).toBe(3);
    });
  });

  describe('Rollback Functionality', () => {
    test('should create rollback data', () => {
      const originalData = {
        baseFrequency: 8.0,
        baseCoherence: 0.7,
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

      const rollbackData = migrationService.createRollbackData(originalData);

      expect(rollbackData.rollbackData).toEqual(originalData);
      expect(rollbackData.rollbackTimestamp).toBeDefined();
      expect(rollbackData.rollbackVersion).toBe('2.0'); // This has all V2.0 fields so it's V2.0
    });

    test('should rollback to original data', () => {
      const originalData = {
        frequency: 8.0,
        coherence: 0.7
      };

      const rollbackInfo = {
        rollbackData: JSON.parse(JSON.stringify(originalData)),
        rollbackTimestamp: new Date().toISOString(),
        rollbackVersion: '1.0'
      };

      const result = migrationService.rollbackConsciousnessData(rollbackInfo);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(originalData);
    });
  });

  describe('Behavioral State Generation', () => {
    test('should generate correct behavioral state for high frequency/high coherence', () => {
      const behavioralState = migrationService._generateBehavioralStateFromParameters(12.0, 0.9);

      expect(behavioralState.energy).toBe('high');
      expect(behavioralState.focus).toBe('focused');
      expect(behavioralState.mood).toBe('excited');
      expect(behavioralState.socialDrive).toBeGreaterThan(0.8);
      expect(behavioralState.riskTolerance).toBeGreaterThan(0.6);
      expect(behavioralState.ambition).toBeGreaterThan(0.8);
    });

    test('should generate correct behavioral state for low frequency/low coherence', () => {
      const behavioralState = migrationService._generateBehavioralStateFromParameters(4.0, 0.3);

      expect(behavioralState.energy).toBe('low');
      expect(behavioralState.focus).toBe('scattered');
      expect(behavioralState.mood).toBe('depressed');
      expect(behavioralState.socialDrive).toBeLessThan(0.2);
      expect(behavioralState.riskTolerance).toBeLessThan(0.3);
      expect(behavioralState.ambition).toBeLessThan(0.4);
    });

    test('should clamp behavioral state values to valid ranges', () => {
      const behavioralState = migrationService._generateBehavioralStateFromParameters(15.0, 1.0);

      expect(behavioralState.socialDrive).toBeLessThanOrEqual(1.0);
      expect(behavioralState.socialDrive).toBeGreaterThanOrEqual(0.0);
      expect(behavioralState.riskTolerance).toBeLessThanOrEqual(1.0);
      expect(behavioralState.riskTolerance).toBeGreaterThanOrEqual(0.0);
      expect(behavioralState.ambition).toBeLessThanOrEqual(1.0);
      expect(behavioralState.ambition).toBeGreaterThanOrEqual(0.0);
    });
  });

  describe('Supported Versions', () => {
    test('should return correct version information', () => {
      const versionInfo = migrationService.getSupportedVersions();

      expect(versionInfo.current).toBe('2.0');
      expect(versionInfo.supported).toContain('1.0');
      expect(versionInfo.supported).toContain('1.1');
      expect(versionInfo.supported).toContain('1.2');
      expect(versionInfo.supported).toContain('2.0');

      expect(versionInfo.features['1.0']).toEqual(['frequency', 'coherence']);
      expect(versionInfo.features['2.0']).toContain('baseFrequency');
      expect(versionInfo.features['2.0']).toContain('behavioralState');
      expect(versionInfo.features['2.0']).toContain('significantEvents');
    });
  });

  describe('Error Handling', () => {
    test('should handle null/undefined input gracefully', () => {
      // Test null input
      const nullResult = migrationService.migrateConsciousnessData(null);
      expect(nullResult.success).toBe(false);
      expect(nullResult.migrated).toBe(false);
      expect(nullResult.error).toContain('Invalid consciousness data provided');

      // Test undefined input
      const undefinedResult = migrationService.migrateConsciousnessData(undefined);
      expect(undefinedResult.success).toBe(false);
      expect(undefinedResult.migrated).toBe(false);
      expect(undefinedResult.error).toContain('Invalid consciousness data provided');
    });

    test('should handle invalid JSON input', () => {
      const invalidData = {
        baseFrequency: 'not a number',
        baseCoherence: 'also not a number'
      };

      const result = migrationService.migrateConsciousnessData(invalidData, { repairCorrupted: true });

      expect(result.success).toBe(true);
      expect(typeof result.data.baseFrequency).toBe('number');
      expect(typeof result.data.baseCoherence).toBe('number');
    });

    test('should handle batch migration with empty array', () => {
      const result = migrationService.batchMigrateConsciousnessData([]);

      expect(result.total).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.results).toEqual([]);
    });
  });
});