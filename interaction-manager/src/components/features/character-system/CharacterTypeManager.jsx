import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Info, ChevronDown, ChevronUp, Tag, Users, Star, Heart, Brain, Search, Grid, List, Eye } from 'lucide-react';
import { RaceSystem } from '../../../systems/character/RaceSystem';
import styles from './CharacterTypeManager.module.css';

const CharacterTypeManager = () => {
  const [characterTypes, setCharacterTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [raceSystem] = useState(new RaceSystem());
  const [expandedType, setExpandedType] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Load character types from localStorage on mount
  useEffect(() => {
    const savedTypes = localStorage.getItem('characterTypes');
    if (savedTypes) {
      setCharacterTypes(JSON.parse(savedTypes));
    }
  }, []);

  // Save character types to localStorage when they change
  useEffect(() => {
    localStorage.setItem('characterTypes', JSON.stringify(characterTypes));
  }, [characterTypes]);

  const addCharacterType = () => {
    const newType = {
      id: Date.now().toString(),
      name: 'New Character Type',
      description: '',
      color: '#4A90E2',
      category: 'default',
      race: null,
      personalityTraits: [],
      cognitiveTraits: [],
      emotionalTendencies: [],
      attributes: {},
      skills: [],
      tags: []
    };
    setEditingType(newType);
    setIsEditing(true);
  };

  const editCharacterType = (type) => {
    setEditingType(type);
    setIsEditing(true);
  };

  const deleteCharacterType = (id) => {
    if (window.confirm('Are you sure you want to delete this character type?')) {
      setCharacterTypes(characterTypes.filter(type => type.id !== id));
    }
  };

  const handleSave = (updatedType) => {
    if (characterTypes.some(type => type.id === updatedType.id)) {
      // Update existing type
      setCharacterTypes(characterTypes.map(type => 
        type.id === updatedType.id ? updatedType : type
      ));
    } else {
      // Add new type
      setCharacterTypes([...characterTypes, updatedType]);
    }
    setIsEditing(false);
    setEditingType(null);
  };

  const handleRaceSelect = (typeId, raceId, subraceName = null) => {
    const race = raceSystem.getRace(raceId);
    const updatedTypes = characterTypes.map(type => {
      if (type.id === typeId) {
        return {
          ...type,
          race: {
            id: race.id,
            name: race.name,
            description: race.description,
            subrace: subraceName ? raceSystem.getSubrace(raceId, subraceName) : null,
            traits: race.traits,
            lifespan: race.lifespan
          }
        };
      }
      return type;
    });
    setCharacterTypes(updatedTypes);
  };

  const toggleExpand = (typeId) => {
    setExpandedType(expandedType === typeId ? null : typeId);
  };

  const filteredTypes = characterTypes
    .filter(type => 
      type.name.toLowerCase().includes(filter.toLowerCase()) ||
      type.description.toLowerCase().includes(filter.toLowerCase()) ||
      type.race?.name.toLowerCase().includes(filter.toLowerCase()) ||
      type.tags?.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'race':
          return (a.race?.name || '').localeCompare(b.race?.name || '');
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const renderCharacterTypeCard = (type) => {
    const isExpanded = expandedType === type.id;

    return (
      <div key={type.id} className={styles.characterCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{type.name}</h3>
          <div className={styles.cardActions}>
            <button 
              className={`${styles.actionButton} ${styles.view}`}
              onClick={() => toggleExpand(type.id)}
            >
              <Eye size={16} />
            </button>
            <button 
              className={`${styles.actionButton} ${styles.edit}`}
              onClick={(e) => {
                e.stopPropagation();
                editCharacterType(type);
              }}
            >
              <Edit size={16} />
            </button>
            <button 
              className={`${styles.actionButton} ${styles.delete}`}
              onClick={(e) => {
                e.stopPropagation();
                deleteCharacterType(type.id);
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <p className={styles.cardDescription}>{type.description}</p>
        <div className={styles.cardMeta}>
          {type.race && (
            <span className={styles.tag}>
              {type.race.name}
            </span>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className={styles.expandedContent}>
            {/* Race Information */}
            {type.race && (
              <div className={styles.raceInfo}>
                <div className={styles.raceInfoItem}>
                  <Users size={16} />
                  <span>Race: {type.race.name}</span>
                  {type.race.subrace && (
                    <span className={styles.raceInfoSubrace}>({type.race.subrace.name})</span>
                  )}
                </div>
                <div className={styles.raceTraits}>
                  {type.race.traits?.map(trait => (
                    <span key={trait.name} className={styles.raceTrait}>
                      {trait.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Personality Traits */}
            {type.personalityTraits?.length > 0 && (
              <div className={styles.personalityTraits}>
                <div className={styles.personalityTraitsItem}>
                  <Heart size={16} />
                  <span>Personality Traits</span>
                </div>
                <div className={styles.personalityTraitsList}>
                  {type.personalityTraits.map(trait => (
                    <span key={trait.id} className={styles.personalityTrait}>
                      {trait.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cognitive Traits */}
            {type.cognitiveTraits?.length > 0 && (
              <div className={styles.cognitiveTraits}>
                <div className={styles.cognitiveTraitsItem}>
                  <Brain size={16} />
                  <span>Cognitive Traits</span>
                </div>
                <div className={styles.cognitiveTraitsList}>
                  {type.cognitiveTraits.map(trait => (
                    <span key={trait.id} className={styles.cognitiveTrait}>
                      {trait.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Emotional Tendencies */}
            {type.emotionalTendencies?.length > 0 && (
              <div className={styles.emotionalTendencies}>
                <div className={styles.emotionalTendenciesItem}>
                  <Star size={16} />
                  <span>Emotional Tendencies</span>
                </div>
                <div className={styles.emotionalTendenciesList}>
                  {type.emotionalTendencies.map(tendency => (
                    <span key={tendency.id} className={styles.emotionalTendency}>
                      {tendency.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {Object.keys(type.attributes || {}).length > 0 && (
              <div className={styles.attributes}>
                <div className={styles.attributesTitle}>Attributes</div>
                <div className={styles.attributesList}>
                  {Object.entries(type.attributes).map(([key, value]) => (
                    <div key={key} className={styles.attributeItem}>
                      <span className={styles.attributeKey}>{key}</span>
                      <span className={styles.attributeValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {type.skills?.length > 0 && (
              <div className={styles.skills}>
                <div className={styles.skillsTitle}>Skills</div>
                <div className={styles.skillsList}>
                  {type.skills.map(skill => (
                    <span key={skill} className={styles.skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderEditForm = () => {
    if (!editingType) return null;

    const handleFormSubmit = (e) => {
      e.preventDefault();
      handleSave(editingType);
    };

    const handleCancel = () => {
      setIsEditing(false);
      setEditingType(null);
    };

    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Edit Character Type</h2>
          
          <form className={styles.form} onSubmit={handleFormSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Name</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingType.name}
                onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                className={styles.formInput}
                value={editingType.description}
                onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Color</label>
              <input
                type="color"
                className={styles.formInput}
                value={editingType.color}
                onChange={(e) => setEditingType({ ...editingType, color: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingType.category}
                onChange={(e) => setEditingType({ ...editingType, category: e.target.value })}
              />
            </div>

            {/* Race Selection */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Race</label>
              <select
                className={styles.formInput}
                value={editingType.race?.id || ''}
                onChange={(e) => handleRaceSelect(editingType.id, e.target.value)}
              >
                <option value="">Select a race</option>
                {raceSystem.getAllRaces().map(race => (
                  <option key={race.id} value={race.id}>{race.name}</option>
                ))}
              </select>
            </div>

            {/* Subrace Selection */}
            {editingType.race && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subrace</label>
                <select
                  className={styles.formInput}
                  value={editingType.race.subrace?.name || ''}
                  onChange={(e) => handleRaceSelect(editingType.id, editingType.race.id, e.target.value)}
                >
                  <option value="">Select a subrace</option>
                  {raceSystem.getRace(editingType.race.id).subraces.map(subrace => (
                    <option key={subrace.name} value={subrace.name}>{subrace.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tags */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tags</label>
              <input
                type="text"
                className={styles.formInput}
                value={editingType.tags?.join(', ') || ''}
                onChange={(e) => setEditingType({ 
                  ...editingType, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className={styles.cardActions}>
              <button 
                type="submit" 
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                Save
              </button>
              <button 
                type="button" 
                className={styles.button}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Character Types</h1>
        <button className={styles.button} onClick={addCharacterType}>
          <Plus size={18} />
          New Character Type
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.characterList}>
          {filteredTypes.map(type => renderCharacterTypeCard(type))}
        </div>
      </div>

      {isEditing && renderEditForm()}
    </div>
  );
};

export default CharacterTypeManager; 