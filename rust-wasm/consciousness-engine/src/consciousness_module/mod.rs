//! Consciousness calculation and state management

pub mod behavioral_state;
pub mod frequency_mapping;
pub mod consciousness_update;
pub mod error_handling;
pub mod configuration;

// Re-export key functions for easier access
pub use behavioral_state::{
    generate_behavioral_state,
    map_frequency_to_energy,
    map_coherence_to_focus,
    calculate_mood_from_state,
    calculate_social_drive,
    calculate_risk_tolerance,
    calculate_ambition,
};

pub use frequency_mapping::{
    map_frequency_to_energy as map_freq_to_energy,
    map_coherence_to_focus as map_coh_to_focus,
    calculate_mood_from_state as calc_mood,
};

pub use configuration::{
    ConsciousnessConfigurationService,
    ConsciousnessConfiguration,
    ConsciousnessBounds,
    SignificanceThresholds,
    BehavioralMapping,
    MemoryConfiguration,
    PerformanceConfiguration,
    ConfigurationUpdateResult,
};