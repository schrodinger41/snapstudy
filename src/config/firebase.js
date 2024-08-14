import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCu1UPB4CbTA4dwHnZDf8D5dfXrCTshV3U",
  authDomain: "snapstudy-85185.firebaseapp.com",
  projectId: "snapstudy-85185",
  storageBucket: "snapstudy-85185.appspot.com",
  messagingSenderId: "962524582803",
  appId: "1:962524582803:web:44a054b55c55a03a80ce66",
  measurementId: "G-ELT7E1X9TF",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
