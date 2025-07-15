// src/domain/services/__tests__/MigrationService.integration.test.js

import { MigrationService } from '../MigrationService.js';

describe('MigrationService Integration Tests', () => {
  
  it('should migrate existing character data to new format', () => {
    const legacyCharacter = {
      id: 'legacy-char-001',
      name: 'Thorin Ironforge',
      age: 150,
      
      alignmentManager: {
        axes: [
          {
            id: 'good-evil',
            name: 'Good vs Evil',
            min: -100,
            max: 100,
            defaultValue: 0,
            zones: [
              { name: 'Evil', min: -100, max: -30 },
              { name: 'Neutral', min: -29, max: 29 },
              { name: 'Good', min: 30, max: 100 }
            ]
          }
        ],
        playerAlignment: { 'good-evil': 45 },
        history: {
          'good-evil': [
            {
              timestamp: new Date('2023-01-15T10:30:00Z'),
              change: 15,
              newValue: 45,
              reason: 'Saved village from bandits'
            }
          ]
        }
      },

      influenceManager: {
        domains: [
          {
            id: 'political',
            name: 'Political Influence',
            min: 0,
            max: 100,
            defaultValue: 0,
            tiers: [
              { name: 'Unknown', min: 0, max: 10 },
              { name: 'Recognized', min: 11, max: 30 }
            ]
          }
        ],
        playerInfluence: { 'political': 25 },
        history: { 'political': [] }
      },

      raceSystem: {
        raceId: 'dwarf',
        subraceId: 'Mountain Dwarf'
      }
    };

    const migratedCharacter = MigrationService.migrateCharacterData(legacyCharacter);

    // Verify core character data is preserved
    expect(migratedCharacter.id).toBe('legacy-char-001');
    expect(migratedCharacter.name).toBe('Thorin Ironforge');
    expect(migratedCharacter.age).toBe(150);

    // Verify alignment migration
    expect(migratedCharacter.alignment).toBeDefined();
    expect(migratedCharacter.alignment.values['good-evil']).toBe(45);
    expect(migratedCharacter.alignment.history['good-evil']).toHaveLength(1);

    // Verify influence migration
    expect(migratedCharacter.influence).toBeDefined();
    expect(migratedCharacter.influence.values['political']).toBe(25);

    // Verify race migration
    expect(migratedCharacter.racialTraits).toBeDefined();
    expect(migratedCharacter.racialTraits.raceId).toBe('dwarf');
    expect(migratedCharacter.racialTraits.subraceId).toBe('Mountain Dwarf');

    // Verify migration metadata
    expect(migratedCharacter._migrationInfo).toBeDefined();
    expect(migratedCharacter._migrationInfo.migratedSystems).toContain('alignment');
    expect(migratedCharacter._migrationInfo.migratedSystems).toContain('influence');
    expect(migratedCharacter._migrationInfo.migratedSystems).toContain('race');

    // Verify legacy systems are removed
    expect(migratedCharacter.alignmentManager).toBeUndefined();
    expect(migratedCharacter.influenceManager).toBeUndefined();
    expect(migratedCharacter.raceSystem).toBeUndefined();
  });

  it('should verify data integrity after migration', () => {
    const characterWithHistory = {
      id: 'history-char',
      name: 'Gandalf the Grey',
      
      alignmentManager: {
        axes: [
          {
            id: 'good-evil',
            name: 'Good vs Evil',
            min: -100,
            max: 100,
            defaultValue: 0,
            zones: [{ name: 'Good', min: 0, max: 100 }]
          }
        ],
        playerAlignment: { 'good-evil': 90 },
        history: {
          'good-evil': [
            {
              timestamp: new Date('2023-01-01T00:00:00Z'),
              change: 30,
              newValue: 90,
              reason: 'Destroyed the Ring'
            }
          ]
        }
      }
    };

    const migratedCharacter = MigrationService.migrateCharacterData(characterWithHistory);
    const validation = MigrationService.validateMigration(characterWithHistory, migratedCharacter);

    // Verify validation passes
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    // Verify historical data integrity
    expect(migratedCharacter.alignment.history['good-evil']).toHaveLength(1);
    const history = migratedCharacter.alignment.history['good-evil'];
    expect(history[0].reason).toBe('Destroyed the Ring');
    expect(history[0].timestamp).toEqual(new Date('2023-01-01T00:00:00Z'));
  });

  it('should support rollback capability', () => {
    const originalCharacter = {
      id: 'rollback-char',
      name: 'Test Rollback',
      alignmentManager: {
        axes: [
          {
            id: 'good-evil',
            name: 'Good vs Evil',
            min: -100,
            max: 100,
            defaultValue: 0,
            zones: [{ name: 'Neutral', min: -100, max: 100 }]
          }
        ],
        playerAlignment: { 'good-evil': 45 },
        history: { 'good-evil': [] }
      }
    };

    // Create rollback data before migration
    const rollbackInfo = MigrationService.createRollbackData(originalCharacter);
    
    // Perform migration
    const migratedCharacter = MigrationService.migrateCharacterData(originalCharacter);
    
    // Verify migration occurred
    expect(migratedCharacter.alignment).toBeDefined();
    expect(migratedCharacter.alignmentManager).toBeUndefined();
    expect(migratedCharacter._migrationInfo).toBeDefined();
    
    // Perform rollback
    const rolledBackCharacter = MigrationService.rollbackMigration(rollbackInfo);
    
    // Verify rollback restored original state
    expect(rolledBackCharacter).toEqual(originalCharacter);
    expect(rolledBackCharacter.alignmentManager).toBeDefined();
    expect(rolledBackCharacter.alignment).toBeUndefined();
    expect(rolledBackCharacter._migrationInfo).toBeUndefined();
  });

  it('should handle batch migration with error handling', () => {
    const charactersData = [
      {
        id: 'batch-char-1',
        name: 'Character 1',
        alignmentManager: {
          axes: [
            {
              id: 'good-evil',
              name: 'Good vs Evil',
              min: -100,
              max: 100,
              defaultValue: 0,
              zones: [{ name: 'Neutral', min: -100, max: 100 }]
            }
          ],
          playerAlignment: { 'good-evil': 20 },
          history: { 'good-evil': [] }
        }
      },
      {
        id: 'batch-char-2',
        name: 'Character 2',
        raceSystem: {
          raceId: 'human'
        }
      }
    ];

    const result = MigrationService.batchMigrateCharacters(charactersData);

    expect(result.totalProcessed).toBe(2);
    expect(result.successCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.successful).toHaveLength(2);
    expect(result.errors).toHaveLength(0);

    // Verify each character was migrated correctly
    expect(result.successful[0].alignment).toBeDefined();
    expect(result.successful[1].racialTraits).toBeDefined();
  });

  it('should provide migration statistics', () => {
    const charactersData = [
      {
        id: 'stats-char-1',
        alignmentManager: { /* data */ },
        influenceManager: { /* data */ }
      },
      {
        id: 'stats-char-2',
        personalitySystem: { /* data */ }
      },
      {
        id: 'stats-char-3',
        alignment: { /* migrated data */ },
        _migrationInfo: { migratedSystems: ['alignment'] }
      }
    ];

    const stats = MigrationService.getMigrationStatistics(charactersData);

    expect(stats.total).toBe(3);
    expect(stats.needsMigration).toBe(2);
    expect(stats.alreadyMigrated).toBe(1);
    expect(stats.systemBreakdown.alignmentManager).toBe(1);
    expect(stats.systemBreakdown.influenceManager).toBe(1);
    expect(stats.systemBreakdown.personalitySystem).toBe(1);
  });
});