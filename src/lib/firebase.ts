import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

let dbInstance;
try {
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  dbInstance = getFirestore(app, dbId || undefined);
} catch (e) {
  console.warn("Failed to initialize Firestore with specific ID, falling back to default", e);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);
