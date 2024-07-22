import { auth, firestore } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import User from './user.js';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid@8.3.2'; // Importando desde JSPM

document.addEventListener('DOMContentLoaded', () => {
    const userNameSpan = document.getElementById('user-name');
    userNameSpan.textContent = localStorage.getItem('user_name');

    loadPrescriptions();
});

export function showCreatePrescriptionForm() {
    document.getElementById('create-prescription-form').style.display = 'block';
    document.getElementById('edit-prescription-form').style.display = 'none';
}

export async function createPrescription() {
    const patientName = document.getElementById('patient-name').value;
    const medicationName = document.getElementById('medication-name').value;
    const dosis = document.getElementById('dosis').value;
    const doctorId = localStorage.getItem('user_id');
    const doctorName = localStorage.getItem('user_name');
    const date = new Date().toISOString();

    // Buscar el ID del paciente en Firestore
    const patientsCollection = collection(firestore, 'users');
    const q = query(patientsCollection, where('name', '==', patientName));
    const patientSnapshot = await getDocs(q);

    if (patientSnapshot.empty) {
        alert('Paciente no encontrado');
        return;
    }

    const patientId = patientSnapshot.docs[0].id;

    // Crear receta
    const prescriptionRef = collection(firestore, 'prescriptions');
    const newPrescription = {
        patientId,
        patientName,
        patientDni: '',
        doctorId,
        doctorName,
        medicationName,
        dosis,
        status: true,
        date
    };

    try {
        await addDoc(prescriptionRef, newPrescription);
        alert('Receta creada exitosamente');
        loadPrescriptions();
    } catch (e) {
        console.error('Error al crear la receta:', e);
    }
}

export async function loadPrescriptions() {
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
                <button onclick="showEditPrescriptionForm('${doc.id}')">Editar receta</button>
                <button onclick="deletePrescription('${doc.id}')">Eliminar receta</button>
            `;
            prescriptionListDiv.appendChild(prescriptionElement);
        });
    } catch (error) {
        console.error('Error loading prescriptions:', error);
    }
}

export async function showEditPrescriptionForm(prescriptionId) {
    // Obtener la receta de Firestore usando el ID
    const prescriptionRef = doc(firestore, 'prescriptions', prescriptionId);
    const prescriptionDoc = await getDocs(prescriptionRef);

    if (!prescriptionDoc.exists()) {
        console.error('Receta no encontrada');
        return;
    }

    const prescription = prescriptionDoc.data();

    document.getElementById('create-prescription-form').style.display = 'none';
    document.getElementById('edit-prescription-form').style.display = 'block';

    document.getElementById('edit-prescription-id').value = prescriptionId;
    document.getElementById('edit-patient-name').value = prescription.patientName;
    document.getElementById('edit-medication-name').value = prescription.medicationName;
    document.getElementById('edit-dosis').value = prescription.dosis;
}

export async function saveEditedPrescription() {
    const prescriptionId = document.getElementById('edit-prescription-id').value;
    const patientName = document.getElementById('edit-patient-name').value;
    const medicationName = document.getElementById('edit-medication-name').value;
    const dosis = document.getElementById('edit-dosis').value;

    const prescriptionRef = doc(firestore, 'prescriptions', prescriptionId);

    try {
        await updateDoc(prescriptionRef, {
            patientName,
            medicationName,
            dosis
        });
        alert('Receta actualizada exitosamente');
        loadPrescriptions();
        document.getElementById('edit-prescription-form').style.display = 'none';
    } catch (e) {
        console.error('Error al actualizar la receta:', e);
    }
}

export async function deletePrescription(prescriptionId) {
    const prescriptionRef = doc(firestore, 'prescriptions', prescriptionId);

    try {
        await deleteDoc(prescriptionRef);
        alert('Receta eliminada exitosamente');
        loadPrescriptions();
    } catch (e) {
        console.error('Error al eliminar la receta:', e);
    }
}

export async function searchPatients(queryText) {
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = ''; // Limpiar la lista de sugerencias

    if (queryText.length < 3) { // No buscar hasta que el texto tenga al menos 3 caracteres
        return;
    }

    try {
        const patientsCollection = collection(firestore, 'prescriptions');
        const q = query(patientsCollection, where('patientName', '>=', queryText), where('patientName', '<=', queryText + '\uf8ff'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return;
        }

        querySnapshot.forEach((doc) => {
            const patientName = doc.data().patientName;
            const li = document.createElement('li');
            li.textContent = patientName;
            li.addEventListener('click', () => {
                document.getElementById('patient-name').value = patientName;
                suggestionsList.innerHTML = ''; // Limpiar sugerencias después de seleccionar
            });
            suggestionsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error searching for patients:', error);
    }
}

export function signOutUser() {
    auth.signOut().then(() => {
        localStorage.removeItem('user_name');
        localStorage.removeItem('id_token');
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error during sign-out:', error);
    });
}