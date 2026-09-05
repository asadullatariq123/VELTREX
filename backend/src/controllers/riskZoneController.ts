import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { RiskLevel } from '@prisma/client';

export const getRiskZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const riskLevelParam = req.query.riskLevel as string | undefined;
    const stateParam = req.query.state as string | undefined;
    const minScoreParam = req.query.minScore ? parseInt(req.query.minScore as string, 10) : undefined;
    const maxScoreParam = req.query.maxScore ? parseInt(req.query.maxScore as string, 10) : undefined;
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

    if (minScoreParam !== undefined || maxScoreParam !== undefined) {
      where.riskScore = {};
      if (minScoreParam !== undefined) where.riskScore.gte = minScoreParam;
      if (maxScoreParam !== undefined) where.riskScore.lte = maxScoreParam;
    }

    const total = await prisma.riskZone.count({ where });

    const riskZones = await prisma.riskZone.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        location: {
          include: {
            state: true,
          },
        },
      },
      orderBy: { riskScore: 'desc' },
    });

    const items = riskZones.map((rz) => ({
      id: rz.id,
      locationId: rz.locationId,
      locationName: rz.location.name,
      district: rz.location.district,
      state: rz.location.state.name,
      latitude: rz.location.latitude,
      longitude: rz.location.longitude,
      riskScore: rz.riskScore,
      riskLevel: rz.riskLevel,
      confidence: rz.confidence,
      status: rz.status,
      contributors: {
        rainfall: rz.rainfallContribution,
        soilMoisture: rz.soilMoistureContribution,
        slope: rz.slopeContribution,
        terrain: rz.terrainContribution,
        historical: rz.historicalContribution,
        displacement: rz.displacementContribution,
      },
      updatedAt: rz.updatedAt.toISOString(),
    }));

    sendSuccess(res, items, { limit, offset, total });
  } catch (error: any) {
    sendError(res, 'RISK_ZONE_ERROR', error.message || 'Failed to fetch risk zones', 500);
  }
};

export const getRiskZoneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const riskZone = await prisma.riskZone.findUnique({
      where: { id },
      include: {
        location: {
          include: {
            state: true,
            sensors: true,
            infrastructure: true,
            incidents: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
            predictions: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!riskZone) {
      sendError(res, 'RISK_ZONE_NOT_FOUND', `Risk Zone with ID ${id} not found`, 404);
      return;
    }

    const responseData = {
      id: riskZone.id,
      location: {
        id: riskZone.location.id,
        name: riskZone.location.name,
        state: riskZone.location.state.name,
        district: riskZone.location.district,
        latitude: riskZone.location.latitude,
        longitude: riskZone.location.longitude,
        elevation: riskZone.location.elevation,
      },
      riskScore: riskZone.riskScore,
      riskLevel: riskZone.riskLevel,
      confidence: riskZone.confidence,
      riskContributors: {
        rainfall: riskZone.rainfallContribution,
        soilMoisture: riskZone.soilMoistureContribution,
        slope: riskZone.slopeContribution,
        terrain: riskZone.terrainContribution,
        historical: riskZone.historicalContribution,
        displacement: riskZone.displacementContribution,
      },
      nearbySensors: riskZone.location.sensors,
      nearbyInfrastructure: riskZone.location.infrastructure,
      recentIncidents: riskZone.location.incidents,
      latestPrediction: riskZone.location.predictions[0] || null,
      updatedAt: riskZone.updatedAt.toISOString(),
    };

    sendSuccess(res, responseData);
  } catch (error: any) {
    sendError(res, 'RISK_ZONE_DETAIL_ERROR', error.message || 'Failed to fetch risk zone detail', 500);
  }
};
