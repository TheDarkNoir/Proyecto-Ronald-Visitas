// Script para la página de login: valida credenciales contra el servidor Node

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Submit del formulario capturado');

        const email = (document.getElementById('username')?.value || '').trim().toLowerCase();
        const pass = document.getElementById('Contrasena')?.value || '';

        if (!email || !pass) {
            alert('Ingrese correo y contraseña.');
            return;
        }

        console.log('Intentando login con:', email);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });

            const result = await response.json();
            console.log('Response:', result);

            if (!response.ok) {
                throw new Error(result.error || 'Login fallido');
            }

            const normalizedRole = String(result.rol || 'cliente').toLowerCase();
            const isAdmin = normalizedRole === 'admin';
            const redirectUrl = isAdmin ? 'HtmlPrin/InicioAdmin.html' : 'HtmlPrin/Inicio.html';
            const userId = result.userId || result.id || null;

            localStorage.setItem('authToken', result.token || '');
            localStorage.setItem('loggedUser', JSON.stringify({
                id: userId,
                userId,
                email: result.email || email,
                username: result.username || email,
                rol: normalizedRole,
                isAdmin,
                loggedAt: new Date().toISOString()
            }));

            window.location.href = redirectUrl;
        } catch (err) {
            console.error('Error de login:', err);
            alert(err.message || 'Credenciales incorrectas o servidor no disponible.');
        }
    });
});
