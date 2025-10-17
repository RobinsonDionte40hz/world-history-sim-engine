//! Consciousness-specific error handling

use crate::types::error::ConsciousnessError;
use crate::Result;

/// Service for handling consciousness-related errors and recovery
pub struct ConsciousnessErrorHandlingService;

impl ConsciousnessErrorHandlingService {
    /// Validate consciousness parameters
    pub fn validate_consciousness_state(frequency: f64, coherence: f64) -> Result<()> {
        if !(3.0..=15.0).contains(&frequency) {
            return Err(ConsciousnessError::ValidationError {
                field: "frequency".to_string(),
                message: format!("Frequency {} must be between 3.0 and 15.0", frequency),
            });
        }

        if !(0.2..=1.0).contains(&coherence) {
            return Err(ConsciousnessError::ValidationError {
                field: "coherence".to_string(),
                message: format!("Coherence {} must be between 0.2 and 1.0", coherence),
            });
        }

        Ok(())
    }

    /// Attempt to recover from consciousness calculation errors
    pub fn recover_from_calculation_error(error: &ConsciousnessError) -> Option<String> {
        match error {
            ConsciousnessError::ConsciousnessCalculationFailed { reason } => {
                Some(format!("Attempting recovery: {}", reason))
            }
            _ => None,
        }
    }
}