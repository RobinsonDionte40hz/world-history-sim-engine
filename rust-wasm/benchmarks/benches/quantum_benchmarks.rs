use criterion::{black_box, criterion_group, criterion_main, Criterion};
use consciousness_engine::{
    consciousness_module::{
        behavioral_state::QuantumBehavioralCalculator,
        consciousness_update::QuantumConsciousnessStreamer,
        frequency_mapping::QuantumFrequencyCalculator,
    },
    decision::decision_engine::QuantumDecisionCalculator,
    types::{
        consciousness::{ConsciousnessState, EmotionalState, SignificantEvent},
        decision::{DecisionOption, DecisionContext},
        memory::{Memory, MemoryContext},
        interaction::InteractionType,
        events::ConsciousnessEvent,
    },
};

fn benchmark_quantum_vs_traditional(c: &mut Criterion) {
    // Frequency mapping benchmark
    c.bench_function("quantum_frequency_mapping", |b| {
        b.iter(|| {
            let base_freq = 7.5;
            let coherence = 0.8;
            let emotional_state = EmotionalState::Excited;
            let external_influences = vec![0.1, 0.2, 0.3];

            black_box(QuantumFrequencyCalculator::calculate_resonant_frequency(
                base_freq,
                coherence,
                &emotional_state,
                &external_influences,
            ))
        });
    });

    // Traditional frequency mapping for comparison
    c.bench_function("traditional_frequency_mapping", |b| {
        b.iter(|| {
            let base_freq = 7.5;
            let coherence = 0.8;
            let emotional_modifier = match EmotionalState::Excited {
                EmotionalState::Joyful => 1.2,
                EmotionalState::Excited => 1.1,
                EmotionalState::Content => 1.0,
                EmotionalState::Surprised => 0.9,
                EmotionalState::Anxious => 0.7,
                EmotionalState::Fearful => 0.6,
                EmotionalState::Angry => 0.5,
                EmotionalState::Depressed => 0.4,
            };

            black_box(base_freq * coherence * emotional_modifier)
        });
    });

    // Behavioral state calculation benchmark
    c.bench_function("quantum_behavioral_state", |b| {
        b.iter(|| {
            let consciousness_state = ConsciousnessState {
                base_frequency: 7.5,
                base_coherence: 0.8,
                current_frequency: 8.0,
                emotional_coherence: 0.9,
                emotional_state: EmotionalState::Excited,
                last_update: 1000,
            };

            let recent_events = vec![];
            let environmental_factors = vec![0.1, 0.2, 0.3];

            black_box(QuantumBehavioralCalculator::calculate_quantum_behavioral_state(
                &consciousness_state,
                &recent_events,
                &environmental_factors,
            ))
        });
    });

    // Decision making benchmark
    c.bench_function("quantum_decision_making", |b| {
        b.iter(|| {
            let options = vec![
                DecisionOption {
                    id: "opt1".to_string(),
                    description: "Help friend".to_string(),
                    utility_score: 0.8,
                    risk_level: Some(0.2),
                    target_character: "friend".to_string(),
                    target_node: "town".to_string(),
                    emotional_impact: Some(0.6),
                },
                DecisionOption {
                    id: "opt2".to_string(),
                    description: "Pursue goal".to_string(),
                    utility_score: 0.5,
                    risk_level: Some(0.1),
                    target_character: "self".to_string(),
                    target_node: "goal".to_string(),
                    emotional_impact: Some(0.2),
                },
            ];

            let context = DecisionContext {
                urgency: 0.7,
                social_pressure: 0.5,
                time_available: 3600,
                current_emotional_state: "excited".to_string(),
            };

            let consciousness_state = ConsciousnessState {
                base_frequency: 7.5,
                base_coherence: 0.8,
                current_frequency: 8.0,
                emotional_coherence: 0.9,
                emotional_state: EmotionalState::Excited,
                last_update: 1000,
            };

            let relevant_memories = vec![];

            black_box(QuantumDecisionCalculator::quantum_decide(
                &options,
                &context,
                &consciousness_state,
                &relevant_memories,
            ))
        });
    });

    // Consciousness streaming benchmark
    c.bench_function("quantum_consciousness_streaming", |b| {
        b.iter(|| {
            let current_state = ConsciousnessState {
                base_frequency: 7.5,
                base_coherence: 0.8,
                current_frequency: 7.5,
                emotional_coherence: 0.8,
                emotional_state: EmotionalState::Content,
                last_update: 1000,
            };

            let events = vec![
                ConsciousnessEvent {
                    event_type: "SocialInteraction".to_string(),
                    intensity: 0.7,
                    timestamp: 1100,
                    context: Some("town".to_string()),
                    participants: vec!["char1".to_string(), "char2".to_string()],
                },
            ];

            black_box(QuantumConsciousnessStreamer::process_streaming_update(&current_state, &events, 100))
        });
    });
}

criterion_group!(benches, benchmark_quantum_vs_traditional);
criterion_main!(benches);