//! Fast serialization for hot path types
//! 
//! Custom serializers that bypass serde overhead for maximum performance.
//! These are used in the critical path of behavioral state generation.

use crate::types::{BehavioralState, EnergyLevel, FocusLevel, MoodLevel, EmotionalState};
use wasm_bindgen::prelude::*;

/// Fast manual serialization for BehavioralState
/// 
/// Binary format (40 bytes):
/// - energy: u8 (1 byte)
/// - focus: u8 (1 byte)  
/// - mood: u8 (1 byte)
/// - padding: 5 bytes (alignment)
/// - social_drive: f64 (8 bytes)
/// - risk_tolerance: f64 (8 bytes)
/// - ambition: f64 (8 bytes)
/// - cached_timestamp: u64 (8 bytes)
impl BehavioralState {
    /// Convert to binary format (fast, no serde)
    #[inline(always)]
    pub fn to_binary(&self) -> Vec<u8> {
        let mut buf = Vec::with_capacity(40);
        
        // Enum values as u8
        buf.push(energy_to_u8(&self.energy));
        buf.push(focus_to_u8(&self.focus));
        buf.push(mood_to_u8(&self.mood));
        
        // Padding for alignment
        buf.extend_from_slice(&[0u8; 5]);
        
        // f64 values (little-endian)
        buf.extend_from_slice(&self.social_drive.to_le_bytes());
        buf.extend_from_slice(&self.risk_tolerance.to_le_bytes());
        buf.extend_from_slice(&self.ambition.to_le_bytes());
        buf.extend_from_slice(&self.cached_timestamp.to_le_bytes());
        
        buf
    }
    
    /// Convert from binary format (fast, no serde)
    #[inline(always)]
    pub fn from_binary(bytes: &[u8]) -> Result<Self, &'static str> {
        if bytes.len() < 40 {
            return Err("Invalid binary data: too short");
        }
        
        Ok(BehavioralState {
            energy: u8_to_energy(bytes[0])?,
            focus: u8_to_focus(bytes[1])?,
            mood: u8_to_mood(bytes[2])?,
            social_drive: f64::from_le_bytes(bytes[8..16].try_into().unwrap()),
            risk_tolerance: f64::from_le_bytes(bytes[16..24].try_into().unwrap()),
            ambition: f64::from_le_bytes(bytes[24..32].try_into().unwrap()),
            cached_timestamp: u64::from_le_bytes(bytes[32..40].try_into().unwrap()),
        })
    }
}

/// WASM-exposed methods for BehavioralState
#[wasm_bindgen]
impl BehavioralState {
    /// Get energy as u8 directly (for JS/WASM interface)
    #[wasm_bindgen(getter)]
    pub fn energy_value(&self) -> u8 {
        energy_to_u8(&self.energy)
    }
    
    /// Get focus as u8 directly (for JS/WASM interface)
    #[wasm_bindgen(getter)]
    pub fn focus_value(&self) -> u8 {
        focus_to_u8(&self.focus)
    }
    
    /// Get mood as u8 directly (for JS/WASM interface)
    #[wasm_bindgen(getter)]
    pub fn mood_value(&self) -> u8 {
        mood_to_u8(&self.mood)
    }
}

/// Convert EnergyLevel to u8
#[inline(always)]
pub fn energy_to_u8(energy: &EnergyLevel) -> u8 {
    match energy {
        EnergyLevel::VeryLow => 0,
        EnergyLevel::Low => 1,
        EnergyLevel::Moderate => 2,
        EnergyLevel::High => 3,
        EnergyLevel::VeryHigh => 4,
    }
}

/// Convert u8 to EnergyLevel
#[inline(always)]
fn u8_to_energy(value: u8) -> Result<EnergyLevel, &'static str> {
    match value {
        0 => Ok(EnergyLevel::VeryLow),
        1 => Ok(EnergyLevel::Low),
        2 => Ok(EnergyLevel::Moderate),
        3 => Ok(EnergyLevel::High),
        4 => Ok(EnergyLevel::VeryHigh),
        _ => Err("Invalid energy level value"),
    }
}

/// Convert FocusLevel to u8
#[inline(always)]
pub fn focus_to_u8(focus: &FocusLevel) -> u8 {
    match focus {
        FocusLevel::Scattered => 0,
        FocusLevel::Balanced => 1,
        FocusLevel::Focused => 2,
    }
}

/// Convert u8 to FocusLevel
#[inline(always)]
fn u8_to_focus(value: u8) -> Result<FocusLevel, &'static str> {
    match value {
        0 => Ok(FocusLevel::Scattered),
        1 => Ok(FocusLevel::Balanced),
        2 => Ok(FocusLevel::Focused),
        _ => Err("Invalid focus level value"),
    }
}

/// Convert MoodLevel to u8
#[inline(always)]
pub fn mood_to_u8(mood: &MoodLevel) -> u8 {
    match mood {
        MoodLevel::Depressed => 0,
        MoodLevel::Content => 1,
        MoodLevel::Optimistic => 2,
        MoodLevel::Excited => 3,
    }
}

/// Convert u8 to MoodLevel
#[inline(always)]
fn u8_to_mood(value: u8) -> Result<MoodLevel, &'static str> {
    match value {
        0 => Ok(MoodLevel::Depressed),
        1 => Ok(MoodLevel::Content),
        2 => Ok(MoodLevel::Optimistic),
        3 => Ok(MoodLevel::Excited),
        _ => Err("Invalid mood level value"),
    }
}

/// Convert EmotionalState to u8
#[inline(always)]
pub fn emotional_state_to_u8(state: &EmotionalState) -> u8 {
    match state {
        EmotionalState::Content => 0,
        EmotionalState::Excited => 1,
        EmotionalState::Anxious => 2,
        EmotionalState::Depressed => 3,
        EmotionalState::Angry => 4,
        EmotionalState::Joyful => 5,
        EmotionalState::Fearful => 6,
        EmotionalState::Surprised => 7,
    }
}

/// Convert u8 to EmotionalState
#[inline(always)]
pub fn u8_to_emotional_state(value: u8) -> Result<EmotionalState, &'static str> {
    match value {
        0 => Ok(EmotionalState::Content),
        1 => Ok(EmotionalState::Excited),
        2 => Ok(EmotionalState::Anxious),
        3 => Ok(EmotionalState::Depressed),
        4 => Ok(EmotionalState::Angry),
        5 => Ok(EmotionalState::Joyful),
        6 => Ok(EmotionalState::Fearful),
        7 => Ok(EmotionalState::Surprised),
        _ => Err("Invalid emotional state value"),
    }
}

/// WASM-exposed function for fast behavioral state serialization
#[wasm_bindgen]
pub fn serialize_behavioral_state_fast(state: &BehavioralState) -> Vec<u8> {
    state.to_binary()
}

/// WASM-exposed function for fast behavioral state deserialization
#[wasm_bindgen]
pub fn deserialize_behavioral_state_fast(bytes: &[u8]) -> Result<BehavioralState, JsValue> {
    BehavioralState::from_binary(bytes)
        .map_err(|e| JsValue::from_str(e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_energy_conversion() {
        assert_eq!(energy_to_u8(&EnergyLevel::VeryLow), 0);
        assert_eq!(energy_to_u8(&EnergyLevel::Low), 1);
        assert_eq!(energy_to_u8(&EnergyLevel::Moderate), 2);
        assert_eq!(energy_to_u8(&EnergyLevel::High), 3);
        assert_eq!(energy_to_u8(&EnergyLevel::VeryHigh), 4);
        
        assert_eq!(u8_to_energy(0).unwrap(), EnergyLevel::VeryLow);
        assert_eq!(u8_to_energy(1).unwrap(), EnergyLevel::Low);
        assert_eq!(u8_to_energy(2).unwrap(), EnergyLevel::Moderate);
        assert_eq!(u8_to_energy(3).unwrap(), EnergyLevel::High);
        assert_eq!(u8_to_energy(4).unwrap(), EnergyLevel::VeryHigh);
        assert!(u8_to_energy(5).is_err());
    }

    #[test]
    fn test_focus_conversion() {
        assert_eq!(focus_to_u8(&FocusLevel::Scattered), 0);
        assert_eq!(focus_to_u8(&FocusLevel::Balanced), 1);
        assert_eq!(focus_to_u8(&FocusLevel::Focused), 2);
        
        assert_eq!(u8_to_focus(0).unwrap(), FocusLevel::Scattered);
        assert_eq!(u8_to_focus(1).unwrap(), FocusLevel::Balanced);
        assert_eq!(u8_to_focus(2).unwrap(), FocusLevel::Focused);
        assert!(u8_to_focus(3).is_err());
    }

    #[test]
    fn test_mood_conversion() {
        assert_eq!(mood_to_u8(&MoodLevel::Depressed), 0);
        assert_eq!(mood_to_u8(&MoodLevel::Content), 1);
        assert_eq!(mood_to_u8(&MoodLevel::Optimistic), 2);
        assert_eq!(mood_to_u8(&MoodLevel::Excited), 3);
        
        assert_eq!(u8_to_mood(0).unwrap(), MoodLevel::Depressed);
        assert_eq!(u8_to_mood(1).unwrap(), MoodLevel::Content);
        assert_eq!(u8_to_mood(2).unwrap(), MoodLevel::Optimistic);
        assert_eq!(u8_to_mood(3).unwrap(), MoodLevel::Excited);
        assert!(u8_to_mood(4).is_err());
    }

    #[test]
    fn test_emotional_state_conversion() {
        assert_eq!(emotional_state_to_u8(&EmotionalState::Content), 0);
        assert_eq!(emotional_state_to_u8(&EmotionalState::Excited), 1);
        assert_eq!(emotional_state_to_u8(&EmotionalState::Anxious), 2);
        
        assert_eq!(u8_to_emotional_state(0).unwrap(), EmotionalState::Content);
        assert_eq!(u8_to_emotional_state(1).unwrap(), EmotionalState::Excited);
        assert_eq!(u8_to_emotional_state(2).unwrap(), EmotionalState::Anxious);
        assert!(u8_to_emotional_state(8).is_err());
    }

    #[test]
    fn test_behavioral_state_serialization() {
        let state = BehavioralState {
            energy: EnergyLevel::High,
            focus: FocusLevel::Focused,
            mood: MoodLevel::Optimistic,
            social_drive: 0.75,
            risk_tolerance: 0.5,
            ambition: 0.9,
            cached_timestamp: 123456789,
        };
        
        let binary = state.to_binary();
        assert_eq!(binary.len(), 40);
        
        // Check enum values
        assert_eq!(binary[0], 3); // High energy
        assert_eq!(binary[1], 2); // Focused
        assert_eq!(binary[2], 2); // Optimistic
        
        // Deserialize and verify
        let deserialized = BehavioralState::from_binary(&binary).unwrap();
        assert_eq!(deserialized.energy, state.energy);
        assert_eq!(deserialized.focus, state.focus);
        assert_eq!(deserialized.mood, state.mood);
        assert_eq!(deserialized.social_drive, state.social_drive);
        assert_eq!(deserialized.risk_tolerance, state.risk_tolerance);
        assert_eq!(deserialized.ambition, state.ambition);
        assert_eq!(deserialized.cached_timestamp, state.cached_timestamp);
    }

    #[test]
    fn test_behavioral_state_roundtrip() {
        let original = BehavioralState::default();
        let binary = original.to_binary();
        let recovered = BehavioralState::from_binary(&binary).unwrap();
        
        assert_eq!(recovered.energy, original.energy);
        assert_eq!(recovered.focus, original.focus);
        assert_eq!(recovered.mood, original.mood);
    }

    #[test]
    fn test_behavioral_state_getters() {
        let state = BehavioralState {
            energy: EnergyLevel::VeryHigh,
            focus: FocusLevel::Scattered,
            mood: MoodLevel::Excited,
            social_drive: 0.0,
            risk_tolerance: 0.0,
            ambition: 0.0,
            cached_timestamp: 0,
        };
        
        assert_eq!(state.energy_value(), 4);
        assert_eq!(state.focus_value(), 0);
        assert_eq!(state.mood_value(), 3);
    }
}
