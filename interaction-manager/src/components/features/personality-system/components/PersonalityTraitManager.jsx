import React, { useState, useEffect } from 'react';
// import './PersonalityTraitManager.css'; // Removed for Tailwind CSS migration

const PersonalityTraitManager = ({ personalitySystem }) => {
    const [activeTab, setActiveTab] = useState('traits');
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [traitCategories, setTraitCategories] = useState([]);
    const [cognitiveCategories, setCognitiveCategories] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        category: '',
        // Trait specific
        intensity: 0.5,
        // Emotion specific
        baseLevel: 0.5,
        volatility: 0.5,
        // Cognitive specific
        complexity: 0.5,
        adaptability: 0.5
    });

    useEffect(() => {
        if (personalitySystem) {
            setTraitCategories(personalitySystem.getTraitCategories());
            setCognitiveCategories(personalitySystem.getCognitiveCategories());
        }
    }, [personalitySystem]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            switch (activeTab) {
                case 'traits':
                    if (editMode) {
                        personalitySystem.updateTrait(formData.id, formData);
                    } else {
                        personalitySystem.createTrait(formData);
                    }
                    break;
                case 'emotions':
                    if (editMode) {
                        personalitySystem.updateEmotionalTendency(formData.id, formData);
                    } else {
                        personalitySystem.createEmotionalTendency(formData);
                    }
                    break;
                case 'cognitive':
                    if (editMode) {
                        personalitySystem.updateCognitiveTrait(formData.id, formData);
                    } else {
                        personalitySystem.createCognitiveTrait(formData);
                    }
                    break;
            }
            resetForm();
        } catch (error) {
            console.error('Error creating/updating item:', error);
            alert(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            category: '',
            intensity: 0.5,
            baseLevel: 0.5,
            volatility: 0.5,
            complexity: 0.5,
            adaptability: 0.5
        });
        setEditMode(false);
        setCurrentItem(null);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setFormData({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            intensity: item.intensity !== undefined ? item.intensity : 0.5,
            baseLevel: item.baseLevel !== undefined ? item.baseLevel : 0.5,
            volatility: item.volatility !== undefined ? item.volatility : 0.5,
            complexity: item.complexity !== undefined ? item.complexity : 0.5,
            adaptability: item.adaptability !== undefined ? item.adaptability : 0.5
        });
        setEditMode(true);
    };

    const handleDelete = (item) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                switch (activeTab) {
                    case 'traits':
                        personalitySystem.deleteTrait(item.id);
                        break;
                    case 'emotions':
                        personalitySystem.deleteEmotionalTendency(item.id);
                        break;
                    case 'cognitive':
                        personalitySystem.deleteCognitiveTrait(item.id);
                        break;
                }
                resetForm(); // Reset form after deletion to clear any lingering edit state
            } catch (error) {
                console.error('Error deleting item:', error);
                alert(error.message);
            }
        }
    };

    const renderForm = () => {
        return (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ID:</label>
                        <input
                            type="text"
                            id="id"
                            name="id"
                            value={formData.id}
                            onChange={handleInputChange}
                            required
                            disabled={editMode}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">Select a category</option>
                        {(activeTab === 'traits' ? traitCategories : cognitiveCategories).map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {activeTab === 'traits' && (
                    <div className="form-group">
                        <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Intensity: <span className="font-semibold text-blue-600 dark:text-blue-400">{formData.intensity.toFixed(1)}</span></label>
                        <input
                            type="range"
                            id="intensity"
                            name="intensity"
                            min="0"
                            max="1"
                            step="0.1"
                            value={formData.intensity}
                            onChange={handleInputChange}
                            className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                        />
                    </div>
                )}

                {activeTab === 'emotions' && (
                    <>
                        <div className="form-group">
                            <label htmlFor="baseLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base Level: <span className="font-semibold text-blue-600 dark:text-blue-400">{formData.baseLevel.toFixed(1)}</span></label>
                            <input
                                type="range"
                                id="baseLevel"
                                name="baseLevel"
                                min="0"
                                max="1"
                                step="0.1"
                                value={formData.baseLevel}
                                onChange={handleInputChange}
                                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="volatility" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Volatility: <span className="font-semibold text-blue-600 dark:text-blue-400">{formData.volatility.toFixed(1)}</span></label>
                            <input
                                type="range"
                                id="volatility"
                                name="volatility"
                                min="0"
                                max="1"
                                step="0.1"
                                value={formData.volatility}
                                onChange={handleInputChange}
                                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                            />
                        </div>
                    </>
                )}

                {activeTab === 'cognitive' && (
                    <>
                        <div className="form-group">
                            <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complexity: <span className="font-semibold text-blue-600 dark:text-blue-400">{formData.complexity.toFixed(1)}</span></label>
                            <input
                                type="range"
                                id="complexity"
                                name="complexity"
                                min="0"
                                max="1"
                                step="0.1"
                                value={formData.complexity}
                                onChange={handleInputChange}
                                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="adaptability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adaptability: <span className="font-semibold text-blue-600 dark:text-blue-400">{formData.adaptability.toFixed(1)}</span></label>
                            <input
                                type="range"
                                id="adaptability"
                                name="adaptability"
                                min="0"
                                max="1"
                                step="0.1"
                                value={formData.adaptability}
                                onChange={handleInputChange}
                                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                            />
                        </div>
                    </>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors duration-200">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                        {editMode ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        );
    };

    const renderList = () => {
        let items = [];
        let title = '';
        switch (activeTab) {
            case 'traits':
                items = Array.from(personalitySystem.traits.values());
                title = 'Existing Personality Traits';
                break;
            case 'emotions':
                items = Array.from(personalitySystem.emotionalTendencies.values());
                title = 'Existing Emotional Tendencies';
                break;
            case 'cognitive':
                items = Array.from(personalitySystem.cognitiveTraits.values());
                title = 'Existing Cognitive Traits';
                break;
            default:
                break;
        }

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h2>
                {items.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No {activeTab} defined yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm relative hover:shadow-md transition-shadow duration-200">
                                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">{item.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">ID: {item.id}</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{item.description}</p>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
                                    {item.category && <p><strong>Category:</strong> {item.category}</p>}
                                    {item.intensity !== undefined && <p><strong>Intensity:</strong> {item.intensity.toFixed(1)}</p>}
                                    {item.baseLevel !== undefined && <p><strong>Base Level:</strong> {item.baseLevel.toFixed(1)}</p>}
                                    {item.volatility !== undefined && <p><strong>Volatility:</strong> {item.volatility.toFixed(1)}</p>}
                                    {item.complexity !== undefined && <p><strong>Complexity:</strong> {item.complexity.toFixed(1)}</p>}
                                    {item.adaptability !== undefined && <p><strong>Adaptability:</strong> {item.adaptability.toFixed(1)}</p>}
                                </div>
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600 transition-colors duration-200"
                                        title="Edit Item"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600 transition-colors duration-200"
                                        title="Delete Item"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full rounded-lg shadow-inner">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Personality Trait Management</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('traits')}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'traits' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Traits
                </button>
                <button
                    onClick={() => setActiveTab('emotions')}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'emotions' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Emotional Tendencies
                </button>
                <button
                    onClick={() => setActiveTab('cognitive')}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'cognitive' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Cognitive Traits
                </button>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {editMode ? `Edit ${activeTab.slice(0, -1).replace('s', '').replace('ies', 'y')} ` : `Create New ${activeTab.slice(0, -1).replace('s', '').replace('ies', 'y')} `}
                    {activeTab === 'traits' && 'Trait'}
                    {activeTab === 'emotions' && 'Emotional Tendency'}
                    {activeTab === 'cognitive' && 'Cognitive Trait'}
                </h2>
                {renderForm()}
                {renderList()}
            </div>
        </div>
    );
};

export default PersonalityTraitManager; 