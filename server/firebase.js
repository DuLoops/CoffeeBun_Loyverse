import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvDhZMli4KcUFefEE9e7jTDPtr27o0p30",
  authDomain: "coffeebun-inventory.firebaseapp.com",
  databaseURL: "https://coffeebun-inventory-default-rtdb.firebaseio.com",
  projectId: "coffeebun-inventory",
  storageBucket: "coffeebun-inventory.appspot.com",
  messagingSenderId: "416482464501",
  appId: "1:416482464501:web:643e13913259c3c8dd2bbc",
  measurementId: "G-DDEWG7HW82",
  databaseURL: "https://coffeebun-inventory-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

export {app, db}