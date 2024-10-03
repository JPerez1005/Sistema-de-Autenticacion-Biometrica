// Función de búsqueda en la tabla de asistencia
function searchAttendance() {
    const input = document.getElementById('attendanceSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#attendance-list tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const name = cells[0].textContent.toLowerCase();
        const date = cells[1].textContent.toLowerCase();
        const professor = cells[3].textContent.toLowerCase();

        if (name.includes(input) || date.includes(input) || professor.includes(input)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}


// Función de búsqueda en la tabla de estudiantes
function searchStudents() {
    const input = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#students-list tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const name = cells[0].textContent.toLowerCase();
        if (name.includes(input)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

export {searchAttendance, searchStudents};
