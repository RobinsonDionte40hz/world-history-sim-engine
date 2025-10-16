# Phase 4: Test Files & Remaining Conversion - Scope Analysis

**Date**: October 16, 2025  
**Branch**: `es6-module-conversion`  
**Analysis**: Comprehensive scan of remaining require() and module.exports

## Executive Summary

**Total Files Needing Conversion**: 17 files  
- 13 test files  
- 4 production/data files  
- 3 commented-out requires (already handled)
- 1 example file

---

## Category 1: Test Files (13 files) - PHASE 4

### Domain Service Tests (4 files)
Located in `src/domain/services/__tests__/`

1. **ConsciousnessCheckpointService.integration.test.js**
   - Line 7: `const ConsciousnessCheckpointService = require('../ConsciousnessCheckpointService');`

2. **ConsciousnessCheckpointService.test.js**
   - Line 8: `const ConsciousnessCheckpointService = require('../ConsciousnessCheckpointService');`

3. **EventSignificanceService.test.js**
   - Line 6: `const EventSignificanceService = require('../EventSignificanceService');`

4. **Task5Integration.test.js**
   - Line 358: `const Interaction = require('../../entities/Interaction.js').default;`
   - Line 374: `const Interaction = require('../../entities/Interaction.js').default;`
   - Line 377: `const mockService = jest.spyOn(require('../../services/BranchWeightingService.js'), 'default');`

### Integration Tests (3 files)
Located in `src/test/`

5. **consequence-resolution-integration.test.js**
   - Line 21: `const BasicNeedsService = require('../domain/services/BasicNeedsService.js').default;`
   - Line 22: `const NeedConsequenceService = require('../domain/services/NeedConsequenceService.js').default;`
   - Line 23: `const ConsequenceLifecycleManager = require('../domain/services/ConsequenceLifecycleManager.js').default;`
   - Line 24: `const SettlementService = require('../domain/services/SettlementService.js').default;`
   - Lines 118-120: Duplicate requires (within same file)

6. **turn-counter-integration-comprehensive-new.test.js**
   - Line 15: `const React = require('react');`
   - Line 148: `const { SimulationProvider, useSimulationContext, ... } = require('../presentation/contexts/SimulationContext.js');`

7. **GenerateBehavior.integration.test.js** (in `src/test/integration/`)
   - Line 143: `const originalGetAvailableInteractions = require('../../domain/services/InteractionManager.js').default.prototype.getAvailableInteractions;`
   - Lines 144, 153: Dynamic require() for mocking

### Contract Tests (1 file)

8. **process-turn-with-lod.test.js** (in `src/test/contract/`)
   - Line 17: `const processTurnWithLOD = require('../../application/use-cases/simulation/ProcessTurnWithLOD.js');`
   - Line 18: `const LODManager = require('../../domain/services/LODManager.js');`
   - Line 19: `const HistoryGenerator = require('../../domain/services/HistoryGenerator.js');`

### Application Service Tests (2 files)

9. **TemplateService.test.js** (in `src/test/application/services/`)
   - Line 136: `const EnvironmentalPresetService = require('../../../domain/services/EnvironmentalPresetService.js').default;`

10. **TemplateService.fixed.test.js** (in `src/test/application/services/`)
    - Line 136: `const EnvironmentalPresetService = require('../../../domain/services/EnvironmentalPresetService.js').default;`

### Unit Tests (1 file)

11. **UnifiedPersistenceService.test.js** (in `src/test/unit/`)
    - Lines 265-266, 273: Dynamic require() for redux-persist mocking

### Presentation Tests (2 files)

12. **MainPage.test.js** (in `src/presentation/pages/`)
    - Lines 173, 185, 212, 236: `const { useSimulationContext } = require('../contexts/SimulationContext.js');`

13. **MainPage.simple.test.js** (in `src/presentation/pages/`)
    - Line 89: `const mockUseSimulationContext = require('../contexts/SimulationContext.js').useSimulationContext;`

### Root Test Files (1 file)

14. **consciousness-template-integration.test.js** (in `src/__tests__/`)
    - Line 12: `const TemplateManager = require('../template/TemplateManager').default;`
    - Line 13: `const Character = require('../domain/entities/Character').default;`

---

## Category 2: Production Files (4 files)

### Application Services (1 file - NEEDS CONVERSION)

1. **DirectInteractionAssignment.js** (in `src/application/services/`)
   - Line 453: `module.exports = DirectInteractionAssignment;`
   - **Action**: Convert to `export default DirectInteractionAssignment;`

### Data/Config Files (2 files - NEEDS CONVERSION)

2. **oakwood-federation-config.js** (in `src/data/demos/valley-of-echoes/`)
   - Line 410: `module.exports = oakwoodFederationConfig;`
   - **Action**: Convert to `export default oakwoodFederationConfig;`

3. **ironhold-dominion-config.js** (in `src/data/demos/valley-of-echoes/`)
   - Line 516: `module.exports = ironholdDominionConfig;`
   - **Action**: Convert to `export default ironholdDominionConfig;`

### Duplicate Config Files (2 files - NEEDS CONVERSION)

4. **oakwood-config.js** (in `src/configs/valley-of-echoes/`)
   - Line 631: `module.exports = oakwoodFederationConfig;`
   - **Action**: Convert to `export default oakwoodFederationConfig;`

5. **ironhold-config.js** (in `src/configs/valley-of-echoes/`)
   - Line 615: `module.exports = ironholdDominionConfig;`
   - **Action**: Convert to `export default ironholdDominionConfig;`

---

## Category 3: Examples (1 file - LOW PRIORITY)

1. **consciousness-template-demo.js** (in `src/examples/`)
   - Line 8: `const { TemplateManager } = require('../template/TemplateManager');`
   - Line 9: `const { Character } = require('../domain/entities/Character');`
   - Line 312: `module.exports = { ConsciousnessTemplateDemo };`
   - **Action**: Convert for completeness (not used in production)

---

## Category 4: Already Handled (3 commented requires)

**DemoService.js** - Lines 6, 10, 13 (commented out)
- These are already commented and don't need action

---

## Phase 4 Execution Plan

### Step 1: Convert Production Files (4 files)
**Priority**: HIGH - These are used by production code

1. DirectInteractionAssignment.js
2. oakwood-federation-config.js  
3. ironhold-dominion-config.js
4. oakwood-config.js (duplicate)
5. ironhold-config.js (duplicate)

**Estimated Time**: 15 minutes

### Step 2: Convert Domain Service Tests (4 files)
**Priority**: MEDIUM

- ConsciousnessCheckpointService tests (2 files)
- EventSignificanceService test
- Task5Integration test

**Estimated Time**: 20 minutes

### Step 3: Convert Integration Tests (3 files)
**Priority**: MEDIUM

- consequence-resolution-integration.test.js
- turn-counter-integration-comprehensive-new.test.js
- GenerateBehavior.integration.test.js

**Estimated Time**: 20 minutes

### Step 4: Convert Application/Presentation Tests (6 files)
**Priority**: MEDIUM

- Contract test: process-turn-with-lod.test.js
- Application tests: TemplateService tests (2 files)
- Unit test: UnifiedPersistenceService.test.js
- Presentation tests: MainPage tests (2 files)

**Estimated Time**: 25 minutes

### Step 5: Convert Root Test & Example (2 files)
**Priority**: LOW

- consciousness-template-integration.test.js
- consciousness-template-demo.js (example)

**Estimated Time**: 10 minutes

---

## Total Effort Estimate

**Total Files**: 17 files  
**Total Time**: ~90 minutes (1.5 hours)

**Breakdown**:
- Production files: 15 min (5 files)
- Test files: 75 min (12 files)

---

## Special Considerations

### 1. Dynamic Require() for Mocking
Some test files use `require()` dynamically for Jest mocking:
- `GenerateBehavior.integration.test.js` (lines 143-153)
- `UnifiedPersistenceService.test.js` (lines 265-273)

**Strategy**: Keep dynamic require() if needed for Jest mocking patterns, or use `jest.mock()` with ES6 imports.

### 2. Duplicate Config Files
There are duplicate config files:
- `src/data/demos/valley-of-echoes/` (newer location)
- `src/configs/valley-of-echoes/` (older location)

**Question**: Should we remove duplicates or keep both?

### 3. Test File Coverage
All test failures from Phase 2 were pre-existing. Converting test files to ES6 should not introduce new issues.

---

## Validation Checklist

After Phase 4 completion:

- [ ] Zero `require()` in `src/` directory (except comments)
- [ ] Zero `module.exports` in `src/` directory  
- [ ] All test suites still run (jest)
- [ ] No new test failures introduced
- [ ] Production app still builds and runs
- [ ] Demo scenarios still work

---

## Next Steps

1. **Review this analysis** - Confirm scope and approach
2. **Start with production files** - Quick wins (5 files)
3. **Convert test files systematically** - Domain → Integration → Application
4. **Run test suite after each batch** - Catch issues early
5. **Final validation** - Full test suite + manual testing

---

## Files Outside Scope (Not Converting)

### Root-Level Utility Scripts
These are development/debugging utilities, not part of the production app:
- `test-*.js` files in `sim-engine/` root (30+ files)
- `debug-*.js` files
- `verify-*.js` files
- `initialize-*.js` files
- Node.js test runners (run-*.js)

**Reason**: These are standalone scripts, not part of the module dependency tree.

### Documentation Files
- `docs/*.md` - Code examples in markdown (leave as-is)
- `.kiro/specs/**/*.md` - Specification documents

### Configuration Files
- `babel.config.js` - Tool config (CommonJS expected)
- `jest.config.js` - Tool config (CommonJS expected)
- `tailwind.config.js` - Tool config (CommonJS expected)
- `postcss.config.js` - Tool config (CommonJS expected)

---

## Success Criteria

✅ Phase 4 Complete When:
1. All 17 files converted to ES6
2. Zero require() in `src/` production code
3. Zero module.exports in `src/` production code  
4. Test suite passes with no new failures
5. Application still functions correctly

