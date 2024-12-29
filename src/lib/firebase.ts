import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  limit,
  deleteDoc,
  where,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCuQxiBc8yc0zqkzTTG5ZV52PbIF5TDeKA",
  authDomain: "app-server-eb64d.firebaseapp.com",
  databaseURL: "https://app-server-eb64d-default-rtdb.firebaseio.com",
  projectId: "app-server-eb64d",
  storageBucket: "app-server-eb64d.appspot.com",
  messagingSenderId: "311789081160",
  appId: "1:311789081160:web:a615f64b226342f8c77e7d",
  measurementId: "G-941MTLETPW",
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

// Export initialized services
export { app, firestore, auth, storage };

// Export Firestore functions
export { collection, addDoc, getDocs, doc, updateDoc, setDoc, getDoc, query, orderBy, limit, deleteDoc, where, startAfter, serverTimestamp };

// For backwards compatibility, also export firestore as db
export const db = firestore;
