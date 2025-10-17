//! Emotional calculation utilities

use crate::EmotionalState;

/// Utilities for emotional state calculations
pub struct EmotionalUtils;

impl EmotionalUtils {
    /// Calculate emotional coherence from frequency and base coherence
    pub fn calculate_emotional_coherence(frequency: f64, base_coherence: f64) -> f64 {
        // Higher frequency with good base coherence = higher emotional coherence
        let frequency_factor = (frequency / 15.0).min(1.0);
        (base_coherence * frequency_factor).clamp(0.2, 1.0)
    }

    /// Determine emotional state from coherence and recent events
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