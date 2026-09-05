import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';
import { realtimeServer } from '../realtime/realtimeServer';
import { weatherService } from '../services/weather/weatherService';
import { satelliteService } from '../services/satellite/satelliteService';

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const isDbConnected = await checkDatabaseConnection();
  const isRealtimeActive = Boolean(realtimeServer.getIO());

  let weatherStatus = 'DEMO';
  try {
    const weatherObs = await weatherService.getWeatherForLocation('loc-aizawl-01');
    weatherStatus = weatherObs.status === 'LIVE' || weatherObs.source === 'LIVE' ? 'LIVE' : 'DEMO';
  } catch {
    weatherStatus = 'FAILED';
  }

  let satelliteStatus = 'DEMO';
  try {
    const satObs = await satelliteService.getLatestObservation('loc-aizawl-01');
    satelliteStatus = satObs.status;
  } catch {
    satelliteStatus = 'FAILED';
  }

  const timestamp = new Date().toISOString();

  res.status(200).json({
    status: isDbConnected ? 'ok' : 'degraded',
    services: {
      api: 'ONLINE',
      database: isDbConnected ? 'ONLINE' : 'OFFLINE',
      realtime: isRealtimeActive ? 'ONLINE' : 'OFFLINE',
      weather: weatherStatus,
      satellite: satelliteStatus,
    },
    timestamp,
  });
};

export const getRoot = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      name: 'VELTREX',
      description: 'AI-Powered Geospatial Landslide Intelligence Platform',
      version: '1.0.0',
      status: 'ONLINE',
    },
  });
};
