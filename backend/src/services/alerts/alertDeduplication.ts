import { AlertLevel, AlertPriority, Alert } from '@prisma/client';
import { prisma } from '../../config/database';
import { DEFAULT_ALERT_POLICY } from './alertPolicy';
import { memoryAlertStore } from './alertService';

export interface DeduplicationCheckResult {
  isDuplicate: boolean;
  existingAlert: Alert | null;
}

export class AlertDeduplicationService {
  /**
   * Check if an active alert already exists for the location within the cooldown window.
   * If DB is offline, returns false (allowing creation without deduplication crash).
   */
  public async checkDeduplication(
    locationId: string,
    alertLevel: AlertLevel,
    priority: AlertPriority,
    cooldownMinutes: number = DEFAULT_ALERT_POLICY.deduplicationWindowMinutes
  ): Promise<DeduplicationCheckResult> {
    const cutoffTime = new Date(Date.now() - cooldownMinutes * 60 * 1000);

    try {
      const activeAlerts = await prisma.alert.findMany({
        where: {
          locationId,
          status: 'ACTIVE',
          generatedAt: {
            gte: cutoffTime
          }
        },
        orderBy: { generatedAt: 'desc' },
        take: 1
      });

      if (activeAlerts.length > 0) {
        const existing = activeAlerts[0];
        // If alert level/priority is same or lower, mark as duplicate
        return {
          isDuplicate: true,
          existingAlert: existing
        };
      }
    } catch {
      // Offline fallback: check in-memory store for active alerts within window
      const activeInMem = Array.from(memoryAlertStore.values()).find(
        (a) => a.locationId === locationId && a.status === 'ACTIVE' && (a.generatedAt.getTime() >= cutoffTime.getTime())
      );
      if (activeInMem) {
        return {
          isDuplicate: true,
          existingAlert: activeInMem
        };
      }
    }

    return {
      isDuplicate: false,
      existingAlert: null
    };
  }
}

export const alertDeduplicationService = new AlertDeduplicationService();
