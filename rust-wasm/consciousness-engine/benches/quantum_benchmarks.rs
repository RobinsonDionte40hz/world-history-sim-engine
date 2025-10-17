use criterion::{black_box, criterion_group, criterion_main, Criterion};
use consciousness_engine::consciousness_module::behavioral_state::{
    generate_behavioral_state, calculate_mood_from_state,
};

/// Benchmark simple frequency to energy mapping (matches JavaScript)
/// Note: This is now part of behavioral_state generation, benchmarked there

/// Benchmark complete behavioral state generation (matches JavaScript)
fn bench_behavioral_state(c: &mut Criterion) {
    c.bench_function("generate_behavioral_state_simple", |b| {
        b.iter(|| {
            black_box(generate_behavioral_state(
                black_box(7.5),
                black_box(0.7)
            ))
        })
    });
}

/// Benchmark batch processing of 1000 NPCs (realistic scenario)
fn bench_batch_1000_npcs(c: &mut Criterion) {
    c.bench_function("batch_1000_npcs", |b| {
        let frequencies: Vec<f64> = (0..1000).map(|i| 3.0 + (i as f64 % 12.0)).collect();
        let coherences: Vec<f64> = (0..1000).map(|i| 0.2 + (i as f64 % 80.0) / 100.0).collect();
        
        b.iter(|| {
            for i in 0..1000 {
                black_box(generate_behavioral_state(
                    black_box(frequencies[i]),
                    black_box(coherences[i])
                ));
            }
        })
    });
}

/// Benchmark batch processing of 10,000 NPCs (target scenario)
fn bench_batch_10000_npcs(c: &mut Criterion) {
    c.bench_function("batch_10000_npcs", |b| {
        let frequencies: Vec<f64> = (0..10000).map(|i| 3.0 + (i as f64 % 12.0)).collect();
        let coherences: Vec<f64> = (0..10000).map(|i| 0.2 + (i as f64 % 80.0) / 100.0).collect();
        
        b.iter(|| {
            for i in 0..10000 {
                black_box(generate_behavioral_state(
                    black_box(frequencies[i]),
                    black_box(coherences[i])
                ));
            }
        })
    });
}

/// Benchmark mood calculation
fn bench_mood_calculation(c: &mut Criterion) {
    c.bench_function("calculate_mood_simple", |b| {
        b.iter(|| {
            black_box(calculate_mood_from_state(
                black_box(7.5),
                black_box(0.7)
            ))
        })
    });
}

criterion_group!(
    benches,
    bench_behavioral_state,
    bench_mood_calculation,
    bench_batch_1000_npcs,
    bench_batch_10000_npcs
);
criterion_main!(benches);