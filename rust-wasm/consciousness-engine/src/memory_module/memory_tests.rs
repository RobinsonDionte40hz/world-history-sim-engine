//! Memory system unit tests
//! 
//! Comprehensive test suite for memory management functionality.
//! Requirements: REQ-2.1, REQ-2.2, REQ-2.3

#[cfg(test)]
mod tests {
    use crate::{
        Memory, MemoryContext, InteractionEvent, InteractionType,
        SignificantMemoryService, EventSignificanceCalculator,
    };

    // Helper function to create test memory
    fn create_test_memory(
        id: &str,
        timestamp: u64,
        significance: f64,
        emotional_impact: f64,
    ) -> Memory {
        Memory {
            id: id.to_string(),
            timestamp,
            significance,
            emotional_impact,
            interaction_type: InteractionType::Social,
            participants: vec!["npc_1".to_string(), "npc_2".to_string()],
            context: MemoryContext {
                node_id: "test_node".to_string(),
                location: Some("test_location".to_string()),
                goal_relevance: 0.5,
                novelty_factor: 0.3,
                social_importance: 0.4,
                survival_relevance: 0.2,
                participants: vec!["npc_1".to_string(), "npc_2".to_string()],
            },
            decay_factor: 1.0,
            interaction_id: format!("interaction_{}", id),
            outcome: "success".to_string(),
            location: "test_location".to_string(),
            context_tags: vec!["test".to_string()],
            description: format!("Test memory {}", id),
        }
    }

    // Helper function to create test interaction event
    fn create_test_event(
        timestamp: u64,
        emotional_impact: f64,
    ) -> InteractionEvent {
        InteractionEvent {
            id: "test_event".to_string(),
            timestamp,
            emotional_impact,
            participants: vec!["npc_1".to_string()],
            context: MemoryContext {
                node_id: "test_node".to_string(),
                location: Some("test_location".to_string()),
                goal_relevance: 0.5,
                novelty_factor: 0.3,
                social_importance: 0.4,
                survival_relevance: 0.2,
                participants: vec!["npc_1".to_string()],
            },
            interaction_type: InteractionType::Social,
        }
    }

    // Helper function to create test memory context
    fn create_test_context(
        goal_relevance: f64,
        novelty_factor: f64,
        social_importance: f64,
        survival_relevance: f64,
    ) -> MemoryContext {
        MemoryContext {
            node_id: "test_node".to_string(),
            location: Some("test_location".to_string()),
            goal_relevance,
            novelty_factor,
            social_importance,
            survival_relevance,
            participants: vec!["npc_1".to_string()],
        }
    }

    // ========================
    // Event Significance Tests
    // ========================

    #[test]
    fn test_calculate_significance_all_components() {
        let event = create_test_event(0, 0.8);
        let context = create_test_context(0.9, 0.7, 0.6, 0.5);

        let result = EventSignificanceCalculator::calculate_significance(&event, &context);
        
        assert!(result.is_ok());
        let significance = result.unwrap();
        
        // Expected: 0.8*0.4 + 0.9*0.3 + 0.7*0.2 + 0.6*0.1 + 0.5*0.1
        //         = 0.32 + 0.27 + 0.14 + 0.06 + 0.05 = 0.84
        assert!((significance - 0.84).abs() < 0.01, "Expected ~0.84, got {}", significance);
    }

    #[test]
    fn test_calculate_significance_zero_values() {
        let event = create_test_event(0, 0.0);
        let context = create_test_context(0.0, 0.0, 0.0, 0.0);

        let result = EventSignificanceCalculator::calculate_significance(&event, &context);
        
        assert!(result.is_ok());
        let significance = result.unwrap();
        assert_eq!(significance, 0.0);
    }

    #[test]
    fn test_calculate_significance_max_values() {
        let event = create_test_event(0, 1.0);
        let context = create_test_context(1.0, 1.0, 1.0, 1.0);

        let result = EventSignificanceCalculator::calculate_significance(&event, &context);
        
        assert!(result.is_ok());
        let significance = result.unwrap();
        
        // Expected: 1.0*0.4 + 1.0*0.3 + 1.0*0.2 + 1.0*0.1 + 1.0*0.1 = 1.1, clamped to 1.0
        assert_eq!(significance, 1.0);
    }

    #[test]
    fn test_calculate_significance_negative_emotional_impact() {
        let event = create_test_event(0, -0.8);
        let context = create_test_context(0.5, 0.5, 0.5, 0.5);

        let result = EventSignificanceCalculator::calculate_significance(&event, &context);
        
        assert!(result.is_ok());
        let significance = result.unwrap();
        
        // Emotional impact is taken as absolute value
        assert!(significance > 0.3); // Should still be significant
    }

    #[test]
    fn test_calculate_significance_bounds() {
        let event = create_test_event(0, 0.5);
        let context = create_test_context(0.5, 0.5, 0.5, 0.5);

        let result = EventSignificanceCalculator::calculate_significance(&event, &context);
        
        assert!(result.is_ok());
        let significance = result.unwrap();
        assert!(significance >= 0.0 && significance <= 1.0);
    }

    // ===========================
    // Significant Memory Tests
    // ===========================

    #[test]
    fn test_create_memory_from_event_above_threshold() {
        let event = create_test_event(1000, 0.8);
        let context = create_test_context(0.9, 0.7, 0.6, 0.5);

        let result = SignificantMemoryService::create_memory_from_event(&event, &context);
        
        assert!(result.is_ok());
        let memory_opt = result.unwrap();
        assert!(memory_opt.is_some());
        
        let memory = memory_opt.unwrap();
        assert!(memory.significance >= 0.3); // Above threshold
        assert_eq!(memory.timestamp, 1000);
        assert_eq!(memory.decay_factor, 1.0);
    }

    #[test]
    fn test_create_memory_from_event_below_threshold() {
        let event = create_test_event(1000, 0.1);
        let context = create_test_context(0.1, 0.1, 0.1, 0.1);

        let result = SignificantMemoryService::create_memory_from_event(&event, &context);
        
        assert!(result.is_ok());
        let memory_opt = result.unwrap();
        assert!(memory_opt.is_none()); // Below threshold, not stored
    }

    #[test]
    fn test_store_memory_within_limit() {
        let mut memories = Vec::new();
        let new_memory = create_test_memory("mem_1", 1000, 0.8, 0.5);

        let result = SignificantMemoryService::store_memory(&mut memories, new_memory);
        
        assert!(result.is_ok());
        assert_eq!(memories.len(), 1);
    }

    #[test]
    fn test_store_memory_enforce_limit() {
        let mut memories: Vec<Memory> = (0..50)
            .map(|i| create_test_memory(&format!("mem_{}", i), i as u64 * 1000, 0.5, 0.3))
            .collect();

        // Add one more memory, should trigger pruning
        let new_memory = create_test_memory("mem_new", 100000, 0.9, 0.8);
        let result = SignificantMemoryService::store_memory(&mut memories, new_memory);

        assert!(result.is_ok());
        assert_eq!(memories.len(), 50); // Should be pruned to limit
        
        // Most significant memory should be retained
        assert!(memories.iter().any(|m| m.id == "mem_new"));
    }

    #[test]
    fn test_retrieve_relevant_memories() {
        let mut memories = vec![
            create_test_memory("mem_1", 1000, 0.9, 0.7),
            create_test_memory("mem_2", 2000, 0.8, 0.6),
            create_test_memory("mem_3", 3000, 0.7, 0.5),
        ];
        
        // Set different interaction types
        memories[1].interaction_type = InteractionType::Combat;
        memories[2].interaction_type = InteractionType::Exploration;

        let relevant = SignificantMemoryService::retrieve_relevant_memories(
            &memories,
            &InteractionType::Social,
            5,
        );

        assert_eq!(relevant.len(), 1); // Only one Social interaction
        assert_eq!(relevant[0].id, "mem_1");
    }

    #[test]
    fn test_retrieve_relevant_memories_max_count() {
        let memories: Vec<Memory> = (0..10)
            .map(|i| create_test_memory(&format!("mem_{}", i), i as u64 * 1000, 0.5 + (i as f64 * 0.05), 0.5))
            .collect();

        let relevant = SignificantMemoryService::retrieve_relevant_memories(
            &memories,
            &InteractionType::Social,
            3,
        );

        assert_eq!(relevant.len(), 3); // Limited to max_count
        // Should be sorted by weighted significance
        assert!(relevant[0].significance >= relevant[1].significance);
    }

    #[test]
    fn test_calculate_memory_influence_positive() {
        let memories = vec![
            create_test_memory("mem_1", 1000, 0.9, 0.7),  // Positive
            create_test_memory("mem_2", 2000, 0.8, 0.6),  // Positive
        ];

        let result = SignificantMemoryService::calculate_memory_influence(
            &memories,
            &InteractionType::Social,
        );

        assert!(result.is_ok());
        let multiplier = result.unwrap();
        assert!(multiplier > 1.0); // Positive memories increase weight
        assert!(multiplier <= 1.5); // Within bounds
    }

    #[test]
    fn test_calculate_memory_influence_negative() {
        let memories = vec![
            create_test_memory("mem_1", 1000, 0.9, -0.7),  // Negative
            create_test_memory("mem_2", 2000, 0.8, -0.6),  // Negative
        ];

        let result = SignificantMemoryService::calculate_memory_influence(
            &memories,
            &InteractionType::Social,
        );

        assert!(result.is_ok());
        let multiplier = result.unwrap();
        assert!(multiplier < 1.0); // Negative memories decrease weight
        assert!(multiplier >= 0.8); // Within bounds
    }

    #[test]
    fn test_calculate_memory_influence_no_memories() {
        let memories: Vec<Memory> = Vec::new();

        let result = SignificantMemoryService::calculate_memory_influence(
            &memories,
            &InteractionType::Social,
        );

        assert!(result.is_ok());
        let multiplier = result.unwrap();
        assert_eq!(multiplier, 1.0); // Neutral influence
    }

    #[test]
    fn test_search_by_participant() {
        let memories = vec![
            create_test_memory("mem_1", 1000, 0.8, 0.5),
            create_test_memory("mem_2", 2000, 0.7, 0.4),
        ];

        let found = SignificantMemoryService::search_by_participant(&memories, "npc_1");
        assert_eq!(found.len(), 2); // All memories have npc_1

        let not_found = SignificantMemoryService::search_by_participant(&memories, "npc_999");
        assert_eq!(not_found.len(), 0);
    }

    #[test]
    fn test_search_by_significance() {
        let memories = vec![
            create_test_memory("mem_1", 1000, 0.9, 0.5),
            create_test_memory("mem_2", 2000, 0.5, 0.4),
            create_test_memory("mem_3", 3000, 0.3, 0.3),
        ];

        let high_sig = SignificantMemoryService::search_by_significance(&memories, 0.7);
        assert_eq!(high_sig.len(), 1); // Only mem_1

        let medium_sig = SignificantMemoryService::search_by_significance(&memories, 0.4);
        assert_eq!(medium_sig.len(), 2); // mem_1 and mem_2
    }

    #[test]
    fn test_validate_memory_valid() {
        let memory = create_test_memory("mem_1", 1000, 0.8, 0.5);
        let result = SignificantMemoryService::validate_memory(&memory);
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_memory_invalid_significance() {
        let mut memory = create_test_memory("mem_1", 1000, 1.5, 0.5);
        memory.significance = 1.5; // Invalid

        let result = SignificantMemoryService::validate_memory(&memory);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_memory_invalid_emotional_impact() {
        let mut memory = create_test_memory("mem_1", 1000, 0.8, 2.0);
        memory.emotional_impact = 2.0; // Invalid

        let result = SignificantMemoryService::validate_memory(&memory);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_memory_invalid_decay_factor() {
        let mut memory = create_test_memory("mem_1", 1000, 0.8, 0.5);
        memory.decay_factor = -0.1; // Invalid

        let result = SignificantMemoryService::validate_memory(&memory);
        assert!(result.is_err());
    }

    // ===========================
    // Memory Management Tests
    // ===========================
    // Note: MemoryManagementService tests are in a separate file
    // as it has a different API focused on Character processing

    // ==========================
    // Memory Corruption Tests
    // ==========================

    #[test]
    fn test_detect_corruption_invalid_significance() {
        let mut memory = create_test_memory("corrupt", 1000, 0.8, 0.5);
        memory.significance = 2.0; // Corrupted

        let result = SignificantMemoryService::validate_memory(&memory);
        assert!(result.is_err());
        assert!(format!("{:?}", result).contains("significance"));
    }

    #[test]
    fn test_detect_corruption_invalid_emotional_impact() {
        let mut memory = create_test_memory("corrupt", 1000, 0.8, 0.5);
        memory.emotional_impact = -5.0; // Corrupted

        let result = SignificantMemoryService::validate_memory(&memory);
        assert!(result.is_err());
        assert!(format!("{:?}", result).contains("emotional impact"));
    }

    #[test]
    fn test_detect_corruption_invalid_decay() {
        let mut memory = create_test_memory("corrupt", 1000, 0.8, 0.5);
        memory.decay_factor = 3.0; // Corrupted

        let result = SignificantMemoryService::validate_memory(&memory);
        assert!(result.is_err());
        assert!(format!("{:?}", result).contains("decay factor"));
    }

    // =======================
    // Integration Tests
    // =======================

    #[test]
    fn test_full_memory_lifecycle() {
        // Create event
        let event = create_test_event(1000, 0.8);
        let context = create_test_context(0.9, 0.7, 0.6, 0.5);

        // Create memory from event
        let memory_result = SignificantMemoryService::create_memory_from_event(&event, &context);
        assert!(memory_result.is_ok());
        
        let memory_opt = memory_result.unwrap();
        assert!(memory_opt.is_some());

        // Store memory
        let mut memories = Vec::new();
        let store_result = SignificantMemoryService::store_memory(&mut memories, memory_opt.unwrap());
        assert!(store_result.is_ok());
        assert_eq!(memories.len(), 1);

        // Retrieve memory
        let relevant = SignificantMemoryService::retrieve_relevant_memories(
            &memories,
            &InteractionType::Social,
            5,
        );
        assert_eq!(relevant.len(), 1);

        // Calculate influence
        let influence_result = SignificantMemoryService::calculate_memory_influence(
            &memories,
            &InteractionType::Social,
        );
        assert!(influence_result.is_ok());
        let multiplier = influence_result.unwrap();
        assert!(multiplier > 1.0); // Positive memory

        // Validate
        let validate_result = SignificantMemoryService::validate_memory(&memories[0]);
        assert!(validate_result.is_ok());
    }

    #[test]
    fn test_memory_system_performance() {
        // Create many memories to test performance
        let mut memories = Vec::new();
        for i in 0..100 {
            let memory = create_test_memory(
                &format!("mem_{}", i),
                i * 1000,
                0.5 + (i as f64 * 0.001),
                0.3,
            );
            let _ = SignificantMemoryService::store_memory(&mut memories, memory);
        }

        // Should enforce limit
        assert!(memories.len() <= 50);

        // Should be able to search efficiently
        // Memories have significance 0.5 + (i * 0.001), so max is 0.5 + 0.099 = 0.599
        let found = SignificantMemoryService::search_by_significance(&memories, 0.55);
        assert!(found.len() > 0, "Should find memories with significance >= 0.55");
    }
}
