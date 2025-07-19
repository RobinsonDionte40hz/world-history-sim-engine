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

// Export empty object to make this a proper module
export {};