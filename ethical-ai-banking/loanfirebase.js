import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQv_UgNXkYeN4nUdts5uTA8zUQKI1M3W8",
  authDomain: "loanapplication-860a9.firebaseapp.com",
  projectId: "loanapplication-860a9",
  storageBucket: "loanapplication-860a9.appspot.com", // Fixed incorrect URL
  messagingSenderId: "217444381156",
  appId: "1:217444381156:web:78b03bbf0bf82c09a397f1",
  measurementId: "G-GBBRBDVZ5M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
