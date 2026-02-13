import { Server as SocketServer } from "socket.io"
import { Server as HttpServer } from "http"
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { verifyToken } from "@/lib/auth/jwt";
import PermissionService from "../../services/permission-service";

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    path: '/api/financial-tracker/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      credentials: true
    }
  });

  // Redis adapter for horizontal scaling
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  
  io.adapter(createAdapter(pubClient, subClient));

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      socket.data.user = decoded;
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.data.userId} connected`);

    // Join room: module:entity
    socket.on('joinRoom', async ({ module, entity }) => {
      try {
        // Permission check
        const hasAccess = await PermissionService.hasAccess(
          socket.data.userId,
          module,
          entity
        );

        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        const room = `${module}:${entity}`;
        socket.join(room);
        socket.emit('roomJoined', { room });
        console.log(`👤 User ${socket.data.userId} joined ${room}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('leaveRoom', ({ module, entity }) => {
      const room = `${module}:${entity}`;
      socket.leave(room);
      socket.emit('roomLeft', { room });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.data.userId} disconnected`);
    });
  });

  return io;
};

// Global IO instance
export let io: SocketServer;

export const setIO = (socketIO: SocketServer) => {
  io = socketIO;
};
