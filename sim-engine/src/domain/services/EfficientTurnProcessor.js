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
import { PoliticalTrackingService } from './PoliticalTrackingService.js';
import ResourceFlowService from './ResourceFlowService.js';
import BranchWeightingService from './BranchWeightingService.js';

class EfficientTurnProcessor extends BaseDomainService {
    constructor(
        behavioralStateService = null,
        consciousnessUpdateService = null,
        eventSignificanceService = null,
        significantMemoryService = null,
        consciousnessCheckpointService = null,
        politicalTrackingService = null,
        resourceFlowService = null,
        branchWeightingService = null,
        logger = null
    ) {
        super();
        this.behavioralStateService = behavioralStateService || new BehavioralStateService();
        this.consciousnessUpdateService = consciousnessUpdateService || new ConsciousnessUpdateService();
        this.eventSignificanceService = eventSignificanceService || new EventSignificanceService();
        this.significantMemoryService = significantMemoryService || new SignificantMemoryService();
        this.consciousnessCheckpointService = consciousnessCheckpointService || new ConsciousnessCheckpointService();
        this.politicalTrackingService = politicalTrackingService || new PoliticalTrackingService();
        this.resourceFlowService = resourceFlowService || new ResourceFlowService();
        this.branchWeightingService = branchWeightingService || new BranchWeightingService();
        this.logger = logger;

        // Performance tracking
        this.performanceMetrics = {
            totalProcessingTime: 0,
            charactersProcessed: 0,
            consciousnessUpdates: 0,
            memoryUpdates: 0,
            cachedStatesUsed: 0,
            turnCount: 0,
            tierMetrics: {
                leader: { processed: 0, consciousnessUpdates: 0, averageTime: 0 },
                specialist: { processed: 0, consciousnessUpdates: 0, averageTime: 0 },
                citizen: { processed: 0, consciousnessUpdates: 0, averageTime: 0 }
            }
        };

        // Configuration
        this.significanceThreshold = 0.3;
        this.maxProcessingTimePerTurn = 5000; // 5 seconds
        this.enableAutoCheckpoint = true;
        this.checkpointInterval = 10; // Every 10 turns

        // NPC Tier System Configuration
        this.npcTierConfig = {
            tier1: {
                name: 'leader',
                maxPerSettlement: 3,
                updateFrequency: 'every_turn',
                consciousnessDetail: 'full',
                interactionComplexity: 'high',
                memoryDetail: 'full',
                economicRole: 'strategic'
            },
            tier2: {
                name: 'specialist',
                populationPercentage: 0.15, // 15% of population
                updateFrequency: 'significant_events',
                consciousnessDetail: 'moderate',
                interactionComplexity: 'medium',
                memoryDetail: 'selective',
                economicRole: 'professional'
            },
            tier3: {
                name: 'citizen',
                populationPercentage: 0.75, // 75% of population
                updateFrequency: 'weekly_major_events',
                consciousnessDetail: 'minimal',
                interactionComplexity: 'basic',
                memoryDetail: 'minimal',
                economicRole: 'basic'
            }
        };

        // Tier assignment tracking
        this.settlementTierAssignments = new Map();
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

            // Validate resource flows after character processing
            const resourceValidationResult = await this._validateResourceFlows(worldState, turnContext);
            if (resourceValidationResult.hasIssues) {
                results.resourceFlowIssues = resourceValidationResult.issues;
                results.errors.push(...resourceValidationResult.errors);

                // Log resource flow issues
                if (this.logger) {
                    this.logger.warn(`Resource flow validation found ${resourceValidationResult.issues.length} issues`);
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
            // Determine NPC tier for processing optimization
            const npcTier = this._determineNpcTier(character, worldState);

            if (npcTier === 'leader') {
                // Full processing for leader NPCs
                return await this._processLeaderCharacterTurn(character, worldState, turnContext);
            } else if (npcTier === 'specialist') {
                // Moderate processing for specialist NPCs
                return await this._processSpecialistCharacterTurn(character, worldState, turnContext);
            } else {
                // Minimal processing for citizen NPCs
                return await this._processCitizenCharacterTurn(character, worldState, turnContext);
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
     * Determine NPC tier for a character based on settlement context and character attributes
     * @param {Object} character - Character to evaluate
     * @param {Object} worldState - World state for settlement context
     * @returns {string} NPC tier ('leader', 'specialist', or 'citizen')
     */
    _determineNpcTier(character, worldState) {
        try {
            // Check if character already has a tier assigned
            if (character.npcTier) {
                return character.npcTier;
            }

            // Get settlement context
            const settlement = this._getCharacterSettlement(character, worldState);
            if (!settlement) {
                return 'citizen'; // Default to citizen if no settlement context
            }

            // Get or create tier assignments for this settlement
            const settlementId = settlement.id;
            if (!this.settlementTierAssignments.has(settlementId)) {
                this.settlementTierAssignments.set(settlementId, this._assignSettlementTiers(settlement, worldState));
            }

            const tierAssignments = this.settlementTierAssignments.get(settlementId);

            // Check if this character is assigned to a specific tier
            const tierAssignment = tierAssignments.find(assignment =>
                assignment.characterId === character.id
            );

            return tierAssignment ? tierAssignment.tier : 'citizen';

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error determining NPC tier for ${character.id}: ${error.message}`);
            }
            return 'citizen'; // Default to citizen tier on error
        }
    }

    /**
     * Assign NPC tiers for a settlement based on population and character attributes
     * @param {Object} settlement - Settlement to assign tiers for
     * @param {Object} worldState - World state
     * @returns {Array} Array of tier assignments
     */
    _assignSettlementTiers(settlement, worldState) {
        const assignments = [];
        const population = settlement.population?.total || 100;

        // Get all characters in this settlement
        const settlementCharacters = worldState.characters?.filter(char =>
            char.currentNodeId === settlement.id ||
            char.assignedSettlementId === settlement.id
        ) || [];

        // Sort characters by leadership potential (combination of attributes and roles)
        const sortedCharacters = settlementCharacters
            .map(char => ({
                character: char,
                leadershipScore: this._calculateLeadershipScore(char)
            }))
            .sort((a, b) => b.leadershipScore - a.leadershipScore);

        // Assign Tier 1 (Leaders): Top characters with highest leadership scores
        const tier1Count = Math.min(this.npcTierConfig.tier1.maxPerSettlement, Math.ceil(population * 0.03));
        for (let i = 0; i < Math.min(tier1Count, sortedCharacters.length); i++) {
            assignments.push({
                characterId: sortedCharacters[i].character.id,
                tier: 'leader',
                leadershipScore: sortedCharacters[i].leadershipScore
            });
        }

        // Assign Tier 2 (Specialists): Characters with professional skills
        const tier2Count = Math.floor(population * this.npcTierConfig.tier2.populationPercentage);
        const specialistCandidates = sortedCharacters.slice(tier1Count);

        for (let i = 0; i < Math.min(tier2Count, specialistCandidates.length); i++) {
            const char = specialistCandidates[i].character;
            const hasSpecialistSkills = this._hasSpecialistSkills(char);

            if (hasSpecialistSkills || i < tier2Count * 0.5) { // Fill at least half with specialists
                assignments.push({
                    characterId: char.id,
                    tier: 'specialist',
                    leadershipScore: specialistCandidates[i].leadershipScore,
                    specialistSkills: hasSpecialistSkills
                });
            }
        }

        // Assign Tier 3 (Citizens): Remaining population
        const remainingCharacters = settlementCharacters.filter(char =>
            !assignments.find(assignment => assignment.characterId === char.id)
        );

        remainingCharacters.forEach(char => {
            assignments.push({
                characterId: char.id,
                tier: 'citizen',
                leadershipScore: this._calculateLeadershipScore(char)
            });
        });

        if (this.logger) {
            this.logger.info(`Assigned tiers for settlement ${settlement.id}: ${assignments.filter(a => a.tier === 'leader').length} leaders, ${assignments.filter(a => a.tier === 'specialist').length} specialists, ${assignments.filter(a => a.tier === 'citizen').length} citizens`);
        }

        return assignments;
    }

    /**
     * Calculate leadership score for tier assignment
     * @param {Object} character - Character to score
     * @returns {number} Leadership score (0-1)
     */
    _calculateLeadershipScore(character) {
        if (!character.attributes) return 0.1; // Low default score

        const charisma = character.attributes.charisma || 10;
        const intelligence = character.attributes.intelligence || 10;
        const wisdom = character.attributes.wisdom || 10;

        // Leadership score based on social and mental attributes
        const baseScore = (charisma + intelligence + wisdom) / 30; // Normalize to 0-1

        // Bonus for existing leadership roles or high reputation
        let bonus = 0;
        if (character.role === 'leader' || character.role === 'noble') bonus += 0.3;
        if (character.reputation && character.reputation > 50) bonus += 0.2;
        if (character.wealth && character.wealth > 100) bonus += 0.1;

        return Math.min(1.0, baseScore + bonus);
    }

    /**
     * Check if character has specialist skills
     * @param {Object} character - Character to check
     * @returns {boolean} Whether character has specialist skills
     */
    _hasSpecialistSkills(character) {
        // Check for specialist professions or high skill attributes
        const specialistProfessions = ['merchant', 'craftsman', 'healer', 'guard', 'priest', 'teacher'];
        const hasSpecialistProfession = specialistProfessions.includes(character.profession);

        // Check for high specialist attributes
        const hasHighSpecialistStats = (
            (character.attributes?.intelligence || 0) > 14 ||
            (character.attributes?.wisdom || 0) > 14 ||
            (character.attributes?.dexterity || 0) > 14
        );

        return hasSpecialistProfession || hasHighSpecialistStats;
    }

    /**
     * Get settlement for a character
     * @param {Object} character - Character to find settlement for
     * @param {Object} worldState - World state
     * @returns {Object|null} Settlement object or null
     */
    _getCharacterSettlement(character, worldState) {
        // Try different ways to find the settlement
        if (character.assignedSettlementId) {
            return worldState.settlements?.find(s => s.id === character.assignedSettlementId);
        }

        if (character.currentNodeId) {
            const node = worldState.nodes?.find(n => n.id === character.currentNodeId);
            if (node?.type === 'settlement') {
                return worldState.settlements?.find(s => s.id === node.settlementId);
            }
        }

        return null;
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
                        const significance = this.eventSignificanceService.calculateEventSignificance(
                            {
                                type: 'goal_completion',
                                outcome: 'success',
                                characterId: character.id,
                                goalId: goal.id
                            },
                            {
                                character: character,
                                worldState: worldState
                            }
                        );

                        changes.events.push({
                            type: 'goal_completion',
                            outcome: 'success',
                            description: `Character ${character.name} completed goal: ${goal.description || goal.id}`,
                            characterId: character.id,
                            goalId: goal.id,
                            significance: significance
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
     * Generate behavior from cached behavioral state using personality-weighted selection
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
                    confidence: 0.5,
                    decisionFactor: 0.0,
                    alternatives: 0,
                    reasoning: {
                        primaryFactor: 'no_interactions_available',
                        comparison: []
                    }
                };
            }

            // Convert interactions to branches for personality-weighted selection
            const branches = availableInteractions.map(interaction => ({
                id: interaction.id,
                type: interaction.type,
                name: interaction.name,
                metadata: {
                    // Personality preferences based on interaction type
                    personalityAffinities: this._getPersonalityAffinitiesForInteraction(interaction),
                    // Alignment leanings
                    alignmentLean: this._getAlignmentLeanForInteraction(interaction),
                    // Attribute preferences
                    attributePreference: this._getAttributePreferenceForInteraction(interaction),
                    // Tags for categorization
                    tags: interaction.tags || [interaction.type],
                    // Difficulty/effort level
                    effortLevel: this._calculateEffortLevel(interaction),
                    // Expected outcomes
                    expectedOutcomes: this._getExpectedOutcomes(interaction),
                    // Behavioral modifier from service
                    behavioralModifier: this.behavioralStateService ? 
                        this.behavioralStateService.getBehavioralModifier(character, interaction.type, {
                            worldState: worldState,
                            turnContext: turnContext,
                            interaction: interaction
                        }) : 1.0
                },
                // Condition to check if interaction is valid for character
                condition: (char) => this._isInteractionValidForCharacter(interaction, char, worldState)
            }));

            // Use BranchWeightingService for personality-weighted selection
            const selectionResult = this.branchWeightingService.selectWeightedBranch(
                character,
                branches,
                {
                    ...turnContext,
                    worldState: worldState,
                    interactionType: 'behavior_selection',
                    location: character.currentNodeId,
                    availableInteractions: availableInteractions.length
                },
                'weighted_random' // Use weighted random selection for behavior
            );

            const selectedBranch = selectionResult.branch;
            const selectedInteraction = availableInteractions.find(i => i.id === selectedBranch.id);

            // Calculate confidence based on weight (normalize to 0-1 range)
            const confidence = Math.min(Math.max(selectionResult.weight / 2.0, 0.1), 1.0);

            return {
                action: 'execute_interaction',
                interaction: selectedInteraction,
                confidence: confidence,
                decisionFactor: selectionResult.weight,
                alternatives: branches.length - 1,
                reasoning: {
                    primaryFactor: selectionResult.reason,
                    selectionMethod: selectionResult.selectionMethod,
                    weightBreakdown: selectionResult.weightBreakdown,
                    comparison: branches.map(branch => ({
                        interaction: branch.id,
                        type: branch.type,
                        weight: branch.id === selectedBranch.id ? selectionResult.weight : null
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

            // For behavioral state service failures, also re-throw
            if (error.message.includes('behavioralStateService') ||
                error.message.includes('getBehavioralModifier')) {
                throw error;
            }

            // Fallback to simple idle behavior for other errors
            return {
                action: 'idle',
                reason: 'behavior_generation_error',
                error: error.message,
                confidence: 0.1,
                decisionFactor: 0.0,
                alternatives: 0,
                reasoning: {
                    primaryFactor: 'error_fallback',
                    comparison: []
                }
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

    /**
     * Process turn for leader-tier character (full processing every turn)
     * @param {Object} character - Leader character to process
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Character processing result
     */
    async _processLeaderCharacterTurn(character, worldState, turnContext) {
        const result = {
            consciousnessUpdated: false,
            memoryUpdated: false,
            usedCachedState: false,
            significantEvents: [],
            errors: [],
            tier: 'leader'
        };

        try {
            // Leaders get full consciousness updates every turn
            const significantChanges = this.checkForSignificantChanges(character, worldState, turnContext);

            if (significantChanges.hasChanges) {
                const updateResult = await this._updateCharacterConsciousness(
                    character,
                    significantChanges.events,
                    worldState
                );

                result.consciousnessUpdated = true;
                result.significantEvents.push(...updateResult.events);

                // Update memory for all significant events
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
                result.usedCachedState = true;
            }

            // Generate complex behavior with full interaction set
            const behaviorResult = this.generateBehaviorFromCachedState(character, worldState, turnContext);

            // Evaluate all behavior significance for leaders
            const behaviorSignificance = this._evaluateBehaviorSignificance(
                character,
                behaviorResult,
                worldState
            );

            if (behaviorSignificance.isSignificant) {
                result.significantEvents.push(behaviorSignificance.event);

                const behaviorUpdateResult = await this._updateCharacterConsciousness(
                    character,
                    [behaviorSignificance.event],
                    worldState
                );

                result.consciousnessUpdated = true;
                result.significantEvents.push(...behaviorUpdateResult.events);
            }

            // Track political career progression for significant actions
            if (behaviorSignificance.isSignificant) {
                await this._trackPoliticalCareerProgression(character, behaviorSignificance.event, worldState);
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
     * Process turn for specialist-tier character (moderate processing)
     * @param {Object} character - Specialist character to process
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Character processing result
     */
    async _processSpecialistCharacterTurn(character, worldState, turnContext) {
        const result = {
            consciousnessUpdated: false,
            memoryUpdated: false,
            usedCachedState: false,
            significantEvents: [],
            errors: [],
            tier: 'specialist'
        };

        try {
            // Specialists update consciousness only on significant events
            const significantChanges = this._checkSignificantChangesForSpecialist(character, worldState, turnContext);

            if (significantChanges.hasChanges) {
                const updateResult = await this._updateCharacterConsciousness(
                    character,
                    significantChanges.events,
                    worldState
                );

                result.consciousnessUpdated = true;
                result.significantEvents.push(...updateResult.events);

                // Selective memory updates for specialists
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
                result.usedCachedState = true;
            }

            // Generate professional behavior with medium interaction complexity
            const behaviorResult = this._generateSpecialistBehavior(character, worldState, turnContext);

            // Evaluate behavior significance with moderate threshold
            const behaviorSignificance = this._evaluateBehaviorSignificance(
                character,
                behaviorResult,
                worldState
            );

            if (behaviorSignificance.isSignificant && behaviorSignificance.event.significance > 0.6) {
                result.significantEvents.push(behaviorSignificance.event);
                result.consciousnessUpdated = true;
            }

            // Track political career progression for significant actions
            if (behaviorSignificance.isSignificant && behaviorSignificance.event.significance > 0.6) {
                await this._trackPoliticalCareerProgression(character, behaviorSignificance.event, worldState);
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
     * Process turn for citizen-tier character (minimal processing)
     * @param {Object} character - Citizen character to process
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Character processing result
     */
    async _processCitizenCharacterTurn(character, worldState, turnContext) {
        const result = {
            consciousnessUpdated: false,
            memoryUpdated: false,
            usedCachedState: true, // Citizens almost always use cached states
            significantEvents: [],
            errors: [],
            tier: 'citizen'
        };

        try {
            // Citizens update consciousness only on major events or weekly
            const shouldUpdate = this._shouldUpdateCitizenConsciousness(character, worldState, turnContext);

            if (shouldUpdate) {
                const criticalChanges = this._checkCriticalChangesForCitizen(character, worldState, turnContext);

                if (criticalChanges.hasChanges) {
                    const updateResult = await this._updateCharacterConsciousness(
                        character,
                        criticalChanges.events,
                        worldState
                    );

                    result.consciousnessUpdated = true;
                    result.significantEvents.push(...updateResult.events);
                }
            }

            // Generate basic behavior for citizens
            const behaviorResult = this._generateCitizenBehavior(character, worldState, turnContext);

            // Minimal behavior significance evaluation
            if (behaviorResult.confidence > 0.9) { // Only very confident actions
                const behaviorSignificance = this._evaluateBehaviorSignificance(
                    character,
                    behaviorResult,
                    worldState
                );

                if (behaviorSignificance.isSignificant && behaviorSignificance.event.significance > 0.8) {
                    result.significantEvents.push(behaviorSignificance.event);
                    result.consciousnessUpdated = true;

                    // Track political career progression for significant actions (rare for citizens)
                    await this._trackPoliticalCareerProgression(character, behaviorSignificance.event, worldState);
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
     * Check for significant changes specific to specialist characters
     * @param {Object} character - Specialist character to check
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Significant changes result
     */
    _checkSignificantChangesForSpecialist(character, worldState, turnContext) {
        const changes = {
            hasChanges: false,
            events: []
        };

        try {
            // Check professional/career-related changes
            if (character.profession) {
                const professionEvents = this._checkProfessionChanges(character, worldState);
                changes.events.push(...professionEvents);
            }

            // Check workshop/business-related changes
            const businessEvents = this._checkBusinessChanges(character, worldState);
            changes.events.push(...businessEvents);

            // Check skill development changes
            const skillEvents = this._checkSkillDevelopment(character, worldState);
            changes.events.push(...skillEvents);

            // Include some general significant changes
            const generalChanges = this.checkForSignificantChanges(character, worldState, turnContext);
            if (generalChanges.hasChanges) {
                changes.events.push(...generalChanges.events);
            }

            changes.hasChanges = changes.events.length > 0;

            return changes;

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error checking specialist changes: ${error.message}`);
            }
            return changes;
        }
    }

    /**
     * Check for critical changes specific to citizen characters
     * @param {Object} character - Citizen character to check
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Critical changes result
     */
    _checkCriticalChangesForCitizen(character, worldState, turnContext) {
        const changes = {
            hasChanges: false,
            events: []
        };

        try {
            // Only check for truly critical changes for citizens
            const energyPercent = character.energy / character.maxEnergy;
            const healthPercent = character.health / 100;

            if (energyPercent < 0.05) { // Near death from exhaustion
                changes.hasChanges = true;
                changes.events.push({
                    type: 'critical_energy_crisis',
                    outcome: 'negative',
                    description: `Character ${character.name} is near death from exhaustion`,
                    characterId: character.id,
                    energyPercent: energyPercent,
                    significance: 0.95
                });
            }

            if (healthPercent < 0.1) { // Near death from injury
                changes.hasChanges = true;
                changes.events.push({
                    type: 'critical_health_crisis',
                    outcome: 'negative',
                    description: `Character ${character.name} is near death from injury`,
                    characterId: character.id,
                    healthPercent: healthPercent,
                    significance: 0.95
                });
            }

            // Check for settlement-wide crises that affect everyone
            const settlementCrisis = this._checkSettlementCrisis(character, worldState);
            if (settlementCrisis) {
                changes.hasChanges = true;
                changes.events.push(settlementCrisis);
            }

            return changes;

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error checking citizen critical changes: ${error.message}`);
            }
            return changes;
        }
    }

    /**
     * Determine if citizen consciousness should be updated
     * @param {Object} character - Citizen character
     * @param {Object} worldState - World state
     * @param {Object} turnContext - Turn context
     * @returns {boolean} Whether to update consciousness
     */
    _shouldUpdateCitizenConsciousness(character, worldState, turnContext) {
        // Update on major events or approximately weekly (every 7 turns)
        const turnNumber = turnContext.turnNumber || 0;
        const isWeeklyUpdate = turnNumber % 7 === 0;

        // Always update on critical settlement events
        const settlementCrisis = this._checkSettlementCrisis(character, worldState);

        return isWeeklyUpdate || settlementCrisis !== null;
    }

    /**
     * Generate specialist behavior with professional focus using personality-weighted selection
     * @param {Object} character - Specialist character
     * @param {Object} worldState - World state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Specialist behavior result
     */
    _generateSpecialistBehavior(character, worldState, turnContext = {}) {
        try {
            const availableInteractions = this._getSpecialistInteractions(character, worldState);

            if (availableInteractions.length === 0) {
                return {
                    action: 'idle',
                    reason: 'no_specialist_interactions',
                    confidence: 0.5
                };
            }

            // Convert interactions to branches for personality-weighted selection
            const branches = availableInteractions.map(interaction => ({
                id: interaction.id,
                type: interaction.type,
                name: interaction.name,
                metadata: {
                    // Specialist-focused personality affinities
                    personalityAffinities: this._getSpecialistPersonalityAffinities(interaction, character.profession),
                    // Professional alignment preferences
                    alignmentLean: this._getAlignmentLeanForInteraction(interaction),
                    // Specialist attribute preferences
                    attributePreference: this._getSpecialistAttributePreferences(interaction, character.profession),
                    // Professional tags
                    tags: ['specialist', character.profession || 'professional', interaction.type],
                    // Professional effort level
                    effortLevel: this._calculateEffortLevel(interaction),
                    // Professional outcomes
                    expectedOutcomes: this._getSpecialistOutcomes(interaction, character.profession),
                    // Behavioral modifier from service
                    behavioralModifier: this.behavioralStateService ? 
                        this.behavioralStateService.getBehavioralModifier(character, interaction.type, {
                            worldState: worldState,
                            turnContext: turnContext,
                            interaction: interaction,
                            profession: character.profession
                        }) : 1.0
                },
                // Condition for specialist validity
                condition: (char) => this._isSpecialistInteractionValid(interaction, char, worldState)
            }));

            // Use BranchWeightingService for professional behavior selection
            const selectionResult = this.branchWeightingService.selectWeightedBranch(
                character,
                branches,
                {
                    ...turnContext,
                    worldState: worldState,
                    interactionType: 'specialist_behavior',
                    profession: character.profession,
                    specialistContext: true
                },
                'personality_driven' // Specialists use personality-driven selection
            );

            const selectedBranch = selectionResult.branch;
            const selectedInteraction = availableInteractions.find(i => i.id === selectedBranch.id);

            // Higher confidence for specialists due to professional expertise
            const confidence = Math.min(Math.max(selectionResult.weight / 2.5, 0.4), 1.0);

            return {
                action: 'execute_interaction',
                interaction: selectedInteraction,
                confidence: confidence,
                decisionFactor: selectionResult.weight,
                alternatives: branches.length - 1,
                reasoning: {
                    primaryFactor: selectionResult.reason,
                    selectionMethod: selectionResult.selectionMethod,
                    profession: character.profession,
                    weightBreakdown: selectionResult.weightBreakdown,
                    comparison: branches.map(branch => ({
                        interaction: branch.id,
                        type: branch.type,
                        weight: branch.id === selectedBranch.id ? selectionResult.weight : null
                    }))
                }
            };

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error generating specialist behavior: ${error.message}`);
            }

            return {
                action: 'idle',
                reason: 'specialist_behavior_error',
                error: error.message,
                confidence: 0.1
            };
        }
    }

    /**
     * Generate citizen behavior with basic focus
     * @param {Object} character - Citizen character
     * @param {Object} worldState - World state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Citizen behavior result
     */
    /**
     * Generate citizen behavior with personality-weighted selection for daily activities
     * @param {Object} character - Citizen character
     * @param {Object} worldState - World state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Citizen behavior result
     */
    _generateCitizenBehavior(character, worldState, turnContext = {}) {
        try {
            const availableInteractions = this._getCitizenInteractions(character, worldState);

            if (availableInteractions.length === 0) {
                return {
                    action: 'idle',
                    reason: 'no_citizen_interactions',
                    confidence: 0.5
                };
            }

            // Convert interactions to branches for personality-weighted selection
            const branches = availableInteractions.map(interaction => ({
                id: interaction.id,
                type: interaction.type,
                name: interaction.name,
                metadata: {
                    // Citizen personality affinities (more balanced than specialists)
                    personalityAffinities: this._getCitizenPersonalityAffinities(interaction),
                    // Citizen alignment preferences (more neutral)
                    alignmentLean: this._getAlignmentLeanForInteraction(interaction),
                    // Citizen attribute preferences (general life skills)
                    attributePreference: this._getCitizenAttributePreferences(interaction),
                    // Citizen tags
                    tags: ['citizen', 'daily_life', interaction.type],
                    // Citizen effort level (generally lower than specialists)
                    effortLevel: this._calculateEffortLevel(interaction),
                    // Citizen expected outcomes (practical benefits)
                    expectedOutcomes: this._getCitizenOutcomes(interaction),
                    // Behavioral modifier from service
                    behavioralModifier: this.behavioralStateService ? 
                        this.behavioralStateService.getBehavioralModifier(character, interaction.type, {
                            worldState: worldState,
                            turnContext: turnContext,
                            interaction: interaction,
                            citizenContext: true
                        }) : 1.0
                },
                // Condition for citizen validity
                condition: (char) => this._isCitizenInteractionValid(interaction, char, worldState)
            }));

            // Use BranchWeightingService for citizen behavior selection
            const selectionResult = this.branchWeightingService.selectWeightedBranch(
                character,
                branches,
                {
                    ...turnContext,
                    worldState: worldState,
                    interactionType: 'citizen_behavior',
                    citizenContext: true,
                    basicNeeds: this._assessBasicNeeds(character)
                },
                'personality_driven' // Citizens use personality-driven selection
            );

            const selectedBranch = selectionResult.branch;
            const selectedInteraction = availableInteractions.find(i => i.id === selectedBranch.id);

            // Moderate confidence for citizens due to simpler decision-making
            const confidence = Math.min(Math.max(selectionResult.weight / 3.0, 0.3), 0.9);

            return {
                action: 'execute_interaction',
                interaction: selectedInteraction,
                confidence: confidence,
                decisionFactor: selectionResult.weight,
                alternatives: branches.length - 1,
                reasoning: {
                    primaryFactor: selectionResult.reason,
                    selectionMethod: selectionResult.selectionMethod,
                    basicNeeds: this._assessBasicNeeds(character),
                    weightBreakdown: selectionResult.weightBreakdown,
                    comparison: branches.map(branch => ({
                        interaction: branch.id,
                        type: branch.type,
                        weight: branch.id === selectedBranch.id ? selectionResult.weight : null
                    }))
                }
            };

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error generating citizen behavior: ${error.message}`);
            }

            return {
                action: 'idle',
                reason: 'citizen_behavior_error',
                error: error.message,
                confidence: 0.1
            };
        }
    }

    /**
     * Check for settlement-wide crisis affecting citizens
     * @param {Object} character - Character to check
     * @param {Object} worldState - World state
     * @returns {Object|null} Crisis event or null
     */
    _checkSettlementCrisis(character, worldState) {
        const settlement = this._getCharacterSettlement(character, worldState);
        if (!settlement) return null;

        // Check for famine, plague, war, etc.
        if (settlement.crisis) {
            return {
                type: 'settlement_crisis',
                outcome: 'negative',
                description: `Settlement ${settlement.name} is experiencing ${settlement.crisis.type}`,
                characterId: character.id,
                settlementId: settlement.id,
                crisisType: settlement.crisis.type,
                significance: 0.8
            };
        }

        return null;
    }

    /**
     * Validate inputs for turn processing
     * @param {Array} characters - Array of character objects
     * @param {Object} worldState - Current world state
     * @throws {Error} If inputs are invalid
     */
    _validateInputs(characters, worldState) {
        if (!Array.isArray(characters) && characters !== null) {
            throw new Error('Characters must be an array or null');
        }

        if (characters === null) {
            throw new Error('Characters cannot be null');
        }

        if (!worldState && worldState !== null) {
            throw new Error('World state must be a valid object');
        }

        if (worldState === null) {
            throw new Error('World state cannot be null');
        }

        // Allow empty character arrays - just return early
        if (characters.length === 0) {
            return;
        }

        // Validate each character has required properties
        for (const character of characters) {
            if (!character || typeof character !== 'object') {
                throw new Error('Each character must be a valid object');
            }

            if (!character.id) {
                throw new Error('Each character must have an id');
            }

            if (!character.name) {
                throw new Error('Each character must have a name');
            }

            if (typeof character.energy !== 'number' || character.energy < 0) {
                throw new Error(`Character ${character.id} must have valid energy value`);
            }

            if (typeof character.health !== 'number' || character.health < 0 || character.health > 100) {
                throw new Error(`Character ${character.id} must have valid health value (0-100)`);
            }
        }
    }

    /**
     * Configure the processor with custom settings
     * @param {Object} config - Configuration object
     */
    configure(config = {}) {
        if (config.significanceThreshold !== undefined) {
            this.significanceThreshold = Math.max(0, Math.min(1, config.significanceThreshold));
        }

        if (config.maxProcessingTimePerTurn !== undefined) {
            this.maxProcessingTimePerTurn = Math.max(1000, config.maxProcessingTimePerTurn);
        }

        if (config.enableAutoCheckpoint !== undefined) {
            this.enableAutoCheckpoint = Boolean(config.enableAutoCheckpoint);
        }

        if (config.checkpointInterval !== undefined) {
            this.checkpointInterval = Math.max(1, config.checkpointInterval);
        }

        if (config.npcTierConfig) {
            this.npcTierConfig = { ...this.npcTierConfig, ...config.npcTierConfig };
        }

        if (this.logger) {
            this.logger.info('EfficientTurnProcessor configured', config);
        }
    }

    /**
     * Get current performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        const totalCharacters = Math.max(this.performanceMetrics.charactersProcessed, 1);

        return {
            ...this.performanceMetrics,
            averageProcessingTime: this.performanceMetrics.totalProcessingTime / totalCharacters,
            efficiency: this.performanceMetrics.cachedStatesUsed / totalCharacters,
            consciousnessUpdateRate: this.performanceMetrics.consciousnessUpdates / totalCharacters,
            cacheHitRate: this.performanceMetrics.cachedStatesUsed / totalCharacters,
            tierBreakdown: this.performanceMetrics.tierMetrics
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
            turnCount: 0,
            tierMetrics: {
                leader: { processed: 0, consciousnessUpdates: 0, averageTime: 0 },
                specialist: { processed: 0, consciousnessUpdates: 0, averageTime: 0 },
                citizen: { processed: 0, consciousnessUpdates: 0, averageTime: 0 }
            }
        };

        if (this.logger) {
            this.logger.info('Performance metrics reset');
        }
    }

    /**
     * Update performance metrics after turn processing
     * @param {Object} results - Turn processing results
     * @param {number} processingTime - Time taken to process turn
     */
    _updatePerformanceMetrics(results, processingTime) {
        this.performanceMetrics.totalProcessingTime += processingTime;
        this.performanceMetrics.charactersProcessed += results.processedCharacters;
        this.performanceMetrics.consciousnessUpdates += results.consciousnessUpdates;
        this.performanceMetrics.memoryUpdates += results.memoryUpdates;
        this.performanceMetrics.cachedStatesUsed += results.cachedStatesUsed;
        this.performanceMetrics.turnCount++;

        // Update tier-specific metrics
        if (results.tierBreakdown) {
            Object.keys(results.tierBreakdown).forEach(tier => {
                if (this.performanceMetrics.tierMetrics[tier]) {
                    const tierData = results.tierBreakdown[tier];
                    this.performanceMetrics.tierMetrics[tier].processed += tierData.processed;
                    this.performanceMetrics.tierMetrics[tier].consciousnessUpdates += tierData.consciousnessUpdates;

                    // Update average time
                    const currentAvg = this.performanceMetrics.tierMetrics[tier].averageTime;
                    const currentCount = this.performanceMetrics.tierMetrics[tier].processed;
                    if (currentCount > 0) {
                        this.performanceMetrics.tierMetrics[tier].averageTime =
                            (currentAvg * (currentCount - tierData.processed) + tierData.averageTime * tierData.processed) / currentCount;
                    }
                }
            });
        }
    }

    /**
     * Perform automatic checkpoint of consciousness states
     * @param {Array} characters - Characters to checkpoint
     * @param {Object} worldState - Current world state
     */
    async _performAutoCheckpoint(characters, worldState) {
        try {
            if (!this.consciousnessCheckpointService) {
                if (this.logger) {
                    this.logger.warn('No consciousness checkpoint service available');
                }
                return;
            }

            const checkpointResult = await this.consciousnessCheckpointService.createCheckpoint(
                characters,
                worldState,
                {
                    reason: 'auto_checkpoint',
                    turnNumber: this.performanceMetrics.turnCount
                }
            );

            if (this.logger) {
                this.logger.info(`Auto-checkpoint created: ${checkpointResult.checkpointId}`);
            }

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Auto-checkpoint failed: ${error.message}`);
            }
        }
    }

    /**
     * Get available interactions for a character based on world state
     * @param {Object} character - Character to get interactions for
     * @param {Object} worldState - World state
     * @returns {Array} Available interactions
     */
    _getAvailableInteractions(character, worldState) {
        const interactions = [];

        // Get profession-specific interactions
        if (character.profession) {
            const professionInteractions = this._getProfessionInteractions(character.profession);
            interactions.push(...professionInteractions);
        }

        // Get settlement-specific interactions
        const settlement = this._getCharacterSettlement(character, worldState);
        if (settlement) {
            const settlementInteractions = this._getSettlementInteractions(character, settlement);
            interactions.push(...settlementInteractions);
        }

        // Add basic universal interactions
        interactions.push(
            {
                id: 'rest',
                name: 'Rest',
                type: 'rest',
                description: 'Take time to rest and recover energy',
                requirements: { energy: 5 },
                effects: { energy: 20, health: 5 }
            },
            {
                id: 'explore',
                name: 'Explore',
                type: 'exploration',
                description: 'Explore the surrounding area',
                requirements: { energy: 15 },
                effects: { knowledge: 3, energy: -10, experience: 2 }
            },
            {
                id: 'socialize',
                name: 'Socialize',
                type: 'social',
                description: 'Interact with other characters',
                requirements: { energy: 8 },
                effects: { social: 5, energy: -5, reputation: 1 }
            }
        );

        // Filter interactions based on character capabilities
        return interactions.filter(interaction => {
            // Check energy requirements
            if (interaction.requirements?.energy && character.energy < interaction.requirements.energy) {
                return false;
            }

            // Check wealth requirements
            if (interaction.requirements?.wealth && (character.wealth || 0) < interaction.requirements.wealth) {
                return false;
            }

            return true;
        });
    }

    /**
     * Get profession-specific interactions
     * @param {string} profession - Character profession
     * @returns {Array} Profession-specific interactions
     */
    _getProfessionInteractions(profession) {
        const professionInteractions = {
            merchant: [
                {
                    id: 'trade_goods',
                    name: 'Trade Goods',
                    type: 'trade',
                    description: 'Buy and sell goods for profit',
                    requirements: { wealth: 10, energy: 12 },
                    effects: { wealth: 15, energy: -8, experience: 3 }
                },
                {
                    id: 'negotiate_deal',
                    name: 'Negotiate Deal',
                    type: 'trade',
                    description: 'Negotiate a business deal',
                    requirements: { energy: 10 },
                    effects: { wealth: 20, energy: -6, reputation: 2 }
                }
            ],
            craftsman: [
                {
                    id: 'craft_item',
                    name: 'Craft Item',
                    type: 'craft',
                    description: 'Create a crafted item',
                    requirements: { energy: 15 },
                    effects: { wealth: 12, energy: -12, experience: 4 }
                },
                {
                    id: 'repair_equipment',
                    name: 'Repair Equipment',
                    type: 'craft',
                    description: 'Repair damaged equipment',
                    requirements: { energy: 10 },
                    effects: { wealth: 8, energy: -8, reputation: 1 }
                }
            ],
            farmer: [
                {
                    id: 'farm_work',
                    name: 'Farm Work',
                    type: 'work',
                    description: 'Work on the farm',
                    requirements: { energy: 12 },
                    effects: { wealth: 6, energy: -10, experience: 2 }
                },
                {
                    id: 'harvest_crop',
                    name: 'Harvest Crop',
                    type: 'work',
                    description: 'Harvest mature crops',
                    requirements: { energy: 8 },
                    effects: { wealth: 10, energy: -6, satisfaction: 3 }
                }
            ],
            warrior: [
                {
                    id: 'train_combat',
                    name: 'Train Combat',
                    type: 'combat',
                    description: 'Practice combat skills',
                    requirements: { energy: 15 },
                    effects: { strength: 1, energy: -12, experience: 3 }
                },
                {
                    id: 'patrol_area',
                    name: 'Patrol Area',
                    type: 'combat',
                    description: 'Patrol for threats',
                    requirements: { energy: 10 },
                    effects: { reputation: 2, energy: -8, experience: 2 }
                }
            ],
            healer: [
                {
                    id: 'treat_patient',
                    name: 'Treat Patient',
                    type: 'heal',
                    description: 'Treat an injured character',
                    requirements: { energy: 12 },
                    effects: { reputation: 3, energy: -8, experience: 3 }
                },
                {
                    id: 'gather_herbs',
                    name: 'Gather Herbs',
                    type: 'heal',
                    description: 'Collect medicinal herbs',
                    requirements: { energy: 10 },
                    effects: { knowledge: 2, energy: -6, experience: 2 }
                }
            ]
        };

        return professionInteractions[profession] || [];
    }

    /**
     * Get settlement-specific interactions
     * @param {Object} character - Character
     * @param {Object} settlement - Settlement object
     * @returns {Array} Settlement-specific interactions
     */
    _getSettlementInteractions(character, settlement) {
        const interactions = [];

        // Market interactions
        if (settlement.economy?.market) {
            interactions.push({
                id: 'market_shopping',
                name: 'Shop at Market',
                type: 'economic',
                description: 'Buy goods at the market',
                requirements: { wealth: 5 },
                effects: { wealth: -5, satisfaction: 3 }
            });
        }

        // Tavern interactions
        if (settlement.buildings?.tavern) {
            interactions.push({
                id: 'tavern_drink',
                name: 'Visit Tavern',
                type: 'social',
                description: 'Have a drink at the tavern',
                requirements: { wealth: 3, energy: 5 },
                effects: { social: 4, wealth: -3, energy: -3 }
            });
        }

        // Temple interactions
        if (settlement.buildings?.temple) {
            interactions.push({
                id: 'temple_prayer',
                name: 'Pray at Temple',
                type: 'spiritual',
                description: 'Pray at the temple',
                requirements: { energy: 5 },
                effects: { spiritual: 3, energy: -3 }
            });
        }

        // Guild interactions for specialists
        if (settlement.buildings?.guilds && character.profession) {
            interactions.push({
                id: 'guild_meeting',
                name: 'Guild Meeting',
                type: 'professional',
                description: 'Attend guild meeting',
                requirements: { energy: 8 },
                effects: { knowledge: 2, energy: -5, reputation: 1 }
            });
        }

        return interactions;
    }

    /**
     * Get specialist interactions for a character
     * @param {Object} character - Character to get interactions for
     * @param {Object} worldState - World state
     * @returns {Array} Specialist-specific interactions
     */
    _getSpecialistInteractions(character, worldState) {
        const interactions = [];

        // Get profession-specific interactions
        if (character.profession) {
            const professionInteractions = this._getProfessionInteractions(character.profession);
            interactions.push(...professionInteractions);
        }

        // Get settlement-specific interactions for specialists
        const settlement = this._getCharacterSettlement(character, worldState);
        if (settlement) {
            const settlementInteractions = this._getSettlementInteractions(character, settlement);
            interactions.push(...settlementInteractions);
        }

        // Add specialist-specific universal interactions
        interactions.push(
            {
                id: 'specialist_rest',
                name: 'Specialist Rest',
                type: 'rest',
                description: 'Take time to rest and recover energy',
                requirements: { energy: 5 },
                effects: { energy: 20, health: 5 }
            },
            {
                id: 'professional_networking',
                name: 'Professional Networking',
                type: 'social',
                description: 'Network with other professionals',
                requirements: { energy: 8 },
                effects: { social: 5, energy: -5, reputation: 2 }
            }
        );

        // Filter interactions based on character capabilities
        return interactions.filter(interaction => {
            // Check energy requirements
            if (interaction.requirements?.energy && character.energy < interaction.requirements.energy) {
                return false;
            }

            // Check wealth requirements
            if (interaction.requirements?.wealth && (character.wealth || 0) < interaction.requirements.wealth) {
                return false;
            }

            return true;
        });
    }

    /**
     * Get citizen interactions for a character
     * @param {Object} character - Character to get interactions for
     * @param {Object} worldState - World state
     * @returns {Array} Citizen-specific interactions
     */
    _getCitizenInteractions(character, worldState) {
        const interactions = [];

        // Get settlement-specific interactions for citizens
        const settlement = this._getCharacterSettlement(character, worldState);
        if (settlement) {
            const settlementInteractions = this._getSettlementInteractions(character, settlement);
            interactions.push(...settlementInteractions);
        }

        // Add citizen-specific universal interactions
        interactions.push(
            {
                id: 'citizen_rest',
                name: 'Citizen Rest',
                type: 'rest',
                description: 'Take time to rest and recover energy',
                requirements: { energy: 5 },
                effects: { energy: 20, health: 5 }
            },
            {
                id: 'daily_work',
                name: 'Daily Work',
                type: 'work',
                description: 'Perform daily work tasks',
                requirements: { energy: 10 },
                effects: { wealth: 5, energy: -8, experience: 1 }
            },
            {
                id: 'social_gathering',
                name: 'Social Gathering',
                type: 'social',
                description: 'Spend time with community members',
                requirements: { energy: 6 },
                effects: { social: 4, energy: -4, happiness: 2 }
            },
            {
                id: 'market_visit',
                name: 'Visit Market',
                type: 'economic',
                description: 'Visit the local market',
                requirements: { wealth: 2 },
                effects: { wealth: -2, satisfaction: 3 }
            }
        );

        // Filter interactions based on character capabilities
        return interactions.filter(interaction => {
            // Check energy requirements
            if (interaction.requirements?.energy && character.energy < interaction.requirements.energy) {
                return false;
            }

            // Check wealth requirements
            if (interaction.requirements?.wealth && (character.wealth || 0) < interaction.requirements.wealth) {
                return false;
            }

            return true;
        });
    }

    /**
     * Track political career progression for significant character actions
     * @param {Object} character - The character performing the action
     * @param {Object} event - The significant event
     * @param {Object} worldState - Current world state
     * @private
     */
    async _trackPoliticalCareerProgression(character, event, worldState) {
        try {
            // Check if this action has political significance
            const politicalSignificance = this._evaluatePoliticalSignificance(character, event, worldState);

            if (politicalSignificance.hasPoliticalImpact) {
                // Track the political event
                await this.politicalTrackingService.trackPoliticalEvent({
                    characterId: character.id,
                    event: event,
                    politicalImpact: politicalSignificance.impact,
                    worldState: worldState
                });

                // Check for leadership opportunities
                const leadershipOpportunity = await this.politicalTrackingService.checkLeadershipOpportunity(
                    character,
                    politicalSignificance.impact,
                    worldState
                );

                if (leadershipOpportunity.available) {
                    // Create leadership advancement event
                    const advancementEvent = {
                        type: 'leadership_advancement',
                        characterId: character.id,
                        advancement: leadershipOpportunity.advancement,
                        reason: leadershipOpportunity.reason,
                        timestamp: new Date().toISOString()
                    };

                    // Update character's political status
                    character.updatePoliticalStatus(leadershipOpportunity.advancement);

                    return { tracked: true, advancementEvent };
                }
            }

            return { tracked: true };
        } catch (error) {
            console.warn(`Failed to track political career progression for character ${character.id}:`, error);
            return { tracked: false, error: error.message };
        }
    }

    /**
     * Evaluate the political significance of a character action
     * @param {Object} character - The character
     * @param {Object} event - The event to evaluate
     * @param {Object} worldState - Current world state
     * @returns {Object} Political significance assessment
     * @private
     */
    _evaluatePoliticalSignificance(character, event, worldState) {
        const significance = {
            hasPoliticalImpact: false,
            impact: {
                influence: 0,
                reputation: 0,
                power: 0,
                legitimacy: 0
            }
        };

        // Evaluate based on event type and character context
        switch (event.type) {
            case 'diplomatic_action':
                significance.hasPoliticalImpact = true;
                significance.impact.influence += 2;
                significance.impact.reputation += event.success ? 1 : -1;
                break;

            case 'economic_decision':
                if (event.scale === 'large') {
                    significance.hasPoliticalImpact = true;
                    significance.impact.power += 1;
                    significance.impact.legitimacy += event.publicSupport ? 1 : -1;
                }
                break;

            case 'social_interaction':
                if (event.involvesLeadership) {
                    significance.hasPoliticalImpact = true;
                    significance.impact.influence += 1;
                    significance.impact.reputation += event.positiveOutcome ? 1 : -1;
                }
                break;

            case 'conflict_resolution':
                significance.hasPoliticalImpact = true;
                significance.impact.power += event.victory ? 2 : -1;
                significance.impact.reputation += event.diplomatic ? 1 : 0;
                break;

            case 'resource_distribution':
                if (event.favorsAllies) {
                    significance.hasPoliticalImpact = true;
                    significance.impact.legitimacy += 1;
                    significance.impact.influence += 1;
                }
                break;

            default:
                // No political impact for unrecognized event types
                break;
        }

        // Factor in character's current political position
        if (character.politicalStatus) {
            const positionMultiplier = this._getPoliticalPositionMultiplier(character.politicalStatus.position);
            significance.impact.influence *= positionMultiplier;
            significance.impact.power *= positionMultiplier;
        }

        return significance;
    }

    /**
     * Get multiplier for political impact based on current position
     * @param {string} position - Current political position
     * @returns {number} Impact multiplier
     * @private
     */
    _getPoliticalPositionMultiplier(position) {
        const multipliers = {
            'citizen': 0.5,
            'specialist': 0.8,
            'leader': 1.5,
            'council_member': 1.2,
            'governor': 1.8,
            'ruler': 2.0
        };

        return multipliers[position] || 1.0;
    }

    /**
     * Validate resource flows in the world state
     * @param {Object} worldState - Current world state
     * @param {Object} turnContext - Turn context
     * @returns {Object} Validation result
     * @private
     */
    async _validateResourceFlows(worldState, turnContext) {
        const result = {
            hasIssues: false,
            issues: [],
            errors: []
        };

        try {
            if (!this.resourceFlowService) {
                // If no resource flow service is available, skip validation
                return result;
            }

            // Calculate and validate resource flows for all settlements
            const settlements = worldState.settlements || [];
            const allFlows = [];

            // Calculate flows for each settlement
            for (const settlement of settlements) {
                try {
                    const context = {
                        availableNodes: worldState.nodes || [],
                        economicConditions: worldState.economicConditions || {},
                        timeMultiplier: turnContext?.timeMultiplier || 1.0
                    };

                    const flows = await this.resourceFlowService.calculateResourceFlows(settlement.id, context);
                    allFlows.push(...flows);
                } catch (error) {
                    // Log but continue with other settlements
                    if (this.logger) {
                        this.logger.warn(`Failed to calculate flows for settlement ${settlement.id}: ${error.message}`);
                    }
                }
            }

            // Validate each flow
            for (const flow of allFlows) {
                try {
                    const validationResult = await this.resourceFlowService.validateResourceFlow(flow);

                    if (!validationResult.isValid || validationResult.issues.length > 0) {
                        result.hasIssues = true;

                        // Process validation issues
                        validationResult.issues.forEach(issue => {
                            const severity = issue.type === 'error' ? 'critical' : issue.type === 'warning' ? 'warning' : 'info';

                            result.issues.push({
                                type: issue.type,
                                severity: severity,
                                description: issue.message,
                                field: issue.field,
                                affectedEntities: [flow.sourceNodeId, flow.targetNodeId],
                                suggestedActions: validationResult.recommendations?.map(r => r.action) || [],
                                impact: this._calculateFlowImpact(flow, issue),
                                flow: {
                                    id: flow.id,
                                    sourceNodeId: flow.sourceNodeId,
                                    targetNodeId: flow.targetNodeId,
                                    resourceType: flow.resourceType,
                                    amount: flow.effectiveAmount || flow.amount
                                }
                            });

                            // Add as error if critical
                            if (severity === 'critical') {
                                result.errors.push({
                                    type: 'resource_flow_error',
                                    message: issue.message,
                                    field: issue.field,
                                    affectedEntities: [flow.sourceNodeId, flow.targetNodeId],
                                    impact: this._calculateFlowImpact(flow, issue)
                                });
                            }
                        });
                    }
                } catch (error) {
                    // Log validation error but continue
                    if (this.logger) {
                        this.logger.warn(`Failed to validate flow ${flow.id}: ${error.message}`);
                    }
                }
            }

            // Log summary
            if (this.logger && result.hasIssues) {
                const criticalCount = result.issues.filter(i => i.severity === 'critical').length;
                const warningCount = result.issues.filter(i => i.severity === 'warning').length;

                this.logger.warn(`Resource flow validation: ${criticalCount} critical, ${warningCount} warnings, ${allFlows.length} flows checked`);
            }

            return result;

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Resource flow validation failed: ${error.message}`);
            }

            result.errors.push({
                type: 'validation_error',
                message: `Resource flow validation failed: ${error.message}`
            });

            return result;
        }
    }

    /**
     * Calculate the impact of a flow validation issue
     * @param {Object} flow - The resource flow
     * @param {Object} issue - The validation issue
     * @returns {string} Impact description
     * @private
     */
    _calculateFlowImpact(flow, issue) {
        const amount = flow.effectiveAmount || flow.amount;
        const resourceType = flow.resourceType;

        switch (issue.field) {
            case 'sourceNodeId':
                return `Cannot process ${amount} ${resourceType} flow due to missing source`;
            case 'targetNodeId':
                return `Cannot deliver ${amount} ${resourceType} due to missing target`;
            case 'amount':
                return `Insufficient ${resourceType} supply may cause shortages`;
            case 'capacity':
                return `Storage capacity exceeded may cause ${resourceType} waste`;
            case 'efficiency':
                return `Low efficiency reduces economic value of ${resourceType} transfers`;
            default:
                return `Flow issue affects ${amount} ${resourceType}`;
        }
    }

    /**
     * Get personality affinities for an interaction type
     * @param {Object} interaction - The interaction object
     * @returns {Object} Personality trait affinities
     * @private
     */
    _getPersonalityAffinitiesForInteraction(interaction) {
        const affinities = {};

        switch (interaction.type) {
            case 'combat':
                affinities.aggression = 0.8;
                affinities.bravery = 0.7;
                affinities.impulsiveness = 0.6;
                break;
            case 'trade':
                affinities.greed = 0.6;
                affinities.social = 0.7;
                affinities.intelligence = 0.5;
                break;
            case 'exploration':
                affinities.curiosity = 0.8;
                affinities.bravery = 0.6;
                affinities.independence = 0.7;
                break;
            case 'social':
                affinities.social = 0.8;
                affinities.empathy = 0.7;
                affinities.charisma = 0.6;
                break;
            case 'craft':
                affinities.patience = 0.7;
                affinities.creativity = 0.6;
                affinities.focus = 0.8;
                break;
            case 'rest':
                affinities.patience = 0.5;
                affinities.discipline = 0.6;
                break;
            case 'work':
                affinities.discipline = 0.7;
                affinities.responsibility = 0.8;
                break;
            default:
                // Neutral affinities for unknown types
                break;
        }

        return affinities;
    }

    /**
     * Get alignment leanings for an interaction type
     * @param {Object} interaction - The interaction object
     * @returns {Object} Alignment preferences
     * @private
     */
    _getAlignmentLeanForInteraction(interaction) {
        switch (interaction.type) {
            case 'combat':
                return { lawful: 0.3, chaotic: 0.7, good: 0.4, evil: 0.6 };
            case 'trade':
                return { lawful: 0.8, chaotic: 0.2, good: 0.6, evil: 0.4 };
            case 'exploration':
                return { lawful: 0.4, chaotic: 0.6, good: 0.5, evil: 0.5 };
            case 'social':
                return { lawful: 0.6, chaotic: 0.4, good: 0.8, evil: 0.2 };
            case 'craft':
                return { lawful: 0.7, chaotic: 0.3, good: 0.6, evil: 0.4 };
            case 'rest':
                return { lawful: 0.5, chaotic: 0.5, good: 0.5, evil: 0.5 };
            case 'work':
                return { lawful: 0.8, chaotic: 0.2, good: 0.7, evil: 0.3 };
            default:
                return { lawful: 0.5, chaotic: 0.5, good: 0.5, evil: 0.5 };
        }
    }

    /**
     * Get attribute preferences for an interaction type
     * @param {Object} interaction - The interaction object
     * @returns {Object} Attribute preferences
     * @private
     */
    _getAttributePreferenceForInteraction(interaction) {
        switch (interaction.type) {
            case 'combat':
                return { strength: 0.8, dexterity: 0.7, constitution: 0.6 };
            case 'trade':
                return { charisma: 0.8, intelligence: 0.6, wisdom: 0.5 };
            case 'exploration':
                return { dexterity: 0.7, wisdom: 0.6, constitution: 0.5 };
            case 'social':
                return { charisma: 0.9, wisdom: 0.6, intelligence: 0.5 };
            case 'craft':
                return { dexterity: 0.7, intelligence: 0.6, wisdom: 0.5 };
            case 'rest':
                return { constitution: 0.6, wisdom: 0.4 };
            case 'work':
                return { constitution: 0.6, strength: 0.5, wisdom: 0.4 };
            default:
                return {};
        }
    }

    /**
     * Calculate effort level for an interaction
     * @param {Object} interaction - The interaction object
     * @returns {number} Effort level (0-1, higher = more effort required)
     * @private
     */
    _calculateEffortLevel(interaction) {
        // Base effort on energy requirements and type
        let effort = 0.5; // Default moderate effort

        if (interaction.requirements?.energy) {
            // Higher energy requirements = higher effort
            effort = Math.min(interaction.requirements.energy / 20, 1.0);
        }

        // Adjust based on interaction type
        switch (interaction.type) {
            case 'combat':
                effort = Math.max(effort, 0.8); // Combat is always high effort
                break;
            case 'exploration':
                effort = Math.max(effort, 0.7); // Exploration requires effort
                break;
            case 'craft':
                effort = Math.max(effort, 0.6); // Crafting requires focus
                break;
            case 'rest':
                effort = Math.min(effort, 0.2); // Rest is low effort
                break;
            case 'social':
                effort = Math.max(effort, 0.4); // Social requires some effort
                break;
            default:
                // Keep default effort level
                break;
        }

        return effort;
    }

    /**
     * Get expected outcomes for an interaction
     * @param {Object} interaction - The interaction object
     * @returns {Array} Expected outcomes
     * @private
     */
    _getExpectedOutcomes(interaction) {
        const outcomes = [];

        // Add effects as expected outcomes
        if (interaction.effects) {
            Object.entries(interaction.effects).forEach(([effectType, value]) => {
                if (typeof value === 'number') {
                    outcomes.push({
                        type: effectType,
                        value: value,
                        probability: 0.8 // Assume 80% chance for stated effects
                    });
                }
            });
        }

        // Add type-specific outcomes
        switch (interaction.type) {
            case 'combat':
                outcomes.push({ type: 'experience', value: 3, probability: 0.6 });
                outcomes.push({ type: 'risk', value: -2, probability: 0.4 });
                break;
            case 'trade':
                outcomes.push({ type: 'wealth', value: 5, probability: 0.7 });
                outcomes.push({ type: 'reputation', value: 1, probability: 0.8 });
                break;
            case 'exploration':
                outcomes.push({ type: 'knowledge', value: 2, probability: 0.9 });
                outcomes.push({ type: 'discovery', value: 1, probability: 0.3 });
                break;
            case 'social':
                outcomes.push({ type: 'relationships', value: 1, probability: 0.8 });
                outcomes.push({ type: 'mood', value: 2, probability: 0.7 });
                break;
            case 'craft':
                outcomes.push({ type: 'wealth', value: 3, probability: 0.8 });
                outcomes.push({ type: 'skill', value: 1, probability: 0.6 });
                break;
            default:
                // No specific outcomes for unknown interaction types
                break;
        }

        return outcomes;
    }

    /**
     * Check if an interaction is valid for a character
     * @param {Object} interaction - The interaction object
     * @param {Object} character - The character
     * @param {Object} worldState - The world state
     * @returns {boolean} Whether the interaction is valid
     * @private
     */
    _isInteractionValidForCharacter(interaction, character, worldState) {
        // Check energy requirements
        if (interaction.requirements?.energy && character.energy < interaction.requirements.energy) {
            return false;
        }

        // Check wealth requirements
        if (interaction.requirements?.wealth && (character.wealth || 0) < interaction.requirements.wealth) {
            return false;
        }

        // Check health requirements (implicit)
        if (interaction.type === 'combat' && character.health < 20) {
            return false; // Too injured for combat
        }

        // Check location-specific requirements
        if (interaction.type === 'trade' && !this._isTradeLocation(character.currentNodeId, worldState)) {
            return false;
        }

        return true;
    }

    /**
     * Check if a location is suitable for trading
     * @param {string} nodeId - Node ID to check
     * @param {Object} worldState - World state
     * @returns {boolean} Whether trading is possible here
     * @private
     */
    _isTradeLocation(nodeId, worldState) {
        const node = worldState.nodes?.find(n => n.id === nodeId);
        if (!node) return false;

        // Trading is possible in settlements or market nodes
        return node.type === 'settlement' ||
               node.environment?.hasMarket ||
               node.name?.toLowerCase().includes('market');
    }

    /**
     * Get specialist personality affinities for interactions
     * @param {Object} interaction - Interaction object
     * @param {string} profession - Character profession
     * @returns {Object} Personality affinity mappings
     */
    _getSpecialistPersonalityAffinities(interaction, profession) {
        const baseAffinities = this._getPersonalityAffinitiesForInteraction(interaction);

        // Add profession-specific affinities
        const professionAffinities = {
            // Scholars prefer intellectual interactions
            scholar: {
                curiosity: interaction.type === 'research' ? 1.5 : 1.0,
                empathy: interaction.type === 'teaching' ? 1.3 : 1.0,
                aggression: interaction.type === 'debate' ? 1.2 : 0.8
            },
            // Merchants prefer economic interactions
            merchant: {
                social: interaction.type === 'trade' ? 1.5 : 1.0,
                curiosity: interaction.type === 'negotiation' ? 1.3 : 1.0,
                aggression: interaction.type === 'bargaining' ? 1.2 : 0.9
            },
            // Guards prefer security interactions
            guard: {
                aggression: interaction.type === 'patrol' ? 1.4 : 1.0,
                social: interaction.type === 'community' ? 1.2 : 1.0,
                empathy: interaction.type === 'protection' ? 1.3 : 1.0
            },
            // Healers prefer medical interactions
            healer: {
                empathy: interaction.type === 'treatment' ? 1.5 : 1.0,
                curiosity: interaction.type === 'diagnosis' ? 1.4 : 1.0,
                social: interaction.type === 'counseling' ? 1.3 : 1.0
            }
        };

        const profAffinities = professionAffinities[profession] || {};
        return { ...baseAffinities, ...profAffinities };
    }

    /**
     * Get specialist attribute preferences for interactions
     * @param {Object} interaction - Interaction object
     * @param {string} profession - Character profession
     * @returns {Object} Attribute preference mappings
     */
    _getSpecialistAttributePreferences(interaction, profession) {
        const basePreferences = this._getAttributePreferenceForInteraction(interaction);

        // Add profession-specific attribute preferences
        const professionPreferences = {
            scholar: {
                intelligence: interaction.type === 'research' ? 1.5 : 1.0,
                wisdom: interaction.type === 'teaching' ? 1.3 : 1.0,
                charisma: interaction.type === 'debate' ? 1.2 : 1.0
            },
            merchant: {
                charisma: interaction.type === 'trade' ? 1.4 : 1.0,
                intelligence: interaction.type === 'negotiation' ? 1.3 : 1.0,
                wisdom: interaction.type === 'assessment' ? 1.2 : 1.0
            },
            guard: {
                strength: interaction.type === 'patrol' ? 1.3 : 1.0,
                constitution: interaction.type === 'defense' ? 1.4 : 1.0,
                wisdom: interaction.type === 'assessment' ? 1.2 : 1.0
            },
            healer: {
                wisdom: interaction.type === 'diagnosis' ? 1.5 : 1.0,
                dexterity: interaction.type === 'treatment' ? 1.3 : 1.0,
                charisma: interaction.type === 'counseling' ? 1.2 : 1.0
            }
        };

        const profPreferences = professionPreferences[profession] || {};
        return { ...basePreferences, ...profPreferences };
    }

    /**
     * Get specialist expected outcomes for interactions
     * @param {Object} interaction - Interaction object
     * @param {string} profession - Character profession
     * @returns {Array} Expected outcomes
     */
    _getSpecialistOutcomes(interaction, profession) {
        const baseOutcomes = this._getExpectedOutcomes(interaction);

        // Add profession-specific outcomes
        const professionOutcomes = {
            scholar: ['knowledge_gain', 'reputation_boost', 'intellectual_satisfaction'],
            merchant: ['wealth_gain', 'network_expansion', 'economic_satisfaction'],
            guard: ['security_improvement', 'community_trust', 'professional_satisfaction'],
            healer: ['health_improvement', 'gratitude', 'moral_satisfaction']
        };

        const profOutcomes = professionOutcomes[profession] || [];
        return [...baseOutcomes, ...profOutcomes];
    }

    /**
     * Validate if interaction is appropriate for specialist
     * @param {Object} interaction - Interaction object
     * @param {Object} character - Character object
     * @param {Object} worldState - World state
     * @returns {boolean} Whether interaction is valid
     */
    _isSpecialistInteractionValid(interaction, character, worldState) {
        // Basic validation first
        if (!this._isInteractionValidForCharacter(interaction, character, worldState)) {
            return false;
        }

        // Specialist-specific validation
        const profession = character.profession || 'general';

        // Check if interaction type matches profession expertise
        const professionInteractions = {
            scholar: ['research', 'teaching', 'debate', 'study'],
            merchant: ['trade', 'negotiation', 'bargaining', 'assessment'],
            guard: ['patrol', 'defense', 'security', 'assessment'],
            healer: ['treatment', 'diagnosis', 'counseling', 'care']
        };

        const validTypes = professionInteractions[profession] || [];
        if (!validTypes.includes(interaction.type)) {
            return false;
        }

        // Check profession-specific requirements
        switch (profession) {
            case 'merchant':
                return this._isTradeLocation(character.currentNodeId || interaction.location, worldState);
            case 'guard':
                return interaction.type === 'patrol' || interaction.type === 'defense';
            case 'healer':
                return interaction.type === 'treatment' || interaction.type === 'diagnosis';
            case 'scholar':
                return interaction.type === 'research' || interaction.type === 'teaching';
            default:
                return true;
        }
    }

    /**
     * Get citizen personality affinities for interactions
     * @param {Object} interaction - Interaction object
     * @returns {Object} Personality affinity mappings
     */
    _getCitizenPersonalityAffinities(interaction) {
        const baseAffinities = this._getPersonalityAffinitiesForInteraction(interaction);

        // Citizens have more balanced, practical personality responses
        const citizenAffinities = {
            // Work activities appeal to responsible citizens
            work: {
                responsibility: 1.2,
                discipline: 1.1,
                patience: 1.0
            },
            // Economic activities appeal to practical citizens
            economic: {
                greed: 0.9,
                social: 1.1,
                responsibility: 1.0
            },
            // Social activities appeal to social citizens
            social: {
                social: 1.3,
                empathy: 1.2,
                charisma: 1.1
            },
            // Rest activities appeal to balanced citizens
            rest: {
                patience: 1.1,
                discipline: 0.9,
                responsibility: 0.8
            }
        };

        const citizenAffinitiesForType = citizenAffinities[interaction.type] || {};
        return { ...baseAffinities, ...citizenAffinitiesForType };
    }

    /**
     * Get citizen attribute preferences for interactions
     * @param {Object} interaction - Interaction object
     * @returns {Object} Attribute preference mappings
     */
    _getCitizenAttributePreferences(interaction) {
        const basePreferences = this._getAttributePreferenceForInteraction(interaction);

        // Citizens value practical, everyday attributes
        const citizenPreferences = {
            work: {
                constitution: 1.2, // Endurance for daily work
                wisdom: 1.1, // Practical judgment
                strength: 1.0 // Physical capability
            },
            economic: {
                charisma: 1.2, // Dealing with people
                intelligence: 1.1, // Basic math/trading
                wisdom: 1.0 // Value assessment
            },
            social: {
                charisma: 1.3, // Social skills
                empathy: 1.2, // Understanding others
                wisdom: 1.0 // Social judgment
            },
            rest: {
                constitution: 1.1, // Recovery ability
                wisdom: 1.0, // Self-care judgment
                patience: 0.9 // Ability to relax
            }
        };

        const citizenPreferencesForType = citizenPreferences[interaction.type] || {};
        return { ...basePreferences, ...citizenPreferencesForType };
    }

    /**
     * Get citizen expected outcomes for interactions
     * @param {Object} interaction - Interaction object
     * @returns {Array} Expected outcomes
     */
    _getCitizenOutcomes(interaction) {
        const baseOutcomes = this._getExpectedOutcomes(interaction);

        // Citizens focus on practical, daily life outcomes
        const citizenOutcomes = {
            work: ['income', 'daily_satisfaction', 'community_contribution'],
            economic: ['financial_security', 'basic_needs_met', 'economic_stability'],
            social: ['social_connections', 'emotional_support', 'community_belonging'],
            rest: ['energy_recovery', 'stress_relief', 'daily_balance']
        };

        const citizenOutcomesForType = citizenOutcomes[interaction.type] || [];
        return [...baseOutcomes, ...citizenOutcomesForType];
    }

    /**
     * Validate if interaction is appropriate for citizen
     * @param {Object} interaction - Interaction object
     * @param {Object} character - Character object
     * @param {Object} worldState - World state
     * @returns {boolean} Whether interaction is valid
     */
    _isCitizenInteractionValid(interaction, character, worldState) {
        // Basic validation first
        if (!this._isInteractionValidForCharacter(interaction, character, worldState)) {
            return false;
        }

        // Citizen-specific validation - more permissive than specialists
        const basicNeeds = this._assessBasicNeeds(character);

        // Critical needs override other restrictions
        if (basicNeeds.critical.length > 0) {
            const addressesCriticalNeed = basicNeeds.critical.some(need =>
                this._interactionAddressesNeed(interaction, need)
            );
            if (addressesCriticalNeed) {
                return true;
            }
        }

        // Check time-of-day appropriateness for citizens
        const currentHour = new Date().getHours();
        const isWorkHours = currentHour >= 6 && currentHour <= 18;

        if (interaction.type === 'work' && !isWorkHours) {
            return false; // Work only during work hours
        }

        if (interaction.type === 'rest' && isWorkHours && basicNeeds.critical.length === 0) {
            return false; // Rest less likely during work hours unless critical needs
        }

        return true;
    }

    /**
     * Check if an interaction addresses a specific need
     * @param {Object} interaction - Interaction object
     * @param {string} need - Need type
     * @returns {boolean} Whether interaction addresses the need
     */
    _interactionAddressesNeed(interaction, need) {
        const needMappings = {
            hunger: ['economic', 'work', 'rest'],
            fatigue: ['rest'],
            injury: ['rest', 'social'],
            poverty: ['work', 'economic'],
            loneliness: ['social']
        };

        return needMappings[need]?.includes(interaction.type) || false;
    }

    /**
     * Assess basic needs for a character
     * @param {Object} character - Character to assess
     * @returns {Object} Basic needs assessment
     */
    _assessBasicNeeds(character) {
        const needs = {
            critical: [],
            moderate: [],
            satisfied: []
        };

        // Check energy/fatigue
        if (character.energy < 20) {
            needs.critical.push('fatigue');
        } else if (character.energy < 50) {
            needs.moderate.push('fatigue');
        } else {
            needs.satisfied.push('fatigue');
        }

        // Check health/injury
        if (character.health < 30) {
            needs.critical.push('injury');
        } else if (character.health < 70) {
            needs.moderate.push('injury');
        } else {
            needs.satisfied.push('injury');
        }

        // Check wealth/poverty (if available)
        if (character.wealth !== undefined) {
            if (character.wealth < 5) {
                needs.critical.push('poverty');
            } else if (character.wealth < 20) {
                needs.moderate.push('poverty');
            } else {
                needs.satisfied.push('poverty');
            }
        }

        // Check social needs (if available)
        if (character.social !== undefined) {
            if (character.social < 20) {
                needs.critical.push('loneliness');
            } else if (character.social < 50) {
                needs.moderate.push('loneliness');
            } else {
                needs.satisfied.push('loneliness');
            }
        }

        return needs;
    }
}

export default EfficientTurnProcessor;