// src/shared/types/SystemTypes.js

/**
 * Common interfaces for historical context and temporal evolution
 */

/**
 * @typedef {Object} HistoricalContext
 * @property {string} era
 * @property {number} year
 * @property {string} season
 * @property {Map<string, number>} culturalValues
 * @property {string} politicalClimate
 * @property {string} economicConditions
 */

/**
 * @typedef {Object} SerializedHistoricalContext
 * @property {string} era
 * @property {number} year
 * @property {string} season
 * @property {SerializedMap<string, number>} culturalValues
 * @property {string} politicalClimate
 * @property {string} economicConditions
 */

/**
 * Alignment System Types
 */

/**
 * @typedef {Object} ZoneEffect
 * @property {string} type
 * @property {number} value
 * @property {string} description
 */

/**
 * @typedef {Object} AlignmentZone
 * @property {string} name
 * @property {number} min
 * @property {number} max
 * @property {string} description
 * @property {ZoneEffect[]} effects
 */

/**
 * @typedef {Object} AlignmentAxis
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} min
 * @property {number} max
 * @property {number} defaultValue
 * @property {AlignmentZone[]} zones
 */

/**
 * @typedef {Object} AlignmentChange
 * @property {Date} timestamp
 * @property {string} axisId
 * @property {number} change
 * @property {number} newValue
 * @property {string} reason
 * @property {HistoricalContext} [historicalContext]
 */

/**
 * @typedef {Object} SerializedAlignmentChange
 * @property {string} timestamp
 * @property {string} axisId
 * @property {number} change
 * @property {number} newValue
 * @property {string} reason
 * @property {SerializedHistoricalContext} [historicalContext]
 */

/**
 * @typedef {Object} SerializedAlignment
 * @property {SerializedMap<string, AlignmentAxis>} axes
 * @property {SerializedMap<string, number>} values
 * @property {SerializedAlignmentChange[]} history
 */

/**
 * Influence System Types
 */

/**
 * @typedef {Object} InfluenceTier
 * @property {string} name
 * @property {number} minValue
 * @property {number} maxValue
 * @property {string[]} benefits
 * @property {string[]} responsibilities
 */

/**
 * @typedef {Object} InfluenceDomain
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string[]} settlementTypes
 * @property {InfluenceTier[]} tiers
 */

/**
 * @typedef {Object} InfluenceChange
 * @property {Date} timestamp
 * @property {string} domainId
 * @property {number} change
 * @property {number} newValue
 * @property {string} reason
 * @property {string} [settlementId]
 */

/**
 * @typedef {Object} SerializedInfluenceChange
 * @property {string} timestamp
 * @property {string} domainId
 * @property {number} change
 * @property {number} newValue
 * @property {string} reason
 * @property {string} [settlementId]
 */

/**
 * @typedef {Object} SerializedInfluence
 * @property {SerializedMap<string, InfluenceDomain>} domains
 * @property {SerializedMap<string, number>} values
 * @property {SerializedInfluenceChange[]} history
 */

/**
 * Prestige System Types
 */

/**
 * @typedef {Object} PrestigeLevel
 * @property {string} name
 * @property {number} minValue
 * @property {number} maxValue
 * @property {string[]} socialBenefits
 * @property {number} politicalPower
 */

/**
 * @typedef {Object} PrestigeTrack
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} category
 * @property {number} decayRate
 * @property {PrestigeLevel[]} levels
 */

/**
 * @typedef {Object} PrestigeChange
 * @property {Date} timestamp
 * @property {string} trackId
 * @property {number} change
 * @property {number} newValue
 * @property {string} reason
 * @property {number} [witnessCount]
 */

/**
 * @typedef {Object} SerializedPrestigeChange
 * @property {string} timestamp
 * @property {string} trackId
 * @property {number} change
 * @property {number} newValue
 * @property {string} reason
 * @property {number} [witnessCount]
 */

/**
 * @typedef {Object} SerializedPrestige
 * @property {SerializedMap<string, PrestigeTrack>} tracks
 * @property {SerializedMap<string, number>} values
 * @property {SerializedPrestigeChange[]} history
 */

/**
 * Personality System Types
 */

/**
 * @typedef {Object} PersonalityTrait
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} category
 * @property {number} intensity
 * @property {number} baseLevel
 * @property {number} volatility
 */

/**
 * @typedef {Object} Attribute
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} baseValue
 * @property {number} modifier
 */

/**
 * @typedef {Object} EmotionalTendency
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} category
 * @property {number} intensity
 * @property {number} baseLevel
 * @property {number} volatility
 */

/**
 * @typedef {Object} CognitiveTrait
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} category
 * @property {number} complexity
 * @property {number} adaptability
 */

/**
 * @typedef {Object} PersonalityConfig
 * @property {PersonalityTrait[]} traits
 * @property {Attribute[]} attributes
 * @property {EmotionalTendency[]} emotionalTendencies
 * @property {CognitiveTrait[]} cognitiveTraits
 */

/**
 * @typedef {Object} SerializedPersonality
 * @property {SerializedMap<string, PersonalityTrait>} traits
 * @property {SerializedMap<string, Attribute>} attributes
 * @property {SerializedMap<string, EmotionalTendency>} emotionalTendencies
 * @property {SerializedMap<string, CognitiveTrait>} cognitiveTraits
 */

/**
 * @typedef {Object} ExperienceInfluence
 * @property {string} experienceType
 * @property {string} traitId
 * @property {number} influence
 * @property {Date} timestamp
 */

/**
 * @typedef {Object} PersonalityEvolution
 * @property {Map<string, number>} traitChanges
 * @property {PersonalityTrait[]} newTraits
 * @property {Map<string, number>} ageModifiers
 * @property {ExperienceInfluence[]} experienceInfluences
 */

/**
 * Racial System Types
 */

/**
 * @typedef {Object} LifespanInfo
 * @property {number} average
 * @property {number} maximum
 */

/**
 * @typedef {Object} SerializedSubrace
 * @property {string} name
 * @property {string} description
 * @property {SerializedMap<string, number>} attributeModifiers
 * @property {SerializedMap<string, number>} skillModifiers
 * @property {string[]} features
 */

/**
 * @typedef {Object} Subrace
 * @property {string} name
 * @property {string} description
 * @property {Map<string, number>} attributeModifiers
 * @property {Map<string, number>} skillModifiers
 * @property {string[]} features
 */

/**
 * @typedef {Object} SerializedRacialTrait
 * @property {string} name
 * @property {string} description
 * @property {SerializedMap<string, number>} effects
 */

/**
 * @typedef {Object} RacialTrait
 * @property {string} name
 * @property {string} description
 * @property {Map<string, number>} effects
 */

/**
 * @typedef {Object} Race
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Subrace[]} subraces
 * @property {RacialTrait[]} traits
 * @property {LifespanInfo} lifespan
 */

/**
 * @typedef {Object} SerializedRacialModifiers
 * @property {SerializedMap<string, number>} attributes
 * @property {SerializedMap<string, number>} skills
 * @property {string[]} features
 * @property {SerializedMap<string, number>} effects
 */

/**
 * @typedef {Object} RacialModifiers
 * @property {Map<string, number>} attributes
 * @property {Map<string, number>} skills
 * @property {string[]} features
 * @property {Map<string, number>} effects
 */

/**
 * @typedef {Object} SerializedRacialFeature
 * @property {string} name
 * @property {string} description
 * @property {'passive' | 'active' | 'conditional'} type
 * @property {SerializedMap<string, number>} [effects]
 */

/**
 * @typedef {Object} RacialFeature
 * @property {string} name
 * @property {string} description
 * @property {'passive' | 'active' | 'conditional'} type
 * @property {Map<string, number>} [effects]
 */

/**
 * @typedef {Object} SerializedRacialTraits
 * @property {Race} race
 * @property {SerializedSubrace|null} subrace
 * @property {SerializedRacialModifiers} modifiers
 * @property {SerializedRacialFeature[]} features
 */

/**
 * Character Action and Event Types
 */

/**
 * @typedef {Object} ActionContext
 * @property {string} location
 * @property {string[]} participants
 * @property {Map<string, any>} circumstances
 */

/**
 * @typedef {Object} CharacterAction
 * @property {string} id
 * @property {string} type
 * @property {string} description
 * @property {Date} timestamp
 * @property {string} characterId
 * @property {ActionContext} context
 */

/**
 * @typedef {Object} MoralChoice
 * @property {string} id
 * @property {string} description
 * @property {Map<string, number>} alignmentImpact
 * @property {HistoricalContext} context
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} category
 * @property {number} prestigeValue
 * @property {string[]} requirements
 */

/**
 * @typedef {Object} SocialContext
 * @property {string} settlement
 * @property {number} witnesses
 * @property {number} culturalRelevance
 * @property {number} politicalImportance
 */

/**
 * @typedef {Object} SocialStanding
 * @property {number} overall
 * @property {Map<string, number>} byTrack
 * @property {string} reputation
 * @property {number} politicalInfluence
 */

/**
 * Settlement and World Types
 */

/**
 * @typedef {Object} Settlement
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {number} population
 * @property {Map<string, number>} culturalValues
 * @property {string} politicalStructure
 * @property {string} economicStatus
 */

/**
 * @typedef {Object} SettlementEvent
 * @property {string} id
 * @property {string} type
 * @property {string} description
 * @property {Date} timestamp
 * @property {string} settlementId
 * @property {Map<string, number>} impact
 */

/**
 * @typedef {Object} WorldState
 * @property {Date} currentTime
 * @property {Settlement[]} settlements
 * @property {SettlementEvent[]} activeEvents
 * @property {Map<string, number>} globalConditions
 */

/**
 * Validation and Prerequisite Types
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field
 * @property {string} message
 * @property {'error' | 'warning'} severity
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid
 * @property {ValidationError[]} errors
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} Prerequisite
 * @property {string} id
 * @property {string} type
 * @property {string} condition
 * @property {any} value
 * @property {string} description
 */

/**
 * Character Evolution Types
 */

/**
 * @typedef {Object} CharacterEvolution
 * @property {string} characterId
 * @property {number} timespan
 * @property {AlignmentChange[]} alignmentChanges
 * @property {InfluenceChange[]} influenceChanges
 * @property {PrestigeChange[]} prestigeChanges
 * @property {PersonalityEvolution} personalityEvolution
 */

/**
 * Need Satisfaction System Types
 */

/**
 * @typedef {Object} NeedSatisfactionLevels
 * @property {number} food - Food satisfaction level (0.0 - 1.0)
 * @property {number} water - Water satisfaction level (0.0 - 1.0)
 * @property {number} shelter - Shelter satisfaction level (0.0 - 1.0)
 * @property {number} goods - Goods satisfaction level (0.0 - 1.0)
 * @property {number} services - Services satisfaction level (0.0 - 1.0)
 */

/**
 * @typedef {Object} CascadingEffects
 * @property {number} multiplier - Combined multiplier from unmet basic needs
 * @property {string[]} affectedNeeds - List of needs affected by cascading effects
 * @property {boolean} hasEffects - Whether any cascading effects are active
 */

/**
 * @typedef {Object} NeedSatisfactionResult
 * @property {NeedSatisfactionLevels} needs - Individual need satisfaction levels
 * @property {number} overall - Overall satisfaction level (0.0 - 1.0)
 * @property {ConsequenceObject[]} consequences - Generated consequences from unmet needs
 * @property {CascadingEffects} cascadingEffects - Information about cascading effects applied
 */

/**
 * @typedef {Object} ConsequenceObject
 * @property {string} id - Unique identifier for the consequence
 * @property {string} type - Type of consequence ('famine', 'water_crisis', 'housing_crisis', etc.)
 * @property {number} severity - Severity level (0.0 - 1.0)
 * @property {string} description - Human-readable description of the consequence
 * @property {ConsequenceEffects} effects - Specific effects of this consequence
 * @property {number} duration - How many turns the consequence lasts
 * @property {string[]} triggers - What can trigger resolution of this consequence
 * @property {boolean} resolved - Whether this consequence has been resolved
 * @property {Date} startDate - When this consequence began
 * @property {Date} [endDate] - When this consequence ended (if resolved)
 */

/**
 * @typedef {Object} ConsequenceEffects
 * @property {PopulationEffects} population - Effects on population dynamics
 * @property {CharacterEffects} character - Effects on character behavior and stats
 * @property {SettlementEffects} settlement - Effects on settlement infrastructure and stability
 */

/**
 * @typedef {Object} PopulationEffects
 * @property {number} growth - Modifier to population growth (-0.1 = 10% slower growth)
 * @property {number} migration - Migration pressure (0.2 = 20% of population wants to leave)
 * @property {number} mortality - Mortality rate change (0.05 = 5% higher death rate)
 */

/**
 * @typedef {Object} CharacterEffects
 * @property {number} moodModifier - Mood change for characters in affected settlement
 * @property {number} energyModifier - Energy change for characters in affected settlement
 * @property {number} healthModifier - Health change for characters in affected settlement
 * @property {string[]} behaviorChanges - New behavior patterns characters will adopt
 * @property {Object<string, number>} interactionModifiers - Modifiers to interaction success rates
 */

/**
 * @typedef {Object} SettlementEffects
 * @property {number} stabilityChange - Change to settlement stability
 * @property {number} economicImpact - Change to economic efficiency
 * @property {number} socialCohesion - Change to social cohesion
 * @property {Object<string, number>} buildingEfficiency - Efficiency changes for specific building types
 */

/**
 * @typedef {Object} NeedSatisfactionHistory
 * @property {Date} timestamp - When this measurement was taken
 * @property {NeedSatisfactionLevels} needs - Need satisfaction levels at this time
 * @property {number} overall - Overall satisfaction at this time
 * @property {ConsequenceObject[]} consequences - Active consequences at this time
 * @property {string[]} events - IDs of historical events generated from this measurement
 */

/**
 * @typedef {Object} NeedSatisfactionTrends
 * @property {number} food - Rate of change in food satisfaction
 * @property {number} water - Rate of change in water satisfaction
 * @property {number} shelter - Rate of change in shelter satisfaction
 * @property {number} goods - Rate of change in goods satisfaction
 * @property {number} services - Rate of change in services satisfaction
 * @property {number} overall - Rate of change in overall satisfaction
 */

// Export empty object to make this a proper module
export {};