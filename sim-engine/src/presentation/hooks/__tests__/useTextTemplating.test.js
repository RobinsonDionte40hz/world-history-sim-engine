import { renderHook, act } from '@testing-library/react';

// Mock the TextTemplateEngine constructor
jest.mock('../../../domain/services/TextTemplateEngine', () => {
  return jest.fn().mockImplementation(() => ({
    resolve: jest.fn(),
    validateTemplate: jest.fn(),
    extractPlaceholders: jest.fn()
  }));
});

// Mock the EditorContextService
jest.mock('../../../application/services/EditorContextService', () => ({
  generateContextualSuggestions: jest.fn(),
  validatePlaceholder: jest.fn(),
  getNestedValue: jest.fn(),
  getContextSummary: jest.fn()
}));

// Import the hook after mocking
import useTextTemplating from '../useTextTemplating';
import TextTemplateEngine from '../../../domain/services/TextTemplateEngine';
import EditorContextService from '../../../application/services/EditorContextService';

describe('useTextTemplating', () => {
  let mockTextTemplateEngineInstance;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mock instance that will be created by the constructor
    mockTextTemplateEngineInstance = {
      resolve: jest.fn(),
      validateTemplate: jest.fn(),
      extractPlaceholders: jest.fn()
    };
    
    // Make the constructor return our mock instance
    TextTemplateEngine.mockImplementation(() => mockTextTemplateEngineInstance);
    
    // Setup default mock implementations
    mockTextTemplateEngineInstance.resolve.mockReturnValue({
      resolved: 'resolved text',
      errors: [],
      warnings: []
    });
    
    mockTextTemplateEngineInstance.validateTemplate.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    });
    
    mockTextTemplateEngineInstance.extractPlaceholders.mockReturnValue(['character.name']);
    
    EditorContextService.generateContextualSuggestions.mockReturnValue([
      {
        placeholder: 'character.name',
        category: 'character',
        description: 'Character name',
        available: true
      }
    ]);
    
    EditorContextService.validatePlaceholder.mockReturnValue(true);
    EditorContextService.getNestedValue.mockReturnValue('Test Value');
    EditorContextService.getContextSummary.mockReturnValue({
      hasCharacter: true,
      hasNode: false,
      hasWorld: false,
      availablePlaceholders: 1
    });
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useTextTemplating());
      
      expect(result.current.templateText).toBe('');
      expect(result.current.context).toEqual({});
      expect(result.current.previewText).toBe('');
      expect(result.current.isResolved).toBe(false);
      expect(result.current.errors).toEqual([]);
      expect(result.current.warnings).toEqual([]);
      expect(result.current.isProcessing).toBe(false);
    });

    it('should initialize with provided values', () => {
      const initialText = 'Hello {{character.name}}';
      const initialContext = { character: { name: 'John' } };
      
      const { result } = renderHook(() => 
        useTextTemplating(initialText, initialContext)
      );
      
      expect(result.current.templateText).toBe(initialText);
      expect(result.current.context).toEqual(initialContext);
    });
  });

  describe('template text updates', () => {
    it('should update template text and trigger validation', async () => {
      const { result } = renderHook(() => useTextTemplating());
      
      act(() => {
        result.current.updateTemplateText('Hello {{character.name}}');
      });
      
      expect(result.current.templateText).toBe('Hello {{character.name}}');
      expect(mockTextTemplateEngineInstance.validateTemplate).toHaveBeenCalledWith('Hello {{character.name}}');
    });

    it('should handle validation errors', () => {
      mockTextTemplateEngineInstance.validateTemplate.mockReturnValue({
        isValid: false,
        errors: ['Invalid syntax'],
        warnings: []
      });
      
      const { result } = renderHook(() => useTextTemplating());
      
      act(() => {
        result.current.updateTemplateText('{{invalid');
      });
      
      expect(result.current.validation.isValid).toBe(false);
      expect(result.current.validation.errors).toContain('Invalid syntax');
    });
  });

  describe('context updates', () => {
    it('should update context and trigger re-resolution', () => {
      const { result } = renderHook(() => 
        useTextTemplating('Hello {{character.name}}', {})
      );
      
      const newContext = { character: { name: 'Jane' } };
      
      act(() => {
        result.current.updateContext(newContext);
      });
      
      expect(result.current.context).toEqual(newContext);
    });

    it('should merge additional context', () => {
      const initialContext = { character: { name: 'John' } };
      const { result } = renderHook(() => 
        useTextTemplating('', initialContext)
      );
      
      const additionalContext = { node: { name: 'Market' } };
      
      act(() => {
        result.current.mergeContext(additionalContext);
      });
      
      expect(result.current.context).toEqual({
        character: { name: 'John' },
        node: { name: 'Market' }
      });
    });
  });

  describe('placeholder insertion', () => {
    it('should insert regular placeholder correctly', () => {
      const { result } = renderHook(() => useTextTemplating('Hello '));
      
      act(() => {
        const insertResult = result.current.insertPlaceholder('character.name', 6, 6);
        expect(insertResult.newText).toBe('Hello {{character.name}}');
        expect(insertResult.insertedText).toBe('{{character.name}}');
      });
    });

    it('should insert conditional placeholder correctly', () => {
      const { result } = renderHook(() => useTextTemplating(''));
      
      act(() => {
        const insertResult = result.current.insertPlaceholder('#if character.strength > 15', 0, 0);
        expect(insertResult.newText).toBe('{{#if character.strength > 15}}text{{/if}}');
        expect(insertResult.insertedText).toBe('{{#if character.strength > 15}}text{{/if}}');
      });
    });

    it('should insert random selection placeholder correctly', () => {
      const { result } = renderHook(() => useTextTemplating(''));
      
      act(() => {
        const insertResult = result.current.insertPlaceholder('random:hello,hi,greetings', 0, 0);
        expect(insertResult.newText).toBe('{{random:hello,hi,greetings}}');
        expect(insertResult.insertedText).toBe('{{random:hello,hi,greetings}}');
      });
    });
  });

  describe('suggestions', () => {
    it('should generate contextual suggestions', () => {
      const context = { character: { name: 'John' } };
      const { result } = renderHook(() => useTextTemplating('', context));
      
      expect(result.current.suggestions).toHaveLength(1);
      expect(result.current.suggestions[0].placeholder).toBe('character.name');
      expect(EditorContextService.generateContextualSuggestions).toHaveBeenCalledWith(context);
    });

    it('should handle suggestion generation errors gracefully', () => {
      EditorContextService.generateContextualSuggestions.mockImplementation(() => {
        throw new Error('Suggestion error');
      });
      
      const { result } = renderHook(() => useTextTemplating('', { character: { name: 'John' } }));
      
      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe('placeholder analysis', () => {
    it('should analyze placeholders correctly', () => {
      const context = { character: { name: 'John' } };
      mockTextTemplateEngineInstance.extractPlaceholders.mockReturnValue(['character.name', 'character.age']);
      EditorContextService.validatePlaceholder
        .mockReturnValueOnce(true)  // character.name is available
        .mockReturnValueOnce(false); // character.age is not available
      EditorContextService.getNestedValue
        .mockReturnValueOnce('John')
        .mockReturnValueOnce(undefined);
      
      const { result } = renderHook(() => 
        useTextTemplating('Hello {{character.name}}, age {{character.age}}', context)
      );
      
      expect(result.current.placeholderAnalysis.resolved).toHaveLength(1);
      expect(result.current.placeholderAnalysis.unresolved).toHaveLength(1);
      expect(result.current.placeholderAnalysis.resolved[0].placeholder).toBe('character.name');
      expect(result.current.placeholderAnalysis.unresolved[0]).toBe('character.age');
    });
  });

  describe('status calculation', () => {
    it('should return "empty" for empty template', () => {
      const { result } = renderHook(() => useTextTemplating(''));
      expect(result.current.status).toBe('empty');
    });

    it('should return "static" for template without placeholders', () => {
      const { result } = renderHook(() => useTextTemplating('Hello World'));
      expect(result.current.status).toBe('static');
    });

    it('should return "invalid" for invalid template', () => {
      // Set up the mock before rendering
      mockTextTemplateEngineInstance.validateTemplate.mockReturnValue({
        isValid: false,
        errors: ['Invalid syntax'],
        warnings: []
      });
      
      const { result } = renderHook(() => useTextTemplating('{{invalid'));
      
      // The status should be invalid due to validation failure
      expect(result.current.status).toBe('invalid');
    });

    it('should return "resolved" for fully resolved template', () => {
      mockTextTemplateEngineInstance.extractPlaceholders.mockReturnValue(['character.name']);
      EditorContextService.validatePlaceholder.mockReturnValue(true);
      
      const { result } = renderHook(() => 
        useTextTemplating('Hello {{character.name}}', { character: { name: 'John' } })
      );
      
      expect(result.current.status).toBe('resolved');
    });
  });

  describe('utility functions', () => {
    it('should force resolve template', () => {
      const { result } = renderHook(() => 
        useTextTemplating('Hello {{character.name}}', { character: { name: 'John' } })
      );
      
      act(() => {
        result.current.forceResolve();
      });
      
      expect(mockTextTemplateEngineInstance.resolve).toHaveBeenCalled();
    });

    it('should clear cache', () => {
      const { result } = renderHook(() => useTextTemplating());
      
      act(() => {
        result.current.clearCache();
      });
      
      // Cache clearing should not throw errors
      expect(result.current.clearCache).toBeDefined();
    });

    it('should reset all state', () => {
      const { result } = renderHook(() => 
        useTextTemplating('Hello {{character.name}}', { character: { name: 'John' } })
      );
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.templateText).toBe('');
      expect(result.current.context).toEqual({});
      expect(result.current.previewText).toBe('');
      expect(result.current.isResolved).toBe(false);
      expect(result.current.errors).toEqual([]);
      expect(result.current.warnings).toEqual([]);
    });
  });

  describe('options handling', () => {
    it('should respect enableValidation option', () => {
      const { result } = renderHook(() => 
        useTextTemplating('', {}, { enableValidation: false })
      );
      
      act(() => {
        result.current.updateTemplateText('{{invalid');
      });
      
      expect(mockTextTemplateEngineInstance.validateTemplate).not.toHaveBeenCalled();
    });

    it('should respect enablePreview option', () => {
      const { result } = renderHook(() => 
        useTextTemplating('Hello {{character.name}}', { character: { name: 'John' } }, { enablePreview: false })
      );
      
      expect(result.current.previewText).toBe('');
    });

    it('should respect enableSuggestions option', () => {
      const { result } = renderHook(() => 
        useTextTemplating('', { character: { name: 'John' } }, { enableSuggestions: false })
      );
      
      expect(result.current.suggestions).toEqual([]);
    });

    it('should respect autoResolve option', () => {
      const { result } = renderHook(() => 
        useTextTemplating('', {}, { autoResolve: false })
      );
      
      act(() => {
        result.current.updateTemplateText('Hello {{character.name}}');
      });
      
      // Should not auto-resolve when autoResolve is false
      expect(mockTextTemplateEngineInstance.resolve).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle template resolution errors', () => {
      mockTextTemplateEngineInstance.resolve.mockImplementation(() => {
        throw new Error('Resolution failed');
      });
      
      const { result } = renderHook(() => 
        useTextTemplating('Hello {{character.name}}', { character: { name: 'John' } })
      );
      
      act(() => {
        result.current.forceResolve();
      });
      
      expect(result.current.errors).toContain('Template processing failed: Resolution failed');
      expect(result.current.isResolved).toBe(false);
    });

    it('should handle placeholder extraction errors', () => {
      mockTextTemplateEngineInstance.extractPlaceholders.mockImplementation(() => {
        throw new Error('Extraction failed');
      });
      
      const { result } = renderHook(() => useTextTemplating('Hello {{character.name}}'));
      
      expect(result.current.placeholders).toEqual([]);
    });
  });
});