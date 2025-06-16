import React, { useState, useEffect } from 'react';
// import './NodeTypeCreator.css'; // Removed for Tailwind CSS migration

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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label>
                        <input
                            type="color"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="terrainCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Terrain Category:</label>
                        <select
                            id="terrainCategory"
                            name="terrainCategory"
                            value={formData.terrainCategory}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Select a terrain category</option>
                            {Array.from(nodeTypeSystem.terrainCategories).map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Biome Properties:</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <div className="form-group">
                            <label htmlFor="climate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Climate:</label>
                            <select
                                id="climate"
                                name="biome.climate"
                                value={formData.biomeProperties.climate}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Select climate</option>
                                {Array.from(nodeTypeSystem.categoryLists.climates).map(climate => (
                                    <option key={climate} value={climate}>
                                        {climate}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Temperature:</label>
                            <select
                                id="temperature"
                                name="biome.temperature"
                                value={formData.biomeProperties.temperature}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Select temperature</option>
                                {Array.from(nodeTypeSystem.categoryLists.temperatures).map(temp => (
                                    <option key={temp} value={temp}>
                                        {temp}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="humidity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Humidity:</label>
                            <select
                                id="humidity"
                                name="biome.humidity"
                                value={formData.biomeProperties.humidity}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Select humidity</option>
                                {Array.from(nodeTypeSystem.categoryLists.humidityLevels).map(humidity => (
                                    <option key={humidity} value={humidity}>
                                        {humidity}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="weather" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weather:</label>
                            <select
                                id="weather"
                                name="biome.weather"
                                value={formData.biomeProperties.weather}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Select weather</option>
                                {Array.from(nodeTypeSystem.categoryLists.weatherTypes).map(weather => (
                                    <option key={weather} value={weather}>
                                        {weather}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="dangerLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Danger Level (1-10):</label>
                        <input
                            type="number"
                            id="dangerLevel"
                            name="dangerLevel"
                            value={formData.dangerLevel}
                            onChange={handleInputChange}
                            min="1"
                            max="10"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="civilizationLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Civilization Level (1-10):</label>
                        <input
                            type="number"
                            id="civilizationLevel"
                            name="civilizationLevel"
                            value={formData.civilizationLevel}
                            onChange={handleInputChange}
                            min="1"
                            max="10"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="generationWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Generation Weight (1-100):</label>
                    <input
                        type="number"
                        id="generationWeight"
                        name="generationWeight"
                        value={formData.generationWeight}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors duration-200">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                        {editMode ? 'Update Node Type' : 'Create Node Type'}
                    </button>
                </div>
            </form>
        );
    };

    const renderTerrainCategoryForm = () => {
        return (
            <form onSubmit={handleTerrainCategorySubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                <div className="form-group">
                    <label htmlFor="terrainCategoryInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Terrain Category:</label>
                    <input
                        type="text"
                        id="terrainCategoryInput"
                        name="terrainCategoryInput"
                        value={terrainCategory}
                        onChange={(e) => setTerrainCategory(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                        Add Category
                    </button>
                </div>
            </form>
        );
    };

    const renderList = () => {
        const nodeTypes = Array.from(nodeTypeSystem.nodeTypes.values());
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Existing Node Types</h2>
                {nodeTypes.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No node types created yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nodeTypes.map(nodeType => (
                            <div key={nodeType.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm relative hover:shadow-md transition-shadow duration-200">
                                <h3 className="text-lg font-semibold mb-1" style={{ color: nodeType.color }}>{nodeType.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">ID: {nodeType.id}</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{nodeType.description}</p>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <p><strong>Terrain:</strong> {nodeType.terrainCategory}</p>
                                    <p><strong>Climate:</strong> {nodeType.biomeProperties.climate}</p>
                                    <p><strong>Temp:</strong> {nodeType.biomeProperties.temperature}</p>
                                    <p><strong>Humidity:</strong> {nodeType.biomeProperties.humidity}</p>
                                    <p><strong>Weather:</strong> {nodeType.biomeProperties.weather}</p>
                                    <p><strong>Danger:</strong> {nodeType.dangerLevel}</p>
                                    <p><strong>Civilization:</strong> {nodeType.civilizationLevel}</p>
                                    <p><strong>Gen Weight:</strong> {nodeType.generationWeight}</p>
                                </div>
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(nodeType)}
                                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600 transition-colors duration-200"
                                        title="Edit Node Type"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(nodeType.id)}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600 transition-colors duration-200"
                                        title="Delete Node Type"
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

    const renderTerrainCategories = () => {
        const terrainCategories = Array.from(nodeTypeSystem.terrainCategories);
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Registered Terrain Categories</h2>
                {terrainCategories.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No terrain categories registered yet.</p>
                ) : (
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        {terrainCategories.map(category => (
                            <li key={category} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>{category}</span>
                                <button
                                    onClick={() => nodeTypeSystem.unregisterTerrainCategory(category)}
                                    className="ml-4 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-600 dark:text-red-100 dark:hover:bg-red-500 transition-colors duration-200"
                                    title="Delete Category"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full rounded-lg shadow-inner">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Node Type Management</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('nodeTypes')}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'nodeTypes' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Node Types
                </button>
                <button
                    onClick={() => setActiveTab('terrainCategories')}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'terrainCategories' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Terrain Categories
                </button>
            </div>

            {activeTab === 'nodeTypes' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{editMode ? 'Edit Node Type' : 'Create New Node Type'}</h2>
                    {renderForm()}
                    {renderList()}
                </div>
            )}

            {activeTab === 'terrainCategories' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Register New Terrain Category</h2>
                    {renderTerrainCategoryForm()}
                    {renderTerrainCategories()}
                </div>
            )}
        </div>
    );
};

export default NodeTypeCreator;
