import { Request, Response } from 'express';
import { demoEnvironmentalProvider } from '../services/providers/DemoEnvironmentalProvider';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

export const getCurrentEnvironment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const observation = await demoEnvironmentalProvider.getCurrentData(locationId);
    sendSuccess(res, observation);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      sendError(res, 'LOCATION_NOT_FOUND', error.message, 404);
      return;
    }
    sendError(res, 'ENVIRONMENT_ERROR', error.message || 'Failed to fetch environmental data', 500);
  }
};

export const getEnvironmentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const from = fromParam ? new Date(fromParam) : undefined;
    const to = toParam ? new Date(toParam) : undefined;

    const history = await demoEnvironmentalProvider.getHistoricalData(locationId, {
      from,
      to,
      limit,
    });

    sendSuccess(res, history);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      sendError(res, 'LOCATION_NOT_FOUND', error.message, 404);
      return;
    }
    sendError(res, 'ENVIRONMENT_HISTORY_ERROR', error.message || 'Failed to fetch environmental history', 500);
  }
};

export const getEnvironmentSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalLocations = await prisma.location.count();
    const weatherReadings = await prisma.weatherReading.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    let totalRain = 0;
    let totalSoilMoisture = 0;
    let count = weatherReadings.length;
    let locationsElevatedRain = 0;
    let locationsHighSaturation = 0;

    if (count > 0) {
      for (const w of weatherReadings) {
        totalRain += w.rainfall;
        totalSoilMoisture += w.soilMoisture;
        if (w.rainfall > 50.0) locationsElevatedRain++;
        if (w.soilMoisture > 70.0) locationsHighSaturation++;
      }
    }

    const latestRainfall = count > 0 ? Math.round((totalRain / count) * 10) / 10 : 48.5;
    const averageSoilMoisture = count > 0 ? Math.round(totalSoilMoisture / count) : 68;

    const summary = {
      source: 'DEMO',
      locationsMonitored: totalLocations,
      latestRainfall: { value: latestRainfall, unit: 'mm' },
      averageSoilMoisture: { value: averageSoilMoisture, unit: '%' },
      locationsWithElevatedRainfall: locationsElevatedRain,
      locationsWithHighSoilSaturation: locationsHighSaturation,
      latestUpdateTime: new Date().toISOString(),
    };

    sendSuccess(res, summary);
  } catch (error: any) {
    sendError(res, 'ENVIRONMENT_SUMMARY_ERROR', error.message || 'Failed to fetch environmental summary', 500);
  }
};
