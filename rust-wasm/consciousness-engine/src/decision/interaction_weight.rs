//! Interaction Weight Calculator
//!
//! Calculates weighted priorities for NPC interactions using a 13-factor system:
//! 1. Goal Priority - Direct goal alignment (+10.0 for matching goals)
//! 2. Critical Needs - Urgency-based prioritization (+8.0 critical, +3.0 moderate)
//! 3. Environmental Suitability - Context-based multipliers (0.1x-3.0x)
//! 4. Personality Influence - Trait alignment bonuses (+2.0 max)
//! 5. Memory Influence - Past experience effects (-2.0 to +2.0)
//! 6. Emotional Influence - State-based multipliers (0.1x-3.0x)
//! 7-8. Need-Based Modifiers - Seeking/avoidance behaviors (0.3x-2.0x)
//! 9. Content Boost - Non-system interaction preference (2.5x)
//! 10. Attribute Bonus - D&D-style attribute effects
//! 11. Consciousness Modifier - Behavioral state integration
//! 12. Schedule Priorities - Routine alignment (0.2x-4.0x)
//! 13. Random Variation - Small randomness (+0.0 to +0.5)

use crate::Result;
use crate::types::character::{Character, GoalType};
use crate::types::interaction::{Interaction, InteractionContext, InteractionType};
use crate::types::consciousness::EmotionalState;
use crate::memory_module::significant_memory::SignificantMemoryService;
use rand::Rng;

/// Interaction weight calculator service
pub struct InteractionWeightCalculator {
    memory_service: SignificantMemoryService,
}

impl InteractionWeightCalculator {
    /// Create a new interaction weight calculator
    pub fn new() -> Self {
        Self {
            memory_service: SignificantMemoryService,
        }
    }

    /// Calculate comprehensive interaction weight using all 13 factors
    pub fn calculate_interaction_weight(
        &self,
        character: &Character,
        interaction: &Interaction,
        context: &InteractionContext,
    ) -> Result<f64> {
        // Start with base weight
        let mut weight = interaction.base_weight;

        // Factor 1: Goal Priority (DOMINANT: +10.0 for direct matches)
        weight += self.calculate_goal_priority(character, interaction)?;

        // Factor 2: Critical Needs (+8.0 critical, +3.0 moderate, +0.5 low)
        weight += self.calculate_critical_needs(character, interaction)?;

        // Factor 3: Environmental Suitability (0.1x-3.0x multiplier)
        let env_multiplier = self.calculate_environmental_suitability(character, interaction, context)?;
        weight *= env_multiplier;

        // Factor 4: Personality Influence (+2.0 for strong alignment)
        weight += self.calculate_personality_influence(character, interaction)?;

        // Factor 5: Memory Influence (-2.0 to +2.0 from past experiences)
        let memories = character.significant_memories.as_ref()
            .or(Some(&character.memories))
            .unwrap();
        let memory_score = SignificantMemoryService::calculate_memory_influence(
            memories,
            &interaction.interaction_type
        )?;
        weight += memory_score;

        // Factor 6: Emotional Influence (0.1x-3.0x multiplier with overrides)
        let emotional_multiplier = self.calculate_emotional_influence(character, interaction)?;
        weight *= emotional_multiplier;

        // Factor 7-8: Need-Based Modifiers (2.0x seeking, 0.3x avoidance)
        weight *= self.calculate_need_based_modifiers(character, interaction)?;
        weight += self.calculate_need_based_priorities(character, interaction)?;

        // Factor 9: Content Boost (2.5x for content-driven interactions)
        // Prefer non-base interactions
        if interaction.base_weight > 0.5 {
            weight *= 2.5;
        }

        // Factor 10: Attribute Bonus (D&D attribute modifiers)
        weight *= self.calculate_attribute_bonus(character, interaction)?;

        // Factor 11: Consciousness Modifier (behavioral state influence)
        weight *= self.calculate_consciousness_modifier(character, interaction)?;

        // Factor 12: Schedule Priorities (4.0x on-schedule, 0.2x conflicts)
        weight *= self.calculate_schedule_priorities(character, interaction)?;

        // Factor 13: Random Variation (+0.0 to +0.5 for unpredictability)
        let mut rng = rand::thread_rng();
        weight += rng.r#gen::<f64>() * 0.5;

        // Ensure non-negative weight
        Ok(weight.max(0.0))
    }

    /// Factor 1: Calculate goal priority bonus (+10.0 for direct matches)
    fn calculate_goal_priority(&self, character: &Character, interaction: &Interaction) -> Result<f64> {
        let mut priority_bonus = 0.0;

        for goal in &character.goals {
            // Direct goal-interaction alignment check
            if let Some(alignment) = interaction.goal_alignment.get(&goal.id) {
                // Strong bonus for aligned goals
                priority_bonus += alignment * goal.priority * 10.0;
            }

            // Check interaction type alignment with goal type
            let type_match = match (goal.goal_type, interaction.interaction_type) {
                (GoalType::Exploration, InteractionType::Exploration) |
                (GoalType::Social, InteractionType::Social) |
                (GoalType::Economic, InteractionType::Economic) |
                (GoalType::Combat, InteractionType::Combat) |
                (GoalType::Learning, InteractionType::Learning) |
                (GoalType::Rest, InteractionType::Rest) => true,
                _ => false,
            };

            if type_match {
                priority_bonus += goal.priority * 5.0;
            }
        }

        Ok(priority_bonus)
    }

    /// Factor 2: Calculate critical needs bonus
    fn calculate_critical_needs(&self, character: &Character, interaction: &Interaction) -> Result<f64> {
        // Use behavioral state if available to infer needs
        if let Some(behavioral_state) = &character.behavioral_state {
            let energy_urgency = match behavioral_state.energy {
                crate::types::consciousness::EnergyLevel::VeryLow => {
                    if matches!(interaction.interaction_type, InteractionType::Rest) {
                        8.0 // Critical need
                    } else {
                        -2.0 // Avoid other activities
                    }
                },
                crate::types::consciousness::EnergyLevel::Low => {
                    if matches!(interaction.interaction_type, InteractionType::Rest) {
                        3.0 // Moderate need
                    } else {
                        -0.5
                    }
                },
                crate::types::consciousness::EnergyLevel::VeryHigh => {
                    if matches!(interaction.interaction_type, InteractionType::Rest) {
                        -2.0 // Avoid rest when energized
                    } else {
                        0.5 // Small bonus for activity
                    }
                },
                _ => 0.0,
            };

            return Ok(energy_urgency);
        }

        Ok(0.0)
    }

    /// Factor 3: Calculate environmental suitability multiplier (0.1x-3.0x)
    fn calculate_environmental_suitability(
        &self,
        _character: &Character,
        interaction: &Interaction,
        context: &InteractionContext,
    ) -> Result<f64> {
        let mut multiplier = 1.0;

        // Check environmental factors from context
        if let Some(danger_level) = context.environmental_factors.get("danger") {
            if *danger_level > 0.7 {
                // High danger environment
                match interaction.interaction_type {
                    InteractionType::Combat => multiplier *= 3.0, // Appropriate response
                    InteractionType::Exploration => multiplier *= 0.3, // Risky
                    InteractionType::Rest => multiplier *= 0.1, // Very inappropriate
                    _ => multiplier *= 0.5,
                }
            }
        }

        // Check time appropriateness
        if let Some(time) = &context.time_of_day {
            if time == "night" && matches!(interaction.interaction_type, InteractionType::Rest) {
                multiplier *= 2.0;
            }
        }

        // Check social context
        if let Some(social) = &context.social_context {
            if social == "crowded" && matches!(interaction.interaction_type, InteractionType::Social) {
                multiplier *= 1.5;
            }
        }

        Ok(multiplier)
    }

    /// Factor 4: Calculate personality influence bonus (+2.0 max)
    fn calculate_personality_influence(&self, character: &Character, interaction: &Interaction) -> Result<f64> {
        let personality = &character.personality;
        let mut influence = 0.0;

        match interaction.interaction_type {
            InteractionType::Social => {
                // Sociability strongly affects social interactions
                if personality.sociability > 0.7 {
                    influence += 2.0;
                } else if personality.sociability < 0.3 {
                    influence -= 1.0;
                }
            },
            InteractionType::Exploration => {
                // Curiosity drives exploration
                if personality.curiosity > 0.7 {
                    influence += 2.0;
                }
            },
            InteractionType::Combat => {
                // Aggression affects combat willingness
                if personality.aggression > 0.6 {
                    influence += 1.5;
                } else if personality.aggression < 0.3 {
                    influence -= 1.5;
                }
            },
            InteractionType::Learning => {
                // Intelligence and curiosity affect learning
                if personality.curiosity > 0.6 {
                    influence += 1.5;
                }
            },
            InteractionType::Economic => {
                // Ambition drives economic activity
                if personality.ambition > 0.6 {
                    influence += 1.0;
                }
            },
            InteractionType::Rest => {
                // Low energy personalities need more rest
                influence += 0.5;
            },
            _ => {},
        }

        Ok(influence)
    }

    /// Factor 6: Calculate emotional influence multiplier (0.1x-3.0x)
    fn calculate_emotional_influence(&self, character: &Character, interaction: &Interaction) -> Result<f64> {
        let emotional_state = character.consciousness.emotional_state;

        let mut multiplier = match emotional_state {
            EmotionalState::Anxious => {
                match interaction.interaction_type {
                    InteractionType::Rest => 2.0,
                    InteractionType::Combat => 0.3,
                    InteractionType::Social => 0.5,
                    _ => 1.0,
                }
            },
            EmotionalState::Angry => {
                match interaction.interaction_type {
                    InteractionType::Combat => 2.5,
                    InteractionType::Social => 0.4,
                    InteractionType::Rest => 0.5,
                    _ => 1.0,
                }
            },
            EmotionalState::Depressed => {
                match interaction.interaction_type {
                    InteractionType::Rest => 2.0,
                    InteractionType::Social => 0.3,
                    _ => 0.7,
                }
            },
            EmotionalState::Excited | EmotionalState::Joyful => {
                match interaction.interaction_type {
                    InteractionType::Social => 2.0,
                    InteractionType::Exploration => 1.8,
                    InteractionType::Rest => 0.5,
                    _ => 1.2,
                }
            },
            EmotionalState::Fearful => {
                match interaction.interaction_type {
                    InteractionType::Combat => 0.2,
                    InteractionType::Exploration => 0.4,
                    InteractionType::Rest => 1.5,
                    _ => 0.8,
                }
            },
            EmotionalState::Surprised => {
                match interaction.interaction_type {
                    InteractionType::Exploration => 1.5,
                    _ => 1.0,
                }
            },
            EmotionalState::Content => 1.0,
        };

        // Additional emotional coherence influence
        if character.consciousness.emotional_coherence < 0.4 {
            // Low coherence = scattered decision making
            multiplier *= 0.8;
        } else if character.consciousness.emotional_coherence > 0.8 {
            // High coherence = focused decision making
            multiplier *= 1.2;
        }

        Ok(multiplier)
    }

    /// Factor 7: Calculate need-based modifiers (2.0x seeking, 0.3x avoidance)
    fn calculate_need_based_modifiers(&self, character: &Character, _interaction: &Interaction) -> Result<f64> {
        // Use behavioral state to infer needs
        if let Some(behavioral_state) = &character.behavioral_state {
            let energy_level = match behavioral_state.energy {
                crate::types::consciousness::EnergyLevel::VeryLow => 0.3,
                crate::types::consciousness::EnergyLevel::Low => 0.6,
                crate::types::consciousness::EnergyLevel::Moderate => 1.0,
                crate::types::consciousness::EnergyLevel::High => 1.3,
                crate::types::consciousness::EnergyLevel::VeryHigh => 1.5,
            };

            return Ok(energy_level);
        }

        Ok(1.0)
    }

    /// Factor 8: Calculate need-based priorities
    fn calculate_need_based_priorities(&self, character: &Character, interaction: &Interaction) -> Result<f64> {
        if let Some(behavioral_state) = &character.behavioral_state {
            // Social drive affects social interactions
            if matches!(interaction.interaction_type, InteractionType::Social) {
                return Ok(behavioral_state.social_drive * 2.0);
            }

            // Risk tolerance affects dangerous activities
            if matches!(interaction.interaction_type, InteractionType::Combat | InteractionType::Exploration) {
                return Ok(behavioral_state.risk_tolerance * 1.5);
            }

            // Ambition affects economic and achievement activities
            if matches!(interaction.interaction_type, InteractionType::Economic | InteractionType::Learning) {
                return Ok(behavioral_state.ambition * 1.5);
            }
        }

        Ok(0.0)
    }

    /// Factor 10: Calculate attribute bonus (D&D-style modifiers)
    fn calculate_attribute_bonus(&self, character: &Character, interaction: &Interaction) -> Result<f64> {
        // Check if there are attribute requirements
        if let Some(min_attrs) = &interaction.requirements.min_attributes {
            let attrs = &character.attributes;
            let mut total_modifier = 0.0;
            let mut count = 0;

            // Calculate modifiers for each attribute
            let modifiers = [
                (attrs.strength, min_attrs.strength),
                (attrs.dexterity, min_attrs.dexterity),
                (attrs.constitution, min_attrs.constitution),
                (attrs.intelligence, min_attrs.intelligence),
                (attrs.wisdom, min_attrs.wisdom),
                (attrs.charisma, min_attrs.charisma),
            ];

            for (char_attr, required) in modifiers {
                if required > 10 {
                    // This attribute matters for this interaction
                    let diff = char_attr as i16 - required as i16;
                    // D&D style: (attr - 10) / 2
                    let modifier = (diff as f64) / 2.0;
                    total_modifier += modifier;
                    count += 1;
                }
            }

            if count > 0 {
                let avg_modifier = total_modifier / count as f64;
                // Convert to multiplier (0.1 to 2.0 range)
                return Ok((1.0 + avg_modifier * 0.1).max(0.1).min(2.0));
            }
        }

        Ok(1.0)
    }

    /// Factor 11: Calculate consciousness modifier
    fn calculate_consciousness_modifier(&self, character: &Character, _interaction: &Interaction) -> Result<f64> {
        // High frequency = high energy = more activity
        let frequency_modifier = character.consciousness.current_frequency / 10.0;
        
        // High coherence = better decision quality
        let coherence_modifier = character.consciousness.emotional_coherence;
        
        Ok((frequency_modifier * coherence_modifier).max(0.5).min(1.5))
    }

    /// Factor 12: Calculate schedule priorities (4.0x on-schedule, 0.2x conflicts)
    fn calculate_schedule_priorities(&self, _character: &Character, _interaction: &Interaction) -> Result<f64> {
        // Placeholder for routine/schedule system
        // Would check if interaction aligns with character's daily routine
        Ok(1.0)
    }
}

impl Default for InteractionWeightCalculator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::character::{Character, Goal, Personality};
    use crate::types::interaction::{Interaction, InteractionRequirements, InteractionEffects, ConsciousnessImpact};
    use std::collections::HashMap;

    fn create_test_character() -> Character {
        let mut char = Character::default();
        char.personality = Personality {
            aggression: 0.3,
            curiosity: 0.8,
            empathy: 0.6,
            ambition: 0.7,
            sociability: 0.5,
        };
        char.goals = vec![
            Goal {
                id: "explore_world".to_string(),
                goal_type: GoalType::Exploration,
                priority: 0.9,
                description: "Explore the world".to_string(),
            }
        ];
        char
    }

    fn create_test_interaction(interaction_type: InteractionType) -> Interaction {
        Interaction {
            id: "test_interaction".to_string(),
            name: "Test Interaction".to_string(),
            interaction_type,
            requirements: InteractionRequirements {
                min_attributes: None,
                required_skills: Vec::new(),
                node_types: Vec::new(),
                consciousness_state: None,
            },
            effects: InteractionEffects {
                success_effects: Vec::new(),
                failure_effects: Vec::new(),
                consciousness_impact: ConsciousnessImpact {
                    frequency_change: 0.0,
                    coherence_change: 0.0,
                    emotional_impact: 0.0,
                    significance: 0.0,
                },
            },
            base_weight: 1.0,
            goal_alignment: HashMap::new(),
        }
    }

    #[test]
    fn test_calculate_interaction_weight() {
        let calculator = InteractionWeightCalculator::new();
        let character = create_test_character();
        let interaction = create_test_interaction(InteractionType::Exploration);
        let context = InteractionContext::default();

        let weight = calculator.calculate_interaction_weight(&character, &interaction, &context);
        assert!(weight.is_ok());
        assert!(weight.unwrap() > 0.0);
    }

    #[test]
    fn test_goal_priority_bonus() {
        let calculator = InteractionWeightCalculator::new();
        let character = create_test_character();
        let interaction = create_test_interaction(InteractionType::Exploration);

        let bonus = calculator.calculate_goal_priority(&character, &interaction).unwrap();
        // Should have bonus because character has exploration goal
        assert!(bonus > 0.0);
    }

    #[test]
    fn test_personality_influence() {
        let calculator = InteractionWeightCalculator::new();
        let mut character = create_test_character();
        
        // Test exploration (high curiosity = bonus)
        let exploration = create_test_interaction(InteractionType::Exploration);
        let influence = calculator.calculate_personality_influence(&character, &exploration).unwrap();
        assert!(influence > 0.0);

        // Test combat (low aggression = penalty) - set aggression below 0.3 threshold
        character.personality.aggression = 0.2;
        let combat = create_test_interaction(InteractionType::Combat);
        let influence = calculator.calculate_personality_influence(&character, &combat).unwrap();
        assert!(influence < 0.0);
    }

    #[test]
    fn test_emotional_influence() {
        let calculator = InteractionWeightCalculator::new();
        let mut character = create_test_character();
        
        // Test anxious character avoiding combat
        character.consciousness.emotional_state = EmotionalState::Anxious;
        let combat = create_test_interaction(InteractionType::Combat);
        let multiplier = calculator.calculate_emotional_influence(&character, &combat).unwrap();
        assert!(multiplier < 1.0);

        // Test excited character preferring social
        character.consciousness.emotional_state = EmotionalState::Excited;
        let social = create_test_interaction(InteractionType::Social);
        let multiplier = calculator.calculate_emotional_influence(&character, &social).unwrap();
        assert!(multiplier > 1.0);
    }
}
