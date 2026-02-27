import { io } from 'socket.io-client';

export const createSocket = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn('❌ No token, socket not created');
    return null;
  }

  return io('https://backendfastline.onrender.com', {
    auth: {
      token,
    },
    transports: ['websocket'],
  });
};
