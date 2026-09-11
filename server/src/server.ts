import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { ENV } from './config/env';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import classroomRoutes from './routes/classroom.routes';
import pollRoutes from './routes/poll.routes';
import quizRoutes from './routes/quiz.routes';
import analyticsRoutes from './routes/analytics.routes';
import { registerClassroomSockets } from './sockets/classroom.socket';

const app = express();
const server = http.createServer(app);

// Configure Socket.io with permissive CORS for development
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'SmartClass Management API & Real-time Server',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/analytics', analyticsRoutes);

// Register WebSockets
registerClassroomSockets(io);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
server.listen(ENV.PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 SmartClass Backend API & WebSocket Server Running!`);
  console.log(`📡 Local URL:   http://localhost:${ENV.PORT}`);
  console.log(`🌐 Network:     http://0.0.0.0:${ENV.PORT}`);
  console.log(`⚡ Environment: ${ENV.NODE_ENV}`);
  console.log(`=======================================================`);
});
