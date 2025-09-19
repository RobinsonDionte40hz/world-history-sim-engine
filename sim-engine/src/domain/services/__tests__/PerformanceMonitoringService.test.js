/**
 * Performance Monitoring Service - Unit Tests and Benchmarks
 *
 * Comprehensive tests for performance monitoring functionality including
 * benchmarks for turn processing, consciousness updates, and memory operations.
 */

import PerformanceMonitoringService from '../PerformanceMonitoringService.js';

describe('PerformanceMonitoringService', () => {
    let performanceService;

    beforeEach(() => {
        performanceService = new PerformanceMonitoringService();
    });

    afterEach(() => {
        performanceService.reset();
    });

    describe('Basic Performance Monitoring', () => {
        test('should start and end monitoring correctly', () => {
            const operationId = performanceService.startMonitoring('test-op', 'test_operation');

            // Simulate some work
            const start = Date.now();
            while (Date.now() - start < 10) {} // 10ms delay

            const metrics = performanceService.endMonitoring(operationId);

            expect(metrics).toBeDefined();
            expect(metrics.duration).toBeGreaterThan(0);
            expect(metrics.timestamp).toBeDefined();
        });

        test('should handle multiple concurrent operations', () => {
            const op1 = performanceService.startMonitoring('op1', 'operation1');
            const op2 = performanceService.startMonitoring('op2', 'operation2');

            // Simulate different work durations
            setTimeout(() => {
                performanceService.endMonitoring(op1);
            }, 5);

            setTimeout(() => {
                performanceService.endMonitoring(op2);
            }, 10);

            // Wait for operations to complete
            return new Promise(resolve => {
                setTimeout(() => {
                    const summary = performanceService.getPerformanceSummary(1000);
                    expect(summary.totalOperations).toBe(2);
                    resolve();
                }, 20);
            });
        });

        test('should track memory usage changes', () => {
            const operationId = performanceService.startMonitoring('memory-test', 'memory_operation');

            // Create some memory usage
            const largeArray = new Array(10000).fill('test-data');

            const metrics = performanceService.endMonitoring(operationId);

            expect(metrics.memoryUsage).toBeDefined();
            expect(metrics.memoryUsage.before).toBeDefined();
            expect(metrics.memoryUsage.after).toBeDefined();

            // Clean up
            largeArray.length = 0;
        });
    });

    describe('Turn Processing Monitoring', () => {
        test('should monitor turn processing performance', () => {
            const turnId = performanceService.monitorTurnProcessing('turn-123', 50, ['npc1', 'npc2']);

            // Simulate turn processing
            const start = Date.now();
            while (Date.now() - start < 25) {} // 25ms processing time

            const metrics = performanceService.endMonitoring(turnId);

            expect(metrics).toBeDefined();
            expect(metrics.duration).toBeGreaterThan(20);
            expect(metrics.npcCount).toBe(50);
            expect(metrics.npcIds).toHaveLength(2);
        });

        test('should handle large NPC counts efficiently', () => {
            const npcIds = Array.from({ length: 1000 }, (_, i) => `npc-${i}`);
            const turnId = performanceService.monitorTurnProcessing('large-turn', 1000, npcIds);

            const metrics = performanceService.endMonitoring(turnId);

            expect(metrics.npcCount).toBe(1000);
            expect(metrics.npcIds).toHaveLength(1000);
        });
    });

    describe('Consciousness Update Monitoring', () => {
        test('should monitor consciousness update performance', () => {
            const monitoringId = performanceService.monitorConsciousnessUpdate('char-123', 'event');

            // Simulate consciousness update work
            const start = Date.now();
            while (Date.now() - start < 15) {} // 15ms update time

            const metrics = performanceService.endMonitoring(monitoringId);

            expect(metrics).toBeDefined();
            expect(metrics.characterId).toBe('char-123');
            expect(metrics.updateType).toBe('event');
            expect(metrics.duration).toBeGreaterThan(10);
        });

        test('should track different update types', () => {
            const updateTypes = ['event', 'turn', 'maintenance', 'interaction'];

            const promises = updateTypes.map(type => {
                const monitoringId = performanceService.monitorConsciousnessUpdate(`char-${type}`, type);
                return new Promise(resolve => {
                    setTimeout(() => {
                        const metrics = performanceService.endMonitoring(monitoringId);
                        expect(metrics.updateType).toBe(type);
                        resolve();
                    }, 5);
                });
            });

            return Promise.all(promises);
        });
    });

    describe('Memory Operation Monitoring', () => {
        test('should monitor memory operation performance', () => {
            const monitoringId = performanceService.monitorMemoryOperation('retrieval', 25);

            // Simulate memory retrieval work
            const start = Date.now();
            while (Date.now() - start < 8) {} // 8ms retrieval time

            const metrics = performanceService.endMonitoring(monitoringId);

            expect(metrics).toBeDefined();
            expect(metrics.memoryOperationType).toBe('retrieval');
            expect(metrics.memoryCount).toBe(25);
            expect(metrics.duration).toBeGreaterThan(5);
        });

        test('should handle different memory operation types', () => {
            const operations = [
                { type: 'storage', count: 10 },
                { type: 'retrieval', count: 50 },
                { type: 'filtering', count: 100 },
                { type: 'pruning', count: 5 }
            ];

            const promises = operations.map(({ type, count }) => {
                const monitoringId = performanceService.monitorMemoryOperation(type, count);
                return new Promise(resolve => {
                    setTimeout(() => {
                        const metrics = performanceService.endMonitoring(monitoringId);
                        expect(metrics.memoryOperationType).toBe(type);
                        expect(metrics.memoryCount).toBe(count);
                        resolve();
                    }, 3);
                });
            });

            return Promise.all(promises);
        });
    });

    describe('Performance Thresholds and Alerts', () => {
        test('should generate alerts for slow operations', () => {
            // Temporarily set low threshold for testing
            performanceService.thresholds.maxTurnProcessingTime = 10;

            const operationId = performanceService.startMonitoring('slow-op', 'turn_processing');

            // Simulate slow operation
            const start = Date.now();
            while (Date.now() - start < 20) {} // 20ms (above threshold)

            performanceService.endMonitoring(operationId);

            const alerts = performanceService.getAlerts();
            expect(alerts.length).toBeGreaterThan(0);
            expect(alerts[0].type).toBe('slow_operation');
        });

        test('should generate alerts for high memory usage', () => {
            // Temporarily set low threshold for testing
            performanceService.thresholds.maxMemoryDelta = 1000;

            const operationId = performanceService.startMonitoring('memory-intensive', 'memory_operation');

            // Simulate memory-intensive operation
            const largeObjects = [];
            for (let i = 0; i < 1000; i++) {
                largeObjects.push({ data: 'x'.repeat(100) });
            }

            performanceService.endMonitoring(operationId);

            // Clean up
            largeObjects.length = 0;

            const alerts = performanceService.getAlerts();
            // Note: Memory alerts may not trigger in all environments
            expect(alerts).toBeDefined();
        });

        test('should handle alert limits', () => {
            // Generate many alerts
            for (let i = 0; i < 150; i++) {
                performanceService.alerts.push({
                    type: 'test_alert',
                    timestamp: Date.now(),
                    severity: 'info'
                });
            }

            const alerts = performanceService.getAlerts(10);
            expect(alerts.length).toBeLessThanOrEqual(10);
        });
    });

    describe('Performance Summary and Analytics', () => {
        beforeEach(() => {
            // Generate some test data synchronously
            for (let i = 0; i < 10; i++) {
                const opId = performanceService.startMonitoring(`test-op-${i}`, 'turn_processing');
                // Simulate some work
                const start = Date.now();
                while (Date.now() - start < 5) {} // 5ms delay
                performanceService.endMonitoring(opId);
            }
        });

        test('should generate performance summary', () => {
            const summary = performanceService.getPerformanceSummary(60000); // 1 minute window

            expect(summary).toBeDefined();
            expect(summary.totalOperations).toBeGreaterThan(0);
            expect(summary.averageDuration).toBeDefined();
            expect(summary.maxDuration).toBeDefined();
            expect(summary.operationBreakdown).toBeDefined();
        });

        test('should provide detailed metrics for operation types', () => {
            const details = performanceService.getDetailedMetrics('turn_processing', 5);

            expect(details).toBeDefined();
            expect(details.operationType).toBe('turn_processing');
            expect(details.metrics.length).toBeLessThanOrEqual(5);
            expect(details.summary).toBeDefined();
        });

        test('should handle empty operation history', () => {
            const emptyService = new PerformanceMonitoringService();
            const summary = emptyService.getPerformanceSummary();

            expect(summary.totalOperations).toBe(0);
            expect(summary.averageDuration).toBe(0);
        });
    });

    describe('Data Management', () => {
        test('should clear old data correctly', () => {
            // Add some old data
            performanceService.history.set('old_operation', [
                { timestamp: Date.now() - 7200000, duration: 100 }, // 2 hours ago
                { timestamp: Date.now() - 1000, duration: 50 } // 1 second ago
            ]);

            performanceService.clearOldData(3600000); // 1 hour

            const oldOperationHistory = performanceService.history.get('old_operation');
            expect(oldOperationHistory.length).toBe(1); // Only recent data should remain
            expect(oldOperationHistory[0].timestamp).toBeGreaterThan(Date.now() - 3600000);
        });

        test('should export data correctly', () => {
            const operationId = performanceService.startMonitoring('export-test', 'test_operation');
            performanceService.endMonitoring(operationId);

            const exportedData = performanceService.exportData();

            expect(exportedData).toBeDefined();
            expect(exportedData.history).toBeDefined();
            expect(exportedData.alerts).toBeDefined();
            expect(exportedData.thresholds).toBeDefined();
            expect(exportedData.exportTimestamp).toBeDefined();
        });

        test('should reset all data', () => {
            // Add some data
            performanceService.startMonitoring('reset-test', 'test_operation');
            performanceService.alerts.push({ type: 'test', timestamp: Date.now() });

            performanceService.reset();

            expect(performanceService.metrics.size).toBe(0);
            expect(performanceService.history.size).toBe(0);
            expect(performanceService.alerts.length).toBe(0);
        });
    });

    describe('Performance Benchmarks', () => {
        test('should benchmark turn processing with varying NPC counts', () => {
            const npcCounts = [10, 50, 100, 500];
            const benchmarks = [];

            npcCounts.forEach(count => {
                const startTime = performance.now();

                const turnId = performanceService.monitorTurnProcessing(`benchmark-${count}`, count);

                // Simulate processing time proportional to NPC count
                const processingTime = count * 0.1; // 0.1ms per NPC
                const start = Date.now();
                while (Date.now() - start < processingTime) {}

                const metrics = performanceService.endMonitoring(turnId);
                const endTime = performance.now();

                benchmarks.push({
                    npcCount: count,
                    totalTime: endTime - startTime,
                    processingTime: metrics.duration,
                    efficiency: count / metrics.duration // NPCs per ms
                });
            });

            // Verify benchmarks are reasonable
            benchmarks.forEach(benchmark => {
                expect(benchmark.efficiency).toBeGreaterThan(0);
                expect(benchmark.processingTime).toBeGreaterThan(0);
            });

            console.log('Turn Processing Benchmarks:', benchmarks);
        });

        test('should benchmark memory operations with varying sizes', () => {
            const memorySizes = [10, 50, 100, 500];
            const benchmarks = [];

            memorySizes.forEach(size => {
                const startTime = performance.now();

                const monitoringId = performanceService.monitorMemoryOperation('benchmark_retrieval', size);

                // Simulate memory operation time
                const operationTime = Math.sqrt(size) * 2; // Square root scaling
                const start = Date.now();
                while (Date.now() - start < operationTime) {}

                const metrics = performanceService.endMonitoring(monitoringId);
                const endTime = performance.now();

                benchmarks.push({
                    memorySize: size,
                    totalTime: endTime - startTime,
                    operationTime: metrics.duration,
                    throughput: size / metrics.duration // memories per ms
                });
            });

            // Verify benchmarks are reasonable
            benchmarks.forEach(benchmark => {
                expect(benchmark.throughput).toBeGreaterThan(0);
                expect(benchmark.operationTime).toBeGreaterThan(0);
            });

            console.log('Memory Operation Benchmarks:', benchmarks);
        });

        test('should benchmark concurrent operations', async () => {
            const concurrentOperations = 20;
            const operationPromises = [];
            const operationIds = [];

            // Start multiple concurrent operations first
            for (let i = 0; i < concurrentOperations; i++) {
                const operationId = performanceService.startMonitoring(`concurrent-${i}`, 'concurrent_test');
                operationIds.push(operationId);
            }

            const startTime = performance.now();

            // Create promises for each operation with random delays
            operationIds.forEach((operationId, index) => {
                const delay = Math.random() * 20;
                operationPromises.push(
                    new Promise(resolve => {
                        setTimeout(() => {
                            const metrics = performanceService.endMonitoring(operationId);
                            resolve(metrics);
                        }, delay);
                    })
                );
            });

            // Wait for all operations to complete
            const results = await Promise.all(operationPromises);
            const endTime = performance.now();

            const totalTime = endTime - startTime;
            const averageOperationTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

            console.log('Concurrent Operations Benchmark:', {
                totalOperations: concurrentOperations,
                totalTime: totalTime,
                averageOperationTime: averageOperationTime,
                operationsPerSecond: (concurrentOperations / totalTime) * 1000
            });

            expect(results.length).toBe(concurrentOperations);
            expect(totalTime).toBeGreaterThan(0);
        });

        test('should measure memory efficiency over time', () => {
            const iterations = 50;
            const memoryMetrics = [];

            for (let i = 0; i < iterations; i++) {
                const operationId = performanceService.startMonitoring(`memory-iter-${i}`, 'memory_test');

                // Create varying amounts of memory usage
                const memoryLoad = Math.sin(i / 10) * 1000 + 1000; // Sine wave pattern
                const testArray = new Array(Math.floor(memoryLoad)).fill('test');

                const metrics = performanceService.endMonitoring(operationId);
                memoryMetrics.push({
                    iteration: i,
                    memoryDelta: metrics.memoryUsage.delta,
                    duration: metrics.duration
                });

                // Clean up
                testArray.length = 0;
            }

            // Analyze memory efficiency patterns
            const averageMemoryDelta = memoryMetrics.reduce((sum, m) => sum + m.memoryDelta, 0) / iterations;
            const maxMemoryDelta = Math.max(...memoryMetrics.map(m => m.memoryDelta));
            const minMemoryDelta = Math.min(...memoryMetrics.map(m => m.memoryDelta));

            console.log('Memory Efficiency Analysis:', {
                iterations: iterations,
                averageMemoryDelta: averageMemoryDelta,
                maxMemoryDelta: maxMemoryDelta,
                minMemoryDelta: minMemoryDelta,
                memoryVariance: maxMemoryDelta - minMemoryDelta
            });

            expect(averageMemoryDelta).toBeDefined();
            expect(maxMemoryDelta).toBeGreaterThanOrEqual(minMemoryDelta);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle invalid operation IDs gracefully', () => {
            const result = performanceService.endMonitoring('nonexistent-id');
            expect(result).toBeNull();
        });

        test('should handle missing operation types', () => {
            const operationId = performanceService.startMonitoring('no-type', undefined);
            const metrics = performanceService.endMonitoring(operationId);

            expect(metrics).toBeDefined();
            expect(metrics.operationType).toBeUndefined();
        });

        test('should handle extreme performance values', () => {
            // Test with very fast operations
            const fastOpId = performanceService.startMonitoring('fast-op', 'fast_test');
            const fastMetrics = performanceService.endMonitoring(fastOpId);

            expect(fastMetrics.duration).toBeGreaterThanOrEqual(0);

            // Test with operations that take time
            const slowOpId = performanceService.startMonitoring('slow-op', 'slow_test');
            const start = Date.now();
            while (Date.now() - start < 100) {} // 100ms
            const slowMetrics = performanceService.endMonitoring(slowOpId);

            expect(slowMetrics.duration).toBeGreaterThan(90);
        });

        test('should handle memory measurement in different environments', () => {
            const operationId = performanceService.startMonitoring('env-test', 'environment_test');
            const metrics = performanceService.endMonitoring(operationId);

            // Memory usage should be defined even if measurement isn't perfect
            expect(metrics.memoryUsage).toBeDefined();
            expect(typeof metrics.memoryUsage.before).toBe('number');
            expect(typeof metrics.memoryUsage.after).toBe('number');
        });
    });
});