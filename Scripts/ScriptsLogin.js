// Script para la página de login: valida credenciales contra servidor Node

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
        const pass = (document.getElementById('Contrasena')?.value || '');

        if (!email || !pass) {
            alert('Ingrese correo y contraseña.');
            return;
        }

        console.log('Intentando login con:', email);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: email, password: pass })
            });

            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response:', result);

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
                isAdmin: result.rol === 'admin',
                loggedAt: new Date().toISOString()
            }));

            console.log('Login exitoso, rol:', result.rol);
            alert('Acceso concedido. ¡Bienvenido a Tropical Travel!');
            
            // Redirigir basado en el rol
            if (result.rol === 'admin') {
                window.location.href = 'HtmlPrin/InicioAdmin.html';
            } else {
                window.location.href = 'HtmlPrin/Inicio.html';
            }
        } catch (err) {
            console.error('Error de login:', err);
            alert('Credenciales incorrectas o servidor no disponible.');
        }
    });
});
