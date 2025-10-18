# AI Agent Onboarding Guide
## World History Simulation Engine

**Last Updated**: October 18, 2025  
**Project Status**: ES6 Module Conversion Branch  
**Version**: 2.0 (with WASM acceleration)

---

## 🎯 Quick Start (5 Minutes)

### What This Is

A **turn-based, mapless** historical simulation engine with:
- **Turn-Based**: Users manually advance time (no real-time pressure)
- **Mapless**: Abstract nodes instead of spatial coordinates
- **Free Building**: Start with any component, build in any order
- **Template System**: Save and reuse everything
- **Consciousness-Driven NPCs**: Quantum-inspired behavioral modeling with WASM acceleration

### Three Core Truths

1. **NO PRESCRIBED ORDER**: Users can build worlds in any sequence they want
2. **NO MAP COORDINATES**: Nodes are conceptual contexts, not spatial locations  
3. **NO AUTOMATIC TIME**: Simulation only advances when user calls `processTurn()`

### Project Structure

```
world-history-sim-engine/
├── sim-engine/                    # Main React app (JavaScript/ES6)
│   ├── src/
│   │   ├── domain/                # Pure business logic (innermost layer)
│   │   ├── application/           # Use cases and orchestration
│   │   ├── infrastructure/        # Persistence and external APIs
│   │   └── presentation/          # React UI components
│   └── package.json
│
└── rust-wasm/                     # High-performance WASM modules
    └── consciousness-engine/      # Consciousness calculations (2-10x faster)
        ├── src/                   # Rust source code
        ├── pkg/                   # Compiled WASM package (389 KB)
        └── Cargo.toml
```

---

## 📖 Document Map

### Start Here
1. **This Document** - Quick onboarding and decision trees
2. **[system-prompt.md](./system-prompt.md)** - Communication patterns and core principles
3. **[product.md](./product.md)** - Vision, use cases, roadmap

### Architecture & Technical
4. **[structure.md](./structure.md)** - Clean Architecture layers and file organization
5. **[tech.md](./tech.md)** - Technology stack, dependencies, build tools
6. **[world-simulation.md](./world-simulation.md)** - Simulation mechanics and integration

### Domain-Specific
7. **[consciousness-refactor.md](./consciousness-refactor.md)** - Consciousness system (90% performance gain)
8. **[interaction-manager.md](./interaction-manager.md)** - Interaction system architecture
9. **[../copilot-instructions.md](../../.github/copilot-instructions.md)** - Comprehensive AI development guide

### External Docs (User-Facing)
- `sim-engine/docs/TextTemplatingGuide.md` - Dynamic text templating
- `rust-wasm/consciousness-engine/INTEGRATION.md` - WASM integration guide
- `README.md` - User quick start and testing guide

---

## 🧠 Critical Concepts (Must Understand)

### 1. Clean Architecture Layers

**Dependency Rule**: Dependencies ALWAYS point inward.

```
┌─────────────────────────────────────────┐
│        Presentation Layer               │  React UI, hooks, contexts
│  (presentation/)                        │
├─────────────────────────────────────────┤
│      Infrastructure Layer               │  LocalStorage, external APIs
│  (infrastructure/)                      │
├─────────────────────────────────────────┤
│       Application Layer                 │  Use cases, SimulationService
│  (application/)                         │
├─────────────────────────────────────────┤
│         Domain Layer                    │  Entities, value objects, services
│  (domain/)  ← PURE BUSINESS LOGIC       │  NO external dependencies
└─────────────────────────────────────────┘
```

**Never**:
- Import presentation code in domain layer
- Import infrastructure in domain layer
- Mix business logic with UI logic

**Always**:
- Keep domain entities pure (no React, no DB calls)
- Use dependency injection for services
- Test domain layer without external dependencies

### 2. Entity Types & Relationships

#### Character (The Core Entity)
```javascript
{
  id: string,
  name: string,
  lodTier: 'hero' | 'important' | 'background' | 'group',
  
  // Consciousness (quantum-inspired)
  consciousness: {
    baseFrequency: 7.5,        // 3-15 Hz (gamma baseline at 40Hz for deep thought)
    baseCoherence: 0.7,        // 0.2-1.0 (emotional synchronization)
    emotionalState: 'content', // Current emotion
    behavioralState: {         // CACHED state (regenerated on significant events)
      energy: 'moderate',
      focus: 'balanced',
      mood: 'content',
      socialDrive: 0.6,
      riskTolerance: 0.5,
      ambition: 0.7
    }
  },
  
  // D&D Attributes
  attributes: {
    strength: { score: 10, modifier: 0 },
    dexterity: { score: 14, modifier: 2 },
    // ... (6 total)
  },
  
  // Assignment System (capability-based)
  assignments: {
    nodes: Set(['market_square']),          // Where they can be
    interactions: Set(['trade', 'gossip']), // What they can DO
    settlements: Set(['ironhold']),         // Which settlements
    quests: Set(['find_artifact']),        // Active quests
    factions: Set(['merchants_guild'])     // Group memberships
  },
  
  // Memory & Relationships
  relationships: Map(),           // Enhanced relationship tracking
  decisionHistory: [],           // Past choices
  goals: []                      // Active objectives
}
```

#### Node (Abstract Location)
```javascript
{
  id: string,
  name: 'Market Square',
  type: 'marketplace',           // NOT a spatial type - conceptual
  
  // Context, NOT coordinates
  environmentalProperties: {
    crowded: true,
    noisy: true,
    prosperous: true
  },
  
  resourceAvailability: {
    goods: 'abundant',
    information: 'flowing'
  },
  
  culturalContext: {
    language: 'common',
    customs: 'mercantile',
    law: 'guild-enforced'
  },
  
  assignedCharacters: ['char1', 'char2']  // Characters assigned here
}
```

#### Interaction (Character Actions)
```javascript
{
  id: string,
  name: 'Negotiate Deal',
  type: 'social',
  
  // Prerequisites for availability
  requirements: {
    attributes: { charisma: 12 },
    nodeType: ['marketplace', 'tavern']
  },
  
  // Outcomes
  effects: {
    success: { gold: '+10', reputation: '+2' },
    failure: { reputation: '-1', mood: '-5' }
  }
}
```

### 3. Template System (Dual System)

#### Structural Templates
- Save entire components (characters, nodes, interactions)
- Managed by `TemplateManager.js`
- Stored in `LocalStorage`

```javascript
// Save as template
templateManager.saveAsTemplate({
  type: 'character',
  name: 'Merchant Archetype',
  data: characterConfig
});

// Instantiate with overrides
const character = templateManager.instantiateTemplate(
  'character',
  'merchant_archetype_id',
  { name: 'Elena' }
);
```

#### Text Templating (Editor Integration)
- Dynamic content generation
- Built into `InteractionEditor` and `EncounterEditor`
- Real-time preview and suggestions

```javascript
// In dialogue text
"Welcome to {{node.name}}, {{character.name}}!"

// Conditionals
"{{#if character.reputation > 10}}Greetings, honored guest!{{/if}}"

// Random selection
"{{random:Hello,Greetings,Welcome}}, traveler!"
```

### 4. LOD (Level of Detail) System

Performance optimization for large populations:

```javascript
// LOD Tiers
hero:        Full consciousness simulation, individual processing
important:   Simplified consciousness, individual processing  
background:  Cached behavioral states, group representation
group:       Statistical modeling via PopulationGroup entity
```

**When to use**:
- **Hero**: 1-20 main characters (full simulation)
- **Important**: 20-100 supporting cast (simplified)
- **Background**: 100-500 minor NPCs (cached states)
- **Group**: 500+ population (statistical aggregates)

### 5. Turn Processing Flow

Each turn executes in phases:

```
1. Validation     → Check world state integrity
2. Character Actions → NPCs perform interactions (based on LOD tier)
3. Event Resolution → Process outcomes
4. State Updates   → Apply effects to world
5. History Recording → Log events with significance scores
6. Evolution      → Update consciousness, relationships, resources
7. Turn Summary   → Generate comprehensive report
```

**Critical**: Consciousness only updates on **significant events** (threshold: 0.3)

---

## 🛠️ Common Development Tasks

### Task: Adding a New Entity

**Decision Tree**:
```
Is this a business object with identity?
├─ YES → Create in `domain/entities/`
│   └─ Extends nothing, pure JavaScript class
│
└─ NO → Is it an immutable value?
    └─ YES → Create in `domain/value-objects/`
        └─ Extends `BaseValueObject` for validation
```

**Example** (new Settlement feature):
```javascript
// domain/entities/Settlement.js
export class Settlement {
  constructor(config) {
    this.id = config.id || generateId();
    this.name = config.name;
    this.population = config.population || 0;
    this.governance = new SettlementGovernance(config.governance);
    // ... entity logic
  }
  
  // Methods that modify state
  addBuilding(building) { /* ... */ }
}
```

### Task: Adding a New Service

**Decision Tree**:
```
Where does this logic belong?
├─ Pure business rules? → domain/services/
├─ Orchestrates multiple domain services? → application/services/
├─ Talks to external systems? → infrastructure/
└─ UI-specific logic? → presentation/hooks/ or presentation/contexts/
```

**Example** (domain service):
```javascript
// domain/services/TradeService.js
import { BaseDomainService } from './BaseDomainService.js';

export class TradeService extends BaseDomainService {
  constructor() {
    super('TradeService');
  }
  
  // Pure business logic - no side effects
  calculateTradeValue(item, seller, buyer) {
    const baseValue = item.value;
    const sellerModifier = this._getSellerModifier(seller);
    const buyerModifier = this._getBuyerModifier(buyer);
    return baseValue * sellerModifier * buyerModifier;
  }
}
```

### Task: Modifying Consciousness Behavior

**IMPORTANT**: Consciousness system was refactored for performance (90% improvement).

**Key Files**:
- `domain/services/BehavioralStateService.js` - Behavioral state generation
- `domain/services/ConsciousnessUpdateService.js` - Event-driven updates
- `domain/services/SignificantMemoryService.js` - Memory filtering
- `rust-wasm/consciousness-engine/` - WASM acceleration (optional)

**Pattern**:
```javascript
// DON'T recalculate every turn
const behavioral = this.calculateBehavioralState(character); // ❌ Old way

// DO cache and update only on significant events
if (event.significance >= 0.3) {
  ConsciousnessUpdateService.processEvent(character, event);
  character.consciousness.behavioralState = 
    BehavioralStateService.generateBehavioralState(character);
}
```

### Task: Adding a New UI Component

**Decision Tree**:
```
What type of component?
├─ Reusable UI element? → presentation/components/
├─ Page/route? → presentation/pages/
├─ Custom hook? → presentation/hooks/
└─ Global state? → presentation/contexts/
```

**Example** (component with simulation context):
```javascript
// presentation/components/CharacterCard.js
import React from 'react';
import { useSimulation } from '../hooks/useSimulation';

export function CharacterCard({ characterId }) {
  const { getCharacter, updateCharacter } = useSimulation();
  const character = getCharacter(characterId);
  
  return (
    <div className="character-card">
      <h3>{character.name}</h3>
      {/* ... component JSX */}
    </div>
  );
}
```

---

## 🧪 Testing Strategy

### Test File Locations

```
sim-engine/
├── src/
│   ├── domain/
│   │   └── **/*.test.js           # Unit tests alongside code
│   └── test/
│       └── integration/            # Integration tests
│
├── run-turn-based-tests.js        # ⭐ PRIMARY test suite
├── validate-fixes.js               # Quick validation
├── test-*.js                       # Specialized test runners
└── debug-*.js                      # Debug utilities
```

### Running Tests

```bash
# Navigate to sim-engine directory first
cd sim-engine

# ⭐ RECOMMENDED: Turn-based functionality validation
node run-turn-based-tests.js

# Run all Jest tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern=SimulationService

# Run specific test by name
npm test -- --testNamePattern="should process turn"

# Integration tests (complex workflows)
npm test -- --testPathPattern=integration

# Performance tests
npm test -- --testPathPattern=npc-scalability
```

### Debug Utilities

```bash
# Character system debugging
node debug-character-creation.js

# Economic system validation
node debug-investment-effects.js

# Turn processing analysis
node debug-turn-processing.js

# LOD system validation
node simple-lod-validation.js
```

### Writing Tests

**Unit Test Pattern**:
```javascript
// domain/services/TradeService.test.js
import { TradeService } from './TradeService.js';

describe('TradeService', () => {
  let service;
  
  beforeEach(() => {
    service = new TradeService();
  });
  
  test('should calculate trade value with modifiers', () => {
    const item = { value: 100 };
    const seller = { charisma: 15 };
    const buyer = { charisma: 10 };
    
    const result = service.calculateTradeValue(item, seller, buyer);
    
    expect(result).toBeGreaterThan(100);
  });
});
```

**Integration Test Pattern**:
```javascript
// test/integration/turn-processing.test.js
describe('Turn Processing Integration', () => {
  it('should process complete turn with all systems', async () => {
    // Arrange: Create world with all components
    const world = createTestWorld();
    const simulationService = new SimulationService(world);
    
    // Act: Process turn
    const result = await simulationService.processTurn();
    
    // Assert: Verify all systems updated correctly
    expect(result.success).toBe(true);
    expect(result.turnSummary.events).toHaveLength(greaterThan(0));
    expect(result.worldState.currentTurn).toBe(1);
  });
});
```

---

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Breaking Clean Architecture

**❌ Wrong**:
```javascript
// domain/entities/Character.js
import { saveToLocalStorage } from '../../infrastructure/LocalStorage.js';

class Character {
  save() {
    saveToLocalStorage(this); // Domain depends on infrastructure!
  }
}
```

**✅ Correct**:
```javascript
// application/services/CharacterService.js
export class CharacterService {
  constructor(repository) {  // Inject repository
    this.repository = repository;
  }
  
  saveCharacter(character) {
    return this.repository.save(character); // Application orchestrates
  }
}
```

### Pitfall 2: Assuming Map Coordinates

**❌ Wrong**:
```javascript
// Treating nodes as spatial locations
const distance = Math.sqrt(
  Math.pow(node1.x - node2.x, 2) + 
  Math.pow(node1.y - node2.y, 2)
);
```

**✅ Correct**:
```javascript
// Nodes are abstract contexts
const connection = {
  from: node1.id,
  to: node2.id,
  type: 'trade_route',
  strength: 0.8
};
```

### Pitfall 3: Real-Time Assumptions

**❌ Wrong**:
```javascript
// Expecting automatic time progression
setInterval(() => {
  simulationService.processTurn(); // User controls this!
}, 1000);
```

**✅ Correct**:
```javascript
// User-initiated turn processing
function onAdvanceTurnClick() {
  if (simulationService.canProcessTurn()) {
    const result = simulationService.processTurn();
    displayTurnSummary(result);
  }
}
```

### Pitfall 4: Ignoring LOD Tiers

**❌ Wrong**:
```javascript
// Processing all characters the same way
characters.forEach(char => {
  runFullConsciousnessSimulation(char); // Expensive for 1000+ NPCs!
});
```

**✅ Correct**:
```javascript
// Respect LOD tiers
characters.forEach(char => {
  switch(char.lodTier) {
    case 'hero':
      runFullConsciousnessSimulation(char);
      break;
    case 'group':
      processAsPopulationGroup(char);
      break;
    default:
      useCachedBehavioralState(char);
  }
});
```

### Pitfall 5: Forgetting Significance Thresholds

**❌ Wrong**:
```javascript
// Updating consciousness on every tiny event
character.updateConsciousness(event); // Performance killer!
```

**✅ Correct**:
```javascript
// Only update on significant events
const significance = EventSignificanceService.calculate(event);
if (significance >= 0.3) {
  ConsciousnessUpdateService.processEvent(character, event);
}
```

---

## 🔧 WASM Integration

### When to Use WASM

Use WASM consciousness engine when:
- Processing 100+ characters per turn
- LOD system with population groups
- Performance is critical
- Users have modern browsers

**Performance Gains**:
- Single character: **5x faster** (0.015ms → 0.003ms)
- Batch 100 characters: **10x faster** (1.5ms → 0.15ms)
- Throughput: **670K calculations/sec** vs 67K/sec

### Integration Points

**Key Files**:
- `rust-wasm/consciousness-engine/pkg/` - Compiled WASM package (389 KB)
- `rust-wasm/consciousness-engine/src/wrapper/ConsciousnessEngineWasm.js` - JS API wrapper
- `domain/services/BehavioralStateService.js` - Replace calculations here

**Basic Integration**:
```javascript
// 1. Import wrapper
import { ConsciousnessEngineWasm } from './ConsciousnessEngineWasm.js';

// 2. Initialize at startup
const wasmEngine = new ConsciousnessEngineWasm();
await wasmEngine.initialize(); // Gracefully falls back to JS if fails

// 3. Use in services
const behavioral = wasmEngine.calculateBehavioralState({
  baseFrequency: 7.5,
  baseCoherence: 0.7,
  emotionalState: 'Content'
});

// 4. Batch processing for LOD groups
const behaviors = wasmEngine.calculateBatchBehavioralStates(
  populationGroup.consciousnessStates
);
```

**Full Guide**: See `rust-wasm/consciousness-engine/INTEGRATION.md`

---

## 📊 Performance Guidelines

### Optimization Checklist

- [ ] Use LOD tiers appropriately (hero < 20, important < 100, background < 500, group > 500)
- [ ] Cache behavioral states (regenerate only on significant events)
- [ ] Batch process population groups
- [ ] Use WASM for large-scale simulations (100+ NPCs)
- [ ] Limit memory storage (50 memories max per character)
- [ ] Prune old historical events (keep last 20 per character)
- [ ] Consider React.memo for large lists
- [ ] Use checkpoint system for state recovery

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Turn processing (100 NPCs) | < 100ms | ✅ ~80ms |
| Consciousness update | < 1ms | ✅ ~0.3ms |
| Memory operations | < 0.5ms | ✅ ~0.2ms |
| UI render (1000 items) | < 16ms | ⚠️  ~25ms (optimize with virtualization) |

---

## 🎯 Decision Trees

### "Where Should This Code Go?"

```
What type of code?
│
├─ Business logic that doesn't change based on UI/DB?
│  └─ domain/services/ or domain/entities/
│
├─ Coordinates multiple domain services?
│  └─ application/services/
│
├─ Talks to browser APIs or external services?
│  └─ infrastructure/
│
├─ React component, hook, or context?
│  └─ presentation/
│
└─ Utility function used everywhere?
   └─ shared/utils/
```

### "How Should I Test This?"

```
What are you testing?
│
├─ Pure function or domain entity?
│  └─ Unit test alongside the file (*.test.js)
│
├─ Multiple services working together?
│  └─ Integration test in test/integration/
│
├─ React component?
│  └─ Component test with @testing-library/react
│
├─ Complete turn processing workflow?
│  └─ run-turn-based-tests.js or integration test
│
└─ Debugging a specific issue?
   └─ debug-*.js script for isolated testing
```

### "Is This a Breaking Change?"

```
Will this change...
│
├─ Domain entity structure that's persisted?
│  └─ YES → Need migration service
│
├─ Public API that users call?
│  └─ YES → Add deprecation warning, maintain compatibility
│
├─ Internal service implementation?
│  └─ NO → Safe to change (if tests pass)
│
└─ UI component props?
   └─ MAYBE → Check all usages first
```

---

## 🔑 Key Service Reference

### Core Services (Use These Often)

**World Building**:
- `WorldBuilder` (domain/services/) - World construction and preparation
- `AssignmentManager` (domain/services/) - Character/node/interaction assignments
- `WorldValidator` (domain/services/) - Validation logic and requirements

**Simulation**:
- `SimulationService` (application/services/) - Turn-based simulation engine
- `TurnManager` (domain/services/) - Turn processing coordination
- `HistoryGenerator` (domain/services/) - Historical event creation

**Consciousness**:
- `BehavioralStateService` (domain/services/) - Behavioral state generation
- `ConsciousnessUpdateService` (domain/services/) - Event-driven consciousness updates
- `SignificantMemoryService` (domain/services/) - Memory storage and retrieval
- `ConsciousnessCheckpointService` (domain/services/) - State persistence

**Character & AI**:
- `MemoryService` (domain/services/) - Character memory and relationships
- `PersonalityProfile` (domain/value-objects/) - Personality system
- `GenerateBehavior` (application/use-cases/) - NPC autonomous behavior

**Performance**:
- `LODManager` (domain/services/) - Level of detail processing
- `PopulationGroupService` (domain/services/) - Group character management
- `BatchProcessingService` (domain/services/) - Batch operations

**Persistence**:
- `LocalStorageWorldRepository` (infrastructure/) - World state persistence
- `UnifiedPersistenceService` (infrastructure/) - Centralized persistence

### Service Instantiation Patterns

**Singleton Pattern** (Application Services):
```javascript
// application/services/SimulationService.js
class SimulationService {
  constructor(worldBuilder, historyGenerator, turnManager, repository) {
    this.worldBuilder = worldBuilder;
    this.historyGenerator = historyGenerator;
    // ... dependencies injected
  }
}

// In SimulationContext
const simulationService = useMemo(() => 
  new SimulationService(worldBuilder, historyGenerator, turnManager, repository),
  []
);
```

**Static Methods** (Domain Services):
```javascript
// domain/services/BehavioralStateService.js
export class BehavioralStateService {
  static generateBehavioralState(character) {
    // Pure function - no instance state
    return { energy, focus, mood, socialDrive, riskTolerance, ambition };
  }
}

// Usage
const behavioral = BehavioralStateService.generateBehavioralState(character);
```

---

## 🚀 Quick Reference: Code Snippets

### Create a Character

```javascript
import { Character } from './domain/entities/Character.js';

const character = new Character({
  name: 'Elena',
  age: 28,
  lodTier: 'hero',
  consciousness: {
    baseFrequency: 7.5,
    baseCoherence: 0.7
  },
  attributes: {
    strength: 10,
    dexterity: 14,
    constitution: 12,
    intelligence: 16,
    wisdom: 13,
    charisma: 15
  },
  personality: {
    aggression: 0.2,
    curiosity: 0.8,
    empathy: 0.6
  }
});
```

### Create a Node

```javascript
import { Node } from './domain/entities/Node.js';

const node = new Node({
  name: 'Market Square',
  type: 'marketplace',
  environmentalProperties: {
    crowded: true,
    noisy: true,
    prosperous: true
  },
  resourceAvailability: {
    food: 'abundant',
    goods: 'plentiful'
  },
  culturalContext: {
    language: 'common',
    customs: 'mercantile'
  }
});
```

### Assign Character to Node

```javascript
import { AssignmentManager } from './domain/services/AssignmentManager.js';

AssignmentManager.assignCharacterToNode(character, node);
AssignmentManager.assignInteractionToCharacter(interaction, character);

// Verify assignments
const canStart = AssignmentManager.validateAssignments(world);
console.log(canStart); // { valid: true, errors: [] }
```

### Process a Turn

```javascript
// In React component
const { simulationService } = useSimulation();

async function handleAdvanceTurn() {
  if (!simulationService.canProcessTurn()) {
    console.error('World not ready for simulation');
    return;
  }
  
  const result = await simulationService.processTurn();
  
  if (result.success) {
    console.log('Turn completed:', result.turnSummary);
    console.log('Events:', result.turnSummary.events);
  }
}
```

### Use WASM Engine

```javascript
import { consciousnessEngine } from './ConsciousnessEngineWasm.js';

// Initialize once at startup
await consciousnessEngine.initialize();

// Single character
const behavioral = consciousnessEngine.calculateBehavioralState({
  baseFrequency: character.consciousness.baseFrequency,
  baseCoherence: character.consciousness.baseCoherence,
  emotionalState: 'Content'
});

// Batch processing
const behaviors = consciousnessEngine.calculateBatchBehavioralStates(
  populationGroup.map(char => ({
    baseFrequency: char.consciousness.baseFrequency,
    baseCoherence: char.consciousness.baseCoherence,
    emotionalState: char.consciousness.emotionalState
  }))
);
```

---

## 📝 Cheat Sheet: Quick Answers

### "How do I add a new attribute to Character?"

1. Update `Character.js` constructor
2. Update serialization methods (`toJSON`, `fromJSON`)
3. Add migration in `ConsciousnessMigrationService.js` if persisted
4. Update TypeScript definitions if exists
5. Add tests for new attribute
6. Update documentation

### "How do I add a new interaction type?"

1. Define interaction in world builder
2. Add to interaction type constants
3. Implement resolution logic in `InteractionResolver.js`
4. Add effects in `InteractionExecutor.js`
5. Update UI in `InteractionEditor.js`
6. Add tests

### "How do I optimize turn processing?"

1. Profile with `debug-turn-processing.js`
2. Check LOD tier distribution
3. Enable WASM if not already
4. Review consciousness update frequency
5. Batch similar operations
6. Consider caching frequently accessed data

### "How do I debug consciousness issues?"

1. Run `debug-character-creation.js`
2. Check event significance thresholds
3. Verify behavioral state caching
4. Review memory pruning settings
5. Use `ConsciousnessInspectionService` for diagnostics
6. Check WASM fallback status

### "How do I add a new UI component?"

1. Create in `presentation/components/`
2. Use `useSimulation` hook for context
3. Follow existing component patterns
4. Add PropTypes or TypeScript definitions
5. Test with React Testing Library
6. Update Tailwind classes for dark mode

---

## 🎓 Learning Path

### Day 1: Understand the Core
1. Read this document (you're here!)
2. Review [system-prompt.md](./system-prompt.md)
3. Explore [structure.md](./structure.md)
4. Run `node run-turn-based-tests.js`

### Day 2: Explore the Domain
1. Read `domain/entities/Character.js`
2. Read `domain/services/BehavioralStateService.js`
3. Read [consciousness-refactor.md](./consciousness-refactor.md)
4. Run `debug-character-creation.js`

### Day 3: Understand Simulation
1. Read `application/services/SimulationService.js`
2. Read `domain/services/TurnManager.js`
3. Read [world-simulation.md](./world-simulation.md)
4. Run `debug-turn-processing.js`

### Day 4: Explore UI
1. Read `presentation/contexts/SimulationContext.js`
2. Read `presentation/hooks/useSimulation.js`
3. Explore components in `presentation/components/`
4. Run `npm start` and interact with UI

### Day 5: Advanced Topics
1. Review WASM integration in `rust-wasm/consciousness-engine/`
2. Read LOD system in `domain/services/LODManager.js`
3. Explore template system in `template/`
4. Read performance documentation

---

## 🆘 Getting Unstuck

### "I don't know where to start"
→ Run `node run-turn-based-tests.js` and read the test output. Tests are documentation.

### "Tests are failing after my changes"
→ Read error messages carefully. Check if you:
  - Broke clean architecture boundaries
  - Changed entity serialization without migration
  - Modified consciousness system without updating cache logic

### "Performance is slow"
→ Profile with debug utilities:
  - `debug-turn-processing.js` for turn processing
  - `npm test -- --testPathPattern=npc-scalability` for LOD
  - Check LOD tier distribution with `simple-lod-validation.js`

### "I need to understand a specific feature"
→ Search codebase:
  - `grep_search` for usage patterns
  - `semantic_search` for related concepts
  - Read integration tests in `test/integration/`

### "WASM isn't working"
→ Check:
  - WASM binary exists in `pkg/`
  - Wrapper initialized: `await consciousnessEngine.initialize()`
  - Fallback logging: should see console message
  - Browser supports WASM (all modern browsers do)

---

## 📚 Additional Resources

### Internal Documentation
- **Architecture Diagrams**: See [structure.md](./structure.md)
- **API Reference**: Code comments and JSDoc throughout codebase
- **Testing Guide**: [README.md](../../README.md) Testing section
- **Performance Guide**: `rust-wasm/consciousness-engine/PERFORMANCE_GUIDE.md`

### External References
- **Clean Architecture**: Robert C. Martin's "Clean Architecture"
- **Domain-Driven Design**: Eric Evans' "Domain-Driven Design"
- **React Patterns**: React documentation (hooks, contexts, memo)
- **WebAssembly**: MDN Web Docs on WebAssembly

### Community
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Pull Requests**: Contribute improvements

---

## ✅ Validation Checklist

Before committing code, verify:

- [ ] **Architecture**: No layer boundary violations
- [ ] **Tests**: All tests pass (`npm test` and `node run-turn-based-tests.js`)
- [ ] **Linting**: Code follows project style
- [ ] **Documentation**: Updated relevant docs
- [ ] **Performance**: No significant regressions (profile if needed)
- [ ] **Compatibility**: WASM fallback works
- [ ] **Serialization**: No breaking changes to persisted data (or migration added)
- [ ] **Turn-Based**: No automatic time progression introduced
- [ ] **Mapless**: No spatial coordinates added to nodes
- [ ] **Free Building**: No prescribed order enforced

---

## 🎯 Success Metrics

You're ready to contribute when you can:

1. ✅ Explain the three core truths (turn-based, mapless, free-building)
2. ✅ Navigate the clean architecture layers
3. ✅ Create a character, node, and interaction
4. ✅ Process a turn and read the summary
5. ✅ Run tests and understand failures
6. ✅ Add a new service without breaking architecture
7. ✅ Use the WASM engine for performance
8. ✅ Debug consciousness issues with tools

---

## 🚀 You're Ready!

You now have everything needed to understand and contribute to the World History Simulation Engine. Remember:

- **Turn-Based**: Users control time
- **Mapless**: Abstract contexts, not coordinates
- **Free Building**: Any order, complete freedom
- **Clean Architecture**: Strict layer separation
- **Performance**: WASM acceleration available

Refer back to this document whenever you need quick reference or decision guidance.

**Happy Building! 🎮🏰⚔️**

---

**Document Version**: 1.0  
**Last Updated**: October 18, 2025  
**Maintainer**: See [CONTRIBUTING.md](../../CONTRIBUTING.md)
