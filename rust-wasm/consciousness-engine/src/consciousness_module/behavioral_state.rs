//! Simple behavioral state generation - matches JavaScript implementation exactly
//! Based on BehavioralStateService.js and EnhancedConsciousnessState.js
//! 
//! NO quantum algorithms - just simple range-based mappings for speed

use crate::types::consciousness::{
    ConsciousnessState, BehavioralState, EnergyLevel, FocusLevel, MoodLevel
};
use crate::Result;

/// Generate behavioral state from consciousness parameters
/// Matches JavaScript: generateBehavioralState() in EnhancedConsciousnessState.js
#[inline(always)]
pub fn generate_behavioral_state(frequency: f64, coherence: f64) -> BehavioralState {
    BehavioralState {
        energy: map_frequency_to_energy(frequency),
        focus: map_coherence_to_focus(coherence),
        mood: calculate_mood_from_state(frequency, coherence),
        social_drive: calculate_social_drive(frequency),
        risk_tolerance: calculate_risk_tolerance(frequency),
        ambition: calculate_ambition(frequency, coherence),
        cached_timestamp: 0, // Will be set by caller
    }
}

/// Map frequency to energy level
/// JavaScript: mapFrequencyToEnergy(freq) in EnhancedConsciousnessState.js
/// if (frequency < 5) return 'low';
/// if (frequency < 10) return 'moderate';
/// return 'high';
#[inline(always)]
pub fn map_frequency_to_energy(frequency: f64) -> EnergyLevel {
    if frequency < 5.0 {
        EnergyLevel::Low
    } else if frequency < 10.0 {
        EnergyLevel::Moderate
    } else {
        EnergyLevel::High
    }
}

/// Map coherence to focus level
/// JavaScript: mapCoherenceToFocus(coherence) in EnhancedConsciousnessState.js
/// if (coherence < 0.4) return 'scattered';
/// if (coherence < 0.8) return 'balanced';
/// return 'focused';
#[inline(always)]
pub fn map_coherence_to_focus(coherence: f64) -> FocusLevel {
    if coherence < 0.4 {
        FocusLevel::Scattered
    } else if coherence < 0.8 {
        FocusLevel::Balanced
    } else {
        FocusLevel::Focused
    }
}

/// Calculate mood from frequency and coherence
/// JavaScript: calculateMoodFromState(freq, coherence) in EnhancedConsciousnessState.js
/// Formula: moodScore = (frequency / 15) * 0.7 + coherence * 0.3
#[inline(always)]
pub fn calculate_mood_from_state(frequency: f64, coherence: f64) -> MoodLevel {
    // Calculate mood score using JavaScript formula
    let mood_score = (frequency / 15.0) * 0.7 + coherence * 0.3;
    
    if mood_score < 0.3 {
        MoodLevel::Depressed
    } else if mood_score < 0.6 {
        MoodLevel::Content
    } else if mood_score < 0.8 {
        MoodLevel::Optimistic
    } else {
        MoodLevel::Excited
    }
}

/// Calculate social drive
/// JavaScript: socialDrive: Math.max(0, Math.min(1, (freq - 4) / 8))
#[inline(always)]
pub fn calculate_social_drive(frequency: f64) -> f64 {
    ((frequency - 4.0) / 8.0).clamp(0.0, 1.0)
}

/// Calculate risk tolerance
/// JavaScript: riskTolerance: Math.max(0, Math.min(1, (freq - 6) / 6))
#[inline(always)]
pub fn calculate_risk_tolerance(frequency: f64) -> f64 {
    ((frequency - 6.0) / 6.0).clamp(0.0, 1.0)
}

/// Calculate ambition
/// JavaScript: ambition: Math.max(0, Math.min(1, coherence * (freq / 10)))
#[inline(always)]
pub fn calculate_ambition(frequency: f64, coherence: f64) -> f64 {
    (coherence * (frequency / 10.0)).clamp(0.0, 1.0)
}

impl ConsciousnessState {
    /// Generate behavioral state (entry point for consciousness state objects)
    pub fn generate_behavioral_state(&self) -> Result<BehavioralState> {
        let mut state = generate_behavioral_state(self.base_frequency, self.emotional_coherence);
        state.cached_timestamp = self.last_update;
        Ok(state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_frequency_to_energy_mapping() {
        // Test exact thresholds from JavaScript
        assert_eq!(map_frequency_to_energy(4.0), EnergyLevel::Low);
        assert_eq!(map_frequency_to_energy(5.0), EnergyLevel::Moderate);
        assert_eq!(map_frequency_to_energy(9.9), EnergyLevel::Moderate);
        assert_eq!(map_frequency_to_energy(10.0), EnergyLevel::High);
        assert_eq!(map_frequency_to_energy(15.0), EnergyLevel::High);
    }

    #[test]
    fn test_coherence_to_focus_mapping() {
        // Test exact thresholds from JavaScript
        assert_eq!(map_coherence_to_focus(0.3), FocusLevel::Scattered);
        assert_eq!(map_coherence_to_focus(0.4), FocusLevel::Balanced);
        assert_eq!(map_coherence_to_focus(0.7), FocusLevel::Balanced);
        assert_eq!(map_coherence_to_focus(0.8), FocusLevel::Focused);
        assert_eq!(map_coherence_to_focus(1.0), FocusLevel::Focused);
    }

    #[test]
    fn test_mood_calculation() {
        // Test using JavaScript formula: moodScore = (frequency / 15) * 0.7 + coherence * 0.3
        
        // Low mood score (< 0.3) = depressed
        // freq=3.0, coh=0.2: (3/15)*0.7 + 0.2*0.3 = 0.14 + 0.06 = 0.20
        assert_eq!(calculate_mood_from_state(3.0, 0.2), MoodLevel::Depressed);
        
        // Content mood score (0.3 <= score < 0.6)
        // freq=7.0, coh=0.5: (7/15)*0.7 + 0.5*0.3 = 0.327 + 0.15 = 0.477
        assert_eq!(calculate_mood_from_state(7.0, 0.5), MoodLevel::Content);
        
        // Optimistic mood score (0.6 <= score < 0.8)
        // freq=10.0, coh=0.7: (10/15)*0.7 + 0.7*0.3 = 0.467 + 0.21 = 0.677
        assert_eq!(calculate_mood_from_state(10.0, 0.7), MoodLevel::Optimistic);
        
        // Excited mood score (>= 0.8)
        // freq=13.0, coh=0.9: (13/15)*0.7 + 0.9*0.3 = 0.607 + 0.27 = 0.877
        assert_eq!(calculate_mood_from_state(13.0, 0.9), MoodLevel::Excited);
    }

    #[test]
    fn test_social_drive_calculation() {
        // Test formula: (freq - 4) / 8, clamped to 0-1
        assert_eq!(calculate_social_drive(4.0), 0.0);
        assert_eq!(calculate_social_drive(8.0), 0.5);
        assert_eq!(calculate_social_drive(12.0), 1.0);
        assert_eq!(calculate_social_drive(20.0), 1.0); // Clamped
    }

    #[test]
    fn test_risk_tolerance_calculation() {
        // Test formula: (freq - 6) / 6, clamped to 0-1
        assert_eq!(calculate_risk_tolerance(6.0), 0.0);
        assert_eq!(calculate_risk_tolerance(9.0), 0.5);
        assert_eq!(calculate_risk_tolerance(12.0), 1.0);
    }

    #[test]
    fn test_ambition_calculation() {
        // Test formula: coherence * (freq / 10), clamped to 0-1
        let ambition = calculate_ambition(10.0, 0.5);
        assert!((ambition - 0.5).abs() < 0.001);
        
        let ambition = calculate_ambition(15.0, 0.8);
        assert!((ambition - 1.0).abs() < 0.001); // Should be clamped to 1.0
    }

    #[test]
    fn test_complete_behavioral_state() {
        // Test a complete behavioral state generation
        let state = generate_behavioral_state(7.5, 0.7);
        
        assert_eq!(state.energy, EnergyLevel::Moderate);
        assert_eq!(state.focus, FocusLevel::Balanced);
        // Mood score: (7.5/15)*0.7 + 0.7*0.3 = 0.35 + 0.21 = 0.56 (Content)
        assert_eq!(state.mood, MoodLevel::Content);
        
        // Verify numeric calculations
        assert!((state.social_drive - 0.4375).abs() < 0.001); // (7.5 - 4) / 8
        assert!((state.risk_tolerance - 0.25).abs() < 0.001); // (7.5 - 6) / 6
        assert!((state.ambition - 0.525).abs() < 0.001); // 0.7 * (7.5 / 10)
    }
}
