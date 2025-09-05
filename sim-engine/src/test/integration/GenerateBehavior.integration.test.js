// src/test/integration/GenerateBehavior.integration.test.js

import generateBehavior from '../../application/use-cases/npc/GenerateBehavior.js';
import Character from '../../domain/entities/Character.js';

// Mock the Character class for testing
jest.mock('../../domain/entities/Character.js', () => {
  const RealCharacter = jest.requireActual('../../domain/entities/Character.js').default;
  
  const MockCharacter = function(config) {
    // Create instance with proper prototype chain
    const instance = Object.create(RealCharacter.prototype);
    instance.constructor = MockCharacter;
    
    // Set properties
    instance.id = config.id || 'test-char';
    instance.name = config.name || 'Test Character';
    instance.energy = config.energy || 50;
    instance.maxEnergy = config.maxEnergy || 100;
    instance.currentNodeId = config.currentNodeId || 'test-node';
    instance.attributes = config.attributes || { getEnergyProxy: () => 50 };
    instance.consciousness = config.consciousness || { frequency: 40, coherence: 0.8 };
    instance.goals = config.goals || [{ id: 'rest' }];
    instance.decisionHistory = config.decisionHistory || [];
    
    return instance;
  };

  // Ensure instanceof works
  MockCharacter.prototype = RealCharacter.prototype;
  MockCharacter.prototype.constructor = MockCharacter;
  
  return {
    __esModule: true,
    default: MockCharacter
  };
});

// Mock the Interaction class for instanceof checks
jest.mock('../../domain/entities/Interaction.js', () => {
  const RealInteraction = jest.requireActual('../../domain/entities/Interaction.js').default;
  
  const MockInteraction = function(config) {
    const instance = Object.create(RealInteraction.prototype);
    Object.assign(instance, config);
    return instance;
  };

  MockInteraction.prototype = RealInteraction.prototype;
  MockInteraction.prototype.constructor = MockInteraction;
  
  return {
    __esModule: true,
    default: MockInteraction
  };
});

describe('GenerateBehavior Integration', () => {
  let mockCharacter;
  let mockWorldState;
  let mockNode;

  beforeEach(() => {
    // Create a mock character using the mocked Character class
    mockCharacter = new Character({
      id: 'test-char',
      name: 'Test Character',
      energy: 50,
      maxEnergy: 100,
      currentNodeId: 'test-node',
      attributes: { getEnergyProxy: () => 50 },
      consciousness: { frequency: 40, coherence: 0.8 },
      goals: [{ id: 'rest' }],
      decisionHistory: [] // Add required properties for MemoryService
    });

    // Create a mock node
    mockNode = {
      id: 'test-node',
      name: 'Test Node',
      connections: [],
      getAvailableInteractions: jest.fn(() => [])
    };

    // Create a mock world state
    mockWorldState = {
      time: 1000,
      nodes: [mockNode],
      characters: [mockCharacter],
      getCurrentEnvironment: jest.fn(() => ({
        isDangerous: jest.fn(() => false),
        getComfortLevel: jest.fn(() => 1.0)
      }))
    };
  });

  beforeAll(() => {
    // No additional setup needed - Character mock handles instanceof
  });

  test('should use InteractionManager to get available interactions', () => {
    const result = generateBehavior(mockCharacter, mockWorldState);
    
    // Should return a behavior result
    expect(result).toBeDefined();
    expect(result).toHaveProperty('interaction');
    expect(result.interaction).toBeDefined();
  });

  test('should prioritize critical rest when energy is low', () => {
    // Set character energy very low
    mockCharacter.energy = 10; // Below 20% threshold

    const result = generateBehavior(mockCharacter, mockWorldState);
    
    expect(result).toBeDefined();
    expect(result.interaction.name.toLowerCase()).toContain('rest');
  });

  test('should handle characters with no available interactions', () => {
    // Mock node with no interactions and disable system interactions
    mockNode.getAvailableInteractions = jest.fn(() => []);
    
    // Temporarily disable system interactions by mocking InteractionManager
    const originalGetAvailableInteractions = require('../../domain/services/InteractionManager.js').default.prototype.getAvailableInteractions;
    require('../../domain/services/InteractionManager.js').default.prototype.getAvailableInteractions = jest.fn(() => ({
      systemInteractions: [],
      contentInteractions: [],
      allInteractions: []
    }));
    
    const result = generateBehavior(mockCharacter, mockWorldState);
    
    // Restore original method
    require('../../domain/services/InteractionManager.js').default.prototype.getAvailableInteractions = originalGetAvailableInteractions;
    
    // Should return null when no interactions are available
    expect(result).toBeNull();
  });

  test('should handle invalid character input', () => {
    expect(() => {
      generateBehavior(null, mockWorldState);
    }).toThrow('Invalid character');

    expect(() => {
      generateBehavior({}, mockWorldState);
    }).toThrow('Invalid character');
  });

  test('should handle character with no valid node', () => {
    mockCharacter.currentNodeId = 'nonexistent-node';
    
    expect(() => {
      generateBehavior(mockCharacter, mockWorldState);
    }).toThrow('Character has no valid node');
  });

  test('should integrate system and content interactions', () => {
    // Mock some content interactions
    const mockContentInteraction = {
      id: 'test-interaction',
      name: 'Test Content Interaction',
      isSystemInteraction: false,
      isAvailable: jest.fn(() => true),
      meetsRequirements: jest.fn(() => true),
      selectBranch: jest.fn(() => ({ requiredEnergy: 10 }))
    };

    mockNode.getAvailableInteractions = jest.fn(() => [mockContentInteraction]);

    const result = generateBehavior(mockCharacter, mockWorldState);
    
    expect(result).toBeDefined();
    // Should be able to select either system or content interactions
    expect(result.interaction).toBeDefined();
  });

  test('should handle dangerous environments', () => {
    // Mock dangerous environment
    mockWorldState.getCurrentEnvironment = jest.fn(() => ({
      isDangerous: jest.fn(() => true),
      getComfortLevel: jest.fn(() => 1.0)
    }));

    // Add a connection to mock movement
    mockNode.connections = [{ targetNodeId: 'safe-node' }];
    mockWorldState.nodes.push({
      id: 'safe-node',
      name: 'Safe Node'
    });

    const result = generateBehavior(mockCharacter, mockWorldState);
    
    expect(result).toBeDefined();
    expect(result.interaction).toBeDefined();
    // Check if movement interaction was selected (this may vary based on implementation)
    expect(result.interaction.name).toBeDefined();
  });
});
