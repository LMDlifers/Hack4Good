// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcuVZNt1CvmvdMj0NcS3VVuytsd0LRax8",
  authDomain: "h4g-tft.firebaseapp.com",
  databaseURL: "https://h4g-tft-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "h4g-tft",
  storageBucket: "h4g-tft.firebasestorage.app",
  messagingSenderId: "1055248379817",
  appId: "1:1055248379817:web:5eaf17a4afb57ff5be5eb8",
  measurementId: "G-EJFP7V05D8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Firebase authentication persistence set to session.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export { auth, storage };
export default app;
