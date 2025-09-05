// src/domain/services/__tests__/InteractionMigrationService.test.js

import { InteractionMigrationService } from '../InteractionMigrationService.js';
import ContentInteraction from '../../entities/interactions/ContentInteraction.js';

describe('InteractionMigrationService', () => {
  const mockOldInteractionData = {
    id: 'test-interaction-1',
    name: 'Test Dialogue',
    description: 'A test interaction for migration',
    type: 'dialogue',
    nodeId: 'node-123',
    requirements: [
      { attr: 'intelligence', min: 10 }
    ],
    branches: [
      { id: 'branch1', text: 'Hello', condition: null }
    ],
    effects: [
      { type: 'influence', target: 'player', value: 5 }
    ],
    participants: ['player', 'npc1'],
    cooldown: 100,
    repeatable: false,
    lastUsed: 0,
    customProperty: 'custom value'
  };

  describe('migrateInteraction', () => {
    test('should migrate basic interaction data', () => {
      const result = InteractionMigrationService.migrateInteraction(mockOldInteractionData);

      expect(result).toBeInstanceOf(ContentInteraction);
      expect(result.id).toBe('test-interaction-1');
      expect(result.name).toBe('Test Dialogue');
      expect(result.description).toBe('A test interaction for migration');
      expect(result.type).toBe('dialogue');
      expect(result.isContentInteraction).toBe(true);
    });

    test('should preserve requirements', () => {
      const result = InteractionMigrationService.migrateInteraction(mockOldInteractionData);

      expect(result.requirements).toHaveLength(1);
      expect(result.requirements[0]).toEqual({ attr: 'intelligence', min: 10 });
    });

    test('should preserve effects', () => {
      const result = InteractionMigrationService.migrateInteraction(mockOldInteractionData);

      expect(result.effects).toHaveLength(1);
      expect(result.effects[0]).toEqual({ type: 'influence', target: 'player', value: 5 });
    });

    test('should preserve branches', () => {
      const result = InteractionMigrationService.migrateInteraction(mockOldInteractionData);

      expect(result.branches).toHaveLength(1);
      expect(result.branches[0]).toEqual({ id: 'branch1', text: 'Hello', condition: null });
    });

    test('should add migration metadata', () => {
      const result = InteractionMigrationService.migrateInteraction(mockOldInteractionData);

      expect(result._migrationInfo).toBeDefined();
      expect(result._migrationInfo.originalVersion).toBe('legacy');
      expect(result._migrationInfo.migrationVersion).toBe('1.0.0');
      expect(result._migrationInfo.migratedAt).toBeDefined();
    });

    test('should preserve legacy properties', () => {
      const result = InteractionMigrationService.migrateInteraction(mockOldInteractionData);

      expect(result.nodeId).toBe('node-123');
      expect(result._legacyData.customProperty).toBe('custom value');
    });

    test('should determine category based on type', () => {
      const combatInteraction = { ...mockOldInteractionData, type: 'combat' };
      const result = InteractionMigrationService.migrateInteraction(combatInteraction);

      expect(result.category).toBe('combat');
    });

    test('should handle invalid data', () => {
      expect(() => {
        InteractionMigrationService.migrateInteraction(null);
      }).toThrow('Invalid interaction data provided for migration');

      expect(() => {
        InteractionMigrationService.migrateInteraction('invalid');
      }).toThrow('Invalid interaction data provided for migration');
    });

    test('should handle missing properties gracefully', () => {
      const minimalData = { id: 'test-1' };
      const result = InteractionMigrationService.migrateInteraction(minimalData);

      expect(result.id).toBe('test-1');
      expect(result.name).toBe('Unnamed Interaction');
      expect(result.type).toBe('unknown');
    });
  });

  describe('migrateInteractions', () => {
    test('should migrate array of interactions', () => {
      const interactions = [mockOldInteractionData, { ...mockOldInteractionData, id: 'test-2' }];
      const result = InteractionMigrationService.migrateInteractions(interactions);

      expect(result.successful).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
    });

    test('should handle migration errors gracefully', () => {
      const interactions = [mockOldInteractionData, null];
      const result = InteractionMigrationService.migrateInteractions(interactions);

      expect(result.successful).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
    });

    test('should handle invalid input', () => {
      expect(() => {
        InteractionMigrationService.migrateInteractions('not an array');
      }).toThrow('Interactions must be provided as an array');
    });
  });

  describe('migrateNodeInteractions', () => {
    const mockNodeData = {
      id: 'test-node',
      name: 'Test Node',
      interactions: [mockOldInteractionData, { ...mockOldInteractionData, id: 'test-2' }]
    };

    test('should migrate node interactions', () => {
      const result = InteractionMigrationService.migrateNodeInteractions(mockNodeData);

      expect(result.id).toBe('test-node');
      expect(result.contentInteractions).toHaveLength(2);
      expect(result.interactions).toHaveLength(2); // Legacy preserved
      expect(result._interactionMigrationInfo).toBeDefined();
    });

    test('should handle nodes without interactions', () => {
      const nodeWithoutInteractions = { id: 'empty-node', name: 'Empty Node' };
      const result = InteractionMigrationService.migrateNodeInteractions(nodeWithoutInteractions);

      expect(result.id).toBe('empty-node');
      expect(result.contentInteractions).toBeUndefined();
    });

    test('should handle invalid node data', () => {
      expect(() => {
        InteractionMigrationService.migrateNodeInteractions(null);
      }).toThrow('Invalid node data provided for migration');
    });
  });

  describe('migrateWorldInteractions', () => {
    const mockWorldData = {
      time: 1000,
      nodes: [
        {
          id: 'node1',
          interactions: [mockOldInteractionData]
        },
        {
          id: 'node2',
          interactions: [{ ...mockOldInteractionData, id: 'test-2' }]
        }
      ]
    };

    test('should migrate world interactions', () => {
      const result = InteractionMigrationService.migrateWorldInteractions(mockWorldData);

      expect(result.time).toBe(1000);
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].contentInteractions).toHaveLength(1);
      expect(result.nodes[1].contentInteractions).toHaveLength(1);
      expect(result._worldInteractionMigrationInfo).toBeDefined();
    });

    test('should handle worlds without nodes', () => {
      const worldWithoutNodes = { time: 500 };
      const result = InteractionMigrationService.migrateWorldInteractions(worldWithoutNodes);

      expect(result.time).toBe(500);
      expect(result.nodes).toEqual([]);
    });

    test('should handle invalid world data', () => {
      expect(() => {
        InteractionMigrationService.migrateWorldInteractions(null);
      }).toThrow('Invalid world data provided for migration');
    });
  });

  describe('validateMigration', () => {
    test('should validate successful migration', () => {
      const migrated = InteractionMigrationService.migrateInteraction(mockOldInteractionData);
      const validation = InteractionMigrationService.validateMigration(migrated, mockOldInteractionData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    test('should detect migration issues', () => {
      const corruptedMigration = new ContentInteraction({ id: 'test' });
      // Manually corrupt the migration
      corruptedMigration.requirements = [];

      const validation = InteractionMigrationService.validateMigration(corruptedMigration, mockOldInteractionData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Requirements not properly migrated');
    });

    test('should handle validation errors gracefully', () => {
      const validation = InteractionMigrationService.validateMigration(null, mockOldInteractionData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
    });
  });

  describe('createRollbackData and rollbackMigration', () => {
    test('should create and use rollback data', () => {
      const rollbackData = InteractionMigrationService.createRollbackData(mockOldInteractionData);

      expect(rollbackData.rollbackData).toEqual(mockOldInteractionData);
      expect(rollbackData.rollbackTimestamp).toBeDefined();
      expect(rollbackData.rollbackVersion).toBe('1.0.0');

      const migrated = InteractionMigrationService.migrateInteraction(mockOldInteractionData);
      const rolledBack = InteractionMigrationService.rollbackMigration(migrated, rollbackData);

      expect(rolledBack).toEqual(mockOldInteractionData);
    });

    test('should handle invalid rollback data', () => {
      const migrated = InteractionMigrationService.migrateInteraction(mockOldInteractionData);

      expect(() => {
        InteractionMigrationService.rollbackMigration(migrated, null);
      }).toThrow('Valid rollback information is required');
    });
  });

  describe('needsMigration', () => {
    test('should detect migration needs for old format', () => {
      expect(InteractionMigrationService.needsMigration(mockOldInteractionData)).toBe(true);
    });

    test('should not need migration for already migrated data', () => {
      const migrated = InteractionMigrationService.migrateInteraction(mockOldInteractionData);
      expect(InteractionMigrationService.needsMigration(migrated)).toBe(false);
    });

    test('should not need migration for ContentInteraction format', () => {
      const contentInteraction = new ContentInteraction({ id: 'test' });
      expect(InteractionMigrationService.needsMigration(contentInteraction)).toBe(false);
    });

    test('should handle invalid data', () => {
      expect(InteractionMigrationService.needsMigration(null)).toBe(false);
      expect(InteractionMigrationService.needsMigration('invalid')).toBe(false);
    });
  });

  describe('analyzeMigration', () => {
    test('should analyze migration needs', () => {
      const analysis = InteractionMigrationService.analyzeMigration(mockOldInteractionData);

      expect(analysis.needsMigration).toBe(true);
      expect(analysis.changes).toContain('Convert to ContentInteraction format');
      expect(analysis.changes).toContain('Preserve nodeId as legacy property');
    });

    test('should handle data that does not need migration', () => {
      const contentInteraction = new ContentInteraction({ id: 'test' });
      const analysis = InteractionMigrationService.analyzeMigration(contentInteraction);

      expect(analysis.needsMigration).toBe(false);
      expect(analysis.changes).toHaveLength(0);
    });

    test('should handle invalid data', () => {
      const analysis = InteractionMigrationService.analyzeMigration(null);

      expect(analysis.needsMigration).toBe(false);
      expect(analysis.changes).toHaveLength(0);
    });
  });

  describe('getMigrationStatistics', () => {
    const interactions = [
      mockOldInteractionData,
      { ...mockOldInteractionData, id: 'test-2', type: 'combat' },
      new ContentInteraction({ id: 'test-3', type: 'dialogue' })
    ];

    test('should generate migration statistics', () => {
      const stats = InteractionMigrationService.getMigrationStatistics(interactions);

      expect(stats.total).toBe(3);
      expect(stats.needsMigration).toBe(2);
      expect(stats.alreadyMigrated).toBe(0);
      expect(stats.byType.dialogue).toBe(2);
      expect(stats.byType.combat).toBe(1);
    });

    test('should handle invalid input', () => {
      expect(() => {
        InteractionMigrationService.getMigrationStatistics('not an array');
      }).toThrow('Interactions must be provided as an array');
    });
  });

  describe('migrateWithProgress', () => {
    test('should migrate with progress callback', () => {
      const interactions = [mockOldInteractionData, { ...mockOldInteractionData, id: 'test-2' }];
      const progressCalls = [];

      const result = InteractionMigrationService.migrateWithProgress(interactions, (progress) => {
        progressCalls.push(progress);
      });

      expect(result).toHaveLength(2);
      expect(progressCalls).toHaveLength(2);
      expect(progressCalls[0].current).toBe(1);
      expect(progressCalls[0].total).toBe(2);
      expect(progressCalls[1].current).toBe(2);
    });

    test('should handle invalid input', () => {
      expect(() => {
        InteractionMigrationService.migrateWithProgress('not an array');
      }).toThrow('Interactions must be provided as an array');
    });
  });
});
