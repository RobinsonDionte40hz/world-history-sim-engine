# Module System Standardization - Design Document

## Overview

The Module System Standardization initiative converts the World History Simulation Engine from a mixed CommonJS/ES6 module architecture to a pure ES6 module system. This design provides a systematic approach to identify, convert, and validate all module patterns while maintaining backward compatibility and preventing regression.

The conversion follows a prioritized, layered approach: Domain layer → Application layer → Infrastructure layer → Presentation layer → Tests → Configurations. This ensures core business logic is stabilized first, followed by outer layers.

## Architecture

### Current State Analysis

```
Module System Distribution (as of analysis):
├── Pure ES6 Modules: ~320 files (70%)
├── Pure CommonJS: ~25 files (5%)
├── Mixed ES6/CommonJS: ~115 files (25%)
└── Total JavaScript Files: ~460

Problem Patterns:
1. Lazy requires in constructors: Character.js, Interaction.js
2. Test files using require(): 15+ test files
3. Config exports: All demo configs use module.exports
4. Dynamic requires: EnvironmentalHazard.js, AlignmentService.js
5. Circular dependency workarounds: CharacterTemplateService
```

### Target State Architecture

```
ES6 Module System:
├── domain/
│   ├── entities/           # Static imports for value objects
│   ├── services/           # Constructor injection, no lazy loading
│   └── value-objects/      # Pure ES6 exports
├── application/
│   ├── use-cases/          # Dynamic imports for circular deps only
│   └── services/           # Static imports
├── infrastructure/
│   └── repositories/       # Static imports with adapter pattern
├── presentation/
│   ├── components/         # React lazy() for code splitting
│   └── contexts/           # Static imports
└── configs/
    └── demos/              # ES6 default exports

Import Patterns:
- Static imports: 95% of codebase
- Dynamic imports: 5% for circular deps and code splitting
- No CommonJS: 0% tolerance
```

## Conversion Strategy

### Phase 1: Domain Layer 

#### 1.1 Entity Conversion

**Target Files** (~50 files):
- `Character.js` (circular dep with CharacterTemplateService)
- `Node.js`, `Settlement.js`, `Interaction.js`
- All interaction subtypes
- All value objects

**Conversion Pattern**:
```javascript
// BEFORE (CommonJS in Character.js)
class Character {
  constructor(config) {
    // Lazy require to avoid circular dependency
    if (config.applyTemplate) {
      const CharacterTemplateService = require('../services/CharacterTemplateService.js').default;
      // Use service...
    }
  }
}

// AFTER (ES6 with dynamic import)
class Character {
  constructor(config) {
    // Store config for lazy loading
    this._templateConfig = config.applyTemplate;
  }
  
  async applyTemplate() {
    if (this._templateConfig) {
      const { default: CharacterTemplateService } = await import('../services/CharacterTemplateService.js');
      // Use service...
    }
  }
}
```

**Circular Dependency Resolution**:
```javascript
// Pattern 1: Dependency Injection (Preferred)
class Character {
  constructor(config, dependencies = {}) {
    this.templateService = dependencies.templateService || null;
  }
  
  applyTemplate() {
    if (this.templateService) {
      this.templateService.apply(this);
    }
  }
}

// Pattern 2: Dynamic Import (Fallback)
class Character {
  async loadTemplateService() {
    if (!this._templateService) {
      const module = await import('../services/CharacterTemplateService.js');
      this._templateService = module.default;
    }
    return this._templateService;
  }
}

// Pattern 3: Service Locator (Last Resort)
class Character {
  applyTemplate() {
    const service = ServiceRegistry.get('CharacterTemplateService');
    service.apply(this);
  }
}
```

#### 1.2 Service Conversion

**Target Files** (~80 files):
- All consciousness services
- All memory services  
- LODManager, TurnManager
- HistoryGenerator, WorldBuilder

**Conversion Pattern**:
```javascript
// BEFORE (AlignmentService.js)
const { Alignment } = require('../value-objects/Alignment.js');

class AlignmentService {
  // ...
}

module.exports = AlignmentService;

// AFTER
import { Alignment } from '../value-objects/Alignment.js';

class AlignmentService {
  // ...
}

export default AlignmentService;
```

### Phase 2: Application Layer 

#### 2.1 Use Case Conversion

**Target Files** (~30 files):
- `ProcessTurnWithLOD.js` (heavy CommonJS usage)
- `GenerateBehavior.js`
- All simulation use cases

**Conversion Example**:
```javascript
// BEFORE (ProcessTurnWithLOD.js)
const Character = require('../../../domain/entities/Character.js');
const generateBehavior = require('../npc/GenerateBehavior.js');
const EvolutionService = require('../../../domain/services/EvolutionService.js');
// ... 8 more requires

module.exports = processTurnWithLOD;

// AFTER
import Character from '../../../domain/entities/Character.js';
import generateBehavior from '../npc/GenerateBehavior.js';
import EvolutionService from '../../../domain/services/EvolutionService.js';
// ... 8 more imports

export default processTurnWithLOD;
```

#### 2.2 Service Layer Conversion

**Target Files** (~20 files):
- SimulationService, TemplateService
- DemoService, PipelineValidationService

**Pattern**: Straightforward import/export conversion with constructor injection validation.

### Phase 3: Configuration Files (Week 1, Day 5)

#### 3.1 Demo Configuration Conversion

**Target Files** (~10 files):
- `oakwood-federation-config.js`
- `ironhold-dominion-config.js`
- Valley of Echoes demo configs

**Conversion Pattern**:
```javascript
// BEFORE
const oakwoodFederationConfig = {
  name: 'Oakwood Federation',
  settlements: [/* ... */],
  characters: [/* ... */]
};

module.exports = oakwoodFederationConfig;

// AFTER
const oakwoodFederationConfig = {
  name: 'Oakwood Federation',
  settlements: [/* ... */],
  characters: [/* ... */]
};

export default oakwoodFederationConfig;
```

**Import Updates**:
```javascript
// Services that load configs
// BEFORE
const oakwoodConfig = require('../../configs/valley-of-echoes/oakwood-config.js');

// AFTER
import oakwoodConfig from '../../configs/valley-of-echoes/oakwood-config.js';
```

### Phase 4: Test Files 

#### 4.1 Test File Conversion

**Target Files** (~115 test files):
- All `*.test.js` files
- Integration tests
- Contract tests

**Conversion Pattern**:
```javascript
// BEFORE (consciousness-template-integration.test.js)
const TemplateManager = require('../template/TemplateManager').default;
const Character = require('../domain/entities/Character').default;

describe('Template Integration', () => {
  it('should apply templates', () => {
    const template = new TemplateManager();
    // ...
  });
});

// AFTER
import TemplateManager from '../template/TemplateManager.js';
import Character from '../domain/entities/Character.js';

describe('Template Integration', () => {
  it('should apply templates', () => {
    const template = new TemplateManager();
    // ...
  });
});
```

#### 4.2 Jest Mock Updates

**Pattern**:
```javascript
// BEFORE
jest.mock('../domain/services/InteractionManager.js');
const InteractionManager = require('../domain/services/InteractionManager.js').default;

// AFTER
jest.mock('../domain/services/InteractionManager.js');
import InteractionManager from '../domain/services/InteractionManager.js';
```

#### 4.3 Jest Configuration

**Update `jest.config.js`**:
```javascript
module.exports = {
  // Ensure ES6 module transformation
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // ES6 module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // Transform node_modules if needed
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-transform)/)'
  ],
  
  // ESM support
  extensionsToTreatAsEsm: ['.jsx'],
  
  // Ensure proper module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Phase 5: Infrastructure Layer 

#### 5.1 Repository Conversion

**Target Files** (~10 files):
- LocalStorageWorldRepository
- TemplateRepository
- All persistence adapters

**Pattern**: Standard import/export conversion with interface preservation.

#### 5.2 Presentation Layer

**Target Files** (~100 files):
- React components (mostly already ES6)
- Contexts (mostly already ES6)
- Hooks (mostly already ES6)

**Focus**: Verify all imports use ES6, update any stragglers.

## Automated Conversion Tools

### Tool 1: Module Pattern Scanner

```javascript
// scan-module-patterns.js
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class ModulePatternScanner {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.results = {
      pureES6: [],
      pureCommonJS: [],
      mixed: [],
      errors: []
    };
  }

  async scan() {
    const files = await glob('src/**/*.js', { cwd: this.rootDir });
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(this.rootDir, file), 'utf-8');
      const analysis = this.analyzeFile(content, file);
      
      if (analysis.hasImport && analysis.hasRequire) {
        this.results.mixed.push({ file, patterns: analysis });
      } else if (analysis.hasImport) {
        this.results.pureES6.push(file);
      } else if (analysis.hasRequire) {
        this.results.pureCommonJS.push(file);
      }
    }
    
    return this.results;
  }

  analyzeFile(content, file) {
    const hasImport = /import\s+.*from/.test(content);
    const hasExport = /export\s+(default|{|const|class|function)/.test(content);
    const hasRequire = /require\s*\(/.test(content);
    const hasModuleExports = /module\.exports\s*=/.test(content);
    const hasExportsDot = /exports\.\w+\s*=/.test(content);
    
    return {
      file,
      hasImport,
      hasExport,
      hasRequire,
      hasModuleExports,
      hasExportsDot,
      mixedPattern: (hasImport || hasExport) && (hasRequire || hasModuleExports || hasExportsDot)
    };
  }

  generateReport() {
    const total = this.results.pureES6.length + this.results.pureCommonJS.length + this.results.mixed.length;
    
    return `
Module System Analysis Report
==============================

Total Files: ${total}

Pure ES6 Modules: ${this.results.pureES6.length} (${((this.results.pureES6.length / total) * 100).toFixed(1)}%)
Pure CommonJS: ${this.results.pureCommonJS.length} (${((this.results.pureCommonJS.length / total) * 100).toFixed(1)}%)
Mixed Patterns: ${this.results.mixed.length} (${((this.results.mixed.length / total) * 100).toFixed(1)}%)

Files Needing Conversion:
${this.results.pureCommonJS.concat(this.results.mixed).map(f => typeof f === 'string' ? f : f.file).join('\n')}
`;
  }
}

export default ModulePatternScanner;
```

### Tool 2: Automated Converter

```javascript
// convert-to-es6.js
import fs from 'fs';
import path from 'path';

class ES6Converter {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.backup = options.backup !== false;
    this.conversions = [];
  }

  convertFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    let changes = [];

    // Convert require() to import
    content = content.replace(
      /const\s+(\{[^}]+\}|\w+)\s*=\s*require\s*\(\s*(['"][^'"]+['"])\s*\)\s*;?/g,
      (match, varName, modulePath) => {
        changes.push(`require → import: ${varName}`);
        if (varName.startsWith('{')) {
          return `import ${varName} from ${modulePath};`;
        }
        return `import ${varName} from ${modulePath};`;
      }
    );

    // Convert .default access
    content = content.replace(
      /const\s+(\w+)\s*=\s*require\s*\(\s*(['"][^'"]+['"])\s*\)\.default\s*;?/g,
      (match, varName, modulePath) => {
        changes.push(`require().default → import: ${varName}`);
        return `import ${varName} from ${modulePath};`;
      }
    );

    // Convert module.exports = 
    content = content.replace(
      /module\.exports\s*=\s*(\w+)\s*;?/g,
      (match, exportName) => {
        changes.push(`module.exports → export default`);
        return `export default ${exportName};`;
      }
    );

    // Convert exports.name =
    content = content.replace(
      /exports\.(\w+)\s*=\s*([^;]+)\s*;?/g,
      (match, exportName, value) => {
        changes.push(`exports.${exportName} → export`);
        return `export const ${exportName} = ${value};`;
      }
    );

    // Add .js extension to relative imports if missing
    content = content.replace(
      /from\s+(['"])(\.[^'"]+)(?<!\.js)\1/g,
      (match, quote, path) => {
        if (!path.endsWith('.json') && !path.endsWith('.css')) {
          changes.push(`Add .js extension: ${path}`);
          return `from ${quote}${path}.js${quote}`;
        }
        return match;
      }
    );

    if (content !== original) {
      if (this.backup) {
        fs.writeFileSync(`${filePath}.backup`, original, 'utf-8');
      }

      if (!this.dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
      }

      this.conversions.push({
        file: filePath,
        changes,
        success: true
      });

      return { success: true, changes };
    }

    return { success: false, reason: 'No changes needed' };
  }

  convertDirectory(dirPath, options = {}) {
    const { pattern = '**/*.js', exclude = ['node_modules', 'build', 'dist'] } = options;
    
    // Implementation would scan directory and convert files
    // Returns summary of all conversions
  }

  generateReport() {
    const successful = this.conversions.filter(c => c.success).length;
    
    return `
Conversion Report
=================

Total Files Processed: ${this.conversions.length}
Successfully Converted: ${successful}
No Changes Needed: ${this.conversions.length - successful}

Details:
${this.conversions.map(c => `
  ${c.file}
  ${c.changes.map(ch => `    - ${ch}`).join('\n')}
`).join('\n')}
`;
  }
}

export default ES6Converter;
```

### Tool 3: Validation Script

```javascript
// validate-es6-modules.js
import fs from 'fs';
import { glob } from 'glob';

class ES6Validator {
  async validate(rootDir) {
    const files = await glob('src/**/*.js', { cwd: rootDir });
    const violations = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for CommonJS patterns
      if (/require\s*\(/.test(content)) {
        violations.push({ file, type: 'require()', severity: 'ERROR' });
      }
      
      if (/module\.exports/.test(content)) {
        violations.push({ file, type: 'module.exports', severity: 'ERROR' });
      }
      
      if (/exports\.\w+/.test(content)) {
        violations.push({ file, type: 'exports.', severity: 'ERROR' });
      }

      // Check for missing .js extensions
      const importMatches = content.matchAll(/import\s+.*from\s+['"](\.[^'"]+)['"]/g);
      for (const match of importMatches) {
        const importPath = match[1];
        if (!importPath.endsWith('.js') && !importPath.endsWith('.json') && !importPath.endsWith('.css')) {
          violations.push({ 
            file, 
            type: 'missing-extension', 
            path: importPath,
            severity: 'WARNING' 
          });
        }
      }
    }

    return {
      valid: violations.filter(v => v.severity === 'ERROR').length === 0,
      violations,
      summary: this.generateSummary(violations)
    };
  }

  generateSummary(violations) {
    const errors = violations.filter(v => v.severity === 'ERROR');
    const warnings = violations.filter(v => v.severity === 'WARNING');

    return `
Validation Summary
==================

Total Violations: ${violations.length}
Errors: ${errors.length}
Warnings: ${warnings.length}

${errors.length > 0 ? 'ERRORS:\n' + errors.map(e => `  ${e.file}: ${e.type}`).join('\n') : ''}
${warnings.length > 0 ? '\nWARNINGS:\n' + warnings.map(w => `  ${w.file}: ${w.type} (${w.path})`).join('\n') : ''}
`;
  }
}

export default ES6Validator;
```

## Testing Strategy

### Pre-Conversion Testing

1. **Baseline Test Suite**: Run full test suite, record results
2. **Coverage Report**: Generate coverage baseline (target: 80%+)
3. **Build Verification**: Ensure clean build with no warnings

### Per-Phase Testing

```javascript
// Phase Test Checklist Template
const phaseTestChecklist = {
  phase: 1, // Domain Layer
  
  unitTests: {
    target: 'Run all domain entity and service tests',
    command: 'npm test -- --testPathPattern=domain',
    passRate: '100%',
    status: 'pending'
  },
  
  integrationTests: {
    target: 'Run integration tests involving domain layer',
    command: 'npm test -- --testPathPattern=integration',
    passRate: '100%',
    status: 'pending'
  },
  
  buildVerification: {
    target: 'Ensure build completes without errors',
    command: 'npm run build',
    success: true,
    status: 'pending'
  },
  
  lintVerification: {
    target: 'No ES6 violations in converted files',
    command: 'npm run lint',
    violations: 0,
    status: 'pending'
  }
};
```

### Post-Conversion Validation

1. **Full Test Suite**: Must pass at 100%
2. **Build Analysis**: Bundle size comparison
3. **Runtime Verification**: Manual testing of critical paths
4. **Performance Testing**: No regression in key metrics

## ESLint Configuration

```javascript
// .eslintrc.js updates
module.exports = {
  // ... existing config
  
  rules: {
    // Enforce ES6 imports
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="require"]',
        message: 'Use ES6 import instead of require()'
      },
      {
        selector: 'MemberExpression[object.name="module"][property.name="exports"]',
        message: 'Use ES6 export instead of module.exports'
      },
      {
        selector: 'MemberExpression[object.name="exports"]',
        message: 'Use ES6 export instead of exports'
      }
    ],
    
    // Require .js extensions for relative imports
    'import/extensions': ['error', 'always', {
      js: 'always',
      json: 'always'
    }],
    
    // Prefer default export
    'import/prefer-default-export': 'warn',
    
    // No default export
    'import/no-default-export': 'off'
  }
};
```

## Rollback Plan

If critical issues are discovered:

1. **Git Revert**: Each phase is a separate commit
2. **Selective Rollback**: Revert specific files while keeping others
3. **Feature Flag**: Use environment variable to toggle module system
4. **Backup Restoration**: All converted files have `.backup` copies

## Documentation Updates

### Files to Update

1. **CONTRIBUTING.md**: Add ES6 module guidelines
2. **README.md**: Update setup instructions if needed
3. **Architecture Docs**: Reflect new module patterns
4. **Code Examples**: Convert all examples to ES6

### Developer Guidelines

```markdown
## Module System Guidelines

### Importing Modules

✅ **DO:**
```javascript
// Default import
import MyClass from './MyClass.js';

// Named imports
import { service1, service2 } from './services.js';

// Namespace import
import * as utils from './utils.js';

// Dynamic import (only when needed)
const module = await import('./lazyModule.js');
```

❌ **DON'T:**
```javascript
// No CommonJS
const MyClass = require('./MyClass.js');
const { service1 } = require('./services.js');

// No missing extensions
import MyClass from './MyClass';
```

### Exporting Modules

✅ **DO:**
```javascript
// Default export
export default class MyClass { }

// Named exports
export const service = new Service();
export function helper() { }

// Re-exports
export { default as MyClass } from './MyClass.js';
```

❌ **DON'T:**
```javascript
// No CommonJS
module.exports = MyClass;
exports.service = service;
```
```

## Performance Impact Analysis

### Expected Improvements

- **Bundle Size**: 10-15% reduction (tree-shaking)
- **Build Time**: 5-10% improvement (less transformation)
- **Runtime**: Negligible impact (< 1% variance)

### Measurement Plan

```javascript
// performance-baseline.js
const baseline = {
  bundleSize: {
    before: '2.4 MB',
    after: null,
    target: '< 2.1 MB'
  },
  
  buildTime: {
    before: '45 seconds',
    after: null,
    target: '< 43 seconds'
  },
  
  testTime: {
    before: '120 seconds',
    after: null,
    target: '< 132 seconds' // Allow 10% increase
  }
};
```

## Success Criteria

- ✅ Zero CommonJS patterns in `src/` directory
- ✅ All tests pass (100% pass rate)
- ✅ Build completes without warnings
- ✅ ESLint shows no module violations
- ✅ Bundle size reduced by 10%+
- ✅ Documentation updated
- ✅ Team approval (90%+ satisfaction)
