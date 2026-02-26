import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDA6vfZ7-VPy5GmQ4YNGvakVm0MCT9qcs4",
  authDomain: "vittoria-store-a8431.firebaseapp.com",
  projectId: "vittoria-store-a8431",
  storageBucket: "vittoria-store-a8431.firebasestorage.app",
  messagingSenderId: "936530817894",
  appId: "1:936530817894:web:0a37d9d51b6679442a4ea7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);