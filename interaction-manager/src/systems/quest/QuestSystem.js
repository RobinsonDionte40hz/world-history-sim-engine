export class QuestNode {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.type = config.type; // 'dialogue', 'action', 'discovery', 'choice'
        this.requirements = config.requirements || {};
        this.consequences = config.consequences || {};
        this.branches = config.branches || [];
        this.consciousnessTriggers = config.consciousnessTriggers || [];
        this.unlockConditions = config.unlockConditions || [];
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            requirements: this.requirements,
            consequences: this.consequences,
            branches: this.branches,
            consciousnessTriggers: this.consciousnessTriggers,
            unlockConditions: this.unlockConditions
        };
    }
}

class QuestTemplate {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.trigger = config.trigger;
        this.nodes = new Map();
        this.initialNode = config.initialNode;
        this.consciousnessRequirements = config.consciousnessRequirements || {};
        this.evolutionRules = config.evolutionRules || [];
        this.informationLayers = config.informationLayers || {};
    }

    addNode(node) {
        this.nodes.set(node.id, node);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            trigger: this.trigger,
            nodes: Array.from(this.nodes.values()).map(node => node.toJSON()),
            initialNode: this.initialNode,
            consciousnessRequirements: this.consciousnessRequirements,
            evolutionRules: this.evolutionRules,
            informationLayers: this.informationLayers
        };
    }
}

class QuestInstance {
    constructor(template, context) {
        this.template = template;
        this.context = context;
        this.currentNode = template.initialNode;
        this.completedNodes = new Set();
        this.activeBranches = new Set();
        this.consciousnessState = new Map();
        this.informationRevealed = new Set();
        this.startTime = Date.now();
    }

    toJSON() {
        return {
            template: this.template.id,
            context: this.context,
            currentNode: this.currentNode,
            completedNodes: Array.from(this.completedNodes),
            activeBranches: Array.from(this.activeBranches),
            consciousnessState: Array.from(this.consciousnessState.entries()),
            informationRevealed: Array.from(this.informationRevealed),
            startTime: this.startTime
        };
    }
}

class QuestSystem {
    constructor(consciousnessSystem, connectionSystem) {
        this.consciousnessSystem = consciousnessSystem;
        this.connectionSystem = connectionSystem;
        this.questTemplates = new Map();
        this.activeQuests = new Map();
        this.questHistory = new Map();
    }

    // Quest Template Management
    addQuestTemplate(template) {
        if (this.questTemplates.has(template.id)) {
            throw new Error(`Quest template with ID ${template.id} already exists`);
        }
        this.questTemplates.set(template.id, template);
        return true;
    }

    // Quest Generation
    generateQuests(nodeId, context = {}) {
        const node = this.connectionSystem.nodeTypeSystem.getNodeType(nodeId);
        if (!node) {
            throw new Error(`Node with ID ${nodeId} not found`);
        }

        const possibleQuests = Array.from(this.questTemplates.values())
            .filter(template => this.isQuestTemplateValid(template, node, context));

        return possibleQuests.map(template => this.createQuestInstance(template, {
            ...context,
            nodeId,
            timestamp: Date.now()
        }));
    }

    // Quest Instance Management
    createQuestInstance(template, context) {
        const instance = new QuestInstance(template, context);
        this.activeQuests.set(instance.template.id, instance);
        return instance;
    }

    // Quest Progression
    progressQuest(questId, choice) {
        const quest = this.activeQuests.get(questId);
        if (!quest) {
            throw new Error(`Quest with ID ${questId} not found`);
        }

        const currentNode = quest.template.nodes.get(quest.currentNode);
        if (!currentNode) {
            throw new Error(`Current node ${quest.currentNode} not found in quest ${questId}`);
        }

        // Apply consequences
        this.applyConsequences(currentNode.consequences, quest);

        // Update consciousness state
        this.updateConsciousnessState(quest, currentNode);

        // Check for evolution triggers
        this.checkEvolutionTriggers(quest);

        // Move to next node
        const nextNode = this.determineNextNode(currentNode, choice, quest);
        if (nextNode) {
            quest.currentNode = nextNode;
            quest.completedNodes.add(currentNode.id);
        } else {
            this.completeQuest(questId);
        }

        return quest;
    }

    // Helper Methods
    isQuestTemplateValid(template, node, context) {
        // Check consciousness requirements
        if (template.consciousnessRequirements) {
            const consciousnessState = this.consciousnessSystem.getConsciousnessState(node.id);
            if (!consciousnessState) return false;

            if (template.consciousnessRequirements.frequency) {
                const [min, max] = template.consciousnessRequirements.frequency.split('-').map(Number);
                if (consciousnessState.currentFrequency < min || consciousnessState.currentFrequency > max) {
                    return false;
                }
            }

            if (template.consciousnessRequirements.coherence) {
                const [min, max] = template.consciousnessRequirements.coherence.split('-').map(Number);
                if (consciousnessState.emotionalCoherence < min || consciousnessState.emotionalCoherence > max) {
                    return false;
                }
            }
        }

        // Check other requirements
        return true;
    }

    applyConsequences(consequences, quest) {
        if (!consequences) return;

        // Apply consciousness changes
        if (consequences.consciousness) {
            const consciousnessState = this.consciousnessSystem.getConsciousnessState(quest.context.nodeId);
            if (consciousnessState) {
                if (consequences.consciousness.frequency) {
                    consciousnessState.currentFrequency += consequences.consciousness.frequency;
                }
                if (consequences.consciousness.coherence) {
                    consciousnessState.emotionalCoherence += consequences.consciousness.coherence;
                }
            }
        }

        // Apply relationship changes
        if (consequences.relationships) {
            Object.entries(consequences.relationships).forEach(([targetId, change]) => {
                this.consciousnessSystem.updateRelationship(
                    quest.context.nodeId,
                    targetId,
                    change
                );
            });
        }

        // Apply information reveals
        if (consequences.revealInformation) {
            quest.informationRevealed.add(consequences.revealInformation);
        }
    }

    updateConsciousnessState(quest, node) {
        if (node.consciousnessTriggers) {
            node.consciousnessTriggers.forEach(trigger => {
                const consciousnessState = this.consciousnessSystem.getConsciousnessState(quest.context.nodeId);
                if (consciousnessState) {
                    if (trigger.type === 'frequency_shift') {
                        consciousnessState.currentFrequency += trigger.value;
                    } else if (trigger.type === 'coherence_shift') {
                        consciousnessState.emotionalCoherence += trigger.value;
                    }
                }
            });
        }
    }

    checkEvolutionTriggers(quest) {
        const consciousnessState = this.consciousnessSystem.getConsciousnessState(quest.context.nodeId);
        if (!consciousnessState) return;

        quest.template.evolutionRules.forEach(rule => {
            if (this.evaluateEvolutionRule(rule, consciousnessState, quest)) {
                this.evolveQuest(quest, rule);
            }
        });
    }

    evaluateEvolutionRule(rule, consciousnessState, quest) {
        switch (rule.type) {
            case 'frequency_threshold':
                return consciousnessState.currentFrequency >= rule.threshold;
            case 'coherence_threshold':
                return consciousnessState.emotionalCoherence >= rule.threshold;
            case 'completed_nodes':
                return quest.completedNodes.size >= rule.count;
            case 'time_elapsed':
                return Date.now() - quest.startTime >= rule.duration;
            default:
                return false;
        }
    }

    evolveQuest(quest, rule) {
        // Add new nodes
        if (rule.addNodes) {
            rule.addNodes.forEach(node => {
                quest.template.addNode(new QuestNode(node));
            });
        }

        // Modify existing nodes
        if (rule.modifyNodes) {
            rule.modifyNodes.forEach(modification => {
                const node = quest.template.nodes.get(modification.nodeId);
                if (node) {
                    Object.assign(node, modification.changes);
                }
            });
        }

        // Add new branches
        if (rule.addBranches) {
            rule.addBranches.forEach(branch => {
                quest.activeBranches.add(branch);
            });
        }
    }

    determineNextNode(currentNode, choice, quest) {
        // Check if choice leads to a specific branch
        const branch = currentNode.branches.find(b => b.id === choice);
        if (branch) {
            return branch.nextNode;
        }

        // Check unlock conditions
        for (const condition of currentNode.unlockConditions) {
            if (this.evaluateUnlockCondition(condition, quest)) {
                return condition.nextNode;
            }
        }

        return null;
    }

    evaluateUnlockCondition(condition, quest) {
        switch (condition.type) {
            case 'consciousness':
                const consciousnessState = this.consciousnessSystem.getConsciousnessState(quest.context.nodeId);
                if (!consciousnessState) return false;
                return this.evaluateConsciousnessCondition(condition, consciousnessState);
            case 'completed_nodes':
                return quest.completedNodes.size >= condition.count;
            case 'information_revealed':
                return quest.informationRevealed.has(condition.informationId);
            default:
                return false;
        }
    }

    evaluateConsciousnessCondition(condition, consciousnessState) {
        if (condition.frequency) {
            const [min, max] = condition.frequency.split('-').map(Number);
            if (consciousnessState.currentFrequency < min || consciousnessState.currentFrequency > max) {
                return false;
            }
        }
        if (condition.coherence) {
            const [min, max] = condition.coherence.split('-').map(Number);
            if (consciousnessState.emotionalCoherence < min || consciousnessState.emotionalCoherence > max) {
                return false;
            }
        }
        return true;
    }

    completeQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) {
            throw new Error(`Quest with ID ${questId} not found`);
        }

        // Apply completion consequences
        this.applyConsequences(quest.template.consequences, quest);

        // Move to history
        this.questHistory.set(questId, quest);
        this.activeQuests.delete(questId);
    }

    // Data Persistence
    toJSON() {
        return {
            questTemplates: Array.from(this.questTemplates.values()).map(template => template.toJSON()),
            activeQuests: Array.from(this.activeQuests.entries()),
            questHistory: Array.from(this.questHistory.entries())
        };
    }

    fromJSON(data) {
        // Clear existing data
        this.questTemplates.clear();
        this.activeQuests.clear();
        this.questHistory.clear();

        // Restore quest templates
        data.questTemplates.forEach(templateData => {
            const template = new QuestTemplate(templateData);
            templateData.nodes.forEach(nodeData => {
                template.addNode(new QuestNode(nodeData));
            });
            this.questTemplates.set(template.id, template);
        });

        // Restore active quests and history
        data.activeQuests.forEach(([id, questData]) => {
            const template = this.questTemplates.get(questData.template);
            if (template) {
                const quest = new QuestInstance(template, questData.context);
                Object.assign(quest, questData);
                this.activeQuests.set(id, quest);
            }
        });

        data.questHistory.forEach(([id, questData]) => {
            const template = this.questTemplates.get(questData.template);
            if (template) {
                const quest = new QuestInstance(template, questData.context);
                Object.assign(quest, questData);
                this.questHistory.set(id, quest);
            }
        });

        return this;
    }
}

export default QuestSystem; 