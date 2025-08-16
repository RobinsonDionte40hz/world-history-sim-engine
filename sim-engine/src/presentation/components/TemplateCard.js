import React from 'react';
import { User, MapPin, MessageSquare, Globe, Package, Trash2, Edit, Copy } from 'lucide-react';

const TemplateCard = ({ 
  template, 
  type, 
  onClick, 
  onEdit, 
  onDelete, 
  onDuplicate,
  showActions = true,
  className = '' 
}) => {
  const getTypeIcon = (templateType) => {
    switch (templateType) {
      case 'characters':
        return <User className="w-5 h-5" />;
      case 'nodes':
        return <MapPin className="w-5 h-5" />;
      case 'interactions':
        return <MessageSquare className="w-5 h-5" />;
      case 'worlds':
        return <Globe className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getTypeColor = (templateType) => {
    switch (templateType) {
      case 'characters':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'nodes':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'interactions':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'worlds':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAttributes = (attributes) => {
    if (!attributes) return '';
    const entries = Object.entries(attributes);
    if (entries.length === 0) return '';
    
    return entries
      .slice(0, 3) // Show first 3 attributes
      .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
      .join(', ');
  };

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on action buttons
    if (e.target.closest('.template-actions')) return;
    onClick?.(template);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(template);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(template);
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    onDuplicate?.(template);
  };

  return (
    <div 
      className={`
        relative bg-white rounded-lg border-2 border-gray-200 
        hover:border-blue-300 hover:shadow-md transition-all duration-200 
        cursor-pointer group ${className}
      `}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className={`
        flex items-center justify-between p-3 rounded-t-lg border-b
        ${getTypeColor(type)}
      `}>
        <div className="flex items-center space-x-2">
          {getTypeIcon(type)}
          <span className="font-medium text-sm capitalize">{type.slice(0, -1)}</span>
        </div>
        
        {template.metadata?.difficulty && (
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${getDifficultyColor(template.metadata.difficulty)}
          `}>
            {template.metadata.difficulty}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {template.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Type-specific details */}
        {type === 'characters' && template.attributes && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Attributes:</p>
            <p className="text-xs text-gray-700 font-mono">
              {formatAttributes(template.attributes)}
            </p>
          </div>
        )}

        {type === 'characters' && template.archetype && (
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {template.archetype}
            </span>
          </div>
        )}

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-400 mb-2">
          {template.metadata?.category && (
            <span className="capitalize">{template.metadata.category}</span>
          )}
          {template.metadata?.createdAt && (
            <span className="ml-2">
              Created: {new Date(template.metadata.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="template-actions absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1">
            {onDuplicate && (
              <button
                onClick={handleDuplicate}
                className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 transition-colors"
                title="Duplicate template"
              >
                <Copy className="w-3 h-3 text-gray-600" />
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 transition-colors"
                title="Edit template"
              >
                <Edit className="w-3 h-3 text-gray-600" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-1 bg-white rounded shadow-sm hover:bg-red-50 transition-colors"
                title="Delete template"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default TemplateCard;