// función para cerrar la session
function cerrarSession() {
    // de la base de datos interna quitamos esos datos
    localStorage.removeItem('authToken');
    localStorage.removeItem('nombre');
    window.location.href = "../index.html";
}

export {cerrarSession};