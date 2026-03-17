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

            const isAdmin = (result.rol || '').toLowerCase() === 'admin';
            const redirectUrl = isAdmin ? 'HtmlPrin/InicioAdmin.html' : 'HtmlPrin/Inicio.html';

            localStorage.setItem('authToken', result.token);
            localStorage.setItem('loggedUser', JSON.stringify({
                id: result.userId,
                email,
                username: result.username || email,
                rol: result.rol || 'cliente',
                isAdmin,
                loggedAt: new Date().toISOString()
            }));

            alert('Acceso concedido. ¡Bienvenido a Tropical Travel!');
            window.location.href = redirectUrl;
        } catch (err) {
            console.error('Error de login:', err);
            alert('Credenciales incorrectas o servidor no disponible.');
        }
    });
});