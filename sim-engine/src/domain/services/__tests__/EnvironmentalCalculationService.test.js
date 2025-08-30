// src/domain/services/__tests__/EnvCalcService.test.js

import EnvironmentalCalculationService from '../EnvironmentalCalculationService.js';

describe('EnvironmentalCalculationService', () => {
  describe('calculateDanger', () => {
    it('should return 0 for null node', () => {
      const result = EnvironmentalCalculationService.calculateDanger(null);
      expect(result).toBe(0);
    });

    it('should return 0 for undefined node', () => {
      const result = EnvironmentalCalculationService.calculateDanger(undefined);
      expect(result).toBe(0);
    });

    it('should return 0 for node without environment', () => {
      const node = { id: 'test', name: 'Test Node' };
      const result = EnvironmentalCalculationService.calculateDanger(node);
      expect(result).toBe(0);
    });
  });

  describe('getModifiers', () => {
    it('should return empty object for null node', () => {
      const result = EnvironmentalCalculationService.getModifiers(null, 'combat');
      expect(result).toEqual({});
    });

    it('should return empty object for node without environment', () => {
      const node = { id: 'test', name: 'Test Node' };
      const result = EnvironmentalCalculationService.getModifiers(node, 'combat');
      expect(result).toEqual({});
    });
  });

  describe('calculatePopulationCapacity', () => {
    it('should return 100 for null node', () => {
      const result = EnvironmentalCalculationService.calculatePopulationCapacity(null);
      expect(result).toBe(100);
    });

    it('should return node size for node without environment', () => {
      const node = { size: 150 };
      const result = EnvironmentalCalculationService.calculatePopulationCapacity(node);
      expect(result).toBe(150);
    });
  });

  describe('calculateComfortLevel', () => {
    it('should return 0.5 for null node', () => {
      const result = EnvironmentalCalculationService.calculateComfortLevel(null);
      expect(result).toBe(0.5);
    });
  });

  describe('getEnvironmentalSummary', () => {
    it('should return default summary for null node', () => {
      const result = EnvironmentalCalculationService.getEnvironmentalSummary(null);
      expect(result).toEqual({
        danger: 0,
        comfort: 0.5,
        capacity: 100,
        hospitable: true,
        majorFactors: []
      });
    });
  });
});