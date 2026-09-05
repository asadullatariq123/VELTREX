import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ClientSubscriptionEvent } from './realtimeEvents';
import { RealtimeRooms } from './realtimeRooms';
import { RealtimeAuth } from './realtimeAuth';
import { realtimePublisher } from './realtimePublisher';

export class RealtimeServer {
  private io: SocketIOServer | null = null;

  public initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 20000,
      pingInterval: 25000
    });

    realtimePublisher.setSocketServer(this.io);

    this.io.on('connection', (socket: Socket) => {
      console.log(`[REALTIME] Client connected (Socket ID: ${socket.id})`);

      // Automatically join global room
      socket.join(RealtimeRooms.GLOBAL);

      // Subscribe to Dashboard room
      socket.on(ClientSubscriptionEvent.SUBSCRIBE_DASHBOARD, () => {
        socket.join(RealtimeRooms.DASHBOARD);
        console.log(`[REALTIME] Client ${socket.id} subscribed to DASHBOARD room.`);
        socket.emit('subscribed', { room: RealtimeRooms.DASHBOARD });
      });

      // Unsubscribe from Dashboard room
      socket.on(ClientSubscriptionEvent.UNSUBSCRIBE_DASHBOARD, () => {
        socket.leave(RealtimeRooms.DASHBOARD);
        console.log(`[REALTIME] Client ${socket.id} unsubscribed from DASHBOARD room.`);
      });

      // Subscribe to Location room
      socket.on(ClientSubscriptionEvent.SUBSCRIBE_LOCATION, (payload: { locationId: string }) => {
        const { locationId } = payload || {};
        if (RealtimeAuth.validateLocationSubscription(locationId)) {
          const room = RealtimeRooms.location(locationId);
          socket.join(room);
          console.log(`[REALTIME] Client ${socket.id} subscribed to ${room}`);
          socket.emit('subscribed', { room, locationId });
        } else {
          socket.emit('error', { message: 'Invalid locationId for subscription' });
        }
      });

      // Unsubscribe from Location room
      socket.on(ClientSubscriptionEvent.UNSUBSCRIBE_LOCATION, (payload: { locationId: string }) => {
        const { locationId } = payload || {};
        if (locationId) {
          const room = RealtimeRooms.location(locationId);
          socket.leave(room);
          console.log(`[REALTIME] Client ${socket.id} unsubscribed from ${room}`);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log(`[REALTIME] Client disconnected (Socket ID: ${socket.id}, Reason: ${reason})`);
      });
    });

    return this.io;
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const realtimeServer = new RealtimeServer();
