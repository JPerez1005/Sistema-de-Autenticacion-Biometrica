

function cerrarSession() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('nombre');
    window.location.href = "../index.html";
}

export {cerrarSession};