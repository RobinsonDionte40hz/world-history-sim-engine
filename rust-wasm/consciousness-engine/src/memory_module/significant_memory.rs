//! Significant memory operations

use crate::{Memory, InteractionEvent, MemoryContext, Result, EventSignificanceCalculator};

/// Service for managing significant memories
pub struct SignificantMemoryService;

impl SignificantMemoryService {
    /// Create a memory from an interaction event
    pub fn create_memory_from_event(
        event: &InteractionEvent,
        context: &MemoryContext,
    ) -> Result<Memory> {
        let significance = EventSignificanceCalculator::calculate_significance(event, context)?;

        Ok(Memory {
            id: format!("memory_{}", event.timestamp),
            timestamp: event.timestamp,
            significance,
            emotional_impact: event.emotional_impact,
            interaction_type: crate::InteractionType::Social, // Default for now
            participants: event.participants.clone(),
            context: context.clone(),
            decay_factor: 1.0,
        })
    }
}