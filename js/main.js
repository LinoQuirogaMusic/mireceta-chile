import { auth, provider, firestore } from './firebase-config.js';
import { signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getDocs, collection, addDoc, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const googleLoginButton = document.getElementById('google-login');
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', async () => {
            try {
                // Autenticación con Google
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                const userId = user.uid;

                // Obtener el documento del usuario desde Firestore
                const userRef = doc(firestore, 'users', userId);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const userRole = userData.role;

                    // Verificar el rol del usuario
                    if (userRole === 'doctor') {
                        localStorage.setItem('user_name', user.displayName);
                        localStorage.setItem('user_id', user.uid);  // Almacena el user_id también
                        localStorage.setItem('id_token', user.accessToken);
                        window.location.href = 'dashboard.html';
                    } else {
                        alert('No está autorizado para acceder a esta aplicación.');
                        // Opcional: cerrar sesión
                        await auth.signOut();
                    }
                } else {
                    alert('Usuario no encontrado en la base de datos.');
                    // Opcional: cerrar sesión
                    await auth.signOut();
                }
            } catch (error) {
                console.error('Error during sign-in:', error);
            }
        });
    }
});