//! Consciousness state updates

use crate::types::consciousness::{ConsciousnessStateInternal, SignificantEvent};
use crate::Result;

impl ConsciousnessStateInternal {
    /// Update consciousness state based on significant events
    pub fn update_from_event(&mut self, event: &SignificantEvent) -> Result<()> {
        // Update frequency based on event significance and emotional impact
        let frequency_change = event.significance * event.emotional_impact * 2.0;
        self.current_frequency = (self.base_frequency + frequency_change).clamp(3.0, 15.0);

        // Update coherence based on event significance
        let coherence_change = event.significance * 0.1;
        if event.emotional_impact > 0.0 {
            self.emotional_coherence = (self.emotional_coherence + coherence_change).min(1.0);
        } else {
            self.emotional_coherence = (self.emotional_coherence - coherence_change).max(0.2);
        }

        // Update emotional state if specified
        if let Some(new_emotion) = &event.consciousness_change.emotional_state_change {
            self.emotional_state = new_emotion.clone();
        }

        self.last_update = event.timestamp;
        self.significant_events.push(event.clone());

        Ok(())
    }
}