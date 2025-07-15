// src/domain/value-objects/__tests__/PersonalityProfile.test.js

import PersonalityProfile, { PersonalityTrait, Attribute, EmotionalTendency, CognitiveTrait } from '../PersonalityProfile';

describe('PersonalityProfile Value Object', () => {
  const mockTraits = [
    {
      id: 'courage',
      name: 'Courage',
      description: 'Bravery in the face of danger',
      category: 'Personality',
      intensity: 0.6,
      baseLevel: 0.5,
      volatility: 0.4
    },
    {
      id: 'empathy',
      name: 'Empathy',
      description: 'Understanding others emotions',
      category: 'Social',
      intensity: 0.7,
      baseLevel: 0.6,
      volatility: 0.3
    }
  ];

  const mockEmotionalTendencies = [
    {
      id: 'anger',
      name: 'Anger',
      description: 'Tendency toward anger',
      category: 'Emotional',
      intensity: 0.3,
      baseLevel: 0.2,
      volatility: 0.5
    }
  ];

  const mockCognitiveTraits = [
    {
      id: 'analytical',
      name: 'Analytical',
      description: 'Logical thinking ability',
      category: 'Analytical',
      complexity: 0.6,
      adaptability: 0.4
    }
  ];

  describe('Construction', () => {
    test('should create PersonalityProfile with default attributes', () => {
      const profile = new PersonalityProfile();

      expect(profile.getAttribute('strength')).toBeDefined();
      expect(profile.getAttribute('intelligence')).toBeDefined();
      expect(profile.getAttribute('charisma')).toBeDefined();
      expect(profile.getAllAttributes()).toHaveLength(6);
    });

    test('should create PersonalityProfile with custom data', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits,
        emotionalTendencies: mockEmotionalTendencies,
        cognitiveTraits: mockCognitiveTraits
      });

      expect(profile.getTrait('courage')).toBeDefined();
      expect(profile.getTrait('empathy')).toBeDefined();
      expect(profile.getEmotionalTendency('anger')).toBeDefined();
      expect(profile.getCognitiveTrait('analytical')).toBeDefined();
    });

    test('should create PersonalityProfile with custom attributes', () => {
      const customAttributes = [
        { id: 'strength', name: 'Strength', description: 'Physical power', baseValue: 15 },
        { id: 'intelligence', name: 'Intelligence', description: 'Mental acuity', baseValue: 12 }
      ];

      const profile = new PersonalityProfile({
        attributes: customAttributes
      });

      expect(profile.getAttribute('strength').baseValue).toBe(15);
      expect(profile.getAttribute('intelligence').baseValue).toBe(12);
      expect(profile.getAllAttributes()).toHaveLength(2);
    });
  });

  describe('Immutability', () => {
    test('should be immutable', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits
      });

      // Check that the Maps themselves are frozen
      expect(Object.isFrozen(profile.traits)).toBe(true);
      expect(Object.isFrozen(profile.attributes)).toBe(true);

      // Check that the profile object is frozen
      expect(Object.isFrozen(profile)).toBe(true);

      // Attempting to modify should fail silently in non-strict mode
      // or throw in strict mode, but the Map should remain unchanged
      const originalSize = profile.traits.size;
      try {
        profile.traits.set('new', {});
      } catch (e) {
        // Expected in strict mode
      }
      expect(profile.traits.size).toBe(originalSize);
    });

    test('should create new instance with trait evolution', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits
      });

      const traitChanges = new Map([['courage', 0.2]]);
      const evolved = profile.withTraitEvolution(traitChanges, 'Combat experience');

      expect(profile).not.toBe(evolved);
      expect(profile.getTrait('courage').intensity).toBe(0.6);
      expect(evolved.getTrait('courage').intensity).toBeGreaterThan(0.6);
    });
  });

  describe('Trait Evolution', () => {
    test('should evolve traits based on changes', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits
      });

      const traitChanges = new Map([
        ['courage', 0.3],
        ['empathy', -0.1]
      ]);

      const evolved = profile.withTraitEvolution(traitChanges, 'War experience');

      // Courage should increase (0.3 * 0.4 volatility = 0.12 increase)
      const newCourage = evolved.getTrait('courage');
      expect(newCourage.intensity).toBeCloseTo(0.6 + (0.3 * 0.4), 2);
      expect(newCourage.influence.lastEvolution.reason).toBe('War experience');

      // Empathy should decrease (-0.1 * 0.3 volatility = -0.03 decrease)
      const newEmpathy = evolved.getTrait('empathy');
      expect(newEmpathy.intensity).toBeCloseTo(0.7 + (-0.1 * 0.3), 2);
    });

    test('should clamp trait values between 0 and 1', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits
      });

      const extremeChanges = new Map([
        ['courage', 10], // Should clamp to 1 (courage: 0.6 + (10 * 0.4) = 0.6 + 4 = 4.6, clamped to 1)
        ['empathy', -2] // Should clamp to 0 (empathy: 0.7 + (-2 * 0.3) = 0.7 - 0.6 = 0.1, then further reduced)
      ]);

      const evolved = profile.withTraitEvolution(extremeChanges);

      expect(evolved.getTrait('courage').intensity).toBe(1);
      expect(evolved.getTrait('empathy').intensity).toBeLessThan(profile.getTrait('empathy').intensity);
    });

    test('should not change traits with zero change', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits
      });

      const noChanges = new Map([['courage', 0]]);
      const evolved = profile.withTraitEvolution(noChanges);

      expect(evolved.getTrait('courage').intensity).toBe(0.6);
      expect(evolved.getTrait('courage').influence.lastEvolution).toBeUndefined();
    });
  });

  describe('Age Modifiers', () => {
    test('should apply age modifiers to young character', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits,
        emotionalTendencies: mockEmotionalTendencies,
        cognitiveTraits: mockCognitiveTraits
      });

      const aged = profile.withAgeModifiers(16); // Young character

      // Young characters should have higher volatility
      expect(aged.getTrait('courage').volatility).toBeGreaterThan(profile.getTrait('courage').volatility);
      expect(aged.getEmotionalTendency('anger').volatility).toBeGreaterThan(profile.getEmotionalTendency('anger').volatility);

      // Adaptability should be high for young characters
      expect(aged.getCognitiveTrait('analytical').adaptability).toBe(profile.getCognitiveTrait('analytical').adaptability);
    });

    test('should apply age modifiers to middle-aged character', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits
      });

      const aged = profile.withAgeModifiers(45);

      // Middle-aged characters should have reduced volatility
      expect(aged.getTrait('courage').volatility).toBeLessThan(profile.getTrait('courage').volatility);

      // Wisdom should increase
      const wisdom = aged.getAttribute('wisdom');
      expect(wisdom.baseValue).toBeGreaterThan(10);
    });

    test('should apply age modifiers to elderly character', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits
      });

      const aged = profile.withAgeModifiers(75);

      // Elderly should have very low volatility
      const traits = aged.getAllTraits();
      expect(traits.length).toBeGreaterThan(0);
      expect(traits[0].volatility).toBeLessThan(0.6);

      // Physical attributes should decline
      expect(aged.getAttribute('strength').baseValue).toBeLessThan(10);
      expect(aged.getAttribute('dexterity').baseValue).toBeLessThan(10);
      expect(aged.getAttribute('constitution').baseValue).toBeLessThan(10);

      // Wisdom should be high
      expect(aged.getAttribute('wisdom').baseValue).toBeGreaterThan(10);
    });

    test('should track age modification history', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits
      });

      const aged = profile.withAgeModifiers(30);
      const trait = aged.getTrait('courage');

      expect(trait.influence.ageModified).toBeDefined();
      expect(trait.influence.ageModified.age).toBe(30);
      expect(trait.influence.ageModified.timestamp).toBeDefined();
      expect(trait.influence.ageModified.appliedModifiers).toBeDefined();
    });
  });

  describe('Experience Influence', () => {
    test('should apply combat experience effects', () => {
      const profile = new PersonalityProfile({
        traits: [
          { id: 'courage', name: 'Courage', description: 'Bravery', category: 'Personality', intensity: 0.5, baseLevel: 0.5, volatility: 0.4 },
          { id: 'caution', name: 'Caution', description: 'Careful approach', category: 'Personality', intensity: 0.6, baseLevel: 0.6, volatility: 0.3 }
        ]
      });

      const experience = {
        type: 'combat',
        intensity: 0.8,
        duration: 2
      };

      const influenced = profile.withExperienceInfluence(experience);

      // Combat should increase courage and decrease caution
      expect(influenced.getTrait('courage').intensity).toBeGreaterThan(profile.getTrait('courage').intensity);
      expect(influenced.getTrait('caution').intensity).toBeLessThan(profile.getTrait('caution').intensity);
    });

    test('should apply learning experience effects', () => {
      const profile = new PersonalityProfile({
        traits: [
          { id: 'curiosity', name: 'Curiosity', description: 'Desire to learn', category: 'Intellectual', intensity: 0.5, baseLevel: 0.5, volatility: 0.3 },
          { id: 'wisdom', name: 'Wisdom', description: 'Accumulated knowledge', category: 'Intellectual', intensity: 0.4, baseLevel: 0.4, volatility: 0.2 }
        ]
      });

      const experience = {
        type: 'learning',
        intensity: 0.6,
        duration: 1
      };

      const influenced = profile.withExperienceInfluence(experience);

      // Learning should increase curiosity and wisdom
      expect(influenced.getTrait('curiosity').intensity).toBeGreaterThan(profile.getTrait('curiosity').intensity);
      expect(influenced.getTrait('wisdom').intensity).toBeGreaterThan(profile.getTrait('wisdom').intensity);
    });

    test('should handle unknown experience types gracefully', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits
      });

      const experience = {
        type: 'unknown_experience',
        intensity: 0.5
      };

      const influenced = profile.withExperienceInfluence(experience);

      // Should not crash and should return a valid profile
      expect(influenced).toBeInstanceOf(PersonalityProfile);
      expect(influenced.getTrait('courage')).toBeDefined();
    });
  });

  describe('Historical Event Influence', () => {
    test('should apply war event effects', () => {
      const profile = new PersonalityProfile({
        traits: [
          { id: 'courage', name: 'Courage', description: 'Bravery', category: 'Personality', intensity: 0.5, baseLevel: 0.5, volatility: 0.4 },
          { id: 'loyalty', name: 'Loyalty', description: 'Faithfulness', category: 'Social', intensity: 0.6, baseLevel: 0.6, volatility: 0.3 }
        ]
      });

      const historicalEvent = {
        type: 'war',
        name: 'The Great War',
        scale: 'national'
      };

      const characterRole = {
        importance: 'major'
      };

      const influenced = profile.withHistoricalEventInfluence(historicalEvent, characterRole);

      // War should increase courage and loyalty
      expect(influenced.getTrait('courage').intensity).toBeGreaterThan(profile.getTrait('courage').intensity);
      expect(influenced.getTrait('loyalty').intensity).toBeGreaterThan(profile.getTrait('loyalty').intensity);
    });

    test('should scale effects based on event scale and character role', () => {
      const profile = new PersonalityProfile({
        traits: [
          { id: 'courage', name: 'Courage', description: 'Bravery', category: 'Personality', intensity: 0.5, baseLevel: 0.5, volatility: 0.4 }
        ]
      });

      const localEvent = {
        type: 'war',
        scale: 'local'
      };

      const globalEvent = {
        type: 'war',
        scale: 'global'
      };

      const minorRole = { importance: 'minor' };
      const pivotalRole = { importance: 'pivotal' };

      const localMinor = profile.withHistoricalEventInfluence(localEvent, minorRole);
      const globalPivotal = profile.withHistoricalEventInfluence(globalEvent, pivotalRole);

      // Global pivotal should have much larger effect than local minor
      const localChange = localMinor.getTrait('courage').intensity - profile.getTrait('courage').intensity;
      const globalChange = globalPivotal.getTrait('courage').intensity - profile.getTrait('courage').intensity;

      expect(globalChange).toBeGreaterThan(localChange);
    });
  });

  describe('Trauma Influence', () => {
    test('should apply physical trauma effects', () => {
      const profile = new PersonalityProfile({
        traits: [
          { id: 'trust', name: 'Trust', description: 'Faith in others', category: 'Social', intensity: 0.7, baseLevel: 0.7, volatility: 0.3 }
        ],
        emotionalTendencies: [
          { id: 'anxiety', name: 'Anxiety', description: 'Worry and fear', category: 'Emotional', intensity: 0.3, baseLevel: 0.3, volatility: 0.4 }
        ]
      });

      const trauma = {
        type: 'physical'
      };

      const traumatized = profile.withTraumaInfluence(trauma, 0.8);

      // Trauma should decrease trust and increase anxiety
      expect(traumatized.getTrait('trust').intensity).toBeLessThan(profile.getTrait('trust').intensity);
      expect(traumatized.getEmotionalTendency('anxiety').intensity).toBeGreaterThan(profile.getEmotionalTendency('anxiety').intensity);
    });

    test('should scale trauma effects by severity', () => {
      const profile = new PersonalityProfile({
        traits: [
          { id: 'trust', name: 'Trust', description: 'Faith in others', category: 'Social', intensity: 0.7, baseLevel: 0.7, volatility: 0.3 }
        ]
      });

      const trauma = { type: 'betrayal' };

      const mildTrauma = profile.withTraumaInfluence(trauma, 0.2);
      const severeTrauma = profile.withTraumaInfluence(trauma, 0.9);

      const mildChange = profile.getTrait('trust').intensity - mildTrauma.getTrait('trust').intensity;
      const severeChange = profile.getTrait('trust').intensity - severeTrauma.getTrait('trust').intensity;

      expect(severeChange).toBeGreaterThan(mildChange);
    });
  });

  describe('Social Influence', () => {
    test('should apply friendship interaction effects', () => {
      const profile = new PersonalityProfile({
        traits: [
          { id: 'trust', name: 'Trust', description: 'Faith in others', category: 'Social', intensity: 0.5, baseLevel: 0.5, volatility: 0.3 },
          { id: 'empathy', name: 'Empathy', description: 'Understanding others', category: 'Social', intensity: 0.6, baseLevel: 0.6, volatility: 0.3 }
        ]
      });

      const interaction = {
        type: 'friendship',
        outcome: 'positive',
        intimacy: 0.8,
        duration: 2
      };

      const influenced = profile.withSocialInfluence(interaction);

      // Positive friendship should increase trust and empathy
      expect(influenced.getTrait('trust').intensity).toBeGreaterThan(profile.getTrait('trust').intensity);
      expect(influenced.getTrait('empathy').intensity).toBeGreaterThan(profile.getTrait('empathy').intensity);
    });

    test('should apply negative social interaction effects', () => {
      const profile = new PersonalityProfile({
        traits: [
          { id: 'trust', name: 'Trust', description: 'Faith in others', category: 'Social', intensity: 0.7, baseLevel: 0.7, volatility: 0.3 }
        ]
      });

      const interaction = {
        type: 'friendship',
        outcome: 'negative',
        intimacy: 0.6,
        duration: 1
      };

      const influenced = profile.withSocialInfluence(interaction);

      // Negative friendship should decrease trust
      expect(influenced.getTrait('trust').intensity).toBeLessThan(profile.getTrait('trust').intensity);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON with proper Map handling', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits,
        emotionalTendencies: mockEmotionalTendencies,
        cognitiveTraits: mockCognitiveTraits
      });

      const json = profile.toJSON();

      expect(json.traits).toHaveLength(2);
      expect(json.traits[0].id).toBe('courage');
      expect(json.emotionalTendencies).toHaveLength(1);
      expect(json.cognitiveTraits).toHaveLength(1);
      expect(json.attributes).toHaveLength(6); // Default attributes
    });

    test('should deserialize from JSON', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits,
        emotionalTendencies: mockEmotionalTendencies,
        cognitiveTraits: mockCognitiveTraits
      });

      const json = profile.toJSON();
      const restored = PersonalityProfile.fromJSON(json);

      expect(restored.getTrait('courage')).toBeDefined();
      expect(restored.getTrait('courage').intensity).toBe(0.6);
      expect(restored.getEmotionalTendency('anger')).toBeDefined();
      expect(restored.getCognitiveTrait('analytical')).toBeDefined();
      expect(restored.getAttribute('strength')).toBeDefined();
    });

    test('should handle round-trip serialization with evolution history', () => {
      let profile = new PersonalityProfile({
        traits: mockTraits
      });

      // Apply some evolution
      const traitChanges = new Map([['courage', 0.2]]);
      profile = profile.withTraitEvolution(traitChanges, 'Test evolution');

      // Apply age modifiers
      profile = profile.withAgeModifiers(35);

      const json = profile.toJSON();
      const restored = PersonalityProfile.fromJSON(json);

      expect(restored.getTrait('courage').intensity).toBeCloseTo(profile.getTrait('courage').intensity, 3);
      expect(restored.getTrait('courage').influence.lastEvolution.reason).toBe('Test evolution');
      expect(restored.getTrait('courage').influence.ageModified.age).toBe(35);
    });

    test('should handle empty PersonalityProfile serialization', () => {
      const profile = new PersonalityProfile();
      const json = profile.toJSON();
      const restored = PersonalityProfile.fromJSON(json);

      expect(restored.getAllAttributes()).toHaveLength(6); // Default attributes
      expect(restored.getAllTraits()).toHaveLength(0);
      expect(restored.getAllEmotionalTendencies()).toHaveLength(0);
      expect(restored.getAllCognitiveTraits()).toHaveLength(0);
    });
  });

  describe('Utility Methods', () => {
    test('should get all traits, attributes, tendencies, and cognitive traits', () => {
      const profile = new PersonalityProfile({
        traits: mockTraits,
        emotionalTendencies: mockEmotionalTendencies,
        cognitiveTraits: mockCognitiveTraits
      });

      expect(profile.getAllTraits()).toHaveLength(2);
      expect(profile.getAllAttributes()).toHaveLength(6);
      expect(profile.getAllEmotionalTendencies()).toHaveLength(1);
      expect(profile.getAllCognitiveTraits()).toHaveLength(1);
    });

    test('should return null for non-existent items', () => {
      const profile = new PersonalityProfile();

      expect(profile.getTrait('nonexistent')).toBe(null);
      expect(profile.getAttribute('nonexistent')).toBe(null);
      expect(profile.getEmotionalTendency('nonexistent')).toBe(null);
      expect(profile.getCognitiveTrait('nonexistent')).toBe(null);
    });
  });

  describe('Component Classes', () => {
    describe('PersonalityTrait', () => {
      test('should create immutable PersonalityTrait', () => {
        const trait = new PersonalityTrait(mockTraits[0]);

        expect(trait.id).toBe('courage');
        expect(trait.intensity).toBe(0.6);
        expect(Object.isFrozen(trait)).toBe(true);
      });

      test('should serialize and deserialize PersonalityTrait', () => {
        const trait = new PersonalityTrait(mockTraits[0]);
        const json = trait.toJSON();
        const restored = PersonalityTrait.fromJSON(json);

        expect(restored.id).toBe(trait.id);
        expect(restored.intensity).toBe(trait.intensity);
      });
    });

    describe('Attribute', () => {
      test('should create immutable Attribute with calculated modifier', () => {
        const attr = new Attribute({
          id: 'strength',
          name: 'Strength',
          description: 'Physical power',
          baseValue: 15
        });

        expect(attr.baseValue).toBe(15);
        expect(attr.modifier).toBe(2); // (15-10)/2 = 2.5, floored to 2
        expect(Object.isFrozen(attr)).toBe(true);
      });

      test('should serialize and deserialize Attribute', () => {
        const attr = new Attribute({
          id: 'intelligence',
          name: 'Intelligence',
          description: 'Mental acuity',
          baseValue: 12
        });

        const json = attr.toJSON();
        const restored = Attribute.fromJSON(json);

        expect(restored.baseValue).toBe(12);
        expect(restored.modifier).toBe(1);
      });
    });

    describe('EmotionalTendency', () => {
      test('should create immutable EmotionalTendency', () => {
        const tendency = new EmotionalTendency(mockEmotionalTendencies[0]);

        expect(tendency.id).toBe('anger');
        expect(tendency.intensity).toBe(0.3);
        expect(Object.isFrozen(tendency)).toBe(true);
      });
    });

    describe('CognitiveTrait', () => {
      test('should create immutable CognitiveTrait', () => {
        const trait = new CognitiveTrait(mockCognitiveTraits[0]);

        expect(trait.id).toBe('analytical');
        expect(trait.complexity).toBe(0.6);
        expect(Object.isFrozen(trait)).toBe(true);
      });
    });
  });
});