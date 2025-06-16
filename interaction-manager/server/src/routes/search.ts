import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Search across all entities
router.get('/search', async (req, res) => {
  try {
    const {
      query,
      entityTypes,
      worldId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const searchQuery = query ? String(query).toLowerCase() : '';
    const types = entityTypes ? String(entityTypes).split(',') : ['world', 'character', 'event', 'location'];

    const results: any = {
      worlds: [],
      characters: [],
      events: [],
      locations: []
    };

    // Search worlds
    if (types.includes('world')) {
      const worlds = await prisma.world.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        skip,
        take: Number(limit),
        orderBy: { [String(sortBy)]: String(sortOrder) }
      });
      results.worlds = worlds;
    }

    // Search characters
    if (types.includes('character')) {
      const characters = await prisma.character.findMany({
        where: {
          AND: [
            worldId ? { worldId: String(worldId) } : {},
            {
              OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } }
              ]
            }
          ]
        },
        include: {
          world: true
        },
        skip,
        take: Number(limit),
        orderBy: { [String(sortBy)]: String(sortOrder) }
      });
      results.characters = characters;
    }

    // Search events
    if (types.includes('event')) {
      const events = await prisma.historicalEvent.findMany({
        where: {
          AND: [
            worldId ? { worldId: String(worldId) } : {},
            {
              OR: [
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { eventType: { contains: searchQuery, mode: 'insensitive' } }
              ]
            }
          ]
        },
        include: {
          world: true,
          location: true,
          participants: true
        },
        skip,
        take: Number(limit),
        orderBy: { [String(sortBy)]: String(sortOrder) }
      });
      results.events = events;
    }

    // Search locations (nodes)
    if (types.includes('location')) {
      const locations = await prisma.node.findMany({
        where: {
          AND: [
            worldId ? { worldId: String(worldId) } : {},
            {
              OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { type: { contains: searchQuery, mode: 'insensitive' } }
              ]
            }
          ]
        },
        include: {
          world: true,
          groups: true,
          events: true
        },
        skip,
        take: Number(limit),
        orderBy: { [String(sortBy)]: String(sortOrder) }
      });
      results.locations = locations;
    }

    // Get total counts for pagination
    const totalCounts = {
      worlds: types.includes('world') ? await prisma.world.count({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } }
          ]
        }
      }) : 0,
      characters: types.includes('character') ? await prisma.character.count({
        where: {
          AND: [
            worldId ? { worldId: String(worldId) } : {},
            {
              OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } }
              ]
            }
          ]
        }
      }) : 0,
      events: types.includes('event') ? await prisma.historicalEvent.count({
        where: {
          AND: [
            worldId ? { worldId: String(worldId) } : {},
            {
              OR: [
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { eventType: { contains: searchQuery, mode: 'insensitive' } }
              ]
            }
          ]
        }
      }) : 0,
      locations: types.includes('location') ? await prisma.node.count({
        where: {
          AND: [
            worldId ? { worldId: String(worldId) } : {},
            {
              OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { type: { contains: searchQuery, mode: 'insensitive' } }
              ]
            }
          ]
        }
      }) : 0
    };

    res.json({
      results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCounts
      }
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Advanced search with filters
router.post('/search/advanced', async (req, res) => {
  try {
    const {
      filters,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.body;

    const skip = (Number(page) - 1) * Number(limit);
    const results: any = {
      worlds: [],
      characters: [],
      events: [],
      locations: []
    };

    // Search worlds with filters
    if (filters.worlds) {
      const worlds = await prisma.world.findMany({
        where: filters.worlds,
        skip,
        take: Number(limit),
        orderBy: { [String(sortBy)]: String(sortOrder) }
      });
      results.worlds = worlds;
    }

    // Search characters with filters
    if (filters.characters) {
      const characters = await prisma.character.findMany({
        where: filters.characters,
        include: {
          world: true
        },
        skip,
        take: Number(limit),
        orderBy: { [String(sortBy)]: String(sortOrder) }
      });
      results.characters = characters;
    }

    // Search events with filters
    if (filters.events) {
      const events = await prisma.historicalEvent.findMany({
        where: filters.events,
        include: {
          world: true,
          location: true,
          participants: true
        },
        skip,
        take: Number(limit),
        orderBy: { [String(sortBy)]: String(sortOrder) }
      });
      results.events = events;
    }

    // Search locations (nodes) with filters
    if (filters.locations) {
      const locations = await prisma.node.findMany({
        where: filters.locations,
        include: {
          world: true,
          groups: true,
          events: true
        },
        skip,
        take: Number(limit),
        orderBy: { [String(sortBy)]: String(sortOrder) }
      });
      results.locations = locations;
    }

    res.json({
      results,
      pagination: {
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error performing advanced search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 