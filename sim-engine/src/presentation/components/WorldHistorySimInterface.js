import React, { useState, useEffect } from 'react';
import { SkipForward, RotateCcw, Globe, Users, History, Map, TrendingUp, Activity, Settings, Filter, Clock } from 'lucide-react';
import { useSimulationContext } from '../contexts/SimulationContext.js';
import RelationshipVisualizer from '../features/network/RelationshipVisualizer.js';
import StatsDashboard from '../features/historical/components/StatsDashboard.jsx';

// Convert mock turn manager data to timeline-compatible events
const getTimelineEvents = (turnManager) => {
  const recentSummaries = turnManager?.getRecentTurnSummaries?.(10) || [];
  const timelineEvents = [];
  
  // Process recent turn summaries into timeline events
  recentSummaries.forEach((summary, index) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - (recentSummaries.length - index));
    
    // Add turn events
    (summary.events || []).forEach((event, eventIndex) => {
      const eventDate = new Date(baseDate);
      eventDate.setHours(eventDate.getHours() + eventIndex);
      
      timelineEvents.push({
        id: `event-${index}-${eventIndex}`,
        timestamp: eventDate.toISOString(),
        type: event.type || 'general',
        title: event.conversationSummary || event.dialogue || 'Historical Event',
        description: event.dialogue || event.conversationSummary || 'An event occurred',
        characterId: event.speaker || event.character || null,
        significance: event.mood === 'positive' ? 8 : event.mood === 'negative' ? 3 : 5,
        category: event.type || 'social',
        metadata: {
          speaker: event.speaker,
          mood: event.mood,
          consequences: event.consequences,
          turnNumber: summary.turnNumber || index + 1
        }
      });
    });
    
    // Add character changes as events
    (summary.changes || []).forEach((change, changeIndex) => {
      const changeDate = new Date(baseDate);
      changeDate.setHours(changeDate.getHours() + 12 + changeIndex);
      
      timelineEvents.push({
        id: `change-${index}-${changeIndex}`,
        timestamp: changeDate.toISOString(),
        type: change.type || 'character_change',
        title: getChangeTitle(change),
        description: getChangeDescription(change),
        characterId: change.character || change.target || null,
        significance: Math.abs(change.change || 0) > 5 ? 7 : 4,
        category: 'character',
        metadata: {
          changeType: change.type,
          change: change.change,
          fromNode: change.fromNode,
          toNode: change.toNode,
          turnNumber: summary.turnNumber || index + 1
        }
      });
    });
  });
  
  // If no events from simulation, create sample timeline events for demonstration
  if (timelineEvents.length === 0) {
    const sampleEvents = [
      {
        id: 'sample-1',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        type: 'settlement_founded',
        title: 'Village Square Established',
        description: 'The central gathering place of the village was formally established, becoming the heart of community life.',
        characterId: 'elder_marcus',
        significance: 9,
        category: 'settlements',
        metadata: { location: 'Village Square', population: 50 }
      },
      {
        id: 'sample-2',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        type: 'character_arrival',
        title: 'Trader Arrives',
        description: 'Lynn the Trader arrived at the village, bringing exotic goods and tales from distant lands.',
        characterId: 'trader_lynn',
        significance: 6,
        category: 'characters',
        metadata: { from: 'Eastern Kingdoms', goods: 'spices, silk, tools' }
      },
      {
        id: 'sample-3',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        type: 'dialogue',
        title: 'Council Meeting',
        description: 'Elder Marcus convened a village council to discuss recent developments and future plans.',
        characterId: 'elder_marcus',
        significance: 7,
        category: 'social',
        metadata: { participants: ['elder_marcus', 'trader_lynn', 'guard_captain_thor'], topic: 'village security' }
      },
      {
        id: 'sample-4',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        type: 'discovery',
        title: 'Ancient Wisdom Found',
        description: 'Old Willow discovered ancient markings in the forest, revealing forgotten knowledge of the land.',
        characterId: 'forest_hermit',
        significance: 8,
        category: 'events',
        metadata: { location: 'Forest Edge', discovery: 'ancient runes', knowledge: 'nature magic' }
      },
      {
        id: 'sample-5',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        type: 'trade',
        title: 'Market Day Success',
        description: 'The weekly market in the Merchant Quarter saw record attendance and thriving trade.',
        characterId: 'trader_lynn',
        significance: 5,
        category: 'economic',
        metadata: { location: 'Merchant Quarter', value: 150, goods: 'food, crafts, tools' }
      }
    ];
    timelineEvents.push(...sampleEvents);
  }
  
  return timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

// Helper function to generate titles for changes
const getChangeTitle = (change) => {
  switch (change.type) {
    case 'character_moved':
      return `${change.character || 'Character'} relocated`;
    case 'character_emotional_change':
      return `${change.character || 'Character'} emotional shift`;
    case 'character_consciousness_change':
      return `${change.character || 'Character'} consciousness evolved`;
    case 'character_relationships_changed':
      return `Relationship ${change.change > 0 ? 'improved' : 'deteriorated'}`;
    default:
      return 'Character change occurred';
  }
};

// Helper function to generate descriptions for changes
const getChangeDescription = (change) => {
  switch (change.type) {
    case 'character_moved':
      return `Moved from ${change.fromNode || 'unknown location'} to ${change.toNode || 'new location'}`;
    case 'character_emotional_change':
      return 'Experienced significant emotional changes affecting behavior patterns';
    case 'character_consciousness_change':
      return 'Consciousness frequency and coherence parameters evolved';
    case 'character_relationships_changed':
      return `Relationship dynamics shifted by ${Math.abs(change.change || 0)} points`;
    default:
      return 'Character underwent changes affecting their state';
  }
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
    preparedWorldData
  } = useSimulationContext();
  
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

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
        console.log('Processing turn...', currentTurn);
        await processTurn();
        console.log('Turn processed successfully, new turn:', currentTurn + 1);
      } catch (error) {
        console.error('Error processing turn:', error);
      }
    } else {
      console.log('Cannot process turn - conditions not met:', { canProcessTurn, isInitialized, currentTurn });
    }
  };

  // Create a simple turn manager-like object for the interface
  const mockTurnManager = {
    getCurrentStatistics: () => ({
      currentTurn: currentTurn || 0,
      maxTurns: null,
      isPaused: false,
      isProcessing: false,
      historySize: worldState?.events?.length || 0,
      summaryCount: Math.min(currentTurn || 0, 5),
      eventCount: worldState?.events?.length || 0,
      canContinue: canProcessTurn
    }),
    getRecentTurnSummaries: (count = 5) => {
      // Generate some sample summaries if we have a current turn
      if (!currentTurn || currentTurn === 0) return [];
      
      const summaries = [];
      const maxSummaries = Math.min(count, currentTurn);
      
      for (let i = 0; i < maxSummaries; i++) {
        const turnNum = currentTurn - i;
        const sampleDialogues = [
          {
            type: 'dialogue',
            description: 'Trade negotiations between merchants and local authorities',
            speaker: 'Merchant Guild Representative',
            dialogue: 'We propose a 15% reduction in tariffs for bulk grain shipments.',
            response: 'The council will consider your proposal, but we need guarantees on quality.',
            responseBy: 'Trade Commissioner',
            significance: 7,
            consequences: 'Economic policy discussions initiated'
          },
          {
            type: 'social_interaction', 
            description: 'Community gathering to discuss settlement expansion',
            conversationSummary: 'Citizens debated the merits of expanding into the eastern meadows versus fortifying current boundaries.',
            characters: ['Elder Marcus', 'Builder Elena', 'Guard Captain Rex'],
            mood: 'spirited',
            significance: 8,
            consequences: 'Planning committee formed'
          },
          {
            type: 'character_interaction',
            description: 'Romantic encounter between young villagers',
            speaker: 'Maya the Weaver',
            dialogue: 'Would you walk with me to the moonlit grove tonight?',
            response: 'I would be honored to accompany you.',
            responseBy: 'Jonas the Carpenter',
            mood: 'romantic',
            significance: 5,
            consequences: 'Potential future marriage alliance'
          }
        ];

        const eventData = sampleDialogues[i % sampleDialogues.length];
        
        summaries.push({
          turn: turnNum,
          timestamp: new Date(Date.now() - (i * 60000)), // Each turn is 1 minute ago
          summary: `Turn ${turnNum}: ${eventData.description}`,
          changes: [
            {
              type: 'character_moved',
              character: 'Sample Character',
              fromNode: 'Node A',
              toNode: 'Node B',
              reason: 'Seeking new opportunities'
            },
            {
              type: 'character_relationships_changed',
              character: eventData.speaker || 'Character A',
              target: eventData.responseBy || 'Character B',
              change: Math.random() > 0.5 ? 2 : -1,
              context: 'Social interaction outcome'
            },
            {
              type: 'settlement_social_change',
              settlement: 'Main Settlement',
              socialData: {
                cohesion: Math.random() * 0.2 - 0.1,
                morale: Math.random() * 0.3,
                reputation: Math.random() * 0.1
              }
            }
          ],
          events: [
            {
              ...eventData,
              turn: turnNum,
              location: 'Settlement Center'
            }
          ],
          statistics: {
            totalEvents: 1,
            characterInteractions: 1,
            socialEvents: 1,
            economicActivity: Math.floor(Math.random() * 3),
            populationChanges: 0,
            resourceChanges: Math.floor(Math.random() * 2),
            emotionalEvents: eventData.mood ? 1 : 0,
            relationshipChanges: 1
          }
        });
      }
      
      return summaries;
    },
    getRecentEvents: (count = 3) => {
      // Return actual events from worldState if available
      const events = worldState?.events || [];
      
      // If we have real events, return the most recent ones
      if (events.length > 0) {
        return events.slice(-count).map(event => ({
          ...event,
          turn: currentTurn || 0
        }));
      }
      
      // Otherwise, generate some sample events if simulation is running
      if (currentTurn && currentTurn > 0) {
        const sampleEvents = [];
        const dialogueSamples = [
          {
            speaker: 'Merchant Erik',
            dialogue: 'The trade routes have been dangerous lately. Perhaps we should hire more guards?',
            response: 'Your concern is noted. We\'ll discuss this at the next council meeting.',
            responseBy: 'Mayor Aldrich',
            mood: 'concerned'
          },
          {
            speaker: 'Blacksmith Thorin',
            dialogue: 'I\'ve heard rumors of strange lights in the northern hills.',
            conversationSummary: 'Thorin shared local gossip about mysterious phenomena, requesting investigation.',
            mood: 'curious'
          },
          {
            speaker: 'Farmer Sarah',
            dialogue: 'The harvest this year has been abundant, thanks to the new irrigation.',
            response: 'That\'s wonderful news! The settlement prospers.',
            responseBy: 'Village Elder',
            mood: 'grateful'
          }
        ];

        for (let i = 0; i < Math.min(count, currentTurn); i++) {
          const dialogueData = dialogueSamples[i % dialogueSamples.length];
          sampleEvents.push({
            type: i % 3 === 0 ? 'dialogue' : 'character_interaction',
            description: `${dialogueData.speaker} had a conversation about recent events`,
            turn: currentTurn - i,
            timestamp: new Date(Date.now() - (i * 60000)),
            ...dialogueData,
            characters: [dialogueData.speaker, dialogueData.responseBy].filter(Boolean),
            location: 'Settlement Center',
            significance: Math.floor(Math.random() * 8) + 3,
            consequences: i % 2 === 0 ? 'Improved social cohesion' : 'Information spread throughout settlement'
          });
        }
        return sampleEvents;
      }
      
      return [];
    }
  };

  // Simulation control functions using the hook - turn-based approach
  const handleResetSimulation = () => {
    resetSimulation();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Simulation Controls */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isInitialized && simulationReadinessStatus.isSimulationReady ? (
                <button
                  onClick={resetSimulation}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <SkipForward className="w-4 h-4" />
                  Start Simulation
                </button>
              ) : (
                <button
                  onClick={handleNextTurn}
                  disabled={!canProcessTurn}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title={canProcessTurn ? 'Process next turn' : `Cannot process turn - Initialized: ${isInitialized}, Turn: ${currentTurn}`}
                >
                  <SkipForward className="w-4 h-4" />
                  Next Turn
                </button>
              )}
              
              <button
                onClick={handleResetSimulation}
                className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Turn Information */}
              <div className="flex items-center gap-4 ml-4 px-4 py-2 bg-blue-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Turn {currentTurn || 0}</span>
                </div>
                <div className="text-xs opacity-75">
                  Status: {isInitialized ? 'Active' : 'Not Started'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm">Speed:</label>
                <select 
                  value={simulationSpeed} 
                  onChange={(e) => setSimulationSpeed(e.target.value)}
                  className="bg-blue-700 rounded px-2 py-1 text-sm"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="2">2x</option>
                  <option value="5">5x</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm opacity-75">
                {isInitialized ? 'Turn-Based Mode' : 'Not Initialized'}
              </span>
              <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <button className="p-2 hover:bg-blue-700 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {['overview', 'timeline', 'statistics', 'characters', 'settlements', 'relationships'].map(view => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
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
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'overview' && (
          <div className="space-y-6">
            <DashboardView worldState={worldState} turnManager={mockTurnManager} />
          </div>
        )}
        {selectedView === 'timeline' && (
          <div className="space-y-6">
            {/* Simple Timeline Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Timeline View</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Timeline Visualization</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Advanced timeline features will be implemented here
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  Events: {(() => {
                    const events = getTimelineEvents(mockTurnManager);
                    return events.length;
                  })()} • Characters: {worldState?.characters?.length || 0} • Settlements: {worldState?.nodes?.length || 0}
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedView === 'statistics' && (
          <div className="space-y-6">
            <StatsDashboard data={worldState?.events || []} />
            <StatisticsEnhanced turnManager={mockTurnManager} />
          </div>
        )}
        {selectedView === 'characters' && (
          <div className="space-y-6">
            <CharactersView worldState={worldState} selectedCharacter={selectedCharacter} setSelectedCharacter={setSelectedCharacter} />
            <CharacterBehaviorPanel turnManager={mockTurnManager} characters={worldState?.characters || []} />
          </div>
        )}
        {selectedView === 'settlements' && (
          <div className="space-y-6">
            <SettlementsView worldState={worldState} />
            <SettlementBehaviorPanel turnManager={mockTurnManager} nodes={worldState?.nodes || []} />
          </div>
        )}
        {selectedView === 'relationships' && (
          <div className="space-y-6">
            <RelationshipVisualizer />
            <RelationshipDetailsPanel turnManager={mockTurnManager} characters={worldState?.characters || []} />
          </div>
        )}
      </main>
    </div>
  );
};

// Main dashboard view
const DashboardView = ({ worldState, turnManager }) => {
  const [showFilters, setShowFilters] = useState(false);
  const displayWorldState = worldState || {
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
  
  // Use characters array if available, fall back to npcs
  const characters = displayWorldState.characters || displayWorldState.npcs || [];
  
  // Debug logging for events
  console.log('DashboardView - displayWorldState.events:', displayWorldState.events);
  console.log('DashboardView - events length:', displayWorldState.events?.length || 0);
  console.log('DashboardView - characters length:', characters.length);
  
  // Ensure resources object exists and has required properties
  const resources = displayWorldState.resources || { 
    totalGold: 0, 
    totalFood: 0, 
    totalPopulation: characters.length,
    population: characters.length
  };
  
  const filteredEvents = (displayWorldState.events || []);
  console.log('DashboardView - filteredEvents length:', filteredEvents.length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Statistics Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="w-6 h-6" />}
          label="Total Population"
          value={resources.totalPopulation?.toLocaleString() || resources.population?.toLocaleString() || characters.length.toLocaleString()}
          trend="+5%"
          color="blue"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6" />}
          label="Total Resources"
          value={resources.totalGold || 0}
          trend="+12%"
          color="green"
        />
        <StatCard 
          icon={<Globe className="w-6 h-6" />}
          label="Active Settlements"
          value={displayWorldState.nodes.length}
          color="purple"
        />
        <StatCard 
          icon={<Activity className="w-6 h-6" />}
          label="Historical Events"
          value={displayWorldState.events?.length || 0}
          color="orange"
        />
      </div>

      {/* World Map with Node Visualization */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Map className="w-5 h-5" />
          World Map
        </h3>
        <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
          <NodeVisualization nodes={displayWorldState.nodes} characters={characters} />
        </div>
        
        {/* Settlement Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {displayWorldState.nodes.slice(0, 6).map(node => (
            <div
              key={node.id}
              className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <p className="font-medium text-sm">{node.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pop: {(node.assignedCharacters?.length || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Events & Dialogue
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(() => {
            const recentSummaries = turnManager.getRecentTurnSummaries(3);
            const allEvents = [];
            
            // Combine events from recent summaries
            recentSummaries.forEach(summary => {
              if (summary.events) {
                summary.events.forEach(event => {
                  allEvents.push({
                    ...event,
                    turn: summary.turn,
                    timestamp: summary.timestamp
                  });
                });
              }
            });
            
            // Add legacy events for display
            filteredEvents.slice(-3).forEach(event => {
              allEvents.push({
                ...event,
                type: event.type || 'historical_event',
                turn: event.timestamp || 'Unknown'
              });
            });
            
            return allEvents.slice(-5).reverse().map((event, index) => (
              <div key={event.id || index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-r-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {event.dialogue && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {event.speaker || 'Unknown Speaker'}
                          {event.mood && <span className="text-xs text-gray-500 ml-2">({event.mood})</span>}
                        </p>
                        <p className="text-sm italic text-gray-700 dark:text-gray-300 mt-1">
                          "{event.dialogue.length > 80 ? event.dialogue.substring(0, 80) + '...' : event.dialogue}"
                        </p>
                        {event.response && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <span className="font-medium">{event.responseBy}:</span> "{event.response.length > 60 ? event.response.substring(0, 60) + '...' : event.response}"
                          </p>
                        )}
                      </div>
                    )}
                    
                    {event.conversationSummary && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {event.conversationSummary}
                      </p>
                    )}
                    
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {event.description}
                    </p>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Turn {event.turn} • {event.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {event.consequences && <span className="ml-2">→ {event.consequences}</span>}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ml-3 ${
                    (event.significance || 5) > 7 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    (event.significance || 5) > 4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {event.significance || 5}/10
                  </span>
                </div>
              </div>
            ));
          })()}
          
          {filteredEvents.length === 0 && turnManager.getRecentTurnSummaries(1).length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent events</p>
              <p className="text-sm">Events will appear here as the simulation progresses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Characters view
const CharactersView = ({ worldState, selectedCharacter, setSelectedCharacter }) => {
  const displayWorldState = worldState || { npcs: [], characters: [] };
  // Use characters array if available, fall back to npcs
  const characters = displayWorldState.characters || displayWorldState.npcs || [];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Characters ({characters.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {characters.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No characters available in simulation
              </p>
            ) : (
              characters.map(character => (
                <button
                  key={character.id}
                  onClick={() => setSelectedCharacter(character)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCharacter?.id === character.id 
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' 
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                >
                  <p className="font-medium">{character.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {character.race || character.type || 'Character'} • {character.location || character.currentNodeId || 'Unknown Location'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedCharacter ? (
          <CharacterDetail character={selectedCharacter} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p>Select a character to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for character details
const CharacterDetail = ({ character }) => {
  // Safely handle missing or different data structures
  const consciousness = character.consciousness || { frequency: 0, coherence: 0 };
  const attributes = character.attributes || {};
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">{character.name}</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Basic Info</h4>
          <div className="space-y-2">
            <p><span className="text-gray-500">Race:</span> {character.race || 'Unknown'}</p>
            <p><span className="text-gray-500">Location:</span> {character.location || character.currentNodeId || 'Unknown'}</p>
            {character.age && <p><span className="text-gray-500">Age:</span> {character.age}</p>}
            {character.class && <p><span className="text-gray-500">Class:</span> {character.class}</p>}
          </div>
        </div>
        
        {character.consciousness ? (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Consciousness</h4>
            <div className="space-y-2">
              <p><span className="text-gray-500">Frequency:</span> {consciousness.frequency} Hz</p>
              <p><span className="text-gray-500">Coherence:</span> {(consciousness.coherence * 100).toFixed(0)}%</p>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Personality</h4>
            <div className="space-y-2">
              {character.personality?.traits && (
                <p><span className="text-gray-500">Traits:</span> {character.personality.traits.join(', ')}</p>
              )}
              {character.personality?.motivations && (
                <p><span className="text-gray-500">Motivations:</span> {character.personality.motivations.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {Object.keys(attributes).length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Attributes</h4>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(attributes).map(([attr, value]) => {
              // Handle both simple numbers and D&D style {score, modifier} objects
              const displayValue = typeof value === 'object' && value.score !== undefined 
                ? `${value.score} (${value.modifier >= 0 ? '+' : ''}${value.modifier})`
                : value;
              
              return (
                <div key={attr} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{attr}</p>
                  <p className="text-lg font-semibold">{displayValue}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {character.background && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Background</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{character.background}</p>
        </div>
      )}
    </div>
  );
};

// Component for settlements view
const SettlementsView = ({ worldState }) => {
  const displayWorldState = worldState || { nodes: [] };

  if (displayWorldState.nodes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Settlements Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create some nodes in your world to see settlement information here.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Settlements will show population, resources, and other details once your world has nodes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {displayWorldState.nodes.map(node => (
        <div key={node.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">{node.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Type: {node.type}</p>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Population</span>
              <span className="font-medium">{(node.assignedCharacters?.length || 0).toLocaleString()}</span>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Resources</p>
              {node.resourceAvailability && Object.keys(node.resourceAvailability).length > 0 ? (
                Object.entries(node.resourceAvailability).map(([resource, amount]) => (
                  <div key={resource} className="flex justify-between text-sm">
                    <span className="capitalize">{resource}</span>
                    <span>{amount}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No resources defined</p>
              )}
            </div>

            {node.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-sm">{node.description}</p>
              </div>
            )}

            {node.environmentalProperties && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Environment</p>
                <p className="text-sm capitalize">{node.environmentalProperties.climate || 'Unknown'}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Node Visualization Component - Simple squares for nodes, dots for characters
const NodeVisualization = ({ nodes = [], characters = [] }) => {
  // Create a simple grid layout for nodes
  const gridSize = Math.ceil(Math.sqrt(nodes.length || 1));
  
  return (
    <div className="w-full h-full relative">
      {nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
          <div>
            <Globe className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p>No nodes to display</p>
            <p className="text-sm">Nodes will appear here when simulation starts</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 h-full p-4" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
          {nodes.map((node, index) => {
            // Get characters assigned to this node
            const nodeCharacters = characters.filter(char => 
              char.currentNodeId === node.id || 
              char.assignments?.nodes?.has?.(node.id) ||
              char.assignedNodeIds?.includes?.(node.id)
            );
            
            return (
              <div 
                key={node.id} 
                className="relative bg-blue-200 dark:bg-blue-700 border-2 border-blue-400 dark:border-blue-500 rounded-lg p-2 flex flex-col items-center justify-center min-h-[80px] hover:bg-blue-300 dark:hover:bg-blue-600 transition-colors cursor-pointer"
                title={`${node.name} - ${nodeCharacters.length} characters`}
              >
                {/* Node square */}
                <div className="text-xs font-semibold text-center text-blue-900 dark:text-blue-100 mb-1">
                  {node.name}
                </div>
                
                {/* Character dots */}
                {nodeCharacters.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {nodeCharacters.slice(0, 6).map((char, charIndex) => (
                      <div 
                        key={char.id || charIndex}
                        className="w-2 h-2 bg-green-500 rounded-full"
                        title={char.name || `Character ${charIndex + 1}`}
                      />
                    ))}
                    {nodeCharacters.length > 6 && (
                      <div 
                        className="w-2 h-2 bg-yellow-500 rounded-full"
                        title={`+${nodeCharacters.length - 6} more characters`}
                      />
                    )}
                  </div>
                )}
                
                {/* Population count */}
                <div className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                  {nodeCharacters.length}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-200 border-2 border-blue-400 rounded"></div>
            <span>Settlement</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Character</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat card component
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

// Enhanced Statistics Panel
const StatisticsEnhanced = ({ turnManager }) => {
  const stats = turnManager?.getCurrentStatistics?.() || {};
  const recentSummaries = turnManager?.getRecentTurnSummaries?.(5) || [];
  
  // Aggregate statistics from recent turns
  const aggregatedStats = recentSummaries.reduce((acc, summary) => {
    Object.entries(summary.statistics || {}).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + (typeof value === 'number' ? value : 0);
    });
    return acc;
  }, {});

  // Combine current stats with aggregated stats
  const combinedStats = { ...stats, ...aggregatedStats };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Enhanced Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(combinedStats).map(([key, value]) => (
          <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Character Behavior Panel
const CharacterBehaviorPanel = ({ turnManager, characters }) => {
  const recentSummaries = turnManager?.getRecentTurnSummaries?.(3) || [];
  
  // Extract character-related changes from recent turns
  const characterChanges = recentSummaries.flatMap(summary => 
    (summary.changes || []).filter(change => change.type.includes('character'))
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Character Behavior Analysis</h3>
      
      {characterChanges.length > 0 ? (
        <div className="space-y-3">
          {characterChanges.slice(0, 5).map((change, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg">
                {change.type === 'character_moved' && '🚶'}
                {change.type === 'character_emotional_change' && '😊'}
                {change.type === 'character_consciousness_change' && '🧠'}
                {change.type === 'character_relationships_changed' && '💕'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {change.character || 'Unknown Character'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {change.type === 'character_moved' && `Moved from ${change.fromNode} to ${change.toNode}`}
                  {change.type === 'character_emotional_change' && 'Emotional state changed'}
                  {change.type === 'character_consciousness_change' && 'Consciousness evolved'}
                  {change.type === 'character_relationships_changed' && `Relationship ${change.change > 0 ? 'improved' : 'deteriorated'}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No recent character behavior changes</p>
      )}
    </div>
  );
};

// Settlement Behavior Panel
const SettlementBehaviorPanel = ({ turnManager, nodes }) => {
  const recentSummaries = turnManager?.getRecentTurnSummaries?.(3) || [];
  
  // Extract settlement-related changes from recent turns
  const settlementChanges = recentSummaries.flatMap(summary => 
    (summary.changes || []).filter(change => 
      change.type.includes('settlement') || change.type.includes('node')
    )
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Settlement Behavior Analysis</h3>
      
      {settlementChanges.length > 0 ? (
        <div className="space-y-3">
          {settlementChanges.slice(0, 5).map((change, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg">
                {change.type.includes('economic') && '💰'}
                {change.type.includes('social') && '🏛️'}
                {change.type.includes('population') && '👥'}
                {change.type.includes('resources') && '📦'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {change.settlement || change.node || 'Settlement'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {change.type.includes('economic') && 'Economic activity detected'}
                  {change.type.includes('social') && 'Social changes occurred'}
                  {change.type.includes('population') && `Population ${change.change > 0 ? 'increased' : 'decreased'}`}
                  {change.type.includes('resources') && 'Resource changes detected'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No recent settlement behavior changes</p>
      )}
    </div>
  );
};

// Relationship Details Panel
const RelationshipDetailsPanel = ({ turnManager, characters }) => {
  const recentSummaries = turnManager?.getRecentTurnSummaries?.(3) || [];
  
  // Extract relationship-related changes and events
  const relationshipData = recentSummaries.flatMap(summary => [
    ...(summary.changes || []).filter(change => change.type.includes('relationship')),
    ...(summary.events || []).filter(event => ['dialogue', 'social_interaction', 'romance', 'friendship'].includes(event.type))
  ]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Relationship Dynamics</h3>
      
      {relationshipData.length > 0 ? (
        <div className="space-y-3">
          {relationshipData.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg">
                {item.type === 'dialogue' && '💬'}
                {item.type === 'social_interaction' && '👥'}
                {item.type === 'romance' && '💕'}
                {item.type === 'friendship' && '🤝'}
                {item.type === 'character_relationships_changed' && '💭'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {item.dialogue && (
                    <>
                      <span className="text-blue-600 dark:text-blue-400">{item.speaker}:</span>
                      <span className="ml-1">"{item.dialogue.substring(0, 50)}..."</span>
                    </>
                  )}
                  {item.conversationSummary && (
                    <span>{item.conversationSummary.substring(0, 60)}...</span>
                  )}
                  {item.character && item.target && (
                    <span>{item.character} ↔ {item.target}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.mood && `Mood: ${item.mood}`}
                  {item.consequences && `→ ${item.consequences}`}
                  {item.change && `Relationship ${item.change > 0 ? 'improved' : 'declined'} by ${Math.abs(item.change)}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No recent relationship activity</p>
      )}
    </div>
  );
};

export default WorldHistorySimInterface;