/**
 * UniverseLandingPage - Universe management interface
 * 
 * Allows users to:
 * - Create new universes
 * - Load existing universes
 * - Manage multiple worlds within a universe
 * - Create connections between worlds
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUniverse } from '../contexts/UniverseContext';
import { useWorldContext } from '../contexts/WorldContext';
import { Globe, Plus, Link, Trash2, Eye, Play } from 'lucide-react';
import Navigation from '../UI/Navigation';

const UniverseLandingPage = () => {
  const navigate = useNavigate();
  const { 
    currentUniverse, 
    universeBuilder,
    createUniverseBuilder,
    buildUniverse,
    loadUniverse,
    saveUniverse,
    switchWorld,
    connectWorlds,
    getAllUniverses 
  } = useUniverse();
  
  const { currentWorld, createWorld } = useWorldContext();

  const [universes, setUniverses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWorldModal, setShowWorldModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [universeName, setUniverseName] = useState('');
  const [universeDescription, setUniverseDescription] = useState('');
  const [worldName, setWorldName] = useState('');
  const [worldDescription, setWorldDescription] = useState('');
  const [connectionType, setConnectionType] = useState('portal');
  const [selectedWorld1, setSelectedWorld1] = useState('');
  const [selectedWorld2, setSelectedWorld2] = useState('');

  useEffect(() => {
    loadUniverseList();
  }, []);

  const loadUniverseList = async () => {
    const list = await getAllUniverses();
    setUniverses(list);
  };

  const handleCreateUniverse = async () => {
    if (!universeName.trim()) return;

    const builder = createUniverseBuilder();
    builder
      .setUniverseProperties(universeName, universeDescription)
      .setTimeCoordination('synchronized'); // Valid modes: 'synchronized', 'independent', 'relative'

    const universe = builder.build(); // Call build() directly on the builder
    await saveUniverse(universe);
    await loadUniverseList();
    setShowCreateModal(false);
    setUniverseName('');
    setUniverseDescription('');
  };

  const handleLoadUniverse = async (universeId) => {
    await loadUniverse(universeId);
  };

  const handleAddWorld = async () => {
    if (!worldName.trim() || !currentUniverse) return;

    // Create world using WorldContext
    const world = createWorld(worldName, worldDescription);
    
    // Add to universe
    const builder = createUniverseBuilder();
    builder.setUniverseProperties(currentUniverse.name, currentUniverse.description);
    
    // Add existing worlds
    currentUniverse.worldIds.forEach(worldId => {
      builder.addWorld(worldId);
    });
    
    // Add new world
    builder.addWorld(world.id);
    
    const updatedUniverse = builder.build(); // Call build() directly
    await saveUniverse(updatedUniverse);
    
    setShowWorldModal(false);
    setWorldName('');
    setWorldDescription('');
  };

  const handleConnectWorlds = async () => {
    if (!selectedWorld1 || !selectedWorld2 || !currentUniverse) return;

    await connectWorlds(selectedWorld1, selectedWorld2, {
      type: connectionType,
      traversalDifficulty: 0.5,
      influence: {
        economic: 0.3,
        cultural: 0.3,
        political: 0.2,
        technological: 0.2
      }
    });

    setShowConnectionModal(false);
    setSelectedWorld1('');
    setSelectedWorld2('');
  };

  const handleEditWorld = (worldId) => {
    switchWorld(worldId);
    navigate('/builder');
  };

  const connectionTypes = [
    'portal',
    'dimensional-rift',
    'timeline-branch',
    'parallel-dimension',
    'dream-realm',
    'afterlife',
    'pocket-dimension',
    'mirror-world',
    'temporal-loop',
    'cosmic-bridge',
    'void-passage',
    'astral-plane'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navigation />
      
      {/* Header */}
      <div className="p-8 border-b border-purple-500/30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Globe className="w-12 h-12 text-purple-400" />
            <div>
              <h1 className="text-4xl font-bold">Universe Manager</h1>
              <p className="text-purple-300">Create and manage multiple worlds in interconnected universes</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Universe
          </button>
        </div>
      </div>

      {/* Current Universe View */}
      {currentUniverse && (
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{currentUniverse.name}</h2>
                <p className="text-purple-300">{currentUniverse.description}</p>
                <p className="text-sm text-slate-400 mt-2">
                  {currentUniverse.worldIds?.length || 0} worlds • {currentUniverse.worldConnections?.length || 0} connections
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWorldModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add World
                </button>
                <button
                  onClick={() => setShowConnectionModal(true)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Link className="w-4 h-4" />
                  Connect Worlds
                </button>
              </div>
            </div>

            {/* Worlds Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentUniverse.worldIds?.map(worldId => (
                <div key={worldId} className="bg-slate-700/50 border border-purple-400/20 rounded-lg p-4 hover:border-purple-400/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{worldId}</h3>
                      <p className="text-sm text-slate-300">World ID: {worldId.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditWorld(worldId)}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600/50 hover:bg-indigo-600 px-3 py-2 rounded text-sm transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        switchWorld(worldId);
                        navigate('/simulation');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-600/50 hover:bg-purple-600 px-3 py-2 rounded text-sm transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Simulate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Universe List */}
      <div className="max-w-7xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">All Universes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universes.map(universe => (
            <div
              key={universe.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-colors cursor-pointer"
              onClick={() => handleLoadUniverse(universe.id)}
            >
              <h3 className="text-xl font-bold mb-2">{universe.name}</h3>
              <p className="text-purple-300 text-sm mb-4">{universe.description}</p>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>{universe.worldCount || 0} worlds</span>
                <span>{universe.connectionCount || 0} connections</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Universe Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">Create New Universe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Universe Name</label>
                <input
                  type="text"
                  value={universeName}
                  onChange={(e) => setUniverseName(e.target.value)}
                  className="w-full bg-slate-700 border border-purple-400/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400"
                  placeholder="The Multiverse"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={universeDescription}
                  onChange={(e) => setUniverseDescription(e.target.value)}
                  className="w-full bg-slate-700 border border-purple-400/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400 h-24 resize-none"
                  placeholder="A collection of interconnected worlds..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUniverse}
                className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add World Modal */}
      {showWorldModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">Add World to Universe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">World Name</label>
                <input
                  type="text"
                  value={worldName}
                  onChange={(e) => setWorldName(e.target.value)}
                  className="w-full bg-slate-700 border border-purple-400/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400"
                  placeholder="Fantasy Realm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={worldDescription}
                  onChange={(e) => setWorldDescription(e.target.value)}
                  className="w-full bg-slate-700 border border-purple-400/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400 h-24 resize-none"
                  placeholder="A world of magic and adventure..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWorldModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWorld}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
              >
                Add World
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Worlds Modal */}
      {showConnectionModal && currentUniverse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">Connect Worlds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">First World</label>
                <select
                  value={selectedWorld1}
                  onChange={(e) => setSelectedWorld1(e.target.value)}
                  className="w-full bg-slate-700 border border-purple-400/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400"
                >
                  <option value="">Select world...</option>
                  {currentUniverse.worldIds?.map(worldId => (
                    <option key={worldId} value={worldId}>{worldId}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Second World</label>
                <select
                  value={selectedWorld2}
                  onChange={(e) => setSelectedWorld2(e.target.value)}
                  className="w-full bg-slate-700 border border-purple-400/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400"
                >
                  <option value="">Select world...</option>
                  {currentUniverse.worldIds?.filter(id => id !== selectedWorld1).map(worldId => (
                    <option key={worldId} value={worldId}>{worldId}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Connection Type</label>
                <select
                  value={connectionType}
                  onChange={(e) => setConnectionType(e.target.value)}
                  className="w-full bg-slate-700 border border-purple-400/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400"
                >
                  {connectionTypes.map(type => (
                    <option key={type} value={type}>{type.replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConnectionModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectWorlds}
                className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniverseLandingPage;
