import { auth, firestore } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import User from './user.js';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid@8.3.2'; // Importando desde JSPM

document.addEventListener('DOMContentLoaded', () => {
    const userNameSpan = document.getElementById('user-name');
    const userPhotoImg = document.getElementById('user-photo');

    userNameSpan.textContent = localStorage.getItem('user_name');
    userPhotoImg.src = localStorage.getItem('user_photo_url') || 'images/default-profile.png';

    loadPrescriptions();
});

// Función para cerrar un modal
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');

        if (modalId === 'create-prescription-form') {
            document.getElementById('patient-name').value = '';
            document.getElementById('medication-name').value = '';
            document.getElementById('dosis').value = '';
            document.getElementById('suggestions-list').innerHTML = ''; // Limpiar sugerencias
        }
    }
}

export function showCreatePrescriptionForm() {
     console.log('Mostrando formulario de creación de receta');
    document.getElementById('create-prescription-form').classList.remove('hidden');
    document.getElementById('edit-prescription-form').classList.add('hidden');

        // Limpiar los campos de entrada al abrir el formulario
    document.getElementById('patient-name').value = '';
    document.getElementById('medication-name').value = '';
    document.getElementById('dosis').value = '';
    document.getElementById('suggestions-list').innerHTML = ''; // Limpiar sugerencias
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
        closeModal('create-prescription-form'); // Cerrar el modal de creación
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
                <button onclick="downloadPrescriptionQRCode('${doc.id}')">Descargar receta</button>
                <button onclick="deletePrescription('${doc.id}')">Eliminar receta</button>
            `;
            prescriptionListDiv.appendChild(prescriptionElement);
        });
    } catch (error) {
        console.error('Error loading prescriptions:', error);
    }
}

export async function downloadPrescriptionQRCode(prescriptionId) {
    try {
        const qrCodeCanvas = document.createElement('canvas');
        QRCode.toCanvas(qrCodeCanvas, prescriptionId, { width: 300 }, (error) => {
            if (error) {
                console.error('Error generating QR code:', error);
                return;
            }
            
            const link = document.createElement('a');
            link.href = qrCodeCanvas.toDataURL('image/jpeg');
            link.download = `receta_${prescriptionId}.jpg`;
            link.click();
        });
    } catch (error) {
        console.error('Error downloading prescription QR code:', error);
    }
}


export async function showEditPrescriptionForm(prescriptionId) {
    // Obtener la receta de Firestore usando el ID
    const prescriptionRef = doc(firestore, 'prescriptions', prescriptionId);
    const prescriptionDoc = await getDoc(prescriptionRef);

    if (!prescriptionDoc.exists()) {
        console.error('Receta no encontrada');
        return;
    }

    const prescription = prescriptionDoc.data();

    document.getElementById('edit-prescription-form').classList.remove('hidden');
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
        closeModal('edit-prescription-form'); // Cerrar el modal de edición
    } catch (e) {
        console.error('Error al actualizar la receta:', e);
    }
}

export async function deletePrescription(prescriptionId) {

    const confirmation = confirm('¿Está seguro de que desea eliminar esta receta?');
    if (!confirmation) {
        return;
    }

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

    if (queryText.length < 2) { // No buscar hasta que el texto tenga al menos 3 caracteres
        return;
    }

    try {

        const currentUserId = auth.currentUser.uid;
        const patientsCollection = collection(firestore, 'patients');
        const q = query(patientsCollection, 
            where('doctorId', '==', currentUserId),
            where('patientName', '>=', queryText), 
            where('patientName', '<=', queryText + '\uf8ff'));
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

export function filterPrescriptions(queryText) {
    const prescriptionItems = document.querySelectorAll('.prescription-item');
    prescriptionItems.forEach(item => {
        const patientName = item.querySelector('p:nth-child(1)').textContent.toLowerCase();
        const medicationName = item.querySelector('p:nth-child(2)').textContent.toLowerCase();
        if (patientName.includes(queryText.toLowerCase()) || medicationName.includes(queryText.toLowerCase())) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
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