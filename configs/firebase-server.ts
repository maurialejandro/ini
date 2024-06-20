import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
const credentials = require("./serviceAccount.json");

const app = getApps().length === 0 ? initializeApp({credential: cert(credentials) }) : getApps()[0];

const auth = getAuth(app!);
const firestore = getFirestore(app!);
export { firestore, auth };