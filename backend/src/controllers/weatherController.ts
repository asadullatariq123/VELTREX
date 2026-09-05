import { Request, Response } from 'express';
import { weatherService } from '../services/weather/weatherService';
import { sendSuccess, sendError } from '../utils/response';

export const getWeather = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const weather = await weatherService.getWeatherForLocation(locationId);
    sendSuccess(res, weather);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      sendError(res, 'LOCATION_NOT_FOUND', error.message, 404);
      return;
    }
    sendError(res, 'WEATHER_ERROR', error.message || 'Failed to fetch weather data', 500);
  }
};

export const refreshWeather = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const weather = await weatherService.refreshWeatherForLocation(locationId);
    sendSuccess(res, weather);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      sendError(res, 'LOCATION_NOT_FOUND', error.message, 404);
      return;
    }
    sendError(res, 'WEATHER_REFRESH_ERROR', error.message || 'Failed to refresh weather data', 500);
  }
};

export const getWeatherHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const history = await weatherService.getWeatherHistory(locationId, {
      from: fromParam ? new Date(fromParam) : undefined,
      to: toParam ? new Date(toParam) : undefined,
      limit,
    });

    sendSuccess(res, history);
  } catch (error: any) {
    sendError(res, 'WEATHER_HISTORY_ERROR', error.message || 'Failed to fetch weather history', 500);
  }
};

export const getRainfallIntelligence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const rainfall = await weatherService.getRainfallIntelligence(locationId);
    sendSuccess(res, rainfall);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      sendError(res, 'LOCATION_NOT_FOUND', error.message, 404);
      return;
    }
    sendError(res, 'RAINFALL_INTEL_ERROR', error.message || 'Failed to fetch rainfall intelligence', 500);
  }
};
