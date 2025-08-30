/**
 * Connection type constants for node relationships
 * Defines all available connection types between nodes
 */
export const ConnectionTypes = {
  ROAD: 'road',
  RIVER: 'river',
  MOUNTAIN_PASS: 'mountain_pass',
  SEA_ROUTE: 'sea_route',
  TUNNEL: 'tunnel',
  TELEPORT: 'teleport',
  BRIDGE: 'bridge',
  TRADE_ROUTE: 'trade_route'
};

/**
 * Array of all connection type values for validation and iteration
 */
export const CONNECTION_TYPE_VALUES = Object.values(ConnectionTypes);

/**
 * Connection type descriptions for UI display
 */
export const CONNECTION_DESCRIPTIONS = {
  [ConnectionTypes.ROAD]: 'Well-maintained path suitable for travel and trade',
  [ConnectionTypes.RIVER]: 'Waterway connection allowing boat or raft travel',
  [ConnectionTypes.MOUNTAIN_PASS]: 'Treacherous route through mountainous terrain',
  [ConnectionTypes.SEA_ROUTE]: 'Ocean or large lake crossing by ship',
  [ConnectionTypes.TUNNEL]: 'Underground passage through or under obstacles',
  [ConnectionTypes.TELEPORT]: 'Magical or technological instant transportation',
  [ConnectionTypes.BRIDGE]: 'Constructed crossing over water or chasm',
  [ConnectionTypes.TRADE_ROUTE]: 'Commercial pathway with established merchants'
};

/**
 * Base difficulty modifiers for different connection types (1-10 scale)
 */
export const CONNECTION_BASE_DIFFICULTY = {
  [ConnectionTypes.ROAD]: 1,
  [ConnectionTypes.RIVER]: 2,
  [ConnectionTypes.MOUNTAIN_PASS]: 6,
  [ConnectionTypes.SEA_ROUTE]: 4,
  [ConnectionTypes.TUNNEL]: 3,
  [ConnectionTypes.TELEPORT]: 1,
  [ConnectionTypes.BRIDGE]: 2,
  [ConnectionTypes.TRADE_ROUTE]: 1
};

/**
 * Travel time multipliers for different connection types
 */
export const CONNECTION_TIME_MULTIPLIERS = {
  [ConnectionTypes.ROAD]: 1.0,
  [ConnectionTypes.RIVER]: 0.8,
  [ConnectionTypes.MOUNTAIN_PASS]: 2.0,
  [ConnectionTypes.SEA_ROUTE]: 1.5,
  [ConnectionTypes.TUNNEL]: 1.2,
  [ConnectionTypes.TELEPORT]: 0.1,
  [ConnectionTypes.BRIDGE]: 1.0,
  [ConnectionTypes.TRADE_ROUTE]: 0.9
};

/**
 * Safety modifiers for different connection types (higher = safer)
 */
export const CONNECTION_SAFETY_MODIFIERS = {
  [ConnectionTypes.ROAD]: 0.8,
  [ConnectionTypes.RIVER]: 0.6,
  [ConnectionTypes.MOUNTAIN_PASS]: 0.3,
  [ConnectionTypes.SEA_ROUTE]: 0.5,
  [ConnectionTypes.TUNNEL]: 0.4,
  [ConnectionTypes.TELEPORT]: 0.9,
  [ConnectionTypes.BRIDGE]: 0.7,
  [ConnectionTypes.TRADE_ROUTE]: 0.9
};

/**
 * Validates if a given value is a valid connection type
 * @param {string} connectionType - The connection type to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidConnectionType = (connectionType) => {
  return CONNECTION_TYPE_VALUES.includes(connectionType);
};

/**
 * Gets the description for a connection type
 * @param {string} connectionType - The connection type
 * @returns {string} The description or empty string if invalid
 */
export const getConnectionDescription = (connectionType) => {
  return CONNECTION_DESCRIPTIONS[connectionType] || '';
};

/**
 * Gets the base difficulty for a connection type
 * @param {string} connectionType - The connection type
 * @returns {number} The base difficulty (1-10) or 1 if invalid
 */
export const getConnectionBaseDifficulty = (connectionType) => {
  return CONNECTION_BASE_DIFFICULTY[connectionType] || 1;
};