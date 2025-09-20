/**
 * Consciousness Configuration Presets
 *
 * Predefined configuration sets optimized for different simulation scenarios.
 * Provides balanced, performance-focused, and behavior-focused presets.
 */

const ConsciousnessPresets = {
    // Default balanced configuration
    balanced: {
        name: 'Balanced Configuration',
        description: 'Well-balanced settings suitable for most simulation scenarios',
        config: {
            bounds: {
                frequency: { min: 3.0, max: 15.0, default: 7.5 },
                coherence: { min: 0.2, max: 1.0, default: 0.7 }
            },
            significance: {
                updateThreshold: 0.3,
                memoryThreshold: 0.3,
                eventThreshold: 0.2
            },
            behavioralMapping: {
                energy: {
                    low: { min: 0.0, max: 0.4, frequency: { min: 3.0, max: 6.0 } },
                    moderate: { min: 0.4, max: 0.7, frequency: { min: 6.0, max: 10.0 } },
                    high: { min: 0.7, max: 1.0, frequency: { min: 10.0, max: 15.0 } }
                },
                focus: {
                    scattered: { min: 0.0, max: 0.4, coherence: { min: 0.2, max: 0.5 } },
                    balanced: { min: 0.4, max: 0.7, coherence: { min: 0.5, max: 0.8 } },
                    focused: { min: 0.7, max: 1.0, coherence: { min: 0.8, max: 1.0 } }
                },
                mood: {
                    depressed: { min: 0.0, max: 0.3, frequency: { min: 3.0, max: 5.0 } },
                    content: { min: 0.3, max: 0.7, frequency: { min: 5.0, max: 10.0 } },
                    optimistic: { min: 0.7, max: 0.9, frequency: { min: 8.0, max: 12.0 } },
                    excited: { min: 0.9, max: 1.0, frequency: { min: 12.0, max: 15.0 } }
                }
            },
            decisionFactors: { min: 0.1, max: 3.0, default: 1.0 },
            memory: {
                maxMemoriesPerCharacter: 50,
                maxEventsPerCharacter: 20,
                significanceDecayRate: 0.1,
                recencyWeightDecay: 0.2
            },
            performance: {
                batchSize: 100,
                updateFrequencyLimit: 10,
                cacheTimeout: 300000,
                garbageCollectionInterval: 1000
            }
        },
        recommendedFor: ['general_simulation', 'mixed_populations', 'development_testing']
    },

    // Performance-optimized configuration
    performance: {
        name: 'Performance Optimized',
        description: 'Optimized for large-scale simulations with hundreds of NPCs',
        config: {
            bounds: {
                frequency: { min: 4.0, max: 12.0, default: 7.5 },
                coherence: { min: 0.3, max: 0.9, default: 0.6 }
            },
            significance: {
                updateThreshold: 0.5,  // Higher threshold = fewer updates
                memoryThreshold: 0.4,  // Higher threshold = less memory storage
                eventThreshold: 0.3    // Higher threshold = fewer events processed
            },
            behavioralMapping: {
                energy: {
                    low: { min: 0.0, max: 0.4, frequency: { min: 4.0, max: 7.0 } },
                    moderate: { min: 0.4, max: 0.7, frequency: { min: 7.0, max: 10.0 } },
                    high: { min: 0.7, max: 1.0, frequency: { min: 10.0, max: 12.0 } }
                },
                focus: {
                    scattered: { min: 0.0, max: 0.4, coherence: { min: 0.3, max: 0.5 } },
                    balanced: { min: 0.4, max: 0.7, coherence: { min: 0.5, max: 0.7 } },
                    focused: { min: 0.7, max: 1.0, coherence: { min: 0.7, max: 0.9 } }
                },
                mood: {
                    depressed: { min: 0.0, max: 0.3, frequency: { min: 4.0, max: 6.0 } },
                    content: { min: 0.3, max: 0.7, frequency: { min: 6.0, max: 9.0 } },
                    optimistic: { min: 0.7, max: 0.9, frequency: { min: 8.0, max: 11.0 } },
                    excited: { min: 0.9, max: 1.0, frequency: { min: 10.0, max: 12.0 } }
                }
            },
            decisionFactors: { min: 0.2, max: 2.5, default: 1.0 }, // Narrower range for stability
            memory: {
                maxMemoriesPerCharacter: 30,  // Reduced memory usage
                maxEventsPerCharacter: 15,    // Reduced event storage
                significanceDecayRate: 0.15,  // Faster decay
                recencyWeightDecay: 0.25      // Faster recency decay
            },
            performance: {
                batchSize: 150,               // Larger batches for efficiency
                updateFrequencyLimit: 8,      // Fewer updates per character
                cacheTimeout: 600000,         // Longer cache timeout (10 minutes)
                garbageCollectionInterval: 500 // More frequent cleanup
            }
        },
        recommendedFor: ['large_scale_simulation', 'server_deployment', 'performance_critical']
    },

    // Behavior-focused configuration
    behavioral: {
        name: 'Behavioral Depth',
        description: 'Optimized for rich, nuanced NPC behavior and character development',
        config: {
            bounds: {
                frequency: { min: 2.5, max: 18.0, default: 8.0 }, // Wider range for variety
                coherence: { min: 0.15, max: 1.0, default: 0.75 }  // Wider range for variety
            },
            significance: {
                updateThreshold: 0.2,  // Lower threshold = more updates
                memoryThreshold: 0.25, // Lower threshold = more memories
                eventThreshold: 0.15   // Lower threshold = more events
            },
            behavioralMapping: {
                energy: {
                    low: { min: 0.0, max: 0.35, frequency: { min: 2.5, max: 5.5 } },
                    moderate: { min: 0.35, max: 0.65, frequency: { min: 5.5, max: 11.0 } },
                    high: { min: 0.65, max: 1.0, frequency: { min: 11.0, max: 18.0 } }
                },
                focus: {
                    scattered: { min: 0.0, max: 0.35, coherence: { min: 0.15, max: 0.45 } },
                    balanced: { min: 0.35, max: 0.65, coherence: { min: 0.45, max: 0.8 } },
                    focused: { min: 0.65, max: 1.0, coherence: { min: 0.8, max: 1.0 } }
                },
                mood: {
                    depressed: { min: 0.0, max: 0.25, frequency: { min: 2.5, max: 4.5 } },
                    content: { min: 0.25, max: 0.65, frequency: { min: 4.5, max: 11.0 } },
                    optimistic: { min: 0.65, max: 0.85, frequency: { min: 9.0, max: 14.0 } },
                    excited: { min: 0.85, max: 1.0, frequency: { min: 13.0, max: 18.0 } }
                }
            },
            decisionFactors: { min: 0.05, max: 4.0, default: 1.0 }, // Wider range for variety
            memory: {
                maxMemoriesPerCharacter: 75,  // More memories for richer behavior
                maxEventsPerCharacter: 30,    // More events for detailed history
                significanceDecayRate: 0.08,  // Slower decay for longer memory
                recencyWeightDecay: 0.15      // Slower recency decay
            },
            performance: {
                batchSize: 75,                // Smaller batches for more frequent updates
                updateFrequencyLimit: 15,     // More updates per character
                cacheTimeout: 180000,         // Shorter cache timeout (3 minutes)
                garbageCollectionInterval: 1500 // Less frequent cleanup to preserve memories
            }
        },
        recommendedFor: ['character_study', 'narrative_focus', 'small_populations', 'research']
    },

    // Stable configuration for long-running simulations
    stable: {
        name: 'Long-Term Stable',
        description: 'Designed for extended simulations with consistent, predictable behavior',
        config: {
            bounds: {
                frequency: { min: 5.0, max: 10.0, default: 7.5 }, // Narrow, stable range
                coherence: { min: 0.4, max: 0.8, default: 0.6 }   // Narrow, stable range
            },
            significance: {
                updateThreshold: 0.4,  // Higher threshold for stability
                memoryThreshold: 0.35, // Moderate memory storage
                eventThreshold: 0.25   // Moderate event processing
            },
            behavioralMapping: {
                energy: {
                    low: { min: 0.0, max: 0.4, frequency: { min: 5.0, max: 6.5 } },
                    moderate: { min: 0.4, max: 0.7, frequency: { min: 6.5, max: 8.5 } },
                    high: { min: 0.7, max: 1.0, frequency: { min: 8.5, max: 10.0 } }
                },
                focus: {
                    scattered: { min: 0.0, max: 0.4, coherence: { min: 0.4, max: 0.55 } },
                    balanced: { min: 0.4, max: 0.7, coherence: { min: 0.55, max: 0.7 } },
                    focused: { min: 0.7, max: 1.0, coherence: { min: 0.7, max: 0.8 } }
                },
                mood: {
                    depressed: { min: 0.0, max: 0.3, frequency: { min: 5.0, max: 6.0 } },
                    content: { min: 0.3, max: 0.7, frequency: { min: 6.0, max: 8.5 } },
                    optimistic: { min: 0.7, max: 0.9, frequency: { min: 7.5, max: 9.5 } },
                    excited: { min: 0.9, max: 1.0, frequency: { min: 9.0, max: 10.0 } }
                }
            },
            decisionFactors: { min: 0.3, max: 2.0, default: 1.0 }, // Conservative range
            memory: {
                maxMemoriesPerCharacter: 40,  // Moderate memory usage
                maxEventsPerCharacter: 18,    // Moderate event storage
                significanceDecayRate: 0.12,  // Moderate decay
                recencyWeightDecay: 0.18      // Moderate recency decay
            },
            performance: {
                batchSize: 120,               // Balanced batch size
                updateFrequencyLimit: 6,      // Conservative update frequency
                cacheTimeout: 450000,         // Long cache timeout (7.5 minutes)
                garbageCollectionInterval: 800 // Regular cleanup
            }
        },
        recommendedFor: ['long_term_simulation', 'historical_modeling', 'stable_populations']
    },

    // Experimental configuration for testing edge cases
    experimental: {
        name: 'Experimental Testing',
        description: 'For testing extreme scenarios and edge cases in consciousness behavior',
        config: {
            bounds: {
                frequency: { min: 1.0, max: 20.0, default: 10.0 }, // Very wide range
                coherence: { min: 0.1, max: 1.0, default: 0.5 }    // Very wide range
            },
            significance: {
                updateThreshold: 0.1,  // Very low threshold
                memoryThreshold: 0.15, // Very low threshold
                eventThreshold: 0.05   // Very low threshold
            },
            behavioralMapping: {
                energy: {
                    low: { min: 0.0, max: 0.3, frequency: { min: 1.0, max: 4.0 } },
                    moderate: { min: 0.3, max: 0.7, frequency: { min: 4.0, max: 12.0 } },
                    high: { min: 0.7, max: 1.0, frequency: { min: 12.0, max: 20.0 } }
                },
                focus: {
                    scattered: { min: 0.0, max: 0.3, coherence: { min: 0.1, max: 0.4 } },
                    balanced: { min: 0.3, max: 0.7, coherence: { min: 0.4, max: 0.7 } },
                    focused: { min: 0.7, max: 1.0, coherence: { min: 0.7, max: 1.0 } }
                },
                mood: {
                    depressed: { min: 0.0, max: 0.2, frequency: { min: 1.0, max: 3.0 } },
                    content: { min: 0.2, max: 0.6, frequency: { min: 3.0, max: 12.0 } },
                    optimistic: { min: 0.6, max: 0.8, frequency: { min: 10.0, max: 16.0 } },
                    excited: { min: 0.8, max: 1.0, frequency: { min: 15.0, max: 20.0 } }
                }
            },
            decisionFactors: { min: 0.01, max: 5.0, default: 1.0 }, // Extreme range
            memory: {
                maxMemoriesPerCharacter: 100, // High memory for detailed tracking
                maxEventsPerCharacter: 50,    // High event storage
                significanceDecayRate: 0.05,  // Very slow decay
                recencyWeightDecay: 0.1       // Very slow recency decay
            },
            performance: {
                batchSize: 50,                // Small batches for detailed processing
                updateFrequencyLimit: 25,     // High update frequency
                cacheTimeout: 60000,          // Short cache timeout (1 minute)
                garbageCollectionInterval: 2000 // Infrequent cleanup for data preservation
            }
        },
        recommendedFor: ['testing', 'research', 'edge_case_analysis', 'development']
    }
};

// Event significance weights for different presets
const EventSignificancePresets = {
    balanced: {
        goal_completion: 0.8,
        goal_failure: 0.7,
        social_success: 0.6,
        social_failure: 0.5,
        conflict: 0.7,
        traumatic_encounter: 1.0,
        economic_gain: 0.4,
        economic_loss: 0.5,
        birth: 0.9,
        death: 0.8,
        marriage: 0.7,
        discovery: 0.6,
        skill_improvement: 0.4,
        relationship_change: 0.5
    },
    
    performance: {
        goal_completion: 0.9,
        goal_failure: 0.8,
        social_success: 0.7,
        social_failure: 0.6,
        conflict: 0.8,
        traumatic_encounter: 1.0,
        economic_gain: 0.5,
        economic_loss: 0.6,
        birth: 1.0,
        death: 0.9,
        marriage: 0.8,
        discovery: 0.7,
        skill_improvement: 0.5,
        relationship_change: 0.6
    },
    
    behavioral: {
        goal_completion: 0.7,
        goal_failure: 0.6,
        social_success: 0.5,
        social_failure: 0.4,
        conflict: 0.6,
        traumatic_encounter: 0.9,
        economic_gain: 0.3,
        economic_loss: 0.4,
        birth: 0.8,
        death: 0.7,
        marriage: 0.6,
        discovery: 0.5,
        skill_improvement: 0.3,
        relationship_change: 0.4
    },
    
    stable: {
        goal_completion: 0.8,
        goal_failure: 0.7,
        social_success: 0.6,
        social_failure: 0.5,
        conflict: 0.7,
        traumatic_encounter: 0.9,
        economic_gain: 0.4,
        economic_loss: 0.5,
        birth: 0.8,
        death: 0.7,
        marriage: 0.7,
        discovery: 0.6,
        skill_improvement: 0.4,
        relationship_change: 0.5
    },
    
    experimental: {
        goal_completion: 0.6,
        goal_failure: 0.5,
        social_success: 0.4,
        social_failure: 0.3,
        conflict: 0.5,
        traumatic_encounter: 0.8,
        economic_gain: 0.2,
        economic_loss: 0.3,
        birth: 0.7,
        death: 0.6,
        marriage: 0.5,
        discovery: 0.4,
        skill_improvement: 0.2,
        relationship_change: 0.3
    }
};

// Update rules for different presets
const UpdateRulePresets = {
    balanced: {
        goal_completion: { frequency: +0.3, coherence: +0.05 },
        goal_failure: { frequency: -0.5, coherence: -0.1 },
        social_success: { frequency: +0.2, coherence: +0.03 },
        social_failure: { frequency: -0.3, coherence: -0.05 },
        conflict: { frequency: +0.6, coherence: -0.1 },
        traumatic_encounter: { frequency: -1.0, coherence: -0.2 },
        economic_gain: { frequency: +0.2, coherence: +0.03 },
        economic_loss: { frequency: -0.4, coherence: -0.07 },
        birth: { frequency: +0.5, coherence: +0.1 },
        death: { frequency: -0.7, coherence: -0.12 },
        marriage: { frequency: +0.6, coherence: +0.08 },
        discovery: { frequency: +0.4, coherence: +0.06 },
        skill_improvement: { frequency: +0.2, coherence: +0.04 }
    },
    
    performance: {
        goal_completion: { frequency: +0.4, coherence: +0.06 },
        goal_failure: { frequency: -0.6, coherence: -0.12 },
        social_success: { frequency: +0.3, coherence: +0.04 },
        social_failure: { frequency: -0.4, coherence: -0.06 },
        conflict: { frequency: +0.7, coherence: -0.12 },
        traumatic_encounter: { frequency: -1.2, coherence: -0.25 },
        economic_gain: { frequency: +0.3, coherence: +0.04 },
        economic_loss: { frequency: -0.5, coherence: -0.08 },
        birth: { frequency: +0.6, coherence: +0.12 },
        death: { frequency: -0.8, coherence: -0.15 },
        marriage: { frequency: +0.7, coherence: +0.1 },
        discovery: { frequency: +0.5, coherence: +0.07 },
        skill_improvement: { frequency: +0.3, coherence: +0.05 }
    },
    
    behavioral: {
        goal_completion: { frequency: +0.2, coherence: +0.03 },
        goal_failure: { frequency: -0.3, coherence: -0.06 },
        social_success: { frequency: +0.15, coherence: +0.02 },
        social_failure: { frequency: -0.2, coherence: -0.03 },
        conflict: { frequency: +0.4, coherence: -0.06 },
        traumatic_encounter: { frequency: -0.7, coherence: -0.15 },
        economic_gain: { frequency: +0.1, coherence: +0.02 },
        economic_loss: { frequency: -0.25, coherence: -0.04 },
        birth: { frequency: +0.3, coherence: +0.06 },
        death: { frequency: -0.5, coherence: -0.08 },
        marriage: { frequency: +0.4, coherence: +0.05 },
        discovery: { frequency: +0.25, coherence: +0.04 },
        skill_improvement: { frequency: +0.15, coherence: +0.02 }
    },
    
    stable: {
        goal_completion: { frequency: +0.25, coherence: +0.04 },
        goal_failure: { frequency: -0.4, coherence: -0.08 },
        social_success: { frequency: +0.15, coherence: +0.025 },
        social_failure: { frequency: -0.25, coherence: -0.04 },
        conflict: { frequency: +0.5, coherence: -0.08 },
        traumatic_encounter: { frequency: -0.8, coherence: -0.15 },
        economic_gain: { frequency: +0.15, coherence: +0.025 },
        economic_loss: { frequency: -0.3, coherence: -0.05 },
        birth: { frequency: +0.4, coherence: +0.08 },
        death: { frequency: -0.6, coherence: -0.1 },
        marriage: { frequency: +0.5, coherence: +0.07 },
        discovery: { frequency: +0.3, coherence: +0.05 },
        skill_improvement: { frequency: +0.2, coherence: +0.03 }
    },
    
    experimental: {
        goal_completion: { frequency: +0.1, coherence: +0.01 },
        goal_failure: { frequency: -0.2, coherence: -0.03 },
        social_success: { frequency: +0.08, coherence: +0.01 },
        social_failure: { frequency: -0.12, coherence: -0.02 },
        conflict: { frequency: +0.25, coherence: -0.03 },
        traumatic_encounter: { frequency: -0.4, coherence: -0.08 },
        economic_gain: { frequency: +0.05, coherence: +0.01 },
        economic_loss: { frequency: -0.15, coherence: -0.02 },
        birth: { frequency: +0.2, coherence: +0.03 },
        death: { frequency: -0.3, coherence: -0.05 },
        marriage: { frequency: +0.25, coherence: +0.03 },
        discovery: { frequency: +0.15, coherence: +0.02 },
        skill_improvement: { frequency: +0.08, coherence: +0.01 }
    }
};

/**
 * Get complete preset configuration
 * @param {string} presetName - Name of the preset
 * @returns {Object} Complete configuration with event weights and update rules
 */
function getPresetConfiguration(presetName) {
    const preset = ConsciousnessPresets[presetName];
    if (!preset) {
        throw new Error(`Unknown preset: ${presetName}`);
    }

    return {
        ...preset.config,
        eventSignificanceWeights: EventSignificancePresets[presetName] || EventSignificancePresets.balanced,
        updateRules: UpdateRulePresets[presetName] || UpdateRulePresets.balanced
    };
}

/**
 * Get list of available presets
 * @returns {Array} Array of preset information
 */
function getAvailablePresets() {
    return Object.entries(ConsciousnessPresets).map(([key, preset]) => ({
        id: key,
        name: preset.name,
        description: preset.description,
        recommendedFor: preset.recommendedFor
    }));
}

/**
 * Create custom preset based on existing preset
 * @param {string} basePreset - Base preset to modify
 * @param {Object} modifications - Modifications to apply
 * @returns {Object} Modified configuration
 */
function createCustomPreset(basePreset, modifications) {
    const baseConfig = getPresetConfiguration(basePreset);
    
    // Deep merge modifications
    function deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    return deepMerge(baseConfig, modifications);
}

export {
    ConsciousnessPresets,
    EventSignificancePresets,
    UpdateRulePresets,
    getPresetConfiguration,
    getAvailablePresets,
    createCustomPreset
};