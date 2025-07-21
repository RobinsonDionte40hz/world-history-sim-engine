/**
 * Sidebar Component - Global unified sidebar navigation
 * 
 * A comprehensive sidebar that combines global navigation with context-specific tools.
 * Adapts content based on current page while maintaining consistent navigation.
 * 
 * Enhanced with unified navigation system including EditorNavigation and WorldSelector.
 */

import React, { useState } from 'react';
import { Globe, X, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import EditorNavigation from '../components/EditorNavigation';
import WorldSelector from '../components/WorldSelector';

const Sidebar = ({
  isOpen,
  onClose,
  menuItems = [],
  title = "World History Simulator",
  showTip = true
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('navigation'); // 'navigation' | 'worlds' | 'tools'

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
      id: 'home',
      label: '🏠 Home',
      path: '/',
      onClick: () => navigate('/'),
      hoverColor: 'rgba(129, 140, 248, 0.1)',
      hoverBorder: 'rgba(129, 140, 248, 0.3)'
    },
    {
      id: 'divider1',
      type: 'divider',
      label: 'Creation Tools'
    },
    {
      id: 'world-builder',
      label: '🌍 World Builder',
      path: '/builder',
      onClick: () => navigate('/builder'),
      hoverColor: 'rgba(52, 211, 153, 0.1)',
      hoverBorder: 'rgba(52, 211, 153, 0.3)'
    },
    {
      id: 'node-editor',
      label: '🏛️ Node Editor',
      path: '/editors/nodes',
      onClick: () => navigate('/editors/nodes'),
      hoverColor: 'rgba(251, 191, 36, 0.1)',
      hoverBorder: 'rgba(251, 191, 36, 0.3)'
    },
    {
      id: 'character-editor',
      label: '👥 Character Editor',
      path: '/editors/characters',
      onClick: () => navigate('/editors/characters'),
      hoverColor: 'rgba(168, 85, 247, 0.1)',
      hoverBorder: 'rgba(168, 85, 247, 0.3)'
    },
    {
      id: 'interaction-editor',
      label: '💬 Interaction Editor',
      path: '/editors/interactions',
      onClick: () => navigate('/editors/interactions'),
      hoverColor: 'rgba(239, 68, 68, 0.1)',
      hoverBorder: 'rgba(239, 68, 68, 0.3)'
    },
    {
      id: 'encounter-editor',
      label: '⚔️ Encounter Editor',
      path: '/editors/encounters',
      onClick: () => navigate('/editors/encounters'),
      hoverColor: 'rgba(220, 38, 127, 0.1)',
      hoverBorder: 'rgba(220, 38, 127, 0.3)'
    },
    {
      id: 'divider2',
      type: 'divider',
      label: 'Simulation'
    },
    {
      id: 'simulation',
      label: '⚡ Run Simulation',
      path: '/simulation',
      onClick: () => navigate('/simulation'),
      hoverColor: 'rgba(34, 197, 94, 0.1)',
      hoverBorder: 'rgba(34, 197, 94, 0.3)'
    },
    {
      id: 'divider3',
      type: 'divider',
      label: 'Resources'
    },
    {
      id: 'features',
      label: '✨ Features',
      path: '/features',
      onClick: () => navigate('/features'),
      hoverColor: 'rgba(129, 140, 248, 0.1)',
      hoverBorder: 'rgba(129, 140, 248, 0.3)'
    },
    {
      id: 'docs',
      label: '📚 Documentation',
      path: '/docs',
      onClick: () => navigate('/docs'),
      hoverColor: 'rgba(251, 191, 36, 0.1)',
      hoverBorder: 'rgba(251, 191, 36, 0.3)'
    },
    {
      id: 'examples',
      label: '🎯 Examples',
      path: '/examples',
      onClick: () => navigate('/examples'),
      hoverColor: 'rgba(168, 85, 247, 0.1)',
      hoverBorder: 'rgba(168, 85, 247, 0.3)'
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
          width: '320px',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          borderLeft: 'none',
          borderRight: '3px solid rgba(129, 140, 248, 0.6)',
          zIndex: '2000',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '8px 0 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
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
            { id: 'navigation', label: 'Navigation', icon: '🧭' },
            { id: 'worlds', label: 'Worlds', icon: '🌍' },
            { id: 'tools', label: 'Tools', icon: '🔧' }
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
          {activeTab === 'navigation' && (
            <EditorNavigation className="mb-4" />
          )}
          
          {activeTab === 'worlds' && (
            <WorldSelector 
              className="mb-4"
              onWorldSelected={(world) => {
                console.log('World selected:', world);
              }}
              onCreateNew={() => {
                navigate('/builder');
                onClose();
              }}
            />
          )}
          
          {activeTab === 'tools' && (
            <div className="space-y-2">
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

                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className="w-full text-left p-3 rounded-lg transition-all duration-200 font-medium"
                    style={{
                      color: isActive ? 'white' : '#e2e8f0',
                      border: isActive ? `1px solid ${item.hoverBorder || 'rgba(129, 140, 248, 0.4)'}` : '1px solid transparent',
                      fontSize: '0.95rem',
                      background: isActive ? (item.hoverColor || 'rgba(129, 140, 248, 0.2)') : 'rgba(71, 85, 105, 0.1)',
                      transform: isActive ? 'translateX(8px)' : 'translateX(0)',
                      boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.target.style.background = item.hoverColor || 'rgba(129, 140, 248, 0.2)';
                        e.target.style.borderColor = item.hoverBorder || 'rgba(129, 140, 248, 0.4)';
                        e.target.style.transform = 'translateX(8px)';
                        e.target.style.color = 'white';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.target.style.background = 'rgba(71, 85, 105, 0.1)';
                        e.target.style.borderColor = 'transparent';
                        e.target.style.transform = 'translateX(0)';
                        e.target.style.color = '#e2e8f0';
                      }
                    }}
                  >
                    {item.label}
                    {isActive && (
                      <span className="ml-2 text-xs opacity-75">●</span>
                    )}
                  </button>
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
                {activeTab === 'navigation' && 'Navigation Help'}
                {activeTab === 'worlds' && 'World Management'}
                {activeTab === 'tools' && 'Editor Tools'}
              </p>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.4' }}>
                {activeTab === 'navigation' && 'Use the navigation panel to move between editors and track your progress.'}
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