/**
 * Save Flow Test Setup
 * Configures Jest environment for testing save flow functionality
 * Includes Redux store mocking and persistence adapter setup
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock persistence adapter for testing
export class MockPersistenceAdapter {
  constructor() {
    this.storage = new Map();
  }

  async save(data) {
    this.storage.set(data.id, data);
    return { success: true, id: data.id };
  }

  async load(id) {
    return this.storage.get(id) || null;
  }

  async delete(id) {
    this.storage.delete(id);
    return { success: true };
  }

  async list() {
    return Array.from(this.storage.values());
  }

  clear() {
    this.storage.clear();
  }
}

// Mock Redux persist configuration
export const mockPersistConfig = {
  key: 'test-root',
  storage: {
    getItem: (key) => Promise.resolve(localStorageMock.getItem(key)),
    setItem: (key, value) => Promise.resolve(localStorageMock.setItem(key, value)),
    removeItem: (key) => Promise.resolve(localStorageMock.removeItem(key)),
  },
  whitelist: ['saveFlow'],
};

// Mock Redux store factory
export function createMockStore(initialState = {}) {
  const mockReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SAVE_CONTENT':
        return {
          ...state,
          content: action.payload,
          lastSaved: new Date().toISOString(),
        };
      case 'LOAD_CONTENT':
        return {
          ...state,
          content: action.payload,
          lastLoaded: new Date().toISOString(),
        };
      case 'CLEAR_CONTENT':
        return {
          ...state,
          content: null,
          lastCleared: new Date().toISOString(),
        };
      default:
        return state;
    }
  };

  const persistedReducer = persistReducer(mockPersistConfig, mockReducer);

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });

  const persistor = persistStore(store);

  return { store, persistor };
}

// Test data factories
export function createMockContent(overrides = {}) {
  return {
    id: `content_${Date.now()}`,
    type: 'world',
    data: { name: 'Test World', version: '1.0.0' },
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createMockUserContent() {
  return createMockContent({
    ownership: 'user',
    permissions: ['read', 'write', 'delete'],
  });
}

export function createMockDemoContent() {
  return createMockContent({
    ownership: 'demo',
    permissions: ['read'],
    restrictions: ['no-modify', 'no-delete'],
  });
}

// Test utilities
export function waitForPersistence() {
  return new Promise((resolve) => setTimeout(resolve, 100));
}

export function resetAllMocks() {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
}

// Setup function for test suites
export function setupSaveFlowTest() {
  const mockAdapter = new MockPersistenceAdapter();
  const { store, persistor } = createMockStore();

  return {
    mockAdapter,
    store,
    persistor,
    resetMocks: resetAllMocks,
    waitForPersistence,
  };
}

// Cleanup function for test suites
export function cleanupSaveFlowTest({ persistor }) {
  if (persistor) {
    persistor.purge();
  }
  resetAllMocks();
}