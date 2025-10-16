const ConnectionTypes = {
  ROAD: 'road',
  RIVER: 'river',
  MOUNTAIN_PASS: 'mountain_pass',
  SEA_ROUTE: 'sea_route',
  TUNNEL: 'tunnel',
  TELEPORT: 'teleport',
  BRIDGE: 'bridge',
  TRADE_ROUTE: 'trade_route'
};

const CONNECTION_TYPE_VALUES = Object.values(ConnectionTypes);

const isValidConnectionType = (connectionType) => {
  return CONNECTION_TYPE_VALUES.includes(connectionType);
};

/**
 * Descriptions for each connection type
 */
const CONNECTION_DESCRIPTIONS = {
  [ConnectionTypes.ROAD]: 'Well-maintained path suitable for travel and trade',
  [ConnectionTypes.RIVER]: 'Waterway connection allowing boat or raft travel',
  [ConnectionTypes.MOUNTAIN_PASS]: 'A treacherous route through mountainous terrain',
  [ConnectionTypes.SEA_ROUTE]: 'An ocean passage for maritime travel',
  [ConnectionTypes.TUNNEL]: 'An underground passage through obstacles',
  [ConnectionTypes.TELEPORT]: 'Magical or technological instant transportation',
  [ConnectionTypes.BRIDGE]: 'A structure spanning a gap or waterway',
  [ConnectionTypes.TRADE_ROUTE]: 'An established commercial pathway'
};

/**
 * Base difficulty values for each connection type (1-10)
 */
const CONNECTION_BASE_DIFFICULTY = {
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
 * Time multipliers for each connection type (affects travel time)
 */
const CONNECTION_TIME_MULTIPLIERS = {
  [ConnectionTypes.ROAD]: 1.0,
  [ConnectionTypes.RIVER]: 0.8,
  [ConnectionTypes.MOUNTAIN_PASS]: 2.0,
  [ConnectionTypes.SEA_ROUTE]: 1.2,
  [ConnectionTypes.TUNNEL]: 0.9,
  [ConnectionTypes.TELEPORT]: 0.1,
  [ConnectionTypes.BRIDGE]: 1.0,
  [ConnectionTypes.TRADE_ROUTE]: 0.9
};

/**
 * Safety modifiers for each connection type (0-1, higher is safer)
 */
const CONNECTION_SAFETY_MODIFIERS = {
  [ConnectionTypes.ROAD]: 0.8,
  [ConnectionTypes.RIVER]: 0.6,
  [ConnectionTypes.MOUNTAIN_PASS]: 0.3,
  [ConnectionTypes.SEA_ROUTE]: 0.5,
  [ConnectionTypes.TUNNEL]: 0.7,
  [ConnectionTypes.TELEPORT]: 0.9,
  [ConnectionTypes.BRIDGE]: 0.75,
  [ConnectionTypes.TRADE_ROUTE]: 0.85
};

/**
 * Returns the description for a given connection type
 * @param {string} type - Connection type
 * @returns {string} Description
 */
function getConnectionDescription(type) {
  return CONNECTION_DESCRIPTIONS[type] || '';
}

/**
 * Returns the base difficulty for a given connection type
 * @param {string} type - Connection type
 * @returns {number} Base difficulty (1-10)
 */
function getConnectionBaseDifficulty(type) {
  return CONNECTION_BASE_DIFFICULTY[type] || 1;
}

export {
  ConnectionTypes,
  CONNECTION_TYPE_VALUES,
  CONNECTION_DESCRIPTIONS,
  CONNECTION_BASE_DIFFICULTY,
  CONNECTION_TIME_MULTIPLIERS,
  CONNECTION_SAFETY_MODIFIERS,
  isValidConnectionType,
  getConnectionDescription,
  getConnectionBaseDifficulty
};

