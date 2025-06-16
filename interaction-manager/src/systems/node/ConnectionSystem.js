class ConnectionRule {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.conditions = config.conditions || [];
        this.weight = config.weight || 1.0;
        this.cooldown = config.cooldown || 0; // Time in ms before rule can be used again
        this.lastUsed = 0;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            conditions: this.conditions,
            weight: this.weight,
            cooldown: this.cooldown,
            lastUsed: this.lastUsed
        };
    }
}

class EncounterTemplate {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.requiredTraits = config.requiredTraits || [];
        this.requiredBiome = config.requiredBiome || null;
        this.requiredTime = config.requiredTime || null;
        this.possibleOutcomes = config.possibleOutcomes || [];
        this.weight = config.weight || 1.0;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            requiredTraits: this.requiredTraits,
            requiredBiome: this.requiredBiome,
            requiredTime: this.requiredTime,
            possibleOutcomes: this.possibleOutcomes,
            weight: this.weight
        };
    }
}

class ConnectionSystem {
    constructor(nodeTypeSystem, personalitySystem, consciousnessSystem) {
        this.nodeTypeSystem = nodeTypeSystem;
        this.personalitySystem = personalitySystem;
        this.consciousnessSystem = consciousnessSystem;
        this.connectionRules = new Map();
        this.encounterTemplates = new Map();
        this.activeConnections = new Map();
        this.connectionHistory = new Map();
    }

    // Connection Rule Management
    addConnectionRule(rule) {
        if (this.connectionRules.has(rule.id)) {
            throw new Error(`Connection rule with ID ${rule.id} already exists`);
        }
        this.connectionRules.set(rule.id, new ConnectionRule(rule));
        return true;
    }

    // Encounter Template Management
    addEncounterTemplate(template) {
        if (this.encounterTemplates.has(template.id)) {
            throw new Error(`Encounter template with ID ${template.id} already exists`);
        }
        this.encounterTemplates.set(template.id, new EncounterTemplate(template));
        return true;
    }

    // Dynamic Connection Generation
    generateConnections(nodeId, radius = 1) {
        const node = this.nodeTypeSystem.getNodeType(nodeId);
        if (!node) {
            throw new Error(`Node with ID ${nodeId} not found`);
        }

        const possibleConnections = new Set();
        const currentTime = Date.now();

        // Get all connection rules that could apply
        for (const [ruleId, rule] of this.connectionRules) {
            // Check cooldown
            if (currentTime - rule.lastUsed < rule.cooldown) {
                continue;
            }

            // Check conditions
            if (this.evaluateConnectionConditions(node, rule.conditions)) {
                possibleConnections.add(ruleId);
                rule.lastUsed = currentTime;
            }
        }

        return Array.from(possibleConnections);
    }

    // Encounter Generation
    generateEncounter(nodeId, context = {}) {
        const node = this.nodeTypeSystem.getNodeType(nodeId);
        if (!node) {
            throw new Error(`Node with ID ${nodeId} not found`);
        }

        // Get all possible encounter templates
        const possibleEncounters = Array.from(this.encounterTemplates.values())
            .filter(template => this.isEncounterTemplateValid(template, node, context));

        if (possibleEncounters.length === 0) {
            return null;
        }

        // Weight and select an encounter
        const totalWeight = possibleEncounters.reduce((sum, encounter) => sum + encounter.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const encounter of possibleEncounters) {
            random -= encounter.weight;
            if (random <= 0) {
                return this.generateEncounterOutcome(encounter, node, context);
            }
        }

        return null;
    }

    // Helper Methods
    evaluateConnectionConditions(node, conditions) {
        return conditions.every(condition => {
            switch (condition.type) {
                case 'terrain':
                    return node.terrainCategory === condition.value;
                case 'biome':
                    return Object.entries(condition.value).every(([key, value]) => 
                        node.biomeProperties[key] === value
                    );
                case 'danger':
                    return this.evaluateRangeCondition(node.dangerLevel, condition.value);
                case 'civilization':
                    return this.evaluateRangeCondition(node.civilizationLevel, condition.value);
                default:
                    return false;
            }
        });
    }

    evaluateRangeCondition(value, range) {
        if (typeof range === 'number') {
            return value === range;
        }
        if (Array.isArray(range)) {
            return value >= range[0] && value <= range[1];
        }
        return false;
    }

    isEncounterTemplateValid(template, node, context) {
        // Check required traits
        if (template.requiredTraits.length > 0) {
            const nodeTraits = this.getNodeTraits(node.id);
            if (!template.requiredTraits.every(trait => nodeTraits.includes(trait))) {
                return false;
            }
        }

        // Check required biome
        if (template.requiredBiome) {
            if (!this.evaluateBiomeConditions(node.biomeProperties, template.requiredBiome)) {
                return false;
            }
        }

        // Check required time
        if (template.requiredTime) {
            if (!this.evaluateTimeCondition(context.time, template.requiredTime)) {
                return false;
            }
        }

        return true;
    }

    getNodeTraits(nodeId) {
        const node = this.nodeTypeSystem.getNodeType(nodeId);
        if (!node) {
            return [];
        }
        return node.traits || [];
    }

    evaluateBiomeConditions(biomeProperties, requiredBiome) {
        return Object.entries(requiredBiome).every(([key, value]) => 
            biomeProperties[key] === value
        );
    }

    evaluateTimeCondition(currentTime, requiredTime) {
        if (typeof requiredTime === 'string') {
            return currentTime === requiredTime;
        }
        if (Array.isArray(requiredTime)) {
            return currentTime >= requiredTime[0] && currentTime <= requiredTime[1];
        }
        return false;
    }

    generateEncounterOutcome(template, node, context) {
        // Get node's consciousness state
        const consciousnessState = this.consciousnessSystem.getConsciousnessState(node.id);
        
        // Calculate base outcome probabilities
        const outcomes = template.possibleOutcomes.map(outcome => ({
            ...outcome,
            probability: this.calculateOutcomeProbability(outcome, node, consciousnessState, context)
        }));

        // Normalize probabilities
        const totalProbability = outcomes.reduce((sum, outcome) => sum + outcome.probability, 0);
        outcomes.forEach(outcome => {
            outcome.probability /= totalProbability;
        });

        // Select outcome based on probabilities
        let random = Math.random();
        for (const outcome of outcomes) {
            random -= outcome.probability;
            if (random <= 0) {
                return {
                    template: template.id,
                    outcome: outcome.id,
                    description: outcome.description,
                    consequences: outcome.consequences,
                    node: node.id,
                    timestamp: Date.now()
                };
            }
        }

        return null;
    }

    calculateOutcomeProbability(outcome, node, consciousnessState, context) {
        let probability = outcome.baseProbability || 1.0;

        // Adjust based on node properties
        if (outcome.dangerModifier) {
            probability *= (1 + (node.dangerLevel - 5) * outcome.dangerModifier);
        }

        // Adjust based on consciousness state
        if (consciousnessState && outcome.frequencyModifier) {
            const frequencyDiff = consciousnessState.currentFrequency - consciousnessState.baseFrequency;
            probability *= (1 + frequencyDiff * outcome.frequencyModifier);
        }

        // Adjust based on context
        if (context.weather && outcome.weatherModifier) {
            probability *= outcome.weatherModifier[context.weather] || 1.0;
        }

        return Math.max(0, Math.min(1, probability));
    }

    // Data Persistence
    toJSON() {
        return {
            connectionRules: Array.from(this.connectionRules.values()).map(rule => rule.toJSON()),
            encounterTemplates: Array.from(this.encounterTemplates.values()).map(template => template.toJSON()),
            activeConnections: Array.from(this.activeConnections.entries()),
            connectionHistory: Array.from(this.connectionHistory.entries())
        };
    }

    fromJSON(data) {
        // Clear existing data
        this.connectionRules.clear();
        this.encounterTemplates.clear();
        this.activeConnections.clear();
        this.connectionHistory.clear();

        // Restore connection rules
        data.connectionRules.forEach(ruleData => {
            const rule = new ConnectionRule(ruleData);
            this.connectionRules.set(rule.id, rule);
        });

        // Restore encounter templates
        data.encounterTemplates.forEach(templateData => {
            const template = new EncounterTemplate(templateData);
            this.encounterTemplates.set(template.id, template);
        });

        // Restore active connections and history
        this.activeConnections = new Map(data.activeConnections);
        this.connectionHistory = new Map(data.connectionHistory);

        return this;
    }
}

export default ConnectionSystem; 