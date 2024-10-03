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

export {downloadAttendancePDF,downloadAttendanceExcel};