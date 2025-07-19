import React, { useState, useCallback, useMemo, useEffect } from 'react';
// Template customization form without Redux

// Template type constants for six-step world building
const TEMPLATE_TYPES = {
  WORLD: 'world',
  NODE: 'node',
  INTERACTION: 'interaction',
  CHARACTER: 'character',
  COMPOSITE: 'composite'
};

// Customization field types
const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  BOOLEAN: 'boolean',
  RANGE: 'range',
  TEXTAREA: 'textarea',
  TAGS: 'tags',
  OBJECT: 'object',
  ARRAY: 'array'
};

// Predefined customization schemas for six-step world building
const DEFAULT_CUSTOMIZATION_SCHEMAS = {
  [TEMPLATE_TYPES.WORLD]: {
    basic: {
      title: 'Basic Properties',
      fields: [
        {
          key: 'name',
          label: 'World Name',
          type: FIELD_TYPES.TEXT,
          required: true,
          placeholder: 'Enter world name...',
          description: 'The name of your world'
        },
        {
          key: 'description',
          label: 'Description',
          type: FIELD_TYPES.TEXTAREA,
          required: true,
          placeholder: 'Describe your world...',
          rows: 4,
          description: 'A detailed description of your world'
        }
      ]
    },
    rules: {
      title: 'World Rules',
      fields: [
        {
          key: 'rules.timeProgression',
          label: 'Time Progression',
          type: FIELD_TYPES.SELECT,
          options: [
            { value: 'realtime', label: 'Real-time' },
            { value: 'accelerated', label: 'Accelerated' },
            { value: 'turn_based', label: 'Turn-based' }
          ],
          defaultValue: 'realtime',
          description: 'How time progresses in your world'
        },
        {
          key: 'rules.simulationSpeed',
          label: 'Simulation Speed',
          type: FIELD_TYPES.RANGE,
          min: 0.1,
          max: 10,
          step: 0.1,
          defaultValue: 1,
          description: 'Speed multiplier for simulation'
        }
      ]
    },
    conditions: {
      title: 'Initial Conditions',
      fields: [
        {
          key: 'initialConditions.startingYear',
          label: 'Starting Year',
          type: FIELD_TYPES.NUMBER,
          defaultValue: 1000,
          description: 'The year when the simulation begins'
        },
        {
          key: 'initialConditions.season',
          label: 'Starting Season',
          type: FIELD_TYPES.SELECT,
          options: [
            { value: 'spring', label: 'Spring' },
            { value: 'summer', label: 'Summer' },
            { value: 'autumn', label: 'Autumn' },
            { value: 'winter', label: 'Winter' }
          ],
          defaultValue: 'spring',
          description: 'The season when the simulation begins'
        }
      ]
    }
  },

  [TEMPLATE_TYPES.NODE]: {
    basic: {
      title: 'Basic Properties',
      fields: [
        {
          key: 'name',
          label: 'Node Name',
          type: FIELD_TYPES.TEXT,
          required: true,
          placeholder: 'Enter node name...',
          description: 'The name of this location'
        },
        {
          key: 'type',
          label: 'Node Type',
          type: FIELD_TYPES.SELECT,
          required: true,
          options: [
            { value: 'settlement', label: 'Settlement' },
            { value: 'wilderness', label: 'Wilderness' },
            { value: 'market', label: 'Market' },
            { value: 'temple', label: 'Temple' },
            { value: 'fortress', label: 'Fortress' },
            { value: 'ruins', label: 'Ruins' }
          ],
          description: 'The type of location this represents'
        },
        {
          key: 'description',
          label: 'Description',
          type: FIELD_TYPES.TEXTAREA,
          required: true,
          placeholder: 'Describe this location...',
          rows: 3,
          description: 'A detailed description of this location'
        }
      ]
    },
    environment: {
      title: 'Environmental Properties',
      fields: [
        {
          key: 'environmentalProperties.climate',
          label: 'Climate',
          type: FIELD_TYPES.SELECT,
          options: [
            { value: 'temperate', label: 'Temperate' },
            { value: 'tropical', label: 'Tropical' },
            { value: 'arid', label: 'Arid' },
            { value: 'cold', label: 'Cold' },
            { value: 'magical', label: 'Magical' }
          ],
          description: 'The climate of this location'
        },
        {
          key: 'environmentalProperties.terrain',
          label: 'Terrain',
          type: FIELD_TYPES.SELECT,
          options: [
            { value: 'plains', label: 'Plains' },
            { value: 'forest', label: 'Forest' },
            { value: 'mountains', label: 'Mountains' },
            { value: 'desert', label: 'Desert' },
            { value: 'coast', label: 'Coast' },
            { value: 'underground', label: 'Underground' }
          ],
          description: 'The terrain type of this location'
        }
      ]
    },
    resources: {
      title: 'Resources & Culture',
      fields: [
        {
          key: 'resourceAvailability',
          label: 'Available Resources',
          type: FIELD_TYPES.TAGS,
          placeholder: 'Add resource...',
          description: 'Resources available at this location'
        },
        {
          key: 'culturalContext',
          label: 'Cultural Context',
          type: FIELD_TYPES.TEXTAREA,
          placeholder: 'Describe the cultural context...',
          rows: 2,
          description: 'The cultural and social context of this location'
        }
      ]
    }
  },

  [TEMPLATE_TYPES.INTERACTION]: {
    basic: {
      title: 'Basic Properties',
      fields: [
        {
          key: 'name',
          label: 'Interaction Name',
          type: FIELD_TYPES.TEXT,
          required: true,
          placeholder: 'Enter interaction name...',
          description: 'The name of this capability'
        },
        {
          key: 'type',
          label: 'Capability Type',
          type: FIELD_TYPES.SELECT,
          required: true,
          options: [
            { value: 'economic', label: 'Economic' },
            { value: 'social', label: 'Social' },
            { value: 'combat', label: 'Combat' },
            { value: 'crafting', label: 'Crafting' },
            { value: 'exploration', label: 'Exploration' },
            { value: 'resource_gathering', label: 'Resource Gathering' }
          ],
          description: 'The type of capability this represents'
        },
        {
          key: 'description',
          label: 'Description',
          type: FIELD_TYPES.TEXTAREA,
          required: true,
          placeholder: 'Describe this capability...',
          rows: 3,
          description: 'A detailed description of what this interaction does'
        }
      ]
    },
    requirements: {
      title: 'Requirements',
      fields: [
        {
          key: 'requirements.minimumAttribute',
          label: 'Minimum Attribute Requirement',
          type: FIELD_TYPES.SELECT,
          options: [
            { value: '', label: 'None' },
            { value: 'strength', label: 'Strength' },
            { value: 'dexterity', label: 'Dexterity' },
            { value: 'constitution', label: 'Constitution' },
            { value: 'intelligence', label: 'Intelligence' },
            { value: 'wisdom', label: 'Wisdom' },
            { value: 'charisma', label: 'Charisma' }
          ],
          description: 'Minimum D&D attribute required'
        },
        {
          key: 'requirements.minimumValue',
          label: 'Minimum Value',
          type: FIELD_TYPES.NUMBER,
          min: 1,
          max: 20,
          defaultValue: 10,
          description: 'Minimum attribute value required'
        }
      ]
    },
    context: {
      title: 'Context & Effects',
      fields: [
        {
          key: 'context',
          label: 'Context',
          type: FIELD_TYPES.TEXTAREA,
          placeholder: 'Where and when can this interaction be used?',
          rows: 2,
          description: 'The context in which this interaction can be performed'
        }
      ]
    }
  },

  [TEMPLATE_TYPES.CHARACTER]: {
    basic: {
      title: 'Basic Properties',
      fields: [
        {
          key: 'name',
          label: 'Character Name',
          type: FIELD_TYPES.TEXT,
          required: true,
          placeholder: 'Enter character name...',
          description: 'The name of this character'
        },
        {
          key: 'archetype',
          label: 'Archetype',
          type: FIELD_TYPES.SELECT,
          required: true,
          options: [
            { value: 'merchant', label: 'Merchant' },
            { value: 'guard', label: 'Guard' },
            { value: 'forager', label: 'Forager' },
            { value: 'noble', label: 'Noble' },
            { value: 'artisan', label: 'Artisan' },
            { value: 'scholar', label: 'Scholar' }
          ],
          description: 'The character archetype'
        },
        {
          key: 'description',
          label: 'Description',
          type: FIELD_TYPES.TEXTAREA,
          required: true,
          placeholder: 'Describe this character...',
          rows: 3,
          description: 'A detailed description of this character'
        }
      ]
    },
    attributes: {
      title: 'D&D Attributes',
      fields: [
        {
          key: 'attributes.strength',
          label: 'Strength',
          type: FIELD_TYPES.RANGE,
          min: 3,
          max: 18,
          defaultValue: 10,
          description: 'Physical power'
        },
        {
          key: 'attributes.dexterity',
          label: 'Dexterity',
          type: FIELD_TYPES.RANGE,
          min: 3,
          max: 18,
          defaultValue: 10,
          description: 'Agility and reflexes'
        },
        {
          key: 'attributes.constitution',
          label: 'Constitution',
          type: FIELD_TYPES.RANGE,
          min: 3,
          max: 18,
          defaultValue: 10,
          description: 'Endurance and health'
        },
        {
          key: 'attributes.intelligence',
          label: 'Intelligence',
          type: FIELD_TYPES.RANGE,
          min: 3,
          max: 18,
          defaultValue: 10,
          description: 'Reasoning and memory'
        },
        {
          key: 'attributes.wisdom',
          label: 'Wisdom',
          type: FIELD_TYPES.RANGE,
          min: 3,
          max: 18,
          defaultValue: 10,
          description: 'Awareness and insight'
        },
        {
          key: 'attributes.charisma',
          label: 'Charisma',
          type: FIELD_TYPES.RANGE,
          min: 3,
          max: 18,
          defaultValue: 10,
          description: 'Force of personality'
        }
      ]
    },
    capabilities: {
      title: 'Capabilities',
      fields: [
        {
          key: 'assignedInteractions',
          label: 'Assigned Interactions',
          type: FIELD_TYPES.TAGS,
          placeholder: 'Add capability...',
          description: 'The interactions this character can perform'
        }
      ]
    },
    consciousness: {
      title: 'Consciousness & Personality',
      fields: [
        {
          key: 'consciousness.frequency',
          label: 'Consciousness Frequency',
          type: FIELD_TYPES.RANGE,
          min: 20,
          max: 80,
          defaultValue: 40,
          description: 'Base consciousness frequency (Hz)'
        },
        {
          key: 'consciousness.coherence',
          label: 'Consciousness Coherence',
          type: FIELD_TYPES.RANGE,
          min: 0,
          max: 1,
          step: 0.1,
          defaultValue: 0.7,
          description: 'Consciousness coherence level'
        }
      ]
    }
  },

  [TEMPLATE_TYPES.COMPOSITE]: {
    basic: {
      title: 'Basic Properties',
      fields: [
        {
          key: 'name',
          label: 'Composite Name',
          type: FIELD_TYPES.TEXT,
          required: true,
          placeholder: 'Enter composite name...',
          description: 'The name of this composite template'
        },
        {
          key: 'type',
          label: 'Composite Type',
          type: FIELD_TYPES.SELECT,
          required: true,
          options: [
            { value: 'role_set', label: 'Role Set' },
            { value: 'node_population', label: 'Node Population' },
            { value: 'economic_system', label: 'Economic System' },
            { value: 'scenario', label: 'Complete Scenario' }
          ],
          description: 'The type of composite template'
        },
        {
          key: 'description',
          label: 'Description',
          type: FIELD_TYPES.TEXTAREA,
          required: true,
          placeholder: 'Describe this composite...',
          rows: 3,
          description: 'A detailed description of this composite template'
        }
      ]
    },
    components: {
      title: 'Components',
      fields: [
        {
          key: 'roleSet',
          label: 'Role Set',
          type: FIELD_TYPES.TAGS,
          placeholder: 'Add role...',
          description: 'The roles included in this composite'
        }
      ]
    }
  }
};

// Field input component (supports nested keys)
const FieldInput = ({ field, value, onChange, errors = {} }) => {
  const fieldError = errors[field.key];

  const handleChange = (newValue) => {
    onChange(field.key, newValue);
  };

  // Get the actual value, handling nested keys
  const getFieldValue = () => {
    if (field.key.includes('.')) {
      // For nested keys, we need to traverse the value object
      return field.key.split('.').reduce((current, key) => current?.[key], { [field.key.split('.')[0]]: value });
    }
    return value;
  };

  const fieldValue = getFieldValue();

  const renderInput = () => {
    switch (field.type) {
      case FIELD_TYPES.TEXT:
        return (
          <input
            type="text"
            value={fieldValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className={`
              w-full px-3 py-2 border rounded-lg dark:bg-gray-800
              ${fieldError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            `}
          />
        );

      case FIELD_TYPES.TEXTAREA:
        return (
          <textarea
            value={fieldValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className={`
              w-full px-3 py-2 border rounded-lg dark:bg-gray-800
              ${fieldError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            `}
          />
        );

      case FIELD_TYPES.NUMBER:
        return (
          <input
            type="number"
            value={fieldValue || ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            placeholder={field.placeholder}
            className={`
              w-full px-3 py-2 border rounded-lg dark:bg-gray-800
              ${fieldError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            `}
          />
        );

      case FIELD_TYPES.RANGE:
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={fieldValue || field.min || 0}
              onChange={(e) => handleChange(parseFloat(e.target.value))}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{field.min || 0}</span>
              <span className="font-medium">{fieldValue || field.min || 0}</span>
              <span>{field.max || 100}</span>
            </div>
          </div>
        );

      case FIELD_TYPES.SELECT:
        return (
          <select
            value={fieldValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg dark:bg-gray-800
              ${fieldError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            `}
          >
            <option value="">Select {field.label}</option>
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case FIELD_TYPES.MULTISELECT:
        const selectedValues = Array.isArray(fieldValue) ? fieldValue : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedValues.map(val => (
                <span
                  key={val}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm flex items-center gap-1"
                >
                  {field.options.find(opt => opt.value === val)?.label || val}
                  <button
                    onClick={() => handleChange(selectedValues.filter(v => v !== val))}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value && !selectedValues.includes(e.target.value)) {
                  handleChange([...selectedValues, e.target.value]);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">Add {field.label}</option>
              {field.options
                .filter(option => !selectedValues.includes(option.value))
                .map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        );

      case FIELD_TYPES.BOOLEAN:
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) => handleChange(e.target.checked)}
              className="rounded"
            />
            <span>{field.checkboxLabel || field.label}</span>
          </label>
        );

      case FIELD_TYPES.TAGS:
        const tags = Array.isArray(fieldValue) ? fieldValue : [];
        const [newTag, setNewTag] = useState('');
        
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleChange(tags.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    handleChange([...tags, newTag.trim()]);
                    setNewTag('');
                  }
                }}
                placeholder={field.placeholder || 'Add tag...'}
                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />
              <button
                onClick={() => {
                  if (newTag.trim()) {
                    handleChange([...tags, newTag.trim()]);
                    setNewTag('');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 italic">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {field.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {field.description}
        </p>
      )}
      
      {renderInput()}
      
      {fieldError && (
        <p className="text-red-500 text-sm">{fieldError}</p>
      )}
    </div>
  );
};

// Template customization section
const CustomizationSection = ({ title, fields, values, onChange, errors, collapsible = true }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!fields || fields.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <div
        className={`
          p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg
          ${collapsible ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
        `}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {collapsible && (
            <span className="text-gray-500">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {fields.map(field => (
            <FieldInput
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={onChange}
              errors={errors}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Template preview component
const TemplatePreview = ({ template, customizations, templateType }) => {
  const mergedData = useMemo(() => {
    return { ...template, ...customizations };
  }, [template, customizations]);

  const renderPreviewContent = () => {
    switch (templateType) {
      case TEMPLATE_TYPES.WORLD:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-medium">Name:</span> {mergedData.name || 'Unnamed World'}
            </div>
            <div>
              <span className="font-medium">Description:</span> {mergedData.description || 'No description'}
            </div>
            {mergedData.rules && (
              <div>
                <span className="font-medium">Rules:</span>
                <div className="text-sm mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <pre className="text-xs">{JSON.stringify(mergedData.rules, null, 2)}</pre>
                </div>
              </div>
            )}
            {mergedData.initialConditions && (
              <div>
                <span className="font-medium">Initial Conditions:</span>
                <div className="text-sm mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <pre className="text-xs">{JSON.stringify(mergedData.initialConditions, null, 2)}</pre>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-500 italic">
              Note: Mappless world design - no spatial dimensions
            </div>
          </div>
        );

      case TEMPLATE_TYPES.NODE:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-medium">Name:</span> {mergedData.name || 'Unnamed Node'}
            </div>
            <div>
              <span className="font-medium">Type:</span> {mergedData.type || 'None'}
            </div>
            <div>
              <span className="font-medium">Description:</span> {mergedData.description || 'No description'}
            </div>
            {mergedData.environmentalProperties && (
              <div>
                <span className="font-medium">Environmental Properties:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(mergedData.environmentalProperties).map(([prop, value]) => (
                    <span key={prop} className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-sm">
                      {prop}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mergedData.resourceAvailability && mergedData.resourceAvailability.length > 0 && (
              <div>
                <span className="font-medium">Resources:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {mergedData.resourceAvailability.map((resource, idx) => (
                    <span key={idx} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded text-sm">
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mergedData.culturalContext && (
              <div>
                <span className="font-medium">Cultural Context:</span>
                <p className="text-sm mt-1">{mergedData.culturalContext}</p>
              </div>
            )}
            <div className="text-xs text-gray-500 italic">
              Note: Abstract location - no spatial coordinates
            </div>
          </div>
        );

      case TEMPLATE_TYPES.INTERACTION:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-medium">Name:</span> {mergedData.name || 'Unnamed Interaction'}
            </div>
            <div>
              <span className="font-medium">Capability Type:</span> {mergedData.type || 'None'}
            </div>
            <div>
              <span className="font-medium">Description:</span> {mergedData.description || 'No description'}
            </div>
            {mergedData.requirements && Object.keys(mergedData.requirements).length > 0 && (
              <div>
                <span className="font-medium">Requirements:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(mergedData.requirements).map(([req, value]) => (
                    <span key={req} className="px-2 py-1 bg-red-100 dark:bg-red-900 rounded text-sm">
                      {req}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mergedData.branches && (
              <div>
                <span className="font-medium">Outcomes:</span>
                <span className="ml-2 text-sm">{mergedData.branches.length} possible branches</span>
              </div>
            )}
            {mergedData.effects && (
              <div>
                <span className="font-medium">Effects:</span>
                <span className="ml-2 text-sm">{mergedData.effects.length} effects</span>
              </div>
            )}
            {mergedData.context && (
              <div>
                <span className="font-medium">Context:</span>
                <p className="text-sm mt-1">{mergedData.context}</p>
              </div>
            )}
          </div>
        );

      case TEMPLATE_TYPES.CHARACTER:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-medium">Name:</span> {mergedData.name || 'Unnamed Character'}
            </div>
            <div>
              <span className="font-medium">Archetype:</span> {mergedData.archetype || 'None'}
            </div>
            <div>
              <span className="font-medium">Description:</span> {mergedData.description || 'No description'}
            </div>
            {mergedData.attributes && (
              <div>
                <span className="font-medium">D&D Attributes:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(mergedData.attributes).map(([attr, value]) => (
                    <span key={attr} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm">
                      {attr.toUpperCase()}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mergedData.assignedInteractions && mergedData.assignedInteractions.length > 0 && (
              <div>
                <span className="font-medium">Capabilities:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {mergedData.assignedInteractions.map((interaction, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-sm">
                      {interaction}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mergedData.personality && mergedData.personality.traits && (
              <div>
                <span className="font-medium">Personality:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(mergedData.personality.traits).slice(0, 3).map(([trait, value]) => (
                    <span key={trait} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-sm">
                      {trait}: {value.toFixed(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mergedData.consciousness && (
              <div>
                <span className="font-medium">Consciousness:</span>
                <span className="ml-2 text-sm">
                  Freq: {mergedData.consciousness.frequency}, Coh: {mergedData.consciousness.coherence}
                </span>
              </div>
            )}
          </div>
        );

      case TEMPLATE_TYPES.COMPOSITE:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-medium">Name:</span> {mergedData.name || 'Unnamed Composite'}
            </div>
            <div>
              <span className="font-medium">Type:</span> {mergedData.type || 'None'}
            </div>
            <div>
              <span className="font-medium">Description:</span> {mergedData.description || 'No description'}
            </div>
            {mergedData.roleSet && mergedData.roleSet.length > 0 && (
              <div>
                <span className="font-medium">Role Set:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {mergedData.roleSet.map((role, idx) => (
                    <span key={idx} className="px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded text-sm">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mergedData.nodePopulation && (
              <div>
                <span className="font-medium">Node Population:</span>
                <p className="text-sm mt-1">Typical character distribution for node types</p>
              </div>
            )}
            {mergedData.economicSystem && (
              <div>
                <span className="font-medium">Economic System:</span>
                <p className="text-sm mt-1">Trade networks with merchants and interactions</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {mergedData.name || 'Unnamed Template'}
            </div>
            {mergedData.description && (
              <div>
                <span className="font-medium">Description:</span> {mergedData.description}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Preview</h4>
      {renderPreviewContent()}
    </div>
  );
};

// Main TemplateCustomizationForm component for mappless design
const TemplateCustomizationForm = ({
  template,
  templateType,
  customizationSchema,
  onCustomizationChange,
  onApply,
  onCancel,
  showPreview = true,
  className = '',
  enableSpatialFields = false // Disable spatial fields for mappless design
}) => {
  const dispatch = useDispatch();
  
  const [customizations, setCustomizations] = useState({});
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState(null);

  // Get effective customization schema (use default if none provided)
  const effectiveSchema = useMemo(() => {
    if (customizationSchema) {
      return customizationSchema;
    }
    
    // Use default schema for the template type
    const defaultSchema = DEFAULT_CUSTOMIZATION_SCHEMAS[templateType];
    if (defaultSchema) {
      // Filter out spatial fields for mappless design
      if (!enableSpatialFields) {
        const filteredSchema = {};
        Object.entries(defaultSchema).forEach(([sectionKey, section]) => {
          const filteredFields = section.fields?.filter(field => {
            // Remove spatial-related fields
            const spatialFields = ['position', 'coordinates', 'x', 'y', 'z', 'location', 'dimensions'];
            return !spatialFields.some(spatial => field.key.toLowerCase().includes(spatial));
          });
          
          if (filteredFields && filteredFields.length > 0) {
            filteredSchema[sectionKey] = {
              ...section,
              fields: filteredFields
            };
          }
        });
        return filteredSchema;
      }
      return defaultSchema;
    }
    
    return {};
  }, [customizationSchema, templateType, enableSpatialFields]);

  // Initialize customizations with template defaults
  useEffect(() => {
    if (template && effectiveSchema) {
      const initialCustomizations = {};
      
      // Set default values from schema
      Object.values(effectiveSchema).forEach(section => {
        section.fields?.forEach(field => {
          // Handle nested field keys (e.g., 'rules.timeProgression')
          const fieldValue = getNestedValue(template, field.key);
          
          if (field.defaultValue !== undefined) {
            setNestedValue(initialCustomizations, field.key, field.defaultValue);
          } else if (fieldValue !== undefined) {
            setNestedValue(initialCustomizations, field.key, fieldValue);
          }
        });
      });
      
      setCustomizations(initialCustomizations);
    }
  }, [template, effectiveSchema]);

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Helper function to set nested object values
  const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  // Handle field value changes (supports nested keys)
  const handleFieldChange = useCallback((fieldKey, value) => {
    const newCustomizations = { ...customizations };
    setNestedValue(newCustomizations, fieldKey, value);
    setCustomizations(newCustomizations);
    
    // Clear field error if it exists
    if (errors[fieldKey]) {
      const newErrors = { ...errors };
      delete newErrors[fieldKey];
      setErrors(newErrors);
    }
    
    // Notify parent of changes
    if (onCustomizationChange) {
      onCustomizationChange(newCustomizations);
    }
  }, [customizations, errors, onCustomizationChange]);

  // Validate customizations (supports nested keys)
  const validateCustomizations = useCallback(() => {
    const newErrors = {};
    
    if (effectiveSchema) {
      Object.values(effectiveSchema).forEach(section => {
        section.fields?.forEach(field => {
          const value = getNestedValue(customizations, field.key);
          
          // Required field validation
          if (field.required && (value === undefined || value === null || value === '')) {
            newErrors[field.key] = `${field.label} is required`;
          }
          
          // Type-specific validation
          if (value !== undefined && value !== null && value !== '') {
            switch (field.type) {
              case FIELD_TYPES.NUMBER:
              case FIELD_TYPES.RANGE:
                if (field.min !== undefined && value < field.min) {
                  newErrors[field.key] = `${field.label} must be at least ${field.min}`;
                }
                if (field.max !== undefined && value > field.max) {
                  newErrors[field.key] = `${field.label} must be at most ${field.max}`;
                }
                break;
              
              case FIELD_TYPES.TEXT:
              case FIELD_TYPES.TEXTAREA:
                if (field.minLength && value.length < field.minLength) {
                  newErrors[field.key] = `${field.label} must be at least ${field.minLength} characters`;
                }
                if (field.maxLength && value.length > field.maxLength) {
                  newErrors[field.key] = `${field.label} must be at most ${field.maxLength} characters`;
                }
                break;
            }
          }
          
          // Custom validation
          if (field.validate && typeof field.validate === 'function') {
            const validationResult = field.validate(value, customizations);
            if (validationResult !== true) {
              newErrors[field.key] = validationResult;
            }
          }
        });
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [customizations, effectiveSchema]);

  // Handle apply
  const handleApply = useCallback(() => {
    if (validateCustomizations()) {
      const finalTemplate = { ...template, ...customizations };
      if (onApply) {
        onApply(finalTemplate, customizations);
      }
    }
  }, [template, customizations, validateCustomizations, onApply]);

  // Reset to defaults (supports nested keys)
  const handleReset = useCallback(() => {
    const resetCustomizations = {};
    if (effectiveSchema) {
      Object.values(effectiveSchema).forEach(section => {
        section.fields?.forEach(field => {
          const templateValue = getNestedValue(template, field.key);
          if (templateValue !== undefined) {
            setNestedValue(resetCustomizations, field.key, templateValue);
          }
        });
      });
    }
    setCustomizations(resetCustomizations);
    setErrors({});
  }, [template, effectiveSchema]);

  if (!template || !effectiveSchema) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          No template selected for customization
        </div>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;
  const hasChanges = Object.keys(customizations).length > 0;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Customize Template
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize "{template.name}" before applying it
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customization form */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto">
          {Object.entries(effectiveSchema).map(([sectionKey, section]) => (
            <CustomizationSection
              key={sectionKey}
              title={section.title}
              fields={section.fields}
              values={customizations}
              onChange={handleFieldChange}
              errors={errors}
              collapsible={section.collapsible !== false}
            />
          ))}

          {/* No customization fields */}
          {Object.keys(effectiveSchema).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              This template has no customizable fields
            </div>
          )}

          {/* Mappless design note */}
          {!enableSpatialFields && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This is a mappless world building system. 
                Spatial coordinates and dimensions are not used - nodes represent abstract locations or contexts.
              </p>
            </div>
          )}
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="sticky top-0">
              <TemplatePreview
                template={template}
                customizations={customizations}
                templateType={templateType}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
          >
            Reset to Defaults
          </button>
          
          {hasErrors && (
            <span className="text-red-600 text-sm">
              Please fix {Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={hasErrors}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomizationForm;