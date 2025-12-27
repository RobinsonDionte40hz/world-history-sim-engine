// src/presentation/components/GroupEditor.js

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Save, X, Users, Shield, Skull, MapPin, TrendingUp, UserCheck, Target, AlertTriangle } from 'lucide-react';
import EntityGroup from '../../domain/entities/EntityGroup.js';

/**
 * GroupEditor - UI for creating and managing entity groups (warbands, packs, patrols)
 * 
 * Features:
 * - Create and configure groups
 * - Add/remove members from available entities
 * - Assign leaders
 * - Configure territory and patrol routes
 * - Set group behavior and stance
 * - Manage morale and combat settings
 */
const GroupEditor = ({
  initialGroup = null,
  onSave,
  onCancel,
  mode = 'create',
  availableEntities = [],
  availableNodes = [],
  otherGroups = []
}) => {
  const [group, setGroup] = useState(() => {
    if (initialGroup) {
      return initialGroup instanceof EntityGroup ? initialGroup.toJSON() : initialGroup;
    }
    return {
      name: '',
      description: '',
      type: 'warband',
      faction: '',
      members: [],
      maxMembers: 20,
      composition: {},
      leadership: {
        leaderId: null,
        hasLeader: false,
        leadershipBonus: 10
      },
      behavior: {
        stance: 'aggressive',
        territory: 'patrol',
        hostility: 'hostile',
        intelligence: 'medium',
        coordination: 0.7
      },
      territory: {
        homeNodeId: null,
        controlledNodes: [],
        patrolRoutes: [],
        territoryRadius: 1,
        contested: false
      },
      combat: {
        averageCR: 0,
        totalCR: 0,
        packTactics: true,
        formations: [],
        retreatThreshold: 0.3
      },
      morale: {
        current: 0,
        base: 100,
        modifiers: [],
        leaderEffect: 20
      },
      resources: {
        treasury: 0,
        equipment: [],
        supplies: 0
      },
      relationships: {},
      metadata: {
        createdAt: Date.now(),
        tags: []
      }
    };
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [selectedEntity, setSelectedEntity] = useState(null);

  const updateGroup = useCallback((updates) => {
    setGroup(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNested = useCallback((path, value) => {
    setGroup(prev => {
      const newGroup = { ...prev };
      const keys = path.split('.');
      let current = newGroup;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newGroup;
    });
  }, []);

  // Recalculate combat stats when members change
  useEffect(() => {
    if (group.members.length > 0) {
      const memberEntities = availableEntities.filter(e => group.members.includes(e.id));
      const totalCR = memberEntities.reduce((sum, e) => sum + (e.challengeRating || 1), 0);
      const averageCR = memberEntities.length > 0 ? totalCR / memberEntities.length : 0;
      
      updateNested('combat.totalCR', totalCR);
      updateNested('combat.averageCR', Math.round(averageCR * 100) / 100);
      
      // Update composition
      const composition = {};
      memberEntities.forEach(e => {
        const type = e.type || 'unknown';
        composition[type] = (composition[type] || 0) + 1;
      });
      updateGroup({ composition });
    }
  }, [group.members, availableEntities]);

  const handleSave = () => {
    if (!group.name.trim()) {
      alert('Group name is required');
      return;
    }

    if (group.members.length === 0) {
      alert('Group must have at least one member');
      return;
    }

    // Create EntityGroup instance
    const groupInstance = new EntityGroup(group);
    onSave(groupInstance);
  };

  const addMember = (entityId) => {
    if (group.members.length >= group.maxMembers) {
      alert(`Group is at maximum capacity (${group.maxMembers} members)`);
      return;
    }

    if (!group.members.includes(entityId)) {
      updateGroup({ members: [...group.members, entityId] });
    }
  };

  const removeMember = (entityId) => {
    updateGroup({ members: group.members.filter(id => id !== entityId) });
    
    // If removing the leader, update leadership
    if (group.leadership.leaderId === entityId) {
      updateNested('leadership.leaderId', null);
      updateNested('leadership.hasLeader', false);
    }
  };

  const setLeader = (entityId) => {
    if (!group.members.includes(entityId)) {
      alert('Leader must be a member of the group');
      return;
    }

    updateNested('leadership.leaderId', entityId);
    updateNested('leadership.hasLeader', true);
  };

  const availableToAdd = useMemo(() => {
    return availableEntities.filter(e => !group.members.includes(e.id));
  }, [availableEntities, group.members]);

  const memberEntities = useMemo(() => {
    return availableEntities.filter(e => group.members.includes(e.id));
  }, [availableEntities, group.members]);

  // Calculate current morale
  const calculateMorale = useCallback(() => {
    let morale = group.morale.base;
    
    // Leader effect
    if (group.leadership.hasLeader) {
      morale += group.morale.leaderEffect;
    }
    
    // Size modifier (large groups harder to maintain morale)
    if (group.members.length > 10) {
      morale -= Math.floor((group.members.length - 10) / 5);
    }
    
    // Add custom modifiers
    group.morale.modifiers.forEach(mod => {
      morale += mod.value || 0;
    });
    
    return Math.max(0, Math.min(100, morale));
  }, [group]);

  // Render tabs
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Users },
    { id: 'members', label: 'Members', icon: UserCheck },
    { id: 'behavior', label: 'Behavior', icon: Target },
    { id: 'territory', label: 'Territory', icon: MapPin },
    { id: 'combat', label: 'Combat', icon: Skull },
    { id: 'relations', label: 'Relations', icon: TrendingUp }
  ];

  // Basic Info Tab
  const renderBasicTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Group Name *
          </label>
          <input
            type="text"
            value={group.name}
            onChange={(e) => updateGroup({ name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Bloodfang Warband, Shadow Pack, Iron Guard Patrol"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={group.description}
            onChange={(e) => updateGroup({ description: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="Describe the group's origin, purpose, and characteristics..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Group Type
          </label>
          <select
            value={group.type}
            onChange={(e) => updateGroup({ type: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="warband">Warband (raiders, warriors)</option>
            <option value="pack">Pack (wolves, beasts)</option>
            <option value="patrol">Patrol (guards, soldiers)</option>
            <option value="horde">Horde (large army)</option>
            <option value="gang">Gang (bandits, thugs)</option>
            <option value="tribe">Tribe (nomadic group)</option>
            <option value="cult">Cult (fanatical followers)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Faction/Allegiance
          </label>
          <input
            type="text"
            value={group.faction || ''}
            onChange={(e) => updateGroup({ faction: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Ironforge, Shadow Clan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Members
          </label>
          <input
            type="number"
            value={group.maxMembers}
            onChange={(e) => updateGroup({ maxMembers: parseInt(e.target.value) || 20 })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="1"
            max="100"
          />
        </div>
      </div>

      {/* Group Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
        <div>
          <div className="text-xs text-gray-400">Current Members</div>
          <div className="text-2xl font-bold text-white">{group.members.length} / {group.maxMembers}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Total CR</div>
          <div className="text-2xl font-bold text-yellow-400">{group.combat.totalCR.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Average CR</div>
          <div className="text-2xl font-bold text-orange-400">{group.combat.averageCR.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Current Morale</div>
          <div className="text-2xl font-bold text-green-400">{calculateMorale()}</div>
        </div>
      </div>

      {/* Composition */}
      {Object.keys(group.composition).length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Composition</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(group.composition).map(([type, count]) => (
              <div key={type} className="px-3 py-1 bg-indigo-600/20 border border-indigo-600/50 rounded-full text-sm text-indigo-300">
                {count} {type}{count > 1 ? 's' : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Members Tab
  const renderMembersTab = () => (
    <div className="space-y-6">
      {/* Current Members */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Current Members ({memberEntities.length})</h3>
        {memberEntities.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {memberEntities.map(entity => {
              const isLeader = group.leadership.leaderId === entity.id;
              return (
                <div
                  key={entity.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isLeader ? 'bg-yellow-600/20 border border-yellow-600/50' : 'bg-white/5 border border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {entity.name}
                        {isLeader && (
                          <span className="px-2 py-0.5 bg-yellow-600 text-xs rounded-full">Leader</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {entity.type} • CR {entity.challengeRating}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isLeader && (
                      <button
                        onClick={() => setLeader(entity.id)}
                        className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded text-sm"
                      >
                        Make Leader
                      </button>
                    )}
                    <button
                      onClick={() => removeMember(entity.id)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No members yet</p>
            <p className="text-sm">Add entities from the available list below</p>
          </div>
        )}
      </div>

      {/* Available Entities */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Available Entities ({availableToAdd.length})
        </h3>
        {availableToAdd.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableToAdd.map(entity => (
              <div
                key={entity.id}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div>
                  <div className="font-medium text-white">{entity.name}</div>
                  <div className="text-sm text-gray-400">
                    {entity.type} • CR {entity.challengeRating}
                  </div>
                </div>
                <button
                  onClick={() => addMember(entity.id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
                  disabled={group.members.length >= group.maxMembers}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No entities available</p>
            <p className="text-sm">All entities are already members or none exist</p>
          </div>
        )}
      </div>

      {/* Leadership Settings */}
      <div className="p-4 bg-white/5 rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Leadership Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Leadership Bonus</label>
            <input
              type="number"
              value={group.leadership.leadershipBonus}
              onChange={(e) => updateNested('leadership.leadershipBonus', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
              max="50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Morale from Leader</label>
            <input
              type="number"
              value={group.morale.leaderEffect}
              onChange={(e) => updateNested('morale.leaderEffect', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
              max="50"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Behavior Tab
  const renderBehaviorTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Stance
          </label>
          <select
            value={group.behavior.stance}
            onChange={(e) => updateNested('behavior.stance', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="aggressive">Aggressive (attacks on sight)</option>
            <option value="defensive">Defensive (guards territory)</option>
            <option value="neutral">Neutral (won't attack unless provoked)</option>
            <option value="passive">Passive (avoids combat)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hostility Level
          </label>
          <select
            value={group.behavior.hostility}
            onChange={(e) => updateNested('behavior.hostility', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="hostile">Hostile (attacks all outsiders)</option>
            <option value="defensive">Defensive (attacks if threatened)</option>
            <option value="neutral">Neutral (ignores most)</option>
            <option value="friendly">Friendly (may assist players)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Intelligence
          </label>
          <select
            value={group.behavior.intelligence}
            onChange={(e) => updateNested('behavior.intelligence', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Low (animal-like behavior)</option>
            <option value="medium">Medium (basic tactics)</option>
            <option value="high">High (strategic planning)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Territory Behavior
          </label>
          <select
            value={group.behavior.territory}
            onChange={(e) => updateNested('behavior.territory', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="patrol">Patrol (moves between locations)</option>
            <option value="guard">Guard (defends specific area)</option>
            <option value="roam">Roam (wanders randomly)</option>
            <option value="stationary">Stationary (stays in one place)</option>
            <option value="nomadic">Nomadic (constantly moving)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Coordination: {(group.behavior.coordination * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={group.behavior.coordination}
          onChange={(e) => updateNested('behavior.coordination', parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Disorganized</span>
          <span>Coordinated</span>
          <span>Highly Disciplined</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Higher coordination improves combat effectiveness and formations
        </p>
      </div>
    </div>
  );

  // Territory Tab
  const renderTerritoryTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Home Base
          </label>
          <select
            value={group.territory.homeNodeId || ''}
            onChange={(e) => updateNested('territory.homeNodeId', e.target.value || null)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">No Home Base</option>
            {availableNodes.map(node => (
              <option key={node.id} value={node.id}>{node.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Territory Radius
          </label>
          <input
            type="number"
            value={group.territory.territoryRadius}
            onChange={(e) => updateNested('territory.territoryRadius', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
            max="10"
          />
          <p className="text-xs text-gray-500 mt-1">
            Distance from home base the group considers its territory
          </p>
        </div>
      </div>

      {availableNodes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Controlled Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {availableNodes.map(node => {
              const isControlled = group.territory.controlledNodes.includes(node.id);
              return (
                <label
                  key={node.id}
                  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                    isControlled ? 'bg-indigo-600/20 border border-indigo-600/50' : 'bg-white/5 border border-white/20 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isControlled}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateNested('territory.controlledNodes', [...group.territory.controlledNodes, node.id]);
                      } else {
                        updateNested('territory.controlledNodes', group.territory.controlledNodes.filter(id => id !== node.id));
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
      )}

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={group.territory.contested}
            onChange={(e) => updateNested('territory.contested', e.target.checked)}
            className="rounded border-gray-600"
          />
          <span className="text-white">Territory is Contested</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Mark if this group's territory is being disputed by other groups
        </p>
      </div>
    </div>
  );

  // Combat Tab
  const renderCombatTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Formation Type
          </label>
          <select
            value={group.combat.formationType || 'standard'}
            onChange={(e) => updateNested('combat.formationType', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="standard">Standard (Balanced)</option>
            <option value="defensive">Defensive (+2 AC, -1 damage)</option>
            <option value="aggressive">Aggressive (+1 damage, -1 AC)</option>
            <option value="skirmish">Skirmish (+1 initiative, mobile)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Formation affects 2x5 grid combat bonuses
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={group.combat.packTactics}
              onChange={(e) => updateNested('combat.packTactics', e.target.checked)}
              className="rounded border-gray-600"
            />
            <span className="text-white">Pack Tactics</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Members gain advantage when fighting alongside allies in formation
          </p>
        </div>
      </div>

      {/* Formation Grid Visualization */}
      <div className="p-4 bg-white/5 rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Combat Formation (2 rows × 5 positions)</h3>
        <div className="space-y-2">
          {/* Back Row */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Back Row (Ranged/Support)</div>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(col => (
                <div
                  key={`back-${col}`}
                  className="h-12 bg-white/10 border border-white/20 rounded flex items-center justify-center text-xs text-gray-400"
                >
                  {col === 2 ? '★' : col + 1}
                </div>
              ))}
            </div>
          </div>
          {/* Front Row */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Front Row (Melee/Tank)</div>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(col => (
                <div
                  key={`front-${col}`}
                  className="h-12 bg-white/10 border border-indigo-600/50 rounded flex items-center justify-center text-xs text-gray-400"
                >
                  {col === 2 ? '★' : col + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ★ = Leader position (center). Formation initialized automatically from member tactics.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Retreat Threshold: {(group.combat.retreatThreshold * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={group.combat.retreatThreshold}
          onChange={(e) => updateNested('combat.retreatThreshold', parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Group retreats when this % of members remain
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Base Morale</h3>
        <input
          type="range"
          min="0"
          max="100"
          value={group.morale.base}
          onChange={(e) => updateNested('morale.base', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Cowardly (0)</span>
          <span>Average (50)</span>
          <span>Fearless (100)</span>
        </div>
      </div>

      <div className="p-4 bg-white/5 rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Combat Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-400">Total CR</div>
            <div className="text-xl font-bold text-yellow-400">{group.combat.totalCR.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Average CR</div>
            <div className="text-xl font-bold text-orange-400">{group.combat.averageCR.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Calculated Morale</div>
            <div className="text-xl font-bold text-green-400">{calculateMorale()}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Resources</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Treasury (Gold)</label>
            <input
              type="number"
              value={group.resources.treasury}
              onChange={(e) => updateNested('resources.treasury', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Supplies</label>
            <input
              type="number"
              value={group.resources.supplies}
              onChange={(e) => updateNested('resources.supplies', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Relations Tab
  const renderRelationsTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8 text-gray-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Group Relationships</p>
        <p className="text-sm">Configure relationships with other groups</p>
        <p className="text-xs mt-2">This feature will allow you to set alliances, rivalries, and more</p>
      </div>

      {otherGroups.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Available Groups</h3>
          <div className="space-y-2">
            {otherGroups.map(otherGroup => {
              const relationship = group.relationships[otherGroup.id];
              return (
                <div key={otherGroup.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/20 rounded-lg">
                  <div className="text-white">{otherGroup.name}</div>
                  <select
                    value={relationship?.status || 'neutral'}
                    onChange={(e) => {
                      const newRelationships = { ...group.relationships };
                      newRelationships[otherGroup.id] = {
                        status: e.target.value,
                        strength: relationship?.strength || 0.5
                      };
                      updateGroup({ relationships: newRelationships });
                    }}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                  >
                    <option value="ally">Ally</option>
                    <option value="neutral">Neutral</option>
                    <option value="rival">Rival</option>
                    <option value="enemy">Enemy</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-400" />
          {mode === 'create' ? 'Create Group' : 'Edit Group'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/20 mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'behavior' && renderBehaviorTab()}
        {activeTab === 'territory' && renderTerritoryTab()}
        {activeTab === 'combat' && renderCombatTab()}
        {activeTab === 'relations' && renderRelationsTab()}
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
          {mode === 'create' ? 'Create Group' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default GroupEditor;
