/**
 * ConsciousnessEngineWasm - JavaScript Wrapper for WASM Consciousness Engine
 * 
 * Provides a clean API that matches the existing JavaScript implementation
 * while leveraging high-performance Rust/WASM calculations.
 * 
 * Features:
 * - Automatic type conversion (JS objects ↔ Rust structs)
 * - Enum handling (strings ↔ Rust enums)
 * - Fallback to JavaScript if WASM unavailable
 * - Performance monitoring
 * - Error handling with graceful degradation
 */

export class ConsciousnessEngineWasm {
    constructor() {
        this.wasmModule = null;
        this.isReady = false;
        this.useFallback = false;
        this.performanceStats = {
            wasmCalls: 0,
            fallbackCalls: 0,
            totalTime: 0,
            averageTime: 0
        };
    }

    /**
     * Initialize the WASM module
     * @returns {Promise<boolean>} True if initialization successful
     */
    async initialize() {
        try {
            // Dynamic import of WASM module (relative to project root)
            const wasm = await import('../../pkg/consciousness_engine.js');
            this.wasmModule = wasm;
            this.isReady = true;
            this.useFallback = false;
            
            console.log('✅ WASM Consciousness Engine initialized');
            console.log(`   Version: ${wasm.get_version()}`);
            console.log(`   Build: ${wasm.get_build_info()}`);
            
            return true;
        } catch (error) {
            console.warn('⚠️  WASM initialization failed, using JavaScript fallback:', error.message);
            this.useFallback = true;
            this.isReady = true;
            return false;
        }
    }

    /**
     * Calculate behavioral state from consciousness parameters
     * @param {Object} consciousnessState - Consciousness state object
     * @returns {Object} Behavioral state
     */
    calculateBehavioralState(consciousnessState) {
        const startTime = performance.now();

        try {
            if (this.useFallback || !this.wasmModule) {
                return this._calculateBehavioralStateFallback(consciousnessState);
            }

            // Convert JavaScript object to WASM-compatible format
            const wasmInput = this._toWasmConsciousnessState(consciousnessState);
            
            // Call WASM function
            const result = this.wasmModule.calculate_behavioral_state(wasmInput);
            
            // Convert WASM result to JavaScript object
            const jsResult = this._fromWasmBehavioralState(result);
            
            this._recordPerformance(startTime, false);
            return jsResult;
        } catch (error) {
            console.error('WASM behavioral state calculation failed:', error);
            return this._calculateBehavioralStateFallback(consciousnessState);
        }
    }

    /**
     * Calculate batch behavioral states (optimized for multiple characters)
     * @param {Array<Object>} consciousnessStates - Array of consciousness states
     * @returns {Array<Object>} Array of behavioral states
     */
    calculateBatchBehavioralStates(consciousnessStates) {
        const startTime = performance.now();

        try {
            if (this.useFallback || !this.wasmModule) {
                return consciousnessStates.map(state => 
                    this._calculateBehavioralStateFallback(state)
                );
            }

            // Convert to WASM format
            const wasmInputs = consciousnessStates.map(state => 
                this._toWasmConsciousnessState(state)
            );
            
            // Call WASM batch function
            const results = this.wasmModule.calculate_batch_behavioral_states(wasmInputs);
            
            // Convert results back to JavaScript
            const jsResults = results.map(result => 
                this._fromWasmBehavioralState(result)
            );
            
            this._recordPerformance(startTime, false);
            return jsResults;
        } catch (error) {
            console.error('WASM batch calculation failed:', error);
            return consciousnessStates.map(state => 
                this._calculateBehavioralStateFallback(state)
            );
        }
    }

    /**
     * Calculate emotional coherence
     * @param {number} frequency - Consciousness frequency (3-15 Hz)
     * @param {number} baseCoherence - Base coherence (0.2-1.0)
     * @returns {number} Emotional coherence
     */
    calculateEmotionalCoherence(frequency, baseCoherence) {
        try {
            if (this.useFallback || !this.wasmModule) {
                return this._calculateEmotionalCoherenceFallback(frequency, baseCoherence);
            }

            return this.wasmModule.calculate_emotional_coherence(frequency, baseCoherence);
        } catch (error) {
            console.error('WASM emotional coherence calculation failed:', error);
            return this._calculateEmotionalCoherenceFallback(frequency, baseCoherence);
        }
    }

    /**
     * Determine emotional state from coherence and impact
     * @param {number} coherence - Emotional coherence
     * @param {number} impactMagnitude - Impact magnitude
     * @returns {string} Emotional state
     */
    determineEmotionalState(coherence, impactMagnitude) {
        try {
            if (this.useFallback || !this.wasmModule) {
                return this._determineEmotionalStateFallback(coherence, impactMagnitude);
            }

            return this.wasmModule.determine_emotional_state(coherence, impactMagnitude);
        } catch (error) {
            console.error('WASM emotional state determination failed:', error);
            return this._determineEmotionalStateFallback(coherence, impactMagnitude);
        }
    }

    /**
     * Get default configuration
     * @returns {Object} Configuration object
     */
    getDefaultConfiguration() {
        try {
            if (this.useFallback || !this.wasmModule) {
                return this._getDefaultConfigurationFallback();
            }

            return this.wasmModule.get_default_configuration();
        } catch (error) {
            console.error('WASM configuration retrieval failed:', error);
            return this._getDefaultConfigurationFallback();
        }
    }

    /**
     * Validate configuration
     * @param {Object} config - Configuration to validate
     * @returns {boolean} True if valid
     */
    validateConfiguration(config) {
        try {
            if (this.useFallback || !this.wasmModule) {
                return this._validateConfigurationFallback(config);
            }

            return this.wasmModule.validate_configuration(config);
        } catch (error) {
            console.error('WASM configuration validation failed:', error);
            return this._validateConfigurationFallback(config);
        }
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance stats
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            wasmEnabled: !this.useFallback && this.isReady,
            module: this.wasmModule ? 'WASM' : 'JavaScript'
        };
    }

    // ==================== Private Methods ====================

    /**
     * Convert JavaScript consciousness state to WASM format
     * @private
     */
    _toWasmConsciousnessState(jsState) {
        return {
            base_frequency: jsState.baseFrequency || jsState.base_frequency || 7.5,
            base_coherence: jsState.baseCoherence || jsState.base_coherence || 0.7,
            current_frequency: jsState.currentFrequency || jsState.current_frequency || 
                             jsState.baseFrequency || jsState.base_frequency || 7.5,
            emotional_coherence: jsState.emotionalCoherence || jsState.emotional_coherence || 
                               jsState.baseCoherence || jsState.base_coherence || 0.7,
            emotional_state: this._toWasmEmotionalState(jsState.emotionalState || jsState.emotional_state),
            last_update: jsState.lastUpdate || jsState.last_update || Date.now()
        };
    }

    /**
     * Convert JavaScript emotional state to WASM format
     * @private
     */
    _toWasmEmotionalState(jsState) {
        if (!jsState) return 'Content';
        
        // Handle string enum values
        if (typeof jsState === 'string') {
            const normalized = jsState.charAt(0).toUpperCase() + jsState.slice(1).toLowerCase();
            return normalized;
        }
        
        return 'Content';
    }

    /**
     * Convert WASM behavioral state to JavaScript format
     * @private
     */
    _fromWasmBehavioralState(wasmState) {
        return {
            energy: wasmState.energy,
            focus: wasmState.focus,
            mood: wasmState.mood,
            socialDrive: wasmState.social_drive,
            riskTolerance: wasmState.risk_tolerance,
            ambition: wasmState.ambition,
            cachedTimestamp: wasmState.cached_timestamp || 0
        };
    }

    /**
     * Record performance metrics
     * @private
     */
    _recordPerformance(startTime, isFallback) {
        const duration = performance.now() - startTime;
        
        if (isFallback) {
            this.performanceStats.fallbackCalls++;
        } else {
            this.performanceStats.wasmCalls++;
        }
        
        this.performanceStats.totalTime += duration;
        const totalCalls = this.performanceStats.wasmCalls + this.performanceStats.fallbackCalls;
        this.performanceStats.averageTime = this.performanceStats.totalTime / totalCalls;
    }

    // ==================== Fallback Methods (JavaScript Implementation) ====================

    /**
     * JavaScript fallback for behavioral state calculation
     * @private
     */
    _calculateBehavioralStateFallback(consciousnessState) {
        const startTime = performance.now();
        
        const frequency = consciousnessState.baseFrequency || 
                         consciousnessState.currentFrequency || 7.5;
        const coherence = consciousnessState.baseCoherence || 
                         consciousnessState.emotionalCoherence || 0.7;

        const result = {
            energy: this._mapFrequencyToEnergy(frequency),
            focus: this._mapCoherenceToFocus(coherence),
            mood: this._calculateMoodFromState(frequency, coherence),
            socialDrive: Math.max(0, Math.min(1, (frequency - 4) / 8)),
            riskTolerance: Math.max(0, Math.min(1, (frequency - 6) / 6)),
            ambition: Math.max(0, Math.min(1, coherence * (frequency / 10))),
            cachedTimestamp: 0
        };

        this._recordPerformance(startTime, true);
        return result;
    }

    /**
     * JavaScript fallback for emotional coherence calculation
     * @private
     */
    _calculateEmotionalCoherenceFallback(frequency, baseCoherence) {
        // Simple resonance calculation
        const resonance = Math.abs(frequency - 7.5) / 7.5;
        return baseCoherence * (1 - resonance * 0.3);
    }

    /**
     * JavaScript fallback for emotional state determination
     * @private
     */
    _determineEmotionalStateFallback(coherence, impactMagnitude) {
        if (impactMagnitude > 0.7 && coherence > 0.6) return 'Joyful';
        if (impactMagnitude > 0.5) return 'Excited';
        if (impactMagnitude < -0.7) return 'Depressed';
        if (impactMagnitude < -0.3) return 'Anxious';
        return 'Content';
    }

    /**
     * Map frequency to energy level
     * @private
     */
    _mapFrequencyToEnergy(frequency) {
        if (frequency < 5) return 'Low';
        if (frequency < 10) return 'Moderate';
        return 'High';
    }

    /**
     * Map coherence to focus level
     * @private
     */
    _mapCoherenceToFocus(coherence) {
        if (coherence < 0.4) return 'Scattered';
        if (coherence < 0.8) return 'Balanced';
        return 'Focused';
    }

    /**
     * Calculate mood from frequency and coherence
     * @private
     */
    _calculateMoodFromState(frequency, coherence) {
        const moodScore = (frequency / 15) * 0.7 + coherence * 0.3;

        if (moodScore < 0.3) return 'Depressed';
        if (moodScore < 0.6) return 'Content';
        if (moodScore < 0.8) return 'Optimistic';
        return 'Excited';
    }

    /**
     * Get default configuration (fallback)
     * @private
     */
    _getDefaultConfigurationFallback() {
        return {
            bounds: {
                frequency: {
                    min: 3.0,
                    max: 15.0,
                    default: 7.5,
                    description: 'Consciousness frequency in Hz (3-15 range)'
                },
                coherence: {
                    min: 0.2,
                    max: 1.0,
                    default: 0.7,
                    description: 'Consciousness coherence (0.2-1.0 range)'
                }
            }
        };
    }

    /**
     * Validate configuration (fallback)
     * @private
     */
    _validateConfigurationFallback(config) {
        if (!config || !config.bounds) return false;
        
        const { frequency, coherence } = config.bounds;
        
        return frequency && 
               frequency.min >= 3 && 
               frequency.max <= 15 &&
               coherence &&
               coherence.min >= 0.2 &&
               coherence.max <= 1.0;
    }
}

// Export singleton instance
export const consciousnessEngine = new ConsciousnessEngineWasm();
