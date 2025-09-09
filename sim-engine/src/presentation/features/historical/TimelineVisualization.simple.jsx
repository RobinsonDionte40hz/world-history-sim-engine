/**
 * TimelineVisualization Component - Simplified Version
 * 
 * A streamlined timeline visualization that focuses on core functionality
 * while maintaining the interface for testing and development.
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
// import { timelineConfig } from './config/timelineConfig'; // Not used in simplified version
import TimelineControls from './components/TimelineControls';
import TimelineTooltip from './components/TimelineTooltip';
import TimelineExport from './components/TimelineExport';

// Note: Simplified version - debounce not currently used
// const debounce = (func, wait) => {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// };

const TimelineVisualization = ({
  data = [],
  timeRange = null,
  filters = {},
  selectedTracks = ['characters', 'settlements', 'events'],
  zoom = 1,
  onEventSelect = () => {},
  onTimeRangeChange = () => {},
  className = '',
  width = 1200,
  height = 600
}) => {
  // Refs
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  // State
  const [viewport, setViewport] = useState({
    x: 0,
    y: 0,
    width,
    height,
    scale: zoom
  });
  // State management - simplified for this version
  // const [selectedEvents, setSelectedEvents] = useState([]);
  // const [hoveredEvent, setHoveredEvent] = useState(null);
  // const [selectedEvents, setSelectedEvents] = useState([]); // Not used in simplified version

  // Process data
  const processedData = useMemo(() => {
    if (!Array.isArray(data)) {
      return {
        tracks: [],
        eventsByTrack: { characters: [], settlements: [], events: [], wars: [] },
        timeScale: null
      };
    }

    // Filter and validate data
    const validData = data.filter(event => 
      event && 
      typeof event === 'object' && 
      event.timestamp
    );

    // Group by tracks
    const eventsByTrack = {
      characters: validData.filter(e => e.type === 'character' || e.characterId),
      settlements: validData.filter(e => e.type === 'settlement' || e.settlementId),
      events: validData.filter(e => !e.characterId && !e.settlementId),
      wars: validData.filter(e => e.type === 'conflict' || e.type === 'war')
    };

    return {
      tracks: Object.keys(eventsByTrack),
      eventsByTrack,
      timeScale: null // Simplified for now
    };
  }, [data]);

  // Simple render function
  const renderTimeline = useCallback(() => {
    if (!svgRef.current) return;

    // Basic SVG setup - simplified for testing
    const svg = svgRef.current;
    
    // Clear and setup basic structure
    svg.innerHTML = '';
    
    // Add basic elements for testing
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'timeline-content');
    svg.appendChild(group);

  }, []);

  // Effects
  useEffect(() => {
    renderTimeline();
  }, [renderTimeline, selectedTracks, processedData]);

  // Event handlers
  const handleZoomChange = useCallback((newZoom) => {
    setViewport(prev => ({ ...prev, scale: newZoom }));
  }, []);

  const handlePanChange = useCallback((deltaX, deltaY) => {
    setViewport(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);

  const handleTrackToggle = useCallback((trackId, enabled) => {
    // This would update selectedTracks if it were controlled by this component
    console.log('Track toggle:', trackId, enabled);
  }, []);

  // Event handlers for simplified version - commented out as not currently used
  // const handleEventClick = useCallback((event) => {
  //   // setSelectedEvents([event]); // Would be used for event selection
  //   onEventSelect(event);
  // }, [onEventSelect]);

  // const handleEventHover = useCallback((event) => {
  //   setHoveredEvent(event);
  // }, []);

  const handleExport = useCallback((format) => {
    switch (format) {
      case 'svg':
        console.log('Exporting as SVG');
        break;
      case 'png':
        console.log('Exporting as PNG');
        break;
      case 'json':
        console.log('Exporting as JSON');
        break;
      default:
        console.log('Unknown export format:', format);
    }
  }, []);

  return (
    <div 
      className={`relative w-full h-full bg-gray-50 rounded-lg border border-gray-200 font-sans dark:bg-gray-800 dark:border-gray-600 ${className}`}
      style={{ width, height }}
      role="application"
      aria-label="Historical Timeline Visualization"
    >
      {/* Controls */}
      <TimelineControls
        zoom={viewport.scale}
        onZoomChange={handleZoomChange}
        onPanChange={handlePanChange}
        onTrackToggle={handleTrackToggle}
        selectedTracks={selectedTracks}
        stats={{
          totalEvents: data.length,
          visibleEvents: data.length,
          timeRange: timeRange || { start: new Date(), end: new Date() }
        }}
      />

      {/* Timeline Container */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          width={width}
          height={height - 100} // Account for controls
          className="w-full h-full cursor-grab active:cursor-grabbing will-change-transform"
          style={{ backfaceVisibility: 'hidden' }}
          role="img"
          aria-label="Timeline events visualization"
        />
      </div>

      {/* Tooltip */}
      <TimelineTooltip
        ref={tooltipRef}
        event={null}
        visible={false}
      />

      {/* Export Controls */}
      <TimelineExport
        onExport={handleExport}
        disabled={!data.length}
      />
    </div>
  );
};

export default TimelineVisualization;
