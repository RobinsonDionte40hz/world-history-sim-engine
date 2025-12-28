/**
 * BuildingManagementPanel - Comprehensive building management interface
 * 
 * Manages buildings within settlements including:
 * - Building list with status indicators
 * - Worker assignment and management
 * - Production queue management
 * - Storage and inventory tracking
 * - Construction and upgrades
 * - Building operations (start/stop/demolish)
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, Users, Package, Hammer, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, XCircle, PlusCircle, ArrowUpCircle, Trash2,
  Play, Pause, Settings, BarChart3, X
} from 'lucide-react';

const BuildingManagementPanel = ({
  settlement,
  buildings = [],
  characters = [],
  productionRecipes = [],
  buildingTypes = [],
  onAssignWorker = null,
  onUnassignWorker = null,
  onStartProduction = null,
  onStopProduction = null,
  onQueueRecipe = null,
  onConstructBuilding = null,
  onUpgradeBuilding = null,
  onDemolishBuilding = null,
  compactMode = false
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showConstructionModal, setShowConstructionModal] = useState(false);
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, construction, inactive
  const [sortBy, setSortBy] = useState('name'); // name, workers, production, storage

  const buildingTypeMap = useMemo(() => {
    const map = new Map();
    buildingTypes.forEach(bt => map.set(bt.id, bt));
    return map;
  }, [buildingTypes]);

  const availableWorkers = useMemo(() => {
    return characters.filter(c => 
      !c.jobAssignment?.employed && 
      c.assignments?.settlements?.has(settlement?.id)
    );
  }, [characters, settlement]);

  const filteredBuildings = useMemo(() => {
    let filtered = buildings;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => {
        if (filterStatus === 'active') return b.status === 'active';
        if (filterStatus === 'construction') return b.status === 'under_construction';
        if (filterStatus === 'inactive') return b.status === 'inactive';
        return true;
      });
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'workers':
          return b.getWorkerCount() - a.getWorkerCount();
        case 'production':
          return (b.production?.activeRecipes?.length || 0) - (a.production?.activeRecipes?.length || 0);
        case 'storage':
          const aUsage = Object.values(a.storage?.contents || {}).reduce((sum, q) => sum + q, 0);
          const bUsage = Object.values(b.storage?.contents || {}).reduce((sum, q) => sum + q, 0);
          return bUsage - aUsage;
        default:
          return 0;
      }
    });

    return filtered;
  }, [buildings, filterStatus, sortBy]);

  const getBuildingStatusColor = (building) => {
    if (building.status === 'active' && building.canOperate()) return 'text-green-600';
    if (building.status === 'under_construction') return 'text-yellow-600';
    if (building.status === 'upgrading') return 'text-blue-600';
    return 'text-red-600';
  };

  const getBuildingStatusIcon = (building) => {
    if (building.status === 'active' && building.canOperate()) return <CheckCircle size={20} />;
    if (building.status === 'under_construction') return <Clock size={20} />;
    if (building.status === 'upgrading') return <ArrowUpCircle size={20} />;
    return <XCircle size={20} />;
  };

  const renderBuildingCard = (building) => {
    const buildingType = buildingTypeMap.get(building.buildingTypeId);
    const workerCount = building.getWorkerCount();
    const workerCapacity = building.workers?.capacity || 0;
    const storageUsed = Object.values(building.storage?.contents || {}).reduce((sum, q) => sum + q, 0);
    const storageCapacity = building.storage?.capacity || 0;
    const activeProduction = building.production?.activeRecipes?.length || 0;
    const isSelected = selectedBuilding?.id === building.id;

    return (
      <div
        key={building.id}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-300 bg-white hover:bg-gray-50'
        }`}
        onClick={() => setSelectedBuilding(building)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 size={24} className={getBuildingStatusColor(building)} />
            <div>
              <h3 className="font-semibold text-lg">{building.name}</h3>
              <p className="text-sm text-gray-600">{buildingType?.name}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${getBuildingStatusColor(building)}`}>
            {getBuildingStatusIcon(building)}
            <span className="text-xs font-medium capitalize">{building.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Users size={16} className="text-gray-500" />
            <span className={workerCount < workerCapacity ? 'text-yellow-600' : 'text-gray-700'}>
              {workerCount}/{workerCapacity}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Package size={16} className="text-gray-500" />
            <span className={storageUsed > storageCapacity * 0.9 ? 'text-red-600' : 'text-gray-700'}>
              {storageUsed}/{storageCapacity}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Hammer size={16} className="text-gray-500" />
            <span className="text-gray-700">{activeProduction} active</span>
          </div>
        </div>

        {building.status === 'under_construction' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Construction Progress</span>
              <span>{building.constructionProgress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${building.constructionProgress || 0}%` }}
              />
            </div>
          </div>
        )}

        {building.maintenance && building.maintenance.health < 70 && (
          <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
            <AlertTriangle size={16} />
            <span>Needs maintenance ({building.maintenance.health}%)</span>
          </div>
        )}
      </div>
    );
  };

  const renderBuildingDetails = () => {
    if (!selectedBuilding) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Building2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Select a building to view details</p>
          </div>
        </div>
      );
    }

    const buildingType = buildingTypeMap.get(selectedBuilding.buildingTypeId);
    const workers = selectedBuilding.getWorkers().map(wId => 
      characters.find(c => c.id === wId)
    ).filter(w => w);

    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedBuilding.name}</h2>
              <p className="text-gray-600">{buildingType?.name}</p>
              <p className="text-sm text-gray-500 mt-1">{buildingType?.description}</p>
            </div>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Status and Actions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span className={`flex items-center gap-1 ${getBuildingStatusColor(selectedBuilding)}`}>
                  {getBuildingStatusIcon(selectedBuilding)}
                  <span className="capitalize">{selectedBuilding.status}</span>
                </span>
              </div>
              <div className="flex gap-2">
                {selectedBuilding.status === 'active' && (
                  <>
                    <button
                      onClick={() => onUpgradeBuilding?.(selectedBuilding)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                    >
                      <ArrowUpCircle size={16} />
                      Upgrade
                    </button>
                    <button
                      onClick={() => onDemolishBuilding?.(selectedBuilding)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Demolish
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Level:</span>
                <span className="ml-2 font-semibold">{selectedBuilding.level || 1}</span>
              </div>
              <div>
                <span className="text-gray-600">Efficiency:</span>
                <span className="ml-2 font-semibold">{(selectedBuilding.workers?.efficiency * 100 || 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-gray-600">Maintenance:</span>
                <span className="ml-2 font-semibold">{selectedBuilding.maintenance?.health || 100}%</span>
              </div>
              <div>
                <span className="text-gray-600">Operational:</span>
                <span className="ml-2 font-semibold">{selectedBuilding.canOperate() ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Workers Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users size={20} />
              Workers ({workers.length}/{selectedBuilding.workers?.capacity || 0})
            </h3>
            
            {workers.length > 0 ? (
              <div className="space-y-2">
                {workers.map(worker => (
                  <div key={worker.id} className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded">
                    <div>
                      <div className="font-medium">{worker.name}</div>
                      <div className="text-sm text-gray-600">
                        Productivity: {((worker.jobAssignment?.performance?.productivity || 0.5) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <button
                      onClick={() => onUnassignWorker?.(worker, selectedBuilding)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No workers assigned</p>
            )}

            {availableWorkers.length > 0 && workers.length < (selectedBuilding.workers?.capacity || 0) && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Available Workers</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableWorkers.slice(0, 5).map(worker => (
                    <div key={worker.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                      <span>{worker.name}</span>
                      <button
                        onClick={() => onAssignWorker?.(worker, selectedBuilding)}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Production Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Hammer size={20} />
              Production
            </h3>

            {selectedBuilding.production?.activeRecipes?.length > 0 ? (
              <div className="space-y-3">
                {selectedBuilding.production.activeRecipes.map(prod => {
                  const recipe = productionRecipes.find(r => r.id === prod.recipeId);
                  return (
                    <div key={prod.id} className="p-3 bg-white border border-gray-300 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{recipe?.name || prod.recipeId}</div>
                        <button
                          onClick={() => onStopProduction?.(selectedBuilding, prod.id)}
                          className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm flex items-center gap-1"
                        >
                          <Pause size={14} />
                          Stop
                        </button>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{prod.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${prod.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mb-3">No active production</p>
            )}

            {selectedBuilding.canOperate() && (
              <button
                onClick={() => {/* Open recipe selection modal */}}
                className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <PlusCircle size={18} />
                Start Production
              </button>
            )}
          </div>

          {/* Storage Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package size={20} />
              Storage
            </h3>
            
            <div className="mb-3 text-sm">
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Capacity</span>
                <span>
                  {Object.values(selectedBuilding.storage?.contents || {}).reduce((sum, q) => sum + q, 0)} / 
                  {selectedBuilding.storage?.capacity || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, (Object.values(selectedBuilding.storage?.contents || {}).reduce((sum, q) => sum + q, 0) / (selectedBuilding.storage?.capacity || 1)) * 100)}%` 
                  }}
                />
              </div>
            </div>

            {Object.keys(selectedBuilding.storage?.contents || {}).length > 0 ? (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {Object.entries(selectedBuilding.storage.contents).map(([itemId, quantity]) => (
                  <div key={itemId} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                    <span>{itemId}</span>
                    <span className="font-semibold">×{quantity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Storage is empty</p>
            )}
          </div>

          {/* Statistics */}
          {!compactMode && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BarChart3 size={20} />
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-gray-600">Total Productions</div>
                  <div className="text-2xl font-bold">{selectedBuilding.production?.history?.length || 0}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-gray-600">Queue Length</div>
                  <div className="text-2xl font-bold">{selectedBuilding.production?.queue?.length || 0}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-gray-600">Worker Efficiency</div>
                  <div className="text-2xl font-bold">{(selectedBuilding.workers?.efficiency * 100 || 100).toFixed(0)}%</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-gray-600">Storage Usage</div>
                  <div className="text-2xl font-bold">
                    {((Object.values(selectedBuilding.storage?.contents || {}).reduce((sum, q) => sum + q, 0) / (selectedBuilding.storage?.capacity || 1)) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Building Management</h2>
          <button
            onClick={() => setShowConstructionModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Construct Building
          </button>
        </div>

        {/* Filters and Sorting */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            >
              <option value="all">All Buildings</option>
              <option value="active">Active</option>
              <option value="construction">Under Construction</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            >
              <option value="name">Name</option>
              <option value="workers">Workers</option>
              <option value="production">Production</option>
              <option value="storage">Storage</option>
            </select>
          </div>

          <div className="ml-auto text-gray-600">
            {filteredBuildings.length} building{filteredBuildings.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Building List */}
        <div className="w-1/3 border-r border-gray-300 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {filteredBuildings.length > 0 ? (
            filteredBuildings.map(building => renderBuildingCard(building))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>No buildings found</p>
            </div>
          )}
        </div>

        {/* Building Details */}
        <div className="flex-1 bg-white">
          {renderBuildingDetails()}
        </div>
      </div>
    </div>
  );
};

export default BuildingManagementPanel;
