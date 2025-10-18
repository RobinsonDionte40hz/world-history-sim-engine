//! Emotional state management and calculations
//! 
//! This module provides utilities for managing character emotional states,
//! calculating emotional modifiers, handling emotional contagion, and
//! resolving emotional conflicts.

pub mod emotional_utils;
pub mod emotional_memory;

pub use emotional_utils::{
    ComplexEmotionalState,
    EmotionalComponent,
    InteractionContext,
    EmotionalReaction,
    EmotionalContagion,
    get_emotional_modifier,
    get_emotional_reaction,
    calculate_emotional_contagion,
    resolve_emotional_conflicts,
    get_complex_emotional_modifier,
    calculate_emotional_valence,
    EmotionalUtils,
};

pub use emotional_memory::{
    EmotionalMemory,
    EmotionalContext,
    RetrievalTrigger,
    MemoryRelevance,
    create_emotional_memory,
    retrieve_emotional_memories,
    enhance_memory_with_emotion,
};