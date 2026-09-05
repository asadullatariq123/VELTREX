import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { SensorType, SensorStatus } from '@prisma/client';

export const getSensors = async (req: Request, res: Response): Promise<void> => {
  try {
    const typeParam = req.query.type as string | undefined;
    const statusParam = req.query.status as string | undefined;
    const stateParam = req.query.state as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const offset = parseInt((req.query.offset as string) || '0', 10);

    const where: any = {};

    if (typeParam && Object.values(SensorType).includes(typeParam.toUpperCase() as SensorType)) {
      where.sensorType = typeParam.toUpperCase() as SensorType;
    }

    if (statusParam && Object.values(SensorStatus).includes(statusParam.toUpperCase() as SensorStatus)) {
      where.status = statusParam.toUpperCase() as SensorStatus;
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

    const total = await prisma.sensor.count({ where });

    const sensors = await prisma.sensor.findMany({
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
      orderBy: { stationName: 'asc' },
    });

    const items = sensors.map((s) => ({
      id: s.id,
      stationCode: s.stationCode,
      stationName: s.stationName,
      sensorType: s.sensorType,
      status: s.status,
      unit: s.unit,
      currentValue: s.currentValue,
      batteryLevel: s.batteryLevel,
      lastUpdated: s.lastUpdated.toISOString(),
      location: {
        id: s.location.id,
        name: s.location.name,
        state: s.location.state.name,
        district: s.location.district,
        latitude: s.location.latitude,
        longitude: s.location.longitude,
      },
    }));

    sendSuccess(res, items, { limit, offset, total });
  } catch (error: any) {
    sendError(res, 'SENSOR_ERROR', error.message || 'Failed to fetch sensors', 500);
  }
};

export const getSensorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sensor = await prisma.sensor.findUnique({
      where: { id },
      include: {
        location: {
          include: {
            state: true,
          },
        },
        readings: {
          take: 10,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!sensor) {
      sendError(res, 'SENSOR_NOT_FOUND', `Sensor with ID ${id} not found`, 404);
      return;
    }

    sendSuccess(res, sensor);
  } catch (error: any) {
    sendError(res, 'SENSOR_DETAIL_ERROR', error.message || 'Failed to fetch sensor detail', 500);
  }
};

export const getSensorReadings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 500);

    const where: any = { sensorId: id };

    if (fromParam || toParam) {
      where.timestamp = {};
      if (fromParam) where.timestamp.gte = new Date(fromParam);
      if (toParam) where.timestamp.lte = new Date(toParam);
    }

    const readings = await prisma.sensorReading.findMany({
      where,
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    sendSuccess(res, readings);
  } catch (error: any) {
    sendError(res, 'SENSOR_READINGS_ERROR', error.message || 'Failed to fetch sensor readings', 500);
  }
};
