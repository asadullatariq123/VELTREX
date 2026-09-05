import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import healthRoutes from './routes/healthRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import locationRoutes from './routes/locationRoutes';
import riskZoneRoutes from './routes/riskZoneRoutes';
import geospatialRoutes from './routes/geospatialRoutes';
import sensorRoutes from './routes/sensorRoutes';
import infrastructureRoutes from './routes/infrastructureRoutes';
import incidentRoutes from './routes/incidentRoutes';
import environmentRoutes from './routes/environmentRoutes';
import weatherRoutes from './routes/weatherRoutes';
import satelliteRoutes from './routes/satelliteRoutes';
import riskRoutes from './routes/riskRoutes';
import predictionRoutes from './routes/predictionRoutes';
import fieldReportRoutes from './routes/fieldReportRoutes';
import { alertRouter } from './routes/alertRoutes';
import { systemRouter } from './routes/systemRoutes';
import { simulationRouter } from './routes/simulationRoutes';
import path from 'path';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Strict Origin CORS Middleware
const allowedOrigins = new Set([
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like server-to-server or curl) or in allowed origins list
      if (!origin || allowedOrigins.has(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else if (env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: Origin '${origin}' is not authorized.`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Structured API request logging (Sanitized - no secrets logged)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Serve uploaded media statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'VELTREX Geospatial Landslide Intelligence API Engine',
    status: 'ONLINE',
    version: '1.0.0',
    healthCheck: '/api/v1/health',
    systemStatus: '/api/v1/system/status',
  });
});

// API v1 Routes
app.use('/api/v1', healthRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', locationRoutes);
app.use('/api/v1', riskZoneRoutes);
app.use('/api/v1', geospatialRoutes);
app.use('/api/v1', sensorRoutes);
app.use('/api/v1', infrastructureRoutes);
app.use('/api/v1', incidentRoutes);
app.use('/api/v1', environmentRoutes);
app.use('/api/v1', weatherRoutes);
app.use('/api/v1', satelliteRoutes);
app.use('/api/v1', riskRoutes);
app.use('/api/v1', predictionRoutes);
app.use('/api/v1', fieldReportRoutes);
app.use('/api/v1', alertRouter);
app.use('/api/v1', systemRouter);
app.use('/api/v1', simulationRouter);

// Not found handler for unhandled routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
