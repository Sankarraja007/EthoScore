// Import Firebase SDK modules
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, collection, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration object (Use .env for security)
const firebaseConfig = {
  apiKey: "AIzaSyC1YuPy57pA9kP9TZPKCKPjhQ1_vZcU-jk", 
  authDomain: "login-8220c.firebaseapp.com",
  projectId: "login-8220c",
  storageBucket: "login-8220c.appspot.com",
  messagingSenderId: "4442277939",
  appId: "1:4442277939:web:88995ce03dbb39c822bb46",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable IndexedDB persistence
enableIndexedDbPersistence(db).catch((error) => {
  if (error.code === "failed-precondition") {
    console.warn("⚠️ Firestore persistence failed: Multiple tabs open.");
  } else if (error.code === "unimplemented") {
    console.warn("⚠️ Firestore persistence not supported in this browser.");
  }
});

// 🔹 Function to Add Loan Application to Firestore
const addLoanApplication = async (userId, loanData) => {
  try {
    const docRef = await addDoc(collection(db, "loanApplications"), {
      userId,
      ...loanData,
      createdAt: new Date(),
    });
    console.log("✅ Loan Application Submitted, ID:", docRef.id);
  } catch (error) {
    console.error("❌ Error submitting loan application:", error);
  }
};

// ✅ Export all Firebase services and helper functions
export { app, auth, db, storage, onAuthStateChanged, addLoanApplication };
