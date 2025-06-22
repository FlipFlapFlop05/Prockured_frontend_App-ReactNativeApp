// firebase.js

// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app'; // Use 'compat' for older Firebase versions or if you're mixing v8 and v9
import 'firebase/compat/database'; // Import Realtime Database module

const firebaseConfig = {
  apiKey: "AIzaSyA9Geo9hoh7sBTs-FtpyEIydA86RMApsKg",
  authDomain: "prockured-1ec23.firebaseapp.com",
  databaseURL: "https://prockured-1ec23-default-rtdb.firebaseio.com",
  projectId: "prockured-1ec23",
  storageBucket: "prockured-1ec23.firebasestorage.app",
  messagingSenderId: "647021741855",
  appId: "1:647021741855:web:9ce578c337fdd2dd34122a",
  measurementId: "G-JK1L7Y52QK"
};

// Initialize Firebase
// Check if a Firebase app has already been initialized to avoid errors
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get a reference to the Realtime Database service
const database = firebase.database();

// Export the database instance for use in other files
export { database,firebase };
