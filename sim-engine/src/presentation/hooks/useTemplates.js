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
    composite: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load templates from template manager
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const characterTemplates = templateManager.getAllTemplates('characters');
      const nodeTemplates = templateManager.getAllTemplates('nodes');
      const interactionTemplates = templateManager.getAllTemplates('interactions');
      const worldTemplates = templateManager.getAllTemplates('worlds');
      const compositeTemplates = templateManager.getAllTemplates('composite');

      setTemplates({
        characters: characterTemplates,
        nodes: nodeTemplates,
        interactions: interactionTemplates,
        worlds: worldTemplates,
        composite: compositeTemplates
      });
    } catch (err) {
      setError(err.message);
      console.error('Failed to load templates:', err);
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
    getTemplatesByTag
  };
};

export default useTemplates;