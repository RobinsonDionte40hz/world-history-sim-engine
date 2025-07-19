// src/infrastructure/persistence/LocalStorageCharacterRepository.js

import ICharacterRepository from '../../application/use-cases/ports/ICharacterRepository.js';
import Character from '../../domain/entities/Character.js';

const LocalStorageCharacterRepository = {
  save: async (character) => {
    if (!(character instanceof Character)) throw new Error('Invalid character');
    const key = `character_${character.id}`;
    localStorage.setItem(key, JSON.stringify(character.toJSON()));
    return Promise.resolve();
  },

  findById: async (id) => {
    const data = localStorage.getItem(`character_${id}`);
    return data ? new Character(JSON.parse(data)) : null;
  },

  findAll: async () => {
    const characters = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('character_')) {
        const data = localStorage.getItem(key);
        if (data) characters.push(new Character(JSON.parse(data)));
      }
    }
    return characters;
  },

  delete: async (id) => {
    localStorage.removeItem(`character_${id}`);
    return Promise.resolve();
  },
};

const CharacterRepositoryService = { ...ICharacterRepository, ...LocalStorageCharacterRepository };

export default CharacterRepositoryService;