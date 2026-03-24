document.addEventListener('DOMContentLoaded', async () => {
	const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');

	if (!loggedUser) {
		window.location.href = '../index.html';
		return;
	}

	const userId = loggedUser.userId || loggedUser.id;

	function setInitials(name) {
		const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
		document.getElementById('userInitials').textContent = initials;
		document.getElementById('profileAvatar').textContent = initials;
	}

	function populateForm(data) {
		const nombre = data.nombre || loggedUser.username || 'Usuario';
		const email = data.email || loggedUser.email || '';
		document.getElementById('profileName').textContent = nombre;
		document.getElementById('profileEmail').textContent = email;
		setInitials(nombre);
		document.getElementById('nameInput').value = nombre;
		document.getElementById('emailInput').value = email;
		document.getElementById('phoneInput').value = data.telefono || '';
		document.getElementById('cityInput').value = data.ciudad || '';
		document.getElementById('birthdateInput').value = data.fecha_nacimiento
			? data.fecha_nacimiento.slice(0, 10)
			: '';

		const countrySelect = document.getElementById('countrySelect');
		if (data.pais) {
			for (const opt of countrySelect.options) {
				if (opt.value === data.pais) {
					opt.selected = true;
					break;
				}
			}
		}
	}

	try {
		const resp = await fetch(`/perfil/${userId}`);
		if (resp.ok) {
			populateForm(await resp.json());
		} else {
			populateForm({ nombre: loggedUser.username, email: loggedUser.email });
		}
	} catch (e) {
		console.error('Error cargando perfil:', e);
		populateForm({ nombre: loggedUser.username, email: loggedUser.email });
	}

	document.querySelectorAll('.tab-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
			document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
			btn.classList.add('active');
			document.getElementById(btn.dataset.tab).classList.add('active');
		});
	});

	document.getElementById('savePersonalBtn').addEventListener('click', async () => {
		const nombre = document.getElementById('nameInput').value.trim();
		const telefono = document.getElementById('phoneInput').value.trim();
		const pais = document.getElementById('countrySelect').value;
		const ciudad = document.getElementById('cityInput').value.trim();
		const fecha_nacimiento = document.getElementById('birthdateInput').value || null;

		if (!nombre) {
			alert('El nombre no puede estar vacio.');
			return;
		}

		try {
			const resp = await fetch(`/perfil/${userId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nombre, telefono, pais, ciudad, fecha_nacimiento })
			});

			const result = await resp.json();
			if (!resp.ok) {
				throw new Error(result.error || 'Error al guardar');
			}

			loggedUser.username = nombre;
			localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
			document.getElementById('profileName').textContent = nombre;
			setInitials(nombre);
			alert('Cambios guardados correctamente');
		} catch (err) {
			alert('Error al guardar: ' + err.message);
		}
	});

	document.querySelectorAll('.btn-save:not(#savePersonalBtn)').forEach(btn => {
		btn.addEventListener('click', () => alert('Cambios guardados correctamente'));
	});

	document.querySelector('.btn-edit-profile').addEventListener('click', () => {
		document.getElementById('nameInput').focus();
	});

	document.getElementById('logoutBtn').addEventListener('click', () => {
		if (confirm('Deseas cerrar sesion?')) {
			localStorage.removeItem('loggedUser');
			window.location.href = '../index.html';
		}
	});

	document.querySelectorAll('.tag').forEach(tag => {
		tag.addEventListener('click', () => tag.classList.toggle('active'));
	});
});
