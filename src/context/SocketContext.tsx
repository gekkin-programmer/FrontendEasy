'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getCookie } from 'cookies-next';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, workspaceId }: { children: React.ReactNode, workspaceId?: string }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = getCookie('accessToken');
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-eazypost.mbokofit.com';
    const socketUrl = API_URL.replace('/api', '') + '/events';

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('📡 [WS] Connected to Server');
      setIsConnected(true);
      setSocket(newSocket);
      if (workspaceId) {
        newSocket.emit('join_workspace', workspaceId);
      }
    });

    newSocket.on('connect_error', (err) => {
      const msg = err.message?.toLowerCase() ?? '';
      if (msg.includes('jwt') || msg.includes('expired') || msg.includes('unauthorized')) {
        newSocket.disconnect();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    });

    newSocket.on('disconnect', () => {
      console.log('📡 [WS] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('joined', (data) => {
        console.log('📡 [WS] Joined Room:', data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [workspaceId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
