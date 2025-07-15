// src/domain/value-objects/BaseValueObject.js

import { 
  SerializationUtils, 
  SerializationError, 
  ValidationError 
} from '../../shared/types/ValueObjectTypes';

/**
 * Abstract base class for all value objects in the system
 * Provides common functionality for immutability, validation, and serialization
 */
export class BaseValueObject {
  /**
   * Constructor that sets up the value object
   * Subclasses should call freeze() after setting all properties
   */
  constructor() {
    // Base constructor - subclasses should call freeze() after initialization
  }

  /**
   * Freezes the object to ensure immutability
   * Should be called by subclasses after all properties are set
   */
  freeze() {
    SerializationUtils.deepFreeze(this);
  }

  /**
   * Abstract method that must be implemented by all value objects
   * Converts the value object to a JSON-serializable format
   */
  toJSON() {
    throw new Error('toJSON() must be implemented by subclasses');
  }

  /**
   * Validates the value object's state
   * Override in subclasses to add specific validation logic
   */
  validate() {
    // Base validation - can be overridden by subclasses
  }

  /**
   * Helper method to validate required fields
   */
  validateRequired(field, value) {
    if (value === null || value === undefined) {
      throw new ValidationError(field, value, 'Field is required');
    }
  }

  /**
   * Helper method to validate numeric ranges
   */
  validateRange(field, value, min, max) {
    if (typeof value !== 'number' || value < min || value > max) {
      throw new ValidationError(field, value, `Value must be between ${min} and ${max}`);
    }
  }

  /**
   * Helper method to validate string length
   */
  validateStringLength(field, value, minLength, maxLength) {
    if (typeof value !== 'string' || value.length < minLength) {
      throw new ValidationError(field, value, `String must be at least ${minLength} characters long`);
    }
    if (maxLength && value.length > maxLength) {
      throw new ValidationError(field, value, `String must be no more than ${maxLength} characters long`);
    }
  }

  /**
   * Helper method to validate arrays
   */
  validateArray(field, value, minLength = 0, maxLength) {
    if (!Array.isArray(value) || value.length < minLength) {
      throw new ValidationError(field, value, `Array must have at least ${minLength} elements`);
    }
    if (maxLength && value.length > maxLength) {
      throw new ValidationError(field, value, `Array must have no more than ${maxLength} elements`);
    }
  }

  /**
   * Helper method to create a new instance with updated properties
   * This is the primary way to "modify" immutable value objects
   */
  withUpdates(constructor, updates) {
    try {
      const currentData = this.toJSON();
      const updatedData = { ...currentData, ...updates };
      return constructor.fromJSON(updatedData);
    } catch (error) {
      throw new SerializationError('deserialize', error, { updates });
    }
  }

  /**
   * Equality comparison for value objects
   * Two value objects are equal if their JSON representations are equal
   */
  equals(other) {
    if (this === other) return true;
    if (!other || this.constructor !== other.constructor) return false;
    
    try {
      return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a hash code for the value object based on its JSON representation
   */
  hashCode() {
    try {
      const str = JSON.stringify(this.toJSON());
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash;
    } catch (error) {
      return 0;
    }
  }

  /**
   * String representation of the value object
   */
  toString() {
    try {
      return JSON.stringify(this.toJSON(), null, 2);
    } catch (error) {
      return `[${this.constructor.name}]`;
    }
  }
}

export default BaseValueObject;