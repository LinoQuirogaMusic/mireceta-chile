import { auth, firestore } from './firebase-config.js';
import { getDocs, collection } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

window.addEventListener('load', async () => {
    const userNameSpan = document.getElementById('user-name');
    const userName = localStorage.getItem('user_name');
    
    if (userName) {
        userNameSpan.textContent = userName;

        // Cargar recetas
        await loadPrescriptions();
    } else {
        // Redirigir a la página de login si no hay usuario
        window.location.href = 'index.html';
    }
});

async function loadPrescriptions() {
    try {
        const querySnapshot = await getDocs(collection(firestore, 'prescriptions'));
        const prescriptionListDiv = document.getElementById('prescription-list');
        prescriptionListDiv.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const prescription = doc.data();
            const prescriptionElement = document.createElement('div');
            prescriptionElement.className = 'prescription-item';
            prescriptionElement.innerHTML = `
                <p>Paciente: ${prescription.patientName}</p>
                <p>Medicamento: ${prescription.medicationName}</p>
                <p>Fecha: ${prescription.date}</p>
                <button onclick="editPrescription('${doc.id}')">Editar receta</button>
                <button onclick="deletePrescription('${doc.id}')">Eliminar receta</button>
            `;
            prescriptionListDiv.appendChild(prescriptionElement);
        });
    } catch (error) {
        console.error('Error loading prescriptions:', error);
    }
}

function signOutUser() {
    auth.signOut().then(() => {
        localStorage.removeItem('user_name');
        localStorage.removeItem('id_token');
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error during sign-out:', error);
    });
}

function createPrescription() {
    // Implementa la lógica para crear una receta
    console.log('Crear receta');
}

function editPrescription(id) {
    // Implementa la lógica para editar una receta
    console.log('Editar receta:', id);
}

function deletePrescription(id) {
    // Implementa la lógica para eliminar una receta
    console.log('Eliminar receta:', id);
}
