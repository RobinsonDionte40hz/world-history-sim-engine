// src/shared/types/ValueObjectTypes.js

/**
 * Base serialization utilities for Maps and Sets
 */
export class SerializationUtils {
  /**
   * Serialize a Map to an array of key-value pairs
   */
  static serializeMap(map) {
    return Array.from(map.entries());
  }

  /**
   * Deserialize an array of key-value pairs to a Map
   */
  static deserializeMap(data) {
    return new Map(data);
  }

  /**
   * Serialize a Set to an array
   */
  static serializeSet(set) {
    return Array.from(set);
  }

  /**
   * Deserialize an array to a Set
   */
  static deserializeSet(data) {
    return new Set(data);
  }

  /**
   * Deep freeze an object to make it immutable
   */
  static deepFreeze(obj, visited = new WeakSet()) {
    // Avoid infinite recursion with circular references
    if (visited.has(obj)) {
      return obj;
    }
    visited.add(obj);

    // Retrieve the property names defined on obj
    Object.getOwnPropertyNames(obj).forEach((name) => {
      const value = obj[name];

      // Freeze properties before freezing self
      if (value && typeof value === 'object') {
        SerializationUtils.deepFreeze(value, visited);
      }
    });

    return Object.freeze(obj);
  }
}

/**
 * Base error types for value objects
 */
export class ValueObjectError extends Error {
  constructor(message, context) {
    super(message);
    this.name = 'ValueObjectError';
    this.context = context;
  }
}

export class SerializationError extends ValueObjectError {
  constructor(operation, cause, context) {
    super(`Failed to ${operation}: ${cause.message}`, context);
    this.name = 'SerializationError';
  }
}

export class ValidationError extends ValueObjectError {
  constructor(field, value, constraint, context) {
    super(`Validation failed for field '${field}' with value '${value}': ${constraint}`, context);
    this.name = 'ValidationError';
  }
}