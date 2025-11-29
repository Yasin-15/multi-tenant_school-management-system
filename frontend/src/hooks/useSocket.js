import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useSocket = (user) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    // Join tenant and user rooms
    if (user.tenant) {
      socketRef.current.emit('join-tenant', user.tenant);
    }
    if (user._id) {
      socketRef.current.emit('join-user', user._id);
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  return socketRef.current;
};
