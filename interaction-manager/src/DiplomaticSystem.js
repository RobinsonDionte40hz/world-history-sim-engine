// Diplomatic System
class DiplomaticSystem {
  constructor(world) {
    this.world = world;
    this.relationships = new Map();
    this.treaties = new Map();
    this.embassies = new Map();
    this.negotiations = new Map();
  }

  // Relationship Management
  getRelationshipState(faction1, faction2) {
    const key = this.getRelationshipKey(faction1, faction2);
    return this.relationships.get(key) || this.createNewRelationship(faction1, faction2);
  }

  createNewRelationship(faction1, faction2) {
    const relationship = {
      status: 'neutral',
      opinion: 0,
      trust: 0,
      culturalUnderstanding: this.calculateCulturalAffinity(faction1, faction2),
      tradeVolume: 0,
      historicalGrievances: [],
      sharedVictories: [],
      consciousnessResonance: this.calculateFactionResonance(faction1, faction2)
    };

    const key = this.getRelationshipKey(faction1, faction2);
    this.relationships.set(key, relationship);

    return relationship;
  }

  getRelationshipKey(faction1, faction2) {
    return [faction1.id, faction2.id].sort().join('_');
  }

  calculateCulturalAffinity(faction1, faction2) {
    const baseAffinity = 0.5;
    const cultureBonus = this.calculateCultureSimilarity(faction1, faction2);
    const consciousnessBonus = this.calculateConsciousnessAlignment(faction1, faction2);

    return Math.min(1, baseAffinity + cultureBonus + consciousnessBonus);
  }

  calculateCultureSimilarity(faction1, faction2) {
    const similarities = [
      this.compareCultureTraits(faction1, faction2),
      this.compareReligiousBeliefs(faction1, faction2),
      this.compareSocialStructures(faction1, faction2)
    ];

    return similarities.reduce((sum, val) => sum + val, 0) / similarities.length;
  }

  calculateConsciousnessAlignment(faction1, faction2) {
    const freq1 = faction1.collectiveConsciousness.frequency;
    const freq2 = faction2.collectiveConsciousness.frequency;
    const difference = Math.abs(freq1 - freq2);

    if (difference < 2) return 0.3;
    if (difference < 5) return 0.1;
    if (difference < 10) return 0;
    return -0.2;
  }

  calculateFactionResonance(faction1, faction2) {
    const freq1 = faction1.collectiveConsciousness.frequency;
    const freq2 = faction2.collectiveConsciousness.frequency;
    const difference = Math.abs(freq1 - freq2);

    if (difference < 2) return { level: 'harmonious', bonus: 0.3 };
    if (difference < 5) return { level: 'compatible', bonus: 0.1 };
    if (difference < 10) return { level: 'neutral', bonus: 0 };
    return { level: 'discordant', bonus: -0.2 };
  }

  // Treaty System
  negotiateTreaty(proposingFaction, receivingFaction, treatyType) {
    const treaty = {
      id: generateId(),
      type: treatyType,
      parties: [proposingFaction.id, receivingFaction.id],
      terms: this.generateTreatyTerms(treatyType),
      duration: null,
      signatures: []
    };

    const negotiation = {
      rounds: [],
      currentTerms: [...treaty.terms],
      proposerLeverage: this.calculateLeverage(proposingFaction, receivingFaction),
      receiverLeverage: this.calculateLeverage(receivingFaction, proposingFaction)
    };

    // Multi-round negotiation
    for (let round = 0; round < 5; round++) {
      const proposerRoll = this.diplomaticSkillCheck(proposingFaction.diplomat);
      const receiverRoll = this.diplomaticSkillCheck(receivingFaction.diplomat);

      if (proposerRoll.total > receiverRoll.total) {
        negotiation.currentTerms = this.modifyTermsInFavor(
          negotiation.currentTerms,
          proposingFaction,
          proposerRoll.total - receiverRoll.total
        );
      } else {
        negotiation.currentTerms = this.modifyTermsInFavor(
          negotiation.currentTerms,
          receivingFaction,
          receiverRoll.total - proposerRoll.total
        );
      }

      negotiation.rounds.push({
        proposerRoll,
        receiverRoll,
        currentTerms: [...negotiation.currentTerms]
      });

      if (this.isUnacceptable(negotiation.currentTerms, proposingFaction) ||
          this.isUnacceptable(negotiation.currentTerms, receivingFaction)) {
        treaty.status = 'failed';
        break;
      }
    }

    if (treaty.status !== 'failed') {
      treaty.finalTerms = negotiation.currentTerms;
      treaty.status = 'signed';
      treaty.signatures = [
        { faction: proposingFaction.id, diplomat: proposingFaction.diplomat.id, time: this.world.currentTime },
        { faction: receivingFaction.id, diplomat: receivingFaction.diplomat.id, time: this.world.currentTime }
      ];

      this.treaties.set(treaty.id, treaty);
    }

    return treaty;
  }

  diplomaticSkillCheck(diplomat) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const charismaBonus = Math.floor((diplomat.attributes.CHA - 10) / 2);
    const wisdomBonus = Math.floor((diplomat.attributes.WIS - 10) / 2);
    const consciousnessBonus = diplomat.consciousness.currentFrequency > 10 ? 2 : 0;
    const coherenceBonus = Math.floor(diplomat.consciousness.emotionalCoherence * 3);

    return {
      roll,
      total: roll + charismaBonus + wisdomBonus + consciousnessBonus + coherenceBonus + diplomat.diplomacySkill,
      criticalSuccess: roll === 20,
      criticalFailure: roll === 1
    };
  }

  calculateLeverage(faction1, faction2) {
    const militaryLeverage = this.calculateMilitaryLeverage(faction1, faction2);
    const economicLeverage = this.calculateEconomicLeverage(faction1, faction2);
    const diplomaticLeverage = this.calculateDiplomaticLeverage(faction1, faction2);
    const consciousnessLeverage = this.calculateConsciousnessLeverage(faction1, faction2);

    return (militaryLeverage * 0.4 + 
            economicLeverage * 0.3 + 
            diplomaticLeverage * 0.2 + 
            consciousnessLeverage * 0.1);
  }

  calculateMilitaryLeverage(faction1, faction2) {
    const ratio = faction1.military / faction2.military;
    return Math.min(2, Math.max(0.5, ratio));
  }

  calculateEconomicLeverage(faction1, faction2) {
    const ratio = faction1.economy / faction2.economy;
    return Math.min(2, Math.max(0.5, ratio));
  }

  calculateDiplomaticLeverage(faction1, faction2) {
    const allies1 = this.countAllies(faction1);
    const allies2 = this.countAllies(faction2);
    const ratio = allies1 / allies2;
    return Math.min(2, Math.max(0.5, ratio));
  }

  calculateConsciousnessLeverage(faction1, faction2) {
    const freq1 = faction1.collectiveConsciousness.frequency;
    const freq2 = faction2.collectiveConsciousness.frequency;
    return freq1 > freq2 ? 1.2 : 0.8;
  }

  generateTreatyTerms(treatyType) {
    const terms = [];

    switch (treatyType) {
      case 'trade_agreement':
        terms.push(
          { type: 'trade_route', value: true },
          { type: 'tariff_reduction', value: 0.2 },
          { type: 'market_access', value: 'mutual' }
        );
        break;
      case 'military_alliance':
        terms.push(
          { type: 'military_cooperation', value: true },
          { type: 'shared_intelligence', value: true },
          { type: 'mutual_defense', value: true }
        );
        break;
      case 'non_aggression':
        terms.push(
          { type: 'no_war', value: true },
          { type: 'border_respect', value: true },
          { type: 'diplomatic_consultation', value: true }
        );
        break;
      case 'vassalage':
        terms.push(
          { type: 'tribute', value: 0.2 },
          { type: 'military_service', value: true },
          { type: 'autonomy_level', value: 'limited' }
        );
        break;
    }

    return terms;
  }

  modifyTermsInFavor(terms, faction, margin) {
    return terms.map(term => {
      const modifiedTerm = { ...term };
      
      switch (term.type) {
        case 'tariff_reduction':
          modifiedTerm.value = Math.min(0.5, term.value + (margin * 0.01));
          break;
        case 'tribute':
          modifiedTerm.value = Math.max(0.1, term.value - (margin * 0.01));
          break;
        case 'autonomy_level':
          if (margin > 10) {
            modifiedTerm.value = 'full';
          } else if (margin > 5) {
            modifiedTerm.value = 'significant';
          }
          break;
      }

      return modifiedTerm;
    });
  }

  isUnacceptable(terms, faction) {
    return terms.some(term => {
      switch (term.type) {
        case 'tariff_reduction':
          return term.value > 0.5;
        case 'tribute':
          return term.value > 0.3;
        case 'autonomy_level':
          return term.value === 'none';
        default:
          return false;
      }
    });
  }

  // Diplomatic Actions
  availableActions(actingFaction, targetFaction, relationship) {
    const actions = [];

    // Basic actions always available
    actions.push({
      id: 'send_envoy',
      name: 'Send Diplomatic Envoy',
      cost: { gold: 100, influence: 5 },
      skillCheck: { skill: 'persuasion', DC: 10 },
      effects: { opinion: '+1d6', trust: '+1d4' }
    });

    // Conditional actions based on relationship
    if (relationship.opinion > 25) {
      actions.push({
        id: 'propose_trade_agreement',
        name: 'Propose Trade Agreement',
        requirements: { trust: 20 },
        skillCheck: { skill: 'persuasion', DC: 12 },
        effects: { 
          tradeRoute: true, 
          monthlyGold: '+10%',
          opinion: '+5'
        }
      });
    }

    if (relationship.opinion > 50 && relationship.trust > 40) {
      actions.push({
        id: 'propose_alliance',
        name: 'Propose Military Alliance',
        requirements: { 
          noCurrentAlliances: true,
          minimumMilitary: 100
        },
        skillCheck: { skill: 'persuasion', DC: 18 },
        effects: { 
          alliance: true,
          sharedMilitary: true,
          opinion: '+20'
        }
      });
    }

    // Consciousness-based diplomatic options
    if (actingFaction.collectiveConsciousness.frequency > 12) {
      actions.push({
        id: 'cultural_exchange',
        name: 'Propose Cultural Exchange',
        requirements: { consciousnessResonance: 'compatible' },
        effects: {
          culturalUnderstanding: '+15',
          collectiveFrequencyInfluence: true,
          unlockSpecialTech: 0.3
        }
      });
    }

    // Hostile actions
    if (relationship.opinion < -25) {
      actions.push({
        id: 'trade_embargo',
        name: 'Impose Trade Embargo',
        requirements: { tradeInfluence: 30 },
        effects: {
          targetEconomicDamage: '-20%',
          opinion: '-15',
          internationalReputation: '-5'
        }
      });
    }

    return actions;
  }

  executeDiplomaticAction(action, actingFaction, targetFaction) {
    // Check requirements
    if (!this.checkActionRequirements(action, actingFaction, targetFaction)) {
      return {
        success: false,
        message: 'Requirements not met'
      };
    }

    // Perform skill check
    const skillCheck = this.performDiplomaticSkillCheck(
      actingFaction.diplomat,
      action.skillCheck
    );

    if (!skillCheck.success) {
      return {
        success: false,
        message: 'Diplomatic action failed',
        skillCheck
      };
    }

    // Apply effects
    const effects = this.applyDiplomaticEffects(
      action.effects,
      actingFaction,
      targetFaction,
      skillCheck
    );

    // Update relationship
    this.updateRelationship(actingFaction, targetFaction, effects);

    return {
      success: true,
      effects,
      skillCheck
    };
  }

  checkActionRequirements(action, actingFaction, targetFaction) {
    if (!action.requirements) return true;

    const relationship = this.getRelationshipState(actingFaction, targetFaction);

    return Object.entries(action.requirements).every(([key, value]) => {
      switch (key) {
        case 'trust':
          return relationship.trust >= value;
        case 'noCurrentAlliances':
          return !this.hasActiveAlliance(actingFaction);
        case 'minimumMilitary':
          return actingFaction.military >= value;
        case 'consciousnessResonance':
          return relationship.consciousnessResonance.level === value;
        case 'tradeInfluence':
          return this.calculateTradeInfluence(actingFaction) >= value;
        default:
          return true;
      }
    });
  }

  performDiplomaticSkillCheck(diplomat, check) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const skill = diplomat.skills[check.skill] || 0;
    const consciousnessBonus = Math.floor((diplomat.consciousness.currentFrequency - 7) / 3);

    const total = roll + skill + consciousnessBonus;

    return {
      roll,
      total,
      success: total >= check.DC,
      criticalSuccess: roll === 20,
      criticalFailure: roll === 1
    };
  }

  applyDiplomaticEffects(effects, actingFaction, targetFaction, skillCheck) {
    const appliedEffects = {};

    Object.entries(effects).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('+')) {
        // Handle dice roll effects
        const [dice, sides] = value.slice(1).split('d').map(Number);
        let total = 0;
        for (let i = 0; i < dice; i++) {
          total += Math.floor(Math.random() * sides) + 1;
        }
        appliedEffects[key] = total;
      } else {
        appliedEffects[key] = value;
      }
    });

    // Apply critical success/failure modifiers
    if (skillCheck.criticalSuccess) {
      Object.keys(appliedEffects).forEach(key => {
        if (typeof appliedEffects[key] === 'number') {
          appliedEffects[key] *= 1.5;
        }
      });
    } else if (skillCheck.criticalFailure) {
      Object.keys(appliedEffects).forEach(key => {
        if (typeof appliedEffects[key] === 'number') {
          appliedEffects[key] *= 0.5;
        }
      });
    }

    return appliedEffects;
  }

  updateRelationship(faction1, faction2, effects) {
    const relationship = this.getRelationshipState(faction1, faction2);

    Object.entries(effects).forEach(([key, value]) => {
      switch (key) {
        case 'opinion':
          relationship.opinion = Math.max(-100, Math.min(100, relationship.opinion + value));
          break;
        case 'trust':
          relationship.trust = Math.max(0, Math.min(100, relationship.trust + value));
          break;
        case 'culturalUnderstanding':
          relationship.culturalUnderstanding = Math.min(1, relationship.culturalUnderstanding + value / 100);
          break;
      }
    });

    // Update relationship status
    this.updateRelationshipStatus(relationship);
  }

  updateRelationshipStatus(relationship) {
    if (relationship.opinion >= 75 && relationship.trust >= 75) {
      relationship.status = 'allied';
    } else if (relationship.opinion >= 50 && relationship.trust >= 50) {
      relationship.status = 'friendly';
    } else if (relationship.opinion >= 25 && relationship.trust >= 25) {
      relationship.status = 'warm';
    } else if (relationship.opinion <= -50 && relationship.trust <= 20) {
      relationship.status = 'hostile';
    } else if (relationship.opinion <= -25 && relationship.trust <= 40) {
      relationship.status = 'cold';
    } else {
      relationship.status = 'neutral';
    }
  }

  // Utility methods
  hasActiveAlliance(faction) {
    return Array.from(this.treaties.values()).some(treaty => 
      treaty.type === 'military_alliance' && 
      treaty.parties.includes(faction.id) &&
      treaty.status === 'active'
    );
  }

  calculateTradeInfluence(faction) {
    const tradeRoutes = Array.from(this.world.marketSystem.tradeRoutes.values())
      .filter(route => route.parties.includes(faction.id));
    
    return tradeRoutes.reduce((total, route) => 
      total + route.profitability, 0);
  }

  countAllies(faction) {
    return Array.from(this.treaties.values()).filter(treaty => 
      treaty.type === 'military_alliance' && 
      treaty.parties.includes(faction.id) &&
      treaty.status === 'active'
    ).length;
  }
}

export default DiplomaticSystem; 