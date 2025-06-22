import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOzYN1fmrTrAmseH9lUxtpj2foThWLdnw",
  authDomain: "objetivos-779ed.firebaseapp.com",
  projectId: "objetivos-779ed",
  storageBucket: "objetivos-779ed.firebasestorage.app",
  messagingSenderId: "1056454066401",
  appId: "1:1056454066401:web:b934154a45443b033177a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);