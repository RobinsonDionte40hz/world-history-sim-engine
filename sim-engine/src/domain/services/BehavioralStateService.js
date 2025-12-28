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
import MemoryQueryService from './MemoryQueryService.js';

class BehavioralStateService extends BaseDomainService {
    /**
     * Behavioral State Service Constructor
     * @param {Object} memoryService - Memory service instance (optional, defaults to SignificantMemoryService)
     * @param {Object} logger - Logger instance (optional)
     * @param {Object} errorHandler - Error handler instance (optional)
     * @param {Object} consciousnessEngine - WASM consciousness engine instance (optional, for high-performance calculations)
     */
    constructor(memoryService, logger = null, errorHandler = null, consciousnessEngine = null) {
        super(); // BaseDomainService doesn't accept parameters
        // Only create default memory service if memoryService is undefined (not explicitly null)
        this.memoryService = memoryService === undefined ? new SignificantMemoryService() : memoryService;
        this.logger = logger;
        this.errorHandler = errorHandler || new ConsciousnessErrorHandlingService(logger);
        
        // WASM Consciousness Engine integration (Task 3)
        this.consciousnessEngine = consciousnessEngine;
        this.useWasm = consciousnessEngine !== null && consciousnessEngine !== undefined;

        // Memory management service for automatic memory optimization
        this.memoryManager = new MemoryManagementService(logger, errorHandler);

        // Advanced memory querying service for enhanced decision making
        this.memoryQueryService = new MemoryQueryService(
            this.memoryService,
            this.memoryService, // SignificantMemoryService is the same instance
            logger,
            errorHandler
        );

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
            },
            'system': {
                baseModifier: 1.0,
                personalityTraits: {
                    'discipline': 1.2,
                    'adaptability': 1.1,
                    'caution': 0.9
                },
                consciousnessFactors: {
                    focus: 1.1,
                    energy: 1.0
                }
            },
            'perception': {
                baseModifier: 1.0,
                personalityTraits: {
                    'curiosity': 1.3,
                    'awareness': 1.2,
                    'caution': 1.1
                },
                consciousnessFactors: {
                    focus: 1.2,
                    coherence: 1.1
                }
            },
            'PerceptionInteraction': {
                baseModifier: 1.0,
                personalityTraits: {
                    'curiosity': 1.3,
                    'awareness': 1.2
                },
                consciousnessFactors: {
                    focus: 1.2,
                    coherence: 1.1
                }
            },
            'Rest': {
                baseModifier: 1.0,
                personalityTraits: {
                    'lazy': 1.3,
                    'disciplined': 0.8,
                    'exhaustion': 1.2
                },
                consciousnessFactors: {
                    energy: 0.8,
                    coherence: 1.0
                }
            },
            'Wait': {
                baseModifier: 1.0,
                personalityTraits: {
                    'patient': 1.2,
                    'impatient': 0.7,
                    'disciplined': 1.1
                },
                consciousnessFactors: {
                    focus: 1.1,
                    energy: 1.0
                }
            },
            'Examine': {
                baseModifier: 1.0,
                personalityTraits: {
                    'curiosity': 1.4,
                    'caution': 0.8,
                    'analytical': 1.3
                },
                consciousnessFactors: {
                    focus: 1.3,
                    coherence: 1.2
                }
            },
            'Perception': {
                baseModifier: 1.0,
                personalityTraits: {
                    'curiosity': 1.3,
                    'awareness': 1.2,
                    'caution': 1.1
                },
                consciousnessFactors: {
                    focus: 1.2,
                    coherence: 1.1
                }
            },
            // Content interactions - flexible user-defined interactions
            'content': {
                baseModifier: 1.0,
                personalityTraits: {
                    'curiosity': 1.2,
                    'adaptability': 1.1,
                    'caution': 0.9
                },
                consciousnessFactors: {
                    focus: 1.1,
                    coherence: 1.0
                }
            },
            // Custom interaction types
            'observational': {
                baseModifier: 1.0,
                personalityTraits: {
                    'curiosity': 1.4,
                    'awareness': 1.3,
                    'analytical': 1.2
                },
                consciousnessFactors: {
                    focus: 1.3,
                    coherence: 1.2
                }
            },
            'administrative': {
                baseModifier: 1.0,
                personalityTraits: {
                    'discipline': 1.3,
                    'organization': 1.2,
                    'patience': 1.1
                },
                consciousnessFactors: {
                    focus: 1.2,
                    ambition: 1.1
                }
            },
            'labor': {
                baseModifier: 1.0,
                personalityTraits: {
                    'discipline': 1.2,
                    'endurance': 1.3,
                    'practicality': 1.1
                },
                consciousnessFactors: {
                    energy: 1.1,
                    focus: 0.9
                }
            },
            'work': {
                baseModifier: 1.0,
                personalityTraits: {
                    'discipline': 1.3,
                    'endurance': 1.2,
                    'ambition': 1.2,
                    'laziness': 0.6,
                    'diligence': 1.3
                },
                consciousnessFactors: {
                    energy: 1.2,
                    focus: 1.3,
                    ambition: 1.2
                }
            },
            'planning': {
                baseModifier: 1.0,
                personalityTraits: {
                    'analytical': 1.3,
                    'foresight': 1.2,
                    'caution': 1.1
                },
                consciousnessFactors: {
                    focus: 1.3,
                    ambition: 1.2
                }
            },
            'innovation': {
                baseModifier: 1.0,
                personalityTraits: {
                    'curiosity': 1.4,
                    'creativity': 1.3,
                    'risk_taking': 1.2
                },
                consciousnessFactors: {
                    focus: 1.2,
                    ambition: 1.3
                }
            },
            'creative': {
                baseModifier: 1.0,
                personalityTraits: {
                    'creativity': 1.4,
                    'imagination': 1.3,
                    'expression': 1.2
                },
                consciousnessFactors: {
                    coherence: 1.2,
                    socialDrive: 1.1
                }
            },
            'analytical': {
                baseModifier: 1.0,
                personalityTraits: {
                    'analytical': 1.4,
                    'logic': 1.3,
                    'precision': 1.2
                },
                consciousnessFactors: {
                    focus: 1.4,
                    coherence: 1.3
                }
            },
            'unknown': {
                baseModifier: 1.0,
                personalityTraits: {
                    'curiosity': 1.0,
                    'caution': 1.0
                },
                consciousnessFactors: {
                    focus: 1.0,
                    coherence: 1.0
                }
            }
        };

        // Stat-to-interaction mappings for decision enhancement
        this.statInteractionMappings = {
            'combat': {
                primaryStat: 'strength',
                secondaryStat: 'constitution',
                description: 'Physical combat and confrontation'
            },
            'physical_labor': {
                primaryStat: 'strength',
                secondaryStat: 'constitution',
                description: 'Manual labor and physical tasks'
            },
            'intimidation': {
                primaryStat: 'strength',
                secondaryStat: 'charisma',
                description: 'Physical intimidation and threats'
            },
            'stealth': {
                primaryStat: 'dexterity',
                secondaryStat: 'wisdom',
                description: 'Sneaking and avoiding detection'
            },
            'theft': {
                primaryStat: 'dexterity',
                secondaryStat: 'intelligence',
                description: 'Picking pockets and theft'
            },
            'acrobatics': {
                primaryStat: 'dexterity',
                secondaryStat: 'strength',
                description: 'Climbing and acrobatic maneuvers'
            },
            'ranged_combat': {
                primaryStat: 'dexterity',
                secondaryStat: 'wisdom',
                description: 'Archery and ranged weapons'
            },
            'research': {
                primaryStat: 'intelligence',
                secondaryStat: 'wisdom',
                description: 'Academic research and investigation'
            },
            'planning': {
                primaryStat: 'intelligence',
                secondaryStat: 'wisdom',
                description: 'Strategic planning and tactics'
            },
            'magic': {
                primaryStat: 'intelligence',
                secondaryStat: 'wisdom',
                description: 'Spellcasting and magical abilities'
            },
            'problem_solving': {
                primaryStat: 'intelligence',
                secondaryStat: 'charisma',
                description: 'Complex problem resolution'
            },
            'perception': {
                primaryStat: 'wisdom',
                secondaryStat: 'intelligence',
                description: 'Noticing details and sensing danger'
            },
            'survival': {
                primaryStat: 'wisdom',
                secondaryStat: 'constitution',
                description: 'Foraging and wilderness survival'
            },
            'insight': {
                primaryStat: 'wisdom',
                secondaryStat: 'charisma',
                description: 'Reading people and situations'
            },
            'healing': {
                primaryStat: 'wisdom',
                secondaryStat: 'intelligence',
                description: 'Medical treatment and care'
            },
            'persuasion': {
                primaryStat: 'charisma',
                secondaryStat: 'intelligence',
                description: 'Convincing others through words'
            },
            'leadership': {
                primaryStat: 'charisma',
                secondaryStat: 'wisdom',
                description: 'Commanding and inspiring others'
            },
            'performance': {
                primaryStat: 'charisma',
                secondaryStat: 'dexterity',
                description: 'Entertainment and artistic expression'
            },
            'trade': {
                primaryStat: 'charisma',
                secondaryStat: 'intelligence',
                description: 'Negotiation and commerce'
            },
            'endurance': {
                primaryStat: 'constitution',
                secondaryStat: 'strength',
                description: 'Sustaining effort over time'
            },
            'resistance': {
                primaryStat: 'constitution',
                secondaryStat: 'wisdom',
                description: 'Resisting harmful effects'
            },
            'recovery': {
                primaryStat: 'constitution',
                secondaryStat: 'wisdom',
                description: 'Healing and recuperation'
            },
            // Universal interactions that benefit from average stat influence
            'social': {
                primaryStat: 'average',
                secondaryStat: 'charisma',
                description: 'General social interaction'
            },
            'economic': {
                primaryStat: 'average',
                secondaryStat: 'intelligence',
                description: 'General economic activities'
            },
            'exploration': {
                primaryStat: 'average',
                secondaryStat: 'wisdom',
                description: 'General exploration activities'
            },
            'rest': {
                primaryStat: 'average',
                secondaryStat: 'constitution',
                description: 'Resting and recovery'
            },
            // Content interactions
            'content': {
                primaryStat: 'average',
                secondaryStat: 'wisdom',
                description: 'User-defined content interactions'
            },
            // Custom interaction types
            'observational': {
                primaryStat: 'wisdom',
                secondaryStat: 'intelligence',
                description: 'Observation and monitoring activities'
            },
            'administrative': {
                primaryStat: 'intelligence',
                secondaryStat: 'wisdom',
                description: 'Administrative and organizational tasks'
            },
            'labor': {
                primaryStat: 'strength',
                secondaryStat: 'constitution',
                description: 'Physical labor and work activities'
            },
            'innovation': {
                primaryStat: 'intelligence',
                secondaryStat: 'wisdom',
                description: 'Creative problem solving and innovation'
            },
            'creative': {
                primaryStat: 'charisma',
                secondaryStat: 'intelligence',
                description: 'Creative and artistic expression'
            },
            'analytical': {
                primaryStat: 'intelligence',
                secondaryStat: 'wisdom',
                description: 'Analytical thinking and data processing'
            }
        };

        // Decision factor bounds
        this.MIN_DECISION_FACTOR = 0.1;
        this.MAX_DECISION_FACTOR = 3.0;

        // Stat modifier bounds
        this.STAT_MODIFIER_MIN = 0.7;
        this.STAT_MODIFIER_MAX = 1.5;
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
     * Get memory modifier for interaction type using advanced querying
     * @param {Object} character - Character with memory data
     * @param {string} interactionType - Type of interaction
     * @param {Object} context - Context for decision making
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

            // Use advanced memory querying for more sophisticated analysis
            const memoryAnalysis = this.memoryQueryService.queryInteractionPatterns(
                character,
                interactionType,
                {
                    limit: 10, // Analyze recent patterns
                    sortBy: 'timestamp',
                    sortOrder: 'desc'
                }
            );

            // Get contextual memories based on current situation
            const contextualMemories = this._getContextualMemories(character, interactionType, context);

            // Calculate comprehensive memory influence
            const patternInfluence = this._calculatePatternInfluence(memoryAnalysis);
            const contextInfluence = this._calculateContextInfluence(contextualMemories, context);
            const relationshipInfluence = this._calculateRelationshipInfluence(character, interactionType, context);

            // Combine influences with weights
            const totalInfluence = (
                patternInfluence * 0.5 +    // 50% weight on general patterns
                contextInfluence * 0.3 +    // 30% weight on current context
                relationshipInfluence * 0.2  // 20% weight on relationships
            );

            // Apply memory influence with diminishing returns
            // Memory influence is bounded between 0.7x and 1.4x (±40% max influence)
            const memoryModifier = 1 + (totalInfluence * 0.6); // Scale influence

            return Math.max(0.7, Math.min(1.4, memoryModifier));

        } catch (error) {
            // Use error handling service for memory calculation failures
            const errorResult = this.errorHandler.handleCalculationFailure(error, {
                calculationType: 'advanced_memory_influence',
                character,
                interactionType,
                context
            });

            if (this.logger) {
                this.logger.warn(`Error calculating advanced memory modifier: ${error.message}`);
            }

            return errorResult.fallbackValue || 1.0;
        }
    }

    /**
     * Get contextual memories based on current situation
     * @param {Object} character - Character to query
     * @param {string} interactionType - Type of interaction
     * @param {Object} context - Current context
     * @returns {Array<Object>} Contextual memories
     */
    _getContextualMemories(character, interactionType, context = {}) {
        const queryCriteria = {
            type: [interactionType],
            limit: 5,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };

        // Add location context if available
        if (context.location) {
            queryCriteria.location = [context.location];
        }

        // Add time context for recent memories
        if (context.timeSensitive) {
            queryCriteria.timeRange = {
                start: Date.now() - (24 * 60 * 60 * 1000) // Last 24 hours
            };
        }

        return this.memoryQueryService.queryPersonalMemories(character, queryCriteria);
    }

    /**
     * Calculate pattern influence from interaction pattern analysis
     * @param {Object} patternAnalysis - Pattern analysis from MemoryQueryService
     * @returns {number} Pattern influence (-1 to 1)
     */
    _calculatePatternInfluence(patternAnalysis) {
        if (!patternAnalysis || patternAnalysis.totalMemories === 0) {
            return 0; // No pattern data
        }

        const { successRate, trend, recentActivity } = patternAnalysis;

        // Base influence from success rate
        let influence = (successRate - 0.5) * 2; // Convert 0-1 to -1 to 1

        // Adjust based on trend
        switch (trend) {
            case 'improving':
                influence += 0.1;
                break;
            case 'declining':
                influence -= 0.1;
                break;
            case 'stable':
            default:
                // No trend adjustment
                break;
        }

        // Adjust based on recent activity (more recent = stronger influence)
        if (recentActivity > 3) {
            influence *= 1.2; // Strengthen recent patterns
        }

        return Math.max(-1, Math.min(1, influence));
    }

    /**
     * Calculate context influence from current situation memories
     * @param {Array<Object>} contextualMemories - Memories from current context
     * @param {Object} context - Current context
     * @returns {number} Context influence (-1 to 1)
     */
    _calculateContextInfluence(contextualMemories, context = {}) {
        if (!contextualMemories || contextualMemories.length === 0) {
            return 0; // No contextual memories
        }

        let totalInfluence = 0;
        let totalWeight = 0;

        contextualMemories.forEach(memory => {
            const significance = memory.significance || 0.5;
            const recencyWeight = this.calculateRecencyWeight(memory.timestamp);
            const weight = significance * recencyWeight;

            // Calculate outcome influence
            let outcomeInfluence = 0;
            switch (memory.outcome) {
                case 'critical_success':
                    outcomeInfluence = 0.3;
                    break;
                case 'success':
                    outcomeInfluence = 0.15;
                    break;
                case 'partial_success':
                    outcomeInfluence = 0.05;
                    break;
                case 'neutral':
                    outcomeInfluence = 0.0;
                    break;
                case 'partial_failure':
                    outcomeInfluence = -0.05;
                    break;
                case 'failure':
                    outcomeInfluence = -0.15;
                    break;
                case 'critical_failure':
                    outcomeInfluence = -0.3;
                    break;
                default:
                    outcomeInfluence = 0.0;
                    break;
            }

            // Apply context similarity bonus
            const contextSimilarity = this._calculateContextSimilarity(memory, context);
            outcomeInfluence *= (1 + contextSimilarity * 0.5); // Up to 50% bonus for similar contexts

            totalInfluence += outcomeInfluence * weight;
            totalWeight += weight;
        });

        return totalWeight > 0 ? Math.max(-1, Math.min(1, totalInfluence / totalWeight)) : 0;
    }

    /**
     * Calculate relationship influence for social interactions
     * @param {Object} character - Character making decision
     * @param {string} interactionType - Type of interaction
     * @param {Object} context - Current context
     * @returns {number} Relationship influence (-1 to 1)
     */
    _calculateRelationshipInfluence(character, interactionType, context = {}) {
        // Only apply to social interactions
        if (!['social', 'relationship', 'romance', 'conflict'].includes(interactionType)) {
            return 0;
        }

        if (!context.participants || context.participants.length === 0) {
            return 0;
        }

        let totalRelationshipInfluence = 0;
        let participantCount = 0;

        for (const participantId of context.participants) {
            const relationshipMemories = this.memoryQueryService.queryRelationshipMemories(
                character,
                participantId,
                {
                    limit: 3,
                    sortBy: 'timestamp',
                    sortOrder: 'desc'
                }
            );

            if (relationshipMemories.length > 0) {
                const relationshipInfluence = this._calculateRelationshipStrength(relationshipMemories);
                totalRelationshipInfluence += relationshipInfluence;
                participantCount++;
            }
        }

        return participantCount > 0 ? totalRelationshipInfluence / participantCount : 0;
    }

    /**
     * Calculate relationship strength from memories
     * @param {Array<Object>} relationshipMemories - Memories involving relationship
     * @returns {number} Relationship influence (-1 to 1)
     */
    _calculateRelationshipStrength(relationshipMemories) {
        if (!relationshipMemories || relationshipMemories.length === 0) {
            return 0;
        }

        let positiveInteractions = 0;
        let negativeInteractions = 0;
        let totalSignificance = 0;

        relationshipMemories.forEach(memory => {
            totalSignificance += memory.significance || 0.5;

            switch (memory.outcome) {
                case 'critical_success':
                case 'success':
                    positiveInteractions += 2;
                    break;
                case 'partial_success':
                    positiveInteractions += 1;
                    break;
                case 'partial_failure':
                    negativeInteractions += 1;
                    break;
                case 'failure':
                case 'critical_failure':
                    negativeInteractions += 2;
                    break;
                default:
                    // Neutral outcomes don't affect relationship strength
                    break;
            }
        });

        const netInteractions = positiveInteractions - negativeInteractions;
        const averageSignificance = totalSignificance / relationshipMemories.length;

        // Normalize to -1 to 1 range
        const relationshipScore = Math.max(-1, Math.min(1, netInteractions * 0.1));
        return relationshipScore * averageSignificance;
    }

    /**
     * Calculate similarity between memory context and current context
     * @param {Object} memory - Memory object
     * @param {Object} context - Current context
     * @returns {number} Similarity score (0 to 1)
     */
    _calculateContextSimilarity(memory, context = {}) {
        let similarityScore = 0;
        let factors = 0;

        // Location similarity
        if (memory.location && context.location) {
            if (memory.location === context.location) {
                similarityScore += 1;
            }
            factors++;
        }

        // Time similarity (similar time of day)
        if (memory.timestamp && context.timestamp) {
            const memoryHour = new Date(memory.timestamp).getHours();
            const contextHour = new Date(context.timestamp).getHours();
            const hourDifference = Math.abs(memoryHour - contextHour);

            if (hourDifference <= 2) {
                similarityScore += 0.8;
            } else if (hourDifference <= 6) {
                similarityScore += 0.4;
            }
            factors++;
        }

        // Participant similarity
        if (memory.participants && context.participants) {
            const memoryParticipants = new Set(memory.participants);
            const contextParticipants = new Set(context.participants);
            const intersection = new Set([...memoryParticipants].filter(x => contextParticipants.has(x)));
            const union = new Set([...memoryParticipants, ...contextParticipants]);

            if (union.size > 0) {
                similarityScore += (intersection.size / union.size);
                factors++;
            }
        }

        return factors > 0 ? similarityScore / factors : 0;
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

        // Work-related context modifiers (Task 19)
        if (character.jobAssignment) {
            modifier *= this.getWorkContextModifier(character, interactionType, context);
        }

        return modifier;
    }

    /**
     * Get work context modifier based on job assignment and performance
     * @param {Object} character - Character with jobAssignment
     * @param {string} interactionType - Type of interaction
     * @param {Object} context - Context including work metadata
     * @returns {number} Work context modifier
     */
    getWorkContextModifier(character, interactionType, context = {}) {
        if (!character.jobAssignment) {
            return 1.0;
        }

        const jobAssignment = character.jobAssignment;
        let modifier = 1.0;

        // Employment status influence
        if (!jobAssignment.employed) {
            // Unemployed characters prioritize job search
            if (interactionType === 'economic' || interactionType === 'work') {
                modifier *= 1.3;
            }
            return modifier;
        }

        // Work-related interaction types get boosted during work time
        if (interactionType === 'work' || interactionType === 'labor' || interactionType === 'economic') {
            // Check if during work shift
            const duringWorkShift = this._isDuringWorkShift(jobAssignment, context);
            if (duringWorkShift) {
                modifier *= 1.4; // Strong priority for work during shift
            } else {
                modifier *= 0.7; // Less interested in work outside shift
            }

            // Wage satisfaction influences work motivation
            const wageSatisfaction = this._calculateWageSatisfaction(character, jobAssignment);
            modifier *= (0.7 + wageSatisfaction * 0.6); // Range: 0.7x to 1.3x

            // Job performance influences work willingness
            if (jobAssignment.performance) {
                const performanceModifier = 0.8 + (jobAssignment.performance.productivity * 0.4);
                modifier *= performanceModifier; // Range: 0.8x to 1.2x
            }

            // Work-building compatibility (if metadata available)
            if (context.buildingId && context.buildingId === jobAssignment.buildingId) {
                modifier *= 1.2; // Familiar workplace bonus
            }
        } else {
            // Non-work interactions get penalized during work hours
            const duringWorkShift = this._isDuringWorkShift(jobAssignment, context);
            if (duringWorkShift) {
                // During work hours, reduce interest in other activities
                if (interactionType === 'social' || interactionType === 'exploration') {
                    modifier *= 0.6; // Strong penalty
                } else if (interactionType === 'rest') {
                    modifier *= 0.8; // Moderate penalty
                }
            }
        }

        // Job stress influences behavior
        if (jobAssignment.hoursWorked > 40) {
            // Overworked - reduce work motivation, increase rest desire
            if (interactionType === 'work' || interactionType === 'labor') {
                modifier *= 0.8;
            } else if (interactionType === 'rest') {
                modifier *= 1.3;
            }
        }

        return modifier;
    }

    /**
     * Check if current time is during character's work shift
     * @param {Object} jobAssignment - Character's job assignment
     * @param {Object} context - Context with timeOfDay or turn info
     * @returns {boolean} True if during work shift
     * @private
     */
    _isDuringWorkShift(jobAssignment, context) {
        if (!jobAssignment.shift) {
            return false;
        }

        // Check context for time information
        if (context.timeOfDay !== undefined) {
            // Map time of day to shift
            const timeToShift = {
                0: 'morning',   // Turn 0 = morning
                1: 'midday',    // Turn 1 = midday
                2: 'night'      // Turn 2 = night
            };
            const currentShift = timeToShift[context.timeOfDay];
            return currentShift === jobAssignment.shift;
        }

        // Fallback: assume always during work time if no context
        return true;
    }

    /**
     * Calculate wage satisfaction based on current wage vs expectations
     * @param {Object} character - Character with jobAssignment
     * @param {Object} jobAssignment - Job assignment data
     * @returns {number} Satisfaction level (0 to 1)
     * @private
     */
    _calculateWageSatisfaction(character, jobAssignment) {
        if (!jobAssignment.wage) {
            return 0.5; // Neutral if no wage data
        }

        // Compare current wage to average/expected wage
        const currentWage = jobAssignment.wage;
        const expectedWage = this._calculateExpectedWage(character);

        const wageRatio = currentWage / expectedWage;

        // Map ratio to satisfaction (0.5 = 50%, 1.0 = 100%, 1.5 = 150%)
        if (wageRatio >= 1.2) {
            return 1.0; // Very satisfied
        } else if (wageRatio >= 1.0) {
            return 0.8; // Satisfied
        } else if (wageRatio >= 0.8) {
            return 0.6; // Somewhat satisfied
        } else if (wageRatio >= 0.6) {
            return 0.4; // Dissatisfied
        } else {
            return 0.2; // Very dissatisfied
        }
    }

    /**
     * Calculate expected wage based on character attributes and skills
     * @param {Object} character - Character with attributes
     * @returns {number} Expected wage
     * @private
     */
    _calculateExpectedWage(character) {
        // Base wage expectation
        let expectedWage = 10;

        // Adjust based on attributes (intelligence, charisma)
        if (character.attributes) {
            const avgAttribute = (
                (character.attributes.intelligence || 10) +
                (character.attributes.charisma || 10)
            ) / 2;
            expectedWage += (avgAttribute - 10) * 0.5;
        }

        // Adjust based on skills (if available)
        if (character.skills) {
            const avgSkillLevel = Object.values(character.skills).reduce((sum, skill) => {
                return sum + (skill.level || 0);
            }, 0) / Math.max(Object.keys(character.skills).length, 1);
            expectedWage += avgSkillLevel * 0.5;
        }

        return Math.max(5, expectedWage); // Minimum expected wage
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
        const statModifier = this.getStatModifier(character, interactionType);

        // Calculate final factor with all modifiers including stats
        const finalFactor = behavioralModifier * personalityModifier * consciousnessModifier *
                           memoryModifier * contextModifier * physicalModifier * statModifier;

        return {
            finalFactor: this.clampDecisionFactor(finalFactor),
            breakdown: {
                personality: personalityModifier,
                consciousness: consciousnessModifier,
                memory: memoryModifier,
                context: contextModifier,
                physical: physicalModifier,
                stats: statModifier,
                behavioral: behavioralModifier
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

    /**
     * Generate behavioral state for a character (compatible with existing interface)
     * Uses WASM engine if available for high-performance calculations, falls back to JavaScript
     * @param {Object} character - Character with consciousness data
     * @returns {Object} Behavioral state object
     */
    generateBehavioralState(character) {
        // If WASM is available, try using it for better performance
        if (this.useWasm && this.consciousnessEngine) {
            try {
                const startTime = performance.now();
                
                // Validate character has required consciousness data
                if (!character || !character.consciousness) {
                    if (this.logger) {
                        this.logger.warn('Character missing consciousness data, using JS fallback');
                    }
                    const fallbackResult = this._generateBehavioralStateJS(character);
                    fallbackResult._module = 'JavaScript';
                    return fallbackResult;
                }
                
                // Extract consciousness parameters for WASM
                const consciousness = character.consciousness;
                const frequency = consciousness.frequency || consciousness.baseFrequency || 7.5;
                const coherence = consciousness.coherence || consciousness.baseCoherence || 0.7;
                
                // Sanitize emotional state to valid WASM enum values
                // Valid values: Content, Excited, Anxious, Depressed, Angry, Joyful, Fearful, Surprised
                const sanitizeEmotionalState = (state) => {
                    if (!state) return 'Content';
                    const normalized = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
                    const validStates = ['Content', 'Excited', 'Anxious', 'Depressed', 'Angry', 'Joyful', 'Fearful', 'Surprised'];
                    
                    // Map common aliases to valid states
                    const stateMap = {
                        'Optimistic': 'Joyful',
                        'Happy': 'Joyful',
                        'Sad': 'Depressed',
                        'Calm': 'Content',
                        'Neutral': 'Content'
                    };
                    
                    const mapped = stateMap[normalized] || normalized;
                    return validStates.includes(mapped) ? mapped : 'Content';
                };
                
                // Create consciousness state object for WASM
                const consciousnessState = {
                    baseFrequency: frequency,
                    currentFrequency: consciousness.currentFrequency || frequency,
                    baseCoherence: coherence,
                    emotionalCoherence: consciousness.emotionalCoherence || coherence,
                    emotionalState: sanitizeEmotionalState(consciousness.emotionalState)
                };
                
                // Call WASM engine
                const wasmResult = this.consciousnessEngine.calculateBehavioralState(consciousnessState);
                
                const calculationTime = performance.now() - startTime;
                
                if (this.logger) {
                    this.logger.debug(`WASM behavioral state calculation: ${calculationTime.toFixed(2)}ms`);
                }
                
                // Convert WASM result to expected format
                // WASM returns numeric or string values, normalize to strings for consistency
                const normalizeEnergy = (val) => {
                    if (typeof val === 'number') {
                        if (val < 0.3) return 'low';
                        if (val < 0.7) return 'moderate';
                        return 'high';
                    }
                    return val.toLowerCase();
                };
                
                const normalizeFocus = (val) => {
                    if (typeof val === 'number') {
                        if (val < 0.4) return 'scattered';
                        if (val < 0.8) return 'balanced';
                        return 'focused';
                    }
                    return val.toLowerCase();
                };
                
                return {
                    energy: normalizeEnergy(wasmResult.energy || wasmResult.energyLevel || 0.5),
                    focus: normalizeFocus(wasmResult.focus || wasmResult.focusLevel || 0.5),
                    mood: (wasmResult.mood || 'content').toLowerCase(),
                    socialDrive: wasmResult.socialDrive || 0.5,
                    riskTolerance: wasmResult.riskTolerance || 0.5,
                    ambition: wasmResult.ambition || 0.5,
                    _calculationTime: calculationTime,
                    _module: 'WASM'
                };
                
            } catch (error) {
                // Log error and fall back to JavaScript
                if (this.logger) {
                    this.logger.warn(`WASM calculation failed, falling back to JS: ${error.message}`);
                }
                // Don't throw - gracefully fall through to JS implementation
            }
        }
        
        // Use JavaScript fallback (either WASM unavailable or error occurred)
        const jsResult = this._generateBehavioralStateJS(character);
        jsResult._module = 'JavaScript';
        return jsResult;
    }

    /**
     * Generate behavioral state for a character using JavaScript implementation (fallback)
     * @private
     * @param {Object} character - Character with consciousness data
     * @returns {Object} Behavioral state object
     */
    _generateBehavioralStateJS(character) {
        if (!character || !character.consciousness) {
            // Return default behavioral state for characters without consciousness
            return {
                energy: 'moderate',
                focus: 'balanced',
                mood: 'content',
                socialDrive: 0.5,
                riskTolerance: 0.5,
                ambition: 0.5
            };
        }

        const consciousness = character.consciousness;

        // Extract frequency and coherence from consciousness
        let frequency = consciousness.frequency || consciousness.baseFrequency || 7.5;
        let coherence = consciousness.coherence || consciousness.baseCoherence || 0.7;

        // Handle different consciousness formats
        if (typeof consciousness.getBehavioralState === 'function') {
            // If consciousness has its own generateBehavioralState method, use it
            return consciousness.getBehavioralState();
        }

        // Generate behavioral state from frequency and coherence
        const behavioralState = {
            energy: this.mapFrequencyToEnergy(frequency),
            focus: this.mapCoherenceToFocus(coherence),
            mood: this.calculateMoodFromState(frequency, coherence),
            socialDrive: Math.max(0, Math.min(1, (frequency - 4) / 8)),
            riskTolerance: Math.max(0, Math.min(1, (frequency - 6) / 6)),
            ambition: Math.max(0, Math.min(1, coherence * (frequency / 10)))
        };

        return behavioralState;
    }

    /**
     * Map frequency to energy level
     * @param {number} frequency - Consciousness frequency (3-15 Hz)
     * @returns {string} Energy level: 'low', 'moderate', 'high'
     */
    mapFrequencyToEnergy(frequency) {
        if (frequency < 5) return 'low';
        if (frequency < 10) return 'moderate';
        return 'high';
    }

    /**
     * Map coherence to focus level
     * @param {number} coherence - Emotional coherence (0.2-1.0)
     * @returns {string} Focus level: 'scattered', 'balanced', 'focused'
     */
    mapCoherenceToFocus(coherence) {
        if (coherence < 0.4) return 'scattered';
        if (coherence < 0.8) return 'balanced';
        return 'focused';
    }

    /**
     * Calculate mood from frequency and coherence combination
     * @param {number} frequency - Consciousness frequency
     * @param {number} coherence - Emotional coherence
     * @returns {string} Mood: 'depressed', 'content', 'optimistic', 'excited'
     */
    calculateMoodFromState(frequency, coherence) {
        const moodScore = (frequency / 15) * 0.7 + coherence * 0.3;

        if (moodScore < 0.3) return 'depressed';
        if (moodScore < 0.6) return 'content';
        if (moodScore < 0.8) return 'optimistic';
        return 'excited';
    }

    /**
     * Get decision factor bounds for validation
     * @returns {Object} Bounds information
     */
    getDecisionFactors(character) {
        if (!character) {
            return {
                behavioralModifier: 1.0,
                personalityModifier: 1.0,
                consciousnessModifier: 1.0,
                memoryModifier: 1.0,
                contextModifier: 1.0,
                physicalModifier: 1.0,
                statModifier: 1.0
            };
        }

        const behavioralModifier = this.getBehavioralModifier(character, 'unknown');
        const personalityModifier = this.getPersonalityModifier(character, 'unknown');
        const consciousnessModifier = this.getConsciousnessModifier(character, 'unknown');
        const memoryModifier = this.getMemoryModifier(character, 'unknown', {});
        const contextModifier = this.getContextModifier(character, 'unknown', {});
        const physicalModifier = this.getPhysicalStateModifier(character);
        const statModifier = this.getStatModifier(character, 'unknown');

        return {
            behavioralModifier,
            personalityModifier,
            consciousnessModifier,
            memoryModifier,
            contextModifier,
            physicalModifier,
            statModifier
        };
    }

    /**
     * Get stat modifier for a specific interaction type
     * @param {Object} character - Character with attributes
     * @param {string} interactionType - Type of interaction
     * @returns {number} Stat modifier (0.7x to 1.5x range)
     */
    getStatModifier(character, interactionType) {
        try {
            if (!character || !character.attributes) {
                return 1.0; // Neutral modifier if no character or attributes
            }

            const mapping = this.statInteractionMappings[interactionType];
            if (!mapping) {
                return 1.0; // Neutral modifier for unknown interaction types
            }

            let primaryModifier = 1.0;
            let secondaryModifier = 1.0;

            // Calculate primary stat modifier
            if (mapping.primaryStat === 'average') {
                // Use average of all stats for universal interactions
                const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                const statValues = stats.map(stat => character.attributes[stat] || 10);
                const averageStat = statValues.reduce((sum, val) => sum + val, 0) / statValues.length;
                primaryModifier = this.calculateStatModifier(averageStat);
            } else {
                const primaryStatValue = character.attributes[mapping.primaryStat] || 10;
                primaryModifier = this.calculateStatModifier(primaryStatValue);
            }

            // Calculate secondary stat modifier
            const secondaryStatValue = character.attributes[mapping.secondaryStat] || 10;
            secondaryModifier = this.calculateStatModifier(secondaryStatValue);

            // Combine primary and secondary modifiers (weighted average)
            const combinedModifier = (primaryModifier * 0.7) + (secondaryModifier * 0.3);

            // Ensure bounds are respected
            return Math.max(this.STAT_MODIFIER_MIN, Math.min(this.STAT_MODIFIER_MAX, combinedModifier));

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error calculating stat modifier: ${error.message}`);
            }
            return 1.0; // Return neutral modifier on error
        }
    }

    /**
     * Get all stat modifiers for a character across different interaction types
     * @param {Object} character - Character with attributes
     * @returns {Object} Object mapping interaction types to stat modifiers
     */
    getAllStatModifiers(character) {
        const modifiers = {};

        Object.keys(this.statInteractionMappings).forEach(interactionType => {
            modifiers[interactionType] = this.getStatModifier(character, interactionType);
        });

        return modifiers;
    }

    /**
     * Get stat modifier bounds for validation
     * @returns {Object} Bounds information
     */
    getStatModifierBounds() {
        return {
            min: this.STAT_MODIFIER_MIN,
            max: this.STAT_MODIFIER_MAX,
            description: 'Stat modifiers are bounded to prevent extreme stat-based behavior'
        };
    }

    /**
     * Calculate modifier from stat value using D&D-style progression
     * @param {number} statValue - Stat value (typically 1-20)
     * @returns {number} Modifier value
     */
    calculateStatModifier(statValue) {
        // D&D-style modifier calculation: (stat - 10) / 2, but scaled for our range
        const baseModifier = (statValue - 10) / 2;

        // Scale to our desired range (0.7x to 1.5x)
        // Base modifier of -5 to +5 maps to 0.7x to 1.5x
        const scaledModifier = 1.0 + (baseModifier * 0.08); // 0.08 = (1.5-0.7)/(5-(-5)) / 2

        return Math.max(this.STAT_MODIFIER_MIN, Math.min(this.STAT_MODIFIER_MAX, scaledModifier));
    }
}

export default BehavioralStateService;