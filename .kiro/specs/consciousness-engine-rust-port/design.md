# Technical Design Document (TDD)
## NPC Consciousness Engine - Rust/WebAssembly Implementation

### Document Information
- **Version**: 1.0
- **Date**: October 17, 2025
- **Project**: World History Simulation Engine - Consciousness Port
- **Dependencies**: Requirements Specification v1.0

---

## 1. Architecture Overview

### 1.1 High-Level System Architecture

The Rust/WebAssembly consciousness engine follows a layered architecture optimized for performance and maintainability:

```
┌─────────────────────────────────────────────────────────┐
│                JavaScript Application Layer              │
├─────────────────────────────────────────────────────────┤
│                WASM Binding Layer                       │
├─────────────────────────────────────────────────────────┤
│                Core Consciousness Engine                │
│  ┌─────────────┬─────────────┬─────────────────────────┐ │
│  │ Consciousness│   Memory    │    Decision Making      │ │
│  │   System     │   System    │       Engine           │ │
│  └─────────────┴─────────────┴─────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                Shared Types & Utilities                 │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Module Dependency Graph

```
consciousness-engine
├── consciousness (core consciousness calculations)
│   ├── behavioral_state
│   ├── frequency_mapping
│   └── consciousness_update
├── memory (memory management system)
│   ├── significant_memory
│   ├── memory_management
│   └── event_significance
├── decision (decision making engine)
│   ├── interaction_weight
│   ├── behavior_generation
│   └── template_processing
├── emotion (emotional utilities)
│   └── emotional_calculations
├── types (shared type definitions)
└── wasm (WebAssembly bindings)
```

### 1.3 Data Flow Architecture

The system processes NPC consciousness through the following pipeline:

1. **Input Processing**: Character data deserialized from JavaScript
2. **Consciousness Evaluation**: Behavioral state calculation and caching
3. **Memory Integration**: Relevant memory retrieval and influence calculation
4. **Decision Processing**: Interaction weight calculation and selection
5. **Output Generation**: Results serialized back to JavaScript

---

## 2. Rust Module Structure

### 2.1 Project Layout```

consciousness-engine/
├── Cargo.toml                    # Project configuration
├── Cargo.lock                   # Dependency lock file
├── src/
│   ├── lib.rs                   # Library root and public API
│   ├── consciousness/           # Core consciousness calculations
│   │   ├── mod.rs              # Module declarations
│   │   ├── behavioral_state.rs  # Behavioral state management
│   │   ├── frequency_mapping.rs # Frequency to energy mapping
│   │   ├── consciousness_update.rs # Consciousness parameter updates
│   │   └── error_handling.rs   # Consciousness-specific error handling
│   ├── memory/                  # Memory management system
│   │   ├── mod.rs              # Module declarations
│   │   ├── significant_memory.rs # Significant memory operations
│   │   ├── memory_management.rs # Memory lifecycle management
│   │   └── event_significance.rs # Event significance calculation
│   ├── decision/                # Decision making engine
│   │   ├── mod.rs              # Module declarations
│   │   ├── interaction_weight.rs # Interaction weight calculation
│   │   ├── behavior_generation.rs # Behavior generation logic
│   │   └── template_processing.rs # Character template processing
│   ├── emotion/                 # Emotional utilities
│   │   ├── mod.rs              # Module declarations
│   │   └── emotional_utils.rs  # Emotional calculation utilities
│   ├── types/                   # Shared type definitions
│   │   ├── mod.rs              # Module declarations
│   │   ├── character.rs        # Character-related types
│   │   ├── consciousness.rs    # Consciousness-related types
│   │   ├── memory.rs           # Memory-related types
│   │   ├── interaction.rs      # Interaction-related types
│   │   └── error.rs            # Error type definitions
│   └── wasm/                    # WebAssembly bindings
│       ├── mod.rs              # Module declarations
│       ├── bindings.rs         # WASM function exports
│       └── serialization.rs    # Data serialization utilities
├── tests/                       # Integration tests
│   ├── consciousness_tests.rs
│   ├── memory_tests.rs
│   ├── decision_tests.rs
│   └── performance_tests.rs
├── benches/                     # Performance benchmarks
│   ├── consciousness_bench.rs
│   └── memory_bench.rs
└── pkg/                         # Generated WASM package (build output)
```

### 2.2 Core Dependencies

```toml
[dependencies]
wasm-bindgen = "0.2"
js-sys = "0.3"
web-sys = "0.3"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.4"
console_error_panic_hook = "0.1"
wee_alloc = "0.4"

[dependencies.getrandom]
version = "0.2"
features = ["js"]

[dev-dependencies]
wasm-bindgen-test = "0.3"
criterion = { version = "0.4", features = ["html_reports"] }
```

---

## 3. Type System Design

### 3.1 Core Character Types```r
ust
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Character {
    pub id: String,
    pub consciousness: ConsciousnessState,
    pub attributes: Attributes,
    pub personality: Personality,
    pub memories: Vec<Memory>,
    pub goals: Vec<Goal>,
    pub behavioral_state: Option<BehavioralState>, // Cached state
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ConsciousnessState {
    pub base_frequency: f64,        // 3.0 - 15.0 Hz
    pub base_coherence: f64,        // 0.2 - 1.0
    pub current_frequency: f64,     // Current state
    pub emotional_coherence: f64,   // 0.2 - 1.0 range
    pub emotional_state: EmotionalState,
    pub last_update: u64,           // Timestamp
    pub significant_events: Vec<SignificantEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Attributes {
    pub strength: u8,      // 1-20 D&D attribute
    pub dexterity: u8,
    pub constitution: u8,
    pub intelligence: u8,
    pub wisdom: u8,
    pub charisma: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Personality {
    pub aggression: f64,   // 0.0 - 1.0
    pub curiosity: f64,
    pub empathy: f64,
    pub ambition: f64,
    pub sociability: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct BehavioralState {
    pub energy: EnergyLevel,
    pub focus: FocusLevel,
    pub mood: MoodLevel,
    pub social_drive: f64,     // 0.0 - 1.0
    pub risk_tolerance: f64,   // 0.0 - 1.0
    pub ambition: f64,         // 0.0 - 1.0
    pub cached_timestamp: u64, // When this state was calculated
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EnergyLevel {
    VeryLow,
    Low,
    Moderate,
    High,
    VeryHigh,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FocusLevel {
    Scattered,
    Balanced,
    Focused,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MoodLevel {
    Depressed,
    Content,
    Optimistic,
    Excited,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EmotionalState {
    Content,
    Excited,
    Anxious,
    Depressed,
    Angry,
    Joyful,
    Fearful,
    Surprised,
}
```

### 3.2 Memory System Types```rus
t
#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Memory {
    pub id: String,
    pub timestamp: u64,
    pub significance: f64,          // 0.0 - 1.0
    pub emotional_impact: f64,      // -1.0 - 1.0
    pub interaction_type: InteractionType,
    pub participants: Vec<String>,
    pub context: MemoryContext,
    pub decay_factor: f64,          // Memory strength over time
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct MemoryContext {
    pub location: Option<String>,
    pub goal_relevance: f64,        // How relevant to current goals
    pub novelty_factor: f64,        // How unusual the event was
    pub social_importance: f64,     // Social significance
    pub survival_relevance: f64,    // Survival importance
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct SignificantEvent {
    pub timestamp: u64,
    pub event_type: EventType,
    pub significance: f64,
    pub emotional_impact: f64,
    pub consciousness_change: ConsciousnessChange,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventType {
    GoalCompletion,
    SocialInteraction,
    CombatEncounter,
    Discovery,
    Failure,
    Achievement,
    Relationship,
    Economic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ConsciousnessChange {
    pub frequency_delta: f64,
    pub coherence_delta: f64,
    pub emotional_state_change: Option<EmotionalState>,
}
```

### 3.3 Interaction System Types

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Interaction {
    pub id: String,
    pub name: String,
    pub interaction_type: InteractionType,
    pub requirements: InteractionRequirements,
    pub effects: InteractionEffects,
    pub base_weight: f64,           // Base probability weight
    pub goal_alignment: HashMap<String, f64>, // Goal type -> alignment score
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InteractionType {
    Social,
    Economic,
    Combat,
    Exploration,
    Crafting,
    Learning,
    Rest,
    Travel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct InteractionRequirements {
    pub min_attributes: Option<Attributes>,
    pub required_skills: Vec<String>,
    pub node_types: Vec<String>,
    pub consciousness_state: Option<ConsciousnessRequirement>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ConsciousnessRequirement {
    pub min_frequency: Option<f64>,
    pub max_frequency: Option<f64>,
    pub min_coherence: Option<f64>,
    pub required_emotional_state: Option<EmotionalState>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct InteractionEffects {
    pub success_effects: Vec<Effect>,
    pub failure_effects: Vec<Effect>,
    pub consciousness_impact: ConsciousnessImpact,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Effect {
    pub effect_type: EffectType,
    pub target: EffectTarget,
    pub magnitude: f64,
    pub duration: Option<u64>,      // Duration in simulation ticks
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EffectType {
    AttributeModification,
    ResourceChange,
    RelationshipChange,
    MemoryCreation,
    GoalProgress,
    ConsciousnessShift,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EffectTarget {
    Self_,
    Other(String),              // Target character ID
    Global,                     // World state
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ConsciousnessImpact {
    pub frequency_change: f64,
    pub coherence_change: f64,
    pub emotional_impact: f64,
    pub significance: f64,
}
```

---

## 4. Algorithm Specifications

### 4.1 Consciousness Frequency Mapping

**Algorithm**: Map consciousness frequency to energy level

**Pseudocode**:
```
function mapFrequencyToEnergy(frequency: f64) -> EnergyLevel:
    if frequency < 4.0:
        return VeryLow
    elif frequency < 7.0:
        return Low
    elif frequency < 10.0:
        return Moderate
    elif frequency < 13.0:
        return High
    else:
        return VeryHigh
```

**Time Complexity**: O(1)
**Space Complexity**: O(1)

**Rust Implementation**:
```rust
impl ConsciousnessState {
    pub fn map_frequency_to_energy(frequency: f64) -> EnergyLevel {
        match frequency {
            f if f < 4.0 => EnergyLevel::VeryLow,
            f if f < 7.0 => EnergyLevel::Low,
            f if f < 10.0 => EnergyLevel::Moderate,
            f if f < 13.0 => EnergyLevel::High,
            _ => EnergyLevel::VeryHigh,
        }
    }
}
```### 
4.2 Interaction Weight Calculation

**Algorithm**: Calculate weighted probability for interaction selection

**Pseudocode**:
```
function calculateInteractionWeight(
    character: Character,
    interaction: Interaction,
    context: Context
) -> f64:
    
    // Base weight from interaction definition
    weight = interaction.base_weight
    
    // Goal alignment (highest priority multiplier: 0.1x - 3.0x)
    goal_multiplier = calculateGoalAlignment(character.goals, interaction)
    weight *= goal_multiplier
    
    // Personality alignment (0.5x - 2.0x)
    personality_multiplier = calculatePersonalityAlignment(
        character.personality, 
        interaction.interaction_type
    )
    weight *= personality_multiplier
    
    // Memory influence (0.8x - 1.5x)
    memory_influence = calculateMemoryInfluence(
        character.memories, 
        interaction.interaction_type
    )
    weight *= memory_influence
    
    // Consciousness state modifier (0.7x - 1.8x)
    consciousness_modifier = calculateConsciousnessModifier(
        character.behavioral_state,
        interaction.interaction_type
    )
    weight *= consciousness_modifier
    
    // Basic needs modifier (0.6x - 2.0x)
    needs_modifier = calculateNeedsModifier(character, interaction)
    weight *= needs_modifier
    
    // Context factors (0.9x - 1.3x)
    context_modifier = calculateContextModifier(context, interaction)
    weight *= context_modifier
    
    return clamp(weight, 0.0, 10.0)  // Bounded result
```

**Time Complexity**: O(n) where n is number of memories (limited to 50)
**Space Complexity**: O(1)

**Rust Implementation**:
```rust
impl InteractionWeightCalculator {
    pub fn calculate_interaction_weight(
        character: &Character,
        interaction: &Interaction,
        context: &InteractionContext,
    ) -> Result<f64, ConsciousnessError> {
        let mut weight = interaction.base_weight;
        
        // Goal alignment calculation
        let goal_multiplier = self.calculate_goal_alignment(
            &character.goals, 
            &interaction.goal_alignment
        )?;
        weight *= goal_multiplier;
        
        // Personality alignment
        let personality_multiplier = self.calculate_personality_alignment(
            &character.personality,
            &interaction.interaction_type,
        )?;
        weight *= personality_multiplier;
        
        // Memory influence
        let memory_influence = self.calculate_memory_influence(
            &character.memories,
            &interaction.interaction_type,
        )?;
        weight *= memory_influence;
        
        // Consciousness state modifier
        if let Some(behavioral_state) = &character.behavioral_state {
            let consciousness_modifier = self.calculate_consciousness_modifier(
                behavioral_state,
                &interaction.interaction_type,
            )?;
            weight *= consciousness_modifier;
        }
        
        // Basic needs modifier
        let needs_modifier = self.calculate_needs_modifier(character, interaction)?;
        weight *= needs_modifier;
        
        // Context factors
        let context_modifier = self.calculate_context_modifier(context, interaction)?;
        weight *= context_modifier;
        
        Ok(weight.clamp(0.0, 10.0))
    }
}
```

### 4.3 Memory Significance Calculation

**Algorithm**: Calculate significance score for memory storage

**Pseudocode**:
```
function calculateMemorySignificance(
    event: Event,
    context: MemoryContext
) -> f64:
    
    significance = 0.0
    
    // Emotional impact component (0.0 - 0.4)
    emotional_component = abs(event.emotional_impact) * 0.4
    significance += emotional_component
    
    // Goal relevance component (0.0 - 0.3)
    goal_component = context.goal_relevance * 0.3
    significance += goal_component
    
    // Novelty factor component (0.0 - 0.2)
    novelty_component = context.novelty_factor * 0.2
    significance += novelty_component
    
    // Social importance component (0.0 - 0.1)
    social_component = context.social_importance * 0.1
    significance += social_component
    
    // Survival relevance component (0.0 - 0.1)
    survival_component = context.survival_relevance * 0.1
    significance += survival_component
    
    return clamp(significance, 0.0, 1.0)
```

**Time Complexity**: O(1)
**Space Complexity**: O(1)

**Rust Implementation**:
```rust
impl EventSignificanceCalculator {
    pub fn calculate_significance(
        event: &InteractionEvent,
        context: &MemoryContext,
    ) -> Result<f64, ConsciousnessError> {
        let mut significance = 0.0;
        
        // Emotional impact component (0.0 - 0.4)
        let emotional_component = event.emotional_impact.abs() * 0.4;
        significance += emotional_component;
        
        // Goal relevance component (0.0 - 0.3)
        let goal_component = context.goal_relevance * 0.3;
        significance += goal_component;
        
        // Novelty factor component (0.0 - 0.2)
        let novelty_component = context.novelty_factor * 0.2;
        significance += novelty_component;
        
        // Social importance component (0.0 - 0.1)
        let social_component = context.social_importance * 0.1;
        significance += social_component;
        
        // Survival relevance component (0.0 - 0.1)
        let survival_component = context.survival_relevance * 0.1;
        significance += survival_component;
        
        Ok(significance.clamp(0.0, 1.0))
    }
}
```

---

## 5. Error Handling Strategy

### 5.1 Error Type Hierarchy

```rust
use thiserror::Error;

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

pub type Result<T> = std::result::Result<T, ConsciousnessError>;
```### 5.2
 Deterministic Floating-Point Strategy

**Critical Implementation Detail**: To ensure bit-identical results across platforms, implement deterministic floating-point handling:

```rust
use std::cmp::Ordering;

/// Deterministic floating-point wrapper ensuring consistent precision
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct DeterministicFloat(f64);

impl DeterministicFloat {
    /// Create deterministic float with 6 decimal precision
    pub fn new(val: f64) -> Self {
        // Use consistent rounding to 6 decimal places
        Self(libm::round(val * 1_000_000.0) / 1_000_000.0)
    }
    
    /// Get the underlying value
    pub fn value(&self) -> f64 {
        self.0
    }
    
    /// Deterministic addition
    pub fn add(&self, other: DeterministicFloat) -> DeterministicFloat {
        DeterministicFloat::new(self.0 + other.0)
    }
    
    /// Deterministic multiplication
    pub fn mul(&self, other: DeterministicFloat) -> DeterministicFloat {
        DeterministicFloat::new(self.0 * other.0)
    }
}

impl PartialEq for DeterministicFloat {
    fn eq(&self, other: &Self) -> bool {
        // Use epsilon comparison for floating-point equality
        (self.0 - other.0).abs() < f64::EPSILON
    }
}

impl PartialOrd for DeterministicFloat {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.0.partial_cmp(&other.0)
    }
}
```

### 5.3 Memory Pool Implementation

**Performance Critical**: Pre-allocated memory pools to avoid allocation overhead during simulation:

```rust
use std::collections::VecDeque;

/// Memory pool for character processing to avoid allocations
pub struct CharacterPool {
    characters: Vec<Character>,
    free_indices: VecDeque<usize>,
    capacity: usize,
}

impl CharacterPool {
    pub fn new(capacity: usize) -> Self {
        let mut characters = Vec::with_capacity(capacity);
        let mut free_indices = VecDeque::with_capacity(capacity);
        
        // Pre-allocate character slots
        for i in 0..capacity {
            characters.push(Character::default());
            free_indices.push_back(i);
        }
        
        Self {
            characters,
            free_indices,
            capacity,
        }
    }
    
    pub fn acquire(&mut self) -> Option<&mut Character> {
        if let Some(index) = self.free_indices.pop_front() {
            Some(&mut self.characters[index])
        } else {
            None
        }
    }
    
    pub fn release(&mut self, character: &Character) {
        // Find and return character to pool
        for (i, pooled_char) in self.characters.iter().enumerate() {
            if std::ptr::eq(pooled_char, character) {
                self.free_indices.push_back(i);
                break;
            }
        }
    }
}

/// Memory pool for behavioral state calculations
pub struct BehavioralStatePool {
    states: Vec<BehavioralState>,
    free_indices: VecDeque<usize>,
}

impl BehavioralStatePool {
    pub fn new(capacity: usize) -> Self {
        let mut states = Vec::with_capacity(capacity);
        let mut free_indices = VecDeque::with_capacity(capacity);
        
        for i in 0..capacity {
            states.push(BehavioralState::default());
            free_indices.push_back(i);
        }
        
        Self { states, free_indices }
    }
    
    pub fn acquire(&mut self) -> Option<&mut BehavioralState> {
        if let Some(index) = self.free_indices.pop_front() {
            Some(&mut self.states[index])
        } else {
            None
        }
    }
}
```

---

## 6. Memory Management

### 6.1 WASM Linear Memory Optimization

```rust
use wee_alloc;

// Use wee_alloc as the global allocator for smaller WASM binary size
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

/// Memory manager for WASM environment
pub struct WasmMemoryManager {
    character_pool: CharacterPool,
    behavioral_state_pool: BehavioralStatePool,
    memory_usage: std::sync::atomic::AtomicUsize,
    max_memory: usize,
}

impl WasmMemoryManager {
    pub fn new(max_npcs: usize, max_memory_mb: usize) -> Self {
        Self {
            character_pool: CharacterPool::new(max_npcs),
            behavioral_state_pool: BehavioralStatePool::new(max_npcs * 2),
            memory_usage: std::sync::atomic::AtomicUsize::new(0),
            max_memory: max_memory_mb * 1024 * 1024, // Convert to bytes
        }
    }
    
    pub fn check_memory_limit(&self) -> Result<(), ConsciousnessError> {
        let current = self.memory_usage.load(std::sync::atomic::Ordering::Relaxed);
        if current > self.max_memory {
            Err(ConsciousnessError::WasmMemoryExhausted {
                current_usage: current / (1024 * 1024),
                limit: self.max_memory / (1024 * 1024),
            })
        } else {
            Ok(())
        }
    }
}
```

### 6.2 Garbage Collection Strategy

```rust
/// Automatic cleanup for expired data
pub struct MemoryGarbageCollector {
    last_cleanup: u64,
    cleanup_interval: u64, // milliseconds
}

impl MemoryGarbageCollector {
    pub fn new(cleanup_interval_ms: u64) -> Self {
        Self {
            last_cleanup: 0,
            cleanup_interval: cleanup_interval_ms,
        }
    }
    
    pub fn maybe_cleanup(&mut self, characters: &mut [Character], current_time: u64) {
        if current_time - self.last_cleanup > self.cleanup_interval {
            self.cleanup_expired_memories(characters, current_time);
            self.cleanup_old_events(characters, current_time);
            self.last_cleanup = current_time;
        }
    }
    
    fn cleanup_expired_memories(&self, characters: &mut [Character], current_time: u64) {
        for character in characters.iter_mut() {
            character.memories.retain(|memory| {
                // Keep memories that are still significant or recent
                memory.significance > 0.1 || (current_time - memory.timestamp) < 86400000 // 24 hours
            });
            
            // Enforce memory limit
            if character.memories.len() > 50 {
                character.memories.sort_by(|a, b| b.significance.partial_cmp(&a.significance).unwrap());
                character.memories.truncate(50);
            }
        }
    }
}
```

---

## 7. WASM Integration Design

### 7.1 Async Operation Handling

```rust
use wasm_bindgen_futures::JsFuture;
use js_sys::Promise;

#[wasm_bindgen]
pub struct AsyncConsciousnessProcessor {
    processor: ConsciousnessProcessor,
}

#[wasm_bindgen]
impl AsyncConsciousnessProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            processor: ConsciousnessProcessor::new(),
        }
    }
    
    /// Process large batches asynchronously to avoid blocking main thread
    #[wasm_bindgen]
    pub async fn process_batch_async(&mut self, characters: &JsValue) -> Result<JsValue, JsValue> {
        let characters: Vec<Character> = serde_wasm_bindgen::from_value(characters.clone())
            .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;
        
        // Process in chunks to allow yielding to event loop
        let chunk_size = 100;
        let mut results = Vec::new();
        
        for chunk in characters.chunks(chunk_size) {
            // Yield to JavaScript event loop between chunks
            JsFuture::from(Promise::resolve(&JsValue::NULL)).await.ok();
            
            let chunk_results = self.processor.process_characters(chunk)
                .map_err(|e| JsValue::from_str(&format!("Processing error: {}", e)))?;
            
            results.extend(chunk_results);
        }
        
        serde_wasm_bindgen::to_value(&results)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }
}
```

### 7.2 Fallback Mechanism

```rust
/// Feature detection and fallback for non-WASM environments
#[wasm_bindgen]
pub fn is_wasm_supported() -> bool {
    // Check if we're running in WASM environment
    cfg!(target_arch = "wasm32")
}

#[wasm_bindgen]
pub fn get_fallback_message() -> String {
    "WASM not supported. Please use JavaScript implementation.".to_string()
}

/// JavaScript wrapper with fallback
#[wasm_bindgen]
pub struct ConsciousnessEngineWrapper {
    use_wasm: bool,
    wasm_processor: Option<AsyncConsciousnessProcessor>,
}

#[wasm_bindgen]
impl ConsciousnessEngineWrapper {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let use_wasm = is_wasm_supported();
        let wasm_processor = if use_wasm {
            Some(AsyncConsciousnessProcessor::new())
        } else {
            None
        };
        
        Self {
            use_wasm,
            wasm_processor,
        }
    }
    
    #[wasm_bindgen]
    pub fn should_use_wasm(&self) -> bool {
        self.use_wasm
    }
}
```

---

## 8. Testing Strategy

### 8.1 Property-Based Testing with Fuzzing

```rust
#[cfg(test)]
mod fuzz_tests {
    use super::*;
    use quickcheck::{quickcheck, TestResult, Arbitrary, Gen};
    
    impl Arbitrary for Character {
        fn arbitrary(g: &mut Gen) -> Self {
            Character {
                id: String::arbitrary(g),
                consciousness: ConsciousnessState::arbitrary(g),
                attributes: Attributes::arbitrary(g),
                personality: Personality::arbitrary(g),
                memories: Vec::arbitrary(g),
                goals: Vec::arbitrary(g),
                behavioral_state: Option::arbitrary(g),
            }
        }
    }
    
    quickcheck! {
        fn consciousness_frequency_bounds(freq: f64) -> TestResult {
            if !freq.is_finite() {
                return TestResult::discard();
            }
            
            let energy = ConsciousnessState::map_frequency_to_energy(freq);
            
            // Verify mapping is consistent and doesn't panic
            let remapped = ConsciousnessState::map_frequency_to_energy(freq);
            TestResult::from_bool(energy == remapped)
        }
        
        fn interaction_weight_bounds(character: Character, interaction: Interaction) -> TestResult {
            match InteractionWeightCalculator::calculate_interaction_weight(
                &character, 
                &interaction, 
                &InteractionContext::default()
            ) {
                Ok(weight) => TestResult::from_bool(weight >= 0.0 && weight <= 10.0),
                Err(_) => TestResult::passed(), // Errors are acceptable
            }
        }
        
        fn memory_significance_bounds(event: InteractionEvent, context: MemoryContext) -> TestResult {
            match EventSignificanceCalculator::calculate_significance(&event, &context) {
                Ok(significance) => TestResult::from_bool(significance >= 0.0 && significance <= 1.0),
                Err(_) => TestResult::passed(),
            }
        }
    }
}
```

### 8.2 Performance Baseline Measurement

```rust
/// Performance baseline measurement for comparison
pub struct PerformanceBaseline {
    js_baseline_times: std::collections::HashMap<String, f64>,
}

impl PerformanceBaseline {
    pub fn new() -> Self {
        let mut baseline_times = std::collections::HashMap::new();
        
        // Expected JavaScript performance baselines (in milliseconds)
        baseline_times.insert("calculate_interaction_weight".to_string(), 4.2); // 42s / 10k NPCs
        baseline_times.insert("get_behavioral_modifier".to_string(), 2.1);
        baseline_times.insert("calculate_memory_significance".to_string(), 1.5);
        baseline_times.insert("batch_1000_npcs".to_string(), 4200.0); // 4.2s for 1k NPCs
        
        Self {
            js_baseline_times: baseline_times,
        }
    }
    
    pub fn validate_performance_improvement(&self, function_name: &str, rust_time_ms: f64) -> Result<f64, String> {
        if let Some(js_time) = self.js_baseline_times.get(function_name) {
            let improvement_factor = js_time / rust_time_ms;
            
            if improvement_factor < 5.0 {
                Err(format!(
                    "Performance improvement below minimum threshold. Expected >5x, got {:.1}x", 
                    improvement_factor
                ))
            } else {
                Ok(improvement_factor)
            }
        } else {
            Err(format!("No baseline found for function: {}", function_name))
        }
    }
}
```