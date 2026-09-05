import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { realtimeServer } from '../realtime/realtimeServer';
import { weatherService } from '../services/weather/weatherService';
import { satelliteService } from '../services/satellite/satelliteService';

export class SystemController {
  public async getSystemStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let dbStatus: 'ONLINE' | 'OFFLINE' = 'ONLINE';
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch {
        dbStatus = 'OFFLINE';
      }

      const realtimeActive = Boolean(realtimeServer.getIO());

      // Query weather status
      let weatherStatus = 'DEMO';
      try {
        const weatherObs = await weatherService.getWeatherForLocation('loc-aizawl-01');
        weatherStatus = weatherObs.status === 'LIVE' || weatherObs.source === 'LIVE' ? 'LIVE' : 'DEMO';
      } catch {
        weatherStatus = 'FAILED';
      }

      // Query satellite status
      let satelliteStatus = 'DEMO';
      try {
        const satStatus = await satelliteService.getSatelliteStatus();
        const satObs = await satelliteService.getLatestObservation('loc-aizawl-01');
        if (satObs.status === 'AUTH FAILED') {
          satelliteStatus = 'AUTH FAILED';
        } else if (satObs.status === 'DATA REQUEST FAILED') {
          satelliteStatus = 'DATA REQUEST FAILED';
        } else if (satStatus.status === 'LIVE' || satObs.status === 'LIVE') {
          satelliteStatus = 'LIVE';
        } else {
          satelliteStatus = 'DEMO';
        }
      } catch {
        satelliteStatus = 'FAILED';
      }

      res.status(200).json({
        success: true,
        data: {
          api: 'ONLINE',
          database: dbStatus,
          realtime: realtimeActive ? 'ONLINE' : 'OFFLINE',
          weather: weatherStatus,
          satellite: satelliteStatus,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const systemController = new SystemController();
