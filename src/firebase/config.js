import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== "your-api-key"
);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    try {
      db = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID || "default");
    } catch (e) {
      db = getFirestore(app);
    }
    storage = getStorage(app);
    console.info("FuelRescue: Connected to Cloud Firestore & Firebase Auth successfully.");
  } catch (error) {
    console.warn("FuelRescue: Firebase init failed, falling back to prototype simulation mode.", error);
  }
} else {
  console.info("FuelRescue: Running in Academic Prototype / Simulation mode (Local Store active). Connect Firebase credentials in .env for production syncing.");
}

export { app, auth, db, storage };
