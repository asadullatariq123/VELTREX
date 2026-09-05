import { Request, Response } from 'express';
import { z } from 'zod';
import { predictionService } from '../services/ml/predictionService';
import { modelMetrics } from '../services/ml/modelMetrics';
import { sendSuccess, sendError } from '../utils/response';
import { PredictionHorizon } from '../services/ml/mlTypes';

const horizonSchema = z.enum(['NOW', '6H', '24H', '72H', '7D']);

export const getPredictionsByLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const predictions = await predictionService.getPredictionsForLocation(locationId);

    sendSuccess(res, {
      locationId,
      locationName: predictions[0]?.locationName || 'Unknown Location',
      state: predictions[0]?.state || 'Unknown State',
      district: predictions[0]?.district || 'Unknown District',
      predictions,
      modelStatus: 'PROTOTYPE',
      dataMode: 'DEMO',
    });
  } catch (error: any) {
    sendError(res, 'PREDICTION_FETCH_ERROR', error.message || 'Failed to fetch predictions for location', 500);
  }
};

export const generatePredictionForLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const bodyResult = horizonSchema.safeParse(req.body?.horizon || '24H');

    if (!bodyResult.success) {
      sendError(res, 'INVALID_HORIZON', 'Invalid prediction horizon. Allowed values: NOW, 6H, 24H, 72H, 7D', 400);
      return;
    }

    const horizon = bodyResult.data as PredictionHorizon;
    const prediction = await predictionService.generatePrediction(locationId, horizon);

    sendSuccess(res, prediction);
  } catch (error: any) {
    sendError(res, 'PREDICTION_GENERATION_ERROR', error.message || 'Failed to generate prediction', 500);
  }
};

export const getPredictionExplanation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const horizonQuery = (req.query.horizon as string) || '24H';
    const horizonParsed = horizonSchema.safeParse(horizonQuery.toUpperCase());
    const horizon = horizonParsed.success ? (horizonParsed.data as PredictionHorizon) : '24H';

    const explanation = await predictionService.getPredictionExplanation(locationId, horizon);
    sendSuccess(res, explanation);
  } catch (error: any) {
    sendError(res, 'PREDICTION_EXPLANATION_ERROR', error.message || 'Failed to fetch prediction explanation', 500);
  }
};

export const getPredictionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const history = await predictionService.getPredictionHistory(locationId, limit);

    sendSuccess(res, history);
  } catch (error: any) {
    sendError(res, 'PREDICTION_HISTORY_ERROR', error.message || 'Failed to fetch prediction history', 500);
  }
};

export const getModelInfo = async (_req: Request, res: Response): Promise<void> => {
  try {
    const info = modelMetrics.getModelMetrics();
    sendSuccess(res, info);
  } catch (error: any) {
    sendError(res, 'MODEL_INFO_ERROR', error.message || 'Failed to fetch model info', 500);
  }
};
