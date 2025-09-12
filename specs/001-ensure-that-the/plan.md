# Implementation Plan: Demo World Save Flow Consistency

<!-- VARIANT:sh - Run `/scripts/bash/update-agent-context.sh __AGENT__` for your AI assistant -->
<!-- VARIANT:ps - Run `/scripts/powershell/update-agent-context.ps1 -AgentType __AGENT__` for your AI assistant -->

**Branch**: `001-ensure-that-the` | **Date**: September 12, 2025 | **Spec**: [link]
**Input**: Feature specification from `/specs/001-ensure-that-the/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Ensure demo world content uses identical save flows as user-created content. All demo interactions, nodes, and characters must save through standard editor buttons with full persistence and editability, maintaining behavioral consistency between Import & Edit and Launch Demo buttons.

## Technical Context
**Language/Version**: JavaScript ES2022, React 18.2.0, Node.js 18+
**Primary Dependencies**: React, Redux Toolkit, Express, D3.js
**Storage**: Local Storage (client-side persistence)
**Testing**: Jest, React Testing Library
**Target Platform**: Web browsers (Chrome, Firefox, Safari)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Save operations <500ms, UI responsiveness <100ms
**Constraints**: Client-side only, no server persistence, offline-capable
**Scale/Scope**: Single-user application, <10MB data, <1000 entities

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 2 (frontend React app, backend Express API)
- Using framework directly? Yes (React/Redux/Express without wrappers)
- Single data model? Yes (Redux store as single source of truth)
- Avoiding patterns? Yes (no Repository/UoW patterns)

**Architecture**:
- EVERY feature as library? Yes (modular services in src/services/)
- Libraries listed: demo-loader, save-validator, persistence-handler
- CLI per library: save-validator --validate-demo-flow, demo-loader --import-edit
- Library docs: JSDoc format planned

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes
- Git commits show tests before implementation? Yes
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Yes (actual LocalStorage, not mocks)
- Integration tests for: new libraries, contract changes, shared schemas? Yes
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? Yes (console with structured data)
- Frontend logs → backend? N/A (client-side only)
- Error context sufficient? Yes (error boundaries, detailed error messages)

**Versioning**:
- Version number assigned? Yes (0.1.0 in package.json)
- BUILD increments on every change? Yes (semantic versioning)
- Breaking changes handled? Yes (migration scripts for data changes)

## Project Structure

### Documentation (this feature)
```
specs/001-ensure-that-the/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Web application structure (frontend + backend detected)
sim-engine/
├── src/
│   ├── components/      # React components
│   ├── services/        # Business logic services
│   ├── store/          # Redux store and slices
│   ├── utils/          # Utility functions
│   └── hooks/          # Custom React hooks
├── public/             # Static assets
└── tests/              # Test files
    ├── integration/    # Integration tests
    ├── unit/          # Unit tests
    └── e2e/           # End-to-end tests

backend/ (if separate)
├── src/
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   └── services/      # Backend services
└── tests/
```

**Structure Decision**: Web application (frontend + backend) - React frontend with Express API backend

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Research LocalStorage save flow patterns
   - Research Redux persistence integration
   - Research demo content identification methods
   - Research conflict resolution strategies

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research LocalStorage save patterns for React applications"
     Task: "Research Redux store persistence with demo content"
     Task: "Research content ownership differentiation in single-user apps"
     Task: "Research conflict resolution for client-side data"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - DemoWorld: template, content, metadata, ownership
   - SaveFlow: standard process, validation, persistence
   - EditorButton: ImportEdit, LaunchDemo, standard Save
   - ContentEntity: interactions, nodes, characters with demo flags

2. **Generate API contracts** from functional requirements:
   - POST /api/demo/import-edit → load demo with edit mode
   - POST /api/demo/launch → load demo with play mode
   - PUT /api/content/save → unified save endpoint
   - GET /api/content/validate → consistency validation

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Import & Edit button save flow scenario
   - Launch Demo button save flow scenario
   - Content persistence after reload scenario
   - Demo vs user content consistency scenario

5. **Update agent file incrementally** (O(1) operation):
   VARIANT-INJECT
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 2 projects | Frontend/backend separation needed | Single-page app insufficient for data persistence layer |
| Redux Toolkit | State management complexity justified | Plain useState insufficient for complex demo content flows |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*