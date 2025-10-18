//! Object pooling for high-performance batch operations
//! 
//! Reduces allocation overhead by reusing ConsciousnessState and BehavioralState objects.
//! Uses thread-local storage for zero-contention pooling.

use std::cell::RefCell;
use crate::types::{ConsciousnessState, BehavioralState};

// Thread-local pool for ConsciousnessState and BehavioralState objects
thread_local! {
    static CONSCIOUSNESS_POOL: RefCell<Vec<ConsciousnessState>> = RefCell::new(Vec::new());
    static BEHAVIORAL_POOL: RefCell<Vec<BehavioralState>> = RefCell::new(Vec::new());
}

/// Maximum pool size to prevent unbounded memory growth
const MAX_POOL_SIZE: usize = 1000;

/// Get a ConsciousnessState from the pool or create a new one
#[inline(always)]
pub fn get_pooled_consciousness_state() -> ConsciousnessState {
    CONSCIOUSNESS_POOL.with(|pool| {
        pool.borrow_mut()
            .pop()
            .unwrap_or_else(ConsciousnessState::default)
    })
}

/// Return a ConsciousnessState to the pool for reuse
#[inline(always)]
pub fn return_pooled_consciousness_state(state: ConsciousnessState) {
    CONSCIOUSNESS_POOL.with(|pool| {
        let mut pool = pool.borrow_mut();
        if pool.len() < MAX_POOL_SIZE {
            pool.push(state);
        }
        // If pool is full, drop the state (let it be deallocated)
    });
}

/// Get a BehavioralState from the pool or create a new one
#[inline(always)]
pub fn get_pooled_behavioral_state() -> BehavioralState {
    BEHAVIORAL_POOL.with(|pool| {
        pool.borrow_mut()
            .pop()
            .unwrap_or_else(BehavioralState::default)
    })
}

/// Return a BehavioralState to the pool for reuse
#[inline(always)]
pub fn return_pooled_behavioral_state(state: BehavioralState) {
    BEHAVIORAL_POOL.with(|pool| {
        let mut pool = pool.borrow_mut();
        if pool.len() < MAX_POOL_SIZE {
            pool.push(state);
        }
    });
}

/// Clear all pools (useful for testing or memory cleanup)
pub fn clear_all_pools() {
    CONSCIOUSNESS_POOL.with(|pool| pool.borrow_mut().clear());
    BEHAVIORAL_POOL.with(|pool| pool.borrow_mut().clear());
}

/// Get current pool sizes (for monitoring)
pub fn get_pool_stats() -> (usize, usize) {
    let consciousness_size = CONSCIOUSNESS_POOL.with(|pool| pool.borrow().len());
    let behavioral_size = BEHAVIORAL_POOL.with(|pool| pool.borrow().len());
    (consciousness_size, behavioral_size)
}

/// Process a batch of consciousness states using pooled objects
/// 
/// This function demonstrates how to use the object pool for batch operations
#[inline]
pub fn process_batch_with_pooling<F>(
    count: usize,
    mut process_fn: F,
) -> Vec<BehavioralState>
where
    F: FnMut(usize) -> (f64, f64), // Returns (frequency, coherence) for each index
{
    let mut results = Vec::with_capacity(count);
    
    for i in 0..count {
        let (frequency, coherence) = process_fn(i);
        
        // Get a pooled state (or create new if pool empty)
        let mut state = get_pooled_behavioral_state();
        
        // Update the state with new values
        state.energy = crate::consciousness_module::map_frequency_to_energy(frequency);
        state.focus = crate::consciousness_module::map_coherence_to_focus(coherence);
        state.mood = crate::consciousness_module::calculate_mood_from_state(frequency, coherence);
        state.social_drive = crate::consciousness_module::calculate_social_drive(frequency);
        state.risk_tolerance = crate::consciousness_module::calculate_risk_tolerance(frequency);
        state.ambition = crate::consciousness_module::calculate_ambition(frequency, coherence);
        state.cached_timestamp = 0;
        
        results.push(state);
        // Note: We don't return the state to pool here because it's being returned to caller
        // The caller should return it when done
    }
    
    results
}

/// Return a batch of behavioral states to the pool
#[inline]
pub fn return_batch_to_pool(states: Vec<BehavioralState>) {
    for state in states {
        return_pooled_behavioral_state(state);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_consciousness_state_pooling() {
        // Clear pool before test
        clear_all_pools();
        
        // Get a state from empty pool (should create new)
        let state1 = get_pooled_consciousness_state();
        assert_eq!(state1.base_frequency, 7.5); // Default value
        
        // Return it to pool
        return_pooled_consciousness_state(state1);
        
        // Check pool has 1 item
        let (cons_size, _) = get_pool_stats();
        assert_eq!(cons_size, 1);
        
        // Get it back (should reuse)
        let state2 = get_pooled_consciousness_state();
        assert_eq!(state2.base_frequency, 7.5);
        
        // Pool should be empty now
        let (cons_size, _) = get_pool_stats();
        assert_eq!(cons_size, 0);
    }

    #[test]
    fn test_behavioral_state_pooling() {
        clear_all_pools();
        
        let state1 = get_pooled_behavioral_state();
        return_pooled_behavioral_state(state1);
        
        let (_, behav_size) = get_pool_stats();
        assert_eq!(behav_size, 1);
        
        let state2 = get_pooled_behavioral_state();
        let (_, behav_size) = get_pool_stats();
        assert_eq!(behav_size, 0);
        
        // Verify it's the default state
        assert_eq!(state2.social_drive, 0.5);
    }

    #[test]
    fn test_pool_size_limit() {
        clear_all_pools();
        
        // Try to overflow pool by returning more than MAX_POOL_SIZE
        // We create NEW states (not getting from pool) to test the limit
        for i in 0..1500 {
            let mut state = BehavioralState::default();
            state.cached_timestamp = i as u64;
            return_pooled_behavioral_state(state);
        }
        
        // Pool should be capped at MAX_POOL_SIZE
        let (_, behav_size) = get_pool_stats();
        assert_eq!(behav_size, MAX_POOL_SIZE);
    }

    #[test]
    fn test_batch_processing_with_pooling() {
        clear_all_pools();
        
        // Process a batch
        let results = process_batch_with_pooling(100, |i| {
            let freq = 5.0 + (i as f64) * 0.1;
            let coh = 0.5 + (i as f64) * 0.001;
            (freq, coh)
        });
        
        assert_eq!(results.len(), 100);
        
        // Verify results have different values
        assert_ne!(results[0].ambition, results[50].ambition);
        
        // Return batch to pool
        return_batch_to_pool(results);
        
        // Check pool size
        let (_, behav_size) = get_pool_stats();
        assert_eq!(behav_size, 100);
    }

    #[test]
    fn test_thread_local_isolation() {
        clear_all_pools();
        
        // Add states to pool
        for _ in 0..10 {
            return_pooled_behavioral_state(BehavioralState::default());
        }
        
        let (_, behav_size) = get_pool_stats();
        assert_eq!(behav_size, 10);
        
        // Spawn a thread - should have its own empty pool
        let handle = std::thread::spawn(|| {
            let (_, behav_size) = get_pool_stats();
            assert_eq!(behav_size, 0); // New thread has empty pool
        });
        
        handle.join().unwrap();
        
        // Original thread still has 10
        let (_, behav_size) = get_pool_stats();
        assert_eq!(behav_size, 10);
    }

    #[test]
    fn test_clear_all_pools() {
        // Add states
        for _ in 0..50 {
            return_pooled_consciousness_state(ConsciousnessState::default());
            return_pooled_behavioral_state(BehavioralState::default());
        }
        
        let (cons_size, behav_size) = get_pool_stats();
        assert_eq!(cons_size, 50);
        assert_eq!(behav_size, 50);
        
        // Clear
        clear_all_pools();
        
        let (cons_size, behav_size) = get_pool_stats();
        assert_eq!(cons_size, 0);
        assert_eq!(behav_size, 0);
    }

    #[test]
    fn test_pooling_reuse() {
        clear_all_pools();
        
        // Create states with distinct values
        let mut state = get_pooled_behavioral_state();
        state.social_drive = 0.999;
        state.cached_timestamp = 12345;
        
        // Return to pool
        return_pooled_behavioral_state(state);
        
        // Get it back
        let reused = get_pooled_behavioral_state();
        
        // Should have the same values (proving reuse)
        assert_eq!(reused.social_drive, 0.999);
        assert_eq!(reused.cached_timestamp, 12345);
    }
}
