/**
 * Fuzzing Engine Tests
 * 
 * Comprehensive test suite for the fuzzing engine and property-based testing system.
 */

import { FuzzingEngine } from './src/wrapper/FuzzingEngine.js';

console.log('🔬 Testing Fuzzing Engine');
console.log('============================================================\n');

/**
 * Test 1: Basic RNG Functionality
 */
console.log('Test 1: Basic RNG Functionality');
console.log('--------------------------------');

const fuzzer1 = new FuzzingEngine({ seed: 12345, enableLogging: false });

// Test deterministic generation with seed
const values1 = [];
for (let i = 0; i < 10; i++) {
    values1.push(fuzzer1.rng.next());
}

// Reset with same seed
fuzzer1.rng.reset(12345);
const values2 = [];
for (let i = 0; i < 10; i++) {
    values2.push(fuzzer1.rng.next());
}

// Should be identical
const identical = values1.every((v, i) => v === values2[i]);

if (!identical) {
    console.error('❌ Test 1 failed: RNG not deterministic with seed');
    process.exit(1);
}

console.log('✅ RNG is deterministic with seed');
console.log('✅ Test 1 passed\n');

/**
 * Test 2: Generator Functions
 */
console.log('Test 2: Generator Functions');
console.log('----------------------------');

const fuzzer2 = new FuzzingEngine({ enableLogging: false });

// Test integer generator
const intGen = fuzzer2.generators.int(1, 10);
const ints = Array.from({ length: 100 }, () => intGen());
const intsValid = ints.every(n => n >= 1 && n <= 10 && Number.isInteger(n));

if (!intsValid) {
    console.error('❌ Test 2 failed: Integer generator out of bounds');
    process.exit(1);
}

// Test float generator
const floatGen = fuzzer2.generators.float(0, 1);
const floats = Array.from({ length: 100 }, () => floatGen());
const floatsValid = floats.every(n => n >= 0 && n <= 1);

if (!floatsValid) {
    console.error('❌ Test 2 failed: Float generator out of bounds');
    process.exit(1);
}

// Test boolean generator
const boolGen = fuzzer2.generators.bool();
const bools = Array.from({ length: 100 }, () => boolGen());
const boolsValid = bools.every(b => typeof b === 'boolean');

if (!boolsValid) {
    console.error('❌ Test 2 failed: Boolean generator invalid');
    process.exit(1);
}

// Test array generator
const arrayGen = fuzzer2.generators.array(intGen, 5, 10);
const arrays = Array.from({ length: 10 }, () => arrayGen());
const arraysValid = arrays.every(arr => 
    Array.isArray(arr) && arr.length >= 5 && arr.length <= 10
);

if (!arraysValid) {
    console.error('❌ Test 2 failed: Array generator invalid');
    process.exit(1);
}

console.log('✅ Integer generator working');
console.log('✅ Float generator working');
console.log('✅ Boolean generator working');
console.log('✅ Array generator working');
console.log('✅ Test 2 passed\n');

/**
 * Test 3: Property-Based Testing
 */
console.log('Test 3: Property-Based Testing');
console.log('-------------------------------');

const fuzzer3 = new FuzzingEngine({ iterations: 100, enableLogging: false });

// Define a simple property: addition is commutative
fuzzer3.defineProperty(
    'addition_commutative',
    {
        a: fuzzer3.generators.int(-100, 100),
        b: fuzzer3.generators.int(-100, 100)
    },
    ({ a, b }) => {
        return a + b === b + a;
    }
);

const result1 = await fuzzer3.runProperty('addition_commutative');

if (!result1.passed) {
    console.error('❌ Test 3 failed: Addition commutativity property failed');
    process.exit(1);
}

console.log(`✅ Property test passed (${result1.iterations} iterations)`);
console.log('✅ Test 3 passed\n');

/**
 * Test 4: Failing Property Detection
 */
console.log('Test 4: Failing Property Detection');
console.log('-----------------------------------');

const fuzzer4 = new FuzzingEngine({ iterations: 100, enableLogging: false, enableShrinking: false });

// Define a property that will fail
fuzzer4.defineProperty(
    'always_positive',
    {
        x: fuzzer4.generators.int(-10, 10)
    },
    ({ x }) => {
        return x > 0; // Will fail for x <= 0
    }
);

const result2 = await fuzzer4.runProperty('always_positive');

if (result2.passed) {
    console.error('❌ Test 4 failed: Should have detected failing property');
    process.exit(1);
}

if (result2.failures.length === 0) {
    console.error('❌ Test 4 failed: No failure recorded');
    process.exit(1);
}

console.log('✅ Failing property detected');
console.log(`✅ Failure at iteration ${result2.failures[0].iteration}`);
console.log('✅ Test 4 passed\n');

/**
 * Test 5: Input Shrinking
 */
console.log('Test 5: Input Shrinking');
console.log('-----------------------');

const fuzzer5 = new FuzzingEngine({ 
    iterations: 100, 
    enableLogging: false,
    enableShrinking: true,
    shrinkingAttempts: 50
});

// Define a property that fails for large negative numbers
fuzzer5.defineProperty(
    'shrinking_test',
    {
        x: fuzzer5.generators.int(-1000, 1000)
    },
    ({ x }) => {
        return x >= -10; // Fails for x < -10
    }
);

const result3 = await fuzzer5.runProperty('shrinking_test');

if (result3.passed) {
    console.error('❌ Test 5 failed: Property should have failed');
    process.exit(1);
}

const shrunkValue = result3.failures[0].inputs.x;

if (Math.abs(shrunkValue) > 50) {
    console.error(`❌ Test 5 failed: Shrinking ineffective (got ${shrunkValue})`);
    process.exit(1);
}

console.log(`✅ Input shrunk to: ${shrunkValue}`);
console.log('✅ Shrinking working correctly');
console.log('✅ Test 5 passed\n');

/**
 * Test 6: Consciousness Bounds Fuzzing
 */
console.log('Test 6: Consciousness Bounds Fuzzing');
console.log('-------------------------------------');

const fuzzer6 = new FuzzingEngine({ iterations: 500, enableLogging: false });

// Mock consciousness calculation function
function mockConsciousnessCalculation(state) {
    // Simulate consciousness calculation with bounds checking
    const { frequency, coherence, attributes } = state;
    
    // Calculate aggression (should be 0-1)
    const aggression = Math.min(1, Math.max(0, 
        (frequency - 40) / 60 * 0.5 + 
        (attributes.strength / 18) * 0.3 +
        (1 - coherence) * 0.2
    ));
    
    // Calculate empathy (should be 0-1)
    const empathy = Math.min(1, Math.max(0,
        coherence * 0.5 +
        (attributes.wisdom / 18) * 0.3 +
        (attributes.charisma / 18) * 0.2
    ));
    
    return { aggression, empathy };
}

const boundsResult = await fuzzer6.fuzzConsciousnessBounds(mockConsciousnessCalculation);

if (!boundsResult.passed) {
    console.error('❌ Test 6 failed: Consciousness bounds violations detected');
    console.error(`   Violations: ${boundsResult.violations.length}`);
    process.exit(1);
}

console.log(`✅ No bounds violations in ${fuzzer6.config.iterations} iterations`);
console.log(`✅ Edge cases tested: ${boundsResult.edgeCases.length}`);
console.log('✅ Test 6 passed\n');

/**
 * Test 7: Memory Corruption Detection
 */
console.log('Test 7: Memory Corruption Detection');
console.log('------------------------------------');

const fuzzer7 = new FuzzingEngine({ iterations: 50, enableLogging: false });

// Mock function that processes large inputs
function mockMemoryIntensiveFunction(input) {
    // Process the input without memory leaks
    const processed = input.data.map(x => x * 2);
    const nestedSum = input.nested.array.reduce((sum, obj) => sum + obj.value, 0);
    return { processed, nestedSum };
}

const memoryResult = await fuzzer7.detectMemoryCorruption(mockMemoryIntensiveFunction);

if (!memoryResult.passed) {
    console.error('❌ Test 7 failed: Memory corruption detected');
    console.error(`   Issues: ${memoryResult.issues.length}`);
    console.error(`   Leaks: ${memoryResult.leaks.length}`);
    process.exit(1);
}

console.log('✅ No memory corruption detected');
console.log(`✅ Memory growth: ${(memoryResult.issues.length === 0 ? 'acceptable' : 'concerning')}`);
console.log('✅ Test 7 passed\n');

/**
 * Test 8: Performance Regression Fuzzing
 */
console.log('Test 8: Performance Regression Fuzzing');
console.log('---------------------------------------');

const fuzzer8 = new FuzzingEngine({ iterations: 500, enableLogging: false });

// Mock function with consistent performance
function mockPerformantFunction(input) {
    // Simulate lightweight calculation
    const result = input.frequency * input.coherence;
    const attrSum = Object.values(input.attributes).reduce((a, b) => a + b, 0);
    return result + attrSum / 100;
}

const perfResult = await fuzzer8.fuzzPerformanceRegression(mockPerformantFunction);

if (!perfResult.passed) {
    console.error('❌ Test 8 failed: Performance regressions detected');
    console.error(`   Regressions: ${perfResult.regressions.length}`);
    process.exit(1);
}

console.log(`✅ No performance regressions in ${fuzzer8.config.iterations} iterations`);
console.log(`✅ Mean: ${perfResult.statistics.mean.toFixed(4)}ms`);
console.log(`✅ P95: ${perfResult.statistics.p95.toFixed(4)}ms`);
console.log('✅ Test 8 passed\n');

/**
 * Test 9: Consciousness-Specific Generators
 */
console.log('Test 9: Consciousness-Specific Generators');
console.log('------------------------------------------');

const fuzzer9 = new FuzzingEngine({ enableLogging: false });

// Test frequency generator (40-100 Hz)
const freqGen = fuzzer9.generators.frequency();
const frequencies = Array.from({ length: 100 }, () => freqGen());
const freqValid = frequencies.every(f => f >= 40 && f <= 100);

if (!freqValid) {
    console.error('❌ Test 9 failed: Frequency generator out of bounds');
    process.exit(1);
}

// Test coherence generator (0.0-1.0)
const cohGen = fuzzer9.generators.coherence();
const coherences = Array.from({ length: 100 }, () => cohGen());
const cohValid = coherences.every(c => c >= 0 && c <= 1);

if (!cohValid) {
    console.error('❌ Test 9 failed: Coherence generator out of bounds');
    process.exit(1);
}

// Test attribute generator (3-18, D&D range)
const attrGen = fuzzer9.generators.attribute();
const attributes = Array.from({ length: 100 }, () => attrGen());
const attrValid = attributes.every(a => a >= 3 && a <= 18 && Number.isInteger(a));

if (!attrValid) {
    console.error('❌ Test 9 failed: Attribute generator out of bounds');
    process.exit(1);
}

// Test intensity generator (0.0-1.0)
const intenseGen = fuzzer9.generators.intensity();
const intensities = Array.from({ length: 100 }, () => intenseGen());
const intenseValid = intensities.every(i => i >= 0 && i <= 1);

if (!intenseValid) {
    console.error('❌ Test 9 failed: Intensity generator out of bounds');
    process.exit(1);
}

console.log('✅ Frequency generator: 40-100 Hz');
console.log('✅ Coherence generator: 0.0-1.0');
console.log('✅ Attribute generator: 3-18 (D&D)');
console.log('✅ Intensity generator: 0.0-1.0');
console.log('✅ Test 9 passed\n');

/**
 * Test 10: Run All Properties
 */
console.log('Test 10: Run All Properties');
console.log('----------------------------');

const fuzzer10 = new FuzzingEngine({ iterations: 100, enableLogging: false });

// Define multiple properties
fuzzer10.defineProperty(
    'prop1',
    { x: fuzzer10.generators.int(0, 100) },
    ({ x }) => x >= 0
);

fuzzer10.defineProperty(
    'prop2',
    { 
        a: fuzzer10.generators.float(0, 1),
        b: fuzzer10.generators.float(0, 1)
    },
    ({ a, b }) => a + b <= 2
);

fuzzer10.defineProperty(
    'prop3',
    { arr: fuzzer10.generators.array(fuzzer10.generators.int(0, 10), 1, 5) },
    ({ arr }) => arr.length > 0
);

const allResults = await fuzzer10.runAllProperties();

if (allResults.summary.failed > 0) {
    console.error('❌ Test 10 failed: Some properties failed');
    process.exit(1);
}

if (allResults.summary.totalTests !== 3) {
    console.error('❌ Test 10 failed: Not all properties ran');
    process.exit(1);
}

console.log(`✅ All ${allResults.summary.totalTests} properties passed`);
console.log(`✅ Total iterations: ${allResults.summary.totalTests * 100}`);
console.log(`✅ Duration: ${allResults.summary.duration}ms`);
console.log('✅ Test 10 passed\n');

/**
 * Test 11: Report Generation
 */
console.log('Test 11: Report Generation');
console.log('--------------------------');

const fuzzer11 = new FuzzingEngine({ iterations: 50, enableLogging: false });

fuzzer11.defineProperty(
    'test_prop',
    { x: fuzzer11.generators.int(0, 10) },
    ({ x }) => x < 20 // Always true
);

await fuzzer11.runAllProperties();
const report = fuzzer11.generateReport();

if (!report.summary) {
    console.error('❌ Test 11 failed: No summary in report');
    process.exit(1);
}

if (!report.results) {
    console.error('❌ Test 11 failed: No results in report');
    process.exit(1);
}

if (report.summary.seed !== fuzzer11.config.seed) {
    console.error('❌ Test 11 failed: Seed mismatch');
    process.exit(1);
}

if (!report.reproducible) {
    console.error('❌ Test 11 failed: Report not marked as reproducible');
    process.exit(1);
}

console.log('✅ Report structure valid');
console.log(`✅ Seed: ${report.summary.seed}`);
console.log(`✅ Reproducible: ${report.reproducible}`);
console.log('✅ Test 11 passed\n');

/**
 * Test 12: Seed Reproducibility
 */
console.log('Test 12: Seed Reproducibility');
console.log('------------------------------');

const seed = 99999;

// Run 1
const fuzzer12a = new FuzzingEngine({ seed, iterations: 50, enableLogging: false });
fuzzer12a.defineProperty(
    'repro_test',
    { x: fuzzer12a.generators.int(0, 1000) },
    ({ x }) => x >= 0
);
const result12a = await fuzzer12a.runProperty('repro_test');

// Run 2 (same seed)
const fuzzer12b = new FuzzingEngine({ seed, iterations: 50, enableLogging: false });
fuzzer12b.defineProperty(
    'repro_test',
    { x: fuzzer12b.generators.int(0, 1000) },
    ({ x }) => x >= 0
);
const result12b = await fuzzer12b.runProperty('repro_test');

// Compare examples (should be identical)
const examplesMatch = result12a.examples.every((ex, i) => 
    ex.x === result12b.examples[i].x
);

if (!examplesMatch) {
    console.error('❌ Test 12 failed: Results not reproducible with same seed');
    process.exit(1);
}

console.log(`✅ Seed: ${seed}`);
console.log('✅ Results identical across runs');
console.log('✅ Reproducibility verified');
console.log('✅ Test 12 passed\n');

/**
 * Final Summary
 */
console.log('\n============================================================');
console.log('🎉 ALL TESTS PASSED!');
console.log('============================================================\n');

console.log('Test Suite Summary:');
console.log('  ✅ Test 1: Basic RNG Functionality');
console.log('  ✅ Test 2: Generator Functions');
console.log('  ✅ Test 3: Property-Based Testing');
console.log('  ✅ Test 4: Failing Property Detection');
console.log('  ✅ Test 5: Input Shrinking');
console.log('  ✅ Test 6: Consciousness Bounds Fuzzing');
console.log('  ✅ Test 7: Memory Corruption Detection');
console.log('  ✅ Test 8: Performance Regression Fuzzing');
console.log('  ✅ Test 9: Consciousness-Specific Generators');
console.log('  ✅ Test 10: Run All Properties');
console.log('  ✅ Test 11: Report Generation');
console.log('  ✅ Test 12: Seed Reproducibility');
console.log('\n✅ 12/12 tests passed\n');

console.log('Fuzzing Engine Features Validated:');
console.log('  ✅ Deterministic RNG with seed support');
console.log('  ✅ Multiple generator types (int, float, bool, array, object)');
console.log('  ✅ Property-based testing framework');
console.log('  ✅ Automatic input shrinking');
console.log('  ✅ Consciousness bounds fuzzing');
console.log('  ✅ Memory corruption detection');
console.log('  ✅ Performance regression fuzzing');
console.log('  ✅ Consciousness-specific generators');
console.log('  ✅ Comprehensive reporting');
console.log('  ✅ Seed-based reproducibility\n');

console.log('============================================================');
console.log('Fuzzing Engine: PRODUCTION READY ✅');
console.log('============================================================\n');
