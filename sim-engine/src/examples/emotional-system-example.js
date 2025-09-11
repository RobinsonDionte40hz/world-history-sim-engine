/* eslint-disable no-undef, no-unused-vars, no-const-assign */
// Example: Emotional State System in Action
// This demonstrates how the consciousness-based emotional system enhances NPC behavior
// NOTE: This is a documentation/example file - variables are used for illustration

/*
=== SCENARIO: Village Blacksmith's Emotional Journey ===

Initial State:
- Base frequency: 7.5 Hz (content)
- Current emotion: content/stable
- Energy: 0.6

EVENT 1: Successfully crafts masterwork sword
*/

// Example character for demonstration
let character = null; // This would be a real Character instance in practice

// Apply success event
character = character?.withEmotionalEvent('success', 0.8, 120); // High intensity, 2 hours

// Result:
// - Frequency: 7.5 + (2 * 0.8) = 9.1 Hz (now 'alert/engaged')
// - Current emotion: proud/confident
// - Energy multiplier: 1.2

// Behavior changes:
// - leadership interactions: +50% weight (1.5x)
// - social interactions: +30% weight (1.3x) 
// - work interactions: +30% weight (1.3x)
// - More likely to take on ambitious projects

/*
EVENT 2: 30 minutes later, customer insults his work
*/

// Apply embarrassment event while still proud
character = character?.withEmotionalEvent('embarrassment', 0.6, 90);

// Result:
// - Frequency: 9.1 + (-1 * 0.6) = 8.5 Hz (still 'alert' but dropping)
// - Dominant emotion now: ashamed/withdrawn (overrides proud due to intensity)
// - Energy multiplier: 0.85

// Behavior changes:
// - social interactions: 0.2x weight (avoids people)
// - hiding behaviors: 1.8x weight (wants to hide)
// - work continues but less enthusiastically

/*
EVENT 3: 1 hour later, friend comes to comfort him
*/

// Social support helps
character = character?.withEmotionalEvent('friendship', 0.5, 60);

// Result:
// - Frequency: 8.5 + (1 * 0.5) = 9.0 Hz
// - Emotions now blending: ashamed fading, happy emerging
// - Multiple emotional modifiers active

/*
OVER TIME: Emotional decay and frequency drift
*/

// Call every game hour or turn
character = character?.withUpdatedEmotionalState();

// What happens:
// 1. Emotional modifiers decay over time (exponential decay)
// 2. Frequency drifts back toward baseline (7.5 Hz)
// 3. Character gradually returns to normal emotional state
// 4. Extreme emotions fade, leaving personality-based decisions

/*
=== PRACTICAL SIMULATION BENEFITS ===

1. DYNAMIC PERSONALITY
   - Same character behaves differently based on recent events
   - Creates realistic emotional arcs and character development

2. EMERGENT STORYTELLING
   - Success leads to confidence leads to ambitious projects
   - Failure leads to withdrawal leads to missed opportunities
   - Social events create cascading emotional effects

3. REALISTIC SOCIAL DYNAMICS
   - Angry characters start conflicts
   - Sad characters need comfort
   - Happy characters spread joy through emotional contagion

4. GAMEPLAY DEPTH
   - Player actions have lasting emotional consequences
   - NPCs remember and react based on emotional history
   - Settlement mood affects individual character emotions

5. HISTORICAL REALISM
   - Major events (wars, famines, celebrations) create collective emotions
   - Emotional states influence historical decisions
   - Cultural/religious practices affect emotional baselines
*/

// Example interaction weight calculation:
function demonstrateEmotionalWeighting() {
  // Mock functions for demonstration
  const getCharacterWithEmotionalState = (primary, secondary, intensity) => ({
    emotionalState: { primary, secondary, intensity }
  });
  
  const character = getCharacterWithEmotionalState('angry', 'distrustful', 0.8);
  const socialInteraction = { type: 'social', category: 'friendly_chat' };
  const combatInteraction = { type: 'combat', category: 'duel' };
  
  // Social interaction with angry character:
  // Base weight: 5
  // Emotional modifier: 0.4 (angry characters avoid social)
  // Final weight: 5 * 0.4 = 2 (much less likely)
  
  // Combat interaction with angry character:
  // Base weight: 3  
  // Emotional modifier: 2.0 (angry characters seek conflict)
  // Final weight: 3 * 2.0 = 6 (much more likely)
  
  console.log('Angry character avoids social, seeks combat - realistic!');
  return { character, socialInteraction, combatInteraction };
}

// Example emotional contagion:
function demonstrateEmotionalContagion() {
  // Mock functions for demonstration
  const getCharacterWithEmotionalState = (primary, secondary, intensity) => ({
    emotionalState: { primary, secondary, intensity }
  });
  
  const calculateEmotionalContagion = (sourceChar, targetChar, proximity) => {
    // Mock implementation
    return { eventType: 'joyful', intensity: 0.3, duration: 30 };
  };
  
  const happyCharacter = getCharacterWithEmotionalState('joyful', 'social', 0.9);
  let neutralCharacter = getCharacterWithEmotionalState('content', 'stable', 0.5);
  
  // Happy character enters tavern where neutral character is drinking
  const contagion = calculateEmotionalContagion(happyCharacter, neutralCharacter, 1.0);
  
  if (contagion) {
    neutralCharacter = neutralCharacter.withEmotionalEvent?.(
      contagion.eventType,
      contagion.intensity, 
      contagion.duration
    );
    // Neutral character becomes slightly happier due to proximity
  }
  
  return { happyCharacter, neutralCharacter, contagion };
}

// Integration with existing trauma system:
function demonstrateTraumaIntegration() {
  // Mock function for demonstration
  const getBaseCharacter = () => ({
    withTrauma: (trauma) => ({ trauma }),
    withEmotionalEvent: (type, intensity, duration) => ({ emotionalEvent: { type, intensity, duration } })
  });
  
  let character = getBaseCharacter();
  
  // Apply trauma (existing system)
  character = character.withTrauma({
    type: 'loss',
    description: 'Lost spouse in battle',
    intensity: 0.9
  });
  
  // Trauma automatically triggers emotional event
  character = character.withEmotionalEvent('loss', 0.9, 1440); // 24 hours of grief
  
  // Result: Character now has both:
  // 1. Permanent personality changes (from trauma)
  // 2. Temporary emotional state (sad/withdrawn)
  // 3. Behavioral changes that gradually fade but leave lasting impact
  
  return character;
}

export {
  demonstrateEmotionalWeighting,
  demonstrateEmotionalContagion,
  demonstrateTraumaIntegration
};
