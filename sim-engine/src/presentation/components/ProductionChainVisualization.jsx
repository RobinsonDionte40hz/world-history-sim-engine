/**
 * ProductionChainVisualization - Visual representation of production chains
 * 
 * Displays production recipes as an interactive flow diagram showing:
 * - Input resources and their quantities
 * - Production buildings and requirements
 * - Output items and yields
 * - Production time and complexity
 * - Dependencies and chains
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Box, Clock, Users, TrendingUp, Info, ChevronDown, ChevronRight } from 'lucide-react';

const ProductionChainVisualization = ({ 
  recipes = [], 
  items = [], 
  buildingTypes = [],
  selectedRecipeId = null,
  onRecipeSelect = null,
  showDependencies = true,
  compactMode = false
}) => {
  const [expandedRecipes, setExpandedRecipes] = useState(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [viewMode, setViewMode] = useState('flow'); // 'flow', 'tree', 'list'

  useEffect(() => {
    if (selectedRecipeId) {
      const recipe = recipes.find(r => r.id === selectedRecipeId);
      setSelectedRecipe(recipe);
    }
  }, [selectedRecipeId, recipes]);

  const recipeMap = useMemo(() => {
    const map = new Map();
    recipes.forEach(recipe => map.set(recipe.id, recipe));
    return map;
  }, [recipes]);

  const itemMap = useMemo(() => {
    const map = new Map();
    items.forEach(item => map.set(item.id, item));
    return map;
  }, [items]);

  const buildingTypeMap = useMemo(() => {
    const map = new Map();
    buildingTypes.forEach(bt => map.set(bt.id, bt));
    return map;
  }, [buildingTypes]);

  const toggleRecipeExpansion = (recipeId) => {
    const newExpanded = new Set(expandedRecipes);
    if (newExpanded.has(recipeId)) {
      newExpanded.delete(recipeId);
    } else {
      newExpanded.add(recipeId);
    }
    setExpandedRecipes(newExpanded);
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    if (onRecipeSelect) {
      onRecipeSelect(recipe);
    }
  };

  const getItemName = (itemId) => {
    return itemMap.get(itemId)?.name || itemId;
  };

  const getBuildingTypeName = (buildingTypeId) => {
    return buildingTypeMap.get(buildingTypeId)?.name || buildingTypeId;
  };

  const findDependentRecipes = (itemId) => {
    return recipes.filter(recipe => 
      recipe.inputs.some(input => input.itemId === itemId)
    );
  };

  const findProducerRecipes = (itemId) => {
    return recipes.filter(recipe =>
      recipe.outputs.some(output => output.itemId === itemId)
    );
  };

  const calculateChainDepth = (recipeId, visited = new Set()) => {
    if (visited.has(recipeId)) return 0;
    visited.add(recipeId);

    const recipe = recipeMap.get(recipeId);
    if (!recipe) return 0;

    let maxDepth = 0;
    for (const input of recipe.inputs) {
      const producers = findProducerRecipes(input.itemId);
      for (const producer of producers) {
        const depth = calculateChainDepth(producer.id, new Set(visited));
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return maxDepth + 1;
  };

  const renderRecipeCard = (recipe, depth = 0) => {
    const isExpanded = expandedRecipes.has(recipe.id);
    const isSelected = selectedRecipe?.id === recipe.id;
    const hasDependencies = recipe.inputs.some(input => 
      findProducerRecipes(input.itemId).length > 0
    );

    return (
      <div
        key={recipe.id}
        className={`mb-4 border rounded-lg shadow-sm transition-all ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
        }`}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div
          className="p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => handleRecipeClick(recipe)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {showDependencies && hasDependencies && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRecipeExpansion(recipe.id);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                )}
                <h3 className="text-lg font-semibold">{recipe.name}</h3>
              </div>
              
              {recipe.description && (
                <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
              )}

              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{recipe.productionTime} turns</span>
                </div>
                {recipe.requiredWorkers && (
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{recipe.requiredWorkers} workers</span>
                  </div>
                )}
                {recipe.buildingTypes && recipe.buildingTypes.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Box size={16} />
                    <span>{recipe.buildingTypes.map(getBuildingTypeName).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {!compactMode && (
              <div className="flex items-center gap-2 ml-4">
                <span className={`px-2 py-1 text-xs rounded ${
                  recipe.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                  recipe.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {recipe.complexity || 'simple'}
                </span>
              </div>
            )}
          </div>

          {/* Production Flow */}
          <div className="mt-4 flex items-center gap-4">
            {/* Inputs */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Inputs</span>
              {recipe.inputs.map((input, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                  <span className="text-sm font-medium">{getItemName(input.itemId)}</span>
                  <span className="text-xs text-gray-600">×{input.quantity}</span>
                </div>
              ))}
            </div>

            <ArrowRight className="text-gray-400" size={24} />

            {/* Outputs */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Outputs</span>
              {recipe.outputs.map((output, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-blue-100 rounded">
                  <span className="text-sm font-medium">{getItemName(output.itemId)}</span>
                  <span className="text-xs text-gray-600">×{output.quantity}</span>
                </div>
              ))}
            </div>

            {/* Byproducts */}
            {recipe.byproducts && recipe.byproducts.length > 0 && (
              <>
                <div className="text-gray-400">+</div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Byproducts</span>
                  {recipe.byproducts.map((byproduct, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-green-100 rounded">
                      <span className="text-sm font-medium">{getItemName(byproduct.itemId)}</span>
                      <span className="text-xs text-gray-600">{byproduct.chance * 100}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Skills and Requirements */}
          {!compactMode && (recipe.skill || recipe.prerequisites) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-6 text-sm">
                {recipe.skill && (
                  <div>
                    <span className="font-semibold text-gray-700">Required Skill: </span>
                    <span className="text-gray-600">{recipe.skill}</span>
                  </div>
                )}
                {recipe.prerequisites && Object.keys(recipe.prerequisites).length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-700">Prerequisites: </span>
                    <span className="text-gray-600">
                      {Object.entries(recipe.prerequisites).map(([key, val]) => 
                        `${key}: ${val}`
                      ).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Expanded Dependencies */}
        {isExpanded && showDependencies && (
          <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mt-3 mb-2">Input Dependencies:</h4>
            {recipe.inputs.map(input => {
              const producers = findProducerRecipes(input.itemId);
              return (
                <div key={input.itemId} className="ml-4 mb-3">
                  <div className="text-sm text-gray-600 mb-1">
                    {getItemName(input.itemId)} (×{input.quantity})
                  </div>
                  {producers.length > 0 ? (
                    <div className="ml-4">
                      {producers.map(producer => renderRecipeCard(producer, depth + 1))}
                    </div>
                  ) : (
                    <div className="ml-4 text-xs text-gray-500 italic">
                      Base resource (no recipe)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderTreeView = () => {
    // Group recipes by chain depth
    const recipesByDepth = new Map();
    recipes.forEach(recipe => {
      const depth = calculateChainDepth(recipe.id);
      if (!recipesByDepth.has(depth)) {
        recipesByDepth.set(depth, []);
      }
      recipesByDepth.get(depth).push(recipe);
    });

    const sortedDepths = Array.from(recipesByDepth.keys()).sort((a, b) => a - b);

    return (
      <div className="space-y-6">
        {sortedDepths.map(depth => (
          <div key={depth}>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Tier {depth} {depth === 0 ? '(Base Resources)' : `(${depth}-step chain)`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipesByDepth.get(depth).map(recipe => renderRecipeCard(recipe))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-2">
        {recipes.map(recipe => renderRecipeCard(recipe))}
      </div>
    );
  };

  const renderStats = () => {
    const totalRecipes = recipes.length;
    const avgInputs = recipes.reduce((sum, r) => sum + r.inputs.length, 0) / totalRecipes || 0;
    const avgOutputs = recipes.reduce((sum, r) => sum + r.outputs.length, 0) / totalRecipes || 0;
    const avgTime = recipes.reduce((sum, r) => sum + r.productionTime, 0) / totalRecipes || 0;
    const withByproducts = recipes.filter(r => r.byproducts?.length > 0).length;

    return (
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={20} />
          Production Chain Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Total Recipes</div>
            <div className="text-2xl font-bold">{totalRecipes}</div>
          </div>
          <div>
            <div className="text-gray-500">Avg Inputs</div>
            <div className="text-2xl font-bold">{avgInputs.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-500">Avg Outputs</div>
            <div className="text-2xl font-bold">{avgOutputs.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-500">Avg Time</div>
            <div className="text-2xl font-bold">{avgTime.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-500">With Byproducts</div>
            <div className="text-2xl font-bold">{withByproducts}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Production Chain Visualization</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('flow')}
            className={`px-4 py-2 rounded ${
              viewMode === 'flow' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Flow View
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 rounded ${
              viewMode === 'tree' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Tree View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded ${
              viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Statistics */}
      {!compactMode && renderStats()}

      {/* Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {recipes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Info size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No production recipes available</p>
            <p className="text-sm mt-2">Create recipes to visualize production chains</p>
          </div>
        ) : (
          <>
            {viewMode === 'flow' && renderListView()}
            {viewMode === 'tree' && renderTreeView()}
            {viewMode === 'list' && renderListView()}
          </>
        )}
      </div>

      {/* Selected Recipe Details */}
      {selectedRecipe && !compactMode && (
        <div className="mt-6 bg-white border border-blue-300 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Selected Recipe Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Recipe ID:</span> {selectedRecipe.id}
            </div>
            <div>
              <span className="font-semibold">Production Time:</span> {selectedRecipe.productionTime} turns
            </div>
            <div>
              <span className="font-semibold">Complexity:</span> {selectedRecipe.complexity || 'simple'}
            </div>
            <div>
              <span className="font-semibold">Required Workers:</span> {selectedRecipe.requiredWorkers || 'N/A'}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Chain Depth:</span> {calculateChainDepth(selectedRecipe.id)}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Dependent Recipes:</span>{' '}
              {selectedRecipe.outputs.flatMap(output => 
                findDependentRecipes(output.itemId)
              ).length || 'None'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionChainVisualization;
