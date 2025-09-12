// src/presentation/pages/HistoryPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useSimulationContext } from '../contexts/SimulationContext.js';
import { SkipForward, RotateCcw } from 'lucide-react';
import TimelineVisualization from '../features/historical/TimelineVisualization.jsx';
import TurnCounter from '../components/TurnCounter.js';
import simulationService from '../../application/use-cases/services/SimulationService.js';

const HistoryPage = () => {
  const { 
    analyzeHistory: contextAnalyzeHistory,
    currentTurn,
    canProcessTurn,
    processTurn,
    resetSimulation,
    isInitialized
  } = useSimulationContext();
  const [timelineData, setTimelineData] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState(['characters', 'settlements', 'events']);
  const [filters, setFilters] = useState({});
  const [timeRange, setTimeRange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load historical data on component mount
  const loadHistoryData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get events from the current world state
      const currentWorldState = simulationService.getCurrentWorldState();
      
      if (currentWorldState && currentWorldState.events) {
        console.log('Loading events from world state:', currentWorldState.events.length);
        
        // Transform the events for timeline visualization
        const transformedEvents = currentWorldState.events.map(event => ({
          ...event,
          track: determineEventTrack(event),
          x: event.timestamp,
          y: 0 // Will be calculated by timeline component
        }));

        setTimelineData(transformedEvents);
        
        // Set initial time range if we have data
        if (transformedEvents.length > 0) {
          const timestamps = transformedEvents.map(e => e.timestamp);
          setTimeRange({
            start: Math.min(...timestamps),
            end: Math.max(...timestamps)
          });
        }
      } else {
        console.log('No events found in world state');
        setTimelineData([]);
      }
    } catch (error) {
      console.error('Failed to load history data:', error);
      setTimelineData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

    useEffect(() => {
      loadHistoryData();
    }, [contextAnalyzeHistory, loadHistoryData]);

  // Determine which track an event belongs to
  const determineEventTrack = (event) => {
    if (event.characterId || event.characterName) return 'characters';
    if (event.settlementId || event.settlementName) return 'settlements';
    if (event.type === 'war' || event.type === 'battle' || event.type === 'war_start' || event.type === 'war_end') return 'wars';
    return 'events';
  };

  const handleEventSelect = (event) => {
    console.log('Selected event:', event);
    // Could open a detailed view or highlight related events
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  const handleTracksChange = (newTracks) => {
    setSelectedTracks(newTracks);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle turn processing
  const handleProcessTurn = async () => {
    if (!canProcessTurn || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await processTurn();
      // Reload timeline data after processing
      loadHistoryData();
    } catch (error) {
      console.error('Error processing turn:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle simulation reset
  const handleResetSimulation = async () => {
    if (window.confirm('Are you sure you want to reset the simulation? This will clear all historical data.')) {
      try {
        await resetSimulation();
        // Reload timeline data after reset
        loadHistoryData();
      } catch (error) {
        console.error('Error resetting simulation:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading historical timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Historical Timeline</h1>
              <p className="text-gray-600 mt-1">
                Interactive visualization of simulation history with {timelineData.length} events
              </p>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span>📊 {selectedTracks.length} tracks</span>
              <span>🔍 {Object.keys(filters).length} filters</span>
              <span>⏱️ {timelineData.length} events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TurnCounter 
                currentTurn={currentTurn} 
                className="text-lg font-semibold text-white bg-blue-700 px-3 py-1 rounded"
              />
              
              <button
                onClick={handleProcessTurn}
                disabled={!canProcessTurn || isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-4 h-4" />
                {isProcessing ? 'Processing...' : 'Process Turn'}
              </button>
              
              <button
                onClick={handleResetSimulation}
                className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className="text-sm opacity-75">
                  {isInitialized ? 'Simulation Active' : 'Not Initialized'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {timelineData.length > 0 ? (
            <TimelineVisualization
              data={timelineData}
              timeRange={timeRange}
              filters={filters}
              selectedTracks={selectedTracks}
              onEventSelect={handleEventSelect}
              onTimeRangeChange={handleTimeRangeChange}
              onTracksChange={handleTracksChange}
              onFiltersChange={handleFiltersChange}
              className="w-full"
              width={1200}
              height={600}
            />
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Historical Data</h3>
              <p className="text-gray-600 mb-6">
                Run some simulations to generate historical events that can be visualized on the timeline.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Simulation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Panel */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Timeline Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-800">
            <div>
              <strong>Navigation:</strong> Use mouse wheel to zoom, drag to pan, or use the control panel
            </div>
            <div>
              <strong>Filtering:</strong> Toggle tracks and apply filters to focus on specific events
            </div>
            <div>
              <strong>Export:</strong> Export timeline as SVG, PNG, or JSON for analysis and documentation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;