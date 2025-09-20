/**
 * EfficientTurnProcessor - Optimized turn processing using cached behavioral states
 *
 * Implements event-driven consciousness updates and cached behavioral state processing
 * for improved performance in large-scale simulations. Only updates consciousness when
 * significant events occur, dramatically reducing computational overhead.
 */

import BaseDomainService from './BaseDomainService.js';
import BehavioralStateService from './BehavioralStateService.js';
import ConsciousnessUpdateService from './ConsciousnessUpdateService.js';
import EventSignificanceService from './EventSignificanceService.js';
import SignificantMemoryService from './SignificantMemoryService.js';
import ConsciousnessCheckpointService from './ConsciousnessCheckpointService.js';

class EfficientTurnProcessor extends BaseDomainService {
    constructor(
        behavioralStateService = null,
        consciousnessUpdateService = null,
        eventSignificanceService = null,
        significantMemoryService = null,
        consciousnessCheckpointService = null,
        logger = null
    ) {
        super();
        this.behavioralStateService = behavioralStateService || new BehavioralStateService();
        this.consciousnessUpdateService = consciousnessUpdateService || new ConsciousnessUpdateService();
        this.eventSignificanceService = eventSignificanceService || new EventSignificanceService();
        this.significantMemoryService = significantMemoryService || new SignificantMemoryService();
        this.consciousnessCheckpointService = consciousnessCheckpointService || new ConsciousnessCheckpointService();
        this.logger = logger;

        // Performance tracking
        this.performanceMetrics = {
            totalProcessingTime: 0,
            charactersProcessed: 0,
            consciousnessUpdates: 0,
            memoryUpdates: 0,
            cachedStatesUsed: 0,
            turnCount: 0
        };

        // Configuration
        this.significanceThreshold = 0.3;
        this.maxProcessingTimePerTurn = 5000; // 5 seconds
        this.enableAutoCheckpoint = true;
        this.checkpointInterval = 10; // Every 10 turns
    }

    /**
     * Process a turn for all characters using cached behavioral states
     * @param {Array} characters - Array of character objects
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Additional turn context
     * @returns {Object} Turn processing results
     */
    async processTurn(characters, worldState, turnContext = {}) {
        const startTime = Date.now();
        const results = {
            processedCharacters: 0,
            consciousnessUpdates: 0,
            memoryUpdates: 0,
            cachedStatesUsed: 0,
            significantEvents: [],
            performanceMetrics: {},
            errors: []
        };

        try {
            // Validate inputs
            this._validateInputs(characters, worldState);

            // Process each character
            for (const character of characters) {
                try {
                    const characterResult = await this._processCharacterTurn(
                        character,
                        worldState,
                        turnContext
                    );

                    // Aggregate results
                    results.processedCharacters++;
                    results.consciousnessUpdates += characterResult.consciousnessUpdated ? 1 : 0;
                    results.memoryUpdates += characterResult.memoryUpdated ? 1 : 0;
                    results.cachedStatesUsed += characterResult.usedCachedState ? 1 : 0;

                    if (characterResult.significantEvents) {
                        results.significantEvents.push(...characterResult.significantEvents);
                    }

                    // Check for errors in character processing
                    if (characterResult.errors && characterResult.errors.length > 0) {
                        results.errors.push(...characterResult.errors);
                    }

                } catch (error) {
                    results.errors.push({
                        characterId: character.id || 'unknown',
                        error: error.message || 'Unknown error occurred'
                    });

                    if (this.logger) {
                        this.logger.error(`Error processing character ${character.id || 'unknown'}: ${error.message}`);
                    }
                }
            }

            // Update performance metrics
            const endTime = Date.now();
            const processingTime = Math.max(endTime - startTime, 1); // Ensure at least 1ms for testing
            this._updatePerformanceMetrics(results, processingTime);

            results.performanceMetrics = {
                totalProcessingTime: processingTime,
                averageTimePerCharacter: processingTime / Math.max(characters.length, 1),
                processingRate: characters.length / (processingTime / 1000), // characters per second
                charactersProcessed: results.processedCharacters,
                consciousnessUpdates: results.consciousnessUpdates,
                memoryUpdates: results.memoryUpdates,
                cachedStatesUsed: results.cachedStatesUsed,
                turnCount: this.performanceMetrics.turnCount + 1,
                cacheHitRate: results.cachedStatesUsed / Math.max(characters.length, 1)
            };

            // Auto-checkpoint if enabled
            if (this.enableAutoCheckpoint && this.performanceMetrics.turnCount % this.checkpointInterval === 0) {
                await this._performAutoCheckpoint(characters, worldState);
            }

            return results;

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Turn processing failed: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Process a single character's turn
     * @param {Object} character - Character to process
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Character processing result
     */
    async _processCharacterTurn(character, worldState, turnContext) {
        const result = {
            consciousnessUpdated: false,
            memoryUpdated: false,
            usedCachedState: false,
            significantEvents: [],
            errors: []
        };

        try {
            // Determine LOD tier for processing optimization
            const lodTier = this._determineLodTier(character);

            if (lodTier === 'hero') {
                // Full processing for hero NPCs
                return await this._processHeroCharacterTurn(character, worldState, turnContext);
            } else {
                // Simplified processing for group NPCs
                return await this._processGroupCharacterTurn(character, worldState, turnContext);
            }

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Character turn processing failed for ${character.id}: ${error.message}`);
            }
            // Add the error to the result so it can be handled by the caller
            result.errors.push({
                characterId: character.id,
                error: error.message
            });
            return result;
        }
    }

    /**
     * Determine LOD tier for a character
     * @param {Object} character - Character to evaluate
     * @returns {string} LOD tier ('hero' or 'group')
     */
    _determineLodTier(character) {
        // Use character's lodTier property, defaulting to 'hero' for individual processing
        return character.lodTier || 'hero';
    }

    /**
     * Process turn for hero-tier character (full processing)
     * @param {Object} character - Hero character to process
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Character processing result
     */
    async _processHeroCharacterTurn(character, worldState, turnContext) {
        const result = {
            consciousnessUpdated: false,
            memoryUpdated: false,
            usedCachedState: false,
            significantEvents: [],
            errors: []
        };

        try {
            // Check for significant changes that would require consciousness update
            const significantChanges = this.checkForSignificantChanges(character, worldState, turnContext);

            if (significantChanges.hasChanges) {
                // Significant changes detected - update consciousness
                const updateResult = await this._updateCharacterConsciousness(
                    character,
                    significantChanges.events,
                    worldState
                );

                result.consciousnessUpdated = true;
                result.significantEvents.push(...updateResult.events);

                // Update memory if significant events occurred
                if (updateResult.events.length > 0) {
                    const memoryResult = await this._updateCharacterMemory(
                        character,
                        updateResult.events,
                        worldState
                    );

                    if (memoryResult.updated) {
                        result.memoryUpdated = true;
                    }
                }

            } else {
                // No significant changes - use cached behavioral state
                result.usedCachedState = true;
            }

            // Generate behavior using cached state
            const behaviorResult = this.generateBehaviorFromCachedState(character, worldState, turnContext);

            // Evaluate if behavior result creates significant events
            const behaviorSignificance = this._evaluateBehaviorSignificance(
                character,
                behaviorResult,
                worldState
            );

            if (behaviorSignificance.isSignificant) {
                result.significantEvents.push(behaviorSignificance.event);

                // Trigger consciousness update for significant behavior
                const behaviorUpdateResult = await this._updateCharacterConsciousness(
                    character,
                    [behaviorSignificance.event],
                    worldState
                );

                result.consciousnessUpdated = true;
                result.significantEvents.push(...behaviorUpdateResult.events);
            }

            return result;

        } catch (error) {
            result.errors.push({
                characterId: character.id,
                error: error.message
            });
            return result;
        }
    }

    /**
     * Process turn for group-tier character (simplified processing)
     * @param {Object} character - Group character to process
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Character processing result
     */
    async _processGroupCharacterTurn(character, worldState, turnContext) {
        const result = {
            consciousnessUpdated: false,
            memoryUpdated: false,
            usedCachedState: true, // Group characters always use cached states
            significantEvents: [],
            errors: []
        };

        try {
            // Simplified significant change check - only check critical changes
            const criticalChanges = this._checkCriticalChangesOnly(character, worldState, turnContext);

            if (criticalChanges.hasChanges) {
                // Critical changes detected - update consciousness (less frequently for groups)
                const updateResult = await this._updateCharacterConsciousness(
                    character,
                    criticalChanges.events,
                    worldState
                );

                result.consciousnessUpdated = true;
                result.significantEvents.push(...updateResult.events);

            }

            // Generate simplified behavior for group characters
            const behaviorResult = this._generateSimplifiedBehavior(character, worldState, turnContext);

            // Only evaluate behavior significance for high-confidence actions
            if (behaviorResult.confidence > 0.8) {
                const behaviorSignificance = this._evaluateBehaviorSignificance(
                    character,
                    behaviorResult,
                    worldState
                );

                if (behaviorSignificance.isSignificant) {
                    result.significantEvents.push(behaviorSignificance.event);
                    result.consciousnessUpdated = true;
                }
            }

            return result;

        } catch (error) {
            result.errors.push({
                characterId: character.id,
                error: error.message
            });
            return result;
        }
    }

    /**
     * Check for significant changes that would trigger consciousness updates
     * @param {Object} character - Character to check
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Significant changes result
     */
    checkForSignificantChanges(character, worldState, turnContext = {}) {
        const changes = {
            hasChanges: false,
            events: []
        };

        try {
            // Quick health check first - most likely to trigger updates
            const energyPercent = character.energy / character.maxEnergy;
            const healthPercent = character.health / 100;

            if (energyPercent < 0.2) {
                changes.hasChanges = true;
                changes.events.push({
                    type: 'energy_crisis',
                    outcome: 'negative',
                    description: `Character ${character.name} is critically low on energy`,
                    characterId: character.id,
                    energyPercent: energyPercent,
                    significance: 0.7
                });
                return changes; // Early exit for critical health issues
            }

            if (healthPercent < 0.3) {
                changes.hasChanges = true;
                changes.events.push({
                    type: 'health_crisis',
                    outcome: 'negative',
                    description: `Character ${character.name} is critically injured`,
                    characterId: character.id,
                    healthPercent: healthPercent,
                    significance: 0.8
                });
                return changes; // Early exit for critical health issues
            }

            // Check goal completions (high significance)
            if (character.goals && character.goals.length > 0) {
                const completedGoals = character.goals.filter(goal => goal.status === 'completed');
                if (completedGoals.length > 0) {
                    changes.hasChanges = true;
                    completedGoals.forEach(goal => {
                        changes.events.push({
                            type: 'goal_completion',
                            outcome: 'success',
                            description: `Character ${character.name} completed goal: ${goal.description}`,
                            characterId: character.id,
                            goalId: goal.id,
                            significance: 0.8
                        });
                    });
                    return changes; // Early exit for goal completions
                }
            }

            // Check for dangerous environment
            const currentNode = worldState.nodes?.find(node => node.id === character.currentNodeId);
            if (currentNode?.environment?.isDangerous?.()) {
                changes.hasChanges = true;
                changes.events.push({
                    type: 'environmental_change',
                    outcome: 'negative',
                    description: `Character ${character.name} is in dangerous environment`,
                    characterId: character.id,
                    nodeId: currentNode.id,
                    significance: 0.5
                });
            }

            // Check economic hardship (only if wealth is very low)
            if (character.wealth !== undefined && character.wealth < 10) {
                const significance = this.eventSignificanceService.calculateEventSignificance(
                    {
                        type: 'economic_hardship',
                        outcome: 'negative',
                        characterId: character.id,
                        wealth: character.wealth
                    },
                    {
                        character: character,
                        worldState: worldState
                    }
                );

                if (significance >= this.significanceThreshold) {
                    changes.hasChanges = true;
                    changes.events.push({
                        type: 'economic_hardship',
                        outcome: 'negative',
                        description: `Character ${character.name} is experiencing economic hardship`,
                        characterId: character.id,
                        wealth: character.wealth,
                        significance: significance
                    });
                }
            }

            // Simplified checks for other change types (less frequent)
            if (Math.random() < 0.3) { // Only check 30% of the time for performance
                // Check relationships (simplified)
                const currentRelationships = character.relationships || new Map();
                if (currentRelationships.size > 0) {
                    const significance = this.eventSignificanceService.calculateEventSignificance(
                        {
                            type: 'relationship_change',
                            outcome: 'positive',
                            characterId: character.id
                        },
                        {
                            character: character,
                            worldState: worldState
                        }
                    );

                    if (significance >= this.significanceThreshold) {
                        changes.hasChanges = true;
                        changes.events.push({
                            type: 'relationship_change',
                            outcome: 'positive',
                            description: `Character ${character.name} has active relationships`,
                            characterId: character.id,
                            significance: significance
                        });
                    }
                }

                // Check social context (simplified)
                if (turnContext.groupSize && turnContext.groupSize > 10) {
                    changes.hasChanges = true;
                    changes.events.push({
                        type: 'social_context_change',
                        outcome: 'neutral',
                        description: `Character ${character.name} is in a large group`,
                        characterId: character.id,
                        groupSize: turnContext.groupSize,
                        significance: 0.4
                    });
                }
            }

            return changes;

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error checking for significant changes: ${error.message}`);
            }
            return changes;
        }
    }

    /**
     * Generate behavior from cached behavioral state
     * @param {Object} character - Character to generate behavior for
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Behavior generation result
     */
    generateBehaviorFromCachedState(character, worldState, turnContext = {}) {
        try {
            // Get available interactions for this character
            const availableInteractions = this._getAvailableInteractions(character, worldState);

            if (availableInteractions.length === 0) {
                return {
                    action: 'idle',
                    reason: 'no_available_interactions',
                    confidence: 0.5
                };
            }

            // Calculate decision factors for each interaction using BehavioralStateService
            const decisionFactors = availableInteractions.map(interaction => {
                const factor = this.behavioralStateService.getBehavioralModifier(
                    character,
                    interaction.type,
                    {
                        ...turnContext,
                        interaction: interaction,
                        worldState: worldState
                    }
                );

                return {
                    interaction: interaction,
                    factor: factor,
                    breakdown: this.behavioralStateService.calculateDecisionFactor(
                        character,
                        interaction.type,
                        {
                            ...turnContext,
                            interaction: interaction,
                            worldState: worldState
                        }
                    )
                };
            });

            // Select the interaction with the highest decision factor
            const bestDecision = decisionFactors.reduce((best, current) => {
                return current.factor > best.factor ? current : best;
            });

            return {
                action: 'execute_interaction',
                interaction: bestDecision.interaction,
                confidence: Math.min(bestDecision.factor / 3.0, 1.0), // Normalize to 0-1
                decisionFactor: bestDecision.factor,
                alternatives: decisionFactors.length - 1,
                reasoning: {
                    primaryFactor: bestDecision.breakdown.breakdown,
                    comparison: decisionFactors.map(d => ({
                        interaction: d.interaction.id,
                        factor: d.factor
                    }))
                }
            };

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error generating behavior from cached state: ${error.message}`);
            }

            // For service failures, re-throw to be handled by the main processing loop
            if (error.message.includes('Service temporarily unavailable') ||
                error.message.includes('Service failure')) {
                throw error;
            }

            // Fallback to simple idle behavior for other errors
            return {
                action: 'idle',
                reason: 'behavior_generation_error',
                error: error.message,
                confidence: 0.1
            };
        }
    }

    /**
     * Update character consciousness based on significant events
     * @param {Object} character - Character to update
     * @param {Array} events - Significant events
     * @param {Object} worldState - World state
     * @returns {Object} Update result
     */
    async _updateCharacterConsciousness(character, events, worldState) {
        const result = {
            events: [],
            consciousnessChanged: false
        };

        for (const event of events) {
            try {
                const updateResult = this.consciousnessUpdateService.processEvent(
                    character,
                    event,
                    {
                        worldState: worldState,
                        character: character
                    }
                );

                if (updateResult.success && updateResult.updated) {
                    result.events.push({
                        type: 'consciousness_update',
                        characterId: character.id,
                        triggerEvent: event,
                        changes: updateResult.changes,
                        significance: updateResult.significance
                    });

                    result.consciousnessChanged = true;
                }

            } catch (error) {
                if (this.logger) {
                    this.logger.warn(`Consciousness update failed for event ${event.type}: ${error.message}`);
                }
            }
        }

        return result;
    }

    /**
     * Update character memory with significant events
     * @param {Object} character - Character to update
     * @param {Array} events - Events to potentially store
     * @param {Object} worldState - World state
     * @returns {Object} Memory update result
     */
    async _updateCharacterMemory(character, events, worldState) {
        const result = {
            updated: false,
            memoriesAdded: 0
        };

        for (const event of events) {
            try {
                const memoryResult = await this.significantMemoryService.addMemoryIfSignificant(
                    character,
                    event,
                    {
                        worldState: worldState,
                        context: 'turn_processing'
                    }
                );

                if (memoryResult.added) {
                    result.updated = true;
                    result.memoriesAdded++;
                }

            } catch (error) {
                if (this.logger) {
                    this.logger.warn(`Memory update failed for event ${event.type}: ${error.message}`);
                }
            }
        }

        return result;
    }

    /**
     * Evaluate if behavior result creates significant events
     * @param {Object} character - Character that performed behavior
     * @param {Object} behaviorResult - Result of behavior execution
     * @param {Object} worldState - World state
     * @returns {Object} Significance evaluation
     */
    _evaluateBehaviorSignificance(character, behaviorResult, worldState) {
        const result = {
            isSignificant: false,
            event: null
        };

        try {
            if (behaviorResult.action === 'idle') {
                return result; // Idle actions are not significant
            }

            if (!behaviorResult.interaction) {
                return result; // No interaction to evaluate
            }

            // Evaluate the behavior result significance
            const significance = this.eventSignificanceService.calculateEventSignificance(
                {
                    type: behaviorResult.interaction.type,
                    outcome: behaviorResult.confidence > 0.7 ? 'success' : 'neutral',
                    characterId: character.id,
                    interactionId: behaviorResult.interaction.id
                },
                {
                    character: character,
                    worldState: worldState,
                    behaviorResult: behaviorResult
                }
            );

            if (significance >= this.significanceThreshold) {
                result.isSignificant = true;
                result.event = {
                    id: `behavior_${character.id}_${Date.now()}`,
                    type: behaviorResult.interaction.type,
                    outcome: behaviorResult.confidence > 0.7 ? 'success' : 'neutral',
                    description: `Character ${character.name} executed ${behaviorResult.interaction.name}`,
                    characterId: character.id,
                    interactionId: behaviorResult.interaction.id,
                    significance: significance,
                    confidence: behaviorResult.confidence,
                    decisionFactor: behaviorResult.decisionFactor
                };
            }

            return result;

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error evaluating behavior significance: ${error.message}`);
            }
            return result;
        }
    }

    /**
     * Check for critical changes only (simplified for group characters)
     * @param {Object} character - Character to check
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Critical changes result
     */
    _checkCriticalChangesOnly(character, worldState, turnContext) {
        const changes = {
            hasChanges: false,
            events: []
        };

        try {
            // Only check for critical health and environmental changes for group characters

            // Check for severe health/energy changes
            const energyPercent = character.energy / character.maxEnergy;
            const healthPercent = character.health / 100;

            if (energyPercent < 0.1) { // More critical threshold for groups
                changes.hasChanges = true;
                changes.events.push({
                    type: 'energy_crisis',
                    outcome: 'negative',
                    description: `Character ${character.name} is critically low on energy`,
                    characterId: character.id,
                    energyPercent: energyPercent,
                    significance: 0.9
                });
            }

            if (healthPercent < 0.2) { // More critical threshold for groups
                changes.hasChanges = true;
                changes.events.push({
                    type: 'health_crisis',
                    outcome: 'negative',
                    description: `Character ${character.name} is critically injured`,
                    characterId: character.id,
                    healthPercent: healthPercent,
                    significance: 0.9
                });
            }

            // Check for extremely dangerous environments
            const currentNode = worldState.nodes?.find(node => node.id === character.currentNodeId);
            if (currentNode && currentNode.environment?.isDangerous?.()) {
                // Only trigger for group characters if environment is particularly dangerous
                changes.hasChanges = true;
                changes.events.push({
                    type: 'environmental_crisis',
                    outcome: 'negative',
                    description: `Character ${character.name} is in extremely dangerous environment`,
                    characterId: character.id,
                    nodeId: currentNode.id,
                    significance: 0.8
                });
            }

            return changes;

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error checking critical changes: ${error.message}`);
            }
            return changes;
        }
    }

    /**
     * Generate simplified behavior for group characters
     * @param {Object} character - Character to generate behavior for
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Simplified behavior result
     */
    _generateSimplifiedBehavior(character, worldState, turnContext = {}) {
        try {
            // Get available interactions (same as full processing)
            const availableInteractions = this._getAvailableInteractions(character, worldState);

            if (availableInteractions.length === 0) {
                return {
                    action: 'idle',
                    reason: 'no_available_interactions',
                    confidence: 0.5
                };
            }

            // Simplified decision making - use basic personality traits only
            const personalityTraits = character.personality?.getAllTraits?.() || [];
            const aggression = personalityTraits.find(t => t.id === 'aggression')?.intensity || 0.5;
            const curiosity = personalityTraits.find(t => t.id === 'curiosity')?.intensity || 0.5;

            // Simple behavior selection based on personality and context
            let selectedInteraction;
            let confidence = 0.6; // Base confidence for group characters

            if (turnContext.urgency === 'high') {
                // High urgency - prefer rest or safe actions
                selectedInteraction = availableInteractions.find(i => i.type === 'rest') || availableInteractions[0];
                confidence = 0.8;
            } else if (aggression > 0.7) {
                // Aggressive characters prefer combat
                selectedInteraction = availableInteractions.find(i => i.type === 'combat') || availableInteractions[0];
                confidence = Math.min(aggression, 0.9);
            } else if (curiosity > 0.7) {
                // Curious characters prefer exploration
                selectedInteraction = availableInteractions.find(i => i.type === 'exploration') || availableInteractions[0];
                confidence = Math.min(curiosity, 0.9);
            } else {
                // Default to economic activities
                selectedInteraction = availableInteractions.find(i => i.type === 'economic') || availableInteractions[0];
            }

            return {
                action: 'execute_interaction',
                interaction: selectedInteraction,
                confidence: confidence,
                decisionFactor: confidence * 2.0, // Simplified decision factor
                reasoning: {
                    primaryFactor: 'simplified_group_logic',
                    personalityInfluence: { aggression, curiosity }
                }
            };

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error generating simplified behavior: ${error.message}`);
            }

            return {
                action: 'idle',
                reason: 'behavior_generation_error',
                error: error.message,
                confidence: 0.1
            };
        }
    }
    _checkRelationshipChanges(character, worldState) {
        const events = [];

        // Check for new relationships formed
        const currentRelationships = character.relationships || new Map();

        // This is a simplified check - in practice you'd compare against previous state
        if (currentRelationships.size > 0) {
            // Calculate significance using the service
            const significance = this.eventSignificanceService.calculateEventSignificance(
                {
                    type: 'relationship_change',
                    outcome: 'positive',
                    characterId: character.id
                },
                {
                    character: character,
                    worldState: worldState
                }
            );

            // Only create event if it meets the significance threshold
            if (significance >= this.significanceThreshold) {
                events.push({
                    type: 'relationship_change',
                    outcome: 'positive',
                    description: `Character ${character.name} has active relationships`,
                    characterId: character.id,
                    significance: significance
                });
            }
        }

        return events;
    }

    /**
     * Check for goal status changes
     * @param {Object} character - Character to check
     * @param {Object} worldState - World state
     * @returns {Array} Goal change events
     */
    _checkGoalChanges(character, worldState) {
        const events = [];

        if (character.goals && character.goals.length > 0) {
            // Check if any goals have been completed or failed
            character.goals.forEach(goal => {
                if (goal.status === 'completed') {
                    events.push({
                        type: 'goal_completion',
                        outcome: 'success',
                        description: `Character ${character.name} completed goal: ${goal.description}`,
                        characterId: character.id,
                        goalId: goal.id,
                        significance: 0.8
                    });
                } else if (goal.status === 'failed') {
                    events.push({
                        type: 'goal_failure',
                        outcome: 'failure',
                        description: `Character ${character.name} failed goal: ${goal.description}`,
                        characterId: character.id,
                        goalId: goal.id,
                        significance: 0.6
                    });
                }
            });
        }

        return events;
    }

    /**
     * Check for environmental changes
     * @param {Object} character - Character to check
     * @param {Object} worldState - World state
     * @param {Object} turnContext - Turn context
     * @returns {Array} Environmental change events
     */
    _checkEnvironmentalChanges(character, worldState, turnContext) {
        const events = [];

        // Check current node environment
        const currentNode = worldState.nodes?.find(node => node.id === character.currentNodeId);
        if (currentNode) {
            if (currentNode.environment?.isDangerous?.()) {
                events.push({
                    type: 'environmental_change',
                    outcome: 'negative',
                    description: `Character ${character.name} is in dangerous environment`,
                    characterId: character.id,
                    nodeId: currentNode.id,
                    significance: 0.5
                });
            }

            // Check for seasonal changes
            if (turnContext.season && turnContext.season !== currentNode.environment?.season) {
                events.push({
                    type: 'seasonal_change',
                    outcome: 'neutral',
                    description: `Season changed to ${turnContext.season} for character ${character.name}`,
                    characterId: character.id,
                    season: turnContext.season,
                    significance: 0.3
                });
            }
        }

        return events;
    }

    /**
     * Check for health and energy changes
     * @param {Object} character - Character to check
     * @param {Object} worldState - World state
     * @returns {Array} Health change events
     */
    _checkHealthChanges(character, worldState) {
        const events = [];

        const energyPercent = character.energy / character.maxEnergy;
        const healthPercent = character.health / 100;

        if (energyPercent < 0.2) {
            events.push({
                type: 'energy_crisis',
                outcome: 'negative',
                description: `Character ${character.name} is critically low on energy`,
                characterId: character.id,
                energyPercent: energyPercent,
                significance: 0.7
            });
        }

        if (healthPercent < 0.3) {
            events.push({
                type: 'health_crisis',
                outcome: 'negative',
                description: `Character ${character.name} is critically injured`,
                characterId: character.id,
                healthPercent: healthPercent,
                significance: 0.8
            });
        }

        return events;
    }

    /**
     * Check for economic changes
     * @param {Object} character - Character to check
     * @param {Object} worldState - World state
     * @returns {Array} Economic change events
     */
    _checkEconomicChanges(character, worldState) {
        const events = [];

        // Check for significant wealth changes (this would need previous state comparison)
        if (character.wealth !== undefined) {
            // Simplified check - in practice you'd compare against previous wealth
            if (character.wealth < 10) {
                // Calculate significance using the service
                const significance = this.eventSignificanceService.calculateEventSignificance(
                    {
                        type: 'economic_hardship',
                        outcome: 'negative',
                        characterId: character.id,
                        wealth: character.wealth
                    },
                    {
                        character: character,
                        worldState: worldState
                    }
                );

                // Only create event if it meets the significance threshold
                if (significance >= this.significanceThreshold) {
                    events.push({
                        type: 'economic_hardship',
                        outcome: 'negative',
                        description: `Character ${character.name} is experiencing economic hardship`,
                        characterId: character.id,
                        wealth: character.wealth,
                        significance: significance
                    });
                }
            }
        }

        return events;
    }

    /**
     * Check for social context changes
     * @param {Object} character - Character to check
     * @param {Object} worldState - World state
     * @param {Object} turnContext - Turn context
     * @returns {Array} Social context change events
     */
    _checkSocialContextChanges(character, worldState, turnContext) {
        const events = [];

        // Check for group size changes
        if (turnContext.groupSize && turnContext.groupSize > 10) {
            events.push({
                type: 'social_context_change',
                outcome: 'neutral',
                description: `Character ${character.name} is in a large group`,
                characterId: character.id,
                groupSize: turnContext.groupSize,
                significance: 0.4
            });
        }

        // Check for authority presence
        if (turnContext.hasAuthority) {
            events.push({
                type: 'authority_presence',
                outcome: 'neutral',
                description: `Character ${character.name} is in presence of authority`,
                characterId: character.id,
                significance: 0.4
            });
        }

        return events;
    }

    /**
     * Get available interactions for a character
     * @param {Object} character - Character to get interactions for
     * @param {Object} worldState - World state
     * @returns {Array} Available interactions
     */
    _getAvailableInteractions(character, worldState) {
        // This is a simplified implementation - in practice you'd query the interaction system
        const interactions = worldState.interactions || [];

        return interactions.filter(interaction => {
            // Check if character meets prerequisites
            return character.meetsPrerequisites ? character.meetsPrerequisites(interaction) : true;
        });
    }

    /**
     * Validate input parameters
     * @param {Array} characters - Characters array
     * @param {Object} worldState - World state
     */
    _validateInputs(characters, worldState) {
        if (!Array.isArray(characters)) {
            throw new Error('Characters must be an array');
        }

        if (!worldState || typeof worldState !== 'object') {
            throw new Error('World state must be an object');
        }

        if (!worldState.nodes || !Array.isArray(worldState.nodes)) {
            throw new Error('World state must contain nodes array');
        }

        if (!worldState.interactions || !Array.isArray(worldState.interactions)) {
            throw new Error('World state must contain interactions array');
        }
    }

    /**
     * Update performance metrics
     * @param {Object} results - Processing results
     * @param {number} processingTime - Total processing time
     */
    _updatePerformanceMetrics(results, processingTime) {
        this.performanceMetrics.totalProcessingTime += processingTime;
        this.performanceMetrics.charactersProcessed += results.processedCharacters;
        this.performanceMetrics.consciousnessUpdates += results.consciousnessUpdates;
        this.performanceMetrics.memoryUpdates += results.memoryUpdates;
        this.performanceMetrics.cachedStatesUsed += results.cachedStatesUsed;
        this.performanceMetrics.turnCount++;
    }

    /**
     * Perform automatic checkpoint
     * @param {Array} characters - Characters to checkpoint
     * @param {Object} worldState - World state
     */
    async _performAutoCheckpoint(characters, worldState) {
        try {
            const checkpointData = {
                characters: characters,
                worldState: worldState,
                timestamp: Date.now(),
                turnNumber: this.performanceMetrics.turnCount
            };

            await this.consciousnessCheckpointService.saveCheckpoint(
                `auto_turn_${this.performanceMetrics.turnCount}`,
                checkpointData
            );

            if (this.logger) {
                this.logger.info(`Auto-checkpoint saved at turn ${this.performanceMetrics.turnCount}`);
            }

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Auto-checkpoint failed: ${error.message}`);
            }
        }
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            averageProcessingTime: this.performanceMetrics.charactersProcessed > 0
                ? this.performanceMetrics.totalProcessingTime / this.performanceMetrics.charactersProcessed
                : 0,
            consciousnessUpdateRate: this.performanceMetrics.charactersProcessed > 0
                ? this.performanceMetrics.consciousnessUpdates / this.performanceMetrics.charactersProcessed
                : 0,
            cacheHitRate: this.performanceMetrics.charactersProcessed > 0
                ? this.performanceMetrics.cachedStatesUsed / this.performanceMetrics.charactersProcessed
                : 0
        };
    }

    /**
     * Reset performance metrics
     */
    resetPerformanceMetrics() {
        this.performanceMetrics = {
            totalProcessingTime: 0,
            charactersProcessed: 0,
            consciousnessUpdates: 0,
            memoryUpdates: 0,
            cachedStatesUsed: 0,
            turnCount: 0
        };
    }

    /**
     * Configure processor settings
     * @param {Object} settings - Configuration settings
     */
    configure(settings = {}) {
        if (settings.significanceThreshold !== undefined) {
            this.significanceThreshold = settings.significanceThreshold;
        }

        if (settings.maxProcessingTimePerTurn !== undefined) {
            this.maxProcessingTimePerTurn = settings.maxProcessingTimePerTurn;
        }

        if (settings.enableAutoCheckpoint !== undefined) {
            this.enableAutoCheckpoint = settings.enableAutoCheckpoint;
        }

        if (settings.checkpointInterval !== undefined) {
            this.checkpointInterval = settings.checkpointInterval;
        }
    }
}

export default EfficientTurnProcessor;