//! Consciousness Configuration Service
//!
//! Provides configuration management for consciousness parameters, significance thresholds,
//! behavioral state mappings, and tuning utilities for the consciousness system.
//! Supports runtime configuration updates and validation.

use crate::{Result, ConsciousnessError};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Complete consciousness system configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsciousnessConfiguration {
    /// Consciousness parameter bounds
    pub bounds: ConsciousnessBounds,
    /// Significance thresholds
    pub significance: SignificanceThresholds,
    /// Behavioral state mapping configuration
    pub behavioral_mapping: BehavioralMapping,
    /// Decision factor bounds
    pub decision_factors: DecisionFactorBounds,
    /// Memory management configuration
    pub memory: MemoryConfiguration,
    /// Performance tuning parameters
    pub performance: PerformanceConfiguration,
    /// Event type significance weights
    pub event_significance_weights: HashMap<String, f64>,
    /// Consciousness update rules
    pub update_rules: HashMap<String, ConsciousnessChange>,
}

/// Consciousness parameter bounds (frequency and coherence)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsciousnessBounds {
    pub frequency: ParameterBound,
    pub coherence: ParameterBound,
}

/// Parameter bound with min, max, default, and description
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParameterBound {
    pub min: f64,
    pub max: f64,
    pub default: f64,
    pub description: String,
}

/// Significance thresholds for different operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignificanceThresholds {
    pub update_threshold: f64,
    pub memory_threshold: f64,
    pub event_threshold: f64,
    pub description: String,
}

/// Behavioral state mapping configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralMapping {
    pub energy: EnergyMapping,
    pub focus: FocusMapping,
    pub mood: MoodMapping,
}

/// Energy level mapping to frequency ranges
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnergyMapping {
    pub low: BehavioralRange,
    pub moderate: BehavioralRange,
    pub high: BehavioralRange,
}

/// Focus level mapping to coherence ranges
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FocusMapping {
    pub scattered: CoherenceRange,
    pub balanced: CoherenceRange,
    pub focused: CoherenceRange,
}

/// Mood mapping to frequency ranges
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoodMapping {
    pub depressed: BehavioralRange,
    pub content: BehavioralRange,
    pub optimistic: BehavioralRange,
    pub excited: BehavioralRange,
}

/// Behavioral range with frequency bounds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralRange {
    pub min: f64,
    pub max: f64,
    pub frequency: RangeBounds,
}

/// Coherence range with coherence bounds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoherenceRange {
    pub min: f64,
    pub max: f64,
    pub coherence: RangeBounds,
}

/// Generic range bounds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RangeBounds {
    pub min: f64,
    pub max: f64,
}

/// Decision factor bounds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionFactorBounds {
    pub min: f64,
    pub max: f64,
    pub default: f64,
    pub description: String,
}

/// Memory management configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryConfiguration {
    pub max_memories_per_character: usize,
    pub max_events_per_character: usize,
    pub significance_decay_rate: f64,
    pub recency_weight_decay: f64,
    pub description: String,
}

/// Performance tuning parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfiguration {
    pub batch_size: usize,
    pub update_frequency_limit: usize,
    pub cache_timeout: u64,
    pub garbage_collection_interval: usize,
    pub description: String,
}

/// Consciousness change delta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsciousnessChange {
    pub frequency: f64,
    pub coherence: f64,
}

/// Configuration update result
#[derive(Debug, Clone)]
pub struct ConfigurationUpdateResult {
    pub success: bool,
    pub section: String,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

/// Consciousness Configuration Service
pub struct ConsciousnessConfigurationService {
    config: ConsciousnessConfiguration,
}

impl ConsciousnessConfigurationService {
    /// Create a new configuration service with default settings
    pub fn new() -> Self {
        Self {
            config: Self::default_configuration(),
        }
    }

    /// Create default consciousness configuration
    fn default_configuration() -> ConsciousnessConfiguration {
        ConsciousnessConfiguration {
            bounds: ConsciousnessBounds {
                frequency: ParameterBound {
                    min: 3.0,
                    max: 15.0,
                    default: 7.5,
                    description: "Consciousness frequency in Hz (3-15 range)".to_string(),
                },
                coherence: ParameterBound {
                    min: 0.2,
                    max: 1.0,
                    default: 0.7,
                    description: "Consciousness coherence (0.2-1.0 range)".to_string(),
                },
            },
            significance: SignificanceThresholds {
                update_threshold: 0.3,
                memory_threshold: 0.3,
                event_threshold: 0.2,
                description: "Minimum significance values for triggering updates".to_string(),
            },
            behavioral_mapping: BehavioralMapping {
                energy: EnergyMapping {
                    low: BehavioralRange {
                        min: 0.0,
                        max: 0.4,
                        frequency: RangeBounds { min: 3.0, max: 6.0 },
                    },
                    moderate: BehavioralRange {
                        min: 0.4,
                        max: 0.7,
                        frequency: RangeBounds { min: 6.0, max: 10.0 },
                    },
                    high: BehavioralRange {
                        min: 0.7,
                        max: 1.0,
                        frequency: RangeBounds { min: 10.0, max: 15.0 },
                    },
                },
                focus: FocusMapping {
                    scattered: CoherenceRange {
                        min: 0.0,
                        max: 0.4,
                        coherence: RangeBounds { min: 0.2, max: 0.5 },
                    },
                    balanced: CoherenceRange {
                        min: 0.4,
                        max: 0.7,
                        coherence: RangeBounds { min: 0.5, max: 0.8 },
                    },
                    focused: CoherenceRange {
                        min: 0.7,
                        max: 1.0,
                        coherence: RangeBounds { min: 0.8, max: 1.0 },
                    },
                },
                mood: MoodMapping {
                    depressed: BehavioralRange {
                        min: 0.0,
                        max: 0.3,
                        frequency: RangeBounds { min: 3.0, max: 5.0 },
                    },
                    content: BehavioralRange {
                        min: 0.3,
                        max: 0.7,
                        frequency: RangeBounds { min: 5.0, max: 10.0 },
                    },
                    optimistic: BehavioralRange {
                        min: 0.7,
                        max: 0.9,
                        frequency: RangeBounds { min: 8.0, max: 12.0 },
                    },
                    excited: BehavioralRange {
                        min: 0.9,
                        max: 1.0,
                        frequency: RangeBounds { min: 12.0, max: 15.0 },
                    },
                },
            },
            decision_factors: DecisionFactorBounds {
                min: 0.1,
                max: 3.0,
                default: 1.0,
                description: "Bounds for behavioral decision factors".to_string(),
            },
            memory: MemoryConfiguration {
                max_memories_per_character: 50,
                max_events_per_character: 20,
                significance_decay_rate: 0.1,
                recency_weight_decay: 0.2,
                description: "Memory storage and decay parameters".to_string(),
            },
            performance: PerformanceConfiguration {
                batch_size: 100,
                update_frequency_limit: 10,
                cache_timeout: 300000, // 5 minutes in milliseconds
                garbage_collection_interval: 1000,
                description: "Performance optimization parameters".to_string(),
            },
            event_significance_weights: Self::default_event_weights(),
            update_rules: Self::default_update_rules(),
        }
    }

    /// Get default event significance weights
    fn default_event_weights() -> HashMap<String, f64> {
        let mut weights = HashMap::new();
        weights.insert("goal_completion".to_string(), 0.8);
        weights.insert("goal_failure".to_string(), 0.7);
        weights.insert("social_interaction_major".to_string(), 0.6);
        weights.insert("traumatic_encounter".to_string(), 1.0);
        weights.insert("relationship_change_major".to_string(), 0.5);
        weights.insert("life_change_event".to_string(), 0.9);
        weights.insert("conflict_resolution".to_string(), 0.6);
        weights.insert("resource_gain_major".to_string(), 0.4);
        weights.insert("resource_loss_major".to_string(), 0.5);
        weights.insert("birth".to_string(), 0.9);
        weights.insert("death".to_string(), 0.8);
        weights.insert("marriage".to_string(), 0.7);
        weights.insert("discovery".to_string(), 0.6);
        weights.insert("skill_improvement".to_string(), 0.4);
        weights.insert("social_success".to_string(), 0.6);
        weights.insert("social_failure".to_string(), 0.5);
        weights.insert("conflict".to_string(), 0.7);
        weights
    }

    /// Get default consciousness update rules
    fn default_update_rules() -> HashMap<String, ConsciousnessChange> {
        let mut rules = HashMap::new();
        rules.insert("goal_completion".to_string(), ConsciousnessChange { frequency: 0.3, coherence: 0.05 });
        rules.insert("goal_failure".to_string(), ConsciousnessChange { frequency: -0.5, coherence: -0.1 });
        rules.insert("goal_progress".to_string(), ConsciousnessChange { frequency: 0.1, coherence: 0.02 });
        rules.insert("social_success".to_string(), ConsciousnessChange { frequency: 0.2, coherence: 0.03 });
        rules.insert("social_failure".to_string(), ConsciousnessChange { frequency: -0.3, coherence: -0.05 });
        rules.insert("relationship_change".to_string(), ConsciousnessChange { frequency: 0.4, coherence: 0.06 });
        rules.insert("conflict".to_string(), ConsciousnessChange { frequency: 0.6, coherence: -0.1 });
        rules.insert("betrayal".to_string(), ConsciousnessChange { frequency: -0.8, coherence: -0.15 });
        rules.insert("traumatic_encounter".to_string(), ConsciousnessChange { frequency: -1.0, coherence: -0.2 });
        rules.insert("economic_gain".to_string(), ConsciousnessChange { frequency: 0.2, coherence: 0.03 });
        rules.insert("economic_loss".to_string(), ConsciousnessChange { frequency: -0.4, coherence: -0.07 });
        rules.insert("birth".to_string(), ConsciousnessChange { frequency: 0.5, coherence: 0.1 });
        rules.insert("death".to_string(), ConsciousnessChange { frequency: -0.7, coherence: -0.12 });
        rules.insert("marriage".to_string(), ConsciousnessChange { frequency: 0.6, coherence: 0.08 });
        rules.insert("discovery".to_string(), ConsciousnessChange { frequency: 0.4, coherence: 0.06 });
        rules.insert("skill_improvement".to_string(), ConsciousnessChange { frequency: 0.2, coherence: 0.04 });
        rules
    }

    /// Get current configuration (cloned)
    pub fn get_configuration(&self) -> ConsciousnessConfiguration {
        self.config.clone()
    }

    /// Get consciousness bounds configuration
    pub fn get_bounds(&self) -> &ConsciousnessBounds {
        &self.config.bounds
    }

    /// Get significance thresholds
    pub fn get_significance_thresholds(&self) -> &SignificanceThresholds {
        &self.config.significance
    }

    /// Get behavioral mapping configuration
    pub fn get_behavioral_mapping(&self) -> &BehavioralMapping {
        &self.config.behavioral_mapping
    }

    /// Get memory configuration
    pub fn get_memory_configuration(&self) -> &MemoryConfiguration {
        &self.config.memory
    }

    /// Get performance configuration
    pub fn get_performance_configuration(&self) -> &PerformanceConfiguration {
        &self.config.performance
    }

    /// Get event significance weight for specific event type
    pub fn get_event_significance_weight(&self, event_type: &str) -> f64 {
        *self.config.event_significance_weights.get(event_type).unwrap_or(&0.5)
    }

    /// Get consciousness update rule for event type
    pub fn get_update_rule(&self, event_type: &str) -> Option<&ConsciousnessChange> {
        self.config.update_rules.get(event_type)
    }

    /// Validate frequency value
    pub fn validate_frequency(&self, value: f64) -> Result<()> {
        let bounds = &self.config.bounds.frequency;
        if value < bounds.min || value > bounds.max {
            return Err(ConsciousnessError::ValidationError {
                field: "frequency".to_string(),
                message: format!("Frequency {} out of bounds [{}, {}]", value, bounds.min, bounds.max),
            });
        }
        Ok(())
    }

    /// Validate coherence value
    pub fn validate_coherence(&self, value: f64) -> Result<()> {
        let bounds = &self.config.bounds.coherence;
        if value < bounds.min || value > bounds.max {
            return Err(ConsciousnessError::ValidationError {
                field: "coherence".to_string(),
                message: format!("Coherence {} out of bounds [{}, {}]", value, bounds.min, bounds.max),
            });
        }
        Ok(())
    }

    /// Validate significance value
    pub fn validate_significance(&self, value: f64) -> Result<()> {
        if !(0.0..=1.0).contains(&value) {
            return Err(ConsciousnessError::ValidationError {
                field: "significance".to_string(),
                message: format!("Significance {} must be between 0.0 and 1.0", value),
            });
        }
        Ok(())
    }

    /// Validate decision factor value
    pub fn validate_decision_factor(&self, value: f64) -> Result<()> {
        let bounds = &self.config.decision_factors;
        if value < bounds.min || value > bounds.max {
            return Err(ConsciousnessError::ValidationError {
                field: "decision_factor".to_string(),
                message: format!("Decision factor {} out of bounds [{}, {}]", value, bounds.min, bounds.max),
            });
        }
        Ok(())
    }

    /// Update frequency bounds
    pub fn update_frequency_bounds(&mut self, min: f64, max: f64, default: f64) -> Result<ConfigurationUpdateResult> {
        // Validate new bounds
        if min < 0.0 || max > 20.0 || min >= max || default < min || default > max {
            return Ok(ConfigurationUpdateResult {
                success: false,
                section: "frequency_bounds".to_string(),
                errors: vec!["Invalid frequency bounds".to_string()],
                warnings: Vec::new(),
            });
        }

        self.config.bounds.frequency.min = min;
        self.config.bounds.frequency.max = max;
        self.config.bounds.frequency.default = default;

        Ok(ConfigurationUpdateResult {
            success: true,
            section: "frequency_bounds".to_string(),
            errors: Vec::new(),
            warnings: Vec::new(),
        })
    }

    /// Update coherence bounds
    pub fn update_coherence_bounds(&mut self, min: f64, max: f64, default: f64) -> Result<ConfigurationUpdateResult> {
        // Validate new bounds
        if min < 0.0 || max > 1.0 || min >= max || default < min || default > max {
            return Ok(ConfigurationUpdateResult {
                success: false,
                section: "coherence_bounds".to_string(),
                errors: vec!["Invalid coherence bounds".to_string()],
                warnings: Vec::new(),
            });
        }

        self.config.bounds.coherence.min = min;
        self.config.bounds.coherence.max = max;
        self.config.bounds.coherence.default = default;

        Ok(ConfigurationUpdateResult {
            success: true,
            section: "coherence_bounds".to_string(),
            errors: Vec::new(),
            warnings: Vec::new(),
        })
    }

    /// Update significance thresholds
    pub fn update_significance_thresholds(
        &mut self,
        update_threshold: Option<f64>,
        memory_threshold: Option<f64>,
        event_threshold: Option<f64>,
    ) -> Result<ConfigurationUpdateResult> {
        let mut errors = Vec::new();

        // Validate thresholds
        if let Some(val) = update_threshold {
            if !(0.0..=1.0).contains(&val) {
                errors.push("update_threshold must be between 0.0 and 1.0".to_string());
            } else {
                self.config.significance.update_threshold = val;
            }
        }

        if let Some(val) = memory_threshold {
            if !(0.0..=1.0).contains(&val) {
                errors.push("memory_threshold must be between 0.0 and 1.0".to_string());
            } else {
                self.config.significance.memory_threshold = val;
            }
        }

        if let Some(val) = event_threshold {
            if !(0.0..=1.0).contains(&val) {
                errors.push("event_threshold must be between 0.0 and 1.0".to_string());
            } else {
                self.config.significance.event_threshold = val;
            }
        }

        Ok(ConfigurationUpdateResult {
            success: errors.is_empty(),
            section: "significance_thresholds".to_string(),
            errors,
            warnings: Vec::new(),
        })
    }

    /// Update event significance weight
    pub fn update_event_weight(&mut self, event_type: String, weight: f64) -> Result<ConfigurationUpdateResult> {
        if !(0.0..=1.0).contains(&weight) {
            return Ok(ConfigurationUpdateResult {
                success: false,
                section: "event_weights".to_string(),
                errors: vec![format!("Weight {} must be between 0.0 and 1.0", weight)],
                warnings: Vec::new(),
            });
        }

        self.config.event_significance_weights.insert(event_type, weight);

        Ok(ConfigurationUpdateResult {
            success: true,
            section: "event_weights".to_string(),
            errors: Vec::new(),
            warnings: Vec::new(),
        })
    }

    /// Update consciousness change rule for event type
    pub fn update_consciousness_rule(
        &mut self,
        event_type: String,
        frequency_change: f64,
        coherence_change: f64,
    ) -> Result<ConfigurationUpdateResult> {
        self.config.update_rules.insert(
            event_type,
            ConsciousnessChange {
                frequency: frequency_change,
                coherence: coherence_change,
            },
        );

        Ok(ConfigurationUpdateResult {
            success: true,
            section: "update_rules".to_string(),
            errors: Vec::new(),
            warnings: Vec::new(),
        })
    }

    /// Reset configuration to defaults
    pub fn reset_to_defaults(&mut self) {
        self.config = Self::default_configuration();
    }

    /// Export configuration as JSON
    pub fn export_configuration(&self) -> Result<String> {
        serde_json::to_string_pretty(&self.config)
            .map_err(|e| ConsciousnessError::SerializationError {
                message: format!("Failed to serialize configuration: {}", e),
            })
    }

    /// Import configuration from JSON
    pub fn import_configuration(&mut self, json: &str) -> Result<ConfigurationUpdateResult> {
        match serde_json::from_str::<ConsciousnessConfiguration>(json) {
            Ok(new_config) => {
                self.config = new_config;
                Ok(ConfigurationUpdateResult {
                    success: true,
                    section: "full_configuration".to_string(),
                    errors: Vec::new(),
                    warnings: Vec::new(),
                })
            }
            Err(e) => Ok(ConfigurationUpdateResult {
                success: false,
                section: "full_configuration".to_string(),
                errors: vec![format!("Failed to parse configuration JSON: {}", e)],
                warnings: Vec::new(),
            }),
        }
    }
}

impl Default for ConsciousnessConfigurationService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_configuration() {
        let service = ConsciousnessConfigurationService::new();
        let config = service.get_configuration();
        
        assert_eq!(config.bounds.frequency.min, 3.0);
        assert_eq!(config.bounds.frequency.max, 15.0);
        assert_eq!(config.bounds.frequency.default, 7.5);
        
        assert_eq!(config.bounds.coherence.min, 0.2);
        assert_eq!(config.bounds.coherence.max, 1.0);
        assert_eq!(config.bounds.coherence.default, 0.7);
    }

    #[test]
    fn test_validate_frequency() {
        let service = ConsciousnessConfigurationService::new();
        
        assert!(service.validate_frequency(7.5).is_ok());
        assert!(service.validate_frequency(3.0).is_ok());
        assert!(service.validate_frequency(15.0).is_ok());
        assert!(service.validate_frequency(2.0).is_err());
        assert!(service.validate_frequency(16.0).is_err());
    }

    #[test]
    fn test_validate_coherence() {
        let service = ConsciousnessConfigurationService::new();
        
        assert!(service.validate_coherence(0.7).is_ok());
        assert!(service.validate_coherence(0.2).is_ok());
        assert!(service.validate_coherence(1.0).is_ok());
        assert!(service.validate_coherence(0.1).is_err());
        assert!(service.validate_coherence(1.1).is_err());
    }

    #[test]
    fn test_get_event_weight() {
        let service = ConsciousnessConfigurationService::new();
        
        assert_eq!(service.get_event_significance_weight("goal_completion"), 0.8);
        assert_eq!(service.get_event_significance_weight("traumatic_encounter"), 1.0);
        assert_eq!(service.get_event_significance_weight("unknown_event"), 0.5); // Default
    }

    #[test]
    fn test_update_event_weight() {
        let mut service = ConsciousnessConfigurationService::new();
        
        let result = service.update_event_weight("custom_event".to_string(), 0.75).unwrap();
        assert!(result.success);
        assert_eq!(service.get_event_significance_weight("custom_event"), 0.75);
    }

    #[test]
    fn test_update_frequency_bounds() {
        let mut service = ConsciousnessConfigurationService::new();
        
        let result = service.update_frequency_bounds(4.0, 12.0, 8.0).unwrap();
        assert!(result.success);
        
        let config = service.get_configuration();
        assert_eq!(config.bounds.frequency.min, 4.0);
        assert_eq!(config.bounds.frequency.max, 12.0);
        assert_eq!(config.bounds.frequency.default, 8.0);
    }

    #[test]
    fn test_export_import_configuration() {
        let service = ConsciousnessConfigurationService::new();
        
        let json = service.export_configuration().unwrap();
        assert!(!json.is_empty());
        
        let mut new_service = ConsciousnessConfigurationService::new();
        let result = new_service.import_configuration(&json).unwrap();
        assert!(result.success);
        
        // Verify configurations match
        let original = service.get_configuration();
        let imported = new_service.get_configuration();
        assert_eq!(original.bounds.frequency.min, imported.bounds.frequency.min);
        assert_eq!(original.bounds.coherence.default, imported.bounds.coherence.default);
    }

    #[test]
    fn test_reset_to_defaults() {
        let mut service = ConsciousnessConfigurationService::new();
        
        // Modify configuration
        service.update_frequency_bounds(5.0, 10.0, 7.0).unwrap();
        
        // Reset
        service.reset_to_defaults();
        
        // Verify defaults restored
        let config = service.get_configuration();
        assert_eq!(config.bounds.frequency.min, 3.0);
        assert_eq!(config.bounds.frequency.max, 15.0);
    }
}
