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

module.exports = {
  ConnectionTypes,
  CONNECTION_TYPE_VALUES,
  isValidConnectionType
};
