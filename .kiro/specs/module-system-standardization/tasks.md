# Module System Standardization - Tasks

## Overview

This document breaks down the Module System Standardization initiative into actionable tasks organized by phase, priority, and dependencies. Each task includes acceptance criteria, estimated effort, and validation steps.

---

## Phase 1: Domain Layer Conversion 

### Task 1.1: Analyze Circular Dependencies

**Priority**: CRITICAL  
**Effort**: 4 hours  
**Assignee**: TBD

**Description**: Identify all circular dependencies in the domain layer that currently use CommonJS lazy loading as a workaround.

**Acceptance Criteria**:
- [ ] Complete dependency graph generated for domain layer
- [ ] All circular dependencies documented with affected files
- [ ] Resolution strategy assigned to each circular dependency
- [ ] Document created: `circular-dependencies-analysis.md`

**Commands**:
```bash
# Generate dependency graph
npm install -g madge
madge --circular --extensions js ./src/domain

# Scan for lazy requires
grep -r "require(" src/domain/ > domain-requires.txt
```

**Validation**:
- Dependency graph visualized
- All lazy requires identified
- Strategy document reviewed by team

---

### Task 1.2: Convert Domain Entities (Part 1)

**Dependencies**: Task 1.1

**Description**: Convert simple domain entities without circular dependencies to ES6 modules.

**Files** (~25 files):
- `src/domain/entities/Node.js`
- `src/domain/entities/Settlement.js`
- `src/domain/entities/Quest.js`
- `src/domain/entities/Race.js`
- `src/domain/entities/DemoWorld.js`
- `src/domain/entities/ContentEntity.js`
- All interaction subtypes (except Interaction.js)

**Acceptance Criteria**:
- [ ] All targeted entity files use ES6 import/export
- [ ] All imports include `.js` extension
- [ ] No `require()` or `module.exports` in converted files
- [ ] Unit tests pass for all converted entities
- [ ] ESLint shows no violations for converted files

**Commands**:
```bash
# Run conversion tool (dry run)
node scripts/convert-to-es6.js --dry-run --files "src/domain/entities/!(Character|Interaction).js"

# Apply conversion
node scripts/convert-to-es6.js --files "src/domain/entities/!(Character|Interaction).js"

# Run tests
npm test -- --testPathPattern=domain/entities
```

**Validation**:
- [ ] `npm test -- --testPathPattern=domain/entities` passes
- [ ] `npm run lint src/domain/entities` shows 0 errors
- [ ] Manual code review completed

---

### Task 1.3: Convert Character.js with Circular Dependency Fix


**Dependencies**: Task 1.1, Task 1.2

**Description**: Convert Character.js to ES6 while resolving circular dependency with CharacterTemplateService.

**Strategy**: Use dependency injection pattern.

**Implementation**:
```javascript
// Character.js - AFTER
class Character {
  constructor(config = {}, dependencies = {}) {
    // Standard initialization
    this.id = config.id || generateId();
    this.name = config.name || 'Unnamed';
    // ... other properties
    
    // Inject optional dependencies
    this._templateService = dependencies.templateService || null;
    this._templateConfig = config.applyTemplate || null;
  }
  
  async applyTemplate(templateService = null) {
    const service = templateService || this._templateService;
    
    if (!service && this._templateConfig) {
      // Lazy load only if not injected
      const module = await import('../services/CharacterTemplateService.js');
      this._templateService = new module.default();
      return this._templateService.apply(this, this._templateConfig);
    }
    
    if (service) {
      return service.apply(this, this._templateConfig);
    }
    
    throw new Error('No template service available');
  }
}

export default Character;
```

**Acceptance Criteria**:
- [ ] Character.js uses ES6 export/import
- [ ] Circular dependency resolved via dependency injection
- [ ] Dynamic import used as fallback only
- [ ] All Character unit tests pass
- [ ] Integration tests with CharacterTemplateService pass
- [ ] No performance regression (< 5% slowdown)

**Commands**:
```bash
# Test Character specifically
npm test -- --testPathPattern=Character.test

# Test Character integration
npm test -- --testPathPattern=CharacterTemplate
```

**Validation**:
- [ ] All tests pass
- [ ] No circular dependency errors
- [ ] Code review approved

---

### Task 1.4: Convert Domain Services (Batch 1)

**Dependencies**: Task 1.2

**Description**: Convert domain services without complex dependencies.

**Files** (~40 files):
- `src/domain/services/HistoryGenerator.js`
- `src/domain/services/TurnManager.js`
- `src/domain/services/AssignmentManager.js`
- `src/domain/services/EventSignificanceService.js`
- `src/domain/services/EnvironmentalPresetService.js`
- All consciousness services (except those with circular deps)
- All memory services
- All settlement services

**Acceptance Criteria**:
- [ ] All targeted service files use ES6 import/export
- [ ] Constructor dependencies use proper injection
- [ ] No lazy requires remaining
- [ ] Service unit tests pass
- [ ] No ESLint violations

**Commands**:
```bash
# Convert services
node scripts/convert-to-es6.js --files "src/domain/services/**/*.js"

# Test services
npm test -- --testPathPattern=domain/services

# Lint check
npm run lint src/domain/services
```

**Validation**:
- [ ] Test suite passes (100%)
- [ ] Build succeeds
- [ ] No module resolution errors

---

### Task 1.5: Convert AlignmentService.js

**Dependencies**: Task 1.4

**Description**: Convert AlignmentService which currently mixes CommonJS and ES6.

**Current State**:
```javascript
const { Alignment } = require('../value-objects/Alignment.js');

class AlignmentService {
  // ... ES6 class
}
// Missing export statement
```

**Target State**:
```javascript
import { Alignment } from '../value-objects/Alignment.js';

class AlignmentService {
  // ... ES6 class
}

export default AlignmentService;
```

**Acceptance Criteria**:
- [ ] AlignmentService.js fully ES6
- [ ] Tests pass
- [ ] No import errors

**Validation**:
```bash
npm test -- --testPathPattern=Alignment
```

---

### Task 1.6: Convert Value Objects


**Dependencies**: Task 1.2

**Description**: Convert all domain value objects to ES6.

**Files** (~15 files):
- `src/domain/value-objects/Alignment.js`
- `src/domain/value-objects/Attributes.js`
- `src/domain/value-objects/Environment.js`
- `src/domain/value-objects/Prerequisites.js`
- All other value objects

**Acceptance Criteria**:
- [ ] All value object files use ES6 export/import
- [ ] Named exports preserved where appropriate
- [ ] Tests pass for all value objects

**Commands**:
```bash
node scripts/convert-to-es6.js --files "src/domain/value-objects/**/*.js"
npm test -- --testPathPattern=value-objects
```

---

## Phase 2: Application Layer Conversion 

### Task 2.1: Convert ProcessTurnWithLOD.js

  
**Dependencies**: Phase 1 complete

**Description**: Convert the heavily CommonJS-dependent turn processing use case.

**Current Issues**:
- 10+ CommonJS require statements
- Complex dependency chain
- Integration point for entire system

**Acceptance Criteria**:
- [ ] All requires converted to imports
- [ ] Module exports converted to export default
- [ ] Turn processing tests pass
- [ ] Integration tests pass
- [ ] Performance maintained (< 5% regression)

**Commands**:
```bash
# Convert file
node scripts/convert-to-es6.js --files "src/application/use-cases/simulation/ProcessTurnWithLOD.js"

# Test
npm test -- --testPathPattern=ProcessTurnWithLOD
npm test -- --testPathPattern=turn-based-tests
```

**Validation**:
- [ ] `node run-turn-based-tests.js` passes
- [ ] No module resolution errors
- [ ] Manual turn processing verification

---

### Task 2.2: Convert GenerateBehavior.js

 
**Dependencies**: Phase 1 complete

**Description**: Convert NPC behavior generation use case.

**Acceptance Criteria**:
- [ ] ES6 imports/exports
- [ ] Behavior generation tests pass
- [ ] Integration with Character.js verified

**Commands**:
```bash
node scripts/convert-to-es6.js --files "src/application/use-cases/npc/GenerateBehavior.js"
npm test -- --testPathPattern=GenerateBehavior
```

---

### Task 2.3: Convert Application Services

**Dependencies**: Phase 1 complete

**Description**: Convert all application layer services.

**Files** (~20 files):
- `SimulationService.js`
- `TemplateService.js`
- `DemoService.js`
- `PipelineValidationService.js`
- All other application services

**Acceptance Criteria**:
- [ ] All service files use ES6
- [ ] Service tests pass
- [ ] No circular dependency errors

**Commands**:
```bash
node scripts/convert-to-es6.js --files "src/application/services/**/*.js"
npm test -- --testPathPattern=application/services
```

---

## Phase 3: Configuration Files 

### Task 3.1: Convert Demo Configuration Files

 
**Dependencies**: Phase 1, Phase 2 complete

**Description**: Convert all demo configuration exports to ES6.

**Files** (~10 files):
- `src/configs/valley-of-echoes/oakwood-config.js`
- `src/configs/valley-of-echoes/ironhold-config.js`
- `src/data/demos/valley-of-echoes/oakwood-federation-config.js`
- `src/data/demos/valley-of-echoes/ironhold-dominion-config.js`
- All other config files

**Pattern**:
```javascript
// Change from:
module.exports = config;

// To:
export default config;
```

**Acceptance Criteria**:
- [ ] All config files use `export default`
- [ ] All importers updated to use ES6 import
- [ ] Demo initialization works correctly
- [ ] Valley of Echoes demo loads successfully

**Commands**:
```bash
# Convert configs
node scripts/convert-to-es6.js --files "src/configs/**/*.js" "src/data/demos/**/*.js"

# Test demo loading
node initialize-valley-of-echoes.js
npm test -- --testPathPattern=demo
```

**Validation**:
- [ ] Valley of Echoes initializes correctly
- [ ] No config loading errors
- [ ] All demo tests pass

---

## Phase 4: Test Files Conversion 

### Task 4.1: Convert Unit Test Files (Batch 1)

 
**Dependencies**: Phases 1-3 complete

**Description**: Convert unit test files to ES6 imports.

**Files** (~50 files in first batch):
- All `src/__tests__/*.test.js`
- All `src/test/unit/**/*.test.js`

**Acceptance Criteria**:
- [ ] All test files use ES6 import
- [ ] Jest mocks updated to ES6 pattern
- [ ] All unit tests pass
- [ ] No "unexpected token" errors

**Commands**:
```bash
# Convert test files
node scripts/convert-to-es6.js --files "src/__tests__/**/*.test.js" "src/test/unit/**/*.test.js"

# Run tests
npm test -- --testPathPattern=unit
```

---

### Task 4.2: Convert Integration Test Files

  
**Dependencies**: Task 4.1

**Description**: Convert integration test files.

**Files** (~30 files):
- `src/test/integration/**/*.test.js`
- `src/test/consequence-resolution-integration.test.js`
- All other integration tests

**Acceptance Criteria**:
- [ ] All integration tests use ES6
- [ ] Complex mocks work correctly
- [ ] All integration tests pass

**Commands**:
```bash
node scripts/convert-to-es6.js --files "src/test/integration/**/*.test.js"
npm test -- --testPathPattern=integration
```

---

### Task 4.3: Convert Contract Test Files


**Dependencies**: Task 4.1

**Description**: Convert contract test files.

**Files** (~10 files):
- `src/test/contract/**/*.test.js`

**Acceptance Criteria**:
- [ ] All contract tests use ES6
- [ ] Tests pass

**Commands**:
```bash
node scripts/convert-to-es6.js --files "src/test/contract/**/*.test.js"
npm test -- --testPathPattern=contract
```

---

### Task 4.4: Update Jest Configuration

**Dependencies**: Tasks 4.1, 4.2, 4.3 complete

**Description**: Ensure Jest is properly configured for ES6 modules.

**Changes**:
```javascript
// jest.config.js
module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  extensionsToTreatAsEsm: ['.jsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-transform)/)'
  ]
};
```

**Acceptance Criteria**:
- [ ] Jest config updated
- [ ] All tests run without config errors
- [ ] Coverage report generates correctly

**Validation**:
```bash
npm test -- --coverage
```

---

## Phase 5: Infrastructure & Presentation 

### Task 5.1: Convert Infrastructure Layer


**Dependencies**: Phases 1-4 complete

**Description**: Convert infrastructure layer files (mostly repositories).

**Files** (~10 files):
- `src/infrastructure/Persistance/LocalStorageWorldRepository.js`
- All other repository files

**Acceptance Criteria**:
- [ ] All infrastructure files use ES6
- [ ] Persistence tests pass
- [ ] No data loading errors

**Commands**:
```bash
node scripts/convert-to-es6.js --files "src/infrastructure/**/*.js"
npm test -- --testPathPattern=infrastructure
```

---

### Task 5.2: Verify Presentation Layer


**Dependencies**: Phase 5.1

**Description**: Verify and clean up any remaining CommonJS in presentation layer (most should already be ES6).

**Files** (~100 files to verify):
- All React components
- All contexts
- All hooks

**Acceptance Criteria**:
- [ ] All presentation files verified ES6
- [ ] Any stragglers converted
- [ ] Component tests pass

**Commands**:
```bash
# Scan for any remaining CommonJS
node scripts/scan-module-patterns.js

# Convert any found
node scripts/convert-to-es6.js --files "src/presentation/**/*.js"

# Test
npm test -- --testPathPattern=presentation
```

---

## Phase 6: Tooling & Documentation 

### Task 6.1: Update ESLint Configuration


**Dependencies**: All conversion complete

**Description**: Add ESLint rules to prevent CommonJS usage.

**Rules to Add**:
```javascript
{
  'no-restricted-syntax': [
    'error',
    {
      selector: 'CallExpression[callee.name="require"]',
      message: 'Use ES6 import instead of require()'
    }
  ],
  'import/extensions': ['error', 'always', { js: 'always' }]
}
```

**Acceptance Criteria**:
- [ ] ESLint config updated
- [ ] Rules enforced across codebase
- [ ] No false positives
- [ ] CI/CD updated

**Validation**:
```bash
npm run lint
```

---

### Task 6.2: Add Pre-commit Hooks

  
**Dependencies**: Task 6.1

**Description**: Add pre-commit hooks to prevent CommonJS commits.

**Implementation**:
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run lint-staged"
```

**Acceptance Criteria**:
- [ ] Husky installed and configured
- [ ] Pre-commit hook blocks CommonJS
- [ ] Hook doesn't slow down commits significantly

---

### Task 6.3: Update Documentation

  
**Dependencies**: All conversion complete

**Description**: Update all documentation to reflect ES6 module standards.

**Files to Update**:
- `CONTRIBUTING.md` - Add ES6 guidelines
- `README.md` - Update examples
- `.github/copilot-instructions.md` - Update AI guidance
- Architecture docs in `.kiro/steering/`

**Acceptance Criteria**:
- [ ] All docs use ES6 examples
- [ ] Module guidelines added to CONTRIBUTING.md
- [ ] Examples tested and working
- [ ] Team reviewed

---

### Task 6.4: Create Migration Report

 
**Dependencies**: All tasks complete

**Description**: Generate final migration report.

**Report Contents**:
- Files converted count
- Test results summary
- Performance comparison
- Bundle size comparison
- Issues encountered
- Lessons learned

**Acceptance Criteria**:
- [ ] Report generated
- [ ] Metrics documented
- [ ] Success criteria validated
- [ ] Report published

---

## Validation & Sign-off

### Task 7.1: Full Test Suite Validation

 
**Dependencies**: All conversion tasks complete

**Validation Steps**:
1. Run full test suite: `npm test`
2. Run turn-based tests: `node run-turn-based-tests.js`
3. Run validation: `node validate-fixes.js`
4. Manual smoke tests of key features
5. Performance baseline comparison

**Success Criteria**:
- [ ] 100% test pass rate
- [ ] No module resolution errors
- [ ] Performance within acceptable range (< 5% regression)
- [ ] Bundle size reduced by 10%+

---

### Task 7.2: Build & Deployment Verification


**Dependencies**: Task 7.1

**Validation Steps**:
1. Clean build: `npm run build`
2. Verify bundle contents
3. Check bundle size
4. Test production build locally
5. Deploy to staging
6. Run smoke tests on staging

**Success Criteria**:
- [ ] Build succeeds with no warnings
- [ ] Bundle size acceptable
- [ ] Staging deployment successful
- [ ] Smoke tests pass

---

### Task 7.3: Team Sign-off

 
**Dependencies**: Tasks 7.1, 7.2

**Sign-off Checklist**:
- [ ] All technical requirements met
- [ ] Documentation complete
- [ ] Team consensus achieved
- [ ] QA approval obtained
- [ ] Product owner approval

---

## Rollback Plan

### Task 8.1: Create Rollback Branch


**Dependencies**: Before starting Phase 1

**Description**: Create safety branch before starting conversion.

**Commands**:
```bash
git checkout -b pre-es6-conversion-backup
git push origin pre-es6-conversion-backup
git checkout main
git checkout -b es6-module-conversion
```

**Acceptance Criteria**:
- [ ] Backup branch created
- [ ] Backup branch pushed to remote
- [ ] Work branch created

---

## Task Summary


## Resource Allocation

**Recommended Team**:


## Risk Mitigation

| Risk | Mitigation | Owner |
|------|------------|-------|
| Breaking existing functionality | Comprehensive test coverage, phase-by-phase validation | QA Lead |
| Team resistance | Clear documentation, gradual rollout, training | Tech Lead |
| Performance regression | Baseline measurements, continuous monitoring | Lead Dev |
| Rollback complexity | Pre-conversion backup, phase-by-phase commits | DevOps |
