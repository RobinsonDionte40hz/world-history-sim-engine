import React, { useState, useEffect, useRef } from 'react';
// No Lucide React imports needed - using emojis instead
import { useSimulationContext } from '../contexts/SimulationContext.js';
import DecisionAnalysisService from '../../domain/services/DecisionAnalysisService.js';

// Convert real world state and turn manager data to timeline-compatible events
const getTimelineEvents = (turnManager, worldState, currentTurn) => {
  const timelineEvents = [];

  // Get real events from worldState
  const worldEvents = worldState?.events || [];
  const characters = worldState?.characters || [];
  const nodes = worldState?.nodes || [];

  // Process real world events
  worldEvents.forEach((event, index) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - (worldEvents.length - index));

    timelineEvents.push({
      id: event.id || `world-event-${index}`,
      timestamp: event.timestamp || baseDate.toISOString(),
      type: event.type || 'general',
      title: event.title || event.description || 'World Event',
      description: event.description || event.details || 'An event occurred in the world',
      characterId: event.characterId || event.speaker || null,
      significance: event.significance || 5,
      category: event.category || 'events',
      metadata: {
        ...event.metadata,
        turnNumber: event.turn || currentTurn || 0,
        location: event.location,
        participants: event.participants
      }
    });
  });

  // Process character-related events from turn summaries
  const recentSummaries = turnManager?.getRecentTurnSummaries?.(10) || [];
  recentSummaries.forEach((summary, summaryIndex) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - (recentSummaries.length - summaryIndex));

    // Add character changes as events
    (summary.changes || []).forEach((change, changeIndex) => {
      const changeDate = new Date(baseDate);
      changeDate.setHours(changeDate.getHours() + changeIndex);

      // Find the actual character from worldState
      const character = characters.find(c => c.id === change.character || c.name === change.character);

      timelineEvents.push({
        id: `change-${summaryIndex}-${changeIndex}`,
        timestamp: changeDate.toISOString(),
        type: change.type || 'character_change',
        title: getChangeTitle(change, character),
        description: getChangeDescription(change, character),
        characterId: character?.id || change.character,
        significance: Math.abs(change.change || 0) > 5 ? 7 : 4,
        category: 'characters',
        metadata: {
          changeType: change.type,
          change: change.change,
          fromNode: change.fromNode,
          toNode: change.toNode,
          turnNumber: summary.turnNumber || summaryIndex + 1,
          characterName: character?.name
        }
      });
    });

    // Add dialogue and social events
    (summary.events || []).forEach((event, eventIndex) => {
      const eventDate = new Date(baseDate);
      eventDate.setHours(eventDate.getHours() + eventIndex);

      // Find the actual character from worldState
      const character = characters.find(c => c.id === event.speaker || c.name === event.speaker);

      timelineEvents.push({
        id: `dialogue-${summaryIndex}-${eventIndex}`,
        timestamp: eventDate.toISOString(),
        type: event.type || 'social',
        title: event.conversationSummary || `${event.speaker || 'Character'} spoke`,
        description: event.dialogue || event.conversationSummary || 'A conversation took place',
        characterId: character?.id || event.speaker,
        significance: event.significance || 5,
        category: 'social',
        metadata: {
          speaker: event.speaker,
          mood: event.mood,
          response: event.response,
          responseBy: event.responseBy,
          consequences: event.consequences,
          turnNumber: summary.turnNumber || summaryIndex + 1,
          characterName: character?.name
        }
      });
    });
  });

  // Add settlement/node-related events
  nodes.forEach((node, nodeIndex) => {
    // Check if this is a newly created settlement (based on turn number)
    if (node.createdTurn && currentTurn) {
      const creationDate = new Date();
      creationDate.setDate(creationDate.getDate() - (currentTurn - node.createdTurn));

      timelineEvents.push({
        id: `settlement-${node.id}`,
        timestamp: creationDate.toISOString(),
        type: 'settlement_founded',
        title: `${node.name} Established`,
        description: `${node.name} was founded as a ${node.type} settlement.`,
        characterId: node.founder || null,
        significance: 8,
        category: 'settlements',
        metadata: {
          location: node.name,
          type: node.type,
          population: node.assignedCharacters?.length || 0,
          turnNumber: node.createdTurn
        }
      });
    }

    // Add population changes
    if (node.populationHistory && node.populationHistory.length > 1) {
      node.populationHistory.forEach((popData, popIndex) => {
        if (popIndex > 0) {
          const prevPop = node.populationHistory[popIndex - 1].population;
          const change = popData.population - prevPop;

          if (Math.abs(change) > 0) {
            const popDate = new Date();
            popDate.setDate(popDate.getDate() - (node.populationHistory.length - popIndex));

            timelineEvents.push({
              id: `population-${node.id}-${popIndex}`,
              timestamp: popDate.toISOString(),
              type: 'population_change',
              title: `${node.name} Population ${change > 0 ? 'Grew' : 'Declined'}`,
              description: `Population of ${node.name} changed by ${Math.abs(change)} to ${popData.population}.`,
              characterId: null,
              significance: Math.abs(change) > 5 ? 6 : 3,
              category: 'settlements',
              metadata: {
                settlement: node.name,
                change: change,
                newPopulation: popData.population,
                turnNumber: popData.turn
              }
            });
          }
        }
      });
    }
  });

  // Add relationship events
  characters.forEach((character, charIndex) => {
    if (character.relationships && Object.keys(character.relationships).length > 0) {
      Object.entries(character.relationships).forEach(([targetId, relationship], relIndex) => {
        const targetChar = characters.find(c => c.id === targetId);
        if (targetChar && relationship.lastInteraction) {
          const relDate = new Date();
          relDate.setDate(relDate.getDate() - (currentTurn - (relationship.lastInteractionTurn || 1)));

          timelineEvents.push({
            id: `relationship-${character.id}-${targetId}`,
            timestamp: relDate.toISOString(),
            type: 'relationship_interaction',
            title: `${character.name} & ${targetChar.name} Interaction`,
            description: `${character.name} interacted with ${targetChar.name}, affecting their relationship.`,
            characterId: character.id,
            significance: Math.abs(relationship.strength || 0) > 50 ? 6 : 4,
            category: 'social',
            metadata: {
              targetCharacter: targetChar.name,
              relationshipStrength: relationship.strength || 0,
              relationshipType: relationship.type || 'acquaintance',
              lastInteraction: relationship.lastInteraction,
              turnNumber: relationship.lastInteractionTurn || currentTurn
            }
          });
        }
      });
    }
  });

  // Add resource and economic events from settlements
  nodes.forEach((node, nodeIndex) => {
    if (node.resourceHistory && node.resourceHistory.length > 1) {
      node.resourceHistory.forEach((resData, resIndex) => {
        if (resIndex > 0) {
          const prevRes = node.resourceHistory[resIndex - 1];
          const changes = Object.keys(resData.resources || {}).filter(resource => {
            const prevAmount = prevRes.resources?.[resource] || 0;
            const currentAmount = resData.resources[resource] || 0;
            return Math.abs(currentAmount - prevAmount) > 10; // Significant change threshold
          });

          if (changes.length > 0) {
            const resDate = new Date();
            resDate.setDate(resDate.getDate() - (node.resourceHistory.length - resIndex));

            timelineEvents.push({
              id: `resources-${node.id}-${resIndex}`,
              timestamp: resDate.toISOString(),
              type: 'resource_change',
              title: `${node.name} Resource Changes`,
              description: `Significant resource changes occurred in ${node.name}: ${changes.join(', ')}.`,
              characterId: null,
              significance: changes.length > 3 ? 7 : 5,
              category: 'economic',
              metadata: {
                settlement: node.name,
                changedResources: changes,
                turnNumber: resData.turn
              }
            });
          }
        }
      });
    }
  });

  // If no events from simulation, create minimal sample events for demonstration
  if (timelineEvents.length === 0 && currentTurn && currentTurn > 0) {
    const sampleEvents = [
      {
        id: 'sample-1',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'settlement_founded',
        title: 'First Settlement Established',
        description: 'The first settlement was established, marking the beginning of civilization.',
        characterId: characters[0]?.id || 'unknown',
        significance: 9,
        category: 'settlements',
        metadata: {
          location: nodes[0]?.name || 'Settlement',
          population: characters.length,
          turnNumber: 1
        }
      },
      {
        id: 'sample-2',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'character_arrival',
        title: `${characters[0]?.name || 'First Character'} Appeared`,
        description: `${characters[0]?.name || 'A character'} emerged as the first inhabitant.`,
        characterId: characters[0]?.id || 'unknown',
        significance: 8,
        category: 'characters',
        metadata: {
          race: characters[0]?.race || 'Unknown',
          location: characters[0]?.currentNodeId || 'Settlement',
          turnNumber: 1
        }
      }
    ];
    timelineEvents.push(...sampleEvents);
  }

  return timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

// Helper function to generate titles for changes
const getChangeTitle = (change, character) => {
  const charName = character?.name || change.character || 'Character';
  switch (change.type) {
    case 'character_moved':
      return `${charName} relocated`;
    case 'character_emotional_change':
      return `${charName} emotional shift`;
    case 'character_consciousness_change':
      return `${charName} consciousness evolved`;
    case 'character_relationships_changed':
      return `Relationship ${change.change > 0 ? 'improved' : 'deteriorated'}`;
    case 'population_change':
      return `${change.settlement || 'Settlement'} population changed`;
    default:
      return `${charName} change occurred`;
  }
};

// Helper function to generate descriptions for changes
const getChangeDescription = (change, character) => {
  const charName = character?.name || change.character || 'Character';
  switch (change.type) {
    case 'character_moved':
      return `Moved from ${change.fromNode || 'unknown location'} to ${change.toNode || 'new location'}`;
    case 'character_emotional_change':
      return `${charName} experienced significant emotional changes affecting behavior patterns`;
    case 'character_consciousness_change':
      return `${charName} consciousness frequency and coherence parameters evolved`;
    case 'character_relationships_changed':
      return `Relationship dynamics shifted by ${Math.abs(change.change || 0)} points`;
    case 'population_change':
      return `Population ${change.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change.change)} to ${change.newPopulation}`;
    default:
      return `${charName} underwent changes affecting their state`;
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

  // Track if we've already auto-initialized to prevent unwanted resaving on refresh
  const hasAutoInitializedRef = useRef(false);

  // Auto-initialize simulation when prepared world data is available but not initialized
  useEffect(() => {
    if (simulationReadinessStatus.isSimulationReady && !isInitialized && preparedWorldData && !hasAutoInitializedRef.current) {
      console.log('Auto-initializing simulation with prepared world data');
      // Mark that we've auto-initialized to prevent repeated saves on refresh
      hasAutoInitializedRef.current = true;
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
                  <span className="text-lg">▶️</span>
                  Start Simulation
                </button>
              ) : (
                <button
                  onClick={handleNextTurn}
                  disabled={!canProcessTurn}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title={canProcessTurn ? 'Process next turn' : `Cannot process turn - Initialized: ${isInitialized}, Turn: ${currentTurn}`}
                >
                  <span className="text-lg">▶️</span>
                  Next Turn
                </button>
              )}
              
              <button
                onClick={handleResetSimulation}
                className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800"
                title="Reset Simulation"
              >
                <span className="text-lg">🔄</span>
              </button>

              {/* Turn Information */}
              <div className="flex items-center gap-4 ml-4 px-4 py-2 bg-blue-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🕒</span>
                  <span className="text-sm font-medium">Turn {currentTurn || 0}</span>
                </div>
                <div className="text-xs opacity-75">
                  Status: {isInitialized ? 'Active' : 'Not Started'}
                </div>
                <div className="text-xs opacity-75">
                  Characters: {worldState?.characters?.length || 0}
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
                <span className="text-lg">⚙️</span>
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
            <DashboardView worldState={worldState} turnManager={mockTurnManager} currentTurn={currentTurn} />
          </div>
        )}
        {selectedView === 'timeline' && (
          <div className="space-y-6">
            <UnifiedTimelineView
              worldState={worldState}
              turnManager={mockTurnManager}
              currentTurn={currentTurn}
            />
          </div>
        )}
        {selectedView === 'statistics' && (
          <div className="space-y-6">
            <UnifiedStatisticsView 
              worldState={worldState} 
              turnManager={mockTurnManager}
              data={worldState?.events || []}
            />
          </div>
        )}
        {selectedView === 'characters' && (
          <div className="space-y-6">
            <UnifiedCharactersView 
              worldState={worldState} 
              turnManager={mockTurnManager}
              selectedCharacter={selectedCharacter}
              setSelectedCharacter={setSelectedCharacter}
            />
          </div>
        )}
        {selectedView === 'settlements' && (
          <div className="space-y-6">
            <UnifiedSettlementsView 
              worldState={worldState} 
              turnManager={mockTurnManager}
            />
          </div>
        )}
        {selectedView === 'relationships' && (
          <div className="space-y-6">
            <UnifiedRelationshipsView 
              worldState={worldState} 
              turnManager={mockTurnManager}
            />
          </div>
        )}
      </main>
    </div>
  );
};

// Main dashboard view
const DashboardView = ({ worldState, turnManager, currentTurn }) => {
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

  // Use characters array if available, fall back to npcs, ensure it's always an array
  const characters = Array.isArray(displayWorldState.characters)
    ? displayWorldState.characters
    : Array.isArray(displayWorldState.npcs)
    ? displayWorldState.npcs
    : [];

  // Ensure nodes is always an array
  const nodes = Array.isArray(displayWorldState.nodes) ? displayWorldState.nodes : [];

  // Ensure events is always an array
  const events = Array.isArray(displayWorldState.events) ? displayWorldState.events : [];

  // Debug logging for events
  console.log('DashboardView - displayWorldState.events:', events);
  console.log('DashboardView - events length:', events.length);
  console.log('DashboardView - characters length:', characters.length);

  // Ensure resources object exists and has required properties
  const resources = displayWorldState.resources || {
    totalGold: 0,
    totalFood: 0,
    totalPopulation: characters.length,
    population: characters.length
  };

  const filteredEvents = events;
  console.log('DashboardView - filteredEvents length:', filteredEvents.length);

  // Get real timeline events for recent activity
  const timelineEvents = getTimelineEvents(turnManager, worldState, currentTurn);
  const recentEvents = timelineEvents.slice(-5).reverse(); // Most recent 5 events

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Statistics Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<span className="text-2xl">👥</span>}
          label="Total Population"
          value={characters.length.toLocaleString()}
          trend={characters.length > 0 ? "+Active" : "Starting"}
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
          value={nodes.length}
          trend={nodes.length > 0 ? "+Established" : "Planning"}
          color="purple"
        />
        <StatCard 
          icon={<span className="text-2xl">⚡</span>}
          label="Historical Events"
          value={timelineEvents.length.toLocaleString()}
          trend={timelineEvents.length > 0 ? "+Recorded" : "Beginning"}
          color="orange"
        />
      </div>

      {/* Demo NPCs Profile Section */}
      <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">🎭</span>
          Demo Characters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {characters.length > 0 ? (
            characters.slice(0, 4).map((character, index) => {
              // Get color scheme based on character index
              const colorSchemes = [
                {
                  bg: 'from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900',
                  border: 'border-blue-200 dark:border-blue-700',
                  text: 'text-blue-900 dark:text-blue-100',
                  accent: 'text-blue-700 dark:text-blue-300',
                  accentDark: 'text-blue-800 dark:text-blue-200'
                },
                {
                  bg: 'from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900',
                  border: 'border-green-200 dark:border-green-700',
                  text: 'text-green-900 dark:text-green-100',
                  accent: 'text-green-700 dark:text-green-300',
                  accentDark: 'text-green-800 dark:text-green-200'
                },
                {
                  bg: 'from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900',
                  border: 'border-red-200 dark:border-red-700',
                  text: 'text-red-900 dark:text-red-100',
                  accent: 'text-red-700 dark:text-red-300',
                  accentDark: 'text-red-800 dark:text-red-200'
                },
                {
                  bg: 'from-purple-50 to-violet-50 dark:from-purple-900 dark:to-violet-900',
                  border: 'border-purple-200 dark:border-purple-700',
                  text: 'text-purple-900 dark:text-purple-100',
                  accent: 'text-purple-700 dark:text-purple-300',
                  accentDark: 'text-purple-800 dark:text-purple-200'
                }
              ];

              const scheme = colorSchemes[index % colorSchemes.length];

              // Get emoji based on character class/race
              const getCharacterEmoji = (character) => {
                const race = character.race?.toLowerCase() || '';
                const charClass = character.class?.toLowerCase() || '';

                if (race.includes('elf')) return '🧝';
                if (race.includes('dwarf')) return '🪓';
                if (race.includes('human')) {
                  if (charClass.includes('merchant') || charClass.includes('trader')) return '💰';
                  if (charClass.includes('guard') || charClass.includes('fighter')) return '⚔️';
                  if (charClass.includes('mage') || charClass.includes('wizard')) return '🧙‍♂️';
                  if (charClass.includes('cleric') || charClass.includes('priest')) return '⛪';
                  return '👤';
                }
                if (charClass.includes('scientist') || charClass.includes('researcher')) return '🔬';
                if (charClass.includes('administrator') || charClass.includes('governor')) return '👔';
                if (charClass.includes('miner')) return '⛏️';
                if (charClass.includes('communications')) return '📡';
                if (charClass.includes('pirate')) return '🏴‍☠️';
                if (charClass.includes('innkeeper')) return '🍺';

                return '🎭';
              };

              return (
                <div
                  key={character.id || index}
                  className={`bg-gradient-to-br ${scheme.bg} rounded-lg p-4 border ${scheme.border}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getCharacterEmoji(character)}</span>
                    <div>
                      <h4 className={`font-semibold ${scheme.text}`}>{character.name}</h4>
                      <p className={`text-xs ${scheme.accent}`}>
                        {character.race || 'Character'}, {character.age || '?'} years
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {character.personality?.traits && (
                      <div>
                        <span className={`font-medium ${scheme.accentDark}`}>Traits:</span>
                        <span className={`ml-1 ${scheme.accent}`}>
                          {Array.isArray(character.personality.traits)
                            ? character.personality.traits.slice(0, 3).join(', ')
                            : character.personality.traits}
                        </span>
                      </div>
                    )}
                    {character.personality?.motivations && (
                      <div>
                        <span className={`font-medium ${scheme.accentDark}`}>Goals:</span>
                        <span className={`ml-1 ${scheme.accent}`}>
                          {Array.isArray(character.personality.motivations)
                            ? character.personality.motivations.slice(0, 2).join(', ')
                            : character.personality.motivations}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className={`font-medium ${scheme.accentDark}`}>Location:</span>
                      <span className={`ml-1 ${scheme.accent}`}>
                        {character.location || character.currentNodeId || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Fallback for when no characters are available
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              <span className="text-4xl">🎭</span>
              <p>No characters available in the current simulation</p>
              <p className="text-sm">Characters will appear here once the simulation is running</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">💡 About the Characters:</span> Each NPC has unique personality traits that drive their decision-making. 
            Their motivations influence which interactions they choose, creating emergent storytelling as they pursue their individual goals 
            while responding to their environment and energy levels.
          </p>
        </div>
      </div>

      {/* World Map with Node Visualization */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          World Map
        </h3>
        <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
          <NodeVisualization 
            nodes={nodes} 
            characters={characters}
            turnManager={turnManager}
          />
        </div>
        
        {/* Settlement Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {nodes.slice(0, 6).map(node => {
            // Get real character count for this node
            const nodeCharacters = characters.filter(char =>
              char.currentNodeId === node.id ||
              char.assignments?.nodes?.has?.(node.id) ||
              char.assignedNodeIds?.includes?.(node.id)
            );

            return (
              <div
                key={node.id}
                className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <p className="font-medium text-sm">{node.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pop: {nodeCharacters.length.toLocaleString()}
                </p>
                {node.type && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {node.type}
                  </p>
                )}
                {node.environmentalProperties?.climate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {node.environmentalProperties.climate}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Events Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-lg">📜</span>
            Recent Events & Dialogue
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <span className="text-lg">🔍</span>
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(() => {
            // Use real timeline events instead of mock data
            return recentEvents.map((event, index) => (
              <div key={event.id || index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-r-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {event.type === 'character_arrival' && '👋'}
                        {event.type === 'settlement_founded' && '🏘️'}
                        {event.type === 'character_moved' && '🚶'}
                        {event.type === 'dialogue' && '💬'}
                        {event.type === 'relationship_interaction' && '💕'}
                        {event.type === 'resource_change' && '📦'}
                        {event.type === 'population_change' && '👥'}
                        {!['character_arrival', 'settlement_founded', 'character_moved', 'dialogue', 'relationship_interaction', 'resource_change', 'population_change'].includes(event.type) && '📅'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.category === 'characters' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        event.category === 'settlements' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        event.category === 'social' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                        event.category === 'economic' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {event.category}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {event.title}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Turn {event.metadata?.turnNumber || 'N/A'}</span>
                      {event.characterId && (
                        <span>
                          {event.metadata?.characterName ||
                            characters.find(c => c.id === event.characterId)?.name ||
                            event.characterId}
                        </span>
                      )}
                      {event.metadata?.location && (
                        <span>{event.metadata.location}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full ${
                        event.significance > 7 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        event.significance > 4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {event.significance}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ));
          })()}

          {recentEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-2">📜</span>
              <p>No recent events</p>
              <p className="text-sm">Events will appear here as the simulation progresses</p>
              {characters.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>World Status:</strong> {characters.length} character{characters.length !== 1 ? 's' : ''} present
                    {displayWorldState.nodes.length > 0 && `, ${displayWorldState.nodes.length} settlement${displayWorldState.nodes.length !== 1 ? 's' : ''} established`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Unified Characters View - Combines character list with behavior analysis
// Updated: Force module refresh
const UnifiedCharactersView = ({ worldState, turnManager, selectedCharacter, setSelectedCharacter }) => {
  const displayWorldState = worldState || { npcs: [], characters: [] };
  
  // Ensure characters is always an array
  const characters = Array.isArray(displayWorldState.characters)
    ? displayWorldState.characters
    : Array.isArray(displayWorldState.npcs)
    ? displayWorldState.npcs
    : [];
  const recentSummaries = turnManager?.getRecentTurnSummaries?.(3) || [];
  const characterChanges = recentSummaries.flatMap(summary =>
    (summary.changes || []).filter(change => change.type.includes('character'))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Characters & Behavior Analysis
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive view of all characters and their behavioral patterns
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total: {characters.length}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <span className="text-lg">👤</span>
              Add Character
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Character List</h3>
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

        {/* Character Details */}
        <div className="lg:col-span-2">
          {selectedCharacter ? (
            <div className="space-y-6">
              {/* Character Detail */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">{selectedCharacter.name}</h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Basic Info</h4>
                    <div className="space-y-2">
                      <p><span className="text-gray-500">Race:</span> {selectedCharacter.race || 'Unknown'}</p>
                      <p><span className="text-gray-500">Location:</span> {selectedCharacter.location || selectedCharacter.currentNodeId || 'Unknown'}</p>
                      {selectedCharacter.age && <p><span className="text-gray-500">Age:</span> {selectedCharacter.age}</p>}
                      {selectedCharacter.class && <p><span className="text-gray-500">Class:</span> {selectedCharacter.class}</p>}
                    </div>
                  </div>

                  {selectedCharacter.consciousness ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Consciousness</h4>
                      <div className="space-y-2">
                        <p><span className="text-gray-500">Frequency:</span> {selectedCharacter.consciousness.frequency} Hz</p>
                        <p><span className="text-gray-500">Coherence:</span> {(selectedCharacter.consciousness.coherence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Personality</h4>
                      <div className="space-y-2">
                        {selectedCharacter.personality?.traits && (
                          <p><span className="text-gray-500">Traits:</span> {selectedCharacter.personality.traits.join(', ')}</p>
                        )}
                        {selectedCharacter.personality?.motivations && (
                          <p><span className="text-gray-500">Motivations:</span> {selectedCharacter.personality.motivations.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {Object.keys(selectedCharacter.attributes || {}).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Attributes</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(selectedCharacter.attributes).map(([attr, value]) => {
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

                {selectedCharacter.background && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Background</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedCharacter.background}</p>
                  </div>
                )}
              </div>

              {/* Character Behavior Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Behavior Analysis</h3>

                {/* Enhanced Decision Analysis */}
                {(() => {
                  const decisionAnalysisService = new DecisionAnalysisService();
                  const decisionAnalysis = decisionAnalysisService.analyzeDecisionHistory(selectedCharacter);
                  
                  return (
                    <div className="space-y-4">
                      {/* Decision Analysis Summary */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Decision Patterns</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {decisionAnalysis.reasoning}
                        </p>
                      </div>

                      {/* Recent Decisions */}
                      {decisionAnalysis.recentDecisions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Decisions</h4>
                          <div className="space-y-3">
                            {decisionAnalysis.recentDecisions.slice(0, 3).map((decision, index) => (
                              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <span className="font-medium text-sm">{decision.selectedAction}</span>
                                  <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                    Weight: {decision.weight.toFixed(1)}
                                  </span>
                                </div>
                                
                                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                  <div><strong>Primary Reason:</strong> {decision.reasoning.primary}</div>
                                  
                                  {decision.reasoning.consciousness && (
                                    <div><strong>Consciousness:</strong> {decision.reasoning.consciousness}</div>
                                  )}
                                  
                                  {decision.reasoning.personality && decision.reasoning.personality !== 'No dominant traits' && (
                                    <div><strong>Personality:</strong> {decision.reasoning.personality}</div>
                                  )}
                                  
                                  {decision.reasoning.environment && (
                                    <div><strong>Environment:</strong> {decision.reasoning.environment}</div>
                                  )}
                                  
                                  {decision.reasoning.needs && (
                                    <div><strong>Needs:</strong> {decision.reasoning.needs}</div>
                                  )}
                                  
                                  {decision.reasoning.emergency && (
                                    <div className="text-red-600 dark:text-red-400"><strong>⚠️ Emergency Override</strong></div>
                                  )}
                                </div>

                                {/* Alternative Options */}
                                {decision.alternatives.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      <strong>Alternatives considered:</strong> {' '}
                                      {decision.alternatives.map((alt, i) => (
                                        <span key={i}>
                                          {alt.name} ({alt.weight.toFixed(1)})
                                          {i < decision.alternatives.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Decision Patterns Summary */}
                      {decisionAnalysis.patterns.mostCommonActions && decisionAnalysis.patterns.mostCommonActions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Common Actions</h4>
                          <div className="flex flex-wrap gap-2">
                            {decisionAnalysis.patterns.mostCommonActions.map((pattern, index) => (
                              <span key={index} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                {pattern.action} ({pattern.percentage}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Fallback to original behavior analysis if no decision history */}
                {(!selectedCharacter.decisionHistory || selectedCharacter.decisionHistory.length === 0) && characterChanges.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">General Behavior Changes</h4>
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
                )}

                {(!selectedCharacter.decisionHistory || selectedCharacter.decisionHistory.length === 0) && characterChanges.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No recent character behavior data available</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <span className="text-4xl mb-2">👤</span>
                <p>Select a character to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Unified Settlements View - Combines settlement list with behavior analysis
const UnifiedSettlementsView = ({ worldState, turnManager }) => {
  const displayWorldState = worldState || { nodes: [] };
  
  // Ensure nodes is always an array
  const nodes = Array.isArray(displayWorldState.nodes) ? displayWorldState.nodes : [];
  const recentSummaries = turnManager?.getRecentTurnSummaries?.(3) || [];
  const settlementChanges = recentSummaries.flatMap(summary =>
    (summary.changes || []).filter(change =>
      change.type.includes('settlement') || change.type.includes('node')
    )
  );

  if (nodes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">🌍</div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Settlements & Development Analysis
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive view of all settlements and their development patterns
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total: {nodes.length}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <span className="text-lg">🏘️</span>
              Add Settlement
            </button>
          </div>
        </div>
      </div>

      {/* Settlement Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {nodes.map(node => (
          <div key={node.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{node.name}</h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                {node.type}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Population</span>
                  <span className="font-medium">{(node.assignedCharacters?.length || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                  <span className="font-medium capitalize">{node.type}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Resources</p>
                {node.resourceAvailability && Object.keys(node.resourceAvailability).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(node.resourceAvailability).map(([resource, amount]) => (
                      <div key={resource} className="flex justify-between text-sm">
                        <span className="capitalize">{resource}</span>
                        <span>{amount}</span>
                      </div>
                    ))}
                  </div>
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

      {/* Settlement Behavior Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Settlement Development Analysis</h3>

        {settlementChanges.length > 0 ? (
          <div className="space-y-3">
            {settlementChanges.slice(0, 8).map((change, index) => (
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
    </div>
  );
};

// Node Visualization Component - Enhanced with character movement tracking
// Force module refresh: 2024-01-15
const NodeVisualization = ({ nodes = [], characters = [], turnManager }) => {
  // Track character movement history for visual indicators
  // eslint-disable-next-line no-unused-vars
  const [movementHistory, setMovementHistory] = useState(new Map());
  const [recentlyMoved, setRecentlyMoved] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Use ref to track processed characters to avoid infinite loops
  const processedCharactersRef = useRef(new Set());

  // Update movement tracking when characters change
  useEffect(() => {
    if (!characters.length) return;

    // Create a stable identifier for the current characters state
    const currentCharactersKey = characters.map(char => `${char.id}-${char.currentNodeId || char.assignedNodeIds?.[0] || (char.assignments?.nodes && Array.from(char.assignments.nodes)[0])}`).sort().join('|');
    
    // Skip if we've already processed this exact state
    if (processedCharactersRef.current.has(currentCharactersKey)) {
      return;
    }

    setMovementHistory(prevMovementHistory => {
      const newMovementHistory = new Map(prevMovementHistory);
      const newRecentlyMoved = new Set();

      characters.forEach(char => {
        const currentNodeId = char.currentNodeId || char.assignedNodeIds?.[0] ||
                             (char.assignments?.nodes && Array.from(char.assignments.nodes)[0]);

        if (currentNodeId) {
          const previousNodeId = newMovementHistory.get(char.id);

          // If character moved to a different node
          if (previousNodeId && previousNodeId !== currentNodeId) {
            newRecentlyMoved.add(char.id);
            // Clear recent movement after 5 seconds
            setTimeout(() => {
              setRecentlyMoved(prev => {
                const updated = new Set(prev);
                updated.delete(char.id);
                return updated;
              });
            }, 5000);
          }

          newMovementHistory.set(char.id, currentNodeId);
        }
      });

      if (newRecentlyMoved.size > 0) {
        setRecentlyMoved(newRecentlyMoved);
      }

      return newMovementHistory;
    });
    
    // Mark this state as processed
    processedCharactersRef.current.add(currentCharactersKey);
    
    // Clean up old keys to prevent memory leaks (keep last 10)
    if (processedCharactersRef.current.size > 10) {
      const keysArray = Array.from(processedCharactersRef.current);
      processedCharactersRef.current = new Set(keysArray.slice(-10));
    }
  }, [characters]); // Keep characters as dependency but prevent infinite loops

  // Create a simple grid layout for nodes
  const gridSize = Math.ceil(Math.sqrt(nodes.length || 1));

  // Get recently moved characters count
  const recentlyMovedCount = recentlyMoved.size;

  return (
    <div className="w-full h-full relative">
      {nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
          <div>
            <div className="text-4xl mb-2">🌍</div>
            <p>No settlements established</p>
            <p className="text-sm">Settlements will appear here when your world develops</p>
            {characters.length > 0 && (
              <p className="text-xs mt-2 text-blue-600 dark:text-blue-400">
                {characters.length} character{characters.length !== 1 ? 's' : ''} wandering
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 h-full p-4" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
          {nodes.map((node, index) => {
            // Get characters assigned to this node
            const nodeCharacters = characters.filter(char => {
              const charNodeId = char.currentNodeId || char.assignedNodeIds?.[0] ||
                                (char.assignments?.nodes && Array.from(char.assignments.nodes)[0]);
              return charNodeId === node.id;
            });

            // Separate recently moved characters
            const recentlyMovedChars = nodeCharacters.filter(char => recentlyMoved.has(char.id));
            const stationaryChars = nodeCharacters.filter(char => !recentlyMoved.has(char.id));

            // Get node type styling
            const getNodeStyling = (nodeType) => {
              switch (nodeType) {
                case 'settlement':
                  return {
                    bg: 'bg-blue-200 dark:bg-blue-700',
                    border: 'border-blue-400 dark:border-blue-500',
                    hover: 'hover:bg-blue-300 dark:hover:bg-blue-600',
                    text: 'text-blue-900 dark:text-blue-100',
                    icon: '🏘️'
                  };
                case 'wilderness':
                  return {
                    bg: 'bg-green-200 dark:bg-green-700',
                    border: 'border-green-400 dark:border-green-500',
                    hover: 'hover:bg-green-300 dark:hover:bg-green-600',
                    text: 'text-green-900 dark:text-green-100',
                    icon: '🌲'
                  };
                case 'outpost':
                  return {
                    bg: 'bg-orange-200 dark:bg-orange-700',
                    border: 'border-orange-400 dark:border-orange-500',
                    hover: 'hover:bg-orange-300 dark:hover:bg-orange-600',
                    text: 'text-orange-900 dark:text-orange-100',
                    icon: '🏕️'
                  };
                default:
                  return {
                    bg: 'bg-gray-200 dark:bg-gray-700',
                    border: 'border-gray-400 dark:border-gray-500',
                    hover: 'hover:bg-gray-300 dark:hover:bg-gray-600',
                    text: 'text-gray-900 dark:text-gray-100',
                    icon: '📍'
                  };
              }
            };

            const styling = getNodeStyling(node.type);

            // Handle node click
            const handleNodeClick = () => {
              setSelectedNode(selectedNode === node.id ? null : node.id);
            };

            const isSelected = selectedNode === node.id;

            return (
              <div
                key={node.id}
                onClick={handleNodeClick}
                className={`relative ${styling.bg} border-2 ${
                  isSelected ? 'border-yellow-400 dark:border-yellow-300 ring-2 ring-yellow-300' : styling.border
                } rounded-lg p-2 flex flex-col items-center justify-center min-h-[80px] ${styling.hover} transition-all cursor-pointer transform hover:scale-105`}
                title={`${node.name} (${node.type || 'unknown'}) - ${nodeCharacters.length} characters${recentlyMovedChars.length > 0 ? ` (${recentlyMovedChars.length} recently moved)` : ''}`}
              >
                {/* Node icon and name */}
                <div className={`text-xs font-semibold text-center ${styling.text} mb-1`}>
                  <div className="text-sm mb-1">{styling.icon}</div>
                  {node.name}
                </div>

                {/* Character dots - stationary characters */}
                {stationaryChars.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center mb-1">
                    {stationaryChars.slice(0, 6).map((char, charIndex) => (
                      <div
                        key={char.id || charIndex}
                        className="w-2 h-2 bg-green-500 rounded-full"
                        title={char.name || `Character ${charIndex + 1}`}
                      />
                    ))}
                    {stationaryChars.length > 6 && (
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full"
                        title={`+${stationaryChars.length - 6} more characters`}
                      />
                    )}
                  </div>
                )}

                {/* Recently moved character dots with animation */}
                {recentlyMovedChars.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center mb-1">
                    {recentlyMovedChars.slice(0, 6).map((char, charIndex) => (
                      <div
                        key={`recent-${char.id || charIndex}`}
                        className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                        title={`${char.name || `Character ${charIndex + 1}`} (recently moved)`}
                      />
                    ))}
                    {recentlyMovedChars.length > 6 && (
                      <div
                        className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                        title={`+${recentlyMovedChars.length - 6} more recently moved characters`}
                      />
                    )}
                  </div>
                )}

                {/* Population count with movement indicator */}
                <div className="text-xs text-blue-700 dark:text-blue-200 flex items-center gap-1">
                  {nodeCharacters.length}
                  {recentlyMovedChars.length > 0 && (
                    <span className="text-yellow-600 dark:text-yellow-400 text-xs">
                      (+{recentlyMovedChars.length})
                    </span>
                  )}
                </div>

                {/* Node type indicator */}
                {node.type && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 capitalize">
                    {node.type}
                  </div>
                )}

                {/* Movement indicator overlay */}
                {recentlyMovedChars.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Movement Status Overlay */}
      {recentlyMovedCount > 0 && (
        <div className="absolute top-2 right-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              {recentlyMovedCount} character{recentlyMovedCount !== 1 ? 's' : ''} moved recently
            </span>
          </div>
        </div>
      )}

      {/* Selected Node Details Panel */}
      {selectedNode && (
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg max-w-xs">
          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            const nodeCharacters = characters.filter(char => {
              const charNodeId = char.currentNodeId || char.assignedNodeIds?.[0] ||
                                (char.assignments?.nodes && Array.from(char.assignments.nodes)[0]);
              return charNodeId === node.id;
            });

            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{node.name}</h4>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <div><span className="font-medium">Type:</span> {node.type || 'Unknown'}</div>
                  <div><span className="font-medium">Population:</span> {nodeCharacters.length}</div>
                  {node.environmentalProperties?.climate && (
                    <div><span className="font-medium">Climate:</span> {node.environmentalProperties.climate}</div>
                  )}
                  {node.description && (
                    <div className="mt-2">
                      <div className="font-medium">Description:</div>
                      <div className="text-gray-600 dark:text-gray-400">{node.description}</div>
                    </div>
                  )}
                  {nodeCharacters.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium">Characters:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {nodeCharacters.map((char, i) => (
                          <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">
                            {char.name || `Character ${i + 1}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Enhanced Legend - Made 50% smaller */}
      <div className="absolute bottom-1 left-1 bg-white dark:bg-gray-800 p-1.5 rounded-md shadow-sm border text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-200 border border-blue-400 rounded"></div>
              <span className="text-xs">Settlement</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-200 border border-green-400 rounded"></div>
              <span className="text-xs">Wilderness</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-200 border border-orange-400 rounded"></div>
              <span className="text-xs">Outpost</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-xs">Character</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Moved</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-1">
            {characters.length} chars, {nodes.length} nodes
            {recentlyMovedCount > 0 && (
              <span className="ml-1 text-yellow-600 dark:text-yellow-400">
                • {recentlyMovedCount} moved
              </span>
            )}
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              💡 Click nodes for details
            </div>
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

// Unified Statistics View - Combines comprehensive dashboard with enhanced statistics
const UnifiedStatisticsView = ({ worldState, turnManager, data = [] }) => {
  const [selectedMetric, setSelectedMetric] = useState('population');
  const [timeAggregation, setTimeAggregation] = useState('daily');
  const [showFilters, setShowFilters] = useState(false);

  // Get enhanced statistics from turn manager
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

  // Metric definitions for dashboard
  const metrics = {
    population: {
      label: 'Population',
      icon: '👥',
      color: '#10B981',
      unit: 'individuals'
    },
    economic: {
      label: 'Economic',
      icon: '💰',
      color: '#F59E0B',
      unit: 'gold'
    },
    military: {
      label: 'Military',
      icon: '⚔️',
      color: '#EF4444',
      unit: 'soldiers'
    },
    cultural: {
      label: 'Cultural',
      icon: '💖',
      color: '#8B5CF6',
      unit: 'influence'
    }
  };

  // Process data for simple visualizations
  const processedData = data.length > 0 ? data.slice(-20) : [];

  // Metric card component
  const MetricCard = ({ metric, value, trend, color = 'blue' }) => {
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
            {metric === 'population' && <span className="text-2xl">👥</span>}
            {metric === 'economic' && <span className="text-2xl">💰</span>}
            {metric === 'military' && <span className="text-2xl">⚔️</span>}
            {metric === 'cultural' && <span className="text-2xl">💖</span>}
          </div>
          {trend && (
            <span className="text-sm text-green-600 dark:text-green-400">{trend}</span>
          )}
        </div>
        <p className="text-2xl font-bold">{value || 0}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{metric}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Unified Statistics Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive analysis combining real-time metrics and historical trends
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeAggregation}
              onChange={(e) => setTimeAggregation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <span className="text-lg">🔍</span>
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          metric="population"
          value={worldState?.characters?.length || 0}
          trend="+5%"
          color="blue"
        />
        <MetricCard
          metric="economic"
          value={worldState?.resources?.totalGold || 0}
          trend="+12%"
          color="green"
        />
        <MetricCard
          metric="military"
          value={worldState?.nodes?.length || 0}
          trend="+3%"
          color="orange"
        />
        <MetricCard
          metric="cultural"
          value={worldState?.events?.length || 0}
          trend="+8%"
          color="purple"
        />
      </div>

      {/* Enhanced Statistics Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Enhanced Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(combinedStats).map(([key, value]) => (
            <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {value || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simple Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
          <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-2 opacity-50">📈</span>
              <p>Interactive trend charts will be displayed here</p>
              <p className="text-sm">Data points: {processedData.length}</p>
            </div>
          </div>
        </div>

        {/* Events Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Events Analysis</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {processedData.slice(-5).map((event, index) => (
              <div key={event.id || index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg">
                  {event.type === 'dialogue' && '💬'}
                  {event.type === 'social_interaction' && '👥'}
                  {event.type === 'trade' && '💰'}
                  {event.type === 'conflict' && '⚔️'}
                  {!['dialogue', 'social_interaction', 'trade', 'conflict'].includes(event.type) && '📊'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {event.description || event.type || 'Event'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {event.timestamp || 'Recent'}
                  </div>
                </div>
              </div>
            ))}
            {processedData.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <span className="text-4xl mb-2 opacity-50">⚡</span>
                <p>No events to analyze</p>
                <p className="text-sm">Events will appear here as the simulation progresses</p>
              </div>
            )}
          </div>
        </div>

        {/* Comparative Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Comparative Analysis</h3>
          <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-2 opacity-50">📊</span>
              <p>Comparative visualizations</p>
              <p className="text-sm">Metrics comparison across time periods</p>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Events</span>
              <span className="font-semibold">{worldState?.events?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active Characters</span>
              <span className="font-semibold">{worldState?.characters?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Settlements</span>
              <span className="font-semibold">{worldState?.nodes?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Simulation Turns</span>
              <span className="font-semibold">{stats.currentTurn || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Focus Metric:
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              {Object.entries(metrics).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <span className="text-lg">📥</span>
              Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <span className="text-lg">🔄</span>
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Unified Timeline View - Comprehensive chronological history with filtering and analysis
const UnifiedTimelineView = ({ worldState, turnManager, currentTurn }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Get timeline events using real world state data
  const timelineEvents = getTimelineEvents(turnManager, worldState, currentTurn);
  const characters = Array.isArray(worldState?.characters) ? worldState.characters : [];
  const nodes = Array.isArray(worldState?.nodes) ? worldState.nodes : [];

  // Filter events based on criteria
  const filteredEvents = timelineEvents.filter(event => {
    // Time range filter
    if (selectedTimeRange !== 'all') {
      const eventDate = new Date(event.timestamp);
      const now = new Date();
      const daysDiff = (now - eventDate) / (1000 * 60 * 60 * 24);

      if (selectedTimeRange === 'week' && daysDiff > 7) return false;
      if (selectedTimeRange === 'month' && daysDiff > 30) return false;
      if (selectedTimeRange === 'year' && daysDiff > 365) return false;
    }

    // Category filter
    if (selectedFilter !== 'all' && event.category !== selectedFilter) return false;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.characterId?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Group events by date for better organization
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = new Date(event.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(event);
    return groups;
  }, {});

  // Get event type styling
  const getEventStyling = (category) => {
    switch (category) {
      case 'characters':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900',
          border: 'border-blue-500',
          text: 'text-blue-800 dark:text-blue-200',
          icon: '👤'
        };
      case 'settlements':
        return {
          bg: 'bg-green-100 dark:bg-green-900',
          border: 'border-green-500',
          text: 'text-green-800 dark:text-green-200',
          icon: '🏘️'
        };
      case 'social':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900',
          border: 'border-purple-500',
          text: 'text-purple-800 dark:text-purple-200',
          icon: '💬'
        };
      case 'economic':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900',
          border: 'border-yellow-500',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: '💰'
        };
      case 'events':
        return {
          bg: 'bg-red-100 dark:bg-red-900',
          border: 'border-red-500',
          text: 'text-red-800 dark:text-red-200',
          icon: '⚡'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          border: 'border-gray-500',
          text: 'text-gray-800 dark:text-gray-200',
          icon: '📅'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Historical Timeline & Analysis
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive chronological view of all historical events and developments
              {timelineEvents.length > 0 && (
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                  {timelineEvents.length} events tracked
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Events: {timelineEvents.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Characters: {characters.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Settlements: {nodes.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current Turn: {currentTurn || 0}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <span className="text-lg">📥</span>
              Export Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Events
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Categories</option>
              <option value="characters">Characters</option>
              <option value="settlements">Settlements</option>
              <option value="social">Social</option>
              <option value="economic">Economic</option>
              <option value="events">Events</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range
            </label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedFilter('all');
                setSelectedTimeRange('all');
                setSearchTerm('');
              }}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Chronological Timeline</h3>

            {Object.keys(groupedEvents).length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <span className="text-4xl mb-4">🕒</span>
                <p>No events found matching your filters</p>
                <p className="text-sm">Try adjusting your search criteria</p>
                {timelineEvents.length === 0 && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Timeline Status:</strong> No historical events recorded yet.
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Events will appear here as your simulation progresses and characters interact with the world.
                    </p>
                    {(characters.length > 0 || nodes.length > 0) && (
                      <div className="mt-3 text-xs text-blue-700 dark:text-blue-300">
                        <p>Current World State:</p>
                        <ul className="mt-1 ml-4 list-disc">
                          {characters.length > 0 && <li>{characters.length} character{characters.length !== 1 ? 's' : ''} present</li>}
                          {nodes.length > 0 && <li>{nodes.length} settlement{nodes.length !== 1 ? 's' : ''} established</li>}
                          <li>Turn {currentTurn || 0} of simulation</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {Object.entries(groupedEvents)
                  .sort(([a], [b]) => new Date(b) - new Date(a))
                  .map(([date, events]) => (
                  <div key={date} className="relative">
                    {/* Date Header */}
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="ml-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {events.length} event{events.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Events for this date */}
                    <div className="ml-7 space-y-3">
                      {events.map((event, index) => {
                        const styling = getEventStyling(event.category);
                        return (
                          <div
                            key={event.id || index}
                            className={`relative p-4 rounded-lg border-l-4 ${styling.bg} ${styling.border} cursor-pointer hover:shadow-md transition-shadow`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-lg">{styling.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-sm">{event.title}</h5>
                                  <span className={`text-xs px-2 py-1 rounded-full ${styling.bg} ${styling.text}`}>
                                    {event.category}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {event.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Turn {event.metadata?.turnNumber || 'N/A'}</span>
                                  {event.characterId && (
                                    <span>
                                      Character: {event.metadata?.characterName ||
                                        characters.find(c => c.id === event.characterId)?.name ||
                                        event.characterId}
                                    </span>
                                  )}
                                  {event.metadata?.location && (
                                    <span>Location: {event.metadata.location}</span>
                                  )}
                                  <span className={`px-2 py-1 rounded-full ${
                                    event.significance > 7 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                    event.significance > 4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                  }`}>
                                    {event.significance}/10
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event Details & Statistics */}
        <div className="space-y-6">
          {/* Selected Event Details */}
          {selectedEvent ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{selectedEvent.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <p className="font-medium">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Category:</span>
                    <p className="font-medium capitalize">{selectedEvent.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Significance:</span>
                    <p className="font-medium">{selectedEvent.significance}/10</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Turn:</span>
                    <p className="font-medium">{selectedEvent.metadata?.turnNumber || 'N/A'}</p>
                  </div>
                </div>

                {selectedEvent.metadata && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Additional Details</h5>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedEvent.metadata).map(([key, value]) => {
                        // Skip certain metadata keys that are already displayed elsewhere
                        if (['turnNumber', 'characterName'].includes(key)) return null;

                        let displayValue = value;
                        let displayKey = key.replace(/([A-Z])/g, ' $1').trim();

                        // Special handling for certain metadata
                        if (key === 'speaker' && value) {
                          const speakerChar = characters.find(c => c.id === value || c.name === value);
                          displayValue = speakerChar ? speakerChar.name : value;
                          displayKey = 'Speaker';
                        } else if (key === 'responseBy' && value) {
                          const responseChar = characters.find(c => c.id === value || c.name === value);
                          displayValue = responseChar ? responseChar.name : value;
                          displayKey = 'Responded By';
                        } else if (key === 'location' && value) {
                          const locationNode = nodes.find(n => n.id === value || n.name === value);
                          displayValue = locationNode ? locationNode.name : value;
                          displayKey = 'Location';
                        } else if (key === 'fromNode' && value) {
                          const fromNode = nodes.find(n => n.id === value || n.name === value);
                          displayValue = fromNode ? fromNode.name : value;
                          displayKey = 'From';
                        } else if (key === 'toNode' && value) {
                          const toNode = nodes.find(n => n.id === value || n.name === value);
                          displayValue = toNode ? toNode.name : value;
                          displayKey = 'To';
                        } else if (key === 'change' && typeof value === 'number') {
                          displayValue = `${value > 0 ? '+' : ''}${value}`;
                          displayKey = 'Change';
                        }

                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400 capitalize">
                              {displayKey}:
                            </span>
                            <span className="font-medium">{String(displayValue)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <span className="text-4xl mb-2">🕒</span>
                <p>Select an event to view details</p>
              </div>
            </div>
          )}

          {/* Timeline Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Timeline Statistics</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {timelineEvents.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Events</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {filteredEvents.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Filtered Events</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {characters.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Characters</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {nodes.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Settlements</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Events by Category</h4>
                <div className="space-y-2">
                  {['characters', 'settlements', 'social', 'economic', 'events'].map(category => {
                    const count = timelineEvents.filter(e => e.category === category).length;
                    const percentage = timelineEvents.length > 0 ? (count / timelineEvents.length * 100).toFixed(1) : 0;

                    // Get category-specific stats
                    let categoryDetails = '';
                    if (category === 'characters') {
                      const uniqueChars = new Set(timelineEvents.filter(e => e.category === category).map(e => e.characterId)).size;
                      categoryDetails = `${uniqueChars} unique characters`;
                    } else if (category === 'settlements') {
                      const uniqueSettlements = new Set(timelineEvents.filter(e => e.category === category).map(e => e.metadata?.location || e.metadata?.settlement)).size;
                      categoryDetails = `${uniqueSettlements} settlements affected`;
                    }

                    return (
                      <div key={category} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <span className="capitalize">{category}</span>
                          {categoryDetails && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({categoryDetails})
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{count} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Unified Relationships View - Combines relationship visualization with details
const UnifiedRelationshipsView = ({ worldState, turnManager }) => {
  const characters = Array.isArray(worldState?.characters) ? worldState.characters : [];
  const recentSummaries = turnManager?.getRecentTurnSummaries?.(3) || [];
  const relationshipData = recentSummaries.flatMap(summary => [
    ...(summary.changes || []).filter(change => change.type.includes('relationship')),
    ...(summary.events || []).filter(event => ['dialogue', 'social_interaction', 'romance', 'friendship'].includes(event.type))
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Relationship Network & Dynamics
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive analysis of character relationships and social interactions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Characters: {characters.length}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              <span className="text-lg">💖</span>
              Analyze Network
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relationship Network Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Relationship Network</h3>
          <div className="h-96 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-2">💖</span>
              <p>Interactive relationship network</p>
              <p className="text-sm">Visual representation of character connections</p>
              <p className="text-xs mt-2">Characters: {characters.length}</p>
            </div>
          </div>
        </div>

        {/* Relationship Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Relationship Statistics</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {relationshipData.filter(item => item.type === 'dialogue').length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Dialogues</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {relationshipData.filter(item => item.type === 'social_interaction').length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Interactions</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {relationshipData.filter(item => item.type === 'romance').length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Romantic</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {relationshipData.filter(item => item.type === 'friendship').length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Friendships</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relationship Dynamics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Relationship Dynamics</h3>

        {relationshipData.length > 0 ? (
          <div className="space-y-3">
            {relationshipData.slice(0, 10).map((item, index) => (
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
    </div>
  );
};

export default WorldHistorySimInterface;