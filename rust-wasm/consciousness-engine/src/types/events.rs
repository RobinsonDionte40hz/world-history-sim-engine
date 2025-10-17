//! Event-related type definitions

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsciousnessEvent {
    pub event_type: String,
    pub intensity: f64,
    pub timestamp: u64,
    pub context: Option<String>,
    pub participants: Vec<String>,
}