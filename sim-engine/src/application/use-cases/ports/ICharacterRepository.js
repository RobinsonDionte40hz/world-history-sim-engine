// src/application/ports/ICharacterRepository.js

const ICharacterRepository = {
  /**
   * Save a character to the repository.
   * @param {Character} character - The character to save.
   * @returns {Promise<void>}
   */
  save: async (character) => {},

  /**
   * Retrieve a character by ID.
   * @param {string} id - The character ID.
   * @returns {Promise<Character>}
   */
  findById: async (id) => {},

  /**
   * Retrieve all characters.
   * @returns {Promise<Character[]>}
   */
  findAll: async () => {},

  /**
   * Delete a character by ID.
   * @param {string} id - The character ID.
   * @returns {Promise<void>}
   */
  delete: async (id) => {},
};

export default ICharacterRepository;