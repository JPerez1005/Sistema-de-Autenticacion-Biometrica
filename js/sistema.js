import { registerStudent, loadStudents} from "./localstorage-registros.js";
import { openAttendanceModal, closeAttendanceModal} from "./funcionamiento-modal.js";
import { downloadAttendancePDF, downloadAttendanceExcel} from "./configuracion-archivos.js";
import { searchAttendance, searchStudents} from "./buscador.js";
import { confirmAttendance, loadAttendance, checkAndClearAttendanceLog} from "./localstorage-asistencias.js";
import { cerrarSession } from './sesion.js';

const d=document;
d.getElementById('registrarEstudiante').addEventListener('click', registerStudent);
// Asignar evento click al botón de "Registrar Asistencia"
d.getElementById('openAttendanceButton').addEventListener('click', openAttendanceModal);
d.getElementById('closeAttendanceButton').addEventListener('click', closeAttendanceModal);
// Añadir event listeners a los botones para las descargas
d.getElementById('downloadPdfButton').addEventListener('click', downloadAttendancePDF);
d.getElementById('downloadExcelButton').addEventListener('click', downloadAttendanceExcel);
// Asignar evento keyup al input de búsqueda directamente en JavaScript
d.getElementById('attendanceSearch').addEventListener('keyup', searchAttendance);
d.getElementById('studentSearch').addEventListener('keyup', searchStudents);
//Boton para confirmar la asistencia de los estudiantes
d.getElementById('confirmarAsistencia').addEventListener('click', confirmAttendance);
// Manejador para cerrar sesión
d.getElementById('logoutButton').addEventListener('click',cerrarSession);



// Llamar a la función de verificación cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('authToken')) {
        window.location.href = "../index.html";
    } else {
        checkAndClearAttendanceLog(); // Verificar si se necesita limpiar
        loadStudents();
        loadAttendance();
    }
});

