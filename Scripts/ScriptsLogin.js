// Script para la página de login: valida credenciales contra servidor Node

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = (document.getElementById('username')?.value || '').trim().toLowerCase();
        const pass = (document.getElementById('Contrasena')?.value || '');

        if (!email || !pass) {
            alert('Ingrese correo y contraseña.');
            return;
        }

        // credenciales admin hardcodeadas
        const ADMIN_EMAIL = 'admin@gmail.com';
        const ADMIN_PASSWORD = '12345678';
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

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: email, password: pass })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Login fallido');
            }

            // almacenar token y datos básicos
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('loggedUser', JSON.stringify({
                id: result.userId,
                email,
                username: result.username || email,
                rol: result.rol || 'cliente',
                isAdmin: false,
                loggedAt: new Date().toISOString()
            }));

            alert('Acceso concedido. ¡Bienvenido a Tropical Travel!');
            window.location.href = 'HtmlPrin/Inicio.html';
        } catch (err) {
            console.error('Error de login:', err);
            alert('Credenciales incorrectas o servidor no disponible.');
        }
    });
});