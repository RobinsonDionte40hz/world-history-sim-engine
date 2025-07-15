// src/domain/services/__tests__/MigrationService.test.js

import { MigrationService } from '../MigrationService.js';
import { Alignment } from '../../value-objects/Alignment.js';
import { Influence } from '../../value-objects/Influence.js';
import { Prestige } from '../../value-objects/Prestige.js';
import PersonalityProfile from '../../value-objects/PersonalityProfile.js';
import { RacialTraits } from '../../value-objects/RacialTraits.js';

describe('MigrationService', () => {
  
  describe('migrateAlignmentManager', () => {
    it('should migrate AlignmentManager data to Alignment value object', () => {
      const alignmentManagerData = {
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
        playerAlignment: {
          'good-evil': 50
        },
        history: {
          'good-evil': [
            {
              timestamp: new Date('2023-01-01'),
              change: 10,
              newValue: 50,
              reason: 'Helped villagers'
            }
          ]
        }
      };

      const result = MigrationService.migrateAlignmentManager(alignmentManagerData);

      expect(result).toBeInstanceOf(Alignment);
      expect(result.getValue('good-evil')).toBe(50);
      expect(result.getZone('good-evil').name).toBe('Good');
      expect(result.getAxisHistory('good-evil')).toHaveLength(1);
    });

    it('should throw error for invalid data', () => {
      expect(() => {
        MigrationService.migrateAlignmentManager(null);
      }).toThrow('AlignmentManager data is required for migration');
    });

    it('should handle missing history data', () => {
      const alignmentManagerData = {
        axes: [
          {
            id: 'good-evil',
            name: 'Good vs Evil',
            min: -100,
            max: 100,
            defaultValue: 0,
            zones: [
              { name: 'Neutral', min: -100, max: 100 }
            ]
          }
        ],
        playerAlignment: {
          'good-evil': 0
        }
      };

      const result = MigrationService.migrateAlignmentManager(alignmentManagerData);
      expect(result).toBeInstanceOf(Alignment);
      expect(result.getValue('good-evil')).toBe(0);
    });
  });

  describe('migrateInfluenceManager', () => {
    it('should migrate InfluenceManager data to Influence value object', () => {
      const influenceManagerData = {
        domains: [
          {
            id: 'political',
            name: 'Political',
            min: 0,
            max: 100,
            defaultValue: 0,
            tiers: [
              { name: 'Unknown', min: 0, max: 10 },
              { name: 'Known', min: 11, max: 50 },
              { name: 'Influential', min: 51, max: 100 }
            ]
          }
        ],
        playerInfluence: {
          'political': 25
        },
        history: {
          'political': [
            {
              timestamp: new Date('2023-01-01'),
              change: 5,
              newValue: 25,
              reason: 'Completed political quest'
            }
          ]
        }
      };

      const result = MigrationService.migrateInfluenceManager(influenceManagerData);

      expect(result).toBeInstanceOf(Influence);
      expect(result.getValue('political')).toBe(25);
      expect(result.getTier('political').name).toBe('Known');
      expect(result.getDomainHistory('political')).toHaveLength(1);
    });

    it('should throw error for invalid data', () => {
      expect(() => {
        MigrationService.migrateInfluenceManager(null);
      }).toThrow('InfluenceManager data is required for migration');
    });
  });

  describe('migratePrestigeManager', () => {
    it('should migrate PrestigeManager data to Prestige value object', () => {
      const prestigeManagerData = {
        tracks: [
          {
            id: 'military',
            name: 'Military',
            min: 0,
            max: 100,
            defaultValue: 0,
            decayRate: 0.1,
            levels: [
              { name: 'Recruit', min: 0, max: 20, politicalPower: 1 },
              { name: 'Soldier', min: 21, max: 50, politicalPower: 2 },
              { name: 'Officer', min: 51, max: 100, politicalPower: 5 }
            ]
          }
        ],
        playerPrestige: {
          'military': 30
        },
        history: {
          'military': [
            {
              timestamp: new Date('2023-01-01'),
              change: 10,
              newValue: 30,
              reason: 'Won battle'
            }
          ]
        }
      };

      const result = MigrationService.migratePrestigeManager(prestigeManagerData);

      expect(result).toBeInstanceOf(Prestige);
      expect(result.getValue('military')).toBe(30);
      expect(result.getLevel('military').name).toBe('Soldier');
      expect(result.getTrackHistory('military')).toHaveLength(1);
    });

    it('should throw error for invalid data', () => {
      expect(() => {
        MigrationService.migratePrestigeManager(null);
      }).toThrow('PrestigeManager data is required for migration');
    });
  });

  describe('migratePersonalitySystem', () => {
    it('should migrate PersonalitySystem data to PersonalityProfile value object', () => {
      const personalitySystemData = {
        traits: [
          {
            id: 'courage',
            name: 'Courage',
            description: 'Bravery in face of danger',
            category: 'Personality',
            intensity: 0.7,
            baseLevel: 0.6,
            volatility: 0.3
          }
        ],
        attributes: [
          {
            id: 'strength',
            name: 'Strength',
            description: 'Physical power',
            baseValue: 12
          }
        ],
        emotionalTendencies: [
          {
            id: 'optimism',
            name: 'Optimism',
            description: 'Positive outlook',
            category: 'Emotional',
            intensity: 0.8
          }
        ],
        cognitiveTraits: [
          {
            id: 'analytical',
            name: 'Analytical',
            description: 'Logical thinking',
            category: 'Analytical',
            complexity: 0.6
          }
        ]
      };

      const result = MigrationService.migratePersonalitySystem(personalitySystemData);

      expect(result).toBeInstanceOf(PersonalityProfile);
      expect(result.getTrait('courage')).toBeTruthy();
      expect(result.getAttribute('strength')).toBeTruthy();
      expect(result.getEmotionalTendency('optimism')).toBeTruthy();
      expect(result.getCognitiveTrait('analytical')).toBeTruthy();
    });

    it('should throw error for invalid data', () => {
      expect(() => {
        MigrationService.migratePersonalitySystem(null);
      }).toThrow('PersonalitySystem data is required for migration');
    });
  });

  describe('migrateRaceSystem', () => {
    it('should migrate RaceSystem data to RacialTraits value object', () => {
      const raceSystemData = {
        raceId: 'elf',
        subraceId: 'High Elf'
      };

      const result = MigrationService.migrateRaceSystem(raceSystemData);

      expect(result).toBeInstanceOf(RacialTraits);
      expect(result.raceId).toBe('elf');
      expect(result.subraceId).toBe('High Elf');
    });

    it('should handle missing subrace', () => {
      const raceSystemData = {
        raceId: 'human'
      };

      const result = MigrationService.migrateRaceSystem(raceSystemData);

      expect(result).toBeInstanceOf(RacialTraits);
      expect(result.raceId).toBe('human');
      expect(result.subraceId).toBeNull();
    });

    it('should throw error for invalid data', () => {
      expect(() => {
        MigrationService.migrateRaceSystem(null);
      }).toThrow('RaceSystem data is required for migration');
    });
  });

  describe('migrateCharacterData', () => {
    it('should migrate complete character data', () => {
      const oldCharacterData = {
        id: 'char-123',
        name: 'Test Character',
        age: 25,
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
          playerAlignment: { 'good-evil': 10 },
          history: { 'good-evil': [] }
        },
        influenceManager: {
          domains: [
            {
              id: 'political',
              name: 'Political',
              min: 0,
              max: 100,
              defaultValue: 0,
              tiers: [{ name: 'Unknown', min: 0, max: 100 }]
            }
          ],
          playerInfluence: { 'political': 5 },
          history: { 'political': [] }
        },
        raceSystem: {
          raceId: 'human'
        }
      };

      const result = MigrationService.migrateCharacterData(oldCharacterData);

      expect(result.id).toBe('char-123');
      expect(result.name).toBe('Test Character');
      expect(result.age).toBe(25);
      expect(result.alignment).toBeDefined();
      expect(result.influence).toBeDefined();
      expect(result.racialTraits).toBeDefined();
      expect(result._migrationInfo).toBeDefined();
      expect(result._migrationInfo.migratedSystems).toContain('alignment');
      expect(result._migrationInfo.migratedSystems).toContain('influence');
      expect(result._migrationInfo.migratedSystems).toContain('race');
      expect(result.alignmentManager).toBeUndefined();
      expect(result.influenceManager).toBeUndefined();
      expect(result.raceSystem).toBeUndefined();
    });

    it('should throw error for invalid data', () => {
      expect(() => {
        MigrationService.migrateCharacterData(null);
      }).toThrow('Character data is required for migration');
    });
  });

  describe('batchMigrateCharacters', () => {
    it('should migrate multiple characters successfully', () => {
      const charactersData = [
        {
          id: 'char-1',
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
            playerAlignment: { 'good-evil': 0 },
            history: { 'good-evil': [] }
          }
        },
        {
          id: 'char-2',
          name: 'Character 2',
          raceSystem: {
            raceId: 'elf'
          }
        }
      ];

      const result = MigrationService.batchMigrateCharacters(charactersData);

      expect(result.totalProcessed).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(result.successful).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle errors gracefully', () => {
      const charactersData = [
        {
          id: 'char-1',
          name: 'Valid Character',
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
            playerAlignment: { 'good-evil': 0 },
            history: { 'good-evil': [] }
          }
        },
        null // This will cause an error
      ];

      const result = MigrationService.batchMigrateCharacters(charactersData);

      expect(result.totalProcessed).toBe(2);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.successful).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should throw error for invalid input', () => {
      expect(() => {
        MigrationService.batchMigrateCharacters('not an array');
      }).toThrow('Character data array is required for batch migration');
    });
  });

  describe('validateMigration', () => {
    it('should validate successful migration', () => {
      const originalData = {
        id: 'char-123',
        name: 'Test Character',
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
          playerAlignment: { 'good-evil': 50 },
          history: { 'good-evil': [] }
        }
      };

      const migratedData = MigrationService.migrateCharacterData(originalData);
      const validation = MigrationService.validateMigration(originalData, migratedData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.summary.alignment).toBe('migrated');
    });

    it('should detect data corruption during migration', () => {
      const originalData = {
        id: 'char-123',
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
          playerAlignment: { 'good-evil': 50 },
          history: { 'good-evil': [] }
        }
      };

      const migratedData = {
        id: 'char-123',
        alignment: {
          values: { 'good-evil': 25 } // Different value - corruption
        }
      };

      const validation = MigrationService.validateMigration(originalData, migratedData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Alignment value for \'good-evil\' changed during migration');
    });
  });

  describe('assessMigrationNeeds', () => {
    it('should identify data that needs migration', () => {
      const characterData = {
        id: 'char-123',
        alignmentManager: { /* data */ },
        influenceManager: { /* data */ },
        personalitySystem: { /* data */ }
      };

      const assessment = MigrationService.assessMigrationNeeds(characterData);

      expect(assessment.needsMigration).toBe(true);
      expect(assessment.systems).toContain('alignmentManager');
      expect(assessment.systems).toContain('influenceManager');
      expect(assessment.systems).toContain('personalitySystem');
      expect(assessment.recommendations).toHaveLength(3);
    });

    it('should identify already migrated data', () => {
      const characterData = {
        id: 'char-123',
        alignment: { /* migrated data */ },
        _migrationInfo: {
          migratedAt: '2023-01-01T00:00:00.000Z',
          migratedSystems: ['alignment']
        }
      };

      const assessment = MigrationService.assessMigrationNeeds(characterData);

      expect(assessment.needsMigration).toBe(false);
      expect(assessment.alreadyMigrated).toBe(true);
      expect(assessment.migrationDate).toBe('2023-01-01T00:00:00.000Z');
      expect(assessment.migratedSystems).toContain('alignment');
    });

    it('should handle data that needs no migration', () => {
      const characterData = {
        id: 'char-123',
        name: 'Test Character',
        age: 25
      };

      const assessment = MigrationService.assessMigrationNeeds(characterData);

      expect(assessment.needsMigration).toBe(false);
      expect(assessment.systems).toHaveLength(0);
      expect(assessment.recommendations).toHaveLength(0);
    });
  });

  describe('getMigrationStatistics', () => {
    it('should calculate migration statistics', () => {
      const charactersData = [
        {
          id: 'char-1',
          alignmentManager: { /* data */ },
          influenceManager: { /* data */ }
        },
        {
          id: 'char-2',
          personalitySystem: { /* data */ }
        },
        {
          id: 'char-3',
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

    it('should throw error for invalid input', () => {
      expect(() => {
        MigrationService.getMigrationStatistics('not an array');
      }).toThrow('Character data array is required');
    });
  });

  describe('rollback functionality', () => {
    it('should create and use rollback data', () => {
      const originalData = {
        id: 'char-123',
        name: 'Test Character',
        alignmentManager: { /* data */ }
      };

      const rollbackInfo = MigrationService.createRollbackData(originalData);
      expect(rollbackInfo.rollbackData).toEqual(originalData);
      expect(rollbackInfo.rollbackTimestamp).toBeDefined();

      const rolledBack = MigrationService.rollbackMigration(rollbackInfo);
      expect(rolledBack).toEqual(originalData);
    });

    it('should throw error for invalid rollback data', () => {
      expect(() => {
        MigrationService.rollbackMigration(null);
      }).toThrow('Valid rollback information is required');

      expect(() => {
        MigrationService.rollbackMigration({});
      }).toThrow('Valid rollback information is required');
    });
  });
});
  describe('Integration Tests', () => {
    
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
  });