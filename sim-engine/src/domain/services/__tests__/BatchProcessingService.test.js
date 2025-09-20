/**
 * Simple BatchProcessingService Tests
 * Testing basic functionality without complex error recovery
 */

import BatchProcessingService from '../BatchProcessingService.js';

describe('BatchProcessingService - Simple Tests', () => {
    let batchService;
    let mockTurnProcessor;
    let mockLogger;

    beforeEach(() => {
        mockTurnProcessor = {
            processTurn: jest.fn()
        };

        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        batchService = new BatchProcessingService(
            mockTurnProcessor,
            null, // consciousnessUpdateService
            null, // checkpointService
            null, // behavioralStateService
            null, // eventSignificanceService
            null, // memoryService
            mockLogger
        );

        // Disable error recovery to avoid recursion issues in tests
        batchService.updateConfiguration({ errorRecoveryEnabled: false });
    });

    describe('Basic Functionality', () => {
        test('should initialize with default configuration', () => {
            const service = new BatchProcessingService();
            const config = service.getConfiguration();

            expect(config.maxBatchSize).toBe(100);
            expect(config.maxParallelBatches).toBe(4);
            expect(config.enableParallelProcessing).toBe(true);
        });

        test('should process batch successfully', async () => {
            const testNPCs = [
                { id: 'npc1', name: 'Character 1' },
                { id: 'npc2', name: 'Character 2' }
            ];

            const testWorldState = { nodes: [], settlements: [] };

            mockTurnProcessor.processTurn.mockResolvedValue({
                processedCharacters: 2,
                consciousnessUpdates: 1,
                memoryUpdates: 1,
                cachedStatesUsed: 1,
                significantEvents: [],
                errors: []
            });

            const result = await batchService.processBatch(testNPCs, testWorldState);

            expect(result.totalNPCs).toBe(2);
            expect(result.processedNPCs).toBe(2);
            expect(result.successfulNPCs).toBe(2);
            expect(result.failedNPCs).toBe(0);
            expect(mockTurnProcessor.processTurn).toHaveBeenCalled();
        });

        test('should validate inputs', async () => {
            const testWorldState = { nodes: [] };

            await expect(batchService.processBatch(null, testWorldState))
                .rejects.toThrow('NPCs must be provided as an array');

            await expect(batchService.processBatch([], testWorldState))
                .rejects.toThrow('At least one NPC must be provided');
        });

        test('should handle processing errors without recovery', async () => {
            const testNPCs = [{ id: 'npc1', name: 'Character 1' }];
            const testWorldState = { nodes: [] };

            mockTurnProcessor.processTurn.mockRejectedValue(new Error('Processing failed'));

            const result = await batchService.processBatch(testNPCs, testWorldState);

            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe('batch_processing_failure');
            expect(result.successfulNPCs).toBe(0);
            expect(result.recoveryAttempted).toBeUndefined(); // No recovery attempted
        });

        test('should calculate performance metrics', async () => {
            const testNPCs = [{ id: 'npc1', name: 'Character 1' }];
            const testWorldState = { nodes: [] };

            mockTurnProcessor.processTurn.mockResolvedValue({
                processedCharacters: 1,
                errors: []
            });

            const result = await batchService.processBatch(testNPCs, testWorldState);

            expect(result.performanceMetrics).toBeDefined();
            expect(result.performanceMetrics.totalProcessingTime).toBeGreaterThan(0);
            expect(result.performanceMetrics.successRate).toBe(1);
        });
    });

    describe('Configuration', () => {
        test('should allow configuration updates', () => {
            const newConfig = {
                maxBatchSize: 50,
                maxParallelBatches: 2
            };

            batchService.updateConfiguration(newConfig);
            const config = batchService.getConfiguration();

            expect(config.maxBatchSize).toBe(50);
            expect(config.maxParallelBatches).toBe(2);
        });

        test('should reset performance metrics', () => {
            batchService.performanceMetrics.totalBatchesProcessed = 5;
            batchService.resetPerformanceMetrics();

            const metrics = batchService.getPerformanceMetrics();
            expect(metrics.totalBatchesProcessed).toBe(0);
        });
    });

    describe('ID Generation', () => {
        test('should generate unique batch IDs', () => {
            const id1 = batchService.generateBatchId();
            const id2 = batchService.generateBatchId();

            expect(id1).toMatch(/^batch_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^batch_\d+_[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });

        test('should generate unique parallel IDs', () => {
            const id1 = batchService.generateParallelId();
            const id2 = batchService.generateParallelId();

            expect(id1).toMatch(/^parallel_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^parallel_\d+_[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });

        test('should generate unique checkpoint IDs', () => {
            const id1 = batchService.generateCheckpointId();
            const id2 = batchService.generateCheckpointId();

            expect(id1).toMatch(/^checkpoint_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^checkpoint_\d+_[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });
    });
});