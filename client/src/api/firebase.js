// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

console.log(import.meta.env.apiKey)
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.apiKey,
  authDomain: "coffeebun-inventory.firebaseapp.com",
  databaseURL: "https://coffeebun-inventory-default-rtdb.firebaseio.com",
  projectId: "coffeebun-inventory",
  storageBucket: "coffeebun-inventory.appspot.com",
  messagingSenderId: "416482464501",
  appId: import.meta.env.appId,
  measurementId: "G-DDEWG7HW82"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}