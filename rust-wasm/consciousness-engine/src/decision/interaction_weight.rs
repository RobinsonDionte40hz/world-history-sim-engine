//! Interaction weight calculation

use crate::types::character::{Character, Personality, Goal};
use crate::types::interaction::{Interaction, InteractionContext, InteractionType};
use crate::types::consciousness::{BehavioralState, EnergyLevel};
use crate::types::memory::Memory;
use crate::Result;

/// Calculator for interaction weights
pub struct InteractionWeightCalculator;

impl InteractionWeightCalculator {
    /// Calculate weighted probability for interaction selection
    pub fn calculate_interaction_weight(
        character: &Character,
        interaction: &Interaction,
        context: &InteractionContext,
    ) -> Result<f64> {
        let mut weight = interaction.base_weight;

        // Goal alignment (highest priority multiplier: 0.1x - 3.0x)
        let goal_multiplier = Self::calculate_goal_alignment(
            &character.goals,
            &interaction.goal_alignment
        )?;
        weight *= goal_multiplier;

        // Personality alignment (0.5x - 2.0x)
        let personality_multiplier = Self::calculate_personality_alignment(
            &character.personality,
            &interaction.interaction_type,
        )?;
        weight *= personality_multiplier;

        // Memory influence (0.8x - 1.5x)
        let memory_influence = Self::calculate_memory_influence(
            &character.memories,
            &interaction.interaction_type,
        )?;
        weight *= memory_influence;

        // Consciousness state modifier (0.7x - 1.8x)
        if let Some(behavioral_state) = &character.behavioral_state {
            let consciousness_modifier = Self::calculate_consciousness_modifier(
                behavioral_state,
                &interaction.interaction_type,
            )?;
            weight *= consciousness_modifier;
        }

        // Basic needs modifier (0.6x - 2.0x)
        let needs_modifier = Self::calculate_needs_modifier(character, interaction)?;
        weight *= needs_modifier;

        // Context factors (0.9x - 1.3x)
        let context_modifier = Self::calculate_context_modifier(context, interaction)?;
        weight *= context_modifier;

        Ok(weight.clamp(0.0, 10.0))
    }

    fn calculate_goal_alignment(_goals: &[Goal], _goal_alignment: &std::collections::HashMap<String, f64>) -> Result<f64> {
        // Placeholder implementation - would need GoalType enum
        Ok(1.0)
    }

    fn calculate_personality_alignment(personality: &Personality, interaction_type: &InteractionType) -> Result<f64> {
        let alignment = match interaction_type {
            crate::InteractionType::Combat => personality.aggression,
            crate::InteractionType::Exploration => personality.curiosity,
            crate::InteractionType::Social => personality.sociability,
            crate::InteractionType::Learning => personality.curiosity * 0.8,
            _ => 0.5, // Neutral for other types
        };

        Ok(alignment * 1.5 + 0.5) // Scale to 0.5x - 2.0x range
    }

    fn calculate_memory_influence(memories: &[Memory], interaction_type: &InteractionType) -> Result<f64> {
        let relevant_memories: Vec<_> = memories.iter()
            .filter(|m| std::mem::discriminant(&m.interaction_type) == std::mem::discriminant(interaction_type))
            .collect();

        if relevant_memories.is_empty() {
            return Ok(1.0); // No memories, neutral influence
        }

        let avg_emotional_impact: f64 = relevant_memories.iter()
            .map(|m| m.emotional_impact)
            .sum::<f64>() / relevant_memories.len() as f64;

        // Positive memories increase likelihood, negative decrease
        Ok((avg_emotional_impact * 0.3 + 1.0).clamp(0.8, 1.5))
    }

    fn calculate_consciousness_modifier(behavioral_state: &BehavioralState, interaction_type: &crate::InteractionType) -> Result<f64> {
        let base_modifier = match interaction_type {
            InteractionType::Social => behavioral_state.social_drive,
            InteractionType::Combat => behavioral_state.risk_tolerance,
            InteractionType::Exploration => behavioral_state.ambition,
            _ => 0.5,
        };

        // Energy level modifier
        let energy_modifier = match behavioral_state.energy {
            EnergyLevel::VeryLow => 0.7,
            EnergyLevel::Low => 0.8,
            EnergyLevel::Moderate => 1.0,
            EnergyLevel::High => 1.2,
            EnergyLevel::VeryHigh => 1.3,
        };

        Ok((base_modifier * energy_modifier).clamp(0.7, 1.8))
    }

    fn calculate_needs_modifier(_character: &Character, _interaction: &Interaction) -> Result<f64> {
        // Placeholder - would integrate with needs system
        Ok(1.0)
    }

    fn calculate_context_modifier(_context: &InteractionContext, _interaction: &Interaction) -> Result<f64> {
        // Placeholder - would consider time, location, etc.
        Ok(1.0)
    }
}