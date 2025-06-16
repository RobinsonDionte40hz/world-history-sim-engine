import React, { useState, useEffect } from 'react';
// import './WorldNodeCreator.css'; // Removed for Tailwind CSS migration

const WorldNodeCreator = ({ worldNodeSystem, nodeTypeSystem, connectionSystem }) => {
    const [activeTab, setActiveTab] = useState('create');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        includedNodes: new Set(),
        nodeConnections: new Map()
    });
    const [selectedWorld, setSelectedWorld] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (editMode && selectedWorld) {
            setFormData({
                id: selectedWorld.id,
                name: selectedWorld.name,
                description: selectedWorld.description,
                includedNodes: new Set(selectedWorld.includedNodes),
                nodeConnections: new Map(selectedWorld.nodeConnections)
            });
        } else {
            setFormData({
                id: '',
                name: '',
                description: '',
                includedNodes: new Set(),
                nodeConnections: new Map()
            });
        }
    }, [editMode, selectedWorld]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNodeToggle = (nodeId) => {
        setFormData(prev => {
            const newIncludedNodes = new Set(prev.includedNodes);
            if (newIncludedNodes.has(nodeId)) {
                newIncludedNodes.delete(nodeId);
                // Remove connections involving this node
                const newConnections = new Map(prev.nodeConnections);
                for (const [key, value] of newConnections) {
                    if (key.includes(nodeId)) {
                        newConnections.delete(key);
                    }
                }
                return {
                    ...prev,
                    includedNodes: newIncludedNodes,
                    nodeConnections: newConnections
                };
            } else {
                newIncludedNodes.add(nodeId);
                return {
                    ...prev,
                    includedNodes: newIncludedNodes
                };
            }
        });
    };

    const handleConnectionToggle = (nodeId1, nodeId2) => {
        setFormData(prev => {
            const newConnections = new Map(prev.nodeConnections);
            const connectionKey = `${nodeId1}-${nodeId2}`;
            
            if (newConnections.has(connectionKey)) {
                newConnections.delete(connectionKey);
            } else {
                newConnections.set(connectionKey, {
                    node1: nodeId1,
                    node2: nodeId2,
                    type: 'default'
                });
            }
            
            return {
                ...prev,
                nodeConnections: newConnections
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                worldNodeSystem.updateWorld(formData.id, {
                    name: formData.name,
                    description: formData.description,
                    includedNodes: formData.includedNodes,
                    nodeConnections: formData.nodeConnections
                });
            } else {
                worldNodeSystem.createWorld({
                    id: formData.id,
                    name: formData.name,
                    description: formData.description,
                    includedNodes: formData.includedNodes,
                    nodeConnections: formData.nodeConnections
                });
            }
            setEditMode(false);
            setSelectedWorld(null);
            setFormData({
                id: '',
                name: '',
                description: '',
                includedNodes: new Set(),
                nodeConnections: new Map()
            });
        } catch (error) {
            console.error('Error saving world:', error);
            alert('Error saving world: ' + error.message);
        }
    };

    const handleEdit = (world) => {
        setSelectedWorld(world);
        setEditMode(true);
        setActiveTab('create');
    };

    const handleDelete = (worldId) => {
        if (window.confirm('Are you sure you want to delete this world?')) {
            worldNodeSystem.deleteWorld(worldId);
        }
    };

    const renderWorldForm = () => (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">World ID:</label>
                    <input
                        type="text"
                        id="id"
                        name="id"
                        value={formData.id}
                        onChange={handleInputChange}
                        disabled={editMode}
                        required
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
            <div className="flex justify-end space-x-3 mt-6">
                {editMode && (
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors duration-200"
                        onClick={() => {
                            setEditMode(false);
                            setSelectedWorld(null);
                            setFormData({
                                id: '',
                                name: '',
                                description: '',
                                includedNodes: new Set(),
                                nodeConnections: new Map()
                            });
                        }}
                    >
                        Cancel
                    </button>
                )}
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                    {editMode ? 'Update World' : 'Create World'}
                </button>
            </div>
        </form>
    );

    const renderNodeSelector = () => {
        const allNodes = nodeTypeSystem.getAllNodeTypes();
        const filteredNodes = allNodes.filter(node =>
            node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Select Nodes for this World</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                {filteredNodes.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No nodes found matching your search.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredNodes.map(node => (
                            <div
                                key={node.id}
                                className={`relative flex items-center p-3 rounded-lg shadow-sm cursor-pointer border-2 ${formData.includedNodes.has(node.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-200 bg-gray-50 dark:bg-gray-700'} hover:border-blue-400 transition-all duration-200`}
                                onClick={() => handleNodeToggle(node.id)}
                            >
                                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: node.color }} />
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-white">{node.name}</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{node.description}</p>
                                </div>
                                {formData.includedNodes.has(node.id) && (
                                    <svg className="absolute top-2 right-2 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderConnectionManager = () => {
        const selectedNodes = Array.from(formData.includedNodes);
        const connections = Array.from(formData.nodeConnections.values());

        if (selectedNodes.length < 2) {
            return (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Manage Node Connections</h2>
                    <p className="text-gray-600 dark:text-gray-400">Select at least two nodes to manage connections.</p>
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Manage Node Connections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedNodes.map((nodeId1, index) => (
                        selectedNodes.slice(index + 1).map(nodeId2 => {
                            const node1 = nodeTypeSystem.getNodeType(nodeId1);
                            const node2 = nodeTypeSystem.getNodeType(nodeId2);
                            const connectionKey = `${nodeId1}-${nodeId2}`;
                            const isConnected = formData.nodeConnections.has(connectionKey);

                            return (
                                <div
                                    key={connectionKey}
                                    className={`flex items-center justify-between p-3 rounded-lg shadow-sm cursor-pointer border-2 ${isConnected ? 'border-green-500 bg-green-50 dark:bg-green-900/50' : 'border-gray-200 bg-gray-50 dark:bg-gray-700'} hover:border-green-400 transition-all duration-200`}
                                    onClick={() => handleConnectionToggle(nodeId1, nodeId2)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-gray-800 dark:text-white">{node1 ? node1.name : nodeId1}</span>
                                        <span className="text-gray-500 dark:text-gray-400">-</span>
                                        <span className="font-medium text-gray-800 dark:text-white">{node2 ? node2.name : nodeId2}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isConnected ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>
                                            {isConnected ? 'Connected' : 'Disconnected'}
                                        </span>
                                        {isConnected ? (
                                            <svg className="text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                        ) : (
                                            <svg className="text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>
        );
    };

    const renderWorldList = () => {
        const worlds = Array.from(worldNodeSystem.worlds.values());

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Existing Worlds</h2>
                {worlds.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No worlds created yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {worlds.map(world => (
                            <div key={world.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm relative hover:shadow-md transition-shadow duration-200">
                                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">{world.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">ID: {world.id}</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{world.description}</p>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
                                    <p><strong>Included Nodes:</strong> {world.includedNodes.size}</p>
                                    <p><strong>Connections:</strong> {world.nodeConnections.size}</p>
                                </div>
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(world)}
                                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600 transition-colors duration-200"
                                        title="Edit World"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(world.id)}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600 transition-colors duration-200"
                                        title="Delete World"
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
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">World Node Management</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => {
                        setActiveTab('create');
                        setEditMode(false);
                        setSelectedWorld(null);
                        setFormData({
                            id: '',
                            name: '',
                            description: '',
                            includedNodes: new Set(),
                            nodeConnections: new Map()
                        });
                    }}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Create/Edit World
                </button>
                <button
                    onClick={() => setActiveTab('nodes')}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'nodes' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Select Nodes
                </button>
                <button
                    onClick={() => setActiveTab('connections')}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'connections' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Manage Connections
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    View Worlds
                </button>
            </div>

            {activeTab === 'create' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                        {editMode ? 'Edit World' : 'Create New World'}
                    </h2>
                    {renderWorldForm()}
                </div>
            )}

            {activeTab === 'nodes' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Select Nodes</h2>
                    {renderNodeSelector()}
                </div>
            )}

            {activeTab === 'connections' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Manage Connections</h2>
                    {renderConnectionManager()}
                </div>
            )}

            {activeTab === 'list' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">View Existing Worlds</h2>
                    {renderWorldList()}
                </div>
            )}
        </div>
    );
};

export default WorldNodeCreator; 