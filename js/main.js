import { auth, provider, signInWithPopup, signOut } from '../firebase-config.js';

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

function signOutUser() {
    signOut(auth).then(() => {
        localStorage.removeItem('id_token');
        localStorage.removeItem('user_name');
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error during sign-out:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        const userName = localStorage.getItem('user_name');
        userNameElement.textContent = userName ? userName : 'Usuario';
    }
});

function createPrescription() {
    // Lógica para crear una receta
}

function viewPrescriptions() {
    // Lógica para ver las recetas
}

function editPrescription() {
    // Lógica para editar una receta
}

function deletePrescription() {
    // Lógica para eliminar una receta
}

// Export signOutUser for use in other files
export { signOutUser };
