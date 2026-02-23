// guarda el usuario en localStorage y redirige al login

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm') || document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = (document.getElementById('nuevo-username')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim().toLowerCase();
        const pass = (document.getElementById('nueva-password')?.value || '');
        const pass2 = (document.getElementById('nueva-password-confir')?.value || '');

        if (!username || !email || !pass || !pass2) {
            alert('Completa todos los campos.');
            return;
        }
        if (pass !== pass2) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        if (pass.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        // validar formato de email simple
        const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor ingrese un correo válido.');
            return;
        }
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.some(u => u.email === email)) {
            alert('Ya existe un usuario con ese correo.');
            return;
        }

        // Guardar usuario 
        users.push({
            username,
            email,
            password: btoa(pass), // codificación simple para no guardar texto plano
            createdAt: new Date().toISOString()
        });

        localStorage.setItem('users', JSON.stringify(users));

        // Redirigir al login 
        alert('Registro exitoso. ¡Bienvenido a Tropical Travel! Ahora inicia sesión.');
        // Redirige al login (página principal de login)
        window.location.href = 'index.html';
    });

    // compatibilidad si el botón no es type="submit"
    const altBtn = form.querySelector('button[type="subir"]');
    if (altBtn) {
        altBtn.addEventListener('click', (e) => form.requestSubmit?.() || form.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true})));
    }
});