// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {

  apiKey: "AIzaSyB8qpvAa9ynUeTPiNiu9uHYir7xJLCQM9M",
  authDomain: "mi-receta-400fc.firebaseapp.com",
  databaseURL: "https://mi-receta-400fc-default-rtdb.firebaseio.com",
  projectId: "mi-receta-400fc",
  storageBucket: "mi-receta-400fc.appspot.com",
  messagingSenderId: "390457560872",
  appId: "1:390457560872:web:4fbe98791f13245dac8a1d",
  measurementId: "G-N7J49TECBZ"

};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// Export auth and provider for use in other files
export { auth, provider, signInWithPopup, signOut };
