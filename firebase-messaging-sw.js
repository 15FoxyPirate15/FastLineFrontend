importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDSWrF0-tkzICXxUjyVDSXEXsi_C13j2J4",
  authDomain: "fastline-bd2.firebaseapp.com",
  projectId: "fastline-bd2",
  storageBucket: "fastline-bd2.firebasestorage.app",
  messagingSenderId: "450991289352",
  appId: "1:450991289352:web:87a511ddac68baea724dbd"
});

const messaging = firebase.messaging();

// Обробка повідомлень, коли додаток у фоні
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // Ваш шлях до іконки
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});