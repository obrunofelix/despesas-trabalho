// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3Hmfx2UwwXkBK32DGBEdJ0gRHnJLVTJM",
  authDomain: "projeto-despesas-47acb.firebaseapp.com",
  projectId: "projeto-despesas-47acb",
  storageBucket: "projeto-despesas-47acb.firebasestorage.app",
  messagingSenderId: "1065976440583",
  appId: "1:1065976440583:web:14b570de48152fba1587a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 