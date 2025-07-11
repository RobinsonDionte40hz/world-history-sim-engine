// src/application/ports/IWorldRepository.js

const IWorldRepository = {
  /**
   * Save the world state.
   * @param {Object} worldState - The world state to save.
   * @returns {Promise<void>}
   */
  saveWorld: async (worldState) => {},

  /**
   * Retrieve the world state.
   * @returns {Promise<Object>}
   */
  getWorld: async () => {},

  /**
   * Update a node in the world state.
   * @param {Object} node - The node to update.
   * @returns {Promise<void>}
   */
  updateNode: async (node) => {},
};

export default IWorldRepository;