import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (!socket && token) {
    socket = io('https://backendfastline.onrender.com', {
      auth: { token: token },
      transports: ['websocket']
    });

    socket.on('connect', () => console.log('🟢 Сокет успішно підключено!'));
    socket.on('disconnect', () => console.log('🔴 Сокет відключено!'));
  }
  return socket;
};

export const getSocket = () => socket;