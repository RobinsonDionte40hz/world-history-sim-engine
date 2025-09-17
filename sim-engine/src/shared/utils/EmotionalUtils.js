// src/shared/utils/EmotionalUtils.js

/**
 * Practical emotional state modifiers for simulation behavior
 * Maps emotional states to interaction multipliers
 */
function getEmotionalModifier(emotionalState, interaction) {
  const modifiers = {
    // Low energy states
    'exhausted': {
      rest: 3.0,        // Desperately need rest
      social: 0.2,      // Avoid social interactions
      work: 0.3,        // Can't work effectively
      movement: 0.4,    // Slow movement
      physical: 0.2     // No physical activities
    },
    'tired': {
      rest: 2.0,        // Want rest
      social: 0.6,      // Less social
      work: 0.7,        // Reduced work efficiency
      complex_tasks: 0.5, // Avoid complex tasks
      physical: 0.6     // Reduced physical ability
    },
    
    // Normal baseline
    'content': {
      // No modifiers - this is the baseline (1.0 for everything)
    },
    
    // Alert/active states
    'alert': {
      work: 1.3,        // More productive
      learning: 1.4,    // Better at learning
      social: 1.2,      // More social
      exploration: 1.3, // More willing to explore
      perception: 1.5   // Better awareness
    },
    'energized': {
      work: 1.5,        // Very productive
      physical: 1.6,    // Loves physical work
      social: 1.4,      // Very social
      ambitious_tasks: 1.5, // Takes on big projects
      building: 1.4     // Great for construction
    },
    'excited': {
      creative: 1.8,    // Bursts of creativity
      social: 1.6,      // Very outgoing
      risky_actions: 1.4, // More willing to take risks
      impulsive: 1.5,   // Acts impulsively
      celebration: 2.0  // Wants to party
    },
    'manic': {
      risky_actions: 2.5, // Dangerously reckless
      impulsive: 2.0,   // Very impulsive
      rest: 0.2,        // Won't rest
      rational: 0.4,    // Poor decision making
      hyperactive: 3.0  // Can't stop moving
    },
    
    // Positive emotional modifiers from events
    'proud': {
      leadership: 1.5,  // More likely to lead
      social: 1.3,      // Wants to share success
      confident_actions: 1.4, // Takes confident actions
      teaching: 1.6     // Wants to mentor others
    },
    'joyful': {
      social: 1.8,      // Very social
      generous: 1.5,    // More generous
      celebration: 2.0, // Wants to celebrate
      creative: 1.4,    // Creative burst
      romance: 1.6      // Open to romantic interactions
    },
    'happy': {
      social: 1.4,      // More social
      work: 1.2,        // Work feels easier
      helpful: 1.5,     // Wants to help others
      optimistic: 1.3   // Positive outlook
    },
    'satisfied': {
      work: 1.3,        // Motivated to continue
      planning: 1.4,    // Good for long-term planning
      mentoring: 1.5    // Wants to share knowledge
    },
    'curious': {
      learning: 1.8,    // Wants to learn everything
      exploration: 1.7, // Must explore
      investigation: 1.9, // Investigates mysteries
      social: 1.2       // Asks questions
    },
    
    // Negative emotional modifiers from events
    'angry': {
      conflict: 2.0,    // Seeks conflict
      social: 0.4,      // Avoids most social interaction
      aggressive: 1.8,  // Aggressive behaviors
      patience: 0.3,    // No patience
      combat: 1.6,      // More likely to fight
      destructive: 1.5  // May break things
    },
    'sad': {
      social: 0.3,      // Withdraws socially
      self_care: 0.5,   // Neglects self-care
      creative: 1.3,    // Sometimes creative when sad
      comfort_seeking: 1.8, // Seeks comfort
      melancholy: 1.5,  // Brooding behaviors
      rest: 1.4         // Wants to sleep more
    },
    'disappointed': {
      motivation: 0.6,  // Less motivated
      social: 0.7,      // Less social
      self_doubt: 1.4,  // Questions abilities
      careful: 1.3      // More cautious
    },
    'stressed': {
      irritability: 1.6, // More irritable
      focus: 0.7,       // Poor focus
      social: 0.6,      // Avoids social stress
      urgent_tasks: 1.3, // Focuses on urgent things
      anxiety: 1.4      // Anxious behaviors
    },
    'anxious': {
      risky_actions: 0.2, // Avoids risk
      familiar: 1.5,    // Sticks to familiar
      social: 0.6,      // Reduced social interaction
      checking: 1.8,    // Obsessive checking
      escape: 1.4,      // Wants to flee
      safe_spaces: 1.6  // Seeks safety
    },
    'ashamed': {
      social: 0.2,      // Avoids social contact
      hiding: 1.8,      // Wants to hide
      self_punishment: 1.4, // Self-destructive
      isolation: 1.6    // Isolates self
    },
    'distrustful': {
      social: 0.5,      // Less trusting socially
      suspicious: 1.7,  // Suspicious behaviors
      guarded: 1.5,     // Guarded interactions
      verification: 1.6 // Wants to verify everything
    }
  };
  
  const interactionType = interaction.type || interaction.category || 'social';
  const emotionMods = modifiers[emotionalState.primary] || {};
  const secondaryMods = modifiers[emotionalState.secondary] || {};
  
  // Combine primary and secondary emotional influences
  const primaryModifier = emotionMods[interactionType] || 1.0;
  const secondaryModifier = secondaryMods[interactionType] || 1.0;
  
  // Primary emotion has more weight (70% primary, 30% secondary)
  const combinedModifier = (primaryModifier * 0.7) + (secondaryModifier * 0.3);
  
  // Apply intensity scaling
  const intensity = emotionalState.intensity || 0.5;
  const finalModifier = 1.0 + ((combinedModifier - 1.0) * intensity);
  
  // Clamp to reasonable bounds
  return Math.max(0.1, Math.min(3.0, finalModifier));
}

/**
 * Get emotional reaction to interaction outcomes
 */
function getEmotionalReaction(interaction, outcome, character) {
  const reactionMap = {
    'positive': {
      social: 'friendship',
      work: 'satisfaction', 
      learning: 'discovery',
      combat: 'success',
      romance: 'love',
      creative: 'achievement'
    },
    'negative': {
      social: 'embarrassment',
      work: 'failure',
      learning: 'disappointment',
      combat: 'fear',
      romance: 'rejection',
      betrayal: 'betrayal'
    },
    'neutral': {
      // No strong emotional reaction
    }
  };
  
  const interactionType = interaction.type || interaction.category || 'social';
  const reactions = reactionMap[outcome] || {};
  
  return reactions[interactionType] || null;
}

/**
 * Calculate emotional contagion between characters
 */
function calculateEmotionalContagion(sourceCharacter, targetCharacter, proximity = 1.0) {
  if (!sourceCharacter.consciousness || !targetCharacter.consciousness) {
    return null;
  }
  
  const sourceEmotion = sourceCharacter.consciousness.getCurrentEmotionalState();
  
  // Calculate contagion strength based on relationship and personality
  const relationship = sourceCharacter.relationships?.get(targetCharacter.id) || { bond: 0 };
  const relationshipStrength = Math.abs(relationship.bond) / 100; // 0-1 scale
  
  // Empathy affects contagion susceptibility
  const targetEmpathy = targetCharacter.personality?.getTrait('empathy')?.intensity || 0.5;
  
  // Strong emotions are more contagious
  const emotionalStrength = sourceEmotion.intensity || 0.5;
  
  // Calculate contagion effect
  const contagionStrength = proximity * relationshipStrength * targetEmpathy * emotionalStrength * 0.3;
  
  if (contagionStrength > 0.1) {
    return {
      eventType: sourceEmotion.primary,
      intensity: contagionStrength,
      duration: 30 // Shorter duration for contagion
    };
  }
  
  return null;
}

/**
 * Resolve emotional conflicts when multiple strong emotions overlap
 */
function resolveEmotionalConflicts(emotions) {
  // Handle edge cases
  if (!emotions) {
    return null;
  }
  
  if (emotions.length === 0) {
    return [];
  }
  
  if (emotions.length === 1) {
    return emotions[0];
  }

  // Define conflicting emotion pairs and their complex emotional resolutions
  const conflictPairs = [
    {
      emotions: ['joyful', 'sad'],
      resolution: 'bittersweet',
      description: 'Mixed feelings of joy and sadness'
    },
    {
      emotions: ['angry', 'content'],
      resolution: 'conflicted',
      description: 'Internal struggle between anger and contentment'
    },
    {
      emotions: ['excited', 'anxious'],
      resolution: 'nervous_excitement',
      description: 'Excited but with underlying anxiety'
    },
    {
      emotions: ['proud', 'ashamed'],
      resolution: 'ambivalent',
      description: 'Conflicted between pride and shame'
    },
    {
      emotions: ['happy', 'distrustful'],
      resolution: 'cautiously_optimistic',
      description: 'Happy but maintaining caution'
    },
    {
      emotions: ['curious', 'anxious'],
      resolution: 'apprehensive_interest',
      description: 'Interested but worried about consequences'
    },
    {
      emotions: ['energized', 'stressed'],
      resolution: 'frantic',
      description: 'High energy mixed with stress'
    },
    {
      emotions: ['satisfied', 'disappointed'],
      resolution: 'resigned',
      description: 'Accepting mixed outcomes'
    }
  ];

  // Check for conflicting emotions
  for (const conflict of conflictPairs) {
    if (hasConflictingEmotions(emotions, conflict.emotions)) {
      return createComplexEmotionalState(emotions, conflict);
    }
  }

  // If no specific conflicts found, blend similar intensity emotions
  return blendSimilarEmotions(emotions);
}

/**
 * Check if emotions contain conflicting pairs
 */
function hasConflictingEmotions(emotions, conflictPair) {
  const emotionNames = emotions.map(e => e.name || e.primary || e);
  return conflictPair.every(emotion => emotionNames.includes(emotion));
}

/**
 * Create a complex emotional state from conflicting emotions
 */
function createComplexEmotionalState(emotions, conflict) {
  // Find the conflicting emotions and calculate their combined intensity
  const conflictingEmotions = emotions.filter(emotion => {
    const emotionName = emotion.name || emotion.primary || emotion;
    return conflict.emotions.includes(emotionName);
  });

  // Calculate average intensity of conflicting emotions
  const totalIntensity = conflictingEmotions.reduce((sum, emotion) => {
    return sum + (emotion.intensity || 0.5);
  }, 0);
  const averageIntensity = totalIntensity / conflictingEmotions.length;

  // Create the complex emotional state
  const complexEmotion = {
    primary: conflict.resolution,
    secondary: conflictingEmotions[0].name || conflictingEmotions[0].primary || conflictingEmotions[0],
    intensity: Math.min(averageIntensity * 1.2, 1.0), // Slight intensity boost for conflict
    isComplex: true,
    conflictedEmotions: conflictingEmotions.map(e => e.name || e.primary || e),
    description: conflict.description,
    duration: Math.max(...conflictingEmotions.map(e => e.duration || 60))
  };

  // Add non-conflicting emotions as modifiers
  const nonConflictingEmotions = emotions.filter(emotion => {
    const emotionName = emotion.name || emotion.primary || emotion;
    return !conflict.emotions.includes(emotionName);
  });

  return {
    ...complexEmotion,
    modifiers: nonConflictingEmotions
  };
}

/**
 * Blend emotions of similar valence and intensity
 */
function blendSimilarEmotions(emotions) {
  if (emotions.length === 1) {
    return emotions[0];
  }

  // Sort emotions by intensity (strongest first)
  const sortedEmotions = [...emotions].sort((a, b) => {
    const intensityA = a.intensity || 0.5;
    const intensityB = b.intensity || 0.5;
    return intensityB - intensityA;
  });

  // Primary emotion is the strongest
  const primaryEmotion = sortedEmotions[0];
  
  // If there's a strong secondary emotion, include it
  const secondaryEmotion = sortedEmotions.length > 1 ? sortedEmotions[1] : null;
  
  // Calculate blended intensity
  const primaryIntensity = primaryEmotion.intensity || 0.5;
  const secondaryIntensity = secondaryEmotion?.intensity || 0;
  
  // Primary emotion dominates, but secondary adds complexity
  const blendedIntensity = primaryIntensity * 0.7 + secondaryIntensity * 0.3;

  return {
    primary: primaryEmotion.name || primaryEmotion.primary || primaryEmotion,
    secondary: secondaryEmotion ? (secondaryEmotion.name || secondaryEmotion.primary || secondaryEmotion) : null,
    intensity: Math.min(blendedIntensity, 1.0),
    isBlended: true,
    components: sortedEmotions.slice(0, 3), // Keep top 3 emotions as components
    duration: Math.max(...sortedEmotions.map(e => e.duration || 60))
  };
}

/**
 * Get behavioral modifiers for complex emotional states
 */
function getComplexEmotionalModifier(complexEmotion, interaction) {
  if (!complexEmotion.isComplex && !complexEmotion.isBlended) {
    return getEmotionalModifier(complexEmotion, interaction);
  }

  // Handle complex emotions with special modifier combinations
  const complexModifiers = {
    'bittersweet': {
      social: 0.8,          // Reduced social interaction
      creative: 1.4,        // Enhanced creativity from mixed feelings
      contemplative: 1.6,   // More thoughtful
      melancholy: 1.3,      // Touches of sadness
      grateful: 1.2         // Appreciation for good things
    },
    'conflicted': {
      decision_making: 0.6, // Poor decision making
      internal_struggle: 1.8, // Internal conflict behaviors
      social: 0.7,          // Reduced social confidence
      planning: 0.8,        // Difficulty planning
      emotional_expression: 1.4 // More emotional expression
    },
    'nervous_excitement': {
      impulsive: 1.3,       // More impulsive
      energetic: 1.4,       // High energy
      social: 1.2,          // Social but nervous
      risky_actions: 1.1,   // Slightly more risky
      fidgety: 1.6          // Can't sit still
    },
    'ambivalent': {
      hesitation: 1.7,      // Lots of hesitation
      self_reflection: 1.5, // More introspective
      social: 0.6,          // Reduced social interaction
      commitment: 0.7,      // Difficulty committing
      mood_swings: 1.4      // Emotional instability
    },
    'cautiously_optimistic': {
      social: 0.9,          // Slightly reduced social
      planning: 1.3,        // Better planning
      careful: 1.4,         // More careful approach
      hopeful: 1.2,         // Maintains hope
      verification: 1.3     // Wants to verify things
    },
    'apprehensive_interest': {
      learning: 1.2,        // Still wants to learn
      cautious: 1.5,        // Very cautious approach
      observation: 1.6,     // Prefers observing first
      social: 0.8,          // Less direct social interaction
      escape_planning: 1.3  // Plans exit strategies
    },
    'frantic': {
      hyperactive: 1.8,     // Can't stop moving
      impulsive: 1.6,       // Very impulsive
      focus: 0.4,           // Poor focus
      social: 1.3,          // High social energy but scattered
      mistakes: 1.5         // More prone to errors
    },
    'resigned': {
      acceptance: 1.4,      // Accepts situation
      motivation: 0.7,      // Reduced motivation
      social: 0.8,          // Less social energy
      routine: 1.3,         // Sticks to routine
      philosophical: 1.2    // More philosophical
    }
  };

  const interactionType = interaction.type || interaction.category || 'social';
  const emotionMods = complexModifiers[complexEmotion.primary] || {};
  
  // Get base modifier
  let modifier = emotionMods[interactionType] || 1.0;
  
  // Apply intensity scaling
  const intensity = complexEmotion.intensity || 0.5;
  const finalModifier = 1.0 + ((modifier - 1.0) * intensity);
  
  // Clamp to reasonable bounds
  return Math.max(0.1, Math.min(3.0, finalModifier));
}

/**
 * Create an emotional memory that links events to emotional states
 * This enhances memory formation and retrieval based on emotional significance
 */
function createEmotionalMemory(event, emotionalState) {
  return {
    ...event,
    emotionalContext: {
      state: emotionalState.primary,
      secondary: emotionalState.secondary,
      intensity: emotionalState.intensity,
      frequency: emotionalState.frequency,
      coherence: emotionalState.coherence,
      isComplex: emotionalState.isComplex,
      description: emotionalState.description
    },
    // Strong emotions create stronger, more lasting memories
    memorySalience: calculateMemorySalience(emotionalState),
    // Emotional triggers that can later retrieve this memory
    retrievalTriggers: getEmotionalTriggers(emotionalState),
    // Memory decay rate influenced by emotional intensity
    decayRate: calculateEmotionalDecayRate(emotionalState),
    // Emotional valence affects memory retention
    valence: calculateEmotionalValence(emotionalState.primary)
  };
}

/**
 * Calculate memory salience based on emotional state
 * Strong emotions create more salient memories
 */
function calculateMemorySalience(emotionalState) {
  // Default values for missing properties
  const intensity = emotionalState.intensity || 0.5;
  const frequency = emotionalState.frequency || 40;
  const coherence = emotionalState.coherence || 0.7;
  
  let baseSalience = intensity * 1.5;
  
  // Complex emotional states are more memorable
  if (emotionalState.isComplex) {
    baseSalience *= 1.3;
  }
  
  // High frequency states (alert/energized) enhance encoding
  if (frequency > 10) {
    baseSalience *= 1.2;
  }
  
  // Low coherence reduces memory formation
  if (coherence < 0.5) {
    baseSalience *= 0.8;
  }
  
  // Extreme emotional states are highly memorable
  const extremeEmotions = ['manic', 'frantic', 'bittersweet', 'conflicted'];
  if (extremeEmotions.includes(emotionalState.primary)) {
    baseSalience *= 1.4;
  }
  
  return Math.min(baseSalience, 3.0); // Cap at 3x normal salience
}

/**
 * Generate emotional triggers that can later retrieve this memory
 */
function getEmotionalTriggers(emotionalState) {
  const triggers = [];
  
  // Primary emotion as main trigger
  triggers.push({
    type: 'emotional_state',
    value: emotionalState.primary,
    strength: 0.8
  });
  
  // Secondary emotion as additional trigger
  if (emotionalState.secondary) {
    triggers.push({
      type: 'emotional_state',
      value: emotionalState.secondary,
      strength: 0.6
    });
  }
  
  // Frequency range triggers
  const freqRange = getFrequencyRange(emotionalState.frequency);
  triggers.push({
    type: 'frequency_range',
    value: freqRange,
    strength: 0.5
  });
  
  // Complex state triggers
  if (emotionalState.isComplex) {
    triggers.push({
      type: 'complex_emotion',
      value: emotionalState.primary,
      strength: 0.7
    });
    
    // Add conflicted emotion triggers if available
    if (emotionalState.conflictedEmotions) {
      emotionalState.conflictedEmotions.forEach(emotion => {
        triggers.push({
          type: 'conflicted_emotion',
          value: emotion,
          strength: 0.6
        });
      });
    }
  }
  
  return triggers;
}

/**
 * Calculate emotional decay rate for memory
 * Positive emotions tend to last longer, trauma creates persistent memories
 */
function calculateEmotionalDecayRate(emotionalState) {
  const baseDecayRate = 0.05; // Default decay rate
  
  // Get emotional valence
  const valence = calculateEmotionalValence(emotionalState.primary);
  
  // Extreme emotional states are very persistent
  const extremeEmotions = ['manic', 'frantic', 'bittersweet', 'conflicted'];
  if (extremeEmotions.includes(emotionalState.primary) || 
      (emotionalState.intensity && emotionalState.intensity > 0.8)) {
    return baseDecayRate * 0.4; // Much slower decay for extreme states
  }
  
  // Positive emotions decay slower (easier to forget negative experiences)
  if (valence > 0) {
    return baseDecayRate * 0.8;
  }
  
  // Negative emotions can be more persistent (trauma effect)
  if (valence < -0.5) {
    return baseDecayRate * 0.6;
  }
  
  // Complex emotions are more persistent
  if (emotionalState.isComplex) {
    return baseDecayRate * 0.7;
  }
  
  return baseDecayRate;
}

/**
 * Calculate emotional valence (-1 to +1)
 */
function calculateEmotionalValence(emotion) {
  const valenceMap = {
    // Positive emotions
    'joyful': 0.9,
    'happy': 0.8,
    'excited': 0.7,
    'content': 0.6,
    'satisfied': 0.7,
    'proud': 0.8,
    'energized': 0.6,
    'alert': 0.3,
    'curious': 0.4,
    
    // Negative emotions
    'sad': -0.7,
    'angry': -0.8,
    'anxious': -0.6,
    'stressed': -0.7,
    'ashamed': -0.8,
    'disappointed': -0.6,
    'distrustful': -0.5,
    'tired': -0.3,
    'exhausted': -0.8,
    
    // Complex emotions (mixed valence)
    'bittersweet': 0.1,
    'conflicted': -0.2,
    'nervous_excitement': 0.2,
    'ambivalent': 0.0,
    'cautiously_optimistic': 0.3,
    'apprehensive_interest': 0.1,
    'frantic': -0.4,
    'resigned': -0.3,
    
    // Extreme states
    'manic': -0.2, // Positive but potentially destructive
  };
  
  return valenceMap[emotion] || 0.0;
}

/**
 * Get frequency range category for memory triggers
 */
function getFrequencyRange(frequency) {
  if (frequency < 4) return 'very_low';
  if (frequency < 6) return 'low';
  if (frequency < 8) return 'normal';
  if (frequency < 10) return 'high';
  if (frequency < 12) return 'very_high';
  return 'extreme';
}

/**
 * Retrieve memories based on current emotional state
 * This allows emotional state to trigger relevant past memories
 */
function retrieveEmotionalMemories(character, currentEmotionalState, maxResults = 10) {
  if (!character.decisionHistory) {
    return [];
  }
  
  const relevantMemories = [];
  
  character.decisionHistory.forEach(memory => {
    if (!memory.emotionalContext) return;
    
    let relevanceScore = 0;
    
    // Check emotional state similarity
    if (memory.emotionalContext.state === currentEmotionalState.primary) {
      relevanceScore += 0.8;
    }
    
    if (memory.emotionalContext.secondary === currentEmotionalState.primary ||
        memory.emotionalContext.state === currentEmotionalState.secondary) {
      relevanceScore += 0.6;
    }
    
    // Check frequency similarity
    const freqDiff = Math.abs(memory.emotionalContext.frequency - currentEmotionalState.frequency);
    if (freqDiff < 2) {
      relevanceScore += 0.4;
    }
    
    // Complex emotions can trigger other complex emotions
    if (memory.emotionalContext.isComplex && currentEmotionalState.isComplex) {
      relevanceScore += 0.5;
    }
    
    // Check retrieval triggers
    if (memory.retrievalTriggers) {
      memory.retrievalTriggers.forEach(trigger => {
        if (trigger.type === 'emotional_state' && trigger.value === currentEmotionalState.primary) {
          relevanceScore += trigger.strength;
        }
        
        if (trigger.type === 'frequency_range' && 
            trigger.value === getFrequencyRange(currentEmotionalState.frequency)) {
          relevanceScore += trigger.strength;
        }
      });
    }
    
    if (relevanceScore > 0.3) {
      relevantMemories.push({
        memory,
        relevanceScore,
        emotionalResonance: calculateEmotionalResonance(memory.emotionalContext, currentEmotionalState)
      });
    }
  });
  
  // Sort by relevance and return top results
  return relevantMemories
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Calculate emotional resonance between past and current emotional states
 */
function calculateEmotionalResonance(pastEmotion, currentEmotion) {
  let resonance = 0;
  
  // Same primary emotions resonate strongly
  if (pastEmotion.state === currentEmotion.primary) {
    resonance += 0.8;
  }
  
  // Similar intensity levels resonate
  const intensityDiff = Math.abs(pastEmotion.intensity - currentEmotion.intensity);
  resonance += Math.max(0, 0.5 - intensityDiff);
  
  // Similar frequency ranges resonate
  const freqDiff = Math.abs(pastEmotion.frequency - currentEmotion.frequency);
  resonance += Math.max(0, 0.3 - (freqDiff / 10));
  
  // Complex emotions resonate with each other
  if (pastEmotion.isComplex && currentEmotion.isComplex) {
    resonance += 0.4;
  }
  
  return Math.min(resonance, 1.0);
}

/**
 * Enhanced memory formation that considers emotional context
 */
function enhanceMemoryWithEmotion(character, event, emotionalState) {
  // Create emotional memory
  const emotionalMemory = createEmotionalMemory(event, emotionalState);
  
  // Add to character's decision history with emotional context
  if (!character.decisionHistory) {
    character.decisionHistory = [];
  }
  
  character.decisionHistory.push(emotionalMemory);
  
  // Sort memories by salience (most salient first)
  character.decisionHistory.sort((a, b) => {
    const salienceA = a.memorySalience || 1.0;
    const salienceB = b.memorySalience || 1.0;
    return salienceB - salienceA;
  });
  
  // Limit memory storage (keep most salient memories)
  const maxMemories = 50;
  if (character.decisionHistory.length > maxMemories) {
    character.decisionHistory = character.decisionHistory.slice(0, maxMemories);
  }
  
  return emotionalMemory;
}

export {
  getEmotionalModifier,
  getEmotionalReaction,
  calculateEmotionalContagion,
  resolveEmotionalConflicts,
  getComplexEmotionalModifier,
  createEmotionalMemory,
  retrieveEmotionalMemories,
  enhanceMemoryWithEmotion
};
