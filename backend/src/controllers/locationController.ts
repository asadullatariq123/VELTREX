import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

export const getLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const stateFilter = req.query.state as string | undefined;
    const districtFilter = req.query.district as string | undefined;
    const searchFilter = req.query.search as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const offset = parseInt((req.query.offset as string) || '0', 10);

    const where: any = {};

    if (stateFilter) {
      where.state = {
        OR: [
          { code: { equals: stateFilter, mode: 'insensitive' } },
          { name: { contains: stateFilter, mode: 'insensitive' } },
        ],
      };
    }

    if (districtFilter) {
      where.district = { contains: districtFilter, mode: 'insensitive' };
    }

    if (searchFilter) {
      where.OR = [
        { name: { contains: searchFilter, mode: 'insensitive' } },
        { district: { contains: searchFilter, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.location.count({ where });

    const locations = await prisma.location.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        state: true,
        riskZones: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const items = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      state: loc.state.name,
      stateCode: loc.state.code,
      district: loc.district,
      latitude: loc.latitude,
      longitude: loc.longitude,
      elevation: loc.elevation,
      riskLevel: loc.riskZones[0]?.riskLevel || 'LOW',
      riskScore: loc.riskZones[0]?.riskScore || 0,
      geometry: {
        type: 'Point',
        coordinates: [loc.longitude, loc.latitude],
      },
    }));

    sendSuccess(res, items, { limit, offset, total });
  } catch (error: any) {
    sendError(res, 'LOCATION_ERROR', error.message || 'Failed to fetch locations', 500);
  }
};

export const getLocationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        state: true,
        riskZones: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        sensors: true,
        infrastructure: true,
        weatherReadings: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        satelliteObservations: {
          take: 1,
          orderBy: { observationTime: 'desc' },
        },
      },
    });

    if (!location) {
      sendError(res, 'LOCATION_NOT_FOUND', `Location with ID ${id} not found`, 404);
      return;
    }

    const responseData = {
      id: location.id,
      name: location.name,
      state: location.state.name,
      stateCode: location.state.code,
      district: location.district,
      latitude: location.latitude,
      longitude: location.longitude,
      elevation: location.elevation,
      geometry: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      currentRiskZone: location.riskZones[0] || null,
      sensors: location.sensors,
      infrastructure: location.infrastructure,
      latestWeatherRecord: location.weatherReadings[0] || null,
      latestSatelliteRecord: location.satelliteObservations[0] || null,
    };

    sendSuccess(res, responseData);
  } catch (error: any) {
    sendError(res, 'LOCATION_DETAIL_ERROR', error.message || 'Failed to fetch location detail', 500);
  }
};
