import { Request, Response } from 'express';
import { satelliteService } from '../services/satellite/satelliteService';
import { sendSuccess, sendError } from '../utils/response';

export const getLatestSatelliteObservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const observation = await satelliteService.getLatestObservation(locationId);
    sendSuccess(res, observation);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      sendError(res, 'LOCATION_NOT_FOUND', error.message, 404);
      return;
    }
    sendError(res, 'SATELLITE_ERROR', error.message || 'Failed to fetch satellite observation', 500);
  }
};

export const refreshSatelliteObservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const observation = await satelliteService.refreshObservation(locationId);
    sendSuccess(res, observation);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      sendError(res, 'LOCATION_NOT_FOUND', error.message, 404);
      return;
    }
    sendError(res, 'SATELLITE_REFRESH_ERROR', error.message || 'Failed to refresh satellite observation', 500);
  }
};

export const getSatelliteHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const history = await satelliteService.getSatelliteHistory(locationId, {
      from: fromParam ? new Date(fromParam) : undefined,
      to: toParam ? new Date(toParam) : undefined,
      limit,
    });

    sendSuccess(res, history);
  } catch (error: any) {
    sendError(res, 'SATELLITE_HISTORY_ERROR', error.message || 'Failed to fetch satellite history', 500);
  }
};

export const getSatelliteStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await satelliteService.getSatelliteStatus();
    sendSuccess(res, status);
  } catch (error: any) {
    sendError(res, 'SATELLITE_STATUS_ERROR', error.message || 'Failed to fetch satellite status', 500);
  }
};

export const getSatelliteObservationsGeoJson = async (req: Request, res: Response): Promise<void> => {
  try {
    const state = req.query.state as string | undefined;
    const observationType = req.query.observationType as string | undefined;

    const geojson = await satelliteService.getSatelliteObservationsGeoJson({
      state,
      observationType,
    });

    res.status(200).json(geojson);
  } catch (error: any) {
    sendError(res, 'SATELLITE_GEOJSON_ERROR', error.message || 'Failed to fetch satellite GeoJSON', 500);
  }
};
