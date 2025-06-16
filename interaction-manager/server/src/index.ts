import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import characterRoutes from './routes/characters';
import eventRoutes from './routes/events';
import locationRoutes from './routes/locations';
import relationshipRoutes from './routes/relationships';
import searchRoutes from './routes/search';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// World endpoints
app.get('/api/worlds', async (req, res) => {
  try {
    const worlds = await prisma.world.findMany();
    res.json(worlds);
  } catch (error) {
    console.error('Error fetching worlds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/worlds', async (req, res) => {
  try {
    const { name, description, config } = req.body;
    const world = await prisma.world.create({
      data: {
        name,
        description,
        config,
      },
    });
    res.json(world);
  } catch (error) {
    console.error('Error creating world:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Use routes
app.use('/api', characterRoutes);
app.use('/api', eventRoutes);
app.use('/api', locationRoutes);
app.use('/api', relationshipRoutes);
app.use('/api', searchRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 