/**
 * Timeline Configuration
 * 
 * Central configuration for timeline appearance, behavior, and performance settings
 */

export const timelineConfig = {
  // Track layout
  trackHeight: 80,
  trackPadding: 10,
  
  // Track definitions
  tracks: {
    characters: {
      label: 'Characters',
      background: '#F0FDF4', // Green tint
      border: '#10B981',
      lineColor: '#059669'
    },
    settlements: {
      label: 'Settlements', 
      background: '#EFF6FF', // Blue tint
      border: '#3B82F6',
      lineColor: '#2563EB'
    },
    events: {
      label: 'Global Events',
      background: '#FFFBEB', // Amber tint
      border: '#F59E0B',
      lineColor: '#D97706'
    },
    wars: {
      label: 'Conflicts',
      background: '#FEF2F2', // Red tint
      border: '#EF4444',
      lineColor: '#DC2626'
    }
  },

  // Event styling
  events: {
    minRadius: 3,
    maxRadius: 12,
    defaultOpacity: 0.8,
    hoverOpacity: 1.0,
    selectedStrokeWidth: 3
  },

  // Animation settings
  animation: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    staggerDelay: 50
  },

  // Performance settings
  performance: {
    maxVisibleEvents: 1000,
    renderThrottle: 16, // ~60 FPS
    virtualScrollThreshold: 500
  },

  // Zoom and pan limits
  zoom: {
    min: 0.1,
    max: 10,
    default: 1,
    step: 0.1
  },

  pan: {
    step: 50,
    bounds: {
      x: [-2000, 2000],
      y: [-500, 500]
    }
  },

  // Tooltip configuration
  tooltip: {
    offset: { x: 10, y: -10 },
    maxWidth: 300,
    delay: 100
  },

  // Export settings
  export: {
    defaultWidth: 1200,
    defaultHeight: 600,
    dpi: 300,
    formats: ['svg', 'png', 'json']
  }
};
