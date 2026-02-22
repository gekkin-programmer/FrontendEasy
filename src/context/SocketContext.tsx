'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getCookie('accessToken');
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eazypostv2.onrender.com';
    const socketUrl = API_URL.replace('/api', '') + '/events';

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      if (workspaceId) {
        socket.emit('join_workspace', workspaceId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('joined', () => {});

    socketRef.current = socket;

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('joined');
      socket.disconnect();
    };
  }, [workspaceId]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
