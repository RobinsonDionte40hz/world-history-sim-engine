// src/domain/services/BaseDomainService.ts

import { ValidationError } from '../../shared/types/ValueObjectTypes';
import { ValidationResult } from '../../shared/types/SystemTypes';

/**
 * Abstract base class for all domain services
 * Provides common functionality for validation and error handling
 */
export abstract class BaseDomainService {
  /**
   * Helper method to create a successful validation result
   */
  protected static createValidResult(): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Helper method to create a failed validation result
   */
  protected static createInvalidResult(errors: ValidationError[], warnings: string[] = []): ValidationResult {
    return {
      isValid: false,
      errors,
      warnings
    };
  }

  /**
   * Helper method to validate required parameters
   */
  protected static validateRequired(paramName: string, value: any): ValidationError | null {
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
  protected static validateRange(
    paramName: string, 
    value: number, 
    min: number, 
    max: number
  ): ValidationError | null {
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
  protected static validateDate(paramName: string, value: Date): ValidationError | null {
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
  protected static validateArray(
    paramName: string, 
    value: any[], 
    minLength: number = 0
  ): ValidationError | null {
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
  protected static validateStringLength(
    paramName: string, 
    value: string, 
    minLength: number, 
    maxLength?: number
  ): ValidationError | null {
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
  protected static collectValidationErrors(...errors: (ValidationError | null)[]): ValidationError[] {
    return errors.filter((error): error is ValidationError => error !== null);
  }

  /**
   * Helper method to validate multiple conditions and return result
   */
  protected static validateConditions(...errors: (ValidationError | null)[]): ValidationResult {
    const validationErrors = this.collectValidationErrors(...errors);
    
    if (validationErrors.length > 0) {
      return this.createInvalidResult(validationErrors);
    }
    
    return this.createValidResult();
  }

  /**
   * Helper method to ensure a value is within bounds
   */
  protected static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Helper method to calculate percentage change
   */
  protected static calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue === 0 ? 0 : 100;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * Helper method to generate unique IDs
   */
  protected static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper method to format timestamps consistently
   */
  protected static formatTimestamp(date: Date): string {
    return date.toISOString();
  }

  /**
   * Helper method to parse timestamps consistently
   */
  protected static parseTimestamp(timestamp: string): Date {
    return new Date(timestamp);
  }
}