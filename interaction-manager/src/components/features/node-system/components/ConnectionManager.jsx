import React, { useState, useEffect } from 'react';
// import './ConnectionManager.css'; // Removed for Tailwind CSS migration

const ConnectionManager = ({ system }) => {
    const [activeTab, setActiveTab] = useState('rules');
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        conditions: [],
        weight: 1.0,
        cooldown: 0,
        requiredTraits: [],
        requiredBiome: null,
        requiredTime: null,
        possibleOutcomes: []
    });

    useEffect(() => {
        if (currentItem) {
            setFormData({
                ...currentItem,
                conditions: currentItem.conditions || [],
                requiredTraits: currentItem.requiredTraits || [],
                possibleOutcomes: currentItem.possibleOutcomes || []
            });
        } else {
            // Reset form when currentItem is null (e.g., after successful creation/update)
            setFormData({
                id: '',
                name: '',
                description: '',
                conditions: [],
                weight: 1.0,
                cooldown: 0,
                requiredTraits: [],
                requiredBiome: null,
                requiredTime: null,
                possibleOutcomes: []
            });
        }
    }, [currentItem]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleConditionChange = (index, field, value) => {
        const newConditions = [...formData.conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        setFormData(prev => ({ ...prev, conditions: newConditions }));
    };

    const addCondition = () => {
        setFormData(prev => ({
            ...prev,
            conditions: [...prev.conditions, { type: 'terrain', value: '' }]
        }));
    };

    const removeCondition = (index) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.filter((_, i) => i !== index)
        }));
    };

    const handleOutcomeChange = (index, field, value) => {
        const newOutcomes = [...formData.possibleOutcomes];
        newOutcomes[index] = { ...newOutcomes[index], [field]: value };
        setFormData(prev => ({ ...prev, possibleOutcomes: newOutcomes }));
    };

    const addOutcome = () => {
        setFormData(prev => ({
            ...prev,
            possibleOutcomes: [...prev.possibleOutcomes, {
                id: `outcome_${Date.now()}`,
                description: '',
                baseProbability: 1.0,
                consequences: []
            }]
        }));
    };

    const removeOutcome = (index) => {
        setFormData(prev => ({
            ...prev,
            possibleOutcomes: prev.possibleOutcomes.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'rules') {
                if (editMode) {
                    system.updateConnectionRule(formData.id, formData);
                } else {
                    system.addConnectionRule(formData);
                }
            } else { // activeTab === 'templates'
                if (editMode) {
                    system.updateEncounterTemplate(formData.id, formData);
                } else {
                    system.addEncounterTemplate(formData);
                }
            }
            resetForm();
        } catch (error) {
            console.error('Error saving item:', error);
            alert(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            conditions: [],
            weight: 1.0,
            cooldown: 0,
            requiredTraits: [],
            requiredBiome: null,
            requiredTime: null,
            possibleOutcomes: []
        });
        setEditMode(false);
        setCurrentItem(null);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setEditMode(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                if (activeTab === 'rules') {
                    system.deleteConnectionRule(id);
                } else {
                    system.deleteEncounterTemplate(id);
                }
                resetForm(); // Clear form after deletion
            } catch (error) {
                console.error('Error deleting item:', error);
                alert(error.message);
            }
        }
    };

    const renderForm = () => {
        const isRule = activeTab === 'rules';
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

                {isRule ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conditions:</label>
                            <div className="space-y-3">
                                {formData.conditions.map((condition, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                        <select
                                            value={condition.type}
                                            onChange={(e) => handleConditionChange(index, 'type', e.target.value)}
                                            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        >
                                            <option value="terrain">Terrain</option>
                                            <option value="biome">Biome</option>
                                            <option value="danger">Danger Level</option>
                                            <option value="civilization">Civilization Level</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={condition.value}
                                            onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                            placeholder="Value"
                                        />
                                        <button type="button" onClick={() => removeCondition(index)} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600 transition-colors duration-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addCondition} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200">
                                Add Condition
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight:</label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    min="0"
                                    step="0.1"
                                    value={formData.weight}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="cooldown" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cooldown (ms):</label>
                                <input
                                    type="number"
                                    id="cooldown"
                                    name="cooldown"
                                    min="0"
                                    value={formData.cooldown}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Possible Outcomes:</label>
                            <div className="space-y-3">
                                {formData.possibleOutcomes.map((outcome, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={outcome.description}
                                            onChange={(e) => handleOutcomeChange(index, 'description', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        />
                                        {/* Add more outcome properties as needed */}
                                        <button type="button" onClick={() => removeOutcome(index)} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600 transition-colors duration-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addOutcome} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200">
                                Add Outcome
                            </button>
                        </div>
                    </div>
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
        const items = activeTab === 'rules'
            ? Array.from(system.connectionRules.values())
            : Array.from(system.encounterTemplates.values());

        const title = activeTab === 'rules' ? 'Existing Connection Rules' : 'Existing Encounter Templates';

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
                                    {item.weight !== undefined && <p><strong>Weight:</strong> {item.weight.toFixed(1)}</p>}
                                    {item.cooldown !== undefined && <p><strong>Cooldown:</strong> {item.cooldown}ms</p>}
                                    {item.conditions && item.conditions.length > 0 && (
                                        <p><strong>Conditions:</strong> {item.conditions.map(c => `${c.type}: ${c.value}`).join(', ')}</p>
                                    )}
                                    {item.possibleOutcomes && item.possibleOutcomes.length > 0 && (
                                        <p><strong>Outcomes:</strong> {item.possibleOutcomes.map(o => o.description).join(', ')}</p>
                                    )}
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
                                        onClick={() => handleDelete(item.id)}
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
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Connection Management</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => {
                        setActiveTab('rules');
                        resetForm();
                    }}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'rules' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Connection Rules
                </button>
                <button
                    onClick={() => {
                        setActiveTab('templates');
                        resetForm();
                    }}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Encounter Templates
                </button>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {editMode ? `Edit ${activeTab === 'rules' ? 'Connection Rule' : 'Encounter Template'}` : `Create New ${activeTab === 'rules' ? 'Connection Rule' : 'Encounter Template'}`}
                </h2>
                {renderForm()}
                {renderList()}
            </div>
        </div>
    );
};

export default ConnectionManager; 