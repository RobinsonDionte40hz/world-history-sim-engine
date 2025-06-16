import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all events in a world
router.get('/worlds/:worldId/events', async (req, res) => {
  try {
    const { worldId } = req.params;
    const events = await prisma.historicalEvent.findMany({
      where: { worldId },
      include: {
        participants: true,
        location: true
      }
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new event
router.post('/worlds/:worldId/events', async (req, res) => {
  try {
    const { worldId } = req.params;
    const {
      eventId,
      timestamp,
      eventType,
      description,
      locationId,
      effects,
      metadata,
      participants
    } = req.body;

    const event = await prisma.historicalEvent.create({
      data: {
        worldId,
        eventId,
        timestamp,
        eventType,
        description,
        locationId,
        effects,
        metadata,
        participants: {
          create: participants
        }
      },
      include: {
        participants: true
      }
    });
    res.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get events by type
router.get('/worlds/:worldId/events/type/:eventType', async (req, res) => {
  try {
    const { worldId, eventType } = req.params;
    const events = await prisma.historicalEvent.findMany({
      where: {
        worldId,
        eventType
      },
      include: {
        participants: true,
        location: true
      }
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events by type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get events in a time range
router.get('/worlds/:worldId/events/timerange', async (req, res) => {
  try {
    const { worldId } = req.params;
    const { startTime, endTime } = req.query;
    
    const events = await prisma.historicalEvent.findMany({
      where: {
        worldId,
        timestamp: {
          gte: Number(startTime),
          lte: Number(endTime)
        }
      },
      include: {
        participants: true,
        location: true
      }
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events in time range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 