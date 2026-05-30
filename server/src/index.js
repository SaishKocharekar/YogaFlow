import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import bmiRoutes from './routes/bmi.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import wellnessRoutes from './routes/wellness.js';
import chatRoutes from './routes/chat.js';
import progressRoutes from './routes/progress.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join-dashboard', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined dashboard room`);
  });

  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin joined admin room');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 YogaFlow Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 Client: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});
