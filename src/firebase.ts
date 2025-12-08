// src/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8hpuzWwf7Zf8xIjmKUnx94TbA7e6iaUk",
  authDomain: "role-call-ai.firebaseapp.com",
  projectId: "role-call-ai",
  storageBucket: "role-call-ai.appspot.com",
  messagingSenderId: "657086921324",
  appId: "1:657086921324:web:2f26835f2f3323aabd7649",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
