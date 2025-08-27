import { renderHook, act } from '@testing-library/react';
import useTemplates from '../../presentation/hooks/useTemplates';

// Mock TemplateManager
jest.mock('../../template/TemplateManager', () => {
  return jest.fn().mockImplementation(() => ({
    getAllTemplates: jest.fn(() => [
      {
        id: 'test-char-1',
        name: 'Test Character',
        description: 'A test character',
        attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 15 },
        tags: ['warrior', 'human'],
        metadata: {
          category: 'combat',
          difficulty: 'beginner',
          createdAt: '2024-01-01T00:00:00.000Z',
          usageCount: 5,
          lastUsed: '2024-01-15T00:00:00.000Z'
        }
      }
    ]),
    addTemplate: jest.fn((type, template) => template),
    getTemplate: jest.fn((type, id) => ({
      id,
      name: 'Test Template',
      description: 'Test description',
      metadata: { usageCount: 0 }
    })),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn(() => true),
    searchTemplates: jest.fn(() => []),
    getTemplatesByTag: jest.fn(() => [])
  }));
});

describe('Template System Enhancements Integration', () => {
  describe('useTemplates hook enhancements', () => {
    it('should validate templates correctly', () => {
      const { result } = renderHook(() => useTemplates());

      act(() => {
        const validation = result.current.validateTemplate('characters', {
          name: 'Test Character',
          description: 'A test character',
          attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 15 }
        });

        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });
    });

    it('should detect validation errors for missing attributes', () => {
      const { result } = renderHook(() => useTemplates());

      act(() => {
        const validation = result.current.validateTemplate('characters', {
          name: 'Invalid Character',
          description: 'Missing attributes'
          // No attributes provided
        });

        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('Character template must have attributes');
      });
    });

    it('should detect validation errors for missing required attributes', () => {
      const { result } = renderHook(() => useTemplates());

      act(() => {
        const validation = result.current.validateTemplate('characters', {
          name: 'Incomplete Character',
          description: 'Missing some attributes',
          attributes: { strength: 10 } // Missing other required attributes
        });

        expect(validation.isValid).toBe(false);
        expect(validation.errors.some(error => error.includes('Missing required attributes'))).toBe(true);
      });
    });

    it('should provide warnings for missing optional fields', () => {
      const { result } = renderHook(() => useTemplates());

      act(() => {
        const validation = result.current.validateTemplate('characters', {
          name: 'Character Without Description',
          // No description provided
          attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 15 }
        });

        expect(validation.isValid).toBe(true); // Still valid, just warnings
        expect(validation.warnings).toContain('Template description is recommended');
      });
    });

    it('should validate node templates', () => {
      const { result } = renderHook(() => useTemplates());

      act(() => {
        const validation = result.current.validateTemplate('nodes', {
          name: 'Test Node',
          description: 'A test node'
          // No environmental or cultural properties
        });

        expect(validation.isValid).toBe(true); // Valid but with warnings
        expect(validation.warnings).toContain('Node template should have environmental or cultural properties');
      });
    });

    it('should validate interaction templates', () => {
      const { result } = renderHook(() => useTemplates());

      act(() => {
        const validation = result.current.validateTemplate('interactions', {
          name: 'Test Interaction',
          description: 'A test interaction'
          // No requirements or effects
        });

        expect(validation.isValid).toBe(true); // Valid but with warnings
        expect(validation.warnings).toContain('Interaction template should have requirements or effects');
      });
    });

    it('should validate world templates', () => {
      const { result } = renderHook(() => useTemplates());

      act(() => {
        const validation = result.current.validateTemplate('worlds', {
          name: 'Test World',
          description: 'A test world',
          nodes: [],
          characters: []
        });

        expect(validation.isValid).toBe(true); // Valid but with warnings
        expect(validation.warnings).toContain('World template should contain nodes');
        expect(validation.warnings).toContain('World template should contain characters');
      });
    });

    it('should handle validation errors gracefully', () => {
      const { result } = renderHook(() => useTemplates());

      act(() => {
        const validation = result.current.validateTemplate('characters', {
          // Missing name - should cause error
          description: 'Character without name',
          attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 15 }
        });

        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('Template name is required');
      });
    });

    it('should update usage statistics', async () => {
      const { result } = renderHook(() => useTemplates());

      await act(async () => {
        await result.current.updateUsageStats('characters', 'test-char-1');
        // This would normally update the template's usage count
        // In a real scenario, we'd verify the template manager was called
      });

      // Verify the function completes without error
      expect(result.current.error).toBeNull();
    });

    it('should load templates with enhanced metadata', async () => {
      const { result } = renderHook(() => useTemplates());

      await act(async () => {
        await result.current.loadTemplates();
      });

      expect(result.current.templates.characters).toHaveLength(1);
      const template = result.current.templates.characters[0];
      
      // Verify enhanced metadata fields are present
      expect(template.metadata.usageCount).toBeDefined();
      expect(template.metadata.lastUsed).toBeDefined();
      expect(template.metadata.createdAt).toBeDefined();
      expect(template.metadata.category).toBeDefined();
      expect(template.metadata.difficulty).toBeDefined();
    });
  });

  describe('Template validation integration', () => {
    it('should validate and save template with enhanced metadata', async () => {
      const { result } = renderHook(() => useTemplates());

      const templateData = {
        name: 'Enhanced Character',
        description: 'A character with enhanced metadata',
        attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 15 },
        tags: ['enhanced', 'test'],
        metadata: {
          category: 'test',
          difficulty: 'intermediate',
          author: 'Test Author',
          version: '1.0'
        }
      };

      await act(async () => {
        const savedTemplate = await result.current.saveTemplate('characters', templateData);
        expect(savedTemplate.metadata.isTemplate).toBe(true);
        expect(savedTemplate.metadata.createdAt).toBeDefined();
        expect(savedTemplate.metadata.lastModified).toBeDefined();
      });
    });

    it('should handle template loading with validation', () => {
      const { result } = renderHook(() => useTemplates());

      act(() => {
        const instance = result.current.loadTemplate('characters', 'test-char-1', { name: 'Custom Name' });
        
        expect(instance.name).toBe('Custom Name');
        expect(instance.metadata.isTemplate).toBe(false);
        expect(instance.metadata.templateId).toBe('test-char-1');
        expect(instance.metadata.createdAt).toBeDefined();
      });
    });
  });

  describe('Error handling', () => {
    it('should handle template validation errors gracefully', () => {
      const { result } = renderHook(() => useTemplates());

      act(() => {
        // Test with invalid template type
        const validation = result.current.validateTemplate('invalid-type', {});
        
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      });
    });

    it('should handle missing template gracefully', () => {
      const { result } = renderHook(() => useTemplates());

      expect(() => {
        result.current.loadTemplate('characters', 'non-existent-template');
      }).toThrow('Template not found: non-existent-template');
    });
  });
});