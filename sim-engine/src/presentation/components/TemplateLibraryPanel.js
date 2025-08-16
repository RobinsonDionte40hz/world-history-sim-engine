import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Download, Upload, RefreshCw } from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import TemplateCard from './TemplateCard';

const TemplateLibraryPanel = ({ 
  onTemplateSelect, 
  onTemplateEdit, 
  onTemplateCreate,
  selectedType = 'characters',
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
    getTemplatesByTag
  } = useTemplates();

  const [activeTab, setActiveTab] = useState(selectedType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter templates based on search and filters
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

    return currentTemplates;
  }, [templates, activeTab, searchQuery, selectedCategory, selectedTag, searchTemplates]);

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

  const handleTemplateSelect = (template) => {
    try {
      const instance = loadTemplate(activeTab, template.id);
      onTemplateSelect?.(instance, activeTab);
    } catch (err) {
      console.error('Failed to load template:', err);
    }
  };

  const handleTemplateEdit = (template) => {
    onTemplateEdit?.(template, activeTab);
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

  const tabs = [
    { id: 'characters', label: 'Characters', icon: '👤' },
    { id: 'nodes', label: 'Nodes', icon: '📍' },
    { id: 'interactions', label: 'Interactions', icon: '💬' },
    { id: 'worlds', label: 'Worlds', icon: '🌍' },
    { id: 'composite', label: 'Composite', icon: '📦' }
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

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Template Library</h2>
          <div className="flex items-center space-x-2">
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
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <div className="text-sm text-gray-500">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
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
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📦</div>
            <p className="text-sm text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedTag !== 'all'
                ? 'No templates match your filters'
                : `No ${activeTab} templates available`
              }
            </p>
            {!searchQuery && selectedCategory === 'all' && selectedTag === 'all' && (
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Create First Template
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      type={activeTab}
                      onClick={handleTemplateSelect}
                      onEdit={handleTemplateEdit}
                      onDelete={handleTemplateDelete}
                      onDuplicate={handleTemplateDuplicate}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateLibraryPanel;