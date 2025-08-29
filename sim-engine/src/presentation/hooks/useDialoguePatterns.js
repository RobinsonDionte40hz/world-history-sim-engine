import { useState, useCallback, useMemo } from 'react';
import dialoguePatternLibrary from '../../application/services/DialoguePatternLibrary';

/**
 * useDialoguePatterns - Custom hook for managing dialogue patterns
 * 
 * Features:
 * - Access to dialogue pattern library
 * - Contextual pattern suggestions
 * - Pattern creation and management
 * - Search and filtering capabilities
 * - Pattern validation and testing
 */
const useDialoguePatterns = (context = {}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Get all patterns with current filters
  const patterns = useMemo(() => {
    const options = {
      contextFilter: showOnlyAvailable ? context : null,
      searchQuery: searchQuery.trim() || null
    };

    if (selectedCategory !== 'all') {
      options.category = selectedCategory;
    }

    return dialoguePatternLibrary.getAllPatterns(options);
  }, [context, searchQuery, selectedCategory, showOnlyAvailable]);

  // Get contextual suggestions
  const contextualSuggestions = useMemo(() => {
    return dialoguePatternLibrary.getContextualSuggestions(context, {
      maxSuggestions: 10,
      includeConditional: true
    });
  }, [context]);

  // Get patterns by category
  const patternsByCategory = useMemo(() => {
    const categories = dialoguePatternLibrary.getCategories();
    const result = {};
    
    categories.forEach(category => {
      result[category] = patterns.filter(p => p.category === category);
    });
    
    return result;
  }, [patterns]);

  // Get available categories
  const categories = useMemo(() => {
    return dialoguePatternLibrary.getCategories();
  }, []);

  // Get library statistics
  const stats = useMemo(() => {
    return dialoguePatternLibrary.getLibraryStats();
  }, []);

  // Create a custom pattern
  const createCustomPattern = useCallback((patternData) => {
    try {
      const patternId = dialoguePatternLibrary.createCustomPattern(patternData);
      return { success: true, patternId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Update an existing pattern
  const updatePattern = useCallback((patternId, updates) => {
    try {
      const success = dialoguePatternLibrary.updatePattern(patternId, updates);
      return { success };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Remove a pattern
  const removePattern = useCallback((patternId) => {
    const success = dialoguePatternLibrary.removePattern(patternId);
    return { success };
  }, []);

  // Get a specific pattern
  const getPattern = useCallback((patternId) => {
    return dialoguePatternLibrary.getPattern(patternId);
  }, []);

  // Validate a pattern
  const validatePattern = useCallback((pattern) => {
    return dialoguePatternLibrary.validatePattern(pattern);
  }, []);

  // Check if pattern is available in context
  const isPatternAvailable = useCallback((pattern) => {
    return dialoguePatternLibrary.isPatternAvailableInContext(pattern, context);
  }, [context]);

  // Calculate relevance score for a pattern
  const getRelevanceScore = useCallback((pattern) => {
    return dialoguePatternLibrary.calculateRelevanceScore(pattern, context);
  }, [context]);

  // Export patterns
  const exportPatterns = useCallback((options = {}) => {
    try {
      const jsonData = dialoguePatternLibrary.exportPatterns(options);
      return { success: true, data: jsonData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Import patterns
  const importPatterns = useCallback((jsonData, options = {}) => {
    try {
      const result = dialoguePatternLibrary.importPatterns(jsonData, options);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Reset to default patterns
  const resetToDefaults = useCallback(() => {
    dialoguePatternLibrary.resetToDefaults();
  }, []);

  // Search patterns
  const searchPatterns = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Filter by category
  const filterByCategory = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Toggle availability filter
  const toggleAvailabilityFilter = useCallback(() => {
    setShowOnlyAvailable(prev => !prev);
  }, []);

  // Get patterns for a specific category with context
  const getPatternsForCategory = useCallback((category) => {
    return dialoguePatternLibrary.getPatternsByCategory(category, context);
  }, [context]);

  // Get suggested patterns for current context
  const getSuggestedPatterns = useCallback((maxSuggestions = 5) => {
    return dialoguePatternLibrary.getContextualSuggestions(context, {
      maxSuggestions,
      includeConditional: true
    });
  }, [context]);

  return {
    // Pattern data
    patterns,
    contextualSuggestions,
    patternsByCategory,
    categories,
    stats,

    // Pattern management
    createCustomPattern,
    updatePattern,
    removePattern,
    getPattern,
    validatePattern,

    // Pattern analysis
    isPatternAvailable,
    getRelevanceScore,

    // Import/Export
    exportPatterns,
    importPatterns,
    resetToDefaults,

    // Filtering and search
    searchQuery,
    selectedCategory,
    showOnlyAvailable,
    searchPatterns,
    filterByCategory,
    toggleAvailabilityFilter,

    // Utility functions
    getPatternsForCategory,
    getSuggestedPatterns,

    // Context information
    hasContext: Object.keys(context || {}).length > 0,
    hasCharacterContext: !!(context && context.character),
    hasNodeContext: !!(context && context.node),
    hasWorldContext: !!(context && context.world)
  };
};

export default useDialoguePatterns;