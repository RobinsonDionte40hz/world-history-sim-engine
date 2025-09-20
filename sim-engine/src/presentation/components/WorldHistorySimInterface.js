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

  // More detailed logging
  console.log('currentSimulationState.time:', currentSimulationState?.time);
  console.log('worldState.time:', worldState?.time);
  console.log('currentSimulationState.events:', currentSimulationState?.events);
  console.log('worldState.events:', worldState?.events);
  console.log('currentSimulationState.events length:', currentSimulationState?.events?.length);
  console.log('worldState.events length:', worldState?.events?.length);
  console.log('currentSimulationState has events array:', Array.isArray(currentSimulationState?.events));
  console.log('worldState has events array:', Array.isArray(worldState?.events));

  console.log('========================');

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-sm max-h-64 overflow-y-auto">
      <h4 className="font-bold mb-2">Debug Data Flow</h4>
      <div>Turn: {currentTurn}</div>
      <div>Sim State Events: {currentSimulationState?.events?.length || 0}</div>
      <div>World State Events: {worldState?.events?.length || 0}</div>
      <div>Turn History: {turnHistory?.length || 0}</div>
      <div>Has Sim State: {currentSimulationState ? '✓' : '✗'}</div>
      <div>Sim Time: {currentSimulationState?.time}</div>
      <div>World Time: {worldState?.time}</div>
      <div>Active World: {currentSimulationState ? 'currentSimulationState' : 'worldState'}</div>
    </div>
  );
};

// Main dashboard view - Updated to use real data
const DashboardView = ({ worldState, turnManager, currentTurn }) => {

  // Get LOD data from simulation context
  const { lodStats, lodProcessingMetrics, isLODInitialized } = useSimulationContext();

  // Add state for LOD tier filtering
  const [selectedLodTier, setSelectedLodTier] = useState('all');

  // Use the world state directly (it's now the current simulation state)
  const displayWorldState = worldState;

  // Use characters array if available, fall back to npcs
  const characters = displayWorldState.characters || displayWorldState.npcs || [];
  const npcs = displayWorldState.npcs || displayWorldState.characters || [];

  // Debug logging for real data
  console.log('DashboardView - RECEIVED worldState:', worldState);
  console.log('DashboardView - worldState.time:', worldState?.time);
  console.log('DashboardView - worldState.events:', worldState?.events);
  console.log('DashboardView - events length:', worldState?.events?.length || 0);
  console.log('DashboardView - characters length:', characters.length);
  console.log('DashboardView - npcs length:', npcs.length);
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
          icon={<span className="text-2xl">🤖</span>}
          label="Active NPCs"
          value={npcs.length.toLocaleString()}
          trend={npcs.length > 0 ? `${npcs.length} Processing` : "None"}
          color="green"
        />
        <StatCard
          icon={<span className="text-2xl">📈</span>}
          label="Total Resources"
          value={resources.totalGold?.toLocaleString() || '0'}
          trend={resources.totalGold > 0 ? "+Growing" : "Building"}
          color="yellow"
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
          label="LOD Performance"
          value={lodProcessingMetrics?.averageTurnDuration ?
            `${Math.round(lodProcessingMetrics.averageTurnDuration)}ms` : 'N/A'}
          trend={isLODInitialized ? "Active" : "Initializing"}
          color="orange"
        />
        <StatCard
          icon={<span className="text-2xl">🎯</span>}
          label="Hero NPCs"
          value={lodStats?.hero || 0}
          trend={lodStats?.hero > 0 ? "Full Processing" : "None"}
          color="red"
        />
        <StatCard
          icon={<span className="text-2xl">👥</span>}
          label="Group NPCs"
          value={lodStats?.group || 0}
          trend={lodStats?.group > 0 ? "Statistical" : "None"}
          color="yellow"
        />
        <StatCard
          icon={<span className="text-2xl">👤</span>}
          label="Background NPCs"
          value={lodStats?.background || 0}
          trend={lodStats?.background > 0 ? "Aggregate" : "None"}
          color="gray"
        />
        <StatCard
          icon={<span className="text-2xl">👑</span>}
          label="Leader Citizens"
          value={characters.filter(c => c.citizenTier === 'LEADER').length}
          trend={characters.filter(c => c.citizenTier === 'LEADER').length > 0 ? "1.5x Multiplier" : "None"}
          color="purple"
        />
        <StatCard
          icon={<span className="text-2xl">⚡</span>}
          label="Specialist Citizens"
          value={characters.filter(c => c.citizenTier === 'SPECIALIST').length}
          trend={characters.filter(c => c.citizenTier === 'SPECIALIST').length > 0 ? "1.25x Multiplier" : "None"}
          color="blue"
        />
        <StatCard
          icon={<span className="text-2xl">👥</span>}
          label="Citizen NPCs"
          value={characters.filter(c => c.citizenTier === 'CITIZEN').length}
          trend={characters.filter(c => c.citizenTier === 'CITIZEN').length > 0 ? "Base Processing" : "None"}
          color="green"
        />
      </div>

      {/* NPC Activity Panel - Show NPC decisions and actions with LOD tabs */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            NPC Activity & Decisions
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {npcs.length} total NPCs
          </div>
        </div>

        {/* LOD Tier Tabs */}
        <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setSelectedLodTier('all')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedLodTier === 'all'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            All ({npcs.length})
          </button>
          <button
            onClick={() => setSelectedLodTier('hero')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedLodTier === 'hero'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Heroes ({lodStats?.hero || 0})
          </button>
          <button
            onClick={() => setSelectedLodTier('group')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedLodTier === 'group'
                ? 'bg-yellow-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Groups ({lodStats?.group || 0})
          </button>
          <button
            onClick={() => setSelectedLodTier('background')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedLodTier === 'background'
                ? 'bg-gray-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Background ({lodStats?.background || 0})
          </button>
        </div>

        {/* Filtered NPC List */}
        {(() => {
          const filteredNpcs = selectedLodTier === 'all'
            ? npcs
            : npcs.filter(npc => npc.lodTier === selectedLodTier);

          return filteredNpcs.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredNpcs.map((npc, index) => (
                <div key={npc.id || index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {npc.name || `NPC ${index + 1}`}
                        </p>
                        {/* Citizen Tier Badge */}
                        {npc.citizenTier && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            npc.citizenTier === 'LEADER' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            npc.citizenTier === 'SPECIALIST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {npc.citizenTier}
                          </span>
                        )}
                        {/* LOD Tier Badge */}
                        {npc.lodTier && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            npc.lodTier === 'hero' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            npc.lodTier === 'group' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {npc.lodTier}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {npc.lastInteractionType ?
                          `Last Action: ${npc.lastInteractionType}` :
                          'No recent activity'
                        }
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <span>Energy: {npc.energy || 0}/100</span>
                        <span>Mood: {npc.mood || 0}/100</span>
                        <span>Health: {npc.health || 0}/100</span>
                        {npc.wealth !== undefined && (
                          <span>Wealth: {npc.wealth}</span>
                        )}
                        {npc.influence !== undefined && (
                          <span>Influence: {npc.influence}</span>
                        )}
                      </div>
                    </div>
                    {npc.lastInteractionType && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">
                {selectedLodTier === 'hero' ? '⭐' :
                 selectedLodTier === 'group' ? '👥' :
                 selectedLodTier === 'background' ? '👤' : '👥'}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No {selectedLodTier === 'all' ? '' : selectedLodTier + ' '}NPCs found
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {selectedLodTier === 'hero' ? 'Hero NPCs have full individual processing' :
                 selectedLodTier === 'group' ? 'Group NPCs use statistical processing' :
                 selectedLodTier === 'background' ? 'Background NPCs use aggregate tracking' :
                 'Try selecting a different LOD tier'}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Recent Events Panel - Now shows real events */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
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

      {/* LOD Status Indicator */}
      {isLODInitialized && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-sm p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">LOD System Active</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Hero: {lodStats?.hero || 0} | Group: {lodStats?.group || 0} | Background: {lodStats?.background || 0}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Avg: {lodProcessingMetrics?.averageTurnDuration ? `${Math.round(lodProcessingMetrics.averageTurnDuration)}ms` : 'N/A'}
            </div>
          </div>
        </div>
      )}
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

  // Debug the active world state
  console.log('WorldHistorySimInterface - activeWorldState:', {
    time: activeWorldState.time,
    eventsCount: activeWorldState.events?.length || 0,
    charactersCount: activeWorldState.characters?.length || activeWorldState.npcs?.length || 0,
    nodesCount: activeWorldState.nodes?.length || 0,
    hasEvents: !!activeWorldState.events,
    eventsType: Array.isArray(activeWorldState.events) ? 'array' : typeof activeWorldState.events
  });

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

// Placeholder components for other views (you'll need to implement these)
const UnifiedTimelineView = ({ worldState, turnManager, currentTurn }) => {
  // Get real turn history and events
  const turnSummaries = turnManager.getRecentTurnSummaries(20); // Last 20 turns
  const recentEvents = turnManager.getRecentEvents(50); // Last 50 events

  // Group events by turn for timeline display
  const eventsByTurn = recentEvents.reduce((acc, event) => {
    const turn = event.turn || currentTurn;
    if (!acc[turn]) acc[turn] = [];
    acc[turn].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Historical Timeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{currentTurn || 0}</div>
            <div className="text-sm text-gray-500">Current Turn</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{turnSummaries.length}</div>
            <div className="text-sm text-gray-500">Turns Recorded</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{recentEvents.length}</div>
            <div className="text-sm text-gray-500">Total Events</div>
          </div>
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Turn-by-Turn History
        </h3>

        {turnSummaries.length > 0 ? (
          <div className="space-y-4">
            {turnSummaries
              .sort((a, b) => b.turn - a.turn) // Most recent first
              .map((summary, index) => (
                <div key={summary.turn || index} className="relative">
                  {/* Timeline connector */}
                  {index < turnSummaries.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300 dark:bg-gray-600"></div>
                  )}

                  <div className="flex items-start space-x-4">
                    {/* Turn indicator */}
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                        T{summary.turn}
                      </span>
                    </div>

                    {/* Turn content */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          Turn {summary.turn}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {summary.timestamp ? new Date(summary.timestamp).toLocaleString() : 'Recent'}
                        </span>
                      </div>

                      {/* Turn summary */}
                      {summary.summary && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {summary.summary}
                        </p>
                      )}

                      {/* Turn statistics */}
                      {summary.statistics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                          <div className="text-xs">
                            <span className="text-gray-500">Characters:</span>
                            <span className="ml-1 font-medium">{summary.statistics.charactersActive || 0}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">Events:</span>
                            <span className="ml-1 font-medium">{summary.statistics.eventsProcessed || 0}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">Interactions:</span>
                            <span className="ml-1 font-medium">{summary.statistics.interactionsResolved || 0}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">Duration:</span>
                            <span className="ml-1 font-medium">{summary.statistics.processingTime || 'N/A'}</span>
                          </div>
                        </div>
                      )}

                      {/* Events for this turn */}
                      {eventsByTurn[summary.turn] && eventsByTurn[summary.turn].length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Events
                          </h5>
                          {eventsByTurn[summary.turn].map((event, eventIndex) => (
                            <div key={eventIndex} className="flex items-start space-x-2 text-xs">
                              <span className={`inline-block w-2 h-2 rounded-full mt-1 ${
                                event.type === 'interaction' ? 'bg-blue-500' :
                                event.type === 'movement' ? 'bg-green-500' :
                                event.type === 'decision' ? 'bg-purple-500' :
                                'bg-gray-500'
                              }`}></span>
                              <div className="flex-1">
                                <span className="text-gray-700 dark:text-gray-300">
                                  {event.description}
                                </span>
                                {event.significance && (
                                  <span className="ml-2 px-1 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                                    ★{event.significance}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Historical Records Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Process some turns to start building your world's history.
            </p>
          </div>
        )}
      </div>

      {/* Event Type Summary */}
      {recentEvents.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Event Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(
              recentEvents.reduce((acc, event) => {
                acc[event.type || 'general'] = (acc[event.type || 'general'] || 0) + 1;
                return acc;
              }, {})
            ).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-500 capitalize">{type} Events</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const UnifiedStatisticsView = ({ worldState, turnManager, data }) => {
  // Get LOD data from simulation context
  const { lodStats, lodProcessingMetrics, getLODProcessingRecommendations } = useSimulationContext();

  // Calculate statistics from world state
  const characters = worldState?.characters || worldState?.npcs || [];
  const events = worldState?.events || [];
  const nodes = worldState?.nodes || [];

  // Population growth over time (simulated based on current data)
  const populationData = characters.length > 0 ? [
    { turn: Math.max(0, (worldState?.time || 0) - 2), count: Math.floor(characters.length * 0.7) },
    { turn: Math.max(0, (worldState?.time || 0) - 1), count: Math.floor(characters.length * 0.85) },
    { turn: worldState?.time || 0, count: characters.length }
  ] : [];

  // Event types distribution
  const eventTypes = events.reduce((acc, event) => {
    const type = event.type || 'general';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // LOD recommendations
  const recommendations = getLODProcessingRecommendations();

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Population</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{characters.length}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">+{Math.floor(characters.length * 0.1)}</span>
              <span className="text-gray-500 ml-1">from last turn</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Events</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{events.length}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-blue-600">{Object.keys(eventTypes).length}</span>
              <span className="text-gray-500 ml-1">event types</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">World Nodes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{nodes.length}</p>
            </div>
            <div className="text-3xl">🏘️</div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-purple-600">{nodes.filter(n => n.type === 'settlement').length}</span>
              <span className="text-gray-500 ml-1">settlements</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Turn Time</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {lodProcessingMetrics?.averageTurnDuration ?
                  `${Math.round(lodProcessingMetrics.averageTurnDuration)}ms` : 'N/A'}
              </p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className={lodProcessingMetrics?.averageTurnDuration > 100 ? 'text-red-600' : 'text-green-600'}>
                {lodProcessingMetrics?.averageTurnDuration > 100 ? 'Slow' : 'Fast'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LOD System Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Level of Detail (LOD) System
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LOD Tier Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Character Distribution</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Hero NPCs</span>
                </div>
                <span className="font-medium">{lodStats?.hero || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Group NPCs</span>
                </div>
                <span className="font-medium">{lodStats?.group || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Background NPCs</span>
                </div>
                <span className="font-medium">{lodStats?.background || 0}</span>
              </div>
            </div>
          </div>

          {/* LOD Performance */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Performance Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Turn Duration</span>
                <span className="font-medium">
                  {lodProcessingMetrics?.lastTurnDuration ?
                    `${Math.round(lodProcessingMetrics.lastTurnDuration)}ms` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Duration</span>
                <span className="font-medium">
                  {lodProcessingMetrics?.averageTurnDuration ?
                    `${Math.round(lodProcessingMetrics.averageTurnDuration)}ms` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Processed</span>
                <span className="font-medium">{lodProcessingMetrics?.totalProcessed || 0}</span>
              </div>
            </div>
          </div>

          {/* LOD Recommendations */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">System Recommendations</h4>
            {recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div key={`recommendation-${index}`} className={`p-2 rounded text-xs ${
                    rec.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    rec.severity === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {rec.message}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                System performing optimally
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Population Growth Chart (Simplified) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Population Growth
        </h3>

        {populationData.length > 0 ? (
          <div className="space-y-4">
            {populationData.map((point, index) => (
              <div key={`population-${point.turn}-${index}`} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-500">Turn {point.turn}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${(point.count / Math.max(...populationData.map(p => p.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12">{point.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-gray-500 dark:text-gray-400">
              Population data will appear as turns are processed
            </p>
          </div>
        )}
      </div>

      {/* Event Type Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Event Distribution
        </h3>

        {Object.keys(eventTypes).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(eventTypes).map(([type, count], index) => (
              <div key={`event-type-${type}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    type === 'interaction' ? 'bg-blue-500' :
                    type === 'movement' ? 'bg-green-500' :
                    type === 'decision' ? 'bg-purple-500' :
                    type === 'economic' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">{type}</span>
                </div>
                <span className="text-lg font-bold">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400">
              Event distribution will appear as events are generated
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const UnifiedCharactersView = ({ worldState, turnManager, selectedCharacter, setSelectedCharacter }) => {
  // Get LOD data from simulation context
  const { changeCharacterLODTier, lodProcessingMetrics } = useSimulationContext();

  // Add state for selected tab
  const [selectedTab, setSelectedTab] = useState('all');

  // Get characters from world state
  const characters = worldState?.characters || worldState?.npcs || [];
  const characterArray = Array.from(characters.values ? characters.values() : characters);

  // Group characters by LOD tier
  const charactersByTier = characterArray.reduce((acc, char) => {
    const tier = char.lodTier || 'background';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(char);
    return acc;
  }, { hero: [], group: [], background: [] });

  // Handle LOD tier change
  const handleTierChange = async (characterId, newTier) => {
    try {
      const success = await changeCharacterLODTier(characterId, newTier);
      if (success) {
        console.log(`Character ${characterId} moved to ${newTier} tier`);
      }
    } catch (error) {
      console.error('Failed to change character LOD tier:', error);
    }
  };

  // Get tier color
  const getTierColor = (tier) => {
    switch (tier) {
      case 'hero': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'group': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'background': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Get filtered characters based on selected tab
  const getFilteredCharacters = () => {
    switch (selectedTab) {
      case 'hero': return charactersByTier.hero;
      case 'group': return charactersByTier.group;
      case 'background': return charactersByTier.background;
      default: return characterArray;
    }
  };

  const filteredCharacters = getFilteredCharacters();

  return (
    <div className="space-y-6">
      {/* Characters Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {selectedTab === 'all' ? 'Total Characters' :
                 selectedTab === 'hero' ? 'Hero NPCs' :
                 selectedTab === 'group' ? 'Group NPCs' : 'Background NPCs'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {selectedTab === 'all' ? characterArray.length :
                 selectedTab === 'hero' ? charactersByTier.hero.length :
                 selectedTab === 'group' ? charactersByTier.group.length :
                 charactersByTier.background.length}
              </p>
            </div>
            <div className="text-3xl">
              {selectedTab === 'all' ? '👥' :
               selectedTab === 'hero' ? '⭐' :
               selectedTab === 'group' ? '👥' : '👤'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hero NPCs</p>
              <p className="text-3xl font-bold text-red-600">{charactersByTier.hero.length}</p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Group NPCs</p>
              <p className="text-3xl font-bold text-yellow-600">{charactersByTier.group.length}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <StatCard
          icon={<span className="text-2xl">⚡</span>}
          label="LOD Processing"
          value={lodProcessingMetrics?.totalProcessed || 0}
          trend={lodProcessingMetrics?.totalProcessed > 0 ? "Turns" : "None"}
          color="orange"
        />
      </div>

      {/* Character Type Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Character Management
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredCharacters.length} characters
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setSelectedTab('all')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTab === 'all'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            All ({characterArray.length})
          </button>
          <button
            onClick={() => setSelectedTab('hero')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTab === 'hero'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Heroes ({charactersByTier.hero.length})
          </button>
          <button
            onClick={() => setSelectedTab('group')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTab === 'group'
                ? 'bg-yellow-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Groups ({charactersByTier.group.length})
          </button>
          <button
            onClick={() => setSelectedTab('background')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTab === 'background'
                ? 'bg-gray-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Background ({charactersByTier.background.length})
          </button>
        </div>

        {/* Filtered Character List */}
        {filteredCharacters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onSelect={setSelectedCharacter}
                isSelected={selectedCharacter?.id === character.id}
                onTierChange={handleTierChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {selectedTab === 'hero' ? '⭐' :
               selectedTab === 'group' ? '👥' :
               selectedTab === 'background' ? '👤' : '👥'}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No {selectedTab === 'all' ? '' : selectedTab + ' '}characters found
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {selectedTab === 'hero' ? 'Hero NPCs have full individual processing and detailed behaviors' :
               selectedTab === 'group' ? 'Group NPCs use statistical processing for efficiency' :
               selectedTab === 'background' ? 'Background NPCs use aggregate tracking for performance' :
               'Try selecting a different character type or create some characters first'}
            </p>
          </div>
        )}
      </div>

      {/* Selected Character Details */}
      {selectedCharacter && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Character Details: {selectedCharacter.name || `Character ${selectedCharacter.id}`}
            </h3>
            <button
              onClick={() => setSelectedCharacter(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID:</span>
                  <span>{selectedCharacter.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span>{selectedCharacter.name || 'Unnamed'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">LOD Tier:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getTierColor(selectedCharacter.lodTier)}`}>
                    {selectedCharacter.lodTier || 'background'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Node:</span>
                  <span>{selectedCharacter.currentNodeId || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Attributes</h4>
              <div className="space-y-2 text-sm">
                {selectedCharacter.attributes && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Strength:</span>
                      <span>
                        {(() => {
                          const attr = selectedCharacter.attributes.strength;
                          if (typeof attr === 'object' && attr !== null) {
                            return attr.score || attr.modifier || 0;
                          }
                          return typeof attr === 'number' ? attr : 0;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Dexterity:</span>
                      <span>
                        {(() => {
                          const attr = selectedCharacter.attributes.dexterity;
                          if (typeof attr === 'object' && attr !== null) {
                            return attr.score || attr.modifier || 0;
                          }
                          return typeof attr === 'number' ? attr : 0;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Constitution:</span>
                      <span>
                        {(() => {
                          const attr = selectedCharacter.attributes.constitution;
                          if (typeof attr === 'object' && attr !== null) {
                            return attr.score || attr.modifier || 0;
                          }
                          return typeof attr === 'number' ? attr : 0;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Intelligence:</span>
                      <span>
                        {(() => {
                          const attr = selectedCharacter.attributes.intelligence;
                          if (typeof attr === 'object' && attr !== null) {
                            return attr.score || attr.modifier || 0;
                          }
                          return typeof attr === 'number' ? attr : 0;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Wisdom:</span>
                      <span>
                        {(() => {
                          const attr = selectedCharacter.attributes.wisdom;
                          if (typeof attr === 'object' && attr !== null) {
                            return attr.score || attr.modifier || 0;
                          }
                          return typeof attr === 'number' ? attr : 0;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Charisma:</span>
                      <span>
                        {(() => {
                          const attr = selectedCharacter.attributes.charisma;
                          if (typeof attr === 'object' && attr !== null) {
                            return attr.score || attr.modifier || 0;
                          }
                          return typeof attr === 'number' ? attr : 0;
                        })()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Current Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedCharacter.energy || 0}</div>
                <div className="text-sm text-gray-500">Energy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedCharacter.mood || 0}</div>
                <div className="text-sm text-gray-500">Mood</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{selectedCharacter.health || 0}</div>
                <div className="text-sm text-gray-500">Health</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{selectedCharacter.lastInteractionType || 'None'}</div>
                <div className="text-sm text-gray-500">Last Action</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {characterArray.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Characters Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Characters will appear here once the simulation is initialized and running.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Character Card Component
const CharacterCard = ({ character, onSelect, isSelected, onTierChange }) => {
  const getTierColor = (tier) => {
    switch (tier) {
      case 'hero': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'group': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'background': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={() => onSelect(character)}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {character.name || `Character ${character.id}`}
        </h4>
        <span className={`px-2 py-1 rounded text-xs ${getTierColor(character.lodTier)}`}>
          {character.lodTier || 'background'}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Energy:</span>
          <span>{character.energy || 0}/100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Health:</span>
          <span>{character.health || 0}/100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Mood:</span>
          <span>{character.mood || 0}/100</span>
        </div>
      </div>

      {character.lastInteractionType && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Last: {character.lastInteractionType}
        </div>
      )}

      {/* LOD Tier Controls */}
      <div className="mt-3 flex space-x-1">
        {['hero', 'group', 'background'].map((tier) => (
          <button
            key={tier}
            onClick={(e) => {
              e.stopPropagation();
              onTierChange(character.id, tier);
            }}
            className={`px-2 py-1 text-xs rounded ${
              character.lodTier === tier
                ? getTierColor(tier)
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>
    </div>
  );
};

const UnifiedSettlementsView = ({ worldState, turnManager }) => {
  // Get settlements from world state
  const nodes = worldState?.nodes || [];
  const nodeArray = Array.from(nodes.values ? nodes.values() : nodes);
  const settlements = nodeArray.filter(node => node.type === 'settlement');

  // Calculate settlement statistics with NaN protection
  const totalPopulation = settlements.reduce((sum, settlement) => {
    const pop = settlement.population || 0;
    return sum + (isNaN(pop) ? 0 : pop);
  }, 0);
  
  const totalResources = settlements.reduce((sum, settlement) => {
    const gold = settlement.resources?.totalGold || 0;
    return sum + (isNaN(gold) ? 0 : gold);
  }, 0);

  // Safe average calculation
  const avgSettlementSize = settlements.length > 0 
    ? Math.round(totalPopulation / settlements.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Settlements Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Settlements</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{settlements.length}</p>
            </div>
            <div className="text-3xl">🏘️</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Population</p>
              <p className="text-3xl font-bold text-blue-600">
                {isNaN(totalPopulation) ? 0 : totalPopulation.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resources</p>
              <p className="text-3xl font-bold text-green-600">
                {isNaN(totalResources) ? 0 : totalResources.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Settlement Size</p>
              <p className="text-3xl font-bold text-purple-600">
                {isNaN(avgSettlementSize) ? 0 : avgSettlementSize}
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Settlements List */}
      {settlements.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {settlements.map((settlement) => (
            <SettlementCard key={settlement.id} settlement={settlement} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🏘️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Settlements Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Settlements will appear here once they are created in the world.
            </p>
          </div>
        </div>
      )}

      {/* Settlement Development Overview */}
      {settlements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Settlement Development Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Government Types */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Government Types</h4>
              <div className="space-y-2">
                {Object.entries(
                  settlements.reduce((acc, settlement) => {
                    const govType = settlement.government?.type || 'Unknown';
                    acc[govType] = (acc[govType] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{type}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Economic Status */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Economic Status</h4>
              <div className="space-y-2">
                {Object.entries(
                  settlements.reduce((acc, settlement) => {
                    const status = settlement.economy?.status || 'Developing';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{status}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Traits */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Cultural Traits</h4>
              <div className="space-y-2">
                {Object.entries(
                  settlements.reduce((acc, settlement) => {
                    if (settlement.culture?.traits) {
                      settlement.culture.traits.forEach(trait => {
                        acc[trait] = (acc[trait] || 0) + 1;
                      });
                    }
                    return acc;
                  }, {})
                ).slice(0, 5).map(([trait, count]) => (
                  <div key={trait} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{trait}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Settlement Card Component
const SettlementCard = ({ settlement }) => {
  const getSettlementSize = (population) => {
    const pop = isNaN(population) ? 0 : population;
    if (pop >= 10000) return { label: 'City', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900' };
    if (pop >= 1000) return { label: 'Town', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900' };
    if (pop >= 100) return { label: 'Village', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900' };
    return { label: 'Hamlet', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-700' };
  };

  const sizeInfo = getSettlementSize(settlement.population || 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {settlement.name || `Settlement ${settlement.id}`}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${sizeInfo.bgColor} ${sizeInfo.color}`}>
          {sizeInfo.label}
        </span>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Population</p>
          <p className="text-lg font-semibold">
            {(() => {
              const pop = settlement.population || 0;
              return isNaN(pop) ? 0 : pop.toLocaleString();
            })()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Resources</p>
          <p className="text-lg font-semibold">
            {(() => {
              const gold = settlement.resources?.totalGold || 0;
              return isNaN(gold) ? 0 : gold.toLocaleString();
            })()}
          </p>
        </div>
      </div>

      {/* Government */}
      {settlement.government && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Government</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span>{settlement.government.type || 'Unknown'}</span>
            </div>
            {settlement.government.leader && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Leader:</span>
                <span>{settlement.government.leader}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Economy */}
      {settlement.economy && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Economy</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span>{settlement.economy.status || 'Developing'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Currency:</span>
              <span>{settlement.economy.currency || 'Gold'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Culture */}
      {settlement.culture && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Culture</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Language:</span>
              <span>{settlement.culture.language || 'Common'}</span>
            </div>
            {settlement.culture.traits && settlement.culture.traits.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Traits:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {settlement.culture.traits.slice(0, 3).map((trait, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                      {trait}
                    </span>
                  ))}
                  {settlement.culture.traits.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded">
                      +{settlement.culture.traits.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Environmental Properties */}
      {settlement.environmentalProperties && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Environment</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Climate:</span>
                <span>{settlement.environmentalProperties.climate || 'Temperate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Season:</span>
                <span>{settlement.environmentalProperties.season || 'Spring'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Prosperous:</span>
                <span>{settlement.environmentalProperties.prosperous ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Crowded:</span>
                <span>{settlement.environmentalProperties.crowded ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UnifiedRelationshipsView = ({ worldState, turnManager }) => {
  // Get settlements and relationships from world state
  const nodes = worldState?.nodes || [];
  const nodeArray = Array.from(nodes.values ? nodes.values() : nodes);
  const settlements = nodeArray.filter(node => node.type === 'settlement');

  // Get relationships from world state (assuming they exist in interactions or relationships)
  const interactions = worldState?.interactions || [];
  const interactionArray = Array.from(interactions.values ? interactions.values() : interactions);

  // Filter for relationship-type interactions
  const relationships = interactionArray.filter(interaction =>
    interaction.type === 'diplomatic' ||
    interaction.type === 'trade' ||
    interaction.type === 'alliance' ||
    interaction.type === 'conflict'
  );

  // Calculate relationship statistics
  const relationshipStats = relationships.reduce((acc, rel) => {
    acc[rel.type] = (acc[rel.type] || 0) + 1;
    return acc;
  }, { diplomatic: 0, trade: 0, alliance: 0, conflict: 0 });

  return (
    <div className="space-y-6">
      {/* Relationships Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Relationships</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{relationships.length}</p>
            </div>
            <div className="text-3xl">🤝</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Diplomatic Ties</p>
              <p className="text-3xl font-bold text-blue-600">{relationshipStats.diplomatic || 0}</p>
            </div>
            <div className="text-3xl">🤝</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trade Agreements</p>
              <p className="text-3xl font-bold text-green-600">{relationshipStats.trade || 0}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Conflicts</p>
              <p className="text-3xl font-bold text-red-600">{relationshipStats.conflict || 0}</p>
            </div>
            <div className="text-3xl">⚔️</div>
          </div>
        </div>
      </div>

      {/* Relationships Network */}
      {relationships.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Relationship Network
          </h3>

          <div className="space-y-4">
            {relationships.map((relationship) => (
              <RelationshipCard
                key={relationship.id}
                relationship={relationship}
                settlements={settlements}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Relationships Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Relationships between settlements will appear here as diplomatic, trade, and conflict interactions develop.
            </p>
          </div>
        </div>
      )}

      {/* Relationship Events History */}
      {relationships.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Relationship Events
          </h3>

          <div className="space-y-3">
            {relationships
              .filter(rel => rel.events && rel.events.length > 0)
              .flatMap(rel =>
                rel.events.map((event, eventIndex) => ({
                  ...event,
                  relationshipId: rel.id,
                  relationshipType: rel.type,
                  participants: rel.participants
                }))
              )
              .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
              .slice(0, 10)
              .map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    event.relationshipType === 'diplomatic' ? 'bg-blue-500' :
                    event.relationshipType === 'trade' ? 'bg-green-500' :
                    event.relationshipType === 'alliance' ? 'bg-purple-500' :
                    'bg-red-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {event.description || 'Relationship event occurred'}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{event.relationshipType}</span>
                      <span>{event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Recent'}</span>
                      {event.significance && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                          ★{event.significance}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {relationships.filter(rel => rel.events && rel.events.length > 0).length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📜</div>
              <p className="text-gray-500 dark:text-gray-400">
                No relationship events recorded yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Alliance Network Visualization */}
      {relationshipStats.alliance > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Alliance Network
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relationships
              .filter(rel => rel.type === 'alliance')
              .map((alliance) => (
                <div key={alliance.id} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                    {alliance.name || `Alliance ${alliance.id}`}
                  </h4>
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    <div className="mb-1">
                      <span className="font-medium">Members:</span> {alliance.participants?.length || 0}
                    </div>
                    <div className="mb-1">
                      <span className="font-medium">Strength:</span> {alliance.strength || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Purpose:</span> {alliance.purpose || 'Mutual protection'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Relationship Card Component
const RelationshipCard = ({ relationship, settlements }) => {
  const getRelationshipIcon = (type) => {
    switch (type) {
      case 'diplomatic': return '🤝';
      case 'trade': return '💰';
      case 'alliance': return '🛡️';
      case 'conflict': return '⚔️';
      default: return '🤝';
    }
  };

  const getRelationshipColor = (type) => {
    switch (type) {
      case 'diplomatic': return 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20';
      case 'trade': return 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20';
      case 'alliance': return 'border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20';
      case 'conflict': return 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700';
    }
  };

  const getSettlementName = (id) => {
    const settlement = settlements.find(s => s.id === id);
    return settlement?.name || `Settlement ${id}`;
  };

  return (
    <div className={`p-4 rounded-lg border ${getRelationshipColor(relationship.type)}`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-2xl">{getRelationshipIcon(relationship.type)}</div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
            {relationship.type} Relationship
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {relationship.description || 'Relationship established'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {relationship.status || 'Active'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ID: {relationship.id}
          </div>
        </div>
      </div>

      {/* Participants */}
      {relationship.participants && relationship.participants.length > 0 && (
        <div className="mb-3">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participants</h5>
          <div className="flex flex-wrap gap-2">
            {relationship.participants.map((participantId, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-white dark:bg-gray-600 rounded">
                {getSettlementName(participantId)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Relationship Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {relationship.strength && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Strength:</span>
            <span className="ml-1 font-medium">{relationship.strength}/100</span>
          </div>
        )}
        {relationship.duration && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
            <span className="ml-1 font-medium">{relationship.duration} turns</span>
          </div>
        )}
        {relationship.value && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Value:</span>
            <span className="ml-1 font-medium">{relationship.value}</span>
          </div>
        )}
        {relationship.lastActivity && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Last Activity:</span>
            <span className="ml-1 font-medium">
              {relationship.lastActivity === 'recent' ? 'Recent' : `${relationship.lastActivity} turns ago`}
            </span>
          </div>
        )}
      </div>

      {/* Special Properties */}
      {relationship.specialProperties && relationship.specialProperties.length > 0 && (
        <div className="mt-3">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Special Properties</h5>
          <div className="flex flex-wrap gap-1">
            {relationship.specialProperties.map((property, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                {property}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldHistorySimInterface;