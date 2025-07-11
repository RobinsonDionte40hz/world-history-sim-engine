// src/application/ports/IHistoryRepository.js

const IHistoryRepository = {
  /**
   * Save a historical event.
   * @param {Object} event - The event to save.
   * @returns {Promise<void>}
   */
  saveEvent: async (event) => {},

  /**
   * Retrieve events based on criteria.
   * @param {Object} criteria - Filter criteria (e.g., timeRange, characterId).
   * @returns {Promise<Object[]>}
   */
  findEvents: async (criteria) => {},

  /**
   * Clear all events.
   * @returns {Promise<void>}
   */
  clearEvents: async () => {},
};

export default IHistoryRepository;