// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDcuVZNt1CvmvdMj0NcS3VVuytsd0LRax8",
  authDomain: "h4g-tft.firebaseapp.com",
  projectId: "h4g-tft",
  storageBucket: "h4g-tft.firebasestorage.app",
  messagingSenderId: "1055248379817",
  appId: "1:1055248379817:web:5eaf17a4afb57ff5be5eb8",
  measurementId: "G-EJFP7V05D8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };
export { analytics };