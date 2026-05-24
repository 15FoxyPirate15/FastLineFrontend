import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import toast from 'react-hot-toast';

// ⚠️ ЗАМІНІТЬ ЦІ ДАНІ НА ВАШІ З FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyDSWrF0-tkzICXxUjyVDSXEXsi_C13j2J4",
  authDomain: "fastline-bd2.firebaseapp.com",
  projectId: "fastline-bd2",
  storageBucket: "fastline-bd2.firebasestorage.app",
  messagingSenderId: "450991289352",
  appId: "1:450991289352:web:87a511ddac68baea724dbd"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Функція для отримання токена та відправки на бекенд
export const setupNotifications = async () => {
  try {
    let swRegistration = null;
    if ('serviceWorker' in navigator) {
      const swUrl = import.meta.env.BASE_URL + 'firebase-messaging-sw.js';
      swRegistration = await navigator.serviceWorker.register(swUrl);
      
      // 🔥 ДОДАНО: Чекаємо, поки Service Worker повністю активується
      await navigator.serviceWorker.ready; 
      
      console.log('✅ SW registration successful');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permission for notifications denied');
      return;
    }

    const token = await getToken(messaging, { 
      vapidKey: 'BB5IPP5djMvecD3Uo-VEXJQ4mbaQLCL9JZ9gb418hyUPJnAHH-D7toubItUHnoRHfUzqoIEPibuZHL6zUcm-uiQ', // Переконайтеся, що тут правильний ключ
      serviceWorkerRegistration: swRegistration
    });

    // ✅ ДОДАТИ ЦЮ ПЕРЕВІРКУ:
    if (!token || typeof token !== 'string') {
        console.error('❌ FCM Token is invalid or undefined');
        return;
    }

    if (token) {
      const response = await fetch('https://backendfastline.onrender.com/notifications/fcm-token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        console.log('✅ FCM Token sent to backend');
      } else {
        console.error('❌ Failed to send FCM Token');
      }
    }
  } catch (error) {
    // 🔥 ДОДАНО: Детальний вивід помилки для діагностики
    console.error('❌ Точна помилка отримання токена:', error);
    toast.error("Could not setup push notifications");
  }
};