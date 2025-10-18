use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId, Throughput};
use consciousness_engine::{
    ConsciousnessState, EmotionalState,
    generate_behavioral_state,
};
use consciousness_engine::emotion::EmotionalUtils;

/// Generate a test consciousness state
fn generate_state(seed: u32) -> ConsciousnessState {
    ConsciousnessState {
        base_frequency: 3.0 + (seed % 12) as f64,
        base_coherence: 0.2 + ((seed % 80) as f64 / 100.0),
        current_frequency: 3.0 + (seed % 12) as f64,
        emotional_coherence: 0.2 + ((seed % 80) as f64 / 100.0),
        emotional_state: match seed % 5 {
            0 => EmotionalState::Content,
            1 => EmotionalState::Excited,
            2 => EmotionalState::Anxious,
            3 => EmotionalState::Depressed,
            _ => EmotionalState::Joyful,
        },
        last_update: seed as u64,
    }
}

/// Benchmark single behavioral state calculation
fn bench_single_behavioral_state(c: &mut Criterion) {
    let state = generate_state(42);
    
    c.bench_function("single_behavioral_state", |b| {
        b.iter(|| {
            generate_behavioral_state(black_box(state.current_frequency), black_box(state.emotional_coherence))
        });
    });
}

/// Benchmark batch behavioral state calculations
fn bench_batch_behavioral_states(c: &mut Criterion) {
    let mut group = c.benchmark_group("batch_behavioral_states");
    
    for size in [10, 100, 1000, 10000].iter() {
        let states: Vec<ConsciousnessState> = (0..*size)
            .map(|i| generate_state(i as u32))
            .collect();
        
        group.throughput(Throughput::Elements(*size as u64));
        group.bench_with_input(BenchmarkId::from_parameter(size), size, |b, _| {
            b.iter(|| {
                for state in &states {
                    black_box(generate_behavioral_state(
                        black_box(state.current_frequency),
                        black_box(state.emotional_coherence)
                    ));
                }
            });
        });
    }
    
    group.finish();
}

/// Benchmark emotional coherence calculation
fn bench_emotional_coherence(c: &mut Criterion) {
    c.bench_function("emotional_coherence", |b| {
        b.iter(|| {
            EmotionalUtils::calculate_emotional_coherence(black_box(7.5), black_box(0.7))
        });
    });
}

/// Benchmark emotional state determination
fn bench_emotional_state(c: &mut Criterion) {
    c.bench_function("emotional_state_determination", |b| {
        b.iter(|| {
            EmotionalUtils::determine_emotional_state(black_box(0.7), black_box(0.5))
        });
    });
}

/// Benchmark energy level calculation
fn bench_energy_level(c: &mut Criterion) {
    let state = generate_state(42);
    
    c.bench_function("energy_level_calculation", |b| {
        b.iter(|| {
            let result = generate_behavioral_state(
                black_box(state.current_frequency),
                black_box(state.emotional_coherence)
            );
            black_box(result.energy);
        });
    });
}

/// Benchmark focus level calculation
fn bench_focus_level(c: &mut Criterion) {
    let state = generate_state(42);
    
    c.bench_function("focus_level_calculation", |b| {
        b.iter(|| {
            let result = generate_behavioral_state(
                black_box(state.current_frequency),
                black_box(state.emotional_coherence)
            );
            black_box(result.focus);
        });
    });
}

/// Benchmark mood level calculation
fn bench_mood_level(c: &mut Criterion) {
    let state = generate_state(42);
    
    c.bench_function("mood_level_calculation", |b| {
        b.iter(|| {
            let result = generate_behavioral_state(
                black_box(state.current_frequency),
                black_box(state.emotional_coherence)
            );
            black_box(result.mood);
        });
    });
}

/// Benchmark complete workflow (realistic usage)
fn bench_realistic_workflow(c: &mut Criterion) {
    let states: Vec<ConsciousnessState> = (0..100)
        .map(|i| generate_state(i))
        .collect();
    
    c.bench_function("realistic_workflow_100", |b| {
        b.iter(|| {
            // Calculate behavioral states for 100 characters
            for state in &states {
                black_box(generate_behavioral_state(
                    black_box(state.current_frequency),
                    black_box(state.emotional_coherence)
                ));
            }
            
            // Calculate some emotional coherence values
            for i in 0..10 {
                black_box(EmotionalUtils::calculate_emotional_coherence(
                    black_box(7.5 + i as f64 * 0.1),
                    black_box(0.7)
                ));
            }
            
            // Determine some emotional states
            for i in 0..10 {
                black_box(EmotionalUtils::determine_emotional_state(
                    black_box(0.7),
                    black_box(0.5 + i as f64 * 0.05)
                ));
            }
        });
    });
}

/// Benchmark memory allocation patterns
fn bench_memory_patterns(c: &mut Criterion) {
    let mut group = c.benchmark_group("memory_patterns");
    
    // Test different allocation patterns
    group.bench_function("single_allocation", |b| {
        b.iter(|| {
            let state = generate_state(42);
            black_box(generate_behavioral_state(
                black_box(state.current_frequency),
                black_box(state.emotional_coherence)
            ))
        });
    });
    
    group.bench_function("repeated_allocation", |b| {
        b.iter(|| {
            for i in 0..100 {
                let state = generate_state(i);
                black_box(generate_behavioral_state(
                    black_box(state.current_frequency),
                    black_box(state.emotional_coherence)
                ));
            }
        });
    });
    
    group.bench_function("pre_allocated_batch", |b| {
        let states: Vec<ConsciousnessState> = (0..100)
            .map(|i| generate_state(i))
            .collect();
        
        b.iter(|| {
            for state in &states {
                black_box(generate_behavioral_state(
                    black_box(state.current_frequency),
                    black_box(state.emotional_coherence)
                ));
            }
        });
    });
    
    group.finish();
}

/// Benchmark different frequency ranges
fn bench_frequency_ranges(c: &mut Criterion) {
    let mut group = c.benchmark_group("frequency_ranges");
    
    let ranges = [
        ("delta", 0.5, 4.0),
        ("theta", 4.0, 8.0),
        ("alpha", 8.0, 13.0),
        ("beta", 13.0, 30.0),
        ("gamma", 30.0, 100.0),
    ];
    
    for (name, low, high) in ranges.iter() {
        let frequency = (low + high) / 2.0;
        let coherence = 0.7;
        
        group.bench_with_input(BenchmarkId::new("behavioral_state", name), &(frequency, coherence), |b, &(freq, coh)| {
            b.iter(|| generate_behavioral_state(black_box(freq), black_box(coh)));
        });
    }
    
    group.finish();
}

/// Benchmark different coherence levels
fn bench_coherence_levels(c: &mut Criterion) {
    let mut group = c.benchmark_group("coherence_levels");
    
    for coherence in [0.1, 0.3, 0.5, 0.7, 0.9].iter() {
        let frequency = 7.5;
        
        let id = BenchmarkId::new("behavioral_state", format!("{:.1}", coherence));
        group.bench_with_input(id, coherence, |b, &coh| {
            b.iter(|| generate_behavioral_state(black_box(frequency), black_box(coh)));
        });
    }
    
    group.finish();
}

criterion_group!(
    benches,
    bench_single_behavioral_state,
    bench_batch_behavioral_states,
    bench_emotional_coherence,
    bench_emotional_state,
    bench_energy_level,
    bench_focus_level,
    bench_mood_level,
    bench_realistic_workflow,
    bench_memory_patterns,
    bench_frequency_ranges,
    bench_coherence_levels,
);

criterion_main!(benches);
