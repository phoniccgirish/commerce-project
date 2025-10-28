import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Paste your specific Firebase configuration object here
const firebaseConfig = {
  apiKey: "AIzaSyBl0fh1vxQdp67yFXFqEkVk2mh6PIAOzzA", // Your apiKey
  authDomain: "login-88322.firebaseapp.com", // Your authDomain
  projectId: "login-88322", // Your projectId
  storageBucket: "login-88322.appspot.com", // Your storageBucket (Ensure correct domain, often .appspot.com)
  messagingSenderId: "366442968541", // Your messagingSenderId
  appId: "1:366442968541:web:7dc8255f6b07f6e2ed7234", // Your appId
  measurementId: "G-M60HR995HC", // Your measurementId (Optional, for Analytics)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase App Initialized (Client-side)"); // Confirmation log

// Get Firebase Auth instance and export it
export const auth = getAuth(app);

// You can also export the app instance if needed elsewhere
// export default app;
