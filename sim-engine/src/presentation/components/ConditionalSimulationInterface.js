/**
 * @deprecated ConditionalSimulationInterface has been merged into WorldHistorySimInterface
 * This file is kept for backward compatibility but will be removed in a future version.
 * Please use WorldHistorySimInterface instead.
 */

// Re-export the unified interface for backward compatibility
import WorldHistorySimInterface from './WorldHistorySimInterface.js';

const ConditionalSimulationInterface = WorldHistorySimInterface;

export default ConditionalSimulationInterface;