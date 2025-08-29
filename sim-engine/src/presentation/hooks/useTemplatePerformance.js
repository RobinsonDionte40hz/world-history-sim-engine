import { useRef, useCallback, useMemo, useEffect } from 'react';

/**
 * useTemplatePerformance - Performance optimization hooks for text templating
 * 
 * Features:
 * - Suggestion caching to avoid recalculation
 * - Debounced preview updates for real-time editing
 * - Memoization for expensive context operations
 * - Cleanup logic for unused template instances
 * - Memory management and performance monitoring
 */
const useTemplatePerformance = (options = {}) => {
  const {
    suggestionCacheSize = 100,
    contextCacheSize = 50,
    debounceMs = 300,
    cleanupInterval = 60000, // 1 minute
    maxMemoryUsage = 10 * 1024 * 1024, // 10MB
    enableMetrics = false
  } = options;

  // Cache references
  const suggestionCacheRef = useRef(new Map());
  const contextCacheRef = useRef(new Map());
  const debounceTimeoutsRef = useRef(new Map());
  const performanceMetricsRef = useRef({
    cacheHits: 0,
    cacheMisses: 0,
    debounceSkips: 0,
    memoryCleanups: 0,
    lastCleanup: Date.now()
  });

  // Cleanup interval reference
  const cleanupIntervalRef = useRef(null);

  /**
   * Create a cache key from an object or string
   */
  const createCacheKey = useCallback((input) => {
    if (typeof input === 'string') return input;
    if (typeof input === 'object' && input !== null) {
      try {
        return JSON.stringify(input, Object.keys(input).sort());
      } catch (error) {
        return String(input);
      }
    }
    return String(input);
  }, []);

  /**
   * Estimate memory usage of cache entries
   */
  const estimateMemoryUsage = useCallback((cache) => {
    let totalSize = 0;
    for (const [key, value] of cache.entries()) {
      totalSize += key.length * 2; // Approximate string size
      totalSize += JSON.stringify(value).length * 2; // Approximate object size
    }
    return totalSize;
  }, []);

  /**
   * Clean up old cache entries based on LRU and memory usage
   */
  const cleanupCache = useCallback((cache, maxSize, maxMemory) => {
    const currentMemory = estimateMemoryUsage(cache);
    
    if (cache.size <= maxSize && currentMemory <= maxMemory) {
      return false; // No cleanup needed
    }

    // Convert to array with timestamps for LRU cleanup
    const entries = Array.from(cache.entries());
    
    // Sort by access time (if available) or remove oldest entries
    const entriesToRemove = Math.max(
      cache.size - maxSize,
      Math.floor(cache.size * 0.3) // Remove 30% if over memory limit
    );

    // Remove oldest entries
    for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
      cache.delete(entries[i][0]);
    }

    if (enableMetrics) {
      performanceMetricsRef.current.memoryCleanups++;
    }

    return true; // Cleanup performed
  }, [estimateMemoryUsage, enableMetrics]);

  /**
   * Cached suggestion generator with LRU eviction
   */
  const getCachedSuggestions = useCallback((contextKey, generator) => {
    const cache = suggestionCacheRef.current;
    const key = createCacheKey(contextKey);

    // Check cache first
    if (cache.has(key)) {
      const cached = cache.get(key);
      // Move to end (LRU)
      cache.delete(key);
      cache.set(key, { ...cached, lastAccessed: Date.now() });
      
      if (enableMetrics) {
        performanceMetricsRef.current.cacheHits++;
      }
      
      return cached.suggestions;
    }

    // Generate new suggestions
    const suggestions = generator();
    
    // Clean up cache if needed
    cleanupCache(cache, suggestionCacheSize, maxMemoryUsage / 2);
    
    // Store in cache
    cache.set(key, {
      suggestions,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    });

    if (enableMetrics) {
      performanceMetricsRef.current.cacheMisses++;
    }

    return suggestions;
  }, [createCacheKey, cleanupCache, suggestionCacheSize, maxMemoryUsage, enableMetrics]);

  /**
   * Cached context processor with memoization
   */
  const getCachedContext = useCallback((contextInput, processor) => {
    const cache = contextCacheRef.current;
    const key = createCacheKey(contextInput);

    // Check cache first
    if (cache.has(key)) {
      const cached = cache.get(key);
      // Update access time
      cache.delete(key);
      cache.set(key, { ...cached, lastAccessed: Date.now() });
      
      if (enableMetrics) {
        performanceMetricsRef.current.cacheHits++;
      }
      
      return cached.context;
    }

    // Process new context
    const processedContext = processor(contextInput);
    
    // Clean up cache if needed
    cleanupCache(cache, contextCacheSize, maxMemoryUsage / 2);
    
    // Store in cache
    cache.set(key, {
      context: processedContext,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    });

    if (enableMetrics) {
      performanceMetricsRef.current.cacheMisses++;
    }

    return processedContext;
  }, [createCacheKey, cleanupCache, contextCacheSize, maxMemoryUsage, enableMetrics]);

  /**
   * Debounced function executor with cleanup
   */
  const createDebouncedFunction = useCallback((key, fn, delay = debounceMs) => {
    return (...args) => {
      const timeouts = debounceTimeoutsRef.current;
      
      // Clear existing timeout
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key));
        if (enableMetrics) {
          performanceMetricsRef.current.debounceSkips++;
        }
      }

      // Set new timeout
      const timeoutId = setTimeout(() => {
        fn(...args);
        timeouts.delete(key);
      }, delay);

      timeouts.set(key, timeoutId);
    };
  }, [debounceMs, enableMetrics]);

  /**
   * Memoized expensive operation with cache
   */
  const memoizeExpensiveOperation = useCallback((key, operation, dependencies = []) => {
    return useMemo(() => {
      const cacheKey = `${key}_${createCacheKey(dependencies)}`;
      return getCachedContext(cacheKey, () => operation(...dependencies));
    }, [key, operation, dependencies, getCachedContext, createCacheKey]);
  }, [getCachedContext, createCacheKey]);

  /**
   * Batch multiple operations for better performance
   */
  const batchOperations = useCallback((operations) => {
    const results = [];
    
    // Execute all operations in a single frame
    const executeBatch = () => {
      operations.forEach((operation, index) => {
        try {
          results[index] = operation();
        } catch (error) {
          results[index] = { error: error.message };
        }
      });
    };

    // Use requestAnimationFrame for better performance
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(executeBatch);
    } else {
      setTimeout(executeBatch, 0);
    }

    return results;
  }, []);

  /**
   * Clear specific cache or all caches
   */
  const clearCache = useCallback((cacheType = 'all') => {
    switch (cacheType) {
      case 'suggestions':
        suggestionCacheRef.current.clear();
        break;
      case 'context':
        contextCacheRef.current.clear();
        break;
      case 'debounce':
        debounceTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        debounceTimeoutsRef.current.clear();
        break;
      case 'all':
      default:
        suggestionCacheRef.current.clear();
        contextCacheRef.current.clear();
        debounceTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        debounceTimeoutsRef.current.clear();
        break;
    }
  }, []);

  /**
   * Get performance metrics
   */
  const getMetrics = useCallback(() => {
    const metrics = performanceMetricsRef.current;
    const suggestionCache = suggestionCacheRef.current;
    const contextCache = contextCacheRef.current;
    
    return {
      ...metrics,
      cacheStats: {
        suggestions: {
          size: suggestionCache.size,
          memoryUsage: estimateMemoryUsage(suggestionCache)
        },
        context: {
          size: contextCache.size,
          memoryUsage: estimateMemoryUsage(contextCache)
        }
      },
      hitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0,
      totalMemoryUsage: estimateMemoryUsage(suggestionCache) + estimateMemoryUsage(contextCache)
    };
  }, [estimateMemoryUsage]);

  /**
   * Optimize template instance for better performance
   */
  const optimizeTemplateInstance = useCallback((templateInstance) => {
    // Remove unused properties
    const optimized = { ...templateInstance };
    
    // Remove large objects that aren't needed for rendering
    if (optimized.fullContext && optimized.context) {
      delete optimized.fullContext;
    }
    
    if (optimized.debugInfo) {
      delete optimized.debugInfo;
    }

    // Compress repeated strings
    if (optimized.templateText && optimized.templateText.length > 1000) {
      // For very large templates, consider compression
      optimized.isCompressed = true;
    }

    return optimized;
  }, []);

  /**
   * Periodic cleanup function
   */
  const performPeriodicCleanup = useCallback(() => {
    const now = Date.now();
    const metrics = performanceMetricsRef.current;
    
    // Only cleanup if enough time has passed
    if (now - metrics.lastCleanup < cleanupInterval) {
      return;
    }

    // Clean up suggestion cache
    cleanupCache(suggestionCacheRef.current, suggestionCacheSize, maxMemoryUsage / 2);
    
    // Clean up context cache
    cleanupCache(contextCacheRef.current, contextCacheSize, maxMemoryUsage / 2);
    
    // Clear old debounce timeouts (shouldn't be many, but just in case)
    const timeouts = debounceTimeoutsRef.current;
    if (timeouts.size > 100) {
      timeouts.clear();
    }

    metrics.lastCleanup = now;
  }, [cleanupInterval, cleanupCache, suggestionCacheSize, contextCacheSize, maxMemoryUsage]);

  // Set up periodic cleanup
  useEffect(() => {
    if (cleanupInterval > 0) {
      cleanupIntervalRef.current = setInterval(performPeriodicCleanup, cleanupInterval);
    }

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [cleanupInterval, performPeriodicCleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCache('all');
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [clearCache]);

  return {
    // Caching functions
    getCachedSuggestions,
    getCachedContext,
    
    // Debouncing
    createDebouncedFunction,
    
    // Memoization
    memoizeExpensiveOperation,
    
    // Batching
    batchOperations,
    
    // Optimization
    optimizeTemplateInstance,
    
    // Cache management
    clearCache,
    performPeriodicCleanup,
    
    // Metrics
    getMetrics: enableMetrics ? getMetrics : () => ({}),
    
    // Utility
    createCacheKey,
    estimateMemoryUsage
  };
};

export default useTemplatePerformance;