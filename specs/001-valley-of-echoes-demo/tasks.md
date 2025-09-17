# Tasks: Valley of Echoes Two-Settlement Demo

**Input**: Design documents from `/specs/001-valley-of-echoes-demo/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

## Demo Pattern Consistency Requirements
- **CRITICAL**: Follow existing medieval fantasy village demo patterns exactly
- **Assignment Pattern**: Implement bidirectional character-node assignments (Character.assignments.nodes + Node.assignedCharacters)
- **Data Format**: Use exact property naming conventions from existing demo (camelCase, descriptive IDs)
- **Content Structure**: Match environmental properties, cultural context, and resource patterns

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: JavaScript ES2022, React 18.2, existing clean architecture
   → Libraries: LODManager, CrossSettlementService, PopulationGroupService
   → Structure: Single project with domain/application/infrastructure/presentation
2. Load design documents ✓:
   → data-model.md: PopulationGroup, CrossSettlementRelation, SettlementGovernance + demo patterns
   → contracts/: lod-system.json, settlement-interactions.json, cross-settlement-api.json
   → research.md: 3-tier LOD, multi-settlement extensions, performance patterns
3. Generate tasks by category:
   → Setup: LOD value objects, test infrastructure, demo pattern validation
   → Tests: contract tests, integration tests for multi-settlement flows, assignment pattern tests
   → Core: entities, services, LOD processing with demo consistency
   → Integration: UI components, contexts, turn processing
   → Polish: performance optimization, demo content, validation
4. Apply task rules:
   → Different files = [P] for parallel execution
   → Same file = sequential dependencies
   → Tests before implementation (TDD enforced)
   → Demo pattern validation in all tasks
5. Tasks numbered T001-T045 (added demo consistency tasks)
6. Dependencies: Tests → Models → Services → UI → Integration → Demo → Pattern Validation
7. Parallel execution: Independent entity/service creation tasks marked [P]
8. Validation: All contracts tested, all entities implemented, LOD system complete, demo patterns verified
9. SUCCESS: Ready for Valley of Echoes demo implementation with exact pattern consistency
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in sim-engine/src/ structure

## Phase 3.1: Setup & Foundation
- [ ] T001 [P] Create LODTier value object in src/domain/value-objects/LODTier.js
- [ ] T002 [P] Create SettlementGovernance value object in src/domain/value-objects/SettlementGovernance.js
- [ ] T003 [P] Create DevelopmentTree value object in src/domain/value-objects/DevelopmentTree.js
- [ ] T004 [P] Set up test infrastructure for LOD system in src/test/lod/
- [ ] T005 [P] Create demo configuration directory examples/valley-of-echoes-demo/

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T006 [P] Contract test LOD character processing in src/test/contract/lod-character-processing.test.js
- [ ] T007 [P] Contract test LOD promotion/demotion in src/test/contract/lod-tier-management.test.js
- [ ] T008 [P] Contract test population group processing in src/test/contract/population-group-processing.test.js
- [ ] T009 [P] Contract test settlement development in src/test/contract/settlement-development.test.js
- [ ] T010 [P] Contract test cross-settlement diplomacy in src/test/contract/cross-settlement-diplomacy.test.js
- [ ] T011 [P] Contract test cross-settlement trade in src/test/contract/cross-settlement-trade.test.js

### Integration Tests
- [ ] T012 [P] Integration test 100+ NPC performance in src/test/integration/lod-performance.test.js
- [ ] T013 [P] Integration test multi-settlement quest chain in src/test/integration/multi-settlement-quests.test.js
- [ ] T014 [P] Integration test settlement development trees in src/test/integration/settlement-development.test.js
- [ ] T015 [P] Integration test cross-settlement relationships in src/test/integration/cross-settlement-relations.test.js
- [ ] T016 [P] Integration test Valley of Echoes demo flow in src/test/integration/valley-of-echoes-demo.test.js

## Phase 3.3: Core Entities (ONLY after tests are failing)
- [ ] T017 [P] PopulationGroup entity in src/domain/entities/PopulationGroup.js
- [ ] T018 [P] CrossSettlementRelation entity in src/domain/entities/CrossSettlementRelation.js
- [ ] T019 Extend Character entity for LOD integration in src/domain/entities/Character.js
- [ ] T020 Extend Settlement entity for multi-node support in src/domain/entities/Settlement.js
- [ ] T021 [P] Create SettlementDevelopment entity in src/domain/entities/SettlementDevelopment.js

## Phase 3.4: Core Services
- [ ] T022 [P] LODManager service in src/domain/services/LODManager.js
- [ ] T023 [P] PopulationGroupService in src/domain/services/PopulationGroupService.js
- [ ] T024 [P] CrossSettlementService in src/domain/services/CrossSettlementService.js
- [ ] T025 [P] SettlementDevelopmentService in src/domain/services/SettlementDevelopmentService.js
- [ ] T026 Extend TurnManager for LOD processing in src/domain/services/TurnManager.js
- [ ] T027 Extend HistoryGenerator for cross-settlement events in src/domain/services/HistoryGenerator.js

## Phase 3.5: Application Layer
- [ ] T028 [P] ProcessTurnWithLOD use case in src/application/use-cases/ProcessTurnWithLOD.js
- [ ] T029 [P] ManageSettlementDevelopment use case in src/application/use-cases/ManageSettlementDevelopment.js
- [ ] T030 [P] DemoOrchestrationService in src/application/services/DemoOrchestrationService.js

## Phase 3.6: Presentation Layer
- [ ] T031 [P] LODContext for tier management in src/presentation/contexts/LODContext.js
- [ ] T032 [P] SettlementOverview component in src/presentation/components/SettlementOverview.js
- [ ] T033 [P] PopulationGroupPanel component in src/presentation/components/PopulationGroupPanel.js
- [ ] T034 [P] CrossSettlementDiplomacy component in src/presentation/components/CrossSettlementDiplomacy.js
- [ ] T035 Extend SimulationContext for LOD integration in src/presentation/contexts/SimulationContext.js

## Phase 3.7: Demo Content & Integration
- [ ] T036 [P] Oakwood Federation configuration in examples/valley-of-echoes-demo/oakwood-federation/
- [ ] T037 [P] Ironhold Dominion configuration in examples/valley-of-echoes-demo/ironhold-dominion/
- [ ] T038 [P] Multi-settlement quest definitions in examples/valley-of-echoes-demo/quests/
- [ ] T039 Demo orchestration script in examples/valley-of-echoes-demo/demo-script.js
- [ ] T040 Integrate LOD system with WorldBuilder in src/domain/services/WorldBuilder.js

## Phase 3.8: Performance & Polish
- [ ] T041 Performance optimization and memory management validation
- [ ] T042 Execute Valley of Echoes demo validation per quickstart.md

## Dependencies

### Sequential Dependencies
- **Foundation**: T001-T005 before all other phases
- **Tests First**: T006-T016 MUST complete before T017-T042
- **Entity Dependencies**: 
  - T019 (Character extension) blocks T022 (LODManager)
  - T020 (Settlement extension) blocks T024 (CrossSettlementService)
  - T017 (PopulationGroup) blocks T023 (PopulationGroupService)
- **Service Dependencies**:
  - T022-T025 (core services) before T028-T030 (use cases)
  - T026-T027 (extended services) before T040 (WorldBuilder integration)
- **UI Dependencies**:
  - T031 (LODContext) before T035 (SimulationContext extension)
  - T022-T025 (services) before T032-T034 (components)
- **Demo Dependencies**:
  - T036-T038 (content) before T039 (demo script)
  - T040 (WorldBuilder integration) before T042 (demo validation)

### Parallel Execution Groups

**Group 1 - Value Objects (can run simultaneously):**
```bash
T001: LODTier value object
T002: SettlementGovernance value object  
T003: DevelopmentTree value object
T004: Test infrastructure setup
T005: Demo configuration directory
```

**Group 2 - Contract Tests (can run simultaneously):**
```bash
T006: LOD character processing contract test
T007: LOD tier management contract test
T008: Population group processing contract test
T009: Settlement development contract test
T010: Cross-settlement diplomacy contract test
T011: Cross-settlement trade contract test
```

**Group 3 - Integration Tests (can run simultaneously):**
```bash
T012: LOD performance integration test
T013: Multi-settlement quest integration test
T014: Settlement development integration test
T015: Cross-settlement relations integration test
T016: Valley of Echoes demo integration test
```

**Group 4 - Independent Entities (can run simultaneously):**
```bash
T017: PopulationGroup entity
T018: CrossSettlementRelation entity
T021: SettlementDevelopment entity
```

**Group 5 - Independent Services (can run simultaneously):**
```bash
T022: LODManager service
T023: PopulationGroupService
T024: CrossSettlementService
T025: SettlementDevelopmentService
```

**Group 6 - Application Layer (can run simultaneously):**
```bash
T028: ProcessTurnWithLOD use case
T029: ManageSettlementDevelopment use case
T030: DemoOrchestrationService
```

**Group 7 - UI Components (can run simultaneously):**
```bash
T031: LODContext
T032: SettlementOverview component
T033: PopulationGroupPanel component
T034: CrossSettlementDiplomacy component
```

**Group 8 - Demo Content (can run simultaneously):**
```bash
T036: Oakwood Federation configuration
T037: Ironhold Dominion configuration
T038: Multi-settlement quest definitions
```

## Task Details & Acceptance Criteria

### T006: Contract test LOD character processing
**File**: `src/test/contract/lod-character-processing.test.js`
**Must Fail First**: Test LOD system API contracts from lod-system.json
**Acceptance**: Tests validate character tier processing, promotion/demotion flows, performance metrics

### T017: PopulationGroup entity
**File**: `src/domain/entities/PopulationGroup.js`
**Prerequisites**: T006-T008 failing tests
**Acceptance**: Entity supports statistical modeling, group behavior, individual sampling per data-model.md

### T022: LODManager service
**File**: `src/domain/services/LODManager.js`
**Prerequisites**: T017 (PopulationGroup), T019 (Character extension)
**Acceptance**: 3-tier processing, promotion/demotion logic, performance under 2s for 100+ NPCs

### T032: SettlementOverview component
**File**: `src/presentation/components/SettlementOverview.js`
**Prerequisites**: T020 (Settlement extension), T031 (LODContext)
**Acceptance**: Multi-node display, population group summaries, development tree progress

### T042: Execute Valley of Echoes demo validation
**File**: Following quickstart.md validation steps
**Prerequisites**: All previous tasks complete
**Acceptance**: 25-turn demo runs successfully, all performance targets met, no system errors

**T043.** Create demo pattern validation test [TDD] `sim-engine/src/test/demo-pattern-validation.test.js`
- Verify character-node bidirectional assignment patterns match existing demo
- Test property naming conventions (camelCase, descriptive IDs)
- Validate environmental properties structure (climate, season, resources)
- Check cultural context format (language, traditions arrays)
- Ensure D&D attributes structure matches exactly

**T044.** Implement assignment pattern consistency service [P] `sim-engine/src/domain/services/AssignmentConsistencyService.js`
- Enforce bidirectional character-node assignments
- Validate assignment data structure consistency
- Provide migration utilities for assignment pattern updates
- Include property naming validation

**T045.** Update Valley of Echoes demo content with pattern compliance `sim-engine/src/template/demo/valley-of-echoes-content.js`
- Apply exact property naming conventions from existing demo
- Use bidirectional assignment patterns for all character-node relationships
- Format environmental properties to match existing demo structure
- Ensure all content follows validated patterns

## Notes
- [P] tasks target different files with no dependencies - safe for parallel execution
- All tests MUST be written first and MUST fail before implementation begins
- Each entity/service task includes unit tests as part of implementation
- Performance validation occurs throughout, not just at the end
- Demo content creation can happen in parallel with core system development
- **CRITICAL**: All tasks must verify compatibility with existing demo patterns

## Validation Checklist
*GATE: All items must be checked before considering tasks complete*

- [ ] All contract tests validate API specifications from contracts/
- [ ] All entities from data-model.md have corresponding implementation tasks
- [ ] All tests come before implementation (TDD enforced)
- [ ] Parallel tasks [P] truly operate on independent files
- [ ] Each task specifies exact file path in sim-engine/src/ structure
- [ ] No task modifies same file as another [P] task
- [ ] LOD system handles 100+ NPCs with <2s turn processing
- [ ] Multi-settlement interactions work as specified
- [ ] Valley of Echoes demo executes successfully per quickstart.md
- [ ] All existing functionality remains intact (regression testing)
- [ ] Clean architecture principles maintained throughout implementation
- [ ] **Demo pattern consistency validated against existing medieval fantasy village demo**
- [ ] **Bidirectional assignment patterns implemented correctly**
- [ ] **Property naming conventions match existing demo exactly**