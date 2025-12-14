// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
  measurementId: import.meta.env.VITE_measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics may not be available in all environments (SSR or missing window)
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export const auth = getAuth(app);

// Note: Cross-Origin-Opener-Policy warnings from Firebase Auth popups are expected
// in development. These warnings don't affect functionality and can be safely ignored.
// For production, consider using redirect flow instead of popup if COOP headers are set.

// Configure auth to work with Cross-Origin-Opener-Policy
auth.settings.appVerificationDisabledForTesting = false;
