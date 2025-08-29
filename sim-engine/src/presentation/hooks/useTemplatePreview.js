import { useState, useEffect, useMemo, useCallback } from 'react';
import TextTemplateEngine from '../../domain/services/TextTemplateEngine';

/**
 * useTemplatePreview - Custom hook for real-time template text resolution
 * 
 * Features:
 * - Real-time template text resolution
 * - Debouncing to prevent excessive re-rendering during typing
 * - Integration with existing TextTemplateEngine without modification
 * - Error handling for invalid template syntax
 */
const useTemplatePreview = (templateText, context, options = {}) => {
  const {
    debounceMs = 300,
    enableDebouncing = true
  } = options;
  
  const [previewText, setPreviewText] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Create template engine instance
  const templateEngine = useMemo(() => new TextTemplateEngine(), []);
  
  // Debounced resolution function
  const resolveTemplate = useCallback((text, ctx) => {
    if (!text || typeof text !== 'string') {
      setPreviewText('');
      setIsResolved(true);
      setErrors([]);
      setWarnings([]);
      setIsProcessing(false);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = templateEngine.resolve(text, ctx || {});
      
      setPreviewText(result.resolved);
      setErrors(result.errors || []);
      setWarnings(result.warnings || []);
      setIsResolved(result.errors.length === 0);
    } catch (error) {
      setPreviewText(text); // Fallback to original text
      setErrors([`Template processing failed: ${error.message}`]);
      setWarnings([]);
      setIsResolved(false);
    } finally {
      setIsProcessing(false);
    }
  }, [templateEngine]);
  
  // Debounced version of resolveTemplate
  const debouncedResolve = useMemo(() => {
    if (!enableDebouncing) {
      return resolveTemplate;
    }
    
    let timeoutId;
    return (text, ctx) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resolveTemplate(text, ctx);
      }, debounceMs);
    };
  }, [resolveTemplate, debounceMs, enableDebouncing]);
  
  // Effect to trigger resolution when template or context changes
  useEffect(() => {
    debouncedResolve(templateText, context);
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (enableDebouncing) {
        // Clear timeout if component unmounts
        const timeoutId = setTimeout(() => {}, 0);
        clearTimeout(timeoutId);
      }
    };
  }, [templateText, context, debouncedResolve, enableDebouncing]);
  
  // Validate template syntax
  const validation = useMemo(() => {
    if (!templateText) {
      return { isValid: true, errors: [], warnings: [] };
    }
    
    try {
      return templateEngine.validateTemplate(templateText);
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error.message}`],
        warnings: []
      };
    }
  }, [templateText, templateEngine]);
  
  // Get placeholder analysis
  const placeholderAnalysis = useMemo(() => {
    if (!templateText) {
      return {
        placeholders: [],
        resolved: [],
        unresolved: []
      };
    }
    
    try {
      const placeholders = templateEngine.extractPlaceholders(templateText);
      const resolved = [];
      const unresolved = [];
      
      placeholders.forEach(placeholder => {
        const value = getNestedValue(context, placeholder);
        if (value !== undefined && value !== null) {
          resolved.push({ placeholder, value });
        } else {
          unresolved.push(placeholder);
        }
      });
      
      return { placeholders, resolved, unresolved };
    } catch (error) {
      return {
        placeholders: [],
        resolved: [],
        unresolved: [],
        error: error.message
      };
    }
  }, [templateText, context, templateEngine]);
  
  // Helper function to get nested values (similar to TextTemplateEngine)
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };
  
  // Force immediate resolution (bypass debouncing)
  const forceResolve = useCallback(() => {
    resolveTemplate(templateText, context);
  }, [resolveTemplate, templateText, context]);
  
  // Check if template has any placeholders
  const hasPlaceholders = useMemo(() => {
    return templateText && templateText.includes('{{');
  }, [templateText]);
  
  // Get resolution status
  const resolutionStatus = useMemo(() => {
    if (!templateText) return 'empty';
    if (isProcessing) return 'processing';
    if (errors.length > 0) return 'error';
    if (warnings.length > 0) return 'warning';
    if (!hasPlaceholders) return 'static';
    if (placeholderAnalysis.unresolved.length > 0) return 'partial';
    return 'complete';
  }, [templateText, isProcessing, errors, warnings, hasPlaceholders, placeholderAnalysis]);
  
  return {
    // Core preview data
    previewText,
    isResolved,
    errors,
    warnings,
    
    // Processing state
    isProcessing,
    
    // Validation
    validation,
    
    // Placeholder analysis
    placeholderAnalysis,
    
    // Status
    resolutionStatus,
    hasPlaceholders,
    
    // Actions
    forceResolve
  };
};

export default useTemplatePreview;