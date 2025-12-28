/**
 * MarketDashboard - Comprehensive market and economic visualization
 * 
 * Displays market information including:
 * - Item prices with supply/demand indicators
 * - Price history charts with trend analysis
 * - Trade opportunities between settlements
 * - Market events and economic impacts
 * - Supply/demand analysis
 * - Price comparison across settlements
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, DollarSign, BarChart3, 
  Activity, AlertCircle, Package, ArrowUpDown, LineChart,
  ShoppingCart, Target, Calendar
} from 'lucide-react';

const MarketDashboard = ({
  settlement,
  settlements = [],
  items = [],
  marketData = {}, // { settlementId -> { itemId -> { price, supply, demand, priceHistory } } }
  tradeOpportunities = [],
  economicEvents = [],
  onSelectItem = null,
  onSelectSettlement = null,
  showCharts = true,
  compactMode = false
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(settlement);
  const [timeRange, setTimeRange] = useState(30); // Last N turns
  const [sortBy, setSortBy] = useState('name'); // name, price, supply, demand, change
  const [filterCategory, setFilterCategory] = useState('all');

  const itemMap = useMemo(() => {
    const map = new Map();
    items.forEach(item => map.set(item.id, item));
    return map;
  }, [items]);

  const settlementMarket = useMemo(() => {
    return marketData[selectedSettlement?.id] || {};
  }, [marketData, selectedSettlement]);

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Sort items
    filtered = [...filtered].sort((a, b) => {
      const aMarket = settlementMarket[a.id] || {};
      const bMarket = settlementMarket[b.id] || {};

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return (bMarket.price || 0) - (aMarket.price || 0);
        case 'supply':
          return (bMarket.supply || 0) - (aMarket.supply || 0);
        case 'demand':
          return (bMarket.demand || 0) - (aMarket.demand || 0);
        case 'change':
          return calculatePriceChange(bMarket) - calculatePriceChange(aMarket);
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, filterCategory, sortBy, settlementMarket]);

  const calculatePriceChange = (marketInfo) => {
    if (!marketInfo?.priceHistory || marketInfo.priceHistory.length < 2) {
      return 0;
    }
    const history = marketInfo.priceHistory;
    const current = history[history.length - 1]?.price || 0;
    const previous = history[history.length - 2]?.price || current;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const getTrendIcon = (change) => {
    if (change > 5) return <TrendingUp className="text-green-600" size={20} />;
    if (change < -5) return <TrendingDown className="text-red-600" size={20} />;
    return <Minus className="text-gray-400" size={20} />;
  };

  const getSupplyStatus = (supply) => {
    if (supply > 100) return { label: 'Abundant', color: 'text-green-600', bg: 'bg-green-100' };
    if (supply > 50) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (supply > 10) return { label: 'Low', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const renderPriceChart = (itemId) => {
    const marketInfo = settlementMarket[itemId];
    if (!marketInfo?.priceHistory || marketInfo.priceHistory.length === 0) {
      return (
        <div className="h-40 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <LineChart size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No price history</p>
          </div>
        </div>
      );
    }

    const history = marketInfo.priceHistory.slice(-timeRange);
    const maxPrice = Math.max(...history.map(h => h.price));
    const minPrice = Math.min(...history.map(h => h.price));
    const range = maxPrice - minPrice || 1;

    return (
      <div className="relative h-40 bg-gray-50 rounded p-4">
        <svg className="w-full h-full">
          <polyline
            points={history.map((h, i) => {
              const x = (i / (history.length - 1)) * 100;
              const y = 100 - ((h.price - minPrice) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          {history.map((h, i) => {
            const x = (i / (history.length - 1)) * 100;
            const y = 100 - ((h.price - minPrice) / range) * 100;
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r="3"
                fill="#3B82F6"
              />
            );
          })}
        </svg>
        <div className="absolute top-2 left-2 text-xs text-gray-600">
          High: {maxPrice.toFixed(1)}
        </div>
        <div className="absolute bottom-2 left-2 text-xs text-gray-600">
          Low: {minPrice.toFixed(1)}
        </div>
      </div>
    );
  };

  const renderItemCard = (item) => {
    const marketInfo = settlementMarket[item.id] || {};
    const price = marketInfo.price || item.market?.basePrice || 10;
    const supply = marketInfo.supply || 0;
    const demand = marketInfo.demand || 1.0;
    const priceChange = calculatePriceChange(marketInfo);
    const supplyStatus = getSupplyStatus(supply);
    const isSelected = selectedItem?.id === item.id;

    return (
      <div
        key={item.id}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-300 bg-white hover:bg-gray-50'
        }`}
        onClick={() => {
          setSelectedItem(item);
          onSelectItem?.(item);
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.category || 'Uncategorized'}</p>
          </div>
          {getTrendIcon(priceChange)}
        </div>

        <div className="space-y-2">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <DollarSign size={16} />
              Price
            </span>
            <span className="font-bold text-lg">{price.toFixed(1)}</span>
          </div>

          {/* Supply */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Package size={16} />
              Supply
            </span>
            <span className={`text-sm px-2 py-1 rounded ${supplyStatus.bg} ${supplyStatus.color} font-semibold`}>
              {supply} ({supplyStatus.label})
            </span>
          </div>

          {/* Demand */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Target size={16} />
              Demand
            </span>
            <span className="font-semibold">{(demand * 100).toFixed(0)}%</span>
          </div>

          {/* Price Change */}
          {priceChange !== 0 && (
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">Change</span>
              <span className={`text-sm font-semibold ${
                priceChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMarketOverview = () => {
    const totalItems = filteredItems.length;
    const avgPrice = filteredItems.reduce((sum, item) => {
      const price = settlementMarket[item.id]?.price || item.market?.basePrice || 0;
      return sum + price;
    }, 0) / totalItems || 0;

    const risingPrices = filteredItems.filter(item => 
      calculatePriceChange(settlementMarket[item.id] || {}) > 5
    ).length;

    const fallingPrices = filteredItems.filter(item =>
      calculatePriceChange(settlementMarket[item.id] || {}) < -5
    ).length;

    const lowSupply = filteredItems.filter(item =>
      (settlementMarket[item.id]?.supply || 0) < 10
    ).length;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white border border-gray-300 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <ShoppingCart size={18} />
            <span className="text-sm">Total Items</span>
          </div>
          <div className="text-2xl font-bold">{totalItems}</div>
        </div>

        <div className="p-4 bg-white border border-gray-300 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <DollarSign size={18} />
            <span className="text-sm">Avg Price</span>
          </div>
          <div className="text-2xl font-bold">{avgPrice.toFixed(1)}</div>
        </div>

        <div className="p-4 bg-white border border-gray-300 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <TrendingUp size={18} />
            <span className="text-sm">Rising</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{risingPrices}</div>
        </div>

        <div className="p-4 bg-white border border-gray-300 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertCircle size={18} />
            <span className="text-sm">Low Supply</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{lowSupply}</div>
        </div>
      </div>
    );
  };

  const renderTradeOpportunities = () => {
    if (tradeOpportunities.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Activity size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No trade opportunities available</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {tradeOpportunities.slice(0, 5).map((opp, idx) => (
          <div key={idx} className="p-4 bg-white border border-gray-300 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold">{itemMap.get(opp.itemId)?.name || opp.itemId}</div>
                <div className="text-sm text-gray-600">
                  {opp.fromSettlement} → {opp.toSettlement}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  +{opp.profitMargin.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Profit: {opp.profit.toFixed(1)}</div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Buy: {opp.buyPrice.toFixed(1)}</span>
              <span className="text-gray-600">Sell: {opp.sellPrice.toFixed(1)}</span>
              <span className="text-gray-600">Qty: {opp.quantity}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEconomicEvents = () => {
    if (economicEvents.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Calendar size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent economic events</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {economicEvents.slice(0, 5).map((event, idx) => (
          <div key={idx} className="p-4 bg-white border border-gray-300 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-orange-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-semibold">{event.name}</div>
                <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>Settlement: {event.settlementName}</span>
                  <span>Turn: {event.startTurn}</span>
                  <span>Duration: {event.duration} turns</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSelectedItemDetails = () => {
    if (!selectedItem) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Select an item to view details</p>
          </div>
        </div>
      );
    }

    const marketInfo = settlementMarket[selectedItem.id] || {};

    return (
      <div className="p-6 h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
        <p className="text-gray-600 mb-6">{selectedItem.description || 'No description available'}</p>

        {/* Price Chart */}
        {showCharts && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <LineChart size={20} />
              Price History
            </h3>
            {renderPriceChart(selectedItem.id)}
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setTimeRange(10)}
                className={`px-3 py-1 text-sm rounded ${timeRange === 10 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                10 turns
              </button>
              <button
                onClick={() => setTimeRange(30)}
                className={`px-3 py-1 text-sm rounded ${timeRange === 30 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                30 turns
              </button>
              <button
                onClick={() => setTimeRange(100)}
                className={`px-3 py-1 text-sm rounded ${timeRange === 100 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                100 turns
              </button>
            </div>
          </div>
        )}

        {/* Market Statistics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BarChart3 size={20} />
            Market Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Current Price</div>
              <div className="text-2xl font-bold">{(marketInfo.price || selectedItem.market?.basePrice || 0).toFixed(1)}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Base Price</div>
              <div className="text-2xl font-bold">{(selectedItem.market?.basePrice || 0).toFixed(1)}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Supply</div>
              <div className="text-2xl font-bold">{marketInfo.supply || 0}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Demand</div>
              <div className="text-2xl font-bold">{((marketInfo.demand || 1.0) * 100).toFixed(0)}%</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Volatility</div>
              <div className="text-2xl font-bold">{((selectedItem.market?.volatility || 0.1) * 100).toFixed(0)}%</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Price Change</div>
              <div className={`text-2xl font-bold ${
                calculatePriceChange(marketInfo) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {calculatePriceChange(marketInfo).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Settlement Comparison */}
        {!compactMode && settlements.length > 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Price Comparison</h3>
            <div className="space-y-2">
              {settlements.map(s => {
                const sMarket = marketData[s.id]?.[selectedItem.id] || {};
                const sPrice = sMarket.price || selectedItem.market?.basePrice || 0;
                return (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-lg font-bold">{sPrice.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-white">
        <h2 className="text-2xl font-bold mb-4">Market Dashboard</h2>

        {/* Settlement Selector */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-600">Settlement:</span>
          <select
            value={selectedSettlement?.id || ''}
            onChange={(e) => {
              const settlement = settlements.find(s => s.id === e.target.value);
              setSelectedSettlement(settlement);
              onSelectSettlement?.(settlement);
            }}
            className="border border-gray-300 rounded px-3 py-2"
          >
            {settlements.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Filters and Sorting */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            >
              <option value="all">All Categories</option>
              <option value="food">Food</option>
              <option value="materials">Materials</option>
              <option value="tools">Tools</option>
              <option value="luxury">Luxury</option>
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
              <option value="price">Price</option>
              <option value="supply">Supply</option>
              <option value="demand">Demand</option>
              <option value="change">Price Change</option>
            </select>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="p-4 bg-gray-50">
        {renderMarketOverview()}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Item List */}
        <div className="w-1/3 border-r border-gray-300 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {filteredItems.map(item => renderItemCard(item))}
        </div>

        {/* Details Panel */}
        <div className="flex-1 bg-white">
          {renderSelectedItemDetails()}
        </div>
      </div>

      {/* Side Panels */}
      {!compactMode && (
        <div className="border-t border-gray-300 p-4 bg-white">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Activity size={20} />
                Trade Opportunities
              </h3>
              {renderTradeOpportunities()}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle size={20} />
                Economic Events
              </h3>
              {renderEconomicEvents()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketDashboard;
