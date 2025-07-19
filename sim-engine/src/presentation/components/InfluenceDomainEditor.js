// src/presentation/components/InfluenceDomainEditor.js

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Edit, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Component for editing and managing influence domains
 * Allows users to create, modify, and configure influence domains with their tiers
 */
const InfluenceDomainEditor = ({ 
  domains = [], 
  onDomainsChange, 
  isReadOnly = false,
  className = '' 
}) => {
  const [localDomains, setLocalDomains] = useState([]);
  const [editingDomain, setEditingDomain] = useState(null);
  const [expandedDomains, setExpandedDomains] = useState(new Set());
  const [showAddForm, setShowAddForm] = useState(false);

  // Default domain templates
  const defaultDomainTemplates = [
    {
      id: 'political',
      name: 'Political Influence',
      description: 'Influence in political circles and governance',
      min: 0,
      max: 100,
      defaultValue: 0,
      tiers: [
        { name: 'None', min: 0, max: 9, benefits: [], responsibilities: [] },
        { name: 'Minor', min: 10, max: 24, benefits: ['Basic political awareness'], responsibilities: [] },
        { name: 'Moderate', min: 25, max: 49, benefits: ['Local political connections'], responsibilities: ['Community involvement'] },
        { name: 'Major', min: 50, max: 74, benefits: ['Regional influence', 'Policy input'], responsibilities: ['Public service expectations'] },
        { name: 'Dominant', min: 75, max: 100, benefits: ['National influence', 'Policy control'], responsibilities: ['Leadership duties', 'Public accountability'] }
      ]
    },
    {
      id: 'social',
      name: 'Social Influence',
      description: 'Influence in social circles and cultural matters',
      min: 0,
      max: 100,
      defaultValue: 10,
      tiers: [
        { name: 'Outcast', min: 0, max: 9, benefits: [], responsibilities: [] },
        { name: 'Unknown', min: 10, max: 24, benefits: [], responsibilities: [] },
        { name: 'Known', min: 25, max: 49, benefits: ['Local reputation'], responsibilities: ['Social courtesy'] },
        { name: 'Popular', min: 50, max: 74, benefits: ['Wide social network', 'Cultural influence'], responsibilities: ['Social leadership'] },
        { name: 'Celebrity', min: 75, max: 100, benefits: ['Fame', 'Cultural trendsetting'], responsibilities: ['Public example', 'Social responsibility'] }
      ]
    },
    {
      id: 'economic',
      name: 'Economic Influence',
      description: 'Influence in trade, commerce, and financial matters',
      min: 0,
      max: 100,
      defaultValue: 5,
      tiers: [
        { name: 'Destitute', min: 0, max: 9, benefits: [], responsibilities: [] },
        { name: 'Poor', min: 10, max: 24, benefits: [], responsibilities: [] },
        { name: 'Middle Class', min: 25, max: 49, benefits: ['Financial stability'], responsibilities: ['Economic participation'] },
        { name: 'Wealthy', min: 50, max: 74, benefits: ['Investment power', 'Trade connections'], responsibilities: ['Economic leadership'] },
        { name: 'Elite', min: 75, max: 100, benefits: ['Market control', 'Financial dominance'], responsibilities: ['Economic stewardship', 'Job creation'] }
      ]
    },
    {
      id: 'military',
      name: 'Military Influence',
      description: 'Influence in military and defense matters',
      min: 0,
      max: 100,
      defaultValue: 0,
      tiers: [
        { name: 'Civilian', min: 0, max: 9, benefits: [], responsibilities: [] },
        { name: 'Recruit', min: 10, max: 24, benefits: ['Basic training'], responsibilities: ['Military service'] },
        { name: 'Soldier', min: 25, max: 49, benefits: ['Combat training', 'Unit authority'], responsibilities: ['Defense duties'] },
        { name: 'Officer', min: 50, max: 74, benefits: ['Command authority', 'Strategic planning'], responsibilities: ['Troop leadership', 'Mission success'] },
        { name: 'General', min: 75, max: 100, benefits: ['Military control', 'War planning'], responsibilities: ['National defense', 'Military strategy'] }
      ]
    },
    {
      id: 'religious',
      name: 'Religious Influence',
      description: 'Influence in religious and spiritual matters',
      min: 0,
      max: 100,
      defaultValue: 5,
      tiers: [
        { name: 'Secular', min: 0, max: 9, benefits: [], responsibilities: [] },
        { name: 'Faithful', min: 10, max: 24, benefits: ['Community support'], responsibilities: ['Religious observance'] },
        { name: 'Devout', min: 25, max: 49, benefits: ['Spiritual guidance', 'Religious community'], responsibilities: ['Faith leadership'] },
        { name: 'Clergy', min: 50, max: 74, benefits: ['Religious authority', 'Spiritual power'], responsibilities: ['Pastoral care', 'Religious duties'] },
        { name: 'High Priest', min: 75, max: 100, benefits: ['Religious control', 'Divine authority'], responsibilities: ['Spiritual leadership', 'Religious governance'] }
      ]
    }
  ];

  // Initialize local state when props change
  useEffect(() => {
    setLocalDomains(domains.length > 0 ? [...domains] : []);
  }, [domains]);

  // Toggle domain expansion
  const toggleDomainExpansion = (domainId) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  // Add a new domain from template
  const addDomainFromTemplate = (template) => {
    const newDomain = {
      ...template,
      id: `${template.id}_${Date.now()}`, // Ensure unique ID
    };
    const updatedDomains = [...localDomains, newDomain];
    setLocalDomains(updatedDomains);
    setShowAddForm(false);
    if (onDomainsChange) {
      onDomainsChange(updatedDomains);
    }
  };

  // Add a custom domain
  const addCustomDomain = () => {
    const newDomain = {
      id: `custom_${Date.now()}`,
      name: 'New Domain',
      description: 'Custom influence domain',
      min: 0,
      max: 100,
      defaultValue: 0,
      tiers: [
        { name: 'None', min: 0, max: 24, benefits: [], responsibilities: [] },
        { name: 'Moderate', min: 25, max: 49, benefits: [], responsibilities: [] },
        { name: 'High', min: 50, max: 74, benefits: [], responsibilities: [] },
        { name: 'Maximum', min: 75, max: 100, benefits: [], responsibilities: [] }
      ]
    };
    const updatedDomains = [...localDomains, newDomain];
    setLocalDomains(updatedDomains);
    setShowAddForm(false);
    setEditingDomain(newDomain.id);
    if (onDomainsChange) {
      onDomainsChange(updatedDomains);
    }
  };

  // Remove domain
  const removeDomain = (domainId) => {
    const updatedDomains = localDomains.filter(domain => domain.id !== domainId);
    setLocalDomains(updatedDomains);
    if (editingDomain === domainId) {
      setEditingDomain(null);
    }
    if (onDomainsChange) {
      onDomainsChange(updatedDomains);
    }
  };

  // Update domain
  const updateDomain = (domainId, updates) => {
    const updatedDomains = localDomains.map(domain =>
      domain.id === domainId ? { ...domain, ...updates } : domain
    );
    setLocalDomains(updatedDomains);
    if (onDomainsChange) {
      onDomainsChange(updatedDomains);
    }
  };

  // Update domain tier
  const updateDomainTier = (domainId, tierIndex, updates) => {
    const updatedDomains = localDomains.map(domain => {
      if (domain.id === domainId) {
        const newTiers = [...domain.tiers];
        newTiers[tierIndex] = { ...newTiers[tierIndex], ...updates };
        return { ...domain, tiers: newTiers };
      }
      return domain;
    });
    setLocalDomains(updatedDomains);
    if (onDomainsChange) {
      onDomainsChange(updatedDomains);
    }
  };

  // Add tier to domain
  const addTier = (domainId) => {
    const domain = localDomains.find(d => d.id === domainId);
    if (!domain) return;

    const lastTier = domain.tiers[domain.tiers.length - 1];
    const newTier = {
      name: 'New Tier',
      min: lastTier ? lastTier.max + 1 : 0,
      max: lastTier ? Math.min(lastTier.max + 25, domain.max) : 25,
      benefits: [],
      responsibilities: []
    };

    const updatedTiers = [...domain.tiers, newTier];
    updateDomain(domainId, { tiers: updatedTiers });
  };

  // Remove tier from domain
  const removeTier = (domainId, tierIndex) => {
    const domain = localDomains.find(d => d.id === domainId);
    if (!domain || domain.tiers.length <= 1) return;

    const updatedTiers = domain.tiers.filter((_, index) => index !== tierIndex);
    updateDomain(domainId, { tiers: updatedTiers });
  };

  // Validate domain configuration
  const validateDomain = (domain) => {
    const errors = [];
    
    if (!domain.name.trim()) {
      errors.push('Domain name is required');
    }
    
    if (domain.min >= domain.max) {
      errors.push('Minimum value must be less than maximum value');
    }
    
    if (domain.defaultValue < domain.min || domain.defaultValue > domain.max) {
      errors.push('Default value must be within min/max range');
    }
    
    // Validate tiers
    for (let i = 0; i < domain.tiers.length; i++) {
      const tier = domain.tiers[i];
      if (!tier.name.trim()) {
        errors.push(`Tier ${i + 1} name is required`);
      }
      if (tier.min >= tier.max) {
        errors.push(`Tier ${i + 1}: minimum must be less than maximum`);
      }
    }
    
    return errors;
  };

  return (
    <div className={`influence-domain-editor bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Influence Domains</h3>
            <p className="text-sm text-gray-600">
              Configure influence domains that characters can gain power in
            </p>
          </div>
          {!isReadOnly && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Domain
            </button>
          )}
        </div>
      </div>

      {/* Add Domain Form */}
      {showAddForm && !isReadOnly && (
        <div className="p-4 bg-blue-50 border-b">
          <h4 className="font-semibold text-gray-900 mb-3">Add New Domain</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose from Template:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {defaultDomainTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => addDomainFromTemplate(template)}
                    className="p-2 text-left bg-white border rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-600">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={addCustomDomain}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Create Custom Domain
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Domains List */}
      <div className="divide-y">
        {localDomains.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-2">No influence domains configured</div>
            <div className="text-sm">Add domains to define how characters gain influence</div>
          </div>
        ) : (
          localDomains.map(domain => (
            <DomainCard
              key={domain.id}
              domain={domain}
              isEditing={editingDomain === domain.id}
              isExpanded={expandedDomains.has(domain.id)}
              isReadOnly={isReadOnly}
              onToggleExpansion={() => toggleDomainExpansion(domain.id)}
              onStartEdit={() => setEditingDomain(domain.id)}
              onStopEdit={() => setEditingDomain(null)}
              onUpdate={(updates) => updateDomain(domain.id, updates)}
              onRemove={() => removeDomain(domain.id)}
              onUpdateTier={(tierIndex, updates) => updateDomainTier(domain.id, tierIndex, updates)}
              onAddTier={() => addTier(domain.id)}
              onRemoveTier={(tierIndex) => removeTier(domain.id, tierIndex)}
              validationErrors={validateDomain(domain)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Individual Domain Card Component
const DomainCard = ({
  domain,
  isEditing,
  isExpanded,
  isReadOnly,
  onToggleExpansion,
  onStartEdit,
  onStopEdit,
  onUpdate,
  onRemove,
  onUpdateTier,
  onAddTier,
  onRemoveTier,
  validationErrors
}) => {
  const [localDomain, setLocalDomain] = useState(domain);

  useEffect(() => {
    setLocalDomain(domain);
  }, [domain]);

  const handleSave = () => {
    if (validationErrors.length === 0) {
      onUpdate(localDomain);
      onStopEdit();
    }
  };

  const handleCancel = () => {
    setLocalDomain(domain);
    onStopEdit();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onToggleExpansion}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={localDomain.name}
                  onChange={(e) => setLocalDomain({...localDomain, name: e.target.value})}
                  className="font-semibold text-gray-900 bg-transparent border-b border-blue-500 focus:outline-none focus:border-blue-700"
                  placeholder="Domain name"
                />
                <textarea
                  value={localDomain.description}
                  onChange={(e) => setLocalDomain({...localDomain, description: e.target.value})}
                  className="text-sm text-gray-600 bg-transparent border border-blue-300 rounded p-2 w-full resize-none"
                  placeholder="Domain description"
                  rows="2"
                />
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-gray-900">{domain.name}</h4>
                <p className="text-sm text-gray-600">{domain.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Range: {domain.min}-{domain.max} | Default: {domain.defaultValue} | {domain.tiers.length} tiers
                </div>
              </div>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={validationErrors.length > 0}
                  className="p-1 text-green-600 hover:text-green-700 disabled:text-gray-400"
                  title="Save changes"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-gray-600 hover:text-gray-700"
                  title="Cancel editing"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onStartEdit}
                  className="p-1 text-blue-600 hover:text-blue-700"
                  title="Edit domain"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={onRemove}
                  className="p-1 text-red-600 hover:text-red-700"
                  title="Remove domain"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Expanded Domain Details */}
      {isExpanded && (
        <div className="mt-4 pl-8 space-y-4">
          {/* Domain Configuration */}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Value
                </label>
                <input
                  type="number"
                  value={localDomain.min}
                  onChange={(e) => setLocalDomain({...localDomain, min: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Value
                </label>
                <input
                  type="number"
                  value={localDomain.max}
                  onChange={(e) => setLocalDomain({...localDomain, max: parseInt(e.target.value) || 100})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Value
                </label>
                <input
                  type="number"
                  value={localDomain.defaultValue}
                  onChange={(e) => setLocalDomain({...localDomain, defaultValue: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Tiers */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium text-gray-900">Influence Tiers</h5>
              {isEditing && (
                <button
                  onClick={onAddTier}
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Plus size={12} />
                  Add Tier
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {(isEditing ? localDomain.tiers : domain.tiers).map((tier, index) => (
                <TierCard
                  key={index}
                  tier={tier}
                  index={index}
                  isEditing={isEditing}
                  canRemove={domain.tiers.length > 1}
                  onUpdate={(updates) => onUpdateTier(index, updates)}
                  onRemove={() => onRemoveTier(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual Tier Card Component
const TierCard = ({ tier, index, isEditing, canRemove, onUpdate, onRemove }) => {
  const [localTier, setLocalTier] = useState(tier);

  useEffect(() => {
    setLocalTier(tier);
  }, [tier]);

  const handleUpdate = (field, value) => {
    const updatedTier = { ...localTier, [field]: value };
    setLocalTier(updatedTier);
    onUpdate(updatedTier);
  };

  const handleArrayUpdate = (field, index, value, action = 'update') => {
    const currentArray = [...localTier[field]];
    
    if (action === 'add') {
      currentArray.push(value);
    } else if (action === 'remove') {
      currentArray.splice(index, 1);
    } else {
      currentArray[index] = value;
    }
    
    handleUpdate(field, currentArray);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={localTier.name}
                onChange={(e) => handleUpdate('name', e.target.value)}
                placeholder="Tier name"
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                value={localTier.min}
                onChange={(e) => handleUpdate('min', parseInt(e.target.value) || 0)}
                placeholder="Min"
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                value={localTier.max}
                onChange={(e) => handleUpdate('max', parseInt(e.target.value) || 0)}
                placeholder="Max"
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div>
              <span className="font-medium text-gray-900">{tier.name}</span>
              <span className="text-sm text-gray-600 ml-2">
                ({tier.min}-{tier.max})
              </span>
            </div>
          )}
        </div>
        
        {isEditing && canRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-red-600 hover:text-red-700 ml-2"
            title="Remove tier"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Benefits and Responsibilities */}
      {isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Benefits
            </label>
            <div className="space-y-1">
              {localTier.benefits.map((benefit, benefitIndex) => (
                <div key={benefitIndex} className="flex gap-1">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleArrayUpdate('benefits', benefitIndex, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Benefit"
                  />
                  <button
                    onClick={() => handleArrayUpdate('benefits', benefitIndex, null, 'remove')}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleArrayUpdate('benefits', -1, '', 'add')}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <Plus size={10} />
                Add Benefit
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Responsibilities
            </label>
            <div className="space-y-1">
              {localTier.responsibilities.map((responsibility, respIndex) => (
                <div key={respIndex} className="flex gap-1">
                  <input
                    type="text"
                    value={responsibility}
                    onChange={(e) => handleArrayUpdate('responsibilities', respIndex, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Responsibility"
                  />
                  <button
                    onClick={() => handleArrayUpdate('responsibilities', respIndex, null, 'remove')}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleArrayUpdate('responsibilities', -1, '', 'add')}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <Plus size={10} />
                Add Responsibility
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read-only Benefits and Responsibilities */}
      {!isEditing && (tier.benefits.length > 0 || tier.responsibilities.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-xs">
          {tier.benefits.length > 0 && (
            <div>
              <div className="font-medium text-gray-700 mb-1">Benefits:</div>
              <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                {tier.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
          
          {tier.responsibilities.length > 0 && (
            <div>
              <div className="font-medium text-gray-700 mb-1">Responsibilities:</div>
              <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                {tier.responsibilities.map((responsibility, index) => (
                  <li key={index}>{responsibility}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfluenceDomainEditor;