import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { Severity, IncidentStatus } from '@prisma/client';

export const getIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const severityParam = req.query.severity as string | undefined;
    const statusParam = req.query.status as string | undefined;
    const stateParam = req.query.state as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const offset = parseInt((req.query.offset as string) || '0', 10);

    const where: any = {};

    if (severityParam && Object.values(Severity).includes(severityParam.toUpperCase() as Severity)) {
      where.severity = severityParam.toUpperCase() as Severity;
    }

    if (statusParam && Object.values(IncidentStatus).includes(statusParam.toUpperCase() as IncidentStatus)) {
      where.status = statusParam.toUpperCase() as IncidentStatus;
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

    const total = await prisma.incident.count({ where });

    const incidents = await prisma.incident.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    const items = incidents.map((inc) => ({
      id: inc.id,
      title: inc.title,
      description: inc.description,
      severity: inc.severity,
      status: inc.status,
      assignedTeam: inc.assignedTeam,
      latitude: inc.latitude,
      longitude: inc.longitude,
      location: {
        id: inc.location.id,
        name: inc.location.name,
        state: inc.location.state.name,
        district: inc.location.district,
      },
      createdAt: inc.createdAt.toISOString(),
      updatedAt: inc.updatedAt.toISOString(),
    }));

    sendSuccess(res, items, { limit, offset, total });
  } catch (error: any) {
    sendError(res, 'INCIDENT_ERROR', error.message || 'Failed to fetch incidents', 500);
  }
};

export const getIncidentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        location: {
          include: {
            state: true,
          },
        },
      },
    });

    if (!incident) {
      sendError(res, 'INCIDENT_NOT_FOUND', `Incident with ID ${id} not found`, 404);
      return;
    }

    sendSuccess(res, incident);
  } catch (error: any) {
    sendError(res, 'INCIDENT_DETAIL_ERROR', error.message || 'Failed to fetch incident detail', 500);
  }
};
