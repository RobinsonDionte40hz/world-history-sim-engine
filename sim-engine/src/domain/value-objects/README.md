# Value Object Foundations

This directory contains the base value object foundations for the World History Simulation Engine. These foundations provide a consistent, immutable, and serializable pattern for all value objects in the system.

## Overview

Value objects are immutable objects that represent concepts in the domain. They are characterized by:

- **Immutability**: Once created, they cannot be modified
- **Value Equality**: Two value objects are equal if their values are equal
- **No Identity**: They are identified by their values, not by reference
- **Serializable**: They can be converted to/from JSON for persistence

## Base Classes and Utilities

### BaseValueObject<T>

The abstract base class that all value objects should extend. It provides:

- Automatic immutability through deep freezing
- Validation helpers
- Serialization support
- Equality comparison
- Hash code generation

#### Usage Example

```typescript
import { BaseValueObject } from './BaseValueObject';
import { ValidationError } from '../../shared/types/ValueObjectTypes';

interface PersonData {
  id: string;
  name: string;
  age: number;
}

class Person extends BaseValueObject<PersonData> {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly age: number
  ) {
    super();
    this.validate();
    this.freeze(); // Must call freeze() after all properties are set
  }

  protected validate(): void {
    this.validateRequired('id', this.id);
    this.validateRequired('name', this.name);
    this.validateStringLength('id', this.id, 1, 50);
    this.validateStringLength('name', this.name, 1, 100);
    this.validateRange('age', this.age, 0, 150);
  }

  toJSON(): PersonData {
    return {
      id: this.id,
      name: this.name,
      age: this.age
    };
  }

  static fromJSON(data: PersonData): Person {
    return new Person(data.id, data.name, data.age);
  }

  // Immutable update methods
  withAge(newAge: number): Person {
    return new Person(this.id, this.name, newAge);
  }

  withName(newName: string): Person {
    return new Person(this.id, newName, this.age);
  }
}
```

### SerializationUtils

Utility class for handling serialization of complex data structures:

#### Map Serialization

```typescript
import { SerializationUtils } from '../../shared/types/ValueObjectTypes';

// Serialize a Map to JSON-compatible format
const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
const serialized = SerializationUtils.serializeMap(map);
// Result: [['key1', 'value1'], ['key2', 'value2']]

// Deserialize back to Map
const deserialized = SerializationUtils.deserializeMap(serialized);
// Result: Map { 'key1' => 'value1', 'key2' => 'value2' }
```

#### Set Serialization

```typescript
// Serialize a Set to JSON-compatible format
const set = new Set(['item1', 'item2', 'item3']);
const serialized = SerializationUtils.serializeSet(set);
// Result: ['item1', 'item2', 'item3']

// Deserialize back to Set
const deserialized = SerializationUtils.deserializeSet(serialized);
// Result: Set { 'item1', 'item2', 'item3' }
```

#### Deep Freeze

```typescript
// Deep freeze an object for immutability
const obj = { nested: { value: 'test' } };
const frozen = SerializationUtils.deepFreeze(obj);
// All nested objects are now frozen
```

## Validation Helpers

The BaseValueObject provides several validation helpers:

### validateRequired(field, value)
Ensures a field is not null or undefined.

### validateRange(field, value, min, max)
Validates that a numeric value is within a specified range.

### validateStringLength(field, value, minLength, maxLength?)
Validates string length constraints.

### validateArray(field, value, minLength?, maxLength?)
Validates array length constraints.

## Error Types

### ValidationError
Thrown when validation fails during value object construction.

### SerializationError
Thrown when serialization or deserialization fails.

### ValueObjectError
Base error type for all value object related errors.

## Best Practices

### 1. Always Call freeze()
```typescript
constructor(/* parameters */) {
  super();
  this.validate();
  this.freeze(); // Essential for immutability
}
```

### 2. Implement Validation
```typescript
protected validate(): void {
  this.validateRequired('id', this.id);
  this.validateRange('value', this.value, 0, 100);
  // Add domain-specific validation
}
```

### 3. Provide Static fromJSON Method
```typescript
static fromJSON(data: MyValueObjectData): MyValueObject {
  return new MyValueObject(data.field1, data.field2);
}
```

### 4. Create Immutable Update Methods
```typescript
withNewValue(newValue: string): MyValueObject {
  return new MyValueObject(this.id, newValue, this.otherField);
}
```

### 5. Handle Complex Data Structures
```typescript
// For Maps and Sets in value objects
toJSON(): MyData {
  return {
    simpleField: this.simpleField,
    mapField: SerializationUtils.serializeMap(this.mapField),
    setField: SerializationUtils.serializeSet(this.setField)
  };
}

static fromJSON(data: MyData): MyValueObject {
  return new MyValueObject(
    data.simpleField,
    SerializationUtils.deserializeMap(data.mapField),
    SerializationUtils.deserializeSet(data.setField)
  );
}
```

## Testing

All value objects should be thoroughly tested:

```typescript
describe('MyValueObject', () => {
  it('should create valid instances', () => {
    const obj = new MyValueObject('id', 'value');
    expect(obj.id).toBe('id');
    expect(obj.value).toBe('value');
  });

  it('should be immutable', () => {
    const obj = new MyValueObject('id', 'value');
    expect(Object.isFrozen(obj)).toBe(true);
  });

  it('should validate inputs', () => {
    expect(() => new MyValueObject('', 'value')).toThrow(ValidationError);
  });

  it('should serialize correctly', () => {
    const obj = new MyValueObject('id', 'value');
    const json = obj.toJSON();
    const restored = MyValueObject.fromJSON(json);
    expect(restored.equals(obj)).toBe(true);
  });

  it('should support immutable updates', () => {
    const obj1 = new MyValueObject('id', 'value1');
    const obj2 = obj1.withValue('value2');
    expect(obj1.value).toBe('value1');
    expect(obj2.value).toBe('value2');
  });
});
```

## Integration with Domain Services

Value objects work seamlessly with domain services:

```typescript
import { BaseDomainService } from '../services/BaseDomainService';

class MyDomainService extends BaseDomainService {
  static processValueObject(valueObj: MyValueObject): MyValueObject {
    // Validate inputs
    const validation = this.validateConditions(
      this.validateRequired('valueObj', valueObj)
    );
    
    if (!validation.isValid) {
      throw new Error('Invalid value object');
    }

    // Process and return new immutable instance
    return valueObj.withProcessedValue();
  }
}
```

This foundation ensures all value objects in the system follow consistent patterns for immutability, validation, serialization, and testing.