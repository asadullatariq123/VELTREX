import { Request, Response } from 'express';
import { riskEngine } from '../services/risk/riskEngine';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { RiskLevel } from '@prisma/client';

export const getRiskAssessmentByLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const assessment = await riskEngine.evaluateRiskForLocation(locationId);
    sendSuccess(res, assessment);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      sendError(res, 'LOCATION_NOT_FOUND', error.message, 404);
      return;
    }
    sendError(res, 'RISK_ENGINE_ERROR', error.message || 'Failed to calculate risk assessment', 500);
  }
};

export const recalculateRiskByLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const assessment = await riskEngine.recalculateAndSave(locationId);
    sendSuccess(res, assessment);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      sendError(res, 'LOCATION_NOT_FOUND', error.message, 404);
      return;
    }
    sendError(res, 'RISK_RECALCULATION_ERROR', error.message || 'Failed to recalculate risk', 500);
  }
};

export const getRegionalRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const stateParam = req.query.state as string | undefined;
    const riskLevelParam = req.query.riskLevel as string | undefined;
    const minScoreParam = req.query.minScore ? parseInt(req.query.minScore as string, 10) : undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const offset = parseInt((req.query.offset as string) || '0', 10);

    const where: any = {};

    if (riskLevelParam && Object.values(RiskLevel).includes(riskLevelParam.toUpperCase() as RiskLevel)) {
      where.riskLevel = riskLevelParam.toUpperCase() as RiskLevel;
    }

    if (stateParam) {
      where.location = {
        state: {
          OR: [
            { code: { equals: stateParam, mode: 'insensitive' } },
            { name: { contains: stateParam, mode: 'insensitive' } },
          ],
        },
      };
    }

    if (minScoreParam !== undefined) {
      where.riskScore = { gte: minScoreParam };
    }

    const total = await prisma.riskZone.count({ where });

    const riskZones = await prisma.riskZone.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        location: {
          include: { state: true },
        },
      },
      orderBy: { riskScore: 'desc' },
    });

    const items = riskZones.map((rz) => ({
      id: rz.id,
      locationId: rz.locationId,
      locationName: rz.location.name,
      state: rz.location.state.name,
      stateCode: rz.location.state.code,
      district: rz.location.district,
      latitude: rz.location.latitude,
      longitude: rz.location.longitude,
      riskScore: rz.riskScore,
      riskLevel: rz.riskLevel,
      confidence: rz.confidence,
      updatedAt: rz.updatedAt.toISOString(),
      model: 'VELTREX-PROTOTYPE-V1',
    }));

    sendSuccess(res, items, { limit, offset, total });
  } catch (error: any) {
    sendError(res, 'REGIONAL_RISK_ERROR', error.message || 'Failed to fetch regional risk summary', 500);
  }
};

export const getRiskGeoJson = async (req: Request, res: Response): Promise<void> => {
  try {
    const riskZones = await prisma.riskZone.findMany({
      include: {
        location: {
          include: { state: true },
        },
      },
      orderBy: { riskScore: 'desc' },
    });

    const features = riskZones.map((rz) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [rz.location.longitude, rz.location.latitude],
      },
      properties: {
        id: rz.id,
        locationId: rz.locationId,
        location: rz.location.name,
        district: rz.location.district,
        state: rz.location.state.name,
        riskScore: rz.riskScore,
        riskLevel: rz.riskLevel,
        confidence: rz.confidence,
        updatedAt: rz.updatedAt.toISOString(),
      },
    }));

    res.status(200).json({
      type: 'FeatureCollection',
      features,
    });
  } catch (error: any) {
    sendError(res, 'RISK_GEOJSON_ERROR', error.message || 'Failed to fetch risk GeoJSON', 500);
  }
};
