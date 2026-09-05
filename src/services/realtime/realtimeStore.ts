import { VeltrexRealtimeEvent, VeltrexRealtimeEventType } from './realtimeEvents';
import { realtimeSocket } from './socket';

export interface ActivityStreamItem {
  id: string;
  eventType: VeltrexRealtimeEventType;
  timestamp: string;
  locationId?: string;
  title: string;
  description: string;
  severity?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

type ActivityListener = (activities: ActivityStreamItem[]) => void;

class RealtimeStoreManager {
  private activities: ActivityStreamItem[] = [];
  private processedEventIds: Set<string> = new Set();
  private maxActivities = 50;
  private maxCacheSize = 200;
  private listeners: Set<ActivityListener> = new Set();

  constructor() {
    this.initDefaultActivities();
    realtimeSocket.onEvent((event) => this.handleIncomingEvent(event));
  }

  private initDefaultActivities() {
    this.activities = [
      {
        id: 'act-01',
        eventType: VeltrexRealtimeEventType.WEATHER_UPDATED,
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        locationId: 'loc-01',
        title: 'Weather Telemetry Updated',
        description: 'Rainfall 82mm / Soil Saturation 85%',
        severity: 'HIGH'
      },
      {
        id: 'act-02',
        eventType: VeltrexRealtimeEventType.PREDICTION_UPDATED,
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        locationId: 'loc-01',
        title: 'ML Risk Prediction Model Run',
        description: '24H Horizon Risk Likelihood: 82% (CRITICAL)',
        severity: 'CRITICAL'
      },
      {
        id: 'act-03',
        eventType: VeltrexRealtimeEventType.ALERT_CREATED,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        locationId: 'loc-01',
        title: 'Warning Alert Issued',
        description: 'P2 - Landslide Warning for Aizawl Corridor',
        severity: 'HIGH'
      }
    ];
  }

  private handleIncomingEvent(event: VeltrexRealtimeEvent) {
    if (!event || !event.eventId) return;

    // Deduplication check
    if (this.processedEventIds.has(event.eventId)) {
      return;
    }
    this.trackProcessedId(event.eventId);

    const item = this.formatActivityItem(event);
    if (item) {
      this.activities = [item, ...this.activities.slice(0, this.maxActivities - 1)];
      this.notifyListeners();
    }
  }

  private formatActivityItem(event: VeltrexRealtimeEvent): ActivityStreamItem | null {
    const timeStr = event.timestamp || new Date().toISOString();
    const data = event.data || {};

    switch (event.eventType) {
      case VeltrexRealtimeEventType.RISK_UPDATED:
        return {
          id: event.eventId,
          eventType: event.eventType,
          timestamp: timeStr,
          locationId: event.locationId,
          title: `Risk Score Updated: ${data.locationName || 'Location'}`,
          description: `Score changed from ${data.previousScore || 0} to ${data.currentScore || 0} (${data.currentLevel || 'UPDATED'})`,
          severity: data.currentLevel as any
        };

      case VeltrexRealtimeEventType.PREDICTION_UPDATED:
        return {
          id: event.eventId,
          eventType: event.eventType,
          timestamp: timeStr,
          locationId: event.locationId,
          title: `AI/ML Prediction: ${data.horizon || '24H'} Horizon`,
          description: `Model Likelihood: ${(data.probability * 100).toFixed(0)}% (Confidence: ${(data.confidence * 100).toFixed(0)}%)`,
          severity: data.riskLevel as any
        };

      case VeltrexRealtimeEventType.FIELD_REPORT_CREATED:
        return {
          id: event.eventId,
          eventType: event.eventType,
          timestamp: timeStr,
          locationId: event.locationId,
          title: `New Field Report Received`,
          description: `${data.reportType || 'Observation'} reported at [${data.latitude}, ${data.longitude}]`,
          severity: data.severity as any
        };

      case VeltrexRealtimeEventType.ALERT_CREATED:
      case VeltrexRealtimeEventType.ALERT_UPDATED:
        return {
          id: event.eventId,
          eventType: event.eventType,
          timestamp: timeStr,
          locationId: event.locationId,
          title: data.title || 'Early-Warning Alert Issued',
          description: data.recommendedAction || 'Action recommended.',
          severity: data.alertLevel === 'EMERGENCY' ? 'CRITICAL' : data.alertLevel === 'WARNING' ? 'HIGH' : 'MODERATE'
        };

      case VeltrexRealtimeEventType.ALERT_ACKNOWLEDGED:
        return {
          id: event.eventId,
          eventType: event.eventType,
          timestamp: timeStr,
          locationId: event.locationId,
          title: `Alert Acknowledged`,
          description: `Authority acknowledged alert ${data.alertCode || ''}`,
          severity: 'LOW'
        };

      case VeltrexRealtimeEventType.ALERT_RESOLVED:
        return {
          id: event.eventId,
          eventType: event.eventType,
          timestamp: timeStr,
          locationId: event.locationId,
          title: `Alert Resolved`,
          description: `Alert ${data.alertCode || ''} marked as resolved.`,
          severity: 'LOW'
        };

      case VeltrexRealtimeEventType.WEATHER_UPDATED:
        return {
          id: event.eventId,
          eventType: event.eventType,
          timestamp: timeStr,
          locationId: event.locationId,
          title: `Weather Reading Updated`,
          description: `Rainfall: ${data.rainfall24h}mm, Humidity: ${data.humidity}%`,
          severity: 'MODERATE'
        };

      case VeltrexRealtimeEventType.SATELLITE_UPDATED:
        return {
          id: event.eventId,
          eventType: event.eventType,
          timestamp: timeStr,
          locationId: event.locationId,
          title: `Satellite Earth Observation Refreshed`,
          description: `${data.observationType || 'SAR'} Ground displacement telemetry stored.`,
          severity: 'MODERATE'
        };

      default:
        return null;
    }
  }

  private trackProcessedId(id: string) {
    if (this.processedEventIds.size >= this.maxCacheSize) {
      const first = this.processedEventIds.values().next().value;
      if (first) this.processedEventIds.delete(first);
    }
    this.processedEventIds.add(id);
  }

  public getActivities(): ActivityStreamItem[] {
    return this.activities;
  }

  public onActivitiesChange(listener: ActivityListener): () => void {
    this.listeners.add(listener);
    listener(this.activities);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.activities);
    }
  }
}

export const realtimeStore = new RealtimeStoreManager();
