import { auth, firestore } from './firebase-config.js';
import { getDocs, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { v4 as uuidv4 } from 'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/uuid.min.js';

// Mostrar el formulario de crear receta
function toggleCreatePrescriptionForm() {
    const form = document.getElementById('create-prescription-form');
    form.classList.toggle('hidden');
}

// Buscar pacientes y medicamentos
async function fetchSuggestions(input, collectionName, suggestionsListId) {
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    const suggestionsList = document.getElementById(suggestionsListId);
    suggestionsList.innerHTML = '';
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement('li');
        li.textContent = data.name; // Asegúrate de que el campo en Firestore sea 'name'
        li.onclick = () => {
            input.value = data.name;
            suggestionsList.innerHTML = '';
        };
        suggestionsList.appendChild(li);
    });
}

// Manejar el envío del formulario de receta
document.getElementById('prescription-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const patientName = document.getElementById('patient-name').value;
    const medicationName = document.getElementById('medication-name').value;
    const dosis = document.getElementById('dosis').value;
    const user = auth.currentUser;

    if (!user) {
        console.error('No user is signed in');
        return;
    }

    // Obtener el ID del paciente y el ID del médico
    const patientId = await getUserIdByName(patientName); // Implementa esta función para buscar el paciente
    const doctorId = user.uid;
    const doctorName = user.displayName;
    const date = new Date().toISOString(); // Fecha y hora actual

    if (patientId && medicationName && dosis) {
        try {
            await addDoc(collection(firestore, 'prescriptions'), {
                id: uuidv4(), // Genera un ID único
                patientId: patientId,
                patientName: patientName,
                patientDni: '', // Deberás implementar la lógica para obtener el DNI
                doctorId: doctorId,
                doctorName: doctorName,
                medicationName: medicationName,
                dosis: dosis,
                status: true,
                date: date
            });
            alert('Receta creada exitosamente');
            document.getElementById('create-prescription-form').classList.add('hidden');
            await loadPrescriptions(); // Recargar la lista de recetas
        } catch (error) {
            console.error('Error creating prescription:', error);
        }
    } else {
        alert('Por favor complete todos los campos.');
    }
});

// Cargar recetas
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

// Buscar el ID de usuario por nombre
async function getUserIdByName(name) {
    const querySnapshot = await getDocs(collection(firestore, 'users')); // Asume que tienes una colección de usuarios
    let userId = null;
    
    querySnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.name === name) { // Asegúrate de que el campo en Firestore sea 'name'
            userId = doc.id;
        }
    });
    
    return userId;
}

// Funciones de utilidad
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
    // Mostrar el formulario de creación de recetas
    toggleCreatePrescriptionForm();
}

function editPrescription(id) {
    // Implementa la lógica para editar una receta
    console.log('Editar receta:', id);
}

function deletePrescription(id) {
    // Implementa la lógica para eliminar una receta
    console.log('Eliminar receta:', id);
}

// Inicializar
window.addEventListener('load', async () => {
    const userNameSpan = document.getElementById('user-name');
    const userName = localStorage.getItem('user_name');
    
    if (userName) {
        userNameSpan.textContent = userName;
        await loadPrescriptions();
    } else {
        window.location.href = 'index.html';
    }

    // Agregar eventos a los campos de búsqueda
    document.getElementById('patient-name').addEventListener('input', (e) => {
        fetchSuggestions(e.target, 'users', 'patient-suggestions');
    });

    document.getElementById('medication-name').addEventListener('input', (e) => {
        fetchSuggestions(e.target, 'medicines', 'medication-suggestions');
    });
});
