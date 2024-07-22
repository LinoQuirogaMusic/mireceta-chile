import { auth, provider, firestore } from './firebase-config.js';
import { signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getDocs, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

document.getElementById('google-login').addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            localStorage.setItem('user_name', user.displayName);
            localStorage.setItem('id_token', user.accessToken);
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            console.error('Error during sign-in:', error);
        });
});