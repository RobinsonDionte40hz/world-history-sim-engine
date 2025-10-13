/**
 * BranchWeight Value Object
 *
 * Represents the calculated weight for a content interaction branch based on
 * character personality, alignment, attributes, consciousness, memory, prestige,
 * and emotional factors. Provides bounded weight calculations (0.1x to 3.0x range)
 * with detailed breakdown tracking for debugging and analysis.
 */

class BranchWeight {
    constructor(character, branchMetadata, context = {}) {
        this.character = character;
        this.branchMetadata = branchMetadata || {};
        this.context = context;

        // Extract behavioral modifiers from context
        this.behavioralModifiers = context.behavioralModifiers || {
            overallModifier: 1.0,
            personalityModifier: 1.0,
            consciousnessModifier: 1.0,
            memoryModifier: 1.0
        };

        // Ensure all modifiers are valid numbers
        this.behavioralModifiers = {
            overallModifier: this.ensureValidModifier(this.behavioralModifiers.overallModifier),
            personalityModifier: this.ensureValidModifier(this.behavioralModifiers.personalityModifier),
            consciousnessModifier: this.ensureValidModifier(this.behavioralModifiers.consciousnessModifier),
            memoryModifier: this.ensureValidModifier(this.behavioralModifiers.memoryModifier)
        };

        // Weight components (all multipliers, bounded 0.1x to 3.0x)
        this.weights = {
            personality: 1.0,
            alignment: 1.0,
            attributes: 1.0,
            consciousness: 1.0,
            memory: 1.0,
            prestige: 1.0,
            emotional: 1.0,
            consistency: 1.0
        };

        // Weight breakdown for debugging
        this.breakdown = {
            personality: { factors: [], total: 1.0 },
            alignment: { factors: [], total: 1.0 },
            attributes: { factors: [], total: 1.0 },
            consciousness: { factors: [], total: 1.0 },
            memory: { factors: [], total: 1.0 },
            prestige: { factors: [], total: 1.0 },
            emotional: { factors: [], total: 1.0 },
            consistency: { factors: [], total: 1.0 }
        };

        // Final calculated weight
        this.finalWeight = 1.0;

        // Validation
        this.validateInputs();
    }

    /**
     * Validate input parameters
     */
    validateInputs() {
        if (!this.character) {
            throw new Error('Character is required');
        }

        if (!this.branchMetadata || typeof this.branchMetadata !== 'object') {
            // Allow empty metadata, will use defaults
            this.branchMetadata = {};
        }
    }

    /**
     * Calculate personality-based weight
     * @returns {number} Personality weight multiplier
     */
    calculatePersonalityWeight() {
        const factors = [];
        let totalWeight = 1.0;

        if (!this.character || !this.character.personality) {
            this.breakdown.personality = { factors: ['No character or personality data'], total: 1.0 };
            return 1.0;
        }

        const personalityAffinities = this.branchMetadata.personalityAffinities || {};

        // Process each personality trait affinity
        Object.entries(personalityAffinities).forEach(([trait, affinity]) => {
            const characterTraitValue = this.getCharacterTraitValue(trait);
            const traitInfluence = this.calculateTraitInfluence(characterTraitValue, affinity);

            factors.push({
                trait,
                characterValue: characterTraitValue,
                branchAffinity: affinity,
                influence: traitInfluence
            });

            totalWeight *= traitInfluence;
        });

        // Apply behavioral state personality modifier
        totalWeight *= this.behavioralModifiers.personalityModifier;

        factors.push({
            type: 'behavioral_modifier',
            modifier: this.behavioralModifiers.personalityModifier,
            description: 'Behavioral state personality modifier'
        });

        // Bound the result
        totalWeight = this.clampWeight(totalWeight);

        this.weights.personality = totalWeight;
        this.breakdown.personality = { factors, total: totalWeight };

        return totalWeight;
    }

    /**
     * Calculate alignment-based weight
     * @returns {number} Alignment weight multiplier
     */
    calculateAlignmentWeight() {
        const factors = [];
        let totalWeight = 1.0;

        const alignmentLean = this.branchMetadata.alignmentLean || {};

        // Lawful/Chaotic axis
        if (alignmentLean.lawful !== undefined) {
            const characterLawfulness = this.getCharacterAlignmentValue('lawful');
            const influence = this.calculateAlignmentInfluence(characterLawfulness, alignmentLean.lawful);
            factors.push({
                axis: 'lawful',
                characterValue: characterLawfulness,
                branchLean: alignmentLean.lawful,
                influence
            });
            totalWeight *= influence;
        }

        // Good/Evil axis
        if (alignmentLean.good !== undefined) {
            const characterGoodness = this.getCharacterAlignmentValue('good');
            const influence = this.calculateAlignmentInfluence(characterGoodness, alignmentLean.good);
            factors.push({
                axis: 'good',
                characterValue: characterGoodness,
                branchLean: alignmentLean.good,
                influence
            });
            totalWeight *= influence;
        }

        // Bound the result
        totalWeight = this.clampWeight(totalWeight);

        this.weights.alignment = totalWeight;
        this.breakdown.alignment = { factors, total: totalWeight };

        return totalWeight;
    }

    /**
     * Calculate attribute-based weight
     * @returns {number} Attribute weight multiplier
     */
    calculateAttributeWeight() {
        const factors = [];
        let totalWeight = 1.0;

        const attributePreferences = this.branchMetadata.attributePreference || {};

        // Process each attribute preference
        Object.entries(attributePreferences).forEach(([attribute, preference]) => {
            const characterAttributeValue = this.getCharacterAttributeValue(attribute);
            const influence = this.calculateAttributeInfluence(characterAttributeValue, preference);

            factors.push({
                attribute,
                characterValue: characterAttributeValue,
                branchPreference: preference,
                influence
            });

            totalWeight *= influence;
        });

        // Bound the result
        totalWeight = this.clampWeight(totalWeight);

        this.weights.attributes = totalWeight;
        this.breakdown.attributes = { factors, total: totalWeight };

        return totalWeight;
    }

    /**
     * Calculate consciousness-based weight
     * @returns {number} Consciousness weight multiplier
     */
    calculateConsciousnessWeight() {
        const factors = [];
        let totalWeight = 1.0;

        if (!this.character || !this.character.consciousness) {
            this.breakdown.consciousness = { factors: ['No character or consciousness data'], total: 1.0 };
            return 1.0;
        }

        const consciousnessFactors = this.branchMetadata.consciousnessFactors || {};

        // Process consciousness factor preferences
        Object.entries(consciousnessFactors).forEach(([factor, preference]) => {
            const characterFactorValue = this.getCharacterConsciousnessValue(factor);
            const influence = this.calculateConsciousnessInfluence(characterFactorValue, preference);

            factors.push({
                factor,
                characterValue: characterFactorValue,
                branchPreference: preference,
                influence
            });

            totalWeight *= influence;
        });

        // Apply behavioral state consciousness modifier
        totalWeight *= this.behavioralModifiers.consciousnessModifier;

        factors.push({
            type: 'behavioral_modifier',
            modifier: this.behavioralModifiers.consciousnessModifier,
            description: 'Behavioral state consciousness modifier'
        });

        // Bound the result
        totalWeight = this.clampWeight(totalWeight);

        this.weights.consciousness = totalWeight;
        this.breakdown.consciousness = { factors, total: totalWeight };

        return totalWeight;
    }

    /**
     * Calculate memory-based weight
     * @returns {number} Memory weight multiplier
     */
    calculateMemoryWeight() {
        const factors = [];
        let totalWeight = 1.0;

        // Memory influence based on past choices and outcomes
        const memoryPatterns = this.getMemoryPatterns();
        if (memoryPatterns.length > 0) {
            memoryPatterns.forEach(pattern => {
                const influence = this.calculateMemoryInfluence(pattern);
                factors.push({
                    pattern: pattern.type,
                    strength: pattern.strength,
                    influence
                });
                totalWeight *= influence;
            });
        }

        // Apply behavioral state memory modifier
        totalWeight *= this.behavioralModifiers.memoryModifier;

        factors.push({
            type: 'behavioral_modifier',
            modifier: this.behavioralModifiers.memoryModifier,
            description: 'Behavioral state memory modifier'
        });

        // Bound the result
        totalWeight = this.clampWeight(totalWeight);

        this.weights.memory = totalWeight;
        this.breakdown.memory = { factors, total: totalWeight };

        return totalWeight;
    }

    /**
     * Calculate prestige-based weight
     * @returns {number} Prestige weight multiplier
     */
    calculatePrestigeWeight() {
        const factors = [];
        let totalWeight = 1.0;

        const characterPrestige = this.getCharacterPrestigeValue();
        const prestigePreference = this.branchMetadata.prestigePreference;

        if (prestigePreference !== undefined) {
            const influence = this.calculatePrestigeInfluence(characterPrestige, prestigePreference);
            factors.push({
                characterPrestige,
                branchPreference: prestigePreference,
                influence
            });
            totalWeight *= influence;
        }

        // Bound the result
        totalWeight = this.clampWeight(totalWeight);

        this.weights.prestige = totalWeight;
        this.breakdown.prestige = { factors, total: totalWeight };

        return totalWeight;
    }

    /**
     * Calculate emotional state weight
     * @returns {number} Emotional weight multiplier
     */
    calculateEmotionalWeight() {
        const factors = [];
        let totalWeight = 1.0;

        const emotionalState = this.getCharacterEmotionalState();
        const emotionalPreferences = this.branchMetadata.emotionalPreference || {};

        // Process emotional preferences
        Object.entries(emotionalPreferences).forEach(([emotion, preference]) => {
            const characterEmotionValue = emotionalState[emotion] || 0.5;
            const influence = this.calculateEmotionalInfluence(characterEmotionValue, preference);

            factors.push({
                emotion,
                characterValue: characterEmotionValue,
                branchPreference: preference,
                influence
            });

            totalWeight *= influence;
        });

        // Bound the result
        totalWeight = this.clampWeight(totalWeight);

        this.weights.emotional = totalWeight;
        this.breakdown.emotional = { factors, total: totalWeight };

        return totalWeight;
    }

    /**
     * Calculate consistency bonus based on character choice history
     * @returns {number} Consistency weight multiplier
     */
    calculateConsistencyWeight() {
        const factors = [];
        let totalWeight = 1.0;

        const choiceHistory = this.getCharacterChoiceHistory();
        if (choiceHistory.length > 0) {
            const consistencyScore = this.calculateConsistencyScore(choiceHistory);
            const consistencyBonus = 1 + (consistencyScore * 0.2); // Up to 20% bonus

            factors.push({
                historyLength: choiceHistory.length,
                consistencyScore,
                bonus: consistencyBonus
            });

            totalWeight *= consistencyBonus;
        }

        // Bound the result
        totalWeight = this.clampWeight(totalWeight);

        this.weights.consistency = totalWeight;
        this.breakdown.consistency = { factors, total: totalWeight };

        return totalWeight;
    }

    /**
     * Calculate final weight by combining all factors
     * @returns {number} Final weight (bounded 0.1x to 3.0x)
     */
    calculateFinalWeight() {
        // Calculate all component weights
        this.calculatePersonalityWeight();
        this.calculateAlignmentWeight();
        this.calculateAttributeWeight();
        this.calculateConsciousnessWeight();
        this.calculateMemoryWeight();
        this.calculatePrestigeWeight();
        this.calculateEmotionalWeight();
        this.calculateConsistencyWeight();

        // Combine all weights multiplicatively
        this.finalWeight = Object.values(this.weights).reduce((total, weight) => total * weight, 1.0);

        // Apply overall behavioral modifier
        this.finalWeight *= this.behavioralModifiers.overallModifier;

        // Final bounding
        this.finalWeight = this.clampWeight(this.finalWeight);

        return this.finalWeight;
    }

    // Helper methods for data extraction

    getCharacterTraitValue(trait) {
        if (!this.character || !this.character.personality) return 0.5;
        const traits = this.character.personality.getAllTraits ?
            this.character.personality.getAllTraits() :
            this.character.personality;
        return traits[trait] || 0.5;
    }

    getCharacterAlignmentValue(axis) {
        // Alignment is typically stored as properties on character
        return this.character?.[`${axis}Alignment`] || 0.5;
    }

    getCharacterAttributeValue(attribute) {
        return this.character?.attributes?.[attribute] || 10;
    }

    getCharacterConsciousnessValue(factor) {
        if (!this.character || !this.character.consciousness) return 0.5;
        const behavioralState = this.character.consciousness.getBehavioralState ?
            this.character.consciousness.getBehavioralState() :
            this.character.consciousness.behavioralState || {};
        return behavioralState[factor] || 0.5;
    }

    getMemoryPatterns() {
        // Extract patterns from character's significant memories
        // This would integrate with MemoryQueryService in a real implementation
        return this.context.memoryPatterns || [];
    }

    getCharacterPrestigeValue() {
        return this.character?.prestige || this.character?.socialStanding || 0.5;
    }

    getCharacterEmotionalState() {
        // Extract from consciousness or separate emotional state
        if (this.character?.emotionalState) {
            return this.character.emotionalState;
        }
        return {
            happiness: 0.5,
            anger: 0.5,
            fear: 0.5,
            excitement: 0.5
        };
    }

    getCharacterChoiceHistory() {
        return this.character?.choiceHistory || [];
    }

    // Calculation helper methods

    calculateTraitInfluence(characterValue, branchAffinity) {
        // Convert affinity to influence: higher affinity for matching traits
        const affinityMatch = 1 - Math.abs(characterValue - branchAffinity);
        return 0.8 + (affinityMatch * 0.4); // 0.8x to 1.2x range
    }

    calculateAlignmentInfluence(characterValue, branchLean) {
        const leanMatch = 1 - Math.abs(characterValue - branchLean);
        return 0.7 + (leanMatch * 0.6); // 0.7x to 1.3x range
    }

    calculateAttributeInfluence(characterValue, preference) {
        // D&D style modifier calculation scaled to our range
        const modifier = Math.floor((characterValue - 10) / 2);
        const scaledModifier = modifier * 0.1; // ±2.0 max
        const baseInfluence = 1 + scaledModifier;

        // Adjust based on preference strength
        const preferenceMultiplier = 0.8 + (preference * 0.4); // 0.8x to 1.2x
        return baseInfluence * preferenceMultiplier;
    }

    calculateConsciousnessInfluence(characterValue, preference) {
        const preferenceMatch = 1 - Math.abs(characterValue - preference);
        return 0.8 + (preferenceMatch * 0.4); // 0.8x to 1.2x range
    }

    calculateMemoryInfluence(pattern) {
        return 0.9 + (pattern.strength * 0.2); // 0.9x to 1.1x range
    }

    calculatePrestigeInfluence(characterPrestige, branchPreference) {
        const prestigeMatch = 1 - Math.abs(characterPrestige - branchPreference);
        return 0.8 + (prestigeMatch * 0.4); // 0.8x to 1.2x range
    }

    calculateEmotionalInfluence(characterValue, preference) {
        const emotionMatch = 1 - Math.abs(characterValue - preference);
        return 0.8 + (emotionMatch * 0.4); // 0.8x to 1.2x range
    }

    calculateConsistencyScore(choiceHistory) {
        if (choiceHistory.length < 2) return 0;

        // Calculate how consistent recent choices have been
        const recentChoices = choiceHistory.slice(-5); // Last 5 choices
        let consistencySum = 0;

        for (let i = 1; i < recentChoices.length; i++) {
            const similarity = this.calculateChoiceSimilarity(recentChoices[i-1], recentChoices[i]);
            consistencySum += similarity;
        }

        return consistencySum / (recentChoices.length - 1);
    }

    calculateChoiceSimilarity(choice1, choice2) {
        // Simple similarity based on choice type/category
        if (choice1.category === choice2.category) {
            return 0.8; // Same category = high similarity
        }
        return 0.2; // Different category = low similarity
    }

    /**
     * Ensure a modifier value is valid (not NaN, finite, within bounds)
     * @param {number} modifier - Modifier value to validate
     * @returns {number} Valid modifier value
     */
    ensureValidModifier(modifier) {
        if (typeof modifier !== 'number' || isNaN(modifier) || !isFinite(modifier)) {
            return 1.0; // Default to neutral modifier
        }
        // Clamp to reasonable bounds (0.1 to 5.0 to allow some flexibility)
        return Math.max(0.1, Math.min(5.0, modifier));
    }

    /**
     * Clamp weight to valid bounds (0.1x to 3.0x)
     * @param {number} weight - Weight to clamp
     * @returns {number} Clamped weight
     */
    clampWeight(weight) {
        return Math.max(0.1, Math.min(3.0, weight));
    }

    /**
     * Get weight breakdown for debugging
     * @returns {Object} Detailed weight breakdown
     */
    getWeightBreakdown() {
        return {
            finalWeight: this.finalWeight,
            componentWeights: { ...this.weights },
            behavioralModifiers: { ...this.behavioralModifiers },
            detailedBreakdown: { ...this.breakdown }
        };
    }

    /**
     * Create BranchWeight from character and branch data
     * @param {Object} character - Character data
     * @param {Object} branchMetadata - Branch metadata
     * @param {Object} context - Additional context
     * @returns {BranchWeight} New BranchWeight instance
     */
    static create(character, branchMetadata, context = {}) {
        const branchWeight = new BranchWeight(character, branchMetadata, context);
        branchWeight.calculateFinalWeight();
        return branchWeight;
    }

    /**
     * Create BranchWeight with pre-calculated weights
     * @param {Object} character - Character data
     * @param {Object} branchMetadata - Branch metadata
     * @param {Object} weights - Pre-calculated weights
     * @param {Object} context - Additional context
     * @returns {BranchWeight} New BranchWeight instance
     */
    static fromWeights(character, branchMetadata, weights, context = {}) {
        const branchWeight = new BranchWeight(character, branchMetadata, context);
        branchWeight.weights = { ...weights };
        branchWeight.finalWeight = Object.values(weights).reduce((total, weight) => total * weight, 1.0);
        branchWeight.finalWeight = branchWeight.clampWeight(branchWeight.finalWeight);
        return branchWeight;
    }
}

export default BranchWeight;