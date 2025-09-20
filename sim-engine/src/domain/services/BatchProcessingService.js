/**
 * Batch Processing Service
 *
 * Provides batch processing utilities for multiple NPC consciousness updates,
 * parallel processing for independent consciousness updates, and batch checkpoint
 * operations for large worlds. Optimizes performance for large-scale simulations.
 */

import BaseDomainService from './BaseDomainService.js';
import EfficientTurnProcessor from './EfficientTurnProcessor.js';
import ConsciousnessUpdateService from './ConsciousnessUpdateService.js';
import ConsciousnessCheckpointService from './ConsciousnessCheckpointService.js';
import BehavioralStateService from './BehavioralStateService.js';
import EventSignificanceService from './EventSignificanceService.js';
import SignificantMemoryService from './SignificantMemoryService.js';

class BatchProcessingService extends BaseDomainService {
    constructor(
        turnProcessor = null,
        consciousnessUpdateService = null,
        checkpointService = null,
        behavioralStateService = null,
        eventSignificanceService = null,
        memoryService = null,
        logger = null
    ) {
        super();
        this.turnProcessor = turnProcessor || new EfficientTurnProcessor();
        this.consciousnessUpdateService = consciousnessUpdateService || new ConsciousnessUpdateService();
        this.checkpointService = checkpointService || new ConsciousnessCheckpointService();
        this.behavioralStateService = behavioralStateService || new BehavioralStateService();
        this.eventSignificanceService = eventSignificanceService || new EventSignificanceService();
        this.memoryService = memoryService || new SignificantMemoryService();
        this.logger = logger;

        // Batch processing configuration
        this.config = {
            maxBatchSize: 100,           // Maximum NPCs per batch
            maxParallelBatches: 4,       // Maximum concurrent batches
            processingTimeout: 30000,    // 30 seconds timeout per batch
            checkpointBatchSize: 500,    // NPCs per checkpoint batch
            enableParallelProcessing: true,
            enableProgressReporting: true,
            errorRecoveryEnabled: true
        };

        // Performance tracking
        this.performanceMetrics = {
            totalBatchesProcessed: 0,
            totalNPCsProcessed: 0,
            totalProcessingTime: 0,
            averageBatchTime: 0,
            parallelEfficiencyRatio: 0,
            errorRate: 0,
            checkpointOperations: 0
        };

        // Error tracking
        this.errorTracking = {
            batchErrors: [],
            npcErrors: [],
            checkpointErrors: [],
            recoveryAttempts: 0
        };
    }

    /**
     * Process multiple NPCs in optimized batches
     * @param {Array} npcs - Array of NPC objects to process
     * @param {Object} worldState - Current world state
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Batch processing results
     */
    async processBatch(npcs, worldState, options = {}) {
        const startTime = Date.now();
        const batchId = this.generateBatchId();
        
        // Validate inputs first
        this._validateBatchInputs(npcs, worldState);

        const results = {
            batchId,
            totalNPCs: npcs.length,
            processedNPCs: 0,
            successfulNPCs: 0,
            failedNPCs: 0,
            batches: [],
            errors: [],
            performanceMetrics: {},
            checkpointResults: null
        };

        try {
            if (this.logger) {
                this.logger.info(`Starting batch processing for ${npcs.length} NPCs (batch: ${batchId})`);
            }

            // Configure batch processing based on options
            const batchConfig = this._configureBatchProcessing(options);

            // Split NPCs into processing batches
            const npcBatches = this._createNPCBatches(npcs, batchConfig.batchSize);

            // Process batches (parallel or sequential based on configuration)
            const batchResults = await this._processBatches(
                npcBatches,
                worldState,
                batchConfig,
                batchId
            );

            // Aggregate results from all batches
            results.batches = batchResults;
            results.processedNPCs = batchResults.reduce((sum, batch) => sum + batch.processedNPCs, 0);
            results.successfulNPCs = batchResults.reduce((sum, batch) => sum + batch.successfulNPCs, 0);
            results.failedNPCs = batchResults.reduce((sum, batch) => sum + batch.failedNPCs, 0);
            results.cachedStatesUsed = batchResults.reduce((sum, batch) => sum + (batch.cachedStatesUsed || 0), 0);
            results.errors = batchResults.flatMap(batch => batch.errors);

            // Perform batch checkpoint if enabled
            if (batchConfig.enableCheckpointing) {
                results.checkpointResults = await this._performBatchCheckpoint(
                    npcs,
                    worldState,
                    batchConfig
                );
            }

            // Calculate performance metrics
            const endTime = Date.now();
            const totalTime = Math.max(endTime - startTime, 1); // Ensure at least 1ms for testing
            results.performanceMetrics = this._calculateBatchPerformanceMetrics(
                results,
                totalTime,
                batchConfig
            );

            // Update global performance tracking
            this._updateGlobalPerformanceMetrics(results);

            if (this.logger) {
                this.logger.info(`Batch processing completed: ${results.successfulNPCs}/${results.totalNPCs} NPCs processed successfully in ${totalTime}ms`);
            }

            return results;

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Batch processing failed for batch ${batchId}: ${error.message}`);
            }

            results.errors.push({
                type: 'batch_processing_failure',
                message: error.message,
                timestamp: Date.now()
            });

            // Attempt error recovery if enabled and not already in recovery mode
            if (this.config.errorRecoveryEnabled && !options.isRecoveryAttempt) {
                const recoveryResult = await this._attemptBatchRecovery(npcs, worldState, options, error);
                if (recoveryResult.success) {
                    results.recoveryAttempted = true;
                    results.recoveryResult = recoveryResult;
                }
            }

            return results;
        }
    }

    /**
     * Process multiple consciousness updates in parallel
     * @param {Array} updateRequests - Array of update request objects
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Parallel processing results
     */
    async processParallelUpdates(updateRequests, options = {}) {
        const startTime = Date.now();
        const parallelId = this.generateParallelId();

        const results = {
            parallelId,
            totalUpdates: updateRequests.length,
            processedUpdates: 0,
            successfulUpdates: 0,
            failedUpdates: 0,
            updateResults: [],
            errors: [],
            performanceMetrics: {}
        };

        try {
            if (this.logger) {
                this.logger.info(`Starting parallel consciousness updates for ${updateRequests.length} requests (parallel: ${parallelId})`);
            }

            // Validate update requests
            this._validateUpdateRequests(updateRequests);

            // Configure parallel processing
            const parallelConfig = this._configureParallelProcessing(options);

            // Group updates by independence (NPCs that don't affect each other)
            const independentGroups = this._groupIndependentUpdates(updateRequests);

            // Process groups in parallel
            const groupResults = await Promise.allSettled(
                independentGroups.map(group => 
                    this._processUpdateGroup(group, parallelConfig, parallelId)
                )
            );

            // Aggregate results from all groups
            groupResults.forEach((groupResult, index) => {
                if (groupResult.status === 'fulfilled') {
                    const group = groupResult.value;
                    results.updateResults.push(...group.updateResults);
                    results.processedUpdates += group.processedUpdates;
                    results.successfulUpdates += group.successfulUpdates;
                    results.failedUpdates += group.failedUpdates;
                    results.errors.push(...group.errors);
                } else {
                    results.errors.push({
                        type: 'group_processing_failure',
                        groupIndex: index,
                        message: groupResult.reason?.message || 'Unknown group processing error',
                        timestamp: Date.now()
                    });
                    results.failedUpdates += independentGroups[index].length;
                }
            });

            // Calculate performance metrics
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            results.performanceMetrics = this._calculateParallelPerformanceMetrics(
                results,
                totalTime,
                parallelConfig
            );

            if (this.logger) {
                this.logger.info(`Parallel processing completed: ${results.successfulUpdates}/${results.totalUpdates} updates processed successfully in ${totalTime}ms`);
            }

            return results;

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Parallel processing failed for ${parallelId}: ${error.message}`);
            }

            results.errors.push({
                type: 'parallel_processing_failure',
                message: error.message,
                timestamp: Date.now()
            });

            return results;
        }
    }

    /**
     * Perform batch checkpoint operations for large worlds
     * @param {Array} npcs - NPCs to checkpoint
     * @param {Object} worldState - Current world state
     * @param {Object} options - Checkpoint options
     * @returns {Promise<Object>} Checkpoint results
     */
    async performBatchCheckpoint(npcs, worldState, options = {}) {
        const startTime = Date.now();
        const checkpointId = this.generateCheckpointId();

        const results = {
            checkpointId,
            totalNPCs: npcs.length,
            checkpointedNPCs: 0,
            checkpointBatches: [],
            errors: [],
            performanceMetrics: {},
            checkpointSize: 0
        };

        try {
            if (this.logger) {
                this.logger.info(`Starting batch checkpoint for ${npcs.length} NPCs (checkpoint: ${checkpointId})`);
            }

            // Configure checkpoint processing
            const checkpointConfig = this._configureCheckpointProcessing(options);

            // Split NPCs into checkpoint batches
            const checkpointBatches = this._createCheckpointBatches(npcs, checkpointConfig.batchSize);

            // Process checkpoint batches
            for (let i = 0; i < checkpointBatches.length; i++) {
                const batch = checkpointBatches[i];

                try {
                    const batchResult = await this._processCheckpointBatch(
                        batch,
                        worldState,
                        checkpointConfig,
                        i
                    );

                    results.checkpointBatches.push(batchResult);
                    results.checkpointedNPCs += batchResult.checkpointedNPCs;
                    results.checkpointSize += batchResult.batchSize;

                    if (this.logger && checkpointConfig.enableProgressReporting) {
                        const progress = ((i + 1) / checkpointBatches.length * 100).toFixed(1);
                        this.logger.info(`Checkpoint progress: ${progress}% (batch ${i + 1}/${checkpointBatches.length})`);
                    }

                } catch (batchError) {
                    results.errors.push({
                        type: 'checkpoint_batch_failure',
                        batchIndex: i,
                        message: batchError.message,
                        timestamp: Date.now()
                    });

                    if (this.logger) {
                        this.logger.warn(`Checkpoint batch ${i} failed: ${batchError.message}`);
                    }
                }
            }

            // Calculate performance metrics
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            results.performanceMetrics = this._calculateCheckpointPerformanceMetrics(
                results,
                totalTime,
                checkpointConfig
            );

            // Update global checkpoint tracking
            this.performanceMetrics.checkpointOperations++;

            if (this.logger) {
                this.logger.info(`Batch checkpoint completed: ${results.checkpointedNPCs}/${results.totalNPCs} NPCs checkpointed in ${totalTime}ms`);
            }

            return results;

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Batch checkpoint failed for ${checkpointId}: ${error.message}`);
            }

            results.errors.push({
                type: 'batch_checkpoint_failure',
                message: error.message,
                timestamp: Date.now()
            });

            return results;
        }
    }

    /**
     * Validate batch processing inputs
     * @param {Array} npcs - NPCs to validate
     * @param {Object} worldState - World state to validate
     * @private
     */
    _validateBatchInputs(npcs, worldState) {
        if (!Array.isArray(npcs)) {
            throw new Error('NPCs must be provided as an array');
        }

        if (npcs.length === 0) {
            throw new Error('At least one NPC must be provided for batch processing');
        }

        if (!worldState || typeof worldState !== 'object') {
            throw new Error('Valid world state must be provided');
        }

        // Validate NPC structure
        npcs.forEach((npc, index) => {
            if (!npc || typeof npc !== 'object') {
                throw new Error(`NPC at index ${index} is not a valid object`);
            }

            if (!npc.id) {
                throw new Error(`NPC at index ${index} is missing required id property`);
            }
        });
    }

    /**
     * Configure batch processing based on options
     * @param {Object} options - Processing options
     * @returns {Object} Batch configuration
     * @private
     */
    _configureBatchProcessing(options) {
        return {
            batchSize: options.batchSize || this.config.maxBatchSize,
            maxParallelBatches: options.maxParallelBatches || this.config.maxParallelBatches,
            enableParallelProcessing: options.enableParallelProcessing !== false && this.config.enableParallelProcessing,
            enableProgressReporting: options.enableProgressReporting !== false && this.config.enableProgressReporting,
            enableCheckpointing: options.enableCheckpointing || false,
            processingTimeout: options.processingTimeout || this.config.processingTimeout,
            errorRecoveryEnabled: options.errorRecoveryEnabled !== false && this.config.errorRecoveryEnabled
        };
    }

    /**
     * Create NPC batches for processing
     * @param {Array} npcs - NPCs to batch
     * @param {number} batchSize - Size of each batch
     * @returns {Array} Array of NPC batches
     * @private
     */
    _createNPCBatches(npcs, batchSize) {
        const batches = [];
        for (let i = 0; i < npcs.length; i += batchSize) {
            batches.push(npcs.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Process multiple batches (parallel or sequential)
     * @param {Array} npcBatches - Array of NPC batches
     * @param {Object} worldState - World state
     * @param {Object} batchConfig - Batch configuration
     * @param {string} batchId - Batch identifier
     * @returns {Promise<Array>} Array of batch results
     * @private
     */
    async _processBatches(npcBatches, worldState, batchConfig, batchId) {
        if (batchConfig.enableParallelProcessing && npcBatches.length > 1) {
            return await this._processParallelBatches(npcBatches, worldState, batchConfig, batchId);
        } else {
            return await this._processSequentialBatches(npcBatches, worldState, batchConfig, batchId);
        }
    }

    /**
     * Process batches in parallel
     * @param {Array} npcBatches - Array of NPC batches
     * @param {Object} worldState - World state
     * @param {Object} batchConfig - Batch configuration
     * @param {string} batchId - Batch identifier
     * @returns {Promise<Array>} Array of batch results
     * @private
     */
    async _processParallelBatches(npcBatches, worldState, batchConfig, batchId) {
        const maxConcurrent = Math.min(batchConfig.maxParallelBatches, npcBatches.length);
        const results = [];

        // Process batches in chunks to limit concurrency
        for (let i = 0; i < npcBatches.length; i += maxConcurrent) {
            const batchChunk = npcBatches.slice(i, i + maxConcurrent);
            
            const chunkPromises = batchChunk.map((batch, chunkIndex) => 
                this._processSingleBatch(
                    batch,
                    worldState,
                    batchConfig,
                    `${batchId}_${i + chunkIndex}`
                )
            );

            const chunkResults = await Promise.allSettled(chunkPromises);
            
            chunkResults.forEach((result, chunkIndex) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    results.push({
                        batchIndex: i + chunkIndex,
                        processedNPCs: 0,
                        successfulNPCs: 0,
                        failedNPCs: batchChunk[chunkIndex].length,
                        errors: [{
                            type: 'batch_processing_failure',
                            message: result.reason?.message || 'Unknown batch processing error',
                            timestamp: Date.now()
                        }],
                        processingTime: 0
                    });
                }
            });
        }

        return results;
    }

    /**
     * Process batches sequentially
     * @param {Array} npcBatches - Array of NPC batches
     * @param {Object} worldState - World state
     * @param {Object} batchConfig - Batch configuration
     * @param {string} batchId - Batch identifier
     * @returns {Promise<Array>} Array of batch results
     * @private
     */
    async _processSequentialBatches(npcBatches, worldState, batchConfig, batchId) {
        const results = [];

        for (let i = 0; i < npcBatches.length; i++) {
            try {
                const batchResult = await this._processSingleBatch(
                    npcBatches[i],
                    worldState,
                    batchConfig,
                    `${batchId}_${i}`
                );

                results.push(batchResult);

                if (batchConfig.enableProgressReporting && this.logger) {
                    const progress = ((i + 1) / npcBatches.length * 100).toFixed(1);
                    this.logger.info(`Batch progress: ${progress}% (batch ${i + 1}/${npcBatches.length})`);
                }

            } catch (error) {
                results.push({
                    batchIndex: i,
                    processedNPCs: 0,
                    successfulNPCs: 0,
                    failedNPCs: npcBatches[i].length,
                    errors: [{
                        type: 'batch_processing_failure',
                        message: error.message,
                        timestamp: Date.now()
                    }],
                    processingTime: 0
                });

                if (this.logger) {
                    this.logger.warn(`Sequential batch ${i} failed: ${error.message}`);
                }
            }
        }

        return results;
    }

    /**
     * Process a single batch of NPCs
     * @param {Array} npcs - NPCs in this batch
     * @param {Object} worldState - World state
     * @param {Object} batchConfig - Batch configuration
     * @param {string} batchId - Batch identifier
     * @returns {Promise<Object>} Batch processing result
     * @private
     */
    async _processSingleBatch(npcs, worldState, batchConfig, batchId) {
        const startTime = Date.now();
        
        const result = {
            batchId,
            batchIndex: parseInt(batchId.split('_').pop()),
            processedNPCs: 0,
            successfulNPCs: 0,
            failedNPCs: 0,
            errors: [],
            processingTime: 0
        };

        try {
            // Create timeout promise if timeout is configured
            const timeoutPromise = batchConfig.processingTimeout > 0 
                ? new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Batch processing timeout')), batchConfig.processingTimeout)
                )
                : null;

            // Create processing promise
            const processingPromise = this.turnProcessor.processTurn(npcs, worldState, {
                batchId,
                batchProcessing: true
            });

            // Race between processing and timeout
            const turnResult = timeoutPromise 
                ? await Promise.race([processingPromise, timeoutPromise])
                : await processingPromise;

            // Aggregate results
            result.processedNPCs = turnResult.processedCharacters || 0;
            result.successfulNPCs = result.processedNPCs - (turnResult.errors?.length || 0);
            result.failedNPCs = turnResult.errors?.length || 0;
            result.cachedStatesUsed = turnResult.cachedStatesUsed || 0;
            result.errors = turnResult.errors || [];

            const endTime = Date.now();
            result.processingTime = endTime - startTime;

            return result;

        } catch (error) {
            const endTime = Date.now();
            result.processingTime = endTime - startTime;
            result.failedNPCs = npcs.length;
            result.errors.push({
                type: 'batch_processing_failure',
                message: error.message,
                timestamp: Date.now()
            });

            return result;
        }
    }

    /**
     * Generate unique batch ID
     * @returns {string} Batch identifier
     * @private
     */
    generateBatchId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate unique parallel processing ID
     * @returns {string} Parallel processing identifier
     * @private
     */
    generateParallelId() {
        return `parallel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate unique checkpoint ID
     * @returns {string} Checkpoint identifier
     * @private
     */
    generateCheckpointId() {
        return `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Calculate batch performance metrics
     * @param {Object} results - Batch results
     * @param {number} totalTime - Total processing time
     * @param {Object} batchConfig - Batch configuration
     * @returns {Object} Performance metrics
     * @private
     */
    _calculateBatchPerformanceMetrics(results, totalTime, batchConfig) {
        const successRate = results.totalNPCs > 0 ? (results.successfulNPCs / results.totalNPCs) : 0;
        const averageTimePerNPC = results.processedNPCs > 0 ? (totalTime / results.processedNPCs) : 0;
        const processingRate = totalTime > 0 ? (results.processedNPCs / (totalTime / 1000)) : 0;

        return {
            totalProcessingTime: totalTime,
            averageTimePerNPC,
            processingRate,
            successRate,
            errorRate: 1 - successRate,
            batchCount: results.batches.length,
            parallelProcessingUsed: batchConfig.enableParallelProcessing,
            averageBatchTime: results.batches.length > 0 
                ? results.batches.reduce((sum, batch) => sum + batch.processingTime, 0) / results.batches.length
                : 0,
            cacheHitRate: results.totalNPCs > 0 ? (results.cachedStatesUsed / results.totalNPCs) : 0
        };
    }

    /**
     * Update global performance metrics
     * @param {Object} results - Batch results
     * @private
     */
    _updateGlobalPerformanceMetrics(results) {
        this.performanceMetrics.totalBatchesProcessed++;
        this.performanceMetrics.totalNPCsProcessed += results.processedNPCs;
        this.performanceMetrics.totalProcessingTime += results.performanceMetrics.totalProcessingTime;
        
        // Update averages
        this.performanceMetrics.averageBatchTime = 
            this.performanceMetrics.totalProcessingTime / this.performanceMetrics.totalBatchesProcessed;
        
        // Update error rate
        const totalErrors = results.errors.length;
        const totalOperations = results.totalNPCs;
        this.performanceMetrics.errorRate = totalOperations > 0 ? (totalErrors / totalOperations) : 0;
    }

    /**
     * Get current performance metrics
     * @returns {Object} Current performance metrics
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    /**
     * Get current configuration
     * @returns {Object} Current configuration
     */
    getConfiguration() {
        return { ...this.config };
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration values
     */
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Reset performance metrics
     */
    resetPerformanceMetrics() {
        this.performanceMetrics = {
            totalBatchesProcessed: 0,
            totalNPCsProcessed: 0,
            totalProcessingTime: 0,
            averageBatchTime: 0,
            parallelEfficiencyRatio: 0,
            errorRate: 0,
            checkpointOperations: 0
        };

        this.errorTracking = {
            batchErrors: [],
            npcErrors: [],
            checkpointErrors: [],
            recoveryAttempts: 0
        };
    }

    /**
     * Validate update requests for parallel processing
     * @param {Array} updateRequests - Update requests to validate
     * @private
     */
    _validateUpdateRequests(updateRequests) {
        if (!Array.isArray(updateRequests)) {
            throw new Error('Update requests must be provided as an array');
        }

        if (updateRequests.length === 0) {
            throw new Error('At least one update request must be provided');
        }

        updateRequests.forEach((request, index) => {
            if (!request || typeof request !== 'object') {
                throw new Error(`Update request at index ${index} is not a valid object`);
            }

            if (!request.character || !request.character.id) {
                throw new Error(`Update request at index ${index} is missing character with id`);
            }

            if (!request.event || !request.event.type) {
                throw new Error(`Update request at index ${index} is missing event with type`);
            }
        });
    }

    /**
     * Configure parallel processing based on options
     * @param {Object} options - Processing options
     * @returns {Object} Parallel configuration
     * @private
     */
    _configureParallelProcessing(options) {
        return {
            maxParallelGroups: options.maxParallelGroups || this.config.maxParallelBatches,
            enableProgressReporting: options.enableProgressReporting !== false && this.config.enableProgressReporting,
            processingTimeout: options.processingTimeout || this.config.processingTimeout,
            errorRecoveryEnabled: options.errorRecoveryEnabled !== false && this.config.errorRecoveryEnabled
        };
    }

    /**
     * Group update requests by independence (NPCs that don't affect each other)
     * @param {Array} updateRequests - Update requests to group
     * @returns {Array} Array of independent groups
     * @private
     */
    _groupIndependentUpdates(updateRequests) {
        const groups = [];
        const processedCharacters = new Set();

        updateRequests.forEach(request => {
            const characterId = request.character.id;
            
            // Check if this character affects or is affected by others in existing groups
            let assignedToGroup = false;
            
            for (const group of groups) {
                const hasConflict = group.some(groupRequest => 
                    this._checkUpdateConflict(request, groupRequest)
                );
                
                if (!hasConflict) {
                    group.push(request);
                    assignedToGroup = true;
                    break;
                }
            }
            
            // If no suitable group found, create new group
            if (!assignedToGroup) {
                groups.push([request]);
            }
            
            processedCharacters.add(characterId);
        });

        return groups;
    }

    /**
     * Check if two update requests conflict (affect same or related NPCs)
     * @param {Object} request1 - First update request
     * @param {Object} request2 - Second update request
     * @returns {boolean} True if requests conflict
     * @private
     */
    _checkUpdateConflict(request1, request2) {
        const char1Id = request1.character.id;
        const char2Id = request2.character.id;
        
        // Same character - definitely conflicts
        if (char1Id === char2Id) {
            return true;
        }
        
        // Check if characters are in same location (potential interaction)
        const char1Location = request1.character.currentNodeId;
        const char2Location = request2.character.currentNodeId;
        
        if (char1Location && char2Location && char1Location === char2Location) {
            return true;
        }
        
        // Check if characters have relationships (potential influence)
        const char1Relationships = request1.character.relationships || new Map();
        const char2Relationships = request2.character.relationships || new Map();
        
        if (char1Relationships.has(char2Id) || char2Relationships.has(char1Id)) {
            return true;
        }
        
        // Check if events involve the same participants
        const event1Participants = request1.event.participants || [];
        const event2Participants = request2.event.participants || [];
        
        const hasSharedParticipants = event1Participants.some(p => 
            event2Participants.includes(p) || p === char2Id
        ) || event2Participants.some(p => p === char1Id);
        
        if (hasSharedParticipants) {
            return true;
        }
        
        return false;
    }

    /**
     * Process a group of independent updates
     * @param {Array} updateGroup - Group of update requests
     * @param {Object} parallelConfig - Parallel configuration
     * @param {string} parallelId - Parallel processing identifier
     * @returns {Promise<Object>} Group processing result
     * @private
     */
    async _processUpdateGroup(updateGroup, parallelConfig, parallelId) {
        const startTime = Date.now();
        const groupId = `${parallelId}_group_${Math.random().toString(36).substr(2, 6)}`;
        
        const result = {
            groupId,
            processedUpdates: 0,
            successfulUpdates: 0,
            failedUpdates: 0,
            updateResults: [],
            errors: [],
            processingTime: 0
        };

        try {
            // Process all updates in this group in parallel (they're independent)
            const updatePromises = updateGroup.map(request => 
                this._processSingleUpdate(request, parallelConfig)
            );

            const updateResults = await Promise.allSettled(updatePromises);
            
            updateResults.forEach((updateResult, index) => {
                result.processedUpdates++;
                
                if (updateResult.status === 'fulfilled') {
                    result.successfulUpdates++;
                    result.updateResults.push(updateResult.value);
                } else {
                    result.failedUpdates++;
                    result.errors.push({
                        type: 'update_processing_failure',
                        characterId: updateGroup[index].character.id,
                        message: updateResult.reason?.message || 'Unknown update processing error',
                        timestamp: Date.now()
                    });
                }
            });

            const endTime = Date.now();
            result.processingTime = endTime - startTime;

            return result;

        } catch (error) {
            const endTime = Date.now();
            result.processingTime = endTime - startTime;
            result.failedUpdates = updateGroup.length;
            result.errors.push({
                type: 'group_processing_error',
                message: error.message,
                timestamp: Date.now()
            });

            return result;
        }
    }

    /**
     * Process a single consciousness update
     * @param {Object} updateRequest - Update request
     * @param {Object} parallelConfig - Parallel configuration
     * @returns {Promise<Object>} Update result
     * @private
     */
    async _processSingleUpdate(updateRequest, parallelConfig) {
        const startTime = Date.now();
        
        try {
            // Create timeout promise if timeout is configured
            const timeoutPromise = parallelConfig.processingTimeout > 0 
                ? new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Update processing timeout')), parallelConfig.processingTimeout)
                )
                : null;

            // Create update promise
            const updatePromise = this.consciousnessUpdateService.processEvent(
                updateRequest.character,
                updateRequest.event,
                updateRequest.context || {}
            );

            // Race between update and timeout
            const updateResult = timeoutPromise 
                ? await Promise.race([updatePromise, timeoutPromise])
                : await updatePromise;

            const endTime = Date.now();
            
            return {
                characterId: updateRequest.character.id,
                eventType: updateRequest.event.type,
                success: updateResult.success,
                updated: updateResult.updated,
                changes: updateResult.changes,
                processingTime: endTime - startTime,
                timestamp: Date.now()
            };

        } catch (error) {
            const endTime = Date.now();
            
            return {
                characterId: updateRequest.character.id,
                eventType: updateRequest.event.type,
                success: false,
                updated: false,
                error: error.message,
                processingTime: endTime - startTime,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Calculate parallel processing performance metrics
     * @param {Object} results - Parallel processing results
     * @param {number} totalTime - Total processing time
     * @param {Object} parallelConfig - Parallel configuration
     * @returns {Object} Performance metrics
     * @private
     */
    _calculateParallelPerformanceMetrics(results, totalTime, parallelConfig) {
        const successRate = results.totalUpdates > 0 ? (results.successfulUpdates / results.totalUpdates) : 0;
        const averageTimePerUpdate = results.processedUpdates > 0 ? (totalTime / results.processedUpdates) : 0;
        const processingRate = totalTime > 0 ? (results.processedUpdates / (totalTime / 1000)) : 0;

        return {
            totalProcessingTime: totalTime,
            averageTimePerUpdate,
            processingRate,
            successRate,
            errorRate: 1 - successRate,
            parallelEfficiency: this._calculateParallelEfficiency(results, totalTime)
        };
    }

    /**
     * Calculate parallel processing efficiency
     * @param {Object} results - Processing results
     * @param {number} totalTime - Total processing time
     * @returns {number} Efficiency ratio (0-1)
     * @private
     */
    _calculateParallelEfficiency(results, totalTime) {
        if (results.updateResults.length === 0) {
            return 0;
        }

        // Calculate theoretical sequential time
        const totalSequentialTime = results.updateResults.reduce(
            (sum, result) => sum + (result.processingTime || 0), 0
        );

        // Efficiency is the ratio of sequential time to actual parallel time
        return totalSequentialTime > 0 ? Math.min(1, totalSequentialTime / totalTime) : 0;
    }

    /**
     * Configure checkpoint processing based on options
     * @param {Object} options - Checkpoint options
     * @returns {Object} Checkpoint configuration
     * @private
     */
    _configureCheckpointProcessing(options) {
        return {
            batchSize: options.batchSize || this.config.checkpointBatchSize,
            enableProgressReporting: options.enableProgressReporting !== false && this.config.enableProgressReporting,
            enableCompression: options.enableCompression || false,
            enableValidation: options.enableValidation !== false,
            maxRetries: options.maxRetries || 3
        };
    }

    /**
     * Create checkpoint batches
     * @param {Array} npcs - NPCs to checkpoint
     * @param {number} batchSize - Size of each batch
     * @returns {Array} Array of checkpoint batches
     * @private
     */
    _createCheckpointBatches(npcs, batchSize) {
        const batches = [];
        for (let i = 0; i < npcs.length; i += batchSize) {
            batches.push(npcs.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Process a single checkpoint batch
     * @param {Array} npcs - NPCs in this batch
     * @param {Object} worldState - World state
     * @param {Object} checkpointConfig - Checkpoint configuration
     * @param {number} batchIndex - Index of this batch
     * @returns {Promise<Object>} Checkpoint batch result
     * @private
     */
    async _processCheckpointBatch(npcs, worldState, checkpointConfig, batchIndex) {
        const startTime = Date.now();
        
        const result = {
            batchIndex,
            checkpointedNPCs: 0,
            batchSize: 0,
            errors: [],
            processingTime: 0,
            retryAttempts: 0
        };

        let attempt = 0;
        const maxRetries = checkpointConfig.maxRetries;

        while (attempt <= maxRetries) {
            try {
                // Create checkpoint for this batch
                const checkpoint = this.checkpointService.saveCheckpoint({
                    npcs: npcs,
                    worldState: worldState,
                    batchIndex: batchIndex,
                    timestamp: Date.now()
                });

                // Validate checkpoint if enabled
                if (checkpointConfig.enableValidation) {
                    const validation = this._validateCheckpoint(checkpoint, npcs);
                    if (!validation.isValid) {
                        throw new Error(`Checkpoint validation failed: ${validation.errors.join(', ')}`);
                    }
                }

                // Calculate checkpoint size
                const checkpointSize = this._calculateCheckpointSize(checkpoint);

                result.checkpointedNPCs = npcs.length;
                result.batchSize = checkpointSize;
                result.retryAttempts = attempt;

                const endTime = Date.now();
                result.processingTime = endTime - startTime;

                return result;

            } catch (error) {
                attempt++;
                result.retryAttempts = attempt;

                if (attempt > maxRetries) {
                    result.errors.push({
                        type: 'checkpoint_batch_failure',
                        message: error.message,
                        finalAttempt: true,
                        timestamp: Date.now()
                    });

                    const endTime = Date.now();
                    result.processingTime = endTime - startTime;

                    return result;
                } else {
                    // Log retry attempt
                    if (this.logger) {
                        this.logger.warn(`Checkpoint batch ${batchIndex} failed, retrying (attempt ${attempt}/${maxRetries}): ${error.message}`);
                    }

                    // Wait before retry (exponential backoff)
                    const currentAttempt = attempt;
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, currentAttempt) * 1000));
                }
            }
        }

        return result;
    }

    /**
     * Validate checkpoint data
     * @param {Object} checkpoint - Checkpoint to validate
     * @param {Array} originalNPCs - Original NPCs that were checkpointed
     * @returns {Object} Validation result
     * @private
     */
    _validateCheckpoint(checkpoint, originalNPCs) {
        const errors = [];

        if (!checkpoint || typeof checkpoint !== 'object') {
            errors.push('Checkpoint is not a valid object');
            return { isValid: false, errors };
        }

        if (!checkpoint.characterStates) {
            errors.push('Checkpoint missing character states');
            return { isValid: false, errors };
        }

        // Validate that all NPCs are represented in checkpoint
        originalNPCs.forEach(npc => {
            if (!checkpoint.characterStates.has || !checkpoint.characterStates.has(npc.id)) {
                errors.push(`Missing checkpoint data for NPC ${npc.id}`);
            }
        });

        // Validate checkpoint structure
        if (checkpoint.characterStates.forEach) {
            checkpoint.characterStates.forEach((state, npcId) => {
                if (!state || typeof state !== 'object') {
                    errors.push(`Invalid state data for NPC ${npcId}`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Calculate checkpoint size (approximate)
     * @param {Object} checkpoint - Checkpoint data
     * @returns {number} Approximate size in bytes
     * @private
     */
    _calculateCheckpointSize(checkpoint) {
        try {
            const checkpointString = JSON.stringify(checkpoint);
            return checkpointString.length;
        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error calculating checkpoint size: ${error.message}`);
            }
            return 0;
        }
    }

    /**
     * Calculate checkpoint performance metrics
     * @param {Object} results - Checkpoint results
     * @param {number} totalTime - Total processing time
     * @param {Object} checkpointConfig - Checkpoint configuration
     * @returns {Object} Performance metrics
     * @private
     */
    _calculateCheckpointPerformanceMetrics(results, totalTime, checkpointConfig) {
        const successRate = results.totalNPCs > 0 ? (results.checkpointedNPCs / results.totalNPCs) : 0;
        const averageTimePerNPC = results.checkpointedNPCs > 0 ? (totalTime / results.checkpointedNPCs) : 0;
        const averageBatchSize = results.checkpointBatches.length > 0 
            ? results.checkpointBatches.reduce((sum, batch) => sum + batch.batchSize, 0) / results.checkpointBatches.length
            : 0;

        return {
            totalProcessingTime: totalTime,
            averageTimePerNPC,
            successRate,
            errorRate: 1 - successRate,
            batchCount: results.checkpointBatches.length,
            averageBatchSize,
            totalCheckpointSize: results.checkpointSize,
            averageRetryAttempts: results.checkpointBatches.length > 0
                ? results.checkpointBatches.reduce((sum, batch) => sum + batch.retryAttempts, 0) / results.checkpointBatches.length
                : 0
        };
    }

    /**
     * Attempt batch recovery after failure
     * @param {Array} npcs - Original NPCs
     * @param {Object} worldState - World state
     * @param {Object} options - Original options
     * @param {Error} originalError - Original error that caused failure
     * @returns {Promise<Object>} Recovery result
     * @private
     */
    async _attemptBatchRecovery(npcs, worldState, options, originalError) {
        this.errorTracking.recoveryAttempts++;

        try {
            if (this.logger) {
                this.logger.info(`Attempting batch recovery for ${npcs.length} NPCs after error: ${originalError.message}`);
            }

            // Try with smaller batch size and no parallel processing
            const recoveryOptions = {
                ...options,
                batchSize: Math.min(10, Math.ceil(npcs.length / 10)),
                enableParallelProcessing: false,
                enableCheckpointing: false,
                errorRecoveryEnabled: false, // Prevent infinite recursion
                isRecoveryAttempt: true, // Additional flag to prevent recursion
                processingTimeout: (options.processingTimeout || this.config.processingTimeout) * 2 // Double timeout
            };

            const recoveryResult = await this.processBatch(npcs, worldState, recoveryOptions);

            return {
                success: recoveryResult.successfulNPCs > 0,
                processedNPCs: recoveryResult.successfulNPCs,
                totalNPCs: npcs.length,
                recoveryOptions,
                originalError: originalError.message
            };

        } catch (recoveryError) {
            if (this.logger) {
                this.logger.error(`Batch recovery failed: ${recoveryError.message}`);
            }

            return {
                success: false,
                processedNPCs: 0,
                totalNPCs: npcs.length,
                recoveryError: recoveryError.message,
                originalError: originalError.message
            };
        }
    }

    /**
     * Get error tracking information
     * @returns {Object} Error tracking data
     */
    getErrorTracking() {
        return { ...this.errorTracking };
    }

    /**
     * Clear error tracking history
     */
    clearErrorTracking() {
        this.errorTracking = {
            batchErrors: [],
            npcErrors: [],
            checkpointErrors: [],
            recoveryAttempts: 0
        };
    }
}

export default BatchProcessingService;