/**
 * InteractionAssignmentPanel - UI for assigning interactions to characters
 * Provides templates, quick creation, and assignment management
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Zap, 
  MessageSquare, 
  ShoppingCart, 
  Shield, 
  Home,
  Book,
  Heart,
  Hammer,
  Search,
  X,
  Edit
} from 'lucide-react';
import { 
  getInteractionTemplatesForType,
  getAvailableCharacterTypes,
  createInteractionsFromTemplate,
  getQuickInteractionOptions
} from '../../template/InteractionTemplates.js';

const InteractionAssignmentPanel = ({ 
  character, 
  assignedInteractions = [], 
  availableInteractions = [],
  onAssignInteraction,
  onUnassignInteraction,
  onCreateInteraction,
  onEditInteraction,
  // New props for hierarchical system
  systemInteractions = [],
  contentInteractions = [],
  onExecuteInteraction,
  interactionManager,
  worldState,
  currentNode
}) => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [executingInteraction] = useState(null);

  // Get character type for template suggestions
  const characterType = character?.type || character?.characterClass || 'generic';
  const characterTypeTemplates = getInteractionTemplatesForType(characterType);
  const availableTypes = getAvailableCharacterTypes();
  const quickOptions = getQuickInteractionOptions();

  // Get available interactions from interaction manager if provided
  const availableInteractionsData = interactionManager && character && worldState && currentNode
    ? interactionManager.getAvailableInteractions({ character, world: worldState, currentNode })
    : { systemInteractions: systemInteractions, contentInteractions: contentInteractions, allInteractions: [] };

  // Separate system and content interactions for better organization
  const systemInteractionsList = availableInteractionsData.systemInteractions || [];
  const contentInteractionsList = availableInteractionsData.contentInteractions || [];

  // Get assigned interaction IDs for filtering
  const assignedInteractionIds = new Set(assignedInteractions.map(i => i.id));
  
  // Filter available interactions based on search and exclude already assigned ones
  const filteredAvailable = availableInteractions
    .filter(interaction => !assignedInteractionIds.has(interaction.id))
    .filter(interaction =>
      interaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleApplyTemplate = (templateType) => {
    const interactions = createInteractionsFromTemplate(templateType, character.id);
    interactions.forEach(interaction => {
      onCreateInteraction(interaction);
      onAssignInteraction(character.id, interaction.id);
    });
  };

  const handleCreateQuickInteraction = (quickOption) => {
    const interaction = {
      id: `${character.id}_${quickOption.id}_${Date.now()}`,
      ...quickOption.template,
      characterId: character.id,
      category: quickOption.category,
      createdFrom: 'quick',
      tags: [quickOption.category, 'quick-created']
    };
    
    onCreateInteraction(interaction);
    onAssignInteraction(character.id, interaction.id);
  };

  const getIconForCategory = (category) => {
    switch (category) {
      case 'trade': return <ShoppingCart className="w-4 h-4" />;
      case 'dialogue': return <MessageSquare className="w-4 h-4" />;
      case 'social': return <Heart className="w-4 h-4" />;
      case 'combat': return <Shield className="w-4 h-4" />;
      case 'service': return <Home className="w-4 h-4" />;
      case 'information': return <Book className="w-4 h-4" />;
      case 'craft': return <Hammer className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'assigned', label: 'Assigned', count: assignedInteractions.length },
    { id: 'available', label: 'Available', count: filteredAvailable.length },
    { id: 'system', label: 'System', count: systemInteractionsList.length },
    { id: 'content', label: 'Content', count: contentInteractionsList.length },
    { id: 'templates', label: 'Templates', count: availableTypes.length },
    { id: 'quick', label: 'Quick Create', count: quickOptions.length }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Character Interactions</h3>
        <div className="text-sm text-gray-400">
          {assignedInteractions.length} assigned
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 text-xs opacity-75">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Assigned Interactions Tab */}
        {activeTab === 'assigned' && (
          <div className="space-y-3">
            {assignedInteractions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No interactions assigned yet</p>
                <p className="text-sm">Use the other tabs to add interactions</p>
              </div>
            ) : (
              assignedInteractions.map(interaction => (
                <div
                  key={interaction.id}
                  className="p-3 bg-white/10 rounded-lg border border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getIconForCategory(interaction.category)}
                        <h4 className="font-medium text-white">{interaction.name}</h4>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                          {interaction.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {interaction.description}
                      </p>
                      {interaction.branches && (
                        <div className="text-xs text-gray-500">
                          {interaction.branches.length} response options
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-3">
                      <button
                        onClick={() => onEditInteraction(interaction)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit interaction"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onUnassignInteraction(character.id, interaction.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Unassign interaction"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Available Interactions Tab */}
        {activeTab === 'available' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search interactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>

            {filteredAvailable.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No available interactions found</p>
                {searchTerm && <p className="text-sm">Try a different search term</p>}
              </div>
            ) : (
              filteredAvailable.map(interaction => (
                <div
                  key={interaction.id}
                  className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getIconForCategory(interaction.category)}
                        <h4 className="font-medium text-white">{interaction.name}</h4>
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded">
                          {interaction.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {interaction.description}
                      </p>
                    </div>
                    <button
                      onClick={() => onAssignInteraction(character.id, interaction.id)}
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors"
                      title="Assign to character"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* System Interactions Tab */}
        {activeTab === 'system' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-white">System Interactions</h4>
                <p className="text-sm text-gray-400">Core engine behaviors available to all characters</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                  Always Available
                </span>
              </div>
            </div>

            {availableInteractionsData.systemInteractions?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No system interactions available</p>
                <p className="text-sm">System interactions are generated dynamically</p>
              </div>
            ) : (
              availableInteractionsData.systemInteractions?.map(interaction => (
                <div
                  key={interaction.id}
                  className="p-3 bg-green-500/10 rounded-lg border border-green-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-400">⚙️</span>
                        <h4 className="font-medium text-white">{interaction.name}</h4>
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                          System
                        </span>
                        {interaction.priority && (
                          <span className={`px-2 py-1 text-xs rounded ${
                            interaction.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                            interaction.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                            interaction.priority === 'normal' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {interaction.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {interaction.description}
                      </p>
                      {interaction.baseEnergyCost && (
                        <div className="text-xs text-gray-500">
                          Energy cost: {interaction.baseEnergyCost}
                        </div>
                      )}
                    </div>
                    {onExecuteInteraction && (
                      <button
                        onClick={() => onExecuteInteraction(interaction)}
                        disabled={executingInteraction === interaction.id}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                      >
                        {executingInteraction === interaction.id ? 'Executing...' : 'Execute'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Content Interactions Tab */}
        {activeTab === 'content' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-white">Content Interactions</h4>
                <p className="text-sm text-gray-400">Custom interactions created by users</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                  User Created
                </span>
              </div>
            </div>

            {availableInteractionsData.contentInteractions?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Book className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No content interactions available</p>
                <p className="text-sm">Create custom interactions using the templates tab</p>
              </div>
            ) : (
              availableInteractionsData.contentInteractions?.map(interaction => (
                <div
                  key={interaction.id}
                  className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getIconForCategory(interaction.category)}
                        <h4 className="font-medium text-white">{interaction.name}</h4>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                          Content
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                          {interaction.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {interaction.description}
                      </p>
                      {interaction.author && (
                        <div className="text-xs text-gray-500">
                          By: {interaction.author}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEditInteraction(interaction)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit interaction"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAssignInteraction(character.id, interaction.id)}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors"
                        title="Assign to character"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {/* Character Type Template */}
            {characterTypeTemplates && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-blue-500/20 rounded">
                    {getIconForCategory('recommended')}
                  </div>
                  <h4 className="font-medium text-blue-300">
                    Recommended for {characterTypeTemplates.name}
                  </h4>
                </div>
                <p className="text-sm text-blue-200 mb-3">
                  {characterTypeTemplates.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-300">
                    {characterTypeTemplates.interactions.length} interactions
                  </span>
                  <button
                    onClick={() => handleApplyTemplate(characterType)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    Apply Template
                  </button>
                </div>
              </div>
            )}

            {/* All Available Templates */}
            <div className="grid gap-3">
              {availableTypes.map(type => (
                <div
                  key={type.id}
                  className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{type.name}</h4>
                      <p className="text-sm text-gray-400">{type.description}</p>
                      <span className="text-xs text-gray-500">
                        {type.interactionCount} interactions
                      </span>
                    </div>
                    <button
                      onClick={() => handleApplyTemplate(type.id)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-sm rounded transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Create Tab */}
        {activeTab === 'quick' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-4">
              Quickly create common interaction types for any character
            </p>
            
            {quickOptions.map(option => (
              <div
                key={option.id}
                className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getIconForCategory(option.category)}
                    <div>
                      <h4 className="font-medium text-white">{option.name}</h4>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateQuickInteraction(option)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    Create & Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Total interactions: {assignedInteractions.length}
          </span>
          {assignedInteractions.length > 0 && (
            <div className="flex gap-2">
              {['trade', 'dialogue', 'social', 'combat'].map(category => {
                const count = assignedInteractions.filter(i => i.category === category).length;
                return count > 0 ? (
                  <span key={category} className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded">
                    {category}: {count}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractionAssignmentPanel;