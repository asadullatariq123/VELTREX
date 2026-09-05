import { Alert } from '@prisma/client';
import { realtimePublisher } from '../../realtime/realtimePublisher';
import { VeltrexRealtimeEventType } from '../../realtime/realtimeEvents';

export type AlertEventType = 'ALERT_CREATED' | 'ALERT_UPDATED' | 'ALERT_ACKNOWLEDGED' | 'ALERT_RESOLVED';

export interface AlertEventPayload {
  event: AlertEventType;
  alert: Alert;
  timestamp: string;
}

export interface AlertEventPublisher {
  publish(event: AlertEventType, alert: Alert): Promise<void>;
}

export class DemoAlertEventPublisher implements AlertEventPublisher {
  public async publish(event: AlertEventType, alert: Alert): Promise<void> {
    const payload: AlertEventPayload = {
      event,
      alert,
      timestamp: new Date().toISOString()
    };
    console.log(`[AlertEventPublisher] Event: ${payload.event} | AlertCode: ${payload.alert.alertCode} | Level: ${payload.alert.alertLevel}`);

    let realtimeType = VeltrexRealtimeEventType.ALERT_CREATED;
    if (event === 'ALERT_UPDATED') realtimeType = VeltrexRealtimeEventType.ALERT_UPDATED;
    if (event === 'ALERT_ACKNOWLEDGED') realtimeType = VeltrexRealtimeEventType.ALERT_ACKNOWLEDGED;
    if (event === 'ALERT_RESOLVED') realtimeType = VeltrexRealtimeEventType.ALERT_RESOLVED;

    realtimePublisher.publish(
      realtimeType,
      {
        id: alert.id,
        alertCode: alert.alertCode,
        alertLevel: alert.alertLevel,
        priority: alert.priority,
        locationId: alert.locationId || undefined,
        status: alert.status,
        riskScore: alert.riskScore,
        predictionProbability: alert.predictionProbability,
        title: alert.title,
        recommendedAction: alert.recommendedAction
      },
      {
        locationId: alert.locationId || undefined,
        source: alert.source === 'AUTHORITY' ? 'AUTHORITY' : alert.source === 'DEMO' ? 'DEMO' : 'SYSTEM'
      }
    );
  }
}

export const alertEventPublisher = new DemoAlertEventPublisher();
