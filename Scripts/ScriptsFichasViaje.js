// Generación dinámica de tarjetas de viaje y filtros por usuario

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('tripsGrid');
    const filters = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('tripModal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');

    if (!loggedUser) {
        window.location.href = '../index.html';
        return;
    }

    const initials = (loggedUser.username || loggedUser.email || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    const userInitials = document.getElementById('userInitials');
    if (userInitials) {
        userInitials.textContent = initials;
    }

    const userId = loggedUser.userId || loggedUser.id;
    const tripsKey = `userTrips_${userId || loggedUser.email}`;
    let tripsData = [];

    const fallbackTrips = [
        {
            id: 'B001',
            title: 'Cartagena de Indias',
            location: 'Bolívar, Colombia',
            date: '2025-03-15',
            status: 'confirmed',
            price: 450000,
            image: '/Imagenes/cartagenaimg.jpg',
            rating: 4.9,
            description: 'Recorre las murallas y disfruta de playas caribeñas en esta histórica ciudad portuaria.'
        },
        {
            id: 'B002',
            title: 'Parque Tayrona',
            location: 'Magdalena, Colombia',
            date: '2025-04-01',
            status: 'pending',
            price: 320000,
            image: '/Imagenes/Tayrona.jpg',
            rating: 4.5,
            description: 'Naturaleza, senderos y playas para una experiencia tropical completa.'
        }
    ];

    function normalizeStatus(status) {
        const normalized = String(status || '').trim().toLowerCase();

        if (['confirmed', 'confirmada', 'completed', 'completado'].includes(normalized)) {
            return 'confirmed';
        }

        if (['cancelled', 'cancelada', 'canceled'].includes(normalized)) {
            return 'cancelled';
        }

        return 'pending';
    }

    function normalizePrice(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    function formatPrice(value) {
        return '$' + normalizePrice(value).toLocaleString('es-CO') + ' COP';
    }

    function saveUserTrips(list) {
        localStorage.setItem(tripsKey, JSON.stringify(list));
    }

    function getStoredTrips() {
        const stored = localStorage.getItem(tripsKey);
        if (!stored) {
            return [];
        }

        try {
            return JSON.parse(stored);
        } catch (error) {
            console.warn('No se pudo leer el cache de viajes:', error);
            return [];
        }
    }

    async function loadReservations() {
        const cachedTrips = getStoredTrips();
        if (!userId) {
            tripsData = cachedTrips.length ? cachedTrips : fallbackTrips;
            renderTrips();
            return;
        }

        try {
            const response = await fetch(`/reservas/${userId}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al cargar reservas');
            }

            tripsData = Array.isArray(result)
                ? result.map((trip) => ({
                    ...trip,
                    status: normalizeStatus(trip.status),
                    price: normalizePrice(trip.price)
                }))
                : [];

            if (!tripsData.length) {
                tripsData = cachedTrips.length ? cachedTrips : fallbackTrips;
            }

            saveUserTrips(tripsData);
            renderTrips();
        } catch (error) {
            console.error('Error cargando reservas:', error);
            tripsData = cachedTrips.length ? cachedTrips : fallbackTrips;
            renderTrips();
        }
    }

    function renderTrips(filterStatus = 'all') {
        grid.innerHTML = '';
        const filtered = tripsData.filter((trip) => filterStatus === 'all' || trip.status === filterStatus);

        if (!filtered.length) {
            grid.innerHTML = '<div class="empty-message">No tienes viajes en este estado aún.</div>';
            return;
        }

        filtered.forEach((trip) => {
            const card = document.createElement('div');
            card.className = 'trip-card';
            const normalizedPrice = normalizePrice(trip.price);
            const statusText = trip.status === 'confirmed' ? 'Confirmado' : trip.status === 'cancelled' ? 'Cancelado' : 'Pendiente';
            card.innerHTML = `
                <div class="trip-image" style="background-image:url('${trip.image}')">
                    <div class="status-badge ${trip.status}">${statusText}</div>
                </div>
                <div class="trip-content">
                    <span class="location-tag">${trip.location}</span>
                    <h3>${trip.title}</h3>
                    <div class="trip-meta-row"><span>Fecha de salida</span><strong>${trip.date || 'Por confirmar'}</strong></div>
                    <div class="trip-meta-row"><span>ID de Reserva</span><strong>${trip.id}</strong></div>
                    <div class="trip-meta-row"><span>Precio</span><strong>${formatPrice(normalizedPrice)}</strong></div>
                    <div class="trip-footer">
                        <button class="btn-secondary view-btn">Ver Detalles</button>
                        ${trip.status === 'pending' ? '<button class="btn-action pay-btn">Pagar Ahora</button>' : ''}
                    </div>
                </div>
            `;

            card.querySelector('.view-btn').addEventListener('click', () => showDetails(trip));
            const payBtn = card.querySelector('.pay-btn');
            if (payBtn) {
                payBtn.addEventListener('click', () => openPaymentMenu(trip));
            }
            grid.appendChild(card);
        });
    }

    function showDetails(trip) {
        const normalizedPrice = normalizePrice(trip.price);
        const statusText = trip.status === 'confirmed' ? 'CONFIRMADO' : trip.status === 'cancelled' ? 'CANCELADO' : 'PENDIENTE';
        modalBody.innerHTML = `
            <div class="trip-detail-hero" style="background-image:url('${trip.image}')">
                <span class="status-badge ${trip.status}">${statusText}</span>
                <h2>${trip.title}</h2>
            </div>
            <div class="trip-detail-body">
                <div class="trip-detail-stats">
                    <div class="trip-stat-box"><small>PRECIO</small><strong>${formatPrice(normalizedPrice)}</strong></div>
                    <div class="trip-stat-box"><small>RATING</small><strong>${trip.rating || 4.5}</strong></div>
                    <div class="trip-stat-box"><small>CATEGORIA</small><strong>Tropical</strong></div>
                </div>
                <h4>DESCRIPCION</h4>
                <p>${trip.description || 'Sin descripción disponible.'}</p>
                <div class="trip-detail-meta">
                    <div class="trip-meta-item"><span>Fecha de salida</span><strong>${trip.date || 'Por confirmar'}</strong></div>
                    <div class="trip-meta-item"><span>ID reserva</span><strong>${trip.id}</strong></div>
                </div>
                <div class="trip-detail-actions">
                    <button id="confirmBtn" class="btn-secondary">Marcar como confirmado</button>
                    ${trip.status === 'pending' ? '<button id="payNowBtn" class="btn-action">Pagar Ahora</button>' : ''}
                </div>
            </div>
        `;
        modal.setAttribute('aria-hidden', 'false');

        document.getElementById('confirmBtn').addEventListener('click', () => {
            tripsData = tripsData.map((currentTrip) => currentTrip.id === trip.id
                ? { ...currentTrip, status: 'confirmed' }
                : currentTrip);
            saveUserTrips(tripsData);
            renderTrips(document.querySelector('.filter-btn.active')?.dataset.status || 'all');
            modal.setAttribute('aria-hidden', 'true');
        });

        const payNowBtn = document.getElementById('payNowBtn');
        if (payNowBtn) {
            payNowBtn.addEventListener('click', () => openPaymentMenu(trip));
        }
    }

    function openPaymentMenu(trip) {
        modalBody.innerHTML = `
            <div class="payment-card">
                <h2>Finalizar Reserva</h2>
                <div class="payment-field">
                    <small>DESTINO</small>
                    <strong>${trip.title}</strong>
                </div>
                <div class="payment-field">
                    <small>MONTO TOTAL</small>
                    <strong>${formatPrice(trip.price)}</strong>
                </div>
                <button id="confirmPayBtn" class="btn-action payment-main-btn">Confirmar Pago</button>
                <button id="cancelPayBtn" class="btn-secondary payment-cancel-btn">Cancelar</button>
            </div>
        `;
        modal.setAttribute('aria-hidden', 'false');

        document.getElementById('confirmPayBtn').addEventListener('click', () => {
            tripsData = tripsData.map((currentTrip) => currentTrip.id === trip.id
                ? { ...currentTrip, status: 'confirmed' }
                : currentTrip);
            saveUserTrips(tripsData);
            renderTrips(document.querySelector('.filter-btn.active')?.dataset.status || 'all');
            modal.setAttribute('aria-hidden', 'true');
            alert('Pago confirmado correctamente.');
        });

        document.getElementById('cancelPayBtn').addEventListener('click', () => {
            showDetails(trip);
        });
    }

    closeModal.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    filters.forEach((btn) => {
        btn.addEventListener('click', () => {
            filters.forEach((button) => button.classList.remove('active'));
            btn.classList.add('active');
            renderTrips(btn.dataset.status);
        });
    });

    loadReservations();
});
