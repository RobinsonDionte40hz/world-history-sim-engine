// src/domain/services/BaseDomainService.js

/**
 * Base class for all domain services
 * Provides common functionality for validation and error handling
 */
export default class BaseDomainService {
  /**
   * Helper method to create a successful validation result
   */
  static createValidResult() {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Helper method to create a failed validation result
   */
  static createInvalidResult(errors = [], warnings = []) {
    return {
      isValid: false,
      errors,
      warnings
    };
  }

  /**
   * Helper method to validate required parameters
   */
  static validateRequired(paramName, value) {
    if (value === null || value === undefined) {
      return {
        field: paramName,
        message: `${paramName} is required`,
        severity: 'error'
      };
    }
    return null;
  }

  /**
   * Helper method to validate numeric ranges
   */
  static validateRange(paramName, value, min, max) {
    if (typeof value !== 'number' || value < min || value > max) {
      return {
        field: paramName,
        message: `${paramName} must be between ${min} and ${max}`,
        severity: 'error'
      };
    }
    return null;
  }

  /**
   * Helper method to validate dates
   */
  static validateDate(paramName, value) {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      return {
        field: paramName,
        message: `${paramName} must be a valid date`,
        severity: 'error'
      };
    }
    return null;
  }

  /**
   * Helper method to validate arrays
   */
  static validateArray(paramName, value, minLength = 0) {
    if (!Array.isArray(value) || value.length < minLength) {
      return {
        field: paramName,
        message: `${paramName} must be an array with at least ${minLength} elements`,
        severity: 'error'
      };
    }
    return null;
  }

  /**
   * Helper method to validate string length
   */
  static validateStringLength(paramName, value, minLength, maxLength) {
    if (typeof value !== 'string' || value.length < minLength) {
      return {
        field: paramName,
        message: `${paramName} must be at least ${minLength} characters long`,
        severity: 'error'
      };
    }
    if (maxLength && value.length > maxLength) {
      return {
        field: paramName,
        message: `${paramName} must be no more than ${maxLength} characters long`,
        severity: 'error'
      };
    }
    return null;
  }

  /**
   * Helper method to collect validation errors
   */
  static collectValidationErrors(...errors) {
    return errors.filter((error) => error !== null);
  }

  /**
   * Helper method to validate multiple conditions and return result
   */
  static validateConditions(...errors) {
    const validationErrors = this.collectValidationErrors(...errors);

    if (validationErrors.length > 0) {
      return this.createInvalidResult(validationErrors);
    }

    return this.createValidResult();
  }

  /**
   * Helper method to ensure a value is within bounds
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Helper method to calculate percentage change
   */
  static calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return newValue === 0 ? 0 : 100;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * Helper method to generate unique IDs
   */
  static generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper method to format timestamps consistently
   */
  static formatTimestamp(date) {
    return date.toISOString();
  }

  /**
   * Helper method to parse timestamps consistently
   */
  static parseTimestamp(timestamp) {
    return new Date(timestamp);
  }
}