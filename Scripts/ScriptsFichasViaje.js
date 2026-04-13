document.addEventListener('DOMContentLoaded', () => {

    const grid = document.getElementById('tripsGrid');
    const filters = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('tripModal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    const API_URL = window.location.origin;

    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');

    if (!loggedUser) {
        window.location.href = '../index.html';
        return;
    }

    function getAuthHeaders() {
        const token = localStorage.getItem('authToken') || '';
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    function handleAuthError(response) {
        if (response.status === 401) {
            localStorage.removeItem('loggedUser');
            localStorage.removeItem('authToken');
            window.location.href = '../index.html';
            return true;
        }
        return false;
    }

    // Iniciales usuario
    const initials = (loggedUser.username || loggedUser.email || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const userInitials = document.getElementById('userInitials');
    if (userInitials) userInitials.textContent = initials;

    const userId = loggedUser.userId || loggedUser.id;

    let tripsData = [];

    //  NORMALIZAR ESTADOs
    function normalizeStatus(status) {
        const s = String(status || '').toLowerCase();

        if (['confirmado', 'confirmed'].includes(s)) return 'confirmed';
        if (['cancelado', 'cancelled'].includes(s)) return 'cancelled';

        return 'pending';
    }

    function formatPrice(value) {
        return '$' + Number(value || 0).toLocaleString('es-CO') + ' COP';
    }

    // CARGAR RESERVAS
    async function loadReservations() {
        try {
            const response = await fetch(`${API_URL}/reservas/${userId}`, {
                headers: getAuthHeaders()
            });

            if (handleAuthError(response)) return;
            if (!response.ok) throw new Error('Error al obtener reservas');

            const data = await response.json();

            tripsData = Array.isArray(data)
                ? data.map(t => ({
                    ...t,
                    id: t.id || t._id,
                    status: normalizeStatus(t.status)
                }))
                : [];

            renderTrips();

        } catch (error) {
            console.error('Error:', error);

            grid.innerHTML = `
                <div class="empty-message">
                    Error al cargar tus viajes 😥 <br>
                    Verifica el servidor
                </div>
            `;
        }
    }

    // RENDER
    function renderTrips(filter = 'all') {

        grid.innerHTML = '';

        const filtered = tripsData.filter(t =>
            filter === 'all' || t.status === filter
        );

        if (!filtered.length) {
            grid.innerHTML = `<div class="empty-message">No tienes viajes en este estado</div>`;
            return;
        }

        filtered.forEach(trip => {

            const card = document.createElement('div');
            card.className = 'trip-card';

            const statusText =
                trip.status === 'confirmed' ? 'Confirmado' :
                trip.status === 'cancelled' ? 'Cancelado' :
                'Pendiente';

            card.innerHTML = `
                <div class="trip-image" style="background-image:url('${trip.image || '../Imagenes/default.jpg'}')">
                    <div class="status-badge ${trip.status}">
                        ${statusText}
                    </div>
                </div>

                <div class="trip-content">
                    <h3>${trip.title || 'Viaje'}</h3>
                    <p>${trip.location || ''}</p>
                    <p>${trip.date || 'Sin fecha'}</p>
                    <p>${formatPrice(trip.price)}</p>

                    <div class="trip-footer">
                        <button class="btn-action view-btn">Ver</button>

                        ${trip.status === 'pending'
                            ? '<button class="btn-action pay-btn">Pagar</button>'
                            : ''}

                        ${trip.status !== 'cancelled'
                            ? '<button class="btn-secondary cancel-btn">Cancelar</button>'
                            : ''}
                    </div>
                </div>
            `;

            // VER
            card.querySelector('.view-btn')
                .addEventListener('click', () => showDetails(trip));

            // PAGAR
            const payBtn = card.querySelector('.pay-btn');
            if (payBtn) {
                payBtn.addEventListener('click', () => {
                    if (confirm('¿Confirmar pago de esta reserva?')) {
                        updateStatus(trip.id, 'confirmed');
                    }
                });
            }

            // CANCELAR
            const cancelBtn = card.querySelector('.cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (confirm('¿Seguro que deseas cancelar esta reserva?')) {
                        updateStatus(trip.id, 'cancelled');
                    }
                });
            }

            grid.appendChild(card);
        });
    }

    // MODAL
    function showDetails(trip) {
        modalBody.innerHTML = `
            <div class="trip-detail-body">
                <h2>${trip.title || 'Viaje'}</h2>
                <p>${trip.description || 'Sin descripción'}</p>
                <p><strong>Fecha:</strong> ${trip.date || 'Sin fecha'}</p>
                <p><strong>Precio:</strong> ${formatPrice(trip.price)}</p>
                <p><strong>Estado:</strong> ${trip.status}</p>
            </div>
        `;

        modal.setAttribute('aria-hidden', 'false');
    }

    // ACTUALIZAR ESTADO
    async function updateStatus(id, status) {
        try {

            const response = await fetch(`${API_URL}/reservas/${id}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    userId,
                    status
                })
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error');
            }

            loadReservations();

        } catch (error) {
            console.error(error);
            alert('No se pudo actualizar la reserva');
        }
    }

    // CERRAR MODAL
    closeModal.addEventListener('click', () => {
        modal.setAttribute('aria-hidden', 'true');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    // FILTROS
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTrips(btn.dataset.status);
        });
    });

    // INIT
    loadReservations();
});