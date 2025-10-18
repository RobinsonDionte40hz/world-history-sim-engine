//! Character template processing

use crate::types::character::Character;
use crate::Result;

/// Service for processing character templates
pub struct CharacterTemplateService;

impl CharacterTemplateService {
    /// Instantiate a character from a template with custom parameters
    pub fn instantiate_from_template(
        template: &Character,
        custom_params: &std::collections::HashMap<String, serde_json::Value>,
    ) -> Result<Character> {
        let mut character = template.clone();

        // Apply custom parameters
        for (key, value) in custom_params {
            match key.as_str() {
                "id" => {
                    if let serde_json::Value::String(id) = value {
                        character.id = id.clone();
                    }
                }
                "personality.aggression" => {
                    if let serde_json::Value::Number(num) = value {
                        if let Some(val) = num.as_f64() {
                            character.personality.aggression = val.clamp(0.0, 1.0);
                        }
                    }
                }
                // Add more parameter mappings as needed
                _ => {} // Ignore unknown parameters
            }
        }

        Ok(character)
    }
}