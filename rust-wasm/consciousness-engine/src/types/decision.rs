//! Decision-related type definitions

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Decision {
    pub chosen_option: DecisionOption,
    pub confidence: f64,
    pub reasoning: String,
    pub quantum_coherence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionOption {
    pub id: String,
    pub description: String,
    pub utility_score: f64,
    pub risk_level: Option<f64>,
    pub target_character: String,
    pub target_node: String,
    pub emotional_impact: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionContext {
    pub urgency: f64,
    pub social_pressure: f64,
    pub time_available: u64,
    pub current_emotional_state: String,
}