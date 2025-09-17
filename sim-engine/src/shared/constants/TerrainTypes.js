/**
 * Terrain type constants for environmental system
 * Defines all available terrain types for nodes
 */
const TerrainTypes = {
  PLAINS: 'plains',
  FOREST: 'forest',
  MOUNTAINS: 'mountains',
  DESERT: 'desert',
  SWAMP: 'swamp',
  URBAN: 'urban',
  RUINS: 'ruins',
  UNDERGROUND: 'underground',
  COASTAL: 'coastal',
  TUNDRA: 'tundra'
};

/**
 * Array of all terrain type values for validation and iteration
 */
const TERRAIN_TYPE_VALUES = Object.values(TerrainTypes);

/**
 * Terrain type descriptions for UI display
 */
const TERRAIN_DESCRIPTIONS = {
  [TerrainTypes.PLAINS]: 'Open grasslands and fields',
  [TerrainTypes.FOREST]: 'Dense woodlands and groves',
  [TerrainTypes.MOUNTAINS]: 'High peaks and rocky terrain',
  [TerrainTypes.DESERT]: 'Arid wastelands and sand dunes',
  [TerrainTypes.SWAMP]: 'Wetlands and marshes',
  [TerrainTypes.URBAN]: 'Cities and settlements',
  [TerrainTypes.RUINS]: 'Ancient structures and abandoned places',
  [TerrainTypes.UNDERGROUND]: 'Caves, tunnels, and subterranean areas',
  [TerrainTypes.COASTAL]: 'Shores, beaches, and seaside areas',
  [TerrainTypes.TUNDRA]: 'Frozen plains and permafrost regions'
};

/**
 * Validates if a given value is a valid terrain type
 * @param {string} terrainType - The terrain type to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidTerrainType = (terrainType) => {
  return TERRAIN_TYPE_VALUES.includes(terrainType);
};

/**
 * Gets the description for a terrain type
 * @param {string} terrainType - The terrain type
 * @returns {string} The description or empty string if invalid
 */
const getTerrainDescription = (terrainType) => {
  return TERRAIN_DESCRIPTIONS[terrainType] || '';
};

module.exports = {
  TerrainTypes,
  TERRAIN_TYPE_VALUES,
  TERRAIN_DESCRIPTIONS,
  isValidTerrainType,
  getTerrainDescription
};