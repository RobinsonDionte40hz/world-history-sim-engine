//! Character Template Processing Service
//!
//! Manages character templates with consciousness configuration support.
//! Provides predefined templates for common NPC archetypes and custom template creation.
//! Integrates consciousness parameters, behavioral states, and update rules.

use crate::{Result, ConsciousnessError};
use crate::types::character::{Character, Personality, Attributes};
use crate::types::consciousness::{BehavioralState, EnergyLevel, FocusLevel, MoodLevel};
use crate::consciousness_module::configuration::ConsciousnessChange;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Character template with consciousness configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterTemplate {
    pub name: String,
    pub description: String,
    pub consciousness_config: TemplateConsciousnessConfig,
    pub personality: Option<Personality>,
    pub attributes: Option<Attributes>,
    pub custom: bool,
    pub created_at: u64,
}

/// Template-specific consciousness configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateConsciousnessConfig {
    pub frequency: f64,
    pub coherence: f64,
    pub behavioral_state: TemplateBehavioralState,
    pub update_rules: HashMap<String, ConsciousnessChange>,
}

/// Template behavioral state values (0.0-1.0 range)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateBehavioralState {
    pub energy: f64,
    pub focus: f64,
    pub social_drive: f64,
    pub risk_tolerance: f64,
}

/// Template validation result
#[derive(Debug, Clone)]
pub struct TemplateValidation {
    pub is_valid: bool,
    pub errors: Vec<String>,
}

/// Template recommendation with score
#[derive(Debug, Clone)]
pub struct TemplateRecommendation {
    pub template_name: String,
    pub score: f64,
    pub reasons: Vec<String>,
    pub template: CharacterTemplate,
}

/// Character Template Service
pub struct CharacterTemplateService {
    predefined_templates: HashMap<String, CharacterTemplate>,
}

impl CharacterTemplateService {
    /// Create a new character template service with predefined templates
    pub fn new() -> Self {
        Self {
            predefined_templates: Self::initialize_predefined_templates(),
        }
    }

    /// Initialize predefined consciousness templates for common NPC archetypes
    fn initialize_predefined_templates() -> HashMap<String, CharacterTemplate> {
        let mut templates = HashMap::new();

        // Warrior archetype - high energy, moderate focus, high risk tolerance
        templates.insert("warrior".to_string(), CharacterTemplate {
            name: "Warrior".to_string(),
            description: "A battle-hardened fighter with high energy and risk tolerance".to_string(),
            consciousness_config: TemplateConsciousnessConfig {
                frequency: 12.0, // High beta - alert and focused
                coherence: 0.7,  // Good mental clarity
                behavioral_state: TemplateBehavioralState {
                    energy: 0.9,
                    focus: 0.8,
                    social_drive: 0.4,
                    risk_tolerance: 0.9,
                },
                update_rules: {
                    let mut rules = HashMap::new();
                    rules.insert("conflict".to_string(), ConsciousnessChange { frequency: 0.8, coherence: -0.05 });
                    rules.insert("social_success".to_string(), ConsciousnessChange { frequency: 0.1, coherence: 0.02 });
                    rules.insert("goal_completion".to_string(), ConsciousnessChange { frequency: 0.2, coherence: 0.03 });
                    rules
                },
            },
            personality: Some(Personality {
                aggression: 0.8,
                curiosity: 0.5,
                empathy: 0.4,
                ambition: 0.7,
                sociability: 0.5,
            }),
            attributes: Some(Attributes {
                strength: 16,
                dexterity: 14,
                constitution: 15,
                intelligence: 10,
                wisdom: 12,
                charisma: 11,
            }),
            custom: false,
            created_at: 0,
        });

        // Scholar archetype - high focus, low energy, moderate social drive
        templates.insert("scholar".to_string(), CharacterTemplate {
            name: "Scholar".to_string(),
            description: "An intellectual with exceptional focus and analytical mind".to_string(),
            consciousness_config: TemplateConsciousnessConfig {
                frequency: 10.0, // Alpha-beta mix - focused concentration
                coherence: 0.9,  // High mental clarity
                behavioral_state: TemplateBehavioralState {
                    energy: 0.5,
                    focus: 0.95,
                    social_drive: 0.6,
                    risk_tolerance: 0.3,
                },
                update_rules: {
                    let mut rules = HashMap::new();
                    rules.insert("discovery".to_string(), ConsciousnessChange { frequency: 0.3, coherence: 0.08 });
                    rules.insert("skill_improvement".to_string(), ConsciousnessChange { frequency: 0.2, coherence: 0.05 });
                    rules.insert("goal_failure".to_string(), ConsciousnessChange { frequency: -0.3, coherence: -0.06 });
                    rules
                },
            },
            personality: Some(Personality {
                aggression: 0.2,
                curiosity: 0.95,
                empathy: 0.6,
                ambition: 0.8,
                sociability: 0.4,
            }),
            attributes: Some(Attributes {
                strength: 8,
                dexterity: 10,
                constitution: 10,
                intelligence: 18,
                wisdom: 16,
                charisma: 11,
            }),
            custom: false,
            created_at: 0,
        });

        // Merchant archetype - moderate focus, high social drive, moderate risk tolerance
        templates.insert("merchant".to_string(), CharacterTemplate {
            name: "Merchant".to_string(),
            description: "A shrewd trader with strong social skills and business acumen".to_string(),
            consciousness_config: TemplateConsciousnessConfig {
                frequency: 8.5, // Alpha range - relaxed but alert
                coherence: 0.75, // Good mental stability
                behavioral_state: TemplateBehavioralState {
                    energy: 0.7,
                    focus: 0.7,
                    social_drive: 0.9,
                    risk_tolerance: 0.6,
                },
                update_rules: {
                    let mut rules = HashMap::new();
                    rules.insert("economic_gain".to_string(), ConsciousnessChange { frequency: 0.3, coherence: 0.04 });
                    rules.insert("economic_loss".to_string(), ConsciousnessChange { frequency: -0.4, coherence: -0.08 });
                    rules.insert("social_success".to_string(), ConsciousnessChange { frequency: 0.2, coherence: 0.03 });
                    rules
                },
            },
            personality: Some(Personality {
                aggression: 0.4,
                curiosity: 0.7,
                empathy: 0.6,
                ambition: 0.85,
                sociability: 0.9,
            }),
            attributes: Some(Attributes {
                strength: 10,
                dexterity: 12,
                constitution: 11,
                intelligence: 14,
                wisdom: 13,
                charisma: 16,
            }),
            custom: false,
            created_at: 0,
        });

        // Mystic archetype - variable frequency, high coherence, low social drive
        templates.insert("mystic".to_string(), CharacterTemplate {
            name: "Mystic".to_string(),
            description: "A spiritual seeker with deep insight and contemplative nature".to_string(),
            consciousness_config: TemplateConsciousnessConfig {
                frequency: 6.0, // Theta-alpha border - meditative state
                coherence: 0.95, // Exceptional mental clarity
                behavioral_state: TemplateBehavioralState {
                    energy: 0.4,
                    focus: 0.85,
                    social_drive: 0.2,
                    risk_tolerance: 0.4,
                },
                update_rules: {
                    let mut rules = HashMap::new();
                    rules.insert("discovery".to_string(), ConsciousnessChange { frequency: 0.4, coherence: 0.1 });
                    rules.insert("traumatic_encounter".to_string(), ConsciousnessChange { frequency: -0.6, coherence: -0.05 });
                    rules.insert("goal_progress".to_string(), ConsciousnessChange { frequency: 0.1, coherence: 0.04 });
                    rules
                },
            },
            personality: Some(Personality {
                aggression: 0.1,
                curiosity: 0.8,
                empathy: 0.9,
                ambition: 0.5,
                sociability: 0.3,
            }),
            attributes: Some(Attributes {
                strength: 8,
                dexterity: 10,
                constitution: 12,
                intelligence: 15,
                wisdom: 18,
                charisma: 13,
            }),
            custom: false,
            created_at: 0,
        });

        // Noble archetype - high social drive, moderate focus, low risk tolerance
        templates.insert("noble".to_string(), CharacterTemplate {
            name: "Noble".to_string(),
            description: "An aristocratic figure with refined social skills and conservative nature".to_string(),
            consciousness_config: TemplateConsciousnessConfig {
                frequency: 9.0, // Alpha range - composed and social
                coherence: 0.8,  // Good mental stability
                behavioral_state: TemplateBehavioralState {
                    energy: 0.6,
                    focus: 0.75,
                    social_drive: 0.95,
                    risk_tolerance: 0.2,
                },
                update_rules: {
                    let mut rules = HashMap::new();
                    rules.insert("social_success".to_string(), ConsciousnessChange { frequency: 0.2, coherence: 0.03 });
                    rules.insert("betrayal".to_string(), ConsciousnessChange { frequency: -0.9, coherence: -0.15 });
                    rules.insert("relationship_change".to_string(), ConsciousnessChange { frequency: 0.5, coherence: 0.07 });
                    rules
                },
            },
            personality: Some(Personality {
                aggression: 0.3,
                curiosity: 0.5,
                empathy: 0.6,
                ambition: 0.8,
                sociability: 0.95,
            }),
            attributes: Some(Attributes {
                strength: 10,
                dexterity: 11,
                constitution: 12,
                intelligence: 14,
                wisdom: 13,
                charisma: 17,
            }),
            custom: false,
            created_at: 0,
        });

        // Rogue archetype - high risk tolerance, moderate focus, variable social drive
        templates.insert("rogue".to_string(), CharacterTemplate {
            name: "Rogue".to_string(),
            description: "A cunning opportunist with high adaptability and risk tolerance".to_string(),
            consciousness_config: TemplateConsciousnessConfig {
                frequency: 11.0, // High beta - quick thinking
                coherence: 0.6,  // Moderate mental stability
                behavioral_state: TemplateBehavioralState {
                    energy: 0.8,
                    focus: 0.65,
                    social_drive: 0.5,
                    risk_tolerance: 0.95,
                },
                update_rules: {
                    let mut rules = HashMap::new();
                    rules.insert("economic_gain".to_string(), ConsciousnessChange { frequency: 0.4, coherence: 0.02 });
                    rules.insert("conflict".to_string(), ConsciousnessChange { frequency: 0.6, coherence: -0.08 });
                    rules.insert("betrayal".to_string(), ConsciousnessChange { frequency: -0.5, coherence: -0.12 });
                    rules
                },
            },
            personality: Some(Personality {
                aggression: 0.6,
                curiosity: 0.75,
                empathy: 0.4,
                ambition: 0.85,
                sociability: 0.6,
            }),
            attributes: Some(Attributes {
                strength: 12,
                dexterity: 17,
                constitution: 13,
                intelligence: 14,
                wisdom: 11,
                charisma: 14,
            }),
            custom: false,
            created_at: 0,
        });

        // Peasant archetype - moderate everything, resilient consciousness
        templates.insert("peasant".to_string(), CharacterTemplate {
            name: "Peasant".to_string(),
            description: "A hardworking commoner with practical wisdom and steady nature".to_string(),
            consciousness_config: TemplateConsciousnessConfig {
                frequency: 7.5, // Alpha baseline - balanced awareness
                coherence: 0.65, // Moderate mental stability
                behavioral_state: TemplateBehavioralState {
                    energy: 0.75,
                    focus: 0.6,
                    social_drive: 0.7,
                    risk_tolerance: 0.5,
                },
                update_rules: {
                    let mut rules = HashMap::new();
                    rules.insert("economic_gain".to_string(), ConsciousnessChange { frequency: 0.2, coherence: 0.03 });
                    rules.insert("economic_loss".to_string(), ConsciousnessChange { frequency: -0.3, coherence: -0.05 });
                    rules.insert("goal_completion".to_string(), ConsciousnessChange { frequency: 0.15, coherence: 0.02 });
                    rules
                },
            },
            personality: Some(Personality {
                aggression: 0.4,
                curiosity: 0.5,
                empathy: 0.7,
                ambition: 0.5,
                sociability: 0.7,
            }),
            attributes: Some(Attributes {
                strength: 13,
                dexterity: 11,
                constitution: 14,
                intelligence: 10,
                wisdom: 12,
                charisma: 10,
            }),
            custom: false,
            created_at: 0,
        });

        templates
    }

    /// Get a predefined template by name
    pub fn get_predefined_template(&self, template_name: &str) -> Option<CharacterTemplate> {
        self.predefined_templates.get(&template_name.to_lowercase()).cloned()
    }

    /// Get all predefined template names
    pub fn get_predefined_template_names(&self) -> Vec<String> {
        self.predefined_templates.keys().cloned().collect()
    }

    /// Get all predefined templates
    pub fn get_all_predefined_templates(&self) -> HashMap<String, CharacterTemplate> {
        self.predefined_templates.clone()
    }

    /// Create a custom consciousness template
    pub fn create_custom_template(
        &self,
        name: String,
        description: Option<String>,
        consciousness_config: TemplateConsciousnessConfig,
        personality: Option<Personality>,
        attributes: Option<Attributes>,
    ) -> Result<CharacterTemplate> {
        // Validate consciousness configuration
        let validation = self.validate_consciousness_template(&consciousness_config)?;
        if !validation.is_valid {
            return Err(ConsciousnessError::ValidationError {
                field: "consciousness_config".to_string(),
                message: validation.errors.join(", "),
            });
        }

        Ok(CharacterTemplate {
            name: name.clone(),
            description: description.unwrap_or_else(|| format!("Custom template: {}", name)),
            consciousness_config,
            personality,
            attributes,
            custom: true,
            created_at: Self::current_timestamp(),
        })
    }

    /// Validate consciousness template configuration
    pub fn validate_consciousness_template(&self, config: &TemplateConsciousnessConfig) -> Result<TemplateValidation> {
        let mut errors = Vec::new();

        // Validate frequency bounds (3-15 Hz)
        if !(3.0..=15.0).contains(&config.frequency) {
            errors.push("Frequency must be between 3.0 and 15.0 Hz".to_string());
        }

        // Validate coherence bounds (0.2-1.0)
        if !(0.2..=1.0).contains(&config.coherence) {
            errors.push("Coherence must be between 0.2 and 1.0".to_string());
        }

        // Validate behavioral state
        let behavioral_errors = self.validate_behavioral_state(&config.behavioral_state);
        errors.extend(behavioral_errors);

        Ok(TemplateValidation {
            is_valid: errors.is_empty(),
            errors,
        })
    }

    /// Validate behavioral state configuration
    fn validate_behavioral_state(&self, state: &TemplateBehavioralState) -> Vec<String> {
        let mut errors = Vec::new();

        if !(0.0..=1.0).contains(&state.energy) {
            errors.push("Energy must be between 0 and 1".to_string());
        }
        if !(0.0..=1.0).contains(&state.focus) {
            errors.push("Focus must be between 0 and 1".to_string());
        }
        if !(0.0..=1.0).contains(&state.social_drive) {
            errors.push("Social drive must be between 0 and 1".to_string());
        }
        if !(0.0..=1.0).contains(&state.risk_tolerance) {
            errors.push("Risk tolerance must be between 0 and 1".to_string());
        }

        errors
    }

    /// Apply consciousness template to character
    pub fn apply_template_to_character(
        &self,
        mut character: Character,
        template: &CharacterTemplate,
        custom_frequency: Option<f64>,
        custom_coherence: Option<f64>,
    ) -> Result<Character> {
        // Apply consciousness parameters
        character.consciousness.base_frequency = custom_frequency.unwrap_or(template.consciousness_config.frequency);
        character.consciousness.current_frequency = character.consciousness.base_frequency;
        character.consciousness.base_coherence = custom_coherence.unwrap_or(template.consciousness_config.coherence);
        character.consciousness.emotional_coherence = character.consciousness.base_coherence;

        // Apply personality if provided in template
        if let Some(template_personality) = &template.personality {
            character.personality = *template_personality;
        }

        // Apply attributes if provided in template
        if let Some(template_attributes) = &template.attributes {
            character.attributes = *template_attributes;
        }

        // Create behavioral state from template
        let behavioral_state = self.create_behavioral_state_from_template(&template.consciousness_config.behavioral_state);
        character.behavioral_state = Some(behavioral_state);

        Ok(character)
    }

    /// Create behavioral state from template values
    fn create_behavioral_state_from_template(&self, template_state: &TemplateBehavioralState) -> BehavioralState {
        BehavioralState {
            energy: self.energy_from_value(template_state.energy),
            focus: self.focus_from_value(template_state.focus),
            mood: self.mood_from_value(template_state.energy), // Use energy as mood proxy
            social_drive: template_state.social_drive,
            risk_tolerance: template_state.risk_tolerance,
            ambition: (template_state.energy + template_state.focus) / 2.0, // Calculated
            cached_timestamp: Self::current_timestamp(),
        }
    }

    /// Convert template energy value to EnergyLevel enum
    fn energy_from_value(&self, value: f64) -> EnergyLevel {
        match value {
            v if v < 0.2 => EnergyLevel::VeryLow,
            v if v < 0.4 => EnergyLevel::Low,
            v if v < 0.7 => EnergyLevel::Moderate,
            v if v < 0.9 => EnergyLevel::High,
            _ => EnergyLevel::VeryHigh,
        }
    }

    /// Convert template focus value to FocusLevel enum
    fn focus_from_value(&self, value: f64) -> FocusLevel {
        match value {
            v if v < 0.4 => FocusLevel::Scattered,
            v if v < 0.7 => FocusLevel::Balanced,
            _ => FocusLevel::Focused,
        }
    }

    /// Convert template energy to MoodLevel enum
    fn mood_from_value(&self, value: f64) -> MoodLevel {
        match value {
            v if v < 0.3 => MoodLevel::Depressed,
            v if v < 0.7 => MoodLevel::Content,
            v if v < 0.9 => MoodLevel::Optimistic,
            _ => MoodLevel::Excited,
        }
    }

    /// Create template from existing character
    pub fn create_template_from_character(
        &self,
        character: &Character,
        template_name: String,
        description: Option<String>,
    ) -> Result<CharacterTemplate> {
        let behavioral_state = character.behavioral_state.as_ref()
            .ok_or_else(|| ConsciousnessError::ValidationError {
                field: "behavioral_state".to_string(),
                message: "Character must have behavioral state".to_string(),
            })?;

        let template_config = TemplateConsciousnessConfig {
            frequency: character.consciousness.base_frequency,
            coherence: character.consciousness.base_coherence,
            behavioral_state: TemplateBehavioralState {
                energy: self.value_from_energy(&behavioral_state.energy),
                focus: self.value_from_focus(&behavioral_state.focus),
                social_drive: behavioral_state.social_drive,
                risk_tolerance: behavioral_state.risk_tolerance,
            },
            update_rules: HashMap::new(), // Extract from character if available
        };

        Ok(CharacterTemplate {
            name: template_name,
            description: description.unwrap_or_else(|| "Template from character".to_string()),
            consciousness_config: template_config,
            personality: Some(character.personality),
            attributes: Some(character.attributes),
            custom: true,
            created_at: Self::current_timestamp(),
        })
    }

    /// Convert EnergyLevel enum to template value
    fn value_from_energy(&self, energy: &EnergyLevel) -> f64 {
        match energy {
            EnergyLevel::VeryLow => 0.1,
            EnergyLevel::Low => 0.3,
            EnergyLevel::Moderate => 0.5,
            EnergyLevel::High => 0.8,
            EnergyLevel::VeryHigh => 0.95,
        }
    }

    /// Convert FocusLevel enum to template value
    fn value_from_focus(&self, focus: &FocusLevel) -> f64 {
        match focus {
            FocusLevel::Scattered => 0.3,
            FocusLevel::Balanced => 0.6,
            FocusLevel::Focused => 0.9,
        }
    }

    /// Get template recommendations based on character attributes
    pub fn get_template_recommendations(
        &self,
        personality: Option<&Personality>,
        profession: Option<&str>,
    ) -> Vec<TemplateRecommendation> {
        let mut recommendations = Vec::new();

        for (template_name, template) in &self.predefined_templates {
            let mut score = 0.0;
            let mut reasons = Vec::new();

            // Match based on personality if available
            if let Some(char_personality) = personality {
                if let Some(template_personality) = &template.personality {
                    let (personality_score, personality_reasons) = self.calculate_personality_match(char_personality, template_personality);
                    score += personality_score;
                    reasons.extend(personality_reasons);
                }
            }

            // Match based on profession if available
            if let Some(prof) = profession {
                let (profession_score, profession_reasons) = self.calculate_profession_match(prof, template_name);
                score += profession_score;
                reasons.extend(profession_reasons);
            }

            if score > 0.0 {
                recommendations.push(TemplateRecommendation {
                    template_name: template_name.clone(),
                    score,
                    reasons,
                    template: template.clone(),
                });
            }
        }

        // Sort by score descending
        recommendations.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());

        // Return top 3
        recommendations.truncate(3);
        recommendations
    }

    /// Calculate personality match score
    fn calculate_personality_match(&self, char_personality: &Personality, template_personality: &Personality) -> (f64, Vec<String>) {
        let mut score = 0.0;
        let mut reasons = Vec::new();

        // Compare each trait
        let aggression_match = 1.0 - (char_personality.aggression - template_personality.aggression).abs();
        let curiosity_match = 1.0 - (char_personality.curiosity - template_personality.curiosity).abs();
        let empathy_match = 1.0 - (char_personality.empathy - template_personality.empathy).abs();
        let ambition_match = 1.0 - (char_personality.ambition - template_personality.ambition).abs();
        let sociability_match = 1.0 - (char_personality.sociability - template_personality.sociability).abs();

        score += (aggression_match + curiosity_match + empathy_match + ambition_match + sociability_match) * 4.0;

        if aggression_match > 0.8 {
            reasons.push(format!("Strong aggression match ({}%)", (aggression_match * 100.0) as u32));
        }
        if curiosity_match > 0.8 {
            reasons.push(format!("Strong curiosity match ({}%)", (curiosity_match * 100.0) as u32));
        }
        if sociability_match > 0.8 {
            reasons.push(format!("Strong sociability match ({}%)", (sociability_match * 100.0) as u32));
        }

        (score, reasons)
    }

    /// Calculate profession match score
    fn calculate_profession_match(&self, profession: &str, template_name: &str) -> (f64, Vec<String>) {
        let profession_lower = profession.to_lowercase();
        let matching_keywords = match template_name {
            "warrior" => vec!["warrior", "fighter", "soldier", "guard"],
            "scholar" => vec!["scholar", "teacher", "researcher", "mage"],
            "merchant" => vec!["merchant", "trader", "shopkeeper", "banker"],
            "mystic" => vec!["priest", "druid", "monk", "oracle"],
            "noble" => vec!["noble", "lord", "lady", "knight"],
            "rogue" => vec!["thief", "assassin", "spy", "bandit"],
            "peasant" => vec!["farmer", "craftsman", "laborer", "servant"],
            _ => vec![],
        };

        for keyword in matching_keywords {
            if profession_lower.contains(keyword) || keyword.contains(&profession_lower) {
                return (20.0, vec![format!("Profession '{}' matches {} archetype", profession, template_name)]);
            }
        }

        (0.0, vec![])
    }

    /// Export template to JSON
    pub fn export_template(&self, template: &CharacterTemplate) -> Result<String> {
        serde_json::to_string_pretty(template)
            .map_err(|e| ConsciousnessError::SerializationError {
                message: format!("Failed to export template: {}", e),
            })
    }

    /// Import template from JSON
    pub fn import_template(&self, json: &str) -> Result<CharacterTemplate> {
        let template: CharacterTemplate = serde_json::from_str(json)
            .map_err(|e| ConsciousnessError::SerializationError {
                message: format!("Failed to import template: {}", e),
            })?;

        // Validate imported template
        let validation = self.validate_consciousness_template(&template.consciousness_config)?;
        if !validation.is_valid {
            return Err(ConsciousnessError::ValidationError {
                field: "template".to_string(),
                message: validation.errors.join(", "),
            });
        }

        Ok(template)
    }

    /// Get current timestamp (milliseconds since epoch)
    fn current_timestamp() -> u64 {
        // In a real implementation, use proper timestamp
        // For now, return 0 as placeholder
        0
    }
}

impl Default for CharacterTemplateService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_predefined_template() {
        let service = CharacterTemplateService::new();
        
        let warrior = service.get_predefined_template("warrior");
        assert!(warrior.is_some());
        
        let template = warrior.unwrap();
        assert_eq!(template.name, "Warrior");
        assert_eq!(template.consciousness_config.frequency, 12.0);
        assert_eq!(template.consciousness_config.coherence, 0.7);
    }

    #[test]
    fn test_get_all_template_names() {
        let service = CharacterTemplateService::new();
        let names = service.get_predefined_template_names();
        
        assert_eq!(names.len(), 7);
        assert!(names.contains(&"warrior".to_string()));
        assert!(names.contains(&"scholar".to_string()));
        assert!(names.contains(&"merchant".to_string()));
    }

    #[test]
    fn test_validate_consciousness_template() {
        let service = CharacterTemplateService::new();
        
        let valid_config = TemplateConsciousnessConfig {
            frequency: 10.0,
            coherence: 0.8,
            behavioral_state: TemplateBehavioralState {
                energy: 0.7,
                focus: 0.8,
                social_drive: 0.6,
                risk_tolerance: 0.5,
            },
            update_rules: HashMap::new(),
        };
        
        let validation = service.validate_consciousness_template(&valid_config).unwrap();
        assert!(validation.is_valid);
        assert!(validation.errors.is_empty());
    }

    #[test]
    fn test_validate_invalid_frequency() {
        let service = CharacterTemplateService::new();
        
        let invalid_config = TemplateConsciousnessConfig {
            frequency: 20.0, // Out of bounds
            coherence: 0.8,
            behavioral_state: TemplateBehavioralState {
                energy: 0.7,
                focus: 0.8,
                social_drive: 0.6,
                risk_tolerance: 0.5,
            },
            update_rules: HashMap::new(),
        };
        
        let validation = service.validate_consciousness_template(&invalid_config).unwrap();
        assert!(!validation.is_valid);
        assert!(!validation.errors.is_empty());
    }

    #[test]
    fn test_create_custom_template() {
        let service = CharacterTemplateService::new();
        
        let config = TemplateConsciousnessConfig {
            frequency: 9.0,
            coherence: 0.75,
            behavioral_state: TemplateBehavioralState {
                energy: 0.6,
                focus: 0.7,
                social_drive: 0.8,
                risk_tolerance: 0.4,
            },
            update_rules: HashMap::new(),
        };
        
        let template = service.create_custom_template(
            "Custom Warrior".to_string(),
            Some("My custom template".to_string()),
            config,
            None,
            None,
        );
        
        assert!(template.is_ok());
        let template = template.unwrap();
        assert_eq!(template.name, "Custom Warrior");
        assert!(template.custom);
    }

    #[test]
    fn test_apply_template_to_character() {
        let service = CharacterTemplateService::new();
        let template = service.get_predefined_template("warrior").unwrap();
        let character = Character::default();
        
        let result = service.apply_template_to_character(character, &template, None, None);
        assert!(result.is_ok());
        
        let updated_character = result.unwrap();
        assert_eq!(updated_character.consciousness.base_frequency, 12.0);
        assert_eq!(updated_character.consciousness.base_coherence, 0.7);
        assert!(updated_character.behavioral_state.is_some());
    }

    #[test]
    fn test_export_import_template() {
        let service = CharacterTemplateService::new();
        let template = service.get_predefined_template("scholar").unwrap();
        
        // Export
        let json = service.export_template(&template);
        assert!(json.is_ok());
        
        // Import
        let imported = service.import_template(&json.unwrap());
        assert!(imported.is_ok());
        
        let imported_template = imported.unwrap();
        assert_eq!(imported_template.name, template.name);
        assert_eq!(imported_template.consciousness_config.frequency, template.consciousness_config.frequency);
    }

    #[test]
    fn test_template_recommendations() {
        let service = CharacterTemplateService::new();
        
        let personality = Personality {
            aggression: 0.8,
            curiosity: 0.5,
            empathy: 0.4,
            ambition: 0.7,
            sociability: 0.5,
        };
        
        let recommendations = service.get_template_recommendations(Some(&personality), Some("fighter"));
        
        assert!(!recommendations.is_empty());
        // Warrior should be recommended for fighter profession with high aggression
        assert_eq!(recommendations[0].template_name, "warrior");
    }

    #[test]
    fn test_create_template_from_character() {
        let service = CharacterTemplateService::new();
        let mut character = Character::default();
        character.behavioral_state = Some(BehavioralState::default());
        
        let result = service.create_template_from_character(
            &character,
            "Test Template".to_string(),
            Some("From character".to_string()),
        );
        
        assert!(result.is_ok());
        let template = result.unwrap();
        assert_eq!(template.name, "Test Template");
        assert!(template.custom);
    }
}
