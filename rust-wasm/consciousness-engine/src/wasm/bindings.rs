//! WASM function exports
//!
//! This module provides the JavaScript interface to the Rust consciousness engine.
//! All functions are exported via wasm-bindgen and use JsValue for JavaScript interop.
//!
//! # Design Principles
//! - **Error Handling**: All functions return Result<T, JsValue> for proper error propagation
//! - **Serialization**: Use serde-wasm-bindgen for automatic type conversion
//! - **Performance**: Minimize allocations and clones where possible
//! - **Compatibility**: Maintain API parity with JavaScript implementation

use wasm_bindgen::prelude::*;
use crate::{Character, Interaction};
use crate::types::InteractionContext;
use crate::decision::interaction_weight::InteractionWeightCalculator;

/// Calculate interaction weight for a character
/// 
/// # JavaScript Example
/// ```javascript
/// const weight = calculateInteractionWeight(character, interaction, context);
/// console.log(`Interaction weight: ${weight}`);
/// ```
#[wasm_bindgen]
pub fn calculate_interaction_weight(
    character: &JsValue,
    interaction: &JsValue,
    context: &JsValue
) -> Result<f64, JsValue> {
    // Deserialize inputs
    let character: Character = serde_wasm_bindgen::from_value(character.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize character: {}", e)))?;

    let interaction: Interaction = serde_wasm_bindgen::from_value(interaction.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize interaction: {}", e)))?;

    let context: InteractionContext = serde_wasm_bindgen::from_value(context.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize context: {}", e)))?;

    // Calculate weight using Rust service
    let calculator = InteractionWeightCalculator::new();
    let weight = calculator.calculate_interaction_weight(&character, &interaction, &context)
        .map_err(|e| JsValue::from_str(&format!("Failed to calculate weight: {}", e)))?;

    Ok(weight)
}

/// Generate behavior for a character
/// 
/// Selects the best interaction for a character based on their consciousness state,
/// goals, personality, and available interactions.
/// 
/// # JavaScript Example
/// ```javascript
/// const result = generateBehavior(character, interactions, context);
/// console.log(`Selected: ${result.interaction_id}, Weight: ${result.weight}`);
/// ```
#[wasm_bindgen]
pub fn generate_behavior(
    character: &JsValue,
    available_interactions: &JsValue,
    context: &JsValue
) -> Result<JsValue, JsValue> {
    // Deserialize inputs
    let character: Character = serde_wasm_bindgen::from_value(character.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize character: {}", e)))?;

    let interactions: Vec<Interaction> = serde_wasm_bindgen::from_value(available_interactions.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize interactions: {}", e)))?;

    let context: InteractionContext = serde_wasm_bindgen::from_value(context.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize context: {}", e)))?;

    // Calculate weights for all interactions
    let calculator = InteractionWeightCalculator::new();
    let mut weighted_interactions: Vec<(String, f64)> = Vec::new();

    for interaction in interactions.iter() {
        match calculator.calculate_interaction_weight(&character, interaction, &context) {
            Ok(weight) => {
                weighted_interactions.push((interaction.id.clone(), weight));
            }
            Err(e) => {
                return Err(JsValue::from_str(&format!("Weight calculation failed: {}", e)));
            }
        }
    }

    // Sort by weight descending
    weighted_interactions.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

    // Return top choice
    let result = if let Some((id, weight)) = weighted_interactions.first() {
        serde_json::json!({
            "interaction_id": id,
            "weight": weight,
            "alternatives": weighted_interactions.iter().skip(1).take(3).collect::<Vec<_>>()
        })
    } else {
        serde_json::json!({
            "interaction_id": null,
            "weight": 0.0,
            "alternatives": []
        })
    };

    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
}

// ============================================================================
// Consciousness System Exports
// ============================================================================

/// Calculate behavioral state from consciousness parameters
/// 
/// # JavaScript Example
/// ```javascript
/// const behavioralState = calculateBehavioralState(consciousnessState);
/// console.log(`Energy: ${behavioralState.energy}, Focus: ${behavioralState.focus}`);
/// ```
#[wasm_bindgen]
pub fn calculate_behavioral_state(
    consciousness_state: &JsValue
) -> Result<JsValue, JsValue> {
    use crate::consciousness_module::behavioral_state::generate_behavioral_state;
    use crate::types::consciousness::ConsciousnessState;

    let state: ConsciousnessState = serde_wasm_bindgen::from_value(consciousness_state.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize consciousness state: {}", e)))?;

    let behavioral_state = generate_behavioral_state(state.current_frequency, state.emotional_coherence);

    serde_wasm_bindgen::to_value(&behavioral_state)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize behavioral state: {}", e)))
}

/// Update consciousness state based on an event
/// 
/// # JavaScript Example
/// ```javascript
/// const updatedState = updateConsciousnessState(currentState, event, config);
/// console.log(`New frequency: ${updatedState.current_frequency}`);
/// ```
/// 
/// # Note
/// This is a simplified version - full event processing will be implemented in future updates
#[wasm_bindgen]
pub fn update_consciousness_state(
    current_state: &JsValue,
    _event: &JsValue,
    _config: &JsValue
) -> Result<JsValue, JsValue> {
    use crate::types::consciousness::ConsciousnessState;

    let state: ConsciousnessState = serde_wasm_bindgen::from_value(current_state.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize state: {}", e)))?;

    // TODO: Implement full event processing using EnhancedConsciousnessUpdater
    // For now, return the state as-is
    // This will be completed in a future update once event type mapping is resolved

    serde_wasm_bindgen::to_value(&state)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize updated state: {}", e)))
}

// ============================================================================
// Memory Management Exports
// ============================================================================

/// Calculate memory influence on interaction decisions
/// 
/// # JavaScript Example
/// ```javascript
/// const influence = calculateMemoryInfluence(memories, interactionType);
/// console.log(`Memory influence multiplier: ${influence}`);
/// ```
#[wasm_bindgen]
pub fn calculate_memory_influence(
    memories: &JsValue,
    interaction_type: &str
) -> Result<f64, JsValue> {
    use crate::memory_module::significant_memory::SignificantMemoryService;
    use crate::{Memory, InteractionType};

    let memories: Vec<Memory> = serde_wasm_bindgen::from_value(memories.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize memories: {}", e)))?;

    let int_type: InteractionType = serde_json::from_str(&format!("\"{}\"", interaction_type))
        .map_err(|e| JsValue::from_str(&format!("Invalid interaction type: {}", e)))?;

    let influence = SignificantMemoryService::calculate_memory_influence(&memories, &int_type)
        .map_err(|e| JsValue::from_str(&format!("Failed to calculate influence: {}", e)))?;

    Ok(influence)
}

/// Calculate event significance
/// 
/// # JavaScript Example
/// ```javascript
/// const significance = calculateEventSignificance(event, context);
/// if (significance >= 0.3) {
///   console.log('Significant event detected!');
/// }
/// ```
#[wasm_bindgen]
pub fn calculate_event_significance(
    event: &JsValue,
    context: &JsValue
) -> Result<f64, JsValue> {
    use crate::memory_module::event_significance::EventSignificanceCalculator;
    use crate::{InteractionEvent, MemoryContext};

    let event: InteractionEvent = serde_wasm_bindgen::from_value(event.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize event: {}", e)))?;

    let context: MemoryContext = serde_wasm_bindgen::from_value(context.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize context: {}", e)))?;

    let significance = EventSignificanceCalculator::calculate_significance(&event, &context)
        .map_err(|e| JsValue::from_str(&format!("Failed to calculate significance: {}", e)))?;

    Ok(significance)
}

// ============================================================================
// Migration & Inspection Exports
// ============================================================================

/// Migrate consciousness data from older versions
/// 
/// # JavaScript Example
/// ```javascript
/// const migratedData = migrateConsciousnessData(oldData, true);
/// console.log(`Migrated to version: ${migratedData.version}`);
/// ```
#[wasm_bindgen]
pub fn migrate_consciousness_data(
    data: &JsValue,
    repair_corrupted: bool
) -> Result<JsValue, JsValue> {
    use crate::migration::ConsciousnessMigrationService;

    let data_value: serde_json::Value = serde_wasm_bindgen::from_value(data.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse data: {}", e)))?;

    let service = ConsciousnessMigrationService::new();
    let migration_result = service.migrate_consciousness_data(data_value, repair_corrupted);

    if migration_result.success {
        serde_wasm_bindgen::to_value(&migration_result.data)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
    } else {
        let error_msg = migration_result.error.unwrap_or_else(|| "Unknown migration error".to_string());
        Err(JsValue::from_str(&format!("Migration failed: {}", error_msg)))
    }
}

/// Inspect behavioral state for debugging
/// 
/// # JavaScript Example
/// ```javascript
/// const inspection = inspectBehavioralState(character);
/// console.log(inspection.behavioral_analysis);
/// ```
#[wasm_bindgen]
pub fn inspect_behavioral_state(
    character: &JsValue
) -> Result<JsValue, JsValue> {
    use crate::inspection::ConsciousnessInspectionService;

    let character: Character = serde_wasm_bindgen::from_value(character.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize character: {}", e)))?;

    let service = ConsciousnessInspectionService::new();
    let inspection = service.inspect_behavioral_state(&character)
        .map_err(|e| JsValue::from_str(&format!("Inspection failed: {}", e)))?;

    serde_wasm_bindgen::to_value(&inspection)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize inspection: {}", e)))
}

// ============================================================================
// Template Processing Exports
// ============================================================================

/// Validate character template structure
/// 
/// # JavaScript Example
/// ```javascript
/// const result = validateTemplate(template);
/// if (result.is_valid) {
///   console.log('Template is valid!');
/// }
/// ```
/// 
/// # Note
/// Full template processing will be implemented in future updates
#[wasm_bindgen]
pub fn validate_template(
    template: &JsValue
) -> Result<JsValue, JsValue> {
    use crate::decision::template_processing::CharacterTemplate;

    let template: CharacterTemplate = serde_wasm_bindgen::from_value(template.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize template: {}", e)))?;

    // Basic validation
    let is_valid = template.consciousness_config.frequency >= 3.0 
        && template.consciousness_config.frequency <= 100.0
        && template.consciousness_config.coherence >= 0.0
        && template.consciousness_config.coherence <= 1.0;

    let result = serde_json::json!({
        "is_valid": is_valid,
        "message": if is_valid {
            "Template is valid".to_string()
        } else {
            "Template has invalid consciousness parameters".to_string()
        }
    });

    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
}

// ============================================================================
// Batch Processing Exports
// ============================================================================

/// Process multiple characters in batch for performance
/// 
/// # JavaScript Example
/// ```javascript
/// const results = await processBatchBehaviors(characters, interactions, context);
/// console.log(`Processed ${results.length} characters`);
/// ```
#[wasm_bindgen]
pub fn process_batch_behaviors(
    characters: &JsValue,
    available_interactions: &JsValue,
    context: &JsValue
) -> Result<JsValue, JsValue> {
    let characters: Vec<Character> = serde_wasm_bindgen::from_value(characters.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize characters: {}", e)))?;

    let interactions: Vec<Interaction> = serde_wasm_bindgen::from_value(available_interactions.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize interactions: {}", e)))?;

    let context: InteractionContext = serde_wasm_bindgen::from_value(context.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize context: {}", e)))?;

    // Process each character
    let calculator = InteractionWeightCalculator::new();
    let mut results = Vec::new();

    for character in characters.iter() {
        let mut weighted_interactions: Vec<(String, f64)> = Vec::new();

        for interaction in interactions.iter() {
            match calculator.calculate_interaction_weight(character, interaction, &context) {
                Ok(weight) => {
                    weighted_interactions.push((interaction.id.clone(), weight));
                }
                Err(e) => {
                    return Err(JsValue::from_str(&format!("Weight calculation failed for character {}: {}", character.id, e)));
                }
            }
        }

        // Sort by weight descending
        weighted_interactions.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        let result = if let Some((id, weight)) = weighted_interactions.first() {
            serde_json::json!({
                "character_id": character.id,
                "selected_interaction": id,
                "weight": weight,
                "alternatives": weighted_interactions.iter().skip(1).take(3).collect::<Vec<_>>()
            })
        } else {
            serde_json::json!({
                "character_id": character.id,
                "selected_interaction": null,
                "weight": 0.0,
                "alternatives": []
            })
        };

        results.push(result);
    }

    serde_wasm_bindgen::to_value(&results)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
}

/// Calculate behavioral states for multiple characters in batch
/// 
/// # JavaScript Example
/// ```javascript
/// const behavioralStates = calculateBatchBehavioralStates(consciousnessStates);
/// console.log(`Calculated ${behavioralStates.length} behavioral states`);
/// ```
#[wasm_bindgen]
pub fn calculate_batch_behavioral_states(
    consciousness_states: &JsValue
) -> Result<JsValue, JsValue> {
    use crate::consciousness_module::behavioral_state::generate_behavioral_state;
    use crate::types::consciousness::ConsciousnessState;

    let states: Vec<ConsciousnessState> = serde_wasm_bindgen::from_value(consciousness_states.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize states: {}", e)))?;

    let behavioral_states: Vec<_> = states
        .iter()
        .map(|state| generate_behavioral_state(state.current_frequency, state.emotional_coherence))
        .collect();

    serde_wasm_bindgen::to_value(&behavioral_states)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize behavioral states: {}", e)))
}

// ============================================================================
// Emotional System Exports
// ============================================================================

/// Calculate emotional coherence from frequency and base coherence
/// 
/// # JavaScript Example
/// ```javascript
/// const coherence = calculateEmotionalCoherence(40.0, 0.7);
/// console.log(`Emotional coherence: ${coherence}`);
/// ```
#[wasm_bindgen]
pub fn calculate_emotional_coherence(
    frequency: f64,
    base_coherence: f64
) -> f64 {
    use crate::emotion::emotional_utils::EmotionalUtils;
    EmotionalUtils::calculate_emotional_coherence(frequency, base_coherence)
}

/// Determine emotional state from coherence and impact
/// 
/// # JavaScript Example
/// ```javascript
/// const emotionalState = determineEmotionalState(0.8, 0.6);
/// console.log(`Emotional state: ${emotionalState}`);
/// ```
#[wasm_bindgen]
pub fn determine_emotional_state(
    coherence: f64,
    recent_impact: f64
) -> String {
    use crate::emotion::emotional_utils::EmotionalUtils;
    let state = EmotionalUtils::determine_emotional_state(coherence, recent_impact);
    format!("{:?}", state)
}

// ============================================================================
// Configuration Management Exports
// ============================================================================

/// Get default consciousness configuration
/// 
/// # JavaScript Example
/// ```javascript
/// const config = getDefaultConfiguration();
/// console.log(`Default frequency range: ${config.bounds.frequency.min} - ${config.bounds.frequency.max}`);
/// ```
#[wasm_bindgen]
pub fn get_default_configuration() -> Result<JsValue, JsValue> {
    use crate::consciousness_module::configuration::ConsciousnessConfigurationService;

    let service = ConsciousnessConfigurationService::new();
    let config = service.get_configuration();
    serde_wasm_bindgen::to_value(&config)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize config: {}", e)))
}

/// Validate consciousness configuration
/// 
/// # JavaScript Example
/// ```javascript
/// const isValid = validateConfiguration(config);
/// if (isValid) {
///   console.log('Configuration is valid');
/// }
/// ```
#[wasm_bindgen]
pub fn validate_configuration(config: &JsValue) -> Result<bool, JsValue> {
    use crate::consciousness_module::configuration::ConsciousnessConfiguration;

    let config: ConsciousnessConfiguration = serde_wasm_bindgen::from_value(config.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize config: {}", e)))?;

    // Validate bounds
    let valid = config.bounds.frequency.min >= 3.0 
        && config.bounds.frequency.max <= 100.0
        && config.bounds.coherence.min >= 0.0
        && config.bounds.coherence.max <= 1.0;

    Ok(valid)
}

// ============================================================================
// Utility & Feature Detection
// ============================================================================

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

/// Get WASM module version
#[wasm_bindgen]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Get build timestamp
#[wasm_bindgen]
pub fn get_build_info() -> String {
    format!(
        "consciousness-engine v{} (Rust/WASM)",
        env!("CARGO_PKG_VERSION")
    )
}

// ============================================================================
// Memory Management Utilities
// ============================================================================

/// Store a memory for a character
/// 
/// # JavaScript Example
/// ```javascript
/// const success = storeMemory(characterMemories, newMemory);
/// if (success) {
///   console.log('Memory stored successfully');
/// }
/// ```
#[wasm_bindgen]
pub fn store_memory(
    memories: &JsValue,
    new_memory: &JsValue
) -> Result<JsValue, JsValue> {
    use crate::memory_module::significant_memory::SignificantMemoryService;
    use crate::Memory;

    let mut memories: Vec<Memory> = serde_wasm_bindgen::from_value(memories.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize memories: {}", e)))?;

    let memory: Memory = serde_wasm_bindgen::from_value(new_memory.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize memory: {}", e)))?;

    SignificantMemoryService::store_memory(&mut memories, memory)
        .map_err(|e| JsValue::from_str(&format!("Failed to store memory: {}", e)))?;

    serde_wasm_bindgen::to_value(&memories)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize memories: {}", e)))
}

/// Validate memory integrity
/// 
/// # JavaScript Example
/// ```javascript
/// const isValid = validateMemory(memory);
/// if (!isValid) {
///   console.warn('Memory data is corrupted');
/// }
/// ```
#[wasm_bindgen]
pub fn validate_memory(memory: &JsValue) -> Result<bool, JsValue> {
    use crate::memory_module::significant_memory::SignificantMemoryService;
    use crate::Memory;

    let memory: Memory = serde_wasm_bindgen::from_value(memory.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize memory: {}", e)))?;

    let result = SignificantMemoryService::validate_memory(&memory);
    Ok(result.is_ok())
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/// Get performance statistics for WASM module
/// 
/// # JavaScript Example
/// ```javascript
/// const stats = getPerformanceStats();
/// console.log(`WASM module version: ${stats.version}`);
/// ```
#[wasm_bindgen]
pub fn get_performance_stats() -> Result<JsValue, JsValue> {
    #[cfg(target_arch = "wasm32")]
    {
        let stats = serde_json::json!({
            "wasm_supported": true,
            "version": env!("CARGO_PKG_VERSION"),
            "target": "wasm32-unknown-unknown"
        });
        
        serde_wasm_bindgen::to_value(&stats)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize stats: {}", e)))
    }
    
    #[cfg(not(target_arch = "wasm32"))]
    {
        let stats = serde_json::json!({
            "wasm_supported": false,
            "version": env!("CARGO_PKG_VERSION"),
            "target": "native"
        });
        
        serde_wasm_bindgen::to_value(&stats)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize stats: {}", e)))
    }
}