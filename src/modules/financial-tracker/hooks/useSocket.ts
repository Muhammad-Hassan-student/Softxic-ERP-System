'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  joinRoom: (module: string, entity: string) => void;
  leaveRoom: (module: string, entity: string) => void;
  emit: (event: string, data: any) => void;
}

/**
 * Hook for WebSocket connections with automatic room management
 * @param module - 're' | 'expense'
 * @param entity - Entity name
 */
export function useSocket(
  module?: string,
  entity?: string
): UseSocketReturn {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  useEffect(() => {
    if (!user?.id) return;

    const token = document.cookie.split('token=')[1]?.split(';')[0];
    if (!token) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || '', {
      path: '/api/financial-tracker/socket',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;

      // Auto-join room if module and entity provided
      if (module && entity) {
        socketInstance.emit('joinRoom', { module, entity });
      }
    });

    socketInstance.on('disconnect', (reason:any) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, don't reconnect
        socketInstance.close();
      }
    });

    socketInstance.on('connect_error', (err:any) => {
      console.error('Socket connection error:', err);
      setError(err.message);
      setIsConnected(false);
      
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Lost connection to server. Please refresh the page.');
      }
    });

    socketInstance.on('error', (err:any) => {
      console.error('Socket error:', err);
      setError(err.message);
      toast.error(err.message);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (module && entity && socketInstance.connected) {
        socketInstance.emit('leaveRoom', { module, entity });
      }
      socketInstance.disconnect();
      socketInstance.close();
    };
  }, [user?.id, module, entity]);

  // Join room function
  const joinRoom = useCallback((roomModule: string, roomEntity: string) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('joinRoom', { module: roomModule, entity: roomEntity });
  }, [socket, isConnected]);

  // Leave room function
  const leaveRoom = useCallback((roomModule: string, roomEntity: string) => {
    if (!socket || !isConnected) return;
    socket.emit('leaveRoom', { module: roomModule, entity: roomEntity });
  }, [socket, isConnected]);

  // Emit event function
  const emit = useCallback((event: string, data: any) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }
    socket.emit(event, data);
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    error,
    joinRoom,
    leaveRoom,
    emit
  };
}