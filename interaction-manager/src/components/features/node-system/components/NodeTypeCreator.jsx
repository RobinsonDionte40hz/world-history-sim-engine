import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import styles from './NodeTypeCreator.module.css';

const NodeTypeCreator = ({ nodeTypeSystem }) => {
    const [activeTab, setActiveTab] = useState('nodeTypes');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        color: '#000000',
        terrainCategory: '',
        biomeProperties: {
            climate: '',
            temperature: '',
            humidity: '',
            weather: ''
        },
        dangerLevel: 1,
        civilizationLevel: 1,
        connectionRules: [],
        generationWeight: 1,
        specialProperties: {}
    });
    const [terrainCategory, setTerrainCategory] = useState('');

    useEffect(() => {
        if (editMode) {
            setFormData({
                id: '',
                name: '',
                description: '',
                color: '#000000',
                terrainCategory: '',
                biomeProperties: {
                    climate: '',
                    temperature: '',
                    humidity: '',
                    weather: ''
                },
                dangerLevel: 1,
                civilizationLevel: 1,
                connectionRules: [],
                generationWeight: 1,
                specialProperties: {}
            });
        }
    }, [editMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('biome.')) {
            const biomeProp = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                biomeProperties: {
                    ...prev.biomeProperties,
                    [biomeProp]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            nodeTypeSystem.createNodeType(formData);
            setEditMode(false);
            setFormData({
                id: '',
                name: '',
                description: '',
                color: '#000000',
                terrainCategory: '',
                biomeProperties: {
                    climate: '',
                    temperature: '',
                    humidity: '',
                    weather: ''
                },
                dangerLevel: 1,
                civilizationLevel: 1,
                connectionRules: [],
                generationWeight: 1,
                specialProperties: {}
            });
        } catch (error) {
            console.error('Error creating node type:', error);
        }
    };

    const handleTerrainCategorySubmit = (e) => {
        e.preventDefault();
        try {
            nodeTypeSystem.registerTerrainCategory(terrainCategory);
            setTerrainCategory('');
        } catch (error) {
            console.error('Error registering terrain category:', error);
        }
    };

    const handleEdit = (nodeType) => {
        setFormData({
            ...nodeType,
            biomeProperties: { ...nodeType.biomeProperties }
        });
        setEditMode(true);
    };

    const handleDelete = (nodeTypeId) => {
        nodeTypeSystem.nodeTypes.delete(nodeTypeId);
    };

    const renderForm = () => {
        return (
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Name</label>
                    <input
                        type="text"
                        className={styles.formInput}
                        value={formData.name}
                        onChange={handleInputChange}
                        name="name"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description</label>
                    <textarea
                        className={styles.formInput}
                        value={formData.description}
                        onChange={handleInputChange}
                        name="description"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Terrain</label>
                    <select
                        className={styles.formInput}
                        value={formData.terrainCategory}
                        onChange={handleInputChange}
                        name="terrainCategory"
                    >
                        <option value="">Select Terrain</option>
                        {Array.from(nodeTypeSystem.terrainCategories).map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Biome</label>
                    <select
                        className={styles.formInput}
                        value={formData.biomeProperties.climate}
                        onChange={handleInputChange}
                        name="biome.climate"
                    >
                        <option value="">Select Climate</option>
                        {Array.from(nodeTypeSystem.categoryLists.climates).map(climate => (
                            <option key={climate} value={climate}>
                                {climate}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Temperature</label>
                    <select
                        className={styles.formInput}
                        value={formData.biomeProperties.temperature}
                        onChange={handleInputChange}
                        name="biome.temperature"
                    >
                        <option value="">Select Temperature</option>
                        {Array.from(nodeTypeSystem.categoryLists.temperatures).map(temp => (
                            <option key={temp} value={temp}>
                                {temp}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Humidity</label>
                    <select
                        className={styles.formInput}
                        value={formData.biomeProperties.humidity}
                        onChange={handleInputChange}
                        name="biome.humidity"
                    >
                        <option value="">Select Humidity</option>
                        {Array.from(nodeTypeSystem.categoryLists.humidityLevels).map(humidity => (
                            <option key={humidity} value={humidity}>
                                {humidity}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Weather</label>
                    <select
                        className={styles.formInput}
                        value={formData.biomeProperties.weather}
                        onChange={handleInputChange}
                        name="biome.weather"
                    >
                        <option value="">Select Weather</option>
                        {Array.from(nodeTypeSystem.categoryLists.weatherTypes).map(weather => (
                            <option key={weather} value={weather}>
                                {weather}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Danger Level (1-10)</label>
                    <input
                        type="number"
                        className={styles.formInput}
                        value={formData.dangerLevel}
                        onChange={handleInputChange}
                        name="dangerLevel"
                        min="1"
                        max="10"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Civilization Level (1-10)</label>
                    <input
                        type="number"
                        className={styles.formInput}
                        value={formData.civilizationLevel}
                        onChange={handleInputChange}
                        name="civilizationLevel"
                        min="1"
                        max="10"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Generation Weight (1-100)</label>
                    <input
                        type="number"
                        className={styles.formInput}
                        value={formData.generationWeight}
                        onChange={handleInputChange}
                        name="generationWeight"
                        min="1"
                        max="100"
                    />
                </div>
                <div className={styles.cardActions}>
                    <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                        Save
                    </button>
                    <button 
                        type="button" 
                        className={styles.button}
                        onClick={() => setEditMode(false)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        );
    };

    const renderTerrainCategoryForm = () => {
        return (
            <form onSubmit={handleTerrainCategorySubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>New Terrain Category</label>
                    <input
                        type="text"
                        className={styles.formInput}
                        value={terrainCategory}
                        onChange={(e) => setTerrainCategory(e.target.value)}
                        name="terrainCategoryInput"
                    />
                </div>
                <div className={styles.cardActions}>
                    <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                        Add Category
                    </button>
                </div>
            </form>
        );
    };

    const renderList = () => {
        const nodeTypes = Array.from(nodeTypeSystem.nodeTypes.values());
        return (
            <div className={styles.nodeList}>
                {nodeTypes.map(nodeType => (
                    <div key={nodeType.id} className={styles.nodeCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>{nodeType.name}</h3>
                            <div className={styles.cardActions}>
                                <button 
                                    className={`${styles.actionButton} ${styles.view}`}
                                    onClick={() => handleEdit(nodeType)}
                                >
                                    <Eye size={16} />
                                </button>
                                <button 
                                    className={`${styles.actionButton} ${styles.delete}`}
                                    onClick={() => handleDelete(nodeType.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <p className={styles.cardDescription}>{nodeType.description}</p>
                        <div className={styles.cardMeta}>
                            {nodeType.terrainCategory && (
                                <span className={styles.tag}>
                                    {nodeType.terrainCategory}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTerrainCategories = () => {
        const terrainCategories = Array.from(nodeTypeSystem.terrainCategories);
        return (
            <div className={styles.nodeList}>
                {terrainCategories.map(category => (
                    <div key={category} className={styles.nodeCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>{category}</h3>
                            <div className={styles.cardActions}>
                                <button 
                                    className={`${styles.actionButton} ${styles.delete}`}
                                    onClick={() => nodeTypeSystem.unregisterTerrainCategory(category)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Node Types</h1>
                <button 
                    className={styles.button} 
                    onClick={() => {
                        setEditMode(true);
                        setFormData({
                            id: '',
                            name: '',
                            description: '',
                            color: '#000000',
                            terrainCategory: '',
                            biomeProperties: {
                                climate: '',
                                temperature: '',
                                humidity: '',
                                weather: ''
                            },
                            dangerLevel: 1,
                            civilizationLevel: 1,
                            connectionRules: [],
                            generationWeight: 1,
                            specialProperties: {}
                        });
                    }}
                >
                    <Plus size={18} />
                    New Node Type
                </button>
            </div>

            <div className={styles.content}>
                {!editMode && (
                    <div className={styles.nodeList}>
                        {Array.from(nodeTypeSystem.nodeTypes.values()).map(nodeType => (
                            <div key={nodeType.id} className={styles.nodeCard}>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.cardTitle}>{nodeType.name}</h3>
                                    <div className={styles.cardActions}>
                                        <button 
                                            className={`${styles.actionButton} ${styles.view}`}
                                            onClick={() => handleEdit(nodeType)}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionButton} ${styles.delete}`}
                                            onClick={() => handleDelete(nodeType.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className={styles.cardDescription}>{nodeType.description}</p>
                                <div className={styles.cardMeta}>
                                    {nodeType.terrainCategory && (
                                        <span className={styles.tag}>
                                            {nodeType.terrainCategory}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editMode && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>
                            {formData.id ? 'Edit Node Type' : 'Create New Node Type'}
                        </h2>
                        {renderForm()}
                        <div className={styles.modalActions}>
                            <button 
                                className={`${styles.button} ${styles.buttonPrimary}`}
                                onClick={handleSubmit}
                            >
                                {formData.id ? 'Save Changes' : 'Create Node Type'}
                            </button>
                            <button 
                                className={styles.button}
                                onClick={() => setEditMode(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NodeTypeCreator;
