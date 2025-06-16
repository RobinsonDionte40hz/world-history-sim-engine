import React, { useState, useEffect } from 'react';
// import './ItemManager.css'; // Removed for Tailwind CSS migration

const ItemManager = ({ itemSystem }) => {
    const [activeTab, setActiveTab] = useState('create');
    const [editMode, setEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        category: '',
        subcategory: '',
        rarity: 'common',
        value: 0,
        weight: 0,
        imageUrl: '',
        attributes: {},
        prerequisites: {},
        effects: [],
        damage: null,
        stackable: false,
        maxStack: 1,
        consumable: false,
        tradeable: true,
        questItem: false
    });

    useEffect(() => {
        if (editMode && selectedItem) {
            setFormData({
                ...selectedItem,
                attributes: { ...selectedItem.attributes },
                prerequisites: { ...selectedItem.prerequisites },
                effects: [...selectedItem.effects]
            });
        } else {
            setFormData({
                id: '',
                name: '',
                description: '',
                category: '',
                subcategory: '',
                rarity: 'common',
                value: 0,
                weight: 0,
                imageUrl: '',
                attributes: {},
                prerequisites: {},
                effects: [],
                damage: null,
                stackable: false,
                maxStack: 1,
                consumable: false,
                tradeable: true,
                questItem: false
            });
        }
    }, [editMode, selectedItem]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAttributeChange = (attrType, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attrType]: parseFloat(value) || 0
            }
        }));
    };

    const handlePrerequisiteChange = (prereqType, value) => {
        setFormData(prev => ({
            ...prev,
            prerequisites: {
                ...prev.prerequisites,
                [prereqType]: value
            }
        }));
    };

    const handleEffectAdd = (effect) => {
        setFormData(prev => ({
            ...prev,
            effects: [...prev.effects, effect]
        }));
    };

    const handleEffectRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            effects: prev.effects.filter((_, i) => i !== index)
        }));
    };

    const handleDamageChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            damage: {
                ...prev.damage,
                [field]: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                itemSystem.updateItem(formData.id, formData);
            } else {
                itemSystem.createItem(formData);
            }
            setEditMode(false);
            setSelectedItem(null);
            setFormData({
                id: '',
                name: '',
                description: '',
                category: '',
                subcategory: '',
                rarity: 'common',
                value: 0,
                weight: 0,
                imageUrl: '',
                attributes: {},
                prerequisites: {},
                effects: [],
                damage: null,
                stackable: false,
                maxStack: 1,
                consumable: false,
                tradeable: true,
                questItem: false
            });
            setActiveTab('browse');
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Error saving item: ' + error.message);
        }
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setEditMode(true);
        setActiveTab('create');
    };

    const handleDelete = (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            itemSystem.deleteItem(itemId);
        }
    };

    const renderItemForm = () => (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item ID:</label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <option value="">Select Category</option>
                        {itemSystem.getCategories().map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                {formData.category && (
                    <div className="form-group">
                        <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcategory:</label>
                        <select
                            id="subcategory"
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Select Subcategory</option>
                            {itemSystem.getSubcategories(formData.category).map(subcategory => (
                                <option key={subcategory} value={subcategory}>
                                    {subcategory}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="form-group">
                <label htmlFor="rarity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rarity:</label>
                <select
                    id="rarity"
                    name="rarity"
                    value={formData.rarity}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Value:</label>
                    <input
                        type="number"
                        id="value"
                        name="value"
                        value={formData.value}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight:</label>
                    <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL:</label>
                <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6">Properties & Effects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="form-group flex items-center">
                    <input
                        type="checkbox"
                        id="stackable"
                        name="stackable"
                        checked={formData.stackable}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="stackable" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Stackable</label>
                </div>
                {formData.stackable && (
                    <div className="form-group">
                        <label htmlFor="maxStack" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Stack:</label>
                        <input
                            type="number"
                            id="maxStack"
                            name="maxStack"
                            value={formData.maxStack}
                            onChange={handleInputChange}
                            min="1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                )}
                <div className="form-group flex items-center">
                    <input
                        type="checkbox"
                        id="consumable"
                        name="consumable"
                        checked={formData.consumable}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="consumable" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Consumable</label>
                </div>
                <div className="form-group flex items-center">
                    <input
                        type="checkbox"
                        id="tradeable"
                        name="tradeable"
                        checked={formData.tradeable}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="tradeable" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tradeable</label>
                </div>
                <div className="form-group flex items-center">
                    <input
                        type="checkbox"
                        id="questItem"
                        name="questItem"
                        checked={formData.questItem}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="questItem" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Quest Item</label>
                </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mt-6">Attributes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                {itemSystem.getAttributeTypes().map(attrType => (
                    <div key={attrType} className="form-group">
                        <label htmlFor={`attr-${attrType}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{attrType}:</label>
                        <input
                            type="number"
                            id={`attr-${attrType}`}
                            value={formData.attributes[attrType] || ''}
                            onChange={(e) => handleAttributeChange(attrType, e.target.value)}
                            step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                    </div>
                ))}
            </div>

            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mt-6">Prerequisites</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                {itemSystem.getPrerequisiteTypes().map(prereqType => (
                    <div key={prereqType} className="form-group">
                        <label htmlFor={`prereq-${prereqType}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{prereqType}:</label>
                        <input
                            type="text"
                            id={`prereq-${prereqType}`}
                            value={formData.prerequisites[prereqType] || ''}
                            onChange={(e) => handlePrerequisiteChange(prereqType, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                    </div>
                ))}
            </div>

            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mt-6">Damage (if applicable)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <div className="form-group">
                    <label htmlFor="damageType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Damage Type:</label>
                    <input
                        type="text"
                        id="damageType"
                        name="type"
                        value={formData.damage?.type || ''}
                        onChange={(e) => handleDamageChange('type', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="damageAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Damage Amount:</label>
                    <input
                        type="number"
                        id="damageAmount"
                        name="amount"
                        value={formData.damage?.amount || ''}
                        onChange={(e) => handleDamageChange('amount', parseFloat(e.target.value))}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                {editMode && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditMode(false);
                            setSelectedItem(null);
                            setFormData({
                                id: '',
                                name: '',
                                description: '',
                                category: '',
                                subcategory: '',
                                rarity: 'common',
                                value: 0,
                                weight: 0,
                                imageUrl: '',
                                attributes: {},
                                prerequisites: {},
                                effects: [],
                                damage: null,
                                stackable: false,
                                maxStack: 1,
                                consumable: false,
                                tradeable: true,
                                questItem: false
                            });
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                )}
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                    {editMode ? 'Update Item' : 'Create Item'}
                </button>
            </div>
        </form>
    );

    const renderItemList = () => {
        const allItems = itemSystem.getAllItems();
        const filteredItems = allItems.filter(item =>
            (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedCategory === '' || item.category === selectedCategory)
        );

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Existing Items</h2>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 min-w-[150px] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 min-w-[150px] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">All Categories</option>
                        {itemSystem.getCategories().map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {filteredItems.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No items found matching your criteria.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredItems.map(item => (
                            <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm relative hover:shadow-md transition-shadow duration-200">
                                {item.imageUrl && (
                                    <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                                        <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
                                    </div>
                                )}
                                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">{item.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">ID: {item.id}</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{item.description}</p>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
                                    <p><strong>Category:</strong> {item.category}{item.subcategory && ` / ${item.subcategory}`}</p>
                                    <p><strong>Rarity:</strong> <span className={`font-semibold ${item.rarity === 'common' ? 'text-gray-500' : item.rarity === 'uncommon' ? 'text-green-500' : item.rarity === 'rare' ? 'text-blue-500' : item.rarity === 'epic' ? 'text-purple-500' : 'text-yellow-500'}`}>{item.rarity}</span></p>
                                    <p><strong>Value:</strong> {item.value}</p>
                                    <p><strong>Weight:</strong> {item.weight}</p>
                                    {Object.keys(item.attributes).length > 0 && <p><strong>Attributes:</strong> {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>}
                                    {item.damage && <p><strong>Damage:</strong> {item.damage.amount} ({item.damage.type})</p>}
                                    {item.stackable && <p><strong>Stackable:</strong> Yes (Max: {item.maxStack})</p>}
                                    {item.consumable && <p><strong>Consumable:</strong> Yes</p>}
                                    {item.tradeable && <p><strong>Tradeable:</strong> Yes</p>}
                                    {item.questItem && <p><strong>Quest Item:</strong> Yes</p>}
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
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Item Management</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => {
                        setActiveTab('create');
                        setEditMode(false);
                        setSelectedItem(null);
                        setFormData({
                            id: '',
                            name: '',
                            description: '',
                            category: '',
                            subcategory: '',
                            rarity: 'common',
                            value: 0,
                            weight: 0,
                            imageUrl: '',
                            attributes: {},
                            prerequisites: {},
                            effects: [],
                            damage: null,
                            stackable: false,
                            maxStack: 1,
                            consumable: false,
                            tradeable: true,
                            questItem: false
                        });
                    }}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Create/Edit Item
                </button>
                <button
                    onClick={() => {
                        setActiveTab('browse');
                        setEditMode(false);
                        setSelectedItem(null);
                    }}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200
                        ${activeTab === 'browse' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    Browse Items
                </button>
            </div>

            {activeTab === 'create' && (
                <div className="space-y-6">
                    {renderItemForm()}
                </div>
            )}

            {activeTab === 'browse' && (
                <div className="space-y-6">
                    {renderItemList()}
                </div>
            )}
        </div>
    );
};

export default ItemManager; 