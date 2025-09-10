import { useRef, useCallback, useMemo, useEffect } from 'react';
import EditorContextService from '../../application/services/EditorContextService';

/**
 * useCachedSuggestions - Optimized suggestion caching hook
 * 
 * Features:
 * - Intelligent caching to avoid recalculation of suggestions
 * - LRU (Least Recently Used) cache eviction
 * - Context-aware cache keys for accurate cache hits
 * - Memory usage monitoring and cleanup
 * - Performance metrics and cache statistics
 */
const useCachedSuggestions = (context, options = {}) => {
  const {
    maxCacheSize = 100,
    maxMemoryUsage = 5 * 1024 * 1024, // 5MB
    ttl = 300000, // 5 minutes
    enableMetrics = false,
    preloadCommonSuggestions = true
  } = options;

  // Cache storage
  const cacheRef = useRef(new Map());
  const accessTimesRef = useRef(new Map());
  const metricsRef = useRef({
    hits: 0,
    misses: 0,
    evictions: 0,
    memoryCleanups: 0,
    totalRequests: 0
  });

  // Common suggestion patterns for preloading
  const commonContextsRef = useRef([
    { character: { attributes: { strength: 14, charisma: 12 } } },
    { node: { type: 'marketplace', name: 'Market Square' } },
    { world: { name: 'Fantasy World', theme: 'medieval' } },
    { character: { attributes: { intelligence: 16 } }, node: { type: 'library' } }
  ]);

  /**
   * Create a stable cache key from context
   */
  const createContextKey = useCallback((ctx) => {
    if (!ctx || typeof ctx !== 'object') {
      return 'empty';
    }

    // Create a deterministic key based on context structure
    const keyParts = [];
    
    // Character context
    if (ctx.character) {
      const char = ctx.character;
      keyParts.push(`char:${char.id || 'unknown'}`);
      
      if (char.attributes) {
        const attrs = Object.keys(char.attributes).sort().map(key => 
          `${key}:${char.attributes[key]}`
        ).join(',');
        keyParts.push(`attrs:[${attrs}]`);
      }
      
      if (char.personality) {
        const personality = Object.keys(char.personality).sort().map(key => 
          `${key}:${char.personality[key]}`
        ).join(',');
        keyParts.push(`personality:[${personality}]`);
      }
      
      if (char.consciousness) {
        keyParts.push(`consciousness:${char.consciousness.frequency || 0},${char.consciousness.coherence || 0}`);
      }
    }
    
    // Node context
    if (ctx.node) {
      const node = ctx.node;
      keyParts.push(`node:${node.id || 'unknown'}:${node.type || 'unknown'}`);
      
      if (node.environmentalProperties) {
        const envProps = Object.keys(node.environmentalProperties).sort().join(',');
        keyParts.push(`env:[${envProps}]`);
      }
    }
    
    // World context
    if (ctx.world) {
      const world = ctx.world;
      keyParts.push(`world:${world.id || 'unknown'}:${world.theme || 'unknown'}`);
    }
    
    // Additional context types
    if (ctx.encounter) {
      keyParts.push(`encounter:${ctx.encounter.type || 'unknown'}`);
    }
    
    if (ctx.interaction) {
      keyParts.push(`interaction:${ctx.interaction.type || 'unknown'}`);
    }

    return keyParts.join('|') || 'empty';
  }, []);

  /**
   * Estimate memory usage of cached data
   */
  const estimateMemoryUsage = useCallback(() => {
    let totalSize = 0;
    
    cacheRef.current.forEach((entry, key) => {
      // Estimate key size (2 bytes per character for UTF-16)
      totalSize += key.length * 2;
      
      // Estimate suggestions array size
      if (entry.suggestions && Array.isArray(entry.suggestions)) {
        entry.suggestions.forEach(suggestion => {
          totalSize += JSON.stringify(suggestion).length * 2;
        });
      }
      
      // Add metadata size
      totalSize += 100; // Approximate size of timestamps and metadata
    });
    
    return totalSize;
  }, []);

  /**
   * Clean up cache based on LRU and memory usage
   */
  const cleanupCache = useCallback(() => {
    const cache = cacheRef.current;
    const accessTimes = accessTimesRef.current;
    const currentMemory = estimateMemoryUsage();
    
    // Check if cleanup is needed
    if (cache.size <= maxCacheSize && currentMemory <= maxMemoryUsage) {
      return false;
    }

    // Get entries sorted by access time (LRU first)
    const entries = Array.from(cache.entries()).map(([key, value]) => ({
      key,
      value,
      lastAccessed: accessTimes.get(key) || 0
    })).sort((a, b) => a.lastAccessed - b.lastAccessed);

    // Calculate how many entries to remove
    const targetSize = Math.floor(maxCacheSize * 0.8); // Remove to 80% capacity
    const entriesToRemove = Math.max(cache.size - targetSize, 0);
    
    // Remove oldest entries
    for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
      const { key } = entries[i];
      cache.delete(key);
      accessTimes.delete(key);
      
      if (enableMetrics) {
        metricsRef.current.evictions++;
      }
    }

    // If still over memory limit, remove more entries
    if (estimateMemoryUsage() > maxMemoryUsage) {
      const additionalRemoval = Math.floor(entries.length * 0.2); // Remove 20% more
      for (let i = entriesToRemove; i < entriesToRemove + additionalRemoval && i < entries.length; i++) {
        const { key } = entries[i];
        cache.delete(key);
        accessTimes.delete(key);
      }
      
      if (enableMetrics) {
        metricsRef.current.memoryCleanups++;
      }
    }

    return true;
  }, [maxCacheSize, maxMemoryUsage, estimateMemoryUsage, enableMetrics]);

  /**
   * Remove expired entries based on TTL
   */
  const removeExpiredEntries = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    const accessTimes = accessTimesRef.current;
    
    const expiredKeys = [];
    
    cache.forEach((entry, key) => {
      if (now - entry.createdAt > ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      cache.delete(key);
      accessTimes.delete(key);
    });

    return expiredKeys.length;
  }, [ttl]);

  /**
   * Get suggestions with caching
   */
  const getSuggestions = useCallback((ctx = context) => {
    const cache = cacheRef.current;
    const accessTimes = accessTimesRef.current;
    const key = createContextKey(ctx);
    const now = Date.now();

    if (enableMetrics) {
      metricsRef.current.totalRequests++;
    }

    // Check cache first
    if (cache.has(key)) {
      const entry = cache.get(key);
      
      // Check if entry is still valid (not expired)
      if (now - entry.createdAt <= ttl) {
        // Update access time
        accessTimes.set(key, now);
        
        if (enableMetrics) {
          metricsRef.current.hits++;
        }
        
        return entry.suggestions;
      } else {
        // Remove expired entry
        cache.delete(key);
        accessTimes.delete(key);
      }
    }

    // Generate new suggestions
    let suggestions;
    try {
      suggestions = EditorContextService.generateContextualSuggestions(ctx);
    } catch (error) {
      console.warn('Failed to generate suggestions:', error);
      suggestions = [];
    }

    // Clean up cache if needed before adding new entry
    cleanupCache();

    // Store in cache
    cache.set(key, {
      suggestions,
      createdAt: now,
      contextHash: key
    });
    accessTimes.set(key, now);

    if (enableMetrics) {
      metricsRef.current.misses++;
    }

    return suggestions;
  }, [context, createContextKey, ttl, cleanupCache, enableMetrics]);

  /**
   * Preload common suggestion patterns
   */
  const preloadSuggestions = useCallback(() => {
    if (!preloadCommonSuggestions) return;
    
    commonContextsRef.current.forEach(commonContext => {
      // Only preload if not already cached
      const key = createContextKey(commonContext);
      if (!cacheRef.current.has(key)) {
        getSuggestions(commonContext);
      }
    });
  }, [preloadCommonSuggestions, createContextKey, getSuggestions]);

  /**
   * Invalidate cache entries that match a pattern
   */
  const invalidatePattern = useCallback((pattern) => {
    const cache = cacheRef.current;
    const accessTimes = accessTimesRef.current;
    const keysToRemove = [];

    cache.forEach((entry, key) => {
      if (key.includes(pattern)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      cache.delete(key);
      accessTimes.delete(key);
    });

    return keysToRemove.length;
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const metrics = metricsRef.current;
    
    return {
      size: cache.size,
      maxSize: maxCacheSize,
      memoryUsage: estimateMemoryUsage(),
      maxMemoryUsage,
      hitRate: metrics.totalRequests > 0 ? metrics.hits / metrics.totalRequests : 0,
      ...metrics
    };
  }, [maxCacheSize, maxMemoryUsage, estimateMemoryUsage]);

  /**
   * Clear all cache entries
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    accessTimesRef.current.clear();
    
    if (enableMetrics) {
      metricsRef.current = {
        hits: 0,
        misses: 0,
        evictions: 0,
        memoryCleanups: 0,
        totalRequests: 0
      };
    }
  }, [enableMetrics]);

  /**
   * Warm up cache with current context
   */
  const warmUpCache = useCallback((contexts = [context]) => {
    contexts.forEach(ctx => {
      if (ctx && Object.keys(ctx).length > 0) {
        getSuggestions(ctx);
      }
    });
  }, [context, getSuggestions]);

  // Memoized suggestions for current context
  const suggestions = useMemo(() => {
    return getSuggestions(context);
  }, [context, getSuggestions]);

  // Periodic cleanup - ONLY when cache has items
  useEffect(() => {
    // Only run cleanup if we have cached items
    const hasCachedItems = cacheRef.current.size > 0;
    if (!hasCachedItems) return;
    
    const cleanupInterval = setInterval(() => {
      // Only clean if we still have items to clean
      if (cacheRef.current.size > 0) {
        removeExpiredEntries();
        cleanupCache();
      }
    }, 60000); // Every minute

    return () => clearInterval(cleanupInterval);
  }, [removeExpiredEntries, cleanupCache]);

  // Preload common suggestions on mount
  useEffect(() => {
    if (preloadCommonSuggestions) {
      // Delay preloading to not block initial render
      const preloadTimer = setTimeout(preloadSuggestions, 100);
      return () => clearTimeout(preloadTimer);
    }
  }, [preloadCommonSuggestions, preloadSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  return {
    // Core functionality
    suggestions,
    getSuggestions,
    
    // Cache management
    clearCache,
    warmUpCache,
    invalidatePattern,
    
    // Statistics and monitoring
    getCacheStats: enableMetrics ? getCacheStats : () => ({}),
    
    // Utility
    createContextKey,
    estimateMemoryUsage,
    
    // Manual cleanup
    cleanupCache,
    removeExpiredEntries
  };
};

export default useCachedSuggestions;