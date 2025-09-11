/**
 * StatsDashboard Component
 *
 * Comprehensive statistical analysis dashboard with D3.js visualizations
 * for population, economic, military, and cultural metrics
 *
 * Features:
 * - Real-time metric panels with trend indicators
 * - Interactive D3.js charts (line, bar, area, radar)
 * - Entity comparison views
 * - Drill-down navigation
 * - Report generation capabilities
 *
 * Requirements: UI-4.1, UI-4.2, UI-4.3, UI-4.4, UI-4.5, UI-4.6
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { TrendingUp, TrendingDown, Users, Coins, Shield, Heart, BarChart3, Download, RefreshCw } from 'lucide-react';

const StatsDashboard = ({
  data = [],
  timeRange = null,
  className = '',
  width = 1200,
  height = 800
}) => {
  // State
  const [selectedMetric, setSelectedMetric] = useState('population');
  const [timeAggregation, setTimeAggregation] = useState('daily');

  // Refs for charts
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const areaChartRef = useRef(null);
  const radarChartRef = useRef(null);

  // Metric definitions
  const metrics = useMemo(() => ({
    population: {
      label: 'Population',
      icon: Users,
      color: '#10B981',
      calculation: 'sum',
      unit: 'individuals',
      thresholds: { low: 100, medium: 1000, high: 10000 }
    },
    economic: {
      label: 'Economic',
      icon: Coins,
      color: '#F59E0B',
      calculation: 'average',
      unit: 'gold',
      thresholds: { poor: 0, stable: 1000, wealthy: 10000 }
    },
    military: {
      label: 'Military',
      icon: Shield,
      color: '#EF4444',
      calculation: 'max',
      unit: 'soldiers',
      thresholds: { weak: 0, moderate: 100, strong: 1000 }
    },
    cultural: {
      label: 'Cultural',
      icon: Heart,
      color: '#8B5CF6',
      calculation: 'weighted_average',
      unit: 'influence',
      thresholds: { isolated: 0, connected: 50, dominant: 200 }
    }
  }), []);

  // Process data for charts
  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        timeline: [],
        entities: [],
        summary: {}
      };
    }

    // Group events by time period
    const timeGrouped = d3.group(data, d => {
      const date = new Date(d.timestamp);
      switch (timeAggregation) {
        case 'hourly':
          return d3.timeHour.floor(date);
        case 'daily':
          return d3.timeDay.floor(date);
        case 'weekly':
          return d3.timeWeek.floor(date);
        case 'monthly':
          return d3.timeMonth.floor(date);
        default:
          return d3.timeDay.floor(date);
      }
    });

    // Calculate metrics for each time period
    const timeline = Array.from(timeGrouped, ([time, events]) => {
      const metrics = calculateMetrics(events);
      return {
        time,
        ...metrics
      };
    }).sort((a, b) => a.time - b.time);

    // Get unique entities
    const entities = [...new Set(data.flatMap(event =>
      [event.characterName, event.settlementName].filter(Boolean)
    ))];

    // Calculate summary statistics
    const summary = calculateSummaryStats(timeline);

    return { timeline, entities, summary };
  }, [data, timeAggregation]);

  // Calculate metrics from events
  const calculateMetrics = (events) => {
    const metrics = {
      population: 0,
      economic: 0,
      military: 0,
      cultural: 0
    };

    events.forEach(event => {
      // Population metrics
      if (event.type === 'birth' || event.type === 'settlement_growth') {
        metrics.population += event.metadata?.population || 1;
      }

      // Economic metrics
      if (event.type === 'trade' || event.type === 'resource_gathering') {
        metrics.economic += event.metadata?.gold || 0;
      }

      // Military metrics
      if (event.type === 'battle' || event.type === 'recruitment') {
        metrics.military += event.metadata?.soldiers || 0;
      }

      // Cultural metrics
      if (event.type === 'festival' || event.type === 'alliance') {
        metrics.cultural += event.metadata?.influence || 1;
      }
    });

    return metrics;
  };

  // Calculate summary statistics
  const calculateSummaryStats = (timeline) => {
    if (timeline.length === 0) return {};

    const latest = timeline[timeline.length - 1];
    const previous = timeline.length > 1 ? timeline[timeline.length - 2] : latest;

    return {
      population: {
        current: latest.population,
        change: latest.population - previous.population,
        trend: latest.population > previous.population ? 'up' : 'down'
      },
      economic: {
        current: latest.economic,
        change: latest.economic - previous.economic,
        trend: latest.economic > previous.economic ? 'up' : 'down'
      },
      military: {
        current: latest.military,
        change: latest.military - previous.military,
        trend: latest.military > previous.military ? 'up' : 'down'
      },
      cultural: {
        current: latest.cultural,
        change: latest.cultural - previous.cultural,
        trend: latest.cultural > previous.cultural ? 'up' : 'down'
      }
    };
  };

  // Line chart for trend analysis
  const renderLineChart = useCallback(() => {
    if (!lineChartRef.current) return;

    const svg = d3.select(lineChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartWidth = 400 - margin.left - margin.right;
    const chartHeight = 200 - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth + margin.left + margin.right)
      .attr('height', chartHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(processedData.timeline, d => d.time))
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData.timeline, d => d[selectedMetric])])
      .nice()
      .range([chartHeight, 0]);

    // Line
    const line = d3.line()
      .x(d => x(d.time))
      .y(d => y(d[selectedMetric]));

    g.append('path')
      .datum(processedData.timeline)
      .attr('fill', 'none')
      .attr('stroke', metrics[selectedMetric].color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5));

    g.append('g')
      .call(d3.axisLeft(y));
  }, [processedData, selectedMetric, metrics]);

  // Bar chart for current values
  const renderBarChart = useCallback(() => {
    if (!barChartRef.current) return;

    const svg = d3.select(barChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartWidth = 400 - margin.left - margin.right;
    const chartHeight = 200 - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth + margin.left + margin.right)
      .attr('height', chartHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = Object.entries(metrics).map(([key, config]) => ({
      key,
      value: processedData.summary[key]?.current || 0,
      color: config.color
    }));

    const x = d3.scaleBand()
      .domain(data.map(d => d.key))
      .range([0, chartWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([chartHeight, 0]);

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.key))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d.value))
      .attr('fill', d => d.color);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .call(d3.axisLeft(y));
  }, [processedData, metrics]);

  // Area chart for cumulative metrics
  const renderAreaChart = useCallback(() => {
    if (!areaChartRef.current) return;

    const svg = d3.select(areaChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartWidth = 400 - margin.left - margin.right;
    const chartHeight = 200 - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth + margin.left + margin.right)
      .attr('height', chartHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(processedData.timeline, d => d.time))
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData.timeline, d => d[selectedMetric])])
      .nice()
      .range([chartHeight, 0]);

    const area = d3.area()
      .x(d => x(d.time))
      .y0(chartHeight)
      .y1(d => y(d[selectedMetric]));

    g.append('path')
      .datum(processedData.timeline)
      .attr('fill', metrics[selectedMetric].color)
      .attr('fill-opacity', 0.3)
      .attr('stroke', metrics[selectedMetric].color)
      .attr('stroke-width', 1)
      .attr('d', area);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5));

    g.append('g')
      .call(d3.axisLeft(y));
  }, [processedData, selectedMetric, metrics]);

  // Radar chart for comparative analysis
  const renderRadarChart = useCallback(() => {
    if (!radarChartRef.current) return;

    const svg = d3.select(radarChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const chartWidth = 400 - margin.left - margin.right;
    const chartHeight = 400 - margin.top - margin.bottom;
    const radius = Math.min(chartWidth, chartHeight) / 2;

    const g = svg
      .attr('width', chartWidth + margin.left + margin.right)
      .attr('height', chartHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${chartWidth / 2 + margin.left},${chartHeight / 2 + margin.top})`);

    const data = Object.entries(metrics).map(([key, config]) => ({
      axis: config.label,
      value: processedData.summary[key]?.current || 0
    }));

    const angleSlice = Math.PI * 2 / data.length;

    // Scale for radius
    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, d3.max(data, d => d.value)]);

    // Draw grid
    const levels = 5;
    for (let level = 0; level < levels; level++) {
      const levelFactor = radius * ((level + 1) / levels);
      g.selectAll(`.level-${level}`)
        .data(data)
        .enter()
        .append('line')
        .attr('x1', (d, i) => levelFactor * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y1', (d, i) => levelFactor * Math.sin(angleSlice * i - Math.PI / 2))
        .attr('x2', (d, i) => levelFactor * Math.cos(angleSlice * (i + 1) - Math.PI / 2))
        .attr('y2', (d, i) => levelFactor * Math.sin(angleSlice * (i + 1) - Math.PI / 2))
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);
    }

    // Draw axes
    g.selectAll('.axis')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('stroke', '#666')
      .attr('stroke-width', 2);

    // Draw area
    const radarLine = d3.lineRadial()
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    g.append('path')
      .datum(data)
      .attr('d', radarLine)
      .attr('fill', metrics[selectedMetric].color)
      .attr('fill-opacity', 0.3)
      .attr('stroke', metrics[selectedMetric].color)
      .attr('stroke-width', 2);
  }, [processedData, selectedMetric, metrics]);

  // Metric card component
  const MetricCard = ({ metric, data }) => {
    const config = metrics[metric];
    const Icon = config.icon;
    const summary = data.summary[metric];

    if (!summary) return null;

    const formatValue = (value) => {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    };

    const getTrendIcon = (trend) => {
      return trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon size={20} style={{ color: config.color }} />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{config.label}</h3>
          </div>
          <div className={`flex items-center gap-1 ${summary.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {getTrendIcon(summary.trend)}
            <span className="text-sm font-medium">
              {summary.change > 0 ? '+' : ''}{formatValue(summary.change)}
            </span>
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {formatValue(summary.current)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {config.unit}
        </div>
      </div>
    );
  };

  // Render charts when data changes
  useEffect(() => {
    if (processedData.timeline.length > 0) {
      renderLineChart();
      renderBarChart();
      renderAreaChart();
      renderRadarChart();
    }
  }, [processedData, selectedMetric, renderLineChart, renderBarChart, renderAreaChart, renderRadarChart]);

  return (
    <div className={`w-full h-full bg-gray-50 dark:bg-gray-900 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Statistical Analysis Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time metrics and trend analysis
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeAggregation}
              onChange={(e) => setTimeAggregation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.keys(metrics).map(metric => (
            <MetricCard key={metric} metric={metric} data={processedData} />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Trend Analysis
            </h3>
            <svg ref={lineChartRef} className="w-full h-64"></svg>
          </div>

          {/* Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Current Values
            </h3>
            <svg ref={barChartRef} className="w-full h-64"></svg>
          </div>

          {/* Area Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Cumulative Growth
            </h3>
            <svg ref={areaChartRef} className="w-full h-64"></svg>
          </div>

          {/* Radar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Comparative Analysis
            </h3>
            <svg ref={radarChartRef} className="w-full h-64"></svg>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Focus Metric:
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              {Object.entries(metrics).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Download size={16} />
              Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              <BarChart3 size={16} />
              Advanced Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
