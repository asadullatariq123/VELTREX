import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { InfraType } from '@prisma/client';

export const getInfrastructure = async (req: Request, res: Response): Promise<void> => {
  try {
    const typeParam = req.query.type as string | undefined;
    const stateParam = req.query.state as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const offset = parseInt((req.query.offset as string) || '0', 10);

    const where: any = {};

    if (typeParam && Object.values(InfraType).includes(typeParam.toUpperCase() as InfraType)) {
      where.type = typeParam.toUpperCase() as InfraType;
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

    const total = await prisma.infrastructure.count({ where });

    const items = await prisma.infrastructure.findMany({
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
      orderBy: { name: 'asc' },
    });

    const formattedItems = items.map((infra) => ({
      id: infra.id,
      name: infra.name,
      type: infra.type,
      status: infra.status,
      latitude: infra.latitude,
      longitude: infra.longitude,
      location: {
        id: infra.location.id,
        name: infra.location.name,
        state: infra.location.state.name,
        district: infra.location.district,
      },
    }));

    sendSuccess(res, formattedItems, { limit, offset, total });
  } catch (error: any) {
    sendError(res, 'INFRASTRUCTURE_ERROR', error.message || 'Failed to fetch infrastructure records', 500);
  }
};

export const getInfrastructureById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const infra = await prisma.infrastructure.findUnique({
      where: { id },
      include: {
        location: {
          include: {
            state: true,
          },
        },
      },
    });

    if (!infra) {
      sendError(res, 'INFRASTRUCTURE_NOT_FOUND', `Infrastructure record with ID ${id} not found`, 404);
      return;
    }

    sendSuccess(res, infra);
  } catch (error: any) {
    sendError(res, 'INFRA_DETAIL_ERROR', error.message || 'Failed to fetch infrastructure detail', 500);
  }
};
