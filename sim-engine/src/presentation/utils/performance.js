/**
 * Performance Utilities
 * 
 * Collection of utility functions for optimizing React performance,
 * particularly for data-heavy components like the Timeline.
 */

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function to limit function calls to once per interval
 * @param {Function} func - Function to throttle
 * @param {number} interval - Interval in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, interval) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      return func.apply(null, args);
    }
  };
};

/**
 * Measure performance of a function
 * @param {string} name - Name for the measurement
 * @param {Function} func - Function to measure
 * @returns {*} Result of the function
 */
export const measurePerformance = (name, func) => {
  const start = performance.now();
  const result = func();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

/**
 * RAF-based animation helper
 * @param {Function} callback - Animation callback
 * @returns {number} Animation frame ID
 */
export const requestAnimationFrame = (callback) => {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 16); // Fallback to 60fps
};

/**
 * Cancel animation frame
 * @param {number} id - Animation frame ID
 */
export const cancelAnimationFrame = (id) => {
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
};

/**
 * Virtual scrolling helper for large datasets
 * @param {Array} items - Full dataset
 * @param {number} containerHeight - Container height
 * @param {number} itemHeight - Individual item height
 * @param {number} scrollTop - Current scroll position
 * @returns {Object} Visible items and offsets
 */
export const getVisibleItems = (items, containerHeight, itemHeight, scrollTop) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    offsetY: startIndex * itemHeight
  };
};

/**
 * Memory-efficient data chunking
 * @param {Array} data - Dataset to chunk
 * @param {number} chunkSize - Size of each chunk
 * @returns {Array} Array of chunks
 */
export const chunkData = (data, chunkSize = 1000) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Deep clone with performance considerations
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const fastClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => fastClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = fastClone(obj[key]);
      }
    }
    return cloned;
  }
};

/**
 * Efficient array difference calculation
 * @param {Array} newArray - New array
 * @param {Array} oldArray - Old array
 * @param {Function} keyFn - Key extraction function
 * @returns {Object} Added, removed, and updated items
 */
export const getArrayDiff = (newArray, oldArray, keyFn = item => item.id) => {
  const newMap = new Map(newArray.map(item => [keyFn(item), item]));
  const oldMap = new Map(oldArray.map(item => [keyFn(item), item]));
  
  const added = newArray.filter(item => !oldMap.has(keyFn(item)));
  const removed = oldArray.filter(item => !newMap.has(keyFn(item)));
  const updated = newArray.filter(item => {
    const key = keyFn(item);
    const oldItem = oldMap.get(key);
    return oldItem && JSON.stringify(item) !== JSON.stringify(oldItem);
  });
  
  return { added, removed, updated };
};
