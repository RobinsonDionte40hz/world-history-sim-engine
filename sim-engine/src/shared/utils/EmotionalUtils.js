// src/shared/utils/EmotionalUtils.js

/**
 * Practical emotional state modifiers for simulation behavior
 * Maps emotional states to behavioral multipliers
 */
export function getEmotionalModifier(emotion, intensity = 0.5) {
  // Handle invalid inputs
  if (!emotion || intensity == null || intensity < 0) {
    return {
      socialInteraction: 1.0,
      riskTaking: 1.0,
      energyEfficiency: 1.0,
      conflictAvoidance: 1.0,
      decisionSpeed: 1.0,
      creativity: 1.0,
      patience: 1.0
    };
  }

  // Cap intensity at 1.0
  const clampedIntensity = Math.min(1.0, intensity);
  
  const baseModifiers = {
    'tired': {
      socialInteraction: 0.6,
      riskTaking: 0.5,
      energyEfficiency: 0.7,
      conflictAvoidance: 1.4,
      decisionSpeed: 0.8,
      creativity: 0.6,
      patience: 1.2
    },
    'content': {
      socialInteraction: 1.0,
      riskTaking: 0.9,
      energyEfficiency: 1.1,
      conflictAvoidance: 1.1,
      decisionSpeed: 1.0,
      creativity: 1.0,
      patience: 1.2
    },
    'alert': {
      socialInteraction: 1.2,
      riskTaking: 1.1,
      energyEfficiency: 1.2,
      conflictAvoidance: 0.8,
      decisionSpeed: 1.3,
      creativity: 1.1,
      patience: 0.9
    },
    'energized': {
      socialInteraction: 1.4,
      riskTaking: 1.3,
      energyEfficiency: 1.3,
      conflictAvoidance: 0.6,
      decisionSpeed: 1.4,
      creativity: 1.3,
      patience: 0.7
    }
  };

  const modifiers = baseModifiers[emotion];
  if (!modifiers) {
    // Return neutral modifiers for unknown emotions
    return {
      socialInteraction: 1.0,
      riskTaking: 1.0,
      energyEfficiency: 1.0,
      conflictAvoidance: 1.0,
      decisionSpeed: 1.0,
      creativity: 1.0,
      patience: 1.0
    };
  }

  // For zero intensity, return neutral modifiers
  if (clampedIntensity === 0) {
    return {
      socialInteraction: 1.0,
      riskTaking: 1.0,
      energyEfficiency: 1.0,
      conflictAvoidance: 1.0,
      decisionSpeed: 1.0,
      creativity: 1.0,
      patience: 1.0
    };
  }

  // Scale modifiers based on intensity (interpolate between neutral 1.0 and full modifier values)
  const scaledModifiers = {};
  Object.keys(modifiers).forEach(key => {
    const baseValue = modifiers[key];
    const diff = baseValue - 1.0; // Difference from neutral
    scaledModifiers[key] = 1.0 + (diff * clampedIntensity); // Scale the difference by intensity
  });

  return scaledModifiers;
}

/**
 * Get emotional reaction to events for a character
 */
export function getEmotionalReaction(character, eventType, eventIntensity) {
  // Handle invalid inputs
  if (!character || !eventType || eventIntensity == null) {
    return null;
  }

  const personality = character.personality || {};
  const traits = personality.traits || {};

  // Base reactions to different event types
  const eventReactions = {
    'success': {
      baseIntensity: 0.7,
      baseDuration: 8,
      frequencyChange: 3
    },
    'failure': {
      baseIntensity: 0.6,
      baseDuration: 10,
      frequencyChange: -4
    },
    'social_positive': {
      baseIntensity: 0.5,
      baseDuration: 6,
      frequencyChange: 2
    },
    'social_negative': {
      baseIntensity: 0.6,
      baseDuration: 8,
      frequencyChange: -3
    },
    'conflict': {
      baseIntensity: 0.8,
      baseDuration: 12,
      frequencyChange: -2
    },
    'achievement': {
      baseIntensity: 0.8,
      baseDuration: 15,
      frequencyChange: 5
    }
  };

  const reaction = eventReactions[eventType] || {
    baseIntensity: 0.4,
    baseDuration: 5,
    frequencyChange: 0
  };

  // Personality modifiers
  const empathy = traits.empathy || 0.5;
  const volatility = traits.volatility || 0.5;
  const resilience = traits.resilience || 0.5;

  // Calculate final reaction
  let intensity = reaction.baseIntensity * eventIntensity;
  
  // Empathy affects social events more
  if (eventType.includes('social')) {
    intensity *= (0.5 + empathy);
  }
  
  // Volatility affects all emotional reactions
  intensity *= (0.5 + volatility);
  
  // Resilience reduces negative reactions
  if (reaction.frequencyChange < 0) {
    intensity *= (1.5 - resilience);
  }

  // Duration affected by volatility and resilience
  let duration = reaction.baseDuration;
  duration *= (0.5 + volatility); // More volatile = longer reactions
  duration *= (1.5 - resilience); // More resilient = shorter negative reactions

  return {
    intensity: Math.max(0.1, Math.min(1.0, intensity)),
    duration: Math.max(1, Math.round(duration)),
    frequencyChange: reaction.frequencyChange
  };
}

/**
 * Calculate emotional contagion between characters
 */
export function calculateEmotionalContagion(sourceCharacter, targetCharacter, interactionStrength = 1.0) {
  // Handle invalid inputs
  if (!sourceCharacter || !targetCharacter) {
    return {
      effect: 0,
      targetEmotion: 'content',
      intensity: 0,
      frequencyShift: 0
    };
  }

  const sourceCons = sourceCharacter.consciousness || { frequency: 40, coherence: 0.7 };
  const targetCons = targetCharacter.consciousness || { frequency: 40, coherence: 0.7 };
  
  const sourcePersonality = sourceCharacter.personality || { traits: {} };
  const targetPersonality = targetCharacter.personality || { traits: {} };

  // Calculate source emotional state (simplified)
  const sourceFreq = sourceCons.frequency || 40;
  let sourceEmotion = 'content';
  if (sourceFreq < 30) sourceEmotion = 'tired';
  else if (sourceFreq > 50) sourceEmotion = 'alert';
  else if (sourceFreq > 65) sourceEmotion = 'energized';

  // Personality factors
  const sourceCharisma = sourcePersonality.traits.charisma || 0.5;
  const targetEmpathy = targetPersonality.traits.empathy || 0.5;
  const targetSuggestibility = targetPersonality.traits.suggestibility || 0.5;

  // Calculate frequency difference
  const freqDiff = sourceFreq - (targetCons.frequency || 40);
  
  // Calculate contagion effect
  const empathyFactor = targetEmpathy * 0.4;
  const charismaFactor = sourceCharisma * 0.3;
  const interactionFactor = interactionStrength * 0.3;
  
  const baseEffect = empathyFactor + charismaFactor + interactionFactor;
  const frequencyInfluence = Math.abs(freqDiff) / 50; // Larger differences have more impact
  
  const totalEffect = Math.min(1.0, baseEffect * (1 + frequencyInfluence));

  // Calculate frequency shift toward source
  const frequencyShift = freqDiff * totalEffect * 0.2; // Small influence
  
  // Calculate intensity based on various factors
  const intensity = Math.min(1.0, totalEffect * (0.5 + targetSuggestibility * 0.5));

  return {
    effect: totalEffect,
    targetEmotion: sourceEmotion,
    intensity: intensity,
    frequencyShift: frequencyShift
  };
}

const EmotionalUtils = {
  getEmotionalModifier,
  getEmotionalReaction,
  calculateEmotionalContagion
};

export default EmotionalUtils;
