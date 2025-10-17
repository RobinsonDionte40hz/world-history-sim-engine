//! # Consciousness Engine
//!
//! Consciousness Engine - Rust/WebAssembly Implementation
//! High-performance NPC consciousness simulation for historical world simulation

pub mod consciousness_module;
pub mod memory_module;
pub mod decision;
pub mod emotion;
pub mod types;
pub mod wasm;

pub use consciousness_module::*;
pub use memory_module::*;
pub use decision::*;
pub use emotion::*;
pub use types::*;
pub use wasm::*;

// Re-export commonly used types
pub use types::{Character, ConsciousnessState, Interaction};

// Global allocator for WASM optimization
#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

/// Initialize the consciousness engine for WASM environment
#[cfg(target_arch = "wasm32")]
pub fn init() {
    // Set up panic hook for better error messages in WASM
    console_error_panic_hook::set_once();

    // Initialize logging (if needed)
    wasm_logger::init(wasm_logger::Config::default());
}

/// Check if running in WASM environment
pub fn is_wasm() -> bool {
    cfg!(target_arch = "wasm32")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_wasm() {
        // This will be false during normal testing
        assert!(!is_wasm());
    }
}
