# Tasks: Demo World Save Flow Consistency

**Input**: Design documents from `/specs/001-ensure-that-the/`
**Prerequisites**: plan.md (completed), research.md (completed), data-model.md (completed), contracts/ (completed), quickstart.md (completed)

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Plan loaded successfully with research findings
2. Load optional design documents:
   → data-model.md: Entities defined (DemoWorld, ContentEntity, SaveFlow)
   → contracts/: API contracts defined (demo-api.json)
   → research.md: Technical decisions documented
3. Generate tasks by category:
   → Setup: project structure, dependencies
   → Tests: RED-GREEN-Refactor cycle for all scenarios
   → Core: Redux-Persist integration, ownership management
   → Integration: conflict resolution, validation
   → Polish: performance optimization, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? Yes
   → All entities have models? Yes
   → All tests come before implementation? Yes
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Integration test: Import & Edit button save flow in tests/integration/test_demo_import_edit_save.py
- [ ] T005 [P] Integration test: Launch Demo button save flow in tests/integration/test_demo_launch_save.py
- [ ] T006 [P] Integration test: Demo content persistence after reload in tests/integration/test_demo_persistence.py
- [ ] T007 [P] Integration test: Demo vs user content behavior consistency in tests/integration/test_demo_user_consistency.py

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T008 [P] Demo world loader service in src/services/demo_world_loader.py
- [ ] T009 [P] Save flow consistency validator in src/services/save_flow_validator.py
- [ ] T010 [P] Demo content persistence handler in src/services/demo_content_persistence.py
- [ ] T011 [P] Import & Edit button save integration in src/components/ImportEditButton.js
- [ ] T012 [P] Launch Demo button save integration in src/components/LaunchDemoButton.js
- [ ] T013 Update interaction save handler for demo content
- [ ] T014 Update node save handler for demo content
- [ ] T015 Update character save handler for demo content
- [ ] T016 Implement demo content conflict resolution
- [ ] T017 Implement demo content versioning system
- [ ] T018 Add external dependency validation for demo content

## Phase 3.4: Integration
- [ ] T019 Connect demo services to existing save infrastructure
- [ ] T020 Update editor interfaces for demo content handling
- [ ] T021 Add demo content metadata tracking
- [ ] T022 Implement demo content ownership differentiation

## Phase 3.5: Polish
- [ ] T023 [P] Unit tests for save flow consistency in tests/unit/test_save_flow_consistency.py
- [ ] T024 [P] Unit tests for demo content persistence in tests/unit/test_demo_persistence.py
- [ ] T025 Performance tests for demo save operations (<500ms)
- [ ] T026 [P] Update docs/demo-content-handling.md
- [ ] T027 Add demo content validation logging
- [ ] T028 Run manual-testing.md for demo scenarios

## Dependencies
- Tests (T004-T007) before implementation (T008-T018)
- T008 blocks T011, T012, T019
- T009 blocks T013, T014, T015
- T010 blocks T016, T017, T018
- T019 blocks T020, T021, T022
- Implementation before polish (T023-T028)

## Parallel Example
```
# Launch T004-T007 together:
Task: "Integration test: Import & Edit button save flow in tests/integration/test_demo_import_edit_save.py"
Task: "Integration test: Launch Demo button save flow in tests/integration/test_demo_launch_save.py"
Task: "Integration test: Demo content persistence after reload in tests/integration/test_demo_persistence.py"
Task: "Integration test: Demo vs user content behavior consistency in tests/integration/test_demo_user_consistency.py"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task

2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **From Functional Requirements**:
   - FR-001 → T008, T009 (save flow consistency)
   - FR-002 → T013 (interactions save)
   - FR-003 → T014 (nodes save)
   - FR-004 → T015 (characters save)
   - FR-005 → T011 (Import & Edit button)
   - FR-006 → T012 (Launch Demo button)
   - FR-007 → T010 (identical functionality)
   - FR-008 → T016, T017 (storage and formatting)
   - FR-009 → T018 (reload preservation)
   - FR-010 → T020 (editor interfaces)

5. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
- [x] Tasks derived from functional requirements
- [x] Integration tests cover all acceptance scenarios
- [x] Dependencies properly mapped
- [x] Edge cases addressed in implementation tasks