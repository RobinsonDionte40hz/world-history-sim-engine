# Enhanced Decision Logging System

## Overview

The Enhanced Decision Logging System provides deep insights into **why** characters make decisions, not just **what** they did. This system tracks the complete decision-making process, including reasoning factors, alternatives considered, and behavioral patterns.

## Key Features

### 1. Comprehensive Decision Context

Each decision now stores:
- **Available Interactions**: All options the character considered with their weights
- **Selected Interaction**: The chosen action and its selection weight
- **Reasoning Factors**: Why the character made this specific choice
- **Alternative Options**: What other actions were considered

### 2. Multi-Factor Reasoning Analysis

The system tracks five key reasoning categories:

#### Consciousness Influence
- **Frequency**: Character's consciousness frequency (affects decision clarity)
- **Coherence**: How coherent the character's thinking is
- **Emotional State**: Current emotional influences on decision-making

#### Personality Factors
- **Dominant Traits**: Personality traits above 60% that influence choices
- **Trait Values**: Specific strength of personality influences

#### Environmental Factors
- **Node Type**: Location context (settlement, wilderness, etc.)
- **Climate Conditions**: Environmental conditions affecting decisions
- **Danger Level**: Whether the environment poses threats
- **Available Resources**: Local resources that might influence choices

#### Need Factors
- **Energy Level**: Current energy as percentage of maximum
- **Critical Needs**: Any urgent needs requiring immediate attention
- **Active Goals**: Character's current goals driving behavior

#### Emergency Overrides
- **Emergency Detection**: When critical situations override normal decision-making
- **Override Triggers**: What caused the emergency response

### 3. Behavioral Pattern Analysis

The system identifies patterns in character behavior:

#### Common Actions
- Most frequently chosen interactions
- Percentage breakdown of action preferences
- Behavioral consistency metrics

#### Decision Confidence
- Average decision weights (higher = more confident)
- Confidence trends over time
- Uncertainty indicators

#### Consciousness Stability
- Coherence variance over time
- Emotional state consistency
- Mental stability indicators

#### Emergency Frequency
- How often emergency overrides occur
- Character's stress response patterns
- Reactive vs. proactive decision-making style

## Implementation Details

### GenerateBehavior.js Enhancements

```javascript
// Enhanced Decision Logging - Store decision reasoning
const decisionContext = {
  timestamp: worldState.time || Date.now(),
  availableInteractions: weights.slice(0, 10).map(w => ({ 
    name: w.interaction.name, 
    weight: w.weight,
    type: w.interaction.type || 'unknown'
  })),
  selectedInteraction: {
    name: selectedInteraction.name,
    weight: weights.find(w => w.interaction === selectedInteraction)?.weight || 0,
    type: selectedInteraction.type || 'unknown'
  },
  reasoning: {
    emergencyOverride: emergency ? true : false,
    consciousnessInfluence: {
      frequency: character.consciousness?.frequency || 0,
      coherence: character.consciousness?.coherence || 0,
      emotionalState: character.consciousness?.getCurrentEmotionalState?.() || null
    },
    personalityFactors: /* personality analysis */,
    environmentalFactors: /* environment analysis */,
    needFactors: /* needs analysis */
  }
};
```

### Character Decision History

Each character maintains a `decisionHistory` array with the last 50 decisions. This prevents memory bloat while providing sufficient data for pattern analysis.

### HistoryGenerator Integration

The HistoryGenerator now includes decision context in historical events, enabling rich analysis of character development over time.

## UI Integration

### Behavior Analysis Panel

The enhanced behavior analysis panel displays:

1. **Decision Patterns Summary**: Natural language analysis of character behavior
2. **Recent Decisions**: Detailed breakdown of the last 3 decisions including:
   - Selected action and weight
   - Primary reasoning factor
   - Consciousness state
   - Personality influences
   - Environmental factors
   - Need assessment
   - Emergency overrides
   - Alternative options considered
3. **Common Actions**: Most frequently chosen actions with percentages
4. **Behavioral Metrics**: Consciousness stability, decision confidence, emergency frequency

### Real-Time Updates

The panel updates dynamically as characters make new decisions during simulation, providing live insights into character development and behavioral changes.

## Usage Examples

### High-Confidence Goal-Driven Decision
```
Selected: Explore Ancient Ruins
Weight: 12.3
Primary Reason: Goal: explore
Consciousness: Freq: 42.5Hz, Coherence: 75%, Emotional: excited (80%)
Personality: adventurous: 80%, curious: 70%
Environment: wilderness (temperate)
Needs: Energy: 80%, Goals: explore, learn
Alternatives: Study Map (8.1), Chat with Locals (5.2)
```

### Emergency Override Decision
```
Selected: Rest at Camp
Weight: 15.0
Primary Reason: Emergency Override
⚠️ Emergency Override
Consciousness: Freq: 40.1Hz, Coherence: 45%, Emotional: exhausted (90%)
Needs: Energy: 15%, Critical: energy
```

### Personality-Driven Social Decision
```
Selected: Chat with Locals
Weight: 9.7
Primary Reason: Personality: extroverted (65%)
Consciousness: Freq: 44.2Hz, Coherence: 82%
Personality: extroverted: 65%, curious: 70%
Environment: settlement (temperate)
Needs: Energy: 65%, Goals: learn
```

## Benefits

1. **Deep Character Understanding**: See exactly why characters behave the way they do
2. **Behavioral Consistency**: Verify that character personalities drive appropriate decisions
3. **Story Development**: Rich data for narrative generation and character arcs
4. **Debugging**: Identify when characters make unexpected decisions and why
5. **Player Engagement**: Players can understand and predict character behavior
6. **AI Transparency**: Clear visibility into the AI decision-making process

## Debug Mode

When `DEBUG_MODE = true` in GenerateBehavior.js, the system outputs detailed decision context to the console, helping developers understand and tune the decision-making algorithms.

## Memory Management

- Decision history is limited to 50 entries per character
- Old decisions are automatically pruned
- Analysis focuses on recent patterns (last 10 decisions by default)
- Minimal performance impact on simulation speed

This enhanced decision logging system transforms the behavior analysis from simple action tracking to deep psychological and behavioral insights, making characters feel more alive and their actions more meaningful.