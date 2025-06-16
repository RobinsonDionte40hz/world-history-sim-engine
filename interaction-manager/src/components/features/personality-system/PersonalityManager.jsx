import React, { useState, useEffect } from 'react';
import './../../../PersonalityManager.css';

function PersonalityManager({ personalitySystem }) {
    const [activeTab, setActiveTab] = useState('attributes');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        baseValue: 10,
        influence: {}
    });

    useEffect(() => {
        if (editMode) {
            setFormData({
                id: '',
                name: '',
                description: '',
                baseValue: 10,
                influence: {}
            });
        }
    }, [editMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            personalitySystem.updateTrait(formData.id, formData);
        } else {
            personalitySystem.createTrait(formData);
        }
        setEditMode(false);
        setFormData({
            id: '',
            name: '',
            description: '',
            baseValue: 10,
            influence: {}
        });
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditMode(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            if (activeTab === 'attributes') {
                personalitySystem.deleteAttribute(id);
            } else {
                personalitySystem.deleteTrait(id);
            }
        }
    };

    const handleAttributeChange = (id, newValue) => {
        const attribute = personalitySystem.getAttribute(id);
        if (attribute) {
            personalitySystem.updateAttribute(id, { baseValue: parseInt(newValue) });
        }
    };

    const renderAttributeForm = () => (
        <form onSubmit={handleSubmit} className="attribute-form">
            <div className="form-group">
                <label htmlFor="id">ID:</label>
                <input
                    type="text"
                    id="id"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    required
                    disabled={editMode}
                />
            </div>
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="baseValue">Base Value:</label>
                <input
                    type="number"
                    id="baseValue"
                    name="baseValue"
                    value={formData.baseValue}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                />
            </div>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    {editMode ? 'Update Attribute' : 'Create Attribute'}
                </button>
                {editMode && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditMode(false)}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );

    const renderAttributeList = () => {
        const attributes = personalitySystem.getAllAttributes();
        return (
            <div className="attribute-list">
                {attributes.map(attr => (
                    <div key={attr.id} className="attribute-item">
                        <div className="attribute-header">
                            <h3>{attr.name}</h3>
                            <div className="attribute-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleEdit(attr)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(attr.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div className="attribute-details">
                            <div className="detail-group">
                                <label>ID:</label>
                                <span>{attr.id}</span>
                            </div>
                            <div className="detail-group">
                                <label>Description:</label>
                                <span>{attr.description}</span>
                            </div>
                            <div className="detail-group">
                                <label>Base Value:</label>
                                <input
                                    type="number"
                                    value={attr.baseValue}
                                    onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                    min="1"
                                    max="20"
                                    className="attribute-value-input"
                                />
                            </div>
                            <div className="detail-group">
                                <label>Modifier:</label>
                                <span className={`modifier ${attr.modifier >= 0 ? 'positive' : 'negative'}`}>
                                    {attr.modifier >= 0 ? '+' : ''}{attr.modifier}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTraitForm = () => (
        <form onSubmit={handleSubmit} className="trait-form">
            <div className="form-group">
                <label htmlFor="id">ID:</label>
                <input
                    type="text"
                    id="id"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    required
                    disabled={editMode}
                />
            </div>
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="baseValue">Base Value:</label>
                <input
                    type="number"
                    id="baseValue"
                    name="baseValue"
                    value={formData.baseValue}
                    onChange={handleInputChange}
                    min="-100"
                    max="100"
                    required
                />
            </div>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    {editMode ? 'Update Trait' : 'Create Trait'}
                </button>
                {editMode && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditMode(false)}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );

    const renderTraitList = () => {
        const traits = personalitySystem.getAllTraits();
        if (traits.length === 0) {
            return (
                <div className="empty-state">
                    <p>No personality traits defined yet.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setEditMode(false)}
                    >
                        Create First Trait
                    </button>
                </div>
            );
        }

        return (
            <div className="trait-list">
                {traits.map(trait => (
                    <div key={trait.id} className="trait-item">
                        <div className="trait-header">
                            <h3>{trait.name}</h3>
                            <div className="trait-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleEdit(trait)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(trait.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div className="trait-details">
                            <div className="detail-group">
                                <label>ID:</label>
                                <span>{trait.id}</span>
                            </div>
                            <div className="detail-group">
                                <label>Description:</label>
                                <span>{trait.description}</span>
                            </div>
                            <div className="detail-group">
                                <label>Base Value:</label>
                                <span>{trait.baseValue}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="personality-manager">
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'attributes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('attributes')}
                >
                    D&D Attributes
                </button>
                <button
                    className={`tab ${activeTab === 'traits' ? 'active' : ''}`}
                    onClick={() => setActiveTab('traits')}
                >
                    Personality Traits
                </button>
            </div>

            <div className="content">
                {activeTab === 'attributes' && (
                    <>
                        {!editMode && (
                            <button
                                className="btn btn-primary create-btn"
                                onClick={() => setEditMode(false)}
                            >
                                Create New Attribute
                            </button>
                        )}
                        {editMode ? renderAttributeForm() : renderAttributeList()}
                    </>
                )}
                {activeTab === 'traits' && (
                    <>
                        {!editMode && (
                            <button
                                className="btn btn-primary create-btn"
                                onClick={() => setEditMode(false)}
                            >
                                Create New Trait
                            </button>
                        )}
                        {editMode ? renderTraitForm() : renderTraitList()}
                    </>
                )}
            </div>
        </div>
    );
}

export default PersonalityManager; 