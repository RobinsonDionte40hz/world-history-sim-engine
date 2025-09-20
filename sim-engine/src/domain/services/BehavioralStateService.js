/**
 * Behavioral State Service
 *
 * Consolidates decision factor calculation for character behavior.
 * Implements interaction type mapping and bounded decision factor calculation (0.1x to 3.0x range).
 * Integrates personality, memory, and consciousness influences for comprehensive behavioral decisions.
 */

import BaseDomainService from './BaseDomainService.js';
import SignificantMemoryService from './SignificantMemoryService.js';
import ConsciousnessErrorHandlingService from './ConsciousnessErrorHandlingService.js';
import MemoryManagementService from './MemoryManagementService.js';

class BehavioralStateService extends BaseDomainService {
    constructor(memoryService, logger = null, errorHandler = null) {
        super(); // BaseDomainService doesn't accept parameters
        // Only create default memory service if memoryService is undefined (not explicitly null)
        this.memoryService = memoryService === undefined ? new SignificantMemoryService() : memoryService;
        this.logger = logger;
        this.errorHandler = errorHandler || new ConsciousnessErrorHandlingService(logger);

        // Memory management service for automatic memory optimization
        this.memoryManager = new MemoryManagementService(logger, errorHandler);

        // Interaction type mappings for behavioral modifiers
        this.interactionTypeMappings = {
            'social': {
                baseModifier: 1.0,
                personalityTraits: {
                    'extrovert': 1.5,
                    'introvert': 0.7,
                    'empathy': 1.3,
                    'aggression': 0.8
                },
                consciousnessFactors: {
                    socialDrive: 1.2,
                    coherence: 1.1
                }
            },
            'combat': {
                baseModifier: 1.0,
                personalityTraits: {
                    'aggression': 1.4,
                    'cowardice': 0.6,
                    'bravery': 1.3,
                    'caution': 0.8
                },
                consciousnessFactors: {
                    riskTolerance: 1.2,
                    energy: 1.1
                }
            },
            'exploration': {
                baseModifier: 1.0,
                personalityTraits: {
                    'curiosity': 1.4,
                    'caution': 0.7,
                    'adventurous': 1.3,
                    'content': 0.8
                },
                consciousnessFactors: {
                    riskTolerance: 1.2,
                    focus: 1.1
                }
            },
            'economic': {
                baseModifier: 1.0,
                personalityTraits: {
                    'greed': 1.3,
                    'generosity': 0.8,
                    'ambition': 1.2,
                    'content': 0.9
                },
                consciousnessFactors: {
                    ambition: 1.2,
                    focus: 1.1
                }
            },
            'rest': {
                baseModifier: 1.0,
                personalityTraits: {
                    'lazy': 1.3,
                    'disciplined': 0.8,
                    'exhaustion': 1.2
                },
                consciousnessFactors: {
                    energy: 0.8, // Lower energy increases rest desire
                    coherence: 1.0
                }
            },
            'relationship': {
                baseModifier: 1.0,
                personalityTraits: {
                    'loyalty': 1.3,
                    'deception': 0.7,
                    'empathy': 1.2,
                    'selfishness': 0.8
                },
                consciousnessFactors: {
                    socialDrive: 1.2,
                    coherence: 1.1
                }
            }
        };

        // Decision factor bounds
        this.MIN_DECISION_FACTOR = 0.1;
        this.MAX_DECISION_FACTOR = 3.0;
    }

    /**
     * Get behavioral modifier for a specific interaction type
     * @param {Object} character - Character object with consciousness, personality, etc.
     * @param {string} interactionType - Type of interaction (social, combat, exploration, etc.)
     * @param {Object} context - Additional context for decision making
     * @returns {number} Behavioral modifier (bounded 0.1x to 3.0x)
     */
    getBehavioralModifier(character, interactionType, context = {}) {
        try {
            // Validate character and consciousness
            if (!character) {
                if (this.logger) {
                    this.logger.warn('Character is required for behavioral modifier calculation');
                }
                return 1.0;
            }

            // Check for missing or corrupted behavioral state and attempt recovery
            if (character.consciousness && !this.errorHandler.isValidBehavioralState(character.consciousness.behavioralState)) {
                const recoveryResult = this.errorHandler.handleMissingBehavioralState(character, {
                    interactionType,
                    context,
                    source: 'getBehavioralModifier'
                });

                if (!recoveryResult.success && this.logger) {
                    this.logger.warn(`Failed to recover behavioral state for character ${character.id}`);
                }
            }

            // Get base modifier for interaction type
            const typeMapping = this.interactionTypeMappings[interactionType];
            if (!typeMapping) {
                if (this.logger) {
                    this.logger.warn(`Unknown interaction type: ${interactionType}, using default`);
                }
                return 1.0; // Neutral modifier
            }

            let modifier = typeMapping.baseModifier;

            // Apply personality modifier
            modifier *= this.getPersonalityModifier(character, interactionType);

            // Apply consciousness modifier
            modifier *= this.getConsciousnessModifier(character, interactionType);

            // Apply memory modifier if memory service is available
            if (this.memoryService) {
                modifier *= this.getMemoryModifier(character, interactionType, context);
            }

            // Apply context-specific modifiers
            modifier *= this.getContextModifier(character, interactionType, context);

            // Apply energy and health modifiers
            modifier *= this.getPhysicalStateModifier(character);

            // Ensure bounds are respected
            return this.clampDecisionFactor(modifier);

        } catch (error) {
            // Use error handling service for comprehensive error recovery
            const errorResult = this.errorHandler.handleCalculationFailure(error, {
                calculationType: 'behavioral_modifier',
                character,
                interactionType,
                context
            });

            if (this.logger) {
                this.logger.error(`Error calculating behavioral modifier: ${error.message}`);
            }

            return errorResult.fallbackValue || 1.0;
        }
    }

    /**
     * Get personality modifier for interaction type
     * @param {Object} character - Character with personality data
     * @param {string} interactionType - Type of interaction
     * @returns {number} Personality modifier
     */
    getPersonalityModifier(character, interactionType) {
        if (!character || !character.personality) {
            return 1.0;
        }

        const typeMapping = this.interactionTypeMappings[interactionType];
        if (!typeMapping) {
            return 1.0;
        }

        let modifier = 1.0;
        const personalityTraits = character.personality.getAllTraits ?
            character.personality.getAllTraits() :
            character.personality;

        // Apply trait modifiers
        Object.entries(typeMapping.personalityTraits).forEach(([trait, traitModifier]) => {
            const traitValue = personalityTraits[trait] || 0.5; // Default neutral value
            const traitInfluence = (traitValue - 0.5) * 2; // Convert to -1 to 1 range
            modifier *= (1 + traitInfluence * (traitModifier - 1));
        });

        return modifier;
    }

    /**
     * Get consciousness modifier for interaction type
     * @param {Object} character - Character with consciousness data
     * @param {string} interactionType - Type of interaction
     * @returns {number} Consciousness modifier
     */
    getConsciousnessModifier(character, interactionType) {
        if (!character || !character.consciousness) {
            return 1.0;
        }

        const typeMapping = this.interactionTypeMappings[interactionType];
        if (!typeMapping) {
            return 1.0;
        }

        let modifier = 1.0;

        // Handle both old and new consciousness formats
        const consciousness = character.consciousness;
        const behavioralState = consciousness.getBehavioralState ?
            consciousness.getBehavioralState() :
            consciousness.behavioralState || {};

        // Apply consciousness factor modifiers
        Object.entries(typeMapping.consciousnessFactors).forEach(([factor, factorModifier]) => {
            let factorValue = 0.5; // Default neutral

            // Try different ways to access consciousness factors
            if (behavioralState[factor] !== undefined) {
                factorValue = behavioralState[factor];
            } else if (typeof behavioralState === 'string') {
                // Handle string-based behavioral states
                factorValue = this.mapBehavioralStateToFactor(behavioralState, factor);
            } else {
                // Fallback to direct consciousness properties
                factorValue = this.extractConsciousnessFactor(consciousness, factor);
            }

            const factorInfluence = (factorValue - 0.5) * 2; // Convert to -1 to 1 range
            modifier *= (1 + factorInfluence * (factorModifier - 1));
        });

        return modifier;
    }

    /**
     * Get memory modifier for interaction type
     * @param {Object} character - Character with memory data
     * @param {string} interactionType - Type of interaction
     * @param {Object} context - Context for memory retrieval
     * @returns {number} Memory modifier
     */
    getMemoryModifier(character, interactionType, context = {}) {
        if (!character || !character.significantMemories) {
            return 1.0;
        }

        if (!this.memoryService) {
            return 1.0;
        }

        try {
            // Perform automatic memory management before retrieving memories
            this.memoryManager.processCharacter(character, {
                skipGarbageCollection: true // We'll handle garbage collection separately
            });

            // Get relevant memories for this interaction type
            const relevantMemories = this.memoryService.getRelevantMemories(
                character,
                interactionType,
                5, // maxMemories
                context
            );

            if (!relevantMemories || relevantMemories.length === 0) {
                return 1.0; // No memories, neutral modifier
            }

            // Calculate weighted memory influence based on significance and recency
            let totalWeightedInfluence = 0;
            let totalWeight = 0;

            relevantMemories.forEach(memory => {
                const significance = memory.significance || 0.5;
                const recencyWeight = this.calculateRecencyWeight(memory.timestamp);
                const weight = significance * recencyWeight;

                // Determine influence direction based on outcome
                let influence = 0;
                switch (memory.outcome) {
                    case 'critical_success':
                        influence = 0.4;
                        break;
                    case 'success':
                        influence = 0.2;
                        break;
                    case 'partial_success':
                        influence = 0.1;
                        break;
                    case 'neutral':
                        influence = 0.0;
                        break;
                    case 'partial_failure':
                        influence = -0.1;
                        break;
                    case 'failure':
                        influence = -0.2;
                        break;
                    case 'critical_failure':
                        influence = -0.4;
                        break;
                    default:
                        // Legacy support for simple positive/negative outcomes
                        if (memory.outcome === 'positive') {
                            influence = 0.2;
                        } else if (memory.outcome === 'negative') {
                            influence = -0.2;
                        }
                        break;
                }

                totalWeightedInfluence += influence * weight;
                totalWeight += weight;
            });

            // Calculate final memory modifier
            if (totalWeight === 0) {
                return 1.0;
            }

            const averageInfluence = totalWeightedInfluence / totalWeight;

            // Apply memory influence with diminishing returns
            // Memory influence is bounded between 0.8x and 1.3x (±30% max influence)
            const memoryModifier = 1 + (averageInfluence * 0.75); // Scale influence

            return Math.max(0.8, Math.min(1.3, memoryModifier));

        } catch (error) {
            // Use error handling service for memory calculation failures
            const errorResult = this.errorHandler.handleCalculationFailure(error, {
                calculationType: 'memory_influence',
                character,
                interactionType,
                context
            });

            if (this.logger) {
                this.logger.warn(`Error calculating memory modifier: ${error.message}`);
            }

            return errorResult.fallbackValue || 1.0;
        }
    }

    /**
     * Calculate recency weight for memory influence
     * More recent memories have higher influence
     * @param {number} memoryTimestamp - Timestamp of the memory
     * @returns {number} Recency weight (0.1 to 1.0)
     */
    calculateRecencyWeight(memoryTimestamp) {
        const now = Date.now();
        const age = now - memoryTimestamp;

        // Memory influence decays over time
        // Recent memories (< 1 day): full weight (1.0)
        // Week old memories: 0.7 weight
        // Month old memories: 0.4 weight
        // Very old memories (> 6 months): 0.1 weight

        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;
        const sixMonths = 6 * oneMonth;

        if (age < oneDay) {
            return 1.0;
        } else if (age < oneWeek) {
            return 0.9 - (age - oneDay) / (oneWeek - oneDay) * 0.2; // 0.9 to 0.7
        } else if (age < oneMonth) {
            return 0.7 - (age - oneWeek) / (oneMonth - oneWeek) * 0.3; // 0.7 to 0.4
        } else if (age < sixMonths) {
            return 0.4 - (age - oneMonth) / (sixMonths - oneMonth) * 0.3; // 0.4 to 0.1
        } else {
            return 0.1; // Minimum weight for very old memories
        }
    }

    /**
     * Get context-specific modifier
     * @param {Object} character - Character data
     * @param {string} interactionType - Type of interaction
     * @param {Object} context - Context information
     * @returns {number} Context modifier
     */
    getContextModifier(character, interactionType, context = {}) {
        let modifier = 1.0;

        // Time of day influence
        if (context.timeOfDay) {
            modifier *= this.getTimeOfDayModifier(interactionType, context.timeOfDay);
        }

        // Location/environment influence
        if (context.environment) {
            modifier *= this.getEnvironmentModifier(interactionType, context.environment);
        }

        // Social context influence
        if (context.socialContext) {
            modifier *= this.getSocialContextModifier(interactionType, context.socialContext);
        }

        // Urgency/time pressure influence
        if (context.urgency) {
            modifier *= this.getUrgencyModifier(interactionType, context.urgency);
        }

        return modifier;
    }

    /**
     * Get physical state modifier (energy, health, mood)
     * @param {Object} character - Character with physical state
     * @returns {number} Physical state modifier
     */
    getPhysicalStateModifier(character) {
        if (!character) {
            return 1.0;
        }

        let modifier = 1.0;

        // Energy influence (low energy reduces activity willingness)
        const energyPercent = character.energy !== undefined && character.maxEnergy !== undefined
            ? (character.energy / character.maxEnergy)
            : 0.5; // Default to neutral if data missing

        if (energyPercent < 0.3) {
            modifier *= 0.6; // Very tired
        } else if (energyPercent < 0.6) {
            modifier *= 0.8; // Moderately tired
        }

        // Health influence (poor health reduces activity willingness)
        const healthPercent = character.health !== undefined
            ? (character.health / 100)
            : 0.5; // Default to neutral if data missing

        if (healthPercent < 0.5) {
            modifier *= 0.7; // Significant health issues
        }

        // Mood influence (poor mood reduces positive interactions)
        const moodValue = character.mood !== undefined
            ? (character.mood / 100)
            : 0.5; // Default to neutral if data missing

        if (moodValue < 0.3) {
            modifier *= 0.8; // Bad mood
        } else if (moodValue > 0.7) {
            modifier *= 1.1; // Good mood
        }

        return modifier;
    }

    /**
     * Get time of day modifier
     * @param {string} interactionType - Type of interaction
     * @param {string} timeOfDay - Time of day (morning, afternoon, evening, night)
     * @returns {number} Time modifier
     */
    getTimeOfDayModifier(interactionType, timeOfDay) {
        const timeModifiers = {
            'social': {
                'morning': 0.9,
                'afternoon': 1.1,
                'evening': 1.2,
                'night': 0.8
            },
            'combat': {
                'morning': 1.0,
                'afternoon': 1.0,
                'evening': 0.9,
                'night': 1.1
            },
            'exploration': {
                'morning': 1.1,
                'afternoon': 1.0,
                'evening': 0.9,
                'night': 0.7
            },
            'rest': {
                'morning': 0.8,
                'afternoon': 0.9,
                'evening': 1.1,
                'night': 1.2
            }
        };

        return timeModifiers[interactionType]?.[timeOfDay] || 1.0;
    }

    /**
     * Get environment modifier
     * @param {string} interactionType - Type of interaction
     * @param {Object} environment - Environment data
     * @returns {number} Environment modifier
     */
    getEnvironmentModifier(interactionType, environment) {
        let modifier = 1.0;

        // Weather influence
        if (environment.weather) {
            switch (environment.weather) {
                case 'storm':
                    modifier *= interactionType === 'rest' ? 1.2 : 0.7;
                    break;
                case 'sunny':
                    modifier *= interactionType === 'exploration' ? 1.1 : 1.0;
                    break;
                case 'rain':
                    modifier *= interactionType === 'rest' ? 1.1 : 0.9;
                    break;
                default:
                    modifier *= 1.0; // No weather influence
                    break;
            }
        }

        // Danger level influence
        if (environment.isDangerous) {
            modifier *= interactionType === 'combat' ? 1.2 : 0.8;
        }

        return modifier;
    }

    /**
     * Get social context modifier
     * @param {string} interactionType - Type of interaction
     * @param {Object} socialContext - Social context data
     * @returns {number} Social context modifier
     */
    getSocialContextModifier(interactionType, socialContext) {
        let modifier = 1.0;

        // Group size influence
        if (socialContext.groupSize) {
            if (interactionType === 'social') {
                modifier *= Math.min(1.3, 0.8 + (socialContext.groupSize * 0.1));
            }
        }

        // Authority presence influence
        if (socialContext.hasAuthority) {
            if (interactionType === 'social') {
                modifier *= 0.9; // Slightly more cautious with authority present
            }
        }

        return modifier;
    }

    /**
     * Get urgency modifier
     * @param {string} interactionType - Type of interaction
     * @param {string} urgency - Urgency level (low, medium, high, critical)
     * @returns {number} Urgency modifier
     */
    getUrgencyModifier(interactionType, urgency) {
        const urgencyModifiers = {
            'low': 0.9,
            'medium': 1.0,
            'high': 1.2,
            'critical': 1.5
        };

        return urgencyModifiers[urgency] || 1.0;
    }

    /**
     * Map behavioral state string to factor value
     * @param {string} behavioralState - Behavioral state string
     * @param {string} factor - Factor to extract
     * @returns {number} Factor value (0-1)
     */
    mapBehavioralStateToFactor(behavioralState, factor) {
        // Map string states to numeric values
        const stateMappings = {
            'energy': {
                'low': 0.3,
                'moderate': 0.6,
                'high': 0.9
            },
            'focus': {
                'scattered': 0.3,
                'balanced': 0.6,
                'focused': 0.9
            },
            'socialDrive': {
                'low': 0.3,
                'moderate': 0.6,
                'high': 0.9
            },
            'riskTolerance': {
                'low': 0.3,
                'moderate': 0.6,
                'high': 0.9
            }
        };

        return stateMappings[factor]?.[behavioralState] || 0.5;
    }

    /**
     * Extract consciousness factor from raw consciousness data
     * @param {Object} consciousness - Raw consciousness data
     * @param {string} factor - Factor to extract
     * @returns {number} Factor value (0-1)
     */
    extractConsciousnessFactor(consciousness, factor) {
        switch (factor) {
            case 'energy':
                return consciousness.frequency ? Math.max(0, Math.min(1, (consciousness.frequency - 3) / 12)) : 0.5;
            case 'focus':
                return consciousness.coherence || 0.5;
            case 'socialDrive':
                return consciousness.frequency ? Math.max(0, Math.min(1, (consciousness.frequency - 4) / 8)) : 0.5;
            case 'riskTolerance':
                return consciousness.frequency ? Math.max(0, Math.min(1, (consciousness.frequency - 6) / 6)) : 0.5;
            case 'ambition':
                return consciousness.coherence ? consciousness.coherence : 0.5;
            default:
                return 0.5;
        }
    }

    /**
     * Clamp decision factor to valid bounds
     * @param {number} factor - Decision factor to clamp
     * @returns {number} Clamped decision factor
     */
    clampDecisionFactor(factor) {
        // Ensure factor is a valid number
        if (typeof factor !== 'number' || isNaN(factor) || !isFinite(factor)) {
            return 1.0; // Neutral modifier
        }
        
        return Math.max(this.MIN_DECISION_FACTOR, Math.min(this.MAX_DECISION_FACTOR, factor));
    }

    /**
     * Calculate comprehensive decision factor for character interaction
     * @param {Object} character - Character data
     * @param {string} interactionType - Type of interaction
     * @param {Object} context - Decision context
     * @returns {Object} Decision analysis with factor breakdown
     */
    calculateDecisionFactor(character, interactionType, context = {}) {
        const behavioralModifier = this.getBehavioralModifier(character, interactionType, context);
        const personalityModifier = this.getPersonalityModifier(character, interactionType);
        const consciousnessModifier = this.getConsciousnessModifier(character, interactionType);
        const memoryModifier = this.getMemoryModifier(character, interactionType, context);
        const contextModifier = this.getContextModifier(character, interactionType, context);
        const physicalModifier = this.getPhysicalStateModifier(character);

        return {
            finalFactor: behavioralModifier,
            breakdown: {
                personality: personalityModifier,
                consciousness: consciousnessModifier,
                memory: memoryModifier,
                context: contextModifier,
                physical: physicalModifier
            },
            interactionType,
            timestamp: Date.now()
        };
    }

    /**
     * Get decision factor bounds for validation
     * @returns {Object} Bounds information
     */
    getDecisionFactorBounds() {
        return {
            min: this.MIN_DECISION_FACTOR,
            max: this.MAX_DECISION_FACTOR,
            description: 'Decision factors are bounded to prevent extreme behavior'
        };
    }

    /**
     * Get detailed memory analysis for decision making
     * @param {Object} character - Character with memory data
     * @param {string} interactionType - Type of interaction
     * @param {Object} context - Context for memory retrieval
     * @returns {Object} Detailed memory analysis
     */
    getMemoryAnalysis(character, interactionType, context = {}) {
        if (!character || !this.memoryService) {
            return {
                hasMemories: false,
                relevantMemories: [],
                memoryModifier: 1.0,
                analysis: 'No memories or memory service available'
            };
        }

        if (!character.significantMemories) {
            return {
                hasMemories: false,
                relevantMemories: [],
                memoryModifier: 1.0,
                analysis: 'Character has no memory storage'
            };
        }

        const relevantMemories = this.memoryService.getRelevantMemories(
            character,
            interactionType,
            5,
            context
        );

        if (relevantMemories.length === 0) {
            return {
                hasMemories: true,
                relevantMemories: [],
                memoryModifier: 1.0,
                analysis: 'No relevant memories found for this interaction type'
            };
        }

        // Calculate detailed influence breakdown
        const memoryBreakdown = relevantMemories.map(memory => {
            const significance = memory.significance || 0.5;
            const recencyWeight = this.calculateRecencyWeight(memory.timestamp);
            const weight = significance * recencyWeight;

            let influence = 0;
            switch (memory.outcome) {
                case 'critical_success': influence = 0.4; break;
                case 'success': influence = 0.2; break;
                case 'partial_success': influence = 0.1; break;
                case 'neutral': influence = 0.0; break;
                case 'partial_failure': influence = -0.1; break;
                case 'failure': influence = -0.2; break;
                case 'critical_failure': influence = -0.4; break;
                default:
                    if (memory.outcome === 'positive') influence = 0.2;
                    else if (memory.outcome === 'negative') influence = -0.2;
                    break;
            }

            return {
                memoryId: memory.id,
                interactionType: memory.interactionType,
                outcome: memory.outcome,
                significance,
                recencyWeight,
                weight,
                influence,
                weightedInfluence: influence * weight,
                age: Date.now() - memory.timestamp,
                description: memory.description || 'No description available'
            };
        });

        const totalWeightedInfluence = memoryBreakdown.reduce((sum, m) => sum + m.weightedInfluence, 0);
        const totalWeight = memoryBreakdown.reduce((sum, m) => sum + m.weight, 0);
        const averageInfluence = totalWeight > 0 ? totalWeightedInfluence / totalWeight : 0;
        const memoryModifier = Math.max(0.8, Math.min(1.3, 1 + (averageInfluence * 0.75)));

        return {
            hasMemories: true,
            relevantMemories: memoryBreakdown,
            memoryModifier,
            totalWeightedInfluence,
            totalWeight,
            averageInfluence,
            analysis: this.generateMemoryAnalysisText(memoryBreakdown, memoryModifier)
        };
    }

    /**
     * Generate human-readable analysis of memory influence
     * @param {Array} memoryBreakdown - Detailed memory breakdown
     * @param {number} memoryModifier - Final memory modifier
     * @returns {string} Analysis text
     */
    generateMemoryAnalysisText(memoryBreakdown, memoryModifier) {
        if (memoryBreakdown.length === 0) {
            return 'No relevant memories to influence decision';
        }

        const positiveMemories = memoryBreakdown.filter(m => m.influence > 0);
        const negativeMemories = memoryBreakdown.filter(m => m.influence < 0);
        const neutralMemories = memoryBreakdown.filter(m => m.influence === 0);

        let analysis = `Found ${memoryBreakdown.length} relevant memories. `;

        if (positiveMemories.length > 0) {
            analysis += `${positiveMemories.length} positive experiences `;
        }

        if (negativeMemories.length > 0) {
            analysis += `${negativeMemories.length} negative experiences `;
        }

        if (neutralMemories.length > 0) {
            analysis += `${neutralMemories.length} neutral experiences `;
        }

        if (memoryModifier > 1.05) {
            analysis += 'encourage this action';
        } else if (memoryModifier < 0.95) {
            analysis += 'discourage this action';
        } else {
            analysis += 'have minimal impact on decision';
        }

        analysis += ` (${Math.round((memoryModifier - 1) * 100)}% modifier)`;

        return analysis;
    }
}

export default BehavioralStateService;