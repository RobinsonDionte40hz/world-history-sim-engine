use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use consciousness_engine::{BehavioralState, EnergyLevel, FocusLevel, MoodLevel};
use serde_json;

/// Generate a test behavioral state
fn generate_behavioral_state(seed: u32) -> BehavioralState {
    BehavioralState {
        energy: match seed % 5 {
            0 => EnergyLevel::VeryLow,
            1 => EnergyLevel::Low,
            2 => EnergyLevel::Moderate,
            3 => EnergyLevel::High,
            _ => EnergyLevel::VeryHigh,
        },
        focus: match (seed / 5) % 3 {
            0 => FocusLevel::Scattered,
            1 => FocusLevel::Balanced,
            _ => FocusLevel::Focused,
        },
        mood: match (seed / 15) % 4 {
            0 => MoodLevel::Depressed,
            1 => MoodLevel::Content,
            2 => MoodLevel::Optimistic,
            _ => MoodLevel::Excited,
        },
        social_drive: ((seed % 100) as f64) / 100.0,
        risk_tolerance: (((seed / 100) % 100) as f64) / 100.0,
        ambition: (((seed / 10000) % 100) as f64) / 100.0,
        cached_timestamp: seed as u64,
    }
}

/// Benchmark serde JSON serialization (baseline)
fn bench_serde_json_serialization(c: &mut Criterion) {
    let state = generate_behavioral_state(42);
    
    c.bench_function("serde_json_serialize", |b| {
        b.iter(|| {
            black_box(serde_json::to_string(&state).unwrap())
        });
    });
}

/// Benchmark serde JSON deserialization (baseline)
fn bench_serde_json_deserialization(c: &mut Criterion) {
    let state = generate_behavioral_state(42);
    let json = serde_json::to_string(&state).unwrap();
    
    c.bench_function("serde_json_deserialize", |b| {
        b.iter(|| {
            black_box(serde_json::from_str::<BehavioralState>(&json).unwrap())
        });
    });
}

/// Benchmark fast binary serialization
fn bench_fast_binary_serialization(c: &mut Criterion) {
    let state = generate_behavioral_state(42);
    
    c.bench_function("fast_binary_serialize", |b| {
        b.iter(|| {
            black_box(state.to_binary())
        });
    });
}

/// Benchmark fast binary deserialization
fn bench_fast_binary_deserialization(c: &mut Criterion) {
    let state = generate_behavioral_state(42);
    let binary = state.to_binary();
    
    c.bench_function("fast_binary_deserialize", |b| {
        b.iter(|| {
            black_box(BehavioralState::from_binary(&binary).unwrap())
        });
    });
}

/// Benchmark complete roundtrip: serde JSON
fn bench_serde_json_roundtrip(c: &mut Criterion) {
    let state = generate_behavioral_state(42);
    
    c.bench_function("serde_json_roundtrip", |b| {
        b.iter(|| {
            let json = serde_json::to_string(black_box(&state)).unwrap();
            black_box(serde_json::from_str::<BehavioralState>(&json).unwrap())
        });
    });
}

/// Benchmark complete roundtrip: fast binary
fn bench_fast_binary_roundtrip(c: &mut Criterion) {
    let state = generate_behavioral_state(42);
    
    c.bench_function("fast_binary_roundtrip", |b| {
        b.iter(|| {
            let binary = black_box(&state).to_binary();
            black_box(BehavioralState::from_binary(&binary).unwrap())
        });
    });
}

/// Benchmark batch serialization comparison
fn bench_batch_serialization(c: &mut Criterion) {
    let mut group = c.benchmark_group("batch_serialization");
    
    for size in [10, 100, 1000].iter() {
        let states: Vec<BehavioralState> = (0..*size)
            .map(|i| generate_behavioral_state(i as u32))
            .collect();
        
        // Serde JSON batch
        group.bench_with_input(BenchmarkId::new("serde_json", size), size, |b, _| {
            b.iter(|| {
                for state in &states {
                    black_box(serde_json::to_string(state).unwrap());
                }
            });
        });
        
        // Fast binary batch
        group.bench_with_input(BenchmarkId::new("fast_binary", size), size, |b, _| {
            b.iter(|| {
                for state in &states {
                    black_box(state.to_binary());
                }
            });
        });
    }
    
    group.finish();
}

/// Benchmark batch deserialization comparison
fn bench_batch_deserialization(c: &mut Criterion) {
    let mut group = c.benchmark_group("batch_deserialization");
    
    for size in [10, 100, 1000].iter() {
        let states: Vec<BehavioralState> = (0..*size)
            .map(|i| generate_behavioral_state(i as u32))
            .collect();
        
        // Prepare serde JSON data
        let json_data: Vec<String> = states.iter()
            .map(|s| serde_json::to_string(s).unwrap())
            .collect();
        
        // Prepare binary data
        let binary_data: Vec<Vec<u8>> = states.iter()
            .map(|s| s.to_binary())
            .collect();
        
        // Serde JSON batch
        group.bench_with_input(BenchmarkId::new("serde_json", size), size, |b, _| {
            b.iter(|| {
                for json in &json_data {
                    black_box(serde_json::from_str::<BehavioralState>(json).unwrap());
                }
            });
        });
        
        // Fast binary batch
        group.bench_with_input(BenchmarkId::new("fast_binary", size), size, |b, _| {
            b.iter(|| {
                for binary in &binary_data {
                    black_box(BehavioralState::from_binary(binary).unwrap());
                }
            });
        });
    }
    
    group.finish();
}

/// Benchmark enum getters
fn bench_enum_getters(c: &mut Criterion) {
    let state = generate_behavioral_state(42);
    
    c.bench_function("energy_value_getter", |b| {
        b.iter(|| {
            black_box(state.energy_value())
        });
    });
    
    c.bench_function("focus_value_getter", |b| {
        b.iter(|| {
            black_box(state.focus_value())
        });
    });
    
    c.bench_function("mood_value_getter", |b| {
        b.iter(|| {
            black_box(state.mood_value())
        });
    });
}

criterion_group!(
    benches,
    bench_serde_json_serialization,
    bench_serde_json_deserialization,
    bench_fast_binary_serialization,
    bench_fast_binary_deserialization,
    bench_serde_json_roundtrip,
    bench_fast_binary_roundtrip,
    bench_batch_serialization,
    bench_batch_deserialization,
    bench_enum_getters,
);

criterion_main!(benches);
