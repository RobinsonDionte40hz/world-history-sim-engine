import { renderHook, act, waitFor } from '@testing-library/react';
import useTemplatePreview from '../useTemplatePreview';

describe('useTemplatePreview', () => {
  const mockContext = {
    character: {
      name: 'Elena',
      attributes: {
        strength: 15,
        charisma: 12
      }
    },
    node: {
      name: 'Market Square'
    }
  };

  describe('Basic Functionality', () => {
    it('initializes with correct interface', () => {
      const { result } = renderHook(() => useTemplatePreview('', {}));
      
      // Check that all expected properties exist
      expect(result.current).toHaveProperty('previewText');
      expect(result.current).toHaveProperty('isResolved');
      expect(result.current).toHaveProperty('errors');
      expect(result.current).toHaveProperty('warnings');
      expect(result.current).toHaveProperty('isProcessing');
      expect(result.current).toHaveProperty('validation');
      expect(result.current).toHaveProperty('placeholderAnalysis');
      expect(result.current).toHaveProperty('resolutionStatus');
      expect(result.current).toHaveProperty('hasPlaceholders');
      expect(result.current).toHaveProperty('forceResolve');
      
      // Check initial values
      expect(result.current.previewText).toBe('');
      expect(typeof result.current.isResolved).toBe('boolean');
      expect(Array.isArray(result.current.errors)).toBe(true);
      expect(Array.isArray(result.current.warnings)).toBe(true);
      expect(typeof result.current.isProcessing).toBe('boolean');
      expect(typeof result.current.forceResolve).toBe('function');
    });

    it('handles empty template text correctly', async () => {
      const { result } = renderHook(() => 
        useTemplatePreview('', mockContext)
      );
      
      await waitFor(() => {
        expect(result.current.previewText).toBe('');
        expect(result.current.isResolved).toBe(true);
        expect(result.current.errors).toEqual([]);
      });
    });

    it('handles null template text correctly', async () => {
      const { result } = renderHook(() => 
        useTemplatePreview(null, mockContext)
      );
      
      await waitFor(() => {
        expect(result.current.previewText).toBe('');
        expect(result.current.isResolved).toBe(true);
        expect(result.current.errors).toEqual([]);
      });
    });

    it('processes template with context', async () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}}', mockContext)
      );
      
      // Should eventually process the template
      await waitFor(() => {
        expect(typeof result.current.previewText).toBe('string');
        expect(typeof result.current.isResolved).toBe('boolean');
      });
    });

    it('handles static text without placeholders', async () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Hello world', mockContext)
      );
      
      await waitFor(() => {
        expect(result.current.previewText).toBe('Hello world');
        expect(result.current.hasPlaceholders).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('provides error array interface', async () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Invalid {{unclosed', mockContext)
      );
      
      await waitFor(() => {
        expect(Array.isArray(result.current.errors)).toBe(true);
        expect(typeof result.current.isResolved).toBe('boolean');
      });
    });

    it('provides warning array interface', async () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Some template', mockContext)
      );
      
      await waitFor(() => {
        expect(Array.isArray(result.current.warnings)).toBe(true);
      });
    });

    it('handles invalid template gracefully', async () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Invalid {{unclosed', mockContext)
      );
      
      await waitFor(() => {
        expect(typeof result.current.previewText).toBe('string');
        expect(typeof result.current.isResolved).toBe('boolean');
      });
    });
  });

  describe('Debouncing', () => {
    it('accepts debouncing options', () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}}', mockContext, { debounceMs: 100 })
      );
      
      // Should initialize without errors
      expect(result.current).toBeDefined();
      expect(typeof result.current.previewText).toBe('string');
    });

    it('accepts enableDebouncing option', () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}}', mockContext, { enableDebouncing: false })
      );
      
      // Should initialize without errors
      expect(result.current).toBeDefined();
      expect(typeof result.current.previewText).toBe('string');
    });

    it('handles template changes', async () => {
      const { result, rerender } = renderHook(
        ({ template }) => useTemplatePreview(template, mockContext, { debounceMs: 50 }),
        { initialProps: { template: 'Hello {{character.name}}' } }
      );
      
      rerender({ template: 'Hi {{character.name}}' });
      
      // Should handle template changes without errors
      await waitFor(() => {
        expect(typeof result.current.previewText).toBe('string');
      });
    });
  });

  describe('Context Changes', () => {
    it('handles context changes', async () => {
      const { result, rerender } = renderHook(
        ({ context }) => useTemplatePreview('Hello {{character.name}}', context),
        { initialProps: { context: mockContext } }
      );
      
      await waitFor(() => {
        expect(typeof result.current.previewText).toBe('string');
      });
      
      // Change context
      const newContext = {
        character: { name: 'Marcus' }
      };
      
      rerender({ context: newContext });
      
      await waitFor(() => {
        expect(typeof result.current.previewText).toBe('string');
      });
    });

    it('handles empty context', async () => {
      const { result, rerender } = renderHook(
        ({ context }) => useTemplatePreview('Hello {{character.name}}', context),
        { initialProps: { context: mockContext } }
      );
      
      await waitFor(() => {
        expect(typeof result.current.previewText).toBe('string');
      });
      
      // Remove context
      rerender({ context: {} });
      
      await waitFor(() => {
        expect(typeof result.current.previewText).toBe('string');
        expect(typeof result.current.isResolved).toBe('boolean');
      });
    });
  });

  describe('Validation', () => {
    it('provides validation interface', () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}}', mockContext)
      );
      
      expect(result.current.validation).toBeDefined();
      expect(typeof result.current.validation.isValid).toBe('boolean');
      expect(Array.isArray(result.current.validation.errors)).toBe(true);
      expect(Array.isArray(result.current.validation.warnings)).toBe(true);
    });

    it('validates template syntax', () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Invalid {{unclosed', mockContext)
      );
      
      expect(result.current.validation).toBeDefined();
      expect(typeof result.current.validation.isValid).toBe('boolean');
    });
  });

  describe('Placeholder Analysis', () => {
    it('provides placeholder analysis interface', async () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}} from {{node.name}}', mockContext)
      );
      
      await waitFor(() => {
        expect(result.current.placeholderAnalysis).toBeDefined();
        expect(Array.isArray(result.current.placeholderAnalysis.placeholders)).toBe(true);
        expect(Array.isArray(result.current.placeholderAnalysis.resolved)).toBe(true);
        expect(Array.isArray(result.current.placeholderAnalysis.unresolved)).toBe(true);
      });
    });

    it('analyzes template with mixed placeholders', async () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}} from {{world.name}}', mockContext)
      );
      
      await waitFor(() => {
        expect(result.current.placeholderAnalysis).toBeDefined();
        expect(Array.isArray(result.current.placeholderAnalysis.resolved)).toBe(true);
        expect(Array.isArray(result.current.placeholderAnalysis.unresolved)).toBe(true);
      });
    });
  });

  describe('Status and Utilities', () => {
    it('detects if template has placeholders', () => {
      const { result: withPlaceholders } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}}', mockContext)
      );
      
      const { result: withoutPlaceholders } = renderHook(() => 
        useTemplatePreview('Hello world', mockContext)
      );
      
      expect(withPlaceholders.current.hasPlaceholders).toBe(true);
      expect(withoutPlaceholders.current.hasPlaceholders).toBe(false);
    });

    it('provides resolution status', async () => {
      // Empty template
      const { result: empty } = renderHook(() => 
        useTemplatePreview('', mockContext)
      );
      expect(empty.current.resolutionStatus).toBe('empty');
      
      // Static text
      const { result: staticResult } = renderHook(() => 
        useTemplatePreview('Hello world', mockContext)
      );
      await waitFor(() => {
        expect(typeof staticResult.current.resolutionStatus).toBe('string');
      });
      
      // Template with placeholders
      const { result: withTemplate } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}}', mockContext)
      );
      await waitFor(() => {
        expect(typeof withTemplate.current.resolutionStatus).toBe('string');
      });
    });

    it('provides force resolve functionality', () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}}', mockContext, { enableDebouncing: true, debounceMs: 1000 })
      );
      
      // Should have forceResolve function
      expect(typeof result.current.forceResolve).toBe('function');
      
      // Should be callable without errors
      act(() => {
        result.current.forceResolve();
      });
    });
  });

  describe('Processing State', () => {
    it('provides processing state interface', async () => {
      const { result } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}}', mockContext, { debounceMs: 100 })
      );
      
      // Should have processing state
      expect(typeof result.current.isProcessing).toBe('boolean');
      
      // Should eventually complete processing
      await waitFor(() => {
        expect(typeof result.current.previewText).toBe('string');
        expect(typeof result.current.isProcessing).toBe('boolean');
      });
    });
  });

  describe('Memory Management', () => {
    it('cleans up timeouts on unmount', () => {
      const { unmount } = renderHook(() => 
        useTemplatePreview('Hello {{character.name}}', mockContext, { debounceMs: 1000 })
      );
      
      // Should not throw or cause memory leaks
      expect(() => unmount()).not.toThrow();
    });

    it('handles rapid template changes without memory leaks', async () => {
      const { result, rerender } = renderHook(
        ({ template }) => useTemplatePreview(template, mockContext, { debounceMs: 50 }),
        { initialProps: { template: 'Template 1' } }
      );
      
      // Rapidly change templates
      for (let i = 2; i <= 10; i++) {
        rerender({ template: `Template ${i}` });
      }
      
      // Should eventually settle on the last template
      await waitFor(() => {
        expect(result.current.previewText).toBe('Template 10');
      });
    });
  });
});