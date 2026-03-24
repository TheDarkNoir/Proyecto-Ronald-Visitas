// guarda el usuario en localStorage y redirige al login

// guarda el usuario en la tabla Usuario de Supabase a través del servidor Node

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm') || document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = (document.getElementById('nuevo-username')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim().toLowerCase();
        const pass = (document.getElementById('nueva-password')?.value || '');
        const pass2 = (document.getElementById('nueva-password-confir')?.value || '');
        const telefono = (document.getElementById('reg-telefono')?.value || '').trim();
        const pais = (document.getElementById('reg-pais')?.value || 'Colombia').trim();
        const ciudad = (document.getElementById('reg-ciudad')?.value || '').trim();
        const fechaNacimiento = (document.getElementById('reg-fechanac')?.value || '');

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

        try {
            // enviar datos al servidor para registrar en supabase
            const response = await fetch('/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: username,
                    email,
                    password: pass,
                    telefono,
                    pais,
                    ciudad,
                    fecha_nacimiento: fechaNacimiento || null
                })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Error al registrar usuario');
            }

            alert('Registro exitoso. Ahora inicia sesión.');
            window.location.href = 'index.html';
        } catch (err) {
            console.error('Registro fallido:', err);
            alert(err.message || 'No se pudo completar el registro.');
        }
    });

    // compatibilidad si el botón no es type="submit"
    const altBtn = form.querySelector('button[type="subir"]');
    if (altBtn) {
        altBtn.addEventListener('click', (e) => form.requestSubmit?.() || form.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true})));
    }
});