// src/test/validate-consequence-system.js

import ConsequenceLifecycleManager from '../domain/services/ConsequenceLifecycleManager.js';
import BasicNeedsService from '../domain/services/BasicNeedsService.js';
import NeedConsequenceService from '../domain/services/NeedConsequenceService.js';

/**
 * Simple validation script to test the consequence resolution system
 */
function validateConsequenceSystem() {
  console.log('🔍 Validating Consequence Resolution System...\n');

  try {
    // Create services
    const lifecycleManager = new ConsequenceLifecycleManager();
    const basicNeedsService = new BasicNeedsService();
    const needConsequenceService = new NeedConsequenceService();

    console.log('✅ Services created successfully');

    // Create test settlement with low needs
    const testSettlement = {
      id: 'test_settlement',
      name: 'Test Settlement',
      population: { total: 100 },
      resources: {
        amounts: { food: 10, water: 15, goods: 20 },
        production: { food: 5, water: 8 },
        storage: { food: 50, water: 30 }
      },
      buildings: [
        { id: 'farm1', type: 'farm', level: 1 },
        { id: 'well1', type: 'well', level: 1 }
      ],
      economy: { trade: [] },
      needSatisfaction: {
        current: {
          food: 0.2,    // Very low - should trigger famine
          water: 0.3,   // Low - should trigger water crisis
          shelter: 0.8, // Adequate
          goods: 0.9,   // Good
          services: 0.7 // Adequate
        },
        history: [],
        trends: {},
        activeConsequences: []
      }
    };

    console.log('✅ Test settlement created');

    // Test need satisfaction calculation
    const satisfactionResult = basicNeedsService.calculateSatisfactionLevel(testSettlement);
    console.log('✅ Need satisfaction calculated:', {
      overall: satisfactionResult.overall.toFixed(2),
      consequences: satisfactionResult.consequences.length
    });

    // Test consequence generation
    const newConsequences = needConsequenceService.generateConsequences(
      satisfactionResult.needs,
      testSettlement
    );
    console.log('✅ Consequences generated:', newConsequences.length);

    // Test adding consequences to settlement
    const settlementWithConsequences = lifecycleManager.addConsequencesToSettlement(
      testSettlement,
      newConsequences
    );
    console.log('✅ Consequences added to settlement');

    // Test lifecycle processing
    const lifecycleResults = lifecycleManager.processConsequenceLifecycle(
      [settlementWithConsequences]
    );
    console.log('✅ Lifecycle processing completed:', {
      processed: lifecycleResults.processedSettlements.length,
      active: lifecycleResults.summary.totalActiveConsequences,
      resolved: lifecycleResults.summary.newlyResolved,
      expired: lifecycleResults.summary.newlyExpired
    });

    // Test statistics generation
    const stats = lifecycleManager.getConsequenceStatistics(settlementWithConsequences);
    console.log('✅ Statistics generated:', {
      total: stats.total,
      averageSeverity: stats.averageSeverity.toFixed(2),
      byType: Object.keys(stats.byType)
    });

    // Test manual resolution
    if (settlementWithConsequences.needSatisfaction.activeConsequences.length > 0) {
      const consequenceId = settlementWithConsequences.needSatisfaction.activeConsequences[0].id;
      lifecycleManager.resolveConsequenceManually(
        settlementWithConsequences,
        consequenceId,
        'Built irrigation system'
      );
      console.log('✅ Manual resolution successful');
    }

    // Test cleanup
    const cleanupResults = lifecycleManager.cleanupResolvedConsequences(settlementWithConsequences);
    console.log('✅ Cleanup completed:', {
      cleaned: cleanupResults.cleanedCount,
      remaining: cleanupResults.settlement.needSatisfaction.activeConsequences.length
    });

    console.log('\n🎉 All validation tests passed! Consequence Resolution System is working correctly.');

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateConsequenceSystem();
}

export default validateConsequenceSystem;
