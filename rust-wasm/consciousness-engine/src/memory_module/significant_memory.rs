//! Significant memory operations
//! 
//! Implements memory storage, retrieval, limit enforcement, and influence calculations.
//! Requirements: REQ-2.1, REQ-2.2, REQ-2.3

use crate::{Memory, InteractionEvent, MemoryContext, Result, EventSignificanceCalculator, InteractionType, ConsciousnessError};

/// Maximum number of significant memories per character (requirement: REQ-2.2)
pub const MAX_MEMORIES_PER_CHARACTER: usize = 50;

/// Minimum significance threshold for memory storage (requirement: REQ-2.1)
pub const MIN_SIGNIFICANCE_THRESHOLD: f64 = 0.3;

/// Service for managing significant memories
pub struct SignificantMemoryService;

impl SignificantMemoryService {
    /// Create a memory from an interaction event
    /// 
    /// # Algorithm
    /// 1. Calculate event significance using EventSignificanceCalculator
    /// 2. Filter events below significance threshold (≥0.3)
    /// 3. Create memory with decay factor initialized to 1.0
    /// 
    /// # Requirements
    /// - REQ-2.1: Memory significance calculation
    /// - REQ-2.4: Significance threshold filtering
    pub fn create_memory_from_event(
        event: &InteractionEvent,
        context: &MemoryContext,
    ) -> Result<Option<Memory>> {
        let significance = EventSignificanceCalculator::calculate_significance(event, context)?;

        // Filter events below significance threshold
        if significance < MIN_SIGNIFICANCE_THRESHOLD {
            return Ok(None);
        }

        Ok(Some(Memory {
            id: format!("memory_{}", event.timestamp),
            timestamp: event.timestamp,
            significance,
            emotional_impact: event.emotional_impact,
            interaction_type: event.interaction_type,
            participants: event.participants.clone(),
            context: context.clone(),
            decay_factor: 1.0,
            interaction_id: event.id.clone(),
            outcome: "unknown".to_string(), // Default outcome
            location: context.location.clone().unwrap_or_default(),
            context_tags: Vec::new(),
            description: format!("Interaction at {}", event.timestamp),
        }))
    }

    /// Store a memory in character's memory collection
    /// 
    /// # Algorithm
    /// 1. Check if memory meets significance threshold
    /// 2. Add memory to collection
    /// 3. If limit exceeded, prune oldest/least significant memories
    /// 4. Return updated memory collection
    /// 
    /// # Requirements
    /// - REQ-2.2: Memory limit enforcement (50 memories)
    /// - REQ-2.1: Memory storage system
    pub fn store_memory(
        memories: &mut Vec<Memory>,
        new_memory: Memory,
    ) -> Result<()> {
        // Add new memory
        memories.push(new_memory);

        // Enforce memory limit
        if memories.len() > MAX_MEMORIES_PER_CHARACTER {
            Self::prune_least_significant(memories);
        }

        Ok(())
    }

    /// Retrieve memories relevant to a specific interaction type
    /// 
    /// # Algorithm
    /// 1. Filter memories by interaction type match
    /// 2. Sort by significance * decay_factor (recency-weighted)
    /// 3. Return top N most relevant memories
    /// 
    /// # Requirements
    /// - REQ-2.1: Memory retrieval functions
    /// - REQ-2.3: Memory influence calculation
    pub fn retrieve_relevant_memories<'a>(
        memories: &'a [Memory],
        interaction_type: &InteractionType,
        max_count: usize,
    ) -> Vec<&'a Memory> {
        let mut relevant: Vec<&Memory> = memories
            .iter()
            .filter(|m| m.interaction_type == *interaction_type)
            .collect();

        // Sort by weighted significance (significance * decay_factor)
        relevant.sort_by(|a, b| {
            let a_weight = a.significance * a.decay_factor;
            let b_weight = b.significance * b.decay_factor;
            b_weight.partial_cmp(&a_weight).unwrap_or(std::cmp::Ordering::Equal)
        });

        relevant.into_iter().take(max_count).collect()
    }

    /// Calculate memory influence on interaction decision
    /// 
    /// # Algorithm
    /// 1. Retrieve relevant memories for interaction type
    /// 2. Calculate weighted influence based on:
    ///    - Memory significance (0.0-1.0)
    ///    - Emotional impact (-1.0 to 1.0)
    ///    - Decay factor (recency weight)
    /// 3. Normalize to decision multiplier range (0.8x - 1.5x)
    /// 
    /// # Requirements
    /// - REQ-2.3: Memory influence calculation for decisions
    /// 
    /// # Returns
    /// Multiplier in range [0.8, 1.5] to apply to interaction weight
    pub fn calculate_memory_influence(
        memories: &[Memory],
        interaction_type: &InteractionType,
    ) -> Result<f64> {
        let relevant_memories = Self::retrieve_relevant_memories(memories, interaction_type, 10);

        if relevant_memories.is_empty() {
            return Ok(1.0); // Neutral influence
        }

        // Calculate average weighted influence
        let total_influence: f64 = relevant_memories
            .iter()
            .map(|m| {
                // Positive memories increase weight, negative decrease
                let emotional_factor = m.emotional_impact;
                let significance_weight = m.significance * m.decay_factor;
                emotional_factor * significance_weight
            })
            .sum();

        let average_influence = total_influence / relevant_memories.len() as f64;

        // Map from [-1.0, 1.0] to [0.8, 1.5]
        // -1.0 -> 0.8x (strong negative memory)
        //  0.0 -> 1.0x (neutral)
        // +1.0 -> 1.5x (strong positive memory)
        let multiplier: f64 = 1.0 + (average_influence * 0.5);
        Ok(multiplier.clamp(0.8, 1.5))
    }

    /// Prune least significant memories when limit exceeded
    /// 
    /// # Algorithm
    /// 1. Sort memories by weighted significance (significance * decay_factor)
    /// 2. Keep top MAX_MEMORIES_PER_CHARACTER entries
    /// 3. Remove rest
    /// 
    /// # Requirements
    /// - REQ-2.2: Automatic memory pruning
    fn prune_least_significant(memories: &mut Vec<Memory>) {
        // Sort by weighted significance (descending)
        memories.sort_by(|a, b| {
            let a_weight = a.significance * a.decay_factor;
            let b_weight = b.significance * b.decay_factor;
            b_weight.partial_cmp(&a_weight).unwrap_or(std::cmp::Ordering::Equal)
        });

        // Keep only top MAX_MEMORIES_PER_CHARACTER
        memories.truncate(MAX_MEMORIES_PER_CHARACTER);
    }

    /// Search memories by participant
    /// 
    /// # Requirements
    /// - REQ-2.1: Memory search and filtering
    pub fn search_by_participant<'a>(
        memories: &'a [Memory],
        participant_id: &str,
    ) -> Vec<&'a Memory> {
        memories
            .iter()
            .filter(|m| m.participants.contains(&participant_id.to_string()))
            .collect()
    }

    /// Search memories by minimum significance threshold
    /// 
    /// # Requirements
    /// - REQ-2.1: Memory search and filtering
    pub fn search_by_significance<'a>(
        memories: &'a [Memory],
        min_significance: f64,
    ) -> Vec<&'a Memory> {
        memories
            .iter()
            .filter(|m| m.significance >= min_significance)
            .collect()
    }

    /// Get total count of significant memories
    pub fn count_memories(memories: &[Memory]) -> usize {
        memories.len()
    }

    /// Validate memory integrity
    /// 
    /// # Requirements
    /// - REQ-2.5: Memory corruption detection
    pub fn validate_memory(memory: &Memory) -> Result<()> {
        // Validate significance range
        if memory.significance < 0.0 || memory.significance > 1.0 {
            return Err(ConsciousnessError::MemoryCorruptionDetected {
                details: format!(
                    "Invalid significance value: {} (expected 0.0-1.0)",
                    memory.significance
                ),
            });
        }

        // Validate emotional impact range
        if memory.emotional_impact < -1.0 || memory.emotional_impact > 1.0 {
            return Err(ConsciousnessError::MemoryCorruptionDetected {
                details: format!(
                    "Invalid emotional impact: {} (expected -1.0 to 1.0)",
                    memory.emotional_impact
                ),
            });
        }

        // Validate decay factor
        if memory.decay_factor < 0.0 || memory.decay_factor > 1.0 {
            return Err(ConsciousnessError::MemoryCorruptionDetected {
                details: format!(
                    "Invalid decay factor: {} (expected 0.0-1.0)",
                    memory.decay_factor
                ),
            });
        }

        Ok(())
    }
}