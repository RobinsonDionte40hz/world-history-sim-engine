import React, { useState, useEffect, useMemo } from 'react';
import { 
  Swords, TrendingUp, Users, Crown, AlertTriangle, 
  Globe, Activity, ChevronDown, Shield, Coins,
  MessageCircle, Brain, BarChart2
} from 'lucide-react';

const WorldEventDashboard = ({ world, systems }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timeScale, setTimeScale] = useState('day');
  const [notifications, setNotifications] = useState([]);

  // Mock data for demonstration
  const mockEvents = useMemo(() => ({
    wars: [
      {
        id: 'war1',
        name: 'The Northern Rebellion',
        phase: 'active',
        momentum: 15,
        belligerents: {
          attackers: ['Northern Lords'],
          defenders: ['Royal Crown']
        },
        casualties: {
          military: { attackers: 2500, defenders: 1800 },
          civilian: { attackers: 500, defenders: 1200 }
        }
      }
    ],
    trade: {
      routes: 12,
      totalVolume: 45000,
      marketConfidence: 0.72,
      topCommodities: [
        { name: 'Iron', price: 52, trend: 'up' },
        { name: 'Food', price: 11, trend: 'stable' },
        { name: 'Luxury', price: 215, trend: 'down' }
      ]
    },
    diplomatic: [
      {
        id: 'treaty1',
        type: 'trade_agreement',
        parties: ['Kingdom A', 'Kingdom B'],
        status: 'negotiating',
        rounds: 3
      }
    ],
    political: {
      successionCrisis: false,
      courtIntrigues: 3,
      stability: 78
    }
  }), []);

  // Simulate consciousness data
  const consciousnessData = useMemo(() => ({
    collectiveFrequency: 7.8,
    fearLevel: 0.3,
    hopeLevel: 0.6,
    activeHeroes: 2,
    transformations: [
      { 
        npc: 'John the Farmer',
        from: 'farmer',
        to: 'aspiring knight',
        trigger: 'family saved'
      }
    ]
  }), []);

  return (
    <div className="w-full h-full bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">World Event Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-1">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm">Simulation Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Time Scale:</span>
            <select 
              value={timeScale} 
              onChange={(e) => setTimeScale(e.target.value)}
              className="bg-gray-800 rounded px-2 py-1 text-sm"
            >
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: Globe },
          { id: 'war', label: 'Wars', icon: Swords },
          { id: 'trade', label: 'Trade', icon: TrendingUp },
          { id: 'diplomacy', label: 'Diplomacy', icon: MessageCircle },
          { id: 'politics', label: 'Politics', icon: Crown },
          { id: 'consciousness', label: 'Consciousness', icon: Brain }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="col-span-2 space-y-4">
          {activeTab === 'overview' && <OverviewPanel events={mockEvents} consciousness={consciousnessData} />}
          {activeTab === 'war' && <WarPanel wars={mockEvents.wars} />}
          {activeTab === 'trade' && <TradePanel trade={mockEvents.trade} />}
          {activeTab === 'diplomacy' && <DiplomacyPanel treaties={mockEvents.diplomatic} />}
          {activeTab === 'politics' && <PoliticsPanel politics={mockEvents.political} />}
          {activeTab === 'consciousness' && <ConsciousnessPanel data={consciousnessData} />}
        </div>

        {/* Notifications Panel */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Recent Events
          </h3>
          <NotificationList notifications={notifications} />
        </div>
      </div>
    </div>
  );
};

// Overview Panel
const OverviewPanel = ({ events, consciousness }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        title="Active Conflicts"
        value={events.wars.length}
        icon={Swords}
        color="red"
        trend="+2 this month"
      />
      <StatCard
        title="Trade Volume"
        value={`${(events.trade.totalVolume / 1000).toFixed(1)}k`}
        icon={Coins}
        color="green"
        trend="+12% this week"
      />
      <StatCard
        title="Diplomatic Relations"
        value="78%"
        icon={MessageCircle}
        color="blue"
        trend="Stable"
      />
      <StatCard
        title="Collective Frequency"
        value={`${consciousness.collectiveFrequency} Hz`}
        icon={Brain}
        color="purple"
        trend="Rising slowly"
      />
    </div>

    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">World Status</h3>
      <div className="space-y-2">
        <StatusBar label="Stability" value={78} color="green" />
        <StatusBar label="Fear Level" value={consciousness.fearLevel * 100} color="red" />
        <StatusBar label="Hope Level" value={consciousness.hopeLevel * 100} color="blue" />
        <StatusBar label="Market Confidence" value={events.trade.marketConfidence * 100} color="yellow" />
      </div>
    </div>
  </div>
);

// War Panel
const WarPanel = ({ wars }) => (
  <div className="space-y-4">
    {wars.map(war => (
      <div key={war.id} className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{war.name}</h3>
            <span className={`text-sm px-2 py-1 rounded ${
              war.phase === 'active' ? 'bg-red-600' : 'bg-orange-600'
            }`}>
              {war.phase.toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">War Momentum</div>
            <div className={`text-2xl font-bold ${
              war.momentum > 0 ? 'text-red-400' : 'text-blue-400'
            }`}>
              {war.momentum > 0 ? '+' : ''}{war.momentum}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Attackers</h4>
            {war.belligerents.attackers.map(faction => (
              <div key={faction} className="text-sm">{faction}</div>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Defenders</h4>
            {war.belligerents.defenders.map(faction => (
              <div key={faction} className="text-sm">{faction}</div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Casualties</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Shield className="w-4 h-4 inline mr-1" />
              Military: {war.casualties.military.attackers} / {war.casualties.military.defenders}
            </div>
            <div>
              <Users className="w-4 h-4 inline mr-1" />
              Civilian: {war.casualties.civilian.attackers} / {war.casualties.civilian.defenders}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Trade Panel
const TradePanel = ({ trade }) => (
  <div className="space-y-4">
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{trade.routes}</div>
          <div className="text-sm text-gray-400">Active Routes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {(trade.totalVolume / 1000).toFixed(1)}k
          </div>
          <div className="text-sm text-gray-400">Total Volume</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {(trade.marketConfidence * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-400">Confidence</div>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Commodity Prices</h3>
      <div className="space-y-3">
        {trade.topCommodities.map(commodity => (
          <div key={commodity.name} className="flex items-center justify-between">
            <span className="font-medium">{commodity.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-lg">{commodity.price}g</span>
              <span className={`text-sm px-2 py-1 rounded ${
                commodity.trend === 'up' ? 'bg-green-600' :
                commodity.trend === 'down' ? 'bg-red-600' :
                'bg-gray-600'
              }`}>
                {commodity.trend === 'up' ? '↑' : 
                 commodity.trend === 'down' ? '↓' : '−'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Consciousness Panel
const ConsciousnessPanel = ({ data }) => (
  <div className="space-y-4">
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Collective Consciousness</h3>
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span>Frequency</span>
          <span className="font-bold">{data.collectiveFrequency} Hz</span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
            style={{ width: `${(data.collectiveFrequency / 20) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-400">Active Heroes</div>
          <div className="text-2xl font-bold text-yellow-400">{data.activeHeroes}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Transformations</div>
          <div className="text-2xl font-bold text-green-400">{data.transformations.length}</div>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Transformations</h3>
      <div className="space-y-3">
        {data.transformations.map((transformation, index) => (
          <div key={index} className="border-l-4 border-purple-500 pl-3">
            <div className="font-medium">{transformation.npc}</div>
            <div className="text-sm text-gray-400">
              {transformation.from} → {transformation.to}
            </div>
            <div className="text-xs text-purple-400">
              Trigger: {transformation.trigger}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Helper Components
const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <div className="flex items-start justify-between mb-2">
      <Icon className={`w-8 h-8 text-${color}-400`} />
      <span className="text-xs text-gray-400">{trend}</span>
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-sm text-gray-400">{title}</div>
  </div>
);

const StatusBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      <span>{value.toFixed(0)}%</span>
    </div>
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div 
        className={`h-full bg-${color}-500 transition-all`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const NotificationList = ({ notifications }) => {
  const mockNotifications = [
    {
      id: 1,
      type: 'war',
      title: 'Battle of Northbridge',
      description: 'Decisive victory for the defenders',
      time: '2 hours ago',
      importance: 'high'
    },
    {
      id: 2,
      type: 'trade',
      title: 'Market Crash in Eastport',
      description: 'Iron prices plummet 40%',
      time: '5 hours ago',
      importance: 'medium'
    },
    {
      id: 3,
      type: 'consciousness',
      title: 'Heroic Transformation',
      description: 'Farmer John begins knight training',
      time: '1 day ago',
      importance: 'low'
    }
  ];

  return (
    <div className="space-y-3">
      {mockNotifications.map(notification => (
        <div 
          key={notification.id} 
          className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-600 transition-colors"
        >
          <div className="flex items-start gap-2">
            <div className={`w-2 h-2 rounded-full mt-1.5 ${
              notification.importance === 'high' ? 'bg-red-400' :
              notification.importance === 'medium' ? 'bg-yellow-400' :
              'bg-green-400'
            }`} />
            <div className="flex-1">
              <div className="font-medium text-sm">{notification.title}</div>
              <div className="text-xs text-gray-400 mt-1">{notification.description}</div>
              <div className="text-xs text-gray-500 mt-2">{notification.time}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Placeholder panels
const DiplomacyPanel = ({ treaties }) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <h3 className="text-lg font-semibold mb-4">Active Negotiations</h3>
    <div className="text-gray-400">
      {treaties.length} ongoing diplomatic negotiations...
    </div>
  </div>
);

const PoliticsPanel = ({ politics }) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <h3 className="text-lg font-semibold mb-4">Political Status</h3>
    <div className="space-y-2">
      <div>Court Intrigues: {politics.courtIntrigues}</div>
      <div>Stability: {politics.stability}%</div>
    </div>
  </div>
);

export default WorldEventDashboard; 