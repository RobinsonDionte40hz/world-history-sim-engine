/**
 * Long-Running Consciousness System Simulation Integration Tests
 * 
 * Tests for behavioral consistency, memory evolution, and performance
 * over extended simulation periods with multiple NPCs.
 */

import Character from '../../domain/entities/Character.js';
import ConsciousnessSystem from '../../domain/value-objects/ConsciousnessSystem.js';
import BehavioralStateService from '../../domain/services/BehavioralStateService.js';
import EventSignificanceService from '../../domain/services/EventSignificanceService.js';
import ConsciousnessUpdateService from '../../domain/services/ConsciousnessUpdateService.js';
import SignificantMemoryService from '../../domain/services/SignificantMemoryService.js';
import ConsciousnessCheckpointService from '../../domain/services/ConsciousnessCheckpointService.js';
import MemoryManagementService from '../../domain/services/MemoryManagementService.js';
import PerformanceMonitoringService from '../../domain/services/PerformanceMonitoringService.js';

describe('Long-Running Consciousness System Simulation', () => {
  let worldState;
  let performanceMonitor;
  let characters;

  beforeEach(() => {
    // Create population of diverse NPCs
    characters = [];
    const characterMap = new Map();

    for (let i = 0; i < 20; i++) {
      const character = new Character({
        id: `sim-char-${i}`,
        name: `Simulation Character ${i}`,
        consciousness: new ConsciousnessSystem({
          baseFrequency: 5 + Math.random() * 8, // 5-13 Hz range
          baseCoherence: 0.3 + Math.random() * 0.6 // 0.3-0.9 range
        }),
        personality: {
          traits: {
            empathy: Math.random(),
            aggression: Math.random(),
            patience: Math.random(),
            ambition: Math.random(),
            loyalty: Math.random(),
            curiosity: Math.random()
          }
        },
        attributes: {
          strength: { score: 8 + Math.floor(Math.random() * 10), modifier: 0 },
          dexterity: { score: 8 + Math.floor(Math.random() * 10), modifier: 0 },
          constitution: { score: 8 + Math.floor(Math.random() * 10), modifier: 0 },
          intelligence: { score: 8 + Math.floor(Math.random() * 10), modifier: 0 },
          wisdom: { score: 8 + Math.floor(Math.random() * 10), modifier: 0 },
          charisma: { score: 8 + Math.floor(Math.random() * 10), modifier: 0 }
        }
      });

      characters.push(character);
      characterMap.set(character.id, character);
    }

    worldState = {
      characters: characterMap,
      nodes: new Map([
        ['marketplace', { id: 'marketplace', type: 'economic', assignedCharacters: characters.slice(0, 7).map(c => c.id) }],
        ['temple', { id: 'temple', type: 'religious', assignedCharacters: characters.slice(7, 14).map(c => c.id) }],
        ['tavern', { id: 'tavern', type: 'social', assignedCharacters: characters.slice(14).map(c => c.id) }]
      ]),
      interactions: new Map([
        ['trade', { id: 'trade', type: 'economic', effects: [] }],
        ['worship', { id: 'worship', type: 'religious', effects: [] }],
        ['socialize', { id: 'socialize', type: 'social', effects: [] }]
      ])
    };

    performanceMonitor = new PerformanceMonitoringService();
    performanceMonitor.startMonitoring();
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
  });

  describe('Extended Simulation Tests', () => {
    test('should maintain behavioral consistency over 100 simulation turns', async () => {
      const turnCount = 100;
      const behavioralSnapshots = [];
      const performanceMetrics = [];

      // Run extended simulation
      for (let turn = 0; turn < turnCount; turn++) {
        const turnStartTime = performance.now();
        const turnSnapshot = {
          turn,
          characters: new Map()
        };

        // Process each character
        for (const character of characters) {
          // Generate random events for this turn
          const events = generateRandomEvents(character, turn);
          
          // Process significant events
          events.forEach(event => {
            const significance = EventSignificanceService.calculateEventSignificance(event);
            if (significance >= 0.3) {
              ConsciousnessUpdateService.processEvent(character, event);
              
              // Add memory if significant
              SignificantMemoryService.addMemoryIfSignificant(
                character,
                { type: event.type, id: `event-${turn}-${character.id}` },
                { success: event.outcome === 'success', significance }
              );
            }
          });

          // Calculate decision factor
          const decisionFactor = BehavioralStateService.calculateDecisionFactor(
            character,
            'social',
            { nodeType: 'settlement' }
          );

          // Store snapshot
          turnSnapshot.characters.set(character.id, {
            frequency: character.consciousness.baseFrequency,
            coherence: character.consciousness.baseCoherence,
            behavioralState: { ...character.consciousness.behavioralState },
            decisionFactor,
            memoryCount: (character.consciousness.significantMemories || []).length
          });
        }

        behavioralSnapshots.push(turnSnapshot);
        
        const turnEndTime = performance.now();
        performanceMetrics.push(turnEndTime - turnStartTime);

        // Periodic maintenance every 10 turns
        if (turn % 10 === 0) {
          MemoryManagementService.performWorldLevelCleanup(worldState);
        }
      }

      // Analyze results
      expect(behavioralSnapshots.length).toBe(turnCount);
      
      // Verify all characters maintained valid states
      behavioralSnapshots.forEach((snapshot, turnIndex) => {
        snapshot.characters.forEach((charData, charId) => {
          expect(charData.frequency).toBeGreaterThanOrEqual(3);
          expect(charData.frequency).toBeLessThanOrEqual(15);
          expect(charData.coherence).toBeGreaterThanOrEqual(0.2);
          expect(charData.coherence).toBeLessThanOrEqual(1.0);
          expect(charData.decisionFactor).toBeGreaterThanOrEqual(0.1);
          expect(charData.decisionFactor).toBeLessThanOrEqual(3.0);
          expect(charData.memoryCount).toBeLessThanOrEqual(50); // Memory limit enforced
        });
      });

      // Verify performance remained stable
      const avgTurnTime = performanceMetrics.reduce((a, b) => a + b, 0) / performanceMetrics.length;
      const maxTurnTime = Math.max(...performanceMetrics);
      
      expect(avgTurnTime).toBeLessThan(50); // Average turn should be under 50ms
      expect(maxTurnTime).toBeLessThan(200); // No turn should exceed 200ms
    });

    test('should show realistic behavioral evolution over time', async () => {
      const testCharacter = characters[0];
      const initialState = {
        frequency: testCharacter.consciousness.baseFrequency,
        coherence: testCharacter.consciousness.baseCoherence,
        behavioralState: { ...testCharacter.consciousness.behavioralState }
      };

      // Apply consistent positive experiences
      const positiveEvents = [
        { type: 'social_success', outcome: 'success', emotionalImpact: 0.6 },
        { type: 'goal_completion', outcome: 'success', emotionalImpact: 0.7 },
        { type: 'relationship_improvement', outcome: 'success', emotionalImpact: 0.5 }
      ];

      for (let i = 0; i < 20; i++) {
        positiveEvents.forEach(event => {
          const significance = EventSignificanceService.calculateEventSignificance(event);
          if (significance >= 0.3) {
            ConsciousnessUpdateService.processEvent(testCharacter, event);
          }
        });
      }

      const finalState = {
        frequency: testCharacter.consciousness.baseFrequency,
        coherence: testCharacter.consciousness.baseCoherence,
        behavioralState: { ...testCharacter.consciousness.behavioralState }
      };

      // Character should show positive evolution
      expect(finalState.frequency).not.toBe(initialState.frequency);
      expect(finalState.coherence).not.toBe(initialState.coherence);
      expect(finalState.behavioralState).not.toEqual(initialState.behavioralState);

      // Behavioral state should reflect positive experiences
      const finalDecisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      expect(finalDecisionFactor).toBeGreaterThan(0.5); // Should be above neutral
    });

    test('should handle memory evolution and pruning correctly', async () => {
      const testCharacter = characters[0];
      const memoryEvents = [];

      // Generate many memory-worthy events
      for (let i = 0; i < 80; i++) {
        const event = {
          type: i % 2 === 0 ? 'social_success' : 'economic_gain',
          outcome: 'success',
          emotionalImpact: 0.4 + Math.random() * 0.4,
          timestamp: Date.now() + i * 1000
        };

        const significance = EventSignificanceService.calculateEventSignificance(event);
        if (significance >= 0.3) {
          SignificantMemoryService.addMemoryIfSignificant(
            testCharacter,
            { type: event.type, id: `memory-event-${i}` },
            { success: true, significance }
          );
          memoryEvents.push(event);
        }
      }

      // Verify memory limit enforcement
      const memories = testCharacter.consciousness.significantMemories || [];
      expect(memories.length).toBeLessThanOrEqual(50);

      // Verify most recent memories are preserved
      if (memories.length > 0) {
        const memoryTimestamps = memories.map(m => m.timestamp).sort((a, b) => b - a);
        expect(memoryTimestamps[0]).toBeGreaterThan(memoryTimestamps[memoryTimestamps.length - 1]);
      }

      // Test memory influence on decisions
      const socialDecisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );

      const economicDecisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'economic',
        { nodeType: 'settlement' }
      );

      expect(socialDecisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(economicDecisionFactor).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('Population-Scale Performance Tests', () => {
    test('should handle 50 NPCs efficiently in single turn', async () => {
      // Create larger population
      const largePopulation = [];
      for (let i = 0; i < 50; i++) {
        const character = new Character({
          id: `large-pop-${i}`,
          name: `Large Pop Character ${i}`,
          consciousness: new ConsciousnessSystem({
            baseFrequency: 6 + Math.random() * 6,
            baseCoherence: 0.4 + Math.random() * 0.5
          }),
          personality: {
            traits: {
              empathy: Math.random(),
              aggression: Math.random(),
              patience: Math.random(),
              ambition: Math.random(),
              loyalty: Math.random(),
              curiosity: Math.random()
            }
          }
        });
        largePopulation.push(character);
      }

      const startTime = performance.now();

      // Process all characters in single turn
      const results = largePopulation.map(character => {
        const events = generateRandomEvents(character, 1);
        
        events.forEach(event => {
          const significance = EventSignificanceService.calculateEventSignificance(event);
          if (significance >= 0.3) {
            ConsciousnessUpdateService.processEvent(character, event);
          }
        });

        return BehavioralStateService.calculateDecisionFactor(
          character,
          'social',
          { nodeType: 'settlement' }
        );
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Verify all processed successfully
      expect(results.length).toBe(50);
      results.forEach(factor => {
        expect(factor).toBeGreaterThanOrEqual(0.1);
        expect(factor).toBeLessThanOrEqual(3.0);
      });

      // Verify reasonable performance (should be under 1 second)
      expect(totalTime).toBeLessThan(1000);
    });

    test('should maintain performance with frequent checkpointing', async () => {
      const checkpointInterval = 5;
      const totalTurns = 25;
      const checkpointTimes = [];

      for (let turn = 0; turn < totalTurns; turn++) {
        // Process characters
        characters.forEach(character => {
          const events = generateRandomEvents(character, turn);
          events.forEach(event => {
            const significance = EventSignificanceService.calculateEventSignificance(event);
            if (significance >= 0.3) {
              ConsciousnessUpdateService.processEvent(character, event);
            }
          });
        });

        // Checkpoint every N turns
        if (turn % checkpointInterval === 0) {
          const checkpointStart = performance.now();
          const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
          const checkpointEnd = performance.now();
          
          checkpointTimes.push(checkpointEnd - checkpointStart);
          
          expect(checkpoint).toBeDefined();
          expect(checkpoint.characterStates.size).toBe(characters.length);
        }
      }

      // Verify checkpoint performance
      const avgCheckpointTime = checkpointTimes.reduce((a, b) => a + b, 0) / checkpointTimes.length;
      expect(avgCheckpointTime).toBeLessThan(100); // Should be under 100ms per checkpoint
    });
  });

  describe('Stress and Edge Case Tests', () => {
    test('should handle extreme consciousness parameter values', async () => {
      // Create character with extreme values
      const extremeCharacter = new Character({
        id: 'extreme-char',
        name: 'Extreme Character',
        consciousness: new ConsciousnessSystem({
          baseFrequency: 3, // Minimum
          baseCoherence: 0.2 // Minimum
        }),
        personality: {
          traits: {
            empathy: 0,
            aggression: 1,
            patience: 0,
            ambition: 1,
            loyalty: 0,
            curiosity: 1
          }
        }
      });

      // Apply extreme events
      const extremeEvents = [
        { type: 'major_trauma', outcome: 'critical_failure', emotionalImpact: 1.0 },
        { type: 'life_changing_event', outcome: 'critical_success', emotionalImpact: 1.0 }
      ];

      extremeEvents.forEach(event => {
        const significance = EventSignificanceService.calculateEventSignificance(event);
        ConsciousnessUpdateService.processEvent(extremeCharacter, event);
      });

      // Should still produce valid decision factors
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        extremeCharacter,
        'social',
        { nodeType: 'settlement' }
      );

      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);
      expect(Number.isFinite(decisionFactor)).toBe(true);

      // Consciousness parameters should remain within bounds
      expect(extremeCharacter.consciousness.baseFrequency).toBeGreaterThanOrEqual(3);
      expect(extremeCharacter.consciousness.baseFrequency).toBeLessThanOrEqual(15);
      expect(extremeCharacter.consciousness.baseCoherence).toBeGreaterThanOrEqual(0.2);
      expect(extremeCharacter.consciousness.baseCoherence).toBeLessThanOrEqual(1.0);
    });

    test('should recover from corrupted behavioral states', async () => {
      const testCharacter = characters[0];
      
      // Corrupt behavioral state
      testCharacter.consciousness.behavioralState = {
        energy: 'invalid',
        focus: null,
        mood: undefined,
        socialDrive: NaN,
        riskTolerance: -5,
        ambition: 10
      };

      // Should regenerate valid behavioral state
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );

      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);
      expect(Number.isFinite(decisionFactor)).toBe(true);

      // Behavioral state should be regenerated
      expect(testCharacter.consciousness.behavioralState.energy).toMatch(/^(low|moderate|high)$/);
      expect(testCharacter.consciousness.behavioralState.focus).toMatch(/^(scattered|balanced|focused)$/);
      expect(testCharacter.consciousness.behavioralState.mood).toMatch(/^(depressed|content|optimistic|excited)$/);
    });
  });

  // Helper function to generate random events for testing
  function generateRandomEvents(character, turn) {
    const eventTypes = [
      'social_interaction',
      'economic_activity',
      'goal_progress',
      'relationship_change',
      'environmental_change'
    ];

    const outcomes = ['success', 'failure', 'mixed'];
    const events = [];

    // Generate 1-3 events per turn
    const eventCount = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < eventCount; i++) {
      events.push({
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
        emotionalImpact: Math.random() * 0.8,
        participants: [character.id],
        timestamp: Date.now() + turn * 1000 + i
      });
    }

    return events;
  }
});