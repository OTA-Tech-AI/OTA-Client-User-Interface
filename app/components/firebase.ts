import { initializeApp, getApps } from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBu_QBFvmZ6n2AYzIgBsqB7-942R6BjEmw",
  authDomain: "ota-user-system.firebaseapp.com",
  projectId: "ota-user-system",
  storageBucket: "ota-user-system.appspot.com",
  messagingSenderId: "1080297856968",
  appId: "1:1080297856968:web:ad1493d6755a03eb892afd",
};

export const initializeFirebase = () => {
  if (!getApps().length) {
    console.log("Initializing Firebase App...");
    initializeApp(firebaseConfig);
    console.log("Firebase App Initialization Done");
  } else {
    console.log("Firebase App exists. skip initialization.");
  }
};
