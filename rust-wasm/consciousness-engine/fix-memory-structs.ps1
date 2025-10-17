# Fix memory_management.rs - add missing fields to Memory struct initialization
$file1 = "src\memory_module\memory_management.rs"
$content1 = Get-Content $file1 -Raw

# Fix line 170 - add missing fields to Memory construction
$old1 = @"
        Ok(Memory {
            id: format!("consolidated_{}", most_recent.timestamp),
            timestamp: most_recent.timestamp,
            significance: avg_significance,
            emotional_impact: avg_emotional_impact,
            interaction_type: most_recent.interaction_type.clone(),
            participants: most_recent.participants.clone(),
            context: most_recent.context.clone(),
            decay_factor: avg_decay,
        })
"@

$new1 = @"
        Ok(Memory {
            id: format!("consolidated_{}", most_recent.timestamp),
            timestamp: most_recent.timestamp,
            significance: avg_significance,
            emotional_impact: avg_emotional_impact,
            interaction_type: most_recent.interaction_type,
            participants: most_recent.participants.clone(),
            context: most_recent.context.clone(),
            decay_factor: avg_decay,
            interaction_id: format!("interaction_{}", most_recent.timestamp),
            outcome: "consolidated".to_string(),
            location: most_recent.context.location.clone().unwrap_or_else(|| "unknown".to_string()),
            context_tags: vec!["consolidated".to_string()],
            description: format!("Consolidated memory from {} events", memories.len()),
        })
"@

$content1 = $content1 -replace [regex]::Escape($old1), $new1
Set-Content $file1 $content1 -NoNewline

# Fix event_significance.rs - add missing fields to InteractionEvent in test
$file2 = "src\memory_module\event_significance.rs"
$content2 = Get-Content $file2 -Raw

$old2 = @"
    fn create_test_event(emotional_impact: f64) -> InteractionEvent {
        InteractionEvent {
            timestamp: 1000,
            emotional_impact,
            interaction_type: InteractionType::Social,
        }
    }
"@

$new2 = @"
    fn create_test_event(emotional_impact: f64) -> InteractionEvent {
        InteractionEvent {
            id: "test_event".to_string(),
            timestamp: 1000,
            emotional_impact,
            interaction_type: InteractionType::Social,
            participants: vec!["npc_1".to_string()],
            context: create_test_context(),
        }
    }
"@

$content2 = $content2 -replace [regex]::Escape($old2), $new2
Set-Content $file2 $content2 -NoNewline

Write-Host "Fixed both files successfully!"
