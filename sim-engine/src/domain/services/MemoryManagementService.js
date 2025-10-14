/**
 * MemoryManagementService
 *
 * Comprehensive memory management system for the consciousness system.
 * Implements automatic memory pruning, garbage collection optimization,
 * memory usage limits enforcement, and efficient data structures for large-scale simulations.
 *
 * Key Features:
 * - Automatic memory pruning for old events and memories
 * - Garbage collection optimization for consciousness states
 * - Memory usage limits and enforcement
 * - Efficient data structures for large-scale simulations
 * - Memory usage monitoring and reporting
 */

import BaseDomainService from './BaseDomainService.js';
import ConsciousnessErrorHandlingService from './ConsciousnessErrorHandlingService.js';
import MemoryMonitoringService from './MemoryMonitoringService.js';

class MemoryManagementService extends BaseDomainService {
    constructor(logger = null, errorHandler = null, options = {}) {
        super();
        this.logger = logger;
        this.errorHandler = errorHandler || new ConsciousnessErrorHandlingService(logger);

        // Initialize memory monitoring
        this.memoryMonitor = new MemoryMonitoringService(logger, this);
        
        // Only start monitoring if explicitly enabled (default: false to prevent global monitoring)
        if (options.autoStartMonitoring === true) {
            this.memoryMonitor.startMonitoring();
        }

        // Memory limits and thresholds
        this.MEMORY_LIMITS = {
            MAX_EVENTS_PER_CHARACTER: 20,
            MAX_MEMORIES_PER_CHARACTER: 50,
            MAX_TOTAL_EVENTS_WORLD: 10000,
            MAX_TOTAL_MEMORIES_WORLD: 25000,
            EVENT_RETENTION_DAYS: 30,
            MEMORY_RETENTION_DAYS: 365,
            GARBAGE_COLLECTION_THRESHOLD: 0.8, // 80% of limits
            MEMORY_WARNING_THRESHOLD: 0.9 // 90% of limits
        };

        // Performance optimization settings
        this.PERFORMANCE_SETTINGS = {
            BATCH_SIZE: 100,
            CLEANUP_INTERVAL: 60000, // 1 minute
            DEEP_CLEANUP_INTERVAL: 3600000, // 1 hour
            MEMORY_CHECK_INTERVAL: 30000 // 30 seconds
        };

        // Memory statistics tracking
        this.memoryStats = {
            totalEvents: 0,
            totalMemories: 0,
            charactersProcessed: 0,
            lastCleanup: Date.now(),
            lastDeepCleanup: Date.now(),
            memoryWarnings: [],
            performanceMetrics: []
        };

        // Efficient data structures for large-scale operations
        this.eventPool = new Map(); // Reusable event objects
        this.memoryPool = new Map(); // Reusable memory objects
        this.cleanupQueue = new Set(); // Characters needing cleanup
        this.priorityQueue = new Map(); // Priority-based processing

        // Initialize cleanup timer only if monitoring is enabled
        if (options.autoStartMonitoring === true) {
            this.startPeriodicCleanup();
        }
    }

    /**
     * Manually start memory monitoring and periodic cleanup
     * Call this method when simulation actually starts to enable monitoring
     */
    startMonitoring() {
        if (!this.memoryMonitor.monitoringState.isActive) {
            this.memoryMonitor.startMonitoring();
            this.startPeriodicCleanup();
        }
    }

    /**
     * Stop memory monitoring and cleanup timers
     */
    stopMonitoring() {
        if (this.memoryMonitor.monitoringState.isActive) {
            this.memoryMonitor.stopMonitoring();
            this.stopPeriodicCleanup();
        }
    }

    /**
     * Perform comprehensive memory management for a world
     * @param {Object} worldState - The world state to manage
     * @param {Object} options - Management options
     * @returns {Object} Management results
     */
    performMemoryManagement(worldState, options = {}) {
        const startTime = Date.now();
        const results = {
            charactersProcessed: 0,
            eventsPruned: 0,
            memoriesPruned: 0,
            garbageCollected: 0,
            warnings: [],
            errors: [],
            performance: {}
        };

        try {
            if (!worldState || !worldState.npcs) {
                throw new Error('Invalid world state provided for memory management');
            }

            const {
                aggressiveCleanup = false,
                targetMemoryReduction = 0.1,
                skipGarbageCollection = false
            } = options;

            // Process characters in batches for performance
            const batches = this.createBatches(worldState.npcs, this.PERFORMANCE_SETTINGS.BATCH_SIZE);

            for (const batch of batches) {
                const batchResults = this.processBatch(batch, {
                    aggressiveCleanup,
                    skipGarbageCollection
                });

                // Aggregate results
                results.charactersProcessed += batchResults.charactersProcessed;
                results.eventsPruned += batchResults.eventsPruned;
                results.memoriesPruned += batchResults.memoriesPruned;
                results.garbageCollected += batchResults.garbageCollected;
                results.warnings.push(...batchResults.warnings);
                results.errors.push(...batchResults.errors);
            }

            // Perform world-level cleanup if needed
            if (this.shouldPerformWorldCleanup(worldState)) {
                const worldCleanup = this.performWorldLevelCleanup(worldState, targetMemoryReduction);
                results.eventsPruned += worldCleanup.eventsPruned;
                results.memoriesPruned += worldCleanup.memoriesPruned;
                results.garbageCollected += worldCleanup.garbageCollected;
            }

            // Generate performance metrics
            results.performance = this.generatePerformanceMetrics(startTime, results);

            // Update memory statistics
            this.updateMemoryStats(worldState, results);

            // Log results
            if (this.logger) {
                this.logger.info('Memory management completed', {
                    charactersProcessed: results.charactersProcessed,
                    eventsPruned: results.eventsPruned,
                    memoriesPruned: results.memoriesPruned,
                    duration: results.performance.duration
                });
            }

        } catch (error) {
            results.errors.push(error.message);
            if (this.logger) {
                this.logger.error('Memory management failed:', error);
            }
        }

        return results;
    }

    /**
     * Process a batch of characters for memory management
     * @param {Array} characterBatch - Batch of characters to process
     * @param {Object} options - Processing options
     * @returns {Object} Batch processing results
     */
    processBatch(characterBatch, options = {}) {
        const results = {
            charactersProcessed: 0,
            eventsPruned: 0,
            memoriesPruned: 0,
            garbageCollected: 0,
            warnings: [],
            errors: []
        };

        for (const character of characterBatch) {
            const charResults = this.processCharacter(character, options);
            
            // Only count as processed if no errors
            if (charResults.errors.length === 0) {
                results.charactersProcessed++;
                results.eventsPruned += charResults.eventsPruned;
                results.memoriesPruned += charResults.memoriesPruned;
                results.garbageCollected += charResults.garbageCollected;

                if (charResults.warnings.length > 0) {
                    results.warnings.push(...charResults.warnings);
                }
            } else {
                // Add errors to the batch results
                results.errors.push(...charResults.errors);
            }
        }

        return results;
    }

    /**
     * Process individual character for memory management
     * @param {Object} character - Character to process
     * @param {Object} options - Processing options
     * @returns {Object} Character processing results
     */
    processCharacter(character, options = {}) {
        const startTime = Date.now();
        const results = {
            eventsPruned: 0,
            memoriesPruned: 0,
            garbageCollected: 0,
            warnings: [],
            errors: []
        };

        if (!character) {
            results.errors.push('Character is required for memory management');
            results.performance = this.generatePerformanceMetrics(startTime, results);
            return results;
        }

        if (!character.consciousness) {
            results.errors.push('Character consciousness is required for memory management');
            results.performance = this.generatePerformanceMetrics(startTime, results);
            return results;
        }

        const { aggressiveCleanup = false, skipGarbageCollection = false } = options;

        // Prune old events
        results.eventsPruned = this.pruneOldEvents(character, aggressiveCleanup);

        // Prune old memories
        const memoriesWereCorrupted = !character.significantMemories || !Array.isArray(character.significantMemories);
        results.memoriesPruned = this.pruneOldMemories(character, aggressiveCleanup);
        if (memoriesWereCorrupted) {
            results.garbageCollected += 1; // Count data repair as garbage collected
        }

        // Perform garbage collection if not skipped
        if (!skipGarbageCollection) {
            results.garbageCollected += this.performGarbageCollection(character);
        }

        // Check memory limits and enforce if needed
        const limitResults = this.enforceMemoryLimits(character);
        results.eventsPruned += limitResults.eventsPruned;
        results.memoriesPruned += limitResults.memoriesPruned;
        results.warnings.push(...limitResults.warnings);

        // Optimize data structures
        const optimizedCount = this.optimizeCharacterDataStructures(character);
        results.garbageCollected += optimizedCount;

        // Generate performance metrics
        results.performance = this.generatePerformanceMetrics(startTime, results);

        // Update memory statistics
        this.memoryStats.charactersProcessed++;

        return results;
    }

    /**
     * Prune old events from character consciousness
     * @param {Object} character - Character to prune
     * @param {boolean} aggressive - Whether to use aggressive pruning
     * @returns {number} Number of events pruned
     */
    pruneOldEvents(character, aggressive = false) {
        if (!character.consciousness || !character.consciousness.significantEvents) {
            return 0;
        }

        const events = character.consciousness.significantEvents;
        const originalCount = events.length;

        if (originalCount === 0) {
            return 0;
        }

        const now = Date.now();
        const retentionMs = aggressive ?
            this.MEMORY_LIMITS.EVENT_RETENTION_DAYS * 24 * 60 * 60 * 1000 * 0.5 : // 50% of normal retention
            this.MEMORY_LIMITS.EVENT_RETENTION_DAYS * 24 * 60 * 60 * 1000;

        // Filter out old events (keep null entries for garbage collection)
        character.consciousness.significantEvents = events.filter(event => {
            if (event == null || typeof event !== 'object') return true; // Keep null for garbage collection
            const eventTime = event.timestamp || now;
            return (now - eventTime) <= retentionMs;
        });

        // Also filter by significance if still over limit
        if (character.consciousness.significantEvents.length > this.MEMORY_LIMITS.MAX_EVENTS_PER_CHARACTER) {
            character.consciousness.significantEvents.sort((a, b) => (b.significance || 0) - (a.significance || 0));
            character.consciousness.significantEvents = character.consciousness.significantEvents.slice(0, this.MEMORY_LIMITS.MAX_EVENTS_PER_CHARACTER);
        }

        const prunedCount = originalCount - character.consciousness.significantEvents.length;
        return prunedCount;
    }

    /**
     * Prune old memories from character
     * @param {Object} character - Character to prune
     * @param {boolean} aggressive - Whether to use aggressive pruning
     * @returns {number} Number of memories pruned
     */
    pruneOldMemories(character, aggressive = false) {
        if (!character.significantMemories || !Array.isArray(character.significantMemories)) {
            // Initialize as empty array if corrupted - this is handled as garbage collection, not pruning
            character.significantMemories = [];
            return 0; // Don't count initialization as pruning
        }

        const memories = character.significantMemories;
        const originalCount = memories.length;

        if (originalCount === 0) {
            return 0;
        }

        const now = Date.now();
        const retentionMs = aggressive ?
            this.MEMORY_LIMITS.MEMORY_RETENTION_DAYS * 24 * 60 * 60 * 1000 * 0.3 : // 30% of normal retention
            this.MEMORY_LIMITS.MEMORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;

        // Filter out old memories (keep null entries for garbage collection)
        character.significantMemories = memories.filter(memory => {
            if (memory == null || typeof memory !== 'object') return true; // Keep null for garbage collection
            const memoryTime = memory.timestamp || now;
            return (now - memoryTime) <= retentionMs;
        });

        const prunedCount = originalCount - character.significantMemories.length;
        return prunedCount;
    }

    /**
     * Perform garbage collection on character consciousness state
     * @param {Object} character - Character to garbage collect
     * @returns {number} Number of objects garbage collected
     */
    performGarbageCollection(character) {
        let garbageCollected = 0;

        if (!character.consciousness) {
            return garbageCollected;
        }

        // Clean up null/undefined values in significantEvents array
        if (character.consciousness.significantEvents) {
            const originalLength = character.consciousness.significantEvents.length;
            character.consciousness.significantEvents = character.consciousness.significantEvents.filter(event => event != null);
            garbageCollected += originalLength - character.consciousness.significantEvents.length;
        }

        // Clean up null/undefined values in significantMemories array
        if (character.significantMemories) {
            const originalLength = character.significantMemories.length;
            character.significantMemories = character.significantMemories.filter(memory => memory != null);
            garbageCollected += originalLength - character.significantMemories.length;
        }

        // Clean up corrupted behavioral state
        if (!character.consciousness.behavioralState || typeof character.consciousness.behavioralState !== 'object') {
            // Missing or corrupted behavioral state entirely - regenerate it
            character.consciousness.behavioralState = this.generateBehavioralStateFromParameters(
                character.consciousness.frequency || 7.5,
                character.consciousness.coherence || 0.7
            );
            garbageCollected++;
        } else {
            // Behavioral state exists, check for corrupted numeric values
            const behavioralState = character.consciousness.behavioralState;

            // Remove invalid numeric values
            Object.keys(behavioralState).forEach(key => {
                if (typeof behavioralState[key] === 'number') {
                    if (isNaN(behavioralState[key]) || !isFinite(behavioralState[key])) {
                        delete behavioralState[key];
                        garbageCollected++;
                    }
                }
            });

            // Regenerate if too many fields are missing
            const requiredFields = ['energy', 'focus', 'mood', 'socialDrive', 'riskTolerance', 'ambition'];
            const missingFields = requiredFields.filter(field => !(field in behavioralState));

            if (missingFields.length >= 2) {
                // Too many missing fields, regenerate entirely
                character.consciousness.behavioralState = this.generateBehavioralStateFromParameters(
                    character.consciousness.frequency || 7.5,
                    character.consciousness.coherence || 0.7
                );
                garbageCollected += missingFields.length;
            }
        }

        // Clean up corrupted consciousness values
        if (typeof character.consciousness.frequency !== 'number' || isNaN(character.consciousness.frequency) || !isFinite(character.consciousness.frequency)) {
            character.consciousness.frequency = 7.5; // Default alpha baseline
            garbageCollected++;
        }

        if (typeof character.consciousness.coherence !== 'number' || isNaN(character.consciousness.coherence) || !isFinite(character.consciousness.coherence)) {
            character.consciousness.coherence = 0.7; // Default coherence
            garbageCollected++;
        }

        // Clean up goals array
        if (character.goals) {
            const originalLength = character.goals.length;
            character.goals = character.goals.filter(goal => goal != null && typeof goal === 'object');
            garbageCollected += originalLength - character.goals.length;
        }

        return garbageCollected;
    }

    /**
     * Enforce memory limits for character
     * @param {Object} character - Character to enforce limits on
     * @returns {Object} Enforcement results
     */
    enforceMemoryLimits(character) {
        const results = {
            eventsPruned: 0,
            memoriesPruned: 0,
            warnings: []
        };

        // Check events limit
        if (character.consciousness?.significantEvents) {
            const events = character.consciousness.significantEvents;
            if (events.length > this.MEMORY_LIMITS.MAX_EVENTS_PER_CHARACTER) {
                const excess = events.length - this.MEMORY_LIMITS.MAX_EVENTS_PER_CHARACTER;
                // Remove oldest events
                character.consciousness.significantEvents = events.slice(-this.MEMORY_LIMITS.MAX_EVENTS_PER_CHARACTER);
                results.eventsPruned += excess;
                results.warnings.push(`Pruned ${excess} excess events for character ${character.id}`);
            }
        }

        // Check memories limit
        if (character.significantMemories) {
            const memories = character.significantMemories;
            if (memories.length > this.MEMORY_LIMITS.MAX_MEMORIES_PER_CHARACTER) {
                const excess = memories.length - this.MEMORY_LIMITS.MAX_MEMORIES_PER_CHARACTER;
                // Remove least significant memories
                memories.sort((a, b) => (a.significance || 0) - (b.significance || 0));
                character.significantMemories = memories.slice(-this.MEMORY_LIMITS.MAX_MEMORIES_PER_CHARACTER);
                results.memoriesPruned += excess;
                results.warnings.push(`Pruned ${excess} excess memories for character ${character.id}`);
            }
        }

        return results;
    }

    /**
     * Optimize data structures for character
     * @param {Object} character - Character to optimize
     * @returns {number} Number of items optimized/removed
     */
    optimizeCharacterDataStructures(character) {
        let optimizedCount = 0;

        // Convert arrays to more efficient structures if beneficial
        if (character.consciousness?.significantEvents && character.consciousness.significantEvents.length > 1) {
            // For large event arrays, ensure they're properly indexed
            optimizedCount += this.optimizeEventArray(character.consciousness.significantEvents);
        }

        if (character.significantMemories && character.significantMemories.length > 1) {
            // For large memory arrays, ensure they're properly indexed
            optimizedCount += this.optimizeMemoryArray(character.significantMemories);
        }

        // Optimize behavioral state object
        if (character.consciousness?.behavioralState) {
            this.optimizeBehavioralState(character.consciousness.behavioralState);
        }

        return optimizedCount;
    }

    /**
     * Optimize event array for better performance
     * @param {Array} events - Events array to optimize
     * @returns {number} Number of items optimized/removed
     */
    optimizeEventArray(events) {
        let optimizedCount = 0;

        // Filter out null/undefined entries first
        const validEvents = events.filter(event => event != null && typeof event === 'object');

        if (validEvents.length !== events.length) {
            // Replace the array with filtered version
            events.splice(0, events.length, ...validEvents);
            optimizedCount += events.length - validEvents.length;
        }

        if (events.length > 1) {
            const firstEvent = events[0];
            const lastEvent = events[events.length - 1];

            // Only sort if not already sorted (newest first)
            if (firstEvent && lastEvent && firstEvent.timestamp < lastEvent.timestamp) {
                events.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            }
        }

        // Remove duplicate events (same type, similar timestamp)
        const uniqueEvents = [];
        const seen = new Set();

        for (const event of events) {
            if (event && typeof event === 'object') {
                const key = `${event.type}_${Math.floor((event.timestamp || 0) / 60000)}`; // Group by minute
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueEvents.push(event);
                }
            }
        }

        // Replace array if we removed duplicates
        if (uniqueEvents.length < events.length) {
            events.splice(0, events.length, ...uniqueEvents);
            optimizedCount += events.length - uniqueEvents.length;
        }

        return optimizedCount;
    }

    /**
     * Optimize memory array for better performance
     * @param {Array} memories - Memories array to optimize
     * @returns {number} Number of items optimized/removed
     */
    optimizeMemoryArray(memories) {
        let optimizedCount = 0;

        // Filter out null/undefined entries first
        const validMemories = memories.filter(memory => memory != null && typeof memory === 'object');

        if (validMemories.length !== memories.length) {
            // Replace the array with filtered version
            memories.splice(0, memories.length, ...validMemories);
            optimizedCount += memories.length - validMemories.length;
        }

        if (memories.length > 0) {
            // Sort by significance and recency for optimal retrieval
            memories.sort((a, b) => {
                const sigDiff = (b.significance || 0) - (a.significance || 0);
                if (Math.abs(sigDiff) > 0.05) return sigDiff;
                return (b.timestamp || 0) - (a.timestamp || 0);
            });
        }

        // Remove duplicate memories (same interaction type, similar timestamp)
        const uniqueMemories = [];
        const seen = new Set();

        for (const memory of memories) {
            if (memory && typeof memory === 'object') {
                const key = `${memory.interactionType}_${Math.floor((memory.timestamp || 0) / 3600000)}`; // Group by hour
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueMemories.push(memory);
                }
            }
        }

        // Replace array if we removed duplicates
        if (uniqueMemories.length < memories.length) {
            memories.splice(0, memories.length, ...uniqueMemories);
            optimizedCount += memories.length - uniqueMemories.length;
        }

        return optimizedCount;
    }

    /**
     * Optimize behavioral state object
     * @param {Object} behavioralState - Behavioral state to optimize
     */
    optimizeBehavioralState(behavioralState) {
        // Ensure all numeric values are properly typed and bounded
        const numericFields = ['socialDrive', 'riskTolerance', 'ambition'];

        for (const field of numericFields) {
            if (typeof behavioralState[field] === 'number') {
                // Clamp to valid range
                behavioralState[field] = Math.max(0, Math.min(1, behavioralState[field]));
            }
        }

        // Remove any unnecessary properties
        const allowedFields = ['energy', 'focus', 'mood', 'socialDrive', 'riskTolerance', 'ambition'];
        Object.keys(behavioralState).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete behavioralState[key];
            }
        });
    }

    /**
     * Perform world-level cleanup when individual character cleanup isn't enough
     * @param {Object} worldState - World state to clean up
     * @param {number} targetReduction - Target memory reduction ratio
     * @returns {Object} World cleanup results
     */
    performWorldLevelCleanup(worldState, targetReduction = 0.1) {
        const results = {
            eventsPruned: 0,
            memoriesPruned: 0,
            garbageCollected: 0
        };

        // Calculate total memory usage
        let totalEvents = 0;
        let totalMemories = 0;

        worldState.npcs.forEach(npc => {
            // Skip null or invalid characters
            if (!npc) {
                return;
            }
            if (npc.consciousness?.significantEvents) {
                totalEvents += npc.consciousness.significantEvents.length;
            }
            if (npc.significantMemories) {
                totalMemories += npc.significantMemories.length;
            }
        });

        // Check if we need aggressive cleanup
        const eventsOverLimit = totalEvents > this.MEMORY_LIMITS.MAX_TOTAL_EVENTS_WORLD;
        const memoriesOverLimit = totalMemories > this.MEMORY_LIMITS.MAX_TOTAL_MEMORIES_WORLD;

        if (eventsOverLimit || memoriesOverLimit) {
            // Perform aggressive cleanup on all characters
            worldState.npcs.forEach(npc => {
                // Skip null or invalid characters
                if (!npc) {
                    return;
                }
                
                const charResults = this.processCharacter(npc, {
                    aggressiveCleanup: true,
                    skipGarbageCollection: false
                });

                results.eventsPruned += charResults.eventsPruned;
                results.memoriesPruned += charResults.memoriesPruned;
                results.garbageCollected += charResults.garbageCollected;
            });
        }

        return results;
    }

    /**
     * Check if world-level cleanup should be performed
     * @param {Object} worldState - World state to check
     * @returns {boolean} Whether cleanup is needed
     */
    shouldPerformWorldCleanup(worldState) {
        let totalEvents = 0;
        let totalMemories = 0;

        worldState.npcs.forEach(npc => {
            // Skip null or invalid characters
            if (!npc) {
                return;
            }
            if (npc.consciousness?.significantEvents) {
                totalEvents += npc.consciousness.significantEvents.length;
            }
            if (npc.significantMemories) {
                totalMemories += npc.significantMemories.length;
            }
        });

        const eventsThreshold = this.MEMORY_LIMITS.MAX_TOTAL_EVENTS_WORLD * this.MEMORY_LIMITS.GARBAGE_COLLECTION_THRESHOLD;
        const memoriesThreshold = this.MEMORY_LIMITS.MAX_TOTAL_MEMORIES_WORLD * this.MEMORY_LIMITS.GARBAGE_COLLECTION_THRESHOLD;

        return totalEvents > eventsThreshold || totalMemories > memoriesThreshold;
    }

    /**
     * Create batches of characters for processing
     * @param {Array} characters - Array of characters to batch
     * @param {number} batchSize - Size of each batch
     * @returns {Array} Array of character batches
     */
    createBatches(characters, batchSize) {
        const batches = [];
        for (let i = 0; i < characters.length; i += batchSize) {
            batches.push(characters.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Update memory statistics
     * @param {Object} worldState - World state
     * @param {Object} results - Management results
     */
    updateMemoryStats(worldState, results) {
        let totalEvents = 0;
        let totalMemories = 0;

        worldState.npcs.forEach(npc => {
            // Skip null or invalid characters
            if (!npc) {
                return;
            }
            if (npc.consciousness?.significantEvents) {
                totalEvents += npc.consciousness.significantEvents.length;
            }
            if (npc.significantMemories) {
                totalMemories += npc.significantMemories.length;
            }
        });

        this.memoryStats.totalEvents = totalEvents;
        this.memoryStats.totalMemories = totalMemories;
        this.memoryStats.charactersProcessed = worldState.npcs.length;
        this.memoryStats.lastCleanup = Date.now();

        // Add performance metrics
        this.memoryStats.performanceMetrics.push({
            timestamp: Date.now(),
            totalEvents,
            totalMemories,
            charactersProcessed: results.charactersProcessed,
            eventsPruned: results.eventsPruned,
            memoriesPruned: results.memoriesPruned,
            duration: results.performance?.duration || 0
        });

        // Keep only last 100 performance metrics
        if (this.memoryStats.performanceMetrics.length > 100) {
            this.memoryStats.performanceMetrics = this.memoryStats.performanceMetrics.slice(-100);
        }
    }

    /**
     * Generate performance metrics for memory management
     * @param {number} startTime - Start time of operation
     * @param {Object} results - Management results
     * @returns {Object} Performance metrics
     */
    generatePerformanceMetrics(startTime, results) {
        const endTime = Date.now();
        let duration = endTime - startTime;

        // Ensure minimum duration of 1ms for testing purposes
        if (duration === 0) {
            duration = 1;
        }

        return {
            duration,
            charactersPerSecond: results.charactersProcessed / (duration / 1000),
            eventsPrunedPerSecond: results.eventsPruned / (duration / 1000),
            memoriesPrunedPerSecond: results.memoriesPruned / (duration / 1000),
            averageProcessingTime: duration / Math.max(results.charactersProcessed, 1),
            memoryEfficiency: this.calculateMemoryEfficiency(results)
        };
    }

    /**
     * Calculate memory efficiency metric
     * @param {Object} results - Management results
     * @returns {number} Memory efficiency ratio
     */
    calculateMemoryEfficiency(results) {
        const totalItemsProcessed = results.eventsPruned + results.memoriesPruned + results.garbageCollected;
        const totalItemsRemoved = results.eventsPruned + results.memoriesPruned;

        if (totalItemsProcessed === 0) return 1.0;

        return totalItemsRemoved / totalItemsProcessed;
    }

    /**
     * Start periodic cleanup timer
     */
    startPeriodicCleanup() {
        // Don't start if already running
        if (this.cleanupIntervals) {
            return;
        }

        this.cleanupIntervals = [];

        // Regular cleanup every minute
        this.cleanupIntervals.push(setInterval(() => {
            this.performPeriodicCleanup();
        }, this.PERFORMANCE_SETTINGS.CLEANUP_INTERVAL));

        // Deep cleanup every hour
        this.cleanupIntervals.push(setInterval(() => {
            this.performDeepCleanup();
        }, this.PERFORMANCE_SETTINGS.DEEP_CLEANUP_INTERVAL));

        // Memory monitoring every 30 seconds
        this.cleanupIntervals.push(setInterval(() => {
            this.checkMemoryUsage();
        }, this.PERFORMANCE_SETTINGS.MEMORY_CHECK_INTERVAL));
    }

    /**
     * Stop periodic cleanup timers
     */
    stopPeriodicCleanup() {
        if (this.cleanupIntervals) {
            this.cleanupIntervals.forEach(interval => clearInterval(interval));
            this.cleanupIntervals = null;
        }
    }

    /**
     * Perform periodic cleanup
     */
    performPeriodicCleanup() {
        // Clean up object pools
        this.cleanupObjectPools();

        // Process cleanup queue
        this.processCleanupQueue();

        // Update last cleanup time
        this.memoryStats.lastCleanup = Date.now();
    }

    /**
     * Perform deep cleanup (more aggressive)
     */
    performDeepCleanup() {
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }

        // Clear old performance metrics
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.memoryStats.performanceMetrics = this.memoryStats.performanceMetrics.filter(
            metric => metric.timestamp > oneDayAgo
        );

        // Clear old warnings
        this.memoryStats.memoryWarnings = this.memoryStats.memoryWarnings.filter(
            warning => warning.timestamp > oneDayAgo
        );

        this.memoryStats.lastDeepCleanup = Date.now();
    }

    /**
     * Check memory usage and generate warnings
     */
    checkMemoryUsage() {
        const eventRatio = this.memoryStats.totalEvents / this.MEMORY_LIMITS.MAX_TOTAL_EVENTS_WORLD;
        const memoryRatio = this.memoryStats.totalMemories / this.MEMORY_LIMITS.MAX_TOTAL_MEMORIES_WORLD;

        if (eventRatio > this.MEMORY_LIMITS.MEMORY_WARNING_THRESHOLD) {
            const warning = {
                timestamp: Date.now(),
                type: 'events',
                ratio: eventRatio,
                message: `Event memory usage at ${(eventRatio * 100).toFixed(1)}% of limit`
            };
            this.memoryStats.memoryWarnings.push(warning);

            if (this.logger) {
                this.logger.warn('High event memory usage detected', warning);
            }
        }

        if (memoryRatio > this.MEMORY_LIMITS.MEMORY_WARNING_THRESHOLD) {
            const warning = {
                timestamp: Date.now(),
                type: 'memories',
                ratio: memoryRatio,
                message: `Memory usage at ${(memoryRatio * 100).toFixed(1)}% of limit`
            };
            this.memoryStats.memoryWarnings.push(warning);

            if (this.logger) {
                this.logger.warn('High memory usage detected', warning);
            }
        }
    }

    /**
     * Clean up object pools
     */
    cleanupObjectPools() {
        // Clean up event pool (remove old entries)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        for (const [key, entry] of this.eventPool.entries()) {
            if (entry.timestamp < oneHourAgo) {
                this.eventPool.delete(key);
            }
        }

        // Clean up memory pool (remove old entries)
        for (const [key, entry] of this.memoryPool.entries()) {
            if (entry.timestamp < oneHourAgo) {
                this.memoryPool.delete(key);
            }
        }
    }

    /**
     * Process cleanup queue
     */
    processCleanupQueue() {
        // Process up to 10 characters from cleanup queue
        const toProcess = Array.from(this.cleanupQueue).slice(0, 10);

        toProcess.forEach(characterId => {
            // In a real implementation, you'd look up the character by ID
            // and perform cleanup. For now, just remove from queue.
            this.cleanupQueue.delete(characterId);
        });
    }

    /**
     * Generate behavioral state from consciousness parameters
     * @param {number} frequency - Consciousness frequency
     * @param {number} coherence - Consciousness coherence
     * @returns {Object} Generated behavioral state
     */
    generateBehavioralStateFromParameters(frequency, coherence) {
        return {
            energy: this.mapFrequencyToEnergy(frequency),
            focus: this.mapCoherenceToFocus(coherence),
            mood: this.calculateMoodFromState(frequency, coherence),
            socialDrive: Math.max(0, Math.min(1, (frequency - 4) / 8)),
            riskTolerance: Math.max(0, Math.min(1, (frequency - 6) / 6)),
            ambition: Math.max(0, Math.min(1, coherence * (frequency / 10)))
        };
    }

    /**
     * Map frequency to energy level
     * @param {number} frequency - Consciousness frequency
     * @returns {string} Energy level
     */
    mapFrequencyToEnergy(frequency) {
        if (frequency < 6) return 'low';
        if (frequency > 10) return 'high';
        return 'moderate';
    }

    /**
     * Map coherence to focus level
     * @param {number} coherence - Consciousness coherence
     * @returns {string} Focus level
     */
    mapCoherenceToFocus(coherence) {
        if (coherence < 0.5) return 'scattered';
        if (coherence > 0.8) return 'focused';
        return 'balanced';
    }

    /**
     * Calculate mood from frequency and coherence
     * @param {number} frequency - Consciousness frequency
     * @param {number} coherence - Consciousness coherence
     * @returns {string} Mood state
     */
    calculateMoodFromState(frequency, coherence) {
        const moodScore = (frequency / 15) + (coherence * 0.5);

        if (moodScore < 0.5) return 'depressed';
        if (moodScore < 0.75) return 'content';
        if (moodScore < 1.0) return 'optimistic';
        return 'excited';
    }

    /**
     * Get memory management statistics
     * @returns {Object} Memory statistics
     */
    getMemoryStats() {
        return {
            ...this.memoryStats,
            limits: { ...this.MEMORY_LIMITS },
            performance: { ...this.PERFORMANCE_SETTINGS },
            pools: {
                events: this.eventPool.size,
                memories: this.memoryPool.size,
                cleanupQueue: this.cleanupQueue.size
            }
        };
    }

    /**
     * Force immediate garbage collection (if available)
     */
    forceGarbageCollection() {
        if (global.gc) {
            global.gc();
            if (this.logger) {
                this.logger.info('Forced garbage collection executed');
            }
        }
    }

    /**
     * Get memory monitoring status
     * @returns {Object} Monitoring status
     */
    getMonitoringStatus() {
        return this.memoryMonitor.getMonitoringStatus();
    }

    /**
     * Get active memory alerts
     * @param {boolean} includeAcknowledged - Whether to include acknowledged alerts
     * @returns {Array} Active alerts
     */
    getActiveAlerts(includeAcknowledged = false) {
        return this.memoryMonitor.getActiveAlerts(includeAcknowledged);
    }

    /**
     * Acknowledge a memory alert
     * @param {string} alertId - ID of the alert to acknowledge
     * @returns {boolean} Whether the alert was acknowledged
     */
    acknowledgeAlert(alertId) {
        return this.memoryMonitor.acknowledgeAlert(alertId);
    }
}

export default MemoryManagementService;