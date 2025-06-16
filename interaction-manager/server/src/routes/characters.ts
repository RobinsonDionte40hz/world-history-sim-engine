import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all characters in a world
router.get('/worlds/:worldId/characters', async (req, res) => {
  try {
    const { worldId } = req.params;
    const characters = await prisma.character.findMany({
      where: { worldId },
      include: {
        relationships1: true,
        relationships2: true,
        snapshots: true,
        questHistory: true
      }
    });
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new character
router.post('/worlds/:worldId/characters', async (req, res) => {
  try {
    const { worldId } = req.params;
    const {
      characterId,
      name,
      birthDate,
      attributes,
      skills,
      personality,
      consciousness,
      currentLocation
    } = req.body;

    const character = await prisma.character.create({
      data: {
        worldId,
        characterId,
        name,
        birthDate,
        attributes,
        skills,
        personality,
        consciousness,
        currentLocation
      }
    });
    res.json(character);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get character relationships
router.get('/characters/:characterId/relationships', async (req, res) => {
  try {
    const { characterId } = req.params;
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [
          { character1Id: characterId },
          { character2Id: characterId }
        ]
      },
      include: {
        character1: true,
        character2: true
      }
    });
    res.json(relationships);
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a relationship between characters
router.post('/relationships', async (req, res) => {
  try {
    const {
      worldId,
      character1Id,
      character2Id,
      relationshipType,
      strength,
      startedDate,
      metadata
    } = req.body;

    const relationship = await prisma.relationship.create({
      data: {
        worldId,
        character1Id,
        character2Id,
        relationshipType,
        strength,
        startedDate,
        metadata
      }
    });
    res.json(relationship);
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 