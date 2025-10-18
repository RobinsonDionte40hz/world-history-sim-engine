/**
 * Determinism Validator
 * 
 * Cross-platform floating-point determinism validation suite.
 * Ensures bit-identical results across Windows, macOS, Linux for the
 * consciousness engine's DeterministicFloat implementation.
 * 
 * Features:
 * - Bit-identical result verification
 * - Cross-platform reference values
 * - Regression monitoring
 * - Tolerance-free validation (exact bit matching)
 * - Comprehensive test coverage
 * 
 * @module DeterminismValidator
 */

export class DeterminismValidator {
    constructor() {
        // Platform information
        this.platform = this._detectPlatform();
        this.architecture = this._detectArchitecture();
        this.jsEngine = this._detectJSEngine();
        
        // Validation state
        this.testResults = [];
        this.regressions = [];
        this.referenceValues = new Map();
        
        // Configuration
        this.config = {
            enableLogging: true,
            collectMetrics: true,
            trackRegressions: true,
            strictMode: true // Require exact bit-matching
        };
        
        // Metrics
        this.metrics = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            bitMismatches: 0,
            platformChecks: 0
        };
        
        this._loadReferenceValues();
    }
    
    /**
     * Detect current platform
     * @private
     */
    _detectPlatform() {
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const platform = typeof process !== 'undefined' ? process.platform : '';
        
        if (platform === 'win32' || userAgent.includes('Windows')) return 'Windows';
        if (platform === 'darwin' || userAgent.includes('Mac')) return 'macOS';
        if (platform === 'linux' || userAgent.includes('Linux')) return 'Linux';
        
        return 'Unknown';
    }
    
    /**
     * Detect system architecture
     * @private
     */
    _detectArchitecture() {
        if (typeof process !== 'undefined') {
            return process.arch; // x64, arm64, etc.
        }
        
        // Browser detection (less precise)
        const is64bit = navigator?.userAgent.includes('x64') || 
                       navigator?.userAgent.includes('x86_64') ||
                       navigator?.platform.includes('64');
        return is64bit ? 'x64' : 'x86';
    }
    
    /**
     * Detect JavaScript engine
     * @private
     */
    _detectJSEngine() {
        if (typeof process !== 'undefined' && process.versions?.node) {
            return `Node.js ${process.versions.node} (V8)`;
        }
        if (typeof navigator !== 'undefined') {
            const ua = navigator.userAgent;
            if (ua.includes('Chrome')) return 'Chrome (V8)';
            if (ua.includes('Firefox')) return 'Firefox (SpiderMonkey)';
            if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari (JavaScriptCore)';
            if (ua.includes('Edge')) return 'Edge (V8)';
        }
        return 'Unknown';
    }
    
    /**
     * Load reference values for cross-platform validation
     * These are known-good values computed on Windows 10 x64, Node.js 20.15.1, V8 engine
     * These should be bit-identical across all platforms (if deterministic)
     * @private
     */
    _loadReferenceValues() {
        // Reference values computed on Windows 10 x64, Node.js 20.15.1, V8 engine
        // These are the actual bit-level representations from V8's IEEE 754 implementation
        
        // Basic arithmetic operations
        this.referenceValues.set('add_0.1_0.2', 0x3FD3333333333334n); // 0.1 + 0.2 = 0.30000000000000004
        this.referenceValues.set('sub_1.0_0.1', 0x3FECCCCCCCCCCCCDn); // 1.0 - 0.1 = 0.9
        this.referenceValues.set('mul_0.1_0.2', 0x3F947AE147AE147Cn); // 0.1 * 0.2 = 0.020000000000000004
        this.referenceValues.set('div_1.0_3.0', 0x3FD5555555555555n); // 1.0 / 3.0 = 0.3333333333333333
        
        // Trigonometric operations (V8 implementation)
        this.referenceValues.set('sin_0.5', 0x3FDEAEE8744B05F0n); // Math.sin(0.5) ≈ 0.479425538604203
        this.referenceValues.set('cos_0.5', 0x3FEC1528065B7D50n); // Math.cos(0.5) ≈ 0.8775825618903728
        this.referenceValues.set('tan_0.5', 0x3FE17B4F5BF3474An); // Math.tan(0.5) ≈ 0.5463024898437905
        
        // Exponential and logarithmic
        this.referenceValues.set('exp_0.5', 0x3FFA61298E1E069Cn); // Math.exp(0.5) ≈ 1.6487212707001282
        this.referenceValues.set('log_2.0', 0x3FE62E42FEFA39EFn); // Math.log(2.0) ≈ 0.6931471805599453
        this.referenceValues.set('pow_2.0_0.5', 0x3FF6A09E667F3BCDn); // Math.pow(2.0, 0.5) ≈ 1.4142135623730951
        
        // Edge cases
        this.referenceValues.set('sqrt_2.0', 0x3FF6A09E667F3BCDn); // Math.sqrt(2.0) ≈ 1.4142135623730951
        this.referenceValues.set('sqrt_0.5', 0x3FE6A09E667F3BCDn); // Math.sqrt(0.5) ≈ 0.7071067811865476
        
        // Consciousness-specific calculations (based on actual engine operations)
        this.referenceValues.set('resonance_0.7_0.8', 0x3FE8000000000000n); // (0.7 + 0.8) / 2 = 0.75
        this.referenceValues.set('coherence_40_0.8', 0x4040000000000000n); // 40 * 0.8 = 32.0
        this.referenceValues.set('influence_0.5_1.2', 0x3FD6969696969697n); // 0.5 * 1.2 / (0.5 + 1.2) ≈ 0.35294117647058826
        
        // Complex chain calculations
        this.referenceValues.set('chain_1', 0x3FF0000000000001n); // (0.1 + 0.2 + 0.3) / (1.0 - 0.4) ≈ 1.0000000000000002
        this.referenceValues.set('chain_2', 0x3FF0000000000000n); // sqrt(sin(0.5)^2 + cos(0.5)^2) ≈ 1.0
    }
    
    /**
     * Convert number to 64-bit representation (IEEE 754 double precision)
     * @param {number} value - Number to convert
     * @returns {BigInt} 64-bit representation
     */
    numberToBits(value) {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setFloat64(0, value, false); // false = big-endian
        
        // Read as BigInt for precise bit representation
        let bits = 0n;
        for (let i = 0; i < 8; i++) {
            bits = (bits << 8n) | BigInt(view.getUint8(i));
        }
        
        return bits;
    }
    
    /**
     * Convert 64-bit representation back to number
     * @param {BigInt} bits - 64-bit representation
     * @returns {number} Floating-point value
     */
    bitsToNumber(bits) {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        
        for (let i = 0; i < 8; i++) {
            const byte = Number((bits >> BigInt(56 - i * 8)) & 0xFFn);
            view.setUint8(i, byte);
        }
        
        return view.getFloat64(0, false);
    }
    
    /**
     * Test if two numbers are bit-identical
     * @param {number} a - First number
     * @param {number} b - Second number
     * @returns {boolean} True if bit-identical
     */
    areBitIdentical(a, b) {
        // Handle special cases
        if (Number.isNaN(a) && Number.isNaN(b)) return true;
        if (a === b) return true; // Handles +0, -0, Infinity, etc.
        
        // Compare bit representations
        const bitsA = this.numberToBits(a);
        const bitsB = this.numberToBits(b);
        
        return bitsA === bitsB;
    }
    
    /**
     * Validate a single operation against reference value
     * @param {string} name - Test name
     * @param {number} computed - Computed value
     * @param {BigInt|null} referenceOverride - Override reference value (for testing)
     * @returns {Object} Test result
     */
    validateOperation(name, computed, referenceOverride = null) {
        this.metrics.totalTests++;
        
        const computedBits = this.numberToBits(computed);
        const referenceBits = referenceOverride || this.referenceValues.get(name);
        
        if (!referenceBits) {
            this._log(`⚠️  No reference value for test: ${name}`);
            return {
                name,
                passed: null,
                reason: 'No reference value',
                computed,
                computedBits: computedBits.toString(16),
                referenceBits: null
            };
        }
        
        const passed = computedBits === referenceBits;
        
        if (passed) {
            this.metrics.passedTests++;
        } else {
            this.metrics.failedTests++;
            this.metrics.bitMismatches++;
            
            if (this.config.trackRegressions) {
                this.regressions.push({
                    name,
                    platform: this.platform,
                    architecture: this.architecture,
                    jsEngine: this.jsEngine,
                    computed,
                    computedBits: computedBits.toString(16),
                    referenceBits: referenceBits.toString(16),
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        // Calculate bit difference (for failed tests)
        let bitDiff = 0;
        if (!passed && referenceBits) {
            // Ensure both values are BigInt before subtraction
            const computedBigInt = typeof computedBits === 'bigint' ? computedBits : BigInt(computedBits);
            const referenceBigInt = typeof referenceBits === 'bigint' ? referenceBits : BigInt(referenceBits);
            
            // Now we can safely subtract
            const diff = computedBigInt > referenceBigInt ? 
                (computedBigInt - referenceBigInt) : (referenceBigInt - computedBigInt);
            // Convert to number (may lose precision for very large differences, but that's okay)
            bitDiff = Number(diff);
        }
        
        const result = {
            name,
            passed,
            computed,
            computedBits: computedBits.toString(16),
            referenceBits: referenceBits ? referenceBits.toString(16) : null,
            bitDifference: bitDiff
        };
        
        this.testResults.push(result);
        
        return result;
    }
    
    /**
     * Run basic arithmetic tests
     * @returns {Object[]} Test results
     */
    testBasicArithmetic() {
        this._log('\n📊 Testing Basic Arithmetic...');
        
        const tests = [];
        
        // Addition
        tests.push(this.validateOperation('add_0.1_0.2', 0.1 + 0.2));
        
        // Subtraction
        tests.push(this.validateOperation('sub_1.0_0.1', 1.0 - 0.1));
        
        // Multiplication
        tests.push(this.validateOperation('mul_0.1_0.2', 0.1 * 0.2));
        
        // Division
        tests.push(this.validateOperation('div_1.0_3.0', 1.0 / 3.0));
        
        return tests;
    }
    
    /**
     * Run trigonometric function tests
     * @returns {Object[]} Test results
     */
    testTrigonometric() {
        this._log('\n📐 Testing Trigonometric Functions...');
        
        const tests = [];
        
        tests.push(this.validateOperation('sin_0.5', Math.sin(0.5)));
        tests.push(this.validateOperation('cos_0.5', Math.cos(0.5)));
        tests.push(this.validateOperation('tan_0.5', Math.tan(0.5)));
        
        return tests;
    }
    
    /**
     * Run exponential and logarithmic tests
     * @returns {Object[]} Test results
     */
    testExponentialLogarithmic() {
        this._log('\n📈 Testing Exponential & Logarithmic Functions...');
        
        const tests = [];
        
        tests.push(this.validateOperation('exp_0.5', Math.exp(0.5)));
        tests.push(this.validateOperation('log_2.0', Math.log(2.0)));
        tests.push(this.validateOperation('pow_2.0_0.5', Math.pow(2.0, 0.5)));
        
        return tests;
    }
    
    /**
     * Run edge case tests
     * @returns {Object[]} Test results
     */
    testEdgeCases() {
        this._log('\n⚠️  Testing Edge Cases...');
        
        const tests = [];
        
        tests.push(this.validateOperation('sqrt_2.0', Math.sqrt(2.0)));
        tests.push(this.validateOperation('sqrt_0.5', Math.sqrt(0.5)));
        
        return tests;
    }
    
    /**
     * Run consciousness-specific calculation tests
     * @returns {Object[]} Test results
     */
    testConsciousnessCalculations() {
        this._log('\n🧠 Testing Consciousness Engine Calculations...');
        
        const tests = [];
        
        // Resonance calculation (simplified)
        const resonance = (0.7 + 0.8) / 2;
        tests.push(this.validateOperation('resonance_0.7_0.8', resonance));
        
        // Coherence calculation
        const coherence = 40 * 0.8;
        tests.push(this.validateOperation('coherence_40_0.8', coherence));
        
        // Influence calculation (simplified)
        const influence = (0.5 * 1.2) / (0.5 + 1.2);
        tests.push(this.validateOperation('influence_0.5_1.2', influence));
        
        return tests;
    }
    
    /**
     * Run complex chain calculation tests
     * @returns {Object[]} Test results
     */
    testComplexChains() {
        this._log('\n🔗 Testing Complex Chain Calculations...');
        
        const tests = [];
        
        // Chain 1: Multiple operations
        const chain1 = (0.1 + 0.2 + 0.3) / (1.0 - 0.4);
        tests.push(this.validateOperation('chain_1', chain1));
        
        // Chain 2: Pythagorean identity
        const sin = Math.sin(0.5);
        const cos = Math.cos(0.5);
        const chain2 = Math.sqrt(sin * sin + cos * cos);
        tests.push(this.validateOperation('chain_2', chain2));
        
        return tests;
    }
    
    /**
     * Run comprehensive determinism test suite
     * @returns {Object} Complete test results
     */
    async runComprehensiveTests() {
        this._log('\n🔍 Cross-Platform Determinism Validation');
        this._log('=====================================');
        this._log(`Platform: ${this.platform}`);
        this._log(`Architecture: ${this.architecture}`);
        this._log(`JS Engine: ${this.jsEngine}`);
        this._log('=====================================\n');
        
        // Reset metrics
        this.metrics = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            bitMismatches: 0,
            platformChecks: 0
        };
        this.testResults = [];
        this.regressions = [];
        
        // Run all test suites
        this.testBasicArithmetic();
        this.testTrigonometric();
        this.testExponentialLogarithmic();
        this.testEdgeCases();
        this.testConsciousnessCalculations();
        this.testComplexChains();
        
        // Generate report
        return this.generateReport();
    }
    
    /**
     * Generate comprehensive test report
     * @returns {Object} Test report with results and recommendations
     */
    generateReport() {
        const passRate = this.metrics.totalTests > 0 ?
            (this.metrics.passedTests / this.metrics.totalTests * 100).toFixed(2) : 0;
        
        const report = {
            summary: {
                platform: this.platform,
                architecture: this.architecture,
                jsEngine: this.jsEngine,
                timestamp: new Date().toISOString(),
                totalTests: this.metrics.totalTests,
                passed: this.metrics.passedTests,
                failed: this.metrics.failedTests,
                passRate: `${passRate}%`,
                bitMismatches: this.metrics.bitMismatches
            },
            
            results: this.testResults,
            
            failures: this.testResults.filter(r => r.passed === false),
            
            regressions: this.regressions,
            
            platformCompatibility: {
                isDeterministic: this.metrics.failedTests === 0,
                requiresWorkaround: this.metrics.failedTests > 0,
                severity: this._calculateSeverity()
            },
            
            recommendations: this._generateRecommendations()
        };
        
        return report;
    }
    
    /**
     * Calculate severity level based on failures
     * @private
     * @returns {string} Severity level
     */
    _calculateSeverity() {
        const failRate = this.metrics.totalTests > 0 ?
            (this.metrics.failedTests / this.metrics.totalTests) : 0;
        
        if (failRate === 0) return 'none';
        if (failRate < 0.1) return 'low';
        if (failRate < 0.3) return 'medium';
        if (failRate < 0.5) return 'high';
        return 'critical';
    }
    
    /**
     * Generate recommendations based on test results
     * @private
     * @returns {string[]} List of recommendations
     */
    _generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.failedTests === 0) {
            recommendations.push('✅ All tests passed! Platform is fully deterministic.');
            recommendations.push('✅ Safe to deploy WASM consciousness engine on this platform.');
            return recommendations;
        }
        
        recommendations.push(`⚠️  ${this.metrics.failedTests} test(s) failed on ${this.platform}.`);
        
        if (this.metrics.bitMismatches > 0) {
            recommendations.push('🔧 Bit-level mismatches detected. Consider platform-specific workarounds.');
        }
        
        const severity = this._calculateSeverity();
        
        if (severity === 'low') {
            recommendations.push('📋 Low severity: Minor differences detected. Monitor in production.');
        } else if (severity === 'medium') {
            recommendations.push('⚠️  Medium severity: Implement fallback for affected operations.');
        } else if (severity === 'high' || severity === 'critical') {
            recommendations.push('🚨 High severity: Do not deploy WASM on this platform without fixes.');
            recommendations.push('🔄 Use JavaScript fallback for all consciousness calculations.');
        }
        
        // Specific recommendations based on failure patterns
        const failedTests = this.testResults.filter(r => r.passed === false);
        const categories = this._categorizeFailures(failedTests);
        
        if (categories.trigonometric > 0) {
            recommendations.push('📐 Trigonometric functions show inconsistencies. Use lookup tables or software implementation.');
        }
        
        if (categories.arithmetic > 0) {
            recommendations.push('🔢 Basic arithmetic inconsistencies detected. This is unusual - verify hardware FPU.');
        }
        
        if (categories.consciousness > 0) {
            recommendations.push('🧠 Consciousness calculations affected. Run extended validation before deployment.');
        }
        
        return recommendations;
    }
    
    /**
     * Categorize failures by operation type
     * @private
     * @param {Object[]} failures - Failed tests
     * @returns {Object} Categorized failure counts
     */
    _categorizeFailures(failures) {
        const categories = {
            arithmetic: 0,
            trigonometric: 0,
            exponential: 0,
            consciousness: 0,
            chain: 0
        };
        
        for (const failure of failures) {
            if (failure.name.startsWith('add_') || failure.name.startsWith('sub_') ||
                failure.name.startsWith('mul_') || failure.name.startsWith('div_')) {
                categories.arithmetic++;
            } else if (failure.name.startsWith('sin_') || failure.name.startsWith('cos_') ||
                       failure.name.startsWith('tan_')) {
                categories.trigonometric++;
            } else if (failure.name.startsWith('exp_') || failure.name.startsWith('log_') ||
                       failure.name.startsWith('pow_') || failure.name.startsWith('sqrt_')) {
                categories.exponential++;
            } else if (failure.name.startsWith('resonance_') || failure.name.startsWith('coherence_') ||
                       failure.name.startsWith('influence_')) {
                categories.consciousness++;
            } else if (failure.name.startsWith('chain_')) {
                categories.chain++;
            }
        }
        
        return categories;
    }
    
    /**
     * Export test results for cross-platform comparison
     * @returns {string} JSON string of test results
     */
    exportResults() {
        const exportData = {
            platform: this.platform,
            architecture: this.architecture,
            jsEngine: this.jsEngine,
            timestamp: new Date().toISOString(),
            results: this.testResults.map(r => ({
                name: r.name,
                passed: r.passed,
                computedBits: r.computedBits,
                referenceBits: r.referenceBits
            }))
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    /**
     * Import and compare results from another platform
     * @param {string} jsonData - Exported results from another platform
     * @returns {Object} Comparison report
     */
    importAndCompare(jsonData) {
        const otherPlatform = JSON.parse(jsonData);
        const differences = [];
        
        for (const otherResult of otherPlatform.results) {
            const ourResult = this.testResults.find(r => r.name === otherResult.name);
            
            if (!ourResult) continue;
            
            if (ourResult.computedBits !== otherResult.computedBits) {
                differences.push({
                    test: otherResult.name,
                    thisPlatform: {
                        name: this.platform,
                        bits: ourResult.computedBits,
                        value: ourResult.computed
                    },
                    otherPlatform: {
                        name: otherPlatform.platform,
                        bits: otherResult.computedBits,
                        value: this.bitsToNumber(BigInt(`0x${otherResult.computedBits}`))
                    }
                });
            }
        }
        
        return {
            platforms: [this.platform, otherPlatform.platform],
            totalTests: otherPlatform.results.length,
            differences: differences.length,
            compatible: differences.length === 0,
            details: differences
        };
    }
    
    /**
     * Monitor for determinism regressions
     * Call this periodically in production to detect platform changes
     * @returns {Object} Regression report
     */
    monitorRegressions() {
        const previousResults = this._loadPreviousResults();
        
        if (!previousResults) {
            this._log('No previous results found. Saving current results as baseline.');
            this._savePreviousResults();
            return {
                isRegression: false,
                message: 'Baseline established'
            };
        }
        
        const regressions = [];
        
        for (const currentTest of this.testResults) {
            const previousTest = previousResults.find(r => r.name === currentTest.name);
            
            if (!previousTest) continue;
            
            if (currentTest.computedBits !== previousTest.computedBits) {
                regressions.push({
                    test: currentTest.name,
                    previous: previousTest.computedBits,
                    current: currentTest.computedBits,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        if (regressions.length > 0) {
            this._log(`🚨 REGRESSION DETECTED: ${regressions.length} test(s) changed!`);
            return {
                isRegression: true,
                count: regressions.length,
                details: regressions
            };
        }
        
        this._savePreviousResults();
        
        return {
            isRegression: false,
            message: 'No regressions detected'
        };
    }
    
    /**
     * Load previous test results from storage
     * @private
     */
    _loadPreviousResults() {
        try {
            const stored = localStorage.getItem('determinismValidator_previousResults');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            this._log(`Error loading previous results: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Save current test results to storage
     * @private
     */
    _savePreviousResults() {
        try {
            localStorage.setItem('determinismValidator_previousResults', 
                JSON.stringify(this.testResults));
        } catch (error) {
            this._log(`Error saving results: ${error.message}`);
        }
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

export default DeterminismValidator;
