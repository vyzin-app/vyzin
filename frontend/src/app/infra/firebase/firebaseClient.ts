import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

/**
 * Single Firebase JS SDK initialization for the app. Configuration comes from
 * Vite env vars (see frontend/.env.example). Only Authentication is used on the
 * client — all data access goes through the backend (Admin SDK).
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth: Auth = getAuth(firebaseApp)
