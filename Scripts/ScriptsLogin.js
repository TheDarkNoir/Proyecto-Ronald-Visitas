// Script para la página de login: valida credenciales contra localStorage

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = (document.getElementById('username')?.value || '').trim().toLowerCase();
        const pass = (document.getElementById('Contrasena')?.value || '');

        if (!email || !pass) {
            alert('Ingrese correo y contraseña.');
            return;
        }

        // Credenciales de administrador
        const ADMIN_EMAIL = 'admin@gmail.com';
        const ADMIN_PASSWORD = '12345678';

        // Verificar si es admin
        if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
            localStorage.setItem('loggedUser', JSON.stringify({
                email: ADMIN_EMAIL,
                username: 'Administrador',
                isAdmin: true,
                loggedAt: new Date().toISOString()
            }));
            alert('¡Acceso Admin Concedido! Bienvenido al Panel de Control.');
            window.location.href = 'HtmlPrin/InicioAdmin.html';
            return;
        }

        // Verificar usuarios registrados
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === btoa(pass));

        if (!user) {
            alert('Credenciales incorrectas.');
            return;
        }

        // Guardar estado de sesión para cliente normal
        localStorage.setItem('loggedUser', JSON.stringify({
            email: user.email,
            username: user.username,
            isAdmin: false,
            loggedAt: new Date().toISOString()
        }));

        alert('Acceso concedido. ¡Bienvenido a Tropical Travel!');
        window.location.href = 'HtmlPrin/Inicio.html';
    });
});