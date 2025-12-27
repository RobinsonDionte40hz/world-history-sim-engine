// src/presentation/components/ItemAssignmentPanel.js

/**
 * ItemAssignmentPanel - Manage item inventory and equipment for characters/entities
 */

import React, { useState, useMemo } from 'react';
import { Package, Search, X, ShoppingBag, Shield, Sparkles, Wrench, Plus, Trash2 } from 'lucide-react';
import { 
  getAllItemTemplates, 
  getItemTemplatesByCategory, 
  ITEM_TEMPLATE_CATEGORIES 
} from '../../configs/item-templates.js';
import Item from '../../domain/entities/Item.js';

const ItemAssignmentPanel = ({
  character,
  items = [],
  equippedItems = new Map(),
  onAddItem,
  onRemoveItem,
  onEquipItem,
  onUnequipItem
}) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Get all available templates
  const allTemplates = useMemo(() => getAllItemTemplates(), []);

  // Filter templates by category and search
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

  // Check if character can use an item
  const canUseItem = (item) => {
    if (!character || !item.requirements) return true;

    // Check attribute requirements
    if (item.requirements.attributes) {
      for (const [attr, value] of Object.entries(item.requirements.attributes)) {
        if ((character.attributes?.[attr] || 0) < value) {
          return false;
        }
      }
    }

    // Check level requirement
    if (item.requirements.level && (character.level || 0) < item.requirements.level) {
      return false;
    }

    return true;
  };

  // Get rarity color
  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-400 border-gray-500/30',
      uncommon: 'text-green-400 border-green-500/30',
      rare: 'text-blue-400 border-blue-500/30',
      epic: 'text-purple-400 border-purple-500/30',
      legendary: 'text-orange-400 border-orange-500/30',
      artifact: 'text-red-400 border-red-500/30'
    };
    return colors[rarity] || colors.common;
  };

  // Check if item is equipped
  const isEquipped = (itemId) => {
    if (!equippedItems) return false;
    for (const id of equippedItems.values()) {
      if (id === itemId) return true;
    }
    return false;
  };

  // Get equipped slot for item
  const getEquippedSlot = (itemId) => {
    if (!equippedItems) return null;
    for (const [slot, id] of equippedItems.entries()) {
      if (id === itemId) return slot;
    }
    return null;
  };

  // Handle adding item from template
  const handleAddFromTemplate = (template) => {
    const item = Item.fromJSON({
      ...template,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    onAddItem(item);
    setSelectedTemplate(null);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      weapons: <Shield className="w-4 h-4" />,
      armor: <Shield className="w-4 h-4" />,
      consumables: <ShoppingBag className="w-4 h-4" />,
      tools: <Wrench className="w-4 h-4" />,
      accessories: <Sparkles className="w-4 h-4" />,
      quest: <Package className="w-4 h-4" />,
      materials: <Package className="w-4 h-4" />
    };
    return icons[category] || <Package className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Package className="w-5 h-5" />
          Item Management
        </h3>
        <div className="text-sm text-gray-400">
          {items.length} items
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Inventory ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('equipped')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'equipped'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Equipped ({equippedItems?.size || 0})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'add'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Add Items
        </button>
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items in inventory</p>
              <p className="text-sm mt-1">Add items from the "Add Items" tab</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 bg-white/5 border rounded-lg ${getRarityColor(item.rarity)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                        {isEquipped(item.id) && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                            Equipped ({getEquippedSlot(item.id)})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                      
                      {/* Item stats */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {item.category && (
                          <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                            {item.category}
                          </span>
                        )}
                        {item.damageDice && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded">
                            Damage: {item.damageDice}
                          </span>
                        )}
                        {item.armorClass && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                            AC: +{item.armorClass}
                          </span>
                        )}
                        {item.weight && (
                          <span className="px-2 py-1 bg-white/10 text-gray-300 rounded">
                            {item.weight} lb
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      {item.equipmentSlots && item.equipmentSlots.length > 0 && !isEquipped(item.id) && (
                        <select
                          onChange={(e) => onEquipItem(item.id, e.target.value)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                          defaultValue=""
                        >
                          <option value="" disabled>Equip</option>
                          {item.equipmentSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      )}
                      {isEquipped(item.id) && (
                        <button
                          onClick={() => onUnequipItem(getEquippedSlot(item.id))}
                          className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded"
                        >
                          Unequip
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Equipped Tab */}
      {activeTab === 'equipped' && (
        <div className="space-y-3">
          {(!equippedItems || equippedItems.size === 0) ? (
            <div className="text-center py-8 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items equipped</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from(equippedItems.entries()).map(([slot, itemId]) => {
                const item = items.find(i => i.id === itemId);
                if (!item) return null;

                return (
                  <div
                    key={slot}
                    className={`p-3 bg-white/5 border rounded-lg ${getRarityColor(item.rarity)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded font-medium">
                            {slot}
                          </span>
                          <h4 className="font-medium text-white">{item.name}</h4>
                        </div>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                      <button
                        onClick={() => onUnequipItem(slot)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded"
                      >
                        Unequip
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Items Tab */}
      {activeTab === 'add' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="all" className="bg-gray-800">All Categories</option>
              {Object.entries(ITEM_TEMPLATE_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key} className="bg-gray-800">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => {
              const canUse = canUseItem(template);
              
              return (
                <div
                  key={template.templateKey}
                  className={`p-3 border rounded-lg transition-colors ${
                    canUse 
                      ? `bg-white/5 ${getRarityColor(template.rarity)} hover:bg-white/10` 
                      : 'bg-white/5 border-red-500/30 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(template.templateCategory)}
                        <h4 className="font-medium text-white">{template.name}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded ${getRarityColor(template.rarity)}`}>
                          {template.rarity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                      
                      {/* Template info */}
                      <div className="flex flex-wrap gap-1 text-xs">
                        {template.damageDice && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded">
                            {template.damageDice} {template.damageType}
                          </span>
                        )}
                        {template.armorClass && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                            AC +{template.armorClass}
                          </span>
                        )}
                        {template.value && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                            {template.value} gp
                          </span>
                        )}
                      </div>

                      {/* Requirements */}
                      {template.requirements && !canUse && (
                        <div className="mt-2 text-xs text-red-400">
                          Requirements not met
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddFromTemplate(template)}
                      disabled={!canUse}
                      className={`px-3 py-1 text-white text-sm rounded flex items-center gap-1 ${
                        canUse 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemAssignmentPanel;
