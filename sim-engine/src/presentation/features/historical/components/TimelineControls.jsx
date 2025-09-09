/**
 * TimelineControls Component
 * 
 * Control panel for timeline zoom, pan, track selection, and performance monitoring
 */

import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

const TimelineControls = ({
  zoom = 1,
  onZoomChange,
  onPanChange,
  selectedTracks = [],
  onTracksChange,
  renderStats = {},
  className = ''
}) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(10, zoom * 1.2));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.1, zoom / 1.2));
  };

  const handleResetView = () => {
    onZoomChange(1);
    onPanChange(-0, -0); // Reset to origin
  };

  const handlePan = (direction) => {
    const step = 50;
    switch (direction) {
      case 'left':
        onPanChange(-step, 0);
        break;
      case 'right':
        onPanChange(step, 0);
        break;
      case 'up':
        onPanChange(0, -step);
        break;
      case 'down':
        onPanChange(0, step);
        break;
      default:
        break;
    }
  };

  const trackOptions = [
    { id: 'characters', label: 'Characters', color: '#10B981' },
    { id: 'settlements', label: 'Settlements', color: '#3B82F6' },
    { id: 'events', label: 'Events', color: '#F59E0B' },
    { id: 'wars', label: 'Wars', color: '#EF4444' }
  ];

  const handleTrackToggle = (trackId) => {
    const newTracks = selectedTracks.includes(trackId)
      ? selectedTracks.filter(id => id !== trackId)
      : [...selectedTracks, trackId];
    onTracksChange(newTracks);
  };

  return (
    <div className={`flex flex-col md:flex-row items-stretch md:items-center justify-between p-4 bg-white border-b border-gray-200 rounded-t-lg gap-4 md:gap-0 dark:bg-gray-700 dark:border-gray-600 ${className}`}>
      <div className="flex flex-wrap md:flex-nowrap items-center justify-center md:justify-start gap-6 md:gap-6">
        {/* Zoom Controls */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wider dark:text-gray-300">Zoom</label>
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1 dark:bg-gray-600">
            <button
              onClick={handleZoomOut}
              className="flex items-center justify-center w-8 h-8 rounded bg-white border border-gray-200 transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-500"
              title="Zoom Out"
              disabled={zoom <= 0.1}
            >
              <ZoomOut size={16} />
            </button>
            <span className="px-2 text-sm font-mono text-gray-700 min-w-12 text-center dark:text-gray-200">{(zoom * 100).toFixed(0)}%</span>
            <button
              onClick={handleZoomIn}
              className="flex items-center justify-center w-8 h-8 rounded bg-white border border-gray-200 transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-500"
              title="Zoom In"
              disabled={zoom >= 10}
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Pan Controls */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wider dark:text-gray-300">Pan</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handlePan('up')}
              className="w-8 h-8 text-sm font-medium flex items-center justify-center rounded bg-white border border-gray-200 transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-500"
              title="Pan Up"
            >
              ↑
            </button>
            <div className="flex gap-1 col-span-3">
              <button
                onClick={() => handlePan('left')}
                className="w-8 h-8 text-sm font-medium flex items-center justify-center rounded bg-white border border-gray-200 transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-500"
                title="Pan Left"
              >
                ←
              </button>
              <button
                onClick={handleResetView}
                className="w-8 h-8 text-sm font-medium bg-blue-50 border border-blue-200 text-blue-600 rounded transition-colors hover:bg-blue-100"
                title="Reset View"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => handlePan('right')}
                className="w-8 h-8 text-sm font-medium flex items-center justify-center rounded bg-white border border-gray-200 transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-500"
                title="Pan Right"
              >
                →
              </button>
            </div>
            <button
              onClick={() => handlePan('down')}
              className="w-8 h-8 text-sm font-medium flex items-center justify-center rounded bg-white border border-gray-200 transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-500"
              title="Pan Down"
            >
              ↓
            </button>
          </div>
        </div>

        {/* Track Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wider dark:text-gray-300">Tracks</label>
          <div className="flex flex-col gap-2">
            {trackOptions.map(track => (
              <label key={track.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200">
                <input
                  type="checkbox"
                  checked={selectedTracks.includes(track.id)}
                  onChange={() => handleTrackToggle(track.id)}
                  className="sr-only"
                />
                <span 
                  className={`w-3 h-3 rounded-full opacity-60 transition-all ${selectedTracks.includes(track.id) ? 'opacity-100 shadow-[0_0_0_2px_white,_0_0_0_4px_rgba(59,130,246,0.5)]' : ''}`}
                  style={{ backgroundColor: track.color }}
                />
                {track.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="flex items-center justify-center md:justify-end gap-4 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-gray-400" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Render Time:</span>
              <span className="font-mono text-xs">
                {renderStats.lastRenderTime ? `${renderStats.lastRenderTime.toFixed(1)}ms` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Visible Events:</span>
              <span className="font-mono text-xs">
                {renderStats.visibleEvents || 0} / {renderStats.totalEvents || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineControls;
