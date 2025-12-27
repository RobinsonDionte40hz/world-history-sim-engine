import React, { useState, useCallback, useMemo } from 'react';
import { Save, Upload, Plus, X, Trash2, Copy } from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import TemplateLibraryPanel from './TemplateLibraryPanel';
import PlaceholderEditor from './text-templating/PlaceholderEditor';
import EditorContextService from '../../application/services/EditorContextService';
import { useWorldContext } from '../contexts/WorldContext';

// Item categories
const ITEM_CATEGORIES = [
  { id: 'weapon', label: 'Weapon', icon: '⚔️', color: 'red' },
  { id: 'armor', label: 'Armor', icon: '🛡️', color: 'blue' },
  { id: 'consumable', label: 'Consumable', icon: '🧪', color: 'green' },
  { id: 'tool', label: 'Tool', icon: '🔧', color: 'yellow' },
  { id: 'accessory', label: 'Accessory', icon: '💍', color: 'purple' },
  { id: 'quest', label: 'Quest Item', icon: '📜', color: 'orange' },
  { id: 'material', label: 'Material', icon: '⚒️', color: 'gray' },
  { id: 'general', label: 'General', icon: '🎒', color: 'slate' }
];

// Rarity levels
const RARITY_LEVELS = [
  { id: 'common', label: 'Common', color: 'gray' },
  { id: 'uncommon', label: 'Uncommon', color: 'green' },
  { id: 'rare', label: 'Rare', color: 'blue' },
  { id: 'epic', label: 'Epic', color: 'purple' },
  { id: 'legendary', label: 'Legendary', color: 'orange' },
  { id: 'artifact', label: 'Artifact', color: 'red' }
];

// Equipment slots
const EQUIPMENT_SLOTS = [
  { id: 'mainHand', label: 'Main Hand' },
  { id: 'offHand', label: 'Off Hand' },
  { id: 'armor', label: 'Armor' },
  { id: 'accessory', label: 'Accessory' },
  { id: 'tool', label: 'Tool' }
];

// D&D Attributes
const DND_ATTRIBUTES = [
  { id: 'strength', label: 'Strength', abbr: 'STR' },
  { id: 'dexterity', label: 'Dexterity', abbr: 'DEX' },
  { id: 'constitution', label: 'Constitution', abbr: 'CON' },
  { id: 'intelligence', label: 'Intelligence', abbr: 'INT' },
  { id: 'wisdom', label: 'Wisdom', abbr: 'WIS' },
  { id: 'charisma', label: 'Charisma', abbr: 'CHA' }
];

// Effect types
const EFFECT_TYPES = [
  { id: 'attribute', label: 'Attribute Modifier', icon: '📊' },
  { id: 'skill', label: 'Skill Bonus', icon: '🎯' },
  { id: 'resistance', label: 'Damage Resistance', icon: '🛡️' },
  { id: 'ability', label: 'Grant Ability', icon: '✨' },
  { id: 'special', label: 'Special Effect', icon: '⚡' }
];

// Effect operations
const EFFECT_OPERATIONS = [
  { id: 'add', label: 'Add (+)' },
  { id: 'multiply', label: 'Multiply (×)' },
  { id: 'set', label: 'Set (=)' }
];

// Effect conditions
const EFFECT_CONDITIONS = [
  { id: 'passive', label: 'Always Active (Passive)' },
  { id: 'when_equipped', label: 'When Equipped' },
  { id: 'on_use', label: 'On Use' }
];

/**
 * ItemEditor - Component for creating and editing items
 * Follows the pattern from CharacterEditor and InteractionEditor
 */
const ItemEditor = ({ 
  initialItem = null, 
  onChange, 
  onSave, 
  onCancel, 
  mode = 'create',
  // Context props for text templating
  currentCharacter = null,
  currentWorld = null
}) => {
  const [item, setItem] = useState(() => {
    const baseItem = initialItem || {
      name: '',
      description: '',
      category: 'general',
      subtype: '',
      rarity: 'common',
      weight: 0,
      value: 0,
      stackable: true,
      maxStack: 99,
      durability: null,
      maxDurability: null,
      repairable: true,
      charges: null,
      maxCharges: null,
      rechargeRate: null,
      equipSlot: null,
      twoHanded: false,
      damage: null,
      range: null,
      properties: [],
      armorClass: null,
      armorType: null,
      effects: [],
      requirements: {},
      consumable: false,
      usable: false,
      questItem: false,
      tradeable: true,
      lore: '',
      flavorText: '',
      tags: [],
      craftable: false,
      craftingRecipe: null
    };

    return {
      ...baseItem,
      effects: baseItem.effects || [],
      requirements: baseItem.requirements || {},
      properties: baseItem.properties || [],
      tags: baseItem.tags || []
    };
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  // Context detection for text templating
  const editorContext = useMemo(() => {
    return EditorContextService.detectContext('item', {
      item,
      character: currentCharacter,
      world: currentWorld
    });
  }, [currentCharacter, currentWorld, item]);

  // Template management
  const {
    templates: itemTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate
  } = useTemplates('item');

  // Update item data
  const updateItem = useCallback((updates) => {
    setItem(prev => {
      const updated = { ...prev, ...updates };
      if (onChange) onChange(updated);
      return updated;
    });
  }, [onChange]);

  // Handle save
  const handleSave = useCallback(() => {
    const errors = validateItem(item);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (onSave) {
      onSave(item);
    }
  }, [item, onSave]);

  // Validate item
  const validateItem = (itemData) => {
    const errors = {};

    if (!itemData.name || itemData.name.trim() === '') {
      errors.name = 'Item name is required';
    }

    if (itemData.weight < 0) {
      errors.weight = 'Weight cannot be negative';
    }

    if (itemData.value < 0) {
      errors.value = 'Value cannot be negative';
    }

    return errors;
  };

  // Effect management
  const addEffect = useCallback((effect) => {
    updateItem({
      effects: [...item.effects, { ...effect, id: Date.now() }]
    });
  }, [item.effects, updateItem]);

  const removeEffect = useCallback((effectId) => {
    updateItem({
      effects: item.effects.filter(e => e.id !== effectId)
    });
  }, [item.effects, updateItem]);

  const updateEffect = useCallback((effectId, updates) => {
    updateItem({
      effects: item.effects.map(e => 
        e.id === effectId ? { ...e, ...updates } : e
      )
    });
  }, [item.effects, updateItem]);

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'properties', label: 'Properties', icon: '⚙️' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'requirements', label: 'Requirements', icon: '🔒' },
    { id: 'crafting', label: 'Crafting', icon: '🔨' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create Item' : 'Edit Item'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Define equipment, consumables, quest items, and more
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateLibrary(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Load Template
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Item
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/20 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 whitespace-nowrap transition-all
              ${activeTab === tab.id
                ? 'border-b-2 border-indigo-500 text-white font-medium'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem({ name: e.target.value })}
                  placeholder="Enter item name..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={item.category}
                  onChange={(e) => updateItem({ category: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {ITEM_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-gray-800">
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rarity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rarity
                </label>
                <select
                  value={item.rarity}
                  onChange={(e) => updateItem({ rarity: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {RARITY_LEVELS.map(rarity => (
                    <option key={rarity.id} value={rarity.id} className="bg-gray-800">
                      {rarity.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={item.weight}
                  onChange={(e) => updateItem({ weight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Value (gold)
                </label>
                <input
                  type="number"
                  min="0"
                  value={item.value}
                  onChange={(e) => updateItem({ value: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <PlaceholderEditor
                value={item.description}
                onChange={(description) => updateItem({ description })}
                context={editorContext}
                placeholder="Describe the item..."
                rows={3}
                showSuggestions={true}
                showPreview={true}
              />
              <p className="text-xs text-gray-400 mt-1">
                Use {'{{placeholders}}'} for dynamic content
              </p>
            </div>

            {/* Flavor Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Flavor Text
              </label>
              <textarea
                value={item.flavorText}
                onChange={(e) => updateItem({ flavorText: e.target.value })}
                placeholder="Add atmospheric flavor text..."
                rows={2}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
              />
            </div>

            {/* Flags */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.stackable}
                  onChange={(e) => updateItem({ stackable: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Stackable
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.consumable}
                  onChange={(e) => updateItem({ consumable: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Consumable
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.usable}
                  onChange={(e) => updateItem({ usable: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Usable
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.questItem}
                  onChange={(e) => updateItem({ questItem: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Quest Item
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.tradeable}
                  onChange={(e) => updateItem({ tradeable: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Tradeable
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.craftable}
                  onChange={(e) => updateItem({ craftable: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Craftable
              </label>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {/* Equipment Properties */}
            {(item.category === 'weapon' || item.category === 'armor' || item.category === 'tool') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Equipment Properties</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Equipment Slot */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Equipment Slot
                    </label>
                    <select
                      value={item.equipSlot || ''}
                      onChange={(e) => updateItem({ equipSlot: e.target.value || null })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="" className="bg-gray-800">None</option>
                      {EQUIPMENT_SLOTS.map(slot => (
                        <option key={slot.id} value={slot.id} className="bg-gray-800">
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Two-Handed */}
                  {item.category === 'weapon' && (
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.twoHanded}
                          onChange={(e) => updateItem({ twoHanded: e.target.checked })}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Two-Handed Weapon
                      </label>
                    </div>
                  )}
                </div>

                {/* Weapon Properties */}
                {item.category === 'weapon' && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-white">Weapon Stats</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Damage Dice
                        </label>
                        <input
                          type="text"
                          placeholder="1d8"
                          value={item.damage?.dice || ''}
                          onChange={(e) => updateItem({
                            damage: { ...(item.damage || {}), dice: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Damage Type
                        </label>
                        <input
                          type="text"
                          placeholder="slashing"
                          value={item.damage?.type || ''}
                          onChange={(e) => updateItem({
                            damage: { ...(item.damage || {}), type: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Bonus Damage
                        </label>
                        <input
                          type="number"
                          value={item.damage?.bonus || 0}
                          onChange={(e) => updateItem({
                            damage: { ...(item.damage || {}), bonus: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Armor Properties */}
                {item.category === 'armor' && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-white">Armor Stats</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Armor Class
                        </label>
                        <input
                          type="number"
                          value={item.armorClass || 0}
                          onChange={(e) => updateItem({ armorClass: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Armor Type
                        </label>
                        <select
                          value={item.armorType || ''}
                          onChange={(e) => updateItem({ armorType: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        >
                          <option value="" className="bg-gray-800">Select type</option>
                          <option value="light" className="bg-gray-800">Light</option>
                          <option value="medium" className="bg-gray-800">Medium</option>
                          <option value="heavy" className="bg-gray-800">Heavy</option>
                          <option value="shield" className="bg-gray-800">Shield</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Durability System */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Durability</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Max Durability
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.maxDurability || ''}
                    onChange={(e) => updateItem({ 
                      maxDurability: e.target.value ? parseInt(e.target.value) : null,
                      durability: e.target.value ? parseInt(e.target.value) : null
                    })}
                    placeholder="None"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.repairable}
                      onChange={(e) => updateItem({ repairable: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Repairable
                  </label>
                </div>
              </div>
            </div>

            {/* Charges System */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Charges</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Max Charges
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.maxCharges || ''}
                    onChange={(e) => updateItem({ 
                      maxCharges: e.target.value ? parseInt(e.target.value) : null,
                      charges: e.target.value ? parseInt(e.target.value) : null
                    })}
                    placeholder="None"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Recharge Rate
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.rechargeRate || ''}
                    onChange={(e) => updateItem({ 
                      rechargeRate: e.target.value ? parseInt(e.target.value) : null
                    })}
                    placeholder="Per rest"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* Stack Size */}
            {item.stackable && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Stack Size
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.maxStack}
                  onChange={(e) => updateItem({ maxStack: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            )}
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <EffectsEditor
            effects={item.effects}
            onAdd={addEffect}
            onRemove={removeEffect}
            onUpdate={updateEffect}
          />
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <RequirementsEditor
            requirements={item.requirements}
            onChange={(requirements) => updateItem({ requirements })}
          />
        )}

        {/* Crafting Tab */}
        {activeTab === 'crafting' && item.craftable && (
          <CraftingEditor
            recipe={item.craftingRecipe}
            onChange={(craftingRecipe) => updateItem({ craftingRecipe })}
          />
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            {/* Lore */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lore & History
              </label>
              <textarea
                value={item.lore}
                onChange={(e) => updateItem({ lore: e.target.value })}
                placeholder="Add detailed lore and backstory..."
                rows={4}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={item.tags.join(', ')}
                onChange={(e) => updateItem({ 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="magical, cursed, ancient..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Comma-separated tags for organization and search
              </p>
            </div>

            {/* Subtype */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subtype
              </label>
              <input
                type="text"
                value={item.subtype}
                onChange={(e) => updateItem({ subtype: e.target.value })}
                placeholder="longsword, healing_potion, etc."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <TemplateLibraryPanel
          type="item"
          templates={itemTemplates}
          onLoad={(template) => {
            setItem(template.data);
            setShowTemplateLibrary(false);
          }}
          onDelete={deleteTemplate}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}
    </div>
  );
};

/**
 * Effects Editor Component
 */
const EffectsEditor = ({ effects, onAdd, onRemove, onUpdate }) => {
  const [newEffect, setNewEffect] = useState({
    type: 'attribute',
    target: '',
    operation: 'add',
    value: 0,
    condition: 'when_equipped',
    description: ''
  });

  const handleAdd = () => {
    if (newEffect.target && newEffect.value !== 0) {
      onAdd(newEffect);
      setNewEffect({
        type: 'attribute',
        target: '',
        operation: 'add',
        value: 0,
        condition: 'when_equipped',
        description: ''
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Item Effects</h3>
      <p className="text-sm text-gray-400">
        Define bonuses, penalties, and special effects this item provides
      </p>

      {/* Add New Effect */}
      <div className="p-4 bg-white/10 rounded-lg border border-white/20 space-y-3">
        <h4 className="text-sm font-medium text-white">Add Effect</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Effect Type</label>
            <select
              value={newEffect.type}
              onChange={(e) => setNewEffect({ ...newEffect, type: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            >
              {EFFECT_TYPES.map(type => (
                <option key={type.id} value={type.id} className="bg-gray-800">
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Target</label>
            <input
              type="text"
              value={newEffect.target}
              onChange={(e) => setNewEffect({ ...newEffect, target: e.target.value })}
              placeholder="strength, perception..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Operation</label>
            <select
              value={newEffect.operation}
              onChange={(e) => setNewEffect({ ...newEffect, operation: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            >
              {EFFECT_OPERATIONS.map(op => (
                <option key={op.id} value={op.id} className="bg-gray-800">
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Value</label>
            <input
              type="number"
              value={newEffect.value}
              onChange={(e) => setNewEffect({ ...newEffect, value: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Condition</label>
            <select
              value={newEffect.condition}
              onChange={(e) => setNewEffect({ ...newEffect, condition: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            >
              {EFFECT_CONDITIONS.map(cond => (
                <option key={cond.id} value={cond.id} className="bg-gray-800">
                  {cond.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Description</label>
            <input
              type="text"
              value={newEffect.description}
              onChange={(e) => setNewEffect({ ...newEffect, description: e.target.value })}
              placeholder="Brief description..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Effect
        </button>
      </div>

      {/* Effects List */}
      <div className="space-y-2">
        {effects.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No effects added yet</p>
            <p className="text-sm">Add effects to give this item special properties</p>
          </div>
        ) : (
          effects.map(effect => (
            <div
              key={effect.id}
              className="p-3 bg-white/10 rounded-lg border border-white/20 flex items-start justify-between gap-3"
            >
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs">
                    {effect.type}
                  </span>
                  <span className="text-white font-medium">
                    {effect.target}
                  </span>
                  <span className="text-gray-400">
                    {effect.operation} {effect.value}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {effect.condition} • {effect.description || 'No description'}
                </div>
              </div>
              <button
                onClick={() => onRemove(effect.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Requirements Editor Component
 */
const RequirementsEditor = ({ requirements, onChange }) => {
  const updateRequirement = (key, value) => {
    onChange({
      ...requirements,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Item Requirements</h3>
      <p className="text-sm text-gray-400">
        Define requirements for using or equipping this item
      </p>

      {/* Level Requirement */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Minimum Level
        </label>
        <input
          type="number"
          min="0"
          value={requirements.level || ''}
          onChange={(e) => updateRequirement('level', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="No level requirement"
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        />
      </div>

      {/* Attribute Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Attribute Requirements
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DND_ATTRIBUTES.map(attr => (
            <div key={attr.id}>
              <label className="block text-xs text-gray-400 mb-1">{attr.label}</label>
              <input
                type="number"
                min="0"
                max="30"
                value={requirements.attributes?.[attr.id] || ''}
                onChange={(e) => updateRequirement('attributes', {
                  ...(requirements.attributes || {}),
                  [attr.id]: e.target.value ? parseInt(e.target.value) : undefined
                })}
                placeholder="--"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Race Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Race Restrictions
        </label>
        <input
          type="text"
          value={requirements.race?.join(', ') || ''}
          onChange={(e) => updateRequirement('race', 
            e.target.value ? e.target.value.split(',').map(r => r.trim()).filter(Boolean) : []
          )}
          placeholder="human, elf, dwarf..."
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        />
        <p className="text-xs text-gray-400 mt-1">
          Leave empty for no race restrictions
        </p>
      </div>
    </div>
  );
};

/**
 * Crafting Editor Component
 */
const CraftingEditor = ({ recipe, onChange }) => {
  const updateRecipe = (updates) => {
    onChange({
      ...(recipe || {}),
      ...updates
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Crafting Recipe</h3>
      <p className="text-sm text-gray-400">
        Define materials and requirements for crafting this item
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Crafting Time (minutes)
          </label>
          <input
            type="number"
            min="0"
            value={recipe?.time || ''}
            onChange={(e) => updateRecipe({ time: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Experience Gained
          </label>
          <input
            type="number"
            min="0"
            value={recipe?.experience || ''}
            onChange={(e) => updateRecipe({ experience: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </div>
      </div>

      <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
        <p className="text-sm text-yellow-300">
          🔨 Material and tool selection will be enhanced in a future update
        </p>
      </div>
    </div>
  );
};

export default ItemEditor;
