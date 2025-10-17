//! WASM function exports

use wasm_bindgen::prelude::*;
use crate::{Character, Interaction, InteractionContext};

/// Calculate interaction weight for WASM
#[wasm_bindgen]
pub fn calculate_interaction_weight(
    character: &JsValue,
    interaction: &JsValue,
    context: &JsValue
) -> Result<f64, JsValue> {
    let _character: Character = serde_wasm_bindgen::from_value(character.clone())
        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;

    let _interaction: Interaction = serde_wasm_bindgen::from_value(interaction.clone())
        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;

    let _context: InteractionContext = serde_wasm_bindgen::from_value(context.clone())
        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;

    // For now, return a simple calculation
    // TODO: Implement proper InteractionWeightCalculator
    Ok(0.5)
}

/// Generate behavior for a character
#[wasm_bindgen]
pub fn generate_behavior(
    character: &JsValue,
    available_interactions: &JsValue,
    context: &JsValue
) -> Result<JsValue, JsValue> {
    let _character: Character = serde_wasm_bindgen::from_value(character.clone())
        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;

    let _interactions: Vec<Interaction> = serde_wasm_bindgen::from_value(available_interactions.clone())
        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;

    let _context: InteractionContext = serde_wasm_bindgen::from_value(context.clone())
        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;

    // For now, return a simple result
    // TODO: Implement proper BehaviorGenerationService
    let result = serde_json::json!({
        "selected_interaction": "exploration",
        "weight": 0.8
    });

    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// Check if running in WASM environment
#[wasm_bindgen]
pub fn is_wasm_supported() -> bool {
    cfg!(target_arch = "wasm32")
}

/// Get fallback message for non-WASM environments
#[wasm_bindgen]
pub fn get_fallback_message() -> String {
    "WASM not supported. Please use JavaScript implementation.".to_string()
}