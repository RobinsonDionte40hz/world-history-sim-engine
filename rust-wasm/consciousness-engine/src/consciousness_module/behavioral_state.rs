//! Behavioral state management and frequency mapping

use crate::types::consciousness::{ConsciousnessState, BehavioralState, EnergyLevel, FocusLevel, EmotionalState, MoodLevel};
use crate::Result;

impl ConsciousnessState {
    /// Map consciousness frequency to energy level
    pub fn map_frequency_to_energy(frequency: f64) -> EnergyLevel {
        match frequency {
            f if f < 4.0 => EnergyLevel::VeryLow,
            f if f < 7.0 => EnergyLevel::Low,
            f if f < 10.0 => EnergyLevel::Moderate,
            f if f < 13.0 => EnergyLevel::High,
            _ => EnergyLevel::VeryHigh,
        }
    }

    /// Calculate behavioral state from consciousness parameters
    pub fn calculate_behavioral_state(&self) -> Result<BehavioralState> {
        let energy = Self::map_frequency_to_energy(self.current_frequency);

        // Calculate focus based on coherence
        let focus = if self.emotional_coherence < 0.4 {
            FocusLevel::Scattered
        } else if self.emotional_coherence < 0.7 {
            FocusLevel::Balanced
        } else {
            FocusLevel::Focused
        };

        // Calculate mood based on emotional state
        let mood = match self.emotional_state {
            EmotionalState::Depressed | EmotionalState::Angry => MoodLevel::Depressed,
            EmotionalState::Content | EmotionalState::Joyful => MoodLevel::Content,
            EmotionalState::Excited => MoodLevel::Excited,
            _ => MoodLevel::Optimistic,
        };

        // Calculate derived behavioral metrics
        let social_drive = match self.emotional_state {
            EmotionalState::Joyful | EmotionalState::Excited => 0.8,
            EmotionalState::Content => 0.6,
            EmotionalState::Anxious | EmotionalState::Fearful => 0.3,
            _ => 0.5,
        };

        let risk_tolerance = match self.emotional_state {
            EmotionalState::Excited | EmotionalState::Joyful => 0.7,
            EmotionalState::Anxious | EmotionalState::Fearful => 0.2,
            _ => 0.5,
        };

        let ambition = (self.base_frequency / 15.0).clamp(0.0, 1.0);

        Ok(BehavioralState {
            energy,
            focus,
            mood,
            social_drive,
            risk_tolerance,
            ambition,
            cached_timestamp: self.last_update,
        })
    }
}