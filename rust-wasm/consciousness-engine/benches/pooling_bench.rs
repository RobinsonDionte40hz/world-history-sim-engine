use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use consciousness_engine::{
    generate_behavioral_state, BehavioralState,
    get_pooled_behavioral_state, return_pooled_behavioral_state,
    process_batch_with_pooling, return_batch_to_pool, clear_all_pools,
};

/// Benchmark: Create new behavioral states (no pooling)
fn bench_without_pooling(c: &mut Criterion) {
    let mut group = c.benchmark_group("without_pooling");
    
    for size in [10, 100, 1000].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(size), size, |b, &size| {
            b.iter(|| {
                let mut states = Vec::with_capacity(size);
                for i in 0..size {
                    let freq = 5.0 + (i as f64) * 0.01;
                    let coh = 0.5 + (i as f64) * 0.001;
                    let state = generate_behavioral_state(freq, coh);
                    states.push(black_box(state));
                }
                black_box(states)
            });
        });
    }
    
    group.finish();
}

/// Benchmark: Use pooled behavioral states
fn bench_with_pooling(c: &mut Criterion) {
    let mut group = c.benchmark_group("with_pooling");
    
    for size in [10, 100, 1000].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(size), size, |b, &size| {
            // Pre-warm the pool
            clear_all_pools();
            for _ in 0..size {
                return_pooled_behavioral_state(BehavioralState::default());
            }
            
            b.iter(|| {
                let mut states = Vec::with_capacity(size);
                for i in 0..size {
                    let freq = 5.0 + (i as f64) * 0.01;
                    let coh = 0.5 + (i as f64) * 0.001;
                    
                    let mut state = get_pooled_behavioral_state();
                    state.energy = consciousness_engine::map_frequency_to_energy(freq);
                    state.focus = consciousness_engine::map_coherence_to_focus(coh);
                    state.mood = consciousness_engine::calculate_mood_from_state(freq, coh);
                    state.social_drive = consciousness_engine::calculate_social_drive(freq);
                    state.risk_tolerance = consciousness_engine::calculate_risk_tolerance(freq);
                    state.ambition = consciousness_engine::calculate_ambition(freq, coh);
                    
                    states.push(black_box(state));
                }
                
                // Return to pool
                return_batch_to_pool(states);
            });
        });
    }
    
    group.finish();
}

/// Benchmark: Sequential operations (realistic pattern)
fn bench_sequential_with_pooling(c: &mut Criterion) {
    c.bench_function("sequential_100_with_pooling", |b| {
        clear_all_pools();
        
        // Pre-warm pool
        for _ in 0..100 {
            return_pooled_behavioral_state(BehavioralState::default());
        }
        
        b.iter(|| {
            for i in 0..100 {
                let freq = 5.0 + (i as f64) * 0.01;
                let coh = 0.5 + (i as f64) * 0.001;
                
                let mut state = get_pooled_behavioral_state();
                state.energy = consciousness_engine::map_frequency_to_energy(freq);
                state.focus = consciousness_engine::map_coherence_to_focus(coh);
                state.mood = consciousness_engine::calculate_mood_from_state(freq, coh);
                
                // Use the state (simulated)
                black_box(&state);
                
                // Return immediately
                return_pooled_behavioral_state(state);
            }
        });
    });
}

/// Benchmark: Sequential operations (no pooling)
fn bench_sequential_without_pooling(c: &mut Criterion) {
    c.bench_function("sequential_100_without_pooling", |b| {
        b.iter(|| {
            for i in 0..100 {
                let freq = 5.0 + (i as f64) * 0.01;
                let coh = 0.5 + (i as f64) * 0.001;
                
                let state = generate_behavioral_state(freq, coh);
                
                // Use the state (simulated)
                black_box(&state);
                
                // State is dropped here
            }
        });
    });
}

/// Benchmark: Pool overhead (get/return only)
fn bench_pool_overhead(c: &mut Criterion) {
    clear_all_pools();
    
    // Pre-warm pool with 100 states
    for _ in 0..100 {
        return_pooled_behavioral_state(BehavioralState::default());
    }
    
    c.bench_function("pool_get_return_overhead", |b| {
        b.iter(|| {
            let state = get_pooled_behavioral_state();
            black_box(&state);
            return_pooled_behavioral_state(state);
        });
    });
}

/// Benchmark: Allocation overhead (baseline)
fn bench_allocation_overhead(c: &mut Criterion) {
    c.bench_function("allocation_overhead", |b| {
        b.iter(|| {
            let state = BehavioralState::default();
            black_box(&state);
            // State is dropped
        });
    });
}

/// Benchmark: Batch processing helper function
fn bench_process_batch_helper(c: &mut Criterion) {
    let mut group = c.benchmark_group("batch_helper");
    
    for size in [10, 100, 1000].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(size), size, |b, &size| {
            clear_all_pools();
            
            b.iter(|| {
                let states = process_batch_with_pooling(size, |i| {
                    let freq = 5.0 + (i as f64) * 0.01;
                    let coh = 0.5 + (i as f64) * 0.001;
                    (freq, coh)
                });
                
                return_batch_to_pool(black_box(states));
            });
        });
    }
    
    group.finish();
}

/// Benchmark: Cold pool vs warm pool
fn bench_cold_vs_warm_pool(c: &mut Criterion) {
    let mut group = c.benchmark_group("cold_vs_warm");
    
    // Cold pool (empty)
    group.bench_function("cold_pool", |b| {
        b.iter(|| {
            clear_all_pools();
            let state = get_pooled_behavioral_state();
            black_box(&state);
            return_pooled_behavioral_state(state);
        });
    });
    
    // Warm pool (pre-filled)
    group.bench_function("warm_pool", |b| {
        clear_all_pools();
        for _ in 0..1000 {
            return_pooled_behavioral_state(BehavioralState::default());
        }
        
        b.iter(|| {
            let state = get_pooled_behavioral_state();
            black_box(&state);
            return_pooled_behavioral_state(state);
        });
    });
    
    group.finish();
}

criterion_group!(
    benches,
    bench_without_pooling,
    bench_with_pooling,
    bench_sequential_with_pooling,
    bench_sequential_without_pooling,
    bench_pool_overhead,
    bench_allocation_overhead,
    bench_process_batch_helper,
    bench_cold_vs_warm_pool,
);

criterion_main!(benches);
