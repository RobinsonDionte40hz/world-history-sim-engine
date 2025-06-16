const { ConsciousnessSystem } = require('./ConsciousnessSystem');

class NPCAutonomySystem {
    constructor() {
        this.consciousnessSystem = new ConsciousnessSystem();
        this.skillProficiencies = new Map();
        this.abilityScores = new Map();
        this.proficiencyBonus = 2; // Base proficiency bonus, increases with level
    }

    // D&D Ability Score Management
    setAbilityScores(npcId, scores) {
        if (!scores || typeof scores !== 'object') {
            throw new Error('Invalid ability scores provided');
        }
        this.abilityScores.set(npcId, {
            STR: scores.STR || 10,
            DEX: scores.DEX || 10,
            CON: scores.CON || 10,
            INT: scores.INT || 10,
            WIS: scores.WIS || 10,
            CHA: scores.CHA || 10
        });
    }

    getAbilityModifier(ability, npcId) {
        const scores = this.abilityScores.get(npcId);
        if (!scores || !scores[ability]) {
            throw new Error(`No ability scores found for NPC ${npcId}`);
        }
        return Math.floor((scores[ability] - 10) / 2);
    }

    // Consciousness-based ability modifiers
    getConsciousnessModifiers(npcId) {
        const state = this.consciousnessSystem.getConsciousnessState(npcId);
        if (!state) {
            throw new Error(`No consciousness state found for NPC ${npcId}`);
        }

        return {
            INT_bonus: Math.floor((state.currentFrequency - 7) / 3),
            WIS_bonus: Math.floor(state.emotionalCoherence * 3),
            CHA_bonus: Math.floor(state.fieldRadius / 2)
        };
    }

    // Skill Check System
    rollSkillCheck(npcId, skill, DC) {
        const roll = Math.floor(Math.random() * 20) + 1;
        const abilityMod = this.getAbilityModifier(this.getSkillAbility(skill), npcId);
        const proficiencyBonus = this.isProficient(npcId, skill) ? this.proficiencyBonus : 0;
        const consciousnessModifiers = this.getConsciousnessModifiers(npcId);
        const consciousnessBonus = this.getConsciousnessBonusForSkill(skill, consciousnessModifiers);

        const total = roll + abilityMod + proficiencyBonus + consciousnessBonus;

        return {
            roll,
            total,
            success: total >= DC,
            criticalSuccess: roll === 20,
            criticalFailure: roll === 1,
            modifiers: {
                abilityMod,
                proficiencyBonus,
                consciousnessBonus
            }
        };
    }

    getSkillAbility(skill) {
        const skillAbilities = {
            acrobatics: 'DEX',
            animalHandling: 'WIS',
            arcana: 'INT',
            athletics: 'STR',
            deception: 'CHA',
            history: 'INT',
            insight: 'WIS',
            intimidation: 'CHA',
            investigation: 'INT',
            medicine: 'WIS',
            nature: 'INT',
            perception: 'WIS',
            performance: 'CHA',
            persuasion: 'CHA',
            religion: 'INT',
            sleightOfHand: 'DEX',
            stealth: 'DEX',
            survival: 'WIS'
        };
        return skillAbilities[skill] || 'CHA';
    }

    getConsciousnessBonusForSkill(skill, modifiers) {
        const consciousnessSkillMap = {
            arcana: 'INT',
            investigation: 'INT',
            religion: 'INT',
            insight: 'WIS',
            perception: 'WIS',
            persuasion: 'CHA',
            deception: 'CHA',
            intimidation: 'CHA'
        };

        const ability = consciousnessSkillMap[skill];
        return ability ? modifiers[`${ability}_bonus`] || 0 : 0;
    }

    // Goal Generation System
    generateGoalsByFrequency(npcId) {
        const state = this.consciousnessSystem.getConsciousnessState(npcId);
        if (!state) {
            throw new Error(`No consciousness state found for NPC ${npcId}`);
        }

        const frequency = state.currentFrequency;
        const goals = [];

        if (frequency < 6) {
            goals.push({
                type: "survival",
                priority: 10,
                examples: ["find_food", "secure_shelter", "avoid_danger"],
                skillCheck: { type: "survival", DC: 10 }
            });
        } else if (frequency < 9) {
            goals.push({
                type: "social",
                priority: 7,
                examples: ["make_friend", "help_neighbor", "find_romance"],
                skillCheck: { type: "persuasion", DC: 12 }
            });
        } else if (frequency < 13) {
            goals.push({
                type: "achievement",
                priority: 5,
                examples: ["master_craft", "gain_influence", "lead_group"],
                skillCheck: { type: "varies", DC: 15 }
            });
        } else {
            goals.push({
                type: "transcendent",
                priority: 3,
                examples: ["teach_student", "unite_factions", "discover_truth"],
                skillCheck: { type: "wisdom", DC: 18 }
            });
        }

        return goals;
    }

    // Decision Making System
    makeAutonomousDecision(npcId, context) {
        const state = this.consciousnessSystem.getConsciousnessState(npcId);
        if (!state) {
            throw new Error(`No consciousness state found for NPC ${npcId}`);
        }

        const needs = this.assessNeeds(npcId);
        const actions = this.generateActions(needs, context);
        
        const evaluatedActions = actions.map(action => {
            let score = this.calculateBaseUtility(action, npcId);
            
            if (action.requiredSkill) {
                const skillCheck = this.rollSkillCheck(npcId, action.requiredSkill, action.DC);
                score *= skillCheck.success ? 1.0 : 0.3;
            }
            
            if (action.targetNPC) {
                const resonance = this.calculateResonance(npcId, action.targetNPC);
                score *= (0.5 + resonance);
            }
            
            const emotionalModifier = this.calculateEmotionalInfluence(npcId, action);
            score *= emotionalModifier;
            
            return { action, score };
        });

        return this.selectActionWithVariance(evaluatedActions);
    }

    // Helper Methods
    assessNeeds(npcId) {
        const state = this.consciousnessSystem.getConsciousnessState(npcId);
        return {
            survival: state.currentFrequency < 6 ? 10 : 5,
            social: state.currentFrequency >= 6 && state.currentFrequency < 9 ? 8 : 4,
            achievement: state.currentFrequency >= 9 && state.currentFrequency < 13 ? 6 : 3,
            transcendent: state.currentFrequency >= 13 ? 4 : 1
        };
    }

    generateActions(needs, context) {
        // Implementation would generate possible actions based on needs and context
        return [];
    }

    calculateBaseUtility(action, npcId) {
        // Implementation would calculate base utility of an action
        return 1.0;
    }

    calculateResonance(npcId1, npcId2) {
        const state1 = this.consciousnessSystem.getConsciousnessState(npcId1);
        const state2 = this.consciousnessSystem.getConsciousnessState(npcId2);
        
        if (!state1 || !state2) {
            return 0;
        }

        const frequencyDiff = Math.abs(state1.currentFrequency - state2.currentFrequency);
        return Math.max(0, 1 - (frequencyDiff / 10));
    }

    calculateEmotionalInfluence(npcId, action) {
        const state = this.consciousnessSystem.getConsciousnessState(npcId);
        return state.emotionalCoherence;
    }

    selectActionWithVariance(evaluatedActions) {
        if (!evaluatedActions.length) return null;
        
        // Sort by score and add some randomness
        evaluatedActions.sort((a, b) => b.score - a.score);
        const topActions = evaluatedActions.slice(0, 3);
        
        // Add random variance
        const randomIndex = Math.floor(Math.random() * topActions.length);
        return topActions[randomIndex].action;
    }

    // Proficiency Management
    setProficiency(npcId, skill, isProficient) {
        if (!this.skillProficiencies.has(npcId)) {
            this.skillProficiencies.set(npcId, new Set());
        }
        
        if (isProficient) {
            this.skillProficiencies.get(npcId).add(skill);
        } else {
            this.skillProficiencies.get(npcId).delete(skill);
        }
    }

    isProficient(npcId, skill) {
        return this.skillProficiencies.get(npcId)?.has(skill) || false;
    }
}

module.exports = NPCAutonomySystem; 