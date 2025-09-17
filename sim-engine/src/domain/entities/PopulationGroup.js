/**
 * Population Group Entity
 *
 * Represents a statistical group of background-tier characters in the LOD system.
 * Provides aggregate behavior modeling and individual sampling capabilities.
 */

class PopulationGroup {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Group';
    this.type = config.type || 'citizens'; // 'merchants', 'artisans', 'guards', etc.
    this.settlementId = config.settlementId;
    this.nodeId = config.nodeId;

    // Population Statistics
    this.size = config.size || 10;
    this.averageAge = config.averageAge || 30;
    this.genderRatio = config.genderRatio || 0.5; // 0-1, male to female ratio

    // Aggregate Characteristics
    this.averageAttributes = config.averageAttributes || {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10
    };
    this.dominantPersonality = config.dominantPersonality || {};
    this.groupCohesion = config.groupCohesion || 0.5; // 0-1 scale

    // Economic Data
    this.averageWealth = config.averageWealth || 0;
    this.occupation = config.occupation || 'general';
    this.productivity = config.productivity || 1.0;
    this.skillLevel = config.skillLevel || 1; // 1-10 scale

    // Behavioral Patterns
    this.activityPatterns = config.activityPatterns || {};
    this.socialTendencies = config.socialTendencies || {};
    this.politicalLeanings = config.politicalLeanings || { law: 0, good: 0 };

    // Group State
    this.morale = config.morale || 0.5; // 0-1 scale
    this.satisfaction = config.satisfaction || 0.5;
    this.currentNeeds = config.currentNeeds || {};
    this.recentEvents = config.recentEvents || [];

    // Representative Characters
    this.representatives = new Set(config.representativeIds || []); // Hero NPCs from this group
    this.lastRepresentativeUpdate = config.lastRepresentativeUpdate || null;

    // Statistical Tracking
    this.demographicTrends = config.demographicTrends || {};
    this.behaviorHistory = config.behaviorHistory || [];
    this.lastStatisticalUpdate = config.lastStatisticalUpdate || Date.now();
  }

  /**
   * Generate a unique ID for the population group
   */
  _generateId() {
    return `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate individual character from group statistics
   */
  generateIndividual(template = {}) {
    // Apply normal distribution around group averages
    const individualData = {
      id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: template.name || this._generateIndividualName(),
      age: this._generateNormalVariation(this.averageAge, 5),
      gender: Math.random() < this.genderRatio ? 'male' : 'female',
      populationGroupId: this.id,
      lodTier: 'group',
      attributes: this._generateAttributeVariation(),
      wealth: Math.max(0, this._generateNormalVariation(this.averageWealth, this.averageWealth * 0.3)),
      occupation: template.occupation || this.occupation,
      settlementLoyalty: { [this.settlementId]: this.morale },
      crossSettlementReputation: {},
      settlementSpecificPrestige: {},
      consciousness: {
        frequency: 0.5 + Math.random() * 0.3, // 0.5-0.8
        coherence: 0.4 + Math.random() * 0.4   // 0.4-0.8
      },
      assignments: {
        nodes: [this.nodeId],
        interactions: [],
        settlements: [this.settlementId]
      },
      personality: { ...this.dominantPersonality },
      relationships: {},
      memory: [],
      needs: { ...this.currentNeeds },
      skills: this._generateSkills(),
      ...template
    };

    return individualData;
  }

  /**
   * Generate normal distribution variation around a mean
   */
  _generateNormalVariation(mean, stdDev) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.round(mean + z0 * stdDev);
  }

  /**
   * Generate attribute variation
   */
  _generateAttributeVariation() {
    const attributes = {};
    Object.entries(this.averageAttributes).forEach(([attr, base]) => {
      attributes[attr] = Math.max(1, Math.min(20, this._generateNormalVariation(base, 2)));
    });
    return attributes;
  }

  /**
   * Generate skills based on group characteristics
   */
  _generateSkills() {
    const skills = {};
    const skillCount = Math.max(1, Math.floor(this.skillLevel / 2));

    for (let i = 0; i < skillCount; i++) {
      const skillName = this._getRandomSkill();
      skills[skillName] = Math.max(1, this._generateNormalVariation(this.skillLevel * 2, 1));
    }

    return skills;
  }

  /**
   * Get random skill name
   */
  _getRandomSkill() {
    const skills = [
      'crafting', 'trading', 'combat', 'farming', 'mining',
      'building', 'healing', 'teaching', 'leadership', 'diplomacy'
    ];
    return skills[Math.floor(Math.random() * skills.length)];
  }

  /**
   * Generate individual name
   */
  _generateIndividualName() {
    const firstNames = {
      male: ['John', 'William', 'James', 'Thomas', 'Robert', 'Edward', 'Henry', 'Charles', 'George', 'Arthur'],
      female: ['Mary', 'Elizabeth', 'Margaret', 'Sarah', 'Anna', 'Emma', 'Florence', 'Ethel', 'Clara', 'Alice']
    };

    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    const gender = Math.random() < this.genderRatio ? 'male' : 'female';
    const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
  }

  /**
   * Update group statistics from member data
   */
  updateFromMembers(members) {
    if (!members || members.length === 0) return;

    // Update size
    this.size = members.length;

    // Update average age
    this.averageAge = members.reduce((sum, m) => sum + (m.age || 30), 0) / members.length;

    // Update average wealth
    this.averageWealth = members.reduce((sum, m) => sum + (m.wealth || 0), 0) / members.length;

    // Update morale (simplified)
    this.morale = members.reduce((sum, m) => sum + (m.morale || 0.5), 0) / members.length;

    // Update attributes
    Object.keys(this.averageAttributes).forEach(attr => {
      this.averageAttributes[attr] = members.reduce((sum, m) => sum + (m.attributes[attr] || 10), 0) / members.length;
    });

    this.lastStatisticalUpdate = Date.now();
  }

  /**
   * Process group turn
   */
  processTurn(world, turnContext = {}) {
    // Update morale based on world conditions
    this._updateMorale(world, turnContext);

    // Process needs
    this._processNeeds(world);

    // Generate events
    const events = this._generateEvents(world, turnContext);

    // Update demographics
    this._updateDemographics();

    // Record behavior
    this.behaviorHistory.push({
      turn: world.turn,
      morale: this.morale,
      satisfaction: this.satisfaction,
      events: events.length
    });

    // Keep only recent history
    if (this.behaviorHistory.length > 10) {
      this.behaviorHistory = this.behaviorHistory.slice(-10);
    }

    this.lastStatisticalUpdate = Date.now();

    return events;
  }

  /**
   * Update group morale
   */
  _updateMorale(world, turnContext) {
    let moraleChange = 0;

    // Economic conditions
    if (turnContext.economicConditions === 'booming') {
      moraleChange += 0.1;
    } else if (turnContext.economicConditions === 'recession') {
      moraleChange -= 0.1;
    }

    // Seasonal effects
    if (turnContext.season === 'summer') {
      moraleChange += 0.05;
    } else if (turnContext.season === 'winter') {
      moraleChange -= 0.05;
    }

    // Events
    if (turnContext.events) {
      if (turnContext.events.includes('festival')) {
        moraleChange += 0.15;
      }
      if (turnContext.events.includes('tax_collection')) {
        moraleChange -= 0.1;
      }
    }

    // Apply change with bounds
    this.morale = Math.max(0, Math.min(1, this.morale + moraleChange));
  }

  /**
   * Process group needs
   */
  _processNeeds(world) {
    // Update satisfaction based on needs fulfillment
    let satisfactionChange = 0;

    Object.entries(this.currentNeeds).forEach(([need, level]) => {
      if (level > 0.7) {
        satisfactionChange -= 0.1; // Unmet needs reduce satisfaction
      } else if (level < 0.3) {
        satisfactionChange += 0.05; // Well-met needs increase satisfaction
      }
    });

    this.satisfaction = Math.max(0, Math.min(1, this.satisfaction + satisfactionChange));
  }

  /**
   * Generate group events
   */
  _generateEvents(world, turnContext) {
    const events = [];

    // Low morale events
    if (this.morale < 0.3) {
      events.push({
        id: `event-${Date.now()}-low-morale`,
        type: 'group_dissatisfaction',
        significance: 2,
        description: `${this.name} shows signs of widespread dissatisfaction`,
        participants: [this.id],
        consequences: [{ type: 'productivity_decrease', value: -0.2 }]
      });
    }

    // High morale events
    if (this.morale > 0.8 && Math.random() < 0.3) {
      events.push({
        id: `event-${Date.now()}-celebration`,
        type: 'group_celebration',
        significance: 1,
        description: `${this.name} celebrates positive developments`,
        participants: [this.id],
        consequences: [{ type: 'morale_boost', value: 0.05 }]
      });
    }

    // Need-based events
    if (this.currentNeeds.food > 0.7) {
      events.push({
        id: `event-${Date.now()}-hunger`,
        type: 'group_complaint',
        significance: 2,
        description: `${this.name} expresses concerns about food shortages`,
        participants: [this.id],
        consequences: [{ type: 'morale_decrease', value: -0.1 }]
      });
    }

    return events;
  }

  /**
   * Update demographics
   */
  _updateDemographics() {
    // Simple demographic changes
    const ageIncrease = 0.05;
    this.averageAge += ageIncrease;

    // Population changes (simplified)
    const growthRate = (this.morale - 0.5) * 0.02; // 2% max growth/decline
    this.size = Math.max(1, Math.round(this.size * (1 + growthRate)));

    // Record trends
    this.demographicTrends.lastUpdate = Date.now();
    this.demographicTrends.size = this.size;
    this.demographicTrends.averageAge = this.averageAge;
  }

  /**
   * Get group statistics
   */
  getStatistics() {
    return {
      size: this.size,
      averageAge: this.averageAge,
      morale: this.morale,
      satisfaction: this.satisfaction,
      productivity: this.productivity,
      averageWealth: this.averageWealth,
      skillLevel: this.skillLevel,
      groupCohesion: this.groupCohesion,
      representativeCount: this.representatives.size
    };
  }

  /**
   * Check if group can produce hero candidates
   */
  canProduceHeroes() {
    return this.morale > 0.7 && this.skillLevel > 2 && this.size > 5;
  }

  /**
   * Add representative character
   */
  addRepresentative(characterId) {
    this.representatives.add(characterId);
    this.lastRepresentativeUpdate = Date.now();
  }

  /**
   * Remove representative character
   */
  removeRepresentative(characterId) {
    this.representatives.delete(characterId);
    this.lastRepresentativeUpdate = Date.now();
  }
}

export default PopulationGroup;