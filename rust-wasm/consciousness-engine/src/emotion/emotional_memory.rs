//! Emotional memory management
//!
//! Handles creation and retrieval of emotionally-charged memories

use super::emotional_utils::{calculate_emotional_valence, ComplexEmotionalState};
use serde::{Deserialize, Serialize};

/// Emotional memory structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalMemory {
    /// Base event data
    pub event_type: String,
    pub timestamp: u64,
    pub participants: Vec<String>,
    
    /// Emotional context
    pub emotional_context: EmotionalContext,
    
    /// Memory properties influenced by emotion
    pub memory_salience: f64,
    pub retrieval_triggers: Vec<RetrievalTrigger>,
    pub decay_rate: f64,
    pub valence: f64,
}

/// Emotional context of a memory
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalContext {
    pub state: String,
    pub secondary: Option<String>,
    pub intensity: f64,
    pub frequency: f64,
    pub coherence: f64,
    pub is_complex: bool,
    pub description: Option<String>,
}

/// Retrieval trigger for memory recall
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetrievalTrigger {
    pub trigger_type: String,
    pub value: String,
    pub strength: f64,
}

/// Memory relevance result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryRelevance {
    pub memory: EmotionalMemory,
    pub relevance_score: f64,
    pub emotional_resonance: f64,
}

/// Create an emotional memory from an event and emotional state
pub fn create_emotional_memory(
    event_type: String,
    timestamp: u64,
    participants: Vec<String>,
    emotional_state: &ComplexEmotionalState,
    frequency: f64,
    coherence: f64,
) -> EmotionalMemory {
    let emotional_context = EmotionalContext {
        state: emotional_state.primary.clone(),
        secondary: emotional_state.secondary.clone(),
        intensity: emotional_state.intensity,
        frequency,
        coherence,
        is_complex: emotional_state.is_complex,
        description: emotional_state.description.clone(),
    };
    
    let memory_salience = calculate_memory_salience(&emotional_context);
    let retrieval_triggers = get_emotional_triggers(&emotional_context);
    let decay_rate = calculate_emotional_decay_rate(&emotional_context);
    let valence = calculate_emotional_valence(&emotional_context.state);
    
    EmotionalMemory {
        event_type,
        timestamp,
        participants,
        emotional_context,
        memory_salience,
        retrieval_triggers,
        decay_rate,
        valence,
    }
}

/// Calculate memory salience based on emotional state
fn calculate_memory_salience(emotional_context: &EmotionalContext) -> f64 {
    let mut base_salience = emotional_context.intensity * 1.5;
    
    // Complex emotional states are more memorable
    if emotional_context.is_complex {
        base_salience *= 1.3;
    }
    
    // High frequency states (alert/energized) enhance encoding
    if emotional_context.frequency > 10.0 {
        base_salience *= 1.2;
    }
    
    // Low coherence reduces memory formation
    if emotional_context.coherence < 0.5 {
        base_salience *= 0.8;
    }
    
    // Extreme emotional states are highly memorable
    let extreme_emotions = ["manic", "frantic", "bittersweet", "conflicted"];
    if extreme_emotions.contains(&emotional_context.state.as_str()) {
        base_salience *= 1.4;
    }
    
    base_salience.min(3.0) // Cap at 3x normal salience
}

/// Generate emotional triggers for memory retrieval
fn get_emotional_triggers(emotional_context: &EmotionalContext) -> Vec<RetrievalTrigger> {
    let mut triggers = Vec::new();
    
    // Primary emotion as main trigger
    triggers.push(RetrievalTrigger {
        trigger_type: "emotional_state".to_string(),
        value: emotional_context.state.clone(),
        strength: 0.8,
    });
    
    // Secondary emotion as additional trigger
    if let Some(ref secondary) = emotional_context.secondary {
        triggers.push(RetrievalTrigger {
            trigger_type: "emotional_state".to_string(),
            value: secondary.clone(),
            strength: 0.6,
        });
    }
    
    // Frequency range trigger
    let freq_range = get_frequency_range(emotional_context.frequency);
    triggers.push(RetrievalTrigger {
        trigger_type: "frequency_range".to_string(),
        value: freq_range,
        strength: 0.5,
    });
    
    // Complex state trigger
    if emotional_context.is_complex {
        triggers.push(RetrievalTrigger {
            trigger_type: "complex_emotion".to_string(),
            value: emotional_context.state.clone(),
            strength: 0.7,
        });
    }
    
    triggers
}

/// Calculate emotional decay rate for memory
fn calculate_emotional_decay_rate(emotional_context: &EmotionalContext) -> f64 {
    let base_decay_rate = 0.05;
    
    // Get emotional valence
    let valence = calculate_emotional_valence(&emotional_context.state);
    
    // Extreme emotional states are very persistent
    let extreme_emotions = ["manic", "frantic", "bittersweet", "conflicted"];
    if extreme_emotions.contains(&emotional_context.state.as_str()) 
        || emotional_context.intensity > 0.8 {
        return base_decay_rate * 0.4; // Much slower decay for extreme states
    }
    
    // Positive emotions decay slower
    if valence > 0.0 {
        return base_decay_rate * 0.8;
    }
    
    // Negative emotions can be more persistent (trauma effect)
    if valence < -0.5 {
        return base_decay_rate * 0.6;
    }
    
    // Complex emotions are more persistent
    if emotional_context.is_complex {
        return base_decay_rate * 0.7;
    }
    
    base_decay_rate
}

/// Get frequency range category for memory triggers
fn get_frequency_range(frequency: f64) -> String {
    if frequency < 4.0 {
        "very_low".to_string()
    } else if frequency < 6.0 {
        "low".to_string()
    } else if frequency < 8.0 {
        "normal".to_string()
    } else if frequency < 10.0 {
        "high".to_string()
    } else if frequency < 12.0 {
        "very_high".to_string()
    } else {
        "extreme".to_string()
    }
}

/// Retrieve memories based on current emotional state
pub fn retrieve_emotional_memories(
    memories: &[EmotionalMemory],
    current_emotional_state: &ComplexEmotionalState,
    current_frequency: f64,
    max_results: usize,
) -> Vec<MemoryRelevance> {
    let mut relevant_memories = Vec::new();
    
    for memory in memories {
        let mut relevance_score = 0.0;
        
        // Check emotional state similarity
        if memory.emotional_context.state == current_emotional_state.primary {
            relevance_score += 0.8;
        }
        
        if let Some(ref secondary) = memory.emotional_context.secondary {
            if secondary == &current_emotional_state.primary 
                || &memory.emotional_context.state == current_emotional_state.secondary.as_ref().unwrap_or(&String::new()) {
                relevance_score += 0.6;
            }
        }
        
        // Check frequency similarity
        let freq_diff = (memory.emotional_context.frequency - current_frequency).abs();
        if freq_diff < 2.0 {
            relevance_score += 0.4;
        }
        
        // Complex emotions can trigger other complex emotions
        if memory.emotional_context.is_complex && current_emotional_state.is_complex {
            relevance_score += 0.5;
        }
        
        // Check retrieval triggers
        for trigger in &memory.retrieval_triggers {
            if trigger.trigger_type == "emotional_state" 
                && trigger.value == current_emotional_state.primary {
                relevance_score += trigger.strength;
            }
            
            if trigger.trigger_type == "frequency_range" 
                && trigger.value == get_frequency_range(current_frequency) {
                relevance_score += trigger.strength;
            }
        }
        
        if relevance_score > 0.3 {
            let emotional_resonance = calculate_emotional_resonance(
                &memory.emotional_context,
                current_emotional_state,
                current_frequency,
            );
            
            relevant_memories.push(MemoryRelevance {
                memory: memory.clone(),
                relevance_score,
                emotional_resonance,
            });
        }
    }
    
    // Sort by relevance and return top results
    relevant_memories.sort_by(|a, b| {
        b.relevance_score.partial_cmp(&a.relevance_score).unwrap()
    });
    
    relevant_memories.into_iter().take(max_results).collect()
}

/// Calculate emotional resonance between past and current emotional states
fn calculate_emotional_resonance(
    past_emotion: &EmotionalContext,
    current_emotion: &ComplexEmotionalState,
    current_frequency: f64,
) -> f64 {
    let mut resonance = 0.0;
    
    // Same primary emotions resonate strongly
    if past_emotion.state == current_emotion.primary {
        resonance += 0.8;
    }
    
    // Similar intensity levels resonate
    let intensity_diff = (past_emotion.intensity - current_emotion.intensity).abs();
    resonance += (0.5 - intensity_diff).max(0.0);
    
    // Similar frequency ranges resonate
    let freq_diff = (past_emotion.frequency - current_frequency).abs();
    resonance += (0.3 - (freq_diff / 10.0)).max(0.0);
    
    // Complex emotions resonate with each other
    if past_emotion.is_complex && current_emotion.is_complex {
        resonance += 0.4;
    }
    
    resonance.min(1.0)
}

/// Enhanced memory formation that considers emotional context
pub fn enhance_memory_with_emotion(
    event_type: String,
    timestamp: u64,
    participants: Vec<String>,
    emotional_state: &ComplexEmotionalState,
    frequency: f64,
    coherence: f64,
    existing_memories: &mut Vec<EmotionalMemory>,
    max_memories: usize,
) {
    // Create emotional memory
    let emotional_memory = create_emotional_memory(
        event_type,
        timestamp,
        participants,
        emotional_state,
        frequency,
        coherence,
    );
    
    // Add to existing memories
    existing_memories.push(emotional_memory);
    
    // Sort by salience (most salient first)
    existing_memories.sort_by(|a, b| {
        b.memory_salience.partial_cmp(&a.memory_salience).unwrap()
    });
    
    // Limit memory storage (keep most salient memories)
    if existing_memories.len() > max_memories {
        existing_memories.truncate(max_memories);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::emotion::emotional_utils::ComplexEmotionalState;

    #[test]
    fn test_create_emotional_memory() {
        let emotional_state = ComplexEmotionalState {
            primary: "excited".to_string(),
            secondary: Some("anxious".to_string()),
            intensity: 0.8,
            is_complex: true,
            is_blended: false,
            conflicted_emotions: None,
            description: Some("Nervous excitement".to_string()),
            duration: 60,
            modifiers: vec![],
            components: vec![],
        };

        let memory = create_emotional_memory(
            "social_interaction".to_string(),
            1000,
            vec!["char1".to_string(), "char2".to_string()],
            &emotional_state,
            10.0,
            0.7,
        );

        assert_eq!(memory.event_type, "social_interaction");
        assert!(memory.memory_salience > 1.0);
        assert!(!memory.retrieval_triggers.is_empty());
        assert!(memory.decay_rate < 0.05);
    }

    #[test]
    fn test_memory_retrieval() {
        let emotional_state = ComplexEmotionalState {
            primary: "excited".to_string(),
            secondary: None,
            intensity: 0.7,
            is_complex: false,
            is_blended: false,
            conflicted_emotions: None,
            description: None,
            duration: 60,
            modifiers: vec![],
            components: vec![],
        };

        let memory = create_emotional_memory(
            "event1".to_string(),
            1000,
            vec![],
            &emotional_state,
            10.0,
            0.7,
        );

        let memories = vec![memory];
        let results = retrieve_emotional_memories(
            &memories,
            &emotional_state,
            10.0,
            10,
        );

        assert!(!results.is_empty());
        assert!(results[0].relevance_score > 0.0);
    }
}
