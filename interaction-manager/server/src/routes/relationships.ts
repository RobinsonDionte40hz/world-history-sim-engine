import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all relationships for a character
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

// Create a new relationship
router.post('/characters/:characterId/relationships', async (req, res) => {
  try {
    const { characterId } = req.params;
    const {
      character2Id,
      relationshipType,
      strength,
      startedDate,
      endedDate,
      metadata
    } = req.body;

    const relationship = await prisma.relationship.create({
      data: {
        worldId: req.body.worldId, // This should be provided in the request
        character1Id: characterId,
        character2Id,
        relationshipType,
        strength,
        startedDate,
        endedDate,
        metadata
      },
      include: {
        character1: true,
        character2: true
      }
    });
    res.json(relationship);
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a relationship
router.put('/relationships/:relationshipId', async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const {
      relationshipType,
      strength,
      startedDate,
      endedDate,
      metadata
    } = req.body;

    const relationship = await prisma.relationship.update({
      where: { id: relationshipId },
      data: {
        relationshipType,
        strength,
        startedDate,
        endedDate,
        metadata
      },
      include: {
        character1: true,
        character2: true
      }
    });
    res.json(relationship);
  } catch (error) {
    console.error('Error updating relationship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a relationship
router.delete('/relationships/:relationshipId', async (req, res) => {
  try {
    const { relationshipId } = req.params;
    await prisma.relationship.delete({
      where: { id: relationshipId }
    });
    res.json({ message: 'Relationship deleted successfully' });
  } catch (error) {
    console.error('Error deleting relationship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get relationship network for a character
router.get('/characters/:characterId/network', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { depth = 2 } = req.query;

    // Get direct relationships
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

    // Get the IDs of related characters
    const relatedCharacterIds = relationships.map((rel: any) => 
      rel.character1Id === characterId ? rel.character2Id : rel.character1Id
    );

    // Get relationships of related characters (up to specified depth)
    const network = await prisma.relationship.findMany({
      where: {
        OR: [
          { character1Id: { in: relatedCharacterIds } },
          { character2Id: { in: relatedCharacterIds } }
        ]
      },
      include: {
        character1: true,
        character2: true
      }
    });

    res.json({
      directRelationships: relationships,
      extendedNetwork: network
    });
  } catch (error) {
    console.error('Error fetching relationship network:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 