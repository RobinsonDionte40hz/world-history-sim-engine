import React, { useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import TemplateCard from './TemplateCard';

const TemplateQuickAccess = ({ 
  type = 'characters', 
  onTemplateSelect, 
  onCreateNew,
  maxItems = 6,
  className = '' 
}) => {
  const { templates, loading, error, loadTemplate } = useTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const currentTemplates = templates[type] || [];
  
  // Filter templates based on search
  const filteredTemplates = searchQuery.trim()
    ? currentTemplates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : currentTemplates;

  // Limit displayed templates unless showing all
  const displayedTemplates = showAll 
    ? filteredTemplates 
    : filteredTemplates.slice(0, maxItems);

  const handleTemplateSelect = (template) => {
    try {
      const instance = loadTemplate(type, template.id);
      onTemplateSelect?.(instance, template);
    } catch (err) {
      console.error('Failed to load template:', err);
    }
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-red-600 text-sm">
          Failed to load templates: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900 capitalize">
              {type.slice(0, -1)} Templates
            </h3>
          </div>
          
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${type}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading templates...</p>
          </div>
        ) : displayedTemplates.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              {searchQuery ? 'No templates match your search' : `No ${type} templates available`}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Create First Template
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {displayedTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  type={type}
                  onClick={handleTemplateSelect}
                  showActions={false}
                  className="hover:shadow-md transition-shadow"
                />
              ))}
            </div>

            {/* Show More/Less */}
            {filteredTemplates.length > maxItems && (
              <div className="text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showAll 
                    ? `Show Less` 
                    : `Show ${filteredTemplates.length - maxItems} More`
                  }
                </button>
              </div>
            )}

            {/* Footer */}
            {displayedTemplates.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateQuickAccess;