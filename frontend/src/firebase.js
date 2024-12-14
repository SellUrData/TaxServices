import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDQeWfj3p0DYX1VdHR4925TQqVEk_Us4ck",
  authDomain: "taxservices-72ea6.firebaseapp.com",
  projectId: "taxservices-72ea6",
  storageBucket: "taxservices-72ea6.appspot.com",
  messagingSenderId: "679864251878",
  appId: "1:679864251878:web:c1fcceb0c86ac589451227",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Configure Storage for local development
if (window.location.hostname === 'localhost') {
  // Add custom headers to storage requests
  const originalUploadBytes = storage.uploadBytes;
  storage.uploadBytes = async (ref, data, metadata = {}) => {
    const newMetadata = {
      ...metadata,
      customMetadata: {
        ...metadata.customMetadata,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
    return originalUploadBytes(ref, data, newMetadata);
  };
}

export { storage, ref };
export default app;
