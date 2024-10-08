import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCy2ANnsX3HybYUCY5VOMKolLc0kX_IxMU",
  authDomain: "snapstudy-4124d.firebaseapp.com",
  projectId: "snapstudy-4124d",
  storageBucket: "snapstudy-4124d.appspot.com",
  messagingSenderId: "33698395499",
  appId: "1:33698395499:web:736992c7a4e56c059f482e",
  measurementId: "G-CM4PDB33KQ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
