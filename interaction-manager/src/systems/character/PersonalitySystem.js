class PersonalityTrait {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.category = config.category;
        this.intensity = config.intensity || 0.5;
        this.baseLevel = config.baseLevel || 0.5;
        this.volatility = config.volatility || 0.3;
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
}

class CognitiveTrait {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.category = config.category;
        this.complexity = config.complexity || 0.5;
        this.adaptability = config.adaptability || 0.5;
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
}

class PersonalitySystem {
    constructor() {
        this.traits = new Map();
        this.attributes = new Map();
        this.emotionalTendencies = new Map();
        this.cognitiveTraits = new Map();
        this.traitCategories = new Set([
            'Personality',
            'Social',
            'Emotional',
            'Behavioral',
            'Moral',
            'Intellectual'
        ]);
        this.cognitiveCategories = new Set([
            'Analytical',
            'Creative',
            'Practical',
            'Theoretical',
            'Strategic',
            'Tactical'
        ]);
        this.initializeDefaultAttributes();
    }

    initializeDefaultAttributes() {
        const defaultAttributes = [
            { id: 'strength', name: 'Strength', description: 'Physical power and carrying capacity', baseValue: 10 },
            { id: 'dexterity', name: 'Dexterity', description: 'Agility, reflexes, and balance', baseValue: 10 },
            { id: 'constitution', name: 'Constitution', description: 'Health, stamina, and vital force', baseValue: 10 },
            { id: 'intelligence', name: 'Intelligence', description: 'Mental acuity, information recall, and analytical skill', baseValue: 10 },
            { id: 'wisdom', name: 'Wisdom', description: 'Awareness, intuition, and insight', baseValue: 10 },
            { id: 'charisma', name: 'Charisma', description: 'Confidence, eloquence, and leadership', baseValue: 10 }
        ];

        defaultAttributes.forEach(attr => {
            this.createAttribute(attr);
        });
    }

    createAttribute(attributeConfig) {
        if (!this.validateAttributeConfig(attributeConfig)) {
            throw new Error('Invalid attribute configuration');
        }

        const attribute = {
            ...attributeConfig,
            modifier: this.calculateModifier(attributeConfig.baseValue)
        };

        this.attributes.set(attribute.id, attribute);
        return attribute;
    }

    validateAttributeConfig(config) {
        const requiredFields = ['id', 'name', 'description', 'baseValue'];
        for (const field of requiredFields) {
            if (!config[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        if (config.baseValue < 1 || config.baseValue > 20) {
            console.error('Base value must be between 1 and 20');
            return false;
        }

        return true;
    }

    calculateModifier(value) {
        return Math.floor((value - 10) / 2);
    }

    updateAttribute(id, updates) {
        const attribute = this.attributes.get(id);
        if (!attribute) {
            throw new Error(`Attribute with ID ${id} not found`);
        }

        const updatedAttribute = {
            ...attribute,
            ...updates,
            modifier: this.calculateModifier(updates.baseValue || attribute.baseValue)
        };

        this.attributes.set(id, updatedAttribute);
        return updatedAttribute;
    }

    getAttribute(id) {
        return this.attributes.get(id);
    }

    getAllAttributes() {
        return Array.from(this.attributes.values());
    }

    deleteAttribute(id) {
        return this.attributes.delete(id);
    }

    // Existing trait methods
    createTrait(traitConfig) {
        if (!this.validateTraitConfig(traitConfig)) {
            throw new Error('Invalid trait configuration');
        }

        const trait = {
            ...traitConfig,
            influence: traitConfig.influence || {}
        };

        this.traits.set(trait.id, trait);
        return trait;
    }

    validateTraitConfig(config) {
        const requiredFields = ['id', 'name', 'description', 'baseValue'];
        for (const field of requiredFields) {
            if (!config[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        if (config.baseValue < -100 || config.baseValue > 100) {
            console.error('Base value must be between -100 and 100');
            return false;
        }

        return true;
    }

    updateTrait(id, updates) {
        const trait = this.traits.get(id);
        if (!trait) {
            throw new Error(`Trait with ID ${id} not found`);
        }

        const updatedTrait = {
            ...trait,
            ...updates,
            influence: { ...trait.influence, ...updates.influence }
        };

        this.traits.set(id, updatedTrait);
        return updatedTrait;
    }

    getTrait(id) {
        return this.traits.get(id);
    }

    getAllTraits() {
        return Array.from(this.traits.values());
    }

    deleteTrait(id) {
        return this.traits.delete(id);
    }

    // Emotional Tendency methods
    createEmotionalTendency(config) {
        if (!this.validateEmotionalTendencyConfig(config)) {
            throw new Error('Invalid emotional tendency configuration');
        }

        const tendency = new EmotionalTendency(config);
        this.emotionalTendencies.set(tendency.id, tendency);
        return tendency;
    }

    validateEmotionalTendencyConfig(config) {
        const requiredFields = ['id', 'name', 'description', 'category'];
        for (const field of requiredFields) {
            if (!config[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        return true;
    }

    updateEmotionalTendency(id, updates) {
        const tendency = this.emotionalTendencies.get(id);
        if (!tendency) {
            throw new Error(`Emotional tendency with ID ${id} not found`);
        }

        const updatedTendency = {
            ...tendency,
            ...updates
        };

        this.emotionalTendencies.set(id, updatedTendency);
        return updatedTendency;
    }

    deleteEmotionalTendency(id) {
        return this.emotionalTendencies.delete(id);
    }

    // Cognitive Trait methods
    createCognitiveTrait(config) {
        if (!this.validateCognitiveTraitConfig(config)) {
            throw new Error('Invalid cognitive trait configuration');
        }

        const trait = new CognitiveTrait(config);
        this.cognitiveTraits.set(trait.id, trait);
        return trait;
    }

    validateCognitiveTraitConfig(config) {
        const requiredFields = ['id', 'name', 'description', 'category'];
        for (const field of requiredFields) {
            if (!config[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        return true;
    }

    updateCognitiveTrait(id, updates) {
        const trait = this.cognitiveTraits.get(id);
        if (!trait) {
            throw new Error(`Cognitive trait with ID ${id} not found`);
        }

        const updatedTrait = {
            ...trait,
            ...updates
        };

        this.cognitiveTraits.set(id, updatedTrait);
        return updatedTrait;
    }

    deleteCognitiveTrait(id) {
        return this.cognitiveTraits.delete(id);
    }

    // Data persistence methods
    toJSON() {
        return {
            traits: Array.from(this.traits.values()),
            attributes: Array.from(this.attributes.values()),
            emotionalTendencies: Array.from(this.emotionalTendencies.values()),
            cognitiveTraits: Array.from(this.cognitiveTraits.values())
        };
    }

    fromJSON(data) {
        // Clear existing data
        this.traits.clear();
        this.attributes.clear();
        this.emotionalTendencies.clear();
        this.cognitiveTraits.clear();

        // Restore attributes
        if (data.attributes) {
            data.attributes.forEach(attr => {
                this.createAttribute(attr);
            });
        }

        // Restore traits
        if (data.traits) {
            data.traits.forEach(trait => {
                this.createTrait(trait);
            });
        }

        // Restore emotional tendencies
        if (data.emotionalTendencies) {
            data.emotionalTendencies.forEach(tendency => {
                this.createEmotionalTendency(tendency);
            });
        }

        // Restore cognitive traits
        if (data.cognitiveTraits) {
            data.cognitiveTraits.forEach(trait => {
                this.createCognitiveTrait(trait);
            });
        }

        return this;
    }

    getTraitCategories() {
        return Array.from(this.traitCategories);
    }

    getCognitiveCategories() {
        return Array.from(this.cognitiveCategories);
    }
}

// Export personality traits type definition
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

export default PersonalitySystem; 