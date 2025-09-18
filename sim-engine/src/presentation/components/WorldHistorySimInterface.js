//  WorldHistorySimInterface.js - Proper turn data flow
import React, { useState, useEffect } from 'react';
import { useSimulationContext } from '../contexts/SimulationContext.js';

// Debug component to check data flow
const DebugDataFlow = ({ currentSimulationState, worldState, turnHistory, currentTurn }) => {
  console.log('=== DEBUG DATA FLOW ===');
  console.log('currentSimulationState:', currentSimulationState);
  console.log('worldState prop:', worldState);
  console.log('turnHistory:', turnHistory);
  console.log('currentTurn:', currentTurn);
  console.log('currentSimulationState events:', currentSimulationState?.events?.length || 0);
  console.log('worldState prop events:', worldState?.events?.length || 0);
  console.log('========================');

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-sm">
      <h4 className="font-bold">Debug Data Flow</h4>
      <div>Turn: {currentTurn}</div>
      <div>Sim State Events: {currentSimulationState?.events?.length || 0}</div>
      <div>World State Events: {worldState?.events?.length || 0}</div>
      <div>Turn History: {turnHistory?.length || 0}</div>
      <div>Has Sim State: {currentSimulationState ? '✓' : '✗'}</div>
    </div>
  );
};

const WorldHistorySimInterface = ({ 
  worldState, 
  simulationService,
}) => {
  // Use the simulation context hook instead of local state
  const { 
    isInitialized, 
    currentTurn, 
    canProcessTurn, 
    resetSimulation, 
    processTurn,
    simulationReadinessStatus,
    preparedWorldData,
    turnHistory,
    currentSimulationState // This is the key - use the current simulation state
  } = useSimulationContext();
  
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Add debug output
  console.log('WorldHistorySimInterface - Context Data:', {
    currentTurn,
    hasCurrentSimulationState: !!currentSimulationState,
    hasWorldState: !!worldState,
    turnHistoryLength: turnHistory?.length || 0,
    currentSimulationStateEvents: currentSimulationState?.events?.length || 0,
    worldStateEvents: worldState?.events?.length || 0
  });

  // Use current simulation state instead of worldState prop
  const activeWorldState = currentSimulationState || worldState || {
    time: 0,
    npcs: [],
    characters: [],
    nodes: [],
    events: [],
    resources: {
      totalGold: 0,
      totalFood: 0,
      totalPopulation: 0,
      population: 0
    }
  };

  // Auto-initialize simulation when prepared world data is available but not initialized
  useEffect(() => {
    if (simulationReadinessStatus.isSimulationReady && !isInitialized && preparedWorldData) {
      console.log('Auto-initializing simulation with prepared world data');
      // Trigger a reset which should initialize the simulation
      resetSimulation();
    }
  }, [simulationReadinessStatus.isSimulationReady, isInitialized, preparedWorldData, resetSimulation]);

  // Handle turn processing
  const handleNextTurn = async () => {
    if (canProcessTurn) {
      try {
        console.log('BEFORE TURN - Current State:', {
          currentTurn,
          eventsCount: activeWorldState?.events?.length || 0,
          charactersCount: activeWorldState?.characters?.length || 0
        });
        
        const result = await processTurn();
        
        console.log('AFTER TURN - New State:', {
          newTurn: currentTurn + 1,
          result,
          newEventsCount: result?.worldState?.events?.length || 0,
          newCharactersCount: result?.worldState?.characters?.length || 0
        });
        
      } catch (error) {
        console.error('Error processing turn:', error);
      }
    } else {
      console.log('Cannot process turn - conditions not met:', { canProcessTurn, isInitialized, currentTurn });
    }
  };

  // Create a REAL turn manager that reflects actual simulation state
  const realTurnManager = {
    getCurrentStatistics: () => {
      // Get real statistics from the current simulation state
      const stats = {
        currentTurn: currentTurn || 0,
        maxTurns: null,
        isPaused: false,
        isProcessing: !canProcessTurn,
        historySize: turnHistory?.length || 0,
        summaryCount: Math.min(currentTurn || 0, 5),
        eventCount: activeWorldState?.events?.length || 0,
        canContinue: canProcessTurn,
        // Add more detailed statistics from the actual world state
        totalPopulation: activeWorldState?.characters?.length || activeWorldState?.npcs?.length || 0,
        totalNodes: activeWorldState?.nodes?.length || 0,
        totalResources: activeWorldState?.resources?.totalGold || 0
      };
      
      console.log('Real turn manager stats:', stats); // Debug logging
      return stats;
    },
    
    getRecentTurnSummaries: (count = 5) => {
      // Get real turn summaries from turnHistory
      if (!turnHistory || turnHistory.length === 0) return [];
      
      return turnHistory.slice(-count).map((summary, index) => {
        const turnNum = currentTurn - (turnHistory.length - 1 - index);
        
        return {
          turn: turnNum,
          summary: summary.summary || `Turn ${turnNum} completed`,
          statistics: summary.statistics || {
            charactersActive: activeWorldState?.characters?.length || 0,
            eventsProcessed: summary.events?.length || 0,
            interactionsResolved: summary.interactions?.length || 0
          },
          events: summary.events || [],
          changes: summary.changes || [],
          timestamp: summary.timestamp || new Date()
        };
      });
    },
    
    getRecentEvents: (count = 5) => {
      // Get real events from the current world state
      if (!activeWorldState?.events) return [];
      
      return activeWorldState.events
        .slice(-count)
        .map(event => ({
          turn: event.turn || currentTurn,
          type: event.type || 'general',
          description: event.description || event.message || 'Event occurred',
          timestamp: event.timestamp || new Date(),
          significance: event.significance || 5
        }));
    }
  };

  const views = ['overview', 'timeline', 'statistics', 'characters', 'settlements', 'relationships'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                World History Simulation
              </h1>
              
              {/* Real-time turn counter */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Turn: {currentTurn !== null ? currentTurn : '--'}
                </span>
                {canProcessTurn && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Turn Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleNextTurn}
                disabled={!canProcessTurn}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  canProcessTurn
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Process Turn
              </button>
              
              <button
                onClick={resetSimulation}
                className="px-4 py-2 rounded-md font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="-mb-px flex space-x-8">
            {views.map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  selectedView === view
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {view}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'overview' && (
          <div className="space-y-6">
            <DashboardView 
              worldState={activeWorldState} 
              turnManager={realTurnManager} 
              currentTurn={currentTurn} 
            />
          </div>
        )}
        {selectedView === 'timeline' && (
          <div className="space-y-6">
            <UnifiedTimelineView
              worldState={activeWorldState}
              turnManager={realTurnManager}
              currentTurn={currentTurn}
            />
          </div>
        )}
        {selectedView === 'statistics' && (
          <div className="space-y-6">
            <UnifiedStatisticsView 
              worldState={activeWorldState} 
              turnManager={realTurnManager}
              data={activeWorldState?.events || []}
            />
          </div>
        )}
        {selectedView === 'characters' && (
          <div className="space-y-6">
            <UnifiedCharactersView 
              worldState={activeWorldState} 
              turnManager={realTurnManager}
              selectedCharacter={selectedCharacter}
              setSelectedCharacter={setSelectedCharacter}
            />
          </div>
        )}
        {selectedView === 'settlements' && (
          <div className="space-y-6">
            <UnifiedSettlementsView 
              worldState={activeWorldState} 
              turnManager={realTurnManager}
            />
          </div>
        )}
        {selectedView === 'relationships' && (
          <div className="space-y-6">
            <UnifiedRelationshipsView 
              worldState={activeWorldState} 
              turnManager={realTurnManager}
            />
          </div>
        )}
      </main>

      {/* Debug Data Flow Component */}
      <DebugDataFlow 
        currentSimulationState={currentSimulationState}
        worldState={worldState}
        turnHistory={turnHistory}
        currentTurn={currentTurn}
      />
    </div>
  );
};

// Main dashboard view - Updated to use real data
const DashboardView = ({ worldState, turnManager, currentTurn }) => {
  
  // Use the world state directly (it's now the current simulation state)
  const displayWorldState = worldState;

  // Use characters array if available, fall back to npcs
  const characters = displayWorldState.characters || displayWorldState.npcs || [];

  // Debug logging for real data
  console.log('DashboardView - displayWorldState:', displayWorldState);
  console.log('DashboardView - events length:', displayWorldState.events?.length || 0);
  console.log('DashboardView - characters length:', characters.length);
  console.log('DashboardView - turnManager stats:', turnManager.getCurrentStatistics());

  // Ensure resources object exists and has required properties
  const resources = displayWorldState.resources || {
    totalGold: 0,
    totalFood: 0,
    totalPopulation: characters.length,
    population: characters.length
  };

  // Get real timeline events from the turn manager
  const recentEvents = turnManager.getRecentEvents(5);
  console.log('DashboardView - recent events:', recentEvents);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Statistics Cards - Now show real data */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<span className="text-2xl">👥</span>}
          label="Total Population"
          value={characters.length.toLocaleString()}
          trend={characters.length > 0 ? `+${characters.length} Active` : "Starting"}
          color="blue"
        />
        <StatCard 
          icon={<span className="text-2xl">📈</span>}
          label="Total Resources"
          value={resources.totalGold?.toLocaleString() || '0'}
          trend={resources.totalGold > 0 ? "+Growing" : "Building"}
          color="green"
        />
        <StatCard 
          icon={<span className="text-2xl">🏘️</span>}
          label="Active Settlements"
          value={displayWorldState.nodes?.length || 0}
          trend={displayWorldState.nodes?.length > 0 ? "+Established" : "Planning"}
          color="purple"
        />
        <StatCard 
          icon={<span className="text-2xl">⚡</span>}
          label="Historical Events"
          value={displayWorldState.events?.length || 0}
          trend={displayWorldState.events?.length > 0 ? 
            `T${currentTurn} Events` : "Awaiting"}
          color="orange"
        />
      </div>

      {/* Recent Events Panel - Now shows real events */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Recent Events
        </h3>
        {recentEvents.length > 0 ? (
          <div className="space-y-3">
            {recentEvents.map((event, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {event.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Turn {event.turn} • {event.type}
                    </p>
                  </div>
                  {event.significance && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      ⭐ {event.significance}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No events recorded yet. Process turns to generate history.
          </p>
        )}
      </div>

      {/* Turn Summary Panel - Shows real turn history */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Turn Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Turn:</span>
            <span className="text-sm font-medium">{currentTurn || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Events:</span>
            <span className="text-sm font-medium">{displayWorldState.events?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Characters:</span>
            <span className="text-sm font-medium">{characters.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Settlements:</span>
            <span className="text-sm font-medium">{displayWorldState.nodes?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat card component (unchanged but included for completeness)
const StatCard = ({ icon, label, value, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-sm text-green-600 dark:text-green-400">{trend}</span>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
};

// Placeholder components for other views (you'll need to implement these)
const UnifiedTimelineView = ({ worldState, turnManager, currentTurn }) => (
  <div>Timeline view - implement based on real turn data</div>
);

const UnifiedStatisticsView = ({ worldState, turnManager, data }) => (
  <div>Statistics view - implement based on real turn data</div>
);

const UnifiedCharactersView = ({ worldState, turnManager, selectedCharacter, setSelectedCharacter }) => (
  <div>Characters view - implement based on real turn data</div>
);

const UnifiedSettlementsView = ({ worldState, turnManager }) => (
  <div>Settlements view - implement based on real turn data</div>
);

const UnifiedRelationshipsView = ({ worldState, turnManager }) => (
  <div>Relationships view - implement based on real turn data</div>
);

export default WorldHistorySimInterface;