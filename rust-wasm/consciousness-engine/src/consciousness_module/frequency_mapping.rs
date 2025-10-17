//! Frequency mapping utilities

use crate::types::consciousness::{ConsciousnessState, EnergyLevel};

/// Standalone function for frequency to energy mapping
pub fn map_frequency_to_energy(frequency: f64) -> EnergyLevel {
    ConsciousnessState::map_frequency_to_energy(frequency)
}