use std::time::Instant;
use consciousness_engine::consciousness_module::behavioral_state::{
    generate_behavioral_state, 
    calculate_mood_from_state
};

// Simple implementations matching JavaScript base
// Note: These are NOT quantum algorithms - just simple formulas optimized by Rust compilation

#[test]
fn performance_test() {
    println!("Running Consciousness Performance Tests");
    println!("========================================");
    println!("Note: These are simple formulas matching JavaScript, NOT quantum algorithms");
    println!("Performance gains come from Rust's compiled efficiency\n");

    let iterations = 100000;

    // Behavioral state generation test
    println!("1. Behavioral State Generation Performance Test");
    println!("-----------------------------------------------");

    let start = Instant::now();
    for i in 0..iterations {
        let frequency = 3.0 + (i % 12) as f64;
        let coherence = 0.2 + ((i % 80) as f64 / 100.0);
        let _result = generate_behavioral_state(frequency, coherence);
    }
    let rust_time = start.elapsed();

    println!("Rust (compiled): {:?}", rust_time);
    println!("Processing rate: {:.2} ops/sec", iterations as f64 / rust_time.as_secs_f64());

    // Mood calculation test
    println!("\n2. Mood Calculation Performance Test");
    println!("-------------------------------------");

    let start = Instant::now();
    for i in 0..iterations {
        let frequency = 3.0 + (i % 12) as f64;
        let coherence = 0.2 + ((i % 80) as f64 / 100.0);
        let _result = calculate_mood_from_state(frequency, coherence);
    }
    let mood_time = start.elapsed();

    println!("Rust (compiled): {:?}", mood_time);
    println!("Processing rate: {:.2} ops/sec", iterations as f64 / mood_time.as_secs_f64());

    // Batch NPC processing simulation
    println!("\n3. Batch NPC Processing Simulation (10,000 NPCs)");
    println!("------------------------------------------------");

    let npc_count = 10000;
    let frequencies: Vec<f64> = (0..npc_count).map(|i| 3.0 + (i % 12) as f64).collect();
    let coherences: Vec<f64> = (0..npc_count).map(|i| 0.2 + ((i % 80) as f64 / 100.0)).collect();

    let start = Instant::now();
    for i in 0..npc_count {
        let _result = generate_behavioral_state(frequencies[i], coherences[i]);
    }
    let batch_time = start.elapsed();

    println!("Rust (compiled): {:?}", batch_time);
    println!("NPCs per second: {:.2}", npc_count as f64 / batch_time.as_secs_f64());
    println!("Average time per NPC: {:.2} µs", batch_time.as_micros() as f64 / npc_count as f64);

    println!("\nPerformance test completed!");
    println!("Target: Process 10,000 NPCs in <1 second (currently: {:?})", batch_time);
}