import { loadStudentsCheckboxList } from "./localstorage-registros.js";

// Función para abrir el modal y cargar la lista de estudiantes
function openAttendanceModal() {
    loadStudentsCheckboxList(); // Lógica para cargar los estudiantes en checkbox
    document.getElementById('attendanceModal').style.display = 'block'; // Mostrar el modal
}

// Cerrar el modal de asistencia
function closeAttendanceModal() {
    document.getElementById('attendanceModal').style.display = 'none';
}

export {openAttendanceModal, closeAttendanceModal};