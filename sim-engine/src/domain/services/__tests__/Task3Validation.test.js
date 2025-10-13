// src/domain/services/__tests__/Task3Validation.test.js

import { PoliticalEvent } from '../../entities/PoliticalEvent.js';
import { PoliticalRelationship } from '../../value-objects/PoliticalRelationship.js';
import { PoliticalTrackingService } from '../PoliticalTrackingService.js';
import { Settlement } from '../../entities/Settlement.js';

describe('Task 3 Validation: Political System Data Tracking', () => {
  let trackingService;
  let testSettlement1;
  let testSettlement2;
  let testLeader1;

  beforeEach(() => {
    trackingService = new PoliticalTrackingService();

    testSettlement1 = {
      id: 'settlement-1',
      name: 'Test Kingdom',
      type: 'kingdom'
    };

    testSettlement2 = {
      id: 'settlement-2',
      name: 'Neighbor Republic',
      type: 'republic'
    };

    testLeader1 = {
      id: 'leader-1',
      name: 'King Arthur'
    };
  });

  test('should create leadership change political event', () => {
    const event = PoliticalEvent.createLeadershipChange(
      testSettlement1,
      null,
      testLeader1,
      'founding'
    );

    expect(event).toBeDefined();
    expect(event.type).toBe('leadership_change');
    expect(event.participants).toContain(testLeader1);
    expect(event.settlements).toContain(testSettlement1);
    expect(event.significance).toBeGreaterThan(0);
    expect(event.leadershipChange.newLeaderId).toBe(testLeader1.id);
    expect(event.leadershipChange.reason).toBe('founding');
  });

  test('should create diplomatic shift political event', () => {
    const event = PoliticalEvent.createDiplomaticShift(
      testSettlement1,
      testSettlement2,
      'neutral',
      'allied',
      'mutual defense treaty'
    );

    expect(event).toBeDefined();
    expect(event.type).toBe('diplomatic_shift');
    expect(event.settlements).toContain(testSettlement1);
    expect(event.settlements).toContain(testSettlement2);
    expect(event.significance).toBeGreaterThan(0);
    expect(event.diplomaticShift.oldStatus).toBe('neutral');
    expect(event.diplomaticShift.newStatus).toBe('allied');
  });

  test('should calculate event significance correctly', () => {
    const significance = PoliticalEvent.calculateSignificance(
      [testLeader1],
      [testSettlement1],
      'local',
      [{ type: 'major_change' }]
    );

    expect(significance).toBeGreaterThan(0);
    expect(significance).toBeLessThanOrEqual(100);
  });

  test('should create and manage political relationships', () => {
    const relationship = new PoliticalRelationship({
      settlement1Id: testSettlement1.id,
      settlement2Id: testSettlement2.id,
      status: 'neutral',
      trustLevel: 50
    });

    expect(relationship).toBeDefined();
    expect(relationship.status).toBe('neutral');
    expect(relationship.trustLevel).toBe(50);
    expect(relationship.isPositive()).toBe(false);
    expect(relationship.allowsTrade()).toBe(true);

    // Test status change
    const updatedRelationship = relationship.changeStatus('allied', 'treaty signing');
    expect(updatedRelationship.status).toBe('allied');
    expect(updatedRelationship.statusHistory.length).toBe(1);
    expect(updatedRelationship.isPositive()).toBe(true);
  });

  test('should track leadership changes through PoliticalTrackingService', () => {
    const event = trackingService.recordLeadershipChange(
      testSettlement1,
      null,
      testLeader1,
      'founding'
    );

    expect(event).toBeDefined();
    expect(event.type).toBe('leadership_change');

    // Check leadership history
    const history = trackingService.getLeadershipHistory(testSettlement1.id);
    expect(history.length).toBe(1);
    expect(history[0].newLeaderId).toBe(testLeader1.id);
    expect(history[0].reason).toBe('founding');
  });

  test('should track diplomatic relationships through PoliticalTrackingService', () => {
    const event = trackingService.updateDiplomaticRelationship(
      testSettlement1,
      testSettlement2,
      'allied',
      'mutual defense treaty'
    );

    expect(event).toBeDefined();
    expect(event.type).toBe('diplomatic_shift');

    // Check diplomatic relationship
    const relationship = trackingService.getDiplomaticRelationship(
      testSettlement1.id,
      testSettlement2.id
    );
    expect(relationship).toBeDefined();
    expect(relationship.status).toBe('allied');

    // Check diplomatic history
    const history = trackingService.getDiplomaticHistory(
      testSettlement1.id,
      testSettlement2.id
    );
    expect(history.length).toBe(1);
    expect(history[0].to).toBe('allied');
  });

  test('should query political events with filters', () => {
    // Create multiple events
    trackingService.recordLeadershipChange(testSettlement1, null, testLeader1, 'founding');
    trackingService.updateDiplomaticRelationship(testSettlement1, testSettlement2, 'allied', 'treaty');

    // Query all events
    const allEvents = trackingService.getPoliticalEvents();
    expect(allEvents.length).toBe(2);

    // Query by type
    const leadershipEvents = trackingService.getPoliticalEvents({ type: 'leadership_change' });
    expect(leadershipEvents.length).toBe(1);
    expect(leadershipEvents[0].type).toBe('leadership_change');

    // Query by settlement
    const settlementEvents = trackingService.getPoliticalEvents({ settlementId: testSettlement1.id });
    expect(settlementEvents.length).toBe(2);
  });

  test('should validate Settlement entity political data structures', () => {
    // Test that the Settlement schema includes political structures
    expect(Settlement.politics).toBeDefined();
    expect(Settlement.politics.politicalHistory).toBeDefined();
    expect(Settlement.politics.diplomaticRelationships).toBeDefined();
    expect(Settlement.politics.leadershipHistory).toBeDefined();
    expect(Settlement.politics.governmentEffectiveness).toBeDefined();

    // Test political history structure
    const politicalHistoryItem = Settlement.politics.politicalHistory[0];
    expect(politicalHistoryItem.eventId).toBe(String);
    expect(politicalHistoryItem.timestamp).toBe(Number);
    expect(politicalHistoryItem.significance).toBe(Number);

    // Test diplomatic relationships structure
    const diplomaticRelationship = Settlement.politics.diplomaticRelationships[0];
    expect(diplomaticRelationship.targetSettlementId).toBe(String);
    expect(diplomaticRelationship.status).toBe(String);
    expect(diplomaticRelationship.trustLevel).toBe(Number);

    // Test leadership history structure
    const leadershipRecord = Settlement.politics.leadershipHistory[0];
    expect(leadershipRecord.leaderId).toBe(String);
    expect(leadershipRecord.tenure).toBe(Number);
    expect(leadershipRecord.achievements).toBeDefined();

    // Test government effectiveness structure
    const effectiveness = Settlement.politics.governmentEffectiveness;
    expect(effectiveness.stability).toBe(Number);
    expect(effectiveness.policySuccess).toBe(Number);
    expect(effectiveness.history).toBeDefined();
  });

  test('should handle relationship key generation consistently', () => {
    const relationship1 = new PoliticalRelationship({
      settlement1Id: 'A',
      settlement2Id: 'B'
    });

    const relationship2 = new PoliticalRelationship({
      settlement1Id: 'B',
      settlement2Id: 'A'
    });

    expect(relationship1.getRelationshipKey()).toBe(relationship2.getRelationshipKey());
  });

  test('should calculate relationship stability correctly', () => {
    const relationship = new PoliticalRelationship({
      settlement1Id: testSettlement1.id,
      settlement2Id: testSettlement2.id,
      status: 'allied',
      trustLevel: 80,
      economicTies: 50,
      treaties: [{ isActive: true }]
    });

    const stability = relationship.getStability();
    expect(stability).toBeGreaterThan(50); // Should be higher than base due to positive factors
    expect(stability).toBeLessThanOrEqual(100);
  });
});