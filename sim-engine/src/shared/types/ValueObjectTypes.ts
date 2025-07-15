// src/shared/types/ValueObjectTypes.ts

/**
 * Base interface for all serializable value objects
 */
export interface Serializable<T> {
  toJSON(): T;
}

/**
 * Base interface for value objects that can be reconstructed from JSON
 */
export interface Deserializable<T, U> {
  fromJSON(data: T): U;
}

/**
 * Base interface for immutable value objects
 */
export interface ValueObject<T> extends Serializable<T> {
  readonly [key: string]: any;
}

/**
 * Utility type for making all properties readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Utility type for serialized Map data
 */
export type SerializedMap<K, V> = Array<[K, V]>;

/**
 * Utility type for serialized Set data
 */
export type SerializedSet<T> = Array<T>;

/**
 * Base serialization utilities for Maps and Sets
 */
export class SerializationUtils {
  /**
   * Serialize a Map to an array of key-value pairs
   */
  static serializeMap<K, V>(map: Map<K, V>): SerializedMap<K, V> {
    return Array.from(map.entries());
  }

  /**
   * Deserialize an array of key-value pairs to a Map
   */
  static deserializeMap<K, V>(data: SerializedMap<K, V>): Map<K, V> {
    return new Map(data);
  }

  /**
   * Serialize a Set to an array
   */
  static serializeSet<T>(set: Set<T>): SerializedSet<T> {
    return Array.from(set);
  }

  /**
   * Deserialize an array to a Set
   */
  static deserializeSet<T>(data: SerializedSet<T>): Set<T> {
    return new Set(data);
  }

  /**
   * Deep freeze an object to make it immutable
   */
  static deepFreeze<T extends object>(obj: T, visited = new WeakSet()): T {
    // Avoid infinite recursion with circular references
    if (visited.has(obj)) {
      return obj;
    }
    visited.add(obj);

    // Retrieve the property names defined on obj
    Object.getOwnPropertyNames(obj).forEach((name) => {
      const value = (obj as any)[name];

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
  constructor(message: string, public readonly context?: any) {
    super(message);
    this.name = 'ValueObjectError';
  }
}

export class SerializationError extends ValueObjectError {
  constructor(operation: 'serialize' | 'deserialize', cause: Error, context?: any) {
    super(`Failed to ${operation}: ${cause.message}`, context);
    this.name = 'SerializationError';
  }
}

export class ValidationError extends ValueObjectError {
  constructor(field: string, value: any, constraint: string, context?: any) {
    super(`Validation failed for field '${field}' with value '${value}': ${constraint}`, context);
    this.name = 'ValidationError';
  }
}