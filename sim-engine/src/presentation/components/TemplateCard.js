import React from 'react';
import { User, MapPin, MessageSquare, Globe, Package, Trash2, Edit, Copy, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const TemplateCard = ({ 
  template, 
  type, 
  onClick, 
  onEdit, 
  onDelete, 
  onDuplicate,
  showActions = true,
  showUsageStats = true,
  showValidationStatus = true,
  isSelected = false,
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

  const getValidationStatus = (template) => {
    // Check for validation errors in metadata
    const errors = template.metadata?.validationErrors || [];
    const warnings = template.metadata?.validationWarnings || [];
    
    if (errors.length > 0) {
      return { status: 'error', count: errors.length, icon: AlertTriangle, color: 'text-red-500' };
    }
    if (warnings.length > 0) {
      return { status: 'warning', count: warnings.length, icon: AlertTriangle, color: 'text-yellow-500' };
    }
    return { status: 'valid', count: 0, icon: CheckCircle, color: 'text-green-500' };
  };

  const formatUsageStats = (metadata) => {
    const usageCount = metadata?.usageCount || 0;
    const lastUsed = metadata?.lastUsed;
    
    return {
      usageCount,
      lastUsed: lastUsed ? new Date(lastUsed) : null,
      isPopular: usageCount >= 10,
      isRecent: lastUsed && (Date.now() - new Date(lastUsed).getTime()) < (7 * 24 * 60 * 60 * 1000) // Used in last 7 days
    };
  };

  const formatRelativeTime = (date) => {
    if (!date) return 'Never used';
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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

  const validationStatus = getValidationStatus(template);
  const usageStats = formatUsageStats(template.metadata);

  return (
    <div 
      className={`
        relative bg-white rounded-lg border-2 transition-all duration-200 
        cursor-pointer group ${className}
        ${isSelected 
          ? 'border-blue-500 shadow-md ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        }
        ${validationStatus.status === 'error' ? 'border-red-200 bg-red-50' : ''}
        ${validationStatus.status === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
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
        
        <div className="flex items-center space-x-2">
          {template.metadata?.difficulty && (
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${getDifficultyColor(template.metadata.difficulty)}
            `}>
              {template.metadata.difficulty}
            </span>
          )}
          
          {showValidationStatus && (
            <div className={`flex items-center ${validationStatus.color}`} title={
              validationStatus.status === 'error' ? `${validationStatus.count} validation errors` :
              validationStatus.status === 'warning' ? `${validationStatus.count} validation warnings` :
              'Template is valid'
            }>
              <validationStatus.icon className="w-4 h-4" />
            </div>
          )}
        </div>
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

        {/* Usage Statistics */}
        {showUsageStats && (
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{usageStats.usageCount} uses</span>
                {usageStats.isPopular && (
                  <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">Popular</span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(usageStats.lastUsed)}</span>
                {usageStats.isRecent && (
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-400 mb-2">
          {template.metadata?.category && (
            <span className="capitalize">{template.metadata.category}</span>
          )}
          {template.metadata?.author && (
            <span className="ml-2">by {template.metadata.author}</span>
          )}
          {template.metadata?.version && (
            <span className="ml-2">v{template.metadata.version}</span>
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