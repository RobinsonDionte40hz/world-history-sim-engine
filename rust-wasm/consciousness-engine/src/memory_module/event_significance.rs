//! Event significance calculation

use crate::{InteractionEvent, MemoryContext, Result};

/// Calculator for determining memory significance
pub struct EventSignificanceCalculator;

impl EventSignificanceCalculator {
    /// Calculate significance score for memory storage (0.0 - 1.0)
    pub fn calculate_significance(
        event: &InteractionEvent,
        context: &MemoryContext,
    ) -> Result<f64> {
        let mut significance: f64 = 0.0;

        // Emotional impact component (0.0 - 0.4)
        let emotional_component = event.emotional_impact.abs() * 0.4;
        significance += emotional_component;

        // Goal relevance component (0.0 - 0.3)
        let goal_component = context.goal_relevance * 0.3;
        significance += goal_component;

        // Novelty factor component (0.0 - 0.2)
        let novelty_component = context.novelty_factor * 0.2;
        significance += novelty_component;

        // Social importance component (0.0 - 0.1)
        let social_component = context.social_importance * 0.1;
        significance += social_component;

        // Survival relevance component (0.0 - 0.1)
        let survival_component = context.survival_relevance * 0.1;
        significance += survival_component;

        Ok(significance.clamp(0.0, 1.0))
    }
}