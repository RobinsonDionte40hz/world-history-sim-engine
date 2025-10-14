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
 * Returns the base difficulty for a given connection type
 * @param {string} type - Connection type
 * @returns {number} Base difficulty (1-10)
 */
function getConnectionBaseDifficulty(type) {
  switch (type) {
    case ConnectionTypes.ROAD:
      return 1;
    case ConnectionTypes.RIVER:
      return 2;
    case ConnectionTypes.MOUNTAIN_PASS:
      return 6;
    case ConnectionTypes.SEA_ROUTE:
      return 4;
    case ConnectionTypes.TUNNEL:
      return 3;
    case ConnectionTypes.TELEPORT:
      return 1;
    case ConnectionTypes.BRIDGE:
      return 2;
    case ConnectionTypes.TRADE_ROUTE:
      return 2;
    default:
      return 1;
  }
}

export {
  ConnectionTypes,
  CONNECTION_TYPE_VALUES,
  isValidConnectionType,
  getConnectionBaseDifficulty
};

