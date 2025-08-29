import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import TextTemplateEngine from '../../domain/services/TextTemplateEngine';
import EditorContextService from '../../application/services/EditorContextService';

/**
 * useTextTemplating - Central hook for managing text templating state
 * 
 * Features:
 * - Central hook for managing text templating state
 * - Integration with existing TextTemplateEngine
 * - Template text validation and error handling
 * - Support for multiple template contexts
 * - Performance optimizations with caching and debouncing
 * - Comprehensive error handling and validation
 */
const useTextTemplating = (initialText = '', initialContext = {}, options = {}) => {
  const {
    debounceMs = 300,
    enableValidation = true,
    enablePreview = true,
    enableSuggestions = true,
    cacheSize = 50,
    autoResolve = true
  } = options;

  // Core state
  const [templateText, setTemplateText] = useState(initialText);
  const [context, setContext] = useState(initialContext);
  const [previewText, setPreviewText] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation state
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: []
  });

  // Caching
  const cacheRef = useRef(new Map());
  const templateEngineRef = useRef(new TextTemplateEngine());
  const debounceTimeoutRef = useRef(null);

  // Generate cache key for template and context combination
  const generateCacheKey = useCallback((text, ctx) => {
    const contextKey = JSON.stringify(ctx, Object.keys(ctx).sort());
    return `${text}|${contextKey}`;
  }, []);

  // Clear cache when it gets too large
  const manageCacheSize = useCallback(() => {
    if (cacheRef.current.size > cacheSize) {
      const entries = Array.from(cacheRef.current.entries());
      // Remove oldest half of entries
      entries.slice(0, Math.floor(entries.length / 2)).forEach(([key]) => {
        cacheRef.current.delete(key);
      });
    }
  }, [cacheSize]);

  // Validate template syntax
  const validateTemplate = useCallback((text) => {
    if (!enableValidation || !text) {
      return { isValid: true, errors: [], warnings: [] };
    }

    try {
      return templateEngineRef.current.validateTemplate(text);
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error.message}`],
        warnings: []
      };
    }
  }, [enableValidation]);

  // Resolve template with caching
  const resolveTemplate = useCallback((text, ctx) => {
    if (!text || !enablePreview) {
      setPreviewText('');
      setIsResolved(true);
      setErrors([]);
      setWarnings([]);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      // Check cache first
      const cacheKey = generateCacheKey(text, ctx);
      if (cacheRef.current.has(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey);
        setPreviewText(cached.resolved);
        setErrors(cached.errors);
        setWarnings(cached.warnings);
        setIsResolved(cached.errors.length === 0);
        setIsProcessing(false);
        return;
      }

      // Resolve template
      const result = templateEngineRef.current.resolve(text, ctx || {});
      
      // Cache result
      manageCacheSize();
      cacheRef.current.set(cacheKey, result);

      // Update state
      setPreviewText(result.resolved);
      setErrors(result.errors || []);
      setWarnings(result.warnings || []);
      setIsResolved(result.errors.length === 0);
    } catch (error) {
      const errorMsg = `Template processing failed: ${error.message}`;
      setPreviewText(text); // Fallback to original text
      setErrors([errorMsg]);
      setWarnings([]);
      setIsResolved(false);
    } finally {
      setIsProcessing(false);
    }
  }, [enablePreview, generateCacheKey, manageCacheSize]);

  // Debounced resolve function
  const debouncedResolve = useCallback((text, ctx) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      resolveTemplate(text, ctx);
    }, debounceMs);
  }, [resolveTemplate, debounceMs]);

  // Update template text
  const updateTemplateText = useCallback((newText) => {
    setTemplateText(newText);
    
    // Validate immediately
    if (enableValidation) {
      const validationResult = validateTemplate(newText);
      setValidation(validationResult);
    }

    // Resolve with debouncing if auto-resolve is enabled
    if (autoResolve) {
      debouncedResolve(newText, context);
    }
  }, [context, validateTemplate, debouncedResolve, enableValidation, autoResolve]);

  // Update context
  const updateContext = useCallback((newContext) => {
    setContext(newContext);
    
    // Re-resolve with new context if auto-resolve is enabled
    if (autoResolve && templateText) {
      debouncedResolve(templateText, newContext);
    }
  }, [templateText, debouncedResolve, autoResolve]);

  // Merge additional context
  const mergeContext = useCallback((additionalContext) => {
    const mergedContext = { ...context, ...additionalContext };
    updateContext(mergedContext);
  }, [context, updateContext]);

  // Force immediate resolution (bypass debouncing)
  const forceResolve = useCallback(() => {
    resolveTemplate(templateText, context);
  }, [resolveTemplate, templateText, context]);

  // Get contextual suggestions
  const suggestions = useMemo(() => {
    if (!enableSuggestions) return [];
    
    try {
      return EditorContextService.generateContextualSuggestions(context);
    } catch (error) {
      console.warn('Failed to generate suggestions:', error);
      return [];
    }
  }, [context, enableSuggestions]);

  // Extract placeholders from current template
  const placeholders = useMemo(() => {
    if (!templateText) return [];
    
    try {
      return templateEngineRef.current.extractPlaceholders(templateText);
    } catch (error) {
      console.warn('Failed to extract placeholders:', error);
      return [];
    }
  }, [templateText]);

  // Analyze placeholder resolution
  const placeholderAnalysis = useMemo(() => {
    if (!templateText) {
      return {
        placeholders: [],
        resolved: [],
        unresolved: []
      };
    }

    try {
      const resolved = [];
      const unresolved = [];

      placeholders.forEach(placeholder => {
        const isAvailable = EditorContextService.validatePlaceholder(placeholder, context);
        if (isAvailable) {
          const value = EditorContextService.getNestedValue(context, placeholder);
          resolved.push({ placeholder, value });
        } else {
          unresolved.push(placeholder);
        }
      });

      return {
        placeholders,
        resolved,
        unresolved
      };
    } catch (error) {
      return {
        placeholders: [],
        resolved: [],
        unresolved: [],
        error: error.message
      };
    }
  }, [placeholders, context]);

  // Insert placeholder at cursor position
  const insertPlaceholder = useCallback((placeholder, cursorStart = 0, cursorEnd = 0) => {
    let insertText = placeholder;
    
    // Handle different placeholder types
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

    // Insert into template text
    const beforeCursor = templateText.substring(0, cursorStart);
    const afterCursor = templateText.substring(cursorEnd);
    const newText = beforeCursor + insertText + afterCursor;
    
    updateTemplateText(newText);

    // Calculate new cursor position
    let newCursorPos = cursorStart + insertText.length;
    
    // For conditionals, position cursor in the middle
    if (placeholder.startsWith('#if')) {
      newCursorPos = cursorStart + insertText.indexOf('text') + 4;
    }

    return {
      newText,
      newCursorPos,
      insertedText: insertText
    };
  }, [templateText, updateTemplateText]);

  // Get template status
  // Check if template has placeholders
  const hasPlaceholders = useMemo(() => {
    return templateText && templateText.includes('{{');
  }, [templateText]);

  const status = useMemo(() => {
    if (!templateText) return 'empty';
    if (isProcessing) return 'processing';
    if (!validation.isValid) return 'invalid';
    if (errors.length > 0) return 'error';
    if (warnings.length > 0) return 'warning';
    if (!hasPlaceholders) return 'static';
    if (placeholderAnalysis.unresolved.length > 0) return 'partial';
    return 'resolved';
  }, [templateText, isProcessing, validation.isValid, errors, warnings, hasPlaceholders, placeholderAnalysis.unresolved]);

  // Get context summary
  const contextSummary = useMemo(() => {
    return EditorContextService.getContextSummary(context);
  }, [context]);

  // Clear all caches
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setTemplateText('');
    setContext({});
    setPreviewText('');
    setIsResolved(false);
    setErrors([]);
    setWarnings([]);
    setIsProcessing(false);
    setValidation({ isValid: true, errors: [], warnings: [] });
    clearCache();
  }, [clearCache]);

  // Initialize with provided text and context
  useEffect(() => {
    if (initialText !== templateText) {
      updateTemplateText(initialText);
    }
  }, [initialText]); // Only run when initialText changes

  // Run initial validation on mount
  useEffect(() => {
    if (templateText && enableValidation) {
      const validationResult = validateTemplate(templateText);
      setValidation(validationResult);
    }
  }, []); // Only run on mount

  useEffect(() => {
    if (JSON.stringify(initialContext) !== JSON.stringify(context)) {
      updateContext(initialContext);
    }
  }, [JSON.stringify(initialContext)]); // Only run when initialContext changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Core state
    templateText,
    context,
    previewText,
    isResolved,
    errors,
    warnings,
    isProcessing,
    validation,

    // Analysis
    suggestions,
    placeholders,
    placeholderAnalysis,
    contextSummary,
    status,
    hasPlaceholders,

    // Actions
    updateTemplateText,
    updateContext,
    mergeContext,
    insertPlaceholder,
    forceResolve,
    validateTemplate: () => validateTemplate(templateText),
    clearCache,
    reset,

    // Utility
    canResolve: hasPlaceholders && Object.keys(context).length > 0,
    isValid: validation.isValid && errors.length === 0,
    hasContext: Object.keys(context).length > 0,
    hasErrors: errors.length > 0 || !validation.isValid,
    hasWarnings: warnings.length > 0 || validation.warnings.length > 0
  };
};

export default useTextTemplating;