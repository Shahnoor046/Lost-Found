/**
 * Firebase Configuration and Initialization Module
 * Compatible with both file:// (direct double-click) and http:// (web server)
 */

// ==============================================================================
// YOUR FIREBASE CONFIGURATION
// Replace the placeholder values below with your Firebase project credentials.
// Get these from: Firebase Console -> Project Settings -> General -> SDK setup
// ==============================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/**
 * Checks if custom Firebase config credentials have been provided.
 */
function isFirebaseConfigured() {
  return (
    typeof firebase !== "undefined" &&
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
    firebaseConfig.apiKey.length > 5
  );
}

let db = null;
let storage = null;

if (isFirebaseConfigured()) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage();
  } catch (err) {
    console.warn("Firebase Initialization Warning:", err);
  }
}

// Attach to window object so app.js can access seamlessly without module CORS restriction
window.AppFirebase = {
  db,
  storage,
  isFirebaseConfigured,
  firebaseConfig
};
