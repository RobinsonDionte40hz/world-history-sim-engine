# Design Document

## Overview

This design outlines the integration of the Rust/WASM consciousness engine into the World History Simulation Engine. The integration will provide 2-10x performance improvements for consciousness calculations while maintaining full backward compatibility with existing JavaScript implementations through automatic fallback mechanisms.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         SimulationContext (React Context)             │  │
│  │  - Initialize WASM engine at startup                  │  │
│  │  - Provide engine instance to services               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         SimulationService                             │  │
│  │  - Orchestrates turn processing                       │  │
│  │  - Coordinates batch consciousness updates            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      BehavioralStateService                           │  │
│  │  - Uses WASM for single character calculations        │  │
│  │  - Falls back to JavaScript if WASM unavailable       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      LODManager                                        │  │
│  │  - Uses WASM batch processing for population groups   │  │
│  │  - Optimizes large-scale character processing         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 WASM Integration Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    ConsciousnessEngineWasm (Wrapper)                  │  │
│  │  - JavaScript API wrapper                             │  │
│  │  - Automatic fallback to JavaScript                   │  │
│  │  - Performance monitoring                             │  │
│  │  - Error handling and recovery                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    WASM Binary (consciousness_engine_bg.wasm)         │  │
│  │  - Rust-compiled consciousness calculations           │  │
│  │  - 389 KB optimized binary                            │  │
│  │  - 2-10x faster than JavaScript                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Single Character Processing
```
Character → BehavioralStateService.generateBehavioralState()
                    ↓
         ConsciousnessEngineWasm.calculateBehavioralState()
                    ↓
         ┌──────────┴──────────┐
         │                     │
    WASM Available?       JavaScript
         │                  Fallback
    WASM Calculation          │
         │                     │
         └──────────┬──────────┘
                    ↓
            Behavioral State
```

#### Batch Processing (LOD Groups)
```
Population Group → LODManager._processGroupCharacter()
                         ↓
    Collect consciousness states (100+ characters)
                         ↓
    ConsciousnessEngineWasm.calculateBatchBehavioralStates()
                         ↓
              ┌──────────┴──────────┐
              │                     │
         WASM Available?       JavaScript
              │                  Fallback
         Batch WASM                │
         (10x faster)              │
              │                     │
              └──────────┬──────────┘
                         ↓
         Array of Behavioral States
                         ↓
         Map back to characters
```

## Components and Interfaces

### 1. WASM Package Integration

**Package Name**: `@world-history-sim/consciousness-engine-wasm`

**Integration Method**: npm package installation

**Structure**:
```
rust-wasm/consciousness-engine/
├── pkg/                              # Generated by wasm-pack build
│   ├── consciousness_engine.js       # WASM loader
│   ├── consciousness_engine_bg.wasm  # Binary (389 KB)
│   ├── consciousness_engine.d.ts     # TypeScript definitions
│   └── package.json                  # Package metadata
├── src/wrapper/
│   └── ConsciousnessEngineWasm.js    # JavaScript wrapper API
└── package.json                      # Main package config
```

**Integration Steps**:

1. **Build the WASM package** (one-time or when updating):
   ```bash
   cd rust-wasm/consciousness-engine
   npm run build
   ```

2. **Install as npm dependency** (choose one):
   
   **Option A: Local development (npm link)**
   ```bash
   # In rust-wasm/consciousness-engine
   npm link
   
   # In sim-engine
   npm link @world-history-sim/consciousness-engine-wasm
   ```
   
   **Option B: Published package (production)**
   ```bash
   # In sim-engine
   npm install @world-history-sim/consciousness-engine-wasm
   ```
   
   **Option C: Local file reference (alternative)**
   ```bash
   # In sim-engine
   npm install ../rust-wasm/consciousness-engine
   ```

3. **Import in code**:
   ```javascript
   import { ConsciousnessEngineWasm } from '@world-history-sim/consciousness-engine-wasm';
   ```

**Benefits of npm approach**:
- Standard JavaScript dependency management
- Version control and updates
- No manual file copying
- Works with bundlers (webpack, vite, etc.)
- Proper dependency resolution

### 2. ConsciousnessEngineWasm Wrapper

**Location**: Provided by npm package `@world-history-sim/consciousness-engine-wasm`

**Import Path**: `@world-history-sim/consciousness-engine-wasm`

**Purpose**: Provides JavaScript API with automatic fallback

**Key Methods**:
```javascript
class ConsciousnessEngineWasm {
  // Initialization
  async initialize(): Promise<boolean>
  
  // Single character calculations
  calculateBehavioralState(consciousnessState): BehavioralState
  calculateEmotionalCoherence(frequency, baseCoherence): number
  determineEmotionalState(coherence, impactMagnitude): string
  
  // Batch processing (optimized for LOD)
  calculateBatchBehavioralStates(consciousnessStates[]): BehavioralState[]
  
  // Configuration and validation
  getDefaultConfiguration(): Configuration
  validateConfiguration(config): boolean
  
  // Performance monitoring
  getPerformanceStats(): PerformanceStats
}
```

**Fallback Strategy**:
```javascript
calculateBehavioralState(consciousnessState) {
  try {
    if (this.wasmModule && this.wasmEnabled) {
      return this.wasmModule.calculate_behavioral_state(consciousnessState);
    }
  } catch (error) {
    this.logger?.warn('WASM calculation failed, using JavaScript fallback');
    this.performanceStats.fallbackCalls++;
  }
  
  // JavaScript fallback implementation
  return this._calculateBehavioralStateJS(consciousnessState);
}
```

### 3. BehavioralStateService Integration

**Location**: `sim-engine/src/domain/services/BehavioralStateService.js`

**Current Implementation**: Pure JavaScript calculations

**Updated Implementation**:
```javascript
class BehavioralStateService extends BaseDomainService {
  constructor(memoryService, logger = null, errorHandler = null, consciousnessEngine = null) {
    super();
    this.memoryService = memoryService === undefined ? new SignificantMemoryService() : memoryService;
    this.logger = logger;
    this.errorHandler = errorHandler || new ConsciousnessErrorHandlingService(logger);
    
    // NEW: WASM engine integration
    this.consciousnessEngine = consciousnessEngine;
    this.useWASM = consciousnessEngine !== null;
  }
  
  /**
   * Generate behavioral state from consciousness parameters
   * Now uses WASM when available for 5x performance improvement
   */
  generateBehavioralState(character) {
    try {
      // Validate character consciousness
      if (!character?.consciousness) {
        return this._getDefaultBehavioralState();
      }
      
      // Use WASM if available
      if (this.useWASM && this.consciousnessEngine) {
        const consciousnessState = {
          baseFrequency: character.consciousness.baseFrequency,
          baseCoherence: character.consciousness.baseCoherence,
          emotionalState: character.consciousness.emotionalState || 'Content',
          currentFrequency: character.consciousness.currentFrequency,
          emotionalCoherence: character.consciousness.emotionalCoherence,
          lastUpdate: character.consciousness.lastUpdate
        };
        
        return this.consciousnessEngine.calculateBehavioralState(consciousnessState);
      }
      
      // Fallback to existing JavaScript implementation
      return this._generateBehavioralStateJS(character);
      
    } catch (error) {
      this.logger?.error(`Error generating behavioral state: ${error.message}`);
      return this._getDefaultBehavioralState();
    }
  }
  
  /**
   * Existing JavaScript implementation (preserved for fallback)
   * @private
   */
  _generateBehavioralStateJS(character) {
    // Existing implementation remains unchanged
    const frequency = character.consciousness.baseFrequency;
    const coherence = character.consciousness.baseCoherence;
    
    return {
      energy: this._mapFrequencyToEnergy(frequency),
      focus: this._mapCoherenceToFocus(coherence),
      mood: this._calculateMood(frequency, coherence),
      socialDrive: Math.max(0, Math.min(1, (frequency - 4) / 8)),
      riskTolerance: Math.max(0, Math.min(1, (frequency - 6) / 6)),
      ambition: Math.max(0, Math.min(1, coherence * (frequency / 10))),
      cachedTimestamp: Date.now()
    };
  }
}
```

### 4. LODManager Integration

**Location**: `sim-engine/src/domain/services/LODManager.js`

**Current Implementation**: Processes characters individually

**Updated Implementation**:
```javascript
class LODManager {
  constructor(consciousnessEngine = null) {
    this.processingMetrics = { /* ... */ };
    this.performanceHistory = [];
    
    // NEW: WASM engine for batch processing
    this.consciousnessEngine = consciousnessEngine;
    this.useWASMBatch = consciousnessEngine !== null;
    
    // Existing pools and caches
    this._eventPool = [];
    this._resultPool = [];
    this._characterCache = new Map();
  }
  
  /**
   * Process group-tier characters with WASM batch optimization
   */
  _processGroupCharacter(character, world, turnContext, citizenTierMultiplier = 1.0) {
    // For single character, use standard processing
    // Batch processing happens in processCharacterTier()
    
    const updatedCharacter = { ...character };
    this._cacheCharacter(character);
    
    // Update group statistics
    if (updatedCharacter.groupStatistics) {
      updatedCharacter.groupStatistics = {
        ...updatedCharacter.groupStatistics,
        morale: Math.max(0, Math.min(1, 
          updatedCharacter.groupStatistics.morale + (Math.random() - 0.5) * 0.1 * citizenTierMultiplier
        )),
        productivity: Math.max(0, Math.min(1, 
          updatedCharacter.groupStatistics.productivity + (Math.random() - 0.5) * 0.05 * citizenTierMultiplier
        ))
      };
    }
    
    const result = this._getResultFromPool();
    result.character = updatedCharacter;
    result.groupStatistics = updatedCharacter.groupStatistics;
    result.lodTier = 'group';
    
    return result;
  }
  
  /**
   * Process characters by tier with WASM batch optimization
   * NEW: Uses WASM batch processing for group characters
   */
  processCharacterTier(tier, characters, world, turnContext) {
    const startTime = performance.now();
    
    if (!characters || characters.length === 0) {
      return {
        processedCount: 0,
        averageProcessingTime: 0,
        results: [],
        byTier: { hero: 0, group: 0, background: 0 }
      };
    }
    
    // NEW: Use WASM batch processing for group characters
    if (tier === 'group' && this.useWASMBatch && characters.length >= 10) {
      return this._processBatchWithWASM(characters, world, turnContext);
    }
    
    // Standard processing for other tiers or small groups
    const results = new Array(characters.length);
    for (let i = 0; i < characters.length; i++) {
      results[i] = this.processCharacter(characters[i], world, turnContext);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    return {
      processedCount: characters.length,
      averageProcessingTime: totalTime / characters.length,
      results,
      byTier: this._calculateTierBreakdown(characters)
    };
  }
  
  /**
   * NEW: Process batch of characters using WASM
   * @private
   */
  _processBatchWithWASM(characters, world, turnContext) {
    const startTime = performance.now();
    
    try {
      // Collect consciousness states
      const consciousnessStates = characters.map(char => ({
        baseFrequency: char.consciousness?.baseFrequency || 7.5,
        baseCoherence: char.consciousness?.baseCoherence || 0.7,
        emotionalState: char.consciousness?.emotionalState || 'Content',
        currentFrequency: char.consciousness?.currentFrequency,
        emotionalCoherence: char.consciousness?.emotionalCoherence,
        lastUpdate: char.consciousness?.lastUpdate
      }));
      
      // Batch calculate behavioral states using WASM
      const behavioralStates = this.consciousnessEngine.calculateBatchBehavioralStates(
        consciousnessStates
      );
      
      // Process each character with pre-calculated behavioral state
      const results = characters.map((char, index) => {
        const updatedChar = { ...char };
        
        // Apply WASM-calculated behavioral state
        if (updatedChar.consciousness) {
          updatedChar.consciousness.behavioralState = behavioralStates[index];
        }
        
        // Continue with standard group processing
        return this._processGroupCharacter(updatedChar, world, turnContext);
      });
      
      const endTime = performance.now();
      
      return {
        processedCount: characters.length,
        averageProcessingTime: (endTime - startTime) / characters.length,
        results,
        byTier: { group: characters.length },
        wasmBatchUsed: true
      };
      
    } catch (error) {
      this.logger?.warn(`WASM batch processing failed: ${error.message}, falling back`);
      
      // Fallback to standard processing
      return this.processCharacterTier('group', characters, world, turnContext);
    }
  }
}
```

### 5. SimulationContext Integration

**Location**: `sim-engine/src/presentation/contexts/SimulationContext.js`

**Purpose**: Initialize WASM engine at application startup

**Implementation**:
```javascript
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ConsciousnessEngineWasm } from '@world-history-sim/consciousness-engine-wasm';
import SimulationService from '../../application/use-cases/services/SimulationService.js';
import BehavioralStateService from '../../domain/services/BehavioralStateService.js';
import LODManager from '../../domain/services/LODManager.js';

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [worldState, setWorldState] = useState(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [wasmStatus, setWasmStatus] = useState({
    initialized: false,
    enabled: false,
    error: null
  });
  
  // Initialize WASM engine singleton
  const consciousnessEngine = useMemo(() => new ConsciousnessEngineWasm(), []);
  
  // Initialize WASM at startup
  useEffect(() => {
    async function initializeWASM() {
      try {
        const success = await consciousnessEngine.initialize();
        
        setWasmStatus({
          initialized: true,
          enabled: success,
          error: success ? null : 'WASM unavailable, using JavaScript fallback'
        });
        
        if (success) {
          console.log('✅ WASM consciousness engine initialized successfully');
        } else {
          console.warn('⚠️  WASM unavailable, using JavaScript fallback (still functional)');
        }
      } catch (error) {
        console.error('❌ WASM initialization error:', error);
        setWasmStatus({
          initialized: true,
          enabled: false,
          error: error.message
        });
      }
    }
    
    initializeWASM();
  }, [consciousnessEngine]);
  
  // Create services with WASM engine
  const services = useMemo(() => {
    const behavioralStateService = new BehavioralStateService(
      undefined, // memoryService
      console,   // logger
      undefined, // errorHandler
      consciousnessEngine // NEW: Pass WASM engine
    );
    
    const lodManager = new LODManager(consciousnessEngine); // NEW: Pass WASM engine
    
    const simulationService = new SimulationService();
    
    return {
      behavioralStateService,
      lodManager,
      simulationService,
      consciousnessEngine
    };
  }, [consciousnessEngine]);
  
  // Rest of SimulationContext implementation...
  
  const value = {
    worldState,
    isSimulationRunning,
    wasmStatus, // NEW: Expose WASM status
    services,
    // ... other context values
  };
  
  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}
```

## Data Models

### Consciousness State (Input to WASM)

```typescript
interface ConsciousnessState {
  baseFrequency: number;      // 3.0 - 15.0 Hz
  baseCoherence: number;      // 0.2 - 1.0
  emotionalState: string;     // 'Content', 'Excited', 'Anxious', etc.
  currentFrequency?: number;  // Optional, defaults to baseFrequency
  emotionalCoherence?: number; // Optional, defaults to baseCoherence
  lastUpdate?: number;        // Optional, defaults to Date.now()
}
```

### Behavioral State (Output from WASM)

```typescript
interface BehavioralState {
  energy: string;         // 'Low', 'Moderate', 'High'
  focus: string;          // 'Scattered', 'Balanced', 'Focused'
  mood: string;           // 'Depressed', 'Content', 'Optimistic', 'Excited'
  socialDrive: number;    // 0-1
  riskTolerance: number;  // 0-1
  ambition: number;       // 0-1
  cachedTimestamp: number; // Timestamp of calculation
}
```

### Performance Stats

```typescript
interface PerformanceStats {
  wasmCalls: number;         // Number of WASM operations
  fallbackCalls: number;     // Number of fallback operations
  totalTime: number;         // Total computation time (ms)
  averageTime: number;       // Average operation time (ms)
  wasmEnabled: boolean;      // Whether WASM is active
  module: string;            // 'WASM' or 'JavaScript'
}
```

## Error Handling

### Error Handling Strategy

1. **Initialization Errors**
   - Log warning if WASM fails to load
   - Continue with JavaScript fallback
   - Set `wasmEnabled: false` in status

2. **Calculation Errors**
   - Catch exceptions from WASM calls
   - Increment `fallbackCalls` counter
   - Use JavaScript implementation
   - Log error for debugging

3. **Invalid Input Errors**
   - Validate consciousness parameters
   - Apply defaults for missing values
   - Log validation warnings

4. **Memory Errors**
   - Monitor WASM memory usage
   - Implement chunking for large batches
   - Graceful degradation to smaller batches

### Error Recovery Flow

```
WASM Operation
      ↓
  Try WASM
      ↓
   Success? ──Yes──→ Return Result
      │
     No
      ↓
  Log Error
      ↓
Increment Fallback Counter
      ↓
Use JavaScript Implementation
      ↓
  Return Result
```

## Testing Strategy

### Unit Tests

1. **ConsciousnessEngineWasm Tests**
   - Initialization success/failure
   - Single character calculations
   - Batch processing
   - Fallback behavior
   - Performance stats tracking

2. **BehavioralStateService Tests**
   - WASM integration
   - JavaScript fallback
   - Result consistency (WASM vs JS)
   - Error handling

3. **LODManager Tests**
   - Batch processing with WASM
   - Fallback to standard processing
   - Performance improvements
   - Result mapping correctness

### Integration Tests

1. **End-to-End Turn Processing**
   - Initialize with WASM
   - Process turn with 100+ characters
   - Verify WASM was used
   - Check performance improvements

2. **Fallback Scenarios**
   - Disable WASM
   - Verify simulation still works
   - Check JavaScript fallback used
   - Validate identical results

3. **Performance Benchmarks**
   - Single character: <0.003ms (WASM) vs ~0.015ms (JS)
   - 100 characters batch: <0.15ms (WASM) vs ~1.5ms (JS)
   - 1000 characters: <1.5ms (WASM) vs ~15ms (JS)

### Test Files

```
sim-engine/src/domain/services/
├── ConsciousnessEngineWasm.test.js
├── BehavioralStateService.test.js (update existing)
└── LODManager.test.js (update existing)

sim-engine/test/integration/
├── wasm-integration.test.js (new)
├── wasm-fallback.test.js (new)
└── wasm-performance.test.js (new)
```

## Performance Considerations

### Optimization Strategies

1. **Batch Processing**
   - Use WASM batch methods for 10+ characters
   - Chunk large batches (>1000) into smaller groups
   - Pre-allocate result arrays

2. **Caching**
   - Cache WASM module after initialization
   - Reuse consciousness engine instance
   - Cache behavioral states when appropriate

3. **Memory Management**
   - Monitor WASM memory usage
   - Implement object pooling for frequent allocations
   - Clean up temporary data structures

4. **Lazy Loading**
   - Load WASM asynchronously at startup
   - Don't block application initialization
   - Provide immediate feedback on WASM status

### Performance Targets

| Scenario | JavaScript | WASM | Target Improvement |
|----------|-----------|------|-------------------|
| Single character | ~0.015ms | ~0.003ms | 5x faster |
| 100 characters (batch) | ~1.5ms | ~0.15ms | 10x faster |
| 1000 characters | ~15ms | ~1.5ms | 10x faster |
| Throughput | 67K/sec | 670K/sec | 10x higher |

## Migration Path

### Phase 1: Package Setup and Installation (Day 1)
- Build WASM package (`npm run build` in rust-wasm/consciousness-engine)
- Install package in sim-engine (npm link or npm install)
- Verify package imports correctly
- Create initialization in SimulationContext
- Add basic tests

### Phase 2: Service Integration (Day 2)
- Update BehavioralStateService
- Update LODManager
- Add fallback mechanisms
- Update existing tests

### Phase 3: Testing & Validation (Day 3)
- Run integration tests
- Performance benchmarks
- Verify backward compatibility
- Test with existing save files

### Phase 4: Documentation & Deployment (Day 4)
- Update API documentation
- Add performance monitoring
- Create migration guide
- Deploy to production

## Backward Compatibility

### Compatibility Guarantees

1. **API Compatibility**
   - No changes to public service APIs
   - Same method signatures
   - Identical return types

2. **Data Compatibility**
   - Same consciousness data format
   - Same behavioral state structure
   - No save file format changes

3. **Behavioral Compatibility**
   - WASM produces identical results to JavaScript
   - Deterministic calculations
   - Same random seed behavior

### Compatibility Testing

```javascript
// Test WASM vs JavaScript consistency
describe('WASM Compatibility', () => {
  it('should produce identical results to JavaScript', () => {
    const consciousnessState = {
      baseFrequency: 7.5,
      baseCoherence: 0.7,
      emotionalState: 'Content'
    };
    
    // Calculate with WASM
    const wasmResult = wasmEngine.calculateBehavioralState(consciousnessState);
    
    // Calculate with JavaScript
    const jsResult = jsImplementation.calculateBehavioralState(consciousnessState);
    
    // Results should be identical
    expect(wasmResult).toEqual(jsResult);
  });
});
```

## NPM Package Workflow

### Development Workflow

1. **Initial Setup**
   ```bash
   # Build WASM package
   cd rust-wasm/consciousness-engine
   npm run build
   
   # Link for local development
   npm link
   
   # In sim-engine, link the package
   cd ../../sim-engine
   npm link @world-history-sim/consciousness-engine-wasm
   ```

2. **Making Changes to WASM**
   ```bash
   # In rust-wasm/consciousness-engine
   # Make changes to Rust code
   npm run build  # Rebuild
   # Changes automatically available in sim-engine via link
   ```

3. **Testing Integration**
   ```bash
   # In sim-engine
   npm test  # Run tests with linked WASM package
   ```

### Production Workflow

1. **Publishing to npm** (when ready)
   ```bash
   cd rust-wasm/consciousness-engine
   npm version patch  # or minor/major
   npm publish
   ```

2. **Installing in Production**
   ```bash
   cd sim-engine
   npm install @world-history-sim/consciousness-engine-wasm@latest
   ```

### Alternative: Local File Reference

For teams not ready to publish to npm:

```json
// In sim-engine/package.json
{
  "dependencies": {
    "@world-history-sim/consciousness-engine-wasm": "file:../rust-wasm/consciousness-engine"
  }
}
```

Then:
```bash
cd sim-engine
npm install
```

## Deployment Considerations

### Build Process

1. **WASM Binary**
   - Built from Rust source using `wasm-pack`
   - Verify binary size (~389 KB)
   - Include in npm package via `files` field

2. **Package Distribution**
   - Published to npm registry
   - Or installed via npm link (development)
   - Or installed via file reference (monorepo)

3. **Web Server Configuration**
   - Modern bundlers (webpack, vite) handle `.wasm` files automatically
   - Serve `.wasm` files with `application/wasm` MIME type
   - Enable gzip compression for WASM files
   - Configure CORS if needed

4. **Browser Compatibility**
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

### Monitoring

1. **Performance Metrics**
   - Track WASM vs JavaScript usage
   - Monitor average calculation times
   - Alert on performance degradation

2. **Error Tracking**
   - Log WASM initialization failures
   - Track fallback frequency
   - Monitor calculation errors

3. **Usage Analytics**
   - Percentage of users with WASM enabled
   - Performance improvements achieved
   - Fallback usage patterns

## Conclusion

This design provides a comprehensive integration of the WASM consciousness engine into the simulation while maintaining full backward compatibility. The automatic fallback mechanism ensures the simulation remains functional even when WASM is unavailable, while the performance improvements (2-10x) significantly enhance the user experience for large-scale simulations.

The integration follows clean architecture principles, with clear separation between the WASM layer and domain services, making it easy to maintain and extend in the future.
