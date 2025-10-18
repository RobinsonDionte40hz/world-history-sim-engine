//! Consciousness data migration service
//! 
//! Handles migration of consciousness data between different format versions,
//! providing backward compatibility and data validation/repair capabilities.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Migration version identifiers
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MigrationVersion {
    V1_0, // Simple frequency/coherence only
    V1_1, // Added behavioral state
    V1_2, // Added significant events and memories
    V2_0, // Full consciousness state with all features
}

impl MigrationVersion {
    pub fn as_str(&self) -> &str {
        match self {
            MigrationVersion::V1_0 => "1.0",
            MigrationVersion::V1_1 => "1.1",
            MigrationVersion::V1_2 => "1.2",
            MigrationVersion::V2_0 => "2.0",
        }
    }

    pub fn current() -> Self {
        MigrationVersion::V2_0
    }
}

/// Default consciousness parameters
pub struct DefaultConsciousnessParams {
    pub frequency: f64,
    pub coherence: f64,
    pub base_frequency: f64,
    pub base_coherence: f64,
    pub update_trigger_threshold: f64,
    pub last_update: u64,
}

impl Default for DefaultConsciousnessParams {
    fn default() -> Self {
        Self {
            frequency: 7.5,
            coherence: 0.5,
            base_frequency: 7.5,
            base_coherence: 0.5,
            update_trigger_threshold: 0.3,
            last_update: get_current_timestamp(),
        }
    }
}

/// Parameter validation bounds
pub struct ParameterBounds {
    pub frequency_min: f64,
    pub frequency_max: f64,
    pub coherence_min: f64,
    pub coherence_max: f64,
    pub threshold_min: f64,
    pub threshold_max: f64,
}

impl Default for ParameterBounds {
    fn default() -> Self {
        Self {
            frequency_min: 3.0,
            frequency_max: 15.0,
            coherence_min: 0.2,
            coherence_max: 1.0,
            threshold_min: 0.1,
            threshold_max: 1.0,
        }
    }
}

/// Behavioral state structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralState {
    pub energy: String,
    pub focus: String,
    pub mood: String,
    pub social_drive: f64,
    pub risk_tolerance: f64,
    pub ambition: f64,
}

impl Default for BehavioralState {
    fn default() -> Self {
        Self {
            energy: "moderate".to_string(),
            focus: "balanced".to_string(),
            mood: "content".to_string(),
            social_drive: 0.6,
            risk_tolerance: 0.5,
            ambition: 0.7,
        }
    }
}

/// Consciousness data structure (V2.0)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsciousnessData {
    pub base_frequency: f64,
    pub base_coherence: f64,
    pub update_trigger_threshold: f64,
    pub last_update: u64,
    pub behavioral_state: BehavioralState,
    pub significant_events: Vec<serde_json::Value>,
    pub significant_memories: Vec<serde_json::Value>,
    pub active_goals: Vec<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub migration_info: Option<MigrationInfo>,
}

/// Migration metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationInfo {
    pub migrated_at: String,
    pub from_version: String,
    pub to_version: String,
    pub migration_type: String,
}

/// Migration result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationResult {
    pub success: bool,
    pub migrated: bool,
    pub data: Option<ConsciousnessData>,
    pub from_version: Option<String>,
    pub to_version: Option<String>,
    pub message: String,
    pub error: Option<String>,
}

/// Validation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub errors: Vec<String>,
}

/// Repair result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepairResult {
    pub success: bool,
    pub data: ConsciousnessData,
    pub repairs_applied: usize,
    pub message: String,
}

/// Batch migration result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchMigrationResult {
    pub total: usize,
    pub successful: usize,
    pub failed: usize,
    pub migrated: usize,
    pub skipped: usize,
    pub results: Vec<MigrationResult>,
    pub errors: Vec<BatchError>,
}

/// Batch error details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchError {
    pub index: usize,
    pub error: String,
}

/// Rollback data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RollbackData {
    pub rollback_data: serde_json::Value,
    pub rollback_timestamp: String,
    pub rollback_version: String,
}

/// Migration statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationStatistics {
    pub total: usize,
    pub versions: HashMap<String, usize>,
    pub needs_migration: usize,
    pub corrupted: usize,
    pub valid: usize,
}

/// ConsciousnessMigrationService
pub struct ConsciousnessMigrationService {
    defaults: DefaultConsciousnessParams,
    bounds: ParameterBounds,
}

impl ConsciousnessMigrationService {
    /// Create a new migration service
    pub fn new() -> Self {
        Self {
            defaults: DefaultConsciousnessParams::default(),
            bounds: ParameterBounds::default(),
        }
    }

    /// Migrate consciousness data to the latest format
    pub fn migrate_consciousness_data(
        &self,
        input: serde_json::Value,
        repair_corrupted: bool,
    ) -> MigrationResult {
        // Detect current version/format
        let detected_version = self.detect_version(&input);

        // If already current version, validate and return
        if detected_version == MigrationVersion::V2_0 {
            match serde_json::from_value::<ConsciousnessData>(input.clone()) {
                Ok(data) => {
                    let validation = self.validate_consciousness_data(&data);
                    if !validation.is_valid {
                        if repair_corrupted {
                            let repaired = self.repair_corrupted_data(&data, validation.errors);
                            return MigrationResult {
                                success: true,
                                migrated: false,
                                data: Some(repaired.data),
                                from_version: Some(detected_version.as_str().to_string()),
                                to_version: Some(MigrationVersion::current().as_str().to_string()),
                                message: format!("Data repaired: {}", repaired.message),
                                error: None,
                            };
                        }
                        return MigrationResult {
                            success: false,
                            migrated: false,
                            data: None,
                            from_version: Some(detected_version.as_str().to_string()),
                            to_version: Some(MigrationVersion::current().as_str().to_string()),
                            message: String::new(),
                            error: Some(format!("Validation failed: {}", validation.errors.join(", "))),
                        };
                    }
                    return MigrationResult {
                        success: true,
                        migrated: false,
                        data: Some(data),
                        from_version: Some(detected_version.as_str().to_string()),
                        to_version: Some(MigrationVersion::current().as_str().to_string()),
                        message: "Data already in current format".to_string(),
                        error: None,
                    };
                }
                Err(e) => {
                    if repair_corrupted {
                        let default_data = self.create_default_consciousness_data();
                        return MigrationResult {
                            success: true,
                            migrated: true,
                            data: Some(default_data),
                            from_version: Some("unknown".to_string()),
                            to_version: Some(MigrationVersion::current().as_str().to_string()),
                            message: "Created default consciousness data for invalid input".to_string(),
                            error: None,
                        };
                    }
                    return MigrationResult {
                        success: false,
                        migrated: false,
                        data: None,
                        from_version: None,
                        to_version: None,
                        message: String::new(),
                        error: Some(format!("Invalid consciousness data: {}", e)),
                    };
                }
            }
        }

        // Perform migration based on detected version
        let migrated_data = match detected_version {
            MigrationVersion::V1_0 => self.migrate_from_v1_0(&input),
            MigrationVersion::V1_1 => self.migrate_from_v1_1(&input),
            MigrationVersion::V1_2 => self.migrate_from_v1_2(&input),
            MigrationVersion::V2_0 => {
                // Already handled above
                return MigrationResult {
                    success: false,
                    migrated: false,
                    data: None,
                    from_version: None,
                    to_version: None,
                    message: String::new(),
                    error: Some("Unreachable code path".to_string()),
                };
            }
        };

        let mut migrated_data = migrated_data;

        // Validate migrated data
        let validation = self.validate_consciousness_data(&migrated_data);
        if !validation.is_valid {
            if repair_corrupted {
                migrated_data = self.repair_corrupted_data(&migrated_data, validation.errors).data;
            } else {
                return MigrationResult {
                    success: false,
                    migrated: false,
                    data: None,
                    from_version: Some(detected_version.as_str().to_string()),
                    to_version: Some(MigrationVersion::current().as_str().to_string()),
                    message: String::new(),
                    error: Some(format!("Migrated data validation failed: {}", validation.errors.join(", "))),
                };
            }
        }

        // Add migration metadata
        migrated_data.migration_info = Some(MigrationInfo {
            migrated_at: get_current_iso_timestamp(),
            from_version: detected_version.as_str().to_string(),
            to_version: MigrationVersion::current().as_str().to_string(),
            migration_type: "consciousness_data".to_string(),
        });

        MigrationResult {
            success: true,
            migrated: true,
            data: Some(migrated_data),
            from_version: Some(detected_version.as_str().to_string()),
            to_version: Some(MigrationVersion::current().as_str().to_string()),
            message: format!("Migrated from {} to {}", detected_version.as_str(), MigrationVersion::current().as_str()),
            error: None,
        }
    }

    /// Detect the version/format of consciousness data
    pub fn detect_version(&self, data: &serde_json::Value) -> MigrationVersion {
        let obj = match data.as_object() {
            Some(o) => o,
            None => return MigrationVersion::V1_0,
        };

        // Check for version metadata first
        if let Some(migration_info) = obj.get("_migrationInfo") {
            if let Some(to_version) = migration_info.get("toVersion") {
                if let Some(version_str) = to_version.as_str() {
                    return match version_str {
                        "2.0" => MigrationVersion::V2_0,
                        "1.2" => MigrationVersion::V1_2,
                        "1.1" => MigrationVersion::V1_1,
                        "1.0" => MigrationVersion::V1_0,
                        _ => MigrationVersion::V1_0,
                    };
                }
            }
        }

        // V2.0: Full consciousness state with all features
        if obj.contains_key("baseFrequency")
            && obj.contains_key("baseCoherence")
            && obj.contains_key("behavioralState")
            && obj.contains_key("significantEvents")
            && obj.contains_key("significantMemories")
        {
            return MigrationVersion::V2_0;
        }

        // V1.2: Added significant events and memories
        if obj.contains_key("significantEvents") || obj.contains_key("significantMemories") {
            return MigrationVersion::V1_2;
        }

        // V1.1: Added behavioral state
        if obj.contains_key("behavioralState") {
            return MigrationVersion::V1_1;
        }

        // V1.0: Simple frequency/coherence only
        if obj.contains_key("frequency") || obj.contains_key("coherence") {
            return MigrationVersion::V1_0;
        }

        // Unknown format
        MigrationVersion::V1_0
    }

    /// Migrate from V1.0 to V2.0
    fn migrate_from_v1_0(&self, data: &serde_json::Value) -> ConsciousnessData {
        let obj = data.as_object();
        
        let base_frequency = obj
            .and_then(|o| o.get("frequency"))
            .and_then(|v| v.as_f64())
            .map(|f| self.clamp_value(f, self.bounds.frequency_min, self.bounds.frequency_max))
            .unwrap_or(self.defaults.base_frequency);

        let base_coherence = obj
            .and_then(|o| o.get("coherence"))
            .and_then(|v| v.as_f64())
            .map(|c| self.clamp_value(c, self.bounds.coherence_min, self.bounds.coherence_max))
            .unwrap_or(self.defaults.base_coherence);

        let behavioral_state = self.generate_behavioral_state_from_parameters(base_frequency, base_coherence);

        ConsciousnessData {
            base_frequency,
            base_coherence,
            update_trigger_threshold: self.defaults.update_trigger_threshold,
            last_update: self.defaults.last_update,
            behavioral_state,
            significant_events: vec![],
            significant_memories: vec![],
            active_goals: vec![],
            migration_info: None,
        }
    }

    /// Migrate from V1.1 to V2.0
    fn migrate_from_v1_1(&self, data: &serde_json::Value) -> ConsciousnessData {
        let obj = data.as_object();
        
        let base_frequency = obj
            .and_then(|o| o.get("frequency"))
            .and_then(|v| v.as_f64())
            .unwrap_or(self.defaults.base_frequency);

        let base_coherence = obj
            .and_then(|o| o.get("coherence"))
            .and_then(|v| v.as_f64())
            .unwrap_or(self.defaults.base_coherence);

        let behavioral_state = obj
            .and_then(|o| o.get("behavioralState"))
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_else(|| self.generate_behavioral_state_from_parameters(base_frequency, base_coherence));

        let last_update = obj
            .and_then(|o| o.get("lastUpdate"))
            .and_then(|v| v.as_u64())
            .unwrap_or(self.defaults.last_update);

        let update_trigger_threshold = obj
            .and_then(|o| o.get("updateTriggerThreshold"))
            .and_then(|v| v.as_f64())
            .unwrap_or(self.defaults.update_trigger_threshold);

        ConsciousnessData {
            base_frequency,
            base_coherence,
            update_trigger_threshold,
            last_update,
            behavioral_state,
            significant_events: vec![],
            significant_memories: vec![],
            active_goals: vec![],
            migration_info: None,
        }
    }

    /// Migrate from V1.2 to V2.0
    fn migrate_from_v1_2(&self, data: &serde_json::Value) -> ConsciousnessData {
        let mut consciousness_data = self.migrate_from_v1_1(data);
        
        let obj = data.as_object();
        
        if let Some(o) = obj {
            if let Some(events) = o.get("significantEvents").and_then(|v| v.as_array()) {
                consciousness_data.significant_events = events.clone();
            }
            
            if let Some(memories) = o.get("significantMemories").and_then(|v| v.as_array()) {
                consciousness_data.significant_memories = memories.clone();
            }
            
            if let Some(goals) = o.get("activeGoals").and_then(|v| v.as_array()) {
                consciousness_data.active_goals = goals.clone();
            }
        }

        consciousness_data
    }

    /// Generate behavioral state from consciousness parameters
    fn generate_behavioral_state_from_parameters(&self, frequency: f64, coherence: f64) -> BehavioralState {
        BehavioralState {
            energy: self.map_frequency_to_energy(frequency),
            focus: self.map_coherence_to_focus(coherence),
            mood: self.calculate_mood_from_state(frequency, coherence),
            social_drive: ((frequency - 4.0) / 8.0).max(0.0).min(1.0),
            risk_tolerance: ((frequency - 6.0) / 6.0).max(0.0).min(1.0),
            ambition: (coherence * (frequency / 10.0)).max(0.0).min(1.0),
        }
    }

    /// Map frequency to energy level
    fn map_frequency_to_energy(&self, frequency: f64) -> String {
        if frequency < 6.0 {
            "low".to_string()
        } else if frequency > 10.0 {
            "high".to_string()
        } else {
            "moderate".to_string()
        }
    }

    /// Map coherence to focus level
    fn map_coherence_to_focus(&self, coherence: f64) -> String {
        if coherence < 0.5 {
            "scattered".to_string()
        } else if coherence > 0.8 {
            "focused".to_string()
        } else {
            "balanced".to_string()
        }
    }

    /// Calculate mood from frequency and coherence
    fn calculate_mood_from_state(&self, frequency: f64, coherence: f64) -> String {
        let mood_score = (frequency / 15.0) + (coherence * 0.5);

        if mood_score < 0.5 {
            "depressed".to_string()
        } else if mood_score < 0.75 {
            "content".to_string()
        } else if mood_score < 1.0 {
            "optimistic".to_string()
        } else {
            "excited".to_string()
        }
    }

    /// Clamp value to bounds
    fn clamp_value(&self, value: f64, min: f64, max: f64) -> f64 {
        if !value.is_finite() {
            return min + (max - min) / 2.0; // Return midpoint as default
        }
        value.max(min).min(max)
    }

    /// Validate consciousness data structure and values
    pub fn validate_consciousness_data(&self, data: &ConsciousnessData) -> ValidationResult {
        let mut errors = Vec::new();

        // Validate frequency
        if !data.base_frequency.is_finite()
            || data.base_frequency < self.bounds.frequency_min
            || data.base_frequency > self.bounds.frequency_max
        {
            errors.push(format!(
                "baseFrequency must be between {} and {}",
                self.bounds.frequency_min, self.bounds.frequency_max
            ));
        }

        // Validate coherence
        if !data.base_coherence.is_finite()
            || data.base_coherence < self.bounds.coherence_min
            || data.base_coherence > self.bounds.coherence_max
        {
            errors.push(format!(
                "baseCoherence must be between {} and {}",
                self.bounds.coherence_min, self.bounds.coherence_max
            ));
        }

        // Validate update trigger threshold
        if !data.update_trigger_threshold.is_finite()
            || data.update_trigger_threshold < self.bounds.threshold_min
            || data.update_trigger_threshold > self.bounds.threshold_max
        {
            errors.push(format!(
                "updateTriggerThreshold must be between {} and {}",
                self.bounds.threshold_min, self.bounds.threshold_max
            ));
        }

        ValidationResult {
            is_valid: errors.is_empty(),
            errors,
        }
    }

    /// Repair corrupted consciousness data
    pub fn repair_corrupted_data(
        &self,
        data: &ConsciousnessData,
        _validation_errors: Vec<String>,
    ) -> RepairResult {
        let mut repaired = data.clone();
        let mut repairs = 0;

        // Repair frequency
        if !repaired.base_frequency.is_finite()
            || repaired.base_frequency < self.bounds.frequency_min
            || repaired.base_frequency > self.bounds.frequency_max
        {
            repaired.base_frequency = self.clamp_value(
                repaired.base_frequency,
                self.bounds.frequency_min,
                self.bounds.frequency_max,
            );
            repairs += 1;
        }

        // Repair coherence
        if !repaired.base_coherence.is_finite()
            || repaired.base_coherence < self.bounds.coherence_min
            || repaired.base_coherence > self.bounds.coherence_max
        {
            repaired.base_coherence = self.clamp_value(
                repaired.base_coherence,
                self.bounds.coherence_min,
                self.bounds.coherence_max,
            );
            repairs += 1;
        }

        // Repair threshold
        if !repaired.update_trigger_threshold.is_finite()
            || repaired.update_trigger_threshold < self.bounds.threshold_min
            || repaired.update_trigger_threshold > self.bounds.threshold_max
        {
            repaired.update_trigger_threshold = self.defaults.update_trigger_threshold;
            repairs += 1;
        }

        RepairResult {
            success: true,
            data: repaired,
            repairs_applied: repairs,
            message: format!("Applied {} repairs to corrupted consciousness data", repairs),
        }
    }

    /// Create default consciousness data
    fn create_default_consciousness_data(&self) -> ConsciousnessData {
        ConsciousnessData {
            base_frequency: self.defaults.base_frequency,
            base_coherence: self.defaults.base_coherence,
            update_trigger_threshold: self.defaults.update_trigger_threshold,
            last_update: self.defaults.last_update,
            behavioral_state: BehavioralState::default(),
            significant_events: vec![],
            significant_memories: vec![],
            active_goals: vec![],
            migration_info: None,
        }
    }

    /// Batch migrate multiple consciousness data objects
    pub fn batch_migrate_consciousness_data(
        &self,
        data_array: Vec<serde_json::Value>,
        repair_corrupted: bool,
    ) -> BatchMigrationResult {
        let total = data_array.len();
        let mut successful = 0;
        let mut failed = 0;
        let mut migrated = 0;
        let mut skipped = 0;
        let mut results = Vec::new();
        let mut errors = Vec::new();

        for (index, data) in data_array.into_iter().enumerate() {
            let result = self.migrate_consciousness_data(data, repair_corrupted);
            
            if result.success {
                successful += 1;
                if result.migrated {
                    migrated += 1;
                } else {
                    skipped += 1;
                }
            } else {
                failed += 1;
                errors.push(BatchError {
                    index,
                    error: result.error.clone().unwrap_or_default(),
                });
            }
            
            results.push(result);
        }

        BatchMigrationResult {
            total,
            successful,
            failed,
            migrated,
            skipped,
            results,
            errors,
        }
    }

    /// Create rollback data for consciousness migration
    pub fn create_rollback_data(&self, original_data: serde_json::Value) -> RollbackData {
        let version = self.detect_version(&original_data);
        
        RollbackData {
            rollback_data: original_data,
            rollback_timestamp: get_current_iso_timestamp(),
            rollback_version: version.as_str().to_string(),
        }
    }

    /// Rollback consciousness data to previous version
    pub fn rollback_consciousness_data(&self, rollback_info: &RollbackData) -> MigrationResult {
        MigrationResult {
            success: true,
            migrated: false,
            data: serde_json::from_value(rollback_info.rollback_data.clone()).ok(),
            from_version: None,
            to_version: Some(rollback_info.rollback_version.clone()),
            message: format!("Rolled back to version {}", rollback_info.rollback_version),
            error: None,
        }
    }

    /// Get migration statistics for consciousness data
    pub fn get_migration_statistics(&self, data_array: &[serde_json::Value]) -> MigrationStatistics {
        let mut versions = HashMap::new();
        let mut needs_migration = 0;
        let mut corrupted = 0;
        let mut valid = 0;

        for data in data_array {
            let version = self.detect_version(data);
            *versions.entry(version.as_str().to_string()).or_insert(0) += 1;

            if version != MigrationVersion::V2_0 {
                needs_migration += 1;
            }

            // Try to parse and validate
            if let Ok(consciousness_data) = serde_json::from_value::<ConsciousnessData>(data.clone()) {
                let validation = self.validate_consciousness_data(&consciousness_data);
                if validation.is_valid {
                    valid += 1;
                } else {
                    corrupted += 1;
                }
            } else {
                corrupted += 1;
            }
        }

        MigrationStatistics {
            total: data_array.len(),
            versions,
            needs_migration,
            corrupted,
            valid,
        }
    }
}

impl Default for ConsciousnessMigrationService {
    fn default() -> Self {
        Self::new()
    }
}

// Helper functions

fn get_current_timestamp() -> u64 {
    // In production, use proper timestamp function
    // For WASM, this would be js_sys::Date::now() as u64
    0
}

fn get_current_iso_timestamp() -> String {
    // In production, return ISO 8601 timestamp
    // For now, return placeholder
    "2025-10-17T00:00:00Z".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_detect_version() {
        let service = ConsciousnessMigrationService::new();

        let v1_0_data = json!({
            "frequency": 7.5,
            "coherence": 0.5
        });
        assert_eq!(service.detect_version(&v1_0_data), MigrationVersion::V1_0);

        let v2_0_data = json!({
            "baseFrequency": 7.5,
            "baseCoherence": 0.5,
            "behavioralState": {},
            "significantEvents": [],
            "significantMemories": []
        });
        assert_eq!(service.detect_version(&v2_0_data), MigrationVersion::V2_0);
    }

    #[test]
    fn test_migrate_v1_0_to_v2_0() {
        let service = ConsciousnessMigrationService::new();
        
        let v1_0_data = json!({
            "frequency": 8.5,
            "coherence": 0.7
        });

        let result = service.migrate_consciousness_data(v1_0_data, false);
        assert!(result.success);
        assert!(result.migrated);
        assert!(result.data.is_some());
        
        let data = result.data.unwrap();
        assert_eq!(data.base_frequency, 8.5);
        assert_eq!(data.base_coherence, 0.7);
    }

    #[test]
    fn test_validate_consciousness_data() {
        let service = ConsciousnessMigrationService::new();
        
        let valid_data = ConsciousnessData {
            base_frequency: 7.5,
            base_coherence: 0.5,
            update_trigger_threshold: 0.3,
            last_update: 0,
            behavioral_state: BehavioralState::default(),
            significant_events: vec![],
            significant_memories: vec![],
            active_goals: vec![],
            migration_info: None,
        };

        let result = service.validate_consciousness_data(&valid_data);
        assert!(result.is_valid);
        assert!(result.errors.is_empty());
    }

    #[test]
    fn test_repair_corrupted_data() {
        let service = ConsciousnessMigrationService::new();
        
        let corrupted_data = ConsciousnessData {
            base_frequency: 100.0, // Out of bounds
            base_coherence: -0.5,  // Out of bounds
            update_trigger_threshold: 0.3,
            last_update: 0,
            behavioral_state: BehavioralState::default(),
            significant_events: vec![],
            significant_memories: vec![],
            active_goals: vec![],
            migration_info: None,
        };

        let result = service.repair_corrupted_data(&corrupted_data, vec![]);
        assert!(result.success);
        assert!(result.repairs_applied > 0);
        assert!(result.data.base_frequency >= 3.0 && result.data.base_frequency <= 15.0);
        assert!(result.data.base_coherence >= 0.2 && result.data.base_coherence <= 1.0);
    }
}
