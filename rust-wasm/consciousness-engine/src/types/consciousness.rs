//! Consciousness-related type definitions

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

// WASM-compatible version (no Vec, simpler types)
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ConsciousnessState {
    pub base_frequency: f64,        // 3.0 - 15.0 Hz
    pub base_coherence: f64,        // 0.2 - 1.0
    pub current_frequency: f64,     // Current state
    pub emotional_coherence: f64,   // 0.2 - 1.0 range
    pub emotional_state: EmotionalState,
    pub last_update: u64,           // Timestamp
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct BehavioralState {
    pub energy: EnergyLevel,
    pub focus: FocusLevel,
    pub mood: MoodLevel,
    pub social_drive: f64,     // 0.0 - 1.0
    pub risk_tolerance: f64,   // 0.0 - 1.0
    pub ambition: f64,         // 0.0 - 1.0
    pub cached_timestamp: u64, // When this state was calculated
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum EnergyLevel {
    VeryLow,
    Low,
    Moderate,
    High,
    VeryHigh,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum FocusLevel {
    Scattered,
    Balanced,
    Focused,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum MoodLevel {
    Depressed,
    Content,
    Optimistic,
    Excited,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum EmotionalState {
    Content,
    Excited,
    Anxious,
    Depressed,
    Angry,
    Joyful,
    Fearful,
    Surprised,
}

// Internal version with Vec (not WASM-compatible)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsciousnessStateInternal {
    pub base_frequency: f64,
    pub base_coherence: f64,
    pub current_frequency: f64,
    pub emotional_coherence: f64,
    pub emotional_state: EmotionalState,
    pub last_update: u64,
    pub significant_events: Vec<SignificantEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignificantEvent {
    pub timestamp: u64,
    pub event_type: EventType,
    pub significance: f64,
    pub emotional_impact: f64,
    pub consciousness_change: ConsciousnessChange,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum EventType {
    GoalCompletion,
    SocialInteraction,
    CombatEncounter,
    Discovery,
    Failure,
    Achievement,
    Relationship,
    Economic,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct ConsciousnessChange {
    pub frequency_delta: f64,
    pub coherence_delta: f64,
    pub emotional_state_change: Option<EmotionalState>,
}

impl Default for ConsciousnessState {
    fn default() -> Self {
        Self {
            base_frequency: 7.5,  // Moderate baseline
            base_coherence: 0.8,
            current_frequency: 7.5,
            emotional_coherence: 0.8,
            emotional_state: EmotionalState::Content,
            last_update: 0,
        }
    }
}

impl Default for BehavioralState {
    fn default() -> Self {
        Self {
            energy: EnergyLevel::Moderate,
            focus: FocusLevel::Balanced,
            mood: MoodLevel::Content,
            social_drive: 0.5,
            risk_tolerance: 0.5,
            ambition: 0.5,
            cached_timestamp: 0,
        }
    }
}

impl Default for ConsciousnessStateInternal {
    fn default() -> Self {
        Self {
            base_frequency: 7.5,
            base_coherence: 0.8,
            current_frequency: 7.5,
            emotional_coherence: 0.8,
            emotional_state: EmotionalState::Content,
            last_update: 0,
            significant_events: Vec::new(),
        }
    }
}