//! Memory lifecycle management

use crate::Memory;

/// Service for managing memory lifecycle
pub struct MemoryManagementService;

impl MemoryManagementService {
    /// Prune memories to maintain maximum count
    pub fn prune_memories(memories: &mut Vec<Memory>, max_count: usize) {
        if memories.len() > max_count {
            // Sort by significance (highest first)
            memories.sort_by(|a, b| b.significance.partial_cmp(&a.significance).unwrap());
            memories.truncate(max_count);
        }
    }

    /// Apply memory decay over time
    pub fn apply_memory_decay(memories: &mut [Memory], current_time: u64, decay_rate: f64) {
        for memory in memories.iter_mut() {
            let age_hours = (current_time - memory.timestamp) as f64 / 3600000.0; // Convert to hours
            memory.decay_factor = (-decay_rate * age_hours).exp();
            memory.significance *= memory.decay_factor;
        }
    }
}