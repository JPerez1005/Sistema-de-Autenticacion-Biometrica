// Manejador para cerrar sesión
document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('nombre');
    window.location.href = "../index.html";
});

// Abrir el modal de asistencia
function openAttendanceModal() {
    loadStudentsCheckboxList();
    document.getElementById('attendanceModal').style.display = 'block';
}

// Cerrar el modal de asistencia
function closeAttendanceModal() {
    document.getElementById('attendanceModal').style.display = 'none';
}

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

function downloadAttendancePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const attendanceLog = JSON.parse(localStorage.getItem('attendanceLog')) || [];

    // Configurar el PDF
    doc.setFontSize(12);
    doc.text("Registro de Asistencia", 10, 10);
    let yPos = 20;

    // Escribir los datos de asistencia en el PDF
    attendanceLog.forEach((log, index) => {
        doc.text(`${index + 1}. Nombre: ${log.nombre}, Fecha: ${log.fecha}, Hora: ${log.hora}, Profesor: ${log.profesor}`, 10, yPos);
        yPos += 10;
    });

    // Guardar el PDF
    doc.save("asistencia.pdf");
}

function downloadAttendanceExcel() {
    const attendanceLog = JSON.parse(localStorage.getItem('attendanceLog')) || [];
    
    // Crear una nueva hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(attendanceLog);

    // Crear un nuevo libro de trabajo y agregar la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");

    // Exportar el archivo Excel
    XLSX.writeFile(workbook, "asistencia.xlsx");
}

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

    const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: { name: "Asistencia" },
        user: {
            id: new Uint8Array(16), // ID único del profesor (esto debe ser único en un sistema real)
            name: "profesor@ejemplo.com",
            displayName: "Profesor"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: { userVerification: "required" },
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

