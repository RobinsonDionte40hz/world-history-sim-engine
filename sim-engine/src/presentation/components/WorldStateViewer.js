/**
 * WorldStateViewer - Component to display and search current world state
 * 
 * Shows nodes, characters, and interactions with search functionality
 */

import React, { useState } from 'react';
import { Search, MapPin, Users, Zap } from 'lucide-react';
import { useWorldContext } from '../contexts/WorldContext';

const WorldStateViewer = () => {
  const { currentWorld } = useWorldContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('nodes');

  if (!currentWorld) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">No world selected</p>
      </div>
    );
  }

  const worldConfig = currentWorld.worldConfig || {};

  // Search functionality
  const searchNodes = (query) => {
    if (!query) return worldConfig.nodes || [];
    const searchTerm = query.toLowerCase();
    return (worldConfig.nodes || []).filter(node => 
      node.name.toLowerCase().includes(searchTerm) ||
      node.description.toLowerCase().includes(searchTerm) ||
      node.type.toLowerCase().includes(searchTerm) ||
      (node.tags && node.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  };

  const searchCharacters = (query) => {
    if (!query) return worldConfig.characters || [];
    const searchTerm = query.toLowerCase();
    return (worldConfig.characters || []).filter(character => 
      character.name.toLowerCase().includes(searchTerm) ||
      (character.description && character.description.toLowerCase().includes(searchTerm))
    );
  };

  const searchInteractions = (query) => {
    if (!query) return worldConfig.interactions || [];
    const searchTerm = query.toLowerCase();
    return (worldConfig.interactions || []).filter(interaction => 
      interaction.name.toLowerCase().includes(searchTerm) ||
      interaction.type.toLowerCase().includes(searchTerm) ||
      (interaction.description && interaction.description.toLowerCase().includes(searchTerm))
    );
  };

  const filteredNodes = searchNodes(searchQuery);
  const filteredCharacters = searchCharacters(searchQuery);
  const filteredInteractions = searchInteractions(searchQuery);

  const tabs = [
    { id: 'nodes', label: 'Nodes', icon: MapPin, count: filteredNodes.length },
    { id: 'characters', label: 'Characters', icon: Users, count: filteredCharacters.length },
    { id: 'interactions', label: 'Interactions', icon: Zap, count: filteredInteractions.length }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">World State</h2>
        <p className="text-gray-400">
          Current world: {worldConfig.name || 'Unnamed World'}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes, characters, or interactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'nodes' && (
          <div>
            {filteredNodes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {searchQuery ? 'No nodes match your search' : 'No nodes created yet'}
              </p>
            ) : (
              <div className="grid gap-4">
                {filteredNodes.map(node => (
                  <div key={node.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{node.name}</h3>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                        {node.type}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{node.description}</p>
                    {node.tags && node.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {node.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'characters' && (
          <div>
            {filteredCharacters.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {searchQuery ? 'No characters match your search' : 'No characters created yet'}
              </p>
            ) : (
              <div className="grid gap-4">
                {filteredCharacters.map(character => (
                  <div key={character.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="font-semibold text-white mb-2">{character.name}</h3>
                    {character.description && (
                      <p className="text-gray-300 text-sm mb-3">{character.description}</p>
                    )}
                    {character.assignedInteractions && character.assignedInteractions.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Assigned Interactions:</p>
                        <div className="flex flex-wrap gap-1">
                          {character.assignedInteractions.map(interactionId => (
                            <span key={interactionId} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                              {interactionId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'interactions' && (
          <div>
            {filteredInteractions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {searchQuery ? 'No interactions match your search' : 'No interactions created yet'}
              </p>
            ) : (
              <div className="grid gap-4">
                {filteredInteractions.map(interaction => (
                  <div key={interaction.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{interaction.name}</h3>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                        {interaction.type}
                      </span>
                    </div>
                    {interaction.description && (
                      <p className="text-gray-300 text-sm">{interaction.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{worldConfig.nodes?.length || 0}</div>
            <div className="text-sm text-gray-400">Nodes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{worldConfig.characters?.length || 0}</div>
            <div className="text-sm text-gray-400">Characters</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{worldConfig.interactions?.length || 0}</div>
            <div className="text-sm text-gray-400">Interactions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldStateViewer;