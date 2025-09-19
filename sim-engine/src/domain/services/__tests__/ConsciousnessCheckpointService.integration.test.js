/**
 * Integration tests for ConsciousnessCheckpointService
 * 
 * Tests integration with other consciousness system services
 */

const ConsciousnessCheckpointService = require('../ConsciousnessCheckpointService');

describe('ConsciousnessCheckpointService Integration', () => {
  const createIntegratedNPC = (id) => ({
    id,
    consciousness: {
      baseFrequency: 8.0,
      baseCoherence: 0.75,
      behavioralState: {
        energy: 'moderate',
        focus: 'balanced',
        mood: 'content',
        socialDrive: 0.6,
        riskTolerance: 0.5,
        ambition: 0.7
      },
      significantEvents: [],
      lastUpdate: Date.now(),
      updateTriggerThreshold: 0.3
    },
    goals: [],
    significantMemories: []
  });

  // Mock significance calculation for testing
  const calculateMockSignificance = (event) => {
    const typeSignificance = {
      'goal_completion': 0.7,
      'social_interaction_major': 0.6,
      'traumatic_encounter': 0.9,
      'conflict': 0.7,
      'romance': 0.8,
      'major_decision': 0.8,
      'rest': 0.1
    };
    
    let significance = typeSignificance[event.type] || 0.3;
    
    if (event.outcome === 'critical_success' || event.outcome === 'critical_failure') {
      significance += 0.2;
    }
    
    if (event.emotionalImpact) {
      significance += event.emotionalImpact * 0.2;
    }
    
    return Math.min(1.0, significance);
  };

  // Mock memory addition for testing
  const addMockMemoryIfSignificant = (character, interaction, outcome) => {
    const event = { type: interaction.type, outcome, emotionalImpact: 0.5 };
    const significance = calculateMockSignificance(event);
    
    if (significance < 0.3) {
      return false;
    }
    
    if (!character.significantMemories) {
      character.significantMemories = [];
    }
    
    character.significantMemories.push({
      id: `mem_${Date.now()}`,
      interactionType: interaction.type,
      outcome: outcome,
      significance: significance,
      timestamp: Date.now(),
      participants: interaction.participants || [],
      location: character.currentNodeId || 'unknown'
    });
    
    // Enforce limit
    if (character.significantMemories.length > 50) {
      character.significantMemories = character.significantMemories.slice(-50);
    }
    
    return true;
  };

  test('should integrate with event significance calculation for event processing', () => {
    const npc = createIntegratedNPC('npc1');
    const worldState = { npcs: [npc] };

    // Add significant event using mock significance calculation
    const event = {
      type: 'goal_completion',
      outcome: 'critical_success',
      emotionalImpact: 0.8
    };

    const significance = calculateMockSignificance(event);
    expect(significance).toBeGreaterThan(0.3);

    // Add event to NPC
    npc.consciousness.significantEvents.push({
      ...event,
      significance,
      timestamp: Date.now()
    });

    // Create checkpoint
    const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
    const npcState = checkpoint.characterStates.get('npc1');

    expect(npcState.significantEvents).toHaveLength(1);
    expect(npcState.significantEvents[0].significance).toBe(significance);
  });

  test('should integrate with memory significance filtering for memory storage', () => {
    const npc = createIntegratedNPC('npc1');
    const worldState = { npcs: [npc] };

    // Add significant memory using mock memory service
    const interaction = {
      type: 'social',
      participants: ['npc2'],
      isFirstTime: true
    };

    const outcome = 'critical_success';
    const memoryAdded = addMockMemoryIfSignificant(npc, interaction, outcome);

    expect(memoryAdded).toBe(true);
    expect(npc.significantMemories).toHaveLength(1);

    // Create checkpoint
    const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
    const npcState = checkpoint.characterStates.get('npc1');

    expect(npcState.significantMemories).toHaveLength(1);
    expect(npcState.significantMemories[0].interactionType).toBe('social');
    expect(npcState.significantMemories[0].outcome).toBe('critical_success');
  });

  test('should handle full consciousness system workflow', () => {
    const npc = createIntegratedNPC('npc1');
    const worldState = { npcs: [npc] };

    // Step 1: Add significant events
    const events = [
      { type: 'goal_completion', outcome: 'success', emotionalImpact: 0.6 },
      { type: 'social_interaction_major', outcome: 'positive', emotionalImpact: 0.4 },
      { type: 'traumatic_encounter', outcome: 'failure', emotionalImpact: 0.9 }
    ];

    events.forEach(event => {
      const significance = calculateMockSignificance(event);
      if (significance >= 0.3) {
        npc.consciousness.significantEvents.push({
          ...event,
          significance,
          timestamp: Date.now()
        });
      }
    });

    // Step 2: Add significant memories
    const interactions = [
      { type: 'social', participants: ['npc2'] },
      { type: 'conflict', participants: ['npc3'], involvesImportantNPC: true },
      { type: 'trade', participants: ['npc4'] }
    ];

    interactions.forEach(interaction => {
      addMockMemoryIfSignificant(npc, interaction, 'success');
    });

    // Step 3: Create checkpoint
    const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);

    // Step 4: Modify NPC state
    npc.consciousness.baseFrequency = 5.0;
    npc.consciousness.behavioralState.mood = 'depressed';
    npc.consciousness.significantEvents = [];
    npc.significantMemories = [];

    // Step 5: Restore from checkpoint
    const result = ConsciousnessCheckpointService.restoreCheckpoint(worldState, checkpoint);

    expect(result.success).toBe(true);
    expect(npc.consciousness.baseFrequency).toBe(8.0);
    expect(npc.consciousness.behavioralState.mood).toBe('content');
    expect(npc.consciousness.significantEvents.length).toBeGreaterThan(0);
    expect(npc.significantMemories.length).toBeGreaterThan(0);
  });

  test('should handle maintenance with integrated services', () => {
    const npc = createIntegratedNPC('npc1');
    const worldState = { npcs: [npc] };

    // Add many events and memories
    for (let i = 0; i < 30; i++) {
      const event = {
        type: 'social_interaction_major',
        outcome: 'positive',
        emotionalImpact: 0.5
      };
      
      const significance = calculateMockSignificance(event);
      npc.consciousness.significantEvents.push({
        ...event,
        significance,
        timestamp: Date.now() - i * 1000
      });

      const interaction = { type: 'social', participants: [`npc${i}`] };
      addMockMemoryIfSignificant(npc, interaction, 'success');
    }

    expect(npc.consciousness.significantEvents.length).toBe(30);
    expect(npc.significantMemories.length).toBe(30);

    // Perform maintenance
    const result = ConsciousnessCheckpointService.performMaintenance(worldState);

    expect(result.processedNPCs).toBe(1);
    expect(result.prunedEvents).toBe(10); // 30 - 20 = 10
    expect(result.prunedMemories).toBe(0); // 30 is under the 50 limit
    expect(npc.consciousness.significantEvents.length).toBe(20);
    expect(npc.significantMemories.length).toBe(30);
  });

  test('should preserve service-generated data through save/restore cycle', () => {
    const npc1 = createIntegratedNPC('npc1');
    const npc2 = createIntegratedNPC('npc2');
    const worldState = { npcs: [npc1, npc2] };

    // Generate data using integrated services
    [npc1, npc2].forEach(npc => {
      // Add events with different significance levels
      const events = [
        { type: 'goal_completion', outcome: 'critical_success', emotionalImpact: 0.8 },
        { type: 'rest', outcome: 'neutral', emotionalImpact: 0.1 }, // Should be filtered out
        { type: 'conflict', outcome: 'failure', emotionalImpact: 0.7 }
      ];

      events.forEach(event => {
        const significance = calculateMockSignificance(event);
        if (significance >= 0.3) {
          npc.consciousness.significantEvents.push({
            ...event,
            significance,
            timestamp: Date.now()
          });
        }
      });

      // Add memories with different significance levels
      const interactions = [
        { type: 'romance', participants: ['partner'] }, // High significance
        { type: 'rest', participants: [] }, // Low significance
        { type: 'major_decision', participants: ['advisor'], hasLongTermConsequences: true }
      ];

      interactions.forEach(interaction => {
        addMockMemoryIfSignificant(npc, interaction, 'success');
      });
    });

    // Verify initial state
    expect(npc1.consciousness.significantEvents.length).toBe(2); // rest filtered out
    expect(npc1.significantMemories.length).toBe(2); // rest filtered out

    // Save and restore
    const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
    
    // Clear state
    npc1.consciousness.significantEvents = [];
    npc1.significantMemories = [];
    npc2.consciousness.significantEvents = [];
    npc2.significantMemories = [];

    const result = ConsciousnessCheckpointService.restoreCheckpoint(worldState, checkpoint);

    // Verify restoration
    expect(result.success).toBe(true);
    expect(npc1.consciousness.significantEvents.length).toBe(2);
    expect(npc1.significantMemories.length).toBe(2);
    expect(npc2.consciousness.significantEvents.length).toBe(2);
    expect(npc2.significantMemories.length).toBe(2);

    // Verify data integrity
    expect(npc1.consciousness.significantEvents[0].type).toBe('goal_completion');
    expect(npc1.significantMemories[0].interactionType).toBe('romance');
  });
});