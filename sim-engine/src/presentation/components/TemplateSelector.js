import React, { useState, useMemo, useCallback } from 'react';
import { 
  useSelector, 
  useDispatch, 
  selectCharacterTemplates, 
  selectNodeTemplates, 
  selectInteractionTemplates, 
  selectGroupTemplates, 
  selectActiveTemplate,
  setActiveTemplate 
} from '../../store/selectors/templateSelectors.js';

// Template type constants for six-step world building
const TEMPLATE_TYPES = {
  WORLD: 'world',
  NODE: 'node',
  INTERACTION: 'interaction',
  CHARACTER: 'character',
  COMPOSITE: 'composite'
};

// Template category configuration for six-step world building
const TEMPLATE_CATEGORIES = [
  {
    id: TEMPLATE_TYPES.WORLD,
    label: 'World Templates',
    icon: '🌍',
    description: 'Complete world configurations with rules and initial conditions',
    color: 'indigo'
  },
  {
    id: TEMPLATE_TYPES.NODE,
    label: 'Node Templates',
    icon: '📍',
    description: 'Abstract locations/contexts (mappless design)',
    color: 'green'
  },
  {
    id: TEMPLATE_TYPES.INTERACTION,
    label: 'Interaction Templates',
    icon: '⚡',
    description: 'Character capabilities (economic, social, combat, crafting)',
    color: 'purple'
  },
  {
    id: TEMPLATE_TYPES.CHARACTER,
    label: 'Character Templates',
    icon: '👤',
    description: 'NPCs with assigned capabilities and D&D attributes',
    color: 'blue'
  },
  {
    id: TEMPLATE_TYPES.COMPOSITE,
    label: 'Composite Templates',
    icon: '🏛️',
    description: 'Role sets and complete scenario templates',
    color: 'amber'
  }
];

// Template preview component for six-step world building
const TemplatePreview = ({ template, type }) => {
  const getPreviewContent = () => {
    switch (type) {
      case TEMPLATE_TYPES.WORLD:
        return (
          <div className="space-y-2">
            {template.rules && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Rules:</span>
                <div className="text-sm mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <pre>{JSON.stringify(template.rules, null, 2)}</pre>
                </div>
              </div>
            )}
            {template.initialConditions && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Initial Conditions:</span>
                <div className="text-sm mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <pre>{JSON.stringify(template.initialConditions, null, 2)}</pre>
                </div>
              </div>
            )}
            {template.nodeCount && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Components:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-sm">
                    {template.nodeCount} nodes
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm">
                    {template.characterCount} characters
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-sm">
                    {template.interactionCount} interactions
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case TEMPLATE_TYPES.NODE:
        return (
          <div className="space-y-2">
            {template.type && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Type:</span>
                <p className="text-sm mt-1">{template.type}</p>
              </div>
            )}
            {template.environmentalProperties && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Environmental Properties:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(template.environmentalProperties).map(([prop, value]) => (
                    <span key={prop} className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-sm">
                      {prop}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.resourceAvailability && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Resources:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {template.resourceAvailability.map((resource, idx) => (
                    <span key={idx} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded text-sm">
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.culturalContext && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Cultural Context:</span>
                <p className="text-sm mt-1">{template.culturalContext}</p>
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              Note: Mappless design - no spatial coordinates
            </div>
          </div>
        );
      
      case TEMPLATE_TYPES.INTERACTION:
        return (
          <div className="space-y-2">
            {template.type && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Capability Type:</span>
                <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-sm">
                  {template.type}
                </span>
              </div>
            )}
            {template.requirements && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Requirements:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(template.requirements).map(([req, value]) => (
                    <span key={req} className="px-2 py-1 bg-red-100 dark:bg-red-900 rounded text-sm">
                      {req}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.branches && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Outcomes:</span>
                <p className="text-sm mt-1">{template.branches.length} possible branches</p>
              </div>
            )}
            {template.effects && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Effects:</span>
                <p className="text-sm mt-1">{template.effects.length} effects</p>
              </div>
            )}
            {template.context && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Context:</span>
                <p className="text-sm mt-1">{template.context}</p>
              </div>
            )}
          </div>
        );

      case TEMPLATE_TYPES.CHARACTER:
        return (
          <div className="space-y-2">
            {template.archetype && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Archetype:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm">
                  {template.archetype}
                </span>
              </div>
            )}
            {template.attributes && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">D&D Attributes:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(template.attributes).map(([attr, value]) => (
                    <span key={attr} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      {attr.toUpperCase()}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.assignedInteractions && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Capabilities:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {template.assignedInteractions.map((interaction, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-sm">
                      {interaction}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.personality && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Personality:</span>
                <p className="text-sm mt-1">{template.personality.traits?.join(', ')}</p>
              </div>
            )}
            {template.consciousness && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Consciousness:</span>
                <div className="text-sm mt-1">
                  Frequency: {template.consciousness.frequency}, Coherence: {template.consciousness.coherence}
                </div>
              </div>
            )}
          </div>
        );
      
      case TEMPLATE_TYPES.COMPOSITE:
        return (
          <div className="space-y-2">
            {template.type && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Composite Type:</span>
                <span className="ml-2 px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded text-sm">
                  {template.type}
                </span>
              </div>
            )}
            {template.roleSet && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Role Set:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {template.roleSet.map((role, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.nodePopulation && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Node Population:</span>
                <p className="text-sm mt-1">Typical character distribution for node types</p>
              </div>
            )}
            {template.economicSystem && (
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Economic System:</span>
                <p className="text-sm mt-1">Trade networks with merchants and interactions</p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Preview</h4>
      {getPreviewContent()}
    </div>
  );
};

// Template card component
const TemplateCard = ({ template, type, isSelected, onSelect }) => {
  const categoryConfig = TEMPLATE_CATEGORIES.find(cat => cat.id === type);
  const colorClasses = {
    indigo: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950',
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
    green: 'border-green-500 bg-green-50 dark:bg-green-950',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
    amber: 'border-amber-500 bg-amber-50 dark:bg-amber-950'
  };

  return (
    <div
      className={`
        relative p-4 border-2 rounded-lg cursor-pointer transition-all
        ${isSelected 
          ? `${colorClasses[categoryConfig.color]} border-opacity-100` 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
        }
      `}
      onClick={() => onSelect(template, type)}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
        </div>
      )}

      {/* Template info */}
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{categoryConfig.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {template.name}
          </h3>
          {template.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {template.description}
            </p>
          )}
          
          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Modifiers indicator */}
          {template.modifiers && Object.keys(template.modifiers).length > 0 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              {Object.keys(template.modifiers).length} modifiers
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Template customization form component
const TemplateCustomizationForm = ({ template, type, onCustomize, onCancel }) => {
  const [customizations, setCustomizations] = useState({});

  const handleFieldChange = (field, value) => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCustomize(customizations);
  };

  const renderCustomizationFields = () => {
    switch (type) {
      case TEMPLATE_TYPES.WORLD:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">World Name</label>
              <input
                type="text"
                value={customizations.name || template.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter world name..."
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={customizations.description || template.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Describe your world..."
                maxLength={1000}
              />
            </div>
          </div>
        );

      case TEMPLATE_TYPES.NODE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Node Name</label>
              <input
                type="text"
                value={customizations.name || template.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter node name..."
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Node Type</label>
              <select
                value={customizations.type || template.type || ''}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select type...</option>
                <option value="settlement">Settlement</option>
                <option value="wilderness">Wilderness</option>
                <option value="market">Market</option>
                <option value="temple">Temple</option>
                <option value="fortress">Fortress</option>
                <option value="ruins">Ruins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={customizations.description || template.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Describe this location..."
                maxLength={1000}
              />
            </div>
          </div>
        );

      case TEMPLATE_TYPES.INTERACTION:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Interaction Name</label>
              <input
                type="text"
                value={customizations.name || template.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter interaction name..."
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Capability Type</label>
              <select
                value={customizations.type || template.type || ''}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select type...</option>
                <option value="economic">Economic</option>
                <option value="social">Social</option>
                <option value="combat">Combat</option>
                <option value="crafting">Crafting</option>
                <option value="exploration">Exploration</option>
                <option value="resource_gathering">Resource Gathering</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={customizations.description || template.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Describe this capability..."
                maxLength={1000}
              />
            </div>
          </div>
        );

      case TEMPLATE_TYPES.CHARACTER:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Character Name</label>
              <input
                type="text"
                value={customizations.name || template.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter character name..."
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Archetype</label>
              <select
                value={customizations.archetype || template.archetype || ''}
                onChange={(e) => handleFieldChange('archetype', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select archetype...</option>
                <option value="merchant">Merchant</option>
                <option value="guard">Guard</option>
                <option value="forager">Forager</option>
                <option value="noble">Noble</option>
                <option value="artisan">Artisan</option>
                <option value="scholar">Scholar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={customizations.description || template.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Describe this character..."
                maxLength={1000}
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <p className="text-gray-500">No customization options available for this template type.</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Customize Template</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Customizing: {template.name}
        </p>
        
        <form onSubmit={handleSubmit}>
          {renderCustomizationFields()}
          
          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Template
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main TemplateSelector component for six-step world building
const TemplateSelector = ({ 
  onTemplateSelect, 
  multiSelect = false,
  allowedTypes = Object.values(TEMPLATE_TYPES),
  className = '',
  showCustomization = true
}) => {
  // Template selector logic with Redux placeholders
  const dispatch = useDispatch();
  
  // Redux selectors
  const characterTemplates = useSelector(selectCharacterTemplates);
  const nodeTemplates = useSelector(selectNodeTemplates);
  const interactionTemplates = useSelector(selectInteractionTemplates);
  const groupTemplates = useSelector(selectGroupTemplates);
  const activeTemplate = useSelector(selectActiveTemplate);

  // Local state
  const [selectedType, setSelectedType] = useState(allowedTypes[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());
  const [showPreview, setShowPreview] = useState(true);
  const [customizingTemplate, setCustomizingTemplate] = useState(null);
  const [customizingType, setCustomizingType] = useState(null);

  // Get templates for selected type (six-step world building)
  const getTemplatesForType = useCallback((type) => {
    switch (type) {
      case TEMPLATE_TYPES.WORLD:
        return []; // World templates would come from a different source
      case TEMPLATE_TYPES.NODE:
        return nodeTemplates;
      case TEMPLATE_TYPES.INTERACTION:
        return interactionTemplates;
      case TEMPLATE_TYPES.CHARACTER:
        return characterTemplates;
      case TEMPLATE_TYPES.COMPOSITE:
        return groupTemplates; // Reuse group templates as composite templates
      default:
        return [];
    }
  }, [characterTemplates, nodeTemplates, interactionTemplates, groupTemplates]);

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    const templates = getTemplatesForType(selectedType);
    if (!searchQuery) return templates;

    const query = searchQuery.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [selectedType, searchQuery, getTemplatesForType]);

  // Handle template selection with customization support
  const handleTemplateSelect = useCallback((template, type) => {
    if (showCustomization && !multiSelect) {
      // Show customization form
      setCustomizingTemplate(template);
      setCustomizingType(type);
    } else if (multiSelect) {
      const newSelected = new Set(selectedTemplates);
      const templateId = `${type}-${template.id}`;
      
      if (newSelected.has(templateId)) {
        newSelected.delete(templateId);
      } else {
        newSelected.add(templateId);
      }
      
      setSelectedTemplates(newSelected);
      
      if (onTemplateSelect) {
        const selectedData = Array.from(newSelected).map(id => {
          const [templateType, templateId] = id.split('-');
          const templates = getTemplatesForType(templateType);
          return {
            type: templateType,
            template: templates.find(t => t.id === templateId)
          };
        });
        onTemplateSelect(selectedData);
      }
    } else {
      dispatch(setActiveTemplate({ template, type }));
      if (onTemplateSelect) {
        onTemplateSelect({ template, type });
      }
    }
  }, [multiSelect, selectedTemplates, dispatch, onTemplateSelect, getTemplatesForType, showCustomization]);

  // Handle template customization
  const handleTemplateCustomize = useCallback((customizations) => {
    if (customizingTemplate && customizingType) {
      const customizedTemplate = {
        ...customizingTemplate,
        ...customizations
      };
      
      dispatch(setActiveTemplate({ template: customizedTemplate, type: customizingType }));
      if (onTemplateSelect) {
        onTemplateSelect({ 
          template: customizedTemplate, 
          type: customizingType,
          customizations 
        });
      }
      
      setCustomizingTemplate(null);
      setCustomizingType(null);
    }
  }, [customizingTemplate, customizingType, dispatch, onTemplateSelect]);

  // Handle customization cancel
  const handleCustomizationCancel = useCallback(() => {
    setCustomizingTemplate(null);
    setCustomizingType(null);
  }, []);

  // Check if template is selected
  const isTemplateSelected = useCallback((template, type) => {
    if (multiSelect) {
      return selectedTemplates.has(`${type}-${template.id}`);
    }
    return activeTemplate?.id === template.id && activeTemplate?.type === type;
  }, [multiSelect, selectedTemplates, activeTemplate]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Template Selector
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose templates for your six-step world building process
        </p>
      </div>

      {/* Type selector tabs */}
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {TEMPLATE_CATEGORIES.filter(cat => allowedTypes.includes(cat.id)).map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedType(category.id)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
              ${selectedType === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Search and controls */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>

      {/* Template grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              type={selectedType}
              isSelected={isTemplateSelected(template, selectedType)}
              onSelect={handleTemplateSelect}
            />
          ))}
        </div>

        {/* Empty state */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No templates found matching your search
            </p>
          </div>
        )}
      </div>

      {/* Preview panel */}
      {showPreview && activeTemplate && !multiSelect && (
        <div className="mt-4 border-t pt-4 dark:border-gray-700">
          <TemplatePreview 
            template={activeTemplate} 
            type={activeTemplate.type} 
          />
        </div>
      )}

      {/* Multi-select summary */}
      {multiSelect && selectedTemplates.size > 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedTemplates.size} template{selectedTemplates.size !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      {/* Template customization modal */}
      {customizingTemplate && customizingType && (
        <TemplateCustomizationForm
          template={customizingTemplate}
          type={customizingType}
          onCustomize={handleTemplateCustomize}
          onCancel={handleCustomizationCancel}
        />
      )}
    </div>
  );
};

export default TemplateSelector;