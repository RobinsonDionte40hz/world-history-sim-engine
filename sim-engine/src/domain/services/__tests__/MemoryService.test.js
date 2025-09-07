// src/domain/services/__tests__/MemoryService.test.js

import MemoryService from '../MemoryService.js';

// Mock Character class for testing
class MockCharacter {
  constructor(id, name, config = {}) {
    this.id = id;
    this.name = name;
    this.consciousness = config.consciousness || { coherence: 0.8 };
    this.relationships = config.relationships || new Map();
    this.decisionHistory = config.decisionHistory || [];
  }
}

describe('MemoryService Relationship Management', () => {
  let memoryService;
  let testCharacter;

  beforeEach(() => {
    memoryService = new MemoryService();
    testCharacter = new MockCharacter('test-char', 'Test Character', {
      consciousness: { coherence: 0.8 },
      relationships: new Map(),
      decisionHistory: []
    });
  });

  describe('updateRelationship', () => {
    it('should initialize relationships map if not exists', () => {
      const targetId = 'target-char';
      memoryService.updateRelationship(testCharacter, targetId, 'positive');

      expect(testCharacter.relationships).toBeDefined();
      expect(testCharacter.relationships.has(targetId)).toBe(true);
    });

    it('should update bond value for positive interaction', () => {
      const targetId = 'target-char';
      const initialBond = testCharacter.relationships?.get(targetId)?.value || 0;

      memoryService.updateRelationship(testCharacter, targetId, 'positive');

      const updatedBond = testCharacter.relationships.get(targetId);
      expect(updatedBond.value).toBeGreaterThan(initialBond);
      expect(updatedBond.type).toBeDefined();
      expect(updatedBond.history).toHaveLength(1);
    });

    it('should update bond value for negative interaction', () => {
      const targetId = 'target-char';
      const initialBond = testCharacter.relationships?.get(targetId)?.value || 0;

      memoryService.updateRelationship(testCharacter, targetId, 'negative');

      const updatedBond = testCharacter.relationships.get(targetId);
      expect(updatedBond.value).toBeLessThan(initialBond);
      expect(updatedBond.history).toHaveLength(1);
    });

    it('should maintain bond value within bounds', () => {
      const targetId = 'target-char';

      // Set initial bond to near maximum
      testCharacter.relationships = new Map();
      testCharacter.relationships.set(targetId, {
        value: 95,
        type: 'close_friend',
        history: []
      });

      memoryService.updateRelationship(testCharacter, targetId, 'positive');

      const updatedBond = testCharacter.relationships.get(targetId);
      expect(updatedBond.value).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateRelationshipType', () => {
    it('should return correct basic relationship types for different values', () => {
      expect(memoryService.calculateRelationshipType(70)).toBe('close_friend');
      expect(memoryService.calculateRelationshipType(40)).toBe('friend');
      expect(memoryService.calculateRelationshipType(20)).toBe('acquaintance');
      expect(memoryService.calculateRelationshipType(0)).toBe('neutral');
      expect(memoryService.calculateRelationshipType(-20)).toBe('dislike');
      expect(memoryService.calculateRelationshipType(-40)).toBe('enemy');
      expect(memoryService.calculateRelationshipType(-70)).toBe('hostile');
    });

    it('should return romantic relationship types when romantic history exists', () => {
      const romanticHistory = [
        { reason: 'romantic dinner date' },
        { reason: 'courtship interaction' }
      ];

      expect(memoryService.calculateRelationshipType(90, romanticHistory)).toBe('married');
      expect(memoryService.calculateRelationshipType(80, romanticHistory)).toBe('engaged');
      expect(memoryService.calculateRelationshipType(70, romanticHistory)).toBe('romantic_partner');
      expect(memoryService.calculateRelationshipType(55, romanticHistory)).toBe('romantic_interest');
      expect(memoryService.calculateRelationshipType(35, romanticHistory)).toBe('dating');
      expect(memoryService.calculateRelationshipType(20, romanticHistory)).toBe('flirting');
    });

    it('should return family relationship types when family history exists', () => {
      const familyHistory = [
        { reason: 'family gathering' },
        { reason: 'parent-child interaction' }
      ];

      expect(memoryService.calculateRelationshipType(80, familyHistory)).toBe('close_family');
      expect(memoryService.calculateRelationshipType(50, familyHistory)).toBe('family');
      expect(memoryService.calculateRelationshipType(20, familyHistory)).toBe('distant_family');
      expect(memoryService.calculateRelationshipType(-20, familyHistory)).toBe('estranged_family');
    });

    it('should return professional relationship types when business history exists', () => {
      const businessHistory = [
        { reason: 'business trade' },
        { reason: 'professional meeting' }
      ];

      expect(memoryService.calculateRelationshipType(70, businessHistory)).toBe('trusted_colleague');
      expect(memoryService.calculateRelationshipType(40, businessHistory)).toBe('colleague');
      expect(memoryService.calculateRelationshipType(15, businessHistory)).toBe('acquaintance');
      expect(memoryService.calculateRelationshipType(-10, businessHistory)).toBe('neutral');
      expect(memoryService.calculateRelationshipType(-30, businessHistory)).toBe('rival');
    });

    it('should return mentorship relationship types when teaching history exists', () => {
      const mentorshipHistory = [
        { reason: 'teaching apprentice' },
        { reason: 'learning from master' }
      ];

      expect(memoryService.calculateRelationshipType(80, mentorshipHistory)).toBe('mentor');
      expect(memoryService.calculateRelationshipType(60, mentorshipHistory)).toBe('student');
      expect(memoryService.calculateRelationshipType(30, mentorshipHistory)).toBe('apprentice');
      expect(memoryService.calculateRelationshipType(10, mentorshipHistory)).toBe('distant_mentor');
    });

    it('should fallback to basic types when no special history exists', () => {
      const emptyHistory = [];
      const neutralHistory = [{ reason: 'casual conversation' }];

      expect(memoryService.calculateRelationshipType(70, emptyHistory)).toBe('close_friend');
      expect(memoryService.calculateRelationshipType(70, neutralHistory)).toBe('close_friend');
    });
  });

  describe('relationship type detection methods', () => {
    it('should detect romantic compatibility from interaction history', () => {
      expect(memoryService.hasRomanticCompatibility([
        { reason: 'romantic dinner date' }
      ])).toBe(true);

      expect(memoryService.hasRomanticCompatibility([
        { reason: 'courtship interaction' }
      ])).toBe(true);

      expect(memoryService.hasRomanticCompatibility([
        { reason: 'casual conversation' }
      ])).toBe(false);
    });

    it('should detect family relationships from interaction history', () => {
      expect(memoryService.isFamilyRelationship([
        { reason: 'family gathering' }
      ])).toBe(true);

      expect(memoryService.isFamilyRelationship([
        { reason: 'parent-child interaction' }
      ])).toBe(true);

      expect(memoryService.isFamilyRelationship([
        { reason: 'casual conversation' }
      ])).toBe(false);
    });

    it('should detect professional relationships from interaction history', () => {
      expect(memoryService.isProfessionalRelationship([
        { reason: 'business trade' }
      ])).toBe(true);

      expect(memoryService.isProfessionalRelationship([
        { reason: 'professional meeting' }
      ])).toBe(true);

      expect(memoryService.isProfessionalRelationship([
        { reason: 'casual conversation' }
      ])).toBe(false);
    });

    it('should detect mentorship relationships from interaction history', () => {
      expect(memoryService.isMentorshipRelationship([
        { reason: 'teaching apprentice' }
      ])).toBe(true);

      expect(memoryService.isMentorshipRelationship([
        { reason: 'learning from master' }
      ])).toBe(true);

      expect(memoryService.isMentorshipRelationship([
        { reason: 'casual conversation' }
      ])).toBe(false);
    });
  });

  describe('integration with existing memory system', () => {
    it('should use retention strength for bond calculations', () => {
      const targetId = 'target-char';

      // Mock a high coherence character for stronger retention
      testCharacter.consciousness.coherence = 0.9;

      memoryService.updateRelationship(testCharacter, targetId, 'positive');

      const bond = testCharacter.relationships.get(targetId);
      expect(bond.value).toBeGreaterThan(0);
      expect(bond.history[0].change).toBeGreaterThan(0);
    });
  });
});
