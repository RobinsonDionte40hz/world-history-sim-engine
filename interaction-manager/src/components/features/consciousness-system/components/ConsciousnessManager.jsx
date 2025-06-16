import React, { useState, useEffect } from 'react';
// import './ConsciousnessManager.css'; // Removed for Tailwind CSS migration

const ConsciousnessManager = ({ system }) => {
    const [activeTab, setActiveTab] = useState('individuals');
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        baseFrequency: 7.5,
        emotionalCoherence: 0.7,
        fieldRadius: 2.5,
        primaryDrive: 'survive',
        activeGoals: [],
        hiddenAgendas: []
    });

    useEffect(() => {
        if (currentItem) {
            setFormData({
                id: currentItem.id,
                baseFrequency: currentItem.baseFrequency,
                emotionalCoherence: currentItem.emotionalCoherence,
                fieldRadius: currentItem.fieldRadius,
                primaryDrive: currentItem.primaryDrive,
                activeGoals: currentItem.activeGoals || [],
                hiddenAgendas: currentItem.hiddenAgendas || []
            });
        } else {
            // Reset form when currentItem is null (e.g., after successful creation/update)
            setFormData({
                id: '',
                baseFrequency: 7.5,
                emotionalCoherence: 0.7,
                fieldRadius: 2.5,
                primaryDrive: 'survive',
                activeGoals: [],
                hiddenAgendas: []
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

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'individuals') {
                if (editMode) {
                    system.updateConsciousnessState(formData.id, formData);
                } else {
                    system.createConsciousnessState(formData.id, formData);
                }
            } else { // activeTab === 'collectives'
                if (editMode) {
                    system.updateCollective(formData.id, formData);
                } else {
                    system.createCollective(formData.id, formData);
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
            baseFrequency: 7.5,
            emotionalCoherence: 0.7,
            fieldRadius: 2.5,
            primaryDrive: 'survive',
            activeGoals: [],
            hiddenAgendas: []
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
                if (activeTab === 'individuals') {
                    system.deleteConsciousnessState(id);
                } else {
                    system.deleteCollective(id);
                }
                resetForm(); // Clear form after deletion
            } catch (error) {
                console.error('Error deleting item:', error);
                alert(error.message);
            }
        }
    };

    const renderForm = () => {
        const isCollective = activeTab === 'collectives';
        return (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="baseFrequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base Frequency: <span className="font-semibold text-blue-600 dark:text-blue-400">{formData.baseFrequency.toFixed(1)}</span></label>
                        <input
                            type="range"
                            id="baseFrequency"
                            name="baseFrequency"
                            min="0"
                            max="20"
                            step="0.1"
                            value={formData.baseFrequency}
                            onChange={handleInputChange}
                            className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                        />
                    </div>

                    {!isCollective && (
                        <div className="form-group">
                            <label htmlFor="emotionalCoherence" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emotional Coherence: <span className="font-semibold text-blue-600 dark:text-blue-400">{formData.emotionalCoherence.toFixed(1)}</span></label>
                            <input
                                type="range"
                                id="emotionalCoherence"
                                name="emotionalCoherence"
                                min="0"
                                max="1"
                                step="0.1"
                                value={formData.emotionalCoherence}
                                onChange={handleInputChange}
                                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                            />
                        </div>
                    )}

                    {!isCollective && (
                        <div className="form-group">
                            <label htmlFor="fieldRadius" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Field Radius: <span className="font-semibold text-blue-600 dark:text-blue-400">{formData.fieldRadius.toFixed(1)}</span></label>
                            <input
                                type="range"
                                id="fieldRadius"
                                name="fieldRadius"
                                min="0"
                                max="10"
                                step="0.1"
                                value={formData.fieldRadius}
                                onChange={handleInputChange}
                                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                            />
                        </div>
                    )}
                </div>

                {!isCollective && (
                    <div className="form-group">
                        <label htmlFor="primaryDrive" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Drive:</label>
                        <select
                            id="primaryDrive"
                            name="primaryDrive"
                            value={formData.primaryDrive}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="survive">Survive</option>
                            <option value="protect">Protect</option>
                            <option value="achieve">Achieve</option>
                            <option value="connect">Connect</option>
                            <option value="learn">Learn</option>
                        </select>
                    </div>
                )}

                {/* Additional fields for CollectiveMood, if applicable, could go here */}

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
        const items = activeTab === 'individuals' 
            ? Array.from(system.consciousnessStates.values())
            : Array.from(system.collectives.values());

        return (
            <div className="space-y-4">
                {items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.id}</h3>
                                {activeTab === 'individuals' ? (
                                    <>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Base Frequency: {item.baseFrequency.toFixed(1)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Emotional Coherence: {item.emotionalCoherence.toFixed(1)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Field Radius: {item.fieldRadius.toFixed(1)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Primary Drive: {item.primaryDrive}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Collective Frequency: {item.collectiveFrequency.toFixed(1)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Mood: {item.mood}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Members: {item.members.size}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full rounded-lg shadow-inner">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Consciousness Management</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => {
                        setActiveTab('individuals');
                        resetForm();
                    }}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'individuals' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Individual States
                </button>
                <button
                    onClick={() => {
                        setActiveTab('collectives');
                        resetForm();
                    }}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'collectives' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Collective Moods
                </button>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {editMode ? `Edit ${activeTab === 'individuals' ? 'Consciousness State' : 'Collective Mood'}` : `Create New ${activeTab === 'individuals' ? 'Consciousness State' : 'Collective Mood'}`}
                </h2>
                {renderForm()}
                {renderList()}
            </div>
        </div>
    );
};

export default ConsciousnessManager; 