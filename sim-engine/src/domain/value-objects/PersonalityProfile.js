/**
 * PersonalityProfile - Immutable value object representing a character's personality
 * Refactored from PersonalitySystem for historical world simulation
 */

class PersonalityTrait {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.category = config.category;
        this.intensity = config.intensity || 0.5;
        this.baseLevel = config.baseLevel || 0.5;
        this.volatility = config.volatility || 0.3;
        this.influence = config.influence || {};
        
        Object.freeze(this);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            intensity: this.intensity,
            baseLevel: this.baseLevel,
            volatility: this.volatility,
            influence: this.influence
        };
    }

    static fromJSON(data) {
        return new PersonalityTrait(data);
    }
}

class Attribute {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.baseValue = config.baseValue;
        this.modifier = this.calculateModifier(config.baseValue);
        
        Object.freeze(this);
    }

    calculateModifier(value) {
        return Math.floor((value - 10) / 2);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            baseValue: this.baseValue,
            modifier: this.modifier
        };
    }

    static fromJSON(data) {
        return new Attribute(data);
    }
}

class EmotionalTendency {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.category = config.category;
        this.intensity = config.intensity || 0.5;
        this.baseLevel = config.baseLevel || 0.5;
        this.volatility = config.volatility || 0.3;
        
        Object.freeze(this);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            intensity: this.intensity,
            baseLevel: this.baseLevel,
            volatility: this.volatility
        };
    }

    static fromJSON(data) {
        return new EmotionalTendency(data);
    }
}

class CognitiveTrait {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.category = config.category;
        this.complexity = config.complexity || 0.5;
        this.adaptability = config.adaptability || 0.5;
        
        Object.freeze(this);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            complexity: this.complexity,
            adaptability: this.adaptability
        };
    }

    static fromJSON(data) {
        return new CognitiveTrait(data);
    }
}

/**
 * PersonalityProfile - Immutable value object for character personality
 * Supports historical simulation with trait evolution and age modifiers
 */
class PersonalityProfile {
    constructor(config = {}) {
        // Initialize with default attributes if not provided
        const defaultAttributes = this._getDefaultAttributes();
        
        // Create immutable Maps from provided data or defaults
        this.traits = new Map();
        this.attributes = new Map();
        this.emotionalTendencies = new Map();
        this.cognitiveTraits = new Map();
        
        // Initialize attributes
        const attributeData = config.attributes || defaultAttributes;
        attributeData.forEach(attr => {
            const attribute = new Attribute(attr);
            this.attributes.set(attribute.id, attribute);
        });
        
        // Initialize traits
        if (config.traits) {
            config.traits.forEach(trait => {
                const personalityTrait = new PersonalityTrait(trait);
                this.traits.set(personalityTrait.id, personalityTrait);
            });
        }
        
        // Initialize emotional tendencies
        if (config.emotionalTendencies) {
            config.emotionalTendencies.forEach(tendency => {
                const emotionalTendency = new EmotionalTendency(tendency);
                this.emotionalTendencies.set(emotionalTendency.id, emotionalTendency);
            });
        }
        
        // Initialize cognitive traits
        if (config.cognitiveTraits) {
            config.cognitiveTraits.forEach(trait => {
                const cognitiveTrait = new CognitiveTrait(trait);
                this.cognitiveTraits.set(cognitiveTrait.id, cognitiveTrait);
            });
        }
        
        // Make the Maps read-only by creating immutable versions
        this.traits = this._createImmutableMap(this.traits);
        this.attributes = this._createImmutableMap(this.attributes);
        this.emotionalTendencies = this._createImmutableMap(this.emotionalTendencies);
        this.cognitiveTraits = this._createImmutableMap(this.cognitiveTraits);
        
        // Freeze the entire object
        Object.freeze(this);
    }

    _getDefaultAttributes() {
        return [
            { id: 'strength', name: 'Strength', description: 'Physical power and carrying capacity', baseValue: 10 },
            { id: 'dexterity', name: 'Dexterity', description: 'Agility, reflexes, and balance', baseValue: 10 },
            { id: 'constitution', name: 'Constitution', description: 'Health, stamina, and vital force', baseValue: 10 },
            { id: 'intelligence', name: 'Intelligence', description: 'Mental acuity, information recall, and analytical skill', baseValue: 10 },
            { id: 'wisdom', name: 'Wisdom', description: 'Awareness, intuition, and insight', baseValue: 10 },
            { id: 'charisma', name: 'Charisma', description: 'Confidence, eloquence, and leadership', baseValue: 10 }
        ];
    }

    /**
     * Create an immutable Map that throws on modification attempts
     * @param {Map} map - The map to make immutable
     * @returns {Map} Immutable map
     */
    _createImmutableMap(map) {
        // Create a new Map and freeze it
        const frozenMap = new Map(map);
        
        // Override mutating methods to throw errors
        frozenMap.set = () => {
            throw new TypeError('Cannot modify immutable Map');
        };
        frozenMap.delete = () => {
            throw new TypeError('Cannot modify immutable Map');
        };
        frozenMap.clear = () => {
            throw new TypeError('Cannot modify immutable Map');
        };
        
        return Object.freeze(frozenMap);
    }

    /**
     * Get a personality trait by ID
     * @param {string} id - The trait ID
     * @returns {PersonalityTrait|null} The trait or null if not found
     */
    getTrait(id) {
        return this.traits.get(id) || null;
    }

    /**
     * Get an attribute by ID
     * @param {string} id - The attribute ID
     * @returns {Attribute|null} The attribute or null if not found
     */
    getAttribute(id) {
        return this.attributes.get(id) || null;
    }

    /**
     * Get an emotional tendency by ID
     * @param {string} id - The tendency ID
     * @returns {EmotionalTendency|null} The tendency or null if not found
     */
    getEmotionalTendency(id) {
        return this.emotionalTendencies.get(id) || null;
    }

    /**
     * Get a cognitive trait by ID
     * @param {string} id - The trait ID
     * @returns {CognitiveTrait|null} The trait or null if not found
     */
    getCognitiveTrait(id) {
        return this.cognitiveTraits.get(id) || null;
    }

    /**
     * Create a new PersonalityProfile with evolved traits based on experiences
     * @param {Map<string, number>} traitChanges - Map of trait IDs to change amounts
     * @param {string} reason - Reason for the evolution (for historical tracking)
     * @returns {PersonalityProfile} New PersonalityProfile with evolved traits
     */
    withTraitEvolution(traitChanges, reason = 'Experience-based evolution') {
        const newTraits = [];
        
        // Process existing traits with changes
        this.traits.forEach(trait => {
            const change = traitChanges.get(trait.id) || 0;
            if (change !== 0) {
                // Apply change with volatility consideration
                const actualChange = change * trait.volatility;
                const newIntensity = Math.max(0, Math.min(1, trait.intensity + actualChange));
                const newBaseLevel = Math.max(0, Math.min(1, trait.baseLevel + (actualChange * 0.1)));
                

                
                newTraits.push({
                    ...trait.toJSON(),
                    intensity: newIntensity,
                    baseLevel: newBaseLevel,
                    influence: {
                        ...trait.influence,
                        lastEvolution: {
                            timestamp: new Date().toISOString(),
                            reason: reason,
                            change: actualChange
                        }
                    }
                });
            } else {
                newTraits.push(trait.toJSON());
            }
        });
        
        return new PersonalityProfile({
            traits: newTraits,
            attributes: Array.from(this.attributes.values()).map(attr => attr.toJSON()),
            emotionalTendencies: Array.from(this.emotionalTendencies.values()).map(et => et.toJSON()),
            cognitiveTraits: Array.from(this.cognitiveTraits.values()).map(ct => ct.toJSON())
        });
    }

    /**
     * Create a new PersonalityProfile with age-based modifications
     * @param {number} age - Character's current age
     * @param {Object} ageModifiers - Age-based modifiers configuration
     * @returns {PersonalityProfile} New PersonalityProfile with age modifications
     */
    withAgeModifiers(age, ageModifiers = {}) {
        const newTraits = [];
        const newAttributes = [];
        const newEmotionalTendencies = [];
        const newCognitiveTraits = [];
        
        // Default age modifier curves
        const defaultModifiers = {
            wisdom: this._calculateWisdomModifier(age),
            volatility: this._calculateVolatilityModifier(age),
            adaptability: this._calculateAdaptabilityModifier(age),
            physicalDecline: this._calculatePhysicalDeclineModifier(age)
        };
        
        const appliedModifiers = { ...defaultModifiers, ...ageModifiers };
        
        // Apply age modifiers to traits
        this.traits.forEach(trait => {
            const volatilityMod = appliedModifiers.volatility;
            const newVolatility = Math.max(0.1, Math.min(1, trait.volatility * volatilityMod));
            
            newTraits.push({
                ...trait.toJSON(),
                volatility: newVolatility,
                influence: {
                    ...trait.influence,
                    ageModified: {
                        age: age,
                        timestamp: new Date().toISOString(),
                        appliedModifiers: appliedModifiers
                    }
                }
            });
        });
        
        // Apply age modifiers to attributes
        this.attributes.forEach(attribute => {
            let newBaseValue = attribute.baseValue;
            
            // Physical attributes decline with age
            if (['strength', 'dexterity', 'constitution'].includes(attribute.id)) {
                newBaseValue = Math.max(3, attribute.baseValue + appliedModifiers.physicalDecline);
            }
            
            // Wisdom increases with age
            if (attribute.id === 'wisdom') {
                newBaseValue = Math.min(20, attribute.baseValue + appliedModifiers.wisdom);
            }
            
            newAttributes.push({
                ...attribute.toJSON(),
                baseValue: Math.round(newBaseValue)
            });
        });
        
        // Apply age modifiers to emotional tendencies
        this.emotionalTendencies.forEach(tendency => {
            const volatilityMod = appliedModifiers.volatility;
            const newVolatility = Math.max(0.1, Math.min(1, tendency.volatility * volatilityMod));
            
            newEmotionalTendencies.push({
                ...tendency.toJSON(),
                volatility: newVolatility
            });
        });
        
        // Apply age modifiers to cognitive traits
        this.cognitiveTraits.forEach(trait => {
            const adaptabilityMod = appliedModifiers.adaptability;
            const newAdaptability = Math.max(0.1, Math.min(1, trait.adaptability * adaptabilityMod));
            
            newCognitiveTraits.push({
                ...trait.toJSON(),
                adaptability: newAdaptability
            });
        });
        
        return new PersonalityProfile({
            traits: newTraits,
            attributes: newAttributes,
            emotionalTendencies: newEmotionalTendencies,
            cognitiveTraits: newCognitiveTraits
        });
    }

    // Age modifier calculation helpers
    _calculateWisdomModifier(age) {
        // Wisdom increases gradually with age, plateauing around 60
        if (age < 20) return 0;
        if (age < 40) return Math.floor((age - 20) / 10);
        if (age < 60) return 2 + Math.floor((age - 40) / 20);
        return 3;
    }

    _calculateVolatilityModifier(age) {
        // Volatility decreases with age (more stable personality)
        if (age < 18) return 1.2; // Young people are more volatile
        if (age < 30) return 1.0;
        if (age < 50) return 0.8;
        if (age < 70) return 0.6;
        return 0.5; // Elderly are very stable
    }

    _calculateAdaptabilityModifier(age) {
        // Adaptability decreases with age
        if (age < 25) return 1.0;
        if (age < 45) return 0.9;
        if (age < 65) return 0.7;
        return 0.5;
    }

    _calculatePhysicalDeclineModifier(age) {
        // Physical attributes decline after peak years
        if (age < 30) return 0;
        if (age < 50) return -1;
        if (age < 70) return -2;
        return -3;
    }

    /**
     * Serialize the PersonalityProfile to JSON with proper Map/Set handling
     * @returns {Object} Serialized personality profile
     */
    toJSON() {
        return {
            traits: Array.from(this.traits.entries()).map(([id, trait]) => ({
                id,
                ...trait.toJSON()
            })),
            attributes: Array.from(this.attributes.entries()).map(([id, attr]) => ({
                id,
                ...attr.toJSON()
            })),
            emotionalTendencies: Array.from(this.emotionalTendencies.entries()).map(([id, et]) => ({
                id,
                ...et.toJSON()
            })),
            cognitiveTraits: Array.from(this.cognitiveTraits.entries()).map(([id, ct]) => ({
                id,
                ...ct.toJSON()
            }))
        };
    }

    /**
     * Create a PersonalityProfile from JSON data
     * @param {Object} data - Serialized personality profile data
     * @returns {PersonalityProfile} New PersonalityProfile instance
     */
    static fromJSON(data) {
        return new PersonalityProfile({
            traits: data.traits || [],
            attributes: data.attributes || [],
            emotionalTendencies: data.emotionalTendencies || [],
            cognitiveTraits: data.cognitiveTraits || []
        });
    }

    /**
     * Get all traits as an array
     * @returns {PersonalityTrait[]} Array of all traits
     */
    getAllTraits() {
        return Array.from(this.traits.values());
    }

    /**
     * Get all attributes as an array
     * @returns {Attribute[]} Array of all attributes
     */
    getAllAttributes() {
        return Array.from(this.attributes.values());
    }

    /**
     * Get all emotional tendencies as an array
     * @returns {EmotionalTendency[]} Array of all emotional tendencies
     */
    getAllEmotionalTendencies() {
        return Array.from(this.emotionalTendencies.values());
    }

    /**
     * Get all cognitive traits as an array
     * @returns {CognitiveTrait[]} Array of all cognitive traits
     */
    getAllCognitiveTraits() {
        return Array.from(this.cognitiveTraits.values());
    }

    /**
     * Apply experience-based personality changes
     * @param {Object} experience - The experience that affects personality
     * @param {Object} context - Historical and social context
     * @returns {PersonalityProfile} New PersonalityProfile with experience-based changes
     */
    withExperienceInfluence(experience, context = {}) {
        const traitChanges = new Map();
        const emotionalChanges = new Map();
        const cognitiveChanges = new Map();
        
        // Calculate trait changes based on experience type and intensity
        const experienceImpact = this._calculateExperienceImpact(experience, context);
        
        // Apply trait modifications
        experienceImpact.traitModifications.forEach((change, traitId) => {
            traitChanges.set(traitId, change);
        });
        
        // Apply emotional tendency modifications
        experienceImpact.emotionalModifications.forEach((change, tendencyId) => {
            emotionalChanges.set(tendencyId, change);
        });
        
        // Apply cognitive trait modifications
        experienceImpact.cognitiveModifications.forEach((change, traitId) => {
            cognitiveChanges.set(traitId, change);
        });
        
        return this._applyComprehensiveChanges(
            traitChanges,
            emotionalChanges,
            cognitiveChanges,
            `Experience: ${experience.type || 'Unknown'}`
        );
    }

    /**
     * Apply historical event influence to personality
     * @param {Object} historicalEvent - The historical event affecting the character
     * @param {Object} characterRole - Character's role/involvement in the event
     * @returns {PersonalityProfile} New PersonalityProfile with event-based changes
     */
    withHistoricalEventInfluence(historicalEvent, characterRole = {}) {
        const eventImpact = this._calculateHistoricalEventImpact(historicalEvent, characterRole);
        
        return this._applyComprehensiveChanges(
            eventImpact.traitChanges,
            eventImpact.emotionalChanges,
            eventImpact.cognitiveChanges,
            `Historical Event: ${historicalEvent.name || historicalEvent.type}`
        );
    }

    /**
     * Apply trauma-based personality changes
     * @param {Object} trauma - The traumatic experience
     * @param {number} severity - Severity of the trauma (0-1)
     * @returns {PersonalityProfile} New PersonalityProfile with trauma-based changes
     */
    withTraumaInfluence(trauma, severity = 0.5) {
        const traitChanges = new Map();
        const emotionalChanges = new Map();
        
        // Trauma typically increases certain traits and decreases others
        const traumaEffects = this._calculateTraumaEffects(trauma, severity);
        
        traumaEffects.forEach((change, traitId) => {
            if (this.traits.has(traitId)) {
                traitChanges.set(traitId, change);
            } else if (this.emotionalTendencies.has(traitId)) {
                emotionalChanges.set(traitId, change);
            }
        });
        
        return this._applyComprehensiveChanges(
            traitChanges,
            emotionalChanges,
            new Map(),
            `Trauma: ${trauma.type || 'Unspecified'} (Severity: ${severity})`
        );
    }

    /**
     * Apply social interaction influence to personality
     * @param {Object} interaction - The social interaction
     * @param {Object} otherCharacter - The other character involved
     * @returns {PersonalityProfile} New PersonalityProfile with social influence
     */
    withSocialInfluence(interaction, otherCharacter = {}) {
        const socialImpact = this._calculateSocialImpact(interaction, otherCharacter);
        
        return this._applyComprehensiveChanges(
            socialImpact.traitChanges,
            socialImpact.emotionalChanges,
            socialImpact.cognitiveChanges,
            `Social Interaction: ${interaction.type || 'General'}`
        );
    }

    // Experience and event impact calculation methods

    /**
     * Calculate the impact of an experience on personality traits
     * @param {Object} experience - The experience object
     * @param {Object} context - Historical and social context
     * @returns {Object} Impact object with trait, emotional, and cognitive modifications
     */
    _calculateExperienceImpact(experience, context) {
        const impact = {
            traitModifications: new Map(),
            emotionalModifications: new Map(),
            cognitiveModifications: new Map()
        };

        const experienceType = experience.type || 'general';
        const intensity = experience.intensity || 0.5;
        const duration = experience.duration || 1; // Duration modifier

        // Define experience type mappings to personality changes
        const experienceEffects = {
            'combat': {
                traits: { 'courage': 0.1, 'aggression': 0.05, 'caution': -0.05 },
                emotional: { 'stress': 0.1, 'confidence': 0.05 },
                cognitive: { 'tactical': 0.1, 'analytical': 0.05 }
            },
            'leadership': {
                traits: { 'charisma': 0.1, 'confidence': 0.1, 'responsibility': 0.05 },
                emotional: { 'empathy': 0.05, 'authority': 0.1 },
                cognitive: { 'strategic': 0.1, 'social': 0.05 }
            },
            'betrayal': {
                traits: { 'trust': -0.2, 'cynicism': 0.15, 'caution': 0.1 },
                emotional: { 'anger': 0.1, 'sadness': 0.05, 'paranoia': 0.1 },
                cognitive: { 'analytical': 0.05, 'social': -0.05 }
            },
            'loss': {
                traits: { 'empathy': 0.1, 'melancholy': 0.15, 'wisdom': 0.05 },
                emotional: { 'grief': 0.2, 'compassion': 0.1 },
                cognitive: { 'introspective': 0.1, 'philosophical': 0.05 }
            },
            'achievement': {
                traits: { 'confidence': 0.1, 'pride': 0.05, 'ambition': 0.05 },
                emotional: { 'joy': 0.1, 'satisfaction': 0.1 },
                cognitive: { 'goal-oriented': 0.05, 'optimistic': 0.05 }
            },
            'learning': {
                traits: { 'curiosity': 0.05, 'patience': 0.05, 'wisdom': 0.1 },
                emotional: { 'satisfaction': 0.05, 'wonder': 0.05 },
                cognitive: { 'analytical': 0.1, 'creative': 0.05, 'memory': 0.05 }
            }
        };

        const effects = experienceEffects[experienceType] || experienceEffects['general'] || {};
        const intensityMultiplier = intensity * duration;

        // Apply trait modifications
        if (effects.traits) {
            Object.entries(effects.traits).forEach(([traitId, change]) => {
                impact.traitModifications.set(traitId, change * intensityMultiplier);
            });
        }

        // Apply emotional modifications
        if (effects.emotional) {
            Object.entries(effects.emotional).forEach(([emotionId, change]) => {
                impact.emotionalModifications.set(emotionId, change * intensityMultiplier);
            });
        }

        // Apply cognitive modifications
        if (effects.cognitive) {
            Object.entries(effects.cognitive).forEach(([cognitiveId, change]) => {
                impact.cognitiveModifications.set(cognitiveId, change * intensityMultiplier);
            });
        }

        // Apply contextual modifiers
        if (context.culturalValues) {
            this._applyCulturalModifiers(impact, context.culturalValues, intensityMultiplier);
        }

        return impact;
    }

    /**
     * Calculate the impact of a historical event on personality
     * @param {Object} historicalEvent - The historical event
     * @param {Object} characterRole - Character's role in the event
     * @returns {Object} Impact object with personality changes
     */
    _calculateHistoricalEventImpact(historicalEvent, characterRole) {
        const impact = {
            traitChanges: new Map(),
            emotionalChanges: new Map(),
            cognitiveChanges: new Map()
        };

        const eventType = historicalEvent.type || 'general';
        const eventScale = historicalEvent.scale || 'local'; // local, regional, national, global
        const roleImportance = characterRole.importance || 'minor'; // minor, moderate, major, pivotal
        
        // Scale multipliers
        const scaleMultipliers = {
            'local': 0.5,
            'regional': 0.75,
            'national': 1.0,
            'global': 1.25
        };

        // Role multipliers
        const roleMultipliers = {
            'minor': 0.5,
            'moderate': 0.75,
            'major': 1.0,
            'pivotal': 1.5
        };

        const baseMultiplier = scaleMultipliers[eventScale] * roleMultipliers[roleImportance];

        // Define historical event effects
        const eventEffects = {
            'war': {
                traits: { 'courage': 0.1, 'trauma': 0.15, 'loyalty': 0.1, 'aggression': 0.05 },
                emotional: { 'fear': 0.1, 'anger': 0.05, 'solidarity': 0.1 },
                cognitive: { 'strategic': 0.1, 'survival': 0.15 }
            },
            'plague': {
                traits: { 'caution': 0.15, 'empathy': 0.1, 'fatalism': 0.1 },
                emotional: { 'fear': 0.2, 'compassion': 0.1, 'despair': 0.05 },
                cognitive: { 'medical': 0.05, 'philosophical': 0.1 }
            },
            'revolution': {
                traits: { 'idealism': 0.15, 'courage': 0.1, 'rebellion': 0.2 },
                emotional: { 'passion': 0.15, 'hope': 0.1, 'anger': 0.1 },
                cognitive: { 'political': 0.15, 'strategic': 0.1 }
            },
            'discovery': {
                traits: { 'curiosity': 0.15, 'wonder': 0.1, 'adaptability': 0.1 },
                emotional: { 'excitement': 0.1, 'awe': 0.1 },
                cognitive: { 'innovative': 0.15, 'analytical': 0.1 }
            },
            'famine': {
                traits: { 'resilience': 0.1, 'desperation': 0.1, 'frugality': 0.15 },
                emotional: { 'hunger': 0.2, 'despair': 0.1, 'determination': 0.05 },
                cognitive: { 'survival': 0.15, 'resourceful': 0.1 }
            }
        };

        const effects = eventEffects[eventType] || {};

        // Apply effects with multipliers
        if (effects.traits) {
            Object.entries(effects.traits).forEach(([traitId, change]) => {
                impact.traitChanges.set(traitId, change * baseMultiplier);
            });
        }

        if (effects.emotional) {
            Object.entries(effects.emotional).forEach(([emotionId, change]) => {
                impact.emotionalChanges.set(emotionId, change * baseMultiplier);
            });
        }

        if (effects.cognitive) {
            Object.entries(effects.cognitive).forEach(([cognitiveId, change]) => {
                impact.cognitiveChanges.set(cognitiveId, change * baseMultiplier);
            });
        }

        return impact;
    }

    /**
     * Calculate trauma effects on personality
     * @param {Object} trauma - The traumatic experience
     * @param {number} severity - Severity of trauma (0-1)
     * @returns {Map} Map of trait changes
     */
    _calculateTraumaEffects(trauma, severity) {
        const effects = new Map();
        const traumaType = trauma.type || 'general';

        // Base trauma effects
        const traumaEffects = {
            'physical': {
                'resilience': 0.1 * severity,
                'caution': 0.15 * severity,
                'trust': -0.1 * severity,
                'anxiety': 0.2 * severity
            },
            'emotional': {
                'empathy': 0.05 * severity,
                'trust': -0.2 * severity,
                'anxiety': 0.25 * severity,
                'depression': 0.15 * severity
            },
            'betrayal': {
                'trust': -0.3 * severity,
                'cynicism': 0.2 * severity,
                'paranoia': 0.15 * severity,
                'isolation': 0.1 * severity
            },
            'loss': {
                'grief': 0.3 * severity,
                'empathy': 0.1 * severity,
                'melancholy': 0.2 * severity,
                'wisdom': 0.05 * severity
            }
        };

        const typeEffects = traumaEffects[traumaType] || traumaEffects['emotional'];
        
        Object.entries(typeEffects).forEach(([traitId, change]) => {
            effects.set(traitId, change);
        });

        return effects;
    }

    /**
     * Calculate social interaction impact on personality
     * @param {Object} interaction - The social interaction
     * @param {Object} otherCharacter - The other character
     * @returns {Object} Impact object with personality changes
     */
    _calculateSocialImpact(interaction, otherCharacter) {
        const impact = {
            traitChanges: new Map(),
            emotionalChanges: new Map(),
            cognitiveChanges: new Map()
        };

        const interactionType = interaction.type || 'conversation';
        const outcome = interaction.outcome || 'neutral';
        const intimacy = interaction.intimacy || 0.5;
        const duration = interaction.duration || 1;

        const baseMultiplier = intimacy * duration * 0.1;

        // Define interaction effects based on type and outcome
        const interactionEffects = {
            'friendship': {
                'positive': { traits: { 'trust': 0.1, 'empathy': 0.05, 'loyalty': 0.1 } },
                'negative': { traits: { 'trust': -0.05, 'cynicism': 0.05 } }
            },
            'romance': {
                'positive': { traits: { 'trust': 0.15, 'empathy': 0.1, 'passion': 0.1 } },
                'negative': { traits: { 'trust': -0.1, 'cynicism': 0.1, 'melancholy': 0.05 } }
            },
            'conflict': {
                'victory': { traits: { 'confidence': 0.1, 'aggression': 0.05 } },
                'defeat': { traits: { 'humility': 0.1, 'caution': 0.05, 'resentment': 0.05 } }
            },
            'mentorship': {
                'positive': { traits: { 'wisdom': 0.1, 'patience': 0.05, 'teaching': 0.1 } },
                'negative': { traits: { 'frustration': 0.05, 'impatience': 0.05 } }
            }
        };

        const typeEffects = interactionEffects[interactionType];
        if (typeEffects && typeEffects[outcome]) {
            const effects = typeEffects[outcome];
            
            if (effects.traits) {
                Object.entries(effects.traits).forEach(([traitId, change]) => {
                    impact.traitChanges.set(traitId, change * baseMultiplier);
                });
            }
        }

        return impact;
    }

    /**
     * Apply cultural modifiers to personality impact
     * @param {Object} impact - The impact object to modify
     * @param {Object} culturalValues - Cultural values that influence personality
     * @param {number} multiplier - Base multiplier for changes
     */
    _applyCulturalModifiers(impact, culturalValues, multiplier) {
        // Cultural values can amplify or dampen certain personality changes
        const culturalInfluence = {
            'honor': ['courage', 'loyalty', 'pride'],
            'collectivism': ['empathy', 'cooperation', 'self-sacrifice'],
            'individualism': ['independence', 'ambition', 'self-reliance'],
            'tradition': ['respect', 'conservatism', 'wisdom'],
            'innovation': ['curiosity', 'adaptability', 'creativity']
        };

        Object.entries(culturalValues).forEach(([value, strength]) => {
            const influencedTraits = culturalInfluence[value] || [];
            influencedTraits.forEach(traitId => {
                if (impact.traitModifications.has(traitId)) {
                    const currentChange = impact.traitModifications.get(traitId);
                    const culturalModifier = 1 + (strength * 0.2); // 20% max cultural influence
                    impact.traitModifications.set(traitId, currentChange * culturalModifier);
                }
            });
        });
    }

    /**
     * Apply comprehensive changes to all personality aspects
     * @param {Map} traitChanges - Trait changes to apply
     * @param {Map} emotionalChanges - Emotional tendency changes
     * @param {Map} cognitiveChanges - Cognitive trait changes
     * @param {string} reason - Reason for the changes
     * @returns {PersonalityProfile} New PersonalityProfile with all changes applied
     */
    _applyComprehensiveChanges(traitChanges, emotionalChanges, cognitiveChanges, reason) {
        const newTraits = [];
        const newEmotionalTendencies = [];
        const newCognitiveTraits = [];

        // Apply trait changes - only to existing traits
        this.traits.forEach(trait => {
            const change = traitChanges.get(trait.id) || 0;
            if (change !== 0) {
                const actualChange = change * trait.volatility;
                const newIntensity = Math.max(0, Math.min(1, trait.intensity + actualChange));
                const newBaseLevel = Math.max(0, Math.min(1, trait.baseLevel + (actualChange * 0.1)));
                
                newTraits.push({
                    ...trait.toJSON(),
                    intensity: newIntensity,
                    baseLevel: newBaseLevel,
                    influence: {
                        ...trait.influence,
                        lastChange: {
                            timestamp: new Date().toISOString(),
                            reason: reason,
                            change: actualChange
                        }
                    }
                });
            } else {
                newTraits.push(trait.toJSON());
            }
        });

        // Apply emotional tendency changes - only to existing tendencies
        this.emotionalTendencies.forEach(tendency => {
            const change = emotionalChanges.get(tendency.id) || 0;
            if (change !== 0) {
                const actualChange = change * tendency.volatility;
                const newIntensity = Math.max(0, Math.min(1, tendency.intensity + actualChange));
                const newBaseLevel = Math.max(0, Math.min(1, tendency.baseLevel + (actualChange * 0.1)));
                
                newEmotionalTendencies.push({
                    ...tendency.toJSON(),
                    intensity: newIntensity,
                    baseLevel: newBaseLevel
                });
            } else {
                newEmotionalTendencies.push(tendency.toJSON());
            }
        });

        // Apply cognitive trait changes - only to existing traits
        this.cognitiveTraits.forEach(trait => {
            const change = cognitiveChanges.get(trait.id) || 0;
            if (change !== 0) {
                const actualChange = change * trait.adaptability;
                const newComplexity = Math.max(0, Math.min(1, trait.complexity + actualChange));
                
                newCognitiveTraits.push({
                    ...trait.toJSON(),
                    complexity: newComplexity
                });
            } else {
                newCognitiveTraits.push(trait.toJSON());
            }
        });

        return new PersonalityProfile({
            traits: newTraits,
            attributes: Array.from(this.attributes.values()).map(attr => attr.toJSON()),
            emotionalTendencies: newEmotionalTendencies,
            cognitiveTraits: newCognitiveTraits
        });
    }
}

// Export personality traits type definition for backward compatibility
export const PersonalityTraits = {
    introvert: { min: 0, max: 1, weight: 1 },
    extrovert: { min: 0, max: 1, weight: 1 },
    analytical: { min: 0, max: 1, weight: 1 },
    creative: { min: 0, max: 1, weight: 1 },
    emotional: { min: 0, max: 1, weight: 1 },
    rational: { min: 0, max: 1, weight: 1 },
    cautious: { min: 0, max: 1, weight: 1 },
    adventurous: { min: 0, max: 1, weight: 1 },
    organized: { min: 0, max: 1, weight: 1 },
    spontaneous: { min: 0, max: 1, weight: 1 }
};

export { PersonalityTrait, Attribute, EmotionalTendency, CognitiveTrait };
export default PersonalityProfile;