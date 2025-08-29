import { useMemo, useCallback, useRef } from 'react';
import EditorContextService from '../../application/services/EditorContextService';

/**
 * useContextualSuggestions - Custom hook for managing placeholder suggestions
 * 
 * Features:
 * - Automatic context detection and suggestion generation
 * - Caching logic to avoid recalculating suggestions unnecessarily
 * - Integration with D&D attributes, consciousness, and personality systems
 * - Support for nested property suggestions (character.attributes.strength)
 * - Enhanced performance with memoization and caching
 * - Real-time context change detection
 */
const useContextualSuggestions = (context = {}) => {
  const cacheRef = useRef(new Map());
  // Create a cache key for the context to enable efficient caching
  const contextCacheKey = useMemo(() => {
    if (!context || typeof context !== 'object') {
      return 'empty';
    }

    // Create a stable cache key based on context structure and values
    const keyParts = [];
    
    if (context.character) {
      keyParts.push(`char:${context.character.id || 'unknown'}`);
      if (context.character.attributes) {
        keyParts.push(`attrs:${Object.keys(context.character.attributes).sort().join(',')}`);
      }
    }
    
    if (context.node) {
      keyParts.push(`node:${context.node.id || 'unknown'}`);
    }
    
    if (context.world) {
      keyParts.push(`world:${context.world.id || 'unknown'}`);
    }

    return keyParts.join('|') || 'empty';
  }, [context]);

  // Generate contextual suggestions with caching
  const suggestions = useMemo(() => {
    // Check cache first
    if (cacheRef.current.has(contextCacheKey)) {
      return cacheRef.current.get(contextCacheKey);
    }

    // Generate new suggestions using the EditorContextService
    const newSuggestions = EditorContextService.generateContextualSuggestions(context);
    
    // Cache the result (limit cache size to prevent memory leaks)
    if (cacheRef.current.size > 50) {
      // Clear oldest entries
      const entries = Array.from(cacheRef.current.entries());
      entries.slice(0, 25).forEach(([key]) => {
        cacheRef.current.delete(key);
      });
    }
    
    cacheRef.current.set(contextCacheKey, newSuggestions);
    return newSuggestions;
  }, [context, contextCacheKey]);
  
  // Function to insert placeholder at specific position with enhanced logic
  const insertPlaceholder = useCallback((placeholder, startPos, endPos, callback) => {
    if (typeof callback === 'function') {
      // Enhanced insertion logic that handles different placeholder types
      let insertText = placeholder;
      
      // Handle conditional placeholders
      if (placeholder.startsWith('#if')) {
        insertText = `{{${placeholder}}}text{{/if}}`;
      } else if (placeholder === '/if') {
        insertText = `{{${placeholder}}}`;
      } else if (placeholder.startsWith('random:')) {
        insertText = `{{${placeholder}}}`;
      } else {
        // Regular placeholder
        insertText = `{{${placeholder}}}`;
      }
      
      // Calculate new cursor position
      let newCursorPos = startPos + insertText.length;
      
      // For conditionals, position cursor in the middle
      if (placeholder.startsWith('#if')) {
        newCursorPos = startPos + insertText.indexOf('text') + 4; // Position after 'text'
      }
      
      callback(insertText, newCursorPos);
    }
  }, []);
  
  // Get suggestions by category with caching
  const getSuggestionsByCategory = useCallback((category) => {
    return suggestions.filter(s => s.category === category);
  }, [suggestions]);
  
  // Get available suggestions only
  const getAvailableSuggestions = useCallback(() => {
    return suggestions.filter(s => s.available);
  }, [suggestions]);
  
  // Search suggestions with enhanced matching
  const searchSuggestions = useCallback((query) => {
    if (!query || !query.trim()) {
      return suggestions;
    }
    
    const lowerQuery = query.toLowerCase();
    return suggestions.filter(s => {
      // Match placeholder name
      if (s.placeholder.toLowerCase().includes(lowerQuery)) return true;
      
      // Match description
      if (s.description.toLowerCase().includes(lowerQuery)) return true;
      
      // Match category
      if (s.category.toLowerCase().includes(lowerQuery)) return true;
      
      // Match example
      if (s.example && s.example.toLowerCase().includes(lowerQuery)) return true;
      
      return false;
    });
  }, [suggestions]);

  // Get suggestions for nested properties (e.g., character.attributes.*)
  const getNestedSuggestions = useCallback((basePath) => {
    return suggestions.filter(s => s.placeholder.startsWith(basePath));
  }, [suggestions]);

  // Get context summary for display
  const contextSummary = useMemo(() => {
    return EditorContextService.getContextSummary(context);
  }, [context]);

  // Validate if a placeholder is available in current context
  const validatePlaceholder = useCallback((placeholder) => {
    return EditorContextService.validatePlaceholder(placeholder, context);
  }, [context]);

  // Get suggestions grouped by availability
  const suggestionsByAvailability = useMemo(() => {
    const available = suggestions.filter(s => s.available);
    const unavailable = suggestions.filter(s => !s.available);
    return { available, unavailable };
  }, [suggestions]);

  // Get category statistics
  const categoryStats = useMemo(() => {
    const stats = {};
    suggestions.forEach(s => {
      if (!stats[s.category]) {
        stats[s.category] = { total: 0, available: 0 };
      }
      stats[s.category].total++;
      if (s.available) {
        stats[s.category].available++;
      }
    });
    return stats;
  }, [suggestions]);
  
  return {
    // Core suggestions
    suggestions,
    
    // Insertion functionality
    insertPlaceholder,
    
    // Filtering and searching
    getSuggestionsByCategory,
    getAvailableSuggestions,
    searchSuggestions,
    getNestedSuggestions,
    
    // Context information
    contextSummary,
    validatePlaceholder,
    
    // Grouped data
    suggestionsByAvailability,
    categoryStats,
    
    // Utility functions
    hasContext: Object.keys(context || {}).length > 0,
    hasCharacterContext: !!(context && context.character),
    hasNodeContext: !!(context && context.node),
    hasWorldContext: !!(context && context.world),
    
    // Cache management
    clearCache: () => cacheRef.current.clear()
  };
};

export default useContextualSuggestions;