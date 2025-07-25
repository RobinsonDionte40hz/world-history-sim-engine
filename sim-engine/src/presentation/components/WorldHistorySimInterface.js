import React, { useState } from 'react';
import { SkipForward, RotateCcw, Globe, Users, History, Map, TrendingUp, Calendar, Activity, ChevronRight, Settings, Filter, Download, Clock } from 'lucide-react';
import useSimulation from '../hooks/useSimulation.js';
import TurnCounter from './TurnCounter.js';

const WorldHistorySimInterface = () => {
  // Use the simulation hook instead of local state
  const { worldState, isInitialized, currentTurn, canProcessTurn, resetSimulation, processTurn } = useSimulation();
  
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Minimal fallback data for when worldState is not available
  const displayWorldState = worldState || {
    time: 0,
    npcs: [],
    nodes: [],
    events: [],
    resources: { totalGold: 0, totalFood: 0, totalPopulation: 0 }
  };

  // Simulation control functions using the hook - turn-based approach
  const toggleSimulation = () => {
    // In turn-based mode, this processes a single turn instead of starting/stopping
    processTurn();
  };

  const handleResetSimulation = () => {
    resetSimulation();
  };

  const stepForward = () => {
    // Same as toggle in turn-based mode
    processTurn();
  };

  // Filter events based on search
  const filteredEvents = (displayWorldState.events || []).filter(event => 
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Main dashboard view
  const DashboardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Statistics Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="w-6 h-6" />}
          label="Total Population"
          value={displayWorldState.resources.totalPopulation?.toLocaleString() || '0'}
          trend="+5%"
          color="blue"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6" />}
          label="Total Resources"
          value={displayWorldState.resources.totalGold || 0}
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

      {/* World Map Placeholder */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Map className="w-5 h-5" />
          World Map
        </h3>
        <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Globe className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p>Interactive World Map</p>
            <p className="text-sm">Click settlements to view details</p>
          </div>
        </div>
        
        {/* Settlement Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {displayWorldState.nodes.map(node => (
            <div
              key={node.id}
              className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <p className="font-medium text-sm">{node.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pop: {node.population}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Events
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredEvents.slice(-5).reverse().map(event => (
            <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{event.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Turn {event.timestamp} • {event.type}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  event.significance > 7 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                  event.significance > 4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {event.significance}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Characters view
  const CharactersView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Characters</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {displayWorldState.npcs.map(npc => (
              <button
                key={npc.id}
                onClick={() => setSelectedCharacter(npc)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCharacter?.id === npc.id 
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' 
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <p className="font-medium">{npc.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{npc.race} • {npc.location}</p>
              </button>
            ))}
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

  // Timeline view
  const TimelineView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Historical Timeline
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            maxLength={100}
          />
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
        <div className="space-y-6">
          {filteredEvents.map((event, index) => (
            <div key={event.id} className="relative flex items-start gap-4">
              <div className="relative z-10 w-16 text-right">
                <span className="text-sm text-gray-500 dark:text-gray-400">Turn {event.timestamp}</span>
              </div>
              <div className="relative z-10 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{event.description}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Type: {event.type} • Significance: {event.significance}/10
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold">World History Simulation Engine</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <TurnCounter currentTurn={currentTurn} />
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Simulation Controls */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSimulation}
                disabled={!canProcessTurn}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-4 h-4" />
                Process Turn
              </button>
              
              <button
                onClick={stepForward}
                disabled={!canProcessTurn}
                className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Same as Process Turn"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleResetSimulation}
                className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 ml-4">
                <Clock className="w-4 h-4" />
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
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {['overview', 'timeline', 'characters', 'settlements'].map(view => (
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
        {selectedView === 'overview' && <DashboardView />}
        {selectedView === 'timeline' && <TimelineView />}
        {selectedView === 'characters' && <CharactersView />}
        {selectedView === 'settlements' && <SettlementsView worldState={displayWorldState} />}
      </main>
    </div>
  );
};

// Component for character details
const CharacterDetail = ({ character }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <h3 className="text-xl font-semibold mb-4">{character.name}</h3>
    
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Basic Info</h4>
        <div className="space-y-2">
          <p><span className="text-gray-500">Race:</span> {character.race}</p>
          <p><span className="text-gray-500">Location:</span> {character.location}</p>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Consciousness</h4>
        <div className="space-y-2">
          <p><span className="text-gray-500">Frequency:</span> {character.consciousness.frequency} Hz</p>
          <p><span className="text-gray-500">Coherence:</span> {(character.consciousness.coherence * 100).toFixed(0)}%</p>
        </div>
      </div>
    </div>

    <div className="mt-6">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Attributes</h4>
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(character.attributes).map(([attr, value]) => (
          <div key={attr} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{attr}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Component for settlements view
const SettlementsView = ({ worldState }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {worldState.nodes.map(node => (
        <div key={node.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">{node.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Type: {node.type}</p>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Population</span>
              <span className="font-medium">{node.population.toLocaleString()}</span>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Resources</p>
              {Object.entries(node.resources).map(([resource, amount]) => (
                <div key={resource} className="flex justify-between text-sm">
                  <span className="capitalize">{resource}</span>
                  <span>{amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
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

export default WorldHistorySimInterface;