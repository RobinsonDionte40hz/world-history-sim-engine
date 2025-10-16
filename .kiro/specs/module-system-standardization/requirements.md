# Module System Standardization - Requirements Document

## Introduction

The World History Simulation Engine currently contains mixed module systems (CommonJS and ES6) across its codebase, creating runtime inconsistencies, test failures, and maintenance complexity. This specification addresses the critical need to standardize on ES6 modules throughout the entire codebase, ensuring compatibility with modern JavaScript tooling, React best practices, and the project's existing architecture.

## Problem Statement

### Current Issues

1. **Runtime Errors**: Mixed module systems cause test failures and unpredictable behavior in Jest
2. **Build Inconsistency**: Create React App expects ES6 modules, but finds CommonJS in 50+ files
3. **Maintenance Burden**: Developers must remember which import style to use per file
4. **Tree-Shaking Blocked**: CommonJS prevents effective dead code elimination
5. **Type Inference Limited**: TypeScript/IDE tooling struggles with mixed patterns

### Affected Files (Sample)

```
Source Files:
- src/application/use-cases/simulation/ProcessTurnWithLOD.js (CommonJS)
- src/domain/services/AlignmentService.js (Mixed)
- src/domain/entities/EnvironmentalHazard.js (Mixed)
- src/domain/entities/Character.js (Mixed - lazy requires)

Configuration Files:
- src/configs/valley-of-echoes/oakwood-config.js (CommonJS exports)
- src/configs/valley-of-echoes/ironhold-config.js (CommonJS exports)
- src/data/demos/valley-of-echoes/*.js (CommonJS exports)

Test Files:
- src/__tests__/consciousness-template-integration.test.js (Mixed)
- src/test/consequence-resolution-integration.test.js (Mixed)
- src/test/contract/process-turn-with-lod.test.js (CommonJS)
- 15+ other test files with require() statements
```

## Requirements

### Requirement 1: ES6 Module Conversion

**User Story**: As a developer, I want all JavaScript files to use consistent ES6 module syntax, so that the codebase is maintainable and compatible with modern tooling.

#### Acceptance Criteria

1. WHEN any source file is loaded THEN it SHALL use `import` and `export` syntax exclusively
2. WHEN importing default exports THEN the syntax SHALL be `import MyClass from './path.js'`
3. WHEN importing named exports THEN the syntax SHALL be `import { MyService } from './path.js'`
4. WHEN exporting defaults THEN the syntax SHALL be `export default MyClass`
5. WHEN exporting named items THEN the syntax SHALL be `export { MyService, MyUtil }`
6. WHEN all conversions are complete THEN NO file SHALL contain `require()`, `module.exports`, or `exports.`
7. WHEN the build runs THEN it SHALL complete without module system warnings or errors

### Requirement 2: Lazy Loading Pattern Modernization

**User Story**: As a developer, I want lazy-loaded dependencies (like Character.js importing CharacterTemplateService) to use dynamic ES6 imports, so that circular dependencies are avoided without using CommonJS.

#### Acceptance Criteria

1. WHEN circular dependencies exist THEN the system SHALL use dynamic `import()` for lazy loading
2. WHEN CharacterTemplateService is loaded in Character.js THEN it SHALL use `const { default: CharacterTemplateService } = await import('...')`
3. WHEN lazy imports are used THEN they SHALL be cached to prevent redundant loading
4. WHEN errors occur during dynamic import THEN they SHALL be caught and logged with clear messages
5. WHEN the application runs THEN lazy-loaded modules SHALL load successfully on demand
6. WHEN tests run THEN they SHALL mock dynamic imports appropriately

### Requirement 3: Configuration File Standardization

**User Story**: As a world builder, I want demo configuration files to use ES6 exports, so that they integrate seamlessly with the rest of the system.

#### Acceptance Criteria

1. WHEN configuration files export data THEN they SHALL use `export default configObject`
2. WHEN configuration files are imported THEN they SHALL use `import config from './config.js'`
3. WHEN Oakwood Federation config is loaded THEN it SHALL export as ES6 default
4. WHEN Ironhold Dominion config is loaded THEN it SHALL export as ES6 default
5. WHEN Valley of Echoes demo loads configs THEN it SHALL import them using ES6 syntax
6. WHEN configuration changes THEN backward compatibility SHALL be maintained through migration utilities

### Requirement 4: Test File Modernization

**User Story**: As a developer running tests, I want all test files to use ES6 imports, so that Jest runs without module resolution errors.

#### Acceptance Criteria

1. WHEN Jest test files import modules THEN they SHALL use ES6 `import` syntax
2. WHEN tests mock dependencies THEN they SHALL use `jest.mock()` with ES6 paths
3. WHEN tests access mocked modules THEN they SHALL use `jest.requireMock()` or direct imports
4. WHEN all tests run THEN there SHALL be zero "unexpected token" or "require is not defined" errors
5. WHEN Jest configuration is checked THEN it SHALL have `transform` and `moduleFileExtensions` properly configured
6. WHEN running `npm test` THEN all tests SHALL pass without module system errors

### Requirement 5: Import Path Consistency

**User Story**: As a developer, I want all import paths to include `.js` extensions, so that Node.js ESM compatibility is maintained.

#### Acceptance Criteria

1. WHEN importing relative modules THEN paths SHALL include `.js` extension (e.g., `'./MyClass.js'`)
2. WHEN importing from node_modules THEN NO extension SHALL be used (e.g., `'react'`)
3. WHEN the codebase is scanned THEN all ES6 imports SHALL have correct extensions
4. WHEN Node.js runs the code THEN it SHALL resolve all imports correctly
5. WHEN IDEs analyze imports THEN they SHALL provide correct autocomplete and navigation
6. WHEN using path aliases THEN they SHALL resolve correctly with extensions

### Requirement 6: Backward Compatibility & Migration

**User Story**: As a system maintainer, I want existing saved worlds and templates to load correctly after module system changes, so that users don't lose data.

#### Acceptance Criteria

1. WHEN old worlds are loaded THEN they SHALL deserialize correctly with ES6 modules
2. WHEN templates reference old module paths THEN they SHALL be migrated automatically
3. WHEN external plugins use CommonJS THEN a compatibility layer SHALL warn about deprecation
4. WHEN migration runs THEN it SHALL log all converted files and any issues encountered
5. WHEN the migration completes THEN a summary report SHALL be generated
6. WHEN rollback is needed THEN clear instructions SHALL be provided

### Requirement 7: Build System Optimization

**User Story**: As a developer, I want the build system to leverage ES6 modules for better optimization, so that bundle sizes are smaller and load times faster.

#### Acceptance Criteria

1. WHEN the build runs THEN tree-shaking SHALL eliminate unused exports
2. WHEN bundle size is measured THEN it SHALL be at least 10% smaller than before (excluding compression)
3. WHEN code splitting is enabled THEN dynamic imports SHALL create separate chunks
4. WHEN the bundle is analyzed THEN there SHALL be no CommonJS compatibility shims
5. WHEN source maps are generated THEN they SHALL correctly map to ES6 source files
6. WHEN production build runs THEN it SHALL complete in under 2 minutes for the full codebase

### Requirement 8: Developer Experience

**User Story**: As a new contributor, I want clear documentation on module conventions, so that I can write code that follows project standards.

#### Acceptance Criteria

1. WHEN the CONTRIBUTING.md is read THEN it SHALL include ES6 module guidelines
2. WHEN ESLint runs THEN it SHALL enforce ES6 module usage and flag CommonJS
3. WHEN developers violate module standards THEN they SHALL receive clear error messages
4. WHEN pre-commit hooks run THEN they SHALL check for CommonJS patterns
5. WHEN documentation examples are shown THEN they SHALL use ES6 import/export exclusively
6. WHEN onboarding new developers THEN module standards SHALL be clearly communicated

## Non-Functional Requirements

### Performance

- Module conversion SHALL NOT degrade runtime performance
- Build time SHALL improve by at least 5% due to better tree-shaking
- Test execution time SHALL remain within 10% of current baseline

### Maintainability

- All converted code SHALL maintain existing functionality
- Code coverage SHALL remain at or above current levels (80%)
- No new technical debt SHALL be introduced

### Compatibility

- Browser compatibility SHALL remain unchanged (ES6+ with polyfills)
- Node.js compatibility SHALL be maintained (v16+)
- Jest test framework SHALL work without additional configuration changes

## Out of Scope

- Converting third-party dependencies to ES6 (beyond our control)
- Migrating to TypeScript (separate initiative)
- Refactoring class structures or architecture
- Adding new features during conversion

## Success Metrics

1. **Zero CommonJS Patterns**: `grep -r "require(" src/` returns zero matches
2. **Zero Module Exports**: `grep -r "module.exports" src/` returns zero matches
3. **100% Test Pass Rate**: All existing tests pass with ES6 imports
4. **Build Success**: `npm run build` completes without module warnings
5. **Bundle Size Reduction**: Production bundle is 10%+ smaller
6. **Developer Satisfaction**: Team survey shows 90%+ approval of new standards

## Timeline

- **Phase 1**: Source files conversion 
- **Phase 2**: Configuration files conversion 
- **Phase 3**: Test files modernization 
- **Phase 4**: Documentation and tooling updates 
- **Phase 5**: Validation and rollout 

## Dependencies

- Jest configuration must support ES6 modules
- Babel/Webpack configuration must handle ES6 correctly
- ESLint rules must be updated to enforce ES6 patterns
- Pre-commit hooks must check for CommonJS usage

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking existing functionality | HIGH | MEDIUM | Comprehensive test suite, gradual rollout |
| Developer resistance | MEDIUM | LOW | Clear documentation, automated tooling |
| Test framework incompatibility | HIGH | LOW | Jest supports ES6, validate config early |
| Dynamic import browser issues | MEDIUM | LOW | Polyfills and fallbacks for older browsers |
| Build time increase | LOW | LOW | Measure build times, optimize if needed |

## Approval

- [x] Technical Lead Review
- [ ] Architecture Review Board Approval
- [ ] Development Team Consensus
- [ ] QA Sign-off
