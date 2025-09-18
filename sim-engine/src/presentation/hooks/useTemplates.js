import { useState, useEffect, useCallback } from 'react';
import TemplateManager from '../../template/TemplateManager';

// Initialize template manager instance
const templateManager = new TemplateManager();

// Template manager instance - starts empty, users create their own templates

export const useTemplates = () => {
  const [templates, setTemplates] = useState({
    characters: [],
    nodes: [],
    interactions: [],
    worlds: [],
    composite: [],
    archetypes: [] // Added for custom character archetypes
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load templates from template manager
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const characterTemplates = templateManager.getAllTemplates('characters') || [];
      const nodeTemplates = templateManager.getAllTemplates('nodes') || [];
      const interactionTemplates = templateManager.getAllTemplates('interactions') || [];
      const worldTemplates = templateManager.getAllTemplates('worlds') || [];
      const compositeTemplates = templateManager.getAllTemplates('composite') || [];
      const archetypeTemplates = templateManager.getAllTemplates('archetypes') || [];

      setTemplates({
        characters: characterTemplates,
        nodes: nodeTemplates,
        interactions: interactionTemplates,
        worlds: worldTemplates,
        composite: compositeTemplates,
        archetypes: archetypeTemplates
      });
    } catch (err) {
      setError(err.message);
      console.error('Failed to load templates:', err);
      // Set empty arrays on error to prevent undefined values
      setTemplates({
        characters: [],
        nodes: [],
        interactions: [],
        worlds: [],
        composite: [],
        archetypes: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Save template
  const saveTemplate = useCallback(async (type, templateData) => {
    setLoading(true);
    setError(null);

    try {
      const template = {
        ...templateData,
        id: templateData.id || `${type}_${Date.now()}`,
        metadata: {
          ...templateData.metadata,
          isTemplate: true,
          createdAt: templateData.metadata?.createdAt || new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };

      templateManager.addTemplate(type, template);
      await loadTemplates(); // Refresh templates
      return template;
    } catch (err) {
      setError(err.message);
      console.error('Failed to save template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTemplates]);

  // Load template
  const loadTemplate = useCallback((type, templateId, overrides = {}) => {
    try {
      const template = templateManager.getTemplate(type, templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Create instance from template with overrides
      const instance = {
        ...template,
        ...overrides,
        id: overrides.id || `${template.id}_instance_${Date.now()}`,
        metadata: {
          ...template.metadata,
          isTemplate: false,
          templateId: template.id,
          createdAt: new Date().toISOString()
        }
      };

      return instance;
    } catch (err) {
      setError(err.message);
      console.error('Failed to load template:', err);
      throw err;
    }
  }, []);

  // Search templates
  const searchTemplates = useCallback((type, query) => {
    try {
      return templateManager.searchTemplates(type, query);
    } catch (err) {
      setError(err.message);
      console.error('Failed to search templates:', err);
      return [];
    }
  }, []);

  // Delete template
  const deleteTemplate = useCallback(async (type, templateId) => {
    setLoading(true);
    setError(null);

    try {
      const success = templateManager.deleteTemplate(type, templateId);
      if (success) {
        await loadTemplates(); // Refresh templates
      }
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTemplates]);

  // Get templates by category
  const getTemplatesByCategory = useCallback((type, category) => {
    try {
      const allTemplates = templateManager.getAllTemplates(type);
      return allTemplates.filter(template => 
        template.metadata?.category === category
      );
    } catch (err) {
      setError(err.message);
      console.error('Failed to get templates by category:', err);
      return [];
    }
  }, []);

  // Get templates by tag
  const getTemplatesByTag = useCallback((type, tag) => {
    try {
      return templateManager.getTemplatesByTag(type, tag);
    } catch (err) {
      setError(err.message);
      console.error('Failed to get templates by tag:', err);
      return [];
    }
  }, []);

  // Validate template
  const validateTemplate = useCallback((type, template) => {
    try {
      const errors = [];
      const warnings = [];

      // Basic validation
      if (!template.name || template.name.trim().length === 0) {
        errors.push('Template name is required');
      }

      if (!template.description || template.description.trim().length === 0) {
        warnings.push('Template description is recommended');
      }

      // Type-specific validation
      switch (type) {
        case 'characters':
          if (!template.attributes) {
            errors.push('Character template must have attributes');
          } else {
            const requiredAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
            const missingAttributes = requiredAttributes.filter(attr => 
              template.attributes[attr] === undefined || template.attributes[attr] === null
            );
            if (missingAttributes.length > 0) {
              errors.push(`Missing required attributes: ${missingAttributes.join(', ')}`);
            }
          }
          
          if (!template.consciousness) {
            warnings.push('Character template should have consciousness settings');
          }
          break;

        case 'nodes':
          if (!template.environmentalProperties && !template.culturalContext) {
            warnings.push('Node template should have environmental or cultural properties');
          }
          break;

        case 'interactions':
          if (!template.requirements && !template.effects) {
            warnings.push('Interaction template should have requirements or effects');
          }
          break;

        case 'archetypes':
          // Archetypes are similar to characters but focused on defining character classes/types
          if (!template.primaryStats || template.primaryStats.length === 0) {
            errors.push('Archetype template must define primary stats');
          }
          if (!template.icon) {
            warnings.push('Archetype template should have an icon');
          }
          break;

        default:
          // No specific validation for unknown template types
          break;
      }

      // Update template with validation results
      const validatedTemplate = {
        ...template,
        metadata: {
          ...template.metadata,
          validationErrors: errors,
          validationWarnings: warnings,
          lastValidated: new Date().toISOString(),
          isValid: errors.length === 0
        }
      };

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        template: validatedTemplate
      };
    } catch (err) {
      setError(err.message);
      console.error('Failed to validate template:', err);
      return {
        isValid: false,
        errors: ['Validation failed: ' + err.message],
        warnings: [],
        template
      };
    }
  }, []);

  // Update template usage statistics
  const updateUsageStats = useCallback(async (type, templateId) => {
    try {
      const template = templateManager.getTemplate(type, templateId);
      if (!template) return;

      const updatedTemplate = {
        ...template,
        metadata: {
          ...template.metadata,
          usageCount: (template.metadata?.usageCount || 0) + 1,
          lastUsed: new Date().toISOString()
        }
      };

      templateManager.updateTemplate(type, templateId, updatedTemplate);
      await loadTemplates(); // Refresh templates
    } catch (err) {
      console.error('Failed to update usage stats:', err);
    }
  }, [loadTemplates]);

  // Initialize templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    error,
    loadTemplates,
    saveTemplate,
    loadTemplate,
    searchTemplates,
    deleteTemplate,
    getTemplatesByCategory,
    getTemplatesByTag,
    validateTemplate,
    updateUsageStats
  };
};

export default useTemplates;