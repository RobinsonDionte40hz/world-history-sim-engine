//! Consciousness Inspection Service
//!
//! Provides debugging utilities for behavioral state inspection, decision factor traceability,
//! significant events history display, and diagnostic tools for behavioral inconsistency detection.
//! Implements comprehensive analysis tools for consciousness system monitoring and tuning.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::types::character::Character;
use crate::types::consciousness::{BehavioralState, EnergyLevel, FocusLevel};

/// Behavioral component analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralComponentAnalysis {
    pub value: String,
    pub component_type: String,
    pub category: String,
    pub interpretation: String,
    pub implications: Vec<String>,
}

/// Numeric component analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NumericComponentAnalysis {
    pub value: f64,
    pub component_type: String,
    pub category: String,
    pub range: [f64; 2],
    pub percentile: u8,
    pub interpretation: String,
    pub implications: Vec<String>,
}

/// Formatted event display
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormattedEvent {
    pub event_type: String,
    pub significance: f64,
    pub timestamp: u64,
    pub outcome: String,
    pub emotional_impact: f64,
    pub description: String,
    pub impact: EventImpact,
    pub time_ago: String,
}

/// Event impact details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventImpact {
    pub consciousness_impact: f64,
    pub behavioral_impact: f64,
    pub memory_impact: String,
}

/// Memory summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySummary {
    pub total_memories: usize,
    pub average_significance: f64,
    pub memory_types: HashMap<String, usize>,
    pub recent_memories: Vec<RecentMemory>,
}

/// Recent memory info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecentMemory {
    pub interaction_type: String,
    pub significance: f64,
    pub outcome: String,
    pub timestamp: u64,
}

/// Consistency check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsistencyCheck {
    pub is_consistent: bool,
    pub consistency_score: f64,
    pub issues: Vec<ConsistencyIssue>,
    pub recommendations: Vec<String>,
}

/// Consistency issue
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsistencyIssue {
    pub issue_type: String,
    pub expected: String,
    pub actual: String,
    pub severity: String,
}

/// Behavioral state inspection result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralStateInspection {
    pub character_id: String,
    pub character_name: String,
    pub timestamp: u64,
    pub consciousness_parameters: ConsciousnessParameters,
    pub behavioral_state: BehavioralStateSnapshot,
    pub behavioral_analysis: BehavioralAnalysis,
    pub recent_events: Vec<FormattedEvent>,
    pub memory_summary: MemorySummary,
    pub consistency_check: ConsistencyCheck,
}

/// Consciousness parameters snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsciousnessParameters {
    pub base_frequency: f64,
    pub base_coherence: f64,
    pub last_update: u64,
    pub update_trigger_threshold: f64,
}

/// Behavioral state snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralStateSnapshot {
    pub energy: String,
    pub focus: String,
    pub mood: String,
    pub social_drive: f64,
    pub risk_tolerance: f64,
    pub ambition: f64,
}

/// Behavioral analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralAnalysis {
    pub energy_level: BehavioralComponentAnalysis,
    pub focus_level: BehavioralComponentAnalysis,
    pub mood_state: BehavioralComponentAnalysis,
    pub social_engagement: NumericComponentAnalysis,
    pub risk_profile: NumericComponentAnalysis,
    pub ambition_level: NumericComponentAnalysis,
}

/// Decision factor breakdown
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionFactorBreakdown {
    pub base_factor: f64,
    pub behavioral_modifier: f64,
    pub personality_modifier: f64,
    pub memory_modifier: f64,
    pub contextual_modifier: f64,
    pub steps: Vec<CalculationStep>,
}

/// Calculation step
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculationStep {
    pub step: String,
    pub value: f64,
    pub description: String,
}

/// Decision factor trace result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionFactorTrace {
    pub character_id: String,
    pub character_name: String,
    pub interaction_type: String,
    pub timestamp: u64,
    pub calculation_time_ms: f64,
    pub final_decision_factor: f64,
    pub breakdown: DecisionFactorBreakdown,
    pub component_analysis: ComponentAnalysis,
    pub recommendations: Vec<Recommendation>,
    pub relevant_memories: Vec<RelevantMemory>,
}

/// Component analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentAnalysis {
    pub behavioral_influence: f64,
    pub personality_influence: f64,
    pub memory_influence: f64,
    pub contextual_influence: f64,
}

/// Recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recommendation {
    pub recommendation_type: String,
    pub message: String,
    pub suggestion: String,
}

/// Relevant memory for decision
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelevantMemory {
    pub interaction_type: String,
    pub outcome: String,
    pub significance: f64,
    pub emotional_impact: f64,
    pub timestamp: u64,
    pub influence: f64,
}

/// Events history display
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventsHistoryDisplay {
    pub character_id: String,
    pub character_name: String,
    pub timestamp: u64,
    pub total_events: usize,
    pub filtered_events: usize,
    pub displayed_events: usize,
    pub events: Vec<FormattedEvent>,
    pub analysis: EventsAnalysis,
    pub patterns: Vec<EventPattern>,
    pub impact_summary: EventsImpactSummary,
}

/// Events analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventsAnalysis {
    pub average_significance: f64,
    pub event_types: HashMap<String, usize>,
    pub trends: Vec<String>,
}

/// Event pattern
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventPattern {
    pub pattern_type: String,
    pub event_type: Option<String>,
    pub frequency: Option<usize>,
    pub description: String,
}

/// Events impact summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventsImpactSummary {
    pub total_significance: f64,
    pub positive_events: usize,
    pub negative_events: usize,
    pub neutral_events: usize,
    pub average_emotional_impact: f64,
}

/// Diagnostic report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticReport {
    pub character_id: String,
    pub character_name: String,
    pub timestamp: u64,
    pub overall_health: String,
    pub critical_issues: usize,
    pub warning_count: usize,
    pub inconsistencies: Vec<DiagnosticIssue>,
    pub warnings: Vec<DiagnosticIssue>,
    pub recommendations: Vec<DiagnosticRecommendation>,
    pub system_metrics: SystemMetrics,
    pub performance_indicators: PerformanceIndicators,
}

/// Diagnostic issue
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticIssue {
    pub issue_type: String,
    pub parameter: Option<String>,
    pub value: Option<f64>,
    pub expected_range: Option<[f64; 2]>,
    pub severity: String,
    pub message: Option<String>,
}

/// Diagnostic recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticRecommendation {
    pub priority: String,
    pub category: String,
    pub action: String,
    pub rationale: String,
}

/// System metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub memory_usage: usize,
    pub event_history: usize,
    pub last_update: u64,
}

/// Performance indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceIndicators {
    pub update_frequency: String,
    pub memory_efficiency: String,
    pub computational_load: String,
}

/// Events history filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventsFilter {
    pub event_type: Option<String>,
    pub min_significance: Option<f64>,
    pub time_range: Option<TimeRange>,
}

/// Time range filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: u64,
    pub end: u64,
}

/// Consciousness Inspection Service
pub struct ConsciousnessInspectionService {
    // Service dependencies would go here in a full implementation
}

impl ConsciousnessInspectionService {
    /// Create a new inspection service
    pub fn new() -> Self {
        Self {}
    }

    /// Get comprehensive behavioral state inspection for a character
    pub fn inspect_behavioral_state(&self, character: &Character) -> Result<BehavioralStateInspection, String> {
        let consciousness = &character.consciousness;
        let behavioral_state = character.behavioral_state.as_ref()
            .ok_or("Character missing behavioral state")?;

        Ok(BehavioralStateInspection {
            character_id: character.id.clone(),
            character_name: character.id.clone(),
            timestamp: Self::current_timestamp(),
            consciousness_parameters: Self::extract_consciousness_parameters(consciousness),
            behavioral_state: Self::extract_behavioral_state_snapshot(behavioral_state),
            behavioral_analysis: self.analyze_behavioral_state(behavioral_state),
            recent_events: self.get_recent_significant_events(character, 5),
            memory_summary: self.get_memory_summary(character),
            consistency_check: self.check_behavioral_consistency(character),
        })
    }

    /// Trace decision factor calculation for detailed analysis
    pub fn trace_decision_factor(
        &self,
        character: &Character,
        interaction_type: &str,
        _context: HashMap<String, String>,
    ) -> Result<DecisionFactorTrace, String> {
        let start_time = Self::current_timestamp_high_precision();
        
        // Calculate decision factor (simplified for now)
        let decision_factor = 1.0; // Would integrate with actual calculation
        
        let end_time = Self::current_timestamp_high_precision();

        let breakdown = self.calculate_decision_factor_breakdown(character, interaction_type);

        Ok(DecisionFactorTrace {
            character_id: character.id.clone(),
            character_name: character.id.clone(),
            interaction_type: interaction_type.to_string(),
            timestamp: Self::current_timestamp(),
            calculation_time_ms: end_time - start_time,
            final_decision_factor: decision_factor,
            breakdown: breakdown.clone(),
            component_analysis: ComponentAnalysis {
                behavioral_influence: breakdown.behavioral_modifier,
                personality_influence: breakdown.personality_modifier,
                memory_influence: breakdown.memory_modifier,
                contextual_influence: breakdown.contextual_modifier,
            },
            recommendations: self.generate_decision_recommendations(&breakdown, decision_factor),
            relevant_memories: self.get_relevant_memories_for_decision(character, interaction_type),
        })
    }

    /// Display significant events history with analysis
    pub fn display_significant_events_history(
        &self,
        character: &Character,
        limit: usize,
        filters: EventsFilter,
    ) -> Result<EventsHistoryDisplay, String> {
        // Access significant_events from consciousness and convert to FormattedEvent
        let events = &character.consciousness.significant_events;
        let formatted_events: Vec<FormattedEvent> = events.iter()
            .map(|e| FormattedEvent {
                timestamp: e.timestamp,
                event_type: format!("{:?}", e.event_type),
                significance: e.significance,
                emotional_impact: e.emotional_impact,
                description: format!("{:?} event", e.event_type),
                outcome: "completed".to_string(),
                impact: EventImpact {
                    consciousness_impact: e.consciousness_change.frequency_delta,
                    behavioral_impact: e.emotional_impact,
                    memory_impact: "moderate".to_string(),
                },
                time_ago: Self::format_time_ago(e.timestamp),
            })
            .collect();
        
        let filtered_events = self.apply_event_filters(formatted_events, &filters);
        
        let displayed = filtered_events.iter()
            .take(limit)
            .map(|e| self.format_event_for_display(e))
            .collect::<Vec<_>>();

        Ok(EventsHistoryDisplay {
            character_id: character.id.clone(),
            character_name: character.id.clone(),
            timestamp: Self::current_timestamp(),
            total_events: events.len(),
            filtered_events: filtered_events.len(),
            displayed_events: displayed.len(),
            events: displayed.clone(),
            analysis: self.analyze_events_history(&displayed),
            patterns: self.identify_event_patterns(&displayed),
            impact_summary: self.calculate_events_impact(&displayed),
        })
    }

    /// Detect behavioral inconsistencies and provide diagnostics
    pub fn detect_behavioral_inconsistencies(&self, character: &Character) -> Result<DiagnosticReport, String> {
        let mut inconsistencies = Vec::new();
        let mut warnings = Vec::new();

        // Check consciousness parameter bounds
        let parameter_check = self.check_consciousness_parameter_bounds(character);
        if !parameter_check.is_valid {
            inconsistencies.extend(parameter_check.issues);
        }

        // Check behavioral state coherence
        let coherence_check = self.check_behavioral_state_coherence(character);
        if !coherence_check.is_valid {
            inconsistencies.extend(coherence_check.issues);
        }

        // Check memory consistency
        let memory_check = self.check_memory_consistency(character);
        if !memory_check.is_valid {
            warnings.extend(memory_check.issues);
        }

        // Check event history consistency
        let event_check = self.check_event_history_consistency(character);
        if !event_check.is_valid {
            warnings.extend(event_check.issues);
        }

        let recommendations = self.generate_diagnostic_recommendations(&inconsistencies, &warnings, character);

        Ok(DiagnosticReport {
            character_id: character.id.clone(),
            character_name: character.id.clone(),
            timestamp: Self::current_timestamp(),
            overall_health: if inconsistencies.is_empty() {
                "healthy".to_string()
            } else {
                "issues_detected".to_string()
            },
            critical_issues: inconsistencies.len(),
            warning_count: warnings.len(),
            inconsistencies,
            warnings,
            recommendations,
            system_metrics: self.calculate_system_metrics(character),
            performance_indicators: self.calculate_performance_indicators(character),
        })
    }

    // Helper methods
    
    fn current_timestamp() -> u64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64
    }

    fn current_timestamp_high_precision() -> f64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        let duration = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap();
        duration.as_secs() as f64 * 1000.0 + duration.subsec_nanos() as f64 / 1_000_000.0
    }

    fn format_time_ago(timestamp: u64) -> String {
        let now = Self::current_timestamp();
        if now < timestamp {
            return "future event".to_string();
        }
        
        let diff_ms = now - timestamp;
        let seconds = diff_ms / 1000;
        let minutes = seconds / 60;
        let hours = minutes / 60;
        let days = hours / 24;
        
        if days > 0 {
            format!("{} days ago", days)
        } else if hours > 0 {
            format!("{} hours ago", hours)
        } else if minutes > 0 {
            format!("{} minutes ago", minutes)
        } else {
            format!("{} seconds ago", seconds)
        }
    }

    fn extract_consciousness_parameters(consciousness: &crate::types::consciousness::ConsciousnessStateInternal) -> ConsciousnessParameters {
        ConsciousnessParameters {
            base_frequency: consciousness.base_frequency,
            base_coherence: consciousness.base_coherence,
            last_update: consciousness.last_update,
            // Default from JavaScript: update_trigger_threshold = 0.3
            // Or calculate: 0.1 + (consciousness.emotional_coherence * 0.4)
            update_trigger_threshold: 0.1 + (consciousness.emotional_coherence * 0.4),
        }
    }

    fn extract_behavioral_state_snapshot(behavioral_state: &BehavioralState) -> BehavioralStateSnapshot {
        BehavioralStateSnapshot {
            energy: format!("{:?}", behavioral_state.energy),
            focus: format!("{:?}", behavioral_state.focus),
            mood: format!("{:?}", behavioral_state.mood),
            social_drive: behavioral_state.social_drive,
            risk_tolerance: behavioral_state.risk_tolerance,
            ambition: behavioral_state.ambition,
        }
    }

    fn analyze_behavioral_state(&self, behavioral_state: &BehavioralState) -> BehavioralAnalysis {
        BehavioralAnalysis {
            energy_level: self.analyze_behavioral_component(&format!("{:?}", behavioral_state.energy), "energy"),
            focus_level: self.analyze_behavioral_component(&format!("{:?}", behavioral_state.focus), "focus"),
            mood_state: self.analyze_behavioral_component(&format!("{:?}", behavioral_state.mood), "mood"),
            social_engagement: self.analyze_numeric_component(behavioral_state.social_drive, "socialDrive"),
            risk_profile: self.analyze_numeric_component(behavioral_state.risk_tolerance, "riskTolerance"),
            ambition_level: self.analyze_numeric_component(behavioral_state.ambition, "ambition"),
        }
    }

    fn analyze_behavioral_component(&self, value: &str, component_type: &str) -> BehavioralComponentAnalysis {
        let (interpretation, implications) = match component_type {
            "energy" => (Self::interpret_energy_level(value), Self::get_energy_implications(value)),
            "focus" => (Self::interpret_focus_level(value), Self::get_focus_implications(value)),
            "mood" => (Self::interpret_mood_state(value), Self::get_mood_implications(value)),
            _ => (format!("Unknown behavioral component: {}", component_type), vec![]),
        };

        BehavioralComponentAnalysis {
            value: value.to_string(),
            component_type: component_type.to_string(),
            category: "categorical".to_string(),
            interpretation,
            implications,
        }
    }

    fn analyze_numeric_component(&self, value: f64, component_type: &str) -> NumericComponentAnalysis {
        let (interpretation, implications) = match component_type {
            "socialDrive" => (Self::interpret_social_drive(value), Self::get_social_drive_implications(value)),
            "riskTolerance" => (Self::interpret_risk_tolerance(value), Self::get_risk_tolerance_implications(value)),
            "ambition" => (Self::interpret_ambition(value), Self::get_ambition_implications(value)),
            _ => (format!("Unknown numeric component: {}", component_type), vec![]),
        };

        NumericComponentAnalysis {
            value,
            component_type: component_type.to_string(),
            category: "numeric".to_string(),
            range: [0.0, 1.0],
            percentile: (value * 100.0).round() as u8,
            interpretation,
            implications,
        }
    }

    // Interpretation methods
    
    fn interpret_energy_level(energy: &str) -> String {
        match energy {
            "VeryLow" | "Low" => "Character has reduced activity and motivation".to_string(),
            "Moderate" => "Character has balanced energy levels".to_string(),
            "High" | "VeryHigh" => "Character is highly active and energetic".to_string(),
            _ => "Unknown energy level".to_string(),
        }
    }

    fn get_energy_implications(energy: &str) -> Vec<String> {
        match energy {
            "VeryLow" | "Low" => vec![
                "Reduced interaction frequency".to_string(),
                "Preference for rest activities".to_string(),
            ],
            "Moderate" => vec![
                "Balanced activity selection".to_string(),
                "Normal interaction patterns".to_string(),
            ],
            "High" | "VeryHigh" => vec![
                "Increased interaction frequency".to_string(),
                "Preference for active pursuits".to_string(),
            ],
            _ => vec![],
        }
    }

    fn interpret_focus_level(focus: &str) -> String {
        match focus {
            "Scattered" => "Character has difficulty concentrating on tasks".to_string(),
            "Balanced" => "Character maintains good focus on activities".to_string(),
            "Focused" | "Hyperfocused" => "Character shows intense concentration abilities".to_string(),
            _ => "Unknown focus level".to_string(),
        }
    }

    fn get_focus_implications(focus: &str) -> Vec<String> {
        match focus {
            "Scattered" => vec![
                "Difficulty completing complex tasks".to_string(),
                "Easily distracted".to_string(),
            ],
            "Balanced" => vec![
                "Good task completion rates".to_string(),
                "Adaptable attention".to_string(),
            ],
            "Focused" | "Hyperfocused" => vec![
                "Excellent at complex tasks".to_string(),
                "May ignore distractions".to_string(),
            ],
            _ => vec![],
        }
    }

    fn interpret_mood_state(mood: &str) -> String {
        match mood {
            "Depressed" | "Anxious" => "Character experiences negative emotional state".to_string(),
            "Content" | "Calm" => "Character maintains stable, positive emotional state".to_string(),
            "Optimistic" | "Happy" => "Character shows positive outlook and enthusiasm".to_string(),
            "Excited" | "Euphoric" => "Character displays high positive emotional energy".to_string(),
            _ => "Unknown mood state".to_string(),
        }
    }

    fn get_mood_implications(mood: &str) -> Vec<String> {
        match mood {
            "Depressed" | "Anxious" => vec![
                "Reduced social interactions".to_string(),
                "Negative decision bias".to_string(),
            ],
            "Content" | "Calm" => vec![
                "Stable social relationships".to_string(),
                "Balanced decision making".to_string(),
            ],
            "Optimistic" | "Happy" => vec![
                "Positive social interactions".to_string(),
                "Risk-taking tendency".to_string(),
            ],
            "Excited" | "Euphoric" => vec![
                "High social engagement".to_string(),
                "Impulsive decisions".to_string(),
            ],
            _ => vec![],
        }
    }

    fn interpret_social_drive(value: f64) -> String {
        if value < 0.3 {
            "Low social motivation - prefers solitude".to_string()
        } else if value < 0.7 {
            "Moderate social engagement - balanced social needs".to_string()
        } else {
            "High social drive - seeks frequent social interaction".to_string()
        }
    }

    fn get_social_drive_implications(value: f64) -> Vec<String> {
        if value < 0.3 {
            vec![
                "Avoids crowds".to_string(),
                "Prefers one-on-one interactions".to_string(),
            ]
        } else if value < 0.7 {
            vec![
                "Balanced social calendar".to_string(),
                "Comfortable in groups".to_string(),
            ]
        } else {
            vec![
                "Seeks social leadership".to_string(),
                "Thrives in group settings".to_string(),
            ]
        }
    }

    fn interpret_risk_tolerance(value: f64) -> String {
        if value < 0.3 {
            "Risk-averse - prefers safe, predictable choices".to_string()
        } else if value < 0.7 {
            "Moderate risk tolerance - balanced approach to uncertainty".to_string()
        } else {
            "Risk-seeking - comfortable with uncertainty and danger".to_string()
        }
    }

    fn get_risk_tolerance_implications(value: f64) -> Vec<String> {
        if value < 0.3 {
            vec![
                "Avoids dangerous situations".to_string(),
                "Prefers established routines".to_string(),
            ]
        } else if value < 0.7 {
            vec![
                "Calculated risk-taking".to_string(),
                "Adaptable to change".to_string(),
            ]
        } else {
            vec![
                "Seeks adventure and challenge".to_string(),
                "Comfortable with uncertainty".to_string(),
            ]
        }
    }

    fn interpret_ambition(value: f64) -> String {
        if value < 0.3 {
            "Low ambition - content with current status".to_string()
        } else if value < 0.7 {
            "Moderate ambition - seeks gradual improvement".to_string()
        } else {
            "High ambition - driven to achieve significant goals".to_string()
        }
    }

    fn get_ambition_implications(value: f64) -> Vec<String> {
        if value < 0.3 {
            vec![
                "Satisfied with routine".to_string(),
                "Low goal-setting".to_string(),
            ]
        } else if value < 0.7 {
            vec![
                "Sets achievable goals".to_string(),
                "Steady progress orientation".to_string(),
            ]
        } else {
            vec![
                "Sets challenging goals".to_string(),
                "Highly motivated for advancement".to_string(),
            ]
        }
    }

    // Event handling methods
    
    fn get_recent_significant_events(&self, _character: &Character, _limit: usize) -> Vec<FormattedEvent> {
        // Would integrate with actual event storage
        vec![]
    }

    fn get_memory_summary(&self, _character: &Character) -> MemorySummary {
        // Would integrate with actual memory storage
        MemorySummary {
            total_memories: 0,
            average_significance: 0.0,
            memory_types: HashMap::new(),
            recent_memories: vec![],
        }
    }

    fn check_behavioral_consistency(&self, character: &Character) -> ConsistencyCheck {
        let consciousness = &character.consciousness;
        let behavioral_state = character.behavioral_state.as_ref();

        let mut issues = Vec::new();
        let mut score = (0.0, 0.0); // (total, max)

        if let Some(bs) = behavioral_state {
            // Check frequency-energy consistency
            let energy_check = Self::check_frequency_energy_consistency(
                consciousness.base_frequency,
                &bs.energy,
            );
            score.0 += energy_check.0;
            score.1 += energy_check.1;
            issues.extend(energy_check.2);

            // Check coherence-focus consistency
            let focus_check = Self::check_coherence_focus_consistency(
                consciousness.base_coherence,
                &bs.focus,
            );
            score.0 += focus_check.0;
            score.1 += focus_check.1;
            issues.extend(focus_check.2);
        }

        let is_consistent = issues.is_empty();
        ConsistencyCheck {
            is_consistent,
            consistency_score: if score.1 > 0.0 { score.0 / score.1 } else { 1.0 },
            issues,
            recommendations: if !is_consistent {
                vec!["Consider regenerating behavioral state from consciousness parameters".to_string()]
            } else {
                vec![]
            },
        }
    }

    fn check_frequency_energy_consistency(frequency: f64, energy: &EnergyLevel) -> (f64, f64, Vec<ConsistencyIssue>) {
        let expected = if frequency > 10.0 {
            EnergyLevel::High
        } else if frequency > 6.0 {
            EnergyLevel::Moderate
        } else {
            EnergyLevel::Low
        };

        let is_consistent = format!("{:?}", energy) == format!("{:?}", expected);
        let issues = if is_consistent {
            vec![]
        } else {
            vec![ConsistencyIssue {
                issue_type: "frequency_energy_mismatch".to_string(),
                expected: format!("{:?}", expected),
                actual: format!("{:?}", energy),
                severity: "warning".to_string(),
            }]
        };

        (if is_consistent { 1.0 } else { 0.0 }, 1.0, issues)
    }

    fn check_coherence_focus_consistency(coherence: f64, focus: &FocusLevel) -> (f64, f64, Vec<ConsistencyIssue>) {
        let expected = if coherence > 0.8 {
            FocusLevel::Focused
        } else if coherence > 0.5 {
            FocusLevel::Balanced
        } else {
            FocusLevel::Scattered
        };

        let is_consistent = format!("{:?}", focus) == format!("{:?}", expected);
        let issues = if is_consistent {
            vec![]
        } else {
            vec![ConsistencyIssue {
                issue_type: "coherence_focus_mismatch".to_string(),
                expected: format!("{:?}", expected),
                actual: format!("{:?}", focus),
                severity: "warning".to_string(),
            }]
        };

        (if is_consistent { 1.0 } else { 0.0 }, 1.0, issues)
    }

    // Decision factor methods
    
    fn calculate_decision_factor_breakdown(&self, _character: &Character, _interaction_type: &str) -> DecisionFactorBreakdown {
        // Simplified for now
        let base = 1.0;
        let behavioral = 1.1;
        let personality = 1.0;
        let memory = 0.95;
        let contextual = 1.0;

        DecisionFactorBreakdown {
            base_factor: base,
            behavioral_modifier: behavioral,
            personality_modifier: personality,
            memory_modifier: memory,
            contextual_modifier: contextual,
            steps: vec![
                CalculationStep {
                    step: "Base Factor".to_string(),
                    value: base,
                    description: "Starting neutral factor".to_string(),
                },
                CalculationStep {
                    step: "Behavioral State".to_string(),
                    value: behavioral,
                    description: "Applied behavioral state modifiers".to_string(),
                },
                CalculationStep {
                    step: "Personality Traits".to_string(),
                    value: personality,
                    description: "Applied personality influences".to_string(),
                },
                CalculationStep {
                    step: "Memory Influence".to_string(),
                    value: memory,
                    description: "Applied relevant memory impacts".to_string(),
                },
                CalculationStep {
                    step: "Contextual Factors".to_string(),
                    value: contextual,
                    description: "Applied environmental/situational modifiers".to_string(),
                },
            ],
        }
    }

    fn generate_decision_recommendations(&self, breakdown: &DecisionFactorBreakdown, final_factor: f64) -> Vec<Recommendation> {
        let mut recommendations = Vec::new();

        if final_factor < 0.3 {
            recommendations.push(Recommendation {
                recommendation_type: "low_motivation".to_string(),
                message: "Character shows very low motivation for this interaction type".to_string(),
                suggestion: "Consider environmental changes or goal adjustments".to_string(),
            });
        }

        if final_factor > 2.5 {
            recommendations.push(Recommendation {
                recommendation_type: "high_motivation".to_string(),
                message: "Character shows extremely high motivation for this interaction type".to_string(),
                suggestion: "Monitor for potential obsessive behavior patterns".to_string(),
            });
        }

        if breakdown.memory_modifier < 0.9 {
            recommendations.push(Recommendation {
                recommendation_type: "negative_memory_influence".to_string(),
                message: "Past experiences are negatively influencing decisions".to_string(),
                suggestion: "Consider positive reinforcement interactions".to_string(),
            });
        }

        recommendations
    }

    fn get_relevant_memories_for_decision(&self, _character: &Character, _interaction_type: &str) -> Vec<RelevantMemory> {
        // Would integrate with memory service
        vec![]
    }

    // Event processing methods
    
    fn apply_event_filters(&self, events: Vec<FormattedEvent>, filters: &EventsFilter) -> Vec<FormattedEvent> {
        let mut filtered = events;

        if let Some(ref event_type) = filters.event_type {
            filtered.retain(|e| &e.event_type == event_type);
        }

        if let Some(min_sig) = filters.min_significance {
            filtered.retain(|e| e.significance >= min_sig);
        }

        if let Some(ref time_range) = filters.time_range {
            filtered.retain(|e| e.timestamp >= time_range.start && e.timestamp <= time_range.end);
        }

        // Sort by timestamp (most recent first)
        filtered.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        filtered
    }

    fn format_event_for_display(&self, event: &FormattedEvent) -> FormattedEvent {
        event.clone() // Would add more formatting
    }

    fn analyze_events_history(&self, events: &[FormattedEvent]) -> EventsAnalysis {
        if events.is_empty() {
            return EventsAnalysis {
                average_significance: 0.0,
                event_types: HashMap::new(),
                trends: vec![],
            };
        }

        let avg_sig = events.iter().map(|e| e.significance).sum::<f64>() / events.len() as f64;
        
        let mut event_types = HashMap::new();
        for event in events {
            *event_types.entry(event.event_type.clone()).or_insert(0) += 1;
        }

        let mut trends = Vec::new();
        if events.len() >= 3 {
            let recent_sig = events.iter().take(3).map(|e| e.significance).sum::<f64>() / 3.0;
            let older_sig = events.iter().rev().take(3).map(|e| e.significance).sum::<f64>() / 3.0;
            
            if recent_sig > older_sig * 1.2 {
                trends.push("Increasing event significance over time".to_string());
            } else if recent_sig < older_sig * 0.8 {
                trends.push("Decreasing event significance over time".to_string());
            }
        }

        EventsAnalysis {
            average_significance: avg_sig,
            event_types,
            trends,
        }
    }

    fn identify_event_patterns(&self, events: &[FormattedEvent]) -> Vec<EventPattern> {
        let mut patterns = Vec::new();

        // Count event type frequencies
        let mut type_frequency: HashMap<String, usize> = HashMap::new();
        for event in events {
            *type_frequency.entry(event.event_type.clone()).or_insert(0) += 1;
        }

        // Identify repeated event types
        for (event_type, count) in type_frequency.iter() {
            if *count >= 3 {
                patterns.push(EventPattern {
                    pattern_type: "repeated_event_type".to_string(),
                    event_type: Some(event_type.clone()),
                    frequency: Some(*count),
                    description: format!("Frequent {} events ({} occurrences)", event_type, count),
                });
            }
        }

        patterns
    }

    fn calculate_events_impact(&self, events: &[FormattedEvent]) -> EventsImpactSummary {
        let mut impact = EventsImpactSummary {
            total_significance: 0.0,
            positive_events: 0,
            negative_events: 0,
            neutral_events: 0,
            average_emotional_impact: 0.0,
        };

        for event in events {
            impact.total_significance += event.significance;
            impact.average_emotional_impact += event.emotional_impact;

            match event.outcome.as_str() {
                "success" | "positive" => impact.positive_events += 1,
                "failure" | "negative" => impact.negative_events += 1,
                _ => impact.neutral_events += 1,
            }
        }

        if !events.is_empty() {
            impact.average_emotional_impact /= events.len() as f64;
        }

        impact
    }

    // Diagnostic methods
    
    fn check_consciousness_parameter_bounds(&self, character: &Character) -> ValidationResult {
        let consciousness = &character.consciousness;
        let mut issues = Vec::new();

        if consciousness.base_frequency < 3.0 || consciousness.base_frequency > 15.0 {
            issues.push(DiagnosticIssue {
                issue_type: "parameter_bounds".to_string(),
                parameter: Some("baseFrequency".to_string()),
                value: Some(consciousness.base_frequency),
                expected_range: Some([3.0, 15.0]),
                severity: "critical".to_string(),
                message: None,
            });
        }

        if consciousness.base_coherence < 0.2 || consciousness.base_coherence > 1.0 {
            issues.push(DiagnosticIssue {
                issue_type: "parameter_bounds".to_string(),
                parameter: Some("baseCoherence".to_string()),
                value: Some(consciousness.base_coherence),
                expected_range: Some([0.2, 1.0]),
                severity: "critical".to_string(),
                message: None,
            });
        }

        ValidationResult {
            is_valid: issues.is_empty(),
            issues,
        }
    }

    fn check_behavioral_state_coherence(&self, character: &Character) -> ValidationResult {
        let mut issues = Vec::new();

        if character.behavioral_state.is_none() {
            issues.push(DiagnosticIssue {
                issue_type: "missing_behavioral_state".to_string(),
                parameter: None,
                value: None,
                expected_range: None,
                severity: "critical".to_string(),
                message: Some("Behavioral state is missing or undefined".to_string()),
            });
        }

        ValidationResult {
            is_valid: issues.is_empty(),
            issues,
        }
    }

    fn check_memory_consistency(&self, _character: &Character) -> ValidationResult {
        // Would integrate with actual memory storage
        ValidationResult {
            is_valid: true,
            issues: vec![],
        }
    }

    fn check_event_history_consistency(&self, _character: &Character) -> ValidationResult {
        // Would integrate with actual event storage
        ValidationResult {
            is_valid: true,
            issues: vec![],
        }
    }

    fn generate_diagnostic_recommendations(
        &self,
        inconsistencies: &[DiagnosticIssue],
        warnings: &[DiagnosticIssue],
        _character: &Character,
    ) -> Vec<DiagnosticRecommendation> {
        let mut recommendations = Vec::new();

        for issue in inconsistencies {
            match issue.issue_type.as_str() {
                "parameter_bounds" => {
                    recommendations.push(DiagnosticRecommendation {
                        priority: "high".to_string(),
                        category: "consciousness_parameters".to_string(),
                        action: format!(
                            "Adjust {} to be within range {:?}",
                            issue.parameter.as_ref().unwrap(),
                            issue.expected_range.unwrap()
                        ),
                        rationale: "Parameters outside bounds can cause unstable behavior".to_string(),
                    });
                }
                "missing_behavioral_state" => {
                    recommendations.push(DiagnosticRecommendation {
                        priority: "critical".to_string(),
                        category: "behavioral_state".to_string(),
                        action: "Regenerate behavioral state from consciousness parameters".to_string(),
                        rationale: "Missing behavioral state prevents proper decision making".to_string(),
                    });
                }
                _ => {}
            }
        }

        for warning in warnings {
            match warning.issue_type.as_str() {
                "memory_limit_exceeded" => {
                    recommendations.push(DiagnosticRecommendation {
                        priority: "low".to_string(),
                        category: "memory_management".to_string(),
                        action: "Prune older memories with low significance".to_string(),
                        rationale: "Excessive memories can impact performance".to_string(),
                    });
                }
                _ => {}
            }
        }

        if inconsistencies.is_empty() && warnings.is_empty() {
            recommendations.push(DiagnosticRecommendation {
                priority: "low".to_string(),
                category: "maintenance".to_string(),
                action: "Continue regular monitoring of consciousness parameters".to_string(),
                rationale: "Proactive monitoring prevents future issues".to_string(),
            });
        }

        recommendations
    }

    fn calculate_system_metrics(&self, _character: &Character) -> SystemMetrics {
        SystemMetrics {
            memory_usage: 0, // Would integrate with actual memory storage
            event_history: 0, // Would integrate with actual event storage
            last_update: Self::current_timestamp(),
        }
    }

    fn calculate_performance_indicators(&self, _character: &Character) -> PerformanceIndicators {
        PerformanceIndicators {
            update_frequency: "normal".to_string(),
            memory_efficiency: "good".to_string(),
            computational_load: "low".to_string(),
        }
    }
}

/// Validation result for checks
struct ValidationResult {
    is_valid: bool,
    issues: Vec<DiagnosticIssue>,
}

impl Default for ConsciousnessInspectionService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_interpret_energy_levels() {
        assert!(ConsciousnessInspectionService::interpret_energy_level("Low").contains("reduced"));
        assert!(ConsciousnessInspectionService::interpret_energy_level("Moderate").contains("balanced"));
        assert!(ConsciousnessInspectionService::interpret_energy_level("High").contains("active"));
    }

    #[test]
    fn test_interpret_social_drive() {
        assert!(ConsciousnessInspectionService::interpret_social_drive(0.2).contains("Low"));
        assert!(ConsciousnessInspectionService::interpret_social_drive(0.5).contains("Moderate"));
        assert!(ConsciousnessInspectionService::interpret_social_drive(0.9).contains("High"));
    }

    #[test]
    fn test_interpret_risk_tolerance() {
        assert!(ConsciousnessInspectionService::interpret_risk_tolerance(0.2).contains("Risk-averse"));
        assert!(ConsciousnessInspectionService::interpret_risk_tolerance(0.5).contains("Moderate"));
        assert!(ConsciousnessInspectionService::interpret_risk_tolerance(0.9).contains("Risk-seeking"));
    }

    #[test]
    fn test_interpret_ambition() {
        assert!(ConsciousnessInspectionService::interpret_ambition(0.2).contains("Low"));
        assert!(ConsciousnessInspectionService::interpret_ambition(0.5).contains("Moderate"));
        assert!(ConsciousnessInspectionService::interpret_ambition(0.9).contains("High"));
    }
}
