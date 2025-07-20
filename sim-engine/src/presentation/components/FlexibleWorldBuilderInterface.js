/**
 * FlexibleWorldBuilderInterface - New flexible world builder interface
 * 
 * Replaces the rigid 6-step process with a flexible sidebar-based approach.
 * Users can create nodes, characters, and interactions in any order and
 * save them as templates or add them directly to the world.
 */

import React, { useState, useCallback } from 'react';
import { 
  Map, 
  Users, 
  Zap, 
  Save, 
  Plus, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import NodeEditor from '../components/NodeEditor';
import CharacterEditor from '../components/CharacterEditor';
import InteractionEditor from '../components/InteractionEditor';

const FlexibleWorldBuilderInterface = ({
  worldBuilderState,
  templateManager,
  onBackToLanding,
  onSaveWorld
}) => {
  const [activeToolId, setActiveToolId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [worldName, setWorldName] = useState(worldBuilderState?.worldConfig?.name || '');
  const [worldDescription, setWorldDescription] = useState(worldBuilderState?.worldConfig?.description || '');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  // Available tools in the sidebar
  const tools = [
    {
      id: 'nodes',
      name: 'Node Editor',
      icon: Map,
      description: 'Create abstract locations and contexts'
    },
    {
      id: 'characters',
      name: 'Character Editor',
      icon: Users,
      description: 'Design NPCs with attributes and capabilities'
    },
    {
      id: 'interactions',
      name: 'Interaction Editor',
      icon: Zap,
      description: 'Define actions and capabilities'
    }
  ];

  // Handle saving an item (template or direct addition)
  const handleSaveItem = useCallback((itemType, itemData) => {
    setPendingItem({ type: itemType, data: itemData });
    setShowTemplateSelector(true);
  }, []);

  // Handle template selection decision
  const handleTemplateSaveDecision = useCallback((decision) => {
    if (!pendingItem) return;

    const { type, data } = pendingItem;

    if (decision === 'template') {
      // Save as template
      if (templateManager) {
        templateManager.saveTemplate(type, {
          name: data.name || `${type} Template`,
          description: data.description || '',
          data: data
        });
      }
    } else if (decision === 'world') {
      // Add directly to world
      // This would be handled by the world builder hook
      console.log(`Adding ${type} to world:`, data);
    }

    setPendingItem(null);
    setShowTemplateSelector(false);
  }, [pendingItem, templateManager]);

  // Get current world statistics
  const worldStats = {
    nodes: worldBuilderState?.worldConfig?.nodes?.length || 0,
    characters: worldBuilderState?.worldConfig?.characters?.length || 0,
    interactions: worldBuilderState?.worldConfig?.interactions?.length || 0
  };

  // Render the active tool
  const renderActiveTool = () => {
    const activeTool = tools.find(tool => tool.id === activeToolId);
    if (!activeTool) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div className="text-center p-8">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Select a Tool
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Choose a tool from the sidebar to start building your world. Create nodes, characters, and interactions in any order you prefer.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <activeTool.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {activeTool.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeTool.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveToolId(null)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          {renderToolContent(activeTool)}
        </div>
      </div>
    );
  };

  // Render the content for each tool
  const renderToolContent = (tool) => {
    const handleSave = (data) => handleSaveItem(tool.id.slice(0, -1), data);
    const handleCancel = () => setActiveToolId(null);

    switch (tool.id) {
      case 'nodes':
        return (
          <NodeEditor
            onSave={handleSave}
            onCancel={handleCancel}
            mode="create"
          />
        );
      
      case 'characters':
        return (
          <CharacterEditor
            onSave={handleSave}
            onCancel={handleCancel}
            mode="create"
          />
        );
      
      case 'interactions':
        return (
          <InteractionEditor
            onSave={handleSave}
            onCancel={handleCancel}
            mode="create"
          />
        );
      
      default:
        return <div>Tool not implemented yet</div>;
    }
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  World Builder
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Creative Freedom
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* World Info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="space-y-3">
              <input
                type="text"
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                placeholder="World Name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 text-sm"
              />
              <textarea
                value={worldDescription}
                onChange={(e) => setWorldDescription(e.target.value)}
                placeholder="World Description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none text-sm"
              />
            </div>

            {/* World Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {worldStats.nodes}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Nodes</div>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {worldStats.characters}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Characters</div>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {worldStats.interactions}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Actions</div>
              </div>
            </div>
          </div>
        )}

        {/* Tools */}
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveToolId(activeToolId === tool.id ? null : tool.id)}
                className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                  activeToolId === tool.id
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                title={sidebarCollapsed ? tool.name : ''}
              >
                <tool.icon className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{tool.name}</div>
                    <div className="text-sm opacity-75 truncate">{tool.description}</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 flex-shrink-0">
            <button
              onClick={onSaveWorld}
              disabled={!worldName.trim()}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              Save World
            </button>
            
            <button
              onClick={onBackToLanding}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
            >
              Back to Landing
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {renderActiveTool()}
      </div>

      {/* Save Decision Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save Item
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              How would you like to save this {pendingItem?.type}?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleTemplateSaveDecision('template')}
                className="w-full flex items-center p-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg text-purple-700 dark:text-purple-300 transition-colors"
              >
                <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Save as Template</div>
                  <div className="text-sm opacity-75">Reuse in other worlds</div>
                </div>
              </button>
              
              <button
                onClick={() => handleTemplateSaveDecision('world')}
                className="w-full flex items-center p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-300 transition-colors"
              >
                <Plus className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Add to World</div>
                  <div className="text-sm opacity-75">Use in this world</div>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => {
                setPendingItem(null);
                setShowTemplateSelector(false);
              }}
              className="w-full mt-4 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlexibleWorldBuilderInterface;
