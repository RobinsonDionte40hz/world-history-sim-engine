import React, { useState } from 'react';
import { SEARCH_OPERATORS, RESULT_TYPES } from '../../application/services/SearchEngine';
import './FilterBuilder.css';

const FilterBuilder = ({ filters, onFiltersChange, resultTypes, onResultTypesChange }) => {
  const [newFilter, setNewFilter] = useState({
    field: '',
    operator: SEARCH_OPERATORS.CONTAINS,
    value: '',
    boost: 1.0,
    fuzzy: false,
    caseSensitive: false
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Available fields for different result types
  const fieldOptions = {
    [RESULT_TYPES.CHARACTER]: [
      { value: 'name', label: 'Name' },
      { value: 'description', label: 'Description' },
      { value: 'age', label: 'Age' },
      { value: 'occupation', label: 'Occupation' },
      { value: 'location', label: 'Location' },
      { value: 'traits', label: 'Traits' },
      { value: 'skills', label: 'Skills' }
    ],
    [RESULT_TYPES.SETTLEMENT]: [
      { value: 'name', label: 'Name' },
      { value: 'description', label: 'Description' },
      { value: 'type', label: 'Type' },
      { value: 'populationCapacity', label: 'Population' },
      { value: 'founded', label: 'Founded Date' },
      { value: 'location', label: 'Location' }
    ],
    [RESULT_TYPES.EVENT]: [
      { value: 'title', label: 'Title' },
      { value: 'description', label: 'Description' },
      { value: 'date', label: 'Date' },
      { value: 'location', label: 'Location' },
      { value: 'importance', label: 'Importance' },
      { value: 'participants', label: 'Participants' }
    ],
    [RESULT_TYPES.RELATIONSHIP]: [
      { value: 'sourceName', label: 'Source Name' },
      { value: 'targetName', label: 'Target Name' },
      { value: 'type', label: 'Relationship Type' },
      { value: 'strength', label: 'Strength' },
      { value: 'description', label: 'Description' }
    ],
    [RESULT_TYPES.INTERACTION]: [
      { value: 'name', label: 'Name' },
      { value: 'description', label: 'Description' },
      { value: 'type', label: 'Type' },
      { value: 'participants', label: 'Participants' },
      { value: 'date', label: 'Date' }
    ]
  };

  // Get all unique fields across selected result types
  const getAvailableFields = () => {
    const fields = new Set();
    resultTypes.forEach(type => {
      if (fieldOptions[type]) {
        fieldOptions[type].forEach(field => fields.add(JSON.stringify(field)));
      }
    });
    return Array.from(fields).map(field => JSON.parse(field));
  };

  const availableFields = getAvailableFields();

  // Handle adding a new filter
  const handleAddFilter = () => {
    if (!newFilter.field || !newFilter.value) {
      return;
    }

    const filterToAdd = { ...newFilter };
    onFiltersChange([...filters, filterToAdd]);

    // Reset form
    setNewFilter({
      field: '',
      operator: SEARCH_OPERATORS.CONTAINS,
      value: '',
      boost: 1.0,
      fuzzy: false,
      caseSensitive: false
    });
  };

  // Handle removing a filter
  const handleRemoveFilter = (index) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onFiltersChange(newFilters);
  };

  // Handle result type toggle
  const handleResultTypeToggle = (type) => {
    const newResultTypes = resultTypes.includes(type)
      ? resultTypes.filter(t => t !== type)
      : [...resultTypes, type];
    onResultTypesChange(newResultTypes);
  };

  // Get operator options based on field type
  const getOperatorOptions = (field) => {
    const numericFields = ['age', 'populationCapacity', 'strength', 'importance'];
    const dateFields = ['date', 'founded'];

    if (numericFields.includes(field)) {
      return [
        { value: SEARCH_OPERATORS.EQUALS, label: 'Equals' },
        { value: SEARCH_OPERATORS.GREATER_THAN, label: 'Greater Than' },
        { value: SEARCH_OPERATORS.LESS_THAN, label: 'Less Than' },
        { value: SEARCH_OPERATORS.BETWEEN, label: 'Between' }
      ];
    }

    if (dateFields.includes(field)) {
      return [
        { value: SEARCH_OPERATORS.EQUALS, label: 'Equals' },
        { value: SEARCH_OPERATORS.GREATER_THAN, label: 'After' },
        { value: SEARCH_OPERATORS.LESS_THAN, label: 'Before' },
        { value: SEARCH_OPERATORS.BETWEEN, label: 'Between' }
      ];
    }

    return [
      { value: SEARCH_OPERATORS.CONTAINS, label: 'Contains' },
      { value: SEARCH_OPERATORS.EQUALS, label: 'Equals' },
      { value: SEARCH_OPERATORS.FUZZY, label: 'Fuzzy Match' },
      { value: SEARCH_OPERATORS.REGEX, label: 'Regex' }
    ];
  };

  // Render filter input based on operator
  const renderFilterValueInput = (filter, onChange) => {
    const operator = filter.operator;

    if (operator === SEARCH_OPERATORS.BETWEEN) {
      return (
        <div className="between-inputs">
          <input
            type="text"
            placeholder="Min value"
            value={filter.value[0] || ''}
            onChange={(e) => {
              const newValue = [...(filter.value || ['', ''])];
              newValue[0] = e.target.value;
              onChange({ ...filter, value: newValue });
            }}
            className="filter-input"
          />
          <span className="between-separator">to</span>
          <input
            type="text"
            placeholder="Max value"
            value={filter.value[1] || ''}
            onChange={(e) => {
              const newValue = [...(filter.value || ['', ''])];
              newValue[1] = e.target.value;
              onChange({ ...filter, value: newValue });
            }}
            className="filter-input"
          />
        </div>
      );
    }

    return (
      <input
        type="text"
        placeholder="Enter value"
        value={filter.value}
        onChange={(e) => onChange({ ...filter, value: e.target.value })}
        className="filter-input"
      />
    );
  };

  return (
    <div className="filter-builder">
      <div className="filter-builder-header">
        <h3>Search Filters</h3>
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </button>
      </div>

      {/* Result Type Selection */}
      <div className="result-types-section">
        <h4>Search in:</h4>
        <div className="result-type-checkboxes">
          {Object.values(RESULT_TYPES).map(type => (
            <label key={type} className="result-type-label">
              <input
                type="checkbox"
                checked={resultTypes.includes(type)}
                onChange={() => handleResultTypeToggle(type)}
              />
              <span className="result-type-name">
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Existing Filters */}
      {filters.length > 0 && (
        <div className="existing-filters">
          <h4>Active Filters:</h4>
          <div className="filters-list">
            {filters.map((filter, index) => (
              <div key={index} className="filter-item">
                <div className="filter-content">
                  <span className="filter-field">{filter.field}</span>
                  <span className="filter-operator">
                    {Object.keys(SEARCH_OPERATORS).find(key =>
                      SEARCH_OPERATORS[key] === filter.operator
                    )}
                  </span>
                  <span className="filter-value">
                    {Array.isArray(filter.value)
                      ? filter.value.join(' to ')
                      : filter.value
                    }
                  </span>
                  {filter.boost !== 1.0 && (
                    <span className="filter-boost">×{filter.boost}</span>
                  )}
                </div>
                <button
                  className="remove-filter-button"
                  onClick={() => handleRemoveFilter(index)}
                  title="Remove filter"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Filter */}
      <div className="add-filter-section">
        <h4>Add Filter:</h4>
        <div className="add-filter-form">
          <select
            value={newFilter.field}
            onChange={(e) => setNewFilter({
              ...newFilter,
              field: e.target.value,
              operator: SEARCH_OPERATORS.CONTAINS // Reset operator when field changes
            })}
            className="filter-select"
          >
            <option value="">Select field...</option>
            {availableFields.map(field => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>

          <select
            value={newFilter.operator}
            onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value })}
            className="filter-select"
            disabled={!newFilter.field}
          >
            {newFilter.field && getOperatorOptions(newFilter.field).map(op => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>

          {renderFilterValueInput(newFilter, setNewFilter)}

          {showAdvanced && (
            <>
              <div className="advanced-options">
                <label className="advanced-label">
                  <input
                    type="checkbox"
                    checked={newFilter.fuzzy}
                    onChange={(e) => setNewFilter({
                      ...newFilter,
                      fuzzy: e.target.checked
                    })}
                  />
                  Fuzzy matching
                </label>

                <label className="advanced-label">
                  <input
                    type="checkbox"
                    checked={newFilter.caseSensitive}
                    onChange={(e) => setNewFilter({
                      ...newFilter,
                      caseSensitive: e.target.checked
                    })}
                  />
                  Case sensitive
                </label>

                <div className="boost-input">
                  <label>Boost:</label>
                  <input
                    type="number"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={newFilter.boost}
                    onChange={(e) => setNewFilter({
                      ...newFilter,
                      boost: parseFloat(e.target.value) || 1.0
                    })}
                    className="boost-number-input"
                  />
                </div>
              </div>
            </>
          )}

          <button
            className="add-filter-button"
            onClick={handleAddFilter}
            disabled={!newFilter.field || !newFilter.value}
          >
            Add Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export { FilterBuilder };
