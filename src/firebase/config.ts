import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Support both environment variables (VITE_FIREBASE_*) and firebase-applet-config.json
const env = (import.meta as any).env || {};

const apiKey = (env.VITE_FIREBASE_API_KEY as string) || firebaseConfigJson.apiKey;
const authDomain = (env.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfigJson.authDomain;
const projectId = (env.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfigJson.projectId;
const storageBucket = (env.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfigJson.storageBucket;
const messagingSenderId = (env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfigJson.messagingSenderId;
const appId = (env.VITE_FIREBASE_APP_ID as string) || firebaseConfigJson.appId;

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

export const firebaseProjectId = projectId;
export const firebaseAuthDomain = authDomain;

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Smart Firestore Database ID selection:
// 1. If explicit custom database ID is in env, use it.
// 2. If running on AI Studio project ('straight-effect-m4r4b'), use the provisioned named database.
// 3. For any user-connected Firebase project, default to standard '(default)' database.
function getFirestoreInstance() {
  const envDatabaseId = env.VITE_FIREBASE_DATABASE_ID as string | undefined;
  if (envDatabaseId && envDatabaseId !== '(default)') {
    return getFirestore(app, envDatabaseId);
  }

  // If on the AI Studio project, use the applet database
  if (projectId === 'straight-effect-m4r4b' && firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)') {
    try {
      return getFirestore(app, firebaseConfigJson.firestoreDatabaseId);
    } catch (err) {
      console.warn('Could not initialize named database, falling back to default:', err);
      return getFirestore(app);
    }
  }

  // Standard user Firebase projects use (default)
  return getFirestore(app);
}

export const db = getFirestoreInstance();

// Initialize Storage
export const storage = getStorage(app);

// Verify connection to Firestore on boot with graceful diagnostics
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'websiteSettings', 'main'));
    console.log(`[Firebase] Connected to project: ${projectId}`);
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or database is unreachable.');
    } else if (error?.code === 'not-found' || error?.message?.includes('does not exist')) {
      console.error('[Firebase] Database not found. Ensure Firestore Database is created in Firebase Console.');
    }
  }
}
testConnection();

