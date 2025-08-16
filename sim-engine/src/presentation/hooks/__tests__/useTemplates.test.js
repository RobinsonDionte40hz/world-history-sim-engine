import { renderHook, act } from '@testing-library/react';
import useTemplates from '../useTemplates';

// Mock the TemplateManager to avoid validation issues in tests
jest.mock('../../../template/TemplateManager', () => {
  return jest.fn().mockImplementation(() => ({
    templates: {
      characters: new Map(),
      nodes: new Map(),
      interactions: new Map(),
      worlds: new Map(),
      composite: new Map()
    },
    addTemplate: jest.fn(),
    getAllTemplates: jest.fn((type) => []),
    getTemplate: jest.fn(),
    searchTemplates: jest.fn(() => []),
    deleteTemplate: jest.fn(() => true),
    getTemplatesByTag: jest.fn(() => [])
  }));
});

describe('useTemplates Hook', () => {
  test('should initialize with empty templates', () => {
    const { result } = renderHook(() => useTemplates());
    
    expect(result.current.templates).toEqual({
      characters: [],
      nodes: [],
      interactions: [],
      worlds: [],
      composite: []
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('should provide template management functions', () => {
    const { result } = renderHook(() => useTemplates());
    
    expect(typeof result.current.loadTemplates).toBe('function');
    expect(typeof result.current.saveTemplate).toBe('function');
    expect(typeof result.current.loadTemplate).toBe('function');
    expect(typeof result.current.searchTemplates).toBe('function');
    expect(typeof result.current.deleteTemplate).toBe('function');
    expect(typeof result.current.getTemplatesByCategory).toBe('function');
    expect(typeof result.current.getTemplatesByTag).toBe('function');
  });
});