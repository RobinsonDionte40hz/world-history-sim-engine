// src/presentation/components/SkillAssignmentPanel.js

/**
 * SkillAssignmentPanel - Manage skills and progression for characters/entities
 */

import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Plus, Trash2, TrendingUp, Award } from 'lucide-react';
import { 
  getAllSkillTemplates, 
  getSkillTemplatesByCategory, 
  SKILL_TEMPLATE_CATEGORIES 
} from '../../configs/skill-templates.js';
import Skill from '../../domain/entities/Skill.js';

const SkillAssignmentPanel = ({
  character,
  skillLevels = new Map(),
  onAddSkill,
  onRemoveSkill,
  onAddExperience
}) => {
  const [activeTab, setActiveTab] = useState('learned');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expAmount, setExpAmount] = useState(10);

  // Get all available templates
  const allTemplates = useMemo(() => getAllSkillTemplates(), []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.templateCategory === selectedCategory);
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
  }, [allTemplates, selectedCategory, searchTerm]);

  // Check if character can learn skill
  const canLearnSkill = (skill) => {
    if (!character) return true;

    // Check if already learned
    for (const [skillId, data] of skillLevels.entries()) {
      if (data.skill.name === skill.name) {
        return false;
      }
    }

    return true;
  };

  // Get mastery color
  const getMasteryColor = (level) => {
    if (level >= 100) return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (level >= 80) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    if (level >= 60) return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
    if (level >= 40) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (level >= 20) return 'text-green-400 border-green-500/30 bg-green-500/10';
    return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
  };

  // Get mastery tier name
  const getMasteryTier = (skill, level) => {
    const tiers = skill.masteryTiers || {};
    if (level >= 100) return tiers.grandmaster?.name || 'Grandmaster';
    if (level >= 80) return tiers.master?.name || 'Master';
    if (level >= 60) return tiers.expert?.name || 'Expert';
    if (level >= 40) return tiers.journeyman?.name || 'Journeyman';
    if (level >= 20) return tiers.apprentice?.name || 'Apprentice';
    return tiers.novice?.name || 'Novice';
  };

  // Handle adding skill from template
  const handleAddFromTemplate = (template) => {
    const skill = Skill.fromJSON({
      ...template,
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    onAddSkill(skill, 0, 0);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      combat: '⚔️',
      magic: '✨',
      social: '💬',
      crafting: '🔨',
      utility: '🔧'
    };
    return icons[category] || '📚';
  };

  // Convert skillLevels Map to array for rendering
  const skillsArray = useMemo(() => {
    return Array.from(skillLevels.entries()).map(([skillId, data]) => ({
      skillId,
      ...data
    }));
  }, [skillLevels]);

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped = {};
    skillsArray.forEach(({ skill, level, experience, skillId }) => {
      const category = skill.category || 'other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({ skill, level, experience, skillId });
    });
    return grouped;
  }, [skillsArray]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Skill Management
        </h3>
        <div className="text-sm text-gray-400">
          {skillsArray.length} skills
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('learned')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'learned'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Learned ({skillsArray.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'available'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Available
        </button>
      </div>

      {/* Learned Skills Tab */}
      {activeTab === 'learned' && (
        <div className="space-y-3">
          {skillsArray.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No skills learned</p>
              <p className="text-sm mt-1">Add skills from the "Available" tab</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-white capitalize flex items-center gap-2">
                    <span>{getCategoryIcon(category)}</span>
                    <span>{category}</span>
                    <span className="text-gray-400 text-sm">({categorySkills.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {categorySkills.map(({ skill, level, experience, skillId }) => {
                      const masteryTier = getMasteryTier(skill, level);
                      const nextLevel = (level + 1) * 100; // Simple progression
                      const progressPercent = (experience / nextLevel) * 100;

                      return (
                        <div
                          key={skillId}
                          className={`p-3 border rounded-lg ${getMasteryColor(level)}`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-white">{skill.name}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded ${getMasteryColor(level)}`}>
                                  Lv {level}
                                </span>
                                <span className="px-2 py-0.5 bg-white/10 text-gray-300 text-xs rounded">
                                  {masteryTier}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">{skill.description}</p>
                            </div>

                            <button
                              onClick={() => onRemoveSkill(skillId)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="Remove skill"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>Progress to Level {level + 1}</span>
                              <span>{experience} / {nextLevel} XP</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  level >= 80 ? 'bg-orange-500' :
                                  level >= 60 ? 'bg-purple-500' :
                                  level >= 40 ? 'bg-blue-500' :
                                  level >= 20 ? 'bg-green-500' :
                                  'bg-gray-500'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Quick Add Experience */}
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={expAmount}
                              onChange={(e) => setExpAmount(parseInt(e.target.value) || 0)}
                              min="1"
                              className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                            <button
                              onClick={() => onAddExperience(skillId, expAmount)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center gap-1"
                            >
                              <TrendingUp className="w-3 h-3" />
                              Add XP
                            </button>
                            <button
                              onClick={() => onAddExperience(skillId, 100)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
                            >
                              +100 XP
                            </button>
                          </div>

                          {/* Passive Effects */}
                          {skill.passiveEffects && skill.passiveEffects.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/10">
                              <div className="text-xs text-gray-400 mb-1">Active Passive Effects:</div>
                              <div className="flex flex-wrap gap-1">
                                {skill.passiveEffects
                                  .filter(effect => level >= effect.minLevel)
                                  .map((effect, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded">
                                      {effect.type}: +{effect.value}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Ability Unlocks */}
                          {skill.abilityUnlocks && skill.abilityUnlocks.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/10">
                              <div className="text-xs text-gray-400 mb-1">Unlocked Abilities:</div>
                              <div className="flex flex-wrap gap-1">
                                {skill.abilityUnlocks
                                  .filter(unlock => level >= unlock.level)
                                  .map((unlock, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded flex items-center gap-1">
                                      <Award className="w-3 h-3" />
                                      {unlock.name}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Available Skills Tab */}
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
                placeholder="Search skills..."
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="all" className="bg-gray-800">All Categories</option>
              {Object.entries(SKILL_TEMPLATE_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key} className="bg-gray-800">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Template Grid */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No skills found</p>
                <p className="text-sm mt-1">Try adjusting your search filters</p>
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const canLearn = canLearnSkill(template);
                const alreadyLearned = !canLearn;
                
                return (
                  <div
                    key={template.templateKey}
                    className={`p-3 border rounded-lg transition-colors ${
                      canLearn
                        ? 'bg-white/5 border-cyan-500/30 hover:bg-white/10' 
                        : 'bg-white/5 border-gray-500/30 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getCategoryIcon(template.templateCategory)}</span>
                          <h4 className="font-medium text-white">{template.name}</h4>
                          {alreadyLearned && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                              Learned
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                        
                        {/* Template info */}
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                            {template.linkedAttribute.toUpperCase()}-based
                          </span>
                          <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                            DC {template.difficultyClass}
                          </span>
                          <span className="px-2 py-1 bg-white/10 text-gray-300 rounded capitalize">
                            {template.experienceCurve} XP
                          </span>
                        </div>

                        {/* Mastery Tiers Preview */}
                        {template.masteryTiers && (
                          <div className="mt-2 text-xs text-gray-400">
                            <span className="font-medium">Mastery Path:</span>
                            <span className="ml-1">
                              {template.masteryTiers.novice?.name} → {template.masteryTiers.apprentice?.name} → {template.masteryTiers.grandmaster?.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddFromTemplate(template)}
                        disabled={!canLearn}
                        className={`px-3 py-1 text-white text-sm rounded flex items-center gap-1 ${
                          canLearn
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

export default SkillAssignmentPanel;
