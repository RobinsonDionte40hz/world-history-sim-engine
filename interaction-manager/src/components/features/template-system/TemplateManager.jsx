import React, { useState, useEffect } from 'react';
import styles from './TemplateManager.module.css';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

const TemplateManager = ({ engine }) => {
  const [templates, setTemplates] = useState({
    characters: [],
    nodes: [],
    interactions: [],
    events: [],
    groups: [],
    items: []
  });
  const [selectedType, setSelectedType] = useState('characters');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // Load templates when component mounts
  useEffect(() => {
    if (engine) {
      const loadedTemplates = engine.templateManager.getAllTemplates();
      setTemplates(loadedTemplates);
    }
  }, [engine]);

  // Handle template type selection
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData(template);
    setIsEditing(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!engine) return;

    try {
      if (selectedTemplate) {
        // Update existing template
        await engine.templateManager.updateTemplate(selectedType, selectedTemplate.id, formData);
      } else {
        // Create new template
        await engine.templateManager.createTemplate(selectedType, formData);
      }

      // Refresh templates
      const updatedTemplates = engine.templateManager.getAllTemplates();
      setTemplates(updatedTemplates);
      setIsEditing(false);
      setSelectedTemplate(null);
      setFormData({});
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  // Handle template deletion
  const handleDelete = async (templateId) => {
    if (!engine) return;
    setTemplateToDelete(templateId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!engine || !templateToDelete) return;

    try {
      await engine.templateManager.deleteTemplate(selectedType, templateToDelete);
      const updatedTemplates = engine.templateManager.getAllTemplates();
      setTemplates(updatedTemplates);
      setSelectedTemplate(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
    setShowConfirmDialog(false);
    setTemplateToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setTemplateToDelete(null);
  };

  // Render template form based on type
  const renderTemplateForm = () => {
    const baseFields = {
      name: { type: 'text', label: 'Name' },
      description: { type: 'textarea', label: 'Description' }
    };

    const typeSpecificFields = {
      characters: {
        personality: { type: 'select', label: 'Personality Type', options: ['introvert', 'extrovert', 'balanced'] },
        consciousness: { type: 'select', label: 'Consciousness Level', options: ['low', 'medium', 'high'] },
        attributes: { type: 'object', label: 'Base Attributes' }
      },
      nodes: {
        type: { type: 'select', label: 'Node Type', options: ['location', 'organization', 'event'] },
        connections: { type: 'array', label: 'Possible Connections' },
        attributes: { type: 'object', label: 'Base Attributes' }
      },
      interactions: {
        type: { type: 'select', label: 'Interaction Type', options: ['social', 'combat', 'trade', 'quest'] },
        participants: { type: 'array', label: 'Required Participants' },
        conditions: { type: 'object', label: 'Conditions' },
        outcomes: { type: 'array', label: 'Possible Outcomes' }
      },
      events: {
        type: { type: 'select', label: 'Event Type', options: ['natural', 'social', 'political', 'economic'] },
        scale: { type: 'select', label: 'Event Scale', options: ['local', 'regional', 'global'] },
        duration: { type: 'number', label: 'Duration (years)' },
        effects: { type: 'array', label: 'Effects' }
      },
      groups: {
        type: { type: 'select', label: 'Group Type', options: ['faction', 'family', 'organization'] },
        hierarchy: { type: 'object', label: 'Hierarchy' },
        goals: { type: 'array', label: 'Group Goals' },
        attributes: { type: 'object', label: 'Group Attributes' }
      },
      items: {
        type: { type: 'select', label: 'Item Type', options: ['weapon', 'artifact', 'resource', 'tool'] },
        rarity: { type: 'select', label: 'Rarity', options: ['common', 'uncommon', 'rare', 'legendary'] },
        effects: { type: 'array', label: 'Effects' },
        requirements: { type: 'object', label: 'Requirements' }
      }
    };

    const fields = { ...baseFields, ...typeSpecificFields[selectedType] };

    return (
      <form onSubmit={handleSubmit} className={styles.form}>
        {Object.entries(fields).map(([key, field]) => (
          <div key={key} className={styles.formGroup}>
            <label htmlFor={key}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={key}
                name={key}
                value={formData[key] || ''}
                onChange={handleInputChange}
                rows={4}
              />
            ) : field.type === 'select' ? (
              <select
                id={key}
                name={key}
                value={formData[key] || ''}
                onChange={handleInputChange}
              >
                <option value="">Select {field.label}</option>
                {field.options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'object' ? (
              <textarea
                id={key}
                name={key}
                value={JSON.stringify(formData[key] || {}, null, 2)}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter JSON object"
              />
            ) : field.type === 'array' ? (
              <textarea
                id={key}
                name={key}
                value={JSON.stringify(formData[key] || [], null, 2)}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter JSON array"
              />
            ) : (
              <input
                type={field.type}
                id={key}
                name={key}
                value={formData[key] || ''}
                onChange={handleInputChange}
              />
            )}
          </div>
        ))}
        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton}>
            <Save size={16} />
            {selectedTemplate ? 'Update Template' : 'Create Template'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setSelectedTemplate(null);
              setFormData({});
            }}
            className={styles.cancelButton}
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Template Manager</h1>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setFormData({});
            setIsEditing(true);
          }}
          className={styles.addButton}
        >
          <Plus size={16} />
          New Template
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          {Object.keys(templates).map(type => (
            <button
              key={type}
              className={`${styles.typeButton} ${selectedType === type ? styles.active : ''}`}
              onClick={() => handleTypeSelect(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.main}>
          {isEditing ? (
            renderTemplateForm()
          ) : (
            <div className={styles.templateList}>
              {templates[selectedType].map(template => (
                <div key={template.id} className={styles.templateCard}>
                  <div className={styles.templateHeader}>
                    <h3>{template.name}</h3>
                    <div className={styles.templateActions}>
                      <button
                        onClick={() => handleTemplateSelect(template)}
                        className={styles.editButton}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className={styles.deleteButton}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p>{template.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className={styles.confirmDialog}>
          <div className={styles.confirmDialogContent}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this template?</p>
            <div className={styles.confirmDialogButtons}>
              <button onClick={confirmDelete} className={styles.confirmButton}>
                Delete
              </button>
              <button onClick={cancelDelete} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager; 