// src/presentation/components/EntityEditor.js

import React, { useState, useCallback, useMemo } from 'react';
import { Save, X, Skull, Shield, Heart, Zap, Users, MapPin, Swords, Copy, Sparkles } from 'lucide-react';
import Entity from '../../domain/entities/Entity.js';

/**
 * EntityEditor - UI for creating and editing entities (hostile NPCs, creatures)
 * 
 * Features:
 * - Create entities from scratch or templates
 * - Configure combat stats, attributes, skills
 * - Set behavioral traits
 * - Configure loot and rewards
 * - Assign to locations
 * - Save as templates
 */
const EntityEditor = ({ 
  initialEntity = null, 
  onSave, 
  onCancel,
  mode = 'create',
  availableNodes = [],
  availableGroups = []
}) => {
  const [entity, setEntity] = useState(() => {
    if (initialEntity) {
      return initialEntity instanceof Entity ? initialEntity.toJSON() : initialEntity;
    }
    return {
      name: '',
      description: '',
      type: 'humanoid',
      subtype: '',
      size: 'medium',
      challengeRating: 1,
      attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      combat: {
        armorClass: 10,
        hitPoints: 10,
        maxHitPoints: 10,
        speed: 30,
        initiative: 0
      },
      skills: {},
      abilities: [],
      resistances: [],
      immunities: [],
      vulnerabilities: [],
      behavior: {
        temperament: 'neutral',
        intelligence: 'low',
        tactics: 'direct',
        morale: 50,
        socialability: 'solitary'
      },
      loot: {
        guaranteed: [],
        possible: [],
        currency: 0,
        experience: 200
      },
      groupId: null,
      role: 'member',
      assignedNodes: [],
      territoryBehavior: 'patrol',
      isHostile: true,
      metadata: {
        tags: []
      }
    };
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [newAbility, setNewAbility] = useState('');
  const [newLootItem, setNewLootItem] = useState('');

  const updateEntity = useCallback((updates) => {
    setEntity(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNested = useCallback((path, value) => {
    setEntity(prev => {
      const newEntity = { ...prev };
      const keys = path.split('.');
      let current = newEntity;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newEntity;
    });
  }, []);

  const handleSave = () => {
    if (!entity.name.trim()) {
      alert('Entity name is required');
      return;
    }

    // Create Entity instance
    const entityInstance = new Entity(entity);
    onSave(entityInstance);
  };

  const calculateModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  // Render tabs
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Skull },
    { id: 'combat', label: 'Combat Stats', icon: Swords },
    { id: 'behavior', label: 'Behavior', icon: Zap },
    { id: 'loot', label: 'Loot & Rewards', icon: Sparkles },
    { id: 'location', label: 'Location', icon: MapPin }
  ];

  // Basic Info Tab
  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Name and Description */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={entity.name}
            onChange={(e) => updateEntity({ name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Orc Warrior, Gray Wolf, Bandit Archer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={entity.description}
            onChange={(e) => updateEntity({ description: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="Describe the entity's appearance and characteristics..."
          />
        </div>
      </div>

      {/* Classification */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type
          </label>
          <select
            value={entity.type}
            onChange={(e) => updateEntity({ type: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="humanoid" className="bg-slate-800 text-white">Humanoid</option>
            <option value="beast" className="bg-slate-800 text-white">Beast</option>
            <option value="undead" className="bg-slate-800 text-white">Undead</option>
            <option value="elemental" className="bg-slate-800 text-white">Elemental</option>
            <option value="construct" className="bg-slate-800 text-white">Construct</option>
            <option value="aberration" className="bg-slate-800 text-white">Aberration</option>
            <option value="dragon" className="bg-slate-800 text-white">Dragon</option>
            <option value="fey" className="bg-slate-800 text-white">Fey</option>
            <option value="fiend" className="bg-slate-800 text-white">Fiend</option>
            <option value="celestial" className="bg-slate-800 text-white">Celestial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subtype
          </label>
          <input
            type="text"
            value={entity.subtype || ''}
            onChange={(e) => updateEntity({ subtype: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., orc, wolf, goblin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Size
          </label>
          <select
            value={entity.size}
            onChange={(e) => updateEntity({ size: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="tiny" className="bg-slate-800 text-white">Tiny</option>
            <option value="small" className="bg-slate-800 text-white">Small</option>
            <option value="medium" className="bg-slate-800 text-white">Medium</option>
            <option value="large" className="bg-slate-800 text-white">Large</option>
            <option value="huge" className="bg-slate-800 text-white">Huge</option>
            <option value="gargantuan" className="bg-slate-800 text-white">Gargantuan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Challenge Rating
          </label>
          <input
            type="number"
            value={entity.challengeRating}
            onChange={(e) => updateEntity({ challengeRating: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
            max="30"
            step="0.125"
          />
        </div>
      </div>

      {/* Attributes */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Attributes</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {Object.keys(entity.attributes).map(attr => {
            const score = entity.attributes[attr];
            const modifier = calculateModifier(score);
            return (
              <div key={attr} className="bg-white/5 border border-white/20 rounded-lg p-3">
                <label className="block text-xs text-gray-400 uppercase mb-1">{attr.slice(0, 3)}</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => updateNested(`attributes.${attr}`, parseInt(e.target.value) || 10)}
                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="30"
                />
                <div className="text-center text-sm text-gray-400 mt-1">
                  {modifier >= 0 ? '+' : ''}{modifier}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Abilities */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Special Abilities</h3>
        <div className="space-y-2">
          {entity.abilities.map((ability, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={ability}
                onChange={(e) => {
                  const newAbilities = [...entity.abilities];
                  newAbilities[idx] = e.target.value;
                  updateEntity({ abilities: newAbilities });
                }}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Multiattack, Pack Tactics, Regeneration"
              />
              <button
                onClick={() => updateEntity({ abilities: entity.abilities.filter((_, i) => i !== idx) })}
                className="p-2 text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newAbility}
              onChange={(e) => setNewAbility(e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add new ability..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newAbility.trim()) {
                  updateEntity({ abilities: [...entity.abilities, newAbility.trim()] });
                  setNewAbility('');
                }
              }}
            />
            <button
              onClick={() => {
                if (newAbility.trim()) {
                  updateEntity({ abilities: [...entity.abilities, newAbility.trim()] });
                  setNewAbility('');
                }
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Combat Stats Tab
  const renderCombatTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Armor Class
          </label>
          <input
            type="number"
            value={entity.combat.armorClass}
            onChange={(e) => updateNested('combat.armorClass', parseInt(e.target.value) || 10)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="5"
            max="30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hit Points
          </label>
          <input
            type="number"
            value={entity.combat.hitPoints}
            onChange={(e) => {
              const hp = parseInt(e.target.value) || 10;
              updateEntity({
                combat: {
                  ...entity.combat,
                  hitPoints: hp,
                  maxHitPoints: hp
                }
              });
            }}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="1"
            max="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Speed (ft)
          </label>
          <input
            type="number"
            value={entity.combat.speed}
            onChange={(e) => updateNested('combat.speed', parseInt(e.target.value) || 30)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
            max="120"
            step="5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Initiative Bonus
          </label>
          <input
            type="number"
            value={entity.combat.initiative}
            onChange={(e) => updateNested('combat.initiative', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="-5"
            max="10"
          />
        </div>
      </div>

      {/* Damage Modifiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Resistances
          </label>
          <select
            multiple
            value={entity.resistances}
            onChange={(e) => updateEntity({ resistances: Array.from(e.target.selectedOptions, o => o.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            size="4"
          >
            <option value="physical" className="bg-slate-800 text-white">Physical</option>
            <option value="fire" className="bg-slate-800 text-white">Fire</option>
            <option value="cold" className="bg-slate-800 text-white">Cold</option>
            <option value="lightning" className="bg-slate-800 text-white">Lightning</option>
            <option value="poison" className="bg-slate-800 text-white">Poison</option>
            <option value="psychic" className="bg-slate-800 text-white">Psychic</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Immunities
          </label>
          <select
            multiple
            value={entity.immunities}
            onChange={(e) => updateEntity({ immunities: Array.from(e.target.selectedOptions, o => o.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            size="4"
          >
            <option value="physical" className="bg-slate-800 text-white">Physical</option>
            <option value="fire" className="bg-slate-800 text-white">Fire</option>
            <option value="cold" className="bg-slate-800 text-white">Cold</option>
            <option value="lightning" className="bg-slate-800 text-white">Lightning</option>
            <option value="poison" className="bg-slate-800 text-white">Poison</option>
            <option value="psychic" className="bg-slate-800 text-white">Psychic</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Vulnerabilities
          </label>
          <select
            multiple
            value={entity.vulnerabilities}
            onChange={(e) => updateEntity({ vulnerabilities: Array.from(e.target.selectedOptions, o => o.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            size="4"
          >
            <option value="physical" className="bg-slate-800 text-white">Physical</option>
            <option value="fire" className="bg-slate-800 text-white">Fire</option>
            <option value="cold" className="bg-slate-800 text-white">Cold</option>
            <option value="lightning" className="bg-slate-800 text-white">Lightning</option>
            <option value="poison" className="bg-slate-800 text-white">Poison</option>
            <option value="psychic" className="bg-slate-800 text-white">Psychic</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>
      </div>
    </div>
  );

  // Behavior Tab
  const renderBehaviorTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Temperament
          </label>
          <select
            value={entity.behavior.temperament}
            onChange={(e) => updateNested('behavior.temperament', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="aggressive" className="bg-slate-800 text-white">Aggressive</option>
            <option value="defensive" className="bg-slate-800 text-white">Defensive</option>
            <option value="neutral" className="bg-slate-800 text-white">Neutral</option>
            <option value="passive" className="bg-slate-800 text-white">Passive</option>
            <option value="fearful" className="bg-slate-800 text-white">Fearful</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Intelligence
          </label>
          <select
            value={entity.behavior.intelligence}
            onChange={(e) => updateNested('behavior.intelligence', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low" className="bg-slate-800 text-white">Low (animal-like)</option>
            <option value="medium" className="bg-slate-800 text-white">Medium (basic tactics)</option>
            <option value="high" className="bg-slate-800 text-white">High (strategic)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Combat Tactics
          </label>
          <select
            value={entity.behavior.tactics}
            onChange={(e) => updateNested('behavior.tactics', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="direct" className="bg-slate-800 text-white">Direct (melee rush)</option>
            <option value="ambush" className="bg-slate-800 text-white">Ambush (stealth attack)</option>
            <option value="ranged" className="bg-slate-800 text-white">Ranged (keep distance)</option>
            <option value="support" className="bg-slate-800 text-white">Support (aid allies)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Morale: {entity.behavior.morale}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={entity.behavior.morale}
            onChange={(e) => updateNested('behavior.morale', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Cowardly</span>
            <span>Brave</span>
            <span>Fearless</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Social Behavior
          </label>
          <select
            value={entity.behavior.socialability}
            onChange={(e) => updateNested('behavior.socialability', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="solitary" className="bg-slate-800 text-white">Solitary (alone)</option>
            <option value="pack" className="bg-slate-800 text-white">Pack (small groups 2-8)</option>
            <option value="horde" className="bg-slate-800 text-white">Horde (large groups 9+)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={entity.isHostile}
            onChange={(e) => updateEntity({ isHostile: e.target.checked })}
            className="rounded border-gray-600"
          />
          <span className="text-white">Hostile by Default</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          If checked, entity will attack on sight. If unchecked, entity is neutral until provoked.
        </p>
      </div>
    </div>
  );

  // Loot Tab
  const renderLootTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Currency (Gold)
          </label>
          <input
            type="number"
            value={entity.loot.currency}
            onChange={(e) => updateNested('loot.currency', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Experience Points
          </label>
          <input
            type="number"
            value={entity.loot.experience}
            onChange={(e) => updateNested('loot.experience', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Suggested: {new Entity({ challengeRating: entity.challengeRating }).calculateExperience()} XP
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Guaranteed Loot</h3>
        <div className="space-y-2">
          {entity.loot.guaranteed.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newLoot = [...entity.loot.guaranteed];
                  newLoot[idx] = e.target.value;
                  updateNested('loot.guaranteed', newLoot);
                }}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => updateNested('loot.guaranteed', entity.loot.guaranteed.filter((_, i) => i !== idx))}
                className="p-2 text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLootItem}
              onChange={(e) => setNewLootItem(e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Iron Sword, Healing Potion"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newLootItem.trim()) {
                  updateNested('loot.guaranteed', [...entity.loot.guaranteed, newLootItem.trim()]);
                  setNewLootItem('');
                }
              }}
            />
            <button
              onClick={() => {
                if (newLootItem.trim()) {
                  updateNested('loot.guaranteed', [...entity.loot.guaranteed, newLootItem.trim()]);
                  setNewLootItem('');
                }
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Location Tab
  const renderLocationTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Territory Behavior
        </label>
        <select
          value={entity.territoryBehavior}
          onChange={(e) => updateEntity({ territoryBehavior: e.target.value })}
          className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="patrol" className="bg-slate-800 text-white">Patrol (moves between locations)</option>
          <option value="guard" className="bg-slate-800 text-white">Guard (stays at specific location)</option>
          <option value="roam" className="bg-slate-800 text-white">Roam (random movement)</option>
          <option value="stationary" className="bg-slate-800 text-white">Stationary (doesn't move)</option>
        </select>
      </div>

      {availableNodes.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Assigned Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {availableNodes.map(node => {
              const isAssigned = entity.assignedNodes.includes(node.id);
              return (
                <label
                  key={node.id}
                  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                    isAssigned ? 'bg-indigo-600/20 border border-indigo-600/50' : 'bg-white/5 border border-white/20 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateEntity({ assignedNodes: [...entity.assignedNodes, node.id] });
                      } else {
                        updateEntity({ assignedNodes: entity.assignedNodes.filter(id => id !== node.id) });
                      }
                    }}
                    className="rounded border-gray-600"
                  />
                  <span className="text-white text-sm">{node.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No locations available</p>
          <p className="text-sm">Create nodes in your world to assign entities to locations</p>
        </div>
      )}

      {availableGroups.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Group Assignment
          </label>
          <select
            value={entity.groupId || ''}
            onChange={(e) => updateEntity({ groupId: e.target.value || null })}
            className="w-full px-3 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" className="bg-slate-800 text-white">No Group (Independent)</option>
            {availableGroups.map(group => (
              <option key={group.id} value={group.id} className="bg-slate-800 text-white">{group.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Skull className="w-6 h-6 text-red-400" />
          {mode === 'create' ? 'Create Entity' : 'Edit Entity'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/20 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'basic' && renderBasicTab()}
        {activeTab === 'combat' && renderCombatTab()}
        {activeTab === 'behavior' && renderBehaviorTab()}
        {activeTab === 'loot' && renderLootTab()}
        {activeTab === 'location' && renderLocationTab()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/20 mt-6">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {mode === 'create' ? 'Create Entity' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EntityEditor;
