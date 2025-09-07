/**
 * Character Save Utilities - Unified save operations for characters
 * 
 * Provides consistent character save behavior across all components
 * that create or edit characters.
 */

import Character from '../../domain/entities/Character';

/**
 * Unified character save operation
 * 
 * @param {Object} characterData - Character data to save
 * @param {Object} options - Save options
 * @param {Object} options.worldBuilder - WorldBuilder service instance
 * @param {string} options.mode - 'create' or 'edit' mode
 * @param {string} options.currentWorldId - Current world ID
 * @param {Object} options.currentWorld - Current world object
 * @param {Function} options.updateWorldConfig - Function to update world config
 * @returns {Promise<Object>} Save result with success status and data
 */
export const saveCharacter = async (characterData, options = {}) => {
  const {
    worldBuilder,
    mode = 'create',
    currentWorldId,
    currentWorld,
    updateWorldConfig
  } = options;

  console.log('saveCharacter called with:', {
    characterName: characterData?.name,
    characterId: characterData?.id,
    mode,
    hasWorldBuilder: !!worldBuilder,
    currentWorldId
  });

  try {
    // Ensure we have a proper Character entity with ID
    let characterToSave = characterData;
    if (!characterData.id) {
      console.log('Character has no ID, creating Character entity to generate one');
      const characterEntity = new Character(characterData);
      characterToSave = characterEntity.toJSON ? characterEntity.toJSON() : characterEntity;
      console.log('Generated character ID:', characterToSave.id);
    }

    let result = null;
    let operation = 'created';

    // Use WorldBuilder service for consistent behavior (preferred method)
    if (worldBuilder) {
      console.log('Using WorldBuilder to save character');
      const allCharacters = worldBuilder.getAllCharacters();
      console.log('Current characters in WorldBuilder:', allCharacters.length);
      
      const isExistingCharacter = characterToSave?.id && 
        allCharacters.some(c => c.id === characterToSave.id);
      
      console.log('Is existing character:', isExistingCharacter, 'Character ID:', characterToSave?.id);
      
      if (isExistingCharacter || mode === 'edit') {
        // Update existing character
        worldBuilder.updateCharacter(characterToSave.id, characterToSave);
        operation = 'updated';
        console.log('Updated character via WorldBuilder:', characterToSave.name);
      } else {
        // Create new character
        result = worldBuilder.addCharacter(characterToSave);
        operation = 'created';
        console.log('Created character via WorldBuilder:', characterToSave.name);
        console.log('WorldBuilder now has', worldBuilder.getAllCharacters().length, 'characters');
      }
    } else {
      // Fallback to direct localStorage if WorldBuilder not available
      console.warn('WorldBuilder not available, using direct localStorage fallback');
      
      // Create Character entity
      const characterEntity = new Character(characterToSave);
      
      // Save to localStorage
      const characters = JSON.parse(localStorage.getItem('characters') || '[]');
      const characterIndex = characters.findIndex(c => c.id === characterEntity.id);
      
      if (characterIndex >= 0) {
        characters[characterIndex] = characterEntity.toJSON();
        operation = 'updated';
      } else {
        characters.push(characterEntity.toJSON());
        operation = 'created';
      }
      
      localStorage.setItem('characters', JSON.stringify(characters));
      
      // Update world config with character reference if world is selected
      if (currentWorldId && currentWorld && updateWorldConfig) {
        const updatedCharacters = [...(currentWorld.worldConfig.characters || [])];
        const existingCharacterIndex = updatedCharacters.findIndex(c => c.id === characterEntity.id);
        
        if (existingCharacterIndex >= 0) {
          updatedCharacters[existingCharacterIndex] = characterEntity.toJSON();
        } else {
          updatedCharacters.push(characterEntity.toJSON());
        }
        
        updateWorldConfig({
          ...currentWorld.worldConfig,
          characters: updatedCharacters
        });
      }
      
      result = characterEntity;
    }

    return {
      success: true,
      operation,
      character: result || characterToSave,
      message: `Character ${operation} successfully: ${characterToSave.name}`
    };

  } catch (error) {
    console.error('Failed to save character:', error);
    return {
      success: false,
      operation: 'failed',
      character: null,
      message: `Failed to save character: ${error.message}`,
      error
    };
  }
};

/**
 * Validate character data before saving
 * 
 * @param {Object} characterData - Character data to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with errors array
 */
export const validateCharacterForSave = (characterData, options = {}) => {
  // Handle null/undefined characterData
  if (!characterData || typeof characterData !== 'object') {
    console.warn('validateCharacterForSave called with invalid characterData:', characterData);
    return {
      isValid: false,
      errors: [{ field: 'character', message: 'Character data is required' }]
    };
  }

  const errors = [];
  
  // Basic validation
  if (!characterData?.name?.trim()) {
    errors.push({ field: 'name', message: 'Character name is required' });
  } else if (characterData.name.length < 2) {
    errors.push({ field: 'name', message: 'Character name must be at least 2 characters' });
  }
  
  if (!characterData?.description?.trim()) {
    errors.push({ field: 'description', message: 'Character description is required' });
  } else if (characterData.description.length < 10) {
    errors.push({ field: 'description', message: 'Character description must be at least 10 characters' });
  }
  
  // Validate D&D attributes
  const attributes = characterData?.attributes || {};
  const requiredAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  
  requiredAttributes.forEach(attr => {
    const value = attributes[attr];
    if (typeof value !== 'number' || value < 1 || value > 20) {
      errors.push({ 
        field: `attributes.${attr}`, 
        message: `${attr.charAt(0).toUpperCase() + attr.slice(1)} must be between 1 and 20` 
      });
    }
  });
  
  // Validate consciousness if present
  if (characterData.consciousness) {
    const { frequency, coherence } = characterData.consciousness;
    
    if (typeof frequency !== 'number' || frequency < 1 || frequency > 100) {
      errors.push({ 
        field: 'consciousness.frequency', 
        message: 'Consciousness frequency must be between 1 and 100 Hz' 
      });
    }
    
    if (typeof coherence !== 'number' || coherence < 0 || coherence > 1) {
      errors.push({ 
        field: 'consciousness.coherence', 
        message: 'Consciousness coherence must be between 0 and 1' 
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Determine the appropriate mode based on character data
 * 
 * @param {Object} characterData - Character data
 * @param {Object} worldBuilder - WorldBuilder service instance
 * @returns {string} 'create' or 'edit' mode
 */
export const determineCharacterMode = (characterData, worldBuilder) => {
  if (!characterData?.id) {
    return 'create';
  }
  
  if (worldBuilder) {
    const existingCharacter = worldBuilder.getAllCharacters().find(c => c.id === characterData.id);
    return existingCharacter ? 'edit' : 'create';
  }
  
  // Fallback to localStorage check
  const characters = JSON.parse(localStorage.getItem('characters') || '[]');
  const existingCharacter = characters.find(c => c.id === characterData.id);
  return existingCharacter ? 'edit' : 'create';
};