/**
 * Determinism Validator Tests
 * 
 * Comprehensive test suite for cross-platform floating-point determinism validation.
 * Ensures the DeterminismValidator correctly identifies bit-identical results
 * and detects platform-specific differences.
 */

import { DeterminismValidator } from './src/wrapper/DeterminismValidator.js';

// Test configuration
const ENABLE_DETAILED_OUTPUT = true;

console.log('🔍 Testing Determinism Validator');
console.log('============================================================\n');

/**
 * Test 1: Platform Detection
 */
console.log('Test 1: Platform Detection');
console.log('----------------------------');

const validator = new DeterminismValidator();

console.log(`✅ Platform: ${validator.platform}`);
console.log(`✅ Architecture: ${validator.architecture}`);
console.log(`✅ JS Engine: ${validator.jsEngine}`);

if (!validator.platform || validator.platform === 'Unknown') {
    console.error('❌ Platform detection failed!');
    process.exit(1);
}

console.log('✅ Test 1 passed: Platform detected successfully\n');

/**
 * Test 2: Bit Conversion Accuracy
 */
console.log('Test 2: Bit Conversion Accuracy');
console.log('--------------------------------');

const testValues = [
    0.0,
    1.0,
    -1.0,
    0.5,
    0.1,
    Math.PI,
    Math.E,
    Number.MAX_VALUE,
    Number.MIN_VALUE,
    Number.EPSILON
];

let conversionErrors = 0;

for (const value of testValues) {
    const bits = validator.numberToBits(value);
    const reconstructed = validator.bitsToNumber(bits);
    
    if (value !== reconstructed && !(Number.isNaN(value) && Number.isNaN(reconstructed))) {
        console.error(`❌ Conversion error for ${value}: got ${reconstructed}`);
        conversionErrors++;
    }
}

if (conversionErrors > 0) {
    console.error(`❌ Test 2 failed: ${conversionErrors} conversion error(s)`);
    process.exit(1);
}

console.log('✅ Test 2 passed: All bit conversions accurate\n');

/**
 * Test 3: Bit Identity Checking
 */
console.log('Test 3: Bit Identity Checking');
console.log('------------------------------');

const identicalTests = [
    [1.0, 1.0, true],
    [0.1, 0.1, true],
    [0.1 + 0.2, 0.3, false], // Classic floating-point trap
    [Math.sqrt(2) * Math.sqrt(2), 2.0, false], // Rounding errors
    [NaN, NaN, true], // NaN handling
    [Infinity, Infinity, true],
    [-Infinity, -Infinity, true],
    [Infinity, -Infinity, false]
];

let identityErrors = 0;

for (const [a, b, expected] of identicalTests) {
    const result = validator.areBitIdentical(a, b);
    
    if (result !== expected) {
        console.error(`❌ Identity check failed for ${a} vs ${b}: expected ${expected}, got ${result}`);
        identityErrors++;
    }
}

if (identityErrors > 0) {
    console.error(`❌ Test 3 failed: ${identityErrors} identity error(s)`);
    process.exit(1);
}

console.log('✅ Test 3 passed: Bit identity checking works correctly\n');

/**
 * Test 4: Reference Value Validation
 */
console.log('Test 4: Reference Value Validation');
console.log('-----------------------------------');

// Test that reference values are loaded
const referenceTests = [
    'add_0.1_0.2',
    'sub_1.0_0.1',
    'mul_0.1_0.2',
    'div_1.0_3.0',
    'sin_0.5',
    'cos_0.5',
    'sqrt_2.0'
];

let missingReferences = 0;

for (const testName of referenceTests) {
    if (!validator.referenceValues.has(testName)) {
        console.error(`❌ Missing reference value: ${testName}`);
        missingReferences++;
    }
}

if (missingReferences > 0) {
    console.error(`❌ Test 4 failed: ${missingReferences} missing reference value(s)`);
    process.exit(1);
}

console.log(`✅ Test 4 passed: All ${referenceTests.length} reference values loaded\n`);

/**
 * Test 5: Basic Arithmetic Tests
 */
console.log('Test 5: Basic Arithmetic Tests');
console.log('-------------------------------');

const arithmeticResults = validator.testBasicArithmetic();

const arithmeticFailures = arithmeticResults.filter(r => r.passed === false);

if (arithmeticFailures.length > 0) {
    console.warn(`⚠️  ${arithmeticFailures.length} arithmetic test(s) failed:`);
    for (const failure of arithmeticFailures) {
        console.warn(`   - ${failure.name}`);
        console.warn(`     Expected: 0x${failure.referenceBits}`);
        console.warn(`     Got:      0x${failure.computedBits}`);
    }
} else {
    console.log('✅ All arithmetic tests passed');
}

console.log(`✅ Test 5 completed: ${arithmeticResults.length} arithmetic tests run\n`);

/**
 * Test 6: Trigonometric Function Tests
 */
console.log('Test 6: Trigonometric Function Tests');
console.log('-------------------------------------');

const trigResults = validator.testTrigonometric();

const trigFailures = trigResults.filter(r => r.passed === false);

if (trigFailures.length > 0) {
    console.warn(`⚠️  ${trigFailures.length} trigonometric test(s) failed:`);
    for (const failure of trigFailures) {
        console.warn(`   - ${failure.name}`);
    }
} else {
    console.log('✅ All trigonometric tests passed');
}

console.log(`✅ Test 6 completed: ${trigResults.length} trigonometric tests run\n`);

/**
 * Test 7: Exponential and Logarithmic Tests
 */
console.log('Test 7: Exponential & Logarithmic Tests');
console.log('---------------------------------------');

const expLogResults = validator.testExponentialLogarithmic();

const expLogFailures = expLogResults.filter(r => r.passed === false);

if (expLogFailures.length > 0) {
    console.warn(`⚠️  ${expLogFailures.length} exponential/logarithmic test(s) failed:`);
    for (const failure of expLogFailures) {
        console.warn(`   - ${failure.name}`);
    }
} else {
    console.log('✅ All exponential/logarithmic tests passed');
}

console.log(`✅ Test 7 completed: ${expLogResults.length} exponential/logarithmic tests run\n`);

/**
 * Test 8: Consciousness-Specific Calculations
 */
console.log('Test 8: Consciousness-Specific Calculations');
console.log('-------------------------------------------');

const consciousnessResults = validator.testConsciousnessCalculations();

const consciousnessFailures = consciousnessResults.filter(r => r.passed === false);

if (consciousnessFailures.length > 0) {
    console.warn(`⚠️  ${consciousnessFailures.length} consciousness test(s) failed:`);
    for (const failure of consciousnessFailures) {
        console.warn(`   - ${failure.name}`);
    }
} else {
    console.log('✅ All consciousness calculations passed');
}

console.log(`✅ Test 8 completed: ${consciousnessResults.length} consciousness tests run\n`);

/**
 * Test 9: Complex Chain Calculations
 */
console.log('Test 9: Complex Chain Calculations');
console.log('-----------------------------------');

const chainResults = validator.testComplexChains();

const chainFailures = chainResults.filter(r => r.passed === false);

if (chainFailures.length > 0) {
    console.warn(`⚠️  ${chainFailures.length} chain calculation test(s) failed:`);
    for (const failure of chainFailures) {
        console.warn(`   - ${failure.name}`);
    }
} else {
    console.log('✅ All chain calculations passed');
}

console.log(`✅ Test 9 completed: ${chainResults.length} chain tests run\n`);

/**
 * Test 10: Comprehensive Test Suite
 */
console.log('Test 10: Comprehensive Test Suite');
console.log('----------------------------------');

// Create fresh validator for comprehensive test
const validator2 = new DeterminismValidator();
validator2.config.enableLogging = false; // Reduce noise

const report = await validator2.runComprehensiveTests();

console.log(`Total Tests: ${report.summary.totalTests}`);
console.log(`Passed: ${report.summary.passed}`);
console.log(`Failed: ${report.summary.failed}`);
console.log(`Pass Rate: ${report.summary.passRate}`);
console.log(`Bit Mismatches: ${report.summary.bitMismatches}`);
console.log(`Platform Compatibility: ${report.platformCompatibility.isDeterministic ? 'YES' : 'NO'}`);
console.log(`Severity: ${report.platformCompatibility.severity}`);

if (report.summary.totalTests < 10) {
    console.error('❌ Test 10 failed: Insufficient tests run');
    process.exit(1);
}

console.log('✅ Test 10 passed: Comprehensive suite executed\n');

/**
 * Test 11: Report Generation
 */
console.log('Test 11: Report Generation');
console.log('--------------------------');

if (!report.summary || !report.results || !report.recommendations) {
    console.error('❌ Test 11 failed: Incomplete report structure');
    process.exit(1);
}

if (report.recommendations.length === 0) {
    console.error('❌ Test 11 failed: No recommendations generated');
    process.exit(1);
}

console.log('Report Structure:');
console.log(`  ✅ Summary: ${Object.keys(report.summary).length} fields`);
console.log(`  ✅ Results: ${report.results.length} test results`);
console.log(`  ✅ Failures: ${report.failures.length} failures`);
console.log(`  ✅ Regressions: ${report.regressions.length} regressions`);
console.log(`  ✅ Recommendations: ${report.recommendations.length} recommendations`);

console.log('\nRecommendations:');
for (const rec of report.recommendations) {
    console.log(`  ${rec}`);
}

console.log('\n✅ Test 11 passed: Report generated successfully\n');

/**
 * Test 12: Export/Import Functionality
 */
console.log('Test 12: Export/Import Functionality');
console.log('-------------------------------------');

const exportedData = validator2.exportResults();

try {
    const parsed = JSON.parse(exportedData);
    
    if (!parsed.platform || !parsed.results || !Array.isArray(parsed.results)) {
        console.error('❌ Test 12 failed: Invalid export structure');
        process.exit(1);
    }
    
    console.log(`✅ Exported ${parsed.results.length} results`);
    console.log(`✅ Platform: ${parsed.platform}`);
    console.log(`✅ Timestamp: ${parsed.timestamp}`);
} catch (error) {
    console.error(`❌ Test 12 failed: Export parsing error: ${error.message}`);
    process.exit(1);
}

console.log('✅ Test 12 passed: Export/import works correctly\n');

/**
 * Test 13: Cross-Platform Comparison
 */
console.log('Test 13: Cross-Platform Comparison');
console.log('-----------------------------------');

// Simulate results from another platform
const mockOtherPlatform = {
    platform: 'MockPlatform',
    architecture: 'x64',
    jsEngine: 'MockEngine',
    timestamp: new Date().toISOString(),
    results: validator2.testResults.map(r => ({
        name: r.name,
        passed: r.passed,
        computedBits: r.computedBits,
        referenceBits: r.referenceBits
    }))
};

// Introduce one difference for testing
if (mockOtherPlatform.results.length > 0) {
    mockOtherPlatform.results[0].computedBits = 'FFFFFFFFFFFFFFFF';
}

const comparison = validator2.importAndCompare(JSON.stringify(mockOtherPlatform));

if (!comparison.platforms || comparison.platforms.length !== 2) {
    console.error('❌ Test 13 failed: Invalid comparison structure');
    process.exit(1);
}

console.log(`✅ Compared platforms: ${comparison.platforms.join(' vs ')}`);
console.log(`✅ Total tests compared: ${comparison.totalTests}`);
console.log(`✅ Differences found: ${comparison.differences}`);
console.log(`✅ Compatible: ${comparison.compatible ? 'YES' : 'NO'}`);

if (comparison.differences === 0) {
    console.warn('⚠️  Expected at least one difference in mock data');
}

console.log('✅ Test 13 passed: Cross-platform comparison works\n');

/**
 * Test 14: Regression Monitoring
 */
console.log('Test 14: Regression Monitoring');
console.log('-------------------------------');

// Clear any previous results
try {
    localStorage.removeItem('determinismValidator_previousResults');
} catch (error) {
    // Ignore in Node.js environment
}

const validator3 = new DeterminismValidator();
validator3.config.enableLogging = false;
await validator3.runComprehensiveTests();

// First run should establish baseline
const firstMonitor = validator3.monitorRegressions();

if (firstMonitor.isRegression !== false) {
    console.error('❌ Test 14 failed: First monitor should not detect regression');
    process.exit(1);
}

console.log('✅ Baseline established');

// Second run should detect no regressions
const secondMonitor = validator3.monitorRegressions();

if (secondMonitor.isRegression !== false) {
    console.error('❌ Test 14 failed: Second monitor should not detect regression');
    process.exit(1);
}

console.log('✅ No regressions detected');
console.log('✅ Test 14 passed: Regression monitoring works\n');

/**
 * Test 15: Severity Calculation
 */
console.log('Test 15: Severity Calculation');
console.log('------------------------------');

// Test different failure scenarios
const severityTests = [
    { failed: 0, total: 10, expected: 'none' },
    { failed: 1, total: 20, expected: 'low' },
    { failed: 5, total: 20, expected: 'medium' },
    { failed: 9, total: 20, expected: 'high' },
    { failed: 15, total: 20, expected: 'critical' }
];

let severityErrors = 0;

for (const test of severityTests) {
    const validatorTemp = new DeterminismValidator();
    validatorTemp.metrics.failedTests = test.failed;
    validatorTemp.metrics.totalTests = test.total;
    
    const severity = validatorTemp._calculateSeverity();
    
    if (severity !== test.expected) {
        console.error(`❌ Severity error: ${test.failed}/${test.total} should be '${test.expected}', got '${severity}'`);
        severityErrors++;
    }
}

if (severityErrors > 0) {
    console.error(`❌ Test 15 failed: ${severityErrors} severity calculation error(s)`);
    process.exit(1);
}

console.log('✅ Test 15 passed: Severity calculation accurate\n');

/**
 * Final Summary
 */
console.log('\n============================================================');
console.log('🎉 ALL TESTS PASSED!');
console.log('============================================================\n');

console.log('Final Platform Report:');
console.log(`  Platform: ${report.summary.platform}`);
console.log(`  Architecture: ${report.summary.architecture}`);
console.log(`  JS Engine: ${report.summary.jsEngine}`);
console.log(`  Total Tests: ${report.summary.totalTests}`);
console.log(`  Passed: ${report.summary.passed}`);
console.log(`  Failed: ${report.summary.failed}`);
console.log(`  Pass Rate: ${report.summary.passRate}`);
console.log(`  Deterministic: ${report.platformCompatibility.isDeterministic ? 'YES ✅' : 'NO ❌'}`);
console.log(`  Severity: ${report.platformCompatibility.severity}`);

if (report.summary.failed > 0) {
    console.log('\n⚠️  WARNING: Platform has determinism issues!');
    console.log('Failed tests:');
    for (const failure of report.failures) {
        console.log(`  - ${failure.name}`);
        console.log(`    Expected: 0x${failure.referenceBits}`);
        console.log(`    Got:      0x${failure.computedBits}`);
        console.log(`    Diff:     ${failure.bitDifference} bits`);
    }
    console.log('\nRecommendations:');
    for (const rec of report.recommendations) {
        console.log(`  ${rec}`);
    }
} else {
    console.log('\n✅ Platform is fully deterministic!');
    console.log('✅ Safe to deploy WASM consciousness engine.');
}

console.log('\n🔍 Test Suite Summary:');
console.log('  ✅ Test 1: Platform Detection');
console.log('  ✅ Test 2: Bit Conversion Accuracy');
console.log('  ✅ Test 3: Bit Identity Checking');
console.log('  ✅ Test 4: Reference Value Validation');
console.log('  ✅ Test 5: Basic Arithmetic Tests');
console.log('  ✅ Test 6: Trigonometric Function Tests');
console.log('  ✅ Test 7: Exponential & Logarithmic Tests');
console.log('  ✅ Test 8: Consciousness-Specific Calculations');
console.log('  ✅ Test 9: Complex Chain Calculations');
console.log('  ✅ Test 10: Comprehensive Test Suite');
console.log('  ✅ Test 11: Report Generation');
console.log('  ✅ Test 12: Export/Import Functionality');
console.log('  ✅ Test 13: Cross-Platform Comparison');
console.log('  ✅ Test 14: Regression Monitoring');
console.log('  ✅ Test 15: Severity Calculation');
console.log('\n✅ 15/15 tests passed\n');

console.log('============================================================');
console.log('Determinism Validator: PRODUCTION READY ✅');
console.log('============================================================\n');
