//! Memory management system

pub mod significant_memory;
pub mod memory_management;
pub mod event_significance;

#[cfg(test)]
mod memory_tests;

pub use significant_memory::{SignificantMemoryService, MAX_MEMORIES_PER_CHARACTER, MIN_SIGNIFICANCE_THRESHOLD};
pub use memory_management::*;
pub use event_significance::EventSignificanceCalculator;