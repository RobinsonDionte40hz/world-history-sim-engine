/**
 * DemoWorld Entity Tests
 * Tests the DemoWorld wrapper functionality
 */

import DemoWorld from '../../domain/entities/DemoWorld.js';

describe('DemoWorld Entity', () => {
  test('should create DemoWorld with default values', () => {
    const demoWorld = new DemoWorld();
    expect(demoWorld.id).toBeDefined();
    expect(demoWorld.type).toBe('demo-world');
    expect(demoWorld.ownership).toBe('demo');
    expect(demoWorld.category).toBe('tutorial');
    expect(demoWorld.difficulty).toBe('beginner');
  });

  test('should create tutorial demo world', () => {
    const tutorial = DemoWorld.createTutorial();
    expect(tutorial.name).toBe('World Building Tutorial');
    expect(tutorial.category).toBe('tutorial');
    expect(tutorial.difficulty).toBe('beginner');
    expect(tutorial.learningObjectives).toHaveLength(4);
    expect(tutorial.demoFeatures).toContain('guided-tour');
  });

  test('should create showcase demo world', () => {
    const showcase = DemoWorld.createShowcase();
    expect(showcase.name).toBe('Advanced World Showcase');
    expect(showcase.category).toBe('showcase');
    expect(showcase.difficulty).toBe('intermediate');
    expect(showcase.demoFeatures).toContain('interactive-tour');
  });

  test('should validate demo world correctly', () => {
    const validDemo = new DemoWorld({
      name: 'Valid Demo',
      demoId: 'demo-1',
      category: 'tutorial',
      difficulty: 'beginner',
      estimatedDuration: 15
    });
    const validResult = validDemo.validate();
    expect(validResult.isValid).toBe(true);

    const invalidDemo = new DemoWorld({
      name: '',
      category: 'invalid',
      difficulty: 'expert',
      estimatedDuration: -5
    });
    // Manually set name to empty to test validation
    invalidDemo.name = '';
    const invalidResult = invalidDemo.validate();
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContain('Name is required');
    expect(invalidResult.errors).toContain('Category must be tutorial, showcase, or challenge');
  });

  test('should enforce demo ownership restrictions', () => {
    const demoWorld = new DemoWorld();
    expect(demoWorld.canModify()).toBe(false);
    expect(demoWorld.canDelete()).toBe(false);
    expect(demoWorld.canCopy()).toBe(true);
  });

  test('should allow specific modifications when configured', () => {
    const demoWorld = new DemoWorld({
      allowedModifications: ['read', 'modify', 'copy']
    });
    expect(demoWorld.canModify()).toBe(true);
    expect(demoWorld.canModify('modify')).toBe(true);
  });

  test('should track learning progress', () => {
    const demoWorld = new DemoWorld({
      learningObjectives: ['obj1', 'obj2', 'obj3']
    });

    expect(demoWorld.updateProgress(50)).toBe(true);
    expect(demoWorld.progress).toBe(50);
    expect(demoWorld.isCompleted).toBe(false);

    expect(demoWorld.updateProgress(100, 'step1')).toBe(true);
    expect(demoWorld.progress).toBe(100);
    expect(demoWorld.isCompleted).toBe(true);
    expect(demoWorld.stepsCompleted).toContain('step1');
  });

  test('should complete demo correctly', () => {
    const demoWorld = new DemoWorld();
    expect(demoWorld.completeDemo()).toBe(true);
    expect(demoWorld.isCompleted).toBe(true);
    expect(demoWorld.progress).toBe(100);

    // Should not complete again
    expect(demoWorld.completeDemo()).toBe(false);
  });

  test('should create copy with user ownership', () => {
    const demoWorld = new DemoWorld({
      name: 'Demo World',
      worldData: { test: 'data' }
    });
    const copy = demoWorld.copy();

    expect(copy.ownership).toBe('user');
    expect(copy.name).toBe('Demo World (Copy)');
    expect(copy.type).toBe('world');
    expect(copy.data).toEqual({
      test: 'data',
      originalDemoId: demoWorld.demoId
    });
    expect(copy.tags).toContain('copied-from-demo');
  });

  test('should get learning progress', () => {
    const demoWorld = new DemoWorld({
      learningObjectives: ['learn A', 'learn B'],
      completionCriteria: ['step1', 'step2', 'step3'],
      progress: 75
    });

    const progress = demoWorld.getLearningProgress();
    expect(progress.progress).toBe(75);
    expect(progress.isCompleted).toBe(false);
    expect(progress.learningObjectives).toHaveLength(2);
    expect(progress.totalSteps).toBe(3);
  });

  test('should serialize and deserialize correctly', () => {
    const original = new DemoWorld({
      name: 'Test Demo',
      category: 'tutorial',
      difficulty: 'beginner',
      learningObjectives: ['learn X', 'learn Y'],
      progress: 25,
      worldData: { nodes: [], characters: [] }
    });

    const json = original.toJSON();
    const deserialized = DemoWorld.fromJSON(json);

    expect(deserialized.id).toBe(original.id);
    expect(deserialized.name).toBe(original.name);
    expect(deserialized.category).toBe(original.category);
    expect(deserialized.difficulty).toBe(original.difficulty);
    expect(deserialized.learningObjectives).toEqual(original.learningObjectives);
    expect(deserialized.progress).toBe(original.progress);
    expect(deserialized.worldData).toEqual(original.worldData);
  });

  test('should get comprehensive summary', () => {
    const demoWorld = new DemoWorld({
      name: 'Summary Demo',
      category: 'showcase',
      difficulty: 'advanced',
      progress: 90,
      learningObjectives: ['obj1', 'obj2']
    });

    const summary = demoWorld.getSummary();
    expect(summary.name).toBe('Summary Demo');
    expect(summary.ownership).toBe('demo');
    expect(summary.category).toBe('showcase');
    expect(summary.difficulty).toBe('advanced');
    expect(summary.progress).toBe(90);
    expect(summary.canModify).toBe(false);
    expect(summary.canDelete).toBe(false);
  });
});