/**
 * Centralized Validation Tests - Verify validation consistency across layers
 */

import WorldValidator from '../domain/services/WorldValidator.js';

describe('Centralized Node Validation', () => {
  describe('WorldValidator.validateSingleNode', () => {
    test('should validate a complete valid node', () => {
      const validNode = {
        id: 'node_123',
        name: 'Test Settlement',
        type: 'settlement',
        description: 'A thriving settlement in the valley',
        environmentalProperties: {
          climate: 'temperate',
          terrain: 'plains'
        },
        resourceAvailability: {
          water: 'abundant',
          food: 'moderate'
        },
        culturalContext: {
          language: 'common',
          customs: 'trading'
        },
        populationCapacity: 1000,
        currentPopulation: 750,
        developmentLevel: 5
      };

      const result = WorldValidator.validateSingleNode(validNode);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject node with missing required fields', () => {
      const invalidNode = {
        id: 'node_123'
        // Missing name, type, description
      };

      const result = WorldValidator.validateSingleNode(invalidNode);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name', message: expect.stringContaining('required') }),
          expect.objectContaining({ field: 'type', message: expect.stringContaining('required') }),
          expect.objectContaining({ field: 'description', message: expect.stringContaining('required') })
        ])
      );
    });

    test('should reject node with spatial coordinates (mapless constraint)', () => {
      const nodeWithCoordinates = {
        id: 'node_123',
        name: 'Test Node',
        type: 'settlement',
        description: 'A test settlement',
        x: 100,
        y: 200,
        position: { x: 100, y: 200 }
      };

      const result = WorldValidator.validateSingleNode(nodeWithCoordinates);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            field: 'position', 
            message: expect.stringContaining('Spatial coordinates not allowed') 
          })
        ])
      );
    });

    test('should validate name length constraints', () => {
      const shortName = {
        id: 'node_123',
        name: 'AB', // Too short
        type: 'settlement',
        description: 'A test settlement'
      };

      const result = WorldValidator.validateSingleNode(shortName);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            field: 'name', 
            message: expect.stringContaining('at least 3 characters') 
          })
        ])
      );
    });

    test('should validate description length constraints', () => {
      const shortDescription = {
        id: 'node_123',
        name: 'Test Node',
        type: 'settlement',
        description: 'Short' // Too short
      };

      const result = WorldValidator.validateSingleNode(shortDescription);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            field: 'description', 
            message: expect.stringContaining('at least 10 characters') 
          })
        ])
      );
    });

    test('should validate population constraints', () => {
      const invalidPopulation = {
        id: 'node_123',
        name: 'Test Node',
        type: 'settlement',
        description: 'A test settlement',
        populationCapacity: 100,
        currentPopulation: 150 // Exceeds capacity
      };

      const result = WorldValidator.validateSingleNode(invalidPopulation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            field: 'currentPopulation', 
            message: expect.stringContaining('cannot exceed population capacity') 
          })
        ])
      );
    });

    test('should validate development level range', () => {
      const invalidDevelopmentLevel = {
        id: 'node_123',
        name: 'Test Node',
        type: 'settlement',
        description: 'A test settlement',
        developmentLevel: 15 // Out of range
      };

      const result = WorldValidator.validateSingleNode(invalidDevelopmentLevel);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            field: 'developmentLevel', 
            message: expect.stringContaining('between 1 and 10') 
          })
        ])
      );
    });

    test('should handle null or undefined node data', () => {
      const nullResult = WorldValidator.validateSingleNode(null);
      expect(nullResult.isValid).toBe(false);
      expect(nullResult.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            field: 'node', 
            message: expect.stringContaining('required') 
          })
        ])
      );

      const undefinedResult = WorldValidator.validateSingleNode(undefined);
      expect(undefinedResult.isValid).toBe(false);
      expect(undefinedResult.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            field: 'node', 
            message: expect.stringContaining('required') 
          })
        ])
      );
    });
  });

  describe('Integration with existing validateAbstractNodes', () => {
    test('should maintain consistency between single and collection validation', () => {
      const validNode = {
        id: 'node_123',
        name: 'Test Settlement',
        type: 'settlement',
        description: 'A thriving settlement in the valley'
      };

      const singleResult = WorldValidator.validateSingleNode(validNode);
      const collectionResult = WorldValidator.validateAbstractNodes([validNode]);

      expect(singleResult.isValid).toBe(true);
      expect(collectionResult.valid).toBe(true);
    });

    test('should detect same errors in both single and collection validation', () => {
      const invalidNode = {
        id: 'node_123',
        name: 'AB', // Too short
        type: 'settlement',
        description: 'Short' // Too short
      };

      const singleResult = WorldValidator.validateSingleNode(invalidNode);
      const collectionResult = WorldValidator.validateAbstractNodes([invalidNode]);

      expect(singleResult.isValid).toBe(false);
      expect(collectionResult.valid).toBe(false);
      
      // Both should detect name length error
      expect(singleResult.errors.some(e => e.field === 'name')).toBe(true);
      expect(collectionResult.errors.some(e => e.field === 'name')).toBe(true);
    });
  });
});