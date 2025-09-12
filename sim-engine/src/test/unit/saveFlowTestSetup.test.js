/**
 * Save Flow Test Setup Validation
 * Tests that the save flow test setup works correctly
 */

import {
  createMockStore,
  createMockContent,
  createMockUserContent,
  createMockDemoContent,
  setupSaveFlowTest,
  cleanupSaveFlowTest,
  MockPersistenceAdapter
} from '../setup/saveFlowTestSetup';

describe('Save Flow Test Setup', () => {
  let testSetup;

  beforeEach(() => {
    testSetup = setupSaveFlowTest();
  });

  afterEach(() => {
    cleanupSaveFlowTest(testSetup);
  });

  test('should create mock store successfully', () => {
    const { store } = createMockStore();
    expect(store).toBeDefined();
    expect(store.getState()).toBeDefined();
  });

  test('should create mock content with default values', () => {
    const content = createMockContent();
    expect(content).toHaveProperty('id');
    expect(content).toHaveProperty('type', 'world');
    expect(content).toHaveProperty('data');
    expect(content).toHaveProperty('metadata');
  });

  test('should create user content with correct ownership', () => {
    const content = createMockUserContent();
    expect(content.ownership).toBe('user');
    expect(content.permissions).toContain('write');
  });

  test('should create demo content with correct ownership', () => {
    const content = createMockDemoContent();
    expect(content.ownership).toBe('demo');
    expect(content.permissions).toContain('read');
    expect(content.restrictions).toContain('no-modify');
  });

  test('should setup test environment correctly', () => {
    expect(testSetup.mockAdapter).toBeInstanceOf(MockPersistenceAdapter);
    expect(testSetup.store).toBeDefined();
    expect(testSetup.persistor).toBeDefined();
    expect(typeof testSetup.resetMocks).toBe('function');
    expect(typeof testSetup.waitForPersistence).toBe('function');
  });

  test('mock persistence adapter should work correctly', async () => {
    const { mockAdapter } = testSetup;
    const testData = { id: 'test-1', content: 'test content' };

    // Test save
    const saveResult = await mockAdapter.save(testData);
    expect(saveResult.success).toBe(true);
    expect(saveResult.id).toBe('test-1');

    // Test load
    const loadResult = await mockAdapter.load('test-1');
    expect(loadResult).toEqual(testData);

    // Test list
    const listResult = await mockAdapter.list();
    expect(listResult).toContain(testData);
  });
});