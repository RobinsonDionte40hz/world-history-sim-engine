/**
 * Universe System Integration Tests
 * Tests the complete Universe system including entities, services, and persistence
 */

import Universe from '../../../src/domain/entities/Universe.js';
import WorldState from '../../../src/domain/entities/WorldState.js';
import WorldConnection, { WorldConnectionTypes } from '../../../src/domain/value-objects/WorldConnection.js';
import UniverseBuilder from '../../../src/domain/services/UniverseBuilder.js';
import UniverseValidator from '../../../src/domain/services/UniverseValidator.js';

describe('Universe System Integration', () => {
  describe('Universe Entity', () => {
    it('should create a basic universe', () => {
      const universe = new Universe({
        name: 'Test Universe',
        description: 'A test universe'
      });

      expect(universe.name).toBe('Test Universe');
      expect(universe.description).toBe('A test universe');
      expect(universe.worlds).toEqual([]);
      expect(universe.worldConnections).toEqual([]);
    });

    it('should add worlds to universe', () => {
      const universe = new Universe({
        name: 'Test Universe',
        description: 'A test universe'
      });

      const world1 = new WorldState({
        name: 'World 1',
        description: 'First world'
      });

      const world2 = new WorldState({
        name: 'World 2',
        description: 'Second world'
      });

      universe.addWorld(world1);
      universe.addWorld(world2);

      expect(universe.worlds.length).toBe(2);
      expect(universe.getWorld(world1.id)).toBe(world1);
      expect(universe.getWorld(world2.id)).toBe(world2);
    });

    it('should connect worlds', () => {
      const universe = new Universe({
        name: 'Test Universe',
        description: 'A test universe'
      });

      const world1 = new WorldState({ name: 'World 1', description: 'First' });
      const world2 = new WorldState({ name: 'World 2', description: 'Second' });

      universe.addWorld(world1);
      universe.addWorld(world2);

      universe.connectWorlds(world1.id, world2.id, {
        connectionType: WorldConnectionTypes.PORTAL,
        traversalDifficulty: 0.3
      });

      const connections = universe.getWorldConnections(world1.id);
      expect(connections.length).toBeGreaterThan(0);
      
      const connection = universe.getConnection(world1.id, world2.id);
      expect(connection).toBeTruthy();
      expect(connection.connectionType).toBe(WorldConnectionTypes.PORTAL);
    });

    it('should handle bidirectional connections', () => {
      const universe = new Universe({
        name: 'Test Universe',
        description: 'A test universe'
      });

      const world1 = new WorldState({ name: 'World 1', description: 'First' });
      const world2 = new WorldState({ name: 'World 2', description: 'Second' });

      universe.addWorld(world1);
      universe.addWorld(world2);

      universe.connectWorlds(world1.id, world2.id, {
        connectionType: WorldConnectionTypes.PORTAL,
        bidirectional: true
      });

      // Should have connections in both directions
      const forwardConnection = universe.getConnection(world1.id, world2.id);
      const reverseConnection = universe.getConnection(world2.id, world1.id);

      expect(forwardConnection).toBeTruthy();
      expect(reverseConnection).toBeTruthy();
    });

    it('should remove worlds and clean up connections', () => {
      const universe = new Universe({
        name: 'Test Universe',
        description: 'A test universe'
      });

      const world1 = new WorldState({ name: 'World 1', description: 'First' });
      const world2 = new WorldState({ name: 'World 2', description: 'Second' });

      universe.addWorld(world1);
      universe.addWorld(world2);
      universe.connectWorlds(world1.id, world2.id);

      const removed = universe.removeWorld(world1.id);

      expect(removed).toBe(true);
      expect(universe.worlds.length).toBe(1);
      expect(universe.worldConnections.length).toBe(0); // Connections cleaned up
    });
  });

  describe('WorldConnection Value Object', () => {
    it('should create a world connection', () => {
      const connection = new WorldConnection({
        sourceWorldId: 'world1',
        targetWorldId: 'world2',
        connectionType: WorldConnectionTypes.DIMENSIONAL_RIFT,
        traversalDifficulty: 0.7
      });

      expect(connection.sourceWorldId).toBe('world1');
      expect(connection.targetWorldId).toBe('world2');
      expect(connection.connectionType).toBe(WorldConnectionTypes.DIMENSIONAL_RIFT);
      expect(connection.traversalDifficulty).toBe(0.7);
    });

    it('should validate traversal difficulty bounds', () => {
      const connection = new WorldConnection({
        sourceWorldId: 'world1',
        targetWorldId: 'world2',
        traversalDifficulty: 1.5 // Invalid, should clamp
      });

      // Should use default or valid value
      expect(connection.traversalDifficulty).toBeGreaterThanOrEqual(0);
      expect(connection.traversalDifficulty).toBeLessThanOrEqual(1);
    });

    it('should create reverse connection', () => {
      const connection = new WorldConnection({
        sourceWorldId: 'world1',
        targetWorldId: 'world2',
        connectionType: WorldConnectionTypes.PORTAL,
        influence: {
          economic: 0.5,
          cultural: 0.3,
          political: 0,
          technological: 0.2
        }
      });

      const reverse = connection.createReverseConnection();

      expect(reverse.sourceWorldId).toBe('world2');
      expect(reverse.targetWorldId).toBe('world1');
      expect(reverse.influence.economic).toBe(-0.5);
      expect(reverse.influence.cultural).toBe(-0.3);
    });
  });

  describe('UniverseBuilder', () => {
    it('should build a universe using fluent API', () => {
      const builder = new UniverseBuilder();

      const universe = builder
        .setUniverseProperties('Test Universe', 'A test universe')
        .setTimeCoordination('synchronized')
        .addWorld(new WorldState({ name: 'World 1', description: 'First' }))
        .addWorld(new WorldState({ name: 'World 2', description: 'Second' }))
        .build();

      expect(universe.name).toBe('Test Universe');
      expect(universe.worlds.length).toBe(2);
      expect(universe.timeCoordination).toBe('synchronized');
    });

    it('should validate before building', () => {
      const builder = new UniverseBuilder();

      // Try to build without setting name
      expect(() => {
        builder.build();
      }).toThrow();
    });

    it('should connect worlds during building', () => {
      const builder = new UniverseBuilder();

      const world1 = new WorldState({ name: 'World 1', description: 'First' });
      const world2 = new WorldState({ name: 'World 2', description: 'Second' });

      const universe = builder
        .setUniverseProperties('Test Universe', 'A test universe')
        .addWorld(world1)
        .addWorld(world2)
        .connectWorlds(world1.id, world2.id, {
          connectionType: WorldConnectionTypes.TRADE_ROUTE
        })
        .build();

      expect(universe.worldConnections.length).toBeGreaterThan(0);
    });
  });

  describe('UniverseValidator', () => {
    it('should validate a complete universe', () => {
      const universe = new Universe({
        name: 'Test Universe',
        description: 'A test universe'
      });

      const world1 = new WorldState({ name: 'World 1', description: 'First' });
      const world2 = new WorldState({ name: 'World 2', description: 'Second' });

      universe.addWorld(world1);
      universe.addWorld(world2);

      const validation = UniverseValidator.validate(universe);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should detect missing universe name', () => {
      const universe = new Universe({
        description: 'A test universe'
      });

      const validation = UniverseValidator.validate(universe);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.field === 'name')).toBe(true);
    });

    it('should detect invalid connections', () => {
      const universe = new Universe({
        name: 'Test Universe',
        description: 'A test universe'
      });

      const world1 = new WorldState({ name: 'World 1', description: 'First' });
      universe.addWorld(world1);

      // Manually add invalid connection
      universe.worldConnections.push(new WorldConnection({
        sourceWorldId: world1.id,
        targetWorldId: 'nonexistent_world'
      }));

      const validation = UniverseValidator.validate(universe);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('not found'))).toBe(true);
    });

    it('should warn about isolated worlds', () => {
      const universe = new Universe({
        name: 'Test Universe',
        description: 'A test universe'
      });

      const world1 = new WorldState({ name: 'World 1', description: 'First' });
      const world2 = new WorldState({ name: 'World 2', description: 'Second' });
      const world3 = new WorldState({ name: 'World 3', description: 'Third' });

      universe.addWorld(world1);
      universe.addWorld(world2);
      universe.addWorld(world3);

      // Only connect world1 and world2, leaving world3 isolated
      universe.connectWorlds(world1.id, world2.id);

      const validation = UniverseValidator.validate(universe);

      expect(validation.warnings.some(w => w.message.includes('isolated'))).toBe(true);
    });
  });

  describe('Universe Serialization', () => {
    it('should serialize and deserialize universe', () => {
      const universe = new Universe({
        name: 'Test Universe',
        description: 'A test universe'
      });

      const world1 = new WorldState({ name: 'World 1', description: 'First' });
      universe.addWorld(world1);

      const json = universe.toJSON();
      const restored = Universe.fromJSON(json);

      expect(restored.name).toBe(universe.name);
      expect(restored.description).toBe(universe.description);
      expect(restored.worlds.length).toBe(1);
    });
  });
});
