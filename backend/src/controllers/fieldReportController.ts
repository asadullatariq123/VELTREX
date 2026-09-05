import { Request, Response } from 'express';
import { z } from 'zod';
import { fieldReportService } from '../services/field/fieldReportService';
import { fieldEvidenceService } from '../services/field/fieldEvidenceService';
import { sendSuccess, sendError } from '../utils/response';
import { FieldReportType, Severity, FieldReportStatus, VerificationStatus } from '@prisma/client';

const createReportSchema = z.object({
  clientReportId: z.string().min(3, 'clientReportId is required'),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  reportType: z
    .enum(['LANDSLIDE', 'CRACK', 'ROCKFALL', 'ROAD_BLOCKAGE', 'SLOPE_FAILURE', 'FLOODING', 'DRAINAGE_FAILURE', 'OTHER'])
    .optional(),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).optional(),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  observedAt: z.string().optional(),
  locationId: z.string().optional(),
  reporterName: z.string().optional(),
  reporterRole: z.enum(['ADMIN', 'DISTRICT_AUTHORITY', 'FIELD_OFFICER', 'COMMUNITY_USER']).optional(),
  accuracy: z.number().optional(),
  source: z.string().optional(),
  offlineCreated: z.boolean().optional(),
});

export const createFieldReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createReportSchema.safeParse(req.body);
    if (!parseResult.success) {
      sendError(res, 'VALIDATION_ERROR', parseResult.error.errors[0]?.message || 'Invalid field report data', 400);
      return;
    }

    const report = await fieldReportService.createReport(parseResult.data as any);
    sendSuccess(res, report, undefined, 201);
  } catch (error: any) {
    if (error.message && error.message.includes('INVALID_COORDINATES')) {
      sendError(res, 'INVALID_COORDINATES', error.message, 400);
      return;
    }
    sendError(res, 'FIELD_REPORT_CREATE_ERROR', error.message || 'Failed to create field report', 500);
  }
};

export const getFieldReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const severity = req.query.severity as Severity | undefined;
    const status = req.query.status as FieldReportStatus | undefined;
    const verificationStatus = req.query.verificationStatus as VerificationStatus | undefined;
    const reportType = req.query.reportType as FieldReportType | undefined;
    const locationId = req.query.locationId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await fieldReportService.getReports({
      page,
      limit,
      severity,
      status,
      verificationStatus,
      reportType,
      locationId,
      startDate,
      endDate,
    });

    sendSuccess(res, result.reports, {
      limit: result.pagination.limit,
      offset: (result.pagination.page - 1) * result.pagination.limit,
      total: result.pagination.total,
    });
  } catch (error: any) {
    sendError(res, 'FIELD_REPORTS_FETCH_ERROR', error.message || 'Failed to fetch field reports', 500);
  }
};

export const getFieldReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const report = await fieldReportService.getReportById(id);
    sendSuccess(res, report);
  } catch (error: any) {
    if (error.message && error.message.includes('NOT_FOUND')) {
      sendError(res, 'REPORT_NOT_FOUND', 'Field report not found', 404);
      return;
    }
    sendError(res, 'FIELD_REPORT_FETCH_ERROR', error.message || 'Failed to fetch field report', 500);
  }
};

export const getGeospatialFieldReports = async (_req: Request, res: Response): Promise<void> => {
  try {
    const geoJson = await fieldReportService.getGeoJson();
    res.status(200).json(geoJson);
  } catch (error: any) {
    sendError(res, 'GEOJSON_FETCH_ERROR', error.message || 'Failed to fetch GeoJSON field reports', 500);
  }
};

export const getNearbyFieldReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = parseFloat(req.query.latitude as string);
    const lng = parseFloat(req.query.longitude as string);
    const radiusMeters = parseInt((req.query.radius as string) || '10000', 10);

    if (isNaN(lat) || isNaN(lng)) {
      sendError(res, 'INVALID_COORDINATES', 'Latitude and longitude parameters are required numbers', 400);
      return;
    }

    const reports = await fieldReportService.getNearbyReports(lat, lng, radiusMeters);
    sendSuccess(res, reports);
  } catch (error: any) {
    sendError(res, 'NEARBY_REPORTS_ERROR', error.message || 'Failed to fetch nearby field reports', 500);
  }
};

export const uploadReportMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Allowed MIME types and safe extensions
    const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4']);
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

    let fileBuffer: Buffer;
    let originalName = 'upload.jpg';
    let mimeType = 'image/jpeg';

    if (req.body && req.body.base64Data) {
      const match = req.body.base64Data.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        mimeType = match[1].toLowerCase();
        fileBuffer = Buffer.from(match[2], 'base64');
      } else {
        fileBuffer = Buffer.from(req.body.base64Data, 'base64');
      }
      if (req.body.fileName) originalName = req.body.fileName;
    } else if (Buffer.isBuffer(req.body)) {
      fileBuffer = req.body;
      if (req.headers['content-type']) mimeType = req.headers['content-type'].toLowerCase();
    } else {
      sendError(res, 'INVALID_FILE_PAYLOAD', 'File content payload is missing or empty.', 400);
      return;
    }

    // Size limit validation
    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      sendError(res, 'FILE_TOO_LARGE', 'Uploaded file exceeds maximum limit of 10MB.', 400);
      return;
    }

    // MIME type validation
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      sendError(res, 'INVALID_MIME_TYPE', `Forbidden file type '${mimeType}'. Allowed: JPEG, PNG, WEBP, MP4.`, 400);
      return;
    }

    // Safe randomized storage filename (prevents path traversal & script execution)
    const sanitizedExt = mimeType === 'video/mp4' ? '.mp4' : mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
    const safeFileName = `evidence_${Date.now()}_${Math.random().toString(36).substring(2, 10)}${sanitizedExt}`;

    const media = await fieldReportService.attachMedia(id, fileBuffer, safeFileName, mimeType);
    sendSuccess(res, media, undefined, 201);
  } catch (error: any) {
    sendError(res, 'MEDIA_UPLOAD_ERROR', error.message || 'Failed to upload report media', 500);
  }
};

export const getFieldEvidenceForLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const summary = await fieldEvidenceService.getEvidenceForLocation(locationId);
    sendSuccess(res, summary);
  } catch (error: any) {
    sendError(res, 'EVIDENCE_SUMMARY_ERROR', error.message || 'Failed to fetch field evidence summary', 500);
  }
};
