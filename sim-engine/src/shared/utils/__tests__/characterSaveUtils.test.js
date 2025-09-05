/**
 * Character Save Utils Tests
 */

import { saveCharacter, validateCharacterForSave } from '../characterSaveUtils';

// Mock WorldBuilder
const mockWorldBuilder = {
  getAllCharacters: jest.fn(),
  addCharacter: jest.fn(),
  updateCharacter: jest.fn()
};

describe('Character Save Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWorldBuilder.getAllCharacters.mockReturnValue([]);
  });

  describe('saveCharacter', () => {
    it('should create a new character with WorldBuilder', async () => {
      const characterData = {
        name: 'Test Character',
        description: 'A test character',
        attributes: {
          strength: 10,
          dexterity: 12,
          constitution: 11,
          intelligence: 14,
          wisdom: 13,
          charisma: 15
        },
        // Add environmental data to character
        assignedNode: 'test-node-1', // If character is assigned to a node
        preferredEnvironment: { terrain: 'forest', climate: 'temperate' }, // Environmental preferences
        environmentalAdaptations: {
          forest: 0.8,
          plains: 0.6,
          urban: 0.4
        }
      };

      mockWorldBuilder.addCharacter.mockReturnValue({ id: 'char_123', ...characterData });

      const result = await saveCharacter(characterData, {
        worldBuilder: mockWorldBuilder,
        mode: 'create'
      });

      expect(result.success).toBe(true);
      expect(result.operation).toBe('created');
      expect(mockWorldBuilder.addCharacter).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Character',
          id: expect.any(String)
        })
      );
    });

    it('should update an existing character with WorldBuilder', async () => {
      const existingCharacter = { id: 'char_123', name: 'Existing Character' };
      const updatedData = { ...existingCharacter, name: 'Updated Character' };

      mockWorldBuilder.getAllCharacters.mockReturnValue([existingCharacter]);

      const result = await saveCharacter(updatedData, {
        worldBuilder: mockWorldBuilder,
        mode: 'edit'
      });

      expect(result.success).toBe(true);
      expect(result.operation).toBe('updated');
      expect(mockWorldBuilder.updateCharacter).toHaveBeenCalledWith('char_123', updatedData);
    });
  });

  describe('validateCharacterForSave', () => {
    it('should validate a valid character', () => {
      const validCharacter = {
        name: 'Valid Character',
        description: 'A valid test character with proper description',
        attributes: {
          strength: 10,
          dexterity: 12,
          constitution: 11,
          intelligence: 14,
          wisdom: 13,
          charisma: 15
        },
        // Add environmental data to valid character template
        assignedNode: 'forest-village-1',
        preferredEnvironment: { 
          terrain: 'forest', 
          climate: 'temperate',
          preferredLighting: 'normal'
        },
        environmentalAdaptations: {
          forest: 0.9,
          plains: 0.6,
          mountains: 0.4,
          urban: 0.3
        }
      };

      const result = validateCharacterForSave(validCharacter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject character with missing name', () => {
      const invalidCharacter = {
        description: 'A character without a name',
        attributes: {
          strength: 10,
          dexterity: 12,
          constitution: 11,
          intelligence: 14,
          wisdom: 13,
          charisma: 15
        },
        // Environmental data can be present even when character is invalid
        assignedNode: null, // No node assignment
        preferredEnvironment: { terrain: 'plains', climate: 'temperate' },
        environmentalAdaptations: {
          plains: 0.7,
          forest: 0.5
        }
      };

      const result = validateCharacterForSave(invalidCharacter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: 'Character name is required'
        })
      );
    });
  });
});