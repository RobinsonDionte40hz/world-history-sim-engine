//! Character-related type definitions

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use crate::types::consciousness::ConsciousnessStateInternal;

// WASM-compatible versions (no String, no Vec)
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Attributes {
    pub strength: u8,      // 1-20 D&D attribute
    pub dexterity: u8,
    pub constitution: u8,
    pub intelligence: u8,
    pub wisdom: u8,
    pub charisma: u8,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Personality {
    pub aggression: f64,   // 0.0 - 1.0
    pub curiosity: f64,
    pub empathy: f64,
    pub ambition: f64,
    pub sociability: f64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum GoalType {
    Exploration,
    Social,
    Economic,
    Combat,
    Learning,
    Rest,
    Achievement,
}

// Internal versions with complex types (not WASM-compatible)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Character {
    pub id: String,
    pub consciousness: crate::ConsciousnessStateInternal,
    pub attributes: Attributes,
    pub personality: Personality,
    pub memories: Vec<crate::Memory>,
    pub goals: Vec<Goal>,
    pub behavioral_state: Option<crate::BehavioralState>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Goal {
    pub id: String,
    pub goal_type: GoalType,
    pub priority: f64,     // 0.0 - 1.0
    pub description: String,
}

impl Default for Character {
    fn default() -> Self {
        Self {
            id: "default".to_string(),
            consciousness: ConsciousnessStateInternal::default(),
            attributes: Attributes::default(),
            personality: Personality::default(),
            memories: Vec::new(),
            goals: Vec::new(),
            behavioral_state: None,
        }
    }
}

impl Default for Attributes {
    fn default() -> Self {
        Self {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
        }
    }
}

impl Default for Personality {
    fn default() -> Self {
        Self {
            aggression: 0.5,
            curiosity: 0.5,
            empathy: 0.5,
            ambition: 0.5,
            sociability: 0.5,
        }
    }
}