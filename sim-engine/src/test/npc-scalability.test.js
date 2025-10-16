/**
 * NPC Scalability Test
 * Tests how many NPCs the simulation can handle before failure
 */

import WorldBuilder from '../domain/services/WorldBuilder.js';
import simulationService from '../application/use-cases/services/SimulationService.js';

// Mock generateBehavior to skip interaction execution for scalability testing
jest.mock('../application/use-cases/npc/GenerateBehavior.js', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(null) // Return null to skip interaction execution
}));

// Mock localStorage for Node.js environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Test configuration
const NPC_COUNTS = [100, 300, 500, 1000, 2000, 5000, 10000];

/**
 * Gets the timeout for a given NPC count
 * Higher NPC counts get longer timeouts
 */
function getTimeoutForNpcCount(npcCount) {
  if (npcCount < 1000) return 30000; // 30 seconds
  if (npcCount < 5000) return 60000; // 1 minute
  return 120000; // 2 minutes for 10000+ NPCs
}

/**
 * Gets the number of turns to process for a given NPC count
 * Higher NPC counts get fewer turns to stay within time limits
 */
function getTurnsForNpcCount(npcCount) {
  if (npcCount < 1000) return 3;
  if (npcCount < 5000) return 2;
  return 1; // 10000+ NPCs get only 1 turn
}

/**
 * Creates a minimal test character for scalability testing
 */
function createTestCharacter(id, index) {
  return {
    id: `test-npc-${id}-${index}`,
    name: `NPC ${index}`,
    lodTier: 'background', // Use background tier for most NPCs to reduce processing
    attributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    // Minimal consciousness for scalability
    consciousness: {
      frequency: 40.0,
      coherence: 0.8
    },
    // Minimal personality
    personality: {
      traits: [
        { id: 'empathy', intensity: 0.5 }
      ]
    },
    assignments: {
      nodes: new Set(['test-node']),
      interactions: new Set(),
      settlements: new Set(['test-settlement'])
    },
    currentNodeId: 'test-node'
  };
}

/**
 * Creates a test world with specified number of NPCs
 */
function createTestWorld(npcCount) {
  const worldBuilder = new WorldBuilder();

  // Set up basic world properties
  worldBuilder.setWorldProperties(
    `Scalability Test World - ${npcCount} NPCs`,
    `Testing simulation performance with ${npcCount} NPCs`
  );

  // Set basic rules
  worldBuilder.setRules({
    timeProgression: 'turn-based',
    maxTurns: 10,
    lodEnabled: true
  });

  // Set initial conditions
  worldBuilder.setInitialConditions({
    startingYear: 2024,
    season: 'spring',
    globalEvents: []
  });

  // Create a basic node first (required before settlements)
  const nodeId = 'test-node';
  worldBuilder.addNode({
    id: nodeId,
    name: 'Test Location',
    description: 'A test location for scalability testing',
    type: 'settlement',
    environmentalProperties: {
      climate: 'temperate',
      season: 'spring',
      prosperous: true,
      crowded: false
    },
    culturalContext: {
      language: 'common',
      traditions: []
    },
    resourceAvailability: {
      food: 'sufficient',
      water: 'sufficient',
      materials: 'sufficient'
    }
  });

  // Create basic interactions
  worldBuilder.addInteraction({
    id: 'social-interaction',
    name: 'Social Gathering',
    type: 'social',
    requirements: {
      minCharacters: 2,
      context: 'settlement'
    },
    branches: [
      {
        id: 'positive',
        probability: 0.7,
        effects: [
          { type: 'relationship', target: 'participants', value: 5 }
        ]
      }
    ],
    effects: [
      { type: 'social', value: 1 }
    ],
    context: 'settlement',
    // Add required methods for interaction execution
    isAvailable: () => true,
    canExecute: () => true,
    metRequirements: () => true,
    meetsRequirements: () => true,
    selectBranch: () => ({ id: 'positive', probability: 0.7, effects: [] }),
    execute: () => ({ success: true, effects: [] })
  });

  worldBuilder.addInteraction({
    id: 'work-interaction',
    name: 'Work Activity',
    type: 'economic',
    requirements: {
      minCharacters: 1,
      context: 'settlement'
    },
    branches: [
      {
        id: 'productive',
        probability: 0.8,
        effects: [
          { type: 'resource', target: 'settlement', value: 10 }
        ]
      }
    ],
    effects: [
      { type: 'economic', value: 1 }
    ],
    context: 'settlement',
    // Add required methods for interaction execution
    isAvailable: () => true,
    canExecute: () => true,
    metRequirements: () => true,
    meetsRequirements: () => true,
    selectBranch: () => ({ id: 'productive', probability: 0.8, effects: [] }),
    execute: () => ({ success: true, effects: [] })
  });

  // Create NPCs with minimal data for scalability testing
  const characters = [];
  for (let i = 0; i < npcCount; i++) {
    const characterData = {
      id: `npc-${i}`,
      name: `NPC ${i}`,
      age: 25, // Fixed age for consistency
      level: 1, // Fixed level for consistency
      attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      consciousness: {
        frequency: 40.0, // Fixed frequency for consistency
        coherence: 0.8
      },
      personality: {
        traits: [
          { id: 'empathy', intensity: 0.5 }
        ]
      },
      health: 100, // Fixed health
      characterType: {
        category: 'npc',
        typeId: 'citizen'
      }
    };

    worldBuilder.addCharacter(characterData);
    characters.push(characterData.id);
  }

  // Assign characters to the node
  characters.forEach(characterId => {
    worldBuilder.assignCharacterToNode(characterId, nodeId);
  });

  // Create a basic settlement (after characters are assigned to nodes)
  worldBuilder.addSettlement({
    id: 'test-settlement',
    name: 'Test Settlement',
    type: 'village',
    population: npcCount,
    government: {
      type: 'council',
      leadership: []
    },
    economy: {
      currency: 'gold',
      tradeRoutes: []
    },
    culture: {
      language: 'common',
      traditions: []
    }
  });

  // Prepare the world for simulation
  const world = worldBuilder.prepareForSimulation();

  // Debug: Log the prepared world structure
  console.log('Prepared world structure:', {
    hasSimulationMetadata: !!world.simulationMetadata,
    metadataSource: world.simulationMetadata?.source,
    nodesIsMap: world.nodes instanceof Map,
    charactersIsMap: world.characters instanceof Map,
    interactionsIsMap: world.interactions instanceof Map,
    hasWorldProperties: !!world.worldProperties,
    worldName: world.worldProperties?.name
  });

  return world;
}

/**
 * Gets current memory usage
 */
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024) // MB
    };
  }
  return { rss: 0, heapUsed: 0, heapTotal: 0, external: 0 };
}

describe('NPC Scalability Tests', () => {
  beforeEach(() => {
    // Reset simulation service singleton
    simulationService.reset();
  });

  // Test each NPC count
  NPC_COUNTS.forEach(npcCount => {
    test(`should handle ${npcCount} NPCs`, async () => {
      const testStartTime = performance.now();
      const initialMemory = getMemoryUsage();
      const timeout = getTimeoutForNpcCount(npcCount);

      try {
        // Create world
        const world = createTestWorld(npcCount);
        const worldCreationTime = performance.now();

        // Initialize simulation
        console.log('About to initialize simulation with world:', {
          hasSimulationMetadata: !!world.simulationMetadata,
          simulationMetadata: world.simulationMetadata,
          worldProperties: world.worldProperties,
          nodesSize: world.nodes?.size,
          charactersSize: world.characters?.size,
          interactionsSize: world.interactions?.size,
          worldKeys: Object.keys(world),
          worldType: typeof world,
          worldConstructor: world?.constructor?.name
        });
        await simulationService.initialize(world);
        const initTime = performance.now();

        // Process turns
        let totalTurnTime = 0;
        let turnResults = [];
        const turnsToProcess = getTurnsForNpcCount(npcCount);

        for (let turn = 1; turn <= turnsToProcess; turn++) {
          const turnStart = performance.now();

          // Memory safeguard - check if we're using too much memory
          const currentMemory = getMemoryUsage();
          if (currentMemory.heapUsed > 500 * 1024 * 1024) { // 500MB limit
            console.warn(`High memory usage detected (${currentMemory.heapUsed}MB), skipping remaining turns`);
            break;
          }

          try {
            const result = await simulationService.processTurn();
            const turnEnd = performance.now();
            const turnDuration = turnEnd - turnStart;

            expect(result.success).toBe(true);
            totalTurnTime += turnDuration;
            turnResults.push({
              turn,
              duration: turnDuration,
              success: true
            });

            // Check for timeout
            if (performance.now() - testStartTime > timeout) {
              throw new Error(`Test timeout exceeded ${timeout}ms`);
            }

          } catch (turnError) {
            turnResults.push({
              turn,
              duration: performance.now() - turnStart,
              success: false,
              error: turnError.message
            });
            throw turnError;
          }
        }

        const testEndTime = performance.now();
        const finalMemory = getMemoryUsage();

        const results = {
          npcCount,
          success: true,
          totalTime: testEndTime - testStartTime,
          worldCreationTime: worldCreationTime - testStartTime,
          initTime: initTime - worldCreationTime,
          averageTurnTime: totalTurnTime / turnResults.length,
          totalTurnTime,
          turnsProcessed: turnResults.filter(r => r.success).length,
          memoryDelta: {
            rss: finalMemory.rss - initialMemory.rss,
            heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
            heapTotal: finalMemory.heapTotal - initialMemory.heapTotal
          },
          turnResults
        };

        // Log results for analysis
        console.log(`✅ ${npcCount} NPCs: ${(results.totalTime).toFixed(2)}ms, ${results.turnsProcessed}/${turnsToProcess} turns, +${results.memoryDelta.heapUsed}MB heap`);

        // Performance expectations (adjust based on system capabilities)
        expect(results.totalTime).toBeLessThan(timeout);
        expect(results.turnsProcessed).toBe(turnsToProcess);

      } catch (error) {
        const testEndTime = performance.now();

        console.log(`❌ ${npcCount} NPCs failed after ${(testEndTime - testStartTime).toFixed(2)}ms: ${error.message}`);

        // Re-throw to fail the test
        throw error;
      }
    }, getTimeoutForNpcCount(npcCount));
  });
});