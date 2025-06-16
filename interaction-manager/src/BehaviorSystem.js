class Behavior {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.category = config.category;
        this.triggerConditions = config.triggerConditions || [];
        this.responseActions = config.responseActions || [];
        this.priority = config.priority || 1;
        this.cooldown = config.cooldown || 0;
        this.lastTriggered = 0;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            triggerConditions: this.triggerConditions,
            responseActions: this.responseActions,
            priority: this.priority,
            cooldown: this.cooldown,
            lastTriggered: this.lastTriggered
        };
    }
}

class Interaction {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.type = config.type; // 'social', 'combat', 'trade', etc.
        this.requirements = config.requirements || {};
        this.outcomes = config.outcomes || [];
        this.modifiers = config.modifiers || {};
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            requirements: this.requirements,
            outcomes: this.outcomes,
            modifiers: this.modifiers
        };
    }
}

class BehaviorSystem {
    constructor() {
        this.behaviors = new Map();
        this.interactions = new Map();
        this.behaviorCategories = new Set();
        this.interactionTypes = new Set();
    }

    // Behavior Management
    createBehavior(config) {
        if (this.behaviors.has(config.id)) {
            throw new Error(`Behavior with ID ${config.id} already exists`);
        }
        const behavior = new Behavior(config);
        this.behaviors.set(config.id, behavior);
        if (config.category) {
            this.behaviorCategories.add(config.category);
        }
        return behavior;
    }

    getBehavior(id) {
        return this.behaviors.get(id);
    }

    getAllBehaviors() {
        return Array.from(this.behaviors.values());
    }

    updateBehavior(id, config) {
        if (!this.behaviors.has(id)) {
            throw new Error(`Behavior with ID ${id} not found`);
        }
        const behavior = new Behavior({ ...config, id });
        this.behaviors.set(id, behavior);
        if (config.category) {
            this.behaviorCategories.add(config.category);
        }
        return behavior;
    }

    deleteBehavior(id) {
        if (!this.behaviors.has(id)) {
            throw new Error(`Behavior with ID ${id} not found`);
        }
        this.behaviors.delete(id);
    }

    // Interaction Management
    createInteraction(config) {
        if (this.interactions.has(config.id)) {
            throw new Error(`Interaction with ID ${config.id} already exists`);
        }
        const interaction = new Interaction(config);
        this.interactions.set(config.id, interaction);
        if (config.type) {
            this.interactionTypes.add(config.type);
        }
        return interaction;
    }

    getInteraction(id) {
        return this.interactions.get(id);
    }

    getAllInteractions() {
        return Array.from(this.interactions.values());
    }

    updateInteraction(id, config) {
        if (!this.interactions.has(id)) {
            throw new Error(`Interaction with ID ${id} not found`);
        }
        const interaction = new Interaction({ ...config, id });
        this.interactions.set(id, interaction);
        if (config.type) {
            this.interactionTypes.add(config.type);
        }
        return interaction;
    }

    deleteInteraction(id) {
        if (!this.interactions.has(id)) {
            throw new Error(`Interaction with ID ${id} not found`);
        }
        this.interactions.delete(id);
    }

    // Category Management
    getBehaviorCategories() {
        return Array.from(this.behaviorCategories);
    }

    getInteractionTypes() {
        return Array.from(this.interactionTypes);
    }

    // Behavior Analysis
    evaluateBehavior(character, situation) {
        const applicableBehaviors = Array.from(this.behaviors.values())
            .filter(behavior => {
                // Check if behavior is on cooldown
                if (behavior.cooldown > 0) {
                    const timeSinceLastTrigger = Date.now() - behavior.lastTriggered;
                    if (timeSinceLastTrigger < behavior.cooldown) {
                        return false;
                    }
                }

                // Check trigger conditions
                return behavior.triggerConditions.every(condition => 
                    this.evaluateCondition(condition, character, situation)
                );
            })
            .sort((a, b) => b.priority - a.priority);

        return applicableBehaviors;
    }

    evaluateCondition(condition, character, situation) {
        // Implement condition evaluation logic based on character traits,
        // personality, emotional state, and situation context
        return true; // Placeholder
    }

    // Interaction Analysis
    evaluateInteraction(character1, character2, interactionType) {
        const possibleInteractions = Array.from(this.interactions.values())
            .filter(interaction => interaction.type === interactionType)
            .filter(interaction => 
                this.checkRequirements(interaction.requirements, character1, character2)
            );

        return possibleInteractions;
    }

    checkRequirements(requirements, character1, character2) {
        // Implement requirement checking logic based on character traits,
        // relationships, and other factors
        return true; // Placeholder
    }

    // Data Persistence
    toJSON() {
        return {
            behaviors: Array.from(this.behaviors.values()).map(b => b.toJSON()),
            interactions: Array.from(this.interactions.values()).map(i => i.toJSON()),
            behaviorCategories: Array.from(this.behaviorCategories),
            interactionTypes: Array.from(this.interactionTypes)
        };
    }

    static fromJSON(data) {
        const system = new BehaviorSystem();
        
        // Restore categories and types
        data.behaviorCategories.forEach(category => system.behaviorCategories.add(category));
        data.interactionTypes.forEach(type => system.interactionTypes.add(type));
        
        // Restore behaviors
        data.behaviors.forEach(behaviorData => {
            system.createBehavior(behaviorData);
        });
        
        // Restore interactions
        data.interactions.forEach(interactionData => {
            system.createInteraction(interactionData);
        });
        
        return system;
    }
}

export default BehaviorSystem; 