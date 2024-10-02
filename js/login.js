const wrapper=document.querySelector('.wrapper'),
btnPopup=document.querySelector('.btnLogin-popup'),
iconClose=document.querySelector('.icon-close');

btnPopup.addEventListener('click', ()=> {
    wrapper.classList.add('active-popup');
});
iconClose.addEventListener('click', ()=>{
    wrapper.classList.remove('active-popup')
});

// Backend

// Lista de correos electrónicos y contraseñas válidos
const users = [
    { nombre: "Camilo", password: "password1" },
    { nombre: "Tatiana", password: "password2" },
    { nombre: "Laura", password: "password3" }
];

// Función para validar si el correo y la contraseña coinciden
function validateLogin(nombre, password) {
    return users.some(user => user.nombre === nombre && user.password === password);
}

// Manejador del evento de envío del formulario
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar que se envíe el formulario de manera tradicional

    // Obtener los valores ingresados
    const nombre = document.getElementById('nombre').value;
    const password = document.getElementById('password').value;

    // Validar el correo y la contraseña
    if (validateLogin(nombre, password)) {
        // Generar un token (simple string)
        const token = 'loggedIn';

        // Almacenar el token en localStorage (podrías usar sessionStorage también)
        localStorage.setItem('authToken', token);
        localStorage.setItem('nombre_profesor', nombre);

        // Redirigir a la página protegida
        window.location.href = "http://localhost:5500/views/presentacion.html";
    } else {
        // Si la validación falla, mostrar un mensaje de error
        alert("Correo electrónico o contraseña incorrectos.");
    }
});
