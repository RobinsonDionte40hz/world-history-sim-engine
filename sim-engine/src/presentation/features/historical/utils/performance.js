/**
 * Performance utilities for timeline optimization
 */

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
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

/**
 * Throttle function to limit function calls to once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Virtual scrolling calculator for large datasets
 * @param {Array} items - Array of items to virtualize
 * @param {Object} viewport - Viewport dimensions and scroll position
 * @param {number} itemHeight - Height of each item
 * @returns {Object} Visible items and scroll properties
 */
export const calculateVirtualScroll = (items, viewport, itemHeight) => {
  const { scrollTop, height } = viewport;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(height / itemHeight) + 1,
    items.length - 1
  );
  
  return {
    visibleItems: items.slice(startIndex, endIndex + 1),
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
};

/**
 * Memory-efficient event batching for large updates
 * @param {Array} events - Events to batch
 * @param {number} batchSize - Size of each batch
 * @returns {Array} Array of batched events
 */
export const batchEvents = (events, batchSize = 100) => {
  const batches = [];
  for (let i = 0; i < events.length; i += batchSize) {
    batches.push(events.slice(i, i + batchSize));
  }
  return batches;
};

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  start(name) {
    this.metrics.set(name, { start: performance.now() });
  }

  end(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.end = performance.now();
      metric.duration = metric.end - metric.start;
      return metric.duration;
    }
    return 0;
  }

  getMetrics() {
    const results = {};
    this.metrics.forEach((value, key) => {
      if (value.duration !== undefined) {
        results[key] = value.duration;
      }
    });
    return results;
  }

  clear() {
    this.metrics.clear();
  }
}

/**
 * Level of detail calculator for zooming
 * @param {number} scale - Current zoom scale
 * @param {Array} events - Events to process
 * @returns {Object} LOD configuration
 */
export const calculateLevelOfDetail = (scale, events) => {
  let detailLevel = 'high';
  let maxEvents = events.length;
  let skipMinorEvents = false;

  if (scale < 0.3) {
    detailLevel = 'low';
    maxEvents = Math.min(100, events.length);
    skipMinorEvents = true;
  } else if (scale < 0.7) {
    detailLevel = 'medium';
    maxEvents = Math.min(500, events.length);
    skipMinorEvents = true;
  }

  return {
    detailLevel,
    maxEvents,
    skipMinorEvents,
    eventFilter: skipMinorEvents 
      ? (event) => (event.significance || 0) > 0.3
      : () => true
  };
};
