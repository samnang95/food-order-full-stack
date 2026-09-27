export const FirebaseConfig = Object.freeze({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDJ-OpLa_dWaAY0fS6DZL_yT_o5TWyH0Ts',
  authDomain: 'food-order-42e98.firebaseapp.com',
  projectId: 'food-order-42e98',
  storageBucket: 'food-order-42e98.firebasestorage.app',
  messagingSenderId: '292432059407',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:292432059407:web:food_order_web',
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined,
});
