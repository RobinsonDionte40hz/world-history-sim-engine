// src/domain/services/__tests__/AssignmentManager.integration.test.js

import { AssignmentManager } from '../AssignmentManager';

describe('AssignmentManager Integration', () => {
  let assignmentManager;
  let mockWorldState;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Create fresh instance
    assignmentManager = new AssignmentManager();

    // Create mock world state for testing
    mockWorldState = {
      characters: [
        {
          id: 'char_elena',
          name: 'Elena the Merchant'
        },
        {
          id: 'char_marcus',
          name: 'Marcus the Scout'
        }
      ],
      nodes: [
        {
          id: 'node_village',
          name: 'Village Square'
        },
        {
          id: 'node_forest',
          name: 'Forest Path'
        }
      ],
      interactions: [
        {
          id: 'int_trade',
          name: 'Trade'
        },
        {
          id: 'int_scout',
          name: 'Scout'
        }
      ]
    };

    // Register entities with AssignmentManager
    mockWorldState.characters.forEach(char => assignmentManager.registerCharacter(char.id));
    mockWorldState.nodes.forEach(node => assignmentManager.registerNode(node.id));
    mockWorldState.interactions.forEach(interaction => assignmentManager.registerInteraction(interaction.id));
  });

  test('should handle complete assignment workflow', () => {
    const elena = mockWorldState.characters[0];
    const marcus = mockWorldState.characters[1];
    const villageSquare = mockWorldState.nodes[0];
    const forestPath = mockWorldState.nodes[1];
    const tradeInteraction = mockWorldState.interactions[0];
    const scoutInteraction = mockWorldState.interactions[1];

    // Assign characters to nodes
    assignmentManager.assignCharacterToNode(elena.id, villageSquare.id);
    assignmentManager.assignCharacterToNode(marcus.id, forestPath.id);

    // Assign interactions to characters
    assignmentManager.assignCharacterToInteraction(elena.id, tradeInteraction.id);
    assignmentManager.assignCharacterToInteraction(marcus.id, scoutInteraction.id);

    // Verify assignments
    expect(assignmentManager.getNodeByCharacter(elena.id)).toBe(villageSquare.id);
    expect(assignmentManager.getNodeByCharacter(marcus.id)).toBe(forestPath.id);
    expect(assignmentManager.getInteractionsByCharacter(elena.id)).toContain(tradeInteraction.id);
    expect(assignmentManager.getInteractionsByCharacter(marcus.id)).toContain(scoutInteraction.id);

    // Verify bidirectional relationships
    expect(assignmentManager.getCharactersByNode(villageSquare.id)).toContain(elena.id);
    expect(assignmentManager.getCharactersByNode(forestPath.id)).toContain(marcus.id);
    expect(assignmentManager.getCharactersByInteraction(tradeInteraction.id)).toContain(elena.id);
    expect(assignmentManager.getCharactersByInteraction(scoutInteraction.id)).toContain(marcus.id);
  });

  test('should handle character deletion with proper cleanup', () => {
    const elena = mockWorldState.characters[0];
    const villageSquare = mockWorldState.nodes[0];
    const tradeInteraction = mockWorldState.interactions[0];

    // Setup assignments
    assignmentManager.assignCharacterToNode(elena.id, villageSquare.id);
    assignmentManager.assignCharacterToInteraction(elena.id, tradeInteraction.id);

    // Verify assignments exist
    expect(assignmentManager.getNodeByCharacter(elena.id)).toBe(villageSquare.id);
    expect(assignmentManager.getInteractionsByCharacter(elena.id)).toContain(tradeInteraction.id);

    // Cleanup assignments (simulating character deletion)
    assignmentManager.cleanupDeletedCharacter(elena.id);

    // Verify cleanup
    expect(assignmentManager.getNodeByCharacter(elena.id)).toBeNull();
    expect(assignmentManager.getInteractionsByCharacter(elena.id)).toHaveLength(0);
    expect(assignmentManager.getCharactersByNode(villageSquare.id)).not.toContain(elena.id);
    expect(assignmentManager.getCharactersByInteraction(tradeInteraction.id)).not.toContain(elena.id);
  });

  test('should synchronize assignments with world state changes', () => {
    const elena = mockWorldState.characters[0];
    const villageSquare = mockWorldState.nodes[0];
    const tradeInteraction = mockWorldState.interactions[0];

    // Create assignments
    assignmentManager.assignCharacterToNode(elena.id, villageSquare.id);
    assignmentManager.assignCharacterToInteraction(elena.id, tradeInteraction.id);

    // Simulate world state change (remove a character)
    const updatedWorldState = {
      ...mockWorldState,
      characters: mockWorldState.characters.filter(c => c.id !== elena.id)
    };

    // Synchronize assignments with new world state
    const syncResult = assignmentManager.synchronizeWithWorldState(updatedWorldState);

    expect(syncResult.success).toBe(true);
    expect(syncResult.cleanupResults.charactersRemoved).toBeGreaterThan(0);
    expect(syncResult.finalValidation.valid).toBe(true);

    // Verify Elena's assignments are cleaned up
    expect(assignmentManager.getNodeByCharacter(elena.id)).toBeNull();
    expect(assignmentManager.getInteractionsByCharacter(elena.id)).toHaveLength(0);
  });
});