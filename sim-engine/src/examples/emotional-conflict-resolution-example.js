/**
 * Emotional Conflict Resolution Example
 * 
 * Demonstrates how the emotional system handles complex emotional states
 * when multiple strong emotions overlap, creating nuanced psychological states.
 */

import ConsciousnessSystem from '../domain/value-objects/ConsciousnessSystem.js';
import EmotionalUtils from '../shared/utils/EmotionalUtils.js';

// Example: Character experiencing graduation day
function graduationDayScenario() {
  console.log('=== Graduation Day Emotional Conflict Example ===\n');
  
  // Create a character with normal baseline
  const character = {
    consciousness: new ConsciousnessSystem({
      id: 'grad-student',
      baseFrequency: 7.5,
      currentFrequency: 7.5,
      emotionalCoherence: 0.8,
      baseEmotionalState: 'content'
    })
  };
  
  console.log('Initial emotional state:');
  console.log(character.consciousness.getCurrentEmotionalState());
  console.log('\n');
  
  // Apply conflicting emotions typical of graduation
  character.consciousness.applyEmotionalEvent('achievement', 0.8, 120); // Proud of accomplishment
  character.consciousness.applyEmotionalEvent('fear', 0.6, 180);        // Anxious about future
  
  console.log('After achievement + anxiety events:');
  const conflictedState = character.consciousness.getCurrentEmotionalState();
  console.log(conflictedState);
  console.log('\n');
  
  // Demonstrate how this affects behavior
  const socialInteraction = { type: 'social', category: 'celebration' };
  const workInteraction = { type: 'planning', category: 'future_goals' };
  
  if (conflictedState.isComplex) {
    console.log('Complex emotional state detected!');
    console.log(`Description: ${conflictedState.description}`);
    console.log(`Conflicted emotions: ${conflictedState.conflictedEmotions?.join(', ')}`);
    
    const socialModifier = EmotionalUtils.getComplexEmotionalModifier(conflictedState, socialInteraction);
    const planningModifier = EmotionalUtils.getComplexEmotionalModifier(conflictedState, workInteraction);
    
    console.log(`Social interaction modifier: ${socialModifier.toFixed(2)}`);
    console.log(`Planning interaction modifier: ${planningModifier.toFixed(2)}`);
  }
  
  return character;
}

// Example: Character experiencing loss of loved one while receiving good news
function bittersweetScenario() {
  console.log('\n=== Bittersweet Life Event Example ===\n');
  
  const character = {
    consciousness: new ConsciousnessSystem({
      id: 'conflicted-char',
      baseFrequency: 7.0,
      currentFrequency: 7.0,
      emotionalCoherence: 0.75
    })
  };
  
  console.log('Character receives promotion news on day of grandmother\'s funeral...\n');
  
  // Apply conflicting positive and negative events
  character.consciousness.applyEmotionalEvent('success', 0.7, 150);  // Promotion joy
  character.consciousness.applyEmotionalEvent('loss', 0.8, 300);     // Grief from loss
  
  const emotionalState = character.consciousness.getCurrentEmotionalState();
  console.log('Resulting emotional state:');
  console.log(emotionalState);
  console.log('\n');
  
  // Show how this complex emotion affects different behaviors
  const interactions = [
    { type: 'creative', name: 'Writing/Art' },
    { type: 'social', name: 'Social Gathering' },
    { type: 'contemplative', name: 'Reflection' },
    { type: 'celebration', name: 'Celebration' }
  ];
  
  console.log('Behavioral modifiers for different activities:');
  interactions.forEach(interaction => {
    const modifier = emotionalState.isComplex 
      ? EmotionalUtils.getComplexEmotionalModifier(emotionalState, interaction)
      : EmotionalUtils.getEmotionalModifier(emotionalState, interaction);
    
    console.log(`${interaction.name}: ${modifier.toFixed(2)}x ${modifier > 1 ? '(enhanced)' : '(reduced)'}`);
  });
  
  return character;
}

// Example: Character in high-stress situation with conflicting impulses
function franticStateScenario() {
  console.log('\n=== Frantic Emotional State Example ===\n');
  
  const character = {
    consciousness: new ConsciousnessSystem({
      id: 'stressed-char',
      baseFrequency: 8.5, // Already elevated
      currentFrequency: 8.5,
      emotionalCoherence: 0.6 // Lower coherence due to stress
    })
  };
  
  console.log('Character facing deadline with multiple urgent tasks...\n');
  
  // Apply multiple stressful events in quick succession
  character.consciousness.applyEmotionalEvent('conflict', 0.7, 60);  // Time pressure
  character.consciousness.applyEmotionalEvent('stress', 0.8, 90);    // Overwhelming tasks
  character.consciousness.applyEmotionalEvent('excitement', 0.6, 45); // High energy from adrenaline
  
  const emotionalState = character.consciousness.getCurrentEmotionalState();
  console.log('Resulting frantic emotional state:');
  console.log(emotionalState);
  console.log('\n');
  
  // Demonstrate how frantic state affects performance
  const taskTypes = [
    { type: 'focus', name: 'Focused Work' },
    { type: 'hyperactive', name: 'Physical Activity' },
    { type: 'decision_making', name: 'Decision Making' },
    { type: 'social', name: 'Communication' },
    { type: 'mistakes', name: 'Error Rate' }
  ];
  
  console.log('Performance impact of frantic state:');
  taskTypes.forEach(task => {
    const modifier = EmotionalUtils.getComplexEmotionalModifier(emotionalState, task);
    const impact = modifier > 1 ? 'INCREASED' : 'DECREASED';
    const percentage = Math.abs((modifier - 1) * 100).toFixed(0);
    
    console.log(`${task.name}: ${impact} by ${percentage}%`);
  });
  
  return character;
}

// Example: Demonstrating emotional decay and resolution over time
function emotionalEvolutionScenario() {
  console.log('\n=== Emotional Evolution Over Time Example ===\n');
  
  const character = {
    consciousness: new ConsciousnessSystem({
      id: 'evolving-char',
      baseFrequency: 7.5,
      currentFrequency: 7.5,
      emotionalCoherence: 0.8
    })
  };
  
  console.log('Tracking emotional state changes over time...\n');
  
  // Initial conflict
  character.consciousness.applyEmotionalEvent('success', 0.9, 100);
  character.consciousness.applyEmotionalEvent('fear', 0.7, 120);
  
  const timeSteps = [0, 30, 60, 90, 120, 180];
  
  timeSteps.forEach(minutes => {
    // Simulate time passing
    if (minutes > 0) {
      character.consciousness.updateEmotionalState();
    }
    
    const state = character.consciousness.getCurrentEmotionalState();
    console.log(`After ${minutes} minutes:`);
    console.log(`  Primary: ${state.primary}, Intensity: ${state.intensity?.toFixed(2)}`);
    console.log(`  Frequency: ${state.frequency?.toFixed(1)} Hz`);
    console.log(`  Active modifiers: ${character.consciousness.emotionalModifiers.size}`);
    
    if (state.isComplex) {
      console.log(`  Complex state: ${state.description}`);
    }
    console.log('');
  });
}

// Run all examples
function runEmotionalConflictExamples() {
  try {
    graduationDayScenario();
    bittersweetScenario();
    franticStateScenario();
    emotionalEvolutionScenario();
    
    console.log('\n=== Summary ===');
    console.log('The emotional conflict resolution system demonstrates:');
    console.log('1. Detection of conflicting emotions (joy + sadness = bittersweet)');
    console.log('2. Creation of complex emotional states with nuanced descriptions');
    console.log('3. Behavioral modifiers that reflect psychological complexity');
    console.log('4. Emotional evolution and decay over time');
    console.log('5. More realistic character responses to complex situations');
    
  } catch (error) {
    console.error('Error running emotional conflict examples:', error);
  }
}

// Export for use in other modules
export {
  graduationDayScenario,
  bittersweetScenario,
  franticStateScenario,
  emotionalEvolutionScenario,
  runEmotionalConflictExamples
};

// Run examples if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runEmotionalConflictExamples();
}
