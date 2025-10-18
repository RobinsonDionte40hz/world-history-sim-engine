/**
 * Fuzzing Engine
 * 
 * Comprehensive fuzzing and property-based testing system for the consciousness engine.
 * Implements QuickCheck-style testing, bounds fuzzing, memory corruption detection,
 * and performance regression fuzzing.
 * 
 * Features:
 * - Property-based testing with random input generation
 * - Consciousness bounds fuzzing (frequency, coherence, attributes)
 * - Memory corruption detection
 * - Performance regression fuzzing
 * - Automatic shrinking for minimal failing cases
 * - Seed-based reproducibility
 * 
 * @module FuzzingEngine
 */

export class FuzzingEngine {
    constructor(config = {}) {
        // Configuration
        this.config = {
            iterations: config.iterations || 1000,
            shrinkingAttempts: config.shrinkingAttempts || 100,
            seed: config.seed || Date.now(),
            enableLogging: config.enableLogging !== false,
            enableShrinking: config.enableShrinking !== false,
            timeout: config.timeout || 5000, // 5 seconds per test
            ...config
        };
        
        // Random number generator (seedable)
        this.rng = this._createRNG(this.config.seed);
        
        // Test results
        this.results = [];
        this.failures = [];
        this.properties = new Map();
        
        // Statistics
        this.stats = {
            totalTests: 0,
            passed: 0,
            failed: 0,
            shrunk: 0,
            timeouts: 0,
            startTime: null,
            endTime: null
        };
        
        // Generators
        this.generators = this._createGenerators();
    }
    
    /**
     * Create seedable random number generator
     * @private
     */
    _createRNG(seed) {
        let state = seed;
        return {
            next() {
                // Linear congruential generator (simple but sufficient)
                state = (state * 1664525 + 1013904223) % 4294967296;
                return state / 4294967296;
            },
            
            nextInt(min, max) {
                return Math.floor(this.next() * (max - min + 1)) + min;
            },
            
            nextFloat(min, max) {
                return this.next() * (max - min) + min;
            },
            
            choice(array) {
                return array[this.nextInt(0, array.length - 1)];
            },
            
            reset(newSeed) {
                state = newSeed;
            }
        };
    }
    
    /**
     * Create standard generators
     * @private
     */
    _createGenerators() {
        return {
            // Integer generator
            int: (min = -1000, max = 1000) => {
                return () => this.rng.nextInt(min, max);
            },
            
            // Float generator
            float: (min = -1000, max = 1000) => {
                return () => this.rng.nextFloat(min, max);
            },
            
            // Boolean generator
            bool: () => {
                return () => this.rng.next() < 0.5;
            },
            
            // Array generator
            array: (elementGen, minLength = 0, maxLength = 100) => {
                return () => {
                    const length = this.rng.nextInt(minLength, maxLength);
                    return Array.from({ length }, () => elementGen());
                };
            },
            
            // Object generator
            object: (schema) => {
                return () => {
                    const obj = {};
                    for (const [key, gen] of Object.entries(schema)) {
                        obj[key] = gen();
                    }
                    return obj;
                };
            },
            
            // Choice generator
            oneOf: (...generators) => {
                return () => {
                    const gen = this.rng.choice(generators);
                    return gen();
                };
            },
            
            // Consciousness frequency generator (40-100 Hz)
            frequency: () => {
                return () => this.rng.nextFloat(40, 100);
            },
            
            // Consciousness coherence generator (0.0-1.0)
            coherence: () => {
                return () => this.rng.nextFloat(0, 1);
            },
            
            // D&D attribute generator (3-18, standard range)
            attribute: () => {
                return () => this.rng.nextInt(3, 18);
            },
            
            // Personality trait intensity (0.0-1.0)
            intensity: () => {
                return () => this.rng.nextFloat(0, 1);
            }
        };
    }
    
    /**
     * Define a property-based test
     * @param {string} name - Test name
     * @param {Object} generators - Input generators
     * @param {Function} property - Property function to test
     */
    defineProperty(name, generators, property) {
        this.properties.set(name, {
            name,
            generators,
            property,
            enabled: true
        });
    }
    
    /**
     * Run a single property test
     * @param {string} name - Property name
     * @param {number} iterations - Number of iterations
     * @returns {Object} Test result
     */
    async runProperty(name, iterations = this.config.iterations) {
        const prop = this.properties.get(name);
        if (!prop) {
            throw new Error(`Property '${name}' not defined`);
        }
        
        this._log(`\n🔬 Testing property: ${name}`);
        this._log(`   Iterations: ${iterations}`);
        
        const result = {
            name,
            passed: true,
            iterations: 0,
            failures: [],
            examples: [],
            duration: 0
        };
        
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            result.iterations++;
            
            try {
                // Generate inputs
                const inputs = {};
                for (const [key, gen] of Object.entries(prop.generators)) {
                    inputs[key] = gen();
                }
                
                // Run property with timeout
                const propertyResult = await this._runWithTimeout(
                    () => prop.property(inputs),
                    this.config.timeout
                );
                
                if (!propertyResult) {
                    // Property failed
                    result.passed = false;
                    
                    let failingInput = inputs;
                    
                    // Try to shrink if enabled
                    if (this.config.enableShrinking) {
                        failingInput = await this._shrink(prop, inputs);
                        this.stats.shrunk++;
                    }
                    
                    result.failures.push({
                        iteration: i,
                        inputs: failingInput,
                        shrunk: this.config.enableShrinking
                    });
                    
                    this._log(`   ❌ Failed at iteration ${i}`);
                    break;
                }
                
                // Save example inputs (first 3)
                if (result.examples.length < 3) {
                    result.examples.push(inputs);
                }
                
            } catch (error) {
                result.passed = false;
                result.failures.push({
                    iteration: i,
                    error: error.message,
                    stack: error.stack
                });
                this._log(`   ❌ Error at iteration ${i}: ${error.message}`);
                break;
            }
        }
        
        result.duration = performance.now() - startTime;
        
        if (result.passed) {
            this._log(`   ✅ Passed ${result.iterations} iterations`);
            this.stats.passed++;
        } else {
            this._log(`   ❌ Failed after ${result.iterations} iterations`);
            this.stats.failed++;
        }
        
        this.results.push(result);
        return result;
    }
    
    /**
     * Run function with timeout
     * @private
     */
    async _runWithTimeout(fn, timeout) {
        return Promise.race([
            Promise.resolve(fn()),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), timeout)
            )
        ]).catch(error => {
            if (error.message === 'Timeout') {
                this.stats.timeouts++;
            }
            throw error;
        });
    }
    
    /**
     * Shrink failing input to minimal case
     * @private
     */
    async _shrink(property, failingInput) {
        let current = failingInput;
        let attempts = 0;
        
        while (attempts < this.config.shrinkingAttempts) {
            attempts++;
            
            // Try to shrink each input
            let shrunk = false;
            
            for (const key of Object.keys(current)) {
                const shrunkValue = this._shrinkValue(current[key]);
                
                if (shrunkValue !== current[key]) {
                    const candidate = { ...current, [key]: shrunkValue };
                    
                    try {
                        const result = await property.property(candidate);
                        
                        if (!result) {
                            // Still fails with smaller input
                            current = candidate;
                            shrunk = true;
                            break;
                        }
                    } catch (error) {
                        // Still fails with error
                        current = candidate;
                        shrunk = true;
                        break;
                    }
                }
            }
            
            if (!shrunk) break;
        }
        
        return current;
    }
    
    /**
     * Shrink a single value
     * @private
     */
    _shrinkValue(value) {
        if (typeof value === 'number') {
            if (value === 0) return 0;
            if (value > 0) return Math.floor(value / 2);
            return Math.ceil(value / 2);
        }
        
        if (typeof value === 'string') {
            return value.length > 1 ? value.slice(0, -1) : value;
        }
        
        if (Array.isArray(value)) {
            return value.length > 0 ? value.slice(0, -1) : value;
        }
        
        if (typeof value === 'object' && value !== null) {
            const keys = Object.keys(value);
            if (keys.length > 0) {
                const { [keys[keys.length - 1]]: _, ...rest } = value;
                return rest;
            }
        }
        
        return value;
    }
    
    /**
     * Run all defined properties
     * @returns {Object} Summary of all results
     */
    async runAllProperties() {
        this._log('\n🚀 Running Fuzzing Test Suite');
        this._log('============================================================\n');
        
        this.stats.startTime = Date.now();
        this.stats.totalTests = this.properties.size;
        
        for (const [name, prop] of this.properties.entries()) {
            if (prop.enabled) {
                await this.runProperty(name);
            }
        }
        
        this.stats.endTime = Date.now();
        
        return this.generateReport();
    }
    
    /**
     * Fuzz consciousness bounds
     * @param {Function} calculateFn - Consciousness calculation function
     * @returns {Object} Fuzzing result
     */
    async fuzzConsciousnessBounds(calculateFn) {
        this._log('\n🧠 Fuzzing Consciousness Bounds');
        this._log('============================================================\n');
        
        const results = {
            passed: true,
            violations: [],
            edgeCases: [],
            performance: []
        };
        
        const iterations = this.config.iterations;
        
        for (let i = 0; i < iterations; i++) {
            // Generate random consciousness state
            const state = {
                frequency: this.rng.nextFloat(40, 100),
                coherence: this.rng.nextFloat(0, 1),
                attributes: {
                    strength: this.rng.nextInt(3, 18),
                    dexterity: this.rng.nextInt(3, 18),
                    constitution: this.rng.nextInt(3, 18),
                    intelligence: this.rng.nextInt(3, 18),
                    wisdom: this.rng.nextInt(3, 18),
                    charisma: this.rng.nextInt(3, 18)
                }
            };
            
            try {
                const start = performance.now();
                const result = calculateFn(state);
                const duration = performance.now() - start;
                
                // Check bounds
                if (result.aggression < 0 || result.aggression > 1) {
                    results.passed = false;
                    results.violations.push({
                        type: 'aggression_out_of_bounds',
                        value: result.aggression,
                        state
                    });
                }
                
                if (result.empathy < 0 || result.empathy > 1) {
                    results.passed = false;
                    results.violations.push({
                        type: 'empathy_out_of_bounds',
                        value: result.empathy,
                        state
                    });
                }
                
                // Check for NaN
                if (Number.isNaN(result.aggression) || Number.isNaN(result.empathy)) {
                    results.passed = false;
                    results.violations.push({
                        type: 'nan_result',
                        result,
                        state
                    });
                }
                
                // Track edge cases
                if (state.frequency === 40 || state.frequency === 100) {
                    results.edgeCases.push({ state, result });
                }
                
                // Track performance
                if (duration > 10) { // > 10ms is concerning
                    results.performance.push({
                        duration,
                        state
                    });
                }
                
            } catch (error) {
                results.passed = false;
                results.violations.push({
                    type: 'exception',
                    error: error.message,
                    state
                });
            }
        }
        
        this._log(`   Iterations: ${iterations}`);
        this._log(`   Violations: ${results.violations.length}`);
        this._log(`   Edge cases: ${results.edgeCases.length}`);
        this._log(`   Performance issues: ${results.performance.length}`);
        
        return results;
    }
    
    /**
     * Detect memory corruption issues
     * @param {Function} targetFn - Function to test for memory issues
     * @returns {Object} Memory corruption results
     */
    async detectMemoryCorruption(targetFn) {
        this._log('\n💾 Detecting Memory Corruption');
        this._log('============================================================\n');
        
        const results = {
            passed: true,
            issues: [],
            leaks: [],
            overflows: []
        };
        
        // Track memory usage
        const initialMemory = this._getMemoryUsage();
        const memorySnapshots = [initialMemory];
        
        const iterations = Math.min(this.config.iterations, 100); // Limit for memory tests
        
        for (let i = 0; i < iterations; i++) {
            try {
                // Generate large inputs to stress memory
                const largeInput = {
                    data: new Array(1000).fill(0).map(() => this.rng.next()),
                    nested: {
                        array: new Array(500).fill(0).map(() => ({
                            value: this.rng.next()
                        }))
                    }
                };
                
                targetFn(largeInput);
                
                // Take memory snapshot every 10 iterations
                if (i % 10 === 0) {
                    const currentMemory = this._getMemoryUsage();
                    memorySnapshots.push(currentMemory);
                    
                    // Check for memory leak (steadily increasing)
                    if (memorySnapshots.length >= 5) {
                        const recent = memorySnapshots.slice(-5);
                        const increasing = recent.every((m, i) => 
                            i === 0 || m > recent[i - 1]
                        );
                        
                        if (increasing) {
                            results.passed = false;
                            results.leaks.push({
                                iteration: i,
                                memoryGrowth: currentMemory - initialMemory
                            });
                        }
                    }
                }
                
            } catch (error) {
                if (error.message.includes('out of memory') || 
                    error.message.includes('allocation')) {
                    results.passed = false;
                    results.issues.push({
                        type: 'memory_allocation_failure',
                        iteration: i,
                        error: error.message
                    });
                } else if (error.message.includes('overflow') || 
                           error.message.includes('out of bounds')) {
                    results.passed = false;
                    results.overflows.push({
                        iteration: i,
                        error: error.message
                    });
                }
            }
        }
        
        const finalMemory = this._getMemoryUsage();
        const memoryGrowth = finalMemory - initialMemory;
        
        this._log(`   Iterations: ${iterations}`);
        this._log(`   Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)} MB`);
        this._log(`   Issues found: ${results.issues.length}`);
        this._log(`   Leaks detected: ${results.leaks.length}`);
        this._log(`   Overflows: ${results.overflows.length}`);
        
        return results;
    }
    
    /**
     * Fuzz for performance regressions
     * @param {Function} targetFn - Function to test
     * @param {Object} baseline - Baseline performance metrics
     * @returns {Object} Performance regression results
     */
    async fuzzPerformanceRegression(targetFn, baseline = null) {
        this._log('\n⚡ Fuzzing Performance Regressions');
        this._log('============================================================\n');
        
        const results = {
            passed: true,
            regressions: [],
            baseline: baseline || {},
            measurements: []
        };
        
        const iterations = this.config.iterations;
        
        // Establish baseline if not provided
        if (!baseline) {
            this._log('   Establishing baseline...');
            const baselineRuns = 500; // More samples for stable baseline
            const baselineTimes = [];
            
            for (let i = 0; i < baselineRuns; i++) {
                const input = this._generateTypicalInput();
                const start = performance.now();
                targetFn(input);
                baselineTimes.push(performance.now() - start);
            }
            
            results.baseline = {
                mean: baselineTimes.reduce((a, b) => a + b) / baselineTimes.length,
                min: Math.min(...baselineTimes),
                max: Math.max(...baselineTimes),
                p95: this._percentile(baselineTimes, 95),
                p99: this._percentile(baselineTimes, 99)
            };
            
            this._log(`   Baseline: ${results.baseline.mean.toFixed(4)}ms avg`);
        }
        
        // Fuzz with various inputs
        for (let i = 0; i < iterations; i++) {
            const input = this._generateFuzzedInput();
            
            const start = performance.now();
            targetFn(input);
            const duration = performance.now() - start;
            
            results.measurements.push(duration);
            
            // Check for regression (>10x P99 baseline for true pathological cases)
            // Using P99 handles natural variance better than mean
            if (duration > results.baseline.p99 * 10) {
                results.passed = false;
                results.regressions.push({
                    iteration: i,
                    duration,
                    input,
                    slowdown: duration / results.baseline.mean
                });
            }
        }
        
        // Calculate fuzzing statistics
        const fuzzStats = {
            mean: results.measurements.reduce((a, b) => a + b) / results.measurements.length,
            min: Math.min(...results.measurements),
            max: Math.max(...results.measurements),
            p95: this._percentile(results.measurements, 95),
            p99: this._percentile(results.measurements, 99)
        };
        
        results.statistics = fuzzStats;
        
        this._log(`   Iterations: ${iterations}`);
        this._log(`   Mean: ${fuzzStats.mean.toFixed(4)}ms`);
        this._log(`   P95: ${fuzzStats.p95.toFixed(4)}ms`);
        this._log(`   P99: ${fuzzStats.p99.toFixed(4)}ms`);
        this._log(`   Regressions: ${results.regressions.length}`);
        
        return results;
    }
    
    /**
     * Get memory usage (Node.js only)
     * @private
     */
    _getMemoryUsage() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            return process.memoryUsage().heapUsed;
        }
        
        // Browser fallback (less accurate)
        if (typeof performance !== 'undefined' && performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        
        return 0;
    }
    
    /**
     * Generate typical input
     * @private
     */
    _generateTypicalInput() {
        return {
            frequency: 40,
            coherence: 0.8,
            attributes: {
                strength: 10,
                dexterity: 10,
                constitution: 10,
                intelligence: 10,
                wisdom: 10,
                charisma: 10
            }
        };
    }
    
    /**
     * Generate fuzzed input (random)
     * @private
     */
    _generateFuzzedInput() {
        return {
            frequency: this.rng.nextFloat(40, 100),
            coherence: this.rng.nextFloat(0, 1),
            attributes: {
                strength: this.rng.nextInt(3, 18),
                dexterity: this.rng.nextInt(3, 18),
                constitution: this.rng.nextInt(3, 18),
                intelligence: this.rng.nextInt(3, 18),
                wisdom: this.rng.nextInt(3, 18),
                charisma: this.rng.nextInt(3, 18)
            }
        };
    }
    
    /**
     * Calculate percentile
     * @private
     */
    _percentile(arr, p) {
        const sorted = [...arr].sort((a, b) => a - b);
        const index = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[index];
    }
    
    /**
     * Generate comprehensive report
     * @returns {Object} Test report
     */
    generateReport() {
        const duration = this.stats.endTime - this.stats.startTime;
        
        return {
            summary: {
                totalTests: this.stats.totalTests,
                passed: this.stats.passed,
                failed: this.stats.failed,
                shrunk: this.stats.shrunk,
                timeouts: this.stats.timeouts,
                duration,
                seed: this.config.seed
            },
            results: this.results,
            failures: this.results.filter(r => !r.passed),
            seed: this.config.seed,
            reproducible: true
        };
    }
    
    /**
     * Log message (respects config.enableLogging)
     * @private
     */
    _log(message) {
        if (this.config.enableLogging) {
            console.log(message);
        }
    }
}

export default FuzzingEngine;
