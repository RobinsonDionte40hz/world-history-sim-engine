import {
  ConnectionTypes,
  CONNECTION_TYPE_VALUES,
  CONNECTION_DESCRIPTIONS,
  CONNECTION_BASE_DIFFICULTY,
  CONNECTION_TIME_MULTIPLIERS,
  CONNECTION_SAFETY_MODIFIERS,
  isValidConnectionType,
  getConnectionDescription,
  getConnectionBaseDifficulty
} from '../../../shared/constants/ConnectionTypes.js';

describe('ConnectionTypes', () => {
  describe('ConnectionTypes enum', () => {
    test('should contain all expected connection types', () => {
      const expectedTypes = [
        'road', 'river', 'mountain_pass', 'sea_route', 
        'tunnel', 'teleport', 'bridge', 'trade_route'
      ];
      
      expectedTypes.forEach(type => {
        expect(Object.values(ConnectionTypes)).toContain(type);
      });
    });

    test('should have exactly 8 connection types', () => {
      expect(Object.keys(ConnectionTypes)).toHaveLength(8);
    });

    test('should have consistent key-value mapping', () => {
      Object.entries(ConnectionTypes).forEach(([key, value]) => {
        expect(key.toLowerCase()).toBe(value);
      });
    });
  });

  describe('CONNECTION_TYPE_VALUES', () => {
    test('should contain all connection type values', () => {
      expect(CONNECTION_TYPE_VALUES).toEqual(Object.values(ConnectionTypes));
    });

    test('should not contain duplicates', () => {
      const uniqueValues = [...new Set(CONNECTION_TYPE_VALUES)];
      expect(uniqueValues).toHaveLength(CONNECTION_TYPE_VALUES.length);
    });
  });

  describe('CONNECTION_DESCRIPTIONS', () => {
    test('should have descriptions for all connection types', () => {
      CONNECTION_TYPE_VALUES.forEach(connectionType => {
        expect(CONNECTION_DESCRIPTIONS[connectionType]).toBeDefined();
        expect(typeof CONNECTION_DESCRIPTIONS[connectionType]).toBe('string');
        expect(CONNECTION_DESCRIPTIONS[connectionType].length).toBeGreaterThan(0);
      });
    });

    test('should not have extra descriptions', () => {
      const descriptionKeys = Object.keys(CONNECTION_DESCRIPTIONS);
      expect(descriptionKeys).toHaveLength(CONNECTION_TYPE_VALUES.length);
      
      descriptionKeys.forEach(key => {
        expect(CONNECTION_TYPE_VALUES).toContain(key);
      });
    });
  });

  describe('CONNECTION_BASE_DIFFICULTY', () => {
    test('should have difficulty values for all connection types', () => {
      CONNECTION_TYPE_VALUES.forEach(connectionType => {
        const difficulty = CONNECTION_BASE_DIFFICULTY[connectionType];
        expect(difficulty).toBeDefined();
        expect(typeof difficulty).toBe('number');
        expect(difficulty).toBeGreaterThanOrEqual(1);
        expect(difficulty).toBeLessThanOrEqual(10);
      });
    });

    test('should have logical difficulty ordering', () => {
      // Easy connections should have low difficulty
      expect(CONNECTION_BASE_DIFFICULTY[ConnectionTypes.ROAD]).toBe(1);
      expect(CONNECTION_BASE_DIFFICULTY[ConnectionTypes.TELEPORT]).toBe(1);
      expect(CONNECTION_BASE_DIFFICULTY[ConnectionTypes.TRADE_ROUTE]).toBe(1);
      
      // Mountain pass should be most difficult
      expect(CONNECTION_BASE_DIFFICULTY[ConnectionTypes.MOUNTAIN_PASS]).toBeGreaterThan(5);
      
      // Sea routes should be moderately difficult
      expect(CONNECTION_BASE_DIFFICULTY[ConnectionTypes.SEA_ROUTE]).toBeGreaterThan(2);
      expect(CONNECTION_BASE_DIFFICULTY[ConnectionTypes.SEA_ROUTE]).toBeLessThan(6);
    });
  });

  describe('CONNECTION_TIME_MULTIPLIERS', () => {
    test('should have time multipliers for all connection types', () => {
      CONNECTION_TYPE_VALUES.forEach(connectionType => {
        const multiplier = CONNECTION_TIME_MULTIPLIERS[connectionType];
        expect(multiplier).toBeDefined();
        expect(typeof multiplier).toBe('number');
        expect(multiplier).toBeGreaterThan(0);
      });
    });

    test('should have logical time multipliers', () => {
      // Teleport should be fastest
      expect(CONNECTION_TIME_MULTIPLIERS[ConnectionTypes.TELEPORT]).toBeLessThan(0.2);
      
      // Mountain pass should be slowest
      expect(CONNECTION_TIME_MULTIPLIERS[ConnectionTypes.MOUNTAIN_PASS]).toBeGreaterThan(1.5);
      
      // Rivers should be faster than roads (downstream travel)
      expect(CONNECTION_TIME_MULTIPLIERS[ConnectionTypes.RIVER]).toBeLessThan(CONNECTION_TIME_MULTIPLIERS[ConnectionTypes.ROAD]);
      
      // Trade routes should be efficient
      expect(CONNECTION_TIME_MULTIPLIERS[ConnectionTypes.TRADE_ROUTE]).toBeLessThan(1.0);
    });
  });

  describe('CONNECTION_SAFETY_MODIFIERS', () => {
    test('should have safety modifiers for all connection types', () => {
      CONNECTION_TYPE_VALUES.forEach(connectionType => {
        const safety = CONNECTION_SAFETY_MODIFIERS[connectionType];
        expect(safety).toBeDefined();
        expect(typeof safety).toBe('number');
        expect(safety).toBeGreaterThan(0);
        expect(safety).toBeLessThanOrEqual(1);
      });
    });

    test('should have logical safety modifiers', () => {
      // Trade routes and teleport should be safest
      expect(CONNECTION_SAFETY_MODIFIERS[ConnectionTypes.TRADE_ROUTE]).toBeGreaterThan(0.8);
      expect(CONNECTION_SAFETY_MODIFIERS[ConnectionTypes.TELEPORT]).toBeGreaterThan(0.8);
      
      // Mountain pass should be least safe
      expect(CONNECTION_SAFETY_MODIFIERS[ConnectionTypes.MOUNTAIN_PASS]).toBeLessThan(0.4);
      
      // Roads should be relatively safe
      expect(CONNECTION_SAFETY_MODIFIERS[ConnectionTypes.ROAD]).toBeGreaterThan(0.7);
    });
  });

  describe('isValidConnectionType', () => {
    test('should return true for valid connection types', () => {
      CONNECTION_TYPE_VALUES.forEach(connectionType => {
        expect(isValidConnectionType(connectionType)).toBe(true);
      });
    });

    test('should return false for invalid connection types', () => {
      const invalidTypes = ['invalid', 'path', 'highway', '', null, undefined, 123];
      
      invalidTypes.forEach(invalidType => {
        expect(isValidConnectionType(invalidType)).toBe(false);
      });
    });

    test('should be case sensitive', () => {
      expect(isValidConnectionType('ROAD')).toBe(false);
      expect(isValidConnectionType('Road')).toBe(false);
      expect(isValidConnectionType('road')).toBe(true);
    });
  });

  describe('getConnectionDescription', () => {
    test('should return correct descriptions for valid connection types', () => {
      expect(getConnectionDescription(ConnectionTypes.ROAD)).toBe('Well-maintained path suitable for travel and trade');
      expect(getConnectionDescription(ConnectionTypes.RIVER)).toBe('Waterway connection allowing boat or raft travel');
      expect(getConnectionDescription(ConnectionTypes.TELEPORT)).toBe('Magical or technological instant transportation');
    });

    test('should return empty string for invalid connection types', () => {
      expect(getConnectionDescription('invalid')).toBe('');
      expect(getConnectionDescription(null)).toBe('');
      expect(getConnectionDescription(undefined)).toBe('');
    });
  });

  describe('getConnectionBaseDifficulty', () => {
    test('should return correct difficulty for valid connection types', () => {
      expect(getConnectionBaseDifficulty(ConnectionTypes.ROAD)).toBe(1);
      expect(getConnectionBaseDifficulty(ConnectionTypes.MOUNTAIN_PASS)).toBe(6);
      expect(getConnectionBaseDifficulty(ConnectionTypes.SEA_ROUTE)).toBe(4);
    });

    test('should return default difficulty for invalid connection types', () => {
      expect(getConnectionBaseDifficulty('invalid')).toBe(1);
      expect(getConnectionBaseDifficulty(null)).toBe(1);
      expect(getConnectionBaseDifficulty(undefined)).toBe(1);
    });
  });

  describe('completeness validation', () => {
    test('should have all required connection types from requirements', () => {
      // Based on requirements 3.1 - connection types should include major travel methods
      const requiredTypes = ['road', 'river', 'mountain_pass', 'sea_route'];
      
      requiredTypes.forEach(type => {
        expect(CONNECTION_TYPE_VALUES).toContain(type);
      });
    });

    test('should maintain data consistency across all modifier objects', () => {
      // All connection types should have corresponding data in all modifier objects
      CONNECTION_TYPE_VALUES.forEach(connectionType => {
        expect(CONNECTION_DESCRIPTIONS[connectionType]).toBeDefined();
        expect(CONNECTION_BASE_DIFFICULTY[connectionType]).toBeDefined();
        expect(CONNECTION_TIME_MULTIPLIERS[connectionType]).toBeDefined();
        expect(CONNECTION_SAFETY_MODIFIERS[connectionType]).toBeDefined();
      });
    });

    test('should include both mundane and magical connection types', () => {
      // Should have regular travel methods
      expect(CONNECTION_TYPE_VALUES).toContain('road');
      expect(CONNECTION_TYPE_VALUES).toContain('river');
      
      // Should have magical/special methods
      expect(CONNECTION_TYPE_VALUES).toContain('teleport');
    });

    test('should have balanced difficulty distribution', () => {
      const difficulties = CONNECTION_TYPE_VALUES.map(type => CONNECTION_BASE_DIFFICULTY[type]);
      const minDifficulty = Math.min(...difficulties);
      const maxDifficulty = Math.max(...difficulties);
      
      // Should have range from easy to hard
      expect(minDifficulty).toBe(1);
      expect(maxDifficulty).toBeGreaterThan(5);
      
      // Should have variety in difficulty levels
      const uniqueDifficulties = [...new Set(difficulties)];
      expect(uniqueDifficulties.length).toBeGreaterThan(3);
    });
  });
});