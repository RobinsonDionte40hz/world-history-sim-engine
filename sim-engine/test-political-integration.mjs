// Test script to verify political career progression integration
import EfficientTurnProcessor from './src/domain/services/EfficientTurnProcessor.js';
import PoliticalTrackingService from './src/domain/services/PoliticalTrackingService.js';
import BehavioralStateService from './src/domain/services/BehavioralStateService.js';
import EventSignificanceService from './src/domain/services/EventSignificanceService.js';
import ConsciousnessUpdateService from './src/domain/services/ConsciousnessUpdateService.js';
import SignificantMemoryService from './src/domain/services/SignificantMemoryService.js';

console.log('Testing Political Career Progression Integration...');

try {
    // Create mock services
    const politicalTrackingService = new PoliticalTrackingService();
    const behavioralStateService = new BehavioralStateService();
    const eventSignificanceService = new EventSignificanceService();
    const consciousnessUpdateService = new ConsciousnessUpdateService();
    const significantMemoryService = new SignificantMemoryService();

    // Create processor with political tracking
    const processor = new EfficientTurnProcessor({
        politicalTrackingService,
        behavioralStateService,
        eventSignificanceService,
        consciousnessUpdateService,
        significantMemoryService
    });

    console.log('✅ EfficientTurnProcessor created successfully with political tracking service');

    // Test political significance evaluation
    const mockCharacter = {
        id: 'test-char',
        name: 'Test Character',
        politicalStatus: { position: 'specialist' }
    };

    const mockEvent = {
        type: 'diplomatic_action',
        success: true
    };

    const mockWorldState = {};

    const significance = processor._evaluatePoliticalSignificance(mockCharacter, mockEvent, mockWorldState);

    console.log('✅ Political significance evaluation working:', significance);

    // Test position multiplier
    const multiplier = processor._getPoliticalPositionMultiplier('leader');
    console.log('✅ Position multiplier working:', multiplier);

    console.log('🎉 All political career progression integration tests passed!');

} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}