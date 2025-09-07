// src/domain/services/__tests__/CharacterBehaviorModifierService.test.js

import CharacterBehaviorModifierService from '../CharacterBehaviorModifierService.js';
import Character from '../../entities/Character.js';

describe('CharacterBehaviorModifierService', () => {
  let service;
  let mockCharacter;
  let mockSettlement;
  let mockWorldState;
  let availableSettlements;

  beforeEach(() => {
    service = new CharacterBehaviorModifierService();
    
    mockCharacter = new Character({
      id: 'char-1',
      name: 'Test Character',
      energy: 80,
      health: 90,
      mood: 70,
      currentNodeId: 'settlement-1',
      baseAttributes: {
        strength: { score: 10 },
        dexterity: { score: 10 },
        constitution: { score: 10 },
        intelligence: { score: 10 },
        wisdom: { score: 10 },
        charisma: { score: 10 }
      }
    });

    mockSettlement = {
      id: 'settlement-1',
      name: 'Test Village',
      type: 'village',
      population: { total: 100 },
      needSatisfaction: {
        current: {
          food: 0.5,
          water: 0.5,
          shelter: 0.5,
          goods: 0.5,
          services: 0.5,
          overall: 0.5,
          lastCalculated: Date.now()
        },
        activeConsequences: []
      }
    };

    availableSettlements = [
      {
        id: 'settlement-2',
        name: 'Better Village',
        type: 'village',
        population: { total: 150 },
        needSatisfaction: {
          current: {
            food: 0.8,
            water: 0.8,
            shelter: 0.8,
            goods: 0.8,
            services: 0.8,
            overall: 0.8
          },
          activeConsequences: []
        }
      },
      {
        id: 'settlement-3',
        name: 'Worse Village',
        type: 'village',
        population: { total: 50 },
        needSatisfaction: {
          current: {
            food: 0.3,
            water: 0.3,
            shelter: 0.3,
            goods: 0.3,
            services: 0.3,
            overall: 0.3
          },
          activeConsequences: [
            {
              id: 'famine-1',
              type: 'famine',
              severity: 0.8,
              startDate: Date.now(),
              duration: 100,
              triggers: [],
              resolved: false
            }
          ]
        }
      }
    ];

    mockWorldState = {
      time: 0,
      nodes: [{ id: 'settlement-1', name: 'Test Node' }],
      settlements: [mockSettlement]
    };
  });

  describe('applyNeedSatisfactionModifiers', () => {
    it('should return unchanged character when no need satisfaction data', () => {
      const settlementWithoutNeeds = { ...mockSettlement };
      delete settlementWithoutNeeds.needSatisfaction;

      const result = service.applyNeedSatisfactionModifiers(
        mockCharacter, 
        settlementWithoutNeeds, 
        mockWorldState
      );

      expect(result).toBe(mockCharacter);
    });

    it('should apply food shortage modifiers correctly', () => {
      const poorSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            ...mockSettlement.needSatisfaction.current,
            food: 0.2, // Critical food shortage
            water: 0.8,
            shelter: 0.8,
            goods: 0.8,
            services: 0.8,
            overall: 0.6
          }
        }
      };

      const result = service.applyNeedSatisfactionModifiers(
        mockCharacter, 
        poorSettlement, 
        mockWorldState
      );

      expect(result.energy).toBeLessThan(mockCharacter.energy);
      expect(result.health).toBeLessThan(mockCharacter.health);
      expect(result.mood).toBeLessThan(mockCharacter.mood);
      expect(result.needBasedBehaviorChanges).toContain('seek_food');
      expect(result.needBasedBehaviorChanges).toContain('avoid_strenuous_activity');
    });

    it('should apply water shortage modifiers correctly', () => {
      const poorSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            ...mockSettlement.needSatisfaction.current,
            food: 0.8,
            water: 0.2, // Critical water shortage
            shelter: 0.8,
            goods: 0.8,
            services: 0.8,
            overall: 0.6
          }
        }
      };

      const result = service.applyNeedSatisfactionModifiers(
        mockCharacter, 
        poorSettlement, 
        mockWorldState
      );

      expect(result.health).toBeLessThan(mockCharacter.health);
      expect(result.energy).toBeLessThan(mockCharacter.energy);
      expect(result.mood).toBeLessThan(mockCharacter.mood);
      expect(result.needBasedBehaviorChanges).toContain('seek_water');
      expect(result.needBasedBehaviorChanges).toContain('avoid_heat');
    });

    it('should apply shelter shortage modifiers correctly', () => {
      const poorSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            ...mockSettlement.needSatisfaction.current,
            food: 0.8,
            water: 0.8,
            shelter: 0.2, // Critical shelter shortage
            goods: 0.8,
            services: 0.8,
            overall: 0.6
          }
        }
      };

      const result = service.applyNeedSatisfactionModifiers(
        mockCharacter, 
        poorSettlement, 
        mockWorldState
      );

      expect(result.mood).toBeLessThan(mockCharacter.mood);
      expect(result.health).toBeLessThan(mockCharacter.health);
      expect(result.needBasedBehaviorChanges).toContain('seek_shelter');
      expect(result.needBasedBehaviorChanges).toContain('avoid_weather');
    });

    it('should apply consequence-based modifiers', () => {
      const consequenceSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          activeConsequences: [
            {
              id: 'famine-1',
              type: 'famine',
              severity: 0.8,
              startDate: Date.now(),
              duration: 100,
              triggers: [],
              resolved: false
            }
          ]
        }
      };

      const result = service.applyNeedSatisfactionModifiers(
        mockCharacter, 
        consequenceSettlement, 
        mockWorldState
      );

      expect(result.energy).toBeLessThan(mockCharacter.energy);
      expect(result.health).toBeLessThan(mockCharacter.health);
      expect(result.mood).toBeLessThan(mockCharacter.mood);
      expect(result.needBasedBehaviorChanges).toContain('desperate_food_search');
      expect(result.needBasedBehaviorChanges).toContain('avoid_conflict');
    });

    it('should not modify stats beyond valid ranges', () => {
      const extremeSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            food: 0.0,
            water: 0.0,
            shelter: 0.0,
            goods: 0.0,
            services: 0.0,
            overall: 0.0
          },
          activeConsequences: [
            {
              id: 'famine-1',
              type: 'famine',
              severity: 1.0,
              startDate: Date.now(),
              duration: 100,
              triggers: [],
              resolved: false
            }
          ]
        }
      };

      const result = service.applyNeedSatisfactionModifiers(
        mockCharacter, 
        extremeSettlement, 
        mockWorldState
      );

      expect(result.energy).toBeGreaterThanOrEqual(0);
      expect(result.energy).toBeLessThanOrEqual(mockCharacter.maxEnergy);
      expect(result.health).toBeGreaterThanOrEqual(0);
      expect(result.health).toBeLessThanOrEqual(100);
      expect(result.mood).toBeGreaterThanOrEqual(0);
      expect(result.mood).toBeLessThanOrEqual(100);
    });
  });

  describe('getInteractionModifiers', () => {
    it('should return default modifiers when no need satisfaction data', () => {
      const settlementWithoutNeeds = { ...mockSettlement };
      delete settlementWithoutNeeds.needSatisfaction;

      const mockInteraction = { type: 'farm', name: 'Farming' };
      const result = service.getInteractionModifiers(
        mockCharacter, 
        mockInteraction, 
        settlementWithoutNeeds
      );

      expect(result).toEqual({
        weightModifier: 1.0,
        priorityModifier: 1.0,
        successModifier: 1.0,
        durationModifier: 1.0
      });
    });

    it('should apply food-related interaction modifiers', () => {
      const poorSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            ...mockSettlement.needSatisfaction.current,
            food: 0.2 // Critical food shortage
          }
        }
      };

      const farmingInteraction = { type: 'farm', name: 'Farming' };
      const result = service.getInteractionModifiers(
        mockCharacter, 
        farmingInteraction, 
        poorSettlement
      );

      expect(result.weightModifier).toBeGreaterThan(1.0);
      expect(result.priorityModifier).toBeGreaterThan(1.0);
    });

    it('should apply water-related interaction modifiers', () => {
      const poorSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            ...mockSettlement.needSatisfaction.current,
            water: 0.2 // Critical water shortage
          }
        }
      };

      const waterInteraction = { type: 'water_collection', name: 'Water Collection' };
      const result = service.getInteractionModifiers(
        mockCharacter, 
        waterInteraction, 
        poorSettlement
      );

      expect(result.weightModifier).toBeGreaterThan(1.0);
      expect(result.priorityModifier).toBeGreaterThan(1.0);
    });

    it('should apply character state modifiers', () => {
      const lowEnergyCharacter = new Character({
        ...mockCharacter.toJSON(),
        energy: 15 // Very low energy
      });

      const strenuousInteraction = { type: 'build', name: 'Building' };
      const result = service.getInteractionModifiers(
        lowEnergyCharacter, 
        strenuousInteraction, 
        mockSettlement
      );

      expect(result.weightModifier).toBeLessThan(1.0);
      expect(result.successModifier).toBeLessThan(1.0);
    });
  });

  describe('getNeedBasedPriorities', () => {
    it('should return empty priorities when no need satisfaction data', () => {
      const settlementWithoutNeeds = { ...mockSettlement };
      delete settlementWithoutNeeds.needSatisfaction;

      const result = service.getNeedBasedPriorities(
        mockCharacter, 
        settlementWithoutNeeds
      );

      expect(result).toEqual({});
    });

    it('should return food-related priorities for food shortage', () => {
      const poorSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            ...mockSettlement.needSatisfaction.current,
            food: 0.2 // Critical food shortage
          }
        }
      };

      const result = service.getNeedBasedPriorities(
        mockCharacter, 
        poorSettlement
      );

      expect(result.farming).toBeGreaterThan(1.0);
      expect(result.hunting).toBeGreaterThan(1.0);
      expect(result.rest).toBeLessThan(1.0);
    });

    it('should return water-related priorities for water shortage', () => {
      const poorSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            ...mockSettlement.needSatisfaction.current,
            water: 0.2 // Critical water shortage
          }
        }
      };

      const result = service.getNeedBasedPriorities(
        mockCharacter, 
        poorSettlement
      );

      expect(result.water_collection).toBeGreaterThan(1.0);
      expect(result.well_digging).toBeGreaterThan(1.0);
    });

    it('should return shelter-related priorities for shelter shortage', () => {
      const poorSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            ...mockSettlement.needSatisfaction.current,
            shelter: 0.2 // Critical shelter shortage
          }
        }
      };

      const result = service.getNeedBasedPriorities(
        mockCharacter, 
        poorSettlement
      );

      expect(result.building).toBeGreaterThan(1.0);
      expect(result.repair).toBeGreaterThan(1.0);
    });
  });

  describe('evaluateMigrationDecision', () => {

    it('should not recommend migration when needs are satisfied', () => {
      const goodSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            food: 0.8,
            water: 0.8,
            shelter: 0.8,
            goods: 0.8,
            services: 0.8,
            overall: 0.8
          }
        }
      };

      const result = service.evaluateMigrationDecision(
        mockCharacter, 
        goodSettlement, 
        availableSettlements
      );

      expect(result.shouldMigrate).toBe(false);
      expect(result.urgency).toBeLessThan(0.3);
    });

    it('should recommend migration when needs are critically low', () => {
      const poorSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            food: 0.1,
            water: 0.1,
            shelter: 0.1,
            goods: 0.1,
            services: 0.1,
            overall: 0.1
          },
          activeConsequences: [
            {
              id: 'famine-1',
              type: 'famine',
              severity: 0.9,
              startDate: Date.now(),
              duration: 100,
              triggers: [],
              resolved: false
            }
          ]
        }
      };

      const result = service.evaluateMigrationDecision(
        mockCharacter, 
        poorSettlement, 
        availableSettlements
      );

      expect(result.shouldMigrate).toBe(true);
      expect(result.urgency).toBeGreaterThan(0.3);
      expect(result.targetSettlement.id).toBe('settlement-2'); // Better village
    });

    it('should consider character personality in migration decision', () => {
      const adventurousCharacter = new Character({
        ...mockCharacter.toJSON(),
        personality: {
          traits: new Map([
            ['adventurous', { value: 0.8 }],
            ['homebody', { value: 0.2 }]
          ])
        }
      });

      const moderateSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            food: 0.4,
            water: 0.4,
            shelter: 0.4,
            goods: 0.4,
            services: 0.4,
            overall: 0.4
          }
        }
      };

      const result = service.evaluateMigrationDecision(
        adventurousCharacter, 
        moderateSettlement, 
        availableSettlements
      );

      // Adventurous character should be more likely to migrate
      expect(result.urgency).toBeGreaterThan(0.3);
    });

    it('should return null target when no better settlements available', () => {
      const poorSettlement = {
        ...mockSettlement,
        needSatisfaction: {
          ...mockSettlement.needSatisfaction,
          current: {
            food: 0.1,
            water: 0.1,
            shelter: 0.1,
            goods: 0.1,
            services: 0.1,
            overall: 0.1
          }
        }
      };

      // All available settlements are worse
      const worseSettlements = [
        {
          id: 'settlement-2',
          name: 'Worse Village',
          type: 'village',
          population: { total: 50 },
          needSatisfaction: {
            current: {
              food: 0.05,
              water: 0.05,
              shelter: 0.05,
              goods: 0.05,
              services: 0.05,
              overall: 0.05
            },
            activeConsequences: []
          }
        }
      ];

      const result = service.evaluateMigrationDecision(
        mockCharacter, 
        poorSettlement, 
        worseSettlements
      );

      expect(result.shouldMigrate).toBe(false);
      expect(result.targetSettlement).toBe(null);
    });
  });

  describe('Input Validation', () => {
    it('should throw error for missing character', () => {
      expect(() => {
        service.applyNeedSatisfactionModifiers(null, mockSettlement, mockWorldState);
      }).toThrow('Character is required');
    });

    it('should throw error for missing settlement', () => {
      expect(() => {
        service.applyNeedSatisfactionModifiers(mockCharacter, null, mockWorldState);
      }).toThrow('Settlement is required');
    });

    it('should throw error for missing character in getInteractionModifiers', () => {
      expect(() => {
        service.getInteractionModifiers(null, { type: 'test' }, mockSettlement);
      }).toThrow('Character is required');
    });

    it('should throw error for missing settlement in getInteractionModifiers', () => {
      expect(() => {
        service.getInteractionModifiers(mockCharacter, { type: 'test' }, null);
      }).toThrow('Settlement is required');
    });
  });

  describe('Edge Cases', () => {
    it('should handle settlement without population data', () => {
      const settlementWithoutPopulation = {
        ...mockSettlement,
        population: undefined
      };

      const result = service.applyNeedSatisfactionModifiers(
        mockCharacter, 
        settlementWithoutPopulation, 
        mockWorldState
      );

      expect(result).toBeDefined();
      expect(result.needBasedBehaviorChanges).toBeDefined();
    });

    it('should handle character without personality traits', () => {
      const characterWithoutPersonality = new Character({
        ...mockCharacter.toJSON(),
        personality: undefined
      });

      const result = service.evaluateMigrationDecision(
        characterWithoutPersonality, 
        mockSettlement, 
        availableSettlements
      );

      expect(result).toBeDefined();
      expect(result.shouldMigrate).toBe(false);
    });

    it('should handle empty available settlements array', () => {
      const result = service.evaluateMigrationDecision(
        mockCharacter, 
        mockSettlement, 
        []
      );

      expect(result.shouldMigrate).toBe(false);
      expect(result.targetSettlement).toBe(null);
    });
  });
});
