import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Globe, Users, History, Map, TrendingUp, Calendar, Activity, ChevronRight, Settings, Filter, Download, Clock } from 'lucide-react';

const WorldHistorySimInterface = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTick, setCurrentTick] = useState(0);
  const [worldState, setWorldState] = useState({
    time: 0,
    npcs: [],
    nodes: [],
    events: [],
    resources: {}
  });
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedNode, setSelectedNode] = useState(null);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    // Initialize with some mock data
    setWorldState({
      time: 0,
      npcs: [
        { id: '1', name: 'Aldric the Bold', location: 'Riverhold', attributes: { charisma: 15, strength: 18 }, consciousness: { frequency: 40, coherence: 0.8 }, race: 'Human' },
        { id: '2', name: 'Elara Moonwhisper', location: 'Silverwood', attributes: { intelligence: 17, wisdom: 16 }, consciousness: { frequency: 45, coherence: 0.9 }, race: 'Elf' },
        { id: '3', name: 'Thorin Ironforge', location: 'Mountain Pass', attributes: { constitution: 19, strength: 16 }, consciousness: { frequency: 35, coherence: 0.7 }, race: 'Dwarf' }
      ],
      nodes: [
        { id: '1', name: 'Riverhold', type: 'city', population: 5000, resources: { food: 100, gold: 50 } },
        { id: '2', name: 'Silverwood', type: 'forest', population: 300, resources: { wood: 200, herbs: 80 } },
        { id: '3', name: 'Mountain Pass', type: 'fortress', population: 1200, resources: { iron: 150, stone: 180 } }
      ],
      events: [
        { id: '1', timestamp: 0, type: 'trade', description: 'Trade caravan arrives at Riverhold', significance: 3 },
        { id: '2', timestamp: 10, type: 'diplomacy', description: 'Elves and Humans sign peace treaty', significance: 8 },
        { id: '3', timestamp: 20, type: 'exploration', description: 'New ore vein discovered in Mountain Pass', significance: 5 }
      ],
      resources: { totalGold: 300, totalFood: 450, totalPopulation: 6500 }
    });
  }, []);

  // Simulation control
  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentTick(0);
    // Reset world state
  };

  const stepForward = () => {
    setCurrentTick(currentTick + 1);
    // Run one tick of simulation
  };

  // Filter events based on search
  const filteredEvents = worldState.events.filter(event => 
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
          value={worldState.resources.totalPopulation?.toLocaleString() || '0'}
          trend="+5%"
          color="blue"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6" />}
          label="Total Resources"
          value={worldState.resources.totalGold || 0}
          trend="+12%"
          color="green"
        />
        <StatCard 
          icon={<Globe className="w-6 h-6" />}
          label="Active Settlements"
          value={worldState.nodes.length}
          color="purple"
        />
        <StatCard 
          icon={<Activity className="w-6 h-6" />}
          label="Historical Events"
          value={worldState.events.length}
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
          {worldState.nodes.map(node => (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <p className="font-medium text-sm">{node.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pop: {node.population}</p>
            </button>
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
            {worldState.npcs.map(npc => (
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
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Turn: {currentTick}
              </span>
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
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Pause' : 'Start'} Simulation
              </button>
              
              <button
                onClick={stepForward}
                disabled={isRunning}
                className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              
              <button
                onClick={resetSimulation}
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
                {isRunning ? 'Simulation Running' : 'Simulation Paused'}
              </span>
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
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
        {selectedView === 'settlements' && <SettlementsView worldState={worldState} />}
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