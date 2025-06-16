import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all nodes (locations) in a world
router.get('/worlds/:worldId/locations', async (req, res) => {
  try {
    const { worldId } = req.params;
    const locations = await prisma.node.findMany({
      where: { worldId },
      include: {
        groups: true,
        events: true
      }
    });
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new location (node)
router.post('/worlds/:worldId/locations', async (req, res) => {
  try {
    const { worldId } = req.params;
    const {
      nodeId,
      name,
      type,
      position,
      features,
      resources,
      environmentalConditions
    } = req.body;

    const location = await prisma.node.create({
      data: {
        worldId,
        nodeId,
        name,
        type,
        position,
        features,
        resources,
        environmentalConditions
      },
      include: {
        groups: true,
        events: true
      }
    });
    res.json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get location by ID
router.get('/locations/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const location = await prisma.node.findUnique({
      where: { nodeId },
      include: {
        groups: true,
        events: true
      }
    });
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update location
router.put('/locations/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const {
      name,
      type,
      position,
      features,
      resources,
      environmentalConditions
    } = req.body;

    const location = await prisma.node.update({
      where: { nodeId },
      data: {
        name,
        type,
        position,
        features,
        resources,
        environmentalConditions
      },
      include: {
        groups: true,
        events: true
      }
    });
    res.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get locations by type
router.get('/worlds/:worldId/locations/type/:type', async (req, res) => {
  try {
    const { worldId, type } = req.params;
    const locations = await prisma.node.findMany({
      where: {
        worldId,
        type
      },
      include: {
        groups: true,
        events: true
      }
    });
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations by type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 