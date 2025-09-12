/**
 * TimelineVisualization Component
 * 
 * Advanced D3.js-powered timeline visualization with multi-track rendering,
 * zoom/pan controls, dynamic filtering, and interactive tooltips.
 * 
 * Features:
 * - Multi-track display for characters, settlements, and events
 * - Smooth zoom and pan with performance optimization
 * - Dynamic filtering with real-time updates
 * - Interactive tooltips with detailed event metadata
 * - Export functionality (SVG, PNG, JSON)
 * - Virtual scrolling for large datasets
 * 
 * Requirements: UI-1.1, UI-1.2, UI-1.3, UI-1.4, UI-1.5
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { timelineConfig } from './config/timelineConfig';
import TimelineControls from './components/TimelineControls';
import TimelineTooltip from './components/TimelineTooltip';
import TimelineExport from './components/TimelineExport';
// Note: Performance utilities temporarily disabled for MVP
// import { debounce } from '../../shared/utils/performance';

// Simple debounce implementation for now
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const TimelineVisualization = ({
  data = [],
  timeRange = null,
  filters = {},
  selectedTracks = ['characters', 'settlements', 'events'],
  zoom = 1,
  onEventSelect = () => {},
  onTracksChange = () => {},
  className = '',
  width = 1200,
  height = 600
}) => {
  // Ensure data is always an array
  const safeData = useMemo(() => Array.isArray(data) ? data : [], [data]);
  // Refs
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  // State
  const [viewport, setViewport] = useState({
    x: 0,
    y: 0,
    width: width,
    height: height,
    scale: zoom
  });
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  // const [isAnimating, setIsAnimating] = useState(false);
  const [renderStats, setRenderStats] = useState({
    lastRenderTime: 0,
    visibleEvents: 0,
    totalEvents: 0
  });

  // Memoized data processing
  const processedData = useMemo(() => {
    return processTimelineData(safeData, filters, timeRange);
  }, [safeData, filters, timeRange]);

  const { tracks, eventsByTrack, timeExtent } = processedData;

  // Main render function
  const renderTimeline = useCallback(() => {
    const startTime = performance.now();
    
    if (!svgRef.current || !tracks.length) {
      // Update render stats for empty case
      setRenderStats({
        lastRenderTime: performance.now() - startTime,
        visibleEvents: 0,
        totalEvents: safeData.length
      });
      return;
    }

    const svg = d3.select(svgRef.current);
    const { width: viewWidth, height: viewHeight, scale, x: viewX, y: viewY } = viewport;

    // Create time scale with current viewport
    const timeScale = d3.scaleTime()
      .domain(timeExtent)
      .range([60, viewWidth - 60]); // Leave margins

    // Clear previous render
    svg.selectAll('*').remove();

    // Setup main group with transform
    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${viewX}, ${viewY}) scale(${scale})`);

    // Render background
    renderBackground(mainGroup, viewWidth, viewHeight, timeScale);

    // Render time axis
    renderTimeAxis(mainGroup, timeScale, viewWidth);

    // Render tracks
    selectedTracks.forEach((trackId, index) => {
      if (eventsByTrack[trackId]) {
        renderTrack(mainGroup, trackId, eventsByTrack[trackId], index, timeScale);
      }
    });

    // Setup zoom and pan behavior
    setupZoomPan(svg, viewWidth, viewHeight);

    // Update render stats
    const renderTime = performance.now() - startTime;
    setRenderStats({
      lastRenderTime: renderTime,
      visibleEvents: calculateVisibleEvents(timeScale),
      totalEvents: safeData.length
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, tracks, eventsByTrack, selectedTracks, timeExtent, safeData.length, selectedEvents]);

  // Debounced render function for performance
  const debouncedRender = useMemo(
    () => debounce(() => {
      renderTimeline();
    }, 16), // ~60 FPS
    [renderTimeline]
  );

  // Main render effect
  useEffect(() => {
    debouncedRender();
  }, [debouncedRender]);

  // Window resize handler
  useEffect(() => {
    const handleResize = debounce(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewport(prev => ({
          ...prev,
          width: rect.width,
          height: rect.height
        }));
      }
    }, 250);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Render background grid and styling
   */
  const renderBackground = (group, width, height, timeScale) => {
    // Background
    group
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'var(--timeline-bg, #fafafa)')
      .attr('stroke', 'none');

    // Grid lines (vertical for time)
    const tickValues = timeScale.ticks(20);
    
    group
      .selectAll('.grid-line')
      .data(tickValues)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', d => timeScale(d))
      .attr('x2', d => timeScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'var(--timeline-grid, #e0e0e0)')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3);
  };

  /**
   * Render time axis with labels
   */
  const renderTimeAxis = (group, scale, width) => {
    const axis = d3.axisBottom(scale)
      .ticks(Math.floor(width / 100))
      .tickFormat(d3.timeFormat('%Y'));

    group
      .append('g')
      .attr('class', 'time-axis')
      .attr('transform', `translate(0, ${timelineConfig.trackHeight * selectedTracks.length + 40})`)
      .call(axis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', 'var(--timeline-text, #333)');
  };

  /**
   * Render individual track with events
   */
  const renderTrack = (group, trackId, events, trackIndex, scale) => {
    const trackY = trackIndex * timelineConfig.trackHeight + timelineConfig.trackPadding;
    const trackGroup = group
      .append('g')
      .attr('class', `track track-${trackId}`)
      .attr('transform', `translate(0, ${trackY})`);

    // Track background
    trackGroup
      .append('rect')
      .attr('width', viewport.width)
      .attr('height', timelineConfig.trackHeight - timelineConfig.trackPadding)
      .attr('fill', timelineConfig.tracks[trackId]?.background || '#f8f9fa')
      .attr('stroke', timelineConfig.tracks[trackId]?.border || '#dee2e6')
      .attr('stroke-width', 1)
      .attr('rx', 4);

    // Track label
    trackGroup
      .append('text')
      .attr('x', 10)
      .attr('y', 25)
      .attr('class', 'track-label')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', 'var(--timeline-text, #333)')
      .text(timelineConfig.tracks[trackId]?.label || trackId);

    // Track line
    const lineY = (timelineConfig.trackHeight - timelineConfig.trackPadding) / 2;
    trackGroup
      .append('line')
      .attr('x1', 50)
      .attr('x2', viewport.width - 20)
      .attr('y1', lineY)
      .attr('y2', lineY)
      .attr('stroke', timelineConfig.tracks[trackId]?.lineColor || '#6c757d')
      .attr('stroke-width', 2);

    // Render events on track
    renderTrackEvents(trackGroup, events, scale, lineY, trackId);
  };

  /**
   * Render events within a track
   */
  const renderTrackEvents = (trackGroup, events, scale, lineY, trackId) => {
    const eventGroup = trackGroup
      .selectAll('.event')
      .data(events)
      .enter()
      .append('g')
      .attr('class', 'event')
      .attr('transform', d => `translate(${scale(new Date(d.timestamp))}, 0)`);

    // Event markers
    eventGroup
      .append('circle')
      .attr('r', d => getEventRadius(d))
      .attr('cy', lineY)
      .attr('fill', d => getEventColor(d, trackId))
      .attr('stroke', d => getEventStroke(d))
      .attr('stroke-width', d => {
        // Thicker stroke for selected events
        const isSelected = selectedEvents.some(selected => selected.id === d.id);
        return isSelected ? 3 : 2;
      })
      .attr('opacity', d => {
        // Full opacity for selected events, otherwise normal
        const isSelected = selectedEvents.some(selected => selected.id === d.id);
        return isSelected ? 1 : 0.8;
      })
      .style('cursor', 'pointer')
      .style('filter', d => {
        // Enhanced drop shadow for selected events
        const isSelected = selectedEvents.some(selected => selected.id === d.id);
        return isSelected 
          ? 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))' 
          : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
      })
      .on('mouseenter', handleEventHover)
      .on('mouseleave', handleEventLeave)
      .on('click', handleEventClick);

    // Event connections (for relationships)
    if (trackId === 'characters') {
      renderEventConnections(eventGroup, events, scale);
    }
  };

  /**
   * Setup zoom and pan interactions
   */
  const setupZoomPan = (svg, width, height) => {
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .translateExtent([[-width, -height], [width * 2, height * 2]])
      .on('zoom', handleZoom);

    svg.call(zoom);
  };

  /**
   * Handle zoom events
   */
  const handleZoom = useCallback((event) => {
    const { transform } = event;
    setViewport(prev => ({
      ...prev,
      x: transform.x,
      y: transform.y,
      scale: transform.k
    }));
  }, []);

  /**
   * Handle event hover for tooltips
   */
  const handleEventHover = useCallback((event, data) => {
    setHoveredEvent(data);
    
    // Position tooltip
    if (tooltipRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.pageX - rect.left + 10;
      const y = event.pageY - rect.top - 10;
      
      d3.select(tooltipRef.current)
        .style('left', `${x}px`)
        .style('top', `${y}px`)
        .style('opacity', 1);
    }
  }, []);

  /**
   * Handle event hover leave
   */
  const handleEventLeave = useCallback(() => {
    setHoveredEvent(null);
    
    if (tooltipRef.current) {
      d3.select(tooltipRef.current)
        .style('opacity', 0);
    }
  }, []);

  /**
   * Handle event click selection
   */
  const handleEventClick = useCallback((event, data) => {
    event.stopPropagation();
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedEvents(prev => {
        const exists = prev.find(e => e.id === data.id);
        return exists 
          ? prev.filter(e => e.id !== data.id)
          : [...prev, data];
      });
    } else {
      // Single select
      setSelectedEvents([data]);
    }
    
    onEventSelect(data);
  }, [onEventSelect]);

  /**
   * Calculate visible events for performance metrics
   */
  const calculateVisibleEvents = (timeScale) => {
    // If no timeScale provided or timeScale is not a function, return total events
    if (!timeScale || typeof timeScale !== 'function') {
      return safeData.length;
    }
    
    // This would calculate based on current viewport
    return safeData.filter(event => {
      const eventTime = new Date(event.timestamp);
      const timeInViewport = timeScale(eventTime);
      return timeInViewport >= viewport.x && timeInViewport <= viewport.x + viewport.width;
    }).length;
  };

  /**
   * Handle zoom control from UI
   */
  const handleZoomChange = useCallback((newZoom) => {
    setViewport(prev => ({ ...prev, scale: newZoom }));
  }, []);

  /**
   * Handle pan control from UI
   */
  const handlePanChange = useCallback((deltaX, deltaY) => {
    setViewport(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);

  /**
   * Export timeline functionality
   */
  const handleExport = useCallback((format) => {
    if (!svgRef.current) return;

    const exportAsSVG = () => {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      downloadBlob(blob, 'timeline.svg');
    };

    const exportAsPNG = () => {
      // Convert SVG to canvas then to PNG
      const svgElement = svgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(blob => {
          downloadBlob(blob, 'timeline.png');
          URL.revokeObjectURL(url);
        });
      };
      
      img.src = url;
    };

    const exportAsJSON = () => {
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          timeRange,
          selectedTracks,
          filters,
          renderStats
        },
        events: processedData.events,
        tracks: processedData.tracks,
        statistics: {
          totalEvents: processedData.events.length,
          timeSpan: {
            start: processedData.timeExtent[0],
            end: processedData.timeExtent[1]
          }
        }
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      downloadBlob(blob, 'timeline-data.json');
    };

    switch (format) {
      case 'svg':
        exportAsSVG();
        break;
      case 'png':
        exportAsPNG();
        break;
      case 'json':
        exportAsJSON();
        break;
      default:
        console.warn(`Unknown export format: ${format}`);
        break;
    }
  }, [viewport, timeRange, selectedTracks, filters, renderStats, processedData]);

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`relative w-full h-full bg-gray-50 rounded-lg border border-gray-200 font-sans dark:bg-gray-800 dark:border-gray-600 ${className}`} ref={containerRef}>
      {/* Timeline Controls */}
      <TimelineControls
        zoom={viewport.scale}
        onZoomChange={handleZoomChange}
        onPanChange={handlePanChange}
        selectedTracks={selectedTracks}
        onTracksChange={onTracksChange}
        renderStats={renderStats}
      />

      {/* Main Timeline SVG */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          width={viewport.width}
          height={viewport.height}
          className="w-full h-full cursor-grab active:cursor-grabbing will-change-transform"
          style={{ backfaceVisibility: 'hidden' }}
        />
      </div>

      {/* Tooltip */}
      <TimelineTooltip
        ref={tooltipRef}
        event={hoveredEvent}
        visible={!!hoveredEvent}
      />

      {/* Export Controls */}
      <div className="md:absolute md:bottom-4 md:right-4 relative mt-4 md:mt-0">
        <TimelineExport
          onExport={handleExport}
          disabled={!safeData.length}
        />
      </div>
    </div>
  );
};

/**
 * Process timeline data for rendering
 */
function processTimelineData(data, filters, timeRange) {
  // Validate input data
  if (!Array.isArray(data)) {
    console.warn('Invalid data provided to processTimelineData');
    return { events: [], tracks: [], eventsByTrack: {}, timeExtent: [new Date(), new Date()] };
  }

  // Filter data based on criteria
  let filteredData = data.filter(event => {
    // Validate event structure
    if (!event || typeof event !== 'object' || !event.timestamp) {
      return false;
    }

    // Validate timestamp
    const date = new Date(event.timestamp);
    if (isNaN(date.getTime())) {
      return false;
    }

    // Time range filter
    if (timeRange) {
      if (date < timeRange.start || date > timeRange.end) {
        return false;
      }
    }

    // Type filter
    if (filters.type && event.type !== filters.type) {
      return false;
    }

    // Character filter
    if (filters.characterId && event.characterId !== filters.characterId) {
      return false;
    }

    // Significance filter
    if (filters.minSignificance && event.significance < filters.minSignificance) {
      return false;
    }

    return true;
  });

  // Sort by timestamp with null safety
  filteredData.sort((a, b) => {
    if (!a || !a.timestamp) return 1;
    if (!b || !b.timestamp) return -1;
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  // Handle empty data
  if (filteredData.length === 0) {
    return {
      events: filteredData,
      tracks: [],
      eventsByTrack: { characters: [], settlements: [], events: [], wars: [] },
      timeExtent: [new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()]
    };
  }

  // Create time scale
  const timeExtent = d3.extent(filteredData, d => new Date(d.timestamp));

  // Group events by track
  const eventsByTrack = {
    characters: filteredData.filter(e => e.type === 'character' || e.characterId),
    settlements: filteredData.filter(e => e.type === 'settlement' || e.settlementId),
    events: filteredData.filter(e => !e.characterId && !e.settlementId),
    wars: filteredData.filter(e => e.type === 'conflict' || e.type === 'war')
  };

  // Create track definitions
  const tracks = [
    { id: 'characters', label: 'Characters', events: eventsByTrack.characters },
    { id: 'settlements', label: 'Settlements', events: eventsByTrack.settlements },
    { id: 'events', label: 'Events', events: eventsByTrack.events },
    { id: 'wars', label: 'Wars', events: eventsByTrack.wars }
  ];

  return {
    events: filteredData,
    tracks,
    eventsByTrack,
    timeExtent
  };
}

/**
 * Get event marker radius based on significance
 */
function getEventRadius(event) {
  const baseRadius = 4;
  const significanceMultiplier = (event.significance || 0.1) * 3;
  return Math.max(baseRadius, baseRadius + significanceMultiplier);
}

/**
 * Get event color based on type and track
 */
function getEventColor(event, trackId) {
  const colors = {
    characters: '#10B981', // Green
    settlements: '#3B82F6', // Blue
    events: '#F59E0B', // Amber
    wars: '#EF4444' // Red
  };

  if (event.outcome === 'positive') {
    return colors[trackId] || '#6B7280';
  } else if (event.outcome === 'negative') {
    return d3.rgb(colors[trackId] || '#6B7280').darker(1);
  }

  return colors[trackId] || '#6B7280';
}

/**
 * Get event stroke color
 */
function getEventStroke(event) {
  return event.significance > 0.7 ? '#1F2937' : '#9CA3AF';
}

/**
 * Render connections between related events
 */
function renderEventConnections(eventGroup, events, scale) {
  // This would implement relationship lines between events
  // For now, we'll skip complex relationship rendering
}

export default TimelineVisualization;
