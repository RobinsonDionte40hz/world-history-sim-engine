//! Interaction-related type definitions

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use crate::types::consciousness::EmotionalState;
use crate::types::character::Attributes;

// WASM-compatible types
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum InteractionType {
    Social,
    Economic,
    Combat,
    Exploration,
    Crafting,
    Learning,
    Rest,
    Travel,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum EffectType {
    AttributeModification,
    ResourceChange,
    RelationshipChange,
    MemoryCreation,
    GoalProgress,
    ConsciousnessShift,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ConsciousnessImpact {
    pub frequency_change: f64,
    pub coherence_change: f64,
    pub emotional_impact: f64,
    pub significance: f64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ConsciousnessRequirement {
    pub min_frequency: Option<f64>,
    pub max_frequency: Option<f64>,
    pub min_coherence: Option<f64>,
    pub required_emotional_state: Option<EmotionalState>,
}

// Internal types (not WASM-compatible due to complex types)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Interaction {
    pub id: String,
    pub name: String,
    pub interaction_type: InteractionType,
    pub requirements: InteractionRequirements,
    pub effects: InteractionEffects,
    pub base_weight: f64,           // Base probability weight
    pub goal_alignment: HashMap<String, f64>, // Goal type -> alignment score
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InteractionRequirements {
    pub min_attributes: Option<Attributes>,
    pub required_skills: Vec<String>,
    pub node_types: Vec<String>,
    pub consciousness_state: Option<ConsciousnessRequirement>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InteractionEffects {
    pub success_effects: Vec<Effect>,
    pub failure_effects: Vec<Effect>,
    pub consciousness_impact: ConsciousnessImpact,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Effect {
    pub effect_type: EffectType,
    pub target: EffectTarget,
    pub magnitude: f64,
    pub duration: Option<u64>,      // Duration in simulation ticks
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EffectTarget {
    Self_,
    Other(String),              // Target character ID
    Global,                     // World state
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InteractionContext {
    pub location_type: Option<String>,
    pub time_of_day: Option<String>,
    pub social_context: Option<String>,
    pub environmental_factors: HashMap<String, f64>,
}

impl Default for InteractionContext {
    fn default() -> Self {
        Self {
            location_type: None,
            time_of_day: None,
            social_context: None,
            environmental_factors: HashMap::new(),
        }
    }
}