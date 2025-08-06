/**
 * Debug World Flow Tests
 * 
 * Tests for the debug utilities to ensure they work correctly
 * and don't break the application.
 */

import { 
  debugWorldFlow, 
  debugWorldById, 
  debugSaveLoadCycle,
  simpleDebugWorldFlow,
  clearAllWorldData,
  exportWorldData
} from '../shared/utils/debugWorldFlow';
import editorStateManager from '../application/services/EditorStateManager';
import worldPersistenceService from '../application/services/WorldPersistenceService';

// Mock the services
jest.mock('../application/services/EditorStateManager');
jest.mock('../application/services/WorldPersistenceService');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get keys() {
      return Object.keys(store);
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock console methods
const originalConsole = console;
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.group = jest.fn();
  console.groupEnd = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.group = originalConsole.group;
  console.groupEnd = originalConsole.groupEnd;
});

describe('Debug World Flow Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Setup default mocks
    editorStateManager.getState = jest.fn(() => ({
      currentWorld: {
        id: 'test-world-123',
        name: 'Test World',
        description: 'A test world'
      },
      hasUnsavedChanges: false,
      saveStatus: 'saved',
      currentEditor: 'world',
      editorData: {
        world: {
          id: 'test-world-123',
          name: 'Test World',
          description: 'A test world'
        },
        nodes: {},
        characters: {},
        interactions: {},
        encounters: {}
      }
    }));

    editorStateManager.worldBuilder = {
      currentStep: 'world',
      worldConfig: {
        isValid: true,
        isComplete: false
      }
    };

    editorStateManager.reset = jest.fn();
  });

  describe('debugWorldFlow', () => {
    test('should execute without errors', () => {
      expect(() => debugWorldFlow()).not.toThrow();
      expect(console.group).toHaveBeenCalledWith('🌍 World Data Flow Debug');
      expect(console.groupEnd).toHaveBeenCalled();
    });

    test('should handle missing current world', () => {
      editorStateManager.getState.mockReturnValue({
        currentWorld: null,
        hasUnsavedChanges: false,
        saveStatus: 'idle',
        currentEditor: null,
        editorData: {
          world: null,
          nodes: {},
          characters: {},
          interactions: {},
          encounters: {}
        }
      });

      expect(() => debugWorldFlow()).not.toThrow();
      expect(console.log).toHaveBeenCalledWith('ℹ️ No current world selected');
    });

    test('should handle localStorage data', () => {
      localStorageMock.setItem('worldHistorySimulator_worlds', JSON.stringify([
        { id: 'world1', name: 'World 1' }
      ]));
      localStorageMock.setItem('worldHistorySimulator_world_test-world-123', JSON.stringify({
        id: 'test-world-123',
        name: 'Test World',
        nodes: [],
        characters: []
      }));

      expect(() => debugWorldFlow()).not.toThrow();
    });
  });

  describe('simpleDebugWorldFlow', () => {
    test('should execute without errors', () => {
      expect(() => simpleDebugWorldFlow()).not.toThrow();
      expect(console.log).toHaveBeenCalledWith('Current Editor State:', expect.any(Object));
    });

    test('should log stored worlds', () => {
      localStorageMock.setItem('worldHistorySimulator_worlds', JSON.stringify([
        { id: 'world1', name: 'World 1' }
      ]));

      simpleDebugWorldFlow();

      expect(console.log).toHaveBeenCalledWith('Stored Worlds:', [
        { id: 'world1', name: 'World 1' }
      ]);
    });
  });

  describe('debugWorldById', () => {
    test('should debug existing world', () => {
      const worldData = {
        id: 'test-world-456',
        name: 'Test World 456',
        nodes: [],
        characters: []
      };

      localStorageMock.setItem('worldHistorySimulator_world_test-world-456', JSON.stringify(worldData));
      worldPersistenceService.validateWorldData = jest.fn(() => ({
        isValid: true,
        errors: [],
        warnings: []
      }));
      worldPersistenceService.ensureCompleteWorldStructure = jest.fn((data) => data);

      expect(() => debugWorldById('test-world-456')).not.toThrow();
      expect(console.group).toHaveBeenCalledWith('🌍 Debug World: test-world-456');
    });

    test('should handle non-existent world', () => {
      expect(() => debugWorldById('non-existent-world')).not.toThrow();
      expect(console.error).toHaveBeenCalledWith('❌ World not found in storage');
    });
  });

  describe('debugSaveLoadCycle', () => {
    test('should test save/load cycle', async () => {
      const mockWorld = {
        id: 'test-world-789',
        name: 'Test World 789'
      };

      worldPersistenceService.saveWorld = jest.fn().mockResolvedValue(mockWorld);
      worldPersistenceService.loadWorld = jest.fn().mockResolvedValue(mockWorld);

      await expect(debugSaveLoadCycle()).resolves.not.toThrow();
      expect(worldPersistenceService.saveWorld).toHaveBeenCalled();
      expect(worldPersistenceService.loadWorld).toHaveBeenCalled();
    });

    test('should handle no current world', async () => {
      editorStateManager.getState.mockReturnValue({
        currentWorld: null,
        editorData: { world: null }
      });

      await debugSaveLoadCycle();
      expect(console.error).toHaveBeenCalledWith('❌ No current world to test save/load cycle');
    });
  });

  describe('clearAllWorldData', () => {
    test('should clear all world-related localStorage keys', () => {
      // Setup some world data
      localStorageMock.setItem('worldHistorySimulator_worlds', '[]');
      localStorageMock.setItem('worldHistorySimulator_world_123', '{}');
      localStorageMock.setItem('other_key', 'should not be removed');

      // Mock Object.keys to return our test keys
      const originalKeys = Object.keys;
      Object.keys = jest.fn(() => [
        'worldHistorySimulator_worlds',
        'worldHistorySimulator_world_123',
        'other_key'
      ]);

      clearAllWorldData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('worldHistorySimulator_worlds');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('worldHistorySimulator_world_123');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_key');
      expect(editorStateManager.reset).toHaveBeenCalled();

      // Restore Object.keys
      Object.keys = originalKeys;
    });
  });

  describe('exportWorldData', () => {
    test('should export world data', () => {
      // Mock DOM elements for download
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      document.createElement = jest.fn(() => mockLink);
      
      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.Blob = jest.fn();

      // Setup test data
      localStorageMock.setItem('worldHistorySimulator_worlds', JSON.stringify([
        { id: 'world1', name: 'World 1' }
      ]));

      // Mock Object.keys
      const originalKeys = Object.keys;
      Object.keys = jest.fn(() => ['worldHistorySimulator_worlds']);

      expect(() => exportWorldData()).not.toThrow();
      expect(mockLink.click).toHaveBeenCalled();

      // Restore Object.keys
      Object.keys = originalKeys;
    });
  });

  describe('Error handling', () => {
    test('should handle errors gracefully in debugWorldFlow', () => {
      editorStateManager.getState.mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(() => debugWorldFlow()).not.toThrow();
      expect(console.error).toHaveBeenCalledWith('❌ Error during debug:', expect.any(Error));
    });

    test('should handle JSON parse errors', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      expect(() => simpleDebugWorldFlow()).not.toThrow();
    });
  });
});