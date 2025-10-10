// src/domain/value-objects/NodeTypeCapabilities.js
// Value object encapsulating type-specific system permissions

class NodeTypeCapabilities {
  constructor(config = {}) {
    // Economic system permissions
    this.canHaveEconomy = config.canHaveEconomy || false;
    this.canProduceResources = config.canProduceResources || false;
    this.canConsumeResources = config.canConsumeResources || false;
    this.canHaveMarkets = config.canHaveMarkets || false;
    this.canTrade = config.canTrade || false;
    this.canHaveTaxation = config.canHaveTaxation || false;
    this.canHaveBanking = config.canHaveBanking || false;

    // Political system permissions
    this.canHaveGovernment = config.canHaveGovernment || false;
    this.canHaveLeadership = config.canHaveLeadership || false;
    this.canHaveDiplomacy = config.canHaveDiplomacy || false;
    this.canHaveLaws = config.canHaveLaws || false;
    this.canHaveMilitary = config.canHaveMilitary || false;

    // Social system permissions
    this.canHavePopulation = config.canHavePopulation || false;
    this.canHaveCulture = config.canHaveCulture || false;
    this.canHaveEducation = config.canHaveEducation || false;
    this.canHaveReligion = config.canHaveReligion || false;
    this.canHaveSocialClasses = config.canHaveSocialClasses || false;

    // Environmental and special permissions
    this.canHaveEnvironmentalEffects = config.canHaveEnvironmentalEffects || false;
    this.canHaveSpecialMechanics = config.canHaveSpecialMechanics || false;
    this.canInfluenceNeighbors = config.canInfluenceNeighbors || false;
    this.canBeSettled = config.canBeSettled || false;

    // Interaction permissions
    this.canHaveContentInteractions = config.canHaveContentInteractions || false;
    this.canHaveSystemInteractions = config.canHaveSystemInteractions || false;
    this.canHostEvents = config.canHostEvents || false;

    // Development permissions
    this.canBeDeveloped = config.canBeDeveloped || false;
    this.canHaveBuildings = config.canHaveBuildings || false;
    this.canHaveInfrastructure = config.canHaveInfrastructure || false;

    // Freeze to ensure immutability
    Object.freeze(this);
  }

  /**
   * Check if this capability set has a specific capability
   * @param {string} capability - The capability name to check
   * @returns {boolean} True if the capability is enabled
   */
  hasCapability(capability) {
    // Map string capability names to boolean properties
    const capabilityMap = {
      // Economic capabilities
      'economy': this.canHaveEconomy,
      'resource_production': this.canProduceResources,
      'resource_consumption': this.canConsumeResources,
      'markets': this.canHaveMarkets,
      'trade': this.canTrade,
      'taxation': this.canHaveTaxation,
      'banking': this.canHaveBanking,

      // Political capabilities
      'government': this.canHaveGovernment,
      'leadership': this.canHaveLeadership,
      'diplomacy': this.canHaveDiplomacy,
      'laws': this.canHaveLaws,
      'military': this.canHaveMilitary,

      // Social capabilities
      'population': this.canHavePopulation,
      'culture': this.canHaveCulture,
      'education': this.canHaveEducation,
      'religion': this.canHaveReligion,
      'social_classes': this.canHaveSocialClasses,

      // Environmental and special
      'environmental_effects': this.canHaveEnvironmentalEffects,
      'special_mechanics': this.canHaveSpecialMechanics,
      'neighbor_influence': this.canInfluenceNeighbors,
      'settlement': this.canBeSettled,

      // Interaction capabilities
      'content_interactions': this.canHaveContentInteractions,
      'system_interactions': this.canHaveSystemInteractions,
      'events': this.canHostEvents,

      // Development capabilities
      'development': this.canBeDeveloped,
      'buildings': this.canHaveBuildings,
      'infrastructure': this.canHaveInfrastructure
    };

    return capabilityMap[capability] || false;
  }

  /**
   * Get all enabled capabilities as an array of strings
   * @returns {string[]} Array of enabled capability names
   */
  getAllCapabilities() {
    const allCapabilities = [
      'economy', 'resource_production', 'resource_consumption', 'markets', 'trade',
      'taxation', 'banking', 'government', 'leadership', 'diplomacy', 'laws', 'military',
      'population', 'culture', 'education', 'religion', 'social_classes',
      'environmental_effects', 'special_mechanics', 'neighbor_influence', 'settlement',
      'content_interactions', 'system_interactions', 'events',
      'development', 'buildings', 'infrastructure'
    ];

    return allCapabilities.filter(cap => this.hasCapability(cap));
  }

  /**
   * Get capabilities grouped by system category
   * @returns {Object} Capabilities grouped by category
   */
  getCapabilitiesByCategory() {
    return {
      economic: {
        economy: this.canHaveEconomy,
        resourceProduction: this.canProduceResources,
        resourceConsumption: this.canConsumeResources,
        markets: this.canHaveMarkets,
        trade: this.canTrade,
        taxation: this.canHaveTaxation,
        banking: this.canHaveBanking
      },
      political: {
        government: this.canHaveGovernment,
        leadership: this.canHaveLeadership,
        diplomacy: this.canHaveDiplomacy,
        laws: this.canHaveLaws,
        military: this.canHaveMilitary
      },
      social: {
        population: this.canHavePopulation,
        culture: this.canHaveCulture,
        education: this.canHaveEducation,
        religion: this.canHaveReligion,
        socialClasses: this.canHaveSocialClasses
      },
      environmental: {
        environmentalEffects: this.canHaveEnvironmentalEffects,
        specialMechanics: this.canHaveSpecialMechanics,
        neighborInfluence: this.canInfluenceNeighbors,
        settlement: this.canBeSettled
      },
      interaction: {
        contentInteractions: this.canHaveContentInteractions,
        systemInteractions: this.canHaveSystemInteractions,
        events: this.canHostEvents
      },
      development: {
        development: this.canBeDeveloped,
        buildings: this.canHaveBuildings,
        infrastructure: this.canHaveInfrastructure
      }
    };
  }

  /**
   * Create a clone of this capabilities object
   * @returns {NodeTypeCapabilities} New instance with same values
   */
  clone() {
    return new NodeTypeCapabilities({
      canHaveEconomy: this.canHaveEconomy,
      canProduceResources: this.canProduceResources,
      canConsumeResources: this.canConsumeResources,
      canHaveMarkets: this.canHaveMarkets,
      canTrade: this.canTrade,
      canHaveTaxation: this.canHaveTaxation,
      canHaveBanking: this.canHaveBanking,
      canHaveGovernment: this.canHaveGovernment,
      canHaveLeadership: this.canHaveLeadership,
      canHaveDiplomacy: this.canHaveDiplomacy,
      canHaveLaws: this.canHaveLaws,
      canHaveMilitary: this.canHaveMilitary,
      canHavePopulation: this.canHavePopulation,
      canHaveCulture: this.canHaveCulture,
      canHaveEducation: this.canHaveEducation,
      canHaveReligion: this.canHaveReligion,
      canHaveSocialClasses: this.canHaveSocialClasses,
      canHaveEnvironmentalEffects: this.canHaveEnvironmentalEffects,
      canHaveSpecialMechanics: this.canHaveSpecialMechanics,
      canInfluenceNeighbors: this.canInfluenceNeighbors,
      canBeSettled: this.canBeSettled,
      canHaveContentInteractions: this.canHaveContentInteractions,
      canHaveSystemInteractions: this.canHaveSystemInteractions,
      canHostEvents: this.canHostEvents,
      canBeDeveloped: this.canBeDeveloped,
      canHaveBuildings: this.canHaveBuildings,
      canHaveInfrastructure: this.canHaveInfrastructure
    });
  }

  /**
   * Check if two capability sets are equal
   * @param {NodeTypeCapabilities} other - Other capabilities to compare
   * @returns {boolean} True if all capabilities match
   */
  equals(other) {
    if (!(other instanceof NodeTypeCapabilities)) {
      return false;
    }

    return this.canHaveEconomy === other.canHaveEconomy &&
           this.canProduceResources === other.canProduceResources &&
           this.canConsumeResources === other.canConsumeResources &&
           this.canHaveMarkets === other.canHaveMarkets &&
           this.canTrade === other.canTrade &&
           this.canHaveTaxation === other.canHaveTaxation &&
           this.canHaveBanking === other.canHaveBanking &&
           this.canHaveGovernment === other.canHaveGovernment &&
           this.canHaveLeadership === other.canHaveLeadership &&
           this.canHaveDiplomacy === other.canHaveDiplomacy &&
           this.canHaveLaws === other.canHaveLaws &&
           this.canHaveMilitary === other.canHaveMilitary &&
           this.canHavePopulation === other.canHavePopulation &&
           this.canHaveCulture === other.canHaveCulture &&
           this.canHaveEducation === other.canHaveEducation &&
           this.canHaveReligion === other.canHaveReligion &&
           this.canHaveSocialClasses === other.canHaveSocialClasses &&
           this.canHaveEnvironmentalEffects === other.canHaveEnvironmentalEffects &&
           this.canHaveSpecialMechanics === other.canHaveSpecialMechanics &&
           this.canInfluenceNeighbors === other.canInfluenceNeighbors &&
           this.canBeSettled === other.canBeSettled &&
           this.canHaveContentInteractions === other.canHaveContentInteractions &&
           this.canHaveSystemInteractions === other.canHaveSystemInteractions &&
           this.canHostEvents === other.canHostEvents &&
           this.canBeDeveloped === other.canBeDeveloped &&
           this.canHaveBuildings === other.canHaveBuildings &&
           this.canHaveInfrastructure === other.canHaveInfrastructure;
  }
}

export default NodeTypeCapabilities;