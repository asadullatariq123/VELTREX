import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { alertService } from '../services/alerts/alertService';
import { translationService } from '../services/i18n/translationService';

// Validation Schemas
const createManualAlertSchema = z.object({
  locationId: z.string().optional(),
  alertLevel: z.enum(['ADVISORY', 'WATCH', 'WARNING', 'EMERGENCY']),
  priority: z.enum(['P4', 'P3', 'P2', 'P1']),
  title: z.string().min(3),
  message: z.string().min(5),
  recommendedAction: z.string().min(5),
  expiresAt: z.string().optional()
});

const alertQuerySchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'EXPIRED', 'CANCELLED', 'QUEUED', 'SENT', 'FAILED']).optional(),
  priority: z.enum(['P4', 'P3', 'P2', 'P1']).optional(),
  alertLevel: z.enum(['ADVISORY', 'WATCH', 'WARNING', 'EMERGENCY']).optional(),
  locationId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

export class AlertController {
  /**
   * GET /api/v1/alerts
   */
  public async getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = alertQuerySchema.parse(req.query);
      const result = await alertService.getAlerts({
        status: query.status as any,
        priority: query.priority as any,
        alertLevel: query.alertLevel as any,
        locationId: query.locationId,
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20
      });

      res.status(200).json({
        success: true,
        data: result.alerts,
        meta: result.pagination,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/alerts/:id
   */
  public async getAlertById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await alertService.getAlertById(req.params.id);
      if (!alert) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Alert not found' }
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/alerts/generate/:locationId
   */
  public async generateAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId } = req.params;
      const result = await alertService.generateAlert(locationId);

      res.status(201).json({
        success: true,
        data: {
          decision: result.decision,
          alert: result.alert
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/alerts/manual
   */
  public async createManualAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createManualAlertSchema.parse(req.body);
      const alert = await alertService.createManualAlert({
        locationId: body.locationId,
        alertLevel: body.alertLevel,
        priority: body.priority,
        title: body.title,
        message: body.message,
        recommendedAction: body.recommendedAction,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined
      });

      res.status(201).json({
        success: true,
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/alerts/:id/acknowledge
   */
  public async acknowledgeAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await alertService.acknowledgeAlert(req.params.id);
      if (!alert) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Alert not found' }
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/alerts/:id/resolve
   */
  public async resolveAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await alertService.resolveAlert(req.params.id);
      if (!alert) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Alert not found' }
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/alerts/:id/languages/:language
   */
  public async getLocalizedAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, language } = req.params;
      const alert = await alertService.getAlertById(id);

      if (!alert) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Alert not found' }
        });
        return;
      }

      const locName = (alert as any).location?.name || 'Monitored Zone';
      const localized = translationService.translateAlert(
        {
          alertLevel: alert.alertLevel,
          title: alert.title,
          message: alert.message,
          recommendedAction: alert.recommendedAction,
          locationName: locName
        },
        language
      );

      res.status(200).json({
        success: true,
        data: {
          alertId: alert.id,
          originalTitle: alert.title,
          localized
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/geospatial/alerts
   */
  public async getGeoJsonAlerts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const geojson = await alertService.getGeoJsonAlerts();
      res.status(200).json(geojson);
    } catch (error) {
      next(error);
    }
  }
}

export const alertController = new AlertController();
