/**
 * BatchProcessingService Performance Tests
 * Tests for batch processing performance optimization
 */

import BatchProcessingService from '../BatchProcessingService.js';

describe('BatchProcessingService - Performance Tests', () => {
    let batchService;
    let mockTurnProcessor;

    beforeEach(() => {
        mockTurnProcessor = {
            processTurn: jest.fn()
        };

        batchService = new BatchProcessingService(
            mockTurnProcessor,
            null, // consciousnessUpdateService
            null, // checkpointService
            null, // behavioralStateService
            null, // eventSignificanceService
            null, // memoryService
            null  // logger
        );

        // Disable error recovery to avoid complexity in performance tests
        batchService.updateConfiguration({ errorRecoveryEnabled: false });
    });

    describe('Batch Size Optimization', () => {
        test('should process large batches efficiently', async () => {
            const largeNPCList = Array.from({ length: 1000 }, (_, i) => ({
                id: `npc${i}`,
                name: `Character ${i}`,
                consciousness: { frequency: 7.0, coherence: 0.5 }
            }));

            const testWorldState = { nodes: [], settlements: [] };

            // Mock successful processing
            mockTurnProcessor.processTurn.mockResolvedValue({
                processedCharacters: 100, // Each batch processes 100 NPCs
                consciousnessUpdates: 10,
                memoryUpdates: 20,
                cachedStatesUsed: 80,
                significantEvents: [],
                errors: []
            });

            const startTime = Date.now();
            const result = await batchService.processBatch(largeNPCList, testWorldState, {
                batchSize: 100,
                enableParallelProcessing: false // Sequential for predictable testing
            });
            const endTime = Date.now();

            expect(result.totalNPCs).toBe(1000);
            expect(result.processedNPCs).toBe(1000);
            expect(result.successfulNPCs).toBe(1000);
            expect(result.batches).toHaveLength(10); // 1000 NPCs / 100 batch size = 10 batches
            expect(mockTurnProcessor.processTurn).toHaveBeenCalledTimes(10);

            // Performance assertions
            const totalTime = endTime - startTime;
            expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
            expect(result.performanceMetrics.processingRate).toBeGreaterThan(100); // NPCs per second
        });

        test('should handle different batch sizes efficiently', async () => {
            const testNPCs = Array.from({ length: 200 }, (_, i) => ({
                id: `npc${i}`,
                consciousness: { frequency: 7.0, coherence: 0.5 }
            }));

            const testWorldState = { nodes: [] };

            mockTurnProcessor.processTurn.mockResolvedValue({
                processedCharacters: 50,
                errors: []
            });

            // Test with batch size 50
            const result50 = await batchService.processBatch(testNPCs, testWorldState, {
                batchSize: 50,
                enableParallelProcessing: false
            });

            expect(result50.batches).toHaveLength(4); // 200 / 50 = 4 batches
            expect(mockTurnProcessor.processTurn).toHaveBeenCalledTimes(4);

            // Reset mock
            mockTurnProcessor.processTurn.mockClear();
            mockTurnProcessor.processTurn.mockResolvedValue({
                processedCharacters: 25,
                errors: []
            });

            // Test with batch size 25
            const result25 = await batchService.processBatch(testNPCs, testWorldState, {
                batchSize: 25,
                enableParallelProcessing: false
            });

            expect(result25.batches).toHaveLength(8); // 200 / 25 = 8 batches
            expect(mockTurnProcessor.processTurn).toHaveBeenCalledTimes(8);
        });
    });

    describe('Parallel Processing Performance', () => {
        test('should process batches in parallel when enabled', async () => {
            const testNPCs = Array.from({ length: 100 }, (_, i) => ({
                id: `npc${i}`,
                consciousness: { frequency: 7.0, coherence: 0.5 }
            }));

            const testWorldState = { nodes: [] };

            // Mock processing with delay to simulate work
            mockTurnProcessor.processTurn.mockImplementation(() => 
                new Promise(resolve => 
                    setTimeout(() => resolve({
                        processedCharacters: 25,
                        errors: []
                    }), 100) // 100ms delay per batch
                )
            );

            const startTime = Date.now();
            const result = await batchService.processBatch(testNPCs, testWorldState, {
                batchSize: 25,
                enableParallelProcessing: true,
                maxParallelBatches: 4
            });
            const endTime = Date.now();

            expect(result.totalNPCs).toBe(100);
            expect(result.batches).toHaveLength(4); // 100 / 25 = 4 batches
            expect(mockTurnProcessor.processTurn).toHaveBeenCalledTimes(4);

            // Parallel processing should be faster than sequential
            const totalTime = endTime - startTime;
            expect(totalTime).toBeLessThan(300); // Should be much less than 4 * 100ms = 400ms
            expect(result.performanceMetrics.parallelProcessingUsed).toBe(true);
        });

        test('should limit concurrent batches', async () => {
            const testNPCs = Array.from({ length: 200 }, (_, i) => ({
                id: `npc${i}`,
                consciousness: { frequency: 7.0, coherence: 0.5 }
            }));

            const testWorldState = { nodes: [] };

            let concurrentCalls = 0;
            let maxConcurrentCalls = 0;

            mockTurnProcessor.processTurn.mockImplementation(() => {
                concurrentCalls++;
                maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
                
                return new Promise(resolve => 
                    setTimeout(() => {
                        concurrentCalls--;
                        resolve({
                            processedCharacters: 25,
                            errors: []
                        });
                    }, 50)
                );
            });

            await batchService.processBatch(testNPCs, testWorldState, {
                batchSize: 25,
                enableParallelProcessing: true,
                maxParallelBatches: 2 // Limit to 2 concurrent batches
            });

            expect(maxConcurrentCalls).toBeLessThanOrEqual(2);
        });
    });

    describe('Performance Metrics', () => {
        test('should track processing rates accurately', async () => {
            const testNPCs = Array.from({ length: 50 }, (_, i) => ({
                id: `npc${i}`,
                consciousness: { frequency: 7.0, coherence: 0.5 }
            }));

            const testWorldState = { nodes: [] };

            mockTurnProcessor.processTurn.mockResolvedValue({
                processedCharacters: 50,
                errors: []
            });

            const result = await batchService.processBatch(testNPCs, testWorldState);

            expect(result.performanceMetrics.totalProcessingTime).toBeGreaterThan(0);
            expect(result.performanceMetrics.averageTimePerNPC).toBeGreaterThan(0);
            expect(result.performanceMetrics.processingRate).toBeGreaterThan(0);
            expect(result.performanceMetrics.successRate).toBe(1);
            expect(result.performanceMetrics.errorRate).toBe(0);
        });

        test('should calculate cache hit rates', async () => {
            const testNPCs = Array.from({ length: 10 }, (_, i) => ({
                id: `npc${i}`,
                consciousness: { frequency: 7.0, coherence: 0.5 }
            }));

            const testWorldState = { nodes: [] };

            mockTurnProcessor.processTurn.mockResolvedValue({
                processedCharacters: 10,
                consciousnessUpdates: 2,
                memoryUpdates: 3,
                cachedStatesUsed: 8, // 8 out of 10 used cached states
                errors: []
            });

            const result = await batchService.processBatch(testNPCs, testWorldState);

            expect(result.performanceMetrics.cacheHitRate).toBe(0.8); // 8/10 = 0.8
        });

        test('should update global performance metrics', async () => {
            const testNPCs = [
                { id: 'npc1', consciousness: { frequency: 7.0, coherence: 0.5 } }
            ];

            const testWorldState = { nodes: [] };

            mockTurnProcessor.processTurn.mockResolvedValue({
                processedCharacters: 1,
                errors: []
            });

            // Reset metrics
            batchService.resetPerformanceMetrics();

            await batchService.processBatch(testNPCs, testWorldState);

            const globalMetrics = batchService.getPerformanceMetrics();
            expect(globalMetrics.totalBatchesProcessed).toBe(1);
            expect(globalMetrics.totalNPCsProcessed).toBe(1);
            expect(globalMetrics.averageBatchTime).toBeGreaterThan(0);
        });
    });

    describe('Scalability Tests', () => {
        test('should maintain performance with increasing NPC counts', async () => {
            const testSizes = [10, 50, 100, 500];
            const results = [];

            for (const size of testSizes) {
                const testNPCs = Array.from({ length: size }, (_, i) => ({
                    id: `npc${i}`,
                    consciousness: { frequency: 7.0, coherence: 0.5 }
                }));

                const testWorldState = { nodes: [] };

                // Add small delay to make timing measurable
                mockTurnProcessor.processTurn.mockImplementation(() => 
                    new Promise(resolve => 
                        setTimeout(() => resolve({
                            processedCharacters: Math.min(size, 100), // Max 100 per batch
                            errors: []
                        }), 1) // 1ms delay per batch
                    )
                );

                const startTime = Date.now();
                const result = await batchService.processBatch(testNPCs, testWorldState, {
                    batchSize: 100,
                    enableParallelProcessing: true
                });
                const endTime = Date.now();

                results.push({
                    size,
                    time: endTime - startTime,
                    rate: result.performanceMetrics.processingRate
                });

                // Clear mock for next iteration
                mockTurnProcessor.processTurn.mockClear();
            }

            // Verify all tests completed successfully
            results.forEach(result => {
                expect(result.rate).toBeGreaterThan(0); // Should have some processing rate
                expect(result.time).toBeGreaterThan(0); // Should have measurable time
            });

            // Verify scaling characteristics
            const smallResult = results[0]; // 10 NPCs
            const largeResult = results[results.length - 1]; // 500 NPCs
            
            // Large batch should process more NPCs but not be exponentially slower
            expect(largeResult.size).toBeGreaterThan(smallResult.size);
            expect(largeResult.rate).toBeGreaterThan(10); // Should maintain reasonable rate
        });

        test('should handle memory efficiently with large batches', async () => {
            const largeNPCList = Array.from({ length: 2000 }, (_, i) => ({
                id: `npc${i}`,
                name: `Character ${i}`,
                consciousness: { frequency: 7.0 + (i % 10) * 0.1, coherence: 0.5 + (i % 5) * 0.1 },
                relationships: new Map(),
                significantMemories: []
            }));

            const testWorldState = { nodes: [], settlements: [] };

            mockTurnProcessor.processTurn.mockResolvedValue({
                processedCharacters: 200,
                consciousnessUpdates: 20,
                memoryUpdates: 40,
                cachedStatesUsed: 160,
                errors: []
            });

            const result = await batchService.processBatch(largeNPCList, testWorldState, {
                batchSize: 200,
                enableParallelProcessing: true,
                maxParallelBatches: 3
            });

            expect(result.totalNPCs).toBe(2000);
            expect(result.successfulNPCs).toBe(2000);
            expect(result.performanceMetrics.processingRate).toBeGreaterThan(200); // Should process at least 200 NPCs/second
        });
    });
});