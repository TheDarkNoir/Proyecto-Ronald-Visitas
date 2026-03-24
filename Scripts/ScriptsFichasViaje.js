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
                    status: normalizeStatus(trip.status)
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
            card.innerHTML = `
                <div class="trip-image" style="background-image:url('${trip.image}')">
                    <div class="status-badge ${trip.status}">${trip.status === 'confirmed' ? 'Confirmada' : trip.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}</div>
                </div>
                <div class="trip-content">
                    <span class="location-tag">${trip.location}</span>
                    <h3>${trip.title}</h3>
                    <p>Fecha de salida: <strong>${trip.date}</strong></p>
                    <p>ID de Reserva: <strong>${trip.id}</strong></p>
                    <p>Precio: <strong>${trip.price > 0 ? '$' + Number(trip.price).toLocaleString('es-CO') + ' COP' : 'Consultar precio'}</strong></p>
                    <div class="trip-footer">
                        <span>⭐ ${trip.rating || 4.5}</span>
                        <button class="btn-action view-btn">Ver Detalles</button>
                    </div>
                </div>
            `;

            card.querySelector('.view-btn').addEventListener('click', () => showDetails(trip));
            grid.appendChild(card);
        });
    }

    function showDetails(trip) {
        modalBody.innerHTML = `
            <h2>${trip.title}</h2>
            <img src="${trip.image}" alt="${trip.title}" style="width:100%;border-radius:8px;margin-bottom:10px;">
            <p><strong>Ubicación:</strong> ${trip.location}</p>
            <p><strong>Fecha de salida:</strong> ${trip.date || 'Próximamente'}</p>
            <p><strong>ID reserva:</strong> ${trip.id}</p>
            <p><strong>Precio:</strong> ${trip.price > 0 ? '$' + Number(trip.price).toLocaleString('es-CO') + ' COP' : 'Consultar precio'}</p>
            <p><strong>Descripción:</strong> ${trip.description || 'Sin descripción disponible.'}</p>
            <button id="confirmBtn" class="btn-action">Marcar como confirmado</button>
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
