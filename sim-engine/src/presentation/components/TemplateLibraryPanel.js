import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, Download, Upload, RefreshCw, 
  CheckSquare, Square, Trash2, Copy, Star, AlertTriangle,
  SortAsc, SortDesc, Grid, List, Eye, Settings
} from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import useTemplateCustomization from '../hooks/useTemplateCustomization';
import TemplateCard from './TemplateCard';
import TemplateCustomizationDialog from './TemplateCustomizationDialog';

const TemplateLibraryPanel = ({ 
  onTemplateSelect, 
  onTemplateEdit, 
  onTemplateCreate,
  onBulkExport,
  onBulkImport,
  selectedType = 'characters',
  showRecommendations = true,
  enableBulkOperations = true,
  worldState = null,
  className = '' 
}) => {
  const {
    templates,
    loading,
    error,
    loadTemplates,
    saveTemplate,
    loadTemplate,
    searchTemplates,
    deleteTemplate,
    getTemplatesByCategory,
    getTemplatesByTag,
    validateTemplate,
    updateUsageStats
  } = useTemplates();

  const {
    isDialogOpen,
    selectedTemplate,
    templateType,
    customizationContext,
    presetCustomizations,
    openCustomizationDialog,
    closeCustomizationDialog,
    handleTemplateConfirm,
    getEnhancedContext
  } = useTemplateCustomization();

  const [activeTab, setActiveTab] = useState(selectedType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [validationFilter, setValidationFilter] = useState('all');
  const [usageFilter, setUsageFilter] = useState('all');

  // Get available categories and tags for current type
  const availableCategories = useMemo(() => {
    const currentTemplates = templates[activeTab] || [];
    const categories = new Set();
    currentTemplates.forEach(template => {
      if (template.metadata?.category) {
        categories.add(template.metadata.category);
      }
    });
    return Array.from(categories).sort();
  }, [templates, activeTab]);

  const availableTags = useMemo(() => {
    const currentTemplates = templates[activeTab] || [];
    const tags = new Set();
    currentTemplates.forEach(template => {
      if (template.tags) {
        template.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [templates, activeTab]);

  // Filter and sort templates based on search and filters
  const filteredTemplates = useMemo(() => {
    let currentTemplates = templates[activeTab] || [];

    // Apply search
    if (searchQuery.trim()) {
      currentTemplates = searchTemplates(activeTab, searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      currentTemplates = currentTemplates.filter(template => 
        template.metadata?.category === selectedCategory
      );
    }

    // Apply tag filter
    if (selectedTag !== 'all') {
      currentTemplates = currentTemplates.filter(template => 
        template.tags?.includes(selectedTag)
      );
    }

    // Apply validation filter
    if (validationFilter !== 'all') {
      currentTemplates = currentTemplates.filter(template => {
        const errors = template.metadata?.validationErrors || [];
        const warnings = template.metadata?.validationWarnings || [];
        
        switch (validationFilter) {
          case 'valid':
            return errors.length === 0 && warnings.length === 0;
          case 'warnings':
            return warnings.length > 0 && errors.length === 0;
          case 'errors':
            return errors.length > 0;
          default:
            return true;
        }
      });
    }

    // Apply usage filter
    if (usageFilter !== 'all') {
      currentTemplates = currentTemplates.filter(template => {
        const usageCount = template.metadata?.usageCount || 0;
        const lastUsed = template.metadata?.lastUsed;
        const isRecent = lastUsed && (Date.now() - new Date(lastUsed).getTime()) < (7 * 24 * 60 * 60 * 1000);
        
        switch (usageFilter) {
          case 'popular':
            return usageCount >= 10;
          case 'recent':
            return isRecent;
          case 'unused':
            return usageCount === 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    currentTemplates.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.metadata?.createdAt || 0);
          bValue = new Date(b.metadata?.createdAt || 0);
          break;
        case 'modified':
          aValue = new Date(a.metadata?.lastModified || 0);
          bValue = new Date(b.metadata?.lastModified || 0);
          break;
        case 'usage':
          aValue = a.metadata?.usageCount || 0;
          bValue = b.metadata?.usageCount || 0;
          break;
        case 'lastUsed':
          aValue = new Date(a.metadata?.lastUsed || 0);
          bValue = new Date(b.metadata?.lastUsed || 0);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return currentTemplates;
  }, [templates, activeTab, searchQuery, selectedCategory, selectedTag, validationFilter, usageFilter, sortBy, sortOrder, searchTemplates]);

  // Group templates by category for better organization
  const groupedTemplates = useMemo(() => {
    const groups = {};
    filteredTemplates.forEach(template => {
      const category = template.metadata?.category || 'uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(template);
    });
    return groups;
  }, [filteredTemplates]);

  const handleTemplateSelect = async (template) => {
    try {
      // Validate template before use
      const validation = validateTemplate(activeTab, template);
      if (!validation.isValid) {
        const useAnyway = window.confirm(
          `This template has validation errors:\n\n${validation.errors.join('\n')}\n\nDo you want to use it anyway?`
        );
        if (!useAnyway) return;
      }

      // Check if template has customization options or text templates
      const hasCustomizations = template.customizationOptions && Object.keys(template.customizationOptions).length > 0;
      const hasTextTemplates = template.textTemplates && Object.keys(template.textTemplates).length > 0;
      
      if (hasCustomizations || hasTextTemplates) {
        // Open customization dialog
        const context = getEnhancedContext(activeTab, worldState || {});
        openCustomizationDialog(template, activeTab, context);
      } else {
        // Use template directly
        const instance = loadTemplate(activeTab, template.id);
        
        // Update usage statistics
        await updateUsageStats(activeTab, template.id);
        
        onTemplateSelect?.(instance, activeTab);
      }
    } catch (err) {
      console.error('Failed to load template:', err);
      alert(`Failed to load template: ${err.message}`);
    }
  };

  const handleTemplateEdit = (template) => {
    // Open customization dialog for editing
    const context = getEnhancedContext(activeTab, worldState || {});
    openCustomizationDialog(template, activeTab, context);
  };

  const handleTemplateDelete = async (template) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await deleteTemplate(activeTab, template.id);
      } catch (err) {
        alert(`Failed to delete template: ${err.message}`);
      }
    }
  };

  const handleTemplateDuplicate = async (template) => {
    try {
      const duplicatedTemplate = {
        ...template,
        id: `${template.id}_copy_${Date.now()}`,
        name: `${template.name} (Copy)`,
        metadata: {
          ...template.metadata,
          createdAt: new Date().toISOString()
        }
      };

      await saveTemplate(activeTab, duplicatedTemplate);
    } catch (err) {
      alert(`Failed to duplicate template: ${err.message}`);
    }
  };

  const handleCreateNew = () => {
    onTemplateCreate?.(activeTab);
  };

  const handleRefresh = () => {
    loadTemplates();
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedTemplates.size === filteredTemplates.length) {
      setSelectedTemplates(new Set());
    } else {
      setSelectedTemplates(new Set(filteredTemplates.map(t => t.id)));
    }
  };

  const handleSelectTemplate = (templateId) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedTemplates.size === 0) return;
    
    const templateNames = Array.from(selectedTemplates)
      .map(id => filteredTemplates.find(t => t.id === id)?.name)
      .filter(Boolean);
    
    if (window.confirm(`Are you sure you want to delete ${selectedTemplates.size} templates?\n\n${templateNames.slice(0, 5).join('\n')}${templateNames.length > 5 ? '\n...' : ''}`)) {
      try {
        for (const templateId of selectedTemplates) {
          await deleteTemplate(activeTab, templateId);
        }
        setSelectedTemplates(new Set());
        setShowBulkActions(false);
      } catch (err) {
        alert(`Failed to delete templates: ${err.message}`);
      }
    }
  };

  const handleBulkDuplicate = async () => {
    if (selectedTemplates.size === 0) return;
    
    try {
      for (const templateId of selectedTemplates) {
        const template = filteredTemplates.find(t => t.id === templateId);
        if (template) {
          const duplicatedTemplate = {
            ...template,
            id: `${template.id}_copy_${Date.now()}`,
            name: `${template.name} (Copy)`,
            metadata: {
              ...template.metadata,
              createdAt: new Date().toISOString()
            }
          };
          await saveTemplate(activeTab, duplicatedTemplate);
        }
      }
      setSelectedTemplates(new Set());
      setShowBulkActions(false);
    } catch (err) {
      alert(`Failed to duplicate templates: ${err.message}`);
    }
  };

  const handleBulkExportAction = () => {
    if (selectedTemplates.size === 0) return;
    
    const templatesToExport = filteredTemplates.filter(t => selectedTemplates.has(t.id));
    onBulkExport?.(templatesToExport, activeTab);
  };

  // Template recommendations based on world state
  const getRecommendations = useMemo(() => {
    if (!showRecommendations || !worldState) return [];
    
    const recommendations = [];
    const currentTemplates = templates[activeTab] || [];
    
    // Recommend popular templates
    const popularTemplates = currentTemplates
      .filter(t => (t.metadata?.usageCount || 0) >= 5)
      .slice(0, 3);
    
    popularTemplates.forEach(template => {
      recommendations.push({
        template,
        reason: 'Popular template',
        score: template.metadata?.usageCount || 0,
        category: 'popular'
      });
    });
    
    // Recommend templates that match world themes (if available)
    if (worldState.theme) {
      const themeTemplates = currentTemplates
        .filter(t => t.tags?.some(tag => 
          tag.toLowerCase().includes(worldState.theme.toLowerCase())
        ))
        .slice(0, 2);
      
      themeTemplates.forEach(template => {
        recommendations.push({
          template,
          reason: `Matches world theme: ${worldState.theme}`,
          score: 10,
          category: 'theme'
        });
      });
    }
    
    return recommendations.slice(0, 5);
  }, [templates, activeTab, worldState, showRecommendations]);

  const tabs = [
    { id: 'characters', label: 'Character Configs', icon: '👤' },
    { id: 'nodes', label: 'Node Properties', icon: '📍' },
    { id: 'interactions', label: 'Interaction Mechanics', icon: '⚙️' },
    { id: 'worlds', label: 'World Structures', icon: '🌍' },
    { id: 'composite', label: 'Composite Sets', icon: '📦' }
  ];

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️ Error Loading Templates</div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleCustomizationConfirm = async (customizedTemplate) => {
    try {
      const finalTemplate = handleTemplateConfirm(customizedTemplate);
      
      // Update usage statistics
      await updateUsageStats(activeTab, selectedTemplate.id);
      
      // Call the original onTemplateSelect with the customized template
      onTemplateSelect?.(finalTemplate, activeTab);
    } catch (err) {
      console.error('Failed to apply template customizations:', err);
      alert(`Failed to apply customizations: ${err.message}`);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Structural Templates</h2>
            {enableBulkOperations && selectedTemplates.size > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{selectedTemplates.size} selected</span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Actions
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Refresh templates"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleCreateNew}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Template Type Guidance */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div className="flex-1">
              <h3 className="text-blue-900 font-medium mb-2">Structural Templates vs Text Templating</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Use This Library For:</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Character attribute configurations</li>
                    <li>• Node environmental properties</li>
                    <li>• Interaction mechanics and effects</li>
                    <li>• Reusable data structures</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">For Dynamic Text, Use:</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• <strong>InteractionEditor</strong> - for dialogue text</li>
                    <li>• <strong>EncounterEditor</strong> - for quest descriptions</li>
                    <li>• Built-in placeholder suggestions</li>
                    <li>• Real-time text preview</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {enableBulkOperations && showBulkActions && selectedTemplates.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                Bulk Actions ({selectedTemplates.size} templates)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDuplicate}
                  className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                >
                  <Copy className="w-3 h-3 inline mr-1" />
                  Duplicate
                </button>
                <button
                  onClick={handleBulkExportAction}
                  className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                >
                  <Download className="w-3 h-3 inline mr-1" />
                  Export
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-sm bg-white border border-red-300 text-red-700 rounded hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Delete
                </button>
                <button
                  onClick={() => setShowBulkActions(false)}
                  className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-3 py-2 rounded text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab.replace('s', '')} configurations...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="name">Name</option>
                  <option value="created">Created</option>
                  <option value="modified">Modified</option>
                  <option value="usage">Usage</option>
                  <option value="lastUsed">Last Used</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-gray-600 hover:text-gray-900"
                  title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
              
              {enableBulkOperations && (
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                  title={selectedTemplates.size === filteredTemplates.length ? 'Deselect all' : 'Select all'}
                >
                  {selectedTemplates.size === filteredTemplates.length ? 
                    <CheckSquare className="w-4 h-4" /> : 
                    <Square className="w-4 h-4" />
                  }
                  <span>Select All</span>
                </button>
              )}
            </div>

            <div className="text-sm text-gray-500">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Tags</option>
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Validation
                </label>
                <select
                  value={validationFilter}
                  onChange={(e) => setValidationFilter(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Templates</option>
                  <option value="valid">Valid Only</option>
                  <option value="warnings">With Warnings</option>
                  <option value="errors">With Errors</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Usage
                </label>
                <select
                  value={usageFilter}
                  onChange={(e) => setUsageFilter(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Usage</option>
                  <option value="popular">Popular (10+ uses)</option>
                  <option value="recent">Recently Used</option>
                  <option value="unused">Never Used</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {showRecommendations && getRecommendations.length > 0 && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-medium text-gray-900">Recommended Templates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {getRecommendations.map(({ template, reason, category }) => (
              <div
                key={template.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{template.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category === 'popular' ? 'bg-green-100 text-green-700' :
                    category === 'theme' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {category}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                <p className="text-xs text-blue-600">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">⚙️</div>
            <p className="text-sm text-gray-600 mb-2">
              {searchQuery || selectedCategory !== 'all' || selectedTag !== 'all'
                ? 'No structural templates match your filters'
                : `No ${activeTab.replace('s', '')} configuration templates available`
              }
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Structural templates define reusable data configurations, not text content.
            </p>
            {!searchQuery && selectedCategory === 'all' && selectedTag === 'all' && (
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Create First Structural Template
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-700 mb-3 capitalize">
                  {category === 'uncategorized' ? 'Other' : category}
                  <span className="ml-2 text-gray-400">({categoryTemplates.length})</span>
                </h3>
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-2"
                }>
                  {categoryTemplates.map(template => (
                    <div key={template.id} className="relative">
                      {enableBulkOperations && (
                        <div className="absolute top-2 left-2 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTemplate(template.id);
                            }}
                            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 transition-colors"
                          >
                            {selectedTemplates.has(template.id) ? 
                              <CheckSquare className="w-4 h-4 text-blue-600" /> : 
                              <Square className="w-4 h-4 text-gray-400" />
                            }
                          </button>
                        </div>
                      )}
                      
                      <TemplateCard
                        template={template}
                        type={activeTab}
                        onClick={handleTemplateSelect}
                        onEdit={handleTemplateEdit}
                        onDelete={handleTemplateDelete}
                        onDuplicate={handleTemplateDuplicate}
                        isSelected={selectedTemplates.has(template.id)}
                        showUsageStats={true}
                        showValidationStatus={true}
                        className={enableBulkOperations ? 'ml-8' : ''}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Template Customization Dialog */}
      <TemplateCustomizationDialog
        template={selectedTemplate}
        type={templateType}
        isOpen={isDialogOpen}
        onClose={closeCustomizationDialog}
        onConfirm={handleCustomizationConfirm}
        presetCustomizations={presetCustomizations}
        context={customizationContext}
      />
    </div>
    </>
  );
};

export default TemplateLibraryPanel;