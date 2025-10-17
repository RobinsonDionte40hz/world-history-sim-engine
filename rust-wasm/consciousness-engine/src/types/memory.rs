//! Memory-related type definitions

use serde::{Deserialize, Serialize};
use crate::types::interaction::InteractionType;

// Internal memory types (not WASM-compatible due to String/Vec)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Memory {
    pub id: String,
    pub timestamp: u64,
    pub significance: f64,          // 0.0 - 1.0
    pub emotional_impact: f64,      // -1.0 - 1.0
    pub interaction_type: InteractionType,
    pub participants: Vec<String>,
    pub context: MemoryContext,
    pub decay_factor: f64,          // Memory strength over time
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryContext {
    pub location: Option<String>,
    pub goal_relevance: f64,        // How relevant to current goals
    pub novelty_factor: f64,        // How unusual the event was
    pub social_importance: f64,     // Social significance
    pub survival_relevance: f64,    // Survival importance
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InteractionEvent {
    pub id: String,
    pub timestamp: u64,
    pub emotional_impact: f64,
    pub participants: Vec<String>,
    pub context: MemoryContext,
}

impl Default for MemoryContext {
    fn default() -> Self {
        Self {
            location: None,
            goal_relevance: 0.0,
            novelty_factor: 0.0,
            social_importance: 0.0,
            survival_relevance: 0.0,
        }
    }
}