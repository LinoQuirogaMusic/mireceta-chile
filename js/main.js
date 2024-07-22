import { auth, provider, firestore } from './firebase-config.js';
import { signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getDocs, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const googleLoginButton = document.getElementById('google-login');
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', () => {
            signInWithPopup(auth, provider)
                .then((result) => {
                    const user = result.user;
                    localStorage.setItem('user_name', user.displayName);
                    localStorage.setItem('user_id', user.uid);  // Almacenamos el user_id también
                    localStorage.setItem('id_token', user.accessToken);
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    console.error('Error during sign-in:', error);
                });
        });
    }
});