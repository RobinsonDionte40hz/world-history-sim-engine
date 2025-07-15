# System Refactoring Design Document

## Overview

This design document outlines the refactoring of six core systems (AlignmentSystem, InfluenceSystem, PrerequisiteSystem, PrestigeSystem, PersonalitySystem, and RaceSystem) from their current interaction manager implementation to a clean architecture approach optimized for historical world simulation.

The refactoring will transform these systems from their current mixed architectural placement into properly layered components that follow domain-driven design principles, support temporal evolution, and integrate seamlessly with the Character entity for emergent historical storytelling.

## Architecture

### Current State Analysis

The existing systems are currently placed inconsistently across architectural layers:
- **Entities Layer**: AlignmentManager, InfluenceManager, PrestigeManager, PrerequisiteSystem (should be services/value objects)
- **Value Objects Layer**: PersonalitySystem, RaceSystem (correctly placed but need enhancement)
- **Services Layer**: PrerequisiteValidator (correctly placed)

### Target Architecture

Following clean architecture principles, the systems will be reorganized as follows:

```
domain/
├── entities/
│   └── Character.js (enhanced integration)
├── services/
│   ├── AlignmentService.js (manages alignment evolution)
│   ├── InfluenceService.js (manages influence tracking)
│   ├── PrestigeService.js (manages reputation systems)
│   └── PrerequisiteValidator.js (enhanced validation)
├── value-objects/
│   ├── Alignment.js (immutable alignment state)
│   ├── Influence.js (immutable influence state)
│   ├── Prestige.js (immutable prestige state)
│   ├── PersonalityProfile.js (enhanced personality)
│   └── RacialTraits.js (enhanced racial system)
```

### Architectural Principles

1. **Domain Services**: Handle complex business logic that doesn't belong to a single entity
2. **Value Objects**: Represent immutable concepts with no identity
3. **Entity Integration**: Character entity composes services and value objects appropriately
4. **Temporal Evolution**: All systems support state changes over time
5. **Serialization**: Complete state persistence and restoration

## Components and Interfaces

### Value Objects

#### Alignment Value Object
```typescript
interface AlignmentState {
  readonly axes: ReadonlyMap<string, AlignmentAxis>;
  readonly values: ReadonlyMap<string, number>;
  readonly history: ReadonlyArray<AlignmentChange>;
}

class Alignment {
  constructor(axes: AlignmentAxis[], values?: Map<string, number>);
  getValue(axisId: string): number;
  getZone(axisId: string): AlignmentZone | null;
  withChange(axisId: string, amount: number, reason: string): Alignment;
  toJSON(): SerializedAlignment;
  static fromJSON(data: SerializedAlignment): Alignment;
}
```

#### Influence Value Object
```typescript
interface InfluenceState {
  readonly domains: ReadonlyMap<string, InfluenceDomain>;
  readonly values: ReadonlyMap<string, number>;
  readonly history: ReadonlyArray<InfluenceChange>;
}

class Influence {
  constructor(domains: InfluenceDomain[], values?: Map<string, number>);
  getValue(domainId: string): number;
  getTier(domainId: string): InfluenceTier | null;
  withChange(domainId: string, amount: number, reason: string): Influence;
  toJSON(): SerializedInfluence;
  static fromJSON(data: SerializedInfluence): Influence;
}
```

#### Prestige Value Object
```typescript
interface PrestigeState {
  readonly tracks: ReadonlyMap<string, PrestigeTrack>;
  readonly values: ReadonlyMap<string, number>;
  readonly history: ReadonlyArray<PrestigeChange>;
}

class Prestige {
  constructor(tracks: PrestigeTrack[], values?: Map<string, number>);
  getValue(trackId: string): number;
  getLevel(trackId: string): PrestigeLevel | null;
  withChange(trackId: string, amount: number, reason: string): Prestige;
  withDecay(decayRates: Map<string, number>): Prestige;
  toJSON(): SerializedPrestige;
  static fromJSON(data: SerializedPrestige): Prestige;
}
```

#### PersonalityProfile Value Object
```typescript
interface PersonalityState {
  readonly traits: ReadonlyMap<string, PersonalityTrait>;
  readonly attributes: ReadonlyMap<string, Attribute>;
  readonly emotionalTendencies: ReadonlyMap<string, EmotionalTendency>;
  readonly cognitiveTraits: ReadonlyMap<string, CognitiveTrait>;
}

class PersonalityProfile {
  constructor(config: PersonalityConfig);
  getTrait(id: string): PersonalityTrait | null;
  getAttribute(id: string): Attribute | null;
  withTraitEvolution(changes: Map<string, number>): PersonalityProfile;
  withAgeModifiers(age: number): PersonalityProfile;
  toJSON(): SerializedPersonality;
  static fromJSON(data: SerializedPersonality): PersonalityProfile;
}
```

#### RacialTraits Value Object
```typescript
interface RacialState {
  readonly race: Race;
  readonly subrace: Subrace | null;
  readonly modifiers: RacialModifiers;
  readonly features: ReadonlyArray<RacialFeature>;
}

class RacialTraits {
  constructor(raceId: string, subraceId?: string);
  getAttributeModifiers(): Map<string, number>;
  getSkillModifiers(): Map<string, number>;
  getLifespan(): LifespanInfo;
  getFeatures(): RacialFeature[];
  toJSON(): SerializedRacialTraits;
  static fromJSON(data: SerializedRacialTraits): RacialTraits;
}
```

### Domain Services

#### AlignmentService
```typescript
class AlignmentService {
  static evolveAlignment(
    current: Alignment,
    historicalEvent: HistoricalEvent,
    character: Character
  ): Alignment;
  
  static applyMoralChoice(
    current: Alignment,
    choice: MoralChoice,
    context: HistoricalContext
  ): Alignment;
  
  static calculateAlignmentShift(
    personality: PersonalityProfile,
    action: CharacterAction
  ): Map<string, number>;
}
```

#### InfluenceService
```typescript
class InfluenceService {
  static updateInfluence(
    current: Influence,
    settlement: Settlement,
    action: CharacterAction
  ): Influence;
  
  static calculateInfluenceDecay(
    current: Influence,
    timeElapsed: number
  ): Influence;
  
  static applySettlementEvents(
    current: Influence,
    events: SettlementEvent[]
  ): Influence;
}
```

#### PrestigeService
```typescript
class PrestigeService {
  static updatePrestige(
    current: Prestige,
    achievement: Achievement,
    context: SocialContext
  ): Prestige;
  
  static applyTimeDecay(
    current: Prestige,
    timeElapsed: number,
    decayRates: Map<string, number>
  ): Prestige;
  
  static calculateSocialStanding(
    prestige: Prestige,
    settlement: Settlement
  ): SocialStanding;
}
```

#### Enhanced PrerequisiteValidator
```typescript
class PrerequisiteValidator {
  static validatePrerequisites(
    interaction: Interaction,
    character: Character
  ): ValidationResult;
  
  static validateHistoricalEvent(
    event: HistoricalEvent,
    worldState: WorldState
  ): ValidationResult;
  
  static validateCharacterAction(
    action: CharacterAction,
    character: Character,
    context: ActionContext
  ): ValidationResult;
}
```

## Data Models

### Core Data Structures

#### Alignment Models
```typescript
interface AlignmentAxis {
  id: string;
  name: string;
  description: string;
  min: number;
  max: number;
  defaultValue: number;
  zones: AlignmentZone[];
}

interface AlignmentZone {
  name: string;
  min: number;
  max: number;
  description: string;
  effects: ZoneEffect[];
}

interface AlignmentChange {
  timestamp: Date;
  axisId: string;
  change: number;
  newValue: number;
  reason: string;
  historicalContext?: HistoricalContext;
}
```

#### Influence Models
```typescript
interface InfluenceDomain {
  id: string;
  name: string;
  description: string;
  settlementType: string[];
  tiers: InfluenceTier[];
}

interface InfluenceTier {
  name: string;
  minValue: number;
  maxValue: number;
  benefits: string[];
  responsibilities: string[];
}

interface InfluenceChange {
  timestamp: Date;
  domainId: string;
  change: number;
  newValue: number;
  reason: string;
  settlementId?: string;
}
```

#### Prestige Models
```typescript
interface PrestigeTrack {
  id: string;
  name: string;
  description: string;
  category: string;
  decayRate: number;
  levels: PrestigeLevel[];
}

interface PrestigeLevel {
  name: string;
  minValue: number;
  maxValue: number;
  socialBenefits: string[];
  politicalPower: number;
}

interface PrestigeChange {
  timestamp: Date;
  trackId: string;
  change: number;
  newValue: number;
  reason: string;
  witnessCount?: number;
}
```

### Historical Context Integration

#### Temporal Evolution Models
```typescript
interface HistoricalContext {
  era: string;
  year: number;
  season: string;
  culturalValues: Map<string, number>;
  politicalClimate: string;
  economicConditions: string;
}

interface CharacterEvolution {
  characterId: string;
  timespan: number;
  alignmentChanges: AlignmentChange[];
  influenceChanges: InfluenceChange[];
  prestigeChanges: PrestigeChange[];
  personalityEvolution: PersonalityEvolution;
}

interface PersonalityEvolution {
  traitChanges: Map<string, number>;
  newTraits: PersonalityTrait[];
  ageModifiers: Map<string, number>;
  experienceInfluences: ExperienceInfluence[];
}
```

## Error Handling

### Validation Strategy

1. **Input Validation**: All system inputs validated at service boundaries
2. **State Consistency**: Value objects ensure internal consistency
3. **Temporal Validation**: Historical changes validated for logical consistency
4. **Serialization Safety**: Robust error handling for persistence operations

### Error Types

```typescript
class SystemValidationError extends Error {
  constructor(system: string, field: string, value: any, constraint: string);
}

class TemporalConsistencyError extends Error {
  constructor(timestamp: Date, conflictingChange: string);
}

class SerializationError extends Error {
  constructor(system: string, operation: 'serialize' | 'deserialize', cause: Error);
}
```

### Error Recovery

- **Graceful Degradation**: Systems continue operating with default values when non-critical errors occur
- **State Rollback**: Ability to revert to previous valid state on critical errors
- **Logging**: Comprehensive error logging for debugging and monitoring

## Testing Strategy

### Unit Testing Approach

1. **Value Object Testing**
   - Immutability verification
   - Serialization round-trip testing
   - Business rule validation
   - Edge case handling

2. **Service Testing**
   - Business logic validation
   - Integration with value objects
   - Temporal evolution scenarios
   - Error condition handling

3. **Integration Testing**
   - Character entity integration
   - Cross-system interactions
   - Historical event processing
   - Persistence operations

### Test Data Strategy

- **Historical Scenarios**: Test data based on realistic historical contexts
- **Character Archetypes**: Predefined character types for consistent testing
- **Temporal Sequences**: Multi-step scenarios testing evolution over time
- **Edge Cases**: Boundary conditions and error scenarios

### Performance Testing

- **Serialization Performance**: Large character datasets
- **Memory Usage**: Long-running simulations
- **Temporal Processing**: Bulk historical event processing
- **Concurrent Access**: Multiple character updates

## Migration Strategy

### Phase 1: Value Object Creation
1. Create new immutable value objects
2. Implement serialization methods
3. Add comprehensive unit tests
4. Validate against existing data

### Phase 2: Service Layer Refactoring
1. Extract business logic into domain services
2. Update service methods to use value objects
3. Implement temporal evolution logic
4. Add integration tests

### Phase 3: Character Integration
1. Update Character entity to use new systems
2. Implement proper composition patterns
3. Update serialization methods
4. Test end-to-end scenarios

### Phase 4: Legacy System Removal
1. Update all references to new systems
2. Remove old manager classes
3. Clean up unused imports
4. Verify no breaking changes

### Data Migration

- **Backward Compatibility**: New systems can read old serialized data
- **Migration Scripts**: Automated conversion of existing character data
- **Validation**: Verify data integrity after migration
- **Rollback Plan**: Ability to revert to old system if needed