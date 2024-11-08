import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBMirDQyZzBCIA3ThVmrjHLAYK-gWQZ200",
  authDomain: "nwitter-reloaded-f8e63.firebaseapp.com",
  projectId: "nwitter-reloaded-f8e63",
  storageBucket: "nwitter-reloaded-f8e63.appspot.com",
  messagingSenderId: "5826132992",
  appId: "1:5826132992:web:f569b4e51193d1936c2ce5",
  measurementId: "G-RJ020W0LVM",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
