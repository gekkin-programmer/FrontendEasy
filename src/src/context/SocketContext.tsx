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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://easypostv2.onrender.com';
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
