/**
 * Sidebar Component - Global unified sidebar navigation
 * 
 * A comprehensive sidebar that combines global navigation with context-specific tools.
 * Adapts content based on current page while maintaining consistent navigation.
 * 
 * Enhanced with unified navigation system including EditorNavigation and WorldSelector.
 */

import React, { useState, useEffect } from 'react';
import { Globe, X, Users, MapPin, Zap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import WorldSelector from '../components/WorldSelector';
import { useWorldContext } from '../hooks/useWorldContext';
import { useWorldSave } from '../hooks/useWorldSave';
import editorStateManager from '../../application/services/EditorStateManager';

const Sidebar = ({
  isOpen,
  onClose,
  menuItems = [],
  title = "World History Simulator",
  showTip = true
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('worlds'); // 'worlds' | 'tools'
  
  // World context integration
  const { 
    currentWorld, 
    worldNodes, 
    worldCharacters, 
    worldInteractions,
    isLoading: worldLoading,
    hasWorld,
    refreshWorldContext // Add this
  } = useWorldContext();
  
  const { 
    navigateToEditor, 
    hasUnsavedChanges
  } = useWorldSave();

  // Force refresh when sidebar opens
  useEffect(() => {
    if (isOpen && hasWorld) {
      refreshWorldContext();
    }
  }, [isOpen, hasWorld, refreshWorldContext]);

  // Quick action handlers
  const handleQuickNavigate = async (editorType) => {
    try {
      await navigateToEditor(editorType);
      onClose(); // Close sidebar after navigation
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const handleWorldSelected = async (world) => {
    try {
      console.log('World selected:', world);
      // World loading is handled by useWorldContext automatically
      onClose();
    } catch (error) {
      console.error('World selection failed:', error);
    }
  };

  // Get context-specific menu items based on current page
  const getContextMenuItems = () => {
    const path = location.pathname;

    if (path.includes('/editors/nodes')) {
      return [
        {
          id: 'node-divider',
          type: 'divider',
          label: 'Node Editor Tools'
        },
        {
          id: 'new-node',
          label: '📄 New Node',
          onClick: () => window.location.reload(), // Reset to create new
          hoverColor: 'rgba(34, 197, 94, 0.1)',
          hoverBorder: 'rgba(34, 197, 94, 0.3)'
        },
        {
          id: 'add-feature',
          label: '➕ Add Feature',
          onClick: () => console.log('Add Feature'),
          hoverColor: 'rgba(52, 211, 153, 0.1)',
          hoverBorder: 'rgba(52, 211, 153, 0.3)'
        },
        {
          id: 'node-settings',
          label: '⚙️ Advanced Settings',
          onClick: () => console.log('Node Settings'),
          hoverColor: 'rgba(168, 85, 247, 0.1)',
          hoverBorder: 'rgba(168, 85, 247, 0.3)'
        },
        {
          id: 'quick-save',
          label: '💾 Quick Save',
          onClick: () => {
            // Trigger save via custom event
            window.dispatchEvent(new CustomEvent('quickSave'));
          },
          hoverColor: 'rgba(59, 130, 246, 0.1)',
          hoverBorder: 'rgba(59, 130, 246, 0.3)'
        },
        {
          id: 'node-templates-divider',
          type: 'divider',
          label: 'Node Templates'
        },
        {
          id: 'village-template',
          label: '🏘️ Village Template',
          onClick: () => console.log('Village Template'),
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'city-template',
          label: '🏙️ City Template',
          onClick: () => console.log('City Template'),
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'wilderness-template',
          label: '🌲 Wilderness Template',
          onClick: () => console.log('Wilderness Template'),
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'dungeon-template',
          label: '🏰 Dungeon Template',
          onClick: () => console.log('Dungeon Template'),
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        }
      ];
    }

    if (path.includes('/editors/characters')) {
      return [
        {
          id: 'character-divider',
          type: 'divider',
          label: 'Character Editor Tools'
        },
        {
          id: 'new-character',
          label: '👤 New Character',
          onClick: () => window.location.reload(), // Reset to create new
          hoverColor: 'rgba(34, 197, 94, 0.1)',
          hoverBorder: 'rgba(34, 197, 94, 0.3)'
        },
        {
          id: 'roll-attributes',
          label: '🎲 Roll Attributes',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('rollAttributes'));
          },
          hoverColor: 'rgba(239, 68, 68, 0.1)',
          hoverBorder: 'rgba(239, 68, 68, 0.3)'
        },
        {
          id: 'add-trait',
          label: '➕ Add Trait',
          onClick: () => console.log('Add Trait'),
          hoverColor: 'rgba(52, 211, 153, 0.1)',
          hoverBorder: 'rgba(52, 211, 153, 0.3)'
        },
        {
          id: 'character-settings',
          label: '⚙️ Advanced Settings',
          onClick: () => console.log('Character Settings'),
          hoverColor: 'rgba(168, 85, 247, 0.1)',
          hoverBorder: 'rgba(168, 85, 247, 0.3)'
        },
        {
          id: 'quick-save-char',
          label: '💾 Quick Save',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('quickSave'));
          },
          hoverColor: 'rgba(59, 130, 246, 0.1)',
          hoverBorder: 'rgba(59, 130, 246, 0.3)'
        },
        {
          id: 'character-templates-divider',
          type: 'divider',
          label: 'Character Templates'
        },
        {
          id: 'warrior-template',
          label: '⚔️ Warrior Template',
          onClick: () => console.log('Warrior Template'),
          hoverColor: 'rgba(239, 68, 68, 0.1)',
          hoverBorder: 'rgba(239, 68, 68, 0.3)'
        },
        {
          id: 'merchant-template',
          label: '💰 Merchant Template',
          onClick: () => console.log('Merchant Template'),
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'scholar-template',
          label: '📚 Scholar Template',
          onClick: () => console.log('Scholar Template'),
          hoverColor: 'rgba(129, 140, 248, 0.1)',
          hoverBorder: 'rgba(129, 140, 248, 0.3)'
        },
        {
          id: 'noble-template',
          label: '👑 Noble Template',
          onClick: () => console.log('Noble Template'),
          hoverColor: 'rgba(168, 85, 247, 0.1)',
          hoverBorder: 'rgba(168, 85, 247, 0.3)'
        },
        {
          id: 'attributes-divider',
          type: 'divider',
          label: 'D&D Attributes Guide'
        },
        {
          id: 'attributes-info',
          type: 'info',
          content: [
            { label: 'Strength (STR)', desc: 'Physical power' },
            { label: 'Dexterity (DEX)', desc: 'Agility & reflexes' },
            { label: 'Constitution (CON)', desc: 'Health & stamina' },
            { label: 'Intelligence (INT)', desc: 'Reasoning ability' },
            { label: 'Wisdom (WIS)', desc: 'Awareness & insight' },
            { label: 'Charisma (CHA)', desc: 'Force of personality' }
          ]
        }
      ];
    }

    if (path.includes('/editors/interactions')) {
      return [
        {
          id: 'interaction-divider',
          type: 'divider',
          label: 'Interaction Editor Tools'
        },
        {
          id: 'new-interaction',
          label: '💬 New Interaction',
          onClick: () => window.location.reload(), // Reset to create new
          hoverColor: 'rgba(34, 197, 94, 0.1)',
          hoverBorder: 'rgba(34, 197, 94, 0.3)'
        },
        {
          id: 'add-branch',
          label: '🌿 Add Branch',
          onClick: () => console.log('Add Branch'),
          hoverColor: 'rgba(52, 211, 153, 0.1)',
          hoverBorder: 'rgba(52, 211, 153, 0.3)'
        },
        {
          id: 'add-effect',
          label: '➕ Add Effect',
          onClick: () => console.log('Add Effect'),
          hoverColor: 'rgba(168, 85, 247, 0.1)',
          hoverBorder: 'rgba(168, 85, 247, 0.3)'
        },
        {
          id: 'prerequisites',
          label: '⚙️ Prerequisites',
          onClick: () => console.log('Prerequisites'),
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'test-interaction',
          label: '▶️ Test Interaction',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('testInteraction'));
          },
          hoverColor: 'rgba(34, 197, 94, 0.1)',
          hoverBorder: 'rgba(34, 197, 94, 0.3)'
        },
        {
          id: 'quick-save-int',
          label: '💾 Quick Save',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('quickSave'));
          },
          hoverColor: 'rgba(59, 130, 246, 0.1)',
          hoverBorder: 'rgba(59, 130, 246, 0.3)'
        },
        {
          id: 'interaction-templates-divider',
          type: 'divider',
          label: 'Interaction Templates'
        },
        {
          id: 'dialogue-template',
          label: '💬 Dialogue Template',
          onClick: () => console.log('Dialogue Template'),
          hoverColor: 'rgba(129, 140, 248, 0.1)',
          hoverBorder: 'rgba(129, 140, 248, 0.3)'
        },
        {
          id: 'trade-template',
          label: '💰 Trade Template',
          onClick: () => console.log('Trade Template'),
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'combat-template',
          label: '⚔️ Combat Template',
          onClick: () => console.log('Combat Template'),
          hoverColor: 'rgba(239, 68, 68, 0.1)',
          hoverBorder: 'rgba(239, 68, 68, 0.3)'
        },
        {
          id: 'quest-template',
          label: '🎯 Quest Template',
          onClick: () => console.log('Quest Template'),
          hoverColor: 'rgba(168, 85, 247, 0.1)',
          hoverBorder: 'rgba(168, 85, 247, 0.3)'
        },
        {
          id: 'effect-types-divider',
          type: 'divider',
          label: 'Effect Types Guide'
        },
        {
          id: 'effect-types-info',
          type: 'info',
          content: [
            { label: 'Attribute', desc: 'Modify stats' },
            { label: 'Relationship', desc: 'Change relations' },
            { label: 'Resource', desc: 'Add/remove items' },
            { label: 'Quest', desc: 'Progress quests' },
            { label: 'World', desc: 'Global changes' }
          ]
        }
      ];
    }

    if (path.includes('/builder') || path.includes('/editors/world') || path.includes('/world-foundation') || path.includes('/world-editor')) {
      return [
        {
          id: 'world-divider',
          type: 'divider',
          label: 'World Foundation Tools'
        },
        {
          id: 'new-world',
          label: '🌍 New World',
          onClick: () => {
            if (window.confirm('This will clear the current world data. Continue?')) {
              window.location.reload();
            }
          },
          hoverColor: 'rgba(34, 197, 94, 0.1)',
          hoverBorder: 'rgba(34, 197, 94, 0.3)'
        },
        {
          id: 'validate-world',
          label: '✅ Validate World',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('validateWorld'));
          },
          hoverColor: 'rgba(59, 130, 246, 0.1)',
          hoverBorder: 'rgba(59, 130, 246, 0.3)'
        },
        {
          id: 'preview-world',
          label: '👁️ Preview World',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('togglePreviewMode'));
          },
          hoverColor: 'rgba(168, 85, 247, 0.1)',
          hoverBorder: 'rgba(168, 85, 247, 0.3)'
        },
        {
          id: 'quick-save-world',
          label: '💾 Quick Save',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('quickSave'));
          },
          hoverColor: 'rgba(59, 130, 246, 0.1)',
          hoverBorder: 'rgba(59, 130, 246, 0.3)'
        },
        {
          id: 'world-templates-divider',
          type: 'divider',
          label: 'World Templates'
        },
        {
          id: 'fantasy-template',
          label: '🏰 Fantasy World',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('loadTemplate', { detail: { type: 'fantasy' } }));
          },
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'scifi-template',
          label: '🚀 Sci-Fi World',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('loadTemplate', { detail: { type: 'scifi' } }));
          },
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'historical-template',
          label: '📜 Historical World',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('loadTemplate', { detail: { type: 'historical' } }));
          },
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'world-guide-divider',
          type: 'divider',
          label: 'World Building Guide'
        },
        {
          id: 'time-progression-info',
          type: 'info',
          content: [
            { label: 'Real-time', desc: '1 sec = 1 sec' },
            { label: 'Fast', desc: '1 sec = 10 min' },
            { label: 'Daily', desc: '1 sec = 1 hour' },
            { label: 'Weekly', desc: '1 sec = 1 day' },
            { label: 'Monthly', desc: '1 sec = 1 month' }
          ]
        }
      ];
    }

    if (path.includes('/editors/encounters')) {
      return [
        {
          id: 'encounter-divider',
          type: 'divider',
          label: 'Encounter Editor Tools'
        },
        {
          id: 'new-encounter',
          label: '⚔️ New Encounter',
          onClick: () => window.location.reload(), // Reset to create new
          hoverColor: 'rgba(34, 197, 94, 0.1)',
          hoverBorder: 'rgba(34, 197, 94, 0.3)'
        },
        {
          id: 'add-outcome',
          label: '🎯 Add Outcome',
          onClick: () => console.log('Add Outcome'),
          hoverColor: 'rgba(52, 211, 153, 0.1)',
          hoverBorder: 'rgba(52, 211, 153, 0.3)'
        },
        {
          id: 'add-trigger',
          label: '⚡ Add Trigger',
          onClick: () => console.log('Add Trigger'),
          hoverColor: 'rgba(168, 85, 247, 0.1)',
          hoverBorder: 'rgba(168, 85, 247, 0.3)'
        },
        {
          id: 'turn-based-config',
          label: '🕐 Turn-Based Config',
          onClick: () => console.log('Turn-Based Config'),
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'test-encounter',
          label: '▶️ Test Encounter',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('testEncounter'));
          },
          hoverColor: 'rgba(34, 197, 94, 0.1)',
          hoverBorder: 'rgba(34, 197, 94, 0.3)'
        },
        {
          id: 'quick-save-enc',
          label: '💾 Quick Save',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('quickSave'));
          },
          hoverColor: 'rgba(59, 130, 246, 0.1)',
          hoverBorder: 'rgba(59, 130, 246, 0.3)'
        },
        {
          id: 'encounter-templates-divider',
          type: 'divider',
          label: 'Encounter Templates'
        },
        {
          id: 'combat-encounter-template',
          label: '⚔️ Combat Encounter',
          onClick: () => console.log('Combat Encounter Template'),
          hoverColor: 'rgba(239, 68, 68, 0.1)',
          hoverBorder: 'rgba(239, 68, 68, 0.3)'
        },
        {
          id: 'social-encounter-template',
          label: '💬 Social Encounter',
          onClick: () => console.log('Social Encounter Template'),
          hoverColor: 'rgba(129, 140, 248, 0.1)',
          hoverBorder: 'rgba(129, 140, 248, 0.3)'
        },
        {
          id: 'exploration-encounter-template',
          label: '🗺️ Exploration Encounter',
          onClick: () => console.log('Exploration Encounter Template'),
          hoverColor: 'rgba(52, 211, 153, 0.1)',
          hoverBorder: 'rgba(52, 211, 153, 0.3)'
        },
        {
          id: 'puzzle-encounter-template',
          label: '🧩 Puzzle Encounter',
          onClick: () => console.log('Puzzle Encounter Template'),
          hoverColor: 'rgba(168, 85, 247, 0.1)',
          hoverBorder: 'rgba(168, 85, 247, 0.3)'
        },
        {
          id: 'environmental-encounter-template',
          label: '🌪️ Environmental Encounter',
          onClick: () => console.log('Environmental Encounter Template'),
          hoverColor: 'rgba(251, 191, 36, 0.1)',
          hoverBorder: 'rgba(251, 191, 36, 0.3)'
        },
        {
          id: 'encounter-types-divider',
          type: 'divider',
          label: 'Encounter Types Guide'
        },
        {
          id: 'encounter-types-info',
          type: 'info',
          content: [
            { label: 'Combat', desc: 'Physical confrontations' },
            { label: 'Social', desc: 'Diplomatic interactions' },
            { label: 'Exploration', desc: 'Discovery & investigation' },
            { label: 'Puzzle', desc: 'Mental challenges' },
            { label: 'Environmental', desc: 'Natural hazards' }
          ]
        },
        {
          id: 'turn-based-divider',
          type: 'divider',
          label: 'Turn-Based Integration'
        },
        {
          id: 'turn-based-info',
          type: 'info',
          content: [
            { label: 'Duration', desc: 'Number of turns' },
            { label: 'Initiative', desc: 'Turn order system' },
            { label: 'Timing', desc: 'When effects occur' },
            { label: 'Sequencing', desc: 'Action resolution' }
          ]
        }
      ];
    }

    return [];
  };

  // Check if a menu item is currently active
  const isActiveItem = (itemPath) => {
    if (!itemPath) return false;

    // Handle exact matches and path prefixes
    if (itemPath === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(itemPath);
  };

  const defaultMenuItems = [
    {
      id: 'divider-builders',
      type: 'divider',
      label: '🌟 Create & Build'
    },
    {
      id: 'world-builder',
      label: '🌍 World Foundation',
      path: '/builder',
      onClick: () => navigate('/builder'),
      description: 'Start with world basics',
      hoverColor: 'rgba(59, 130, 246, 0.15)',
      hoverBorder: 'rgba(59, 130, 246, 0.4)'
    },
    {
      id: 'node-editor',
      label: '📍 Node Editor',
      path: '/editors/nodes',
      onClick: () => navigate('/editors/nodes'),
      description: 'Create locations & places',
      hoverColor: 'rgba(34, 197, 94, 0.15)',
      hoverBorder: 'rgba(34, 197, 94, 0.4)'
    },
    {
      id: 'character-editor',
      label: '👤 Character Editor',
      path: '/editors/characters',
      onClick: () => navigate('/editors/characters'),
      description: 'Design people & NPCs',
      hoverColor: 'rgba(168, 85, 247, 0.15)',
      hoverBorder: 'rgba(168, 85, 247, 0.4)',
      subItems: [
        {
          id: 'character-manager',
          label: '👥 Character Manager',
          path: '/editors/character-manager',
          onClick: () => navigate('/editors/character-manager'),
          description: 'Manage all characters',
          hoverColor: 'rgba(147, 51, 234, 0.15)',
          hoverBorder: 'rgba(147, 51, 234, 0.4)'
        }
      ]
    },
    {
      id: 'interaction-editor',
      label: '💬 Interaction Editor',
      path: '/editors/interactions',
      onClick: () => navigate('/editors/interactions'),
      description: 'Build conversations',
      hoverColor: 'rgba(251, 191, 36, 0.15)',
      hoverBorder: 'rgba(251, 191, 36, 0.4)'
    },
    {
      id: 'encounter-editor',
      label: '⚔️ Encounter Editor',
      path: '/editors/encounters',
      onClick: () => navigate('/editors/encounters'),
      description: 'Design events & battles',
      hoverColor: 'rgba(239, 68, 68, 0.15)',
      hoverBorder: 'rgba(239, 68, 68, 0.4)'
    },
    {
      id: 'divider-simulation',
      type: 'divider',
      label: '⚡ Simulation'
    },
    {
      id: 'simulation',
      label: '🚀 Run Simulation',
      path: '/simulation',
      onClick: () => navigate('/simulation'),
      description: 'Watch history unfold',
      hoverColor: 'rgba(34, 197, 94, 0.15)',
      hoverBorder: 'rgba(34, 197, 94, 0.4)',
      disabled: true,
      tooltip: 'Complete world foundation to unlock simulation'
    },
    {
      id: 'divider-resources',
      type: 'divider',
      label: '📚 Learn & Explore'
    },
    {
      id: 'features',
      label: '✨ Features',
      path: '/features',
      onClick: () => navigate('/features'),
      description: 'Discover capabilities',
      hoverColor: 'rgba(129, 140, 248, 0.15)',
      hoverBorder: 'rgba(129, 140, 248, 0.4)'
    },
    {
      id: 'docs',
      label: '� Documentation',
      path: '/docs',
      onClick: () => navigate('/docs'),
      description: 'Guides & tutorials',
      hoverColor: 'rgba(251, 191, 36, 0.15)',
      hoverBorder: 'rgba(251, 191, 36, 0.4)'
    },
    {
      id: 'examples',
      label: '🎯 Examples',
      path: '/examples',
      onClick: () => navigate('/examples'),
      description: 'Sample worlds & ideas',
      hoverColor: 'rgba(168, 85, 247, 0.15)',
      hoverBorder: 'rgba(168, 85, 247, 0.4)'
    }
  ];

  // Combine default menu items with context-specific items
  const contextItems = getContextMenuItems();
  const allItems = menuItems.length > 0 ? menuItems : [...defaultMenuItems, ...contextItems];

  return (
    <>
      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '380px',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          borderLeft: 'none',
          borderRight: '3px solid rgba(129, 140, 248, 0.6)',
          zIndex: 2000,
          padding: '1.5rem',
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          boxShadow: '8px 0 32px rgba(0, 0, 0, 0.4)',
          overflowY: 'auto',
          overflowX: 'hidden',
          transform: 'none',
          transition: 'none'
        }}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center justify-between mb-8"
          style={{
            borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
            paddingBottom: '1rem'
          }}
        >
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6" style={{ color: '#818cf8' }} />
            <span
              className="text-lg font-bold"
              style={{
                background: 'linear-gradient(to right, #818cf8, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'white' // Fallback for browsers that don't support gradient text
              }}
            >
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="transition-colors p-2 hover:bg-gray-700 rounded-lg"
            style={{
              color: '#cbd5e1',
              borderRadius: '0.5rem',
              border: '1px solid transparent'
            }}
            onMouseOver={(e) => {
              e.target.style.color = 'white';
              e.target.style.background = 'rgba(71, 85, 105, 0.5)';
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.7)';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#cbd5e1';
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-slate-700/30 p-1 rounded-lg">
          {[
            { id: 'tools', label: 'Tools', icon: '🔧' },
            { id: 'worlds', label: 'Worlds', icon: '🌍' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-600/30'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'worlds' && (
            <div className="space-y-4">
              {/* Current World Info */}
              {worldLoading ? (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span className="ml-2 text-sm text-slate-400">Loading world...</span>
                  </div>
                </div>
              ) : currentWorld ? (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium text-sm">{currentWorld.name}</h3>
                    <div className="flex items-center space-x-2">
                      {/* Refresh Button for Testing */}
                      {currentWorld && (
                        <button
                          onClick={() => {
                            refreshWorldContext();
                            console.log('Manually refreshed world context');
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          title="Refresh world data"
                        >
                          🔄 Refresh
                        </button>
                      )}
                      {hasUnsavedChanges && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                          Unsaved
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                    {currentWorld.description}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-blue-400 text-xs font-medium">
                        {worldNodes.length}
                      </div>
                      <div className="text-slate-500 text-xs">Nodes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 text-xs font-medium">
                        {worldCharacters.length}
                      </div>
                      <div className="text-slate-500 text-xs">Characters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 text-xs font-medium">
                        {worldInteractions.length}
                      </div>
                      <div className="text-slate-500 text-xs">Interactions</div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickNavigate('nodes')}
                      disabled={worldLoading}
                      className="flex items-center justify-center px-2 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded border border-blue-600/30 transition-colors disabled:opacity-50"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Nodes
                    </button>
                    <button
                      onClick={() => handleQuickNavigate('characters')}
                      disabled={worldLoading}
                      className="flex items-center justify-center px-2 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs rounded border border-green-600/30 transition-colors disabled:opacity-50"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Characters
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleQuickNavigate('interactions')}
                    disabled={worldLoading}
                    className="w-full mt-2 flex items-center justify-center px-2 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs rounded border border-purple-600/30 transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Interactions
                  </button>
                </div>
              ) : null}
              
              {/* Debug Storage Button - Always Visible */}
              <button
                onClick={(e) => {
                  console.log('🚨 DEBUG BUTTON CLICKED!'); // Immediate test
                  e.preventDefault();
                  e.stopPropagation();
                  
                  try {
                    // Use the comprehensive naming debug utility
                    if (window.debugNamingIssue) {
                      console.log('Using window.debugNamingIssue');
                      window.debugNamingIssue();
                    } else {
                      // Fallback debug
                      console.log('🔍 DEBUGGING WORLD PERSISTENCE (Fallback):');
                      
                      const worlds = localStorage.getItem('worldHistorySimulator_worlds');
                      const worldsList = worlds ? JSON.parse(worlds) : [];
                      console.log('Worlds list:', worldsList);
                      
                      const allKeys = Object.keys(localStorage);
                      const worldKeys = allKeys.filter(key => key.startsWith('worldHistorySimulator_'));
                      console.log('All world keys:', worldKeys);
                      
                      const editorState = editorStateManager.getState();
                      console.log('Editor state:', editorState);
                    }
                    
                    // Also refresh context
                    console.log('Calling refreshWorldContext...');
                    refreshWorldContext();
                    console.log('Debug button execution completed');
                  } catch (error) {
                    console.error('Error in debug button:', error);
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '4px',
                  color: '#f87171',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  console.log('Debug button hovered');
                  e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
                }}
              >
                🔍 Debug Naming Issue
              </button>
              
              {/* Simple Test Button */}
              <button
                onClick={() => {
                  alert('Test button works!');
                  console.log('Simple test button clicked');
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '4px',
                  color: '#4ade80',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                ✅ Test Button
              </button>
              
              {/* Manual Refresh Button */}
              {hasWorld && !worldLoading && (
                <button
                  onClick={() => refreshWorldContext()}
                  className="w-full flex items-center justify-center px-3 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 text-sm rounded-lg border border-slate-600/50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh World Data
                </button>
              )}
              
              {/* World Selector */}
              <WorldSelector 
                className="mb-4"
                onWorldSelected={handleWorldSelected}
                onCreateNew={() => {
                  navigate('/builder');
                  onClose();
                }}
                disabled={worldLoading}
              />
            </div>
          )}
          
          {activeTab === 'tools' && (
            <div className="space-y-2">
              {/* World Context Quick Actions */}
              {hasWorld && (
                <>
                  <div className="py-2">
                    <div
                      style={{
                        height: '1px',
                        background: 'rgba(71, 85, 105, 0.5)',
                        margin: '0.5rem 0'
                      }}
                    />
                    <p
                      style={{
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Quick Actions
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleQuickNavigate('nodes')}
                    disabled={worldLoading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: worldLoading ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: worldLoading ? '#94a3b8' : '#e2e8f0',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                      cursor: worldLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: worldLoading ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!worldLoading) {
                        e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!worldLoading) {
                        e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                      }
                    }}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Add Node ({worldNodes.length})
                  </button>
                  
                  <button
                    onClick={() => handleQuickNavigate('characters')}
                    disabled={worldLoading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: worldLoading ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: worldLoading ? '#94a3b8' : '#e2e8f0',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                      cursor: worldLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: worldLoading ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!worldLoading) {
                        e.target.style.background = 'rgba(34, 197, 94, 0.2)';
                        e.target.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!worldLoading) {
                        e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                        e.target.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                      }
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Character ({worldCharacters.length})
                  </button>
                  
                  <button
                    onClick={() => handleQuickNavigate('interactions')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(168, 85, 247, 0.2)';
                      e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(168, 85, 247, 0.1)';
                      e.target.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Add Interaction ({worldInteractions.length})
                  </button>
                  
                  {/* Refresh Button for Testing */}
                  <button
                    onClick={() => {
                      refreshWorldContext();
                      console.log('Manually refreshed world context from tools tab');
                    }}
                    disabled={worldLoading}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      background: worldLoading ? 'rgba(71, 85, 105, 0.05)' : 'rgba(71, 85, 105, 0.1)',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      color: worldLoading ? '#94a3b8' : '#cbd5e1',
                      fontSize: '0.75rem',
                      textAlign: 'center',
                      cursor: worldLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: worldLoading ? 0.5 : 1,
                      marginTop: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!worldLoading) {
                        e.target.style.background = 'rgba(71, 85, 105, 0.2)';
                        e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                        e.target.style.color = '#e2e8f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!worldLoading) {
                        e.target.style.background = 'rgba(71, 85, 105, 0.1)';
                        e.target.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                        e.target.style.color = '#cbd5e1';
                      }
                    }}
                    title="Refresh world context data"
                  >
                    🔄 Refresh Context
                  </button>
                </>
              )}
              
              {allItems.map((item) => {
                if (item.type === 'divider') {
                  return (
                    <div key={item.id} className="py-2">
                      <div
                        style={{
                          height: '1px',
                          background: 'rgba(71, 85, 105, 0.5)',
                          margin: '0.5rem 0'
                        }}
                      />
                      <p
                        style={{
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.5rem'
                        }}
                      >
                        {item.label}
                      </p>
                    </div>
                  );
                }

                if (item.type === 'info') {
                  return (
                    <div key={item.id} className="py-2">
                      <div
                        style={{
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          background: 'rgba(71, 85, 105, 0.2)',
                          border: '1px solid rgba(71, 85, 105, 0.3)'
                        }}
                      >
                        {item.content.map((info, index) => (
                          <div key={index} className="flex justify-between mb-1 text-xs">
                            <span style={{ color: '#e2e8f0' }}>{info.label}</span>
                            <span style={{ color: '#94a3b8' }}>{info.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                const isActive = isActiveItem(item.path);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubItemActive = hasSubItems && item.subItems.some(subItem => isActiveItem(subItem.path));
                const shouldShowExpanded = isActive || isSubItemActive;

                return (
                  <div key={item.id}>
                    <button
                      onClick={item.disabled ? undefined : item.onClick}
                      disabled={item.disabled}
                      title={item.disabled ? item.tooltip : undefined}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 font-medium group ${
                        item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-[1.02]'
                      }`}
                      style={{
                        color: item.disabled ? '#94a3b8' : (isActive ? 'white' : '#e2e8f0'),
                        border: (isActive || isSubItemActive) && !item.disabled 
                          ? `2px solid ${item.hoverBorder || 'rgba(129, 140, 248, 0.6)'}` 
                          : '2px solid transparent',
                        fontSize: '0.95rem',
                        background: item.disabled 
                          ? 'rgba(71, 85, 105, 0.05)' 
                          : ((isActive || isSubItemActive)
                            ? `linear-gradient(135deg, ${item.hoverColor || 'rgba(129, 140, 248, 0.2)'}, rgba(15, 23, 42, 0.8))`
                            : 'linear-gradient(135deg, rgba(71, 85, 105, 0.15), rgba(30, 41, 59, 0.1))'),
                        transform: (isActive || isSubItemActive) && !item.disabled ? 'translateX(12px)' : 'translateX(0)',
                        boxShadow: (isActive || isSubItemActive) && !item.disabled 
                          ? `0 8px 25px -5px ${item.hoverColor || 'rgba(129, 140, 248, 0.4)'}, 0 0 0 1px rgba(255, 255, 255, 0.05)` 
                          : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(12px)'
                      }}
                      onMouseOver={(e) => {
                        if (!isActive && !isSubItemActive && !item.disabled) {
                          e.target.style.background = `linear-gradient(135deg, ${item.hoverColor || 'rgba(129, 140, 248, 0.2)'}, rgba(15, 23, 42, 0.8))`;
                          e.target.style.borderColor = item.hoverBorder || 'rgba(129, 140, 248, 0.6)';
                          e.target.style.transform = 'translateX(12px) scale(1.02)';
                          e.target.style.color = 'white';
                          e.target.style.boxShadow = `0 12px 35px -5px ${item.hoverColor || 'rgba(129, 140, 248, 0.4)'}, 0 0 0 1px rgba(255, 255, 255, 0.1)`;
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive && !isSubItemActive && !item.disabled) {
                          e.target.style.background = 'linear-gradient(135deg, rgba(71, 85, 105, 0.15), rgba(30, 41, 59, 0.1))';
                          e.target.style.borderColor = 'transparent';
                          e.target.style.transform = 'translateX(0) scale(1)';
                          e.target.style.color = '#e2e8f0';
                          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-xs opacity-75 leading-relaxed">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.disabled && (
                          <div className="ml-2 text-gray-500 group-hover:animate-pulse">
                            🔒
                          </div>
                        )}
                        {hasSubItems && (
                          <div className="ml-2 text-sm opacity-60">
                            {shouldShowExpanded ? '▼' : '▶'}
                          </div>
                        )}
                        {(isActive || isSubItemActive) && !item.disabled && (
                          <div className="ml-2 text-sm opacity-80">
                            ✨
                          </div>
                        )}
                      </div>
                    </button>
                    
                    {/* Sub-items */}
                    {hasSubItems && shouldShowExpanded && (
                      <div className="ml-4 mt-2 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = isActiveItem(subItem.path);
                          return (
                            <button
                              key={subItem.id}
                              onClick={subItem.disabled ? undefined : subItem.onClick}
                              disabled={subItem.disabled}
                              className={`w-full text-left p-3 rounded-lg transition-all duration-200 text-sm ${
                                subItem.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-[1.01]'
                              }`}
                              style={{
                                color: subItem.disabled ? '#94a3b8' : (isSubActive ? 'white' : '#cbd5e1'),
                                border: isSubActive && !subItem.disabled 
                                  ? `1px solid ${subItem.hoverBorder || 'rgba(147, 51, 234, 0.6)'}` 
                                  : '1px solid transparent',
                                background: subItem.disabled 
                                  ? 'rgba(71, 85, 105, 0.05)' 
                                  : (isSubActive 
                                    ? `linear-gradient(135deg, ${subItem.hoverColor || 'rgba(147, 51, 234, 0.2)'}, rgba(15, 23, 42, 0.6))`
                                    : 'rgba(71, 85, 105, 0.1)'),
                                transform: isSubActive && !subItem.disabled ? 'translateX(8px)' : 'translateX(0)',
                                boxShadow: isSubActive && !subItem.disabled 
                                  ? `0 4px 15px -3px ${subItem.hoverColor || 'rgba(147, 51, 234, 0.3)'}` 
                                  : '0 1px 3px rgba(0, 0, 0, 0.1)'
                              }}
                              onMouseOver={(e) => {
                                if (!isSubActive && !subItem.disabled) {
                                  e.target.style.background = `linear-gradient(135deg, ${subItem.hoverColor || 'rgba(147, 51, 234, 0.2)'}, rgba(15, 23, 42, 0.6))`;
                                  e.target.style.borderColor = subItem.hoverBorder || 'rgba(147, 51, 234, 0.6)';
                                  e.target.style.transform = 'translateX(8px) scale(1.01)';
                                  e.target.style.color = 'white';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!isSubActive && !subItem.disabled) {
                                  e.target.style.background = 'rgba(71, 85, 105, 0.1)';
                                  e.target.style.borderColor = 'transparent';
                                  e.target.style.transform = 'translateX(0) scale(1)';
                                  e.target.style.color = '#cbd5e1';
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {subItem.label}
                                  </div>
                                  {subItem.description && (
                                    <div className="text-xs opacity-75 mt-1">
                                      {subItem.description}
                                    </div>
                                  )}
                                </div>
                                {isSubActive && !subItem.disabled && (
                                  <div className="ml-2 text-xs opacity-80">
                                    ✨
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
                })}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        {showTip && (
          <div style={{ paddingTop: '2rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                background: 'rgba(71, 85, 105, 0.3)',
                border: '1px solid rgba(71, 85, 105, 0.4)'
              }}
            >
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                {activeTab === 'worlds' && 'World Management'}
                {activeTab === 'tools' && 'Editor Tools'}
              </p>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.4' }}>
                {activeTab === 'worlds' && 'Select existing worlds or create new ones to start building.'}
                {activeTab === 'tools' && 'Context-specific tools and templates for the current editor.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: '1999',
            backdropFilter: 'blur(2px)'
          }}
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;