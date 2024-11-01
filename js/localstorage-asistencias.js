import { closeAttendanceModal} from "./funcionamiento-modal.js";

// Confirmar la asistencia de los estudiantes seleccionados (con autenticación del profesor)
async function confirmAttendance() {
    // Verificar la identidad del profesor con huella dactilar
    const isAuthenticated = await authenticateProfessor();
    if (!isAuthenticated) {
        alert('No se pudo autenticar al profesor. Inténtalo de nuevo.');
        return;
    }

    const checkboxes = document.querySelectorAll('#students-checkbox-list input[type="checkbox"]');
    const selectedStudents = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const studentId = parseInt(checkbox.value);
            console.log(studentId);
            
            const students = JSON.parse(localStorage.getItem('students')) || [];
            console.log(students);
            const student = students.find(s => parseInt(s.id) === studentId);
            console.log(student);
            
            
            if (student) {
                selectedStudents.push(student);
            }
        }
    });

    if (selectedStudents.length > 0) {
        selectedStudents.forEach(student => {
            logAttendance(student.id, student.nombre);
        });
    } else {
        alert('No seleccionaste ningún estudiante.');
    }

    closeAttendanceModal();
}

// Función para registrar asistencia en el localStorage y cargar la lista
function logAttendance(studentId, nombre) {
    const now = new Date();
    const fecha = now.toLocaleDateString();
    const hora = now.toLocaleTimeString();

    const nombreProfesor = localStorage.getItem('nombre_profesor') || 'Profesor desconocido'; // Obtener el nombre del profesor al momento de registrar

    let attendanceLog = JSON.parse(localStorage.getItem('attendanceLog')) || [];
    attendanceLog.push({ studentId, nombre, fecha, hora, profesor: nombreProfesor });
    localStorage.setItem('attendanceLog', JSON.stringify(attendanceLog));

    loadAttendance(); // Recargar la lista de asistencia para mostrar los datos actualizados
}

// Cargar el registro de asistencia en el HTML
function loadAttendance() {
    const attendanceLog = JSON.parse(localStorage.getItem('attendanceLog')) || [];
    const attendanceList = document.getElementById('attendance-list');
    attendanceList.innerHTML = '';

    attendanceLog.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.nombre}</td>      <!-- Nombre del estudiante -->
            <td>${log.fecha}</td>       <!-- Fecha de registro de asistencia -->
            <td>${log.hora}</td>        <!-- Hora de registro de asistencia -->
            <td>${log.profesor}</td>    <!-- Nombre del profesor -->
        `;
        attendanceList.appendChild(row);
    });
}

// Función para autenticar al profesor con huella dactilar
async function authenticateProfessor() {
    const publicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32),
        timeout: 60000,
        userVerification: "required"
    };

    try {
        // Obtener las credenciales (huella dactilar) del profesor
        const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
        console.log("Autenticación exitosa", assertion);

        // Verificar que el profesor esté autenticado
        const authenticatedRawId = Array.from(new Uint8Array(assertion.rawId));
        const storedProfessorId = localStorage.getItem('professorRawId');
        if (storedProfessorId && JSON.stringify(authenticatedRawId) === storedProfessorId) {
            return true; // La autenticación fue exitosa
        } else {
            alert('No se pudo verificar la identidad del profesor.');
            return false;
        }
    } catch (error) {
        console.error("Error en la autenticación:", error);
        return false;
    }
}

// Función para verificar y limpiar la asistencia cada 30 días o al final de cada mes
function checkAndClearAttendanceLog() {
    const now = new Date();
    const lastClearedDate = new Date(localStorage.getItem('lastClearedDate'));

    // Si no hay fecha registrada, se asume que es la primera vez y se guarda la fecha actual
    if (!lastClearedDate.getTime()) {
        localStorage.setItem('lastClearedDate', now.toISOString());
        alert("Este es el primer registro de asistencia. Se establecerá la fecha de limpieza para dentro de 30 días.");
        return;
    }

    // Obtener el número de días desde la última limpieza
    const daysDifference = Math.floor((now - lastClearedDate) / (1000 * 60 * 60 * 24));
    const daysUntilNextClear = 30 - daysDifference;

    // Mostrar en la consola o alerta cuántos días faltan para la próxima limpieza
    if (daysUntilNextClear > 0) {
        console.log(`Faltan ${daysUntilNextClear} días para la próxima limpieza de la lista de asistencia.`);
        alert(`Faltan ${daysUntilNextClear} días para la próxima limpieza de la lista de asistencia.`);
    }

    // Si ha pasado más de 30 días o si ha cambiado de mes, limpiar la lista de asistencia
    if (daysDifference >= 30 || now.getMonth() !== lastClearedDate.getMonth()) {
        clearAttendanceLog();
        localStorage.setItem('lastClearedDate', now.toISOString()); // Actualizar la fecha de limpieza
        console.log('Se ha limpiado la lista de asistencia.');
        alert('Se ha limpiado la lista de asistencia.');
    }
}

// Función para limpiar la lista de asistencia
function clearAttendanceLog() {
    localStorage.removeItem('attendanceLog');
    loadAttendance(); // Recargar la lista de asistencia para reflejar que está vacía
}

export {confirmAttendance, loadAttendance, checkAndClearAttendanceLog};