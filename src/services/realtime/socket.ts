import { io, Socket } from 'socket.io-client';
import { ConnectionStatus, VeltrexRealtimeEvent } from './realtimeEvents';

const SOCKET_SERVER_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

type EventListener = (event: VeltrexRealtimeEvent) => void;
type StatusListener = (status: ConnectionStatus) => void;

export class RealtimeSocketService {
  private socket: Socket | null = null;
  private status: ConnectionStatus = 'OFFLINE';
  private eventListeners: Set<EventListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private subscribedLocations: Set<string> = new Set();
  private isDashboardSubscribed = false;

  public connect(): void {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.setStatus('CONNECTING');

    this.socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('[RealtimeSocket] Connected to Socket.IO backend.');
      this.setStatus('LIVE');

      // Resubscribe to active rooms upon reconnection
      if (this.isDashboardSubscribed) {
        this.socket?.emit('subscribe:dashboard');
      }
      for (const locId of this.subscribedLocations) {
        this.socket?.emit('subscribe:location', { locationId: locId });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[RealtimeSocket] Disconnected:', reason);
      this.setStatus(reason === 'io client disconnect' ? 'OFFLINE' : 'RECONNECTING');
    });

    this.socket.on('connect_error', (error) => {
      console.warn('[RealtimeSocket] Connection error:', error.message);
      this.setStatus('RECONNECTING');
    });

    // Main event dispatcher
    this.socket.on('event', (eventPayload: VeltrexRealtimeEvent) => {
      this.notifyEventListeners(eventPayload);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.setStatus('OFFLINE');
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public subscribeToDashboard(): void {
    this.isDashboardSubscribed = true;
    if (this.socket && this.socket.connected) {
      this.socket.emit('subscribe:dashboard');
    }
  }

  public subscribeToLocation(locationId: string): void {
    if (!locationId) return;
    this.subscribedLocations.add(locationId);
    if (this.socket && this.socket.connected) {
      this.socket.emit('subscribe:location', { locationId });
    }
  }

  public unsubscribeFromLocation(locationId: string): void {
    this.subscribedLocations.delete(locationId);
    if (this.socket && this.socket.connected) {
      this.socket.emit('unsubscribe:location', { locationId });
    }
  }

  public onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  public subscribe(eventType: string, listener: (data: any) => void): () => void {
    return this.onEvent((eventPayload: VeltrexRealtimeEvent) => {
      if (eventPayload.eventType === eventType || (eventPayload as any).type === eventType) {
        listener(eventPayload.data !== undefined ? eventPayload.data : eventPayload);
      }
    });
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
    for (const listener of this.statusListeners) {
      listener(newStatus);
    }
  }

  private notifyEventListeners(eventPayload: VeltrexRealtimeEvent): void {
    for (const listener of this.eventListeners) {
      listener(eventPayload);
    }
  }
}

export const realtimeSocket = new RealtimeSocketService();
