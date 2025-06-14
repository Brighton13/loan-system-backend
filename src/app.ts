// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import sequelize from './config/database';
import authRoutes from './routes/auth';
import loanRoutes from './routes/loans';
import AdminDashBoard from './routes/admin';
import './models/index';
import { setupAssociations } from './models/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Custom request logging middleware
const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  
  // Log request info
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // Override res.end to log response info
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding?: any) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(requestLogger); // Add request logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', AdminDashBoard);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware with source information
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log Sequelize errors with source info
  if (err.name && (err.name.includes('Sequelize') || err.sql)) {
    console.error(`[SEQUELIZE ERROR] ${new Date().toISOString()}`);
    console.error(`Route: ${req.method} ${req.originalUrl}`);
    console.error(`IP: ${req.ip}`);
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    if (err.sql) {
      console.error(`Failed Query: ${err.sql}`);
    }
  } else {
    // Log other errors
    console.error(`[API ERROR] ${new Date().toISOString()}`);
    console.error(`Route: ${req.method} ${req.originalUrl}`);
    console.error(`IP: ${req.ip}`);
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
  }
  
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`[404] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip}`);
  res.status(404).json({ error: 'Route not found' });
});

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database (create tables)
    await sequelize.sync({ force: false });
    setupAssociations();
    console.log('Database synchronized.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;