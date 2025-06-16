import React, { useState, useEffect } from 'react';
// import QuestSystem from '../../../systems/quest/QuestSystem.js';
// import './QuestManager.css'; // Removed for Tailwind CSS migration

const QuestManager = ({ system }) => {
    const [activeTab, setActiveTab] = useState('templates');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        trigger: {
            type: 'consciousness_threshold',
            conditions: []
        },
        initialNode: '',
        consciousnessRequirements: {
            frequency: '',
            coherence: ''
        },
        evolutionRules: [],
        informationLayers: {}
    });
    const [currentNode, setCurrentNode] = useState(null);
    const [nodeFormData, setNodeFormData] = useState({
        id: '',
        name: '',
        description: '',
        type: 'dialogue',
        requirements: {},
        consequences: {},
        branches: [],
        consciousnessTriggers: [],
        unlockConditions: []
    });

    useEffect(() => {
        if (editMode) {
            setFormData({
                id: '',
                name: '',
                description: '',
                trigger: {
                    type: 'consciousness_threshold',
                    conditions: []
                },
                initialNode: '',
                consciousnessRequirements: {
                    frequency: '',
                    coherence: ''
                },
                evolutionRules: [],
                informationLayers: {}
            });
        }
    }, [editMode]);

    useEffect(() => {
        if (currentNode) {
            setNodeFormData({
                id: currentNode.id,
                name: currentNode.name,
                description: currentNode.description,
                type: currentNode.type,
                requirements: currentNode.requirements || {},
                consequences: currentNode.consequences || {},
                branches: currentNode.branches || [],
                consciousnessTriggers: currentNode.consciousnessTriggers || [],
                unlockConditions: currentNode.unlockConditions || []
            });
        } else {
            setNodeFormData({
                id: '',
                name: '',
                description: '',
                type: 'dialogue',
                requirements: {},
                consequences: {},
                branches: [],
                consciousnessTriggers: [],
                unlockConditions: []
            });
        }
    }, [currentNode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNodeInputChange = (e) => {
        const { name, value } = e.target;
        setNodeFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                system.updateQuestTemplate(formData.id, formData);
            } else {
                const template = {
                    ...formData,
                    nodes: new Map()
                };
                system.addQuestTemplate(template);
            }
            resetForm();
        } catch (error) {
            console.error('Error creating/updating quest template:', error);
            alert(error.message);
        }
    };

    const handleNodeSubmit = (e) => {
        e.preventDefault();
        try {
            const template = system.questTemplates.get(formData.id);
            if (!template) {
                alert('Please select or create a quest template first.');
                return;
            }

            // const node = new QuestSystem.QuestNode(nodeFormData); // Commented out as QuestSystem is not defined
            if (currentNode) {
                template.updateNode(nodeFormData.id, nodeFormData);
            } else {
                template.addNode(nodeFormData);
            }
            resetNodeForm();
        } catch (error) {
            console.error('Error creating/updating quest node:', error);
            alert(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            trigger: {
                type: 'consciousness_threshold',
                conditions: []
            },
            initialNode: '',
            consciousnessRequirements: {
                frequency: '',
                coherence: ''
            },
            evolutionRules: [],
            informationLayers: {}
        });
        setEditMode(false);
        setCurrentNode(null); // Clear node form as well
        setNodeFormData({
            id: '',
            name: '',
            description: '',
            type: 'dialogue',
            requirements: {},
            consequences: {},
            branches: [],
            consciousnessTriggers: [],
            unlockConditions: []
        });
    };

    const resetNodeForm = () => {
        setNodeFormData({
            id: '',
            name: '',
            description: '',
            type: 'dialogue',
            requirements: {},
            consequences: {},
            branches: [],
            consciousnessTriggers: [],
            unlockConditions: []
        });
        setCurrentNode(null);
    };

    const handleEdit = (template) => {
        setFormData({
            id: template.id,
            name: template.name,
            description: template.description,
            trigger: template.trigger,
            initialNode: template.initialNode,
            consciousnessRequirements: template.consciousnessRequirements,
            evolutionRules: template.evolutionRules || [],
            informationLayers: template.informationLayers || {}
        });
        setEditMode(true);
        setActiveTab('templates'); // Switch to template tab for editing
    };

    const handleNodeEdit = (node) => {
        setCurrentNode(node);
        setActiveTab('nodes'); // Switch to nodes tab for editing
    };

    const handleDelete = (templateId) => {
        if (window.confirm('Are you sure you want to delete this quest template and all its nodes?')) {
            system.deleteQuestTemplate(templateId);
            resetForm();
        }
    };

    const handleNodeDelete = (nodeId) => {
        if (window.confirm('Are you sure you want to delete this quest node?')) {
            const template = system.questTemplates.get(formData.id);
            if (template) {
                template.removeNode(nodeId);
                resetNodeForm();
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
                    <label htmlFor="initialNode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Node ID:</label>
                    <input
                        type="text"
                        id="initialNode"
                        name="initialNode"
                        value={formData.initialNode}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Consciousness Requirements:</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <input
                            type="text"
                            placeholder="Frequency Range (e.g., 5-8)"
                            value={formData.consciousnessRequirements.frequency}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                consciousnessRequirements: {
                                    ...prev.consciousnessRequirements,
                                    frequency: e.target.value
                                }
                            }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                        <input
                            type="text"
                            placeholder="Coherence Range (e.g., 0.5-0.8)"
                            value={formData.consciousnessRequirements.coherence}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                consciousnessRequirements: {
                                    ...prev.consciousnessRequirements,
                                    coherence: e.target.value
                                }
                            }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                        {editMode ? 'Update Quest Template' : 'Create Quest Template'}
                    </button>
                </div>
            </form>
        );
    };

    const renderNodeForm = () => {
        return (
            <form onSubmit={handleNodeSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="nodeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Node ID:</label>
                        <input
                            type="text"
                            id="nodeId"
                            name="id"
                            value={nodeFormData.id}
                            onChange={handleNodeInputChange}
                            required
                            disabled={!!currentNode}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nodeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Node Name:</label>
                        <input
                            type="text"
                            id="nodeName"
                            name="name"
                            value={nodeFormData.name}
                            onChange={handleNodeInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="nodeDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description:</label>
                    <textarea
                        id="nodeDescription"
                        name="description"
                        value={nodeFormData.description}
                        onChange={handleNodeInputChange}
                        required
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="nodeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Node Type:</label>
                    <select
                        id="nodeType"
                        name="type"
                        value={nodeFormData.type}
                        onChange={handleNodeInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="dialogue">Dialogue</option>
                        <option value="challenge">Challenge</option>
                        <option value="discovery">Discovery</option>
                        <option value="choice">Choice</option>
                        <option value="ending">Ending</option>
                    </select>
                </div>

                {/* Dynamic fields for requirements, consequences, branches, etc. could go here */}
                {/* For brevity, I'll add basic examples for now */}

                <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={resetNodeForm} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors duration-200">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                        {currentNode ? 'Update Quest Node' : 'Create Quest Node'}
                    </button>
                </div>
            </form>
        );
    };

    const renderList = () => {
        const templates = Array.from(system.questTemplates.values());

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Existing Quest Templates</h2>
                {templates.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No quest templates created yet.</p>
                ) : (
                    <div className="space-y-6">
                        {templates.map(template => (
                            <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm relative hover:shadow-md transition-shadow duration-200">
                                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">{template.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">ID: {template.id}</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{template.description}</p>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
                                    <p><strong>Initial Node:</strong> {template.initialNode}</p>
                                    {template.consciousnessRequirements.frequency && <p><strong>Freq. Req:</strong> {template.consciousnessRequirements.frequency}</p>}
                                    {template.consciousnessRequirements.coherence && <p><strong>Coherence Req:</strong> {template.consciousnessRequirements.coherence}</p>}
                                    <p><strong>Nodes:</strong> {template.nodes.size}</p>
                                </div>
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(template)}
                                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600 transition-colors duration-200"
                                        title="Edit Template"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600 transition-colors duration-200"
                                        title="Delete Template"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                    </button>
                                </div>
                                {template.nodes.size > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-white">Nodes:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Array.from(template.nodes.values()).map(node => (
                                                <div key={node.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md shadow-sm flex flex-col gap-2">
                                                    <div>
                                                        <p className="font-medium text-gray-800 dark:text-white">{node.name} ({node.type})</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">ID: {node.id}</p>
                                                    </div>
                                                    {/* Safe rendering for requirements */}
                                                    {node.requirements && (
                                                        <div>
                                                            <strong>Requirements:</strong>
                                                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">{JSON.stringify(node.requirements, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                    {/* Safe rendering for consequences */}
                                                    {node.consequences && (
                                                        <div>
                                                            <strong>Consequences:</strong>
                                                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">{JSON.stringify(node.consequences, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                    {/* Safe rendering for branches */}
                                                    {Array.isArray(node.branches) && node.branches.length > 0 && (
                                                        <div>
                                                            <strong>Branches:</strong>
                                                            <ul className="list-disc ml-4">
                                                                {node.branches.map((branch, idx) => (
                                                                    <li key={branch.id || idx} className="text-xs">
                                                                        {typeof branch === 'object' ? JSON.stringify(branch) : String(branch)}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <div className="flex space-x-2 mt-2">
                                                        <button
                                                            onClick={() => handleNodeEdit(node)}
                                                            className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-600 dark:text-blue-100 dark:hover:bg-blue-500 transition-colors duration-200"
                                                            title="Edit Node"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleNodeDelete(node.id)}
                                                            className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-600 dark:text-red-100 dark:hover:bg-red-500 transition-colors duration-200"
                                                            title="Delete Node"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full rounded-lg shadow-inner">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Quest Management</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => {
                        setActiveTab('templates');
                        resetForm();
                    }}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Quest Templates
                </button>
                <button
                    onClick={() => {
                        setActiveTab('nodes');
                        resetNodeForm();
                    }}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'nodes' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Quest Nodes
                </button>
            </div>

            {activeTab === 'templates' && renderForm()}
            {activeTab === 'nodes' && renderNodeForm()}
            {activeTab === 'list' && renderList()}
        </div>
    );
};

export default QuestManager;