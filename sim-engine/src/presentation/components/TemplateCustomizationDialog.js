import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Save, RotateCcw, Eye, EyeOff, Settings, FileText, 
  ChevronDown, ChevronRight, AlertTriangle,
  Shuffle
} from 'lucide-react';
// PlaceholderEditor and TextTemplateEngine removed - text templating now in editors

const TemplateCustomizationDialog = ({
  template,
  isOpen,
  onClose,
  onConfirm,
  presetCustomizations = {},
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('structural');
  const [customizations, setCustomizations] = useState({});
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [showPreview, setShowPreview] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // Context removed - text templating now handled in editors

  // Memoize preset customizations to avoid unnecessary re-renders
  const memoizedPresetCustomizations = useMemo(() => presetCustomizations, [presetCustomizations]);

  // Initialize customizations when template changes
  useEffect(() => {
    if (!template) return;

    const initialCustomizations = {
      name: template.name,
      description: template.description,
      tags: [...(template.tags || [])],
      ...memoizedPresetCustomizations
    };

    // Add customizable fields based on template type
    if (template.customizationOptions) {
      Object.entries(template.customizationOptions).forEach(([key, option]) => {
        if (initialCustomizations[key] === undefined) {
          initialCustomizations[key] = option.default;
        }
      });
    }

    setCustomizations(initialCustomizations);
    setIsDirty(false);
  }, [template, memoizedPresetCustomizations]);

  if (!isOpen || !template) return null;

  const handleCustomizationChange = (key, value) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

  // Text template handling removed - now in editors

  const handleSectionToggle = (sectionId) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset all customizations to default values?')) {
      setCustomizations({
        name: template.name,
        description: template.description,
        tags: [...(template.tags || [])]
      });
      setIsDirty(false);
    }
  };

  const handleConfirm = () => {
    // Create the customized template (structural configuration only)
    const customizedTemplate = {
      ...template,
      ...customizations,
      metadata: {
        ...template.metadata,
        customizedAt: new Date().toISOString(),
        originalTemplateId: template.id
      }
    };

    onConfirm?.(customizedTemplate);
  };

  const handleRandomizeValues = () => {
    const newCustomizations = { ...customizations };
    
    if (template.customizationOptions) {
      Object.entries(template.customizationOptions).forEach(([key, option]) => {
        if (option.type === 'number' && option.min !== undefined && option.max !== undefined) {
          newCustomizations[key] = Math.floor(Math.random() * (option.max - option.min + 1)) + option.min;
        } else if (option.type === 'select' && option.options) {
          const randomIndex = Math.floor(Math.random() * option.options.length);
          newCustomizations[key] = option.options[randomIndex];
        }
      });
    }
    
    setCustomizations(newCustomizations);
    setIsDirty(true);
  };

  const renderCustomizationField = (key, option) => {
    const value = customizations[key];

    switch (option.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleCustomizationChange(key, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={option.placeholder}
          />
        );

      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <input
              id={`customization-${key}`}
              type="number"
              value={value || option.default || 0}
              onChange={(e) => handleCustomizationChange(key, parseInt(e.target.value))}
              min={option.min}
              max={option.max}
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {option.min !== undefined && option.max !== undefined && (
              <input
                type="range"
                value={value || option.default || 0}
                onChange={(e) => handleCustomizationChange(key, parseInt(e.target.value))}
                min={option.min}
                max={option.max}
                className="flex-1"
              />
            )}
          </div>
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleCustomizationChange(key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        );

      case 'select':
        return (
          <select
            id={`customization-${key}`}
            value={value || option.default || ''}
            onChange={(e) => handleCustomizationChange(key, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {option.options?.map(optionValue => (
              <option key={optionValue} value={optionValue}>
                {optionValue}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleCustomizationChange(key, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  const renderCollapsibleSection = (id, title, icon, children) => {
    const isCollapsed = collapsedSections.has(id);
    
    return (
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => handleSectionToggle(id)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg"
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'structural', label: 'Configuration', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col ${className}`}
        role="dialog"
        aria-labelledby="dialog-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 id="dialog-title" className="text-xl font-semibold text-gray-900">
              Customize Template: {template.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {template.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleReset}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleRandomizeValues}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Randomize values"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text Templating Guidance */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div className="flex-1">
              <h3 className="text-blue-900 font-medium mb-1">Looking for Text Templating?</h3>
              <p className="text-blue-800 text-sm">
                Dynamic text with placeholders like <code className="bg-blue-100 px-1 rounded">{'{{character.name}}'}</code> and 
                conditionals like <code className="bg-blue-100 px-1 rounded">{'{{#if condition}}'}</code> is now integrated 
                directly into the <strong>InteractionEditor</strong> and <strong>EncounterEditor</strong>. 
                This dialog focuses on structural configuration only.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'structural' && (
              <div className="space-y-6">
                {/* Basic Information */}
                {renderCollapsibleSection(
                  'basic',
                  'Basic Information',
                  <FileText className="w-4 h-4 text-blue-600" />,
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={customizations.name || ''}
                        onChange={(e) => handleCustomizationChange('name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={customizations.description || ''}
                        onChange={(e) => handleCustomizationChange('description', e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={customizations.tags?.join(', ') || ''}
                        onChange={(e) => handleCustomizationChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Customization Options */}
                {template.customizationOptions && Object.keys(template.customizationOptions).length > 0 && 
                  renderCollapsibleSection(
                    'customization',
                    'Customization Options',
                    <Settings className="w-4 h-4 text-green-600" />,
                    <div className="space-y-4">
                      {Object.entries(template.customizationOptions).map(([key, option]) => (
                        <div key={key}>
                          <label htmlFor={`customization-${key}`} className="block text-sm font-medium text-gray-700 mb-1">
                            {option.label || key}
                          </label>
                          {option.description && (
                            <p className="text-xs text-gray-500 mb-2">{option.description}</p>
                          )}
                          {renderCustomizationField(key, option)}
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            )}


          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/3 border-l border-gray-200 bg-gray-50 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Live Preview</h3>
                
                {/* Preview Content */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Configuration Preview</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {customizations.name}</div>
                      <div><strong>Description:</strong> {customizations.description}</div>
                      <div><strong>Tags:</strong> {customizations.tags?.join(', ') || 'None'}</div>
                    </div>
                  </div>

                  {template.customizationOptions && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2">Customized Values</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(template.customizationOptions).map(([key, option]) => (
                          <div key={key}>
                            <strong>{option.label || key}:</strong> {customizations[key] || option.default || 'Not set'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {isDirty && (
              <span className="text-sm text-amber-600 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Unsaved changes</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Apply Customizations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomizationDialog;