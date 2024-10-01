//Esperamos a que todo el html cargue
document.addEventListener('DOMContentLoaded', loadData);

// cuando todo el html cargue colocamos las funciones de cargar
//datos del localstorage
function loadData() {
    loadStudents();
    loadAttendance();
}

// Función para registrar una nueva credencial
async function register() {
    const nombreUsuario = prompt("Por favor, ingresa tu nombre:");

    if (!nombreUsuario) {
        alert("Debes ingresar un nombre para registrarte.");
        return;
    }

    const publicKey = {
        challenge: new Uint8Array(32), // Desafío generado por el servidor
        rp: { name: "Sistema de Asistencia" },
        user: {
            id: new Uint8Array(16), // ID único del usuario
            name: nombreUsuario+"@example.com",
            displayName: nombreUsuario
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        timeout: 60000,
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "preferred"
        }
    };

    try {
        const credential = await navigator.credentials.create({ publicKey });
        console.log("Registro exitoso", credential);
        alert("Registro exitoso");

        const now = new Date();
        const fecha = now.toLocaleDateString();
        const hora = now.toLocaleTimeString();

        //Creamos el arreglo de localstorage o la base de datos
        let students = JSON.parse(localStorage.getItem('students')) || [];

        // Generar un ID único para el estudiante
        const studentId = students.length + 1;

        //mandamos los datos al arreglo o lista
        students.push({
            studentId,  // ID único de estudiante
            nombre: nombreUsuario,
            rawId: Array.from(new Uint8Array(credential.rawId)), // Guardar el rawId
            fechaRegistro: fecha,
            horaRegistro: hora
        });

        // mandamos el arreglo al localstorage o la bd
        localStorage.setItem('students', JSON.stringify(students));
        loadStudents();
    } catch (error) {
        console.error("Error en el registro:", error);
    }
}

// Función para autenticar usando una credencial existente
async function authenticate() {
    // traemos todos los datos del localstorage
    const students = JSON.parse(localStorage.getItem('students'));

    // si no hay datos le avisamos al docente
    if (!students || students.length === 0) {
        console.log("No se encontraron estudiantes registrados. Por favor, regístrate primero.");
        return;
    }

    //son las credenciales de la huella digital
    const publicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32), // Desafío generado por el servidor
        timeout: 60000,
        userVerification: "required"
    };

    try {
        //obtenemos las credenciales de la huella
        const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
        console.log("Autenticación exitosa", assertion);

        // Obtener el rawId de la autenticación actual
        const currentRawId = Array.from(new Uint8Array(assertion.rawId));

        // Buscar al estudiante que tenga el mismo rawId
        const authenticatedStudent = students.find(student => 
            JSON.stringify(student.rawId) === JSON.stringify(currentRawId)
        );

        //Autenticacion del profesor
        if (authenticatedStudent) {
            const now = new Date();
            const fecha = now.toLocaleDateString();
            const hora = now.toLocaleTimeString();

            console.log(`Autenticación exitosa para ${authenticatedStudent.nombre}`);
            alert(`Asistencia registrada\n\nNombre: ${authenticatedStudent.nombre}\nFecha: ${fecha}\nHora: ${hora}`);

            // Registrar la asistencia
            logAttendance(authenticatedStudent.studentId, authenticatedStudent.nombre);
        } else {
            alert("No se encontró coincidencia para esta huella. Por favor, regístrate primero.");
        }
    } catch (error) {
        console.error("Error en la autenticación:", error);
    }
}

// Registrar la asistencia de un estudiante en el html
function logAttendance(studentId, nombre) {
    const now = new Date();
    const fecha = now.toLocaleDateString();
    const hora = now.toLocaleTimeString();

    let attendanceLog = JSON.parse(localStorage.getItem('attendanceLog')) || [];
    attendanceLog.push({ studentId, nombre, fecha, hora });
    localStorage.setItem('attendanceLog', JSON.stringify(attendanceLog));

    loadAttendance();
}

// Cargar la lista de estudiantes registrados en el html
function loadStudents() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const studentsList = document.getElementById('students-list');
    studentsList.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.nombre}</td>
            <td>${student.studentId}</td>
            <td>${student.fechaRegistro}</td>
            <td>${student.horaRegistro}</td>
        `;
        studentsList.appendChild(row);
    });
}

// Cargar el registro de asistencia en el html
function loadAttendance() {
    const attendanceLog = JSON.parse(localStorage.getItem('attendanceLog')) || [];
    const attendanceList = document.getElementById('attendance-list');
    attendanceList.innerHTML = '';

    attendanceLog.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.nombre}</td>
            <td>${log.fecha}</td>
            <td>${log.hora}</td>
        `;
        attendanceList.appendChild(row);
    });
}
