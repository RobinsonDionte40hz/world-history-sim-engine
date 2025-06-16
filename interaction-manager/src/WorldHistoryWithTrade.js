import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import { MarketSystem } from './MarketSystem.js';
import { MerchantAI, MerchantGuild } from './MerchantAI.js';

// Example integration with World History Simulation
const WorldHistoryWithTrade = () => {
  const [world, setWorld] = useState(null);
  const [tradeManager, setTradeManager] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [economicData, setEconomicData] = useState({
    totalTradeVolume: 0,
    averagePrices: {},
    topTradeRoutes: [],
    wealthiestMerchants: []
  });

  // Initialize world with trade system
  const initializeWorld = () => {
    // Create settlements
    const settlements = [
      {
        id: 'goldshire',
        name: 'Goldshire',
        type: 'town',
        population: 1500,
        position: { x: 100, y: 100 },
        node: { type: 'plains' },
        collectiveConsciousness: { frequency: 8 }
      },
      {
        id: 'ironhold',
        name: 'Ironhold',
        type: 'city',
        population: 5000,
        position: { x: 300, y: 200 },
        node: { type: 'mountain' },
        collectiveConsciousness: { frequency: 9 }
      },
      {
        id: 'rivertown',
        name: 'Rivertown',
        type: 'village',
        population: 500,
        position: { x: 200, y: 150 },
        node: { type: 'coast' },
        collectiveConsciousness: { frequency: 7 }
      }
    ];

    // Create world state
    const newWorld = {
      currentTime: 0,
      settlements,
      characters: [],
      resources: {
        types: ['food', 'wood', 'iron', 'luxury'],
        distribution: {}
      }
    };

    // Initialize market system
    const marketSystem = new MarketSystem();
    
    // Create markets for each settlement
    settlements.forEach(settlement => {
      marketSystem.createMarket(settlement, {
        size: settlement.type === 'city' ? 3 : settlement.type === 'town' ? 2 : 1,
        marketConfidence: 0.75,
        commodities: {
          food: { basePrice: 10, supply: 800, demand: 2000 },
          wood: { basePrice: 20, supply: 500, demand: 300 },
          iron: { basePrice: 40, supply: 200, demand: 400 }
        }
      });
    });

    // Create trade routes between settlements
    marketSystem.createTradeRoute(
      settlements[0], // Goldshire
      settlements[1], // Ironhold
      {
        distance: 200,
        risk: 0.2,
        commodities: ['food', 'wood']
      }
    );

    marketSystem.createTradeRoute(
      settlements[1], // Ironhold
      settlements[2], // Rivertown
      {
        distance: 150,
        risk: 0.3,
        commodities: ['iron', 'tools']
      }
    );

    // Create merchant guild
    const guild = new MerchantGuild('East Trading Company', settlements[0]);

    // Create merchants
    const merchants = new Map();
    const merchantData = [
      {
        id: 'marcus',
        name: 'Marcus Goldhand',
        attributes: { INT: 15, WIS: 12 },
        personality: { risktaking: 0.3, greed: 0.4 },
        consciousness: { currentFrequency: 10, emotionalCoherence: 0.8 },
        capital: 5000,
        location: settlements[0]
      },
      {
        id: 'elena',
        name: 'Elena Silvertongue',
        attributes: { INT: 13, WIS: 15 },
        personality: { risktaking: 0.2, greed: 0.3 },
        consciousness: { currentFrequency: 8, emotionalCoherence: 0.7 },
        capital: 4000,
        location: settlements[1]
      }
    ];

    merchantData.forEach(data => {
      const merchantAI = new MerchantAI(data, newWorld);
      merchants.set(data.id, merchantAI);
      guild.addMember(merchantAI);
    });

    // Create trade manager
    const tradeManager = {
      marketSystem,
      merchants,
      guild,
      economicStats: {
        totalTradeVolume: 0,
        averagePrices: { food: 10, wood: 20, iron: 50, luxury: 200 }
      }
    };

    setWorld(newWorld);
    setTradeManager(tradeManager);
    setCurrentDay(0);
  };

  // Simulate one day
  const simulateDay = () => {
    if (!world || !tradeManager) return;

    // Update world time
    const updatedWorld = { ...world, currentTime: world.currentTime + 1 };
    setWorld(updatedWorld);
    setCurrentDay(updatedWorld.currentTime);

    // Update markets
    tradeManager.marketSystem.updateMarkets();

    // Let merchants make decisions
    tradeManager.merchants.forEach(merchant => {
      merchant.makeDecisions();
    });

    // Calculate economic data
    const totalTradeVolume = Array.from(tradeManager.marketSystem.markets.values())
      .reduce((sum, market) => sum + market.totalTradeVolume, 0);

    const averagePrices = {};
    const allPrices = {};
    let priceCount = {};

    tradeManager.marketSystem.markets.forEach(market => {
      Object.entries(market.commodities).forEach(([commodity, data]) => {
        if (!allPrices[commodity]) {
          allPrices[commodity] = 0;
          priceCount[commodity] = 0;
        }
        allPrices[commodity] += data.currentPrice;
        priceCount[commodity]++;
      });
    });

    Object.keys(allPrices).forEach(commodity => {
      averagePrices[commodity] = allPrices[commodity] / priceCount[commodity];
    });

    // Get top trade routes
    const topTradeRoutes = Array.from(tradeManager.marketSystem.tradeRoutes.values())
      .map(route => ({
        from: route.origin.settlement.name,
        to: route.destination.settlement.name,
        profit: route.calculateProfitability(),
        goods: route.commodities
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    // Get wealthiest merchants
    const wealthiestMerchants = Array.from(tradeManager.merchants.values())
      .map(merchant => ({
        name: merchant.merchant.name,
        wealth: merchant.capital + merchant.inventory.getTotalValue(),
        strategy: merchant.strategy
      }))
      .sort((a, b) => b.wealth - a.wealth)
      .slice(0, 5);

    setEconomicData({
      totalTradeVolume,
      averagePrices,
      topTradeRoutes,
      wealthiestMerchants
    });
  };

  // Auto-simulation
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(simulateDay, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, world, tradeManager]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Trade Volume</p>
              <p className="text-2xl font-bold">{economicData.totalTradeVolume.toLocaleString()}g</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Markets</p>
              <p className="text-2xl font-bold">{tradeManager?.marketSystem.markets.size || 0}</p>
            </div>
            <Package className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Merchants</p>
              <p className="text-2xl font-bold">{tradeManager?.merchants.size || 0}</p>
            </div>
            <Users className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trade Routes</p>
              <p className="text-2xl font-bold">{tradeManager?.marketSystem.tradeRoutes.size || 0}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Average Commodity Prices</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(economicData.averagePrices).map(([commodity, price]) => (
            <div key={commodity} className="text-center">
              <p className="text-sm text-gray-600 capitalize">{commodity}</p>
              <p className="text-xl font-bold">{price.toFixed(1)}g</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Trade Routes</h3>
          <div className="space-y-2">
            {economicData.topTradeRoutes.map((route, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{route.from} → {route.to}</p>
                  <p className="text-sm text-gray-600">Goods: {route.goods.join(', ')}</p>
                </div>
                <p className="font-bold text-green-600">+{route.profit.toFixed(0)}g</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Wealthiest Merchants</h3>
          <div className="space-y-2">
            {economicData.wealthiestMerchants.map((merchant, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{merchant.name}</p>
                  <p className="text-sm text-gray-600">Strategy: {merchant.strategy}</p>
                </div>
                <p className="font-bold">{merchant.wealth.toLocaleString()}g</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettlements = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Settlement Markets</h3>
      {world?.settlements.map(settlement => {
        const market = tradeManager?.marketSystem.markets.get(settlement.id);
        return (
          <div key={settlement.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold">{settlement.name}</h4>
                <p className="text-sm text-gray-600">
                  {settlement.type} • Pop: {settlement.population.toLocaleString()}
                </p>
              </div>
              {market && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Market Confidence</p>
                  <p className={`font-bold ${
                    market.marketConfidence > 0.7 ? 'text-green-600' : 
                    market.marketConfidence > 0.4 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(market.marketConfidence * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
            
            {market && (
              <div className="grid grid-cols-3 gap-2 text-sm">
                {Object.entries(market.commodities).map(([commodity, data]) => (
                  <div key={commodity} className="bg-gray-50 p-2 rounded">
                    <p className="font-medium capitalize">{commodity}</p>
                    <p>Price: {data.currentPrice.toFixed(1)}g</p>
                    <p className="text-xs text-gray-600">S: {data.supply} / D: {data.demand}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">World History Simulation with Trade</h1>
        
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={initializeWorld}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <RefreshCw className="w-4 h-4" />
            Initialize World
          </button>
          
          {world && (
            <>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  isRunning 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start
                  </>
                )}
              </button>
              
              <button
                onClick={simulateDay}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Step Day
              </button>
              
              <div className="flex-1 text-right">
                <p className="text-lg font-semibold">Day {currentDay}</p>
              </div>
            </>
          )}
        </div>
        
        {world && (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-4 py-2 rounded ${
                selectedTab === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Economic Overview
            </button>
            <button
              onClick={() => setSelectedTab('settlements')}
              className={`px-4 py-2 rounded ${
                selectedTab === 'settlements'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Settlement Markets
            </button>
            <button
              onClick={() => setSelectedTab('history')}
              className={`px-4 py-2 rounded ${
                selectedTab === 'history'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Trade History
            </button>
          </div>
        )}
      </div>

      {!world ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-4">Click "Initialize World" to begin the simulation</p>
          <p>This will create a world with settlements, markets, and merchants</p>
        </div>
      ) : (
        <>
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'settlements' && renderSettlements()}
          {selectedTab === 'history' && (
            <div className="text-center py-12 text-gray-500">
              Trade history visualization coming soon...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorldHistoryWithTrade; 