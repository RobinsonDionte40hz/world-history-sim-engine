//! Interaction weight calculation
//!
//! Implements sophisticated multi-factor weight calculation system for NPC decision making.
//! Port of the JavaScript GenerateBehavior logic with 13 weighting factors.

use crate::types::character::{Character, Personality, Goal};
use crate::types::interaction::{Interaction, InteractionContext, InteractionType};
use crate::types::consciousness::{BehavioralState, EnergyLevel, EmotionalState};
use crate::types::memory::Memory;
use crate::Result;
use crate::memory_module::SignificantMemoryService;
use std::collections::HashMap;

/// Calculator for interaction weights using multi-factor analysis
pub struct InteractionWeightCalculator {
    memory_service: SignificantMemoryService,
}

impl InteractionWeightCalculator {
    /// Create a new InteractionWeightCalculator
    pub fn new() -> Self {
        Self {
            memory_service: SignificantMemoryService,
        }
    }

    /// Calculate weighted probability for interaction selection
    ///
    /// # Factors (in priority order):
    /// 1. Goal Priority (+10.0) - DOMINANT factor
    /// 2. Critical Needs (+8.0) - Override everything except goals
    /// 3. Environmental Suitability (0.1x - 2.0x modifiers)
    /// 4. Personality Influence (+2.0)
    /// 5. Memory Influence (-2.0 to +2.0)
    /// 6. Emotional State (0.1x - 3.0x modifiers)
    /// 7. Need-Based Modifiers (settlement economy)
    /// 8. Need-Based Priorities (2.0x for seeking behaviors)
    /// 9. Content Interaction Boost (2.5x)
    /// 10. D&D Attribute Modifiers
    /// 11. Consciousness State Influence
    /// 12. Schedule-Based Priorities (4.0x for on-schedule, 0.2x for conflicts)
    /// 13. Random Variation (+0.0 to +0.5)
    pub fn calculate_interaction_weight(
        &self,
        character: &Character,
        interaction: &Interaction,
        context: &InteractionContext,
    ) -> Result<f64> {
        let mut weight = 1.0; // Base weight

        // Factor 1: GOAL PRIORITY (DOMINANT - +10.0)
        weight += self.calculate_goal_priority(character, interaction);

        // Factor 2: CRITICAL NEEDS (+8.0 for critical, +3.0 for moderate)
        weight += self.calculate_critical_needs(character, interaction);

        // Factor 3: ENVIRONMENTAL SUITABILITY (0.1x - 3.0x)
        weight *= self.calculate_environmental_suitability(character, interaction, context)?;

        // Factor 4: PERSONALITY INFLUENCE (+2.0)
        weight += self.calculate_personality_influence(character, interaction)?;

        // Factor 5: MEMORY INFLUENCE (-2.0 to +2.0)
        if let Some(memories) = &character.significant_memories {
            let memory_score = self.memory_service.calculate_memory_influence(
                memories,
                &interaction.interaction_type
            )?;
            weight += memory_score * 2.0;
        }

        // Factor 6: EMOTIONAL STATE (0.1x - 3.0x with strong overrides)
        weight *= self.calculate_emotional_influence(character, interaction)?;

        // Factor 7-8: NEED-BASED MODIFIERS AND PRIORITIES
        weight *= self.calculate_need_based_modifiers(character, interaction);
        weight *= self.calculate_need_based_priorities(character, interaction);

        // Factor 9: CONTENT INTERACTION BOOST (2.5x for non-system interactions)
        if !interaction.is_system_interaction {
            weight *= 2.5;
        }

        // Factor 10: D&D ATTRIBUTE MODIFIERS
        weight *= self.calculate_attribute_bonus(character, interaction);

        // Factor 11: CONSCIOUSNESS STATE INFLUENCE (from behavioral state)
        if let Some(_behavioral_state) = &character.behavioral_state {
            let consciousness_modifier = self.calculate_consciousness_modifier(character, interaction)?;
            weight *= consciousness_modifier;
        }

        // Factor 12: SCHEDULE-BASED PRIORITIES (4.0x on-schedule, 0.2x conflict)
        weight *= self.calculate_schedule_priorities(character, interaction, context)?;

        // Factor 13: RANDOM VARIATION (+0.0 to +0.5)
        weight += rand::random::<f64>() * 0.5;

        // Ensure non-negative
        Ok(weight.max(0.01))
    }

    // ============================================================================
    // FACTOR CALCULATION METHODS
    // ============================================================================

    /// Factor 1: Calculate goal priority bonus
    /// Returns +10.0 if interaction matches any character goal, 0.0 otherwise
    fn calculate_goal_priority(&self, character: &Character, interaction: &Interaction) -> f64 {
        if character.goals.is_empty() {
            return 0.0;
        }

        let interaction_name_lower = interaction.name.to_lowercase();
        let interaction_category_lower = interaction.category.as_ref()
            .map(|c| c.to_lowercase());
        
        let matches_goal = character.goals.iter().any(|goal| {
            let goal_id_lower = goal.id.to_lowercase();
            
            // Direct name matching
            if interaction_name_lower.contains(&goal_id_lower) {
                return true;
            }
            
            // Category matching
            if let Some(ref cat_lower) = interaction_category_lower {
                if cat_lower.contains(&goal_id_lower) {
                    return true;
                }
            }
            
            // Tag matching
            if interaction.tags.iter().any(|tag| tag.to_lowercase().contains(&goal_id_lower)) {
                return true;
            }
            
            // Category exact match
            if goal.category.as_ref() == interaction.category.as_ref() {
                return true;
            }
            
            // Flexible matching for common patterns
            match goal_id_lower.as_str() {
                "socialize" => {
                    interaction_category_lower.as_ref().map_or(false, |c| c == "social")
                        || interaction.tags.iter().any(|t| t.to_lowercase() == "social")
                }
                "learn" => {
                    interaction_category_lower.as_ref().map_or(false, |c| c == "education")
                        || interaction.tags.iter().any(|t| t.to_lowercase() == "learn")
                }
                "explore" => {
                    interaction.interaction_type == InteractionType::Travel
                        || interaction_category_lower.as_ref().map_or(false, |c| c == "exploration")
                }
                _ => false,
            }
        });

        if matches_goal { 10.0 } else { 0.0 }
    }

    /// Factor 2: Calculate critical needs bonus
    /// Returns +8.0 for critical energy need, +3.0 for moderate, +0.5 for low
    fn calculate_critical_needs(&self, character: &Character, interaction: &Interaction) -> f64 {
        let energy_percent = character.energy as f64 / character.max_energy as f64;

        if interaction.interaction_type == InteractionType::Rest {
            if energy_percent < 0.2 {
                8.0 // Critical need
            } else if energy_percent < 0.5 {
                3.0 // Moderate need
            } else {
                0.5 // Low priority when not needed
            }
        } else {
            0.0
        }
    }

    /// Factor 3: Calculate environmental suitability multiplier
    /// Returns 0.1x for rest in danger, 3.0x for leaving danger, 1.0x otherwise
    fn calculate_environmental_suitability(
        &self,
        character: &Character,
        interaction: &Interaction,
        context: &InteractionContext,
    ) -> Result<f64> {
        if let Some(node_id) = &character.current_node_id {
            // Check if current node is dangerous
            let is_dangerous = context.environment_properties
                .as_ref()
                .and_then(|props| props.get("is_dangerous"))
                .and_then(|v| v.as_bool())
                .unwrap_or(false);

            if is_dangerous {
                match interaction.interaction_type {
                    InteractionType::Rest => return Ok(0.1), // Heavily discourage rest in danger
                    InteractionType::Travel => return Ok(3.0), // Encourage leaving dangerous areas
                    _ => {}
                }
            }
        }

        Ok(1.0) // Neutral by default
    }

    /// Factor 4: Calculate personality influence bonus
    /// Returns +2.0 for strong trait alignment, +1.0 for moderate, 0.0 otherwise
    fn calculate_personality_influence(&self, character: &Character, interaction: &Interaction) -> Result<f64> {
        let personality = &character.personality;
        let mut bonus = 0.0;

        // Match interaction types to personality traits
        match interaction.interaction_type {
            InteractionType::Social => {
                if personality.extrovert > 0.5 {
                    bonus += 2.0;
                }
            }
            InteractionType::Exploration => {
                if personality.curiosity > 0.5 {
                    bonus += 2.0;
                }
            }
            InteractionType::Rest => {
                // Check for "lazy" trait via low energy or low ambition
                if personality.ambition < 0.3 {
                    bonus += 1.0;
                }
            }
            _ => {}
        }

        Ok(bonus)
    }

    /// Factor 6: Calculate emotional state influence multiplier
    /// Returns 0.1x - 3.0x with strong overrides for specific states
    fn calculate_emotional_influence(&self, character: &Character, interaction: &Interaction) -> Result<f64> {
        let emotional_state = character.consciousness.emotional_state;
        
        // Get base emotional modifier (0.1x to 3.0x)
        let mut multiplier = self.get_emotional_modifier(emotional_state, interaction);

        // Strong emotional overrides for specific states
        match emotional_state {
            EmotionalState::Exhausted => {
                if interaction.interaction_type != InteractionType::Rest {
                    multiplier *= 0.2; // Exhausted characters really need rest
                }
            }
            EmotionalState::Manic => {
                // Check if interaction is risky
                if interaction.tags.contains(&"risky".to_string()) 
                    || interaction.tags.contains(&"dangerous".to_string()) {
                    multiplier *= 2.0; // Manic characters seek risk
                }
            }
            EmotionalState::Angry => {
                if interaction.interaction_type == InteractionType::Social {
                    multiplier *= 0.3; // Angry characters avoid social interaction
                }
            }
            _ => {}
        }

        Ok(multiplier)
    }

    /// Get emotional modifier based on emotional state and interaction type
    fn get_emotional_modifier(&self, emotional_state: EmotionalState, interaction: &Interaction) -> f64 {
        // Map emotional states to interaction type preferences
        match emotional_state {
            EmotionalState::Joyful => {
                match interaction.interaction_type {
                    InteractionType::Social => 1.5,
                    InteractionType::Exploration => 1.3,
                    _ => 1.0,
                }
            }
            EmotionalState::Angry => {
                match interaction.interaction_type {
                    InteractionType::Combat => 1.8,
                    InteractionType::Social => 0.3,
                    _ => 0.8,
                }
            }
            EmotionalState::Anxious => {
                match interaction.interaction_type {
                    InteractionType::Rest => 1.4,
                    InteractionType::Social => 0.6,
                    InteractionType::Exploration => 0.5,
                    _ => 0.9,
                }
            }
            EmotionalState::Depressed => {
                match interaction.interaction_type {
                    InteractionType::Rest => 1.5,
                    _ => 0.7,
                }
            }
            EmotionalState::Exhausted => {
                match interaction.interaction_type {
                    InteractionType::Rest => 3.0,
                    _ => 0.2,
                }
            }
            EmotionalState::Manic => {
                match interaction.interaction_type {
                    InteractionType::Exploration => 2.0,
                    InteractionType::Social => 1.8,
                    InteractionType::Rest => 0.3,
                    _ => 1.2,
                }
            }
            EmotionalState::Content => 1.0, // Neutral across all interactions
            EmotionalState::Calm => 1.0,
        }
    }

    /// Factor 7: Calculate need-based modifiers from settlement economy
    fn calculate_need_based_modifiers(&self, character: &Character, interaction: &Interaction) -> f64 {
        if let Some(modifiers) = &character.need_based_interaction_modifiers {
            let interaction_type = self.get_interaction_type_key(interaction);
            *modifiers.get(&interaction_type).unwrap_or(&1.0)
        } else {
            1.0
        }
    }

    /// Factor 8: Calculate need-based priority multipliers
    fn calculate_need_based_priorities(&self, character: &Character, interaction: &Interaction) -> f64 {
        if let Some(behavior_changes) = &character.need_based_behavior_changes {
            let interaction_type = self.get_interaction_type_key(interaction);
            let mut multiplier = 1.0;

            // Seeking behaviors get 2.0x boost
            if behavior_changes.contains(&"seek_food".to_string())
                && (interaction_type.contains("farm") || interaction_type.contains("hunt"))
            {
                multiplier *= 2.0;
            }

            if behavior_changes.contains(&"seek_water".to_string())
                && interaction_type.contains("water")
            {
                multiplier *= 2.0;
            }

            if behavior_changes.contains(&"seek_shelter".to_string())
                && (interaction_type.contains("build") || interaction_type.contains("shelter"))
            {
                multiplier *= 1.8;
            }

            // Avoidance behaviors get 0.3x penalty
            if behavior_changes.contains(&"avoid_strenuous_activity".to_string())
                && (interaction_type.contains("build")
                    || interaction_type.contains("hunt")
                    || interaction_type.contains("fight"))
            {
                multiplier *= 0.3;
            }

            multiplier
        } else {
            1.0
        }
    }

    /// Factor 10: Calculate D&D attribute bonus multiplier
    fn calculate_attribute_bonus(&self, character: &Character, interaction: &Interaction) -> f64 {
        if interaction.attribute_requirements.is_empty() {
            return 1.0;
        }

        let mut bonus = 0.0;

        for (attr_name, required_value) in &interaction.attribute_requirements {
            if let Some(char_attr) = character.attributes.get(attr_name) {
                let char_value = char_attr.value;
                if char_value > *required_value {
                    bonus += 0.1 * ((char_value - required_value) as f64 / *required_value as f64);
                } else {
                    bonus -= 0.2; // Penalty for not meeting requirements
                }
            }
        }

        (1.0 + bonus).max(0.1)
    }

    /// Factor 11: Calculate consciousness state modifier from behavioral state
    fn calculate_consciousness_modifier(&self, character: &Character, interaction: &Interaction) -> Result<f64> {
        // Use behavioral state service to get modifier
        // For now, return neutral multiplier
        // TODO: Integrate with BehavioralStateService once it's ported
        Ok(1.0)
    }

    /// Factor 12: Calculate schedule-based priorities
    fn calculate_schedule_priorities(
        &self,
        character: &Character,
        interaction: &Interaction,
        context: &InteractionContext,
    ) -> Result<f64> {
        // Check if interaction is routine/scheduled
        if interaction.is_routine || interaction.category.as_ref().map_or(false, |c| c == "routine") {
            // TODO: Integrate with DailyScheduleService once ported
            // For now, give moderate boost to routine activities
            return Ok(1.5);
        }

        Ok(1.0)
    }

    /// Get interaction type key for need-based lookups
    fn get_interaction_type_key(&self, interaction: &Interaction) -> String {
        interaction.interaction_type.to_string().to_lowercase()
    }
}

impl Default for InteractionWeightCalculator {
    fn default() -> Self {
        Self::new()
    }
}