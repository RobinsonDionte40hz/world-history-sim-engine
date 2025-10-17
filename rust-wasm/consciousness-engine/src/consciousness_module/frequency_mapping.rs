//! Simple frequency mapping - matches JavaScript implementation exactly
//! No quantum algorithms, just range-based if/else mappings

use crate::types::consciousness::EnergyLevel;

/// Simple frequency to energy mapping (matches JavaScript)
/// JavaScript: if (frequency < 5) return 'low'; if (frequency < 10) return 'moderate'; return 'high';
pub fn map_frequency_to_energy(frequency: f64) -> EnergyLevel {
    if frequency < 5.0 {
        EnergyLevel::Low
    } else if frequency < 10.0 {
        EnergyLevel::Moderate
    } else {
        EnergyLevel::High
    }
}

/// Simple coherence to focus mapping (matches JavaScript)
/// JavaScript: if (coherence < 0.4) return 'scattered'; if (coherence < 0.8) return 'balanced'; return 'focused';
pub fn map_coherence_to_focus(coherence: f64) -> crate::types::consciousness::FocusLevel {
    if coherence < 0.4 {
        crate::types::consciousness::FocusLevel::Scattered
    } else if coherence < 0.8 {
        crate::types::consciousness::FocusLevel::Balanced
    } else {
        crate::types::consciousness::FocusLevel::Focused
    }
}

/// Calculate mood from frequency and coherence (matches JavaScript)
/// JavaScript: const moodScore = (frequency / 15) * 0.7 + coherence * 0.3;
///             if (moodScore < 0.3) return 'depressed';
///             if (moodScore < 0.6) return 'content';
///             if (moodScore < 0.8) return 'optimistic';
///             return 'excited';
pub fn calculate_mood_from_state(frequency: f64, coherence: f64) -> crate::types::consciousness::MoodLevel {
    use crate::types::consciousness::MoodLevel;
    
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