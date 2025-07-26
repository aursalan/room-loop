// frontend/src/context/SocketContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_BASE_URL); // Connect to your backend's Socket.IO server

    newSocket.on('connect', () => {
      console.log('Socket.IO Connected (from SocketContext)! Client ID:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO Disconnected (from SocketContext)!');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket.IO Connection Error (from SocketContext):', err.message);
    });

    setSocket(newSocket); // Store the socket instance in state

    // Clean up on unmount
    return () => {
      if (newSocket.connected) {
        newSocket.disconnect();
        console.log('Socket.IO client (from SocketContext) cleaned up.');
      }
    };
  }, []); // Empty dependency array: runs once on mount

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};