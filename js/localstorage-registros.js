import { openAttendanceModal } from "./funcionamiento-modal.js";

// Cargar la lista de estudiantes con checkboxes en el modal
function loadStudentsCheckboxList() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const studentsCheckboxList = document.getElementById('students-checkbox-list');
    studentsCheckboxList.innerHTML = '';

    students.forEach(student => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.innerHTML = `
            <input type="checkbox" id="student-${student.id}" value="${student.id}">
            <label for="student-${student.id}">${student.nombre}</label>
        `;
        studentsCheckboxList.appendChild(checkboxDiv);
    });
}

// Cargar la lista de estudiantes registrados en el HTML
function loadStudents() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const studentsList = document.getElementById('students-list');
    studentsList.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.nombre}</td>
            <td>${student.id}</td>
            <td>${student.fecha}</td>
            <td>${student.hora}</td>
        `;
        studentsList.appendChild(row);
    });
}

// Registrar la huella del profesor (esto se hace una sola vez)
async function registerStudent() {
    // Pedir el nombre del estudiante
    const studentName = prompt("Ingrese el nombre del estudiante:");
    if (!studentName) {
        alert("Debe ingresar un nombre para registrar al estudiante.");
        return;
    }

    // Generar un ID único para el estudiante (puedes usar Date.now() para simplicidad)
    const studentId = Date.now().toString();

    // Obtener la fecha y hora actual
    const now = new Date();
    const registrationDate = now.toLocaleDateString(); // Obtener la fecha en formato local
    const registrationTime = now.toLocaleTimeString(); // Obtener la hora en formato local

    // Gracias a esto se registra una huella digital
    const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: { name: "Asistencia" },
        user: {
            id: new Uint8Array(16), // ID único del profesor (esto debe ser único en un sistema real)
            name: "profesor@ejemplo.com",
            displayName: "Profesor"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: { userVerification: "preferred" },
        timeout: 60000
    };

    try {
        const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
        console.log("Huella registrada exitosamente", credential);

        // Obtener los estudiantes almacenados en el localStorage
        const students = JSON.parse(localStorage.getItem('students')) || [];

        // Agregar el nuevo estudiante con su nombre, ID, fecha y hora de registro
        students.push({
            id: studentId, // ID único del estudiante
            nombre: studentName, // Nombre del estudiante
            fecha: registrationDate, // Fecha de registro
            hora: registrationTime // Hora de registro
        });

        // Guardar la lista de estudiantes actualizada en el localStorage
        localStorage.setItem('students', JSON.stringify(students));

        alert(`Huella registrada correctamente para el estudiante ${studentName}.`);

        // Guardar la ID del profesor en localStorage para futuras autenticaciones
        const rawId = Array.from(new Uint8Array(credential.rawId));
        localStorage.setItem('professorRawId', JSON.stringify(rawId));
        alert("Huella registrada correctamente.");

        openAttendanceModal();
        loadStudents();
    } catch (error) {
        console.error("Error en el registro de huella:", error);
        alert("Hubo un problema al registrar la huella.");
    }
}

export {loadStudentsCheckboxList, registerStudent , loadStudents};