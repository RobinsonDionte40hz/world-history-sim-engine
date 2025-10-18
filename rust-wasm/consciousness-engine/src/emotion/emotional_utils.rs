//! Emotional calculation utilities
//! 
//! Port of JavaScript EmotionalUtils.js for Rust/WASM

use crate::types::EmotionalState;
use serde::{Deserialize, Serialize};

/// Complex emotional state result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplexEmotionalState {
    pub primary: String,
    pub secondary: Option<String>,
    pub intensity: f64,
    pub is_complex: bool,
    pub is_blended: bool,
    pub conflicted_emotions: Option<Vec<String>>,
    pub description: Option<String>,
    pub duration: u64,
    pub modifiers: Vec<EmotionalComponent>,
    pub components: Vec<EmotionalComponent>,
}

/// Emotional component for blending
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalComponent {
    pub name: String,
    pub intensity: f64,
    pub duration: u64,
}

/// Interaction context for emotional modifiers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InteractionContext {
    pub interaction_type: String,
    pub category: Option<String>,
}

/// Emotional reaction types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EmotionalReaction {
    Friendship,
    Satisfaction,
    Discovery,
    Success,
    Love,
    Achievement,
    Embarrassment,
    Failure,
    Disappointment,
    Fear,
    Rejection,
    Betrayal,
    None,
}

/// Emotional contagion result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalContagion {
    pub event_type: String,
    pub intensity: f64,
    pub duration: u64,
}

/// Get emotional modifier for an interaction type
pub fn get_emotional_modifier(
    emotional_state: &ComplexEmotionalState,
    interaction: &InteractionContext,
) -> f64 {
    let interaction_type = interaction.category.as_ref()
        .unwrap_or(&interaction.interaction_type);
    
    // Get modifiers for primary emotional state
    let primary_modifier = get_emotional_state_modifier(&emotional_state.primary, interaction_type);
    
    // Get modifiers for secondary emotional state if present
    let secondary_modifier = emotional_state.secondary.as_ref()
        .map(|sec| get_emotional_state_modifier(sec, interaction_type))
        .unwrap_or(1.0);
    
    // Primary emotion has more weight (70% primary, 30% secondary)
    let combined_modifier = (primary_modifier * 0.7) + (secondary_modifier * 0.3);
    
    // Apply intensity scaling
    let intensity = emotional_state.intensity;
    let final_modifier = 1.0 + ((combined_modifier - 1.0) * intensity);
    
    // Clamp to reasonable bounds (0.1x - 3.0x)
    final_modifier.max(0.1).min(3.0)
}

/// Get modifier for a specific emotional state and interaction type
fn get_emotional_state_modifier(emotional_state: &str, interaction_type: &str) -> f64 {
    // Simplified mapping - full implementation would have all 15+ emotional states
    match emotional_state {
        "exhausted" => match interaction_type {
            "rest" => 3.0,
            "social" => 0.2,
            "work" => 0.3,
            "movement" => 0.4,
            "physical" => 0.2,
            _ => 1.0,
        },
        "tired" => match interaction_type {
            "rest" => 2.0,
            "social" => 0.6,
            "work" => 0.7,
            "complex_tasks" => 0.5,
            "physical" => 0.6,
            _ => 1.0,
        },
        "content" => 1.0, // Baseline - no modifiers
        "alert" => match interaction_type {
            "work" => 1.3,
            "learning" => 1.4,
            "social" => 1.2,
            "exploration" => 1.3,
            "perception" => 1.5,
            _ => 1.0,
        },
        "energized" => match interaction_type {
            "work" => 1.5,
            "physical" => 1.6,
            "social" => 1.4,
            "ambitious_tasks" => 1.5,
            "building" => 1.4,
            _ => 1.0,
        },
        "excited" => match interaction_type {
            "creative" => 1.8,
            "social" => 1.6,
            "risky_actions" => 1.4,
            "impulsive" => 1.5,
            "celebration" => 2.0,
            _ => 1.0,
        },
        "manic" => match interaction_type {
            "risky_actions" => 2.5,
            "impulsive" => 2.0,
            "rest" => 0.2,
            "rational" => 0.4,
            "hyperactive" => 3.0,
            _ => 1.0,
        },
        "angry" => match interaction_type {
            "conflict" => 2.0,
            "social" => 0.4,
            "aggressive" => 1.8,
            "patience" => 0.3,
            "combat" => 1.6,
            "destructive" => 1.5,
            _ => 1.0,
        },
        "sad" => match interaction_type {
            "social" => 0.3,
            "self_care" => 0.5,
            "creative" => 1.3,
            "comfort_seeking" => 1.8,
            "melancholy" => 1.5,
            "rest" => 1.4,
            _ => 1.0,
        },
        "anxious" => match interaction_type {
            "risky_actions" => 0.2,
            "familiar" => 1.5,
            "social" => 0.6,
            "checking" => 1.8,
            "escape" => 1.4,
            "safe_spaces" => 1.6,
            _ => 1.0,
        },
        "joyful" => match interaction_type {
            "social" => 1.8,
            "generous" => 1.5,
            "celebration" => 2.0,
            "creative" => 1.4,
            "romance" => 1.6,
            _ => 1.0,
        },
        "happy" => match interaction_type {
            "social" => 1.4,
            "work" => 1.2,
            "helpful" => 1.5,
            "optimistic" => 1.3,
            _ => 1.0,
        },
        _ => 1.0,
    }
}

/// Get emotional reaction to interaction outcomes
pub fn get_emotional_reaction(
    interaction: &InteractionContext,
    outcome: &str,
) -> EmotionalReaction {
    let interaction_type = interaction.category.as_ref()
        .unwrap_or(&interaction.interaction_type);
    
    match (outcome, interaction_type.as_str()) {
        ("positive", "social") => EmotionalReaction::Friendship,
        ("positive", "work") => EmotionalReaction::Satisfaction,
        ("positive", "learning") => EmotionalReaction::Discovery,
        ("positive", "combat") => EmotionalReaction::Success,
        ("positive", "romance") => EmotionalReaction::Love,
        ("positive", "creative") => EmotionalReaction::Achievement,
        ("negative", "social") => EmotionalReaction::Embarrassment,
        ("negative", "work") => EmotionalReaction::Failure,
        ("negative", "learning") => EmotionalReaction::Disappointment,
        ("negative", "combat") => EmotionalReaction::Fear,
        ("negative", "romance") => EmotionalReaction::Rejection,
        ("negative", "betrayal") => EmotionalReaction::Betrayal,
        _ => EmotionalReaction::None,
    }
}

/// Calculate emotional contagion between characters
pub fn calculate_emotional_contagion(
    source_emotional_state: &ComplexEmotionalState,
    relationship_bond: f64,
    target_empathy: f64,
    proximity: f64,
) -> Option<EmotionalContagion> {
    // Calculate contagion strength
    let relationship_strength = (relationship_bond.abs() / 100.0).min(1.0);
    let emotional_strength = source_emotional_state.intensity;
    
    let contagion_strength = proximity * relationship_strength * target_empathy * emotional_strength * 0.3;
    
    if contagion_strength > 0.1 {
        Some(EmotionalContagion {
            event_type: source_emotional_state.primary.clone(),
            intensity: contagion_strength,
            duration: 30, // Shorter duration for contagion
        })
    } else {
        None
    }
}

/// Resolve emotional conflicts when multiple strong emotions overlap
pub fn resolve_emotional_conflicts(
    emotions: Vec<EmotionalComponent>,
) -> ComplexEmotionalState {
    if emotions.is_empty() {
        return create_default_emotional_state();
    }
    
    if emotions.len() == 1 {
        return convert_to_complex_state(emotions[0].clone());
    }
    
    // Check for conflicting emotion pairs
    let conflict_pairs = get_conflict_pairs();
    
    for conflict in conflict_pairs.iter() {
        if has_conflicting_emotions(&emotions, &conflict.emotions) {
            return create_complex_emotional_state(&emotions, conflict);
        }
    }
    
    // If no conflicts, blend similar emotions
    blend_similar_emotions(emotions)
}

/// Conflict pair definition
struct ConflictPair {
    emotions: Vec<String>,
    resolution: String,
    description: String,
}

/// Get defined conflict pairs
fn get_conflict_pairs() -> Vec<ConflictPair> {
    vec![
        ConflictPair {
            emotions: vec!["joyful".to_string(), "sad".to_string()],
            resolution: "bittersweet".to_string(),
            description: "Mixed feelings of joy and sadness".to_string(),
        },
        ConflictPair {
            emotions: vec!["angry".to_string(), "content".to_string()],
            resolution: "conflicted".to_string(),
            description: "Internal struggle between anger and contentment".to_string(),
        },
        ConflictPair {
            emotions: vec!["excited".to_string(), "anxious".to_string()],
            resolution: "nervous_excitement".to_string(),
            description: "Excited but with underlying anxiety".to_string(),
        },
        ConflictPair {
            emotions: vec!["proud".to_string(), "ashamed".to_string()],
            resolution: "ambivalent".to_string(),
            description: "Conflicted between pride and shame".to_string(),
        },
        ConflictPair {
            emotions: vec!["happy".to_string(), "distrustful".to_string()],
            resolution: "cautiously_optimistic".to_string(),
            description: "Happy but maintaining caution".to_string(),
        },
        ConflictPair {
            emotions: vec!["curious".to_string(), "anxious".to_string()],
            resolution: "apprehensive_interest".to_string(),
            description: "Interested but worried about consequences".to_string(),
        },
    ]
}

/// Check if emotions contain conflicting pairs
fn has_conflicting_emotions(emotions: &[EmotionalComponent], conflict_pair: &[String]) -> bool {
    let emotion_names: Vec<String> = emotions.iter().map(|e| e.name.clone()).collect();
    conflict_pair.iter().all(|emotion| emotion_names.contains(emotion))
}

/// Create complex emotional state from conflicting emotions
fn create_complex_emotional_state(
    emotions: &[EmotionalComponent],
    conflict: &ConflictPair,
) -> ComplexEmotionalState {
    // Find conflicting emotions
    let conflicting_emotions: Vec<EmotionalComponent> = emotions
        .iter()
        .filter(|e| conflict.emotions.contains(&e.name))
        .cloned()
        .collect();
    
    // Calculate average intensity
    let total_intensity: f64 = conflicting_emotions.iter().map(|e| e.intensity).sum();
    let average_intensity = total_intensity / conflicting_emotions.len() as f64;
    
    // Calculate max duration
    let max_duration = conflicting_emotions.iter().map(|e| e.duration).max().unwrap_or(60);
    
    // Get non-conflicting emotions as modifiers
    let modifiers: Vec<EmotionalComponent> = emotions
        .iter()
        .filter(|e| !conflict.emotions.contains(&e.name))
        .cloned()
        .collect();
    
    ComplexEmotionalState {
        primary: conflict.resolution.clone(),
        secondary: conflicting_emotions.first().map(|e| e.name.clone()),
        intensity: (average_intensity * 1.2).min(1.0),
        is_complex: true,
        is_blended: false,
        conflicted_emotions: Some(conflicting_emotions.iter().map(|e| e.name.clone()).collect()),
        description: Some(conflict.description.clone()),
        duration: max_duration,
        modifiers,
        components: vec![],
    }
}

/// Blend emotions of similar valence and intensity
fn blend_similar_emotions(mut emotions: Vec<EmotionalComponent>) -> ComplexEmotionalState {
    // Sort by intensity (strongest first)
    emotions.sort_by(|a, b| b.intensity.partial_cmp(&a.intensity).unwrap());
    
    let primary_emotion = &emotions[0];
    let secondary_emotion = emotions.get(1);
    
    // Calculate blended intensity
    let primary_intensity = primary_emotion.intensity;
    let secondary_intensity = secondary_emotion.map(|e| e.intensity).unwrap_or(0.0);
    let blended_intensity = (primary_intensity * 0.7 + secondary_intensity * 0.3).min(1.0);
    
    // Calculate max duration
    let max_duration = emotions.iter().map(|e| e.duration).max().unwrap_or(60);
    
    ComplexEmotionalState {
        primary: primary_emotion.name.clone(),
        secondary: secondary_emotion.map(|e| e.name.clone()),
        intensity: blended_intensity,
        is_complex: false,
        is_blended: true,
        conflicted_emotions: None,
        description: None,
        duration: max_duration,
        modifiers: vec![],
        components: emotions.iter().take(3).cloned().collect(),
    }
}

/// Calculate emotional valence (-1.0 to +1.0)
pub fn calculate_emotional_valence(emotion: &str) -> f64 {
    match emotion {
        // Positive emotions
        "joyful" => 0.9,
        "happy" => 0.8,
        "excited" => 0.7,
        "content" => 0.6,
        "satisfied" => 0.7,
        "proud" => 0.8,
        "energized" => 0.6,
        "alert" => 0.3,
        "curious" => 0.4,
        
        // Negative emotions
        "sad" => -0.7,
        "angry" => -0.8,
        "anxious" => -0.6,
        "stressed" => -0.7,
        "ashamed" => -0.8,
        "disappointed" => -0.6,
        "distrustful" => -0.5,
        "tired" => -0.3,
        "exhausted" => -0.8,
        
        // Complex emotions (mixed valence)
        "bittersweet" => 0.1,
        "conflicted" => -0.2,
        "nervous_excitement" => 0.2,
        "ambivalent" => 0.0,
        "cautiously_optimistic" => 0.3,
        "apprehensive_interest" => 0.1,
        "frantic" => -0.4,
        "resigned" => -0.3,
        
        // Extreme states
        "manic" => -0.2, // Positive but potentially destructive
        
        _ => 0.0,
    }
}

/// Get modifier for complex emotional states
pub fn get_complex_emotional_modifier(
    complex_emotion: &ComplexEmotionalState,
    interaction: &InteractionContext,
) -> f64 {
    if !complex_emotion.is_complex && !complex_emotion.is_blended {
        return get_emotional_modifier(complex_emotion, interaction);
    }
    
    let interaction_type = interaction.category.as_ref()
        .unwrap_or(&interaction.interaction_type);
    
    // Get base modifier for complex emotion
    let modifier = get_complex_emotion_modifier(&complex_emotion.primary, interaction_type);
    
    // Apply intensity scaling
    let final_modifier = 1.0 + ((modifier - 1.0) * complex_emotion.intensity);
    
    // Clamp to reasonable bounds
    final_modifier.max(0.1).min(3.0)
}

/// Get modifier for complex emotional states
fn get_complex_emotion_modifier(emotional_state: &str, interaction_type: &str) -> f64 {
    match emotional_state {
        "bittersweet" => match interaction_type {
            "social" => 0.8,
            "creative" => 1.4,
            "contemplative" => 1.6,
            "melancholy" => 1.3,
            "grateful" => 1.2,
            _ => 1.0,
        },
        "conflicted" => match interaction_type {
            "decision_making" => 0.6,
            "internal_struggle" => 1.8,
            "social" => 0.7,
            "planning" => 0.8,
            "emotional_expression" => 1.4,
            _ => 1.0,
        },
        "nervous_excitement" => match interaction_type {
            "impulsive" => 1.3,
            "energetic" => 1.4,
            "social" => 1.2,
            "risky_actions" => 1.1,
            "fidgety" => 1.6,
            _ => 1.0,
        },
        "ambivalent" => match interaction_type {
            "hesitation" => 1.7,
            "self_reflection" => 1.5,
            "social" => 0.6,
            "commitment" => 0.7,
            "mood_swings" => 1.4,
            _ => 1.0,
        },
        "cautiously_optimistic" => match interaction_type {
            "social" => 0.9,
            "planning" => 1.3,
            "careful" => 1.4,
            "hopeful" => 1.2,
            "verification" => 1.3,
            _ => 1.0,
        },
        "apprehensive_interest" => match interaction_type {
            "learning" => 1.2,
            "cautious" => 1.5,
            "observation" => 1.6,
            "social" => 0.8,
            "escape_planning" => 1.3,
            _ => 1.0,
        },
        "frantic" => match interaction_type {
            "hyperactive" => 1.8,
            "impulsive" => 1.6,
            "focus" => 0.4,
            "social" => 1.3,
            "mistakes" => 1.5,
            _ => 1.0,
        },
        "resigned" => match interaction_type {
            "acceptance" => 1.4,
            "motivation" => 0.7,
            "social" => 0.8,
            "routine" => 1.3,
            "philosophical" => 1.2,
            _ => 1.0,
        },
        _ => 1.0,
    }
}

// Helper functions

fn create_default_emotional_state() -> ComplexEmotionalState {
    ComplexEmotionalState {
        primary: "content".to_string(),
        secondary: None,
        intensity: 0.5,
        is_complex: false,
        is_blended: false,
        conflicted_emotions: None,
        description: None,
        duration: 60,
        modifiers: vec![],
        components: vec![],
    }
}

fn convert_to_complex_state(emotion: EmotionalComponent) -> ComplexEmotionalState {
    ComplexEmotionalState {
        primary: emotion.name.clone(),
        secondary: None,
        intensity: emotion.intensity,
        is_complex: false,
        is_blended: false,
        conflicted_emotions: None,
        description: None,
        duration: emotion.duration,
        modifiers: vec![],
        components: vec![emotion],
    }
}

/// Utilities for emotional state calculations
pub struct EmotionalUtils;

impl EmotionalUtils {
    /// Calculate emotional coherence from frequency and base coherence
    #[inline(always)]
    pub fn calculate_emotional_coherence(frequency: f64, base_coherence: f64) -> f64 {
        // Higher frequency with good base coherence = higher emotional coherence
        let frequency_factor = (frequency / 15.0).min(1.0);
        (base_coherence * frequency_factor).clamp(0.2, 1.0)
    }

    /// Determine emotional state from coherence and recent events
    #[inline(always)]
    pub fn determine_emotional_state(coherence: f64, recent_emotional_impact: f64) -> EmotionalState {
        match (coherence, recent_emotional_impact) {
            (c, i) if c > 0.8 && i > 0.5 => EmotionalState::Excited,
            (c, i) if c > 0.8 && i > 0.0 => EmotionalState::Joyful,
            (c, i) if c > 0.6 && i > -0.3 => EmotionalState::Content,
            (c, i) if c > 0.4 && i < -0.5 => EmotionalState::Anxious,
            (c, _) if c < 0.4 => EmotionalState::Depressed,
            (_, i) if i < -0.7 => EmotionalState::Angry,
            (_, i) if i > 0.7 => EmotionalState::Surprised,
            _ => EmotionalState::Content,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_emotional_modifier() {
        let emotional_state = ComplexEmotionalState {
            primary: "excited".to_string(),
            secondary: None,
            intensity: 0.8,
            is_complex: false,
            is_blended: false,
            conflicted_emotions: None,
            description: None,
            duration: 60,
            modifiers: vec![],
            components: vec![],
        };

        let interaction = InteractionContext {
            interaction_type: "creative".to_string(),
            category: None,
        };

        let modifier = get_emotional_modifier(&emotional_state, &interaction);
        assert!(modifier > 1.0);
        assert!(modifier <= 3.0);
    }

    #[test]
    fn test_emotional_valence() {
        assert_eq!(calculate_emotional_valence("joyful"), 0.9);
        assert_eq!(calculate_emotional_valence("sad"), -0.7);
        assert_eq!(calculate_emotional_valence("content"), 0.6);
    }

    #[test]
    fn test_emotional_conflict_resolution() {
        let emotions = vec![
            EmotionalComponent {
                name: "joyful".to_string(),
                intensity: 0.8,
                duration: 60,
            },
            EmotionalComponent {
                name: "sad".to_string(),
                intensity: 0.6,
                duration: 60,
            },
        ];

        let result = resolve_emotional_conflicts(emotions);
        assert_eq!(result.primary, "bittersweet");
        assert!(result.is_complex);
    }
}