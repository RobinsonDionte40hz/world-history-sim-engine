// src/application/services/__tests__/AssignmentManager.test.js

import { AssignmentManager } from '../AssignmentManager';

describe('AssignmentManager', () => {
  let manager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Create fresh instance
    manager = new AssignmentManager();
    
    // Register test entities
    manager.registerCharacter('char1');
    manager.registerCharacter('char2');
    manager.registerNode('node1');
    manager.registerNode('node2');
    manager.registerInteraction('int1');
    manager.registerInteraction('int2');
  });

  describe('Character-Node Assignments', () => {
    test('should assign character to node bidirectionally', () => {
      const success = manager.assignCharacterToNode('char1', 'node1');
      
      expect(success).toBe(true);
      expect(manager.getNodeByCharacter('char1')).toBe('node1');
      expect(manager.getCharactersByNode('node1')).toContain('char1');
    });

    test('should move character to new node', () => {
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToNode('char1', 'node2');
      
      expect(manager.getNodeByCharacter('char1')).toBe('node2');
      expect(manager.getCharactersByNode('node1')).not.toContain('char1');
      expect(manager.getCharactersByNode('node2')).toContain('char1');
    });

    test('should unassign character from node', () => {
      manager.assignCharacterToNode('char1', 'node1');
      manager.unassignCharacterFromNode('char1');
      
      expect(manager.getNodeByCharacter('char1')).toBeNull();
      expect(manager.getCharactersByNode('node1')).not.toContain('char1');
    });

    test('should handle multiple characters at same node', () => {
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToNode('char2', 'node1');
      
      const characters = manager.getCharactersByNode('node1');
      expect(characters).toHaveLength(2);
      expect(characters).toContain('char1');
      expect(characters).toContain('char2');
    });
  });

  describe('Character-Interaction Assignments', () => {
    test('should assign character to interaction bidirectionally', () => {
      const success = manager.assignCharacterToInteraction('char1', 'int1');
      
      expect(success).toBe(true);
      expect(manager.getInteractionsByCharacter('char1')).toContain('int1');
      expect(manager.getCharactersByInteraction('int1')).toContain('char1');
    });

    test('should assign multiple interactions to character', () => {
      manager.assignCharacterToInteraction('char1', 'int1');
      manager.assignCharacterToInteraction('char1', 'int2');
      
      const interactions = manager.getInteractionsByCharacter('char1');
      expect(interactions).toHaveLength(2);
      expect(interactions).toContain('int1');
      expect(interactions).toContain('int2');
    });

    test('should unassign character from interaction', () => {
      manager.assignCharacterToInteraction('char1', 'int1');
      manager.unassignCharacterFromInteraction('char1', 'int1');
      
      expect(manager.getInteractionsByCharacter('char1')).not.toContain('int1');
      expect(manager.getCharactersByInteraction('int1')).not.toContain('char1');
    });
  });

  describe('Cleanup Operations', () => {
    test('should cleanup deleted character completely', () => {
      // Setup assignments
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToInteraction('char1', 'int1');
      manager.assignCharacterToInteraction('char1', 'int2');
      
      // Cleanup character
      manager.cleanupDeletedCharacter('char1');
      
      // Verify cleanup
      expect(manager.getNodeByCharacter('char1')).toBeNull();
      expect(manager.getCharactersByNode('node1')).not.toContain('char1');
      expect(manager.getInteractionsByCharacter('char1')).toHaveLength(0);
      expect(manager.getCharactersByInteraction('int1')).not.toContain('char1');
      expect(manager.getCharactersByInteraction('int2')).not.toContain('char1');
      expect(manager.knownCharacters.has('char1')).toBe(false);
    });

    test('should cleanup deleted node completely', () => {
      // Setup assignments
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToNode('char2', 'node1');
      
      // Cleanup node
      manager.cleanupDeletedNode('node1');
      
      // Verify cleanup
      expect(manager.getNodeByCharacter('char1')).toBeNull();
      expect(manager.getNodeByCharacter('char2')).toBeNull();
      expect(manager.getCharactersByNode('node1')).toHaveLength(0);
      expect(manager.knownNodes.has('node1')).toBe(false);
    });

    test('should cleanup deleted interaction completely', () => {
      // Setup assignments
      manager.assignCharacterToInteraction('char1', 'int1');
      manager.assignCharacterToInteraction('char2', 'int1');
      
      // Cleanup interaction
      manager.cleanupDeletedInteraction('int1');
      
      // Verify cleanup
      expect(manager.getInteractionsByCharacter('char1')).not.toContain('int1');
      expect(manager.getInteractionsByCharacter('char2')).not.toContain('int1');
      expect(manager.getCharactersByInteraction('int1')).toHaveLength(0);
      expect(manager.knownInteractions.has('int1')).toBe(false);
    });
  });

  describe('Persistence', () => {
    test('should save and load assignments from storage', () => {
      // Setup assignments
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToInteraction('char1', 'int1');
      
      // Save to storage
      manager.saveToStorage();
      
      // Create new manager instance
      const newManager = new AssignmentManager();
      
      // Verify loaded data
      expect(newManager.getNodeByCharacter('char1')).toBe('node1');
      expect(newManager.getInteractionsByCharacter('char1')).toContain('int1');
    });

    test('should handle export and import', () => {
      // Setup assignments
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToInteraction('char1', 'int1');
      
      // Export data
      const exportedData = manager.exportAssignments();
      
      // Clear and import
      manager.clearAllAssignments();
      expect(manager.getNodeByCharacter('char1')).toBeNull();
      
      manager.importAssignments(exportedData);
      
      // Verify imported data
      expect(manager.getNodeByCharacter('char1')).toBe('node1');
      expect(manager.getInteractionsByCharacter('char1')).toContain('int1');
    });
  });

  describe('Validation', () => {
    test('should detect valid assignments', () => {
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToInteraction('char1', 'int1');
      
      const validation = manager.validateAssignments();
      
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    test('should detect orphaned references', () => {
      // Create assignment then remove from known entities
      manager.assignCharacterToNode('char1', 'node1');
      manager.knownCharacters.delete('char1');
      
      const validation = manager.validateAssignments();
      
      expect(validation.valid).toBe(false);
      expect(validation.issues).toContainEqual(
        expect.objectContaining({
          type: 'orphan',
          entity: 'character'
        })
      );
    });

    test('should repair orphaned assignments', () => {
      // Create orphaned assignment
      manager.assignCharacterToNode('char1', 'node1');
      manager.knownCharacters.delete('char1');
      
      // Repair
      const repaired = manager.repairAssignments();
      
      expect(repaired).toBeGreaterThan(0);
      expect(manager.getNodeByCharacter('char1')).toBeNull();
    });
  });

  describe('Bulk Operations', () => {
    test('should bulk assign characters to node', () => {
      const results = manager.bulkAssignCharactersToNode(['char1', 'char2'], 'node1');
      
      expect(results.successes).toHaveLength(2);
      expect(results.failures).toHaveLength(0);
      expect(manager.getCharactersByNode('node1')).toHaveLength(2);
    });

    test('should bulk assign interactions to character', () => {
      const results = manager.bulkAssignInteractionsToCharacter('char1', ['int1', 'int2']);
      
      expect(results.successes).toHaveLength(2);
      expect(results.failures).toHaveLength(0);
      expect(manager.getInteractionsByCharacter('char1')).toHaveLength(2);
    });
  });

  describe('Statistics', () => {
    test('should calculate correct statistics', () => {
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToNode('char2', 'node1');
      manager.assignCharacterToInteraction('char1', 'int1');
      manager.assignCharacterToInteraction('char2', 'int2'); // Assign char2 to an interaction as well
      
      const stats = manager.getStatistics();
      
      expect(stats.totalCharacters).toBe(2);
      expect(stats.totalNodes).toBe(2);
      expect(stats.totalInteractions).toBe(2);
      expect(stats.charactersWithNodes).toBe(2);
      expect(stats.charactersWithInteractions).toBe(2); // Both characters now have interactions
      expect(stats.averageCharactersPerNode).toBeGreaterThan(0);
    });
  });

  describe('Enhanced Assignment Methods', () => {
    test('should update character assignments comprehensively', () => {
      // Initial setup
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToInteraction('char1', 'int1');
      
      // Update assignments
      const success = manager.updateCharacterAssignments('char1', {
        nodeId: 'node2',
        interactionIds: ['int2']
      });
      
      expect(success).toBe(true);
      expect(manager.getNodeByCharacter('char1')).toBe('node2');
      expect(manager.getCharactersByNode('node1')).not.toContain('char1');
      expect(manager.getCharactersByNode('node2')).toContain('char1');
      expect(manager.getInteractionsByCharacter('char1')).toEqual(['int2']);
      expect(manager.getCharactersByInteraction('int1')).not.toContain('char1');
      expect(manager.getCharactersByInteraction('int2')).toContain('char1');
    });

    test('should get comprehensive character assignment details', () => {
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToInteraction('char1', 'int1');
      manager.assignCharacterToInteraction('char1', 'int2');
      
      const details = manager.getCharacterAssignmentDetails('char1');
      
      expect(details.characterId).toBe('char1');
      expect(details.exists).toBe(true);
      expect(details.nodeAssignment.nodeId).toBe('node1');
      expect(details.nodeAssignment.hasAssignment).toBe(true);
      expect(details.interactionAssignments.interactionIds).toHaveLength(2);
      expect(details.interactionAssignments.count).toBe(2);
      expect(details.summary.hasNodeAssignment).toBe(true);
      expect(details.summary.hasInteractionAssignments).toBe(true);
      expect(details.summary.totalAssignments).toBe(3);
    });

    test('should validate assignments against world state', () => {
      // Setup assignments
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToInteraction('char1', 'int1');
      
      // Mock world state with missing entities
      const worldState = {
        characters: [{ id: 'char1' }, { id: 'char2' }], // both characters exist
        nodes: [], // node1 missing
        interactions: [{ id: 'int1' }, { id: 'int2' }] // both interactions exist
      };
      
      const validation = manager.validateAssignmentsAgainstWorld(worldState);
      
      expect(validation.valid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      
      // Check that we have the expected orphaned node issue
      const orphanedNodeIssues = validation.issues.filter(issue => issue.type === 'orphaned_node');
      expect(orphanedNodeIssues).toHaveLength(1);
      expect(orphanedNodeIssues[0].id).toBe('node1');
      expect(validation.stats.orphanedNodes).toBe(1);
    });

    test('should synchronize with world state and cleanup orphaned references', () => {
      // Setup assignments with some orphaned references
      manager.assignCharacterToNode('char1', 'node1');
      manager.assignCharacterToNode('char2', 'node2'); // char2 will be orphaned
      manager.assignCharacterToInteraction('char1', 'int1');
      
      // Mock world state missing some entities
      const worldState = {
        characters: [{ id: 'char1' }], // char2 missing
        nodes: [{ id: 'node1' }], // node2 missing  
        interactions: [{ id: 'int1' }]
      };
      
      const syncResult = manager.synchronizeWithWorldState(worldState);
      
      expect(syncResult.success).toBe(true);
      expect(syncResult.cleanupResults.charactersRemoved).toBeGreaterThan(0);
      expect(syncResult.finalValidation.valid).toBe(true);
      
      // Verify cleanup
      expect(manager.getNodeByCharacter('char2')).toBeNull();
      expect(manager.getCharactersByNode('node2')).toHaveLength(0);
    });
  });
});