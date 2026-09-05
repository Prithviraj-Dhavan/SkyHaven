import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { flightRoutes } from './modules/flights/flights.routes.js';
import { bookingRoutes } from './modules/bookings/bookings.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { NotificationsService } from './modules/notifications/notifications.service.js';

export function createApp() {
  const app = express();

  // Initialize in-process notifications module
  NotificationsService.init();

  // Core Security & Request Parsing Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible integration in dev
    })
  );

  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(generalLimiter);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Healthcheck & Monolith Info Endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      system: 'SkyHaven Monolith Server',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      modules: ['auth', 'flights', 'bookings', 'payments', 'ai_assistant', 'notifications', 'admin'],
      version: '1.0.0',
    });
  });

  // Mount Monolith API Modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/flights', flightRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 404 Route Catch-All
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found on SkyHaven monolith.`,
        code: 'ROUTE_NOT_FOUND',
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
