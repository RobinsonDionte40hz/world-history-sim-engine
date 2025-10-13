/**
 * BranchWeightingService
 *
 * Service for calculating personality-weighted branch selection in content interactions.
 * Integrates all character factors (personality, alignment, attributes, consciousness, memory, prestige, emotional)
 * to provide authentic, consistent NPC behavior through weighted random selection.
 */

import BaseDomainService from '../services/BaseDomainService.js';
import BranchWeight from '../valueObjects/BranchWeight.js';
import BehavioralStateService from '../services/BehavioralStateService.js';
import SignificantMemoryService from '../services/SignificantMemoryService.js';

class BranchWeightingService extends BaseDomainService {
    constructor(behavioralStateService = null, memoryService = null, logger = null, errorHandler = null) {
        super();

        // Dependencies - only instantiate if explicitly not null/undefined
        this.behavioralStateService = behavioralStateService !== null ? (behavioralStateService || new BehavioralStateService(memoryService)) : null;
        this.memoryService = memoryService !== null ? (memoryService || new SignificantMemoryService()) : null;
        this.logger = logger;
        this.errorHandler = errorHandler;

        // Configuration
        this.WEIGHT_BOUNDS = { min: 0.1, max: 3.0 };
        this.DEFAULT_SELECTION_METHOD = 'weighted_random';

        // Selection methods
        this.selectionMethods = {
            weighted_random: this.selectWeightedRandom.bind(this),
            highest_weight: this.selectHighestWeight.bind(this),
            personality_driven: this.selectPersonalityDriven.bind(this),
            balanced: this.selectBalanced.bind(this)
        };
    }

    /**
     * Calculate branch weights for multiple branches
     * @param {Object} character - Character making the choice
     * @param {Array<Object>} branches - Array of branch objects with metadata
     * @param {Object} context - Additional context for weight calculation
     * @returns {Array<BranchWeight>} Array of BranchWeight objects
     */
    calculateBranchWeights(character, branches, context = {}) {
        // Validate inputs that should cause errors
        if (!Array.isArray(branches) || branches.length === 0) {
            throw new Error('Branches array is required and cannot be empty');
        }

        try {
            const branchWeights = [];

            for (const branch of branches) {
                // Get behavioral modifiers from BehavioralStateService
                const behavioralModifiers = this.getBehavioralModifiers(character, branch, context);

                const branchWeight = BranchWeight.create(character, branch.metadata || {}, {
                    ...context,
                    memoryPatterns: this.getMemoryPatternsForBranch(character, branch, context),
                    behavioralModifiers
                });

                branchWeights.push({
                    branch,
                    weight: branchWeight,
                    finalWeight: branchWeight.finalWeight
                });
            }

            return branchWeights;

        } catch (error) {
            // For character-related errors, return fallback weights
            if (error.message.includes('Character') || error.message.includes('BranchWeight')) {
                return branches.map(branch => ({
                    branch,
                    weight: this.createFallbackBranchWeight(character, context),
                    finalWeight: 1.0
                }));
            }

            // Re-throw other errors
            throw error;
        }
    }

    /**
     * Select a branch using weighted random selection
     * @param {Object} character - Character making the choice
     * @param {Array<Object>} branches - Array of branch objects
     * @param {Object} context - Additional context
     * @param {string} method - Selection method to use
     * @returns {Object} Selected branch with weight information
     */
    selectWeightedBranch(character, branches, context = {}, method = this.DEFAULT_SELECTION_METHOD) {
        try {
            const branchWeights = this.calculateBranchWeights(character, branches, context);

            if (branchWeights.length === 0) {
                throw new Error('No branch weights calculated');
            }

            const selectionMethod = this.selectionMethods[method] || this.selectionMethods[this.DEFAULT_SELECTION_METHOD];
            const selectedResult = selectionMethod(branchWeights, context);

            // Record the choice for consistency tracking
            this.recordChoice(character, selectedResult.branch, selectedResult.weight, {
                ...context,
                weightBreakdown: selectedResult.weightBreakdown
            });

            return selectedResult;

        } catch (error) {
            this.handleSelectionError(error, {
                character: character?.id,
                branchCount: branches?.length,
                method,
                context
            });

            // Fallback to random selection
            const randomIndex = Math.floor(Math.random() * branches.length);
            return {
                branch: branches[randomIndex],
                weight: 1.0,
                selectionMethod: 'fallback_random',
                reason: 'Error in weighted selection, using random fallback',
                weightBreakdown: {
                    finalWeight: 1.0,
                    componentWeights: {
                        personality: 1.0,
                        alignment: 1.0,
                        attributes: 1.0,
                        consciousness: 1.0,
                        memory: 1.0,
                        prestige: 1.0,
                        emotional: 1.0,
                        consistency: 1.0
                    },
                    behavioralModifiers: {
                        overallModifier: 1.0,
                        personalityModifier: 1.0,
                        consciousnessModifier: 1.0,
                        memoryModifier: 1.0
                    },
                    detailedBreakdown: {}
                }
            };
        }
    }

    /**
     * Weighted random selection algorithm
     * @param {Array<Object>} branchWeights - Array of branch weight objects
     * @param {Object} context - Selection context
     * @returns {Object} Selected branch result
     */
    selectWeightedRandom(branchWeights, context = {}) {
        // Calculate total weight
        const totalWeight = branchWeights.reduce((sum, bw) => sum + bw.finalWeight, 0);

        if (totalWeight === 0) {
            // All weights are 0, select randomly
            const randomIndex = Math.floor(Math.random() * branchWeights.length);
            return {
                branch: branchWeights[randomIndex].branch,
                weight: branchWeights[randomIndex].finalWeight,
                selectionMethod: 'weighted_random_zero_total',
                reason: 'All weights were zero, selected randomly'
            };
        }

        // Generate random value between 0 and totalWeight
        let randomValue = Math.random() * totalWeight;

        // Find the branch that corresponds to this random value
        for (const branchWeight of branchWeights) {
            randomValue -= branchWeight.finalWeight;
            if (randomValue <= 0) {
                return {
                    branch: branchWeight.branch,
                    weight: branchWeight.finalWeight,
                    selectionMethod: 'weighted_random',
                    reason: `Selected based on ${branchWeight.finalWeight.toFixed(2)}x weight`,
                    weightBreakdown: branchWeight.weight.getWeightBreakdown()
                };
            }
        }

        // Fallback (should not reach here normally)
        return {
            branch: branchWeights[0].branch,
            weight: branchWeights[0].finalWeight,
            selectionMethod: 'weighted_random_fallback',
            reason: 'Fallback selection'
        };
    }

    /**
     * Select branch with highest weight
     * @param {Array<Object>} branchWeights - Array of branch weight objects
     * @param {Object} context - Selection context
     * @returns {Object} Selected branch result
     */
    selectHighestWeight(branchWeights, context = {}) {
        let highestWeight = -Infinity;
        let selectedBranchWeight = null;

        for (const branchWeight of branchWeights) {
            if (branchWeight.finalWeight > highestWeight) {
                highestWeight = branchWeight.finalWeight;
                selectedBranchWeight = branchWeight;
            }
        }

        return {
            branch: selectedBranchWeight.branch,
            weight: selectedBranchWeight.finalWeight,
            selectionMethod: 'highest_weight',
            reason: `Selected highest weight: ${selectedBranchWeight.finalWeight.toFixed(2)}x`,
            weightBreakdown: selectedBranchWeight.weight.getWeightBreakdown()
        };
    }

    /**
     * Personality-driven selection (prioritizes personality matches)
     * @param {Array<Object>} branchWeights - Array of branch weight objects
     * @param {Object} context - Selection context
     * @returns {Object} Selected branch result
     */
    selectPersonalityDriven(branchWeights, context = {}) {
        // Boost personality weight influence
        const adjustedWeights = branchWeights.map(bw => ({
            ...bw,
            adjustedWeight: bw.finalWeight * (1 + bw.weight.weights.personality - 1) * 1.5
        }));

        // Use weighted random on adjusted weights
        const totalAdjustedWeight = adjustedWeights.reduce((sum, bw) => sum + bw.adjustedWeight, 0);
        let randomValue = Math.random() * totalAdjustedWeight;

        for (const branchWeight of adjustedWeights) {
            randomValue -= branchWeight.adjustedWeight;
            if (randomValue <= 0) {
                return {
                    branch: branchWeight.branch,
                    weight: branchWeight.finalWeight,
                    selectionMethod: 'personality_driven',
                    reason: `Personality-driven selection with ${branchWeight.weight.weights.personality.toFixed(2)}x personality weight`,
                    weightBreakdown: branchWeight.weight.getWeightBreakdown()
                };
            }
        }

        // Fallback
        return this.selectWeightedRandom(branchWeights, context);
    }

    /**
     * Balanced selection (avoids extremes, prefers moderate weights)
     * @param {Array<Object>} branchWeights - Array of branch weight objects
     * @param {Object} context - Selection context
     * @returns {Object} Selected branch result
     */
    selectBalanced(branchWeights, context = {}) {
        // Calculate balance score (prefer weights closer to 1.0)
        const balancedWeights = branchWeights.map(bw => ({
            ...bw,
            balanceScore: 1 - Math.abs(bw.finalWeight - 1.0), // Higher score for weights closer to 1.0
            adjustedWeight: bw.finalWeight * (1 + (1 - Math.abs(bw.finalWeight - 1.0)))
        }));

        const totalAdjustedWeight = balancedWeights.reduce((sum, bw) => sum + bw.adjustedWeight, 0);
        let randomValue = Math.random() * totalAdjustedWeight;

        for (const branchWeight of balancedWeights) {
            randomValue -= branchWeight.adjustedWeight;
            if (randomValue <= 0) {
                return {
                    branch: branchWeight.branch,
                    weight: branchWeight.finalWeight,
                    selectionMethod: 'balanced',
                    reason: `Balanced selection favoring moderate weights`,
                    weightBreakdown: branchWeight.weight.getWeightBreakdown()
                };
            }
        }

        // Fallback
        return this.selectWeightedRandom(branchWeights, context);
    }

    /**
     * Get behavioral modifiers for a character and branch using BehavioralStateService
     * @param {Object} character - Character making the choice
     * @param {Object} branch - Branch being evaluated
     * @param {Object} context - Context information
     * @returns {Object} Behavioral modifiers from BehavioralStateService
     */
    getBehavioralModifiers(character, branch, context = {}) {
        if (!this.behavioralStateService) {
            return {
                overallModifier: 1.0,
                personalityModifier: 1.0,
                consciousnessModifier: 1.0,
                memoryModifier: 1.0
            };
        }

        try {
            const interactionType = branch.type || context.interactionType || 'content';

            // Get comprehensive behavioral modifier
            const overallModifier = this.behavioralStateService.getBehavioralModifier(
                character,
                interactionType,
                context
            );

            // Get individual component modifiers for detailed weighting
            const personalityModifier = this.behavioralStateService.getPersonalityModifier(
                character,
                interactionType
            );

            const consciousnessModifier = this.behavioralStateService.getConsciousnessModifier(
                character,
                interactionType
            );

            const memoryModifier = this.behavioralStateService.getMemoryModifier(
                character,
                interactionType,
                context
            );

            return {
                overallModifier,
                personalityModifier,
                consciousnessModifier,
                memoryModifier
            };

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error getting behavioral modifiers: ${error.message}`);
            }

            // Return neutral modifiers on error
            return {
                overallModifier: 1.0,
                personalityModifier: 1.0,
                consciousnessModifier: 1.0,
                memoryModifier: 1.0
            };
        }
    }
    getMemoryPatternsForBranch(character, branch, context = {}) {
        if (!character || !character.significantMemories || !this.memoryService) {
            return [];
        }

        try {
            // Use memory service to find relevant patterns
            const relevantMemories = this.memoryService.getRelevantMemories(
                character,
                branch.type || 'content',
                5,
                context
            );

            // Convert to pattern format
            return relevantMemories.map(memory => ({
                type: memory.interactionType,
                strength: this.calculateMemoryPatternStrength(memory, branch),
                recency: this.calculateMemoryRecency(memory),
                outcome: memory.outcome
            }));

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error getting memory patterns: ${error.message}`);
            }
            return [];
        }
    }

    /**
     * Calculate memory pattern strength for a branch
     * @param {Object} memory - Memory object
     * @param {Object} branch - Branch being evaluated
     * @returns {number} Pattern strength (0-1)
     */
    calculateMemoryPatternStrength(memory, branch) {
        let strength = 0.5; // Base strength

        // Outcome influence
        switch (memory.outcome) {
            case 'critical_success':
                strength += 0.3;
                break;
            case 'success':
                strength += 0.15;
                break;
            case 'partial_success':
                strength += 0.05;
                break;
            case 'failure':
                strength -= 0.15;
                break;
            case 'critical_failure':
                strength -= 0.3;
                break;
            default:
                // Neutral outcome
                break;
        }

        // Significance influence
        strength += (memory.significance || 0.5) * 0.2;

        // Branch similarity (if branch has tags or type matching memory)
        if (branch.tags && memory.contextTags) {
            const matchingTags = branch.tags.filter(tag => memory.contextTags.includes(tag));
            strength += (matchingTags.length / Math.max(branch.tags.length, 1)) * 0.2;
        }

        return Math.max(0, Math.min(1, strength));
    }

    /**
     * Calculate memory recency factor
     * @param {Object} memory - Memory object
     * @returns {number} Recency factor (0-1, higher = more recent)
     */
    calculateMemoryRecency(memory) {
        const now = Date.now();
        const age = now - memory.timestamp;
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        if (age < oneDay) return 1.0;
        if (age < oneWeek) return 0.8;
        if (age < oneMonth) return 0.6;
        return 0.3;
    }

    /**
     * Record a choice for consistency tracking
     * @param {Object} character - Character who made the choice
     * @param {Object} branch - Selected branch
     * @param {number} weight - Weight of the selection
     * @param {Object} context - Context of the choice
     */
    recordChoice(character, branch, weight, context = {}) {
        try {
            if (!character) {
                return; // Can't record choice for null character
            }

            if (!character.choiceHistory) {
                character.choiceHistory = [];
            }

            const choiceRecord = {
                timestamp: Date.now(),
                branchId: branch.id,
                branchType: branch.type,
                category: branch.category || 'content',
                weight: weight,
                context: {
                    interactionType: context.interactionType,
                    location: context.location,
                    participants: context.participants
                },
                weightBreakdown: context.weightBreakdown || null
            };

            // Keep only recent choices (last 20)
            character.choiceHistory.push(choiceRecord);
            if (character.choiceHistory.length > 20) {
                character.choiceHistory = character.choiceHistory.slice(-20);
            }

        } catch (error) {
            if (this.logger) {
                this.logger.warn(`Error recording choice: ${error.message}`);
            }
        }
    }

    /**
     * Get available selection methods
     * @returns {Array<string>} Array of selection method names
     */
    getAvailableSelectionMethods() {
        return Object.keys(this.selectionMethods);
    }

    /**
     * Analyze branch weights for debugging
     * @param {Array<Object>} branchWeights - Array of branch weight objects
     * @returns {Object} Analysis of weight distribution
     */
    analyzeBranchWeights(branchWeights) {
        if (!Array.isArray(branchWeights) || branchWeights.length === 0) {
            return { error: 'No branch weights to analyze' };
        }

        const weights = branchWeights.map(bw => bw.finalWeight);
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        const averageWeight = totalWeight / weights.length;
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);

        // Calculate distribution
        const distribution = {
            veryLow: weights.filter(w => w < 0.5).length,
            low: weights.filter(w => w >= 0.5 && w < 0.8).length,
            neutral: weights.filter(w => w >= 0.8 && w <= 1.2).length,
            high: weights.filter(w => w > 1.2 && w <= 2.0).length,
            veryHigh: weights.filter(w => w > 2.0).length
        };

        return {
            count: branchWeights.length,
            totalWeight,
            averageWeight,
            minWeight,
            maxWeight,
            distribution,
            weights: weights.map((w, i) => ({
                index: i,
                weight: w,
                branchId: branchWeights[i].branch.id
            }))
        };
    }

    /**
     * Create a fallback BranchWeight for error cases
     * @param {Object} character - Character (may be null)
     * @param {Object} context - Context
     * @returns {BranchWeight} Fallback BranchWeight with neutral weights
     */
    createFallbackBranchWeight(character, context = {}) {
        try {
            // Try to create with minimal valid data
            return new BranchWeight({ id: 'fallback' }, {}, context);
        } catch (error) {
            // If even fallback creation fails, create a minimal object
            return {
                finalWeight: 1.0,
                weights: {
                    personality: 1.0,
                    alignment: 1.0,
                    attributes: 1.0,
                    consciousness: 1.0,
                    memory: 1.0,
                    prestige: 1.0,
                    emotional: 1.0,
                    consistency: 1.0
                },
                getWeightBreakdown: () => ({
                    finalWeight: 1.0,
                    componentWeights: {
                        personality: 1.0,
                        alignment: 1.0,
                        attributes: 1.0,
                        consciousness: 1.0,
                        memory: 1.0,
                        prestige: 1.0,
                        emotional: 1.0,
                        consistency: 1.0
                    },
                    detailedBreakdown: {}
                })
            };
        }
    }

    /**
     * Select branch with default behavior when personality weighting is unavailable
     * @param {Object} character - Character making the choice (may be null)
     * @param {Array<Object>} branches - Array of branch objects
     * @param {Object} context - Selection context
     * @returns {Object} Selected branch result using default selection
     */
    selectBranchWithFallback(character, branches, context = {}) {
        try {
            // First try personality-weighted selection
            if (character && character.personality) {
                return this.selectWeightedBranch(character, branches, context, 'personality_driven');
            }
        } catch (error) {
            console.warn('BranchWeightingService: Personality weighting failed, using fallback:', error.message);
        }

        // Fallback: Use balanced selection if available
        try {
            return this.selectWeightedBranch(character, branches, context, 'balanced');
        } catch (error) {
            console.warn('BranchWeightingService: Balanced selection failed, using random fallback:', error.message);
        }

        // Final fallback: Pure random selection
        return this._selectRandomBranch(branches, context);
    }

    /**
     * Pure random branch selection as final fallback
     * @param {Array<Object>} branches - Array of branch objects
     * @param {Object} context - Selection context
     * @returns {Object} Randomly selected branch result
     * @private
     */
    _selectRandomBranch(branches, context = {}) {
        if (!Array.isArray(branches) || branches.length === 0) {
            throw new Error('No branches available for selection');
        }

        const randomIndex = Math.floor(Math.random() * branches.length);
        const selectedBranch = branches[randomIndex];

        return {
            branch: selectedBranch,
            weight: 1.0,
            selectionMethod: 'fallback_random',
            reason: 'Personality weighting unavailable, using random selection',
            weightBreakdown: {
                finalWeight: 1.0,
                componentWeights: {
                    personality: 1.0,
                    alignment: 1.0,
                    attributes: 1.0,
                    consciousness: 1.0,
                    memory: 1.0,
                    prestige: 1.0,
                    emotional: 1.0,
                    consistency: 1.0
                },
                behavioralModifiers: {
                    overallModifier: 1.0,
                    personalityModifier: 1.0,
                    consciousnessModifier: 1.0,
                    memoryModifier: 1.0
                },
                detailedBreakdown: {
                    fallback: true,
                    reason: 'personality_weighting_unavailable'
                }
            }
        };
    }

    /**
     * Check if personality weighting is available for a character
     * @param {Object} character - Character to check
     * @returns {boolean} True if personality weighting can be used
     */
    isPersonalityWeightingAvailable(character) {
        try {
            return character &&
                   character.personality &&
                   typeof character.personality === 'object' &&
                   Object.keys(character.personality).length > 0;
        } catch (error) {
            console.warn('BranchWeightingService: Error checking personality weighting availability:', error);
            return false;
        }
    }

    /**
     * Get default branch selection method when personality weighting is unavailable
     * @param {Object} character - Character making the choice
     * @param {Array<Object>} branches - Available branches
     * @returns {string} Default selection method name
     */
    getDefaultSelectionMethod(character, branches) {
        // If personality weighting is available, use it
        if (this.isPersonalityWeightingAvailable(character)) {
            return 'personality_driven';
        }

        // Otherwise, use balanced selection as default
        return 'balanced';
    }
}

export default BranchWeightingService;