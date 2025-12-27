// src/presentation/components/AbilityAssignmentPanel.js

/**
 * AbilityAssignmentPanel - Manage abilities for characters/entities
 */

import React, { useState, useMemo } from 'react';
import { Zap, Search, X, Plus, Trash2, ArrowUp } from 'lucide-react';
import { 
  getAllAbilityTemplates, 
  getAbilityTemplatesByCategory, 
  ABILITY_TEMPLATE_CATEGORIES 
} from '../../configs/ability-templates.js';
import Ability from '../../domain/entities/Ability.js';

const AbilityAssignmentPanel = ({
  character,
  abilities = [],
  onAddAbility,
  onRemoveAbility,
  onUpgradeAbility
}) => {
  const [activeTab, setActiveTab] = useState('learned');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get all available templates
  const allTemplates = useMemo(() => getAllAbilityTemplates(), []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.templateCategory === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search) ||
        t.metadata?.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    return filtered;
  }, [allTemplates, selectedCategory, selectedType, searchTerm]);

  // Check if character can learn ability
  const canLearnAbility = (ability) => {
    if (!character) return true;

    // Check if already learned
    if (abilities.some(a => a.name === ability.name)) {
      return false;
    }

    // Check attribute requirements
    if (ability.requirements?.attributes) {
      for (const [attr, value] of Object.entries(ability.requirements.attributes)) {
        if ((character.attributes?.[attr] || 0) < value) {
          return false;
        }
      }
    }

    // Check level requirement
    if (ability.requirements?.level && (character.level || 0) < ability.requirements.level) {
      return false;
    }

    return true;
  };

  // Get ability type color
  const getTypeColor = (type) => {
    const colors = {
      active: 'text-red-400 border-red-500/30 bg-red-500/10',
      passive: 'text-green-400 border-green-500/30 bg-green-500/10',
      triggered: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
      channeled: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      ritual: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
    };
    return colors[type] || colors.active;
  };

  // Handle adding ability from template
  const handleAddFromTemplate = (template) => {
    const ability = Ability.fromJSON({
      ...template,
      id: `ability_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    onAddAbility(ability);
  };

  // Get cost display
  const getCostDisplay = (costs) => {
    if (!costs) return null;
    return Object.entries(costs)
      .map(([resource, amount]) => `${amount} ${resource}`)
      .join(', ');
  };

  // Group abilities by type
  const abilitiesByType = useMemo(() => {
    const grouped = {};
    abilities.forEach(ability => {
      const type = ability.type || 'other';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(ability);
    });
    return grouped;
  }, [abilities]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Ability Management
        </h3>
        <div className="text-sm text-gray-400">
          {abilities.length} abilities
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('learned')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'learned'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Learned ({abilities.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'available'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Available
        </button>
      </div>

      {/* Learned Abilities Tab */}
      {activeTab === 'learned' && (
        <div className="space-y-3">
          {abilities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No abilities learned</p>
              <p className="text-sm mt-1">Add abilities from the "Available" tab</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(abilitiesByType).map(([type, typeAbilities]) => (
                <div key={type} className="space-y-2">
                  <h4 className="font-medium text-white capitalize flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${getTypeColor(type)}`}>
                      {type}
                    </span>
                    <span className="text-gray-400 text-sm">({typeAbilities.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {typeAbilities.map((ability) => (
                      <div
                        key={ability.id}
                        className={`p-3 border rounded-lg ${getTypeColor(ability.type)}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white">{ability.name}</h4>
                              {ability.level > 1 && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded">
                                  Lv {ability.level}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{ability.description}</p>
                            
                            {/* Ability stats */}
                            <div className="flex flex-wrap gap-2 text-xs">
                              {ability.costs && (
                                <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                                  Cost: {getCostDisplay(ability.costs)}
                                </span>
                              )}
                              {ability.cooldown > 0 && (
                                <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                                  Cooldown: {ability.cooldown} turns
                                </span>
                              )}
                              {ability.range && (
                                <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                                  Range: {ability.range} ft
                                </span>
                              )}
                              {ability.targetType && (
                                <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                                  Target: {ability.targetType}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1">
                            {ability.maxLevel && ability.level < ability.maxLevel && (
                              <button
                                onClick={() => onUpgradeAbility(ability.id)}
                                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                title="Upgrade ability"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onRemoveAbility(ability.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="Remove ability"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Available Abilities Tab */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search abilities..."
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all" className="bg-gray-800">All Categories</option>
                {Object.entries(ABILITY_TEMPLATE_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key} className="bg-gray-800">
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all" className="bg-gray-800">All Types</option>
                <option value="active" className="bg-gray-800">Active</option>
                <option value="passive" className="bg-gray-800">Passive</option>
                <option value="triggered" className="bg-gray-800">Triggered</option>
                <option value="channeled" className="bg-gray-800">Channeled</option>
                <option value="ritual" className="bg-gray-800">Ritual</option>
              </select>
            </div>
          </div>

          {/* Template Grid */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No abilities found</p>
                <p className="text-sm mt-1">Try adjusting your search filters</p>
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const canLearn = canLearnAbility(template);
                const alreadyLearned = abilities.some(a => a.name === template.name);
                
                return (
                  <div
                    key={template.templateKey}
                    className={`p-3 border rounded-lg transition-colors ${
                      canLearn && !alreadyLearned
                        ? `${getTypeColor(template.type)} hover:bg-white/10` 
                        : 'bg-white/5 border-gray-500/30 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{template.name}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded ${getTypeColor(template.type)}`}>
                            {template.type}
                          </span>
                          {alreadyLearned && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                              Learned
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                        
                        {/* Template info */}
                        <div className="flex flex-wrap gap-1 text-xs">
                          {template.costs && (
                            <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                              Cost: {getCostDisplay(template.costs)}
                            </span>
                          )}
                          {template.cooldown > 0 && (
                            <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                              CD: {template.cooldown}
                            </span>
                          )}
                          {template.targetType && (
                            <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                              {template.targetType}
                            </span>
                          )}
                        </div>

                        {/* Requirements */}
                        {template.requirements && !canLearn && !alreadyLearned && (
                          <div className="mt-2 text-xs text-red-400">
                            {template.requirements.level && (
                              <span>Level {template.requirements.level} required</span>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddFromTemplate(template)}
                        disabled={!canLearn || alreadyLearned}
                        className={`px-3 py-1 text-white text-sm rounded flex items-center gap-1 ${
                          canLearn && !alreadyLearned
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        {alreadyLearned ? 'Learned' : 'Learn'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AbilityAssignmentPanel;
