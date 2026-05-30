import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const joinDashboard = (userId) => {
  const s = connectSocket();
  s.emit('join-dashboard', userId);
};

export const joinAdmin = () => {
  const s = connectSocket();
  s.emit('join-admin');
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
