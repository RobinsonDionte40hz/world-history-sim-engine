//! Event-driven consciousness updates (matches JavaScript base)
//! Simple threshold-based updates without quantum complexity

use crate::types::consciousness::{ConsciousnessState, ConsciousnessUpdate};
use crate::types::events::ConsciousnessEvent;
use crate::Result;

const SIGNIFICANCE_THRESHOLD: f64 = 0.3;

/// Event-driven consciousness state updater
/// Updates consciousness parameters only when significant events occur (threshold >= 0.3)
pub struct EnhancedConsciousnessUpdater;

impl EnhancedConsciousnessUpdater {
    /// Check if an event should trigger consciousness update (significance >= 0.3)
    pub fn should_update_from_event(event: &ConsciousnessEvent) -> bool {
        event.intensity >= SIGNIFICANCE_THRESHOLD
    }

    /// Update consciousness state from significant event (matches JavaScript logic)
    pub fn update_from_event(
        current_state: &ConsciousnessState,
        event: &ConsciousnessEvent,
    ) -> Result<ConsciousnessUpdate> {
        // Check significance threshold
        if !Self::should_update_from_event(event) {
            return Ok(ConsciousnessUpdate {
                new_state: *current_state,
                confidence: 1.0,
                coherence_change: 0.0,
                adaptation_strength: 0.0,
                reasoning: "Event below significance threshold".to_string(),
            });
        }

        // Apply parameter updates based on event type
        let mut new_state = *current_state;
        Self::apply_event_updates(&mut new_state, event)?;

        // Calculate changes
        let coherence_change = new_state.emotional_coherence - current_state.emotional_coherence;
        let adaptation_strength = Self::calculate_adaptation_strength(current_state, &new_state);

        Ok(ConsciousnessUpdate {
            new_state,
            confidence: 1.0,
            coherence_change,
            adaptation_strength,
            reasoning: format!("Updated from {} event", event.event_type),
        })
    }

    /// Apply consciousness parameter updates based on event type (matches JavaScript)
    fn apply_event_updates(
        state: &mut ConsciousnessState,
        event: &ConsciousnessEvent,
    ) -> Result<()> {
        // Event type mappings (same as JavaScript EnhancedConsciousnessState)
        let (freq_delta, coherence_delta) = match event.event_type.as_str() {
            "goal_completion" => (0.3, 0.05),
            "goal_failure" => (-0.5, -0.1),
            "social_interaction_major" => {
                // Check context for positive/negative outcome
                let is_positive = event.context.as_ref()
                    .map(|c| c.contains("positive"))
                    .unwrap_or(false);
                if is_positive { (0.2, 0.02) } else { (-0.2, -0.02) }
            },
            "traumatic_encounter" => (-1.0, -0.2),
            "relationship_change_major" => {
                let is_positive = event.context.as_ref()
                    .map(|c| c.contains("positive"))
                    .unwrap_or(false);
                if is_positive { (0.1, 0.01) } else { (-0.1, -0.01) }
            },
            "life_change_event" => {
                let is_positive = event.context.as_ref()
                    .map(|c| c.contains("positive"))
                    .unwrap_or(false);
                if is_positive { (0.4, 0.03) } else { (-0.4, -0.03) }
            },
            "conflict_resolution" => {
                let is_victory = event.context.as_ref()
                    .map(|c| c.contains("victory"))
                    .unwrap_or(false);
                if is_victory { (0.2, 0.02) } else { (-0.3, -0.05) }
            },
            _ => (0.0, 0.0), // Unknown event type
        };

        // Apply deltas
        state.current_frequency += freq_delta;
        state.emotional_coherence += coherence_delta;

        // Validate bounds (3-15 Hz for frequency, 0.2-1.0 for coherence)
        state.current_frequency = state.current_frequency.max(3.0).min(15.0);
        state.emotional_coherence = state.emotional_coherence.max(0.2).min(1.0);

        // Update base parameters to match (for consistency)
        state.base_frequency = state.current_frequency;
        state.base_coherence = state.emotional_coherence;

        Ok(())
    }

    /// Calculate how much the consciousness state has changed
    fn calculate_adaptation_strength(original: &ConsciousnessState, updated: &ConsciousnessState) -> f64 {
        let frequency_diff = (updated.current_frequency - original.current_frequency).abs() / 15.0; // Normalize to 0-1
        let coherence_diff = (updated.emotional_coherence - original.emotional_coherence).abs();
        
        // Simple adaptation metric
        (frequency_diff + coherence_diff).min(1.0)
    }

    /// Process multiple events and return cumulative update
    pub fn process_multiple_events(
        current_state: &ConsciousnessState,
        events: &[ConsciousnessEvent],
    ) -> Result<ConsciousnessUpdate> {
        if events.is_empty() {
            return Ok(ConsciousnessUpdate {
                new_state: *current_state,
                confidence: 1.0,
                coherence_change: 0.0,
                adaptation_strength: 0.0,
                reasoning: "No events to process".to_string(),
            });
        }

        let mut state = *current_state;
        let mut total_coherence_change = 0.0;
        let mut updates_applied = 0;

        // Process each significant event
        for event in events {
            if Self::should_update_from_event(event) {
                let update = Self::update_from_event(&state, event)?;
                state = update.new_state;
                total_coherence_change += update.coherence_change;
                updates_applied += 1;
            }
        }

        let adaptation_strength = Self::calculate_adaptation_strength(current_state, &state);

        Ok(ConsciousnessUpdate {
            new_state: state,
            confidence: 1.0,
            coherence_change: total_coherence_change,
            adaptation_strength,
            reasoning: format!("Processed {} significant events", updates_applied),
        })
    }

    /// Check if consciousness state needs maintenance (matches JavaScript)
    /// Maintenance needed if inactive for over 1 week or too many events
    pub fn needs_maintenance(state: &ConsciousnessState, current_time: u64) -> bool {
        const ONE_WEEK_MS: u64 = 7 * 24 * 60 * 60 * 1000;
        let time_since_update = current_time.saturating_sub(state.last_update);
        time_since_update > ONE_WEEK_MS
    }

    /// Perform maintenance operations (baseline drift for inactive characters)
    pub fn perform_maintenance(state: &mut ConsciousnessState, current_time: u64) {
        const ONE_WEEK_MS: u64 = 7 * 24 * 60 * 60 * 1000;
        let time_since_update = current_time.saturating_sub(state.last_update);

        if time_since_update > ONE_WEEK_MS {
            // Calculate drift factor (max 10% over 4 weeks)
            let drift_factor = (time_since_update as f64 / (ONE_WEEK_MS as f64 * 4.0)).min(0.1);

            // Drift toward baseline values (7.5 Hz, 0.7 coherence)
            let freq_drift = (7.5 - state.base_frequency) * drift_factor;
            let coh_drift = (0.7 - state.base_coherence) * drift_factor;

            state.base_frequency += freq_drift;
            state.base_coherence += coh_drift;

            // Update current values to match
            state.current_frequency = state.base_frequency;
            state.emotional_coherence = state.base_coherence;

            // Update timestamp if significant drift occurred
            if freq_drift.abs() > 0.1 || coh_drift.abs() > 0.01 {
                state.last_update = current_time;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::consciousness::{ConsciousnessState, EmotionalState};
    use crate::types::events::ConsciousnessEvent;

    #[test]
    fn test_significance_threshold() {
        let significant_event = ConsciousnessEvent {
            event_type: "goal_completion".to_string(),
            intensity: 0.5, // Above threshold
            timestamp: 0,
            context: None,
            participants: vec![],
        };

        let insignificant_event = ConsciousnessEvent {
            event_type: "minor_interaction".to_string(),
            intensity: 0.2, // Below threshold
            timestamp: 0,
            context: None,
            participants: vec![],
        };

        assert!(EnhancedConsciousnessUpdater::should_update_from_event(&significant_event));
        assert!(!EnhancedConsciousnessUpdater::should_update_from_event(&insignificant_event));
    }

    #[test]
    fn test_goal_completion_update() {
        let state = ConsciousnessState::default(); // 7.5 Hz, 0.8 coherence
        let event = ConsciousnessEvent {
            event_type: "goal_completion".to_string(),
            intensity: 0.5,
            timestamp: 0,
            context: None,
            participants: vec![],
        };

        let update = EnhancedConsciousnessUpdater::update_from_event(&state, &event).unwrap();

        // Should increase frequency by 0.3, coherence by 0.05
        assert!((update.new_state.current_frequency - 7.8).abs() < 0.01);
        assert!((update.new_state.emotional_coherence - 0.85).abs() < 0.01);
        assert!(update.coherence_change > 0.0);
    }

    #[test]
    fn test_goal_failure_update() {
        let state = ConsciousnessState::default();
        let event = ConsciousnessEvent {
            event_type: "goal_failure".to_string(),
            intensity: 0.5,
            timestamp: 0,
            context: None,
            participants: vec![],
        };

        let update = EnhancedConsciousnessUpdater::update_from_event(&state, &event).unwrap();

        // Should decrease frequency by 0.5, coherence by 0.1
        assert!((update.new_state.current_frequency - 7.0).abs() < 0.01);
        assert!((update.new_state.emotional_coherence - 0.7).abs() < 0.01);
        assert!(update.coherence_change < 0.0);
    }

    #[test]
    fn test_parameter_bounds_enforcement() {
        let state = ConsciousnessState {
            base_frequency: 14.5,
            base_coherence: 0.95,
            current_frequency: 14.5,
            emotional_coherence: 0.95,
            emotional_state: EmotionalState::Content,
            last_update: 0,
        };

        let traumatic_event = ConsciousnessEvent {
            event_type: "traumatic_encounter".to_string(),
            intensity: 0.8,
            timestamp: 0,
            context: None,
            participants: vec![],
        };

        let update = EnhancedConsciousnessUpdater::update_from_event(&state, &traumatic_event).unwrap();

        // Should clamp to valid bounds (3-15 Hz, 0.2-1.0 coherence)
        assert!(update.new_state.current_frequency >= 3.0);
        assert!(update.new_state.current_frequency <= 15.0);
        assert!(update.new_state.emotional_coherence >= 0.2);
        assert!(update.new_state.emotional_coherence <= 1.0);
    }

    #[test]
    fn test_positive_vs_negative_social_interaction() {
        let state = ConsciousnessState::default();

        let positive_event = ConsciousnessEvent {
            event_type: "social_interaction_major".to_string(),
            intensity: 0.5,
            timestamp: 0,
            context: Some("positive outcome".to_string()),
            participants: vec![],
        };

        let negative_event = ConsciousnessEvent {
            event_type: "social_interaction_major".to_string(),
            intensity: 0.5,
            timestamp: 0,
            context: Some("negative outcome".to_string()),
            participants: vec![],
        };

        let positive_update = EnhancedConsciousnessUpdater::update_from_event(&state, &positive_event).unwrap();
        let negative_update = EnhancedConsciousnessUpdater::update_from_event(&state, &negative_event).unwrap();

        // Positive should increase, negative should decrease
        assert!(positive_update.new_state.current_frequency > state.current_frequency);
        assert!(negative_update.new_state.current_frequency < state.current_frequency);
    }

    #[test]
    fn test_maintenance_needs_check() {
        let recent_state = ConsciousnessState {
            last_update: 1000,
            ..Default::default()
        };
        let old_state = ConsciousnessState {
            last_update: 1000,
            ..Default::default()
        };

        const ONE_WEEK_MS: u64 = 7 * 24 * 60 * 60 * 1000;
        let current_time_recent = 1000 + ONE_WEEK_MS - 1000; // Just under 1 week
        let current_time_old = 1000 + ONE_WEEK_MS + 1000;    // Just over 1 week

        assert!(!EnhancedConsciousnessUpdater::needs_maintenance(&recent_state, current_time_recent));
        assert!(EnhancedConsciousnessUpdater::needs_maintenance(&old_state, current_time_old));
    }

    #[test]
    fn test_baseline_drift_maintenance() {
        let mut state = ConsciousnessState {
            base_frequency: 12.0,
            base_coherence: 0.5,
            current_frequency: 12.0,
            emotional_coherence: 0.5,
            emotional_state: EmotionalState::Content,
            last_update: 0,
        };

        const ONE_WEEK_MS: u64 = 7 * 24 * 60 * 60 * 1000;
        let current_time = ONE_WEEK_MS * 2; // 2 weeks later

        EnhancedConsciousnessUpdater::perform_maintenance(&mut state, current_time);

        // Should drift toward 7.5 Hz and 0.7 coherence
        assert!(state.base_frequency < 12.0); // Should decrease
        assert!(state.base_coherence > 0.5);  // Should increase
    }

    #[test]
    fn test_multiple_events_processing() {
        let state = ConsciousnessState::default();
        let events = vec![
            ConsciousnessEvent {
                event_type: "goal_completion".to_string(),
                intensity: 0.5,
                timestamp: 0,
                context: None,
                participants: vec![],
            },
            ConsciousnessEvent {
                event_type: "social_interaction_major".to_string(),
                intensity: 0.4,
                timestamp: 1,
                context: Some("positive".to_string()),
                participants: vec![],
            },
        ];

        let update = EnhancedConsciousnessUpdater::process_multiple_events(&state, &events).unwrap();

        // Both events should be processed, resulting in cumulative increase
        assert!(update.new_state.current_frequency > state.current_frequency);
        assert!(update.new_state.emotional_coherence > state.emotional_coherence);
        assert!(update.adaptation_strength > 0.0);
    }

    #[test]
    fn test_insignificant_event_ignored() {
        let state = ConsciousnessState::default();
        let event = ConsciousnessEvent {
            event_type: "minor_event".to_string(),
            intensity: 0.1, // Below threshold
            timestamp: 0,
            context: None,
            participants: vec![],
        };

        let update = EnhancedConsciousnessUpdater::update_from_event(&state, &event).unwrap();

        // State should not change
        assert_eq!(update.new_state.current_frequency, state.current_frequency);
        assert_eq!(update.new_state.emotional_coherence, state.emotional_coherence);
        assert_eq!(update.coherence_change, 0.0);
    }
}