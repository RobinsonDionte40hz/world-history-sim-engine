// src/shared/utils/EmotionalUtils.js

/**
 * Practical emotional state modifiers for simulation behavior
 * Maps emotional states to interaction multipliers
 */
export function getEmotionalModifier(emotionalState, interaction) {
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
export function getEmotionalReaction(interaction, outcome, character) {
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
export function calculateEmotionalContagion(sourceCharacter, targetCharacter, proximity = 1.0) {
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

const EmotionalUtils = {
  getEmotionalModifier,
  getEmotionalReaction,
  calculateEmotionalContagion
};

export default EmotionalUtils;
