// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_APP_API_KEY,
//   authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_APP_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_APP_APP_ID,
//   measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID
// };

const firebaseConfig = {
  apiKey: "AIzaSyBxYnQTRxOHBJHYRz02c86qAMaBrKAVErc",
  authDomain: "auth-4669c.firebaseapp.com",
  projectId: "auth-4669c",
  storageBucket: "auth-4669c.firebasestorage.app",
  messagingSenderId: "234471340192",
  appId: "1:234471340192:web:dd26e82ed7b71824c331c5",
  measurementId: "G-LK2F8592SM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export { app, auth };
// const analytics = getAnalytics(app);