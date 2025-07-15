// src/domain/services/AlignmentService.js

import { Alignment } from '../value-objects/Alignment.js';

/**
 * Domain service for handling alignment evolution and moral choice processing
 * Provides business logic for how alignments change over time and in response to events
 */
class AlignmentService {
  /**
   * Evolve alignment based on historical events and temporal context
   * @param {Alignment} alignment - Current alignment state
   * @param {Object} historicalEvent - Event that may influence alignment
   * @param {Object} historicalContext - Current historical context
   * @param {Object} personalityTraits - Character's personality traits that influence alignment changes
   * @returns {Alignment} New alignment state after evolution
   */
  evolveAlignment(alignment, historicalEvent, historicalContext, personalityTraits = {}) {
    this._validateAlignment(alignment);
    this._validateHistoricalEvent(historicalEvent);
    this._validateHistoricalContext(historicalContext);
    
    // Calculate alignment shifts based on the historical event
    const alignmentShifts = this._calculateHistoricalEventShifts(
      alignment, 
      historicalEvent, 
      historicalContext, 
      personalityTraits
    );
    
    // Apply all calculated shifts
    let evolvedAlignment = alignment;
    for (const shift of alignmentShifts) {
      evolvedAlignment = evolvedAlignment.withChange(
        shift.axisId,
        shift.amount,
        shift.reason,
        historicalContext
      );
    }
    
    return evolvedAlignment;
  }
  
  /**
   * Apply moral choice effects to alignment
   * @param {Alignment} alignment - Current alignment state
   * @param {Object} moralChoice - The moral choice made by the character
   * @param {Object} personalityTraits - Character's personality traits
   * @param {Object} socialContext - Social context of the choice
   * @returns {Alignment} New alignment state after applying moral choice
   */
  applyMoralChoice(alignment, moralChoice, personalityTraits = {}, socialContext = {}) {
    this._validateAlignment(alignment);
    this._validateMoralChoice(moralChoice);
    
    // Calculate base alignment impact from the choice
    const baseShifts = this._calculateMoralChoiceShifts(alignment, moralChoice);
    
    // Modify shifts based on personality traits
    const personalityModifiedShifts = this._applyPersonalityModifiers(
      baseShifts, 
      personalityTraits, 
      alignment
    );
    
    // Apply social context modifiers
    const sociallyModifiedShifts = this._applySocialContextModifiers(
      personalityModifiedShifts, 
      socialContext
    );
    
    // Apply all calculated shifts
    let newAlignment = alignment;
    for (const shift of sociallyModifiedShifts) {
      newAlignment = newAlignment.withChange(
        shift.axisId,
        shift.amount,
        `Moral choice: ${moralChoice.description}`,
        moralChoice.context
      );
    }
    
    return newAlignment;
  }
  
  /**
   * Calculate alignment shift based on personality-driven changes over time
   * @param {Alignment} alignment - Current alignment state
   * @param {Object} personalityTraits - Character's personality traits
   * @param {number} timeElapsed - Time elapsed since last calculation (in days)
   * @param {Object} lifeExperiences - Recent life experiences that may influence alignment
   * @returns {Alignment} New alignment state after personality-based shifts
   */
  calculateAlignmentShift(alignment, personalityTraits, timeElapsed, lifeExperiences = []) {
    this._validateAlignment(alignment);
    this._validatePersonalityTraits(personalityTraits);
    
    if (timeElapsed <= 0) {
      return alignment;
    }
    
    // Calculate natural drift based on personality
    const naturalDriftShifts = this._calculateNaturalDrift(
      alignment, 
      personalityTraits, 
      timeElapsed
    );
    
    // Calculate experience-based shifts
    const experienceShifts = this._calculateExperienceShifts(
      alignment, 
      lifeExperiences, 
      personalityTraits
    );
    
    // Combine all shifts
    const allShifts = [...naturalDriftShifts, ...experienceShifts];
    
    // Apply shifts
    let shiftedAlignment = alignment;
    for (const shift of allShifts) {
      shiftedAlignment = shiftedAlignment.withChange(
        shift.axisId,
        shift.amount,
        shift.reason
      );
    }
    
    return shiftedAlignment;
  }
  
  /**
   * Analyze alignment compatibility between two characters
   * @param {Alignment} alignment1 - First character's alignment
   * @param {Alignment} alignment2 - Second character's alignment
   * @returns {Object} Compatibility analysis
   */
  analyzeCompatibility(alignment1, alignment2) {
    this._validateAlignment(alignment1);
    this._validateAlignment(alignment2);
    
    const compatibility = {};
    const overallScores = [];
    
    for (const axisId of alignment1.getAxisIds()) {
      if (alignment2.hasAxis(axisId)) {
        const value1 = alignment1.getValue(axisId);
        const value2 = alignment2.getValue(axisId);
        const axis = alignment1.getAxis(axisId);
        
        // Calculate compatibility score (0-1, where 1 is perfect compatibility)
        const maxDifference = axis.max - axis.min;
        const actualDifference = Math.abs(value1 - value2);
        const compatibilityScore = 1 - (actualDifference / maxDifference);
        
        compatibility[axisId] = {
          score: compatibilityScore,
          difference: actualDifference,
          zone1: alignment1.getZone(axisId)?.name || 'Unknown',
          zone2: alignment2.getZone(axisId)?.name || 'Unknown'
        };
        
        overallScores.push(compatibilityScore);
      }
    }
    
    const overallCompatibility = overallScores.length > 0 
      ? overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length 
      : 0;
    
    return {
      overall: overallCompatibility,
      byAxis: compatibility,
      conflictAreas: Object.entries(compatibility)
        .filter(([_, data]) => data.score < 0.3)
        .map(([axisId, _]) => axisId),
      harmoniousAreas: Object.entries(compatibility)
        .filter(([_, data]) => data.score > 0.7)
        .map(([axisId, _]) => axisId)
    };
  }
  
  /**
   * Private helper methods
   */
  
  _calculateHistoricalEventShifts(alignment, event, context, personalityTraits) {
    const shifts = [];
    
    // Different types of historical events affect alignment differently
    switch (event.type) {
      case 'war':
        shifts.push(...this._calculateWarEventShifts(alignment, event, context, personalityTraits));
        break;
      case 'plague':
        shifts.push(...this._calculatePlagueEventShifts(alignment, event, context, personalityTraits));
        break;
      case 'political_change':
        shifts.push(...this._calculatePoliticalEventShifts(alignment, event, context, personalityTraits));
        break;
      case 'cultural_shift':
        shifts.push(...this._calculateCulturalEventShifts(alignment, event, context, personalityTraits));
        break;
      default:
        // Generic event processing
        shifts.push(...this._calculateGenericEventShifts(alignment, event, context, personalityTraits));
    }
    
    return shifts;
  }
  
  _calculateWarEventShifts(alignment, event, context, personalityTraits) {
    const shifts = [];
    const intensity = event.intensity || 1;
    
    // War tends to shift people toward more extreme positions
    for (const axisId of alignment.getAxisIds()) {
      const currentValue = alignment.getValue(axisId);
      const axis = alignment.getAxis(axisId);
      
      if (axisId === 'moral') {
        // War can make people more pragmatic (shift toward neutral) or more extreme
        const pragmatismTrait = personalityTraits.pragmatism || 0;
        const shiftAmount = pragmatismTrait > 0 
          ? -Math.sign(currentValue) * intensity * 2  // Toward neutral
          : Math.sign(currentValue) * intensity * 3;  // More extreme
        
        shifts.push({
          axisId,
          amount: this._clamp(shiftAmount, -10, 10),
          reason: `War event: ${event.description}`
        });
      }
      
      if (axisId === 'ethical') {
        // War often shifts toward more authoritarian (lawful) approaches
        const authorityTrait = personalityTraits.authority || 0;
        const shiftAmount = (5 + authorityTrait * 2) * intensity;
        
        shifts.push({
          axisId,
          amount: this._clamp(shiftAmount, -15, 15),
          reason: `War demands order: ${event.description}`
        });
      }
    }
    
    return shifts;
  }
  
  _calculatePlagueEventShifts(alignment, event, context, personalityTraits) {
    const shifts = [];
    const severity = event.severity || 1;
    
    // Plague events often lead to questioning of faith and order
    for (const axisId of alignment.getAxisIds()) {
      if (axisId === 'moral') {
        // Plague can make people more selfish (evil) or more compassionate (good)
        const compassionTrait = personalityTraits.compassion || 0;
        const shiftAmount = compassionTrait > 0 
          ? 3 * severity  // More good
          : -2 * severity; // More selfish
        
        shifts.push({
          axisId,
          amount: this._clamp(shiftAmount, -8, 8),
          reason: `Plague response: ${event.description}`
        });
      }
      
      if (axisId === 'ethical') {
        // Plague often leads to breakdown of social order (chaotic shift)
        const orderTrait = personalityTraits.order || 0;
        const shiftAmount = orderTrait > 0 
          ? -1 * severity  // Slight chaotic shift even for orderly people
          : -4 * severity; // Strong chaotic shift
        
        shifts.push({
          axisId,
          amount: this._clamp(shiftAmount, -10, 5),
          reason: `Social breakdown: ${event.description}`
        });
      }
    }
    
    return shifts;
  }
  
  _calculatePoliticalEventShifts(alignment, event, context, personalityTraits) {
    const shifts = [];
    
    // Political events primarily affect ethical alignment
    for (const axisId of alignment.getAxisIds()) {
      if (axisId === 'ethical') {
        const currentValue = alignment.getValue(axisId);
        let shiftAmount = 0;
        
        if (event.subtype === 'revolution') {
          // Revolutions shift toward chaotic
          shiftAmount = -5 - (personalityTraits.rebellion || 0) * 2;
        } else if (event.subtype === 'law_establishment') {
          // New laws shift toward lawful
          shiftAmount = 4 + (personalityTraits.order || 0) * 2;
        } else if (event.subtype === 'corruption_exposed') {
          // Corruption exposure can shift either way depending on current position
          shiftAmount = currentValue > 0 ? -3 : 2; // Lawful people become disillusioned
        }
        
        if (shiftAmount !== 0) {
          shifts.push({
            axisId,
            amount: this._clamp(shiftAmount, -12, 12),
            reason: `Political event: ${event.description}`
          });
        }
      }
    }
    
    return shifts;
  }
  
  _calculateCulturalEventShifts(alignment, event, context, personalityTraits) {
    const shifts = [];
    
    // Cultural events can affect multiple axes
    const culturalInfluence = event.influence || 1;
    const adaptabilityTrait = personalityTraits.adaptability || 0;
    
    for (const axisId of alignment.getAxisIds()) {
      const currentValue = alignment.getValue(axisId);
      
      // Cultural shifts pull people toward the cultural norm
      const culturalNorm = context.culturalValues?.get(axisId) || 0;
      const difference = culturalNorm - currentValue;
      
      // More adaptable people shift more readily
      const adaptabilityMultiplier = 0.5 + (adaptabilityTrait * 0.5);
      const shiftAmount = difference * 0.1 * culturalInfluence * adaptabilityMultiplier;
      
      if (Math.abs(shiftAmount) > 0.5) {
        shifts.push({
          axisId,
          amount: this._clamp(shiftAmount, -5, 5),
          reason: `Cultural shift: ${event.description}`
        });
      }
    }
    
    return shifts;
  }
  
  _calculateGenericEventShifts(alignment, event, context, personalityTraits) {
    const shifts = [];
    
    // Generic events have minimal impact
    if (event.alignmentImpact) {
      for (const [axisId, impact] of Object.entries(event.alignmentImpact)) {
        if (alignment.hasAxis(axisId) && Math.abs(impact) > 0) {
          shifts.push({
            axisId,
            amount: this._clamp(impact, -3, 3),
            reason: `Event impact: ${event.description}`
          });
        }
      }
    }
    
    return shifts;
  }
  
  _calculateMoralChoiceShifts(alignment, moralChoice) {
    const shifts = [];
    
    if (moralChoice.alignmentImpact) {
      for (const [axisId, impact] of moralChoice.alignmentImpact.entries()) {
        if (alignment.hasAxis(axisId) && Math.abs(impact) > 0) {
          shifts.push({
            axisId,
            amount: impact,
            reason: `Moral choice: ${moralChoice.description}`
          });
        }
      }
    }
    
    return shifts;
  }
  
  _applyPersonalityModifiers(shifts, personalityTraits, alignment) {
    return shifts.map(shift => {
      let modifiedAmount = shift.amount;
      
      // Personality traits can amplify or dampen alignment changes
      const currentValue = alignment.getValue(shift.axisId);
      
      // Strong-willed people resist change
      const willpower = personalityTraits.willpower || 0;
      const resistanceFactor = 1 - (willpower * 0.2);
      modifiedAmount *= resistanceFactor;
      
      // Volatile people have more extreme changes
      const volatility = personalityTraits.volatility || 0;
      const volatilityFactor = 1 + (volatility * 0.3);
      modifiedAmount *= volatilityFactor;
      
      // People resist changes that go against their current strong positions
      const axis = alignment.getAxis(shift.axisId);
      const extremeness = Math.abs(currentValue) / ((axis.max - axis.min) / 2);
      if (extremeness > 0.7 && Math.sign(modifiedAmount) !== Math.sign(currentValue)) {
        modifiedAmount *= 0.5; // Resist changes away from extreme positions
      }
      
      return {
        ...shift,
        amount: modifiedAmount
      };
    });
  }
  
  _applySocialContextModifiers(shifts, socialContext) {
    return shifts.map(shift => {
      let modifiedAmount = shift.amount;
      
      // Public actions have more impact
      const witnesses = socialContext.witnesses || 0;
      if (witnesses > 0) {
        const publicityFactor = 1 + Math.min(witnesses / 10, 0.5);
        modifiedAmount *= publicityFactor;
      }
      
      // Culturally relevant actions have more impact
      const culturalRelevance = socialContext.culturalRelevance || 0;
      if (culturalRelevance > 0) {
        modifiedAmount *= (1 + culturalRelevance * 0.3);
      }
      
      return {
        ...shift,
        amount: modifiedAmount
      };
    });
  }
  
  _calculateNaturalDrift(alignment, personalityTraits, timeElapsed) {
    const shifts = [];
    const driftRate = 0.1; // Base drift per day
    
    for (const axisId of alignment.getAxisIds()) {
      const currentValue = alignment.getValue(axisId);
      const axis = alignment.getAxis(axisId);
      
      // Calculate target value based on personality
      let targetValue = this._calculatePersonalityTarget(axisId, personalityTraits);
      
      // Drift toward personality-based target
      const difference = targetValue - currentValue;
      const driftAmount = difference * driftRate * timeElapsed;
      
      if (Math.abs(driftAmount) > 0.1) {
        shifts.push({
          axisId,
          amount: this._clamp(driftAmount, -2, 2),
          reason: 'Natural personality drift over time'
        });
      }
    }
    
    return shifts;
  }
  
  _calculateExperienceShifts(alignment, lifeExperiences, personalityTraits) {
    const shifts = [];
    
    for (const experience of lifeExperiences) {
      if (experience.alignmentImpact) {
        for (const [axisId, impact] of Object.entries(experience.alignmentImpact)) {
          if (alignment.hasAxis(axisId) && Math.abs(impact) > 0) {
            // Modify impact based on how recent and significant the experience was
            const recency = this._calculateRecencyFactor(experience.timestamp);
            const significance = experience.significance || 1;
            const modifiedImpact = impact * recency * significance;
            
            shifts.push({
              axisId,
              amount: this._clamp(modifiedImpact, -5, 5),
              reason: `Life experience: ${experience.description}`
            });
          }
        }
      }
    }
    
    return shifts;
  }
  
  _calculatePersonalityTarget(axisId, personalityTraits) {
    // This is a simplified mapping - in a real system, this would be more sophisticated
    switch (axisId) {
      case 'moral':
        const compassion = personalityTraits.compassion || 0;
        const selfishness = personalityTraits.selfishness || 0;
        return (compassion * 30) - (selfishness * 30);
      
      case 'ethical':
        const order = personalityTraits.order || 0;
        const rebellion = personalityTraits.rebellion || 0;
        return (order * 40) - (rebellion * 40);
      
      default:
        return 0;
    }
  }
  
  _calculateRecencyFactor(timestamp) {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const daysSince = (now - eventTime) / (1000 * 60 * 60 * 24);
    
    // Exponential decay - recent events have more impact
    return Math.exp(-daysSince / 30); // Half-life of about 30 days
  }
  
  _clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  /**
   * Validation methods
   */
  
  _validateAlignment(alignment) {
    if (!(alignment instanceof Alignment)) {
      throw new Error('Invalid alignment: must be an instance of Alignment');
    }
  }
  
  _validateHistoricalEvent(event) {
    if (!event || typeof event !== 'object') {
      throw new Error('Invalid historical event: must be an object');
    }
    
    if (!event.type || typeof event.type !== 'string') {
      throw new Error('Historical event must have a valid type');
    }
    
    if (!event.description || typeof event.description !== 'string') {
      throw new Error('Historical event must have a description');
    }
  }
  
  _validateHistoricalContext(context) {
    if (!context || typeof context !== 'object') {
      throw new Error('Invalid historical context: must be an object');
    }
  }
  
  _validateMoralChoice(choice) {
    if (!choice || typeof choice !== 'object') {
      throw new Error('Invalid moral choice: must be an object');
    }
    
    if (!choice.description || typeof choice.description !== 'string') {
      throw new Error('Moral choice must have a description');
    }
    
    if (!choice.alignmentImpact || !(choice.alignmentImpact instanceof Map)) {
      throw new Error('Moral choice must have alignmentImpact as a Map');
    }
  }
  
  _validatePersonalityTraits(traits) {
    if (!traits || typeof traits !== 'object') {
      throw new Error('Invalid personality traits: must be an object');
    }
  }
}

export default AlignmentService;