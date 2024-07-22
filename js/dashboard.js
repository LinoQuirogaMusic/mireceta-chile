import { firestore } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const userNameSpan = document.getElementById('user-name');
    userNameSpan.textContent = localStorage.getItem('user_name');

    loadPrescriptions();
});

function showCreatePrescriptionForm() {
    document.getElementById('create-prescription-form').style.display = 'block';
}

async function createPrescription() {
    const patientName = document.getElementById('patient-name').value;
    const medicationName = document.getElementById('medication-name').value;
    const dosis = document.getElementById('dosis').value;
    const doctorId = localStorage.getItem('user_id');
    const doctorName = localStorage.getItem('user_name');
    const date = new Date().toISOString();

    // Buscar el ID del paciente en Firestore
    const patientsCollection = collection(firestore, 'patients');
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

async function loadPrescriptions() {
    const prescriptionList = document.getElementById('prescription-list');
    prescriptionList.innerHTML = '';

    const prescriptionsCollection = collection(firestore, 'prescriptions');
    const q = query(prescriptionsCollection);
    const prescriptionSnapshot = await getDocs(q);

    prescriptionSnapshot.forEach(doc => {
        const prescription = doc.data();
        const div = document.createElement('div');
        div.textContent = `${prescription.medicationName} - ${prescription.dosis}`;
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.onclick = () => editPrescription(doc.id);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => deletePrescription(doc.id);
        div.appendChild(editButton);
        div.appendChild(deleteButton);
        prescriptionList.appendChild(div);
    });
}

async function editPrescription(prescriptionId) {
    // Implementar lógica para editar la receta
}

async function deletePrescription(prescriptionId) {
    // Implementar lógica para eliminar la receta
}
