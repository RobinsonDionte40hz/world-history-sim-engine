# Implementation Plan: Valley of Echoes Two-Settlement Demo

<!-- VARIANT:ps - Run `/scripts/powershell/update-agent-context.ps1 -AgentType copilot` for your AI assistant -->

**Branch**: `001-ensure-that-the` | **Date**: September 17, 2025 | **Spec**: [Valley of Echoes Specification](#summary)
**Input**: Feature specification from user request for comprehensive two-settlement demo

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   ✓ Specification loaded: "Valley of Echoes" Two-Settlement Demo
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   ✓ Project Type: React web application with clean architecture
   ✓ Structure Decision: Single project with domain-driven design
3. Evaluate Constitution Check section below
   ✓ Simplicity assessment complete
   ✓ Architecture compliance verified
4. Execute Phase 0 → research.md
   ✓ Technical research and dependency analysis
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md
   → Design LOD system, settlement extensions, interaction contracts
6. Re-evaluate Constitution Check section
   → Verify clean architecture compliance post-design
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

The "Valley of Echoes" demo showcases the World History Simulation Engine's scalability and integration capabilities through two interconnected settlements: Oakwood Federation (democratic, 105 NPCs across 3 nodes) and Ironhold Dominion (hierarchical, 110 NPCs across 3 nodes). The demo implements a 3-tier Level of Detail (LOD) system to efficiently manage 100+ NPCs while integrating all existing systems including prestige, alignment, quests, settlement development, and consciousness modeling. The technical approach leverages React 18.2 with clean architecture patterns, extending existing domain entities and services to support multi-settlement dynamics, cross-settlement interactions, and emergent historical narratives across a 25-turn demonstration.

## Technical Context
**Language/Version**: JavaScript ES2022, React 18.2, Node.js 18+  
**Primary Dependencies**: React, D3.js, Tailwind CSS, Jest (existing stack)  
**Storage**: LocalStorage with JSON serialization (existing pattern)  
**Testing**: Jest with integration test focus, turn-based validation scripts  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+)  
**Project Type**: Single project with clean architecture (domain/application/infrastructure/presentation)  
**Performance Goals**: 100+ NPCs, <2s turn processing, <100MB memory, 60fps UI  
**Constraints**: Clean architecture compliance, no pipeline bypassing, existing template system integration  
**Scale/Scope**: 6 nodes, 100+ NPCs, 3-tier LOD system, 25-turn demo sequence  

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (React web application with clean architecture)
- Using framework directly? Yes (React components, existing domain services)
- Single data model? Yes (extending existing Character/Node/Settlement entities)
- Avoiding patterns? Yes (leveraging existing service patterns, no new abstractions)

**Architecture**:
- EVERY feature as library? Yes (domain services for LOD, settlement management, cross-settlement interactions)
- Libraries listed: 
  - LODManager (3-tier character processing)
  - SettlementManager (multi-node settlement handling)
  - CrossSettlementService (inter-settlement interactions)
  - PopulationGroupService (statistical character modeling)
- CLI per library: N/A (integrated into existing React UI)
- Library docs: Integrated into existing copilot-instructions.md

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes (test-first for all new services)
- Git commits show tests before implementation? Yes (existing pattern)
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Yes (actual LocalStorage, React rendering)
- Integration tests for: LOD system, settlement interactions, quest chains, turn processing
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? Yes (extending existing console.log patterns)
- Frontend logs → backend? N/A (client-only application)
- Error context sufficient? Yes (detailed error objects with context)

**Versioning**:
- Version number assigned? Yes (extends existing engine version)
- BUILD increments on every change? Yes (follows existing pattern)
- Breaking changes handled? Yes (backward compatibility maintained)

## Project Structure

### Documentation (this feature)
```
specs/001-valley-of-echoes-demo/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── lod-system.json
│   ├── settlement-interactions.json
│   └── cross-settlement-api.json
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
sim-engine/src/
├── domain/
│   ├── entities/
│   │   ├── PopulationGroup.js      # NEW: Statistical character modeling
│   │   ├── Settlement.js           # EXTEND: Multi-node, development trees
│   │   └── CrossSettlementRelation.js  # NEW: Inter-settlement relationships
│   ├── services/
│   │   ├── LODManager.js           # NEW: 3-tier processing system
│   │   ├── PopulationGroupService.js  # NEW: Group-level character management
│   │   ├── CrossSettlementService.js  # NEW: Inter-settlement interactions
│   │   └── SettlementDevelopmentService.js  # NEW: Development tree management
│   └── value-objects/
│       ├── LODTier.js              # NEW: Processing tier definitions
│       └── SettlementGovernance.js # NEW: Governance type modeling
├── application/
│   ├── use-cases/
│   │   ├── ProcessTurnWithLOD.js   # NEW: LOD-aware turn processing
│   │   └── ManageSettlementDevelopment.js  # NEW: Development orchestration
│   └── services/
│       └── DemoOrchestrationService.js  # NEW: Demo flow management
├── presentation/
│   ├── components/
│   │   ├── SettlementOverview.js   # NEW: Multi-node settlement display
│   │   ├── PopulationGroupPanel.js # NEW: Group-level character interface
│   │   └── CrossSettlementDiplomacy.js  # NEW: Inter-settlement UI
│   └── contexts/
│       └── LODContext.js           # NEW: LOD system state management
└── examples/
    └── valley-of-echoes-demo/      # NEW: Complete demo configuration
        ├── oakwood-federation/
        ├── ironhold-dominion/
        └── demo-script.js
```

**Structure Decision**: Single project with clean architecture (existing pattern maintained)

## Phase 0: Outline & Research

### Research Tasks Identified
1. **LOD System Architecture Patterns**:
   - Research efficient statistical character modeling approaches
   - Investigate memory optimization techniques for large NPC populations
   - Study promotion/demotion algorithms for character tier changes

2. **Multi-Settlement Management**:
   - Analyze existing Settlement.js entity for extension points
   - Research settlement development tree implementation patterns
   - Study inter-settlement relationship modeling approaches

3. **Performance Optimization Strategies**:
   - Research React performance patterns for large data sets
   - Investigate batch processing techniques for turn management
   - Study memory management patterns for character data

4. **Integration Points Analysis**:
   - Map existing quest system extension requirements
   - Analyze prestige/alignment system integration needs
   - Study template system requirements for new content types

**Research Findings Summary**:
- **LOD Decision**: Implement 3-tier system with Hero NPCs (full objects), Population Groups (aggregate statistics), Background Demographics (pure numbers)
- **Settlement Extension**: Add multi-node support through node collections, governance modeling through value objects
- **Performance Strategy**: Use React.memo for character components, implement virtual scrolling for large lists, batch character updates
- **Integration Approach**: Extend existing services rather than replacing, maintain template system compatibility

**Output**: research.md with detailed technical analysis and architectural decisions

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

### Entity Extensions Required

**Character.js Extensions**:
- Add `lodTier` property for processing level assignment
- Add `populationGroupId` for statistical grouping
- Add `settlementLoyalty` tracking for cross-settlement dynamics

**Settlement.js Extensions**:
- Add `nodes` collection for multi-node structure
- Add `governance` value object for political modeling  
- Add `developmentTrees` for upgrade tracking
- Add `relationships` for inter-settlement dynamics

**New Entities**:
- **PopulationGroup**: Aggregate character statistics and behavior modeling
- **CrossSettlementRelation**: Diplomatic, trade, and conflict relationships
- **SettlementDevelopment**: Development tree progress and prerequisites

### Service Architecture

**LODManager.js**:
- `processHeroNPCs()`: Full consciousness simulation
- `processPopulationGroups()`: Statistical modeling with sampling
- `processBackgroundDemographics()`: Pure aggregate calculations
- `promoteToHero()` / `demoteFromHero()`: Tier transition management

**CrossSettlementService.js**:
- `initiateDiplomacy()`: Start diplomatic interactions
- `processTradeNegotiation()`: Handle resource exchanges
- `resolveConflict()`: Manage settlement disputes
- `updateRelationships()`: Track relationship changes over time

**PopulationGroupService.js**:
- `aggregateGroupBehavior()`: Statistical behavior modeling
- `generateGroupEvents()`: Create population-level events
- `sampleIndividuals()`: Materialize specific characters on demand
- `updateGroupStatistics()`: Maintain aggregate data

### API Contract Definitions

**LOD System Contracts** (`/contracts/lod-system.json`):
```json
{
  "processCharacterTier": {
    "input": {"characterId": "string", "tier": "hero|group|background"},
    "output": {"processed": "boolean", "events": "array", "statistics": "object"}
  },
  "promoteCharacter": {
    "input": {"characterId": "string", "fromTier": "string", "toTier": "string"},
    "output": {"success": "boolean", "character": "object"}
  }
}
```

**Settlement Interaction Contracts** (`/contracts/settlement-interactions.json`):
```json
{
  "developSettlement": {
    "input": {"settlementId": "string", "developmentPath": "string", "resources": "object"},
    "output": {"success": "boolean", "newLevel": "number", "effects": "array"}
  },
  "crossSettlementInteraction": {
    "input": {"fromSettlement": "string", "toSettlement": "string", "interactionType": "string"},
    "output": {"initiated": "boolean", "consequences": "array", "relationshipChange": "number"}
  }
}
```

### Integration Test Scenarios

1. **LOD System Integration**:
   - Create 100+ characters across all tiers
   - Process full turn and verify performance < 2s
   - Verify Hero NPC promotion/demotion works correctly

2. **Settlement Development Integration**:
   - Initialize both settlements with development trees
   - Process multiple turns with resource accumulation
   - Verify development unlocks work correctly

3. **Cross-Settlement Quest Integration**:
   - Initialize "Iron Wood Dispute" quest chain
   - Process multi-turn quest with both settlements
   - Verify consequences affect both settlements permanently

**Output**: data-model.md, contracts/*.json, failing integration tests, quickstart.md, updated .github/copilot-instructions.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base structure
- Generate tasks from Phase 1 design docs and contracts
- Each contract endpoint → contract test task [P]
- Each new entity → model creation task [P]
- Each service → unit test + implementation task pair
- Integration scenarios → integration test tasks
- Demo configuration → content creation tasks

**Task Categories**:
1. **Foundation Tasks** [P]: Entity extensions, value objects, basic services
2. **LOD System Tasks**: LODManager, PopulationGroupService, tier processing
3. **Settlement System Tasks**: Multi-node support, development trees, governance
4. **Cross-Settlement Tasks**: Diplomacy, trade, conflict resolution
5. **Integration Tasks**: Quest system, prestige/alignment, template system
6. **Demo Content Tasks**: Oakwood Federation, Ironhold Dominion configurations
7. **Performance Tasks**: Optimization, memory management, UI responsiveness
8. **Validation Tasks**: Integration tests, demo execution, performance verification

**Ordering Strategy**:
- TDD order: Tests before implementation for all new functionality
- Dependency order: Entities → Services → Use Cases → UI Components
- Parallel execution: Mark independent entity/service creation tasks as [P]
- Integration sequence: Core systems → Cross-settlement → Demo content

**Estimated Output**: 35-40 numbered, ordered tasks covering complete implementation

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates detailed tasks.md)  
**Phase 4**: TDD implementation following constitutional principles  
**Phase 5**: Demo validation, performance testing, integration verification  
**Phase 6**: Documentation updates, copilot instructions enhancement

## Complexity Tracking
*No constitutional violations identified - all requirements align with existing patterns*

| Area | Complexity Level | Justification |
|------|------------------|---------------|
| LOD System | Moderate | Necessary for 100+ NPC performance requirements |
| Multi-Settlement | Moderate | Core requirement for demo specification |
| Cross-Settlement Interactions | Moderate | Essential for meaningful settlement dynamics |

*All complexity is justified by specification requirements and follows existing architectural patterns*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach defined (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All technical context clarified
- [x] Complexity within acceptable bounds

---
*Based on Clean Architecture principles and World History Simulation Engine patterns*