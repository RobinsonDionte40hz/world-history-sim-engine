// Political System
class PoliticalSystem {
  constructor(world) {
    this.world = world;
    this.factions = new Map();
    this.courts = new Map();
    this.successionSystems = new Map();
    this.politicalEvents = new Map();
  }

  // Faction Management
  createFaction(config) {
    const faction = {
      id: generateId(),
      name: config.name,
      type: config.type, // kingdom, republic, theocracy, etc.
      government: {
        type: config.governmentType,
        successionType: config.successionType,
        stability: 100,
        corruption: 0
      },
      ruler: config.ruler,
      courtiers: new Map(),
      factions: new Map(),
      resources: {
        gold: config.initialGold || 1000,
        influence: config.initialInfluence || 100,
        military: config.initialMilitary || 100
      },
      collectiveConsciousness: {
        frequency: config.initialFrequency || 7,
        emotionalCoherence: 0.5,
        culturalValues: config.culturalValues || []
      }
    };

    this.factions.set(faction.id, faction);
    this.initializeCourt(faction);
    this.initializeSuccessionSystem(faction);

    return faction;
  }

  // Court Management
  initializeCourt(faction) {
    const court = {
      id: generateId(),
      faction: faction.id,
      courtiers: new Map(),
      factions: new Map(),
      intrigues: [],
      events: []
    };

    this.courts.set(faction.id, court);
    return court;
  }

  generateCourtier(template) {
    return {
      id: generateId(),
      ...template,
      position: this.assignPosition(template),
      influence: this.calculateInitialInfluence(template),
      loyalty: 50 + Math.random() * 30,
      ambition: template.personality.ambition,
      secretAgenda: this.generateSecretAgenda(template),
      skills: {
        intrigue: template.attributes.INT + template.attributes.CHA,
        administration: template.attributes.INT + template.attributes.WIS,
        diplomacy: template.attributes.CHA + template.attributes.WIS
      },
      relationships: new Map(),
      secrets: [],
      favors: { owed: [], owned: [] }
    };
  }

  assignPosition(courtier) {
    const positions = [
      'advisor',
      'chamberlain',
      'marshal',
      'treasurer',
      'spymaster',
      'courtier'
    ];

    // Assign based on skills and attributes
    if (courtier.skills.administration > 15) return 'chamberlain';
    if (courtier.skills.intrigue > 15) return 'spymaster';
    if (courtier.attributes.STR > 15) return 'marshal';
    if (courtier.attributes.INT > 15) return 'advisor';
    if (courtier.attributes.WIS > 15) return 'treasurer';

    return 'courtier';
  }

  calculateInitialInfluence(template) {
    const baseInfluence = 10;
    const attributeBonus = Math.floor((template.attributes.CHA - 10) / 2);
    const skillBonus = Math.floor((template.skills.diplomacy || 0) / 2);
    const consciousnessBonus = Math.floor((template.consciousness.currentFrequency - 7) / 3);

    return baseInfluence + attributeBonus + skillBonus + consciousnessBonus;
  }

  generateSecretAgenda(courtier) {
    const frequency = courtier.consciousness.currentFrequency;
    const ambition = courtier.personality.ambition;

    if (frequency < 6 && ambition > 0.7) {
      return {
        type: 'desperate_power_grab',
        goal: 'seize_control',
        methods: ['blackmail', 'assassination', 'coup']
      };
    } else if (frequency > 12 && ambition > 0.5) {
      return {
        type: 'reform_kingdom',
        goal: 'transform_society',
        methods: ['influence', 'education', 'peaceful_revolution']
      };
    } else if (ambition > 0.8) {
      return {
        type: 'personal_advancement',
        goal: 'become_advisor',
        methods: ['networking', 'competence', 'modest_scheming']
      };
    }

    return null;
  }

  // Succession System
  initializeSuccessionSystem(faction) {
    const successionSystem = {
      faction: faction.id,
      successionType: faction.government.successionType,
      currentRuler: faction.ruler,
      heirs: [],
      electors: [],
      successionCrisis: null
    };

    this.successionSystems.set(faction.id, successionSystem);
    return successionSystem;
  }

  determineSuccession(factionId, deceasedRuler) {
    const successionSystem = this.successionSystems.get(factionId);
    if (!successionSystem) return null;

    switch (successionSystem.successionType) {
      case 'hereditary':
        return this.hereditarySuccession(successionSystem, deceasedRuler);
      case 'elective':
        return this.electiveSuccession(successionSystem, deceasedRuler);
      case 'meritocratic':
        return this.meritocraticSuccession(successionSystem, deceasedRuler);
      case 'consciousness':
        return this.consciousnessSuccession(successionSystem, deceasedRuler);
      default:
        return null;
    }
  }

  hereditarySuccession(successionSystem, ruler) {
    const directHeirs = this.findDirectHeirs(ruler);

    if (directHeirs.length === 0) {
      return this.createSuccessionCrisis(successionSystem, 'no_heir');
    }

    if (directHeirs.length === 1) {
      return {
        successor: directHeirs[0],
        legitimacy: 1.0,
        opposition: []
      };
    }

    const claims = directHeirs.map(heir => ({
      claimant: heir,
      strength: this.calculateClaimStrength(heir),
      supporters: this.gatherSupporters(heir)
    }));

    return this.resolveCompetingClaims(claims);
  }

  electiveSuccession(successionSystem, ruler) {
    const electors = this.gatherElectors(successionSystem);
    const candidates = this.gatherCandidates(successionSystem);

    const campaign = {
      duration: 30,
      events: [],
      candidateActions: new Map()
    };

    candidates.forEach(candidate => {
      const actions = this.generateCampaignActions(candidate);
      campaign.candidateActions.set(candidate.id, actions);
    });

    for (let day = 0; day < campaign.duration; day++) {
      const dailyEvents = this.generateDailyCampaignEvents(candidates, electors);
      campaign.events.push(...dailyEvents);
      this.updateElectorPreferences(electors, dailyEvents);
    }

    return this.conductElection(electors, candidates);
  }

  meritocraticSuccession(successionSystem, ruler) {
    const candidates = this.gatherMeritocraticCandidates(successionSystem);
    
    return candidates.reduce((best, current) => {
      const currentScore = this.calculateMeritScore(current);
      const bestScore = best ? this.calculateMeritScore(best) : 0;
      return currentScore > bestScore ? current : best;
    }, null);
  }

  consciousnessSuccession(successionSystem, ruler) {
    const candidates = this.gatherConsciousnessCandidates(successionSystem);
    
    return candidates.reduce((best, current) => {
      const currentScore = this.calculateConsciousnessScore(current);
      const bestScore = best ? this.calculateConsciousnessScore(best) : 0;
      return currentScore > bestScore ? current : best;
    }, null);
  }

  // Court Politics
  simulateCourtDay(factionId) {
    const court = this.courts.get(factionId);
    if (!court) return [];

    const events = [];

    // Morning: Audiences and petitions
    events.push(...this.simulateAudiences(court));

    // Afternoon: Council meetings
    events.push(...this.simulateCouncilMeetings(court));

    // Evening: Social gatherings and intrigue
    events.push(...this.simulateCourtIntrigue(court));

    // Process relationship changes
    this.updateCourtRelationships(court, events);

    // Check for plot advancement
    this.advancePlots(court);

    return events;
  }

  simulateAudiences(court) {
    const events = [];
    const petitions = this.generatePetitions(court);

    petitions.forEach(petition => {
      const decision = this.processPetition(court, petition);
      events.push({
        type: 'petition_resolved',
        petition,
        decision,
        timestamp: this.world.currentTime
      });
    });

    return events;
  }

  simulateCouncilMeetings(court) {
    const events = [];
    const issues = this.generateCouncilIssues(court);

    issues.forEach(issue => {
      const debate = {
        issue: issue,
        positions: new Map(),
        outcome: null
      };

      court.courtiers.forEach(councilor => {
        const position = this.determinePosition(councilor, issue);
        debate.positions.set(councilor.id, position);

        const skillCheck = this.rollPoliticalSkill(councilor, 'diplomacy');
        position.influence = skillCheck.total;
      });

      debate.outcome = this.rulerDecision(court.faction, debate);
      this.applyPoliticalConsequences(debate);

      events.push(debate);
    });

    return events;
  }

  simulateCourtIntrigue(court) {
    const events = [];

    court.courtiers.forEach(courtier => {
      if (Math.random() < courtier.ambition * 0.1) {
        const intrigue = this.generateIntrigue(courtier);

        if (intrigue) {
          const skillCheck = this.rollPoliticalSkill(courtier, 'intrigue');

          if (skillCheck.success) {
            intrigue.status = 'in_progress';
            court.intrigues.push(intrigue);

            const targets = intrigue.targets;
            targets.forEach(target => {
              const awareness = this.rollPoliticalSkill(target, 'intrigue');
              if (awareness.total > skillCheck.total) {
                intrigue.discovered = true;
                intrigue.discoveredBy = target.id;
              }
            });
          }

          events.push({
            type: 'intrigue_attempt',
            courtier: courtier.id,
            intrigue: intrigue,
            success: skillCheck.success
          });
        }
      }
    });

    return events;
  }

  // Utility Methods
  rollPoliticalSkill(character, skillType) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const skill = character.skills[skillType] || 0;
    const consciousnessBonus = this.getConsciousnessBonus(character, skillType);

    const total = roll + skill + consciousnessBonus;

    return {
      roll,
      skill,
      consciousnessBonus,
      total,
      success: total >= 15,
      criticalSuccess: roll === 20,
      criticalFailure: roll === 1
    };
  }

  getConsciousnessBonus(character, skillType) {
    const frequency = character.consciousness.currentFrequency;
    const coherence = character.consciousness.emotionalCoherence;

    switch (skillType) {
      case 'intrigue':
        return frequency >= 7 && frequency <= 11 ? 2 : 0;
      case 'diplomacy':
        return Math.floor((frequency - 7) / 3) + Math.floor(coherence * 2);
      case 'administration':
        return Math.floor(coherence * 3);
      default:
        return 0;
    }
  }

  calculateClaimStrength(claimant) {
    let strength = 0;

    strength += (10 - claimant.birthOrder) * 10;
    strength += claimant.attributes.CHA;
    strength += claimant.attributes.INT / 2;

    if (claimant.consciousness.currentFrequency > 10) {
      strength += 20;
    }

    strength += claimant.loyalTroops * 0.1;
    strength += claimant.popularSupport;

    return strength;
  }

  calculateMeritScore(candidate) {
    return candidate.skills.administration * 0.4 +
           candidate.skills.diplomacy * 0.3 +
           candidate.skills.intrigue * 0.3 +
           (candidate.consciousness.currentFrequency - 7) * 2;
  }

  calculateConsciousnessScore(candidate) {
    return candidate.consciousness.currentFrequency * 10 +
           candidate.consciousness.emotionalCoherence * 20 +
           candidate.attributes.WIS * 2;
  }

  generateCampaignActions(candidate) {
    const actions = [];

    if (candidate.consciousness.currentFrequency > 12) {
      actions.push({
        type: 'inspiring_speech',
        skillCheck: { skill: 'performance', DC: 15 },
        effects: {
          success: { popularSupport: '+2d6', electorSway: 3 },
          failure: { popularSupport: '-1d4' }
        }
      });
    }

    if (candidate.attributes.CHA > 15) {
      actions.push({
        type: 'private_negotiations',
        target: 'specific_elector',
        skillCheck: { skill: 'persuasion', DC: 14 },
        effects: {
          success: { electorLoyalty: '+20', bribeCost: 500 },
          failure: { reputation: '-5' }
        }
      });
    }

    return actions;
  }

  generateIntrigue(courtier) {
    if (!courtier.secretAgenda) return null;

    const targets = this.findIntrigueTargets(courtier);
    if (targets.length === 0) return null;

    return {
      id: generateId(),
      type: courtier.secretAgenda.type,
      goal: courtier.secretAgenda.goal,
      conspirators: [courtier.id],
      targets: targets.map(t => t.id),
      progress: 0,
      status: 'planning',
      discovered: false,
      discoveredBy: null
    };
  }

  findIntrigueTargets(courtier) {
    const court = this.courts.get(courtier.faction);
    if (!court) return [];

    return Array.from(court.courtiers.values())
      .filter(target => 
        target.id !== courtier.id &&
        this.isValidIntrigueTarget(courtier, target)
      );
  }

  isValidIntrigueTarget(courtier, target) {
    const relationship = courtier.relationships.get(target.id);
    return !relationship || relationship.trust < 50;
  }

  advancePlots(court) {
    court.intrigues.forEach(intrigue => {
      if (intrigue.status === 'in_progress' && !intrigue.discovered) {
        intrigue.progress += this.calculatePlotProgress(intrigue);
        
        if (intrigue.progress >= 100) {
          this.resolvePlot(intrigue);
        }
      }
    });
  }

  calculatePlotProgress(intrigue) {
    const baseProgress = 5;
    const skillBonus = intrigue.conspirators.reduce((total, c) => 
      total + c.skills.intrigue, 0) / intrigue.conspirators.length;
    const consciousnessBonus = intrigue.conspirators.reduce((total, c) =>
      total + (c.consciousness.currentFrequency - 7) / 3, 0) / intrigue.conspirators.length;

    return baseProgress + skillBonus + consciousnessBonus;
  }

  resolvePlot(intrigue) {
    const success = this.determinePlotSuccess(intrigue);
    
    if (success) {
      this.applyPlotSuccess(intrigue);
    } else {
      this.applyPlotFailure(intrigue);
    }

    intrigue.status = 'completed';
  }

  determinePlotSuccess(intrigue) {
    const totalSkill = intrigue.conspirators.reduce((total, c) => 
      total + c.skills.intrigue, 0);
    const averageConsciousness = intrigue.conspirators.reduce((total, c) =>
      total + c.consciousness.currentFrequency, 0) / intrigue.conspirators.length;

    return totalSkill > 50 && averageConsciousness > 8;
  }

  applyPlotSuccess(intrigue) {
    const faction = this.factions.get(intrigue.conspirators[0].faction);
    if (!faction) return;

    switch (intrigue.goal) {
      case 'seize_control':
        this.handlePowerSeizure(intrigue, faction);
        break;
      case 'transform_society':
        this.handleSocietyTransformation(intrigue, faction);
        break;
      case 'become_advisor':
        this.handleAdvisorPromotion(intrigue, faction);
        break;
    }
  }

  applyPlotFailure(intrigue) {
    intrigue.conspirators.forEach(conspiratorId => {
      const courtier = this.findCourtier(conspiratorId);
      if (courtier) {
        courtier.influence *= 0.5;
        courtier.loyalty -= 20;
      }
    });
  }

  handlePowerSeizure(intrigue, faction) {
    const conspirator = this.findCourtier(intrigue.conspirators[0]);
    if (!conspirator) return;

    // Remove current ruler
    faction.ruler = null;

    // Install new ruler
    faction.ruler = conspirator;
    conspirator.position = 'ruler';

    // Update government stability
    faction.government.stability -= 30;
  }

  handleSocietyTransformation(intrigue, faction) {
    // Increase consciousness frequency
    faction.collectiveConsciousness.frequency += 1;

    // Update cultural values
    faction.collectiveConsciousness.culturalValues.push(
      this.generateNewCulturalValue()
    );

    // Improve government stability
    faction.government.stability += 10;
  }

  handleAdvisorPromotion(intrigue, faction) {
    const conspirator = this.findCourtier(intrigue.conspirators[0]);
    if (!conspirator) return;

    conspirator.position = 'advisor';
    conspirator.influence *= 1.5;
  }

  findCourtier(courtierId) {
    for (const court of this.courts.values()) {
      const courtier = court.courtiers.get(courtierId);
      if (courtier) return courtier;
    }
    return null;
  }

  generateNewCulturalValue() {
    const values = [
      'enlightenment',
      'progress',
      'harmony',
      'wisdom',
      'innovation'
    ];

    return values[Math.floor(Math.random() * values.length)];
  }
}

export default PoliticalSystem; 