import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Save, RotateCcw, Eye, EyeOff, Settings, FileText, 
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle,
  Shuffle, Copy, Download, Upload
} from 'lucide-react';
import PlaceholderEditor from './PlaceholderEditor';
import TextTemplateEngine from '../../domain/services/TextTemplateEngine';

const TemplateCustomizationDialog = ({
  template,
  type,
  isOpen,
  onClose,
  onConfirm,
  presetCustomizations = {},
  context = {},
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('structural');
  const [customizations, setCustomizations] = useState({});
  const [textTemplates, setTextTemplates] = useState({});
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [showPreview, setShowPreview] = useState(true);
  const [sampleContextIndex, setSampleContextIndex] = useState(0);
  const [validationResults, setValidationResults] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const templateEngine = useMemo(() => new TextTemplateEngine(), []);

  // Sample contexts for testing templates
  const sampleContexts = useMemo(() => [
    {
      name: 'Sample Character 1',
      character: {
        name: 'Aria Blackwood',
        attributes: { strength: 16, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 15, charisma: 18 },
        personality: { aggression: 0.3, curiosity: 0.8, empathy: 0.7 },
        archetype: 'Noble'
      },
      node: {
        name: 'Royal Court',
        type: 'palace',
        environmentalProperties: { formal: true, crowded: true, luxurious: true },
        culturalContext: { language: 'common', customs: 'courtly', law: 'royal decree' }
      },
      world: { name: 'Eldoria', theme: 'medieval fantasy' }
    },
    {
      name: 'Sample Character 2',
      character: {
        name: 'Grimjaw Ironbeard',
        attributes: { strength: 18, dexterity: 10, constitution: 16, intelligence: 8, wisdom: 12, charisma: 6 },
        personality: { aggression: 0.8, curiosity: 0.2, empathy: 0.4 },
        archetype: 'Warrior'
      },
      node: {
        name: 'Tavern Brawl',
        type: 'tavern',
        environmentalProperties: { noisy: true, smoky: true, rough: true },
        culturalContext: { language: 'common', customs: 'working class', law: 'might makes right' }
      },
      world: { name: 'Eldoria', theme: 'medieval fantasy' }
    },
    {
      name: 'Custom Context',
      ...context
    }
  ], [context]);

  const currentContext = sampleContexts[sampleContextIndex];

  // Initialize customizations when template changes
  useEffect(() => {
    if (!template) return;

    const initialCustomizations = {
      name: template.name,
      description: template.description,
      tags: [...(template.tags || [])],
      ...presetCustomizations
    };

    // Add customizable fields based on template type
    if (template.customizationOptions) {
      Object.entries(template.customizationOptions).forEach(([key, option]) => {
        if (initialCustomizations[key] === undefined) {
          initialCustomizations[key] = option.default;
        }
      });
    }

    // Initialize text templates
    const initialTextTemplates = {};
    if (template.textTemplates) {
      Object.entries(template.textTemplates).forEach(([key, value]) => {
        initialTextTemplates[key] = value;
      });
    }

    setCustomizations(initialCustomizations);
    setTextTemplates(initialTextTemplates);
    setIsDirty(false);
  }, [template, presetCustomizations]);

  // Validate templates when they change
  useEffect(() => {
    const results = {};
    Object.entries(textTemplates).forEach(([key, template]) => {
      results[key] = templateEngine.validateTemplate(template);
    });
    setValidationResults(results);
  }, [textTemplates, templateEngine]);

  if (!isOpen || !template) return null;

  const handleCustomizationChange = (key, value) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

  const handleTextTemplateChange = (key, value) => {
    setTextTemplates(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

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
      setTextTemplates(template.textTemplates || {});
      setIsDirty(false);
    }
  };

  const handleConfirm = () => {
    // Create the customized template
    const customizedTemplate = {
      ...template,
      ...customizations,
      textTemplates,
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
    { id: 'structural', label: 'Structure', icon: <Settings className="w-4 h-4" /> },
    { id: 'text', label: 'Text Templates', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
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
            >
              <X className="w-4 h-4" />
            </button>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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

            {activeTab === 'text' && (
              <div className="space-y-6">
                {/* Context Selector */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-blue-900">Preview Context</h3>
                    <select
                      value={sampleContextIndex}
                      onChange={(e) => setSampleContextIndex(parseInt(e.target.value))}
                      className="text-sm border border-blue-300 rounded px-2 py-1"
                    >
                      {sampleContexts.map((ctx, index) => (
                        <option key={index} value={index}>{ctx.name}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-sm text-blue-700">
                    Use this context to test your text templates. Switch between different contexts to see how your templates adapt.
                  </p>
                </div>

                {/* Text Template Fields */}
                <div className="space-y-4">
                  {/* Default text template fields based on type */}
                  {type === 'characters' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Character Description Template
                        </label>
                        <PlaceholderEditor
                          value={textTemplates.description || ''}
                          onChange={(value) => handleTextTemplateChange('description', value)}
                          context={currentContext}
                          placeholder="Enter character description with {{placeholders}}..."
                          showSuggestions={true}
                          showValidation={true}
                          showPreview={true}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Character Background Template
                        </label>
                        <PlaceholderEditor
                          value={textTemplates.background || ''}
                          onChange={(value) => handleTextTemplateChange('background', value)}
                          context={currentContext}
                          placeholder="Enter character background with {{placeholders}}..."
                          showSuggestions={true}
                          showValidation={true}
                          showPreview={true}
                        />
                      </div>
                    </>
                  )}

                  {type === 'interactions' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interaction Description Template
                        </label>
                        <PlaceholderEditor
                          value={textTemplates.description || ''}
                          onChange={(value) => handleTextTemplateChange('description', value)}
                          context={currentContext}
                          placeholder="Enter interaction description with {{placeholders}}..."
                          showSuggestions={true}
                          showValidation={true}
                          showPreview={true}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Success Message Template
                        </label>
                        <PlaceholderEditor
                          value={textTemplates.successMessage || ''}
                          onChange={(value) => handleTextTemplateChange('successMessage', value)}
                          context={currentContext}
                          placeholder="Enter success message with {{placeholders}}..."
                          showSuggestions={true}
                          showValidation={true}
                          showPreview={true}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Failure Message Template
                        </label>
                        <PlaceholderEditor
                          value={textTemplates.failureMessage || ''}
                          onChange={(value) => handleTextTemplateChange('failureMessage', value)}
                          context={currentContext}
                          placeholder="Enter failure message with {{placeholders}}..."
                          showSuggestions={true}
                          showValidation={true}
                          showPreview={true}
                        />
                      </div>
                    </>
                  )}

                  {/* Custom text template fields from template */}
                  {template.textTemplateFields && template.textTemplateFields.map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <PlaceholderEditor
                        value={textTemplates[field.key] || ''}
                        onChange={(value) => handleTextTemplateChange(field.key, value)}
                        context={currentContext}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()} with {{placeholders}}...`}
                        showSuggestions={true}
                        showValidation={true}
                        showPreview={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/3 border-l border-gray-200 bg-gray-50 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Live Preview</h3>
                
                {/* Validation Status */}
                <div className="mb-4">
                  {Object.entries(validationResults).map(([key, result]) => (
                    <div key={key} className="flex items-center space-x-2 text-sm mb-1">
                      {result.isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium">{key}:</span>
                      <span className={result.isValid ? 'text-green-600' : 'text-red-600'}>
                        {result.isValid ? 'Valid' : `${result.errors.length} errors`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Preview Content */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {customizations.name}</div>
                      <div><strong>Description:</strong> {customizations.description}</div>
                      <div><strong>Tags:</strong> {customizations.tags?.join(', ') || 'None'}</div>
                    </div>
                  </div>

                  {Object.entries(textTemplates).map(([key, template]) => {
                    const resolution = templateEngine.resolve(template, currentContext);
                    return (
                      <div key={key} className="bg-white border border-gray-200 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 mb-2 capitalize">{key}</h4>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {resolution.resolved || 'Empty'}
                        </div>
                        {resolution.errors.length > 0 && (
                          <div className="mt-2 text-xs text-red-600">
                            Errors: {resolution.errors.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
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