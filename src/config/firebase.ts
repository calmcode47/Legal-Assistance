/**
 * JurisAccess AI - Firebase Admin SDK Initialization
 */

import * as admin from 'firebase-admin';
import { env } from './env';

let isFirebaseInitialized = false;

export function getFirebaseAdmin(): typeof admin {
  if (!isFirebaseInitialized && admin.apps.length === 0) {
    try {
      admin.initializeApp({
        projectId: env.FIREBASE_PROJECT_ID,
      });
      isFirebaseInitialized = true;
    } catch (error) {
      console.warn('Firebase Admin initialization skipped or running in offline mode:', error);
    }
  }
  return admin;
}

export const db = admin.apps.length > 0 ? admin.firestore() : null;
