import { Server as SocketIOServer } from 'socket.io';
import { randomUUID } from 'crypto';
import { VeltrexRealtimeEventType } from './realtimeEvents';
import { VeltrexRealtimeEvent } from './realtimeTypes';
import { RealtimeRooms } from './realtimeRooms';

export class RealtimePublisher {
  private io: SocketIOServer | null = null;
  private recentEventIds: Set<string> = new Set();
  private maxCacheSize = 500;
  private sequenceCounters: Map<string, number> = new Map();

  public setSocketServer(io: SocketIOServer) {
    this.io = io;
    console.log('[REALTIME] Socket.IO server attached to RealtimePublisher.');
  }

  public publish<T>(
    eventType: VeltrexRealtimeEventType,
    data: T,
    options?: {
      locationId?: string;
      source?: 'SYSTEM' | 'FIELD' | 'AUTHORITY' | 'DEMO';
      targetRooms?: string[];
    }
  ): VeltrexRealtimeEvent<T> {
    const eventId = randomUUID();
    const timestamp = new Date().toISOString();
    const locationId = options?.locationId;
    const source = options?.source || 'SYSTEM';

    // Sequence tracking per location stream
    let sequence: number | undefined = undefined;
    if (locationId) {
      const currentSeq = (this.sequenceCounters.get(locationId) || 0) + 1;
      this.sequenceCounters.set(locationId, currentSeq);
      sequence = currentSeq;
    }

    const eventPayload: VeltrexRealtimeEvent<T> = {
      eventId,
      eventType,
      timestamp,
      locationId,
      sequence,
      source,
      data
    };

    // Bounded event ID deduplication cache
    this.trackEventId(eventId);

    if (this.io) {
      const rooms: string[] = options?.targetRooms || [];

      // Determine default rooms based on event context
      if (rooms.length === 0) {
        rooms.push(RealtimeRooms.GLOBAL);
        rooms.push(RealtimeRooms.DASHBOARD);
        if (locationId) {
          rooms.push(RealtimeRooms.location(locationId));
        }
      }

      // Emit to targeted rooms
      for (const room of rooms) {
        this.io.to(room).emit('event', eventPayload);
        this.io.to(room).emit(eventType, eventPayload);
      }

      console.log(`[REALTIME] Published ${eventType} (ID: ${eventId}) to rooms: [${rooms.join(', ')}]`);
    } else {
      console.log(`[REALTIME] (Server not attached) Event ${eventType} created (ID: ${eventId})`);
    }

    return eventPayload;
  }

  public isDuplicate(eventId: string): boolean {
    return this.recentEventIds.has(eventId);
  }

  private trackEventId(eventId: string) {
    if (this.recentEventIds.size >= this.maxCacheSize) {
      const firstKey = this.recentEventIds.values().next().value;
      if (firstKey) this.recentEventIds.delete(firstKey);
    }
    this.recentEventIds.add(eventId);
  }
}

export const realtimePublisher = new RealtimePublisher();
