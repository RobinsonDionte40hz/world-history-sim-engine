// src/domain/services/__tests__/PrerequisiteValidator.test.js

import { PrerequisiteValidator } from '../PrerequisiteValidator.js';
import { Alignment } from '../../value-objects/Alignment.js';
import { Influence } from '../../value-objects/Influence.js';
import { Prestige } from '../../value-objects/Prestige.js';
import HistoricalEvent from '../../entities/HistoricalEvent.js';

describe('PrerequisiteValidator', () => {
  // Test data setup
  const mockAlignmentAxes = [
    {
      id: 'moral',
      name: 'Moral',
      description: 'Good vs Evil',
      min: -100,
      max: 100,
      defaultValue: 0,
      zones: [
        { name: 'Evil', min: -100, max: -25, description: 'Evil alignment' },
        { name: 'Neutral', min: -24, max: 24, description: 'Neutral alignment' },
        { name: 'Good', min: 25, max: 100, description: 'Good alignment' }
      ]
    }
  ];

  const mockInfluenceDomains = [
    {
      id: 'political',
      name: 'Political',
      description: 'Political influence',
      min: 0,
      max: 100,
      defaultValue: 0,
      tiers: [
        { name: 'None', min: 0, max: 10, benefits: [], responsibilities: [] },
        { name: 'Minor', min: 11, max: 50, benefits: ['minor_benefits'], responsibilities: [] },
        { name: 'Major', min: 51, max: 100, benefits: ['major_benefits'], responsibilities: [] }
      ]
    }
  ];

  const mockPrestigeTracks = [
    {
      id: 'military',
      name: 'Military',
      description: 'Military prestige',
      min: 0,
      max: 100,
      defaultValue: 0,
      decayRate: 0.1,
      levels: [
        { name: 'Unknown', min: 0, max: 10, socialBenefits: [], politicalPower: 0 },
        { name: 'Known', min: 11, max: 50, socialBenefits: ['recognition'], politicalPower: 1 },
        { name: 'Famous', min: 51, max: 100, socialBenefits: ['fame'], politicalPower: 5 }
      ]
    }
  ];

  const createMockCharacter = (overrides = {}) => ({
    id: 'test-character',
    level: 5,
    skills: { swordsmanship: 10, diplomacy: 15 },
    completedQuests: ['quest1', 'quest2'],
    inventory: { sword: 1, potion: 3 },
    alignment: new Alignment(mockAlignmentAxes, { moral: 50 }),
    influence: new Influence(mockInfluenceDomains, { political: 25 }),
    prestige: new Prestige(mockPrestigeTracks, { military: 30 }),
    personality: {
      getTrait: (id) => ({ id, intensity: 75 }),
      traits: [{ id: 'courage', intensity: 75 }]
    },
    race: {
      getAttributeModifiers: () => new Map(),
      race: { id: 'human' },
      subrace: { name: 'variant' }
    },
    status: 'active',
    ...overrides
  });

  const createMockInteraction = (prerequisites = {}) => ({
    id: 'test-interaction',
    name: 'Test Interaction',
    prerequisites: {
      groups: [
        {
          conditions: [
            { type: 'level', value: 3 },
            { type: 'skill', skillId: 'swordsmanship', value: 8 }
          ]
        }
      ],
      unavailableMessage: 'Requirements not met',
      ...prerequisites
    }
  });

  const createMockWorldState = (overrides = {}) => ({
    currentTime: new Date(),
    settlements: [
      { id: 'town1', type: 'town', population: 1000 },
      { id: 'city1', type: 'city', population: 5000 }
    ],
    activeEvents: [],
    globalConditions: new Map([
      ['stability', 75],
      ['prosperity', 50]
    ]),
    ...overrides
  });

  describe('validatePrerequisites', () => {
    test('should return valid for interaction without prerequisites', () => {
      const character = createMockCharacter();
      const interaction = { id: 'test', name: 'Test' };

      const result = PrerequisiteValidator.validatePrerequisites(interaction, character);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return invalid for missing inputs', () => {
      const result = PrerequisiteValidator.validatePrerequisites(null, null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('required');
    });

    test('should validate level requirements', () => {
      const character = createMockCharacter({ level: 2 });
      const interaction = createMockInteraction();

      const result = PrerequisiteValidator.validatePrerequisites(interaction, character);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'level')).toBe(true);
    });

    test('should validate skill requirements', () => {
      const character = createMockCharacter({ skills: { swordsmanship: 5 } });
      const interaction = createMockInteraction();

      const result = PrerequisiteValidator.validatePrerequisites(interaction, character);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'skill')).toBe(true);
    });

    test('should validate quest requirements', () => {
      const character = createMockCharacter();
      const interaction = createMockInteraction({
        groups: [{
          conditions: [{ type: 'quest', questId: 'missing-quest' }]
        }]
      });

      const result = PrerequisiteValidator.validatePrerequisites(interaction, character);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'quest')).toBe(true);
    });

    test('should validate item requirements', () => {
      const character = createMockCharacter();
      const interaction = createMockInteraction({
        groups: [{
          conditions: [{ type: 'item', itemId: 'potion', value: 5 }]
        }]
      });

      const result = PrerequisiteValidator.validatePrerequisites(interaction, character);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'item')).toBe(true);
    });
  });

  describe('validateAlignmentCondition', () => {
    test('should validate alignment with new Alignment value object', () => {
      const character = createMockCharacter();
      const condition = { type: 'alignment', axisId: 'moral', value: 40, operator: '>=' };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(true);
    });

    test('should handle different alignment operators', () => {
      const character = createMockCharacter();
      
      const conditions = [
        { type: 'alignment', axisId: 'moral', value: 40, operator: '>=' },
        { type: 'alignment', axisId: 'moral', value: 60, operator: '<=' },
        { type: 'alignment', axisId: 'moral', value: 50, operator: '==' }
      ];

      conditions.forEach(condition => {
        const result = PrerequisiteValidator.validateCondition(condition, character);
        expect(result.isValid).toBe(true);
      });
    });

    test('should handle legacy alignment system', () => {
      const character = createMockCharacter({
        alignment: { playerAlignment: { moral: 75 } }
      });
      const condition = { type: 'alignment', axisId: 'moral', value: 50 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateInfluenceCondition', () => {
    test('should validate influence with new Influence value object', () => {
      const character = createMockCharacter();
      const condition = { type: 'influence', domainId: 'political', value: 20 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(true);
    });

    test('should handle unknown influence domain', () => {
      const character = createMockCharacter();
      const condition = { type: 'influence', domainId: 'unknown', value: 20 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('Unknown influence domain');
    });

    test('should handle legacy influence system', () => {
      const character = createMockCharacter({
        influence: { playerInfluence: { political: 30 } }
      });
      const condition = { type: 'influence', domainId: 'political', value: 25 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePrestigeCondition', () => {
    test('should validate prestige with new Prestige value object', () => {
      const character = createMockCharacter();
      const condition = { type: 'prestige', trackId: 'military', value: 25 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(true);
    });

    test('should handle unknown prestige track', () => {
      const character = createMockCharacter();
      const condition = { type: 'prestige', trackId: 'unknown', value: 25 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('Unknown prestige track');
    });

    test('should handle legacy prestige system', () => {
      const character = createMockCharacter({
        prestige: { playerPrestige: { military: 40 } }
      });
      const condition = { type: 'prestige', trackId: 'military', value: 35 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePersonalityCondition', () => {
    test('should validate personality traits', () => {
      const character = createMockCharacter();
      const condition = { type: 'personality', traitId: 'courage', value: 50 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(true);
    });

    test('should handle missing personality data', () => {
      const character = createMockCharacter({ personality: null });
      const condition = { type: 'personality', traitId: 'courage', value: 50 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('no personality data');
    });

    test('should handle different personality operators', () => {
      const character = createMockCharacter();
      const conditions = [
        { type: 'personality', traitId: 'courage', value: 50, operator: '>=' },
        { type: 'personality', traitId: 'courage', value: 80, operator: '<=' },
        { type: 'personality', traitId: 'courage', value: 75, operator: '==' }
      ];

      conditions.forEach(condition => {
        const result = PrerequisiteValidator.validateCondition(condition, character);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateRacialCondition', () => {
    test('should validate race requirements', () => {
      const character = createMockCharacter();
      const condition = { type: 'racial', raceId: 'human' };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(true);
    });

    test('should validate subrace requirements', () => {
      const character = createMockCharacter();
      const condition = { type: 'racial', raceId: 'human', subraceId: 'variant' };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(true);
    });

    test('should reject wrong race', () => {
      const character = createMockCharacter();
      const condition = { type: 'racial', raceId: 'elf' };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('Requires race elf');
    });

    test('should handle missing racial data', () => {
      const character = createMockCharacter({ race: null });
      const condition = { type: 'racial', raceId: 'human' };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('no racial data');
    });
  });

  describe('validateHistoricalEvent', () => {
    test('should validate basic historical event', () => {
      const worldState = createMockWorldState();
      const event = new HistoricalEvent({
        id: 'test-event',
        name: 'Test Event',
        type: 'political',
        worldStateRequirements: []
      });

      const result = PrerequisiteValidator.validateHistoricalEvent(event, worldState);

      expect(result.isValid).toBe(true);
    });

    test('should return invalid for missing inputs', () => {
      const result = PrerequisiteValidator.validateHistoricalEvent(null, null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('required');
    });

    test('should validate population requirements', () => {
      const worldState = createMockWorldState({
        settlements: [{ id: 'small', type: 'village', population: 100 }]
      });
      const event = new HistoricalEvent({
        id: 'test-event',
        worldStateRequirements: [
          { type: 'population', minPopulation: 5000 }
        ]
      });

      const result = PrerequisiteValidator.validateHistoricalEvent(event, worldState);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'population')).toBe(true);
    });

    test('should validate settlement count requirements', () => {
      const worldState = createMockWorldState({
        settlements: [{ id: 'only-one', type: 'town', population: 1000 }]
      });
      const event = new HistoricalEvent({
        id: 'test-event',
        worldStateRequirements: [
          { type: 'settlement_count', minCount: 3 }
        ]
      });

      const result = PrerequisiteValidator.validateHistoricalEvent(event, worldState);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'settlements')).toBe(true);
    });

    test('should validate global condition requirements', () => {
      const worldState = createMockWorldState({
        globalConditions: new Map([['stability', 25]])
      });
      const event = new HistoricalEvent({
        id: 'test-event',
        worldStateRequirements: [
          { type: 'global_condition', condition: 'stability', minValue: 50 }
        ]
      });

      const result = PrerequisiteValidator.validateHistoricalEvent(event, worldState);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'globalCondition')).toBe(true);
    });

    test('should validate temporal constraints', () => {
      const worldState = createMockWorldState();
      const event = new HistoricalEvent({
        id: 'test-event',
        isActive: false
      });

      const result = PrerequisiteValidator.validateHistoricalEvent(event, worldState);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'temporal')).toBe(true);
    });

    test('should validate event duration expiry', () => {
      const worldState = createMockWorldState({
        currentTime: new Date('2024-01-02')
      });
      const event = new HistoricalEvent({
        id: 'test-event',
        timestamp: new Date('2024-01-01'),
        duration: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
        isActive: true
      });

      const result = PrerequisiteValidator.validateHistoricalEvent(event, worldState);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'temporal')).toBe(true);
    });
  });

  describe('validateCharacterAction', () => {
    const mockAction = {
      id: 'test-action',
      type: 'combat',
      description: 'Attack enemy',
      prerequisites: []
    };

    const mockContext = {
      location: 'battlefield',
      participants: ['enemy1'],
      circumstances: new Map([['weather', 'clear']])
    };

    test('should validate basic character action', () => {
      const character = createMockCharacter();

      const result = PrerequisiteValidator.validateCharacterAction(mockAction, character, mockContext);

      expect(result.isValid).toBe(true);
    });

    test('should return invalid for missing inputs', () => {
      const result = PrerequisiteValidator.validateCharacterAction(null, null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('required');
    });

    test('should validate character state', () => {
      const character = createMockCharacter({ id: null });

      const result = PrerequisiteValidator.validateCharacterAction(mockAction, character, mockContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'character')).toBe(true);
    });

    test('should reject actions for inactive characters', () => {
      const character = createMockCharacter({ status: 'dead' });

      const result = PrerequisiteValidator.validateCharacterAction(mockAction, character, mockContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'character.status')).toBe(true);
    });

    test('should validate action context', () => {
      const character = createMockCharacter();
      const actionRequiringParticipants = {
        ...mockAction,
        requiresParticipants: true
      };
      const emptyContext = {
        location: 'battlefield',
        participants: [],
        circumstances: new Map()
      };

      const result = PrerequisiteValidator.validateCharacterAction(
        actionRequiringParticipants, 
        character, 
        emptyContext
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'context.participants')).toBe(true);
    });

    test('should handle missing context gracefully', () => {
      const character = createMockCharacter();

      const result = PrerequisiteValidator.validateCharacterAction(mockAction, character);

      expect(result.isValid).toBe(true);
    });
  });

  describe('error handling', () => {
    test('should handle validation errors gracefully', () => {
      const character = createMockCharacter({
        alignment: null // This will cause an error in alignment validation
      });
      const condition = { type: 'alignment', axisId: 'moral', value: 50 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('current is 0');
    });

    test('should handle unknown condition types', () => {
      const character = createMockCharacter();
      const condition = { type: 'unknown_type', value: 50 };

      const result = PrerequisiteValidator.validateCondition(condition, character);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('Unknown condition type');
    });
  });

  describe('integration tests', () => {
    test('should validate complex multi-condition prerequisites', () => {
      const character = createMockCharacter();
      const interaction = createMockInteraction({
        groups: [
          {
            conditions: [
              { type: 'level', value: 3 },
              { type: 'alignment', axisId: 'moral', value: 25, operator: '>=' },
              { type: 'influence', domainId: 'political', value: 20 },
              { type: 'prestige', trackId: 'military', value: 25 }
            ]
          }
        ]
      });

      const result = PrerequisiteValidator.validatePrerequisites(interaction, character);

      expect(result.isValid).toBe(true);
    });

    test('should handle OR logic between prerequisite groups', () => {
      const character = createMockCharacter({ level: 1 }); // Fails first group
      const interaction = createMockInteraction({
        groups: [
          {
            conditions: [{ type: 'level', value: 10 }] // This will fail
          },
          {
            conditions: [{ type: 'skill', skillId: 'swordsmanship', value: 5 }] // This will pass
          }
        ]
      });

      const result = PrerequisiteValidator.validatePrerequisites(interaction, character);

      expect(result.isValid).toBe(true);
    });

    test('should validate complete historical event scenario', () => {
      const worldState = createMockWorldState({
        settlements: [
          { id: 'capital', type: 'city', population: 10000 },
          { id: 'town1', type: 'town', population: 2000 },
          { id: 'town2', type: 'town', population: 1500 }
        ],
        globalConditions: new Map([
          ['stability', 80],
          ['prosperity', 60],
          ['military_strength', 70]
        ])
      });

      const event = new HistoricalEvent({
        id: 'major-war',
        name: 'The Great War',
        type: 'military',
        worldStateRequirements: [
          { type: 'population', minPopulation: 10000 },
          { type: 'settlement_count', minCount: 2 },
          { type: 'global_condition', condition: 'military_strength', minValue: 50 }
        ],
        isActive: true,
        duration: 0 // No expiry
      });

      const result = PrerequisiteValidator.validateHistoricalEvent(event, worldState);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});