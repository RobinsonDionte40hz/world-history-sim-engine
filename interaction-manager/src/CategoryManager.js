import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Folder, X, Save } from 'lucide-react';

export const CategoryManager = ({ categories, setCategories }) => {
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const createNewCategory = () => {
    const newCategory = {
      id: `category_${Date.now()}`,
      name: "New Category",
      description: "",
      color: "#" + Math.floor(Math.random()*16777215).toString(16),
      parentId: "", // For subcategories
      order: categories.length // For custom ordering
    };
    setCurrentCategory(newCategory);
    setIsEditing(true);
  };

  const editCategory = (category) => {
    setCurrentCategory({...category});
    setIsEditing(true);
  };

  const deleteCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(item => item.id !== id));
      if (currentCategory && currentCategory.id === id) {
        setCurrentCategory(null);
        setIsEditing(false);
      }
    }
  };

  const saveCategory = () => {
    if (!currentCategory.id.trim() || !currentCategory.name.trim()) {
      alert('ID and name cannot be empty');
      return;
    }

    const existingIndex = categories.findIndex(c => c.id === currentCategory.id);
    
    if (existingIndex >= 0) {
      const updatedCategories = [...categories];
      updatedCategories[existingIndex] = currentCategory;
      setCategories(updatedCategories);
    } else {
      setCategories([...categories, currentCategory]);
    }
    
    setIsEditing(false);
    setCurrentCategory(null);
  };

  const toggleCategoryExpand = (id) => {
    if (expandedCategory === id) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(id);
    }
  };

  const getSubcategories = (parentId) => {
    return categories.filter(category => category.parentId === parentId);
  };

  const renderCategoryTree = (parentId = "") => {
    const topLevelCategories = categories
      .filter(category => category.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    return (
      <div className="space-y-2">
        {topLevelCategories.map(category => (
          <div 
            key={category.id} 
            className="bg-gray-50 rounded border border-gray-200"
            style={{borderLeft: `4px solid ${category.color}`}}
          >
            <div 
              className="p-2 cursor-pointer flex justify-between items-center"
              onClick={() => toggleCategoryExpand(category.id)}
            >
              <div className="flex items-center">
                <Folder size={16} className="mr-2 text-gray-600" />
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    editCategory(category);
                  }}
                  className="text-amber-600 hover:text-amber-800 p-1"
                  title="Edit category"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(category.id);
                  }}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete category"
                >
                  <Trash2 size={16} />
                </button>
                {getSubcategories(category.id).length > 0 && (
                  expandedCategory === category.id ? 
                    <ChevronUp size={18} /> : 
                    <ChevronDown size={18} />
                )}
              </div>
            </div>
            
            {expandedCategory === category.id && (
              <div className="pl-4 pr-2 pb-2">
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1 mb-2">{category.description}</p>
                )}
                {renderCategoryTree(category.id)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Categories</h2>
        <button 
          onClick={createNewCategory}
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
          title="Create new category"
        >
          <Plus size={18} />
        </button>
      </div>

      {isEditing && currentCategory ? (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {currentCategory.id ? 'Edit Category' : 'Create New Category'}
            </h3>
            <button 
              onClick={() => {
                setIsEditing(false);
                setCurrentCategory(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <input
                type="text"
                value={currentCategory.id}
                onChange={(e) => setCurrentCategory({...currentCategory, id: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="unique_id"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Category Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={currentCategory.description}
                onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Category description"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={currentCategory.color}
                  onChange={(e) => setCurrentCategory({...currentCategory, color: e.target.value})}
                  className="p-1 border border-gray-300 rounded h-10 w-20"
                />
                <span className="text-sm text-gray-600">{currentCategory.color}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <select
                value={currentCategory.parentId}
                onChange={(e) => setCurrentCategory({...currentCategory, parentId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">No Parent (Top Level)</option>
                {categories
                  .filter(c => c.id !== currentCategory.id) // Prevent self-reference
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={saveCategory}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              >
                <Save size={18} className="mr-1" /> Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {renderCategoryTree()}
          
          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No categories defined yet. Create your first one!
            </div>
          )}
        </>
      )}
    </div>
  );
};