//! Event significance calculation

use crate::{InteractionEvent, MemoryContext, Result, ConsciousnessError};

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

    /// Validate event for significance calculation
    pub fn validate_event(event: &InteractionEvent) -> Result<()> {
        if event.emotional_impact < -1.0 || event.emotional_impact > 1.0 {
            return Err(ConsciousnessError::ValidationError {
                field: "emotional_impact".to_string(),
                message: format!("Emotional impact must be between -1.0 and 1.0, got {}", event.emotional_impact)
            });
        }
        Ok(())
    }

    /// Validate context for significance calculation
    pub fn validate_context(context: &MemoryContext) -> Result<()> {
        if context.goal_relevance < 0.0 || context.goal_relevance > 1.0 {
            return Err(ConsciousnessError::ValidationError {
                field: "goal_relevance".to_string(),
                message: format!("Goal relevance must be between 0.0 and 1.0, got {}", context.goal_relevance)
            });
        }
        if context.novelty_factor < 0.0 || context.novelty_factor > 1.0 {
            return Err(ConsciousnessError::ValidationError {
                field: "novelty_factor".to_string(),
                message: format!("Novelty factor must be between 0.0 and 1.0, got {}", context.novelty_factor)
            });
        }
        if context.social_importance < 0.0 || context.social_importance > 1.0 {
            return Err(ConsciousnessError::ValidationError {
                field: "social_importance".to_string(),
                message: format!("Social importance must be between 0.0 and 1.0, got {}", context.social_importance)
            });
        }
        if context.survival_relevance < 0.0 || context.survival_relevance > 1.0 {
            return Err(ConsciousnessError::ValidationError {
                field: "survival_relevance".to_string(),
                message: format!("Survival relevance must be between 0.0 and 1.0, got {}", context.survival_relevance)
            });
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::InteractionType;

    fn create_test_event(emotional_impact: f64) -> InteractionEvent {
        InteractionEvent {
            id: "test_event".to_string(),
            timestamp: 1000,
            emotional_impact,
            interaction_type: InteractionType::Social,
            participants: vec!["npc_1".to_string()],
            context: create_test_context(),
        }
    }

    fn create_test_context() -> MemoryContext {
        MemoryContext {
            node_id: "node_1".to_string(),
            location: Some("test_location".to_string()),
            goal_relevance: 0.5,
            novelty_factor: 0.5,
            social_importance: 0.5,
            survival_relevance: 0.5,
            participants: vec!["npc_1".to_string()],
        }
    }

    #[test]
    fn test_calculate_significance_all_components() {
        let event = create_test_event(0.5);
        let context = create_test_context();
        
        let result = EventSignificanceCalculator::calculate_significance(&event, &context);
        assert!(result.is_ok());
        
        let significance = result.unwrap();
        // 0.5 * 0.4 (emotional) + 0.5 * 0.3 (goal) + 0.5 * 0.2 (novelty) + 0.5 * 0.1 (social) + 0.5 * 0.1 (survival)
        // = 0.2 + 0.15 + 0.1 + 0.05 + 0.05 = 0.55
        assert!((significance - 0.55).abs() < 0.001);
    }

    #[test]
    fn test_calculate_significance_bounds() {
        let event = create_test_event(1.0);
        let mut context = create_test_context();
        context.goal_relevance = 1.0;
        context.novelty_factor = 1.0;
        context.social_importance = 1.0;
        context.survival_relevance = 1.0;
        
        let result = EventSignificanceCalculator::calculate_significance(&event, &context);
        assert!(result.is_ok());
        
        let significance = result.unwrap();
        // Should be 1.0 (0.4 + 0.3 + 0.2 + 0.1 + 0.1)
        assert!((significance - 1.0).abs() < 0.001);
    }

    #[test]
    fn test_negative_emotional_impact() {
        let event = create_test_event(-0.8);
        let context = create_test_context();
        
        let result = EventSignificanceCalculator::calculate_significance(&event, &context);
        assert!(result.is_ok());
        
        let significance = result.unwrap();
        // Negative emotional impact uses abs(), so 0.8 * 0.4 = 0.32
        assert!(significance > 0.3);
    }

    #[test]
    fn test_validate_event_valid() {
        let event = create_test_event(0.5);
        let result = EventSignificanceCalculator::validate_event(&event);
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_event_invalid_emotional_impact() {
        let event = create_test_event(1.5);
        let result = EventSignificanceCalculator::validate_event(&event);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_context_valid() {
        let context = create_test_context();
        let result = EventSignificanceCalculator::validate_context(&context);
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_context_invalid_goal_relevance() {
        let mut context = create_test_context();
        context.goal_relevance = 1.5;
        let result = EventSignificanceCalculator::validate_context(&context);
        assert!(result.is_err());
    }
}
