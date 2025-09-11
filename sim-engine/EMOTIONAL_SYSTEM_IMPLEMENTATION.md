# Consciousness-Based Emotional System Implementation

## Overview

This implementation combines your existing quantum consciousness framework with practical emotional states that directly influence NPC behavior in your simulation. Instead of adding a separate emotional system, we enhance your consciousness frequency bands to surface emotional states that drive realistic behavior changes.

## ✅ What's Been Implemented

### 1. Enhanced ConsciousnessState (`ConsciousnessSystem.js`)

**New Properties:**
- `baseEmotionalState`: Starting emotional baseline (default: 'content')
- `emotionalModifiers`: Map of temporary emotional shifts from events
- `emotionalDecayRate`: How fast emotions return to baseline (default: 0.05)

**New Methods:**
- `getCurrentEmotionalState()`: Maps consciousness frequency to practical emotions
- `applyEmotionalEvent(eventType, intensity, duration)`: Applies emotional events
- `updateEmotionalState()`: Decays emotions and drifts frequency back to baseline

**Frequency-to-Emotion Mapping:**
```
< 4 Hz:  exhausted/withdrawn  (energy: 0.2)
4-6 Hz:  tired/cautious       (energy: 0.4) 
6-8 Hz:  content/stable       (energy: 0.6) ← Normal baseline
8-10 Hz: alert/engaged        (energy: 0.8)
10-12 Hz: energized/motivated (energy: 0.9)
12-15 Hz: excited/ambitious   (energy: 1.0)
> 15 Hz: manic/reckless       (energy: 1.2) ← Dangerous
```

### 2. Emotional Utils (`EmotionalUtils.js`)

**Functions:**
- `getEmotionalModifier(emotionalState, interaction)`: Returns 0.1x to 3.0x multiplier
- `getEmotionalReaction(interaction, outcome, character)`: Determines emotional responses
- `calculateEmotionalContagion(sourceChar, targetChar, proximity)`: Social emotion spread

**Practical Modifiers Examples:**
- **Exhausted**: rest +3.0x, social 0.2x, work 0.3x
- **Angry**: conflict +2.0x, social 0.4x, aggressive +1.8x
- **Joyful**: social +1.8x, generous +1.5x, celebration +2.0x
- **Anxious**: risky_actions 0.2x, familiar +1.5x, checking +1.8x

### 3. Enhanced Character Entity (`Character.js`)

**New Methods:**
- `withEmotionalEvent(eventType, intensity, duration)`: Apply emotional events
- `withUpdatedEmotionalState()`: Update/decay emotional state
- `getCurrentEmotionalState()`: Get current emotional state for decisions

### 4. GenerateBehavior Integration (`GenerateBehavior.js`)

**Enhanced Weight Calculation:**
- Added emotional state influence as factor #6
- Applies emotional modifiers to interaction weights
- Includes strong emotional overrides for specific states

## 🎯 How It Works in Practice

### Example: Village Blacksmith's Day

```javascript
// Morning: Content baseline
character.consciousness.currentFrequency = 7.5 // content/stable

// Event: Successfully crafts masterwork sword
character = character.withEmotionalEvent('success', 0.8, 120);
// Frequency: 7.5 + (2 * 0.8) = 9.1 Hz (alert/engaged)
// Emotion: proud/confident
// Behavior: +50% leadership, +30% social, +30% work

// Event: Customer insults work  
character = character.withEmotionalEvent('embarrassment', 0.6, 90);
// Emotion overridden to: ashamed/withdrawn
// Behavior: social 0.2x (avoids people), hiding +1.8x

// Event: Friend comforts him
character = character.withEmotionalEvent('friendship', 0.5, 60);
// Emotions blend: ashamed fading, happy emerging

// Over time: Emotions decay back to baseline
character = character.withUpdatedEmotionalState();
```

### Behavioral Impact

**Before emotional system:**
- Blacksmith always has same interaction preferences
- Personality traits provide static modifiers
- No dynamic response to recent events

**After emotional system:**
- Success makes him more social and ambitious temporarily
- Embarrassment makes him withdraw and avoid people
- Friend's comfort gradually restores confidence
- Extreme emotions fade naturally over time

## 🔧 Integration Points

### 1. Interaction Resolution
```javascript
// When interactions complete, trigger emotional events
if (outcome === 'positive' && interaction.type === 'social') {
  character = character.withEmotionalEvent('friendship', 0.5, 60);
}
```

### 2. Historical Events
```javascript
// Major events affect entire settlements
settlement.characters.forEach(char => {
  char = char.withEmotionalEvent('fear', 0.8, 240); // War declared
});
```

### 3. Trauma Integration
```javascript
// Existing trauma system now triggers emotional events
character = character.withTrauma(trauma); // Permanent personality change
character = character.withEmotionalEvent('loss', 0.9, 1440); // Temporary grief
```

### 4. Social Contagion
```javascript
// Happy characters spread joy in taverns
const contagion = calculateEmotionalContagion(happyChar, nearbyChar, proximity);
if (contagion) {
  nearbyChar = nearbyChar.withEmotionalEvent(contagion.eventType, contagion.intensity);
}
```

## 🌟 Benefits

### 1. **Realistic NPC Behavior**
- NPCs react emotionally to events
- Recent experiences influence current decisions
- Emotional states create believable personality variation

### 2. **Emergent Storytelling** 
- Success breeds confidence and ambition
- Failure leads to withdrawal and caution
- Social dynamics create cascading emotional effects

### 3. **Simulation Depth**
- Player actions have lasting emotional consequences
- Settlement mood affects individual character emotions
- Historical events create collective emotional responses

### 4. **Scientific Grounding**
- Based on your existing quantum consciousness framework
- Emotions emerge from consciousness frequency rather than arbitrary states
- Maintains consistency with your 40Hz gamma baseline system

## 🚀 Next Steps

1. **Test the basic emotional mapping**: Create characters and apply emotional events
2. **Integrate with interaction resolution**: Add emotional reactions to interaction outcomes  
3. **Implement emotional contagion**: Test social emotion spreading in settlements
4. **Add historical event triggers**: Major events affect collective emotions
5. **Create emotional memory**: Long-term emotional imprints influence personality

This system enhances your existing architecture without disrupting it, creating more lifelike and dynamic NPCs that respond realistically to the events in your historical simulation.
