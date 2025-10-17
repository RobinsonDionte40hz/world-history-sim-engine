//! Error types for the consciousness engine

use serde::{Deserialize, Serialize};
use thiserror::Error;
use wasm_bindgen::JsValue;

#[derive(Error, Debug, Clone, Serialize, Deserialize)]
pub enum ConsciousnessError {
    #[error("Invalid character data: {message}")]
    InvalidCharacterData { message: String },

    #[error("Consciousness calculation failed: {reason}")]
    ConsciousnessCalculationFailed { reason: String },

    #[error("Memory corruption detected: {details}")]
    MemoryCorruptionDetected { details: String },

    #[error("Performance threshold exceeded: expected {expected}ms, actual {actual}ms")]
    PerformanceThresholdExceeded { expected: u64, actual: u64 },

    #[error("WASM memory exhausted: {current_usage}MB / {limit}MB")]
    WasmMemoryExhausted { current_usage: u64, limit: u64 },

    #[error("Serialization error: {message}")]
    SerializationError { message: String },

    #[error("Validation error: {field} - {message}")]
    ValidationError { field: String, message: String },
}

impl ConsciousnessError {
    pub fn is_recoverable(&self) -> bool {
        match self {
            ConsciousnessError::InvalidCharacterData { .. } => false,
            ConsciousnessError::ConsciousnessCalculationFailed { .. } => true,
            ConsciousnessError::MemoryCorruptionDetected { .. } => true,
            ConsciousnessError::PerformanceThresholdExceeded { .. } => true,
            ConsciousnessError::WasmMemoryExhausted { .. } => false,
            ConsciousnessError::SerializationError { .. } => false,
            ConsciousnessError::ValidationError { .. } => false,
        }
    }

    pub fn error_code(&self) -> &'static str {
        match self {
            ConsciousnessError::InvalidCharacterData { .. } => "INVALID_CHARACTER_DATA",
            ConsciousnessError::ConsciousnessCalculationFailed { .. } => "CONSCIOUSNESS_CALCULATION_FAILED",
            ConsciousnessError::MemoryCorruptionDetected { .. } => "MEMORY_CORRUPTION_DETECTED",
            ConsciousnessError::PerformanceThresholdExceeded { .. } => "PERFORMANCE_THRESHOLD_EXCEEDED",
            ConsciousnessError::WasmMemoryExhausted { .. } => "WASM_MEMORY_EXHAUSTED",
            ConsciousnessError::SerializationError { .. } => "SERIALIZATION_ERROR",
            ConsciousnessError::ValidationError { .. } => "VALIDATION_ERROR",
        }
    }
}

impl From<ConsciousnessError> for JsValue {
    fn from(error: ConsciousnessError) -> JsValue {
        JsValue::from_str(&error.to_string())
    }
}

pub type Result<T> = std::result::Result<T, ConsciousnessError>;