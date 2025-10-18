//! Behavior generation logic

use crate::types::character::Character;
use crate::types::interaction::{Interaction, InteractionContext};
use crate::Result;
use crate::decision::interaction_weight::InteractionWeightCalculator;

/// Service for generating autonomous behavior
pub struct BehaviorGenerationService;

impl BehaviorGenerationService {
    /// Generate behavior for a character by selecting highest-weighted interaction
    pub fn generate_behavior(
        character: &Character,
        available_interactions: &[Interaction],
        context: &InteractionContext,
    ) -> Result<Option<Interaction>> {
        if available_interactions.is_empty() {
            return Ok(None);
        }

        let calculator = InteractionWeightCalculator::new();
        let mut best_interaction = None;
        let mut best_weight = 0.0;

        for interaction in available_interactions {
            let weight = calculator.calculate_interaction_weight(
                character,
                interaction,
                context,
            )?;

            if weight > best_weight {
                best_weight = weight;
                best_interaction = Some(interaction.clone());
            }
        }

        Ok(best_interaction)
    }
}